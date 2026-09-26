import { useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { createSeed, sketchyArrowhead, sketchyEllipse, sketchyLine, sketchyRect } from "../lib/sketchy";

/**
 * Izuki's teaching pen — what it draws on the screen while it explains,
 * like a tutor sketching over a worksheet: circles and boxes round the
 * thing it's talking about, underlines under the words, arrows from one
 * idea to the next, and short handwritten notes (a working step, the
 * answer). Each stroke draws itself on, in order, and stays up while the
 * explanation is said; they're cleared when the conversation moves on.
 */
export interface PenMark {
  id: string;
  shape: "circle" | "box" | "underline" | "arrow" | "note";
  x: number;
  y: number;
  x2?: number;
  y2?: number;
  text?: string;
  tone: string;
}

/** The pen's inks, used in turn so neighbouring marks stay distinguishable. */
export const PEN_INKS = ["#FFD166", "#4ECDC4", "#FF7AA2", "#9B8CFF"];

const pts = (p: number[]) => {
  let out = "";
  for (let i = 0; i < p.length; i += 2) out += `${p[i].toFixed(1)},${p[i + 1].toFixed(1)} `;
  return out.trim();
};

function strokesFor(m: PenMark): number[][] {
  const seed = createSeed(Number.parseInt(m.id.replace(/\D/g, "").slice(-6) || "7", 10));
  const x2 = m.x2 ?? m.x;
  const y2 = m.y2 ?? m.y;
  switch (m.shape) {
    case "circle": {
      const hasBox = Math.abs(x2 - m.x) > 8 && Math.abs(y2 - m.y) > 8;
      const cx = hasBox ? (m.x + x2) / 2 : m.x;
      const cy = hasBox ? (m.y + y2) / 2 : m.y;
      const rx = hasBox ? Math.abs(x2 - m.x) / 2 + 14 : 34;
      const ry = hasBox ? Math.abs(y2 - m.y) / 2 + 12 : 26;
      return [sketchyEllipse(seed, cx, cy, rx, ry)];
    }
    case "box": {
      const left = Math.min(m.x, x2) - 8;
      const top = Math.min(m.y, y2) - 6;
      return sketchyRect(seed, left, top, Math.max(24, Math.abs(x2 - m.x) + 16), Math.max(20, Math.abs(y2 - m.y) + 12));
    }
    case "underline": {
      const endX = Math.abs(x2 - m.x) > 8 ? x2 : m.x + 140;
      const endY = Math.abs(x2 - m.x) > 8 ? y2 : m.y;
      return sketchyLine(seed, m.x, m.y + 4, endX, endY + 4, 2);
    }
    case "arrow": {
      if (Math.abs(x2 - m.x) + Math.abs(y2 - m.y) < 10) return [];
      return [...sketchyLine(seed, m.x, m.y, x2, y2), ...sketchyArrowhead(seed, m.x, m.y, x2, y2)];
    }
    default:
      return [];
  }
}

export function PenLayer({ marks }: { marks: PenMark[] }) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
      <AnimatePresence>
        {marks.map((m) => (
          <Mark key={m.id} m={m} />
        ))}
      </AnimatePresence>
    </svg>
  );
}

function Mark({ m }: { m: PenMark }) {
  const strokes = useMemo(() => strokesFor(m), [m]);
  const glow = { filter: `drop-shadow(0 0 5px ${m.tone}aa) drop-shadow(0 1px 2px rgba(0,0,0,0.6))` };

  if (m.shape === "note") {
    return (
      <motion.text
        x={m.x}
        y={m.y}
        initial={{ opacity: 0, y: m.y + 6 }}
        animate={{ opacity: 1, y: m.y }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        fill={m.tone}
        stroke="rgba(8,8,14,0.85)"
        strokeWidth={4}
        paintOrder="stroke"
        style={{ ...glow, fontFamily: '"Segoe Print", "Comic Sans MS", "Bradley Hand", cursive', fontSize: 24, fontWeight: 700 }}
      >
        {m.text}
      </motion.text>
    );
  }

  return (
    <motion.g exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={glow}>
      {strokes.map((s, i) => (
        <motion.polyline
          key={i}
          points={pts(s)}
          fill="none"
          stroke={m.tone}
          strokeWidth={3.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0.2 }}
          animate={{ pathLength: 1, opacity: 0.95 }}
          transition={{ duration: 0.55, delay: i * 0.12, ease: [0.45, 0, 0.2, 1] }}
        />
      ))}
    </motion.g>
  );
}
