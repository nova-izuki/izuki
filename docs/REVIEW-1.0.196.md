# Review log: milestone 1.0.196 (draft PR #16)

How this works: AGENTS.md, "Code review". Before fixing a finding, put your
name in **Claimed by**. If a row is already claimed, leave it alone.
Status: open · claimed · fixed (commit) · dismissed (why).

## CodeRabbit review 1: commit `e80d4aa`, 2026-11-02 14:42 UTC

18 actionable findings, plus 1 unverified lint note.

- **Owners of the code:** Claude (classifier, Office editing, chat/panel modes, workflows), Freebuff (rollback, safe saves).
- **Claims, 2026-11-03:** Freebuff is on Smart Vision (`observer.rs`, its `lib.rs`/`bugs.rs`/`Cargo.toml` hooks) and has no open edits to these files, so Claude claims all 18. Freebuff's Smart Vision files are not touched.

| # | Sev. | Where | Finding | Claimed by | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Trivial | `.github/workflows/auto-release.yml` | Pin `actions/setup-node` to a commit SHA | Claude | claimed |
| 2 | Minor | `.github/workflows/release.yml` | Verify gate should count push runs only | Claude | claimed |
| 3 | Minor | `docs/COLLAB.md` | Milestone row still lists finished work as in progress | Claude | claimed |
| 4 | Major | `extension/assess.js` (+ `assess.rs`) | "1 point" isn't a grading sign | Claude | claimed |
| 5 | Major | `src-tauri/src/assess.rs` (+ `assess.js`) | Grading signs after 6,000 characters are missed | Claude | claimed |
| 6 | Major | `src-tauri/src/assess.rs` (+ `assess.js`) | A sidebar "Practice quiz" link makes any quiz practice | Claude | claimed |
| 7 | Major | `src-tauri/src/chat.rs` | `[EDIT:]` isn't in `TOOL_WORDS`/`find_tool`: Chat never runs it | Claude | claimed |
| 8 | Major | `src-tauri/src/ext.rs`, `extension/sidepanel.js` | Research searches the web with the web switch off | Claude | claimed |
| 9 | Major | `src-tauri/src/ext.rs` | Research gets the page's title but not its text | Claude | claimed |
| 10 | Minor | `src-tauri/src/files.rs` | Binary check reads the whole file into memory | Claude | claimed |
| 11 | Minor | `src-tauri/src/officeedit.rs` | `validate` rejects a BOM before `<` | Claude | claimed |
| 12 | Major | `src-tauri/src/officeedit.rs` | ADD clones the whole paragraph (pictures, IDs, bookmarks) | Claude | claimed |
| 13 | Minor | `src-tauri/src/textbook.rs` | `pdf_text` has no panic guard | Claude | claimed |
| 14 | Major | `src-tauri/src/updates.rs` | Rollback requests have no timeout | Claude | claimed |
| 15 | Major | `src-tauri/src/updates.rs` | Rollback skips the pre-exit cleanup (audio, call tunnel) | Claude | claimed |
| 16 | Minor | `src-tauri/src/updates.rs` | Rollback doesn't hold the update operation guard | Claude | claimed |
| 17 | Major | `src/components/UpdateControls.tsx` | Nothing calls `check_rollback`, so the button never shows | Claude | claimed |
| 18 | Minor | `src/components/UpdateControls.tsx` | Rollback wording is technical | Claude | claimed |
| (extra) | Minor, unverified | `docs/VALIDATION-2026-11-02.md` | Blank line before a heading (markdownlint) | Claude | claimed |

## Found outside CodeRabbit

| Sev. | Where | Finding | Claimed by | Status |
| --- | --- | --- | --- | --- |
| Low | `scripts/pack-extension.mjs` | The packed extension zip stores `icons\icon-16.png` with backslashes (PowerShell 5.1 `Compress-Archive`). Windows extracts it fine; other unzip tools make a file with a backslash in its name. Found by `tools/asset-check.mjs`, which warns. | — | open |

## Limits of the review

- CodeRabbit reviews every file (`.coderabbit.yaml` switches off all its default skips). Binary files (images, audio, models, archives) are in scope, but their bytes can't be read as code. `tools/asset-check.mjs` checks them in CI.
- A push can go unreviewed (rate or service limits). This log records that, rather than assuming a review happened.
- A clean review is not a release decision. The tests and `docs/MILESTONE-1.0.196.md` are.
