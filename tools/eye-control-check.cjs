// Tests the real src/lib/eyeControl.ts without a camera: gaze mapping stays
// inside the screen, smoothing reduces jitter without overshooting, and a
// single blink can never click. The double-blink path needs explicit opt-in,
// a ready calibration, a settled gaze, two blinks inside the window and the
// cooldown.
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const src = fs.readFileSync(path.join(__dirname, "..", "src", "lib", "eyeControl.ts"), "utf8");
const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} };
new Function("exports", "require", "module", js)(mod.exports, require, mod);
const {
  normalizeEyeSensitivity,
  mapGaze,
  smoothEye, acceptGazeJump, newGazeJumpState,
  newEyeClickState,
  eyeClickStep,
  EYE_SENSITIVITIES,
} = mod.exports;

let failed = 0;
function check(what, cond) {
  if (cond) console.log(`  ok  ${what}`);
  else {
    console.error(`FAIL  ${what}`);
    failed++;
  }
}

check("an unknown sensitivity falls back to standard", normalizeEyeSensitivity("wild") === "standard");
check("calm and quick survive normalization", normalizeEyeSensitivity("calm") === "calm" && normalizeEyeSensitivity("quick") === "quick");

check("a centred look maps to the middle of the screen",
  (() => { const p = mapGaze({ x: 0, y: 0 }, "standard"); return p && p.x === 0.5 && p.y === 0.5; })());
check("looking right and down moves the pointer right and down",
  (() => { const p = mapGaze({ x: 0.2, y: 0.2 }, "standard"); return p && p.x > 0.5 && p.y > 0.5; })());
check("looking left and up moves the pointer left and up",
  (() => { const p = mapGaze({ x: -0.2, y: -0.2 }, "standard"); return p && p.x < 0.5 && p.y < 0.5; })());
check("a tiny resting-eye wobble is inside the dead zone",
  (() => { const p = mapGaze({ x: 0.01, y: -0.01 }, "standard"); return p && p.x === 0.5 && p.y === 0.5; })());
check("extreme gaze clamps at the screen edge, never outside it",
  (() => { const p = mapGaze({ x: 99, y: -99 }, "quick"); return p && p.x === 1 && p.y === 0; })());
check("a quick sensitivity crosses more screen for the same look",
  (() => { const c = mapGaze({ x: 0.2, y: 0 }, "calm"); const q = mapGaze({ x: 0.2, y: 0 }, "quick"); return c && q && q.x > c.x; })());
check("junk gaze is null",
  mapGaze(null, "standard") === null && mapGaze({ x: NaN, y: 0 }, "standard") === null);

check("smoothing moves toward the target without overshooting",
  (() => { const p = smoothEye({ x: 0.5, y: 0.5 }, { x: 0.9, y: 0.5 }, 40, "standard"); return p.x > 0.5 && p.x < 0.9 && p.y === 0.5; })());
check("quick smoothing gets there sooner than calm",
  (() => { const c = smoothEye({ x: 0, y: 0 }, { x: 1, y: 0 }, 40, "calm"); const q = smoothEye({ x: 0, y: 0 }, { x: 1, y: 0 }, 40, "quick"); return q.x > c.x; })());
check("an unchanged look stays exactly put",
  (() => { const p = smoothEye({ x: 0.3, y: 0.7 }, { x: 0.3, y: 0.7 }, 30, "calm"); return p.x === 0.3 && p.y === 0.7; })());

// ------------------------------------------------------------ blink policy

const opts = (now, blink, over = {}) => ({
  blink,
  now,
  enabled: true,
  ready: true,
  steady: true,
  ...over,
});

{
  const s = newEyeClickState();
  check("one ordinary blink never clicks", eyeClickStep(s, opts(1000, true)) === false);
  check("a second blink too late starts over instead of clicking", eyeClickStep(s, opts(2200, true)) === false);
  check("the following pair can click", eyeClickStep(s, opts(2400, true)) === true);
}

{
  const s = newEyeClickState();
  eyeClickStep(s, opts(1000, true));
  check("a second blink 320 ms later is the deliberate click", eyeClickStep(s, opts(1320, true)) === true);
  check("the same pair cannot click twice", eyeClickStep(s, opts(1380, true)) === false);
}

{
  const s = newEyeClickState();
  check("clicks stay off when the user has not opted in",
    eyeClickStep(s, opts(1000, true, { enabled: false })) === false
      && eyeClickStep(s, opts(1200, true, { enabled: false })) === false);
}

{
  const s = newEyeClickState();
  check("a calibration blink cannot click",
    eyeClickStep(s, opts(1000, true, { ready: false })) === false
      && eyeClickStep(s, opts(1200, true, { ready: false })) === false);
}

{
  const s = newEyeClickState();
  check("a moving gaze cannot click",
    eyeClickStep(s, opts(1000, true, { steady: false })) === false
      && eyeClickStep(s, opts(1200, true, { steady: false })) === false);
  check("once the gaze settles, a fresh pair can click",
    eyeClickStep(s, opts(1400, true)) === false
      && eyeClickStep(s, opts(1600, true)) === true);
}

{
  const s = newEyeClickState();
  eyeClickStep(s, opts(1000, true));
  eyeClickStep(s, opts(1200, true)); // click
  check("a quick new pair inside the cooldown is ignored",
    eyeClickStep(s, opts(1500, true)) === false
      && eyeClickStep(s, opts(1700, true)) === false);
  check("after the cooldown a fresh pair clicks",
    eyeClickStep(s, opts(2800, true)) === false
      && eyeClickStep(s, opts(3000, true)) === true);
}

check("there are exactly three eye sensitivities",
  Object.keys(EYE_SENSITIVITIES).sort().join(",") === "calm,quick,standard");

{
  const p = { x: 0.5, y: 0.5 };
  const tiny = smoothEye(p, { x: 0.503, y: 0.5 }, 66, "standard");
  const deliberate = smoothEye(p, { x: 0.6, y: 0.5 }, 66, "standard");
  check("the calibrated hold keeps a tiny resting wobble exactly in place",
    tiny.x === p.x && tiny.y === p.y);
  check("a deliberate look outside the hold still moves", deliberate.x > p.x);
}

{
  const jumps = newGazeJumpState();
  const far = { x: 0.88, y: 0.5 };
  check("one far gaze frame is held instead of throwing the cursor",
    acceptGazeJump(jumps, far) === null);
  const confirmed = acceptGazeJump(jumps, { x: 0.87, y: 0.5 });
  check("the next frame confirms a real saccade", confirmed !== null && confirmed.x > 0.8);
  const near = acceptGazeJump(jumps, { x: 0.6, y: 0.5 });
  check("an ordinary small move passes immediately", near !== null && near.x === 0.6);
}

// The accuracy check: the real mouse follows only a validated map.
{
  const { newValidation, validationStep, summarizeValidation, VALIDATION_TARGETS, VALIDATION_SETTLE_MS, VALIDATION_COLLECT_MS } = mod.exports;
  const run = (estimateFor) => {
    const v = newValidation(0);
    let t = 0;
    while (!validationStep(v, estimateFor(VALIDATION_TARGETS[v.index] || VALIDATION_TARGETS[0], t), t)) t += 33;
    return summarizeValidation(v.dots);
  };
  const good = run((d, t) => ({ x: d.x + 0.02 + Math.sin(t) * 0.005, y: d.y - 0.015 + Math.cos(t) * 0.005 }));
  check("an accurate, steady map passes and may move the mouse", good.pass === true && good.accuracy < 0.05);
  const offset = run((d) => ({ x: d.x + 0.15, y: d.y }));
  check("a map off by 15% of the screen fails (the owner's wandering cursor): drawn only", offset.pass === false && /Average error 15%/.test(offset.reason));
  const shaky = run((d, t) => ({ x: d.x + (Math.floor(t / 33) % 2 ? 0.07 : -0.07), y: d.y }));
  check("an estimate that jumps around fails on wobble even when its average is right", shaky.pass === false && /wobbles/.test(shaky.reason));
  const blind = run(() => null);
  check("eyes not read on the check dots: no verdict, no mouse", blind.pass === false && /weren't read well enough/.test(blind.reason));
  const settleOnly = newValidation(0);
  validationStep(settleOnly, { x: 9, y: 9 }, VALIDATION_SETTLE_MS - 1);
  check("readings while the eyes are still landing are ignored", settleOnly.samples.length === 0);
  validationStep(settleOnly, { x: 0.3, y: 0.3 }, VALIDATION_SETTLE_MS + 1);
  check("readings after the settle time are measured", settleOnly.samples.length === 1);
  const mapSrc = fs.readFileSync(path.join(__dirname, "..", "src", "lib", "eyeMap.ts"), "utf8");
  const calDots = [...mapSrc.slice(mapSrc.indexOf("CALIBRATION_TARGETS"), mapSrc.indexOf("];", mapSrc.indexOf("CALIBRATION_TARGETS"))).matchAll(/x:\s*([\d.]+),\s*y:\s*([\d.]+)/g)].map((m) => ({ x: +m[1], y: +m[2] }));
  check("the check dots are new: none is one of the nine calibration dots", calDots.length === 9 && VALIDATION_TARGETS.every((v) => calDots.every((c) => Math.hypot(c.x - v.x, c.y - v.y) > 0.05)));
  check("each dot takes under two seconds", VALIDATION_SETTLE_MS + VALIDATION_COLLECT_MS <= 2000);
}

if (failed) {
  console.error(`\n${failed} eye-control check(s) failed`);
  process.exit(1);
}
console.log("\neye-control checks pass");
