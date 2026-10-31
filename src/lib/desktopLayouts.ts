import type { WindowsTweak } from "./ipc";

export interface DesktopLayout {
  id: string;
  name: string;
  hint: string;
  accent: string;
  left: boolean;
  labels: boolean;
  hideBar: boolean;
  hideIcons: boolean;
  compact: boolean;
  search: boolean;
}

export const DESKTOP_LAYOUTS: readonly DesktopLayout[] = [
  { id: "studio", name: "Studio", hint: "Centred apps, a clean taskbar and tighter File Explorer rows.", accent: "#8b9aff", left: false, labels: false, hideBar: false, hideIcons: false, compact: true, search: false },
  { id: "classic", name: "Classic workspace", hint: "Apps on the left, a separate named button for each window and compact files.", accent: "#67d9be", left: true, labels: true, hideBar: false, hideIcons: false, compact: true, search: false },
  { id: "gallery", name: "Photo gallery", hint: "Your picture takes the stage. Icons hide; move to the bottom edge to reach the taskbar.", accent: "#f4ba79", left: false, labels: false, hideBar: true, hideIcons: true, compact: false, search: false },
  { id: "comfort", name: "Room to breathe", hint: "Keep the taskbar and search visible, with roomier file rows and desktop icons.", accent: "#de9ee9", left: false, labels: false, hideBar: false, hideIcons: false, compact: false, search: true },
];

export interface LayoutChange { id: string; before: boolean; after: boolean }
export interface LayoutPort {
  read: () => Promise<WindowsTweak[]>;
  set: (id: string, on: boolean) => Promise<WindowsTweak[]>;
}

export function layoutSwitches(layout: DesktopLayout): Record<string, boolean> {
  return {
    taskbar_left: layout.left, taskbar_autohide: layout.hideBar,
    never_combine: layout.labels, no_search_box: !layout.search,
    no_task_view: !layout.search, compact_explorer: layout.compact,
    clean_desktop: layout.hideIcons,
  };
}

const allowed = new Set(Object.keys(layoutSwitches(DESKTOP_LAYOUTS[0])));

/** Saved Undo contains switch choices only, never file paths or personal data. */
export function readLayoutUndo(text: string | null): LayoutChange[] {
  try {
    const value: unknown = JSON.parse(text ?? "null");
    if (!Array.isArray(value) || value.length > allowed.size) return [];
    const seen = new Set<string>();
    return value.every((v) => v && allowed.has(v.id) && !seen.has(v.id) && seen.add(v.id) && typeof v.before === "boolean" && typeof v.after === "boolean") ? value : [];
  } catch { return []; }
}

async function changeSwitches(port: LayoutPort, changes: LayoutChange[], initial: WindowsTweak[]) {
  let latest = initial;
  const attempted: LayoutChange[] = [];
  try {
    for (const change of changes) {
      attempted.push(change);
      latest = await port.set(change.id, change.after);
      if (latest.find((t) => t.id === change.id)?.on !== change.after) throw new Error("Windows didn't keep that switch.");
    }
  } catch (error) {
    let restored = true;
    for (const change of attempted.reverse()) {
      try {
        const state = await port.set(change.id, change.before);
        if (state.find((t) => t.id === change.id)?.on !== change.before) restored = false;
      } catch { restored = false; }
    }
    throw new Error(`${String(error)} ${restored ? "The switches already changed were put back." : "Some switches couldn't be put back. Check them under Tweaks."}`);
  }
  return { tweaks: latest, restart: changes.some((c) => initial.find((t) => t.id === c.id)?.restart) };
}

/** Native layout switches only: this never calls wallpaper, colours or Auto. */
export async function applyDesktopLayout(port: LayoutPort, id: string) {
  const layout = DESKTOP_LAYOUTS.find((p) => p.id === id);
  if (!layout) throw new Error("Choose one of the layouts shown here.");
  const initial = await port.read();
  const changes: LayoutChange[] = [];
  for (const [key, after] of Object.entries(layoutSwitches(layout))) {
    const current = initial.find((t) => t.id === key);
    if (!current) throw new Error("Layouts need the Windows desktop app. Update Izuki if a switch is missing.");
    if (current.on !== after) changes.push({ id: key, before: current.on, after });
  }
  return { ...await changeSwitches(port, changes, initial), undo: changes };
}

/** Later manual edits win: Undo only restores switches still set by this layout. */
export async function undoDesktopLayout(port: LayoutPort, undo: LayoutChange[]) {
  const safe = readLayoutUndo(JSON.stringify(undo));
  if (!safe.length) throw new Error("There is no saved layout to undo.");
  const initial = await port.read();
  const changes = safe.filter((c) => initial.find((t) => t.id === c.id)?.on === c.after)
    .map((c) => ({ id: c.id, before: c.after, after: c.before }));
  return { ...await changeSwitches(port, changes, initial), restored: changes.length, skipped: safe.length - changes.length };
}
