import { useEffect, useRef, useState } from "react";
import { api, emit, EV, on } from "../lib/ipc";
import type { AirSafety } from "../lib/types";
import {
  boostCameraForLowLight,
  cameraBrightness,
  openCamera,
} from "../lib/camera";
import {
  CALIBRATION_HOLD_MS,
  CALIBRATION_MIN_SAMPLES,
  CALIBRATION_STEADY_SPREAD,
  calibrationReady,
  cancelCalibration,
  calibrationStep,
  endGate,
  gateOpen,
  newCalibration,
  newEyeGate,
  requestGate,
  retryCalibrationTarget,
  startCalibration,
  type EyeCalibration,
} from "../lib/eyeGate";
import { createEyeTracker, type EyeFrame, type EyeGuide, type EyeTracker } from "../lib/eyeTrack";
import { FIXATION_MS, newValidation, summarizeValidation, validationStep, validationView, type ValidationState, type ValidationSummary } from "../lib/eyeControl";
import { CALIBRATION_MAX_RMS, CALIBRATION_TARGETS } from "../lib/eyeMap";
import {
  acceptGazeJump,
  eyeClickStep,
  newEyeClickState,
  newGazeJumpState,
  smoothEye,
  type EyeSensitivity,
  type EyeStatusPayload,
} from "../lib/eyeControl";

function within<T>(p: Promise<T>, ms: number, what: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    p,
    new Promise<never>((_, fail) => (timer = setTimeout(() => fail(new Error(`${what} (${Math.round(ms / 1000)} s)`)), ms))),
  ]).finally(() => clearTimeout(timer));
}

const NO_FACE = "No face — face the camera in good light.";

interface CalView {
  state: EyeCalibration["state"];
  point: number;
  total: number;
  samples: number;
  target: { x: number; y: number } | null;
  progress: number;
  quality: number | null;
  /** Valid gaze samples in the current fixation window. */
  recent: number;
  needed: number;
  /** Current fixation spread, normalised to the eye box. */
  spread: number;
  holdMs: number;
  /** Heuristic tracking quality, not a calibrated probability. */
  confidence: number;
  eyes: { left: boolean; right: boolean };
  /** The head has not drifted too far from the first fixation's pose. */
  headStable: boolean;
  /** One-based dot to re-collect after a failed fit, if known. */
  badDot: number | null;
  /** Plain-language explanation of what the calibration is waiting for. */
  reason: string;
}

/**
 * Eye control: the existing eye gate, face model and calibration drive the
 * real Windows pointer. It is mounted only while Air control is on and the
 * selected mode is Eye; mounting is the explicit session opt-in.
 *
 * Calibration is nine visual targets. Each target commits after a short steady
 * look and advances by itself; there is no click or click-and-hold. The fitted
 * map turns the raw iris reading into absolute screen coordinates. Until a map
 * passes its held-out error check, no pointer movement is allowed.
 *
 * One blink is never a click; the optional double-blink click also needs a
 * settled gaze, calibration ready, and a cooldown. The camera and worker stop
 * with this component.
 */
/** The calibration's and the accuracy check's Cancel, bottom right (clickable in the overlay). */
function CancelButton({ label, onCancel }: { label: string; onCancel: () => void }) {
  return (
    <button
      type="button"
      data-izk-hit
      onClick={onCancel}
      className="pointer-events-auto fixed bottom-3 right-4 z-[75] rounded-full border border-white/20 bg-black/80 px-3 py-1.5 text-[10.5px] font-semibold text-white/90 shadow-lg hover:bg-black"
    >
      {label}
    </button>
  );
}

/**
 * Always on screen while Eye Control runs: a Stop button the physical mouse
 * can reach (the native emergency stop, airsafe.rs), and why the eye pointer
 * is paused, with Resume. Driven by Rust's safety state, not by the tracker.
 */
function EyeSafetyBar() {
  const [safety, setSafety] = useState<AirSafety | null>(null);
  const [stopFailed, setStopFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    void api.airSafety().then((s) => alive && setSafety(s)).catch(() => undefined);
    const off = on<AirSafety>(EV.airSafety, (s) => {
      if (alive) setSafety(s);
    });
    return () => {
      alive = false;
      void off.then((f) => f()).catch(() => undefined);
    };
  }, []);
  const key = safety?.stop_key ?? "Ctrl+Alt+Shift+X";
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[80] flex max-w-[340px] flex-col items-end gap-1.5">
      <button
        type="button"
        data-izk-hit
        onClick={() => {
          setStopFailed(false);
          // A Stop that didn't get through must say so, with the keyboard fallback.
          void api.airStop().catch(() => setStopFailed(true));
        }}
        className="pointer-events-auto rounded-full bg-rose-600 px-4 py-2 text-[12px] font-bold text-white shadow-xl ring-2 ring-white/70 hover:bg-rose-500"
        title={`Stops Eye Control at once and turns Air control off. Keyboard: ${key}. Voice: "stop eye control".`}
      >
        ■ Stop eye control <span className="font-normal opacity-85">({key})</span>
      </button>
      {stopFailed && (
        <div className="rounded-2xl bg-rose-100 px-3 py-1.5 text-right text-[11px] font-bold text-rose-900 shadow-xl">
          The Stop button didn't get through. Press {key} or Ctrl+Shift+Q now.
        </div>
      )}
      {safety?.paused && !safety.stopped && (
        <div className="pointer-events-auto rounded-2xl bg-amber-400 px-3 py-2 text-right text-[11px] font-semibold leading-snug text-black shadow-xl">
          Eye pointer paused: {safety.paused}.
          <button
            type="button"
            data-izk-hit
            onClick={() => void api.airResume().catch(() => undefined)}
            className="ml-2 rounded-full bg-black/85 px-2.5 py-0.5 text-[10.5px] text-white hover:bg-black"
          >
            Resume
          </button>
        </div>
      )}
      {safety && !safety.ready && !safety.stopped && (
        <div className="rounded-2xl bg-rose-100 px-3 py-1.5 text-right text-[10.5px] font-semibold text-rose-900 shadow-xl">
          The emergency stop isn't running, so the eye pointer won't move.
        </div>
      )}
    </div>
  );
}

export function EyeControl({ sensitivity, clicks }: { sensitivity: EyeSensitivity; clicks: boolean }) {
  /** The accuracy check's dot on screen (null when no check is running). */
  const [checkView, setCheckView] = useState<{ target: { x: number; y: number }; point: number; total: number; progress: number } | null>(null);
  const sensitivityRef = useRef(sensitivity);
  sensitivityRef.current = sensitivity;
  const clicksRef = useRef(clicks);
  clicksRef.current = clicks;
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const guideCanvas = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState("Starting eye control…");
  const [showGuide, setShowGuide] = useState(true);
  const showGuideRef = useRef(showGuide);
  showGuideRef.current = showGuide;
  // Calibration controls live in this window. Call the exact same functions
  // directly instead of relying on a same-window Tauri event round-trip.
  const retryAction = useRef<((index: number) => void) | null>(null);
  const restartAction = useRef<(() => void) | null>(null);
  const cancelAction = useRef<(() => void) | null>(null);
  const [calView, setCalView] = useState<CalView>({
    state: "idle",
    point: 0,
    total: CALIBRATION_TARGETS.length,
    samples: 0,
    target: null,
    progress: 0,
    quality: null,
    recent: 0,
    needed: CALIBRATION_MIN_SAMPLES,
    spread: 0,
    holdMs: 0,
    confidence: 0,
    eyes: { left: false, right: false },
    headStable: true,
    badDot: null,
    reason: "Camera starting — face the camera.",
  });
  const [sight, setSight] = useState({ face: false, eyes: false });
  const [light, setLight] = useState<number | null>(null);
  const [camName, setCamName] = useState("");
  /** Another camera was picked in Settings. */
  const [camKey, setCamKey] = useState(0);

  useEffect(() => {
    let alive = true;
    let stream: MediaStream | null = null;
    let tracker: EyeTracker | null = null;
    let lowTimer: ReturnType<typeof setInterval> | undefined;
    let calTimer: ReturnType<typeof setInterval> | undefined;
    let readyForCalibration = false;
    let lastFrameAt = 0;
    let steadySince = performance.now();
    let runtimeStopped = false;
    let endedHandler: (() => void) | null = null;
    let lastFace = 0;
    let calAt = 0;
    let clickAt = 0;
    let lastPublish = "";
    let lastTellAt = 0;
    let faceNow = false;
    let autoFaceStatus = false;
    let calHadGaze = false;
    let latestEyes = { left: false, right: false };
    let latestGaze = false;
    let latestFrame: EyeFrame | null = null;
    // The accuracy check after calibration, and its verdict: only a passed
    // check lets the real mouse follow the eyes.
    let check: ValidationState | null = null;
    let verdict: ValidationSummary | null = null;
    let checkShown = -1;
    const markSight = (face: boolean, eyes: boolean) => {
      setSight((prev) => (prev.face === face && prev.eyes === eyes ? prev : { face, eyes }));
    };
    const pointer = { x: 0.5, y: 0.5 };
    const clickState = newEyeClickState();
    let jumpState = newGazeJumpState();
    const gate = newEyeGate();
    // Choosing Eye + turning Air on is the explicit session opt-in. This is
    // never saved and ends when the component (or the app) closes.
    requestGate(gate, "session", true);
    const cal = newCalibration();
    // A camera switch restarts this effect. Clear the previous session's
    // calibration marker and cursor so a half-finished calibration cannot
    // stay on screen after the camera changes.
    setCheckView(null);
    setCalView({
      state: "idle",
      point: 0,
      total: cal.targets.length,
      samples: 0,
      target: null,
      progress: 0,
      quality: null,
      recent: 0,
      needed: CALIBRATION_MIN_SAMPLES,
      spread: 0,
      holdMs: 0,
      confidence: 0,
      eyes: { left: false, right: false },
      headStable: true,
      badDot: null,
      reason: "Opening the camera…",
    });
    const oldCanvas = canvas.current;
    if (oldCanvas) oldCanvas.getContext("2d")?.clearRect(0, 0, oldCanvas.width, oldCanvas.height);

    const tell = (payload: EyeStatusPayload) => {
      const key = JSON.stringify(payload);
      if (key === lastPublish) return;
      const now = performance.now();
      // Calibration samples update every camera frame. Sending one event per
      // frame makes Settings repaint its whole page; five a second is enough
      // for the progress bar and keeps the UI usable on a laptop.
      if (payload.state === "calibrating" && now - lastTellAt < 200) return;
      lastPublish = key;
      lastTellAt = now;
      void emit(EV.airEyeStatus, payload).catch(() => undefined);
    };

    /**
     * Mirror the pure calibration state into React. Progress is rounded to a
     * 5% step so the overlay updates smoothly without repainting Settings.
     */
    const syncCalView = (now: number) => {
      const target = cal.state === "collecting" ? cal.targets[cal.targetIndex] ?? null : null;
      const point = cal.state === "collecting"
        ? Math.min(cal.targetIndex + 1, cal.targets.length)
        : cal.points.length;
      const progress = target && cal.steadySince >= 0
        ? Math.min(1, Math.max(0, (now - cal.steadySince) / CALIBRATION_HOLD_MS))
        : 0;
      const rounded = Math.round(progress * 20) / 20;
      const targetView = target ? { x: target.x, y: target.y } : null;
      const recent = cal.state === "collecting" ? cal.recent.slice(-CALIBRATION_MIN_SAMPLES * 2) : [];
      const xs = recent.map((look) => look.x);
      const ys = recent.map((look) => look.y);
      const spread = recent.length
        ? Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys))
        : 0;
      const spreadRounded = Math.round(spread * 100) / 100;
      const holdMs = cal.steadySince >= 0 ? Math.max(0, now - cal.steadySince) : 0;
      const holdRounded = Math.round(holdMs / 100) * 100;
      const anyEye = latestEyes.left || latestEyes.right;
      // This is a UI quality signal (both irises plus fixation spread), not a
      // calibrated probability of a correct screen point.
      const confidence = !latestGaze
        ? 0
        : Math.round((latestEyes.left && latestEyes.right ? 95 : 55) * (1 - Math.min(1, spread / CALIBRATION_STEADY_SPREAD) * 0.35));
      let reason: string;
      if (cal.state === "collecting") {
        if (!faceNow) reason = "No face — centre your face in the camera.";
        else if (!anyEye) reason = "Face seen, but iris landmarks are missing — move closer or add light.";
        else if (!latestGaze) reason = "Irises visible, but this look is not readable — hold still on the dot.";
        else if (!cal.headStable) reason = "Head moved a little too far — ease back toward the starting position. Small movement is fine.";
        else if (recent.length < CALIBRATION_MIN_SAMPLES) reason = `Collecting gaze: ${recent.length} of ${CALIBRATION_MIN_SAMPLES} valid looks…`;
        else if (spread > CALIBRATION_STEADY_SPREAD) reason = "Gaze is moving — settle on the dot and hold still.";
        else if (holdMs < CALIBRATION_HOLD_MS) reason = `Steady — hold for ${Math.max(0.1, Math.ceil((CALIBRATION_HOLD_MS - holdMs) / 100) / 10).toFixed(1)} s more.`;
        else reason = "Saving this dot…";
      } else if (cal.state === "failed") {
        reason = cal.failReason === "timeout"
          ? "This dot timed out — press Retry or Cancel. No automatic skipping."
          : cal.badIndex !== null
            ? `Dot ${cal.badIndex + 1} didn't match the others — retry just that dot, or retry all.`
            : "The fitted map was not accurate enough — press Retry or Cancel.";
      } else if (cal.state === "ready") {
        reason = "Calibration ready — look to steer.";
      } else if (!faceNow) {
        reason = "No face — centre your face in the camera.";
      } else if (!latestGaze) {
        reason = anyEye ? "Eyes seen — waiting for a stable iris reading." : "Face seen — waiting for both iris landmarks.";
      } else {
        reason = "Eyes tracked — press Calibrate when ready.";
      }
      const devBuild = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV;
      if (devBuild) {
        (window as Window & { __izukiEyeCal?: unknown }).__izukiEyeCal = {
          state: cal.state,
          rms: cal.rms,
          failReason: cal.failReason,
          targetIndex: cal.targetIndex,
          points: cal.points,
          gaze: latestFrame?.gaze ?? null,
          eyes: latestFrame?.eyes ?? latestEyes,
          headStable: cal.headStable,
          retryIndex: cal.retryIndex,
          badIndex: cal.badIndex,
          guide: latestFrame?.guide ?? null,
        };
      }
      setCalView((prev) => {
        if (
          prev.state === cal.state &&
          prev.point === point &&
          prev.samples === cal.points.length &&
          prev.progress === rounded &&
          prev.quality === cal.rms &&
          prev.target?.x === targetView?.x &&
          prev.target?.y === targetView?.y &&
          prev.recent === recent.length &&
          prev.needed === CALIBRATION_MIN_SAMPLES &&
          prev.spread === spreadRounded &&
          prev.holdMs === holdRounded &&
          prev.confidence === confidence &&
          prev.eyes.left === latestEyes.left &&
          prev.eyes.right === latestEyes.right &&
          prev.headStable === cal.headStable &&
          prev.badDot === cal.badIndex &&
          prev.reason === reason
        ) {
          return prev;
        }
        return {
          state: cal.state,
          point,
          total: cal.targets.length,
          samples: cal.points.length,
          target: targetView,
          progress: rounded,
          quality: cal.rms,
          recent: recent.length,
          needed: CALIBRATION_MIN_SAMPLES,
          spread: spreadRounded,
          holdMs: holdRounded,
          confidence,
          eyes: { ...latestEyes },
          headStable: cal.headStable,
          badDot: cal.badIndex,
          reason,
        };
      });
    };

    const draw = (show: boolean) => {
      const c = canvas.current;
      if (!c) return;
      const W = window.innerWidth;
      const H = window.innerHeight;
      if (c.width !== W || c.height !== H) {
        c.width = W;
        c.height = H;
      }
      const g = c.getContext("2d");
      if (!g) return;
      g.clearRect(0, 0, W, H);
      if (!show) return;
      const px = pointer.x * W;
      const py = pointer.y * H;
      // The dark under-stroke keeps the eye cursor visible on white pages.
      g.beginPath();
      g.arc(px, py, 13, 0, Math.PI * 2);
      g.strokeStyle = "rgba(0,0,0,0.8)";
      g.lineWidth = 6;
      g.stroke();
      g.strokeStyle = "rgba(94,231,255,0.98)";
      g.lineWidth = 2.5;
      g.shadowColor = "rgba(94,231,255,0.75)";
      g.shadowBlur = 8;
      g.stroke();
      g.shadowBlur = 0;
      g.beginPath();
      g.arc(px, py, 2.5, 0, Math.PI * 2);
      g.fillStyle = "rgba(255,255,255,0.98)";
      g.fill();
    };

    /**
     * Draw the same face/eye landmarks the worker read, on the mirrored
     * preview. This is optional and uses the existing model output; it never
     * starts a second model or sends landmarks anywhere.
     */
    const drawGuide = (guide: EyeGuide | null) => {
      const c = guideCanvas.current;
      if (!c) return;
      const w = c.clientWidth;
      const h = c.clientHeight;
      if (!w || !h) return;
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
      const g = c.getContext("2d");
      if (!g) return;
      g.clearRect(0, 0, w, h);
      if (!showGuideRef.current || !guide) return;
      const v = video.current;
      const vw = v?.videoWidth || 640;
      const vh = v?.videoHeight || 480;
      if (!vw || !vh) return;
      // The video is object-cover and mirrored; map source points through the
      // same crop and flip so the guide sits on the actual face.
      const scale = Math.max(w / vw, h / vh);
      const dw = vw * scale;
      const dh = vh * scale;
      const ox = (w - dw) / 2;
      const oy = (h - dh) / 2;
      const map = (p: { x: number; y: number }) => ({
        x: ox + (1 - p.x) * dw,
        y: oy + p.y * dh,
      });
      const path = (pts: EyeGuide["face"], color: string, width: number, close = false) => {
        if (pts.length < 2) return;
        g.beginPath();
        pts.forEach((p, i) => {
          const q = map(p);
          if (i === 0) g.moveTo(q.x, q.y);
          else g.lineTo(q.x, q.y);
        });
        if (close) g.closePath();
        g.strokeStyle = color;
        g.lineWidth = width;
        g.stroke();
      };
      g.lineCap = "round";
      g.lineJoin = "round";
      path(guide.face, "rgba(255,255,255,0.32)", 1, true);
      path(guide.rightEye, "rgba(94,231,255,0.95)", 1.2, true);
      path(guide.leftEye, "rgba(94,231,255,0.95)", 1.2, true);
      path(guide.rightBrow, "rgba(196,168,255,0.75)", 1);
      path(guide.leftBrow, "rgba(196,168,255,0.75)", 1);
      path(guide.lips, "rgba(255,196,128,0.65)", 1, true);
      for (const iris of [guide.rightIris, guide.leftIris]) {
        if (!iris.length) continue;
        path(iris, "rgba(255,255,255,0.95)", 1.2, true);
        const center = map(iris[0]);
        g.beginPath();
        g.arc(center.x, center.y, 1.8, 0, Math.PI * 2);
        g.fillStyle = "rgba(94,231,255,1)";
        g.fill();
      }
    };

    /**
     * A worker/model error or a camera that disappears must release the
     * camera, close the gate and stop sending cursor positions. Keeping the
     * last preview or a stale status alive would look like tracking is still
     * working when it is not.
     */
    const stopWithError = (why: string) => {
      if (!alive || runtimeStopped) return;
      runtimeStopped = true;
      readyForCalibration = false;
      faceNow = false;
      lastFace = 0;
      autoFaceStatus = false;
      // An error ends any accuracy check: no dot left on screen, no verdict kept.
      check = null;
      verdict = null;
      setCheckView(null);
      clearInterval(lowTimer);
      clearInterval(calTimer);
      lowTimer = undefined;
      calTimer = undefined;
      setSight({ face: false, eyes: false });
      setLight(null);
      cancelCalibration(cal);
      syncCalView(performance.now());
      draw(false);
      const message = `Eye Control stopped — ${why}`;
      setStatus(message);
      tell({
        state: "error",
        message,
        face: false,
        calibrated: false,
        clicks: clicksRef.current,
      });
      tracker?.stop();
      stream?.getTracks().forEach((track) => track.stop());
      if (video.current?.srcObject === stream) video.current.srcObject = null;
      endGate(gate, "session");
    };

    const failMessage = () => {
      const dot = Math.min(cal.targetIndex + 1, cal.targets.length);
      if (cal.failReason === "timeout") {
        return calHadGaze
          ? `Calibration timed out on dot ${dot} — hold your look still, then retry.`
          : `Calibration timed out on dot ${dot} — irises weren't readable. Move closer, add light, then retry.`;
      }
      if (cal.badIndex !== null) {
        return `Dot ${cal.badIndex + 1} didn't match the other targets. Retry just that dot, or retry all.`;
      }
      return calHadGaze
        ? "Calibration couldn't make a stable map — keep your head near the starting position and try again."
        : "Calibration couldn't read your eyes — centre your face in the preview and add light.";
    };

    const startCal = () => {
      if (!readyForCalibration) {
        setStatus("The eye camera is still starting — try Calibrate again in a moment.");
        return;
      }
      if (runtimeStopped) {
        setStatus("Eye Control stopped — turn Air control off and on to retry.");
        return;
      }
      if (!faceNow) {
        setStatus("No face — centre your face in the preview, then press Calibrate.");
        tell({
          state: "no-face",
          message: "No face — centre your face in the preview, then press Calibrate.",
          face: false,
          calibrated: false,
          clicks: clicksRef.current,
        });
        return;
      }
      if (!gateOpen(gate)) return;
      if (!startCalibration(cal, gate, performance.now())) return;
      check = null;
      verdict = null;
      setCheckView(null);
      calHadGaze = false;
      jumpState = newGazeJumpState();
      calAt = performance.now();
      const target = cal.targets[0] ?? null;
      setCalView({
        state: "collecting",
        point: 1,
        total: cal.targets.length,
        samples: 0,
        target: target ? { x: target.x, y: target.y } : null,
        progress: 0,
        quality: null,
        recent: 0,
        needed: CALIBRATION_MIN_SAMPLES,
        spread: 0,
        holdMs: 0,
        confidence: latestGaze ? (latestEyes.left && latestEyes.right ? 95 : 55) : 0,
        eyes: { ...latestEyes },
        headStable: true,
        badDot: null,
        reason: "Look at the dot. Keep your head near the start; small movement is okay.",
      });
      const message = "Look at each dot. Keep your head near the start; small movement is okay. It advances by itself — no clicking or holding.";
      setStatus(message);
      tell({
        state: "calibrating",
        message,
        face: faceNow,
        calibrated: false,
        clicks: clicksRef.current,
        samples: 0,
        step: 1,
        total: cal.targets.length,
      });
    };

    const retryCal = (index: number) => {
      if (!readyForCalibration || runtimeStopped || !Number.isInteger(index)) return;
      if (!retryCalibrationTarget(cal, gate, index, performance.now())) return;
      check = null;
      verdict = null;
      setCheckView(null);
      calHadGaze = false;
      autoFaceStatus = false;
      jumpState = newGazeJumpState();
      calAt = performance.now();
      const target = cal.targets[index] ?? null;
      const message = `Retrying dot ${index + 1}. Keep your head near the starting position; small movement is okay.`;
      setCalView({
        state: "collecting",
        point: index + 1,
        total: cal.targets.length,
        samples: cal.points.length,
        target: target ? { x: target.x, y: target.y } : null,
        progress: 0,
        quality: null,
        recent: 0,
        needed: CALIBRATION_MIN_SAMPLES,
        spread: 0,
        holdMs: 0,
        confidence: latestGaze ? (latestEyes.left && latestEyes.right ? 95 : 55) : 0,
        eyes: { ...latestEyes },
        headStable: true,
        badDot: null,
        reason: message,
      });
      setStatus(message);
      tell({
        state: "calibrating",
        message,
        face: faceNow,
        calibrated: false,
        clicks: clicksRef.current,
        samples: cal.points.length,
        step: index + 1,
        total: cal.targets.length,
      });
    };

    const cancelCal = () => {
      if (runtimeStopped) return;
      if (check && !check.done) {
        check = null;
        verdict = null;
        setCheckView(null);
        autoFaceStatus = false;
        const message = "Accuracy check cancelled. Preview only: the mouse doesn't move. Press Calibrate eyes to try again.";
        setStatus(message);
        tell({ state: "ready", message, face: faceNow, calibrated: true, clicks: false, mode: "preview" });
        return;
      }
      if (cal.state !== "collecting") return;
      cancelCalibration(cal);
      calHadGaze = false;
      autoFaceStatus = false;
      syncCalView(performance.now());
      draw(false);
      const message = "Calibration cancelled. Press Calibrate eyes when you're ready.";
      setStatus(message);
      tell({
        state: faceNow ? "tracking" : "no-face",
        message,
        face: faceNow,
        calibrated: false,
        clicks: clicksRef.current,
        samples: 0,
      });
    };

    const onFrame = (f: EyeFrame) => {
      if (!alive || runtimeStopped) return;
      latestFrame = f;
      const now = f.t || performance.now();
      lastFace = now;
      faceNow = true;
      latestEyes = f.eyes ?? { left: !!f.gaze, right: !!f.gaze };
      latestGaze = !!f.gaze;
      markSight(true, !!f.gaze);
      drawGuide(f.guide);
      if (cal.state === "collecting" && f.gaze) calHadGaze = true;
      if (cal.state !== "collecting") syncCalView(now);

      if (cal.state === "collecting") {
        const sample = f.gaze ? { x: f.gaze.x, y: f.gaze.y, head: f.head } : null;
        const state = calibrationStep(cal, gate, sample, now);
        syncCalView(now);
        if (state === "ready") {
          autoFaceStatus = true;
          // The first moment after calibration is a settling period, not a click.
          calAt = now + 850;
          lastFrameAt = now;
          steadySince = now;
          const quality = cal.rms;
          // Fitted — but fitting its own dots isn't accuracy. Check it on five
          // fresh dots before the real mouse may follow the eyes.
          check = newValidation(now);
          verdict = null;
          checkShown = -1;
          const message = "Calibration fitted. Now an accuracy check: look at each new dot. The mouse doesn't move during the check.";
          setStatus(message);
          tell({
            state: "calibrating",
            message,
            face: true,
            calibrated: true,
            clicks: clicksRef.current,
            samples: cal.points.length,
            quality: quality ?? undefined,
            mode: "checking",
          });
          draw(true);
          return;
        }
        if (state === "failed") {
          const why = failMessage();
          autoFaceStatus = true;
          syncCalView(now);
          setStatus(why);
          tell({
            state: "failed",
            message: why,
            face: true,
            calibrated: false,
            clicks: clicksRef.current,
            samples: cal.points.length,
            quality: cal.rms ?? undefined,
          });
          draw(false);
          return;
        }
        const point = Math.min(cal.targetIndex + 1, cal.targets.length);
        const message = `Look at dot ${point} of ${cal.targets.length}. No clicking — it advances by itself.`;
        setStatus(message);
        tell({
          state: "calibrating",
          message,
          face: true,
          calibrated: false,
          clicks: clicksRef.current,
          samples: cal.points.length,
          step: point,
          total: cal.targets.length,
        });
        return;
      }

      if (!calibrationReady(cal)) {
        draw(false);
        if (cal.state === "failed") {
          if (!autoFaceStatus) {
            autoFaceStatus = true;
            const why = failMessage();
            setStatus(why);
            tell({
              state: "failed",
              message: why,
              face: true,
              calibrated: false,
              clicks: clicksRef.current,
              samples: cal.points.length,
              quality: cal.rms ?? undefined,
            });
          }
          return;
        }
        if (!autoFaceStatus) {
          autoFaceStatus = true;
          setStatus("Eyes seen — calibrate to steer.");
          tell({
            state: "tracking",
            message: "Eyes seen. Press Calibrate eyes to steer.",
            face: true,
            calibrated: false,
            clicks: clicksRef.current,
          });
        }
        return;
      }

      if (!f.screen) {
        draw(true);
        setStatus("Eyes seen — looking for the screen point.");
        return;
      }

      const target = f.screen;
      if (!Number.isFinite(target.x) || !Number.isFinite(target.y)) {
        draw(true);
        return;
      }
      if (check && !check.done) {
        // The raw estimate, not the smoothed cursor: what's measured is the map.
        const finished = validationStep(check, target, now);
        const view = validationView(check, now);
        const shown = view ? view.point * 10 + Math.floor(view.progress * 10) : -2;
        if (shown !== checkShown) {
          checkShown = shown;
          setCheckView(view);
        }
        pointer.x = target.x;
        pointer.y = target.y;
        draw(true);
        if (finished) {
          verdict = summarizeValidation(check.dots);
          setCheckView(null);
          calAt = now + 850;
          steadySince = now;
          setStatus(verdict.reason);
          tell({
            state: "ready",
            message: verdict.reason,
            face: true,
            calibrated: true,
            clicks: clicksRef.current && verdict.pass,
            samples: cal.points.length,
            quality: cal.rms ?? undefined,
            accuracy: Number.isFinite(verdict.accuracy) ? verdict.accuracy : undefined,
            jitter: Number.isFinite(verdict.jitter) ? verdict.jitter : undefined,
            mode: verdict.pass ? "pointer" : "preview",
          });
        }
        return;
      }
      const accepted = acceptGazeJump(jumpState, target);
      if (!accepted) {
        draw(true);
        return;
      }
      const dt = now - lastFrameAt;
      lastFrameAt = now;
      const previousX = pointer.x;
      const previousY = pointer.y;
      const next = smoothEye(pointer, accepted, dt, sensitivityRef.current);
      pointer.x = next.x;
      pointer.y = next.y;
      // A real saccade must reset the click-settle timer. Measure the
      // smoothed cursor, not the raw prediction: one noisy mapped frame
      // should not make a settled gaze look like it is still moving.
      if (Math.hypot(pointer.x - previousX, pointer.y - previousY) > 0.006) steadySince = now;
      // `true`: the gaze pointer. Rust checks it every move (airsafe.rs): the
      // person moving the mouse or typing pauses it, erratic tracking pauses
      // it, and nothing moves while the emergency stop isn't running.
      // Only a passed accuracy check moves the real mouse, and only to a
      // steady look (not every flicker); otherwise the cursor is just drawn.
      const pointerMode = !!verdict?.pass;
      if (pointerMode && now > calAt && now - steadySince >= FIXATION_MS) void api.airPointer(pointer.x, pointer.y, true).catch(() => undefined);
      draw(true);

      const steady = now - steadySince >= 500;
      if (pointerMode && eyeClickStep(clickState, {
        blink: f.blink,
        now,
        enabled: clicksRef.current,
        ready: true,
        steady,
      })) {
        if (now - clickAt > 900) {
          clickAt = now;
          setStatus("Clicked — eyes steady.");
          // Always let go, whatever the press did; say so if that fails
          // (the native watchdog also lets go of an eye-held button after 1.5 s).
          void api
            .airButton(false, true)
            .catch(() => undefined)
            .finally(() => {
              void api.airButton(false, false).catch(() => setStatus("Couldn't let go of the mouse button — click once with the real mouse."));
            });
          tell({
            state: "ready",
            message: "Clicked. Keep looking to steer.",
            face: true,
            calibrated: true,
            clicks: true,
          });
        }
      }

      if (!autoFaceStatus) {
        autoFaceStatus = true;
        const message = !pointerMode
          ? verdict?.reason ?? "Preview only: the mouse doesn't move."
          : clicksRef.current
            ? "Eye control on — look and hold to steer, double blink to click."
            : "Eye control on — look and hold to steer.";
        setStatus(message);
        tell({
          state: "ready",
          message,
          face: true,
          calibrated: true,
          clicks: clicksRef.current && pointerMode,
          mode: pointerMode ? "pointer" : "preview",
          accuracy: verdict && Number.isFinite(verdict.accuracy) ? verdict.accuracy : undefined,
          jitter: verdict && Number.isFinite(verdict.jitter) ? verdict.jitter : undefined,
        });
      }
    };

    const onMissing = (t: number) => {
      if (!alive || runtimeStopped) return;
      latestEyes = { left: false, right: false };
      latestGaze = false;
      drawGuide(null);
      markSight(false, false);
      const hadFace = faceNow;
      faceNow = false;
      syncCalView(performance.now());
      if (cal.state === "collecting") {
        autoFaceStatus = false;
        setStatus("No face — look at the camera to calibrate.");
        tell({
          state: "calibrating",
          message: "No face — look at the camera to calibrate.",
          face: false,
          calibrated: false,
          clicks: clicksRef.current,
          samples: cal.points.length,
          step: Math.min(cal.targetIndex + 1, cal.targets.length),
          total: cal.targets.length,
        });
        return;
      }
      if (hadFace) {
        autoFaceStatus = false;
        draw(false);
      }
      // Don't let one blurred frame erase the status; the worker reports a
      // missing face on every look, and the status event is deduplicated.
      if (performance.now() - lastFace < 350) return;
      setStatus(NO_FACE);
      tell({
        state: "no-face",
        message: NO_FACE,
        face: false,
        calibrated: calibrationReady(cal),
        clicks: clicksRef.current,
      });
      void t;
    };

    const offCal = on<void>(EV.airEyeCalibrate, startCal);
    const offRetry = on<number>(EV.airEyeRetry, retryCal);
    const offCancel = on<void>(EV.airEyeCancel, cancelCal);
    const offCam = on<void>(EV.airCamera, () => setCamKey((k) => k + 1));
    retryAction.current = retryCal;
    restartAction.current = startCal;
    cancelAction.current = cancelCal;

    (async () => {
      try {
        setStatus("Opening the camera…");
        tell({ state: "starting", message: "Opening the camera…", face: false, calibrated: false, clicks: clicksRef.current });
        const opening = openCamera(null, { width: 640, height: 480 });
        // Given up on (it failed, timed out, or Eye Control closed meanwhile):
        // a camera that answers late is turned straight off, never left on.
        let gaveUp = false;
        void opening.then((c) => {
          if (gaveUp || !alive) c.stream.getTracks().forEach((track) => track.stop());
        }).catch(() => undefined);
        let cam: Awaited<typeof opening>;
        try {
          cam = await within(opening, 12_000, "the camera didn't answer");
        } catch (e) {
          gaveUp = true;
          throw e;
        }
        if (!alive) {
          cam.stream.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = cam.stream;
        setCamName(cam.label);
        const onEnded = () => stopWithError("the camera disconnected.");
        endedHandler = onEnded;
        stream.getVideoTracks().forEach((track) => track.addEventListener("ended", onEnded));
        const v = video.current;
        if (!v) throw new Error("the camera preview element is missing");
        v.srcObject = stream;
        await within(v.play(), 8000, "the camera picture didn't start");
        // Measure the live picture: continuous exposure/focus always helps,
        // but the extra exposure is applied only when the room is dark.
        await within(boostCameraForLowLight(stream, v), 4000, "camera low-light settings").catch(() => false);

        setStatus("Loading eye tracking…");
        tracker = createEyeTracker({ gate, stream, video: v, calibration: cal });
        if (!tracker) throw new Error("the eye gate is closed");
        tracker.onError((message) => stopWithError(message));
        tracker.onFrames(onFrame);
        tracker.onMissing(onMissing);
        const engine = await within(tracker.ready(), 60_000, "eye tracking didn't load");
        if (!alive) return;
        readyForCalibration = true;
        setStatus("Face the camera, then calibrate.");
        tell({
          state: "no-face",
          message: "Face the camera, then press Calibrate eyes.",
          face: false,
          calibrated: false,
          clicks: clicksRef.current,
          engine,
        });
        // Continuous low-light status: it never overwrites a live face.
        const firstLight = cameraBrightness(video.current);
        if (firstLight !== null) setLight(Math.round(firstLight));
        lowTimer = setInterval(() => {
          if (!alive || runtimeStopped) return;
          const level = cameraBrightness(video.current);
          if (level !== null) setLight(Math.round(level));
          if (performance.now() - lastFace < 1500) return;
          if (level !== null && level < 46) {
            setStatus("Too dark for eye tracking — turn on a light or face a window.");
            tell({
              state: "no-face",
              message: "Too dark for eye tracking — turn on a light or face a window.",
              face: false,
              calibrated: calibrationReady(cal),
              clicks: clicksRef.current,
              engine,
            });
          }
        }, 3000);
        // The calibration timeout still applies when the face disappears.
        calTimer = setInterval(() => {
          if (!alive || runtimeStopped || cal.state !== "collecting") return;
          const state = calibrationStep(cal, gate, null, performance.now());
          syncCalView(performance.now());
          if (state === "failed") {
            const why = failMessage();
            setStatus(why);
            tell({
              state: "failed",
              message: why,
              face: false,
              calibrated: false,
              clicks: clicksRef.current,
              samples: cal.points.length,
              quality: cal.rms ?? undefined,
            });
            draw(false);
          }
        }, 500);
      } catch (e) {
        if (!alive || runtimeStopped) return;
        const why = e instanceof Error ? e.message : String(e);
        // A failed start must not leave the camera light on. Air can be
        // toggled off and on again to retry cleanly.
        tracker?.stop();
        stream?.getTracks().forEach((track) => track.stop());
        if (video.current?.srcObject === stream) video.current.srcObject = null;
        readyForCalibration = false;
        setSight({ face: false, eyes: false });
        setLight(null);
        endGate(gate, "session");
        setStatus(`Eye control couldn't start — ${why}`);
        tell({
          state: "error",
          message: `Eye control couldn't start — ${why}`,
          face: false,
          calibrated: false,
          clicks: clicksRef.current,
        });
      }
    })();

    return () => {
      alive = false;
      clearInterval(lowTimer);
      clearInterval(calTimer);
      const ended = endedHandler;
      if (ended) stream?.getVideoTracks().forEach((track) => track.removeEventListener("ended", ended));
      void offCal.then((f) => f()).catch(() => undefined);
      void offRetry.then((f) => f()).catch(() => undefined);
      void offCancel.then((f) => f()).catch(() => undefined);
      void offCam.then((f) => f()).catch(() => undefined);
      retryAction.current = null;
      restartAction.current = null;
      cancelAction.current = null;
      tracker?.stop();
      stream?.getTracks().forEach((track) => track.stop());
      if (video.current?.srcObject === stream) video.current.srcObject = null;
      endGate(gate, "session");
      tell({
        state: "off",
        message: "Eye control is off.",
        face: false,
        calibrated: false,
        clicks: clicksRef.current,
      });
    };
  }, [camKey]);

  return (
    <>
      {/* Keep the video mounted while the preview is hidden: the tracker pumps
          frames from this element, and unmounting it during calibration leaves
          the worker with no picture. Transparency hides it without losing it. */}
      <div
        data-testid="eye-camera-preview"
        aria-hidden={calView.state === "collecting"}
        className={`pointer-events-none fixed left-4 top-4 z-[73] w-[212px] overflow-hidden rounded-2xl border border-white/20 bg-black/85 shadow-2xl transition-opacity ${calView.state === "collecting" ? "opacity-0" : "opacity-100"}`}
      >
        <div className="flex items-center justify-between gap-2 px-2.5 pt-2 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-white/60">
          <span>Eye camera</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              data-izk-hit
              aria-pressed={showGuide}
              onClick={() => setShowGuide((v) => !v)}
              className="pointer-events-auto rounded-full border border-white/15 bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold normal-case tracking-normal text-white/80 hover:bg-white/20"
            >
              {showGuide ? "Guide on" : "Guide off"}
            </button>
            <span className={light === null ? "text-white/60" : light < 46 ? "text-amber-300" : "text-emerald-300"}>
              {light === null ? "measuring light" : light < 46 ? `too dark · ${light}` : `light ${light}`}
            </span>
          </div>
        </div>
        <div className="relative mt-1.5">
          <video ref={video} muted playsInline className="h-[132px] w-full object-cover" style={{ transform: "scaleX(-1)" }} />
          <canvas ref={guideCanvas} className="pointer-events-none absolute inset-0 h-full w-full" />
        </div>
        <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 text-[10px]">
          <span className={sight.eyes ? "text-emerald-300" : sight.face ? "text-amber-300" : "text-rose-300"}>
            {sight.eyes ? "● Eyes readable" : sight.face ? "● Face seen" : "● No face"}
          </span>
          <span className="max-w-[112px] truncate text-white/45" title={camName}>{camName || "starting camera"}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 border-t border-white/10 px-2.5 py-1.5 text-[9.5px] leading-snug text-white/60">
          <span>Face</span><span className={sight.face ? "text-emerald-300" : "text-white/45"}>{sight.face ? "seen" : "waiting"}</span>
          <span>Iris</span><span className={calView.eyes.left && calView.eyes.right ? "text-emerald-300" : "text-amber-300"}>{calView.eyes.left ? "L ✓" : "L –"} {calView.eyes.right ? "R ✓" : "R –"}</span>
          <span>Gaze quality</span><span className={calView.confidence > 0 ? "text-cyan-200" : "text-white/45"}>{calView.confidence}%</span>
          <span>Head</span><span className={calView.headStable ? "text-emerald-300" : "text-amber-300"}>{calView.headStable ? "steady" : "ease back"}</span>
          <span>Samples</span><span className="text-white/80">{calView.recent}/{calView.needed}</span>
        </div>
        <div className="border-t border-white/10 px-2.5 py-1.5 text-[9.5px] leading-snug text-white/65">{calView.reason}</div>
      </div>
      <canvas ref={canvas} className="pointer-events-none fixed inset-0 z-[70]" />
      {checkView && (
        <div className="pointer-events-none fixed inset-0 z-[74]">
          <div className="fixed left-1/2 top-6 -translate-x-1/2 rounded-full bg-black/80 px-4 py-1.5 text-center text-[12px] font-semibold text-white shadow-xl">
            Accuracy check · look at the dot · {checkView.point} of {checkView.total} · the mouse doesn't move during the check
          </div>
          <CancelButton label="Cancel check" onCancel={() => cancelAction.current?.()} />
          <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${checkView.target.x * 100}%`, top: `${checkView.target.y * 100}%` }}>
            <div className="relative h-14 w-14">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: `conic-gradient(rgba(52,211,153,0.96) ${checkView.progress * 360}deg, rgba(255,255,255,0.18) 0deg)` }}
              />
              <div className="absolute inset-[6px] rounded-full border border-emerald-200/80 bg-black/90" />
              <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-200" />
            </div>
          </div>
        </div>
      )}
      {calView.state === "collecting" && calView.target && (
        <div className="pointer-events-none fixed inset-0 z-[74]">
          <div className="fixed left-1/2 top-6 -translate-x-1/2 rounded-full bg-black/80 px-4 py-1.5 text-center text-[12px] font-semibold text-white shadow-xl">
            Look at the dot · {calView.point} of {calView.total} · small head movement is okay · no clicking
          </div>
          {!calView.headStable && (
            <div className="fixed left-1/2 top-16 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1.5 text-center text-[12px] font-semibold text-black shadow-xl">
              Head moved a little too far — ease back toward the starting position. Small movement is fine.
            </div>
          )}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${calView.target.x * 100}%`, top: `${calView.target.y * 100}%` }}
          >
            <div className="relative h-16 w-16">
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: `conic-gradient(rgba(94,231,255,0.96) ${calView.progress * 360}deg, rgba(255,255,255,0.18) 0deg)` }}
              />
              <div className="absolute inset-[6px] rounded-full border border-cyan-200/80 bg-black/90 shadow-[0_0_28px_rgba(94,231,255,0.8)]" />
              <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-200" />
            </div>
          </div>
          <div className="fixed bottom-14 left-1/2 w-[min(92vw,560px)] -translate-x-1/2 rounded-2xl border border-white/15 bg-black/75 px-3 py-2 text-center text-[10.5px] leading-snug text-white/85 shadow-xl">
            <div>{calView.reason}</div>
            {calView.target && calView.target.y > 0.6 && Math.abs(calView.target.x - 0.5) > 0.15 && (
              <div className="mt-0.5 text-[10px] font-semibold text-cyan-200">
                Bottom dot: look sideways as well as down — don’t just tilt your head.
              </div>
            )}
            <div className="mt-0.5 text-[10px] text-white/55">
              Samples {calView.recent}/{calView.needed} · Gaze {calView.confidence}% · Head {calView.headStable ? "steady" : "moving"} · Iris {calView.eyes.left ? "L ✓" : "L –"} {calView.eyes.right ? "R ✓" : "R –"} · no blink needed
            </div>
          </div>
          <CancelButton label="Cancel calibration" onCancel={() => cancelAction.current?.()} />
        </div>
      )}
      {calView.state === "failed" && (
        <div className="pointer-events-none fixed left-1/2 top-8 z-[74] -translate-x-1/2 rounded-2xl border border-amber-200/40 bg-amber-500/95 px-3 py-2 text-center text-[11px] font-semibold text-black shadow-xl">
          <div>{calView.reason}</div>
          {calView.quality !== null && (
            <div className="mt-0.5 text-[10px] font-normal">
              Fit error {Math.round(calView.quality * 100)}% · allowed under {Math.round(CALIBRATION_MAX_RMS * 100)}%
            </div>
          )}
          {calView.badDot !== null && (
            <button
              type="button"
              data-izk-hit
              onClick={() => {
                const dot = calView.badDot;
                if (dot !== null) retryAction.current?.(dot);
              }}
              className="pointer-events-auto mt-1 rounded-full bg-black/80 px-3 py-1 text-[10px] font-semibold text-white hover:bg-black"
            >
              Retry dot {calView.badDot + 1}
            </button>
          )}
          <button
            type="button"
            data-izk-hit
            onClick={() => restartAction.current?.()}
            className="pointer-events-auto mt-1 rounded-full bg-black/80 px-3 py-1 text-[10px] font-semibold text-white hover:bg-black"
          >
            Retry all
          </button>
        </div>
      )}
      <div className="pointer-events-none fixed bottom-3 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-black/65 px-3 py-1 text-[11.5px] text-white/90 shadow-lg">
        👁️ {status}
      </div>
      <EyeSafetyBar />
    </>
  );
}
