# Local reliability improvements - October 24, 2026

These changes are prepared locally against Izuki 1.0.162. No version bump,
publication, installer build, or installation was performed.

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
