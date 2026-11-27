# Izuki 1.0.222: quicker typed commands, no long waits, and Izuki in VR

## ⚡ On your PC

- Typing "open Chrome", "launch Notepad" or "go to amazon.com" in the chat opens it at once, the way saying it out loud already did. It used to become a job for the screen agent, which on a slow or rate-limited free brain could take most of a minute.
- When no AI brain is answering, Izuki gives up after 20 seconds instead of 45 and says so plainly, and a screen task no longer keeps the whole app "busy" after the answer has come.
- Google's newer Gemini keys (they start with "AQ." instead of "AIza") are recognised when you paste or copy one, and are never sent along in a bug report.
- Izuki keeps its own small notes about what kept going wrong, on your PC only and never sent anywhere, so whoever fixes Izuki next can see what breaks most.

## 🥽 Izuki in VR

Already live at izukinova.ai/vr and in the IZUKI NOVA app for Meta Quest (now in Meta's store review):

- **One way in.** The app opens a full-screen start: **Enter the room**, **Float beside my apps** (a small Izuki window next to your other apps, which a full room has to hide), or chat. It remembers your choice.
- **Holograms that teach.** "Teach me how volcanoes work" builds a hologram on a glowing projector, with a scan line, wire cages and light flowing between the parts, and the lesson plays by itself, step by step with the voice.
- **Draw it.** "Draw me a volcano", "imagine a rocket", "what does a black hole look like": the hologram is the thing's real shape, drawn in glowing lines and see-through wire shapes, with lava, blood or air flowing through it while the lesson lights each part.
- **Real things.** "Show me Mars", "show me Saturn", "show me the moon": a spinning planet in its real surface map (from spacecraft data). "Where's the space station?": the real Earth with a dot at the station's live position. Holograms also get a real photo of the thing beside them, from Wikipedia.
- **Dream mode.** "Take me to a rainforest at night", "dream mode: a beach at sunset": your AI designs a world and it grows up around you. "Wake up" brings your room back.
- **Show me where.** "Where do I click to save this?" points at each thing on your PC's screen (or a real thing, through the camera), numbers the steps and draws an arrow between them.
- **It knows it's in VR**, offers "Want me to build it in 3D?" when that helps, and a plain "yes" builds it.
- **Talk over it.** In the headset, just start talking while Izuki speaks and it stops to listen. Voice bars beside the orb show it hears you.
- **Photos:** with a photo open, "what's this?" and "where was this taken?" are about that photo, not the room.
- **Pins take you back.** Tap a pinned answer and Izuki picks that conversation up again ("Back to: how far is the moon…").
- **A free natural voice on the headset.** When the online voices hit their free limit, Izuki speaks with a natural voice that runs on the headset itself (downloaded once, about 90 MB), instead of the robotic one, if the headset is fast enough.
- A browser beside you, timers, a breathing break, and a clear message when the headset hasn't let the browser use its cameras yet.

## 📱 On the phone

- Questions about facts and picks ("the best VR game", "who made Minecraft", "how tall is…", "tell me about…") now search the web, not only news and weather; plain chat stays quick. Searched answers show the pages they used.
- Google's newer "AQ." Gemini keys are accepted in setup and Settings.
- When something goes wrong, the app writes down why for the maker (Settings → "Something wrong?"), where it used to stay quiet.
- Drive mode: the trip outlives the screen, says what's left when it really changes, and fits a phone on its side.

## Checked before release

- CI on every change: the Windows build and Rust tests, the Android APK build with its tests, web, and the iPhone project. CodeRabbit on every change.
- `npm run test:phone` (every suite, including 56 VR tests and 233 routing checks), and headless 3D previews of the launcher, the holograms and lessons, Dream mode, "show me where" and the voice bars.
- The Quest app was installed and opened on a real Quest 3S: it launched (after the account's approval), the room page loaded with no errors, and two real problems were found there and fixed (the app opened as a flat chat; the camera message didn't say where to fix it).

## Not verified yet

- A real "AQ." key: tests used fake keys only.
- On a real headset: entering the room from the new launcher, floating beside other apps, Dream mode, the auto-playing lessons, talking over Izuki (its sensitivity) and the voice bars.
- Typed commands and the 20-second limit were checked by their tests, not on this PC's live app.
