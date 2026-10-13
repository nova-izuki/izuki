import { useEffect, useState } from "react";
import { api, EV, on } from "../lib/ipc";

/**
 * Shown on this PC whenever a phone is watching or controlling it (remote.rs)
 * — never silent. "End" switches the phone remote off at once (on again only
 * from here).
 */
export function RemoteBadge() {
  const [who, setWho] = useState<{ device: string; controlling: boolean } | null>(null);
  useEffect(() => {
    const off = on<{ device: string; controlling: boolean } | null>(EV.remoteActive, (v) => setWho(v ?? null));
    return () => void off.then((f) => f());
  }, []);
  if (!who) return null;
  return (
    <div className="pointer-events-none fixed left-1/2 top-2 z-[90] -translate-x-1/2">
      <div data-izk-hit className="pointer-events-auto flex items-center gap-2 rounded-full border border-cyan-300/40 bg-[#0b1220]/90 px-3 py-1 text-[12px] text-white shadow-lg">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
        </span>
        <span>
          📱 {who.device} is {who.controlling ? "controlling" : "watching"} this PC
        </span>
        <button type="button" onClick={() => void api.remoteEnd().catch(() => undefined)} className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold hover:bg-red-500/70">
          End
        </button>
      </div>
    </div>
  );
}
