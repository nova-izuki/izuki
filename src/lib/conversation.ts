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
import { api, EV, emit, on } from "./ipc";

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
  publish();
}

/**
 * Send the next-step chips to the windows that can't work them out for
 * themselves. The floating chat and the phone run in their own webviews and
 * keep no copy of this conversation, so it's told what to offer.
 */
function publish() {
  try {
    void emit(EV.suggestions, suggestions());
  } catch {
    // A window that isn't there yet isn't a reason to drop the turn.
  }
}

/** The conversation so far (oldest first) — for the apps lane. */
export function recentHistory(): Turn[] {
  return history.slice();
}

/** Keep only the tail, so a long transcript can't flood the window. */
const MAX_TURNS = 16;

/**
 * Another lane — the Chat tab — is holding the conversation. Take its recent
 * turns as ours, so a short reply typed at the orb ("continue", "yes, the
 * second one") carries on the same thread instead of opening a fresh one.
 *
 * Merged rather than replaced: the Chat tab renders one saved transcript while
 * the orb hears another, and a reply spoken at one of them must never drop what
 * the other just said. Duplicates are skipped, newest wins the order.
 */
export function shareHistory(turns: Turn[]): void {
  const incoming = turns
    .slice(-MAX_TURNS)
    .map((t) => ({ role: t.role, content: (t.content ?? "").trim() }))
    .filter((t) => t.content && (t.role === "user" || t.role === "assistant"));
  if (!incoming.length) return;
  const seen = new Set(history.map((t) => `${t.role}\u0000${t.content}`));
  for (const t of incoming) {
    const key = `${t.role}\u0000${t.content}`;
    if (seen.has(key)) continue;
    seen.add(key);
    history.push(t);
  }
  // Shared, so it counts as just now — otherwise the 15-minute reset would wipe
  // a thread the user is still typing into.
  lastAt = Date.now();
  if (history.length > MAX_TURNS) history.splice(0, history.length - MAX_TURNS);
  publish();
}

/**
 * What they might want to say next, as one-tap chips — so the reply that
 * carries on the conversation is a tap rather than something to type. This is
 * read off the thread itself rather than asked of the model on purpose: the
 * chips have to be there the instant the reply lands, on every lane (voice,
 * typed, the phone), without spending a token or risking a tag flashing up
 * halfway through an answer.
 *
 * At most four, in the order they'd most likely be wanted. "Keep going" and
 * "Start over" are never squeezed out by a contextual chip: carrying on is the
 * point, and being able to leave a thread that went the wrong way matters more
 * than any suggestion.
 */
export function suggestions(): string[] {
  const said = history[history.length - 1];
  if (!said || said.role !== "assistant") return [];
  const reply = said.content.trim();
  if (!reply) return [];
  const out: string[] = [];
  const add = (s: string) => {
    if (out.length < 4 && !out.includes(s)) out.push(s);
  };

  // It asked something, or offered to do something: yes is the obvious next word.
  if (/\?\s*$/.test(reply) || /\b(want me to|shall i|should i|would you like|do you want me to|ready to)\b/i.test(reply)) {
    add("Yes, do that");
  }
  // Something was done on their PC — checking it is what comes next.
  if (/\b(done|opened|closed|finished|saved|created|sent|typed|clicked|searched)\b/i.test(reply)) {
    add("Check that");
  }
  // A long one gets shortened instead of just continued.
  if (reply.length > 140) add("Say that shorter");
  // Whatever it just said, the commonest next word is asking for more of it.
  add("Tell me more");
  // Keep going is what the keep-going lane already understands; start over is
  // the way out of a thread that went the wrong way.
  add("Keep going");
  add("Start over");
  return out;
}

/**
 * Whether a request is about the user's accounts — email, calendar, cloud
 * files, chat apps, socials — which the apps lane (Composio) does directly,
 * with no screen at all. Only used when apps are linked.
 */
export function needsApps(text: string): boolean {
  return APPS.test(text) && !/\b(help me (write|draft|compose)|remind me|set (a |an )?reminder)\b/i.test(text);
}

const APPS = new RegExp(
  String.raw`\b(e-?mails?|inbox|gmail|outlook|mail from|unread|calendar|meetings?|events? (today|tomorrow|this week)|what'?s on my (day|schedule|agenda)|my schedule|agenda|google drive|my drive|dropbox|onedrive|google docs?|google sheets?|slack|discord|notion|trello|asana|todoist|github|linkedin|twitter|tweet|instagram|facebook|reddit|my dms?)\b`,
  "i"
);

/**
 * Whether a request needs the screen (look at it or do something on it) —
 * decided locally and instantly. When unsure it says no: the chat model
 * can still hand over with `[SCREEN]`.
 */
export function needsScreen(text: string): boolean {
  // The user's say wins: "while I watch" / "on my screen" → the screen;
  // "in the background" / "don't open anything" → behind the scenes.
  if (wantsToWatch(text)) return true;
  if (wantsBackground(text) || answersInBackground(text)) return false;
  return (SCREEN.test(text) && !/\b(remind me|set (a |an )?reminder)\b/i.test(text)) || looksLikeDirections(text);
}

/**
 * A question about this PC that Izuki can work out behind the scenes and just
 * say — "how many GB is Zoom", "check for apps I don't use and tell me",
 * "how much space is left" — with no windows opened. Asking to SEE it ("show
 * me", "open it", "on my screen") still goes to the screen.
 */
/** "Check my files in the background", "quietly", "without opening anything". */
export function wantsBackground(text: string): boolean {
  return /\b(in the background|in (the )?backend|behind the scenes|without opening|don'?t open (it|anything|them)|no need to open|quietly|silently|off ?screen)\b/i.test(text);
}

/** "Do it on my screen", "while I watch", "show me as you do it". */
export function wantsToWatch(text: string): boolean {
  return /\b(while i watch|so i can (see|watch)|let me (see|watch)|on (my|the) screen|in front of me|show me (how|as|while)|in (the )?frontend|where i can see)\b/i.test(text);
}

export function answersInBackground(text: string): boolean {
  const s = text.toLowerCase();
  if (/\b(show me|open (it|them|that|settings|the)|on (my|the) screen|so i can see|let me see|click)\b/.test(s)) return false;
  const pcFact =
    /\b(how (many|much) (gb|mb|tb|gigs?|space|storage|ram|memory)|how big|size of|(disk|storage|drive) space|space (left|free)|free space|unwanted|unused|don'?t use|bloat ?ware|junk|biggest (files?|apps?|folders?)|large files|installed apps|what apps|which apps|apps (do )?i have|what'?s (using|eating|slowing)|slowing (down )?my (pc|computer|laptop)|battery (health|life|level)|my ip|ip address|wifi (name|speed)|what'?s running|how long (has )?my pc|uptime|windows version|specs|cpu|graphics card|gpu)\b/;
  const tellOnly = /\b(tell me|let me know|how many|how much|what|which|is there|are there|do i have|check)\b/;
  return pcFact.test(s) && tellOnly.test(s);
}

/**
 * Steps pasted from somewhere else — another AI's answer, a tutorial, a
 * teacher's instructions: "1. Open Settings 2. Click Privacy…". Two or more
 * numbered or bulleted lines that tell someone to do things on a computer.
 */
export function looksLikeDirections(text: string): boolean {
  const lines = text
    .split(/\n|(?=\s\d+[.)]\s)/)
    .map((l) => l.trim())
    .filter(Boolean);
  const steps = lines.filter((l) => /^(\d+[.)]|step\s*\d+[:.)]?|[-•*]\s)/i.test(l));
  return steps.length >= 2 && steps.filter((l) => DOING.test(l)).length >= 2;
}

const DOING =
  /\b(click|open|go to|select|choose|type|press|tap|navigate|enter|enable|disable|toggle|scroll|find|search|right[- ]click|drag|copy|paste|install|download|upload|sign in|log in|settings|menu|tab|button|save|create|add|run|launch)\b/i;

/**
 * What the screen agent is asked for pasted directions: do them, in order,
 * on the real screen — adapting, not blindly.
 */
export function directionsTask(text: string): string {
  return (
    "Do these steps for me on my screen, in order, checking each one worked before the next. " +
    "Someone else wrote them (another AI or a guide), so they may not match my screen exactly: " +
    "adapt to what's really there (names and menus move between versions), skip any that are already done, " +
    "keep track of which step you're on in your notes, and tell me plainly if one can't be done. " +
    "Stop right before anything final (submit, pay, send, delete) and ask me.\n\n" +
    text.trim()
  );
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
const END_TAG = /\s*\[\s*(?:END|REMIND[^\]]*|ALARM[^\]]*)\]\s*/gi;

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

    let filler = false;
    const off = on<{ id: number; text: string; done: boolean; error: string | null; status?: string }>(EV.chatDelta, (d) => {
      if (d.id !== id || finished) return;
      if (activeId !== id) return finish("cancelled");
      // It's looking something up (the web, the Izuki browser): say so once,
      // so the silence doesn't feel like it froze.
      if (d.status) {
        if (!filler && !raw) {
          filler = true;
          onChunk(d.status.includes("browser") ? "One sec, let me open that." : "One sec, let me check.", false, mood);
        }
        return;
      }
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
