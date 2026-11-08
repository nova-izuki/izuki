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
}
