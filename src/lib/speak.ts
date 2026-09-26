/**
 * Izuki talking back.
 *
 * Uses the webview's own speech synthesis — standard in Chromium/WebView2,
 * nothing bundled or downloaded. It is how Izuki acknowledges a hands-free
 * command instead of leaving you talking to a silent room.
 *
 * Voice quality depends entirely on what's installed on the machine. Windows
 * ships two generations of voice: the old desktop ones (David/Mark/Zira) that
 * read flat and mechanical, and free neural "Natural" voices (Aria, Jenny,
 * Guy, Sonia…) that sound genuinely close to human — but the natural ones are
 * an opt-in download, not installed by default. `pickVoice` always reaches
 * for a natural voice first; `hasNaturalVoice` tells the UI whether one was
 * found, so Settings can point at the free, one-click way to get one instead
 * of quietly settling for the robotic fallback.
 */

let sawNatural = false;
/** The best installed voice per language, e.g. "en-GB" → Hazel. */
const picked = new Map<string, SpeechSynthesisVoice | null>();

const NATURAL = /natural|online|neural/i;

/**
 * The best voice for `lang` ("es-ES", "en-NG"…): that exact accent, then
 * the same language, then English. Natural voices first in each.
 */
function pickVoice(lang = "en-US"): SpeechSynthesisVoice | null {
  if (picked.has(lang)) return picked.get(lang) ?? null;
  const list = window.speechSynthesis?.getVoices?.() ?? [];
  if (!list.length) return null; // voices load async; try again next call
  sawNatural = list.some((v) => /^en-/i.test(v.lang) && NATURAL.test(v.name));
  const base = lang.split("-")[0].toLowerCase();
  const norm = (l: string) => l.replace("_", "-").toLowerCase();
  const exact = list.filter((v) => norm(v.lang) === lang.toLowerCase());
  const sameLang = list.filter((v) => norm(v.lang).split("-")[0] === base);
  const pool = exact.length ? exact : sameLang;
  if (pool.length && base !== "en") {
    const v = pool.find((x) => NATURAL.test(x.name)) ?? pool[0];
    picked.set(lang, v);
    return v;
  }
  if (exact.length && base === "en") {
    const v = exact.find((x) => NATURAL.test(x.name)) ?? exact[0];
    // Only prefer the accent over a natural US voice when it's natural too.
    if (NATURAL.test(v.name) || !list.some((x) => /^en-/i.test(x.lang) && NATURAL.test(x.name))) {
      picked.set(lang, v);
      return v;
    }
  }
  const voice = englishVoice(list);
  picked.set(lang, voice);
  return voice;
}

function englishVoice(list: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const english = list.filter((v) => /^en-/i.test(v.lang));
  const natural = english.find((v) => NATURAL.test(v.name)) ?? list.find((v) => NATURAL.test(v.name));
  // Among the old desktop voices, "Zira" reads the least mechanically of the
  // three Windows ships by default — a small, safe nudge while no natural
  // voice is installed.
  return natural ?? english.find((v) => /zira/i.test(v.name)) ?? english[0] ?? list[0] ?? null;
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    picked.clear();
  };
}

export const canSpeak = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;

/** Whether a free neural "Natural" voice was found among the installed ones. */
export function hasNaturalVoice(): boolean {
  pickVoice();
  return sawNatural;
}

/** Opens Windows' own free voice picker — two clicks to add a natural voice. */
export function openVoiceSettings() {
  window.open("ms-settings:speech", "_blank");
}

/**
 * Speak a short line. Cancels whatever it was saying before, so replies never
 * queue up and lag behind the moment they were meant for.
 */
export function speak(text: string, opts: { rate?: number; pitch?: number; lang?: string } = {}) {
  if (!canSpeak() || !text.trim()) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice(opts.lang);
    if (opts.lang) u.lang = v?.lang ?? opts.lang;
    // Natural voices already carry their own prosody — pushing rate/pitch on
    // top makes them sound worse, not better. The nudge is only for the flat
    // legacy voices that need the help.
    const natural = sawNatural && v?.name && NATURAL.test(v.name);
    u.rate = opts.rate ?? (natural ? 1.0 : 1.05);
    u.pitch = opts.pitch ?? (natural ? 1.0 : 1.06);
    u.volume = 0.9;
    if (v) u.voice = v;
    // Windows' free "Natural" voices render in the cloud even though they
    // show up as a local voice — if that request fails (no internet, the
    // speech service hiccups), fall back once to the plain on-device voice
    // rather than saying nothing at all.
    // Talking from the moment it's asked to, not from `onstart`: that can
    // come a second or more later (the Natural voices render in the cloud),
    // and in that gap Izuki looked finished and opened the mic — which then
    // heard its own reply. A start that never comes is let go after a while.
    // Only the newest line's events count: cancelling the previous one
    // fires its `onend` late, which would mark this one finished early.
    current = u;
    setSystemSpeaking(true);
    let started = false;
    setTimeout(() => {
      if (current === u && !started && !window.speechSynthesis.speaking) setSystemSpeaking(false);
    }, 6000);
    u.onstart = () => {
      started = true;
      if (current === u) setSystemSpeaking(true);
    };
    u.onend = () => {
      if (current === u) setSystemSpeaking(false);
    };
    u.onboundary = () => lastWordAt = performance.now();
    u.onerror = () => {
      if (current !== u) return;
      if (!natural) {
        setSystemSpeaking(false);
        return;
      }
      try {
        const retry = new SpeechSynthesisUtterance(text);
        retry.rate = 1.05;
        retry.pitch = 1.06;
        retry.volume = 0.9;
        const plain = window.speechSynthesis
          .getVoices()
          .find((cand) => /^en-/i.test(cand.lang) && !NATURAL.test(cand.name));
        if (plain) retry.voice = plain;
        // Still talking — the retry says it.
        current = retry;
        retry.onend = retry.onerror = () => {
          if (current === retry) setSystemSpeaking(false);
        };
        retry.onboundary = () => (lastWordAt = performance.now());
        window.speechSynthesis.speak(retry);
      } catch {
        /* out of options — stay silent rather than throw */
        setSystemSpeaking(false);
      }
    };
    window.speechSynthesis.speak(u);
  } catch {
    // Speech is a nicety; never let it take the rest of the command down.
  }
}

/** The line the Windows voice is saying (or about to). */
let current: SpeechSynthesisUtterance | null = null;

export function stopSpeaking() {
  current = null;
  if (canSpeak()) window.speechSynthesis.cancel();
  setSystemSpeaking(false);
}

let systemSpeaking = false;
const systemListeners = new Set<(speaking: boolean) => void>();

/** When the Windows voice last started a word. */
let lastWordAt = 0;

/**
 * A stand-in loudness for the Windows voice, 0..1 — it plays outside the
 * page, so there's no audio to measure. Each word it starts is a pulse
 * that fades, which is enough for the sphere to move in time with it.
 */
export function systemVoiceLevel(): number {
  if (!systemIsSpeaking()) return 0;
  const since = performance.now() - lastWordAt;
  const pulse = Math.max(0, 1 - since / 260);
  return Math.min(1, 0.18 + pulse * 0.6 + Math.random() * 0.12);
}

function setSystemSpeaking(v: boolean) {
  if (v === systemSpeaking) return;
  systemSpeaking = v;
  systemListeners.forEach((l) => l(v));
}

/** Follow when the Windows voice starts and stops talking. */
export function onSystemSpeaking(l: (speaking: boolean) => void): () => void {
  systemListeners.add(l);
  return () => systemListeners.delete(l);
}

export function systemIsSpeaking() {
  return systemSpeaking;
}
