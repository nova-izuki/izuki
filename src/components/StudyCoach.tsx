import { useEffect, useState } from "react";
import { Brain, GraduationCap, RotateCcw } from "lucide-react";
import { sendChatCommand } from "./VoiceEngine";
import { cx } from "./ui";

/**
 * Study coach: one topic, worked through with you — explained in steps,
 * again more simply when it doesn't land, then quizzed one question at a
 * time. It keeps the topic and how far you got, so closing the panel or
 * coming back after class carries on instead of starting over.
 *
 * The teaching happens in Chat (`sendChatCommand`), which is the one place
 * Izuki answers: the same rules apply here as everywhere — a tutor that
 * explains the idea and the why, one question at a time, never a finished
 * answer handed in for you, and on a graded page it coaches without saying
 * which choice is right or pressing Submit.
 *
 * Kept on this PC only, in localStorage.
 */

const KEY = "izuki.studycoach";

type Session = {
  /** What we're studying. */
  topic: string;
  /** How many things have been asked about it. */
  asked: number;
  /** The last few topics, newest first. */
  recent: string[];
};

const EMPTY: Session = { topic: "", asked: 0, recent: [] };

function load(): Session {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null") as Partial<Session> | null;
    if (!raw || typeof raw !== "object") return EMPTY;
    return {
      topic: typeof raw.topic === "string" ? raw.topic : "",
      asked: typeof raw.asked === "number" && Number.isFinite(raw.asked) ? Math.max(0, Math.round(raw.asked)) : 0,
      recent: Array.isArray(raw.recent) ? raw.recent.filter((t): t is string => typeof t === "string").slice(0, 5) : [],
    };
  } catch {
    return EMPTY;
  }
}

/** A full or blocked store is no reason for the panel to break. */
function save(s: Session) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignored on purpose */
  }
}

/** The ways to work on a topic, in the order a lesson takes them. */
const ASKS: Array<{ label: string; hint: string; say: (topic: string) => string }> = [
  {
    label: "Explain it",
    hint: "What it is, in a few steps, and why each one matters",
    say: (t) => `Teach me ${t}. Break it into a few steps and explain why each one matters.`,
  },
  {
    label: "Simpler",
    hint: "Again, in plainer words, with one everyday example",
    say: (t) => `Explain ${t} again, much simpler, in your own words, with one everyday example.`,
  },
  {
    label: "Worked example",
    hint: "A problem done step by step, saying what each step is for",
    say: (t) => `Show me a worked example of ${t}, step by step, and say what each step is for.`,
  },
  {
    label: "Quiz me",
    hint: "One question at a time; it waits for your answer",
    say: (t) => `Quiz me on ${t}. One question at a time, and wait for my answer.`,
  },
  {
    label: "I'm stuck",
    hint: "What you're probably misunderstanding, and what to check first",
    say: (t) => `I'm stuck on ${t}. What am I probably misunderstanding, and what should I check first?`,
  },
];

export function StudyCoach() {
  const [session, setSession] = useState<Session>(EMPTY);
  const [draft, setDraft] = useState("");
  /** The last button pressed, so the card says what it just did. */
  const [last, setLast] = useState("");

  useEffect(() => {
    const s = load();
    setSession(s);
    setDraft(s.topic);
  }, []);

  const start = (topic: string) => {
    const next: Session = { topic, asked: 0, recent: [topic, ...session.recent.filter((t) => t !== topic)].slice(0, 5) };
    setSession(next);
    save(next);
    setLast("");
  };

  const ask = (label: string, say: (topic: string) => string) => {
    const topic = session.topic.trim();
    if (!topic) return;
    const next: Session = { ...session, asked: session.asked + 1 };
    setSession(next);
    save(next);
    setLast(label);
    void sendChatCommand(say(topic));
  };

  const coaching = session.topic.trim().length > 0;

  return (
    <div className="izk-inset rounded-[14px] p-3">
      <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-izk-ink">
        <Brain size={14} /> Study coach
        {coaching && (
          <button
            type="button"
            onClick={() => {
              start("");
              setLast("");
            }}
            className="izk-pill izk-no-drag ml-auto flex items-center gap-1 px-2 py-0.5 text-[11px]"
            title="Start on something else"
          >
            <RotateCcw size={11} /> Change topic
          </button>
        )}
      </div>

      {!coaching ? (
        <>
          <p className="mt-1 text-[11.5px] text-izk-muted">
            Type what you're studying — a chapter, a formula, a period of history — and we'll work through it together: explained in
            steps, said again more simply if it doesn't land, then quizzed one question at a time. It keeps your place until you change
            topic. Answers show in Chat.
          </p>
          <form
            className="mt-2 flex items-center gap-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              start(draft.trim());
            }}
          >
            <label className="izk-field flex min-w-0 flex-1 items-center gap-2 py-1">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="What are you studying? e.g. photosynthesis"
                aria-label="What are you studying?"
                className="min-w-0 flex-1 bg-transparent text-[12px] outline-none"
              />
            </label>
            <button
              type="submit"
              disabled={!draft.trim()}
              className="izk-pill izk-no-drag px-2.5 py-1 text-[11px] disabled:opacity-40"
            >
              Start
            </button>
          </form>
          {session.recent.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="text-[10.5px] text-izk-muted">Recently:</span>
              {session.recent.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    start(t);
                    setDraft(t);
                  }}
                  className="izk-pill izk-no-drag max-w-[45%] truncate px-2 py-0.5 text-[10.5px]"
                  title={t}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <p className="mt-1 truncate text-[11.5px] text-izk-ink" title={session.topic}>
            {session.topic}
            {session.asked > 0 && <span className="text-izk-muted"> · {session.asked === 1 ? "1 question asked" : `${session.asked} questions asked`}</span>}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ASKS.map(({ label, hint, say }) => (
              <button
                key={label}
                type="button"
                onClick={() => ask(label, say)}
                title={hint}
                className={cx("izk-pill izk-no-drag px-2.5 py-1 text-[11px]", last === label && "ring-1 ring-izk-teal/50")}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => void sendChatCommand("Coach me through this quiz")}
              className="izk-pill izk-no-drag flex items-center gap-1 px-2.5 py-1 text-[11px]"
            >
              <GraduationCap size={11} /> Coach me through the quiz on screen
            </button>
            {last && <span className="text-[10.5px] text-izk-muted">Sent “{last}” to Chat.</span>}
          </div>
          <p className="mt-2 text-[10.5px] text-izk-muted">
            On a quiz or test it explains the question and never says or marks the answer — that stays yours. “Coach me through the quiz on
            screen” waits for your pick, then presses Next; it never presses Submit.
          </p>
        </>
      )}
    </div>
  );
}
