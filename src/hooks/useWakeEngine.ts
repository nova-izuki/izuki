import { useEffect, useRef, useState } from "react";
import { canListen, streamMic } from "../lib/speechInput";
import { api } from "../lib/ipc";

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
    w.onmessage = (e: MessageEvent<{ kind: string; name?: string; score?: number; words?: string[]; msPerFrame?: number; error?: string }>) => {
      const m = e.data;
      if (m.kind === "ready") {
        setWords(m.words ?? []);
        setReady(true);
        log(`loaded: ${(m.words ?? []).join(", ")}`);
      } else if (m.kind === "wake" && m.name) {
        log(`heard "${m.name}" (score ${m.score?.toFixed(2)})`);
        onWakeRef.current(m.name);
      } else if (m.kind === "near") {
        log(`near miss: "${m.name}" scored ${m.score?.toFixed(2)} (needs ${thresholdRef.current.toFixed(2)})`);
      } else if (m.kind === "load") {
        log(`${m.msPerFrame?.toFixed(1)} ms per 80 ms of sound`);
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
      stopMic();
      w.postMessage({ kind: "reset" });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listen, ready]);

  return words;
}
