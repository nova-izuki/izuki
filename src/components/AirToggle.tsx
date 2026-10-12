import { useEffect, useRef, useState } from "react";
import { api, emit, EV, on } from "../lib/ipc";
import { cx } from "./ui";

/**
 * Air control on/off, one tap — the same switch on the chat, the chat
 * bubble, the Island and the Chat tab. (Works from any window: it asks the
 * config panel to save, like the other overlay switches.)
 */
export function AirToggle({ variant = "chip", className }: { variant?: "chip" | "mini"; className?: string }) {
  const [onNow, setOn] = useState<boolean | null>(null);
  /** The latest value, so quick double taps flip from where the last tap left it. */
  const current = useRef<boolean | null>(null);
  current.current = onNow;
  useEffect(() => {
    let alive = true;
    const read = () => void api.getSettings().then((s) => alive && setOn(!!s.air_enabled)).catch(() => undefined);
    read();
    const off = on<void>(EV.settingsChanged, read);
    return () => {
      alive = false;
      void off.then((f) => f());
    };
  }, []);
  if (onNow === null) return null;
  const flip = () => {
    const next = !current.current;
    current.current = next;
    setOn(next);
    void emit(EV.patchSettings, { air_enabled: next });
  };
  const title = onNow ? "Air control is on: your hand drives the PC. Tap to turn it off." : "Air control: control the PC with your hand in front of the camera. Tap to turn it on.";
  if (variant === "mini") {
    return (
      <button
        type="button"
        data-izk-hit
        aria-pressed={onNow}
        aria-label={onNow ? "Turn Air control off" : "Turn Air control on"}
        title={title}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={flip}
        className={cx(
          "flex h-[24px] w-[24px] items-center justify-center rounded-full border text-[12px] shadow-[0_6px_16px_rgba(0,0,0,0.45)] transition-colors",
          onNow ? "border-cyan-300/80 bg-cyan-500/35" : "border-white/15 bg-black/55 opacity-80 hover:opacity-100",
          className
        )}
      >
        🖐️
      </button>
    );
  }
  return (
    <button
      type="button"
      aria-pressed={onNow}
      title={title}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={flip}
      className={cx(
        "izk-no-drag flex h-[34px] shrink-0 items-center gap-1 rounded-full border px-2 text-[11px] font-semibold text-izk-ink transition-colors",
        onNow ? "border-cyan-300/60 bg-cyan-400/20" : "border-white/10 bg-white/6 hover:bg-white/12",
        className
      )}
    >
      🖐️ {onNow ? "Air on" : "Air"}
    </button>
  );
}
