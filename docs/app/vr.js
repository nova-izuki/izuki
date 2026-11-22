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
  // Something to do (rather than to ask): with your PC on the big screen, it's done there.
  const DO = new RegExp(LEAD + "(?:" + [
    String.raw`open|launch|start|close|quit|exit|click|double[-\s]?click|right[-\s]?click|press|tap|hit|type|write|enter|fill\s+in`,
    String.raw`scroll|go\s+(?:to|back|forward|home)|search(?:\s+for)?|google|look\s+up|play|pause|resume|skip|next\s+(?:song|track|video)|previous`,
    String.raw`mute|unmute|turn\s+(?:the\s+)?(?:volume\s+)?(?:up|down|on|off)|volume|maximi[sz]e|minimi[sz]e|switch\s+to|select|copy|paste|undo|redo|save`,
    String.raw`find|move|drag|zoom\s+(?:in|out)|refresh|reload|rename|download|upload|send|reply|sign\s+in|log\s+in|install|show\s+me\s+(?!my\s+(?:pc|computer|laptop|photos|pictures|pics|files|folders))`,
  ].join("|") + String.raw`)\b`, "i");
  /** Was Izuki called by name? { called, rest } (rest: what was said after the name). */
  function named(s, personName) {
    const names = ["nova", "izuki", "izzy"].concat(personName ? [String(personName).toLowerCase()] : []).map((x) => x.replace(/[^a-z]/g, "")).filter(Boolean);
    const alt = names.join("|");
    const lead = new RegExp(String.raw`^(?:(?:hey|hi|hello|ok|okay|yo)[\s,]+)?(?:${alt})\b[\s,.!?:-]*`, "i");
    const inside = new RegExp(String.raw`\b(?:hey|hi|ok|okay)\s+(?:${alt})\b[\s,.!?:-]*`, "i");
    if (lead.test(s)) return { called: true, rest: s.replace(lead, "").trim() };
    if (inside.test(s)) return { called: true, rest: s.replace(inside, " ").replace(/\s+/g, " ").trim() };
    return { called: false, rest: s };
  }
  /** Is this for the PC? Something to do, or anything said "on my PC". */
  const onPc = (s) => DO.test(s) || /\b(?:on|in)\s+(?:my|the)\s+(?:pc|computer|laptop)\b/i.test(s);
  const SLEEP = whole(String.raw`(?:stop|quit)\s+listening|go\s+to\s+sleep|(?:you\s+can\s+)?stop\s+listening\s+now|don'?t\s+listen`);
  // Your PC's folders (the same ones the phone's Remote can open).
  const WHAT = String.raw`(photos|pictures|pics|images|gallery|files|folders|documents|docs|downloads|desktop|music|songs|videos)`;
  const FILES = whole(String.raw`(?:show|open|go\s+(?:in)?to|take\s+me\s+to|let\s+me\s+see|browse|look\s+(?:in|at|through)|bring\s+up)\s+(?:me\s+)?(?:my|the)\s+` + WHAT +
    String.raw`(?:\s+and\s+(?:my\s+)?(?:photos|pictures|files|folders|documents|downloads))?(?:\s+folders?)?(?:\s+(?:on|from|in)\s+(?:my|the)\s+(?:pc|computer|laptop))?`);
  const FILES_HIDE = whole(String.raw`(?:close|hide|put\s+away)\s+(?:my|the)\s+(?:photos|pictures|pics|gallery|files|folders)`);
  const PHOTO_ASK = whole(String.raw`what(?:'s|\s+is)\s+in\s+(?:this|that|the)\s+(?:photo|picture|pic|image)|(?:describe|explain)\s+(?:this|that|the)\s+(?:photo|picture|pic|image)|who(?:'s|\s+is)\s+in\s+(?:this|that|the)\s+(?:photo|picture|pic)|tell\s+me\s+about\s+(?:this|that|the)\s+(?:photo|picture|pic|image)`);
  // A screen: your PC's (shown in the room), or a real one the camera sees.
  const SCREEN = new RegExp(LEAD + "(?:" + [
    String.raw`what(?:'s|\s+is)\s+(?:on|in)\s+(?:my|the|this)\s+(?:pc\s+|computer\s+|laptop\s+)?screen`,
    String.raw`what(?:'s|\s+is)\s+the\s+answer\s+(?:on|to|in)\s+(?:my|the|this)\s+(?:pc\s+|computer\s+)?screen`,
    String.raw`(?:read|explain|check|describe|look\s+at)\s+(?:my|the|this)\s+(?:pc\s+|computer\s+|laptop\s+)?screen`,
    String.raw`help\s+me\s+with\s+(?:my|the|this)\s+(?:pc\s+|computer\s+)?screen`,
    String.raw`what\s+does\s+(?:my|the|this)\s+(?:pc\s+|computer\s+)?screen\s+say`,
  ].join("|") + String.raw`)\b`, "i");
  const FOLDER_OF = { photos: "Pictures", pictures: "Pictures", pics: "Pictures", images: "Pictures", gallery: "Pictures", documents: "Documents", docs: "Documents", downloads: "Downloads", desktop: "Desktop", music: "Music", songs: "Music", videos: "Videos" };
  // The room's look: the orb's colours and (without passthrough) the space around you.
  const STYLE = whole(String.raw`(?:change|switch|new)\s+(?:your|the)\s+(?:look|colou?rs?|style|orb)|(?:change|switch)\s+(?:the|my)\s+(?:room|space|background|scene|world)|(?:a\s+)?new\s+(?:look|room|space|background)`);

  // "What can you do?": a short spoken tour of the room, no brain needed.
  const HELP = whole(String.raw`what\s+(?:can|could)\s+(?:you|i)\s+(?:do|say|ask(?:\s+you)?)(?:\s+(?:here|in\s+here|in\s+vr|with\s+you|for\s+me))?|what\s+are\s+you\s+able\s+to\s+do|show\s+me\s+what\s+you\s+can\s+do|how\s+does\s+(?:this|it)\s+work|help\s+me\s+get\s+started|help`);

  /** A headset-only command in what was said, or null (then it goes to the brain). */
  function command(said) {
    const s = String(said || "").trim();
    if (!s) return null;
    if (EXIT.test(s)) return { kind: "exit" };
    if (HELP.test(s)) return { kind: "help" };
    if (SLEEP.test(s)) return { kind: "sleep" };
    if (PC_HIDE.test(s)) return { kind: "pc-hide" };
    if (PC_SHOW.test(s)) return { kind: "pc" };
    if (PIN.test(s)) return { kind: "pin" };
    if (COME.test(s)) return { kind: "come" };
    if (FILES_HIDE.test(s)) return { kind: "files-hide" };
    const f = s.match(FILES);
    if (f) return { kind: "files", folder: FOLDER_OF[String(f[1]).toLowerCase()] || "" };
    if (PHOTO_ASK.test(s)) return { kind: "photo-ask" };
    if (SCREEN.test(s)) return { kind: "screen" };
    if (STYLE.test(s)) return { kind: /room|space|background|scene|world/i.test(s) ? "space" : "look-style" };
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

  const util = { command, onPc, named, parseLook, wrapLines, fitLines, followTarget, pcPoint, angleGap, LOOK_SYSTEM, lookPrompt };
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
    /**
     * Only a headset's own cameras count: on a PC (a tethered headset or the
     * 3D preview) the only camera is a webcam facing the person, and a
     * photo of their face isn't "what's in front of me".
     */
    async has() {
      if (!HEADSET_UA.test(UA)) return false;
      try {
        const list = await nav.mediaDevices?.enumerateDevices?.();
        return !!list?.some((d) => d.kind === "videoinput");
      } catch { return false; }
    },
    /** Two quick looks share one opening: never two camera streams at once. */
    opening: null,
    open() {
      if (this.stream) return Promise.resolve();
      return (this.opening ||= this.start().finally(() => { this.opening = null; }));
    },
    async start() {
      const my = this.gen;
      const md = nav.mediaDevices;
      let stream;
      try {
        stream = await md.getUserMedia({ video: { facingMode: { exact: "environment" }, width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false });
      } catch (e) {
        if (e?.name !== "OverconstrainedError" && e?.name !== "NotFoundError") throw e;
        // Headset browsers don't always label their cameras: any camera, but never one facing the person.
        stream = await md.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false });
      }
      const stop = () => { try { stream.getTracks().forEach((t) => t.stop()); } catch {} };
      let facing = "";
      try { facing = stream.getVideoTracks?.()[0]?.getSettings?.().facingMode || ""; } catch {}
      if (facing === "user") { stop(); throw Object.assign(new Error("That camera faces you, not the room."), { name: "NotFoundError", facing: true }); }
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
    /**
     * One request to the PC, its body read by `read(response)` inside the
     * same 8-second limit (a stalled download counts as no answer too).
     */
    async call(path, init = {}, read = (r) => r.json().catch(() => ({})), ms = 8000, target = null) {
      // A given PC (the one the room's panel shows), else the chosen one.
      const p = target || this.current();
      if (!p) return { error: PC_WORDS.pair };
      const base = p.link.endsWith("/") ? p.link : p.link + "/";
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), ms);
      try {
        const r = await fetch(base + path, { ...init, cache: "no-store", signal: ctl.signal, headers: { ...(init.headers || {}), Authorization: "Bearer " + p.pass } });
        return { r, body: await read(r) };
      } catch {
        return { error: "I can't reach your PC. Is Izuki open there, with the phone link on?" };
      } finally { clearTimeout(t); }
    },
    explain(text) { const k = String(text || "").trim(); return PC_WORDS[k] || (k ? "Your PC said: " + k.slice(0, 120) : "Your PC didn't answer."); },
    /** The PC's screen now: { blob } or { error }. */
    async shot(w = 1280, target = null) {
      const picture = (r) => r.ok && /^image\//.test(r.headers.get("content-type") || "image/");
      const { r, body, error } = await this.call("remote/screen?w=" + w, {}, (res) => (picture(res) ? res.blob() : res.text().catch(() => "")), undefined, target);
      if (error) return { error };
      if (r.status === 401) return { error: PC_WORDS.pair };
      return picture(r) ? { blob: body } : { error: this.explain(body) };
    },
    async send(body, target = null) {
      const { body: v, error } = await this.call("remote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }, undefined, undefined, target);
      if (error) return { ok: false, error };
      return v.ok ? v : { ok: false, error: this.explain(v.error) };
    },
    async status(target = null) {
      const { body: v, error } = await this.call("remote/status", {}, undefined, undefined, target);
      if (error) return { error };
      if (v.ok === false) return { error: this.explain(v.error) };
      return { doing: String(v.doing || ""), busy: !!v.busy };
    },
    // Your folders, read-only: Desktop, Documents, Downloads, Pictures, Music
    // and Videos (the PC refuses anything outside them, see rtools.rs).
    async roots() {
      const { r, body, error } = await this.call("remote/files/roots");
      if (error) return { error };
      if (r.status === 401) return { error: PC_WORDS.pair };
      return { roots: (Array.isArray(body.roots) ? body.roots : []).filter((x) => x && x.name && x.path) };
    },
    async list(path) {
      const { r, body, error } = await this.call("remote/files/list?p=" + encodeURIComponent(path));
      if (error) return { error };
      if (r.status === 401) return { error: PC_WORDS.pair };
      if (body.ok === false) return { error: this.explain(body.error) };
      return { path: String(body.path || path), up: String(body.up || ""), items: (Array.isArray(body.items) ? body.items : []).filter((x) => x && x.name) };
    },
    /**
     * A job for Izuki on the PC (the phone Remote's "Ask Izuki"): it works on
     * the PC's screen, under the PC's own approval rules, and says what it did.
     */
    async talk(text, target = null) {
      const { r, body, error } = await this.call("talk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) }, undefined, 90000, target);
      if (error) return { error };
      if (!r.ok) return { error: "Your PC didn't take that just now." };
      return { text: String(body.text || body.reply || "") };
    },
    /** A file's bytes: { blob } or { error }. Photos can take a while over the link. */
    async file(path, ms = 30000) {
      const { r, body, error } = await this.call("remote/files/get?p=" + encodeURIComponent(path), {}, (res) => (res.ok ? res.blob() : res.json().catch(() => ({}))), ms);
      if (error) return { error };
      if (r.status === 401) return { error: PC_WORDS.pair };
      if (!r.ok) return { error: this.explain(body?.error) };
      return { blob: body };
    },
  };
  /** Pictures a browser can show (HEIC can't be). */
  const isPicture = (name) => /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(String(name || ""));
  const joinPath = (dir, name) => String(dir).replace(/[\\/]+$/, "") + (String(dir).includes("/") && !String(dir).includes("\\") ? "/" : "\\") + name;

  /** The photo open in the room (from the PC), so "what's in this photo?" knows which. */
  let photo = null;
  /** What the photo panel shows now: "photo" (that PC photo), "camera" or "screen". */
  let panelShows = "";
  /** Each photo you pick gets a number: one that arrives after you picked another (or left) is dropped. */
  let photoPick = 0;
  async function openPhoto(dir, item) {
    if (!isPicture(item.name)) return "I can show pictures here. " + item.name + " isn't one; ask me to open it on your PC.";
    if (Number(item.size) > 25e6) return "That picture is too big to bring over (over 25 MB).";
    const visit = epoch, my = ++photoPick;
    const current = () => vr.active && visit === epoch && my === photoPick;
    const r = await pc.file(joinPath(dir, item.name));
    if (!current()) return "";
    if (r.error) return r.error;
    let bmp = null;
    try { bmp = await createImageBitmap(r.blob); } catch { return current() ? "I can't show that kind of picture here." : ""; }
    if (!current()) { bmp.close?.(); return ""; }
    // Big photos are made smaller: easier to show, and to send when you ask about one.
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(bmp.width * scale)); c.height = Math.max(1, Math.round(bmp.height * scale));
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    bmp.close?.();
    const url = c.toDataURL("image/jpeg", 0.86);
    photo = { b64: url.slice(url.indexOf(",") + 1), url, w: c.width, h: c.height, name: item.name };
    panelShows = "photo";
    // Picked by you: it opens even if this same photo was closed before.
    vr.scene?.showLook({ url, w: c.width, h: c.height, marks: [], say: item.name + ' · say "what\'s in this photo?"', picked: true });
    return "";
  }
  /** A small picture for the gallery (or null): big files are skipped. */
  async function thumb(dir, item) {
    if (!isPicture(item.name) || Number(item.size) > 12e6) return null;
    const r = await pc.file(joinPath(dir, item.name), 20000);
    if (r.error) return null;
    try { return await createImageBitmap(r.blob, { resizeWidth: 320, resizeQuality: "medium" }); }
    catch { try { return await createImageBitmap(r.blob); } catch { return null; } }
  }
  const PHOTO_SYSTEM = LOOK_SYSTEM.replace(
    /^You are Izuki, looking through the camera[^\n]*/,
    "You are Izuki, looking at one of the person's own photos (from their PC) together with them, in their VR headset.",
  );
  const SCREEN_SYSTEM = LOOK_SYSTEM.replace(
    /^You are Izuki, looking through the camera[^\n]*/,
    "You are Izuki, looking at a picture of the person's PC screen, shown big in their VR headset. Read what's on it and help with what they asked; point at the buttons, words or parts that matter.",
  );

  // ---- pinned notes ---------------------------------------------------------
  const notes = {
    list() { const l = store.get("notes", []); return Array.isArray(l) ? l.filter((n) => n && typeof n.text === "string") : []; },
    add(text) { const l = notes.list(); l.push({ text: String(text).slice(0, 600), at: Date.now() }); while (l.length > 8) l.shift(); store.set("notes", l); return l; },
    remove(at) { store.set("notes", notes.list().filter((n) => n.at !== at)); },
  };

  /** What Izuki can do in here, said in a few breaths; it names only what works on this headset now. */
  async function tour() {
    const eyes = await cam.has().catch(() => false);
    return [
      "Here's what I can do in here. Ask me anything, out loud: start with Hey Nova, or tap me first.",
      eyes ? "Hold something up and ask what's this, and I'll look through your headset and point at it." : "",
      pc.current()
        ? "Say show my PC to bring your computer's screen into the room, or show my photos to walk through your pictures."
        : "Pair this headset with your PC once, and I'll bring its screen and your photos right into the room.",
      "Pin an answer to keep it on your wall, say come here to call me over, and say change your look whenever you like.",
    ].filter(Boolean).join(" ");
  }

  // ---- the hooks the app calls ----------------------------------------------
  let lastReply = "";
  /** Listening hands-free since going in (only what's said to Izuki is answered). */
  let heyNova = false;
  /** A tap (the orb, A/X, Talk): the next thing said is for Izuki, no name needed. */
  let armed = false;
  /** When Izuki last answered: a follow-up needs no name for a while. */
  let spokeAt = 0;
  const FOLLOW_ON_MS = 30000;
  /** The orb state the app last set: a look borrows "thinking" and gives it back. */
  let appState = "";
  /** Which visit to VR this is: a look from an earlier one never shows or speaks in a later one. */
  let epoch = 0;
  let sceneP = null;
  const sceneModule = () => (sceneP ||= import("./vr-scene.js").catch((e) => { sceneP = null; throw e; }));

  const vr = {
    active: false,
    scene: null,
    support: () => support,
    /** The hooks the 3D room is given (its taps, photos, the PC); tests use them too. */
    api: () => sceneApi,
    async gate(said) {
      let s = String(said || "").trim();
      // "Hey Nova" in the room: the call listens all the time, but only what's
      // said to Izuki counts (its name, a tap first, or a follow-up just after it spoke).
      const n = named(s, g.IzukiCore?.name?.());
      // "Stop listening" always works, name or not.
      const bare = !n.called && command(s)?.kind === "sleep";
      if (heyNova && !armed && !bare && Date.now() - spokeAt > FOLLOW_ON_MS) {
        if (!n.called) return null;
        if (!n.rest) return { done: true, said: s, say: "Mhm?" };
      }
      armed = false;
      if (n.called && n.rest) s = n.rest;
      const c = command(s);
      const done = (say) => ({ done: true, said: s, say });
      // Your PC on the big screen: something to do is done there while you watch.
      if (!c && vr.scene?.pcShown?.() && onPc(s)) {
        const visit = epoch;
        vr.scene?.orb("thinking");
        try {
          // The PC's answer is kept even if you left the room meanwhile (the window shows it).
          const v = await pc.talk(s, vr.scene?.pcTarget?.());
          return done(v.error || v.text || "Done on your PC.");
        } finally {
          if (vr.active && visit === epoch) vr.scene?.orb(appState);
        }
      }
      if (!c) return { said: s };
      try {
        if (c.kind === "exit") { setTimeout(() => vr.scene?.stop(), 1800); return done("Okay, see you outside."); }
        if (c.kind === "sleep") {
          heyNova = false;
          setTimeout(() => g.IzukiCore?.stopCall?.(), 1500);
          return done("Okay, I've stopped listening. Tap me when you need me.");
        }
        if (c.kind === "help") return done(await tour());
        if (c.kind === "come") { vr.scene?.comeHere(); return done("Here I am."); }
        if (c.kind === "pin") {
          if (!lastReply) return done("There's nothing to pin yet. Ask me something first.");
          vr.scene?.pin(lastReply);
          return done("Pinned. Drag it anywhere you like.");
        }
        if (c.kind === "pc-hide") { vr.scene?.pcClose(); return done("Okay, I put your PC away."); }
        if (c.kind === "pc") return done((await vr.scene?.pcOpen()) || "Here's " + pc.name() + ".");
        if (c.kind === "files-hide") { vr.scene?.filesClose(); return done("Okay, I put them away."); }
        if (c.kind === "files") {
          if (!pc.current()) return done("Your photos and folders live on your PC. Pair this headset with your PC once (leave the room, open Remote in Izuki, then Pair) and I'll open them right here. Your Quest's own photos are kept by Meta, and websites can't open those.");
          return done((await vr.scene?.filesOpen(c.folder)) || (c.folder ? "Here's your " + c.folder + " folder. Point at a picture to see it big." : "Here are your folders."));
        }
        if (c.kind === "look-style" || c.kind === "space") return done(vr.scene?.nextTheme?.() || "There, a new look.");
        if (c.kind === "photo-ask" || c.kind === "screen" || c.kind === "look") {
          const visit = epoch;
          const source = await lookSource(c.kind);
          if (!vr.active || visit !== epoch) return done(lookTrouble(closedError()));
          if (typeof source === "string") return done(source);
          return done(await look(s, visit, source));
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
      if (who === "izuki" && t && !opts?.thinking) spokeAt = Date.now();
      if (who === "izuki" && t && !opts?.thinking && !opts?.error) lastReply = String(t);
      vr.scene?.line(who, t, opts);
    },
    level(v) { vr.scene?.level(v); },
    /** No voice right now: the room says why (the page's Retry can't be seen in a headset). */
    quiet(t) { vr.scene?.notice?.(t, 15000, true); },
    /** "Hey Nova" in the room: listen hands-free (only a call by name is answered). */
    handsFree(on) { heyNova = !!on; },
    homeCard,
    enter,
  };
  g.IzukiVr = vr;

  function lookTrouble(e) {
    const n = e?.name || "";
    if (e?.facing) return "The only camera I can use here faces you, not the room, so I can't see what you mean. On a Quest 3 or 3S, allow the headset camera for this site and ask again.";
    if (n === "NotAllowedError" || n === "SecurityError") return "I need your yes to use the headset camera. Allow the camera for this site, then ask again.";
    if (n === "NotFoundError" || n === "NotReadableError") return "The headset camera isn't free right now. Close other apps using it and ask again.";
    if (n === "AbortError") return String(e.message || "Okay, I stopped looking.");
    return "I couldn't look just now: " + String(e?.message || e || "something went wrong").slice(0, 120);
  }

  /**
   * What a look looks at: { take: () => picture, system }, or the words to say
   * when there's nothing to look at.
   *   photo-ask  the photo from your PC that's open, else the camera
   *   screen     your PC's screen when it's showing; otherwise it says how
   *              (the camera only sees the real room, not the headset's own
   *              windows, and Meta lets only its own assistant see those)
   *   look       the camera, else your PC's screen when it's showing
   */
  async function lookSource(kind) {
    const pcFrame = () => { const f = vr.scene?.pcFrame?.(); if (!f) throw new Error("Your PC's picture isn't showing yet."); return f; };
    const camera = { take: () => cam.frame(), system: LOOK_SYSTEM, shows: "camera" };
    const screen = { take: pcFrame, system: SCREEN_SYSTEM, shows: "screen" };
    // "This photo" is the PC photo only while that's what the panel shows.
    if (kind === "photo-ask" && photo && panelShows === "photo" && vr.scene?.lookShown?.()) return { take: () => photo, system: PHOTO_SYSTEM, shows: "photo" };
    const pcOn = !!vr.scene?.pcShown?.();
    if (kind === "screen") {
      if (pcOn) return screen;
      return "Show me your PC (say \"show my PC\") and ask again, and I'll read its screen with you. For a real screen in front of you, look at it and ask \"what's this?\". I can't see inside other Quest apps: Meta doesn't let websites do that.";
    }
    if (await cam.has()) return camera;
    if (pcOn) return screen;
    return "I can't see through this headset's cameras from here. On a Quest 3 or 3S, allow the camera for this site and ask again. You can still ask me anything, or show me your PC.";
  }

  async function look(question, visit = epoch, source = { take: () => cam.frame(), system: LOOK_SYSTEM }) {
    const core = g.IzukiCore;
    if (!core?.see) throw new Error("Izuki isn't ready yet.");
    const current = () => vr.active && visit === epoch;
    // You picked another photo meanwhile: this answer belongs to the old one, so
    // it never covers the photo you're looking at now.
    const pick = photoPick;
    const repicked = () => Object.assign(new Error("You picked another photo, so I set that answer aside. Ask me about this one."), { name: "AbortError" });
    // A PC photo also has to be the one on show: one picked just before you
    // asked can finish loading while the AI looks at the earlier one.
    let shot = null;
    const stale = () => pick !== photoPick || (source.shows === "photo" && photo !== shot);
    vr.scene?.orb("thinking");
    try {
      shot = await source.take();
      // Left VR while the photo was being taken: nothing is sent.
      if (!current()) throw closedError();
      if (stale()) throw repicked();
      panelShows = source.shows || "camera";
      vr.scene?.showLook({ url: shot.url, w: shot.w, h: shot.h, marks: [], say: "Looking…" });
      const reply = await core.see(lookPrompt(question), shot.b64, "image/jpeg", source.system);
      // Left (or left and came back) while the AI looked: the answer is dropped.
      if (!current()) throw closedError();
      if (stale()) throw repicked();
      const { say, marks } = parseLook(reply);
      vr.scene?.showLook({ url: shot.url, w: shot.w, h: shot.h, marks, say });
      return say;
    } finally {
      if (current()) vr.scene?.orb(appState);
    }
  }

  // ---- going in ---------------------------------------------------------------
  /** The orb: start a hands-free call, or tap the one that's on. */
  function tapOrb() {
    const core = g.IzukiCore;
    if (!core) return;
    if (!core.ready?.()) { vr.scene?.line("izuki", "Add a free AI key in Settings first (Gemini or Groq), then I can hear you and answer."); return; }
    armed = true;
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
    /** A suggestion tapped: asked as if said to Izuki (no name needed). */
    ask: (t) => { armed = true; return g.IzukiCore?.ask?.(t); },
    ready: () => !!g.IzukiCore?.ready?.(),
    // Through the app's own request, so the look lands in the conversation
    // (a follow-up like "and how do I clean it?" knows what "it" is).
    look: () => g.IzukiCore?.ask?.("What am I looking at?"),
    pc,
    notes,
    openPhoto,
    thumb,
    isPicture,
    joinPath,
    lastReply: () => lastReply,
    exited() {
      epoch++;
      photo = null;
      panelShows = "";
      heyNova = false;
      armed = false;
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
  let entering = false;
  async function enter(mode) {
    // A second tap while the room loads does nothing (never two rooms at once).
    if (vr.active || entering) return;
    entering = true;
    try { await goIn(mode); } finally { entering = false; }
  }
  async function goIn(mode) {
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
    epoch++;
    vr.active = true;
    try { g.IzukiCore?.preferRecorder?.(true); } catch {}
    try {
      vr.scene = await mod.start({ mode, session, api: sceneApi, tint: tint() });
    } catch (e) {
      vr.active = false;
      try { g.IzukiCore?.preferRecorder?.(false); } catch {}
      try { await session?.end(); } catch {}
      throw e;
    }
    for (const n of notes.list()) vr.scene.pin(n.text, n.at, true);
    // "Hey Nova" in the room: listening hands-free from the start, like a
    // headset's own assistant; only what's said to Izuki is answered.
    const core = g.IzukiCore;
    if (mode !== "flat" && core?.ready?.() && core.canHear?.() && store.get("heyNova", true) !== false) {
      heyNova = true;
      try { core.startCall?.(); } catch {}
    }
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
      // Opened from the Quest app's icon (?vr=app), it tries to go straight
      // into the room (the icon tap may count as the tap browsers need), and
      // shows the explainer if the headset says no.
      if (wanted && !openedOnce && opts.auto !== false) {
        openedOnce = true;
        if (asApp && (support.ar || support.vr)) void straightIn().then((inside) => { if (!inside) openSheet(); });
        else openSheet();
      }
    };
    supportReady.then(fill, fill);
  }
  let openedOnce = false;
  /** Started as the installed Quest app (quest/twa-manifest.json opens /app/?vr=app). */
  const asApp = (() => { try { return new URLSearchParams(g.location.search).get("vr") === "app"; } catch { return false; } })();
  async function straightIn() {
    if (!g.IzukiCore?.ready?.() || !(await micAllowed())) return false;
    try { await enter(support.ar ? "immersive-ar" : "immersive-vr"); } catch { return false; }
    return vr.active;
  }

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
      "Say “Hey Nova” any time in the room, or point at the orb and pull the trigger (or pinch it), or press A/X. I answer out loud.",
      "Say “what's this?” and I look through the headset camera and circle the answer on the photo (on headsets that share their camera, after your yes). “What's on my screen?” reads your PC's screen.",
      "Say “show my PC” to see your PC's screen big and watch me work on it, or “show my photos” for your PC's pictures. “Change your look” gives the room a new style.",
    ]) steps.appendChild(mk("li", "", s));
    panel.append(head, mk("p", "guide-what", what), steps);

    // What's ready, in plain words.
    const core = g.IzukiCore;
    const ready = !!core?.ready?.();
    const mic = await micAllowed();
    const paired = pc.current();
    const checks = mk("ul", "vr-checks");
    const check = (ok, text) => { const li = mk("li", ok ? "ok" : "", (ok ? "✓ " : "• ") + text); checks.appendChild(li); };
    check(ready, ready ? "Your AI is set up" : "Add a free AI key first (the two steps on the home screen): I need it to answer");
    check(mic, mic ? "Microphone allowed" : "I'll ask for the microphone before you go in");
    // A headset's browser usually can't turn speech into words: a Gemini or Groq key does it.
    if (ready) {
      const hears = !!core?.canHear?.();
      check(hears, hears ? "I can hear you (your Gemini or Groq key turns speech into words)" : "To talk to me in a headset, also add a free Gemini or Groq key in Settings; its browser can't turn speech into words. Look, your PC and pins work without it.");
    }
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
