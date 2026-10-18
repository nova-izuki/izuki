import { useCallback, useEffect, useState } from "react";
import { BookOpen, GraduationCap, Loader2, Plus, Trash2, TrendingUp } from "lucide-react";
import { api, type Shelf, type StudyWeek } from "../lib/ipc";
import { sendChatCommand } from "./VoiceEngine";
import { cx } from "./ui";

/**
 * Campus, part two: textbooks you can ask about by chapter or page
 * (textbook.rs), Blackboard grades, announcements and materials read with
 * your own sign-in (blackboard.rs), and your study week with the mistakes
 * you keep making (studytrack.rs).
 */

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export function Textbooks() {
  const [books, setBooks] = useState<Shelf[] | null>(null);
  const [error, setError] = useState("");
  const [ask, setAsk] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const reload = useCallback(() => void api.textbookShelf().then(setBooks).catch(() => setBooks([])), []);
  useEffect(reload, [reload]);
  // While a book is being read, show its progress.
  const reading = books?.some((b) => b.reading && !b.error);
  useEffect(() => {
    if (!reading) return;
    const t = setInterval(reload, 1500);
    return () => clearInterval(t);
  }, [reading, reload]);

  const add = async () => {
    setError("");
    try {
      const path = await api.textbookPick();
      if (!path) return;
      await api.textbookAdd(path);
      reload();
    } catch (e) {
      setError(String(e));
    }
  };
  const run = async (text: string) => {
    if (!text.trim() || asking) return;
    setAsking(true);
    setAnswer("");
    try {
      setAnswer(await api.textbookAsk(text.trim()));
    } catch (e) {
      setAnswer(`That didn't work — ${String(e)}`);
    } finally {
      setAsking(false);
    }
  };
  const ready = (books ?? []).filter((b) => !b.reading);

  return (
    <div className="izk-inset rounded-[14px] p-3">
      <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-izk-ink">
        <BookOpen size={14} /> Textbooks
        <button type="button" onClick={() => void add()} className="izk-pill izk-no-drag ml-auto flex items-center gap-1 px-2 py-0.5 text-[11px]">
          <Plus size={11} /> Add a PDF
        </button>
      </div>
      {!books ? (
        <p className="mt-1 text-[11.5px] text-izk-muted">Opening your shelf…</p>
      ) : books.length === 0 ? (
        <p className="mt-1 text-[11.5px] text-izk-muted">Add a textbook PDF, then ask “explain chapter 4”, “what does page 87 say?” or “quiz me on section 2.3” — answers cite the pages. It stays on this PC.</p>
      ) : (
        <ul className="mt-1.5 flex flex-col gap-1">
          {books.map((b) => (
            <li key={b.id} className="flex items-center gap-2 text-[11.5px]">
              <span className="min-w-0 flex-1 truncate text-izk-ink" title={b.title}>📘 {b.title}</span>
              {b.error ? (
                <span className="text-izk-danger">{b.error}</span>
              ) : b.reading ? (
                <span className="flex items-center gap-1 text-izk-muted">
                  <Loader2 size={11} className="animate-spin" /> reading {b.reading[0]}/{b.reading[1] || "…"}
                </span>
              ) : (
                <span className="text-izk-muted">{b.pages} pages{b.chapters.length ? ` · ${b.chapters.filter((c) => c.level <= 1).length} chapters` : ""}</span>
              )}
              <button
                type="button"
                aria-label={`Remove ${b.title}`}
                onClick={() => {
                  if (window.confirm(`Remove “${b.title}” from Izuki? (The PDF itself stays where it is.)`)) void api.textbookRemove(b.id).then(reload);
                }}
                className="text-izk-muted hover:text-izk-danger"
              >
                <Trash2 size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {ready.length > 0 && (
        <form
          className="izk-field mt-2 flex items-center gap-2 py-1"
          onSubmit={(e) => {
            e.preventDefault();
            void run(ask);
          }}
        >
          <input value={ask} onChange={(e) => setAsk(e.target.value)} placeholder="Explain chapter 4 · where does it talk about…" className="min-w-0 flex-1 bg-transparent text-[12px] outline-none" />
          {asking && <Loader2 size={12} className="animate-spin text-izk-muted" />}
        </form>
      )}
      {answer && <div className="mt-2 max-h-[260px] overflow-y-auto whitespace-pre-wrap rounded-[10px] bg-white/[0.04] p-2 text-[11.5px] leading-relaxed text-izk-ink">{answer}</div>}
      {error && <p className="mt-1 text-[11px] text-izk-danger">{error}</p>}
    </div>
  );
}

export function SchoolReader() {
  const asks: Array<[string, string]> = [
    ["🎓 My grades", "What are my grades on Blackboard?"],
    ["📣 Announcements", "Any new announcements on Blackboard?"],
    ["📚 Materials", "Show me my course materials on Blackboard"],
  ];
  return (
    <div className="izk-inset rounded-[14px] p-3">
      <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-izk-ink">
        <GraduationCap size={14} /> Blackboard
      </div>
      <p className="mt-1 text-[11.5px] text-izk-muted">
        Grades, announcements and course materials, read with your own Blackboard sign-in through the Izuki browser extension — no password, nothing changed. Or ask “my grade in biology”.
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {asks.map(([label, say]) => (
          <button key={label} type="button" onClick={() => void sendChatCommand(say)} className="izk-pill izk-no-drag px-2.5 py-1 text-[11px]">
            {label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[10.5px] text-izk-muted">Rubrics: open the assignment in your browser and ask “explain this rubric”.</p>
    </div>
  );
}

export function StudyWeekCard() {
  const [week, setWeek] = useState<StudyWeek | null>(null);
  useEffect(() => {
    void api.studyWeek().then(setWeek).catch(() => undefined);
  }, []);
  if (!week) return null;
  const studied = week.questions + week.cards + week.notes + week.lectures + week.textbook;
  const max = Math.max(1, ...week.days);
  const dayName = (i: number) => new Date(Date.now() - (6 - i) * 86_400_000).toLocaleDateString([], { weekday: "narrow" });
  return (
    <div className="izk-inset rounded-[14px] p-3 sm:col-span-2">
      <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-izk-ink">
        <TrendingUp size={14} /> Your study this week
      </div>
      {studied === 0 ? (
        <p className="mt-1 text-[11.5px] text-izk-muted">Nothing yet — switch on the Study log below, mark flashcards right or wrong, or ask about a textbook. It all counts here.</p>
      ) : (
        <>
          <div className="mt-2 flex items-end gap-1.5" aria-label="Study by day">
            {week.days.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className={cx("w-full rounded-[4px]", d ? "bg-izk-teal/70" : "bg-white/[0.06]")} style={{ height: 6 + (d / max) * 34 }} title={`${d} thing${d === 1 ? "" : "s"}`} />
                <span className="text-[9.5px] text-izk-muted">{dayName(i)}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11.5px] text-izk-ink">
            {[
              week.questions && plural(week.questions, "question"),
              week.cards && `${plural(week.cards, "flashcard")} (${Math.round((week.cards_right / Math.max(1, week.cards)) * 100)}% right)`,
              week.notes && plural(week.notes, "set of notes", "sets of notes"),
              week.lectures && plural(week.lectures, "lecture"),
              week.textbook && plural(week.textbook, "textbook explanation"),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {week.topics.length > 0 && <p className="mt-0.5 text-[11px] text-izk-muted">Most studied: {week.topics.slice(0, 4).map(([t]) => t).join(", ")}</p>}
        </>
      )}
      {week.mistakes.length > 0 && (
        <div className="mt-2 rounded-[10px] border border-amber-300/25 bg-amber-300/[0.06] p-2">
          <div className="text-[11.5px] font-semibold text-izk-ink">You keep missing {week.mistakes.length === 1 ? "this" : `these ${week.mistakes.length}`}</div>
          <ul className="mt-1 flex flex-col gap-0.5 text-[11px] text-izk-muted">
            {week.mistakes.slice(0, 4).map((m) => (
              <li key={m.topic + m.q} className="truncate">
                • {m.q} <span className="opacity-70">— missed {m.missed}×</span>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => void sendChatCommand("Quiz me on my mistakes")} className="izk-pill izk-no-drag mt-1.5 px-2.5 py-1 text-[11px]">
            Practise them
          </button>
        </div>
      )}
    </div>
  );
}
