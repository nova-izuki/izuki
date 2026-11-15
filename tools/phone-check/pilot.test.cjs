const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const window = {};
const context = { window, console, setTimeout, clearTimeout };
vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, "../../docs/app/pilot.js"), "utf8"), context);
const P = window.IzukiPilot;

assert.ok(P, "IzukiPilot is exposed");
const screen = {
  items: [
    { text: "Home", x: 0, y: 0, w: 100, h: 40 },
    { text: "Izuki gesture target", x: 20, y: 200, w: 120, h: 60 },
  ],
};
const hit = P.findTarget(screen, "GESTURE TARGET");
assert.ok(hit, "target lookup is case-insensitive");
const point = P.center(hit);
assert.equal(point.x, 80, "tap x is the target's centre");
assert.equal(point.y, 230, "tap y is the target's centre");
assert.equal(P.findTarget(screen, "missing"), null);
const strip = {
  items: [
    { text: "Izuki swipe test - swipe across this strip", x: 10, y: 300, w: 90, h: 40 },
    { text: "Izuki swipe test", id: "pl-swipe-zone", x: 0, y: 290, w: 320, h: 60 },
  ],
};
assert.equal(P.findTarget(strip, "swipe test").x, 10, "first match is kept for normal taps");
assert.equal(P.findTarget(strip, "swipe test", true).x, 0, "the widest match is the draggable strip");
assert.equal(P.findTarget(strip, "pl-swipe-zone").x, 0, "a view id also finds its control");
assert.equal(P.center({ x: 0, y: 0, w: 0, h: 50 }), null, "zero-width targets are not tapped");
assert.equal(P.center(null), null);

// Page pixels → screen pixels, measured from a target both sides can see.
const m = P.screenMap({ left: 10, top: 100, width: 100, height: 40 }, { x: 50, y: 400, w: 300, h: 120 });
assert.equal(m.scale, 3, "screen pixels per page pixel");
assert.equal(m.x + 10 * m.scale, 50, "the target maps back onto its own left edge");
assert.equal(m.y + 100 * m.scale, 400, "and its own top");
assert.equal(P.screenMap(null, { x: 1, y: 1, w: 1, h: 1 }), null);

console.log("Autopilot sheet: target lookup and coordinate mapping pass.");
