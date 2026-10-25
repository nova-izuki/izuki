import { useEffect, useRef, useState } from "react";
import { canListen, streamMic } from "../lib/speechInput";
import { api } from "../lib/ipc";
import { readSpeakers, prepareSpeakers, speakerEmbedding, speakerEnrollmentActive, SPEAKER_CHANGED } from "../lib/speakers";
import { matchingSpeaker } from "../lib/speakerMath";

/**
 * The dedicated wake-word detector (lib/wakeEngine.ts, in wakeWorker.ts):
 * listens for the wake words installed (a "Hey Nova" or "Hey Izuki" model —
 * none is bundled), the way voice assistants do — a tiny model on the raw
 * sound, not speech-to-text on everything. `onWake(name)` fires on a
 * detection.
 *
 * The detector is loaded once (while hands-free is on and a wake word is
 * installed) and kept: `listen` only pauses and resumes feeding it the mic.
 * It used to be torn down and rebuilt around every conversation — a second
 * of heavy CPU (and a reloaded model) each time a session ended.
 */
/** "Wake-up strictness" → how sure the detector must be. */
export const WAKE_THRESHOLD = { relaxed: 0.32, normal: 0.4, strict: 0.55 } as const;

export function useWakeEngine(
  listen: boolean,
  custom: string[],
  onWake: (name: string) => void,
  loaded = true,
  threshold: number = WAKE_THRESHOLD.normal
) {
  const [words, setWords] = useState<string[]>([]);
  const onWakeRef = useRef(onWake);
  onWakeRef.current = onWake;
  const worker = useRef<Worker | null>(null);
  const thresholdRef = useRef(threshold);
  thresholdRef.current = threshold;
  const [ready, setReady] = useState(false);
  const recentVoice = useRef<Float32Array[]>([]);
  const checkingVoice = useRef(false);
  const gateGeneration = useRef(0);
  const listeningRef = useRef(listen);
  listeningRef.current = listen;
  const [voiceVersion, setVoiceVersion] = useState(0);
  /** Is the enrolled-voice filter on? Read once per change, not per frame. */
  const voiceFilterOn = useRef(false);
  useEffect(() => {
    const changed = () => { gateGeneration.current++; setVoiceVersion((v) => v + 1); };
    window.addEventListener(SPEAKER_CHANGED, changed);
    return () => { gateGeneration.current++; window.removeEventListener(SPEAKER_CHANGED, changed); };
  }, []);
  useEffect(() => {
    // A damaged profile file counts as on: the gate then refuses every wake
    // rather than letting anyone through.
    voiceFilterOn.current = (() => {
      try {
        return readSpeakers().enabled;
      } catch {
        return true;
      }
    })();
  }, [voiceVersion, loaded]);
  useEffect(() => {
    if (!loaded) return;
    try {
      if (readSpeakers().enabled) void prepareSpeakers().catch(() => {
        void api.log("wake voice filter: model unavailable; hold the talk key to speak");
      });
    } catch { /* Invalid profiles fail closed on detection, never bypassed. */ }
  }, [loaded, voiceVersion]);
  const acceptWake = async (name: string) => {
    if (!listeningRef.current || checkingVoice.current || speakerEnrollmentActive()) return;
    const generation = gateGeneration.current;
    checkingVoice.current = true;
    try {
      const preferences = readSpeakers();
      if (preferences.enabled) {
        if (!preferences.profiles.length) return;
        const chunks = recentVoice.current;
        const audio = new Float32Array(chunks.reduce((sum, c) => sum + c.length, 0));
        let at = 0;
        for (const chunk of chunks) { audio.set(chunk, at); at += chunk.length; }
        const vector = await speakerEmbedding(audio);
        if (!matchingSpeaker(vector, preferences.profiles)) return;
      }
      if (generation === gateGeneration.current && listeningRef.current && !speakerEnrollmentActive()) onWakeRef.current(name);
    } catch {
      void api.log("wake voice filter: could not verify voice; use the talk key or check voice profiles");
    } finally { checkingVoice.current = false; }
  };
  const acceptWakeRef = useRef(acceptWake);
  acceptWakeRef.current = acceptWake;
  const key = custom.join("|");
  const log = (m: string) => void api.log(`wake engine: ${m}`).catch(() => undefined);

  // ---- the detector: loaded while hands-free is on and a wake word exists ----
  useEffect(() => {
    if (!loaded || !custom.length || !canListen()) {
      setWords([]);
      return;
    }
    const w = new Worker(new URL("../lib/wakeWorker.ts", import.meta.url), { type: "module" });
    worker.current = w;
    w.onmessage = (e: MessageEvent<{ kind: string; name?: string; score?: number; words?: string[]; msPerFrame?: number; rested?: number; error?: string }>) => {
      const m = e.data;
      if (m.kind === "ready") {
        setWords(m.words ?? []);
        setReady(true);
        log(`loaded: ${(m.words ?? []).join(", ")}`);
      } else if (m.kind === "wake" && m.name) {
        log(`heard "${m.name}" (score ${m.score?.toFixed(2)})`);
        void acceptWakeRef.current(m.name);
      } else if (m.kind === "near") {
        log(`near miss: "${m.name}" scored ${m.score?.toFixed(2)} (needs ${thresholdRef.current.toFixed(2)})`);
      } else if (m.kind === "load") {
        log(`${m.msPerFrame?.toFixed(1)} ms per 80 ms of sound${m.rested ? ` (rested through ${m.rested} quiet moments)` : ""}`);
      } else if (m.kind === "error") {
        log(`error — ${m.error}`);
      }
    };
    w.postMessage({ kind: "start", custom });
    w.postMessage({ kind: "threshold", value: thresholdRef.current });
    return () => {
      w.terminate();
      worker.current = null;
      setReady(false);
      setWords([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, key]);

  // The strictness can change while it runs.
  useEffect(() => {
    worker.current?.postMessage({ kind: "threshold", value: threshold });
  }, [threshold, ready]);

  // ---- feeding it the mic: only while it should be listening ----------------
  useEffect(() => {
    const w = worker.current;
    if (!listen || !ready || !w) return;
    let alive = true;
    let stopMic: () => void = () => {};
    log("listening");

    // Rest in silence: in a quiet room there's nothing to spot, so don't
    // run the models at all. The last ~1.3 s is kept, and sent the moment
    // there's sound again, so the start of "Hey…" is never lost.
    const PREROLL = 16000 * 1.3;
    let recent: Float32Array[] = [];
    let recentLen = 0;
    let quietFor = 0;
    let resting = false;
    const onAudio = (samples: Float32Array) => {
      // Copy before the wake worker takes ownership of the audio buffer.
      // Only the enrolled-voice filter needs this, and it is off by default:
      // copying ~4 s of audio on every frame for nothing is real work in the
      // always-listening path.
      if (!voiceFilterOn.current) {
        recentVoice.current.length = 0;
        return;
      }
      recentVoice.current.push(samples.slice());
      let length = recentVoice.current.reduce((sum, c) => sum + c.length, 0);
      while (recentVoice.current.length > 1 && length > 64_000) length -= recentVoice.current.shift()!.length;
      let mean = 0;
      for (let i = 0; i < samples.length; i++) mean += samples[i];
      mean /= samples.length;
      let sum = 0;
      for (let i = 0; i < samples.length; i++) sum += (samples[i] - mean) ** 2;
      const loud = Math.sqrt(sum / samples.length) > 0.008;
      quietFor = loud ? 0 : quietFor + samples.length;
      if (resting) {
        recent.push(samples);
        recentLen += samples.length;
        while (recentLen - recent[0].length > PREROLL) recentLen -= recent.shift()!.length;
        if (!loud) return;
        // Sound again: catch up on the pre-roll, then carry on live.
        resting = false;
        w.postMessage({ kind: "reset" });
        for (const r of recent) w.postMessage({ kind: "audio", samples: r }, [r.buffer]);
        recent = [];
        recentLen = 0;
        return;
      }
      w.postMessage({ kind: "audio", samples }, [samples.buffer]);
      if (quietFor > 16000 * 2) resting = true; // 2 s of quiet
    };

    // Keep the mic feed running; if it's taken away (Izuki talking on a
    // Bluetooth headset, the mic switched) start again when it's free.
    const feed = () => {
      if (!alive) return;
      stopMic = streamMic(onAudio, () => {
        w.postMessage({ kind: "reset" });
        if (alive) setTimeout(feed, 300);
      });
    };
    // Fresh start: nothing from before this listen can count.
    w.postMessage({ kind: "reset" });
    feed();
    return () => {
      alive = false;
      gateGeneration.current++;
      recentVoice.current = [];
      stopMic();
      w.postMessage({ kind: "reset" });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listen, ready]);

  return words;
}
