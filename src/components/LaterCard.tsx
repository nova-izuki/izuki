import { useCallback, useEffect, useState } from "react";
import { Check, ListChecks, Plus, X } from "lucide-react";
import { api, on } from "../lib/ipc";
import { cx } from "./ui";

type Item = { id: string; text: string; done: boolean; added: number };

/**
 * The Later list — things to remember with no time attached, like a sticky
 * note on the fridge. Say “remind me later I'm buying Sensodyne” (or type
 * it here) and Izuki brings it up at the right moments by itself.
 */
export function LaterCard() {
  const [items, setItems] = useState<Item[]>([]);
  const [draft, setDraft] = useState("");
  const load = useCallback(() => void api.laterList().then(setItems).catch(() => undefined), []);
  useEffect(() => {
    load();
    const off = on<void>("izuki://later-changed", load);
    return () => void off.then((f) => f());
  }, [load]);

  const add = async () => {
    const t = draft.trim();
    if (!t) return;
    setDraft("");
    await api.laterAdd(t).catch(() => undefined);
    load();
  };

  const open = items.filter((i) => !i.done);
  if (!items.length && !draft) {
    return (
      <div className="izk-card flex items-center gap-2 p-[10px] text-[11.5px] text-izk-muted">
        <ListChecks size={13} className="shrink-0 text-izk-teal" />
        <span className="min-w-0 flex-1">
          Your <b className="text-izk-ink">Later list</b> is empty — say “remind me later I'm buying toothpaste”, or add one:
        </span>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void add()}
          placeholder="Add…"
          className="izk-field izk-no-drag w-[110px] py-1 text-[11.5px]"
        />
      </div>
    );
  }
  return (
    <div className="izk-card p-[12px]">
      <div className="mb-1.5 flex items-center gap-2 text-[12px] font-semibold text-izk-ink">
        <ListChecks size={13} strokeWidth={2.4} className="text-izk-teal" /> Later list
        <span className="font-normal text-izk-muted">· {open.length ? `${open.length} to do` : "all done 🎉"}</span>
      </div>
      <div className="flex flex-col gap-0.5">
        {items.map((i) => (
          <div key={i.id} className="group flex items-center gap-2 rounded-[10px] px-1.5 py-1 hover:bg-white/5">
            <button
              type="button"
              aria-label={i.done ? "Mark not done" : "Tick off"}
              onClick={() => void api.laterDone(i.id, !i.done).then(load)}
              className={cx(
                "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition",
                i.done ? "border-izk-teal bg-izk-teal/80 text-black" : "border-white/30 hover:border-izk-teal"
              )}
            >
              {i.done && <Check size={11} strokeWidth={3} />}
            </button>
            <span className={cx("min-w-0 flex-1 truncate text-[12.5px]", i.done ? "text-izk-muted line-through" : "text-izk-ink")}>{i.text}</span>
            <button
              type="button"
              aria-label="Remove"
              onClick={() => void api.laterRemove(i.id).then(load)}
              className="opacity-0 transition group-hover:opacity-100"
            >
              <X size={12} className="text-izk-muted" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex items-center gap-1.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void add()}
          placeholder="Add something for later…"
          className="izk-field izk-no-drag min-w-0 flex-1 py-1 text-[12px]"
        />
        <button type="button" onClick={() => void add()} className="izk-pill flex h-[26px] items-center gap-1 px-2.5 text-[11px]">
          <Plus size={11} /> Add
        </button>
      </div>
    </div>
  );
}
