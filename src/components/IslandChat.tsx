import { useEffect, useRef, useState } from "react";
import { Brain, FileText, GripHorizontal, History, Monitor, Paperclip, Pin, Plus, Square, Wand2, X } from "lucide-react";
import { api, emit, EV, ISLAND_CHATS_KEY, ISLAND_DEEP_KEY, on } from "../lib/ipc";
import { markHit } from "../lib/hitTest";
import { AirToggle } from "./AirToggle";
import { ChatText } from "./ChatText";

type PageTurn = { role: "user" | "assistant"; content: string };
type PagePiece = { id: number; text: string; done: boolean; error?: string | null; page?: string | null };

/** Reveal text a little at a time, catching up faster the further behind it is. */
function useTypewriter(text: string) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (text.length < n) setN(0);
  }, [text, n]);
  useEffect(() => {
    if (n >= text.length) return;
    const step = Math.max(1, Math.ceil((text.length - n) / 14));
    const t = setTimeout(() => setN((v) => Math.min(text.length, v + step)), 16);
    return () => clearTimeout(t);
  }, [n, text]);
  return text.slice(0, n);
}

/** Something added with + : a photo, a text file's words, or a fresh look at the screen. */
type AskFile = { name: string; kind: "image" | "text" | "screen"; data: string };
/** A saved Island conversation: its tab, and where it was asked. */
type SavedAsk = { id: number; title: string; where: string; turns: PageTurn[]; at: number; pinned?: boolean };

const ASK_FILE_TYPES = "image/*,.txt,.md,.csv,.json,.log,.py,.js,.ts,.tsx,.jsx,.html,.css,.xml,.yaml,.yml,.rs,.java,.c,.cpp,.cs,.go,.sql";
/** The most unpinned chats kept (pinned ones are always kept). */
const KEEP_ASKS = 12;
const ACTIVE_ASK_KEY = "izuki.island-active-chat.v1";

function ago(at: number) {
  const m = Math.round((Date.now() - at) / 60_000);
  return m < 1 ? "just now" : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : new Date(at).toLocaleDateString([], { month: "short", day: "numeric" });
}

function loadAsks(): SavedAsk[] {
  try {
    const raw = JSON.parse(localStorage.getItem(ISLAND_CHATS_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((c) => c && typeof c.id === "number" && Array.isArray(c.turns))
      .map((c) => ({
        id: c.id,
        title: String(c.title || "Chat"),
        where: String(c.where || ""),
        at: Number(c.at) || c.id,
        pinned: !!c.pinned,
        turns: c.turns
          .filter((t: PageTurn) => t && (t.role === "user" || t.role === "assistant") && typeof t.content === "string")
          .slice(-16),
      }))
      .filter((c) => c.turns.length > 0);
  } catch {
    return [];
  }
}

function storeAsks(list: SavedAsk[]): SavedAsk[] {
  const pinned = list.filter((c) => c.pinned);
  const rest = list.filter((c) => !c.pinned).sort((a, b) => b.at - a.at).slice(0, KEEP_ASKS);
  const kept = [...pinned, ...rest].sort((a, b) => b.at - a.at);
  try {
    localStorage.setItem(ISLAND_CHATS_KEY, JSON.stringify(kept));
  } catch {
    /* storage full / private — the chat still works, it just isn't kept */
  }
  return kept;
}

/** A file from the + menu, ready to send (photos made small, text files read). */
async function askFile(f: File): Promise<AskFile | string> {
  if (f.type.startsWith("image/")) {
    const data = await new Promise<string>((resolve, reject) => {
      const url = URL.createObjectURL(f);
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
    }).catch(() => "");
    return data ? { name: f.name, kind: "image", data } : `I couldn't open “${f.name}”.`;
  }
  if (f.size > 400_000) return `“${f.name}” is too big — I can read text files up to 400 KB.`;
  const words = await f.text().catch(() => "");
  // A binary file read as text is mostly replacement characters.
  if (!words.trim() || (words.match(/�/g)?.length ?? 0) > words.length / 50) return `I can't read “${f.name}” — try a photo or a text file.`;
  return { name: f.name, kind: "text", data: words };
}

/** "Ask about this page" — like asking Gemini in Chrome, from the Island.
 * Izuki reads the page in front (and, with the browser extension, the
 * pages it links to that matter) and the answer types itself out here.
 * Away from the browser it asks about the screen. + adds photos, files or
 * a screenshot; "Do it for me" hands the steps to the screen agent; every
 * conversation is kept as a tab to come back to (or carry on in Chat). */
export function AskPage({ page, onHold, onClose, onDetach, onDragHandle }: { page: string | null; onHold?: (on: boolean) => void; onClose: () => void; onDetach?: () => void; onDragHandle?: (event: React.PointerEvent) => void }) {
  const [draft, setDraft] = useState("");
  const [focused, setFocused] = useState(false);
  const [asked, setAsked] = useState("");
  const [full, setFull] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [copied, setCopied] = useState(false);
  /** Finished turns of this conversation (user, assistant, …). */
  const [turns, setTurns] = useState<PageTurn[]>([]);
  const [files, setFiles] = useState<AskFile[]>([]);
  const [menu, setMenu] = useState(false);
  const [saved, setSaved] = useState<SavedAsk[]>(() => loadAsks());
  const [allChats, setAllChats] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  /** Deep thinking: slower, reasoned answers (remembered between uses). */
  const [deep, setDeep] = useState(() => {
    try { return localStorage.getItem(ISLAND_DEEP_KEY) === "1"; } catch { return false; }
  });
  const toggleDeep = () =>
    setDeep((v) => {
      try { localStorage.setItem(ISLAND_DEEP_KEY, v ? "0" : "1"); } catch { /* storage is optional */ }
      return !v;
    });
  /** Whether the answer in progress was asked deeply (for its "thinking" line). */
  const [askedDeep, setAskedDeep] = useState(false);
  const turnsRef = useRef<PageTurn[]>([]);
  const chatId = useRef<number | null>(null);
  const current = useRef(0);
  const asking = useRef("");
  const answer = useRef("");
  const picker = useRef<HTMLInputElement>(null);
  const shown = useTypewriter(full);
  const where = page || "your screen";

  const setLog = (next: PageTurn[]) => {
    turnsRef.current = next;
    setTurns(next);
  };
  const reset = () => {
    if (current.current) void api.pageAskCancel(current.current);
    current.current = 0;
    chatId.current = null;
    try { localStorage.removeItem(ACTIVE_ASK_KEY); } catch { /* optional persistence */ }
    setLog([]);
    setAsked("");
    setDraft("");
    setFull("");
    setError(null);
    setWorking(false);
    setFiles([]);
    setNote(null);
  };

  // Page changes keep this thread. "New chat" starts a fresh one explicitly.
  useEffect(() => () => {
    if (current.current) void api.pageAskCancel(current.current);
  }, []);
  // Keep the Island open while typing, choosing, or while there's an answer to read.
  const onHoldRef = useRef(onHold);
  onHoldRef.current = onHold;
  const holding = focused || !!asked || menu || allChats || files.length > 0;
  useEffect(() => onHoldRef.current?.(holding), [holding]);
  useEffect(() => () => onHoldRef.current?.(false), []);

  const keep = (log: PageTurn[]) => {
    const first = log.find((t) => t.role === "user")?.content ?? "Chat";
    const id = chatId.current ?? Date.now();
    chatId.current = id;
    try { localStorage.setItem(ACTIVE_ASK_KEY, String(id)); } catch { /* optional persistence */ }
    setSaved((list) => {
      const was = list.find((c) => c.id === id);
      const chat: SavedAsk = { id, title: was?.title ?? (first.length > 40 ? first.slice(0, 39) + "…" : first), where: was?.where ?? (page || "Your screen"), turns: log.slice(-16), at: Date.now(), pinned: was?.pinned };
      return storeAsks([chat, ...list.filter((c) => c.id !== id)]);
    });
  };

  useEffect(() => {
    const off = on<PagePiece>(EV.pageAnswer, (p) => {
      if (!p || p.id !== current.current) return;
      if (p.text) {
        answer.current += p.text;
        setFull(answer.current);
      }
      if (p.done) {
        current.current = 0;
        setWorking(false);
        if (p.error && !answer.current) {
          // The question went unanswered: it isn't part of the conversation.
          setError(p.error);
        } else {
          const log = [...turnsRef.current, { role: "user" as const, content: asking.current }, { role: "assistant" as const, content: answer.current }].slice(-16);
          setLog(log);
          keep(log);
        }
      }
    });
    return () => void off.then((f) => f());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const send = (text?: string) => {
    const q = (text ?? draft).trim();
    if (!q || working || current.current) return;
    const id = Date.now();
    current.current = id;
    asking.current = q;
    answer.current = "";
    setAsked(q);
    setDraft("");
    setFull("");
    setError(null);
    setCopied(false);
    setMenu(false);
    setAllChats(false);
    setNote(null);
    setWorking(true);
    const sending = files;
    setFiles([]);
    setAskedDeep(deep);
    void api.pageAsk(id, q, turnsRef.current.slice(-8), sending, !page, deep).catch((e) => {
      if (current.current !== id) return;
      current.current = 0;
      setWorking(false);
      setError(e instanceof Error ? e.message : String(e));
    });
  };
  const stop = () => {
    if (current.current) void api.pageAskCancel(current.current);
    current.current = 0;
    setWorking(false);
  };
  useEffect(() => {
    const cancel = () => {
      if (current.current) void api.pageAskCancel(current.current);
      current.current = 0;
      setWorking(false);
    };
    window.addEventListener("izuki:island-chat-cancel", cancel);
    return () => window.removeEventListener("izuki:island-chat-cancel", cancel);
  }, []);
  const close = () => {
    stop();
    onHoldRef.current?.(false);
    onClose();
  };
  const open = (c: SavedAsk) => {
    stop();
    chatId.current = c.id;
    try { localStorage.setItem(ACTIVE_ASK_KEY, String(c.id)); } catch { /* optional persistence */ }
    setLog(c.turns);
    const lastQ = [...c.turns].reverse().find((t) => t.role === "user")?.content ?? "";
    const lastA = c.turns[c.turns.length - 1]?.role === "assistant" ? c.turns[c.turns.length - 1].content : "";
    setAsked(lastQ);
    setFull(lastA);
    setError(null);
    setAllChats(false);
    setNote(c.where && c.where !== (page || "Your screen") ? `Asked on “${c.where}”` : null);
  };
  useEffect(() => {
    // Opening the UI resumes a thread; it must never create a new history
    // entry just because the Island collapsed, moved or the app reopened.
    try {
      const id = Number(localStorage.getItem(ACTIVE_ASK_KEY));
      const previous = loadAsks().find((c) => c.id === id);
      if (previous) open(previous);
    } catch { /* a fresh conversation still works */ }
    // Restored once. Page changes and layout changes preserve this instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const pin = (c: SavedAsk) => setSaved((list) => storeAsks(list.map((x) => (x.id === c.id ? { ...x, pinned: !x.pinned } : x))));
  const forget = (c: SavedAsk) => {
    if (chatId.current === c.id) reset();
    setSaved((list) => storeAsks(list.filter((x) => x.id !== c.id)));
  };
  /** Clear all means all, including pinned threads. Confirm with a second tap. */
  const [clearing, setClearing] = useState(false);
  const clearAll = () => {
    if (!clearing) {
      setClearing(true);
      return;
    }
    setClearing(false);
    reset();
    setSaved(storeAsks([]));
  };
  // "Do it for me": the steps go to the screen agent, which does them with
  // Stop on the Island the whole way.
  const doIt = () => {
    const steps = full.trim().slice(0, 1500);
    close();
    void emit(EV.runChat, { id: Date.now(), text: `On my screen, do this for me: ${asked}\n\nThe steps you gave me:\n${steps}` });
  };
  // Carry the conversation on in Chat (Chat may open after this event has
  // gone by, so it waits in shared storage too).
  const toChat = () => {
    onDetach?.();
  };
  const addFiles = async (list: FileList | null) => {
    setMenu(false);
    if (!list?.length) return;
    const ready = await Promise.all([...list].slice(0, 4).map(askFile));
    const ok = ready.filter((r): r is AskFile => typeof r !== "string");
    const problems = ready.filter((r): r is string => typeof r === "string");
    // Room is counted on what's attached now (another pick may have landed
    // while these were being read).
    setFiles((now) => {
      const room = Math.max(0, 4 - now.length);
      setNote(problems[0] ?? (ok.length > room || list.length > 4 ? "Up to 4 things at a time." : null));
      return [...now, ...ok.slice(0, room)];
    });
  };
  const addScreen = () => {
    setMenu(false);
    if (files.some((f) => f.kind === "screen")) return;
    if (files.length >= 4) return setNote("Up to 4 things at a time.");
    setFiles((f) => [...f, { name: "Screenshot", kind: "screen", data: "" }]);
  };

  const ideas = page ? ["Sum this page up", "What should I do here?", "Explain it simply"] : ["What do I do here?", "Explain what's on my screen", "What does this error mean?"];
  const tabs = [...saved.filter((c) => c.pinned), ...saved.filter((c) => !c.pinned)].slice(0, 4);
  const earlier = asked && !working && !error && full && turns.length >= 2 && turns[turns.length - 1].content === full ? turns.slice(0, -2) : turns;
  const chip = "rounded-full bg-white/10 px-2 py-[3px] text-[11px] font-medium text-white/80 transition hover:bg-white/16";

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white/[0.07] p-2.5">
      <div className="flex items-center gap-2">
        <div role="button" tabIndex={0} aria-label="Drag Island chat out" onPointerDown={onDragHandle} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onDetach?.(); } }} className="flex min-w-0 flex-1 cursor-grab items-center gap-2 py-1 text-[12px] font-semibold text-white/75"><GripHorizontal size={14} /> Island chat</div>
        <button type="button" onClick={onDetach} className="rounded-full bg-white/10 px-2 py-1 text-[11px]">Pop out</button>
      </div>
      {saved.length > 0 && (
        <div className="flex items-center gap-1 overflow-hidden">
          <button type="button" onClick={reset} aria-label="New chat" title="New chat" className="flex h-6 shrink-0 items-center rounded-full bg-white/10 px-2.5 text-[11px] font-semibold text-white/85 hover:bg-white/16">
            New
          </button>
          {tabs.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => open(c)}
              title={`${c.title} — ${c.where}`}
              className={
                "h-6 min-w-0 max-w-[110px] shrink truncate rounded-full px-2 text-[11px] font-medium transition " +
                (chatId.current === c.id ? "bg-fuchsia-500/70 text-white" : "bg-white/[0.06] text-white/70 hover:bg-white/12")
              }
            >
              {c.pinned ? "📌 " : ""}
              {c.title}
            </button>
          ))}
          <button type="button" onClick={() => setAllChats((v) => !v)} aria-label="All saved chats" title="All saved chats" className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white">
            <History size={12} />
          </button>
        </div>
      )}
      {allChats && (
        <div className="max-h-[180px] overflow-y-auto rounded-xl bg-black/30 p-1 [scrollbar-width:thin]">
          {saved.length > 0 && (
            <div className="flex items-center justify-between px-1.5 pb-1 text-[10.5px] text-white/45">
              <span>{saved.length} saved</span>
              <button
                type="button"
                onClick={clearAll}
                onBlur={() => setClearing(false)}
                className={"rounded-full px-2 py-0.5 font-semibold transition " + (clearing ? "bg-rose-500/80 text-white" : "text-white/60 hover:bg-white/10 hover:text-rose-300")}
              >
                {clearing ? `Clear all ${saved.length}? Tap again` : "Clear all history"}
              </button>
            </div>
          )}
          {saved.map((c) => (
            <div key={c.id} className="group flex items-center gap-1 rounded-lg px-1.5 py-1 hover:bg-white/[0.06]">
              <button type="button" onClick={() => open(c)} className="min-w-0 flex-1 text-left">
                <div className="truncate text-[12px] text-white/90">{c.title}</div>
                <div className="truncate text-[10.5px] text-white/45">
                  {c.where} · {ago(c.at)}
                </div>
              </button>
              <button type="button" onClick={() => pin(c)} aria-label={c.pinned ? "Unpin" : "Pin"} title={c.pinned ? "Unpin" : "Pin — kept for good"} className={"flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/10 " + (c.pinned ? "text-amber-300" : "text-white/45")}>
                <Pin size={11} />
              </button>
              <button type="button" onClick={() => forget(c)} aria-label="Delete chat" title="Delete" className="flex h-6 w-6 items-center justify-center rounded-full text-white/45 hover:bg-white/10 hover:text-rose-300">
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => {
              void api.setOverlayInteractive(true).then(() => markHit());
              setMenu((v) => !v);
            }}
            aria-label="Add a photo, file or screenshot"
            title="Add a photo, file or screenshot"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/85 hover:bg-white/20"
          >
            <Plus size={13} />
          </button>
          {menu && (
            <div className="absolute left-0 top-7 z-20 flex w-max min-w-[180px] flex-col whitespace-nowrap rounded-xl bg-[#17171a] p-1 shadow-2xl ring-1 ring-white/12">
              <button type="button" onClick={() => picker.current?.click()} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] text-white/90 hover:bg-white/10">
                <Paperclip size={13} /> Photo or file
              </button>
              <button type="button" onClick={addScreen} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] text-white/90 hover:bg-white/10">
                <Monitor size={13} /> Screenshot of my screen
              </button>
            </div>
          )}
          <input ref={picker} type="file" multiple accept={ASK_FILE_TYPES} className="hidden" onChange={(e) => { void addFiles(e.target.files); e.target.value = ""; }} />
        </div>
        <button
          type="button"
          onClick={toggleDeep}
          aria-pressed={deep}
          aria-label="Deep thinking"
          title={deep ? "Deep thinking is on — slower, carefully reasoned answers" : "Deep thinking — for hard questions: slower, carefully reasoned answers"}
          className={
            "flex h-6 shrink-0 items-center gap-1 rounded-full px-2 text-[11px] font-semibold transition " +
            (deep ? "bg-violet-500/80 text-white" : "bg-white/10 text-white/70 hover:bg-white/20")
          }
        >
          <Brain size={12} /> Deep
        </button>
        <AirToggle variant="mini" className="h-6 w-6" />
        <input
          value={draft}
          // The overlay doesn't take the keyboard by itself: ask for it.
          onMouseDown={() => void api.setOverlayInteractive(true).then(() => markHit())}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
          }}
          placeholder={asked ? "Ask a follow-up…" : `Ask about ${page ? `“${page.length > 30 ? page.slice(0, 29) + "…" : page}”` : "your screen"}`}
          aria-label={`Ask about ${where}`}
          className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-white/45"
        />
        {working ? (
          <button type="button" onClick={stop} aria-label="Stop" className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/85 hover:bg-white/20">
            <Square size={11} fill="currentColor" />
          </button>
        ) : (
          <button type="submit" disabled={!draft.trim()} aria-label="Ask" className="rounded-full bg-white px-2.5 py-1 text-[12px] font-semibold text-black transition hover:bg-white/90 disabled:opacity-35">
            Ask
          </button>
        )}
        {asked && (
          <button type="button" onClick={close} aria-label="Close" className="flex h-7 w-7 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white">
            <X size={13} />
          </button>
        )}
      </form>
      {files.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {files.map((f, i) => (
            <span key={`${f.name}-${i}`} className="flex max-w-[150px] items-center gap-1 rounded-full bg-white/10 py-[2px] pl-1 pr-1.5 text-[11px] text-white/85">
              {f.kind === "image" ? <img src={f.data} alt="" className="h-4 w-4 rounded-full object-cover" /> : f.kind === "screen" ? <Monitor size={11} /> : <FileText size={11} />}
              <span className="truncate">{f.name}</span>
              <button type="button" onClick={() => setFiles((all) => all.filter((_, j) => j !== i))} aria-label={`Remove ${f.name}`} className="text-white/55 hover:text-white">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
      {note && <div className="text-[11px] text-amber-200/90">{note}</div>}
      {!asked && (
        <div className="flex flex-wrap gap-1.5">
          {ideas.map((q) => (
            <button key={q} type="button" onClick={() => send(q)} className={chip}>
              {q}
            </button>
          ))}
        </div>
      )}
      {asked && (
        <div className="max-h-[220px] overflow-y-auto pr-1 text-[13px] leading-snug text-white/90 [scrollbar-width:thin]">
          {earlier.map((t, i) =>
            t.role === "user" ? (
              <div key={i} className="mb-1 mt-2 text-[11.5px] text-white/50 first:mt-0">{t.content}</div>
            ) : (
              <div key={i} className="text-white/75">
                <ChatText text={t.content} />
              </div>
            )
          )}
          <div className={"mb-1 text-[11.5px] text-white/50 " + (earlier.length ? "mt-2" : "")}>{asked}</div>
          {error ? (
            <div className="text-[12.5px] text-rose-300">{error}</div>
          ) : shown ? (
            <ChatText text={shown} />
          ) : askedDeep ? (
            <div className="flex items-center gap-2 text-[12px] text-violet-200/90">
              <Brain size={13} className="animate-pulse" /> Thinking it through…
            </div>
          ) : (
            <Dots />
          )}
        </div>
      )}
      {asked && !working && !error && full && (
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={doIt} title="Izuki does these steps on your screen — Stop any time" className="flex items-center gap-1 rounded-full bg-fuchsia-500/85 px-2.5 py-[3px] text-[11px] font-semibold text-white transition hover:bg-fuchsia-500">
            <Wand2 size={11} /> Do it for me
          </button>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(full).then(() => setCopied(true)).catch(() => undefined);
            }}
            className={chip}
          >
            {copied ? "Copied" : "Copy"}
          </button>
          <button type="button" onClick={toChat} className={chip}>
            Continue in Chat
          </button>
          <button type="button" onClick={reset} className={chip}>
            New chat
          </button>
        </div>
      )}
    </div>
  );
}

function Dots() {
  return (
    <span className="izk-dots flex gap-[3px]">
      {[0, 1, 2].map((i) => (
        <span key={i} className="block h-[4px] w-[4px] rounded-full bg-white/70" style={{ animationDelay: `${i * 0.16}s` }} />
      ))}
    </span>
  );
}

