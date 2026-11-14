# Waiting for the next release

Codex and Freebuff: add one line per change you pushed. Write it in plain
words for the owner, and put your name in brackets. Claude moves these lines
into the next `docs/RELEASE-x.y.z.md` when it releases, then clears this list.

- [Freebuff] Android: an optional “Hey Nova” wake word. It shows a persistent listening notification, wakes the screen when it hears you, never unlocks the phone, and hands a locked wake back to you after unlock. (Native service + Android “user present” signal.)
- [Freebuff] Android: a Phone sound panel for media, ring and alarm, plus an optional “duck other audio while Izuki talks” switch that uses Android audio focus — it never mutes another app permanently.
- [Freebuff] Phone: Autopilot now opens from Home, Settings or a typed “autopilot …”, pauses visibly when the phone locks and continues after unlock. Added a safe self-test that only taps its own on-screen targets, so real gestures can be tried without touching another app.
