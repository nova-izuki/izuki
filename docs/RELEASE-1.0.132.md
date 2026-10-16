# Izuki 1.0.132: double-click with Air control

You tried to open Chrome (and other apps) with Air control and nothing happened. The log showed Air control seeing your hand fine (every look used) and your pinch reaching the desktop. Chrome didn't open because **Air control had no double-click.**

A desktop icon or a file only opens on a double-click. Windows counts two clicks as one double-click only when they're **under half a second apart and within 4 pixels** of each other. Two pinches in the air are never that quick or that still, so the icon was selected and never opened.

## Pinch twice quickly to double-click
- Pinch, let go, and pinch again **within about a second, on the same thing**. Izuki sends Windows a real double-click **at exactly the spot of your first pinch**, so a hand that drifted a little still lands on the icon.
- **It opens once, not twice.** If your second pinch came soon enough for Windows to pair it with the first, Izuki adds just one more click at the same spot. If not, it sends a fast double-click of its own. Either way Windows sees one double-click.
- A pinch that moved (a drag) or was held long never counts as the first half.
- Single pinches work as before. Things that open on one click, like **taskbar icons**, still need just one pinch.

Air control's help text in Settings now mentions it.

**Tip:** you can also just say "Hey Nova, open Chrome".
