# Izuki 1.0.183: it stands straight, and it can tell you why it's slow

## 🧍 The character was leaning, and the eyes couldn't see it

You said it best: *"it's posing, not standing straight."* That was literal, and
it was measurable.

Every character was painted from a picture of a person standing for a camera —
weight on one leg, hips and shoulders off the vertical, head level. That last
part is why it kept getting past every check: eye-to-eye the head is straight,
so the figure reads as upright even while the body axis is **3–5° off**. Measured
from Sophie's own silhouette (head mass against feet mass), her idle leans
**3.4°**, and mid-sentence **4.8°**.

Izuki now measures each painting when it loads it — the silhouette's head
against its feet — and turns that lean out at the feet. That covers **all 37
characters** and every painted pose in each, with no redrawing:

| character | measured lean, idle |
|---|---|
| sophie | 3.4°, 3.4°, 2.9°, 3.3°, 2.7° |
| zuri | 4.1°, 3.0°, 3.9°, 5.0°, 3.6°, 5.0° |
| nova | 2.1°, 2.4°, 3.1°, 3.8°, 3.3°, 1.7° |
| jack | 2.5°, 2.8°, 1.3°, 2.1°, 1.6°, 1.8° |

Only small leans are corrected. Past ~8° it's a lean on purpose (a shrug, a
poke), and the walk cycle is left untouched — a walk should lean into the step.

The in-betweens inherit their tilt from the poses they run between, so the body
doesn't snap upright halfway through a transition. And the measurement costs
**77 ms** for a character, not a five-second wait: the first version measured
all 136 pictures and a single GPU read-back of the atlas alone is 2.5 s.

## 🩺 "Why are you so slow?" — now it answers

The one question a model can't reliably answer is *why the models are slow.* So
this one doesn't ask one. It reads its own state:

- which brains are benched, and for exactly how long (*"2 of my 4 brains are
  benched right now: Groq 14s, Gemini 1m 40s"*);
- whether every free tier is resting at once, and that asking again instantly
  can't help while waiting a moment can;
- and **whether a newer Izuki is downloaded and waiting** — the honest first
  answer, because it's usually the real one.

No AI call, no waiting, works with every brain down. It only speaks when the
question is about Izuki itself: *"why is my PC slow"* still goes to a brain.

## ⏳ A look that timed out no longer wastes its remaining 30 seconds

The log had three brains dying at **14.02 s** each — the same few milliseconds —
and the look was thrown away with 31 s of its 45 s budget untouched.

- Screen looks get **20 s** instead of 14. A free vision model on a busy day
  needs 12–18 s just to start describing a picture, and the old cap was killing
  looks that were about to answer.
- When every brain fails for a **temporary** reason — a timeout, a 503, a blip —
  the look now uses the rest of its budget on one more round instead of giving
  up. Once only, and never for a refused key.

## 🧹 Also fixed

- The "What's new" list had the same entry twice (a duplicate from 1.0.181).
  Removed.

## ✅ Verification

- `483 Rust tests passed, 0 failed` (3 new: the second round, the stated wait,
  and the diagnosis only answering the right questions); TypeScript clean.
- The upright correction was checked against the real sprite atlases in a
  browser harness: plumb line through the head and feet afterwards, walk cycle
  unchanged, load 77 ms.

---

Free, as always. No account, no subscription, nothing to pay.
