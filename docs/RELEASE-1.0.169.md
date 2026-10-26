# Izuki 1.0.169: it answers you again, and stops throwing away the fast answer

## 🐌 It had your answer in 1.2 seconds and binned it
**What your log showed:** Groq answered a quiz question correctly in **1179 ms**. Izuki discarded it, waited about **30 seconds** on Gemini (failed after 14 s), NVIDIA (failed after 14 s) and OpenRouter (rate-limited) — and then gave you the same answer.

**Why:** because the request mentioned clicking, the race insisted on a reply that *did* something. A correct answer with no click counted as a failure. But on a quiz page every step is stripped anyway, so demanding one was nonsense.

**What changed:** asking for the answer counts as a question, even when you also say "and click next". The fast answer wins.

## 💬 Asking in your own words works
Izuki only recognised a fixed list of sentences — "what is the answer", "which option is correct". Say *"help me ans the quiz and explain"* and it matched nothing, so it fell back to coaching and refused.

Now it understands an answering word (**answer, ans, solve, correct**) together with what it's about (**this, it, the quiz, the question, which option**). The tests use real phrasings instead of tidy invented ones.

## ↩️ "Answer it and click next" works again
Last release broke this: any request mentioning clicking fell back to coaching. That killed the flow of working through a quiz — answer, explain, move on. It's back.

**What has not changed:** Izuki never **selects** an answer or **submits** a test. "Answer this and click next" works. "Answer this and select the right option", or "...and submit the test", goes back to coaching.

## 🏝️ The Island is small again
The resting Island had become a 30px pill. It's back to the thin sliver it always was — "Always show the Island" decides *whether* it sits there, not how big it is. Something that sits over everything all day should be quiet.

## 🎥 Notes from a recorded lecture
Izuki can't watch video, but almost every lecture upload has captions.

- Paste the link with **"take notes on this lecture"**.
- It takes the video's own transcript, keeps the `[mm:ss]` on every line, and writes the same structured notes Lecture Mode produces, **with the full transcript kept underneath** so you can check anything against what was said.
- It prefers the lecturer's own captions over YouTube's automatic ones. **No captions means no notes** — it says so and points you at Lecture Mode, rather than inventing a lecture from the title.

## 📊 "Catch me up on Biology"
Tells you what you have and what's missing: *"Biology: 6 notes from Chapter 1 to Chapter 8. Nothing for Chapter 3, 5 — open each one and say 'take notes on this'."* It counts what's filed, with no AI call, and knows 5.1 and 5.3 are parts of one chapter rather than a missing 5.2.

---

## ⚠️ Known: your free AI tiers are the real bottleneck
Your log, one minute of it: Groq rate-limited (**7000 input tokens a minute; one look asked for 6038**), OpenRouter 429, Gemini a network error after 14 s, NVIDIA a network error after 14 s.

A screen look costs about 6000 tokens, mostly the screenshot — so Groq's free tier allows roughly **one look per minute** before it starts refusing. No code change makes four failing providers fast. Two real fixes, neither done yet:
- send a smaller picture when the page's own text already carries the question;
- set a paid fallback brain in Settings for when the free tiers are busy.

**How it was checked:** the full core suite, the type check of every screen, and tests written from the real phrasings in this session rather than invented ones.
