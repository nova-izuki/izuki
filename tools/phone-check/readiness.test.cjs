// Phone Readiness (docs/app/readiness.js) with every state Android can
// report: granted, denied, restricted, maybe-restricted, switched on but not
// connected, an older APK that answers less, and the wake listener's states.
const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const window = {};
vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, "../../docs/app/readiness.js"), "utf8"), { window });
const R = window.IzukiReadiness;
assert.ok(R, "IzukiReadiness is exposed");
const row = (rows, id) => rows.find((r) => r.id === id);

// Everything granted and connected: all set, and the orb is ready through Accessibility.
const good = { control: true, running: true, controlState: "ready", mic: true, notifications: true, sdk: 34, manufacturer: "samsung" };
let rows = R.rows(good);
assert.equal(R.summary(rows).text, "All set");
assert.equal(row(rows, "control").state, "ready");
assert.equal(row(rows, "orb").state, "ready");
assert.match(row(rows, "orb").text, /doesn't use “Appear on top”/);
assert.equal(row(rows, "control").action.id, "test-control", "a ready row offers a test, not an Enable button");

// Switched on in Settings but Android hasn't connected it: never "Ready".
rows = R.rows({ ...good, running: false, controlState: "not-connected" });
assert.equal(row(rows, "control").state, "starting");
assert.equal(row(rows, "control").ok, false);
assert.equal(row(rows, "orb").state, "needs-control", "the orb waits for the connected service");
assert.equal(R.summary(rows).text, "2 of 3 ready");

// Android says the setting is restricted: App info, with Samsung's steps.
rows = R.rows({ ...good, control: false, running: false, controlState: "restricted", restricted: "restricted" });
const restricted = row(rows, "control");
assert.equal(restricted.state, "restricted");
assert.equal(restricted.action.id, "app-info");
assert.ok(restricted.steps.some((s) => /Allow restricted settings/.test(s)));
assert.ok(restricted.steps.some((s) => /Installed apps/.test(s)), "Samsung's own Accessibility path");
assert.equal(R.summary(rows).restricted, true);

// Only likely (installed from a file): Turn on first, the restricted help folded underneath.
rows = R.rows({ ...good, manufacturer: "Google", control: false, running: false, controlState: "maybe-restricted", restricted: "likely" });
const maybe = row(rows, "control");
assert.equal(maybe.action.id, "control");
assert.equal(maybe.action.label, "Turn on");
assert.match(maybe.note, /App was denied access/);
assert.ok(maybe.noteSteps.some((s) => /Allow restricted settings/.test(s)));
assert.ok(maybe.steps.some((s) => /Downloaded apps/.test(s)), "Pixel-style path off Samsung");

// After an app update: Android clears the switch, so say that and offer it back.
rows = R.rows({ ...good, control: false, running: false, controlState: "off", controlOffAfterUpdate: true });
const afterUpdate = row(rows, "control");
assert.equal(afterUpdate.action.id, "control", "the fix opens the accessibility switch");
assert.equal(afterUpdate.action.label, "Turn it back on", "the button says what happened");
assert.match(afterUpdate.text, /when the app updated/);
assert.equal(afterUpdate.ok, false);
// The same "off" with no update behind it keeps the old wording.
rows = R.rows({ ...good, control: false, running: false, controlState: "off", controlOffAfterUpdate: false });
assert.equal(row(rows, "control").action.label, "Turn on");
assert.doesNotMatch(row(rows, "control").text, /updated/);

// Off on Android 12 (no restricted settings there): no restricted note.
rows = R.rows({ control: false, running: false, controlState: "off", mic: true, notifications: true, sdk: 31 });
assert.equal(row(rows, "control").note, undefined);

// Denied permissions each get their own button.
rows = R.rows({ ...good, mic: false, notifications: false });
assert.equal(row(rows, "mic").action.id, "mic");
assert.equal(row(rows, "notifications").action.id, "notifications");
assert.equal(R.summary(rows).text, "1 of 3 ready");

// An older APK that only knows control: unknown rows are left out, not guessed.
rows = R.rows({ control: true, running: true });
assert.equal(row(rows, "mic"), undefined);
assert.equal(row(rows, "notifications"), undefined);

// The orb switched off by the person is fine, not a problem.
rows = R.rows(good, { keepOrb: false });
assert.equal(row(rows, "orb").ok, true);
assert.equal(row(rows, "orb").state, "off-optional");

// "Hey Nova" and background use only appear when the wake word is on.
rows = R.rows({ ...good, battery: false });
assert.equal(row(rows, "wake"), undefined);
assert.equal(row(rows, "battery"), undefined);
rows = R.rows({ ...good, battery: false, wakeOn: true }, { wake: { on: true, state: "ARMED" } });
assert.equal(row(rows, "wake").state, "ready");
assert.equal(row(rows, "battery").action.id, "battery");
assert.match(row(rows, "battery").note, /Sleeping/, "Samsung's own sleeping-apps list is mentioned, not claimed");
rows = R.rows({ ...good, wakeOn: true }, { wake: { on: true, state: "ERROR", note: "“Hey Nova” stopped: The microphone permission is off for Izuki. Tap to try again." } });
assert.equal(row(rows, "wake").action.id, "wake-retry");
assert.match(row(rows, "wake").text, /microphone permission/);
rows = R.rows({ ...good, wakeOn: true }, { wake: { on: true, state: "OFF", lastError: "Android paused “Hey Nova” until Izuki is opened again." } });
assert.match(row(rows, "wake").text, /until Izuki is opened/);
rows = R.rows({ ...good, wakeOn: true, backgroundRestricted: true }, { wake: { on: true, state: "PAUSED" } });
assert.equal(row(rows, "battery").action.id, "app-info");
assert.match(row(rows, "wake").text, /Paused while Izuki is open/);
assert.equal(R.summary(rows).text, "All set", "optional rows never block All set");

// A TV only needs control.
assert.equal(JSON.stringify(R.rows({ tv: true, control: true, running: true }).map((r) => r.id)), JSON.stringify(["control"]));
assert.equal(R.rows(null).length, 0);

console.log("Phone readiness: granted, denied, restricted, not-connected, older APK and wake states pass.");
