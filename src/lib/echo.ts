/**
 * Recognising Izuki's own voice when the mic picks it back up — from
 * speakers into a webcam or laptop mic, where the browser's echo cancelling
 * can't help (the Windows voice plays outside the page). Anything heard that
 * is mostly the words Izuki just said is its own echo, not the user.
 */

/** Lines said recently, with when they were said. */
const said: Array<{ words: Set<string>; at: number }> = [];

/** How long after a line a matching transcript still counts as its echo. */
const ECHO_WINDOW_MS = 12_000;

const wordsOf = (text: string) => text.toLowerCase().match(/[a-z0-9']+/g) ?? [];

/** Every line Izuki speaks goes through here (VoiceEngine's speakLine). */
export function noteSaid(text: string) {
  const now = Date.now();
  said.push({ words: new Set(wordsOf(text)), at: now });
  while (said.length && now - said[0].at > 60_000) said.shift();
}

/** Keep the echo window open until the line has actually finished playing. */
export function noteStillSaying() {
  const last = said[said.length - 1];
  if (last) last.at = Date.now();
}

/** Whether `heard` is (mostly) Izuki's own recent words coming back. */
export function isEcho(heard: string): boolean {
  const words = wordsOf(heard);
  if (!words.length) return false;
  const now = Date.now();
  const recent = new Set<string>();
  for (const s of said) if (now - s.at < ECHO_WINDOW_MS) s.words.forEach((w) => recent.add(w));
  if (!recent.size) return false;
  const hits = words.filter((w) => recent.has(w)).length;
  // A couple of words: all of them must match; longer: most of them.
  return words.length <= 2 ? hits === words.length : hits / words.length >= 0.6;
}
