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

## CodeRabbit review 3: commit `b55f0ed`, 2026-11-02 15:38 UTC

8 findings, all on Claude's commit, so Claude claims them. (Reviews of `a476b18` and `09b705e` are on Freebuff's work: Freebuff's to claim.)

| # | Sev. | Where | Finding | Claimed by | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | High | `.github/workflows/release.yml` | A hand-pushed tag on a verified, unmerged milestone commit could be released (Verify now runs on milestone branches) | Claude | fixed (commit “CodeRabbit review 3 fixes”): the release refuses a commit that isn't on main (full-history checkout, `merge-base --is-ancestor`), like auto-release |
| 2 | Low | `docs/REVIEW-1.0.196.md` | The "normal update 30 s" item is wrong: the download already gets 10 minutes | Claude | fixed (commit “CodeRabbit review 3 fixes”): confirmed (`updates.rs` sets 10 minutes before downloading). The item below is dismissed |
| 3 | High | `src-tauri/src/assess.rs` (+ `assess.js`) | "Exercise 4" with "1 point" isn't quiz-like, so the graded guard is off | Claude | fixed (commit “CodeRabbit review 3 fixes”): assessment-only signs (attempts, submit quiz, marked out of…), or a score plus a school word, make a page an assessment. Points alone don't (a shop's “Redeem 500 points” stays clickable). 5 new shared cases |
| 4 | Medium | `src-tauri/src/officeedit.rs` | `element` stops at the first closing tag: nested `w:pPr`/`w:rPr` in tracked changes give broken XML | Claude | fixed (commit “CodeRabbit review 3 fixes”): `element` counts nesting; `nested_tracked_changes_stay_whole` |
| 5 | Low | `src-tauri/src/research.rs` | Numbers from the shared page are flagged as unsupported | Claude | fixed (commit “CodeRabbit review 3 fixes”): the shared page is part of the number check |
| 6 | Low | `src-tauri/src/updates.rs` | A successful rollback lookup clears a real update error | Claude | fixed (commit “CodeRabbit review 3 fixes”): the lookup no longer clears an update error |
| 7 | High | `src/components/UpdateControls.tsx` + `updates.rs` | Rollback looks the release up again and could install a different version than the one confirmed | Claude | fixed (commit “CodeRabbit review 3 fixes”): `rollback_previous` takes the confirmed version and refuses if the lookup or the installer's manifest names another |
| 8 | High | `src/components/UpdateControls.tsx` | Rollback is hidden whenever an update is offered | Claude | fixed (commit “CodeRabbit review 3 fixes”): shown whenever there's a version to go back to, disabled only while an operation runs |

## CodeRabbit review 4: commits `d99e3c9`…`5e882b1`, 2026-11-02 21:36 UTC

4 findings, all on Claude's commits, so Claude claims them.

| # | Sev. | Where | Finding | Claimed by | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | High | `src-tauri/src/updates.rs` (+ `tauri.conf.json`) | The rollback version check reads the *unsigned* manifest. An altered manifest could pair it with another installer signed by the same key | Claude | fixed (commit “CodeRabbit review 4 fixes”): `requireSignedVersion: true`, so the updater compares the version written in the signature (which the signature covers) with the announced one, for updates and rollback alike. Checked in the plugin's source first, and 1.0.195's signatures carry `version:1.0.195`. `verify-updater.mjs` now refuses to publish a release whose signature lacks the version or names another; a faked 1.0.194 with real 1.0.195 signatures is refused on all 3 entries |
| 2 | High | `src-tauri/src/assess.rs` (+ `assess.js`) | “Attempt 3 of 3” wasn't a grading sign (only 1 and 2 were listed) | Claude | fixed (commit “CodeRabbit review 4 fixes”): any “attempt N of”; `shows_attempt` tests; case added |
| 3 | Low | `src-tauri/src/assess.rs` (+ `assess.js`) | A checkout with “Have a question?” and “Use 500 points” counted as graded | Claude | fixed (commit “CodeRabbit review 4 fixes”): a school word counts only in the page's own title or address, or as a numbered question (“Question 2”). Cases: the checkout is not a quiz; “Week 5 / Question 2 — 1 point” is graded |
| 4 | Low | `docs/ANDROID-SIGNING.md` | The rotation step needs `--rotation-min-sdk-version 28`, or apksigner uses the new key only on Android 13+ | Claude | fixed (commit “CodeRabbit review 4 fixes”) |

## CodeRabbit review 5: commit `53d705d`, 2026-11-02 23:07 UTC

4 findings, all on Claude's commit.

| # | Sev. | Where | Finding | Claimed by | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | High | `src-tauri/src/assess.rs` (+ `assess.js`) | “Week 5” + “Question #1 — 1 point” read as no quiz, so the graded guard was off | Claude | fixed (commit “Review 5–6 fixes”): a numbered question may carry a label mark (“#1”, “No. 3”, “number 4”, “nº 2”), in both classifiers. 6 shared cases (4 graded, 2 still not quizzes); the 4 graded ones fail on the old code |
| 2 | Low | `docs/ANDROID-SIGNING.md` | `apksigner sign` has no `--signer`: the old key is `--ks`, then `--next-signer --ks` the new one | Claude | fixed (same commit) |
| 3 | Low | `docs/MILESTONE-1.0.196.md` | Mark the bridge fix as planned | Claude | outdated: both parts were committed by then (02a3521, 343986d). The row did still say “Part 2 open”, which was stale: reworded to name the commits |
| 4 | Low | `docs/MILESTONE-1.0.196.md` | The secret-scan row was ✅ though the release-candidate scan is still to come | Claude | fixed: ⏳, with the current tree ✅ and the release candidate ⏳ |

## CodeRabbit review 6: commit `343986d`, 2026-11-03 02:18 UTC

| # | Sev. | Where | Finding | Claimed by | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | **High** (confirmed) | `src-tauri/src/ext.rs` bridge | Izuki trusted any request with the extension's header. Any program on the PC (another Windows user's included) could take jobs, send fake results, ask with this user's AI, or **prepare and run a desktop task**: `/side/prepare` handed the review token straight back to whoever asked | Claude | fixed (commit “Review 5–6 fixes”): every request is signed by the extension with the pairing key, HMAC of “time\npath\nsha256(body)”, good for 2 minutes and only once (`request_signed`, `first_use`). Unsigned requests get a 403 and a set-up-again message. `/ping` still answers, so the extension can tell it's Izuki. Plain jobs are gone. Tests: `requests_must_be_signed_by_this_users_extension` (key, route, body, time, age, replay), a vector shared with `bridge-auth-check.mjs` part 3, and the worker and panel stand-ins now refuse unsigned requests (the worker check fails with a non-signing extension). **User impact:** an extension from before 1.6.0, or one added by hand, is ignored until set up from Izuki. The settings card says so (“set up again”), as do the help and download pages |
| 2 | Low | `tools/workspace-worker-check.mjs` | The ping stand-in didn't check the extension header | Claude | fixed: it checks the header and the signature on every request |
| 3 | Low | `AGENTS.md` | “No review command is needed” isn't always true | Claude | fixed: what to do when a push goes unreviewed. (The “paused” reply on the PR was CodeRabbit answering a manual review command on a commit it had already reviewed; automatic review is on.) |
| 4 | Medium | `src-tauri/src/ext.rs` Research | A page's own title and address went into the research prompt as if the user said them | Claude | fixed: labelled as reference, never instructions, and length-capped |

## CodeRabbit review 7: commit `fe01c94` (Freebuff), 2026-11-03 02:36 UTC

| # | Sev. | Where | Finding | Claimed by | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | High | `src-tauri/src/lib.rs:590` | Smart Vision captures the desktop while the main window is hidden | Freebuff (owner) | open |
| 2 | Low | `src-tauri/src/observer.rs:569` | The redaction test depends on the host's user name | Freebuff (owner) | open |
| 3 | Low | `tools/repros/…username-leak/*.log` | The repro logs carry the Windows user name in paths | Claude (tiny fix, noted in COLLAB.md) | fixed: the name is replaced by `<user>` in both logs; the evidence reads the same |
| 4 | Low | `docs/VALIDATION-2026-11-02.md:148`, `docs/MILESTONE-1.0.196.md:50` | Test counts differ between rows | Freebuff (owner) | open |

## CodeRabbit review 8: commit `b2312a9` (Freebuff), 2026-11-03 02:53 UTC

| # | Sev. | Where | Finding | Claimed by | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Low | `AGENTS.md:18-24` | Export and erase-all were described as working; they're planned | Claude (my sentence) | fixed: says what works today and points to `docs/PRODUCT-PRINCIPLE.md` |

## CodeRabbit review 9: commits `a078c58`…`080cdf7`, 2026-11-03 03:58 UTC

6 findings, all on Claude's commits.

| # | Sev. | Where | Finding | Claimed by | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | High | `.github/workflows/mobile.yml` | After the first rotated release, a release built without the key would carry a public-key-only APK that Android 9+ phones refuse as an update | Claude | fixed: every build reads the signer of the latest published APK (reported in the log, so the check stays proven); once that one is rotated, a release that can't rotate stops |
| 2 | High | `docs/help/index.html` (+ settings card) | Someone who loaded the zip by hand runs it from their own folder: Reload doesn't pick up the paired one | Claude | fixed: remove the old one and Load unpacked the folder Izuki shows (Reload only when it's already that folder), in the help page and both card messages |
| 3 | Low | `docs/MILESTONE-1.0.196.md` | The Android row overstated the release gate | Claude | fixed with #1, wording corrected |
| 4 | Low | `docs/WORKSTREAMS.md` | "Every message either way is signed" isn't true: Izuki's answers are plain | Claude | fixed: says which messages are signed and why the rest is safe to send |
| 5 | Medium | `src-tauri/src/assess.rs` | `numbered` copied the rest of the page text for every "question" | Claude | fixed: borrowed slice, no copy |
| 6 | Medium | `src-tauri/src/ext.rs` | `from_hex` took "+8" for "08", so a copied request could pass `first_use` under another spelling | Claude | fixed: exactly 64 plain hex digits, and `from_hex` takes hex digits only. Test respells a real byte (`08` → `+8`) of the shared vector |

## Found outside CodeRabbit

| Sev. | Where | Finding | Claimed by | Status |
| --- | --- | --- | --- | --- |
| **High** (reproduced) | `extension/background.js` ↔ `src-tauri/src/ext.rs` (bridge on 127.0.0.1:47615) | The extension runs jobs from whatever answers on the bridge port, and nothing on either side proves who it is. While Izuki isn't running, any program can hold the port, including another user's on a shared PC. `readlinks` then fetches **any URL with the user's sign-ins** and returns its text (not only links on the page), and `snapshot`/`click`/`type`/`open` work on the tab in front. **Reproduced** with the real `background.js` in a sandbox: a stand-in server holding no secret got a private page's text back. Fix: a per-user pairing key, every job signed for the extension's own challenge, `readlinks` limited to links on the page. | Claude | **part 1 fixed** (commit “Bridge: the extension takes jobs only from Izuki”):
- **Key:** a random key per user is kept in Izuki's data folder and written into the extension folder Izuki sets up (`pairing.json`, not readable by web pages). Folders set up by an earlier Izuki get it when Izuki starts.
- **Jobs:** every job is signed (HMAC-SHA256) for a fresh 16-byte challenge from the extension. Unsigned, wrong-key or replayed jobs are ignored, and the loop stops instead of spinning.
- **Links:** `readlinks` reads only links on the page.
- **Older extensions** get the plain format: the app stays compatible, and the protection is in the new extension (1.6.0).
- **Tests:** `tools/bridge-auth-check.mjs` (5 cases, fails on the old code) and `ext.rs` tests, including an RFC 4231 HMAC vector shared by ring and WebCrypto.
- **User impact:** an extension loaded by hand from the website zip has no key, so Izuki can't drive that browser until it's set up from Izuki (Settings → Browser extension). The side panel still works.

**Part 2 fixed** (commit “Bridge part 2: nothing private goes to the port unless Izuki proves itself”): before a question, page text, a note, a selection, a quiz explanation or a desktop task is sent, `extension/bridge-proof.js` pings with a fresh challenge and checks Izuki's signed proof (trusted for a minute). Stop always goes through, since it carries only an id. The panel's light says “Set up from Izuki” or “Not Izuki” instead of “Connected”. Tests: 5 more cases in `bridge-auth-check.mjs`, and the real-Edge panel check with a signed mock. |
| ~~Medium (to verify)~~ | `src-tauri/src/updates.rs` normal update | ~~The 30 s timeout would cut off a slow download.~~ | Claude | dismissed: wrong. The 30 s is for the check; `fetch` sets 10 minutes before downloading (`updates.rs:305`). Pointed out by CodeRabbit review 3. |
| Low → High | `scripts/pack-extension.mjs`, `docs/extension/izuki-extension.zip` | The zip stored `icons\icon-16.png` with backslashes. **Repacking it showed the website's zip was stale:** no `assess.js` (which the quiz runner injects, so a run on a quiz page would fail) and 6 older files, all this milestone's extension changes. | Claude | fixed (commit “CodeRabbit review 3 fixes”): the packer names entries with `/` itself (.NET ZipFile) and refuses a missing `files:[…]` injection; `asset-check` now compares the zip with `extension/` file by file and fails on backslashes. The old zip fails by name (7 files), the new one passes |

## Limits of the review

- CodeRabbit reviews every file (`.coderabbit.yaml` switches off all its default skips). Binary files (images, audio, models, archives) are in scope, but their bytes can't be read as code. `tools/asset-check.mjs` checks them in CI.
- A push can go unreviewed (rate or service limits). This log records that, rather than assuming a review happened.
- A clean review is not a release decision. The tests and `docs/MILESTONE-1.0.196.md` are.
