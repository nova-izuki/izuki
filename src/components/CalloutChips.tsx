import type { Callout } from "../lib/types";

/**
 * Gemini-style pointing: the regions a reply explains, chipped on screen.
 *
 * Coordinates arrive normalised 0–1000 across the screenshot (see
 * `brain.rs`'s `extract_callouts`), so the same numbers land correctly at
 * any window size — and any future surface: the desktop overlay here, and
 * later the chat bubbles (phone included, same React) with no new maths.
 *
 * Pure display: the layer never takes a click, and chips disappear when
 * the backend sends a fresh look (`izuki://callouts` with a new list) or an
 * empty one when the task ends.
 */
export function CalloutLayer({ callouts }: { callouts: Callout[] }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[60]" style={{ overflow: "hidden" }}>
      {callouts.map((c, i) => {
        const left = Math.round((c.x / 1000) * window.innerWidth);
        const top = Math.round((c.y / 1000) * window.innerHeight);
        const width = Math.max(24, Math.round((c.w / 1000) * window.innerWidth));
        const height = Math.max(18, Math.round((c.h / 1000) * window.innerHeight));
        const clamp = (n: number, max: number) => Math.min(Math.max(n, 6), max - 6);
        return (
          <div key={`${i}-${c.label}`} style={{ position: "absolute", left, top, width, height }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                border: "2px dashed rgba(79,156,255,0.95)",
                borderRadius: 10,
                boxShadow: "0 0 0 1px rgba(0,0,0,0.35), inset 0 0 12px rgba(79,156,255,0.12)",
                background: "rgba(79,156,255,0.05)",
              }}
            />
            <span
              style={{
                position: "absolute",
                left: clamp(0, width),
                top: -26,
                padding: "3px 9px",
                fontSize: 12,
                fontWeight: 600,
                lineHeight: 1.25,
                color: "#fff",
                background: "rgba(28,96,220,0.95)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: 8,
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                maxWidth: Math.max(80, Math.round(window.innerWidth * 0.35)),
                overflow: "hidden",
              }}
            >
              {c.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** One chip, placed by the caller — the shape chat bubbles will reuse. */
export function CalloutChip({ callout, left, top, width, height }: {
  callout: Callout;
  left: number;
  top: number;
  width: number;
  height: number;
}) {
  const w = Math.max(24, Math.round(width));
  const h = Math.max(18, Math.round(height));
  return (
    <div style={{ position: "absolute", left, top, width: w, height: h, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          border: "2px dashed rgba(79,156,255,0.95)",
          borderRadius: 10,
          background: "rgba(79,156,255,0.05)",
        }}
      />
      <span
        style={{
          position: "absolute",
          left: 0,
          top: -26,
          padding: "3px 9px",
          fontSize: 12,
          fontWeight: 600,
          color: "#fff",
          background: "rgba(28,96,220,0.95)",
          borderRadius: 8,
          whiteSpace: "nowrap",
        }}
      >
        {callout.label}
      </span>
    </div>
  );
}
