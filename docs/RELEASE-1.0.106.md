# Izuki 1.0.106: play games with your hand, and grab things

## Game controls 🎮
Settings → Air control → **Game controls**, or just say "turn on game controls" ("game mode off" to stop). Your hand becomes a game controller:
- **Lean it** left, right, up or down from the middle of the camera to hold those keys. Pick **Arrow keys** or **W A S D**.
- **Pinch** (thumb + pointing finger) to hold **Space**, for jump or fire.
- **Thumb + ring finger** taps **Enter**.
- **A fist** still pauses.

It works in most simple PC and browser games. The ring shows which way you're leaning and which keys are held, for example "🎮 ← Space". Your mouse pointer stays where it is.

**Keys never get stuck:**
- They let go the moment your hand leaves the camera, you pause, you switch game controls off, or you turn Air control off.
- If you switch to another window, the PC lets go of every held key, so a game key never carries into another app.
- A key that fails to let go is tried again.

## Grab things ✊
With Air control on, **pinch on your character or the orb and move your hand**. It comes along, just like dragging it with the mouse. Open your fingers to put it down.

## Tested
- **Game controls:** with a fake camera, a swaying hand held and released the right and left arrows in step with it, and the PC's pointer never moved.
- **Tests:** 261 Rust tests and 18 Air voice-command checks (now including "game mode on/off") pass, as do the build, phone and page tests.
- **CodeRabbit:** 6 findings fixed (no stuck keys or drags in any of the cases above). One was skipped: it asked to move key holds off the main thread, but they stay there on purpose, like Air control's clicks, so they always happen in order, and each takes microseconds.
