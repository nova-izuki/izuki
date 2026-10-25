import { api } from "./ipc";

/**
 * Click-through with holes in it.
 *
 * In follow/preview mode the overlay window ignores the mouse at the OS
 * level, so you can keep using your PC underneath it. CSS `pointer-events`
 * can't punch through that — the window never even receives the click. So
 * instead, every cursor position Rust streams in is hit-tested here against
 * any element marked `data-izk-hit`, and the window is made clickable only
 * while the pointer is actually over one of them.
 *
 * `document.elementFromPoint` is pure DOM hit-testing, unaffected by the
 * OS-level flag, and it skips `pointer-events: none` layers — exactly the
 * semantics wanted.
 */

let current = false;
let locks = 0;
let wheelOk = false;
let last: [number, number] | null = null;

function apply(want: boolean, force = false) {
  if (want === current && !force) return;
  current = want;
  void api.setOverlayHit(want);
}

/**
 * Whether this element, or anything above it, really scrolls right now.
 *
 * The mouse wheel is taken away from the app behind while it's over one of
 * Izuki's widgets, so that widget has to be what moves instead. A short
 * answer, or the bubble's padding, has nothing to scroll — and swallowing
 * the wheel there meant nothing moved at all.
 */
/** The same question the wheel handler asks, so the two can't disagree about
 *  what scrolls (one swallowing the wheel the other then can't use). */
export function scrollableAt(x: number, y: number): HTMLElement | null {
  let node = document.elementFromPoint(x, y) as HTMLElement | null;
  while (node) {
    const overflow = getComputedStyle(node).overflowY;
    if ((overflow === "auto" || overflow === "scroll") && node.scrollHeight > node.clientHeight + 1) return node;
    node = node.parentElement;
  }
  return null;
}

function scrolls(el: Element | null): boolean {
  let node = el as HTMLElement | null;
  while (node) {
    const overflow = getComputedStyle(node).overflowY;
    if ((overflow === "auto" || overflow === "scroll") && node.scrollHeight > node.clientHeight + 1) return true;
    node = node.parentElement;
  }
  return false;
}

function applyWheel(want: boolean) {
  if (want === wheelOk) return;
  wheelOk = want;
  void api.setOverlayWheel(want);
}

/** Feed a cursor position in overlay client pixels. */
export function hitTest(clientX: number, clientY: number) {
  last = [clientX, clientY];
  // During a drag nothing is being hovered or scrolled: skip the DOM work
  // entirely (elementFromPoint plus a getComputedStyle walk forces a layout,
  // and this runs on every cursor update).
  if (locks > 0) return apply(true);
  const el = document.elementFromPoint(clientX, clientY);
  apply(!!el?.closest("[data-izk-hit]"));
  applyWheel(!!el && scrolls(el));
}

/**
 * Hold the window clickable for the length of a drag or resize — a fast
 * flick can outrun the cursor stream and leave the widget, and dropping
 * clicks mid-drag would strand the gesture.
 */
export function lockHit() {
  locks++;
  apply(true);
}

export function unlockHit() {
  locks = Math.max(0, locks - 1);
}

/** Rust just reset the window's click-through state itself (a mode change). */
export function resetHit() {
  current = false;
  locks = 0;
  wheelOk = false;
}

/**
 * Something else made the whole window clickable (e.g. opening the chat by
 * voice, which needs keyboard focus) — record it so the next hit-test
 * outside a widget flips it back to click-through.
 */
export function markHit() {
  current = true;
}

/**
 * The safety net: the whole screen must never stay blocked behind the
 * overlay. Something can make the window clickable without this file
 * knowing (Rust changing modes, the chat taking focus, a lost cursor
 * update), and then every click lands on an invisible layer. So now and
 * then the real state is set again from scratch — click-through unless
 * the pointer is actually on one of Izuki's own widgets.
 */
export function reassertHit() {
  if (locks > 0) return;
  const el = last ? document.elementFromPoint(last[0], last[1]) : null;
  applyWheel(!!el && scrolls(el));
  apply(!!el?.closest("[data-izk-hit]"), true);
}
