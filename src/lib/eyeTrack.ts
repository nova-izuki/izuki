/**
 * The eye lane's main-thread half: owns the eyeTracker worker and the
 * frame pump, never the camera. The gate is checked before anything is
 * created — `createEyeTracker` refuses (returns null) while the eye gate
 * is closed, whatever the caller wanted. The camera stream itself is the
 * caller's policy (devmode cards, Settings toggles); this file only
 * consumes a stream it is handed, and stops cleanly.
 *
 * Nothing here writes to storage or logs angles: blink/gaze numbers go
 * only to the callbacks the caller registers, in its own memory.
 */
import { gateOpen, type EyeGate } from "./eyeGate";

export interface EyeFrame {
  /** Blink EAR for the look (provisional thresholds — see eyeGate.ts). */
  ear: number | null;
  /** Gaze direction -1..1, or null when the iris wasn't readable. */
  gaze: { x: number; y: number } | null;
  /** True once per blink: a quick close *and* reopen, not a shut-hold. */
  blink: boolean;
  /** Look timestamp (ms), monotonic. */
  t: number;
}

export interface EyeTracker {
  /** Resolves when the face model is on its thread (or rejects). */
  ready(): Promise<"graphics chip" | "processor">;
  onFrames(cb: (f: EyeFrame) => void): void;
  /** No face seen at a timestamp — mainly reconnect/diagnostics. */
  onMissing(cb: (t: number) => void): void;
  stop(): void;
}

type WireEvents = {
  ready: { type: "ready"; engine: "graphics chip" | "processor" };
  face: { type: "face"; ear: number | null; gaze: { x: number; y: number } | null; blink: boolean; t: number };
  none: { type: "none"; t: number };
  error: { type: "error"; message: string };
  stopped: { type: "stopped" };
};

export interface EyeTrackerOptions {
  gate: EyeGate;
  stream: MediaStream;
  video?: HTMLVideoElement;
}

export function createEyeTracker(opts: EyeTrackerOptions): EyeTracker | null {
  if (!gateOpen(opts.gate)) {
    // The gate's whole point: no worker, no model, no frames, ever,
    // unless the gate says so.
    return null;
  }

  const video = opts.video ?? document.createElement("video");
  video.srcObject = opts.stream;
  video.muted = true;
  void video.play().catch(() => {});

  const worker = new Worker(new URL("./eyeWorker.ts", import.meta.url), { type: "module" });
  const base = new URL("/air", window.location.href).href;
  const waiting: ((e: "graphics chip" | "processor" | Error) => void)[] = [];

  worker.onmessage = (e: MessageEvent<WireEvents[keyof WireEvents]>) => {
    const m = e.data;
    if (m.type === "ready") {
      for (const w of waiting.splice(0)) w(m.engine);
      return;
    }
    if (m.type === "error") {
      for (const w of waiting.splice(0)) w(new Error(m.message));
      return;
    }
    if (m.type === "face") {
      frames.forEach((cb) => cb({ ear: m.ear, gaze: m.gaze, blink: m.blink, t: m.t }));
      return;
    }
    if (m.type === "none") {
      missing.forEach((cb) => cb(m.t));
    }
  };
  worker.onerror = (e) => {
    for (const w of waiting.splice(0)) w(new Error(e.message || "the eye tracker's thread died"));
  };

  const frames: ((f: EyeFrame) => void)[] = [];
  const missing: ((t: number) => void)[] = [];

  worker.postMessage({ type: "start", base });

  let raf = 0;
  let stopped = false;

  /** One camera picture onto the tracker's thread, transferring it. */
  function pump() {
    if (stopped) return;
    // Prefer the frame callback (new picture only) and fall back to rAF.
    const anyVideo = video as HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: () => void) => number;
    };
    if (typeof anyVideo.requestVideoFrameCallback === "function") {
      anyVideo.requestVideoFrameCallback(pump);
    } else {
      raf = requestAnimationFrame(pump);
    }
    if (!video.videoWidth) return;
    const bitmap = createImageBitmap(video);
    bitmap
      .then((bm) => worker.postMessage({ type: "look", frame: bm, t: performance.now() }, [bm]))
      .catch(() => {}); // video torn down mid-frame — the next look retries
  }
  pump();

  return {
    ready() {
      return new Promise((resolve, reject) => waiting.push((e) => (e instanceof Error ? reject(e) : resolve(e))));
    },
    onFrames(cb) {
      frames.push(cb);
    },
    onMissing(cb) {
      missing.push(cb);
    },
    stop() {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(raf);
      worker.postMessage({ type: "stop" });
      // Give the thread a beat to stop the model, then close.
      const w = worker;
      setTimeout(() => w.terminate(), 400);
      if (video.srcObject === opts.stream) video.srcObject = null;
    },
  };
}
