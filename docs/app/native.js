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
  // The weather now, for the phone home and the TV's top bar — free
  // (Open-Meteo, no key), cached for half an hour.
  const ICONS = [[0, "☀️"], [2, "🌤️"], [3, "☁️"], [48, "🌫️"], [67, "🌧️"], [77, "❄️"], [82, "🌧️"], [86, "❄️"], [99, "⛈️"]];
  window.IzukiWeather = {
    /** The town to use: set by linking to the PC, else remembered ("lives in Lagos"). */
    city() {
      try {
        const set = localStorage.getItem("izuki.homeCity");
        if (set) return JSON.parse(set) || "";
        const mem = JSON.parse(localStorage.getItem("izuki.memories") || "[]");
        for (const m of mem) {
          const hit = String(m).match(/(?:lives in|is based in|is from|located in)\s+([^,.;(]+)/i);
          if (hit) return hit[1].trim();
        }
      } catch {}
      return "";
    },
    async now(city) {
      city = (city || this.city() || "").trim();
      if (!city) return null;
      try {
        const cached = JSON.parse(localStorage.getItem("izuki.weatherNow") || "null");
        if (cached && cached.city === city && Date.now() - cached.at < 30 * 60000) return cached.w;
      } catch {}
      try {
        const geo = await (await fetch("https://geocoding-api.open-meteo.com/v1/search?count=1&language=en&name=" + encodeURIComponent(city))).json();
        const hit = geo.results && geo.results[0];
        if (!hit) return null;
        const f = await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${hit.latitude}&longitude=${hit.longitude}&timezone=auto&current=temperature_2m,weather_code`)).json();
        const code = f.current.weather_code;
        const w = { place: hit.name, temp: Math.round(f.current.temperature_2m), icon: (ICONS.find(([max]) => code <= max) || [0, "🌡️"])[1] };
        try { localStorage.setItem("izuki.weatherNow", JSON.stringify({ city, at: Date.now(), w })); } catch {}
        return w;
      } catch { return null; }
    },
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
    /** A newer Izuki app than this one, if there is: { latest, current, url }. */
    async checkUpdate() {
      try {
        const s = await control()?.status();
        const current = String(s?.version || "");
        if (!current) return null;
        const r = await fetch("https://api.github.com/repos/nova-izuki/izuki/releases/latest", { cache: "no-store" });
        if (!r.ok) return null;
        const latest = String((await r.json()).tag_name || "").replace(/^v/, "");
        const n = (v) => v.split(".").map((x) => parseInt(x, 10) || 0);
        const [a, b] = [n(latest), n(current)];
        const newer = a.some((x, i) => x !== (b[i] || 0)) && a.find((x, i) => x !== (b[i] || 0)) > b[a.findIndex((x, i) => x !== (b[i] || 0))];
        return newer ? { latest, current, url: "https://github.com/nova-izuki/izuki/releases/latest/download/Izuki-Companion-Android-preview.apk" } : null;
      } catch { return null; }
    },
    /** Download it and open Android's installer. "allow" = Android wants permission first. */
    async installUpdate(url) {
      try { await control()?.installUpdate({ url }); return "ok"; }
      catch (e) { return String(e?.message || e) === "allow" ? "allow" : String(e?.message || e); }
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
