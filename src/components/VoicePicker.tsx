import { AudioWaveform, ExternalLink, Orbit } from "lucide-react";
import { Row, Segmented, Toggle } from "./ui";
import { useIzuki } from "../lib/store";
import { IS_TAURI } from "../lib/ipc";
import type { Settings } from "../lib/types";

/**
 * Which voice Izuki speaks with, and the voice sphere toggle — lives in the
 * "Talk to Izuki" card under "Speak responses".
 *
 * - On this PC: Kokoro, free and offline.
 * - Human: Orpheus on Groq — the most human-sounding free option, with
 *   feeling; needs a free Groq key.
 * - ChatGPT: OpenAI's gpt-4o-mini-tts — uses the OpenAI key, needs credits.
 * Whichever can't speak right now falls back to the on-device voice.
 */

const CLOUD_VOICES: Record<"orpheus" | "openai", Array<{ id: string; label: string }>> = {
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

async function openLink(url: string) {
  if (IS_TAURI) {
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(url);
  } else {
    window.open(url, "_blank");
  }
}

export function VoicePicker() {
  const settings = useIzuki((s) => s.settings);
  const patch = useIzuki((s) => s.patchSettings);
  const engine = settings.voice_engine === "system" ? "natural" : settings.voice_engine;
  const cloud = engine === "orpheus" || engine === "openai" ? engine : null;
  const voices = cloud ? CLOUD_VOICES[cloud] : [];
  const voice = voices.some((v) => v.id === settings.cloud_voice) ? settings.cloud_voice : voices[0]?.id;

  return (
    <>
      <Row
        label="Voice"
        icon={<AudioWaveform size={14} strokeWidth={2.3} />}
        hint={
          engine === "orpheus"
            ? "Human — the most lifelike free voice, with real feeling. Needs a free Groq key."
            : engine === "openai"
              ? "ChatGPT's voice — needs credits on your OpenAI account (about a cent for several minutes)."
              : "On this PC — free, private, works offline."
        }
      >
        <Segmented<Settings["voice_engine"]>
          size="sm"
          value={engine}
          onChange={(v) => patch({ voice_engine: v, cloud_voice: "" })}
          options={[
            { value: "natural", label: "This PC" },
            { value: "orpheus", label: "Human" },
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
            placeholder="Paste your free Groq key (gsk_…)"
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
        </div>
      )}

      {cloud && (
        <Row label="Which voice" hint="Try a few — the change applies to the next thing Izuki says.">
          <select
            value={voice}
            onChange={(e) => patch({ cloud_voice: e.target.value })}
            className="izk-no-drag h-[30px] rounded-[10px] border border-white/10 bg-white/6 px-2 text-[12px] text-izk-ink outline-none"
          >
            {voices.map((v) => (
              <option key={v.id} value={v.id} className="bg-[#1b2230]">
                {v.label}
              </option>
            ))}
          </select>
        </Row>
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
