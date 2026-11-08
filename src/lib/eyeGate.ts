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
import {
  CALIBRATION_MAX_RMS,
  CALIBRATION_TARGETS,
  fitGazeModel,
  predictGaze,
  type CalibrationPoint,
  type GazeModel,
  type GazeSample,
  type GazeTarget,
  type HeadPose,
} from "./eyeMap";

export type GateMode = "off" | "dev" | "session";

export interface EyeGate {
  mode: GateMode;
}

export function newEyeGate(): EyeGate {
  return { mode: "off" };
}

export function requestGate(gate: EyeGate, request: "dev" | "session", devBuild: boolean): GateMode {
  switch (request) {
    case "dev":
      if (!devBuild) {
        gate.mode = "off";
        return gate.mode;
      }
      if (gate.mode === "session") return gate.mode;
      gate.mode = "dev";
      return gate.mode;
    case "session":
      gate.mode = "session";
      return gate.mode;
  }
}

export function endGate(gate: EyeGate, request: "dev" | "session" | "unknown"): GateMode {
  if (request === "session" && gate.mode === "session") {
    gate.mode = "off";
    return gate.mode;
  }
  if (request === "dev" && gate.mode === "dev") {
    gate.mode = "off";
    return gate.mode;
  }
  if (request === "session" && gate.mode === "dev") return gate.mode;
  return gate.mode;
}

/** True only when eye sensing may run right now. */
export const gateOpen = (gate: EyeGate) => gate.mode !== "off";

// ---------------------------------------------------------------------------
// Blink (from the eye aspect ratio, EAR = height / width of the eye box)
// ---------------------------------------------------------------------------

/** Common eyes sit ~0.3+ open and ~0.1 closed; the values are camera-tuned. */
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
 * One look's EAR in, one answer out: did that look end a blink? A blink is a
 * quick close and reopen, not a held-shut eye. Junk looks reset the state.
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
// Gaze direction (iris inside the eye's corner box)
// ---------------------------------------------------------------------------

export interface EyePoint {
  x: number;
  y: number;
}

export interface EyeLook {
  iris: EyePoint;
  /** Either eye corner works; the midpoint is the eye's centre. */
  inner: EyePoint;
  outer: EyePoint;
}

/**
 * Fuse both eyes into one stable, image-space gaze reading.
 *
 * The old per-eye formula measured the iris from the inner corner with a
 * signed width. That makes the two eyes produce opposite horizontal signs,
 * so averaging them collapses a real left/right look. Here each iris is
 * measured from its own eye's centre instead, then divided by that eye's
 * width. Both eyes therefore agree on which way the iris moved, and a missing
 * eye can be tolerated by using the other one alone.
 *
 * Vertical gaze is also measured against eye width, not eyelid height. Eyelid
 * height changes with blinks and narrows as the eye looks down, which was the
 * reason the bottom targets were hard to catch; eye width is stable.
 */
export function fuseEyeGaze(
  right: EyeLook | null,
  left: EyeLook | null,
): { x: number; y: number } | null {
  const eyes = [right, left].filter((eye): eye is EyeLook => {
    if (!eye) return false;
    return [eye.iris, eye.inner, eye.outer].every(
      (point) => point && Number.isFinite(point.x) && Number.isFinite(point.y),
    );
  });
  if (!eyes.length) return null;
  let sumX = 0;
  let sumY = 0;
  let used = 0;
  for (const eye of eyes) {
    const width = Math.hypot(eye.outer.x - eye.inner.x, eye.outer.y - eye.inner.y);
    if (!Number.isFinite(width) || width < 1e-6) continue;
    const centreX = (eye.inner.x + eye.outer.x) / 2;
    const centreY = (eye.inner.y + eye.outer.y) / 2;
    sumX += (eye.iris.x - centreX) / (width / 2);
    sumY += (eye.iris.y - centreY) / (width / 2);
    used += 1;
  }
  if (!used) return null;
  const clamp = (value: number) => Math.min(1, Math.max(-1, value));
  return { x: clamp(sumX / used), y: clamp(sumY / used) };
}

// ---------------------------------------------------------------------------
// Calibration — nine visual targets, fitted to real screen coordinates
// ---------------------------------------------------------------------------

export const CALIBRATION_MIN_SAMPLES = 6;
export const CALIBRATION_STEADY_SPREAD = 0.22;
export const CALIBRATION_TIMEOUT_MS = 60_000;
/** A single dot gets its own shorter timeout so a blocked target never leaves the user staring. */
export const CALIBRATION_TARGET_TIMEOUT_MS = 15_000;
export const CALIBRATION_HOLD_MS = 650;
export const CALIBRATION_MAX_SAMPLES = 18;
/** A blink or one dropped iris frame must not erase an otherwise steady look. */
export const CALIBRATION_SAMPLE_GAP_MS = 300;
/** Small, natural head movement during one fixation is allowed. */
export const CALIBRATION_HEAD_STEADY_SPREAD = 0.09;
/** How far the head may drift from the first fixation's pose during the run. */
export const CALIBRATION_HEAD_ANCHOR_TOLERANCE = 0.1;

export interface EyeCalibration {
  enabled: boolean;
  state: "idle" | "collecting" | "ready" | "failed";
  targets: GazeTarget[];
  /** Which target is currently being collected. */
  targetIndex: number;
  points: CalibrationPoint[];
  recent: GazeSample[];
  startedAt: number;
  /** When the current dot appeared; used for the per-dot timeout. */
  targetStartedAt: number;
  /** When the recent looks first became steady enough to commit a target. */
  steadySince: number;
  /** When the most recent readable gaze arrived. */
  lastGazeAt: number;
  /** Head pose from the first committed target; later targets must match it. */
  headAnchor: HeadPose | null;
  /** Whether the latest fixation is still near the starting head position. */
  headStable: boolean;
  /** One target being re-collected after a failed fit; null during a full run. */
  retryIndex: number | null;
  /** The least consistent target from the last fit, offered as a one-dot retry. */
  badIndex: number | null;
  model: GazeModel | null;
  /** Held-out fit error in normalised screen units. */
  rms: number | null;
  /** Why the last attempt stopped, if it did. */
  failReason: "timeout" | "fit" | "cancelled" | null;
}

export function newCalibration(): EyeCalibration {
  return {
    enabled: false,
    state: "idle",
    targets: CALIBRATION_TARGETS.map((target) => ({ ...target })),
    targetIndex: 0,
    points: [],
    recent: [],
    startedAt: 0,
    targetStartedAt: 0,
    steadySince: -1,
    lastGazeAt: 0,
    headAnchor: null,
    headStable: true,
    retryIndex: null,
    badIndex: null,
    model: null,
    rms: null,
    failReason: null,
  };
}

function resetCalibration(cal: EyeCalibration) {
  cal.enabled = false;
  cal.state = "idle";
  cal.targetIndex = 0;
  cal.points = [];
  cal.recent = [];
  cal.startedAt = 0;
  cal.targetStartedAt = 0;
  cal.steadySince = -1;
  cal.lastGazeAt = 0;
  cal.headAnchor = null;
  cal.headStable = true;
  cal.retryIndex = null;
  cal.badIndex = null;
  cal.model = null;
  cal.rms = null;
  cal.failReason = null;
}

function failCalibration(
  cal: EyeCalibration,
  rms: number | null = null,
  reason: "timeout" | "fit" | "cancelled" = "fit",
  badIndex: number | null = null,
) {
  cal.state = "failed";
  cal.model = null;
  cal.rms = rms;
  cal.failReason = reason;
  cal.badIndex = badIndex;
  cal.retryIndex = null;
  cal.recent = [];
  cal.steadySince = -1;
  cal.lastGazeAt = 0;
  // Keep the anchor so a one-dot retry can require the same head position.
  cal.headStable = true;
}

/** Start nine-target calibration from a clean slate. Refused while the gate is closed. */
export function startCalibration(cal: EyeCalibration, gate: EyeGate, now: number): boolean {
  resetCalibration(cal);
  if (!gateOpen(gate)) return false;
  cal.enabled = true;
  cal.state = "collecting";
  cal.startedAt = now;
  cal.targetStartedAt = now;
  cal.failReason = null;
  return true;
}

/**
 * Re-collect one target after a failed fit, keeping the other eight points.
 * This is an explicit user action, never an automatic skip: the replacement
 * point is required before the map is fitted again.
 */
export function retryCalibrationTarget(
  cal: EyeCalibration,
  gate: EyeGate,
  index: number,
  now: number,
): boolean {
  if (!gateOpen(gate)) return false;
  if (cal.points.length < cal.targets.length) return false;
  if (!Number.isInteger(index) || index < 0 || index >= cal.targets.length) return false;
  cal.enabled = true;
  cal.state = "collecting";
  cal.retryIndex = index;
  cal.targetIndex = index;
  cal.startedAt = now;
  cal.targetStartedAt = now;
  cal.recent = [];
  cal.steadySince = -1;
  cal.lastGazeAt = 0;
  cal.headStable = true;
  cal.model = null;
  cal.rms = null;
  cal.failReason = null;
  cal.badIndex = null;
  return true;
}

/** Stop an unfinished calibration without committing a map. */
export function cancelCalibration(cal: EyeCalibration) {
  resetCalibration(cal);
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function medianSample(samples: GazeSample[]): GazeSample {
  const heads = samples
    .map((sample) => sample.head)
    .filter((head): head is HeadPose => !!head && Number.isFinite(head.yaw) && Number.isFinite(head.pitch));
  return {
    x: median(samples.map((sample) => sample.x)),
    y: median(samples.map((sample) => sample.y)),
    head: heads.length
      ? {
          yaw: median(heads.map((head) => head.yaw)),
          pitch: median(heads.map((head) => head.pitch)),
          roll: median(heads.map((head) => head.roll)),
          scale: median(heads.map((head) => head.scale)),
        }
      : null,
  };
}

function span(values: number[]): number {
  return values.length ? Math.max(...values) - Math.min(...values) : Infinity;
}

function headNear(a: HeadPose, b: HeadPose): boolean {
  return (
    Math.abs(a.yaw - b.yaw) <= CALIBRATION_HEAD_ANCHOR_TOLERANCE &&
    Math.abs(a.pitch - b.pitch) <= CALIBRATION_HEAD_ANCHOR_TOLERANCE &&
    Math.abs(a.roll - b.roll) <= CALIBRATION_HEAD_ANCHOR_TOLERANCE &&
    Math.abs(a.scale - b.scale) <= CALIBRATION_HEAD_ANCHOR_TOLERANCE * 0.6
  );
}

function headStableIn(heads: HeadPose[], anchor: HeadPose | null): boolean {
  if (heads.length < CALIBRATION_MIN_SAMPLES) return true;
  const spread = Math.max(
    span(heads.map((head) => head.yaw)),
    span(heads.map((head) => head.pitch)),
    span(heads.map((head) => head.roll)),
    span(heads.map((head) => head.scale)) * 0.6,
  );
  if (spread > CALIBRATION_HEAD_STEADY_SPREAD) return false;
  return !anchor || heads.every((head) => headNear(head, anchor));
}

/**
 * One camera look. The target commits only after a short steady hold; then the
 * next target appears automatically. When all nine are collected the points
 * are fitted to a screen map and checked with leave-one-out error. A map that
 * cannot generalise is refused, so a bad calibration cannot move the pointer.
 */
export function calibrationStep(
  cal: EyeCalibration,
  gate: EyeGate,
  sample: GazeSample | null,
  now: number,
): EyeCalibration["state"] {
  if (cal.state !== "collecting") return cal.state;
  if (!gateOpen(gate)) {
    resetCalibration(cal);
    return cal.state;
  }
  if (now - cal.startedAt > CALIBRATION_TIMEOUT_MS) {
    failCalibration(cal, null, "timeout");
    return cal.state;
  }
  if (now - cal.targetStartedAt > CALIBRATION_TARGET_TIMEOUT_MS) {
    failCalibration(cal, null, "timeout");
    return cal.state;
  }
  if (!sample || !Number.isFinite(sample.x) || !Number.isFinite(sample.y)) {
    // A brief blink/dropout should not erase a fixation. Only a real gap
    // clears the window; the per-dot timeout still stops a blind wait.
    if (cal.lastGazeAt > 0 && now - cal.lastGazeAt <= CALIBRATION_SAMPLE_GAP_MS) return cal.state;
    cal.recent = [];
    cal.steadySince = -1;
    cal.lastGazeAt = 0;
    return cal.state;
  }
  if (cal.recent.length && cal.lastGazeAt > 0 && now - cal.lastGazeAt > CALIBRATION_SAMPLE_GAP_MS) {
    cal.recent = [];
    cal.steadySince = -1;
  }
  cal.recent.push({ x: sample.x, y: sample.y, head: sample.head ?? null });
  if (cal.recent.length > CALIBRATION_MAX_SAMPLES) {
    cal.recent.splice(0, cal.recent.length - CALIBRATION_MAX_SAMPLES);
  }
  cal.lastGazeAt = now;
  const recent = cal.recent.slice(-CALIBRATION_MIN_SAMPLES * 2);
  const xs = recent.map((look) => look.x);
  const ys = recent.map((look) => look.y);
  const heads = recent
    .map((look) => look.head)
    .filter((head): head is HeadPose => !!head && Number.isFinite(head.yaw) && Number.isFinite(head.pitch));
  const steady =
    xs.length >= CALIBRATION_MIN_SAMPLES &&
    span(xs) <= CALIBRATION_STEADY_SPREAD &&
    span(ys) <= CALIBRATION_STEADY_SPREAD;
  cal.headStable = headStableIn(heads, cal.headAnchor);
  if (!steady || !cal.headStable) {
    cal.steadySince = -1;
    // A fixation collected at a different head position cannot be mixed with
    // the current baseline. Clear it so returning to the anchor starts fresh.
    const anchor = cal.headAnchor;
    if (!cal.headStable && anchor && heads.some((head) => !headNear(head, anchor))) {
      cal.recent = [];
    }
    return cal.state;
  }
  if (cal.steadySince < 0) cal.steadySince = now;
  const held =
    now - cal.steadySince >= CALIBRATION_HOLD_MS &&
    cal.lastGazeAt > 0 &&
    now - cal.lastGazeAt <= 700;
  if (!held) return cal.state;

  const target = cal.retryIndex !== null
    ? cal.targets[cal.retryIndex]
    : cal.targets[cal.targetIndex];
  if (!target) {
    failCalibration(cal);
    return cal.state;
  }
  const committed = medianSample(recent);
  if (!cal.headAnchor && committed.head) cal.headAnchor = { ...committed.head };
  const committedPoint: CalibrationPoint = {
    target: { ...target },
    sample: committed,
    samples: recent.length,
    spread: Math.max(span(xs), span(ys)),
  };
  if (cal.retryIndex !== null) {
    cal.points[cal.retryIndex] = committedPoint;
    cal.retryIndex = null;
    cal.targetIndex = cal.targets.length;
  } else {
    cal.points.push(committedPoint);
    cal.targetIndex += 1;
  }
  cal.targetStartedAt = now;
  cal.recent = [];
  cal.steadySince = -1;
  cal.lastGazeAt = 0;
  if (cal.points.length < cal.targets.length) return cal.state;

  const model = fitGazeModel(cal.points);
  cal.rms = model?.rms ?? null;
  if (!model || model.rms > CALIBRATION_MAX_RMS) {
    failCalibration(cal, cal.rms, "fit", worstPointIndex(model, cal.points));
    return cal.state;
  }
  cal.badIndex = null;
  cal.model = model;
  cal.state = "ready";
  return cal.state;
}

/** The fixation with the largest error in the fitted map, for a one-dot retry. */
function worstPointIndex(model: GazeModel | null, points: CalibrationPoint[]): number | null {
  if (!model) return null;
  let worst: number | null = null;
  let worstError = -1;
  points.forEach((point, index) => {
    const predicted = predictGaze(model, point.sample);
    if (!predicted) return;
    const error = Math.hypot(predicted.x - point.target.x, predicted.y - point.target.y);
    if (error > worstError) {
      worstError = error;
      worst = index;
    }
  });
  return worst;
}

/**
 * Project a raw look onto the screen through the committed map. Null until a
 * map is ready, so nothing can move the pointer using an uncalibrated look.
 */
export function applyCalibration(
  cal: EyeCalibration | null | undefined,
  gaze: { x: number; y: number } | null,
  head: HeadPose | null = null,
): { x: number; y: number } | null {
  if (!gaze || !cal || !cal.model || cal.state !== "ready") return null;
  return predictGaze(cal.model, { x: gaze.x, y: gaze.y, head });
}

/** True when a calibration is committed and usable. */
export const calibrationReady = (cal: EyeCalibration) =>
  cal.state === "ready" && cal.model !== null;
