/**
 * Eye control's small, pure decision layer: how far a look moves the pointer,
 * how it is smoothed, and when a double blink may click. The gate and model
 * live in eyeGate.ts / eyeTrack.ts; keeping the arithmetic here lets the
 * Windows-side policy be tested without a camera.
 *
 * Safety rule: one blink never clicks. Clicks are opt-in, need two deliberate
 * blinks while the gaze is settled, and are refused until calibration is
 * ready. Look-to-move works without any click permission.
 */

export type EyeSensitivity = "calm" | "standard" | "quick";

/**
 * `hold` is the calibrated-space jitter radius: a mapped look inside it leaves
 * the cursor exactly where it is. The old gains/dead values are retained for
 * the uncalibrated `mapGaze` fallback and its tests; calibrated Eye Control
 * uses the fitted map and this hold instead.
 */
export const EYE_SENSITIVITIES = {
  calm: { label: "Calm", gainX: 1.9, gainY: 2.4, dead: 0.045, tau: 260, hold: 0.0065 },
  standard: { label: "Standard", gainX: 2.5, gainY: 3.0, dead: 0.035, tau: 200, hold: 0.004 },
  quick: { label: "Quick", gainX: 3.2, gainY: 3.8, dead: 0.025, tau: 150, hold: 0.0022 },
} as const;

export function normalizeEyeSensitivity(value: unknown): EyeSensitivity {
  return value === "calm" || value === "quick" ? value : "standard";
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Iris offset (-1..1) to a place on the desktop (0..1). This is the legacy
 * uncalibrated fallback; the live lane uses the fitted map in eyeMap.ts. The
 * dead zone is small on purpose: it removes the jitter of a resting eye
 * without making the user stare past the middle of a button.
 */
export function mapGaze(
  gaze: { x: number; y: number } | null,
  sensitivity: EyeSensitivity,
): { x: number; y: number } | null {
  if (!gaze || !Number.isFinite(gaze.x) || !Number.isFinite(gaze.y)) return null;
  const s = EYE_SENSITIVITIES[normalizeEyeSensitivity(sensitivity)];
  const axis = (v: number, dead: number, gain: number) => {
    const n = Math.min(1, Math.max(-1, v));
    const a = Math.abs(n);
    return a <= dead ? 0 : Math.sign(n) * (a - dead) * gain;
  };
  return {
    x: clamp01(0.5 + axis(gaze.x, s.dead, s.gainX)),
    y: clamp01(0.5 + axis(gaze.y, s.dead, s.gainY)),
  };
}

/**
 * One-euro-like smoothing with a small calibrated-space hold. A still look is
 * steady and does not jitter the cursor; a deliberate look gets through
 * quickly. `dtMs` is the real gap between camera looks; Calm/Standard/Quick
 * change both the hold radius and the response time.
 */
export function smoothEye(
  previous: { x: number; y: number },
  target: { x: number; y: number },
  dtMs: number,
  sensitivity: EyeSensitivity,
): { x: number; y: number } {
  if (!Number.isFinite(target.x) || !Number.isFinite(target.y)) return { x: previous.x, y: previous.y };
  const s = EYE_SENSITIVITIES[normalizeEyeSensitivity(sensitivity)];
  const distance = Math.hypot(target.x - previous.x, target.y - previous.y);
  if (distance <= s.hold) return { x: previous.x, y: previous.y };
  const dt = Math.min(120, Math.max(8, Number.isFinite(dtMs) ? dtMs : 33));
  const base = 1 - Math.exp(-dt / s.tau);
  const alpha = Math.min(0.92, base + Math.min(0.42, distance * 0.85));
  return {
    x: previous.x + (target.x - previous.x) * alpha,
    y: previous.y + (target.y - previous.y) * alpha,
  };
}

/** A mapped target is held for one frame if it jumps implausibly far. */
export interface GazeJumpState {
  /** The last accepted screen target. */
  last: { x: number; y: number };
  /** A pending far target, waiting for a confirming frame. */
  candidate: { x: number; y: number } | null;
}

export function newGazeJumpState(): GazeJumpState {
  return { last: { x: 0.5, y: 0.5 }, candidate: null };
}

/**
 * Accept a mapped gaze target unless it is a single-frame jump far from the
 * last accepted target. A real saccade is confirmed by the next frame, so it
 * costs at most one 15 Hz camera interval; a lone bad landmark frame cannot
 * throw the cursor across the desktop.
 */
export function acceptGazeJump(
  state: GazeJumpState,
  target: { x: number; y: number },
  threshold = 0.28,
): { x: number; y: number } | null {
  if (!Number.isFinite(target.x) || !Number.isFinite(target.y)) return null;
  const jump = Math.hypot(target.x - state.last.x, target.y - state.last.y);
  if (jump <= threshold) {
    state.candidate = null;
    state.last = { x: target.x, y: target.y };
    return { x: target.x, y: target.y };
  }
  const confirmRadius = threshold * 0.4;
  if (!state.candidate || Math.hypot(target.x - state.candidate.x, target.y - state.candidate.y) > confirmRadius) {
    state.candidate = { x: target.x, y: target.y };
    return null;
  }
  state.candidate = null;
  state.last = { x: target.x, y: target.y };
  return { x: target.x, y: target.y };
}

/** How a deliberate double blink is remembered between camera looks. */
export interface EyeClickState {
  /** When the first blink of the pair was seen (0 = none waiting). */
  firstAt: number;
  /** The last accepted click, for the cooldown. */
  lastClickAt: number;
}

export function newEyeClickState(): EyeClickState {
  // -Infinity, not 0: a blink at monotonic time 500 ms must not be mistaken
  // for being inside a cooldown that never happened.
  return { firstAt: 0, lastClickAt: -Infinity };
}

export interface EyeClickStep {
  blink: boolean;
  now: number;
  /** The user explicitly turned blink clicks on. */
  enabled: boolean;
  /** Calibration is ready; a calibration blink can never click. */
  ready: boolean;
  /** The gaze has been settled for a moment at the cursor's target. */
  steady: boolean;
}

/**
 * Feed one look. True only on the second blink of a deliberate pair, with
 * clicks enabled and the gaze settled. A single blink — the normal kind —
 * never returns true. A slow second blink starts a new pair instead.
 */
export function eyeClickStep(state: EyeClickState, step: EyeClickStep): boolean {
  if (!step.enabled || !step.ready || !step.steady) {
    state.firstAt = 0;
    return false;
  }
  if (step.now - state.firstAt > 1000) state.firstAt = 0;
  if (!step.blink) return false;
  if (step.now - state.lastClickAt < 1300) return false;
  if (!state.firstAt) {
    state.firstAt = step.now;
    return false;
  }
  const gap = step.now - state.firstAt;
  state.firstAt = 0;
  // A natural double blink is roughly 0.18–0.8 s apart. Anything slower is
  // two separate blinks; anything too fast is likely one noisy read.
  if (gap < 160 || gap > 1000) return false;
  state.lastClickAt = step.now;
  return true;
}

// ---------------------------------------------------------------------------
// The camera going away. Unplugged, switched off, or taken by another app
// (Teams, Zoom): Eye Control says so plainly, stops steering at once (the
// caller lets go of everything), and picks the camera back up by itself.
// ---------------------------------------------------------------------------

export type CameraTrouble = "busy" | "missing" | "denied" | "gone" | "other";

/** What went wrong with the camera, in plain words, from the error the browser gave. */
export function cameraProblem(e: unknown): { kind: CameraTrouble; message: string } {
  const name = typeof e === "object" && e && "name" in e ? String((e as { name: unknown }).name) : "";
  const text = (e instanceof Error ? e.message : typeof e === "string" ? e : "").toLowerCase();
  if (text === "disconnected" || text.includes("camera disconnected")) {
    return { kind: "gone", message: "the camera was unplugged or switched off. Eye Control stopped steering and picks it back up by itself when the camera returns." };
  }
  if (["NotAllowedError", "SecurityError", "PermissionDeniedError"].includes(name)) {
    return { kind: "denied", message: "Windows is blocking the camera for Izuki. Turn it on in Windows Settings → Privacy & security → Camera; Eye Control picks it up by itself." };
  }
  if (["NotFoundError", "DevicesNotFoundError", "OverconstrainedError"].includes(name) || text.includes("no camera support")) {
    return { kind: "missing", message: "no camera found. Plug one in and Eye Control picks it up by itself." };
  }
  if (["NotReadableError", "TrackStartError", "AbortError"].includes(name) || text.includes("no camera would start") || text.includes("didn't answer") || text.includes("picture didn't start")) {
    return { kind: "busy", message: "another app is using the camera (Teams, Zoom, the Camera app…). Eye Control picks it up as soon as it's free." };
  }
  return { kind: "other", message: text || "something went wrong" };
}

/**
 * How long to wait before trying the camera again (ms), or null when trying
 * again by itself won't help (a problem that isn't the camera). Quick at
 * first, then every 15 s (30 s while Windows blocks it), for as long as Eye
 * Control stays on. A camera plugged back in is also tried at once.
 */
export function cameraRetryDelay(kind: CameraTrouble, attempt: number): number | null {
  if (kind === "other") return null;
  const steps = kind === "denied" ? [10_000, 20_000, 30_000] : [2_000, 4_000, 8_000, 15_000];
  return steps[Math.min(Math.max(0, attempt), steps.length - 1)];
}

// ---------------------------------------------------------------------------
// The head moving after calibration. The map is fitted for one head position;
// turning, tilting or leaning shifts every look. A small move is mentioned; a
// move too far to trust stops the real mouse (the eye cursor is still drawn)
// and asks for a quick recalibration. Back where it was, it carries on.
// ---------------------------------------------------------------------------

/** The face-pose reading (normalised geometry, from eyeWorker.ts). */
export interface HeadPoseReading {
  yaw: number;
  pitch: number;
  roll: number;
  scale: number;
}

/** Past this the cursor may drift: said, nothing stops. Same as calibration's own tolerance. */
export const HEAD_MOVED = 0.1;
/** Past this the map can't be trusted: the real mouse waits. */
export const HEAD_TOO_FAR = 0.18;
/** A change must hold this long before it counts (one odd frame never does). */
export const HEAD_SETTLE_MS = 500;

export type HeadLevel = "ok" | "moved" | "far";

export interface HeadDriftState {
  level: HeadLevel;
  /** A different level seen, and since when; it counts after HEAD_SETTLE_MS. */
  pending: HeadLevel;
  since: number;
}

export function newHeadDrift(): HeadDriftState {
  return { level: "ok", pending: "ok", since: 0 };
}

/** How far the head is from where it was at calibration, and the biggest change in words. */
export function headDriftAmount(anchor: HeadPoseReading, head: HeadPoseReading): { amount: number; why: string } {
  const parts: Array<[number, string]> = [
    [Math.abs(head.yaw - anchor.yaw), "turned your head"],
    [Math.abs(head.pitch - anchor.pitch), "tilted your head up or down"],
    [Math.abs(head.roll - anchor.roll), "tilted your head to the side"],
    // Face size changes with distance; it varies less, so it counts more.
    [Math.abs(head.scale - anchor.scale) / 0.6, head.scale > anchor.scale ? "moved closer to the screen" : "moved back from the screen"],
  ];
  const [amount, why] = parts.reduce((a, b) => (b[0] > a[0] ? b : a));
  return { amount: Number.isFinite(amount) ? amount : 0, why };
}

/**
 * Feed one look. Returns the level now, whether it just changed, and what to
 * say. No anchor (not calibrated) or no reading: the level stays as it was.
 * Leaving "far" needs the head clearly back (under 80% of the limit), so it
 * doesn't flicker at the edge.
 */
export function headDriftStep(
  state: HeadDriftState,
  anchor: HeadPoseReading | null | undefined,
  head: HeadPoseReading | null | undefined,
  now: number,
): { level: HeadLevel; changed: boolean; message: string } {
  if (!anchor || !head) return { level: state.level, changed: false, message: "" };
  const { amount, why } = headDriftAmount(anchor, head);
  const farLimit = state.level === "far" ? HEAD_TOO_FAR * 0.8 : HEAD_TOO_FAR;
  const seen: HeadLevel = amount > farLimit ? "far" : amount > HEAD_MOVED ? "moved" : "ok";
  if (seen === state.level) {
    state.pending = seen;
    return { level: state.level, changed: false, message: "" };
  }
  if (seen !== state.pending) {
    state.pending = seen;
    state.since = now;
    return { level: state.level, changed: false, message: "" };
  }
  if (now - state.since < HEAD_SETTLE_MS) return { level: state.level, changed: false, message: "" };
  state.level = seen;
  const message =
    seen === "far"
      ? `You've ${why} since calibrating, so the eye cursor can't be trusted and the mouse waits. Move back to where you were, or press Calibrate eyes for a quick recalibration.`
      : seen === "moved"
        ? `You've ${why} a little since calibrating. If the cursor drifts, press Calibrate eyes.`
        : "Back where you calibrated — steering again.";
  return { level: seen, changed: true, message };
}

/** What the overlay tells Settings and the live status line. */
export interface EyeStatusPayload {
  state: "off" | "starting" | "no-face" | "tracking" | "calibrating" | "ready" | "failed" | "error";
  message: string;
  face: boolean;
  calibrated: boolean;
  clicks: boolean;
  samples?: number;
  /** One-based calibration target currently shown. */
  step?: number;
  total?: number;
  /** Held-out fit error, normalised screen units. */
  quality?: number;
  engine?: string;
  /** The accuracy check after calibration: average error on fresh dots (screen units). */
  accuracy?: number;
  /** The accuracy check: how much the estimate wobbles while the eyes hold still. */
  jitter?: number;
  /** "checking": the accuracy check runs; "pointer": it passed, the real mouse
   *  follows steady looks; "preview": it didn't, so the eye cursor is only drawn. */
  mode?: "checking" | "pointer" | "preview";
}

// ---------------------------------------------------------------------------
// The accuracy check. A calibration that "succeeds" only says the map fits its
// own nine dots; the owner's first real test passed calibration and then the
// cursor wandered. So after calibrating, five fresh dots the map never saw
// measure the real error and wobble, and the real mouse moves only if they're
// good enough. Otherwise the eye cursor is drawn on screen and nothing moves.
// ---------------------------------------------------------------------------

export interface ScreenPoint {
  x: number;
  y: number;
}

/** Five dots between the calibration ones: never used to fit the map. */
export const VALIDATION_TARGETS: ScreenPoint[] = [
  { x: 0.32, y: 0.32 },
  { x: 0.68, y: 0.32 },
  { x: 0.5, y: 0.42 },
  { x: 0.32, y: 0.6 },
  { x: 0.68, y: 0.6 },
];
/** Time to settle on each dot before measuring (the eyes land, then hold). */
export const VALIDATION_SETTLE_MS = 700;
/** Time measuring each dot. */
export const VALIDATION_COLLECT_MS = 1200;
/** Fewer readings than this on a dot: it can't be judged. */
export const VALIDATION_MIN_SAMPLES = 8;
/** The real mouse follows the eyes only with at most this average error… */
export const POINTER_MAX_ERROR = 0.08;
/** …and at most this much wobble while the eyes hold still (screen units). */
export const POINTER_MAX_JITTER = 0.035;
/** The real mouse moves only once the eye cursor has held still this long. */
export const FIXATION_MS = 250;

export interface ValidationDot {
  target: ScreenPoint;
  /** Distance from the dot to the average estimate. */
  error: number;
  /** Typical distance of each estimate from that average. */
  jitter: number;
  samples: number;
}

export interface ValidationState {
  index: number;
  dotStart: number;
  samples: ScreenPoint[];
  dots: ValidationDot[];
  done: boolean;
}

export interface ValidationSummary {
  /** Average error over the dots (screen units; 0.05 = 5% of the screen). */
  accuracy: number;
  /** Average wobble while the eyes held still. */
  jitter: number;
  /** The worst single dot's error. */
  worst: number;
  /** Good enough to move the real mouse. */
  pass: boolean;
  /** Why, in plain words. */
  reason: string;
}

export function newValidation(now: number): ValidationState {
  return { index: 0, dotStart: now, samples: [], dots: [], done: false };
}

/** Where the check is: the dot to look at, its number, and how far along. */
export function validationView(v: ValidationState, now: number): { target: ScreenPoint; point: number; total: number; progress: number } | null {
  if (v.done) return null;
  const target = VALIDATION_TARGETS[v.index];
  const progress = Math.min(1, Math.max(0, (now - v.dotStart) / (VALIDATION_SETTLE_MS + VALIDATION_COLLECT_MS)));
  return { target, point: v.index + 1, total: VALIDATION_TARGETS.length, progress };
}

/**
 * One frame of the check: the map's raw estimate (not the smoothed cursor),
 * or null when the eyes weren't read. Moves to the next dot after its time;
 * `true` once every dot is measured.
 */
export function validationStep(v: ValidationState, estimate: ScreenPoint | null, now: number): boolean {
  if (v.done) return true;
  const elapsed = now - v.dotStart;
  if (estimate && Number.isFinite(estimate.x) && Number.isFinite(estimate.y) && elapsed >= VALIDATION_SETTLE_MS) {
    v.samples.push({ x: estimate.x, y: estimate.y });
  }
  if (elapsed < VALIDATION_SETTLE_MS + VALIDATION_COLLECT_MS) return false;
  const target = VALIDATION_TARGETS[v.index];
  const n = v.samples.length;
  const mean = n ? { x: v.samples.reduce((a, s) => a + s.x, 0) / n, y: v.samples.reduce((a, s) => a + s.y, 0) / n } : { x: NaN, y: NaN };
  const jitter = n ? Math.sqrt(v.samples.reduce((a, s) => a + (s.x - mean.x) ** 2 + (s.y - mean.y) ** 2, 0) / n) : Infinity;
  v.dots.push({ target, error: n ? Math.hypot(mean.x - target.x, mean.y - target.y) : Infinity, jitter, samples: n });
  v.index += 1;
  v.samples = [];
  v.dotStart = now;
  if (v.index >= VALIDATION_TARGETS.length) v.done = true;
  return v.done;
}

const pct = (n: number) => `${Math.round(n * 100)}%`;

/** The check's verdict: whether the real mouse may follow the eyes, and why. */
export function summarizeValidation(dots: ValidationDot[]): ValidationSummary {
  const thin = dots.filter((d) => d.samples < VALIDATION_MIN_SAMPLES);
  if (!dots.length || thin.length) {
    return {
      accuracy: Infinity,
      jitter: Infinity,
      worst: Infinity,
      pass: false,
      reason: `The eyes weren't read well enough on ${thin.length || dots.length} of the check dots. Try more light on your face, then recalibrate.`,
    };
  }
  const accuracy = dots.reduce((a, d) => a + d.error, 0) / dots.length;
  const jitter = dots.reduce((a, d) => a + d.jitter, 0) / dots.length;
  const worst = Math.max(...dots.map((d) => d.error));
  if (accuracy > POINTER_MAX_ERROR) {
    return { accuracy, jitter, worst, pass: false, reason: `Average error ${pct(accuracy)} of the screen (needs ${pct(POINTER_MAX_ERROR)} or less to move the mouse). The eye cursor is shown, but the mouse stays where it is.` };
  }
  if (jitter > POINTER_MAX_JITTER) {
    return { accuracy, jitter, worst, pass: false, reason: `The estimate wobbles ${pct(jitter)} of the screen while your eyes hold still (needs ${pct(POINTER_MAX_JITTER)} or less). The eye cursor is shown, but the mouse stays where it is.` };
  }
  return { accuracy, jitter, worst, pass: true, reason: `Accuracy check passed: average error ${pct(accuracy)}, wobble ${pct(jitter)}. The mouse follows steady looks.` };
}
