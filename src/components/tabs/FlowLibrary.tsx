import { useEffect, useMemo, useState } from "react";
import { Layers, Pencil, Play, Search, Trash2 } from "lucide-react";
import { Badge, EmptyState, Section, cx } from "../ui";
import { useIzuki } from "../../lib/store";
import { api } from "../../lib/ipc";
import type { Flow } from "../../lib/types";

function ago(ts: number | null | undefined) {
  if (!ts) return "never";
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

export function FlowLibrary() {
  const flows = useIzuki((s) => s.flows);
  const reload = useIzuki((s) => s.reloadFlows);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    void reload();
  }, [reload]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return flows;
    return flows.filter(
      (f) =>
        f.name.toLowerCase().includes(needle) ||
        f.app.toLowerCase().includes(needle) ||
        f.prompt.toLowerCase().includes(needle)
    );
  }, [flows, q]);

  async function commitRename(f: Flow) {
    const name = draft.trim();
    setEditing(null);
    if (name && name !== f.name) {
      await api.renameFlow(f.id, name);
      await reload();
    }
  }

  return (
    <>
      <div className="relative">
        <Search
          size={14}
          strokeWidth={2.4}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-izk-muted"
        />
        <input
          className="izk-field izk-no-drag pl-[36px]"
          placeholder="Search flows, apps, prompts…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {shown.length === 0 ? (
        <EmptyState
          icon={<Layers size={30} strokeWidth={1.6} />}
          title={flows.length ? "Nothing matches" : "No flows yet"}
          body={
            flows.length
              ? "Try a different word, or clear the search."
              : "Every chain you draw is saved here automatically with a thumbnail. Replay it with one click."
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {shown.map((f) => (
            <div key={f.id} className="izk-card izk-card-hover izk-grain flex gap-3 p-2.5">
              <div className="relative h-[62px] w-[92px] shrink-0 overflow-hidden rounded-[13px] border border-white/10 bg-black/45">
                {f.thumbnail ? (
                  <img
                    src={f.thumbnail}
                    alt=""
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-izk-muted">
                    <Layers size={17} strokeWidth={1.8} />
                  </div>
                )}
                <span className="absolute bottom-1 right-1 rounded-full bg-black/70 px-1.5 py-[1px] font-mono text-[9px] text-izk-teal">
                  {f.steps.length} step{f.steps.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between py-[2px]">
                <div className="min-w-0">
                  {editing === f.id ? (
                    <input
                      autoFocus
                      className="izk-field h-[26px] px-2 py-0 text-[12.5px]"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={() => void commitRename(f)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void commitRename(f);
                        if (e.key === "Escape") setEditing(null);
                      }}
                    />
                  ) : (
                    <div className="truncate text-[12.5px] font-semibold text-izk-ink">{f.name}</div>
                  )}
                  <div className="mt-[3px] truncate text-[10.5px] text-izk-muted">{f.prompt}</div>
                </div>

                <div className="mt-1.5 flex items-center gap-1.5">
                  <Badge>{f.app || "any app"}</Badge>
                  <span className="text-[10px] text-izk-muted">
                    {f.run_count} run{f.run_count === 1 ? "" : "s"} · {ago(f.last_run)}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-center justify-center gap-1.5">
                <IconBtn
                  label="Replay"
                  accent
                  onClick={() => void api.runFlow(f.id)}
                >
                  <Play size={13} strokeWidth={2.6} fill="currentColor" />
                </IconBtn>
                <div className="flex gap-1.5">
                  <IconBtn
                    label="Rename"
                    small
                    onClick={() => {
                      setDraft(f.name);
                      setEditing(f.id);
                    }}
                  >
                    <Pencil size={11} strokeWidth={2.4} />
                  </IconBtn>
                  <IconBtn
                    label="Delete"
                    small
                    danger
                    onClick={async () => {
                      await api.deleteFlow(f.id);
                      await reload();
                    }}
                  >
                    <Trash2 size={11} strokeWidth={2.4} />
                  </IconBtn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Section
        title="Chain draw"
        hint="Draw arrow 1 → 2 → 3 in a single overlay pass and Izuki records the whole sequence as one flow — search, type, click, done."
      >
        <div className="flex items-center gap-1.5">
          {["Search", "Type", "Click"].map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[10.5px] font-medium text-izk-ink">
                {i + 1}. {s}
              </span>
              {i < 2 && <span className="text-izk-teal">→</span>}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function IconBtn({
  children,
  onClick,
  label,
  accent,
  danger,
  small,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  accent?: boolean;
  danger?: boolean;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cx(
        "izk-no-drag flex items-center justify-center rounded-full border transition-all duration-200 active:scale-90",
        small ? "h-[22px] w-[22px]" : "h-[30px] w-[30px]",
        accent
          ? "border-white/25 text-[#0b0a12] shadow-[0_6px_18px_rgba(124,92,255,0.4)]"
          : danger
            ? "border-white/10 bg-white/5 text-izk-muted hover:border-izk-danger/40 hover:bg-izk-danger/18 hover:text-izk-danger"
            : "border-white/10 bg-white/5 text-izk-muted hover:bg-white/12 hover:text-izk-ink"
      )}
      style={accent ? { background: "linear-gradient(135deg,#7C5CFF,#4ECDC4)" } : undefined}
    >
      {children}
    </button>
  );
}
