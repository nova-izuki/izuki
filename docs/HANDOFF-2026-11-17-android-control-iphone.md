# Handoff 2026-11-17: Android "full control", voice, design; then iPhone

For Freebuff, Codex or the next Claude. When the owner says "continue",
start at **Next moves** below. Read `AGENTS.md` ("Two developers, one app")
and `docs/HANDOFF-2026-11-15-android-voice-agent.md` first; this note only
adds what changed since.

## Where things stand

- **Released:** 1.0.219 (Run → AI agent, orb caption on either side, voice-
  following orb, native glowing edges with a switch, "Hey Nova" tweaks).
  Verified: updater signatures (key 079F8F3DAA47A42C), setup ProductVersion,
  `latest.json`, APK and IPA attached.
- **Open: PR #121** `claude/android-control` (worktree `.work/escape`), from
  the owner's 1.0.219 test on a Samsung. Head 32fdbbe. CI was green on the
  previous head (f84b573: Android APK incl. JVM tests, Windows, web, iPhone
  project). 8 GitHub CodeRabbit threads were fixed and resolved; a re-review
  was requested. **Not merged, not released.**
- **Held:** Freebuff PR #115 (answers graded quizzes): violates the
  no-test-taking rule; keep it held.

## What PR #121 does (all in the phone app)

The owner's complaints, and the root cause of each:

| Complaint | Root cause | Change |
|---|---|---|
| Orb listens, then says "I didn't catch that" at once | Some speech services (Samsung's) end a session after ~1 s of quiet with "no match"; 1.0.219 also shortened the silence lengths to 1.0/0.8 s | `IzukiVoice.hear()` restarts the recognizer quietly until the person speaks (`VoiceText.listenAgain`: only before speech, ≤8 tries, ≥1.5 s left, not after "I'm done"/time-out); silence back to 1.3/1.0 s; "unclear" when someone spoke |
| Tap to stop doesn't work after a task | The page's background orb beat kept the mode it started with ("Working… tap to stop" for ever); the orb's Stop didn't stop Autopilot | `syncNativeOrb` re-reads `workMode()` each beat; `onStop` also stops Autopilot; native `tap()` answers at once ("Stopped.", light off) |
| Rainbow lines show inside the app / stay on after a task | Two lights: the page's cyan `edge-glow.js` and the native one; the native one had no owner or lease | One native light (`IzukiAccessibilityService.glowFor(owner, on, state, lease)`, plugin `glow`), voice turns own theirs (130 s lease), the page renews every 8 s with a 30 s lease; `IzukiEdge.useNative()` keeps the page's light off while Android draws it, and hands it back if the service isn't connected |
| "The AI sounds too robotic" | Android's default engine/voice (often legacy, quality ≤300) | Google's TTS engine when installed, the best installed voice (`VoiceText.voiceScore`), Settings → Izuki's voice (picker + Hear it); Gemini's natural voice played natively in voice turns (`playClip`, 3.5 s cap, else the phone voice), the orb follows its real loudness (`VoiceText.loudness`) |
| "Full control of my Android" | The agent only read the accessibility list (14 steps, 10 actions) | Set-of-marks screenshots for Gemini (numbers drawn on the controls), `tap_at` (0–1000 on the screenshot), `long_press`, `double_tap`, `swipe`, keys (recents/notifications/quick settings), media/volume/torch, Maps `navigate`, a carried `plan`, a repeat guard (screenshot fingerprint counts as progress), 30 steps. The risky-control check covers **every** control under a touch point |
| "Make it easy, attractive, interactive" | Phone powers hidden behind a grid button; long Settings paragraphs | Home → "On your phone" list (Do it for me, Explain my screen, Hey Nova, The orb, Autopilot, Drive) with live state and an explainer sheet (what, 3 steps, examples, one real action); the one-tap dock folds until opened; Settings notes > 150 chars fold to two lines with "How it works" |

Reference the owner gave for "full control": [mirroir-mcp](https://github.com/jfarcand/mirroir-mcp).
**A reference for how much an agent should be able to do, not a Mac
feature**: Izuki does all of it on the phone itself (accessibility list +
screenshot + gestures). Still missing next to it, for the next Android round:
a `drag` action (from one point/number to another: reorder, sliders, maps;
native `act` already does `swipe` with x/y/x2/y2/ms, a slow swipe is a drag)
and `scroll_to` ("scroll until a control with these words is on screen", a
loop over `scroll` + `screen()` with a step limit). Both need the same
risky-control scan at the end point and agent tests.

Checks: `npm run test:phone` (all suites; new `orb.test.cjs`; natural voice
in turns in `audio.test.cjs`; agent abilities, risky parents, photo swipes in
`agent.test.cjs`), JVM tests in `VoiceTextTest` (listening, voice ranking,
WAV loudness) run in CI's Android job. Screens were checked headless at
412 px with a stubbed bridge (home list, explainer, folded Settings).
**Nothing in #121 has been verified on a physical phone.**

## Next moves, in order

1. **Finish #121.** Wait for CI on 32fdbbe and CodeRabbit's re-review
   (GitHub auto-review is off for this repo, under 10 stars: comment
   `@coderabbitai review`; the free CLI allows ~3 reviews, then wait ~5 min).
   Fix real findings, reply and resolve each thread. **Recount unresolved
   threads right before merging**, then
   `gh pr merge 121 --merge --match-head-commit <full sha>`.
2. **Release 1.0.220** from `origin/main` on a new branch:
   - Notes: `docs/RELEASE-1.0.220.md` from the `docs/NEXT-RELEASE.md` lines
     (plain words, "Checked before release", "Not verified yet"); append a
     1.0.220 block to `docs/DESKTOP-TEST-CHECKLIST.md` (what to try on the
     Samsung: tap orb and wait 3 s before speaking; tap to stop after a Run;
     the light inside and outside the app and that it goes out; natural
     voice; voice picker; agent: "open my files and check what's taking
     space", a photo swipe, a long press; home list and explainers).
   - Versions 1.0.219 → 1.0.220 in: `package.json`, `package-lock.json`
     (2 places), `src-tauri/Cargo.toml`, `src-tauri/Cargo.lock` (the `izuki`
     entry), `src-tauri/tauri.conf.json`, `android/app/build.gradle`
     (`versionCode 220`, `versionName "1.0.220"`), `ios/App/App.xcodeproj/project.pbxproj`
     (`MARKETING_VERSION`, `CURRENT_PROJECT_VERSION = 220`), a new first item
     in `src/components/WhatsNew.tsx`; clear the NEXT-RELEASE list (keep its
     header). Run `npx tsc --noEmit`.
   - PR "Release 1.0.220", squash merge when green. "Auto release on version
     bump" then "Release Izuki (Windows)" publish it. Verify:
     `node tools/verify-updater.mjs <download dir> 1.0.220`, the setup's
     ProductVersion, and
     `curl -sL https://github.com/nova-izuki/izuki/releases/latest/download/latest.json`.
     Delete the downloads afterwards (C: has under 2 GB free).
3. **Android follow-ups** (after the owner's test): read their report and
   Settings → Phone → Diagnostics before guessing. Watch for: a speech
   service that beeps on every quiet restart (then lower the 8 tries), the
   Gemini voice allowance (429 → it rests 1 h and the phone voice speaks),
   Google TTS missing on a phone (falls back to the default engine).
4. **iPhone** (the owner: "complete Android first, then iPhone too").
   Read `docs/IPHONE-ROADMAP.md`: iOS never allows controlling or reading
   other apps, drawing over them, or an always-on wake word. Port what iOS
   allows, honestly:
   - **Voice:** in `speakWithPhone` on iOS pick the best `speechSynthesis`
     voice (names with "Premium"/"Enhanced", the person's language), and
     keep Gemini's voice through the page's audio in the foreground.
   - **Home "On your phone" for iPhone:** its own list in `phoneFeatures()`
     (gate on `IzukiNative.platform() === "ios"` or `data-os="ios"`):
     *Talk to me* (the call), *"Hey Siri, Izuki"* (the Shortcut setup that
     already exists, `data-only="ios"` sections in Settings), *Explain a
     screenshot* (take a screenshot, + in the chat, "explain this": the
     screen assistant's prompt already handles an attached image), *Drive
     mode*, *Your PC* (Remote, Missions), each with the same explainer
     sheet and an honest line about what iPhone doesn't allow.
   - **Native next steps** (Swift, from the roadmap): App Intents "Ask
     Izuki" / "Stop Izuki" first (no paid account needed). A Share
     extension and Live Activities need a paid Apple account: ask the owner.
   - The in-app rainbow light already follows the page (no native overlay
     on iOS), now one rainbow like Android's.
   - The iPhone app has never been tested by the owner: say so, don't claim it works.

## Rules that bit before (keep them)

- Never make Izuki answer or submit graded quizzes/tests (the agent stops on
  test pages; #115 stays held).
- The agent never presses send/pay/buy/delete/install/allow/reset; the person
  taps those. Typed web addresses aren't opened by the agent.
- Don't claim native behaviour works on the owner's Samsung until they confirm.
- Bash heredocs eat backslashes and break on some quoting: write scripts with
  the Write tool. Line endings: keep each file's CRLF/LF (the splice helpers
  in the session normalised them).
- Recount review threads right before every merge; never merge past a red check.
- Don't delete other agents' worktrees or target folders in `.work`.
