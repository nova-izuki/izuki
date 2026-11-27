// What the phone does when Android's ears finish a session: a moment of
// quiet, the microphone still being handed over, a recognizer that is really
// broken, or the person stopping it. Pure rule from docs/app/index.html.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const html = fs.readFileSync(path.join(__dirname, "../../docs/app/index.html"), "utf8");
const from = html.indexOf("  // ---- after a listening session ends");
const to = html.indexOf("  // ---- end after a listening session ends ----");
assert.ok(from > 0 && to > from, "earsAfter() is marked in index.html");
const ctx = {};
vm.runInNewContext(html.slice(from, to) + "\nthis.earsAfter = earsAfter;", ctx);
const { earsAfter } = ctx;

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log("  \u2713 " + name); };

test("words heard: ask what was said", () => {
  assert.equal(earsAfter("", 0, false), "words");
});

test("the person stopped it: do nothing at all", () => {
  assert.equal(earsAfter("cancelled", 0, true), "");
});

test("no microphone permission: say so", () => {
  assert.equal(earsAfter("permission", 0, true), "permission");
});

test("quiet: listen again, then wait for a tap on the third", () => {
  assert.equal(earsAfter("silence", 0, true), "again");
  assert.equal(earsAfter("silence", 1, true), "again");
  assert.equal(earsAfter("silence", 2, true), "park");
});

test("a busy microphone is a moment, never a fallback", () => {
  for (const quiet of [0, 1, 2]) assert.equal(earsAfter("busy", quiet, true), "again", "busy after " + quiet);
  assert.equal(earsAfter("busy", 3, true), "park");
  // Waiting for a microphone needs no AI key. Switching to recording here (as
  // it used to for every error) ended calls with "add a free Gemini key".
  assert.notEqual(earsAfter("busy", 0, false), "record");
  assert.notEqual(earsAfter("busy", 0, false), "stop");
});

test("a recognizer that is really unusable: record with a key, else say why", () => {
  for (const error of ["unavailable", "audio", "network", "server", "client", "language", "unclear"]) {
    assert.equal(earsAfter(error, 0, true), "record", error + " with a key");
    assert.equal(earsAfter(error, 0, false), "stop", error + " without one");
  }
});

test("odd numbers and missing values don't crash", () => {
  assert.equal(earsAfter(null, undefined, false), "words");
  assert.equal(earsAfter("silence", -3, true), "again");
  assert.equal(earsAfter("busy", "2", true), "again");
  assert.equal(earsAfter("silence", "not a number", true), "again");
});

test("a new call puts Android's ears back", () => {
  const start = html.indexOf("  async function openLive()");
  const end = html.indexOf("  function endLive()");
  assert.ok(start > 0 && end > start, "openLive() is in the page");
  assert.ok(/useNativeEars = true;/.test(html.slice(start, end)),
    "the fallback to recording cannot outlive the call it happened in");
});

console.log(`ears: ${passed} tests passed`);
