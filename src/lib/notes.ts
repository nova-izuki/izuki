import type { Note } from "./types";
export function isNoteStudyPrompt(text: string): boolean {
  const split = text.indexOf("\n\n");
  if (split < 0 || !text.slice(split + 2).trim()) return false;
  const instruction = text.slice(0, split).toLowerCase();
  return ["quiz me on these notes", "summarise these notes", "summarize these notes", "using only these notes, answer:", "explain these notes in about", "teach me these notes like"].some((s) => instruction.startsWith(s))
    || /^summarise these \d+ notes together/.test(instruction);
}
export function noteStudyText(note: Note, max = 6000): string {
  const context = [note.context?.subject, note.context?.chapter, note.context?.topic].filter(Boolean).join(" / ");
  const text = note.entries?.length ? note.entries.map((e) => `${e.kind}${e.topic ? `: ${e.topic}` : ""}\n${e.text}`).join("\n\n") : note.text;
  const points = Array.from(text);
  const part = Math.floor(max / 3);
  const body = points.length <= max ? text : `${points.slice(0, part).join("")}\n[Middle omitted; recent additions follow]\n${points.slice(-(max - part)).join("")}`;
  return `${context ? `${context}\n\n` : ""}${body}`;
}

/**
 * What the notes box should rename this note to, if that's what was asked.
 *
 * The notes box sends questions to a brain, and a brain cannot edit a note —
 * it once answered "renamed to Lab 9.3.1" while the old title stayed on
 * screen. A rename is therefore done by the app itself, before any AI is
 * asked: "rename this note to Lab 9.3.1" → "Lab 9.3.1", "rename this note"
 * → "" (ask for the name), anything else → null (an ordinary question).
 */
export function renameRequest(said: string): string | null {
  const text = said.trim();
  // Renaming a file, a folder or an app is not this note; leave it alone.
  if (/^(?:please\s+)?rename\s+(?:the\s+|my\s+|this\s+)?(?:file|folder|project|app|application)\b/i.test(text)) return null;
  const m = text.match(
    /^(?:please\s+|hey izuki[,\s]+|izuki[,\s]+)?(?:(?:can|could|would)\s+you\s+)?(?:rename|retitle|re-title|change\s+the\s+(?:name|title)\s+of)\b([\s\S]*)$/i
  );
  if (!m) return null;
  const rest = m[1].trim();
  const tidy = (s: string) =>
    s
      .trim()
      // "Backups, please" → drop the please first, then the comma it left.
      .replace(/\s*,?\s*please$/i, "")
      .replace(/^["“”'`]+/, "")
      .replace(/["“”'`.,;:!?]+$/, "")
      .trim();
  // A quoted name answers itself: rename this note to "Lab 9.3.1".
  const quoted = rest.match(/["“'`]([^"”'`]+)["”'`]\s*$/);
  if (quoted) return tidy(quoted[1]);
  // The last "to"/"as"/"into" wins, so a title may contain the word itself.
  const lands = [...rest.matchAll(/\b(?:to|as|into)\s+/gi)];
  if (lands.length) return tidy(rest.slice(lands[lands.length - 1].index! + lands[lands.length - 1][0].length));
  // "rename Lab 1 to Lab 9.3.1" with no "this note": the same rule finds it.
  return "";
}
