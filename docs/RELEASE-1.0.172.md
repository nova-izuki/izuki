# Izuki 1.0.172: a plain welcome, and the background stops taking your turn

A sweep through everything, with a public release in mind: what does a stranger see when something goes wrong, and what is Izuki doing when nobody asked it to?

## 👋 The first thing a new user could hit
Install Izuki, ask it something before adding a key, and it said:

> *no brain is configured*

That's what a developer calls it. Now:

> *"I haven't got an AI to think with yet. Add a free key in Settings → Izuki's brain — Google's Gemini takes about a minute and costs nothing."*

## 🗂️ Routines could act on the wrong one
**What was wrong:** say *"delete my gym routine"* when you have no gym routine, and Izuki deleted **a different routine** — whichever was most recent. It never crashed and never said anything; it just quietly did the wrong thing. The same applied to pausing, resuming, retiming and running one now, but delete is the one that loses work.

**What changed:** if you name a routine and nothing matches, Izuki says so and lists what you actually have — *"I couldn't find a routine like 'gym'. You have: water the plants; back up my photos."* Saying nothing at all ("pause my routine") still picks the most recent, which is the fair guess.

Timers and reminders were checked for the same thing and were already correct.

## 🔋 The background stops taking your turn
Free AI keys allow roughly **one request a minute**. Every request Izuki spends on its own is one you don't get for something you actually asked — and you'd never know, because it just feels slow.

- **The desktop character's jokes** cost exactly as much as a real question. It now never asks the AI for one while Izuki is working on something you asked for; it uses its own stock line instead, which nobody can tell apart.
- **Checking your email** (fixed last release) only asks an AI when something might genuinely matter.

Everything else that runs on its own was checked and is already well behaved: the watchers make no AI calls at all, the inbox digest only runs when you ask for it, and the character already limited itself to about one line every three minutes.

## 🔒 Checked and clean
Things worth testing before strangers install it, which turned out to be sound — so they're now pinned down by tests rather than assumed:

- **Phone and TV pairing.** Only "who's there", the link request itself, and short-lived audio are reachable without a pass. Everything else needs the 256-bit pass you granted with a 4-digit code on screen. Audio links are random and expire after three minutes, so nobody else on your Wi-Fi can fetch what Izuki said.
- **Bug reports.** Tested against real lines from a log: account ids for Composio and Groq are replaced before anything is sent, while ordinary lines like `Groq (qwen/qwen3.8-27b) answered in 1179 ms` stay readable.

**How it was checked:** the full core suite, the type check of every screen, and every other suite — conversation, voice, voice notes, speaker matching, air control, companion/phone, and the HTML checks.
