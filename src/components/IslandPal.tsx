import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { api, EV, on } from "../lib/ipc";
import { createActor, drawPuppet, loadPuppet, react, stepActor, type Actor, type Puppet } from "../../docs/app/puppet.js";
import { createMover, drawMover, loadMoves, stepMover, type MovesPack } from "../../docs/app/sprites.js";

/**
 * Your character reacting on the Island. When your companion is a character
 * (a "buddy:" style) and the Island has news, it pops up beside the pill for
 * a few seconds: it points at something that needs you (an OK to give, a
 * website down, an error, a reminder due now) and cheers when a task or your
 * missions finish. Then it's gone — never a resident on the desktop.
 *
 * Not while it's already on screen talking to you (the Buddy reacts there),
 * not in quiet hours, and off with Settings → Island → "Character reacts".
 * Battery: drawn only during those few seconds.
 */

export type PalCue = { kind: "point" | "cheer"; key: string };

const SHOW_MS = 4600;
const FIG_H = 92;
const CANVAS_W = 150;
const CANVAS_H = 112;

export function IslandPal({ cue, pill, away }: { cue: PalCue | null; pill: React.RefObject<HTMLDivElement | null>; away: boolean }) {
  const [id, setId] = useState<string | null>(null);
  const [shown, setShown] = useState<{ kind: PalCue["kind"]; left: number; top: number; side: "L" | "R"; target: { x: number; y: number } } | null>(null);

  useEffect(() => {
    let alive = true;
    const read = () =>
      void api
        .getSettings()
        .then((s) => {
          if (!alive) return;
          const style = s.orb_style ?? "";
          setId(s.island_reactions === true && style.startsWith("buddy:") ? style.slice(6) : null);
        })
        .catch(() => undefined);
    read();
    const off = on<void>(EV.settingsChanged, read);
    return () => {
      alive = false;
      void off.then((f) => f());
    };
  }, []);

  useEffect(() => {
    if (!cue || !id || away) return;
    const r = pill.current?.getBoundingClientRect();
    if (!r || r.width === 0) return;
    // Beside the pill, on whichever side has room; it points back at it.
    const right = r.right + CANVAS_W < window.innerWidth;
    const left = right ? r.right - 30 : r.left - CANVAS_W + 30;
    setShown({ kind: cue.kind, left, top: Math.max(0, r.top - 10), side: right ? "L" : "R", target: { x: right ? r.right - 12 : r.left + 12, y: r.top + r.height / 2 } });
    const t = setTimeout(() => setShown(null), SHOW_MS);
    return () => clearTimeout(t);
    // A new cue (its key) is what starts it; the rest is read at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cue?.key, id]);
  useEffect(() => {
    if (away) setShown(null);
  }, [away]);

  return (
    <AnimatePresence>
      {shown && id && (
        <motion.div
          key={`pal-${shown.kind}-${shown.left}`}
          initial={{ opacity: 0, y: -16, scale: 0.7 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
          className="pointer-events-none fixed z-[61]"
          style={{ left: shown.left, top: shown.top, width: CANVAS_W, height: CANVAS_H }}
        >
          <PalStage id={id} kind={shown.kind} side={shown.side} target={shown.target} origin={{ x: shown.left, y: shown.top }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PalStage({ id, kind, side, target, origin }: { id: string; kind: PalCue["kind"]; side: "L" | "R"; target: { x: number; y: number }; origin: { x: number; y: number } }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const actor = useRef<Actor>(createActor());
  const mover = useRef(createMover());
  const puppet = useRef<Puppet | null>(null);
  const moves = useRef<MovesPack | null>(null);

  useEffect(() => {
    let alive = true;
    void loadMoves(id).then((m) => {
      if (alive) moves.current = m;
    });
    void loadPuppet(id).then((p) => {
      if (alive) puppet.current = p;
    });
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    // Cheering: a little routine. Pointing: a wave to catch your eye first.
    const a = actor.current;
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (kind === "cheer") {
      react(a, "cheer");
      timers.push(setTimeout(() => react(a, "tada"), 1400));
      timers.push(setTimeout(() => react(a, "clap"), 3000));
    } else {
      react(a, "wave");
    }
    let raf = 0;
    let last = performance.now();
    const started = last;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const c = canvas.current;
      if (!c) return;
      // Pointing once the wave is done (about 1.2 s in).
      const pointing = kind === "point" && now - started > 1200;
      const feetX = CANVAS_W / 2;
      const feetY = CANVAS_H - 4;
      const sx = origin.x + feetX;
      const sy = origin.y + feetY - FIG_H * 0.75;
      const point = pointing ? { side, up: Math.atan2(Math.abs(target.x - sx), target.y - sy) } : null;
      stepActor(actor.current, dt, { mode: "idle", point });
      // Match the real display scale — a cap here softens the character on
      // any screen that's zoomed past it.
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      if (c.width !== Math.round(CANVAS_W * dpr)) {
        c.width = Math.round(CANVAS_W * dpr);
        c.height = Math.round(CANVAS_H * dpr);
        c.style.width = CANVAS_W + "px";
        c.style.height = CANVAS_H + "px";
      }
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.imageSmoothingQuality = "high";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      const pack = moves.current;
      if (pack) {
        const r = actor.current.reaction;
        const want = pointing ? "point" : r === "wave" ? "wave" : r === "cheer" || r === "tada" || r === "clap" ? "cheer" : "idle";
        stepMover(mover.current, dt, want);
        // Its frames point right: face the pill when pointing.
        const face = want === "point" ? (side === "R" ? 1 : -1) : 1;
        drawMover(ctx, pack, mover.current, { x: feetX, y: feetY, height: FIG_H, facing: face, shadow: false });
      } else if (puppet.current) {
        drawPuppet(ctx, puppet.current, actor.current, { x: feetX, y: feetY, height: FIG_H, facing: side === "R" ? 1 : -1, shadow: false });
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, [kind, side, target.x, target.y, origin.x, origin.y]);

  return <canvas ref={canvas} className="h-full w-full" />;
}
