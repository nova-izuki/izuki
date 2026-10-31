import { requestStyleSection } from "../lib/styleNav";
import { useEffect, useRef, useState } from "react";
import { useIzuki, type TabId } from "../lib/store";
import { revealSection } from "../lib/sections";

/** Scroll a section to just below the sticky jump bar. */
export function jumpTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  revealSection(el);
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
  const topRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  /** Scrolled past the top: the bar is following you down the page. */
  const [stuck, setStuck] = useState(false);
  /** It needs more than one row for every part. */
  const [wraps, setWraps] = useState(false);
  /** Opened to show every part while it follows you. */
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const top = topRef.current;
    if (!top) return;
    const root = top.closest("main");
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), { root, threshold: 0 });
    io.observe(top);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    // One row of pills is about 30 px; more means it wrapped. (Measured with
    // every part showing, so a folded bar still knows it has more.)
    const fit = () => setWraps(nav.scrollHeight > 44);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(nav);
    return () => ro.disconnect();
  }, [jumps.length]);
  // Following you down, it keeps to one row — three rows of chips covered the
  // page you'd scrolled to. "All ▾" shows every part again.
  const folded = stuck && wraps && !open;
  // A jump into another tab: open it, then scroll once it's drawn.
  const go = (j: { id: string; tab?: TabId }) => {
    if (open) {
      // Fold first, then land below the one-row bar.
      setOpen(false);
      if (!j.tab) return void requestAnimationFrame(() => jumpTo(j.id));
    }
    if (!j.tab) return jumpTo(j.id);
    setTab(j.tab);
    requestStyleSection(j.id);
    let tries = 0;
    const look = () => { if (document.getElementById(j.id)) jumpTo(j.id); else if (tries++ < 20) setTimeout(look, 60); };
    setTimeout(look, 60);
  };
  return (
    <>
      <div ref={topRef} id={topId} className="h-0" aria-hidden />
      {/* Follows you down the page, so any part is always one tap away. It
          wraps rather than scrolling sideways: a mouse wheel can't scroll
          sideways, so the last parts were out of reach. */}
      <nav
        ref={navRef}
        // Folded: tabbing onto a hidden chip opens the bar, so focus is never out of sight.
        onFocus={() => folded && setOpen(true)}
        aria-label="Jump to"
        style={{ top: below - 16 }}
        className={`izk-no-drag izk-jumpbar sticky z-20 -mx-1 flex flex-wrap gap-1 rounded-[14px] px-1 py-1 ${folded ? "max-h-[34px] overflow-hidden pr-[64px]" : ""}`}
      >
        {jumps.map((j) => (
          <button key={j.id} type="button" onClick={() => go(j)} className="izk-pill izk-no-drag shrink-0 px-2.5 py-1 text-[10.5px]">
            {j.label}
          </button>
        ))}
        {stuck && wraps && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            // (Inline: .izk-pill's own `position: relative` outranks a class.)
            style={folded ? { position: "absolute", right: 4, top: 4 } : undefined}
            className="izk-pill izk-no-drag shrink-0 px-2.5 py-1 text-[10.5px] font-semibold"
          >
            {open ? "Less ▴" : "All ▾"}
          </button>
        )}
      </nav>
    </>
  );
}
