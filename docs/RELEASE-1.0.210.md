# Izuki 1.0.210: a cockpit for your phone, and its screen on your PC

## 🏎️ Your phone, from the driver's seat

Settings → Phone → **Open cockpit** is a dark, glanceable panel for the phone: battery and charging, network, screen and lock state, and up to three quick actions. It is not a mock-up — every number comes from the paired Android device.

In Drive mode the cockpit also shows the speed your phone's GPS reports, right beside the same quick controls, so you can leave the map full-screen and still see what matters.

## 🛣️ Autopilot that shows every step

Type a short routine in the cockpit: “open YouTube and search lofi”, “open Chrome and search the weather”, “tap Search”, “type good morning”, “scroll down twice”.

- **You can watch it work.** The plan appears before it starts, every action is added to the log, and **Stop** ends it between steps.
- **It asks the phone, not a guess.** It taps a named control where the phone says that control is, and only types into a field the screen reports.
- **Dangerous presses are refused.** Send, Pay, Buy, Delete, Confirm and similar labels are never tapped by Autopilot. It also will not press Enter unless the screen shows a Search or Go control.
- **It leaves the lock screen alone.** A locked phone is never read, tapped or typed into.

## 👆 Real phone control

The Android companion now performs actual touch gestures through Android Accessibility: **tap, swipe and long-press** at exact screen coordinates, plus tap-by-label, Enter/Search, Back/Home/Recents, lock, screenshot and the power menu.

This also fixed two bugs in the screen reader: password fields and their hints are never read, and saved screen nodes are recycled instead of leaking on every look.

## 💻 More in the PC app

Settings → Control my Android → **Open phone screen** shows the real phone screen on your PC over ADB. Tap it, drag to swipe, use Back/Home/Recents/Enter, or type into the focused field. It refreshes live and refuses to show or touch the phone's lock screen.

## Checked before release

- Phone tests: routing, apps, native bridge, audio, Drive and the new Autopilot step-order/safety checks pass.
- Browser checks: the phone toolbar still fits at 320px, Settings folding/search works, and the website has no JavaScript errors.
- TypeScript typecheck, production build and the Rust library check pass.
- The Android APK is built by CI. No phone was attached to this machine, so the first real-device gesture and cockpit pass is yours — enable Android Accessibility when asked, and keep the phone unlocked.

## If you are updating the phone app

Install the new `Izuki-Companion-Android-preview.apk` from this release. Android may warn that it is a preview build; that is expected for the sideloaded companion.
