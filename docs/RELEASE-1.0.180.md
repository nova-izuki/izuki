# Izuki 1.0.180: it tells you how long the wait really is

## 🕒 "Give me a second" — while it waited twenty-three

1.0.179 started waiting for a rate-limited free AI instead of throwing the
task away. That fix brought a small lie with it: the line stayed *"The free
AI's busy — give me a second"* while the wait could be twenty-three seconds.
Told a second, shown a long silence, you press Esc — which is exactly what the
log shows happening.

Three changes, all in the same place:

- **The number is said out loud.** When the first free model is more than a
  few seconds away, the line becomes *"The free AI is rate limited for another
  23s — waiting for it."* Under eight seconds it keeps the short version.
- **A countdown while it waits.** The status line now ticks down (*"Waiting
  for a free AI brain — 18s"*), so a long wait reads as work in progress
  rather than a frozen app.
- **The wait never exceeds its budget.** Still 90 seconds per task in total,
  split across tries, so a daily limit that resets in an hour fails honestly
  instead of stalling the app.

## ✅ Verification

- `478 Rust tests passed, 0 failed`; TypeScript clean.
- 1.0.179 itself is published and confirmed: 9 assets, `latest.json` pointing
  at 1.0.179 for both Windows and Linux.

---

Free, as always. No account, no subscription, nothing to pay.
