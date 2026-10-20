import { useState } from "react";
import { Check, ChevronDown, ChevronRight, CircleCheck, CircleX, CodeXml, GitBranch, Loader2, Trash, Undo2, X } from "lucide-react";
import { api, type CodingFile } from "../lib/ipc";
import { cx } from "./ui";

export interface CodingStep {
  kind: string;
  text: string;
  ok?: boolean;
  detail?: string;
}

/** A coding task in a chat reply (coding.rs): its steps, plan and change. */
export interface CodingState {
  /** The task's id (its updates find this message by it, even after Stop). */
  task?: number;
  /** The project folder. */
  project: string;
  phase: "working" | "done" | "error";
  steps: CodingStep[];
  todo: [string, boolean][];
  /** Izuki's copy of the project (for Apply / Discard / Undo). */
  workspace?: string;
  files: CodingFile[];
  /** The change as a diff (not kept when the app closes — Apply works without it). */
  diff?: string;
  /** What became of the change. */
  state?: "applied" | "discarded" | "undone";
}

const folderName = (p: string) => p.replace(/[\\/]+$/, "").split(/[\\/]/).pop() || p;

/** One line of the diff, coloured the way a code review shows it. */
function DiffLine({ line }: { line: string }) {
  const kind = line.startsWith("+++") || line.startsWith("---") ? "file" : line.startsWith("+") ? "add" : line.startsWith("-") ? "del" : line.startsWith("@@") ? "hunk" : line.startsWith("diff ") ? "file" : "ctx";
  return (
    <div
      className={cx(
        "whitespace-pre px-2",
        kind === "add" && "bg-emerald-500/10 text-emerald-300",
        kind === "del" && "bg-rose-500/10 text-rose-300",
        kind === "hunk" && "text-izk-teal",
        kind === "file" && "pt-1 font-semibold text-izk-ink",
        kind === "ctx" && "text-izk-muted"
      )}
    >
      {line || " "}
    </div>
  );
}

/**
 * The live view of a coding task, Claude Code style: what it's doing, its
 * to-do list, each tool it used (folded away once done), and at the end the
 * change — files, the diff, Apply / Discard, then Undo.
 */
export function CodingPanel({ c, onChange }: { c: CodingState; onChange: (patch: Partial<CodingState>) => void }) {
  const live = c.phase === "working";
  const [open, setOpen] = useState(false);
  const [diffOpen, setDiffOpen] = useState(false);
  const [busy, setBusy] = useState<"" | "apply" | "discard" | "undo">("");
  const [said, setSaid] = useState("");
  const [failed, setFailed] = useState(false);
  const last = c.steps[c.steps.length - 1];
  const added = c.files.reduce((n, f) => n + f.added, 0);
  const removed = c.files.reduce((n, f) => n + f.removed, 0);

  const act = (what: "apply" | "discard" | "undo") => {
    if (!c.workspace || busy) return;
    setBusy(what);
    setSaid("");
    const call = what === "apply" ? api.codingApply : what === "discard" ? api.codingDiscard : api.codingUndo;
    void call(c.workspace)
      .then((text) => {
        setFailed(false);
        setSaid(text);
        onChange({ state: what === "apply" ? "applied" : what === "discard" ? "discarded" : "undone" });
      })
      .catch((e) => {
        setFailed(true);
        setSaid(String(e).replace(/^Error:\s*/, ""));
      })
      .finally(() => setBusy(""));
  };

  return (
    <div className={cx("mb-2 rounded-[12px] border px-2.5 py-2", live ? "border-izk-teal/30 bg-izk-teal/[0.06]" : "border-white/8 bg-white/[0.03]")}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="izk-no-drag flex w-full items-center gap-2 text-left" aria-expanded={open || live}>
        <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[7px] bg-izk-teal/15 text-izk-teal">
          {live ? <Loader2 size={13} className="animate-spin" /> : <CodeXml size={14} strokeWidth={2.4} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-semibold text-izk-ink">
            {live ? last?.text || "Starting…" : c.phase === "done" ? `Coding in ${folderName(c.project)}` : "Coding stopped"}
          </span>
          <span className="block truncate text-[10.5px] text-izk-muted">
            {c.steps.filter((s) => s.kind === "tool").length} steps
            {c.files.length ? ` · ${c.files.length} file${c.files.length === 1 ? "" : "s"} changed (+${added} −${removed})` : ""}
            {c.workspace ? " · in a separate copy" : ""}
          </span>
        </span>
        {!live && (open ? <ChevronDown size={14} className="text-izk-muted" /> : <ChevronRight size={14} className="text-izk-muted" />)}
      </button>

      {c.todo.length > 0 && (
        <ul className="mt-2 space-y-0.5 pl-0.5">
          {c.todo.map(([t, done], i) => (
            <li key={i} className={cx("flex items-start gap-1.5 text-[11px] leading-snug", done ? "text-izk-muted line-through" : "text-izk-ink")}>
              <span className={cx("mt-[2px] flex h-[11px] w-[11px] shrink-0 items-center justify-center rounded-[3px] border", done ? "border-izk-teal bg-izk-teal/30" : "border-white/25")}>
                {done && <Check size={8} strokeWidth={3.5} className="text-izk-teal" />}
              </span>
              {t}
            </li>
          ))}
        </ul>
      )}

      {(live || open) && c.steps.length > 0 && (
        <ol className="mt-2 max-h-[200px] space-y-1 overflow-y-auto pl-0.5">
          {(live ? c.steps.slice(-8) : c.steps).map((s, i) => (
            <li key={i} className="text-[11px] leading-tight text-izk-muted">
              <span className="flex items-center gap-1.5">
                {s.ok === true ? (
                  <CircleCheck size={12} className="shrink-0 text-izk-teal" />
                ) : s.ok === false ? (
                  <CircleX size={12} className="shrink-0 text-izk-danger" />
                ) : (
                  <span className="ml-[3px] mr-[2px] h-[5px] w-[5px] shrink-0 rounded-full bg-izk-teal/70" />
                )}
                <span className="truncate">{s.text}</span>
              </span>
              {s.detail && !live && s.ok === false && (
                <pre className="mt-1 max-h-[120px] overflow-auto rounded-[6px] bg-black/30 p-1.5 text-[10px] leading-snug text-izk-muted">{s.detail}</pre>
              )}
            </li>
          ))}
        </ol>
      )}

      {c.phase !== "working" && c.files.length > 0 && (
        <div className="mt-2 rounded-[10px] border border-white/10 bg-black/20 p-2">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-izk-ink">
            <GitBranch size={12} className="text-izk-teal" /> The change
            <span className="font-normal text-izk-muted">
              {c.state === "applied" ? "— in your files now" : c.state === "discarded" ? "— thrown away" : c.state === "undone" ? "— taken back out" : "— nothing in your files yet"}
            </span>
          </div>
          <ul className="space-y-0.5">
            {c.files.map((f) => (
              <li key={f.path} className="flex items-center gap-2 text-[11px]">
                <span className="min-w-0 flex-1 truncate font-mono text-izk-ink" title={f.path}>
                  {f.path}
                </span>
                <span className="shrink-0 tabular-nums text-emerald-300">+{f.added}</span>
                <span className="shrink-0 tabular-nums text-rose-300">−{f.removed}</span>
              </li>
            ))}
          </ul>
          {c.diff && (
            <>
              <button type="button" onClick={() => setDiffOpen((o) => !o)} className="izk-no-drag mt-1.5 flex items-center gap-1 text-[11px] text-izk-teal hover:underline" aria-expanded={diffOpen}>
                {diffOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />} {diffOpen ? "Hide the diff" : "See exactly what changed"}
              </button>
              {diffOpen && (
                <div className="mt-1 max-h-[320px] overflow-auto rounded-[6px] bg-black/40 py-1 font-mono text-[10.5px] leading-[1.45]">
                  {c.diff.split("\n").slice(0, 4000).map((l, i) => (
                    <DiffLine key={i} line={l} />
                  ))}
                </div>
              )}
            </>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {!c.state && (
              <>
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => act("apply")}
                  title="Put these changes into your files (not committed — Undo takes them back)"
                  className="izk-no-drag flex h-[28px] items-center gap-1.5 rounded-full bg-izk-teal px-3 text-[11px] font-semibold text-black hover:brightness-110 disabled:opacity-60"
                >
                  {busy === "apply" ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} strokeWidth={3} />} Apply to my files
                </button>
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => act("discard")}
                  title="Throw the copy away — your files were never touched"
                  className="izk-no-drag flex h-[28px] items-center gap-1.5 rounded-full border border-white/10 bg-white/6 px-3 text-[11px] text-izk-ink hover:bg-white/12 disabled:opacity-60"
                >
                  {busy === "discard" ? <Loader2 size={12} className="animate-spin" /> : <Trash size={12} />} Discard
                </button>
              </>
            )}
            {c.state === "applied" && (
              <button
                type="button"
                disabled={!!busy}
                onClick={() => act("undo")}
                title="Take back exactly what Izuki changed (your own edits since stay)"
                className="izk-no-drag flex h-[28px] items-center gap-1.5 rounded-full border border-white/10 bg-white/6 px-3 text-[11px] text-izk-ink hover:bg-white/12 disabled:opacity-60"
              >
                {busy === "undo" ? <Loader2 size={12} className="animate-spin" /> : <Undo2 size={12} />} Undo
              </button>
            )}
            {c.state && !said && (
              <span className="text-[11px] text-izk-muted">
                {c.state === "applied" ? "In your files." : c.state === "discarded" ? "Discarded — your files were never touched." : "Undone."}
              </span>
            )}
            {said && (
              <span className={cx("flex items-center gap-1 text-[11px]", failed ? "text-izk-danger" : "text-izk-muted")}>
                {failed && <X size={11} />} {said}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
