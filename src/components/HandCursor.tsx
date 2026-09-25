import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { HandGlyph } from "./IzukiMark";
import { VoiceOrb } from "./VoiceOrb";
import { createHandEngine, type HandEngine } from "../lib/hand";

export interface HandCursorHandle extends HandEngine {}

/** Voice-ring size riding the cursor — compact, like Clicky's waveform. */
const ORB = 26;

/**
 * Renders the glowing hand and wires it to a rAF engine.
 *
 * `bindPointer` makes it chase the real mouse inside its host element; the
 * imperative handle lets the overlay drive it to vision targets instead.
 */
export const HandCursor = forwardRef<
  HandCursorHandle,
  {
    /** Chase the pointer within the host element. */
    bindPointer?: boolean;
    /** Chase the pointer even when it moves over children. */
    trail?: number;
    size?: number;
    label?: string | null;
    className?: string;
    /** Hide until the pointer has been seen at least once. */
    hideUntilMove?: boolean;
    /**
     * 0..1, how hard the hand chases its target each frame. The default
     * gives the small in-app preview a soft "chasing" feel; pass something
     * close to 1 wherever the hand is standing in for the real cursor
     * (follow mode) and needs to read as exactly where your hand actually
     * is, not a beat behind it.
     */
    follow?: number;
    /**
     * "center" sits the hand over the tracked point — right for scripted
     * moves, where the hand *is* the pointer. "trail" parks it just below
     * and right of it, clear of your real cursor's arrow, the way a
     * companion rides along without covering what you're pointing at.
     */
    anchor?: "center" | "trail";
    /** Morph into the voice-ring orb while push-to-talk is listening. */
    listening?: boolean;
    /** Swap to a small spinner while a command is out with the model. */
    thinking?: boolean;
  }
>(function HandCursor(
  {
    bindPointer = true,
    trail = 10,
    size = 34,
    label = null,
    className = "",
    hideUntilMove = true,
    follow,
    anchor = "center",
    listening = false,
    thinking = false,
  },
  ref
) {
  // HeyClicky parks its buddy's *centre* 35px right and 25px below the real
  // cursor tip (OverlayWindow.swift) — clear of the arrow, still obviously
  // "with" it. "trail" matches that exactly, whatever the hand's size.
  const glyphH = size * 1.16;
  const swapped = listening || thinking;
  const hostRef = useRef<HTMLDivElement>(null);
  const handRef = useRef<HTMLDivElement>(null);
  const openRef = useRef<HTMLDivElement>(null);
  const pointRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<HandEngine | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    const hand = handRef.current;
    if (!host || !hand) return;

    const engine = createHandEngine(host, hand, trailRef.current, {
      trail,
      follow,
      openEl: openRef.current,
      pointEl: pointRef.current,
    });
    engineRef.current = engine;

    if (!bindPointer) {
      hand.style.opacity = "1";
      return () => {
        engine.destroy();
        engineRef.current = null;
      };
    }

    let seen = !hideUntilMove;
    if (seen) hand.style.opacity = "1";

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      engine.setPointer(e.clientX - r.left, e.clientY - r.top);
      if (!seen) {
        seen = true;
        hand.style.opacity = "1";
        if (trailRef.current) trailRef.current.style.opacity = "1";
      }
    };
    const onLeave = () => {
      hand.style.opacity = "0";
      if (trailRef.current) trailRef.current.style.opacity = "0";
      seen = false;
    };

    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      engine.destroy();
      engineRef.current = null;
    };
  }, [bindPointer, follow, hideUntilMove, trail]);

  useEffect(() => {
    engineRef.current?.setTrail(trail);
  }, [trail]);

  useImperativeHandle(
    ref,
    () =>
      ({
        setPointer: (x: number, y: number) => engineRef.current?.setPointer(x, y),
        animateTo: (x: number, y: number, d: number) =>
          engineRef.current?.animateTo(x, y, d) ?? Promise.resolve(),
        release: () => engineRef.current?.release(),
        pulse: (k) => engineRef.current?.pulse(k),
        position: () => engineRef.current?.position() ?? { x: 0, y: 0 },
        setTrail: (n: number) => engineRef.current?.setTrail(n),
        destroy: () => engineRef.current?.destroy(),
      }) as HandCursorHandle,
    []
  );

  useEffect(() => {
    if (labelRef.current) labelRef.current.textContent = label ?? "";
  }, [label]);

  return (
    <div
      ref={hostRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div ref={trailRef} className="absolute inset-0 transition-opacity duration-200" />
      <div
        ref={handRef}
        className="absolute left-0 top-0 opacity-0 transition-opacity duration-200"
        style={{
          willChange: "transform",
          marginLeft: anchor === "trail" ? 35 - size / 2 : -size * 0.5,
          marginTop: anchor === "trail" ? 25 - glyphH / 2 : size * 0.08,
        }}
      >
        {/* Both poses live inside this same transformed node, so neither
            ever needs a transform of its own — only their own opacity,
            which is how a tap swaps them without disturbing `handEl`'s
            separate show/hide logic above. */}
        <div className="relative">
          <div
            className="transition-[opacity,transform] duration-200"
            style={{
              opacity: swapped ? 0 : 1,
              transform: swapped ? "scale(0.6)" : "scale(1)",
            }}
          >
            <div ref={openRef} className="transition-opacity duration-150">
              <HandGlyph size={size} pose="open" />
            </div>
            <div
              ref={pointRef}
              className="pointer-events-none absolute left-0 top-0 opacity-0 transition-opacity duration-150"
            >
              <HandGlyph size={size} pose="point" sparkle={false} />
            </div>
          </div>
          {listening && (
            <div
              className="absolute"
              style={{ left: size / 2 - ORB / 2, top: glyphH / 2 - ORB / 2 }}
            >
              <VoiceOrb size={ORB} />
            </div>
          )}
          {thinking && !listening && (
            <div
              className="absolute animate-spin rounded-full"
              style={{
                left: size / 2 - 7,
                top: glyphH / 2 - 7,
                width: 14,
                height: 14,
                border: "2px solid rgba(191,219,255,0.25)",
                borderTopColor: "#8FC7FF",
                boxShadow: "0 0 8px rgba(143,199,255,0.6)",
              }}
            />
          )}
        </div>
        {label !== null && (
          <div
            ref={labelRef}
            className="absolute left-[calc(100%-2px)] top-[60%] whitespace-nowrap rounded-full border border-white/14 bg-black/60 px-2 py-[3px] text-[10px] font-semibold text-izk-hand backdrop-blur-md"
          />
        )}
      </div>
    </div>
  );
});
