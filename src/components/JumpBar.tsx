import { requestStyleSection } from "../lib/styleNav";
import { useRef } from "react";
import { useIzuki, type TabId } from "../lib/store";

/** Scroll a section to just below the sticky jump bar. */
export function jumpTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  let box = el.parentElement;
  while (box && !(box.scrollHeight > box.clientHeight && /auto|scroll/.test(getComputedStyle(box).overflowY))) box = box.parentElement;
  if (!box) return el.scrollIntoView({ behavior: "smooth", block: "start" });
  // The bar wraps onto a second row when a tab has many parts: land below that too.
  const bar = box.querySelector(".izk-jumpbar");
  const extra = bar ? Math.max(0, bar.getBoundingClientRect().height - 40) : 0;
  const margin = (parseFloat(getComputedStyle(el).scrollMarginTop) || 52) + extra;
  const top = el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - margin;
  box.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

/**
 * The quick-jump bar at the top of a long tab: every part of it one tap away,
 * and "Top" once you've scrolled down. Each tab passes its own sections.
 */
export function JumpBar({ jumps, topId, below = 0 }: { jumps: { label: string; id: string; tab?: TabId }[]; topId: string; below?: number }) {
  const setTab = useIzuki((s) => s.setTab);
  // A jump into another tab: open it, then scroll once it's drawn.
  const go = (j: { id: string; tab?: TabId }) => {
    if (!j.tab) return jumpTo(j.id);
    setTab(j.tab);
    requestStyleSection(j.id);
    let tries = 0;
    const look = () => { if (document.getElementById(j.id)) jumpTo(j.id); else if (tries++ < 20) setTimeout(look, 60); };
    setTimeout(look, 60);
  };
  const topRef = useRef<HTMLDivElement>(null);
  return (
    <>
      <div ref={topRef} id={topId} className="h-0" aria-hidden />
      {/* Follows you down the page, so any part is always one tap away. It
          wraps rather than scrolling sideways: a mouse wheel can't scroll
          sideways, so the last parts were out of reach. */}
      <nav aria-label="Jump to" style={{ top: below - 16 }} className="izk-no-drag izk-jumpbar sticky z-20 -mx-1 flex flex-wrap gap-1 rounded-[14px] px-1 py-1">
        {jumps.map((j) => (
          <button key={j.id} type="button" onClick={() => go(j)} className="izk-pill izk-no-drag shrink-0 px-2.5 py-1 text-[10.5px]">
            {j.label}
          </button>
        ))}
      </nav>
    </>
  );
}
