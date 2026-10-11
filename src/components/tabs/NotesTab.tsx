import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Brain, Check, CheckSquare, Copy, Loader2, MessageSquare, MoreHorizontal, Search, Sparkles, Square, Trash2, Wand2, X } from "lucide-react";
import { api } from "../../lib/ipc";
import type { Note } from "../../lib/types";
import { sendChatCommand } from "../VoiceEngine";
import { JumpBar } from "../JumpBar";
import { EmptyState, Section, cx } from "../ui";

/** The words of a note, trimmed for asking the AI about it. */
const bodyOf = (n: Note) => n.text.slice(0, 4000);
const summarise = (notes: Note[]) =>
  void sendChatCommand(
    notes.length === 1
      ? `Summarise these notes in 3 short bullet points:\n\n${bodyOf(notes[0])}`
      : `Summarise these ${notes.length} notes together in a few short bullet points, then one line on what ties them together:\n\n${notes.map((n) => `--- ${n.title} ---\n${n.text.slice(0, 2500)}`).join("\n\n")}`
  );

/**
 * Nova Notes: study notes from anything on screen, kept on this PC — with
 * flashcards, quizzes and summaries made from them. Say "take notes on
 * this" anywhere, or tap the button here.
 */
export function NotesTab() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** Picking several notes at once (null: not picking). */
  const [picked, setPicked] = useState<Set<string> | null>(null);
  const [menu, setMenu] = useState<string | null>(null);

  const reload = useCallback(() => void api.notesList().then(setNotes).catch(() => undefined), []);
  useEffect(() => {
    reload();
    const t = setInterval(reload, 8000);
    return () => clearInterval(t);
  }, [reload]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? notes.filter((n) => `${n.title} ${n.text}`.toLowerCase().includes(q)) : notes;
  }, [notes, query]);
  const note = notes.find((n) => n.id === open) ?? null;
  const chosen = picked ? notes.filter((n) => picked.has(n.id)) : [];
  const toggle = (id: string) =>
    setPicked((p) => {
      const next = new Set(p ?? []);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const remove = async (list: Note[]) => {
    if (!list.length) return;
    const what = list.length === 1 ? `“${list[0].title}”` : `these ${list.length} notes`;
    if (!window.confirm(`Delete ${what}? This can't be undone.`)) return;
    const failed: Note[] = [];
    for (const n of list) await api.notesDelete(n.id).catch(() => failed.push(n));
    setMenu(null);
    if (failed.length) {
      // Kept selected, so trying again is one tap.
      setPicked(new Set(failed.map((n) => n.id)));
      setError(failed.length === list.length ? "Couldn't delete — try again." : `Deleted ${list.length - failed.length}; ${failed.length} couldn't be deleted — still selected, try again.`);
    } else {
      setPicked(null);
      setError(null);
    }
    if (open && list.some((n) => n.id === open && !failed.includes(n))) setOpen(null);
    reload();
  };
  const copy = (list: Note[]) => void navigator.clipboard?.writeText(list.map((n) => `${n.title}\n\n${n.text}`).join("\n\n———\n\n")).catch(() => undefined);

  const capture = async () => {
    setBusy("capture");
    setError(null);
    try {
      const n = await api.notesCapture();
      reload();
      setOpen(n.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <JumpBar topId="notes-top" jumps={[{ label: "✍️ Take notes", id: "notes-capture" }, { label: "📚 Your notes", id: "notes-list" }]} />
      <Section
        id="notes-capture"
        title="Nova Notes"
        hint="Study notes from any page, PDF or quiz — kept on this PC. Say “take notes on this” anywhere, or tap below."
      >
        <button type="button" disabled={!!busy} onClick={() => void capture()} className="izk-btn-primary flex w-full items-center justify-center gap-2 py-2.5 text-[13px] disabled:opacity-60">
          {busy === "capture" ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
          {busy === "capture" ? "Reading your screen…" : "Take notes from my screen"}
        </button>
        <p className="mt-2 text-[11px] text-izk-muted">Tip: in teacher mode, every question Izuki explains is saved here by itself.</p>
        {error && <p className="mt-2 text-[12px] text-izk-danger">{error}</p>}
      </Section>

      {note ? (
        <NoteView note={note} onBack={() => setOpen(null)} onChanged={reload} />
      ) : (
        <Section
          id="notes-list"
          title="Your notes"
          hint={notes.length ? `${notes.length} saved` : undefined}
          right={
            notes.length > 0 && (
              <button
                type="button"
                onClick={() => setPicked((p) => (p ? null : new Set()))}
                className="izk-pill izk-no-drag flex items-center gap-1 px-2.5 py-1 text-[11px]"
              >
                {picked ? <X size={12} /> : <CheckSquare size={12} />} {picked ? "Done" : "Select"}
              </button>
            )
          }
        >
          {picked && (
            <div className="izk-inset mb-2 flex flex-wrap items-center gap-1.5 rounded-[14px] px-2.5 py-2">
              <span className="mr-auto text-[12px] font-semibold text-izk-ink">{chosen.length ? `${chosen.length} selected` : "Tap notes to select them"}</span>
              <button type="button" onClick={() => setPicked(new Set(shown.map((n) => n.id)))} className="izk-pill px-2.5 py-1 text-[11px]">Select all</button>
              <button type="button" disabled={!chosen.length} onClick={() => summarise(chosen)} className="izk-pill px-2.5 py-1 text-[11px] disabled:opacity-40">Summarise</button>
              <button type="button" disabled={!chosen.length} onClick={() => copy(chosen)} className="izk-pill px-2.5 py-1 text-[11px] disabled:opacity-40">Copy</button>
              <button type="button" disabled={!chosen.length} onClick={() => void remove(chosen)} className="rounded-full bg-izk-danger/15 px-2.5 py-1 text-[11px] font-semibold text-izk-danger hover:bg-izk-danger/25 disabled:opacity-40">Delete</button>
            </div>
          )}
          {notes.length > 3 && (
            <label className="izk-field mb-2 flex items-center gap-2 py-1.5">
              <Search size={13} className="text-izk-muted" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your notes" className="min-w-0 flex-1 bg-transparent text-[12.5px] outline-none" />
            </label>
          )}
          {shown.length === 0 ? (
            <EmptyState icon={<BookOpen size={18} />} title="No notes yet" body="Open a page you're studying and tap “Take notes from my screen”." />
          ) : (
            <div className="flex flex-col gap-1.5">
              {shown.map((n) => (
                <div key={n.id} className="relative">
                  <button
                    type="button"
                    onClick={() => (picked ? toggle(n.id) : setOpen(n.id))}
                    className={cx("izk-inset flex w-full items-center gap-3 rounded-[14px] py-2.5 pl-3 pr-11 text-left transition-colors hover:bg-white/8", picked?.has(n.id) && "ring-1 ring-izk-teal/60")}
                  >
                    {picked ? (
                      picked.has(n.id) ? <CheckSquare size={17} className="shrink-0 text-izk-teal" /> : <Square size={17} className="shrink-0 text-izk-muted" />
                    ) : (
                      <span className="text-[18px]">{n.lesson ? "👩‍🏫" : "📝"}</span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-izk-ink">{n.title}</span>
                      <span className="block truncate text-[11.5px] text-izk-muted">{n.text.replace(/\s+/g, " ").slice(0, 90)}</span>
                    </span>
                    <span className="shrink-0 text-[10.5px] text-izk-muted">{new Date(n.updated_at || n.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                  </button>
                  {!picked && (
                    <button
                      type="button"
                      aria-label={`More for “${n.title}”`}
                      onClick={() => setMenu((m) => (m === n.id ? null : n.id))}
                      className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-izk-muted hover:bg-white/10 hover:text-izk-ink"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  )}
                  {menu === n.id && (
                    <NoteMenu
                      onClose={() => setMenu(null)}
                      items={[
                        { icon: <BookOpen size={13} />, label: "Open", run: () => setOpen(n.id) },
                        { icon: <Sparkles size={13} />, label: "Summarise", run: () => summarise([n]) },
                        { icon: <Brain size={13} />, label: "Quiz me", run: () => void sendChatCommand(`Quiz me on these notes — one question at a time, and tell me if I'm right:\n\n${bodyOf(n)}`) },
                        { icon: <Copy size={13} />, label: "Copy text", run: () => copy([n]) },
                        { icon: <Check size={13} />, label: "Select…", run: () => setPicked(new Set([n.id])) },
                        { icon: <Trash2 size={13} />, label: "Delete", danger: true, run: () => void remove([n]) },
                      ]}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>
      )}
    </>
  );
}

function NoteView({ note, onBack, onChanged }: { note: Note; onBack: () => void; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [question, setQuestion] = useState("");
  const body = note.text.slice(0, 4000);

  const makeCards = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.notesFlashcards(note.id);
      setCard(0);
      setFlipped(false);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section title={note.title} hint={note.source && note.source !== note.title ? note.source : undefined}>
      <button type="button" onClick={onBack} className="mb-2 text-[11.5px] text-izk-teal hover:underline">
        ← All notes
      </button>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Tool icon={<Sparkles size={15} />} label={note.cards.length ? "New cards" : "Flashcards"} busy={busy} onClick={() => void makeCards()} />
        <Tool icon={<Brain size={15} />} label="Quiz me" onClick={() => void sendChatCommand(`Quiz me on these notes — one question at a time, and tell me if I'm right:\n\n${body}`)} />
        <Tool icon={<BookOpen size={15} />} label="Summarise" onClick={() => void sendChatCommand(`Summarise these notes in 3 short bullet points:\n\n${body}`)} />
        <Tool
          icon={<Trash2 size={15} />}
          label="Delete"
          danger
          onClick={() => {
            if (!window.confirm(`Delete “${note.title}”?`)) return;
            void api.notesDelete(note.id).then(() => {
              onBack();
              onChanged();
            });
          }}
        />
      </div>
      {error && <p className="mt-2 text-[12px] text-izk-danger">{error}</p>}

      {note.cards.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className={cx(
              "flex min-h-[120px] w-full flex-col items-center justify-center rounded-[18px] border p-4 text-center transition-colors",
              flipped ? "border-izk-teal/40 bg-izk-teal/10" : "border-white/12 bg-white/[0.05]"
            )}
          >
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-izk-muted">
              {flipped ? "Answer" : `Card ${card + 1} of ${note.cards.length} — tap to flip`}
            </span>
            <span className="mt-2 text-[15px] font-semibold leading-snug text-izk-ink">{flipped ? note.cards[card][1] : note.cards[card][0]}</span>
          </button>
          <div className="mt-2 flex justify-between">
            <button type="button" disabled={card === 0} onClick={() => { setCard((c) => c - 1); setFlipped(false); }} className="izk-pill px-3 py-1 text-[11.5px] disabled:opacity-40">← Back</button>
            <button type="button" disabled={card >= note.cards.length - 1} onClick={() => { setCard((c) => c + 1); setFlipped(false); }} className="izk-pill px-3 py-1 text-[11.5px] disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}

      <form
        className="izk-field mt-3 flex items-center gap-2 py-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!question.trim()) return;
          void sendChatCommand(`Using only these notes, answer: ${question.trim()}\n\nNotes:\n${body}`);
          setQuestion("");
        }}
      >
        <MessageSquare size={13} className="text-izk-muted" />
        <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask about these notes…" className="min-w-0 flex-1 bg-transparent text-[12.5px] outline-none" />
      </form>

      <div className="mt-3 whitespace-pre-wrap rounded-[14px] bg-white/[0.04] p-3 text-[12.5px] leading-relaxed text-izk-ink">{note.text}</div>
    </Section>
  );
}

/** A note's ⋯ menu: closes on a pick, Escape, or a click anywhere else. */
function NoteMenu({ items, onClose }: { items: { icon: React.ReactNode; label: string; run: () => void; danger?: boolean }[]; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const away = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) onClose(); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    // Next tick, so the click that opened it doesn't close it.
    const t = setTimeout(() => { window.addEventListener("pointerdown", away); window.addEventListener("keydown", key); });
    return () => { clearTimeout(t); window.removeEventListener("pointerdown", away); window.removeEventListener("keydown", key); };
  }, [onClose]);
  return (
    <div ref={box} role="menu" className="izk-card absolute right-2 top-[calc(100%-6px)] z-30 flex min-w-[168px] flex-col gap-0.5 p-1.5 shadow-xl">
      {items.map((it) => (
        <button
          key={it.label}
          type="button"
          role="menuitem"
          onClick={() => { onClose(); it.run(); }}
          className={cx("flex items-center gap-2 rounded-[10px] px-2.5 py-1.5 text-left text-[12.5px] transition-colors", it.danger ? "text-izk-danger hover:bg-izk-danger/15" : "text-izk-ink hover:bg-white/10")}
        >
          {it.icon}
          {it.label}
        </button>
      ))}
    </div>
  );
}

function Tool({ icon, label, onClick, busy, danger }: { icon: React.ReactNode; label: string; onClick: () => void; busy?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className={cx(
        "flex h-[54px] flex-col items-center justify-center gap-1 rounded-[14px] text-[11.5px] font-semibold transition-colors disabled:opacity-60",
        danger ? "bg-izk-danger/10 text-izk-danger hover:bg-izk-danger/20" : "bg-white/[0.07] text-izk-ink hover:bg-white/[0.12]"
      )}
    >
      {busy ? <Loader2 size={15} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}
