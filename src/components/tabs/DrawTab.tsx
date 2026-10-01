import { useRef } from "react";
import {
  ArrowUpRight,
  Circle,
  Magnet,
  MousePointerClick,
  PenTool,
  Snowflake,
  Sparkles,
  Square,
  Type,
} from "lucide-react";
import { HandCursor } from "../HandCursor";
import { TalkToIzuki } from "../TalkToIzuki";
import { MemoryCard } from "../MemoryCard";
import { TeachingCard } from "../TeachingCard";
import { Kbd, Row, Section, Segmented, Toggle, Badge, cx } from "../ui";
import { useIzuki } from "../../lib/store";
import { api } from "../../lib/ipc";
import type { ShapeKind } from "../../lib/types";

const LANGUAGE: Array<{
  icon: React.ReactNode;
  name: string;
  means: string;
  tone: string;
  shape: ShapeKind;
}> = [
  {
    icon: <Square size={15} strokeWidth={2.2} />,
    name: "Box",
    means: "Watch / focus this area",
    tone: "#FF5F7A",
    shape: "box",
  },
  {
    icon: <ArrowUpRight size={15} strokeWidth={2.2} />,
    name: "Arrow",
    means: "Drag from here to there",
    tone: "#4ECDC4",
    shape: "arrow",
  },
  {
    icon: <Circle size={15} strokeWidth={2.2} />,
    name: "Circle",
    means: "Click right here",
    tone: "#7C5CFF",
    shape: "circle",
  },
  {
    icon: <PenTool size={15} strokeWidth={2.2} />,
    name: "Scribble",
    means: "Read it as an instruction",
    tone: "#FFE66D",
    shape: "pen",
  },
];

/** Quick ink swatches; the dashed circle after them picks any colour. */
const INKS = ["#FF5F7A", "#FFE66D", "#4ECDC4", "#3380FF", "#7C5CFF", "#FFFFFF"];

/** The two automatic inks — plain per-shape colours, or per-shape gradients. */
const INK_MODES = [
  {
    value: "auto",
    label: "Auto",
    title: "Auto — each shape its own plain colour",
    swatch: "conic-gradient(#FF5F7A,#FFE66D,#4ECDC4,#7C5CFF,#FF5F7A)",
  },
  {
    value: "gradient",
    label: "Gradient",
    title: "Gradient — each shape its own two-tone glow",
    swatch: "linear-gradient(90deg,#FFE66D,#FF5F7A,#7C5CFF,#4ECDC4)",
  },
];

export function DrawTab() {
  const settings = useIzuki((s) => s.settings);
  const patch = useIzuki((s) => s.patchSettings);
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* ------------------------------------------------ hero */}
      <div className="izk-card izk-grain relative overflow-hidden p-0">
        <div
          className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full blur-[52px]"
          style={{ background: "radial-gradient(circle,rgba(124,92,255,0.55),transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-12 h-56 w-56 rounded-full blur-[52px]"
          style={{ background: "radial-gradient(circle,rgba(78,205,196,0.4),transparent 70%)" }}
        />

        {/* live hand preview surface */}
        <div
          ref={previewRef}
          className="relative h-[162px] w-full overflow-hidden rounded-t-[22px] border-b border-white/8"
          style={{
            background:
              "repeating-linear-gradient(0deg,rgba(255,255,255,0.028) 0 1px,transparent 1px 22px)," +
              "repeating-linear-gradient(90deg,rgba(255,255,255,0.028) 0 1px,transparent 1px 22px)",
          }}
        >
          {/* fake UI the hand can hover, so the preview reads as a real screen */}
          <div className="absolute left-[22px] top-[44px] flex flex-col gap-2">
            <div className="h-[9px] w-[74px] rounded-full bg-white/12" />
            <div className="h-[9px] w-[112px] rounded-full bg-white/7" />
          </div>
          <div className="absolute right-[26px] top-[44px] h-[30px] w-[86px] rounded-[11px] border border-izk-violet/40 bg-izk-violet/15" />
          <div className="absolute bottom-[26px] left-[26px] h-[26px] w-[150px] rounded-[9px] border border-white/10 bg-black/30" />
          <div
            className="absolute bottom-[24px] right-[26px] h-[30px] w-[70px] rounded-full"
            style={{ background: "linear-gradient(135deg,#7C5CFF,#4ECDC4)", opacity: 0.85 }}
          />

          <HandCursor trail={settings.trail_length} size={36} />

          <div className="pointer-events-none absolute left-1/2 top-[8px] -translate-x-1/2 whitespace-nowrap">
            <Badge tone="accent">
              <Sparkles size={9} strokeWidth={2.6} /> live hand preview — move your mouse here
            </Badge>
          </div>
        </div>

        <div className="relative p-[16px]">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-bold tracking-[-0.015em] text-izk-ink">
                Draw it. Izuki does it.
              </h2>
              <p className="mt-1 text-[11.5px] leading-relaxed text-izk-muted">
                Freeze the screen, scribble what you want, and the hand takes over.
              </p>
            </div>
          </div>

          <div className="mt-3.5 flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => void api.openOverlay()}
              className="izk-btn-primary izk-no-drag flex h-[38px] flex-1 items-center justify-center gap-2 whitespace-nowrap text-[13px]"
            >
              <MousePointerClick size={15} strokeWidth={2.6} />
              Draw now
            </button>
            <div className="izk-inset flex h-[38px] items-center gap-2 rounded-full px-3.5">
              <Kbd combo={settings.hotkey_draw} />
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ hands-free */}
      <TalkToIzuki />
      <TeachingCard />

      {/* ------------------------------------------------ memory */}
      <MemoryCard />

      {/* ------------------------------------------------ draw language */}
      <Section
        title="The draw language"
        hint="Four marks. Chain them 1 → 2 → 3 in one pass to build a whole workflow."
      >
        <div className="grid grid-cols-2 gap-2">
          {LANGUAGE.map((l) => (
            <div
              key={l.name}
              className="izk-card izk-card-hover flex items-center gap-2.5 rounded-[16px] p-2.5"
            >
              <span
                className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[11px] border"
                style={{
                  color: l.tone,
                  borderColor: `${l.tone}44`,
                  background: `${l.tone}1A`,
                }}
              >
                {l.icon}
              </span>
              <div className="min-w-0">
                <div className="text-[12px] font-semibold text-izk-ink">{l.name}</div>
                <div className="truncate text-[10.5px] text-izk-muted">{l.means}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-[14px] border border-izk-teal/20 bg-izk-teal/8 p-2.5">
          <Type size={13} strokeWidth={2.4} className="mt-[1px] shrink-0 text-izk-teal" />
          <p className="text-[10.5px] leading-relaxed text-izk-muted">
            Right-click while drawing for the hand-sign menu:{" "}
            <span className="text-izk-ink">Click · Type · Drag · Watch · Chain</span>. Hold{" "}
            <span className="font-mono text-izk-ink">Space</span> to dictate instead of typing.
          </p>
        </div>

        <div className="izk-divider my-3" />

        <Row
          label="Default shape"
          hint="What a fresh draw session — and quickdraw — starts on."
        >
          <Segmented<ShapeKind>
            size="sm"
            value={settings.default_draw_shape}
            onChange={(v) => patch({ default_draw_shape: v })}
            options={LANGUAGE.map((l) => ({ value: l.shape, label: l.name, icon: l.icon }))}
          />
        </Row>

        <Row
          label="Ink colour"
          hint="The lines you draw — Ctrl+D quickdraw too. Auto: each shape its own colour. Gradient: each shape its own two-tone glow."
        >
          <div className="izk-no-drag flex flex-wrap items-center justify-end gap-1.5">
            {INK_MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => patch({ ink_color: m.value })}
                title={m.title}
                className={cx(
                  "h-[22px] rounded-full border px-2 text-[10.5px] font-semibold transition-all",
                  settings.ink_color === m.value
                    ? "border-white/70 text-izk-ink"
                    : "border-white/12 text-izk-muted hover:text-izk-ink"
                )}
                style={{ background: m.swatch }}
              >
                <span className="rounded-full bg-black/55 px-1">{m.label}</span>
              </button>
            ))}
            {INKS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => patch({ ink_color: c })}
                title={c}
                aria-label={`Ink ${c}`}
                className={cx(
                  "h-[20px] w-[20px] rounded-full border-2 transition-transform hover:scale-110",
                  settings.ink_color.toLowerCase() === c.toLowerCase()
                    ? "border-white scale-110"
                    : "border-white/15"
                )}
                style={{ background: c }}
              />
            ))}
            <label
              title="Pick any colour"
              className="relative h-[20px] w-[20px] cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-white/30"
              style={{
                background: settings.ink_color.startsWith("#") && !INKS.includes(settings.ink_color)
                  ? settings.ink_color
                  : "transparent",
              }}
            >
              <input
                type="color"
                value={settings.ink_color.startsWith("#") ? settings.ink_color : "#3380ff"}
                onChange={(e) => patch({ ink_color: e.target.value })}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
          </div>
        </Row>
      </Section>

      {/* ------------------------------------------------ quick switches */}
      <Section title="Behaviour" hint="Tuned for speed — every switch is live, nothing to save.">
        <QuickRow
          icon={<Magnet size={14} strokeWidth={2.3} />}
          label="Magnetic hand"
          hint="Snap to the real button under your mark instead of a raw pixel."
          checked={settings.magnetic_hand}
          onChange={(v) => patch({ magnetic_hand: v })}
        />
        <div className="izk-divider" />
        <QuickRow
          icon={<Snowflake size={14} strokeWidth={2.3} />}
          label="Freeze screen"
          hint="Paint the captured frame behind the overlay so nothing moves while you draw."
          checked={settings.freeze_screen}
          onChange={(v) => patch({ freeze_screen: v })}
        />
        <div className="izk-divider" />
        <QuickRow
          icon={<Sparkles size={14} strokeWidth={2.3} />}
          label="Ghost hand"
          hint="After three passes in an app, Izuki pre-draws its guess."
          checked={settings.ghost_hand}
          onChange={(v) => patch({ ghost_hand: v })}
        />
        <div className="izk-divider" />
        <QuickRow
          icon={<MousePointerClick size={14} strokeWidth={2.3} />}
          label="Dry run"
          hint="Animate the hand but send no real clicks. Safe for trying things out."
          checked={settings.dry_run}
          onChange={(v) => patch({ dry_run: v })}
          warn
        />
      </Section>
    </>
  );
}

function QuickRow({
  icon,
  label,
  hint,
  checked,
  onChange,
  warn,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  warn?: boolean;
}) {
  return (
    <Row
      icon={<span className={cx(warn && checked && "text-izk-hand")}>{icon}</span>}
      label={label}
      hint={hint}
    >
      <Toggle checked={checked} onChange={onChange} />
    </Row>
  );
}
