import type { ReactNode } from "react";
import { ChevronDown, FileText, FolderOpen, HardDrive, ShieldCheck } from "lucide-react";
import { parseStorageReport, type StorageReportData } from "../lib/storageReport";
import { ChatText } from "./ChatText";

function Summary({
  title,
  icon,
  items,
  tone = "text-izk-muted",
}: {
  title: string;
  icon: ReactNode;
  items: string[];
  tone?: string;
}) {
  if (!items.length) return null;
  return (
    <section className="mt-2.5">
      <div className={`flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] ${tone}`}>
        {icon}
        {title}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={`${i}:${item}`} className="rounded-full border border-white/10 bg-white/[0.045] px-2 py-1 text-[10.5px] leading-none text-izk-ink/85">
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

export function StorageReport({ report }: { report: StorageReportData }) {
  const low = report.drives.some((drive) => drive.freeGb < 10 || drive.freeGb / drive.totalGb < 0.05);
  return (
    <section className="my-1.5 overflow-hidden rounded-[13px] border border-white/12 bg-black/20">
      <div className="flex items-center justify-between gap-3 border-b border-white/8 bg-white/[0.035] px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-izk-teal/15 text-izk-teal">
            <HardDrive size={14} strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <div className="text-[12px] font-semibold text-izk-ink">Storage checkup</div>
            <div className="text-[10px] text-izk-muted">Measured on this PC · nothing deleted</div>
          </div>
        </div>
        <span className={low ? "rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-[9.5px] font-bold uppercase tracking-wide text-amber-200" : "rounded-full border border-izk-teal/25 bg-izk-teal/10 px-2 py-1 text-[9.5px] font-bold uppercase tracking-wide text-izk-teal"}>
          {low ? "Tight" : "Healthy"}
        </span>
      </div>

      <div className="space-y-2.5 px-3 py-3">
        {report.drives.map((drive, i) => (
          <div key={`${i}:${drive.name}`}>
            <div className="flex items-baseline justify-between gap-2 text-[11px]">
              <span className="font-semibold text-izk-ink">{drive.name}</span>
              <span className="text-izk-muted">{drive.freeLabel} free of {drive.totalLabel}</span>
            </div>
            <div
              className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/8"
              role="progressbar"
              aria-label={`${drive.name} used`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(drive.usedPercent)}
              aria-valuetext={`${Math.round(drive.usedPercent)}% used, ${drive.freeLabel} free`}
            >
              <span
                className={low ? "block h-full rounded-full bg-gradient-to-r from-amber-300/80 to-rose-400/80" : "block h-full rounded-full bg-gradient-to-r from-izk-teal/80 to-cyan-300/80"}
                style={{ width: `${Math.max(2, drive.usedPercent)}%` }}
              />
            </div>
            <div className="mt-1 text-[10px] text-izk-muted">{drive.usedLabel} used · {Math.round(drive.usedPercent)}%</div>
          </div>
        ))}

        <Summary title="Biggest installed apps" icon={<FolderOpen size={11} />} items={report.apps} />
        <Summary title="Biggest folders" icon={<FolderOpen size={11} />} items={report.folders} />
        {report.inside.map((group, i) => (
          <Summary key={`${i}:${group.name}`} title={`Inside ${group.name}`} icon={<FolderOpen size={11} />} items={group.items} />
        ))}
        <Summary title="Biggest files" icon={<FileText size={11} />} items={report.files} />
        <Summary title="Safe to clear" icon={<ShieldCheck size={11} />} items={report.safe} tone="text-izk-teal/85" />
      </div>

      <details className="group border-t border-white/8 px-3 py-2">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[10px] font-medium text-izk-muted hover:text-izk-ink [&::-webkit-details-marker]:hidden">
          <ChevronDown size={11} className="transition-transform group-open:rotate-180" />
          Exact scan output
        </summary>
        <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-[7px] bg-black/30 p-2 font-mono text-[10px] leading-relaxed text-izk-muted">{report.raw}</pre>
      </details>
    </section>
  );
}

/** Use the structured card for measured storage reports; ordinary chat stays chat. */
export function AssistantText({ text }: { text: string }) {
  const report = parseStorageReport(text);
  return report ? <StorageReport report={report} /> : <ChatText text={text} />;
}
