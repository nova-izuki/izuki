import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlarmClock, Check, Mic, Pause, Pencil, Play, Settings2, SkipBack, SkipForward, Square } from "lucide-react";
import { api, emit, EV, on } from "../lib/ipc";
import { workArea } from "../lib/floating";
import type { Activity, IslandStatus, NowPlaying, OrbState, Reminder, Suggestion } from "../lib/types";

/**
 * The Island: a black pill at the top of the screen, like a phone's live
 * activities. Hidden to a faint line when there's nothing to say; it shows
 * what Izuki is doing (with Stop), what's playing (cover, ⏮ ⏯ ⏭), the next
 * reminder, and a "Finished" tick — and push the mouse to the top edge (or
 * rest it on the pill) and it opens with big buttons: Talk, Draw, Open Izuki.
 *
 * Its little face is Izuki's orb with eyes: they follow your mouse, blink,
 * squish when poked (and go dizzy if you keep poking), and it dances while
 * music plays.
 *
 * Click-through until it opens, so a pill sitting over a browser tab never
 * eats a click meant for the tab: quick clicks pass straight through; it
 * only opens (and catches clicks) after the mouse rests on it.
 */

// ------------------------------------------------------------- pointer feed
// The overlay gets the cursor ~80 times a second. Re-rendering for each one
// would be wasteful, so the Island listens here and only sets state when
// something actually changes; the eyes are moved straight on the DOM.
type PointerFn = (x: number, y: number) => void;
const pointerFns = new Set<PointerFn>();
/** Feed a cursor position in overlay client px (called by OverlayCanvas). */
export function islandPointer(x: number, y: number) {
  pointerFns.forEach((f) => f(x, y));
}

/** How long the mouse rests on the pill (or the top edge) before it opens. */
const DWELL_MS = 260;
const CLOSE_AFTER_MS = 700;
/** Pushing the mouse into the top edge this close to the middle opens it. */
const EDGE_BAND = 260;
const FINISHED_MS = 2200;
const REMINDER_SOON_MS = 30 * 60_000;
/** A helpful suggestion peeks out this long, then tucks away. */
const PEEK_MS = 7000;
/** The same page or app never gets a second peek this soon… */
const PEEK_SAME_MS = 10 * 60_000;
/** …and peeks are never closer together than this. */
const PEEK_GAP_MS = 90_000;

type Live =
  | { kind: "finished" }
  | { kind: "working"; text: string }
  | { kind: "reminder"; r: Reminder; urgent: boolean }
  | { kind: "suggest"; s: Suggestion }
  | { kind: "music"; m: NowPlaying }
  | { kind: "focus"; secs: number }
  | { kind: "activity"; a: Activity }
  | { kind: "rest" };

export function Island({
  orb,
  doing,
  thinking,
  peeks = true,
  visualizing = false,
  onVisualize,
  onPlaying,
}: {
  orb: OrbState;
  doing: string | null;
  thinking: boolean;
  /** Let a helpful suggestion peek out on its own (setting). */
  peeks?: boolean;
  /** Music mode is showing (the orb flowing with the music). */
  visualizing?: boolean;
  onVisualize?: () => void;
  /** Music started or stopped on the PC. */
  onPlaying?: (playing: boolean) => void;
}) {
  const [status, setStatus] = useState<IslandStatus>({ media: null, fullscreen: false, suggestions: [], context: "" });
  const [peek, setPeek] = useState<Suggestion | null>(null);
  const peeked = useRef(new Map<string, number>());
  const lastPeek = useRef(0);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [open, setOpen] = useState(false);
  const [finished, setFinished] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const pill = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);
  openRef.current = open;

  // ---- what Izuki is doing
  const busy = thinking || orb === "thinking";
  const busySince = useRef(0);
  const orbRef = useRef(orb);
  orbRef.current = orb;
  useEffect(() => {
    if (busy) {
      busySince.current = Date.now();
      setFinished(false);
      return;
    }
    const long = busySince.current && Date.now() - busySince.current > 1500;
    busySince.current = 0;
    if (!long) return;
    // A real task (not a blink of "thinking") just ended: a short tick —
    // unless Izuki is now answering out loud (a conversation isn't over).
    let hide = 0;
    const look = window.setTimeout(() => {
      if (orbRef.current !== "hidden") return;
      setFinished(true);
      hide = window.setTimeout(() => setFinished(false), FINISHED_MS);
    }, 400);
    return () => {
      clearTimeout(look);
      clearTimeout(hide);
    };
  }, [busy]);

  // ---- what's playing / full screen: a cheap look every couple of seconds
  useEffect(() => {
    let alive = true;
    let timer = 0;
    const look = async () => {
      if (!document.hidden) {
        const s = await api.islandStatus().catch(() => null);
        if (alive && s) setStatus((prev) => (same(prev, s) ? prev : s));
      }
      if (alive) timer = window.setTimeout(look, openRef.current ? 1000 : 2000);
    };
    void look();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  // ---- reminders, and a clock for "in 12 min"
  useEffect(() => {
    const load = () => void api.remindersList().then(setReminders).catch(() => undefined);
    load();
    const off = on<void>(EV.remindersChanged, load);
    const tick = window.setInterval(() => setNow(Date.now()), 20_000);
    return () => {
      void off.then((f) => f());
      clearInterval(tick);
    };
  }, []);
  const next = reminders.filter((r) => r.at > now).sort((a, b) => a.at - b.at)[0];
  const soon = next && next.at - now <= REMINDER_SOON_MS ? next : undefined;

  // ---- open on dwell, close shortly after the mouse leaves
  useEffect(() => {
    let dwellTimer = 0;
    let closeTimer = 0;
    let wantOpen = false;
    const fn: PointerFn = (x, y) => {
      const wa = workArea();
      const mid = (wa.left + wa.right) / 2;
      const r = pill.current?.getBoundingClientRect();
      const margin = openRef.current ? 18 : 2;
      const overPill = !!r && r.width > 0 && x >= r.left - margin && x <= r.right + margin && y >= r.top - margin && y <= r.bottom + margin;
      const atEdge = y <= wa.top + 3 && Math.abs(x - mid) < EDGE_BAND;
      const want = overPill || atEdge;
      if (want === wantOpen) return;
      wantOpen = want;
      clearTimeout(dwellTimer);
      clearTimeout(closeTimer);
      if (want && !openRef.current) dwellTimer = window.setTimeout(() => setOpen(true), DWELL_MS);
      if (!want && openRef.current) closeTimer = window.setTimeout(() => setOpen(false), CLOSE_AFTER_MS);
    };
    pointerFns.add(fn);
    return () => {
      pointerFns.delete(fn);
      clearTimeout(dwellTimer);
      clearTimeout(closeTimer);
    };
  }, []);

  // ---- a gentle peek when something worth helping with comes up
  useEffect(() => {
    // Something just copied counts too: "Translate what you copied?"
    const strong = status.clip?.[0] ?? status.suggestions.find((x) => x.strong);
    if (!peeks || !strong || busy || status.fullscreen || !status.context) return;
    const t = Date.now();
    const key = `${status.context}|${strong.label}|${strong.ask.slice(0, 60)}`;
    if (t - (peeked.current.get(key) ?? 0) < PEEK_SAME_MS || t - lastPeek.current < PEEK_GAP_MS) return;
    peeked.current.set(key, t);
    lastPeek.current = t;
    setPeek(strong);
    // Only a new page/app (or new suggestion) is news — not every look.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.context, status.suggestions[0]?.label, status.clip?.[0]?.ask, peeks]);
  // Its own timer, so a page change mid-peek can't leave it stuck up.
  useEffect(() => {
    if (!peek) return;
    const hide = setTimeout(() => setPeek(null), PEEK_MS);
    return () => clearTimeout(hide);
  }, [peek]);
  useEffect(() => {
    if (busy) setPeek(null);
  }, [busy]);

  // A new download, screenshot or charge: news on the pill for ~10 s, then
  // it waits in the open Island. Timers count down on the pill throughout.
  const firstSeen = useRef(new Map<string, number>());
  const acts = status.activities ?? [];
  for (const a of acts) if (!firstSeen.current.has(a.id)) firstSeen.current.set(a.id, Date.now());
  const fresh = acts.find((a) => a.kind !== "timer" && (a.kind === "downloading" || Date.now() - (firstSeen.current.get(a.id) ?? 0) < 10_000));
  const timer = acts.find((a) => a.kind === "timer");
  const media = status.media;
  const musicOn = !!media?.playing;
  const onPlayingRef = useRef(onPlaying);
  onPlayingRef.current = onPlaying;
  useEffect(() => onPlayingRef.current?.(musicOn), [musicOn]);
  const live: Live = finished
    ? { kind: "finished" }
    : busy
      ? { kind: "working", text: doing || "Thinking…" }
      : soon && soon.at - now <= 5 * 60_000
        ? { kind: "reminder", r: soon, urgent: true }
        : peek
          ? { kind: "suggest", s: peek }
          : fresh
          ? { kind: "activity", a: fresh }
          : timer
          ? { kind: "activity", a: timer }
          : status.focus_left
          ? { kind: "focus", secs: status.focus_left }
          : media?.playing
          ? { kind: "music", m: media }
          : soon
            ? { kind: "reminder", r: soon, urgent: false }
            : { kind: "rest" };

  const dancing = !!media?.playing;
  if (status.fullscreen && !open) return null;

  const wa = workArea();
  return (
    <div className="pointer-events-none fixed z-[60] flex justify-center" style={{ left: wa.left, width: wa.right - wa.left, top: wa.top + 6 }}>
      <motion.div
        ref={pill}
        layout
        data-izk-hit={open ? "" : undefined}
        transition={{ type: "spring", stiffness: 520, damping: 38, mass: 0.8 }}
        className={
          "izk-island relative overflow-hidden text-white " +
          (open ? "pointer-events-auto" : "pointer-events-none") +
          (live.kind === "rest" && !open ? " izk-island-rest" : "") +
          (open ? " izk-island-open" : "")
        }
        style={{ borderRadius: open ? 28 : 22 }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {open ? (
            <motion.div key="open" {...fade} className="relative z-10 w-[372px] max-w-[calc(100vw-32px)] p-3.5">
              <Expanded
                live={live}
                media={media}
                suggestions={busy ? [] : [...(status.clip ?? []), ...status.suggestions].slice(0, 4)}
                activities={acts}
                weather={status.weather ?? null}
                copies={status.copies ?? []}
                next={next}
                now={now}
                dancing={dancing}
                busy={busy}
                doing={doing}
                visualizing={visualizing}
                onVisualize={onVisualize}
                onDone={() => setOpen(false)}
              />
            </motion.div>
          ) : live.kind === "rest" ? (
            <motion.div key="rest" {...fade} className="h-[5px] w-[72px]" />
          ) : (
            <motion.div key={live.kind} {...fade} className="flex h-[34px] items-center gap-2.5 pl-1.5 pr-3">
              <Compact live={live} dancing={dancing} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

const fade = {
  initial: { opacity: 0, scale: 0.92, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.92, filter: "blur(4px)" },
  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
};

function same(a: IslandStatus, b: IslandStatus) {
  const m = a.media;
  const n = b.media;
  const labels = (s?: Suggestion[]) => (s ?? []).map((x) => x.label + x.ask.length).join("|");
  return (
    a.fullscreen === b.fullscreen &&
    // A different window in front, something copied, the focus clock ticking:
    // all changes. (Only music used to count, so the suggestions stayed on
    // whatever app was in front first.)
    a.context === b.context &&
    labels(a.suggestions) === labels(b.suggestions) &&
    labels(a.clip) === labels(b.clip) &&
    JSON.stringify(a.activities ?? []) === JSON.stringify(b.activities ?? []) &&
    (a.copies ?? []).join("\u0001") === (b.copies ?? []).join("\u0001") &&
    Math.floor((a.focus_left ?? -60) / 60) === Math.floor((b.focus_left ?? -60) / 60) &&
    (m === n || (!!m && !!n && m.title === n.title && m.artist === n.artist && m.playing === n.playing && m.app === n.app && m.art === n.art))
  );
}

// ------------------------------------------------------------------ compact

function Compact({ live, dancing }: { live: Live; dancing: boolean }) {
  switch (live.kind) {
    case "finished":
      return (
        <>
          <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-emerald-500/90">
            <Check size={15} strokeWidth={3} />
          </span>
          <span className="text-[13px] font-semibold">Finished</span>
        </>
      );
    case "working":
      return (
        <>
          <Face size={24} mood="busy" />
          <span className="max-w-[300px] truncate text-[13px] font-medium text-white/90">{live.text}</span>
          <Dots />
        </>
      );
    case "activity":
      return (
        <>
          <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-white/12 text-[13px]">{live.a.icon}</span>
          <span className="max-w-[200px] truncate text-[13px] font-medium text-white/90">{live.a.title}</span>
          <span className={"text-[12.5px] text-white/60" + (live.a.kind === "timer" ? " tabular-nums" : "")}>{live.a.detail}</span>
        </>
      );
    case "focus":
      return (
        <>
          <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-violet-500/80 text-[13px]">🎯</span>
          <span className="text-[13px] font-semibold tabular-nums text-white/90">
            Focus · {Math.ceil(live.secs / 60)} min left
          </span>
        </>
      );
    case "music":
      return (
        <>
          <Cover m={live.m} size={24} />
          <span className="max-w-[180px] truncate text-[13px] font-medium text-white/90">{live.m.title}</span>
          <Bars playing={live.m.playing} />
        </>
      );
    case "suggest":
      return (
        <>
          <span className="izk-sparkle flex h-[24px] w-[24px] items-center justify-center rounded-full text-[13px]">{live.s.icon}</span>
          <span className="max-w-[240px] truncate text-[13px] font-medium text-white/90">{live.s.label}?</span>
        </>
      );
    case "reminder":
      return (
        <>
          <span className={"flex h-[24px] w-[24px] items-center justify-center rounded-full " + (live.urgent ? "bg-amber-500" : "bg-white/12")}>
            <AlarmClock size={14} strokeWidth={2.4} />
          </span>
          <span className="max-w-[220px] truncate text-[13px] font-medium text-white/90">
            {live.r.text} · {until(live.r.at)}
          </span>
        </>
      );
    default:
      return <Face size={24} mood={dancing ? "dancing" : "idle"} />;
  }
}

// ----------------------------------------------------------------- expanded

function Expanded({
  live,
  media,
  suggestions,
  next,
  now,
  dancing,
  busy,
  doing,
  visualizing,
  onVisualize,
  onDone,
  activities = [],
  copies = [],
  weather = null,
}: {
  weather?: [string, number, string] | null;
  activities?: Activity[];
  copies?: string[];
  visualizing?: boolean;
  onVisualize?: () => void;
  live: Live;
  media: NowPlaying | null;
  suggestions: Suggestion[];
  next: Reminder | undefined;
  now: number;
  dancing: boolean;
  busy: boolean;
  doing: string | null;
  onDone: () => void;
}) {
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const playing = optimistic ?? !!media?.playing;
  useEffect(() => setOptimistic(null), [media?.playing, media?.title]);
  const control = useCallback((a: "play" | "pause" | "next" | "previous") => {
    if (a === "play" || a === "pause") setOptimistic(a === "play");
    void api.mediaControl(a);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Face size={40} mood={busy ? "busy" : live.kind === "finished" ? "happy" : dancing ? "dancing" : "idle"} pokeable />
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold leading-tight">{busy ? "On it" : greeting(now)}</div>
          <div className="truncate text-[12.5px] text-white/60">
            {busy
              ? doing || "Thinking…"
              : live.kind === "finished"
                ? "All finished."
                : weather
                  ? `${weather[2].split(" ")[0]} ${weather[1]}° in ${weather[0]} · ask me anything`
                  : "Ask me anything — or show me."}
          </div>
        </div>
        <div className="text-[22px] font-semibold tabular-nums tracking-tight text-white/90">{clock(now)}</div>
      </div>

      {busy && (
        <button
          type="button"
          onClick={() => {
            void api.cancelTask();
            void emit(EV.stopSpeaking);
          }}
          className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-red-500/90 text-[14px] font-semibold transition active:scale-[0.97] hover:bg-red-500"
        >
          <Square size={14} fill="currentColor" /> Stop
        </button>
      )}

      {media && (
        <div className="flex items-center gap-3 rounded-2xl bg-white/[0.07] p-2.5">
          <Cover m={media} size={52} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-semibold">{media.title}</div>
            <div className="truncate text-[12px] text-white/55">{[media.artist, media.app].filter(Boolean).join(" · ")}</div>
            <div className="mt-1 flex gap-1.5">
              {onVisualize && (
                <button
                  type="button"
                  onClick={onVisualize}
                  className={
                    "rounded-full px-2 py-[3px] text-[11px] font-semibold transition " +
                    (visualizing ? "bg-fuchsia-500/80 text-white" : "bg-white/10 text-white/80 hover:bg-white/16")
                  }
                >
                  {visualizing ? "✨ Flowing" : "✨ Flow with it"}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onDone();
                  const by = media.artist ? ` by ${media.artist}` : "";
                  void emit(EV.runChat, { id: Date.now(), text: `Tell me about the song "${media.title}"${by} — what it's about, and one interesting thing about it. Keep it short.` });
                }}
                className="rounded-full bg-white/10 px-2 py-[3px] text-[11px] font-semibold text-white/80 transition hover:bg-white/16"
              >
                About this song
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <RoundButton label="Previous" onClick={() => control("previous")}>
              <SkipBack size={17} fill="currentColor" />
            </RoundButton>
            <RoundButton label={playing ? "Pause" : "Play"} onClick={() => control(playing ? "pause" : "play")} big>
              {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="translate-x-[1px]" />}
            </RoundButton>
            <RoundButton label="Next" onClick={() => control("next")}>
              <SkipForward size={17} fill="currentColor" />
            </RoundButton>
          </div>
        </div>
      )}

      {next && (
        <div className="flex items-center gap-3 rounded-2xl bg-white/[0.07] px-3 py-2.5">
          <AlarmClock size={18} className="shrink-0 text-amber-400" />
          <div className="min-w-0 flex-1 truncate text-[13.5px]">{next.text}</div>
          <div className="shrink-0 text-[12.5px] text-white/55">{when(next.at, now)}</div>
        </div>
      )}

      {activities.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="px-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/40">Happening now</div>
          {activities.map((a) => (
            <div key={a.id} className="rounded-2xl bg-white/[0.07] px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-[17px]">{a.icon}</span>
                <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium">{a.title}</span>
                <span className={"shrink-0 text-[12.5px] text-white/55" + (a.kind === "timer" ? " tabular-nums" : "")}>{a.detail}</span>
              </div>
              {a.actions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {a.actions.map((x) => (
                    <button
                      key={x.label}
                      type="button"
                      onClick={() => {
                        if (x.op.startsWith("ask:")) {
                          onDone();
                          void emit(EV.runChat, { id: Date.now(), text: x.op.slice(4) });
                        } else {
                          void api.activityDo(x.op).then((said) => {
                            if (said) void emit(EV.say, { text: said });
                          });
                        }
                      }}
                      className="rounded-full bg-white/[0.1] px-3 py-1 text-[12px] font-medium transition hover:bg-white/[0.18] active:scale-[0.97]"
                    >
                      {x.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {copies.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="px-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/40">Recent copies</div>
          <div className="flex flex-wrap gap-1.5">
            {copies.slice(0, 4).map((c, i) => (
              <button
                key={i + c}
                type="button"
                title="Copy this again"
                onClick={() => void api.copyAgain(i)}
                className="max-w-[160px] truncate rounded-full bg-white/[0.07] px-3 py-1 text-[12px] text-white/80 transition hover:bg-white/[0.14]"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="px-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/40">Suggested for you</div>
          {suggestions.map((sg) => (
            <button
              key={sg.label}
              type="button"
              onClick={() => {
                onDone();
                void emit(EV.runChat, { id: Date.now(), text: sg.ask });
              }}
              className={
                "flex h-11 items-center gap-2.5 rounded-2xl px-3 text-left text-[13.5px] font-medium transition active:scale-[0.98] " +
                (sg.strong ? "izk-suggest-strong" : "bg-white/[0.07] hover:bg-white/[0.12]")
              }
            >
              <span className="text-[17px]">{sg.icon}</span>
              <span className="min-w-0 flex-1 truncate">{sg.label}</span>
              <span className="text-white/35">›</span>
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <BigAction
          label="Talk"
          onClick={() => {
            onDone();
            void emit(EV.pushToTalk);
          }}
        >
          <Mic size={20} />
        </BigAction>
        <BigAction
          label="Draw"
          onClick={() => {
            onDone();
            void api.openOverlay();
          }}
        >
          <Pencil size={19} />
        </BigAction>
        <BigAction
          label="Open Izuki"
          onClick={() => {
            onDone();
            void api.showConfig();
          }}
        >
          <Settings2 size={19} />
        </BigAction>
      </div>
    </div>
  );
}

function RoundButton({ children, label, onClick, big }: { children: React.ReactNode; label: string; onClick: () => void; big?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={
        "flex items-center justify-center rounded-full transition active:scale-90 " +
        (big ? "h-11 w-11 bg-white text-black hover:bg-white/90" : "h-9 w-9 text-white/85 hover:bg-white/10")
      }
    >
      {children}
    </button>
  );
}

function BigAction({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[62px] flex-col items-center justify-center gap-1 rounded-2xl bg-white/[0.08] text-[12.5px] font-medium text-white/90 transition hover:bg-white/[0.14] active:scale-[0.96]"
    >
      {children}
      {label}
    </button>
  );
}

// ---------------------------------------------------------------- the face

type Mood = "idle" | "busy" | "happy" | "dancing";

/**
 * Izuki's orb with eyes. The eyes look toward the mouse (moved straight on
 * the DOM — no re-render per cursor move), blink now and then, squish into
 * "> <" when poked, and spin dizzy after a few pokes in a row.
 */
function Face({ size, mood, pokeable }: { size: number; mood: Mood; pokeable?: boolean }) {
  const eyes = useRef<HTMLDivElement>(null);
  const [poke, setPoke] = useState<"none" | "squish" | "dizzy">("none");
  const pokes = useRef<number[]>([]);

  useEffect(() => {
    const fn: PointerFn = (x, y) => {
      const el = eyes.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = x - (r.left + r.width / 2);
      const dy = y - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const reach = size * 0.09;
      const k = Math.min(1, d / 160);
      el.style.transform = `translate(${((dx / d) * reach * k).toFixed(2)}px, ${((dy / d) * reach * k).toFixed(2)}px)`;
    };
    pointerFns.add(fn);
    return () => void pointerFns.delete(fn);
  }, [size]);

  useEffect(() => {
    if (poke === "none") return;
    const t = setTimeout(() => setPoke("none"), poke === "dizzy" ? 2000 : 520);
    return () => clearTimeout(t);
  }, [poke]);

  const onPoke = () => {
    const t = Date.now();
    pokes.current = [...pokes.current.filter((p) => t - p < 1800), t];
    setPoke(pokes.current.length >= 4 ? "dizzy" : "squish");
    if (pokes.current.length >= 4) pokes.current = [];
  };

  const eyeW = Math.max(3, size * 0.12);
  const eyeH = Math.max(5, size * 0.22);
  const bob =
    poke === "squish"
      ? { scaleX: [1, 1.18, 0.95, 1], scaleY: [1, 0.8, 1.05, 1] }
      : mood === "happy"
        ? { y: [0, -size * 0.18, 0, -size * 0.08, 0] }
        : mood === "dancing"
          ? { y: [0, -size * 0.07, 0], rotate: [0, -6, 0, 6, 0] }
          : { y: 0, rotate: 0, scaleX: 1, scaleY: 1 };
  const bobRepeat = mood === "dancing" && poke === "none" ? Infinity : 0;

  return (
    <motion.div
      animate={bob}
      transition={{ duration: mood === "dancing" ? 0.9 : 0.5, repeat: bobRepeat, ease: "easeInOut" }}
      onClick={pokeable ? onPoke : undefined}
      className={"izk-face relative shrink-0 rounded-full " + (mood === "busy" ? "izk-face-busy" : "") + (pokeable ? " cursor-pointer" : "")}
      style={{ width: size, height: size }}
    >
      <div className="izk-face-liquid absolute inset-0 rounded-full" />
      <div ref={eyes} className="absolute inset-0 flex items-center justify-center" style={{ gap: size * 0.16, transition: "transform 120ms ease-out" }}>
        {poke === "squish" ? (
          <>
            <span className="font-black leading-none text-white" style={{ fontSize: size * 0.3 }}>&gt;</span>
            <span className="font-black leading-none text-white" style={{ fontSize: size * 0.3 }}>&lt;</span>
          </>
        ) : poke === "dizzy" ? (
          <>
            <span className="izk-dizzy leading-none text-white" style={{ fontSize: size * 0.3 }}>@</span>
            <span className="izk-dizzy leading-none text-white" style={{ fontSize: size * 0.3 }}>@</span>
          </>
        ) : mood === "happy" ? (
          <>
            <span className="leading-none text-white" style={{ fontSize: size * 0.32, fontWeight: 900 }}>^</span>
            <span className="leading-none text-white" style={{ fontSize: size * 0.32, fontWeight: 900 }}>^</span>
          </>
        ) : (
          <>
            <span className="izk-eye block rounded-full bg-white" style={{ width: eyeW, height: eyeH }} />
            <span className="izk-eye block rounded-full bg-white" style={{ width: eyeW, height: eyeH }} />
          </>
        )}
      </div>
    </motion.div>
  );
}

// ------------------------------------------------------------------- bits

function Cover({ m, size }: { m: NowPlaying; size: number }) {
  return m.art ? (
    <img src={m.art} alt="" className="shrink-0 rounded-[8px] object-cover" style={{ width: size, height: size }} />
  ) : (
    <div
      className="flex shrink-0 items-center justify-center rounded-[8px] bg-gradient-to-br from-fuchsia-500 via-violet-600 to-cyan-500 font-bold"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      ♪
    </div>
  );
}

function Bars({ playing }: { playing: boolean }) {
  return (
    <span className={"izk-bars flex h-[14px] items-end gap-[2px] " + (playing ? "" : "izk-bars-still")}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="block w-[3px] rounded-full bg-gradient-to-t from-fuchsia-400 to-cyan-300" style={{ animationDelay: `${i * -0.21}s` }} />
      ))}
    </span>
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

function clock(t: number) {
  return new Date(t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function greeting(t: number) {
  const h = new Date(t).getHours();
  return h < 5 ? "Up late?" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function until(at: number) {
  const mins = Math.max(0, Math.round((at - Date.now()) / 60_000));
  return mins <= 0 ? "now" : mins < 60 ? `in ${mins} min` : `in ${Math.round(mins / 60)} h`;
}

function when(at: number, now: number) {
  const d = new Date(at);
  const today = new Date(now).toDateString() === d.toDateString();
  return at - now < 60 * 60_000 ? until(at) : today ? clock(at) : d.toLocaleDateString([], { weekday: "short" }) + " " + clock(at);
}
