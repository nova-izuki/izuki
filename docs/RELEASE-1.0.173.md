# Izuki 1.0.173: hold a key and talk into any app, a car that notices you're driving, and features you can actually find

## ⌨️ Hold a key and talk — into whatever you're using
Hold **Ctrl+Shift+Space** anywhere and talk. Let go and what you said is typed into whatever box you were already in — an email, WhatsApp, a form, a code comment.

- **It types, and only types.** Nothing is sent, submitted or Entered.
- **Tidied on the way in:** fillers ("um", "you know"), false starts and the words people repeat by accident are taken out, and grammar, capitals and punctuation are fixed. You can turn that off and get exactly what you said.
- **Your punctuation words still work:** "new paragraph", "comma", "question mark".
- **Addresses, emails, links and code go in untouched** — tidying those would wreck them.
- **A little waveform under your mouse**, no orb. If no AI answers within four seconds, your words go in as heard rather than making you wait.

(“Hey Nova, type what I say” — the hands-free version — still works as before.)

## 🚗 It notices when you're driving
Getting your phone out and finding Drive mode is exactly what nobody does while pulling out of a parking space. Now the phone offers:

> **Driving?** I can take over hands-free. — [Start Drive mode] [Not driving]

- Only after a **sustained 25 mph for 25 seconds** — no walk, run or bike reaches that.
- **It asks; it never takes the screen.** Once per trip, and "Not driving" is remembered for the rest of the day.
- Never while you're on a call, and it leaves by itself after half a minute if you ignore it.
- Switch it off whenever you like.

Drive mode itself is unchanged: your speed, huge buttons, "take me to…", "gas near me", "play music", all spoken, all without an AI call.

## 🔍 The features are findable now
Izuki has a search box at the top of the app — and none of the newer features were listed in it, which is a good way to own a feature you never use. Twelve are now findable by what you'd actually type, not by their name:

- "wispr", "dictate", "voice typing", even "Ctrl+Shift+Space"
- "devin", "write code", "fix a bug in my project"
- "zoom", "record a call", *"I don't want to pay attention"*
- "notion", "backlinks", "second brain"
- "anki", "flashcards due", *"what do I keep forgetting"*
- "carplay", "tesla", "jarvis", "driving"
- **"slow", "waiting", "rate limit", *"why is it slow"*** → takes you to the spare free brain, which is the actual cure

## 🧠 A spare brain, free, in the setup
Free AI allows roughly **one request a minute**. One key on its own is the whole reason Izuki ever makes you wait — it's not the PC and it's not the code.

Setup now has a step for a **second free key** (Groq is the quickest). When one is busy the other answers. It still costs nothing, and Izuki already knew how to use several keys — it just needed a second one to work with.

## 🎙️ Voice setup you can find
"Recognize enrolled voices" — teaching Izuki your voice so "Hey Nova" ignores the TV — was only visible if hands-free was already on. So if you used the talk key, you'd never know it existed. It's now always shown, with a line saying when it applies.

**How it was checked:** the full core suite, the type check of every screen, the phone suites including the 16 Drive-mode cases, and the HTML checks.

## 🧠 Smarter where it was being dumb

Three things were making Izuki look stupid, and they were all fixable.

**It didn't know you were asking it to *do* something.** A list decides whether a words-only reply counts as a proper answer. It knew "open", "click" and "type" — but not **"fix this", "sort this out", "set up", "change", "save", "create", "add", "select", "enable", "connect", "start", "continue", "try again", "do it", "handle it"**. So you'd say *"fix this"* and a reply that merely *described* the problem was accepted as a good answer. Nothing happened, and it looked useless. Forty-odd phrasings added, with tests that plain questions still stay questions.

**It couldn't look anything up.** Asked something it didn't know, it guessed from the screenshot. Now, for factual questions — *"what is…"*, *"which of these…"*, *"difference between…"*, *"the correct answer"* — it searches and reads the web first, and is told to check rather than guess and to say where the answer came from. Questions plainly about the page in front ("summarise this", "what's on my screen") still answer straight away with no detour.

**It bluffed.** A confident wrong answer costs you marks *and* gives you no way to spot it. It now has to say which part it's unsure about instead of stating it flatly — "probably B, but check whether X applies" is far more use than a confident wrong letter.
