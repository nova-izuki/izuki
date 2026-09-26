import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlarmClock, Link2, Loader2, Mic, MonitorSmartphone, RotateCcw, Send, Square, X } from "lucide-react";
import { api, EV, on } from "../../lib/ipc";
import { useDictation } from "../../hooks/useDictation";
import { sendChatCommand } from "../VoiceEngine";
import { VoiceOrb } from "../VoiceOrb";
import { cx } from "../ui";
import type { Reminder } from "../../lib/types";

/**
 * Izuki as a plain chat companion — no screen, no mouse. Ask anything,
 * draft things, plan, set reminders ("remind me at 6 to call Mum"). When
 * something needs the PC, Izuki says so and one tap lets it do it.
 *
 * The conversation is kept on this PC (browser storage) so it's still here
 * next time; "New chat" clears it.
 */

interface Msg {
  role: "user" | "assistant";
  content: string;
  /** The reply was "that needs your screen": offer to do it. */
  screen?: boolean;
  failed?: boolean;
  /** Sign-in links for apps that aren't linked yet. */
  links?: Array<[string, string]>;
}

const KEY = "izuki.chat.v1";
const KEEP = 60;
const SCREEN = /^\s*\[?SCREEN\]?\s*$/i;
const APPS = /^\s*\[?APPS\]?\s*$/i;
const REMIND_TAG = /\s*\[REMIND[^\]]*\]?\s*/gi;

function load(): Msg[] {
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? (JSON.parse(raw) as Msg[]) : [];
    return Array.isArray(v) ? v.slice(-KEEP) : [];
  } catch {
    return [];
  }
}

function save(msgs: Msg[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(msgs.slice(-KEEP)));
  } catch {
    /* private mode / full — the chat still works, it just isn't kept */
  }
}

const IDEAS = [
  "Remind me in 20 minutes to stretch",
  "Help me plan my week",
  "Draft a polite email asking for an extension",
  "Explain this like I'm 12: how do vaccines work?",
];

export function ChatTab() {
  const [msgs, setMsgs] = useState<Msg[]>(load);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const streamId = useRef<number | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  useEffect(() => save(msgs), [msgs]);
  useEffect(() => bottom.current?.scrollIntoView({ block: "end", behavior: "smooth" }), [msgs]);

  const refreshReminders = useCallback(() => void api.remindersList().then(setReminders).catch(() => undefined), []);
  useEffect(() => {
    refreshReminders();
    const off = on<void>(EV.remindersChanged, refreshReminders);
    // "in 2 hours" becomes "today at…" as the day moves on.
    const tick = setInterval(refreshReminders, 60_000);
    return () => {
      void off.then((f) => f());
      clearInterval(tick);
    };
  }, [refreshReminders]);

  const send = useCallback(
    async (text: string) => {
      const t = text.trim();
      if (!t || busy) return;
      setDraft("");
      const history = [...msgs.filter((m) => !m.failed && !m.screen), { role: "user" as const, content: t }].map(
        ({ role, content }) => ({ role, content })
      );
      setMsgs((m) => [...m, { role: "user", content: t }, { role: "assistant", content: "" }]);
      setBusy(true);
      const id = Date.now();
      streamId.current = id;
      let raw = "";
      const setLast = (patch: Partial<Msg>) =>
        setMsgs((m) => {
          const copy = m.slice();
          copy[copy.length - 1] = { ...copy[copy.length - 1], ...patch };
          return copy;
        });
      await new Promise<void>((resolve) => {
        const off = on<{ id: number; text: string; done: boolean; error: string | null }>(EV.chatDelta, (d) => {
          if (d.id !== id) return;
          raw += d.text;
          const shown = raw.replace(REMIND_TAG, " ").trim();
          if (d.done) {
            void off.then((f) => f());
            if (SCREEN.test(raw)) {
              setLast({ content: "That one needs your PC — want me to do it?", screen: true });
            } else if (APPS.test(raw)) {
              // Their email, calendar, files…: the apps lane does it.
              void api
                .appsAsk(history)
                .then((a) => setLast({ content: a.text, links: a.links.length ? a.links : undefined }))
                .catch((e) => setLast({ content: `I couldn't get into your apps — ${String(e)}`, failed: true }))
                .finally(resolve);
              return;
            } else if (!shown) {
              setLast({
                content: d.error ? `I couldn't reach my AI brain — ${d.error}` : "Hmm, I lost my words there. Try again?",
                failed: true,
              });
            } else {
              setLast({ content: shown });
            }
            resolve();
            return;
          }
          // Hold back while it might still be "[SCREEN]" or "[APPS]".
          if (!/^\s*\[?(S?C?R?E?E?N?|A?P?P?S?)\]?\s*$/i.test(raw)) setLast({ content: shown });
        });
        void off.then(() => {
          if (streamId.current !== id) return resolve();
          api.chatStreamWritten(id, history).catch(() => {
            setLast({ content: "I couldn't reach my AI brain — check Settings → Izuki's brain.", failed: true });
            resolve();
          });
        });
      });
      if (streamId.current === id) streamId.current = null;
      setBusy(false);
      input.current?.focus();
    },
    [busy, msgs]
  );

  const stop = () => {
    if (streamId.current !== null) void api.chatCancel(streamId.current);
    streamId.current = null;
    setBusy(false);
  };

  const dictation = useDictation((heard) => void send(heard));

  const doOnPc = (i: number) => {
    const ask = [...msgs.slice(0, i)].reverse().find((m) => m.role === "user")?.content;
    if (!ask) return;
    setMsgs((m) => m.map((x, j) => (j === i ? { ...x, content: "On it — watch your screen. 🖥️", screen: false } : x)));
    void sendChatCommand(ask);
  };

  return (
    <>
      {/* ------------------------------------------------ reminders */}
      <AnimatePresence initial={false}>
        {reminders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="izk-card p-[12px]"
          >
            <div className="mb-1.5 flex items-center gap-2 text-[12px] font-semibold text-izk-ink">
              <AlarmClock size={13} strokeWidth={2.4} className="text-izk-teal" /> Reminders
            </div>
            <div className="flex flex-col gap-1">
              {reminders.map((r) => (
                <div key={r.id} className="group flex items-center gap-2 rounded-[10px] px-1.5 py-1 hover:bg-white/5">
                  <span className="shrink-0 text-[10.5px] font-medium text-izk-teal">{when(r.at)}</span>
                  <span className="min-w-0 flex-1 truncate text-[12px] text-izk-ink">{r.text}</span>
                  <button
                    type="button"
                    aria-label="Delete reminder"
                    onClick={() => {
                      setReminders((all) => all.filter((x) => x.id !== r.id));
                      void api.reminderRemove(r.id);
                    }}
                    className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-izk-muted opacity-0 transition-opacity hover:text-izk-danger group-hover:opacity-100"
                  >
                    <X size={12} strokeWidth={2.4} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------ the chat */}
      <div className="izk-card flex min-h-[420px] flex-col p-0">
        <div className="flex items-center justify-between px-[14px] pt-[12px]">
          <div className="text-[12px] text-izk-muted">Just chatting — nothing on your screen is touched.</div>
          {msgs.length > 0 && (
            <button
              type="button"
              onClick={() => {
                stop();
                setMsgs([]);
              }}
              className="izk-pill izk-no-drag h-[26px] px-2.5 text-[11px]"
              title="Start a new chat"
            >
              <RotateCcw size={11} strokeWidth={2.4} /> New chat
            </button>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 px-[14px] py-[12px]">
          {msgs.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6 text-center">
              <div className="text-[15px] font-semibold text-izk-ink">Hey! What's on your mind?</div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {IDEAS.map((idea) => (
                  <button
                    key={idea}
                    type="button"
                    onClick={() => void send(idea)}
                    className="izk-pill izk-no-drag h-auto px-3 py-1.5 text-left text-[11.5px]"
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>
          )}
          {msgs.map((m, i) => (
            <div key={i} className={cx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cx(
                  "max-w-[85%] whitespace-pre-wrap break-words rounded-[16px] px-3 py-2 text-[13px] leading-snug",
                  m.role === "user"
                    ? "rounded-br-[6px] text-white"
                    : cx("rounded-bl-[6px] border border-white/8 bg-white/6 text-izk-ink", m.failed && "text-izk-danger")
                )}
                style={
                  m.role === "user"
                    ? { background: "linear-gradient(135deg,rgba(124,92,255,0.85),rgba(78,205,196,0.7))" }
                    : undefined
                }
              >
                {m.content || <Loader2 size={13} className="animate-spin text-izk-muted" />}
                {m.links?.map(([name, url]) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => void api.openUrl(url)}
                    className="izk-btn-primary mt-2 flex h-[28px] items-center gap-1.5 rounded-full px-3 text-[11.5px]"
                  >
                    <Link2 size={12} strokeWidth={2.4} /> Connect {name}
                  </button>
                ))}
                {m.screen && (
                  <button
                    type="button"
                    onClick={() => doOnPc(i)}
                    className="izk-btn-primary mt-2 flex h-[28px] items-center gap-1.5 rounded-full px-3 text-[11.5px]"
                  >
                    <MonitorSmartphone size={12} strokeWidth={2.4} /> Do it on my PC
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={bottom} />
        </div>

        <div className="border-t border-white/8 p-[10px]">
          <div className="flex items-end gap-1.5">
            <button
              type="button"
              onClick={() => (dictation.listening ? dictation.stop() : dictation.start())}
              disabled={busy || dictation.transcribing}
              aria-label={dictation.listening ? "Done talking" : "Talk instead"}
              title={dictation.listening ? "Done talking" : "Talk instead"}
              className={cx(
                "flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full border transition-colors",
                dictation.listening ? "border-izk-teal/40 bg-izk-teal/12" : "border-white/10 bg-white/6 hover:bg-white/10"
              )}
            >
              {dictation.listening ? (
                <VoiceOrb size={30} mic />
              ) : dictation.transcribing ? (
                <Loader2 size={15} className="animate-spin text-izk-muted" />
              ) : (
                <Mic size={15} strokeWidth={2.3} className="text-izk-ink" />
              )}
            </button>
            <textarea
              ref={input}
              value={draft}
              rows={1}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(draft);
                }
              }}
              placeholder={dictation.listening ? "Listening…" : "Message Izuki"}
              className="izk-field izk-no-drag max-h-[120px] min-h-[36px] flex-1 resize-none rounded-[18px] py-[8px] text-[13px]"
            />
            {busy ? (
              <button
                type="button"
                onClick={stop}
                aria-label="Stop"
                className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/6 text-izk-ink hover:bg-white/10"
              >
                <Square size={12} strokeWidth={2.6} fill="currentColor" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void send(draft)}
                disabled={!draft.trim()}
                aria-label="Send"
                className="izk-btn-primary flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full disabled:opacity-40"
              >
                <Send size={14} strokeWidth={2.6} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/** "5:00 PM", "Tomorrow 9:30 AM", "Fri 8:00 AM". */
function when(at: number): string {
  const d = new Date(at);
  const now = new Date();
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const days = Math.round((new Date(d).setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0)) / 86_400_000);
  if (days <= 0) return time;
  if (days === 1) return `Tomorrow ${time}`;
  return `${d.toLocaleDateString([], { weekday: "short" })} ${time}`;
}
