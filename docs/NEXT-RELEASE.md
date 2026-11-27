# Waiting for the next release

Codex and Freebuff: add one line per change you pushed. Write it in plain
words for the owner, and put your name in brackets. Claude moves these lines
into the next `docs/RELEASE-x.y.z.md` when it releases, then clears this list.
- Two-machine handoff: the repo is the only sync between the two PCs — first-run steps, pull/push discipline, what not to put in a synced folder, and the checks to run, all in `docs/HANDOFF.md`. [Freebuff]
- Two-machine auto-sync: `tools/two-machine/sync.ps1` plus a scheduled task (sign-in + every 10 min) that fast-forwards this PC and pushes its commits, so the laptop that was off catches up by itself. [Freebuff]
- Restored the Codex domain-setup note that had only ever existed as an unsaved edit on one disk, and brought this checkout 162 commits up to date so the two PCs finally started from the same place. [Freebuff]
