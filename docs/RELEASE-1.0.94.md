# Izuki 1.0.94: Air control's camera fixed, steadier characters, and Quit always quits

## Air control turns the camera on
The camera never came on for Air control, with no light and no error. Windows asked "allow camera?" in a box on Izuki's invisible overlay, where it couldn't be seen or clicked, so Air control waited forever. Izuki's own windows now get the camera automatically, the same way they already got the microphone. The Island's camera had the same problem and is fixed too.

Also:
- **Never stuck waiting:** if a camera doesn't answer within 12 seconds, it says so instead of waiting.
- **Graphics chip fallback:** if hand tracking on the graphics chip never finds a hand within 20 seconds while camera frames are coming in, it switches to the processor by itself. Some graphics chips run the hand model but never see a hand.
- **A clearer log:** Air control writes what it's doing every 30 seconds (looks per second, camera frames, hand seen or not), so any remaining problem shows up.

## Your external webcam in the list
Settings → Air control → Camera now shows every camera by name (the Logitech, the built-in one, virtual ones), with a ↻ button to look again.
- **Switch at once:** changing camera takes effect right away.
- **Pick while testing:** there's also a camera picker in the guided test.
- **Plug and play:** plugging a webcam in or out switches to the best one. Changing your headset or microphone doesn't restart it.

## Characters: whole heads, no twitching
- **Whole heads:** some characters' thinking and typing poses were drawn bigger than the rest, so their heads got cut off. Every move is now the same height, with more room above the head.
- **No twitching:**
  - Each frame is lined up on the middle of the body, not the feet, which moved with every step and gesture.
  - Talking holds through the little pauses between words instead of flipping between talking and standing many times a second.

## "Walk to my Chrome"
With a moving character picked, say or type "walk to my Chrome" (or Spotify, Word, any open app). Your character walks over to that window and points at it. "Go to YouTube" still opens YouTube when there's no YouTube window open.

## Quit always quits
"Quit Izuki" did nothing on some PCs: closing restores other apps' sound first, and that could hang on a busy PC. Quit now always finishes. If the tidy close takes more than 2 seconds, Izuki ends anyway, after putting the sound back.

## Reviewed
CodeRabbit reviewed it: 3 findings fixed.
