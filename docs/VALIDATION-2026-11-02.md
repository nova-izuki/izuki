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
