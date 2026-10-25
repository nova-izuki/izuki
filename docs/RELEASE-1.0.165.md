# Izuki 1.0.165: "Hey Nova" knows your voice, the answer bubble scrolls, updates you actually see, answers when you ask, cancel any reminder, a real Dynamic Island

## ⏰ Cancel a reminder, any way you like
**The problem:** timers had a Cancel button, but reminders like "Check in with Solomon" didn't. The only way to cancel one was finding it in the Chat tab. Saying "cancel it" went to the AI, and the AI had no way to take a reminder back.

**What changed:**
- **The Island lists what's coming.** Open it and you'll see your next three reminders, each with its own **×** to cancel it.
- **Say it:**
  - "cancel check in with Solomon";
  - "don't remind me to call Mum";
  - "turn off my 7am alarm";
  - "cancel the reminder at 5";
  - "cancel that reminder" (the one you just set);
  - "delete all my reminders" (your wake-up alarms stay).

  It's done on the spot, with no AI wait.
- **It never guesses.** With several reminders and no name ("cancel the reminder"), Izuki asks which one, and nothing is removed until you say. If nothing matches, it tells you what you do have.
- **It won't delete one on half a name.** Without the word "reminder" or "alarm", you have to name the whole thing: "cancel check in with Solomon" removes it, a bare "cancel check" doesn't.
- **Not mixed up with other things:**
  - "Stop the music" and "cancel my Netflix subscription" aren't treated as reminders.
  - Saying "delete old photos" while you have a reminder called that does the job; it doesn't drop the reminder.
  - Calling one a timer works too: "cancel the check in with Solomon timer".
- **Any AI can do it.** Every AI now gets your reminder list, so "scrap the Solomon thing" works in any wording.
- **On your phone too.** The same phrases work on the phone. A cancelled reminder's phone notification is taken back, and it's never said.

## 🗣️ "Hey Nova" that only answers your voice
**What you asked for:** the Siri-style thing — do a voice test, and then "Hey Nova" only wakes up for *you*, not for the TV, a podcast, or someone else's voice. Plus the option to add other people you *do* want it to listen to.

**What changed** (built by Codex, finished, tested and shipped by Claude):
- **Settings → Talk to Izuki → "Recognize enrolled voices".** Type a name, then say "Hey Nova, are you there?" three times. That's the enrolment.
- **Only enrolled people wake it.** Everyone else — the TV, a video, a person walking past — is ignored.
- **Add as many as 12 people.** Each one gets their own name and their own three takes, and Izuki tells them apart.
- **The talk key always works,** enrolled or not — so you can never lock yourself out.
- **It stays on your PC.** The voice templates are maths, not recordings: no audio and no words are ever kept or sent anywhere.
- **It fails closed.** A damaged or tampered-with profile file means nobody is let in, rather than everybody.
- **It's honest about what it is:** a recording of your voice could still imitate you. It keeps the room from waking Izuki; it isn't a password.

**How it was checked:**
- 12 unit tests on the matching rules (`npm run test:speakers`): the right person gets in, other people don't, one lucky take out of three isn't enough, several people are told apart, silence and a dead mic are refused, and tampered profile files are rejected.
- A separate check against the model author's own public recordings of real different speakers.

## 🖱️ The answer bubble scrolls now
**The problem:** the answer bubble showed a scrollbar, but the wheel did nothing — it scrolled whatever was behind it instead. You could drag the bubble and close it, so it looked like it should scroll.

**What was actually wrong:** the bubble deliberately never takes keyboard focus (hovering it must not pull the keyboard out of what you're typing in). Windows sends the mouse wheel to the window that *has* focus — so the wheel went to the app underneath, every time.

**What changed:**
- **The wheel over any Izuki widget now scrolls that widget** — the answer bubble and the open Island's lists. The app behind no longer scrolls at the same time.
- **Nothing takes focus**, so your typing is never interrupted.
- **Nothing is swallowed anywhere else.** The wheel is only taken when the pointer is over something that *can* actually scroll (Freebuff's half of this). Over the orb, over a short answer with nothing to scroll, or anywhere else on screen, your windows scroll exactly as before.
- **Where it applies:** the answer bubble, the Island's lists, and any other Izuki widget that scrolls.
- **It costs nothing when you're not using it.** Watching the wheel means a hook that Windows calls for every mouse move on the whole PC, so Izuki only puts it in while the pointer is actually over something of its own that scrolls, and takes it straight back out.
- **How it was checked:** the Island browser check (detach, dock, follow-up, scrolling transcript) and the full test suite.

## ✅ Ask for the answer and you get the answer
**The problem:** asking a straight question about something on screen got "Nah, I can't just hand you the letter, bro" — even on practice material, even when you asked outright. That gate had grown to cover what Izuki *says*, not just what it does.

**What changed** (built by Codex, shipped and tested by Claude):
- **Ask outright — "what's the answer", "which option is correct", "just the answer" — and Izuki answers**, then explains why.
- **Coaching is still its own mode.** "Coach me", "don't answer", "teacher mode" keep it withholding, as before.
- **What has NOT changed, and won't:** Izuki never clicks an answer, types one in, or submits a test. Telling you something is not permission to act on the page — a test covers exactly that.
- **Asking it to *do* something keeps the ordinary rules.** "Answer it and click next" or "answer and submit" is a request to act, so it goes back to coaching, which never picks or sends an answer.

## 📝 A quiz question is not an assignment
**The problem:** asking about a multiple-choice question could start the *assignment* walkthrough — "Step 1 of 7: Read the question carefully…" — and offer to keep a guide in your Notes you never asked for.

**What changed:** when what's on screen is a quiz question rather than an assignment, Izuki says so, keeps nothing in your Notes, and points you at the quiz coach, which goes question by question. (Coaching still never hands you the answer — that hasn't changed.)

## ⬆️ Updates you actually see
**The problem:** Izuki did check for updates by itself, after starting and every hour. But a new version only showed up in places you had to open: Settings → Updates, the open Island's list, or your phone. Nothing appeared on screen, so "Check now" felt like the only way. Also, the first check ran 8 seconds after Windows started, often before Wi-Fi was connected. That failed silently, and the next try was an hour later.

**What changed:**
- **A Windows notification** the moment a new version is found: "Izuki 1.0.x is out".
- **The Island's pill keeps showing it** ("⬆️ Izuki 1.0.x is available · Hover to update") whenever nothing else is on it, not only for 10 seconds. Hover over it: "Download & install" is right there.
- **A check that fails tries again** in 2 minutes, then 5, 10 and 30, instead of an hour later. Checks follow the real clock, so a PC that slept through the hour checks when it wakes.
- **Every check is written to the log,** so it can be confirmed.
- **Installing still needs your click**, as before.

## 🎙️ "Hold a key" means only the key
**The problem:** with "Hold a key" picked, "Hey Nova" was already off. But after an answer, Izuki kept the mic open for a follow-up, as in a hands-free conversation, so it could hear you without the key.

**What changed:**
- **Hold a key:** the mic is on only while you hold the key. Let go, it sends, the orb answers, then it's done. "Hey Nova" doesn't work in this mode.
- **Say "Hey Nova":** hands-free back-and-forth as before, and holding the key works too.

## 🏝️ A Dynamic Island like the iPhone's
**What changed:** two new switches in Settings → Talk to Izuki:
- **Always show the Island** (on by default): a small black pill sits at the top and grows to show:
  - "Listening" with your voice's live bars;
  - Izuki speaking;
  - what's playing;
  - timers, reminders and work in progress.

  Off: it's fully hidden until your mouse goes to the top of the screen, or something's happening.
- **Move it anywhere:** drag it anywhere on screen. Off: it stays along the top.
- **Holding the talk key** shows "Listening" in the Island, as well as the waveform under your mouse.

## 🔎 Web search and deep search by voice
**What changed:**
- **Deep search from the orb or your character,** not only the Chat tab:
  - "deep search…";
  - "research…";
  - "deep dive into…";
  - then "dig deeper" to carry on.
- **What you get:** Izuki runs many searches and reads the pages. It says the short answer out loud, and the bubble shows the full answer with its sources. The steps show while it works.
- **Quick questions** ("search the web for…", "who won last night") still get a fast web search in the normal answer.

## ⚡ Answers that start faster
**The problem:** your chat and the screen helper shared one free Groq model, so its free allowance ran out. Chats then waited about 20 s on a slow backup. Your PC also transcribed every request itself (5–13 s of work), even when the cloud already had your words in under a second.

**What changed:**
- **A faster model for plain conversation.** Chat now uses Groq's fast text model, GPT-OSS 20B, which has its own free allowance and thinks only briefly. The screen helper keeps the vision model to itself. If the fast model is busy, the usual brain answers.
- **Speech: the cloud goes first.** Once the cloud has answered quickly twice, it gets 1.5 s alone before your PC starts transcribing too.
- **No more invented words.** Whisper's made-up "words" in a silent room (subtitle credits, "thanks for watching") are thrown away instead of being answered.

**How it was checked:**
- **Reminder cancelling has its own tests** on the PC and the phone, with the same cases on both. They cover the ways of asking and the things that must not count as asking: the music, a subscription, "delete old photos", "why did you cancel…".
- **The silence filter was tested on 14 lines.** The made-up subtitle credits are dropped. Real requests like "go to www.youtube.com" and "turn on subtitles" are kept.
- **CodeRabbit found 6 things, all fixed:**
  - If the fast model broke off mid-answer, the answer could have been said twice. Now it stops there.
  - A cancel that fails puts the real list back.
  - "Move it anywhere" now restores the Island's saved place.
  - An old research finishing no longer clears a newer question's "thinking".
  - The cloud's speed is now timed correctly.
  - The silence filter was narrowed so it can't drop real requests.
- **Also checked:** the type check of every screen, the phone app's scripts, and the core's full test suite.
