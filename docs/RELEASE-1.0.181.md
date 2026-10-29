# Izuki 1.0.181: it stops accusing itself of being rate-limited

## 🚫 "Rate-limiting you — try again in 1s" — while it had a whole minute free

1.0.178 taught Izuki each free AI's per-minute allowance, so it could skip a
brain that would only refuse. The bookkeeping had two holes, and both made it
refuse an AI that was completely idle.

**A send from an hour ago counted as this minute's.** The "what has been sent"
list was summed without first dropping entries older than a minute, so any
*previous* look still counted against the allowance. The first look after a
pause was refused with *"try again in 1s"* — while the allowance was empty. On
a free tier that is the difference between a working brain and a skipped one.

**A failed request stayed charged.** Tokens were booked *before* the call and
only returned on a refusal. A request that timed out — the log has Gemini and
NVIDIA both dying at exactly 14.0 s — kept its tokens for the full minute, so
the *next* look refused itself with "rate-limiting you" when the internet had
merely hiccuped. Nothing came back, so nothing was spent: every failed call now
returns its tokens.

Together: fewer false "the free AI's busy" messages, and the free brains are
actually asked when they have room.

## ✅ Verification

- `478 Rust tests passed, 0 failed`, including a new one that records a send
  90 seconds old and asserts it can no longer block a fresh look (and that a
  send from ten seconds ago still does).
- TypeScript clean.

---

Free, as always. No account, no subscription, nothing to pay.
