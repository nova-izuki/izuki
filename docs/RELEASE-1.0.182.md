# Izuki 1.0.182: it stands straight, and it stops benching its own brains

## 🧍 The character was swaying, not standing

Standing still, your character leaned back and forth by 0.0055 radians — about a
third of a degree — on a 7.3-second loop, forever. That is far too small to read
as a movement and far too constant to read as standing: the eyes catch it as
"that thing is not upright". A standing figure now has no lean at all. The only
lean left is the one a walk needs, into the step.

## 🔍 Why it went blurry when you zoomed

Two separate causes, both in how it is drawn:

- **A scale cap.** Both character canvases capped the pixel scale at 2×. On a
  250% Windows display the browser then stretched a 2× picture to 2.5× — and a
  stretched bitmap is a blurry one. They now use the display's real scale.
- **Filtering.** The paintings are 300 px tall, so anything larger is an
  upscale. The canvas was filtering them at the default low quality; it now
  uses high-quality filtering, which keeps edges clean when it has to grow.

What is left is honest: the sprite art itself is 300 px per pose, so a
character zoomed past ~300 device pixels has no more detail to show. Sharper
than that needs new art at 2×, not a code change.

## ⏱️ It stopped benching a brain for twice as long as it asked

When a provider names its own window — Groq: *"Please try again in 15s"* — that
is the answer, but every 429 was doubled by the backoff, so 15 seconds became a
30-second rest. The log has exactly that sequence. A stated wait is now
honoured as stated; only a rate limit with no stated time still backs off.

The wait screen had a matching blind spot: it only knew about the free
OpenRouter models going to sleep, not a whole provider resting. So a 22-second
Groq window showed the old *"give me a second"* line, retried after three
seconds, hit the same wall, and made the rest longer. The wait now looks at both
and uses whichever brain comes back first.

## ✅ Verification

- `480 Rust tests passed, 0 failed` (two new: a stated wait is not doubled; a
  brain that is out for hours is not waited for). TypeScript clean.
- Diagnosis was taken from the live log, not from guessing: `resting Groq for
  22 s` followed by `resting Groq for 30 s` ninety seconds later.

---

Free, as always. No account, no subscription, nothing to pay.
