// Native bridge contract: the PWA remains harmless in a browser, while the
// installed companion can only invoke a small, explicit phone-navigation set.
const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const calls = [];
let prompted = false;
const window = {
  Capacitor: {
    isNativePlatform: () => true,
    getPlatform: () => "android",
    Plugins: {
      IzukiControl: {
        haptic: async () => ({ done: true }),
        status: async () => ({ enabled: true }),
        perform: async ({ action }) => calls.push(action),
        openAccessibilitySettings: async () => calls.push("settings"),
      },
      LocalNotifications: {
        checkPermissions: async () => ({ display: "prompt" }),
        requestPermissions: async () => { prompted = true; return { display: "granted" }; },
        schedule: async ({ notifications }) => calls.push(notifications[0]),
      },
    },
  },
};
vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, "../../docs/app/native.js"), "utf8"), { window, console });

(async () => {
  assert.equal(window.IzukiNative.installed(), true);
  assert.equal(window.IzukiNative.platform(), "android");
  assert.equal(await window.IzukiNative.haptic(), true);
  assert.equal(await window.IzukiNative.takeLaunchPrompt(), "");
  assert.equal(await window.IzukiNative.controlStatus(), true);
  assert.equal(await window.IzukiNative.quickDeviceCommand("go home"), "Opened Home.");
  assert.deepEqual(calls, ["home"]);
  assert.equal(await window.IzukiNative.quickDeviceCommand("open my banking app"), null);
  assert.deepEqual(calls, ["home"], "unrecognised words must never become device actions");
  assert.equal(await window.IzukiNative.scheduleReminder({ at: Date.now() + 60_000, text: "Study" }), true);
  assert.equal(prompted, true);
  assert.equal(calls[1].title, "Izuki reminder");
  assert.equal(calls[1].body, "Study");
  assert.equal(calls[1].sound, "default", "native reminders should use the device's configured alert/haptic behavior");
  assert.equal(await window.IzukiNative.quickDeviceCommand("go home on my phone"), "Opened Home.");
  window.Capacitor.Plugins.IzukiControl.perform = async () => { throw new Error("permission denied"); };
  assert.match(await window.IzukiNative.quickDeviceCommand("go back on my Android"), /haven't sent it to your PC/, "failed phone action must not fall through to a PC command");
  let draft = "Explain this & that";
  window.Capacitor.getPlatform = () => "ios";
  window.Capacitor.Plugins.IzukiDevice = {
    haptic: async () => ({ done: true }),
    takeLaunchPrompt: async () => { const prompt = draft; draft = ""; return { prompt }; },
  };
  assert.equal(window.IzukiNative.platform(), "ios");
  assert.equal(await window.IzukiNative.takeLaunchPrompt(), "Explain this & that");
  assert.equal(await window.IzukiNative.takeLaunchPrompt(), "", "a Siri draft should only be delivered once");
  delete window.Capacitor;
  assert.equal(window.IzukiNative.platform(), "web");
  assert.equal(await window.IzukiNative.haptic(), false);
  console.log("Native bridge: explicit Android actions and native reminders pass.");
})().catch((error) => { console.error(error); process.exitCode = 1; });
