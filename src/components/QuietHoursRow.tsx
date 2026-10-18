import { Row, Toggle } from "./ui";

/** Quiet hours: "22:00-07:00", or empty when off. */
export function QuietHoursRow({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [from, to] = value.includes("-") ? value.split("-") : ["", ""];
  const on = !!from && !!to && from !== to;
  const set = (a: string, b: string) => onChange(`${a || "22:00"}-${b || "07:00"}`);
  return (
    <Row label="Quiet hours" hint="Heads-ups wait and come as one summary when quiet hours end, and the Island doesn't pop up suggestions. Timers and alarms you set still ring.">
      <div className="flex items-center gap-1.5">
        <input
          type="time"
          aria-label="Quiet from"
          value={on ? from : "22:00"}
          disabled={!on}
          onChange={(e) => set(e.target.value, to)}
          className="izk-field izk-no-drag h-[30px] w-[88px] py-0 text-[12px] disabled:opacity-40"
        />
        <span className="text-[11px] text-izk-muted">to</span>
        <input
          type="time"
          aria-label="Quiet until"
          value={on ? to : "07:00"}
          disabled={!on}
          onChange={(e) => set(from, e.target.value)}
          className="izk-field izk-no-drag h-[30px] w-[88px] py-0 text-[12px] disabled:opacity-40"
        />
        <Toggle checked={on} onChange={(v) => onChange(v ? "22:00-07:00" : "")} />
      </div>
    </Row>
  );
}
