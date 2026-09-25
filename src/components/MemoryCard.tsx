import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Brain, Plus, Trash2, X } from "lucide-react";
import { api, EV, emit, on } from "../lib/ipc";
import type { Memory } from "../lib/types";

/**
 * "What Izuki remembers about you" — the ChatGPT-style memory, made
 * visible. Facts are added by the model when you mention something lasting,
 * by saying "remember that …", or by typing one here; every one can be
 * deleted, and "forget everything" wipes the lot.
 */
export function MemoryCard() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [draft, setDraft] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  const refresh = useCallback(() => {
    void api.listMemories().then((m) => setMemories([...m].reverse()));
  }, []);

  useEffect(() => {
    refresh();
    const off = on<void>(EV.memoryChanged, refresh);
    return () => void off.then((f) => f());
  }, [refresh]);

  const add = async () => {
    const t = draft.trim();
    if (!t) return;
    setDraft("");
    await api.addMemory(t);
    void emit(EV.memoryChanged);
    refresh();
  };

  const remove = async (id: string) => {
    setMemories((m) => m.filter((x) => x.id !== id));
    await api.deleteMemory(id);
    void emit(EV.memoryChanged);
  };

  const clearAll = async () => {
    setConfirmClear(false);
    await api.clearMemories();
    void emit(EV.memoryChanged);
    refresh();
  };

  return (
    <div className="izk-card izk-grain relative overflow-hidden p-[16px]">
      <div
        className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full blur-[46px]"
        style={{ background: "radial-gradient(circle,rgba(125,200,255,0.3),transparent 70%)" }}
      />

      <div className="relative flex items-center gap-3">
        <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[15px] border border-izk-teal/30 bg-izk-teal/10 text-izk-teal">
          <Brain size={19} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[14px] font-bold tracking-[-0.015em] text-izk-ink">What Izuki remembers</h2>
          <p className="mt-0.5 text-[11px] leading-snug text-izk-muted">
            Tell it about yourself and it remembers — or say “remember that…”. Say “forget…” to
            drop something.
          </p>
        </div>
      </div>

      <div className="relative mt-3 izk-inset flex items-center gap-2 rounded-[16px] p-1.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void add();
          }}
          placeholder="Add one yourself — “I like short answers”"
          className="h-[32px] min-w-0 flex-1 bg-transparent px-2 text-[12.5px] text-izk-ink outline-none placeholder:text-izk-muted/55"
        />
        <button
          type="button"
          onClick={() => void add()}
          disabled={!draft.trim()}
          className="izk-btn-primary flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[11px] disabled:opacity-40"
          aria-label="Remember this"
        >
          <Plus size={15} strokeWidth={2.6} />
        </button>
      </div>

      <div className="relative mt-2.5 max-h-[220px] overflow-y-auto pr-0.5">
        {memories.length === 0 ? (
          <p className="py-3 text-center text-[11.5px] text-izk-muted/70">
            Nothing yet — Izuki will pick things up as you talk.
          </p>
        ) : (
          <ul className="space-y-1.5">
            <AnimatePresence initial={false}>
              {memories.map((m) => (
                <motion.li
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="group flex items-start gap-2 rounded-[12px] border border-white/8 bg-white/4 px-3 py-2"
                >
                  <span className="min-w-0 flex-1 text-[12px] leading-snug text-izk-ink">{m.text}</span>
                  <button
                    type="button"
                    onClick={() => void remove(m.id)}
                    className="izk-no-drag shrink-0 rounded-md p-0.5 text-izk-muted opacity-60 transition-opacity hover:text-izk-danger hover:opacity-100"
                    aria-label="Forget this"
                    title="Forget this"
                  >
                    <X size={13} strokeWidth={2.4} />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {memories.length > 0 && (
        <div className="relative mt-2.5 flex justify-end">
          {confirmClear ? (
            <div className="flex items-center gap-2 text-[11px] text-izk-muted">
              Forget everything?
              <button type="button" onClick={() => void clearAll()} className="izk-pill h-[26px] px-2.5 text-[11px] text-izk-danger">
                Yes, forget
              </button>
              <button type="button" onClick={() => setConfirmClear(false)} className="izk-pill h-[26px] px-2.5 text-[11px]">
                Keep
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="izk-pill izk-no-drag h-[26px] px-2.5 text-[11px] text-izk-muted"
            >
              <Trash2 size={11} strokeWidth={2.4} />
              Forget everything
            </button>
          )}
        </div>
      )}
    </div>
  );
}
