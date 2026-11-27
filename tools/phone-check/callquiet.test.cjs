// The call's ear in a quiet car: how long it waits before opening another
// session, and when words are Izuki hearing itself. Pure rules from
// docs/app/index.html.
//
// The bug this pins: Drive mode opened a new recognizer every 250 ms in a quiet
// room (Android plays its microphone sound on each start and stop), and Izuki's
// own spoken line, heard back through the speaker, was asked as a new question —
// which reset the quiet count, so the chime loop never ended.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const html = fs.readFileSync(path.join(__dirname, "../../docs/app/index.html"), "utf8");
const grab = (open, close, name) => {
  const from = html.indexOf(open);
  const to = html.indexOf(close);
  assert.ok(from > 0 && to > from, name + " is marked in index.html");
  return html.slice(from, to);
};
const rules = grab("  // ---- how long before a quiet ear tries again", "  // ---- end how long before a quiet ear tries again ----")
  + grab("  // ---- is this Izuki hearing itself?", "  // ---- end is this Izuki hearing itself? ----");
const ctx = {};
vm.runInNewContext(rules + "\nthis.againIn = againIn; this.saidBack = saidBack;", ctx);
const { againIn, saidBack } = ctx;

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log("  \u2713 " + name); };

test("a quiet room waits longer each try, never a quarter of a second forever", () => {
  assert.ok(againIn("silence", 0) >= 400, "first wait " + againIn("silence", 0));
  assert.ok(againIn("silence", 1) > againIn("silence", 0));
  assert.ok(againIn("silence", 2) > againIn("silence", 1));
  assert.ok(againIn("silence", 9) <= 4000, "capped");
  assert.ok(againIn("busy", 0) > againIn("silence", 0), "a busy microphone waits longer");
  assert.ok(againIn("echo", 0) >= 800, "its own voice waits longest");
  assert.equal(againIn("silence", -3), againIn("silence", 0));
});

test("its own line coming back is not a question", () => {
  assert.equal(saidBack("drive mode's on where to", "Drive mode's on. Where to? Or just talk — I'll keep it short."), true);
  assert.equal(saidBack("it is 22 degrees and cloudy in lagos today", "It's 22 degrees and cloudy in Lagos today."), true);
});

test("a real answer is never thrown away", () => {
  assert.equal(saidBack("take me to walmart", "Drive mode's on. Where to?"), false);
  assert.equal(saidBack("yes", "Say yes to confirm"), false, "one word is the person");
  assert.equal(saidBack("play music", "Anything you want to hear?"), false, "two words is the person");
  assert.equal(saidBack("", "Anything you want to hear?"), false);
  assert.equal(saidBack("and cloudy today", ""), false, "nothing was said");
});

console.log(`\ncallquiet.test.cjs: ${passed} passed`);
