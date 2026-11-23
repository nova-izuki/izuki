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
    // Speech-to-text often mishears the name when it's shouted or said fast
    // ("Hey Noah", "Hey Nava", "Hey Isuki"). Right after a greeting those count
    // too; on their own they don't ("Noah is coming" isn't a call).
    const loose = new RegExp(String.raw`^(?:hey|hi|hello|ok|okay|yo)[\s,]+(?:${MISHEARD})\b[\s,.!?:-]*`, "i");
    if (loose.test(s)) return { called: true, rest: s.replace(loose, "").trim() };
    return { called: false, rest: s };
  }
  const MISHEARD = String.raw`no(?:ah|vah|ver|vo|ba|wa)|nava|nover|know\s+va|no\s+va|novas|i[sz](?:u|oo)k(?:i|ee|y)|isaacy|is\s+uki|izzie`;

  // The room's own browser (no PC needed): "search the web for…", "google…",
  // "look … up". With your PC on the big screen, a search is done there
  // instead (unless you say "in here" or "in the browser").
  const ONLINE = String.raw`(?:\s+(?:online|on\s+(?:the\s+)?(?:web|internet|google)|(?:in|on)\s+(?:the\s+|your\s+)?browser|in\s+here))?`;
  const WEB = whole([
    String.raw`(?:search|look)\s+(?:on\s+)?(?:the\s+)?(?:web|internet|online|google)\s+(?:for|up)\s+(.+?)` + ONLINE,
    String.raw`(?:search\s+for|search|google|look\s+up)\s+(.+?)` + ONLINE,
    String.raw`look\s+(.+?)\s+up` + ONLINE,
  ].join("|"));
  const WEB_OPEN = whole(String.raw`(?:open|show|bring\s+up|pull\s+up)\s+(?:me\s+)?(?:the\s+|a\s+|your\s+)?(?:web\s+)?(?:browser|internet|google)`);
  const WEB_HIDE = whole(String.raw`(?:close|hide|put\s+away)\s+(?:the\s+|your\s+)?(?:web\s+)?(?:browser|search(?:\s+results)?|results)`);
  const HERE = /\b(?:in\s+here|in\s+(?:vr|the\s+room)|(?:in|on)\s+(?:the|your)\s+browser|online|on\s+the\s+(?:web|internet))\b/i;
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
  // "Show me where": it points and numbers the steps so you do it yourself
  // (the PC lane does things for you; this one teaches).
  const GUIDE = new RegExp(LEAD + "(?:" + [
    String.raw`where\s+(?:do|should|can|would|could)\s+i\s+(?:click|tap|press|select|go|find|put|plug|connect|insert|type|turn|switch)\b`,
    String.raw`where(?:'s|\s+is|\s+are)\s+the\s+(?:[\w' -]{1,40}?\s+)?(?:button|setting|option|menu|icon|switch|tab|link|port|plug|key|slot)s?\b`,
    String.raw`show\s+me\s+where\b`,
    String.raw`(?:which|what)\s+(?:button|option|setting|menu|icon|key|tab|link)\s+(?:do|should|can|would)\s+i\b`,
    String.raw`point\s+(?:at|to)\b`,
    String.raw`(?:how\s+do\s+i|show\s+me\s+how\s+to|guide\s+me\s+(?:to|through)|walk\s+me\s+through)\s+.{2,80}?\s+(?:on|in)\s+(?:my|the|this)\s+(?:pc|computer|laptop|screen)\b`,
  ].join("|") + String.raw`)`, "i");
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
    if (GUIDE.test(s)) return { kind: "guide" };
    if (SCREEN.test(s)) return { kind: "screen" };
    if (WEB_HIDE.test(s)) return { kind: "web-hide" };
    if (WEB_OPEN.test(s)) return { kind: "web", q: "", here: true };
    const w = s.match(WEB);
    if (w) {
      const q = String(w[1] || w[2] || w[3] || "").replace(/^(?:for|about)\s+/i, "").trim();
      // "look it up": nothing to search for yet, so the browser opens and asks.
      return { kind: "web", q: /^(?:it|that|this|them)$/i.test(q) ? "" : q, here: HERE.test(s) };
    }
    // A lesson's controls (only while a hologram is up; the gate checks).
    if (HOLO_HIDE.test(s)) return { kind: "holo-hide" };
    if (HOLO_NEXT.test(s)) return { kind: "holo-next" };
    if (HOLO_BACK.test(s)) return { kind: "holo-back" };
    if (HOLO_AGAIN.test(s)) return { kind: "holo-again" };
    if (DREAM_END.test(s)) return { kind: "dream-end" };
    const dm = s.match(DREAM);
    if (dm) {
      const place = String(dm.slice(1).find((x) => x) || "").trim();
      if (!NOT_A_PLACE.test(place)) return { kind: "dream", ask: s, place };
    }
    if (HOLO.test(s) && !ABOUT_HERE.test(s)) return { kind: "holo", ask: s };
    if (TIMER_STOP.test(s)) return { kind: "timer-stop" };
    const tm = s.match(TIMER);
    if (tm) {
      const ms = timerMs(tm[1] || tm[3], tm[2] || tm[4]);
      if (ms) return { kind: "timer", ms };
    }
    if (BREATHE_STOP.test(s)) return { kind: "breathe-stop" };
    if (BREATHE.test(s)) return { kind: "breathe" };
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

  // ---- holograms: teaching in 3D -------------------------------------------
  // "Teach me how the heart works", "show me the solar system", "visualise the
  // French revolution": your AI designs a small hologram (as JSON) and the room
  // builds it beside you while Izuki explains. "Next" walks through a lesson.
  const HOLO = new RegExp(LEAD + "(?:" + [
    String.raw`teach\s+me\b`,
    String.raw`(?:show|explain|build|make|draw)\b.{0,80}\bin\s+3\s?d\b`,
    String.raw`(?:visuali[sz]e|simulate|map\s+out|walk\s+me\s+through)\b`,
    String.raw`(?:build|make|draw|show)\s+(?:me\s+)?(?:a\s+|an\s+)?(?:3\s?d\s+|holographic\s+)?(?:model|simulation|sim|hologram|diagram|mind\s?map|timeline|chart)\s+(?:of|for|about|showing)\b`,
    String.raw`show\s+me\s+(?:how\s+.{2,80}\s+works?|what\s+.{2,80}\s+looks?\s+like|the\s+(?:solar\s+system|planets|structure|parts|layers|history|timeline|stages|life\s+cycle|water\s+cycle)\b)`,
  ].join("|") + String.raw`)`, "i");
  // "...this", "...that", "...it": something in front of you (a look), not a hologram.
  const ABOUT_HERE = /\b(?:this|that|these|those|it)\s*[.!?]*$|\bhow\s+(?:this|that|it)\s+works?\b|\b(?:this|that|these|those)\s+(?:thing|one|stuff|here)\b/i;
  const HOLO_NEXT = whole(String.raw`next(?:\s+(?:step|one|part))?|go\s+on|continue|keep\s+going|and\s+then|what'?s\s+next`);
  const HOLO_BACK = whole(String.raw`(?:go\s+)?back|previous(?:\s+(?:step|one))?|last\s+step`);
  const HOLO_AGAIN = whole(String.raw`(?:say\s+(?:that|it)\s+)?again|repeat(?:\s+(?:that|it))?|one\s+more\s+time`);
  const HOLO_HIDE = whole(String.raw`(?:close|hide|clear|put\s+away|remove)\s+(?:the\s+|that\s+|this\s+)?(?:hologram|model|simulation|sim|lesson|diagram|map|timeline|chart|3\s?d(?:\s+thing)?)|close\s+it|put\s+it\s+away`);
  // Timers that float by the orb, and a breathing exercise the orb leads.
  const NUMBER = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, fifteen: 15, twenty: 20, "twenty-five": 25, thirty: 30, forty: 40, "forty-five": 45, fifty: 50, sixty: 60, ninety: 90 };
  const AMOUNT = String.raw`(\d+(?:\.\d+)?|half\s+an?|a|an|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|twenty-five|thirty|forty|forty-five|fifty|sixty|ninety)`;
  const UNIT = String.raw`(seconds?|secs?|minutes?|mins?|hours?|hrs?)`;
  const TIMER = whole(String.raw`(?:set|start|make)?\s*(?:a\s+|an\s+|me\s+a\s+)?timer\s+(?:for\s+)?` + AMOUNT + String.raw`\s*` + UNIT + "|" + AMOUNT + String.raw`[\s-]*` + UNIT.replace("s?|secs?", "|sec").replace("s?|mins?", "|min").replace("s?|hrs?", "|hr") + String.raw`\s+timer`);
  const TIMER_STOP = whole(String.raw`(?:stop|cancel|clear|end|turn\s+off|delete)\s+(?:the\s+|my\s+|that\s+)?timer`);
  const BREATHE = whole(String.raw`(?:help\s+me\s+)?(?:relax|calm\s+down|breathe|de-?stress|unwind)|(?:start\s+|do\s+|let'?s\s+do\s+)?(?:a\s+|some\s+)?breathing(?:\s+(?:exercise|session))?|let'?s\s+breathe|i(?:'?m|\s+am|\s+feel)\s+(?:so\s+|really\s+|very\s+)?(?:stressed|anxious|overwhelmed)(?:\s+out)?`);
  const BREATHE_STOP = whole(String.raw`(?:stop|end|enough)\s+(?:the\s+)?(?:breathing|exercise)(?:\s+exercise)?`);
  /** "10 minutes" → milliseconds (a minute to a day), else 0. */
  function timerMs(amount, unit) {
    const a = String(amount || "").toLowerCase().trim();
    const n = /^half/.test(a) ? 0.5 : Number.isFinite(Number(a)) ? Number(a) : NUMBER[a] || 0;
    const u = String(unit || "").toLowerCase();
    const ms = n * (/^h/.test(u) ? 3600000 : /^m/.test(u) ? 60000 : 1000);
    return ms >= 5000 && ms <= 86400000 ? Math.round(ms) : 0;
  }
  /** A timer's length in words ("10 minutes", "1 hour 30 minutes"). */
  function timerWords(ms) {
    const s = Math.round(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    const part = (n, w) => (n ? n + " " + w + (n === 1 ? "" : "s") : "");
    return [part(h, "hour"), part(m, "minute"), part(sec, "second")].filter(Boolean).join(" ") || "a moment";
  }
  // In the room you don't need the name: a real question or a call for help is
  // answered (a headset is mostly just you). Chat with someone else ("what do
  // you want for dinner?") is left alone.
  const ASKED = /\?\s*$|^(?:so|and|ok|okay|um+|uh+|hmm+)?[\s,]*(?:what|what's|whats|who|who's|when|where|where's|why|how|which|is\s+(?:it|there|this)|are\s+there|can\s+you|could\s+you|would\s+you|will\s+you|do\s+you\s+know|tell\s+me|show\s+me|teach\s+me|explain|help|search|google|look\s+up|open|remind|set\s+a\s+timer)\b|\b(?:help\s+me|i\s+need\s+(?:help|you|to\s+know)|i'?m\s+stuck|i\s+don'?t\s+(?:know|understand|get\s+(?:it|this|how)))\b/i;
  const SOCIAL = /\b(?:you|ya|u)\b/i;
  const REQUEST = /^(?:so|and|ok|okay|hey|please)?[\s,]*(?:can|could|would|will)\s+you\b|\bdo\s+you\s+know\b|\bhelp\s+me\b|\bshow\s+me\b|\btell\s+me\b|\bteach\s+me\b/i;
  /** Said to Izuki without its name? A question, a request or a call for help. */
  function forIzuki(s) {
    const t = String(s || "").trim();
    if (t.split(/\s+/).length < 3 || !ASKED.test(t)) return false;
    // "What do you want for dinner?" is for a person; "can you help me…" is for Izuki.
    return !SOCIAL.test(t) || REQUEST.test(t);
  }
  const HOLO_KINDS = ["model", "map", "steps", "timeline", "chart"];
  const HOLO_PALETTE = ["teal", "sky", "violet", "rose", "amber", "lime", "white"];
  // ---- what the chat brain knows about the room ----------------------------------
  // Seen on a real Quest: a normal question in the room got phone talk, because
  // the chat's own prompt says "your AI companion on their phone".
  const VR_CONTEXT = (pcOn, holoOn, dreamOn) => [
    "Right now they're wearing a VR headset (Meta Quest) and you are the glowing orb floating in their room or in a virtual space around them. This is not their phone: never talk about phone screens, phone settings, tapping or swiping a phone, or phone apps.",
    "In the room you can: build a 3D hologram to teach something (they say \"teach me…\", \"show me … in 3D\"); take them into a whole dream world (\"take me to…\", \"dream mode…\"); open a browser panel beside them (\"search the web for…\"); show their PC's screen big and point at where to click (\"show my PC\", \"where do I click…\"); look through the headset camera (\"what's this?\"); set timers; lead a breathing break; pin an answer as a card.",
    "When something would be much clearer seen than said (how a thing works, a process, a place, sizes, a history), answer in a sentence or two, then offer it in a few words: \"Want me to build it in 3D?\" or \"Want me to take you there?\". Don't offer it every time.",
    "Answer in one to three short spoken sentences, the most important thing first. No lists, no markdown, no emoji: everything is read aloud and shown as a short caption.",
    pcOn ? "Their PC's screen is open big in the room." : "",
    holoOn ? "A hologram you built is showing beside them; questions may be about it." : "",
    dreamOn ? "They're inside a dream world you built; they can say \"wake up\" to leave it." : "",
  ].filter(Boolean).join("\n");

  // "Want me to build it in 3D?" … "yes": a short yes builds what they asked about.
  const YES = whole(String.raw`yes|yeah|yep|yup|sure|ok(?:ay)?|please|do\s+it|go\s+ahead|yes\s+please|let'?s\s+do\s+it|let'?s\s+go|build\s+it|show\s+me|take\s+me(?:\s+there)?|why\s+not|definitely|absolutely|of\s+course`);
  // Only an invitation counts (\"Want me to…?\"), never \"I can't take you there\".
  const OFFERS_3D = /\b(?:want|would\s+you\s+like|shall\s+i|should\s+i|how\s+about)\b[^.?!]{0,30}\bin\s+3\s?d\s*\?/i;
  const OFFERS_TRIP = /\b(?:want|would\s+you\s+like|shall\s+i|should\s+i|how\s+about)\b[^.?!]{0,30}\btake\s+you\s+there\s*\?/i;

  // ---- dream mode: a whole world around you, designed from your words ----------
  const DREAM = new RegExp(LEAD + "(?:" + [
    String.raw`dream\s+mode(?:[:,\s]+(?:of\s+|to\s+|in\s+)?(.{2,120}?))?`,
    String.raw`(?:take|bring|send)\s+me\s+(?:to|into|inside)\s+(.{2,120}?)`,
    String.raw`put\s+me\s+(?:in|on|inside|at)\s+(.{2,120}?)`,
    String.raw`(?:i\s+want\s+to\s+be|let\s+me\s+be)\s+(?:in|on|at|inside)\s+(.{2,120}?)`,
    String.raw`(?:dream|imagine)\s+(?:of\s+|up\s+|about\s+)?(?:(?:that\s+)?(?:i'?m|we'?re|i\s+am|we\s+are)\s+(?:in|on|at)\s+)?((?:a|an|the)\s+.{2,120}?)`,
    String.raw`(?:build|make|create)\s+(?:me\s+)?(?:a|an)\s+(?:world|place|dream|dreamworld|scene|landscape)(?:\s+(?:of|with|where|like|for|that's)\s+(.{2,120}?))?`,
  ].join("|") + String.raw`)` + TAIL, "i");
  const DREAM_END = whole(String.raw`wake\s+(?:me\s+)?up|(?:end|stop|leave|exit|close)\s+(?:the\s+|this\s+)?(?:dream(?:\s+mode)?|world)|take\s+me\s+(?:back|home)|(?:go\s+)?back\s+to\s+(?:my\s+)?(?:room|reality)`);
  // Not a place to dream up: your own things go to their own lanes.
  const NOT_A_PLACE = /\b(?:pc|computer|laptop|screen|settings|photos?|pictures?|folders?|files?|downloads|documents|google|youtube|website|page|link|browser|the\s+answer)\b/i;
  const DREAM_SYSTEM = [
    "You are Izuki, building a whole place around the person inside their VR headset from their words (dream mode). It replaces their room until they say wake up.",
    'Reply with JSON only, no markdown: {"title": "up to 5 words", "say": "1 or 2 short spoken sentences welcoming them there", "sky": {"top": "#rrggbb", "horizon": "#rrggbb", "bottom": "#rrggbb"}, "ground": {"kind": "grass|sand|dunes|water|snow|rock|grid|clouds|none", "color": "#rrggbb"}, "light": "#rrggbb", "particles": {"kind": "stars|snow|rain|fireflies|embers|bubbles|petals|dust|none", "color": "#rrggbb", "amount": 0-1}, "shapes": [{"kind": "tree|pine|palm|rock|crystal|pillar|cloud|mountain|planet|moon|tower|arch|lantern", "count": 1-24, "color": "#rrggbb", "size": 0.3-3, "spread": "near|mid|far", "float": true|false}]}',
    "Up to 6 shape groups. Colours set the mood (deep blues and violets for night, warm golds for sunset, soft greens for a forest). Mountains, planets and moons belong far away; trees, rocks and lanterns near or mid.",
    "Keep it calm and beautiful: nothing scary, violent or gory, whatever they ask. A real place is evoked by its feel and colours, not copied exactly. Say only what you built; never claim it's the real place.",
  ].join("\n");
  const DREAM_GROUNDS = ["grass", "sand", "dunes", "water", "snow", "rock", "grid", "clouds", "none"];
  const DREAM_PARTICLES = ["stars", "snow", "rain", "fireflies", "embers", "bubbles", "petals", "dust", "none"];
  const DREAM_SHAPES = ["tree", "pine", "palm", "rock", "crystal", "pillar", "cloud", "mountain", "planet", "moon", "tower", "arch", "lantern"];
  /** A dream world from the AI's reply, checked and clamped; null if there isn't a usable one. */
  function parseDream(reply) {
    let t = String(reply || "").replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    const a = t.indexOf("{"), b = t.lastIndexOf("}");
    if (a < 0 || b <= a) return null;
    let d;
    try { d = JSON.parse(t.slice(a, b + 1)); } catch { return null; }
    if (!d || typeof d !== "object" || !d.sky || typeof d.sky !== "object") return null;
    const words = (v, n) => (typeof v === "string" ? v : "").replace(/[`*_#>{}[\]]+/g, " ").replace(/\s+/g, " ").trim().slice(0, n);
    const hex = (v, d0) => {
      const s = String(v || "").trim();
      if (/^#[0-9a-f]{6}$/i.test(s)) return s.toLowerCase();
      if (/^#[0-9a-f]{3}$/i.test(s)) return ("#" + s[1] + s[1] + s[2] + s[2] + s[3] + s[3]).toLowerCase();
      return d0;
    };
    const num = (v, lo, hi, d0) => { const n = Number(v); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d0; };
    const sky = { top: hex(d.sky.top, "#0b1430"), horizon: hex(d.sky.horizon, "#3a4f7a"), bottom: hex(d.sky.bottom, "#121826") };
    const g0 = d.ground && typeof d.ground === "object" ? d.ground : {};
    const ground = { kind: DREAM_GROUNDS.includes(g0.kind) ? g0.kind : "grass", color: hex(g0.color, "#2f4a3a") };
    const p0 = d.particles && typeof d.particles === "object" ? d.particles : {};
    const particles = { kind: DREAM_PARTICLES.includes(p0.kind) ? p0.kind : "none", color: hex(p0.color, "#ffffff"), amount: num(p0.amount, 0, 1, 0.5) };
    let total = 0;
    const shapes = (Array.isArray(d.shapes) ? d.shapes : []).filter((s) => s && typeof s === "object" && DREAM_SHAPES.includes(s.kind)).slice(0, 6).map((s) => {
      const count = Math.round(num(s.count, 1, 24, 6));
      const kept = Math.max(0, Math.min(count, 120 - total));
      total += kept;
      return { kind: s.kind, count: kept, color: hex(s.color, "#8fa3b8"), size: num(s.size, 0.3, 3, 1), spread: ["near", "mid", "far"].includes(s.spread) ? s.spread : "mid", float: s.float === true };
    }).filter((s) => s.count > 0);
    return { title: words(d.title, 40) || "Your dream", say: words(d.say, 300) || "Here we are.", sky, ground, light: hex(d.light, "#ffffff"), particles, shapes };
  }

  const HOLO_SYSTEM = [
    "You are Izuki, teaching inside a VR headset by building a small 3D hologram next to the person while you talk.",
    'Reply with JSON only, no markdown: {"title": "...", "kind": "model|map|steps|timeline|chart", "say": "...", "unit": "", "items": [...], "steps": [...]}',
    "kind: model = real things in space (planets round a star, an atom, the parts of an engine or a cell; use orbit to put one round another); map = one idea in the middle (item 0) and the ideas around it; steps = a process in order; timeline = events in time; chart = numbers to compare.",
    'items: 3 to 8, each {"label": "1 to 3 words", "note": "up to 7 words", "size": 1-5, "color": "teal|sky|violet|rose|amber|lime|white", "orbit": index of the item it circles or -1, "link": [indexes it connects to], "when": "short date (timeline)", "value": number (chart)}.',
    "say: what you say first, out loud: 2 to 3 short spoken sentences, plain words. title: up to 6 words. unit: the chart's unit, else empty.",
    'steps: for a lesson or anything with stages, 2 to 5 steps, each {"say": "1 or 2 spoken sentences", "focus": [indexes of the items it is about]}; otherwise [].',
    "Be accurate: sizes and numbers roughly to scale when they are real (if not to scale, say so). Never invent facts. If it's a quiz, test or exam question, teach the idea and never give the answer to fill in.",
  ].join("\n");
  /** A hologram from the AI's reply, checked and trimmed; null if there isn't a usable one. */
  function parseHolo(reply) {
    let t = String(reply || "").replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    const a = t.indexOf("{"), b = t.lastIndexOf("}");
    if (a < 0 || b <= a) return null;
    let d;
    try { d = JSON.parse(t.slice(a, b + 1)); } catch { return null; }
    if (!d || typeof d !== "object" || !Array.isArray(d.items)) return null;
    const words = (v, n) => (typeof v === "string" || typeof v === "number" ? String(v) : "").replace(/[`*_#>{}[\]]+/g, " ").replace(/\s+/g, " ").trim().slice(0, n);
    // Parts with no name are dropped; every reference still means the part the AI meant.
    const kept = [], at = new Map();
    d.items.forEach((x, k) => { if (kept.length < 8 && x && typeof x === "object" && words(x.label, 40)) { at.set(k, kept.length); kept.push(x); } });
    const raw = kept;
    if (raw.length < 2) return null;
    const kind = HOLO_KINDS.includes(d.kind) ? d.kind : "map";
    const index = (v) => { const k = Number(v); return Number.isInteger(k) && at.has(k) ? at.get(k) : -1; };
    const items = raw.map((x, i) => {
      const value = Number(x.value);
      return {
        label: words(x.label, 28),
        note: words(x.note, 60),
        size: Math.max(1, Math.min(5, Math.round(Number(x.size) || 2))),
        color: HOLO_PALETTE.includes(x.color) ? x.color : HOLO_PALETTE[i % 6],
        // Only round one that comes earlier: no loops, and a moon can circle a planet.
        orbit: kind === "model" ? (index(x.orbit) >= 0 && index(x.orbit) < i ? index(x.orbit) : -1) : -1,
        link: (Array.isArray(x.link) ? x.link : []).map(index).filter((k) => k >= 0 && k !== i).slice(0, 4),
        when: words(x.when, 16),
        value: Number.isFinite(value) ? value : NaN,
      };
    });
    if (kind === "chart" && !items.some((x) => Number.isFinite(x.value))) return null;
    const steps = (Array.isArray(d.steps) ? d.steps : []).map((s) => ({
      say: words(s?.say, 300),
      focus: (Array.isArray(s?.focus) ? s.focus : []).map(index).filter((k) => k >= 0).slice(0, 8),
    })).filter((s) => s.say).slice(0, 5);
    const say = words(d.say, 400) || "Here it is.";
    return { title: words(d.title, 48) || items[0].label, kind, say, unit: words(d.unit, 12), items, steps };
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

  const util = { command, onPc, named, forIzuki, timerWords, parseLook, parseHolo, HOLO_SYSTEM, parseDream, DREAM_SYSTEM, VR_CONTEXT, YES, OFFERS_3D, OFFERS_TRIP, wrapLines, fitLines, followTarget, pcPoint, angleGap, LOOK_SYSTEM, lookPrompt };
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
  // Added to a look when they asked to be shown where (numbered steps, drawn as a path).
  const GUIDE_ADD = [
    "They want to be SHOWN where, step by step, so they can do it themselves. Don't offer to do it for them.",
    "Give at most 4 steps in order. Put exactly one mark on the exact thing for each step (the button, menu, tab, field, port or part to click, tap, press or touch), in step order, each labelled with the action in 1 to 3 words, like \"Click File\" or \"Tap Save\".",
    "In say, give the steps in order in a few short sentences (\"First click File, then Save as.\"). If the next step isn't visible yet, mark the step that gets them there and say what comes after it.",
  ].join("\n");
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
      "You don't even need my name for a question: just ask.",
      "Say search the web for anything and I'll look it up on a browser right here. Say teach me, or show me, and I'll build it in 3D around you while I explain.",
      "Set a timer, or say help me relax and I'll breathe with you.",
      "Hold Talk, or A, to talk while you hold it. Reach out and pinch me, or any card, to move it. Pin an answer to keep it, say come here to call me over, and change your look whenever you like.",
    ].filter(Boolean).join(" ");
  }

  // ---- holograms ---------------------------------------------------------------
  // ---- dream mode ---------------------------------------------------------------
  let dreamGen = 0;
  /** What Izuki last offered to show ("build it in 3D?"), and what they had asked. */
  let offer = null, lastAsk = "";
  async function dream(ask) {
    const core = g.IzukiCore;
    if (!core?.think || !core.ready?.()) return "Add a free AI key in Settings first, then I can build a world around you.";
    const visit = epoch, my = ++dreamGen;
    const current = () => vr.active && visit === epoch && my === dreamGen;
    vr.scene?.notice?.("Dreaming it up…", 6000);
    vr.scene?.orb("thinking");
    let reply = "";
    try {
      reply = await core.think(ask, DREAM_SYSTEM);
    } catch (e) {
      if (!current()) return "";
      return "I couldn't dream that one up just now: " + String(e?.message || e).slice(0, 120);
    } finally {
      if (vr.active && visit === epoch && my === dreamGen) vr.scene?.orb(appState);
    }
    if (!current()) return "";
    const w = parseDream(reply);
    if (!w) return "I couldn't build that place. Tell me about it in other words, and I'll try again.";
    vr.scene?.dreamShow?.(w);
    return w.say + ' Say "wake up" whenever you want your room back.';
  }

  let holoNow = null, holoAt = -1, holoGen = 0;
  /** Your AI designs it, the room builds it; resolves to what Izuki says first. */
  async function holo(ask) {
    const core = g.IzukiCore;
    if (!core?.think || !core.ready?.()) return "Add a free AI key in Settings first, then I can build it for you.";
    const visit = epoch;
    // Closed meanwhile, or another asked for: this answer is no longer wanted.
    const my = ++holoGen;
    const current = () => vr.active && visit === epoch && my === holoGen;
    vr.scene?.holoBuilding?.(String(ask).replace(new RegExp(LEAD, "i"), "").slice(0, 60));
    vr.scene?.orb("thinking");
    let reply = "";
    try {
      reply = await core.think(ask, HOLO_SYSTEM);
    } catch (e) {
      if (!current()) return "";
      vr.scene?.holoClose?.();
      return "I couldn't build that just now: " + String(e?.message || e).slice(0, 120);
    } finally {
      if (vr.active && visit === epoch && my === holoGen) vr.scene?.orb(appState);
    }
    if (!current()) return "";
    const h = parseHolo(reply);
    if (!h) {
      vr.scene?.holoClose?.();
      // Words instead of a design: say them (never the code).
      const t = String(reply || "").replace(/<think>[\s\S]*?<\/think>/gi, "");
      const said = (t.includes("{") ? "" : t).replace(/[`*_#>{}[\]]+/g, " ").replace(/\s+/g, " ").trim();
      return said || "I couldn't build that one. Ask me in other words, and I'll try again.";
    }
    holoNow = h; holoAt = -1;
    vr.scene?.holoShow?.(h);
    return h.say + (h.steps.length ? " Say next when you're ready." : " Point at any part to hear more.");
  }
  /** A lesson's next (1), previous (-1) or the same step again (0): what to say. */
  function holoStep(d) {
    const h = holoNow;
    if (!h) return "There's nothing up to walk through. Ask me to show or teach you something.";
    if (!h.steps.length) return d === 0 ? h.say : "That's the whole picture. Point at any part to hear more, or ask me about it.";
    if (d === 0) return holoAt < 0 ? h.say : h.steps[holoAt].say;
    if (d > 0 && holoAt >= h.steps.length - 1) return "That was the last step. Ask me anything about it, or say close it.";
    if (d < 0 && holoAt <= 0) { holoAt = -1; vr.scene?.holoFocus?.(null, -1); return h.say; }
    holoAt += d;
    const s = h.steps[holoAt];
    vr.scene?.holoFocus?.(s.focus, holoAt);
    return s.say;
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
      const ctl = !n.called ? command(s) : null;
      const live = !!ctl && ((/^holo-/.test(ctl.kind) && !!vr.scene?.holoShown?.()) || (ctl.kind === "dream-end" && !!vr.scene?.dreamShown?.()) || ctl.kind === "timer-stop" || ctl.kind === "breathe-stop" || ctl.kind === "web-hide");
      if (heyNova && !armed && !bare && !live && Date.now() - spokeAt > FOLLOW_ON_MS) {
        if (!n.called && !(store.get("vr.anyQuestion", true) !== false && forIzuki(s))) return null;
        if (!n.rest) return { done: true, said: s, say: "Mhm?" };
      }
      armed = false;
      if (n.called && n.rest) s = n.rest;
      let c = command(s);
      // A lesson's "next", "back", "again" only mean that while a hologram is up.
      if (c?.kind?.startsWith("holo-") && !vr.scene?.holoShown?.()) c = null;
      if (c?.kind === "dream-end" && !vr.scene?.dreamShown?.()) c = null;
      // With your PC on the big screen, a search is done there (unless you say "in here").
      if (c?.kind === "web" && c.q && !c.here && vr.scene?.pcShown?.()) c = null;
      const done = (say) => ({ done: true, said: s, say });
      if (!c && offer && Date.now() - offer.at < 90000 && YES.test(s)) {
        const o = offer;
        offer = null;
        try { return done((o.kind === "dream" ? await dream("Take me to " + o.topic) : await holo("Teach me in 3D: " + o.topic)) || "Okay."); }
        catch (e) { return done(lookTrouble(e)); }
      }
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
      if (!c) { lastAsk = s; return { said: s }; }
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
        if (c.kind === "web-hide") { vr.scene?.webClose?.(); return done("Okay, I closed the browser."); }
        if (c.kind === "web") return done((await vr.scene?.webSearch?.(c.q)) || "Okay.");
        if (c.kind === "holo") return done((await holo(c.ask)) || "Okay.");
        if (c.kind === "dream") return done((await dream(c.ask)) || "Okay.");
        if (c.kind === "dream-end") { vr.scene?.dreamClose?.(); return done("And we're back in your room."); }
        if (c.kind === "holo-hide") { vr.scene?.holoClose?.(); return done("Okay, I put it away."); }
        if (c.kind === "holo-next") return done(holoStep(1));
        if (c.kind === "holo-back") return done(holoStep(-1));
        if (c.kind === "holo-again") return done(holoStep(0));
        if (c.kind === "timer") { vr.scene?.timerStart?.(c.ms, timerWords(c.ms)); return done("Timer set for " + timerWords(c.ms) + ". It's floating by me."); }
        if (c.kind === "timer-stop") return done(vr.scene?.timerStop?.() ? "Okay, timer cancelled." : "There's no timer running.");
        if (c.kind === "breathe") { vr.scene?.breathe?.(4); return done("Let's breathe together. Follow me: breathe in as I grow, hold, and breathe out slowly as I shrink."); }
        if (c.kind === "breathe-stop") { vr.scene?.breatheStop?.(); return done("Okay, we'll stop there."); }
        if (c.kind === "photo-ask" || c.kind === "screen" || c.kind === "look" || c.kind === "guide") {
          const visit = epoch;
          const source = await lookSource(c.kind, s);
          if (!vr.active || visit !== epoch) return done(lookTrouble(closedError()));
          if (typeof source === "string") return done(source);
          return done(await look(s, visit, source));
        }
      } catch (e) {
        return done(lookTrouble(e));
      }
      lastAsk = s;
      return { said: s };
    },
    orb(m) { appState = m || ""; vr.scene?.orb(m); },
    heard(t) { vr.scene?.heard(t); },
    said(t) { vr.scene?.said(t); },
    line(who, t, opts) {
      if (who === "izuki" && t && !opts?.thinking) spokeAt = Date.now();
      // Remember an offer to show it, so a plain "yes" builds it.
      if (who === "izuki" && t && !opts?.thinking && !opts?.error) {
        const k = OFFERS_TRIP.test(t) ? "dream" : OFFERS_3D.test(t) ? "holo" : "";
        offer = k && lastAsk ? { kind: k, topic: lastAsk, at: Date.now() } : null;
      }
      if (who === "izuki" && t && !opts?.thinking && !opts?.error) lastReply = String(t);
      vr.scene?.line(who, t, opts);
    },
    level(v) { vr.scene?.level(v); },
    /** No voice right now: the room says why (the page's Retry can't be seen in a headset). */
    quiet(t) { vr.scene?.notice?.(t, 15000, true); },
    /** What the chat brain is told while you're in the room (it used to think it was on a phone). */
    system() { return VR_CONTEXT(!!vr.scene?.pcShown?.(), !!vr.scene?.holoShown?.(), !!vr.scene?.dreamShown?.()); },
    /** "Hey Nova" in the room: listen hands-free (only a call by name is answered). */
    handsFree(on) { heyNova = !!on; },
    homeCard,
    enter,
  };
  g.IzukiVr = vr;

  function lookTrouble(e) {
    const n = e?.name || "";
    // Seen on a real Quest 3S: until the headset lets the browser use its room
    // cameras, websites only get a camera facing you.
    if (e?.facing) return "Your headset is only letting me use a camera that faces you, so I can't see your room yet. On a Quest 3 or 3S, open Settings, then Privacy and safety, App permissions, Headset cameras, and switch on Browser (or IZUKI NOVA). Then ask me again.";
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
  async function lookSource(kind, question = "") {
    const pcFrame = () => { const f = vr.scene?.pcFrame?.(); if (!f) throw new Error("Your PC's picture isn't showing yet."); return f; };
    const camera = { take: () => cam.frame(), system: LOOK_SYSTEM, shows: "camera" };
    const screen = { take: pcFrame, system: SCREEN_SYSTEM, shows: "screen" };
    // "Where do I click…": the PC's screen when the question is about software
    // (or there's no camera), otherwise the real thing in front of you.
    if (kind === "guide") {
      const pcShown = !!vr.scene?.pcShown?.();
      const camOk = await cam.has();
      // "Button" or "switch" alone could be on a kettle: a real thing named
      // ("…on this kettle") wins unless the PC or its software is named too.
      const pcWords = /\b(?:pc|computer|laptop|screen|click|double[-\s]?click|menu|tab|icon|window|app|settings?|website|page|link|file|folder|desktop|browser|scroll)\b/i.test(question);
      const physical = /\b(?:this|that|these|those)\b/i.test(question);
      const software = pcWords || (/\b(?:button|switch|option|key)s?\b/i.test(question) && !physical);
      if (pcShown && (software || !camOk)) return { ...screen, system: SCREEN_SYSTEM + "\n" + GUIDE_ADD, steps: true };
      if (camOk) return { ...camera, system: LOOK_SYSTEM + "\n" + GUIDE_ADD, steps: true };
      return software
        ? "Show me your PC first (say \"show my PC\"), then ask again: I'll point at each thing to click, step by step."
        : "On a Quest 3 or 3S, allow the headset camera for this site and ask again, or show me your PC: I'll point at where to go, step by step.";
    }
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
      vr.scene?.showLook({ url: shot.url, w: shot.w, h: shot.h, marks, say, steps: !!source.steps });
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
    /** The room's browser: a Google search, and reading one result. */
    search: async (q) => (g.IzukiCore?.search ? g.IzukiCore.search(q) : { error: "Searching isn't ready yet. Reload Izuki and try again." }),
    read: async (page, q) => (g.IzukiCore?.read ? g.IzukiCore.read(page, q) : { error: "Reading pages isn't ready yet." }),
    /** The hologram bar's next and back: said out loud like "next". */
    holoStep(d) {
      const say = holoStep(d);
      lastReply = say;
      vr.scene?.line("izuki", say);
      g.IzukiCore?.speak?.(say);
    },
    holoClosed() { holoNow = null; holoAt = -1; holoGen++; },
    exited() {
      // The Quest app goes back to its launcher, not to a flat chat.
      if (asApp) g.setTimeout?.(launcher, 600);
      dreamGen++;
      holoNow = null; holoAt = -1;
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
    } else if (mode !== "flat") {
      // This browser keeps its own settings: a key added on your phone or PC isn't here.
      if (!core?.ready?.()) vr.scene.notice?.("This browser has no AI key yet, so I can't hear you. Leave the room, add a free Gemini or Groq key in Settings here (AI keys are for adults 18+), and come back.", 20000, true);
      else if (!core.canHear?.()) vr.scene.notice?.("To hear “Hey Nova” in a headset I need a free Gemini or Groq key (Settings). Tap Talk meanwhile.", 20000, true);
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
      // A ?vr visit (izukinova.ai/vr, the Quest app) gets the launcher
      // instead: it offers the room, floating beside your apps, or the chat,
      // and opens this explainer itself when a key or the microphone is missing.
    };
    supportReady.then(fill, fill);
  }
  /** Started as the installed Quest app (quest/twa-manifest.json opens /app/?vr=app). */
  const asApp = (() => { try { return new URLSearchParams(g.location.search).get("vr") === "app"; } catch { return false; } })();
  async function straightIn() {
    if (!g.IzukiCore?.ready?.() || !(await micAllowed())) return false;
    try { await enter(support.ar ? "immersive-ar" : "immersive-vr"); } catch { return false; }
    return vr.active;
  }

  // ---- the launcher -----------------------------------------------------------
  // The Quest app's icon (and izukinova.ai/vr) lands here: one full-screen way
  // in, on top of whatever the page shows. Before this, an old chat on screen
  // hid the home card, so the app opened as a flat chat and never went in.
  const LAUNCH_CSS = `
.vr-launch{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;
  padding:24px;text-align:center;color:#eef3f8;background:radial-gradient(120% 90% at 50% 38%,#10283a 0%,#070b12 55%,#030509 100%);font-family:inherit}
.vr-launch-orb{width:min(34vmin,220px);aspect-ratio:1;border-radius:50%;margin-bottom:8px;
  background:radial-gradient(circle at 34% 30%,#ffffff 0%,#bfefff 12%,#59c8f0 38%,#2563c9 70%,#0b1f4a 100%);
  box-shadow:0 0 60px 10px rgba(89,200,240,.35),0 0 140px 40px rgba(37,99,201,.18);animation:vrl-breathe 4.5s ease-in-out infinite}
@keyframes vrl-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@media (prefers-reduced-motion:reduce){.vr-launch-orb{animation:none}}
.vr-launch h2{margin:0;font-size:clamp(30px,5vw,46px);letter-spacing:.12em;font-weight:650}
.vr-launch p{margin:0;max-width:30em;font-size:clamp(17px,2.4vw,21px);color:#b5c2cf;line-height:1.45}
.vr-launch-go{margin-top:10px;min-width:min(80vw,360px);min-height:72px;padding:0 40px;border:0;border-radius:999px;cursor:pointer;
  font:inherit;font-size:clamp(20px,3vw,25px);font-weight:650;color:#04121c;background:linear-gradient(135deg,#7ee8ff,#3fb6ff);
  box-shadow:0 10px 40px rgba(63,182,255,.35)}
.vr-launch-go:disabled{opacity:.6;cursor:default}
.vr-launch-go:focus-visible,.vr-launch-chat:focus-visible{outline:3px solid #fff;outline-offset:4px}
.vr-launch-chat{min-height:52px;padding:0 24px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:transparent;color:#d7e2ec;font:inherit;font-size:18px;cursor:pointer}
.vr-launch-float{min-width:min(80vw,360px);min-height:64px;padding:0 32px;border:1px solid rgba(126,232,255,.55);border-radius:999px;background:rgba(126,232,255,.08);color:#dff7ff;font:inherit;font-size:clamp(19px,2.6vw,22px);font-weight:600;cursor:pointer}
.vr-launch-float:focus-visible{outline:3px solid #fff;outline-offset:4px}
.vr-launch-tip{font-size:15px !important;color:#8fa1b2 !important;max-width:26em !important;margin-top:-8px !important}
.vr-launch-note:empty{display:none}
.vr-launch-note{color:#ffd28a !important}`;
  function launcher() {
    const doc = g.document;
    if (!wanted || vr.active || !doc?.body || doc.getElementById("vr-launch")) return;
    if (!doc.getElementById("vr-launch-css")) { const st = doc.createElement("style"); st.id = "vr-launch-css"; st.textContent = LAUNCH_CSS; doc.head.appendChild(st); }
    const can = support.ar || support.vr;
    const box = mk("div", "vr-launch");
    box.id = "vr-launch";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", "IZUKI NOVA in VR");
    const go = mk("button", "vr-launch-go", can ? "Enter the room" : "Open the 3D preview");
    go.type = "button";
    const note = mk("p", "vr-launch-note", "");
    note.setAttribute("role", "status");
    const chat = mk("button", "vr-launch-chat", "Chat here instead");
    chat.type = "button";
    const close = () => box.remove();
    // Your own tap wins over the automatic start below, even one still pending.
    let chosen = false;
    chat.onclick = () => { chosen = true; close(); };
    // Floating beside your other apps: a full room hides them (Meta's rule for
    // immersive apps), but a window can sit next to them. The hands-free call
    // screen is the floating Izuki: an orb, captions, Mute and End.
    const float = mk("button", "vr-launch-float", "Float beside my apps");
    float.type = "button";
    const floatTip = mk("p", "vr-launch-tip", "Your other apps stay open. Grab this window's corner to make it small, and put it anywhere.");
    const goFloat = () => {
      store.set("launch", "float");
      close();
      g.document.getElementById("go-live")?.click();
    };
    float.onclick = () => { chosen = true; goFloat(); };
    go.onclick = async () => {
      chosen = true;
      store.set("launch", "room");
      // No key or microphone yet: the explainer walks through both, then goes in.
      if (!can || !g.IzukiCore?.ready?.() || !(await micAllowed())) { close(); void openSheet(); return; }
      go.disabled = true; note.textContent = "";
      try { await enter(support.ar ? "immersive-ar" : "immersive-vr"); } catch (e) { note.textContent = "The headset didn't open the room: " + String(e?.message || e).slice(0, 120) + " Try again."; }
      go.disabled = false;
      if (vr.active) close();
    };
    box.append(mk("div", "vr-launch-orb"), mk("h2", "", "IZUKI NOVA"),
      mk("p", "", support.ar ? "Your AI, floating in your room. Talk to it, show it things, learn in 3D." : can ? "Your AI, beside you. Talk to it, learn in 3D, see your PC big." : "A 3D preview of the room. The real thing is on a headset."),
      go, note);
    if (support.headset) box.append(float, floatTip);
    box.append(chat);
    doc.body.appendChild(box);
    try { go.focus({ preventScroll: true }); } catch {}
    // Your last choice from the app's icon: straight into the room, or
    // floating beside your apps. The first time, you choose.
    const last = store.get("launch", "");
    if (asApp && last === "float" && support.headset && g.IzukiCore?.ready?.()) void micAllowed().then((ok) => { if (ok && !chosen && box.isConnected) goFloat(); });
    else if (asApp && last === "room" && can) void straightIn().then((inside) => { if (inside) close(); });
  }
  if (wanted) supportReady.then(() => g.setTimeout?.(launcher, 250), () => g.setTimeout?.(launcher, 250));

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
    if (support.ar) check(store.get("camAsked", false), store.get("camAsked", false) ? "Camera asked (for “what's this?”)" : "I'll ask for the camera before you go in: the headset can't show the question inside the room");
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
    // A headset can't show a permission prompt inside the room: the camera is
    // asked for out here, once, on headsets that can share it.
    let camNow = !support.ar || store.get("camAsked", false), asking = false;
    // A headset needs the AI (and the microphone) before going in; the 3D
    // preview on a normal screen can be looked around without either.
    const label = () => (mode === "flat" ? "Open the 3D preview" : !ready ? "Set up my free key first" : !micNow ? "Allow the microphone" : !camNow ? "Allow the camera (for “what's this?”)" : mode === "immersive-ar" ? "Go into my room" : "Enter VR");
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
      if (!camNow) {
        if (asking) return;
        asking = true;
        main.disabled = true;
        try {
          const s = await nav.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } });
          s.getTracks().forEach((t) => t.stop());
          say("Camera allowed. I only use it when you ask “what's this?”.");
        } catch { say("No camera, that's fine: everything else works. You can allow it later in the browser's site settings."); }
        finally {
          camNow = true;
          store.set("camAsked", true);
          asking = false;
          main.disabled = false;
          main.textContent = label();
        }
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
