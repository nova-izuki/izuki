import { useEffect, useMemo, useState } from "react";
import { AudioWaveform, Check, ExternalLink, Loader2, Orbit, Play, RotateCcw, Sparkles, Volume2 } from "lucide-react";
import { Row, Segmented, Slider, Toggle, cx } from "./ui";
import { useIzuki } from "../lib/store";
import { api, IS_TAURI } from "../lib/ipc";
import { loadCatalog } from "../lib/personas";
import { playClip, speakNatural, stopNatural } from "../lib/naturalVoice";
import { speak } from "../lib/speak";
import type { Persona, Settings, VoiceCatalog } from "../lib/types";

/**
 * How Izuki sounds — lives in the "Talk to Izuki" card under "Speak
 * responses".
 *
 * - **Voice engine**: Natural (Microsoft's free neural voices — no key, many
 *   accents; the default), Offline (Kokoro, on this PC), Human (Orpheus on
 *   Groq, free key) or ChatGPT (OpenAI, paid). Each has a Test button that
 *   says exactly what's wrong when it can't speak.
 * - **Character**: a voice *and* a way of talking — Nova, deep calm Leo,
 *   Nigerian Ezinne, Pidgin Chidi, Spanish Lucía, unfiltered Rex… — with a
 *   "Hear it" on each, and "Make it yours" to rename it, pick any voice,
 *   change speed and pitch, and add a personality of your own.
 */

const CLOUD_VOICES: Record<"orpheus" | "openai" | "gemini" | "elevenlabs", Array<{ id: string; label: string }>> = {
  elevenlabs: [
    { id: "cgSgspJ2msm6clMCkdW9", label: "Jessica — warm" },
    { id: "Xb7hH8MSUJpSbSDYk0k2", label: "Alice — clear, British" },
    { id: "pFZP5JQG7iQjIQuC4Bku", label: "Lily — soft, British" },
    { id: "XrExE9yKIg1WjnnlVkGX", label: "Matilda — friendly" },
    { id: "nPczCjzI2devNBz1zQrb", label: "Brian — deep, calm" },
    { id: "JBFqnCBsd6RMkjVDRZzb", label: "George — warm, British" },
    { id: "onwK4e9ZLuTAKqWW03F9", label: "Daniel — steady, British" },
    { id: "TX3LPaxmHKxFdv7VOQHJ", label: "Liam — young, energetic" },
  ],
  gemini: [
    { id: "Charon", label: "Charon — deep, calm" },
    { id: "Algieba", label: "Algieba — smooth" },
    { id: "Orus", label: "Orus — firm" },
    { id: "Iapetus", label: "Iapetus — clear" },
    { id: "Umbriel", label: "Umbriel — easygoing" },
    { id: "Achird", label: "Achird — friendly" },
    { id: "Sulafat", label: "Sulafat — warm" },
    { id: "Aoede", label: "Aoede — breezy" },
    { id: "Kore", label: "Kore — firm" },
    { id: "Vindemiatrix", label: "Vindemiatrix — gentle" },
    { id: "Despina", label: "Despina — smooth" },
    { id: "Leda", label: "Leda — youthful" },
  ],
  orpheus: [
    { id: "hannah", label: "Hannah — warm" },
    { id: "autumn", label: "Autumn — soft" },
    { id: "diana", label: "Diana — bright" },
    { id: "austin", label: "Austin — easygoing" },
    { id: "daniel", label: "Daniel — calm" },
    { id: "troy", label: "Troy — deep" },
  ],
  openai: [
    { id: "marin", label: "Marin — natural" },
    { id: "cedar", label: "Cedar — natural, deeper" },
    { id: "coral", label: "Coral — warm" },
    { id: "sage", label: "Sage — gentle" },
    { id: "ash", label: "Ash — relaxed" },
    { id: "verse", label: "Verse — expressive" },
  ],
};

const OFFLINE_VOICES = [
  { id: "af_heart", label: "Heart — warm (US)" },
  { id: "af_bella", label: "Bella — bright (US)" },
  { id: "af_nicole", label: "Nicole — soft (US)" },
  { id: "am_michael", label: "Michael — calm (US)" },
  { id: "am_fenrir", label: "Fenrir — deep (US)" },
  { id: "bf_emma", label: "Emma — British" },
  { id: "bm_george", label: "George — British" },
];

const GROUPS = ["Everyday", "Accents", "Languages", "Characters"] as const;
const ORPHEUS_TERMS = "https://console.groq.com/playground?model=canopylabs%2Forpheus-v1-english";
/** Where Azure Speech resources can live — the region is part of the address. */
const AZURE_REGIONS = [
  "eastus", "eastus2", "westus", "westus2", "centralus", "canadacentral", "brazilsouth",
  "northeurope", "westeurope", "uksouth", "francecentral", "germanywestcentral", "swedencentral",
  "southafricanorth", "uaenorth", "centralindia", "eastasia", "southeastasia", "japaneast",
  "koreacentral", "australiaeast",
];

type Engine = Settings["voice_engine"];

async function openLink(url: string) {
  if (IS_TAURI) {
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(url);
  } else {
    window.open(url, "_blank");
  }
}

const selectClass =
  "izk-no-drag h-[30px] max-w-[210px] rounded-[10px] border border-white/10 bg-white/6 px-2 text-[12px] text-izk-ink outline-none";

export function VoicePicker() {
  const settings = useIzuki((s) => s.settings);
  const patch = useIzuki((s) => s.patchSettings);
  const [catalog, setCatalog] = useState<VoiceCatalog>({ personas: [], voices: [] });
  const [group, setGroup] = useState<(typeof GROUPS)[number]>("Everyday");
  const [playing, setPlaying] = useState<string | null>(null);
  const [test, setTest] = useState<{ ok: boolean; text: string } | null>(null);
  const [custom, setCustom] = useState(false);

  useEffect(() => {
    void loadCatalog().then((c) => {
      setCatalog(c);
      const mine = c.personas.find((p) => p.id === settings.persona);
      if (mine) setGroup(mine.group as (typeof GROUPS)[number]);
    });
    // Only once — the group follows the user's clicks after that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const engine: Engine = settings.voice_engine === "system" ? "natural" : settings.voice_engine;
  const cloud = engine === "orpheus" || engine === "openai" || engine === "gemini" || engine === "elevenlabs" ? engine : null;
  const current = catalog.personas.find((p) => p.id === settings.persona) ?? catalog.personas[0];
  const shown = useMemo(() => catalog.personas.filter((p) => p.group === group), [catalog, group]);
  const openaiKey = settings.providers.find((p) => p.id === "openai")?.api_key.trim() ?? "";
  const geminiKey = settings.providers.find((p) => p.id === "gemini")?.api_key.trim() ?? "";

  // A new engine or character → the last test result no longer applies.
  useEffect(() => {
    setTest(null);
  }, [engine, settings.persona]);

  // The ChatGPT voice's key, pasted right here: saved into the OpenAI brain
  // slot (the one place it lives), then tested out loud.
  const [openaiDraft, setOpenaiDraft] = useState("");
  function saveOpenaiKey() {
    const key = openaiDraft.trim();
    if (!key) return;
    patch({ providers: settings.providers.map((p) => (p.id === "openai" ? { ...p, api_key: key } : p)) });
    setOpenaiDraft("");
    void hear("test", "openai", null);
  }
  // Same for the Gemini voice — the very key that runs the brain.
  const [geminiDraft, setGeminiDraft] = useState("");
  function saveGeminiKey() {
    const key = geminiDraft.trim();
    if (!key) return;
    patch({ providers: settings.providers.map((p) => (p.id === "gemini" ? { ...p, api_key: key, enabled: true } : p)) });
    setGeminiDraft("");
    void hear("test", "gemini", null);
  }

  /** Play a line in a voice; on failure say exactly why. */
  async function hear(key: string, eng: Engine, persona: string | null) {
    if (playing === key) {
      stopNatural("preview stopped");
      setPlaying(null);
      return;
    }
    setPlaying(key);
    try {
      await useIzuki.getState().flushSettings();
      if (eng === "natural" || eng === "system") {
        const p = persona ? catalog.personas.find((x) => x.id === persona) : current;
        const line = p?.sample ?? "Hi, I'm Izuki.";
        const english = /^en/i.test(p?.lang ?? "en");
        const spoke = english && (await speakNatural(line, persona ? (p?.kokoro ?? settings.voice_name) : settings.voice_name, undefined, null, 1));
        if (!spoke) speak(line, { lang: p?.lang });
        setTest(
          spoke
            ? { ok: true, text: "Working! That's the voice on this PC." }
            : { ok: false, text: english ? "The offline voice is still getting ready (first time takes a minute) — that was Windows' voice. Try again shortly." : "The offline voice only speaks English — that was Windows' voice. Pick Natural for other languages." }
        );
      } else {
        const clip = await api.voiceTest(eng, persona);
        await playClip(clip);
        if (!persona) setTest({ ok: true, text: "Working! That's how Izuki sounds now." });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setTest({ ok: false, text: msg });
    } finally {
      setPlaying((p) => (p === key ? null : p));
    }
  }

  function choose(p: Persona) {
    patch({
      persona: p.id,
      persona_name: "",
      persona_voice: "",
      voice_rate: 0,
      voice_pitch: 0,
      cloud_voice: "",
      voice_name: p.kokoro,
    });
  }

  const tweaked =
    !!settings.persona_name.trim() ||
    !!settings.persona_voice ||
    settings.voice_rate !== 0 ||
    settings.voice_pitch !== 0 ||
    !!settings.persona_style.trim();

  return (
    <>
      {/* ---------------------------------------------------------- engine */}
      <Row
        label="Voice"
        icon={<AudioWaveform size={14} strokeWidth={2.3} />}
        hint={
          engine === "edge"
            ? "Natural — lifelike voices in many accents and languages. Free, no key; needs the internet (falls back to the offline voice without it)."
            : engine === "orpheus"
              ? "Human — Orpheus on Groq, very expressive (it can laugh and sigh). Needs a free Groq key. English only."
              : engine === "gemini"
                ? "Gemini — Google's voice, follows your character's accent and mood. Free with the same Gemini key as the brain (a daily allowance — past it, Izuki switches to Natural)."
              : engine === "azure"
                ? "Azure — the same lifelike Natural voices and accents, through Microsoft's official free plan (half a million characters a month). Needs your own free Azure Speech key."
              : engine === "elevenlabs"
                ? "ElevenLabs — the most human-sounding voices there are. Free plan with a monthly allowance (about 10 minutes of speech) — past it, Izuki switches to Natural. Needs your own free key."
              : engine === "openai"
                ? "ChatGPT's voice — the strongest accents (Nigerian, Pidgin…), following your character. The one paid option: an OpenAI key with a little credit (about a cent for several minutes)."
                : "Offline — runs on this PC: free, private, works with no internet. English only."
        }
      >
        <Segmented<Engine>
          size="sm"
          value={engine}
          onChange={(v) => patch({ voice_engine: v, cloud_voice: "" })}
          options={[
            { value: "edge", label: "Natural" },
            { value: "natural", label: "Offline" },
            { value: "orpheus", label: "Human" },
            { value: "gemini", label: "Gemini" },
            { value: "azure", label: "Azure" },
            { value: "elevenlabs", label: "ElevenLabs" },
            { value: "openai", label: "ChatGPT" },
          ]}
        />
      </Row>

      {engine === "orpheus" && (
        <div className="izk-inset mb-1 flex items-center gap-2 rounded-[14px] p-1.5">
          <input
            type="password"
            value={settings.groq_api_key}
            onChange={(e) => patch({ groq_api_key: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter" && settings.groq_api_key.trim()) void hear("test", engine, null);
            }}
            placeholder="Paste your free Groq key (gsk_…), then Enter"
            className="h-[30px] min-w-0 flex-1 bg-transparent px-2 text-[12px] text-izk-ink outline-none placeholder:text-izk-muted/55"
            spellCheck={false}
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => void openLink("https://console.groq.com/keys")}
            className="izk-pill izk-no-drag h-[28px] shrink-0 px-2.5 text-[11px]"
          >
            <ExternalLink size={11} strokeWidth={2.4} />
            Get a free key
          </button>
          {settings.groq_api_key.trim() && (
            <button
              type="button"
              onClick={() => void hear("test", engine, null)}
              className="izk-btn-primary izk-no-drag flex h-[28px] shrink-0 items-center gap-1 rounded-full px-2.5 text-[11px]"
            >
              <Check size={11} strokeWidth={2.6} /> Save &amp; test
            </button>
          )}
        </div>
      )}

      {engine === "azure" && (
        <div className="mb-1 rounded-[12px] border border-izk-hand/25 bg-izk-hand/8 px-2.5 py-2 text-[10.5px] leading-relaxed text-izk-muted">
          Free: in the Azure portal, create a <b className="text-izk-ink">Speech</b> resource on the <b className="text-izk-ink">Free F0</b> tier, then copy <b className="text-izk-ink">Key 1</b> and its <b className="text-izk-ink">Region</b> from “Keys and Endpoint”.
          <div className="mt-1.5 flex items-center gap-1.5">
            <input
              type="password"
              value={settings.azure_speech_key}
              onChange={(e) => patch({ azure_speech_key: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter" && settings.azure_speech_key.trim()) void hear("test", "azure", null);
              }}
              placeholder="Paste Key 1, then Enter"
              className="izk-field izk-no-drag h-[30px] min-w-0 flex-1 py-0 text-[12px]"
              spellCheck={false}
              autoComplete="off"
            />
            <select
              value={settings.azure_speech_region}
              onChange={(e) => patch({ azure_speech_region: e.target.value })}
              className={selectClass}
              aria-label="Azure region"
            >
              {(AZURE_REGIONS.includes(settings.azure_speech_region) ? AZURE_REGIONS : [settings.azure_speech_region, ...AZURE_REGIONS]).map((r) => (
                <option key={r} value={r} className="bg-[#1b2230]">
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => void openLink("https://portal.azure.com/#create/Microsoft.CognitiveServicesSpeechServices")}
              className="izk-pill izk-no-drag h-[26px] px-2.5 text-[11px]"
            >
              <ExternalLink size={11} strokeWidth={2.4} /> Get a free key
            </button>
            {settings.azure_speech_key.trim() && (
              <button
                type="button"
                onClick={() => void hear("test", "azure", null)}
                className="izk-btn-primary izk-no-drag flex h-[26px] shrink-0 items-center gap-1 rounded-full px-2.5 text-[11px]"
              >
                <Check size={11} strokeWidth={2.6} /> Save &amp; test
              </button>
            )}
          </div>
        </div>
      )}

      {engine === "elevenlabs" && (
        <div className="izk-inset mb-1 flex items-center gap-2 rounded-[14px] p-1.5">
          <input
            type="password"
            value={settings.elevenlabs_key}
            onChange={(e) => patch({ elevenlabs_key: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter" && settings.elevenlabs_key.trim()) void hear("test", "elevenlabs", null);
            }}
            placeholder="Paste your free ElevenLabs key, then Enter"
            className="h-[30px] min-w-0 flex-1 bg-transparent px-2 text-[12px] text-izk-ink outline-none placeholder:text-izk-muted/55"
            spellCheck={false}
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => void openLink("https://elevenlabs.io/app/settings/api-keys")}
            className="izk-pill izk-no-drag h-[28px] shrink-0 px-2.5 text-[11px]"
          >
            <ExternalLink size={11} strokeWidth={2.4} />
            Get a free key
          </button>
          {settings.elevenlabs_key.trim() && (
            <button
              type="button"
              onClick={() => void hear("test", "elevenlabs", null)}
              className="izk-btn-primary izk-no-drag flex h-[28px] shrink-0 items-center gap-1 rounded-full px-2.5 text-[11px]"
            >
              <Check size={11} strokeWidth={2.6} /> Save &amp; test
            </button>
          )}
        </div>
      )}

      {engine === "gemini" && !geminiKey && (
        <div className="mb-1 rounded-[12px] border border-izk-hand/25 bg-izk-hand/8 px-2.5 py-2 text-[10.5px] leading-relaxed text-izk-muted">
          The Gemini voice is free with a Gemini key — the same one that runs Izuki's brain.
          <div className="mt-1.5 flex items-center gap-1.5">
            <input
              type="password"
              value={geminiDraft}
              onChange={(e) => setGeminiDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveGeminiKey();
              }}
              placeholder="Paste your free Gemini key (AIza…), then Enter"
              className="izk-field izk-no-drag h-[30px] min-w-0 flex-1 py-0 text-[12px]"
              spellCheck={false}
              autoComplete="off"
            />
            <button
              type="button"
              disabled={!geminiDraft.trim()}
              onClick={saveGeminiKey}
              className="izk-btn-primary izk-no-drag flex h-[28px] shrink-0 items-center gap-1 rounded-full px-2.5 text-[11px] disabled:opacity-40"
            >
              <Check size={11} strokeWidth={2.6} /> Save &amp; test
            </button>
          </div>
          <button
            type="button"
            onClick={() => void openLink("https://aistudio.google.com/apikey")}
            className="izk-pill izk-no-drag mt-1.5 h-[26px] px-2.5 text-[11px]"
          >
            <ExternalLink size={11} strokeWidth={2.4} /> Get a free key
          </button>
        </div>
      )}

      {engine === "openai" && !openaiKey && (
        <div className="mb-1 rounded-[12px] border border-izk-hand/25 bg-izk-hand/8 px-2.5 py-2 text-[10.5px] leading-relaxed text-izk-muted">
          The ChatGPT voice needs an OpenAI key (the same one as <b className="text-izk-ink">Settings → Izuki's brain → OpenAI</b>).
          <div className="mt-1.5 flex items-center gap-1.5">
            <input
              type="password"
              value={openaiDraft}
              onChange={(e) => setOpenaiDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveOpenaiKey();
              }}
              placeholder="Paste your OpenAI key (sk-…), then Enter"
              className="izk-field izk-no-drag h-[30px] min-w-0 flex-1 py-0 text-[12px]"
              spellCheck={false}
              autoComplete="off"
            />
            <button
              type="button"
              disabled={!openaiDraft.trim()}
              onClick={saveOpenaiKey}
              className="izk-btn-primary izk-no-drag flex h-[28px] shrink-0 items-center gap-1 rounded-full px-2.5 text-[11px] disabled:opacity-40"
            >
              <Check size={11} strokeWidth={2.6} /> Save &amp; test
            </button>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => void openLink("https://platform.openai.com/api-keys")}
              className="izk-pill izk-no-drag h-[26px] px-2.5 text-[11px]"
            >
              <ExternalLink size={11} strokeWidth={2.4} /> Get an OpenAI key
            </button>
            <span>OpenAI has no free keys — it needs about $5 of credit (a cent lasts several minutes).</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span>Want it free?</span>
            <button
              type="button"
              onClick={() => patch({ voice_engine: "edge", cloud_voice: "" })}
              className="izk-pill izk-no-drag h-[26px] px-2.5 text-[11px]"
            >
              Natural — no key at all
            </button>
            <button
              type="button"
              onClick={() => patch({ voice_engine: "orpheus", cloud_voice: "" })}
              className="izk-pill izk-no-drag h-[26px] px-2.5 text-[11px]"
            >
              Human — free Groq key
            </button>
            <button
              type="button"
              onClick={() => patch({ voice_engine: "gemini", cloud_voice: "" })}
              className="izk-pill izk-no-drag h-[26px] px-2.5 text-[11px]"
            >
              Gemini — free Gemini key
            </button>
          </div>
        </div>
      )}

      {cloud && (
        <Row label="Which voice" hint="“Your character's” follows the character you pick below.">
          <select
            value={CLOUD_VOICES[cloud].some((v) => v.id === settings.cloud_voice) ? settings.cloud_voice : ""}
            onChange={(e) => patch({ cloud_voice: e.target.value })}
            className={selectClass}
          >
            <option value="" className="bg-[#1b2230]">
              Your character's
            </option>
            {CLOUD_VOICES[cloud].map((v) => (
              <option key={v.id} value={v.id} className="bg-[#1b2230]">
                {v.label}
              </option>
            ))}
          </select>
        </Row>
      )}

      {engine === "natural" && (
        <Row label="Which voice" hint="The voice on this PC. Your character picks one for you.">
          <select value={settings.voice_name} onChange={(e) => patch({ voice_name: e.target.value })} className={selectClass}>
            {OFFLINE_VOICES.map((v) => (
              <option key={v.id} value={v.id} className="bg-[#1b2230]">
                {v.label}
              </option>
            ))}
          </select>
        </Row>
      )}

      {/* Test: the one place that says for sure whether a voice works. */}
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void hear("test", engine, null)}
          className="izk-pill izk-no-drag h-[30px] px-3 text-[11.5px]"
        >
          {playing === "test" ? <Loader2 size={12} className="animate-spin" /> : <Volume2 size={12} strokeWidth={2.4} />}
          Test voice
        </button>
        {test && (
          <span className={cx("min-w-0 flex-1 text-[10.5px] leading-snug", test.ok ? "text-izk-good" : "text-izk-danger")}>
            {test.ok ? "✓ " : ""}
            {test.text}
          </span>
        )}
      </div>
      {test && !test.ok && /terms/i.test(test.text) && (
        <button
          type="button"
          onClick={() => void openLink(ORPHEUS_TERMS)}
          className="izk-pill izk-no-drag mb-1 h-[28px] px-2.5 text-[11px]"
        >
          <ExternalLink size={11} strokeWidth={2.4} />
          Accept the Orpheus terms on Groq
        </button>
      )}

      <div className="izk-divider" />

      {/* ---------------------------------------------------------- characters */}
      <div className="mb-1.5 mt-1 flex items-center gap-2">
        <Sparkles size={14} strokeWidth={2.3} className="text-izk-violet" />
        <span className="text-[12.5px] font-semibold text-izk-ink">Character</span>
        <span className="truncate text-[10.5px] text-izk-muted">
          — {current ? `${settings.persona_name.trim() || current.name}, ${current.blurb.toLowerCase()}` : "loading…"}
        </span>
      </div>
      <p className="mb-2 text-[10.5px] leading-relaxed text-izk-muted">
        A voice <i>and</i> a way of talking — in your ear, in the chat, on the phone and in Telegram.
      </p>

      <div className="izk-no-drag mb-2 flex flex-wrap gap-1.5">
        {GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGroup(g)}
            className={cx(
              "h-[26px] rounded-full border px-2.5 text-[11px] font-semibold transition-colors",
              group === g
                ? "border-izk-violet/50 bg-izk-violet/18 text-izk-ink"
                : "border-white/10 bg-white/4 text-izk-muted hover:text-izk-ink"
            )}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="mb-2 grid grid-cols-2 gap-1.5">
        {shown.map((p) => {
          const on = settings.persona === p.id;
          return (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              onClick={() => choose(p)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  choose(p);
                }
              }}
              className={cx(
                "izk-no-drag relative flex cursor-pointer items-start gap-2 rounded-[13px] border p-2 text-left transition-all duration-200",
                on
                  ? "border-izk-violet/50 bg-izk-violet/14 shadow-[0_6px_20px_rgba(124,92,255,0.2)]"
                  : "border-white/8 bg-white/4 hover:border-white/16"
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 text-[12px] font-semibold text-izk-ink">
                  <span className="truncate">{p.name}</span>
                  {on && <Check size={12} strokeWidth={3} className="shrink-0 text-izk-good" />}
                  {p.spicy && <span className="shrink-0 text-[10px]">🌶️</span>}
                </span>
                <span className="mt-[1px] block text-[10px] leading-snug text-izk-muted">{p.blurb}</span>
              </span>
              <button
                type="button"
                aria-label={`Hear ${p.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  void hear(p.id, engine, p.id);
                }}
                className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/6 text-izk-muted transition-colors hover:text-izk-ink"
              >
                {playing === p.id ? <Loader2 size={11} className="animate-spin" /> : <Play size={10} strokeWidth={2.6} />}
              </button>
            </div>
          );
        })}
      </div>
      {engine === "edge" && (group === "Accents" || group === "Languages") && (
        <p className="mb-2 text-[10px] leading-relaxed text-izk-muted/80">
          Tip: the free natural voices have a light accent. For the strongest Nigerian, Pidgin or any accent, pick{" "}
          <b className="text-izk-muted">ChatGPT</b> above — Izuki tells it to speak like a local.
        </p>
      )}
      {(engine === "orpheus" || engine === "natural") && group === "Languages" && (
        <p className="mb-2 text-[10px] leading-relaxed text-izk-muted/80">
          This voice only speaks English — pick <b className="text-izk-muted">Natural</b> above for other languages.
        </p>
      )}

      {/* ---------------------------------------------------------- make it yours */}
      <button
        type="button"
        onClick={() => setCustom((c) => !c)}
        className="izk-no-drag mb-1 flex w-full items-center justify-between rounded-[12px] border border-white/8 bg-white/4 px-2.5 py-2 text-left text-[11.5px] font-semibold text-izk-ink hover:border-white/16"
      >
        <span>
          Make it yours{tweaked && <span className="ml-1.5 text-[10px] font-normal text-izk-violet">customised</span>}
        </span>
        <span className="text-izk-muted">{custom ? "▴" : "▾"}</span>
      </button>

      {custom && (
        <div className="mb-1 flex flex-col gap-1 rounded-[14px] border border-white/8 bg-black/15 p-2.5">
          <Row label="Name" hint="What it calls itself.">
            <input
              value={settings.persona_name}
              onChange={(e) => patch({ persona_name: e.target.value.slice(0, 40) })}
              placeholder={current?.name ?? "Nova"}
              className="izk-field izk-no-drag h-[30px] w-[150px] text-[12px]"
            />
          </Row>
          {engine === "edge" && (
            <>
              <Row label="Voice" hint="Any accent or language.">
                <select
                  value={settings.persona_voice}
                  onChange={(e) => patch({ persona_voice: e.target.value })}
                  className={selectClass}
                >
                  <option value="" className="bg-[#1b2230]">
                    {current ? `${current.name}'s own` : "The character's own"}
                  </option>
                  {catalog.voices.map((v) => (
                    <option key={v.id} value={v.id} className="bg-[#1b2230]">
                      {v.label}
                    </option>
                  ))}
                </select>
              </Row>
              <Row label="Pitch" hint="Lower for a deeper voice.">
                <Slider value={settings.voice_pitch} min={-20} max={20} onChange={(v) => patch({ voice_pitch: v })} suffix=" Hz" />
              </Row>
            </>
          )}
          {(engine === "edge" || engine === "natural") && (
            <Row label="Speed" hint="Slower is calmer; faster is snappier.">
              <Slider value={settings.voice_rate} min={-30} max={30} onChange={(v) => patch({ voice_rate: v })} suffix="%" />
            </Row>
          )}
          <div className="mt-1">
            <span className="mb-1 block text-[10.5px] font-semibold text-izk-muted">Personality, in your words</span>
            <textarea
              value={settings.persona_style}
              onChange={(e) => patch({ persona_style: e.target.value.slice(0, 1200) })}
              rows={3}
              placeholder="e.g. Call me boss. Be extra funny. Hype me up before exams. Speak like my big brother."
              className="izk-field izk-no-drag w-full resize-none py-2 text-[12px] leading-snug"
            />
          </div>
          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => void hear("test", engine, null)}
              className="izk-pill izk-no-drag h-[28px] px-2.5 text-[11px]"
            >
              {playing === "test" ? <Loader2 size={11} className="animate-spin" /> : <Play size={11} strokeWidth={2.4} />}
              Hear it
            </button>
            {tweaked && (
              <button
                type="button"
                onClick={() => patch({ persona_name: "", persona_voice: "", voice_rate: 0, voice_pitch: 0, persona_style: "" })}
                className="izk-pill izk-no-drag h-[28px] px-2.5 text-[11px]"
              >
                <RotateCcw size={11} strokeWidth={2.4} />
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      <div className="izk-divider" />

      <Row
        label="Show the orb for typed requests"
        hint="When you type in the chat or use Ctrl+D, the orb shows what Izuki is doing and moves as it answers. (Voice conversations always show it.)"
        icon={<Orbit size={14} strokeWidth={2.3} />}
      >
        <Toggle checked={settings.sphere_on_replies} onChange={(v) => patch({ sphere_on_replies: v })} />
      </Row>
    </>
  );
}
