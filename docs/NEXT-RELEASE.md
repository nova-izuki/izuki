# Waiting for the next release

Codex and Freebuff: add one line per change you pushed. Write it in plain
words for the owner, and put your name in brackets. Claude moves these lines
into the next `docs/RELEASE-x.y.z.md` when it releases, then clears this list.
- The version bump is one command now (`tools/bump-version.mjs`): it writes every file `docs/BUMP-CHECKLIST.md` names, phone build numbers included, turns the pending lines into that release’s notes, and fails rather than skipping a row. [Freebuff]
- The iPhone build retries the Capacitor package clone, so a network blip no longer leaves a release a draft with no IPA. [Freebuff]
- The floating orb no longer stays over your other apps after Izuki's work is done: with “Keep a small orb over other apps” off (the default) it leaves with the work instead of resting there until you hide it. [Freebuff]
- The orb and the glow around the screen stopped doing six times the work on every frame, so the phone stays smoother while Izuki talks and listens over another app. [Freebuff]
- Izuki can't talk over itself on the phone any more: a new line stops the one already playing instead of both going at once. [Freebuff]
- When Android's speech service was busy for a second, the phone gave up on its own ears for the rest of the session and asked for a key instead; it now waits and tries again, and a new call always tries them again. [Freebuff]
- "Hey Nova" no longer answers with silence and a "Listening…" orb when the phone's voice takes a few seconds to start: it waits for the "Yes?" it is about to say. [Freebuff]
- Diagnostics has a Voice line and the last ten voice events, so a wrong voice or an ear that heard nothing can be read off the phone. [Freebuff]
- Every turn now leaves a timeline in Diagnostics — the tap or wake word, the first words heard, the transcript, the first word of the answer, the first and last sound, and which voice spoke, each counted in seconds from the start — so “it’s slow” reads as numbers. [Freebuff]
- A bare “Hey Nova” now opens the ear while it says “Yes?”, so answering at once is heard instead of talked over and then asked to repeat: its own greeting coming back through the microphone is recognised and ignored, and the greeting stops the moment real words arrive. [Freebuff]
- Typing the next message while an answer is still coming out now sends it, instead of stopping the answer: the send button was Stop whenever Izuki was working, so a message sent mid-answer killed the reply, dropped the words and said it had been stopped. [Freebuff]
