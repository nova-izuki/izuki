# Izuki 1.0.213: Android in midnight glass

## 🧊 The phone app, rebuilt around the glass

- The Android companion now has one floating glass language: a rounded header with a soft rim, a night-blue ground, frosted composer, deeper cards and gentler press feedback. Nothing new floats on top of a conversation.
- The header is six clear controls: Home, New, Read aloud, Call, Settings and **More**. Drive, Remote, Lecture and **PC Missions** (formerly Touch Grass) moved into a Command Centre where each has room, a real icon and a one-line description.
- Every header control is the same floating glass circle: Read aloud glows when it is on, and Call keeps only a blue glass tint instead of turning into a separate pill. Home and New get their names back on wider screens.
- The one-tap phone dock on Home is now always visible. Home, Back, Recents, Notifications, Screenshot and Lock are glass pills with proper icons instead of Unicode glyphs, and each is large enough to hit without aiming.
- The live call's round controls are layered glass now, with a red glass end button, a soft halo behind the orb and stronger press states.
- The cockpit's Home, Back, Music, Lock, Drive and Shot buttons use drawn icons and glass tiles instead of `⌂ ↩ ♫ ⏻ ◈ ◉`.
- The command centre is also reachable from the iPhone companion, where the Android-only health and cockpit rows are left out.

## 🩺 Phone health, with the real Android screens

- **Settings → Phone health** shows one row for Android control, the floating orb, the microphone, notifications and battery freedom. Each row says what works and what is missing, and its button opens the exact Android screen for that permission.
- Overlay opens Izuki's own *Display over other apps* page. Notifications opens Izuki's app notification page. Battery opens Android's optimisation list with the wording needed to choose *Izuki → Unrestricted*.
- Health re-checks itself when you come back from Android settings, so the row updates instead of staying stale. A small dot on the Settings button and a Home strip appear only while something is unfinished.
- The Quick Settings button opens the tile editor and explains where to drag **Ask Izuki**.
- Older APKs without the new native health call still show the checks they can answer; the app never invents a permission it cannot read.

## 🪟 The Task Stage keeps its trail

- The desktop Task Stage still floats above a real multi-step task and keeps Pause, Resume and Stop in reach. It now keeps the steps that have already finished, with the real result line and time for each, so a long job reads as a short plan instead of one line that keeps replacing itself.
- The live step, elapsed time and progress stay together in the same glass room. It remains a view of the real desktop task, not a sandbox, and moving the mouse or pressing Esc still takes control back.

## 🔊 Sound, easier to read and change

- Media, ring and alarm each have an icon, a live value and a filled glass track instead of three bare sliders.
- Quiet, Balanced and Loud presets set all three streams in one tap. They are explicit choices; Izuki never changes the phone's volume on its own.
- Ducking other audio while Izuki speaks is unchanged and still opt-in.

## 📱 iPhone too

- The Command Centre reaches Drive, Remote, Lecture and PC Missions on the iPhone companion. Android-only tools are hidden there rather than shown as dead buttons.

## Under the hood

- New native plugin methods: `repairStatus`, `openOverlaySettings`, `openNotificationSettings` and `openBatterySettings`. The JavaScript bridge is defensive, so an older APK cannot break the page.
- The offline shell is `izuki-phone-v85` and includes `android-glass.css`.
- Android `versionCode` is 213, so this installs over 1.0.212 without uninstalling.

## Checked before release

- Phone routing, apps, native bridge, audio, Drive, Autopilot and pilot checks; the phone HTML parser check; JavaScript syntax checks; version consistency.
- The 390px Android preview was inspected for layout: no horizontal overflow, six header controls fit, the tools sheet fits, health rows render with the expected state, and the sound fill/value updates.
- No physical Android phone was attached here. The new settings intents compile only in CI, and the real Android permission screens, floating orb, live-call glass and APK install still need a device pass.
