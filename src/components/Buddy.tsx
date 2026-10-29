import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Minus, X } from "lucide-react";
import { api, EV, emit, on } from "../lib/ipc";
import { resizeHandles, useFloating, workArea, type Limits } from "../lib/floating";
import type { HandCommand, OrbState, StatusEvent } from "../lib/types";
import { TranscriptText } from "./TranscriptBar";
import { watchPointer } from "./Island";
import { createActor, drawPet, drawPuppet, loadPuppet, react, stepActor, type Actor, type Puppet } from "../../docs/app/puppet.js";
import { createMover, drawMover, loadMoves, nudgeMover, stepMover, type MovesPack } from "../../docs/app/sprites.js";

/**
 * The moving character — a companion look like the orbs (style
 * "buddy:<id>"), shown only while you're asking something, exactly where the
 * orb would be. It moves like a person (docs/app/puppet.js): waves hello,
 * tilts its head to listen, puts a hand to its chin to think, types on a
 * tiny laptop while it works, talks with its hands and mouth, dances to
 * your music, and — like a desktop buddy — walks over to what Izuki is
 * clicking and points at it. Your pet, if you want one, follows it around.
 *
 * Drag it anywhere, scroll over it (or pull an edge) to zoom, – to tuck it
 * into a little bubble, × to stop. Battery: drawn 30 times a second only
 * while it's on screen, nothing at all otherwise.
 */

const ASPECT = 0.62; // width / height of its box
const DEFAULT_H = 190;
const LIMITS: Limits = { minW: 70, minH: 110, maxW: 430, maxH: 700 };
const HANDLES = resizeHandles(10);
const MIN_KEY = "izuki.buddy.min";
const PET_SRC: Record<string, string> = {
  cat: new URL("../../docs/app/painted/pets/cat.webp", import.meta.url).href,
  dog: new URL("../../docs/app/painted/pets/dog.webp", import.meta.url).href,
};

function initialBox() {
  const wa = workArea();
  const h = DEFAULT_H, w = Math.round(h * ASPECT);
  return { x: Math.round(wa.right - w - 60), y: Math.round(wa.bottom - h - 70), w, h };
}

const readMin = () => {
  try { return localStorage.getItem(MIN_KEY) === "1"; } catch { return false; }
};

export function Buddy({
  id,
  state,
  transcript = null,
  doing = null,
  music = false,
}: {
  id: string;
  state: OrbState;
  transcript?: { text: string; final: boolean } | null;
  doing?: string | null;
  music?: boolean;
}) {
  const visible = state !== "hidden";
  const [min, setMin] = useState(readMin);
  const [pet, setPet] = useState<string>("none");
  const [retro, setRetro] = useState(false);
  const { box, setBox, begin, reset } = useFloating("izuki.buddy", initialBox, LIMITS);

  useEffect(() => {
    let alive = true;
    const read = () =>
      void api
        .getSettings()
        .then((s) => {
          if (!alive) return;
          setPet(s.buddy_pet || "none");
          setRetro(s.buddy_motion === "retro");
        })
        .catch(() => undefined);
    read();
    const off = on<void>(EV.settingsChanged, read);
    return () => { alive = false; void off.then((f) => f()); };
  }, []);
  useEffect(() => {
    const off = on<void>(EV.resetFloating, () => reset());
    return () => void off.then((f) => f());
  }, [reset]);
  // Keep its shape whichever edge was pulled.
  useEffect(() => {
    const w = Math.round(box.h * ASPECT);
    if (Math.abs(box.w - w) > 1) setBox((b) => ({ ...b, w }));
  }, [box.w, box.h, setBox]);

  const setMinimized = (v: boolean) => {
    setMin(v);
    try { localStorage.setItem(MIN_KEY, v ? "1" : "0"); } catch { /* not remembered */ }
  };
  const onWheel = (e: React.WheelEvent) => {
    const h = Math.max(LIMITS.minH, Math.min(LIMITS.maxH, box.h * (e.deltaY < 0 ? 1.08 : 0.93)));
    const w = Math.round(h * ASPECT);
    // Grow from the feet, so it stays standing where it is.
    setBox((b) => ({ x: b.x + (b.w - w) / 2, y: b.y + b.h - h, w, h }));
  };

  return (
    <AnimatePresence>
      {visible && min && (
        <motion.div
          key="buddy-min"
          data-izk-hit
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          className="group fixed"
          style={{ left: box.x + box.w / 2 - 30, top: box.y + box.h - 64, width: 60, height: 60 }}
        >
          <button
            type="button"
            aria-label="Bring your character back"
            title="Bring your character back"
            onClick={() => setMinimized(false)}
            className="h-full w-full overflow-hidden rounded-full border-2 border-white/70 bg-[radial-gradient(circle_at_50%_35%,#3a3f6b,#12142a)] shadow-[0_6px_24px_rgba(0,0,0,0.45)]"
          >
            <Head id={id} talking={state === "speaking"} />
          </button>
          <button
            type="button"
            aria-label="Stop"
            title="Stop"
            onClick={() => void emit(EV.stopSpeaking)}
            className="absolute -right-1 -top-1 flex h-[20px] w-[20px] items-center justify-center rounded-full border border-white/25 bg-black/60 text-white/85 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <X size={11} strokeWidth={2.6} />
          </button>
        </motion.div>
      )}
      {visible && !min && (
        <motion.div
          key="buddy"
          data-izk-hit
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 18 }}
          transition={{ type: "spring", stiffness: 240, damping: 24 }}
          className="group fixed"
          style={{ left: box.x, top: box.y, width: box.w, height: box.h, cursor: "grab" }}
          onPointerDown={(e) => begin(e, "move")}
          onWheel={onWheel}
        >
          <Stage id={id} state={state} doing={doing} music={music} pet={pet} retro={retro} box={box} setBox={setBox} />
          <div className="absolute -top-1 right-0 flex gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            <button
              type="button"
              aria-label="Make it small"
              title="Make it small"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setMinimized(true)}
              className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-white/20 bg-black/45 text-white/80 hover:text-white"
            >
              <Minus size={12} strokeWidth={2.6} />
            </button>
            <button
              type="button"
              aria-label="Stop"
              title="Stop"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => void emit(EV.stopSpeaking)}
              className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-white/20 bg-black/45 text-white/80 hover:text-white"
            >
              <X size={12} strokeWidth={2.6} />
            </button>
          </div>
          {HANDLES.map((h) => (
            <div key={h.edge} style={h.style} onPointerDown={(e) => begin(e, h.edge)} />
          ))}
          <div className="pointer-events-none absolute left-1/2 top-full mt-1 flex -translate-x-1/2 justify-center" style={{ width: "max-content", maxWidth: "min(520px, 80vw)" }}>
            {transcript ? (
              <TranscriptText text={transcript.text} final={transcript.final} />
            ) : state !== "speaking" ? (
              <div className="izk-orb-label flex max-w-[340px] items-center gap-2 rounded-full px-3 py-[3px] text-[12px] font-semibold">
                <span className="truncate">{state === "listening" ? "Listening…" : doing || "Thinking…"}</span>
                {state !== "listening" && <span className="shrink-0 text-[10.5px] font-medium opacity-60">Esc to stop</span>}
              </div>
            ) : null}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Its head, in the little bubble. */
function Head({ id, talking }: { id: string; talking: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let alive = true;
    void loadPuppet(id).then((p) => {
      const c = ref.current;
      if (!alive || !p || !c) return;
      const g = c.getContext("2d");
      if (!g) return;
      const [top, bottom] = p.rig.frames.head || [0, p.height * 0.16];
      const span = (bottom - top) * 1.25;
      c.width = c.height = 120;
      g.drawImage(p.pics.base, p.rig.head[0] - span / 2, top - span * 0.08, span, span, 0, 0, 120, 120);
    });
    return () => { alive = false; };
  }, [id]);
  return <canvas ref={ref} className={"h-full w-full " + (talking ? "animate-pulse" : "")} />;
}

/**
 * The drawing: the character (and pet) on a canvas a bit bigger than its box,
 * so raised arms and props aren't cut off. Also walks it to what Izuki is
 * clicking, and points.
 */
function Stage({
  id,
  state,
  doing,
  music,
  pet,
  retro,
  box,
  setBox,
}: {
  id: string;
  state: OrbState;
  doing: string | null;
  music: boolean;
  pet: string;
  /** Poses flicked frame by frame like an old game, instead of held and blended. */
  retro: boolean;
  box: { x: number; y: number; w: number; h: number };
  setBox: (f: (b: { x: number; y: number; w: number; h: number }) => { x: number; y: number; w: number; h: number }) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const puppet = useRef<Puppet | null>(null);
  /** Real animation frames, when this character has them (else the bending puppet). */
  const moves = useRef<MovesPack | null>(null);
  const mover = useRef(createMover());
  const actor = useRef<Actor>(createActor());
  /** A dance still going (its next moves), cancelled by a new move or when this closes. */
  const danceTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => danceTimers.current.forEach(clearTimeout), []);
  const level = useRef(0);
  const look = useRef<number | null>(null);
  const live = useRef({ state, doing, music, pet, retro, box });
  live.current = { state, doing, music, pet, retro, box };
  /** Where it's walking to (overlay x), and what it'll point at when there. */
  const goal = useRef<{ x: number; target: { x: number; y: number }; until: number } | null>(null);
  const pointing = useRef<{ x: number; y: number; until: number } | null>(null);
  const facing = useRef(1);
  const lastX = useRef(box.x);
  /** While it walks, it's moved directly (no re-render per step) — this far
   * from its saved spot; the new spot is saved once, when it gets there. */
  const walkOff = useRef(0);
  /** Walking speed now: it speeds up setting off and slows arriving, like a person. */
  const walkV = useRef(0);
  const settling = useRef<number | null>(null);
  const petImg = useRef<HTMLImageElement | null>(null);
  const petState = useRef({ x: 0, vx: 0, hop: 0, cheered: false });

  useEffect(() => {
    let alive = true;
    moves.current = null;
    puppet.current = null;
    void loadMoves(id).then((m) => { if (alive) moves.current = m; });
    void loadPuppet(id).then((p) => { if (alive) puppet.current = p; });
    return () => { alive = false; };
  }, [id]);
  useEffect(() => {
    petImg.current = null;
    if (!PET_SRC[pet]) return;
    const im = new Image();
    im.onload = () => (petImg.current = im);
    im.src = PET_SRC[pet];
    return () => { im.onload = null; };
  }, [pet]);
  useEffect(() => {
    const offs = [
      on<number>(EV.voiceLevel, (l) => { level.current = Number.isFinite(l) ? Math.max(0, Math.min(1, l)) : 0; }),
      // Something done: a little celebration; something failed: a shrug.
      on<StatusEvent>(EV.status, (s) => {
        if (s?.kind === "success") {
          const pick = ["cheer", "thumbs", "tada", "clap"] as const;
          react(actor.current, pick[Math.floor(Math.random() * pick.length)]);
        }
        else if (s?.kind === "error") react(actor.current, "shrug");
      }),
      // "Nova, wave" / "cheer" / "dance": asked for by name. A dance is a
      // little routine of moves.
      on<string>(EV.buddyReact, (name) => {
        // A new move cancels the rest of a dance still going.
        danceTimers.current.forEach(clearTimeout);
        danceTimers.current = [];
        if (name === "dance") {
          const moves = ["cheer", "clap", "tada", "cheer", "clap"] as const;
          danceTimers.current = moves.map((m, i) => setTimeout(() => react(actor.current, m), i * 1300));
        } else if (name) react(actor.current, name as Parameters<typeof react>[1]);
      }),
      // "Walk to my Chrome": there, and point at it.
      on<{ nx: number; ny: number }>(EV.buddyGoto, (g) => {
        if (!g || !Number.isFinite(g.nx)) return;
        const tx = g.nx * window.innerWidth, ty = g.ny * window.innerHeight;
        const b = live.current.box;
        const side = tx < b.x + b.w / 2 ? 1 : -1;
        const gx = Math.max(0, Math.min(window.innerWidth - b.w, tx + side * b.w * 0.6 - b.w / 2));
        goal.current = { x: gx, target: { x: tx, y: ty }, until: performance.now() + 9000 };
      }),
      // Izuki is about to click something: walk over beside it and point.
      on<HandCommand>(EV.hand, (cmd) => {
        if (!cmd || !Number.isFinite(cmd.x)) return;
        const d = cmd.desktop && cmd.desktop.w > 0 ? cmd.desktop : null;
        const tx = d ? ((cmd.x - d.x) * window.innerWidth) / d.w : cmd.x;
        const ty = d ? ((cmd.y - d.y) * window.innerHeight) / d.h : cmd.y;
        const b = live.current.box;
        const side = tx < b.x + b.w / 2 ? 1 : -1; // stand to the right of it if it's on the left
        const gx = Math.max(0, Math.min(window.innerWidth - b.w, tx + side * (b.w * 0.55) - b.w / 2 + (side > 0 ? b.w * 0.5 : -b.w * 0.5)));
        goal.current = { x: gx, target: { x: tx, y: ty }, until: performance.now() + 6000 };
      }),
    ];
    const stop = watchPointer((x) => {
      const b = live.current.box;
      look.current = Math.max(-1, Math.min(1, (x - (b.x + b.w / 2)) / Math.max(200, window.innerWidth * 0.3)));
    });
    return () => {
      offs.forEach((o) => void o.then((f) => f()));
      stop();
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let smooth = 0;
    let mouth = 0;
    let quietFor = 1;
    let blinkAt = performance.now() + 1500;
    let blinkFrom = -1e9;
    let blinkTwice = 0;
    let talkUntil = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) { last = now; return; }
      // 30 a second is plenty standing; walking across the screen, 60 so
      // the move is smooth (the walk itself has in-betweens now).
      if (now - last < (goal.current ? 15 : 32)) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const c = canvas.current;
      const L = live.current;
      if (!c) return;
      const b = L.box;
      const host = c.parentElement;
      // Just arrived and saved: until the saved spot shows, that's where it is.
      if (settling.current !== null && Math.abs(b.x - settling.current) < 1) settling.current = null;
      let x = settling.current ?? b.x + walkOff.current;
      // Walking to a goal (Izuki is about to click there).
      let walk = 0;
      const g = goal.current;
      if (g) {
        const dx = g.x - x;
        const top = Math.max(220, b.h * 1.4);
        // Speeds up over the first steps; slows over the last stretch.
        const arrive = top * 0.45;
        const want = Math.abs(dx) < arrive ? Math.max(45, top * (Math.abs(dx) / arrive)) : top;
        walkV.current += (want - walkV.current) * Math.min(1, dt * 5);
        const speed = walkV.current;
        if (Math.abs(dx) < 4 || now > g.until) {
          walkV.current = 0;
          pointing.current = { ...g.target, until: now + 2600 };
          goal.current = null;
          const off = walkOff.current;
          walkOff.current = 0;
          if (off) {
            settling.current = b.x + off;
            setBox((bb) => ({ ...bb, x: bb.x + off }));
          }
        } else {
          walkOff.current += Math.sign(dx) * Math.min(Math.abs(dx), speed * dt);
          x = b.x + walkOff.current;
          if (host) host.style.left = `${x}px`;
        }
      }
      // Moving at all (walked or dragged) is walking.
      const vx = (x - lastX.current) / Math.max(dt, 1e-3);
      lastX.current = x;
      if (Math.abs(vx) > 15) {
        walk = Math.min(1, Math.abs(vx) / 160);
        facing.current = vx > 0 ? 1 : -1;
      } else if (!g) {
        facing.current = 1;
      }
      smooth += (level.current - smooth) * Math.min(1, dt * 12);
      // The mouth: opens fast on each syllable, closes a touch slower.
      const lv = L.state === "speaking" ? level.current : 0;
      mouth += (lv - mouth) * Math.min(1, dt * (lv > mouth ? 32 : 18));
      // A new phrase (the voice back after a little pause): the next gesture.
      if (lv < 0.08) quietFor += dt;
      else {
        if (quietFor > 0.18 && lv > 0.16) nudgeMover(mover.current);
        quietFor = 0;
      }
      // Blinking: every few seconds, now and then twice.
      if (now >= blinkAt) {
        blinkFrom = now;
        blinkAt = now + 2200 + Math.random() * 3800;
        if (Math.random() < 0.15) blinkTwice = now + 260;
      }
      if (blinkTwice && now >= blinkTwice) {
        blinkFrom = now;
        blinkTwice = 0;
      }
      const bt = (now - blinkFrom) / 150;
      const blink = bt >= 0 && bt <= 1 ? Math.sin(bt * Math.PI) : 0;
      // Talking holds through the little gaps between words (it flickered
      // between talking and standing many times a second).
      if (smooth > 0.08) talkUntil = now + 450;
      const talkingNow = now < talkUntil;
      // (Music shows it with no conversation going: it just dances.)
      const mode = L.music ? "idle" : L.state === "listening" ? "listening" : L.state === "speaking" ? "speaking" : L.doing ? "working" : "thinking";
      // Pointing: the arm on the target's side, aimed at it.
      let point = null as { side: "L" | "R"; up: number } | null;
      const p = pointing.current;
      if (p && now < p.until) {
        const sx = x + b.w / 2, sy = b.y + b.h * 0.25;
        const dx = p.x - sx, dy = p.y - sy;
        const side: "L" | "R" = dx < 0 ? "L" : "R";
        // Angle away from straight down, toward the target.
        point = { side, up: Math.atan2(Math.abs(dx), dy) };
        facing.current = 1;
      } else pointing.current = null;
      stepActor(actor.current, dt, { mode, energy: smooth, walk, music: L.music, look: look.current ?? undefined, point });

      // Canvas: wider and taller than the box, feet on the box's bottom.
      // Never cap the scale: on a 250 % display a canvas drawn at 2× is
      // stretched to 2.5× by the browser, which is what makes the character
      // look soft when the screen is zoomed.
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      // Room above the head for raised arms, and to the sides for pointing.
      const W = Math.round(b.w * 2.4), H = Math.round(b.h * 1.5);
      if (c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)) {
        c.width = Math.round(W * dpr);
        c.height = Math.round(H * dpr);
        c.style.width = W + "px";
        c.style.height = H + "px";
      }
      const ctx = c.getContext("2d");
      if (!ctx) return;
      // The paintings are 300 px tall, so a zoomed-in character is always
      // scaled up. High-quality filtering at least keeps the edges clean
      // instead of blocky.
      ctx.imageSmoothingQuality = "high";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const feetX = W / 2, feetY = H - 6;
      // The pet: trots after it, sits when it stops, hops when it cheers.
      const im = petImg.current;
      if (im) {
        const ps = petState.current;
        const want = -facing.current * b.w * 0.55;
        ps.vx += ((want - ps.x) * 14 - ps.vx * 6) * dt;
        ps.x += ps.vx * dt;
        const moving = Math.abs(ps.vx) > 8 || walk > 0.05;
        // A hop when its human cheers (once per cheer), and now and then to music.
        const cheering = actor.current.reaction === "cheer" || actor.current.reaction === "tada";
        if ((cheering && !ps.cheered) || (L.music && ps.hop === 0 && Math.random() < 0.02)) ps.hop = 1;
        ps.cheered = cheering;
        ps.hop = Math.max(0, ps.hop - dt * 2.2);
        // Facing where it's going, or (standing) toward its human.
        const petFacing = walk > 0.05 ? facing.current : Math.abs(ps.vx) > 8 ? Math.sign(ps.vx) : ps.x < 0 ? 1 : -1;
        drawPet(ctx, im, { x: feetX + ps.x, y: feetY, height: b.h * 0.2, facing: petFacing, t: actor.current.t, moving, hop: ps.hop });
      }
      const pack = moves.current;
      if (pack) {
        // Real frames: pick the move for this moment.
        const r = actor.current.reaction;
        const want =
          walk > 0.05 ? "walk"
          : point ? "point"
          : r === "wave" || r === "bye" ? "wave"
          : r === "thumbs" ? "thumbs"
          : r === "cheer" || r === "tada" || r === "clap" ? "cheer"
          : r === "shrug" ? "shrug"
          : mode === "speaking" ? (talkingNow ? "talk" : "idle")
          : mode === "thinking" ? "think"
          : mode === "working" ? "type"
          : "idle";
        stepMover(mover.current, dt, want);
        // Walking faces where it goes; pointing faces the target (its frame points right).
        const face = want === "walk" ? facing.current : want === "point" && point ? (point.side === "R" ? 1 : -1) : 1;
        drawMover(ctx, pack, mover.current, { x: feetX, y: feetY, height: b.h * 0.94, facing: face, retro: live.current.retro, mouth: want === "talk" ? Math.min(1, mouth * 1.6) : 0, blink: want === "walk" ? 0 : blink });
      } else {
        drawPuppet(ctx, puppet.current, actor.current, { x: feetX, y: feetY, height: b.h * 0.94, facing: facing.current });
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [setBox]);

  return <canvas ref={canvas} className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2" />;
}
