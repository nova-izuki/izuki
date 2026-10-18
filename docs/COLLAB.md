# Working together on Izuki (Claude + ChatGPT/Codex + Freebuff)

Three AI assistants work in this repo for the same owner, sometimes at the
same time. The full rules are in [AGENTS.md](../AGENTS.md). Read this before editing, and update it when you take or finish
something. Small, atomic edits only: never rewrite a whole file another
assistant is also changing.

## Ground rules (from the owner)
- Ship tested work straight to `main`. Before pushing, run `cargo test --lib`,
  `npx tsc --noEmit`, `npm run build` and the `test:*` scripts.
- **Only Claude bumps the version and releases.** Codex and Freebuff push
  without touching versions, then add a line to `docs/NEXT-RELEASE.md`.
  Claude ships it with the next release.
- Never commit the owner's personal face model, keys, emails or phone numbers.
- Nothing is sent, posted, deleted or bought without the user's explicit yes.
- Never claim something works without testing it; say what wasn't verified.

## Who's on what
| Area | Files | Owner |
| --- | --- | --- |
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
