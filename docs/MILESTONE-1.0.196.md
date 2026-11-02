# Milestone 1.0.196: one coordinated release

The owner's rule (2026-11-02): every requested feature and fix in this cycle goes into ONE public release.

- The work lives on the `milestone-196` branch.
- No version tag, push to `main` (which also deploys the website), or auto-update until the release candidate is verified and the owner explicitly approves publishing.

Status: ✅ done and tested · 🧪 built, testing · 🔨 in progress · ⏳ pending · ⛔ blocked (needs a decision or hardware)

## 1. Office files: create and edit

| Item | Status | Notes |
| --- | --- | --- |
| Edit .docx / .pptx / .xlsx into a copy (`officeedit.rs`) | 🧪 | Replace, add a paragraph after one, set an Excel cell. The original is never touched. Unit-tested on real file structures. |
| `[EDIT: path]` in the chat, with Allow first | 🧪 | Parse test; same Allow card as saving. |
| New .docx / .xlsx from text (`[WRITE:]`) | 🧪 | Before this, text saved as .docx made a broken file. |
| Read .xlsx (cell addresses), PDF text, .odt/.ods/.odp | 🧪 | |
| Safe saves (Freebuff, 2026-11-02, finishing Claude's task) | 🧪 | Every save is now atomic (hidden temp file in the same folder, flushed, then one `MoveFileEx` replace): a crash or a full disk leaves no half-file, and the old version stays until the swap. Each save backs up into its own `(before Izuki)`, `(before Izuki 2)` file, so repeated saves don't overwrite the backup. Text writes refuse to overwrite binary files (PNG/JPEG/GIF/MP3/RIFF/Ogg/PDF/zip/7z/gz/old Office/programs, or anything with zero bytes) — a photo, archive or FL-style file can't be hollowed out with plain words. |
| Generated Office files checked whole (Freebuff, 2026-11-02) | 🧪 | `officeedit::validate`/`validate_new`: the zip opens, the content-type list and the document part are there, and a generated file declares its type and relationship properly; a broken or mislabelled file is torn up, never saved. Applies to `[WRITE:]` .docx/.xlsx and to every `[EDIT:]` copy. |
| Files open in real Word/Excel | ⏳ | Office isn't installed on this PC; checked with independent readers instead. Final check by the owner. |

## 2. Browser automation, AI tabs, practice vs graded

| Item | Status | Notes |
| --- | --- | --- |
| Shared page classifier (`assess.rs`, `tools/assessment-cases.json`) | 🧪 | Graded / practice / not a quiz, from the page's own evidence. Unclear means graded. |
| Desktop agent: practice pages allow answers; only graded ones hold back | 🧪 | `brain::Look`; regression test that school pages keep downloads, uploads, Next and rubric clicks. |
| "What I can do" instead of a bare refusal | 🧪 | `assess::what_i_can_do`. |
| Extension: the same classifier; practice pages allow picking in the panel's runner | ✅ | Found in the tree and kept (Claude/Codex): `extension/assess.js` plus the question page's own decision, tested by `tools/workspace-check.mjs` against the case list and by the headless-Edge page check; never Submit or Finish. |
| AGENTS.md rule 6 updated to the practice/graded distinction | ✅ | Already edited in the tree (in the same commit as `assess.rs`). |
| Side by side, AI-tab draft fix, floating Run task | ✅ | Shipped in 1.0.193 and 1.0.194. |

## 3. Rollback and recovery

| Item | Status | Notes |
| --- | --- | --- |
| "Go back to the previous version" (signed installer from the previous release) | 🧪 | Freebuff, 2026-11-02: Settings → Updates gains "Go back to 1.0.195" when the machine's current depth of check is understood — the previous release is picked from GitHub (public releases only), its own `latest.json` becomes the updater endpoint (a `version_comparator` override is what allows going down), and the installer is downloaded and signature-checked with the same key as a normal update, then run with a confirm card. Tested: the release picker (`updates::tests`, 3 passing, malformed and prerelease tags included), `tsc`, `npm run build`. Not exercised here: actually running an older installer on this PC — that is for the owner or a rollback drill. |
| Installer waits for Izuki to close (hooks.nsh) | ✅ | Shipped in 1.0.193; verified on the owner's PC (about 1 minute vs 13). |

## 4. Think deeper

| Item | Status | Notes |
| --- | --- | --- |
| Browser panel: Think deeper / Research switch, with progress shown | ✅ | Already built and tested (found in the tree): the panel's Quick / Think deeper / Research radios reach `ext.rs` (`mode`), Think deeper asks for checked reasoning, Research runs the step-by-step research with progress lines ("Searching …", "Reading nist.gov…"), and the mode is remembered. Tests: `ext.rs` mode/progress tests, `tools/panel-check.mjs`, and `tools/panel-browser-check.cjs` (research click, progress text, saved mode). |

## 5. Smart Vision Developer Observer (owner-only)

| Item | Status | Notes |
| --- | --- | --- |
| Compile-time dev feature; absent from public builds | ✅ | Freebuff, 2026-11-03: cargo feature `devvision`; `observer` module is `#[cfg]`-gated, and the timeline hooks (files::atomic_save, bugs::report) and the setup hook compile out with it. Proof: the default `cargo test --lib` — the release shape — still passes 577/0/45 with the feature off, and passes with it on. The release pipelines never enable the feature, and even a dev build only observes when the owner sets `IZUKI_VISION=1`. |
| Event-driven capture of Izuki's window, deduplicated, bounded | 🧪 | The watcher grabs Izuki's own window rect (GetWindowRect) through the public region capture every 700 ms at most, hashes the downscaled pixels (FNV-1a) and keeps the frame only when the view is new, in a 40-frame JPEG ring. Dedupe, hashing and ring bound are unit-tested (5 tests). Not yet exercised end-to-end against a live window overnight — first real run is for the owner. |
| Action/verification timeline correlated with screenshots | 🧪 | `observer::record` writes bounded (500) timeline events; a finished atomic save records an "action", a bug report records a "verification", and each entry can name the frame at or just before its moment (`frame_at_or_before`). The hooks are in and compile-gated; live correlation still needs a real session to point at. |
| Capture Bug (shortcut and button) producing a structured report | 🧪 | Backend exists and is now reachable: `observer::capture_bug` folds frames, `timeline.json`, a `summary.json` and the log tail into one dated folder, and the Developer panel's Capture Bug button (new `src/components/DeveloperMode.tsx`, dev builds only) calls it. The global shortcut is still open — the button covers the same need in the same build. |
| Authenticated local connection for Claude Code | 🧪 | A loopback-only HTTP server (random port, one request at a time) serves `/api/status`, `/api/events`, `/api/frames/<n newest>` and a dashboard, every request checked against a Bearer token from `%APPDATA%\Izukiision	oken`. Wrong and missing tokens are refused (unit-tested); the end-to-end curl against a running app still needs one live session. Read-only by design. |
| Dashboard | 🧪 | Served by the same loopback server at `/`: status line, full timeline (HTML-escaped) and a frame gallery. Not yet opened in a real browser against a running app. |
| Throttling under load; benchmarks on the owner's laptop | ⏳ | The pacing rule (max one grab per 700 ms, duplicate views skipped) is unit-tested; actual capture-cost numbers on a 16 GB dev laptop are still to be measured in a real run. Not ThinkPad-specific: the discovery is path-free, so the numbers transfer to any dev machine. |

## 5b. Smart Developer Mode (owner-only control panel)

| Item | Status | Notes |
| --- | --- | --- |
| ON/OFF control of Smart Vision, Claude Live Auto-Review, Smart Real Testing | 🧪 | Freebuff, 2026-11-03: `src-tauri/src/devmode.rs` inside the same `devvision` feature — three independent switches, everything OFF whenever the app starts (no state is persisted), each off OFF truly stops its work (capture released, buffers dropped, a running scenario killed), not just hidden UI. |
| Developer panel in the dev build only | 🧪 | New Settings card (`DeveloperMode.tsx`) mounted next to Bug/Updates cards; in public builds it renders nothing (the `dev_*` commands exist everywhere but refuse outside dev builds — the same refusal is what keeps the panel invisible). |
| Claude Live Auto-Review | 🧪 | Arms the diagnostic-analysis channel: while on, the review digest (events since the last review, frame indexes) may be assembled and read through the observer's token-guarded loopback endpoints — the reviewer is external; the toggle only arms the pipeline and drops gathered data on OFF. |
| Smart Real Testing with an approved fixed allowlist | 🧪 | Three scenarios fixed in code (`rust-core`, `workspace`, `panel`) — running anything outside the list is refused, one scenario at a time, results kept in a bounded ring with output tails. The scenarios are plain package.json/cargo commands, so the set is portable to any dev machine; nothing can merge, publish, deploy or release from this panel (there is no such code path). |
| Emergency Stop All + Capture Bug | 🧪 | Both buttons in the panel; Stop All flips all three off for real, cancels a running scenario, and reports what it did; Unit tests cover the refusals, OFF-by-default, workspace-root discovery (no hardcoded laptop paths) and the digest bounds. |
| Public builds carry none of this | 🧪 | Default-feature suite passes identically (profile unchanged); the `dev_*` commands compile everywhere but their dev internals live behind `devvision`. |

### 5b. Developer Control and the live test loop

| Item | Status | Notes |
| --- | --- | --- |
| Smart Developer Mode: Smart Vision, Claude Live Auto-Review and Smart Real Testing switches, all off by default; Capture Bug; Stop All | 🔨 | Freebuff (claimed in COLLAB.md): `devmode.rs`, `DeveloperMode.tsx`, built on `observer.rs` and the `devvision` feature. Dev builds only. |
| One real observe → diagnose → fix → retest cycle, recorded | ⏳ | Needs a `devvision` dev build running on a development machine. Before and after recorded in the review log; never "fixed" on a compile alone. |

## 6. Eye control (Air control)

| Item | Status | Notes |
| --- | --- | --- |
| Face/iris tracking, look-then-snap, blink/pinch press, hands-free reading | ⏳ | Needs the owner's real camera for the final check. |

## 7. Integration, regressions, performance

| Item | Status | Notes |
| --- | --- | --- |
| Full Rust suite, tsc, every test:* script, panel browser checks | ⏳ | Run on the release candidate. |
| CodeRabbit on every push to PR #16 | ✅ | Automatic, drafts included, incremental, never auto-paused; all 121 default skips off. Validated against the official schema with a strict key check. Review 1 (18 findings): all fixed. Review 2 (15): Claude's 4 fixed, Freebuff's 11 open. See `docs/REVIEW-1.0.196.md`. |
| Release pipeline hardening | 🧪 | Tags only commits whose Verify passed (push runs), never republishes, checks asset sizes, verifies every updater signature against the app's key (`tools/verify-updater.mjs`, proven on 1.0.195 and on 3 tampered cases), versions agree (`tools/check-versions.mjs`), actions pinned in auto-release. Needs a real release run to be ✅. |
| Binary assets checked in CI (`tools/asset-check.mjs`) | ✅ | 521 assets and 38 character rigs. A corrupted PNG, a truncated WebP and a header-only icon are all caught by name. |
| Secret scan | ✅ | 2026-11-02: every tracked file and every line in git history checked for Google/OpenAI/Anthropic/GitHub/Slack/Groq/NVIDIA/AWS/Telegram/Discord keys and private-key blocks. Only hits: deliberate fake values in the scrubber's tests (`bugs.rs`, `memory.rs`). CodeRabbit also runs gitleaks on each review. Redo on the release candidate. |
| Performance review | ⏳ | Release candidate. |
| Android preview signing key in the repo | ⛔ | Separation done: preview builds use a private key from GitHub secrets once one is added, and release builds use only an environment key, never the repo's. CI refuses a new key that would strand installed phones. **Owner decision:** path A (rotation, no reinstall on Android 9+) or path B (everyone reinstalls once), see `docs/ANDROID-SIGNING.md`. |
| Release candidate → owner approval → one release | ⏳ | |
