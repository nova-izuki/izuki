import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { api, EV, emit, on } from "../lib/ipc";
import { resizeHandles, useFloating, workArea, type Limits } from "../lib/floating";
import type { OrbState, Settings } from "../lib/types";
import { TranscriptText } from "./TranscriptBar";
import { drawWaterOrb } from "../../docs/app/water-orb.js";
import { createOrbMotion, stepOrbMotion } from "../../docs/app/orb-motion.js";
import { drawConstellationOrb, drawRippleOrb } from "../../docs/app/orb-materials.js";
import { drawGlassOrb, type FaceOptions } from "../../docs/app/glass-orb.js";
import { faceFor } from "../lib/avatar";
import { watchPointer } from "./Island";

/**
 * The hands-free voice sphere — "Hey Izuki" summons it.
 *
 * A big liquid orb: translucent wave-blobs, each filled with a slowly
 * turning gradient of the state's colours and screened together, so the
 * colours flow around inside it like light through moving water. Its
 * surface is driven by real sound — your mic while you talk, Izuki's own
 * voice while it answers (both arrive as `EV.voiceLevel`) — so it ripples
 * hard on loud syllables and settles in the pauses, and its core brightens
 * with the voice. Thinking is a faster swirl. Colours shift with the state:
 * cool cyan-blue listening, violet thinking, warm pink-cyan-green speaking.
 */

const DEFAULT_SIZE = 250;
const LIMITS: Limits = { minW: 110, minH: 110, maxW: 560, maxH: 560 };
const HANDLES = resizeHandles(10);

/**
 * Where the visible orb ends, as a share of the box: the canvas draws the
 * water at ~0.3 of the box around the centre and its glow beyond, so words
 * placed under the *box* floated far below the orb. They hang from here.
 */
const ORB_BOTTOM = 0.84;
/** Room kept under the orb for three lines of your words. */
const TEXT_ROOM = 110;

/** Bottom-centre, above the taskbar — where a voice assistant sits. */
function initialBox() {
  const wa = workArea();
  return {
    x: Math.round((wa.left + wa.right - DEFAULT_SIZE) / 2),
    y: Math.round(wa.bottom - DEFAULT_SIZE * ORB_BOTTOM - TEXT_ROOM),
    w: DEFAULT_SIZE,
    h: DEFAULT_SIZE,
  };
}

/** Four colours per state — they flow around the orb as it turns. */
interface Palette {
  colors: [string, string, string, string];
  glow: string;
  /** How fast the colours travel round (radians per second). */
  spin: number;
}
const PALETTES: Record<Exclude<OrbState, "hidden">, Palette> = {
  listening: { colors: ["6,182,212", "10,132,255", "99,102,241", "34,211,238"], glow: "14,165,233", spin: 0.45 },
  thinking: { colors: ["147,51,234", "79,70,229", "219,39,119", "124,58,237"], glow: "139,92,246", spin: 1.3 },
  speaking: { colors: ["236,72,153", "6,182,212", "16,185,129", "139,92,246"], glow: "217,70,239", spin: 0.7 },
};

const LABEL: Record<Exclude<OrbState, "hidden">, string> = {
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "",
};

/**
 * Drag it anywhere, pull any edge (or scroll over it) to resize — it
 * remembers where it was. Hovering shows an × that dismisses it (and stops
 * Izuki talking). `demo` fakes a talking voice, only for previewing the
 * look outside the app.
 */
export function VoiceSphere({
  state,
  demo = false,
  transcript = null,
  doing = null,
}: {
  state: OrbState;
  demo?: boolean;
  /** Your words as you speak them — shown under the sphere, live. */
  transcript?: { text: string; final: boolean } | null;
  /** What Izuki is doing right now ("Opening Blackboard…"), while it works. */
  doing?: string | null;
}) {
  const visible = state !== "hidden";
  const [style, setStyle] = useState<Settings["orb_style"]>("liquid");
  const [response, setResponse] = useState(1);
  const [face, setFace] = useState<FaceOptions | null>(null);
  const [poke, setPoke] = useState(0);
  const pressed = useRef<{ x: number; y: number; at: number } | null>(null);
  useEffect(() => {
    let alive = true;
    const refresh = () => void api.getSettings().then((s) => { if (alive) { setStyle(s.orb_style || "liquid"); setResponse(s.orb_response ?? 1); setFace(faceFor(s)); } }).catch(() => {});
    refresh();
    const off = on<void>(EV.settingsChanged, refresh);
    return () => { alive = false; void off.then((f) => f()); };
  }, []);
  const { box, setBox, begin, reset } = useFloating("izuki.sphere", initialBox, LIMITS);

  // Always a circle: whichever side a drag grew, the other follows.
  useEffect(() => {
    if (box.w !== box.h) {
      const size = Math.max(box.w, box.h);
      setBox((b) => ({ ...b, w: size, h: size }));
    }
  }, [box.w, box.h, setBox]);

  // "Reset the chat" puts the sphere back in its spot too.
  useEffect(() => {
    const off = on<void>(EV.resetFloating, () => reset());
    return () => void off.then((f) => f());
  }, [reset]);

  const size = Math.min(box.w, box.h);
  const onWheel = (e: React.WheelEvent) => {
    const next = Math.max(LIMITS.minW, Math.min(LIMITS.maxW, size * (e.deltaY < 0 ? 1.08 : 0.93)));
    // Grow around the centre, not the top-left corner.
    setBox((b) => ({ x: b.x + (b.w - next) / 2, y: b.y + (b.h - next) / 2, w: next, h: next }));
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="sphere"
          data-izk-hit
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="group fixed"
          style={{ left: box.x, top: box.y, width: size, height: size, cursor: "grab" }}
          onPointerDown={(e) => {
            pressed.current = { x: e.clientX, y: e.clientY, at: performance.now() };
            begin(e, "move");
          }}
          onPointerUp={(e) => {
            // A tap, not a drag: the 3D face reacts.
            const p = pressed.current;
            if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) < 5 && performance.now() - p.at < 350) setPoke(Date.now());
          }}
          onWheel={onWheel}
        >
          <SphereCanvas state={state as Exclude<OrbState, "hidden">} demo={demo} size={size} style={style} response={response} face={face ? { ...face, poke } : null} />
          <button
            type="button"
            aria-label="Dismiss"
            title="Dismiss"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => void emit(EV.stopSpeaking)}
            className="absolute right-[19%] top-[19%] flex h-[22px] w-[22px] items-center justify-center rounded-full border border-white/20 bg-black/45 text-white/80 opacity-0 transition-opacity duration-150 hover:text-white group-hover:opacity-100"
          >
            <X size={12} strokeWidth={2.6} />
          </button>
          {HANDLES.map((h) => (
            <div key={h.edge} style={h.style} onPointerDown={(e) => begin(e, h.edge)} />
          ))}
          {/* Hung from the orb's visible bottom edge, centred on it. */}
          <div
            className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 justify-center"
            style={{ top: size * ORB_BOTTOM, width: "max-content", maxWidth: "min(560px, 80vw)" }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {transcript ? (
                <motion.div
                  key="words"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.16 }}
                >
                  <TranscriptText text={transcript.text} final={transcript.final} />
                </motion.div>
              ) : LABEL[state as Exclude<OrbState, "hidden">] ? (
                <motion.div
                  key={`${state}:${doing ?? ""}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="izk-orb-label flex max-w-[360px] items-center gap-2 rounded-full px-3 py-[3px] text-[12.5px] font-semibold tracking-[0.02em]"
                >
                  <span className="truncate">
                    {state !== "listening" && doing ? doing : LABEL[state as Exclude<OrbState, "hidden">]}
                  </span>
                  {/* While it's busy, how to stop it — for everyone, not just people who read settings. */}
                  {state !== "listening" && (
                    <span className="shrink-0 text-[10.5px] font-medium opacity-60">Esc to stop</span>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SphereCanvas({
  state,
  demo,
  size: SIZE,
  style,
  response = 1,
  preview = false,
  face = null,
}: {
  /** The 3D faces: who, and how they look. */
  face?: FaceOptions | null;
  state: Exclude<OrbState, "hidden">;
  demo: boolean;
  size: number;
  style: Settings["orb_style"];
  response?: number;
  preview?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceRef = useRef(face);
  faceRef.current = face;
  /** Where the 3D face looks: at the pointer while it moves, else around. */
  const lookRef = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (style !== "holo3d" && style !== "avatar") return;
    let idle: ReturnType<typeof setTimeout> | undefined;
    const stop = watchPointer((x, y) => {
      const r = canvasRef.current?.getBoundingClientRect();
      if (!r) return;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      lookRef.current = {
        x: Math.max(-1, Math.min(1, (x - cx) / Math.max(200, window.innerWidth * 0.35))),
        y: Math.max(-1, Math.min(1, (y - cy) / Math.max(200, window.innerHeight * 0.4))),
      };
      clearTimeout(idle);
      idle = setTimeout(() => (lookRef.current = null), 3500);
    });
    return () => {
      stop();
      clearTimeout(idle);
    };
  }, [style]);
  const stateRef = useRef(state);
  stateRef.current = state;
  /** Latest raw level from the bus; the draw loop smooths it. */
  const target = useRef(0);
  /** How Izuki feels as it speaks (-1 sad … 1 happy) — the face shows it. */
  const mood = useRef(0);
  useEffect(() => {
    if (preview) return;
    const off = on<{ mood?: string | null } | string>(EV.say, (p) => {
      const m = typeof p === "string" ? "" : (p.mood ?? "");
      mood.current = /cheer|excit|happy|proud|playful/.test(m) ? 1 : /sympath|sad|sorry|concern/.test(m) ? -0.7 : /curious|surpris/.test(m) ? 0.35 : 0.1;
    });
    return () => void off.then((f) => f());
  }, [preview]);

  useEffect(() => {
    if (preview) return;
    const off = on<number>(EV.voiceLevel, (l) => {
      // A bad reading (NaN) would poison the smoothing for good.
      target.current = Number.isFinite(l) ? Math.max(0, Math.min(1, l)) : 0;
    });
    return () => void off.then((f) => f());
  }, [preview]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Each liquid layer is drawn on its own scratch canvas first, so its
    // "clearer in the middle" pass can't erase the layers beneath it.
    const scratch = document.createElement("canvas");
    scratch.width = canvas.width;
    scratch.height = canvas.height;
    const lx = scratch.getContext("2d");
    if (!lx) return;
    lx.scale(dpr, dpr);

    let raf = 0;
    let level = 0;
    let t = 0;
    /** Where the colours are in their trip round the orb. */
    let turn = 0;
    const physics = createOrbMotion();
    let inView = true;
    let last = performance.now();
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const parse = (col: string) => col.split(",").map(Number);
    // Colours ease between states instead of snapping.
    let mix = PALETTES[stateRef.current].colors.map(parse);
    let glowMix = parse(PALETTES[stateRef.current].glow);
    const rgba = (rgb: number[], a: number) => `rgba(${rgb.map(Math.round).join(",")},${a})`;

    const draw = (now: number) => {
      if (document.hidden || !inView) { raf = 0; return; }
      raf = requestAnimationFrame(draw);
      if (now - last < (reduced ? 150 : 33)) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const st = stateRef.current;
      const pal = PALETTES[st];

      // Level: quick attack, slower release — like a real VU meter. The
      // bus goes quiet between words; decay the target so it settles.
      if (demo) target.current = Math.max(target.current, Math.abs(Math.sin(now / 170) * Math.sin(now / 530)));
      const goal = st === "thinking" ? 0.22 + 0.08 * Math.sin(now / 380) : target.current;
      if (style !== "liquid") stepOrbMotion(physics, dt, reduced || st === "thinking" ? 0 : target.current, reduced ? "idle" : st, response);
      level += (goal - level) * (goal > level ? 0.45 : 0.08);
      target.current *= 0.9;
      t += dt * (st === "thinking" ? 1.6 : 1 + level * 2.2);
      // The gradient never stops drifting; a voice pushes it along.
      turn += dt * (pal.spin + level * 1.2);
      if (!Number.isFinite(level)) level = 0;
      if (!Number.isFinite(t)) t = 0;
      if (!Number.isFinite(turn)) turn = 0;

      const ease = (from: number[], to: string) => from.map((v, i) => v + (Number(to.split(",")[i]) - v) * 0.06);
      mix = mix.map((col, i) => ease(col, pal.colors[i]));
      glowMix = ease(glowMix, pal.glow);

      const c = SIZE / 2;
      const R = SIZE * 0.3 * (1 + level * 0.16 + 0.015 * Math.sin(now / 900));
      ctx.clearRect(0, 0, SIZE, SIZE);

      // The realistic, GPU-drawn materials; the 2D ones are the fallback.
      const faceNow = faceRef.current ? { ...faceRef.current, look: lookRef.current } : null;
      if (style !== "liquid" && drawGlassOrb(ctx, SIZE, style, reduced ? 0 : physics.time, physics.energy, physics.waiting, demo ? 0.8 : mood.current, faceNow)) return;
      if (style === "ferrofluid" || style === "dew") {
        drawWaterOrb(ctx, SIZE, physics.time, physics.energy, 0, st === "thinking", physics);
        return;
      }
      if (style === "constellation" || style === "ripple") {
        (style === "constellation" ? drawConstellationOrb : drawRippleOrb)(ctx, SIZE, reduced ? 0 : physics.time, physics.energy);
        return;
      }

      // Soft halo behind everything, tinted by whichever colour is passing
      // by — so the glow shifts too.
      const halo = ctx.createRadialGradient(c, c, R * 0.4, c, c, SIZE / 2);
      halo.addColorStop(0, rgba(glowMix, 0.42 + level * 0.38));
      halo.addColorStop(0.55, rgba(mix[Math.abs(Math.floor(turn / 1.5)) % 4] ?? mix[0], 0.1 + level * 0.12));
      halo.addColorStop(1, rgba(glowMix, 0));
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, SIZE, SIZE);

      // Deep water in the middle so the glowing layers read against it
      // instead of washing out to white.
      const body = ctx.createRadialGradient(c, c + R * 0.2, R * 0.1, c, c, R * 1.05);
      body.addColorStop(0, rgba(mix[1], 0.16));
      body.addColorStop(1, "rgba(4,8,22,0.78)");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(c, c, R * 0.97, 0, Math.PI * 2);
      ctx.fill();

      // The liquid: three wave-blobs, each filled with a turning gradient of
      // the palette (each at its own pace, the middle one the other way),
      // screened together so the colours mix like light.
      ctx.globalCompositeOperation = "screen";
      for (let layer = 0; layer < 3; layer++) {
        const phase = layer * 2.1;
        const amp = 0.05 + level * 0.2;
        const scale = 0.86 + layer * 0.08;
        lx.globalCompositeOperation = "source-over";
        lx.clearRect(0, 0, SIZE, SIZE);
        lx.beginPath();
        const steps = 120;
        for (let i = 0; i <= steps; i++) {
          const a = (i / steps) * Math.PI * 2;
          const wave =
            Math.sin(a * 2 + t * 1.3 + phase) * 0.5 +
            Math.sin(a * 3 - t * 1.9 + phase * 1.7) * 0.35 +
            Math.sin(a * 5 + t * 2.7 - phase) * 0.25 * (0.3 + level * 1.4) +
            Math.sin(a * 8 - t * 3.4 + phase) * 0.12 * level;
          const r = R * scale * (1 + amp * wave);
          const x = c + Math.cos(a) * r;
          const y = c + Math.sin(a) * r;
          if (i === 0) lx.moveTo(x, y);
          else lx.lineTo(x, y);
        }
        lx.closePath();
        const ox = Math.cos(t * 0.7 + phase) * R * 0.16;
        const oy = Math.sin(t * 0.9 + phase) * R * 0.16;
        const dir = layer === 1 ? -1 : 1;
        const flow = lx.createConicGradient(turn * dir * (0.8 + layer * 0.25) + phase, c + ox, c + oy);
        for (let k = 0; k <= 4; k++) flow.addColorStop(k / 4, rgba(mix[(k + layer) % 4], 0.78));
        lx.fillStyle = flow;
        lx.fill();
        lx.strokeStyle = rgba(mix[(layer + 2) % 4], 0.35 + level * 0.5);
        lx.lineWidth = 1.3;
        lx.stroke();
        // Clearer inside, bright at the rim — light caught in a droplet.
        lx.globalCompositeOperation = "destination-out";
        const clear = lx.createRadialGradient(c + ox, c + oy, 0, c + ox, c + oy, R * scale * 1.1);
        clear.addColorStop(0, "rgba(0,0,0,0.97)");
        clear.addColorStop(0.6, "rgba(0,0,0,0.85)");
        clear.addColorStop(0.88, "rgba(0,0,0,0.3)");
        clear.addColorStop(1, "rgba(0,0,0,0)");
        lx.fillStyle = clear;
        lx.fillRect(0, 0, SIZE, SIZE);
        ctx.drawImage(scratch, 0, 0, SIZE, SIZE);
      }

      // Caustics — thin rippling light rings drifting inside the water.
      for (let k = 0; k < 3; k++) {
        const rr = R * (0.35 + k * 0.18 + 0.05 * Math.sin(t * 0.8 + k));
        ctx.beginPath();
        for (let i = 0; i <= 72; i++) {
          const a = (i / 72) * Math.PI * 2;
          const r = rr * (1 + (0.08 + level * 0.12) * Math.sin(a * (3 + k) + t * (1.2 + k * 0.5)));
          const x = c + Math.cos(a) * r;
          const y = c + Math.sin(a) * r * 0.92;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(255,255,255,${0.06 + level * 0.12})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // A core of light that swells with the voice.
      const core = ctx.createRadialGradient(c, c, 0, c, c, R * (0.45 + level * 0.35));
      core.addColorStop(0, `rgba(255,255,255,${0.03 + level * 0.22})`);
      core.addColorStop(0.5, rgba(mix[0], 0.1 + level * 0.22));
      core.addColorStop(1, rgba(mix[0], 0));
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(c, c, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      // Glassy highlight, and an iridescent rim that turns with the colours.
      const hl = ctx.createRadialGradient(c - R * 0.38, c - R * 0.42, 0, c - R * 0.38, c - R * 0.42, R * 0.55);
      hl.addColorStop(0, "rgba(255,255,255,0.3)");
      hl.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = hl;
      ctx.beginPath();
      ctx.arc(c, c, R * 0.98, 0, Math.PI * 2);
      ctx.fill();
      const rim = ctx.createConicGradient(-turn * 1.4, c, c);
      for (let k = 0; k <= 4; k++) rim.addColorStop(k / 4, rgba(mix[k % 4], 0.35 + level * 0.45));
      ctx.strokeStyle = rim;
      ctx.lineWidth = 1.4 + level * 1.6;
      ctx.stroke();

    };
    raf = requestAnimationFrame(draw);
    const wake = () => { if (!document.hidden && !raf) raf = requestAnimationFrame(draw); };
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; if (inView) wake(); });
    observer.observe(canvas);
    document.addEventListener("visibilitychange", wake);
    return () => { cancelAnimationFrame(raf); observer.disconnect(); document.removeEventListener("visibilitychange", wake); };
  }, [demo, SIZE, style, response]);

  return <canvas ref={canvasRef} style={{ width: SIZE, height: SIZE }} />;
}
