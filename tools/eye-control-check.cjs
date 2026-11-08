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

if (failed) {
  console.error(`\n${failed} eye-control check(s) failed`);
  process.exit(1);
}
console.log("\neye-control checks pass");
