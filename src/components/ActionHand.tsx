import { useEffect, useRef, useState } from "react";
import { EV, on } from "../lib/ipc";
import type { DesktopBounds, HandCommand, OrbState } from "../lib/types";
import { HandCursor, type HandCursorHandle } from "./HandCursor";

/** A bounded action indicator, never a mouse follower or camera consumer.
 * Air's tracking ring has its own lifecycle and is deliberately independent. */
export function ActionHand({ enabled, size, desktop }: { enabled: boolean; size: number; desktop: DesktopBounds }) {
  const hand = useRef<HandCursorHandle>(null);
  const bounds = useRef(desktop);
  bounds.current = desktop;
  const [target, setTarget] = useState<{ x: number; y: number; action: HandCommand["action"]; duration: number } | null>(null);
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const clear = () => { clearTimeout(timer); timer = undefined; if (alive) setTarget(null); };
    clear();
    if (!enabled) return;
    const offs = [
      on<HandCommand>(EV.hand, (cmd) => {
        if (!alive || document.visibilityState === "hidden" || !Number.isFinite(cmd.x) || !Number.isFinite(cmd.y)) return;
        const d = cmd.desktop && cmd.desktop.w > 0 && cmd.desktop.h > 0 ? cmd.desktop : bounds.current;
        if (!(d.w > 0 && d.h > 0)) return;
        clearTimeout(timer);
        const duration = Number.isFinite(cmd.duration_ms) ? Math.min(3000, Math.max(90, cmd.duration_ms)) : 320;
        setTarget({ x: Math.max(0, Math.min(innerWidth, (cmd.x - d.x) * innerWidth / d.w)),
          y: Math.max(0, Math.min(innerHeight, (cmd.y - d.y) * innerHeight / d.h)), action: cmd.action, duration });
        timer = setTimeout(clear, duration + 500);
      }),
      on<void>(EV.overlayClose, clear),
      on<void>(EV.overlayOpen, clear),
      on<void>(EV.stopSpeaking, clear),
      on<boolean>(EV.thinking, (active) => { if (!active) clear(); }),
      on<void>("izuki://foreground-changed", clear),
      on<OrbState>(EV.orb, (state) => { if (state === "hidden" || state === "listening") clear(); }),
    ];
    const visibility = () => { if (document.visibilityState === "hidden") clear(); };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      alive = false;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", visibility);
      offs.forEach((off) => void off.then((dispose) => dispose()));
    };
  }, [enabled]);

  useEffect(() => {
    if (!target || !enabled) return;
    // The visual points to this action's actual target; it never follows later
    // unrelated mouse movement or sends an input event itself.
    hand.current?.setPointer(target.x, target.y);
    if (["click", "double_click", "right_click", "drag", "type"].includes(target.action)) {
      hand.current?.pulse(target.action as "click" | "double_click" | "right_click" | "drag" | "type");
    }
  }, [target, enabled]);

  if (!enabled || !target) return null;
  return <div data-izk-action-hand className="pointer-events-none fixed inset-0" aria-hidden="true" style={{ pointerEvents: "none" }}>
    <HandCursor ref={hand} bindPointer={false} hideUntilMove={false} trail={0} size={size} follow={1} anchor="trail" />
  </div>;
}
