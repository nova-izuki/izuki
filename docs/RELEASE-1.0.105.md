# Izuki 1.0.105: your phone is a remote for your PC

In the Izuki phone app, tap **Remote**. You get:
- **A live view of your PC's screen,** refreshed every 1.5 seconds. Tap anywhere on it and the pointer goes there and clicks.
- **A trackpad:**
  - slide to move (faster slides go further, like a laptop)
  - tap to click
  - two fingers: tap to right-click, slide to scroll
  - press and hold to pick something up and drag it
- **Click, Right-click and Double** buttons.
- **Typing:** write on your phone and it's typed on the PC.
- **Keys:** Enter, ⌫, Tab, Esc and the arrows, plus Copy, Paste, Undo, Switch (Alt+Tab) and Start.
- **Music and volume:** ⏮ ⏯ ⏭ 🔉 🔊 🔇.

It works on your home Wi-Fi and away from home, through the private link your phone already uses for "Call Izuki".

## Safe by design
- **Off until you switch it on** on the PC: Settings → Phone → **Let my phone control this PC**.
- **Only your linked phone,** through its secret link.
- **Never while the PC is locked.** Izuki never touches the lock screen.
- **Only these actions.** Keys must be ones Izuki knows, and there are no commands and no files.
- **Never stuck holding a click.** A drag always lets go when you lift your finger, add a second finger, close Remote or leave the app.

The fuller remote control (more like Microsoft's Remote Desktop) is still planned for when your new PC is set up.

## Reviewed
- **Tests:** 261 Rust tests, including a new one checking that nothing happens while the remote is switched off. The phone, page, companion and Air tests pass too.
- **CodeRabbit:** 2 findings fixed (a drag now always lets go, and the screen size is read properly).
