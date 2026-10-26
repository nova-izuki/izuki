# Izuki 1.0.170: the plan that had no steps, a coding agent that can look things up, and a setup guide that tells you what you're missing

## 📋 "Here's the plan" — and then nothing
**What you saw:** you asked for help with a lab assignment. Izuki said *"Here's the plan."*, said nothing more, and went back to listening.

**What your log said:** `[study] guide ready (0 steps, not saved)`.

**Why:** the AI wrote a perfectly good plan. Izuki could only read steps written exactly as `STEPS:` followed by `1.` — so a plan written as `**Step 1:**`, `Step 1 —`, or plain bullets came back with **zero** steps. With no steps there was nothing to say after "Here's the plan", so it stopped.

**What changed:**
- Steps are read however they're written: `1.`, `1)`, `Step 1:`, `**Step 2 —**`, or bullets.
- **An empty plan is never presented as a plan.** If there are still no steps, you get the guide's own words instead of a stub, with an offer to go deeper — and if the AI's answer really was empty, it says so plainly.

## 🔎 The coding agent can look things up
Izuki's coding agent (Chat → **Code**) works in its own copy of your project, edits files, runs your real tests and fixes what fails. But when a build failed with an error nothing in your project explained, it could only **guess** — and with two fix rounds, two guesses was all it had.

It now has `[LOOK: …]`: it can search the web for the real error text or how a library is meant to be used. Given how tight the free AI allowances are, one lookup is cheaper than three guesses that were never going to work. Results are treated as untrusted notes, never as instructions.

## 🧭 The setup guide knows what's new
It had stopped at the features of several releases ago, so the best things were invisible unless you already knew to look for them. It now also shows, with a tick when they're set up:

- **Let Izuki write code for you** — the coding agent, what it does, and that your files only change when you press Apply.
- **Only answer your voice** — enrol your voice so "Hey Nova" stops answering the TV, a video, or someone walking past.

## 🧹 Space back
819 MB of old build output cleared.

---

## What's still worth knowing
- **Your free AI tiers are the bottleneck, not the code.** Groq allows 7,000 input tokens a minute and one screen look costs about 6,000. Izuki now *learns* each AI's limit from its own refusal, sizes requests to fit and skips a brain that would refuse — so this should settle down on its own. When four of five providers are rate-limited or timing out, nothing makes that fast.
- **Your C: drive is at 12 GB free**, and 13 GB of that is Izuki's own build cache. Worth clearing when no build is running.

**How it was checked:** 453 core tests, the type check of every screen, and new tests for reading steps in every shape a model writes them.
