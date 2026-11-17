# Waiting for the next release

Codex and Freebuff: add one line per change you pushed. Write it in plain
words for the owner, and put your name in brackets. Claude moves these lines
into the next `docs/RELEASE-x.y.z.md` when it releases, then clears this list.
- [Claude] Android: the orb no longer says "I didn't catch that" a second after you tap it: it waits until you actually talk (some phones' speech services gave up after a second of quiet), and says "I heard you but couldn't make out the words" when that's what happened.
- [Claude] Android: tapping the orb after a task really stops it: the orb used to keep saying "Working… tap to stop" after the task had finished (its repeat never looked again), and a tap didn't stop Autopilot runs. Now the tap answers at once ("Stopped."), stops a reply, the phone agent and Autopilot, and the orb goes away.
- [Claude] Android: one rainbow light around the screen, everywhere (over other apps and inside Izuki), only while Izuki listens, works or talks, and it always goes out when it's done (by itself after 30 s without news). The second, cyan light inside the app is gone.
- [Claude] Android: a natural voice: during "Hey Nova" and the orb, Gemini's voice is played by Android when it's ready within a few seconds (else the phone's voice answers, so you never wait), and the orb moves with that voice's real loudness. The phone's own voice is now Google's most natural installed voice, and Settings → Izuki's voice lets you pick one and hear it.
- [Claude] Android: the phone agent sees the screen: with Gemini it gets a screenshot with every control numbered on it, can tap any point it sees, long-press, swipe between pages and photos, open recent apps, notifications and quick settings, control media, volume and the torch, start Maps directions, keeps a plan across steps, notices when it's repeating itself, and has 30 steps instead of 14. The safety rules hold for every new touch.
