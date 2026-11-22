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

## Not done yet (next)

1. **Try it on a real headset** (owner): Quest 3 passthrough, hands, controllers, camera permission, the mic during immersive mode.
2. **Meta Horizon Store**: package as a PWA with Bubblewrap `--metaquest`, host `/.well-known/assetlinks.json`; needs the owner's Meta developer account.
3. **Live PC video** through `remote/stream` instead of pictures; typing on the PC by voice from VR ("type…").
4. **Pen in the real room**: put the circles on the real object (hit-test/depth) instead of only on the photo.
5. **Notes that stay exactly where you put them** (WebXR anchors, persistent on Quest).
6. **Teach me / Do it with me** on the big PC screen: highlight the next control on the panel and wait for the person.
