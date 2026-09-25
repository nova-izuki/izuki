/**
 * The glowing hand.
 *
 * Runs entirely outside React: one rAF loop writes `transform` straight onto
 * the DOM nodes, so following the mouse costs no re-renders and stays smooth
 * while Konva is busy drawing.
 */

export type HandPulse = "click" | "double_click" | "right_click" | "drag" | "type" | "none";

export interface HandEngineOptions {
  /** 0..1 — how hard the hand chases the pointer each frame at 60fps. */
  follow?: number;
  /** Number of trail dots. 0 disables the trail. */
  trail?: number;
  /**
   * The two hand poses, cross-faded for the instant of a click pulse so a
   * tap actually looks like a tap, not just the open palm shrinking. Both
   * must be nested inside `handEl` so they inherit its position for free —
   * `handEl`'s own opacity stays under the caller's show/hide logic and is
   * never touched here.
   */
  openEl?: HTMLElement | null;
  pointEl?: HTMLElement | null;
}

export interface HandEngine {
  /** Feed a new pointer position (client coordinates relative to the host). */
  setPointer(x: number, y: number): void;
  /** Take control and glide to a point; resolves when it lands. */
  animateTo(x: number, y: number, durationMs: number): Promise<void>;
  /** Hand back to mouse-following. */
  release(): void;
  /** Play a press animation. */
  pulse(kind: HandPulse): void;
  /** Current on-screen hand position. */
  position(): { x: number; y: number };
  setTrail(n: number): void;
  destroy(): void;
}

/** Cubic ease used for scripted travel — fast out, soft landing. */
function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5);
}

/**
 * A gentle sideways bow so scripted travel reads as a hand reaching, not a
 * teleport. Perpendicular offset peaks mid-flight and vanishes at both ends.
 */
function bow(t: number) {
  return Math.sin(t * Math.PI);
}

export function createHandEngine(
  host: HTMLElement,
  handEl: HTMLElement,
  trailLayer: HTMLElement | null,
  opts: HandEngineOptions = {}
): HandEngine {
  const follow = opts.follow ?? 0.24;
  const openEl = opts.openEl ?? null;
  const pointEl = opts.pointEl ?? null;
  let poseTimer: ReturnType<typeof setTimeout> | null = null;

  let px = -9999;
  let py = -9999;
  let x = -9999;
  let y = -9999;
  let raf = 0;
  let alive = true;

  // Scripted flight
  let scripted: null | {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    start: number;
    dur: number;
    nx: number;
    ny: number;
    amp: number;
    resolve: () => void;
  } = null;

  // Trail
  let trailCount = opts.trail ?? 0;
  let dots: HTMLElement[] = [];
  const history: Array<{ x: number; y: number }> = [];

  function buildTrail(n: number) {
    if (!trailLayer) return;
    trailLayer.replaceChildren();
    dots = [];
    for (let i = 0; i < n; i++) {
      const d = document.createElement("div");
      const size = 9 - (i / Math.max(1, n)) * 6;
      d.style.cssText = `position:absolute;left:0;top:0;width:${size}px;height:${size}px;border-radius:999px;background:#BFDBFF;pointer-events:none;will-change:transform,opacity;filter:blur(${0.6 + i * 0.16}px);`;
      d.style.opacity = String(0.34 * (1 - i / Math.max(1, n)));
      trailLayer.appendChild(d);
      dots.push(d);
    }
  }

  buildTrail(trailCount);

  let last = performance.now();

  function frame(now: number) {
    if (!alive) return;
    const dt = Math.min(64, now - last);
    last = now;

    if (scripted) {
      const t = Math.min(1, (now - scripted.start) / scripted.dur);
      const e = easeOutQuint(t);
      const b = bow(t) * scripted.amp;
      x = scripted.fromX + (scripted.toX - scripted.fromX) * e + scripted.nx * b;
      y = scripted.fromY + (scripted.toY - scripted.fromY) * e + scripted.ny * b;
      if (t >= 1) {
        const done = scripted.resolve;
        scripted = null;
        px = x;
        py = y;
        done();
      }
    } else {
      if (x < -9000) {
        x = px;
        y = py;
      }
      // Frame-rate independent exponential smoothing.
      const k = 1 - Math.pow(1 - follow, dt / 16.6667);
      x += (px - x) * k;
      y += (py - y) * k;
    }

    handEl.style.transform = `translate3d(${x}px,${y}px,0)`;

    let trailMoving = false;
    if (dots.length) {
      history.unshift({ x, y });
      if (history.length > dots.length * 2 + 2) history.pop();
      for (let i = 0; i < dots.length; i++) {
        const p = history[Math.min(history.length - 1, i * 2 + 1)];
        if (p) dots[i].style.transform = `translate3d(${p.x}px,${p.y}px,0)`;
      }
      const tail = history[history.length - 1];
      trailMoving = !!tail && Math.hypot(tail.x - x, tail.y - y) > 0.5;
    }

    // Nothing left to move: stop drawing. The overlay is a full-screen
    // window, and redrawing it 60 times a second while the cursor sat
    // still cost a core of CPU plus GPU time — on a throttled laptop that
    // slowed everything else down, the voice included. Any new pointer
    // position or scripted move wakes it again.
    if (!scripted && !trailMoving && Math.abs(px - x) < 0.3 && Math.abs(py - y) < 0.3) {
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(frame);
  }

  /** Start drawing again if it had gone idle. */
  function wake() {
    if (!alive || raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  raf = requestAnimationFrame(frame);

  function pulse(kind: HandPulse) {
    if (kind === "none") return;

    // The instant of a tap: swap to the pointing-finger pose, then settle
    // back to the open palm once the press animation has read clearly.
    const taps = kind === "click" || kind === "double_click" || kind === "right_click";
    if (openEl && pointEl && taps) {
      if (poseTimer) clearTimeout(poseTimer);
      openEl.style.opacity = "0";
      pointEl.style.opacity = "1";
      const settle = kind === "double_click" ? 620 : 420;
      poseTimer = setTimeout(() => {
        pointEl.style.opacity = "0";
        openEl.style.opacity = "1";
        poseTimer = null;
      }, settle);
    }

    const ring = document.createElement("div");
    const tone =
      kind === "right_click" ? "#7C5CFF" : kind === "drag" ? "#4ECDC4" : "#8FC7FF";
    ring.style.cssText = `position:absolute;left:0;top:0;width:0;height:0;border-radius:999px;pointer-events:none;border:2px solid ${tone};will-change:transform,opacity;`;
    ring.style.transform = `translate3d(${x}px,${y}px,0)`;
    host.appendChild(ring);

    const rings = kind === "double_click" ? 2 : 1;
    for (let i = 0; i < rings; i++) {
      ring.animate(
        [
          { width: "0px", height: "0px", marginLeft: "0px", marginTop: "0px", opacity: 0.95 },
          { width: "62px", height: "62px", marginLeft: "-31px", marginTop: "-31px", opacity: 0 },
        ],
        { duration: 460, delay: i * 150, easing: "cubic-bezier(0.16,1,0.3,1)", fill: "forwards" }
      );
    }

    handEl.animate(
      [
        { transform: `translate3d(${x}px,${y}px,0) scale(1)` },
        { transform: `translate3d(${x}px,${y}px,0) scale(0.82)` },
        { transform: `translate3d(${x}px,${y}px,0) scale(1)` },
      ],
      { duration: 300, easing: "cubic-bezier(0.32,0.72,0,1)" }
    );

    setTimeout(() => ring.remove(), 900);
  }

  return {
    setPointer(nx, ny) {
      px = nx;
      py = ny;
      if (x < -9000) {
        x = nx;
        y = ny;
      }
      wake();
    },
    animateTo(tx, ty, durationMs) {
      return new Promise<void>((resolve) => {
        if (scripted) scripted.resolve();
        const dx = tx - x;
        const dy = ty - y;
        const len = Math.hypot(dx, dy) || 1;
        scripted = {
          fromX: x,
          fromY: y,
          toX: tx,
          toY: ty,
          start: performance.now(),
          dur: Math.max(90, durationMs),
          // Perpendicular unit vector for the bow.
          nx: -dy / len,
          ny: dx / len,
          amp: Math.min(56, len * 0.13),
          resolve,
        };
        wake();
      });
    },
    release() {
      if (scripted) {
        const done = scripted.resolve;
        scripted = null;
        done();
      }
    },
    pulse,
    position: () => ({ x, y }),
    setTrail(n) {
      trailCount = n;
      buildTrail(n);
      history.length = 0;
      wake();
    },
    destroy() {
      alive = false;
      cancelAnimationFrame(raf);
      if (poseTimer) clearTimeout(poseTimer);
      if (trailLayer) trailLayer.replaceChildren();
    },
  };
}
