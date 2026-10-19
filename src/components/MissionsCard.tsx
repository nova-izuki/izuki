import { useCallback, useEffect, useState } from "react";
import { api, EV, on, type Mission } from "../lib/ipc";
import { useIzuki } from "../lib/store";
import { Row, Section, Toggle } from "./ui";

/** One tap to add: the missions people give most. */
const EXAMPLES = [
  "What's due on Blackboard this week",
  "Check my grades on Blackboard",
  "Any new announcements in my classes",
  "Sum up my unread emails",
];

/** The saved progress, in plain words. */
const PHASE: Record<string, string> = {
  running: "Working on it so far",
  returned: "When it finished",
  interrupted: "When it was interrupted",
};

/** Why a mission stopped early, in plain words. */
const STOPPED: Record<string, string> = {
  cancelled: "You stopped it.",
  deadline: "It paused at its time limit.",
  rounds: "It paused after thinking it over as many times as it's allowed.",
  actions: "It paused at its limit of clicks and key presses.",
  requests: "It paused at its limit of checks in your apps.",
  checkpoint_failure: "It paused because it couldn't save a record of what it did.",
};

const STATE: Record<Mission["state"], { icon: string; label: string }> = {
  waiting: { icon: "⏳", label: "Waiting" },
  running: { icon: "⚙️", label: "Working on it…" },
  done: { icon: "✅", label: "Verified" },
  needs_you: { icon: "✋", label: "Needs you" },
  stopped: { icon: "⏹", label: "Stopped" },
  partial: { icon: "⚠️", label: "Partly done" },
  blocked: { icon: "🔒", label: "Blocked" },
  failed: { icon: "⚠️", label: "Failed" },
  unverified: { icon: "⚠️", label: "Not verified" },
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
  const [addError, setAddError] = useState("");
  const [evidenceOpen, setEvidenceOpen] = useState<string | null>(null);
  /** What a button just did, said under that mission: (mission id, words). */
  const [said, setSaid] = useState<[string, string] | null>(null);
  const settings = useIzuki((s) => s.settings);
  const patch = useIzuki((s) => s.patchSettings);

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

  const add = (typed?: string) => {
    const t = (typed ?? text).trim();
    if (!t) return;
    setAddError("");
    const ids = new Set(missions.map((m) => m.id));
    void api.missionAdd(t).then((all) => {
      setMissions(all);
      if (all.some((m) => !ids.has(m.id) && m.text === t)) {
        if (typed === undefined) setText("");
      }
      else setAddError("The mission wasn't added. Keep it within 400 characters and check that Izuki can save its data.");
    }).catch(() => setAddError("The mission couldn't be saved. Your text is still here to try again."));
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
          maxLength={400}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
          placeholder="e.g. check my assignments and list what's due this week"
          aria-label="New mission"
          className="izk-no-drag min-w-0 flex-1 rounded-xl border border-white/12 bg-black/25 px-3 py-1.5 text-[12px] text-izk-ink outline-none"
        />
        <button type="button" onClick={() => add()} className="izk-pill izk-no-drag px-3 text-[11.5px]">Add</button>
      </div>
      {addError && <p role="alert" className="mt-1.5 text-[11px] text-izk-muted">{addError}</p>}
      {missions.length === 0 && <p className="mt-2 text-[11.5px] text-izk-muted">No missions yet. Tap one below, type your own, or say “add to my missions: …”.</p>}
      {missions.length < 3 && (
        <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Add a common mission">
          {EXAMPLES.filter((e) => !missions.some((m) => m.text === e)).map((e) => (
            <button key={e} type="button" onClick={() => add(e)} className="izk-pill izk-no-drag px-2.5 py-1 text-[11px]">+ {e}</button>
          ))}
        </div>
      )}
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
            {m.state !== "running" && m.state !== "waiting" && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                <button type="button" onClick={() => void api.missionRetry(m.id).then(setMissions).catch(() => undefined)} className="izk-pill izk-no-drag px-2 py-0.5 text-[10.5px]" title="Put it back on the list to do again">↻ Try again</button>
                {m.result && (
                  <button type="button" onClick={() => void api.missionSaveNote(m.id).then((r) => setSaid([m.id, r])).catch((e) => setSaid([m.id, String(e)]))} className="izk-pill izk-no-drag px-2 py-0.5 text-[10.5px]">📝 Save to Notes</button>
                )}
                <button type="button" onClick={() => void api.missionMakeDaily(m.id, "08:00").then((r) => setSaid([m.id, r])).catch((e) => setSaid([m.id, String(e)]))} className="izk-pill izk-no-drag px-2 py-0.5 text-[10.5px]" title="Izuki does this by itself every morning at 8 and tells you (and your phone)">📅 Every morning</button>
              </div>
            )}
            {said?.[0] === m.id && <p role="status" className="mt-1 text-[11px] text-izk-teal">{said[1]}</p>}
            {m.contract && (
              <details className="mt-1 text-[11px] leading-snug text-izk-muted">
                <summary className="izk-no-drag cursor-pointer">What Izuki may do, and what it did</summary>
                <p className="mt-1">Only what you've already allowed. Sending, spending or deleting anything still waits for your yes.</p>
                <p className="mt-1">It counts as done only when Izuki can see this really happened: {m.contract.success_criteria.join("; ")}</p>
                <p className="mt-1">It stops by itself after {Math.ceil(m.contract.budget.max_duration_ms / 60000)} minutes, {m.contract.budget.max_actions} clicks or key presses, or {m.contract.budget.max_requests} checks in your apps — whichever comes first.</p>
                {m.checkpoint && (
                  <p className="mt-1">
                    {PHASE[m.checkpoint.phase] ?? "Saved progress"}: {m.checkpoint.usage.actions} clicks or key presses, {m.checkpoint.usage.requests} checks in your apps, {Math.max(1, Math.round(m.checkpoint.usage.elapsed_ms / 1000))} seconds.
                    {m.checkpoint.usage.stop_reason && ` ${STOPPED[m.checkpoint.usage.stop_reason] ?? "It stopped early."}`}
                  </p>
                )}
                {m.checkpoint?.journal_incomplete && <p role="status" className="mt-1">Part of the record of what it did couldn't be read. Have a look at the result before running it again.</p>}
                {!!m.checkpoint?.evidence?.length && <>
                  <button type="button" className="izk-no-drag mt-1 underline" onClick={() => setEvidenceOpen(evidenceOpen === m.id ? null : m.id)}>{evidenceOpen === m.id ? "Hide" : "Show"} execution records ({m.checkpoint.evidence.length})</button>
                  {evidenceOpen === m.id && <>
                    <p className="mt-1">Each step Izuki took and how it went. A step that worked doesn't by itself mean the whole mission is done.</p>
                    <ul className="mt-1 max-h-48 overflow-y-auto space-y-1">
                      {m.checkpoint.evidence.map((e) => <li key={e.sequence}>#{e.sequence} · {e.operation} · {{in_flight: "Still going", returned: "Worked", failed: "Didn't work", unknown: "Not sure how it went"}[e.outcome]}{e.account && ` · Connection ${e.account}`} · {new Date(e.started_at).toLocaleTimeString()}</li>)}
                    </ul>
                  </>}
                </>}
              </details>
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
      <Row label="Start them when I'm away" hint="Waiting missions start by themselves once you haven't touched the PC for 10 minutes (while it's still unlocked), and you get one report when they're done.">
        <Toggle checked={settings.missions_when_away ?? false} onChange={(v) => patch({ missions_when_away: v })} />
      </Row>
    </Section>
  );
}
