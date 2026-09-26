/**
 * Instant skills — "open Notepad", "open YouTube", "go to amazon.com" —
 * done straight through Windows in well under a second, with no screenshot
 * and no AI call. Anything more ("open Notepad and type…") is the agent's
 * job; it has the same skills as actions.
 */

/** Well-known sites people say by name, for when no app of that name is installed. */
const SITES: Record<string, string> = {
  youtube: "https://www.youtube.com",
  google: "https://www.google.com",
  gmail: "https://mail.google.com",
  "google drive": "https://drive.google.com",
  "google docs": "https://docs.google.com",
  "google maps": "https://maps.google.com",
  facebook: "https://www.facebook.com",
  instagram: "https://www.instagram.com",
  twitter: "https://x.com",
  x: "https://x.com",
  tiktok: "https://www.tiktok.com",
  reddit: "https://www.reddit.com",
  netflix: "https://www.netflix.com",
  amazon: "https://www.amazon.com",
  wikipedia: "https://www.wikipedia.org",
  linkedin: "https://www.linkedin.com",
  github: "https://github.com",
  chatgpt: "https://chatgpt.com",
  outlook: "https://outlook.live.com",
  "spotify web": "https://open.spotify.com",
};

/** "open X" / "launch X" / "pull up X" — just X, one thing. */
const OPEN = /^(?:(?:hey|ok(?:ay)?|please|can you|could you|would you)[\s,]+)*(?:open|launch|start|run|bring up|pull up|go to|visit)\s+(?:up\s+)?(.{2,48}?)(?:\s+(?:for me|please))?[.!?]*$/i;
const DOMAIN = /^[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/\S*)?$/i;

export interface Instant {
  /** "app": try an installed app first, then `url` if there is one. */
  kind: "app" | "url";
  name: string;
  url: string | null;
}

/** What an instant request asks for, or null if it isn't one. */
export function parseInstant(said: string): Instant | null {
  const m = said.trim().match(OPEN);
  if (!m) return null;
  const name = m[1].replace(/^(?:the|my)\s+/i, "").replace(/\s+(?:app|application|website|site|page)$/i, "").trim();
  // More than one thing, or something only the screen can tell: the agent's job.
  if (/\b(and|then|so|to|with|in|on|from|about)\b|,/i.test(name)) return null;
  if (/^(it|this|that|these|those|them|file|a file|the file|folder|a folder|link|the link|tab|a new tab)$/i.test(name)) return null;
  if (DOMAIN.test(name)) return { kind: "url", name, url: /^https?:/i.test(name) ? name : `https://${name}` };
  return { kind: "app", name, url: SITES[name.toLowerCase()] ?? null };
}
