# Izuki 1.0.219: the phone does what you ask, and moves with your voice

## 🏎️ Run does anything you ask

- In Autopilot, **Run** now does whatever you type, not just the quick routines. "Open my files and check what's taking space", "turn on dark mode", "find my last screenshot" go to the AI phone agent, and every step shows in the same log.
- The old quick routine took "open my files and check what's taking space" as the name of an app to open, then said it didn't know the routine. A plain "open YouTube" is still instant, and so is any app you have installed by its exact name ("open Find My Mobile").

## 🔵 The orb, wherever you put it

- Move the orb to the left and its words now grow to the right, on the screen (they used to run off the left edge). On the right they grow to the left. It remembers the side.
- The orb moves with **your real voice** while it listens, and pulses with each word while Izuki talks.

## 🌈 Glowing screen edges

- During "Hey Nova" and a tap on the orb, a soft rainbow light runs around the screen over any app, like Apple Intelligence, brighter and wider as you and Izuki speak. Switch it off in **Settings → Phone** (the in-app glow follows the same switch).

## 🗣️ "Hey Nova" misses less

- After hearing someone speak it now checks again after 1.5 s (it waited 4 s), and over a TV or a conversation it takes a fresh look every 2.5 s instead of going deaf until the room was quiet.
- More ways the speech service writes "Nova" are accepted ("nover", "novar", "noba", "nowa").
- With lots of talk nearby it rests for 1 minute (was 2).
- **Diagnostics** (Settings → Phone) now says when someone spoke but wasn't checked, and why, and notes a "near miss" (a greeting but not the phrase). Never the words.

## ⚡ Quicker answers out loud

- In a voice turn Izuki starts speaking the first sentence while it writes the rest, and it decides you've finished after 1 second of quiet (was 1.3). If the rest takes a while, the turn waits for it instead of ending after 12 seconds and dropping it.

## 🛠️ Smaller fixes

- Switching the glowing edges off during a turn removes the light at once.
- Stop during a phone agent step that taps a box and types: nothing is typed or searched after the Stop.
- After "Hey Nova" is heard, the listener's check allowance starts over, so a wake during lots of talk nearby can't leave it deaf for minutes afterwards.
- Autopilot waits a moment for the list of installed apps right after startup, so an app named like a sentence ("Learn and Play Music") opens as that app.
- The orb's side and drag use the real left and right edges on phones set to a right-to-left language.

## Checked before release

- `npm run test:phone`: every suite, with new Autopilot cases (the AI agent runs what isn't a quick routine; a sentence is never an app name; an installed app's exact name is). JVM tests for the listener (continuing sound gets another look, spellings of "Nova", why speech was skipped, near misses); the listener's frame logic simulated against every one of its tests.
- CI: the Android APK build with its JVM tests, the Windows build, web and the iPhone project. CodeRabbit on every change.

## Not verified yet

- All of it on a physical phone: the voice levels, the glowing edges, the orb on each side, and how often "Hey Nova" is caught in a real room.
