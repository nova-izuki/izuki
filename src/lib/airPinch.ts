/**
 * The thumb-and-index pinch as a mouse press (AirControl.tsx), kept pure so
 * the hold, drag and tracking-loss cases are tested without a camera.
 *
 * - A pinch presses only after the fingers have touched for `PRESS_MS`, so
 *   one noisy look never clicks.
 * - Once pressed, it holds through a look or two of loosened fingers (a fast
 *   flick or drag opens them a little) and lets go only after they've been
 *   apart for `RELEASE_MS`.
 * - When Izuki lets go for you (the hand left the picture, or dropped), the
 *   next press needs the fingers to open first: a hand that comes back still
 *   pinched never presses again by itself.
 */

/** Fingers touching this long before a press counts. */
export const PRESS_MS = 80;
/** Fingers apart this long before a held press lets go. */
export const RELEASE_MS = 90;

export interface PinchState {
  /** When the fingers started touching (0: they aren't). */
  touchSince: number;
  /** When the fingers came apart (0: they're touching). */
  openSince: number;
  /** Izuki let go for you: wait for the fingers to open before another press. */
  needOpen: boolean;
}

export function newPinch(): PinchState {
  return { touchSince: 0, openSince: 0, needOpen: false };
}

/**
 * One look of the hand. `touching`: the fingers are together now; `down`:
 * a press is being held. True while the pinch counts as pressed.
 */
export function pinchStep(s: PinchState, touching: boolean, down: boolean, now: number): boolean {
  if (touching) {
    if (!s.touchSince) s.touchSince = now;
    s.openSince = 0;
  } else {
    s.touchSince = 0;
    if (!s.openSince) s.openSince = now;
  }
  if (s.needOpen) {
    if (touching) return false;
    s.needOpen = false;
  }
  if (down) return touching || now - s.openSince < RELEASE_MS;
  return touching && now - s.touchSince >= PRESS_MS;
}

/** Izuki let go of the press (the hand left or dropped): no press again until the fingers open. */
export function pinchLetGo(s: PinchState): void {
  s.needOpen = true;
  s.touchSince = 0;
  s.openSince = 0;
}
