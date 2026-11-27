# Izuki 1.0.217: a phone that listens and talks back, and an Island that stays out of the way

## 🗣️ Android: talk to the orb, it answers right there

- **"Hey Nova"** pops the glass orb up over whatever is open — another app, the home screen, even the lock screen — says "Yes?", listens and answers out loud there. Izuki doesn't have to open. Say it in one breath ("Hey Nova, what's the weather?") and it skips the "Yes?". If the answer asks you something, it listens for your reply.
- **Tap the orb** to talk the same way; tap it again to stop. Tap its words to open Izuki with the whole answer. The **Quick Settings tile** and the "Hey Nova" notification's **Ask Izuki** start a question too.
- **On the lock screen** it answers general questions only (facts, weather, maths). Anything personal or anything done on the phone or your PC waits until you unlock.
- **Likely cause of "Hey Nova does nothing"**: Android 11 and later hide the phone's speech recognition and voice from apps that don't declare they use them, and Izuki never declared it. Now it does. "Hey Nova" also keeps listening while Izuki is open (it only steps aside while Izuki itself is listening or talking), and if the phone's on-device recognizer never returns a word, Izuki switches to the next way of listening by itself.

## 🔊 It speaks, and hears you properly

- Replies use **Android's own voice**. The app's web view has no working voice, so many replies were silent before.
- Calls in the app listen with **Android's own speech recognition**, the one the phone's assistant uses. The old recorder's loudness gate dropped quiet speech, which is why it misheard unless you spoke loudly.

## 🤖 Real phone control by AI

- Ask for something on the phone and Izuki does it step by step, checking each one: "what's taking space on my phone" opens Storage and reads the numbers to you; "turn on dark mode", "open YouTube and play lofi", "how much battery do I have" work the same way. Phone jobs no longer get "connect your PC".
- It never presses call, send, pay, buy, delete, uninstall or reset buttons (it tells you which one to press), never types passwords and never acts while the phone is locked. Stop works between every step.

## 🔵 The orb, the settings and the controls

- The orb only shows while Izuki is listening, working or talking. A small resting orb is a setting (Settings → Phone → "Hey Nova"), off by default. It breathes for a moment when it settles, then holds still; it gives a little when you touch it and grows while it listens and talks.
- iPhone-only setup (Hey Siri, iPhone alarms) no longer shows on Android.
- **One-tap phone controls**: the labels fit inside their tiles now, and there are more: flashlight, Wi-Fi, Bluetooth, volume, screenshot, split screen, battery, storage, camera and Do not disturb (under "More controls").
- Say "turn on the flashlight", "open Wi-Fi", "Bluetooth", "split screen" or "how much storage do I have left" and it's done at once, no AI needed.

## 🎙️ Teach my voice, as a safety switch

- A guided screen: three different sentences to read, a big record button with a live sound meter, a check for each one with redo, and the voice model's download progress (about 95 MB, only the first time). Android records the samples itself.
- With voice match on, "Hey Nova" only goes ahead when it's your voice. A tap on the orb still works, because that needs your hand on the phone.

## ⚡ Faster answers

- Gemini 3 refused Izuki's "don't think first" setting, and after that every answer thought at full length. Now each model is told the way it accepts.
- Google Search is only attached when the question needs it (news, weather, scores, prices…), so everyday chat answers sooner.
- A connection left stale while the app was in the background is retried after 12 seconds instead of waiting 30, and the connection is opened as soon as you come back or start typing.

## 🏝️ PC: the Island stays out of the way

- **Hidden until you reach for it**: no sliver, no "Hover to open". Move the mouse to the top of the screen and it slides down. (Switched once for everyone; Settings → "Always show the Island" brings the sliver back.)
- **Screen notch**: the laptop-notch shape, its top corners curving out into the screen edge, and it only comes down from the top middle.

## 🗂️ PC: storage in short lines

- "What's taking up space" answers with a headline, the top folders and what's inside them, the biggest apps (without version clutter), the biggest files (a split archive counts once) and what you can clear, instead of one long paragraph. The "your drive is nearly full" nudge no longer follows right after it.

## Checked before release

- CI: the Android APK build with its JVM tests (the wake phrase and its command, Android's voice text rules, controls), the Windows build with Rust tests (storage report, settings switch), web and the iPhone project.
- `npm run test:phone`: every suite, including the new phone agent test (a storage question end to end, risky buttons refused, Izuki's own page, a locked phone, Stop, model replies) and 36 new routing checks (phone jobs, search on or off).
- The phone page at Samsung size with a fake bridge (dock labels inside their tiles, iPhone sections hidden, Teach my voice), the notch shape in a browser, and the storage report with the owner's real numbers.
- CodeRabbit on every change (three passes, 15 findings: 14 fixed, one kept by design and explained in #114).

## Not verified yet

- Nothing in this release has run on a physical phone. Use docs/DESKTOP-TEST-CHECKLIST.md → "1.0.217: Android phone" after installing the APK.
- Whether Samsung's speech service accepts the "Hey Nova" audio Izuki hands it (Android 13+), how its own voice sounds, and the phone agent on real Samsung Settings screens.
- The Island's new hide-and-slide and the notch in the installed Windows app; the full notch browser check (tools/notch-browser-check.cjs) was updated but not run.
