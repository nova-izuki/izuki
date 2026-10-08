import { useEffect, useRef, useState } from "react";
import { Gauge, Loader2, Rocket, ShieldCheck, Trash2, Undo2, Wand2, Zap } from "lucide-react";
import { Row, Section, Toggle } from "./ui";
import { useIzuki } from "../lib/store";
import { api, IS_TAURI, type BoostHealth, type DeepReport } from "../lib/ipc";

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
  const [report, setReport] = useState<DeepReport | null>(null);
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [working, setWorking] = useState("");
  const [powerPlan, setPowerPlan] = useState("loading");
  const [powerBusy, setPowerBusy] = useState(false);
  const changingPower = useRef(false);
  const powerGeneration = useRef(0);

  // Read Windows itself; a saved checkbox is not proof of the active plan.
  useEffect(() => {
    let alive=true;
    const read=()=>{ if(changingPower.current)return; const generation=++powerGeneration.current; void api.boostActivePowerPlan().then(plan=>{
      if(alive&&generation===powerGeneration.current) { setPowerPlan(plan); patch({pc_boost_power_plan:plan==="high"}); }
    }).catch(()=>{if(alive&&generation===powerGeneration.current)setPowerPlan("unknown");}); };
    read();window.addEventListener("focus",read);
    return()=>{alive=false;window.removeEventListener("focus",read);};
  },[patch]);
  const changePower = async (on: boolean) => {
    if(changingPower.current)return;
    changingPower.current=true;powerGeneration.current++;setPowerBusy(true);setResult("");
    try {
      const actual=await api.boostPowerPlan(on);
      setPowerPlan(actual);patch({pc_boost_power_plan:actual==="high"});
      setResult(actual==="high" ? "Windows confirmed High Performance. This can use more battery and increase heat." : "Windows confirmed Balanced.");
    } catch(e) {
      setResult(String(e));
      try { const actual=await api.boostActivePowerPlan();setPowerPlan(actual);patch({pc_boost_power_plan:actual==="high"}); }
      catch { setPowerPlan("unknown"); }
    } finally { changingPower.current=false;setPowerBusy(false); }
  };

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

  // One button: the deep clean now, and the bloatware / startup apps it found.
  const boost = async () => {
    setBusy(true);
    setResult("");
    setReport(null);
    try {
      const r = await api.boostDeep();
      setReport(r);
      setResult(r.said);
      const p: Record<string, boolean> = {};
      for (const i of [...r.bloat, ...r.startup]) p[i.id] = i.recommended;
      setPicked(p);
      setHealth(await api.boostHealth());
    } catch (e) {
      setResult(String(e));
    } finally {
      setBusy(false);
    }
  };
  const chosen = (kind: "bloat" | "startup") => (report ? report[kind] : []).filter((i) => picked[i.id]).map((i) => i.id);
  const finish = async () => {
    setWorking("remove");
    try {
      setResult(await api.boostRemove(chosen("bloat"), chosen("startup")));
      setReport(null);
    } catch (e) {
      setResult(String(e));
    } finally {
      setWorking("");
    }
  };
  const deeper = async () => {
    setWorking("admin");
    try {
      setResult(await api.boostAdmin(chosen("startup")));
    } catch (e) {
      setResult(String(e));
    } finally {
      setWorking("");
    }
  };
  const undo = async () => {
    setWorking("undo");
    try {
      setResult(await api.boostUndoStartup());
    } catch (e) {
      setResult(String(e));
    } finally {
      setWorking("");
    }
  };
  const list = (title: string, items: DeepReport["bloat"]) =>
    items.length > 0 && (
      <div className="mt-2">
        <div className="mb-1 text-[11px] font-semibold text-izk-ink">{title}</div>
        <div className="flex flex-wrap gap-1">
          {items.map((i) => (
            <label key={i.id} className={`izk-pill izk-no-drag flex cursor-pointer items-center gap-1 px-2 py-0.5 text-[10.5px] ${picked[i.id] ? "border-izk-teal/60 bg-izk-teal/10" : ""}`} title={i.scope === "all" ? "For all users — needs Windows' permission (Deeper clean)" : undefined}>
              <input type="checkbox" checked={!!picked[i.id]} onChange={(e) => setPicked((p) => ({ ...p, [i.id]: e.target.checked }))} className="accent-izk-teal" />
              {i.name}{i.scope === "all" ? " 🔒" : ""}
            </label>
          ))}
        </div>
      </div>
    );

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
        label="Keep my PC fast by itself"
        hint="Keeps your PC fast forever: when it lags it clears junk, frees memory and closes hogging updaters on its own — plus a quiet tidy once a day."
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
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Rocket size={13} strokeWidth={2.4} />} {busy ? "Cleaning…" : "Make my PC fast"}
        </button>
        <button type="button" onClick={() => void deeper()} disabled={!!working || busy} title="Windows' own temp, old update downloads, delivery cache — Windows asks permission once" className="izk-pill izk-no-drag flex h-[32px] items-center gap-1.5 px-3 text-[11.5px] disabled:opacity-50">
          {working === "admin" ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />} Deeper clean
        </button>
        <span className="flex items-center gap-1 text-[10.5px] text-izk-muted">
          <Zap size={11} strokeWidth={2.4} /> Or say "make my PC fast" · "remove the bloatware"
        </span>
      </div>
      {/* Power plan toggle */}
      <Row
        label="High Performance mode"
        hint="Manual Windows plan: on selects High Performance; off selects Balanced. May use more battery and produce more heat; speed gains depend on your PC."
        icon={<Zap size={14} strokeWidth={2.3} />}
      >
        <Toggle
          checked={powerPlan==="high"}
          disabled={!IS_TAURI || powerBusy || powerPlan==="loading" || powerPlan==="unknown"}
          onChange={v=>void changePower(v)}
        />
      </Row>
      <p className="mt-1 text-[10.5px] text-izk-muted" role="status">
        {powerBusy ? "Checking the Windows change…" : powerPlan==="loading" ? "Reading Windows power plan…" : powerPlan==="high" ? "Active plan: High Performance" : powerPlan==="balanced" ? "Active plan: Balanced" : powerPlan==="other" ? "Active plan: another Windows plan (unchanged)." : "Power plan unavailable. Reopen this settings page to retry."}
      </p>
      {result && <p className="mt-2 text-[11.5px] leading-snug text-izk-ink">{result}</p>}
      {report && (report.bloat.length > 0 || report.startup.length > 0) && (
        <div className="mt-2 rounded-[12px] border border-white/10 bg-white/5 p-2.5">
          {list("Bloatware (removed for you — reinstall from the Store any time)", report.bloat)}
          {list("Slowing your startup (switched off like Task Manager does — undo any time)", report.startup)}
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={() => void finish()} disabled={!!working || (chosen("bloat").length === 0 && chosen("startup").length === 0)} className="izk-btn-primary izk-no-drag flex h-[30px] items-center gap-1.5 rounded-full px-3 text-[11.5px] disabled:opacity-50">
              {working === "remove" ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Remove the ticked ones
            </button>
          </div>
        </div>
      )}
      <button type="button" onClick={() => void undo()} disabled={!!working} className="mt-2 flex items-center gap-1 text-[10.5px] text-izk-muted underline-offset-2 hover:text-izk-ink hover:underline">
        <Undo2 size={11} /> Turn the startup apps I switched off back on
      </button>
    </Section>
  );
}
