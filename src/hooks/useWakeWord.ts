import { useEffect, useRef, useState } from "react";
import { canListen, listen, preloadSpeechInput, toWav, transcribe, whisperCheck, type Listening } from "../lib/speechInput";
import { api } from "../lib/ipc";
import { isEchoOfMe } from "../lib/naturalVoice";

/**
 * "Hey Izuki, …" or just "Nova, …" — always-on listening.
 *
 * Runs on Izuki's own on-device speech-to-text (lib/speechInput): the mic
 * waits for someone to talk, each thing said is transcribed on this PC, and
 * it only counts as a command once it opens with one of the wake words
 * below — everything else is dropped on the spot, never sent anywhere. It
 * does keep the mic open and costs some CPU whenever people talk nearby,
 * which is exactly why the toggle defaults to off.
 */

// Longer, more specific phrases first — "nova izuki" must be tried before the
// bare "nova" or "izuki" it contains, or the extra word leaks into the command.
const WAKE_WORDS = [
  "hey nova izuki",
  "hey izuki nova",
  "nova izuki",
  "izuki nova",
  "hey izuki",
  "hey uzuki",
  "hey suzuki",
  "hey isuki",
  "hey izuky",
  "hey azuki",
  "ok izuki",
  "okay izuki",
  "yo izuki",
  "hey nova",
  "ok nova",
  "okay nova",
  "yo nova",
  "izuki",
  "nova",
];

/** Strip a leading wake phrase and hand back what comes after it. */
export function afterWakeWord(heard: string): string | null {
  // Compare without punctuation — "Hey, Izuki. Open Chrome." should match.
  const words = heard.trim().split(/\s+/);
  const bare = words.map((w) => w.toLowerCase().replace(/[^a-z0-9']/g, ""));
  const norm = bare.filter(Boolean).join(" ");
  if (!norm) return null;
  for (const w of WAKE_WORDS) {
    if (norm === w) return "";
    if (norm.startsWith(`${w} `)) {
      // Drop as many original words as the wake phrase used (skipping any
      // that were pure punctuation), keeping the rest as it was written.
      let need = w.split(" ").length;
      let i = 0;
      while (i < words.length && need > 0) {
        if (bare[i]) need--;
        i++;
      }
      return words.slice(i).join(" ").replace(/^[,.!?\s]+/, "").trim();
    }
  }
  return fuzzyWake(words, bare);
}

/** Greetings that may come before the name. */
const GREETINGS = new Set(["hey", "hi", "hay", "hei", "a", "ok", "okay", "yo", "hello", "oi"]);

function editDistance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/** "izuki", "zuki", "suki", "suzuki", "isooky"… — how it gets misheard. */
function soundsLikeIzuki(w: string): boolean {
  if (w.length < 3) return false;
  if (/^(i|e|a|y|ee)?(z|s|zz)(u|oo|ou)(k|c|kk)(i|ie|y|ee|e)$/.test(w)) return true;
  return /[zs]/.test(w) && /k/.test(w) && editDistance(w, "izuki") <= 2;
}

/**
 * Looser: how the speech models actually wrote "Izuki" in testing —
 * "isurky", "isaacy", "isaaci", "isurki". Only trusted right after a
 * greeting ("Hey Isaacy"), so a sentence about someone called Isaac
 * doesn't wake Izuki.
 */
function looselyIzuki(w: string): boolean {
  if (w.length < 4 || w.length > 8) return false;
  return /^[aeiy]?[sz]+[aeiouy]+r?[kc]+[aeiouy]*$/.test(w) || editDistance(w, "izuki") <= 2;
}
function soundsLikeNova(w: string): boolean {
  return w.length === 4 && w[0] === "n" && editDistance(w, "nova") <= 1;
}

/**
 * The speech model rarely spells a made-up name the same way twice — "Hey
 * Zuki", "Hey Suki", "Isuki" — so after the exact list, accept anything
 * that sounds close, optionally after a greeting, as one word or two run
 * together ("hey is uki").
 */
function fuzzyWake(words: string[], bare: string[]): string | null {
  const idx = bare.map((b, i) => (b ? i : -1)).filter((i) => i >= 0);
  if (!idx.length) return null;
  let k = 0;
  if (GREETINGS.has(bare[idx[0]]) && idx.length > 1) k = 1;
  for (const span of [1, 2]) {
    const parts = idx.slice(k, k + span);
    if (parts.length < span) break;
    const cand = parts.map((i) => bare[i]).join("");
    const greeted = k === 1;
    if (soundsLikeIzuki(cand) || (greeted && looselyIzuki(cand)) || (span === 1 && soundsLikeNova(cand))) {
      const after = parts[parts.length - 1] + 1;
      return words.slice(after).join(" ").replace(/^[,.!?\s]+/, "").trim();
    }
  }
  return null;
}

export interface WakeWordState {
  available: boolean;
  /** True once a recognition session is actually running. */
  active: boolean;
  /** Set for a couple of seconds right after the wake word fires. */
  heard: boolean;
  error: string | null;
}

/**
 * `onCommand(text, cutOff)`: `text` is what followed the wake word ("" for
 * just "Hey Izuki"); `cutOff` means you were still talking when the clip
 * ended, so the caller should keep listening for the rest.
 */
export function useWakeWord(enabled: boolean, onCommand: (text: string, cutOff: boolean) => void): WakeWordState {
  const [active, setActive] = useState(false);
  const [heard, setHeard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heardTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCommandRef = useRef(onCommand);
  onCommandRef.current = onCommand;

  const available = canListen();

  useEffect(() => {
    if (!enabled || !available) {
      setActive(false);
      return;
    }

    let alive = true;
    let current: Listening | null = null;
    let lastSaved = 0;
    const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

    void (async () => {
      void preloadSpeechInput().catch(() => undefined);
      while (alive) {
        // Wait for someone to talk, however long that takes; one phrase at
        // a time, capped so a TV in the background can't fill memory.
        // Only the first couple of seconds after a pause can hold "Hey
        // Izuki" — so that's all that gets transcribed. Transcribing whole
        // conversations in the room buried real requests under a backlog
        // (15 s clips taking 20 s each) and ate the CPU the voice needs.
        current = listen({ noSpeechMs: 0, silenceMs: 600, maxMs: 2600, quietFirstMs: 200 });
        const session = current;
        setActive(true);
        let audio: Float32Array | null;
        try {
          audio = await current.audio;
          setError(null);
        } catch (e) {
          setActive(false);
          setError(
            e instanceof DOMException && e.name === "NotAllowedError"
              ? "Microphone access was refused — allow it to use hands-free mode."
              : "Couldn't open the microphone."
          );
          await pause(5000);
          continue;
        } finally {
          current = null;
        }
        if (!alive || !audio) continue;
        const cutOff = session.cutOff;

        // The small, fast model first. If it hears nothing at all,
        // `transcribe` asks Whisper — which caught a real "Hey Nova!" from
        // this headset that Moonshine returned nothing for.
        const copy = audio.slice();
        let text = await transcribe(audio, "tiny", { whisperFallback: false }).catch(() => "");
        if (!text && alive) {
          // Nothing from the fast model: Whisper double-checks it *while
          // the mic keeps listening* (it takes seconds on a slow laptop).
          const clip = copy.slice();
          void whisperCheck(clip)
            .then((heard) => {
              if (!alive || !heard) return;
              const cmd = afterWakeWord(heard);
              if (cmd === null) return;
              current?.cancel(); // the conversation takes the mic from here
              setHeard(true);
              if (heardTimer.current) clearTimeout(heardTimer.current);
              heardTimer.current = setTimeout(() => setHeard(false), 2400);
              onCommandRef.current(cmd, false);
            })
            .catch(() => undefined);
          text = "";
        }
        // Keep a few clips that weren't a wake word, so a missed "Hey
        // Izuki" can be checked afterwards (newest dozen, on this PC only).
        if (Date.now() - lastSaved > 4000 && text.split(/\s+/).length <= 4) {
          lastSaved = Date.now();
          const name = `wake-${new Date().toISOString().slice(11, 19).replace(/:/g, "")}-${(text || "empty").replace(/[^a-z0-9]+/gi, "_").slice(0, 20)}`;
          void api.saveClip(name, toWav(copy));
        }
        if (!alive) break;
        // Izuki hearing its own reply through the speakers isn't a command.
        if (isEchoOfMe(text)) continue;
        const command = afterWakeWord(text);
        if (command === null || !alive) continue;

        setHeard(true);
        if (heardTimer.current) clearTimeout(heardTimer.current);
        heardTimer.current = setTimeout(() => setHeard(false), 2400);
        // "" = just the wake word: the caller opens the mic for the rest.
        onCommandRef.current(command, cutOff);
      }
    })();

    return () => {
      alive = false;
      current?.cancel();
      setActive(false);
      if (heardTimer.current) clearTimeout(heardTimer.current);
    };
  }, [enabled, available]);

  return { available, active, heard, error };
}
