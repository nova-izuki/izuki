// Izuki in VR: the same companion, in your room (Meta Quest, Pico, Android XR,
// Apple Vision Pro, a PC headset: any browser with WebXR).
//
// This file is small and always loaded. It finds out whether this browser can
// open a VR or mixed-reality session, adds "Izuki in VR" to the home screen,
// and holds what only makes sense in a headset: the voice commands, the
// camera, the PC screen and pinned notes. The 3D room itself (three.js) is
// vr-scene.js, loaded only when you go in.
//
// It is the same Izuki, not a copy. What you say goes through the app's own
// call (hearing, brain, memory, PC link, natural voice: window.IzukiCore), and
// the app tells this file what happens through the same hooks the TV page
// uses (orb state, what was heard, what Izuki says, each chat line, mic level).
//
// In the headset:
//   - The orb floats in front of you: your real room on a headset with
//     passthrough, a calm space otherwise. Point at it and pull the trigger
//     (or pinch it) to talk; again when you're done; while Izuki talks, to cut
//     it off. Hold and move to put it somewhere; "come here" (or B/Y) brings
//     it back.
//   - "What's this?": Izuki looks through the headset camera (only where the
//     browser offers one, and only after your yes), answers, and circles what
//     it means on the photo. A graded quiz or test gets coaching, not answers.
//   - "Show my PC": your PC's screen, big, in the room. Point and click,
//     thumbstick to scroll, and watch Izuki work on it, with Stop.
//   - "Pin that": keeps the last answer as a card in the room.
(function () {
  "use strict";
  const g = typeof window !== "undefined" ? window : globalThis;
  const nav = g.navigator || {};

  // ---- what you can say in a headset ---------------------------------------
  // Whole requests only: "show my PC" opens the screen, but "show my PC's
  // downloads" is a job for the PC, so it goes on to the brain as usual.
  const LEAD = String.raw`^(?:(?:hey|hi|ok|okay)\s+)?(?:(?:nova|izuki)[,\s]+)?(?:(?:can|could|would|will)\s+you\s+|please\s+)?`;
  const TAIL = String.raw`(?:[,\s]+(?:please|for me|now|nova|izuki))*\s*[.!?]*$`;
  const whole = (core) => new RegExp(LEAD + "(?:" + core + ")" + TAIL, "i");

  const LOOK_WHOLE = whole([
    String.raw`what(?:'s|\s+is)\s+(?:this|that)(?:\s+(?:thing|one|here|over here|in front of me|in my hands?|i'?m holding))?`,
    String.raw`what(?:'s|\s+is)\s+in\s+front\s+of\s+me`,
    String.raw`what\s+(?:do|can)\s+you\s+see`,
    String.raw`describe\s+what\s+you\s+see`,
    String.raw`take\s+a\s+look|have\s+a\s+look|look`,
  ].join("|"));
  // These may carry more words after them ("how do I fix this tap?").
  const LOOK_START = new RegExp(LEAD + "(?:" + [
    String.raw`what\s+am\s+i\s+(?:looking\s+at|holding|seeing)`,
    String.raw`(?:look|have\s+a\s+look|take\s+a\s+look)\s+at\s+(?:this|that|it|what\s+i'?m)`,
    String.raw`(?:can|do)\s+you\s+see\s+(?:this|that|it|what\s+i'?m)`,
    String.raw`what\s+(?:kind|type|sort|brand|model)\s+of\s+[\w' -]{1,30}?\s+is\s+(?:this|that|it)`,
    String.raw`what\s+does\s+(?:this|that)\s+(?:say|mean|do)`,
    String.raw`how\s+(?:do|can|should)\s+i\s+(?:use|fix|open|close|clean|install|assemble|build|set\s+up|turn\s+on|turn\s+off|start|repair|cook|plant|water|read|solve)\s+(?:this|that|it)\b`,
    String.raw`how\s+does\s+(?:this|that)\s+work`,
    String.raw`(?:read|translate|explain|identify|check)\s+(?:this|that|it|what\s+i'?m)`,
    String.raw`is\s+(?:this|that)\s+(?:safe|ok|okay|ripe|broken|real|fake|healthy|right|correct|done)`,
    String.raw`help\s+me\s+with\s+(?:this|that)`,
  ].join("|") + String.raw`)\b`, "i");

  const PC_SHOW = whole(String.raw`(?:show|open|bring\s+up|put\s+up|let\s+me\s+see|i\s+want\s+to\s+see)\s+(?:me\s+)?(?:my|the)\s+(?:pc|computer|laptop|desktop)(?:'s)?(?:\s+screen)?|(?:my|the)\s+(?:pc|computer|laptop)(?:'s)?\s+screen`);
  const PC_HIDE = whole(String.raw`(?:close|hide|put\s+away|remove)\s+(?:my|the)\s+(?:pc|computer|laptop|desktop)(?:'s)?(?:\s+screen)?`);
  const PIN = whole(String.raw`(?:pin|keep|stick|save)\s+(?:that|this|it|the\s+answer|your\s+answer)(?:\s+(?:here|there|in\s+(?:my|the)\s+room|on\s+the\s+wall|for\s+later))?`);
  const COME = whole(String.raw`come\s+(?:here|back|closer)|over\s+here|follow\s+me|where\s+are\s+you`);
  const EXIT = whole(String.raw`(?:exit|leave|quit|close|end|stop)\s+(?:vr|virtual\s+reality|mixed\s+reality|the\s+headset(?:\s+view)?|immersive(?:\s+mode)?)`);

  /** A headset-only command in what was said, or null (then it goes to the brain). */
  function command(said) {
    const s = String(said || "").trim();
    if (!s) return null;
    if (EXIT.test(s)) return { kind: "exit" };
    if (PC_HIDE.test(s)) return { kind: "pc-hide" };
    if (PC_SHOW.test(s)) return { kind: "pc" };
    if (PIN.test(s)) return { kind: "pin" };
    if (COME.test(s)) return { kind: "come" };
    if (LOOK_WHOLE.test(s) || LOOK_START.test(s)) return { kind: "look" };
    return null;
  }

  // ---- looking through the headset ----------------------------------------
  const LOOK_SYSTEM = [
    "You are Izuki, looking through the camera of the person's VR headset at what is in front of them: their real room, their hands, whatever they hold up.",
    "Answer what they asked about it like a friend standing next to them: a few spoken sentences, plain words, no markdown. Say what to do next if they asked how.",
    "You may point at up to 4 things in the picture that matter for your answer, each with a 1 to 3 word label.",
    "If it's a quiz, test or exam: explain the idea behind the question and help them work it out, but never give the answers to fill in.",
    "If the picture doesn't show what they asked about (too dark, too far, blurred), say so and how to show it better. Never invent what you can't see. Never read out passwords or card numbers.",
    'Reply with JSON only: {"say": "what you say out loud", "marks": [{"x": 0-1000, "y": 0-1000, "label": "short"}]} where x and y place each mark in the picture (0,0 is the top-left corner, 1000,1000 the bottom-right). Use an empty marks list when pointing wouldn\'t help.',
  ].join("\n");
  const lookPrompt = (question) => {
    const q = String(question || "").trim();
    return (q ? "They asked: " + q : "They asked: what am I looking at?") + "\nAnswer in the language they used.";
  };

  /**
   * The model's reply to a look: what to say and where to draw. Small and free
   * models wrap JSON in fences, think out loud first, or answer in prose; raw
   * JSON is never spoken.
   */
  function parseLook(reply) {
    let t = String(reply || "").replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    const a = t.indexOf("{"), b = t.lastIndexOf("}");
    let data = null;
    if (a >= 0 && b > a) { try { data = JSON.parse(t.slice(a, b + 1)); } catch { data = null; } }
    let say = "", marks = [];
    if (data && typeof data === "object") {
      say = typeof data.say === "string" ? data.say : typeof data.answer === "string" ? data.answer : "";
      const list = Array.isArray(data.marks) ? data.marks : Array.isArray(data.points) ? data.points : [];
      for (const m of list) {
        if (!m || typeof m !== "object") continue;
        const x = Number(m.x), y = Number(m.y);
        if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
        const clamp = (v) => Math.max(0, Math.min(1000, v));
        marks.push({ x: clamp(x), y: clamp(y), label: String(m.label || "").replace(/\s+/g, " ").trim().slice(0, 32) });
        if (marks.length >= 4) break;
      }
    } else {
      // Prose: speak it. A "{" here is JSON that broke off: drop it and what follows.
      say = (t.includes("{") ? t.slice(0, t.indexOf("{")) : t).replace(/[`*_#>{}[\]]+/g, " ");
    }
    say = say.replace(/\s+/g, " ").trim();
    if (!say) say = marks.length ? "Here, have a look." : "I couldn't make that out. Hold it a little closer, in good light, and ask again.";
    return { say, marks };
  }

  // ---- text on 3D cards -----------------------------------------------------
  /** Words into lines no wider than `width` (measure = text → width). Long words break. */
  function wrapLines(text, width, measure) {
    const out = [];
    for (const para of String(text || "").split(/\n+/)) {
      let line = "";
      for (const word of para.split(/\s+/).filter(Boolean)) {
        let w = word;
        while (measure(w) > width && w.length > 1) {
          // A word wider than the card: as much as fits, then the rest.
          let n = w.length - 1;
          while (n > 1 && measure(w.slice(0, n)) > width) n--;
          if (line) { out.push(line); line = ""; }
          out.push(w.slice(0, n));
          w = w.slice(n);
        }
        const next = line ? line + " " + w : w;
        if (measure(next) <= width) line = next;
        else { if (line) out.push(line); line = w; }
      }
      if (line) out.push(line);
    }
    return out;
  }

  /**
   * The biggest font (max → min) at which the text fits `maxLines`; at the
   * smallest size, the last line ends in "…". measure(text, size) → width.
   */
  function fitLines(text, width, maxLines, maxSize, minSize, measure) {
    for (let size = maxSize; size >= minSize; size -= 2) {
      const lines = wrapLines(text, width, (s) => measure(s, size));
      if (lines.length <= maxLines) return { size, lines, cut: false };
    }
    const lines = wrapLines(text, width, (s) => measure(s, minSize));
    if (lines.length <= maxLines) return { size: minSize, lines, cut: false };
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last && measure(last + "…", minSize) > width) last = last.replace(/\s*\S+$/, "");
    kept[maxLines - 1] = (last || "") + "…";
    return { size: minSize, lines: kept, cut: true };
  }

  // ---- staying with you -----------------------------------------------------
  const angleGap = (a, b) => { let d = (a - b) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return Math.abs(d); };
  /**
   * Where the orb should drift to, or null to stay put. It waits until you've
   * turned well away (or walked off), so it never swims around while you look
   * at it. head = { x, y, z, yaw } (yaw 0 looks down -z), orb = { x, y, z }.
   */
  function followTarget(head, orb, opts = {}) {
    const dist = opts.dist ?? 0.75, drop = opts.drop ?? 0.1, turn = opts.turn ?? 0.75, far = opts.far ?? 0.55;
    const tx = head.x - Math.sin(head.yaw) * dist, tz = head.z - Math.cos(head.yaw) * dist, ty = head.y - drop;
    const toOrbYaw = Math.atan2(-(orb.x - head.x), -(orb.z - head.z));
    const off = Math.hypot(orb.x - tx, orb.z - tz);
    const flat = Math.hypot(orb.x - head.x, orb.z - head.z);
    if (angleGap(toOrbYaw, head.yaw) > turn || off > far + dist || flat < 0.3) return { x: tx, y: ty, z: tz };
    return null;
  }

  /** A point on the PC panel (texture u, v; v=0 at the bottom) → the PC's 0..1 screen point. */
  function pcPoint(u, v) {
    const c = (n) => Math.max(0, Math.min(1, n));
    return { nx: c(u), ny: c(1 - v) };
  }

  const util = { command, parseLook, wrapLines, fitLines, followTarget, pcPoint, angleGap, LOOK_SYSTEM, lookPrompt };
  if (typeof module !== "undefined" && module.exports) { module.exports = util; return; }

  // ===========================================================================
  // The browser side.
  // ===========================================================================
  const UA = String(nav.userAgent || "");
  const HEADSET_UA = /OculusBrowser|\bQuest\b|PicoBrowser|Pico Neo|\bPico\b|Wolvic|Android XR|HTC Vive|VIVE Focus|Lynx|Magic Leap|HoloLens/i;
  const PHONE_UA = /iPhone|iPad|Android.*Mobile/i;
  const wanted = (() => { try { return new URLSearchParams(g.location.search).has("vr"); } catch { return false; } })();
  const store = {
    get(k, d) { try { const v = localStorage.getItem("izuki.vr." + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem("izuki.vr." + k, JSON.stringify(v)); } catch {} },
  };

  /** What this browser can open: { ar, vr, headset }. */
  let support = { ar: false, vr: false, headset: HEADSET_UA.test(UA) };
  const supportReady = (async () => {
    const xr = nav.xr;
    if (!xr?.isSessionSupported) return support;
    const ask = (m) => Promise.resolve().then(() => xr.isSessionSupported(m)).catch(() => false);
    const [ar, vr] = await Promise.all([ask("immersive-ar"), ask("immersive-vr")]);
    // A headset browser, or a PC with a headset. A phone's AR (immersive-ar
    // only, through the phone screen) isn't what this is made for.
    support = { ar: !!ar && !PHONE_UA.test(UA), vr: !!vr && !PHONE_UA.test(UA), headset: support.headset || (!!vr && !PHONE_UA.test(UA)) };
    return support;
  })();

  // ---- the headset camera ---------------------------------------------------
  const cam = {
    stream: null, video: null, idle: 0,
    /** Bumped by close(): a camera that opens after you left VR is shut at once. */
    gen: 0,
    async has() {
      try {
        const list = await nav.mediaDevices?.enumerateDevices?.();
        return !!list?.some((d) => d.kind === "videoinput");
      } catch { return false; }
    },
    async open() {
      if (this.stream) return;
      const my = this.gen;
      const md = nav.mediaDevices;
      let stream;
      try {
        stream = await md.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false });
      } catch (e) {
        if (e?.name !== "OverconstrainedError" && e?.name !== "NotFoundError") throw e;
        stream = await md.getUserMedia({ video: true, audio: false });
      }
      const stop = () => { try { stream.getTracks().forEach((t) => t.stop()); } catch {} };
      if (my !== this.gen) { stop(); throw closedError(); }
      const v = document.createElement("video");
      v.muted = true; v.playsInline = true; v.srcObject = stream;
      try { await v.play(); } catch (e) { stop(); throw e; }
      if (my !== this.gen) { stop(); throw closedError(); }
      this.stream = stream;
      this.video = v;
    },
    /** One photo of what's in front of you: { b64, url, w, h }. */
    async frame() {
      await this.open();
      const my = this.gen;
      const v = this.video;
      for (let i = 0; i < 40 && !(v.videoWidth > 0); i++) await new Promise((r) => setTimeout(r, 50));
      // The first frames after the camera opens are often dark: give it a moment.
      await new Promise((r) => setTimeout(r, 250));
      if (my !== this.gen) throw closedError();
      const scale = Math.min(1, 1024 / Math.max(v.videoWidth, v.videoHeight));
      const w = Math.round(v.videoWidth * scale), h = Math.round(v.videoHeight * scale);
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(v, 0, 0, w, h);
      const url = c.toDataURL("image/jpeg", 0.82);
      clearTimeout(this.idle);
      // The camera closes when it isn't needed (battery, and the privacy light).
      this.idle = setTimeout(() => this.close(), 30000);
      return { b64: url.slice(url.indexOf(",") + 1), url, w, h };
    },
    close() {
      this.gen++;
      clearTimeout(this.idle);
      try { this.stream?.getTracks().forEach((t) => t.stop()); } catch {}
      this.stream = null; this.video = null;
    },
  };
  const closedError = () => Object.assign(new Error("You left VR before I could look."), { name: "AbortError" });

  // ---- your PC (the same pairing as the phone's Remote) ---------------------
  const pcs = () => { try { return (JSON.parse(localStorage.getItem("izuki.remotePcs") || "[]") || []).filter((p) => p && p.link && p.pass); } catch { return []; } };
  const PC_WORDS = {
    pair: "This headset isn't paired with your PC yet. Leave VR, open Remote in Izuki and pair your PC once.",
    off: "Turn on “Let my phone control this PC” on your PC: Izuki → Settings → Phone.",
    locked: "Your PC is locked. Unlock it first; I never work the lock screen.",
  };
  const pc = {
    current() { const list = pcs(); const want = store.get("pc", ""); return list.find((p) => p.link === want) || list[0] || null; },
    name() { return this.current()?.name || "your PC"; },
    async call(path, init = {}) {
      const p = this.current();
      if (!p) return { error: PC_WORDS.pair };
      const base = p.link.endsWith("/") ? p.link : p.link + "/";
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 8000);
      try {
        const r = await fetch(base + path, { ...init, cache: "no-store", signal: ctl.signal, headers: { ...(init.headers || {}), Authorization: "Bearer " + p.pass } });
        return { r };
      } catch {
        return { error: "I can't reach your PC. Is Izuki open there, with the phone link on?" };
      } finally { clearTimeout(t); }
    },
    explain(text) { const k = String(text || "").trim(); return PC_WORDS[k] || (k ? "Your PC said: " + k.slice(0, 120) : "Your PC didn't answer."); },
    /** The PC's screen now: { blob } or { error }. */
    async shot(w = 1280) {
      const { r, error } = await this.call("remote/screen?w=" + w);
      if (error) return { error };
      if (r.status === 401) return { error: PC_WORDS.pair };
      if (!r.ok || !/^image\//.test(r.headers.get("content-type") || "image/")) return { error: this.explain(await r.text().catch(() => "")) };
      return { blob: await r.blob() };
    },
    async send(body) {
      const { r, error } = await this.call("remote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (error) return { ok: false, error };
      const v = await r.json().catch(() => ({}));
      return v.ok ? v : { ok: false, error: this.explain(v.error) };
    },
    async status() {
      const { r, error } = await this.call("remote/status");
      if (error) return { error };
      const v = await r.json().catch(() => ({}));
      if (v.ok === false) return { error: this.explain(v.error) };
      return { doing: String(v.doing || ""), busy: !!v.busy };
    },
  };

  // ---- pinned notes ---------------------------------------------------------
  const notes = {
    list() { const l = store.get("notes", []); return Array.isArray(l) ? l.filter((n) => n && typeof n.text === "string") : []; },
    add(text) { const l = notes.list(); l.push({ text: String(text).slice(0, 600), at: Date.now() }); while (l.length > 8) l.shift(); store.set("notes", l); return l; },
    remove(at) { store.set("notes", notes.list().filter((n) => n.at !== at)); },
  };

  // ---- the hooks the app calls ----------------------------------------------
  let lastReply = "";
  /** The orb state the app last set: a look borrows "thinking" and gives it back. */
  let appState = "";
  let sceneP = null;
  const sceneModule = () => (sceneP ||= import("./vr-scene.js").catch((e) => { sceneP = null; throw e; }));

  const vr = {
    active: false,
    scene: null,
    support: () => support,
    async gate(said) {
      const s = String(said || "").trim();
      const c = command(s);
      if (!c) return { said: s };
      const done = (say) => ({ done: true, said: s, say });
      try {
        if (c.kind === "exit") { setTimeout(() => vr.scene?.stop(), 1800); return done("Okay, see you outside."); }
        if (c.kind === "come") { vr.scene?.comeHere(); return done("Here I am."); }
        if (c.kind === "pin") {
          if (!lastReply) return done("There's nothing to pin yet. Ask me something first.");
          vr.scene?.pin(lastReply);
          return done("Pinned. Drag it anywhere you like.");
        }
        if (c.kind === "pc-hide") { vr.scene?.pcClose(); return done("Okay, I put your PC away."); }
        if (c.kind === "pc") return done((await vr.scene?.pcOpen()) || "Here's " + pc.name() + ".");
        if (c.kind === "look") {
          if (!(await cam.has())) {
            // No camera here: with the PC open, "what's this?" is about the PC.
            if (vr.scene?.pcShown?.()) return { said: s };
            return done("I can't see through this headset's cameras from here. On a Quest 3 or 3S, allow the camera for this site and ask again. You can still ask me anything, or show me your PC.");
          }
          return done(await look(s));
        }
      } catch (e) {
        return done(lookTrouble(e));
      }
      return { said: s };
    },
    orb(m) { appState = m || ""; vr.scene?.orb(m); },
    heard(t) { vr.scene?.heard(t); },
    said(t) { vr.scene?.said(t); },
    line(who, t, opts) {
      if (who === "izuki" && t && !opts?.thinking && !opts?.error) lastReply = String(t);
      vr.scene?.line(who, t, opts);
    },
    level(v) { vr.scene?.level(v); },
    homeCard,
    enter,
  };
  g.IzukiVr = vr;

  function lookTrouble(e) {
    const n = e?.name || "";
    if (n === "NotAllowedError" || n === "SecurityError") return "I need your yes to use the headset camera. Allow the camera for this site, then ask again.";
    if (n === "NotFoundError" || n === "NotReadableError") return "The headset camera isn't free right now. Close other apps using it and ask again.";
    if (n === "AbortError") return String(e.message || "Okay, I stopped looking.");
    return "I couldn't look just now: " + String(e?.message || e || "something went wrong").slice(0, 120);
  }

  async function look(question) {
    const core = g.IzukiCore;
    if (!core?.see) throw new Error("Izuki isn't ready yet.");
    vr.scene?.orb("thinking");
    try {
      const shot = await cam.frame();
      // Left VR while the photo was being taken: nothing is sent.
      if (!vr.active) throw closedError();
      vr.scene?.showLook({ url: shot.url, w: shot.w, h: shot.h, marks: [], say: "Looking…" });
      const reply = await core.see(lookPrompt(question), shot.b64, "image/jpeg", LOOK_SYSTEM);
      const { say, marks } = parseLook(reply);
      vr.scene?.showLook({ url: shot.url, w: shot.w, h: shot.h, marks, say });
      return say;
    } finally {
      vr.scene?.orb(appState);
    }
  }

  // ---- going in ---------------------------------------------------------------
  /** The orb: start a hands-free call, or tap the one that's on. */
  function tapOrb() {
    const core = g.IzukiCore;
    if (!core) return;
    if (!core.ready?.()) { vr.scene?.line("izuki", "Add a free AI key in Settings first (Gemini or Groq), then I can hear you and answer."); return; }
    if (!core.calling?.()) core.startCall?.();
    else core.tap?.();
  }

  const sceneApi = {
    util,
    tapOrb,
    hangUp: () => g.IzukiCore?.stopCall?.(),
    calling: () => !!g.IzukiCore?.calling?.(),
    speak: (t) => g.IzukiCore?.speak?.(t),
    hasCamera: () => cam.has(),
    // Through the app's own request, so the look lands in the conversation
    // (a follow-up like "and how do I clean it?" knows what "it" is).
    look: () => g.IzukiCore?.ask?.("What am I looking at?"),
    pc,
    notes,
    lastReply: () => lastReply,
    exited() {
      vr.active = false;
      vr.scene = null;
      cam.close();
      try { g.IzukiCore?.preferRecorder?.(false); } catch {}
      try { g.IzukiCore?.stopCall?.(); } catch {}
    },
  };

  /**
   * Go in. mode: "immersive-ar" (your room), "immersive-vr" (a calm space),
   * or "flat" (a 3D preview on a normal screen). The session is asked for
   * first, straight from the tap: browsers only allow it right after one.
   */
  async function enter(mode) {
    if (vr.active) return;
    const xr = nav.xr;
    let sessionP = null;
    if (mode !== "flat") {
      if (!xr?.requestSession) throw new Error("This browser can't open VR.");
      sessionP = xr.requestSession(mode, { optionalFeatures: ["local-floor", "hand-tracking"] });
    }
    let session, mod;
    try {
      [session, mod] = await Promise.all([sessionP, sceneModule()]);
    } catch (e) {
      // The room didn't load: never leave the headset in an empty session,
      // whether the session arrived before the failure or after it.
      sessionP?.then((s) => s.end().catch(() => {}), () => {});
      throw e;
    }
    vr.active = true;
    try { g.IzukiCore?.preferRecorder?.(true); } catch {}
    try {
      vr.scene = await mod.start({ mode, session, api: sceneApi, tint: tint() });
    } catch (e) {
      vr.active = false;
      try { await session?.end(); } catch {}
      throw e;
    }
    for (const n of notes.list()) vr.scene.pin(n.text, n.at, true);
  }

  const tint = () => { try { const t = localStorage.getItem("izuki.orbTint") || ""; return /^#[0-9a-f]{6}$/i.test(t) ? t : ""; } catch { return ""; } };

  // ---- the card on the home screen, and its explainer -------------------------
  const ICON = "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M3 9.5A2.5 2.5 0 0 1 5.5 7h13A2.5 2.5 0 0 1 21 9.5v5a2.5 2.5 0 0 1-2.5 2.5h-3.2a1.8 1.8 0 0 1-1.6-1l-.6-1.2a1.2 1.2 0 0 0-2.2 0l-.6 1.2a1.8 1.8 0 0 1-1.6 1H5.5A2.5 2.5 0 0 1 3 14.5Z'/><circle cx='8' cy='12' r='1.4'/><circle cx='16' cy='12' r='1.4'/></svg>";
  const mk = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

  /** Adds "Izuki in VR" to the home screen on a headset (or with ?vr in the address). */
  function homeCard(w, opts = {}) {
    const slot = mk("div");
    w.appendChild(slot);
    const fill = () => {
      if (!(support.headset || support.ar || support.vr || wanted)) return;
      slot.replaceChildren(mk("p", "home-label", "In your headset"));
      const list = mk("div", "feature-list");
      const row = mk("button", "feature-row");
      row.type = "button";
      const icon = mk("i"); icon.innerHTML = ICON;
      const words = mk("span", "feature-words");
      words.append(mk("b", "", "Izuki in VR"), mk("small", "", support.ar ? "The orb in your room. Talk, show it things, see your PC" : support.vr ? "The orb beside you. Talk, ask, see your PC big" : "A 3D preview here; the real thing in a headset"));
      const side = mk("span", "feature-side");
      side.append(mk("span", "feature-pill on", support.ar || support.vr ? "Go in" : "Preview"));
      row.append(icon, words, side);
      row.onclick = openSheet;
      list.appendChild(row);
      slot.appendChild(list);
      // izukinova.ai/vr opens the explainer once, after the AI is set up.
      if (wanted && !openedOnce && opts.auto !== false) { openedOnce = true; openSheet(); }
    };
    supportReady.then(fill, fill);
  }
  let openedOnce = false;

  async function micAllowed() {
    if (store.get("micOk", false)) return true;
    try { const p = await nav.permissions?.query?.({ name: "microphone" }); return p?.state === "granted"; } catch { return false; }
  }

  async function openSheet() {
    const sheet = document.getElementById("guide-sheet"), panel = document.getElementById("guide-panel");
    if (!sheet || !panel) return;
    void sceneModule().catch(() => {});
    panel.replaceChildren();
    const head = mk("div", "guide-head");
    const icon = mk("i", "guide-icon"); icon.innerHTML = ICON;
    const close = mk("button", "tools-close");
    close.type = "button"; close.setAttribute("aria-label", "Close");
    close.innerHTML = "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round'><path d='M18 6 6 18M6 6l12 12'/></svg>";
    close.onclick = () => { sheet.hidden = true; panel.replaceChildren(); };
    const h2 = mk("h2", "", "Izuki in VR"); h2.id = "guide-title";
    head.append(icon, h2, close);
    const inHeadset = support.ar || support.vr;
    const what = inHeadset
      ? (support.ar ? "Your Izuki, floating in your real room. Talk to it, show it things, and put your PC's screen up big, all without taking the headset off." : "Your Izuki beside you in a calm space. Talk to it and put your PC's screen up big, all without taking the headset off.")
      : "This browser has no headset, so you get a 3D preview here. Open izukinova.ai/vr in your headset's browser (Meta Quest, Pico, Android XR, Vision Pro) for the real thing.";
    const steps = mk("ol", "guide-steps");
    for (const s of [
      "Point at the orb and pull the trigger (or pinch it) to talk. Do it again when you're done; I answer out loud.",
      "Say “what's this?” and I look through the headset camera and circle the answer on the photo (on headsets that share their camera, after your yes).",
      "Say “show my PC” to see your PC's screen big, click on it, and watch me work on it.",
    ]) steps.appendChild(mk("li", "", s));
    panel.append(head, mk("p", "guide-what", what), steps);

    // What's ready, in plain words.
    const core = g.IzukiCore;
    const ready = !!core?.ready?.();
    const mic = await micAllowed();
    const paired = pc.current();
    const checks = mk("ul", "vr-checks");
    const check = (ok, text) => { const li = mk("li", ok ? "ok" : "", (ok ? "✓ " : "• ") + text); checks.appendChild(li); };
    check(ready, ready ? "Your AI is set up" : "Add a free AI key first (Settings): I need it to hear you and answer");
    check(mic, mic ? "Microphone allowed" : "I'll ask for the microphone before you go in");
    check(!!paired, paired ? "Your PC is paired: " + paired.name : "Your PC: open Remote once (outside VR) to pair it");
    panel.appendChild(checks);

    const note = mk("p", "guide-need", "");
    note.hidden = true;
    const say = (t) => { note.textContent = t; note.hidden = !t; };
    const actions = mk("div", "guide-actions");
    const main = mk("button", "guide-main");
    main.type = "button";
    const mode = support.ar ? "immersive-ar" : support.vr ? "immersive-vr" : "flat";
    let micNow = mic;
    // A headset needs the AI (and the microphone) before going in; the 3D
    // preview on a normal screen can be looked around without either.
    const label = () => (mode === "flat" ? "Open the 3D preview" : !ready ? "Set up my free key first" : !micNow ? "Allow the microphone" : mode === "immersive-ar" ? "Go into my room" : "Enter VR");
    main.textContent = label();
    const go = (m) => {
      say("");
      // No await before enter(): the browser only opens VR straight from a tap.
      enter(m).then(() => { sheet.hidden = true; panel.replaceChildren(); }, (e) => say(String(e?.message || e || "Couldn't open VR.")));
    };
    main.onclick = async () => {
      if (mode === "flat") return go("flat");
      // The home screen's own two steps set the key up.
      if (!ready) { sheet.hidden = true; panel.replaceChildren(); document.getElementById("setup-key")?.focus(); return; }
      if (!micNow && mode !== "flat") {
        try {
          const s = await nav.mediaDevices.getUserMedia({ audio: true });
          s.getTracks().forEach((t) => t.stop());
          micNow = true; store.set("micOk", true);
          checks.children[1].textContent = "✓ Microphone allowed"; checks.children[1].className = "ok";
          main.textContent = label();
        } catch { say("Without the microphone I can't hear you. Allow it for this site in the browser's settings, then try again."); }
        return;
      }
      go(mode);
    };
    actions.appendChild(main);
    if (support.ar && support.vr) {
      const calm = mk("button", "guide-try", "Use a calm space instead");
      calm.type = "button";
      calm.onclick = () => { if (ready && micNow) go("immersive-vr"); else main.click(); };
      actions.appendChild(calm);
    }
    panel.append(actions, note, mk("p", "guide-try-label", "The camera is only used when you ask “what's this?”, and that one photo goes to your own AI."));
    sheet.hidden = false;
  }

  // A little styling of our own (everything else is the app's).
  try {
    const css = document.createElement("style");
    css.textContent = ".vr-checks{list-style:none;margin:14px 0 4px;padding:12px 14px;border-radius:16px;background:rgba(255,255,255,.05);display:grid;gap:6px;font-size:14px;line-height:1.4;color:#c9d2ea}.vr-checks .ok{color:#8ff0e2}";
    document.head.appendChild(css);
  } catch {}
})();
