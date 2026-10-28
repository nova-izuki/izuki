# Izuki 1.0.176: the whole PC by voice — and the clock answers itself

## 🖥️ Voice OS, not just volume keys

The everyday commands already covered scrolling, media and tabs. This adds the
rest of the machine, in the same zero-AI path: the words are recognised locally,
run immediately, and there is no model to wait for or get wrong.

- **“Set the volume to 30.”** A level, not a nudge. Eleven presses of the volume
  key land wherever they land; this sets the actual Windows volume — 0 to 100,
  “half volume”, “max volume”, “volume 30 percent”. “Volume up”, “louder” and
  “mute” stay nudges, exactly as before.
- **“Snap left.”** “Snap right”, “put it on the left half” — the window in front
  goes to that half of the screen.
- **“Lock my pc.”** The lock screen, not sign-out: nothing is closed, and
  everything is where you left it when you come back.
- **“Take a screenshot.”** Opens Windows' own snipping tool, so you pick the
  part you want instead of getting a full-screen grab you have to crop.
- **“Open task manager.”**
- **“What time is it?”** and **“What's the date?”** / **“What day is it?”** —
  answered from the clock on the PC.
- **“How much battery is left?”** / **“Am I charging?”** — read from Windows,
  and a desktop without a battery says so rather than inventing a number.

Nothing here costs a request, works with no internet, and can't be mangled by a
model. The reply is spoken the same way as every other answer.

## ⏱️ The clock answers without a round trip

“What time is it” used to be a full AI request — a second or two, and one of the
minute's free requests — to read a clock the PC is already holding. It is now
answered locally, in the same instant the command is recognised, with the time
said the way a person says it (“It's 3:42 PM”, not “15:42”).

## 🔧 Fixed along the way

- The volume is read back from Windows, so if the PC's audio stack won't answer
  Izuki says it didn't work instead of leaving the volume somewhere unknown.
- The volume parser refuses a nudge (“volume down”) instead of guessing a number
  for it, so a phrase that used to step the volume never jumps it.
- “Set the volume to 30 and open Spotify” is two jobs, so it goes to the brain
  whole — the first half is never done silently while the rest is ignored.

---

Free, as always. No account, no subscription, nothing to pay.
