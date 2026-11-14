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
    /** Take back a reminder's phone notification (it was cancelled). */
    async cancelReminder({ at, text }) {
      const local = plugin();
      if (!local || !Number.isFinite(at)) return false;
      try {
        await local.cancel({ notifications: [{ id: notificationId(at, text) }] });
        return true;
      } catch (error) {
        console.warn("Izuki native reminder cancel unavailable", error);
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
    /** The phone's accessibility screen: {app, items, w, h, locked}. */
    async screen() {
      try { return (await control()?.screen()) || null; } catch { return null; }
    },
    /** One accessible action: click, focus, type, scroll, tapText, submit, tap, swipe. */
    async act(args) {
      try { return (await control()?.act(args)) || null; } catch { return null; }
    },
    /** A real touch at screen coordinates. */
    async gesture(args) {
      try { return (await control()?.gesture(args)) || null; } catch { return null; }
    },
    /** Open an installed app by name. */
    async launch(name) {
      try { return (await control()?.launch({ name })) || null; } catch { return null; }
    },
    /** Installed launchable apps: [{ name, id }]. */
    async apps() {
      try { return (await control()?.apps())?.apps || []; } catch { return []; }
    },
    /** play, pause, next, previous, stop. */
    async media(key) {
      try { await control()?.media({ key }); return true; } catch { return false; }
    },
    /** up, down, mute, unmute. */
    async volume(dir, steps = 3) {
      try { await control()?.volume({ dir, steps }); return true; } catch { return false; }
    },
    /** Battery, charging, network, lock, screen and volume — safe device facts. */
    async device() {
      try { return (await control()?.device()) || null; } catch { return null; }
    },
    /** The opt-in “Hey Nova” listener: { on, running, available }. */
    async wakeStatus() {
      try { return (await control()?.wakeStatus()) || null; } catch { return null; }
    },
    async wake(on) {
      try { return (await control()?.wake({ on: !!on })) || null; } catch { return null; }
    },
    /** A phrase from a wake that arrived before the page was ready. */
    async takeWake() {
      try { return String((await control()?.takeWake())?.phrase || ""); } catch { return ""; }
    },
    /** Step aside while a live call uses the microphone; the switch stays on. */
    async wakePause(minutes = 30) {
      try { await control()?.wakePause?.({ minutes }); return true; } catch { return false; }
    },
    async wakeResume() {
      try { await control()?.wakeResume?.(); return true; } catch { return false; }
    },
    /** Android reports the phone was unlocked, so a waiting wake can continue. */
    onUnlock(callback) {
      const p = control();
      if (!p?.addListener) return null;
      try { return p.addListener("unlock", () => { try { callback?.(); } catch {} }); } catch { return null; }
    },
    /** Listen for a wake event while the app is open. */
    onWake(callback) {
      const p = control();
      if (!p?.addListener) return null;
      try { return p.addListener("wake", (data) => { try { callback?.(data); } catch {} }); } catch { return null; }
    },
    /** Media, ring, alarm and notification levels, with their maxima. */
    async audio() {
      try { return (await control()?.audio()) || null; } catch { return null; }
    },
    async setVolume(stream, level) {
      try { return (await control()?.setVolume({ stream, level })) || null; } catch { return null; }
    },
    /** Duck other apps while Izuki's voice is speaking. */
    async audioFocus(on) {
      try { return (await control()?.audioFocus({ on: !!on })) || null; } catch { return null; }
    },
    /** A JPEG of the active screen, or null when it is protected/off. */
    async snapshot() {
      try { return (await control()?.snapshot()) || null; } catch { return null; }
    },
    async openAndroidControlSettings() {
      if (!control()) return false;
      try { await control().openAccessibilitySettings(); return true; } catch { return false; }
    },
    async quickDeviceCommand(words) {
      const text = String(words || "").trim().toLowerCase().replace(/\s+on (?:my |the |this )?(?:phone|android)[.!?]*$/, "").replace(/[.!?]+$/, "").trim();
      if (!text || !control()) return null;
      const failed = "I couldn't perform that phone action. Check Android accessibility permission in Settings. I haven't sent it to your PC.";
      const nav = [
        [/^(go )?home$/, "home", "Opened Home."],
        [/^(go )?back$/, "back", "Went back."],
        [/^(show )?(recent|recent apps|app switcher)$/, "recents", "Opened recent apps."],
        [/^(show |open )?notifications$/, "notifications", "Opened notifications."],
        [/^(show |open )?(quick settings|controls)$/, "quick_settings", "Opened Quick Settings."],
        [/^(lock|lock (?:my |the )?phone)$/, "lock", "Locked your phone."],
        [/^(take a |grab a )?screenshot$/, "screenshot", "Took a screenshot."],
        [/^(open )?(power|power menu|shutdown menu)$/, "power", "Opened the power menu."],
      ];
      const found = nav.find(([pattern]) => pattern.test(text));
      if (found) {
        try { await control().perform({ action: found[1] }); return found[2]; } catch { return failed; }
      }
      if (/^(volume up|turn it up|louder)$/.test(text)) {
        return (await window.IzukiNative.volume("up")) ? "Turned the volume up." : failed;
      }
      if (/^(volume down|turn it down|quieter)$/.test(text)) {
        return (await window.IzukiNative.volume("down")) ? "Turned the volume down." : failed;
      }
      if (/^(mute|unmute)$/.test(text)) {
        return (await window.IzukiNative.volume(text)) ? `${text === "mute" ? "Muted" : "Unmuted"} the phone.` : failed;
      }
      const media = text.match(/^(play|pause|resume|play\/pause|next(?: song)?|previous(?: song)?)$/);
      if (media) {
        const key = media[1].startsWith("next") ? "next" : media[1].startsWith("previous") ? "previous" : media[1] === "pause" ? "pause" : media[1] === "play" ? "play" : "playpause";
        return (await window.IzukiNative.media(key)) ? "Done." : failed;
      }
      const open = text.match(/^open (.+)$/);
      if (open) {
        const app = await window.IzukiNative.launch(open[1]);
        return app?.name ? `Opened ${app.name}.` : null;
      }
      const tap = text.match(/^(?:tap|press|click) (.+)$/);
      if (tap) {
        const done = await window.IzukiNative.act({ op: "tapText", text: tap[1] });
        return done?.done ? `Tapped ${tap[1]}.` : failed;
      }
      const scroll = text.match(/^scroll (up|down)$/);
      if (scroll) {
        const done = await window.IzukiNative.act({ op: "scroll", dir: scroll[1] });
        return done?.done ? `Scrolled ${scroll[1]}.` : failed;
      }
      const search = text.match(/^search(?: for)? (.+)$/);
      if (search) {
        const typed = await window.IzukiNative.act({ op: "type", text: search[1], n: 0 });
        if (!typed?.done) return failed;
        await window.IzukiNative.act({ op: "submit" });
        return `Searched for ${search[1]}.`;
      }
      const type = text.match(/^type (.+)$/);
      if (type) {
        const done = await window.IzukiNative.act({ op: "type", text: type[1], n: 0 });
        return done?.done ? `Typed ${type[1]}.` : failed;
      }
      if (/^(read|what'?s on) (?:the |my )?screen$/.test(text)) {
        const screen = await window.IzukiNative.screen();
        if (!screen) return failed;
        const count = Array.isArray(screen.items) ? screen.items.length : 0;
        return `I can see ${count} control${count === 1 ? "" : "s"}${screen.app ? ` in ${screen.app}` : ""}.`;
      }
      return null;
    },
  };
})();
