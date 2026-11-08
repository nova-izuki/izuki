/** One saved conversation in the Chat tab's local history. */
export interface ChatSession<T> {
  id: string;
  title: string;
  at: number;
  messages: T[];
}

/** Keep the list short enough to stay fast and easy to scan. */
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

/** Put a conversation first, replacing the same one instead of duplicating it. */
export function rememberSession<T>(
  sessions: readonly ChatSession<T>[],
  id: string,
  title: string,
  messages: T[],
  at = Date.now()
): ChatSession<T>[] {
  if (!messages.length) return sessions.slice(0, RECENT_CHAT_LIMIT);
  const entry: ChatSession<T> = {
    id,
    title: title.trim() || "New chat",
    at,
    messages,
  };
  return [entry, ...sessions.filter((s) => s.id !== id)]
    .sort((a, b) => b.at - a.at)
    .slice(0, RECENT_CHAT_LIMIT);
}

export function removeSession<T>(sessions: readonly ChatSession<T>[], id: string): ChatSession<T>[] {
  return sessions.filter((s) => s.id !== id);
}

export function searchSessions<T>(sessions: readonly ChatSession<T>[], query: string): ChatSession<T>[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return sessions.slice();
  return sessions.filter((s) => s.title.toLowerCase().includes(needle));
}
