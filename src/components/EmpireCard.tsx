import { useEffect, useState } from "react";
import { Briefcase, Globe, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { api, type Business } from "../lib/ipc";
import { Section, cx } from "./ui";

const blank = (): Business => ({ id: "", name: "", what: "", website: "", goals: [], hours: "", checks: [] });

function ago(ms: number) {
  const m = Math.round((Date.now() - ms) / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
}

/**
 * Empire (empire.rs): your business(es), a real website check, and "what
 * needs my attention" from what's actually connected. Read only — nothing
 * is bought, sent, posted or changed.
 */
export function EmpireCard() {
  const [list, setList] = useState<Business[]>([]);
  const [edit, setEdit] = useState<Business | null>(null);
  const [goals, setGoals] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [said, setSaid] = useState<string>("");
  const [error, setError] = useState("");

  useEffect(() => {
    void api.empireList().then(setList).catch(() => undefined);
  }, []);

  const run = (key: string, what: () => Promise<void>) => {
    setBusy(key);
    setError("");
    void what()
      .catch((e) => setError(String(e)))
      .finally(() => setBusy(null));
  };

  const save = () => {
    if (!edit) return;
    run("save", async () => {
      const next = await api.empireSave({ ...edit, goals: goals.split(/\n|;/).map((g) => g.trim()).filter(Boolean) });
      setList(next);
      setEdit(null);
    });
  };

  return (
    <Section
      id="apps-empire"
      title="Empire — your business"
      hint="Izuki for running a business: a real check of your website, and one briefing of what needs you — from what's actually connected. Read only; shops and payments come later, one platform at a time."
      right={
        <button type="button" disabled={busy !== null} onClick={() => run("attention", async () => setSaid(await api.empireAttention()))} className="izk-btn-primary izk-no-drag flex h-[28px] items-center gap-1.5 px-3 text-[11.5px]">
          {busy === "attention" ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} What needs me?
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {list.map((b) => {
          const last = b.checks[b.checks.length - 1];
          return (
            <div key={b.id} className="izk-inset rounded-[14px] p-3">
              <div className="flex items-center gap-2">
                <Briefcase size={14} className="text-izk-teal" />
                <span className="truncate text-[12.5px] font-semibold text-izk-ink">{b.name}</span>
                <button type="button" onClick={() => { setEdit(b); setGoals(b.goals.join("\n")); }} className="izk-pill izk-no-drag ml-auto px-2 py-[1px] text-[10.5px]">Edit</button>
                <button
                  type="button"
                  aria-label={`Remove ${b.name}`}
                  onClick={() => window.confirm(`Remove ${b.name} from Izuki? (Nothing on the website changes.)`) && run("rm", async () => setList(await api.empireRemove(b.id)))}
                  className="text-izk-muted hover:text-izk-danger"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              {b.what && <p className="mt-1 line-clamp-2 text-[11px] text-izk-muted">{b.what}</p>}
              {b.website ? (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                  <Globe size={12} className="text-izk-muted" />
                  <span className="truncate text-izk-ink">{b.website}</span>
                  {last && (
                    <span className={cx("rounded-full px-1.5 py-[1px] text-[9.5px] font-semibold", last.up ? (last.issues.length ? "bg-amber-300/15 text-amber-200" : "bg-emerald-400/15 text-emerald-300") : "bg-rose-400/15 text-rose-300")}>
                      {last.up ? (last.issues.length ? `${last.issues.length} to fix` : "All good") : "DOWN"} · {ago(last.at)}
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() =>
                      run(`check-${b.id}`, async () => {
                        const [, text] = await api.empireCheck(b.id);
                        setSaid(text);
                        setList(await api.empireList());
                      })
                    }
                    className="izk-pill izk-no-drag ml-auto flex items-center gap-1 px-2.5 py-1 text-[11px]"
                  >
                    {busy === `check-${b.id}` ? <Loader2 size={11} className="animate-spin" /> : null} Check website
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-[11px] text-izk-muted">No website yet — add one to have it checked.</p>
              )}
            </div>
          );
        })}
        {!edit && (
          <button type="button" onClick={() => { setEdit(blank()); setGoals(""); }} className="izk-no-drag flex min-h-[74px] items-center justify-center gap-1.5 rounded-[14px] border border-dashed border-white/15 text-[12px] text-izk-muted hover:border-white/30 hover:text-izk-ink">
            <Plus size={14} /> {list.length ? "Add another business" : "Add your business"}
          </button>
        )}
      </div>

      {edit && (
        <div className="izk-inset mt-2 space-y-2 rounded-[14px] p-3">
          <input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="Business name" className="izk-field izk-no-drag w-full py-1.5 text-[12px]" />
          <input value={edit.what} onChange={(e) => setEdit({ ...edit, what: e.target.value })} placeholder="What it does (e.g. I make beats and sell them online)" className="izk-field izk-no-drag w-full py-1.5 text-[12px]" />
          <input value={edit.website} onChange={(e) => setEdit({ ...edit, website: e.target.value })} placeholder="Website (optional) — e.g. mybusiness.com" className="izk-field izk-no-drag w-full py-1.5 text-[12px]" />
          <input value={edit.hours} onChange={(e) => setEdit({ ...edit, hours: e.target.value })} placeholder="Hours (optional) — e.g. Mon–Fri 9–5" className="izk-field izk-no-drag w-full py-1.5 text-[12px]" />
          <textarea value={goals} onChange={(e) => setGoals(e.target.value)} rows={2} placeholder="Goals (one per line) — e.g. 10 sales a month" className="izk-field izk-no-drag w-full resize-none py-1.5 text-[12px]" />
          <div className="flex gap-2">
            <button type="button" disabled={!edit.name.trim() || busy !== null} onClick={save} className="izk-btn-primary izk-no-drag px-3 py-1.5 text-[11.5px] disabled:opacity-40">Save</button>
            <button type="button" onClick={() => setEdit(null)} className="izk-pill izk-no-drag px-2.5 py-1 text-[11px]">Cancel</button>
          </div>
        </div>
      )}

      {said && <pre className="mt-2 max-h-[260px] overflow-y-auto whitespace-pre-wrap rounded-[12px] bg-black/25 p-2.5 text-[11.5px] leading-snug text-izk-ink">{said}</pre>}
      {error && <p className="mt-2 text-[11.5px] text-izk-danger">{error}</p>}
      <p className="mt-2 text-[10.5px] text-izk-muted">
        Ask any time: “what needs my attention?”, “check my website”, “is example.com down?”. For a morning briefing: “every weekday at 8, give me my business briefing”.
      </p>
    </Section>
  );
}
