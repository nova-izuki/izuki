# Waiting for the next release

Codex and Freebuff: add one line per change you pushed. Write it in plain
words for the owner, and put your name in brackets. Claude moves these lines
into the next `docs/RELEASE-x.y.z.md` when it releases, then clears this list.

- Voice OS: "set the volume to 30" (a real level, not key presses), "snap left/right", "lock my pc", "take a screenshot", "open task manager" — all local, no AI [Freebuff]
- "What time is it", "what's the date", "what day is it", "how much battery is left" answered from the PC itself, no AI request spent [Freebuff]
- Volume phrasing is strict: a sentence with two jobs goes to the brain whole instead of having its first half done silently [Freebuff]
- Internet detection no longer blames a working connection: it asks the OS resolver, waits 90 seconds of real failure, and says it once [Freebuff]
- "Couldn't reach the AI — usually the internet" now allows for a school/work network blocking the service [Freebuff]
- Crash fixed: `thread 'tokio-rt-worker' has overflowed its stack` killed 1.0.175 mid-session (Windows event log, 0xc00000fd). Workers now get a 16 MB stack [Freebuff]
- A task is no longer thrown away after two tries six seconds apart: five tries for transient trouble, and an offline PC is waited for (up to 90 s) so the same task resumes instead of being promised for "later" [Freebuff]
- Offline detection now also connects to the AI hosts Izuki actually uses, so a campus network that blocks raw DNS IPs no longer hides every cloud brain [Freebuff]
