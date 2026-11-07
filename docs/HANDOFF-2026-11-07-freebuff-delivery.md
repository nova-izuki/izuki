# Hand-off: delivery audit for `milestone-196` (Freebuff, 2026-11-07)

Written for Claude, who owns merges, version bumps and releases, and PR #17.
This records exactly what is verified and what blocks publishing. Freebuff
did not merge, bump a version, write release notes or publish anything.

## Where the branch stands

- `milestone-196` is **43 commits ahead of `main`** (`2a216eb`, the #24 merge).
- PR #17 (`milestone-196` → `main`) is a draft and **CONFLICTING**
  (`mergeStateStatus=DIRTY`).
- Versions agree on both sides: **1.0.196** in `package.json` and
  `src-tauri/tauri.conf.json`. `package.json` differs only by the
  `test:eye` script — this branch contains **no version bump**.

## The conflict is Claude's bridge tooling, and only that

`git merge-tree --write-tree origin/main HEAD` reports four add/add conflicts:

- `docs/AGENTS-BRIDGE.md`
- `tools/agents/dispatcher.mjs`
- `tools/agents/scheduler.mjs`
- `tools/agents/scheduler-check.mjs`

There is **no Rust, frontend, version or release-note conflict**. `main`
carries the #24 versions of those four files; `milestone-196` carries later
bridge commits (`0363389` … `198bf89`) that touch the same files. The
resolution belongs to Claude (its lane). Suggested: rebase onto `main`, keep
the newer milestone bridge implementation (or keep `main`'s and cherry-pick
the later bridge commits), then run `node tools/agents/scheduler-check.mjs`
and the full verify workflow before merging.

## Verified and ready in Freebuff's lane (no further code work)

| Commit | What | Evidence |
| --- | --- | --- |
| `58875e1` | PDF words edited in a copy beside the original; staged attachments become editable (the `off_limits` blocker fixed) | Full suite 607 passed / 0 failed / 48 ignored; PDF and staged-path tests |
| `0b00912` | Real-file PDF test for the owner's template; refusal explained | Suite 607 / 0 / 49, exit 0; ignored real-PDF test exit 0 |
| `350aedf` | Edit cards carry the copy they wrote; `open_path` command; **Open** button | Suite 609 / 0 / 49; `npx tsc --noEmit` 0; `npm run build` 0 |
| `b343491` | Pages that store text as font codes are refused with the real reason | Suite 610 / 0 / 49, exit 0; real-PDF test exit 0 |

Real-file regression, 2026-11-07: fixtures were built with **python-docx,
openpyxl and python-pptx**, edited through `officeedit::apply`, then
**reopened by the same libraries** and asserted:

- DOCX: replacement present, paragraph added after the anchor, paragraph at
  the end.
- XLSX: `B2=950`, `Notes!A1="checked"`, `C5="=SUM(B2:B3)"` (sheet name and
  formula intact), `B9="new row"`.
- PPTX: title changed, added line present.
- The owner's filled PDF: 430 hex strings, 0 literal strings (font glyph
  codes). It is refused with that reason, and **no copy is left behind**;
  the original is byte-identical.

## Other lanes

- **Freebuff eye lane** (`de18ee2`): `npm run test:eye` 21/21, off by
  default, gate-only. Issue #30 stays `status:review` until the owner runs
  the one-gesture real-camera test.
- **Codex**: `6127043` (#28), `e45892f` + `36eac0f` (#27 hand), `556ba4f`
  (#21). #27 still needs Codex's native desktop verification.
- **Claude**: bridge commits `0363389` … `198bf89`; #18 and #25 remain
  assigned to Claude.

## Not verified / open

- The **Open** button is compile- and wiring-verified, but was **not clicked
  in the packaged app**: the only debug binary predates the change, and a
  full rebuild plus a GUI chat against a live model is not a safe unattended
  step. One click by the owner or Claude closes this.
- **No public update is live.** No version bump, release note, What's New
  entry or installer was produced by Freebuff.

## Resume checklist for Claude

1. Rebase `milestone-196` on `origin/main`; resolve only the four bridge
   files listed above.
2. Run the bridge check `node tools/agents/scheduler-check.mjs`, then the full
   gate: `IZUKI_TEST_MANIFEST=1 cargo test --lib`, `npx tsc --noEmit`,
   `npm run build`, `npm run test:eye`.
3. Merge PR #17 when green, bump the version, fold `docs/NEXT-RELEASE.md`
   lines into the release note, publish, then verify the installer and the
   updater manifest before calling it live.
4. Keep #30 in review until the owner's camera test.
