# Izuki 1.0.112: remote desktop from your phone, live and secure

## 🖥️ Live remote desktop
In the Izuki phone app, tap **Remote**. It works on your home Wi-Fi and away from home, through the private encrypted link (no port forwarding).
- **A live view of your screen,** not a picture every 1.5 seconds any more. Pick **Data saver** (3 pictures a second), **Balanced** (6) or **Smooth** (10). A screen that isn't changing isn't sent again, so it costs almost nothing.
- **Live numbers:** pictures per second on the phone, data rate, and how long the PC takes per picture.
- **Watch Izuki work:** it shows what Izuki is doing right now (its real task and step), with a **Stop Izuki** button, and an **Ask Izuki** box to give it something to do on the PC while you watch.
- **The full controls from before:** trackpad, tap-to-click on the screen view, right-click, double click, drag, scroll, typing, keys, Alt+Tab, and music and volume buttons.

## 🔒 Secure by design
- **Only phones you allowed.** Knowing the private link is no longer enough. Each phone is paired once: tap **Pair this phone**, a box with a 4-digit code pops up on the PC, and you press **Yes** there. The phone keeps its own pass, and you can remove it any time (Settings → Phone → Let my phone control this PC).
- **Never silent.** While a phone is watching or controlling, the PC shows **"📱 iPhone is controlling this PC · End"** at the top of the screen. **End** switches the remote off at once, and it only comes back when you switch it on again at the PC.
- **You and Izuki never fight over the mouse.** Touching the controls immediately stops Izuki's own task and missions.
- **Written down.** Every remote action is recorded in %APPDATA%\Izuki\logs\remote-audit.log, without what you typed.
- **The same as before:** the remote is off until you switch it on, and nothing works while the PC is locked. Izuki never touches the lock screen.
- **One live view at a time,** for at most two hours, after which the phone reconnects by itself.

## 🖐️ Air control reaches the taskbar
Reaching down for the taskbar no longer makes the ring disappear. A raised hand is now judged by your fingers pointing up, not by how low it is, and the bottom of the screen is easier to reach. Hands typing on a keyboard are still ignored. Tested: typing hands moved the ring 0 times, and a raised hand moved it 409 times.

## Not yet
- True WebRTC video with hardware encoding (30–60 pictures a second).
- File transfer and a remote terminal: big security surfaces, so they get their own careful release.
- Several PCs at once, and push notifications in the phone app itself. Telegram and Discord already notify your phone.

## Reviewed
- **Tests:** 266 Rust tests, including new ones for the device pass and the remote being off. The build and the phone and page tests pass too.
- **CodeRabbit:** 3 findings fixed.
