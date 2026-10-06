import { useEffect, useState } from "react";
import { Gauge, Loader2, Rocket, Wand2, Zap } from "lucide-react";
import { Row, Section, Toggle } from "./ui";
import { useIzuki } from "../lib/store";
import { api, type BoostHealth } from "../lib/ipc";

/**
 * PC Boost (boost.rs): notice a struggling PC and offer to speed it up —
 * old temp files cleared, hogging background helpers closed, and the heavy
 * app named. Never closes a window you're using.
 */
export function BoostCard() {
  const settings = useIzuki((s) => s.settings);
  const patch = useIzuki((s) => s.patchSettings);
  const [health, setHealth] = useState<BoostHealth | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");

  // A live look while the card is open (two samples to measure the processor).
  useEffect(() => {
    let alive = true;
    const look = () =>
      void api
        .boostHealth()
        .then((h) => alive && setHealth(h))
        .catch(() => undefined);
    look();
    const t = setInterval(look, 4000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const boost = async () => {
    setBusy(true);
    setResult("");
    try {
      setResult(await api.boostNow());
      setHealth(await api.boostHealth());
    } catch (e) {
      setResult(String(e));
    } finally {
      setBusy(false);
    }
  };

  const meter = (label: string, value: number) => (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <div className="flex justify-between text-[11px] text-izk-muted">
        <span>{label}</span>
        <span className="text-izk-ink">{value}%</span>
      </div>
      <div className="h-[6px] overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.max(2, value)}%`,
            background: value >= 88 ? "#f87171" : value >= 70 ? "#fbbf24" : "linear-gradient(90deg,#7c5cff,#4ecdc4)",
          }}
        />
      </div>
    </div>
  );

  return (
    <Section id="settings-boost" title="PC Boost" hint="Keeps your PC quick: notices when it's struggling and speeds it up — never closes a window you're using.">
      {health && (
        <div className="mb-2 flex gap-3">
          {meter("Processor", health.cpu)}
          {meter("Memory", health.ram)}
        </div>
      )}
      {health && health.hogs.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {health.hogs.slice(0, 4).map((h) => (
            <span key={`${h.name}-${h.window}`} className="izk-inset rounded-full px-2 py-0.5 text-[10.5px] text-izk-muted">
              {h.window ? "🪟" : "⚙️"} {h.name} · {h.mem_mb >= 1024 ? `${(h.mem_mb / 1024).toFixed(1)} GB` : `${h.mem_mb} MB`}
              {h.cpu >= 5 ? ` · ${Math.round(h.cpu)}%` : ""}
            </span>
          ))}
        </div>
      )}
      <Row label="Watch for lag" hint="When the PC stays maxed out, the Island offers to speed it up." icon={<Gauge size={14} strokeWidth={2.3} />}>
        <Toggle checked={settings.pc_boost} onChange={(v) => patch({ pc_boost: v })} />
      </Row>
      <div className="izk-divider" />
      <Row
        label="Fix it by itself"
        hint="Clears old temp files and closes hogging background updaters on its own (at most every 30 minutes)."
        icon={<Wand2 size={14} strokeWidth={2.3} />}
      >
        <Toggle checked={settings.pc_boost_auto} onChange={(v) => patch({ pc_boost_auto: v })} />
      </Row>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void boost()}
          disabled={busy}
          className="izk-btn-primary izk-no-drag flex h-[32px] items-center gap-1.5 rounded-full px-3.5 text-[12px] disabled:opacity-50"
        >
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Rocket size={13} strokeWidth={2.4} />} Speed it up now
        </button>
        <span className="flex items-center gap-1 text-[10.5px] text-izk-muted">
          <Zap size={11} strokeWidth={2.4} /> Or just say "my PC is lagging"
        </span>
      </div>
      {result && <p className="mt-2 text-[11.5px] leading-snug text-izk-ink">{result}</p>}
    </Section>
  );
}
