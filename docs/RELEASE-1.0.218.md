# Izuki 1.0.218: a screen assistant on your phone

## 👀 "Explain this", on any site or app

- On a web page, in an app, on a message or an error: say **"Hey Nova, explain this"** (or tap the orb and ask). "What does this mean?", "what's this?", "help me with this page", "summarize this", "translate this" and "what's on my screen" work too.
- Izuki reads what's on the screen (its text, and a picture of it when Android allows) and answers right there, out loud, without opening the app. Ask it to *do* something on that screen and the phone agent does it, step by step.
- Typed inside Izuki, "explain this" still means the chat you're in, unless you say "this page" or "my screen".

## 🔗 Links, read on the phone

- Send a link and ask about it ("summarize https://…"): Izuki reads the page itself through Gemini, without your PC. (With another AI picked and no Gemini key, it says what to add.)

## 📝 Tests stay yours

- On a quiz, test or exam screen (a question counter, a timer, a Submit test button), the phone agent never picks or types answers. It explains the question instead, and tells you the answer if you ask for it.

## Checked before release

- `npm run test:phone`: every suite, with new phone agent cases (a quiz screen refuses the pick, "Question 3/20" counts as a test, a search for "pub quiz" can still be changed) and 17 new checks for which phrases mean "the screen".
- CI: the Android APK build with its JVM tests, the Windows build with Rust tests, web and the iPhone project. CodeRabbit on the change.

## Not verified yet

- On a physical phone: the screenshot (Android 11+), and the answers about real apps and sites.
