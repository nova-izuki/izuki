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
export function renameRequest(said: string, currentTitle?: string): string | null {
  const text = said.trim().replace(/^(?:(?:please|hey\s+izuki|izuki)[,\s]+|(?:can|could|would)\s+you\s+)+/i, "");
  // Renaming a file, a folder or an app is not this note; leave it alone.
  const m = text.match(
    /^(?:rename|retitle|re-title|change\s+the\s+(?:name|title)\s+of)\b([\s\S]*)$/i
  );
  if (!m) return null;
  const rest = m[1].trim();
  if (/^(?:(?:the|my|this|that|a|an|these|those)\s+)?(?:files?|folders?|projects?|apps?|applications?|attachments?)\b/i.test(rest)) return null;
  const tidy = (s: string) => {
    const title = s.trim().replace(/\s*,?\s*please[.!?]?$/i, "").trim();
    const quoted = title.match(/^["“'`]([\s\S]*)["”'`][.!?]?$/);
    return quoted ? quoted[1].trim() : title.replace(/[.,;:!?]+$/, "").trim();
  };
  // An existing title can contain "to" too. Prefer the note's actual name
  // (or an explicitly quoted old name) over a delimiter inside that name.
  if (currentTitle && rest.toLowerCase().startsWith(currentTitle.toLowerCase())) {
    const after = rest.slice(currentTitle.length).match(/^\s+(?:to|as|into)\s+([\s\S]+)$/i);
    if (after) return tidy(after[1]);
  }
  const quotedFrom = rest.match(/^(?:"([^"]+)"|“([^”]+)”|'([^']+)'|`([^`]+)`)\s+(?:to|as|into)\s+([\s\S]+)$/i);
  if (quotedFrom) {
    const from = quotedFrom[1] ?? quotedFrom[2] ?? quotedFrom[3] ?? quotedFrom[4];
    if (currentTitle && from.trim().toLowerCase() !== currentTitle.trim().toLowerCase()) return null;
    return tidy(quotedFrom[5]);
  }
  if (/^(?:(?:the|my|this|that|a|an|these|those)\s+)?(?:sections?|headings?|chapters?|topics?|subjects?|cards?|variables?|functions?|columns?|tabs?)\b/i.test(rest)) return null;
  // Split at the first destination marker: "Intro to Biology" is one title.
  // Quoted titles without a marker work too, but never rename other objects.
  const lands = rest.match(/\b(?:to|as|into)\s+/i);
  const currentSubject = (subject: string) => !currentTitle || /^(?:(?:this|that|the|my)\s+)?(?:note|notes|title|it|this|that)$/i.test(subject.trim()) || subject.trim().toLowerCase() === currentTitle.trim().toLowerCase();
  if (lands) return currentSubject(rest.slice(0, lands.index)) ? tidy(rest.slice(lands.index! + lands[0].length)) : null;
  const quoted = rest.match(/["“'`]([^"”'`]+)["”'`]\s*$/);
  if (quoted) return currentSubject(rest.slice(0, quoted.index)) ? tidy(quoted[1]) : null;
  // "rename Lab 1 to Lab 9.3.1" with no "this note": the same rule finds it.
  return currentSubject(rest) || !rest ? "" : null;
}
