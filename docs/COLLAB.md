# Working together on Izuki (Claude + ChatGPT/Codex)

Two AI assistants work in this repo for the same owner, sometimes at the same
time. Read this before editing, and update it when you take or finish
something. Small, atomic edits only: never rewrite a whole file another
assistant is also changing.

## Ground rules (from the owner)
- Ship tested work straight to `main` with a version bump (the owner's standing
  instruction). Before pushing, run `cargo test --lib`, `npx tsc --noEmit`,
  `npm run build` and the `test:*` scripts.
- Never commit the owner's personal face model, keys, emails or phone numbers.
- Nothing is sent, posted, deleted or bought without the user's explicit yes.
- Never claim something works without testing it; say what wasn't verified.

## Who's on what
| Area | Files | Owner |
| --- | --- | --- |
| Gmail across every account, briefings | `mail.rs`, `headsup.rs` (email parts) | Claude |
| Terminal tutor (CMD/PowerShell lessons) | `tutor.rs` | Claude |
| Discord reconnect/resume | `discord.rs` | Claude |
| Keep-awake during missions | `awake.rs` | Claude |
| Island glances (missions, lesson) | `island.rs`, `Island.tsx` | Claude |
| Execution verdicts, contracts, budgets | `execution.rs`, `model.rs` (`TaskOutcome`) | ChatGPT |
| Mission evidence journal | `mission_journal.rs`, `missions.rs` | ChatGPT |
| Missions card | `MissionsCard.tsx`, `ipc.ts` mission types | ChatGPT |

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
