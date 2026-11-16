# Izuki 1.0.216: an escape key, a phone that tells the truth, and "Do it"

## 🆘 If Izuki ever covers your screen

- Press **Esc three times quickly**, or **Ctrl+Shift+Q**. Izuki stops its work and hides only its own overlay windows, then checks Windows really hid them. Saying or typing **"remove the black screen"** takes the same direct path, with no AI and no clicking. This was the black screen from today: Izuki's own overlay had stopped being see-through, and nothing could click it away.
- The overlay stays hidden until you choose **Restore overlay** in the tray or ask for it. If Windows can't hide it (a frozen window), Izuki says so. Other apps and Explorer are never closed.

## 👉 "Do it" and "Type it"

- Every finished reply has **Do it** (act on the screen now instead of explaining) and **Type it**, and the composer's keyboard button types your draft exactly into the app behind Izuki without sending it. Graded writing and never-submit rules still apply.
- "Answer it", "give ans", "answer question 5" and "answer all of them" answer the question on screen instead of a Study-log refusal.

## 🏝️ Nova Notch and Shape Studio

- A glass notch on the top edge with a live status card and a real step ring, expanding into the Island when you need it (Classic stays the default). Shape Studio adds opacity, blur, accent, shadow and calm-motion controls, a brighter Light glass and an optional "Expand while a task runs".

## 📊 New PowerPoint decks

- Asking for a new .pptx makes a real deck: one slide per "# " title, "- " bullets under it, long slides shrink to fit. The storage report names folders the way you'd find them ("Downloads › project › target").

## 📱 Android: Phone readiness, checked by Android itself

- **Settings → Phone → Phone readiness** shows what Android really reports, item by item, with one button each. **Android control** is "Ready" only once Android has connected it, not just when it's switched on. The card checks itself again the moment you come back from Android Settings, and the old "Enable Android controls" button no longer stays up after it's on.
- If Android says **"App was denied access"** or **"Restricted setting"**, that's Android protecting apps installed from a file. The card says so (only as far as Android tells it) with Samsung's steps: App info → ⋮ → **Allow restricted settings**, then Accessibility → Installed apps → Izuki Companion control.
- **The floating orb** is drawn through Android control (an accessibility overlay). It never needed "Appear on top", which is why Izuki isn't listed there, and the old button that opened that screen is gone. Notifications are asked with Android's own prompt. Background use is offered only when "Hey Nova" is on.
- **Diagnostics** (Settings → Phone): versions, every permission, the orb's window type, the wake listener's recent states, and the last phone action, with **Copy report**. No screen contents, nothing anyone said, no keys.

## 🗣️ "Hey Nova" without the connect–disconnect loop

- The old listener restarted Android's speech recognizer every few hundred milliseconds, for ever. Each restart played its start sound and switched a Bluetooth headset into call mode. Now Izuki listens quietly and only asks the speech service when someone actually speaks.
- It backs off after errors and stops with the reason (and a **Try again**) instead of looping. It pauses while Izuki is open and rests for a couple of minutes if lots of other talking is nearby. Turning it on twice never opens a second microphone.
- **Your own wake phrase** (for example "hey jarvis"); "Hey Nova" always works too.
- **Voice match (optional)**: "Teach my voice" takes three short recordings. After that, "Hey Nova" only starts things when it sounds like you, using the same voice model and "two of three recordings must agree" rule as the PC. On Android 13+ the wake phrase itself is checked; otherwise the first thing you say is. Only a voice template stays on the phone, never the recordings. The voice model (about 95 MB) downloads the first time. It keeps the TV and other people from starting things; it isn't a lock.

## 🔵 The orb says what's really happening

- The orb **rests** ("Tap to talk") instead of claiming "Listening…" over the home screen and over Settings. Listening, working and talking are only shown while they're true, and the orb falls back to resting by itself if the app stops.
- Drag it anywhere (it settles on the nearer side), and long-press to hide it. A resting orb doesn't redraw 60 times a second.

## 🤖 Phone control that checks its work

- **Tap by label** reaches labels inside rows and cards. Earlier it only found buttons that carried their own text, so most settings rows failed. Risky controls (send, pay, buy, delete) are only pressed when you named them.
- Taps, swipes and long-presses report Android's own answer (completed or cancelled). Typing is read back. Scrolling uses the main list.
- **Autopilot** waits until the app is really in front, opens the search field itself (never Voice search), and only counts a search done when the results appear. "Tap Search" is only called done when the screen changes.
- A search only ever types into a search box, never a chat's message box. Enter is pressed only in a search or address box, so a chat message can't be sent by accident. "Order" never presses "Delete order". Stop also ends the apps lane between steps.
- **Test phone control** says exactly what Android reported for each check.

## ⏱️ Never stuck on "Thinking…"

- Every request has a time limit, a live stage with the seconds ("Asking Gemini… 12 s"), and **Stop**: Send turns into Stop while Izuki works. Stop and the time limit end the network calls themselves, so a late answer can't appear afterwards.

## 🎨 One shape for the top buttons

- Home, new chat, read aloud and settings now take the Call button's oval, in the browser, on Android and on iPhone.

## 🧩 Browser extension 1.6.4

- "Asking Gemini…" counts the seconds and has a **Show Gemini** button for the tab it's using.
- If that tab is still busy with an earlier question (often one asked before the panel was closed), the panel says which, with **Stop that one and ask this**. Reopening the panel shows a question that's still running, with Stop.
- A frozen AI tab or an answer that never finishes ends with a plain reason. A stuck lock clears itself.

## 🔋 Windows: hardware settings go where they live

- Hardware requests (battery charge limit, fan, keyboard light, performance mode…) start from facts: this PC's maker, model and maker apps.
- On a ThinkPad the charge limit is in **Lenovo Commercial Vantage → Device → Power → Battery Charge Threshold**, not Windows Settings, so Izuki goes there instead of scrolling for a control that doesn't exist. "Open Lenovo Commercial Vantage" now finds the Store app.
- After a failed step, the next try isn't announced as progress. When Izuki stops, it says what happened ("scrolling didn't move the page; a control was covered") instead of "a step keeps failing after fresh looks".

## Checked before release

- CI: the Android APK build plus new JVM tests for the wake listener (silence never wakes it, steady noise is learned, budget, backoff then stop, controlled states, own phrase) and Android control (component forms, restricted settings, labels inside rows, risky controls). Also the Windows build and Rust tests (`hardware`, `stop_report`), web, and the iPhone project.
- `npm run test:phone` (readiness for every state Android reports, Autopilot launch and search checks, the self-test's mapping), `tools/relay-check.mjs` (busy tab, Stop, frozen tab, deadline), `test:workspace`, `test:panel`, `asset-check`, and `tsc`.
- The phone page at Samsung size in a headless browser with a fake bridge (restricted, denied and optional rows), and the top-button shapes on web, Android and iPhone layouts.
- On the owner's PC: the hardware facts read "LENOVO ThinkPad T14 Gen 1 (20S1SA4W03)" with Lenovo Commercial Vantage, and its Store app id.

- CodeRabbit on PR #108 (32 findings across passes): fixed in #108 and #110, all threads resolved.
- The overlay rescue (#111): its pure tests and a real Windows probe (a full-screen registered overlay hidden, foreign windows with the same title kept, a frozen window answered within its deadline). Do it / Type it (#112): 47 conversation checks. Nova Notch (#103): its own review and CI.

## Not verified yet

- Nothing has been tried on a physical Android phone. Use docs/DESKTOP-TEST-CHECKLIST.md → "Android phone" after installing this APK.
- Whether Android's speech service plays its own start sound when Izuki hands it audio (Android 13+). The listener works either way, but in a quiet room there's now no session, so no sound at all.
- The extension in a real browser, and the charge-limit flow in the installed Windows app.
- Voice match end to end: the voice library loads in a browser worker and the phone's WAV decodes, but the 95 MB model and real enrollment haven't run on a phone yet.
- The emergency keys, Restore overlay and Do it / Type it in the installed app. Which graphics fault turned the overlay black today isn't proven; the escape works whatever the cause, because it hides the window itself.
