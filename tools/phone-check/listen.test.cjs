// When the phone web app (and Izuki in VR, which uses it) decides you started
// and stopped talking: speechEnds() in docs/app/index.html, fed made-up mic
// loudness every 80 ms. No microphone, no AI.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const html = fs.readFileSync(path.join(__dirname, "../../docs/app/index.html"), "utf8");
const from = html.indexOf("  // ---- when you start and stop talking ----");
const to = html.indexOf("  // ---- end of when you start and stop talking ----");
assert.ok(from > 0 && to > from, "speechEnds() is marked in index.html");
const ctx = {};
vm.runInNewContext(html.slice(from, to) + "\nthis.speechEnds = speechEnds;", ctx);
const { speechEnds } = ctx;

/** Feeds [loudness, milliseconds] pieces; returns each answer with its time. */
function run(pieces) {
  const ends = speechEnds();
  const out = [];
  let took = 0;
  for (const [v, ms] of pieces) {
    for (let t = 0; t < ms; t += 80) {
      took += 80;
      const r = ends(v, took);
      if (r) out.push([r, took]);
      if (r === "done" || r === "nothing") return out;
    }
  }
  return out;
}
const said = (out) => out.map((x) => x[0]);

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log("  ✓ " + name); };

test("a quiet room, then a normal sentence: heard, and ended after the pause", () => {
  assert.deepEqual(said(run([[0.003, 800], [0.05, 1500], [0.003, 2000]])), ["began", "done"]);
});

test("quiet speech from the very first moment is still heard", () => {
  const words = [];
  for (let i = 0; i < 8; i++) words.push([0.03, 240], [0.008, 80]);
  assert.deepEqual(said(run([...words, [0.004, 2000]])), ["began", "done"]);
});

test("talking straight away still counts (it used to make only shouting count)", () => {
  // Words with small dips between them, from the very first moment.
  const words = [];
  for (let i = 0; i < 8; i++) words.push([0.12, 240], [0.05, 80]);
  assert.deepEqual(said(run([...words, [0.004, 2000]])), ["began", "done"]);
});

test("Izuki's own voice fading at the start doesn't raise the bar for you", () => {
  const out = run([[0.2, 400], [0.005, 1200], [0.04, 1500], [0.005, 2000]]);
  assert.deepEqual(said(out), ["began", "done"]);
  // Heard during your words (1.6 s to 3.1 s), and finished only after them.
  assert.ok(out[0][1] > 1600 && out[0][1] <= 3100, "began while you spoke: " + out[0][1]);
  assert.ok(out[1][1] > 3100, "done after you stopped: " + out[1][1]);
});

test("a headset's quiet microphone: soft speech over a very quiet room is heard", () => {
  assert.deepEqual(said(run([[0.002, 600], [0.02, 1600], [0.002, 2000]])), ["began", "done"]);
});

test("a fan or a hum with nobody talking: no words, and a fresh start after 15 s", () => {
  const out = run([[0.03, 20000]]);
  assert.deepEqual(said(out), ["nothing"]);
  assert.ok(out[0][1] > 15000 && out[0][1] <= 15100);
});

test("a cough is not a sentence", () => {
  assert.deepEqual(said(run([[0.004, 600], [0.08, 160], [0.004, 16000]])), ["nothing"]);
});

console.log(`listen: ${passed} tests passed`);
