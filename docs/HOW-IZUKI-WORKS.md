# How Izuki works

This is the rulebook. Every way of using Izuki — the wake word, the talk hotkey,
typing, Ctrl+D — follows the same rules below. When something changes, this
page changes first, then the code.

What it aims for: a wake word, then a quick "Mhm?" and natural follow-ups;
talking over it like a real conversation; seeing the screen; a hand that flies
to what it's talking about; and finishing the whole task, reading the page's
structure, not just pixels.

---

## 1. One session

A **session** is the time the orb is on screen. There is only ever **one**.

| You… | A session starts in… |
|---|---|
| Say the wake word ("Hey Nova") | **Voice mode** — Izuki says "Mhm?" and listens |
| Press the talk hotkey | **Voice mode** — listens straight away (no "Mhm?") |
| Type in the chat and press Enter | **Typed mode** |
| Hold Ctrl+D, draw, let go, Enter | **Typed mode** (your mark is part of the request) |

While a session is on, the orb **never disappears**. It shows what Izuki is doing:

- **Listening…** — your turn. Your words appear under the orb as you speak.
- **Thinking…** — working on it. This covers looking at the screen *and* clicking/typing.
  It stays up the whole time the task runs — no gaps between steps. Under the orb, a line
  says what it's doing right now ("Opening Blackboard…") and **"Esc to stop"**.
- **Speaking** — the orb moves with Izuki's voice.

**After Izuki answers:**

- **Voice mode**: it keeps listening for your next thing. No wake word needed.
- **Typed mode**: the orb stays a few seconds, then closes (you're typing, so the mic stays off).
  If a voice session was already running, a typed message just joins it.

## 2. How a session ends

| What you do | What happens |
|---|---|
| Say or type **"bye"**, "that's all", "I'm done", "thanks, that's it"… | Izuki says a short goodbye and the orb closes. The wake word keeps working. |
| Stay silent on **your turn** for the follow-up time (Settings, 5 s – 30 min) | The orb closes with a soft chime. |
| Say or type **"stop"**, "cancel", "never mind" | Everything stops at once (see below) and the orb closes. |
| Press **Esc** while the orb is up — listening, thinking or talking — or while a drawing/replay runs | Same as "stop". (Esc still works normally in your app too — Izuki only watches for it, and only while the orb is up or it's working. Esc from the On-Screen Keyboard counts; Izuki's own Esc presses don't.) |
| Press the **stop hotkey** (Ctrl+Shift+Q) — any time | Same as "stop". |
| Click the orb's **✕** | Same as "stop". |
| Say or type **"quit Izuki"**, "close the app", "exit Izuki" — or tray → Quit, or Settings → Quit | Izuki closes **completely**. (Open it again from the Start menu or desktop.) |

The silence timer **only counts real silence on your turn**. It never runs while
Izuki is thinking, working or talking, and a cough, background noise, or words it
couldn't make out don't count as silence — it just keeps listening.

**"Stop" means stop everything:** the voice, the task in progress (no more clicks,
and its answer is thrown away — it never speaks later), the listening, and any
question Izuki was waiting on.

## 3. One task at a time

- A new request **replaces** the one in progress. The old one stops before its next
  click and never speaks.
- Talking while Izuki works or speaks **cuts in**: it stops and listens. It takes real
  speech to cut in — a noise or Izuki's own voice in the mic doesn't start a new task.
- When Izuki asks you something ("Which account? Circle it for me."), your answer —
  spoken, typed, or circled with Ctrl+D-style ink — goes **to that task**, which carries on.
- "**Keep going**" / "continue" picks up a task that had to stop (busy AI, out of rounds).

## 4. The wake word

- Listens **only when no session is on**. During a session you just talk.
- **One detection = one session.** Saying the wake word during a session doesn't open
  another one — Izuki just answers "Mhm?" and keeps listening.
- After a session ends, the wake word rests for **2 seconds**, so the goodbye (or the
  end of your own sentence) can't set it off again.
- Izuki's own lines never start with "Hey…", so it can't wake itself up through speakers.

## 5. Doing tasks (the agent)

Izuki works like a person at the PC: **look → act → look again**, until it can *see*
the job is done (the music is playing, the page is open).

- Between steps, **Live Eyes** watches the screen move on your PC and looks again the
  moment it settles — no fixed pauses, no looking at half-loaded pages.
- **Finding things:** first what's on screen (tabs, bookmarks, links, icons, the taskbar);
  then **scroll** if it could be further down; if it's not there, **search** — the address
  bar for websites (e.g. "Blackboard" → the right login link), the Start menu for apps —
  and click the right result. It never gives up after one look.
- **Reliable moves first:** keyboard shortcuts, the address bar (Ctrl+L), the Start menu.
- It **says what it's doing** ("Opening Blackboard…") — but only when something new
  happens, never the same line twice.
- It **asks** when it truly can't tell which thing you mean, and **checks with you**
  before anything final (submit, send, buy, delete, post).
- **Working memory:** each look, it keeps short notes — its plan and what it's found
  ("Blackboard is under Bookmarks → School") — and sees them again next look, so it
  doesn't lose track halfway.
- **It knows what's open:** it's told every open window, so it switches to one instead of
  hunting for it.
- **It learns from experience:** when a task works, how it was done is kept on your PC.
  The next similar request starts from what worked last time.
- **"Done" means visibly done:** every part of the request has to show on screen
  (the app is open *and* the text is typed) before it says it's finished.
- Up to 10 rounds per request; "keep going" continues after that.

## 6. The AI brains (and "too many requests")

- **One brain at a time.** A second one is asked only if the first fails, or is slow
  (5 s for tasks on the screen, 2 s for plain chat).
- A brain that says **"too many requests"** is rested: 1 minute for per-minute limits,
  1 hour when its daily free quota is used up. Izuki doesn't keep hammering it.
- If every brain is busy, Izuki says so ("The free AI's busy — give me a second"), retries
  a couple of times, then offers "keep going" later.
- Best free setup: Gemini (fast) + NVIDIA Gemma 4 (backup). Best reliability: add a paid
  Claude key.

## 7. Speed

- The voice learns how fast your PC is. If the on-device natural voice is too slow here,
  Izuki remembers that and uses the quick voice straight away — it never makes you wait
  for it again, and doesn't even load it at startup. Short lines it has already recorded
  ("Mhm?", "Okay!") still play in the natural voice, instantly.
- "Too many requests" from a free AI isn't counted as slowness, so the fastest brain
  stays first in line.

Targets:

| Moment | Target |
|---|---|
| Wake word → "Mhm?" | under 0.5 s |
| You stop talking → your words are understood | under 1 s |
| Plain question → first words of the answer | 1–2 s |
| Each step of a task | 2–5 s with a fast brain |

## 8. Every setting, in plain words

**Talking**
- *Hey Izuki (hands-free)* — listen for your wake word. Needs a wake word added (Wake words).
- *Microphone* — which mic to use. Automatic picks a connected headset first.
- *Interrupt by talking* — talk over Izuki to cut it off. (On Bluetooth headphones, its
  voice sounds like a phone call while this is on.)
- *Turn other sounds down while I listen* — music and videos get quieter while you talk,
  then come back up exactly where they were.
- *Sharper hearing* — also checks your words with a big cloud model (your Gemini or Groq key):
  gets song and artist names right and ignores background music. Never slower than a moment
  past the on-device words; offline it's simply skipped.
- *Keep listening after I stop talking* — how long a voice session waits for you (5 s – 30 min).
- *Show my words as I talk* — your words under the orb, live.
- *Speak responses* / *Captions* — hear Izuki, read Izuki, or both.
- *Voice* — the on-device voice, or a free cloud voice (Groq key) for the most natural sound.

**Looks**
- *Chat & caption colours* — Auto (matches your screen), Dark, Light, Gradient, or any colour.
  Also right in the chat box (🎨).
- *Show the orb for typed replies* — the orb for typed/Ctrl+D requests too.
- *Always show the hand*, hand size, window style.

**Brain** — your AI keys and which one to use first / as backup.

**Shortcuts** — draw, quick draw (Ctrl+D), talk, stop, replay last. All changeable.

**Doing things** — how fast the hand moves, magnetic snapping to buttons, focus vs
background mode, confirm before acting, practice mode (dry run).

---

## 8b. Chat, reminders and your phone

- **Chat tab** — a written chat with the same companion, using the fast chat lane (no
  screenshot, no controls scan — the lightest request Izuki makes). If the reply is `[SCREEN]`,
  the chat offers "Do it on my PC", which runs the normal task loop.
- **Reminders** — no extra AI call: each chat lane is told the time and adds
  `[REMIND YYYY-MM-DD HH:MM | text]` when asked. The core pulls those out (`reminders.rs`)
  before anything is shown or spoken, saves them to `reminders.json`, and when one is due
  says it, shows it, and texts the paired phone.
- **Phone (Telegram)** — `telegram.rs` long-polls the bot from this PC, so nothing is hosted.
  Pairing: the first chat to send the 6-digit code from Settings is the only one ever answered;
  "Unpair" makes a new code. Voice notes are transcribed by the cloud ears (Groq/Gemini).
  `[SCREEN]` replies run the task loop on the PC (if "Let my phone use this PC" is on) and the
  result is texted back; `/screen` sends a screenshot, `/stop` stops, `/reminders` lists them.

- **Apps (Composio)** — `composio.rs`. Every chat lane may answer `[APPS]` for anything in the
  user's accounts (email, calendar, cloud files, Slack, Notion, socials…); the voice lane also
  goes straight there for obvious app words when a key is set, and sends a quick "yes, send it"
  back to the apps lane. The apps loop speaks a four-shape JSON protocol (`search`, `run`,
  `connect`, `reply`) against Composio's Tool Router, so only the tools it searched for ever
  reach the prompt. Unlinked apps return a sign-in link (opened on the PC, texted to the phone).
  Premium (paid) tools are switched off. Nothing is sent, posted or deleted without a yes.

- **Call Izuki** — `call.rs` serves `call.html` on 127.0.0.1 and runs a free Cloudflare quick
  tunnel (`cloudflared.exe`, downloaded once) for an https link with a secret token. The phone's
  own speech recognition and voice are used; replies come from `companion.rs` (shared with
  Telegram). Phones without speech recognition upload a recording to `/hear` (cloud ears).

## 9. Checklist (run through after any change)

1. "Hey Nova" → one orb, one "Mhm?" → ask something → answer → ask again without the wake word.
2. Say "bye" (and "okay bye Nova", and type "bye") → goodbye → orb closes → wake word still works after 2 s.
3. Ask for a multi-step task → orb stays on "Thinking…" the whole time → says what it's doing, no repeats.
4. During that task: press Esc → everything stops, no late answer. Same with Ctrl+Shift+Q and the orb's ✕.
5. Start a task, then ask something else → the first one stops; only the second runs.
6. Ctrl+D → circle → Enter → orb appears on "Thinking…" → answer.
7. Type in the chat → orb appears while it works → answer → orb closes a few seconds later.
8. Voice session, stay quiet → closes only after the follow-up time; coughing doesn't count.
9. "Quit Izuki" → the app closes completely.
10. "Open Blackboard" when it isn't on screen → it searches/scrolls and opens it.
