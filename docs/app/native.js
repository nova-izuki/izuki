// Optional native bridge. The same phone experience works as a website; when
// wrapped by the Izuki Companion app, this adds OS-level reminder delivery.
// Every call is defensive so a normal browser never sees a Capacitor error.
(() => {
  "use strict";
  const plugin = () => window.Capacitor?.Plugins?.LocalNotifications;
  const control = () => window.Capacitor?.Plugins?.IzukiControl;
  const device = () => window.Capacitor?.Plugins?.IzukiDevice;
  const platform = () => window.Capacitor?.getPlatform?.() || "web";
  if (typeof document !== "undefined") document.documentElement.dataset.platform = platform();
  const notificationId = (at, text) => {
    let hash = Math.floor(at / 1000) >>> 0;
    for (const ch of String(text)) hash = ((hash * 33) ^ ch.charCodeAt(0)) >>> 0;
    return (hash % 2147483646) + 1;
  };
  window.IzukiNative = {
    installed: () => !!window.Capacitor?.isNativePlatform?.(),
    platform,
    async haptic() {
      try { return !!(await (device() || control())?.haptic())?.done; } catch { return false; }
    },
    async takeLaunchPrompt() {
      try { return String((await device()?.takeLaunchPrompt())?.prompt || "").slice(0, 4000); } catch { return ""; }
    },
    async scheduleReminder({ at, text }) {
      const local = plugin();
      if (!local || !Number.isFinite(at) || at <= Date.now()) return false;
      try {
        let permission = await local.checkPermissions();
        if (permission.display !== "granted") permission = await local.requestPermissions();
        if (permission.display !== "granted") return false;
        await local.schedule({ notifications: [{
          id: notificationId(at, text), title: "Izuki reminder", body: text,
          // `default` lets iPhone use the person's chosen notification sound
          // and haptic setting. Izuki never pretends this is a phone call.
          sound: "default", schedule: { at: new Date(at), allowWhileIdle: true },
          extra: { izukiReminder: true, at, text },
        }] });
        return true;
      } catch (error) {
        console.warn("Izuki native reminder unavailable", error);
        return false;
      }
    },
    async controlStatus() {
      try {
        const status = await control()?.status();
        return !!status?.enabled;
      } catch { return false; }
    },
    async openAndroidControlSettings() {
      if (!control()) return false;
      try { await control().openAccessibilitySettings(); return true; } catch { return false; }
    },
    async quickDeviceCommand(words) {
      const text = String(words || "").trim().toLowerCase().replace(/\s+on (?:my |the |this )?(?:phone|android)[.!?]*$/, "").replace(/[.!?]+$/, "");
      const matches = [[/^(go )?home$/, "home", "Opened Home."], [/^(go )?back$/, "back", "Went back."], [/^(show )?(recent|recent apps|app switcher)$/, "recents", "Opened recent apps."], [/^(show |open )?notifications$/, "notifications", "Opened notifications."], [/^(show |open )?(quick settings|controls)$/, "quick_settings", "Opened Quick Settings."]];
      const found = matches.find(([pattern]) => pattern.test(text));
      if (!found || !control()) return null;
      try { await control().perform({ action: found[1] }); return found[2]; } catch { return "I couldn't perform that phone action. Check Android accessibility permission in Settings. I haven't sent it to your PC."; }
    },
  };
})();
