// How a character acts out what Izuki says — shared by the 2D characters
// (toon.js) and the 3D faces (model-orb.js).
//
// Mouth shapes ("visemes") come from the words themselves, letter by letter,
// timed at a speaking pace from when the voice starts — the way animators
// break down dialogue: ah, ee, oh, oo, m-b-p (lips together), f-v (lip under
// the teeth), th, l, s, ch… with rests between words and at full stops.
//
// Gestures come from the meaning: a wave for a greeting, fingers counting a
// list, a hand to the chin for "I think", palms up for a question, a fist
// pump for "let's go", a point for "you", a shrug for "sorry".

/** Letters → viseme classes (the 15 standard ones). */
export function visemeOf(s, i) {
  const ch = s[i], next = s[i + 1] || "";
  if (ch === "t" && next === "h") return "TH";
  if ((ch === "c" || ch === "s") && next === "h") return "CH";
  switch (ch) {
    case "a": return "aa";
    case "e": return "E";
    case "i": case "y": return "I";
    case "o": return "O";
    case "u": case "w": return "U";
    case "b": case "m": case "p": return "PP";
    case "f": case "v": return "FF";
    case "d": case "t": return "DD";
    case "l": case "n": return "nn";
    case "k": case "c": case "g": case "q": case "x": case "h": return "kk";
    case "j": return "CH";
    case "s": case "z": return "SS";
    case "r": return "RR";
    default: return "kk";
  }
}

/** A reply's mouth shapes over time: { marks: [[t, viseme]], length }. */
export function visemeTimeline(text, rate = 14.5) {
  const out = [];
  let t = 0;
  const per = 1 / rate;
  const s = String(text || "").toLowerCase();
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (/[a-z]/.test(ch)) {
      const v = visemeOf(s, i);
      if (v === "TH" || v === "CH") i++;
      out.push([t, v]);
      t += per * (/[aeiou]/.test(ch) ? 1.15 : 0.85);
    } else if (/[.!?]/.test(ch)) {
      out.push([t, "sil"]);
      t += 0.32;
    } else if (/[,;:]/.test(ch)) {
      out.push([t, "sil"]);
      t += 0.18;
    } else if (ch === " ") {
      out.push([t, "sil"]);
      t += per * 0.45;
    } else if (/[0-9]/.test(ch)) {
      out.push([t, "E"]);
      t += per * 2;
    }
  }
  out.push([t, "sil"]);
  return { marks: out, length: t };
}

/** The viseme at time `st` into a timeline. */
export function visemeAt(timeline, st) {
  const marks = timeline.marks;
  let lo = 0, hi = marks.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (marks[mid][0] <= st) lo = mid;
    else hi = mid - 1;
  }
  return marks[lo] ? marks[lo][1] : "sil";
}

/** Gestures for a reply, phrase by phrase, from the words: [{at, dur, kind, n}]. */
export function planGestures(text, rate = 14.5) {
  const phrases = String(text || "").split(/(?<=[.!?;:,])\s+/).filter((p) => p.trim());
  const plan = [];
  let t = 0, flip = false, counted = 0;
  for (const p of phrases) {
    const low = p.toLowerCase();
    const dur = Math.max(0.6, p.length / rate);
    let kind = null, n = 0;
    if (/^(hi|hey|hello|yo|ayy+|heyy+|what'?s good|good (morning|evening|afternoon)|welcome)\b/.test(low)) kind = "wave";
    else if (/\b(first|1\.|1\)|one,)\b/.test(low)) { kind = "count"; n = 1; counted = 1; }
    else if (/\b(second|secondly|2\.|2\)|two,|next)\b/.test(low) && counted) { kind = "count"; n = ++counted; }
    else if (/\b(third|thirdly|3\.|3\)|finally|lastly)\b/.test(low) && counted) { kind = "count"; n = Math.min(5, ++counted); }
    else if (/(!|\b(awesome|amazing|let'?s go|let'?s get it|great job|congrat|nice|yes+|that'?s hard|fire|incredible)\b)/.test(low)) kind = /\b(let'?s go|congrat|yes+)\b/.test(low) ? "cheer" : "pump";
    else if (/\b(sorry|unfortunately|can'?t|cannot|couldn'?t|no luck|not sure|don'?t know)\b/.test(low)) kind = "shrug";
    else if (/\b(i think|maybe|hmm+|let me (see|think|check)|perhaps|probably|i guess|wonder)\b/.test(low)) kind = "chin";
    else if (/\?\s*$/.test(low)) kind = "ask";
    else if (/^(i|i'm|i've|i'll|me|my)\b/.test(low)) kind = "chest";
    else if (/\b(here'?s|this|look|check (it|this) out|over here|see)\b/.test(low)) kind = "present";
    else if (/\b(you|your|you'?re)\b/.test(low)) kind = "point";
    else if (p.length > 24) { kind = flip ? "explain2" : "explain"; flip = !flip; }
    if (kind) plan.push({ at: t, dur: Math.min(dur + 0.2, kind === "wave" ? 1.8 : 3.2), kind, n });
    t += dur + (/[.!?]$/.test(p.trim()) ? 0.3 : 0.15);
  }
  return plan;
}

/** The gesture at time `st` into a plan, or null. */
export function gestureAt(plan, st) {
  return (plan || []).find((g) => st >= g.at && st < g.at + g.dur) || null;
}

/**
 * Follows the speech: a new text starts a new plan; it begins when the voice
 * does (or after a few seconds if there's no sound, e.g. muted).
 * Returns { st (seconds into the reply, or -1), talking, timeline, plan }.
 */
export function follow(state, say, energy, t) {
  const text = say && say.text;
  if (text && text !== state.sayText) {
    state.sayText = text;
    state.timeline = visemeTimeline(text);
    state.plan = planGestures(text);
    state.sayStart = 0;
    state.sayAsked = t;
  }
  if (energy > 0.04) state.quietSince = t;
  if (state.sayText && !state.sayStart && (energy > 0.06 || t - state.sayAsked > 6)) state.sayStart = t;
  const st = state.sayStart ? t - state.sayStart : -1;
  const talking = !!(state.sayStart && state.timeline && st < state.timeline.length + 0.4);
  return { st, talking, timeline: state.timeline, plan: state.plan, quiet: t - (state.quietSince || 0) > 0.18 };
}
