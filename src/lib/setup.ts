/**
 * Getting Izuki connected without anything technical: what's set up, and
 * putting a key where it belongs the moment the user copies it (keys.rs
 * recognises it on the clipboard; KeyCatcher.tsx offers it).
 */
import { api, IS_TAURI } from "./ipc";
import { useIzuki } from "./store";
import type { FoundKey, ProviderId, Settings } from "./types";

const LOCAL: ProviderId[] = ["ollama", "custom", "9router"];

const PROVIDER_OF: Partial<Record<FoundKey["kind"], ProviderId>> = {
  gemini: "gemini",
  openrouter: "openrouter",
  xai: "xai",
  nvidia: "nvidia",
  anthropic: "anthropic",
  openai: "openai",
};

/** Can Izuki think — is its brain a local model, or one with a key? */
export function brainReady(s: Settings): boolean {
  const p = s.providers.find((x) => x.id === s.active_provider);
  if (!p) return false;
  return LOCAL.includes(p.id) || !!p.api_key.trim();
}

/** Whether this exact key is already saved somewhere. */
export function keySaved(s: Settings, f: FoundKey): boolean {
  const k = f.key.trim();
  return (
    s.providers.some((p) => p.api_key.trim() === k) ||
    s.groq_api_key.trim() === k ||
    s.composio_api_key.trim() === k ||
    s.telegram_token.trim() === k
  );
}

/** Keys the user just went off to get — taken without asking when they're copied. */
const expecting = new Set<FoundKey["kind"]>();
export function expectKey(kind: FoundKey["kind"]) {
  expecting.add(kind);
}
export function isExpected(kind: FoundKey["kind"]) {
  return expecting.has(kind);
}

export const KEY_PAGES: Record<"gemini" | "composio" | "groq", string> = {
  gemini: "https://aistudio.google.com/apikey",
  composio: "https://dashboard.composio.dev/",
  groq: "https://console.groq.com/keys",
};

export async function openLink(url: string) {
  if (IS_TAURI) {
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(url);
  } else {
    window.open(url, "_blank");
  }
}

/** Send them to get a free key; it's picked up when they copy it. */
export function getKey(kind: "gemini" | "composio" | "groq") {
  expectKey(kind);
  void openLink(KEY_PAGES[kind]);
}

/**
 * Put a key where it belongs and check it works. Resolves to what to tell
 * the user (`ok` false when the service said no).
 */
export async function applyKey(found: FoundKey): Promise<{ ok: boolean; text: string }> {
  const st = useIzuki.getState();
  const s = st.settings;
  expecting.delete(found.kind);
  const provider = PROVIDER_OF[found.kind];
  let result: { ok: boolean; text: string };
  if (provider) {
    // It becomes the brain when there isn't a working one yet.
    const becomeBrain = !brainReady(s) || s.active_provider === provider;
    st.patchSettings({
      providers: s.providers.map((p) => (p.id === provider ? { ...p, api_key: found.key, enabled: true } : p)),
      ...(becomeBrain ? { active_provider: provider } : {}),
    });
    await st.flushSettings();
    const r = await api.probeProvider(provider).catch((e) => String(e));
    const ok = r.toLowerCase().startsWith("ok");
    result = ok
      ? { ok, text: becomeBrain ? `${found.label} works — Izuki can think now! 🧠` : `${found.label} works — added as another brain.` }
      : { ok, text: `Saved your ${found.label}, but checking it said: ${r}` };
  } else if (found.kind === "composio") {
    st.patchSettings({ composio_api_key: found.key });
    await st.flushSettings();
    result = await api
      .appsTest(found.key)
      .then(() => ({ ok: true, text: "Composio key works — now tap an app to sign in. 🔌" }))
      .catch((e) => ({ ok: false, text: `Saved your Composio key, but checking it said: ${String(e)}` }));
  } else if (found.kind === "groq") {
    st.patchSettings({ groq_api_key: found.key });
    await st.flushSettings();
    result = { ok: true, text: "Groq key added — the Human voice and sharper hearing are ready. 🎙️" };
  } else {
    st.patchSettings({ telegram_token: found.key });
    await st.flushSettings();
    result = { ok: true, text: "Telegram bot added — pair it in Settings → Izuki on your phone. 📲" };
  }
  window.dispatchEvent(new CustomEvent("izuki:key", { detail: found.kind }));
  return result;
}
