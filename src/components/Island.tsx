import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlarmClock, Camera, Check, GripHorizontal, Mic, Pause, Pencil, Play, Settings2, SkipBack, SkipForward, Sparkles, Square, X } from "lucide-react";
import { api, CAMERA_PICTURE_KEY, emit, EV, IS_TAURI, on } from "../lib/ipc";
import { workArea } from "../lib/floating";
import { lockHit, markHit, unlockHit } from "../lib/hitTest";
import { IslandPal, type PalCue } from "./IslandPal";
import { listCameras, openCamera, saveCamera } from "../lib/camera";
import type { Activity, IslandStatus, NowPlaying, OrbState, Reminder, Suggestion } from "../lib/types";
import type { IslandVitals } from "../lib/ipc";

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
/** Follow the pointer too (the 3D face looks at it). Returns a stop function. */
export function watchPointer(fn: (x: number, y: number) => void): () => void {
  pointerFns.add(fn);
  return () => void pointerFns.delete(fn);
}

export function islandPointer(x: number, y: number) {
  pointerFns.forEach((f) => f(x, y));
}
// Outside the app (the browser preview checks) there's no cursor feed:
// let a script point at the Island instead.
if (typeof window !== "undefined" && !IS_TAURI) (window as unknown as { izukiPoint?: typeof islandPointer }).izukiPoint = islandPointer;

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
const ISLAND_POSITION_KEY = "izk.islandPosition.v1";
const ISLAND_WIDTH = 372;

type IslandPosition = { x: number; y: number };

/** The Island's size setting as a scale (Settings → Island size). */
function islandScale(size: string): number {
  return size === "small" ? 0.88 : size === "large" ? 1.15 : 1;
}

/** "Move it anywhere" (setting): the Island isn't held to the top strip. */
let freeMove = false;

/** Kept on screen at its real (scaled) width. */
function fitIslandPosition(position: IslandPosition, scale = 1): IslandPosition {
  const wa = workArea();
  const half = (ISLAND_WIDTH * scale) / 2;
  return {
    x: Math.min(wa.right - half, Math.max(wa.left + half, position.x)),
    // Keep it in a top rail: movable away from tabs/address fields without
    // letting a short drag strand it over the middle of the screen — unless
    // "Move it anywhere" is on.
    y: Math.min(freeMove ? wa.bottom - 48 : wa.top + 120, Math.max(wa.top + 6, position.y)),
  };
}

function loadIslandPosition(): IslandPosition {
  const wa = workArea();
  const fallback = { x: (wa.left + wa.right) / 2, y: wa.top + 6 };
  try {
    const saved = JSON.parse(localStorage.getItem(ISLAND_POSITION_KEY) || "null") as IslandPosition | null;
    return saved && Number.isFinite(saved.x) && Number.isFinite(saved.y) ? fitIslandPosition(saved) : fallback;
  } catch {
    return fallback;
  }
}

type Live =
  | { kind: "finished" }
  | { kind: "working"; text: string }
  | { kind: "reminder"; r: Reminder; urgent: boolean }
  | { kind: "suggest"; s: Suggestion }
  | { kind: "music"; m: NowPlaying }
  | { kind: "focus"; secs: number }
  | { kind: "missions"; now: string; left: number; step: string | null }
  | { kind: "lesson"; text: string }
  | { kind: "activity"; a: Activity }
  | { kind: "approval"; id: string; app: string; text: string }
  | { kind: "lecture"; title: string; secs: number }
  | { kind: "error"; message: string }
  | { kind: "remote"; device: string; controlling: boolean }
  | { kind: "sitedown"; name: string; url: string }
  | { kind: "due"; count: number; title: string; at: number }
  /** You're talking to Izuki (hands-free or holding the talk key). */
  | { kind: "listening" }
  /** Izuki is answering out loud. */
  | { kind: "speaking" }
  | { kind: "rest" };

export function Island({
  orb,
  doing,
  thinking,
  peeks = true,
  always = true,
  free = false,
  wave = "auto",
  look = "default",
  size = "normal",
  visualizing = false,
  onVisualize,
  onPlaying,
}: {
  orb: OrbState;
  doing: string | null;
  thinking: boolean;
  /** Let a helpful suggestion peek out on its own (setting). */
  peeks?: boolean;
  /** Always at the top like an iPhone's Dynamic Island (setting). */
  always?: boolean;
  /** Drag it anywhere on screen (setting); off: a strip along the top. */
  free?: boolean;
  /** The waveform style while music plays (setting). */
  wave?: string;
  /** The Island's look (setting island_style): Windhawk-style themes. */
  look?: string;
  /** "small", "normal" or "large" (setting island_size). */
  size?: string;
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
  freeMove = free;
  /** Holding the talk key (the orb stays away then): you're being heard. */
  const [talking, setTalking] = useState(false);
  useEffect(() => {
    const off = on<string>(EV.talkWave, (state) => setTalking(state === "listening"));
    return () => void off.then((f) => f());
  }, []);
  const [position, setPosition] = useState<IslandPosition>(loadIslandPosition);
  const positionRef = useRef(position);
  positionRef.current = position;
  // The setting arrives after the first paint: the saved place again, now
  // held to the top strip or not.
  useEffect(() => {
    setPosition(loadIslandPosition());
  }, [free]);
  const scaleRef = useRef(islandScale(size));
  scaleRef.current = islandScale(size);
  const [finished, setFinished] = useState(false);
  /** Something went wrong (a status error): shown with a way to recover, then fades. */
  const [failure, setFailure] = useState<string | null>(null);
  /** A phone watching or controlling this PC (remote.rs). */
  const [remote, setRemote] = useState<{ device: string; controlling: boolean } | null>(null);
  /** Right-click menu, where it opened (in the Island's own box). */
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  /** "Hide for an hour" from the menu (until then, only approvals and errors show). */
  const [quietUntil, setQuietUntil] = useState(0);
  /** "Wake up" from the menu during quiet hours: shown again until they end. */
  const [woke, setWoke] = useState(false);
  /** A down website the user dismissed (shown again if another goes down). */
  const [siteSeen, setSiteSeen] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const pill = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);
  openRef.current = open;
  // Held open while you're asking about the page or reading the answer —
  // moving the mouse away mustn't throw the answer away.
  // Each thing holding it (the Ask box, the quick note) counts on its own.
  const holders = useRef(new Set<string>());
  const holdRef = useRef(false);
  const wantRef = useRef(false);
  const hold = useCallback((on: boolean, who = "ask") => {
    if (on) holders.current.add(who);
    else holders.current.delete(who);
    const any = holders.current.size > 0;
    if (holdRef.current === any) return;
    holdRef.current = any;
    if (!any) {
      window.setTimeout(() => {
        if (!wantRef.current && !holdRef.current) setOpen(false);
      }, CLOSE_AFTER_MS);
    }
  }, []);
  useEffect(() => {
    const changed = (event: Event) => hold(!!(event as CustomEvent<boolean>).detail, "island-chat");
    window.addEventListener("izuki:island-chat-hold", changed);
    return () => window.removeEventListener("izuki:island-chat-hold", changed);
  }, [hold]);

  // ---- what Izuki is doing
  const busy = thinking || orb === "thinking";
  const busySince = useRef(0);
  // The active drag's cleanup, so an unmount while dragging can't leave
  // pointer listeners or hit testing locked.
  const dragCleanup = useRef<(() => void) | null>(null);
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

  // ---- the task's to-do list (brain.rs keeps it; ticked as Izuki works)
  const [todo, setTodo] = useState<TodoItem[]>([]);
  useEffect(() => {
    const off = on<TodoItem[]>(EV.taskTodo, (items) => setTodo(Array.isArray(items) ? items.slice(0, 10) : []));
    return () => void off.then((f) => f());
  }, []);

  // ---- errors (with a way to recover) and remote sessions
  useEffect(() => {
    let hide = 0;
    const offStatus = on<{ kind: string; message: string }>(EV.status, (s) => {
      if (s.kind !== "error" || !s.message) return;
      setFailure(s.message);
      clearTimeout(hide);
      hide = window.setTimeout(() => setFailure(null), 15_000);
    });
    const offRemote = on<{ device: string; controlling: boolean } | null>(EV.remoteActive, (v) => setRemote(v ?? null));
    return () => {
      clearTimeout(hide);
      void offStatus.then((f) => f());
      void offRemote.then((f) => f());
    };
  }, []);
  // A new task replaces an old failure.
  useEffect(() => {
    if (busy) setFailure(null);
  }, [busy]);
  // The menu goes when the Island closes.
  useEffect(() => {
    if (!open) setMenu(null);
  }, [open]);

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
  const coming = reminders.filter((r) => r.at > now).sort((a, b) => a.at - b.at);
  const next = coming[0];
  /** Cancel one (gone from the list at once; the core tells every window). */
  const cancelReminder = (id: string) => {
    setReminders((list) => list.filter((r) => r.id !== id));
    void api.reminderRemove(id).catch(() =>
      api
        .remindersList()
        .then(setReminders)
        .catch(() => undefined)
    );
  };
  const soon = next && next.at - now <= REMINDER_SOON_MS ? next : undefined;

  // ---- open on dwell, close shortly after the mouse leaves
  useEffect(() => {
    let dwellTimer = 0;
    let closeTimer = 0;
    let wantOpen = false;
    const fn: PointerFn = (x, y) => {
      const wa = workArea();
      const r = pill.current?.getBoundingClientRect();
      const islandMiddle = r ? r.left + r.width / 2 : positionRef.current.x;
      const margin = openRef.current ? 18 : 2;
      const overPill = !!r && r.width > 0 && x >= r.left - margin && x <= r.right + margin && y >= r.top - margin && y <= r.bottom + margin;
      const atEdge = y <= wa.top + 3 && Math.abs(x - islandMiddle) < EDGE_BAND;
      const want = overPill || atEdge;
      wantRef.current = want;
      if (want === wantOpen) return;
      wantOpen = want;
      clearTimeout(dwellTimer);
      clearTimeout(closeTimer);
      if (want && !openRef.current) dwellTimer = window.setTimeout(() => setOpen(true), DWELL_MS);
      if (!want && openRef.current && !holdRef.current) closeTimer = window.setTimeout(() => setOpen(false), CLOSE_AFTER_MS);
    };
    pointerFns.add(fn);
    return () => {
      pointerFns.delete(fn);
      clearTimeout(dwellTimer);
      clearTimeout(closeTimer);
    };
  }, []);

  useEffect(() => {
    const fit = () => setPosition((current) => fitIslandPosition(current, scaleRef.current));
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // Settings → Island → Left / Top centre / Right.
  useEffect(() => {
    const off = on<{ where: "left" | "center" | "right" }>(EV.islandPlace, (e) => {
      const wa = workArea();
      const half = ISLAND_WIDTH / 2;
      const x = e.where === "left" ? wa.left + half + 8 : e.where === "right" ? wa.right - half - 8 : (wa.left + wa.right) / 2;
      const next = fitIslandPosition({ x, y: wa.top + 6 }, scaleRef.current);
      setPosition(next);
      try { localStorage.setItem(ISLAND_POSITION_KEY, JSON.stringify(next)); } catch { /* position persistence is optional */ }
    });
    return () => void off.then((f) => f());
  }, []);

  const beginMove = useCallback((event: React.PointerEvent) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    // A second drag while one is already in flight would leak the first
    // cleanup, so run the old one before starting fresh.
    dragCleanup.current?.();
    dragCleanup.current = null;
    const start = positionRef.current;
    const sx = event.clientX;
    const sy = event.clientY;
    lockHit();
    const move = (e: PointerEvent) => setPosition(fitIslandPosition({ x: start.x + e.clientX - sx, y: start.y + e.clientY - sy }, scaleRef.current));
    const cleanup = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      unlockHit();
      try { localStorage.setItem(ISLAND_POSITION_KEY, JSON.stringify(positionRef.current)); } catch { /* position persistence is optional */ }
      // Clear the ref when this cleanup runs, so pointerup and an unmount
      // can't both fire it.
      if (dragCleanup.current === cleanup) dragCleanup.current = null;
    };
    const up = cleanup;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    dragCleanup.current = cleanup;
  }, []);

  // A drag can end after the Island is gone — closing the app mid-drag used to
  // leave pointer listeners and hit testing locked, so the overlay stopped
  // responding to clicks. The active cleanup is always run on unmount.
  useEffect(() => () => dragCleanup.current?.(), []);

  const moveByKeyboard = useCallback((event: React.KeyboardEvent) => {
    const direction: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
    };
    const delta = direction[event.key];
    if (!delta) return;
    event.preventDefault();
    event.stopPropagation();
    const step = event.shiftKey ? 64 : 24;
    setPosition((current) => {
      const next = fitIslandPosition({ x: current.x + delta[0] * step, y: current.y + delta[1] * step }, scaleRef.current);
      try { localStorage.setItem(ISLAND_POSITION_KEY, JSON.stringify(next)); } catch { /* position persistence is optional */ }
      return next;
    });
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
  // 📧 A new email in your primary inbox: a tile on the Island — tap it and
  // Izuki reads it to you and says what (if anything) you need to do.
  useEffect(() => {
    const off = on<{ from: string; subject: string; more?: number }>(EV.islandMail, (m) => {
      // Quiet when you've turned the Island's peeks off (the Windows notification still comes).
      if (busyRef.current || status.fullscreen || !peeksRef.current) return;
      const subject = m.subject?.trim();
      const more = m.more ? ` (+${m.more} more)` : "";
      setPeek({
        icon: "📧",
        label: `${m.from}${subject ? `: ${subject}` : ""}${more}`.slice(0, 90),
        ask: `Read me my newest email from ${m.from}${subject ? ` (“${subject}”)` : ""} and tell me in a sentence or two what it says and whether I need to do anything.`,
        strong: true,
      });
    });
    return () => void off.then((f) => f());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.fullscreen]);
  // Its own timer, so a page change mid-peek can't leave it stuck up.
  useEffect(() => {
    if (!peek) return;
    const hide = setTimeout(() => setPeek(null), PEEK_MS);
    return () => clearTimeout(hide);
  }, [peek]);
  const peeksRef = useRef(peeks);
  peeksRef.current = peeks;
  const busyRef = useRef(busy);
  busyRef.current = busy;
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
  /** A new Izuki version: on the pill whenever nothing else is (not just its
   *  first 10 s), so it's seen without opening Settings. */
  const update = acts.find((a) => a.kind === "update");
  const media = status.media;
  const musicOn = !!media?.playing;
  const onPlayingRef = useRef(onPlaying);
  onPlayingRef.current = onPlaying;
  useEffect(() => onPlayingRef.current?.(musicOn), [musicOn]);

  // The waveform follows the PC's sound level, only while something plays.
  // Each <Waveform> listens to the level itself, so 30 updates a second
  // never re-render the whole Island.
  // Only while the Island is open: the small pill's waveform is a still
  // picture, so nothing else needs 30 readings a second.
  useEffect(() => {
    if (!musicOn || !open) return;
    void api.islandAudioMeter(true);
    return () => void api.islandAudioMeter(false);
  }, [musicOn, open]);
  useEffect(() => {
    if (!status.quiet) setWoke(false);
  }, [status.quiet]);
  const quiet = quietUntil > now || (!!status.quiet && !woke);
  const down = (status.sites_down ?? []).find(([, url]) => url !== siteSeen);
  const due = status.due && status.due[2] > now ? status.due : null;
  const live: Live = status.approval
    ? { kind: "approval", id: status.approval[0], app: status.approval[1], text: status.approval[2] }
    : failure && !busy
    ? { kind: "error", message: failure }
    : status.lecture
    ? { kind: "lecture", title: status.lecture[0], secs: status.lecture[1] }
    : quiet
    ? { kind: "rest" }
    : finished
    ? { kind: "finished" }
    : status.missions
      ? { kind: "missions", now: status.missions[0], left: status.missions[1], step: busy ? doing : null }
    : orb === "listening" || talking
      ? { kind: "listening" }
    : orb === "speaking" && !busy
      ? { kind: "speaking" }
    : busy
      ? { kind: "working", text: doing || "Thinking…" }
      : remote
      ? { kind: "remote", device: remote.device, controlling: remote.controlling }
      : soon && soon.at - now <= 5 * 60_000
        ? { kind: "reminder", r: soon, urgent: true }
        : down
        ? { kind: "sitedown", name: down[0], url: down[1] }
        : status.lesson
        ? { kind: "lesson", text: status.lesson }
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
            : due && due[2] - now <= 24 * 60 * 60_000
            ? { kind: "due", count: due[0], title: due[1], at: due[2] }
            : update
            ? { kind: "activity", a: update }
            : { kind: "rest" };

  // Your character reacts beside the Island (IslandPal): it points at what
  // needs you and cheers when a task or your missions finish.
  const [palCue, setPalCue] = useState<PalCue | null>(null);
  const cueKey =
    live.kind === "approval"
      ? `point:approval:${live.id}`
      : live.kind === "sitedown"
        ? `point:site:${live.url}`
        : live.kind === "error"
          ? `point:error:${live.message}`
          : live.kind === "reminder" && live.urgent
            ? `point:reminder:${live.r.at}`
            : live.kind === "finished"
              ? "cheer:finished"
              : "";
  useEffect(() => {
    if (cueKey) setPalCue({ kind: cueKey.startsWith("cheer") ? "cheer" : "point", key: `${cueKey}:${Date.now()}` });
  }, [cueKey]);
  const missionsOn = !!status.missions;
  const hadMissions = useRef(missionsOn);
  useEffect(() => {
    if (hadMissions.current && !missionsOn) setPalCue({ kind: "cheer", key: `cheer:missions:${Date.now()}` });
    hadMissions.current = missionsOn;
  }, [missionsOn]);
  const palAway = quiet || status.fullscreen || orb !== "hidden";

  const dancing = !!media?.playing;
  if (status.fullscreen && !open) return null;

  const scale = islandScale(size);
  const fitted = fitIslandPosition(position, scale);
  return (
    <>
    <IslandPal cue={palCue} pill={pill} away={palAway} />
    <div
      className="pointer-events-none fixed z-[60] flex justify-center"
      style={{ left: fitted.x - ISLAND_WIDTH / 2, width: ISLAND_WIDTH, top: fitted.y, transform: scale !== 1 ? `scale(${scale})` : undefined, transformOrigin: "top center" }}
    >
      <motion.div
        ref={pill}
        layout
        data-izk-hit={open ? "" : undefined}
        transition={{ type: "spring", stiffness: 520, damping: 38, mass: 0.8 }}
        className={
          "izk-island relative overflow-hidden text-white " +
          (open ? "pointer-events-auto" : "pointer-events-none") +
          // At rest: the always-on pill, or fully hidden until your mouse
          // goes up there (or something's happening).
          (live.kind === "rest" && !open && !always ? " izk-island-hidden" : "") +
          (open ? " izk-island-open" : "") +
          // Lit up while Izuki is really listening, thinking or working.
          (busy || orb === "listening" || orb === "speaking" || live.kind === "missions" ? " izk-island-active" : "") +
          (look !== "default" ? ` izk-theme-${look}` : "")
        }
        style={{ borderRadius: look === "squircle" ? (open ? 16 : 11) : open ? 28 : 22 }}
        // Esc closes it from anywhere inside (not just the Ask box).
        onKeyDown={(e) => {
          if (e.key === "Escape" && menu) setMenu(null);
          else if (e.key === "Escape" && open) setOpen(false);
        }}
        // Right-click: the Island's own quick menu.
        onContextMenu={(e) => {
          if (!open) return;
          e.preventDefault();
          const r = pill.current?.getBoundingClientRect();
          setMenu({ x: e.clientX - (r?.left ?? 0), y: e.clientY - (r?.top ?? 0) });
        }}
        // Double-click the Island's top: talk to Nova.
        onDoubleClick={(e) => {
          const t = e.target as HTMLElement;
          if (!open || !t.closest("[data-island-top]") || t.closest("button, input, textarea, a, [role=tab]")) return;
          void emit(EV.airCall);
          setOpen(false);
        }}
      >
        {menu && (
          <IslandMenu
            at={menu}
            onClose={() => setMenu(null)}
            onTalk={() => {
              void emit(EV.airCall);
              setOpen(false);
            }}
            onQuiet={() => {
              setQuietUntil(Date.now() + 60 * 60_000);
              setOpen(false);
            }}
            quiet={quiet}
            onWake={() => {
              setQuietUntil(0);
              setWoke(true);
            }}
          />
        )}
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
                page={status.page ?? null}
                onHold={hold}
                wave={wave}
                next={next}
                coming={coming}
                onCancelReminder={cancelReminder}
                now={now}
                dancing={dancing}
                busy={busy}
                doing={doing}
                todo={todo}
                visualizing={visualizing}
                onVisualize={onVisualize}
                onMoveStart={beginMove}
                onMoveKey={moveByKeyboard}
                onDone={() => setOpen(false)}
                onClearError={() => setFailure(null)}
                onSeenSite={(url) => setSiteSeen(url)}
                due={due}
                remote={remote}
                scale={scale}
                maxH={(typeof window === "undefined" ? 800 : window.innerHeight) - fitted.y - 16}
              />
            </motion.div>
          ) : live.kind === "rest" ? (
            // At rest: the black pill of an iPhone's Dynamic Island (still —
            // it sits over everything all day), or the faint sliver.
            <motion.div key="rest" {...fade} className={always ? "flex h-[30px] w-[118px] items-center justify-end pr-3" : "h-[5px] w-[72px]"}>
              {always && <span className="h-[7px] w-[7px] rounded-full bg-[radial-gradient(circle_at_35%_35%,#3b4a6b,#0b0d14)] ring-1 ring-white/[0.06]" />}
            </motion.div>
          ) : (
            <motion.div key={live.kind} {...fade} className="flex h-[34px] items-center gap-2.5 pl-1.5 pr-3">
              <Compact live={live} dancing={dancing} wave={wave} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
    </>
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
    JSON.stringify(a.missions ?? null) === JSON.stringify(b.missions ?? null) &&
    (a.lesson ?? null) === (b.lesson ?? null) &&
    Math.floor((a.lecture?.[1] ?? -60) / 60) === Math.floor((b.lecture?.[1] ?? -60) / 60) &&
    (a.lecture?.[0] ?? null) === (b.lecture?.[0] ?? null) &&
    // A change waiting for your OK (or answered) must show at once.
    JSON.stringify(a.approval ?? null) === JSON.stringify(b.approval ?? null) &&
    JSON.stringify(a.due ?? null) === JSON.stringify(b.due ?? null) &&
    JSON.stringify(a.sites_down ?? []) === JSON.stringify(b.sites_down ?? []) &&
    !!a.quiet === !!b.quiet &&
    labels(a.suggestions) === labels(b.suggestions) &&
    labels(a.clip) === labels(b.clip) &&
    JSON.stringify(a.activities ?? []) === JSON.stringify(b.activities ?? []) &&
    (a.copies ?? []).join("\u0001") === (b.copies ?? []).join("\u0001") &&
    Math.floor((a.focus_left ?? -60) / 60) === Math.floor((b.focus_left ?? -60) / 60) &&
    (m === n || (!!m && !!n && m.title === n.title && m.artist === n.artist && m.playing === n.playing && m.app === n.app && m.art === n.art))
  );
}

// ------------------------------------------------------------------ compact

/** Your voice (or Izuki's) as a few live bars — only while it lasts. */
function LiveBars({ color }: { color: string }) {
  const [levels, setLevels] = useState<number[]>(() => Array(7).fill(0.1));
  useEffect(() => {
    const off = on<number>(EV.voiceLevel, (l) => setLevels((p) => [...p.slice(1), Math.max(0.1, Math.min(1, l))]));
    return () => void off.then((f) => f());
  }, []);
  return (
    <span className="flex h-[18px] items-center gap-[2px]" aria-hidden>
      {levels.map((l, i) => (
        <span key={i} className="w-[3px] rounded-full transition-[height] duration-75" style={{ height: `${3 + l * 15}px`, background: color }} />
      ))}
    </span>
  );
}

function Compact({ live, dancing, wave = "auto" }: { live: Live; dancing: boolean; wave?: string }) {
  switch (live.kind) {
    case "listening":
      return (
        <>
          <span className="relative flex h-[24px] w-[24px] items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-izk-teal/30" />
            <span className="h-[10px] w-[10px] rounded-full bg-izk-teal" />
          </span>
          <span className="text-[13px] font-semibold text-white/90">Listening</span>
          <LiveBars color="#5eead4" />
        </>
      );
    case "speaking":
      return (
        <>
          <Face size={24} mood="happy" />
          <span className="text-[13px] font-medium text-white/85">Izuki</span>
          <LiveBars color="#c4b5fd" />
        </>
      );
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
          <span className={"text-[12.5px] text-white/60" + (live.a.kind === "timer" ? " tabular-nums" : "")}>
            {live.a.kind === "update" ? "Hover to update" : live.a.detail}
          </span>
        </>
      );
    case "missions":
      return (
        <>
          <Face size={24} mood="busy" />
          <span className="max-w-[300px] truncate text-[13px] font-medium text-white/90" title={live.step ?? live.now}>
            Missions · {live.now || "starting…"}
          </span>
          {live.left > 0 && <span className="text-[12px] tabular-nums text-white/55">+{live.left}</span>}
          <Dots />
        </>
      );
    case "lesson":
      return (
        <>
          <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-cyan-500/80 text-[13px]">🎓</span>
          <span className="max-w-[320px] truncate text-[13px] font-medium text-white/90">{live.text}</span>
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
          {/* Still in the small pill: it can show for hours over everything,
              and moving would repaint the whole screen every frame. */}
          <Waveform playing={live.m.playing} width={44} height={16} style={waveFor(wave, live.m.title)} frozen />
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
    case "approval":
      return (
        <>
          <span className="izk-island-ask flex h-[24px] w-[24px] items-center justify-center rounded-full bg-amber-400 text-[13px] text-black">✋</span>
          <span className="max-w-[300px] truncate text-[13px] font-semibold text-white/95">
            Waiting for your OK · {live.app}
            {live.text ? `: ${live.text}` : ""}
          </span>
        </>
      );
    case "lecture":
      return (
        <>
          <span className="relative flex h-[24px] w-[24px] items-center justify-center rounded-full bg-rose-600 text-[12px]">
            🎙️
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-black/60" />
          </span>
          <span className="max-w-[300px] truncate text-[13px] font-semibold tracking-wide text-white/95">
            LECTURE MODE • RECORDING · {Math.floor(live.secs / 60)} min
          </span>
        </>
      );
    case "sitedown":
      return (
        <>
          <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-rose-500/90 text-[13px]">🌐</span>
          <span className="max-w-[300px] truncate text-[13px] font-semibold text-white/95">{live.name}'s website is down</span>
        </>
      );
    case "due":
      return (
        <>
          <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-cyan-500/80 text-[13px]">🎓</span>
          <span className="max-w-[300px] truncate text-[13px] font-medium text-white/90">
            {live.title} · due {until(live.at)}
          </span>
          {live.count > 1 && <span className="text-[12px] tabular-nums text-white/55">+{live.count - 1}</span>}
        </>
      );
    case "error":
      return (
        <>
          <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-rose-500/90 text-[13px]">!</span>
          <span className="max-w-[300px] truncate text-[13px] font-medium text-white/90">{live.message}</span>
        </>
      );
    case "remote":
      return (
        <>
          <span className={"relative flex h-[24px] w-[24px] items-center justify-center rounded-full text-[13px] " + (live.controlling ? "bg-rose-500/85" : "bg-sky-500/80")}>
            📱
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-black/60" />
          </span>
          <span className="max-w-[260px] truncate text-[13px] font-medium text-white/90">
            {live.device || "Your phone"} {live.controlling ? "is controlling this PC" : "is viewing your screen"}
          </span>
        </>
      );
    default:
      return <Face size={24} mood={dancing ? "dancing" : "idle"} />;
  }
}

/** The Island's right-click menu: a few quick things, nothing hidden. */
function IslandMenu({ at, onClose, onTalk, onQuiet, quiet, onWake }: { at: { x: number; y: number }; onClose: () => void; onTalk: () => void; onQuiet: () => void; quiet: boolean; onWake: () => void }) {
  const place = (where: "left" | "center" | "right") => {
    void emit(EV.islandPlace, { where });
    onClose();
  };
  const item = "flex w-full items-center gap-2 rounded-[8px] px-2.5 py-1.5 text-left text-[12px] text-white/90 hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none";
  return (
    <div
      role="menu"
      aria-label="Island menu"
      className="absolute z-30 w-[188px] rounded-[12px] border border-white/15 bg-[#0d1018]/95 p-1 shadow-[0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur-md"
      // Inside the Island: opens above the pointer when there's no room below.
      style={{ left: Math.min(at.x, 372 - 196), top: at.y + 260 > (typeof window === "undefined" ? 9999 : window.innerHeight) ? Math.max(4, at.y - 250) : at.y }}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <button type="button" role="menuitem" autoFocus className={item} onClick={onTalk}>🎙️ Talk to Nova</button>
      <div className="my-1 h-px bg-white/10" />
      <div className="px-2.5 pb-0.5 pt-1 text-[10px] uppercase tracking-wider text-white/40">Move</div>
      <div className="grid grid-cols-3 gap-1 px-1 pb-1">
        {(["left", "center", "right"] as const).map((w) => (
          <button key={w} type="button" role="menuitem" onClick={() => place(w)} className="rounded-[7px] bg-white/[0.06] py-1 text-[11px] capitalize text-white/85 hover:bg-white/15">
            {w === "center" ? "Centre" : w}
          </button>
        ))}
      </div>
      <div className="my-1 h-px bg-white/10" />
      {quiet ? (
        <button type="button" role="menuitem" className={item} onClick={() => { onWake(); onClose(); }}>🔔 Show things again</button>
      ) : (
        <button type="button" role="menuitem" className={item} onClick={onQuiet}>🌙 Quiet for an hour</button>
      )}
      <button type="button" role="menuitem" className={item} onClick={() => { void emit(EV.patchSettings, { island_suggestions: false }); onClose(); }}>💡 No more suggestions</button>
      <button type="button" role="menuitem" className={item} onClick={() => { void emit(EV.patchSettings, { island_enabled: false }); onClose(); }}>🙈 Hide the Island</button>
    </div>
  );
}

/** At the top of the open Island: what needs you (an OK, an error, a remote session). */
function NeedsYou({ live, onClearError, onSeenSite }: { live: Live; onClearError?: () => void; onSeenSite?: (url: string) => void }) {
  const [said, setSaid] = useState("");
  const [failed, setFailed] = useState("");
  const [busy, setBusy] = useState(false);
  // A new approval (even right after another) starts with its own buttons.
  const key = live.kind === "approval" ? `approval:${live.id}` : live.kind;
  useEffect(() => {
    setSaid("");
    setFailed("");
  }, [key]);
  if (live.kind === "approval") {
    const answer = (allow: boolean) => {
      setBusy(true);
      setFailed("");
      void api
        .approvalAnswer(live.id, allow)
        .then(setSaid)
        .catch(() => setFailed("That didn't go through — try again, or answer in Chat."))
        .finally(() => setBusy(false));
    };
    return (
      <div className="rounded-[14px] border border-amber-300/35 bg-amber-300/[0.08] p-2.5">
        <div className="text-[12.5px] font-semibold">✋ {live.app} is waiting for your OK</div>
        {live.text && <div className="mt-0.5 truncate text-[12px] text-white/70">{live.text}</div>}
        {failed && <div className="mt-1.5 text-[11.5px] text-rose-300">{failed}</div>}
        {said ? (
          <div className="mt-2 text-[12px] text-white/80">{said}</div>
        ) : (
          <div className="mt-2 flex gap-2">
            <button type="button" disabled={busy} onClick={() => answer(true)} className="flex-1 rounded-full bg-emerald-500/90 py-1.5 text-[12px] font-semibold text-white hover:bg-emerald-500 disabled:opacity-50">
              Allow
            </button>
            <button type="button" disabled={busy} onClick={() => answer(false)} className="flex-1 rounded-full bg-white/10 py-1.5 text-[12px] font-semibold text-white/90 hover:bg-white/15 disabled:opacity-50">
              No
            </button>
          </div>
        )}
      </div>
    );
  }
  if (live.kind === "error") {
    return (
      <div className="rounded-[14px] border border-rose-400/35 bg-rose-400/[0.08] p-2.5">
        <div className="text-[12.5px] font-semibold">Something went wrong</div>
        <div className="mt-0.5 line-clamp-2 text-[12px] text-white/75">{live.message}</div>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => {
              void emit(EV.runChat, { id: Date.now(), text: `That didn't work — it said: “${live.message}”. Can you help me sort it out?` });
              onClearError?.();
            }}
            className="flex-1 rounded-full bg-white/15 py-1.5 text-[12px] font-semibold text-white hover:bg-white/20"
          >
            Get help
          </button>
          <button type="button" onClick={onClearError} className="rounded-full px-3 py-1.5 text-[12px] text-white/70 hover:bg-white/10">
            Dismiss
          </button>
        </div>
      </div>
    );
  }
  if (live.kind === "sitedown") {
    return (
      <div className="rounded-[14px] border border-rose-400/35 bg-rose-400/[0.08] p-2.5">
        <div className="text-[12.5px] font-semibold">🌐 {live.name}'s website didn't answer</div>
        <div className="mt-0.5 truncate text-[12px] text-white/65">{live.url} · at the last check</div>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => void emit(EV.runChat, { id: Date.now(), text: `Is ${live.url} down? Check it again and tell me what's wrong.` })}
            className="flex-1 rounded-full bg-white/15 py-1.5 text-[12px] font-semibold text-white hover:bg-white/20"
          >
            Check again
          </button>
          <button type="button" onClick={() => onSeenSite?.(live.url)} className="rounded-full px-3 py-1.5 text-[12px] text-white/70 hover:bg-white/10">
            Dismiss
          </button>
        </div>
      </div>
    );
  }
  if (live.kind === "remote") {
    return (
      <div className="flex items-center gap-2 rounded-[14px] border border-sky-300/30 bg-sky-300/[0.07] p-2.5">
        <span className="text-[18px]">📱</span>
        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-semibold">{live.controlling ? "Your phone is controlling this PC" : "Your phone is viewing your screen"}</div>
          <div className="truncate text-[11.5px] text-white/60">{live.device || "Paired phone"}</div>
        </div>
        <button type="button" onClick={() => void api.remoteEnd()} className="rounded-full bg-rose-500/85 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-rose-500">
          End
        </button>
      </div>
    );
  }
  return null;
}

/** Jot a thought down without leaving what you're doing: saved to Notes. */
function JotBox({ onHold }: { onHold?: (on: boolean, who?: string) => void }) {
  const [text, setText] = useState("");
  // Held open while a note is half-typed: the mouse wandering off mustn't lose it.
  const typing = text.trim().length > 0;
  useEffect(() => {
    onHold?.(typing, "jot");
  }, [typing, onHold]);
  useEffect(() => () => onHold?.(false, "jot"), [onHold]);
  const [said, setSaid] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!said) return;
    const t = setTimeout(() => setSaid(""), 2500);
    return () => clearTimeout(t);
  }, [said]);
  const save = () => {
    const t = text.trim();
    if (t.length < 3 || saving) return;
    setSaving(true);
    void api
      .notesJot(t)
      .then(() => {
        setText("");
        setSaid("Saved to Notes ✓");
      })
      .catch(() => setSaid("Couldn't save that — try again."))
      .finally(() => setSaving(false));
  };
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white/[0.06] px-3 py-1.5">
      <span className="text-[14px]">📝</span>
      <input
        value={text}
        // The overlay doesn't take the keyboard by itself: ask for it.
        onMouseDown={() => void api.setOverlayInteractive(true).then(() => markHit())}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            save();
          }
        }}
        maxLength={2000}
        placeholder="Jot a quick note…"
        aria-label="Quick note"
        className="min-w-0 flex-1 bg-transparent text-[12.5px] text-white outline-none placeholder:text-white/45"
      />
      {said && (
        <span role="status" className={"shrink-0 text-[11px] " + (said.startsWith("Saved") ? "text-emerald-300" : "text-rose-300")}>
          {said}
        </span>
      )}
      {text.trim().length >= 3 && (
        <button type="button" disabled={saving} onClick={save} className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11.5px] font-semibold hover:bg-white/20 disabled:opacity-50">
          Save
        </button>
      )}
    </div>
  );
}

// ----------------------------------------------------------------- expanded

function Expanded({
  live,
  media,
  suggestions,
  next,
  maxH,
  coming = [],
  onCancelReminder,
  now,
  dancing,
  busy,
  doing,
  todo = [],
  visualizing,
  onVisualize,
  onMoveStart,
  onMoveKey,
  onDone,
  onClearError,
  onSeenSite,
  due = null,
  remote = null,
  activities = [],
  copies = [],
  weather = null,
  page = null,
  onHold,
  wave = "auto",
  scale = 1,
}: {
  /** The running task's to-do list. */
  todo?: TodoItem[];
  /** The Island's size scale: the panel's height limit allows for it. */
  scale?: number;
  wave?: string;
  page?: string | null;
  onHold?: (on: boolean, who?: string) => void;
  weather?: [string, number, string] | null;
  activities?: Activity[];
  copies?: string[];
  visualizing?: boolean;
  onVisualize?: () => void;
  onMoveStart: (event: React.PointerEvent) => void;
  onMoveKey: (event: React.KeyboardEvent) => void;
  live: Live;
  media: NowPlaying | null;
  suggestions: Suggestion[];
  next: Reminder | undefined;
  /** How much room there is below the pill (px) — "Move it anywhere" can put
   *  it low, and the panel must still fit and stay scrollable. */
  maxH?: number;
  /** Every reminder still to come, soonest first. */
  coming?: Reminder[];
  /** Cancel a reminder (the × on its row). */
  onCancelReminder?: (id: string) => void;
  now: number;
  dancing: boolean;
  busy: boolean;
  doing: string | null;
  onDone: () => void;
  onClearError?: () => void;
  onSeenSite?: (url: string) => void;
  /** School work due this week: [how many, the next one, its unix ms]. */
  due?: [number, string, number] | null;
  /** A phone connected right now: its card shows whatever else is going on. */
  remote?: { device: string; controlling: boolean } | null;
}) {
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const playing = optimistic ?? !!media?.playing;
  useEffect(() => setOptimistic(null), [media?.playing, media?.title]);
  const [cameraOn, setCameraOn] = useState(false);
  const [tab, setTab] = useState<"now" | "vitals" | "apps">("now");
  const control = useCallback((a: "play" | "pause" | "next" | "previous") => {
    if (a === "play" || a === "pause") setOptimistic(a === "play");
    void api.mediaControl(a);
  }, []);

  return (
    // Scrolls when it holds more than fits on the screen.
    <div
      className="izk-island-scroll flex flex-col gap-3 overflow-y-auto overscroll-contain pr-0.5 [scrollbar-width:thin]"
      style={{ maxHeight: `${Math.max(220, Math.min(maxH ?? 1e9, (typeof window === "undefined" ? 800 : window.innerHeight) - 48)) / scale}px` }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label="Drag the Island along the top of the screen"
        title="Drag to move the Island"
        onPointerDown={onMoveStart}
        onKeyDown={onMoveKey}
        // Stays at the top while a long answer scrolls under it: the Island
        // could only be moved before you scrolled down.
        className="sticky top-0 z-10 -mb-1 flex h-5 shrink-0 cursor-grab items-center justify-center rounded-full bg-black/55 text-white/45 backdrop-blur-sm hover:bg-white/[0.1] hover:text-white/75 active:cursor-grabbing"
      >
        <GripHorizontal size={16} />
      </div>
      <div data-island-top title="Double-click to talk to Nova" className="flex items-center gap-3">
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

      <NeedsYou live={live} onClearError={onClearError} onSeenSite={onSeenSite} />
      {remote && live.kind !== "remote" && <NeedsYou live={{ kind: "remote", device: remote.device, controlling: remote.controlling }} />}

      <div role="tablist" aria-label="Island" className="grid grid-cols-3 gap-1 rounded-full bg-white/[0.06] p-1">
        {([["now", "Now"], ["vitals", "Vitals"], ["apps", "Apps"]] as const).map(([k, l]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={"rounded-full py-1 text-[12px] font-semibold transition " + (tab === k ? "bg-white/[0.16] text-white" : "text-white/55 hover:text-white/85")}
          >
            {l}
          </button>
        ))}
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
      {busy && todo.length > 0 && <TodoList items={todo} />}

      {/* Kept alive on every tab, so switching to Vitals or Apps never
          throws away a question being answered — just hidden. */}
      {!busy && (
        <div hidden={tab !== "now"}>
          <div id="izuki-island-chat-dock" data-page={page || ""}>
            <button type="button" onClick={() => window.dispatchEvent(new Event("izuki:island-chat-open"))} className="w-full rounded-2xl bg-white/10 px-3 py-2 text-[12px] text-white/80">Open Island chat</button>
          </div>
        </div>
      )}
      {tab === "vitals" && <VitalsTab />}
      {tab === "apps" && <AppsTab onDone={onDone} />}
      {tab === "now" && (
        <>
      {!busy && <JotBox onHold={onHold} />}
      {due && (
        <button
          type="button"
          onClick={() => {
            void emit(EV.runChat, { id: Date.now(), text: "What's due this week?" });
            onDone();
          }}
          className="flex items-center gap-2.5 rounded-2xl bg-white/[0.07] p-2.5 text-left hover:bg-white/[0.1]"
        >
          <span className="text-[18px]">🎓</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12.5px] font-semibold">{due[0] === 1 ? "1 thing due this week" : `${due[0]} things due this week`}</span>
            <span className="block truncate text-[11.5px] text-white/60">
              Next: {due[1]} · {when(due[2], now)}
            </span>
          </span>
        </button>
      )}
      {media && (
        <div className="flex items-center gap-3 rounded-2xl bg-white/[0.07] p-2.5">
          <Cover m={media} size={52} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-semibold">{media.title}</div>
            <div className="truncate text-[12px] text-white/55">{[media.artist, media.app].filter(Boolean).join(" · ")}</div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {mediaKind(media) === "song" && onVisualize && (
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
              {(() => {
                // The right help for what's actually playing — a song, a
                // lesson, an ad or just a video.
                const kind = mediaKind(media);
                const from = media.artist ? ` (${media.artist})` : "";
                const ask = (text: string) => { onDone(); void emit(EV.runChat, { id: Date.now(), text }); };
                const [label, text] =
                  kind === "song" ? ["About this song", `Tell me about the song "${media.title}"${media.artist ? ` by ${media.artist}` : ""} — what it's about, and one interesting thing about it. Keep it short.`]
                  : kind === "lesson" ? ["Explain this lesson", `The video "${media.title}"${from} is teaching something. Explain the main idea simply in a few short steps, like a good tutor.`]
                  : kind === "ad" ? ["Skip ad", "Skip the ad that's playing."]
                  : ["What's this video about?", `In a few short lines, what is the video "${media.title}"${from} about?`];
                return (
                  <button
                    type="button"
                    onClick={() => ask(text)}
                    className="rounded-full bg-white/10 px-2 py-[3px] text-[11px] font-semibold text-white/80 transition hover:bg-white/16"
                  >
                    {label}
                  </button>
                );
              })()}
            </div>
            <div className="mt-1 h-6">
              <Waveform playing={playing} width={120} height={24} style={waveFor(wave, media.title)} />
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

      {/* On a web page it asks about the page; anywhere else, about the screen. */}

      {cameraOn ? (
        <CameraView onClose={() => setCameraOn(false)} onAsked={onDone} />
      ) : (
        <button
          type="button"
          onClick={() => setCameraOn(true)}
          className="flex items-center gap-2 self-start rounded-full bg-white/[0.07] px-3 py-1.5 text-[12.5px] text-white/80 transition hover:bg-white/[0.12]"
        >
          <Camera size={14} /> Show Izuki with your camera
        </button>
      )}

      {(coming.length ? coming.slice(0, 3) : next ? [next] : []).map((r) => (
        <div key={r.id} className="group flex items-center gap-3 rounded-2xl bg-white/[0.07] py-2.5 pl-3 pr-1.5">
          <AlarmClock size={18} className="shrink-0 text-amber-400" />
          <div className="min-w-0 flex-1 truncate text-[13.5px]">{r.text}</div>
          <div className="shrink-0 text-[12.5px] text-white/55">{when(r.at, now)}</div>
          {onCancelReminder && (
            <button
              type="button"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/45 transition-colors hover:bg-white/12 hover:text-white focus-visible:bg-white/12 focus-visible:text-white"
              aria-label={`Cancel the reminder: ${r.text}`}
              title={r.repeat ? "Cancel (it won't repeat)" : "Cancel this reminder"}
              onClick={() => onCancelReminder(r.id)}
            >
              <X size={15} strokeWidth={2.4} />
            </button>
          )}
        </div>
      ))}
      {coming.length > 3 && <div className="-mt-1 px-1 text-[12px] text-white/45">+{coming.length - 3} more in Chat</div>}

      {activities.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="px-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/40">Happening now</div>
          {activities.map((a) => (
            <div key={a.id} className="rounded-2xl bg-white/[0.07] px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <span className="shrink-0 text-[17px]">{a.icon}</span>
                <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium">{a.title}</span>
                {/* A short detail (a time, a size) sits on the right; a long one
                    wraps underneath instead of running out of the box. */}
                {a.detail && a.detail.length <= 22 && (
                  <span className={"max-w-[40%] shrink-0 truncate text-[12.5px] text-white/55" + (a.kind === "timer" ? " tabular-nums" : "")}>{a.detail}</span>
                )}
              </div>
              {a.detail && a.detail.length > 22 && (
                <div className="mt-1 line-clamp-3 break-words pl-[29px] text-[12.5px] leading-snug text-white/60">{a.detail}</div>
              )}
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

      <QuickGrid onDone={onDone} />
        </>
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

/** A mini JARVIS readout: every number measured (vitals.rs), read every
 *  3 s only while this tab is open. */
function VitalsTab() {
  const [v, setV] = useState<IslandVitals | null>(null);
  useEffect(() => {
    let alive = true;
    let timer = 0;
    const read = async () => {
      const got = await api.islandVitals().catch(() => null);
      if (!alive) return;
      if (got) setV(got);
      timer = window.setTimeout(read, 3000);
    };
    void read();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);
  if (!v) return <div className="px-1 py-6 text-center text-[12.5px] text-white/50">Reading your PC…</div>;
  const bar = (label: string, pct: number, hint: string) => (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between text-[12.5px]">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-white/70">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]" role="meter" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className={"h-full rounded-full " + (pct >= 85 ? "bg-red-400" : pct >= 65 ? "bg-amber-300" : "bg-gradient-to-r from-cyan-400 to-violet-400")} style={{ width: `${Math.max(2, pct)}%` }} />
      </div>
      <div className="text-[11px] text-white/45">{hint}</div>
    </div>
  );
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white/[0.05] p-3">
      {bar("Processor", v.cpu, v.cpu >= 85 ? "Working hard — something heavy is running." : "Plenty to spare.")}
      {bar("Memory", v.ram, v.ram >= 85 ? "Nearly full — closing a few tabs or apps would help." : "Fine.")}
      <div className="grid grid-cols-3 gap-2 text-center text-[12px]">
        <div className="rounded-xl bg-white/[0.06] px-1 py-2">
          <div className="text-[15px]">{v.battery ? (v.battery[1] ? "🔌" : v.battery[0] <= 15 ? "🪫" : "🔋") : "🖥️"}</div>
          <div className="tabular-nums">{v.battery ? `${v.battery[0]}%` : "No battery"}</div>
        </div>
        <div className="rounded-xl bg-white/[0.06] px-1 py-2">
          <div className="text-[15px]">{v.online ? "🌐" : "📴"}</div>
          <div>{v.online ? "Online" : "Offline"}</div>
        </div>
        <div className="rounded-xl bg-white/[0.06] px-1 py-2" title="Izuki's main process (its windows are counted separately by Windows)">
          <div className="text-[15px]">✨</div>
          <div className="tabular-nums">{v.izuki_mb} MB</div>
        </div>
      </div>
      <div className="text-[12.5px] text-white/75">
        {v.missions ? `🤖 Missions: ${v.missions[0] || "starting…"}${v.missions[1] ? ` (+${v.missions[1]} more)` : ""}` : v.task ? `🤖 ${v.task}` : "🤖 Izuki isn't working on anything right now."}
      </div>
    </div>
  );
}

const FAVS_KEY = "izuki.island-favs";

/** Your apps, one tap away: favourites, what you've used most today, and a
 *  search box ("spotify", "calculator"). */
function AppsTab({ onDone }: { onDone: () => void }) {
  const [recent, setRecent] = useState<string[]>([]);
  const [favs, setFavs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(FAVS_KEY) || "[]") as string[]; } catch { return []; }
  });
  const [q, setQ] = useState("");
  const [note, setNote] = useState("");
  useEffect(() => void api.islandRecentApps().then(setRecent).catch(() => undefined), []);
  const saveFavs = (list: string[]) => {
    setFavs(list);
    try { localStorage.setItem(FAVS_KEY, JSON.stringify(list)); } catch { /* favourites are a convenience */ }
  };
  const open = (name: string) => {
    setNote(`Opening ${name}…`);
    void api
      .openApp(name)
      .then(() => onDone())
      // Not an installed app (a website like YouTube): Izuki opens it.
      .catch(() => {
        onDone();
        void emit(EV.runChat, { id: Date.now(), text: `open ${name}` });
      });
  };
  const chip = (name: string) => (
    <div key={name} className="flex items-center gap-0.5 rounded-full bg-white/[0.08] pl-3 pr-1">
      <button type="button" onClick={() => open(name)} className="py-1 text-[12.5px] font-medium">{name}</button>
      <button
        type="button"
        aria-label={favs.includes(name) ? `Unpin ${name}` : `Pin ${name}`}
        title={favs.includes(name) ? "Unpin" : "Pin to favourites"}
        onClick={() => saveFavs(favs.includes(name) ? favs.filter((f) => f !== name) : [...favs, name].slice(-8))}
        className="rounded-full px-1.5 py-0.5 text-[12px] text-white/50 hover:text-amber-300"
      >
        {favs.includes(name) ? "★" : "☆"}
      </button>
    </div>
  );
  return (
    <div className="flex flex-col gap-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) open(q.trim());
        }}
        className="flex gap-1.5"
      >
        <input
          value={q}
          onMouseDown={() => void api.setOverlayInteractive(true).then(() => markHit())}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Open an app — e.g. Spotify"
          aria-label="App to open"
          className="min-w-0 flex-1 rounded-full bg-white/[0.08] px-3 py-1.5 text-[13px] text-white outline-none placeholder:text-white/40 focus:bg-white/[0.12]"
        />
        <button type="submit" className="rounded-full bg-white/[0.12] px-3 text-[12.5px] font-semibold hover:bg-white/[0.2]">Open</button>
      </form>
      {favs.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="px-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/40">Favourites</div>
          <div className="flex flex-wrap gap-1.5">{favs.map(chip)}</div>
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <div className="px-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/40">Used most today</div>
        {recent.length ? (
          <div className="flex flex-wrap gap-1.5">{recent.filter((r) => !favs.includes(r)).map(chip)}</div>
        ) : (
          <div className="px-1 text-[12px] text-white/45">Nothing yet today — the apps you use show up here (Screen time).</div>
        )}
      </div>
      {note && <div className="px-1 text-[12px] text-white/55" role="status">{note}</div>}
    </div>
  );
}

/** One tap, done: the things people reach for most. Instant ones answer
 *  out loud without opening anything; the rest go to Izuki as a request. */
const QUICK: { icon: string; label: string; instant?: string; ask?: string }[] = [
  { icon: "⏱️", label: "5 min", instant: "set a timer for 5 minutes" },
  { icon: "🎯", label: "Focus", instant: "focus for 25 minutes" },
  { icon: "🔊", label: "Read this", instant: "read this to me" },
  { icon: "🔍", label: "Explain", ask: "Look at my screen and explain what I'm looking at in plain words — point at the important parts." },
  { icon: "📝", label: "Later", instant: "what's on my later list" },
  { icon: "📬", label: "Email", instant: "What's important in my email?" },
  { icon: "📸", label: "Screenshot", instant: "take a screenshot" },
  { icon: "⚡", label: "Boost", instant: "make my PC fast" },
];

function QuickGrid({ onDone }: { onDone: () => void }) {
  /** The button whose job is running now — lit until it finishes. */
  const [working, setWorking] = useState<string | null>(null);
  /** What the last one said, under the buttons for a moment. */
  const [said, setSaid] = useState<{ label: string; text: string } | null>(null);
  useEffect(() => {
    if (!said) return;
    const t = window.setTimeout(() => setSaid(null), 4000);
    return () => clearTimeout(t);
  }, [said]);
  const busyWord = (label: string) => (label === "Read this" ? "Reading…" : label === "Screenshot" ? "Snapping…" : label === "Boost" ? "Boosting…" : "Working…");
  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-4 gap-1.5">
        {QUICK.map((q) => {
          const running = working === q.label;
          const done = said?.label === q.label;
          return (
            <button
              key={q.label}
              type="button"
              title={q.instant ?? q.ask}
              aria-busy={running}
              disabled={!!working && !running}
              onClick={() => {
                if (working) return;
                if (q.ask) {
                  onDone();
                  void emit(EV.runChat, { id: Date.now(), text: q.ask });
                  return;
                }
                setWorking(q.label);
                setSaid(null);
                void api
                  .instantCommand(q.instant!)
                  .then((text) => {
                    if (text) {
                      void emit(EV.say, { text });
                      setSaid({ label: q.label, text });
                    } else {
                      void emit(EV.runChat, { id: Date.now(), text: q.instant! });
                      setSaid({ label: q.label, text: "Asked Izuki — the answer is on its way." });
                    }
                  })
                  .catch(() => setSaid({ label: q.label, text: "That didn't work — try again?" }))
                  .finally(() => setWorking(null));
              }}
              className={
                "flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10.5px] font-medium transition active:scale-[0.94] disabled:opacity-40 " +
                (running
                  ? "animate-pulse bg-cyan-400/25 text-white ring-1 ring-cyan-300/70"
                  : done
                    ? "bg-emerald-400/20 text-white ring-1 ring-emerald-300/50"
                    : "bg-white/[0.06] text-white/75 hover:bg-white/[0.12]")
              }
            >
              <span className="text-[16px] leading-none">{running ? "⏳" : done ? "✓" : q.icon}</span>
              {running ? busyWord(q.label) : q.label}
            </button>
          );
        })}
      </div>
      {said && (
        <div role="status" className="line-clamp-2 rounded-xl bg-white/[0.06] px-3 py-1.5 text-[12px] leading-snug text-white/80">
          {said.text}
        </div>
      )}
    </div>
  );
}

function RoundButton({ children, label, onClick, big, className = "" }: { children: React.ReactNode; label: string; onClick: () => void; big?: boolean; className?: string }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={
        "flex items-center justify-center rounded-full transition active:scale-90 " +
        (big ? "h-11 w-11 bg-white text-black hover:bg-white/90" : "h-9 w-9 text-white/85 hover:bg-white/10") +
        (className ? ` ${className}` : "")
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

/** One line of the task's to-do list. */
interface TodoItem {
  text: string;
  done: boolean;
}

/** The task's to-do list while Izuki works: what's done, what's left. */
function TodoList({ items }: { items: TodoItem[] }) {
  const left = items.filter((i) => !i.done).length;
  return (
    <div className="rounded-2xl bg-white/[0.05] px-3 py-2" aria-label="Izuki's to-do list">
      <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-white/55">
        <span>To do</span>
        <span>{left === 0 ? "All done" : `${items.length - left} of ${items.length}`}</span>
      </div>
      <ul className="space-y-0.5">
        {items.map((i, n) => (
          <li key={n} className={"flex items-start gap-2 text-[12px] leading-snug " + (i.done ? "text-white/45 line-through decoration-white/25" : "text-white/85")}>
            <span aria-hidden className={"mt-[3px] flex h-3 w-3 shrink-0 items-center justify-center rounded-full border " + (i.done ? "border-emerald-400/70 bg-emerald-400/70" : "border-white/35")}>
              {i.done && <Check size={8} strokeWidth={3.5} className="text-black" />}
            </span>
            <span className="sr-only">{i.done ? "Done: " : "To do: "}</span>
            {i.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * What's playing, roughly: a song, a lesson, an ad or just a video — so the
 * Island offers the right help ("About this song" on a cooking video, or on
 * an advert, made no sense). Music apps play songs; in a browser it's a song
 * only when the title says so.
 */
export function mediaKind(m: { title: string; artist: string; app: string }): "song" | "lesson" | "ad" | "video" {
  const title = m.title.toLowerCase();
  const app = m.app.toLowerCase();
  if (/(^|\b)(ad|ads|advertisement|sponsored)\b/.test(title) || title.startsWith("ad ·") || title.startsWith("ad:")) return "ad";
  if (/spotify|apple music|itunes|soundcloud|tidal|deezer|amazon music|youtube music|pandora|media player|groove|winamp|foobar|music/.test(app)) return "song";
  if (/official (audio|video|music video|lyric)|\blyrics?\b|\bremix\b|\bfeat\.|\bft\.|\(prod\.|\bslowed\b|\bsped up\b|\bvisualizer\b|\binstrumental\b/.test(title)) return "song";
  if (/\bhow to\b|tutorial|lesson|explained|lecture|course|\blearn|guide|for beginners|step by step|crash course|\bclass\b|walkthrough|tips/.test(title)) return "lesson";
  const browser = /chrome|edge|firefox|brave|opera|vivaldi|arc|browser/.test(app);
  return browser ? "video" : m.artist ? "song" : "video";
}

const WAVES = ["silk", "bars", "mirror", "neon", "dots"] as const;
type WaveStyle = (typeof WAVES)[number];

/** The style to draw: the chosen one, or for "auto" one per song (the same song keeps its look). */
function waveFor(choice: string, title = ""): WaveStyle {
  if ((WAVES as readonly string[]).includes(choice)) return choice as WaveStyle;
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
  return WAVES[h % WAVES.length];
}

/** A live waveform for whatever is playing, in one of five looks, all
 * following the PC's sound level: silk (soft flowing lines), bars (an
 * equalizer), mirror (a voice-memo style), neon (one glowing line) and
 * dots (bouncing beads). */
function Waveform({ playing, width, height, style = "silk", frozen = false }: { playing: boolean; width: number; height: number; style?: WaveStyle; frozen?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const level = useRef(0);
  useEffect(() => {
    if (!playing) {
      level.current = 0;
      return;
    }
    if (frozen) return;
    const off = on<number>(EV.islandAudioLevel, (v) => {
      level.current = typeof v === "number" && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0;
    });
    return () => void off.then((f) => f());
  }, [playing, frozen]);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const mid = height / 2;
    const lines = [
      { freq: 0.16, phase: 0, amp: 1, rgba: "143,199,255,0.95", w: 1.8 },
      { freq: 0.23, phase: 1.3, amp: 0.7, rgba: "232,121,249,0.7", w: 1.4 },
      { freq: 0.31, phase: 2.4, amp: 0.45, rgba: "255,255,255,0.55", w: 1.1 },
    ];
    const grad = ctx.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0, "#e879f9");
    grad.addColorStop(1, "#67e8f9");
    // Each bar/dot moves to its own beat, so it never looks like one block.
    const jitter = (i: number, t: number) => 0.55 + 0.45 * Math.sin(t * (2.1 + (i % 5) * 0.37) + i * 1.7);
    let shown = 0;
    let t = 0;
    let raf = 0;
    // 30 frames a second is plenty for a waveform — and this sits in the
    // full-screen overlay, where every frame re-composites the whole screen.
    let lastFrame = 0;
    const draw = (now = 0) => {
      if (now - lastFrame < 33) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastFrame = now;
      shown += (level.current - shown) * 0.3;
      if (!still) t += playing ? 0.1 : 0.024;
      const swell = Math.max(playing ? 0.14 : 0.05, shown);
      ctx.clearRect(0, 0, width, height);
      ctx.shadowBlur = 0;
      if (style === "bars" || style === "mirror") {
        const n = Math.max(5, Math.round(width / 6));
        const gap = width / n;
        const bw = Math.max(1.6, gap * 0.55);
        ctx.fillStyle = grad;
        for (let i = 0; i < n; i++) {
          const taper = 0.45 + 0.55 * Math.sin(((i + 0.5) / n) * Math.PI);
          const h = Math.max(1.5, swell * jitter(i, t * 3) * taper * (style === "mirror" ? height : height * 0.95));
          const x = i * gap + (gap - bw) / 2;
          const y = style === "mirror" ? mid - h / 2 : height - h;
          ctx.beginPath();
          ctx.roundRect(x, y, bw, h, bw / 2);
          ctx.fill();
        }
      } else if (style === "dots") {
        const n = Math.max(4, Math.round(width / 9));
        const gap = width / n;
        const r = Math.min(gap * 0.28, height * 0.16);
        ctx.fillStyle = grad;
        for (let i = 0; i < n; i++) {
          const y = mid - Math.sin(t * 3 + i * 0.8) * swell * jitter(i, t * 2) * (height / 2 - r);
          ctx.beginPath();
          ctx.arc(i * gap + gap / 2, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (style === "neon") {
        const hue = (t * 40) % 360;
        ctx.strokeStyle = `hsl(${hue}, 95%, 70%)`;
        ctx.shadowColor = `hsl(${hue}, 95%, 60%)`;
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        for (let x = 0; x <= width; x += 1.5) {
          const taper = Math.sin((x / width) * Math.PI);
          const y = mid + (Math.sin(x * 0.2 + t * 4) * 0.7 + Math.sin(x * 0.07 - t * 2) * 0.3) * swell * taper * height * 0.45;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else {
        for (const l of lines) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${l.rgba})`;
          ctx.lineWidth = l.w;
          ctx.lineCap = "round";
          for (let x = 0; x <= width; x += 1.5) {
            const taper = Math.sin((x / width) * Math.PI);
            const y = mid + Math.sin(x * l.freq + t * 3 + l.phase) * l.amp * swell * taper * height * 0.45;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
      if (!frozen) raf = requestAnimationFrame(draw);
    };
    if (frozen) {
      // One still frame, drawn mid-swell so it still reads as a waveform.
      level.current = playing ? 0.55 : 0.1;
      shown = level.current;
      lastFrame = -1000;
      draw(0);
      return;
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [playing, width, height, style, frozen]);
  return <canvas ref={canvasRef} aria-hidden className="izk-waveform block" style={{ width, height }} />;
}

/** The camera, opt-in: a live preview in the Island and "Ask Izuki", which
 * hands one still to Chat. Nothing is recorded or sent until you press it,
 * and the camera light goes off the moment this closes. */
function CameraView({ onClose, onAsked }: { onClose: () => void; onAsked: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<"starting" | "live" | "none" | "blocked">("starting");
  // Any camera — built-in, USB, virtual: the right one picked by itself, or yours.
  const [cams, setCams] = useState<MediaDeviceInfo[]>([]);
  const [camId, setCamId] = useState<string | null>(null);
  /** The camera you picked (null: Izuki picks). Only this reopens the camera. */
  const [want, setWant] = useState<string | null>(null);
  /** Bumped to reopen a camera (the one showing was unplugged). */
  const [reopen, setReopen] = useState(0);
  const live = useRef<MediaStream | null>(null);
  useEffect(() => {
    let stream: MediaStream | null = null;
    let gone = false;
    if (!navigator.mediaDevices?.getUserMedia) {
      setState("none");
      return;
    }
    setState("starting");
    openCamera(want)
      .then(({ stream: s, deviceId }) => {
        if (gone) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        live.current = s;
        setCamId(deviceId);
        if (video.current) {
          video.current.srcObject = s;
          void video.current.play().catch(() => undefined);
        }
        setState("live");
        void listCameras().then((c) => !gone && setCams(c));
      })
      .catch((e: unknown) => {
        if (gone) return;
        const name = e instanceof DOMException ? e.name : "";
        setState(name === "NotAllowedError" || name === "SecurityError" ? "blocked" : "none");
      });
    return () => {
      gone = true;
      stream?.getTracks().forEach((t) => t.stop());
      if (video.current) video.current.srcObject = null;
    };
  }, [want, reopen]);
  useEffect(() => {
    const md = navigator.mediaDevices;
    if (!md?.addEventListener) return;
    const changed = () =>
      void listCameras().then((c) => {
        setCams(c);
        // The camera showing was unplugged: open the next best one.
        const track = live.current?.getVideoTracks()[0];
        if (!track || track.readyState === "ended") {
          setWant(null);
          setReopen((n) => n + 1);
        }
      });
    md.addEventListener("devicechange", changed);
    return () => md.removeEventListener("devicechange", changed);
  }, []);

  const ask = () => {
    const v = video.current;
    if (!v || state !== "live" || !v.videoWidth) return;
    const scale = Math.min(1, 1024 / Math.max(v.videoWidth, v.videoHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(v.videoWidth * scale);
    c.height = Math.round(v.videoHeight * scale);
    c.getContext("2d")?.drawImage(v, 0, 0, c.width, c.height);
    const picture = c.toDataURL("image/jpeg", 0.85);
    // Same-origin windows share storage: Chat picks the picture up even if
    // it opens after this event has gone by.
    try { localStorage.setItem(CAMERA_PICTURE_KEY, picture); } catch { /* the event below still carries it */ }
    void emit(EV.chatPicture, picture);
    void api.showConfig("chat");
    onClose();
    onAsked();
  };

  return (
    <div className="izk-camera-view relative overflow-hidden rounded-2xl bg-black/60">
      <video
        ref={video}
        muted
        playsInline
        className={"block max-h-[200px] w-full -scale-x-100 object-cover transition-opacity " + (state === "live" ? "opacity-100" : "opacity-0")}
      />
      {state !== "live" && (
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-[12.5px] text-white/60">
          {state === "starting"
            ? "Starting your camera…"
            : state === "blocked"
              ? "Camera access is off. Allow it in Windows Settings › Privacy › Camera."
              : "No camera found."}
        </div>
      )}
      {state !== "live" && <div className="h-[120px]" />}
      {cams.length > 1 && (
        <select
          aria-label="Camera"
          value={camId ?? ""}
          onMouseDown={() => void api.setOverlayInteractive(true).then(() => markHit())}
          onChange={(e) => {
            saveCamera(e.target.value);
            setCamId(e.target.value);
            setWant(e.target.value);
          }}
          className="absolute right-2 top-2 max-w-[60%] truncate rounded-full bg-black/60 px-2 py-1 text-[11px] text-white outline-none"
        >
          {cams.map((c, i) => (
            <option key={c.deviceId} value={c.deviceId} className="text-black">
              {c.label || `Camera ${i + 1}`}
            </option>
          ))}
        </select>
      )}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent px-2.5 pb-2 pt-6">
        <button
          type="button"
          onClick={ask}
          disabled={state !== "live"}
          className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12.5px] font-medium text-black transition hover:bg-white/90 disabled:opacity-40"
        >
          <Sparkles size={13} /> Ask Izuki about this
        </button>
        <button type="button" aria-label="Turn the camera off" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/85 hover:bg-black/70">
          <X size={15} />
        </button>
      </div>
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
