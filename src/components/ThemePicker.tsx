import { Check } from "lucide-react";
import { useIzuki } from "../lib/store";
import { THEMES, autoTheme } from "../lib/themes";
import { Section } from "./ui";

const css = ([r, g, b]: [number, number, number]) => `rgb(${r}, ${g}, ${b})`;

/** Big, tappable colour swatches for the app — the change shows at once. */
export function ThemePicker() {
  const theme = useIzuki((s) => s.settings.app_theme) ?? "nova";
  const custom = useIzuki((s) => s.settings.app_theme_color) || "#8a6cff";
  const patch = useIzuki((s) => s.patchSettings);
  const now = THEMES[autoTheme(new Date().getHours())];

  const Swatch = ({ id, label, background }: { id: string; label: string; background: string }) => (
    <button
      type="button"
      onClick={() => patch({ app_theme: id })}
      aria-pressed={theme === id}
      className="izk-no-drag flex flex-col items-center gap-1.5 text-[11px] text-izk-muted transition-colors hover:text-izk-ink"
    >
      <span
        className="relative flex h-11 w-11 items-center justify-center rounded-full shadow-[0_6px_18px_rgba(0,0,0,0.35)] transition-transform hover:scale-105"
        style={{ background, outline: theme === id ? "2px solid white" : "none", outlineOffset: 3 }}
      >
        {theme === id && <Check size={16} strokeWidth={3} className="text-white drop-shadow" />}
      </span>
      {label}
    </button>
  );

  return (
    <Section id="settings-theme" title="App colours" hint="The glow behind the glass. Auto changes with the time of day — golden mornings, ocean days, sunset evenings, violet nights.">
      <div className="grid grid-cols-5 gap-y-3 sm:grid-cols-9">
        <Swatch id="auto" label="Auto" background={`conic-gradient(${css(THEMES.gold.a)}, ${css(THEMES.ocean.a)}, ${css(THEMES.sunset.b)}, ${css(THEMES.nova.a)}, ${css(THEMES.gold.a)})`} />
        {Object.entries(THEMES).map(([id, t]) => (
          <Swatch key={id} id={id} label={t.name} background={`linear-gradient(135deg, ${css(t.a)}, ${css(t.c)} 55%, ${css(t.b)})`} />
        ))}
        <label className="izk-no-drag flex cursor-pointer flex-col items-center gap-1.5 text-[11px] text-izk-muted hover:text-izk-ink">
          <span
            className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full shadow-[0_6px_18px_rgba(0,0,0,0.35)]"
            style={{ background: custom, outline: theme === "custom" ? "2px solid white" : "none", outlineOffset: 3 }}
          >
            {theme === "custom" ? <Check size={16} strokeWidth={3} className="text-white drop-shadow" /> : <span className="text-[18px] text-white drop-shadow">+</span>}
            <input
              type="color"
              value={custom}
              aria-label="Pick your own colour"
              onChange={(e) => patch({ app_theme: "custom", app_theme_color: e.target.value })}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </span>
          Yours
        </label>
      </div>
      {theme === "auto" && <p className="mt-2 text-[11px] text-izk-muted">Right now: {now.name}.</p>}
    </Section>
  );
}
