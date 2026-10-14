# APEX foundation: execution verdicts and mission recovery

Scope: the first reliability increment from the October 14, 2026 APEX,
True Intelligence, Campus Infinity, and Empire specifications. This is not
an implementation of the full academic or business products.

## Architecture findings

| Path | Existing implementation | Reliability finding |
| --- | --- | --- |
| Desktop and voice | `commands.rs` → `brain.rs` | Screen tasks already share the observe/action loop, but some local shortcuts used `done` for an attempted action or an offline response. |
| Discord, Telegram, phone calls | `companion.rs` → screen, connected apps, or chat | The companion previously discarded the screen executor's verdict and substituted “Done” for an empty summary. |
| Rest missions | `missions.rs` → `companion.rs` | Anything that did not look like a question became a completed mission, including failures and unsupported actions. |
| Connected apps | `composio.rs`, `mail.rs` | Multi-account Gmail search exists. Many other reply paths still return text without an explicit completion verdict. |
| Restart recovery | `missions.json` | A persisted running mission could remain stuck. Replaying it automatically could duplicate external actions. |
| Task continuation | `brain.rs` working notes and unfinished-task memory | Full contracts, durable step checkpoints, and per-tool postconditions remain future work. |

## Implemented behavior

- A shared `TaskOutcome` distinguishes verified, partial, blocked, failed,
  cancelled, waiting for the user, and unverified execution.
- The screen plan's executor verdict cannot be supplied by model JSON.
  The existing screen completion evaluator sets it after execution; a local
  click or keypress alone is partial evidence, not verified goal completion.
- Companion replies preserve that verdict. Ordinary text and integrations
  without structured evidence remain unverified even when they say “Done”.
- Missions persist the verdict and require it before assigning `done`.
  Failed calls and executor panics no longer become successful missions.
- Running checkpoints must save successfully before actions begin. Failure
  to save a final result pauses the batch and requests inspection.
- Interrupted running records wait for user inspection and retain their
  previous result. They are never automatically returned to the queue.
- Older completed records without a saved verification verdict are shown
  as unverified, preserving their original response for inspection.
- Desktop status labels and the phone's attention count include partial,
  blocked, failed, and unverified missions.

## Limits and next increments

The screen evaluator still relies on the existing observation/model loop;
this change does not add independent semantic validation for every app.
Unverified means that completion evidence is unavailable, not necessarily
that the requested work failed. Connected-app and deterministic handlers need
individual evidence-producing adapters before their missions can be verified.

## Second increment: contracts and cooperative budgets

Missions now persist a versioned contract with the exact saved objective,
existing permission scope, the whole requested outcome as the initial success
criterion, an observation requirement, and execution limits. A contract cannot
grant unrestricted access. Modified objectives, unsupported contract versions,
invalid limits and previously attempted missions are refused before execution.
New objectives longer than 400 characters are rejected rather than truncated.

The running checkpoint is saved before entering the executor. Returned usage
records reasoning rounds, attempted screen actions, connected-service requests,
elapsed time and a stop reason. Restart recovery preserves the contract and
checkpoint and requires inspection; it does not replay actions. The mission
card exposes the scope, criterion, limits and saved usage.

Screen rounds/actions and Composio requests share a thread-bound budget which
is explicitly propagated to screen action workers. Stops latch, and a late
successful-looking response cannot override cancellation or an exhausted
budget. No mission means no new limits on ordinary foreground commands.

Limits are cooperative: they prevent the next supported operation, not an
already-running OS call or HTTP request. Existing network timeouts still apply.
Specialized local handlers, model fallback workers, and other providers do not
yet have full internal budget instrumentation. Final return checks still catch
an elapsed deadline; this is not a hard wall-clock termination guarantee.
That increment covered mission start/return/interruption. V1 preserves the full goal but does not infer a typed per-subtask plan or
independently verify each individual success criterion.

## Third increment: structured execution evidence

Supported desktop action dispatch and Composio tool execution now write a
bounded append-only journal at `mission-journals/<mission UUID>.jsonl` under
Izuki's data directory. The start record is synced before dispatch and the
return record afterward. Creation/start-write failure prevents execution;
completion-write failure latches a checkpoint failure and prevents further
supported operations. Existing journals are never overwritten for a new run.

Records contain sequence, timestamps, action/tool name, opaque connection ID
where available, and returned/failed/unknown status. Arguments, email bodies,
typed text, credentials, raw provider errors and URLs are excluded. A validated
provider response is a returned operation result, not proof the entire user
objective was met. Provider-reported failures stay distinct from timeouts,
which can leave the external action's outcome unknown.

The journal is shared by action workers and parallel Gmail searches. Mission
views refresh on saved records and expose them on demand. Recovery retains the
valid prefix of a torn journal and marks unfinished operations unknown. These
records are never executable instructions or permission to replay an action.
Removing a mission or clearing finished missions also removes their journals
after the mission-list change saves successfully; unrelated files are excluded.

Claude's email-coverage verdicts, keep-awake guard and Island work remain in
place. The Gmail-worker change only carries the shared execution context into
the existing parallel fetch calls.

Coverage is deliberately limited: local shortcuts that bypass action dispatch,
n8n and other specialized handlers do not yet produce these step records.
Filesystem sync reduces the incomplete-write window but does not promise
recovery after every hardware or filesystem failure. Journals are bounded local
audit metadata, not tamper-proof records or per-criterion semantic verifiers.

Validation of this combined working-tree snapshot: 313 Rust tests passed,
zero failed, 29 intentionally ignored; TypeScript and the production Vite
build passed. Synthetic journal tests cover actual disk writes, write failure,
torn records, concurrency, deletion boundaries and crash recovery. These checks
do not establish live provider or desktop end-to-end success.

Integration note for Claude: include the new `src-tauri/src/mission_journal.rs`
module with the related `lib.rs`, `execution.rs`, mission, Composio, screen,
Gmail-worker and TypeScript changes. The journal module is required by the
compiled code; it must not be omitted when staging a release. The previously
added `execution.rs`, `tutor.rs` and Claude's `awake.rs` are also new source files.
No push, publication or installation was performed by Codex.

Next: structured evidence and tool
schemas; broader budget instrumentation and per-step checkpoints; safe approval
resumption; and meaningful scenario benchmarks. Campus retrieval and Empire
integrations must build on these services and require real authorized accounts.

No release, deployment, live external action, or universal compatibility is
established by the unit tests. Shipped in 1.0.116 (the owner's standing
instruction is to release tested work straight to main).
