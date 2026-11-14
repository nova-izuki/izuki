import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronUp, Hand, Pause, Play, Square } from "lucide-react";
import { api, EV, on } from "../lib/ipc";
import type { StatusEvent } from "../lib/types";

type Step = { current: number; total: number; before: boolean };

/** Same quiet step grammar the status card uses ("Step 2 of 5"). */
function readStep(status: StatusEvent | null): Step | null {
  if (!status) return null;
  const hit = /step\s+(\d+)\s+(?:of|\/)\s+(\d+)/i.exec(`${status.message} ${status.detail ?? ""}`);
  if (!hit) return null;
  const total = Math.max(1, Number.parseInt(hit[2], 10) || 1);
  const current = Math.min(total, Math.max(1, Number.parseInt(hit[1], 10) || 1));
  return { current, total, before: /(?:before|then)\s+step\s+\d+/i.test(`${status.message} ${status.detail ?? ""}`) };
}

/**
 * A small, contained view of a real desktop task.
 *
 * It is deliberately a view, not a separate desktop: Izuki still drives the
 * actual PC underneath it. The glass stage just keeps the plan, the current
 * step and the stop controls in one place — and stays out of the way when no
 * task is running.
 */
export function TaskStage() {
  const [status, setStatus] = useState<StatusEvent | null>(null);
  const [collapsed, setCollapsed] = useState(false);

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

  useEffect(() => {
    if (!status) setCollapsed(false);
  }, [status]);

  const step = readStep(status);
  const paused = !!status && /^(pausing|paused)\b/i.test(status.message.trim());
  const working = !!status && status.kind === "working";
  // Don't turn every passing status line into a panel. A real task has a
  // step count, or is explicitly waiting at a pause point.
  const visible = !!status && (working && !!step || paused && !!step);
  if (!visible) return null;

  const done = step ? (step.before ? step.current - 1 : step.current) : 0;
  const percent = step ? Math.max(0, Math.min(100, Math.round((done / step.total) * 100))) : 0;
  const pausing = !!status && /^pausing\b/i.test(status.message);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[58px] z-[70] flex justify-center px-3">
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
            <span className="izk-task-pill-text">Task Stage · {step ? `${step.current}/${step.total}` : "working"}</span>
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
            aria-label="Izuki Task Stage"
            className="izk-task-stage pointer-events-auto"
          >
            <header className="izk-task-head">
              <span className="izk-task-mark" aria-hidden><i /><i /><i /></span>
              <div className="izk-task-heading">
                <b>Task Stage</b>
                <span>{paused ? "Holding after this step" : "Working on your desktop"}</span>
              </div>
              <span className="izk-task-state" data-paused={paused || pausing ? "true" : undefined}>
                <i aria-hidden />
                {pausing ? "Pausing" : paused ? "Paused" : "Live"}
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

            <div className="izk-task-message">{status?.message}</div>
            {status?.detail && <p className="izk-task-detail">{status.detail}</p>}

            {step && (
              <div className="izk-task-progress-wrap">
                <div className="izk-task-progress-label">
                  <span>{step.before ? `Ready for step ${step.current}` : `Step ${step.current}`}</span>
                  <span>{step.current}/{step.total}</span>
                </div>
                <div
                  className="izk-task-progress"
                  role="progressbar"
                  aria-label={`Step ${step.current} of ${step.total}`}
                  aria-valuemin={0}
                  aria-valuemax={step.total}
                  aria-valuenow={done}
                >
                  <span style={{ width: `${percent}%` }} />
                </div>
              </div>
            )}

            <div className="izk-task-actions">
              {paused ? (
                <button type="button" data-izk-hit className="izk-task-button primary" onClick={() => void api.resumeTask()}>
                  <Play size={11} fill="currentColor" /> Resume
                </button>
              ) : (
                <button
                  type="button"
                  data-izk-hit
                  className="izk-task-button primary"
                  disabled={pausing}
                  onClick={() => void api.pauseTask()}
                >
                  <Pause size={11} fill="currentColor" /> {pausing ? "Pausing…" : "Pause after step"}
                </button>
              )}
              <button
                type="button"
                data-izk-hit
                className="izk-task-button"
                onClick={() => void api.cancelTask()}
                title="Stop Izuki and take the mouse yourself"
              >
                <Hand size={11} /> Take over
              </button>
              <button
                type="button"
                data-izk-hit
                className="izk-task-button danger"
                onClick={() => void api.cancelTask()}
                title="Stop this task"
              >
                <Square size={10} fill="currentColor" /> Stop
              </button>
            </div>

            <p className="izk-task-foot">A view of the real task. This is not a separate or hidden desktop.</p>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
