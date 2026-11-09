/** One saved conversation in the Chat tab's local history. */
export interface ChatSession<T> {
  id: string;
  title: string;
  at: number;
  messages: T[];
  /** Kept at the top of Recent chats and never dropped by the recent cap. */
  pinned?: boolean;
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

/** Pinned chats first, then the newest unpinned ones (pins are extra, never dropped). */
export function orderSessions<T>(sessions: readonly ChatSession<T>[]): ChatSession<T>[] {
  const pinned = sessions.filter((s) => s.pinned).sort((a, b) => b.at - a.at);
  const recent = sessions
    .filter((s) => !s.pinned)
    .sort((a, b) => b.at - a.at)
    .slice(0, RECENT_CHAT_LIMIT);
  return [...pinned, ...recent];
}

/** Put a conversation first, replacing the same one instead of duplicating it. */
export function rememberSession<T>(
  sessions: readonly ChatSession<T>[],
  id: string,
  title: string,
  messages: T[],
  at = Date.now()
): ChatSession<T>[] {
  if (!messages.length) return orderSessions(sessions);
  const existing = sessions.find((s) => s.id === id);
  const entry: ChatSession<T> = {
    id,
    title: title.trim() || "New chat",
    at,
    messages,
    pinned: existing?.pinned,
  };
  return orderSessions([entry, ...sessions.filter((s) => s.id !== id)]);
}

/** Keep a conversation at the top (or put it back in age order). */
export function pinSession<T>(sessions: readonly ChatSession<T>[], id: string, pinned = true): ChatSession<T>[] {
  return orderSessions(
    sessions.map((s) => (s.id === id ? { ...s, pinned: pinned || undefined } : s))
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
