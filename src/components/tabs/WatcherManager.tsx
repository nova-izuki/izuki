import { useEffect } from "react";
import { Eye, Radar, Trash2 } from "lucide-react";
import { Badge, EmptyState, Section, Toggle, cx } from "../ui";
import { useIzuki } from "../../lib/store";
import { api } from "../../lib/ipc";
import type { Watcher, WatcherCondition } from "../../lib/types";

function describe(c: WatcherCondition): string {
  switch (c.kind) {
    case "pixel_color":
      return `turns ${c.color} (±${c.tolerance})`;
    case "region_changed":
      return `changes by ${c.threshold}%`;
    case "text_appears":
      return `shows “${c.text}”`;
    case "text_disappears":
      return `stops showing “${c.text}”`;
    case "vision":
      return c.question;
  }
}

const STATUS_TONE = {
  idle: "neutral",
  watching: "accent",
  triggered: "good",
  error: "bad",
} as const;

export function WatcherManager() {
  const watchers = useIzuki((s) => s.watchers);
  const reload = useIzuki((s) => s.reloadWatchers);

  useEffect(() => {
    void reload();
    const t = setInterval(() => void reload(), 2000);
    return () => clearInterval(t);
  }, [reload]);

  const live = watchers.filter((w) => w.enabled).length;

  return (
    <>
      <div className="izk-card izk-grain relative overflow-hidden p-[16px]">
        <div
          className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full blur-[48px]"
          style={{ background: "radial-gradient(circle,rgba(78,205,196,0.45),transparent 70%)" }}
        />
        <div className="relative flex items-center gap-3">
          <div className="relative flex h-[44px] w-[44px] items-center justify-center rounded-[16px] border border-izk-teal/30 bg-izk-teal/12 text-izk-teal">
            <Radar size={20} strokeWidth={2} className={live ? "izk-breathe" : undefined} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[14px] font-bold tracking-[-0.015em] text-izk-ink">
              {live ? `${live} watcher${live === 1 ? "" : "s"} on duty` : "Nothing being watched"}
            </h2>
            <p className="mt-0.5 text-[11px] leading-snug text-izk-muted">
              Draw a box, right-click, pick <span className="text-izk-ink">Watch</span>. Izuki keeps
              an eye on that patch of screen and acts the moment it changes.
            </p>
          </div>
        </div>
      </div>

      {watchers.length === 0 ? (
        <EmptyState
          icon={<Eye size={30} strokeWidth={1.6} />}
          title="No watchers running"
          body="Perfect for drops, ticket queues and slow forms: Izuki polls the region in the background and clicks the instant your condition is met."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {watchers.map((w) => (
            <WatcherRow key={w.id} w={w} onChanged={reload} />
          ))}
        </div>
      )}

      <Section
        title="How a watcher thinks"
        hint="Each one polls its own region on its own cadence, so ten watchers cost far less than one full-screen loop."
      >
        <ul className="flex flex-col gap-1.5 text-[11px] leading-relaxed text-izk-muted">
          <li>
            <span className="text-izk-ink">Pixel colour</span> — cheapest. Great for a button that
            turns green.
          </li>
          <li>
            <span className="text-izk-ink">Region changed</span> — fires on any visible difference.
          </li>
          <li>
            <span className="text-izk-ink">Text appears</span> — local OCR, no network, no cost.
          </li>
          <li>
            <span className="text-izk-ink">Ask the model</span> — full vision check on a slow
            cadence when the answer needs judgement.
          </li>
        </ul>
      </Section>
    </>
  );
}

function WatcherRow({ w, onChanged }: { w: Watcher; onChanged: () => Promise<void> }) {
  return (
    <div className="izk-card izk-card-hover izk-grain flex items-center gap-3 p-3">
      <div
        className={cx(
          "relative flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[14px] border",
          w.enabled
            ? "border-izk-teal/35 bg-izk-teal/12 text-izk-teal"
            : "border-white/10 bg-white/5 text-izk-muted"
        )}
      >
        <Eye size={17} strokeWidth={2.1} className={w.enabled ? "izk-blink" : undefined} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[12.5px] font-semibold text-izk-ink">{w.name}</span>
          <Badge tone={STATUS_TONE[w.status]}>{w.status}</Badge>
        </div>
        <div className="mt-[3px] truncate text-[10.5px] text-izk-muted">
          when it {describe(w.condition)} → {w.action.kind.replace("_", " ")}
        </div>
        <div className="mt-[3px] font-mono text-[9.5px] text-izk-muted/70">
          {w.region.w}×{w.region.h} at {w.region.x},{w.region.y} · every {w.interval_ms}ms ·{" "}
          {w.trigger_count} fired
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Toggle
          checked={w.enabled}
          onChange={async (v) => {
            await api.toggleWatcher(w.id, v);
            await onChanged();
          }}
        />
        <button
          type="button"
          title="Delete watcher"
          aria-label="Delete watcher"
          onClick={async () => {
            await api.deleteWatcher(w.id);
            await onChanged();
          }}
          className="izk-no-drag flex h-[26px] w-[26px] items-center justify-center rounded-full border border-white/10 bg-white/5 text-izk-muted transition-all duration-200 hover:border-izk-danger/40 hover:bg-izk-danger/18 hover:text-izk-danger active:scale-90"
        >
          <Trash2 size={12} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}
