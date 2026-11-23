# Hand-off from Claude, 2026-11-23: Izuki VR, the Quest store, release 1.0.222

For Freebuff, Codex and the next Claude session. Read this before touching
`docs/app/vr*.js`, `quest/`, `.github/workflows/quest.yml` or the key
handling. The owner asked for a hand-off like this after every batch of work.

## Where things stand

- **Izuki VR** is live at izukinova.ai/vr (`docs/app/vr.js` + the three.js room
  `docs/app/vr-scene.src.js`, bundled to `vr-scene.js` by `node tools/build-vr.cjs`).
  Spec: `docs/VR.md`. Tests: `tools/phone-check/vr.test.cjs` (run with `npm run test:phone`).
- **The IZUKI NOVA Quest app** (a Bubblewrap/PWA wrapper, `quest/`, built by
  `quest.yml`) is **submitted to the Meta Horizon Store and in review** (v1, build 1.0.20).
  After approval the owner releases it from the dashboard; then point the
  automatic upload at the store (see "Store uploads" below).
- **Release 1.0.222 is published** (2026-11-23, Latest on GitHub; `latest.json` says 1.0.222, so installed PCs update).
  It carries Freebuff's typed-command, 20-second brain-timeout and agent-notes work, plus the PC side of the new Gemini key format.
- **All VR PRs #141–#165 are merged** (web, so izukinova.ai/vr has them once Pages deploys). #167 (physics) is the open one.

## Shipped in this stretch (merged, or open PRs being merged in order)

| PR | What |
|---|---|
| #143, #145 | `quest.yml`: Alpha auto-upload on main; run by hand with `-f channel=store` for a **draft in Production** (the only kind a submission can attach) |
| #146 | Phone/VR app accepts Google's new **`AQ.` Gemini keys** (53 chars) besides `AIza`; bug reports hide them |
| #148 | VR **"show me where"**: numbered rings, dashed arrows, labels beside; PC screen for software, camera for real things; clearer headset-camera message |
| #149 | Holograms look **projected**: projector rings, light cone, rising specks, scan line, wire cages, fresnel surfaces |
| #150, #153 | **Launcher** for any `?vr` visit: Enter the room / **Float beside my apps** (the hands-free call screen in a window) / Chat; the app remembers the choice |
| #152 | **Dream mode**: the AI designs a world (`DREAM_SYSTEM`, checked by `parseDream()`), built around you; "wake up" ends it |
| #155 | The chat brain **knows it's in VR** (`VR_CONTEXT`); offers 3D and a plain **"yes"** builds it; **voice cut-in** in headset calls (`bargeWatch` in index.html); **voice bars** by the orb |
| #156 | Web search for **facts and picks** (`FACT_WORDS` in `needsWeb()`), not only news/weather |
| #157 | **Lessons play by themselves** in time with the voice (`playLesson`, `lessonTimes`), with light pulses along links |
| #159 | With a photo open, "this/it/he/here" questions use **the photo** (`photoOpen`, `ROOM_WORDS`, `ABOUT_THIS`) |
| #160 | PC: `keys.rs` and `bugs.rs` know `AQ.` keys |
| #161 | VR: a **pinned card takes you back into that chat** (the pin keeps its question; `IzukiCore.recall`) |
| #162 | **Free natural voice on the device** (Kokoro via kokoro-js 1.2.1, `deviceVoice()`), after Gemini and Groq, before the phone voice; on by itself in a headset; steps aside if too slow |
| #167 | VR **physics you can watch**: pendulum, thrown ball, feather and hammer, orbit, spring, wave. Real equations stepped per frame (`simShow`/`simTick`), formula and measured numbers on a card, Izuki speaks exact results with no AI (`parseSim`, `simFacts`, `simWords`); voice tweaks while it runs (`SIM_TWEAK`, `tweakSim`: "now on the Moon", "make it longer", "at 30 degrees", "faster", "again") |
| #164 | VR: **real photos** beside holograms (Wikipedia, `holoPhoto`, `photoUrl`); a headset hides phone-only tools; the Quest app goes straight in from its first launch; the launcher says where "Hey Nova" works |
| #165 | VR: **real planets** (Solar System Scope maps, CC BY 4.0) on the projector, and the **live ISS** on the Earth (`globeShow`, `globeMark`, api.wheretheiss.at) |
| #163 | VR **"Draw it": hologram kind `sketch` (`parseSketch`, scene `sketchShow`): tubes and wire solids that draw themselves in, with flow/spin/pulse and step focus; "imagine a <thing>" draws, "imagine a <place>" dreams |

## Facts found on a real Quest 3S (Horizon OS 210)

- Entering an immersive WebXR session hides every other app (Meta's rule). That's why the launcher offers floating.
- The Quest Browser needs **Headset cameras** permission (Settings → Privacy & safety → App permissions → Headset cameras → Browser / IZUKI NOVA). Without it `getUserMedia` only offers "camera 0, facing front".
- A teen account must get a parent's approval before it can launch an app from outside the store.
- The browser can be driven over adb: `adb forward tcp:9333 localabstract:chrome_devtools_remote`. Open pages with `am start -a android.intent.action.VIEW -d <url> -p com.oculus.browser`; `/json/new` is refused. Screenshots with `adb exec-out screencap -p` show passthrough, so look only at the panel.
- Meta's age groups are 13+, mixed or children only; there is no 18+ group. Gemini's API terms require users to be 18+, so the store text and the key screens say AI keys are for adults.
- The store submission's **Submit for Review** stays grey until every App-metadata section has a green tick. Content rating needs its own **Save** after the certificate attaches.

## Not verified yet (needs the headset or a real key)

- A real `AQ.` key, on both the native and the OpenAI-compatible routes. Fake-key probes can't settle it.
- Voice cut-in thresholds, float mode, Dream mode, the auto-playing lessons and the voice bars, on the headset itself.
- "Draw it", real photos, planets/ISS and physics were checked in headless Edge only (screens and numbers), not on the Quest yet.

## Review and workspace notes

- **Merged without a CodeRabbit review** (its free reviews were used up; tests and CI passed): #161–#165 and #167. Run `coderabbit review` on them when it resets, and fix what it finds.
- The CodeRabbit **CLI hit its rate limit** on 2026-11-23. #160–#163 were asked for review on GitHub (`@coderabbitai review`) instead.
- Physics trap: `new Float32BufferAttribute(arr, 3)` **copies** `arr`, so writing to `arr` later draws nothing. Write to `geo.attributes.position.array` (see `simLine`).
- `.work/vr` was left with conflicted bridge files: an old 2026-11-03 stash was popped by mistake. The stash entry is still there, and nothing was lost. Check it, or `git checkout HEAD -- <those files>` there; don't commit from it as is. Fresh work used `.work/sketch`, `.work/photos`, `.work/pc-keys` and `.work/rev`.
- Measured: Kokoro in headless Edge spoke a real WAV. On this laptop's CPU it's far slower than real time (53 s for 4.5 s of speech), and headless WebGPU is software. The Quest's GPU speed is still to be measured.

## Next (owner's list, in order)

1. Measure "Draw it" and the Kokoro voice on the real Quest 3S, and tune them.
2. ~~Live simulations~~ (done in #167). Next: grab and spin a hologram with your hands; "explode it" (parts fly apart and come back); a slider/hand control for a simulation's numbers.
3. "Imagine it" pictures. Gemini image models have no free tier, so the only fully free route is a third-party no-key service. Decide with the owner first.

## Freebuff's queue

- **#67 Fast Action Engine** (replace fixed waits; measure with `action_bench`/`look_timing`) is still assigned to Freebuff.
- **#115 "Answer graded quizzes"** stays **held**: it goes against the coaching-only rule for graded work (AGENTS.md safety lines).

## Traps that cost time this stretch

- Bash heredocs eat backslashes. Write scripts with a file editor; `\b` became a backspace byte once.
- This checkout uses CRLF. In source-text tests use `\s*`, not `\n`.
- `setOrb()` runs while the page is still starting. Anything it touches must be `var` or hoisted, never a `let` declared later.
- Bump `CACHE` in `docs/app/sw.js` with every web change.
- After a squash-merge, `git rebase --skip` the already-merged commits.
- The VR test helpers live in the `util` export at the top of `vr.js`; browser-only code comes after its early `return`.
