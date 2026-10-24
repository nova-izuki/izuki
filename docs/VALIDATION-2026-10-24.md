# Local reliability improvements - October 24, 2026

These changes were first validated locally against Izuki 1.0.162, then published
as 1.0.163 at the owner's explicit request on October 24, 2026. No local
installation was performed.

## Published updater verification

- Release: https://github.com/nova-izuki/izuki/releases/tag/v1.0.163
- Release commit: `2a5bdcb5bfc8d4d2d1c786ab96d0f92e81e55283`.
- Published at 22:22:51 UTC (5:22:51 PM America/Chicago), not a draft or prerelease.
- All five release-commit workflows passed: verification, Windows release,
  mobile builds, automatic tagging, and Pages deployment.
- Public `releases/latest/download/latest.json` reports 1.0.163, with signed
  artifacts and matching signature files for all three Windows updater entries.
- The 71,099,754-byte NSIS installer was downloaded and its Minisign signature
  verified cryptographically against the public key embedded in Izuki.
- Its SHA-256 matched GitHub's artifact digest and the stable `Izuki-Setup.exe`.
- Android preview APK, iPhone sideload IPA and portable Windows executable exist.
- Published phone CSS and service-worker cache v67 were checked over HTTPS.
- Automatic checks announce the update. Downloading and installing require the
  user's action. The installed app and live FL session were not changed.

## What changed

- Reject incomplete FL project headers, event data, note records and Playlist
  records instead of describing a partial read as a complete project.
- Keep note positions accurate beyond the 32-bit tick boundary and truncate
  returned note lengths at a clip's end.
- Count arranged notes without building and sorting a timeline per channel.
- Warn about missing patterns or channels actually referenced in the arrangement.
- Only describe an FL save as observed when the project timestamp changed.
- Validate WAV chunks, channel counts, rates, complete frames and sample values.
  Recognize standard extensible PCM/float GUIDs and reject unsupported GUIDs.
- Keep all nine phone toolbar actions visible, with separate touch targets and
  full-size icons in both iPhone and Android styles.

## Validation

- Production build (including TypeScript): passed.
- Conversation, Air, phone, voice, companion and HTML scripts: passed.
- Real Edge browser checks: passed, including iPhone and Android toolbar layouts
  at 320, 390, 768 and 1024 pixels. Screenshots were inspected at 320 and 768.
- Focused WAV tests compiled from the production module: 4 passed, 0 failed.
- Earlier full Rust run: 429 passed, 0 failed, 43 existing ignored tests.
- Final-source full Rust run: 433 passed, 0 failed, 43 existing ignored tests.
- Release-version 1.0.163 full Rust run: 433 passed, 0 failed, 43 existing ignored tests.
- Synthetic arrangement comparison: identical counts; 24.760 ms for per-channel
  timelines versus 3.285 ms for single-pass counts on this run (about 7.5x).
- CodeRabbit reviews completed; actionable findings were corrected, including
  test-variable shadowing, empty toolbar-query coverage, arranged-only warnings,
  and release-note punctuation.

## Reproduce

Run `npm.cmd run build`, all `test:*` scripts from package.json and
`node tools/browser-check.cjs` from the project root. For the native suite,
set `IZUKI_TEST_MANIFEST=1` and run `cargo test --lib` in `src-tauri`.
To see the synthetic note-count comparison after compilation, run
`cargo test --lib large_arrangement_counts -- --nocapture` with the same setting.
The comparison checks identical counts for 128 channels and 512 repeated and
shortened clips; it measures this calculation, not whole-app latency.

## Limits

No live FL Studio save or audio session was changed to validate these fixes.
The repository's existing ignored live, account and device tests remain ignored.
Browser emulation does not replace testing on physical phones. The checks do not
establish that every app feature is bug-free or that network tasks have no delay.
