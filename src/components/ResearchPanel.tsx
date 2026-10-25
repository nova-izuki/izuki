import { useState } from "react";
import { BookOpen, ChevronDown, ChevronRight, Eye, Monitor, Search, SearchCheck } from "lucide-react";
import { api, type ResearchSource, type ResearchUpdate } from "../lib/ipc";
import { cx } from "./ui";

export interface ResearchStep {
  kind: ResearchUpdate["kind"];
  text: string;
  url?: string;
  site?: string;
}

/** A deep research in a chat reply (research.rs). */
export interface ResearchState {
  question: string;
  phase: "working" | "done" | "error";
  steps: ResearchStep[];
  sources: ResearchSource[];
}

/** Carrying on an earlier research (mirrors `research::continues`). */
const CARRY_ON = /^(?:continue (?:(?:the|my|that|this) )?research(?:ing)?|keep researching|resume (?:the |my )?research|pick up the research|pick the research back up|research (?:more|further)|do more research)(?![a-z0-9])/i;
/** Vaguer: right after a research reply only (elsewhere "go deeper" means "explain more"). */
const DEEPER = /^(?:dig deeper|go deeper|look deeper|keep digging)(?![a-z0-9])/i;

/**
 * "Research …", "deep research on …", "do a deep dive into …": the question
 * (mirrors `research::asks`), or null. "Continue the research", "research
 * more about …" (and, after a research reply, "dig deeper …") carry on the
 * kept one: the whole request goes through.
 */
export function researchAsk(said: string, afterResearch = false): string | null {
  const t = said.trim();
  if (CARRY_ON.test(t) || (afterResearch && DEEPER.test(t))) return t.replace(/[.!?]+$/, "");
  const m = said
    .trim()
    .match(/^(?:do (?:a |some )?)?(?:deep research|deep dive|deep search|research)(?: (?:on|about|into|this|for))?[:\s]+(.+)$/i);
  if (!m) return null;
  const q = m[1].trim().replace(/[.!]+$/, "");
  return q.split(/\s+/).length >= 2 ? q : null;
}

/** The "computer with an eye" — Izuki looking at the web; it scans while working. */
export function ComputerEye({ live, size = 18 }: { live: boolean; size?: number }) {
  return (
    <span className={cx("izk-research-eye relative inline-flex shrink-0 items-center justify-center", live && "is-live")} style={{ width: size + 6, height: size + 6 }}>
      <Monitor size={size} strokeWidth={2} className="text-izk-teal" />
      <Eye size={Math.round(size * 0.5)} strokeWidth={2.6} className="izk-research-pupil absolute text-izk-teal" style={{ top: Math.round(size * 0.22) }} />
    </span>
  );
}

function SiteBadge({ site }: { site?: string }) {
  const s = (site || "?").replace(/^www\./, "");
  return (
    <span className="flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-[5px] bg-white/10 text-[9px] font-bold uppercase text-izk-ink" title={s}>
      {s[0]}
    </span>
  );
}

function stepLabel(s: ResearchStep): string {
  switch (s.kind) {
    case "search":
      return `Searched: ${s.text}`;
    case "read":
      return s.text || s.site || "A page";
    case "skip":
      return `Couldn't open: ${s.text || s.site}`;
    default:
      return s.text;
  }
}

/** What it's doing right now, in a few words. */
function nowDoing(r: ResearchState): string {
  const last = r.steps[r.steps.length - 1];
  if (!last) return "Starting…";
  if (last.kind === "search") return `Searching: ${last.text}`;
  if (last.kind === "read") return `Reading ${last.site ?? "a page"}…`;
  if (last.kind === "skip") return "Looking for another page…";
  return last.text;
}

/**
 * The live view of a deep research (Perplexity/Comet style): the computer
 * with an eye and what it's doing, every search and page as a step (folded
 * away once done), and at the end the sources and "Save to Notes".
 */
export function ResearchPanel({ r, footer, text, onContinue }: { r: ResearchState; footer?: boolean; text?: string; onContinue?: () => void }) {
  const live = r.phase === "working";
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<"" | "saving" | "saved" | string>("");
  const searches = r.steps.filter((s) => s.kind === "search").length;
  const pages = r.steps.filter((s) => s.kind === "read").length;

  if (footer) {
    return (
      <div className="mt-2 border-t border-white/8 pt-2">
        {r.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {r.sources.map((s) => (
              <button
                key={s.n}
                type="button"
                title={`${s.title}\n${s.url}`}
                onClick={() => void api.openUrl(s.url)}
                className="izk-no-drag flex max-w-[220px] items-center gap-1.5 rounded-full border border-white/10 bg-white/6 py-[3px] pl-1 pr-2.5 text-[11px] text-izk-ink hover:bg-white/12"
              >
                <span className="flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-izk-teal/20 px-1 text-[9.5px] font-bold text-izk-teal">{s.n}</span>
                <span className="truncate">{s.site || s.title}</span>
              </button>
            ))}
          </div>
        )}
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            disabled={saved === "saving" || saved === "saved"}
            onClick={() => {
              setSaved("saving");
              void api
                .researchSave(r.question, text ?? "")
                .then(() => setSaved("saved"))
                .catch((e) => {
                  console.error("research save failed", e);
                  setSaved("Couldn't save it — try again.");
                });
            }}
            className="izk-no-drag flex h-[26px] items-center gap-1.5 rounded-full border border-white/10 bg-white/6 px-2.5 text-[11px] text-izk-ink hover:bg-white/12 disabled:opacity-60"
          >
            <BookOpen size={12} strokeWidth={2.4} />
            {saved === "saved" ? "Saved to Notes ✓" : saved === "saving" ? "Saving…" : "Save to Notes"}
          </button>
          {onContinue && (
            <button
              type="button"
              onClick={onContinue}
              title="Carry on from these sources: search for what's still missing and update the answer"
              className="izk-no-drag flex h-[26px] items-center gap-1.5 rounded-full border border-white/10 bg-white/6 px-2.5 text-[11px] text-izk-ink hover:bg-white/12"
            >
              <SearchCheck size={12} strokeWidth={2.4} />
              Dig deeper
            </button>
          )}
          {saved && saved !== "saving" && saved !== "saved" && <span className="text-[10.5px] text-izk-danger">{saved}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className={cx("mb-2 rounded-[12px] border px-2.5 py-2", live ? "izk-research-live border-izk-teal/30 bg-izk-teal/[0.06]" : "border-white/8 bg-white/[0.03]")}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="izk-no-drag flex w-full items-center gap-2 text-left" aria-expanded={open || live}>
        <ComputerEye live={live} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-semibold text-izk-ink">
            {live ? nowDoing(r) : r.phase === "done" ? "Deep research" : "Research stopped"}
          </span>
          <span className="block text-[10.5px] text-izk-muted">
            {searches} search{searches === 1 ? "" : "es"} · {pages} page{pages === 1 ? "" : "s"} read
            {r.phase === "done" && r.sources.length ? ` · ${r.sources.length} cited` : ""}
          </span>
        </span>
        {!live && (open ? <ChevronDown size={14} className="text-izk-muted" /> : <ChevronRight size={14} className="text-izk-muted" />)}
      </button>
      {(live || open) && r.steps.length > 0 && (
        <ol className="mt-2 max-h-[180px] space-y-1 overflow-y-auto pl-0.5">
          {(live ? r.steps.slice(-8) : r.steps).map((s, i) => (
            <li key={i} className={cx("flex items-center gap-2 text-[11px] leading-tight", s.kind === "skip" ? "text-izk-muted/60 line-through" : "text-izk-muted")}>
              {s.kind === "search" ? (
                <Search size={12} strokeWidth={2.4} className="shrink-0 text-izk-teal" />
              ) : s.kind === "read" || s.kind === "skip" ? (
                <SiteBadge site={s.site} />
              ) : (
                <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-izk-teal/70" />
              )}
              <span className="truncate">{stepLabel(s)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
