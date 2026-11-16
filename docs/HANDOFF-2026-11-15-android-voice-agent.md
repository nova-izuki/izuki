# Handoff: Android voice turn, native voice and the phone AI agent (Claude, 2026-11-15)

Paste this whole file to Freebuff or Codex to take over. Branch: `claude/android-agent` (from main `8f3f6ed`, Release 1.0.216).
PR: https://github.com/nova-izuki/izuki/pull/114 (CI green on the first push: Android APK + JVM tests, Windows build + Rust tests, web). CodeRabbit CLI: two passes, 13 findings, 12 fixed, 1 kept by design (see the PR body).
Worktree on the owner's PC: `C:\Users\nwach\Downloads\Nova_Izuki\izuki\.work\escape`.
Rules that still apply: AGENTS.md "Two developers, one app", docs/COLLAB.md (only Claude bumps versions and releases),
CodeRabbit CLI on uncommitted and committed work before a PR, resolve every GitHub review thread before merging
(recount right before merging), never `git add -A`, never touch another agent's worktree (`.work/sites` has someone
else's uncommitted work), never read or print settings.json / keys.

## What the owner asked for (Android 1.0.216 feedback, 2026-11-15)

1. iPhone-only settings (Hey Siri, iPhone alarms) must not show on Android, and the other way round.
2. "It does the task but it's not speaking": replies were silent on Android.
3. Real phone control by AI, like the PC ("what's taking space on my phone" said "connect your PC" / "what exactly…").
4. The orb's "Tap to talk" opened the app instead of listening. Wanted: tap or "Hey Nova", it pops up, listens and
   answers right there (Siri-style), with the shiny orb visible while it talks.
5. Orb hidden unless "Hey Nova" or Izuki is working (keeping it on screen is optional). Draggable orb is liked.
6. "Hey Nova" does nothing when shouted. Lock-screen features. "Teach my voice" doesn't work.
7. One-tap phone controls: the Notifications label overflows its tile; add more easy controls.
8. Later message: Gemini sometimes slow, especially the first message after coming back ("until I open AI settings
   again"); in-app voice mishears unless you speak loudly; Drive mode should feel like a companion while driving
   (on/off); keep battery use low; the PC's storage reply is an unreadable wall of text.
9. Later message (PC): the Nova Notch should look like the macOS-style notch (a black notch that curves out of the top
   edge, centred), and be completely hidden until the mouse touches the top-middle of the screen, then open.

## Root causes found (code evidence, not verified on the phone)

- **No `<queries>` for `android.speech.RecognitionService` / `android.intent.action.TTS_SERVICE`** in
  AndroidManifest.xml. On Android 11+ that makes `SpeechRecognizer.isRecognitionAvailable()` false and TextToSpeech
  finds no engine. Likely why "Hey Nova" never worked. Fixed (manifest).
- **Silent replies**: Android WebView has no working `speechSynthesis`, so `speakWithPhone` was silent whenever the
  Gemini voice was unavailable or rate-limited (it rests 1–6 h after a 429). Fix: native TextToSpeech.
- **"Hey Nova" paused while Izuki is open** (by design in 1.0.216), so shouting it inside the app did nothing.
- **Phone requests**: `requestLane` sends "…on my phone" to a canned "What exactly would you like to do on your
  phone?" reply, and device-ish requests without a device go to chat or "clarify", which reads as "connect your PC".
- **Mishearing**: in the WebView there is no SpeechRecognition, so the app records with noise suppression and its
  own loudness gate (`v > max(0.015, floor*2.2)`), which drops quiet speech, then uploads the clip.
- **Slow first answer**: (a) `thinkingBudget: 0` is rejected by Gemini 3.x, and the 400 put the model on
  `noThinkKnob`, so every later request thought at full length; (b) Google Search grounding is attached to every
  chat request; (c) a stale connection after the app was in the background waits for the 30 s stall guard.
- **On-device recognizer returning nothing** (Samsung, piped audio) was never treated as a failure, so the wake
  listener could stay "armed" while never matching.

## Design (one session flow)

Native voice turn (`IzukiVoice.java`, all on the main looper):
`idle → (Hey Nova | orb tap | tile | notification "Ask") → [greet "Yes?" on Hey Nova] → listen (Android
SpeechRecognizer, partial words on the orb) → think (text sent to the page as a "turn" event) → talk (page answers,
native TTS, orb "talk" with the reply caption) → follow-up listen if the reply asked a question → done (orb hides
after a few seconds unless "keep orb" is on)`. Tap the orb during a turn = stop. Silence = "I didn't catch that",
then hide. Page not alive = old path (open the app with the words). The wake listener steps aside (hold) while a
turn, a page microphone or native speech is using the audio; it no longer pauses just because Izuki is open.
Locked phone: the turn carries `locked: true`; the page answers general questions only (no memories, no history,
no apps, no phone or PC actions) and says "unlock first" for anything else.

Phone agent (`docs/app/agent.js`): read the accessibility screen, ask the model for ONE JSON action
(`open`, `settings`, `tap n`, `type n`, `scroll`, `back`, `home`, `wait`, `done`, `ask`), run it with the existing
checked primitives, verify the screen changed, repeat (max 14 steps). Facts line (battery, network, storage from
StatFs) goes into every prompt. Never presses send/pay/buy/delete/uninstall/clear/reset (JS check plus a native
check in `click`), never types passwords, never acts while locked, never taps Izuki's own page. Sleeps go through a
native `pause` so a hidden WebView's throttled timers don't stall it.

## Status

- [x] Manifest `<queries>` for speech recognition and TTS.
- [x] `WakeGate.command()` (words after the wake phrase) and wider wake spellings (heynova, "hey, Nova", Hanover at
      the start).
- [x] `IzukiVoice.java`: turn controller, native TTS (`say`, events `speech`), native one-shot `listen` for in-app
      calls, `recordClip` for Teach my voice.
- [x] `IzukiWakeService`: hold bits (page mic / turn / speech) instead of pausing in front; empty-session fallback
      (on-device → plain recognizer → own microphone); `onWake` hands off to `IzukiVoice.wake` when the page is
      alive; notification action "Ask".
- [x] `IzukiAccessibilityService`: orb tap = voice turn / stop; caption tap = open Izuki; "voice" owner has
      priority; resting orb breathes briefly after changes; press feedback; active orb grows.
- [x] `IzukiControlPlugin`: say, hush, listen, stopListening, turnState, turnDone, micBusy, pause, storage,
      openPanel, torch, recordClip, orbPrefs; `click` refuses risky labels unless `risky: true`;
      perform `split_screen`, `close_shade`.
- [x] Tile starts a turn (closes the shade) instead of opening the app.
- [x] native.js wrappers; `orb()` only gates "rest" on the keep-orb setting; keep-orb default off.
- [x] index.html: native TTS in `speakWithPhone`; turns (`onTurn`, voice match on wake audio, locked mode,
      follow-up); native ears in `listen()`; phone lane → agent; iPhone/Android-only sections (`data-only`);
      dock 3-col with stacked labels + "More controls"; Gemini speed (thinking level, tools only when needed,
      first-byte deadline with one retry, warm-up on return/typing); Teach my voice via native recording +
      download progress.
- [x] agent.js + tools/phone-check/agent.test.cjs; WakeGateTest additions.
- [x] PC: shorter storage reply (src-tauri/src/storage.rs; `compose` tested standalone with rustc), no disk nudge right after a report (buddy.rs).
- [x] PC: the Island hides by default until the mouse reaches the top and slides down (`island_always` default off + one-time `island_hidden_v1` switch in settings.rs heal); the Screen notch has laptop-notch ears (styles.css `.izk-notch-shell::before/::after`) and only comes down from the top middle (Island.tsx peek). tools/notch-browser-check.cjs updated but NOT run yet (needs vite + headless Edge; run when the owner is away); Rust tests run in CI.
      files: `src/components/Island.tsx`, `OverlayCanvas.tsx`, `src/styles.css`; coordinate in COLLAB.md).
- [ ] NEXT: merge #114 once CI is green and every GitHub review thread is resolved (recount right before merging), then release 1.0.217 (Claude releases).
- [ ] Drive companion follow-up (honest: the phone can't see the road; can read Maps' next-turn card through
      accessibility, check in, keep "Hey Nova" ready while driving).

## Where things are (for whoever takes over)

- Native turn controller: `android/.../IzukiVoice.java` (`begin`/`wake`/`tap` → `start` → greet/`listen` → `deliver` →
  page "turn" event → page `say` + `turnDone`). Pure rules in `VoiceText.java` (+ `VoiceTextTest`).
- Wake listener holds: `IzukiWakeService.hold(HOLD_PAGE|TURN|SPEECH|EARS|CLIP, on)`; `onWake` hands off to
  `IzukiVoice.wake(...)` when `IzukiVoice.canTurn` (Android control + page listening for "turn" + mic + recognizer).
- Page: `turnCtx` (index.html) marks a voice turn; `onTurn` handler near `receiveWake`; `askLocked` for the lock
  screen; `phoneAgentLane` + the agent block in `ask()`; `listenNative` for calls; `speakWithPhone` → Android voice;
  `teachVoice`/`vmRecord` for the guided Teach my voice screen; `warmBrain`, `thinkingFor`, `needsWeb` for speed.
- Tests: `npm run test:phone` (now includes agent.test.cjs and 24 phone-agent routing checks).
- Verified here: all phone tests, script parse, the dock and Teach my voice screens at 360 px in a headless browser
  with a fake bridge (labels inside tiles; iPhone sections hidden; keep-orb off by default), the storage report's
  `compose` via rustc. NOT verified: the Java compile (Android CI does it), anything on a real phone, the Rust crate
  build (Windows CI).

## Verify before claiming anything

`npm run test:phone`, the JVM tests (Android CI job "Android Companion APK" builds and runs them; no SDK on the
owner's PC), `node --check` on changed JS, inline-script parse of docs/app/index.html, the phone page at Samsung size
with a fake bridge, CodeRabbit. Nothing here has run on a physical phone: say so in the release notes.
