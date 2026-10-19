# Izuki 1.0.146: on a quiz, Izuki coaches, it doesn't give the answer away

**The problem:** since 1.0.136, Izuki doesn't click answers on a quiz or test. But it could still *say* the answer ("Option D is locked in") or underline it with the pen, depending on how the request was worded. Only Quiz coach mode kept answers out.

**What changed:** while a quiz or test is on screen, the same rule applies to everything Izuki says and draws, whatever you asked.
- The AI is told the student answers. It explains what the question asks and the idea behind it, and points at the key words in the question.
- As a safety net, any sentence naming a choice is left out of what it says (the same filter Quiz coach uses). Pen marks on an answer choice are dropped, whether they're aimed at its words or simply placed where the choice is.
- Review notes saved during a quiz go through the same filter, so they explain without listing the answers.
- "Click [a choice]" no longer takes the quick shortcut that skips these checks.
- Quizzes that show their choices as buttons ("A.", "(b)", "True" / "False") are recognised too, not just ones with round option buttons.
- Going to the next question when you ask still works.

**What else it helps:** every way of asking on a quiz page ("what's the answer", "which one is it", "explain this", the Explain-the-screen button), from voice, chat, the Island or a mission.

**How it was checked:** automated tests. On a quiz page, the explanation of the question stays, the sentence giving the answer is removed, a mark on an answer choice is dropped, and a mark on the question's own words stays. Off quiz pages nothing changes. Quiz pages are recognised by answer choices plus words like "quiz", "test", "exam" or "Question 3 of 20".

**Limits:** a page that doesn't look like a quiz (no answer buttons, no quiz wording) isn't treated as one. For learning, study mode, flashcards, "quiz me" on your notes and Review notes all work as before.

## 📱 Missions on your phone match the PC
In the phone app's Touch Grass screen, a finished mission now has the same three buttons as on the PC:
- **↻ Try again**
- **📝 Save to Notes**
- **📅 Every morning**
