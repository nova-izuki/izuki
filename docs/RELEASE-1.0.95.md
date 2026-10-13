# Izuki 1.0.95: Air control finds your hand

## Hand tracking now starts every time
In 1.0.94 the camera turned on, but the hand tracker behind it never finished loading on some PCs, so the pointer never moved. It was loading on the graphics chip. On this kind of laptop that took 25 seconds or never finished, and when it did load it didn't find a hand.

Air control now runs hand tracking on the processor. It was tested end to end with a fake camera showing a real hand:
- **Fast to load:** the hand model was ready in about 5 seconds (10 in a slow test browser).
- **Hand found quickly:** the hand was found about 2 seconds after loading.
- **Pointer moves:** the white ring followed the hand, and the guided test ticked its first two steps by itself.

## It never just waits any more
- **Time limits:** every loading step has one, and if it runs out you see what went wrong instead of a frozen "Starting…".
- **Camera with no picture:** if the camera is on but sends no picture for 10 seconds, Air control tells you and suggests picking another camera.
- **Overlay paused by Windows:** if Windows stops refreshing Izuki's overlay, hand tracking switches to a timer and keeps going.
- **More detail in the log:** each loading step and how long it took goes into the log.

## Reviewed
CodeRabbit reviewed it: 2 findings fixed.
