// Moves: a character really animated — every pose redrawn by hand (an
// image model, from the character's own painting), cut out, and played
// back frame by frame like 2D animation. Walking is a real side-on walk
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

/** Frames a second, and whether the loop goes back and forth. */
const PLAY = {
  idle: { fps: 2.6, bounce: true },
  talk: { fps: 6.5 },
  walk: { fps: 10 },
  think: { fps: 1.6, bounce: true },
  type: { fps: 7 },
  wave: { fps: 4.5 },
  thumbs: { fps: 1 },
  cheer: { fps: 1 },
  point: { fps: 1 },
  shrug: { fps: 1 },
};
/** What to show when a state isn't in the pack. */
const NEAREST = { listen: "idle", think: "idle", type: "think", wave: "cheer", thumbs: "cheer", cheer: "idle", point: "idle", shrug: "idle", talk: "idle", walk: "idle" };

function resolve(pack, state) {
  let s = state;
  for (let i = 0; i < 4 && !pack.data.states[s]?.length; i++) s = NEAREST[s] || "idle";
  return pack.data.states[s]?.length ? s : Object.keys(pack.data.states)[0];
}

export function createMover() {
  return { state: "idle", t: 0, prev: null, fade: 0 };
}

/** One beat toward the state wanted. A new state blends in over a moment. */
export function stepMover(m, dt, want) {
  if (want && want !== m.state) {
    m.prev = { state: m.state, t: m.t };
    m.state = want;
    m.t = 0;
    m.fade = 1;
  }
  m.t += dt;
  m.fade = Math.max(0, m.fade - dt / 0.16);
  if (!m.fade) m.prev = null;
  return m;
}

function frameAt(pack, state, t) {
  const s = resolve(pack, state);
  const frames = pack.data.states[s];
  const p = PLAY[s] || { fps: 4 };
  const n = frames.length;
  let i = Math.floor(t * p.fps);
  if (p.bounce && n > 1) {
    const span = n * 2 - 2;
    i %= span;
    if (i >= n) i = span - i;
  } else i %= n;
  return { f: frames[i], walk: s === "walk" };
}

function drawFrame(ctx, pack, f, { x, y, height, facing }) {
  const s = height / pack.data.height;
  ctx.save();
  if (facing < 0) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); }
  ctx.drawImage(pack.img, f.x, f.y, f.w, f.h, x - f.fx * s, y - f.fy * s, f.w * s, f.h * s);
  ctx.restore();
}

/**
 * Draw it: feet at (x, y), `height` tall (a standing frame), facing 1 (as
 * drawn — walking faces right) or -1. Returns false without a pack.
 */
export function drawMover(ctx, pack, m, { x, y, height, facing = 1, shadow = true } = {}) {
  if (!pack) return false;
  if (shadow) {
    ctx.save();
    ctx.fillStyle = "rgba(10,8,20,0.2)";
    ctx.beginPath();
    ctx.ellipse(x, y + 1, height * 0.17, 3 + height * 0.012, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  const cur = frameAt(pack, m.state, m.t);
  if (m.prev && m.fade > 0) {
    const old = frameAt(pack, m.prev.state, m.prev.t);
    ctx.save();
    ctx.globalAlpha = m.fade;
    drawFrame(ctx, pack, old.f, { x, y, height, facing });
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 1 - m.fade;
    drawFrame(ctx, pack, cur.f, { x, y, height, facing });
    ctx.restore();
  } else {
    drawFrame(ctx, pack, cur.f, { x, y, height, facing });
  }
  return true;
}
