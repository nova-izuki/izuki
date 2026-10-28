# Izuki 1.0.175: the clicking gets fixed, search starts working, and a dead shortcut comes back

## 🖱️ Nine things that were going wrong when Izuki acts

Every one of these came out of the log of real sessions, not a hunch.

**It waited for you politely, then threw the work away.** Brush the trackpad while Izuki is working and it stops to let you have the mouse — correct. But when you paused, it binned the click it was about to make and took a whole fresh look at the screen: ten seconds, and a sixth of a minute's free AI allowance, because a palm touched the pad. It now picks up exactly where it left off, as long as the same window is still in front. (The click itself is re-checked against Windows a moment before it happens, so nothing is clicked blind.)

**It went round in circles for over a minute.** On a quiz page the agent spent seven rounds re-reading the same four answers — "let's check option C", "and option D" — each round a full look at the screen. Every round *did* something, so every check Izuki had was satisfied. Doing what you've already done isn't progress: after three rounds of pure repetition it now stops and says it's going in circles instead of grinding.

**A button called "X" could never be clicked.** One-character names — the close ✕, a +, a ▶ — can't be searched for by name, so Izuki's safety check came back "I can't verify this" and refused, every round, forever, at a button that was right there. Those are now checked by position instead.

**"Scroll down" sometimes scrolled nothing.** When there was no usable window in front, it turned the wheel at coordinate 0,0 — the very corner of the screen, where the wheel reaches nothing at all. It now scrolls over the window, or where your pointer is, or the middle of the screen. Never the corner.

**The warm-up that was meant to make it faster was doing nothing.** Izuki reads the window's buttons ahead of time while you type, so pressing Enter doesn't have to wait for it. That reading takes about a second — but the result was only accepted if it was under half a second old, so it was stale the moment it finished and got thrown away and done again, every time. It was costing the second and saving nothing. The window is now three seconds, and the reading happens on the pause before you press Enter instead of on a timer — so it's one reading per message, fresh exactly when it's wanted, and less background work on a slow laptop than before.

**A click aimed off the screen blamed the wrong thing.** Windows pins the pointer to the screen edge, so Izuki saw the cursor somewhere unexpected and reported that *something had moved it*. Now it says the point is off the screen and gives the real size, so the next look aims properly.

**It will not type into a password box.** Izuki has always refused to *read* one, and the AI is told never to type a password — but typing had only that instruction behind it, and an instruction isn't a guarantee when a free model is driving the keyboard. The box is now asked what it is the moment it takes the keyboard, and if it's a password box nothing is typed. It says so and asks you to type it yourself.

**It couldn't tell when it was only seeing part of the window.** A busy page has more buttons than the list Izuki sends the AI can hold. It was handed 80 of 300 with nothing to say so — and would guess a pixel for a button that was simply never listed. It's now told how many are missing, and to scroll or say what it can't find instead of guessing.

**And the list of buttons Izuki won't press on its own initiative got much longer.** Izuki already refused to press Submit, Send, Pay, Delete or Discard unless you asked for that in so many words — the AI is told to stop and check first, and this made it certain even when the AI didn't. The list was missing a lot: Erase, Wipe, Format, Uninstall, Empty bin, Delete forever, Factory reset, Overwrite, Donate, Confirm payment, Buy now, Place bid, Share, Invite, Reply all, Go live, Revoke, Deactivate, Close account, Cancel subscription, Unsubscribe, Grant access.

Say "delete that file" and it deletes it. Say "sort this page out" and it will do everything else and then stop and ask before that one press. It's still whole words only, so Sharepoint, Formatting, Postcode, Deleted items and Buyer guide are ordinary buttons and stay instant.

## 🔍 Typing what you want now finds it

Every search box in Izuki worked the same way: it looked for everything you typed, as one exact run of letters. That reads fine until you use it like a person.

| You type | Before | Now |
|---|---|---|
| "how do I record my classes" | nothing | Write down a Zoom call or class |
| "whispr" | nothing | Hold a key and talk to type anywhere |
| "voice shortcut" | nothing | Keyboard shortcuts |
| "that note about photosynthesis" | nothing | your photosynthesis note |
| "photosynthisis" (typo) | nothing | your photosynthesis note |

Three things changed, in one place that all four search boxes share:

- **Filler words are ignored.** "how", "do", "I", "my", "the" — one of those was enough to empty the whole list.
- **Singular and plural are the same search.** "classes" finds "class", "notes" finds "note".
- **One wrong letter is forgiven** in a word of five letters or more. Nothing hides behind a typo.

And when nothing matches exactly, a search box now shows the closest things instead of "no feature matches" — because being told nothing exists, while it's sitting right there, is the worst answer a search can give.

This covers **Ctrl+K "find anything"** (all 59 features, each one now findable by its own name — there's a test that checks every single one), **the Settings search**, **the connected-apps list**, and **the search over your own notes**.

## ⌨️ Hold to dictate had no key — and the key it had was taken

Hold-to-dictate (hold a key, talk, and your words are typed wherever your cursor already is) shipped with two problems:

1. **It wasn't in the Shortcuts list at all**, so there was no way to see or change its key.
2. Its key was `Ctrl+Shift+Space` — **the same as Draw overlay**. Windows gives a shortcut to whoever asks first and quietly refuses everyone after, with no error anywhere. On a fresh install, one of those two features simply never happened.

Dictation now has its own key (`Ctrl+Alt+Space`), its own row in **Settings → Shortcuts**, and the "Tidy what I dictate" switch sits with it.

### One chord, one action
The real fix is underneath, so this can't happen again:

- Izuki untangles duplicates when it loads your settings — the more important feature keeps the key, the other falls back to its own default, or is left blank rather than pretending to work.
- The Shortcuts list **refuses a key that already has a job** and tells you which one it is, instead of silently taking it.
- It also refuses **a key on its own**. A bare Space or letter saved here would be taken from every app on the PC — use Ctrl, Alt, Shift or Win with it, or an F-key, which nothing types.
- A shortcut with no key reads "not set — click to pick", instead of an empty button.
- Tests now fail the build if any two shortcuts ever ship on the same chord again, or if a bare key is ever accepted.

## 🤖 Five more things Izuki notices by itself

All of them follow the same rules as every other heads-up: once only, never during quiet hours, never while you're mid-task, and nothing at all if there's nothing worth saying.

- **Morning (6–11am)** — the three things that change what you'd do next: your next reminder with its time, anything due within two days, and flashcards gone cold. No greeting, because a greeting is noise.
- **The evening before something is due** — a reminder tells you at the time you picked, which is often the moment it's too late to start. This is the other half, while there's still a night to do it in.
- **Sunday evening** — the week as it actually was: questions, flashcards, notes, what most of it was on, and the cards you keep missing.
- **1–4am, three hours in** — one line, once a night. At 2am nobody has noticed how long they've been going.
- **A quiz opens** — Izuki offers to go through it with you, one question at a time, explaining as it goes. It says plainly that it won't pick or submit anything, and it won't.

## 🪫 Three things that were quietly costing you

**Your school calendar was read every 30 seconds.** The new morning and evening nudges ask what's due, and they run on the 30-second background tick — so for five hours a day that was an HTTP request every half minute, for a line that can only be said once. It's now read at most every fifteen minutes, and only while those nudges are actually waiting.

**Your inbox was searched every three minutes, all day.** The log told on us: 480 trips to Gmail a day, returning the same already-seen emails every time, on a laptop, on battery. Mail arrives in bursts — so a quiet inbox is now checked less and less often, up to half an hour, and it's back to every three minutes the instant something lands.

**Nearly two seconds of silence before Izuki spoke.** When a voice service couldn't be reached, Izuki fell to the next one — a ChatGPT voice on an account that ran out of credits yesterday. It learned that again on every restart, paying a failed round trip each time before a working voice started. Out of credits isn't a rolling limit; it lasts until someone pays. Izuki now remembers it, and gives a new key a fresh chance the moment you paste one.

---

Free, as always. No account, no subscription, nothing to pay.
