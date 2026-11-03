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
const mod = { exports: {} };
new Function("exports", "require", "module", js)(mod.exports, require, mod);
const { newEyeGate, requestGate, endGate, gateOpen, newBlink, blinkStep, gazeOffset } = mod.exports;

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

check("an iris centred in the box reads ~0,0",
  (() => { const g = gazeOffset({ x: 0.5, y: 0.5 }, { x: 0.4, y: 0.5 }, { x: 0.6, y: 0.5 }, { x: 0.5, y: 0.45 }, { x: 0.5, y: 0.55 }); return g && Math.abs(g.x) < 0.01 && Math.abs(g.y) < 0.01; })());

check("a right-shifted iris reads positive x, clamped only at the ends",
  (() => { const g = gazeOffset({ x: 0.58, y: 0.5 }, { x: 0.4, y: 0.5 }, { x: 0.6, y: 0.5 }, { x: 0.5, y: 0.45 }, { x: 0.5, y: 0.55 }); return g && Math.abs(g.x - 0.8) < 0.01 && Math.abs(g.y) < 0.01; })());

check("a collapsed box is null, not infinity",
  gazeOffset({ x: 0.5, y: 0.5 }, { x: 0.5, y: 0.5 }, { x: 0.5, y: 0.5 }, { x: 0.5, y: 0.5 }, { x: 0.5, y: 0.5 }) === null);

check("missing landmarks are null",
  gazeOffset(null, null, null, null, null) === null);

if (failed) {
  console.error(`\n${failed} eye-gate check(s) failed`);
  process.exit(1);
}
console.log("\neye-gate checks pass");
