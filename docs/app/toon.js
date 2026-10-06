// Izuki's 2D characters — one for every voice, drawn live as vector art.
//
// Two looks:
//   flat   clean flat-vector motion design: bold shapes, a limited palette,
//          one soft shadow tone, snappy squash-and-stretch timing
//   comic  Spider-Verse-style comic: ink outlines, halftone (Ben-Day) dots in
//          the shadows, a slightly off print registration, posed "on twos"
//
// They're alive: they breathe, shift their weight, blink and glance around,
// look at the pointer, and — while Izuki talks — an animator plans gestures
// from the words (a wave for "hey", fingers for "first… second…", a hand to
// the chin for "I think", palms up for a question, a fist pump for "let's
// go!") and the mouth makes the real shapes of the words (ah, ee, oh, oo,
// m-b-p, f-v…), timed to the voice.
//
// drawToon(ctx, size, opts) paints one frame into a 2D canvas (the orb).

import { follow, gestureAt, visemeAt } from "./speech.js";

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);

// ------------------------------------------------------------------ colour

function hex(c) {
  const h = c.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((x) => x + x).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const css = ([r, g, b], a = 1) => (a >= 1 ? `rgb(${r | 0},${g | 0},${b | 0})` : `rgba(${r | 0},${g | 0},${b | 0},${a})`);
/** Darker (k<0) or lighter (k>0), keeping the hue warm the way paint does. */
function tone(c, k) {
  const [r, g, b] = hex(c);
  if (k < 0) {
    const t = -k;
    // Shadows lean cool-violet, like a lit illustration.
    return css([r * (1 - t) + 40 * t * 0.35, g * (1 - t) + 20 * t * 0.35, b * (1 - t) + 70 * t * 0.35]);
  }
  return css([r + (255 - r) * k, g + (255 - g) * k, b + (255 - b) * k]);
}

export const SKIN = {
  porcelain: "#f7dac6", fair: "#efc3a3", light: "#e3ab84", tan: "#c98c62", olive: "#b8895c",
  brown: "#94603d", deep: "#6f4229", ebony: "#4c2b1b",
};

// ------------------------------------------------------------------ the cast

/**
 * One design per voice: g (m/f), skin, hair [style, colour], top [style,
 * colour, accent], pants, shoes, eyes, extras.
 */
export const CHARACTERS = {
  nova: { name: "Nova", g: "f", skin: "tan", hair: ["bob", "#2a1840", "#8b5cf6"], top: ["jacket", "#1f2a44", "#2dd4bf"], pants: "#1b1f2e", shoes: "#f3f4f6", eyes: "#4a2f1a", extras: ["studs"] },
  leo: { name: "Leo", g: "m", skin: "brown", hair: ["buzz", "#17110d"], top: ["sweater", "#2b3a55", "#93a4c3"], pants: "#2a2a30", shoes: "#3a2a20", eyes: "#3a2516", extras: ["beard"] },
  max: { name: "Max", g: "m", skin: "fair", hair: ["messy", "#6a4326"], top: ["hoodie", "#6b7280", "#f59e0b"], pants: "#2f4a6b", shoes: "#f3f4f6", eyes: "#4b6a3a", extras: ["stubble"] },
  aria: { name: "Aria", g: "f", skin: "light", hair: ["ponytail", "#d9a54a"], top: ["tee", "#f472b6", "#fde68a"], pants: "#334155", shoes: "#ffffff", eyes: "#3b6ea5", extras: [] },
  sage: { name: "Sage", g: "f", skin: "olive", hair: ["long", "#3a2418"], top: ["sweater", "#84a98c", "#d8e2dc"], pants: "#4a4e45", shoes: "#d6ccc2", eyes: "#5a3d23", extras: [] },
  ada: { name: "Ada", g: "f", skin: "fair", hair: ["bun", "#8a5a33"], top: ["blazer", "#7c3a2d", "#f5efe6"], pants: "#2d2a2a", shoes: "#3b2a22", eyes: "#4e6b45", extras: ["glasses"] },
  sophie: { name: "Sophie", g: "f", skin: "porcelain", hair: ["bob", "#b0472a"], top: ["sweater", "#1e3a5f", "#e8e8e8"], pants: "#2b2b33", shoes: "#111827", eyes: "#3f7d5a", extras: [] },
  james: { name: "James", g: "m", skin: "fair", hair: ["side", "#5b3a20"], top: ["blazer", "#2d3748", "#e2e8f0"], pants: "#2d3748", shoes: "#3b2a22", eyes: "#3c5a7a", extras: ["tie"] },
  ezinne: { name: "Ezinne", g: "f", skin: "deep", hair: ["braids", "#1a120d", "#c9a227"], top: ["tee", "#e76f51", "#2a9d8f"], pants: "#264653", shoes: "#f4a261", eyes: "#2b1a10", extras: ["hoops"] },
  abeo: { name: "Abeo", g: "m", skin: "deep", hair: ["fade", "#120c08"], top: ["shirt", "#2a9d8f", "#f4d35e"], pants: "#22223b", shoes: "#f3f4f6", eyes: "#2b1a10", extras: ["beard"] },
  dre: { name: "Dre", g: "m", skin: "brown", hair: ["waves", "#120c08"], top: ["hoodie", "#111827", "#f59e0b"], pants: "#374151", shoes: "#f3f4f6", eyes: "#2b1a10", extras: ["chain", "stubble"] },
  nia: { name: "Nia", g: "f", skin: "brown", hair: ["puffs", "#1a120d"], top: ["crop", "#a855f7", "#fde047"], pants: "#1f2937", shoes: "#ffffff", eyes: "#2b1a10", extras: ["hoops"] },
  niamh: { name: "Niamh", g: "f", skin: "porcelain", hair: ["long", "#c2410c"], top: ["sweater", "#166534", "#fef3c7"], pants: "#3f3f46", shoes: "#78350f", eyes: "#2f855a", extras: [] },
  jack: { name: "Jack", g: "m", skin: "light", hair: ["messy", "#c69a5a"], top: ["tee", "#0ea5e9", "#fbbf24"], pants: "#a16207", shoes: "#f3f4f6", eyes: "#2b6cb0", extras: ["stubble"] },
  priya: { name: "Priya", g: "f", skin: "tan", hair: ["long", "#14100d"], top: ["blazer", "#be185d", "#fde68a"], pants: "#1f2937", shoes: "#111827", eyes: "#3a2516", extras: ["studs"] },
  asilia: { name: "Asilia", g: "f", skin: "ebony", hair: ["afro", "#120c08"], top: ["tee", "#f59e0b", "#7c2d12"], pants: "#7c2d12", shoes: "#f3f4f6", eyes: "#2b1a10", extras: ["hoops"] },
  thabo: { name: "Thabo", g: "m", skin: "deep", hair: ["buzz", "#120c08"], top: ["jacket", "#065f46", "#fbbf24"], pants: "#1f2937", shoes: "#f3f4f6", eyes: "#2b1a10", extras: ["beard"] },
  chidi: { name: "Chidi", g: "m", skin: "deep", hair: ["locs", "#120c08"], top: ["tee", "#16a34a", "#ffffff"], pants: "#1f2937", shoes: "#f3f4f6", eyes: "#2b1a10", extras: [] },
  amaka: { name: "Amaka", g: "f", skin: "brown", hair: ["braids", "#1a120d", "#8b5cf6"], top: ["shirt", "#f97316", "#16a34a"], pants: "#1f2937", shoes: "#ffffff", eyes: "#2b1a10", extras: ["hoops"] },
  lucia: { name: "Lucía", g: "f", skin: "olive", hair: ["curly", "#2b1a12"], top: ["tee", "#dc2626", "#fde68a"], pants: "#1e3a8a", shoes: "#ffffff", eyes: "#4a2f1a", extras: ["hoops"] },
  mateo: { name: "Mateo", g: "m", skin: "tan", hair: ["quiff", "#1a120d"], top: ["shirt", "#15803d", "#fef08a"], pants: "#3f3f46", shoes: "#78350f", eyes: "#3a2516", extras: ["moustache"] },
  camille: { name: "Camille", g: "f", skin: "fair", hair: ["bob", "#20140d"], top: ["stripes", "#1e3a8a", "#ffffff"], pants: "#111827", shoes: "#b91c1c", eyes: "#4a5a3a", extras: ["beret"] },
  bia: { name: "Bia", g: "f", skin: "tan", hair: ["curly", "#3b2414"], top: ["tank", "#facc15", "#16a34a"], pants: "#1d4ed8", shoes: "#ffffff", eyes: "#4a2f1a", extras: [] },
  lena: { name: "Lena", g: "f", skin: "porcelain", hair: ["ponytail", "#e7c27d"], top: ["sweater", "#334155", "#e2e8f0"], pants: "#1f2937", shoes: "#111827", eyes: "#3b82a0", extras: ["glasses"] },
  zuri: { name: "Zuri", g: "f", skin: "ebony", hair: ["locs", "#1a120d", "#d4a017"], top: ["tee", "#0d9488", "#f59e0b"], pants: "#422006", shoes: "#f3f4f6", eyes: "#2b1a10", extras: ["hoops"] },
  layla: { name: "Layla", g: "f", skin: "olive", hair: ["long", "#14100d"], top: ["blazer", "#0f766e", "#fef3c7"], pants: "#1f2937", shoes: "#111827", eyes: "#3a2516", extras: ["studs"] },
  ananya: { name: "Ananya", g: "f", skin: "tan", hair: ["braid", "#14100d"], top: ["kurta", "#c026d3", "#fbbf24"], pants: "#fde68a", shoes: "#b45309", eyes: "#3a2516", extras: ["studs"] },
  mei: { name: "Mei", g: "f", skin: "light", hair: ["bob", "#120c08"], top: ["jacket", "#dc2626", "#111827"], pants: "#111827", shoes: "#f3f4f6", eyes: "#2b1a10", extras: [] },
  yuki: { name: "Yuki", g: "f", skin: "porcelain", hair: ["long", "#1a1416", "#ec4899"], top: ["hoodie", "#fbcfe8", "#6366f1"], pants: "#312e81", shoes: "#ffffff", eyes: "#2b1a10", extras: ["headphones"] },
  rex: { name: "Rex", g: "m", skin: "fair", hair: ["slick", "#1a120d"], top: ["jacket", "#111111", "#ef4444"], pants: "#1f2937", shoes: "#111111", eyes: "#3a2516", extras: ["shades", "stubble"] },
  roxy: { name: "Roxy", g: "f", skin: "light", hair: ["pixie", "#e11d48"], top: ["jacket", "#18181b", "#e11d48"], pants: "#27272a", shoes: "#111111", eyes: "#3a2516", extras: ["studs"] },
  blaze: { name: "Blaze", g: "m", skin: "deep", hair: ["fade", "#120c08"], top: ["tank", "#ef4444", "#111827"], pants: "#111827", shoes: "#f97316", eyes: "#2b1a10", extras: ["headband"], build: "broad" },
  alfred: { name: "Alfred", g: "m", skin: "fair", hair: ["side", "#cbd5e1"], top: ["tux", "#111827", "#ffffff"], pants: "#111827", shoes: "#111111", eyes: "#4b5563", extras: ["bowtie", "moustache"] },
  atlas: { name: "Atlas", g: "m", skin: "light", hair: ["side", "#2b2b2b"], top: ["turtleneck", "#0f172a", "#38bdf8"], pants: "#0f172a", shoes: "#111827", eyes: "#38bdf8", extras: ["visor"] },
  kiki: { name: "Kiki", g: "f", skin: "tan", hair: ["puffs", "#f472b6"], top: ["crop", "#22d3ee", "#f0abfc"], pants: "#7c3aed", shoes: "#fef08a", eyes: "#3a2516", extras: ["hoops"] },
  morgan: { name: "Morgan", g: "m", skin: "deep", hair: ["bald", "#120c08"], top: ["blazer", "#1c1917", "#d6d3d1"], pants: "#1c1917", shoes: "#111111", eyes: "#2b1a10", extras: ["beard"] },
  salty: { name: "Captain Salty", g: "m", skin: "tan", hair: ["messy", "#3b2414"], top: ["coat", "#7f1d1d", "#fbbf24"], pants: "#3f2a1e", shoes: "#111111", eyes: "#3a2516", extras: ["bandana", "beard", "eyepatch"] },
};

export function characterFor(persona) {
  return CHARACTERS[persona] || CHARACTERS.nova;
}

// ------------------------------------------------------------------ mouth shapes

/** Mouth shapes: open, width, round, teeth (top), press (lips together). */
const VIS = {
  rest: { o: 0.04, w: 0.5, r: 0, t: 0, p: 0.5 },
  A: { o: 0.95, w: 0.62, r: 0.1, t: 0.7, p: 0 },
  E: { o: 0.5, w: 0.86, r: 0, t: 0.8, p: 0 },
  I: { o: 0.32, w: 0.95, r: 0, t: 1, p: 0 },
  O: { o: 0.72, w: 0.36, r: 0.9, t: 0.2, p: 0 },
  U: { o: 0.36, w: 0.24, r: 1, t: 0, p: 0 },
  M: { o: 0, w: 0.52, r: 0.1, t: 0, p: 1 },
  F: { o: 0.16, w: 0.62, r: 0, t: 1, p: 0, f: 1 },
  L: { o: 0.45, w: 0.62, r: 0, t: 0.8, p: 0, tongue: 1 },
  C: { o: 0.28, w: 0.72, r: 0, t: 0.9, p: 0 },
};
/** The 15 standard visemes, as these mouth shapes. */
const SHAPE_OF = { sil: "rest", aa: "A", E: "E", I: "I", O: "O", U: "U", PP: "M", FF: "F", TH: "L", nn: "L", DD: "C", kk: "C", CH: "U", SS: "I", RR: "O" };


// ------------------------------------------------------------------ the animator

/** Arm poses: [upper-arm angle, forearm angle] from straight down; + is outward. */
const POSES = {
  rest: [[0.1, 0.04], [0.1, 0.04]],
  hips: [[0.75, -1.35], [0.75, -1.35]],
  wave: [[0.1, 0.04], [1.25, 2.95]],
  ask: [[0.42, 1.42], [0.42, 1.42]],
  shrug: [[0.5, 1.55], [0.5, 1.55]],
  chin: [[0.1, 0.04], [-0.12, -2.55]],
  count: [[0.1, 0.04], [-0.02, -2.25]],
  pump: [[0.1, 0.04], [2.55, 3.05]],
  cheer: [[2.45, 2.95], [2.45, 2.95]],
  point: [[0.1, 0.04], [0.32, -1.95]],
  chest: [[0.1, 0.04], [-0.26, -2.42]],
  present: [[0.1, 0.04], [0.55, 1.15]],
  explain: [[0.32, 1.25], [0.12, 0.1]],
  explain2: [[0.12, 0.1], [0.32, 1.25]],
  think: [[-0.18, -2.4], [-0.12, -2.55]],
};
const HANDS = { wave: "open", ask: "palm", shrug: "palm", chin: "fist", count: "count", pump: "fist", cheer: "fist", point: "point", chest: "flat", present: "palm", explain: "palm", explain2: "palm", hips: "fist", think: "fist" };


// ------------------------------------------------------------------ per-orb state

const states = new WeakMap();

function newState(t) {
  return {
    t0: t, last: t,
    arms: [[0.1, 0.04], [0.1, 0.04]], armV: [[0, 0], [0, 0]],
    hand: ["open", "open"], count: 0,
    head: { yaw: 0, pitch: 0, roll: 0, yv: 0, pv: 0, rv: 0 },
    eye: { x: 0, y: 0, nextSacc: t + 1, sx: 0, sy: 0 },
    blinkAt: -9, nextBlink: t + 2,
    mouth: { ...VIS.rest }, smile: 0.2, brow: 0, browR: 0,
    sway: 0, swayT: 0, nextShift: t + 3, shiftTo: 0,
    say: null, sayStart: 0, timeline: null, plan: null, quietSince: 0,
    pokeSeen: 0, jumpAt: -9, e: 0, lastBeat: 0, nod: 0, nodV: 0,
  };
}

function spring(cur, vel, target, k, d, dt) {
  const v = vel + ((target - cur) * k - vel * d) * dt;
  return [cur + v * dt, v];
}

/** Move everything a step: the animator's choices, springs, blinks, the mouth. */
function animate(s, o, dt, t) {
  const energy = clamp(o.energy || 0, 0, 1);
  s.e += (energy - s.e) * (energy > s.e ? 0.6 : 0.2);
  const thinking = typeof o.thinking === "number" ? o.thinking : o.thinking ? 1 : 0;
  // The reply's words and gestures, from when the voice starts (speech.js).
  const F = follow(s, o.say, s.e, t);
  const st = F.st, talking = F.talking;

  // Poked: a hop, a blink, a laugh.
  if (o.poke && o.poke !== s.pokeSeen) {
    s.pokeSeen = o.poke;
    s.jumpAt = t;
    s.blinkAt = t;
    s.head.pv -= 3;
  }
  const jump = t - s.jumpAt < 0.7 ? Math.sin(((t - s.jumpAt) / 0.7) * Math.PI) : 0;

  // ---- arms: the gesture for this moment, else thinking, else at rest
  let pose = "rest", n = 0;
  if (thinking > 0.5 && !talking) pose = "think";
  if (talking) {
    const g = gestureAt(F.plan, st);
    if (g) { pose = g.kind; n = g.n; }
  }
  if (jump > 0) pose = "cheer";
  // Never frozen: between replies it lives — hands on hips, arms folded, a
  // look around, a stretch, every so often.
  if (pose === "rest" && !talking) {
    if (!s.idleUntil || t > s.idleUntil + (s.idleGap || 4)) {
      s.idleKind = ["rest", "hips", "think", "look", "rest", "stretch", "hips", "look"][Math.floor(Math.random() * 8)];
      s.idleUntil = t + (s.idleKind === "stretch" ? 2 : 3 + Math.random() * 3);
      s.idleGap = 3 + Math.random() * 6;
    }
    if (t < s.idleUntil && s.idleKind !== "look" && s.idleKind !== "rest") pose = s.idleKind === "stretch" ? "cheer" : s.idleKind;
  }
  const target = POSES[pose] || POSES.rest;
  for (let side = 0; side < 2; side++) {
    for (let j = 0; j < 2; j++) {
      const [c, v] = spring(s.arms[side][j], s.armV[side][j], target[side][j], 46, 11, dt);
      s.arms[side][j] = c;
      s.armV[side][j] = v;
    }
    s.hand[side] = target === POSES.rest || (side === 0 && ["wave", "chin", "count", "pump", "point", "chest", "present"].includes(pose)) ? "open" : HANDS[pose] || "open";
  }
  s.count = n;
  // Beats: little hand flicks on the loud bits of speech.
  if (talking && s.e > 0.45 && t - s.lastBeat > 0.35) {
    s.lastBeat = t;
    s.armV[1][1] += (Math.random() - 0.3) * 2.5;
    s.nodV += 2.2;
  }
  // Waving: the forearm swings.
  if (pose === "wave") s.arms[1][1] += Math.sin(t * 14) * 0.22;

  // ---- head: look at the pointer, tilt on a question, nod on beats
  const look = o.look || null;
  const asking = pose === "ask";
  const glance = s.idleKind === "look" && t < s.idleUntil ? Math.sin(t * 0.9) * 0.55 : 0;
  const yawT = (look ? look.x * 0.55 : 0.12 * Math.sin(t * 0.37) + glance) + (thinking > 0.5 ? 0.25 : 0);
  const pitchT = (look ? -look.y * 0.3 : 0.05 * Math.sin(t * 0.29)) + (thinking > 0.5 ? -0.25 : 0);
  const rollT = (asking ? 0.16 : 0) + 0.04 * Math.sin(t * 0.43) + (pose === "chin" ? -0.1 : 0);
  [s.head.yaw, s.head.yv] = spring(s.head.yaw, s.head.yv, yawT, 26, 8, dt);
  [s.head.pitch, s.head.pv] = spring(s.head.pitch, s.head.pv, pitchT, 26, 8, dt);
  [s.head.roll, s.head.rv] = spring(s.head.roll, s.head.rv, rollT, 22, 7, dt);
  [s.nod, s.nodV] = spring(s.nod, s.nodV, 0, 60, 9, dt);

  // ---- eyes: darts, the pointer, up while thinking; blinks
  if (t > s.eye.nextSacc) {
    s.eye.sx = (Math.random() - 0.5) * 0.7;
    s.eye.sy = (Math.random() - 0.5) * 0.4;
    s.eye.nextSacc = t + 0.5 + Math.random() * 2.2;
  }
  const ex = look ? look.x : thinking > 0.5 ? 0.6 : s.eye.sx;
  const ey = look ? look.y : thinking > 0.5 ? -0.7 : s.eye.sy;
  s.eye.x += (ex - s.eye.x) * Math.min(1, dt * 18);
  s.eye.y += (ey - s.eye.y) * Math.min(1, dt * 18);
  if (t > s.nextBlink) {
    s.blinkAt = t;
    s.nextBlink = t + 2 + Math.random() * 3.2;
    if (Math.random() < 0.18) s.nextBlink = t + 0.32;
  }
  const bt = (t - s.blinkAt) / 0.16;
  s.blink = bt >= 0 && bt < 1 ? Math.sin(bt * Math.PI) : 0;

  // ---- face: mood, the words' mouth shapes
  const mood = clamp(o.mood || 0, -1, 1);
  const smileT = jump > 0 ? 1 : pose === "cheer" || pose === "pump" ? 0.9 : mood * 0.8 + 0.18;
  s.smile += (smileT - s.smile) * Math.min(1, dt * 4);
  const browT = (thinking > 0.5 ? 0.5 : 0) + (asking ? 0.45 : 0) + (pose === "shrug" ? 0.6 : 0) + (jump > 0 ? 0.8 : 0) + Math.max(0, -mood) * 0.3;
  s.brow += (browT - s.brow) * Math.min(1, dt * 6);
  s.browR = thinking > 0.5 || pose === "chin" ? 0.6 : asking ? 0.35 : 0;

  let shape = VIS.rest;
  if (talking && st >= 0) {
    shape = VIS[SHAPE_OF[visemeAt(F.timeline, st)]] || VIS.rest;
    // Silence (between sentences, or a voice slower than planned): close up.
    if (F.quiet) shape = VIS.rest;
  } else if (s.e > 0.08) {
    // A voice but no words to follow (the phone, a TV): cycle real shapes.
    const k = ["A", "E", "O", "C", "I", "M", "A", "U"][Math.floor(t * 9) % 8];
    shape = VIS[k];
  }
  const loud = talking ? 0.55 + 0.6 * clamp(s.e * 2, 0, 1) : clamp(s.e * 2.2, 0, 1);
  const m = s.mouth;
  const k = Math.min(1, dt * 22);
  m.o += (shape.o * loud - m.o) * k;
  m.w += (shape.w - m.w) * k;
  m.r += (shape.r - m.r) * k;
  m.t += (shape.t - m.t) * k;
  m.p += (shape.p - m.p) * k;
  m.f = (m.f || 0) + ((shape.f || 0) - (m.f || 0)) * k;
  m.tongue = (m.tongue || 0) + ((shape.tongue || 0) - (m.tongue || 0)) * k;

  // ---- body: breathing, weight shifts
  if (t > s.nextShift) {
    s.shiftTo = (Math.random() - 0.5) * 2;
    s.nextShift = t + 3 + Math.random() * 4;
  }
  s.sway += (s.shiftTo - s.sway) * Math.min(1, dt * 1.6);
  s.jump = jump;
  s.pose = pose;
}

// ------------------------------------------------------------------ drawing kit

/**
 * One shape painted the way the style wants: a fill, a shadow on the side
 * away from the light (flat: a darker tone; comic: halftone dots), and an
 * outline (comic: ink).
 */
function painter(ctx, style, unit) {
  const comic = style === "comic";
  const ink = "#15101f";
  const patterns = new Map();
  const dots = (base) => {
    let p = patterns.get(base);
    if (p) return p;
    const c = document.createElement("canvas");
    const n = 7;
    c.width = c.height = n;
    const g = c.getContext("2d");
    g.fillStyle = base;
    g.fillRect(0, 0, n, n);
    g.fillStyle = tone(base, -0.45);
    g.beginPath();
    g.arc(n / 2, n / 2, n * 0.3, 0, TAU);
    g.fill();
    p = ctx.createPattern(c, "repeat");
    try { p.setTransform(new DOMMatrix().scale(1 / unit)); } catch {}
    patterns.set(base, p);
    return p;
  };
  // Skin is shaded with ink hatching (the films' look), cloth with dots.
  const hatches = new Map();
  const hatch = (base) => {
    let p = hatches.get(base);
    if (p) return p;
    const c = document.createElement("canvas");
    const n = 6;
    c.width = c.height = n;
    const g = c.getContext("2d");
    g.fillStyle = tone(base, -0.12);
    g.fillRect(0, 0, n, n);
    g.strokeStyle = tone(base, -0.55);
    g.lineWidth = 1.1;
    g.beginPath();
    g.moveTo(0, n); g.lineTo(n, 0);
    g.moveTo(-n / 2, n / 2); g.lineTo(n / 2, -n / 2);
    g.moveTo(n / 2, n * 1.5); g.lineTo(n * 1.5, n / 2);
    g.stroke();
    p = ctx.createPattern(c, "repeat");
    try { p.setTransform(new DOMMatrix().scale(1 / unit)); } catch {}
    hatches.set(base, p);
    return p;
  };
  const shadowOffset = 1.6;
  return {
    comic,
    ink,
    lw: comic ? 0.55 : 0.0,
    shape(path, base, o = {}) {
      ctx.save();
      path();
      ctx.fillStyle = base;
      ctx.fill();
      if (!o.flat) {
        // The lit side is a copy of the shape moved toward the light; what
        // it doesn't cover is in shadow.
        ctx.clip();
        ctx.fillStyle = comic ? (o.skin ? hatch(base) : dots(base)) : tone(base, -0.22);
        path();
        ctx.fill();
        ctx.translate(-shadowOffset * (o.light ?? 1), -shadowOffset * 0.8 * (o.light ?? 1));
        ctx.fillStyle = base;
        path();
        ctx.fill();
      }
      ctx.restore();
      if (comic && !o.noInk) {
        ctx.save();
        path();
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.strokeStyle = ink;
        ctx.lineWidth = o.ink ?? 0.55;
        ctx.stroke();
        ctx.restore();
      } else if (!comic && o.edge) {
        ctx.save();
        path();
        ctx.strokeStyle = tone(base, -0.35);
        ctx.lineWidth = 0.25;
        ctx.stroke();
        ctx.restore();
      }
    },
    line(path, color, w) {
      ctx.save();
      path();
      ctx.strokeStyle = color;
      ctx.lineWidth = w;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      ctx.restore();
    },
  };
}

/** A limb: a tapered capsule from a to b. */
function capsule(ctx, a, b, r1, r2) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const ang = Math.atan2(dy, dx);
  ctx.beginPath();
  ctx.moveTo(a[0] + nx * r1, a[1] + ny * r1);
  ctx.lineTo(b[0] + nx * r2, b[1] + ny * r2);
  ctx.arc(b[0], b[1], r2, ang + Math.PI / 2, ang - Math.PI / 2, true);
  ctx.lineTo(a[0] - nx * r1, a[1] - ny * r1);
  ctx.arc(a[0], a[1], r1, ang - Math.PI / 2, ang + Math.PI / 2, true);
  ctx.closePath();
}

// ------------------------------------------------------------------ the figure

const SKIN_OF = (c) => SKIN[c.skin] || c.skin;

function figure(ctx, C, s, P, t) {
  const male = C.g === "m";
  const broad = C.build === "broad" ? 1.12 : 1;
  const skin = SKIN_OF(C);
  const [topStyle, topCol, topAcc] = C.top;
  const breathe = Math.sin(t * 1.5);
  const sway = s.sway;
  const hop = s.jump * 6;
  const hipX = sway * 1.2;
  const hipY = -48 - hop;
  const shW = (male ? 12.4 : 10.4) * broad * (1 + breathe * 0.006);
  const chestY = -75 - hop - breathe * 0.25;
  const neckY = chestY - 3;
  const lean = sway * 0.02;
  const has = (x) => (C.extras || []).includes(x);

  // ---- legs (behind the top)
  const legs = [-1, 1].map((side) => {
    const hip = [hipX + side * (male ? 4.6 : 4.4), hipY + 1];
    const bend = side === Math.sign(sway) ? Math.abs(sway) * 1.6 : 0;
    const knee = [hip[0] + side * 0.6 + sway * 0.4 - bend * 0.3, -24 - hop * 0.6];
    const ankle = [side * 5.2 + sway * 0.15, -3.5 - hop * 0.3];
    return { side, hip, knee, ankle };
  });
  for (const L of legs) {
    P.shape(() => { capsule(ctx, L.hip, L.knee, male ? 4.4 : 4.2, 3.6); }, C.pants);
    P.shape(() => { capsule(ctx, L.knee, L.ankle, 3.6, 2.9); }, C.pants);
    // Shoes: a rounded sneaker pointing a little outward.
    P.shape(() => {
      ctx.beginPath();
      ctx.ellipse(L.ankle[0] + L.side * 1.2, L.ankle[1] + 2.2, 4.2, 2.3, L.side * 0.12, 0, TAU);
    }, C.shoes, { edge: true });
    if (!P.comic) P.line(() => { ctx.beginPath(); ctx.moveTo(L.ankle[0] + L.side * 1.2 - 3.6, L.ankle[1] + 3.4); ctx.lineTo(L.ankle[0] + L.side * 1.2 + 3.6, L.ankle[1] + 3.4); }, tone(C.shoes, -0.3), 0.5);
  }

  // ---- torso
  const sh = [-1, 1].map((side) => [lean * 30 + side * shW, chestY + 1.2 - (s.pose === "shrug" ? 1.4 : 0)]);
  const waistW = (male ? 9.4 : 7.6) * broad;
  const hipW = (male ? 9.2 : 9.8) * broad;
  const torso = () => {
    ctx.beginPath();
    ctx.moveTo(sh[0][0] + 1.4, sh[0][1] - 1.6);
    ctx.quadraticCurveTo(lean * 30, neckY - 0.6, sh[1][0] - 1.4, sh[1][1] - 1.6);
    ctx.quadraticCurveTo(sh[1][0] + 0.8, sh[1][1] - 0.6, sh[1][0] + 0.4, sh[1][1] + 3);
    ctx.quadraticCurveTo(hipX + waistW + 0.4, -60 - hop, hipX + hipW, hipY + (topStyle === "coat" ? 14 : topStyle === "crop" ? -8 : 2));
    ctx.lineTo(hipX - hipW, hipY + (topStyle === "coat" ? 14 : topStyle === "crop" ? -8 : 2));
    ctx.quadraticCurveTo(hipX - waistW - 0.4, -60 - hop, sh[0][0] - 0.4, sh[0][1] + 3);
    ctx.quadraticCurveTo(sh[0][0] - 0.8, sh[0][1] - 0.6, sh[0][0] + 1.4, sh[0][1] - 1.6);
    ctx.closePath();
  };
  // Bare midriff under a crop top.
  if (topStyle === "crop") P.shape(() => { ctx.beginPath(); ctx.rect(hipX - waistW + 0.4, -60 - hop, (waistW - 0.4) * 2, 14); }, skin, { flat: true, noInk: true });
  // Neck.
  const headX = lean * 34 + Math.sin(t * 0.7) * 0.15;
  P.shape(() => { ctx.beginPath(); ctx.rect(headX - 2.6, neckY - 6, 5.2, 7); }, skin, { skin: true });
  // The hood sits behind the neck.
  if (topStyle === "hoodie") P.shape(() => { ctx.beginPath(); ctx.ellipse(headX, neckY + 0.5, 6.4, 3.2, 0, 0, TAU); }, tone(topCol, -0.15));
  P.shape(torso, topCol, { edge: true });

  // Details of the top.
  const cx = lean * 30;
  if (topStyle === "hoodie") {
    P.line(() => { ctx.beginPath(); ctx.moveTo(cx - 1.4, neckY + 1); ctx.lineTo(cx - 1.8, neckY + 8); ctx.moveTo(cx + 1.4, neckY + 1); ctx.lineTo(cx + 1.8, neckY + 8); }, topAcc, 0.45);
    P.shape(() => { ctx.beginPath(); ctx.moveTo(hipX - 5.5, -56 - hop); ctx.lineTo(hipX + 5.5, -56 - hop); ctx.lineTo(hipX + 6.5, -50 - hop); ctx.lineTo(hipX - 6.5, -50 - hop); ctx.closePath(); }, tone(topCol, -0.1), { flat: true });
  } else if (topStyle === "jacket" || topStyle === "blazer" || topStyle === "tux" || topStyle === "coat") {
    // An open front: the shirt underneath, and lapels.
    const shirt = topStyle === "jacket" ? topAcc : topStyle === "coat" ? "#f5efe6" : topAcc;
    P.shape(() => { ctx.beginPath(); ctx.moveTo(cx - 3, neckY + 0.5); ctx.lineTo(cx + 3, neckY + 0.5); ctx.lineTo(hipX + 1.2, hipY + 1); ctx.lineTo(hipX - 1.2, hipY + 1); ctx.closePath(); }, shirt, { flat: topStyle !== "jacket" });
    if (topStyle !== "jacket") {
      P.shape(() => { ctx.beginPath(); ctx.moveTo(cx - 3, neckY + 0.5); ctx.lineTo(cx - 0.6, neckY + 9); ctx.lineTo(cx - 4.8, neckY + 4); ctx.closePath(); }, tone(topCol, 0.12), { flat: true });
      P.shape(() => { ctx.beginPath(); ctx.moveTo(cx + 3, neckY + 0.5); ctx.lineTo(cx + 0.6, neckY + 9); ctx.lineTo(cx + 4.8, neckY + 4); ctx.closePath(); }, tone(topCol, 0.12), { flat: true });
    }
    if (topStyle === "coat") for (let i = 0; i < 3; i++) P.shape(() => { ctx.beginPath(); ctx.arc(cx + 3.4, neckY + 7 + i * 5, 0.7, 0, TAU); }, topAcc, { flat: true });
    if (has("tie")) P.shape(() => { ctx.beginPath(); ctx.moveTo(cx - 0.8, neckY + 1); ctx.lineTo(cx + 0.8, neckY + 1); ctx.lineTo(cx + 1.2, neckY + 11); ctx.lineTo(cx, neckY + 12.5); ctx.lineTo(cx - 1.2, neckY + 11); ctx.closePath(); }, "#9b1c1c");
    if (has("bowtie")) P.shape(() => { ctx.beginPath(); ctx.moveTo(cx, neckY + 1.5); ctx.lineTo(cx - 2.6, neckY + 0.2); ctx.lineTo(cx - 2.6, neckY + 2.8); ctx.closePath(); ctx.moveTo(cx, neckY + 1.5); ctx.lineTo(cx + 2.6, neckY + 0.2); ctx.lineTo(cx + 2.6, neckY + 2.8); ctx.closePath(); }, "#111111", { flat: true });
  } else if (topStyle === "turtleneck") {
    P.shape(() => { ctx.beginPath(); ctx.roundRect(headX - 3.1, neckY - 2.4, 6.2, 3.6, 1.2); }, tone(topCol, 0.06));
    P.line(() => { ctx.beginPath(); ctx.moveTo(cx - 4, neckY + 8); ctx.lineTo(cx + 4, neckY + 8); }, topAcc, 0.35);
  } else if (topStyle === "stripes") {
    for (let i = 0; i < 6; i++) {
      const y = neckY + 3 + i * 3.6;
      ctx.save(); torso(); ctx.clip();
      P.shape(() => { ctx.beginPath(); ctx.rect(-20 + hipX, y, 40, 1.3); }, topAcc, { flat: true, noInk: true });
      ctx.restore();
    }
  } else if (topStyle === "kurta") {
    P.line(() => { ctx.beginPath(); ctx.moveTo(cx, neckY + 0.5); ctx.lineTo(cx, neckY + 9); }, topAcc, 0.6);
  } else {
    // Tee, tank, shirt, sweater, crop: a neckline.
    P.line(() => { ctx.beginPath(); ctx.arc(headX, neckY - 0.6, 2.9, 0.15, Math.PI - 0.15); }, tone(topCol, -0.3), 0.55);
    if (topStyle === "shirt") P.line(() => { ctx.beginPath(); ctx.moveTo(cx, neckY + 2); ctx.lineTo(cx, hipY); }, tone(topCol, -0.25), 0.35);
  }
  if (has("chain")) P.line(() => { ctx.beginPath(); ctx.arc(headX, neckY - 1, 3.6, 0.35, Math.PI - 0.35); }, "#e7b923", 0.55);
  if (has("headphones")) P.line(() => { ctx.beginPath(); ctx.arc(headX, neckY - 0.2, 4.2, 0.1, Math.PI - 0.1); }, "#1f2937", 1.1);

  // ---- arms (in front of the body)
  const sleeves = topStyle === "tee" || topStyle === "crop" ? "short" : topStyle === "tank" ? "none" : "long";
  const UPPER = 13, FORE = 12;
  for (let side = 0; side < 2; side++) {
    const dir = side === 0 ? -1 : 1;
    const S = [sh[side][0] - dir * 1.2, sh[side][1] + 1.4];
    const [u, f] = s.arms[side];
    const E = [S[0] + Math.sin(u) * dir * UPPER, S[1] + Math.cos(u) * UPPER];
    const W = [E[0] + Math.sin(f) * dir * FORE, E[1] + Math.cos(f) * FORE];
    const upCol = sleeves === "long" ? topCol : skin;
    const foreCol = sleeves === "long" ? topCol : skin;
    const r0 = (male ? 3.2 : 2.7) * broad;
    P.shape(() => { capsule(ctx, S, E, r0, r0 * 0.86); }, sleeves === "none" ? skin : upCol);
    if (sleeves === "short") P.shape(() => { capsule(ctx, S, [S[0] + (E[0] - S[0]) * 0.55, S[1] + (E[1] - S[1]) * 0.55], r0 + 0.5, r0 + 0.3); }, topCol);
    P.shape(() => { capsule(ctx, E, W, r0 * 0.86, r0 * 0.72); }, foreCol);
    if (sleeves === "long") P.shape(() => { capsule(ctx, [lerp(E[0], W[0], 0.88), lerp(E[1], W[1], 0.88)], W, r0 * 0.78, r0 * 0.78); }, tone(topCol, -0.12), { flat: true });
    hand(ctx, P, W, Math.atan2(W[1] - E[1], W[0] - E[0]), s.hand[side], side === 1 ? s.count : 0, skin, dir, male);
  }
  return { headX, neckY };
}

/** A hand at the wrist, along the forearm: open, palm up, fist, pointing, flat, counting. */
function hand(ctx, P, W, ang, kind, count, skin, dir, male) {
  const k = male ? 1 : 0.88;
  ctx.save();
  ctx.translate(W[0], W[1]);
  ctx.rotate(ang - Math.PI / 2);
  ctx.scale(k, k);
  const palm = () => { ctx.beginPath(); ctx.roundRect(-2.3, 0.3, 4.6, 4.4, 1.8); };
  const shape = P.shape;
  P = { ...P, shape: (p, c, o = {}) => shape(p, c, { light: 0.3, ink: 0.4, ...o }) };
  if (kind === "fist" || kind === "count" || kind === "point") {
    P.shape(palm, skin);
    const up = kind === "point" ? 1 : kind === "count" ? count : 0;
    for (let i = 0; i < up; i++) {
      const x = -1.6 + i * 1.05;
      P.shape(() => { ctx.beginPath(); ctx.roundRect(x - 0.5, 3.4, 1.05, 4.2, 0.5); }, skin);
    }
    // Thumb.
    P.shape(() => { ctx.beginPath(); ctx.ellipse(-dir * 2.2, 2.1, 0.9, 1.6, -dir * 0.6, 0, TAU); }, skin);
  } else {
    // Open, palm or flat: four fingers and a thumb.
    P.shape(palm, skin);
    const spread = kind === "open" ? 0.22 : kind === "palm" ? 0.12 : 0.04;
    for (let i = 0; i < 4; i++) {
      const a = (i - 1.5) * spread;
      ctx.save();
      ctx.translate(-1.55 + i * 1.03, 4.2);
      ctx.rotate(a);
      P.shape(() => { ctx.beginPath(); ctx.roundRect(-0.5, -0.4, 1.0, 3.6 - Math.abs(i - 1.5) * 0.35, 0.5); }, skin);
      ctx.restore();
    }
    P.shape(() => { ctx.beginPath(); ctx.ellipse(-dir * 2.6, 2.4, 0.85, 1.9, -dir * 0.9, 0, TAU); }, skin);
  }
  ctx.restore();
}

// ------------------------------------------------------------------ the head

/** The head's place: over the neck, nodding and tilting; drawn a little big, for appeal. */
function headSpace(ctx, s, at) {
  const pitch = s.head.pitch + s.nod * 0.04;
  ctx.translate(at.headX, -87.0 - s.jump * 6 + pitch * 2);
  ctx.rotate(s.head.roll);
  ctx.scale(1.2, 1.2);
}

/** Long hair, locs and braids fall behind the body: drawn first. */
function hairBehind(ctx, C, s, P, t, at) {
  ctx.save();
  headSpace(ctx, s, at);
  hairBack(ctx, P, C.hair[0], C.hair[1], C.hair[2], t, s);
  ctx.restore();
}

function head(ctx, C, s, P, t, at) {
  const male = C.g === "m";
  const skin = SKIN_OF(C);
  const [hairStyle, hairCol, hairAcc] = C.hair;
  const has = (x) => (C.extras || []).includes(x);
  const yaw = clamp(s.head.yaw, -0.8, 0.8);
  ctx.save();
  headSpace(ctx, s, at);
  const turn = yaw * 2.4;
  const jaw = s.mouth.o * 1.1;

  // Ears.
  for (const side of [-1, 1]) {
    const hide = side * yaw > 0.45 ? 0.6 : 1;
    P.shape(() => { ctx.beginPath(); ctx.ellipse(side * 7.9 - turn * 0.25, 0.8, 1.5 * hide, 2.3, 0, 0, TAU); }, skin);
    if (has("hoops")) P.line(() => { ctx.beginPath(); ctx.arc(side * 7.9 - turn * 0.25, 4.2, 1.4, 0, TAU); }, "#e7b923", 0.4);
    if (has("studs")) P.shape(() => { ctx.beginPath(); ctx.arc(side * 7.9 - turn * 0.25, 2.9, 0.5, 0, TAU); }, "#e5e7eb", { flat: true });
  }

  // The face: a skull, then cheeks down to the chin (it drops as the mouth opens).
  const faceW = male ? 8.2 : 7.7;
  const chinY = (male ? 9.6 : 9.0) + jaw;
  const face = () => {
    ctx.beginPath();
    ctx.moveTo(-faceW, -1.6);
    ctx.bezierCurveTo(-faceW, -11.2, faceW, -11.2, faceW, -1.6);
    ctx.bezierCurveTo(faceW, 3.6, male ? 5.8 : 4.8, chinY - 0.4, turn * 0.3, chinY);
    ctx.bezierCurveTo(male ? -5.8 : -4.8, chinY - 0.4, -faceW, 3.6, -faceW, -1.6);
    ctx.closePath();
  };
  P.shape(face, skin, { light: 0.45, skin: true });
  if (has("beard")) {
    P.shape(() => {
      ctx.beginPath();
      ctx.moveTo(-faceW + 0.3, 0.5);
      ctx.bezierCurveTo(-faceW + 0.3, 5, -4, chinY + 1.4, turn * 0.3, chinY + 1.4);
      ctx.bezierCurveTo(4, chinY + 1.4, faceW - 0.3, 5, faceW - 0.3, 0.5);
      ctx.lineTo(faceW - 1.6, 1.2);
      ctx.bezierCurveTo(faceW - 2, 6.5, 3, 6.4 + jaw * 0.8, turn * 0.3, 6.6 + jaw * 0.8);
      ctx.bezierCurveTo(-3, 6.4 + jaw * 0.8, -faceW + 2, 6.5, -faceW + 1.6, 1.2);
      ctx.closePath();
    }, tone(hairCol, 0.08));
  }
  if (has("stubble")) {
    ctx.save(); face(); ctx.clip();
    ctx.fillStyle = css(hex(hairCol), 0.13);
    ctx.beginPath();
    ctx.moveTo(-faceW, 1.5);
    ctx.bezierCurveTo(-faceW + 0.5, 6, -4, chinY + 0.5, turn * 0.3, chinY + 0.5);
    ctx.bezierCurveTo(4, chinY + 0.5, faceW - 0.5, 6, faceW, 1.5);
    ctx.lineTo(faceW - 1.4, 2);
    ctx.bezierCurveTo(faceW - 2, 6.2, 2.5, 6.8, turn * 0.3, 6.9);
    ctx.bezierCurveTo(-2.5, 6.8, -faceW + 2, 6.2, -faceW + 1.4, 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Cheeks: they lift and blush with a smile.
  const sm = s.smile;
  for (const side of [-1, 1]) {
    ctx.fillStyle = css([235, 110, 120], (male ? 0.08 : 0.18) + Math.max(0, sm) * 0.18);
    ctx.beginPath();
    ctx.ellipse(side * 4.6 + turn * 0.6, 3.4 - Math.max(0, sm) * 0.5, 1.9, 1.2, 0, 0, TAU);
    ctx.fill();
  }

  // Eyes.
  const blink = s.blink;
  const squint = Math.max(0, sm) * 0.28;
  for (const side of [-1, 1]) {
    const ex = side * 3.35 + turn;
    const ey = -0.4;
    const w = (male ? 1.8 : 1.95) * (1 - Math.abs(side * yaw) * 0.25 * (side * yaw > 0 ? 1 : 0));
    const h = male ? 1.25 : 1.42;
    const open = clamp(1 - blink - squint, 0.04, 1) * (1 + s.brow * 0.12);
    const white = () => {
      ctx.beginPath();
      ctx.moveTo(ex - w, ey);
      ctx.quadraticCurveTo(ex, ey - h * 1.6 * open, ex + w, ey - 0.15);
      ctx.quadraticCurveTo(ex, ey + h * (1.1 - squint * 1.6) * Math.max(0.15, open), ex - w, ey);
      ctx.closePath();
    };
    P.shape(white, "#fbfaf7", { flat: true, ink: 0.3 });
    ctx.save();
    white();
    ctx.clip();
    const ix = ex + s.eye.x * 0.55, iy = ey - 0.15 + s.eye.y * 0.35;
    ctx.fillStyle = C.eyes;
    ctx.beginPath(); ctx.arc(ix, iy, 1.12, 0, TAU); ctx.fill();
    ctx.fillStyle = "#0b0810";
    ctx.beginPath(); ctx.arc(ix, iy, 0.56, 0, TAU); ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(ix - 0.36, iy - 0.4, 0.3, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(ix + 0.35, iy + 0.3, 0.12, 0, TAU); ctx.fill();
    ctx.restore();
    // Upper lid line (and lashes).
    P.line(() => {
      ctx.beginPath();
      ctx.moveTo(ex - w - 0.15, ey + 0.05);
      ctx.quadraticCurveTo(ex, ey - h * 1.62 * open, ex + w + 0.15, ey - 0.2);
    }, "#1a1220", male ? 0.42 : 0.58);
    if (!male) P.line(() => { ctx.beginPath(); ctx.moveTo(ex + side * w, ey - 0.2); ctx.lineTo(ex + side * (w + 0.55), ey - 0.8); }, "#1a1220", 0.35);
  }

  // Brows: up when surprised or asking, in when concerned; one cocked when thinking.
  for (const side of [-1, 1]) {
    const raise = s.brow * 1.1 + (side === 1 ? s.browR * 0.9 : 0);
    const inner = s.brow * 0.3 - Math.max(0, -s.smile) * 0.6;
    const bx = side * 3.4 + turn;
    P.line(() => {
      ctx.beginPath();
      ctx.moveTo(bx - side * 1.9, -3.1 - raise - inner);
      ctx.quadraticCurveTo(bx, -3.9 - raise, bx + side * 2.0, -3.2 - raise * 0.8);
    }, tone(C.hair[1], -0.1), male ? 0.95 : 0.6);
  }

  // Nose.
  P.line(() => {
    ctx.beginPath();
    ctx.moveTo(turn * 1.25 + 0.2, 0.8);
    ctx.quadraticCurveTo(turn * 1.35 + 1.1, 3.4, turn * 1.3 + 0.1, 3.7);
  }, tone(skin, -0.32), 0.45);
  ctx.fillStyle = tone(skin, -0.28);
  ctx.beginPath(); ctx.ellipse(turn * 1.3 - 0.75, 3.8, 0.42, 0.25, 0, 0, TAU); ctx.ellipse(turn * 1.3 + 0.95, 3.8, 0.42, 0.25, 0, 0, TAU); ctx.fill();
  if (has("moustache")) P.shape(() => { ctx.beginPath(); ctx.ellipse(turn * 1.4 - 1.3, 5.0, 1.7, 0.6, -0.15, 0, TAU); ctx.ellipse(turn * 1.4 + 1.3, 5.0, 1.7, 0.6, 0.15, 0, TAU); }, tone(hairCol, 0.05), { flat: true });

  mouth(ctx, P, s, turn * 1.4, 6.0 + jaw * 0.35, male, skin);

  // Hair on top, glasses and hats.
  hairFront(ctx, P, hairStyle, hairCol, hairAcc, t, s, male);
  if (has("glasses") || has("shades") || has("visor")) {
    if (has("visor")) {
      ctx.fillStyle = "rgba(56,189,248,0.55)";
      ctx.beginPath(); ctx.roundRect(-6.6 + turn, -2.2, 13.2, 3.4, 1.6); ctx.fill();
      P.line(() => { ctx.beginPath(); ctx.roundRect(-6.6 + turn, -2.2, 13.2, 3.4, 1.6); }, "#7dd3fc", 0.35);
    } else {
      for (const side of [-1, 1]) {
        if (has("shades")) { ctx.fillStyle = "#111111"; ctx.beginPath(); ctx.roundRect(side * 3.35 + turn - 2.2, -1.8, 4.4, 2.8, 1.1); ctx.fill(); }
        else P.line(() => { ctx.beginPath(); ctx.arc(side * 3.35 + turn, -0.4, 2.1, 0, TAU); }, "#2a2135", 0.38);
      }
      P.line(() => { ctx.beginPath(); ctx.moveTo(-1.2 + turn, -0.6); ctx.lineTo(1.2 + turn, -0.6); }, "#2a2135", 0.35);
    }
  }
  if (has("eyepatch")) {
    P.shape(() => { ctx.beginPath(); ctx.ellipse(3.35 + turn, -0.4, 2.1, 1.7, 0, 0, TAU); }, "#111111", { flat: true });
    P.line(() => { ctx.beginPath(); ctx.moveTo(-7.5, -4.5); ctx.lineTo(7.8, 1.2); }, "#111111", 0.4);
  }
  if (has("bandana")) P.shape(() => { ctx.beginPath(); ctx.moveTo(-8.6, -4); ctx.bezierCurveTo(-8.6, -12.6, 8.6, -12.6, 8.6, -4); ctx.lineTo(-8.6, -4); ctx.closePath(); }, "#b91c1c");
  if (has("beret")) P.shape(() => { ctx.beginPath(); ctx.ellipse(-1.5, -9.4, 8.2, 2.8, -0.15, 0, TAU); }, "#111111");
  if (has("headband")) P.shape(() => { ctx.beginPath(); ctx.roundRect(-8.3, -6.4, 16.6, 1.8, 0.8); }, "#ffffff");
  if (has("headphones")) P.shape(() => { ctx.beginPath(); ctx.roundRect(-9.3, -1.5, 2.4, 4.2, 1); ctx.roundRect(6.9, -1.5, 2.4, 4.2, 1); }, "#1f2937");
  ctx.restore();
}

/** The mouth: real shapes (ah, ee, oh, oo, m, f, l), corners up with a smile. */
function mouth(ctx, P, s, x, y, male, skin) {
  const m = s.mouth;
  const sm = s.smile;
  const w = (male ? 2.3 : 2.1) * (0.55 + m.w * 0.75) * (1 - m.r * 0.2);
  const open = m.o * 2.6;
  const lift = sm * 0.85;
  const lipCol = male ? tone(skin, -0.25) : "#b34a5c";
  if (open < 0.18) {
    // Closed: a line that curves with the mood; pressed for m/b/p.
    P.line(() => {
      ctx.beginPath();
      ctx.moveTo(x - w, y - lift * 0.6);
      ctx.quadraticCurveTo(x, y + lift * 0.9 + m.p * 0.2, x + w, y - lift * 0.6);
    }, tone(skin, -0.5), 0.5 + m.p * 0.25);
    if (!male) P.line(() => { ctx.beginPath(); ctx.moveTo(x - w * 0.7, y + 0.55); ctx.quadraticCurveTo(x, y + 1.1, x + w * 0.7, y + 0.55); }, css(hex(lipCol), 0.6), 0.5);
    return;
  }
  const top = y - open * 0.28 - lift * 0.2;
  const bot = y + open * 0.72;
  const shape = () => {
    ctx.beginPath();
    ctx.moveTo(x - w, y - lift * 0.5);
    ctx.bezierCurveTo(x - w * 0.6, top - m.r * 0.3, x + w * 0.6, top - m.r * 0.3, x + w, y - lift * 0.5);
    ctx.bezierCurveTo(x + w * (0.9 - m.r * 0.3), bot, x - w * (0.9 - m.r * 0.3), bot, x - w, y - lift * 0.5);
    ctx.closePath();
  };
  P.shape(shape, "#3a0f1a", { flat: true, ink: 0.4 });
  ctx.save();
  shape();
  ctx.clip();
  // Top teeth, the tongue, and for f/v the lower lip tucked under the teeth.
  if (m.t > 0.1) {
    ctx.fillStyle = "#fbfaf5";
    ctx.beginPath();
    ctx.roundRect(x - w * 0.8, top - 0.3, w * 1.6, 0.55 + m.t * 0.5, 0.25);
    ctx.fill();
  }
  ctx.fillStyle = "#c2445a";
  ctx.beginPath();
  ctx.ellipse(x, bot - 0.1 - m.tongue * 0.6, w * 0.6, 0.55 + m.tongue * 0.5, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
  if (m.f > 0.3) P.line(() => { ctx.beginPath(); ctx.moveTo(x - w * 0.8, top + 0.6); ctx.quadraticCurveTo(x, top + 1.1, x + w * 0.8, top + 0.6); }, lipCol, 0.7);
  if (!male) P.line(() => { ctx.beginPath(); ctx.moveTo(x - w * 0.8, bot + 0.2); ctx.quadraticCurveTo(x, bot + 0.75, x + w * 0.8, bot + 0.2); }, css(hex(lipCol), 0.85), 0.6);
}

// ------------------------------------------------------------------ hair

function hairBack(ctx, P, style, col, acc, t, s) {
  const swing = Math.sin(t * 1.3) * 0.25 + s.head.roll * 2 - s.sway * 0.3;
  if (style === "long" || style === "braid") {
    P.shape(() => {
      ctx.beginPath();
      ctx.moveTo(-9.6, -3);
      ctx.bezierCurveTo(-10.6, 8, -10.2 + swing, 15, -8.4 + swing, 19);
      ctx.lineTo(8.4 + swing, 19);
      ctx.bezierCurveTo(10.2 + swing, 15, 10.6, 8, 9.6, -3);
      ctx.closePath();
    }, col);
  } else if (style === "bob") {
    P.shape(() => { ctx.beginPath(); ctx.moveTo(-9.6, -3); ctx.quadraticCurveTo(-10.4, 7, -8 + swing * 0.4, 9.4); ctx.lineTo(8 + swing * 0.4, 9.4); ctx.quadraticCurveTo(10.4, 7, 9.6, -3); ctx.closePath(); }, col);
  } else if (style === "braids" || style === "locs") {
    // Many ropes hanging down the back and over the shoulders.
    const n = style === "locs" ? 14 : 18;
    const len = style === "locs" ? 18 : 22;
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1);
      const x0 = -8.6 + u * 17.2;
      const sway = swing * (0.6 + u * 0.4) + Math.sin(t * 1.7 + i) * 0.15;
      P.shape(() => { capsule(ctx, [x0, -4], [x0 * 1.08 + sway, len - Math.abs(u - 0.5) * 6], style === "locs" ? 1.05 : 0.8, style === "locs" ? 0.95 : 0.6); }, i % 3 === 0 && acc ? tone(col, 0.12) : col, { ink: 0.3 });
    }
    if (acc) for (let i = 0; i < n; i += 3) {
      const u = i / (n - 1), x0 = -8.6 + u * 17.2;
      ctx.fillStyle = acc;
      ctx.beginPath(); ctx.arc(x0 * 1.08 + swing, len - Math.abs(u - 0.5) * 6 - 1, 0.55, 0, TAU); ctx.fill();
    }
  } else if (style === "afro") {
    P.shape(() => {
      ctx.beginPath();
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * TAU;
        ctx.moveTo(Math.cos(a) * 11.5 + 2.6, -4 + Math.sin(a) * 10.5);
        ctx.arc(Math.cos(a) * 11.5, -4 + Math.sin(a) * 10.5, 2.6, 0, TAU);
      }
      ctx.moveTo(12.5, -4);
      ctx.ellipse(0, -4, 12.5, 11.6, 0, 0, TAU);
    }, col);
  } else if (style === "puffs") {
    for (const side of [-1, 1]) P.shape(() => { ctx.beginPath(); ctx.arc(side * 8.2, -9.6, 5.2 + Math.sin(t * 2 + side) * 0.12, 0, TAU); }, col);
  } else if (style === "ponytail") {
    P.shape(() => { capsule(ctx, [5, -8], [9.4 + swing * 2.5, 9 + Math.abs(swing)], 2.6, 1.4); }, col);
  } else if (style === "bun") {
    P.shape(() => { ctx.beginPath(); ctx.arc(0, -11.2, 3.6, 0, TAU); }, col);
  }
}

function hairFront(ctx, P, style, col, acc, t, s, male) {
  const cap = (top, side = -2.5) => () => {
    ctx.beginPath();
    ctx.moveTo(-8.4, side);
    ctx.bezierCurveTo(-8.8, -11.4 - top, 8.8, -11.4 - top, 8.4, side);
    ctx.bezierCurveTo(7.6, -5.4, 4, -6.6, 0, -6.4);
    ctx.bezierCurveTo(-4, -6.6, -7.6, -5.4, -8.4, side);
    ctx.closePath();
  };
  switch (style) {
    case "bald":
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.beginPath(); ctx.ellipse(-2.4, -7.6, 2.2, 1.1, -0.4, 0, TAU); ctx.fill();
      return;
    case "buzz":
      P.shape(cap(-0.6, -3.6), css(hex(col), 0.88), { flat: true, noInk: true });
      return;
    case "fade":
    case "waves": {
      P.shape(cap(0.6, -3.4), col, { flat: true });
      if (style === "waves") {
        ctx.save();
        cap(0.6, -3.4)();
        ctx.clip();
        for (let i = 0; i < 5; i++) P.line(() => { ctx.beginPath(); ctx.arc(0, 2 + i * 1.6, 13 - i * 0.5, -2.3, -0.85); }, tone(col, 0.16), 0.22);
        ctx.restore();
      }
      // The line-up at the forehead.
      P.line(() => { ctx.beginPath(); ctx.moveTo(-6.2, -6.2); ctx.quadraticCurveTo(0, -7.4, 6.2, -6.2); }, tone(col, 0.1), 0.35);
      return;
    }
    case "afro":
    case "puffs":
      P.shape(cap(0.8, -3), col, { flat: true });
      if (style === "puffs") P.line(() => { ctx.beginPath(); ctx.moveTo(0, -10.2); ctx.lineTo(0, -6.8); }, tone(col, 0.25), 0.3);
      return;
    case "locs":
    case "braids":
      P.shape(cap(0.6, -3), col, { flat: true });
      ctx.save();
      cap(0.6, -3)();
      ctx.clip();
      for (let i = -3; i <= 3; i++) P.line(() => { ctx.beginPath(); ctx.moveTo(i * 1.6, -11.5); ctx.quadraticCurveTo(i * 2.3, -8.5, i * 2.8, -6.2); }, tone(col, 0.2), 0.3);
      ctx.restore();
      return;
    case "messy":
      P.shape(() => {
        ctx.beginPath();
        ctx.moveTo(-8.8, -1.5);
        ctx.bezierCurveTo(-10, -13, 9, -14, 8.8, -1.5);
        ctx.lineTo(7, -5.4); ctx.lineTo(5, -4.2); ctx.lineTo(3.6, -6.6); ctx.lineTo(1, -4.8); ctx.lineTo(-1.4, -6.8); ctx.lineTo(-3.4, -4.6); ctx.lineTo(-5.6, -6.2); ctx.lineTo(-7.2, -4);
        ctx.closePath();
      }, col);
      return;
    case "quiff":
    case "slick":
    case "side": {
      const up = style === "quiff" ? 2.2 : 0.6;
      P.shape(() => {
        ctx.beginPath();
        ctx.moveTo(-8.6, -2.4);
        ctx.bezierCurveTo(-9.6, -12.4 - up, 7.6, -14 - up * 1.3, 8.6, -2.4);
        ctx.bezierCurveTo(7.8, -6.4, 2, -8.6, -3, -6.4);
        ctx.bezierCurveTo(-5.4, -5.6, -7.6, -4.6, -8.6, -2.4);
        ctx.closePath();
      }, col);
      P.line(() => { ctx.beginPath(); ctx.moveTo(-3.2, -9.4 - up * 0.8); ctx.quadraticCurveTo(1, -10.4 - up, 5.8, -6.6); }, tone(col, 0.25), 0.35);
      return;
    }
    case "bob":
    case "long":
    case "braid":
      P.shape(() => {
        ctx.beginPath();
        ctx.moveTo(-9.4, 2);
        ctx.bezierCurveTo(-10, -12.6, 10, -12.6, 9.4, 2);
        ctx.lineTo(8.4, 1.6);
        ctx.bezierCurveTo(8.6, -5, 4.6, -6.6, 1, -6.8);
        ctx.quadraticCurveTo(-3.4, -5.6, -6.6, -3.6);
        ctx.bezierCurveTo(-8, -2, -8.4, 0, -8.4, 1.6);
        ctx.closePath();
      }, col);
      if (acc) P.line(() => { ctx.beginPath(); ctx.moveTo(-6.4, -3.6); ctx.quadraticCurveTo(-4.6, -7.4, -0.6, -7.8); }, acc, 0.7);
      if (style === "braid") for (let i = 0; i < 6; i++) P.shape(() => { ctx.beginPath(); ctx.ellipse(8.2, 6 + i * 2.3, 1.4, 1.2, 0, 0, TAU); }, col);
      return;
    case "ponytail":
    case "bun":
      P.shape(cap(0.4, -2.8), col, { flat: false });
      P.line(() => { ctx.beginPath(); ctx.moveTo(-1, -10.6); ctx.quadraticCurveTo(-3.6, -8.6, -6.6, -6.2); }, tone(col, 0.22), 0.35);
      return;
    case "pixie":
      P.shape(() => {
        ctx.beginPath();
        ctx.moveTo(-8.6, -1);
        ctx.bezierCurveTo(-9.8, -13, 9.4, -13.4, 8.6, -2.4);
        ctx.lineTo(6.4, -5.2); ctx.quadraticCurveTo(0, -4.2, -6.4, -6.4); ctx.lineTo(-7.6, -2.6);
        ctx.closePath();
      }, col);
      return;
    case "curly":
      P.shape(() => {
        ctx.beginPath();
        for (let i = 0; i < 13; i++) {
          const a = Math.PI + (i / 12) * Math.PI;
          const x = Math.cos(a) * 9.6, y = -3.6 + Math.sin(a) * 9.6;
          ctx.moveTo(x + 2.4, y);
          ctx.arc(x, y, 2.4, 0, TAU);
        }
      }, col);
      for (const side of [-1, 1]) for (let i = 0; i < 4; i++) P.shape(() => { ctx.beginPath(); ctx.arc(side * (9.4 + (i % 2) * 0.8), -1 + i * 3.2, 2.1, 0, TAU); }, col);
      return;
    default:
      P.shape(cap(0.4), col, { flat: true });
  }
}

// ------------------------------------------------------------------ framing and the frame

/** What part of the figure to show: [top y, bottom y] in figure units (feet at 0). */
const FRAMES = { full: [-106, 3], half: [-104, -40], bust: [-102, -62], head: [-100, -74] };

/**
 * One frame. opts: { persona, render ("flat"|"comic"), framing, orb (bool),
 * time, energy, thinking, mood, look, poke, say: { text }, accent }.
 * Always true (no WebGL needed).
 */
export function drawToon(ctx, size, opts = {}) {
  const C = characterFor(opts.persona);
  const render = opts.render === "comic" ? "comic" : "flat";
  const framing = FRAMES[opts.framing] ? opts.framing : "half";
  const orb = opts.orb !== false;
  const time = opts.time || 0;
  // Comic: posed "on twos" (12 a second), like the films.
  const t = render === "comic" ? Math.floor(time * 12) / 12 : time;
  let s = states.get(ctx.canvas);
  if (!s || s.who !== opts.persona) { s = newState(t); s.who = opts.persona; states.set(ctx.canvas, s); }
  const dt = clamp(t - s.last, 0, 0.1);
  if (dt > 0 || render !== "comic") { animate(s, opts, dt || 1 / 30, t); s.last = t; }

  const accent = opts.accent || C.top[2] || "#8b5cf6";
  const c = size / 2, R = size * 0.46;
  const e = clamp(opts.energy || 0, 0, 1);
  ctx.save();
  if (orb) {
    // The stage: a disc behind the character.
    const g = ctx.createRadialGradient(c, c * 0.85, R * 0.1, c, c, R);
    if (render === "comic") {
      g.addColorStop(0, tone(accent, 0.55));
      g.addColorStop(1, tone(accent, -0.35));
    } else {
      g.addColorStop(0, tone(accent, 0.35));
      g.addColorStop(1, tone(accent, -0.45));
    }
    ctx.beginPath();
    ctx.arc(c, c, R, 0, TAU);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.clip();
    if (render === "comic") comicBackdrop(ctx, size, accent, t, e, s);
    else flatBackdrop(ctx, size, accent, t, e);
  }

  // Into figure units.
  const [top, bottom] = FRAMES[framing];
  const span = bottom - top;
  const unit = (size * (orb ? 0.9 : 0.98)) / span;
  const draw = (target) => {
    target.save();
    target.translate(c, size * (orb ? 0.06 : 0.01) - top * unit);
    target.scale(unit, unit);
    const P = painter(target, render, unit);
    const at = { headX: s.sway * 0.02 * 34 + Math.sin(t * 0.7) * 0.15 };
    hairBehind(target, C, s, P, t, at);
    Object.assign(at, figure(target, C, s, P, t));
    head(target, C, s, P, t, at);
    target.restore();
  };
  if (render === "comic") {
    // Print offset: cyan and magenta ghosts of the ink a hair out of register.
    const off = getScratch(ctx.canvas, "toon", ctx.canvas.width, ctx.canvas.height);
    const o = off.getContext("2d");
    o.setTransform(ctx.getTransform());
    o.clearRect(0, 0, size, size);
    draw(o);
    const tint = getScratch(ctx.canvas, "tint", ctx.canvas.width, ctx.canvas.height);
    const tc = tint.getContext("2d");
    const px = Math.max(1, unit * 0.35);
    for (const [col, dx] of [["rgba(0,200,255,0.55)", -px], ["rgba(255,40,160,0.5)", px]]) {
      tc.setTransform(1, 0, 0, 1, 0, 0);
      tc.globalCompositeOperation = "copy";
      tc.drawImage(off, 0, 0);
      tc.globalCompositeOperation = "source-in";
      tc.fillStyle = col;
      tc.fillRect(0, 0, tint.width, tint.height);
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 0.5;
      ctx.drawImage(tint, dx, 0);
      ctx.restore();
    }
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(off, 0, 0);
    ctx.restore();
  } else {
    // A soft contact shadow, then the figure.
    if (framing === "full") {
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.beginPath();
      ctx.ellipse(c, size * (orb ? 0.06 : 0.01) - top * unit, 14 * unit, 2.6 * unit, 0, 0, TAU);
      ctx.fill();
    }
    draw(ctx);
  }
  ctx.restore();
  if (orb) {
    ctx.beginPath();
    ctx.arc(c, c, R, 0, TAU);
    ctx.strokeStyle = render === "comic" ? "#15101f" : css(hex(accent), 0.5 + e * 0.4);
    ctx.lineWidth = render === "comic" ? Math.max(2, size * 0.012) : 1.4 + e * 2;
    ctx.stroke();
  }
  return true;
}

const scratch = new WeakMap();
function getScratch(canvas, key, w, h) {
  let m = scratch.get(canvas);
  if (!m) { m = {}; scratch.set(canvas, m); }
  let c = m[key];
  if (!c) { c = document.createElement("canvas"); m[key] = c; }
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  return c;
}

function flatBackdrop(ctx, size, accent, t, e) {
  // Big soft shapes drifting behind, motion-design style.
  ctx.save();
  ctx.globalAlpha = 0.18 + e * 0.12;
  ctx.fillStyle = tone(accent, 0.5);
  ctx.beginPath();
  ctx.arc(size * (0.25 + 0.04 * Math.sin(t * 0.4)), size * 0.3, size * 0.16, 0, TAU);
  ctx.fill();
  ctx.fillStyle = tone(accent, -0.2);
  ctx.beginPath();
  ctx.arc(size * (0.78 + 0.03 * Math.cos(t * 0.5)), size * 0.72, size * 0.22, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function comicBackdrop(ctx, size, accent, t, e, s) {
  // Halftone dots fading across, and action lines on a big moment.
  ctx.save();
  const step = Math.max(5, size / 46);
  ctx.fillStyle = tone(accent, -0.5);
  for (let y = 0; y < size; y += step) {
    for (let x = (y / step) % 2 ? step / 2 : 0; x < size; x += step) {
      const r = step * 0.42 * clamp((x + y) / (size * 1.6), 0, 1);
      if (r < 0.4) continue;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
    }
  }
  if (s.jump > 0 || s.pose === "cheer" || s.pose === "pump" || e > 0.65) {
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = Math.max(1, size / 220);
    const c = size / 2;
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * TAU + t;
      ctx.beginPath();
      ctx.moveTo(c + Math.cos(a) * size * 0.3, c + Math.sin(a) * size * 0.3);
      ctx.lineTo(c + Math.cos(a) * size * 0.5, c + Math.sin(a) * size * 0.5);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** A still of a character (for its card), as a data URL. */
export function toonThumb(persona, render = "flat", px = 220, framing = "bust") {
  const c = document.createElement("canvas");
  c.width = c.height = px;
  const ctx = c.getContext("2d");
  drawToon(ctx, px, { persona, render, framing, orb: true, time: 1.2, energy: 0, mood: 0.45 });
  return c.toDataURL("image/png");
}
