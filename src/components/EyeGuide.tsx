import { useState } from "react";

const SEEN_KEY = "izuki.eye-guide.seen.v1";

function seen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Storage can be unavailable; the guide just shows again next time.
  }
}

/**
 * The first time Eye Control is chosen: how to stop it, how to calibrate,
 * and what "preview" means (the eye cursor is drawn; the mouse doesn't
 * move). Three short steps, then it stays out of the way; "How Eye Control
 * works" opens it again.
 */
export function EyeGuide({ stopKey, talkKey, mouse }: { stopKey: string; talkKey: string; mouse: boolean }) {
  const [open, setOpen] = useState(() => !seen());
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: "🛑",
      title: "Stopping it, any time",
      body: (
        <>
          Press <kbd className="rounded bg-white/15 px-1 font-semibold text-white">{stopKey}</kbd>, press the red <b>■ Stop</b> on screen, or hold
          your talk key (<kbd className="rounded bg-white/15 px-1 font-semibold text-white">{talkKey}</kbd>) and say “stop eye control” (with “Hey
          Izuki” on, just say it). Moving your own mouse or typing pauses it too. If the camera is unplugged or another app takes it, Eye Control stops
          steering at once and picks the camera back up by itself.
        </>
      ),
    },
    {
      icon: "🎯",
      title: "Calibrating",
      body: (
        <>
          Sit the way you'll sit, with your face lit. Press <b>Calibrate eyes</b> and look at each of the nine dots until it fills; keep your head
          still, only your eyes move. Five check dots follow to measure how accurate it is. If you lean, turn or move later, Izuki tells you, and a
          quick recalibration fixes it.
        </>
      ),
    },
    {
      icon: "👁️",
      title: "What “preview” means",
      body: mouse ? (
        <>
          On this PC the accuracy check passed, so the <b>real mouse follows</b> a steady look (moving your own mouse or typing pauses it). Until a
          check passes, Izuki only draws an eye cursor and the mouse stays where it is. Single blinks never click.
        </>
      ) : (
        <>
          This version draws an <b>eye cursor</b> where you look, and the real mouse stays where it is. Moving the mouse with your eyes comes after a
          supervised accuracy test on your camera. Single blinks never click.
        </>
      ),
    },
  ];

  if (!open) {
    return (
      <button type="button" onClick={() => { setStep(0); setOpen(true); }} className="izk-no-drag mt-2 text-[10.5px] font-medium text-sky-200 hover:underline">
        How Eye Control works →
      </button>
    );
  }

  const s = steps[step];
  const last = step === steps.length - 1;
  const done = () => {
    markSeen();
    setOpen(false);
  };

  return (
    <div role="dialog" aria-label="How Eye Control works" className="mt-2 rounded-2xl border border-sky-300/30 bg-sky-400/[0.09] p-3 text-sky-50">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-sky-200/80">Before you start · {step + 1} of {steps.length}</span>
        <button type="button" onClick={done} className="izk-no-drag text-[10.5px] text-sky-200/80 hover:text-white">
          Skip
        </button>
      </div>
      <p className="mt-1.5 flex items-center gap-2 text-[12.5px] font-semibold text-white">
        <span aria-hidden>{s.icon}</span>
        {s.title}
      </p>
      <p className="mt-1 text-[11px] leading-relaxed">{s.body}</p>
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span aria-hidden className="flex gap-1">
          {steps.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-4 bg-sky-200" : "w-1.5 bg-sky-200/35"}`} />
          ))}
        </span>
        <span className="flex gap-1.5">
          {step > 0 && (
            <button type="button" onClick={() => setStep(step - 1)} className="izk-no-drag rounded-full px-2.5 py-1 text-[11px] text-sky-100 hover:bg-white/10">
              Back
            </button>
          )}
          <button type="button" onClick={() => (last ? done() : setStep(step + 1))} className="izk-no-drag rounded-full bg-sky-300 px-3 py-1 text-[11px] font-semibold text-slate-900 hover:bg-sky-200">
            {last ? "Got it" : "Next"}
          </button>
        </span>
      </div>
    </div>
  );
}
