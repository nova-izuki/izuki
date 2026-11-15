import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, ChevronUp, Pause, Play, RotateCcw, Square } from "lucide-react";
import { api, EV, on } from "../lib/ipc";
import type { StatusEvent } from "../lib/types";

type Step = { current: number; total: number; before: boolean };
type Pending = "pause" | "resume" | "stop" | "rerun" | null;
type TrailItem = { n: number; label: string; at: number };

function clock(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function totalFrom(status: StatusEvent | null): number {
  if (!status) return 0;
  const hit = /(\d+)\s+steps?\s+ready/i.exec(`${status.message} ${status.detail ?? ""}`);
  return hit ? Math.max(1, Number.parseInt(hit[1], 10) || 1) : 0;
}

/** Same quiet step grammar the status card uses ("Step 2 of 5"). */
function readStep(status: StatusEvent | null): Step | null {
  if (!status) return null;
  // Accept both "Step 2 of 5" and the compact "Step 1/4" form.
  const hit = /step\s+(\d+)\s*(?:of|\/)\s*(\d+)/i.exec(`${status.message} ${status.detail ?? ""}`);
  if (!hit) return null;
  const total = Math.max(1, Number.parseInt(hit[2], 10) || 1);
  const current = Math.min(total, Math.max(1, Number.parseInt(hit[1], 10) || 1));
  return { current, total, before: /(?:before|then)\s+step\s+\d+/i.test(`${status.message} ${status.detail ?? ""}`) };
}

/** A status that means there is no task left to show. */
function ended(status: StatusEvent): boolean {
  return (
    status.kind === "success" ||
    status.kind === "error" ||
    /^(stopped|nothing|no active|you took over)\b/i.test(status.message.trim())
  );
}

/**
 * A small, contained view of a real desktop task.
 *
 * It is deliberately a view, not a separate desktop: Izuki still drives the
 * actual PC underneath it. The glass stage just keeps the plan, the current
 * step and the stop controls in one place — and stays out of the way when no
 * task is running.
 */
export function TaskStage({ onActiveChange }: { onActiveChange?: (active: boolean) => void }) {
  const [status, setStatus] = useState<StatusEvent | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [total, setTotal] = useState(0);
  // Kept across "Pausing…"/"Continuing…" lines, which carry no step number.
  const [step, setStep] = useState<Step | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [trail, setTrail] = useState<TrailItem[]>([]);
  const [startedAt, setStartedAt] = useState(0);
  const [clockMs, setClockMs] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const startedRef = useRef(0);
  const lastNumber = useRef(0);
  const lastTotal = useRef(0);
  const liveRef = useRef(false);

  useEffect(() => {
    let alive = true;
    let off: (() => void) | undefined;
    void on<StatusEvent>(EV.status, (next) => {
      if (alive) setStatus(next);
    }).then((stop) => {
      off = stop;
      if (!alive) stop();
    });
    return () => {
      alive = false;
      off?.();
    };
  }, []);

  // The overlay can finish loading just after "Task Stage is ready" was sent.
  // Ask for the last task line; an event that arrived first wins.
  useEffect(() => {
    let alive = true;
    void api.taskStatus().then((last) => {
      if (alive && last) setStatus((prev) => prev ?? last);
    }).catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!status) setCollapsed(false);
  }, [status]);

  // The stage keeps the steps it has already finished, so a long task reads
  // as a short plan rather than a single line that replaces itself. This is
  // built only from real per-step results — nothing here is invented.
  useEffect(() => {
    const reset = () => {
      setTrail([]);
      startedRef.current = 0;
      setStartedAt(0);
      lastNumber.current = 0;
      lastTotal.current = 0;
    };
    if (!status) { reset(); return; }
    const numbered = readStep(status);
    const announced = totalFrom(status);
    if (numbered?.before) {
      if (!lastTotal.current || lastTotal.current !== numbered.total || lastNumber.current > 0) {
        setTrail([]);
        lastNumber.current = 0;
      }
      lastTotal.current = numbered.total;
      if (!startedRef.current) {
        startedRef.current = Date.now();
        setStartedAt(startedRef.current);
      }
      return;
    }
    if (announced && !numbered) {
      lastTotal.current = announced;
      if (!startedRef.current) {
        startedRef.current = Date.now();
        setStartedAt(startedRef.current);
      }
      return;
    }
    if (!numbered) return;
    if (!lastTotal.current || lastTotal.current !== numbered.total) {
      setTrail([]);
      lastNumber.current = 0;
    }
    lastTotal.current = numbered.total;
    if (!startedRef.current) {
      startedRef.current = Date.now();
      setStartedAt(startedRef.current);
    }
    if (numbered.current > lastNumber.current) {
      const label = (status.detail || status.message || "").trim();
      if (label && !/^step\s+\d+\s*$/i.test(label)) {
        setTrail((previous) => [
          ...previous.filter((item) => item.n !== numbered.current),
          { n: numbered.current, label, at: Date.now() },
        ].slice(-24));
      }
      lastNumber.current = numbered.current;
    }
  }, [status]);

  // Keep the last real progress while a short status ("Pausing after this
  // step…", "Continuing…") has no numbers of its own. The final step stays
  // visible on the completion card, so only "nothing at all" clears it.
  useEffect(() => {
    if (!status) {
      setTotal(0);
      setStep(null);
      return;
    }
    if (ended(status)) {
      const finalStep = readStep(status);
      if (finalStep) {
        setStep(finalStep);
        setTotal(finalStep.total);
      }
      return;
    }
    const numbered = readStep(status);
    if (numbered) {
      setStep(numbered);
      setTotal(numbered.total);
      return;
    }
    const announced = totalFrom(status);
    if (announced && announced !== total) {
      setTotal(announced);
      // The start event names the plan before the first click; this is what
      // lets the stage appear while Izuki is still taking its first look.
      setStep({ current: 1, total: announced, before: true });
    }
  }, [status, total]);

  // A new status answers the last button press; do not leave it disabled.
  useEffect(() => {
    setPending(null);
  }, [status]);

  // Only a task that was actually live on this stage gets a finish card: an
  // old final line replayed when the overlay mounts is not a new completion.
  useEffect(() => {
    if (!status) {
      liveRef.current = false;
      setDismissed(false);
      return;
    }
    if (!ended(status)) {
      liveRef.current = true;
      setDismissed(false);
    }
  }, [status]);

  const pausing = !!status && /^pausing\b/i.test(status.message.trim());
  const paused = !!status && /^(pausing|paused)\b/i.test(status.message.trim());
  const working = !!status && status.kind === "working";
  const continuing = !!status && /^(resuming|continuing)\b/i.test(status.message.trim());
  const finished = !!status && ended(status) && total > 0 && liveRef.current && !dismissed;
  const complete = !!status && status.kind === "success" && finished;
  const active = !!status && total > 0 && (working || paused || continuing || finished);

  useEffect(() => {
    if (!finished) return;
    const timer = window.setTimeout(() => {
      setDismissed(true);
      setStatus(null);
    }, 30_000);
    return () => window.clearTimeout(timer);
  }, [finished, status]);

  useEffect(() => {
    if (!active) return;
    setClockMs(Date.now());
    const timer = window.setInterval(() => setClockMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  useEffect(() => {
    onActiveChange?.(active);
    return () => onActiveChange?.(false);
  }, [active, onActiveChange]);

  if (!active) return null;

  const done = complete ? total : step ? Math.max(0, step.before ? step.current - 1 : step.current) : 0;
  const percent = complete ? 100 : Math.max(0, Math.min(100, Math.round((done / total) * 100)));
  const currentLabel = finished
    ? complete
      ? `All ${total} steps finished`
      : "Task ended"
    : step
      ? step.before
        ? `Ready for step ${step.current}`
        : `Step ${step.current}`
      : "Preparing the first step";
  // Before the first action the step is "ready" but not done, so the count
  // and the bar agree at zero. After it, the step number is complete.
  const elapsed = startedAt ? clock(clockMs - startedAt) : "0:00";
  const countLabel = `${done}/${total}${startedAt ? ` · ${elapsed}` : ""}`;
  const recentTrail = trail.slice(-4);

  const run = (kind: Exclude<Pending, null>, command: () => Promise<unknown>) => {
    if (pending) return;
    setPending(kind);
    void command().finally(() => setPending(null));
  };

  const dismiss = () => {
    setDismissed(true);
    setStatus(null);
  };
  const rerun = () => {
    if (pending) return;
    setPending("rerun");
    void api.rerunTask()
      .then((ok) => { if (ok) { setDismissed(true); setStatus(null); } })
      .finally(() => setPending(null));
  };

  return (
    <div data-izk-task className="pointer-events-none fixed inset-x-0 top-[58px] z-[70] flex justify-center px-3">
      <AnimatePresence initial={false}>
        {collapsed ? (
          <motion.div
            key="pill"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            data-izk-hit
            className="izk-task-pill pointer-events-auto"
          >
            <span className="izk-task-live-dot" aria-hidden />
            <span className="izk-task-pill-text">Task Stage · {finished ? (complete ? "complete" : "ended") : step ? `${step.current}/${total}` : "working"}</span>
            <button type="button" aria-label="Expand Task Stage" title="Expand" onClick={() => setCollapsed(false)}>
              <ChevronDown size={13} />
            </button>
          </motion.div>
        ) : (
          <motion.section
            key="stage"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            data-izk-hit
            data-finished={finished ? "true" : undefined}
            aria-label="Izuki Task Stage"
            className="izk-task-stage pointer-events-auto"
          >
            <header className="izk-task-head">
              <span className="izk-task-mark" aria-hidden><i /><i /><i /></span>
              <div className="izk-task-heading">
                <b>Task Stage</b>
                <span>{finished ? (complete ? "Finished on your desktop" : "This task ended") : pausing ? "Pausing after this step" : paused ? "Holding after this step" : step ? (step.before ? `Ready for step ${step.current}` : "Working on your desktop") : "Getting the first step ready"}</span>
              </div>
              <span className="izk-task-state" data-paused={paused || pausing ? "true" : undefined} data-finished={finished ? "true" : undefined} data-ended={finished && !complete ? "true" : undefined}>
                <i aria-hidden />
                {finished ? (complete ? "Complete" : "Ended") : pausing ? "Pausing" : paused ? "Paused" : "Live"}
              </span>
              <button
                type="button"
                data-izk-hit
                aria-label="Collapse Task Stage"
                title="Collapse"
                onClick={() => setCollapsed(true)}
                className="izk-task-collapse"
              >
                <ChevronUp size={13} />
              </button>
            </header>

            <div aria-live="polite" aria-atomic="true">
              <div className="izk-task-message">{finished && complete ? "Complete" : status?.message}</div>
              {status?.detail && <p className="izk-task-detail">{status.detail}</p>}
            </div>

            {recentTrail.length > 0 && (
              <div className="izk-task-trail" aria-label="Completed steps">
                <span className="izk-task-trail-label">{finished ? "Finished steps" : "Plan so far"}</span>
                <ol>
                  {recentTrail.map((item) => (
                    <li key={item.n}>
                      <span className="tick" aria-hidden>✓</span>
                      <span className="label">{item.label}</span>
                      <time>{startedAt ? clock(item.at - startedAt) : ""}</time>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="izk-task-progress-wrap">
              <div className="izk-task-progress-label">
                <span>{currentLabel}</span>
                <span>{countLabel}</span>
              </div>
              <div
                className="izk-task-progress"
                role="progressbar"
                aria-label={step ? `Step ${step.current} of ${step.total}` : `${total} steps ready`}
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={done}
              >
                <span style={{ width: `${percent}%` }} />
              </div>
            </div>

            <div className="izk-task-actions">
              {finished ? (
                <>
                  {complete && (
                    <button
                      type="button"
                      data-izk-hit
                      className="izk-task-button primary"
                      disabled={pending !== null}
                      onClick={rerun}
                    >
                      <RotateCcw size={11} /> {pending === "rerun" ? "Starting…" : "Run it again"}
                    </button>
                  )}
                  <button type="button" data-izk-hit className="izk-task-button" onClick={dismiss}>
                    <Check size={11} /> Done
                  </button>
                </>
              ) : paused && !pausing ? (
                <button
                  type="button"
                  data-izk-hit
                  className="izk-task-button primary"
                  disabled={pending !== null}
                  onClick={() => run("resume", () => api.resumeTask())}
                >
                  <Play size={11} fill="currentColor" /> {pending === "resume" ? "Resuming…" : "Resume"}
                </button>
              ) : (
                <button
                  type="button"
                  data-izk-hit
                  className="izk-task-button primary"
                  disabled={pausing || pending !== null}
                  onClick={() => run("pause", () => api.pauseTask())}
                >
                  <Pause size={11} fill="currentColor" /> {pausing || pending === "pause" ? "Pausing…" : "Pause after step"}
                </button>
              )}
              {!finished && (
                <button
                  type="button"
                  data-izk-hit
                  className="izk-task-button danger"
                  disabled={pending === "stop"}
                  onClick={() => run("stop", () => api.cancelTask())}
                  title="Stop this task and take the mouse yourself"
                >
                  <Square size={10} fill="currentColor" /> {pending === "stop" ? "Stopping…" : "Stop"}
                </button>
              )}
            </div>

            <p className="izk-task-foot">{finished ? "The stage closes on its own in 30 seconds. Your desktop is yours again." : "A view of the real task — move your mouse to take over, or Stop to end it. This is not a hidden desktop."}</p>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
