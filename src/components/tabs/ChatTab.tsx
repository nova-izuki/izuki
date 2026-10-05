import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlarmClock, Check, Copy, Link2, Loader2, Mic, MonitorSmartphone, RotateCcw, Send, Sparkles, Square, Volume2, X } from "lucide-react";
import { api, emit, EV, on } from "../../lib/ipc";
import { ChatText } from "../ChatText";
import { LaterCard } from "../LaterCard";
import { useDictation } from "../../hooks/useDictation";
import { useSmartIdeas } from "../../lib/smartIdeas";
import { sendChatCommand } from "../VoiceEngine";
import { VoiceOrb } from "../VoiceOrb";
import { cx } from "../ui";
import type { Reminder } from "../../lib/types";
import { useIzuki } from "../../lib/store";
import { brainReady } from "../../lib/setup";
import { needsApps, recentHistory, shareHistory } from "../../lib/conversation";

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
  /** It never answered: offer to ask again. */
  retry?: boolean;
  /** What it's doing before the answer ("Searching the web…"). */
  status?: string;
  /** A change it wants to make (save a file, run a command) — Allow / No. */
  action?: { id: number; kind: "save" | "run"; title: string; detail: string; state?: "allowed" | "denied" | "working" };
  /** Your answer to such a card, told to Izuki (shown as a small note). */
  note?: boolean;
  /** It failed for want of a (working) brain: offer the setup guide. */
  setup?: boolean;
  /** What it did on the way ("▶ Ran: …", "🔎 Searched the web: …"). */
  steps?: string[];
  /** What an allowed command really answered (so later turns know it ran). */
  ran?: string;
}

/** A failure that setting up a brain would fix. */
const NEEDS_BRAIN = /no chat-capable brain|add an api key|key was rejected|rejected the key|unauthori[sz]ed|\b401\b|invalid api key|api key not valid/i;

/** How long to wait for the first words before saying something's wrong. */
const FIRST_WORDS_MS = 45_000;

const KEY = "izuki.chat.v1";
const KEEP = 60;
const SCREEN = /^\s*\[?SCREEN\]?\s*$/i;

// Anything about their own accounts or apps belongs to the apps lane. Do not
// wait for the model to remember [APPS]: a plain chat answer about someone's
// inbox is only a guess, and a model will invent one (and an account) rather
// than admit it has not looked.
const ACCOUNTS =
  /\b(inbox|gmail|outlook|e-?mails?|calendar|diary|my schedule|my drive|cloud files?|notion|my notes?|slack|whatsapp|my tasks?|to-?do|github|repos?|blackboard|canvas|classroom|notebooklm|my account|my profile|my bookmarks|my contacts|my subscriptions|my orders)\b/i;
// Asking for help writing something is the chat lane's own job, not an app.
const WRITE_ONLY =
  /\b(help me (write|draft|compose)|write (me )?(an? )?(e-?mail|message|note|reply)|draft (me )?(an? )?(e-?mail|message|note|reply))\b/i;
const wantsApps = (t: string) => (ACCOUNTS.test(t) || needsApps(t)) && !WRITE_ONLY.test(t) && !/\b(remind me|set (a |an )?reminder)\b/i.test(t);
const APPS = /^\s*\[?APPS\]?\s*$/i;
const REMIND_TAG = /\s*\[REMIND[^\]]*\]?\s*/gi;
// Focus mode and Recall are answered on the PC itself, at once.
const INSTANT_ASK = /^(?:hey nova,?\s*)?(?:focus\b|stop focus|end focus|pomodoro|help me focus|i need to focus)|\bwhat was (?:i doing|i looking at|i working on|i reading|i watching|that (?:site|page|website|video|document|file))|\bwhat did i have open|\bfind (?:the|that) (?:page|site) i/i;
const LATER = /^(?:hey nova,?\s*)?(?:remind me later|remember for later|don'?t let me forget|add .+ to (?:my|the) (?:shopping |later )?list|what'?s on my (?:shopping |later )?list|what do i need to (?:buy|get)|i (?:got|bought) )/i;

/**
 * Only well-formed messages: a saved chat from an older version, or a reply
 * that arrived in an odd shape, must never be able to break the tab — the
 * conversation outlives the tab, so one bad message would break it every
 * time it opened.
 */
function clean(v: unknown): Msg[] {
  if (!Array.isArray(v)) return [];
  const text = (x: unknown) => (typeof x === "string" ? x : x == null ? "" : String(x));
  const out: Msg[] = [];
  for (const m of v as Array<Record<string, unknown>>) {
    if (!m || typeof m !== "object" || (m.role !== "user" && m.role !== "assistant")) continue;
    // Garbled (not text), or a question with nothing in it: leave it out.
    if (m.content != null && typeof m.content !== "string") continue;
    if (m.role === "user" && !text(m.content).trim()) continue;
    const links = Array.isArray(m.links)
      ? (m.links as unknown[]).filter(
          (l): l is [string, string] => Array.isArray(l) && typeof l[0] === "string" && typeof l[1] === "string"
        )
      : [];
    const a = m.action as Record<string, unknown> | undefined;
    out.push({
      ...(m as unknown as Msg),
      content: text(m.content),
      status: typeof m.status === "string" ? m.status : undefined,
      links: links.length ? links : undefined,
      ran: typeof m.ran === "string" ? m.ran : undefined,
      steps: Array.isArray(m.steps) ? (m.steps as unknown[]).filter((s): s is string => typeof s === "string").slice(-12) : undefined,
      action:
        a && typeof a === "object" && typeof a.id === "number"
          ? ({ ...a, title: text(a.title), detail: text(a.detail) } as Msg["action"])
          : undefined,
    });
  }
  return out;
}

function load(): Msg[] {
  try {
    const raw = localStorage.getItem(KEY);
    // A reply still empty from last time (the app closed or the tab changed
    // mid-answer) would spin forever — say so and offer to ask again.
    return clean(raw ? JSON.parse(raw) : [])
      .slice(-KEEP)
      .map((m) =>
        m.role === "assistant" && !m.content.trim() && !m.action
          ? { ...m, content: "That reply didn't come through.", failed: true, retry: true }
          : m
      );
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

/*
 * The conversation lives out here, not in the tab: switch to another tab
 * mid-answer and the reply still arrives, and is there when you come back.
 * (It used to be lost — "That reply didn't come through.")
 */
let chatMsgs: Msg[] = load();
let chatBusy = false;
const chatSubs = new Set<() => void>();
const ping = () => chatSubs.forEach((f) => f());
function setChatMsgs(next: Msg[] | ((m: Msg[]) => Msg[])) {
  const was = chatMsgs;
  chatMsgs = clean(typeof next === "function" ? next(chatMsgs) : next);
  // A patch for "the last message" when there is none (New chat pressed
  // while a reply was on its way) changes nothing.
  if (chatMsgs.length === 0 && was.length === 0 && typeof next === "function") return;
  save(chatMsgs);
  ping();
}
/** A fresh, empty chat — the way back if the tab ever fails to draw. */
export function resetChat() {
  chatStream.current = null;
  chatFinish.current = null;
  chatMsgs = [];
  chatBusy = false;
  save(chatMsgs);
  ping();
}
function setChatBusy(v: boolean) {
  chatBusy = v;
  ping();
}
const chatStream = { current: null as number | null };
const chatFinish = { current: null as ((why: string) => void) | null };
function useChatState() {
  const [, bump] = useState(0);
  useEffect(() => {
    const f = () => bump((n) => n + 1);
    chatSubs.add(f);
    return () => {
      chatSubs.delete(f);
    };
  }, []);
  return { msgs: chatMsgs, busy: chatBusy };
}


export function ChatTab() {
  const { msgs, busy } = useChatState();
  // Suggestions that fit what's on screen and the time of day.
  const ideas = useSmartIdeas(4);
  const setMsgs = setChatMsgs;
  const setBusy = setChatBusy;
  const [draft, setDraft] = useState("");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const streamId = chatStream;
  /** Ends the request in flight (Stop, a timeout) so nothing is left spinning. */
  const finish = chatFinish;
  const bottom = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const settings = useIzuki((s) => s.settings);
  const patch = useIzuki((s) => s.patchSettings);
  const settingsLoaded = useIzuki((s) => s.settingsLoaded);
  const openSetup = useIzuki((s) => s.setSetupOpen);
  const noBrain = settingsLoaded && !brainReady(settings);
  // Braces, not an arrow that returns: newer WebView2 makes scrollIntoView
  // return a promise, and a returned promise is taken as the effect's
  // clean-up — "destroy is not a function", and the Chat tab crashed on every
  // message.
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [msgs]);

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

  /**
   * One conversation, not two. This tab keeps its own saved transcript for
   * display, but every turn is also published to the conversation the orb, the
   * hands-free bar and the floating chat share — so typing "continue" there
   * carries on this thread instead of opening a fresh one. It works both ways:
   * the first time the tab is opened with nothing in it, the orb's conversation
   * is brought in, so the thread the user was already on is where they land.
   */
  const importedRef = useRef(false);
  useEffect(() => {
    if (importedRef.current) return;
    importedRef.current = true;
    const shared = recentHistory().filter((t) => t.content.trim());
    if (!shared.length) return;
    setMsgs((m) => (m.length ? m : shared.map((t) => ({ role: t.role, content: t.content }))));
  }, []);
  // Only what this tab adds from here on. Publishing the whole saved
  // transcript would push the live conversation out of the short shared
  // window the orb is using — so opening this tab would end the thread the
  // user was in the middle of.
  const baseline = useRef<number | null>(null);
  useEffect(() => {
    if (baseline.current === null) {
      baseline.current = msgs.length;
      return;
    }
    shareHistory(msgs.slice(baseline.current).map(({ role, content }) => ({ role, content })));
  }, [msgs]);

  const send = useCallback(
    /**
     * `here`: carry on in the last reply instead of starting a new one —
     * after Allow / No, the result and the answer land in the same message
     * as the card, the way Claude Code shows a job: steps, then the answer.
     */
    async (text: string, note = false, here = false) => {
      const t = text.trim();
      if (!t || busy) return;
      // "clear chat" / "start over" — just wipe it, don't ask the AI.
      if (!note && /^(clear|reset|wipe|empty|start over|new)( (the|this|our|my))? ?(chat|conversation|messages|history|it|over)?$/i.test(t)) {
        stop();
        setMsgs([]);
        setDraft("");
        return;
      }
      if (!note) setDraft("");
      // Earlier replies carry what really happened (the steps, an allowed
      // command's output), so "u done?" is answered from facts, not memory.
      const history = [...msgs.filter((m) => !m.failed && !m.screen), { role: "user" as const, content: t }].map((m) => ({
        role: m.role,
        content:
          m.role === "assistant" && ("steps" in m || "ran" in m) && (m.steps?.length || m.ran)
            ? `${m.content}\n[Done for real: ${[...(m.steps ?? []), ...(m.ran ? [`result: ${m.ran}`] : [])].join(" | ")}]`
            : m.content,
      }));
      if (here) {
        setMsgs((m) => {
          if (!m.length) return m;
          const copy = m.slice();
          copy[copy.length - 1] = { ...copy[copy.length - 1], content: "", status: undefined, failed: undefined, retry: undefined };
          return copy;
        });
      } else {
        setMsgs((m) => [...m, { role: "user", content: t, note }, { role: "assistant", content: "", status: firstStatus(t) }]);
      }
      setBusy(true);
      const id = Date.now();
      streamId.current = id;
      let raw = "";
      const setLast = (patch: Partial<Msg> | ((last: Msg) => Partial<Msg>)) =>
        setMsgs((m) => {
          if (streamId.current !== id) return m;
          if (!m.length) return m;
          const copy = m.slice();
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, ...(typeof patch === "function" ? patch(last) : patch) };
          return copy;
        });
      // The Later list ("remind me later I'm buying…", "what's on my list"): done at once.
      if (LATER.test(t) || INSTANT_ASK.test(t)) {
        const said = await api.instantCommand(t).catch(() => null);
        if (said) {
          setLast({ content: said, status: undefined });
          if (streamId.current === id) { streamId.current = null; setBusy(false); }
          return;
        }
      }
      if (wantsApps(t)) {
        setLast({ content: "Checking your connected apps…" });
        try {
          const a = await api.appsAsk(history);
          setLast({ content: a.text, links: a.links.length ? a.links : undefined });
        } catch (e) {
          setLast({ content: `I couldn't reach your apps — ${String(e)}`, failed: true, retry: true });
        } finally {
          if (streamId.current === id) { streamId.current = null; setBusy(false); }
        }
        return;
      }
      await new Promise<void>((resolveRaw) => {
        let settled = false;
        const resolve = () => {
          if (settled) return;
          settled = true;
          clearTimeout(slow);
          finish.current = null;
          resolveRaw();
        };
        // Nothing at all for a while: the brain isn't answering. Say so plainly
        // instead of spinning forever.
        let slow = setTimeout(() => {
          if (raw) return;
          void api.chatCancel(id);
          void off.then((f) => f());
          setLast({
            content: "My AI brain didn't answer. Check your internet and Settings → Izuki's brain, then try again.",
            failed: true,
            retry: true,
          });
          resolve();
        }, FIRST_WORDS_MS);
        finish.current = (why: string) => {
          void off.then((f) => f());
          if (!raw) setLast({ content: why, failed: true, retry: true });
          resolve();
        };
        const giveUp = () => {
          if (raw) return;
          void api.chatCancel(id);
          void off.then((f) => f());
          setLast({
            content: "My AI brain didn't answer. Check your internet and Settings → Izuki's brain, then try again.",
            failed: true,
            retry: true,
          });
          resolve();
        };
        const off = on<{ id: number; text: string; done: boolean; error: string | null; status?: string; action?: Msg["action"]; step?: string }>(EV.chatDelta, (d) => {
          if (d.id !== id || settled) return;
          // A step it took: a line in this reply, and the wait starts over.
          if (d.step) {
            clearTimeout(slow);
            slow = setTimeout(giveUp, FIRST_WORDS_MS);
            const step = d.step;
            setLast((last) => ({ steps: [...(last.steps ?? []), step].slice(-12) }));
            return;
          }
          // It wants to save a file or run a command: ask, and stop here.
          if (d.action) {
            void off.then((f) => f());
            // An earlier card in this same reply (a second command) moves into
            // the steps, so the reply keeps one card: the one waiting.
            setLast((last) => ({
              content: d.text || "Okay to do this?",
              action: d.action,
              status: undefined,
              steps: last.action ? [...(last.steps ?? []), `${last.action.state === "denied" ? "✕ Skipped" : "▶ Ran"}: ${last.action.detail.slice(0, 160)}`].slice(-12) : last.steps,
            }));
            resolve();
            return;
          }
          // Looking something up first: show what, and give it time.
          if (d.status) {
            clearTimeout(slow);
            slow = setTimeout(giveUp, FIRST_WORDS_MS);
            setLast({ status: d.status });
            return;
          }
          raw += d.text;
          const shown = raw.replace(REMIND_TAG, " ").trim();
          if (d.done) {
            void off.then((f) => f());
            if (SCREEN.test(raw)) {
              setLast({ content: "That one needs your PC — want me to do it?", screen: true });
            } else if (APPS.test(raw) || wantsApps(t)) {
              // Their email, calendar, files…: the apps lane does it. Say so
              // right away — it can take a little while.
              setLast({ content: "Checking your apps… 🔎" });
              void api
                .appsAsk(history)
                .then((a) => setLast({ content: a.text, links: a.links.length ? a.links : undefined }))
                .catch((e) => setLast({ content: `I couldn't get into your apps — ${String(e)}`, failed: true }))
                .finally(resolve);
              return;
            } else if (!shown) {
              setLast(
                d.error && NEEDS_BRAIN.test(d.error)
                  ? {
                      content: "I don't have a working brain yet 🧠 — let's fix that. It's free and takes about a minute.",
                      failed: true,
                      retry: true,
                      setup: true,
                    }
                  : {
                      content: d.error ? (/offline/i.test(d.error) ? d.error : `I couldn't reach my AI brain — ${d.error}`) : "Hmm, I lost my words there. Try again?",
                      failed: true,
                      retry: true,
                    }
              );
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
            setLast({ content: "I couldn't reach my AI brain — let's check it's set up.", failed: true, retry: true, setup: true });
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
    void api.cancelTask();
    if (streamId.current !== null) void api.chatCancel(streamId.current);
    streamId.current = null;
    finish.current?.("Stopped.");
    setBusy(false);
  };

  /** Allow / No on a change it asked to make; tell it what happened. */
  const answer = async (i: number, allow: boolean) => {
    const a = msgs[i]?.action;
    if (!a || a.state || busy) return;
    const mark = (state: NonNullable<Msg["action"]>["state"]) =>
      setMsgs((m) => m.map((x, j) => (j === i && x.action ? { ...x, action: { ...x.action, state } } : x)));
    mark(allow ? "working" : "denied");
    let result: string;
    try {
      result = await api.chatAction(a.id, allow);
    } catch (e) {
      result = `It didn't work: ${String(e)}`;
    }
    if (allow) {
      mark("allowed");
      // Izuki's proof check ("✓ Checked: Zoom is no longer installed") shows as a step.
      const proof = /\[Proof check: ([^\]]+)\]/.exec(result)?.[1];
      setMsgs((m) => m.map((x, j) => (j === i ? { ...x, ran: result.slice(0, 600), steps: proof ? [...(x.steps ?? []), proof] : x.steps } : x)));
    }
    setTimeout(
      () => void sendRef.current(allow ? `[I allowed it. Result:]\n${result}` : "[I said no — don't do that.]", true, true),
      40
    );
  };

  /** Ask the question before a failed reply again. */
  const retry = (i: number) => {
    const ask = msgs[i - 1]?.role === "user" ? msgs[i - 1].content : undefined;
    if (!ask || busy) return;
    const trimmed = msgs.filter((_, j) => j !== i && j !== i - 1);
    setMsgs(trimmed);
    // Next tick, so `send` sees the trimmed history.
    setTimeout(() => void sendRef.current(ask), 40);
  };

  const sendRef = useRef(send);
  sendRef.current = send;

  const dictation = useDictation((heard) => void send(heard));

  const doOnPc = (i: number) => {
    const ask = [...msgs.slice(0, i)].reverse().find((m) => m.role === "user")?.content;
    if (!ask) return;
    setMsgs((m) => m.map((x, j) => (j === i ? { ...x, content: "On it — watch your screen. 🖥️", screen: false } : x)));
    void sendChatCommand(ask);
  };

  return (
    <>
      {/* ------------------------------------------------ the Later list */}
      <LaterCard />

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
          <button
            type="button"
            onClick={() => patch({ control_style: settings.control_style === "precision" ? "mouse" : "precision" })}
            className="izk-no-drag text-[10.5px] text-izk-muted transition-colors hover:text-izk-ink"
            title="Tap to switch: Jarvis mode works without moving the mouse; Mouse mode moves a visible hand."
          >
            {settings.control_style === "precision" ? "⚡ Jarvis mode (no mouse)" : "↗ Mouse"} · {settings.economy_mode ? "Save credits" : "Fast backups"}
          </button>
          <button
            type="button"
            onClick={() => patch({ chat_auto_run: !settings.chat_auto_run })}
            className="izk-pill izk-no-drag h-[26px] px-2.5 text-[11px]"
            title={
              settings.chat_auto_run
                ? "Auto: saves and commands run on their own (the command is still shown). Tap to switch to Ask."
                : "Ask: you tap Allow before any save or command runs. Tap to switch to Auto."
            }
          >
            {settings.chat_auto_run ? "⚡ Auto-run" : "🛡️ Ask first"}
          </button>
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
          {noBrain && (
            <button
              type="button"
              onClick={() => openSetup(true)}
              className="izk-no-drag flex items-center gap-3 rounded-[16px] border border-izk-violet/40 bg-izk-violet/12 p-3 text-left transition-colors hover:bg-izk-violet/18"
            >
              <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-izk-violet/70 to-izk-teal/60">
                <Sparkles size={16} className="text-white" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-izk-ink">Give Izuki a brain first — free, one minute</span>
                <span className="block text-[11px] leading-snug text-izk-muted">Tap here, copy the key on the page that opens, come back. That's it.</span>
              </span>
            </button>
          )}
          {msgs.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6 text-center">
              <div className="text-[15px] font-semibold text-izk-ink">Hey! What's on your mind?</div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {ideas.map((idea) => (
                  <button
                    key={idea.label}
                    type="button"
                    onClick={() => void send(idea.ask)}
                    className="izk-pill izk-no-drag h-auto px-3 py-1.5 text-left text-[11.5px]"
                  >
                    {idea.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {msgs.map((m, i) =>
            m.note ? (
              <div key={i} className="self-center rounded-full bg-white/5 px-2.5 py-0.5 text-[10.5px] text-izk-muted">
                {String(m.content).startsWith("[I allowed") ? "✓ You allowed it" : "✕ You said no"}
              </div>
            ) : (
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
                {m.steps && m.steps.length > 0 && <Steps steps={m.steps} />}
                {m.action && <ActionCard action={m.action} busy={busy} onAnswer={(allow) => void answer(i, allow)} />}
                {m.content ? (
                  m.role === "assistant" ? <ChatText text={m.content} /> : m.content
                ) : busy && i === msgs.length - 1 ? (
                  <span className={cx("flex items-center gap-1.5 text-izk-muted", (!!m.steps?.length || !!m.action) && "mt-1.5")}>
                    <Loader2 size={13} className="animate-spin" /> {m.status ?? "Thinking…"}
                  </span>
                ) : null}
                {m.role === "assistant" && m.content && !m.failed && !(busy && i === msgs.length - 1) && (
                  <ReplyTools text={m.content} onRetry={i === msgs.length - 1 ? () => retry(i) : undefined} />
                )}
                {m.setup && i === msgs.length - 1 && (
                  <button
                    type="button"
                    onClick={() => openSetup(true)}
                    className="izk-btn-primary izk-no-drag mt-2 flex h-[28px] items-center gap-1.5 rounded-full px-3 text-[11.5px]"
                  >
                    <Sparkles size={12} strokeWidth={2.4} /> Set me up
                  </button>
                )}
                {m.retry && i === msgs.length - 1 && (
                  <button
                    type="button"
                    onClick={() => retry(i)}
                    className="izk-pill izk-no-drag mt-2 flex h-[26px] items-center gap-1.5 px-2.5 text-[11px] text-izk-ink"
                  >
                    <RotateCcw size={11} strokeWidth={2.4} /> Try again
                  </button>
                )}
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
            )
          )}
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
            {/* Ask first ↔ Auto-run, like Claude Code's modes (the same switch as the orb's chat bar). */}
            <button
              type="button"
              onClick={() => patch({ chat_auto_run: !settings.chat_auto_run })}
              title={
                settings.chat_auto_run
                  ? "Auto: commands and file saves run straight away (you still see each one). Tap for Ask first."
                  : "Ask first: Izuki shows what it wants to run and waits for your Allow. Tap for Auto."
              }
              className={cx(
                "flex h-[36px] shrink-0 items-center gap-1 rounded-full border px-2.5 text-[11px] font-semibold transition-colors",
                settings.chat_auto_run ? "border-amber-300/40 bg-amber-300/12 text-amber-200" : "border-white/10 bg-white/6 text-izk-ink hover:bg-white/10"
              )}
            >
              {settings.chat_auto_run ? "⚡ Auto" : "🛡️ Ask"}
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

/**
 * What it's about to do, guessed from the request — so the line under the
 * reply says something real from the first moment ("Checking your apps…")
 * and then follows each step, instead of sitting on "Thinking…".
 */
function firstStatus(t: string): string {
  const s = t.toLowerCase();
  if (/\buninstall|remove (the )?app|get rid of\b/.test(s)) return "🧹 Getting ready to uninstall…";
  if (/\binstall\b/.test(s)) return "📦 Finding it to install…";
  if (/\b(how (many|much) (gb|mb|space|storage)|how big|size of|disk|storage|space left|free space)\b/.test(s)) return "📏 Measuring…";
  if (/\b(unwanted|unused|bloat|junk|clean ?up|what apps|installed apps|my apps)\b/.test(s)) return "🗂️ Checking your apps…";
  if (/\b(file|folder|downloads|documents|desktop|pdf)\b/.test(s)) return "🗂️ Looking through your files…";
  if (/\b(battery|cpu|ram|memory|running|slow|lag)\b/.test(s)) return "🩺 Checking your PC…";
  if (/\b(wifi|wi-fi|internet|network|ip address)\b/.test(s)) return "📶 Checking your network…";
  if (/\b(weather|forecast|rain)\b/.test(s)) return "🌤️ Checking the weather…";
  if (/\b(news|latest|today|price|search|look up|who is|what is the)\b/.test(s)) return "🔎 Looking it up…";
  if (/\b(write|draft|email|essay|letter|poem|story|caption)\b/.test(s)) return "✍️ Writing…";
  if (/\b(explain|why|how does|teach|help me understand)\b/.test(s)) return "💡 Working it out…";
  if (/\b(plan|schedule|organi[sz]e|list)\b/.test(s)) return "🗓️ Putting it together…";
  return "Thinking…";
}

/** What it did on the way, as quiet lines above the answer. */
function Steps({ steps }: { steps: string[] }) {
  return (
    <div className="mb-1.5 flex flex-col gap-0.5 border-l-2 border-white/10 pl-2">
      {steps.map((s, j) => (
        <div key={j} className="truncate text-[11px] text-izk-muted" title={s}>
          {s}
        </div>
      ))}
    </div>
  );
}

/** A change it wants to make — Allow / No — or, once answered, what happened. */
function ActionCard({ action, busy, onAnswer }: { action: NonNullable<Msg["action"]>; busy: boolean; onAnswer: (allow: boolean) => void }) {
  if (action.state === "allowed" || action.state === "denied") {
    return (
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-izk-muted" title={action.detail}>
        <span className={action.state === "allowed" ? "text-izk-teal" : "text-izk-danger"}>{action.state === "allowed" ? "✓" : "✕"}</span>
        <span className="truncate">
          {action.state === "allowed" ? (action.kind === "save" ? "Saved" : "Ran") : "Skipped"}: {action.detail.split("\n")[0].slice(0, 140)}
        </span>
      </div>
    );
  }
  return (
    <div className="mb-2 rounded-[12px] border border-white/10 bg-black/25 p-2">
      <div className="text-[11.5px] font-semibold text-izk-ink">
        {action.kind === "save" ? "💾 " : "⚡ "}
        {action.title}
      </div>
      <pre className="mt-1 max-h-[160px] overflow-auto whitespace-pre-wrap break-words rounded-[8px] bg-black/30 p-1.5 font-mono text-[10.5px] leading-snug text-izk-muted">
        {action.detail}
      </pre>
      {action.state === "working" ? (
        <div className="mt-1.5 flex items-center gap-1.5 text-[10.5px] text-izk-muted">
          <Loader2 size={11} className="animate-spin" /> Doing it…
        </div>
      ) : (
        <div className="mt-1.5 flex gap-1.5">
          <button
            type="button"
            onClick={() => onAnswer(true)}
            disabled={busy}
            className="izk-btn-primary flex h-[26px] items-center rounded-full px-3 text-[11.5px] disabled:opacity-50"
          >
            Allow
          </button>
          <button
            type="button"
            onClick={() => onAnswer(false)}
            disabled={busy}
            className="izk-pill izk-no-drag h-[26px] px-3 text-[11.5px] disabled:opacity-50"
          >
            No
          </button>
        </div>
      )}
    </div>
  );
}

/** Copy, read it out loud, or ask again — under each finished reply. */
function ReplyTools({ text, onRetry }: { text: string; onRetry?: () => void }) {
  const [copied, setCopied] = useState(false);
  const btn = "flex h-[22px] items-center gap-1 rounded-full px-1.5 text-[10.5px] text-izk-muted hover:bg-white/10 hover:text-izk-ink";
  return (
    <div className="-mb-1 mt-1 flex gap-0.5 opacity-70 hover:opacity-100">
      <button
        type="button"
        className={btn}
        title="Copy"
        onClick={() =>
          void navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          })
        }
      >
        {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? "Copied" : "Copy"}
      </button>
      <button type="button" className={btn} title="Read it out loud" onClick={() => void emit(EV.say, { text, reply: true })}>
        <Volume2 size={11} /> Read aloud
      </button>
      {onRetry && (
        <button type="button" className={btn} title="Ask again for a different answer" onClick={onRetry}>
          <RotateCcw size={11} /> Again
        </button>
      )}
    </div>
  );
}
