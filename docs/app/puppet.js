// Puppet: a painted character that moves like a person.
//
// Each painted character carries a skeleton found in its picture
// (.work/autorig.py → painted/<id>-concept/skin.json): hips, chest, head,
// arms and legs, with the picture meshed and every mesh point tied to the
// bones it should follow. Here the bones are posed and the picture bends
// with them, on the graphics chip: the body first (body.webp, painted in
// behind the arms), then each arm on top.
//
// An "actor" decides the pose from what Izuki is doing: it breathes and
// shifts its weight while it waits, waves hello, tilts its head to listen,
// puts a hand to its chin to think, types on a tiny laptop while it works,
// talks with its hands (and mouth) while it answers, walks when it's moved,
// and throws its arms up when something's done. Every joint eases toward
// where it's going (a spring), so nothing snaps.
//
//   const p = await loadPuppet("nova")           // null if it has no skeleton
//   const a = createActor()
//   stepActor(a, dt, { mode: "speaking", energy: 0.6, walk: 0 })
//   drawPuppet(ctx, p, a, { x, y, height, facing, time })

import { PUPPET_ART } from "./puppet-art.js";

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// ---------------------------------------------------------------- loading

const loads = new Map();

/** A character's skeleton, mesh and pictures (cached), or null without a skeleton. */
export function loadPuppet(id) {
  if (!loads.has(id)) {
    const art = PUPPET_ART[id];
    const img = (src) => new Promise((ok, fail) => { const im = new Image(); im.decoding = "async"; im.onload = () => ok(im); im.onerror = () => fail(new Error("picture didn't load")); im.src = src; });
    loads.set(id, !art ? Promise.resolve(null) : Promise.all([
      fetch(art.skin).then((r) => (r.ok ? r.json() : Promise.reject(new Error("no skeleton")))),
      fetch(art.rig).then((r) => (r.ok ? r.json() : Promise.reject(new Error("no rig")))),
      img(art.base), img(art.body), img(art.mouth), img(art.eyes),
    ]).then(([skin, rig, base, body, mouth, eyes]) => prepare(id, skin, rig, { base, body, mouth, eyes })).catch((e) => { console.warn("[puppet] " + id + " could not load:", e?.message || e); loads.delete(id); return null; }));
  }
  return loads.get(id);
}

function prepare(id, skin, rig, pics) {
  const bones = skin.bones.map((b) => {
    const p = skin.joints[b.from], q = skin.joints[b.to];
    return { ...b, pivot: p, angle: Math.atan2(q[1] - p[1], q[0] - p[0]), len: Math.hypot(q[0] - p[0], q[1] - p[1]) };
  });
  const index = Object.fromEntries(bones.map((b, i) => [b.name, i]));
  for (const b of bones) b.parentIndex = b.parent ? index[b.parent] : -1;
  const n = skin.points.length;
  const rest = new Float32Array(n * 2);
  skin.points.forEach((p, i) => { rest[i * 2] = p[0]; rest[i * 2 + 1] = p[1]; });
  const uv = new Float32Array(n * 2);
  skin.points.forEach((p, i) => { uv[i * 2] = p[0] / skin.size[0]; uv[i * 2 + 1] = p[1] / skin.size[1]; });
  // Up to 3 bones per point, flattened.
  const wb = new Int16Array(n * 3).fill(-1), ww = new Float32Array(n * 3);
  // (Rounded and trimmed in the file: brought back to a total of 1, or the
  // picture would shrink a little toward the origin.)
  skin.weights.forEach((list, i) => {
    const top = list.slice(0, 3);
    const total = top.reduce((s, [, w]) => s + w, 0);
    top.forEach(([b, w], k) => { wb[i * 3 + k] = b; ww[i * 3 + k] = total > 0 ? w / total : k === 0 ? 1 : 0; });
  });
  const byLayer = [[], [], []];
  skin.tris.forEach((t, i) => byLayer[skin.layers[i] || 0].push(...t));
  const ys = skin.points.map((p) => p[1]);
  return {
    id, skin, rig, pics, bones, index, rest, uv, wb, ww,
    layers: byLayer.map((l) => new Uint16Array(l)),
    top: Math.min(...ys), bottom: Math.max(...ys),
    width: skin.size[0], height: skin.size[1],
    feet: rig.feet || [(skin.joints.ankleL[0] + skin.joints.ankleR[0]) / 2, Math.max(...ys)],
  };
}

// ---------------------------------------------------------------- bones

// 2D affine [a, b, c, d, e, f]: x' = a x + c y + e, y' = b x + d y + f.
const mul = (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
const rot = (a) => [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0];
const move = (x, y) => [1, 0, 0, 1, x, y];
/** Stretch (or shorten) along one direction only. */
const along = (angle, s) => mul(rot(angle), mul([s, 0, 0, 1, 0, 0], rot(-angle)));

/** Every bone's transform for a pose: { rot: {name: rad}, len: {name: scale}, root: [x, y] }. */
function solve(P, pose) {
  const out = new Array(P.bones.length);
  const root = move(pose.root?.[0] || 0, pose.root?.[1] || 0);
  P.bones.forEach((b, i) => {
    const [px, py] = b.pivot;
    let local = mul(move(px, py), mul(rot(pose.rot[b.name] || 0), mul(along(b.angle, pose.len[b.name] ?? 1), move(-px, -py))));
    out[i] = mul(b.parentIndex >= 0 ? out[b.parentIndex] : root, local);
  });
  return out;
}

/** The mesh's points, bent by the bones. */
function skinPoints(P, M, into) {
  const { rest, wb, ww } = P;
  for (let i = 0, n = rest.length / 2; i < n; i++) {
    const x = rest[i * 2], y = rest[i * 2 + 1];
    let X = 0, Y = 0;
    for (let k = 0; k < 3; k++) {
      const b = wb[i * 3 + k];
      if (b < 0) break;
      const m = M[b], w = ww[i * 3 + k];
      X += w * (m[0] * x + m[2] * y + m[4]);
      Y += w * (m[1] * x + m[3] * y + m[5]);
    }
    into[i * 2] = X;
    into[i * 2 + 1] = Y;
  }
  return into;
}

// ---------------------------------------------------------------- acting

// L is the picture's left arm (the character's right). Raising an arm out to
// its side turns it away from the body: + on the left, − on the right.
const OUT = { L: 1, R: -1 };

/** Arm targets: `up` lifts the arm out/up from the side (rad), `bend` folds the forearm in toward the body. */
function arm(t, side, up, bend, len = 1) {
  t.rot["upperArm" + side] = OUT[side] * up;
  t.rot["lowerArm" + side] = -OUT[side] * bend;
  t.len["lowerArm" + side] = len;
}

const GESTURES = {
  // Both palms open, explaining.
  open: (t, k) => { arm(t, "L", 0.32, 1.25 + 0.1 * k); arm(t, "R", 0.32, 1.25 + 0.1 * k); },
  // One hand making the point, the other relaxed.
  left: (t, k) => { arm(t, "L", 0.25, 1.45 + 0.25 * k); arm(t, "R", 0.06, 0.12); },
  right: (t, k) => { arm(t, "R", 0.25, 1.45 + 0.25 * k); arm(t, "L", 0.06, 0.12); },
  // A hand on the chest ("I think…", "for me…").
  chest: (t) => { arm(t, "R", -0.05, 2.35, 0.9); arm(t, "L", 0.06, 0.15); },
  // Shrug.
  shrug: (t) => { arm(t, "L", 0.45, 1.0); arm(t, "R", 0.45, 1.0); t.len.chest = 1.025; t.rot.head = 0.07; },
  // Counting it out / emphasis up high.
  high: (t, k) => { arm(t, "L", 0.9 + 0.1 * k, 1.2); arm(t, "R", 0.08, 0.2); },
  // Both hands forward, "here's the thing".
  present: (t, k) => { arm(t, "L", 0.55, 0.9 + 0.2 * k); arm(t, "R", 0.55, 0.9 + 0.2 * k); },
};
const GESTURE_NAMES = Object.keys(GESTURES);

/**
 * Things a person does by themselves — each a few seconds long, done now
 * and then while it waits. `prop` is something held (drawn in the hand).
 */
const ACTS = {
  stretch: { secs: 2.6, pose: (T, k) => { const up = Math.sin(Math.min(1, k * 1.6) * Math.PI); arm(T, "L", 2.6 * up, -0.1); arm(T, "R", 2.6 * up, -0.1); T.len.chest = 1 + 0.03 * up; T.rot.head = -0.06 * up; }, yawn: true },
  lookAround: { secs: 3.2, pose: (T, k) => { T.rot.head = 0.12 * Math.sin(k * Math.PI * 2); T.rot.chest += 0.03 * Math.sin(k * Math.PI * 2); } },
  phone: { secs: 4.5, prop: "phone", pose: (T, k) => { arm(T, "R", -0.12, 2.2, 0.85); T.rot.head = 0.08; arm(T, "L", 0.05, 0.15); }, thumbs: true },
  coffee: { secs: 3.4, prop: "mug", pose: (T, k) => { const sip = k > 0.35 && k < 0.7 ? 1 : 0; arm(T, "R", -0.2 + 0.1 * sip, 2.1 + 0.55 * sip, 0.88); T.rot.head = -0.04 * sip; } },
  tapFoot: { secs: 2.4, pose: (T, k, t) => { T.len.shinR = 1 - 0.035 * Math.max(0, Math.sin(t * 14)); arm(T, "L", 0.3, 2.0, 0.9); arm(T, "R", 0.3, 2.0, 0.9); } },
  scratchHead: { secs: 2.2, pose: (T, k, t) => { arm(T, "R", 2.0, 1.6 + 0.12 * Math.sin(t * 16)); T.rot.head = 0.07; } },
  hipsHands: { secs: 3, pose: (T) => { arm(T, "L", 0.55, 2.3, 0.8); arm(T, "R", 0.55, 2.3, 0.8); T.rot.head = -0.05; } },
  rollShoulders: { secs: 1.8, pose: (T, k) => { T.len.chest = 1 + 0.03 * Math.sin(k * Math.PI * 2); T.rot.chest += 0.03 * Math.sin(k * Math.PI * 4); } },
  checkWatch: { secs: 2.4, prop: "watch", pose: (T) => { arm(T, "L", -0.1, 1.75, 0.9); T.rot.head = 0.07; } },
};
const IDLE_ACTS = ["stretch", "lookAround", "phone", "coffee", "tapFoot", "scratchHead", "hipsHands", "rollShoulders", "checkWatch", "lookAround"];

/** Quick reactions anyone can trigger: actor.react("thumbs"). */
const REACTIONS = {
  wave: { secs: 1.6, pose: (T, k, t) => arm(T, "R", 2.35, -0.35 + 0.45 * Math.sin(t * 11)) },
  bye: { secs: 1.8, pose: (T, k, t) => arm(T, "L", 2.35, -0.35 + 0.45 * Math.sin(t * 11)) },
  cheer: { secs: 1.4, pose: (T, k) => { arm(T, "L", 2.5, -0.2); arm(T, "R", 2.5, -0.2); T.root[1] = -Math.abs(Math.sin(k * Math.PI * 2)) * 18; } },
  shrug: { secs: 1.6, pose: (T) => GESTURES.shrug(T, 0) },
  thumbs: { secs: 1.5, pose: (T) => { arm(T, "R", 0.35, 1.75); T.rot.head = -0.05; } },
  nod: { secs: 1.2, pose: (T, k) => { T.rot.head = 0.07 * Math.sin(k * Math.PI * 4); } },
  shake: { secs: 1.3, pose: (T, k) => { T.rot.head = 0.1 * Math.sin(k * Math.PI * 6); } },
  facepalm: { secs: 1.8, pose: (T) => { arm(T, "R", -0.4, 2.95, 0.95); T.rot.head = 0.12; } },
  clap: { secs: 1.6, pose: (T, k, t) => { const c = 0.25 * Math.max(0, Math.sin(t * 15)); arm(T, "L", 0.25, 1.55 + c, 0.9); arm(T, "R", 0.25, 1.55 + c, 0.9); } },
  laugh: { secs: 1.6, pose: (T, k, t) => { T.len.chest = 1 + 0.02 * Math.abs(Math.sin(t * 12)); T.rot.head = -0.08 + 0.03 * Math.sin(t * 12); arm(T, "R", -0.05, 2.3, 0.9); }, mouth: 0.8 },
  sassy: { secs: 2.2, pose: (T) => { arm(T, "L", 0.55, 2.3, 0.8); arm(T, "R", 0.55, 2.3, 0.8); T.rot.head = -0.1; T.rot.chest += -0.04; } },
};

export function createActor() {
  return {
    t: 0, pose: { rot: {}, len: {}, root: [0, 0] }, vel: { rot: {}, len: {}, root: [0, 0] },
    gesture: null, gestureUntil: 0, nextGesture: 0.6,
    act: null, actAt: 0, nextAct: 5 + Math.random() * 4,
    reaction: null, reactionAt: 0,
    blinkAt: 2, blink: 0, mouth: 0, nod: 0, walkPhase: 0, lastMode: "idle", modeSince: 0, prop: null,
  };
}

/** Trigger a reaction now ("wave", "cheer", "shrug", "thumbs", "nod", "shake", "facepalm", "clap", "laugh", "sassy", "bye"). */
export function react(A, name) {
  if (REACTIONS[name]) { A.reaction = name; A.reactionAt = A.t; }
}

/**
 * One beat: say what's happening, the actor decides how its body moves.
 *   mode    idle | listening | thinking | working | speaking
 *   energy  the voice right now (0..1)
 *   walk    0..1 while it's being moved
 *   music   music is playing (it dances)
 *   look    where the pointer is, -1 (left) … 1 (right)
 *   point   { side: "L"|"R", up: radians } — points at something
 */
export function stepActor(A, dt, input = {}) {
  dt = clamp(dt, 0, 0.1);
  A.t += dt;
  const t = A.t, mode = input.mode || "idle", e = clamp(input.energy || 0, 0, 1);
  if (mode !== A.lastMode) {
    if (mode === "listening" && A.lastMode === "idle" && A.t > 0.2) react(A, "wave"); // hello
    if (mode === "speaking") A.nextGesture = t + 0.25;
    A.act = null;
    A.nextAct = t + 6 + Math.random() * 5;
    A.lastMode = mode;
    A.modeSince = t;
  }
  // Old trigger flags still work.
  if (input.cheer) react(A, "cheer");
  if (input.shrug) react(A, "shrug");
  if (input.wave) react(A, "wave");

  const T = { rot: {}, len: {}, root: [0, 0] };
  A.prop = null;
  let mouthOverride = null;
  // Alive at rest: breathing, a slow weight shift, arms hanging loose.
  const breathe = Math.sin(t * 1.6);
  T.len.chest = 1 + 0.008 * breathe;
  T.rot.chest = 0.012 * Math.sin(t * 0.5);
  T.rot.head = 0.02 * Math.sin(t * 0.37) + 0.01 * Math.sin(t * 1.3);
  arm(T, "L", 0.03 + 0.012 * breathe, 0.08);
  arm(T, "R", 0.03 + 0.012 * breathe, 0.08);
  T.root[0] = 1.5 * Math.sin(t * 0.5);

  if (input.music && (mode === "idle" || mode === "listening")) {
    // Dancing: bounce on the beat, arms loose and swinging.
    const b = t * 2 * Math.PI * 1.9;
    T.root[1] = -Math.abs(Math.sin(b / 2)) * 9;
    T.rot.chest += 0.06 * Math.sin(b / 2);
    T.rot.head += 0.08 * Math.sin(b / 2 + 0.6);
    arm(T, "L", 0.5 + 0.3 * Math.sin(b / 2), 1.2 + 0.4 * Math.sin(b));
    arm(T, "R", 0.5 - 0.3 * Math.sin(b / 2), 1.2 - 0.4 * Math.sin(b));
    T.len.thighL = 1 - 0.06 * Math.max(0, Math.sin(b / 2));
    T.len.thighR = 1 - 0.06 * Math.max(0, -Math.sin(b / 2));
  } else if (mode === "listening") {
    T.rot.head = 0.09 + 0.02 * Math.sin(t * 0.9); // head tilted, all ears
    arm(T, "L", 0.04, 0.12);
    arm(T, "R", 0.04, 0.12);
  } else if (mode === "thinking") {
    // A hand to the chin, the other across the waist.
    arm(T, "R", -0.32, 2.75, 0.92);
    arm(T, "L", -0.05, 1.55, 0.9);
    T.rot.head = -0.07 + 0.015 * Math.sin(t * 0.8);
  } else if (mode === "working") {
    // Holding a tiny laptop at the waist and typing on it.
    const tap = (s) => 0.07 * Math.max(0, Math.sin(t * 17 + s)) * (0.5 + 0.5 * Math.sin(t * 2.3 + s));
    arm(T, "L", 0.1, 1.5 + tap(0), 0.9);
    arm(T, "R", 0.1, 1.5 + tap(1.7), 0.9);
    T.rot.head = 0.05 * Math.sin(t * 0.6) - 0.02;
    A.prop = "laptop";
  } else if (mode === "speaking") {
    // Talking with the hands: a new gesture every second or two, held while
    // the words come, back to rest between thoughts.
    if (t > A.nextGesture) {
      A.gesture = Math.random() < 0.18 ? null : GESTURE_NAMES[Math.floor(Math.random() * GESTURE_NAMES.length)];
      A.gestureUntil = t + 1.1 + Math.random() * 1.4;
      A.nextGesture = A.gestureUntil + 0.2 + Math.random() * 0.6;
    }
    if (A.gesture && t < A.gestureUntil) GESTURES[A.gesture](T, e);
    A.nod += (e - A.nod) * Math.min(1, dt * 8);
    T.rot.head = (T.rot.head || 0) + 0.04 * Math.sin(t * 5.3) * A.nod;
    T.rot.chest += 0.02 * Math.sin(t * 2.1) * e;
  }

  // Waiting with nothing to do: something of its own now and then.
  if ((mode === "idle" || (mode === "listening" && t - A.modeSince > 6)) && !input.music && !(input.walk > 0.05)) {
    if (!A.act && t > A.nextAct) {
      A.act = IDLE_ACTS[Math.floor(Math.random() * IDLE_ACTS.length)];
      A.actAt = t;
    }
    if (A.act) {
      const act = ACTS[A.act], k = (t - A.actAt) / act.secs;
      if (k >= 1) {
        A.act = null;
        A.nextAct = t + 5 + Math.random() * 7;
      } else {
        act.pose(T, k, t);
        if (act.prop) A.prop = act.prop;
        if (act.yawn && k > 0.25 && k < 0.7) mouthOverride = 0.85;
      }
    }
  } else if (A.act) {
    A.act = null;
  }

  // Following the pointer with its head (and a little with its body).
  if (typeof input.look === "number") {
    const l = clamp(input.look, -1, 1);
    T.rot.head = (T.rot.head || 0) - 0.06 * l;
    T.rot.chest += -0.015 * l;
  }

  // Pointing at something: the arm straight out toward it.
  if (input.point) {
    arm(T, input.point.side, clamp(input.point.up, 0.2, 2.7), 0.05);
    T.rot.head = (T.rot.head || 0) + (input.point.side === "L" ? 0.05 : -0.05);
  }

  if (A.reaction) {
    const r = REACTIONS[A.reaction], k = (t - A.reactionAt) / r.secs;
    if (k >= 1) A.reaction = null;
    else {
      r.pose(T, k, t);
      if (r.mouth) mouthOverride = r.mouth * (0.6 + 0.4 * Math.abs(Math.sin(t * 12)));
    }
  }

  // Walking: knees lift in turn, the body bobs, the arms swing.
  const walk = clamp(input.walk || 0, 0, 1);
  if (walk > 0.01) {
    A.walkPhase += dt * (6 + 3 * walk);
    const ph = A.walkPhase;
    const lift = (s) => Math.max(0, Math.sin(ph + s));
    T.len.thighL = 1 - 0.22 * lift(0) * walk;
    T.len.thighR = 1 - 0.22 * lift(Math.PI) * walk;
    T.rot.shinL = 0.08 * lift(0) * walk;
    T.rot.shinR = -0.08 * lift(Math.PI) * walk;
    T.root[1] += -Math.abs(Math.cos(ph)) * 7 * walk;
    if (mode !== "working" && !A.reaction && !input.point) {
      T.rot.upperArmL = (T.rot.upperArmL || 0) + 0.14 * Math.sin(ph) * walk;
      T.rot.upperArmR = (T.rot.upperArmR || 0) + 0.14 * Math.sin(ph) * walk;
    }
    T.rot.chest += 0.03 * Math.sin(ph) * walk;
  }

  // Springs: every joint eases to where it's going, a little bouncy.
  const k = 90, c = 2 * Math.sqrt(k) * 0.8;
  const spring = (cur, vel, key, target, rest = 0) => {
    const x = cur[key] ?? rest, v = vel[key] || 0;
    const a = k * ((target ?? rest) - x) - c * v;
    vel[key] = v + a * dt;
    cur[key] = x + vel[key] * dt;
  };
  const names = new Set([...Object.keys(T.rot), ...Object.keys(A.pose.rot)]);
  for (const n of names) spring(A.pose.rot, A.vel.rot, n, T.rot[n], 0);
  const lens = new Set([...Object.keys(T.len), ...Object.keys(A.pose.len)]);
  for (const n of lens) spring(A.pose.len, A.vel.len, n, T.len[n], 1);
  for (const i of [0, 1]) spring(A.pose.root, A.vel.root, i, T.root[i], 0);

  // Blinks, and the mouth with the voice.
  if (t > A.blinkAt) { A.blink = 1; A.blinkAt = t + 2.2 + Math.random() * 3.5; }
  A.blink = Math.max(0, A.blink - dt * 7);
  const talk = mode === "speaking" ? e : 0;
  const syll = 0.55 + 0.45 * Math.abs(Math.sin(t * 13 + Math.sin(t * 3.1) * 2));
  const want = mouthOverride ?? clamp(talk * 1.6, 0, 1) * syll;
  A.mouth += (want - A.mouth) * Math.min(1, dt * 18);
  return A;
}

// ---------------------------------------------------------------- drawing

let gl = null, glCanvas = null, prog = null, buf = null, failed = false;
const textures = new WeakMap();

function setupGL() {
  if (gl || failed) return gl;
  try {
    glCanvas = document.createElement("canvas");
    gl = glCanvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: true });
    if (!gl) throw new Error("no webgl");
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, "attribute vec2 p;attribute vec2 u;uniform vec4 v;varying vec2 q;void main(){q=u;gl_Position=vec4(p.x*v.x+v.z,p.y*v.y+v.w,0.,1.);}"));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, "precision mediump float;varying vec2 q;uniform sampler2D t;void main(){vec4 c=texture2D(t,q);gl_FragColor=vec4(c.rgb*c.a,c.a);}"));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
    buf = { pos: gl.createBuffer(), uv: gl.createBuffer(), idx: gl.createBuffer() };
  } catch {
    failed = true;
    gl = null;
  }
  return gl;
}

function texture(im) {
  let t = textures.get(im);
  if (t) return t;
  t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
  textures.set(im, t);
  return t;
}

/** Small things held in a hand: a phone, a coffee mug, a watch. */
function holding(ctx, what, [x, y], height, t) {
  const u = height / 100;
  ctx.save();
  ctx.translate(x, y);
  if (what === "phone") {
    ctx.fillStyle = "#1c1f27";
    ctx.beginPath();
    ctx.roundRect(-2.6 * u, -6.5 * u, 5.2 * u, 9 * u, 0.9 * u);
    ctx.fill();
    ctx.fillStyle = `rgba(110,190,255,${0.75 + 0.2 * Math.sin(t * 2)})`;
    ctx.beginPath();
    ctx.roundRect(-2.1 * u, -6 * u, 4.2 * u, 8 * u, 0.6 * u);
    ctx.fill();
  } else if (what === "mug") {
    ctx.fillStyle = "#f2efe8";
    ctx.beginPath();
    ctx.roundRect(-2.4 * u, -5.5 * u, 4.8 * u, 5.5 * u, 0.8 * u);
    ctx.fill();
    ctx.strokeStyle = "#f2efe8";
    ctx.lineWidth = 0.9 * u;
    ctx.beginPath();
    ctx.arc(2.6 * u, -3 * u, 1.3 * u, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.fillStyle = "#6b4226";
    ctx.fillRect(-2 * u, -5.2 * u, 4 * u, 0.8 * u);
    // Steam.
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 0.4 * u;
    for (const s of [-0.8, 0.8]) {
      ctx.beginPath();
      ctx.moveTo(s * u, -6 * u);
      ctx.quadraticCurveTo((s + Math.sin(t * 3 + s) * 0.8) * u, -8 * u, s * u, -10 * u);
      ctx.stroke();
    }
  } else if (what === "watch") {
    ctx.fillStyle = "#2b2f38";
    ctx.beginPath();
    ctx.arc(0, -1.5 * u, 1.3 * u, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#9fe3ff";
    ctx.beginPath();
    ctx.arc(0, -1.5 * u, 0.85 * u, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

const scratch = new WeakMap();

/** A tiny laptop held at the waist (while it works). */
function laptop(ctx, x, y, w, glow) {
  const h = w * 0.62;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#2a2f3a";
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h, w, h, w * 0.06);
  ctx.fill();
  const g = ctx.createLinearGradient(0, -h, 0, 0);
  g.addColorStop(0, `rgba(120,200,255,${0.75 + glow * 0.25})`);
  g.addColorStop(1, "rgba(80,120,255,0.75)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(-w / 2 + w * 0.06, -h + w * 0.06, w * 0.88, h - w * 0.12, w * 0.03);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  for (let i = 0; i < 3; i++) ctx.fillRect(-w * 0.34, -h + w * (0.14 + i * 0.1), w * (0.36 + 0.2 * ((i * 37 + Math.floor(glow * 9)) % 3) / 2), w * 0.035);
  ctx.fillStyle = "#3a404d";
  ctx.beginPath();
  ctx.roundRect(-w * 0.58, -w * 0.02, w * 1.16, w * 0.09, w * 0.04);
  ctx.fill();
  ctx.restore();
}

/**
 * Draw the character into a 2D context: feet at (x, y), `height` pixels
 * tall, facing 1 (as painted) or -1 (mirrored). Returns where its hands and
 * head are on the canvas (for props and speech bubbles), or false.
 */
export function drawPuppet(ctx, P, A, { x, y, height, facing = 1, laptopOn = false, shadow = true } = {}) {
  if (!P) return false;
  const M = solve(P, A.pose);
  let pts = scratch.get(P);
  if (!pts) { pts = new Float32Array(P.rest.length); scratch.set(P, pts); }
  skinPoints(P, M, pts);
  const unit = height / (P.bottom - P.top);
  // The drawing box: wide and tall enough for arms raised overhead.
  const pad = 0.42;
  const minX = P.feet[0] - P.width * 0.5 - (P.bottom - P.top) * pad * 0.6, maxX = P.feet[0] + P.width * 0.5 + (P.bottom - P.top) * pad * 0.6;
  const minY = P.top - (P.bottom - P.top) * pad * 0.5, maxY = P.bottom + 30;
  const W = Math.ceil((maxX - minX) * unit), H = Math.ceil((maxY - minY) * unit);
  // Where the image's feet land on the canvas.
  const ox = x - (P.feet[0] - minX) * unit * facing, oy = y - (P.feet[1] - minY) * unit;

  if (shadow) {
    ctx.save();
    ctx.fillStyle = "rgba(10,8,20,0.22)";
    ctx.beginPath();
    ctx.ellipse(x, y + 2, P.width * 0.32 * unit, 5 + height * 0.012, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  if (setupGL() && W > 0 && H > 0) {
    if (glCanvas.width !== W || glCanvas.height !== H) { glCanvas.width = W; glCanvas.height = H; }
    gl.viewport(0, 0, W, H);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    // Image pixels → clip space.
    gl.uniform4f(gl.getUniformLocation(prog, "v"), 2 / (maxX - minX), -2 / (maxY - minY), -1 - (2 * minX) / (maxX - minX), 1 + (2 * minY) / (maxY - minY));
    const pLoc = gl.getAttribLocation(prog, "p"), uLoc = gl.getAttribLocation(prog, "u");
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.pos);
    gl.bufferData(gl.ARRAY_BUFFER, pts, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(pLoc);
    gl.vertexAttribPointer(pLoc, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.uv);
    gl.bufferData(gl.ARRAY_BUFFER, P.uv, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(uLoc);
    gl.vertexAttribPointer(uLoc, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf.idx);
    const layer = (tris, im) => {
      if (!tris.length) return;
      gl.bindTexture(gl.TEXTURE_2D, texture(im));
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, tris, gl.DYNAMIC_DRAW);
      gl.drawElements(gl.TRIANGLES, tris.length, gl.UNSIGNED_SHORT, 0);
    };
    layer(P.layers[0], P.pics.body);
    layer(P.layers[1], P.pics.base);
    layer(P.layers[2], P.pics.base);
    ctx.save();
    if (facing < 0) { ctx.translate(ox, 0); ctx.scale(-1, 1); ctx.translate(-ox, 0); }
    ctx.drawImage(glCanvas, ox, oy, W, H);
    ctx.restore();
  } else {
    // No graphics chip to bend it: the still painting.
    ctx.save();
    if (facing < 0) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); }
    ctx.drawImage(P.pics.base, x - P.feet[0] * unit, y - P.feet[1] * unit, P.width * unit, P.height * unit);
    ctx.restore();
  }

  // Face: mouth and blinks ride on the head bone.
  const head = M[P.index.head];
  const toCanvas = (m) => {
    // canvas = T(ox,oy)·S(unit)·T(-minX,-minY)·m, mirrored about ox when facing left.
    const base = mul(move(ox, oy), mul([unit, 0, 0, unit, 0, 0], mul(move(-minX, -minY), m)));
    return facing < 0 ? mul(move(ox, 0), mul([-1, 0, 0, 1, 0, 0], mul(move(-ox, 0), base))) : base;
  };
  const F = toCanvas(head);
  ctx.save();
  ctx.setTransform(...(() => { const d = ctx.getTransform(); return mul([d.a, d.b, d.c, d.d, d.e, d.f], F); })());
  const { rig, pics } = P;
  if (A.mouth > 0.03 && rig.mouth) {
    const [mx, my, mw, mh] = rig.mouth;
    ctx.globalAlpha = clamp(A.mouth * 1.4, 0, 1);
    ctx.drawImage(pics.mouth, mx, my, mw, mh * (0.82 + 0.22 * A.mouth));
  }
  if (A.blink > 0.05 && rig.eyes) {
    const [ex, ey, ew, eh] = rig.eyes;
    ctx.globalAlpha = clamp(A.blink * 1.5, 0, 1);
    ctx.drawImage(pics.eyes, ex, ey, ew, eh);
  }
  ctx.restore();

  // Where things are, on the canvas.
  const at = (bone, jx, jy) => { const m = toCanvas(M[P.index[bone]]); return [m[0] * jx + m[2] * jy + m[4], m[1] * jx + m[3] * jy + m[5]]; };
  const J = P.skin.joints;
  const hands = [at("lowerArmL", ...J.wristL), at("lowerArmR", ...J.wristR)];
  const prop = laptopOn ? "laptop" : A.prop;
  if (prop === "laptop") {
    const lx = (hands[0][0] + hands[1][0]) / 2, ly = Math.max(hands[0][1], hands[1][1]) + height * 0.015;
    laptop(ctx, lx, ly, Math.max(height * 0.17, Math.abs(hands[0][0] - hands[1][0]) * 1.25 + height * 0.04), (A.t * 3) % 1);
  } else if (prop) {
    holding(ctx, prop, prop === "watch" ? hands[0] : hands[1], height, A.t);
  }
  return { hands, head: at("head", ...J.crown), box: [ox, oy, W, H] };
}

/** Which characters have a skeleton. */
export async function puppetIds() {
  return Object.keys(PUPPET_ART);
}
