/**
 * The conversation so far, and the fast lane for talking (src-tauri chat.rs).
 *
 * Plain conversation skips the screenshot, the screen scan and the
 * structured plan entirely: the reply streams in word by word and the voice
 * starts on the first finished sentence — the way ChatGPT's voice mode and
 * other quick voice assistants feel instant. Requests that need the screen
 * ("open…", "click…", "what's this?") go the full screen path instead; and
 * if the chat model realises it needs the screen after all, it says
 * `[SCREEN]` and the request is handed over.
 */
import { api, EV, on } from "./ipc";

export interface Turn {
  role: "user" | "assistant";
  content: string;
}

const history: Turn[] = [];
let lastAt = 0;
/** After this long without talking, a new conversation starts. */
const FRESH_AFTER_MS = 15 * 60_000;

/** Add a line to the conversation (both lanes do). */
export function remember(role: Turn["role"], content: string) {
  const t = content.trim();
  if (!t) return;
  if (Date.now() - lastAt > FRESH_AFTER_MS) history.length = 0;
  lastAt = Date.now();
  history.push({ role, content: t });
  if (history.length > 16) history.splice(0, history.length - 16);
}

/** The conversation so far (oldest first) — for the apps lane. */
export function recentHistory(): Turn[] {
  return history.slice();
}

/**
 * Whether a request is about the user's accounts — email, calendar, cloud
 * files, chat apps, socials — which the apps lane (Composio) does directly,
 * with no screen at all. Only used when apps are linked.
 */
export function needsApps(text: string): boolean {
  return APPS.test(text);
}

const APPS = new RegExp(
  String.raw`(e-?mails?|inbox|gmail|outlook|mail from|unread|calendar|meetings?|events? (today|tomorrow|this week)|what'?s on my (day|schedule|agenda)|my schedule|agenda|google drive|my drive|dropbox|onedrive|google docs?|google sheets?|slack|discord|notion|trello|asana|todoist|github|linkedin|twitter|tweet|instagram|facebook|reddit|my dms?)`,
  "i"
);

/**
 * Whether a request needs the screen (look at it or do something on it) —
 * decided locally and instantly. When unsure it says no: the chat model
 * can still hand over with `[SCREEN]`.
 */
export function needsScreen(text: string): boolean {
  return SCREEN.test(text);
}

const SCREEN = new RegExp(
  [
    // doing things
    String.raw`\b(open|close|click|double[- ]?click|right[- ]?click|tap|type|press|scroll|go to|navigate|search|google|look up|play|pause|resume|skip|next song|previous song|mute|unmute|volume|send|reply|delete|remove|move|drag|drop|select|highlight|copy|paste|cut|save|download|upload|install|uninstall|launch|start|run|switch to|minimi[sz]e|maximi[sz]e|screenshot|zoom|refresh|reload|log ?in|log ?out|sign ?in|sign ?out|fill|submit|turn (on|off)|enable|disable|bookmark|share|print|rename|create a|make a new|write (this|that|it|an? email|a message|a reply)|find (me|my|a|the)|check (my|the|if)|watch|listen to|put on|buy|order|book (a|me)|fill (in|out)|edit|draw|schedule|set up|sign up|skip the ad|do (it|this|that|my)|keep going|carry on|continue|do the rest|finish (it|the rest))\b`,
    // looking at things
    String.raw`\b(on (my|the) screen|my screen|this (page|window|tab|app|file|folder|email|message|button|picture|image|photo|video|document|site|website|link|error|code)|that (page|window|tab|app|file|email|message|button|error)|what('?s| is) (this|that|on|here)|read (this|that|it|me)|look at|show me|see (this|that|my)|in front of me|right here)\b`,
  ].join("|"),
  "i"
);

// ---------------------------------------------------------------- streaming

/** "end": the model recognised a goodbye ([END]) — close the session after saying it. */
export type LaneResult = "done" | "end" | "screen" | "apps" | "failed" | "cancelled";

/** The model's "this conversation is over" tag — never spoken. */
/** [END], and any [REMIND … | …] (the core sets the reminder; it's never read out). */
const END_TAG = /\s*\[\s*(?:END|REMIND[^\]]*)\]\s*/gi;

let seq = Date.now();
let activeId: number | null = null;

/** Stop the reply being written (a new message, "stop"). */
export function cancelChat() {
  if (activeId !== null) void api.chatCancel(activeId);
  activeId = null;
}

const MOODS = /^\s*\[(cheerful|excited|calm|serious|sympathetic|playful|curious)\]\s*/i;

/**
 * Ask the fast lane. `onChunk` gets speech-ready pieces as soon as they
 * exist: the first sentence on its own (so the voice starts at once), then
 * one or two sentences at a time — whole thoughts get more natural
 * intonation than sentence-by-sentence. `mood` comes from the tag the model
 * opens with. `expressive`: the voice can laugh/sigh (Orpheus).
 */
export function chatLane(
  text: string,
  onChunk: (chunk: string, last: boolean, mood: string | null) => void,
  expressive = false
): Promise<LaneResult> {
  cancelChat();
  const id = ++seq;
  activeId = id;
  remember("user", text);
  let raw = "";
  let body = ""; // the reply minus its mood tag
  let mood: string | null = null;
  let headerDone = false;
  let spokenUpTo = 0;
  let chunks = 0;

  return new Promise<LaneResult>((resolve) => {
    let finished = false;
    const finish = (r: LaneResult) => {
      if (finished) return;
      finished = true;
      void off.then((f) => f());
      if (activeId === id) activeId = null;
      resolve(r);
    };

    const off = on<{ id: number; text: string; done: boolean; error: string | null }>(EV.chatDelta, (d) => {
      if (d.id !== id || finished) return;
      if (activeId !== id) return finish("cancelled");
      raw += d.text;

      // The opening: an optional mood tag, then possibly [SCREEN] (the
      // model handing over). Hold back until it's clear which.
      if (!headerDone) {
        let rest = raw;
        const m = rest.match(MOODS);
        if (m) {
          mood = m[1].toLowerCase();
          rest = rest.slice(m[0].length);
        }
        const head = rest.trimStart();
        if (/^\[?SCREEN\]?/i.test(head)) {
          void api.chatCancel(id);
          history.pop(); // the screen path will record this turn itself
          return finish("screen");
        }
        // Their apps (email, calendar…): the user's turn stays in the
        // history — the apps lane reads it from there.
        if (/^\[APPS\]?/i.test(head)) {
          void api.chatCancel(id);
          return finish("apps");
        }
        const undecided =
          (!m && /^\s*\[?[a-z]*\]?$/i.test(raw) && raw.trim().length < 14) ||
          (head.length > 0 && head.length < 8 && ("[SCREEN]".startsWith(head.toUpperCase()) || "[APPS]".startsWith(head.toUpperCase())));
        if (undecided && !d.done) return;
        headerDone = true;
        body = rest;
      } else {
        body += d.text;
      }

      if (d.done) {
        if (d.error && !body.trim()) return finish("failed");
        const ending = /\[\s*END\s*\]/i.test(body);
        const rest = body.slice(spokenUpTo).replace(END_TAG, " ").trim();
        onChunk(rest, true, mood);
        remember("assistant", body.replace(END_TAG, " ").trim());
        return finish(!body.replace(END_TAG, "").trim() ? "failed" : ending ? "end" : "done");
      }

      // Speak complete sentences as soon as they're there (the [END] tag
      // is never read out).
      const pending = body.slice(spokenUpTo).replace(END_TAG, (m) => " ".repeat(m.length));
      const ends = [...pending.matchAll(/[.!?…](?=\s)/g)].map((x) => (x.index ?? 0) + 1);
      if (!ends.length) return;
      // First chunk: one sentence (speed). Later: two, or one long one.
      const cut = chunks === 0 ? ends[0] : ends.length >= 2 ? ends[1] : ends[0] >= 160 ? ends[0] : 0;
      if (cut && pending.slice(0, cut).trim().length > 1) {
        spokenUpTo += cut;
        chunks++;
        onChunk(pending.slice(0, cut).trim(), false, mood);
      }
    });

    void off.then(() => {
      if (finished) return;
      void api.chatStream(id, history.slice(), expressive).catch(() => finish("failed"));
    });
  });
}
