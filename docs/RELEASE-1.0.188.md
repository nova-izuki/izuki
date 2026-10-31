# Izuki 1.0.188: the browser panel stops guessing

## 🎯 Three ways the panel was quietly wrong

All three were in the panel that hands your question to another AI's tab, and
all three could make the panel say something that wasn't true.

**It moved your conversation without asking.** Two ChatGPT tabs look identical
to a program: same site, same origin. If the tab you pressed Connect on had
closed, the next question was typed into whichever tab happened to be first —
a different conversation, chosen by nobody. It now asks again instead of
guessing: *"The tab you connected is gone or no longer first. Press Connect to
choose which tab answers."* Refreshing the tab list can no longer carry a live
connection somewhere else either.

**It said "handed over" when the question never arrived.** Some of these sites
rebuild their message box from their own state and throw away anything typed
into it directly. The panel would fire its typing events, assume they worked,
and press Send — an empty message sent, your question gone, and a panel that
looked like it had worked. It now reads back what's actually in the box (twice,
with a moment for the slow editors), types it in again if the paste didn't
take, and if the words still aren't there it says so: *"…'s message box
wouldn't take the question — nothing was sent."* Send is never pressed on an
empty box.

**"Press Esc or Stop" didn't stop anything.** While a task ran on your PC the
panel told you Esc ends it. Esc did nothing — and only worked at all when the
cursor was in the question box. Esc now stops a running task from anywhere in
the panel, clears the Stop button, and says that it stopped.

## 📦 The download that kept saying 1.0.0

The extension zip had a folder inside it, so Windows' **Extract All** produced
`izuki-extension\izuki-extension\manifest.json` — one level too deep, which
Chrome refuses with *"Manifest file is missing or unreadable"*. Extracting a
second download instead made `izuki-extension (1)`, so the browser quietly
kept running the first copy while Izuki said "your extension is an older
version (1.0.0)" every day, and Reload could never change it.

The zip now has its files at the root, so extracting it makes a folder that
**is** the extension, and extracting a newer download over the same folder is
a real update instead of a second copy — the step that was silently failing.

## ↩️ Try again

A failed question now has a **Try again** button next to the reason. Most of
these failures are a busy tab or a page that moved, and retyping the whole
question to find out is a waste of your time.

## ✅ Verification

- `npm run test:panel` — 10 assistants, composer handoff, every control wired,
  every route served.
- `test:panel-browser` — the real panel modules in a real browser: scoped
  cancel, stale-answer rejection, one history pair, unshared page privacy,
  custom-AI handoff, question dedupe, navigation pause, visible task review and
  token handoff — plus three new checks for this release.
- Each new check was proved by putting the bug back: removing the retarget
  guard fails the run, removing the empty-send guard fails the run, and both
  pass again once restored.
- The extension is 1.5.2; the app now tells an older copy it's out of date.

---

Free, as always. No account, no subscription, nothing to pay.
