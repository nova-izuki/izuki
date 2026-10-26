# Izuki 1.0.171: write down a Zoom call, revision that comes to you, and a quieter background

## 🎙️ Write down a Zoom call, a class, any video
Lecture Mode records the **microphone**, which is right for a lecture you're sitting in — and useless for a call you're wearing headphones in, where the mic hears you and not them.

Say **"write down this Zoom call"** (or class, meeting, webinar, video) and Izuki records **what your PC plays** instead:
- It takes the speakers' own sound in two-minute pieces, writing each one down while the next records.
- Say **"stop recording"** and it becomes the same structured study notes as a lecture — topics, definitions, examples, what was stressed — with every point timestamped and **the whole transcript kept underneath**, so anything can be checked against what was actually said.
- **You don't have to follow it.** That's the point.
- **No audio is ever saved.** Each piece is written down and the sound dropped; only words are kept.
- **Silence is skipped**, so a muted call or a paused video doesn't waste your AI allowance or invite invented words.
- If it heard nothing at all, it says so rather than leaving you an empty note.

It records what your computer plays, which can include other people's voices. Whether you may record a call is yours to judge — Izuki starts only when you say so.

## 📅 Revision that comes to you
Izuki now knows **when** a flashcard has gone cold, not just which ones you got wrong:
- Miss a card and it's back **tomorrow**. Get it right and the gap grows — 2 days, 4, 8, 16, then monthly. Miss one you'd known for weeks and it resets.
- Ask **"what should I revise today?"** for what's ready, from which subjects, and how many are overdue.
- **Once a day in the early evening**, if five or more have gone cold, Izuki brings it up itself — because remembering to ask is exactly what someone with an exam coming doesn't do.

Nothing to set up: it's worked out from marks already in your study diary, so every flashcard you've ever answered already counts. A card marked today never comes back the same day, so one sitting can't loop on itself.

## 🔋 The background stopped eating your AI allowance
Every few minutes, Izuki asked an AI *"are any of these new emails important?"*. On a free tier that allows roughly **one request a minute**, each of those was a request you didn't get for something you actually asked — and the answer was nearly always "none of them", which a plain word check already knew.

Now the AI is only asked when something at least *looks* important. Everything else is settled for free.

## 💬 When the AI is busy, it says so like a person would
**What you used to see** when every brain was rate-limited — all of them, joined together:

> *groq is rate-limiting you (429 Too Many Requests): Rate limit reached for model `qwen/qwen3.8-27b` in organization `org_01m3…` service tier `on_demand` on input tokens per minute (ITPM): Limit 7000, Used 1291, Requested 6038. Please try again in 2.82s…*

Unreadable, nothing you can act on, and it printed an account id that's nobody's business.

**What you see now** — one sentence, and a different one depending on what's actually wrong, because "wait a moment" is useless advice when you're out of credit:

- **Busy** — "All your AI brains are busy right now — free ones only allow so much a minute. Give it a moment and ask again, or add another free key in Settings → Izuki's brain so there's one to spare."
- **Out of credit** — "That AI has no free credit left. Add another free key…"
- **Key not accepted** — "That AI didn't accept the key. Check it in Settings…"
- **No internet** — "I couldn't reach the AI just now — that's usually the internet."

This runs on every path that talks to you: the screen agent, chat, the page reader and the browser extension. Izuki's own clear messages ("that's a PDF — open it on screen and I'll read it there") are left exactly as they were. The full technical reasons still go to the log, where they're useful.

## 🏝️ The Island closes when you move away again
**What went wrong:** the Island only closed when the pointer went from *on it* to *off it*. Opened any other way — a click, a peek at the top edge, something opening it in code — that flag was already false, so moving your mouse away hit an early return and **no close was ever scheduled**. It sat there until something else closed it.

**What changed:** leaving now always closes it, however it was opened.

**How it was checked:** the full core tests, the type check of every screen, and new tests for the review schedule (a missed card returns tomorrow, a card known four times waits sixteen days, one practised today never returns the same day, the most overdue goes first) and for the recorder (what it accepts as a call, and that silence is never sent to be written down).
