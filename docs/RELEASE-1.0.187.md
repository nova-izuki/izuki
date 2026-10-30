# Izuki 1.0.187: it reads the apps that keep their words to themselves

## 👓 "I can't actually see an error on screen"

That's what it told you at 2:00 PM, and the log says why:

```
[brain] screen controls: 17 in 967 ms
[brain] page text: 0 chars, in 967 ms
[agent] round 1: 0 step(s) — I can't actually see an error on screen…
```

Seventeen buttons, **zero words**. The window in front kept its text to
itself. Chromium and Electron apps — VS Code, Discord, Slack, and the very
window it was asked about — can hand Windows a document with no readable text
at all. Izuki had a row of button labels and a picture, so the only honest
answer left was that it couldn't see anything.

Now, when a window gives almost no text, Izuki reads the words off **the same
picture the brain was already being shown**, using the OCR engine Windows
ships. It is local: no upload, no new data leaving the PC — it is the
screenshot it was already sending, read as text.

Four things keep it honest:

- **A window that shares its page keeps it.** The picture is only used when it
  says *more* than the window did, so a stray "File Edit View" can never
  replace a document that was read properly.
- **It reads the frozen frame** when the overlay took one, so the words match
  the picture exactly — and Izuki's own overlay can never end up in the text.
- **It says so while it happens**: *"Read your screen — that app wouldn't share
  its words, so I read the picture."* A look that takes a few hundred
  milliseconds longer with good results otherwise reads as a bug.
- **Only that case waits longer.** Reading the text gets 700 ms instead of 400,
  and only when the fallback is running — an ordinary page still arrives with
  no pause at all.

## 🍎 The iPhone build number stops drifting

The version bump now updates the iOS `MARKETING_VERSION` and
`CURRENT_PROJECT_VERSION` in both build configurations, and refuses to run if
they've drifted from Android's. 1.0.186 had to correct a stale iPhone build
number by hand; this makes that impossible to forget again.

## ✅ Verification

- Native suite: **500 passed, 0 failed** (1 new test).
- The new test checks the rule that matters: words read off the picture are
  used when the window gave none, a real page is never replaced by a menu
  strip, and punctuation doesn't make an empty window look talkative.
- `npx tsc --noEmit`: clean.
- The fallback itself needs a window that refuses to hand over text, which
  only exists on a running desktop — it reports itself in the log
  (`the window gave no words — read the screen's picture instead: N chars in
  M ms`) and on the status line, so the next look at an Electron app proves it.

---

Free, as always. No account, no subscription, nothing to pay.
