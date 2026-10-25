import { forwardRef, useEffect, useState } from "react";
import { EV, on } from "../lib/ipc";

/**
 * Hold-to-talk, the HeyClicky way: while the talk key is held, a tiny live
 * waveform rides just under your mouse — not the orb. Let go and it turns
 * into three little "thinking" dots until the answer starts (then the orb or
 * the character comes up, if it's on). Positioned by the overlay straight
 * from the cursor stream (no re-render per move).
 */
const BARS = 11;

export type TalkWaveState = "listening" | "loading";

export const CursorWave = forwardRef<HTMLDivElement, { state: TalkWaveState; x: number; y: number }>(function CursorWave({ state, x, y }, ref) {
  const [levels, setLevels] = useState<number[]>(() => Array(BARS).fill(0.08));
  useEffect(() => {
    if (state !== "listening") return;
    const off = on<number>(EV.voiceLevel, (l) => setLevels((prev) => [...prev.slice(1), Math.max(0.08, Math.min(1, l))]));
    return () => void off.then((f) => f());
  }, [state]);
  return (
    <div ref={ref} className="pointer-events-none fixed left-0 top-0 z-50 will-change-transform" style={{ transform: `translate(${x + 14}px, ${y + 22}px)` }}>
      <div className="flex h-[22px] items-center gap-[2px] rounded-full border border-white/15 bg-[rgba(10,12,18,0.84)] px-2 shadow-[0_6px_18px_rgba(0,0,0,0.45)] backdrop-blur-md">
        {state === "listening" ? (
          levels.map((l, i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-izk-teal transition-[height,opacity] duration-75"
              style={{ height: `${4 + l * 14}px`, opacity: 0.5 + l * 0.5 }}
            />
          ))
        ) : (
          <span className="flex items-center gap-[4px] px-1" aria-label="Thinking">
            {[0, 1, 2].map((i) => (
              <span key={i} className="izk-breathe h-[5px] w-[5px] rounded-full bg-izk-teal" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </span>
        )}
      </div>
    </div>
  );
});
