# Izuki 1.0.33

Ctrl+D works again, much less lag, and faster answers when a brain is down.

## Fixed

- **Ctrl+D lost your mark.** Since 1.0.30, drawing with Ctrl+D held could
  wipe the mark mid-stroke, so letting go showed no text box. The ask box
  appears again as soon as you let go.
- **Lag.** The Island's little animations (music bars, dots, the face) kept
  your graphics card redrawing a full-screen layer about 60 times a second
  whenever a pill was showing — they now only move while the Island is
  open. The Island also stopped re-reading the page in Chrome every 20
  seconds (that slowed Chrome down) and stopped checking every running
  program every 2 seconds.
- **A brain that's turned off no longer slows everything.** If your main
  brain can't be reached (for example a local 9Router that isn't running),
  Izuki skips it for 10 minutes and answers with your other brains straight
  away — every look and every chat message used to wait on it first.

## Smoother

- **Jarvis mode shows nothing when it clicks** — no hand, no box. It just
  happens.
- **Type "ans" (or "answer", "what's the answer") on a quiz** and Izuki
  answers the question on your screen — no "answer what?".
- **The Hologram face and Stardust stay visible on white screens** — they
  sit on a soft dark field, like a hologram projector's.
