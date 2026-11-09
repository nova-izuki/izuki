/** One saved conversation in the Chat tab's local history. */
export interface ChatSession<T> {
  id: string;
  title: string;
  at: number;
  messages: T[];
  /** Kept at the top of Recent chats and never dropped by the recent cap. */
  pinned?: boolean;
  /** Write number (see LiveCopy): which copy of the open chat is newer. */
  rev?: number;
}

/**
 * The open chat as saved on its own. `rev` and `session` are written in the
 * same storage write as the messages, so a copy is never half-saved; `rev`
 * counts every write of either copy (no clock, so no ties). An old save has
 * neither: rev 0, and it belongs to whatever chat is open.
 */
export interface LiveCopy<T> {
  rev: number;
  session?: string;
  messages: T[];
}

/**
 * Which copy of the open chat to start with. The live copy unless it belongs
 * to another chat (a switch whose live write failed) or its Recent entry was
 * written after it (a live write that failed while Recent's went through).
 * A chat cleared on purpose is a newer, empty live copy, so it stays clear.
 * With no write numbers anywhere (an old install), the live copy wins, as it
 * always had.
 */
export function startingMessages<T>(live: LiveCopy<T>, session: string, kept?: ChatSession<T>): T[] {
  if (live.session !== undefined && live.session !== session) return kept?.messages ?? [];
  if (kept && (kept.rev ?? 0) > live.rev) return kept.messages;
  return live.messages;
}

/** Keep the unpinned list short enough to stay fast and easy to scan. */
export const RECENT_CHAT_LIMIT = 10;

/** A short title from the first thing the person asked. */
export function chatTitle(messages: ReadonlyArray<{ role: string; content?: string }>): string {
  const source = messages.find((m) => m.role === "user" && (m.content ?? "").trim())?.content ?? "";
  const plain = source
    .replace(/[`*#>\[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!plain) return "New chat";
  return plain.length > 52 ? `${plain.slice(0, 51).trimEnd()}…` : plain;
}

/** How long ago, without making the user read a timestamp. */
export function timeAgo(at: number, now = Date.now()): string {
  const elapsed = Math.max(0, now - at);
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(at).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * Pinned chats first, then the newest unpinned ones (pins are extra, never
 * dropped). `keep` is a chat that must survive the cap, such as one just
 * unpinned: the oldest other unpinned chat makes room for it instead.
 */
export function orderSessions<T>(sessions: readonly ChatSession<T>[], keep?: string): ChatSession<T>[] {
  const pinned = sessions.filter((s) => s.pinned).sort((a, b) => b.at - a.at);
  const unpinned = sessions.filter((s) => !s.pinned).sort((a, b) => b.at - a.at);
  let recent = unpinned.slice(0, RECENT_CHAT_LIMIT);
  const kept = keep === undefined ? undefined : unpinned.find((s) => s.id === keep);
  if (kept && !recent.includes(kept)) recent = [...recent.slice(0, RECENT_CHAT_LIMIT - 1), kept];
  return [...pinned, ...recent];
}

/** Put a conversation first, replacing the same one instead of duplicating it. */
export function rememberSession<T>(
  sessions: readonly ChatSession<T>[],
  id: string,
  title: string,
  messages: T[],
  at = Date.now(),
  rev?: number
): ChatSession<T>[] {
  if (!messages.length) return orderSessions(sessions);
  const existing = sessions.find((s) => s.id === id);
  const entry: ChatSession<T> = {
    id,
    title: title.trim() || "New chat",
    at,
    messages,
    pinned: existing?.pinned,
    rev,
  };
  return orderSessions([entry, ...sessions.filter((s) => s.id !== id)]);
}

/** Keep a conversation at the top (or put it back in age order, never dropping it). */
export function pinSession<T>(sessions: readonly ChatSession<T>[], id: string, pinned = true): ChatSession<T>[] {
  return orderSessions(
    sessions.map((s) => (s.id === id ? { ...s, pinned: pinned || undefined } : s)),
    pinned ? undefined : id
  );
}

export function removeSession<T>(sessions: readonly ChatSession<T>[], id: string): ChatSession<T>[] {
  return sessions.filter((s) => s.id !== id);
}

export function searchSessions<T>(sessions: readonly ChatSession<T>[], query: string): ChatSession<T>[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return sessions.slice();
  return sessions.filter((s) => s.title.toLowerCase().includes(needle));
}
