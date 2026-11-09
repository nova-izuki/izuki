type Unit = "MB" | "GB" | "TB";

export interface DriveReport {
  name: string;
  freeGb: number;
  totalGb: number;
  freeLabel: string;
  totalLabel: string;
  usedLabel: string;
  usedPercent: number;
}

export interface StorageReportData {
  drives: DriveReport[];
  apps: string[];
  folders: string[];
  inside: Array<{ name: string; items: string[] }>;
  files: string[];
  safe: string[];
  raw: string;
}

const DRIVE = /([A-Z]:) has ([\d.]+) (MB|GB|TB) free of ([\d.]+) (MB|GB|TB)/g;

function toGb(value: number, unit: Unit): number {
  return unit === "MB" ? value / 1024 : unit === "TB" ? value * 1024 : value;
}

function gb(value: number): string {
  if (value >= 100) return `${Math.round(value)} GB`;
  if (value >= 1) return `${value.toFixed(1)} GB`;
  return `${Math.round(value * 1000)} MB`;
}

function section(text: string, label: string): string {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`${escaped}:\\s+(.+?)\\.(?:\\s|$)`, "i").exec(text);
  return match?.[1]?.trim() ?? "";
}

function list(value: string): string[] {
  return value ? value.split(/,\s+/).map((item) => item.trim()).filter(Boolean) : [];
}

/** Parse the native storage report without trusting it as HTML or markdown. */
export function parseStorageReport(text: string): StorageReportData | null {
  const clean = text.replace(/\s+/g, " ").trim();
  const drives: DriveReport[] = [];
  for (const match of clean.matchAll(DRIVE)) {
    const [, name, freeText, freeUnit, totalText, totalUnit] = match;
    const free = Number(freeText);
    const total = Number(totalText);
    if (!Number.isFinite(free) || !Number.isFinite(total) || total <= 0) continue;
    const totalGb = toGb(total, totalUnit as Unit);
    const freeGb = toGb(free, freeUnit as Unit);
    const used = Math.max(0, totalGb - freeGb);
    drives.push({
      name,
      freeGb,
      totalGb,
      freeLabel: `${freeText} ${freeUnit}`,
      totalLabel: `${totalText} ${totalUnit}`,
      usedLabel: gb(used),
      usedPercent: Math.min(100, Math.max(0, (used / totalGb) * 100)),
    });
  }
  if (!drives.length) return null;

  const inside: Array<{ name: string; items: string[] }> = [];
  const insideMatches = clean.matchAll(/Biggest inside ([^:]+):\s+(.+?)\.(?:\s|$)/gi);
  for (const match of insideMatches) {
    inside.push({ name: match[1].trim(), items: list(match[2]) });
  }

  return {
    drives,
    apps: list(section(clean, "Biggest installed apps")),
    folders: list(section(clean, "Biggest folders")),
    inside,
    files: list(section(clean, "Biggest single files")),
    safe: section(clean, "Safe to clear").split(/;\s+/).map((item) => item.trim()).filter(Boolean),
    raw: text.trim(),
  };
}
