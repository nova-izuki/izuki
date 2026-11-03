# Handoff to Freebuff and back, November 2, 2026 (milestone-196)

Starting point: Claude Code reached its usage limit mid-task, with everything
still uncommitted on the `milestone-196` branch. The owner asked Freebuff to
continue the work, not restart it. Freebuff inspected the branch, saw no
sign the tree had changed since Claude stopped, left every other agent's
edits alone, and claimed the context below in `docs/COLLAB.md` before changing
anything.

## What Claude had already done (found in the working tree, uncommitted)

- `officeedit.rs` (new): real Word/PowerPoint/Excel edits into a copy
  ("report (Izuki edit).docx"), an Excel cell editor, cell-addressed reading,
  and new .docx/.xlsx built from plain text — heavily unit-tested, including
  the ignore-marked `real_files` harness for files made by python-docx,
  openpyxl and python-pptx.
- `files.rs`: [OPEN:] for .xlsx/.pdf/.odt/.ods/.odp, the `[EDIT:]` hook, and
  refusals for careless text writes over existing Office files.
- `chat.rs`: `[EDIT: path]` parsing, the Allow card, the FILES_RULE wording.
- `assess.rs` + `tools/assessment-cases.json` (new), `brain.rs` Look changes:
  the practice/graded classifier side of the milestone.
- Extension changes (sidepanel, question-page, question-runner, workspace),
  workflow updates, and the `tools/*check*` harnesses.

## What Freebuff added this session

The four problems Claude had identified in safe file writing, in `files.rs`
and `officeedit.rs`:

1. **Atomic saves.** `files::atomic_save`: the bytes are written to a hidden
   `.name.izuki-tmp<n>` file beside the target, flushed to the drive
   (`sync_all`), and only then put in place with one
   `MoveFileExW(REPLACE_EXISTING | WRITE_THROUGH)` on Windows (a POSIX
   `rename` elsewhere, which is atomic already). A crash or a full disk
   leaves no half-file, and the old version stays whole until the swap.
   Plain-English errors for a full disk (os error 112), a write-protected
   folder (5) and a file open elsewhere (32). Every save path in `files.rs`
   and the `[EDIT:]` copy in `officeedit.rs` go through it.
2. **Backups that never overwrite each other.** `backup_path` picks
   "(before Izuki)", then "(before Izuki 2)" and on, so each save keeps its
   own old version instead of reusing one file.
3. **Binary files protected from text writes.** `looks_binary` (magic
   signatures: zip, 7z, gz, bz2, PNG, JPEG, GIF, MP3 + sync word, RIFF,
   OggS, PDF, MZ, old Office 0xD0CF…, SMB, plus a zero-byte scan) refuses
   `[WRITE:]` over a picture, archive or program — tested with a PNG, a zip
   and an MP3, which are left byte-for-byte unchanged. FL Studio's .flp
   (plain text at heart) stays writable.
4. **Generated Office files checked before they land.** `officeedit::validate`
   (zip opens, content-type list present, document/workbook/presentation
   part present and starting with XML) and `validate_new` (the generated
   file declares its own content type and its `_rels/.rels` points at the
   document). A `[WRITE:]` .docx/.xlsx that fails the check is torn up and
   said — never saved as a broken file; every `[EDIT:]` copy is checked too.

## Checks run (this machine, after the changes)

- `cargo test --lib` full suite: **574 passed, 0 failed, 45 ignored**
  (the ignored set is the fixtures-only harnesses, among them
  `officeedit::tests::real_files`, which needs `IZUKI_OFFICE_DIR` pointing at
  files made by the real Office libraries). New tests added:
  `repeat_saves_keep_every_backup`, `a_failed_save_leaves_the_file_whole`,
  `text_never_overwrites_a_binary_file`, `office_files_are_made_whole_and_checked`,
  `the_checkers_accept_real_files_and_reject_broken_ones`.
- Not run this session: `npx tsc`, `npm build`, the JS `test:*` scripts, the
  panel/browser checks, and anything else from the milestone §7 list — the
  Office file-writing work above did not touch those areas, but they must be
  re-run on the release candidate (also Claude's git status had already
  touched extension files, so a combined pass is owed before publication).
- Not verified on this PC (Office not installed, as before): .docx/.xlsx
  opened by real Word/Excel; the owner does the final check.

## CodeRabbit

Claude's pending CodeRabbit review left no local result to recover. A fresh
review needs the branch on GitHub: push `milestone-196` and open a draft PR
or add the CodeRabbit app to the repo. **Not done yet** — the milestone
holds no push to `main`, and the reviewer should see the other agents'
uncommitted extension/brain work included, which means those small commits
come first. Nothing was passed as reviewed without evidence.

## Low-disk adaptations

C: had 19 GB free at the start (97% used). The Rust test build reused the
existing 11 GB target directory (no clean builds, no new large outputs);
tests were run in the background so the laptop stayed usable. No personal
files or another agent's work were touched.

## What Claude Code should do next

1. Read `docs/COLLAB.md` first — Freebuff's row and the untouched rows.
2. The extension/AI-tabs work (Codex's rows) is still uncommitted in the
   tree; test and commit it in small pieces, or hand it back.
3. Continue `docs/MILESTONE-1.0.196.md` from §2: the extension classifier,
   AGENTS.md rule 6 wording, then rollback, Think deeper, the Smart Vision
   observer, eye control, and the §7 release-candidate pass (full Rust
   suite, tsc, every test:*, panel browser checks, CodeRabbit, secret scan).
4. When the release candidate is verified, ask the owner, bump the version,
   and let the automatic release pipeline publish — that remains Claude's job.

## Overnight (same machine, owner asleep): hardening, rollback, verified rows

1. **Safe saves, deeper:** `a_failed_swap_never_takes_the_original_with_it`
   (the final one-move swap itself failing — here a folder in the way —
   leaves the folder byte-for-byte whole and removes its hidden temp file)
   and `saves_sweep_the_leftovers_of_a_dead_save` (a crash mid-save leaves a
   hidden `.name.izuki-tmpN`; the next save sweeps only hour-old ones for the
   same stem, so a save in flight is never touched). Commit 292bd53.
2. **"Go back to the previous version"** (milestone §3): the newest public
   GitHub release below this build is picked (`previous_release`), its own
   `latest.json` becomes the updater endpoint with a `version_comparator`
   override that allows stepping down, and the installer is downloaded and
   minisign-verified exactly like a forward update before it runs — behind
   the main-window-only, not-while-busy, confirm-card guards the updater
   already has. Updated `UpdateControls.tsx` with the label and button.
   Every published release on GitHub does ship `latest.json`; verified
   against 1.0.195/1.0.194/1.0.193 live data. Commit e70463e.
3. **Milestone rows flipped on evidence, not hope:** §2 extension
   classifier and §4 Think deeper switch were found fully implemented and
   test-covered in the tree (assess.js + workspace checks; ext.rs mode
   routing + panel/browser checks) and are now marked done with the
   specifics. §3 rollback is `🧪 built, testing` (unit tests, tsc, build
   pass; an actual older installer was not run on this PC).
4. **Build failure chased and explained:** the test harness suddenly failed
   to load (0xC0000139). Not disk corruption, not a broken system DLL: it
   was the missing `IZUKI_TEST_MANIFEST=1` on my test runs — build.rs only
   embeds the comctl32 v6 dependency into the lib-test harness with it, and
   without it the harness binds System32's comctl32 v5, which has no
   `TaskDialogIndirect`. Pe-level archaeology (import/export/manifest
   parse) found the truth; test runs from now on always set the variable.
5. **CodeRabbit:** still not present — no PR or issue on this repo has ever
   had a CodeRabbit comment, so the app isn't installed on the repository.
   Installing it is an owner action (GitHub Marketplace); until then the
   "CodeRabbit review" line in §7 cannot proceed, honestly, by any route.
6. Full `cargo test --lib` after everything: **577 passed, 0 failed, 45
   ignored**. `tsc --noEmit` and `npm run build` clean. All commits pushed
   to draft PR #16 (now 4 checkpoint commits on `milestone-196`).
7. **Verified loop, round 3 (2026-11-02 evening):** two High findings in the
   Smart Vision developer observer were reproduced before any fix. (a) the
   timeline stored the raw user name: a regression test that records a bug
   message containing the path C:\Users\<user>\Downloads\trace.log FAILED, with the
   untouched path in the stored timeline (detect-before.log; repro data in
   tools/repros/2026-11-02-observer-timeline-username-leak/). Fix: redact at
   the observer::record boundary, so every caller text is scrubbed once.
   The same test then passes (retest-after.log), and both suites rerun green
   (596 and 585 passed, 45 skipped, 0 failed). (b) the devvision startup
   lookup ran before the main window existed: the block moved to run inside
   setup after the window is accessible; verified by inspection and suites
   (a full IZUKI_VISION runtime check needs a dev build on this PC).
8. Still not done from round 3: the CI test run for devvision
   (tools/test-windows.ps1), the unconfigured-bug-marking event, the
   duplicate-note rule online state, the locks and start/stop races, and
   the remaining Security finding near line 840. Minors stay on the list.
