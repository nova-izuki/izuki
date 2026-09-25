/**
 * The Konva drawing surface.
 *
 * Deliberately imperative: shapes are created and mutated directly on the
 * stage rather than through React, so a freehand stroke costs one layer redraw
 * per frame instead of a full reconciliation. React only ever hears about
 * completed marks.
 *
 * Every shape renders as a hand-inked sketch rather than a perfect vector
 * primitive — see `sketchy.ts`. The *true* geometry (the corners you actually
 * dragged between, not the wobbled ink) is tracked separately and is what
 * gets sent to the backend, so a rough-looking box still reports a clean
 * rectangle and a rough arrow still reports its exact tail and head.
 */
import Konva from "konva";
import { createSeed, sketchyArrowhead, sketchyEllipse, sketchyLine, sketchyRect, type Seed } from "./sketchy";
import type { Intent, Mark, ShapeKind } from "./types";

export const TOOL_COLOUR: Record<ShapeKind, string> = {
  box: "#FF5F7A",
  arrow: "#4ECDC4",
  circle: "#7C5CFF",
  pen: "#FFE66D",
  text: "#FFE66D",
};

/** Each shape's two-tone pair for the "gradient" ink. */
export const TOOL_GRADIENT: Record<ShapeKind, [string, string]> = {
  box: ["#FF5F7A", "#7C5CFF"],
  arrow: ["#4ECDC4", "#3380FF"],
  circle: ["#7C5CFF", "#4ECDC4"],
  pen: ["#FFE66D", "#FF5F7A"],
  text: ["#FFE66D", "#FF5F7A"],
};

/** Where a gradient runs, in stage pixels. */
interface Span {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface DrawSurfaceOptions {
  /** Called once a mark is finished. */
  onCommit: (mark: Mark) => void;
  /** Called on right-click, with client coordinates for the menu. */
  onContext: (x: number, y: number, markId: string | null) => void;
  /** Live stroke feedback for the chrome (tool hints, counters). */
  onDrawingChange: (drawing: boolean) => void;
}

export interface DrawSurface {
  setTool(tool: ShapeKind): void;
  tool(): ShapeKind;
  setIntent(intent: Intent): void;
  /** "auto" (each shape its own colour), "gradient" (each shape its own
   *  two-tone gradient), or any CSS colour for every mark. */
  setInk(mode: string): void;
  /** Re-render the decorations for a set of marks (numbers, intent tints). */
  sync(marks: Mark[]): void;
  undo(): void;
  clear(): void;
  resize(w: number, h: number): void;
  destroy(): void;
}

let seq = 0;
const nextId = () => `m${Date.now().toString(36)}${(seq++).toString(36)}`;

export function createDrawSurface(
  container: HTMLDivElement,
  opts: DrawSurfaceOptions
): DrawSurface {
  const stage = new Konva.Stage({
    container,
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Shapes and their badges live on separate layers so redrawing a live
  // stroke never re-rasterises the numbering.
  const shapeLayer = new Konva.Layer({ listening: false });
  const badgeLayer = new Konva.Layer({ listening: false });
  stage.add(shapeLayer);
  stage.add(badgeLayer);

  let tool: ShapeKind = "pen";
  let intent: Intent = "auto";
  let inkMode = "auto";
  let drawing = false;
  // Running bounds of the live freehand stroke, so its gradient spans it.
  let penSpan: Span = { x0: 0, y0: 0, x1: 0, y1: 0 };
  let start = { x: 0, y: 0 };

  // The node currently being drawn, and the true (unwobbled) shape behind it.
  let live: Konva.Group | Konva.Line | null = null;
  let liveSeed: Seed | null = null;
  let livePoints: number[] = []; // pen tool's real path
  const shapesById = new Map<string, Konva.Group | Konva.Line>();
  // True endpoints for the current arrow, independent of its sketchy render.
  let arrowTail = { x: 0, y: 0 };
  let arrowHead = { x: 0, y: 0 };

  function glow(colour: string) {
    return {
      shadowColor: colour,
      shadowBlur: 16,
      shadowOpacity: 0.75,
      shadowForStrokeEnabled: true,
    };
  }

  /** The single colour a shape reads as — its solid ink, or its gradient's lead. */
  function baseColour(kind: ShapeKind) {
    if (inkMode === "auto") return TOOL_COLOUR[kind];
    if (inkMode === "gradient") return TOOL_GRADIENT[kind][0];
    return inkMode;
  }

  /**
   * Stroke styling for a line of `kind` spanning `span`. For the gradient
   * ink every piece of one mark shares the mark's own span, so a box's four
   * sides (or an arrow's shaft and head) read as one continuous sweep —
   * for arrows it runs tail to head, following the drag.
   */
  function paint(kind: ShapeKind, span: Span): Partial<Konva.LineConfig> {
    if (inkMode !== "gradient") {
      const c = baseColour(kind);
      return { stroke: c, ...glow(c) };
    }
    const [a, b] = TOOL_GRADIENT[kind];
    // A zero-length gradient paints nothing at all — nudge it open.
    const degenerate = span.x0 === span.x1 && span.y0 === span.y1;
    return {
      strokeLinearGradientStartPoint: { x: span.x0, y: span.y0 },
      strokeLinearGradientEndPoint: { x: degenerate ? span.x0 + 1 : span.x1, y: span.y1 },
      strokeLinearGradientColorStops: [0, a, 1, b],
      ...glow(a),
    };
  }

  /** One rough-ink stroke, as a Konva.Line, from a flat points array. */
  function inkLine(points: number[], kind: ShapeKind, span: Span, width = 3.4) {
    return new Konva.Line({
      points,
      strokeWidth: width,
      lineCap: "round",
      lineJoin: "round",
      tension: 0.42,
      bezier: false,
      ...paint(kind, span),
    });
  }

  function beginShape(x: number, y: number) {
    const at: Span = { x0: x, y0: y, x1: x, y1: y };
    liveSeed = createSeed();

    switch (tool) {
      case "box":
      case "arrow": {
        live = new Konva.Group();
        if (tool === "arrow") {
          arrowTail = { x, y };
          arrowHead = { x, y };
        }
        break;
      }
      case "circle":
        live = inkLine([], "circle", at, 3.6);
        break;
      default:
        livePoints = [x, y];
        penSpan = { ...at };
        live = new Konva.Line({
          points: livePoints,
          strokeWidth: 3.2,
          lineCap: "round",
          lineJoin: "round",
          tension: 0.32,
          ...paint(tool, penSpan),
        });
    }
    shapeLayer.add(live!);
  }

  /** Rebuild a box's four rough sides from its true corners. */
  function renderBox(group: Konva.Group, seed: Seed, x0: number, y0: number, x1: number, y1: number) {
    group.destroyChildren();
    const x = Math.min(x0, x1);
    const y = Math.min(y0, y1);
    const w = Math.abs(x1 - x0);
    const h = Math.abs(y1 - y0);
    const span: Span = { x0: x, y0: y, x1: x + w, y1: y + h };
    for (const seg of sketchyRect(seed, x, y, w, h)) {
      group.add(inkLine(seg, "box", span));
    }
  }

  /** Rebuild an arrow's rough shaft and head from its true tail/head. */
  function renderArrow(group: Konva.Group, seed: Seed, tail: { x: number; y: number }, head: { x: number; y: number }) {
    group.destroyChildren();
    const span: Span = { x0: tail.x, y0: tail.y, x1: head.x, y1: head.y };
    for (const seg of sketchyLine(seed, tail.x, tail.y, head.x, head.y)) {
      group.add(inkLine(seg, "arrow", span));
    }
    // Only draw a head once there is a real direction to point in.
    if (Math.hypot(head.x - tail.x, head.y - tail.y) > 8) {
      for (const seg of sketchyArrowhead(seed, tail.x, tail.y, head.x, head.y)) {
        group.add(inkLine(seg, "arrow", span, 3.8));
      }
    }
  }

  function updateShape(x: number, y: number) {
    if (!live || !liveSeed) return;

    if (live instanceof Konva.Group && tool === "box") {
      renderBox(live, liveSeed, start.x, start.y, x, y);
    } else if (live instanceof Konva.Group && tool === "arrow") {
      arrowHead = { x, y };
      renderArrow(live, liveSeed, arrowTail, arrowHead);
    } else if (live instanceof Konva.Line && tool === "circle") {
      const cx = (start.x + x) / 2;
      const cy = (start.y + y) / 2;
      const rx = Math.abs(x - start.x) / 2;
      const ry = Math.abs(y - start.y) / 2;
      live.points(sketchyEllipse(liveSeed, cx, cy, Math.max(rx, 1), Math.max(ry, 1)));
      if (inkMode === "gradient") {
        live.setAttrs(paint("circle", { x0: cx - rx, y0: cy - ry, x1: cx + rx, y1: cy + ry }));
      }
    } else if (live instanceof Konva.Line && tool === "pen") {
      const last = livePoints.length;
      // Skip points that add nothing — keeps long strokes cheap to redraw
      // and keeps the payload we hand the backend small.
      const px = livePoints[last - 2];
      const py = livePoints[last - 1];
      if (Math.hypot(x - px, y - py) >= 2.5) {
        livePoints.push(x, y);
        live.points(livePoints);
        if (inkMode === "gradient") {
          penSpan = {
            x0: Math.min(penSpan.x0, x),
            y0: Math.min(penSpan.y0, y),
            x1: Math.max(penSpan.x1, x),
            y1: Math.max(penSpan.y1, y),
          };
          live.setAttrs(paint("pen", penSpan));
        }
      }
    }
    shapeLayer.batchDraw();
  }

  function finishShape(): Mark | null {
    if (!live) return null;

    const id = nextId();
    let points: Array<{ x: number; y: number }> = [];
    let rect: { x: number; y: number; w: number; h: number };

    if (tool === "arrow") {
      points = [arrowTail, arrowHead];
      const x = Math.min(arrowTail.x, arrowHead.x);
      const y = Math.min(arrowTail.y, arrowHead.y);
      rect = {
        x,
        y,
        w: Math.abs(arrowHead.x - arrowTail.x),
        h: Math.abs(arrowHead.y - arrowTail.y),
      };
    } else if (tool === "pen") {
      const p = (live as Konva.Line).points();
      for (let i = 0; i < p.length; i += 2) points.push({ x: p[i], y: p[i + 1] });
      const box = live.getClientRect({ skipShadow: true });
      rect = { x: box.x, y: box.y, w: box.width, h: box.height };
    } else {
      // box / circle: the true drag rectangle, not the sketchy render's bounds.
      const box = live.getClientRect({ skipShadow: true });
      rect = { x: box.x, y: box.y, w: box.width, h: box.height };
    }

    // A click with no drag is a dot, not a mark.
    const tiny = rect.w < 5 && rect.h < 5 && points.length < 3;
    if (tiny) {
      live.destroy();
      shapeLayer.batchDraw();
      live = null;
      liveSeed = null;
      return null;
    }

    shapesById.set(id, live);
    live = null;
    liveSeed = null;
    livePoints = [];

    return {
      id,
      kind: tool,
      rect: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        w: Math.round(rect.w),
        h: Math.round(rect.h),
      },
      points,
      intent,
      order: shapesById.size,
    };
  }

  // ---------------------------------------------------------------- events

  function onDown(e: PointerEvent) {
    if (e.button !== 0) return;
    container.setPointerCapture?.(e.pointerId);
    drawing = true;
    start = { x: e.clientX, y: e.clientY };
    beginShape(e.clientX, e.clientY);
    opts.onDrawingChange(true);
  }

  function onMove(e: PointerEvent) {
    if (!drawing) return;
    updateShape(e.clientX, e.clientY);
  }

  function onUp(e: PointerEvent) {
    if (!drawing) return;
    drawing = false;
    container.releasePointerCapture?.(e.pointerId);
    const mark = finishShape();
    opts.onDrawingChange(false);
    if (mark) opts.onCommit(mark);
  }

  function onContext(e: MouseEvent) {
    e.preventDefault();
    // Attribute the menu to the most recent mark under the cursor, if any.
    let hitId: string | null = null;
    for (const [id, shape] of shapesById) {
      const r = shape.getClientRect({ skipShadow: true });
      if (
        e.clientX >= r.x - 6 &&
        e.clientX <= r.x + r.width + 6 &&
        e.clientY >= r.y - 6 &&
        e.clientY <= r.y + r.height + 6
      ) {
        hitId = id;
      }
    }
    opts.onContext(e.clientX, e.clientY, hitId);
  }

  container.addEventListener("pointerdown", onDown);
  container.addEventListener("pointermove", onMove, { passive: true });
  container.addEventListener("pointerup", onUp);
  container.addEventListener("pointercancel", onUp);
  container.addEventListener("contextmenu", onContext);

  // ------------------------------------------------------------ decoration

  const INTENT_LABEL: Partial<Record<Intent, string>> = {
    click: "click",
    double_click: "double",
    right_click: "right",
    type: "type",
    drag: "drag",
    watch: "watch",
    copy: "copy",
    scroll: "scroll",
    hover: "hover",
    key: "key",
  };

  function sync(marks: Mark[]) {
    badgeLayer.destroyChildren();

    marks.forEach((m, i) => {
      const colour = baseColour(m.kind);
      const label = INTENT_LABEL[m.intent];
      const bx = m.rect.x;
      const by = m.rect.y;

      const group = new Konva.Group({ x: bx - 6, y: by - 16 });

      group.add(
        new Konva.Circle({
          x: 0,
          y: 0,
          radius: 13,
          fill: colour,
          shadowColor: colour,
          shadowBlur: 16,
          shadowOpacity: 0.9,
        })
      );
      group.add(
        new Konva.Text({
          x: -13,
          y: -7,
          width: 26,
          align: "center",
          text: String(i + 1),
          fontSize: 14,
          fontStyle: "bold",
          fontFamily: "Geist, Segoe UI, sans-serif",
          fill: "#0B0A12",
        })
      );

      if (label) {
        const pill = new Konva.Label({ x: 18, y: -11 });
        pill.add(
          new Konva.Tag({
            fill: "rgba(10,9,16,0.82)",
            cornerRadius: 10,
            stroke: colour,
            strokeWidth: 1,
          })
        );
        pill.add(
          new Konva.Text({
            text: label,
            fontSize: 11,
            fontFamily: "Geist, Segoe UI, sans-serif",
            fill: colour,
            padding: 5,
          })
        );
        group.add(pill);
      }

      badgeLayer.add(group);

      // Dim marks that are no longer the active step.
      const shape = shapesById.get(m.id);
      if (shape) shape.opacity(1);
    });

    badgeLayer.batchDraw();
  }

  return {
    setTool: (t) => {
      tool = t;
    },
    tool: () => tool,
    setIntent: (i) => {
      intent = i;
    },
    setInk: (mode) => {
      inkMode = mode || "auto";
    },
    sync,
    undo() {
      const last = [...shapesById.keys()].pop();
      if (!last) return;
      shapesById.get(last)?.destroy();
      shapesById.delete(last);
      shapeLayer.batchDraw();
    },
    clear() {
      shapesById.clear();
      shapeLayer.destroyChildren();
      badgeLayer.destroyChildren();
      shapeLayer.batchDraw();
      badgeLayer.batchDraw();
    },
    resize(w, h) {
      stage.size({ width: w, height: h });
    },
    destroy() {
      container.removeEventListener("pointerdown", onDown);
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerup", onUp);
      container.removeEventListener("pointercancel", onUp);
      container.removeEventListener("contextmenu", onContext);
      stage.destroy();
    },
  };
}
