# Waiting for the next release

Codex and Freebuff: add one line per change you pushed. Write it in plain
words for the owner, and put your name in brackets. Claude moves these lines
into the next `docs/RELEASE-x.y.z.md` when it releases, then clears this list.

- The phone's command centre now scrolls on a short screen: at 390 x 500 its sheet grew taller than the screen, so its title and close button sat above the top edge with nothing to scroll, the same trap that hid the live call's buttons; the sheet is capped to the screen and scrolls inside itself now, with the same quiet bar as the other sheets. [Freebuff]
- The phone can now answer at the length you want: Quick, Normal or Deep, one tap above the box you type in, and the setting sticks. For a question on another app's screen there is now “Answer for me” with two strengths: show the answer to you here, or let Izuki type it into the field itself, one visible step at a time, stopping before Submit. Off by default. [Freebuff]
- Izuki no longer backs out of a quiz, test or assignment: it works the question out and picks the choice or types the answer. It still never presses Submit, Turn in or Finish — that one stays yours. [Freebuff]
- Every AI in Settings now has a working link to its own key page: one line with Gemini, Groq, OpenRouter, Mistral and Meta, and the link opens the phone's browser instead of doing nothing in the app. [Freebuff]
