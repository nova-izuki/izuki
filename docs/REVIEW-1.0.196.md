# Review log: milestone 1.0.196 (draft PR #16)

How this works: AGENTS.md, "Code review". Before fixing a finding, put your
name in **Claimed by**. If a row is already claimed, leave it alone.
Status: open · claimed · fixed (commit) · dismissed (why).

## CodeRabbit review 1: commit `e80d4aa`, 2026-11-02 14:42 UTC

18 actionable findings, plus 1 unverified lint note.

- **Owners of the code:** Claude (classifier, Office editing, chat/panel modes, workflows), Freebuff (rollback, safe saves).
- **Claims, 2026-11-02:** Freebuff is on Smart Vision and Smart Developer Mode (`observer.rs`, `devmode.rs`, `DeveloperMode.tsx`, and their hooks). It had no open edits to these 18 findings' code, so Claude claims all 18 and leaves Freebuff's files alone. Freebuff's Developer Mode row says it may touch `files.rs` and `updates.rs` too, so Claude's edits there are small, and listed in COLLAB.md before committing.

| # | Sev. | Where | Finding | Claimed by | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Trivial | `.github/workflows/auto-release.yml` | Pin `actions/setup-node` to a commit SHA | Claude | fixed (commit “CodeRabbit review 1 fixes”): `checkout` and `setup-node` pinned to commits resolved from GitHub (setup-node's matches CodeRabbit's) |
| 2 | Minor | `.github/workflows/release.yml` | Verify gate should count push runs only | Claude | fixed (commit “CodeRabbit review 1 fixes”): the release gate counts `event=push` runs only, like auto-release |
| 3 | Minor | `docs/COLLAB.md` | Milestone row still lists finished work as in progress | Claude | fixed (commit “CodeRabbit review 1 fixes”): the row now points at the checklist instead of repeating its status |
| 4 | Major | `extension/assess.js` (+ `assess.rs`) | "1 point" isn't a grading sign | Claude | fixed (commit “CodeRabbit review 1 fixes”): any “N point(s)/pt(s)” is a grading sign in both classifiers; 2 new cases; `reads_points_as_a_score` and the JS twin |
| 5 | Major | `src-tauri/src/assess.rs` (+ `assess.js`) | Grading signs after 6,000 characters are missed | Claude | fixed (commit “CodeRabbit review 1 fixes”): grading signs are searched across the whole page (bounded at 200,000 characters); case with a due date after 8,400 characters |
| 6 | Major | `src-tauri/src/assess.rs` (+ `assess.js`) | A sidebar "Practice quiz" link makes any quiz practice | Claude | fixed (commit “CodeRabbit review 1 fixes”): practice NAMES count only in the title, address or main heading; SENTENCES (“does not count toward your grade”) anywhere; 2 sidebar cases now graded |
| 7 | Major | `src-tauri/src/chat.rs` | `[EDIT:]` isn't in `TOOL_WORDS`/`find_tool`: Chat never runs it | Claude | fixed (commit “CodeRabbit review 1 fixes”): `EDIT` in `TOOL_WORDS`, `find_tool` carries its body; `the_chat_stream_runs_an_edit` tests classify, find_tool and needs_correction |
| 8 | Major | `src-tauri/src/ext.rs`, `extension/sidepanel.js` | Research searches the web with the web switch off | Claude | fixed (commit “CodeRabbit review 1 fixes”): `panel_route` — web switch off means no searches in any mode (Research answers offline and says so); the AI-tab prompt says not to search; `the_web_switch_decides_before_the_mode` |
| 9 | Major | `src-tauri/src/ext.rs` | Research gets the page's title but not its text | Claude | fixed (commit “CodeRabbit review 1 fixes”): `research::run_about` gives the shared page to planning and the write-up as labelled reference data; unshared pages send no text |
| 10 | Minor | `src-tauri/src/files.rs` | Binary check reads the whole file into memory | Claude | fixed (commit “CodeRabbit review 1 fixes”): reads at most 8 KB before the binary check |
| 11 | Minor | `src-tauri/src/officeedit.rs` | `validate` rejects a BOM before `<` | Claude | fixed (commit “CodeRabbit review 1 fixes”): a BOM and whitespace before `<` are accepted; `a_byte_order_mark_is_still_xml` (garbage still refused) |
| 12 | Major | `src-tauri/src/officeedit.rs` | ADD clones the whole paragraph (pictures, IDs, bookmarks) | Claude | fixed (commit “CodeRabbit review 1 fixes”): `fresh_paragraph` builds the new paragraph from the paragraph properties and the first run's look; the test paragraph carries a paraId, picture, bookmark, footnote, tracked change and section break, each still appearing once. Also confirmed worse than reported: the section break was copied too |
| 13 | Minor | `src-tauri/src/textbook.rs` | `pdf_text` has no panic guard | Claude | fixed (commit “CodeRabbit review 1 fixes”): `pdf_text` runs under `catch_unwind`, like `read_book` |
| 14 | Major | `src-tauri/src/updates.rs` | Rollback requests have no timeout | Claude | fixed (commit “CodeRabbit review 1 fixes”): 10-minute bound. Not 30 s: the plugin's timeout covers the whole download (see open item below) |
| 15 | Major | `src-tauri/src/updates.rs` | Rollback skips the pre-exit cleanup (audio, call tunnel) | Claude | fixed (commit “CodeRabbit review 1 fixes”): rollback and update share `closing_for_installer` |
| 16 | Minor | `src-tauri/src/updates.rs` | Rollback doesn't hold the update operation guard | Claude | fixed (commit “CodeRabbit review 1 fixes”): `rollback_previous` takes and holds `PACKAGE` before anything else |
| 17 | Major | `src/components/UpdateControls.tsx` | Nothing calls `check_rollback`, so the button never shows | Claude | fixed (commit “CodeRabbit review 1 fixes”): Settings calls `check_rollback` once (not the banner); a failed lookup hides the button instead of showing an error |
| 18 | Minor | `src/components/UpdateControls.tsx` | Rollback wording is technical | Claude | fixed (commit “CodeRabbit review 1 fixes”): plain wording in the confirm and the button tooltip |
| (extra) | Minor, unverified | `docs/VALIDATION-2026-11-02.md` | Blank line before a heading (markdownlint) | Claude | fixed (commit “CodeRabbit review 1 fixes”): confirmed (heading at line 99 had no blank line before it) |

**Verification for these fixes:** `cargo test --lib` (full suite), `npx tsc --noEmit`, `tools/workspace-check.mjs` and `workspace-worker-check.mjs` (29 classifier cases shared with Rust), the headless-Edge question-page check, `test:panel`, `test:chat-text`, `test:conversation`. **Not verified live:** the rollback path (it needs an older published release installed over this build: a drill for the owner), and Research with a real page (needs the app and a provider).

## CodeRabbit review 2: commit `d03c161`, 2026-11-02 15:01 UTC

15 actionable findings. This review proves incremental reviews work with the new config. 4 are in Claude's files; 11 are in Freebuff's Smart Vision work (`cfc05e1`). Freebuff is actively editing those files (Developer Mode), so they're left for Freebuff to claim.

| # | Sev. | Where | Finding | Claimed by | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Low | `.coderabbit.yaml` | Some default skips still on (`Package.resolved`, `*.min.css`, hashed bundles…) | Claude | fixed (commit “CodeRabbit review 1 fixes”): the Xcode/Swift, minified-CSS/hashed-bundle and development-file defaults added; 121 switched off in all, from the docs' list |
| 2 | Low | `docs/REVIEW-1.0.196.md` | Claim dated 2026-11-03 on 2026-11-02 | Claude | fixed (commit “CodeRabbit review 1 fixes”): corrected here and in COLLAB.md |
| 3 | Low | `tools/asset-check.mjs` | Repo path breaks in a folder with a space | Claude | fixed (commit “CodeRabbit review 1 fixes”): `fileURLToPath` |
| 4 | Medium | `tools/asset-check.mjs` | A truncated file crashes the checker without naming it | Claude | fixed (commit “CodeRabbit review 1 fixes”): each file and each character cross-check is guarded and reported by name; tested with a header-only .ico |
| 5 | High | `src-tauri/src/lib.rs` | Start the observer after creating the main window | — (Freebuff's) | open |
| 6 | Major | `src-tauri/src/bugs.rs` | Sensitive data exposure (bug text to the observer) | — (Freebuff's) | open |
| 7 | Major | `src-tauri/src/observer.rs` | Sensitive data exposure | — (Freebuff's) | open |
| 8 | Medium | `src-tauri/src/bugs.rs` | The observer misses `[bug]` events when bug sending isn't configured | — (Freebuff's) | open |
| 9 | Medium | `src-tauri/src/observer.rs` | The two-minute duplicate rule is never used (a blinking caret fills the ring) | — (Freebuff's) | open |
| 10 | Medium | `src-tauri/src/observer.rs` | Time floor but no load throttle | — (Freebuff's) | open |
| 11 | Medium | `src-tauri/src/observer.rs` | `start`/`stop` can leave stuck or duplicate threads | — (Freebuff's) | open |
| 12 | Medium | `src-tauri/src/observer.rs` | `FRAMES` locked across network and disk writes | — (Freebuff's) | open |
| 13 | Trivial | `src-tauri/Cargo.toml` | Security misconfiguration (dependency for the dev feature) | — (Freebuff's) | open |
| 14 | Low | `docs/MILESTONE-1.0.196.md` | A validation record dated in the future | — (Freebuff's) | open |
| 15 | Low | `docs/MILESTONE-1.0.196.md` | Observer token path written with control characters | — (Freebuff's) | open |

## Found outside CodeRabbit

| Sev. | Where | Finding | Claimed by | Status |
| --- | --- | --- | --- | --- |
| Medium (to verify) | `src-tauri/src/updates.rs` normal update | The updater plugin's timeout covers the whole request, download included. With the normal path's 30 s, a 70 MB installer would fail below about 2.4 MB/s. The owner's update worked (a fast connection), so this is unverified on slow links. Next: time a throttled download before changing the working path. | — | open |
| Low | `scripts/pack-extension.mjs` | The packed extension zip stores `icons\icon-16.png` with backslashes (PowerShell 5.1 `Compress-Archive`). Windows extracts it fine; other unzip tools make a file with a backslash in its name. Found by `tools/asset-check.mjs`, which warns. | — | open |

## Limits of the review

- CodeRabbit reviews every file (`.coderabbit.yaml` switches off all its default skips). Binary files (images, audio, models, archives) are in scope, but their bytes can't be read as code. `tools/asset-check.mjs` checks them in CI.
- A push can go unreviewed (rate or service limits). This log records that, rather than assuming a review happened.
- A clean review is not a release decision. The tests and `docs/MILESTONE-1.0.196.md` are.
