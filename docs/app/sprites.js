// Moves: a character really animated — every pose redrawn by hand (an
// image model, from the character's own painting), cut out, and played
// back like 2D animation: poses held and blended, walking frame by frame. Walking is a real side-on walk
// cycle with the clothes swinging; talking has real gestures and a moving
// mouth; it stands straight. (.work/frames.py packs painted/<id>-moves/.)
//
// States a pack may have: idle, talk, walk, think, type, wave, thumbs,
// cheer, point, shrug — anything missing falls back to the nearest one.
//
//   const pack = await loadMoves("abeo")        // null if it has none yet
//   const m = createMover()
//   stepMover(m, dt, "talk")
//   drawMover(ctx, pack, m, { x, y, height, facing })

import { MOVES_ART } from "./moves-art.js";

const loads = new Map();

/** A character's animation pack (cached), or null if it has none. */
export function loadMoves(id) {
  if (!loads.has(id)) {
    const art = MOVES_ART[id];
    loads.set(id, !art ? Promise.resolve(null) : Promise.all([
      fetch(art.json).then((r) => (r.ok ? r.json() : Promise.reject(new Error("no moves")))),
      new Promise((ok, fail) => { const im = new Image(); im.decoding = "async"; im.onload = () => ok(im); im.onerror = () => fail(new Error("picture didn't load")); im.src = art.atlas; }),
    ]).then(([data, img]) => ({ id, data, img })).catch((e) => { console.warn("[moves] " + id + ":", e?.message || e); loads.delete(id); return null; }));
  }
  return loads.get(id);
}

/** Which characters are really animated. */
export const movesIds = () => Object.keys(MOVES_ART);

/**
 * How each state plays. Each pose is a separate painting, so flicking through
 * them several times a second (the old way: talking at 6.5 frames a second,
 * hard cuts) looked like twitching. Now a pose is *held* like a real person
 * holds a gesture, and the next one blends in:
 *   hold: seconds a pose stays [min, max] · blend: seconds to blend in
 *   order: "rest" (back to the first pose between the others), "shuffle"
 *   (a different one each time), "loop" (in order) or "bounce" (there and back)
 *   cycle: a true frame-by-frame cycle (walking), no blending.
 */
const PLAY = {
  idle: { hold: [3.2, 5.5], away: [1.1, 1.8], blend: 0.5, order: "rest" },
  talk: { hold: [0.75, 1.25], blend: 0.32, order: "shuffle" },
  walk: { cycle: 10 },
  think: { hold: [1.5, 2.3], blend: 0.55, order: "bounce" },
  type: { hold: [0.3, 0.42], blend: 0.16, order: "loop" },
  wave: { hold: [0.34, 0.4], blend: 0.2, order: "loop" },
  thumbs: { hold: [9, 9], blend: 0.3, order: "loop" },
  cheer: { hold: [9, 9], blend: 0.3, order: "loop" },
  point: { hold: [9, 9], blend: 0.3, order: "loop" },
  shrug: { hold: [9, 9], blend: 0.3, order: "loop" },
};
/** Retro: the poses flicked frame by frame, like an old game (frames a second). */
const RETRO = { idle: [2.6, true], talk: [6.5], walk: [10], think: [1.6, true], type: [7], wave: [4.5], thumbs: [1], cheer: [1], point: [1], shrug: [1] };

function retroFrame(pack, state, t) {
  const s = resolve(pack, state);
  const frames = pack.data.states[s];
  const [fps, bounce] = RETRO[s] || [4];
  const n = frames.length;
  let i = Math.floor(t * fps);
  if (bounce && n > 1) {
    const span = n * 2 - 2;
    i %= span;
    if (i >= n) i = span - i;
  } else i %= n;
  return { f: frames[i], old: null, k: 1, walk: s === "walk" };
}

/** What to show when a state isn't in the pack. */
const NEAREST = { listen: "idle", think: "idle", type: "think", wave: "cheer", thumbs: "cheer", cheer: "idle", point: "idle", shrug: "idle", talk: "idle", walk: "idle" };

function resolve(pack, state) {
  let s = state;
  for (let i = 0; i < 4 && !pack.data.states[s]?.length; i++) s = NEAREST[s] || "idle";
  return pack.data.states[s]?.length ? s : Object.keys(pack.data.states)[0];
}

/**
 * A new phrase began (the voice came back after a pause): move on to the
 * next gesture, so the hands go with the words instead of a clock.
 */
export function nudgeMover(m) {
  m.nudge = true;
}

export function createMover() {
  // face: which way the body faces, turning smoothly (-1..1); kickAt: when a
  // new gesture began (a little settle follows); sway: where its weight-shift starts.
  return { state: "idle", t: 0, clock: 0, prev: null, fade: 0, pose: null, face: null, kickAt: -9, sway: Math.random() * 7, drawAt: null };
}

/** Windows' "reduce motion" on: the extra body movement stays off. */
const STILL = (() => {
  try {
    return !!globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
})();

/** One beat toward the state wanted. A new state blends in over a moment. */
export function stepMover(m, dt, want) {
  m.clock = (m.clock || 0) + dt;
  if (want && want !== m.state) {
    m.prev = { state: m.state, t: m.t, pose: m.pose };
    m.state = want;
    m.t = 0;
    m.fade = 1;
    m.pose = null;
    m.kickAt = m.clock;
  }
  m.t += dt;
  m.fade = Math.max(0, m.fade - dt / 0.3);
  if (!m.fade) m.prev = null;
  return m;
}

const between = ([a, b]) => a + Math.random() * (b - a);

/** The pose to show now (and the one blending out), for a held state. */
function posed(m, pose, frames, p, t) {
  const n = frames.length;
  if (!pose) {
    pose = { i: 0, from: -1, at: t, until: t + between(p.hold), dir: 1 };
  } else if (t >= pose.until && n > 1) {
    let i = pose.i;
    if (p.order === "rest") i = pose.i === 0 ? 1 + Math.floor(Math.random() * (n - 1)) : 0;
    else if (p.order === "shuffle") i = (pose.i + 1 + Math.floor(Math.random() * (n - 1))) % n;
    else if (p.order === "bounce") {
      let dir = pose.dir;
      if (i + dir >= n || i + dir < 0) dir = -dir;
      pose.dir = dir;
      i += dir;
    } else i = (i + 1) % n;
    const hold = p.order === "rest" && i !== 0 ? between(p.away) : between(p.hold);
    pose = { i, from: pose.i, at: t, until: t + hold, dir: pose.dir };
  }
  const k = pose.from < 0 ? 1 : Math.min(1, (t - pose.at) / p.blend);
  return { pose, f: frames[pose.i % n], old: pose.from >= 0 && k < 1 ? frames[pose.from % n] : null, k };
}

/** Talking poses drawn with the mouth shut (the mouth is painted on, in time with the voice). */
const shut = new WeakMap();
function talkFrames(frames) {
  if (!shut.has(frames)) {
    const closed = frames.filter((f) => f.face && f.face.mo < 0.2);
    shut.set(frames, closed.length >= 2 ? closed : frames);
  }
  return shut.get(frames);
}

function frameAt(pack, state, t, holder) {
  const s = resolve(pack, state);
  const all = pack.data.states[s];
  const frames = s === "talk" ? talkFrames(all) : all;
  const p = PLAY[s] || PLAY.idle;
  if (p.cycle) return { f: frames[Math.floor(t * p.cycle) % frames.length], old: null, k: 1, walk: true };
  // A new phrase starting: the next gesture now (once it's been held a moment).
  if (holder.nudge && holder.pose && t - holder.pose.at > 0.55) holder.pose.until = t;
  holder.nudge = false;
  const r = posed(holder, holder.pose, frames, p, t);
  // A new gesture: the body settles into it (see drawMover).
  if (holder.pose && r.pose !== holder.pose && holder.clock != null) holder.kickAt = holder.clock;
  holder.pose = r.pose;
  return { f: r.f, old: r.old, k: r.k, walk: false };
}

function drawFrame(ctx, pack, f, { x, y, height, facing, breath = 0, mouth = 0, blink = 0, face = false, sx = null, lean = 0, squash = 0 }) {
  const s = height / pack.data.height;
  ctx.save();
  // All body movement pivots at the feet: turning (sx), leaning, breathing
  // (a slight rise and fall) and the settle after a new gesture (squash).
  const across = (sx ?? (facing < 0 ? -1 : 1)) * (1 + squash * 0.5);
  const up = 1 + breath - squash;
  if (across !== 1 || up !== 1 || lean) {
    ctx.translate(x, y);
    if (lean) ctx.rotate(lean);
    ctx.scale(across, up);
    ctx.translate(-x, -y);
  }
  const ox = x - f.fx * s;
  const oy = y - f.fy * s;
  ctx.drawImage(pack.img, f.x, f.y, f.w, f.h, ox, oy, f.w * s, f.h * s);
  if (face && f.face) drawFace(ctx, f.face, ox, oy, s, mouth, blink);
  ctx.restore();
}

/** A colour, darker (0..1). */
function darker(hex, by) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.round(v * (1 - by));
  return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`;
}

/**
 * The live face on a painted frame (found by .work/face_meta.py): a mouth
 * that opens with the voice — painted in the character's own lip colour —
 * and eyelids for blinking, in their own skin colour. An eye under a patch
 * is left alone.
 */
function drawFace(ctx, fc, ox, oy, s, mouth, blink) {
  if (mouth > 0.04) {
    const cx = ox + fc.mx * s;
    const cy = oy + fc.my * s;
    const w = fc.mw * s * (0.58 + 0.2 * mouth);
    const h = Math.max(0.8, fc.mw * s * (0.06 + 0.42 * mouth));
    ctx.beginPath();
    ctx.ellipse(cx, cy + h * 0.12, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = darker(fc.lip, 0.62);
    ctx.fill();
    // Teeth: a hint along the top when it's open wide enough to see.
    if (h > 2.6) {
      ctx.save();
      ctx.clip();
      ctx.fillStyle = "rgba(245,240,232,0.85)";
      ctx.fillRect(cx - w / 2, cy + h * 0.12 - h / 2, w, h * 0.24);
      ctx.restore();
    }
    ctx.lineWidth = Math.max(0.6, s * 0.7);
    ctx.strokeStyle = fc.lip;
    ctx.stroke();
  }
  if (blink > 0.05) {
    const eyes = [[fc.lx, fc.ly, fc.lc], [fc.rx, fc.ry, fc.rc]];
    for (const [ex, ey, covered] of eyes) {
      if (covered) continue;
      const cx = ox + ex * s;
      const cy = oy + ey * s;
      const rx = fc.ew * s * 0.62;
      const ry = Math.max(0.6, fc.ew * s * 0.42);
      // The lid comes down from the top.
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = fc.skin;
      ctx.fillRect(cx - rx, cy - ry, rx * 2, ry * 2 * blink);
      ctx.restore();
      if (blink > 0.7) {
        ctx.beginPath();
        ctx.moveTo(cx - rx * 0.9, cy + ry * 0.1);
        ctx.quadraticCurveTo(cx, cy + ry * 0.55, cx + rx * 0.9, cy + ry * 0.1);
        ctx.lineWidth = Math.max(0.6, s * 0.6);
        ctx.strokeStyle = darker(fc.skin, 0.55);
        ctx.stroke();
      }
    }
  }
}

/**
 * A blend that never goes see-through: the pose going away fades out
 * underneath while the new one comes in solid on top twice as fast — so the
 * body stays solid and only the moving arm ghosts for a moment.
 */
function blendFrames(ctx, pack, old, cur, k, o) {
  if (old && k < 1) {
    ctx.save();
    ctx.globalAlpha = 1 - k;
    drawFrame(ctx, pack, old, { ...o, face: false });
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = Math.min(1, k * 2);
    drawFrame(ctx, pack, cur, o);
    ctx.restore();
  } else drawFrame(ctx, pack, cur, o);
}

/**
 * Draw it: feet at (x, y), `height` tall (a standing frame), facing 1 (as
 * drawn — walking faces right) or -1. Returns false without a pack.
 */
export function drawMover(ctx, pack, m, { x, y, height, facing = 1, shadow = true, retro = false, mouth = 0, blink = 0 } = {}) {
  if (!pack) return false;
  if (shadow) {
    ctx.save();
    ctx.fillStyle = "rgba(10,8,20,0.2)";
    ctx.beginPath();
    ctx.ellipse(x, y + 1, height * 0.17, 3 + height * 0.012, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  const cur = retro ? retroFrame(pack, m.state, m.t) : frameAt(pack, m.state, m.t, m);
  const clock = m.clock || 0;
  const breath = cur.walk || retro ? 0 : 0.006 * Math.sin((clock * Math.PI * 2) / 3.8);
  // Like a person, not a picture: it turns round instead of flipping, shifts
  // its weight while it stands, leans into a walk, nods a touch with the
  // voice, and settles into each new gesture. All small.
  const calm = STILL || retro;
  const dt = m.drawAt == null ? 0 : Math.max(0, Math.min(0.1, clock - m.drawAt));
  m.drawAt = clock;
  const goal = facing < 0 ? -1 : 1;
  // Turning round takes a quarter of a second. Walking (drawn side-on), it
  // turns the way a drawn character does: the side view narrows, it faces
  // you for a moment, then it's side-on the other way.
  m.face = m.face == null || calm ? goal : m.face + Math.max(-dt * 8, Math.min(dt * 8, goal - m.face));
  const side = m.face < 0 ? -1 : 1;
  const square = cur.walk && Math.abs(m.face) < 0.5;
  const sx = square || !cur.walk ? side : side * (0.82 + 0.18 * Math.abs(m.face));
  const since = clock - (m.kickAt ?? -9);
  const settle = calm || since < 0 || since > 0.42 ? 0 : 0.02 * Math.sin((since / 0.42) * Math.PI * 2) * (1 - since / 0.42);
  const lean = calm || square ? 0 : cur.walk ? 0.035 * side : 0.0055 * Math.sin(((clock + (m.sway || 0)) * Math.PI * 2) / 7.3);
  const nod = calm ? 0 : Math.min(1, mouth) * 0.012;
  const o = { x, y, height, facing: side, breath: breath + nod, mouth, blink, face: true, sx, lean, squash: settle };
  const front = square ? pack.data.states[resolve(pack, "idle")]?.[0] : null;
  if (front) {
    drawFrame(ctx, pack, front, o);
  } else if (m.prev && m.fade > 0) {
    // Into a new state: the last state's pose fades out under the new one.
    const before = retro ? retroFrame(pack, m.prev.state, m.prev.t) : frameAt(pack, m.prev.state, m.prev.t, m.prev);
    blendFrames(ctx, pack, before.f, cur.f, 1 - m.fade, o);
  } else {
    blendFrames(ctx, pack, cur.old, cur.f, cur.k, o);
  }
  return true;
}
