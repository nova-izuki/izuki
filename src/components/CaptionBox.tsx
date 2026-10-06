import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { Check, Copy, GripHorizontal, Trash2, X } from "lucide-react";
import { resizeHandles, useFloating, workArea, type Limits } from "../lib/floating";
import type { CaptionPayload } from "../lib/types";
import { EV, on } from "../lib/ipc";
import { useBackdropTone } from "../lib/tone";

const LIMITS: Limits = { minW: 180, minH: 64, maxW: 720, maxH: 480 };
const HANDLES = resizeHandles();

/** ~2.7 words a second — roughly where Windows' voices speak at rate 1.0. */
const SPOKEN_MS_PER_WORD = 370;
const SILENT_MS_PER_WORD = 45;
const LINGER_MS = 4000;

/**
 * The live caption — Izuki's words appearing as it says them, in a small
 * squircle you can drag anywhere and resize from any edge. Remembers where
 * you left it. When voice is on the words keep pace with the speech; when
 * it's off they just stream in quickly.
 */
export function CaptionBox({
  caption,
  onDone,
  onClear,
  stay = false,
  past = [],
}: {
  caption: CaptionPayload & { id: number };
  onDone: () => void;
  /** Clear every kept answer and close. */
  onClear?: () => void;
  /** Keep the answer up once it's said (setting), until × or a new one. */
  stay?: boolean;
  /** Earlier answers (kept answers only), oldest first — scroll up to read them. */
  past?: string[];
}) {
  const stayRef = useRef(stay);
  stayRef.current = stay;
  const [copied, setCopied] = useState(false);
  const { box, begin } = useFloating(
    "izk.caption",
    () => {
      const wa = workArea();
      return { x: wa.left + 24, y: wa.bottom - 20 - 120, w: 300, h: 120 };
    },
    LIMITS
  );

  const words = useMemo(() => caption.text.split(/\s+/).filter(Boolean), [caption.text]);
  const [shown, setShown] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    setShown(0);
    // The voice's real pace when it's known (measured from its first audio),
    // so the words keep step with it instead of racing ahead or lagging.
    const step = caption.paced ? (caption.msPerWord ?? SPOKEN_MS_PER_WORD) : SILENT_MS_PER_WORD;
    let i = 0;
    let linger: ReturnType<typeof setTimeout> | null = null;
    const finish = () => {
      clearInterval(tick);
      if (!linger && !stayRef.current) linger = setTimeout(() => doneRef.current(), LINGER_MS);
    };
    const tick = setInterval(() => {
      i++;
      setShown(i);
      if (i >= words.length) finish();
    }, step);
    // The voice finished: every word is on screen by then, never left behind.
    let wasSpeaking = false;
    const off = caption.paced
      ? on<boolean>(EV.speaking, (talking) => {
          if (talking) wasSpeaking = true;
          else if (wasSpeaking && i < words.length) {
            i = words.length;
            setShown(i);
            finish();
          }
        })
      : null;
    return () => {
      clearInterval(tick);
      if (linger) clearTimeout(linger);
      void off?.then((f) => f());
    };
  }, [caption.id, caption.paced, caption.msPerWord, words.length]);

  // Follow the words as they come — unless you've scrolled up to read an
  // earlier answer, then it stays where you are.
  const pinnedToEnd = useRef(true);
  useEffect(() => {
    const el = scroller.current;
    if (el && pinnedToEnd.current) el.scrollTop = el.scrollHeight;
  }, [shown, past.length]);

  // Readable over whatever is behind it — or the look picked in Settings.
  const card = useRef<HTMLDivElement>(null);
  const look = useBackdropTone(card);

  return (
    <motion.div
      data-izk-hit
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-auto fixed z-40"
      style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
    >
      <div
        ref={card}
        className={`izk-card izk-grain relative flex h-full w-full flex-col overflow-hidden rounded-[22px] shadow-[0_18px_44px_rgba(0,0,0,0.5)] ${look.className}`}
        style={look.style}
      >
        <div
          onPointerDown={(e) => begin(e, "move")}
          className="flex shrink-0 cursor-grab items-center gap-1.5 px-3 pt-2 active:cursor-grabbing"
        >
          <span className="relative flex h-[7px] w-[7px]">
            <span className="izk-breathe absolute inset-0 rounded-full bg-izk-teal" />
          </span>
          <span className="text-[10px] font-semibold tracking-[0.12em] text-izk-muted">IZUKI</span>
          <GripHorizontal size={12} className="ml-auto text-izk-muted/60" />
          {stay && past.length > 0 && onClear && (
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onClear}
              aria-label="Clear all answers"
              title="Clear all"
              className="flex h-[18px] w-[18px] items-center justify-center rounded-full text-izk-muted transition-colors hover:bg-white/10 hover:text-izk-danger"
            >
              <Trash2 size={11} strokeWidth={2.4} />
            </button>
          )}
          {stay && shown >= words.length && (
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => {
                void navigator.clipboard?.writeText(caption.text).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1400);
                });
              }}
              aria-label="Copy the answer"
              title="Copy"
              className="flex h-[18px] w-[18px] items-center justify-center rounded-full text-izk-muted transition-colors hover:bg-white/10 hover:text-izk-ink"
            >
              {copied ? <Check size={11} strokeWidth={2.6} /> : <Copy size={11} strokeWidth={2.4} />}
            </button>
          )}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onDone}
            aria-label="Hide caption"
            className="flex h-[18px] w-[18px] items-center justify-center rounded-full text-izk-muted transition-colors hover:bg-white/10 hover:text-izk-ink"
          >
            <X size={11} strokeWidth={2.6} />
          </button>
        </div>
        <div
          ref={scroller}
          // Kept answers scroll and can be selected; a live caption drags.
          onPointerDown={stay ? undefined : (e) => begin(e, "move")}
          onScroll={(e) => {
            const el = e.currentTarget;
            pinnedToEnd.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
          }}
          className={`izk-tone-text min-h-0 flex-1 overflow-y-auto px-3.5 pb-3 pt-1.5 text-[13px] leading-relaxed text-izk-ink ${
            stay ? "select-text" : "cursor-grab active:cursor-grabbing"
          }`}
        >
          {past.map((p, i) => (
            <div key={i} className="mb-2 border-b border-white/8 pb-2 opacity-60">
              {p}
            </div>
          ))}
          {words.slice(0, shown).join(" ")}
          {shown < words.length && (
            <span className="izk-breathe ml-0.5 inline-block h-[12px] w-[2px] translate-y-[2px] bg-izk-teal" />
          )}
        </div>
      </div>
      {HANDLES.map((h) => (
        <div key={h.edge} style={h.style} onPointerDown={(e) => begin(e, h.edge)} />
      ))}
    </motion.div>
  );
}
