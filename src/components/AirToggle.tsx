import { useEffect, useRef, useState } from "react";
import { api, emit, EV, on } from "../lib/ipc";
import { useIzuki } from "../lib/store";
import { cx } from "./ui";

type AirMode = "hand" | "eye";

const MODES: Array<{ key: AirMode | "both"; label: string; icon: string; note: string }> = [
  { key: "hand", label: "Hand control", icon: "🖐️", note: "Move and click with a visible hand." },
  { key: "eye", label: "Eye control", icon: "👁️", note: "Look to move the pointer. A double blink clicks, if you turn that on." },
  { key: "both", label: "Hand + Eye", icon: "◎", note: "Using both together isn't available yet." },
];

const HAND_MOVES: Array<[string, string]> = [
  ["✋ Open hand", "moves the pointer"],
  ["🤏 Thumb + index", "click; hold to drag"],
  ["🤌 Thumb + middle", "right-click"],
  ["✌️ Two fingers", "scroll"],
  ["✊ Fist", "pause / resume"],
];

/**
 * Air control on/off and a discoverable mode picker.
 *
 * The main control opens the picker instead of silently toggling a mode the
 * person cannot see. The picker has a keyboard path (Tab/Enter/Escape) and
 * the same menu is available by right-clicking the chip. Hand remains the
 * safe default; Both is deliberately disabled until the native Eye owner
 * verifies simultaneous input.
 */
export function AirToggle({ variant = "chip", className }: { variant?: "chip" | "mini" | "panel"; className?: string }) {
  const [onNow, setOn] = useState<boolean | null>(null);
  const [mode, setMode] = useState<AirMode>("hand");
  const [open, setOpen] = useState(false);
  const [guide, setGuide] = useState(false);
  const setTab = useIzuki((s) => s.setTab);
  const box = useRef<HTMLSpanElement>(null);
  /** The button that opens the picker: Escape gives focus back to it. */
  const trigger = useRef<HTMLButtonElement>(null);
  /** The latest value, so quick double taps flip from where the last tap left it. */
  const current = useRef<boolean | null>(null);
  /** The latest mode pick: an older one whose release finished late isn't saved. */
  const pick = useRef(0);
  current.current = onNow;

  useEffect(() => {
    let alive = true;
    const read = () =>
      void api
        .getSettings()
        .then((s) => {
          if (!alive) return;
          setOn(!!s.air_enabled);
          setMode(s.air_control_mode === "eye" ? "eye" : "hand");
        })
        .catch(() => undefined);
    read();
    const off = on<void>(EV.settingsChanged, read);
    return () => {
      alive = false;
      void off.then((f) => f());
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === "Escape") {
          setOpen(false);
          trigger.current?.focus();
        }
        return;
      }
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  if (onNow === null) return null;

  /** Air off: the stop lets go of anything Air still holds, and it's saved off. */
  const turnOff = () => {
    current.current = false;
    setOn(false);
    void api.airStop().catch(() => undefined);
    void emit(EV.patchSettings, { air_enabled: false });
  };

  const flip = () => {
    if (current.current) return turnOff();
    current.current = true;
    setOn(true);
    // Turning it on is the explicit re-arm after an emergency stop.
    void api.airArm().catch(() => undefined).finally(() => void emit(EV.patchSettings, { air_enabled: true }));
  };

  const stopNow = () => {
    setOpen(false);
    turnOff();
  };

  const openSettings = () => {
    setOpen(false);
    setTab("settings");
    window.setTimeout(() => document.getElementById("settings-air")?.scrollIntoView({ behavior: "smooth", block: "start" }), 160);
  };

  const choose = async (next: AirMode) => {
    const mine = ++pick.current;
    setMode(next);
    setOpen(false);
    // Hand and Eye never own input together. Leaving Eye lets go of anything
    // it holds first (not the emergency stop, which would save Air as off when
    // the person only changed mode), then the new mode is saved.
    if (mode === "eye" && next !== "eye") await api.airRelease().catch(() => undefined);
    if (mine !== pick.current) return;
    // Persist the preference even while Air is off, so the next arm uses it.
    void emit(EV.patchSettings, { air_control_mode: next });
  };

  const lane = mode === "eye" ? "Eye" : "Hand";
  const icon = mode === "eye" ? "👁️" : "🖐️";
  const title = `${lane} control is ${onNow ? "on" : "selected"}. Click for mode and power.`;
  const menu = open && (
    <span
      role="group"
      aria-label="AIR control mode and power"
      data-izk-hit
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className="absolute right-0 top-[calc(100%+6px)] z-[80] max-h-[calc(100vh-120px)] w-[230px] overflow-y-auto rounded-[12px] border border-white/12 bg-[#0b0e17]/98 p-1.5 text-left shadow-[0_18px_48px_rgba(0,0,0,0.65)] backdrop-blur-xl"
    >
      <span className="flex items-center justify-between gap-2 px-2 pb-1 pt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-izk-muted">
        <span>AIR control</span>
        <span className={onNow ? "text-izk-teal" : "text-izk-muted/70"}>{onNow ? "ON" : "OFF"}</span>
      </span>
      {MODES.map((m) => {
        const disabled = m.key === "both";
        return (
          <button
            key={m.key}
            type="button"
            aria-pressed={!disabled && mode === m.key}
            disabled={disabled}
            title={m.note}
            onClick={() => !disabled && choose(m.key as AirMode)}
            className={cx(
              "flex w-full items-start gap-2 rounded-[8px] px-2 py-2 text-left transition-colors",
              disabled ? "cursor-not-allowed opacity-45" : "hover:bg-white/8",
              !disabled && mode === m.key ? "bg-white/[0.07]" : ""
            )}
          >
            <span className="mt-[1px] w-[18px] shrink-0 text-center text-[13px]" aria-hidden="true">{m.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11.5px] font-semibold text-izk-ink">{m.label}</span>
              <span className="mt-0.5 block text-[9.5px] leading-snug text-izk-muted">{m.note}</span>
            </span>
            {!disabled && mode === m.key ? <span className="mt-[4px] text-[10px] text-izk-teal">✓</span> : null}
          </button>
        );
      })}
      <span className="my-1 block h-px bg-white/8" />
      <button
        type="button"
        aria-expanded={guide}
        onClick={() => setGuide((v) => !v)}
        className="flex w-full items-center gap-2 rounded-[8px] px-2 py-2 text-left text-[11px] font-medium text-izk-ink hover:bg-white/8"
      >
        <span className="w-[18px] text-center" aria-hidden="true">🖐️</span>
        <span className="flex-1">Hand moves</span>
        <span className="text-[9px] text-izk-muted" aria-hidden="true">{guide ? "▴" : "▾"}</span>
      </button>
      {guide && (
        <span role="group" aria-label="Hand gestures" className="mx-1 mb-1 block rounded-[8px] bg-white/[0.04] px-2 py-1.5">
          {HAND_MOVES.map(([how, what]) => (
            <span key={how} className="flex items-baseline gap-2 py-0.5 text-[10px] leading-snug">
              <span className="w-[92px] shrink-0 text-izk-ink/85">{how}</span>
              <span className="text-izk-muted">{what}</span>
            </span>
          ))}
        </span>
      )}
      <button
        type="button"
        // One power button: on, it's the stop (it lets go of anything Air
        // holds and turns it off); off, it turns the chosen mode on.
        onClick={onNow ? stopNow : flip}
        className={cx(
          "flex w-full items-center gap-2 rounded-[8px] px-2 py-2 text-left text-[11px] font-medium",
          onNow ? "text-rose-300 hover:bg-rose-500/10" : "text-izk-ink hover:bg-white/8"
        )}
      >
        <span className="w-[18px] text-center" aria-hidden="true">{onNow ? "■" : "▶"}</span>
        {onNow ? `Stop ${lane} control` : `Turn ${lane} control on`}
      </button>
      <button
        type="button"
        onClick={openSettings}
        className="flex w-full items-center gap-2 rounded-[8px] px-2 py-2 text-left text-[11px] font-medium text-izk-ink hover:bg-white/8"
      >
        <span className="w-[18px] text-center" aria-hidden="true">⚙️</span>
        Air settings
        <span className="ml-auto text-[10px] text-izk-muted" aria-hidden="true">→</span>
      </button>
      <span className="block px-2 pb-1 pt-1 text-[9px] leading-snug text-izk-muted">
        Hand and Eye together isn't available yet.
      </span>
    </span>
  );

  if (variant === "panel") {
    return (
      <span
        ref={box}
        className={cx(
          "izk-no-drag block w-full rounded-[13px] border border-white/10 bg-white/[0.035] p-2.5 text-left",
          className
        )}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-2 text-[11.5px] font-semibold text-izk-ink">
            <span aria-hidden="true">{icon}</span>
            <span className="truncate">{lane} control</span>
            <span className={cx("rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wide", onNow ? "bg-cyan-400/20 text-cyan-200" : "bg-white/8 text-izk-muted")}>
              {onNow ? "ON" : "OFF"}
            </span>
          </span>
          <button
            type="button"
            onClick={flip}
            className={cx(
              "izk-pill shrink-0 px-2.5 py-1 text-[10.5px] font-semibold",
              onNow ? "border-cyan-300/40 text-cyan-100" : "text-izk-ink"
            )}
          >
            {onNow ? "Turn off" : "Turn on"}
          </button>
        </span>
        <span className="mt-2 grid grid-cols-3 gap-1.5" role="group" aria-label="AIR control mode">
          {MODES.map((m) => {
            const disabled = m.key === "both";
            const selected = !disabled && mode === m.key;
            return (
              <button
                key={m.key}
                type="button"
                aria-pressed={selected}
                disabled={disabled}
                title={m.note}
                onClick={() => !disabled && choose(m.key as AirMode)}
                className={cx(
                  "flex min-w-0 items-center justify-center gap-1 rounded-[8px] border px-1.5 py-1.5 text-[10px] font-semibold transition-colors",
                  disabled
                    ? "cursor-not-allowed border-white/6 text-izk-muted/40"
                    : selected
                      ? "border-cyan-300/50 bg-cyan-400/12 text-cyan-100"
                      : "border-white/8 text-izk-muted hover:bg-white/6 hover:text-izk-ink"
                )}
              >
                <span aria-hidden="true">{m.icon}</span>
                <span className="truncate">{m.key === "both" ? "Both" : m.key === "eye" ? "Eye" : "Hand"}</span>
              </button>
            );
          })}
        </span>
        <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-izk-muted">
          <button type="button" onClick={() => setGuide((v) => !v)} className="font-medium text-izk-ink/85 hover:text-izk-ink">
            {guide ? "Hide hand moves" : "Hand moves"}
          </button>
          <button type="button" onClick={openSettings} className="font-medium hover:text-izk-ink">
            Air settings →
          </button>
        </span>
        {guide && (
          <span role="group" aria-label="Hand gestures" className="mt-2 block rounded-[8px] bg-white/[0.04] px-2 py-1.5">
            {HAND_MOVES.map(([how, what]) => (
              <span key={how} className="flex items-baseline gap-2 py-0.5 text-[10px] leading-snug">
                <span className="w-[92px] shrink-0 text-izk-ink/85">{how}</span>
                <span className="text-izk-muted">{what}</span>
              </span>
            ))}
          </span>
        )}
      </span>
    );
  }

  if (variant === "mini") {
    return (
      <span ref={box} className={cx("relative inline-flex", className)}>
        <button
          ref={trigger}
          type="button"
          data-izk-hit
          aria-haspopup="true"
          aria-expanded={open}
          aria-label={`${lane} control. Open AIR mode picker.`}
          title={title}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setOpen((v) => !v)}
          onContextMenu={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
          className={cx(
            "flex h-[24px] w-[24px] items-center justify-center rounded-full border text-[12px] shadow-[0_6px_16px_rgba(0,0,0,0.45)] transition-colors",
            onNow ? "border-cyan-300/80 bg-cyan-500/35" : "border-white/15 bg-black/55 opacity-80 hover:opacity-100"
          )}
        >
          {icon}
        </button>
        {menu}
      </span>
    );
  }

  return (
    <span ref={box} className={cx("relative inline-flex", className)}>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`${lane} control selected. Open AIR mode picker.`}
        title={title}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => setOpen((v) => !v)}
        onContextMenu={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
        className={cx(
          "izk-no-drag flex h-[34px] shrink-0 items-center gap-1 rounded-full border px-2 text-[11px] font-semibold text-izk-ink transition-colors",
          onNow ? "border-cyan-300/60 bg-cyan-400/20" : "border-white/10 bg-white/6 hover:bg-white/12"
        )}
      >
        {icon} <span>{onNow ? `${lane} on` : lane}</span> <span aria-hidden="true" className="text-[8px] opacity-65">▾</span>
      </button>
      {menu}
    </span>
  );
}
