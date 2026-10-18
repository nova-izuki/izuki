# Izuki 1.0.138: Quiz coach, plus chords, long notes and vocal mixing in FL Studio

## 🎓 Quiz coach: through a quiz together
Say **"coach me through this quiz"** (or "help me with this test") with the quiz in front. Then, for each question:
1. **Izuki explains the question.** It covers what the question is really asking and the idea behind it, in plain words. It doesn't say or hint which answer is right. A check in the code removes any line that gives an answer away.
2. **It waits quietly while you pick.** No hanging up, no jumping into listening. The Island shows "Quiz coach · your turn".
3. **Once you've chosen** (and left it alone for a couple of seconds, in case you change your mind), it presses **Next** for you and explains the next question. When a whole page of questions is on screen, it moves down to the next unanswered one.
4. **It never presses Submit, Finish or End.** When you've answered everything, it tells you to check your answers and submit when you're ready.
5. **After you submit**, say "go over my results" and it goes through what you missed. With the Study log on, every explanation is saved to your notes.

Stop it any time: "stop coaching", Stop, or Esc.

Not tested on a real quiz yet. Your first one is the first test, so tell me how it goes.

## 🖱️ Clicking links on long web pages works again
On your lab guide, Izuki tried four times to open the "DHHS Security Manual" link, and its own pre-click check blocked it every time ("the control is no longer present"). Then it gave up. On a long page, that check gave up looking after a quarter of a second, and a web page that redraws gives the link a new id.

Now Izuki looks a little longer. If the id changed but there's exactly one element with the same name and type, it clicks that one. If there are two or more, it still stops rather than guess.

## ✋ Quizzes go to Quiz coach
- "Help me with this quiz/test" now starts Quiz coach. Teacher mode stays for worksheets and practice questions.
- Saying just "answer" on a quiz, test or graded assignment now gets an explanation of the question, not the answer. On practice questions and puzzles you still get the answer and why.

## 🎹 FL Studio: chords, long notes, vocals
- **"Add chords"** (or "add pads", "a chord progression"):
  - four bars of chords that fit your genre and key, like Am → F → C → G, or sevenths for R&B, lo-fi and amapiano;
  - each chord is voiced close to the last, the way a player's hands would move, with a low root under it, held a whole bar.
- **"Add a melody with long notes":** a slow melody of held notes over those chords.
- FL only lets scripts add Piano roll notes through its own Piano roll scripts. So Izuki writes the notes into a script called "Izuki notes", opens your instrument's Piano roll, and tells you the two clicks: **Tools → Scripting → Izuki notes → Accept.** Ctrl+Z takes them back.
- **"Mix my vocals":**
  - it finds your vocal mixer tracks by name (Vocals, Lead vox, Backing vox, Adlibs…);
  - the lead goes in the middle at full level, backing vocals a little lower and spread left and right, adlibs softer and wider;
  - it reads each track's effects and tells you what's missing, in order: an EQ with a low cut, a compressor at about 3:1, a de-esser, and reverb and delay on a send.

  FL doesn't let scripts add plugins, so those are yours to add. Ask again afterwards and it checks the chain.
- The first time, FL Studio needs one restart to load Izuki's updated link (Izuki tells you).
