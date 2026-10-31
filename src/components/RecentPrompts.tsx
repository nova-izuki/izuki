import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Clock, X } from "lucide-react";
import { clearPrompts, forgetPrompt, onRecentPrompts, recentPrompts } from "../lib/recentPrompts";
import { cx } from "./ui";

/**
 * The last things you typed, one tap away — a shelf that opens from the
 * composer instead of a text box that forgets.
 *
 * Hover it (or click it, or tab to it) and the last prompts stack above the
 * chat as ovals: click one and it lands in the box, ready to edit or send;
 * X forgets that one, Clear all empties the shelf. Moving away closes it,
 * after a short grace so crossing the gap between the button and the shelf
 * doesn't slam it shut. It never opens over a page by itself.
 */
export function RecentPrompts({ onPick, side = "right", positionKey = "" }: { onPick: (text: string) => void; side?: "right" | "left"; positionKey?: string }) {
  const [list, setList] = useState<string[]>(() => recentPrompts());
  const [open, setOpen] = useState(false);
  const closeAt = useRef<number | null>(null);
  const anchor = useRef<HTMLDivElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const returningFocus = useRef(false);
  const [position, setPosition] = useState<React.CSSProperties>({});

  useEffect(() => onRecentPrompts((next) => {
    setList(next);
    if (!next.length) setOpen(false);
  }), []);

  // The bar can be dragged to any screen edge. A portal keeps the shelf out
  // of the card's clipping/transform, and it opens into the available space.
  useLayoutEffect(() => {
    if (!open || !list.length) return;
    const place = () => {
      const r = anchor.current?.getBoundingClientRect();
      if (!r) return;
      const width = Math.min(330, window.innerWidth - 16);
      const above = r.top - 14, below = window.innerHeight - r.bottom - 14;
      const upwards = above >= Math.min(280, below);
      setPosition({
        position: "fixed", width,
        left: Math.max(8, Math.min(side === "right" ? r.right - width : r.left, window.innerWidth - width - 8)),
        ...(upwards ? { bottom: window.innerHeight - r.top + 6 } : { top: r.bottom + 6 }),
        maxHeight: Math.max(60, Math.min(280, upwards ? above : below)),
      });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, list.length, side, positionKey]);

  const stay = () => {
    if (closeAt.current) window.clearTimeout(closeAt.current);
    closeAt.current = null;
    setOpen(true);
  };
  const leave = () => {
    if (closeAt.current) window.clearTimeout(closeAt.current);
    closeAt.current = window.setTimeout(() => {
      closeAt.current = null;
      setOpen(false);
    }, 220);
  };
  useEffect(() => () => {
    if (closeAt.current) window.clearTimeout(closeAt.current);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
      returningFocus.current = true;
      anchor.current?.querySelector("button")?.focus();
      returningFocus.current = false;
    };
    const away = (e: PointerEvent) => {
      if (!anchor.current?.contains(e.target as Node) && !popup.current?.contains(e.target as Node)) setOpen(false);
    };
    // Capture phase: React handles the textarea's keydown at its root before
    // a bubbling window listener runs, so stopping it here was too late and
    // Escape closed the whole floating chat along with the shelf.
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("pointerdown", away);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("pointerdown", away);
    };
  }, [open]);

  if (!list.length) return null;

  return (
    <div
      ref={anchor}
      className="relative shrink-0"
      data-izk-hit
      onPointerEnter={stay}
      onPointerLeave={leave}
      onFocusCapture={() => { if (!returningFocus.current) stay(); }}
      onBlurCapture={(e) => {
        if (!anchor.current?.contains(e.relatedTarget as Node) && !popup.current?.contains(e.relatedTarget as Node)) leave();
      }}
      // The shelf lives in a portal at the end of <body>, so the browser's
      // Tab order skipped it: Tab from the clock went on to the next control
      // and the shelf closed before a keyboard user could reach it. Tab goes
      // into the shelf; off either end comes back to the clock (closed, after
      // the last one), so the next Tab carries on through the chat bar.
      // Keys from inside the portal still bubble here through React.
      onKeyDown={(e) => {
        if (e.key !== "Tab" || !open) return;
        const trigger = anchor.current?.querySelector("button");
        const items = Array.from(popup.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
        if (!trigger || !items.length) return;
        if (e.target === trigger && !e.shiftKey) {
          e.preventDefault();
          items[0].focus();
        } else if (e.target === items[0] && e.shiftKey) {
          e.preventDefault();
          trigger.focus();
        } else if (e.target === items[items.length - 1] && !e.shiftKey) {
          e.preventDefault();
          setOpen(false);
          returningFocus.current = true;
          trigger.focus();
          returningFocus.current = false;
        }
      }}
    >
      <button
        type="button"
        onClick={stay}
        aria-label="Recent prompts"
        aria-expanded={open}
        title="Recent prompts — click one to put it back in the box"
        className={cx(
          "izk-no-drag flex h-[34px] w-[26px] items-center justify-center rounded-full transition-colors duration-150",
          open ? "bg-white/12 text-izk-ink" : "text-izk-muted hover:bg-white/10 hover:text-izk-ink"
        )}
      >
        <Clock size={13} strokeWidth={2.4} />
      </button>

      {open && createPortal(
        <div
          ref={popup}
          data-izk-hit
          role="group"
          aria-label="Recent prompts"
          style={position}
          className="pointer-events-auto z-[100] flex flex-col gap-1 rounded-[18px] border border-white/15 bg-[#12141f]/97 p-1.5 text-white shadow-[0_18px_50px_rgba(0,0,0,0.6)]"
          onPointerEnter={stay}
          onPointerLeave={leave}
        >
          <div className="flex items-center justify-between px-1.5 pb-0.5 pt-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-white/55">Recent</span>
            <button
              type="button"
              onClick={() => clearPrompts()}
              className="rounded-full px-1.5 py-0.5 text-[10.5px] text-white/65 transition-colors hover:bg-white/10 hover:text-white"
            >
              Clear all
            </button>
          </div>
          <div className="flex min-h-0 max-h-[220px] flex-col gap-1 overflow-y-auto">
            {list.map((p) => (
              <div key={p} className="group flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    onPick(p);
                    setOpen(false);
                  }}
                  title={p}
                  className="min-w-0 flex-1 truncate rounded-full bg-white/[0.07] px-3 py-1.5 text-left text-[11.5px] leading-snug text-white/90 transition-colors hover:bg-white/[0.14] hover:text-white"
                >
                  {p}
                </button>
                <button
                  type="button"
                  onClick={() => forgetPrompt(p)}
                  aria-label={`Forget “${p.slice(0, 40)}”`}
                  title="Forget this one"
                  className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={12} strokeWidth={2.6} />
                </button>
              </div>
            ))}
          </div>
        </div>, document.body
      )}
    </div>
  );
}
