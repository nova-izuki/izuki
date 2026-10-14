/// <reference lib="webworker" />
/**
 * Air control's hand tracker, on its own thread. Measured on the i5 laptop:
 * the processor took 260–310 ms per look (3 looks a second — the hand dots
 * trailed far behind the hand); the graphics chip takes ~37 ms (25 a second)
 * but its first look takes 10–20 s while it prepares — which froze the whole
 * overlay when it ran there. Here, nothing waits on it.
 *
 * In:  { type: "start", base }                  load (graphics chip, else processor)
 *      { type: "look", frame, t }                a camera picture (transferred)
 * Out: { type: "ready", engine, ms }             ready, and how long that took
 *      { type: "hand", lm, ms, t }               the hand's 21 points (or null)
 *      { type: "error", message }
 */
import { HandLandmarker } from "@mediapipe/tasks-vision";

let landmarker: HandLandmarker | null = null;
let lastT = 0;

/**
 * MediaPipe's engine is a classic script; a module worker can only import
 * it as a module, where its `ModuleFactory` stays private — so it's wrapped
 * to put that on the global, where MediaPipe looks (it clears it after each
 * use, so this runs before every load). `custom_dbg` is the logger the
 * engine expects (MediaPipe's own module build defines it the same way).
 */
async function engine(base: string) {
  const text = await (await fetch(`${base}/vision_wasm_internal.js`)).text();
  const url = URL.createObjectURL(
    new Blob([`globalThis.custom_dbg = console.warn.bind(console);\n${text}\n;globalThis.ModuleFactory = ModuleFactory;`], { type: "text/javascript" }),
  );
  try {
    await import(/* @vite-ignore */ url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function make(base: string, delegate: "GPU" | "CPU") {
  await engine(base);
  return HandLandmarker.createFromOptions(
    { wasmLoaderPath: "", wasmBinaryPath: `${base}/vision_wasm_internal.wasm` },
    {
      baseOptions: { modelAssetPath: `${base}/hand_landmarker.task`, delegate },
      runningMode: "VIDEO",
      numHands: 1,
      // Finding a new hand stays strict; keeping hold of one already found is
      // looser, so a hand moving fast isn't dropped.
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.4,
      minTrackingConfidence: 0.35,
    },
  );
}

/** One look at a blank picture: the graphics chip does its slow first-time setup here, not on your hand. */
function warm(l: HandLandmarker) {
  const c = new OffscreenCanvas(64, 48);
  c.getContext("2d")?.fillRect(0, 0, 64, 48);
  l.detectForVideo(c, (lastT = performance.now()));
}

async function start(base: string) {
  const t0 = performance.now();
  try {
    const gpu = await make(base, "GPU");
    warm(gpu);
    landmarker = gpu;
    postMessage({ type: "ready", engine: "graphics chip", ms: Math.round(performance.now() - t0) });
    return;
  } catch (e) {
    postMessage({ type: "note", message: `graphics chip: ${e instanceof Error ? e.message : e}` });
  }
  try {
    const cpu = await make(base, "CPU");
    landmarker = cpu;
    postMessage({ type: "ready", engine: "processor", ms: Math.round(performance.now() - t0) });
  } catch (e) {
    postMessage({ type: "error", message: e instanceof Error ? e.message : String(e) });
  }
}

self.onmessage = (e: MessageEvent) => {
  const m = e.data as { type: string; base?: string; frame?: VideoFrame | ImageBitmap; t?: number };
  if (m.type === "start" && m.base) void start(m.base);
  else if (m.type === "look" && m.frame) {
    const frame = m.frame;
    try {
      if (!landmarker) return;
      // The model's clock must only move forward.
      const t = Math.max(lastT + 1, m.t ?? performance.now());
      lastT = t;
      const t0 = performance.now();
      const res = landmarker.detectForVideo(frame, t);
      postMessage({ type: "hand", lm: res.landmarks?.[0] ?? null, ms: Math.round(performance.now() - t0), t: m.t });
    } catch (err) {
      postMessage({ type: "error", message: err instanceof Error ? err.message : String(err) });
    } finally {
      frame.close();
    }
  } else if (m.type === "stop") {
    landmarker?.close();
    landmarker = null;
    close();
  }
};
