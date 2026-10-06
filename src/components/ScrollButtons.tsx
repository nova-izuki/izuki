import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

/**
 * Two small buttons that follow you down a long page: back to the top, and
 * straight to the bottom. They show only when they'd help.
 */
export function ScrollButtons({ tab }: { tab: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [up, setUp] = useState(false);
  const [down, setDown] = useState(false);
  const box = () => ref.current?.closest("main") ?? null;
  useEffect(() => {
    const el = box();
    if (!el) return;
    const look = () => {
      setUp(el.scrollTop > 240);
      setDown(el.scrollHeight - el.clientHeight - el.scrollTop > 240);
    };
    look();
    el.addEventListener("scroll", look, { passive: true });
    const ro = new ResizeObserver(look);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", look);
      ro.disconnect();
    };
  }, [tab]);
  const go = (where: "top" | "bottom") => {
    const el = box();
    if (el) el.scrollTo({ top: where === "top" ? 0 : el.scrollHeight, behavior: "smooth" });
  };
  const btn = "izk-no-drag pointer-events-auto flex h-[30px] items-center gap-1 rounded-full px-2.5 text-[10.5px] shadow-[0_6px_18px_rgba(0,0,0,0.35)] backdrop-blur-md transition-opacity";
  return (
    <div ref={ref} className="pointer-events-none sticky bottom-0 z-30 -mb-[16px] flex justify-end gap-1.5 pb-1">
      {up && (
        <button type="button" onClick={() => go("top")} aria-label="Back to the top" title="Back to the top" className={`${btn} izk-btn-primary`}>
          <ArrowUp size={12} strokeWidth={2.6} /> Top
        </button>
      )}
      {down && (
        <button type="button" onClick={() => go("bottom")} aria-label="To the bottom" title="To the bottom" className={`${btn} izk-pill`}>
          <ArrowDown size={12} strokeWidth={2.6} /> Bottom
        </button>
      )}
    </div>
  );
}
