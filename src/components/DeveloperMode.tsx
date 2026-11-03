import { useEffect, useState } from "react";
import { call, IS_TAURI } from "../lib/ipc";
import { Row, Section, Toggle } from "./ui";

type Run = { id: string; at: number; ok: boolean | null; summary: string; tail: string };
type Status = {
  available: boolean;
  feature?: string;
  vision?: { on: boolean; note: string; at: number };
  review?: { on: boolean; note: string; at: number };
  testing?: {
    on: boolean; note: string; at: number; busy: boolean;
    scenarios: Array<{ id: string; label: string }>;
    runs: Run[];
  };
  observer?: { server_port: unknown; token_path: string };
  root?: string | null;
};

const unavailable: Status = { available: false };

export function DeveloperMode() {
  const [status, setStatus] = useState<Status>(unavailable);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!IS_TAURI) return;
    let alive = true;
    const poll = async () => {
      const s = await call<Status>("dev_status", undefined, () => unavailable);
      if (alive) setStatus(s);
    };
    void poll();
    const timer = setInterval(poll, 2500);
    return () => { alive = false; clearInterval(timer); };
  }, []);

  if (!IS_TAURI || !status.available) return null;
  const s = status;

  const toggle = async (kind: string, next: boolean) => {
    setError(""); setMessage("");
    if (kind === "vision" && next) {
      // The capture itself is a decision, and the user is watching Izuki's
      // own screen frames: say so, once, before anything starts.
      if (!window.confirm("Turn Smart Vision on? Izuki keeps a small ring of screenshots of its own window while this is on, bounded and only on this PC.")) return;
    }
    if (kind === "testing" && next && !window.confirm("Arm Smart Real Testing? Only the three approved scenarios in this build can run, and they never touch your real Izuki data.")) return;
    const r = await call<{ ok: boolean; message?: string; error?: string }>("dev_set_toggle", { kind, on: next }, () => ({ ok: false, error: "connection to Xiao dev tools broke" }));
    if (!r.ok) setError(r.error ?? ""); else setMessage(r.message ?? "");
    const fresh = await call<Status>("dev_status", undefined, () => unavailable);
    if (fresh.available) setStatus(fresh);
  };

  const runScenario = async (id: string) => {
    setError(""); setMessage("");
    const r = await call<{ ok: boolean; error?: string }>("dev_run_scenario", { id }, () => ({ ok: false, error: "connection broke" }));
    if (!r.ok) setError(r.error ?? "");
    const fresh = await call<Status>("dev_status", undefined, () => unavailable);
    if (fresh.available) setStatus(fresh);
  };

  const captureBug = async () => {
    setError(""); setMessage("");
    const r = await call<{ ok: boolean; path?: string; error?: string }>("dev_capture_bug", undefined, () => ({ ok: false, error: "connection broke" }));
    if (r.ok && r.path) setMessage(`Bug folder filed: ${r.path}`); else setError(r.error ?? "");
  };

  const stopAll = async () => {
    if (!window.confirm("Stop everything developer tools are doing right now? (Observation stops, capture buffers are released, a running test is cancelled.)")) return;
    setError(""); setMessage("");
    const message_from_backend = await call<string>("dev_stop_all", undefined, () => "connection broke");
    setMessage(message_from_backend);
    const fresh = await call<Status>("dev_status", undefined, () => unavailable);
    if (fresh.available) setStatus(fresh);
  };

  return (
    <Section
      title="Developer"
      group="System"
      foldable
      hint={`Owner-only dev tools, inside this build only (${s.feature ?? "devvision"}). Everything is off when Izuki starts, nothing here publishes or releases anything, and nothing is tied to this PC — same tools on any dev machine.`}
    >
      <Row label="Smart Vision observation" hint={s.vision && s.vision.on ? "Capturing this app's window into a bounded ring. " + s.vision.note : "Off — nothing is captured."}>
        <Toggle checked={!!s.vision?.on} disabled={!IS_TAURI} onChange={v => void toggle("vision", v)} />
      </Row>
      <Row label="Claude Live Auto-Review" hint={s.review?.on ? "Armed — an agent may read the captured story through the token-guarded local endpoints." : "Off — no review channel."}>
        <Toggle checked={!!s.review?.on} disabled={!IS_TAURI} onChange={v => void toggle("review", v)} />
      </Row>
      <Row label="Smart Real Testing" hint={s.testing?.on ? "Armed — approved scenarios only, in the repo's own test environment. " + (s.testing?.busy ? "A scenario is running." : "") : "Off — no test ever runs."}>
        <Toggle checked={!!s.testing?.on} disabled={!IS_TAURI} onChange={v => void toggle("testing", v)} />
      </Row>

      {!!s.testing?.on && (
        <div className="mt-2 flex flex-wrap gap-2">
          {s.testing.scenarios.map(sc => (
            <button key={sc.id} type="button" className="izk-pill px-3 py-2 disabled:opacity-40"
              disabled={s.testing?.busy} title={sc.label} onClick={() => void runScenario(sc.id)}>
              Run: {sc.label}
            </button>
          ))}
        </div>
      )}

      {!!s.testing?.runs.length && (
        <div className="mt-2 text-[11px] leading-snug text-izk-muted">
          <div className="mb-1 font-medium text-izk-ink">Recent test results (newest first)</div>
          {s.testing.runs.map((run, i) => (
            <div key={`${run.at}-${i}`} className="flex items-start gap-2 py-0.5">
              <span className={run.ok === true ? "text-emerald-400" : run.ok === false ? "text-red-400" : ""}>
                {run.ok === true ? "passed" : run.ok === false ? "failed" : "running"}
              </span>
              <span>{run.id}</span>
              <span className="min-w-0 flex-1 truncate" title={run.tail || run.summary}>{run.summary}</span>
            </div>
          ))}
        </div>
      )}

      {(message || error) && (
        <div className={`mt-2 text-[11px] ${error ? "text-red-400" : "text-emerald-400"}`}>
          {error ? `Needs you: ${error}` : message}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="izk-pill px-3 py-2" onClick={() => void captureBug()}>
          Capture Bug
        </button>
        <button type="button" className="izk-btn-primary px-3 py-2" onClick={() => void stopAll()}>
          Stop All
        </button>
      </div>
    </Section>
  );
}
