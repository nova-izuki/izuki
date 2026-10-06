import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useIzuki, type TabId } from "../lib/store";

/** Scroll a section to just below the sticky jump bar. */
export function jumpTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  let box = el.parentElement;
  while (box && !(box.scrollHeight > box.clientHeight && /auto|scroll/.test(getComputedStyle(box).overflowY))) box = box.parentElement;
  if (!box) return el.scrollIntoView({ behavior: "smooth", block: "start" });
  const top = el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - 52;
  box.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

/**
 * The quick-jump bar at the top of a long tab: every part of it one tap away,
 * and "Top" once you've scrolled down. Each tab passes its own sections.
 */
export function JumpBar({ jumps, topId }: { jumps: { label: string; id: string; tab?: TabId }[]; topId: string }) {
  const setTab = useIzuki((s) => s.setTab);
  // A jump into another tab: open it, then scroll once it's drawn.
  const go = (j: { id: string; tab?: TabId }) => {
    if (!j.tab) return jumpTo(j.id);
    setTab(j.tab);
    let tries = 0;
    const look = () => { if (document.getElementById(j.id)) jumpTo(j.id); else if (tries++ < 20) setTimeout(look, 60); };
    setTimeout(look, 60);
  };
  const topRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const el = topRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <>
      <div ref={topRef} id={topId} className="h-0" aria-hidden />
      <nav aria-label="Jump to" className="izk-no-drag sticky top-0 z-20 -mx-1 flex gap-1 overflow-x-auto rounded-[14px] bg-izk-base/85 px-1 py-1.5 backdrop-blur-md [scrollbar-width:none]">
        {scrolled && (
          <button type="button" onClick={() => jumpTo(topId)} aria-label="Back to the top" title="Back to the top" className="izk-btn-primary izk-no-drag flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px]">
            <ArrowUp size={11} strokeWidth={2.6} /> Top
          </button>
        )}
        {jumps.map((j) => (
          <button key={j.id} type="button" onClick={() => go(j)} className="izk-pill izk-no-drag shrink-0 px-2.5 py-1 text-[10.5px]">
            {j.label}
          </button>
        ))}
      </nav>
    </>
  );
}
