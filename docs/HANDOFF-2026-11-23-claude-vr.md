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
- **All VR PRs #141–#169 are merged** (web, so izukinova.ai/vr has them once Pages deploys). #175 (handle a hologram) is the open one.

## PC app, release 1.0.223 (published 2026-11-23, Latest; `latest.json` says 1.0.223)

Measured first in `%APPDATA%\Izuki\logs\izuki.log`: "find a pizza place near me" took 5 AI rounds (~75 s); OpenRouter's free models 429'd 225 times in one morning; every browser step sent a screenshot (~3,700 tokens) to a vision model.

| PR | What |
|---|---|
| #178 | `apps::web_search_request`: plain searches ("search for…", "look up…", "google…", "… near me") open results at once in `instant_command`, no AI. `freebrains::rest_model`: two OpenRouter `:free` models rate-limited within 2 min rest them all. **Alt+Space ask bar** (`AskBar.tsx`, setting `hotkey_ask`, check `tools/ask-bar-check.cjs`): one box, Enter sends via `EV.runChat` and gives the mouse back, the answer shows under it. The dictate (and ask) key rebinds without a restart. |
| #183 | `brain::page_look`: browser looks with the extension's page (8+ elements, text, nothing visual asked: `needs_picture`) send **no screenshot** (`PAGE_LOOK`); no step back → one retry with the picture; a failed step → `PICTURE_NEXT`. **Mic**: `instant::mic_state/mic_on/mic_advice`, command `mic_windows_advice`; silence → Izuki says Windows has the mic muted; "unmute my mic" → `Act::MicOn`. |

- **The owner's "PC mic hears nothing" (since 2026-11-12) was Windows' own mute** on the Intel SST mic array (28%). Unmuted to 80% with the owner's yes. Check Windows' mute and level first for any such report.
- Rust tests need `IZUKI_TEST_MANIFEST=1 cargo test --lib` (else `STATUS_ENTRYPOINT_NOT_FOUND`). C: had ~5 GB free: share one build folder (`CARGO_TARGET_DIR` = the main checkout's `src-tauri/target`); a full build took 41 min here.
- **Next on the PC (owner's asks, not started):** a coordinate grid over screenshots for apps with no readable controls (games, drawing; owner saw UI-TARS do it); Izuki's own background tab with a live view in the chat; then more speed (several steps per look). Keep it simple: the owner said "as simple and easy to use, but very interesting, not boring".

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
| #168 | **A headset isn't a phone**: `HEADSET_HIDE` (one list) hides phone-only parts on a headset (Drive, iPhone/Android-only sections, install, "read this phone's screen"); `headsetWords` + a MutationObserver say "headset" in the app's own words, never in the chat, typed text or the PC's real menu path "Settings → Phone → Call Izuki from your phone" |
| #169 | VR **"play … on YouTube"**: the room can't show web pages or video, so Izuki leaves the room and opens YouTube's search in a new tab; if the headset blocks a voice-opened tab, a full-screen **Play on YouTube** link (a tap always works) and **Back to the room** |
| #175 | VR **handle a hologram**: grab a part and move sideways to turn it (fling to keep it spinning); voice: spin it, stop spinning, turn it around, bigger/smaller, explode it, put it back together (`HOLO_VIEW`, `holoView`, `viewTick`, `explodeDirs`) |
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
- "Draw it", real photos, planets/ISS, physics, the headset wording, YouTube and hologram handling were checked in headless Edge only (screens and numbers), not on the Quest yet. Hand-turning and the YouTube tab need the real headset.
- **The room's own browser** ("search the web for…") is Google results plus a page's text read aloud, not real web pages; never confirmed working on the Quest. Test it first thing.

## Review and workspace notes

- **Merged without a CodeRabbit review** (its free reviews were used up; tests and CI passed): #161–#165, #167–#169 and #175. Run `coderabbit review` on them when it resets, and fix what it finds.
- The CodeRabbit **CLI hit its rate limit** on 2026-11-23. #160–#163 were asked for review on GitHub (`@coderabbitai review`) instead.
- **Merge script trap:** `gh pr checks --watch` once returned early and #169 merged with checks still pending (main then passed everything). Poll until nothing is pending instead.
- Physics trap: `new Float32BufferAttribute(arr, 3)` **copies** `arr`, so writing to `arr` later draws nothing. Write to `geo.attributes.position.array` (see `simLine`).
- `.work/vr` was left with conflicted bridge files: an old 2026-11-03 stash was popped by mistake. The stash entry is still there, and nothing was lost. Check it, or `git checkout HEAD -- <those files>` there; don't commit from it as is. Fresh work used `.work/sketch`, `.work/photos`, `.work/pc-keys` and `.work/rev`.
- Measured: Kokoro in headless Edge spoke a real WAV. On this laptop's CPU it's far slower than real time (53 s for 4.5 s of speech), and headless WebGPU is software. The Quest's GPU speed is still to be measured.

## Next (owner's list, in order)

1. Measure "Draw it" and the Kokoro voice on the real Quest 3S, and tune them.
2. ~~Live simulations~~ (#167) and ~~grab, spin, explode~~ (#175). Next: a hand slider for a simulation's numbers; real part shapes (Freebuff #172).
3. "Imagine it" pictures. Gemini image models have no free tier, so the only fully free route is a third-party no-key service. Decide with the owner first.

## Freebuff's queue (set by Claude, the release coordinator, 2026-11-23)

**Freebuff: stop building VR in a separate `vr/` sandbox project.** Your hand-off (quiz, sleep, custom wake name, to-scale, `unPile`) describes work that isn't in this repo, so it never reaches the owner's headset and drifts from the real code. The real VR app is `docs/app/vr.js` and `docs/app/vr-scene.src.js`. Work on a `freebuff/…` branch from the latest `main`, open a PR into `main`, and run `npm run test:phone` plus a headless 3D preview check before asking for a merge.

In order (bridge tasks, `agent:freebuff`):

1. **#171 VR quiz with memory**: port your quiz into vr.js, with wrong answers weighted and never the one just missed straight away. Extend it to sketches, physics (answers from `simFacts`) and planets.
2. **#172 Real part shapes** (`it.shape`): after #175 merges, because it builds on #175's `holoNode`/`holoTick`. Shared geometries only.
3. **#173 Listening ring** on the orb after a tap (zero cost when hidden).
4. **#174 Wake name**: cache it; refuse common words.

Claude is working on the room itself (#175, then the simulation hand slider), so leave `holoTick`, `viewTick` and the grab code to Claude unless your issue says otherwise. Say on the issue before touching another assistant's open PR.

- **#67 Fast Action Engine** (replace fixed waits; measure with `action_bench`/`look_timing`) is still assigned to Freebuff.
- **#115 "Answer graded quizzes"** stays **held**: it goes against the coaching-only rule for graded work (AGENTS.md safety lines).

## Traps that cost time this stretch

- Bash heredocs eat backslashes. Write scripts with a file editor; `\b` became a backspace byte once.
- This checkout uses CRLF. In source-text tests use `\s*`, not `\n`.
- `setOrb()` runs while the page is still starting. Anything it touches must be `var` or hoisted, never a `let` declared later.
- Bump `CACHE` in `docs/app/sw.js` with every web change.
- After a squash-merge, `git rebase --skip` the already-merged commits.
- The VR test helpers live in the `util` export at the top of `vr.js`; browser-only code comes after its early `return`.
