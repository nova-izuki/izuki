# Izuki 1.0.164: smart notes, a mic that hears you, and HeyClicky-style hold-to-talk

## 📚 Notes that know which chapter you're in
**The problem:** every "take notes" made a brand-new note, even for the same chapter you'd taken notes on yesterday. Notes piled up as copies, and nothing grouped them by class or chapter.

**What changed** (built by Codex, finished and checked by Claude):
- **Izuki works out where you are.** It reads the subject, chapter and topic from the page itself ("Biology 101 – Chapter 5: Cells"). It never guesses a chapter it can't see:
  - "Quiz 5" isn't "Chapter 5";
  - a contents page listing many chapters doesn't get filed under one of them;
  - the same chapter number in another class stays separate.
- **Same chapter, same note.** Notes, explanations, Study log questions and quiz-coach explanations for a chapter or topic are all *added* to that one note, under sections: Notes, Explanations, Questions & practice, Sources. A page you've already captured isn't added twice.
- **Laid out to remember.** New notes come as Big picture, Key ideas, Key terms and Remember, and the Notes tab shows them as real headings, bullet lists and bold terms (no raw "##"). Chips jump to each section.
- **Organized by class.** The Notes tab groups notes by subject, each in chapter order (1, 2, … 10), with the chapter and topic on every note and how many times it's been added to. Subjects fold away.
- **Fix the filing yourself.** Inside a note, "Filed under Biology 101 › Chapter 5", with a "Change" button. Later notes on it go to the same place.
- **Follow-ups go to the right note.** Right after you study a note, "why?", "explain that" or your quiz answers are added to it rather than starting a new one.
- **Safer saving.** A damaged notes file is never wiped. Two answers finishing at once can't overwrite each other. Saves are written whole or not at all.

## 🎙️ "Is my mic even listening?"
**The problem:** your log showed the mic opening, then hearing pure silence for 8 seconds and giving up. Your PC has two real mics, the laptop's built-in array and your Logitech C270 webcam mic. Izuki picked whichever Windows listed first, never checking that it actually hears you. With the lid closed or you facing the webcam, that's the deaf one. (Windows privacy was checked: it allows the mic.)

**What changed:**
- **Several mics and no headset:** Izuki checks each one's level once (no talking needed: a working mic always hears the room's hiss) and uses the one that hears. The check runs when Izuki starts, so your first hold-to-talk doesn't lose its first second of words. Each mic opened for the check is always closed again.
- **A whole listen of pure silence:** that mic is set aside for the session, and the next listen uses another. The log says which.
- **A mic you pick in Settings, or a headset,** still always comes first.

## 🖱️ Hold-to-talk, the HeyClicky way
**What changed:**
- **While you hold the talk key:** a tiny live waveform rides just under your mouse, instead of the orb popping up.
- **When you let go:** it turns into three "thinking" dots. Then the orb or your character comes up to answer, if it's on.
- Hands-free "Hey Nova" conversations still use the orb.

## 💬 The answer bubble you can scroll
**What changed:**
- **Only the bar at the top moves the bubble.** Before, clicking anywhere in a live answer dragged the whole bubble, so you couldn't use its scrollbar or select words. Now the text scrolls (wheel or scrollbar) and can be selected.
- **It stays while your mouse is on it.** It used to vanish 4 seconds after the voice stopped, even while you were reading.
- **A scrollbar you can see.**

**How it was checked:**
- Smart notes' own tests: chapters versus quizzes, other classes, contents pages, invented labels.
- The type check of every screen.
- The mic levels in your log, and Windows' privacy setting, both read on this PC.

**Limits:**
- The waveform, the mic check and the bubble haven't been watched on screen yet.
- The mic check happens once per set of mics; plugging in a new mic re-checks.
