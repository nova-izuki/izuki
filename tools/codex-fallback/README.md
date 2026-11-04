# Codex fallback foundation

Issue #26; intentionally separate from Claude's active `tools/agents/` lane.
Nothing here starts an agent, edits queue state or enables automatic dispatch.

Run `node tools/codex-fallback/probe.mjs` to check the installed CLI's version,
required flags and `login status`. Set `CODEX_BINARY` to a trusted native executable
if it isn't on PATH (on Windows use the actual executable, not a `.cmd` shell
wrapper). The probe has bounded time/output, never opens a login flow or reads
credential files, and does not print raw command output or local install paths.
A successful probe means **ready for a manual trial**, not verified task execution.

`contract.mjs` supplies stdin-based `codex exec` arguments and a streaming JSONL
completion reader. It defaults to read-only; an explicitly selected
`workspace-write` sandbox is supported. Neither bypass flags nor changes to the
user's approval/rule enforcement are offered. Shell execution is not involved.
The parser handles UTF-8 chunks, unknown progress events, output bounds, invalid
lifecycle, runtime errors, interruptions and checkpoint turns. It accepts only
a clean exit after a completed turn whose last agent message ends in
`RESULT: done ...`; this still requires independent tests/CI before queue success.
It deliberately doesn't expose raw model/tool text in its verdict.

Test: `node --test tools/codex-fallback/contract.test.mjs`.

## Integration still required (Claude owns it)

1. Review PR #24's pending fixes; preserve its branch and dirty bridge files.
2. Add Codex capabilities, ownership labels, heartbeat and recovery contracts to
   scheduler/coordinator only after a specific lane transfer. Existing
   `AGENTS`/`HEARTBEATS` explicitly exclude Codex.
3. At an idle checkpoint, add an **off-by-default** runtime adapter using this
   contract, one assigned task per isolated worktree, stdin prompt and bounded
   process lifetime. No parallel clone of the current dispatcher.
4. Preserve trustworthy queue input, file ownership, cancellation/process-tree
   safety, backoff and rate-limit diagnosis. Never route work away from an
   in-flight Claude task merely because its primary interactive session hit a limit.
5. Prove a read-only smoke turn, cancellation, failed turn, task in its own
   worktree, heartbeat recovery and independently green CI before calling the
   automatic fallback integrated. No real model turn has been run here.
6. Keep Freebuff's shared-queue contract and Claude's release coordination.

Official source checked 2026-11-03:
[Codex non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode).
The supported interfaces include `codex exec --json`, stdin prompts,
`--sandbox`, `--ephemeral`, `--cd` and stored CLI authentication. The docs now
say `--full-auto` is unsupported; do not copy older examples using it.
`exec` fits bounded jobs; persistent conversational control would need the
separate supported app-server protocol, not Claude stream-json messages.
