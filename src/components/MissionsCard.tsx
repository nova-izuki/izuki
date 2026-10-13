import { useCallback, useEffect, useState } from "react";
import { api, EV, on, type Mission } from "../lib/ipc";
import { Section } from "./ui";

const STATE: Record<Mission["state"], { icon: string; label: string }> = {
  waiting: { icon: "⏳", label: "Waiting" },
  running: { icon: "⚙️", label: "Working on it…" },
  done: { icon: "✅", label: "Done" },
  needs_you: { icon: "✋", label: "Needs you" },
  stopped: { icon: "⏹", label: "Stopped" },
};

/**
 * Missions (Rest mode): things for Izuki to do while you're away, one after
 * the other — through the same safe paths as everything else, so nothing is
 * sent, posted or bought without your yes. Anything that needs you waits
 * ("Needs you", with what Izuki said); you get one report at the end, on the
 * PC and your phone. Or by voice: "add to my missions: …", "start my missions".
 */
export function MissionsCard() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [running, setRunning] = useState(false);
  const [text, setText] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const refresh = useCallback(() => {
    void api
      .missionsList()
      .then((r) => {
        setMissions(r.missions);
        setRunning(r.running);
      })
      .catch(() => undefined);
  }, []);
  useEffect(() => {
    refresh();
    const off = on<void>(EV.missionsChanged, refresh);
    return () => void off.then((f) => f());
  }, [refresh]);

  const add = () => {
    const t = text.trim();
    if (!t) return;
    setText("");
    void api.missionAdd(t).then(setMissions).catch(() => undefined);
  };
  const waiting = missions.filter((m) => m.state === "waiting").length;
  const finished = missions.some((m) => m.state === "done" || m.state === "stopped");

  return (
    <Section
      id="draw-missions"
      title="Missions (Rest mode)"
      hint="Give Izuki a list of things to do while you're away. It does them one after the other and tells you (and your phone) when it's done. Nothing is sent, posted or bought without your yes — those wait for you."
    >
      <div className="flex gap-1.5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
          placeholder="e.g. check my assignments and list what's due this week"
          aria-label="New mission"
          className="izk-no-drag min-w-0 flex-1 rounded-xl border border-white/12 bg-black/25 px-3 py-1.5 text-[12px] text-izk-ink outline-none"
        />
        <button type="button" onClick={add} className="izk-pill izk-no-drag px-3 text-[11.5px]">Add</button>
      </div>
      {missions.length === 0 && <p className="mt-2 text-[11.5px] text-izk-muted">No missions yet. Or say “add to my missions: …”.</p>}
      <ul className="mt-2 space-y-1">
        {missions.map((m) => (
          <li key={m.id} className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11.5px]">
            <div className="flex items-center gap-2">
              <span aria-hidden>{STATE[m.state]?.icon ?? "•"}</span>
              <span className="min-w-0 flex-1 text-izk-ink">{m.text}</span>
              <span className="shrink-0 text-[10.5px] text-izk-muted">{STATE[m.state]?.label}</span>
              {m.state !== "running" && (
                <button type="button" aria-label="Remove" onClick={() => void api.missionRemove(m.id).then(setMissions).catch(() => undefined)} className="izk-no-drag rounded px-1 text-izk-muted hover:text-izk-ink">×</button>
              )}
            </div>
            {m.result && (
              <button type="button" onClick={() => setOpen(open === m.id ? null : m.id)} className="izk-no-drag mt-1 block w-full text-left text-[11px] leading-snug text-izk-muted">
                {open === m.id ? m.result : `${m.result.slice(0, 110)}${m.result.length > 110 ? "…" : ""}`}
              </button>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          disabled={running || waiting === 0}
          onClick={() => void api.missionsRun().then(() => refresh()).catch(() => undefined)}
          className="izk-btn-primary izk-no-drag h-[30px] px-3.5 text-[12px] disabled:opacity-40"
        >
          {running ? "Working through them…" : `Start${waiting ? ` (${waiting})` : ""}`}
        </button>
        {finished && (
          <button type="button" onClick={() => void api.missionsClearDone().then(setMissions).catch(() => undefined)} className="izk-pill izk-no-drag px-3 text-[11.5px]">Clear finished</button>
        )}
      </div>
      {running && <p className="mt-1.5 text-[10.5px] text-izk-muted">Esc or Stop stops them. You can keep using your PC — Izuki works in its own window when it can.</p>}
    </Section>
  );
}
