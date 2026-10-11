# Izuki 1.0.77: Stop means stop, and the title bar stays put

- **Stop clears everything at once.** Pressing Stop on "Izuki is thinking…" (or Esc, or the stop key) now takes the orb, the words still typing out and the "doing" line off screen immediately. Before, the screen waited for the main window to say so, and things could linger.
- **The title bar can't be pushed away.** When something scrolled itself into view (the chat following new words, "Find anything", a jump link), the whole window frame could scroll, leaving the title bar half hidden and the window hard to drag. The frame can no longer scroll at all; only the page inside it does.
- **The jump bar follows you.** On Settings, Draw and Apps, the row of section links now stays at the top of the page as you scroll down, so any section is one tap away.

Reviewed with CodeRabbit (1 note, kept as designed: the bar's small negative offset cancels the page padding).
