// What a press of the send button means while Izuki is still answering: Send
// when something is typed (that message replaces the answer), Stop only when
// the box and the attachments are empty. Pure rule from docs/app/index.html.
// The bug this pins: the button was Stop whenever a request ran, so typing the
// next message and pressing send stopped the reply, dropped the words and said
// "Stopped. I didn't finish that one." for a stop nobody asked for.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const html = fs.readFileSync(path.join(__dirname, "../../docs/app/index.html"), "utf8");
const from = html.indexOf("  // ---- what a press of the send button means");
const to = html.indexOf("  // ---- end what a press of the send button means ----");
assert.ok(from > 0 && to > from, "sendPress() is marked in index.html");
const ctx = {};
vm.runInNewContext(html.slice(from, to) + "\nthis.sendPress = sendPress;", ctx);
const { sendPress } = ctx;

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log("  \u2713 " + name); };

test("idle: send", () => {
  assert.equal(sendPress(false, false), "send");
  assert.equal(sendPress(false, true), "send");
});

test("working and nothing typed: the button is Stop", () => {
  assert.equal(sendPress(true, false), "stop");
});

test("working with a message typed: send that message, never stop", () => {
  assert.equal(sendPress(true, true), "replace");
  assert.notEqual(sendPress(true, true), "stop");
});

test("an attachment counts as something to send", () => {
  assert.equal(sendPress(true, true), "replace");
});

console.log(`\nsendstop.test.cjs: ${passed} passed`);
