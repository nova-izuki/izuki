# Izuki 1.0.158: "yes" in your own words

## 👍 Izuki offered to connect FL Studio, you said yes, and it went clicking FL's menus instead
**The problem:** Izuki asked "Want me to connect it now? Say yes". Your answer wasn't a textbook "yes", so Izuki didn't hear it as one, and the request went to the screen helper. The helper clicked around FL's MIDI settings trying "master sync". Every one of those clicks was blocked by Izuki's safety checks, so nothing in FL changed, but the setup never ran.

This wasn't only FL. Every offer Izuki makes ("your drive's nearly full — want me to look?") only heard formal yeses ("yes", "sure, go ahead", "ok do it").

**What changed:**
- **Yes in everyday words:** "yea bro", "yuh", "yesss", "bet, run it", "for sure", "let's go", "of course", "sounds good", "why not", "aight bet", "yessir", "ofc", "sure thing", "ok connect it", "yeah set it up". Stretched words ("yeaaa", "lets gooo") count too.
- **Not a yes:**
  - "let me think", "go away", "not now", "yeah, not now", "yes?" (a question back)
  - "yes but first open Spotify" (something else)
  - "set an alarm", "run chrome", "connect my keyboard"
- **A yes that reaches the screen helper anyway is still the yes.** For example, a yes typed in the Chat tab while Izuki's FL offer is still open now runs the setup instead of clicking.
- **The Chat tab hears yeses too.** A short yes typed there is checked against Izuki's offers first, as it already was from voice and the Island. This happens even with Deep or Code mode switched on.

**How it was checked:**
- **Tests** cover all the yeses and not-yeses above, plus the old cases.
- **Your real run** (log, 2026-10-22 00:58) shows the reply went straight to the screen helper with no offer match; that's the path fixed here.

**Limits:** a long reply (more than 6 words) isn't taken as a yes; say "set up FL Studio" instead.
