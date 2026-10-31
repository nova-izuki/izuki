/**
 * The last things you typed, kept so they can be brought back with one click
 * instead of retyped — the floating chat's shelf, and anywhere else that
 * shares a composer.
 *
 * Kept on this PC only, in localStorage, and capped: this is a convenience,
 * not a history of your conversations. Prompts are what you wrote, never the
 * reply, and never anything Izuki added to them.
 */

const KEY = "izk.recentPrompts";
const MAX = 8;
/** Long enough to recognise, short enough for a one-line oval. */
export const SHELF_CHARS = 120;

type Listener = (list: string[]) => void;
const listeners = new Set<Listener>();

function read(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter((x): x is string => typeof x === "string" && x.trim().length > 0).slice(0, MAX);
  } catch {
    return [];
  }
}

let cached: string[] | null = null;

function write(list: string[]) {
  cached = list;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* private mode / quota: the shelf still works for this session */
  }
  for (const l of listeners) l(list);
}

export function recentPrompts(): string[] {
  if (!cached) cached = read();
  return cached;
}

/** A prompt that was really sent (or really retried), newest first. */
export function rememberPrompt(text: string) {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t || t.length > 4000) return;
  const list = [t, ...recentPrompts().filter((x) => x !== t)].slice(0, MAX);
  write(list);
}

export function forgetPrompt(text: string) {
  write(recentPrompts().filter((x) => x !== text));
}

export function clearPrompts() {
  write([]);
}

export function onRecentPrompts(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
