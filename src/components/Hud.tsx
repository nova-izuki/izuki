import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { EV, on } from "../lib/ipc";

/**
 * The status screen — "Hey Nova, wake up" / "what's on today". A
 * holographic heads-up display fades in over the desktop while Izuki reads
 * the briefing: the time inside turning rings, battery and memory gauges,
 * free space, today's reminders, what's playing and the linked apps.
 * Izuki's own design; it goes away by itself after the briefing (or ×).
 */

export interface HudData {
  greeting: string;
  time: string;
  date: string;
  battery: [number, boolean] | null;
  memory: number | null;
  disk_free_gb: number | null;
  reminders: Array<[string, string]>;
  playing: string | null;
  apps: string[];
  said: string;
}

/** After the voice finishes, the screen stays this long to read. */
const LINGER_MS = 7000;
/** And never longer than this, voice or not. */
const MAX_MS = 45_000;

export function Hud({ preview = null }: { preview?: HudData | null } = {}) {
  const [data, setData] = useState<HudData | null>(preview);
  const timer = useRef(0);

  useEffect(() => {
    const close = (after: number) => {
      clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setData(null), after);
    };
    const offs = [
      on<HudData>("izuki://hud", (d) => {
        setData(d);
        close(MAX_MS);
      }),
      on<boolean>(EV.speaking, (talking) => {
        if (!talking) close(LINGER_MS);
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
        >
          <div className="izk-hud-scan absolute inset-0" />
          <div className="relative grid w-[min(1100px,94vw)] grid-cols-[1fr_auto_1fr] items-center gap-[clamp(16px,3vw,44px)]">
            {/* ---- left: the PC */}
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col gap-4">
              <Panel title="SYSTEMS">
                <div className="flex items-center justify-around gap-3">
                  {data.battery && <Gauge label={data.battery[1] ? "Charging" : "Battery"} value={data.battery[0]} />}
                  {data.memory != null && <Gauge label="Memory" value={data.memory} warn={data.memory >= 85} />}
                </div>
                {data.disk_free_gb != null && (
                  <Line k="Free space" v={`${data.disk_free_gb} GB`} warn={data.disk_free_gb < 10} />
                )}
                <Line k="Status" v={(data.memory ?? 0) >= 85 || (data.disk_free_gb ?? 99) < 10 ? "Needs attention" : "All systems normal"} />
              </Panel>
              {data.playing && (
                <Panel title="NOW PLAYING">
                  <div className="flex items-center gap-3">
                    <span className="izk-hud-eq flex h-4 items-end gap-[3px]">
                      {[0, 1, 2, 3].map((i) => (
                        <i key={i} style={{ animationDelay: `${i * -0.2}s` }} />
                      ))}
                    </span>
                    <span className="truncate text-[14px] text-cyan-50">{data.playing}</span>
                  </div>
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
                <div className="izk-hud-time mt-1 text-[clamp(52px,6.5vw,86px)] font-extralight leading-none tracking-[0.04em] text-white">{data.time}</div>
                <div className="mt-2 text-[13px] tracking-[0.18em] text-cyan-100/75">{data.date.toUpperCase()}</div>
              </div>
            </motion.div>

            {/* ---- right: your day */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col gap-4">
              <Panel title="TODAY">
                {data.reminders.length ? (
                  data.reminders.map(([at, text], i) => <Line key={i} k={at} v={text} />)
                ) : (
                  <div className="text-[13px] text-cyan-100/70">Nothing else on your reminders.</div>
                )}
              </Panel>
              <Panel title="LINKED APPS">
                {data.apps.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {data.apps.slice(0, 8).map((a) => (
                      <span key={a} className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2.5 py-0.5 text-[12px] text-cyan-50">
                        <i className="mr-1.5 inline-block h-1.5 w-1.5 translate-y-[-1px] rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                        {a}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-[13px] text-cyan-100/70">None yet — say “connect Gmail”.</div>
                )}
              </Panel>
            </motion.div>

          </div>

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

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="izk-hud-panel relative flex flex-col gap-2.5 p-4">
      <div className="flex items-center gap-2 text-[10.5px] font-bold tracking-[0.32em] text-cyan-300">
        <i className="inline-block h-1.5 w-1.5 rotate-45 bg-cyan-300 shadow-[0_0_8px_#67e8f9]" />
        {title}
      </div>
      {children}
    </div>
  );
}

function Line({ k, v, warn }: { k: string; v: string; warn?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-cyan-300/10 pb-1.5 text-[13px] last:border-0">
      <span className="shrink-0 text-cyan-100/60">{k}</span>
      <span className={"truncate text-right " + (warn ? "text-amber-300" : "text-cyan-50")}>{v}</span>
    </div>
  );
}

function Gauge({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="flex flex-col items-center gap-1">
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
          transition={{ delay: 0.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          transform="rotate(-90 39 39)"
        />
        <text x="39" y="44" textAnchor="middle" fill="#ecfeff" fontSize="16" fontWeight="300">
          {Math.round(v)}%
        </text>
      </svg>
      <span className="text-[10.5px] tracking-[0.2em] text-cyan-100/70">{label.toUpperCase()}</span>
    </div>
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
