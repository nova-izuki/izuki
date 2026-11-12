# Izuki 1.0.207: typing, scrolling and the rest, done directly

## ⚡ Izuki controls apps through Windows, not your mouse

1.0.206 made button presses direct. This update does the same for the rest of what Izuki does on screen, so it works like Jarvis: through Windows itself, exactly, with your mouse and keyboard left alone.

- **Typing:** a one-line box (a search box, a name, an address) is filled straight in. No keys are pressed, and Izuki checks the box really holds the text.
- **Scrolling:** pages, panes and lists scroll directly, with no mouse wheel.
- **Lists, file lists and trees:** one click picks an item and two open it, both done directly.
- **Dropdowns and menus:** dropdowns and submenus open directly.
- **Sliders:** volume, brightness and zoom sliders are set directly.
- **Right-click menus:** they open from the keyboard on the right item.

Izuki still types normally into documents. On web pages, the browser extension types inside the page. The pointer is only for things with no direct way, like games and drawing.

## 📬 The Inbox shows when it checked

"Go through my inbox" now says **when** it checked and **how much it read**, for example "Checked at 8:34 · read 18 emails from the last 3 days · 1 needs you, 17 promotions and newsletters skipped". Pressing "Check again" visibly updates, even when the answer is the same.

## Checked before release

- **Automatic checks:**
  - The full Rust suite (711 tests).
  - Real-desktop tests on this PC, run twice: Izuki filled a real text box and ticked a real tick box through Windows. No keys were pressed and the mouse never moved.
  - The Windows, web and phone CI jobs.
  - Review rounds.
- **Not tried by you yet:** a full task with direct typing and scrolling in your own apps.

---

Free, as always. No account, no subscription, nothing to pay.
