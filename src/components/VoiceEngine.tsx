import { useCallback, useEffect, useRef, useState } from "react";
import { useWakeWord } from "../hooks/useWakeWord";
import { useWakeEngine } from "../hooks/useWakeEngine";
import { useDictation } from "../hooks/useDictation";
import { autoFacts, matchLocalCommand, type LocalCommand } from "../lib/voiceCommands";
import { cancelChat, chatLane, needsScreen, remember, type LaneResult } from "../lib/conversation";
import { speakable } from "../lib/speakable";
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
} from "../lib/naturalVoice";
import { holdMicForVoice, preloadSpeechInput, releaseMicForVoice, setKeepMicWhileTalking } from "../lib/speechInput";
import { api, EV, emit, IS_TAURI, on } from "../lib/ipc";
import { useIzuki } from "../lib/store";
import type { CaptionPayload, ListeningPayload, OrbState, SayPayload, Settings, TranscriptPayload } from "../lib/types";

const ACK = ["On it.", "Got it.", "Sure thing.", "Okay.", "Working on it."];
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

function showCaption(text: string, paced: boolean) {
  const payload: CaptionPayload = { text, paced };
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
/** The line being spoken is a real answer — the reply sphere may show. */
let replySpeaking = false;
/** Cloud voice problems already shown, so each is captioned only once. */
const cloudProblemsShown = new Set<string>();

async function say(text: string, settings: Settings, mood?: string | null, reply = false, quick = false) {
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
    await speakLine(text, settings, mood, reply);
  } finally {
    if (!quick) void untilQuiet().then(() => releaseMicForVoice());
  }
}

async function speakLine(raw: string, settings: Settings, mood: string | null | undefined, reply: boolean) {
  const caption = settings.show_captions;
  // Said the way a person would say it (no markdown, links, "e.g."…); the
  // Orpheus voice keeps its <laugh>/<sigh> cues, captions never show them.
  const text = speakable(raw, settings.voice_engine === "orpheus");
  const shownText = speakable(raw, false);
  noteSaid(shownText);
  let shown = false;
  const captionOnce = () => {
    if (shown || !caption) return;
    shown = true;
    showCaption(shownText, true);
  };
  replySpeaking = reply;
  stopSpeaking();
  const engine = settings.voice_engine;

  // The most human voices first; each falls back to the next if it can't
  // speak right now (no key, out of credits, offline).
  if (engine === "orpheus" || engine === "openai") {
    const spoke = await speakCloud(engine, text, mood, captionOnce).catch(() => false);
    if (spoke) {
      captionOnce();
      return;
    }
    const why = lastCloudError ?? "it didn't answer";
    if (!cloudProblemsShown.has(why)) {
      cloudProblemsShown.add(why);
      showCaption(`Couldn't use the ${engine === "orpheus" ? "Orpheus" : "ChatGPT"} voice — ${why}. Using the on-device voice.`, false);
    }
  }
  // The natural voice — unless this PC can't make it fast enough right
  // now (a laptop on battery managed one sentence per 20 s): then the
  // instant Windows voice beats a reply that trickles out over a minute.
  // Pre-rendered lines ("Mhm?", "Okay!") are instant either way.
  const tooSlow = naturalVoiceTooSlow() && !lineReady(settings.voice_name, shownText);
  if (engine !== "system" && !tooSlow) {
    // (Only the Orpheus voice performs <laugh> and friends.)
    const began = Date.now();
    const spoke = await speakNatural(shownText, settings.voice_name, captionOnce, mood).catch((e) => {
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
  speak(shownText);
  if (caption) showCaption(shownText, true);
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

/** The "this PC is too slow for the natural voice" tip, once per session. */
let slowTipShown = false;

/** What Izuki says when you just say its name — like Siri's "Mhm?". */
const GREETINGS = ["Mhm?", "Yeah?", "Hey! What's up?", "How can I help?"];
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
 * The always-on "Hey Izuki" engine.
 *
 * Mounted exactly once, at the top of `GlassConfigPanel`, so it keeps
 * listening no matter which tab is open — and keeps running even after the
 * window is hidden to the tray, since hiding never unmounts React. Every
 * other component only ever reads its state back out of the store; nothing
 * else should call `useWakeWord` directly, or Izuki would end up holding two
 * separate microphone sessions at once.
 */
export function VoiceEngine() {
  const enabled = useIzuki((s) => s.settings.voice_wake_enabled);
  const chatMode = useIzuki((s) => s.settings.chat_mode);
  const patchSettings = useIzuki((s) => s.patchSettings);
  const setVoice = useIzuki((s) => s.setVoice);

  // Set once the dictation hook below exists — `dispatch` needs it for the
  // follow-up listen, but has to be declared first.
  const listenAgain = useRef<() => void>(() => {});
  /** Start listening *while* Izuki answers, so you can cut in (see below). */
  const listenThrough = useRef<() => boolean>(() => false);

  // ---- the hands-free conversation and its voice sphere ----------------
  // "Hey Izuki" opens a conversation: the big sphere comes up and stays
  // through listening → thinking → answering → listening for your reply,
  // Jarvis-style, until you stop talking to it.
  const sphere = useRef(false);
  /**
   * "convo": a "Hey Izuki" conversation — stays up and keeps listening
   * until you're done. "ptt": one push-to-talk exchange — up while you
   * talk, while Izuki thinks and while it answers, then it goes.
   */
  const sphereKind = useRef<"convo" | "ptt">("convo");
  /** Same as `sphere`, as state — the wake word pauses during a conversation. */
  const [convo, setConvo] = useState(false);
  /** Silences in a row inside a conversation — a few, and it winds down. */
  const idleListens = useRef(0);
  /** Words caught with the wake word while you were still talking. */
  const pendingPrefix = useRef("");
  /** Waiting on the model — the sphere swirls between Izuki's lines. */
  const thinkingNow = useRef(false);
  const orb = (state: OrbState) => {
    if (!sphere.current) return;
    // The orb's window may have been put away by something else (a task
    // finishing, the draw layer closing) — bring it back first.
    if (state !== "hidden") void api.showCaptionOverlay().catch(() => undefined);
    void emit(EV.orb, state);
  };
  const startSphere = async (state: OrbState, kind: "convo" | "ptt" = "convo") => {
    sphere.current = true;
    sphereKind.current = kind;
    setConvo(kind === "convo");
    idleListens.current = 0;
    await api.showCaptionOverlay().catch(() => undefined);
    void emit(EV.orb, state);
  };
  const endSphere = () => {
    if (!sphere.current) return;
    sphere.current = false;
    setConvo(false);
    pendingPrefix.current = "";
    void emit(EV.orb, "hidden" satisfies OrbState);
  };
  /** Let the last line finish, then put the sphere away. */
  const endSphereWhenQuiet = () => {
    if (!sphere.current) return;
    void untilQuiet().then(() => endSphere());
  };

  const dispatch = useCallback(
    async (text: string) => {
      // Anything you say cuts Izuki off — like talking over someone.
      stopAllSpeech("you started talking", useIzuki.getState().settings.speak_responses);
      idleListens.current = 0;
      const local = matchLocalCommand(text);
      if (local && (await handleMemoryCommand(local))) {
        endSphereWhenQuiet();
        return;
      }
      if (local) {
        // An instant command ends the conversation — "stop" at once, the
        // others once their one-line reply has been said.
        if (local.kind === "stop") endSphere();
        else if (local.kind !== "greeting") endSphereWhenQuiet();
        switch (local.kind) {
          case "endConversation":
            respond(pick(GOODBYES), "cheerful");
            return;
          case "greeting":
            // Stay in the conversation — a hello isn't a goodbye.
            respond(pick(GREETINGS), "cheerful", false, true);
            if (sphere.current) void untilQuiet().then((ok) => ok && listenAgain.current());
            return;
          case "hide":
            respond("Hiding.");
            void hideConfigWindow();
            return;
          case "show":
            respond("I'm here.");
            void api.showConfig();
            return;
          case "stop":
            // Already silenced above; stop anything it's doing, quietly.
            void api.panic();
            return;
          case "mute":
            respond("Going quiet.");
            patchSettings({ voice_wake_enabled: false });
            return;
          case "chat":
            respond("Go ahead, type it.");
            if (!chatMode) patchSettings({ chat_mode: true });
            // Reaches the overlay's own floating toggle too — that's a
            // separate webview and won't see the settings change above
            // until its next reload, but it does see this immediately.
            void emit(EV.openFloatingChat);
            return;
          case "resetChat":
            respond("Chat's back in the corner.");
            void emit(EV.resetFloating);
            return;
        }
      }

      rememberInPassing(text);
      const at = ++requestSeq;
      // In a conversation, keep listening while Izuki thinks and answers —
      // start talking and it stops to hear you, like ChatGPT's voice mode.
      const listeningThrough = listenThrough.current();

      // A conversation, not a walkie-talkie: once Izuki finishes answering,
      // listen for your reply without making you press the key again. If
      // you say nothing, the listen just ends quietly (and the sphere goes
      // away). Outside a sphere conversation, "Hey Izuki" already keeps
      // listening — no second mic.
      const afterReply = async () => {
        // You've already moved on to something newer — that owns the orb.
        if (requestSeq !== at) return;
        // Already listening since the request went off: that listen simply
        // carries on, and now starts waiting for your reply. (Unless it was
        // used up — e.g. you answered Izuki's question out loud.)
        if (listeningThrough && listeningNow.current) return;
        const s = useIzuki.getState().settings;
        const followUp =
          (sphere.current && sphereKind.current === "convo") || (s.speak_responses && !s.voice_wake_enabled);
        if (followUp && (await untilQuiet())) {
          await api.showCaptionOverlay().catch(() => undefined);
          listenAgain.current();
        } else {
          endSphereWhenQuiet();
        }
      };

      // Just talking? The fast lane — no screenshot, the voice starts on
      // the first sentence. It hands over if it needs the screen after all.
      if (!needsScreen(text)) {
        setVoice({ lastHeard: text, busy: true });
        thinkingNow.current = true;
        orb("thinking");
        void emit(EV.thinking, true);
        let lane: LaneResult;
        try {
          lane = await talkFast(text);
        } finally {
          thinkingNow.current = false;
          setVoice({ busy: false });
          void emit(EV.thinking, false);
        }
        if (lane === "done") return void afterReply();
        if (lane === "cancelled") return;
        // "screen" / "failed": the full screen path below.
      }

      remember("user", text);
      setVoice({ lastHeard: text, busy: true });
      thinkingNow.current = true;
      orb("thinking");
      // "On it." only if the answer is slow to come — said every time, it
      // gets in the way (and used to talk over the real answer).
      const ack = setTimeout(() => {
        if (requestSeq === at && !helpPending) respond(pick(ACK));
      }, 1800);
      try {
        // Flush any just-edited setting (a freshly pasted API key, a
        // provider switch) so this doesn't fire against a stale backend copy.
        await useIzuki.getState().flushSettings();
        void emit(EV.thinking, true);
        // The headset's switch back to full-quality sound happens while
        // the brain is thinking, not after.
        if (useIzuki.getState().settings.speak_responses) void holdMicForVoice();
        const plan = await api.submitVoiceCommand(text);
        clearTimeout(ack);
        thinkingNow.current = false;
        void emit(EV.thinking, false);
        if (plan.remember?.length) void emit(EV.memoryChanged);
        const said = sayable(plan.summary, plan.steps.length ? "Done." : "I couldn't find anything to do for that.");
        remember("assistant", said);
        // You cut in while it was working — you've moved on; don't answer
        // over you.
        if (requestSeq !== at) return;
        await respond(said, plan.mood, true);
        await afterReply();
      } catch (e) {
        clearTimeout(ack);
        console.error(e);
        if (requestSeq !== at) return;
        respond(failure(e), "sympathetic");
        endSphereWhenQuiet();
      } finally {
        thinkingNow.current = false;
        setVoice({ busy: false });
        void emit(EV.thinking, false);
      }
    },
    [chatMode, patchSettings, setVoice]
  );

  // Push-to-talk: the global hotkey fires this, no wake word needed — just
  // press it and say what you want, from anywhere. It stops by itself when
  // you pause; pressing the key again means "that's it, go".
  const {
    start: startPushToTalk,
    stop: finishPushToTalk,
    listening: ptTListening,
    transcribing,
    error: pttError,
  } = useDictation(
    (text) => {
      // Answering Izuki's own question ("which account?") out loud — it goes
      // to the task that's waiting, not in as a new request.
      if (helpPending && !isEcho(text)) {
        helpPending = false;
        showTranscript(text, true);
        void api.answerHelp({ marks: [], prompt: text, desktop: { x: 0, y: 0, w: 0, h: 0 }, createdAt: Date.now() });
        orb("thinking");
        return;
      }
      // Izuki's own voice coming back through the mic (speakers → webcam
      // mic): not the user. Keep listening for the real reply.
      if (isEcho(text)) {
        void api.log(`speech: ignored my own voice: "${text.slice(0, 60)}"`);
        showTranscript("", false);
        if (sphere.current && sphereKind.current === "convo") {
          orb("listening");
          listenAgain.current();
        } else endSphere();
        return;
      }
      // "Hey Nova, what's the time?" said while it's already listening: the
      // wake word isn't part of the question. (Just "Hey Nova" on its own
      // is a greeting — Izuki answers and keeps listening, like Siri.)
      text = text.replace(/^\s*(hey|hi|ok|okay)[\s,]+(nova|jarvis|izuki)\b[\s,.!?]*(?=\S)/i, "");
      const prefix = pendingPrefix.current;
      pendingPrefix.current = "";
      const full = prefix ? `${prefix} ${text}` : text;
      showTranscript(full, true);
      void dispatch(full);
    },
    {
      // Your real voice, live, on the ring — from the same mic that's
      // recording, so the two can never fight over it.
      // (While Izuki talks, its voice drives the ring, not the open mic.)
      onLevel: (level) => {
        if (!isSpeaking()) void emit(EV.voiceLevel, level);
      },
      // Start reading the screen the moment you start talking — by the
      // time you've finished, that part's done.
      onSpeech: () => {
        void api.prefetchScreen();
        showTranscript(pendingPrefix.current || "…", false);
      },
      onPartialText: (text) => {
        if (isEcho(text)) return;
        const prefix = pendingPrefix.current;
        showTranscript(prefix ? `${prefix} ${text}` : text, false);
      },
      // Silence inside a conversation: keep listening a little longer (the
      // sphere stays), then wind down — "I'm done" ends it straight away.
      onNothing: () => {
        if (!sphere.current) return;
        // Push-to-talk: nothing more said — the exchange is over.
        if (sphereKind.current === "ptt") {
          endSphere();
          return;
        }
        const prefix = pendingPrefix.current;
        if (prefix) {
          pendingPrefix.current = "";
          void dispatch(prefix);
          return;
        }
        // Like Siri: nothing said for a few seconds and it bows out (with a
        // soft chime). "Hey Nova" brings it straight back.
        idleListens.current++;
        if (idleListens.current < 1) {
          orb("listening");
          listenAgain.current();
        } else {
          chime(false);
          endSphere();
        }
      },
    }
  );
  listenThrough.current = () => {
    const s = useIzuki.getState().settings;
    if (!s.barge_in || !sphere.current || sphereKind.current !== "convo") return false;
    startPushToTalk({
      noSpeechMs: followUpMs(),
      cutIn: {
        busy: () => thinkingNow.current || isSpeaking(),
        onCutIn: () => {
          void api.log("speech: you cut in — Izuki stops and listens");
          stopAllSpeech("you cut in", true);
          thinkingNow.current = false;
          orb("listening");
        },
      },
    });
    return true;
  };
  // Keep the mic open while Izuki talks only when talking over it is on.
  const bargeIn = useIzuki((s) => s.settings.barge_in);
  useEffect(() => setKeepMicWhileTalking(bargeIn), [bargeIn]);

  // In a conversation: about as long as Siri waits for you to start talking.
  listenAgain.current = () => startPushToTalk(sphere.current ? { noSpeechMs: followUpMs() } : undefined);
  const listeningNow = useRef(false);
  listeningNow.current = ptTListening;

  // The mic itself lives here (config panel), but the voice ring the hotkey
  // reveals renders in the overlay window — a different webview, so this is
  // a plain cross-window signal. The hotkey handler already made sure the
  // overlay is visible before this can fire, and the overlay puts itself
  // away again once there's nothing left for it to show.
  const wasListening = useRef(false);
  useEffect(() => {
    // In a hands-free conversation the sphere is the listening indicator,
    // not the hand.
    if (sphere.current) {
      // (A listen that runs through Izuki's answer leaves the orb on
      // "thinking"/"speaking" until it's your turn.)
      if (ptTListening && !thinkingNow.current && !isSpeaking()) orb("listening");
      return;
    }
    if (!wasListening.current && !ptTListening) return; // nothing to report at mount
    wasListening.current = ptTListening;
    const payload: ListeningPayload = {
      active: ptTListening,
      follow: useIzuki.getState().settings.follow_mode_enabled,
    };
    void emit(EV.listening, payload);
  }, [ptTListening]);

  // Between "you stopped talking" and "the model has it": the hand's spinner.
  const wasTranscribing = useRef(false);
  useEffect(() => {
    if (transcribing) orb("thinking");
    if (!wasTranscribing.current && !transcribing) return;
    wasTranscribing.current = transcribing;
    void emit(EV.thinking, transcribing);
  }, [transcribing]);

  // "Hey Izuki": the sphere comes up. Said on its own, Izuki listens for
  // the rest; said with a request ("Hey Izuki, open Spotify"), it goes
  // straight to work. Paused while push-to-talk has the mic, so the same
  // words aren't transcribed twice.
  // During a conversation the conversation does the listening; the wake
  // word only stays on while Izuki talks, so "Hey Izuki, stop" still works.
  const [talkingNow, setTalkingNow] = useState(false);
  // What a wake word does — whichever detector heard it.
  const onWake = (text: string, cutOff: boolean) => {
    stopAllSpeech("you said the wake word");
    void api.prefetchScreen();
    if (cutOff) {
      // "Hey Izuki, open the…" — still talking: keep the start and
      // record the rest.
      pendingPrefix.current = text;
      void startSphere("listening").then(() => listenAgain.current());
    } else if (!text) {
      // Just the wake word: answer like Siri would, then listen.
      const t0 = Date.now();
      const step = (m: string) => void api.log(`wake: ${m} (+${Date.now() - t0}ms)`).catch(() => undefined);
      void startSphere("listening").then(async () => {
        step("sphere up");
        const at = interruptions;
        // Listen right after "Mhm?" — but never wait on it: if the voice is
        // slow or stuck, listening starts anyway (Siri never leaves you
        // hanging on its own reply).
        const said = respond(pick(GREETINGS), "cheerful", false, true).then(() => untilQuiet());
        const ok = await Promise.race([said, new Promise<boolean>((r) => setTimeout(() => r(true), 2500))]);
        step(ok ? "listening" : "greeting cut off");
        if (ok && interruptions === at && sphere.current) listenAgain.current();
      });
    } else {
      void startSphere("thinking").then(() => dispatch(text));
    }
  };

  const wakeActive = enabled && !ptTListening && !transcribing && (!convo || talkingNow);

  // The dedicated wake-word detector (how Siri/Alexa listen): the user's own
  // built in, plus any custom model installed ("Hey Nova", "Hey Izuki").
  const [customWake, setCustomWake] = useState<string[]>([]);
  useEffect(() => {
    const load = () => void api.listWakewords().then(setCustomWake).catch(() => undefined);
    load();
    const off = on<void>(EV.wakewordsChanged, load);
    return () => void off.then((f) => f());
  }, []);
  const wakeWords = useWakeEngine(wakeActive, customWake, () => onWake("", false));

  // The old way — speech-to-text on every sound, then look for the name —
  // is off: it cost a whole CPU core on a slow laptop (plus a 5–8 s Whisper
  // check per unclear sound) and still missed "Hey Nova" through a
  // Bluetooth headset. The dedicated detector above does the job; "Hey
  // Nova"/"Hey Izuki" come with their own model (Wake words → Add it).
  const wake = useWakeWord(false, (text, cutOff) => onWake(text, cutOff));

  useEffect(() => {
    setVoice({ active: wake.active || wakeWords.length > 0, heard: wake.heard, error: wake.error });
  }, [wake.active, wakeWords.length, wake.heard, wake.error, setVoice]);

  // Say why nothing happened — silently vanishing is what made the old
  // push-to-talk feel broken. Caption only: no voice over your next try.
  useEffect(() => {
    if (pttError) showCaption(pttError, false);
  }, [pttError]);

  const pressedAt = useRef(0);
  useEffect(() => {
    // Held down (like HeyClicky): talk while holding, let go to send. A
    // quick tap instead keeps listening until you pause.
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
      // Pressing the key while Izuki is mid-sentence cuts it off — the key
      // means "my turn". The chime only when it wasn't talking: cutting in
      // should feel instant, and the voice ring already shows it.
      const wasTalking = isSpeaking();
      stopAllSpeech("you pressed push-to-talk");
      if (!wasTalking) chime();
      // The liquid sphere for push-to-talk too, Siri-style — unless it's
      // switched off, then the hand's small voice ring as before.
      if (!sphere.current && useIzuki.getState().settings.sphere_on_replies) {
        void startSphere("listening", "ptt").then(() => startPushToTalk());
      } else {
        startPushToTalk();
      }
    });
    return () => void off.then((f) => f());
  }, [startPushToTalk, finishPushToTalk]);

  // Lines the overlay wants said (its floating chat) — this is the one voice.
  useEffect(() => {
    const offs = [
      on<SayPayload | string>(EV.say, (p) =>
        void (typeof p === "string" ? respond(p) : respond(p.text, p.mood, p.reply, p.quick))
      ),
      on<Partial<Settings>>(EV.patchSettings, (patch) => useIzuki.getState().patchSettings(patch)),
      on<{ id: number; text: string }>(EV.runChat, (m) => {
        void sendChatCommand(m.text).finally(() => emit(EV.chatDone, { id: m.id }));
      }),
      on<void>(EV.prepareVoice, () => {
        if (useIzuki.getState().settings.speak_responses) void holdMicForVoice();
      }),
      on<string>(EV.helpAsk, (question) => {
        helpPending = true;
        respond(question, "curious", true, true);
      }),
      on<void>(EV.helpDone, () => {
        helpPending = false;
      }),
      on<void>(EV.stopSpeaking, () => {
        stopAllSpeech("stop was pressed");
        endSphere();
      }),
    ];
    return () => offs.forEach((o) => void o.then((f) => f()));
  }, []);

  // Tell the overlay when Izuki is talking, and how loudly, so the chat can
  // offer a stop button and the voice ring can show it responding.
  useEffect(() => {
    let meter: ReturnType<typeof setInterval> | null = null;
    let replySphere = false;
    const update = () => {
      const talking = naturalSpeaking() || systemIsSpeaking();
      setTalkingNow(talking);
      void emit(EV.speaking, talking);
      if (talking) orb("speaking");
      else if (thinkingNow.current) orb("thinking");
      // Done talking and still listening for you: say so.
      else if (listeningNow.current) orb("listening");
      // Outside a "Hey Izuki" conversation, the sphere can still rise just
      // for the answer — Jarvis-style — and sink again when it's said.
      if (!sphere.current) {
        const want = talking && replySpeaking && useIzuki.getState().settings.sphere_on_replies;
        if (want && !replySphere) {
          replySphere = true;
          void api
            .showCaptionOverlay()
            .catch(() => undefined)
            .then(() => emit(EV.orb, "speaking" satisfies OrbState));
        } else if (!talking && replySphere) {
          replySphere = false;
          void emit(EV.orb, "hidden" satisfies OrbState);
        }
      }
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
    };
  }, []);

  // Fetch the natural voice in the background as soon as it's selected, so
  // the first real reply doesn't wait on the one-time download.
  const voiceEngine = useIzuki((s) => s.settings.voice_engine);
  const settingsLoaded = useIzuki((s) => s.settingsLoaded);
  // The ears load right after (downloads run one at a time anyway), so the
  // first push-to-talk doesn't sit waiting on them either.
  useEffect(() => {
    if (!settingsLoaded) return;
    const voice =
      voiceEngine !== "system"
        ? preloadNaturalVoice(useIzuki.getState().settings.voice_name)
            .then(() => undefined)
            .catch((e) => console.warn("natural voice unavailable:", e))
        : Promise.resolve();
    void voice.finally(() => {
      void preloadSpeechInput()
        .catch(() => undefined)
        // Then the things Izuki says most, rendered ahead so they're instant.
        .finally(() => {
          if (voiceEngine !== "system") {
            void prepareLines([...GREETINGS, ...GOODBYES, ...ACK], useIzuki.getState().settings.voice_name);
          }
        });
    });
  }, [settingsLoaded, voiceEngine]);

  // This component is a pure background engine — no DOM.
  return null;
}

/** Send a typed chat line through the exact same pipeline a spoken one uses. */
export async function sendChatCommand(text: string) {
  const t = text.trim();
  if (!t) return;
  const { setVoice, settingsLoaded } = useIzuki.getState();

  // Typed in the overlay's floating chat: the voice, the mic and the real
  // settings all live in the config panel — hand the message over and wait
  // for it to be handled, so there's exactly one place this logic runs.
  if (!settingsLoaded) {
    const id = Date.now() + Math.random();
    await new Promise<void>((resolve) => {
      const timer = setTimeout(done, 90_000);
      const off = on<{ id: number }>(EV.chatDone, (d) => {
        if (d.id === id) done();
      });
      function done() {
        clearTimeout(timer);
        void off.then((f) => f());
        resolve();
      }
      void off.then(() => emit(EV.runChat, { id, text: t }));
    });
    return;
  }

  const local = matchLocalCommand(t);

  // A new message cuts off whatever Izuki was still saying. The voice lives
  // in the config panel; from the overlay's chat, ask it to stop.
  if (settingsLoaded) stopAllSpeech("you sent a new message", useIzuki.getState().settings.speak_responses);
  else void emit(EV.stopSpeaking);

  if (local && (await handleMemoryCommand(local))) return;
  if (local) {
    switch (local.kind) {
      case "hide":
        respond("Hiding.");
        void hideConfigWindow();
        return;
      case "show":
        respond("I'm here.");
        void api.showConfig();
        return;
      case "stop":
        void api.panic();
        return;
      case "mute":
        respond("Going quiet.");
        patchFromAnywhere({ voice_wake_enabled: false });
        return;
      case "chat":
        return; // already in chat, nothing to do
      case "resetChat":
        respond("Chat's back in the corner.");
        void emit(EV.resetFloating);
        return;
      case "endConversation":
        respond(pick(GOODBYES), "cheerful");
        return;
      case "greeting":
        respond(pick(GREETINGS), "cheerful", false, true);
        return;
    }
  }

  rememberInPassing(t);
  setVoice({ lastHeard: t, busy: true });

  // Just talking? The fast lane (see talkFast).
  if (!needsScreen(t)) {
    void emit(EV.thinking, true);
    let lane: LaneResult;
    try {
      lane = await talkFast(t);
    } finally {
      void emit(EV.thinking, false);
    }
    if (lane === "done" || lane === "cancelled") {
      setVoice({ busy: false });
      return;
    }
  }

  remember("user", t);
  if (useIzuki.getState().settings.speak_responses) void holdMicForVoice();
  try {
    // Same race guard as the spoken path — flush a just-edited setting
    // (API key, provider switch) before it's relied on.
    await useIzuki.getState().flushSettings();
    void emit(EV.thinking, true);
    const plan = await api.submitVoiceCommand(t);
    if (plan.remember?.length) void emit(EV.memoryChanged);
    const said = sayable(plan.summary, plan.steps.length ? "Done." : "Nothing to do there.");
    remember("assistant", said);
    respond(said, plan.mood, true);
  } catch (e) {
    respond(failure(e));
    console.error(e);
  } finally {
    setVoice({ busy: false });
    void emit(EV.thinking, false);
  }
}
