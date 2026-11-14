// Native bridge contract: the PWA remains harmless in a browser, while the
// installed companion can only invoke a small, explicit phone-navigation set.
const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const calls = [];
let prompted = false, appSettings = 0, lastNavigate = null, lastInstall = null, lastProgress = null;
const stored = {};
const localStorage = {
  getItem: (key) => (Object.prototype.hasOwnProperty.call(stored, key) ? stored[key] : null),
  setItem: (key, value) => { stored[key] = String(value); },
  removeItem: (key) => { delete stored[key]; },
};
const release = {
  tag_name: "v1.0.211",
  html_url: "https://github.com/nova-izuki/izuki/releases/tag/v1.0.211",
  body: "A calmer update.",
  assets: [{
    name: "Izuki-Companion-Android-preview.apk",
    size: 123456,
    digest: "sha256:" + "a".repeat(64),
    browser_download_url: "https://github.com/nova-izuki/izuki/releases/download/v1.0.211/Izuki-Companion-Android-preview.apk",
  }],
};
const fetch = async () => ({ ok: true, status: 200, json: async () => release });
const window = {
  Capacitor: {
    isNativePlatform: () => true,
    getPlatform: () => "android",
    Plugins: {
      IzukiControl: {
        haptic: async () => ({ done: true }),
        status: async () => ({ enabled: true, version: "1.0.210", versionCode: 210, updateAllowed: true }),
        perform: async ({ action }) => calls.push(action),
        installUpdate: async (args) => { lastInstall = args; return { started: true, version: "1.0.211" }; },
        addListener: (name, callback) => {
          if (name === "updateProgress") lastProgress = callback;
          return { remove() {} };
        },
        openAccessibilitySettings: async () => calls.push("settings"),
        launch: async ({ name }) => {
          if (String(name).toLowerCase() !== "youtube") throw new Error("not installed");
          calls.push("launch:YouTube");
          return { name: "YouTube" };
        },
        navigate: async ({ to, orb }) => { calls.push(`navigate:${to}`); lastNavigate = { to, orb }; return { to }; },
        orb: async ({ state, text }) => { calls.push(`orb:${state}${text ? `:${text}` : ""}`); return true; },
        act: async ({ op, text }) => { calls.push(`act:${op}${text ? `:${text}` : ""}`); return { done: true }; },
        media: async ({ key }) => { calls.push(`media:${key}`); return true; },
        volume: async ({ dir }) => { calls.push(`volume:${dir}`); return true; },
        device: async () => ({ battery: 80, charging: false, online: true, wifi: true, control: true }),
        screen: async () => ({ app: "YouTube", items: [{ n: 1, text: "Search" }, { n: 2, text: "Home" }] }),
        wakeStatus: async () => ({ on: false, running: false, available: true, mic: false, notifications: true }),
        wake: async ({ on }) => { if (on) throw new Error("mic"); return { on: false }; },
        wakePause: async () => { throw new Error("busy"); },
        openAppSettings: async () => { appSettings++; },
      },
      LocalNotifications: {
        checkPermissions: async () => ({ display: "prompt" }),
        requestPermissions: async () => { prompted = true; return { display: "granted" }; },
        schedule: async ({ notifications }) => calls.push(notifications[0]),
      },
    },
  },
};
vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, "../../docs/app/native.js"), "utf8"), { window, console, fetch, localStorage });

(async () => {
  assert.equal(window.IzukiNative.installed(), true);
  assert.equal(window.IzukiNative.platform(), "android");
  assert.equal(await window.IzukiNative.haptic(), true);
  assert.equal(await window.IzukiNative.takeLaunchPrompt(), "");
  assert.equal(await window.IzukiNative.controlStatus(), true);
  assert.equal(await window.IzukiNative.phoneAction("home"), true);
  assert.equal(calls.at(-1), "home");
  assert.equal(await window.IzukiNative.phoneAction("delete everything"), false, "the dock only invokes known phone actions");
  calls.length = 0;
  const update = await window.IzukiNative.checkUpdate({ force: true });
  assert.equal(update.update, true, "a newer tag is an update");
  assert.equal(update.current, "1.0.210");
  assert.equal(update.latest, "1.0.211");
  assert.equal(update.size, 123456);
  assert.equal(update.sha256, "a".repeat(64), "GitHub's digest is passed through for native verification");
  assert.match(update.url, /releases\/download\/v1\.0\.211/);
  const installed = await window.IzukiNative.installUpdate(update);
  assert.equal(installed.ok, true);
  assert.equal(lastInstall.url, update.url);
  assert.equal(lastInstall.sha256, update.sha256);
  assert.equal(lastInstall.size, update.size);
  assert.equal(lastInstall.version, "1.0.211");
  assert.equal(window.IzukiNative.pendingUpdate(), null);
  window.IzukiNative.setPendingUpdate("1.0.211");
  assert.equal(window.IzukiNative.pendingUpdate().version, "1.0.211");
  window.IzukiNative.clearPendingUpdate();
  assert.equal(window.IzukiNative.pendingUpdate(), null);
  assert.ok(window.IzukiNative.onUpdateProgress(() => {}), "a progress listener can subscribe");
  assert.equal(typeof lastProgress, "function", "progress listeners are wired through the native bridge");
  window.Capacitor.Plugins.IzukiControl.status = async () => ({ enabled: true, version: "1.0.211" });
  assert.equal((await window.IzukiNative.checkUpdate({ force: true })).update, false, "the same version is not an update");
  window.Capacitor.Plugins.IzukiControl.status = async () => ({ enabled: true, version: "1.0.210" });
  release.assets = [];
  assert.match((await window.IzukiNative.checkUpdate({ force: true })).error, /APK isn't attached/, "a release without an APK never offers a broken download");
  release.assets = [{ name: "Izuki-Companion-Android-preview.apk", size: 123456, digest: "sha256:" + "a".repeat(64), browser_download_url: "https://github.com/nova-izuki/izuki/releases/download/v1.0.211/Izuki-Companion-Android-preview.apk" }];
  assert.equal(await window.IzukiNative.quickDeviceCommand("go home"), "Opened Home.");
  assert.deepEqual(calls, ["home"]);
  assert.equal(await window.IzukiNative.quickDeviceCommand("open my banking app"), null);
  assert.deepEqual(calls, ["home"], "unrecognised words must never become device actions");
  assert.equal(await window.IzukiNative.quickDeviceCommand("open YouTube"), "Opened YouTube. Tap the orb to come back to me.");
  assert.deepEqual(calls, ["home", "launch:YouTube"]);
  assert.equal(await window.IzukiNative.quickDeviceCommand("take me to Walmart"), "Taking you to Walmart. Google Maps has the turns — tap the orb when you need me.");
  assert.equal(calls.at(-1), "navigate:Walmart");
  assert.equal(lastNavigate.orb, true, "Maps respects the orb preference");
  assert.equal(await window.IzukiNative.orb("listen", ""), true);
  assert.equal(calls.at(-1), "orb:listen");
  window.IzukiNative.setOrbOverApps(false);
  assert.equal(await window.IzukiNative.orb("listen", ""), false, "the off switch gates the native orb");
  assert.equal(await window.IzukiNative.orb("idle", ""), true, "idle can always take an orb away");
  window.IzukiNative.setOrbOverApps(true);
  assert.equal(await window.IzukiNative.quickDeviceCommand("tap Search"), "Tapped search.");
  assert.equal(await window.IzukiNative.quickDeviceCommand("volume up"), "Turned the volume up.");
  assert.equal(await window.IzukiNative.quickDeviceCommand("next song"), "Done.");
  assert.equal(await window.IzukiNative.quickDeviceCommand("lock"), "Locked your phone.");
  assert.equal(await window.IzukiNative.quickDeviceCommand("screenshot"), "Took a screenshot.");
  assert.equal(await window.IzukiNative.quickDeviceCommand("read screen"), "I can see 2 controls in YouTube.");
  assert.equal(await window.IzukiNative.scheduleReminder({ at: Date.now() + 60_000, text: "Study" }), true);
  assert.equal(prompted, true);
  const wakeStatus = await window.IzukiNative.wakeStatus();
  assert.equal(wakeStatus.available, true);
  assert.equal(wakeStatus.mic, false);
  assert.equal(wakeStatus.notifications, true);
  assert.equal((await window.IzukiNative.wake(true)).error, "mic");
  assert.equal(await window.IzukiNative.wakePause(), false, "a failed pause must tell the caller to stop the listener");
  assert.equal(await window.IzukiNative.openAppSettings(), true);
  assert.equal(appSettings, 1);
  const reminder = calls.find((call) => call?.extra?.izukiReminder);
  assert.equal(reminder.title, "Izuki reminder");
  assert.equal(reminder.body, "Study");
  assert.equal(reminder.sound, "default", "native reminders should use the device's configured alert/haptic behavior");
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
  assert.equal(await window.IzukiNative.wakePause(), false, "a browser or older APK must not claim the mic was released");
  assert.equal(await window.IzukiNative.openAppSettings(), false);
  console.log("Native bridge: explicit Android actions and native reminders pass.");
})().catch((error) => { console.error(error); process.exitCode = 1; });
