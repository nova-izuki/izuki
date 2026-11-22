# Izuki in VR

The same Izuki, in a headset. The mission doesn't change: a free companion,
for everyone, that sees what you see, answers out loud and does the task,
asking first before anything big, on any AI brain. In VR, "your screen"
becomes "your room".

Open **izukinova.ai/vr** in the headset's browser (Meta Quest, Pico, Android
XR, Apple Vision Pro, or a PC headset through Chrome/Edge). It is a WebXR
mode of the phone web app (`docs/app`), so there's no store wait and no
install.

## What it does

| | |
|---|---|
| **The orb in your room** | Mixed reality on headsets with passthrough (Quest 3/3S/Pro), a calm space otherwise. It floats about 75 cm in front of you, slightly low, and drifts after you only when you turn well away or walk off. Reach out and pinch it (or squeeze a controller's grip right at it) and it comes with your hand; from further away, point and hold. The same goes for pinned cards and the panels. "Come here" or B/Y brings it back. |
| **Talk** | Point and pull the trigger, or pinch the orb (or press A/X). It's the app's own hands-free call: listening, transcribing with your key, answering, the natural voice, memory, the PC lane. Captions under the orb. **Hold to talk**: hold Talk (or A/X) and speak; letting go sends it. **Pause** turns the microphone off until Talk. |
| **Look and ask** | "What's this?", "how do I fix this?", "what does this say?". On browsers that share the headset camera (Quest Browser on Quest 3/3S, after the person allows it), one photo goes to the person's own AI. Izuki answers and draws pen circles with labels on the photo. Graded quizzes and tests get coaching, never answers. |
| **Your PC, big** | "Show my PC": the PC's screen on a 1.6 m panel, a few frames a second. Point and click on it, thumbstick to scroll, and Izuki's status with **Stop**. It uses the phone's Remote pairing; the PC's own approval rules still apply. |
| **Pin that** | Keeps the last answer as a card in the room. Carry it anywhere, tap it to hear it. Notes come back next time (fanned round you). |
| **Calling Izuki** | "Hey Nova" any time in the room (it listens hands-free from going in, and answers only when called by name, or a follow-up within 30 s), the orb (trigger or pinch), A/X, or the Talk button. "Stop listening" stops it. |
| **What's on my screen?** | With the PC on the big screen, Izuki reads that screen (its picture, not the camera) and circles what matters. Something to do ("open Spotify", "click Send", "type…") is done on the PC while you watch, under the PC's own approval rules. Other Quest apps can't be seen or controlled: Meta lets only its own assistant do that. |
| **Photos and folders** | "Show my photos" opens a gallery of the PC's Pictures (and Up to Desktop, Documents, Downloads, Music, Videos; read-only, the PC's own limits); point at a photo to see it big, then "what's in this photo?". The Quest's own photos aren't reachable from a website. |
| **The room's browser** | "Search the web for…", "google…", "look … up": a browser panel opens beside you, the orb types your words into its bar, and the results are the pages Google's search really returned (Gemini's Google Search with the person's own key; nothing is made up as a link). Point at one and it's read to you there: the page's words on the panel (a website itself can't be drawn inside VR), the start read out loud. Thumbstick for more. With the PC on the big screen a search is done on the PC instead, unless you say "in the browser". |
| **Teach me in 3D** | "Teach me how the heart works", "show me the solar system", "visualise the French revolution", "make a timeline of…": the person's AI designs a small hologram (JSON, checked by `parseHolo()`) and the room builds it beside you while Izuki explains: a model (things in space, one circling another), a map of ideas, steps, a timeline or a chart, glowing over the real room or the calm space. A lesson walks step by step ("next", "back", "again", or the bar's arrows), each step lighting up its parts. Point at any part to hear more about it. Quizzes and tests get the idea taught, never the answer. |
| **Style** | Five calm looks (Nova, Midnight, Aurora, Dawn, Pearl): the orb's colours and, without passthrough, the sky. The Style button or "change your look". |
| **First visit** | The orb blooms into view with one ring of light, then its words and buttons fade in (no motion with reduced motion). Three suggestions float above it ("What can you do?" or "What's this?", "Show my photos", "Change your look"): tap one and Izuki does it; they leave after the first conversation. "What can you do?" is a short spoken tour that names only what works on that headset now. |
| **Voice** | Gemini's natural voice; when its small free allowance rests, Orpheus on Groq (the Groq key that hears you); the room says why when neither can speak. |
| **3D preview** | On a normal screen (or with `?vr`), the same room driven by the mouse. |

## How it fits together

- `docs/app/vr.js`: always loaded, small. Headset detection, the home card
  and its explainer sheet, the headset-only commands (`command()`), the look
  (camera, prompt, `parseLook()`), the PC calls (`remote/screen`,
  `remote/status`, `POST remote`), pinned notes, and the hooks the app calls
  (`window.IzukiVr`).
- `docs/app/vr-scene.src.js` → `vr-scene.js` (`node tools/build-vr.cjs`):
  the three.js room, loaded only when someone goes in. Never edit
  `vr-scene.js` by hand; the test checks it matches the source.
- `docs/app/index.html`: `toViews()` tells the TV page and the VR room the
  orb state, what was heard, what Izuki said, each chat line and the mic
  level. Headset commands go first in `ask()`, like the TV's.
  `IzukiCore.tap/preferRecorder/see(…, system)` were added for VR.
- `docs/vr/index.html`: the short address, sent on to `/app/?vr`.
- Tests: `tools/phone-check/vr.test.cjs` (in `npm run test:phone`).

Quest Browser has no working speech recognition, so VR records and
transcribes with the person's Gemini or Groq key (`preferRecorder`). Without
a key the orb says so instead of doing nothing.

## Izuki VR as an app on the Quest

Quest's browser has no "install this site" button, so there is also a small
Quest app: Meta's Bubblewrap wraps the live web app (a Trusted Web Activity),
so the app always runs the current website. Its icon opens `/app/?vr=app`,
which goes straight into the room when Izuki is set up (key and microphone),
and shows the explainer otherwise.

- Configuration: `quest/twa-manifest.json` (package `com.novaizuki.vr`, Horizon OS app mode `2D`: it opens as a window, then goes into the room). `node tools/quest-check.cjs` (part of `npm run test:site`) checks it against the site.
- Build: `.github/workflows/quest.yml` (Bubblewrap 1.24.1, JDK 17, target SDK 32) → the artifact `izuki-vr-quest`.
- Signing: the private preview key (`IZUKI_PREVIEW_KEYSTORE_B64`, see `ANDROID-SIGNING.md`), and only for builds of `main` (branches, pull requests and manual runs elsewhere build TEST-ONLY). `docs/.well-known/assetlinks.json` vouches for that key only, which is what lets the app show the site without a URL bar. Until that secret is in GitHub (the owner runs `.private/android/add-key-to-github.ps1`), the build is named **TEST-ONLY**, signed with a throwaway key, and isn't meant to be installed.
- Install (sideload): Developer Mode on the headset (a free Meta developer account, then the Meta Horizon phone app → the headset → Developer Mode), USB-C to the PC, then `adb install Izuki-VR-Quest.apk` (or SideQuest). It appears in the library under **Unknown Sources**.
- Store: the same package, named **IZUKI NOVA** in the library, signed with its own store key on `main` (artifact `izuki-vr-quest-store`, see `ANDROID-SIGNING.md`). With the `IZUKI_QUEST_APP_SECRET` secret in GitHub, `main` also uploads it to the private Alpha channel by itself. The store page (pictures, words, upload steps, how updates reach people) is in [QUEST-STORE.md](QUEST-STORE.md); `node tools/quest-store-art.cjs` remakes its pictures from the room.

## Not done yet (next)

1. **Try it on a real headset** (owner): Quest 3 passthrough, hands, controllers, camera permission, the mic during immersive mode.
2. **Meta Horizon Store** (owner): the store page is filled, the agreement is signed and the first store build is on the private Alpha channel ([QUEST-STORE.md](QUEST-STORE.md)); left: organization verification, the rating and data forms, a try on the headset, then submit. A trailer is optional and not made yet.
3. **Live PC video** through `remote/stream` instead of pictures; typing on the PC by voice from VR ("type…").
4. **Pen in the real room**: put the circles on the real object (hit-test/depth) instead of only on the photo.
5. **Notes that stay exactly where you put them** (WebXR anchors, persistent on Quest).
6. **Teach me / Do it with me** on the big PC screen: highlight the next control on the panel and wait for the person.
