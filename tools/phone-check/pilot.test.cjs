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
assert.equal(P.center({ x: 0, y: 0, w: 0, h: 50 }), null, "zero-width targets are not tapped");
assert.equal(P.center(null), null);

console.log("Autopilot sheet: target lookup and coordinate mapping pass.");
