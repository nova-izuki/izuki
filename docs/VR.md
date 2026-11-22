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
| **The orb in your room** | Mixed reality on headsets with passthrough (Quest 3/3S/Pro), a calm space otherwise. It floats about 75 cm in front of you, slightly low, and drifts after you only when you turn well away or walk off. Grab it to put it somewhere; "come here" or B/Y brings it back. |
| **Talk** | Point and pull the trigger, or pinch the orb (or press A/X). It's the app's own hands-free call: listening, transcribing with your key, answering, the natural voice, memory, the PC lane. Captions under the orb. |
| **Look and ask** | "What's this?", "how do I fix this?", "what does this say?". On browsers that share the headset camera (Quest Browser on Quest 3/3S, after the person allows it), one photo goes to the person's own AI. Izuki answers and draws pen circles with labels on the photo. Graded quizzes and tests get coaching, never answers. |
| **Your PC, big** | "Show my PC": the PC's screen on a 1.6 m panel, a few frames a second. Point and click on it, thumbstick to scroll, and Izuki's status with **Stop**. It uses the phone's Remote pairing; the PC's own approval rules still apply. |
| **Pin that** | Keeps the last answer as a card in the room. Carry it anywhere, tap it to hear it. Notes come back next time (fanned round you). |
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
- Store: the same package can go to the Meta Horizon Store under the owner's developer account. Per `ANDROID-SIGNING.md`, a store build should get its own key; add its fingerprint to `assetlinks.json` next to the preview one.

## Not done yet (next)

1. **Try it on a real headset** (owner): Quest 3 passthrough, hands, controllers, camera permission, the mic during immersive mode.
2. **Meta Horizon Store**: the Quest app above, submitted under the owner's Meta developer account, with its own store key.
3. **Live PC video** through `remote/stream` instead of pictures; typing on the PC by voice from VR ("type…").
4. **Pen in the real room**: put the circles on the real object (hit-test/depth) instead of only on the photo.
5. **Notes that stay exactly where you put them** (WebXR anchors, persistent on Quest).
6. **Teach me / Do it with me** on the big PC screen: highlight the next control on the panel and wait for the person.
