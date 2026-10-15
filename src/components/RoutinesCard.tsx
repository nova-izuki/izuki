import { useCallback, useEffect, useState } from "react";
import { api, type Routine } from "../lib/ipc";
import { Section, Toggle } from "./ui";

const EVERY: Record<string, string> = {
  hourly: "Every hour",
  daily: "Every day",
  weekdays: "Every weekday",
  weekends: "Weekends",
  mon: "Every Monday",
  tue: "Every Tuesday",
  wed: "Every Wednesday",
  thu: "Every Thursday",
  fri: "Every Friday",
  sat: "Every Saturday",
  sun: "Every Sunday",
};

function at(t: string) {
  const [h, m] = t.split(":").map(Number);
  if (!Number.isFinite(h)) return t;
  const d = new Date();
  d.setHours(h, m || 0, 0, 0);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

const OUTCOME: Record<string, string> = {
  verified: "✅ Done",
  partial: "⚠️ Partly done",
  needsuser: "✋ Needs you",
  blocked: "🔒 Blocked",
  failed: "⚠️ Didn't work",
  cancelled: "⏹ Stopped",
  unverified: "❔ Ran — not verified",
};

/**
 * Routines (routines.rs): things Izuki does by itself on a schedule. Made by
 * saying it — “every weekday at 8, check my email and send me the summary” —
 * and off until you turn them on. Anything that sends or deletes only ever
 * becomes a draft waiting for your yes.
 */
export function RoutinesCard() {
  const [list, setList] = useState<Routine[]>([]);
  const [error, setError] = useState("");
  const refresh = useCallback(() => void api.routinesList().then(setList).catch(() => undefined), []);
  useEffect(() => {
    refresh();
    const t = window.setInterval(refresh, 15000);
    return () => clearInterval(t);
  }, [refresh]);

  return (
    <Section
      id="draw-routines"
      title="Routines"
      hint="Things Izuki does by itself on a schedule. Just say it: “every weekday at 8, check my email and send me the summary on my phone”, then “turn it on”."
    >
      {list.length === 0 && (
        <p className="text-[11.5px] text-izk-muted">
          No routines yet. Try saying “every evening, summarise my unread emails” or “every Friday at 5pm, make a weekly report of my missions”.
        </p>
      )}
      {error && <p role="alert" className="mb-1.5 text-[11.5px] text-izk-danger">{error}</p>}
      <ul className="space-y-1.5">
        {list.map((r) => (
          <li key={r.id} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-[12px]">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-izk-ink">{r.task}</div>
                <div className="text-[11px] text-izk-muted">
                  {EVERY[r.every] ?? r.every}
                  {r.every !== "hourly" && ` at ${at(r.at)}`}
                  {r.phone && " · tells your phone"}
                  {r.active && r.next > 0 && ` · next ${new Date(r.next).toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" })}`}
                </div>
              </div>
              <Toggle
                checked={r.active}
                onChange={(v) =>
                  void api
                    .routineSet(r.id, v)
                    .then((l) => {
                      setList(l);
                      setError("");
                    })
                    .catch(() => {
                      setError("Couldn't change that routine — try again.");
                      refresh();
                    })
                }
              />
              <button
                type="button"
                aria-label={`Delete the routine “${r.task}”`}
                onClick={() =>
                  void api
                    .routineDelete(r.id)
                    .then((l) => {
                      setList(l);
                      setError("");
                    })
                    .catch(() => {
                      setError("Couldn't delete that routine — try again.");
                      refresh();
                    })
                }
                className="izk-pill izk-no-drag px-2 py-0.5 text-[10.5px]"
              >
                Delete
              </button>
            </div>
            {r.last_run > 0 && (
              <div className="mt-1.5 text-[11px] leading-snug text-izk-muted">
                Last run {new Date(r.last_run).toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" })} — {OUTCOME[r.last_outcome] ?? r.last_outcome}
                {r.last_result && <span className="block text-izk-ink/80">{r.last_result.slice(0, 220)}{r.last_result.length > 220 ? "…" : ""}</span>}
              </div>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}
