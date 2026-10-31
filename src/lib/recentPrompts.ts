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
const MAX_CHARS = 4000;

type Listener = (list: string[]) => void;
const listeners = new Set<Listener>();

function read(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return [...new Set(raw.filter((x): x is string => typeof x === "string" && x.trim().length > 0 && x.length <= MAX_CHARS))].slice(0, MAX);
  } catch {
    return [];
  }
}

let cached: string[] | null = null;
let storageFailed = false;

// The main panel and floating chat are different windows. Refresh the cache
// when another window changes or clears the shared shelf.
if (typeof window !== "undefined") window.addEventListener("storage", (event) => {
  if (event.storageArea !== localStorage || (event.key !== KEY && event.key !== null)) return;
  cached = read();
  for (const fn of listeners) fn(cached);
});

function write(list: string[]) {
  cached = list;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    storageFailed = false;
  } catch {
    storageFailed = true;
    /* private mode / quota: the shelf still works for this session */
  }
  for (const l of listeners) l(list);
}

export function recentPrompts(): string[] {
  if (!cached || !storageFailed) cached = read();
  return cached;
}

/** A prompt that was really sent (or really retried), newest first. */
export function rememberPrompt(text: string) {
  const t = text.trim();
  if (!t || t.length > MAX_CHARS) return;
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
  fn(recentPrompts());
  return () => {
    listeners.delete(fn);
  };
}
