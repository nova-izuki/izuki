# Izuki 1.0.178: fewer tokens, more looks, and it remembers what it owes you

## ⚡ Why the free AI kept saying "busy" — and why that made everything slow

Groq's free tier allows **7,000 tokens a minute**. One look at a 1920×1080
screen was **~3,700 tokens for the picture alone** — over half the whole
allowance before a single word of page text or controls. So the first look
used the minute up, the next request was refused ("free AI's busy"), and
Izuki waited out a rate limit it had caused itself.

When a brain's allowance is tight, the request now goes out **leaner: the
screenshot is scaled to 1280 wide** (≈1,230 tokens instead of ≈3,700). The
close-up path already exists for small print, and every coordinate is mapped
through the image size, so clicks still land where they should.

Measured in a unit test this release: **a 1920×1080 look drops from 2,764 to
1,228 picture tokens — 2.25× less** — which is roughly three looks per minute
on that free tier instead of one, and fewer bytes to upload each time.

The page text in a lean look is already capped at 1,500 characters; controls,
the ask and the answer budget are untouched.

## 🔔 It tells you what it still owes you

When the internet came back, Izuki said "Internet's back" — and that was it.
Anything the outage had interrupted stayed interrupted unless you remembered
to say "keep going".

Now, if a task stopped unfinished in the last half hour, coming back online
says **which** task: *"Internet's back — I still owe you the rest of 'finish
Part 4 of the assignment'. Say keep going and I'll pick it up where I
stopped."* It asks rather than acting on its own: nobody wants an agent that
resumes clicking through their screen unprompted.

## 🔧 Also in this release

- Nothing else changed. One speed fix and one memory fix.

---

Free, as always. No account, no subscription, nothing to pay.
