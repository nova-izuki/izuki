/**
 * Izuki's characters, as the webview needs them: which accent and language
 * the current one speaks (so the offline voices pick a fitting fallback),
 * its pace, and the full list for the picker. The list itself lives in Rust
 * (voices.rs) — one source of truth — and is fetched once.
 */
import { api } from "./ipc";
import type { Persona, Settings, VoiceCatalog } from "./types";

let catalog: VoiceCatalog = { personas: [], voices: [] };
let loading: Promise<VoiceCatalog> | null = null;

export function loadCatalog(): Promise<VoiceCatalog> {
  loading ??= api
    .voiceCatalog()
    .then((c) => {
      if (c?.personas?.length) catalog = c;
      else loading = null; // try again next time
      return catalog;
    })
    .catch(() => {
      loading = null;
      return catalog;
    });
  return loading;
}

export function personaOf(settings: Pick<Settings, "persona">): Persona | null {
  return catalog.personas.find((p) => p.id === settings.persona) ?? catalog.personas[0] ?? null;
}

/** How the current character sounds, for the voices that run in here. */
export function voiceFor(settings: Settings): {
  lang: string;
  kokoro: string;
  /** Speed multiplier for the on-device voice (1 = as made). */
  speed: number;
  /** Whether the on-device voice (English-only) can say this character's lines. */
  english: boolean;
} {
  const p = personaOf(settings);
  const rate = (p?.rate ?? 0) + (settings.voice_rate || 0);
  const lang = p?.lang ?? "en-US";
  return {
    lang,
    kokoro: p?.kokoro || settings.voice_name || "af_heart",
    speed: Math.min(1.6, Math.max(0.6, 1 + rate / 100)),
    english: /^en/i.test(lang),
  };
}

void loadCatalog();
