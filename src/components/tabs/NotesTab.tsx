import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Brain, Loader2, MessageSquare, Search, Sparkles, Trash2, Wand2 } from "lucide-react";
import { api } from "../../lib/ipc";
import type { Note } from "../../lib/types";
import { sendChatCommand } from "../VoiceEngine";
import { EmptyState, Section, cx } from "../ui";

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
      <Section
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
        <Section title="Your notes" hint={notes.length ? `${notes.length} saved` : undefined}>
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
                <button key={n.id} type="button" onClick={() => setOpen(n.id)} className="izk-inset flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-left transition-colors hover:bg-white/8">
                  <span className="text-[18px]">{n.lesson ? "👩‍🏫" : "📝"}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-izk-ink">{n.title}</span>
                    <span className="block truncate text-[11.5px] text-izk-muted">{n.text.replace(/\s+/g, " ").slice(0, 90)}</span>
                  </span>
                  <span className="shrink-0 text-[10.5px] text-izk-muted">{new Date(n.updated_at || n.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                </button>
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
