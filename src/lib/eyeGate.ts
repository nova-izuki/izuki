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
