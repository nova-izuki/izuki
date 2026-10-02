import { useEffect, useRef, useState } from "react";
import { useWakeEngine } from "../hooks/useWakeEngine";
import { useDictation } from "../hooks/useDictation";
import { autoFacts, matchLocalCommand, type LocalCommand } from "../lib/voiceCommands";
import { cancelChat, chatLane, needsApps, needsScreen, recentHistory, remember, type LaneResult } from "../lib/conversation";
import { speakable } from "../lib/speakable";
import { parseInstant, type Instant } from "../lib/instant";
import { isEcho, noteSaid, noteStillSaying } from "../lib/echo";
import { onSystemSpeaking, speak, stopSpeaking, systemIsSpeaking, systemVoiceLevel } from "../lib/speak";
import {
  lastCloudError,
  naturalOutputLevel,
  naturalSpeaking,
  onNaturalSpeaking,
  lineReady,
  naturalVoiceSpeed,
  naturalVoiceTooSlow,
  preloadNaturalVoice,
  prepareLines,
  probeVoiceSpeed,
  speakCloud,
  speakNatural,
  stopNatural,
  prefetchCloud,
} from "../lib/naturalVoice";
import { voiceFor } from "../lib/personas";
import { holdMicForVoice, micIsHeadset, preloadSpeechInput, releaseMicForVoice, setKeepMicWhileTalking } from "../lib/speechInput";
import { api, EV, emit, IS_TAURI, on } from "../lib/ipc";
import { useIzuki } from "../lib/store";
import type { CaptionPayload, DrawSession, OrbState, SayPayload, Settings, TranscriptPayload } from "../lib/types";

// A visible thinking state is enough. Speaking a stock acknowledgement while
// the answer is still arriving made Izuki sound repetitive and could overlap
// the useful answer on a slower request.
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

async function hideConfigWindow() {
  if (!IS_TAURI) return;
  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  await getCurrentWindow().hide();
}

/**
 * The one door every spoken/captioned line from Izuki goes through, so the
 * two settings — speak it, caption it — can never drift out of sync. The
 * caption renders in the overlay window (a different webview), so it's a
 * cross-window emit — after making sure the overlay is actually up to show
 * it, since with follow mode off nothing else may have it open. The caption
 * box paces its words to the voice when the voice is on, and manages its
 * own lifetime from there.
 */
async function respond(text: string, mood?: string | null, reply = false, quick = false) {
  const state = useIzuki.getState();
  // The floating chat runs in the overlay window, whose store never loads
  // real settings — and speech must come from one place, or two voices talk
  // over each other. Hand the line to the config panel's engine.
  if (!state.settingsLoaded) {
    const payload: SayPayload = { text, mood, reply, quick };
    void emit(EV.say, payload);
    return;
  }
  await say(text, state.settings, mood, reply, quick);
}

/**
 * What to say for a plan's summary. The backend already rescues cut-off
 * replies; this is the last guard so raw JSON is never read aloud.
 */
function sayable(summary: string, fallback: string): string {
  const t = summary.trim();
  if (!t) return fallback;
  if (/^[\[{]/.test(t) || /"(action|steps|summary)"\s*:/.test(t)) {
    return "Sorry — the answer came back garbled. Try again, or pick a different model.";
  }
  return t;
}

/** Your words, live, for the overlay's transcript bar (if it's on). */
function showTranscript(text: string, final: boolean) {
  if (!useIzuki.getState().settings.show_transcript) return;
  const p: TranscriptPayload = { text, final };
  void emit(EV.transcript, p);
}

/** Pick up lasting facts said in passing ("my name is…", "I love…"). */
function rememberInPassing(text: string) {
  const facts = autoFacts(text);
  if (!facts.length) return;
  void Promise.all(facts.map((f) => api.addMemory(f).catch(() => null))).then((saved) => {
    if (saved.some(Boolean)) void emit(EV.memoryChanged);
  });
}

/**
 * Save settings from either window. The overlay's store only holds
 * placeholder settings — saving from there would overwrite the real ones —
 * so from the overlay this asks the config panel to do it.
 */
function patchFromAnywhere(patch: Partial<Settings>) {
  const state = useIzuki.getState();
  if (state.settingsLoaded) state.patchSettings(patch);
  else void emit(EV.patchSettings, patch);
}

/** "Remember that…" / "forget…" — handled on the spot, no model needed. */
async function handleMemoryCommand(cmd: LocalCommand): Promise<boolean> {
  switch (cmd.kind) {
    case "remember": {
      const saved = await api.addMemory(cmd.text).catch(() => null);
      void emit(EV.memoryChanged);
      respond(saved ? pick(["Got it, I'll remember that.", "Noted!", "Okay — I'll keep that in mind."]) : "I already know that one.", "cheerful");
      return true;
    }
    case "forget": {
      const n = await api.forgetMemories(cmd.about).catch(() => 0);
      void emit(EV.memoryChanged);
      respond(n ? "Done — it's forgotten." : "I don't think I had anything about that.", "calm");
      return true;
    }
    case "forgetAll":
      await api.clearMemories().catch(() => undefined);
      void emit(EV.memoryChanged);
      respond("Okay. Clean slate — I've forgotten everything about you.", "calm");
      return true;
    case "sphere":
      patchFromAnywhere({ sphere_on_replies: cmd.on });
      if (!cmd.on) void emit(EV.orb, "hidden" satisfies OrbState);
      respond(
        cmd.on
          ? "Sphere's back — it'll show while I answer."
          : "Okay, no more sphere while I answer. Say \"show the sphere\" to bring it back.",
        "cheerful"
      );
      return true;
    default:
      return false;
  }
}

function showCaption(text: string, paced: boolean, msPerWord?: number) {
  const payload: CaptionPayload = { text, paced, msPerWord };
  void api
    .showCaptionOverlay()
    .catch(() => undefined)
    .then(() => emit(EV.caption, payload));
}

/**
 * Speak a line in the chosen voice and caption it. With the natural voice
 * the caption waits for the audio to actually start, so the words on screen
 * keep pace with the voice rather than racing ahead of it. Until the
 * natural model has downloaded (first run), the Windows voice stands in.
 */
/** Cloud voice problems already shown, so each is captioned only once. */
const cloudProblemsShown = new Set<string>();

async function say(text: string, settings: Settings, mood?: string | null, _reply = false, quick = false) {
  const caption = settings.show_captions;
  if (!settings.speak_responses) {
    if (caption) showCaption(speakable(text), false);
    return;
  }
  // Bluetooth headsets play everything in "phone call" quality while their
  // mic is open — let go of it so the voice sounds like a person, and take
  // it back once Izuki has finished (not merely started) talking. A quick
  // "Mhm?" keeps the mic: you're about to answer, and the switch would
  // cost a second.
  if (!quick) await holdMicForVoice();
  try {
    await speakLine(text, settings, mood);
  } finally {
    if (!quick) void untilQuiet().then(() => releaseMicForVoice());
  }
}

async function speakLine(raw: string, settings: Settings, mood: string | null | undefined) {
  const caption = settings.show_captions;
  // Said the way a person would say it (no markdown, links, "e.g."…); the
  // Orpheus voice keeps its <laugh>/<sigh> cues, captions never show them.
  const text = speakable(raw, settings.voice_engine === "orpheus");
  const shownText = speakable(raw, false);
  noteSaid(shownText);
  let shown = false;
  // Shown the moment the voice starts — never before it (HeyClicky keeps its
  // spinner until the audio plays) — and typed at the voice's real pace.
  const captionOnce = (msPerWord?: number) => {
    if (shown || !caption) return;
    shown = true;
    showCaption(shownText, true, msPerWord);
  };
  stopSpeaking();
  const engine = settings.voice_engine;
  const who = voiceFor(settings);

  // The most human voices first; each falls back to the next if it can't
  // speak right now (no key, out of credits, offline).
  if (["edge", "orpheus", "openai", "gemini", "azure", "elevenlabs"].includes(engine)) {
    const spoke = await speakCloud(engine, text, mood, captionOnce).catch(() => false);
    if (spoke) {
      captionOnce();
      return;
    }
    const why = lastCloudError ?? "it didn't answer";
    // A keyed voice that can't speak right now (out of today's free
    // allowance, no credit): the free natural voice is next best.
    const natural = engine !== "edge" && (await speakCloud("edge", speakable(raw, false), mood, captionOnce).catch(() => false));
    if (!cloudProblemsShown.has(why)) {
      cloudProblemsShown.add(why);
      const label =
        engine === "edge" ? "natural"
        : engine === "orpheus" ? "Human (Groq)"
        : engine === "gemini" ? "Gemini"
        : engine === "azure" ? "Azure"
        : engine === "elevenlabs" ? "ElevenLabs"
        : "ChatGPT";
      showCaption(`Couldn't use the ${label} voice — ${why}. Using the ${natural ? "natural" : "on-device"} voice for now.`, false);
    }
    if (natural) {
      captionOnce();
      return;
    }
  }
  // The natural voice — unless this PC can't make it fast enough right
  // now (a laptop on battery managed one sentence per 20 s): then the
  // instant Windows voice beats a reply that trickles out over a minute.
  // Pre-rendered lines ("Mhm?", "Okay!") are instant either way.
  const tooSlow = naturalVoiceTooSlow() && !lineReady(settings.voice_name, shownText);
  // The on-device voice only speaks English — a Spanish or Pidgin line goes
  // to Windows' voice for that language instead.
  if (engine !== "system" && !tooSlow && who.english) {
    // (Only the Orpheus voice performs <laugh> and friends.)
    const began = Date.now();
    const spoke = await speakNatural(shownText, settings.voice_name, captionOnce, mood, who.speed).catch((e) => {
      void api.log(`voice: natural voice failed — ${e}`).catch(() => undefined);
      return false;
    });
    void api.log(`voice: natural "${shownText.slice(0, 40)}" ${spoke ? "spoke" : "didn't speak"} in ${Date.now() - began}ms`).catch(() => undefined);
    if (spoke) {
      captionOnce();
      return;
    }
  } else {
    stopNatural();
    if (tooSlow) {
      probeVoiceSpeed(settings.voice_name); // plugged back in? find out
      if (!slowTipShown) {
        slowTipShown = true;
        void api.log(`voice: natural voice too slow on this PC right now (${naturalVoiceSpeed()?.toFixed(1)}× real time) — quick voice`);
        showCaption(
          "This PC is running slowly right now (on battery?), so I'm using the quick voice. Plug in the charger — or add a free Groq key under Voice → Human — for the natural voice with no wait.",
          false
        );
      }
    }
  }
  speak(shownText, { lang: who.lang, rate: who.speed !== 1 ? who.speed : undefined });
  // Windows' voice: ~370 ms a word at normal speed, faster or slower with the character's pace.
  if (caption) showCaption(shownText, true, 370 / (who.speed || 1));
}

/**
 * How long a conversation waits for you to say something before it closes
 * — your choice in settings (5 s … 30 min); "that's all" closes it at once.
 */
function followUpMs() {
  const secs = useIzuki.getState().settings.follow_up_secs || 1800;
  return Math.min(1800, Math.max(5, secs)) * 1000;
}

/**
 * Bumped by every new request, so an answer that arrives after you've moved
 * on to something else isn't read out over you. (Cutting Izuki off alone
 * doesn't count: you might be answering its question.)
 */
let requestSeq = 0;
/** Izuki asked "which one? circle it" and is waiting (see brain::ask_user). */
let helpPending = false;

/** Every time Izuki is cut off; lets a pending follow-up listen stand down. */
let interruptions = 0;

/** Silence Izuki immediately, whichever voice is talking. */
/**
 * Silence Izuki immediately. `keepMic`: a new reply follows straight away
 * — don't hand a Bluetooth mic back just to take it again a moment later
 * (each switch loses a second of sound).
 */
function stopAllSpeech(why: string, keepMic = false) {
  interruptions++;
  cancelChat();
  stopNatural(why);
  stopSpeaking();
  if (!keepMic) releaseMicForVoice();
}

/**
 * Wait for the line just handed to the voice to be *said*: until speech
 * has started (or a few seconds pass) and then gone quiet. `false` if Izuki
 * was cut off meanwhile.
 */
function untilSpoken(): Promise<boolean> {
  const at = interruptions;
  const began = Date.now();
  return new Promise((resolve) => {
    const t = setInterval(() => {
      if (interruptions !== at) {
        clearInterval(t);
        resolve(false);
      } else if (isSpeaking()) {
        clearInterval(t);
        void untilQuiet().then(resolve);
      } else if (Date.now() - began > 6000) {
        clearInterval(t);
        resolve(true);
      }
    }, 80);
  });
}

/**
 * The fast lane: stream a conversational reply and say each sentence the
 * moment it's written (conversation.ts / chat.rs). A Bluetooth mic stays
 * let go for the whole reply — it comes in pieces, and handing the mic back
 * between sentences would flip the headset's sound each time.
 */
async function talkFast(text: string): Promise<LaneResult> {
  const at = interruptions;
  if (useIzuki.getState().settings.speak_responses) void holdMicForVoice();
  let queue = Promise.resolve();
  let spokeAny = false;
  const expressive = useIzuki.getState().settings.voice_engine === "orpheus";
  const result = await chatLane(
    text,
    (chunk, last, mood) => {
      // Start making this sentence's audio now, while the one before is
      // still being said — no gap between them.
      const s = useIzuki.getState().settings;
      if (chunk && s.speak_responses && interruptions === at) prefetchCloud(s.voice_engine, speakable(chunk, s.voice_engine === "orpheus"), mood);
      queue = queue.then(async () => {
        if (interruptions !== at) return;
        if (chunk) {
          spokeAny = true;
          // `quick` keeps the mic held until the last piece.
          await respond(chunk, mood, true, !last);
          if (!last) await untilSpoken();
        } else if (last) {
          void untilQuiet().then(() => releaseMicForVoice());
        }
      });
    },
    expressive
  );
  await queue;
  if (result !== "done" && !spokeAny) releaseMicForVoice();
  return result;
}

/** When the apps lane last answered — a quick "yes, send it" goes back to it. */
let lastAppsAt = 0;
const APPS_FOLLOW_UP =
  /^\s*(yes|yeah|yep|yup|sure|ok(ay)?|go ahead|do it|please do|confirm|sounds good|perfect|send( it)?|no|nope|don'?t|cancel|wait|change|make it|add|remove|also|reply|and )\b/i;

/** The "this PC is too slow for the natural voice" tip, once per session. */
let slowTipShown = false;

/** What Izuki says when you just say its name — a quick "Mhm?". */
// (Never starting with "Hey…" — through speakers that could wake Izuki itself.)
const GREETINGS = ["Mhm?", "Yeah?", "I'm listening.", "How can I help?"];
/** And when you tell it you're done. */
const GOODBYES = ["Okay!", "Alright — I'm here if you need me.", "Got it. Talk soon!"];

function isSpeaking() {
  return naturalSpeaking() || systemIsSpeaking();
}

/**
 * Wait for Izuki to finish talking. Resolves `true` once it's been quiet for
 * a beat, `false` if it was cut off meanwhile (then the user is already
 * doing something else — don't start listening on top of it).
 */
function untilQuiet(): Promise<boolean> {
  const at = interruptions;
  const started = Date.now();
  return new Promise((resolve) => {
    let quietSince = 0;
    const t = setInterval(() => {
      if (interruptions !== at) {
        clearInterval(t);
        return resolve(false);
      }
      if (isSpeaking()) quietSince = 0;
      else if (!quietSince) quietSince = Date.now();
      if (quietSince && Date.now() - quietSince > 350) {
        clearInterval(t);
        resolve(true);
      } else if (Date.now() - started > 120_000) {
        clearInterval(t);
        resolve(false);
      }
    }, 100);
  });
}

/** A short, sayable version of whatever went wrong — not just "oops". */
function failure(e: unknown): string {
  const msg = String(e instanceof Error ? e.message : e).replace(/^Error:\s*/, "").trim();
  return msg ? `That didn't work — ${msg.slice(0, 220)}` : "Something went wrong.";
}

/**
 * A soft two-note chime — "I'm listening" — in place of a spoken cue. A
 * spoken "Listening." would land right in the mic that just opened; a short
 * chime is over before you start talking, and it's what people expect from
 * a voice assistant.
 */
let chimeCtx: AudioContext | null = null;
function chime(up = true) {
  try {
    chimeCtx ??= new AudioContext();
    const ctx = chimeCtx;
    void ctx.resume();
    const notes = up ? [660, 990] : [880, 587];
    notes.forEach((freq, i) => {
      const t = ctx.currentTime + i * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  } catch {
    /* no audio device — the voice ring still says it */
  }
}

/**
 * The one engine behind everything Izuki hears, says and does.
 *
 * Mounted exactly once, at the top of `GlassConfigPanel` (kept alive even
 * when the window is hidden to the tray). It owns the **session** — the time
 * the orb is on screen — and every way in goes through it: the wake word,
 * the talk hotkey, the typed chat and Ctrl+D. The rules it follows are
 * written down in docs/HOW-IZUKI-WORKS.md; change that first.
 */
export function VoiceEngine() {
  const enabled = useIzuki((s) => s.settings.voice_wake_enabled);
  const setVoice = useIzuki((s) => s.setVoice);

  // ---- the session ------------------------------------------------------
  /**
   * `on`: the orb is up. `voice`: it started by voice (wake word / talk key),
   * so after each answer Izuki listens for the next thing; a typed or drawn
   * request instead closes a few seconds after its answer. `orb`: whether
   * this session shows the orb at all (typed ones only if "show the orb for
   * typed replies" is on).
   */
  const session = useRef({ on: false, voice: false, orb: false });
  const [sessionOn, setSessionOn] = useState(false);
  /** The wake word rests a moment after a session, so it can't re-trigger on the goodbye. */
  const [wakeNap, setWakeNap] = useState(false);
  /** Words caught with the wake word while you were still talking. */
  const pendingPrefix = useRef("");
  /** Working on a request (thinking, looking, clicking) — the orb says "Thinking…". */
  const thinkingNow = useRef(false);
  /** Mic or speech-model failures in a row — a few, and the session stops trying. */
  const listenErrors = useRef(0);
  /** A typed session closing a few seconds after its answer. */
  const lingerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastBusy = useRef(false);

  /**
   * Esc stops Izuki for as long as a session is on — listening, thinking or
   * talking, like the orb's ✕ — and is left alone otherwise. (It's never
   * taken from your app either way; Izuki only notices it.)
   */
  const setBusy = (busy: boolean) => {
    if (busy === lastBusy.current) return;
    lastBusy.current = busy;
    void api.setBusy(busy).catch(() => undefined);
  };

  const orb = (state: OrbState) => {
    if (!session.current.on || !session.current.orb) return;
    // The orb's window may have been put away by something else (a task
    // finishing, the draw layer closing) — bring it back first.
    void api.showCaptionOverlay().catch(() => undefined);
    void emit(EV.orb, state);
  };

  const startSession = (voice: boolean, state: OrbState) => {
    if (lingerTimer.current) {
      clearTimeout(lingerTimer.current);
      lingerTimer.current = null;
    }
    const was = session.current;
    const showOrb = voice || was.orb || useIzuki.getState().settings.sphere_on_replies;
    session.current = { on: true, voice: was.voice || voice, orb: showOrb };
    if (!was.on) {
      setSessionOn(true);
      listenErrors.current = 0;
      void api.log(`session: start (${voice ? "voice" : "typed"})`);
    }
    setBusy(true);
    orb(state);
  };

  // `cancelListen` is set once the dictation hook exists (it's declared below).
  const cancelListen = useRef<() => void>(() => {});

  const endSession = (why: string) => {
    if (lingerTimer.current) {
      clearTimeout(lingerTimer.current);
      lingerTimer.current = null;
    }
    if (!session.current.on) return;
    void api.log(`session: end (${why})`);
    session.current = { on: false, voice: false, orb: false };
    setSessionOn(false);
    pendingPrefix.current = "";
    thinkingNow.current = false;
    cancelListen.current();
    void emit(EV.orb, "hidden" satisfies OrbState);
    setBusy(false);
    showTranscript("", false);
    // Let the goodbye (and the end of your sentence) pass before the wake
    // word listens again.
    setWakeNap(true);
    setTimeout(() => setWakeNap(false), 2000);
  };

  /** Close the session once Izuki has finished its last line — unless something new started meanwhile. */
  const endAfterSpeaking = (why: string) => {
    const at = requestSeq;
    void untilQuiet().then(() => {
      if (requestSeq === at) endSession(why);
    });
  };

  /**
   * Stop everything, now: the voice, the task in progress (it stops before
   * its next click and its answer is thrown away), the listening, and any
   * question Izuki was waiting on. Then the orb goes.
   */
  const stopEverything = (why: string) => {
    requestSeq++;
    helpPending = false;
    stopAllSpeech(why);
    void api.cancelTask().catch(() => undefined);
    endSession(why);
    // The orb is also shown for one-off screen tasks with no voice session on.
    // endSession() bails early then (session isn't "on"), so the ✕ would cancel
    // the task but leave the orb up — and the meter loop, seeing thinkingNow
    // still true, would re-show it. Force everything down here, always, so the
    // ✕ (and Esc, and "stop") always closes the orb no matter what state it's in.
    thinkingNow.current = false;
    listeningNow.current = false;
    cancelListen.current();
    void emit(EV.orb, "hidden" satisfies OrbState);
    setBusy(false);
    showTranscript("", false);
  };

  // `listenAgain` / `listenThrough` need the dictation hook, declared below.
  const listenAgain = useRef<() => void>(() => {});
  const listenThrough = useRef<() => boolean>(() => false);
  const listeningNow = useRef(false);

  /**
   * What happens after Izuki has answered. Voice sessions listen for your
   * next thing (the silence timer only starts now); typed ones close a few
   * seconds later, unless a voice session is running.
   */
  const afterReply = async (at: number, listeningThrough: boolean) => {
    if (requestSeq !== at || !session.current.on) return;
    if (session.current.voice) {
      // Already listening since the request went off — that listen carries on.
      if (listeningThrough && listeningNow.current) return;
      if (!(await untilQuiet())) return;
      if (requestSeq !== at || !session.current.on) return;
      orb("listening");
      listenAgain.current();
      return;
    }
    await untilQuiet();
    if (requestSeq !== at || !session.current.on || session.current.voice) return;
    orb("listening");
    lingerTimer.current = setTimeout(() => {
      if (requestSeq === at && !session.current.voice) endSession("typed request answered");
    }, 4000);
  };

  /**
   * One request — spoken or typed — through the one pipeline. Instant
   * commands first ("bye", "stop", "quit Izuki", "remember…"), then the
   * fast chat lane for plain talk, or the screen agent for anything to see
   * or do.
   */
  const handleRequest = async (text: string, from: "voice" | "typed") => {
    const t = text.trim();
    if (!t) return;
    // Classroom requests deliberately keep the pen overlay open until the
    // spoken explanation has finished. That also makes the caller wait, so
    // TeachingCard cannot resume a paused video halfway through a lesson.
    const teaching = t.startsWith("Explain this video frame on my screen.");
    // Anything new cuts Izuki off — like talking over someone.
    stopAllSpeech("a new request", useIzuki.getState().settings.speak_responses);
    const at = ++requestSeq;
    listenErrors.current = 0;

    // Choose the device BEFORE any Windows shortcuts or local app commands.
    if (/\b(?:my|the|this|on|open) (?:phone|iphone|android|mobile)\b/i.test(t)) {
      startSession(from === "voice", "thinking");
      const paired = useIzuki.getState().settings.android_enabled;
      const explicitAndroid = /\bon (?:my|the) android\b/i.test(t) && !/\biphone\b/i.test(t);
      const said = paired && explicitAndroid
        ? await api.androidDo(t).catch(failure)
        : /\biphone\b/i.test(t)
          ? "That's for your iPhone, not this PC. Use a supported Siri Shortcut on your iPhone; I can't unlock it or control every iPhone app."
          : paired
            ? "Do you mean your paired Android phone? Tell me the action, for example ‘open Chrome on my Android’. I haven't changed your PC."
            : "Which phone action do you want? Connect Android in Settings → Phone, or use a supported Siri Shortcut on iPhone. I haven't changed your PC.";
      if (requestSeq !== at) return;
      await respond(said);
      void afterReply(at, false);
      return;
    }

    const local = matchLocalCommand(t);
    if (local) {
      switch (local.kind) {
        case "stop":
          stopEverything("you said stop");
          return;
        case "endConversation":
          startSession(from === "voice", "speaking");
          respond(pick(GOODBYES), "cheerful");
          endAfterSpeaking("you said goodbye");
          return;
        case "quit": {
          stopAllSpeech("quitting");
          void api.cancelTask().catch(() => undefined);
          startSession(from === "voice", "speaking");
          respond("Closing Izuki. Bye!", "cheerful");
          // Let the goodbye be heard (but never wait long), then close for real.
          await Promise.race([untilQuiet(), new Promise((r) => setTimeout(r, 3500))]);
          void api.quitApp();
          return;
        }
        case "mute":
          patchFromAnywhere({ voice_wake_enabled: false });
          startSession(from === "voice", "speaking");
          respond("Okay — I'll stop listening for my name. Turn hands-free back on any time.");
          endAfterSpeaking("muted");
          return;
        default: {
          startSession(from === "voice", "speaking");
          await handleInstant(local);
          void afterReply(at, false);
          return;
        }
      }
    }

    // Everyday commands — "scroll down", "louder", "pause", "next song", "go
    // back", "new tab" — done at once, no AI to wait for or get wrong.
    const quick = await api.instantCommand(t).catch(() => null);
    if (requestSeq !== at) return;
    if (quick) {
      startSession(from === "voice", "speaking");
      await respond(quick, "cheerful");
      void afterReply(at, false);
      return;
    }


    // Instant skills: "open Notepad", "open YouTube" — through Windows,
    // well under a second, no AI.
    const instant = parseInstant(t);
    if (instant) {
      const said = await runInstant(instant);
      if (requestSeq !== at) return;
      if (said) {
        startSession(from === "voice", "speaking");
        await respond(said, "cheerful");
        void afterReply(at, false);
        return;
      }
      // Nothing installed by that name and not a known site: the agent finds it.
    }

    rememberInPassing(t);
    startSession(from === "voice", "thinking");
    thinkingNow.current = true;
    orb("thinking");
    setVoice({ lastHeard: t, busy: true });
    void emit(EV.thinking, true);
    // In a voice conversation, keep listening while Izuki thinks and
    // answers — start talking and it stops to hear you.
    const listeningThrough = from === "voice" && listenThrough.current();

    // Their apps (email, calendar, Drive, Slack…): done inside the apps
    // themselves, no screen — read, draft, and send only on a yes.
    const runApps = async (alreadyRemembered: boolean) => {
      if (!alreadyRemembered) remember("user", t);
      try {
        await useIzuki.getState().flushSettings();
        const answer = await api.appsAsk(recentHistory());
        if (requestSeq !== at) return;
        thinkingNow.current = false;
        // Not linked yet: open the sign-in page right away.
        for (const [, url] of answer.links) void api.openUrl(url).catch(() => undefined);
        const said = sayable(answer.text, "Done.");
        lastAppsAt = Date.now();
        remember("assistant", said);
        await respond(said, null, true);
        void afterReply(at, listeningThrough);
      } catch (e) {
        if (requestSeq !== at) return;
        thinkingNow.current = false;
        await respond(failure(e), "sympathetic");
        void afterReply(at, listeningThrough);
      }
    };

    try {
      const appsOn = !!useIzuki.getState().settings.composio_api_key.trim();
      // "Yes, send it" / "change the time to 4" right after an apps answer
      // is about that draft — not a screen task.
      const followUp = Date.now() - lastAppsAt < 3 * 60_000 && t.split(/\s+/).length <= 14 && APPS_FOLLOW_UP.test(t);
      if (appsOn && (needsApps(t) || followUp)) {
        await runApps(false);
        return;
      }
      // Just talking? The fast lane — no screenshot, the voice starts on the
      // first sentence. It hands over if it needs the screen after all.
      if (!needsScreen(t)) {
        const lane = await talkFast(t);
        if (requestSeq !== at) return;
        if (lane === "end") {
          thinkingNow.current = false;
          endAfterSpeaking("goodbye (the AI heard it)");
          return;
        }
        if (lane === "done") {
          thinkingNow.current = false;
          return void afterReply(at, listeningThrough);
        }
        if (lane === "cancelled") return;
        if (lane === "apps") {
          await runApps(true);
          return;
        }
        // "screen" / "failed": the full screen path below.
      }

      remember("user", t);
      // The orb already shows that work is under way. Keep the voice free for
      // the actual answer instead of adding a canned interruption.
      try {
        // Flush a just-edited setting (a freshly pasted key) before relying on it.
        await useIzuki.getState().flushSettings();
        if (useIzuki.getState().settings.speak_responses) void holdMicForVoice();
        const plan = await api.submitVoiceCommand(t);
        if (requestSeq !== at) return; // stopped, or you've moved on — don't answer over you
        thinkingNow.current = false;
        if (plan.remember?.length) void emit(EV.memoryChanged);
        const said = sayable(plan.summary, plan.steps.length ? "Done." : "I couldn't find anything to do for that.");
        remember("assistant", said);
        await respond(said, plan.mood, true);
        if (teaching) {
          // respond awaits cloud/local playback; Windows marks its queued
          // utterance as speaking synchronously. Don't wait six extra seconds
          // for an already-finished voice to start again before resuming video.
          if (useIzuki.getState().settings.speak_responses) await untilQuiet();
          if (requestSeq === at) {
            void emit(EV.penClear);
            await api.closeOverlay().catch(() => undefined);
          }
        }
        void afterReply(at, listeningThrough);
      } catch (e) {
        console.error(e);
        if (requestSeq !== at) return;
        thinkingNow.current = false;
        // A failure is said, and the conversation goes on — it doesn't end it.
        await respond(failure(e), "sympathetic");
        void afterReply(at, listeningThrough);
      }
    } finally {
      if (requestSeq === at) thinkingNow.current = false;
      setVoice({ busy: false });
      void emit(EV.thinking, false);
    }
  };

  /** A Ctrl+D / draw-overlay request — the same session, the same orb. */
  const handleDraw = async (payload: DrawSession) => {
    stopAllSpeech("a new request", useIzuki.getState().settings.speak_responses);
    const at = ++requestSeq;
    startSession(false, "thinking");
    thinkingNow.current = true;
    orb("thinking");
    void emit(EV.thinking, true);
    try {
      const plan = await api.submitDraw(payload);
      if (requestSeq !== at) return;
      thinkingNow.current = false;
      if (plan.remember?.length) void emit(EV.memoryChanged);
      // A plan read straight off the marks by geometry has nothing to say.
      if (plan.summary && plan.provider !== "local") await respond(sayable(plan.summary, "Done."), plan.mood, true);
      void afterReply(at, false);
    } catch (e) {
      if (requestSeq !== at) return;
      thinkingNow.current = false;
      await respond(failure(e), "sympathetic");
      void afterReply(at, false);
    } finally {
      if (requestSeq === at) thinkingNow.current = false;
      void emit(EV.thinking, false);
    }
  };

  // The module-level door (typed chat from anywhere) uses this.
  runRequest = handleRequest;

  // ---- listening ----------------------------------------------------------
  const {
    start: startPushToTalk,
    stop: finishPushToTalk,
    cancel: cancelDictation,
    listening: ptTListening,
    transcribing,
    error: pttError,
  } = useDictation(
    (heard) => {
      listenErrors.current = 0;
      // Answering Izuki's own question ("which account?") out loud — it goes
      // to the task that's waiting, not in as a new request.
      if (helpPending && !isEcho(heard)) {
        helpPending = false;
        showTranscript(heard, true);
        void api.answerHelp({ marks: [], prompt: heard, desktop: { x: 0, y: 0, w: 0, h: 0 }, createdAt: Date.now() });
        orb("thinking");
        return;
      }
      // Izuki's own voice coming back through the mic: not you. Keep listening.
      if (isEcho(heard)) {
        void api.log(`speech: ignored my own voice: "${heard.slice(0, 60)}"`);
        showTranscript("", false);
        if (session.current.on && session.current.voice) listenAgain.current();
        return;
      }
      // "Hey Nova, what's the time?" said while it's already listening: the
      // wake word isn't part of the question.
      const text = heard.replace(/^\s*(hey|hi|ok|okay)[\s,]+(nova|jarvis|izuki)\b[\s,.!?]*(?=\S)/i, "");
      const prefix = pendingPrefix.current;
      pendingPrefix.current = "";
      const full = prefix ? `${prefix} ${text}` : text;
      showTranscript(full, true);
      void handleRequest(full, "voice");
    },
    {
      // Your voice moves the orb — Izuki's own voice does while it talks.
      onLevel: (level) => {
        if (!isSpeaking()) void emit(EV.voiceLevel, level);
      },
      // Start reading the screen the moment you start talking.
      onSpeech: () => {
        void api.prefetchScreen();
        showTranscript(pendingPrefix.current || "…", false);
      },
      onPartialText: (text) => {
        if (isEcho(text)) return;
        const prefix = pendingPrefix.current;
        showTranscript(prefix ? `${prefix} ${text}` : text, false);
      },
      // Only real silence on your turn ends a conversation. A cough, noise,
      // or words that couldn't be made out just mean "keep listening".
      onNothing: (why) => {
        if (!session.current.on || !session.current.voice) return;
        const prefix = pendingPrefix.current;
        if (prefix) {
          pendingPrefix.current = "";
          void handleRequest(prefix, "voice");
          return;
        }
        if (why === "silence") {
          if (helpPending || thinkingNow.current || isSpeaking()) return void listenAgain.current();
          chime(false);
          endSession("quiet for the whole follow-up time");
          return;
        }
        if (why === "error" && ++listenErrors.current >= 3) {
          showCaption("I can't hear you right now — check the microphone in Talk to Izuki.", false);
          endSession("the microphone keeps failing");
          return;
        }
        // Unclear, cancelled (mic switched) or a one-off error: listen again,
        // unless something else already is.
        setTimeout(() => {
          if (session.current.on && session.current.voice && !listeningNow.current) {
            if (!thinkingNow.current && !isSpeaking()) orb("listening");
            listenAgain.current();
          }
        }, 250);
      },
    }
  );
  listeningNow.current = ptTListening;
  cancelListen.current = cancelDictation;

  listenAgain.current = () => {
    if (!session.current.on || !session.current.voice) return;
    startPushToTalk({ noSpeechMs: followUpMs() });
  };
  listenThrough.current = () => {
    const s = useIzuki.getState().settings;
    if (!s.barge_in || !session.current.on || !session.current.voice) return false;
    startPushToTalk({
      noSpeechMs: followUpMs(),
      cutIn: {
        busy: () => thinkingNow.current || isSpeaking(),
        // The Windows voice through speakers leaks into a desk/laptop mic and
        // the echo canceller can't remove it — only a headset can cut in then.
        allowed: () => micIsHeadset() || !systemIsSpeaking(),
        onCutIn: () => {
          void api.log("speech: you cut in — Izuki stops and listens");
          stopAllSpeech("you cut in", true);
          orb("listening");
        },
      },
    });
    return true;
  };
  // Keep the mic open while Izuki talks only when talking over it is on.
  const bargeIn = useIzuki((s) => s.settings.barge_in);
  useEffect(() => {
    setKeepMicWhileTalking(bargeIn);
  }, [bargeIn]);

  // Your turn: the orb says so (a listen that runs through Izuki's answer
  // leaves it on "Thinking…"/speaking until then).
  useEffect(() => {
    if (ptTListening && session.current.on && !thinkingNow.current && !isSpeaking()) orb("listening");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ptTListening]);

  // Between "you stopped talking" and "the model has it".
  useEffect(() => {
    if (transcribing) orb("thinking");
    void emit(EV.thinking, transcribing || thinkingNow.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcribing]);

  // ---- the wake word ---------------------------------------------------------
  // "Hey Nova": the orb comes up, Izuki says "Mhm?" and listens. One
  // detection, one session — it only listens when no session is on (during
  // one you just talk), and rests for a moment after one ends.
  const onWake = () => {
    if (session.current.on) return;
    stopAllSpeech("you said the wake word");
    void api.prefetchScreen();
    startSession(true, "listening");
    const at = interruptions;
    const said = respond(pick(GREETINGS), "cheerful", false, true).then(() => untilQuiet());
    // Listen right after "Mhm?" — but never wait on it: if the voice is slow,
    // listening starts anyway.
    void Promise.race([said, new Promise<boolean>((r) => setTimeout(() => r(true), 2500))]).then((ok) => {
      if (ok && interruptions === at && session.current.on) {
        orb("listening");
        listenAgain.current();
      }
    });
  };

  // The core lets go of Esc after 3 minutes with no word from here (a
  // forgotten "done"); a long task or conversation says "still going" once a
  // minute so Esc keeps working the whole time the orb is up.
  useEffect(() => {
    if (!sessionOn) return;
    const t = setInterval(() => void api.setBusy(true).catch(() => undefined), 60_000);
    return () => clearInterval(t);
  }, [sessionOn]);

  const wakeActive = enabled && !sessionOn && !wakeNap && !ptTListening && !transcribing;
  const [customWake, setCustomWake] = useState<string[]>([]);
  useEffect(() => {
    const load = () => void api.listWakewords().then(setCustomWake).catch(() => undefined);
    load();
    const off = on<void>(EV.wakewordsChanged, load);
    return () => void off.then((f) => f());
  }, []);
  // Loaded while hands-free is on; only *listening* while no session is on.
  const wakeWords = useWakeEngine(wakeActive, customWake, () => onWake(), enabled);

  // For the "Talk to Izuki" status line: listening for the wake word, in a
  // conversation, or missing a wake word altogether.
  useEffect(() => {
    setVoice({
      active: wakeWords.length > 0 || sessionOn,
      heard: false,
      error: enabled && customWake.length === 0 ? "no-wake-word" : null,
    });
  }, [wakeWords.length, sessionOn, enabled, customWake.length, setVoice]);

  // Say why nothing happened — caption only, no voice over your next try.
  useEffect(() => {
    if (pttError) showCaption(pttError, false);
  }, [pttError]);

  // ---- the talk hotkey -----------------------------------------------------
  const pressedAt = useRef(0);
  useEffect(() => {
    // Held down: talk while holding, let go to send. A quick tap keeps
    // listening until you pause.
    const off = on<void>(EV.pushToTalkRelease, () => {
      if (listeningNow.current && Date.now() - pressedAt.current > 600) finishPushToTalk();
    });
    return () => void off.then((f) => f());
  }, [finishPushToTalk]);

  useEffect(() => {
    const off = on<void>(EV.pushToTalk, () => {
      if (listeningNow.current) {
        finishPushToTalk();
        return;
      }
      pressedAt.current = Date.now();
      // The key means "my turn": it cuts Izuki off.
      const wasTalking = isSpeaking();
      stopAllSpeech("you pressed the talk key");
      if (!wasTalking) chime();
      startSession(true, "listening");
      // The first listen gives up after a few seconds of nothing (you pressed
      // it by accident); follow-ups wait as long as the setting says.
      startPushToTalk({ noSpeechMs: 8000 });
    });
    return () => void off.then((f) => f());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startPushToTalk, finishPushToTalk]);

  // ---- everything else that talks to the engine ------------------------------
  useEffect(() => {
    const offs = [
      // Lines to say: the overlay's, and "what I'm doing" while a task runs.
      on<SayPayload | string>(EV.say, (p) =>
        void (typeof p === "string" ? respond(p) : respond(p.text, p.mood, p.reply, p.quick))
      ),
      on<Partial<Settings>>(EV.patchSettings, (patch) => useIzuki.getState().patchSettings(patch)),
      // Typed in the overlay's chat.
      on<{ id: number; text: string }>(EV.runChat, (m) => {
        void handleRequest(m.text, "typed").finally(() => emit(EV.chatDone, { id: m.id }));
      }),
      // Ctrl+D / the draw overlay.
      on<DrawSession>(EV.runDraw, (payload) => void handleDraw(payload)),
      on<void>(EV.prepareVoice, () => {
        if (useIzuki.getState().settings.speak_responses) void holdMicForVoice();
      }),
      on<string>(EV.helpAsk, (question) => {
        helpPending = true;
        if (!session.current.on) startSession(false, "speaking");
        respond(question, "curious", true, true);
      }),
      on<void>(EV.helpDone, () => {
        helpPending = false;
      }),
      // The stop hotkey, Esc, the tray's Stop, the orb's ✕.
      on<void>(EV.stopSpeaking, () => stopEverything("stop was pressed")),
    ];
    return () => offs.forEach((o) => void o.then((f) => f()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- the orb follows Izuki's voice --------------------------------------------
  useEffect(() => {
    let meter: ReturnType<typeof setInterval> | null = null;
    let duckHeartbeat: ReturnType<typeof setInterval> | null = null;
    let restoreMedia: ReturnType<typeof setTimeout> | null = null;
    const update = () => {
      const talking = naturalSpeaking() || systemIsSpeaking();
      if (restoreMedia) clearTimeout(restoreMedia);
      if (duckHeartbeat) clearInterval(duckHeartbeat);
      restoreMedia = null; duckHeartbeat = null;
      if (talking) {
        void api.duckAudio(true, "speaking").catch(() => undefined);
        duckHeartbeat = setInterval(() => void api.duckAudio(true, "speaking").catch(() => undefined), 10_000);
      } else {
        // Bridge short gaps between streamed sentences without volume pumping.
        restoreMedia = setTimeout(() => void api.duckAudio(false, "speaking").catch(() => undefined), 650);
      }
      void emit(EV.speaking, talking);
      if (talking) orb("speaking");
      else if (thinkingNow.current) orb("thinking");
      else if (listeningNow.current) orb("listening");
      if (meter) clearInterval(meter);
      meter = null;
      if (talking) {
        // The natural voice is measured; the Windows voice plays outside the
        // page, so it gets a stand-in that pulses with each word.
        meter = setInterval(() => {
          noteStillSaying();
          void emit(EV.voiceLevel, naturalSpeaking() ? naturalOutputLevel() : systemVoiceLevel());
        }, 60);
      }
    };
    const offs = [onNaturalSpeaking(update), onSystemSpeaking(update)];
    return () => {
      offs.forEach((o) => o());
      if (meter) clearInterval(meter);
      if (duckHeartbeat) clearInterval(duckHeartbeat);
      if (restoreMedia) clearTimeout(restoreMedia);
      void api.duckAudio(false, "speaking").catch(() => undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Developer self-test (IZUKI_SELFTEST=1): real requests through the real
  // session, logging what happened, so behaviour can be checked end to end
  // without anyone talking to it. Never on for users.
  const selftestReady = useIzuki((st) => st.settingsLoaded);
  useEffect(() => {
    if (!selftestReady) return;
    void api.selftestEnabled().then(async (mode) => {
      if (!mode) return;
      const log = (m: string) => void api.log(`selftest: ${m}`);
      const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
      const s = () => (session.current.on ? (session.current.voice ? "on(voice)" : "on(typed)") : "off");
      await wait(9000);
      if (mode === "esc") {
        // The orb listening (no AI involved): Esc from outside closes it.
        startSession(true, "listening");
        listenAgain.current();
        await wait(1500);
        log("waiting for Esc");
        const at = Date.now();
        while (session.current.on && Date.now() - at < 30000) await wait(50);
        log(`listening orb Esc -> session ${s()} (want off) after ${Date.now() - at} ms, listening ${listeningNow.current} (want false)`);
        log("done");
        return;
      }
      if (mode === "draw") {
        // A drawing with words runs the full task loop; a real Esc pressed
        // from outside mid-task must end it with no more hand moves and no
        // late answer.
        let handMoves = 0;
        const offHand = on(EV.hand, () => void handMoves++);
        const box = { x: 40, y: 40, w: 900, h: 600 };
        const t0 = Date.now();
        const task = handleDraw({
          marks: [{ id: "st1", kind: "box", rect: box, points: [], intent: "auto", order: 1 }],
          prompt: "point at each thing inside this box one by one, and say what each one is",
          desktop: { x: 0, y: 0, w: window.screen.width, h: window.screen.height },
          createdAt: Date.now(),
        });
        await wait(2500);
        log("waiting for Esc");
        const escAt = Date.now();
        while (session.current.on && Date.now() - escAt < 30000) await wait(100);
        const stoppedIn = Date.now() - escAt;
        const movesAtStop = handMoves;
        await task;
        await wait(15000);
        log(
          `draw task Esc -> session ${s()} (want off) after ${stoppedIn} ms, hand moves after stop ${handMoves - movesAtStop} (want 0), speaking ${isSpeaking()} (want false), task took ${Date.now() - t0} ms`
        );
        void offHand.then((f) => f());
        log("done");
        return;
      }
      if (mode === "agent") {
        // The instant path (no AI), then a real multi-step task using the skills.
        let t0 = Date.now();
        await handleRequest("open Notepad", "typed");
        log(`instant "open Notepad" -> ${Date.now() - t0} ms`);
        await wait(3000);
        log("closing notepad");
        await wait(4000);
        t0 = Date.now();
        await handleRequest("open Notepad and type: hello from Izuki", "typed");
        log(`agent "open Notepad and type…" -> ${Date.now() - t0} ms`);
        await wait(6000);
        log("closing notepad");
        await wait(4000);
        log("done");
        return;
      }
      log("start");
      let t = Date.now();
      await handleRequest("hi", "typed");
      log(`typed hi -> answered in ${Date.now() - t} ms, session ${s()} (want on)`);
      await wait(9000);
      log(`typed session after its answer + linger: ${s()} (want off)`);
      t = Date.now();
      await handleRequest("what is two plus two? answer in five words", "typed");
      log(`typed question -> answered in ${Date.now() - t} ms, session ${s()}`);
      await handleRequest("okay, bye Nova.", "typed");
      await wait(4000);
      log(`typed "okay, bye Nova." -> session ${s()} (want off)`);
      startSession(true, "listening");
      t = Date.now();
      await handleRequest("tell me a fun fact about the moon in one sentence", "voice");
      await wait(1500);
      log(`voice question -> ${Date.now() - t} ms, session ${s()} (want on(voice)), listening ${listeningNow.current} (want true)`);
      await handleRequest("that's all, thanks", "voice");
      await wait(4000);
      log(`voice "that's all, thanks" -> session ${s()} (want off), listening ${listeningNow.current} (want false)`);
      t = Date.now();
      await handleRequest("what app is in front on my screen? answer in one short sentence, don't click anything", "typed");
      log(`screen question -> answered in ${Date.now() - t} ms`);
      await wait(16000);
      log(`after screen answer + linger: ${s()} (want off)`);
      const before = requestSeq;
      const task = handleRequest("what's on my screen right now? describe it briefly", "typed");
      await wait(1500);
      stopEverything("selftest stop");
      await task;
      await wait(3000);
      log(`stop mid-task -> session ${s()} (want off), answer dropped ${requestSeq > before + 1} (want true), speaking ${isSpeaking()} (want false)`);
      await wait(3000);
      // Esc while busy: the tester presses Esc from outside once it sees this line.
      const escTask = handleRequest("describe everything on my screen in detail, don't click anything", "typed");
      await wait(800);
      log("waiting for Esc");
      const escAt = Date.now();
      while (session.current.on && Date.now() - escAt < 25000) await wait(200);
      await escTask;
      log(`Esc -> session ${s()} (want off) after ${Date.now() - escAt} ms, speaking ${isSpeaking()} (want false)`);
      await wait(3000);
      // The stop hotkey (Ctrl+Shift+Q) while busy, pressed from outside the same way.
      const qTask = handleRequest("describe everything on my screen in detail again, don't click anything", "typed");
      await wait(800);
      log("waiting for the stop key");
      const qAt = Date.now();
      while (session.current.on && Date.now() - qAt < 25000) await wait(200);
      await qTask;
      log(`stop key -> session ${s()} (want off) after ${Date.now() - qAt} ms, speaking ${isSpeaking()} (want false)`);
      await wait(3000);
      log("quitting now (want the app to close)");
      await handleRequest("quit Izuki", "typed");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selftestReady]);

  // Fetch the voice and the ears in the background as soon as possible, so
  // the first request doesn't wait on a one-time download.
  const voiceEngine = useIzuki((s) => s.settings.voice_engine);
  const persona = useIzuki((s) => `${s.settings.persona}|${s.settings.persona_voice}|${s.settings.voice_rate}|${s.settings.voice_pitch}`);
  const settingsLoaded = useIzuki((s) => s.settingsLoaded);
  useEffect(() => {
    if (!settingsLoaded || voiceEngine !== "edge") return;
    // The natural voice needs no model on this PC — just have the short
    // lines ("Mhm?", "On it.") made once, so they play the instant they're
    // needed (the backend keeps them).
    let cancelled = false;
    void (async () => {
      await new Promise((r) => setTimeout(r, 1500));
      for (const line of GREETINGS) {
        if (cancelled) return;
        await api.speakCloud("edge", line, null).catch(() => undefined);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [settingsLoaded, voiceEngine, persona]);
  useEffect(() => {
    if (!settingsLoaded) return;
    if (voiceEngine === "edge") {
      // The offline voice only matters as a fallback here; loading its model
      // at start cost seconds of CPU on slower laptops. It loads on demand.
      void preloadSpeechInput().catch(() => undefined);
      return;
    }
    // The saved short lines ("Mhm?", "Okay!") first — they're tiny, need no
    // model, and make the very first wake-word answer instant.
    if (voiceEngine !== "system") {
      void prepareLines([...GREETINGS, ...GOODBYES], useIzuki.getState().settings.voice_name);
    }
    // On a PC known to be too slow for the natural voice (remembered from
    // last time), skip loading its model — it only slowed the start down.
    const voice =
      voiceEngine !== "system" && !naturalVoiceTooSlow()
        ? preloadNaturalVoice(useIzuki.getState().settings.voice_name)
            .then(() => undefined)
            .catch((e) => console.warn("natural voice unavailable:", e))
        : Promise.resolve();
    void voice.finally(() => {
      void preloadSpeechInput()
        .catch(() => undefined)
        .finally(() => {
          if (voiceEngine !== "system") {
            void prepareLines([...GREETINGS, ...GOODBYES], useIzuki.getState().settings.voice_name);
          }
        });
    });
  }, [settingsLoaded, voiceEngine]);

  return null;
}

/** Do an instant skill; the line to say, or null if it couldn't (the agent takes over). */
async function runInstant(i: Instant): Promise<string | null> {
  const name = i.name.charAt(0).toUpperCase() + i.name.slice(1);
  if (i.kind === "play") {
    try {
      const title = await api.playYoutube(i.name);
      void api.log(`instant: youtube "${i.name}" -> ${title ?? "results only"}`);
      return title ? `Playing ${title}.` : `Here's ${i.name} on YouTube — pick the one you want.`;
    } catch {
      return null; // the agent tries it the long way
    }
  }
  if (i.kind === "app") {
    try {
      await api.openApp(i.name);
      void api.log(`instant: opened app "${i.name}"`);
      return `Opening ${name}.`;
    } catch {
      /* not installed — maybe it's a website */
    }
  }
  if (i.url) {
    try {
      await api.openUrl(i.url);
      void api.log(`instant: opened ${i.url}`);
      return `Opening ${name}.`;
    } catch {
      return null;
    }
  }
  return null;
}

/** Instant commands that answer in one line and change a setting or window. */
async function handleInstant(local: LocalCommand) {
  if (await handleMemoryCommand(local)) return;
  switch (local.kind) {
    case "greeting":
      await respond(pick(GREETINGS), "cheerful", false, true);
      return;
    case "hide":
      await respond("Hiding.");
      void hideConfigWindow();
      return;
    case "show":
      await respond("I'm here.");
      void api.showConfig();
      return;
    case "chat":
      await respond("Go ahead, type it.");
      patchFromAnywhere({ chat_mode: true });
      void emit(EV.openFloatingChat);
      return;
    case "resetChat":
      await respond("Chat's back in the corner.");
      void emit(EV.resetFloating);
      return;
  }
}

/** Set by the mounted `VoiceEngine` — the one pipeline for every request. */
let runRequest: (text: string, from: "voice" | "typed") => Promise<void> = async () => {};

/**
 * Send a typed chat line through the exact same pipeline a spoken one uses.
 *
 * Resolves true once something has handled it. False means the overlay handed
 * the line to the config panel and nothing ever answered — the chat must show
 * that and let the message be sent again, rather than spin forever.
 */
export async function sendChatCommand(text: string): Promise<boolean> {
  const t = text.trim();
  if (!t) return false;
  // Typed in the overlay's floating chat: the voice, the mic and the real
  // settings all live in the config panel — hand the message over and wait
  // for it to be handled, so there's exactly one place this logic runs.
  if (!useIzuki.getState().settingsLoaded) {
    const id = Date.now() + Math.random();
    let handled = false;
    await new Promise<void>((resolve) => {
      const timer = setTimeout(done, 180_000);
      const off = on<{ id: number }>(EV.chatDone, (d) => {
        if (d.id !== id) return;
        handled = true;
        done();
      });
      function done() {
        clearTimeout(timer);
        void off.then((f) => f());
        resolve();
      }
      void off.then(() => emit(EV.runChat, { id, text: t }));
    });
    return handled;
  }
  await runRequest(t, "typed");
  return true;
}
