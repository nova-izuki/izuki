// Tests the real src/lib/airPinch.ts without a camera (#44): a long press
// holds, a fast flick doesn't drop a drag, the hand leaving mid-drag lets go,
// and a hand that comes back still pinched never presses again by itself.
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const src = fs.readFileSync(path.join(__dirname, "..", "src", "lib", "airPinch.ts"), "utf8");
const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} };
new Function("exports", "require", "module", js)(mod.exports, require, mod);
const { newPinch, pinchStep, pinchLetGo, PRESS_MS, RELEASE_MS } = mod.exports;

let failed = 0;
function check(what, cond) {
  if (cond) console.log(`  ok  ${what}`);
  else {
    console.error(`FAIL  ${what}`);
    failed++;
  }
}

/** Plays looks ~30 a second: [touching, ms]; returns each look's press state, as AirControl holds it. */
function play(s, looks, start = 0, down = false) {
  let t = start;
  const out = [];
  for (const [touching, ms] of looks) {
    for (let i = 0; i < ms; i += 33) {
      t += 33;
      down = pinchStep(s, touching, down, t);
      out.push(down);
    }
  }
  return { out, t, down };
}

{
  const s = newPinch();
  const one = play(s, [[true, 33], [false, 200]]);
  check("one noisy touching look never presses", one.out.every((d) => !d));
}
{
  const s = newPinch();
  const r = play(s, [[true, PRESS_MS + 40]]);
  check("fingers together a moment: a press", r.down === true);
  const long = play(s, [[true, 4000]], r.t, r.down);
  check("a long press holds the whole time", long.out.every((d) => d));
  const flick = play(s, [[false, 40], [true, 200]], long.t, long.down);
  check("a fast flick that loosens the fingers for a look doesn't drop the drag", flick.out.every((d) => d));
  const up = play(s, [[false, RELEASE_MS + 60]], flick.t, flick.down);
  check("fingers apart for real: it lets go", up.down === false);
}
{
  // The hand leaves the picture mid-drag: AirControl lets go and calls pinchLetGo.
  const s = newPinch();
  const r = play(s, [[true, 500]]);
  check("dragging before the hand leaves", r.down === true);
  pinchLetGo(s);
  const back = play(s, [[true, 2000]], r.t + 1500, false);
  check("the hand comes back still pinched: no press by itself", back.out.every((d) => !d));
  const open = play(s, [[false, 100]], back.t, back.down);
  check("…the fingers open", open.out.every((d) => !d));
  const again = play(s, [[true, PRESS_MS + 40]], open.t, open.down);
  check("then a fresh pinch presses as usual", again.down === true);
}
{
  const s = newPinch();
  const quick = play(s, [[true, 130], [false, RELEASE_MS + 40]]);
  check("a quick click presses and lets go", quick.out.some((d) => d) && quick.down === false);
}
{
  const air = fs.readFileSync(path.join(__dirname, "..", "src", "components", "AirControl.tsx"), "utf8");
  check("AirControl presses through pinchStep (the tested timing)", /pinchStep\(pinchState, touching, pinchDown, now\)/.test(air));
  check("the hand leaving and the hand dropping both call pinchLetGo", (air.match(/pinchLetGo\(pinchState\)/g) || []).length >= 2);
  check("no second, untested pinch timer is left", !/pinchSeen/.test(air));
}

if (failed) {
  console.error(`\n${failed} air pinch check(s) failed`);
  process.exit(1);
}
console.log("\nair pinch checks pass");
