# Izuki 1.0.100: Air control really turns on

## The real reason Air control never worked
Air control was only switched on while you were drawing on the screen. The overlay's usual mode (the floating hand, the Island, the orb) took a different path that never included it. So turning it on did nothing: no camera light, no pointer, not even a line in the log. That's why it failed with both your webcams. It was never your PC or your camera.

Air control now runs on its own, whatever the overlay is doing. Tested: with only the setting on, it opened a fake camera showing a hand, found the hand, and moved the pointer.

## Smooth characters, or retro
- **Held poses:** the characters used to flick through their poses 6–7 times a second, which looked like twitching. Now they hold each gesture about a second while talking (several seconds while resting), blend smoothly into the next, and breathe gently in between.
- **Walking:** it's still a real step-by-step walk cycle.
- **Retro game:** prefer the old flick-book look? Pick Movement: Retro game next to the pet choice.

## Voices show the new characters
With one of the new moving characters picked, each voice in Draw → Voice shows its painted face. Picking a voice switches to that voice's own character, and never back to the old drawings, which used to happen. All 37 voices have a character.

## Shortcuts and steps
- **Settings shortcut row:** it now has Air control and Glow. Mate is gone, since that feature was removed.
- **Draw tab:** it now spells out how to draw, step by step, including the quick way (hold Ctrl+D) and drawing with your hand.

## Reviewed
- **Tests:** 257 Rust tests, the build and the companion tests all pass.
- **CodeRabbit:** 7 findings fixed.
