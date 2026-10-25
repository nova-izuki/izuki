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
