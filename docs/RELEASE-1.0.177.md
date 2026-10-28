# Izuki 1.0.177: it stops giving up, and stops crashing

Four bugs, all found in this PC's own log rather than guessed at.

## 💥 The crash: `thread 'tokio-rt-worker' has overflowed its stack`

That line is in `%APPDATA%\Izuki\logs\izuki.log`, one second after a session
started, in 1.0.175. A stack overflow is not a normal error — Windows kills
the process on the spot, so there is nothing to catch and no "sorry" message.

A look at the screen builds a big prompt and walks a page's HTML, and that work
runs on a background worker with a **2 MB** stack. It now runs on **16 MB**.
That is virtual memory: only the part actually used costs anything, and this
class of crash cannot reach the app any more.

## 🛑 A task used to be thrown away after two tries

The agent loop gave a whole task **two attempts, six seconds apart**, then
stopped with "The free AI's maxed out — say *keep going* in a minute". On a
flaky campus network, that is one DNS blip away from losing an assignment
half-finished — which is exactly what the log shows happening.

Now:

- **Five attempts** for trouble that can pass (a busy free tier, a timeout, a
  connection reset). A rejected key or a wrong model still fails fast, because
  retrying those only makes you wait for the same failure.
- **A dropped connection is waited *for*, not counted as an attempt.** If the
  PC is offline, Izuki watches for the network to come back for up to 90
  seconds and then carries on with the same task — instead of telling you it
  will "finish it when the internet is back" and never doing it.
- The spoken line matches the real cause: *"Your internet blipped — waiting
  for it to come back"* when it is the network, *"The free AI's busy"* when it
  is a rate limit.

## 📶 The false "your internet dropped"

Your connection was fine. Chrome was loading, and Izuki still announced "Your
internet just dropped."

The check behind it was raw IP probes: `1.1.1.1:443` and `8.8.8.8:53`. Campus,
school and filtered networks block exactly those while every normal site loads.
Izuki then decided it was offline, dropped **every cloud AI** ("only brains on
this PC can answer"), and started answering "I couldn't reach the AI" — while
Discord, the browser and its own updater were all working.

It now pings public DNS first (fast, and right on most home networks) and, if
that fails, connects to the AI hosts it actually uses. Those being reachable is
the honest test.

It also waits longer before saying anything: **three failed checks (90
seconds)**, not two, and says it once.

## 🧠 The other half of the same mistake

When no AI could answer, Izuki said "that's usually the internet." On a school
network that blocks the AI service, that sends you to restart Wi-Fi that was
never broken. It now says it may be your internet **or this network blocking
it**, and suggests switching networks.

## 🔧 Also in this release

- No new features. Four fixes only, so it is easy to tell whether they helped.

---

Free, as always. No account, no subscription, nothing to pay.
