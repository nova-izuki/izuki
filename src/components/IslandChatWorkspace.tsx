import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GripHorizontal, MessageSquare, PanelTop, X } from "lucide-react";
import { AskPage } from "./IslandChat";
import { resizeHandles, useFloating, workArea } from "../lib/floating";
import { api } from "../lib/ipc";
import { lockHit, unlockHit } from "../lib/hitTest";

const DETACHED_KEY = "izuki.island-chat-detached.v1";
const LIMITS = { minW: 300, minH: 280, maxW: 720, maxH: 900 };
/** One live chat, reparented between its dock and floating shell. Moving it
 * never remounts the conversation or cancels an in-flight answer. */
export function IslandChatWorkspace() {
  const [detached, setDetached] = useState(() => {
    try { return localStorage.getItem(DETACHED_KEY) === "1"; } catch { return false; }
  });
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState<string | null>(null);
  const [container] = useState(() => document.createElement("div"));
  const host = useRef<HTMLDivElement>(null);
  const lastPage = useRef<string | null>(null);
  const drag = useRef<{ x: number; y: number; detached: boolean } | null>(null);
  const floating = useFloating("izuki.island-chat.box", () => {
    const area = workArea();
    return { x: Math.max(0, area.right - 440), y: Math.max(0, area.bottom - 570), w: 400, h: 520 };
  }, LIMITS);
  const dock = () => { setDetached(false); setExpanded(false); };
  const detach = () => { setDetached(true); setExpanded(true); void api.showCaptionOverlay().catch(() => undefined); };
  const state = useRef({ detached, expanded });
  state.current = { detached, expanded };
  const [holding, setHolding] = useState(false);
  useEffect(() => {
    try { localStorage.setItem(DETACHED_KEY, detached ? "1" : "0"); } catch { /* optional persistence */ }
    window.dispatchEvent(new CustomEvent("izuki:island-chat-hold", { detail: !detached && holding }));
    window.dispatchEvent(new CustomEvent("izuki:island-chat-visible", { detail: detached }));
  }, [detached, holding]);

  useEffect(() => {
    const place = () => {
      const dockHost = document.getElementById("izuki-island-chat-dock");
      const target = state.current.detached ? (state.current.expanded ? host.current : null) : dockHost;
      if (dockHost) {
        const button = dockHost.querySelector("button");
        if (button && (button as HTMLElement).hidden !== !state.current.detached) (button as HTMLElement).hidden = !state.current.detached;
        const next = dockHost.dataset.page || null;
        if (lastPage.current !== next) { lastPage.current = next; setPage(next); }
      }
      if (target && container.parentElement !== target) target.appendChild(container);
      else if (!target && container.parentElement) container.remove();
    };
    place();
    // React owns the stable portal's contents. Only its independent container
    // moves; there is no second chat instance racing to write history.
    const observer = new MutationObserver(place);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-page"] });
    const open = () => { setDetached(true); setExpanded(true); };
    window.addEventListener("izuki:island-chat-open", open);
    return () => { observer.disconnect(); window.removeEventListener("izuki:island-chat-open", open); container.remove(); };
  }, [container, detached, expanded]);

  useEffect(() => {
    const released = (event: PointerEvent) => {
      const start = drag.current;
      drag.current = null;
      if (start && !start.detached) unlockHit();
      if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) < 24) return;
      const island = document.querySelector(".izk-island")?.getBoundingClientRect();
      const onIsland = island && event.clientX >= island.left - 24 && event.clientX <= island.right + 24 && event.clientY >= island.top - 24 && event.clientY <= island.bottom + 24;
      if (start.detached && onIsland) dock();
      else if (!start.detached) {
        floating.setBox((box) => ({ ...box, x: Math.max(0, Math.min(window.innerWidth - box.w, event.clientX - box.w / 2)), y: Math.max(0, Math.min(window.innerHeight - box.h, event.clientY - 20)) }));
        detach();
      }
    };
    const cancelled = () => { if (drag.current && !drag.current.detached) unlockHit(); drag.current = null; };
    window.addEventListener("pointerup", released);
    window.addEventListener("pointercancel", cancelled);
    return () => { cancelled(); window.removeEventListener("pointerup", released); window.removeEventListener("pointercancel", cancelled); };
  }, [floating.setBox]);
  const begin = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    drag.current = { x: event.clientX, y: event.clientY, detached };
    event.currentTarget.setPointerCapture(event.pointerId);
    if (detached) floating.begin(event, "move");
    else lockHit();
  };
  const conversation = createPortal(<AskPage page={page} onHold={setHolding} onClose={dock} onDetach={detach} onDragHandle={begin} />, container);
  return <>
    {conversation}
    {detached && (expanded ? <section data-izk-hit aria-label="Island chat window" className="pointer-events-auto fixed z-[65] flex flex-col overflow-hidden rounded-[22px] border border-white/15 bg-[#111219]/95 text-white shadow-2xl backdrop-blur-xl" style={{ left: floating.box.x, top: floating.box.y, width: floating.box.w, height: floating.box.h }}>
      <header className="flex shrink-0 items-center gap-1 border-b border-white/10 px-2 py-1.5">
        <div role="button" tabIndex={0} aria-label="Move Island chat" onPointerDown={begin} className="flex flex-1 cursor-grab items-center gap-2 px-2 text-[12px] font-semibold"><GripHorizontal size={15} /> Island chat</div>
        <button type="button" title="Minimize to bubble" aria-label="Minimize Island chat" onClick={() => setExpanded(false)} className="rounded-full p-2 hover:bg-white/10"><MessageSquare size={14} /></button>
        <button type="button" title="Dock in Island" aria-label="Dock in Island" onClick={dock} className="rounded-full p-2 hover:bg-white/10"><PanelTop size={14} /></button>
        <button type="button" title="Close and return to Island" aria-label="Close and return to Island" onClick={() => { window.dispatchEvent(new Event("izuki:island-chat-cancel")); dock(); }} className="rounded-full p-2 hover:bg-white/10"><X size={14} /></button>
      </header>
      <div ref={host} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2" />
      {resizeHandles(8).map((handle) => <div key={handle.edge} style={handle.style} onPointerDown={(event) => floating.begin(event, handle.edge)} />)}
    </section> : <button type="button" data-izk-hit aria-label="Open Island chat bubble" title="Island chat - drag to move, drop on Island to dock" onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setExpanded(true); } }} onPointerDown={(event) => { drag.current = { x: event.clientX, y: event.clientY, detached: true }; floating.begin(event, "move", () => setExpanded(true)); }} className="pointer-events-auto fixed z-[65] flex h-12 w-12 items-center justify-center rounded-full border border-fuchsia-300/35 bg-[#171324] text-fuchsia-100 shadow-xl" style={{ left: floating.box.x, top: floating.box.y }}><MessageSquare size={21} /></button>)}
  </>;
}
