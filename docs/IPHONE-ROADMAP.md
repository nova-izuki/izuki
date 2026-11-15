# iPhone companion: what's real, what's possible, in what order

Written 2026-11-15 from the code as it is. Status words: **Shipped**,
**Not started**, **Blocked** (by something outside the code).

## What exists today (Shipped)

- **The companion is the phone web app** (`docs/app`) wrapped by Capacitor
  (`ios/App`, iOS 15+). CI builds an unsigned IPA for AltStore or Sideloadly
  (`.github/workflows/mobile.yml`, "iPhone project integrity"). The same app
  also runs from Safari as a home-screen app.
- **It reaches the PC three ways:** the home link on the Wi-Fi (`link.rs`,
  port 47616, the PC asks you before a device links), the phone's private
  link (`call.rs`, a secret address only your paired phone has) used by the
  remote (`remote.rs`) and calls, and **Web Push** (`webpush.rs`), which iOS
  supports for home-screen apps (iOS 16.4+).
- So an iPhone can already talk to Izuki, see a task's status, get
  notifications, and use the remote (when you switched that on, never while
  the PC is locked).

## What iOS will never allow (don't promise it)

- Controlling other apps, reading their screens to act on them, or drawing
  over them. There is no iOS equivalent of Android's accessibility control or
  overlays. (Sharing the screen while you watch, started by you each time
  through ReplayKit's broadcast picker, is possible as a native feature
  later, for help or a demo, never for control. Not started.)
- An always-listening "Hey Nova" in the background. Only Siri listens like
  that; an app can be reached through Siri with App Intents (below).
- Answering, tapping or submitting anything in another app for you.

## Next steps, in order

### 1. App Intents and Shortcuts (Not started; no paid account needed)
A small native Swift target in the Capacitor project (iOS 16+):
- **"Ask Izuki"**: text in, the PC's answer back, from Siri, Spotlight or
  the Action button. It calls the PC over the existing private link.
- **"What's my PC doing?"**: the running task and its step, from the same
  status the Task Stage shows.
- **"Stop Izuki"**: the same Stop as the Task Stage, with a confirmation.
- Needs: the pairing secret available to the intent. That lives in the app's
  own keychain, so no App Group is needed while the intents run inside the
  app's process (`AppIntent` with `openAppWhenRun = false` still runs in it).

### 2. Share to Izuki (Not started; needs App Groups)
A Share extension: a link, text, photo or PDF goes to the PC's File Shelf,
or into a new Izuki chat. An extension runs in its own process, so it needs
the pairing secret through a shared App Group or keychain group.
**Blocked on signing:** free Apple IDs (AltStore/Sideloadly) don't get App
Groups. Possible with a paid Apple Developer account.

### 3. Live Activities and widgets (Not started; needs a paid account)
- **Live Activity / Dynamic Island** for a running PC task: app name, step
  "3 of 5", Pause and Stop. Starting one works from the app; keeping it
  updated while the app is closed needs ActivityKit push updates through
  APNs, which needs a paid developer account and a small push sender on the
  PC side (it would sit beside `webpush.rs`).
- **Home-screen widgets** (WidgetKit): PC status, last task, quick Ask.
  Timeline refresh is rationed by iOS, so a widget shows "as of" times
  rather than pretending to be live.
- **Blocked on:** an Apple Developer account and an APNs key. Web Push
  already covers notifications in the meantime.

### 4. Remote approvals (Not started; works today's way first)
A task waiting for "yes" (send, pay, delete) shows on the phone with the
exact action, and the yes travels back over the private link. The PC keeps
its own rules: a phone yes never unlocks anything the PC itself refuses.
This can ship in the web app now, then move into a Live Activity in step 3.

## How each step will be verified

CI can build the IPA and check the project; it cannot run an iPhone. Every
step above needs a pass on a real iPhone (sideloaded first), with the PC on
the same Wi-Fi, before it's called working.
