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
import { blinkStep, fuseEyeGaze, newBlink, type EyeLook } from "./eyeGate";
import type { HeadPose } from "./eyeMap";

/**
 * Face Landmarker's 478-point model. The iris indices are paired by where
 * they actually sit in the image: 468 is inside the image-left eye (corners
 * 33/133) and 473 is inside the image-right eye (corners 263/362). Naming
 * the landmarks "left" and "right" by anatomy instead of image position is
 * how the first version crossed the eyes and cancelled horizontal gaze.
 */
const RIGHT_IRIS = 468;
const LEFT_IRIS = 473;
const RIGHT_EYE = { outer: 33, inner: 133, top: 159, bottom: 145 };
const LEFT_EYE = { outer: 263, inner: 362, top: 386, bottom: 374 };

// Compact face/eye guides for the preview. These are the same landmarks the
// tracker already uses, so the guide is not a second model or a second look.
const FACE_OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
const RIGHT_EYE_OUTLINE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
const LEFT_EYE_OUTLINE = [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466];
const RIGHT_IRIS_OUTLINE = [468, 469, 470, 471, 472];
const LEFT_IRIS_OUTLINE = [473, 474, 475, 476, 477];
const RIGHT_BROW = [46, 53, 52, 65, 55, 70, 63, 105, 66, 107];
const LEFT_BROW = [276, 283, 282, 295, 285, 300, 293, 334, 296, 336];
const LIPS = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185];

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

/** Nose-to-eye geometry, normalised by eye/face widths; stable enough for a regression covariate. */
function headOf(lm: Pt[]): HeadPose | null {
  const nose = pt(lm, 1);
  const left = pt(lm, 33);
  const right = pt(lm, 263);
  const leftFace = pt(lm, 127);
  const rightFace = pt(lm, 356);
  const chin = pt(lm, 152);
  const brow = pt(lm, 10);
  if (!nose || !left || !right || !leftFace || !rightFace || !chin || !brow) return null;
  const eyeDistance = Math.hypot(right.x - left.x, right.y - left.y);
  const faceWidth = Math.hypot(rightFace.x - leftFace.x, rightFace.y - leftFace.y);
  const faceHeight = Math.hypot(chin.x - brow.x, chin.y - brow.y);
  if (eyeDistance < 1e-6 || faceWidth < 1e-6 || faceHeight < 1e-6) return null;
  const eyeMid = { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 };
  const head = {
    yaw: (nose.x - eyeMid.x) / eyeDistance,
    pitch: (nose.y - eyeMid.y) / faceHeight,
    roll: Math.atan2(right.y - left.y, right.x - left.x),
    scale: eyeDistance / faceWidth,
  };
  return Object.values(head).every((value) => Number.isFinite(value)) ? head : null;
}

/** The iris and two corners needed for one eye's geometry. */
function eyeLook(lm: Pt[], eye: typeof RIGHT_EYE, iris: number): EyeLook | null {
  const irisPoint = pt(lm, iris);
  const inner = pt(lm, eye.inner);
  const outer = pt(lm, eye.outer);
  if (!irisPoint || !inner || !outer) return null;
  return { iris: irisPoint, inner, outer };
}

/** One look's blink EAR (the tighter of the two eyes), gaze direction and head pose. */
function readFace(lm: Pt[]) {
  const rightEar = earOf(lm, RIGHT_EYE);
  const leftEar = earOf(lm, LEFT_EYE);
  const ear = rightEar !== null && leftEar !== null ? Math.min(rightEar, leftEar) : rightEar ?? leftEar;
  const rightLook = eyeLook(lm, RIGHT_EYE, RIGHT_IRIS);
  const leftLook = eyeLook(lm, LEFT_EYE, LEFT_IRIS);
  const group = (indices: number[]) =>
    indices
      .map((i) => pt(lm, i))
      .filter((p): p is Pt => p !== null)
      .map((p) => ({ x: p.x, y: p.y }));
  // Measure both irises from their own eye centres; one eye is enough.
  return {
    ear,
    gaze: fuseEyeGaze(rightLook, leftLook),
    head: headOf(lm),
    eyes: { left: !!leftLook, right: !!rightLook },
    guide: {
      face: group(FACE_OVAL),
      rightEye: group(RIGHT_EYE_OUTLINE),
      leftEye: group(LEFT_EYE_OUTLINE),
      rightIris: group(RIGHT_IRIS_OUTLINE),
      leftIris: group(LEFT_IRIS_OUTLINE),
      rightBrow: group(RIGHT_BROW),
      leftBrow: group(LEFT_BROW),
      lips: group(LIPS),
    },
  };
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
  if (!landmarker) {
    // A picture can arrive while the model is still loading. Release it and
    // acknowledge it, or the main thread's one-in-flight pump stays stuck.
    frame.close();
    postMessage({ type: "done", t });
    return;
  }
  if (t <= lastT) t = lastT + 1; // VIDEO mode wants increasing timestamps
  lastT = t;
  let result: ReturnType<FaceLandmarker["detectForVideo"]>;
  try {
    result = landmarker.detectForVideo(frame, t);
  } catch (e) {
    frame.close();
    postMessage({ type: "error", message: e instanceof Error ? e.message : String(e) });
    postMessage({ type: "done", t });
    return;
  }
  frame.close();
  const face = result.faceLandmarks && result.faceLandmarks[0];
  if (!face || face.length < RIGHT_EYE.bottom) {
    blinkStep(blink, null); // a lost face re-arms blink detection
    postMessage({ type: "none", t });
    postMessage({ type: "done", t });
    return;
  }
  const { ear, gaze, head, eyes, guide } = readFace(face);
  postMessage({ type: "face", ear: ear ?? null, gaze, head, eyes, guide, blink: blinkStep(blink, ear), t });
  postMessage({ type: "done", t });
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
