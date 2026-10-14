# Izuki 1.0.120: Air control that holds on, clicks that stay clicks, 3D control, more Windows tweaks

## ✋ Air control: smoother and more reliable
- **It doesn't cut out any more.** When the camera missed your hand for a moment (fast moves blur it), Izuki let go of everything at once: the drag stopped half-way and the pointer jumped. Now a hand missing for under half a second keeps everything going. Hand tracking also holds on to a moving hand better, while finding a new hand stays just as strict, so typing hands are still ignored.
  - Measured with the recorded test hand: **452 pointer moves, up from 320**, with **0 accidental clicks**, and typing hands still at **0**.
- **A click stays a click.** Closing your fingers nudges your hand, and that used to turn clicks into little drags. Now the pointer holds still during a pinch until your hand clearly moves, like a real mouse's drag threshold. The label says "Pinch — move to drag" until it really is a drag.

## 🧊 Turn 3D models with your hand (switch it on in Settings → Air control)
In **Blender, SketchUp, Fusion 360, Unity, Maya, 3ds Max, Cinema 4D, FreeCAD, 3D Viewer and Paint 3D**, pinch and move to turn the model. Izuki uses the right mouse button and keys for each app. A quick pinch still clicks, and ✌️ up and down zooms. It's off by default, because while it's on, dragging a slider in those apps turns the model instead. Nothing changes in any other app, and the grip is always let go, whichever way the pinch ends.

## 🏝️ Island fixes
- **The quick buttons show they're working.** Tap "Read this" (or Screenshot, Boost…) and the button lights up and says "Reading…" until it's done. Then it shows ✓, with what Izuki said underneath. It can't be started twice by accident.
- **Esc closes the Island** from anywhere inside it, not just the Ask box.

## 🪟 10 more Windows tweaks (Settings → Windows tweaks)
More pinned apps in Start, no tips or suggested apps in Start, no suggested apps or ads, no tips or ads on the lock screen, hide the Copilot button, no red badges on taskbar icons, no snap layouts pop-up, taskbar on the main screen only, compact File Explorer, and search only your PC (no Bing). Each one is Windows' own setting for your account only, and flipping it back restores Windows' normal value.

Real Windhawk mods (a vertical taskbar, restyling the taskbar itself) work by injecting code into Windows Explorer. Izuki doesn't do that, because it can crash Explorer and set off antivirus and anti-cheat software.
