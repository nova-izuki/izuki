# Izuki 1.0.205: a folder opens once

## 📁 Downloads opens once, not six times

Ask Izuki to open Downloads (or Documents, Pictures, Music, Videos) when that folder is already open, and it brings the window you have to the front instead of opening another one.

Before, if the folder opened behind another window, the next look didn't see it, and Izuki opened it again. Your log from 9 November shows it happening six times in a row. Now:

- an open folder comes to the front;
- one that's still opening isn't started a second time;
- if Windows won't bring it forward, Izuki tells you it's on the taskbar.

"Open Photos" still opens the Photos app. "My photos" opens your Pictures folder.

## Checked before release

- **Automatic checks:**
  - The full Rust suite (699 tests).
  - A real-desktop test on this PC: asking for Downloads twice leaves exactly one Downloads window.
  - The Windows, web and phone CI jobs.
  - Review rounds.

---

Free, as always. No account, no subscription, nothing to pay.
