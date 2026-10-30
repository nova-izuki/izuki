# Working together on Izuki (Claude + ChatGPT/Codex + Freebuff)

Three AI assistants work in this repo for the same owner, sometimes at the
same time. The full rules are in [AGENTS.md](../AGENTS.md). Read this before editing, and update it when you take or finish
something. Small, atomic edits only: never rewrite a whole file another
assistant is also changing.

## Ground rules (from the owner)
- Ship tested work straight to `main`. Before pushing, run `cargo test --lib`,
  `npx tsc --noEmit`, `npm run build` and the `test:*` scripts.
- Approved exception for 1.0.163: on October 24, 2026, the owner explicitly asked Codex to release this tested batch through the updater. Codex owns this release only.
- **Only Claude bumps the version and releases.** Codex and Freebuff push
  without touching versions, then add a line to `docs/NEXT-RELEASE.md`.
  Claude ships it with the next release.
- Never commit the owner's personal face model, keys, emails or phone numbers.
- Nothing is sent, posted, deleted or bought without the user's explicit yes.
- Never claim something works without testing it; say what wasn't verified.

## Who's on what
| Area | Files | Owner |
| --- | --- | --- |
| Claude's 1.0.186 handoff shipped as b0e8a6d (2026-10-30), under the owner's standing release request. Freebuff's 1.0.187 includes that commit and is now the latest public release. Latest updater manifest, both installer signatures/hashes, and Windows/phone workflow success verified. No further version changes. | `docs/VALIDATION-2026-10-30.md`, this coordination row and ignored release-check artifacts only. | Codex (publication verification complete) |
| Freebuff's screen-text OCR fallback shipped in 1.0.187 (a57b0b0). Concurrent local `brain.rs` and `extension/connect.js` edits are left for Freebuff; Codex will not stage or change them or run the manual foreground-window test. | `src-tauri/src/brain.rs`, `extension/connect.js` | Freebuff |
| Finished Claude's 1.0.186 handoff (2026-10-30): city-learning setting, bounded geocoding, review findings, release-note self knowledge, chat rendering, five promised Looks and browser-panel fixes. Released in b0e8a6d; included in Freebuff's 1.0.187. | Atomic follow-up fixes in pending source files, `winlook.rs`, UI setting and validation docs. | Codex (released and verified) |
| Continued the browser side panel after Codex hit its limits, at the owner's request (2026-10-29): Codex had added `sidepanel-state.js` and the new controls in `sidepanel.html` but never wired `sidepanel.js`, so Connect, the assistant picker, follow-questions and the companion switch were dead UI. New `extension/providers.js` (10 assistants incl. Claude, Copilot, Perplexity, Grok, DeepSeek, Le Chat and an "any tab I pick" catch-all, with composer/send selectors) and `extension/connect.js` (connect, tab pick, follow-the-page using Codex's QuestionGate, companion switch). Additive hooks only in `sidepanel.js`; routed Codex's own `prepare_side_task` / `run_side_task` / `side_task_status` / `cancel_side` / `companion_preference`, which were written but had no caller, at `/izuki/side/*` and `/izuki/companion`; deleted the two simpler routes I had added first, because Codex's review-token handshake, one-task lane and "only the reviewed prompt is action authority" rule are stronger. Panel's Run button now does prepare -> show the exact words -> run with the token -> poll -> Stop. Also: `docs/extension/izuki-extension.zip` (what the website hands out) was three weeks stale and had none of the new files — `sidepanel.js` imports `connect.js`, and a failed import stops a module loading at all, so the panel would have opened blank for every new download. Added `scripts/pack-extension.mjs` (`npm run extension`), which refuses to pack a manifest or page that refers to a file that is not there, and repacked. Extension manifest 1.4.2 -> 1.5.0 so Chrome picks it up. `tools/panel-check.mjs`. On a graded page it reads the question and shows what the AI said; it never picks, types or submits an answer — the gate from 1.0.136 stands. | Claude |
| Browser assistant connection, opt-in live question help, provider-tab handoff and explicit desktop task handoff (2026-10-29) | `extension/sidepanel.*` (UI agent), new provider adapter + `background.js` (provider agent), `ext.rs` + atomic chat fixes (backend agent); tests, archive and docs (Codex). No version changes. | Codex team |
| Continue Claude's unfinished 1.0.175 work; verify action retries, web reading, voice delays, shortcuts, and test-process cleanup (2026-10-27) | Atomic fixes in existing pending files; browser harnesses; validation notes. Versions and existing edits preserved. | Codex with action, performance, and UI review agents |
| Shared backend webpage scraping requested across chat surfaces | `web.rs`, read-only web tool loop in `chat.rs`, atomic `page_ask.rs` integration | Codex |
| Owner requested independent Island chat history, detachable bubble and docking (active) | New `IslandChatWorkspace.tsx`, atomic AskPage extraction/export and dock placeholder in `Island.tsx`, overlay mount | Codex |
| Owner explicitly requests direct factual answers instead of blanket quiz refusals; optional local enrolled-voice wake filter with multiple people | Atomic answer-policy fixes in `brain.rs`, `vision.rs`; new speaker worker/profile UI and helpers, wake hook integration, model allowlist | Codex + Claude (released in 1.0.165; Claude added `tools/speaker-match-check.cjs`, 12 cases, and the release notes) |
| Follow-up bugs requested by owner: cancelled dictation, strict physical key release, readable/scrollable transcript, direct-question routing and unsolicited guide offers (active) | `useDictation.ts`, atomic fixes in `VoiceEngine.tsx`, `hotkey.rs`, `speechInput.ts`, `TranscriptBar.tsx`, `VoiceSphere.tsx`, `study.rs` | Codex |
| Smart notes (Codex built the backend; Claude finished, checked and released it in 1.0.164 at the owner's request, 2026-10-24) | `notes.rs`, `notes/context.rs`, `studylog.rs`, NotesTab | Claude (released) |
| Persistent Dynamic Island (owner asked Claude to continue it, 2026-10-24; released in 1.0.165: always-on pill, hidden-until-hover, move anywhere, reminder cancel) | Island.tsx, related IPC/types/settings | Claude (released) |
| 1.0.163 release (owner explicitly requested Codex release on 2026-10-24) | Version manifests, release notes, WhatsNew | Codex (released and verified) |
| WAV sample validation | `audiofile.rs` | Codex (done locally, 2026-10-24) |
| Finished and shipped 1.0.165 (owner asked to continue from where Claude/Codex stopped): smart-notes release work, the Dynamic Island, wheel fix below | Version manifests, `docs/RELEASE-1.0.165.md`, `WhatsNew.tsx` | Freebuff (released, 2026-10-24) |
| Mouse wheel: only taken when the pointer is really over something that scrolls (`overlay::set_wheel_target` + `hitTest.scrolls`) | `wheel.rs`, atomic edits in `overlay.rs`, `commands.rs`, `lib.rs`, `lib/hitTest.ts`, `lib/ipc.ts` | Freebuff + Claude (released in 1.0.165: Claude wrote the WH_MOUSE_LL hook and the overlay scroll handler, Freebuff added the "only where it scrolls" gate; Claude registered `set_overlay_wheel` and the `setOverlayWheel` api, which were still missing, and de-duplicated the concurrent edits) |
| Island chat browser check repairs (stale Vite dep cache, broken selector quoting, Enter key fields, wait after reload) | `tools/island-chat-check.cjs` | Freebuff (done locally, 2026-10-24) |
| Phone toolbar overflow | `docs/app/platform.css`, `docs/app/sw.js`, `tools/browser-check.cjs` | Codex (done locally, 2026-10-24) |
| FL project reader validation and song timing | `flp.rs`, atomic summary/save fixes in `flstudio.rs` | Codex (done locally, 2026-10-24) |
| Gmail across every account, briefings | `mail.rs`, `headsup.rs` (email parts) | Claude |
| Account health (all linked apps) | `accounts.rs`, `AccountHealthCard.tsx` | Claude |
| Campus hub, Lecture Mode | `campus.rs`, `lecture.rs`, `CampusHub.tsx` | Claude |
| Empire (businesses, website check, attention briefing) | `empire.rs`, `EmpireCard.tsx` | Claude |
| Terminal tutor (CMD/PowerShell lessons) | `tutor.rs` | Claude |
| Discord reconnect/resume | `discord.rs` | Claude |
| Style tab: looks, auto, tweaks | `winlook.rs`, `tweaks.rs`, `StyleTab.tsx`, `lib/styleNav.ts` | Claude |
| Deep research (chat) and web search engines | `research.rs`, `web.rs`, `ResearchPanel.tsx` | Claude |
| Keep-awake during missions | `awake.rs` | Claude |
| Island glances (missions, lesson) | `island.rs`, `Island.tsx` | Claude |
| Execution verdicts, contracts, budgets | `execution.rs`, `model.rs` (`TaskOutcome`) | ChatGPT |
| Mission evidence journal | `mission_journal.rs`, `missions.rs` | ChatGPT |
| Textbooks, Blackboard, study diary, Study log | `textbook.rs`, `blackboard.rs`, `studytrack.rs`, `studylog.rs`, `StudyCards.tsx` | Claude |
| Voice turn-taking, quiet hours | `VoiceEngine.tsx` (say/takeTurn), `headsup.rs` (quiet hours), `tts.rs` | Claude |
| Releases: version bumps, release notes, What's New | `package.json` and the other version files, `docs/RELEASE-*.md`, `WhatsNew.tsx` | Claude |
| Website: bring it up to date with features through 1.0.135 | `docs/index.html`, `docs/llms.txt`, `docs/sitemap.xml` | Freebuff (first task) |
| Missions card | `MissionsCard.tsx`, `ipc.ts` mission types | ChatGPT |
| Voice OS instant commands (volume level, snap, lock, screenshot, task manager) and local clock/battery answers | `instant.rs`, `brain.rs` (`run_instant`), `VoiceEngine.tsx` comment, `docs/index.html` card | Freebuff (released in 1.0.176 at the owner's request; repo rule says Claude releases — owner asked Freebuff directly) |

## Shared skills (local, in `.claude/skills/`, not in git)
- `izuki-dev`: architecture, traps and the checklist.
- `ffmpeg`: converting, cutting, recording, and the .y4m Air test clips (FFmpeg 9.0 is installed).
- `yt-dlp`: details, transcripts, audio/video, within the rules (yt-dlp isn't installed; ask first).

## Open items
- (Done by Claude in 1.0.116, after Codex hit its limit) Missions card wording should be plain and friendly for a
  non-technical user (map checkpoint phase and stop reason to words like
  "Paused at the time limit"). The `TaskCheckpoint` type in `ipc.ts` should
  match the Rust `Checkpoint` (`checkpoint_failure`, `journal_version`,
  `evidence`, `journal_incomplete`). These were flagged by CodeRabbit on
  1.0.116.
- Claude: Island 2.0 (adaptive states, expansion panel, settings); provider
  orchestration beyond retry-after/backoff; Touch Grass phone dashboard.
- Either: any new helper thread inside a mission must carry the execution
  context (`execution::current()` then `execution::attach(..)` in the thread).
