# Instructions for AI coding agents working on Izuki

Three assistants work in this repo for the same owner, sometimes at the
same time: **Claude Code**, **ChatGPT Codex** and **Freebuff/Codebuff**.
This file is the shared rulebook. Codex reads `AGENTS.md`, and Freebuff
reads `knowledge.md`, which points here. Claude has its own copy of the
same rules in `.claude/skills/izuki-dev`.

**Before you edit anything, read [docs/COLLAB.md](docs/COLLAB.md):** it says
who owns which files right now.

## What Izuki is
Izuki is a free Windows desktop companion. The user talks, types or draws,
an AI looks at the screen, and Izuki drives the real mouse and keyboard.

The repo is public: github.com/nova-izuki/izuki.

**One product, a private companion for every user.** Izuki is downloaded by
the public, and each person gets their own personal assistant, shaped by
their preferences, routines, apps, devices and permissions. Their profile,
memories and settings live in their own data folder, under their control.
Today they can see their memories and delete them one by one; export and
erase-all are planned, not built (`docs/PRODUCT-PRINCIPLE.md`). The owner's requests are
examples of what a user needs. Never hardcode their name, paths, accounts,
courses, devices or PC, and never put personal data in the repo.

| Where | What |
| --- | --- |
| `src-tauri/src/` | Rust core (Tauri v2). `commands.rs` holds every command the UI can call; `lib.rs` registers them. |
| `src/` | React + TypeScript UI. Two separate webviews (the config panel and the click-through overlay) that share NO state; they talk only through Tauri events (`EV` in `src/lib/ipc.ts`). |
| `docs/app/` | The phone app (a PWA, plain JS). |
| `docs/index.html`, `docs/llms.txt` | The website. |
| `extension/` | The Chrome/Edge extension. After changing it, rebuild `docs/extension/izuki-extension.zip` (folder `izuki-extension/` inside). |
| `docs/RELEASE-x.y.z.md` | One plain-English note per release. |

## Ground rules
1. **Claim before you change.** Add or update your row in `docs/COLLAB.md`
   (area, files, your name).
   - Don't edit files another assistant owns, except a tiny, atomic fix.
     Say what you changed in COLLAB.md.
   - Never rewrite a whole file someone else is also changing.
2. **Work on the milestone branch, never straight on `main`.** `main` is what
   users get. A version bump that lands there is tagged and published by
   itself (once the Verify workflow passes for that commit), and every push to
   `main` also redeploys the website.
   - The current milestone has its own branch and draft PR: `milestone-196`,
     PR #16. Commit and push your tested work there. A bigger separate piece
     may go on `claude/…`, `codex/…` or `freebuff/…` with a PR into the
     milestone branch.
   - Nothing is merged to `main`, tagged or published until the whole
     milestone is finished and verified, and the owner has approved it.
   - **Only Claude bumps the version and writes the release notes.** Never
     touch the version files (`package.json`, `src-tauri/tauri.conf.json`,
     `src-tauri/Cargo.toml`, `Cargo.lock`, `android/app/build.gradle`, the
     iOS project). `node tools/check-versions.mjs` checks they agree.
   - Codex and Freebuff add a line to `docs/NEXT-RELEASE.md` for each change,
     in plain words. Claude folds it into the release note.
3. **Pull first, small commits.**
   - Run `git pull --rebase origin milestone-196` (the branch you're on)
     before you start and before you push.
   - Commit only your own files: `git add <paths>`, never `git add -A`.
     Never commit `docs/app/surface.css` or `docs/app/surface.js`.
   - The working folder can be shared by two assistants at once. Never
     commit, stash, reset or check out files another assistant is changing.
     `git status` shows them, and COLLAB.md says whose they are.
4. **Test before you push**, and say honestly what you didn't verify:
   - `npx tsc --noEmit -p .`
   - `npm run -s build`
   - `npm run -s test:conversation`
   - `npm run -s test:air`
   - Rust: `cd src-tauri && IZUKI_TEST_MANIFEST=1 cargo test --lib`. This PC
     is slow (15–25 min per build), so run it in the background.

   Never disable, skip or fake a test. A failing test is reported, not hidden.
5. **Secrets and privacy (the repo is public):**
   - Never read, print or commit keys: `%APPDATA%\Izuki\settings.json`,
     `~/.claude.json`, any `.env`.
   - Never commit the owner's face model, emails, phone numbers or other
     personal data.
6. **Safety lines Izuki itself keeps:**
   - Never type passwords or act on the lock screen.
   - Nothing is sent, posted, bought or deleted without the user's explicit yes.
   - No unauthenticated remote control.
   - Never inject into Explorer.
   - School pages are sorted by the page's own evidence (`assess.rs`, cases in
     `tools/assessment-cases.json`, which every surface must pass):
     - **Graded** (points, attempts, a timer, a proctor, "submit quiz", a due
       date) or **unclear**: never click, type or submit an answer.
     - **Practice**: the page itself says practice, self-check or ungraded, and
       shows no grading sign. Izuki may pick answers when asked. The user saying
       "it's practice" never unlocks a graded page.
     - **Not a quiz** (course pages, downloads, uploads, Next, rubrics): normal
       automation. Don't block it because the page is about school.
   - Never write the essay or code they hand in.
     Izuki *may* say a factual answer when the owner explicitly asks for one
     ("what's the answer", "which option is correct") and then explain it —
     that is tutoring, and the owner asked for it repeatedly. Saying something
     is never permission to act on the page: a request that also asks Izuki to
     *do* something goes back to coaching (`brain::direct_answer_requested`,
     which defers to `companion::asks_to_do`). Coaching mode ("coach me",
     "don't answer") still withholds.
7. **Don't touch anything outside this `izuki/` folder.** The parent folder
   is the owner's separate robot project.

## Code review (CodeRabbit)
CodeRabbit reviews every push to a pull request by itself, drafts included
(settings: `.coderabbit.yaml`). If a push still goes unreviewed (paused, rate
limit, service limit), comment `@coderabbitai review` on the PR once (or
`@coderabbitai full review` to redo the whole PR) and note it in the log. A
checklist row that needs a review stays pending until that review lands. Its
findings are leads to check, not orders. The shared log for the milestone is
`docs/REVIEW-1.0.196.md`. All three assistants follow the same steps:

1. **Read first.** Before changing code a review covers, read the open
   CodeRabbit comments on the PR (`gh pr view 16 --comments`, plus the inline
   threads) and the review log.
2. **Claim it.** Put your name on the finding's row in the log before you
   fix it. If someone else has claimed it, leave it alone. Two assistants
   fixing the same comment collide.
3. **Verify it** against the current code. Most important first:
   - **Critical:** security hole, data loss, leaked credentials, an action
     the user didn't authorize.
   - **High:** crash, broken core feature, wrong automation, a corrupted
     update.
   - **Medium:** reliability, performance, maintainability.
   - **Low:** readability, optional refactors.
4. **Fix only what's confirmed**, with the smallest change. Add a regression
   test where one fits, and run the affected tests.
5. **Not a bug, or already outdated?** Write why in the log and reply on the
   thread. Don't change code just to quiet a comment, and don't refactor
   beyond the finding.
6. **Push the verified fix** to the PR branch. CodeRabbit reviews the new
   commits by itself. Never push empty or cosmetic commits to trigger a
   review. A push can still go unreviewed (rate limits, service limits): the
   log says so rather than assuming it was reviewed.
7. **Record it.** Mark the row fixed (with the commit) or explained. Note
   anything left unresolved.
8. **A clean review proves nothing on its own.** Tests and the milestone
   checklist decide whether something is ready.
9. **Stop when it stops paying off.** If new comments are only rewordings or
   preferences, say so in the log and stop.
10. **Never overwrite another assistant's work.**

## Traps that already cost days
- A plain `#[tauri::command] fn` runs on the UI thread, so a slow call
  freezes every window. Slow commands are `async fn` and wrap their work in
  `blocking(...)` (see `commands.rs`).
- The overlay is OS-level click-through. Clickable widgets need the
  `data-izk-hit` attribute; CSS `pointer-events` alone does nothing there.
- Adding a setting touches four places, or old settings files stop loading:
  1. the Rust field in `settings.rs`, with `#[serde(default)]`;
  2. its `Default` impl;
  3. `src/lib/types.ts`;
  4. `MOCK_SETTINGS` in `src/lib/ipc.ts`.
- Never use the webview's `SpeechRecognition` (broken in WebView2). Speech
  goes through `src/lib/speechInput.ts`.
- Everything Izuki says goes through `respond()` in `VoiceEngine.tsx`. Lines
  take turns (`takeTurn`): never stop the current line to start a new one.
- `docs/HOW-IZUKI-WORKS.md` is the spec for the request pipeline.

## How to write for the owner
The owner isn't a programmer. Release notes, UI text and messages are plain
English: short sentences, no jargon, and say what the user will notice.

## Who works on what (owner, 2026-11-03)

Freebuff keeps Smart Eye / Air Control, Smart Vision and Developer Mode.
Claude Code keeps Smart Screen Actions, speed optimization and security fixes
(plus the release and version files, rule 2). Codex or anyone else claims a
row in COLLAB.md first. Both finish existing critical work first: the
security-critical fixes and the milestone verification come before new
features. Status, missing pieces, ownership,
dependencies and next steps for each workstream live in `docs/WORKSTREAMS.md`
— update your lane's section there when its state changes, and read it before
starting work so you build on the other assistant's pieces instead of
repeating or overwriting them. Never overwrite the other assistant's files
(claim in `docs/COLLAB.md` first), and never merge or publish anything on
your own: the owner merges and publishes.
