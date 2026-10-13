// Tests the real src/lib/airActions.ts (transpiled as-is): saying "make my
// pinky pinch take a screenshot" changes the right gesture, and nothing else
// ("open chrome", "turn on air control") is mistaken for it.
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const src = fs.readFileSync(path.join(__dirname, "..", "src", "lib", "airActions.ts"), "utf8");
const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} };
new Function("exports", "require", "module", js)(mod.exports, require, mod);
const { parseAirVoice, airBindings } = mod.exports;
const cases = [
  ["Hey Nova, make my pinky pinch take a screenshot", { kind: "bind", slot: "pinky", action: "keys:win+shift+s" }],
  ["change my middle finger gesture to undo", { kind: "bind", slot: "middle", action: "keys:ctrl+z" }],
  ["make the ring finger pinch play the last song", { kind: "bind", slot: "ring", action: "keys:prevtrack" }],
  ["set my flick left to new tab", { kind: "bind", slot: "flick_left", action: "keys:ctrl+t" }],
  ["move my air gesture for the little finger to mute", { kind: "bind", slot: "pinky", action: "keys:volumemute" }],
  ["set air control to precision", { kind: "mode", mode: "precision" }],
  ["switch air control to fast mode", { kind: "mode", mode: "fast" }],
  ["reset my air gestures", { kind: "reset" }],
  ["what do my air gestures do", { kind: "list" }],
  ["make the middle finger pinch do nothing", { kind: "bind", slot: "middle", action: "none" }],
  ["open chrome", null],
  ["turn on air control", null],
  ["play some music", null],
];
let pass = 0, fail = 0;
for (const [t, want] of cases) {
  const got = parseAirVoice(t);
  if (JSON.stringify(got) === JSON.stringify(want)) pass++;
  else { fail++; console.log(`  FAIL "${t}" → ${JSON.stringify(got)}`); }
}
const b = airBindings({ middle: "keys:ctrl+z", ring: "evil:rm", nope: "x" });
if (b.middle === "keys:ctrl+z" && b.ring === "keys:ctrl+c" && !("nope" in b)) pass++;
else { fail++; console.log("  FAIL saved bindings aren't checked", b); }
console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
