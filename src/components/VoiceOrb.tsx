import { useEffect, useRef } from "react";
import { Mic } from "lucide-react";
import { EV, on } from "../lib/ipc";

/**
 * The voice ring — a round orb whose outline ripples with how loud you're
 * talking. Mic loudness arrives over `EV.voiceLevel` from the config panel
 * (that's where the microphone lives); if none arrives — the webview
 * wouldn't grant a second mic stream, say — it falls back to a slow breathe,
 * so it never just sits there frozen.
 *
 * Everything animates on refs in one rAF loop — no React re-renders per frame.
 */
export function VoiceOrb({ size = 36, mic = false }: { size?: number; mic?: boolean }) {
  const inner = useRef<SVGPathElement>(null);
  const outer = useRef<SVGPathElement>(null);
  const halo = useRef<HTMLDivElement>(null);
  const uid = useRef(`vo${Math.random().toString(36).slice(2, 8)}`).current;

  useEffect(() => {
    let target = 0;
    let level = 0;
    let heardAt = 0;
    const off = on<number>(EV.voiceLevel, (v) => {
      target = Math.max(0, Math.min(1, v));
      heardAt = performance.now();
    });

    const c = size / 2;
    const ring = (radius: number, amp: number, t: number, phase: number) => {
      const n = 56;
      let d = "";
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * Math.PI * 2;
        const wobble =
          Math.sin(a * 3 + t * 4.2 + phase) * 0.55 +
          Math.sin(a * 5 - t * 3.1 + phase * 2) * 0.3 +
          Math.sin(a * 7 + t * 5.3) * 0.15;
        const r = radius + amp * wobble;
        d += `${i ? "L" : "M"}${(c + Math.cos(a) * r).toFixed(2)} ${(c + Math.sin(a) * r).toFixed(2)}`;
      }
      return `${d}Z`;
    };

    let raf = 0;
    const t0 = performance.now();
    const frame = (now: number) => {
      const t = (now - t0) / 1000;
      const live = now - heardAt < 450;
      const want = live ? target : 0.16 + 0.1 * Math.sin(t * 2.3);
      level += (want - level) * 0.22;

      inner.current?.setAttribute("d", ring(size * 0.3, size * (0.02 + 0.09 * level), t, 0));
      outer.current?.setAttribute("d", ring(size * 0.4, size * (0.015 + 0.07 * level), t * 0.8, 1.7));
      if (halo.current) {
        halo.current.style.transform = `scale(${(1 + level * 0.45).toFixed(3)})`;
        halo.current.style.opacity = (0.35 + level * 0.5).toFixed(3);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      void off.then((f) => f());
    };
  }, [size]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        ref={halo}
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(143,199,255,0.55), transparent 68%)",
          filter: "blur(4px)",
          willChange: "transform, opacity",
        }}
      />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="relative">
        <defs>
          <radialGradient id={`${uid}-f`} cx="0.38" cy="0.32" r="0.75">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#CFE3FF" />
            <stop offset="100%" stopColor="#6F8BFF" />
          </radialGradient>
        </defs>
        <path ref={outer} fill="none" stroke="rgba(191,219,255,0.55)" strokeWidth={1.2} />
        <path
          ref={inner}
          fill={`url(#${uid}-f)`}
          stroke="rgba(26,24,48,0.35)"
          strokeWidth={1}
        />
      </svg>
      {mic && (
        <Mic
          size={Math.round(size * 0.3)}
          strokeWidth={2.4}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#1a1830]"
        />
      )}
    </div>
  );
}
