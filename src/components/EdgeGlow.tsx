import { useEffect, useRef, useState, type CSSProperties } from "react";
import { EV, on } from "../lib/ipc";
import type { OrbState } from "../lib/types";

/**
 * A thin line of light around the screen edges while Izuki is with you.
 * Listening: calm cyan, slowly drifting. Thinking: every colour, flowing
 * fast. Talking: the colours swell with each word. Silent: it fades away.
 *
 * Cheap on purpose (the overlay covers the whole screen): four thin strips
 * whose colours only *slide* (transform, done by the graphics chip — nothing
 * is repainted), no blur filters, and nothing at all is mounted while silent.
 */

// Izuki's own colours — not Apple's.
const VIVID = "#5EE7FF, #7C5CFF, #FF5CAA, #FFB547, #4ECDC4, #5EE7FF";
const CALM = "#5EE7FF, #3BB8FF, #8FF5FF, #4ECDC4, #5EE7FF";
/** One trip of the colours, in ms, per state (lower = faster). */
const SPEED: Record<Exclude<OrbState, "hidden">, number> = { listening: 1, thinking: 3.2, speaking: 1.6 };
const LOOP_MS = 9000;
const FADE_MS = 650;

type Side = "top" | "right" | "bottom" | "left";
const SIDES: Side[] = ["top", "right", "bottom", "left"];

export function EdgeGlow({ state }: { state: OrbState }) {
  const [mounted, setMounted] = useState(state !== "hidden");
  const [shown, setShown] = useState(false);
  const last = useRef<Exclude<OrbState, "hidden">>("listening");
  if (state !== "hidden") last.current = state;

  // Fade in on the next frame; fade out, then unmount (nothing left running).
  useEffect(() => {
    if (state !== "hidden") {
      setMounted(true);
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), FADE_MS);
    return () => clearTimeout(t);
  }, [state]);

  if (!mounted) return null;
  return <Glow state={last.current} shown={shown} />;
}

function Glow({ state, shown }: { state: Exclude<OrbState, "hidden">; shown: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const anims = useRef<Animation[]>([]);
  const still = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The colours slide along each edge, all the way round the screen.
  useEffect(() => {
    const el = root.current;
    if (!el || still) return;
    const list: Animation[] = [];
    el.querySelectorAll<HTMLElement>("[data-flow]").forEach((band) => {
      const vertical = band.dataset.flow === "y";
      const back = band.dataset.back === "1";
      const from = back ? "-50%" : "0%";
      const to = back ? "0%" : "-50%";
      list.push(
        band.animate(
          [{ transform: vertical ? `translateY(${from})` : `translateX(${from})` }, { transform: vertical ? `translateY(${to})` : `translateX(${to})` }],
          { duration: LOOP_MS, iterations: Infinity },
        ),
      );
    });
    anims.current = list;
    return () => list.forEach((a) => a.cancel());
  }, [still]);

  // Faster while thinking — without jumping (the speed eases, not restarts).
  useEffect(() => {
    for (const a of anims.current) {
      if (typeof a.updatePlaybackRate === "function") a.updatePlaybackRate(SPEED[state]);
      else a.playbackRate = SPEED[state];
    }
  }, [state]);

  // Each word swells the glow: the voice level (Izuki's voice while talking,
  // yours while listening) sets how far the light reaches in.
  useEffect(() => {
    const off = on<number>(EV.voiceLevel, (l) => {
      const el = root.current;
      if (!el) return;
      const v = Number.isFinite(l) ? Math.max(0, Math.min(1, l)) : 0;
      el.style.setProperty("--izk-swell", (1 + v * 1.6).toFixed(3));
      el.style.setProperty("--izk-bright", (0.55 + v * 0.45).toFixed(3));
    });
    return () => void off.then((f) => f());
  }, []);

  const vivid = state !== "listening";
  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[80] overflow-hidden"
      style={{ opacity: shown ? 1 : 0, transition: `opacity ${FADE_MS}ms ease` }}
    >
      <Layer colors={CALM} on={!vivid} />
      <Layer colors={VIVID} on={vivid} />
    </div>
  );
}

/** One colour set around all four edges; two of them crossfade between states. */
function Layer({ colors, on }: { colors: string; on: boolean }) {
  return (
    <div className="absolute inset-0" style={{ opacity: on ? 1 : 0, transition: "opacity 500ms ease" }}>
      {SIDES.map((side) => (
        <Edge key={side} side={side} colors={colors} />
      ))}
    </div>
  );
}

function Edge({ side, colors }: { side: Side; colors: string }) {
  const vertical = side === "left" || side === "right";
  // Clockwise: along the top to the right, down the right, back along the
  // bottom, up the left.
  const back = side === "bottom" || side === "left";
  const dir = vertical ? "to bottom" : "to right";
  // Twice as long as the edge and repeating, so sliding half way loops cleanly.
  const band = (
    <div
      data-flow={vertical ? "y" : "x"}
      data-back={back ? "1" : "0"}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: vertical ? "100%" : "200%",
        height: vertical ? "200%" : "100%",
        background: `linear-gradient(${dir}, ${colors}, ${colors.split(", ").slice(1).join(", ")})`,
        willChange: "transform",
      }}
    />
  );
  const edge: CSSProperties = vertical
    ? { top: 0, bottom: 0, [side]: 0, width: 3 }
    : { left: 0, right: 0, [side]: 0, height: 3 };
  const glow: CSSProperties = vertical
    ? { top: 0, bottom: 0, [side]: 0, width: 46 }
    : { left: 0, right: 0, [side]: 0, height: 46 };
  const inward = { top: "to bottom", bottom: "to top", left: "to right", right: "to left" }[side];
  const origin = { top: "top", bottom: "bottom", left: "left", right: "right" }[side];
  const fadeIn = `linear-gradient(${inward}, #000 0%, rgba(0,0,0,0.45) 30%, transparent 100%)`;
  const fadeEnds = `linear-gradient(${dir}, transparent 0, #000 110px, #000 calc(100% - 110px), transparent 100%)`;
  return (
    <>
      {/* The soft light reaching into the screen: fades out inward, grows with the voice. */}
      <div
        className="absolute overflow-hidden"
        style={{
          ...glow,
          opacity: "calc(var(--izk-bright, 0.6) * 0.55)",
          transform: vertical ? "scaleX(var(--izk-swell, 1))" : "scaleY(var(--izk-swell, 1))",
          transformOrigin: origin,
          transition: "transform 110ms linear, opacity 110ms linear",
          // Fades inward, and out at both ends so two edges blend at a corner
          // instead of stacking into a bright square.
          WebkitMaskImage: `${fadeIn}, ${fadeEnds}`,
          maskImage: `${fadeIn}, ${fadeEnds}`,
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
        }}
      >
        {band}
      </div>
      {/* The bright line itself. */}
      <div className="absolute overflow-hidden" style={edge}>
        {band}
      </div>
    </>
  );
}
