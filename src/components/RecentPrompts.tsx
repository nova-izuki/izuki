import { useEffect, useRef, useState } from "react";
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
export function RecentPrompts({ onPick, side = "right" }: { onPick: (text: string) => void; side?: "right" | "left" }) {
  const [list, setList] = useState<string[]>(() => recentPrompts());
  const [open, setOpen] = useState(false);
  const closeAt = useRef<number | null>(null);

  useEffect(() => onRecentPrompts(setList), []);

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
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!list.length) return null;

  return (
    <div
      className="relative shrink-0"
      data-izk-hit
      onPointerEnter={stay}
      onPointerLeave={leave}
      onFocusCapture={stay}
      onBlurCapture={leave}
    >
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : stay())}
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

      {open && (
        <div
          data-izk-hit
          role="group"
          aria-label="Recent prompts"
          className={cx(
            "absolute bottom-full z-[60] mb-1.5 flex w-[min(330px,calc(100vw-28px))] flex-col gap-1 rounded-[18px] border border-white/15 bg-[#12141f]/97 p-1.5 text-white shadow-[0_18px_50px_rgba(0,0,0,0.6)]",
            side === "right" ? "right-0" : "left-0"
          )}
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
          <div className="flex max-h-[220px] flex-col gap-1 overflow-y-auto">
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
        </div>
      )}
    </div>
  );
}
