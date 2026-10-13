# Izuki 1.0.102: Air control keeps up with your hand

## Why the dots trailed behind your hand
Your log and tests on your laptop showed two problems, each slowing it down:
1. **Windows throttling.** The browser engine inside Izuki thought the see-through overlay was hidden, so it slowed its screen refresh, camera picture and timers to about once a second. The log said "screen refresh paused".
2. **The processor is slow at hand tracking on this laptop.** Each look at your hand took 260–310 ms, so at most about 3 looks a second.

Together that meant 1–7 looks a second. The ring and the dots were always showing where your hand had been.

## What changed
- **The graphics chip, on its own thread.** Hand tracking now runs on the graphics chip, about 35 ms per look, in a background worker. Its slow first-time setup (10–20 s) happens there, so nothing on screen freezes while it gets ready. If the graphics chip can't run it, the processor takes over as before.
- **Every new camera picture, never an old one.** Air control reads the camera directly. If tracking is busy, it skips ahead to the newest picture instead of building a queue.
- **No more throttling.** Izuki's windows tell the browser engine not to slow them down.
- **Smoothing that doesn't lag.** A still hand is steadied, but a moving hand goes straight through. Before, quick moves were smoothed as heavily as a still hand, so the ring trailed behind.

Measured on your laptop with a test camera (15 pictures a second): **every picture was looked at, about 35–80 ms each**, against 1–7 looks a second before. A normal webcam sends 30 pictures a second.

## Fast, Balanced or Precision
Settings → Air control → How it follows your hand:
- **Fast:** keeps right up with quick moves.
- **Balanced:** the default, quick and steady.
- **Precision:** finer, slower movement for small buttons.

## A clear, step-by-step guide
"Start the test" is rebuilt:
- **One step at a time,** with a progress bar ("Step 3 of 6").
- **Plain words** for which fingers to use, and a little moving picture of the gesture.
- **Live feedback:** what Izuki sees your hand doing right now, for example "Thumb and pointing finger apart", then "Closer…", then "Pinched! ✓".
- **Back, Try again and Skip** on every step.
- **The dots sit on your fingers:** the camera view shows the exact picture your hand was found in.

The six steps: show your hand, move the ring, pinch to click, pinch and hold to drag, peace-sign scroll, and fist to pause.

## Also inside (no settings screen yet)
The groundwork for Windows tweaks (Windhawk-style): taskbar on the left, seconds on the clock, the full right-click menu and more. The switches come in a later update.

## Reviewed
- **Tests:** 260 Rust tests pass. Tracking was tested end to end with a fake camera showing a real hand, on your laptop's graphics chip.
- **CodeRabbit:** 4 findings fixed.
