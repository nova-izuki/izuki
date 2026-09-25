import { AnimatePresence, motion } from "motion/react";
import {
  createSeed,
  sketchyArrowhead,
  sketchyEllipse,
  sketchyLine,
} from "../lib/sketchy";

export interface PointOut {
  id: string;
  kind: "circle" | "arrow";
  x: number;
  y: number;
  x2?: number;
  y2?: number;
  tone: string;
}

const toSvgPoints = (pts: number[]) => {
  let out = "";
  for (let i = 0; i < pts.length; i += 2) out += `${pts[i]},${pts[i + 1]} `;
  return out.trim();
};

/**
 * The hand-drawn circle or arrow Izuki leaves on screen for a moment before
 * it acts — the same "let me point at this first" gesture you'd get from
 * someone actually reaching across your desk, sketched in the same rough
 * ink as your own marks so it reads as one language.
 */
export function PointOutLayer({ items }: { items: PointOut[] }) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
      <AnimatePresence>
        {items.map((p) => {
          const seed = createSeed();
          const strokeWidth = 3.2;

          if (p.kind === "arrow" && p.x2 !== undefined && p.y2 !== undefined) {
            const shaft = sketchyLine(seed, p.x, p.y, p.x2, p.y2);
            const head = sketchyArrowhead(seed, p.x, p.y, p.x2, p.y2);
            return (
              <motion.g
                key={p.id}
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: 0.9, pathLength: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                stroke={p.tone}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="none"
                style={{ filter: `drop-shadow(0 0 6px ${p.tone}99)` }}
              >
                {[...shaft, ...head].map((seg, i) => (
                  <polyline key={i} points={toSvgPoints(seg)} />
                ))}
              </motion.g>
            );
          }

          const ring = sketchyEllipse(seed, p.x, p.y, 30, 24);
          return (
            <motion.polyline
              key={p.id}
              points={toSvgPoints(ring)}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 0.9, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              stroke={p.tone}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              style={{
                transformOrigin: `${p.x}px ${p.y}px`,
                filter: `drop-shadow(0 0 6px ${p.tone}99)`,
              }}
            />
          );
        })}
      </AnimatePresence>
    </svg>
  );
}
