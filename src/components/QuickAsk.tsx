import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Loader2, Mic, Send, Trash2, X } from "lucide-react";
import { VoiceOrb } from "./VoiceOrb";
import { cx } from "./ui";
import { useBackdropTone } from "../lib/tone";

export const QUICK_ASK_WIDTH = 400;

/**
 * The oval chat that pops up beside a Ctrl+D mark once you let go of the
 * keys: the mark stays on screen while you type what you want done with it
 * — or tap the mic and just say it (the button turns into a live waveform
 * while it listens). Enter sends; the bin clears the mark to draw again;
 * Esc or × cancels.
 */
export function QuickAsk({
  x,
  y,
  prompt,
  setPrompt,
  onSend,
  onClear,
  onCancel,
  listening,
  transcribing,
  onMic,
  busy,
}: {
  x: number;
  y: number;
  prompt: string;
  setPrompt: (v: string) => void;
  onSend: () => void;
  onClear: () => void;
  onCancel: () => void;
  listening: boolean;
  transcribing: boolean;
  onMic: () => void;
  busy: boolean;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Readable over whatever is behind it — or the look picked in Settings.
  const card = useRef<HTMLDivElement>(null);
  const look = useBackdropTone(card);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 40);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className="fixed z-50"
      style={{ left: x, top: y, width: QUICK_ASK_WIDTH, cursor: "default" }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        ref={card}
        className={`izk-card izk-grain flex items-center gap-1.5 rounded-full p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.55)] ${look.className}`}
        style={look.style}
      >
        <button
          type="button"
          onClick={onMic}
          disabled={busy || transcribing}
          aria-label={listening ? "Done talking" : "Speak instead"}
          title={listening ? "Done talking" : "Speak instead"}
          className={cx(
            "flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full border transition-colors",
            listening ? "border-izk-teal/40 bg-izk-teal/12" : "border-white/10 bg-white/6 hover:bg-white/10"
          )}
        >
          {listening ? (
            <VoiceOrb size={30} mic />
          ) : transcribing ? (
            <Loader2 size={15} className="animate-spin text-izk-muted" />
          ) : (
            <Mic size={15} strokeWidth={2.3} className="text-izk-ink" />
          )}
        </button>
        <textarea
          ref={inputRef}
          value={prompt}
          rows={1}
          readOnly={listening || transcribing}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              // Nothing typed is fine — Izuki looks at the mark and responds.
              onSend();
            }
            if (e.key === "Escape") onCancel();
          }}
          placeholder={
            listening ? "Listening… tap the waveform when done" : transcribing ? "Working out what you said…" : "Ask about it — or just press Enter"
          }
          className="izk-tone-text h-[36px] min-w-0 flex-1 resize-none bg-transparent px-1 py-[9px] text-[13px] leading-snug text-izk-ink outline-none placeholder:text-izk-muted/60"
        />
        <button
          type="button"
          onClick={onClear}
          disabled={busy}
          aria-label="Clear the mark"
          title="Clear the mark and draw again"
          className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full text-izk-muted transition-colors hover:bg-white/8 hover:text-izk-danger"
        >
          <Trash2 size={14} strokeWidth={2.3} />
        </button>
        <button
          type="button"
          onClick={onSend}
          disabled={busy}
          aria-label="Send"
          className="izk-btn-primary flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full disabled:opacity-40"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} strokeWidth={2.6} />}
        </button>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          title="Cancel (Esc)"
          className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-izk-muted hover:text-izk-ink"
        >
          <X size={13} strokeWidth={2.4} />
        </button>
      </div>
    </motion.div>
  );
}
