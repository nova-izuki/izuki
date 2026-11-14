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

  const UPDATE_CACHE = "izuki.updateCache.v1";
  const UPDATE_PENDING = "izuki.updatePending.v1";
  const UPDATE_PAGE = "https://izukinova.ai/#download";
  const UPDATE_APK = "Izuki-Companion-Android-preview.apk";
  const UPDATE_MAX_AGE = 6 * 60 * 60 * 1000;

  /** "1.0.210" and "v1.0.210-beta" both compare as numbers, never strings. */
  const versionParts = (v) => String(v || "").replace(/^v/i, "").split(/[^0-9]+/).filter(Boolean).map((n) => parseInt(n, 10) || 0);
  const compareVersions = (a, b) => {
    const left = versionParts(a), right = versionParts(b);
    const length = Math.max(left.length, right.length);
    for (let i = 0; i < length; i++) {
      const x = left[i] || 0, y = right[i] || 0;
      if (x !== y) return x > y ? 1 : -1;
    }
    return 0;
  };

  let orbOverApps = true;
  window.IzukiNative = {
    installed: () => !!window.Capacitor?.isNativePlatform?.(),
    platform,
    /** Match the Android setting; app launches only leave an orb when this is on. */
    setOrbOverApps(on) { orbOverApps = !!on; },
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
    /** The installed app's own identity, without reading anything personal. */
    async appStatus() {
      try { return (await control()?.status()) || null; } catch { return null; }
    },
    /**
     * The latest preview, checked against the installed package. Returns
     * { update, current, latest, url, size, sha256, notes, releaseUrl, ... }
     * and never claims "up to date" when the check itself failed.
     */
    async checkUpdate({ force = false } = {}) {
      const p = control();
      if (!p) return null;
      try {
        const s = await p.status();
        const current = String(s?.version || "").replace(/^v/i, "").trim();
        if (!current) return { update: false, error: "This Android build didn't report its version.", releaseUrl: UPDATE_PAGE, checkedAt: Date.now() };
        const checkedAt = Date.now();
        if (!force) {
          try {
            const cached = JSON.parse(localStorage.getItem(UPDATE_CACHE) || "null");
            if (cached && cached.current === current && checkedAt - Number(cached.checkedAt || 0) < UPDATE_MAX_AGE) return cached;
          } catch {}
        }
        const r = await fetch("https://api.github.com/repos/nova-izuki/izuki/releases/latest", {
          cache: "no-store",
          headers: { Accept: "application/vnd.github+json" },
        });
        if (!r.ok) throw new Error(r.status === 403 ? "GitHub is rate-limiting update checks. Try again in a few minutes." : `GitHub returned ${r.status}.`);
        const release = await r.json();
        const latest = String(release.tag_name || "").replace(/^v/i, "").trim();
        if (!latest) throw new Error("GitHub didn't name the latest release.");
        const assets = Array.isArray(release.assets) ? release.assets : [];
        const apk = assets.find((a) => a?.name === UPDATE_APK) || assets.find((a) => /\.apk$/i.test(a?.name || ""));
        const base = {
          current,
          latest,
          checkedAt,
          releaseUrl: release.html_url || UPDATE_PAGE,
          notes: typeof release.body === "string" ? release.body.slice(0, 4000) : "",
        };
        if (!apk) {
          // A release can be published a moment before CI attaches its APK.
          // Never send someone to a download URL that isn't there yet.
          return { ...base, update: false, error: `Izuki ${latest} is on GitHub, but its Android APK isn't attached yet. Try again in a minute.` };
        }
        const digest = /^sha256:([a-f0-9]{64})$/i.exec(String(apk.digest || ""))?.[1] || "";
        const url = String(apk.browser_download_url || "");
        if (!/^https:\/\/github\.com\/nova-izuki\/izuki\/releases\//.test(url)) {
          return { ...base, update: false, error: "GitHub didn't return an Izuki release download link." };
        }
        const result = {
          ...base,
          update: compareVersions(latest, current) > 0,
          url,
          size: Number(apk.size) || 0,
          sha256: digest.toLowerCase(),
        };
        try { localStorage.setItem(UPDATE_CACHE, JSON.stringify(result)); } catch {}
        return result;
      } catch (e) {
        return { update: false, error: String(e?.message || e || "Couldn't check for updates."), checkedAt: Date.now(), releaseUrl: UPDATE_PAGE };
      }
    },
    /**
     * Download and verify the APK, then open Android's installer. Resolves
     * { ok, started?, error?, signature?, allow? } — never a bare "ok",
     * because Android still has to accept the package after this returns.
     */
    async installUpdate(update) {
      const p = control();
      if (!p?.installUpdate) return { ok: false, error: "This build can't install updates itself. Use the download page." };
      const spec = typeof update === "string" ? { url: update } : (update || {});
      try {
        const result = await p.installUpdate({
          url: String(spec.url || ""),
          sha256: String(spec.sha256 || ""),
          size: Number(spec.size) || 0,
          version: String(spec.latest || spec.version || ""),
        });
        return { ok: true, ...(result || {}) };
      } catch (e) {
        const error = String(e?.message || e || "The update didn't download.");
        return { ok: false, error, allow: error === "allow", signature: /signature|different key|incompatible|app not installed/i.test(error) };
      }
    },
    /** Download progress from the native verifier: 0–100, or -1 when unknown. */
    onUpdateProgress(callback) {
      const p = control();
      if (!p?.addListener) return null;
      try { return p.addListener("updateProgress", (data) => { try { callback?.(Number(data?.percent ?? -1), data || {}); } catch {} }); } catch { return null; }
    },
    /** Remember the version Android is installing, so a return can confirm it. */
    pendingUpdate() {
      try { return JSON.parse(localStorage.getItem(UPDATE_PENDING) || "null"); } catch { return null; }
    },
    setPendingUpdate(version) {
      try { localStorage.setItem(UPDATE_PENDING, JSON.stringify({ version: String(version || ""), at: Date.now(), seen: false })); } catch {}
    },
    clearPendingUpdate() { try { localStorage.removeItem(UPDATE_PENDING); } catch {} },
    /** A direct, visible phone action for the new home dock. */
    async phoneAction(action) {
      const allowed = ["home", "back", "recents", "notifications", "quick_settings", "lock", "screenshot", "power"];
      if (!control() || !allowed.includes(String(action))) return false;
      try { await control().perform({ action }); return true; } catch { return false; }
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
      try { return (await control()?.launch({ name, orb: orbOverApps })) || null; } catch { return null; }
    },
    /** Start Google Maps turn-by-turn; the app must stay plugged in behind it. */
    async navigate(to) {
      try { return (await control()?.navigate({ to: String(to || "").trim(), orb: orbOverApps })) || null; } catch { return null; }
    },
    /** The floating glass orb over other apps: listen, think, talk, or idle. */
    async orb(state = "idle", text = "") {
      if (!control() || platform() === "web") return false;
      const mode = String(state || "idle");
      // "Keep the glass orb over other apps" is the one gate for every
      // producer, including Maps and Drive. Idle is always allowed so turning
      // the setting off can take an existing orb away.
      if (!orbOverApps && mode !== "idle" && mode !== "hide") return false;
      try { await control().orb({ state: mode, text: String(text || "") }); return true; } catch { return false; }
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
      try { return (await control()?.wake({ on: !!on })) || null; }
      catch (error) { return { error: String(error?.message || error || "wake_failed") }; }
    },
    /** A phrase from a wake that arrived before the page was ready. */
    async takeWake() {
      try { return String((await control()?.takeWake())?.phrase || ""); } catch { return ""; }
    },
    /** Step aside while a live call uses the microphone; the switch stays on. */
    async wakePause(minutes = 30) {
      const p = control();
      // Missing means this is an older APK. Report failure so the caller can
      // stop the listener outright instead of assuming the mic was released.
      if (!p?.wakePause) return false;
      try { await p.wakePause({ minutes }); return true; } catch { return false; }
    },
    async wakeResume() {
      const p = control();
      try {
        if (p?.wakeResume) { await p.wakeResume(); return true; }
        if (p?.wake) { await p.wake({ on: true }); return true; }
        return false;
      } catch { return false; }
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
    /** Izuki's own Android app settings: microphone and notifications. */
    async openAppSettings() {
      if (!control()) return false;
      try { await control().openAppSettings?.(); return true; } catch { return false; }
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
      const go = text.match(/^(?:take me to|navigate to|directions to|drive me to|get me to|route me to|head to)\s+(.+)$/);
      if (go) {
        const typed = String(words || "").trim();
        const original = typed.match(/^(?:take me to|navigate to|directions to|drive me to|get me to|route me to|head to)\s+(.+)$/i);
        const destination = (original?.[1] || go[1])
          .replace(/\s+on (?:my |the |this )?(?:phone|android)[.!?]*$/i, "")
          .replace(/[.!?]+$/, "").trim();
        const map = await window.IzukiNative.navigate(destination);
        if (map?.to && map.navigation !== false) {
          return `Taking you to ${map.to}. Google Maps has the turns — tap the orb when you need me.`;
        }
        if (map?.to) {
          // The phone only had a place-search handler, not turn-by-turn.
          const web = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving&dir_action=navigate`;
          try { window.open(web, "_blank", "noopener"); } catch {}
          return "Google Maps couldn't start turn-by-turn, so I opened directions in your browser.";
        }
        return failed;
      }
      const open = text.match(/^open (.+)$/);
      if (open) {
        const app = await window.IzukiNative.launch(open[1]);
        return app?.name ? `Opened ${app.name}. Tap the orb to come back to me.` : null;
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
