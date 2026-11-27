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

  let orbOverApps = false;
  // A read that failed (control not ready yet) is tried again after 30 s,
  // a good one after 10 minutes.
  // The read in flight is shared, so a caller can wait for it.
  let appNames = null, appNamesAt = 0, appNamesTried = 0, appNamesLoad = null;
  const loadAppNames = () => {
    if (appNamesLoad) return appNamesLoad;
    if (Date.now() - appNamesTried < 30000) return Promise.resolve();
    appNamesTried = Date.now();
    appNamesLoad = (async () => {
      try {
        const list = (await control()?.apps?.())?.apps || [];
        if (list.length) { appNames = new Set(list.map((a) => String(a.name || "").trim().toLowerCase())); appNamesAt = Date.now(); }
      } catch {} finally { appNamesLoad = null; }
    })();
    return appNamesLoad;
  };
  let wakeExtra = { audio: "", voice: false };
  // Native speech: one promise per line, settled by the "speech" events.
  const speeches = new Map();
  let speechSeq = 0, speechListening = false;
  /** Bumped by every hush: a clip still being prepared then is never played. */
  let hushes = 0;
  const listenSpeech = () => {
    const p = control();
    if (speechListening || !p?.addListener) return;
    speechListening = true;
    try {
      p.addListener("speech", (d) => {
        const s = speeches.get(String(d?.id || ""));
        if (!s) return;
        if (d.event === "start") { s.onStart?.(); return; }
        speeches.delete(s.id);
        clearTimeout(s.guard);
        s.resolve(d.event || "done");
      });
    } catch {}
  };
  // Listen for Android's speech events from the start: the very first line's
  // "done" must not arrive before anyone is listening for it.
  if (platform() === "android") { listenSpeech(); setTimeout(() => { void loadAppNames(); }, 1500); }
  window.IzukiNative = {
    installed: () => !!window.Capacitor?.isNativePlatform?.(),
    platform,
    /** A page in the phone's own browser; null where there is no bridge. */
    openSite(url) {
      const u = String(url || "");
      if (!/^https?:\/\//i.test(u)) return null;
      try { return control()?.openLink?.({ url: u }) ?? null; } catch { return null; }
    },
    /** Match the Android setting; app launches only leave a resting orb when this is on. */
    setOrbOverApps(on) {
      orbOverApps = !!on;
      try { void control()?.voicePrefs?.({ keep: orbOverApps }); } catch {}
    },
    /** The glowing screen edges over other apps during a voice turn (Android). */
    setEdgeGlow(on) { try { void control()?.voicePrefs?.({ edgeGlow: !!on }); } catch {} },
    /**
     * The rainbow edges over every app for the page's own work: listen,
     * think or talk for `lease` ms unless sent again; "" switches them off.
     * false when Android control is off (the page draws its own then).
     */
    async glow(state = "", lease = 30000) {
      if (!control()?.glow) return false;
      try {
        return !!(await control().glow({ state: String(state || ""), lease: Math.round(Number(lease) || 30000) }))?.shown;
      } catch (e) {
        // The edges didn't light: say so, so "it stopped glowing" has a reason.
        try { window.izukiBugs?.fact("edge glow", (e && e.message) || "failed"); } catch {}
        return false;
      }
    },
    /** The hearing language for native listening and the voice turn ("" = the phone's). */
    /** One colour for the orb that floats over other apps (Android draws it natively). */
    setOrbTint(hex) { try { void control()?.orbTint?.({ color: String(hex || "") }); } catch {} },
    setHearing(lang) { try { void control()?.voicePrefs?.({ lang: String(lang || "") }); } catch {} },
    /** Android's own voice (TextToSpeech) is here: replies are never silent in the app. */
    canSpeak: () => platform() === "android" && !!control()?.say,
    /**
     * Say `text` with Android's voice. Resolves "done", "stopped" or "error"
     * when it has finished (never hangs: a guard covers a lost event).
     * opts: { turn, rate, onStart }.
     */
    speak(text, opts = {}) {
      const p = control();
      if (!p?.say) return Promise.resolve("error");
      listenSpeech();
      const id = `s${Date.now().toString(36)}${++speechSeq}`;
      const words = String(text || "");
      return new Promise((resolve) => {
        const entry = { id, resolve, onStart: opts.onStart, guard: 0 };
        entry.guard = setTimeout(() => { if (speeches.delete(id)) resolve("done"); }, Math.min(180000, 8000 + words.length * 110));
        speeches.set(id, entry);
        p.say({ text: words, id, turn: String(opts.turn || ""), rate: Number(opts.rate) || 1.0 })
          .catch(() => { if (speeches.delete(id)) { clearTimeout(entry.guard); resolve("error"); } });
      });
    },
    /** Android can play a recorded line (Gemini's natural voice) over other apps. */
    canPlayClip: () => platform() === "android" && !!control()?.playClip,
    /**
     * Play a recorded line (a WAV object URL or Blob) with Android's player:
     * the natural voice in a voice turn over another app, where the page
     * can't make a sound. Resolves like speak(): "done", "stopped" or "error".
     * opts: { turn, onStart }.
     */
    async playClip(wav, words = "", opts = {}) {
      const p = control();
      if (!p?.playClip) return "error";
      const generation = hushes;
      let audio = "";
      try {
        const blob = wav instanceof Blob ? wav : await (await fetch(wav)).blob();
        const bytes = new Uint8Array(await blob.arrayBuffer());
        let bin = "";
        for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
        audio = btoa(bin);
      } catch { return "error"; }
      if (generation !== hushes) return "stopped";
      listenSpeech();
      const id = `c${Date.now().toString(36)}${++speechSeq}`;
      const text = String(words || "");
      return new Promise((resolve) => {
        const entry = { id, resolve, onStart: opts.onStart, guard: 0 };
        // About 48 KB a second of speech: never wait much longer than it lasts.
        entry.guard = setTimeout(() => { if (speeches.delete(id)) resolve("done"); }, Math.min(180000, 8000 + (audio.length * 3 / 4 / 48000) * 1000 * 1.5));
        speeches.set(id, entry);
        p.playClip({ audio, text, id, turn: String(opts.turn || "") })
          .catch(() => { if (speeches.delete(id)) { clearTimeout(entry.guard); resolve("error"); } });
      });
    },
    /** The phone's voices for the picker, best first: [{name, label, online}]. */
    async voices() {
      try { return (await control()?.voices?.())?.voices || []; } catch { return []; }
    },
    /** Use this voice ("" = the best one installed). */
    setVoice(name) { try { void control()?.voicePrefs?.({ voice: String(name || "") }); } catch {} },
    /** Stop Android's voice now. */
    async hushSpeech() { hushes++; try { await control()?.hush?.(); } catch {} },
    /** Native ears are here (Android's speech recognizer, one session at a time). */
    canListen: () => platform() === "android" && !!control()?.listen,
    /**
     * One listening session with Android's recognizer: {text, error}. error is
     * "" (words), "silence", "permission", "busy", "unavailable", "cancelled"…
     * `onPartial(words)` sees the words as they are heard.
     */
    async listen(onPartial) {
      const p = control();
      if (!p?.listen) return { text: "", error: "unavailable" };
      let sub = null;
      try { sub = await p.addListener?.("hearing", (d) => { try { onPartial?.(String(d?.text || "")); } catch {} }); } catch {}
      try { return (await p.listen()) || { text: "", error: "client" }; }
      catch { return { text: "", error: "client" }; }
      finally { try { await sub?.remove?.(); } catch {} }
    },
    /** End the listening session: `finish` keeps the words heard so far ("I'm done"), else drops them. */
    async stopListening(finish = false) { try { await control()?.stopListening?.({ finish: !!finish }); } catch {} },
    /** The page's own microphone is open (or closed): the "Hey Nova" listener steps aside meanwhile. */
    micBusy(on) { try { void control()?.micBusy?.({ on: !!on }); } catch {} },
    /** A voice turn from the orb, "Hey Nova", the tile or the notification: {id, text, locked, source, wake, followUp}. */
    onTurn(callback) {
      const p = control();
      if (!p?.addListener) return null;
      try { return p.addListener("turn", (d) => { try { callback?.(d || {}); } catch {} }); } catch { return null; }
    },
    /** A tap on the orb while it shows the page's own work ("Tap to stop"). */
    onStop(callback) {
      const p = control();
      if (!p?.addListener) return null;
      try { return p.addListener("stop", () => { try { callback?.(); } catch {} }); } catch { return null; }
    },
    /** The person stopped a turn (a tap on the orb): {id}. */
    onTurnCancel(callback) {
      const p = control();
      if (!p?.addListener) return null;
      try { return p.addListener("turnCancel", (d) => { try { callback?.(d || {}); } catch {} }); } catch { return null; }
    },
    /** Progress on the orb during a turn ("Opening Settings…"). */
    turnState(id, state, text) { try { void control()?.turnState?.({ id: String(id || ""), state: String(state || "think"), text: String(text || "") }); } catch {} },
    /** The turn is answered; `follow` listens again because the answer asked something. */
    turnDone(id, follow = false) { try { void control()?.turnDone?.({ id: String(id || ""), follow: !!follow }); } catch {} },
    /** A wait that a hidden page's slowed-down timers can't stretch. */
    async pause(ms) {
      const p = control();
      if (p?.pause) { try { await p.pause({ ms: Math.max(0, Math.round(ms)) }); return; } catch {} }
      await new Promise((r) => setTimeout(r, ms));
    },
    /** {total, free, used} bytes of the phone's storage, or null. */
    async storage() {
      try { return (await control()?.storage?.()) || null; } catch { return null; }
    },
    /** Straight to a Settings page or quick panel by name (wifi, bluetooth, storage, battery…). */
    async openPanel(name) {
      try { return (await control()?.openPanel?.({ name: String(name || "") })) || null; } catch { return null; }
    },
    /** The flashlight: true/false sets it, undefined toggles. Resolves {on} or null. */
    async torch(on) {
      const p = control();
      if (!p?.torch) return null;
      try { return (await p.torch(on === undefined ? {} : { on: !!on })) || null; } catch { return null; }
    },
    /**
     * A short native recording ({type: "audio/wav", b64, peak}) for Teach my
     * voice. `onLevel(0…1)` follows the sound while it records.
     */
    async recordClip(ms = 3800, onLevel) {
      const p = control();
      if (!p?.recordClip) return null;
      let sub = null;
      try { sub = await p.addListener?.("clipLevel", (d) => { try { onLevel?.(Number(d?.level) || 0); } catch {} }); } catch {}
      try {
        const r = await p.recordClip({ ms });
        return r?.audio ? { type: "audio/wav", b64: r.audio, peak: Number(r.peak) || 0 } : null;
      } finally { try { await sub?.remove?.(); } catch {} }
    },
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
      const allowed = ["home", "back", "recents", "notifications", "quick_settings", "lock", "screenshot", "power", "split_screen"];
      if (!control() || !allowed.includes(String(action))) return false;
      try { await control().perform({ action }); return true; } catch { return false; }
    },
    async controlStatus() {
      try {
        const status = await control()?.status();
        return !!status?.enabled;
      } catch { return false; }
    },
    /** Every permission the companion uses, for the one-tap Phone health card. */
    async repairStatus() {
      try { return (await control()?.repairStatus?.()) || null; } catch { return null; }
    },
    /** Phone Readiness: what Android reports for each capability (newer APKs). */
    async readiness() {
      const p = control();
      try { return (await (p?.readiness ? p.readiness() : p?.repairStatus?.())) || null; } catch { return null; }
    },
    /** The developer diagnostics: states, versions, recent wake transitions. No screen text. */
    async diagnostics() {
      try { return (await control()?.diagnostics?.()) || null; } catch { return null; }
    },
    /** Android asks once whether Izuki may run in the background (for "Hey Nova"). */
    async requestBatteryExemption() {
      const p = control();
      try {
        if (p?.requestBatteryExemption) { await p.requestBatteryExemption(); return true; }
        if (p?.openBatterySettings) { await p.openBatterySettings(); return true; }
      } catch {}
      return false;
    },
    /**
     * Android 13+ asks for notifications at runtime: ask with Android's own
     * prompt first, and only send the person to Settings when it was refused.
     * Resolves "granted", "denied" or "unavailable".
     */
    async requestNotifications() {
      const local = plugin();
      if (!local?.requestPermissions) return "unavailable";
      try {
        let p = await local.checkPermissions();
        if (p.display === "granted") return "granted";
        p = await local.requestPermissions();
        return p.display === "granted" ? "granted" : "denied";
      } catch { return "unavailable"; }
    },
    /** Izuki came back to the front (often from Android Settings). */
    onResume(callback) {
      const p = control();
      if (!p?.addListener) return null;
      try { return p.addListener("resume", () => { try { callback?.(); } catch {} }); } catch { return null; }
    },
    /** Android connected or dropped Izuki's accessibility service. */
    onControl(callback) {
      const p = control();
      if (!p?.addListener) return null;
      try { return p.addListener("control", (data) => { try { callback?.(!!data?.connected); } catch {} }); } catch { return null; }
    },
    /** Where the floating orb is and why it isn't showing. */
    async orbStatus() {
      try { return (await control()?.orbStatus?.()) || null; } catch { return null; }
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
    /**
     * Wait until Android shows `pkg` in front (true), or give up (false).
     * null when it can't be checked (no package id from an older APK, or
     * control off) — then nobody should claim either way.
     */
    async waitForApp(pkg, ms = 8000) {
      if (!pkg || !control()?.screen) return null;
      const until = Date.now() + ms;
      while (Date.now() < until) {
        let s = null;
        try { s = await control().screen(); }
        catch (e) {
          // Control off or the phone locked: this can't be checked, so don't claim either way.
          if (/off|locked/i.test(String(e?.message || e))) return null;
          s = null;
        }
        if (s && s.app === pkg && Array.isArray(s.items) && s.items.length) return true;
        await new Promise((r) => setTimeout(r, 350));
      }
      return false;
    },
    /** Plain words for why a phone action didn't happen ({reason} from the native side). */
    why(result, what = "") {
      const reason = String(result?.reason || "");
      const thing = what || "that";
      switch (reason) {
        case "off": return "Android control is off. Turn it on in Settings → Phone → Phone readiness.";
        case "not-found": return `I couldn't find ${thing} on this screen.`;
        case "needs-person": return `That control${result?.matched ? ` (“${result.matched}”)` : ""} sends, pays, buys or deletes — tap it yourself.`;
        case "disabled": return `${what ? what[0].toUpperCase() + what.slice(1) : "That control"} is greyed out right now.`;
        case "hidden": return `${what || "That control"} is off the screen. Scroll to it first.`;
        case "no-box": return "There's no text box selected on this screen. Open the search field first.";
        case "password": return "That's a password box — I never type passwords.";
        case "refused": return "Android didn't accept the typing in that box.";
        case "nothing-scrolls": return "Nothing on this screen scrolls.";
        case "at-end": return "That's already the bottom of the list.";
        case "at-top": return "That's already the top of the list.";
        case "cancelled": return "Android cancelled the touch (something else on screen took it).";
        case "unconfirmed": return "I sent the touch, but Android never confirmed it.";
        case "stale": return "The screen changed before I could press it. Try again.";
        case "no-window": return "I can't read this screen (it may be protected).";
        case "no-search-control": return "I couldn't find a Search key here.";
        default: return "";
      }
    },
    /** Open an installed app by name. */
    async launch(name) {
      try { return (await control()?.launch({ name, orb: orbOverApps })) || null; } catch { return null; }
    },
    /** Start Google Maps turn-by-turn; the app must stay plugged in behind it. */
    async navigate(to) {
      try { return (await control()?.navigate({ to: String(to || "").trim(), orb: orbOverApps })) || null; } catch { return null; }
    },
    /**
     * The floating glass orb over other apps: listen, think, talk, rest, trip
     * or idle. Listen/think/talk are leases (`lease` ms, default 20 s): send
     * them again while they stay true, or the orb falls back to resting. "trip"
     * is a drive line that stays until the page changes it or its lease ends.
     */
    async orb(state = "idle", text = "", lease) {
      if (!control() || platform() === "web") return false;
      const mode = String(state || "idle");
      // "Keep the glass orb over other apps" decides whether a resting orb or
      // a drive line stays up. Listening, working and talking always show it:
      // that is Izuki doing something for the person, over whatever is open.
      if (!orbOverApps && (mode === "rest" || mode === "trip")) return false;
      const args = { state: mode, text: String(text || "") };
      if (Number.isFinite(lease)) args.lease = Math.max(0, Math.round(lease));
      try { await control().orb(args); return true; } catch { return false; }
    },
    /** Installed launchable apps: [{ name, id }]. */
    async apps() {
      try { return (await control()?.apps())?.apps || []; } catch { return []; }
    },
    /**
     * Is this exactly an installed app's name? From a list read once (and
     * again after 10 minutes), so "open Find My Mobile" is an app even though
     * it has "find" in it. null until the list has been read.
     */
    isAppName(name) {
      const wanted = String(name || "").trim().toLowerCase();
      if (!appNamesAt || Date.now() - appNamesAt > 600000) void loadAppNames();
      return appNames ? appNames.has(wanted) : null;
    },
    /**
     * Wait (at most `ms`) for the app list when it hasn't been read yet, so
     * a plan made right after startup still knows "Learn and Play Music" is an app.
     */
    async appNamesReady(ms = 2500) {
      if (appNames && Date.now() - appNamesAt <= 600000) return;
      let timer = 0;
      await Promise.race([loadAppNames(), new Promise((r) => { timer = setTimeout(r, ms); })]);
      clearTimeout(timer);
    },
    /** For the tests: read the app list again on the next ask. */
    _resetAppNames() { appNamesTried = 0; appNamesAt = 0; },
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
    /** The person's own wake phrase besides "Hey Nova" ("" clears it). {phrase} or {error}. */
    async setWakePhrase(phrase) {
      const p = control();
      if (!p?.setWakePhrase) return { error: "Update the Android companion to choose your own wake phrase." };
      try { return (await p.setWakePhrase({ phrase: String(phrase || "").trim() })) || {}; }
      catch (error) { return { error: String(error?.message || error || "That phrase can't be used.") }; }
    },
    /** A phrase from a wake that arrived before the page was ready. */
    async takeWake() {
      try {
        const r = await control()?.takeWake();
        // An overlapping empty poll must not erase a wake awaiting unlock.
        if (r?.phrase || r?.audio || r?.voice) wakeExtra = { audio: String(r?.audio || ""), voice: !!r?.voice };
        return String(r?.phrase || "");
      } catch { return ""; }
    },
    /** That wake's audio and whether it was a voice (not a tap), for voice match. Used once. */
    takeWakeAudio() {
      const extra = wakeExtra;
      wakeExtra = { audio: "", voice: false };
      return extra;
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
    /** The exact Android screens, so nobody has to hunt through Settings. */
    async openOverlaySettings() {
      const p = control();
      if (!p?.openOverlaySettings) return false;
      try { await p.openOverlaySettings(); return true; } catch { return false; }
    },
    async openNotificationSettings() {
      const p = control();
      if (!p?.openNotificationSettings) return false;
      try { await p.openNotificationSettings(); return true; } catch { return false; }
    },
    async openBatterySettings() {
      const p = control();
      if (!p?.openBatterySettings) return false;
      try { await p.openBatterySettings(); return true; } catch { return false; }
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
      // The flashlight, quick panels and Settings pages, straight away.
      const torch = text.match(/^(?:turn |switch )?(on|off)? ?(?:the |my )?(?:flash ?light|torch)(?: (on|off))?$/);
      if (torch && (torch[1] || torch[2] || /^(?:flash ?light|torch)$/.test(text))) {
        const want = (torch[1] || torch[2]) === "on" ? true : (torch[1] || torch[2]) === "off" ? false : undefined;
        const r = await window.IzukiNative.torch(want);
        return r ? `Flashlight ${r.on ? "on" : "off"}.` : "I couldn't reach the flashlight (the camera may be in use).";
      }
      const panels = [
        [/^(?:open |show )?(?:wi-?fi|wireless)(?: settings)?$/, "wifi", "Here's Wi-Fi."],
        [/^(?:open |show )?(?:internet|mobile data|data)(?: settings)?$/, "internet", "Here's your internet."],
        [/^(?:open |show )?bluetooth(?: settings)?$/, "bluetooth", "Here's Bluetooth."],
        [/^(?:open |show )?(?:volume|sound) (?:panel|controls|settings)$/, "volume", "Here are the volume controls."],
        [/^(?:open |show )?(?:storage|storage settings)$/, "storage", "Here's your storage."],
        [/^(?:open |show )?(?:battery|battery settings|battery usage)$/, "battery", "Here's your battery."],
        [/^(?:open |show )?(?:display|brightness|display settings)$/, "display", "Here's the display."],
        [/^(?:open |show )?(?:do not disturb|dnd)(?: settings)?$/, "dnd", "Here's Do not disturb."],
        [/^(?:open |show )?(?:settings|phone settings)$/, "settings", "Here's Settings."],
        [/^(?:open |take a |take )?(?:camera|photo|picture)$/, "camera", "Here's the camera."],
      ];
      const panel = panels.find(([pattern]) => pattern.test(text));
      if (panel && panel[1]) {
        const r = await window.IzukiNative.openPanel(panel[1]);
        return r ? panel[2] : failed;
      }
      if (/^(?:how much (?:storage|space)(?: do i have)?(?: left)?|storage left|free space)$/.test(text)) {
        const s = await window.IzukiNative.storage();
        if (!s?.total) return failed;
        const gb = (b) => (b / 1e9 >= 10 ? Math.round(b / 1e9) : Math.round(b / 1e8) / 10) + " GB";
        return `${gb(s.free)} free of ${gb(s.total)}. Say “what's taking space on my phone” and I'll look through Storage.`;
      }
      const nav = [
        [/^(?:split screen|split the screen)$/, "split_screen", "Split screen is on: pick the second app."],
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
      // Only a plain "open <app>"; "open my files and check what's taking
      // space" is a job for the phone agent, not an app name.
      if (open && (window.IzukiNative.isAppName(open[1]) === true
        || (open[1].split(/\s+/).length <= 3 && !/\b(?:and|then|check|what|how|why|find|see|look|show|tell)\b/.test(open[1])))) {
        const app = await window.IzukiNative.launch(open[1]);
        if (!app?.name) return null;
        // Opening is only "opened" once Android shows that app in front.
        const shown = await window.IzukiNative.waitForApp?.(app.id, 6000);
        return shown === true
          ? `Opened ${app.name}. Tap the orb to come back to me.`
          : shown === false
            ? `I asked Android to open ${app.name}, but it hasn't come to the front yet.`
            : `I asked Android to open ${app.name} (I couldn't check that it opened).`;
      }
      const tap = text.match(/^(?:tap|press|click) (.+)$/);
      if (tap) {
        // Android accepting a press isn't proof it did anything (a WebView
        // button can take the action and ignore it): compare the screen.
        const look = (s) => `${s?.app || ""}|${(s?.items || []).slice(0, 40).map((i) => `${i.kind}:${i.text}${i.focused ? "*" : ""}${i.on ? "+" : ""}`).join("|")}`;
        const first = await window.IzukiNative.screen();
        const done = await window.IzukiNative.act({ op: "tapText", text: tap[1] });
        const name = done?.matched && done.matched.toLowerCase() !== tap[1] ? `“${done.matched}”` : tap[1];
        if (!done?.done) return window.IzukiNative.why(done, `“${tap[1]}”`) || failed;
        // Only two readable screens can show a change; otherwise say it wasn't checked.
        if (!first) return `I pressed ${name}, but couldn't read the screen to check that it worked.`;
        const before = look(first);
        for (let i = 0; i < 5; i++) {
          await new Promise((r) => setTimeout(r, 350));
          const now = await window.IzukiNative.screen();
          if (now && look(now) !== before) return `Tapped ${name}.`;
        }
        return `I pressed ${name}, but nothing on the screen changed — it may need another try.`;
      }
      const scroll = text.match(/^scroll (up|down)$/);
      if (scroll) {
        const done = await window.IzukiNative.act({ op: "scroll", dir: scroll[1] });
        if (done?.done) return `Scrolled ${scroll[1]}.`;
        return window.IzukiNative.why(done, "") || failed;
      }
      const search = text.match(/^search(?: for)? (.+)$/);
      if (search) {
        const typed = await window.IzukiNative.act({ op: "type", text: search[1], n: 0 });
        if (!typed?.done) return window.IzukiNative.why(typed, "") || failed;
        const sent = await window.IzukiNative.act({ op: "submit" });
        return sent?.done ? `Searched for ${search[1]}.` : `I typed “${search[1]}”, but couldn't find a Search key to press.`;
      }
      const type = text.match(/^type (.+)$/);
      if (type) {
        const done = await window.IzukiNative.act({ op: "type", text: type[1], n: 0 });
        if (done?.done) return done.verified === false ? `I typed ${type[1]}, but the box didn't show it back to me — check it.` : `Typed ${type[1]}.`;
        return window.IzukiNative.why(done, "") || failed;
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
