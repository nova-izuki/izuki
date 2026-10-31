# Continuing Freebuff's work, October 31, 2026

Starting point: `604c9fb`, after Freebuff's released 1.0.189 and two pending feature/fix commits. The owner asked Codex to continue. The owner's earlier request to release through automatic updates remains the authority for 1.0.190; the coordination file records ownership.

## Scope

Prompt recall preserves whitespace, refreshes between browser windows, validates stored entries and retains a working session shelf after a storage-quota error. The popup uses the space available around its movable bar. Note rename parsing preserves destination titles and rejects requests aimed at files, headings, chapters and other objects. The app-discovery fallback uses readable prose and respects Stop. A size retry keeps both ends of long text, including text parts alongside a picture; action/system instructions remain intact. Chat records the original user prompt and accepts a file while a correction is being typed during a running answer.

## Review

CodeRabbit reviewed Freebuff's changes against `0b7a26f`, then reviewed the combined changes. Both completed. The first review returned two major and three minor findings; the second returned three minor findings.

Actionable findings fixed: destination-title truncation, polite-prefix rename exclusions, raw JSON in the app fallback, generated continuation text in prompt recall, sub-note rename exclusions, and generated suggestion chips entering the typed-prompt shelf.

Two recommendations were deliberately not applied: truncating a system message at 6,000 characters can remove the rules that distinguish instructions from reference text; these messages remain intact. Restricting offline help to only HTTP 400 would bring back Freebuff's reported problem for other discovery failures, so conversation-only help remains available for any discovery failure, with no app tools and explicit guidance to disclose unavailable access.

## Checks

Final results, recorded by Claude before publication on the code that ships:

| Check | Result |
| --- | --- |
| `cargo test --lib` | 519 passed, 0 failed, 44 ignored |
| `npx tsc --noEmit` | clean |
| `npx vite build` (production) | built, fresh `dist/` |
| `test:workspace` (store, explain-only runner, lab hand-in, panel commands) | pass |
| `test:panel`, `test:chat-text`, `test:finder`, `test:hotkeys`, `test:html` | pass |
| `test:panel-browser`, `test:island` (including real Tab presses through the recent-prompts shelf), `test:bubble` (both click paths), `test:notes`, `test:prompts` (real headless Edge) | pass |
| `test:phone`, `test:conversation`, `test:speakers`, `test:air`, `test:voice`, `test:voice-notes`, `test:companion` | pass |
| CodeRabbit | first pass 12 findings, second 3, third 2, fourth 2, fifth 1; all fixed |
| Extension zip | repacked, 21 files, checked to contain the explain-only runner, the page follower, the 240 s answer limit and the lab hand-in rule |

Each behavioural fix has a test that was run against the old code and failed there.

Not run: the Windows installer build (the release workflow builds it from the tag); real microphones and voice enrollment; live provider accounts; a real Moodle or Canvas quiz in a signed-in browser (the page follower is tested against a scripted page and a URL change, not a live LMS).

Test artifacts live under ignored `.work/freebuff-followup-*` paths.

The first browser attempt timed out at CDP `Page.enable` before loading the fixture while native and frontend builds were active. The second timed out navigating to the cold Vite fixture: the helper ignored its already-supplied navigation timeout argument. That argument now works; default command deadlines are unchanged. Neither run counts as a pass. The next run exercised the Island actions but failed the error assertion because a machine-installed extension injected four `chrome-extension://` errors into the fresh profile. The disposable UI-test browser now disables extensions and background networking; no error assertion is removed or filtered. The layout fixture was also corrected to install the mock Windows port before importing the component, and its document-storage assertion now follows the bounded attachment persistence shipped in 1.0.189.

## Limits

Browser fixtures use the real React components and mocked native/cloud calls. They never change Windows appearance, open an owner's browser profile, install an extension, or access accounts. Unit tests use generated documents and test data. Real microphones, voice enrollment and live provider accounts were not exercised in this continuation. No owner settings, conversations, face models or credentials were read. Publication and installation are separate: publishing an update does not prove it is installed on this PC.
