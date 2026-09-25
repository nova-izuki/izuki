import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Copy,
  Eye,
  Hand,
  Link2,
  MousePointerClick,
  Move,
  Type,
} from "lucide-react";
import type { Intent } from "../lib/types";

export interface RadialOption {
  intent: Intent | "chain";
  label: string;
  icon: React.ReactNode;
  tone: string;
}

const OPTIONS: RadialOption[] = [
  { intent: "click", label: "Click", icon: <MousePointerClick size={16} strokeWidth={2.4} />, tone: "#7C5CFF" },
  { intent: "type", label: "Type", icon: <Type size={16} strokeWidth={2.4} />, tone: "#4ECDC4" },
  { intent: "drag", label: "Drag", icon: <Move size={16} strokeWidth={2.4} />, tone: "#4ECDC4" },
  { intent: "watch", label: "Watch", icon: <Eye size={16} strokeWidth={2.4} />, tone: "#FF5F7A" },
  { intent: "copy", label: "Copy", icon: <Copy size={16} strokeWidth={2.4} />, tone: "#FFE66D" },
  { intent: "chain", label: "Chain", icon: <Link2 size={16} strokeWidth={2.4} />, tone: "#FFE66D" },
];

/**
 * The hand-sign menu. Opens where you right-clicked and flips itself to stay
 * on screen near the edges.
 */
export function RadialMenu({
  x,
  y,
  onPick,
  onClose,
}: {
  x: number;
  y: number;
  onPick: (intent: Intent | "chain") => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    window.addEventListener("keydown", onKey, true);
    // Defer so the right-click that opened the menu does not close it.
    const t = setTimeout(() => window.addEventListener("pointerdown", onDown, true), 0);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("pointerdown", onDown, true);
    };
  }, [onClose]);

  const W = 178;
  const H = 250;
  const left = Math.min(Math.max(8, x - 14), window.innerWidth - W - 8);
  const top = Math.min(Math.max(8, y - 14), window.innerHeight - H - 8);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.94, filter: "blur(6px)" }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="izk-card izk-grain pointer-events-auto fixed z-50 p-1.5"
      style={{ left, top, width: W, transformOrigin: "top left" }}
    >
      <div className="flex items-center gap-1.5 px-2 pb-1.5 pt-1">
        <Hand size={12} strokeWidth={2.6} className="text-izk-hand" />
        <span className="text-[10px] font-semibold tracking-[0.1em] text-izk-muted">
          HAND SIGN
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        {OPTIONS.map((o) => (
          <button
            key={o.intent}
            type="button"
            onClick={() => onPick(o.intent)}
            className="group flex items-center gap-2.5 rounded-[13px] px-2.5 py-[7px] text-left transition-colors duration-150 hover:bg-white/10"
          >
            <span
              className="flex h-[26px] w-[26px] items-center justify-center rounded-[9px] border transition-colors duration-150"
              style={{
                color: o.tone,
                borderColor: `${o.tone}40`,
                background: `${o.tone}18`,
              }}
            >
              {o.icon}
            </span>
            <span className="text-[12.5px] font-medium text-izk-ink">{o.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
