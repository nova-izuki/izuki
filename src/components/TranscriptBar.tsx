import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";
import { workArea } from "../lib/floating";
import { useBackdropTone } from "../lib/tone";

/**
 * Your words as you speak them — proof Izuki is really hearing you, the
 * way voice assistants show what they caught. Rough while you talk,
 * corrected when you finish. Used on its own for push-to-talk; with the
 * voice sphere up, the sphere shows the same words under itself instead.
 */
export function TranscriptBar({ text, final }: { text: string | null; final: boolean }) {
  const wa = workArea();
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          key="transcript"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.18 }}
          className="pointer-events-none fixed left-1/2 z-40 -translate-x-1/2"
          style={{ top: wa.bottom - 86, maxWidth: "min(640px, 80vw)" }}
        >
          <TranscriptText text={text} final={final} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** The words themselves — shared with the sphere. */
export function TranscriptText({ text, final }: { text: string; final: boolean }) {
  // Readable over whatever is behind it — or the look picked in Settings.
  const card = useRef<HTMLDivElement>(null);
  const look = useBackdropTone(card);
  return (
    <div ref={card} className={`izk-transcript flex items-start gap-2 rounded-[18px] px-3.5 py-2 ${look.className}`} style={look.style}>
      <span className="relative mt-[5px] flex h-[8px] w-[8px] shrink-0">
        <span className={final ? "absolute inset-0 rounded-full bg-izk-teal" : "izk-breathe absolute inset-0 rounded-full bg-izk-hand"} />
      </span>
      <span
        className="izk-tone-text line-clamp-3 text-center text-[13.5px] font-medium leading-snug text-izk-ink"
        style={{ opacity: final ? 1 : 0.82 }}
      >
        {text}
      </span>
    </div>
  );
}
