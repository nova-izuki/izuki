# Izuki 1.0.206: does it directly, like Jarvis

## ⚡ Less clicking around, more just doing it

You told us Izuki wasn't doing well on the things you asked. Your log showed why:
- it paused every time you touched the mouse, because it was using the same one;
- it tried again and again to click a window's ✕ and got stuck;
- it clicked through menus for things it could just do.

Now:

- **It uses its own abilities first.** In the middle of a task, Izuki does things itself instead of hunting through menus: dark mode, a settings page, a folder, a window layout, a timer, focus mode, a screenshot, a clean-up. It only clicks on screen when there's no direct way.
- **Your mouse stays yours.** Real buttons, links, tabs and tick boxes are pressed through Windows itself, so the pointer doesn't move. The pointer is only used for things that can't be pressed that way, like games, drawing apps and file lists.
- **"Open Bluetooth settings"**, "Wi-Fi settings", "display settings", "take me to Windows Update" and about thirty more open that page at once.
- **"Close Chrome"**, "quit Spotify", "close the Chrome window" close the way the ✕ does, so an app with unsaved work still asks first. It's only that app: "close note" never closes both Notepad and OneNote.

**Safety:** a task only closes, deletes, sends, pays or restarts when you asked for exactly that. "Close Spotify and open Chrome" never lets it close Chrome, and "don't close Chrome" is always a no.

## 🧠 Choose how Izuki uses your brains

Settings → Izuki's brain → **How Izuki uses your brains**:

- **Fastest** (as before): whichever of your brains answers best. It switches when one is slow or busy.
- **My brain + backup:** your brain answers. Your fallback brain steps in only if it errors or says nothing for 20 seconds, and never both at once.
- **Only my brain:** exactly the brain and model you picked, never switched. If it can't answer, Izuki tells you.

## Checked before release

- **Automatic checks:**
  - The full Rust suite (709 tests), with new tests for:
    - the direct steps;
    - "close" and settings-page wording;
    - who may close or send what;
    - each brain mode.
  - A real-desktop test on this PC: Izuki ticks a real Windows tick box through Windows, and the mouse never moves.
  - The phone routing checks, and the Windows, web and phone CI jobs.
  - Review rounds.
- **Not tried by you yet:** a full task with the new direct steps, and the brain modes with your keys.

---

Free, as always. No account, no subscription, nothing to pay.
