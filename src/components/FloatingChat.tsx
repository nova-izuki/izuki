import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { api, EV, on } from "../lib/ipc";
import { markHit } from "../lib/hitTest";
import { resizeHandles, useFloating, workArea, type Limits } from "../lib/floating";
import { sendChatCommand } from "./VoiceEngine";
import { HandGlyph } from "./IzukiMark";
import { cx } from "./ui";
import { useBackdropTone } from "../lib/tone";
import { ChatColorPicker } from "./ChatColorPicker";

const BUBBLE = 46;
const BUBBLE_LIMITS: Limits = { minW: BUBBLE, minH: BUBBLE, maxW: BUBBLE, maxH: BUBBLE };
const PILL_LIMITS: Limits = { minW: 220, minH: 46, maxW: 900, maxH: 360 };
const HANDLES = resizeHandles();

/**
 * Follow mode's chat — for when you'd rather type than talk.
 *
 * A small round bubble you can drag anywhere. Click it and the oval chat
 * opens beside it; click it again and it closes. The oval itself can be
 * dragged by its hand grip and resized from any edge — pull it tall and it
 * becomes a multi-line box. Both remember where you left them.
 *
 * The overlay window is click-through at the OS level, so none of this is
 * clickable by CSS alone — every element here is marked `data-izk-hit`,
 * and the overlay's hit-tester (lib/hitTest) makes the window clickable only
 * while the cursor is over one of them. Nothing here ever makes the whole
 * screen block clicks.
 */
/** Whether the chat pill was open — kept outside the component, which
 * unmounts whenever the overlay closes. */
let chatWasOpen = false;

export function FloatingChat() {
  // Survives the overlay closing and reopening around a screen action —
  // sending a message used to leave the chat shut afterwards.
  const [open, setOpenState] = useState(chatWasOpen);
  const setOpen = (v: boolean | ((o: boolean) => boolean)) =>
    setOpenState((o) => {
      const next = typeof v === "function" ? v(o) : v;
      chatWasOpen = next;
      return next;
    });
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const bubble = useFloating(
    "izk.chat.bubble",
    () => {
      const wa = workArea();
      return { x: wa.right - BUBBLE - 24, y: wa.bottom - BUBBLE - 20, w: BUBBLE, h: BUBBLE };
    },
    BUBBLE_LIMITS
  );
  const pill = useFloating(
    "izk.chat.pill",
    () => {
      const wa = workArea();
      const w = 380;
      return { x: wa.right - BUBBLE - 24 - 12 - w, y: wa.bottom - 46 - 20, w, h: 46 };
    },
    PILL_LIMITS
  );

  const focusInput = () => setTimeout(() => inputRef.current?.focus(), 40);

  const toggle = () => {
    setOpen((o) => {
      if (!o) focusInput();
      return !o;
    });
  };

  // Lost it off-screen or behind something? Settings (or "reset chat") puts
  // both pieces back where they start.
  const resetBubble = bubble.reset;
  const resetPill = pill.reset;
  useEffect(() => {
    const off = on<void>(EV.resetFloating, () => {
      resetBubble();
      resetPill();
    });
    return () => void off.then((f) => f());
  }, [resetBubble, resetPill]);

  // "Hey Izuki, chat" — no click happened, so nothing gave this window
  // keyboard focus. Take it once; the hit-tester returns the window to
  // click-through the moment the cursor moves off the chat.
  useEffect(() => {
    const off = on<void>(EV.openFloatingChat, () => {
      setOpen(true);
      void api.setOverlayInteractive(true).then(() => {
        markHit();
        focusInput();
      });
    });
    return () => void off.then((f) => f());
  }, []);

  const submit = async () => {
    const t = text.trim();
    if (!t || busy) return;
    setText("");
    setBusy(true);
    try {
      await sendChatCommand(t);
    } finally {
      setBusy(false);
      focusInput();
    }
  };

  const tall = pill.box.h > 60;
  // Readable over whatever is behind it — or the look picked in Settings.
  const card = useRef<HTMLDivElement>(null);
  const look = useBackdropTone(card, open);
  const bubbleRef = useRef<HTMLButtonElement>(null);
  const bubbleLook = useBackdropTone(bubbleRef);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="pill"
            data-izk-hit
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto fixed z-50"
            style={{
              left: pill.box.x,
              top: pill.box.y,
              width: pill.box.w,
              height: pill.box.h,
              transformOrigin: "right center",
            }}
          >
            <div
              ref={card}
              className={cx(
                "izk-card izk-grain flex h-full w-full gap-1.5 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.55)]",
                tall ? "items-end rounded-[24px]" : "items-center rounded-full",
                look.className
              )}
              style={look.style}
            >
              <div
                onPointerDown={(e) => pill.begin(e, "move")}
                title="Drag to move"
                className="flex h-[34px] w-[34px] shrink-0 cursor-grab items-center justify-center rounded-full border border-white/10 bg-white/6 active:cursor-grabbing"
              >
                <HandGlyph size={16} sparkle={false} />
              </div>
              <ChatColorPicker />
              <textarea
                ref={inputRef}
                value={text}
                rows={1}
                onChange={(e) => {
                  setText(e.target.value);
                  // Reading the screen takes a second — start while you type.
                  api.prefetchWhileTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void submit();
                  }
                  if (e.key === "Escape") setOpen(false);
                }}
                placeholder="Tell Izuki what to do…"
                className={cx(
                  "izk-tone-text min-w-0 flex-1 resize-none bg-transparent px-1 text-[13px] leading-snug text-izk-ink outline-none placeholder:text-izk-muted/55",
                  tall ? "h-full py-2" : "h-[34px] py-[8px]"
                )}
              />
              <button
                type="button"
                onClick={() => void submit()}
                disabled={busy || !text.trim()}
                aria-label="Send"
                className="izk-btn-primary flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full disabled:opacity-40"
              >
                {busy ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} strokeWidth={2.6} />
                )}
              </button>
            </div>
            {HANDLES.map((h) => (
              <div key={h.edge} style={h.style} onPointerDown={(e) => pill.begin(e, h.edge)} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        ref={bubbleRef}
        type="button"
        data-izk-hit
        onPointerDown={(e) => bubble.begin(e, "move", toggle)}
        title={open ? "Close chat" : 'Chat — or say "Hey Izuki, chat". Drag to move.'}
        aria-label={open ? "Close chat" : "Open chat"}
        className={cx(
          "izk-card izk-grain pointer-events-auto fixed z-50 flex items-center justify-center rounded-full shadow-[0_16px_40px_rgba(0,0,0,0.5)] transition-colors duration-200",
          open ? "text-izk-ink" : "text-izk-muted hover:text-izk-ink",
          bubbleLook.className
        )}
        style={{
          ...bubbleLook.style,
          left: bubble.box.x,
          top: bubble.box.y,
          width: BUBBLE,
          height: BUBBLE,
          cursor: "pointer",
        }}
      >
        <MessageCircle size={19} strokeWidth={2} />
      </button>
    </>
  );
}
