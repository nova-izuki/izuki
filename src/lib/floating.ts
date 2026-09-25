import { useCallback, useEffect, useRef, useState } from "react";
import { lockHit, unlockHit } from "./hitTest";

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type Edge = "move" | "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export interface Limits {
  minW: number;
  minH: number;
  maxW: number;
  maxH: number;
}

/**
 * Where the usable desktop ends inside the overlay, in overlay client px.
 * The overlay spans the whole virtual desktop — taskbar included — so
 * anything anchored "bottom-right" has to stay above the taskbar, not on
 * top of the clock.
 */
export function workArea() {
  const s = window.screen as Screen & { availLeft?: number; availTop?: number };
  const left = (s.availLeft ?? 0) - window.screenX;
  const top = (s.availTop ?? 0) - window.screenY;
  return {
    left: Math.max(0, left),
    top: Math.max(0, top),
    right: Math.min(window.innerWidth, left + s.availWidth),
    bottom: Math.min(window.innerHeight, top + s.availHeight),
  };
}

function load(key: string): Box | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const b = JSON.parse(raw) as Box;
    return [b.x, b.y, b.w, b.h].every(Number.isFinite) ? b : null;
  } catch {
    return null;
  }
}

function save(key: string, b: Box) {
  try {
    localStorage.setItem(key, JSON.stringify(b));
  } catch {
    /* storage unavailable — position just won't persist */
  }
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function fit(b: Box, lim: Limits): Box {
  const w = clamp(b.w, lim.minW, Math.min(lim.maxW, window.innerWidth));
  const h = clamp(b.h, lim.minH, Math.min(lim.maxH, window.innerHeight));
  return {
    w,
    h,
    x: clamp(b.x, 0, Math.max(0, window.innerWidth - w)),
    y: clamp(b.y, 0, Math.max(0, window.innerHeight - h)),
  };
}

/**
 * A movable, resizable floating box with a remembered position/size.
 * `begin(e, edge, onClick)` starts a gesture from a pointerdown; a press
 * that never travels past a few pixels counts as a click instead of a drag,
 * so the same element can be both a button and a drag handle.
 */
export function useFloating(key: string, initial: () => Box, lim: Limits) {
  const [box, setBox] = useState<Box>(() => fit(load(key) ?? initial(), lim));
  const boxRef = useRef(box);
  boxRef.current = box;
  const initialRef = useRef(initial);
  initialRef.current = initial;

  /** Back to the starting position and size. */
  const reset = useCallback(() => setBox(fit(initialRef.current(), lim)), [lim]);

  useEffect(() => {
    save(key, box);
  }, [key, box]);

  // The overlay refits to the desktop when monitors change — pull the box
  // back on screen if that left it stranded.
  useEffect(() => {
    const onResize = () => setBox((b) => fit(b, lim));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [lim]);

  const begin = useCallback(
    (e: React.PointerEvent, edge: Edge, onClick?: () => void) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      const sx = e.clientX;
      const sy = e.clientY;
      const b0 = boxRef.current;
      let moved = false;
      lockHit();

      const move = (ev: PointerEvent) => {
        const dx = ev.clientX - sx;
        const dy = ev.clientY - sy;
        if (!moved && Math.hypot(dx, dy) < 4) return;
        moved = true;

        let { x, y, w, h } = b0;
        if (edge === "move") {
          x += dx;
          y += dy;
        } else {
          if (edge.includes("e")) w = b0.w + dx;
          if (edge.includes("s")) h = b0.h + dy;
          if (edge.includes("w")) {
            w = clamp(b0.w - dx, lim.minW, lim.maxW);
            x = b0.x + (b0.w - w);
          }
          if (edge.includes("n")) {
            h = clamp(b0.h - dy, lim.minH, lim.maxH);
            y = b0.y + (b0.h - h);
          }
        }
        setBox(fit({ x, y, w, h }, lim));
      };

      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
        unlockHit();
        if (!moved) onClick?.();
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
    },
    [lim]
  );

  return { box, setBox, begin, reset };
}

const EDGE_CURSOR: Record<Exclude<Edge, "move">, string> = {
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  nw: "nwse-resize",
  se: "nwse-resize",
};

/**
 * Invisible grab strips on every edge and corner — wire each one's
 * `onPointerDown` to `useFloating`'s `begin(e, edge)`. Pass a stable `lim`
 * (module-level constant) to `useFloating`, or its listeners re-register
 * every render.
 */
export function resizeHandles(thickness = 7): Array<{ edge: Edge; style: React.CSSProperties }> {
  const t = thickness;
  const c = t * 2;
  const s: Record<Exclude<Edge, "move">, React.CSSProperties> = {
    n: { top: -t / 2, left: c, right: c, height: t },
    s: { bottom: -t / 2, left: c, right: c, height: t },
    e: { right: -t / 2, top: c, bottom: c, width: t },
    w: { left: -t / 2, top: c, bottom: c, width: t },
    ne: { top: -t / 2, right: -t / 2, width: c, height: c },
    nw: { top: -t / 2, left: -t / 2, width: c, height: c },
    se: { bottom: -t / 2, right: -t / 2, width: c, height: c },
    sw: { bottom: -t / 2, left: -t / 2, width: c, height: c },
  };
  return (Object.keys(s) as Array<Exclude<Edge, "move">>).map((edge) => ({
    edge,
    style: { position: "absolute", cursor: EDGE_CURSOR[edge], zIndex: 2, ...s[edge] },
  }));
}
