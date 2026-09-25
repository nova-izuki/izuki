/**
 * Hand-drawn rendering.
 *
 * A box drawn with a mouse in one clean drag looks like CAD output, not like
 * someone pointing at their screen — so every mark is rebuilt as a slightly
 * imperfect, pencil-like path instead of a mathematically perfect primitive.
 * The wobble is seeded once per mark and reused on every redraw while it's
 * still being sized, so it grows and shrinks naturally instead of vibrating
 * frame to frame, the way a real sketch line would look if you re-inked it
 * at a slightly different size each time.
 */

export type Seed = () => number;

/** A tiny, fast, seedable PRNG — deterministic per mark, not cryptographic. */
export function createSeed(source?: number): Seed {
  let s = (source ?? Math.floor(Math.random() * 2 ** 31)) >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const jitter = (rng: Seed, amount: number) => (rng() - 0.5) * 2 * amount;

/** How far a stroke wobbles off its true line, scaled to the mark's size. */
function wobbleFor(span: number): number {
  return Math.min(6, Math.max(1.4, span * 0.02));
}

/**
 * A hand-inked line: a handful of points nudged off the straight path, with
 * enough of a curve (via Konva's `tension`) that it reads as drawn, not
 * ruled. Two overlapping passes give the classic "went over it twice" look.
 */
export function sketchyLine(
  rng: Seed,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  passes = 2
): number[][] {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const w = wobbleFor(len);
  const steps = Math.max(3, Math.min(10, Math.round(len / 26)));

  const lines: number[][] = [];
  for (let p = 0; p < passes; p++) {
    const points: number[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Ease the wobble to near-zero at both ends so strokes still meet at
      // their intended corners, like a hand naturally settling into a point.
      const taper = Math.sin(Math.PI * t) ** 0.6;
      const off = jitter(rng, w) * taper + (p === 0 ? 0 : jitter(rng, w * 0.4));
      points.push(x1 + dx * t + nx * off, y1 + dy * t + ny * off);
    }
    lines.push(points);
  }
  return lines;
}

/** A hand-drawn rectangle: four rough strokes whose corners slightly overshoot or fall short of meeting, the way a fast sketch does. */
export function sketchyRect(rng: Seed, x: number, y: number, w: number, h: number): number[][] {
  const o = () => jitter(rng, Math.min(5, Math.max(1, Math.min(w, h) * 0.03)));
  const c = {
    tl: [x + o(), y + o()],
    tr: [x + w + o(), y + o()],
    br: [x + w + o(), y + h + o()],
    bl: [x + o(), y + h + o()],
  };
  return [
    ...sketchyLine(rng, c.tl[0], c.tl[1], c.tr[0], c.tr[1], 1),
    ...sketchyLine(rng, c.tr[0], c.tr[1], c.br[0], c.br[1], 1),
    ...sketchyLine(rng, c.br[0], c.br[1], c.bl[0], c.bl[1], 1),
    ...sketchyLine(rng, c.bl[0], c.bl[1], c.tl[0], c.tl[1], 1),
  ];
}

/** A hand-drawn ellipse: a wobbled loop, slightly overlapped at the start like a pencil closing a circle. */
export function sketchyEllipse(rng: Seed, cx: number, cy: number, rx: number, ry: number): number[] {
  const w = wobbleFor(Math.min(rx, ry) * 2);
  const steps = Math.max(24, Math.min(64, Math.round((rx + ry) / 3)));
  const overlap = 0.14; // radians past a full turn, so the loop visibly re-crosses itself
  const points: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * (Math.PI * 2 + overlap) - Math.PI / 2;
    const wobble = 1 + jitter(rng, 0.045) + Math.sin(t * 3 + rng() * 6) * (w / Math.max(rx, ry)) * 0.5;
    points.push(cx + Math.cos(t) * rx * wobble, cy + Math.sin(t) * ry * wobble);
  }
  return points;
}

/** A hand-drawn arrowhead: two short rough strokes, not a perfect chevron. */
export function sketchyArrowhead(
  rng: Seed,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
): number[][] {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const size = Math.min(30, Math.max(12, len * 0.22));
  const spread = 0.5;

  const wings: number[][] = [];
  for (const sign of [-1, 1]) {
    const angle = sign * spread;
    const s = Math.sin(angle);
    const cAng = Math.cos(angle);
    const bx = toX - (ux * cAng - uy * s) * size;
    const by = toY - (uy * cAng + ux * s) * size;
    wings.push(...sketchyLine(rng, toX, toY, bx, by, 1));
  }
  return wings;
}
