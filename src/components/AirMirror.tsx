import { useEffect, useRef, useState } from "react";
import { emit, EV } from "../lib/ipc";

type Pt = { x: number; y: number; z: number };

/** The lines between the hand's 21 points (MediaPipe's hand model). */
export const HAND_BONES = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]];

/** How close to the camera's edge counts as "about to leave" (fraction of the picture). */
const EDGE = 0.07;
const SIZES = [200, 260, 340];
const POS_KEY = "izuki.air.mirror";

type Side = "left" | "right" | "top" | "bottom";

/**
 * Which edges of the (mirrored) camera picture the hand is touching. The
 * camera's x runs the other way from what you see in a mirror.
 */
export function nearEdges(lm: Pt[], margin = EDGE): Side[] {
  let minX = 1, maxX = 0, minY = 1, maxY = 0;
  for (const p of lm) {
    const x = 1 - p.x; // as seen in the mirror
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  const out: Side[] = [];
  if (minX < margin) out.push("left");
  if (maxX > 1 - margin) out.push("right");
  if (minY < margin) out.push("top");
  if (maxY > 1 - margin) out.push("bottom");
  return out;
}

const WAY_BACK: Record<Side, string> = { left: "→ move it right", right: "← move it left", top: "↓ move it down", bottom: "↑ move it up" };

function loadPos() {
  try {
    const p = JSON.parse(localStorage.getItem(POS_KEY) || "null");
    if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) {
      const size = Math.min(2, Math.max(0, p.size ?? 1));
      return { x: Math.max(0, Math.min(window.innerWidth - SIZES[size], p.x)), y: Math.max(0, Math.min(window.innerHeight - 180, p.y)), size };
    }
  } catch {
    /* default spot */
  }
  return { x: Math.round(window.innerWidth - 300), y: Math.round(window.innerHeight - 290), size: 1 };
}

/**
 * Air control's camera window (Settings → Air control → "Show the camera"):
 * you and your hand as the camera sees them, mirrored, with the tracked hand
 * drawn on, a frame showing where to keep it, and a warning — on the edge it's
 * about to leave — before it goes out of view (and which way to bring it back
 * once it has). Drag it by its top bar; S/M/L sizes it; × closes it.
 */
export function AirMirror({
  video,
  live,
}: {
  video: React.RefObject<HTMLVideoElement | null>;
  live: React.MutableRefObject<{ lm: Pt[] | null; snap: HTMLCanvasElement | null; hand: boolean }>;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [pos, setPos] = useState(loadPos);
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const [note, setNote] = useState("");
  useEffect(() => {
    try {
      localStorage.setItem(POS_KEY, JSON.stringify(pos));
    } catch {
      /* not remembered */
    }
  }, [pos]);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    let lastSides: Side[] = [];
    let lostAt = 0;
    let said = "";
    const say = (t: string) => {
      if (t !== said) {
        said = t;
        setNote(t);
      }
    };
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      // 20 pictures a second is smooth enough for a small window.
      if (now - last < 50) return;
      last = now;
      const c = canvas.current;
      const v = video.current;
      const g = c?.getContext("2d");
      if (!c || !g) return;
      const W = c.width, H = c.height;
      const snap = live.current.snap;
      if (snap) g.drawImage(snap, 0, 0, W, H);
      else if (v && v.readyState >= 2) {
        g.save();
        g.translate(W, 0);
        g.scale(-1, 1);
        g.drawImage(v, 0, 0, W, H);
        g.restore();
      } else {
        g.fillStyle = "#0b0d14";
        g.fillRect(0, 0, W, H);
      }
      // Where to keep your hand.
      g.save();
      g.setLineDash([6, 5]);
      g.strokeStyle = "rgba(255,255,255,0.35)";
      g.lineWidth = 1.5;
      g.strokeRect(W * EDGE, H * EDGE, W * (1 - 2 * EDGE), H * (1 - 2 * EDGE));
      g.restore();
      const lm = live.current.lm;
      if (lm) {
        lostAt = 0;
        const P = (p: Pt) => [W - p.x * W, p.y * H] as const;
        g.strokeStyle = "rgba(94,231,255,0.95)";
        g.lineWidth = 2.5;
        for (const [a, b] of HAND_BONES) {
          const [x1, y1] = P(lm[a]);
          const [x2, y2] = P(lm[b]);
          g.beginPath();
          g.moveTo(x1, y1);
          g.lineTo(x2, y2);
          g.stroke();
        }
        g.fillStyle = "#ff5caa";
        for (const p of lm) {
          const [x, y] = P(p);
          g.beginPath();
          g.arc(x, y, 2.6, 0, Math.PI * 2);
          g.fill();
        }
        // The pointer finger, ringed: that's what moves the mouse.
        const [ix, iy] = P(lm[8]);
        g.beginPath();
        g.arc(ix, iy, 7, 0, Math.PI * 2);
        g.strokeStyle = "#fff";
        g.lineWidth = 2;
        g.stroke();
        const sides = nearEdges(lm);
        lastSides = sides;
        for (const s of sides) {
          const grad =
            s === "left" ? g.createLinearGradient(0, 0, W * 0.18, 0)
            : s === "right" ? g.createLinearGradient(W, 0, W * 0.82, 0)
            : s === "top" ? g.createLinearGradient(0, 0, 0, H * 0.18)
            : g.createLinearGradient(0, H, 0, H * 0.82);
          grad.addColorStop(0, "rgba(255,70,90,0.75)");
          grad.addColorStop(1, "rgba(255,70,90,0)");
          g.fillStyle = grad;
          g.fillRect(0, 0, W, H);
        }
        say(sides.length ? `Near the ${sides.join(" & ")} edge — ${sides.map((s) => WAY_BACK[s]).join(", ")}` : "");
      } else {
        lostAt ||= now;
        // It just left (it was at an edge): say where to bring it back.
        const away = now - lostAt;
        if (lastSides.length && away < 4000) say(`Hand out of view — ${lastSides.map((s) => WAY_BACK[s]).join(", ")}`);
        else say(live.current.hand ? "Hand out of view — hold it up in front of the camera" : "Show your hand to the camera");
        g.fillStyle = "rgba(0,0,0,0.25)";
        g.fillRect(0, 0, W, H);
      }
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [video, live]);

  const w = SIZES[pos.size] ?? 260;
  const h = Math.round((w * 3) / 4);
  const warn = note && !note.startsWith("Show");
  return (
    <div
      data-izk-hit
      className="fixed z-[72] overflow-hidden rounded-[14px] border border-white/15 bg-black/70 shadow-[0_12px_36px_rgba(0,0,0,0.5)]"
      style={{ left: pos.x, top: pos.y, width: w }}
    >
      <div
        className="flex cursor-grab items-center gap-1.5 bg-black/60 px-2 py-1 text-[11px] text-white/85 active:cursor-grabbing"
        onPointerDown={(e) => {
          drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          setPos((p) => ({ ...p, x: Math.max(0, Math.min(window.innerWidth - w, e.clientX - d.dx)), y: Math.max(0, Math.min(window.innerHeight - 60, e.clientY - d.dy)) }));
        }}
        onPointerUp={() => (drag.current = null)}
      >
        <span className={`h-2 w-2 rounded-full ${live.current.lm ? "bg-emerald-400" : "bg-white/30"}`} />
        <span className="font-semibold">Air camera</span>
        <span className="ml-auto flex gap-0.5">
          {["S", "M", "L"].map((l, i) => (
            <button
              key={l}
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setPos((p) => ({ ...p, size: i, x: Math.max(0, Math.min(window.innerWidth - SIZES[i], p.x)) }))}
              className={`h-[18px] w-[18px] rounded text-[10px] ${pos.size === i ? "bg-white/25 text-white" : "text-white/60 hover:bg-white/10"}`}
            >
              {l}
            </button>
          ))}
          <button
            type="button"
            title="Hide the camera"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => void emit(EV.patchSettings, { air_mirror: false })}
            className="ml-1 h-[18px] w-[18px] rounded text-[12px] leading-none text-white/70 hover:bg-white/15"
          >
            ×
          </button>
        </span>
      </div>
      <canvas ref={canvas} width={320} height={240} style={{ width: w, height: h, display: "block" }} />
      {note && (
        <div className={`px-2 py-1 text-[11px] font-medium ${warn ? "bg-rose-500/80 text-white" : "bg-black/60 text-white/80"}`}>{note}</div>
      )}
    </div>
  );
}
