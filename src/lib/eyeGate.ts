/**
 * The eye lane's gate — the first step the workstream plan calls for
 * ("eye-gesture gate first"): the camera may never start watching eyes by
 * itself. Three states:
 *
 *  - `off`: nothing runs. Every fresh process starts here.
 *  - `dev`: only a dev build may hold its gate open while it works, the way
 *    devvision only ever runs with `IZUKI_VISION=1`. A public build that
 *    asks is refused.
 *  - `session`: the user said yes, this session, in one explicit act. It is
 *    never saved and dies with the process.
 *
 * Nothing here writes to storage, and no angular data is logged: the gate
 * is checked before a FaceLandmarker is ever created, and the analysis
 * values float only in the eye lane's own memory. Pure functions throughout,
 * so `tools/eye-gate-check.cjs` can test them the way it tests airScroll.ts.
 */

export type GateMode = "off" | "dev" | "session";

export interface EyeGate {
  mode: GateMode;
}

export function newEyeGate(): EyeGate {
  return { mode: "off" };
}

/**
 * Ask the gate for more than `off`. `dev` is granted only inside a dev
 * build; `session` is the user's own explicit opt-in for this process
 * alone. Any out-of-turn ask locks everything back to `off`.
 */
export function requestGate(gate: EyeGate, request: "dev" | "session", devBuild: boolean): GateMode {
  switch (request) {
    case "dev":
      if (!devBuild) {
        gate.mode = "off";
        return gate.mode;
      }
      if (gate.mode === "session") {
        return gate.mode; // a session opt-in is already stronger than dev
      }
      gate.mode = "dev";
      return gate.mode;
    case "session":
      gate.mode = "session";
      return gate.mode;
  }
}

/**
 * Close the gate again. A session opt-in ends at `off`; a dev hold ends at
 * `off` too if nothing stronger is held. Unknown shapes leave the gate as
 * it is (`off` stays `off`).
 */
export function endGate(gate: EyeGate, request: "dev" | "session" | "unknown"): GateMode {
  if (request === "session" && gate.mode === "session") {
    gate.mode = "off";
    return gate.mode;
  }
  if (request === "dev" && gate.mode === "dev") {
    gate.mode = "off";
    return gate.mode;
  }
  if (request === "session" && gate.mode === "dev") {
    // A session's frame ended — the dev build's own hold can stay.
    return gate.mode;
  }
  return gate.mode;
}

/** True only when eye sensing may run right now. */
export const gateOpen = (gate: EyeGate) => gate.mode !== "off";

// ---------------------------------------------------------------------------
// Blink (from the eye aspect ratio, EAR = height/width of the eye box)
// ---------------------------------------------------------------------------

/**
 * Provisional thresholds: common eyes sit ~0.3+ open and ~0.1 closed, but
 * real cameras differ — these two numbers get tuned on the owner's own
 * camera before the eye lane ever ships (the milestone's stated camera
 * check). Until then they exist to be tested against made-up landmarks.
 */
export const EAR_CLOSE = 0.16;
export const EAR_OPEN = 0.24;

export interface EyeBlinkState {
  open: boolean;
  /** Closed frames counted since the last open eye. */
  frames: number;
}

export function newBlink(): EyeBlinkState {
  return { open: true, frames: 0 };
}

/**
 * One look's EAR in, one answer out: did that look end a blink? A blink is
 * a close *and a quick reopen* — software that treats "eye held shut" as
 * click-spam teaches the user to keep their eyes open at all times. A
 * shut-hold longer than ~12 closed frames reads as " resting eyes", not a
 * gesture. Junk input skips a frame instead of inventing a blink; a
 * skipped frame also resets, because a real close is re-entered next look.
 */
export function blinkStep(state: EyeBlinkState, ear: number | null): boolean {
  if (ear === null || !isFinite(ear)) {
    state.frames = 0;
    state.open = true;
    return false;
  }
  if (state.open) {
    if (ear < EAR_CLOSE) {
      state.open = false;
      state.frames = 1;
    }
    return false;
  }
  if (ear >= EAR_OPEN) {
    const blink = state.frames > 0 && state.frames <= 12;
    state.open = true;
    state.frames = 0;
    return blink;
  }
  state.frames += 1;
  return false;
}

// ---------------------------------------------------------------------------
// Gaze direction (iris inside the eye's corner box) — direction only
// ---------------------------------------------------------------------------

/**
 * Where the look aims, roughly: the iris centre as -1..1 inside the eye's
 * inner-corner→outer-corner box (x) and top→bottom box (y). null when any
 * landmark is missing or the box collapses — a null is quieter than a
 * wrongly aggressive number. Calibration, dwell and look-to-target build
 * on this; the units are provisional like the blink thresholds.
 */
export function gazeOffset(
  iris: { x: number; y: number } | null,
  inner: { x: number; y: number } | null,
  outer: { x: number; y: number } | null,
  top: { x: number; y: number } | null,
  bottom: { x: number; y: number } | null,
): { x: number; y: number } | null {
  if (!iris || !inner || !outer || !top || !bottom) return null;
  const w = outer.x - inner.x;
  const h = bottom.y - top.y;
  if (!isFinite(w) || !isFinite(h) || Math.abs(w) < 1e-6 || Math.abs(h) < 1e-6) return null;
  let x = ((iris.x - inner.x) / w) * 2 - 1;
  let y = ((iris.y - top.y) / h) * 2 - 1;
  if (!isFinite(x) || !isFinite(y)) return null;
  x = Math.min(1, Math.max(-1, x));
  y = Math.min(1, Math.max(-1, y));
  return { x, y };
}

// ---------------------------------------------------------------------------
// Calibration — one gesture, off by default
// ---------------------------------------------------------------------------

/**
 * The one-gesture calibration: the user looks at the centre marker and blinks
 * once. The looks collected before that blink become the neutral point every
 * later look is measured against, so a camera that sits high or low stops
 * pulling the gaze off-centre. Nothing runs until the caller starts it, it
 * dies with the gate, and nothing is ever written to storage.
 *
 * Provisional numbers, like the blink thresholds: on the owner's own camera
 * the hold that feels natural decides them.
 */
export const CALIBRATION_MIN_SAMPLES = 8;
export const CALIBRATION_STEADY_SPREAD = 0.12;
export const CALIBRATION_MAX_ANCHOR = 0.6;
export const CALIBRATION_TIMEOUT_MS = 8000;

export interface EyeCalibration {
  /** Off until the user starts the one gesture. */
  enabled: boolean;
  state: "idle" | "collecting" | "ready" | "failed";
  samples: { x: number; y: number }[];
  /** The neutral point subtracted from later looks; null until ready. */
  anchor: { x: number; y: number } | null;
  startedAt: number;
}

export function newCalibration(): EyeCalibration {
  return { enabled: false, state: "idle", samples: [], anchor: null, startedAt: 0 };
}

function resetCalibration(cal: EyeCalibration) {
  cal.enabled = false;
  cal.state = "idle";
  cal.samples = [];
  cal.anchor = null;
  cal.startedAt = 0;
}

/**
 * Begin the gesture. Refused while the eye gate is closed — the calibration
 * can never be a way around the gate — and always from a clean slate.
 */
export function startCalibration(cal: EyeCalibration, gate: EyeGate, now: number): boolean {
  resetCalibration(cal);
  if (!gateOpen(gate)) return false;
  cal.enabled = true;
  cal.state = "collecting";
  cal.startedAt = now;
  return true;
}

/** One look into the gesture; returns the calibration's state afterwards. */
export function calibrationStep(
  cal: EyeCalibration,
  gate: EyeGate,
  gaze: { x: number; y: number } | null,
  blink: boolean,
  now: number,
): EyeCalibration["state"] {
  if (cal.state !== "collecting") return cal.state;
  if (!gateOpen(gate)) {
    // The gate closing ends the gesture with it: nothing outlives the gate.
    resetCalibration(cal);
    return cal.state;
  }
  if (gaze) cal.samples.push({ x: gaze.x, y: gaze.y });
  if (!blink) {
    if (now - cal.startedAt > CALIBRATION_TIMEOUT_MS) {
      resetCalibration(cal);
      cal.state = "failed";
    }
    return cal.state; // still collecting
  }
  // The blink commits. A steady hold of enough looks is a real calibration;
  // a shaky or wildly off-centre one fails instead of skewing later looks.
  const xs = cal.samples.map((s) => s.x);
  const ys = cal.samples.map((s) => s.y);
  const span = (v: number[]) => (v.length ? Math.max(...v) - Math.min(...v) : Infinity);
  const avg = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
  const steady = xs.length >= CALIBRATION_MIN_SAMPLES
    && span(xs) <= CALIBRATION_STEADY_SPREAD
    && span(ys) <= CALIBRATION_STEADY_SPREAD;
  if (!steady) {
    resetCalibration(cal);
    cal.state = "failed";
    return cal.state;
  }
  const anchor = { x: avg(xs), y: avg(ys) };
  if (Math.abs(anchor.x) > CALIBRATION_MAX_ANCHOR || Math.abs(anchor.y) > CALIBRATION_MAX_ANCHOR) {
    resetCalibration(cal);
    cal.state = "failed";
    return cal.state;
  }
  cal.anchor = anchor;
  cal.state = "ready";
  return cal.state;
}

/**
 * Later looks through the committed anchor: the neutral point reads as
 * centre. No calibration, or one that isn't ready, leaves the gaze exactly
 * as it came in.
 */
export function applyCalibration(
  cal: EyeCalibration | null | undefined,
  gaze: { x: number; y: number } | null,
): { x: number; y: number } | null {
  if (!gaze || !cal || cal.state !== "ready" || !cal.anchor) return gaze;
  const clamp = (n: number) => Math.min(1, Math.max(-1, n));
  return { x: clamp(gaze.x - cal.anchor.x), y: clamp(gaze.y - cal.anchor.y) };
}

/** True when a calibration is committed and usable. */
export const calibrationReady = (cal: EyeCalibration) =>
  cal.state === "ready" && cal.anchor !== null;
