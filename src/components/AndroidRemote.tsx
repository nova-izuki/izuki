import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, CornerDownLeft, Home, Layers, Loader2, RefreshCw, Smartphone, Type, X } from "lucide-react";
import { api } from "../lib/ipc";

/**
 * The PC's window into the paired phone: the real screen over ADB, with tap,
 * swipe, Back/Home/Recents/Enter and a type box. It deliberately stops at the
 * lock screen — no lock-screen reading, no bypassing the phone's own lock.
 */
export function AndroidRemote({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [shot, setShot] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const img = useRef<HTMLImageElement | null>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const inFlight = useRef(false);
  const alive = useRef(true);

  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    try {
      const next = await api.androidScreen();
      if (!alive.current) return;
      setShot(next);
      setError("");
    } catch (e) {
      if (!alive.current) return;
      // Never leave a stale screenshot on screen after a lock or a lost link.
      setShot(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      inFlight.current = false;
      if (alive.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    alive.current = true;
    void load();
    const timer = window.setInterval(() => void load(), 1600);
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", esc);
    return () => {
      alive.current = false;
      window.clearInterval(timer);
      window.removeEventListener("keydown", esc);
    };
  }, [open, load, onClose]);

  if (!open) return null;

  const point = (e: React.PointerEvent<HTMLImageElement>) => {
    const el = img.current;
    if (!el || !el.naturalWidth) return null;
    const r = el.getBoundingClientRect();
    return {
      x: Math.round(((e.clientX - r.left) / r.width) * el.naturalWidth),
      y: Math.round(((e.clientY - r.top) / r.height) * el.naturalHeight),
    };
  };

  const after = async (work: () => Promise<unknown>) => {
    setLoading(true);
    try {
      await work();
      setError("");
      window.setTimeout(() => void load(), 250);
    } catch (e) {
      setShot(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const key = (name: string) => void after(() => api.androidKey(name));

  const up = async (e: React.PointerEvent<HTMLImageElement>) => {
    const from = drag.current;
    drag.current = null;
    const to = point(e);
    if (!from || !to) return;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) {
      await after(() => api.androidTap(to.x, to.y));
    } else {
      await after(() => api.androidSwipe(from.x, from.y, to.x, to.y, Math.min(900, Math.max(120, Math.round(Math.hypot(dx, dy) * 1.5)))));
    }
  };

  const type = () => {
    const words = text.trim();
    if (!words) return;
    void after(async () => {
      await api.androidType(words);
      setText("");
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Control your Android phone">
      <div className="flex max-h-[94vh] w-full max-w-[980px] flex-col overflow-hidden rounded-[24px] border border-white/12 bg-[#0d0c14] shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <Smartphone size={17} className="text-izk-teal" />
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-izk-ink">Your phone</div>
            <div className="text-[11px] text-izk-muted">Live over ADB · tap or drag the screen · the lock screen stays private</div>
          </div>
          {loading && <Loader2 size={14} className="animate-spin text-izk-teal" />}
          <button type="button" onClick={() => void load()} className="izk-pill izk-no-drag flex h-8 items-center gap-1.5 px-2.5 text-[11.5px]" aria-label="Refresh phone screen">
            <RefreshCw size={12} /> Refresh
          </button>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-izk-muted hover:text-izk-ink" aria-label="Close phone screen">
            <X size={15} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 sm:flex-row sm:p-4">
          <div className="flex min-w-0 flex-1 items-start justify-center">
            {shot ? (
              <img
                ref={img}
                src={shot}
                alt="Live Android phone screen"
                draggable={false}
                onPointerDown={(e) => {
                  drag.current = point(e);
                  e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerUp={(e) => void up(e)}
                className="max-h-[62vh] w-auto max-w-full touch-none select-none rounded-[18px] border border-white/12 bg-black object-contain shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
              />
            ) : (
              <div className="flex h-[46vh] w-full flex-col items-center justify-center gap-2 rounded-[18px] border border-dashed border-white/12 text-center">
                <Smartphone size={30} className="text-izk-muted" />
                <div className="text-[13px] text-izk-muted">{error || "Connecting to your phone…"}</div>
                <button type="button" onClick={() => void load()} className="izk-pill izk-no-drag mt-1 h-8 px-3 text-[11.5px]">Try again</button>
              </div>
            )}
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-[210px]">
            <div className="grid grid-cols-4 gap-1.5">
              <Key label="Back" onClick={() => key("back")}><ArrowLeft size={15} /></Key>
              <Key label="Home" onClick={() => key("home")}><Home size={15} /></Key>
              <Key label="Recents" onClick={() => key("recents")}><Layers size={15} /></Key>
              <Key label="Enter" onClick={() => key("enter")}><CornerDownLeft size={15} /></Key>
            </div>
            <div className="rounded-[14px] border border-white/10 bg-white/5 p-2.5">
              <div className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-izk-muted"><Type size={11} /> Type on the phone</div>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") type(); }}
                placeholder="Message, search, note…"
                className="izk-field izk-no-drag h-9 py-0 text-[12px]"
                spellCheck={false}
                autoComplete="off"
              />
              <button type="button" onClick={type} disabled={!text.trim()} className="izk-btn-primary izk-no-drag mt-1.5 h-8 w-full rounded-full text-[11.5px] disabled:opacity-45">Type it</button>
            </div>
            <div className="rounded-[14px] border border-white/10 bg-white/5 p-2.5 text-[11px] leading-relaxed text-izk-muted">
              <b className="text-izk-ink">Tap</b> the screen, or <b className="text-izk-ink">drag</b> to swipe. Use Back/Home/Recents to get around. Unlock the phone yourself first — Izuki never reads or taps your lock screen.
            </div>
            {error && <div className="rounded-[12px] border border-izk-danger/25 bg-izk-danger/10 p-2 text-[11px] leading-snug text-izk-danger">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Key({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="izk-no-drag flex h-10 items-center justify-center rounded-[12px] border border-white/12 bg-white/5 text-izk-ink transition hover:border-izk-teal/40 hover:bg-izk-teal/10"
    >
      {children}
    </button>
  );
}
