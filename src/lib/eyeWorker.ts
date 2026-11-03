/// <reference lib="webworker" />
/**
 * The eye lane's tracker, on its own thread — the same shape as airWorker.ts
 * (measured there: the processor choked at 3 looks/second while the graphics
 * chip holds ~25). It only ever exists because the caller checked the eye
 * gate first: nothing in this file can turn a camera on, and a face model
 * is created only after a `start` arrives.
 *
 * In:  { type: "start", base }                  load face_landmarker.task
 *      { type: "look", frame, t }                a camera picture (transferred)
 *      { type: "stop" }
 * Out: { type: "ready", engine, ms }
 *      { type: "face", ear, gaze, blink, t }     one look's results
 *      { type: "none", t }                       the camera saw no face
 *      { type: "error", message }
 *
 * No angles are logged anywhere; the numbers go only to the caller, and
 * nothing here is written to storage.
 */
import { FaceLandmarker } from "@mediapipe/tasks-vision";
import { blinkStep, gazeOffset, newBlink } from "./eyeGate";

/**
 * Face Landmarker's 478-point model: iris rings at 468 (left) and 473
 * (right); eye corners. The order of inner/outer only matters through the
 * width sign, and `gazeOffset` is sign-safe in either direction.
 */
const LEFT_IRIS = 468;
const RIGHT_IRIS = 473;
const RIGHT_EYE = { outer: 33, inner: 133, top: 159, bottom: 145 };
const LEFT_EYE = { outer: 263, inner: 362, top: 386, bottom: 374 };

let landmarker: FaceLandmarker | null = null;
let blink = newBlink();
let lastT = 0;

/**
 * MediaPipe's engine is a classic script; a module worker can only import
 * it as a module, where its `ModuleFactory` stays private — so it's wrapped
 * to put that on the global, where MediaPipe looks (it clears it after each
 * use, so this runs before every load). Same as airWorker.ts.
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
  return FaceLandmarker.createFromOptions(
    { wasmLoaderPath: "", wasmBinaryPath: `${base}/vision_wasm_internal.wasm` },
    {
      baseOptions: { modelAssetPath: `${base}/face_landmarker.task`, delegate },
      runningMode: "VIDEO",
      numFaces: 1,
      // No blendshapes: the eye lane needs iris points, not the full face
      // expression set, and skipping them keeps the looks cheaper.
      outputFaceBlendshapes: false,
      minFaceDetectionConfidence: 0.5,
      minFacePresenceConfidence: 0.4,
      minTrackingConfidence: 0.35,
    },
  );
}

/** One look at a blank picture: the graphics chip's slow first-time setup happens here, not on your face. */
function warm(l: FaceLandmarker) {
  const c = new OffscreenCanvas(64, 48);
  c.getContext("2d")?.fillRect(0, 0, 64, 48);
  l.detectForVideo(c, (lastT = performance.now()));
}

type Pt = { x: number; y: number };

function pt(lm: Pt[], i: number): Pt | null {
  return i < lm.length ? lm[i] : null;
}

/** EAR of one eye; null when its landmarks are missing. */
function earOf(lm: Pt[], eye: typeof RIGHT_EYE): number | null {
  const outer = pt(lm, eye.outer);
  const inner = pt(lm, eye.inner);
  const top = pt(lm, eye.top);
  const bottom = pt(lm, eye.bottom);
  if (!outer || !inner || !top || !bottom) return null;
  const w = Math.hypot(outer.x - inner.x, outer.y - inner.y);
  const h = Math.hypot(top.x - bottom.x, top.y - bottom.y);
  if (w < 1e-6) return null;
  return h / w;
}

/** One look's blink EAR (the tighter of the two eyes) and gaze direction. */
function readFace(lm: Pt[]) {
  const right = earOf(lm, RIGHT_EYE);
  const left = earOf(lm, LEFT_EYE);
  const ear = right !== null && left !== null ? Math.min(right, left) : right ?? left;
  const towardRight = gazeOffset(
    pt(lm, RIGHT_IRIS),
    pt(lm, RIGHT_EYE.inner),
    pt(lm, RIGHT_EYE.outer),
    pt(lm, RIGHT_EYE.top),
    pt(lm, RIGHT_EYE.bottom),
  );
  const towardLeft = gazeOffset(
    pt(lm, LEFT_IRIS),
    pt(lm, LEFT_EYE.inner),
    pt(lm, LEFT_EYE.outer),
    pt(lm, LEFT_EYE.top),
    pt(lm, LEFT_EYE.bottom),
  );
  // Both eyes read: average them (head tilt affects each eye oppositely).
  // One eye read: take what there is; neither: null.
  const gaze = towardRight && towardLeft
    ? { x: (towardRight.x + towardLeft.x) / 2, y: (towardRight.y + towardLeft.y) / 2 }
    : towardRight ?? towardLeft;
  return { ear, gaze };
}

async function start(base: string) {
  const t0 = performance.now();
  blink = newBlink();
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

function look(frame: ImageBitmap, t: number) {
  if (!landmarker) return;
  if (t <= lastT) t = lastT + 1; // VIDEO mode wants increasing timestamps
  lastT = t;
  const result = landmarker.detectForVideo(frame, t);
  frame.close();
  const face = result.faceLandmarks && result.faceLandmarks[0];
  if (!face || face.length < RIGHT_EYE.bottom) {
    blinkStep(blink, null); // a lost face re-arms blink detection
    postMessage({ type: "none", t });
    return;
  }
  const { ear, gaze } = readFace(face);
  postMessage({ type: "face", ear: ear ?? null, gaze, blink: blinkStep(blink, ear), t });
}

onmessage = (e: MessageEvent) => {
  const m = e.data as { type: string; base?: string; frame?: ImageBitmap; t?: number };
  switch (m.type) {
    case "start":
      void start(m.base ?? "/air");
      break;
    case "look":
      if (m.frame instanceof ImageBitmap && typeof m.t === "number") {
        look(m.frame, m.t);
      }
      break;
    case "stop":
      if (landmarker) {
        try {
          landmarker.close();
        } catch {
          /* already closed or mid-teardown — nothing to save */
        }
        landmarker = null;
      }
      postMessage({ type: "stopped" });
      break;
  }
};
