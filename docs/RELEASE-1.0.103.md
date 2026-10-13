# Izuki 1.0.103: every Air gesture fixed, gestures you choose, talking characters, Windows tweaks

## Air control: the gestures, fixed
- **Pinching Izuki's own buttons works.** The guided test's "Pinch me" button, the air keyboard and the other panels used to miss. Pinching them now presses them directly. A Windows click went straight through the see-through overlay, and the highlight box snapped your pinch to whatever app sat behind the panel.
- **Pinching is easier.** Your fingertips don't have to touch exactly, and once pinched it holds through a drag.
- **Right-click works.** Thumb + middle finger often turned into a left click because the pointing finger was close too. Now the fingertip your thumb is nearest decides.
- **The peace-sign scroll is forgiving.** A half-bent ring or little finger no longer breaks it, it holds through a flickery moment, and it no longer jumps when your hand comes back after leaving the camera.
- **No more surprise pauses.** Only a real fist counts, with every fingertip folded into your palm. You hold it a full second, and "Hold to pause…" shows by the ring first. A fist again carries on.
- **No accidental "Back".** A quick move across the screen no longer counts as the flick that goes back a page. A flick has to be fast, level and open-handed.
- **Taught gestures only fire when held still,** so moving around never sets one off or freezes the ring.
- **The ring and box show on any screen.** A dark edge under the white ring and the blue box keeps them visible on bright pages too.
- **The keyboard comes up by itself** when you pinch-click (or point at) a box you can type in.
- **Picked buttons light up.** Fast / Balanced / Precision, and every other set of pill buttons, now clearly show which one you chose.

## Your gestures, your way
Settings → Air control → What your quick gestures do lets you set thumb + middle, thumb + ring, thumb + little finger, flick left and flick right to any of 26 actions: right-click, copy, paste, undo, screenshot, play/pause, next song, volume, new tab, switch window and more.

You can also just say it:
- "Hey Nova, make my pinky pinch take a screenshot."
- "Change my middle finger gesture to undo."
- "Set air control to precision."
- "Reset my air gestures."
- "What do my air gestures do?"

## Say it, it's written well
Point at a text box and say what to type. Izuki fixes the grammar, spelling and punctuation first, using your own words with nothing added.
- **Left as said:** short phrases, web addresses, emails and code.
- **Never stuck waiting:** if the AI is slow, your words go in as heard.

## Characters that talk and blink
- **A real talking mouth.** The moving characters open their mouths with every syllable of Izuki's actual voice, painted in their own lip colour at the right spot.
- **Natural blinks.** They blink every few seconds at random, now and then twice. Captain Salty's eye patch is left alone.
- **Gestures follow the words.** They change gesture as each new phrase begins, instead of on a timer.

This works on all 37 characters: the face was found in every frame, except side-on walking, where it isn't needed.

## Windows tweaks and Island looks
- **Settings → Windows tweaks.** Each one is a switch, read live from Windows:
  - taskbar icons on the left, or hide the taskbar
  - seconds on the clock
  - "End task" on the taskbar's right-click menu
  - hide the Task view button or the search box
  - the full right-click menu
  - show file extensions or hidden files
  - dark mode everywhere
  - turn off see-through effects
- **Safe to try.** Only your own settings change, no admin needed, and each switch flips back.
- **Island look.** In Draw → Talk to Izuki, pick Default, Glass, Bubble, Squircle, Neon outline or Aero (classic). They're all static, so they don't slow anything down.

## The talk key
If a listen was left running with no conversation open, pressing Ctrl+Win+Space did nothing (it was taken as "stop listening"). Now it starts listening fresh. Every press of the talk key is also logged, so any remaining problem shows up.

## Reviewed
- **Tests:** 260 Rust tests, 14 new Air voice-command checks and 35 conversation checks, all passing. The build and the phone, companion and page tests pass too.
- **Checked end to end** with a fake camera showing a real hand, and by drawing the talking mouth and blinks on real character frames.
- **CodeRabbit:** 2 findings fixed.
