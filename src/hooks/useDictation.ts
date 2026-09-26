import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/ipc";
import { canListen, listen, preloadSpeechInput, transcribe, transcribePartial, type Listening } from "../lib/speechInput";

/**
 * Push-to-talk dictation: start() opens the mic, you talk, and it ends by
 * itself when you pause (or when stop() is called), then transcribes on
 * this PC and hands the text to `onFinal`.
 *
 * Built on Izuki's own speech-to-text (lib/speechInput), not the webview's
 * `SpeechRecognition`, which WebView2 153 broke.
 */

export interface Dictation {
  available: boolean;
  /** The mic is open and taking your words. */
  listening: boolean;
  /** You've stopped; the words are being worked out. */
  transcribing: boolean;
  /** The last thing heard (set once transcribed). */
  transcript: string;
  error: string | null;
  start: (o?: StartOptions) => void;
  /** Done talking — transcribe what was said so far. */
  stop: () => void;
  /** Throw away what was said. */
  cancel: () => void;
}

export interface StartOptions {
  noSpeechMs?: number;
  /** Listen while Izuki is still busy, so you can cut in (see `listen`). */
  cutIn?: { busy: () => boolean; onCutIn: () => void; allowed?: () => boolean };
}

export interface DictationOptions {
  /** Live mic loudness 0..1 while listening — drives the voice ring. */
  onLevel?: (level: number) => void;
  /** Give up after this long with no speech (ms). */
  noSpeechMs?: number;
  /**
   * A listen ended with nothing to act on, and why: "silence" (nobody spoke
   * for the whole wait), "unclear" (sound, but no words made out), "cancelled"
   * (stopped / mic taken away), "error" (the mic or speech model failed).
   * Only "silence" means the person has gone quiet.
   */
  onNothing?: (why: "silence" | "unclear" | "cancelled" | "error") => void;
  /** The moment you start talking. */
  onSpeech?: () => void;
  /** Your words so far, while you're still talking (rough; final follows). */
  onPartialText?: (text: string) => void;
}

export function useDictation(onFinal: (text: string) => void, opts: DictationOptions = {}): Dictation {
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const session = useRef<Listening | null>(null);
  const finalRef = useRef(onFinal);
  finalRef.current = onFinal;
  const optsRef = useRef(opts);
  optsRef.current = opts;
  /** One live-words pass at a time — the laptop may be slow. */
  const partialBusy = useRef(false);

  const available = canListen();

  const start = useCallback((o?: StartOptions) => {
    if (session.current) return;
    if (!canListen()) {
      setError("No microphone is available — type instead.");
      return;
    }
    // Load the model while you talk rather than after (a no-op once loaded).
    void preloadSpeechInput().catch(() => undefined);

    const s = listen({
      onLevel: (l) => optsRef.current.onLevel?.(l),
      onSpeech: () => optsRef.current.onSpeech?.(),
      onPartial: (audio) => {
        if (!optsRef.current.onPartialText || partialBusy.current) return;
        partialBusy.current = true;
        void transcribePartial(audio)
          .then((t) => {
            if (t && session.current === s) optsRef.current.onPartialText?.(t);
          })
          .catch(() => undefined)
          .finally(() => (partialBusy.current = false));
      },
      noSpeechMs: o?.noSpeechMs ?? optsRef.current.noSpeechMs ?? 8000,
      cutIn: o?.cutIn,
    });
    session.current = s;
    setError(null);
    setTranscript("");
    setListening(true);
    // Music and videos down while you talk, so the mic hears you, not the
    // song (off in Talk settings; the core also skips it then).
    void api.duckAudio(true).catch(() => undefined);
    const unduck = () => void api.duckAudio(false).catch(() => undefined);

    void s.audio.then(async (audio) => {
      unduck();
      if (session.current === s) session.current = null;
      setListening(false);
      if (!audio) {
        optsRef.current.onNothing?.(s.endReason === "silence" ? "silence" : "cancelled");
        return;
      }
      setTranscribing(true);
      try {
        const text = await transcribe(audio);
        if (!text) {
          optsRef.current.onNothing?.("unclear");
          return;
        }
        setTranscript(text);
        finalRef.current(text);
      } catch (e) {
        setError(`Couldn't make that out — ${e instanceof Error ? e.message : String(e)}`);
        optsRef.current.onNothing?.("error");
      } finally {
        setTranscribing(false);
      }
    }, (e: unknown) => {
      unduck();
      if (session.current === s) session.current = null;
      setListening(false);
      optsRef.current.onNothing?.("error");
      setError(
        e instanceof DOMException && e.name === "NotAllowedError"
          ? "Microphone access was refused — check Windows Settings › Privacy › Microphone."
          : "Couldn't open the microphone."
      );
    });
  }, []);

  const stop = useCallback(() => session.current?.finish(), []);
  const cancel = useCallback(() => session.current?.cancel(), []);

  useEffect(() => () => session.current?.cancel(), []);

  return { available, listening, transcribing, transcript, error, start, stop, cancel };
}
