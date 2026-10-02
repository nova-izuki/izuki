import { useMemo } from "react";
import qrcode from "qrcode-generator";

/**
 * A QR code drawn on this PC (no online service) — dark squares on a white
 * tile with its quiet zone, which phone cameras read reliably even on
 * Izuki's dark panel.
 */
export function QrCode({ text, size = 148, label }: { text: string; size?: number; label: string }) {
  const cells = useMemo(() => {
    const qr = qrcode(0, "M");
    qr.addData(text);
    qr.make();
    const n = qr.getModuleCount();
    let path = "";
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (qr.isDark(r, c)) path += `M${c} ${r}h1v1h-1z`;
      }
    }
    return { n, path };
  }, [text]);

  const quiet = 4; // the blank border scanners need
  const view = cells.n + quiet * 2;
  const pixels = view * Math.max(4, Math.ceil(Math.max(size, 220) / view));
  return (
    <svg
      role="img"
      aria-label={label}
      width={pixels}
      height={pixels}
      style={{ flexShrink: 0, minWidth: pixels, minHeight: pixels }}
      viewBox={`${-quiet} ${-quiet} ${view} ${view}`}
      shapeRendering="crispEdges"
      className="rounded-[12px] shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
    >
      <rect x={-quiet} y={-quiet} width={view} height={view} fill="#ffffff" />
      <path d={cells.path} fill="#0e0e13" />
    </svg>
  );
}
