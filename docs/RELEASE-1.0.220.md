# Izuki 1.0.220: the phone agent sees, the voice sounds natural, Stop means stop

## 👂 The orb waits for you to talk

- Tap the orb and take your time: it keeps listening until you start talking. Some phones' speech services gave up after a second of quiet, so the orb said "I didn't catch that" before you'd begun.
- If you did speak and the words didn't come through, it says "I heard you but couldn't make out the words", not that it heard nothing.

## ✋ A tap on the orb really stops a task

- After a task finished, the orb kept saying "Working… tap to stop", and tapping it didn't stop an Autopilot run. Now the tap answers at once ("Stopped."), stops a reply, the phone agent or Autopilot, and the orb goes away.

## 🌈 One rainbow light, and it goes out

- One light around the screen, over other apps and inside Izuki, only while Izuki listens, works or talks. It always goes out when Izuki is done (by itself after 30 seconds at the latest). The second, cyan light inside the app is gone. The switch is in Settings → Phone.

## 🗣️ A natural voice

- When you talk to the orb or say "Hey Nova", the answer comes in Gemini's natural voice if it's ready within a few seconds; otherwise the phone's voice answers, so you never wait. The orb and the light move with the real voice.
- The phone's own voice is now Google's most natural voice on your phone. **Settings → Izuki's voice** lets you pick another and hear it first.

## 📱 Full control of your phone

- With Gemini, the phone agent sees a screenshot with every control numbered on it, so it understands icons and pictures, not just labels.
- It can tap anything it sees, long-press, double-tap, swipe between photos and pages, open recent apps, notifications and quick settings, control media, volume and the torch, and start Google Maps directions.
- It keeps a plan across steps, notices when it's repeating itself, and has 30 steps instead of 14.
- The safety rules cover every new touch: nothing that sends, pays, buys, deletes or installs is pressed (it checks every control under the spot it touches), it never acts on a locked phone, and it never picks quiz or test answers.

## ✨ A calmer home, with a guide for each feature

- **On your phone** on the home screen: Do it for me, Explain my screen, "Hey Nova", The orb, Autopilot and Drive mode, each showing On, Off or Set up. Tap one for a short guide: what it does, three steps, examples you can tap, and one button to try it or turn it on.
- The one-tap phone controls fold away until you open them (Izuki remembers).
- Long explanations in Settings fold to two lines, with "How it works" to read the rest.

## Checked before release

- `npm run test:phone`: every suite, including new ones for the orb and the light (they go away when a task ends), the natural voice in a voice turn (used when quick, the phone's voice when late), and the agent's new moves (screenshots, a point on the screen, a risky button under a harmless label, photo swipes, double tap, Stop between taps).
- JVM tests for listening again before anyone speaks, picking the most natural voice, and reading a voice line's loudness.
- CI: the Android APK build with its tests, the Windows build, web and the iPhone project. CodeRabbit on every change; its findings fixed.
- The home list, the guides and the folded Settings checked on a 412-pixel-wide screen.

## Not verified yet

- All of it on a physical phone: how long the orb waits on your Samsung, the natural voice over other apps, the voice picker, the agent's screenshots and new touches.
