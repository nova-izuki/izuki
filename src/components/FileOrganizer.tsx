import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2, RotateCcw, ScanSearch } from "lucide-react";
import { Badge, Section } from "./ui";
import { api, IS_TAURI } from "../lib/ipc";
import type { OrganizerDone, OrganizerLast, OrganizerPlan, OrganizerRestored } from "../lib/types";

const size = (bytes: number) =>
  bytes >= 1_000_000_000
    ? `${(bytes / 1_000_000_000).toFixed(1)} GB`
    : bytes >= 1_000_000
      ? `${Math.round(bytes / 1_000_000)} MB`
      : bytes >= 1_000
        ? `${Math.round(bytes / 1_000)} KB`
        : `${bytes} B`;

/** The last two parts of a path: enough to tell two files apart. */
const short = (path: string) => {
  const parts = path.split(/[\\/]/).filter(Boolean);
  return parts.length <= 2 ? path : `…\\${parts.slice(-2).join("\\")}`;
};

/** `2026-11-25T18:03:11+01:00` → `25 Nov, 18:03`. */
const when = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

/** How many of the planned moves the list shows before offering "show all". */
const SHOWN = 40;

/**
 * The Smart File Organizer: the loose files on the Desktop and in Downloads,
 * sorted into one `Izuki_Organized` tree.
 *
 * Nothing here moves on its own. The first click only looks, and shows every
 * `original -> new` pair; the files move when the owner approves that list.
 * Every move is written to an undo log before it happens, so the one-click
 * undo puts everything back exactly where it came from.
 */
export function FileOrganizer() {
  const [plan, setPlan] = useState<OrganizerPlan | null>(null);
  const [done, setDone] = useState<OrganizerDone | null>(null);
  const [restored, setRestored] = useState<OrganizerRestored | null>(null);
  const [last, setLast] = useState<OrganizerLast | null>(null);
  const [busy, setBusy] = useState<"" | "preview" | "run" | "undo">("");
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [showSkipped, setShowSkipped] = useState(false);

  useEffect(() => {
    void api
      .organizerLast()
      .then(setLast)
      .catch(() => setLast(null));
  }, []);

  const preview = async () => {
    setBusy("preview");
    setError("");
    setDone(null);
    setRestored(null);
    setShowAll(false);
    try {
      setPlan(await api.organizerPlan());
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy("");
    }
  };

  const organize = async () => {
    setBusy("run");
    setError("");
    try {
      const result = await api.organizerRun();
      setDone(result);
      setPlan(null);
      setLast(await api.organizerLast());
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy("");
    }
  };

  const undo = async () => {
    setBusy("undo");
    setError("");
    setRestored(null);
    try {
      setRestored(await api.organizerUndo());
      setPlan(null);
      setDone(null);
      setLast(await api.organizerLast());
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy("");
    }
  };

  const shown = plan ? (showAll ? plan.moves : plan.moves.slice(0, SHOWN)) : [];
  const byFolder = plan
    ? plan.moves.reduce<Record<string, number>>((counts, move) => {
        counts[move.category] = (counts[move.category] ?? 0) + 1;
        return counts;
      }, {})
    : {};

  const toggle = "izk-pill izk-no-drag flex h-[30px] items-center gap-1.5 px-3 text-[11.5px] disabled:opacity-40";

  return (
    <Section
      title="Smart File Organizer"
      hint="Loose files on your Desktop and in Downloads, sorted into one folder. Projects, hidden files and anything still being written stay exactly where they are."
      right={last ? <Badge tone="good">{last.files} file(s) can be undone</Badge> : undefined}
    >
      <div className="flex flex-col gap-2.5 text-[12px] leading-snug text-izk-muted">
        <div>
          Into <b className="text-izk-ink">{plan?.root ? short(plan.root) : "Izuki_Organized"}</b>, in six folders:
          <div className="mt-1 text-[11px] text-izk-muted">
            Code_Projects · Music_Production · AI_and_Models · Installers · Documents_and_Notes · Media_and_Assets
          </div>
        </div>
        <div className="text-[11px] text-izk-muted">
          A folder with a <code className="text-izk-ink">.git</code>, <code className="text-izk-ink">package.json</code>,{" "}
          <code className="text-izk-ink">Cargo.toml</code>, <code className="text-izk-ink">pyproject.toml</code> or{" "}
          <code className="text-izk-ink">.env</code> is a project: it is never split up or moved out of. Nothing is
          ever overwritten — a name already taken becomes <code className="text-izk-ink">name_1</code>.
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => void preview()} disabled={!IS_TAURI || busy !== ""} className={toggle}>
            {busy === "preview" ? <Loader2 size={12} className="animate-spin" /> : <ScanSearch size={12} strokeWidth={2.4} />}
            {plan ? "Preview again" : "Preview what would move"}
          </button>
          {plan && plan.moves.length > 0 && (
            <button type="button" onClick={() => void organize()} disabled={busy !== ""} className={toggle}>
              {busy === "run" ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} strokeWidth={2.4} />}
              Organize {plan.moves.length} file{plan.moves.length === 1 ? "" : "s"}
            </button>
          )}
          <button
            type="button"
            onClick={() => void undo()}
            disabled={!IS_TAURI || !last || busy !== ""}
            className={toggle}
          >
            {busy === "undo" ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} strokeWidth={2.4} />}
            Undo Last Organization
          </button>
        </div>

        {!IS_TAURI && (
          <div className="text-[11px] text-izk-muted">
            This one only works inside Izuki on your PC — it needs the app to read and move real files.
          </div>
        )}

        {error && (
          <div className="flex items-start gap-1.5 rounded-xl border border-izk-danger/25 bg-izk-danger/10 p-2 text-[11.5px] text-izk-danger">
            <AlertTriangle size={12} className="mt-[1.5px] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {done && (
          <div className="rounded-xl border border-izk-good/25 bg-izk-good/10 p-2.5 text-[11.5px] text-izk-ink">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-izk-good" />
              Moved {done.moved} file{done.moved === 1 ? "" : "s"} ({size(done.bytes)}) into Izuki_Organized.
            </div>
            <div className="mt-1 text-[10.5px] text-izk-muted">
              Undo log written first: {short(done.undo_log)}
            </div>
            {done.problems.map((problem) => (
              <div key={problem} className="mt-1 text-[10.5px] text-izk-muted">
                {problem}
              </div>
            ))}
          </div>
        )}

        {restored && (
          <div className="rounded-xl border border-izk-good/25 bg-izk-good/10 p-2.5 text-[11.5px] text-izk-ink">
            <div className="flex items-center gap-1.5">
              <RotateCcw size={12} className="text-izk-good" />
              Put {restored.restored} file{restored.restored === 1 ? "" : "s"} back where they came from.
            </div>
            {restored.problems.map((problem) => (
              <div key={problem} className="mt-1 text-[10.5px] text-izk-muted">
                {problem}
              </div>
            ))}
          </div>
        )}

        {plan && plan.moves.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-[11.5px] text-izk-muted">
            Nothing loose to sort — your Desktop and Downloads are already tidy.
            {plan.skipped.length > 0 && ` (${plan.skipped.length} item(s) left alone on purpose.)`}
          </div>
        )}

        {plan && plan.moves.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5">
            <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-izk-ink">
              <Badge tone="accent">
                {plan.moves.length} file{plan.moves.length === 1 ? "" : "s"} · {size(plan.bytes)}
              </Badge>
              {Object.entries(byFolder).map(([folder, count]) => (
                <span key={folder} className="text-[10.5px] text-izk-muted">
                  {folder} {count}
                </span>
              ))}
            </div>
            <div className="mt-1 text-[10.5px] text-izk-muted">
              Looking at {plan.sources.map(short).join(", ") || "your Desktop and Downloads"}. Approving moves exactly
              this list.
            </div>

            <ul className="mt-2 max-h-[280px] overflow-y-auto pr-1 text-[11px]">
              {shown.map((move) => (
                <li
                  key={`${move.from}->${move.to}`}
                  title={`${move.from}  ->  ${move.to}`}
                  className="flex items-center gap-1.5 border-b border-white/[0.06] py-[3px] last:border-0"
                >
                  <span className="min-w-0 flex-1 truncate text-izk-muted">{short(move.from)}</span>
                  <ArrowRight size={9} className="shrink-0 text-izk-muted/60" />
                  <span className="min-w-0 flex-1 truncate text-izk-ink" title={move.to}>
                    {short(move.to)}
                  </span>
                </li>
              ))}
            </ul>
            {plan.moves.length > SHOWN && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="mt-1.5 text-[11px] text-izk-teal hover:underline"
              >
                {showAll ? "Show fewer" : `Show all ${plan.moves.length}`}
              </button>
            )}

            {plan.skipped.length > 0 && (
              <div className="mt-2 border-t border-white/[0.06] pt-2">
                <button
                  type="button"
                  onClick={() => setShowSkipped((v) => !v)}
                  className="text-[11px] text-izk-teal hover:underline"
                >
                  {showSkipped ? "Hide" : "Show"} what stays put ({plan.skipped.length}
                  {plan.skipped_more > 0 ? `+${plan.skipped_more}` : ""})
                </button>
                {showSkipped && (
                  <ul className="mt-1.5 max-h-[200px] space-y-[3px] overflow-y-auto pr-1 text-[10.5px] text-izk-muted">
                    {plan.skipped.map((skip) => (
                      <li key={`${skip.path}:${skip.why}`} title={skip.path} className="flex gap-1.5">
                        <span className="min-w-0 flex-1 truncate text-izk-ink/80">{short(skip.path)}</span>
                        <span className="shrink-0">{skip.why}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {last && (
          <div className="text-[10.5px] text-izk-muted">
            Last organization: {last.files} file(s) on {when(last.at)} into {short(last.root)}. Undo puts every one
            back exactly where it was.
          </div>
        )}
      </div>
    </Section>
  );
}
