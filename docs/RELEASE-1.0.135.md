# Izuki 1.0.135: answers that don't break off, plus Campus part two — textbooks, Blackboard grades, your study week

## 🗣️ Answers no longer break off mid-sentence
Izuki's log showed it: during a task, each new "what I'm doing" line cut off the one still being spoken, and long answers lost their ends the same way. Now lines **take turns**:
- each one waits for the one before to finish;
- only you cut Izuki off: a new request, Esc, or talking over it;
- if a newer "what I'm doing" line comes before an older one starts, only the newer one is said, so Izuki never lags behind the task.

Two more things made answers confusing:
- **"I already broke that one down for you."** After explaining something mid-task, the final answer sometimes said it had already explained it. That remark is now taken out; the answer itself stays.
- **The voice changed mid-answer.** When the Groq voice runs out of its daily allowance, Izuki now rests it for six hours, not one. The voice that stood in keeps speaking the whole time, so it no longer fails again every hour mid-reply and switches voices.

## 📘 Textbooks, with page numbers
Notes → Campus → Textbooks → **Add a PDF**. Izuki reads every page once, on this PC. It uses the page's text, or Windows' own OCR for scanned pages, plus the book's chapter list. Then ask:
- "Explain chapter 4 of my biology book"
- "What does page 87 say?" or "explain pages 40 to 52"
- "Quiz me on section 2.3" (the answers come last, so you can try first)
- "Where does my textbook talk about mitosis?" (the pages, with a line from each)

Answers come only from your book's pages and cite them as (p. 87). If the book doesn't cover something, Izuki says so. It explains and quizzes; it doesn't write graded work.

## 🎓 Blackboard: grades, announcements, course materials
Ask "what are my grades?", "my grade in biology", "any new announcements on Blackboard?" or "course materials for chem". There are also buttons in Notes → Campus → Blackboard.
- Read through the **Izuki browser extension**, signed in as you. No password is ever typed or seen.
- Read only: Izuki asks Blackboard's own read-only API for what you could see yourself. Nothing is submitted or changed.
- Each answer names any course it couldn't read.
- **Update the browser extension** (Settings → Browser extension → Download, then reload it) to get this.
- Rubrics: open the assignment and ask "explain this rubric".
- **Not tested on a real Blackboard account yet.** Your first try is the first test, so tell me what it says.

## 📈 Your study week, and the mistakes you keep making
- Flashcards now have **✓ Got it / ✗ Missed it** after you flip one.
- Notes → Campus → **Your study this week** shows:
  - questions asked (with the Study log on);
  - flashcards and how many you got right;
  - notes, lectures and textbook explanations;
  - a bar for each day;
  - what you studied most.
- **Cards you've missed twice** (until you get them right twice in a row) are listed, with **Practise them**.
- Or ask "what have I studied this week?", "what do I keep getting wrong?" or "quiz me on my mistakes".

## 🎙️ Record a lecture on your phone
The phone app has a new **Lecture** button. Confirm you're allowed to record, then start. The phone records, and your PC writes it down as it goes; the PC's Island shows it's recording. When you stop, the notes are saved in Izuki → Notes on the PC. Audio goes in 45-second pieces, so a dropped connection loses at most one piece, and you're told.

## ✍️ Your writing style
Apps → Your writing style. Pick from Casual, Professional, Short & direct, Warm, No emojis, or describe it in your own words ("sign off 'Cheers, Sam'"). Emails, messages and posts Izuki drafts for you then sound like you. Its own chat replies stay its own.

## 🏝️ Your character can react on the Island (off unless you switch it on)
If your companion is a character and you switch on Draw → Hands-free → "Character reacts on the Island", it pops up beside the Island for a few seconds when there's news:
- it points at something waiting for your OK, a website that's down, an error, or a reminder that's due now;
- it cheers when a task or your missions finish.

It doesn't appear while it's already on screen talking to you, during quiet hours, or over a full-screen film or game.
