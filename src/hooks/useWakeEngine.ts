import { useEffect, useRef, useState } from "react";
import { canListen, streamMic } from "../lib/speechInput";
import { api } from "../lib/ipc";

/**
 * The dedicated wake-word detector (lib/wakeEngine.ts, in wakeWorker.ts):
 * listens for the wake words installed (a "Hey Nova" or "Hey Izuki"
 * model — none is bundled), the way Siri and Alexa do — a tiny model on
 * the raw sound, not speech-to-text on everything. `onWake(name)` fires on a
 * detection. `custom` = installed model file names; changing it restarts.
 */
export function useWakeEngine(enabled: boolean, custom: string[], onWake: (name: string) => void) {
  const [words, setWords] = useState<string[]>([]);
  const onWakeRef = useRef(onWake);
  onWakeRef.current = onWake;
  const key = custom.join("|");

  useEffect(() => {
    // No wake word added yet: nothing to listen for, so don't hold the mic
    // or spend CPU on it.
    if (!enabled || !canListen() || !custom.length) {
      setWords([]);
      return;
    }
    let alive = true;
    let stopMic: () => void = () => {};
    const worker = new Worker(new URL("../lib/wakeWorker.ts", import.meta.url), { type: "module" });
    const log = (m: string) => void api.log(`wake engine: ${m}`).catch(() => undefined);

    // Keep the mic feed running; when it's taken away (Izuki talking on a
    // Bluetooth headset) start again — that waits for the mic to be free.
    // Rest in silence: in a quiet room there's nothing to spot, so don't
    // run the models at all. The last ~1.3 s is kept, and sent the moment
    // there's sound again, so the start of "Hey…" is never lost.
    const PREROLL = 16000 * 1.3;
    let recent: Float32Array[] = [];
    let recentLen = 0;
    let quietFor = 0;
    let resting = false;
    const onAudio = (samples: Float32Array) => {
      let sum = 0;
      for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
      const loud = Math.sqrt(sum / samples.length) > 0.008;
      quietFor = loud ? 0 : quietFor + samples.length;
      if (resting) {
        recent.push(samples);
        recentLen += samples.length;
        while (recentLen - recent[0].length > PREROLL) recentLen -= recent.shift()!.length;
        if (!loud) return;
        // Sound again: catch up on the pre-roll, then carry on live.
        resting = false;
        worker.postMessage({ kind: "reset" });
        for (const r of recent) worker.postMessage({ kind: "audio", samples: r }, [r.buffer]);
        recent = [];
        recentLen = 0;
        return;
      }
      worker.postMessage({ kind: "audio", samples }, [samples.buffer]);
      if (quietFor > 16000 * 2) resting = true; // 2 s of quiet
    };

    const feed = () => {
      if (!alive) return;
      stopMic = streamMic(
        onAudio,
        () => {
          worker.postMessage({ kind: "reset" });
          if (alive) setTimeout(feed, 300);
        }
      );
    };

    worker.onmessage = (e: MessageEvent<{ kind: string; name?: string; score?: number; words?: string[]; msPerFrame?: number; error?: string }>) => {
      const m = e.data;
      if (m.kind === "ready") {
        setWords(m.words ?? []);
        log(`listening for ${(m.words ?? []).join(", ")}`);
        feed();
      } else if (m.kind === "wake" && m.name) {
        log(`heard "${m.name}" (score ${m.score?.toFixed(2)})`);
        onWakeRef.current(m.name);
      } else if (m.kind === "near") {
        log(`near miss: "${m.name}" scored ${m.score?.toFixed(2)} (needs 0.40)`);
      } else if (m.kind === "load") {
        log(`${m.msPerFrame?.toFixed(1)} ms per 80 ms of sound`);
      } else if (m.kind === "error") {
        log(`error — ${m.error}`);
      }
    };
    worker.postMessage({ kind: "start", custom });

    return () => {
      alive = false;
      stopMic();
      worker.terminate();
      setWords([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, key]);

  return words;
}
