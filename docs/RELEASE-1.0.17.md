# Izuki 1.0.17 - real-time teaching, with a steadier pen

This release fixes the classroom flow so an explanation feels like a short,
useful teaching moment instead of a disappearing annotation.

## Video classroom

- Teaching marks remain on screen until Izuki has finished the spoken
  explanation; they are then cleared cleanly.
- A paused video only resumes after the explanation has completed.
- Izuki now allows at most two marks per explanation, accepts only marks whose
  source coordinates are inside the captured video frame, and clamps the
  rendered ink to the visible desktop.
- The prompt tells Izuki to identify one exact visible idea, point only at a
  readable caption or object, and leave the screen unmarked when the frame is
  not clear enough.
- **Teach in real time** checks a foreground, playing HTML5 video about every
  30 seconds, for at most eight explanations or 12 minutes. It backs off while
  the player is paused, unfocused, or Izuki is already busy, so it does not
  spam requests.

## Precision controls

Precision/Jarvis-style controls continue to choose a live Windows UI control,
verify that it has not moved, and prefer a direct accessibility action over a
raw mouse click. If that proof is unavailable, Izuki stops and asks for a new
look rather than guessing at an answer.
