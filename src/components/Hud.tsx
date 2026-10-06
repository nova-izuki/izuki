import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Pause, Play, SkipForward, X } from "lucide-react";
import { api, emit, EV, on, type BoostHealth } from "../lib/ipc";
import { markHit } from "../lib/hitTest";

type InboxItem = { from: string; subject: string; kind: string; action: string; urgent: boolean };
type InboxDigest = { summary: string; items: InboxItem[]; looked_at: number; skipped: number };
const KIND_ICON: Record<string, string> = { reply: "↩️", money: "💳", delivery: "📦", school: "🎓", work: "💼", meeting: "📅", security: "🔐", personal: "💬" };

type Pulse = { cpu: number | null; memory: number | null; disk_free_gb: number | null; battery: [number, boolean] | null; online: boolean };
type LaterItem = { id: string; text: string; done: boolean };

/** What was just asked from the status screen, so a second click doesn't send it again. */
let lastAsk = { text: "", at: 0 };
/** Shown at once on the status screen ("On it: Tidy my PC…"). */
let showAsked: (label: string) => void = () => undefined;

/** Ask Izuki something from the status screen (it answers out loud). */
function ask(text: string, label?: string) {
  const now = Date.now();
  if (text === lastAsk.text && now - lastAsk.at < 15000) return;
  lastAsk = { text, at: now };
  showAsked(label ?? (text.length > 60 ? text.slice(0, 58).replace(/[\s,.:;—-]+\S*$/, "") + "…" : text));
  void emit(EV.runChat, { id: now, text });
}

/**
 * The status screen — "Hey Nova, wake up" / "what's on today". A
 * holographic heads-up display fades in over the desktop while Izuki reads
 * the briefing: the time inside turning rings, battery and memory gauges,
 * free space, today's reminders, what's playing and the linked apps.
 * Izuki's own design; it goes away by itself after the briefing (or ×).
 */

export interface HudData {
  /** Today's screen time, most first: [app or site, minutes]. */
  screen_time?: Array<[string, number]>;
  /** The weather now: [place, °C, "🌤️ partly cloudy"]. */
  weather?: [string, number, string] | null;
  greeting: string;
  time: string;
  date: string;
  battery: [number, boolean] | null;
  memory: number | null;
  disk_free_gb: number | null;
  reminders: Array<[string, string]>;
  playing: string | null;
  apps: string[];
  /** Unread emails today and the first few (from, subject). */
  inbox?: [number, Array<[string, string]>] | null;
  /** The rest of today's calendar: (time, title). */
  calendar?: Array<[string, string]>;
  said: string;
}

/** After the voice finishes, the screen stays this long to read. */
const LINGER_MS = 7000;
/** And never longer than this, voice or not. */
const MAX_MS = 45_000;

export function Hud({ preview = null }: { preview?: HudData | null } = {}) {
  const [data, setData] = useState<HudData | null>(preview);
  /** What's new across the other linked apps — arrives a few seconds later. */
  const [acrossApps, setAcrossApps] = useState<string | null>(null);
  /** The inbox, gone through by the AI — arrives a few seconds after opening. */
  const [digest, setDigest] = useState<InboxDigest | null>(null);
  const timer = useRef(0);
  /** Live numbers while it's up, and a clock that ticks. */
  const [pulse, setPulse] = useState<Pulse | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [later, setLater] = useState<LaterItem[]>([]);
  const [paused, setPaused] = useState(false);
  const [command, setCommand] = useState("");
  /** Being used (hovered, typed in): it stays until you're done. */
  const [held, setHeld] = useState(false);
  /** What was just asked — shown at once, until Izuki starts answering. */
  const [asked, setAsked] = useState<string | null>(null);
  /** What's on the TV (Roku), if there is one. */
  const [tvNow, setTvNow] = useState<string | null>(null);
  /** PC Boost's look: the heaviest apps right now (every few seconds). */
  const [health, setHealth] = useState<BoostHealth | null>(null);
  /** The processor over the last two minutes, for the live trace. */
  const [cpuTrace, setCpuTrace] = useState<number[]>([]);
  /** Autopilot: which fixes are running / done. */
  const [fixing, setFixing] = useState<Record<string, "run" | "done">>({});
  useEffect(() => {
    showAsked = (label) => setAsked(label);
    const off = on<boolean>(EV.speaking, (talking) => talking && setAsked(null));
    const done = setTimeout(() => setAsked(null), 60000);
    return () => {
      showAsked = () => undefined;
      void off.then((f) => f());
      clearTimeout(done);
    };
  }, [asked]);

  useEffect(() => {
    if (!data) return;
    let n = 0;
    const look = () => {
      void api
        .systemPulse()
        .then((p) => {
          if (!p) return;
          setPulse(p);
          if (p.cpu != null) setCpuTrace((t) => [...t, p.cpu as number].slice(-60));
        })
        .catch(() => undefined);
      // The process list is a bigger look: every other tick.
      if (n++ % 2 === 0) void api.boostHealth().then(setHealth).catch(() => undefined);
      setNow(new Date());
    };
    look();
    void api.laterList().then((l) => setLater(l.filter((i) => !i.done).slice(0, 5))).catch(() => undefined);
    void api.tvNow().then(setTvNow).catch(() => undefined);
    const t = setInterval(look, 2000);
    return () => clearInterval(t);
  }, [data]);

  useEffect(() => {
    if (held) clearTimeout(timer.current);
  }, [held]);

  useEffect(() => {
    const close = (after: number) => {
      clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setData(null), after);
    };
    const offs = [
      on<HudData>("izuki://hud", (d) => {
        setData(d);
        setAcrossApps(null);
        setDigest(null);
        setHeld(false);
        close(MAX_MS);
      }),
      on<string>("izuki://hud-apps", (t) => setAcrossApps(t)),
      on<InboxDigest>("izuki://hud-inbox", (d) => setDigest(d)),
      on<boolean>(EV.speaking, (talking) => {
        if (!talking && !heldRef.current) close(LINGER_MS);
      }),
      on<void>(EV.stopSpeaking, () => close(0)),
    ];
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close(0);
    window.addEventListener("keydown", esc);
    return () => {
      offs.forEach((o) => void o.then((f) => f()));
      window.removeEventListener("keydown", esc);
      clearTimeout(timer.current);
    };
  }, []);

  const heldRef = useRef(false);
  heldRef.current = held;
  const battery = pulse?.battery ?? data?.battery ?? null;
  const memory = pulse?.memory ?? data?.memory ?? null;
  const free = pulse?.disk_free_gb ?? data?.disk_free_gb ?? null;
  const clock = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  // Autopilot: what needs you right now, worked out from what's on this
  // screen — each with the fix one tap away ("Handle it all" runs them all).
  type Rec = { id: string; icon: string; text: string; fix: string; run: () => Promise<unknown> };
  const recs: Rec[] = [];
  const cpuNow = pulse?.cpu ?? 0;
  if (health?.lagging || cpuNow >= 85 || (memory ?? 0) >= 88) {
    recs.push({ id: "boost", icon: "⚡", text: `PC working hard — processor ${cpuNow}%, memory ${memory ?? "?"}%`, fix: "Speed it up", run: () => api.boostNow().then((t) => ask(`Tell me this in one line: ${t}`, "PC Boost")) });
  }
  if (free != null && free < 15) {
    recs.push({ id: "space", icon: "💾", text: `Only ${free} GB free`, fix: "Clear junk", run: () => api.boostNow().then(() => ask("What else is taking the most space on my PC? Check in the background and tell me what I could remove — don't delete anything.", "Free up space")) });
  }
  if (battery && !battery[1] && battery[0] <= 25) {
    recs.push({ id: "battery", icon: "🔋", text: `Battery at ${battery[0]}%`, fix: "Make it last", run: async () => ask("My battery is low. Check in the background what's draining it and tell me what to close to make it last.", "Battery") });
  }
  if (pulse && !pulse.online) {
    recs.push({ id: "net", icon: "📡", text: "You're offline", fix: "Fix my internet", run: async () => ask("My internet isn't working. Check what's wrong on this PC and help me fix it, step by step.", "Fix the internet") });
  }
  const next = (data?.calendar ?? [])[0];
  if (next) {
    recs.push({ id: "next", icon: "📅", text: `Next: ${next[1]} at ${next[0]}`, fix: "Get me ready", run: async () => ask(`Get me ready for "${next[1]}" at ${next[0]}: who's in it, what it's about, and anything I should prepare or open.`, "Get ready") });
  }
  const urgent = digest?.items.filter((i) => i.urgent) ?? [];
  if (urgent.length) {
    recs.push({ id: "mail", icon: "✉️", text: `${urgent.length} urgent ${urgent.length === 1 ? "email" : "emails"}`, fix: "Draft replies", run: async () => ask(`Draft replies to my urgent emails (${urgent.map((u) => u.from).join(", ")}). Show me the drafts — don't send anything.`, "Draft replies") });
  }
  const runFix = async (r: Rec) => {
    setFixing((f) => ({ ...f, [r.id]: "run" }));
    try {
      await r.run();
    } finally {
      setFixing((f) => ({ ...f, [r.id]: "done" }));
    }
  };
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          key="hud"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
          transition={{ duration: 0.4 }}
          className="izk-hud pointer-events-none fixed inset-0 z-[70] flex items-center justify-center"
          // Being used (the mouse is on a panel): it stays until you close it.
          onMouseOver={() => !held && setHeld(true)}
        >
          <div className="izk-hud-scan absolute inset-0" />
          <div className="relative grid w-[min(1100px,94vw)] grid-cols-[1fr_auto_1fr] items-center gap-[clamp(16px,3vw,44px)]">
            {/* ---- left: the PC */}
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col gap-4">
              <Panel title="SYSTEMS" live>
                <div className="flex items-center justify-around gap-2">
                  {pulse?.cpu != null && <Gauge label="CPU" value={pulse.cpu} warn={pulse.cpu >= 90} onClick={() => ask("What's using my CPU right now? Check in the background and tell me.")} />}
                  {memory != null && <Gauge label="Memory" value={memory} warn={memory >= 85} onClick={() => ask("What's using my memory right now? Check in the background and tell me the top apps.")} />}
                  {battery && <Gauge label={battery[1] ? "Charging" : "Battery"} value={battery[0]} warn={!battery[1] && battery[0] <= 20} onClick={() => ask("How's my battery doing, and how long will it last?")} />}
                </div>
                {free != null && (
                  <Line k="Free space" v={`${free} GB`} warn={free < 10} onClick={() => ask("What's taking the most space on my PC? Check in the background and tell me.")} />
                )}
                {cpuTrace.length > 2 && <Trace values={cpuTrace} />}
                {health && health.hogs.length > 0 && (
                  <div className="flex flex-col gap-1">
                    {health.hogs.slice(0, 3).map((h) => (
                      <button
                        key={`${h.name}-${h.window}`}
                        type="button"
                        data-izk-hit
                        onClick={() => ask(`${h.name} is using ${h.mem_mb} MB of memory${h.cpu >= 5 ? ` and ${Math.round(h.cpu)}% of the processor` : ""}. Is that normal, and what can I do about it? Check in the background.`)}
                        className="pointer-events-auto flex items-center gap-2 rounded-[6px] text-left text-[11.5px] text-cyan-50 transition hover:bg-cyan-300/10"
                      >
                        <span className="w-[86px] shrink-0 truncate">{h.name}</span>
                        <span className="h-[5px] flex-1 overflow-hidden rounded-full bg-cyan-300/10">
                          <span className="block h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400" style={{ width: `${Math.min(100, (h.mem_mb / Math.max(1, health.hogs[0].mem_mb)) * 100)}%` }} />
                        </span>
                        <span className="w-[54px] shrink-0 text-right text-cyan-100/70">{h.mem_mb >= 1024 ? `${(h.mem_mb / 1024).toFixed(1)} GB` : `${h.mem_mb} MB`}</span>
                      </button>
                    ))}
                  </div>
                )}
                <Line k="Network" v={pulse ? (pulse.online ? "Online" : "Offline") : "…"} warn={pulse ? !pulse.online : false} />
                <Line k="Status" v={(memory ?? 0) >= 85 || (free ?? 99) < 10 || (pulse ? !pulse.online : false) ? "Needs attention" : "All systems normal"} />
              </Panel>
              <Panel title="AUTOPILOT" live>
                {recs.length === 0 ? (
                  <div className="text-[13px] text-cyan-100/75">✓ All clear — nothing needs you right now.</div>
                ) : (
                  <>
                    {recs.map((r) => (
                      <div key={r.id} className="flex items-center gap-2 border-b border-cyan-300/10 pb-1.5 text-[12.5px] last:border-0">
                        <span className="shrink-0">{r.icon}</span>
                        <span className="min-w-0 flex-1 truncate text-cyan-50">{r.text}</span>
                        <button
                          type="button"
                          data-izk-hit
                          disabled={!!fixing[r.id]}
                          onClick={() => void runFix(r)}
                          className="pointer-events-auto shrink-0 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2.5 py-0.5 text-[11.5px] text-cyan-50 transition hover:bg-cyan-300/25 disabled:opacity-60"
                        >
                          {fixing[r.id] === "run" ? "…" : fixing[r.id] === "done" ? "✓ Done" : r.fix}
                        </button>
                      </div>
                    ))}
                    {recs.length > 1 && (
                      <HudChip
                        onClick={() =>
                          void (async () => {
                            for (const r of recs) if (!fixing[r.id]) await runFix(r);
                          })()
                        }
                      >
                        🤖 Handle it all
                      </HudChip>
                    )}
                  </>
                )}
              </Panel>
              {data.playing && (
                <Panel title="NOW PLAYING">
                  <div className="flex items-center gap-3">
                    <span className="izk-hud-eq flex h-4 items-end gap-[3px]">
                      {[0, 1, 2, 3].map((i) => (
                        <i key={i} style={{ animationDelay: `${i * -0.2}s` }} />
                      ))}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[14px] text-cyan-50">{data.playing}</span>
                    <HudButton label={paused ? "Play" : "Pause"} onClick={() => { void api.mediaControl(paused ? "play" : "pause"); setPaused(!paused); }}>
                      {paused ? <Play size={14} /> : <Pause size={14} />}
                    </HudButton>
                    <HudButton label="Next" onClick={() => void api.mediaControl("next")}>
                      <SkipForward size={14} />
                    </HudButton>
                  </div>
                </Panel>
              )}
              {tvNow && (
                <Panel title="ON YOUR TV">
                  <div className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-[14px] text-cyan-50">📺 {tvNow}</span>
                    {[
                      ["⏯", "Play or pause", "pause the tv"],
                      ["🔉", "Quieter", "turn the tv down"],
                      ["🔊", "Louder", "turn the tv up"],
                      ["🏠", "Home", "go home on the tv"],
                    ].map(([icon, label, say]) => (
                      <HudButton key={label} label={label} onClick={() => void api.tvDo(say).catch(() => undefined)}>
                        <span className="text-[13px] leading-none">{icon}</span>
                      </HudButton>
                    ))}
                  </div>
                  <button
                    type="button"
                    data-izk-hit
                    onClick={() => ask("What's good to watch tonight on my TV? Pick from the apps I have.")}
                    className="pointer-events-auto mt-1 w-full rounded-[6px] text-left text-[12px] text-cyan-100/70 transition hover:bg-cyan-300/10 hover:text-cyan-50"
                  >
                    🍿 What should I watch?
                  </button>
                </Panel>
              )}
            </motion.div>

            {/* ---- centre: the time inside turning rings */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex aspect-square w-[clamp(240px,30vw,380px)] items-center justify-center"
            >
              <Rings />
              <div className="relative text-center">
                <div className="text-[11px] font-semibold tracking-[0.42em] text-cyan-300/80">{data.greeting.toUpperCase()}</div>
                <div className="izk-hud-time mt-1 text-[clamp(52px,6.5vw,86px)] font-extralight leading-none tracking-[0.04em] text-white">
                  {clock}
                  <span className="ml-1 align-top text-[0.28em] text-cyan-200/70">{seconds}</span>
                </div>
                <div className="mt-2 text-[13px] tracking-[0.18em] text-cyan-100/75">{data.date.toUpperCase()}</div>
                {/* The boot check-in: each system reports in, one by one. */}
                <div className="mt-3 flex flex-col items-center gap-1 font-mono text-[10px] tracking-[0.2em] text-cyan-200/80">
                  {["VOICE ONLINE", "SCREEN LINKED", data.apps.length ? `${data.apps.length} APPS CONNECTED` : "APPS STANDING BY"].map((line, i) => (
                    <motion.div key={line} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 + i * 0.28, duration: 0.25 }}>
                      <span className="mr-1.5 text-emerald-300">✓</span>
                      {line}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ---- right: your day */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col gap-4">
              <Panel title="TODAY">
                {(data.calendar ?? []).map(([at, title], i) => (
                  <Line key={`c${i}`} k={at} v={`📅 ${title}`} onClick={() => ask(`Tell me about my "${title}" at ${at} — who's in it and what I should prepare.`)} />
                ))}
                {data.reminders.map(([at, text], i) => (
                  <Line key={`r${i}`} k={at} v={`⏰ ${text}`} />
                ))}
                {later.map((l) => (
                  <Line key={l.id} k="Later" v={`🗒️ ${l.text}`} onClick={() => { void api.laterDone(l.id, true); setLater((x) => x.filter((y) => y.id !== l.id)); }} hint="Tick off" />
                ))}
                {!data.reminders.length && !(data.calendar ?? []).length && !later.length && (
                  <div className="text-[13px] text-cyan-100/70">Nothing else on today.</div>
                )}
              </Panel>
              {acrossApps && (
                <Panel title="ACROSS YOUR APPS">
                  {acrossApps
                    .split(/\n+/)
                    .map((l) => l.replace(/^[-•*\s]+/, "").trim())
                    .filter(Boolean)
                    .slice(0, 4)
                    .map((l, i) => (
                      <div key={i} className="text-[12.5px] leading-snug text-cyan-50/90">
                        {l}
                      </div>
                    ))}
                </Panel>
              )}
              {digest && (
                <Panel title="INBOX — WHAT MATTERS">
                  <div className="text-[12.5px] leading-snug text-cyan-50/90">{digest.summary}</div>
                  {digest.items.slice(0, 5).map((it, i) => (
                    <button
                      key={i}
                      type="button"
                      data-izk-hit
                      onClick={() => ask(`Help me with the email from ${it.from} about "${it.subject}"${it.action ? ` — ${it.action}` : ""}. Read it and tell me what to do; draft a reply if it needs one, but don't send anything.`)}
                      className="pointer-events-auto flex w-full items-start gap-2 rounded-[6px] border-b border-cyan-300/10 pb-1.5 text-left text-[12.5px] transition last:border-0 hover:bg-cyan-300/10"
                    >
                      <span className="shrink-0">{KIND_ICON[it.kind] ?? "✉️"}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-cyan-50">{it.action || it.subject}</span>
                        <span className="block truncate text-[11px] text-cyan-100/55">{it.from}</span>
                      </span>
                      {it.urgent && <span className="shrink-0 rounded-full bg-amber-400/20 px-1.5 text-[10px] font-semibold text-amber-300">URGENT</span>}
                    </button>
                  ))}
                  {digest.skipped > 0 && <div className="text-[11px] text-cyan-100/45">Skipped {digest.skipped} that didn't need you.</div>}
                </Panel>
              )}
              {data.inbox && !digest && (
                <Panel title="INBOX">
                  <div className="flex items-baseline gap-2">
                    <span className="izk-hud-time text-[30px] font-extralight leading-none text-white">{data.inbox[0] >= 20 ? "20+" : data.inbox[0]}</span>
                    <span className="text-[12px] tracking-[0.14em] text-cyan-100/70">NEW TODAY</span>
                  </div>
                  {data.inbox[1].map(([from, subject], i) => (
                    <Line key={i} k={from} v={subject || "(no subject)"} onClick={() => ask(`Read me the email from ${from} about "${subject}" and tell me if I need to do anything.`)} />
                  ))}
                  <HudChip onClick={() => ask("Summarise my inbox from today — what matters and what can wait?")}>Summarise my inbox</HudChip>
                </Panel>
              )}
              {(data.weather || (data.screen_time ?? []).length > 0) && (
                <Panel title="YOUR DAY">
                  {data.weather && (
                    <Line k="Weather" v={`${data.weather[2]} · ${data.weather[1]}° in ${data.weather[0]}`} onClick={() => ask("What's the weather today, and what should I wear?")} />
                  )}
                  {(data.screen_time ?? []).slice(0, 3).map(([name, mins]) => (
                    <Line key={name} k={name} v={mins >= 60 ? `${Math.floor(mins / 60)} h ${mins % 60} min` : `${mins} min`} onClick={() => ask(`How long was I on ${name} today?`)} />
                  ))}
                </Panel>
              )}
              <Panel title="LINKED APPS">
                {data.apps.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {data.apps.slice(0, 8).map((a) => (
                      <button
                        type="button"
                        data-izk-hit
                        key={a}
                        onClick={() => ask(`What's new in my ${a}?`)}
                        className="pointer-events-auto rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2.5 py-0.5 text-[12px] text-cyan-50 transition hover:border-cyan-200 hover:bg-cyan-300/25"
                      >
                        <i className="mr-1.5 inline-block h-1.5 w-1.5 translate-y-[-1px] rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                        {a}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-[13px] text-cyan-100/70">None yet — say “connect Gmail”.</div>
                )}
              </Panel>
            </motion.div>

          </div>

          {/* ---- ask anything, or one tap */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="absolute bottom-[5vh] left-1/2 flex w-[min(820px,90vw)] -translate-x-1/2 flex-col items-center gap-2.5"
            onMouseEnter={() => setHeld(true)}
          >
            <form
              data-izk-hit
              className="izk-hud-panel pointer-events-auto flex w-full items-center gap-2 px-4 py-2.5"
              onSubmit={(e) => {
                e.preventDefault();
                if (!command.trim()) return;
                ask(command.trim());
                setCommand("");
              }}
            >
              <span className="text-[10.5px] font-bold tracking-[0.3em] text-cyan-300">ASK</span>
              <input
                value={command}
                onFocus={() => setHeld(true)}
                // The overlay doesn't take the keyboard by itself: ask for it.
                onMouseDown={() => void api.setOverlayInteractive(true).then(() => markHit())}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Ask Izuki anything — “plan my evening”, “clean up my PC”…"
                className="min-w-0 flex-1 bg-transparent text-[14px] text-cyan-50 outline-none placeholder:text-cyan-100/40"
              />
            </form>
            {asked && (
              <div className="izk-hud-panel flex items-center gap-2 px-3 py-1.5 text-[12.5px] text-cyan-50">
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
                On it: {asked}
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-2">
              {[
                ["📬 Go through my email", "What's important in my email?"],
                ["🎯 Focus 25", "focus for 25 minutes"],
                ["⏱️ 5-min timer", "set a timer for 5 minutes"],
                ["🔊 Read this page", "read this to me"],
                ["🗓️ Plan my day", "Plan my day: what's on, what's due, and what I should do first."],
                ["🧹 Tidy my PC", "Check my PC in the background: what's taking space, what's slowing it down, and what I could clean up. Don't delete anything yet."],
                ["📰 Today's news", "Give me today's top news in 4 short lines."],
                ["🌤️ Weather", "What's the weather today?"],
                ["🎵 Play music", "Play some chill music."],
              ].map(([label, said]) => (
                <HudChip key={label} onClick={() => ask(said, label.replace(/^\S+\s/, ""))}>{label}</HudChip>
              ))}
            </div>
          </motion.div>

          <button
            type="button"
            data-izk-hit
            aria-label="Close"
            onClick={() => setData(null)}
            className="pointer-events-auto absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/30 bg-black/40 text-cyan-100 transition hover:bg-cyan-300/15"
          >
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Panel({ title, children, live }: { title: string; children: React.ReactNode; live?: boolean }) {
  return (
    <div className="izk-hud-panel relative flex flex-col gap-2.5 p-4">
      <div className="flex items-center gap-2 text-[10.5px] font-bold tracking-[0.32em] text-cyan-300">
        <i className="inline-block h-1.5 w-1.5 rotate-45 bg-cyan-300 shadow-[0_0_8px_#67e8f9]" />
        {title}
        {live && (
          <span className="ml-auto flex items-center gap-1 text-[9px] tracking-[0.2em] text-emerald-300">
            <i className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> LIVE
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Line({ k, v, warn, onClick, hint }: { k: string; v: string; warn?: boolean; onClick?: () => void; hint?: string }) {
  const body = (
    <>
      <span className="shrink-0 text-cyan-100/60">{k}</span>
      <span className={"truncate text-right " + (warn ? "text-amber-300" : "text-cyan-50")}>{v}</span>
    </>
  );
  const cls = "flex items-baseline justify-between gap-3 border-b border-cyan-300/10 pb-1.5 text-[13px] last:border-0";
  return onClick ? (
    <button type="button" data-izk-hit title={hint ?? "Ask Izuki about this"} onClick={onClick} className={cls + " pointer-events-auto w-full rounded-[6px] text-left transition hover:bg-cyan-300/10"}>
      {body}
    </button>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function HudButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      data-izk-hit
      aria-label={label}
      onClick={onClick}
      className="pointer-events-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-300/30 bg-black/30 text-cyan-100 transition hover:bg-cyan-300/20"
    >
      {children}
    </button>
  );
}

function HudChip({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      data-izk-hit
      onClick={onClick}
      className="pointer-events-auto rounded-full border border-cyan-300/30 bg-black/35 px-3 py-1 text-[12px] text-cyan-50 backdrop-blur transition hover:border-cyan-200 hover:bg-cyan-300/20"
    >
      {children}
    </button>
  );
}

function Gauge({ label, value, warn, onClick }: { label: string; value: number; warn?: boolean; onClick?: () => void }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <button type="button" data-izk-hit onClick={onClick} title="Ask Izuki about this" className="pointer-events-auto flex flex-col items-center gap-1 rounded-[10px] p-1 transition hover:bg-cyan-300/10">
      <svg width="78" height="78" viewBox="0 0 78 78" className="izk-hud-glow">
        <circle cx="39" cy="39" r={r} fill="none" stroke="rgba(103,232,249,0.15)" strokeWidth="5" />
        <motion.circle
          cx="39"
          cy="39"
          r={r}
          fill="none"
          stroke={warn ? "#fbbf24" : "#67e8f9"}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - v / 100) }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          transform="rotate(-90 39 39)"
        />
        <text x="39" y="44" textAnchor="middle" fill="#ecfeff" fontSize="16" fontWeight="300">
          {Math.round(v)}%
        </text>
      </svg>
      <span className="text-[10.5px] tracking-[0.2em] text-cyan-100/70">{label.toUpperCase()}</span>
    </button>
  );
}

/** Three turning rings with ticks — the HUD's heart. Rotation only (cheap). */
function Rings() {
  return (
    <svg viewBox="0 0 400 400" className="izk-hud-glow absolute inset-0 h-full w-full">
      <g className="izk-hud-spin-slow" style={{ transformOrigin: "200px 200px" }}>
        <circle cx="200" cy="200" r="190" fill="none" stroke="rgba(103,232,249,0.35)" strokeWidth="1" />
        <circle cx="200" cy="200" r="182" fill="none" stroke="#67e8f9" strokeWidth="2" strokeDasharray="2 10" opacity="0.7" />
      </g>
      <g className="izk-hud-spin-rev" style={{ transformOrigin: "200px 200px" }}>
        <circle cx="200" cy="200" r="160" fill="none" stroke="#22d3ee" strokeWidth="3" strokeDasharray="140 60 30 60" opacity="0.8" />
      </g>
      <g className="izk-hud-spin-fast" style={{ transformOrigin: "200px 200px" }}>
        <circle cx="200" cy="200" r="140" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="60 340" opacity="0.9" />
        <circle cx="200" cy="200" r="140" fill="none" stroke="#f0abfc" strokeWidth="1.5" strokeDasharray="20 420" strokeDashoffset="-300" opacity="0.8" />
      </g>
      <circle cx="200" cy="200" r="128" fill="rgba(8,30,48,0.35)" stroke="rgba(103,232,249,0.25)" strokeWidth="1" />
    </svg>
  );
}

/** The processor over the last two minutes — a live trace, newest on the right. */
function Trace({ values }: { values: number[] }) {
  const w = 220;
  const h = 34;
  const step = w / Math.max(1, 59);
  const pts = values.map((v, i) => `${(i + 60 - values.length) * step},${h - (Math.max(0, Math.min(100, v)) / 100) * (h - 2) - 1}`).join(" ");
  const last = values[values.length - 1] ?? 0;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="izk-hud-glow h-[34px] w-full" preserveAspectRatio="none" aria-label={`Processor ${last}%`}>
      <line x1="0" y1={h * 0.12} x2={w} y2={h * 0.12} stroke="rgba(251,191,36,0.25)" strokeDasharray="3 4" />
      <polyline points={pts} fill="none" stroke={last >= 88 ? "#fbbf24" : "#67e8f9"} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
