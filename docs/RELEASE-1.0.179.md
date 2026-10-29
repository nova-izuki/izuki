# Izuki 1.0.179: it waits out a busy free AI instead of quitting on it

## ⏳ The task that died 21 seconds into a 22-second wait

This one is from the owner's own log, second by second:

```
17:23:21  round 3 try 1 failed: All your AI brains are busy right now…
17:23:27  round 3 try 2 failed: No suitable screen brain is available
17:23:27  giving up for now
```

Groq had said, in its own words, **"try again in 22.457s"**. Izuki retried
after three seconds, hit the same wall, and then — because the message it got
back read *"configured models may be resting or too small for screen
control"* — the retry loop decided the trouble was permanent. That phrase
matched nothing on the list of things worth retrying, so the budget dropped
from five tries to two and the whole task was thrown away **21 seconds into a
22-second wait**. The owner pressed Esc three seconds later.

Two fixes, both in the retry path:

- When every free model is resting, the message now names the real cause and
  the real number: *"Every free AI I have is rate limited for another 22s —
  I'll wait for the first one back."* That reads as temporary, so the five
  tries stay.
- The wait is no longer a blind `3 s × attempt`. It asks the brain pool when
  the **first** model comes back and waits exactly that long (one second of
  slack), with a total budget of 90 seconds per task. Waiting one minute to
  finish your assignment beats throwing it away in twenty seconds.

A setting that genuinely needs fixing (no vision model at all) still fails
fast with its own message instead of burning five tries.

## 🖱️ Why steps missed buttons

The log also shows, on round after round:

```
the window was slow to list its controls — going by the picture
screen controls: 23, page text: 0 chars, in 2475 ms
```

Reading a window's buttons is capped at 2.5 s. But the control list and the
page's text were joined into **one** message: a look waited for both, and when
the wait ran out it threw *both* away — including a control list that had
finished in 900 ms. With no numbered buttons, the brain had only a picture to
guess from, which is exactly how a step lands on the wrong thing.

The two are now separate messages. The control list is used the moment it is
ready; the page text gets a short 400 ms slice of its own and can never delay
or discard it. On the trace above that is ~1 s of prep instead of 2.5 s, and a
real button list every round.

## 🔧 Also in this release

- `soonest_wake()` — the brain pool can now be asked how long until its first
  model is free again, instead of only "is anything awake".
- Two new tests: the rate-limit message must read as temporary (and a setup
  problem must not), and the pool must report the *soonest* model back
  (5 s), not the slowest (40 s).

## ✅ Verification

- `478 Rust tests passed, 0 failed` (476 before, plus the two above).
- TypeScript: clean (`tsc --noEmit`).
- Crash check: no `izuki.exe` fault in the Windows event log since 1.0.175 —
  the 16 MB stack fix from 1.0.177 is holding.

---

Free, as always. No account, no subscription, nothing to pay.
