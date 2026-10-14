/**
 * Air control's peace-sign scroll ✌️: hand movement → scroll notches.
 *
 * Up/down scrolls up/down; left/right scrolls sideways. The way is picked
 * once the hand has clearly moved (3% of the camera view) and kept until the
 * peace sign ends — so a wobbly sideways move never scrolls diagonally, and
 * a little jitter scrolls nothing at all.
 *
 * Kept on its own (no React, no Tauri) so tools/air-scroll-check.cjs can run
 * the exact code with made-up hand paths.
 */

export interface ScrollState {
  /** Where the hand was on the last look (0–1 of the view), or null at the start. */
  x: number | null;
  y: number | null;
  /** Partial notches not sent yet. */
  down: number;
  right: number;
  /** "v" up/down or "h" sideways, once chosen. */
  axis: "v" | "h" | null;
  /** How far the hand moved before the way was chosen. */
  travel: { x: number; y: number };
}

/** Notches per whole camera view of hand movement. */
export const NOTCHES_PER_VIEW = 40;
/** How far the hand must move before the way is chosen. */
export const CHOOSE_AFTER = 0.03;
/** Sideways only when clearly more sideways than up/down. */
export const SIDEWAYS_BIAS = 1.3;

export function newScroll(): ScrollState {
  return { x: null, y: null, down: 0, right: 0, axis: null, travel: { x: 0, y: 0 } };
}

/**
 * One look at the hand (pointer position nx, ny — already mirrored so moving
 * right is +x) during a peace sign. Returns whole notches to scroll now:
 * `down` (negative = up) and `right` (negative = left). Mutates `s`.
 */
export function scrollStep(s: ScrollState, nx: number, ny: number): { down: number; right: number } {
  if (s.x === null || s.y === null) {
    s.x = nx;
    s.y = ny;
    return { down: 0, right: 0 };
  }
  const dx = nx - s.x;
  const dy = ny - s.y;
  s.x = nx;
  s.y = ny;
  if (!s.axis) {
    s.travel = { x: s.travel.x + dx, y: s.travel.y + dy };
    if (Math.hypot(s.travel.x, s.travel.y) > CHOOSE_AFTER) {
      s.axis = Math.abs(s.travel.x) > Math.abs(s.travel.y) * SIDEWAYS_BIAS ? "h" : "v";
    }
  }
  if (s.axis === "v") s.down += dy * NOTCHES_PER_VIEW;
  if (s.axis === "h") s.right += dx * NOTCHES_PER_VIEW;
  const down = Math.trunc(s.down);
  const right = Math.trunc(s.right);
  s.down -= down;
  s.right -= right;
  return { down, right };
}
