// Tests the real src/lib/airScroll.ts (transpiled as-is) with made-up hand
// paths: the peace sign ✌️ moved up/down scrolls up/down, moved left/right
// scrolls sideways, a wobbly sideways move never scrolls diagonally, and a
// hand that only jitters scrolls nothing.
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const src = fs.readFileSync(path.join(__dirname, "..", "src", "lib", "airScroll.ts"), "utf8");
const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} };
new Function("exports", "require", "module", js)(mod.exports, require, mod);
const { newScroll, scrollStep } = mod.exports;

/** Feed a path of [x, y] looks; total notches sent each way. */
function run(points) {
  const s = newScroll();
  let down = 0, right = 0, mixed = false;
  for (const [x, y] of points) {
    const r = scrollStep(s, x, y);
    if (r.down && r.right) mixed = true;
    down += r.down;
    right += r.right;
  }
  return { down, right, mixed, axis: s.axis };
}

/** n looks from a to b, with optional wobble on the other axis. */
function path_(from, to, n, wobble = 0) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const w = wobble ? Math.sin(i * 1.7) * wobble : 0;
    out.push([from[0] + (to[0] - from[0]) * t + (from[0] === to[0] ? w : 0), from[1] + (to[1] - from[1]) * t + (from[1] === to[1] ? w : 0)]);
  }
  return out;
}

let fails = 0;
function check(name, got, want) {
  const ok = Object.entries(want).every(([k, v]) => (typeof v === "function" ? v(got[k]) : got[k] === v));
  console.log(`${ok ? "  ok  " : "  FAIL"} ${name} → ${JSON.stringify(got)}`);
  if (!ok) fails++;
}

// Straight moves (a third of the view = about 13 notches).
check("hand moves right → scrolls right", run(path_([0.3, 0.5], [0.65, 0.5], 20)), { axis: "h", down: 0, right: (n) => n >= 10, mixed: false });
check("hand moves left → scrolls left", run(path_([0.7, 0.5], [0.35, 0.5], 20)), { axis: "h", down: 0, right: (n) => n <= -10, mixed: false });
check("hand moves down → scrolls down", run(path_([0.5, 0.3], [0.5, 0.65], 20)), { axis: "v", right: 0, down: (n) => n >= 10, mixed: false });
check("hand moves up → scrolls up", run(path_([0.5, 0.7], [0.5, 0.35], 20)), { axis: "v", right: 0, down: (n) => n <= -10, mixed: false });

// Real hands wobble: sideways with up/down shake stays sideways only.
check("wobbly sideways → sideways only", run(path_([0.3, 0.5], [0.65, 0.5], 25, 0.012)), { axis: "h", down: 0, right: (n) => n >= 10, mixed: false });
check("wobbly up/down → up/down only", run(path_([0.5, 0.3], [0.5, 0.65], 25, 0.012)), { axis: "v", right: 0, down: (n) => n >= 10, mixed: false });

// A diagonal-ish move picks the clearly stronger way and sticks to it.
check("mostly sideways diagonal → sideways", run(path_([0.3, 0.5], [0.6, 0.56], 20)), { axis: "h", down: 0, mixed: false });
check("mostly up/down diagonal → up/down", run(path_([0.5, 0.3], [0.54, 0.6], 20)), { axis: "v", right: 0, mixed: false });

// Once chosen, the way holds even if the hand then drifts the other way.
check("chosen way holds", run([...path_([0.3, 0.5], [0.5, 0.5], 10), ...path_([0.5, 0.5], [0.5, 0.8], 10).slice(1)]), { axis: "h", down: 0, mixed: false });

// Holding still with tiny jitter: no scroll at all.
const jitter = Array.from({ length: 40 }, (_, i) => [0.5 + Math.sin(i) * 0.004, 0.5 + Math.cos(i * 1.3) * 0.004]);
check("jitter only → nothing", run(jitter), { axis: null, down: 0, right: 0 });

console.log(fails ? `\n${fails} failed` : "\nAir scroll: all passed");
process.exit(fails ? 1 : 0);
