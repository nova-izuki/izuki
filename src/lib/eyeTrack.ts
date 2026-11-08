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
import { applyCalibration, gateOpen, type EyeCalibration, type EyeGate } from "./eyeGate";
import type { HeadPose } from "./eyeMap";

export interface GuidePoint {
  x: number;
  y: number;
}

/** Compact face/eye landmarks from the worker's existing face model. */
export interface EyeGuide {
  face: GuidePoint[];
  rightEye: GuidePoint[];
  leftEye: GuidePoint[];
  rightIris: GuidePoint[];
  leftIris: GuidePoint[];
  rightBrow: GuidePoint[];
  leftBrow: GuidePoint[];
  lips: GuidePoint[];
}

export interface EyeFrame {
  /** Blink EAR for the look (provisional thresholds — see eyeGate.ts). */
  ear: number | null;
  /** Which irises were readable in this look. */
  eyes: { left: boolean; right: boolean };
  /** Landmarks for the optional preview guide. */
  guide: EyeGuide | null;
  /** Gaze direction -1..1, or null when the iris wasn't readable. */
  gaze: { x: number; y: number } | null;
  /** True once per blink: a quick close *and* reopen, not a shut-hold. */
  blink: boolean;
  /** Face-pose readings from the same landmark set. */
  head: HeadPose | null;
  /** Calibrated screen position (0..1), or null until calibration is ready. */
  screen: { x: number; y: number } | null;
  /** Look timestamp (ms), monotonic. */
  t: number;
}

export interface EyeTracker {
  /** Resolves when the face model is on its thread (or rejects). */
  ready(): Promise<"graphics chip" | "processor">;
  onFrames(cb: (f: EyeFrame) => void): void;
  /** No face seen at a timestamp — mainly reconnect/diagnostics. */
  onMissing(cb: (t: number) => void): void;
  /** A worker/model failure after startup. The caller should stop the camera. */
  onError(cb: (message: string) => void): void;
  stop(): void;
}

type WireEvents = {
  ready: { type: "ready"; engine: "graphics chip" | "processor" };
  face: {
    type: "face";
    ear: number | null;
    gaze: { x: number; y: number } | null;
    head: HeadPose | null;
    eyes: { left: boolean; right: boolean };
    guide: EyeGuide | null;
    blink: boolean;
    t: number;
  };
  none: { type: "none"; t: number };
  done: { type: "done"; t: number };
  error: { type: "error"; message: string };
  stopped: { type: "stopped" };
};

export interface EyeTrackerOptions {
  gate: EyeGate;
  stream: MediaStream;
  video?: HTMLVideoElement;
  /**
   * The lane's calibration, when the caller runs the nine-target fit. While
   * it is ready its map turns every reported look into a screen point; unset
   * or not ready leaves `screen` null. The tracker only reads it, never
   * starts it.
   */
  calibration?: EyeCalibration;
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
  const frames: ((f: EyeFrame) => void)[] = [];
  const missing: ((t: number) => void)[] = [];
  const errors: ((message: string) => void)[] = [];

  let raf = 0;
  let stopped = false;
  let busy = false;
  let failed = false;
  /** Eye inference is much heavier than the camera; 15 looks/s is plenty for a smoothed gaze and keeps the UI responsive. */
  const LOOK_INTERVAL_MS = 66;
  let lastLookAt = 0;

  const fail = (message: string) => {
    if (failed || stopped) return;
    failed = true;
    busy = false;
    for (const waiter of waiting.splice(0)) waiter(new Error(message));
    for (const cb of errors) cb(message);
  };

  worker.onmessage = (e: MessageEvent<WireEvents[keyof WireEvents]>) => {
    if (stopped) return;
    const m = e.data;
    if (m.type === "ready") {
      for (const waiter of waiting.splice(0)) waiter(m.engine);
      return;
    }
    if (m.type === "error") {
      fail(m.message);
      return;
    }
    if (m.type === "face") {
      const screen = applyCalibration(opts.calibration, m.gaze, m.head);
      frames.forEach((cb) => cb({
        ear: m.ear,
        gaze: m.gaze,
        blink: m.blink,
        head: m.head ?? null,
        eyes: m.eyes,
        guide: m.guide ?? null,
        screen,
        t: m.t,
      }));
      return;
    }
    if (m.type === "none") {
      missing.forEach((cb) => cb(m.t));
      return;
    }
    if (m.type === "done") busy = false;
  };
  worker.onerror = (e) => {
    fail(e.message || "the eye tracker's thread died");
  };

  worker.postMessage({ type: "start", base });

  /**
   * One camera picture onto the tracker's thread, transferring it. One picture
   * is in flight at a time: a backlog would make the cursor trail behind the
   * eyes after a slow inference frame.
   */
  function pump() {
    if (stopped || failed) return;
    // Prefer the frame callback (new picture only) and fall back to rAF.
    const anyVideo = video as HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: () => void) => number;
    };
    if (typeof anyVideo.requestVideoFrameCallback === "function") {
      anyVideo.requestVideoFrameCallback(pump);
    } else {
      raf = requestAnimationFrame(pump);
    }
    if (busy || !video.videoWidth) return;
    const now = performance.now();
    if (now - lastLookAt < LOOK_INTERVAL_MS) return;
    lastLookAt = now;
    busy = true;
    createImageBitmap(video)
      .then((bm) => worker.postMessage({ type: "look", frame: bm, t: now }, [bm]))
      .catch(() => { busy = false; }); // video torn down mid-frame — the next look retries
  }
  pump();

  return {
    ready() {
      if (failed) return Promise.reject(new Error("the eye tracker stopped before it was ready"));
      return new Promise((resolve, reject) => waiting.push((e) => (e instanceof Error ? reject(e) : resolve(e))));
    },
    onFrames(cb) {
      frames.push(cb);
    },
    onMissing(cb) {
      missing.push(cb);
    },
    onError(cb) {
      errors.push(cb);
    },
    stop() {
      if (stopped) return;
      stopped = true;
      busy = false;
      cancelAnimationFrame(raf);
      worker.postMessage({ type: "stop" });
      // Give the thread a beat to stop the model, then close.
      const w = worker;
      setTimeout(() => w.terminate(), 400);
      if (video.srcObject === opts.stream) video.srcObject = null;
    },
  };
}
