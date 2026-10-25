import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Brain, Check, CheckSquare, ChevronDown, ChevronRight, Copy, FolderTree, Loader2, MessageSquare, MoreHorizontal, Search, Sparkles, Square, Trash2, Wand2, X } from "lucide-react";
import { api, on } from "../../lib/ipc";
import type { Note } from "../../lib/types";
import { noteStudyText } from "../../lib/notes";
import { sendChatCommand } from "../VoiceEngine";
import { JumpBar } from "../JumpBar";
import { CampusHub } from "../CampusHub";
import { EmptyState, Row, Section, Toggle, cx } from "../ui";
import { useIzuki } from "../../lib/store";

/** The words of a note, trimmed for asking the AI about it. */
const bodyOf = (n: Note) => noteStudyText(n);
const summarise = (notes: Note[]) =>
  void sendChatCommand(
    notes.length === 1
      ? `Summarise these notes in 3 short bullet points:\n\n${bodyOf(notes[0])}`
      : `Summarise these ${notes.length} notes together in a few short bullet points, then one line on what ties them together:\n\n${notes.map((n) => `--- ${n.title} ---\n${n.text.slice(0, 2500)}`).join("\n\n")}`
  );

/** "Chapter 5" → 5 (so chapters sort 1, 2, … 10, not 1, 10, 2). */
const chapterNumber = (c: string) => {
  const m = /(\d+(?:\.\d+)?)/.exec(c);
  return m ? parseFloat(m[1]) : Number.POSITIVE_INFINITY;
};

/** Notes by subject (the newest subject first), each in chapter order. */
function bySubject(notes: Note[]): Array<{ subject: string; notes: Note[] }> {
  const groups = new Map<string, Note[]>();
  for (const n of notes) {
    const subject = n.context?.subject?.trim() || "Other notes";
    groups.set(subject, [...(groups.get(subject) ?? []), n]);
  }
  const newest = (list: Note[]) => Math.max(...list.map((n) => n.updated_at || n.created_at));
  return [...groups.entries()]
    .map(([subject, list]) => ({
      subject,
      notes: [...list].sort(
        (a, b) =>
          chapterNumber(a.context?.chapter ?? "") - chapterNumber(b.context?.chapter ?? "") ||
          (a.context?.topic ?? "").localeCompare(b.context?.topic ?? "") ||
          (b.updated_at || b.created_at) - (a.updated_at || a.created_at)
      ),
    }))
    .sort((a, b) => (a.subject === "Other notes" ? 1 : b.subject === "Other notes" ? -1 : newest(b.notes) - newest(a.notes)));
}

/** **bold** inside a line, kept as text (never HTML). */
function inline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={i} className="font-semibold text-izk-ink">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

/** A note laid out to study from: its sections as headings you can jump to,
 *  bullets as a list, key terms in bold — not raw "## …" text. */
function NoteBody({ text }: { text: string }) {
  const lines = text.split(/\r?\n/);
  const sections = lines.filter((l) => /^##\s+/.test(l)).map((l) => l.replace(/^##\s+/, "").trim());
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (!list.length) return;
    const items = list;
    list = [];
    blocks.push(
      <ul key={`ul${blocks.length}`} className="mb-2 ml-4 list-disc space-y-0.5">
        {items.map((it, i) => (
          <li key={i}>{inline(it)}</li>
        ))}
      </ul>
    );
  };
  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    if (/^\s*[-*•]\s+/.test(line) || /^\s*\d+[.)]\s+/.test(line)) {
      list.push(line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, ""));
      return;
    }
    flush();
    if (/^##\s+/.test(line)) {
      const title = line.replace(/^##\s+/, "").trim();
      blocks.push(
        <h4 key={i} id={`note-sec-${sections.indexOf(title)}`} className="mb-1 mt-3 scroll-mt-3 text-[11px] font-bold uppercase tracking-[0.12em] text-izk-teal first:mt-0">
          {title}
        </h4>
      );
    } else if (/^###\s+/.test(line)) {
      blocks.push(
        <h5 key={i} className="mb-0.5 mt-2 text-[12.5px] font-semibold text-izk-ink">
          {inline(line.replace(/^###\s+/, ""))}
        </h5>
      );
    } else if (line.trim()) {
      blocks.push(
        <p key={i} className="mb-1.5">
          {inline(line)}
        </p>
      );
    }
  });
  flush();
  return (
    <>
      {sections.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {sections.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => document.getElementById(`note-sec-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="izk-pill px-2 py-0.5 text-[10.5px]"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <div className="mt-2 rounded-[14px] bg-white/[0.04] p-3 text-[12.5px] leading-relaxed text-izk-ink/90">{blocks}</div>
    </>
  );
}

/**
 * Izuki Notes: study notes from anything on screen, kept on this PC — with
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

  const reloadSequence = useRef(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const reload = useCallback(() => {
    const mine = ++reloadSequence.current;
    void api.notesList().then((next) => {
      if (reloadSequence.current !== mine) return;
      setNotes(next); setLoadError(null);
    }).catch((e) => {
      if (reloadSequence.current === mine) setLoadError(e instanceof Error ? e.message : String(e));
    });
  }, []);
  useEffect(() => {
    reload();
    const t = setInterval(() => { if (!document.hidden) reload(); }, 30_000);
    // A note saved by asking ("save this to my notes"): shown at once.
    const off = on<void>("izuki://notes-changed", reload);
    return () => {
      clearInterval(t);
      reloadSequence.current++;
      void off.then((f) => f());
    };
  }, [reload]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? notes.filter((n) => `${n.title} ${n.text} ${n.context?.subject ?? ""} ${n.context?.chapter ?? ""} ${n.context?.topic ?? ""}`.toLowerCase().includes(q)) : notes;
  }, [notes, query]);
  const groups = useMemo(() => (query.trim() ? [{ subject: "", notes: shown }] : bySubject(shown)), [shown, query]);
  /** Subjects folded away. */
  const [folded, setFolded] = useState<Set<string>>(new Set());
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

  const studyLog = useIzuki((s) => s.settings.study_log);
  const patch = useIzuki((s) => s.patchSettings);

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
      <JumpBar topId="notes-top" jumps={[{ label: "🎓 Campus", id: "notes-campus" }, { label: "✍️ Take notes", id: "notes-capture" }, { label: "📚 Your notes", id: "notes-list" }]} />
      <CampusHub
        onNote={(id) => {
          reload();
          setOpen(id);
        }}
      />
      <Section
        id="notes-capture"
        title="Izuki Notes"
        hint="Study notes from any page, PDF or quiz — kept on this PC. Say “take notes on this” anywhere, or tap below."
      >
        <button type="button" disabled={!!busy} onClick={() => void capture()} className="izk-btn-primary flex w-full items-center justify-center gap-2 py-2.5 text-[13px] disabled:opacity-60">
          {busy === "capture" ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
          {busy === "capture" ? "Reading your screen…" : "Take notes from my screen"}
        </button>
        <div className="mt-2">
          <Row label="Study log" hint="Every question you ask — typed, spoken or from your phone — saved here with its answer explained, in one note a day. Or just say “save every question and answer to my notes”.">
            <Toggle checked={studyLog} onChange={(v) => patch({ study_log: v })} />
          </Row>
        </div>
        <p className="mt-2 text-[11px] text-izk-muted">Tip: in teacher mode, every question Izuki explains is saved here by itself.</p>
        {error && <p className="mt-2 text-[12px] text-izk-danger">{error}</p>}
        {loadError && <div role="alert" className="mt-2 text-[12px] text-izk-danger">{loadError} <button type="button" onClick={reload} className="underline">Try loading again</button></div>}
      </Section>

      {note ? (
        <NoteView key={note.id} note={note} onBack={() => setOpen(null)} onChanged={reload} />
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
              {groups.map((g) => (
                <div key={g.subject || "results"} className="flex flex-col gap-1.5">
                  {g.subject && (groups.length > 1 || g.subject !== "Other notes") && (
                    <button
                      type="button"
                      onClick={() =>
                        setFolded((f) => {
                          const next = new Set(f);
                          if (next.has(g.subject)) next.delete(g.subject);
                          else next.add(g.subject);
                          return next;
                        })
                      }
                      className="mt-1 flex items-center gap-1.5 px-1 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-izk-muted hover:text-izk-ink"
                    >
                      {folded.has(g.subject) ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                      <span className="truncate">{g.subject}</span>
                      <span className="font-normal normal-case tracking-normal">· {g.notes.length}</span>
                    </button>
                  )}
                  {!folded.has(g.subject) && g.notes.map((n) => (
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
                      {(n.context?.chapter || n.context?.topic || (n.entries?.length ?? 0) > 1) && (
                        <span className="mt-0.5 flex flex-wrap items-center gap-1">
                          {n.context?.chapter && <span className="rounded-full bg-izk-teal/15 px-1.5 py-[1px] text-[10px] font-semibold text-izk-teal">{n.context.chapter}</span>}
                          {n.context?.topic && <span className="max-w-[160px] truncate rounded-full bg-white/8 px-1.5 py-[1px] text-[10px] text-izk-muted">{n.context.topic}</span>}
                          {(n.entries?.length ?? 0) > 1 && <span className="text-[10px] text-izk-muted">{n.entries!.length} additions</span>}
                        </span>
                      )}
                      <span className="block truncate text-[11.5px] text-izk-muted">{n.text.replace(/^#+\s+.*$/gm, "").replace(/\s+/g, " ").trim().slice(0, 90)}</span>
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
                        { icon: <Brain size={13} />, label: "Quiz me", run: () => void api.notesFocus(n.id, true).then(() => sendChatCommand(`Quiz me on these notes — one question at a time, and tell me if I'm right:\n\n${bodyOf(n)}`)).catch((e) => setError(e instanceof Error ? e.message : String(e))) },
                        { icon: <Sparkles size={13} />, label: "Explain in 60 seconds", run: () => void sendChatCommand(`Explain these notes in about 60 seconds of reading: simple words, the 3 ideas that matter most, and one real-life example. Say which parts come from the notes and which are your own examples.\n\n${bodyOf(n)}`) },
                        { icon: <BookOpen size={13} />, label: "Teach me like a beginner", run: () => void sendChatCommand(`Teach me these notes like I'm a complete beginner, step by step (about 5 minutes): an everyday analogy for each idea, then a quick question to check I understood before moving on. Keep to what the notes say; label anything you add.\n\n${bodyOf(n)}`) },
                        { icon: <Copy size={13} />, label: "Copy text", run: () => copy([n]) },
                        { icon: <Check size={13} />, label: "Select…", run: () => setPicked(new Set([n.id])) },
                        { icon: <Trash2 size={13} />, label: "Delete", danger: true, run: () => void remove([n]) },
                      ]}
                    />
                  )}
                </div>
                  ))}
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
  /** Cards marked this time through: index → right. */
  const [marked, setMarked] = useState<Record<number, boolean>>({});
  const cardsKey = useMemo(() => JSON.stringify(note.cards), [note.cards]);
  useEffect(() => { setMarked({}); setCard(0); setFlipped(false); }, [note.id, cardsKey]);
  const mark = (right: boolean) => {
    if (card in marked || !note.cards[card]) return;
    const [q, a] = note.cards[card];
    setMarked((m) => ({ ...m, [card]: right }));
    void api.studyMark(note.title, q, a, right).catch(() => undefined);
    if (card < note.cards.length - 1) {
      setCard((c) => c + 1);
      setFlipped(false);
    }
  };
  const [question, setQuestion] = useState("");
  const body = bodyOf(note);
  /** Changing where this note is filed (subject / chapter / topic). */
  const [filing, setFiling] = useState<{ subject: string; chapter: string; topic: string } | null>(null);
  const saveFiling = async () => {
    if (!filing) return;
    setBusy(true);
    setError(null);
    try {
      await api.notesOrganize(note.id, filing.subject, filing.chapter, filing.topic);
      setFiling(null);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };
  const filedUnder = [note.context?.subject, note.context?.chapter, note.context?.topic].filter((x) => x && x.trim());

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
      <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[11.5px] text-izk-muted">
        <FolderTree size={13} />
        {filedUnder.length ? <span className="text-izk-ink">{filedUnder.join(" › ")}</span> : <span>Not filed under a subject yet</span>}
        {(note.entries?.length ?? 0) > 1 && <span>· {note.entries!.length} additions</span>}
        <button
          type="button"
          onClick={() => setFiling(filing ? null : { subject: note.context?.subject ?? "", chapter: note.context?.chapter ?? "", topic: note.context?.topic ?? "" })}
          className="ml-auto text-izk-teal hover:underline"
        >
          {filing ? "Cancel" : "Change"}
        </button>
      </div>
      {filing && (
        <form
          className="izk-inset mb-2 grid grid-cols-1 gap-1.5 rounded-[14px] p-2 sm:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            void saveFiling();
          }}
        >
          <input value={filing.subject} onChange={(e) => setFiling({ ...filing, subject: e.target.value })} placeholder="Subject (Biology 101)" className="izk-field py-1 text-[12px]" />
          <input value={filing.chapter} onChange={(e) => setFiling({ ...filing, chapter: e.target.value })} placeholder="Chapter (Chapter 5)" className="izk-field py-1 text-[12px]" />
          <input value={filing.topic} onChange={(e) => setFiling({ ...filing, topic: e.target.value })} placeholder="Topic (Cells)" className="izk-field py-1 text-[12px]" />
          <button type="submit" disabled={busy} className="izk-btn-primary py-1 text-[12px] disabled:opacity-60 sm:col-span-3">
            Save — later notes on this go here too
          </button>
        </form>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Tool icon={<Sparkles size={15} />} label={note.cards.length ? "New cards" : "Flashcards"} busy={busy} onClick={() => void makeCards()} />
        <Tool
          icon={<Brain size={15} />}
          label="Quiz me"
          onClick={() => void api.notesFocus(note.id, true).then(() => sendChatCommand(`Quiz me on these notes — one question at a time, and tell me if I'm right:\n\n${body}`)).catch((e) => setError(e instanceof Error ? e.message : String(e)))}
        />
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
            <span className="mt-2 text-[15px] font-semibold leading-snug text-izk-ink">{note.cards[Math.min(card, note.cards.length - 1)]?.[flipped ? 1 : 0]}</span>
          </button>
          {flipped && !(card in marked) && (
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={() => mark(false)} className="izk-pill flex-1 justify-center py-1.5 text-[12px] text-rose-200">
                ✗ Missed it
              </button>
              <button type="button" onClick={() => mark(true)} className="izk-pill flex-1 justify-center py-1.5 text-[12px] text-emerald-200">
                ✓ Got it
              </button>
            </div>
          )}
          {Object.keys(marked).length > 0 && (
            <p className="mt-1.5 text-center text-[11px] text-izk-muted">
              {Object.values(marked).filter(Boolean).length} of {Object.keys(marked).length} right this time — cards you keep missing show up in Campus → Your study.
            </p>
          )}
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

      <NoteBody text={note.text} />
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
