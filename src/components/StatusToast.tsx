import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, CheckCircle2, GripVertical, Hand, Info, Pause, Play, RotateCcw, Square } from "lucide-react";
import { api, emit, EV } from "../lib/ipc";
import { useIzuki } from "../lib/store";

const ICONS = {
  info: <Info size={14} strokeWidth={2.4} />,
  working: (
    <span className="relative flex h-[14px] w-[14px] items-center justify-center" aria-hidden>
      <span className="absolute inset-0 rounded-full bg-current opacity-25 motion-safe:animate-ping" />
      <span className="h-[6px] w-[6px] rounded-full bg-current" />
    </span>
  ),
  success: <CheckCircle2 size={14} strokeWidth={2.4} />,
  error: <AlertTriangle size={14} strokeWidth={2.4} />,
} as const;

const TONE = {
  info: "text-izk-muted",
  working: "text-izk-teal",
  success: "text-izk-good",
  error: "text-izk-danger",
} as const;

type Step = { current: number; total: number; before: boolean };

function readStep(status: { message: string; detail?: string | null }): Step | null {
  const text = `${status.message} ${status.detail ?? ""}`;
  const hit = /step\s+(\d+)\s+(?:of|\/)\s+(\d+)/i.exec(text);
  if (!hit) return null;
  const total = Math.max(1, Number.parseInt(hit[2], 10) || 1);
  const current = Math.min(total, Math.max(1, Number.parseInt(hit[1], 10) || 1));
  // "Paused before step 3", "a fresh look first, then step 3": not begun.
  return { current, total, before: /(?:before|then)\s+step\s+\d+/i.test(text) };
}

/**
 * Where the user left the task card, and how wide. It is the thing that sits
 * on top of whatever they're doing while Izuki works, so it has to be able to
 * get out of the way: drag it anywhere, drag its corner to make it smaller or
 * wider, and it stays there next time. Double-click it to put it back.
 */
type Spot = { x: number; y: number; w: number };
const SPOT_KEY = "izuki.task.stage";
const MIN_W = 240;
const MAX_W = 620;

function clamp(spot: Spot): Spot {
  if (typeof window === "undefined") return spot;
  const w = Math.min(Math.max(MIN_W, spot.w), MAX_W, Math.max(MIN_W, window.innerWidth - 16));
  return {
    w,
    x: Math.min(Math.max(8, spot.x), Math.max(8, window.innerWidth - w - 8)),
    y: Math.min(Math.max(8, spot.y), Math.max(8, window.innerHeight - 80)),
  };
}

function loadSpot(): Spot | null {
  try {
    const raw = localStorage.getItem(SPOT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Spot>;
    if (typeof parsed.x !== "number" || typeof parsed.y !== "number" || typeof parsed.w !== "number") return null;
    return clamp({ x: parsed.x, y: parsed.y, w: parsed.w });
  } catch {
    return null;
  }
}

export function StatusToast() {
  const status = useIzuki((s) => s.status);
  const working = status?.kind === "working";
  const taskPaused = !!status && /^paused\b/i.test(status.message.trim());
  const pausing = working && /^pausing\b/i.test(status.message.trim());
  const step = status ? readStep(status) : null;
  const stepDone = step ? (step.before ? step.current - 1 : step.current) : 0;
  const stepPct = step ? Math.max(0, Math.min(100, (stepDone / step.total) * 100)) : 0;
  const paused = !!status && !working && /keep going|paused|stopped here|stuck|unfinished/i.test(`${status.message} ${status.detail ?? ""}`);
  const takeOver = () => void api.cancelTask();
  const keepGoing = () => void emit(EV.runChat, { id: Date.now(), text: "keep going" });

  // ---- moved, resized, remembered -----------------------------------------
  const [spot, setSpot] = useState<Spot | null>(() => loadSpot());
  const [moving, setMoving] = useState(false);
  const grab = useRef<{ dx: number; dy: number } | null>(null);
  const grip = useRef<{ x: number; w: number } | null>(null);

  const keep = (next: Spot) => {
    const fixed = clamp(next);
    setSpot(fixed);
    try {
      localStorage.setItem(SPOT_KEY, JSON.stringify(fixed));
    } catch {
      /* it just won't be remembered */
    }
  };

  // A smaller window must never leave it off the edge.
  useEffect(() => {
    if (!spot) return;
    const onResize = () => setSpot((s) => (s ? clamp(s) : s));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [spot]);

  const startMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Buttons, links and text stay clickable: dragging starts anywhere else.
    if ((e.target as HTMLElement).closest("button,a,input,textarea,select")) return;
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const el = e.currentTarget;
    const box = el.getBoundingClientRect();
    grab.current = { dx: e.clientX - box.left, dy: e.clientY - box.top };
    el.setPointerCapture(e.pointerId);
    setMoving(true);
    // First drag on an un-moved card: start from where it actually is.
    if (!spot) keep({ x: box.left, y: box.top, w: box.width });
  };
  const moveTo = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!grab.current) return;
    const w = spot?.w ?? e.currentTarget.getBoundingClientRect().width;
    keep({ x: e.clientX - grab.current.dx, y: e.clientY - grab.current.dy, w });
  };
  const endMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!grab.current) return;
    grab.current = null;
    setMoving(false);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };
  const startResize = (e: React.PointerEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    const box = e.currentTarget.parentElement?.getBoundingClientRect();
    grip.current = { x: e.clientX, w: spot?.w ?? box?.width ?? MIN_W };
    e.currentTarget.setPointerCapture(e.pointerId);
    if (!spot && box) keep({ x: box.left, y: box.top, w: box.width });
  };
  const resizeTo = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (!grip.current) return;
    e.stopPropagation();
    const w = grip.current.w + (e.clientX - grip.current.x);
    keep({ ...(spot ?? { x: 0, y: 0, w: grip.current.w }), w });
  };
  const endResize = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (!grip.current) return;
    grip.current = null;
    e.stopPropagation();
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };
  const putBack = () => {
    grab.current = null;
    grip.current = null;
    setMoving(false);
    setSpot(null);
    try {
      localStorage.removeItem(SPOT_KEY);
    } catch {
      /* nothing to forget */
    }
  };

  return (
    <AnimatePresence>
      {status && (
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={spot ? "pointer-events-none fixed z-[60]" : "pointer-events-none relative z-30 mx-[18px] mb-2"}
          style={spot ? { left: spot.x, top: spot.y, width: spot.w } : undefined}
        >
          <div
            role="status"
            aria-live="polite"
            data-kind={status.kind}
            data-paused={taskPaused ? "true" : undefined}
            data-moved={spot ? "true" : undefined}
            onPointerDown={startMove}
            onPointerMove={moveTo}
            onPointerUp={endMove}
            onPointerCancel={endMove}
            onDoubleClick={putBack}
            title={spot ? "Drag to move it — double-click to put it back" : undefined}
            className="izk-card izk-status-card pointer-events-auto relative flex items-start gap-2.5 px-3.5 py-2.5 shadow-[0_18px_44px_rgba(0,0,0,0.55)]"
            style={{ touchAction: moving ? "none" : "auto", cursor: spot ? (moving ? "grabbing" : "grab") : undefined }}
          >
            <span className={`mt-[1px] shrink-0 ${taskPaused ? "text-izk-hand" : TONE[status.kind]}`}>
              {taskPaused ? <Pause size={14} strokeWidth={2.4} /> : ICONS[status.kind]}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-medium text-izk-ink">{status.message}</div>
              {status.detail && (
                <div className="mt-0.5 line-clamp-2 text-[10.5px] leading-snug text-izk-muted">
                  {status.detail}
                </div>
              )}
              {step && (
                <div className="mt-2">
                  <div className="flex items-center justify-between gap-2 text-[10px] leading-none">
                    <span className="font-medium text-izk-ink/75">
                      {taskPaused
                        ? step.before
                          ? `Holding before step ${step.current}`
                          : `Holding after step ${step.current}`
                        : step.before
                          ? `Ready for step ${step.current}`
                          : `Step ${step.current}`}
                    </span>
                    <span className="font-mono text-izk-muted">
                      {step.current}/{step.total}
                    </span>
                  </div>
                  <div
                    className="izk-status-progress mt-1.5"
                    data-paused={taskPaused ? "true" : undefined}
                    role="progressbar"
                    aria-label={`Step ${step.current} of ${step.total}`}
                    aria-valuemin={0}
                    aria-valuemax={step.total}
                    aria-valuenow={stepDone}
                  >
                    <span style={{ width: `${stepPct}%` }} />
                  </div>
                </div>
              )}
              {(working || paused) && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {working && (
                    <>
                      <button
                        type="button"
                        onClick={() => void api.pauseTask()}
                        disabled={pausing}
                        className="izk-pill izk-no-drag inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-izk-teal disabled:cursor-default disabled:opacity-45"
                        title={pausing ? "Already holding after this step" : "Pause after this step"}
                      >
                        <Pause size={10} fill="currentColor" />
                        {pausing ? "Pausing…" : "Pause"}
                      </button>
                      <button
                        type="button"
                        onClick={takeOver}
                        className="izk-pill izk-no-drag inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-izk-ink"
                        title="Stop Izuki and take the mouse yourself"
                      >
                        <Hand size={11} />
                        Take over
                      </button>
                      <button
                        type="button"
                        onClick={takeOver}
                        className="izk-pill izk-no-drag inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-izk-danger"
                        title="Stop this task (Esc)"
                      >
                        <Square size={10} fill="currentColor" />
                        Stop
                      </button>
                    </>
                  )}
                  {taskPaused && (
                    <>
                      <button
                        type="button"
                        onClick={() => void api.resumeTask()}
                        className="izk-pill izk-no-drag inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-izk-teal"
                        title="Continue the paused task"
                      >
                        <Play size={10} fill="currentColor" />
                        Resume
                      </button>
                      <button
                        type="button"
                        onClick={takeOver}
                        className="izk-pill izk-no-drag inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-izk-danger"
                        title="Stop this task (Esc)"
                      >
                        <Square size={10} fill="currentColor" />
                        Stop
                      </button>
                    </>
                  )}
                  {paused && !taskPaused && (
                    <button
                      type="button"
                      onClick={keepGoing}
                      className="izk-pill izk-no-drag inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-izk-teal"
                      title="Pick the interrupted task up where it stopped"
                    >
                      <RotateCcw size={11} />
                      Keep going
                    </button>
                  )}
                </div>
              )}
            </div>
            {/* The move grip says it can be moved; dragging works anywhere
                that isn't a button. Double-click puts it back. */}
            <span
              aria-hidden
              data-izk-hit
              className="mt-[1px] shrink-0 cursor-grab text-izk-muted/60 transition hover:text-izk-ink"
              title={spot ? "Drag to move — double-click to put it back" : "Drag to move this card"}
            >
              <GripVertical size={13} />
            </span>
            {/* Corner: drag to make it narrower or wider. */}
            <span
              aria-hidden
              role="presentation"
              onPointerDown={startResize}
              onPointerMove={resizeTo}
              onPointerUp={endResize}
              onPointerCancel={endResize}
              title="Drag the corner to resize"
              className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 cursor-nwse-resize rounded-br-[8px] border-b-2 border-r-2 border-izk-muted/40 transition hover:border-izk-ink"
              style={{ touchAction: "none" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
