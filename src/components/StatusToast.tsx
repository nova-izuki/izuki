import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, CheckCircle2, Hand, Info, Pause, Play, RotateCcw, Square } from "lucide-react";
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

  return (
    <AnimatePresence>
      {status && (
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none relative z-30 mx-[18px] mb-2"
        >
          <div
            role="status"
            aria-live="polite"
            data-kind={status.kind}
            data-paused={taskPaused ? "true" : undefined}
            className="izk-card izk-status-card pointer-events-auto flex items-start gap-2.5 px-3.5 py-2.5 shadow-[0_18px_44px_rgba(0,0,0,0.55)]"
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
