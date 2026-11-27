// The line Diagnostics shows for the last turn: how long each part took,
// counted from the moment it began. Pure formatting from docs/app/index.html,
// so the stages that never happened stay out instead of reading as instant.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const html = fs.readFileSync(path.join(__dirname, "../../docs/app/index.html"), "utf8");
const from = html.indexOf("  // ---- a turn's timeline");
const to = html.indexOf("  // ---- end of a turn's timeline ----");
assert.ok(from > 0 && to > from, "turnLine() is marked in index.html");
const ctx = {};
vm.runInNewContext(html.slice(from, to)
  + "\nthis.turnLine = turnLine;"
  + "\nthis.api = { turnStart, turnMark, turnVoice, turnClose, open: () => turnOpen(), now: () => turnNow, last: () => turnLast };", ctx);
const { turnLine } = ctx;
const { turnStart, turnMark, turnVoice, turnClose, open, now, last } = ctx.api;

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log("  \u2713 " + name); };

const turn = (extra) => Object.assign(
  { source: "tap", began: 1000, heard: 0, words: 0, thinking: 0, sound: 0, done: 0, voice: "" }, extra);

test("no turn yet says so, rather than showing zeros", () => {
  assert.equal(turnLine(null), "Last turn: none yet");
  assert.equal(turnLine({ source: "tap" }), "Last turn: none yet");
});

test("a whole turn: every stage, counted from the start, with its length", () => {
  assert.equal(
    turnLine(turn({ source: "wake", heard: 2200, words: 3400, thinking: 4100, sound: 5600, done: 10400, voice: "Gemini's voice" })),
    "Last turn (wake): first words 1.2 s · transcript 2.4 s · first token 3.1 s · first sound 4.6 s · last sound 9.4 s · 4.8 s of sound · Gemini's voice");
});

test("a stage that never happened is left out, not shown as 0.0 s", () => {
  assert.equal(turnLine(turn({ heard: 1400 })), "Last turn (tap): first words 0.4 s · no voice");
  assert.equal(turnLine(turn({})), "Last turn (tap): no stages yet · no voice");
});

test("no voice is said plainly", () => {
  assert.equal(turnLine(turn({ sound: 2000, done: 5000, voice: "Android's own voice" })),
    "Last turn (tap): first sound 1.0 s · last sound 4.0 s · 3.0 s of sound · Android's own voice");
});

test("sound that ended without starting has no length to report", () => {
  assert.equal(turnLine(turn({ done: 5000 })), "Last turn (tap): last sound 4.0 s · no voice");
});

test("the label can say which turn this is", () => {
  assert.ok(turnLine(turn({ heard: 1200 }), "Turn in progress").startsWith("Turn in progress (tap): "));
});

test("a stage stamped before the start reads 0.0 s, never a negative", () => {
  assert.equal(turnLine(turn({ heard: 800 })), "Last turn (tap): first words 0.0 s · no voice");
});

test("instant work shows 0.0 s: it happened, it was just fast", () => {
  assert.equal(turnLine(turn({ words: 1000 })), "Last turn (tap): transcript 0.0 s · no voice");
});

test("a turn opens with what began it, and keeps the first time each stage happened", () => {
  turnStart("call");
  assert.equal(open(), true);
  assert.equal(now().source, "call");
  turnMark("heard");
  const first = now().heard;
  turnMark("heard");
  assert.equal(now().heard, first, "the first partial is the one that counts");
  turnMark("thinking");
  turnVoice("the phone's voice");
  turnVoice("Gemini's voice");
  assert.equal(now().voice, "Gemini's voice", "the voice that ended up speaking is the one shown");
  assert.match(turnLine(now(), "Turn in progress"), /^Turn in progress \(call\): first words 0\.0 s · first token 0\.0 s · Gemini's voice$/);
});

test("closing keeps it for the report, and nothing marks it afterwards", () => {
  turnClose();
  assert.equal(open(), false);
  assert.equal(last(), now());
  const done = now().done;
  turnMark("done");
  assert.equal(now().done, done, "a closed turn is not written to");
});

test("the next turn replaces the open one; the finished one is what Diagnostics shows", () => {
  const finished = last();
  turnStart("typed");
  assert.notEqual(now(), finished, "a new turn is a new timeline");
  assert.equal(last(), finished, "the finished turn stays for the report");
  assert.equal(now().source, "typed");
  turnClose();
});

console.log(`turntime: ${passed} tests passed`);
