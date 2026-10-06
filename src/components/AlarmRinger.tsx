import { useEffect, useRef, useState } from "react";
import { AlarmClock, BellOff, Clock } from "lucide-react";
import { api, EV, on } from "../lib/ipc";

interface Ringing {
  id: string;
  text: string;
  at: number;
}

/** How long an alarm rings before it snoozes itself (nobody's there). */
const RING_MAX_MS = 5 * 60_000;

/**
 * A soft-then-insistent alarm tone: two notes, a pause, again — a little
 * louder each round, like a phone alarm. Returns a stop function.
 */
function ring(): () => void {
  const ctx = new AudioContext();
  const out = ctx.createGain();
  out.gain.value = 0.15;
  out.connect(ctx.destination);
  let stopped = false;
  let round = 0;
  const beep = (at: number, freq: number) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(1, at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, at + 0.35);
    o.connect(g).connect(out);
    o.start(at);
    o.stop(at + 0.4);
  };
  const tick = () => {
    if (stopped) return;
    const t = ctx.currentTime + 0.05;
    beep(t, 880);
    beep(t + 0.18, 1175);
    beep(t + 0.5, 880);
    beep(t + 0.68, 1175);
    round++;
    out.gain.setTargetAtTime(Math.min(0.9, 0.15 + round * 0.05), ctx.currentTime, 0.5);
  };
  tick();
  const timer = setInterval(tick, 1600);
  void ctx.resume();
  return () => {
    stopped = true;
    clearInterval(timer);
    void ctx.close();
  };
}

/**
 * Alarms ("wake me up at 7", "alarm every weekday at 6:30"): when one is
 * due the panel comes up with this card and the tone rings until Stop or
 * Snooze — or snoozes itself after five minutes if nobody's there.
 */
export function AlarmRinger() {
  const [now, setNow] = useState<Ringing | null>(null);
  const stopSound = useRef<(() => void) | null>(null);
  const giveUp = useRef<ReturnType<typeof setTimeout> | null>(null);

  const quiet = () => {
    stopSound.current?.();
    stopSound.current = null;
    if (giveUp.current) clearTimeout(giveUp.current);
    giveUp.current = null;
  };

  const snooze = (r: Ringing, minutes: number) => {
    quiet();
    setNow(null);
    void api.alarmSnooze(r.text, minutes);
  };

  useEffect(() => {
    const off = on<Ringing>(EV.alarm, (r) => {
      quiet();
      setNow(r);
      try {
        stopSound.current = ring();
      } catch {
        /* no sound device — the card still shows */
      }
      giveUp.current = setTimeout(() => snooze(r, 10), RING_MAX_MS);
    });
    return () => {
      void off.then((f) => f());
      quiet();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!now) return null;
  const time = new Date(now.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return (
    <div className="izk-no-drag fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-6 backdrop-blur-md">
      <div className="izk-card flex w-full max-w-[360px] flex-col items-center gap-3 p-6 text-center">
        <div className="flex h-[64px] w-[64px] animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-izk-violet/80 to-izk-teal/70">
          <AlarmClock size={30} className="text-white" />
        </div>
        <div className="text-[34px] font-semibold leading-none text-izk-ink">{time}</div>
        <div className="text-[15px] text-izk-ink">{now.text}</div>
        <div className="mt-2 flex w-full gap-2">
          <button
            type="button"
            onClick={() => snooze(now, 5)}
            className="izk-pill flex h-[40px] flex-1 items-center justify-center gap-1.5 text-[13px]"
          >
            <Clock size={14} strokeWidth={2.4} /> Snooze 5 min
          </button>
          <button
            type="button"
            autoFocus
            onClick={() => {
              quiet();
              setNow(null);
            }}
            className="izk-btn-primary flex h-[40px] flex-1 items-center justify-center gap-1.5 rounded-full text-[13px]"
          >
            <BellOff size={14} strokeWidth={2.4} /> Stop
          </button>
        </div>
      </div>
    </div>
  );
}
