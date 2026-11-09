/** One saved conversation in the Chat tab's local history. */
export interface ChatSession<T> {
  id: string;
  title: string;
  at: number;
  messages: T[];
  /** Kept at the top of Recent chats and never dropped by the recent cap. */
  pinned?: boolean;
  /** The title was chosen by the person, not generated from their first line. */
  renamed?: boolean;
}

/**
 * Keep the unpinned list long enough for real work, but not unbounded: every
 * message copy lives in local storage. Pinned chats are extra and never
 * dropped by this limit.
 */
export const RECENT_CHAT_LIMIT = 50;

/** A short title from the first thing the person asked. */
export function chatTitle(messages: ReadonlyArray<{ role: string; content?: string }>): string {
  const source = messages.find((m) => m.role === "user" && (m.content ?? "").trim())?.content ?? "";
  const plain = source
    .replace(/[`*#>]/g, "")
    .replace(/[\[\]]/g, "")
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

/** Pinned chats first, then the newest unpinned ones. */
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
  return orderSessions([
    {
      id,
      // A name the person chose is never overwritten by the auto title on the
      // next message.
      title: existing?.renamed ? existing.title : title.trim() || "New chat",
      at,
      messages,
      pinned: existing?.pinned,
      renamed: existing?.renamed,
    },
    ...sessions.filter((s) => s.id !== id),
  ]);
}

/** Keep a conversation at the top (or put it back in age order). */
export function pinSession<T>(sessions: readonly ChatSession<T>[], id: string, pinned = true): ChatSession<T>[] {
  return orderSessions(
    sessions.map((s) => (s.id === id ? { ...s, pinned: pinned || undefined } : s))
  );
}

/** Rename without changing its place in history. */
export function renameSession<T>(sessions: readonly ChatSession<T>[], id: string, title: string): ChatSession<T>[] {
  const clean = title.trim().replace(/\s+/g, " ").slice(0, 80);
  if (!clean) return sessions.slice();
  return orderSessions(sessions.map((s) => (s.id === id ? { ...s, title: clean, renamed: true } : s)));
}

export function removeSession<T>(sessions: readonly ChatSession<T>[], id: string): ChatSession<T>[] {
  return sessions.filter((s) => s.id !== id);
}

/** Remove every saved chat. Call only after an explicit confirmation. */
export function clearSessions<T>(): ChatSession<T>[] {
  return [];
}

/** Search both the title and the conversation text. */
export function searchSessions<T>(sessions: readonly ChatSession<T>[], query: string): ChatSession<T>[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return sessions.slice();
  return sessions.filter((s) => {
    if (s.title.toLowerCase().includes(needle)) return true;
    return s.messages.some((m) => {
      const content = (m as { content?: unknown } | null)?.content;
      return typeof content === "string" && content.toLowerCase().includes(needle);
    });
  });
}
