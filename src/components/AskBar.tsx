import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { api, emit, EV, on } from "../lib/ipc";

/** Subscribe in an effect: on() resolves to its own unsubscribe. */
const sub = (p: Promise<() => void>) => () => void p.then((f) => f());
import type { CaptionPayload } from "../lib/types";

/**
 * The ask bar: press Alt+Space anywhere and one box appears near the top of
 * the screen — like the ChatGPT / Gemini / Claude desktop apps. Type, press
 * Enter, and the answer appears right under it. It goes through the same
 * pipeline as the chat (instant skills, the chat lane, the screen agent),
 * so "search pizza near me" is instant and "fill this form" does the work.
 *
 * Simple on purpose (owner, 2026-11-23: "as simple and easy to use, but very
 * interesting, not boring"): one box, a living orb, three ideas to try,
 * nothing to set up. Esc or a click outside closes it.
 *
 * While you type, the whole overlay takes the mouse and keyboard (that's how
 * the box gets focus). The moment you send, it gives them back — the screen
 * agent may need to click — and the box just shows the answer, then fades.
 */

/** True while the bar is showing an answer: the caption box stays quiet then (one place for the words). */
let showingAnswer = false;
export const askBarOwnsCaptions = () => showingAnswer;

const IDEAS = [
  "Search for pizza places near me",
  "Explain what's on my screen",
  "Open Spotify",
  "Set a timer for 10 minutes",
  "Summarise this page",
  "What's taking up space on my PC?",
  "Fill this form for me",
  "Play lofi on YouTube",
];

type Phase = "closed" | "typing" | "working" | "done";

export function AskBar() {
  const calm = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("closed");
  const [text, setText] = useState("");
  const [asked, setAsked] = useState("");
  const [answer, setAnswer] = useState("");
  const [idea, setIdea] = useState(0);
  /** The three ideas offered, fixed while the bar is open (the hint above them keeps changing). */
  const [seed, setSeed] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const runId = useRef(0);
  const fade = useRef<number | undefined>(undefined);
  const holdsMouse = useRef(false);

  const letGo = () => {
    if (holdsMouse.current) {
      holdsMouse.current = false;
      void api.setOverlayInteractive(false).catch(() => undefined);
    }
  };
  const close = () => {
    window.clearTimeout(fade.current);
    showingAnswer = false;
    letGo();
    setPhase("closed");
  };
  const open = () => {
    window.clearTimeout(fade.current);
    showingAnswer = false;
    setText("");
    setAsked("");
    setAnswer("");
    const start = Math.floor(Math.random() * IDEAS.length);
    setIdea(start);
    setSeed(start);
    setPhase("typing");
    holdsMouse.current = true;
    void api.setOverlayInteractive(true).catch(() => undefined).finally(() => {
      window.setTimeout(() => input.current?.focus(), 30);
    });
  };
  const send = (q: string) => {
    const t = q.trim();
    if (!t) return;
    const id = Date.now();
    runId.current = id;
    setAsked(t);
    setAnswer("");
    setPhase("working");
    showingAnswer = true;
    // Give the mouse back first: the agent may be about to click.
    letGo();
    void emit(EV.runChat, { id, text: t });
  };

  // Alt+Space (from Rust) toggles it. (open/close only touch setters and refs,
  // so the first render's copies are safe to keep.)
  const phaseNow = useRef<Phase>("closed");
  phaseNow.current = phase;
  useEffect(() => sub(on<void>(EV.askBar, () => (phaseNow.current === "typing" ? close() : open()))), []);
  // The answer, as Izuki says it.
  useEffect(() => sub(on<CaptionPayload>(EV.caption, (c) => {
    if (!showingAnswer || !c.text.trim()) return;
    setAnswer(c.text);
  })), []);
  // Finished: keep the answer up a while (longer for longer answers), then fade.
  useEffect(() => sub(on<{ id: number }>(EV.chatDone, (m) => {
    if (m.id !== runId.current) return;
    setPhase((p) => (p === "working" ? "done" : p));
  })), []);
  useEffect(() => {
    if (phase !== "done") return;
    const words = answer.split(/\s+/).length;
    fade.current = window.setTimeout(close, Math.min(30_000, 6_000 + words * 260));
    return () => window.clearTimeout(fade.current);
  }, [phase, answer]);
  // A new idea every few seconds while the box is empty.
  useEffect(() => {
    if (phase !== "typing" || text) return;
    const t = window.setInterval(() => setIdea((i) => (i + 1) % IDEAS.length), 3200);
    return () => window.clearInterval(t);
  }, [phase, text]);
  useEffect(() => () => { showingAnswer = false; }, []);

  const open_ = phase !== "closed";
  const busy = phase === "working";
  const chips = [IDEAS[(seed + 2) % IDEAS.length], IDEAS[(seed + 4) % IDEAS.length], IDEAS[(seed + 6) % IDEAS.length]];

  return (
    <AnimatePresence>
      {open_ && (
        <>
          {/* While typing, a soft dim behind it; a click there closes it. */}
          {phase === "typing" && (
            <motion.div
              key="ask-dim"
              className="fixed inset-0 z-[2147482000] bg-black/25"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onMouseDown={close}
              data-izk-hit
            />
          )}
          <motion.div
            key="ask-box"
            role="dialog"
            aria-label="Ask Izuki"
            className="fixed left-1/2 top-[18vh] z-[2147482001] w-[min(640px,92vw)] -translate-x-1/2"
            style={{ pointerEvents: phase === "typing" ? "auto" : "none" }}
            initial={calm ? { opacity: 0 } : { opacity: 0, y: -14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={calm ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            data-izk-hit={phase === "typing" ? true : undefined}
          >
            {/* The glowing edge: slow while idle, alive while Izuki works. */}
            <div className={`izk-ask-ring ${busy ? "izk-ask-ring-busy" : ""}`} aria-hidden />
            <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[#0b0f17]/90 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
              <form
                className="flex items-center gap-3 px-4 py-3.5"
                onSubmit={(e) => { e.preventDefault(); send(text); }}
              >
                <span className={`izk-ask-orb ${busy ? "izk-ask-orb-busy" : ""}`} aria-hidden />
                {phase === "typing" ? (
                  <input
                    ref={input}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); close(); } }}
                    placeholder={IDEAS[idea]}
                    aria-label="Ask Izuki anything, or tell it what to do"
                    className="min-w-0 flex-1 bg-transparent text-[18px] text-white outline-none placeholder:text-white/35"
                    spellCheck={false}
                    autoComplete="off"
                  />
                ) : (
                  <div className="min-w-0 flex-1 truncate text-[18px] text-white/90">{asked}</div>
                )}
                {phase === "typing" && (
                  <kbd className="hidden shrink-0 rounded-md border border-white/15 px-1.5 py-0.5 text-[11px] text-white/45 sm:block">Enter</kbd>
                )}
              </form>
              {phase === "typing" && !text && (
                <div className="flex flex-wrap gap-2 px-4 pb-3.5">
                  {chips.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => send(c)}
                      className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[13px] text-white/80 transition-colors hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-white"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
              {phase !== "typing" && (
                <div className="border-t border-white/[0.07] px-4 py-3 text-[15px] leading-relaxed text-white/85" aria-live="polite">
                  {answer || (
                    <span className="izk-ask-dots text-white/50">
                      Thinking<span>.</span><span>.</span><span>.</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
