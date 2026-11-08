/**
 * The calibrated gaze map.
 *
 * One centre anchor can only remove a fixed offset; it cannot learn that a
 * person's iris moves farther up than down, that their left and right gains
 * differ, or how their face changes the reading. Those are the errors that
 * make a readable camera feel inaccurate.
 *
 * This module fits a small regularised polynomial map from the eye model's
 * raw gaze and face-pose readings to real screen coordinates. It is fitted
 * from the nine targets shown by EyeControl, evaluated with leave-one-point-
 * out error, and refuses to produce a map when the data is too inconsistent.
 *
 * The fit is robust: a single bad fixation (a blink, a glance away, a noisy
 * landmark frame) is down-weighted instead of pulling the whole map. Pure
 * arithmetic: no camera, storage or DOM. The calibration UI and tests can use
 * it without any side effects.
 */

export interface GazeTarget {
  x: number;
  y: number;
}

/** Face-pose readings are normalised geometry, not device angles. */
export interface HeadPose {
  yaw: number;
  pitch: number;
  roll: number;
  /** Apparent face size; changes with distance from the camera. */
  scale: number;
}

export interface GazeSample {
  /** Fused iris-in-eye horizontal reading, -1..1. */
  x: number;
  /** Fused iris-in-eye vertical reading, -1..1. */
  y: number;
  head?: HeadPose | null;
}

export interface CalibrationPoint {
  target: GazeTarget;
  sample: GazeSample;
  samples: number;
  spread: number;
}

export interface GazeModel {
  /** screenX = dot(xRow, featureVector(sample)). */
  xRow: number[];
  /** screenY = dot(yRow, featureVector(sample)). */
  yRow: number[];
  /** Leave-one-point-out error, normalised screen units. */
  rms: number;
  /** Error on the collected target medians (sanity check). */
  trainRms: number;
  withPose: boolean;
  /** A three-term plane, used when a full quadratic would overfit. */
  affine: boolean;
  sampleCount: number;
}

/**
 * The nine fixation targets, centre first. The centre target gives a natural
 * starting fixation; the remaining eight span the usable screen area. The
 * corners stay away from the extreme edge, where a webcam tends to lose the
 * iris and where a normal desktop rarely needs the cursor.
 *
 * The outer columns sit at 18% and 82%, and the bottom row at 70%, not at
 * the window edges. Looking that far down at 78% made some people's lower lid
 * cover the iris, which erased the horizontal signal on the two bottom outer
 * dots. Raising the row keeps the sideways look readable. The map still
 * extrapolates to every screen edge; this changes what is comfortable to
 * fixate, not the accuracy gate.
 */
export const CALIBRATION_TARGETS: GazeTarget[] = [
  { x: 0.5, y: 0.5 },
  { x: 0.18, y: 0.15 },
  { x: 0.5, y: 0.15 },
  { x: 0.82, y: 0.15 },
  { x: 0.18, y: 0.5 },
  { x: 0.82, y: 0.5 },
  { x: 0.18, y: 0.7 },
  { x: 0.5, y: 0.7 },
  { x: 0.82, y: 0.7 },
];

/** Refuse a map whose held-out error is worse than this fraction of the screen. */
export const CALIBRATION_MAX_RMS = 0.14;

const RIDGE = 0.02;
/** Ignore residual noise below this when deciding what counts as an outlier. */
const ROBUST_FLOOR = 0.012;
/** One bad target is down-weighted, never allowed to swing the whole map. */
const ROBUST_CUTOFF = 0.035;
const MIN_ROBUST_WEIGHT = 0.15;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** A compact feature vector: quadratic gaze + face pose, or a simple plane. */
function featureVector(sample: GazeSample, withPose: boolean, affine = false): number[] {
  if (affine) return [1, sample.x, sample.y];
  const head = sample.head ?? { yaw: 0, pitch: 0, roll: 0, scale: 0 };
  const vector = [
    1,
    sample.x,
    sample.y,
    sample.x * sample.x,
    sample.y * sample.y,
    sample.x * sample.y,
  ];
  if (withPose) vector.push(head.yaw, head.pitch);
  return vector;
}

function dot(a: number[], b: number[]): number {
  let total = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) total += a[i] * b[i];
  return total;
}

/** Gaussian elimination with partial pivoting. Null means a singular system. */
function solve(matrix: number[][], vector: number[]): number[] | null {
  const n = matrix.length;
  const augmented = matrix.map((row, i) => [...row, vector[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(augmented[row][col]) > Math.abs(augmented[pivot][col])) pivot = row;
    }
    if (Math.abs(augmented[pivot][col]) < 1e-10) return null;
    [augmented[col], augmented[pivot]] = [augmented[pivot], augmented[col]];
    const divisor = augmented[col][col];
    for (let j = col; j <= n; j++) augmented[col][j] /= divisor;
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = augmented[row][col];
      if (!factor) continue;
      for (let j = col; j <= n; j++) augmented[row][j] -= factor * augmented[col][j];
    }
  }
  return augmented.map((row) => row[n]);
}

interface AxisFit {
  row: number[];
  trainRms: number;
}

/**
 * Fit one screen axis. Features are standardised before the ridge solve so a
 * large head-pose term cannot swamp a small gaze term; coefficients are then
 * transformed back to the raw feature space used at prediction time. Optional
 * weights let the robust pass down-weight a fixation that does not agree with
 * the rest of the calibration.
 */
function fitAxis(
  points: CalibrationPoint[],
  axis: "x" | "y",
  withPose: boolean,
  weights?: number[],
  affine = false,
): AxisFit | null {
  if (points.length < 2) return null;
  const raw = points.map((point) => featureVector(point.sample, withPose, affine));
  const n = raw.length;
  const m = raw[0].length;
  const w = weights && weights.length === n ? weights : new Array(n).fill(1);
  const totalWeight = w.reduce((sum, weight) => sum + weight, 0);
  if (!(totalWeight > 0)) return null;
  const means = new Array(m).fill(0);
  const scales = new Array(m).fill(1);
  for (let j = 1; j < m; j++) {
    means[j] = raw.reduce((sum, row, i) => sum + w[i] * row[j], 0) / totalWeight;
    const variance = raw.reduce((sum, row, i) => sum + w[i] * (row[j] - means[j]) ** 2, 0) / totalWeight;
    const scale = Math.sqrt(variance);
    scales[j] = scale > 1e-8 ? scale : 1;
  }
  const design = raw.map((row) => row.map((value, j) => (j === 0 ? 1 : (value - means[j]) / scales[j])));
  const answers = points.map((point) => (axis === "x" ? point.target.x : point.target.y));
  const normal = Array.from({ length: m }, () => new Array(m).fill(0));
  const rhs = new Array(m).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      rhs[j] += w[i] * design[i][j] * answers[i];
      for (let k = 0; k < m; k++) normal[j][k] += w[i] * design[i][j] * design[i][k];
    }
  }
  for (let j = 1; j < m; j++) normal[j][j] += RIDGE;
  const coefficients = solve(normal, rhs);
  if (!coefficients) return null;
  const row = new Array(m).fill(0);
  row[0] = coefficients[0] - coefficients.slice(1).reduce((sum, weight, i) => sum + (weight * means[i + 1]) / scales[i + 1], 0);
  for (let j = 1; j < m; j++) row[j] = coefficients[j] / scales[j];
  let squared = 0;
  let used = 0;
  for (let i = 0; i < n; i++) {
    const predicted = dot(row, featureVector(points[i].sample, withPose, affine));
    const target = axis === "x" ? points[i].target.x : points[i].target.y;
    squared += w[i] * (predicted - target) ** 2;
    used += w[i];
  }
  return { row, trainRms: Math.sqrt(squared / Math.max(used, 1e-9)) };
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function predictRows(
  xRow: number[],
  yRow: number[],
  sample: GazeSample,
  withPose: boolean,
  affine: boolean,
): { x: number; y: number } {
  const vector = featureVector(sample, withPose, affine);
  return { x: clamp01(dot(xRow, vector)), y: clamp01(dot(yRow, vector)) };
}

interface RobustFit {
  xFit: AxisFit;
  yFit: AxisFit;
}

/**
 * Fit a map, then repeatedly down-weight fixations whose two-axis residual is
 * an outlier. The first pass is ordinary ridge; later passes use Huber-like
 * weights. On clean synthetic data the second pass changes nothing and stops
 * immediately, so this does not make an exact map wobble.
 */
function fitRobust(points: CalibrationPoint[], withPose: boolean, affine = false): RobustFit | null {
  let weights = new Array(points.length).fill(1);
  let xFit: AxisFit | null = null;
  let yFit: AxisFit | null = null;
  for (let iteration = 0; iteration < 4; iteration++) {
    xFit = fitAxis(points, "x", withPose, weights, affine);
    yFit = fitAxis(points, "y", withPose, weights, affine);
    if (!xFit || !yFit) return null;
    const residuals = points.map((point) => {
      const predicted = predictRows(xFit!.row, yFit!.row, point.sample, withPose, affine);
      return Math.hypot(predicted.x - point.target.x, predicted.y - point.target.y);
    });
    const scale = Math.max(ROBUST_FLOOR, median(residuals) * 1.4826);
    const cutoff = Math.max(ROBUST_CUTOFF, 2.5 * scale);
    let changed = false;
    weights = residuals.map((residual) => {
      if (!Number.isFinite(residual)) return 0;
      if (residual <= cutoff) return 1;
      const weight = Math.max(MIN_ROBUST_WEIGHT, cutoff / residual);
      if (weight < 0.999) changed = true;
      return weight;
    });
    if (!changed) break;
  }
  return xFit && yFit ? { xFit, yFit } : null;
}

/**
 * Leave-one-target-out error. This is deliberately held-out: an eight-
 * coefficient map can look perfect on its nine training points while being
 * useless between them. The error is in normalised screen units, so 0.05 is
 * roughly five percent of the screen in each direction.
 */
function heldOutRms(points: CalibrationPoint[], withPose: boolean, affine = false): number {
  if (points.length < 5) return Infinity;
  let squared = 0;
  for (let i = 0; i < points.length; i++) {
    const rest = points.filter((_, index) => index !== i);
    const fit = fitRobust(rest, withPose, affine);
    if (!fit) return Infinity;
    const predicted = predictRows(fit.xFit.row, fit.yFit.row, points[i].sample, withPose, affine);
    squared += (predicted.x - points[i].target.x) ** 2 + (predicted.y - points[i].target.y) ** 2;
  }
  return Math.sqrt(squared / points.length);
}

/** Fit the best of the pose-aware and pose-free maps, chosen by held-out error. */
export function fitGazeModel(points: CalibrationPoint[]): GazeModel | null {
  if (points.length < CALIBRATION_TARGETS.length) return null;
  const candidates: GazeModel[] = [];
  // Try the stable plane first as well as the richer maps: with only nine
  // points, a six-coefficient surface can memorise a single noisy fixation.
  for (const { withPose, affine } of [
    { withPose: false, affine: true },
    { withPose: false, affine: false },
    { withPose: true, affine: false },
  ]) {
    const fit = fitRobust(points, withPose, affine);
    if (!fit) continue;
    const rms = heldOutRms(points, withPose, affine);
    if (!Number.isFinite(rms)) continue;
    candidates.push({
      xRow: fit.xFit.row,
      yRow: fit.yFit.row,
      rms,
      trainRms: Math.sqrt((fit.xFit.trainRms ** 2 + fit.yFit.trainRms ** 2) / 2),
      withPose,
      affine,
      sampleCount: points.length,
    });
  }
  if (!candidates.length) return null;
  candidates.sort((a, b) => a.rms - b.rms);
  return candidates[0];
}

/** Apply a committed map. Returns null until a map is ready. */
export function predictGaze(
  model: GazeModel | null | undefined,
  sample: GazeSample,
): { x: number; y: number } | null {
  if (!model || !sample || !Number.isFinite(sample.x) || !Number.isFinite(sample.y)) return null;
  const predicted = predictRows(model.xRow, model.yRow, sample, model.withPose, model.affine);
  if (!Number.isFinite(predicted.x) || !Number.isFinite(predicted.y)) return null;
  return predicted;
}
