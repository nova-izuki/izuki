# Izuki 1.0.168: your notes on your phone, and studying a whole subject at once

## 📚 Your notes, on your phone
Your study notes lived only on your PC. Now your phone can read them.

- **Tap "📚 Your notes"** on the phone's home screen (it appears once your PC is linked).
- **Your subjects, then their chapters in order** — Chapter 1 before Chapter 10, with "Ch 1–7" next to each subject so a gap is obvious.
- **Open any note** and read the whole thing, with **Quiz me**, **Explain simply** and **Summarise** right there.
- **"Quiz me on this"** per subject, using every chapter you've kept.
- **Read-only on purpose.** The phone shows and studies your notes; nothing there can change or delete one, so a stray tap can't lose work that lives on your PC.
- It's gentle on mobile data (a trimmed copy, cached for a minute), and if your PC is off or on another network it says so instead of hanging.

## 🎓 Study a whole subject, not one note at a time
Your notes are already filed by subject and chapter, so this costs you nothing extra. On each subject in the Notes tab:

- **Quiz me on [subject]** — questions from every chapter you've kept, mixed up rather than in order, each one saying which chapter it came from.
- **Recap every chapter** — the 2–3 ideas that matter per chapter, and how each connects to the one before.
- **What am I missing?** — the one to use before an exam: chapters much thinner than the rest, ideas mentioned but never explained, terms used without a definition. It won't invent material you don't have; it tells you where your notes are thin.
- Each chapter gets a fair share of the request, so Chapter 1 can't crowd out Chapter 7.

## 🛡️ A test for the bug that shipped doing nothing
1.0.165's scrolling fix shipped as dead code and every test still passed, because a Windows mouse hook can't be driven from a test. There's now a test for the one step that was wrong: opening the hook thread's message queue must hand back its id straight away. If that ever blocks again, the suite fails instead of you finding out.

**How it was checked:** the full core suite (446 tests), the phone suites (39 + 16), the HTML parse check, the type check of every screen, and — for the first time — the Island browser check end to end: detaching mid-answer, docking, follow-ups, history, and transcript scrolling all pass.
