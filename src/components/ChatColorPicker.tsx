import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Palette, Plus } from "lucide-react";
import { setChatLook } from "../lib/tone";
import { api } from "../lib/ipc";
import type { Settings } from "../lib/types";
import { cx } from "./ui";

interface Swatch {
  label: string;
  style: Settings["chat_style"];
  color?: string;
  /** What the circle looks like. */
  paint: string;
}

/** Big, obvious choices — no colour theory needed. */
const SWATCHES: Swatch[] = [
  { label: "Auto — matches your screen", style: "auto", paint: "conic-gradient(#67e8f9, #a5b4fc, #f0abfc, #fde047, #86efac, #67e8f9)" },
  { label: "White", style: "dark", paint: "#ffffff" },
  { label: "Black", style: "light", paint: "#111111" },
  { label: "Sky blue", style: "custom", color: "#7dd3fc", paint: "#7dd3fc" },
  { label: "Pink", style: "custom", color: "#f9a8d4", paint: "#f9a8d4" },
  { label: "Yellow", style: "custom", color: "#fde047", paint: "#fde047" },
  { label: "Green", style: "custom", color: "#86efac", paint: "#86efac" },
  { label: "Gradient", style: "gradient", paint: "linear-gradient(135deg, #67e8f9, #a5b4fc, #f0abfc)" },
];

/**
 * The 🎨 button in the chat box: tap it, tap a colour, done — the chat,
 * Izuki's replies and your words all switch at once. "Auto" matches
 * whatever is on screen; "+" is any colour you like.
 */
export function ChatColorPicker() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string>("Auto — matches your screen");

  const choose = (s: Swatch) => {
    setPicked(s.label);
    setChatLook(s.style, s.color);
  };

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          // Show what's chosen now (this window has no settings of its own).
          void api.getSettings().then((s) => {
            const hit = SWATCHES.find(
              (w) => w.style === s.chat_style && (w.style !== "custom" || w.color?.toLowerCase() === s.chat_color?.toLowerCase())
            );
            setPicked(hit ? hit.label : s.chat_style === "custom" ? "Your colour" : SWATCHES[0].label);
          }).catch(() => undefined);
        }}
        aria-label="Text colour"
        title="Text colour"
        className={cx(
          "flex h-[34px] w-[34px] items-center justify-center rounded-full border transition-colors",
          open ? "border-izk-teal/50 bg-izk-teal/15 text-izk-teal" : "border-white/10 bg-white/6 text-izk-muted hover:text-izk-ink"
        )}
      >
        <Palette size={16} strokeWidth={2.2} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2.5 w-[268px] rounded-[18px] border border-white/12 bg-[rgba(12,14,28,0.94)] p-3 shadow-[0_18px_44px_rgba(0,0,0,0.5)]"
          >
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-[12.5px] font-semibold text-white">Text colour</span>
              <span className="max-w-[150px] truncate text-[11px] text-white/60">{picked}</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {SWATCHES.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  title={s.label}
                  aria-label={s.label}
                  onClick={() => choose(s)}
                  className={cx(
                    "h-[38px] w-[38px] rounded-full border-2 transition-transform hover:scale-110",
                    picked === s.label ? "border-white" : "border-white/20"
                  )}
                  style={{ background: s.paint }}
                />
              ))}
              {/* Any colour at all. */}
              <label
                title="Pick any colour"
                className={cx(
                  "relative flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full border-2 border-dashed text-white/80 transition-transform hover:scale-110",
                  picked === "Your colour" ? "border-white" : "border-white/35"
                )}
              >
                <Plus size={16} strokeWidth={2.6} />
                <input
                  type="color"
                  aria-label="Pick any colour"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={(e) => {
                    setPicked("Your colour");
                    setChatLook("custom", e.target.value);
                  }}
                />
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
