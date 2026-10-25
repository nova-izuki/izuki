# Izuki 1.0.166: the scrolling actually works this time, your Island pulls off the top, and Settings you can search

A deep multi-agent review of 1.0.165 found fifteen problems, including one bad one: **the scrolling fix in 1.0.165 never ran at all.** This release fixes that and the rest, and adds what you asked for on the Island and Settings.

## 🖱️ The scrolling fix that was switched off
**What went wrong:** 1.0.165 said the answer bubble scrolls. It didn't. The part that watches the wheel waited for a message before telling the rest of Izuki where to send that message — so it waited forever, the watcher was never switched on, and the wheel went to the window behind exactly as before. It was dead code that passed every test, because no test could reach it.

**What changed:**
- **It actually runs now.** The watcher announces itself first, then waits.
- **Nothing is lost at startup** — if you're already hovering something scrollable while Izuki is still starting, it picks that up instead of missing it.
- Still only takes the wheel where something really scrolls, and still never takes the keyboard off what you're typing in.

## 🏝️ Pull the Island off the top
**What you asked for:** keep it small, hide it at the top like an iPhone, and let you drag it out to anywhere once it's open.

**What changed:**
- **Reach the top edge of your screen and it comes down** — the same small pill, nothing bigger.
- **Drag it down off the edge and it's yours** — it leaves the top for good and stays exactly where you drop it, and it remembers that next time.
- **New looks, all pickable in Settings → Talk to Izuki → Island look:**
  - **Windows bar** — flat, squared, your system's colours, with the top corners squared off when it's sitting on the edge, so it reads as part of Windows rather than something floating on top.
  - **Tiny dot** — out of the way until something happens.
  - **Wide strip** — a thin strip across the top.
  - Plus the ones already there: Nova, Default, Glass, Bubble, Squircle, Neon outline, Aero.
- **The open panel can't run off the screen any more.** With "Move it anywhere" on and the Island dragged low, the reminder rows and their Cancel buttons used to render below the bottom edge where you couldn't reach them.

## 🔍 Settings you can search
- **A search box at the top of Settings.** Type "mic", "island", "voice" and only the parts that mention it stay on screen. It reads the settings' own words, so anything added later is findable straight away — nothing can go missing from a hand-written index.
- **Sections fold away** and remember what you folded.

## 📱 A phone bug that deleted your reminders
**What went wrong:** on your phone, "cancel check" deleted "Check in with Solomon" — half a name was enough. The PC refuses that and has tests for it; the phone's copy of the rule was missing the guard, while its comment claimed the rules were the same.

**What changed:** the phone now follows the same rule — without the word "reminder" or "alarm" you have to name the whole thing. Nothing is deleted on a guess.

## ✅ Answers and pages
- **Asking for an answer stopped breaking ordinary pages.** The direct-answer mode was throwing away the scroll that reaches a question and the "I can't read the choices" message — on *every* page, not just a test. It now only applies on an actual quiz or test page.
- **Pages that aren't UTF-8 are readable again.** Older .edu and .gov pages came back as rows of question marks; their declared character set is honoured now.
- **Raw `[READ: ...]` tags stopped appearing as answers.** When a weaker AI wrote "Let me check that page for you" before its tag, Izuki showed you the tag and read nothing — then answered from a page it had never opened.
- **One unavailable tool no longer throws the whole answer away** — Izuki says so and finishes answering.

## ⚡ Quieter in the background
- **The wake word stopped copying microphone audio for nothing.** With the enrolled-voice filter off (the default), it was still copying four seconds of audio on every frame, the whole time hands-free was on.
- **Moving the mouse costs less.** The hit test was forcing a layout on every cursor update, including during a drag where there's nothing to work out.

## 📏 The rule book matches the app
`AGENTS.md` still told every agent working on Izuki "never write graded answers", which contradicted the change you asked for. It now says the real rule: **never click, type or submit an answer** into a quiz, test or graded form, and never write the essay you hand in — but Izuki may *say* a factual answer when you explicitly ask, and then explain it. A request that also asks Izuki to *do* something goes back to coaching.

**How it was checked:** the full core suite (443 tests), the type check of every screen, the voice-match tests, the conversation and phone suites, and a fresh review pass.
