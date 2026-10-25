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
2. **Only Claude bumps the version and releases.** A push to `main` releases
   only when `package.json`'s version changes. If two agents bump it, they
   collide.
   - Codex and Freebuff commit and push their tested work to `main`
     **without** touching versions (`package.json`, `src-tauri/tauri.conf.json`,
     `src-tauri/Cargo.toml`, `Cargo.lock`, `android/app/build.gradle`).
   - Then add a line to `docs/NEXT-RELEASE.md` saying what changed, in plain
     words. Claude folds it into the next release note and ships it.
3. **Pull first, small commits.**
   - Run `git pull --rebase origin main` before you start and before you push.
   - Commit only your own files: `git add <paths>`, never `git add -A`.
     Never commit `docs/app/surface.css` or `docs/app/surface.js`.
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
   - For school work: **never click, type or submit an answer** into a quiz,
     test or graded form, and never write the essay or code they hand in.
     Izuki *may* say a factual answer when the owner explicitly asks for one
     ("what's the answer", "which option is correct") and then explain it —
     that is tutoring, and the owner asked for it repeatedly. Saying something
     is never permission to act on the page: a request that also asks Izuki to
     *do* something goes back to coaching (`brain::direct_answer_requested`,
     which defers to `companion::asks_to_do`). Coaching mode ("coach me",
     "don't answer") still withholds.
7. **Don't touch anything outside this `izuki/` folder.** The parent folder
   is the owner's separate robot project.

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
