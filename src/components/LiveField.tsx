import { useEffect, useRef } from "react";
import { createLiveField } from "../../docs/app/live-field.js";
import { EV, on } from "../lib/ipc";
import { useIzuki } from "../lib/store";

type LiveState = "idle" | "listening" | "thinking" | "working";

/**
 * The live field — real-time graphics for the PC app.
 *
 * A GPU field of light behind the glass (docs/app/live-field.js, the same
 * fragment shader the VR room draws), moving with what Izuki is actually
 * doing: breathing with your mic while it listens, swirling with a scan line
 * while it thinks, spiking on every step it takes while it works.
 *
 * It costs what it shows: 30 frames a second while there's something to
 * watch, 8 while it drifts at rest, and not one frame while the panel is
 * hidden, unfocused (the app's own `izk-away` class) or the person asked for
 * reduced motion — then it draws a single still and stops.
 */
export function LiveField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const voice = useIzuki((s) => s.voice);
  const status = useIzuki((s) => s.status);

  // The loop reads these two, so a state change never restarts it.
  const state = (voice.busy ? "thinking" : voice.active ? "listening" : status?.kind === "working" ? "working" : "idle") as LiveState;
  const stateRef = useRef<LiveState>(state);
  stateRef.current = state;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const field = createLiveField(canvas, { opacity: 0.9 });
    if (!field) return;
    const surface = field.canvas;
    if (surface !== canvas) canvas.replaceWith(surface);

    const box = surface.parentElement;
    const fit = () => {
      const rect = box?.getBoundingClientRect();
      field.resize(rect?.width || surface.clientWidth, rect?.height || surface.clientHeight, window.devicePixelRatio || 1);
    };
    fit();

    // Your voice, and a spike for every step the core takes.
    let level = 0;
    let pulse = 0;
    const offLevel = on<number>(EV.voiceLevel, (l) => { level = typeof l === "number" ? Math.max(0, Math.min(1, l)) : 0; });
    const offTrace = on<string>(EV.trace, () => { pulse = 1; });

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      raf = 0;
      // Nobody is looking: the field costs nothing at all.
      if (document.hidden || document.documentElement.classList.contains("izk-away")) return;
      if (calm.matches) {
        field.still(stateRef.current, level);
        return;
      }
      raf = requestAnimationFrame(tick);
      const elapsed = (now - last) / 1000;
      const at = stateRef.current;
      // A soft field reads as smooth at 30; at rest it only drifts.
      if (elapsed + 0.000001 < 1 / (at === "idle" ? 8 : 30)) return;
      last = now;
      field.pulse(pulse);
      pulse *= 0.92;
      field.frame(at, level, Math.min(0.1, elapsed));
    };
    const restart = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    calm.addEventListener("change", restart);
    document.addEventListener("visibilitychange", restart);
    const focusWatcher = new MutationObserver(restart);
    focusWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const watcher = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => { fit(); restart(); });
    if (box && watcher) watcher.observe(box);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      calm.removeEventListener("change", restart);
      document.removeEventListener("visibilitychange", restart);
      focusWatcher.disconnect();
      void offLevel.then((f) => f());
      void offTrace.then((f) => f());
      watcher?.disconnect();
      field.dispose();
      // React retains the original ref, including during StrictMode's remount.
      if (surface !== canvas) surface.replaceWith(canvas);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" />;
}
