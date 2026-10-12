# Izuki 1.0.85: Deep thinking, Nia, faces that blink, and a tighter PC

## Deep thinking in the Island
Next to the **+** in the Island's Ask there's now a 🧠 **Deep** switch, for hard questions. With it on:
- the AI actually thinks before answering (Gemini, and reasoning models through OpenRouter);
- it has room for a full answer;
- Izuki waits for the careful answer instead of taking the fastest one.

You get the answer first, then the reasoning that matters, and anything worth double-checking. While it works, the Island shows "Thinking it through…". The switch is remembered.

## 3D faces blink, and their lips stay on the line
- **Blinking:** the built-in 3D faces (the two holograms, the Woman and the Man) never blinked, because they're sculpts with no eyelids to move. Now a lid in their own skin tone sweeps down with lashes along its edge.
- **The mouth:** it was placed by a guess from the head's height, which put it on the lower lip of some faces, so the lips moved "off the line". Each face now has its real lip line measured.
- **Speech:** the lips now follow the words being said, not just how loud the voice is, so they keep moving when the voice is quiet.

## Nia, in Concept
Nia joins Dre in the Concept style, with her big afro puff, a cream bomber with a cobalt stripe, and chunky sneakers. She talks with a painted mouth and blinks. Pick Nia, then Settings → Voice orb → Character style → Concept (beta).

## Turn off background services you don't use
Settings → PC Care → **Background services → Find unneeded ones**. This is the Windows version of a classic hardening step: every service running in the background that you don't use is one more way in.
- Izuki only ever touches a short, known list, such as Remote Registry, telemetry, offline maps, Fax and Telnet. It never guesses.
- It only offers the Print Spooler when no printer is set up, and leaves the Xbox services unticked unless you choose them.
- Each one starts only when something needs it. The ones that just open a door are switched off.
- Windows asks permission once, and **Undo** puts everything back the way it was.

You can also just say "turn off services I don't use".

## Fixes
- **Izuki repeating itself.** After doing something on screen, the last thing it said often just restated what it had said a moment before ("Playing some chill music now…" then "Chill music's rolling on YouTube"). When that happens it now just says "Done." Anything new, like an answer, a total or a name, is still said.
- **Safer admin steps.** Deeper clean and Background services now write their admin script to a fresh, private file, and check it right before Windows runs it. Before, it was a fixed name in the shared temp folder.

## Reviewed
CodeRabbit reviewed it: 8 findings, all handled. One was adjusted: a repeat is now "mostly the same words", not just "two shared words".
