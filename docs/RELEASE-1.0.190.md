# Izuki 1.0.190: remember the prompt, keep the whole title

Freebuff's recent changes are included in this update, with fixes for the edge cases found while checking them.

- **Recall a prompt.** The floating chat's clock opens your last eight prompts. Pick one to put it back in the box, X forgets it, and Clear all empties the shelf. Main-chat prompts appear there too. Code spacing and line breaks are preserved, and changes reach the other window. The shelf fits near either screen edge and closes with Escape.
- **Rename a note for real.** In the note's question box, ask “rename this note to Lab 9.3.1”. The app changes the title itself. “Intro to Biology” stays whole, and a request about renaming a file, chapter or heading does not rename the entire note.
- **Fold flashcards away.** X closes them without deleting anything; Practice cards brings them back.
- **Copy your messages.** Hover a message you sent to find its Copy button.
- **Recover from a large paste.** A size refusal gets one retry with a clearly marked excerpt. The beginning and end survive, including the question after the document. Text sent with a picture is shortened too, without separating the picture from its question.
- **Keep answering when app discovery fails.** A bounded search description replaces sending the whole paste as an app-search request. If apps cannot be checked, Izuki can still explain the conversation you supplied. The fallback uses readable prose, and never executes a proposed tool.
- **Attach a correction while it works.** The file button stays available during an answer. Press Enter with a correction to stop the old answer and send the new message with its file.

## In the browser panel

- **It searches the web too.** "Search the web too" is on by default: current facts, prices, releases and anything that isn't on the page are looked up and answered with their sources. A connected ChatGPT, Gemini or Claude tab is asked to search as well. Turn it off and it really stays off.
- **Explain each question.** Open a multiple-choice quiz or practice set and start it: for each question, your connected assistant's suggested answer and the reason appear in the panel. You choose your answer and move on, and the next question is explained when it shows up — including on quizzes where every question is its own page. Izuki never clicks an answer in, never moves the quiz along and never submits — the choosing stays yours.
- **A lab workspace.** Izuki turns a lab's instructions into steps you review, then carries out the ones on your PC — opening the project, the document, the tools — checking each before the next. It stops before the upload or submit step every time: you check the work and hand it in yourself.
- **The answer card stays out of the way.** It moves off a button Izuki is about to press, can be dragged, and lets clicks through the space around it.

## In the character chat

- **"Help me do this quiz" and "finish the assignment" do something.** They used to fall through to ordinary chat and nothing happened. They now start the quiz coach or the assignment guide — which explain, point and check your work, and leave the answers and the hand-in to you.

The four Windows layouts, folding sections, document attachments and guided browser-extension setup from 1.0.189 are included. A browser store listing is still needed for installation through its store; the setup button prepares the correct folder and opens the browser's confirmation page.

Validation details and limits are recorded in `VALIDATION-2026-10-31.md`.
