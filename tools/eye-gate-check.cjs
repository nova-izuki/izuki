// Tests the real src/lib/eyeGate.ts (transpiled as-is): the gate starts
// closed, a public build can never open the dev path, a session opt-in
// opens and dies at the end, nothing persists between fresh gates, and the
// blink/gaze helpers read made-up landmarks sensibly (one fast close+open
// is a blink, a long hold is not, junk looks are skipped, iris offsets land
// in -1..1).
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const src = fs.readFileSync(path.join(__dirname, "..", "src", "lib", "eyeGate.ts"), "utf8");
const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mapSrc = fs.readFileSync(path.join(__dirname, "..", "src", "lib", "eyeMap.ts"), "utf8");
const mapJs = ts.transpileModule(mapSrc, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mapMod = { exports: {} };
new Function("exports", "require", "module", mapJs)(mapMod.exports, require, mapMod);
const mod = { exports: {} };
const localRequire = (id) => id === "./eyeMap" ? mapMod.exports : require(id);
new Function("exports", "require", "module", js)(mod.exports, localRequire, mod);
const {
  newEyeGate, requestGate, endGate, gateOpen, newBlink, blinkStep, fuseEyeGaze,
  newCalibration, startCalibration, calibrationStep, applyCalibration, calibrationReady, cancelCalibration,
  retryCalibrationTarget, CALIBRATION_TIMEOUT_MS, CALIBRATION_TARGET_TIMEOUT_MS,
} = mod.exports;
const { CALIBRATION_TARGETS, fitGazeModel, predictGaze } = mapMod.exports;
const workerSrc = fs.readFileSync(path.join(__dirname, "..", "src", "lib", "eyeWorker.ts"), "utf8");

let failed = 0;
function check(what, cond) {
  if (cond) {
    console.log(`  ok  ${what}`);
  } else {
    console.error(`FAIL  ${what}`);
    failed++;
  }
}

// ---------------------------------------------------------------- the gate

check("a new gate is OFF and closed", newEyeGate().mode === "off" && !gateOpen(newEyeGate()));

{
  const g = newEyeGate();
  check("a public build's dev ask is refused and locks everything off",
    requestGate(g, "dev", false) === "off" && !gateOpen(g));
}

{
  const g = newEyeGate();
  check("a dev build holds its own dev gate", requestGate(g, "dev", true) === "dev" && gateOpen(g));
  check("ending a dev hold returns to off", endGate(g, "dev") === "off" && !gateOpen(g));
}

{
  const g = newEyeGate();
  requestGate(g, "dev", true);
  check("a session opt-in is stronger than a dev hold",
    requestGate(g, "session", true) === "session" && gateOpen(g));
  check("ending the session drops even a dev build to off", endGate(g, "session") === "off");
}

{
  const g = newEyeGate();
  requestGate(g, "session", false);
  check("a session opt-in needs no dev build — it's the user's own click",
    gateOpen(g));
  check("a session's end leaves any dev hold (there is none)", endGate(g, "session") === "off");
}

check("a fresh gate knows nothing of the last process (no persistence)",
  !gateOpen(newEyeGate()));

{
  const g = newEyeGate();
  check("an unknown end-shape on a closed gate stays closed",
    endGate(g, "unknown") === "off");
}

// ---------------------------------------------------------------- blink

{
  const b = newBlink();
  const feed = (ears) => ears.map((e) => blinkStep(b, e));
  // A blink: open eye, two closed frames, reopened.
  const one = feed([0.32, 0.15, 0.12, 0.31]);
  check("a fast close+reopen is exactly one blink",
    one[0] === false && one[1] === false && one[2] === false
      && one[3] === true && blinkStep(b, 0.3) === false);
}

{
  const b = newBlink();
  const ears = [0.12, 0.11, 0.1, 0.1, 0.09, 0.1, 0.11, 0.1, 0.12, 0.1, 0.11, 0.1, 0.12, 0.1];
  ears.forEach((e) => blinkStep(b, e));
  const reopened = blinkStep(b, 0.3);
  check("a long hold (resting eyes) is no blink when it reopens", !reopened);
}

{
  const b = newBlink();
  check("junk looks are skipped, and the next close+open still reads",
    blinkStep(b, null) === false && blinkStep(b, NaN) === false
      && blinkStep(b, 0.14) === false && blinkStep(b, 0.29) === true);
}

{
  const b = newBlink();
  check("a single closed frame followed by open is a blink too",
    blinkStep(b, 0.12) === false && blinkStep(b, 0.26) === true);
}

// ---------------------------------------------------------------- gaze

const eye = (irisX, irisY, innerX, outerX, centreY = 0.5) => ({
  iris: { x: irisX, y: irisY },
  inner: { x: innerX, y: centreY },
  outer: { x: outerX, y: centreY },
});

check("an iris centred in its eye reads ~0,0",
  (() => {
    const g = fuseEyeGaze(eye(0.4, 0.5, 0.45, 0.35), eye(0.6, 0.5, 0.55, 0.65));
    return g && Math.abs(g.x) < 0.01 && Math.abs(g.y) < 0.01;
  })());

check("both eye boxes agree on a rightward look even though their corner order is opposite",
  (() => {
    const g = fuseEyeGaze(eye(0.44, 0.5, 0.45, 0.35), eye(0.64, 0.5, 0.55, 0.65));
    return g && g.x > 0.7 && Math.abs(g.y) < 0.01;
  })());

check("a leftward look is negative, not clamped by one eye's geometry",
  (() => {
    const g = fuseEyeGaze(eye(0.36, 0.5, 0.45, 0.35), eye(0.56, 0.5, 0.55, 0.65));
    return g && g.x < -0.7;
  })());

check("looking down produces a strong positive vertical reading",
  (() => {
    const g = fuseEyeGaze(eye(0.4, 0.53, 0.45, 0.35), eye(0.6, 0.53, 0.55, 0.65));
    return g && g.y > 0.5;
  })());

check("one readable eye is used alone",
  (() => {
    const g = fuseEyeGaze(null, eye(0.64, 0.5, 0.55, 0.65));
    return g && g.x > 0.7 && Math.abs(g.y) < 0.01;
  })());

check("a collapsed eye is null, not infinity",
  fuseEyeGaze(eye(0.5, 0.5, 0.5, 0.5), null) === null);

check("missing landmarks are null", fuseEyeGaze(null, null) === null);
check("the image-left iris 468 is paired with the image-left eye 33/133",
  /const RIGHT_IRIS = 468;/.test(workerSrc) && /const RIGHT_EYE = \{ outer: 33/.test(workerSrc) &&
  /const LEFT_IRIS = 473;/.test(workerSrc) && /const LEFT_EYE = \{ outer: 263/.test(workerSrc));

// ---------------------------------------------------------------- calibration

const head = { yaw: 0.08, pitch: -0.04, roll: 0.01, scale: 0.34 };
const rawFor = (target) => ({ x: (target.x - 0.5) * 1.4, y: (target.y - 0.5) * 1.4, head });
const feedTarget = (c, g, target, start, count = 12) => {
  let state = c.state;
  let t = start;
  for (let i = 0; i < count; i++) {
    t += 120;
    state = calibrationStep(c, g, rawFor(target), t);
  }
  return { state, t };
};

{
  const c = newCalibration();
  check("a fresh calibration has nine targets and no map",
    c.targets.length === CALIBRATION_TARGETS.length && c.targets.length === 9 &&
    c.state === "idle" && c.model === null && !calibrationReady(c));
  check("a fresh look is not mapped before calibration",
    applyCalibration(c, { x: 0.2, y: 0.1 }) === null);
}

{
  const c = newCalibration();
  check("calibration cannot start while the gate is closed",
    startCalibration(c, newEyeGate(), 0) === false && c.state === "idle" && !c.enabled);
}

{
  const c = newCalibration();
  const g = newEyeGate();
  requestGate(g, "session", false);
  check("calibration starts only through an open gate", startCalibration(c, g, 0) === true);
  let state = "collecting";
  let t = 0;
  for (const target of c.targets) {
    const fed = feedTarget(c, g, target, t);
    state = fed.state;
    t = fed.t;
  }
  check("nine steady looks auto-advance and fit a map",
    state === "ready" && calibrationReady(c) && c.targetIndex === 9 && c.points.length === 9 &&
    c.model !== null && c.rms !== null && c.rms <= 0.14);
  let worst = 0;
  for (const target of c.targets) {
    const mapped = applyCalibration(c, rawFor(target), head);
    worst = Math.max(worst, Math.hypot(mapped.x - target.x, mapped.y - target.y));
  }
  check("the committed map puts every target back on its screen point", worst < 0.06);
}

{
  const c = newCalibration();
  const g = newEyeGate();
  requestGate(g, "session", false);
  startCalibration(c, g, 0);
  let t = 0;
  for (const target of c.targets) t = feedTarget(c, g, target, t).t;
  const bad = 3;
  c.state = "failed";
  c.model = null;
  c.badIndex = bad;
  c.targetIndex = c.targets.length;
  check("a failed fit can retry one dot without discarding the other eight",
    retryCalibrationTarget(c, g, bad, 0) === true &&
    c.state === "collecting" && c.retryIndex === bad && c.points.length === 9);
  const fed = feedTarget(c, g, c.targets[bad], 0);
  check("the one-dot retry replaces only that fixation and refits",
    fed.state === "ready" && c.retryIndex === null && c.points.length === 9 && c.state === "ready");
}

{
  const c = newCalibration();
  const g = newEyeGate();
  requestGate(g, "session", false);
  startCalibration(c, g, 0);
  let t = 0;
  for (let i = 0; i < 12; i++) {
    t += 120;
    calibrationStep(c, g, {
      ...rawFor(c.targets[0]),
      head: { ...head, yaw: head.yaw + (i % 2 ? 0.04 : -0.04) },
    }, t);
  }
  check("small natural head movement does not block a fixation",
    c.points.length === 1 && c.targetIndex === 1 && c.headStable);
}

{
  const c = newCalibration();
  const g = newEyeGate();
  requestGate(g, "session", false);
  startCalibration(c, g, 0);
  let state = "collecting";
  let t = 0;
  for (const target of c.targets) {
    for (let i = 0; i < 12; i++) {
      t += 120;
      state = calibrationStep(c, g, { x: 0, y: 0, head: null }, t);
    }
  }
  check("a map that cannot generalise is refused, not applied",
    state === "failed" && !calibrationReady(c) && c.model === null && applyCalibration(c, { x: 0, y: 0 }) === null);
}

{
  const c = newCalibration();
  const g = newEyeGate();
  requestGate(g, "session", false);
  startCalibration(c, g, 0);
  calibrationStep(c, g, { x: 0.1, y: 0.1, head }, 120);
  endGate(g, "session");
  check("closing the gate clears the unfinished nine-point calibration",
    calibrationStep(c, g, { x: 0.1, y: 0.1, head }, 240) === "idle" &&
    !c.enabled && c.targets.length === 9 && c.points.length === 0 && c.model === null);
}

{
  const c = newCalibration();
  const g = newEyeGate();
  requestGate(g, "session", false);
  startCalibration(c, g, 0);
  check("an unfinished calibration times out",
    calibrationStep(c, g, null, CALIBRATION_TIMEOUT_MS + 1) === "failed" && !calibrationReady(c));
}

{
  const points = CALIBRATION_TARGETS.map((target) => ({ target, sample: rawFor(target), samples: 12, spread: 0 }));
  // One fixation is 12% of the screen away from where it should be.
  points[2].sample = { ...points[2].sample, x: points[2].sample.x + 0.12 };
  const model = fitGazeModel(points);
  let worst = 0;
  if (model) {
    for (let i = 0; i < points.length; i++) {
      if (i === 2) continue;
      const mapped = predictGaze(model, points[i].sample);
      if (!mapped) {
        worst = Infinity;
        continue;
      }
      worst = Math.max(worst, Math.hypot(mapped.x - points[i].target.x, mapped.y - points[i].target.y));
    }
  }
  check("one noisy target is down-weighted instead of swinging the map",
    !!model && model.rms < 0.1 && worst < 0.04);
}

{
  const c = newCalibration();
  const g = newEyeGate();
  requestGate(g, "session", false);
  startCalibration(c, g, 0);
  const target = c.targets[0];
  let t = 0;
  for (let i = 0; i < 6; i++) {
    t += 120;
    calibrationStep(c, g, rawFor(target), t);
  }
  const kept = calibrationStep(c, g, null, t + 200);
  check("a 200 ms iris dropout does not erase the current fixation",
    kept === "collecting" && c.recent.length >= 6 && c.points.length === 0);
  t += 250;
  let committed = "collecting";
  for (let i = 0; i < 5 && c.points.length === 0; i++) {
    committed = calibrationStep(c, g, rawFor(target), t + i * 120);
  }
  check("the look commits after the brief dropout without a blink",
    committed === "collecting" && c.points.length === 1 && c.targetIndex === 1);
}

{
  const c = newCalibration();
  const g = newEyeGate();
  requestGate(g, "session", false);
  startCalibration(c, g, 0);
  const state = calibrationStep(c, g, null, CALIBRATION_TARGET_TIMEOUT_MS + 1);
  check("a dot with no readable iris times out without skipping",
    state === "failed" && c.failReason === "timeout" && c.targetIndex === 0 && c.points.length === 0);
}

{
  const c = newCalibration();
  const g = newEyeGate();
  requestGate(g, "session", false);
  startCalibration(c, g, 0);
  let t = 0;
  for (let i = 0; i < 12; i++) {
    t += 120;
    calibrationStep(c, g, {
      ...rawFor(c.targets[0]),
      head: { ...head, yaw: head.yaw + (i % 2 ? 0.12 : -0.12) },
    }, t);
  }
  check("a moving head cannot commit a dot",
    c.state === "collecting" && c.points.length === 0 && !c.headStable);
}

{
  const c = newCalibration();
  const g = newEyeGate();
  requestGate(g, "session", false);
  startCalibration(c, g, 0);
  let t = 0;
  const first = feedTarget(c, g, c.targets[0], t);
  t = first.t;
  for (let i = 0; i < 12; i++) {
    t += 120;
    calibrationStep(c, g, {
      ...rawFor(c.targets[1]),
      head: { ...head, yaw: head.yaw + 0.2 },
    }, t);
  }
  check("a different head position cannot advance to the next dot",
    c.points.length === 1 && c.targetIndex === 1 && !c.headStable);
  for (let i = 0; i < 12; i++) {
    t += 120;
    calibrationStep(c, g, rawFor(c.targets[1]), t);
  }
  check("returning to the starting head position resumes calibration",
    c.points.length === 2 && c.targetIndex === 2);
}

{
  const c = newCalibration();
  const g = newEyeGate();
  requestGate(g, "session", false);
  startCalibration(c, g, 0);
  calibrationStep(c, g, rawFor(CALIBRATION_TARGETS[0]), 120);
  cancelCalibration(c);
  check("cancelling an unfinished calibration clears it without a map",
    c.state === "idle" && c.points.length === 0 && !calibrationReady(c) && applyCalibration(c, { x: 0, y: 0 }) === null);
}

if (failed) {
  console.error(String.fromCharCode(10) + failed + " eye-gate check(s) failed");
  process.exit(1);
}
console.log(String.fromCharCode(10) + "eye-gate checks pass");
