# Izuki 1.0.93: Air control with a guided test, a floating keyboard and a pen

## See it working: a guided test
The first time Air control turns on, a guide opens (or start it from Settings → Air control → **Start the test**):
- **What your camera sees**, mirrored, with your hand's outline drawn on it the moment it's found. If nothing is drawn, it says what to check: the right camera, light on your hand, not too far away.
- **Five steps that tick themselves off:** show your hand, move it (the ring follows), pinch the **Pinch me** button, scroll with two fingers, and make a fist to pause.
- **It also shows** which camera it's using, whether tracking runs on the graphics chip or the processor, and how many looks a second it takes.

## Your hand is found more easily
Air control now looks at sharper pictures (640×480 instead of 320×240). A hand at arm's length was too small before, especially on webcams like the Logitech C270. It's also a little more willing to call something a hand.

## Hands-free typing: a floating keyboard
A round **⌨️** button sits by the bottom-left while Air control is on. It opens a floating keyboard you type on with pinches, VR-headset style:
- Every key goes into the box you were typing in.
- Drag it by its bar, and use **−/+** to make it smaller or bigger.
- **#+=** switches to symbols.
- **🎤** lets you just say what to type, or ask for it to be written ("reply that I'll be there at 6"). It's typed in, never sent.

## A pen in the air
The **✏️** button opens Izuki's draw mode. Hold a pinch and move your hand to draw, then ask Izuki about what you circled.

## Easier to fix if something's wrong
Air control now writes what it's doing to Izuki's log: which camera, which engine, the first hand it sees, and when it switches itself off (after 10 minutes without a hand). If it doesn't work on a PC, the reason shows up there.

## Reviewed
CodeRabbit reviewed it: 3 findings fixed.
