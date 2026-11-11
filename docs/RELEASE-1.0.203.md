# Izuki 1.0.203: put any app where you want it, by name

## 🪟 One app, one sentence

Say where an app should go, and Izuki moves just that app's window:

- **"Put Chrome on the left"**, "snap VS Code to the right half"
- **"Put Discord in the top right corner"** (any corner)
- **"Center Notepad"**, "center this window"
- **"Make VS Code full screen"**, "maximize Discord"
- **"Move Spotify to my other screen"**, "move this window to my second monitor": same place and size on that screen, and a maximised window stays maximised.

Izuki finds the app by its everyday name (Chrome, VS Code, Word, Spotify, Discord, Teams…) among the apps you have open. If you've used two of its windows, it takes the one you used last. It only acts when that app is really open, so "put the chicken in the middle" is left alone. **"Undo the layout"** puts the window back where it was, and "What Izuki did" lists the move.

It works from your phone, Discord and Telegram too: when your phone names a PC app or says "window", the request goes to your PC.

"Make it full screen" with nothing named still means the video in front, as before.

## Checked before release

- **Automatic checks:**
  - the full Rust suite (679 tests), with new tests for the phrasing, how halves and corners split the screen, keeping a window's place on another screen, and finding apps by name;
  - the phone routing checks (137 cases);
  - the Windows, web and phone CI jobs;
  - review rounds.
- **Not tried on a real PC yet:** moving real windows, and a second monitor.

---

Free, as always. No account, no subscription, nothing to pay.
