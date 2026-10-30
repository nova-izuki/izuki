import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlarmClock, Check, ChevronDown, ChevronRight, Copy, Link2, Loader2, Maximize2, Mic, Minimize2, MonitorSmartphone, Paperclip, RotateCcw, Send, Sparkles, Square, Volume2, X } from "lucide-react";
import { api, CAMERA_PICTURE_KEY, emit, EV, ISLAND_TO_CHAT_KEY, on, type CodingUpdate, type ResearchUpdate } from "../../lib/ipc";
import { ResearchPanel, researchAsk, type ResearchState } from "../ResearchPanel";
import { CodingPanel, type CodingState } from "../CodingPanel";
import { ChatText } from "../ChatText";
import { LaterCard } from "../LaterCard";
import { useDictation } from "../../hooks/useDictation";
import { useSmartIdeas } from "../../lib/smartIdeas";
import { sendChatCommand } from "../VoiceEngine";
import { VoiceOrb } from "../VoiceOrb";
import { cx } from "../ui";
import type { Reminder } from "../../lib/types";
import { useIzuki } from "../../lib/store";
import { AirToggle } from "../AirToggle";
import { brainReady } from "../../lib/setup";
import { looksLikeDirections, needsApps, opensAnApp, recentHistory, shareHistory } from "../../lib/conversation";

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
  /** The tools it used, Claude Code style: tool, what for, IN and OUT. */
  calls?: ToolCall[];
  /** What an allowed command really answered (so later turns know it ran). */
  ran?: string;
  /** Pictures sent with it (data URLs) — shown, sent to the brain, not saved. */
  images?: string[];
  /** A deep research: its searches, the pages read, and its sources. */
  research?: ResearchState;
  /** A coding task: its steps, plan and change (Apply / Discard / Undo). */
  coding?: CodingState;
}

/**
 * A picture made small enough to send: at most 1280 px on its long side,
 * as a JPEG data URL (a phone photo is 4 MB; this is ~200 KB).
 */
function shrinkPicture(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(img.width * scale));
      c.height = Math.max(1, Math.round(img.height * scale));
      c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("not a picture"));
    };
    img.src = url;
  });
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
const wantsApps = (t: string) => (ACCOUNTS.test(t) || needsApps(t)) && !opensAnApp(t) && !WRITE_ONLY.test(t) && !/\b(remind me|set (a |an )?reminder)\b/i.test(t);
const APPS = /^\s*\[?APPS\]?\s*$/i;
const REMIND_TAG = /\s*\[(?:REMIND|ALARM)[^\]]*\]?\s*/gi;
// Focus mode and Recall are answered on the PC itself, at once.
const INSTANT_ASK = /\bcite (?:https?:\/\/|www\.|10\.)|\b(?:(?:izuki|nova)(?:'s)? (?:notes|settings|chat|style|apps)|my (?:study )?notes|take notes|make notes|save (?:this|it|the|my)\b[^.?!]{0,60}\bnotes|apa (?:reference|citation|format|style)|in apa|cite (?:this|the|my|isbn)|coach me|quiz coach|coach mode|stop coaching|(?:walk me|go|help me) through (?:this|the|my) (?:quiz|test|exam)|help me with (?:this|the|my) (?:quiz|test|exam)|do (?:this|the) (?:quiz|test) with me|how much did i (?:spend|make)|how much have i (?:spent|made)|(?:unusual|weird|suspicious) (?:spending|charges?)|double charge|subscriptions|monthly charges|watch ?list|my stocks|my portfolio|my sales|sales today|stripe (?:balance|payments|sales)|my stripe|shopify orders|new orders|any orders|low (?:on )?stock|out of stock|my revenue|keep getting wrong|i keep missing|what do i get wrong|my weak spots|what are my mistakes|(?:have|did) i stud(?:y|ied)|study (?:progress|stats)|quiz me on my mistakes|practi[cs]e my mistakes|my grades?\b|blackboard|course materials|syllabus|announcements? (?:in|for|on) my|(?:chapter|section|page|pages) \d|my (?:text)?book|study log|(?:save|keep|log|record|stop saving|don'?t save) (?:every|all|each|my)\b[^.?!]{0,30}\b(?:quest|questions?|answers?|q ?(?:and|&) ?a)|what needs my attention|business briefing|check my (?:website|site)|is my (?:website|site)|check (?:my )?(?:connected )?(?:accounts|apps|connections)|(?:which|what) (?:accounts|apps) are (?:connected|linked)|are my (?:apps|accounts) (?:connected|linked|working)|(?:connected|linked) accounts|account health)\b|^(?:hey nova,?\s*)?(?:focus\b|stop focus|end focus|pomodoro|help me focus|i need to focus)|\bwhat was (?:i doing|i looking at|i working on|i reading|i watching|that (?:site|page|website|video|document|file))|\bwhat did i have open|\bfind (?:the|that) (?:page|site) i/i;
/** Anything about disk space — the core decides exactly, and answers with no AI. */
const STORAGE_ASK = /spac|storag|disk|hard drive|\bssd\b|\bgb\b|\btb\b/i;
/** A short yes ("yea bro", "bet, run it"): it may answer something Izuki
 *  offered (offers.rs), so Izuki's own commands hear it first. */
const YES_REPLY = /^\s*(?:y[aeu]+[ahps]*|yes+|yessir|ok(?:ay)?|k+|sure|bet|aight|ight|alright|please|pls|plz|do it|go ahead|go for it|for sure|fs|of course|ofc|absolutely|definitely|certainly|let'?s go+|run it|connect it|set it up|hook it up|why not|sounds good|cool|perfect|mhm)\b[^?]{0,40}$/i;
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
      images: Array.isArray(m.images)
        ? (m.images as unknown[]).filter((u): u is string => typeof u === "string" && u.startsWith("data:image/")).slice(0, 4)
        : undefined,
      status: typeof m.status === "string" ? m.status : undefined,
      links: links.length ? links : undefined,
      ran: typeof m.ran === "string" ? m.ran : undefined,
      calls: Array.isArray(m.calls) ? (m.calls as ToolCall[]).filter((c) => c && typeof c.name === "string").slice(-12) : undefined,
      steps: Array.isArray(m.steps) ? (m.steps as unknown[]).filter((s): s is string => typeof s === "string").slice(-12) : undefined,
      action:
        a && typeof a === "object" && typeof a.id === "number"
          ? ({ ...a, title: text(a.title), detail: text(a.detail) } as Msg["action"])
          : undefined,
      research: storedResearch(m.research),
      coding: storedCoding(m.coding),
    });
  }
  return out;
}

const DEEP_KEY = "izk.chatDeep";
/** Coding mode on, and the project it works on (remembered on this PC). */
const CODE_KEY = "izk.chatCode";
const PROJECT_KEY = "izk.codeProject";

/** A saved coding task, tidied: the diff isn't kept (Apply works without it). */
function storedCoding(c: unknown): CodingState | undefined {
  if (!c || typeof c !== "object") return undefined;
  const o = c as Record<string, unknown>;
  if (typeof o.project !== "string") return undefined;
  const steps = Array.isArray(o.steps) ? (o.steps as CodingState["steps"]).filter((x) => x && typeof x.text === "string").slice(-60) : [];
  const todo = Array.isArray(o.todo) ? (o.todo as CodingState["todo"]).filter((x) => Array.isArray(x) && typeof x[0] === "string").slice(0, 20) : [];
  const files = Array.isArray(o.files) ? (o.files as CodingState["files"]).filter((f) => f && typeof f.path === "string").slice(0, 200) : [];
  const state = o.state === "applied" || o.state === "discarded" || o.state === "undone" ? o.state : undefined;
  return {
    project: o.project,
    phase: o.phase === "done" ? "done" : o.phase === "working" ? "working" : "error",
    steps,
    todo,
    files,
    diff: typeof o.diff === "string" ? o.diff : undefined,
    workspace: typeof o.workspace === "string" ? o.workspace : undefined,
    state,
    task: typeof o.task === "number" ? o.task : undefined,
  };
}

/**
 * Run one coding task: each step arrives as it happens, then the summary
 * and the change. Ends on "done", an error, or Stop. Tests can take a long
 * while, so only half an hour of silence counts as stuck.
 */
function runCoding(
  id: number,
  project: string,
  task: string,
  history: Array<{ role: string; content: string }>,
  setLast: (patch: Partial<Msg> | ((last: Msg) => Partial<Msg>)) => void,
  finish: { current: ((why: string) => void) | null }
): Promise<void> {
  return new Promise<void>((resolve) => {
    let ended = false;
    let stopping = false;
    let quiet: ReturnType<typeof setTimeout> | undefined;
    let grace: ReturnType<typeof setTimeout> | undefined;
    const coding = (last: Msg, patch: Partial<CodingState>): CodingState => ({
      ...(last.coding ?? { project, phase: "working", steps: [], todo: [], files: [], task: id }),
      ...patch,
    });
    const end = () => {
      if (ended) return;
      ended = true;
      clearTimeout(quiet);
      clearTimeout(grace);
      if (finish.current === stopNow) finish.current = null;
      void off.then((f) => f());
      resolve();
    };
    const fail = (why: string) => {
      setLast((last) => ({ content: last.content || why, failed: !last.content, coding: coding(last, { phase: "error" }) }));
      end();
    };
    const wait = () => {
      clearTimeout(quiet);
      quiet = setTimeout(() => {
        void api.chatCancel(id);
        fail("The coding task stopped answering — try again.");
      }, 30 * 60_000);
    };
    // Stop: the task is told to stop, and its last word — what it changed so
    // far, to Apply or Discard — is still heard for a few seconds.
    const stopNow = (why: string) => {
      if (stopping || ended) return;
      stopping = true;
      void api.chatCancel(id);
      setLast((last) => ({ coding: { ...coding(last, {}), steps: [...coding(last, {}).steps, { kind: "plan", text: "Stopping…" }] } }));
      grace = setTimeout(() => fail(why), 20_000);
    };
    finish.current = stopNow;
    const off = on<CodingUpdate>(EV.coding, (u) => {
      if (u.id !== id || ended) return;
      wait();
      if (u.kind === "text") {
        setLast({ content: u.text });
      } else if (u.kind === "todo") {
        setLast((last) => ({ coding: coding(last, { todo: u.todo ?? [] }) }));
      } else if (u.kind === "changes") {
        setLast((last) => ({ coding: coding(last, { files: u.files ?? [], diff: u.diff, workspace: u.workspace, todo: u.todo?.length ? u.todo : last.coding?.todo ?? [] }) }));
      } else if (u.kind === "done") {
        setLast((last) => ({ coding: coding(last, { phase: "done", workspace: u.workspace ?? last.coding?.workspace }) }));
        end();
      } else if (u.kind === "error") {
        fail(u.text);
      } else {
        setLast((last) => {
          const c = coding(last, u.workspace ? { workspace: u.workspace } : {});
          return { coding: { ...c, steps: [...c.steps, { kind: u.kind, text: u.text, ok: u.ok, detail: u.detail }].slice(-60) } };
        });
      }
    });
    wait();
    void off.then(() => api.codingStart(id, project, task, history)).catch((e) => fail(String(e)));
  });
}

/** A saved research, tidied (one still "working" when the app closed was cut short). */
function storedResearch(r: unknown): ResearchState | undefined {
  if (!r || typeof r !== "object") return undefined;
  const o = r as Record<string, unknown>;
  if (typeof o.question !== "string") return undefined;
  const steps = Array.isArray(o.steps) ? (o.steps as ResearchState["steps"]).filter((x) => x && typeof x.text === "string").slice(-40) : [];
  const sources = Array.isArray(o.sources) ? (o.sources as ResearchState["sources"]).filter((x) => x && typeof x.url === "string").slice(0, 30) : [];
  return { question: o.question, phase: o.phase === "done" ? "done" : o.phase === "working" ? "working" : "error", steps, sources };
}

/**
 * Run one deep research: each search and page arrives as a step, then the
 * answer streams in. Ends on "done", an error, Stop, or two silent minutes.
 */
function runResearch(
  id: number,
  question: string,
  history: Array<{ role: string; content: string }>,
  setLast: (patch: Partial<Msg> | ((last: Msg) => Partial<Msg>)) => void,
  finish: { current: ((why: string) => void) | null }
): Promise<void> {
  return new Promise<void>((resolve) => {
    let ended = false;
    let text = "";
    let quiet: ReturnType<typeof setTimeout> | undefined;
    // The answer streams in many small pieces: one screen update per frame.
    let frame = 0;
    const flush = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      setLast({ content: text });
    };
    const withResearch = (last: Msg, patch: Partial<ResearchState>): ResearchState => ({
      ...(last.research ?? { question, phase: "working", steps: [], sources: [] }),
      ...patch,
    });
    const end = () => {
      if (ended) return;
      ended = true;
      clearTimeout(quiet);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      finish.current = null;
      void off.then((f) => f());
      resolve();
    };
    const fail = (why: string) => {
      if (text) flush();
      setLast((last) => ({ content: text || why, failed: !text, retry: !text, research: withResearch(last, { phase: "error" }) }));
      end();
    };
    const wait = () => {
      clearTimeout(quiet);
      quiet = setTimeout(() => {
        void api.chatCancel(id);
        fail("The research stopped answering — check your internet and try again.");
      }, 120_000);
    };
    finish.current = (why: string) => fail(why);
    const off = on<ResearchUpdate>(EV.research, (u) => {
      if (u.id !== id || ended) return;
      wait();
      if (u.kind === "text") {
        text += u.text;
        if (!frame) frame = requestAnimationFrame(flush);
      } else if (u.kind === "done") {
        flush();
        setLast((last) => ({ research: withResearch(last, { phase: "done", sources: u.sources ?? last.research?.sources ?? [] }) }));
        end();
      } else if (u.kind === "error") {
        fail(u.text);
      } else {
        setLast((last) => {
          const r = withResearch(last, {});
          return {
            research: {
              ...r,
              steps: [...r.steps, { kind: u.kind, text: u.text, url: u.url, site: u.site }].slice(-40),
              sources: u.sources ?? r.sources,
            },
          };
        });
      }
    });
    wait();
    // Listening first, so the first steps aren't missed.
    void off.then(() => api.researchStart(id, question, history)).catch((e) => fail(String(e)));
  });
}

function load(): Msg[] {
  try {
    const raw = localStorage.getItem(KEY);
    // A reply still empty from last time (the app closed or the tab changed
    // mid-answer) would spin forever — say so and offer to ask again.
    return clean(raw ? JSON.parse(raw) : [])
      .slice(-KEEP)
      .map((m) => ({
        ...m,
        // Still working when the app closed: it was cut short.
        research: m.research?.phase === "working" ? { ...m.research, phase: "error" as const } : m.research,
        coding: m.coding?.phase === "working" ? { ...m.coding, phase: "error" as const } : m.coding,
      }))
      .map((m) =>
        m.role === "assistant" && !m.content.trim() && !m.action && !m.coding
          ? { ...m, content: "That reply didn't come through.", failed: true, retry: true }
          : m
      );
  } catch {
    return [];
  }
}

function save(msgs: Msg[]) {
  try {
    // Pictures are big: they're kept for this session only. So are a coding
    // change's diff and its logs (Apply works without them).
    const light = msgs.slice(-KEEP).map((m) => {
      const lean = m.coding ? { ...m, coding: { ...m.coding, diff: undefined, steps: m.coding.steps.map(({ kind, text, ok }) => ({ kind, text, ok })) } } : m;
      return lean.images?.length ? { ...lean, images: undefined, content: `${lean.content} 🖼️`.trim() } : lean;
    });
    localStorage.setItem(KEY, JSON.stringify(light));
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
  /** Pictures waiting to go with the next message. */
  const [pics, setPics] = useState<string[]>([]);
  const picker = useRef<HTMLInputElement>(null);
  const addPictures = async (files: Iterable<Blob>) => {
    const ready: string[] = [];
    for (const f of files) {
      if (!f.type.startsWith("image/")) continue;
      try {
        ready.push(await shrinkPicture(f));
      } catch {
        /* not a picture we can read */
      }
    }
    if (ready.length) setPics((p) => [...p, ...ready].slice(0, 4));
  };
  // A still from the Island's camera ("Ask Izuki about this"): it waits in
  // shared storage too, so it arrives even when Chat opens after the event.
  useEffect(() => {
    const take = (picture: unknown) => {
      if (typeof picture !== "string" || !picture.startsWith("data:image/")) return;
      setPics((p) => {
        if (p.includes(picture)) return p;
        if (p.length >= 4) {
          // Full: never push out a picture already chosen.
          return p;
        }
        return [...p, picture];
      });
      requestAnimationFrame(() => input.current?.focus());
    };
    try {
      const waiting = localStorage.getItem(CAMERA_PICTURE_KEY);
      localStorage.removeItem(CAMERA_PICTURE_KEY);
      take(waiting);
    } catch { /* storage is optional */ }
    const off = on<string>(EV.chatPicture, (picture) => {
      try { localStorage.removeItem(CAMERA_PICTURE_KEY); } catch { /* storage is optional */ }
      take(picture);
    });
    return () => void off.then((f) => f());
  }, []);
  // An Island conversation to carry on here ("Continue in Chat"): it joins
  // this chat, so the next message follows on from it.
  useEffect(() => {
    type Handoff = { title?: string; where?: string; turns?: Array<{ role: string; content: string }> };
    const take = (h: Handoff | null) => {
      const turns = (h?.turns ?? []).filter((t) => (t.role === "user" || t.role === "assistant") && typeof t.content === "string" && t.content.trim());
      if (!turns.length) return;
      const from: Msg = { role: "user", content: `From the Island (${h?.where || "my screen"}):`, note: true };
      setChatMsgs((m) => [...m, from, ...turns.map((t) => ({ role: t.role as Msg["role"], content: t.content }))]);
      requestAnimationFrame(() => input.current?.focus());
    };
    try {
      const waiting = localStorage.getItem(ISLAND_TO_CHAT_KEY);
      localStorage.removeItem(ISLAND_TO_CHAT_KEY);
      if (waiting) take(JSON.parse(waiting));
    } catch { /* storage is optional */ }
    const off = on<Handoff>(EV.chatImport, (h) => {
      try { localStorage.removeItem(ISLAND_TO_CHAT_KEY); } catch { /* storage is optional */ }
      take(h);
    });
    return () => void off.then((f) => f());
  }, []);
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

  /** Coding mode on, and its project (remembered on this PC). */
  const [code, setCode] = useState(() => {
    try {
      return localStorage.getItem(CODE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [project, setProject] = useState(() => {
    try {
      return localStorage.getItem(PROJECT_KEY) ?? "";
    } catch {
      return "";
    }
  });
  /** Ask which project (the folder picker); remembered. "" when cancelled. */
  const pickProject = useCallback(async (): Promise<string> => {
    const picked = await api.codingPickFolder().catch(() => null);
    if (!picked) return "";
    setProject(picked);
    try {
      localStorage.setItem(PROJECT_KEY, picked);
    } catch {
      /* only a convenience */
    }
    return picked;
  }, []);

  /** Deep research on (remembered on this PC). */
  const [deep, setDeep] = useState(() => {
    try {
      return localStorage.getItem(DEEP_KEY) === "1";
    } catch {
      return false;
    }
  });

  const send = useCallback(
    /**
     * `here`: carry on in the last reply instead of starting a new one —
     * after Allow / No, the result and the answer land in the same message
     * as the card, the way Claude Code shows a job: steps, then the answer.
     */
    async (text: string, note = false, here = false, images: string[] = []) => {
      let t = text.trim() || (images.length ? "What's in this picture?" : "");
      if (!t || busy) return;
      // "Continue" / "try again": the last thing asked, again — not a new
      // question for the AI to guess at (it once sent "continue" off to the
      // connected apps).
      const AGAIN = /^(?:continue|go on|keep going|carry on|try again|again|retry|do it again|finish it)[.!]*$/i;
      if (!note && AGAIN.test(t)) {
        const before = [...msgs].reverse().find((m) => m.role === "user" && m.content.trim() && !AGAIN.test(m.content.trim()));
        // Spelled out, so it goes where that request belongs and the
        // conversation still carries on from where it was.
        if (before) t = `Continue with my last request: ${before.content.trim()}`;
      }
      // "clear chat" / "start over" — just wipe it, don't ask the AI.
      if (!note && /^(clear|reset|wipe|empty|start over|new)( (the|this|our|my))? ?(chat|conversation|messages|history|it|over)?$/i.test(t)) {
        stop();
        setMsgs([]);
        setDraft("");
        return;
      }
      if (!note) setDraft("");
      // Typing "allow" / "yes" / "no" answers the card that's waiting — the
      // way the orb's chat bar does — instead of asking the AI about it.
      if (!note) {
        const bare = t.toLowerCase().replace(/[.!]+$/, "").trim();
        const last = msgs.length - 1;
        const waiting = !!msgs[last]?.action && !msgs[last]?.action?.state;
        const yes = /^(?:allow|allow it|yes|yep|yeah|yes do it|go ahead|do it|run it|ok|okay|sure|please do)$/.test(bare);
        const no = /^(?:no|nope|don'?t|do not|cancel|stop|don'?t do it)$/.test(bare);
        if (waiting && (yes || no)) {
          void answerRef.current(last, yes);
          return;
        }
        if (!waiting && /^(?:allow|allow it)$/.test(bare)) {
          setMsgs((m) => [...m, { role: "user", content: t }, { role: "assistant", content: "Nothing's waiting for your OK right now — tell me what you'd like me to do, and I'll show you before anything runs (or turn on ⚡ Auto to skip asking)." }]);
          return;
        }
      }
      // A just-flipped Ask/Auto switch is saved before the request goes out,
      // so Auto really runs without asking.
      await useIzuki.getState().flushSettings().catch(() => undefined);
      // Directions pasted from another AI or a guide ("1. Open Settings
      // 2. Click…"): Izuki does them on the screen instead of explaining them.
      if (!note && !here && !images.length && looksLikeDirections(t)) {
        setMsgs((m) => [
          ...m,
          { role: "user", content: t },
          { role: "assistant", content: "On it — I'll follow those steps on your screen, one by one. 🖥️ Press Esc to stop me." },
        ]);
        void sendChatCommand(t);
        return;
      }
      if (images.length) setPics([]);
      // Earlier replies carry what really happened (the steps, an allowed
      // command's output), so "u done?" is answered from facts, not memory.
      const history = [...msgs.filter((m) => !m.failed && !m.screen), { role: "user" as const, content: t, images }].map((m) => ({
        role: m.role,
        content:
          m.role === "assistant" && ("steps" in m || "ran" in m) && (m.steps?.length || m.ran)
            ? `${m.content}\n[Done for real: ${[...(m.steps ?? []), ...(m.ran ? [`result: ${m.ran}`] : [])].join(" | ")}]`
            : m.content,
        ...(m.images?.length ? { images: m.images } : {}),
      }));
      if (here) {
        setMsgs((m) => {
          if (!m.length) return m;
          const copy = m.slice();
          copy[copy.length - 1] = { ...copy[copy.length - 1], content: "", status: undefined, failed: undefined, retry: undefined };
          return copy;
        });
      } else {
        setMsgs((m) => [
          ...m,
          { role: "user", content: t, note, images: images.length ? images : undefined },
          { role: "assistant", content: "", status: firstStatus(t) },
        ]);
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
      // A short yes may answer something Izuki offered (offers.rs) — heard
      // before Code or Deep mode take the message.
      // (With a picture or a note, it's about those: the chat sees them.)
      if (!images.length && !note && !here && YES_REPLY.test(t) && t.trim().split(/\s+/).length <= 6) {
        const said = await api.instantCommand(t).catch(() => null);
        if (said) {
          setLast({ content: said, status: undefined });
          if (streamId.current === id) { streamId.current = null; setBusy(false); }
          return;
        }
      }
      // Coding mode (coding.rs): the task goes to Izuki's coding agent, in a
      // separate copy of the project.
      if (code && !note && !here) {
        const where = project || (await pickProject());
        if (!where) {
          setLast({ content: "Pick the project folder first (the 📁 next to Code), then ask again.", status: undefined });
          if (streamId.current === id) {
            streamId.current = null;
            setBusy(false);
          }
          return;
        }
        setLast({ status: undefined, coding: { project: where, phase: "working", steps: [], todo: [], files: [], task: id } });
        // This task's own message (by its id), so updates still land after Stop.
        const setThis = (patch: Partial<Msg> | ((m: Msg) => Partial<Msg>)) =>
          setMsgs((all) => all.map((x) => (x.coding?.task === id ? { ...x, ...(typeof patch === "function" ? patch(x) : patch) } : x)));
        await runCoding(id, where, t, history, setThis, finish);
        if (streamId.current === id) {
          streamId.current = null;
          setBusy(false);
        }
        return;
      }
      // Deep research (research.rs): many searches, many pages, an answer
      // with its sources — with the Deep switch on, or "research …".
      //
      // Never for a question about Izuki itself. With Deep on, "what are
      // Izuki's new features" ran ten web searches and read back GitHub pages
      // for releases a hundred versions old. The chat carries this build's own
      // release notes for exactly that question (selfknow.rs); the web can
      // only get it wrong.
      const aboutIzuki = !note && !here && !images.length ? await api.aboutIzuki(t) : false;
      if (streamId.current !== id) return;
      const researchQ = !note && !here && !images.length && !aboutIzuki ? (deep ? t : researchAsk(t, !!msgs[msgs.length - 1]?.research)) : null;
      if (researchQ) {
        setLast({ status: undefined, research: { question: researchQ, phase: "working", steps: [], sources: [] } });
        await runResearch(id, researchQ, history, setLast, finish);
        if (streamId.current === id) {
          streamId.current = null;
          setBusy(false);
        }
        return;
      }
      // The Later list ("remind me later I'm buying…", "what's on my list"): done at once.
      if (LATER.test(t) || INSTANT_ASK.test(t) || STORAGE_ASK.test(t)) {
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
        const off = on<{ id: number; text: string; done: boolean; error: string | null; status?: string; action?: Msg["action"]; step?: string; call?: ToolCall }>(EV.chatDelta, (d) => {
          if (d.id !== id || settled) return;
          // A tool it used: a card in this reply, and the wait starts over.
          if (d.call) {
            clearTimeout(slow);
            slow = setTimeout(giveUp, FIRST_WORDS_MS);
            const c = d.call;
            setLast((last) => ({ calls: [...(last.calls ?? []), c].slice(-12) }));
            return;
          }
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
    [busy, msgs, deep, code, project, pickProject]
  );

  const stop = () => {
    void api.cancelTask();
    if (streamId.current !== null) void api.chatCancel(streamId.current);
    // Told before the reply is let go, so it can show it stopped.
    finish.current?.("Stopped.");
    streamId.current = null;
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

  const answerRef = useRef(answer);
  answerRef.current = answer;
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
                  <span className="min-w-0 flex-1 truncate text-[12px] text-izk-ink">
                    {r.alarm ? "⏰ " : ""}
                    {r.text}
                    {r.repeat ? <span className="text-izk-muted"> · {r.repeat === "daily" ? "every day" : r.repeat === "weekdays" ? "weekdays" : r.repeat === "weekends" ? "weekends" : r.repeat.replace(/,/g, ", ")}</span> : null}
                  </span>
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
            {/* What this button switches, and nothing else ("· Save credits"
                beside it read like a second switch that wasn't there). */}
            {settings.control_style === "precision" ? "⚡ Jarvis mode — no mouse" : "↗ Mouse mode — moves the pointer"}
          </button>
          {/* (Ask first ↔ Auto lives once, beside the message box.) */}
          <AirToggle className="h-[26px]" />
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
                {String(m.content).startsWith("[I allowed")
                  ? "✓ You allowed it"
                  : String(m.content).startsWith("From the Island")
                    ? `🏝️ ${String(m.content).replace(/:$/, "")}`
                    : "✕ You said no"}
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
                {m.images?.length ? (
                  <div className="mb-1.5 flex flex-wrap gap-1.5">
                    {m.images.map((src, j) => (
                      <img key={j} src={src} alt="" className="max-h-[140px] max-w-[200px] rounded-[10px] object-cover" />
                    ))}
                  </div>
                ) : null}
                {m.calls && m.calls.length > 0 && <ToolCards calls={m.calls} />}
                {m.steps && m.steps.length > 0 && !m.calls?.length && <Steps steps={m.steps} />}
                {m.action && <ActionCard action={m.action} busy={busy} onAnswer={(allow) => void answer(i, allow)} ran={m.ran} />}
                {m.research && <ResearchPanel r={m.research} />}
                {m.coding && (
                  <CodingPanel
                    c={m.coding}
                    onChange={(patch) => setMsgs((all) => all.map((x, j) => (j === i && x.coding ? { ...x, coding: { ...x.coding, ...patch } } : x)))}
                  />
                )}
                {m.content ? (
                  m.role === "assistant" ? <ChatText text={m.content} /> : m.content
                ) : busy && i === msgs.length - 1 && !m.research && !m.coding ? (
                  <span className={cx("flex items-center gap-1.5 text-izk-muted", (!!m.steps?.length || !!m.action) && "mt-1.5")}>
                    <Loader2 size={13} className="animate-spin" /> {m.status ?? "Thinking…"}
                  </span>
                ) : null}
                {m.research?.phase === "done" && m.content && (
                  <ResearchPanel r={m.research} footer text={m.content} onContinue={i === msgs.length - 1 && !busy ? () => void send("continue the research") : undefined} />
                )}
                {m.role === "assistant" && m.content && !m.failed && !(busy && i === msgs.length - 1) && (
                  <ReplyTools text={m.content} onRetry={i === msgs.length - 1 ? () => retry(i) : undefined} onAsk={i === msgs.length - 1 ? (ask) => void send(ask) : undefined} />
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

        <div
          className="border-t border-white/8 p-[10px]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            if (!e.dataTransfer.files.length) return;
            e.preventDefault();
            void addPictures(Array.from(e.dataTransfer.files));
          }}
        >
          {pics.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {pics.map((p, i) => (
                <div key={i} className="relative">
                  <img src={p} alt="" className="h-[56px] w-[56px] rounded-[10px] border border-white/10 object-cover" />
                  <button
                    type="button"
                    aria-label="Remove picture"
                    onClick={() => setPics((all) => all.filter((_, j) => j !== i))}
                    className="absolute -right-1.5 -top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-black/70 text-white"
                  >
                    <X size={10} strokeWidth={2.8} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            ref={picker}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) void addPictures(Array.from(e.target.files));
              e.target.value = "";
            }}
          />
          <div className="flex items-end gap-1.5">
            <button
              type="button"
              onClick={() => picker.current?.click()}
              disabled={busy}
              aria-label="Add a picture"
              title="Add a picture (or paste one with Ctrl+V)"
              className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/6 hover:bg-white/10 disabled:opacity-40"
            >
              <Paperclip size={15} strokeWidth={2.3} className="text-izk-ink" />
            </button>
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
            {/* Deep research: Izuki searches and reads many pages, then answers with sources. */}
            <button
              type="button"
              onClick={() => {
                const next = !deep;
                setDeep(next);
                try {
                  localStorage.setItem(DEEP_KEY, next ? "1" : "0");
                } catch {
                  /* only a convenience */
                }
              }}
              aria-pressed={deep}
              title={deep ? "Deep research is on: Izuki searches the web, reads many pages and answers with its sources (about a minute). Tap to turn off." : "Deep research: Izuki searches the web, reads many pages and answers with its sources. Or just type “research …”."}
              className={cx(
                "flex h-[36px] shrink-0 items-center gap-1 rounded-full border px-2.5 text-[11px] font-semibold transition-colors",
                deep ? "border-izk-teal/50 bg-izk-teal/15 text-izk-teal" : "border-white/10 bg-white/6 text-izk-ink hover:bg-white/10"
              )}
            >
              🔭 Deep
            </button>
            <button
              type="button"
              onClick={() => {
                const next = !code;
                setCode(next);
                try {
                  localStorage.setItem(CODE_KEY, next ? "1" : "0");
                } catch {
                  /* only a convenience */
                }
                if (next && !project) void pickProject();
              }}
              aria-pressed={code}
              title={
                code
                  ? `Coding mode is on${project ? ` (${project})` : ""}: Izuki works like Claude Code in a separate copy of your project, runs the tests, and shows you the change to Apply or Discard. Tap to turn off.`
                  : "Coding mode: Izuki reads, edits and tests your project in a separate copy, then shows you the change to Apply or Discard."
              }
              className={cx(
                "flex h-[36px] shrink-0 items-center gap-1 rounded-full border px-2.5 text-[11px] font-semibold transition-colors",
                code ? "border-izk-teal/50 bg-izk-teal/15 text-izk-teal" : "border-white/10 bg-white/6 text-izk-ink hover:bg-white/10"
              )}
            >
              {"</>"} Code
            </button>
            {code && (
              <button
                type="button"
                onClick={() => void pickProject()}
                title={project ? `Project: ${project} — tap to pick another` : "Pick the project folder"}
                className="flex h-[36px] max-w-[120px] shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/6 px-2.5 text-[11px] text-izk-ink hover:bg-white/10"
              >
                📁 <span className="truncate">{project ? project.replace(/[\\/]+$/, "").split(/[\\/]/).pop() : "Pick…"}</span>
              </button>
            )}
            <textarea
              ref={input}
              value={draft}
              rows={1}
              onChange={(e) => setDraft(e.target.value)}
              onPaste={(e) => {
                const files = Array.from(e.clipboardData.files).filter((f) => f.type.startsWith("image/"));
                if (!files.length) return;
                e.preventDefault();
                void addPictures(files);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(draft, false, false, pics);
                }
              }}
              placeholder={dictation.listening ? "Listening…" : deep ? "What should I research?" : "Message Izuki"}
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
                onClick={() => void send(draft, false, false, pics)}
                disabled={!draft.trim() && !pics.length}
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

/** What a tool did, as a card. */
interface ToolCall {
  name: string;
  title: string;
  input: string;
  output: string;
  ok: boolean;
  /** "✓ Checked: …" — a look afterwards that it really happened. */
  proof?: string;
}

type Verdict = { v: "ok" | "warn" | "error"; note?: string };

/**
 * Did it work? The proof check wins: a command can end with a code (a file in
 * use, a folder already gone) and still have done the job — that's green, not
 * red. Red is kept for things that really failed.
 */
function verdictOf(call: ToolCall): Verdict {
  const proof = call.proof ?? /\[Proof check: ([^\]]+)\]/.exec(call.output)?.[1];
  const failed = /^(That didn't work|It didn't work|It finished with an error|It took over)/.test(call.output.trim());
  const skipped = /^Done — a few items were skipped/.test(call.output.trim());
  const warned = skipped || /(^|\n)Errors:/.test(call.output);
  if (proof) {
    if (!proof.trim().startsWith("✓")) return { v: "error", note: proof };
    return failed || warned ? { v: "ok", note: "A few items were skipped (in use or protected) — the check confirms it's done." } : { v: "ok" };
  }
  if (failed) {
    // "Ignore what you can't" commands end with a code when something was skipped.
    if (/SilentlyContinue/i.test(call.input) && !warned) return { v: "warn", note: "Finished — some items were skipped (in use or protected)." };
    return { v: "error" };
  }
  if (warned) return { v: "warn", note: skipped ? "Finished — some items were skipped (in use or protected)." : "Finished with warnings." };
  return call.ok ? { v: "ok" } : { v: "error" };
}

const VERDICT = {
  ok: { icon: "✓", tone: "text-izk-teal", edge: "border-izk-teal/25", label: "Done" },
  warn: { icon: "⚠", tone: "text-amber-300", edge: "border-amber-300/30", label: "Done, with warnings" },
  error: { icon: "✕", tone: "text-izk-danger", edge: "border-izk-danger/35", label: "Failed" },
} as const;

/** The tools it used — each a card with IN and OUT, like Claude Code. */
function ToolCards({ calls }: { calls: ToolCall[] }) {
  return (
    <div className="mb-2 flex flex-col gap-1.5">
      {calls.map((c, i) => (
        <ToolCard key={i} call={c} />
      ))}
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        void navigator.clipboard.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1200);
        }).catch(() => {});
      }}
      className="rounded p-1 text-izk-muted hover:bg-white/10 hover:text-izk-ink"
    >
      {done ? <Check size={11} className="text-izk-teal" /> : <Copy size={11} />}
    </button>
  );
}

function ToolCard({ call }: { call: ToolCall }) {
  const verdict = verdictOf(call);
  const look = VERDICT[verdict.v];
  const output = call.output.replace(/\n?\[Proof check: [^\]]+\]/, "").trim();
  const [closed, setClosed] = useState(false);
  const [all, setAll] = useState(false);
  const [big, setBig] = useState(false);
  const lines = output.split("\n");
  const long = lines.length > 6 || output.length > 500;
  const shown = all || !long ? output : lines.slice(0, 6).join("\n").slice(0, 500);
  const everything = `${call.name}: ${call.title}\n\n$ ${call.input}${output ? `\n\n${output}` : ""}`;
  return (
    <div className={`overflow-hidden rounded-[10px] border bg-black/30 font-mono text-[11px] leading-snug ${look.edge}`}>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={!closed}
        onClick={() => setClosed(!closed)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setClosed(!closed))}
        className="flex cursor-pointer items-center gap-2 border-b border-white/[0.06] px-2.5 py-1.5 font-sans hover:bg-white/[0.03]"
      >
        {closed ? <ChevronRight size={12} className="text-izk-muted" /> : <ChevronDown size={12} className="text-izk-muted" />}
        <span className={`font-bold ${look.tone}`} title={look.label}>{look.icon}</span>
        <span className="font-semibold text-izk-ink">{call.name}</span>
        <span className="min-w-0 flex-1 truncate text-[11.5px] text-izk-muted" title={call.title}>{call.title}</span>
        <CopyButton text={everything} label="Copy all" />
        <button type="button" title="Expand" aria-label="Expand" onClick={(e) => { e.stopPropagation(); setBig(true); }} className="rounded p-1 text-izk-muted hover:bg-white/10 hover:text-izk-ink">
          <Maximize2 size={11} />
        </button>
      </div>
      {!closed && (
        <div className="grid grid-cols-[34px_1fr] gap-x-1 px-2.5 py-1.5">
          <span className="text-[10px] text-izk-muted/70">IN</span>
          <div className="group relative min-w-0">
            <pre className="max-h-[90px] overflow-auto whitespace-pre-wrap break-all pr-6 text-izk-ink/90">{call.input}</pre>
            <span className="absolute right-0 top-0 opacity-0 transition-opacity group-hover:opacity-100"><CopyButton text={call.input} label="Copy command" /></span>
          </div>
          {output && (
            <>
              <span className="mt-1 text-[10px] text-izk-muted/70">OUT</span>
              <div className="group relative mt-1 min-w-0">
                <pre className={"whitespace-pre-wrap break-words rounded-[6px] bg-white/[0.04] p-1.5 pr-7 " + (verdict.v === "error" ? "text-izk-danger/90" : "text-izk-muted")}>{shown}</pre>
                <span className="absolute right-0.5 top-0.5 opacity-0 transition-opacity group-hover:opacity-100"><CopyButton text={output} label="Copy output" /></span>
                {long && (
                  <button type="button" onClick={() => setAll(!all)} className="mt-0.5 font-sans text-[10.5px] text-izk-muted underline-offset-2 hover:text-izk-ink hover:underline">
                    {all ? "Show less" : `Show all (${lines.length} lines)`}
                  </button>
                )}
              </div>
            </>
          )}
          {verdict.note && (
            <>
              <span />
              <p className={`mt-1 font-sans text-[10.5px] ${look.tone}`}>{verdict.note}</p>
            </>
          )}
        </div>
      )}
      {big && <ToolViewer call={call} output={output} verdict={verdict} onClose={() => setBig(false)} />}
    </div>
  );
}

/** A card, full screen: everything it ran and printed, to read, wrap and copy. */
function ToolViewer({ call, output, verdict, onClose }: { call: ToolCall; output: string; verdict: Verdict; onClose: () => void }) {
  const [wrap, setWrap] = useState(true);
  const look = VERDICT[verdict.v];
  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);
  const pre = `${wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre overflow-x-auto"} rounded-[8px] bg-black/40 p-2.5 font-mono text-[11.5px] leading-relaxed`;
  return (
    <div role="dialog" aria-modal="true" aria-label={`${call.name}: ${call.title}`} className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className={`flex max-h-full w-full max-w-[860px] flex-col overflow-hidden rounded-[14px] border bg-[#0d1018] shadow-2xl ${look.edge}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2 font-sans text-[12px]">
          <span className={`font-bold ${look.tone}`}>{look.icon}</span>
          <span className="font-semibold text-izk-ink">{call.name}</span>
          <span className="min-w-0 flex-1 truncate text-izk-muted">{call.title}</span>
          <span className={`text-[11px] ${look.tone}`}>{look.label}</span>
          <button type="button" className="izk-pill px-2 py-0.5 text-[11px]" aria-pressed={wrap} onClick={() => setWrap(!wrap)}>{wrap ? "Wrap: on" : "Wrap: off"}</button>
          <button type="button" title="Close (Esc)" aria-label="Close" onClick={onClose} className="rounded p-1 text-izk-muted hover:bg-white/10 hover:text-izk-ink"><Minimize2 size={14} /></button>
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-auto p-3">
          <section>
            <div className="mb-1 flex items-center justify-between font-sans text-[10.5px] uppercase tracking-wide text-izk-muted"><span>In</span><CopyButton text={call.input} label="Copy command" /></div>
            <pre className={pre + " text-izk-ink/90"}>{call.input}</pre>
          </section>
          {output && (
            <section>
              <div className="mb-1 flex items-center justify-between font-sans text-[10.5px] uppercase tracking-wide text-izk-muted"><span>Out · {output.split("\n").length} lines</span><CopyButton text={output} label="Copy output" /></div>
              <pre className={pre + (verdict.v === "error" ? " text-izk-danger/90" : " text-izk-muted")}>{output}</pre>
            </section>
          )}
          {verdict.note && <p className={`font-sans text-[11.5px] ${look.tone}`}>{verdict.note}</p>}
        </div>
      </div>
    </div>
  );
}

/** A change it wants to make — Allow / No — or, once answered, what happened. */
function ActionCard({ action, busy, onAnswer, ran }: { action: NonNullable<Msg["action"]>; busy: boolean; onAnswer: (allow: boolean) => void; ran?: string }) {
  // Allowed and done: the same card as any other tool, with what it printed.
  if (action.state === "allowed" && ran !== undefined) {
    const proof = /\[Proof check: ([^\]]+)\]/.exec(ran)?.[1];
    return (
      <div className="mb-2">
        <ToolCard
          call={{
            name: action.kind === "save" ? "Save file" : "PowerShell",
            title: proof ?? action.title,
            input: action.detail,
            output: ran.replace(/\n?\[Proof check: [^\]]+\]/, "").trim(),
            ok: !/^(That didn't work|It didn't work|It finished with an error)/.test(ran) && !ran.includes("\nErrors:"),
            proof,
          }}
        />
      </div>
    );
  }
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

/** Copy, read it out loud, or ask again — under each finished reply — and
 * a ⋯ menu like ChatGPT's: shorter, simpler, more, translate, save, share. */
function ReplyTools({ text, onRetry, onAsk }: { text: string; onRetry?: () => void; onAsk?: (ask: string) => void }) {
  const [copied, setCopied] = useState(false);
  const [more, setMore] = useState(false);
  const [saved, setSaved] = useState("");
  const [lang, setLang] = useState<string | null>(null);
  const menu = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(""), 2500);
    return () => clearTimeout(t);
  }, [saved]);
  useEffect(() => {
    if (!more) return;
    const away = (e: MouseEvent) => {
      if (!menu.current?.contains(e.target as Node)) setMore(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMore(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [more]);
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
      <span ref={menu} className="relative">
        <button type="button" className={btn} title="More" aria-haspopup="menu" aria-expanded={more} onClick={() => setMore((v) => !v)}>
          ⋯
        </button>
        {more && (
          <div role="menu" className="absolute left-0 top-[24px] z-20 flex w-[170px] flex-col rounded-xl border border-white/12 bg-[#151826] p-1 text-[11.5px] shadow-xl">
            {(
              [
                ["Make it shorter", () => onAsk?.("Make that shorter.")],
                ["Explain it simpler", () => onAsk?.("Explain that more simply, like I'm new to it.")],
                ["Tell me more", () => onAsk?.("Tell me more about that.")],
                ["Translate…", () => setLang("")],
                [
                  "Save as a note",
                  () =>
                    void api
                      .notesLesson(text)
                      .then(() => setSaved("Saved to Notes ✓"))
                      .catch(() => setSaved("Couldn't save it")),
                ],
                [
                  "Share",
                  () => {
                    const nav = navigator as Navigator & { share?: (d: { text: string }) => Promise<void> };
                    if (nav.share) void nav.share({ text }).catch(() => undefined);
                    else
                      void navigator.clipboard
                        .writeText(text)
                        .then(() => setSaved("Copied to share ✓"))
                        .catch(() => setSaved("Couldn't copy it"));
                  },
                ],
              ] as Array<[string, () => void]>
            )
              .filter(([label]) => onAsk || !["Make it shorter", "Explain it simpler", "Tell me more", "Translate…"].includes(label))
              .map(([label, act]) => (
                <button
                  key={label}
                  type="button"
                  role="menuitem"
                  className="rounded-lg px-2 py-1.5 text-left text-izk-ink hover:bg-white/10"
                  onClick={() => {
                    setMore(false);
                    act();
                  }}
                >
                  {label}
                </button>
              ))}
          </div>
        )}
      </span>
      {lang !== null && (
        <form
          className="flex items-center gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            if (lang.trim()) onAsk?.(`Translate that into ${lang.trim()}.`);
            setLang(null);
          }}
        >
          <input
            autoFocus
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setLang(null)}
            placeholder="Into which language?"
            aria-label="Translate into which language"
            className="h-[22px] w-[140px] rounded-md border border-white/12 bg-white/5 px-1.5 text-[11px] text-izk-ink outline-none"
          />
          <button type="submit" className={btn}>Go</button>
        </form>
      )}
      {saved && <span className="self-center text-[10.5px] text-izk-teal">{saved}</span>}
    </div>
  );
}
