# Izuki's own notes, for whoever fixes it

Izuki keeps a small, local list of what kept going wrong and what looked
clumsy while it ran. It is written for the next person who works on the app —
including coding agents — so they can open one file and know where to look,
without the owner having to describe anything.

It is never shown in the app. It is never sent anywhere: it stays on the PC, in
`%APPDATA%\Izuki\agent-notes.jsonl`, one JSON object per line.

## What is in a note

```json
{"at":"2026-11-22T14:03:11+00:00","area":"brain","what":"gemini: no answer in time","hint":"","version":"1.0.221","os":"windows"}
```

- `area` — the part of Izuki (`brain`, `automation`, `call`, `capture`, …).
- `what` — what happened, in Izuki's own words.
- `hint` — an optional "so probably fix…" when the writer already knows.
- `version` / `os` — which build it came from, so an old note can be ignored.

Every field goes through the same scrubber as the error reports before it is
written, so API keys, link secrets, emails, phone numbers and the Windows user
name never appear. Prompts, screen text, file names and anything the person
typed are never written at all — only Izuki's own steps and errors.

## Reading them

From the repository:

```sh
node tools/agent-notes.cjs                 # the last 14 days, grouped, worst first
node tools/agent-notes.cjs --days 3        # a shorter window
node tools/agent-notes.cjs --top 50        # more rows
node tools/agent-notes.cjs --json          # raw notes, for a script
node tools/agent-notes.cjs --file <path>   # a copy taken from another PC
```

Repeated identical notes are grouped into one row with a count, because the
useful signal is "this happened 40 times since Tuesday", not 40 lines.

## How notes get written

- Every crash, window error and `[bug]` line already routed through
  `bugs::report` also lands here (`bugs::report` → `agent_notes::note`), whether
  or not "Send error reports" is on: this file never leaves the PC.
- Code that notices something worth improving can add a note directly:

  ```rust
  crate::agent_notes::note("drive", "route refresh gave up after 3 tries", "back off further and keep the old route");
  ```

  Keep it factual and short. A note is a signpost, not a story.

## On the phone and the website

There is no file to write on a phone, so the same idea lives in the page that
already loads `shared/bugs.js`:

- `izukiBugs.fact(name, value)` — a standing fact about the device or the last
  attempt: `location: denied`, `route: offline`, `orb: Android refused the orb`,
  `search: search allowance used up (429)`. The last twenty are kept, newest
  last, and a repeat replaces the earlier value instead of piling up.
- `izukiBugs.report(what)` — something that went wrong, kept with the last
  problems and the crumbs around them.
- `izukiBugs.text()` — all of it as one page, which is what Settings →
  "Something wrong?" copies when reports aren't set up.

Both are scrubbed exactly like a report (keys, emails, phone numbers, link
secrets) and neither leaves the phone unless the person sends it. Drive mode
writes them from the places that used to fail in silence — a refused location
fix, a gazetteer or router that wouldn't answer, and an orb push Android turned
down — so "the orb showed nothing" arrives with its reason attached.

## What it is not

Not telemetry, not a crash reporter, not a diary of the person's day. It never
leaves the PC, it never contains user content, and it is capped at 4000 lines
(the file rotates to `agent-notes.old.jsonl`) so it can never grow without
limit.
