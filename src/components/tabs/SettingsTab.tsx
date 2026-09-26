import { useState } from "react";
import {
  Brain,
  Check,
  Coffee,
  Compass,
  Mail,
  Palette,
  Cpu,
  Eye,
  EyeOff,
  Gauge,
  Keyboard,
  Loader2,
  Power,
  ScanText,
  Sparkles,
  Wand2,
} from "lucide-react";
import pkg from "../../../package.json";
import { PhoneCard } from "../PhoneCard";
import { AppsCard } from "../AppsCard";
import { Badge, Row, Section, Segmented, Slider, Toggle, cx } from "../ui";
import { useIzuki } from "../../lib/store";
import { api } from "../../lib/ipc";
import { setChatLook } from "../../lib/tone";
import type { BackdropMode, ProviderId } from "../../lib/types";

const LOCAL_PROVIDERS: ProviderId[] = ["ollama"];

export function SettingsTab() {
  const settings = useIzuki((s) => s.settings);
  const patch = useIzuki((s) => s.patchSettings);
  const setTourOpen = useIzuki((s) => s.setTourOpen);
  const [open, setOpen] = useState<ProviderId | null>(settings.active_provider);
  const [probing, setProbing] = useState<ProviderId | null>(null);
  const [probe, setProbe] = useState<Record<string, string>>({});
  const [reveal, setReveal] = useState<Record<string, boolean>>({});

  function setProvider(id: ProviderId, fields: Partial<(typeof settings.providers)[number]>) {
    patch({
      providers: settings.providers.map((p) => (p.id === id ? { ...p, ...fields } : p)),
    });
  }

  async function runProbe(id: ProviderId) {
    setProbing(id);
    try {
      // The key you just pasted lives in the debounced write-through — flush
      // it first so the backend isn't probed against a stale, empty key.
      await useIzuki.getState().flushSettings();
      const res = await api.probeProvider(id);
      setProbe((p) => ({ ...p, [id]: res }));
    } catch (e) {
      setProbe((p) => ({ ...p, [id]: String(e) }));
    } finally {
      setProbing(null);
    }
  }

  return (
    <>
      {/* ------------------------------------------------ brain */}
      <Section
        title="Izuki's brain"
        hint="Local first, cloud when you want the smarter answer. Both are free."
        right={<Badge tone="accent">{settings.active_provider}</Badge>}
      >
        <div className="flex flex-col gap-2">
          {settings.providers.map((p) => {
            const active = settings.active_provider === p.id;
            const expanded = open === p.id;
            const local = LOCAL_PROVIDERS.includes(p.id);
            return (
              <div
                key={p.id}
                className={cx(
                  "rounded-[17px] border transition-all duration-300",
                  active
                    ? "border-izk-violet/40 bg-izk-violet/10 shadow-[0_8px_26px_rgba(124,92,255,0.22)]"
                    : "border-white/8 bg-white/4 hover:border-white/14"
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : p.id)}
                  className="izk-no-drag flex w-full items-center gap-2.5 p-2.5 text-left"
                >
                  <span
                    className={cx(
                      "flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[11px] border",
                      active
                        ? "border-izk-violet/45 bg-izk-violet/20 text-izk-violet"
                        : "border-white/10 bg-white/6 text-izk-muted"
                    )}
                  >
                    {local ? <Cpu size={14} strokeWidth={2.3} /> : <Brain size={14} strokeWidth={2.3} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[12.5px] font-semibold text-izk-ink">
                        {p.label}
                      </span>
                      {local && <Badge tone="good">offline</Badge>}
                    </span>
                    <span className="mt-[2px] block truncate font-mono text-[10px] text-izk-muted">
                      {p.model}
                    </span>
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      patch({ active_provider: p.id });
                      setProvider(p.id, { enabled: true });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.stopPropagation();
                        patch({ active_provider: p.id });
                      }
                    }}
                    className={cx(
                      "flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full border transition-all duration-200",
                      active
                        ? "border-transparent text-[#0b0a12]"
                        : "border-white/14 text-transparent hover:border-white/30"
                    )}
                    style={
                      active ? { background: "linear-gradient(135deg,#7C5CFF,#4ECDC4)" } : undefined
                    }
                  >
                    <Check size={13} strokeWidth={3} />
                  </span>
                </button>

                {expanded && (
                  <div className="flex flex-col gap-2 border-t border-white/8 p-2.5 pt-3">
                    <LabelledField
                      label="Model"
                      value={p.model}
                      onChange={(v) => setProvider(p.id, { model: v })}
                      placeholder="moondream"
                    />
                    <LabelledField
                      label="Endpoint"
                      value={p.base_url}
                      onChange={(v) => setProvider(p.id, { base_url: v })}
                      placeholder="http://127.0.0.1:11434"
                      mono
                    />
                    {!local && (
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-[10.5px] font-semibold tracking-[0.02em] text-izk-muted">
                            API key{p.id === "9router" && " (optional)"}
                          </span>
                          <button
                            type="button"
                            onClick={() => setReveal((r) => ({ ...r, [p.id]: !r[p.id] }))}
                            className="izk-no-drag text-izk-muted transition-colors hover:text-izk-ink"
                            aria-label={reveal[p.id] ? "Hide key" : "Show key"}
                          >
                            {reveal[p.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                        </div>
                        <input
                          className="izk-field izk-no-drag font-mono text-[11.5px]"
                          type={reveal[p.id] ? "text" : "password"}
                          value={p.api_key}
                          spellCheck={false}
                          autoComplete="off"
                          onChange={(e) => setProvider(p.id, { api_key: e.target.value })}
                          placeholder={
                            p.id === "openrouter"
                              ? "sk-or-v1-…"
                              : p.id === "9router"
                                ? "not needed — 9Router holds its own provider keys"
                                : "paste your key"
                          }
                        />
                      </div>
                    )}

                    <div className="mt-0.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void runProbe(p.id)}
                        disabled={probing === p.id}
                        className="izk-pill izk-no-drag h-[30px] px-3 text-[11.5px]"
                      >
                        {probing === p.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Wand2 size={12} strokeWidth={2.4} />
                        )}
                        Test connection
                      </button>
                      {probe[p.id] && (
                        <span
                          className={cx(
                            "min-w-0 flex-1 truncate text-[10.5px]",
                            probe[p.id].toLowerCase().startsWith("ok")
                              ? "text-izk-good"
                              : "text-izk-danger"
                          )}
                          title={probe[p.id]}
                        >
                          {probe[p.id]}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="izk-divider my-3" />

        <Row
          label="Fallback brain"
          hint="Used automatically if the first one times out or errors."
          icon={<Sparkles size={14} strokeWidth={2.3} />}
        >
          <select
            className="izk-field izk-no-drag h-[32px] w-[152px] py-0 text-[11.5px]"
            value={settings.fallback_provider ?? ""}
            onChange={(e) =>
              patch({ fallback_provider: (e.target.value || null) as ProviderId | null })
            }
          >
            <option value="">None</option>
            {settings.providers
              .filter((p) => p.id !== settings.active_provider)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id}
                </option>
              ))}
          </select>
        </Row>
      </Section>

      {/* ------------------------------------------------ hotkeys */}
      <Section title="Shortcuts" hint="Global — they work from any app, even full-screen games.">
        <HotkeyRow
          label="Draw overlay"
          value={settings.hotkey_draw}
          onChange={(v) => patch({ hotkey_draw: v })}
        />
        <div className="izk-divider" />
        <HotkeyRow
          label="Quickdraw (hold)"
          value={settings.hotkey_quickdraw}
          onChange={(v) => patch({ hotkey_quickdraw: v })}
        />
        <div className="izk-divider" />
        <HotkeyRow
          label="Push-to-talk"
          value={settings.hotkey_voice}
          onChange={(v) => patch({ hotkey_voice: v })}
        />
        <div className="izk-divider" />
        <HotkeyRow
          label="Replay last flow"
          value={settings.hotkey_replay}
          onChange={(v) => patch({ hotkey_replay: v })}
        />
        <div className="izk-divider" />
        <HotkeyRow
          label="Panic stop"
          value={settings.hotkey_panic}
          onChange={(v) => patch({ hotkey_panic: v })}
        />
      </Section>

      {/* ------------------------------------------------ execution */}
      <Section title="Execution" hint="How the hand behaves once the plan comes back.">
        <Row
          label="Hand travel time"
          hint="Lower is snappier, higher looks more human."
          icon={<Gauge size={14} strokeWidth={2.3} />}
        >
          <Slider
            value={settings.move_duration_ms}
            min={80}
            max={900}
            step={20}
            suffix="ms"
            onChange={(v) => patch({ move_duration_ms: v })}
          />
        </Row>
        <div className="izk-divider" />
        <Row
          label="Cursor trail"
          hint="Comet tail behind the hand. Zero turns it off."
          icon={<Sparkles size={14} strokeWidth={2.3} />}
        >
          <Slider
            value={settings.trail_length}
            min={0}
            max={24}
            onChange={(v) => patch({ trail_length: v })}
          />
        </Row>
        <div className="izk-divider" />
        <Row
          label="Local OCR"
          hint="Reads text inside your marks before asking the model. Runs on-device."
          icon={<ScanText size={14} strokeWidth={2.3} />}
        >
          <Toggle checked={settings.ocr_enabled} onChange={(v) => patch({ ocr_enabled: v })} />
        </Row>
        <div className="izk-divider" />
        <Row
          label="Confirm before acting"
          hint="Show the plan and wait for you to approve it."
          icon={<Check size={14} strokeWidth={2.3} />}
        >
          <Toggle
            checked={settings.confirm_before_act}
            onChange={(v) => patch({ confirm_before_act: v })}
          />
        </Row>
        <div className="izk-divider" />
        <Row
          label="Auto-save flows"
          hint="Every committed chain lands in the library."
          icon={<Sparkles size={14} strokeWidth={2.3} />}
        >
          <Toggle checked={settings.autosave_flows} onChange={(v) => patch({ autosave_flows: v })} />
        </Row>
      </Section>

      {/* ------------------------------------------------ system */}
      <Section title="Chat & caption colours" hint="How the chat box, Izuki's replies and your words look on screen.">
        <Row
          label="Text colours"
          hint={
            settings.chat_style === "auto" || !settings.chat_style
              ? "Auto: matches whatever is behind it — white on dark screens, black on light ones, a gradient on colourful ones."
              : settings.chat_style === "custom"
                ? "Your own text colour, on dark glass."
                : "Always this look, whatever is on screen."
          }
          icon={<Palette size={14} strokeWidth={2.3} />}
        >
          <Segmented<NonNullable<typeof settings.chat_style>>
            size="sm"
            value={settings.chat_style ?? "auto"}
            onChange={(v) => {
              patch({ chat_style: v });
              setChatLook(v);
            }}
            options={[
              { value: "auto", label: "Auto" },
              { value: "dark", label: "Dark" },
              { value: "light", label: "Light" },
              { value: "gradient", label: "Gradient" },
              { value: "custom", label: "Custom" },
            ]}
          />
        </Row>
        {settings.chat_style === "custom" && (
          <Row label="Custom text colour" hint="Pick any colour for the text." icon={<Palette size={14} strokeWidth={2.3} />}>
            <input
              type="color"
              value={settings.chat_color || "#7dd3fc"}
              onChange={(e) => {
                patch({ chat_style: "custom", chat_color: e.target.value });
                setChatLook("custom", e.target.value);
              }}
              className="izk-no-drag h-[30px] w-[54px] cursor-pointer rounded-[10px] border border-white/12 bg-transparent p-0.5"
            />
          </Row>
        )}
      </Section>

      <Section title="Window & system">
        <Row
          label="Glass backdrop"
          hint="Acrylic blurs hardest; Mica is calmer and cheaper on battery."
          icon={<Sparkles size={14} strokeWidth={2.3} />}
        >
          <Segmented<BackdropMode>
            size="sm"
            value={settings.backdrop}
            onChange={(v) => patch({ backdrop: v })}
            options={[
              { value: "acrylic", label: "Acrylic" },
              { value: "mica", label: "Mica" },
              { value: "none", label: "Solid" },
            ]}
          />
        </Row>
        <div className="izk-divider" />
        <Row
          label="Start with Windows"
          hint="Izuki lives in the tray and stays out of the way."
          icon={<Power size={14} strokeWidth={2.3} />}
        >
          <Toggle
            checked={settings.start_with_windows}
            onChange={(v) => patch({ start_with_windows: v })}
          />
        </Row>
      </Section>

      <AppsCard />

      <PhoneCard />

      {/* ------------------------------------------------ help */}
      <Section title="Help">
        <Row
          label="New here?"
          hint="Replay the quick welcome tour — setting up, talking, asking, drawing, memory."
          icon={<Compass size={14} strokeWidth={2.3} />}
        >
          <button
            type="button"
            onClick={() => setTourOpen(true)}
            className="izk-pill izk-no-drag h-[32px] px-3.5 text-[11.5px]"
          >
            Start tour
          </button>
        </Row>
        <Row
          label="Quit Izuki"
          hint="Close Izuki completely (it stops listening). You can also say “quit Izuki”. Open it again from the Start menu."
          icon={<Power size={14} strokeWidth={2.3} />}
        >
          <button
            type="button"
            onClick={() => void api.quitApp()}
            className="izk-pill izk-no-drag h-[32px] px-3.5 text-[11.5px] text-izk-danger"
          >
            Quit
          </button>
        </Row>
      </Section>

      <SupportCard />

      <p className="pb-1 text-center text-[10px] text-izk-muted/60">
        IZUKI v{pkg.version} · Free forever · Made with ❤️ by Solomon Nwachukwu
      </p>
    </>
  );
}

function LabelledField({
  label,
  value,
  onChange,
  placeholder,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="mb-1 text-[10.5px] font-semibold tracking-[0.02em] text-izk-muted">
        {label}
      </div>
      <input
        className={cx("izk-field izk-no-drag", mono && "font-mono text-[11.5px]")}
        value={value}
        spellCheck={false}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

const MODIFIERS = ["Control", "Shift", "Alt", "Meta"];

/** Click, then press the combo you want. Esc cancels. */
function HotkeyRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [capturing, setCapturing] = useState(false);

  return (
    <Row label={label} icon={<Keyboard size={14} strokeWidth={2.3} />}>
      <button
        type="button"
        onClick={() => setCapturing(true)}
        onBlur={() => setCapturing(false)}
        onKeyDown={(e) => {
          if (!capturing) return;
          e.preventDefault();
          if (e.key === "Escape") {
            setCapturing(false);
            return;
          }
          if (MODIFIERS.includes(e.key)) return;
          const parts: string[] = [];
          if (e.ctrlKey) parts.push("Ctrl");
          if (e.shiftKey) parts.push("Shift");
          if (e.altKey) parts.push("Alt");
          if (e.metaKey) parts.push("Super");
          parts.push(e.key.length === 1 ? e.key.toUpperCase() : e.key);
          onChange(parts.join("+"));
          setCapturing(false);
        }}
        className={cx(
          "izk-no-drag h-[30px] min-w-[132px] rounded-full border px-3 font-mono text-[11px] transition-all duration-200",
          capturing
            ? "border-izk-violet/60 bg-izk-violet/15 text-izk-violet"
            : "border-white/12 bg-white/6 text-izk-ink hover:bg-white/12"
        )}
      >
        {capturing ? "press keys…" : value}
      </button>
    </Row>
  );
}

async function openLink(url: string) {
  try {
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(url);
  } catch {
    window.open(url, "_blank");
  }
}

/**
 * The builder's little tip jar — Izuki is free, and this is the one place
 * that says who made it and how to say thanks.
 */
function SupportCard() {
  return (
    <div className="izk-support mb-3 overflow-hidden rounded-[20px] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[14px] bg-white/10 text-[22px]">
          ☕
        </div>
        <div className="min-w-0">
          <h3 className="text-[13.5px] font-bold tracking-[-0.01em] text-izk-ink">Buy the builder a coffee</h3>
          <p className="mt-1 text-[11.5px] leading-relaxed text-izk-muted">
            Izuki is free, and always will be. It's built by one person — Solomon — late at night, on a lot of
            coffee and a big dream. If Izuki made your day a little easier, a small tip keeps the next feature
            coming. 💚
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void openLink("https://cash.app/$louismane2")}
          className="izk-btn-primary izk-no-drag flex h-[32px] items-center gap-1.5 px-3.5 text-[11.5px]"
        >
          <Coffee size={13} strokeWidth={2.4} /> Tip $louismane2 on Cash App
        </button>
        <button
          type="button"
          onClick={() => void openLink("mailto:solotechsolutions1@gmail.com?subject=Izuki")}
          className="izk-pill izk-no-drag flex h-[32px] items-center gap-1.5 px-3.5 text-[11.5px]"
        >
          <Mail size={13} strokeWidth={2.4} /> Say hi to Solomon
        </button>
      </div>
    </div>
  );
}
