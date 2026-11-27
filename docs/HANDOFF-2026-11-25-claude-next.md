# Hand-off from Claude, 2026-11-25: where things stopped, and what's next

Claude's usage is nearly out. Freebuff or Codex: this is everything the owner
and Claude agreed, in order. Read `docs/HANDOFF-2026-11-23-claude-vr.md` too
(VR, the store, 1.0.222–1.0.224) and AGENTS.md (the rules).

## Continuation updates — Codex, 2026-11-25 (newest)

- **1.0.225 is released (Freebuff, 2026-11-25).** Merged as `c6a7f12` (#204) after every PR check passed, tagged `v1.0.225`, and the Windows release job succeeded: 9 assets (NSIS setup, MSI, portable exe, both `.sig` files, `latest.json`, the Android preview APK and the iPhone sideload IPA). Checked live: `releases/latest/download/latest.json` serves **1.0.225** with a signature on each of its three platform entries, the setup/MSI/signature URLs answer 200, the site's Download button points at `releases/latest/download/Izuki-Setup.exe`, and `izukinova.ai/app/sw.js` now serves cache `izuki-phone-v136`. The mobile build job also succeeded. Hardware checks stay open and are listed in `DESKTOP-TEST-CHECKLIST.md`.
- The owner resumed Codex and explicitly asked that this handoff be updated after changes and discussions. Keep decisions, actual test results, remaining work and release state here after every batch; do not rely on a private agent memory file.
- Read the entire pasted continuation, not only Claude's first handoff: the later discussion makes **Move to my new PC optional**, with Windows Backup, a WinGet app list and USB copying sufficient for now. **Think with my PC + smart OmniRoute picking is the next feature**, then the clip-to-video workflow. The numbered sections below are corrected accordingly.
- **Graphify setup completed locally:** existing `graphifyy` 0.9.120 was already installed. Its Python Scripts directory was missing from the user's PATH. Added that directory to user PATH without replacing existing entries; installed the official bundled Claude Code and Codex skills with references; verified both skill files and `graphify --version` in a new PowerShell child process. Existing terminal sessions may need reopening. No repository graph extraction, semantic LLM analysis or code upload was run. Ponytail remains owner-reported installed, not newly verified.
- The last pasted question also asked for simpler steps to move large files and Claude's notes. See [PC-MOVE-GUIDE.md](PC-MOVE-GUIDE.md). No actual file transfer was started: no destination drive or new-PC path has been selected.
- Pre-release review completed with 22 findings. Confirmed phone quiz, provider/assessment, animation and VR reliability bugs are being repaired with regression coverage before publication. The real-browser suite now opens the folded phone Orb Studio through its heading and passes; the blank hidden preview was a test setup problem. Full default native tests passed (769 passed, 49 ignored by existing test annotations); devvision and final-source reruns remain pending.
- **Freebuff took over this lane (2026-11-25).** Codex stopped with the review repairs and the 1.0.225 release files uncommitted on `codex/continue-next`. The only thing actually broken was test plumbing: the new `honesty_tests` called `chain_for`, `starter_allowed`, `swap_local_text_model`, `picture_only_model` and `local_model_issue` without importing them, so `cargo test --lib` stopped on 17 compile errors before a single test ran. The import list is fixed; no shipped behaviour changed. Checked on the final source: `npm run build` (tsc + vite), `test:live-field` 16/16, `test:phone` (all files, including `vr.test.cjs`'s 74 checks), `test:conversation` 93, `test:html` (encoding 684 files + HTML), `test:site` (9 pages, 28 sitemap images, quest 18), `tools/browser-check.cjs` (phone home/settings/orb, four toolbar widths, native iPhone settings, website cards), `node tools/build-vr.cjs` (rebuilt bundle is byte-identical, so `vr-scene.js` matches its source), `cargo test --lib` 773 passed / 0 failed / 49 ignored, `cargo test --lib --features devvision` 785 passed / 0 failed / 49 ignored. Still device-only: the Quest 3S voice/hologram/browser checks, a live task through the PC's own extension window, and the starter brain's real wait on a clean install.
- Main was checked at `06a5a08` (#202). Latest published release was then **1.0.224**; 1.0.225 was still due. (Superseded: 1.0.225 is now published and verified — see the newest bullet above.) Work was isolated on `codex/continue-next`; shared dirty work remained untouched.

## Released

- **1.0.224** (Latest): Izuki's own browser window with a live view, whole moves
  per look, the grid for apps with nothing to number (#188); phone answer depth,
  key links (#185, #187, #192).

## Merged and released in 1.0.225

| PR | What |
|---|---|
| #196 | Phone/VR: **free starter brain**, no key needed (live on the web already: Pages deploys main) |
| #198 | PC: the same **free starter brain** when no AI is set up (`brain::starter_brain`, `with_starter`); its "402 Free limit reached, please wait N seconds" is an N-second rest, never a 6-hour bench |
| #199 | Quizzes, the owner's choice (see below) |
| #201 | PC: the local router brain is labelled **"9Router or OmniRoute"** (same `localhost:20128/v1`) |

Released 2026-11-25 as shown above. The remaining item from that list is the device work,
not the release: the Quest 3S checks, a live task through the PC's own extension window,
and the starter brain's real wait on a clean install are in `DESKTOP-TEST-CHECKLIST.md`.

## Decisions the owner made (don't reopen without the owner)

- **Quizzes (2026-11-24, owner picked from three options):** on a **practice**
  quiz, drill or self-test Izuki fills the answer in; on a **graded** quiz or exam
  (or when it can't tell) it **says** the answer and why, and the person picks it;
  **never** Submit, Turn in or Finish on either. Phone: `agent.js` `practicePage` /
  `gradedPage`; PC: `apply_answer_mode`. AGENTS.md rule 6 records it. #190 and
  #197 (filling in graded tests) were reverted or replaced.
- **No sign-in.** Izuki stays account-free (data on the device, keys local).
  Optional "Sign in with Google" only later, with Izuki Plus.
- **Free with no setup is the default:** the starter brain (Pollinations' free
  text AI, about 1 answer per 45 s per connection, text only). The free Gemini
  key is the "full speed" path. OmniRoute is an option for power users; it still
  needs their own provider accounts and runs on one PC.

## Build next, in this order

### 1. "Think with my PC" + smart OmniRoute picking (next feature)

- One switch on the phone and in VR: questions go to the **paired PC**, which
  answers with whatever brains it has (OmniRoute, keys). No keys on the phone
  or headset. Off unless turned on; only while the PC is on.
- On the PC, treat OmniRoute like the free-key providers in `freebrains.rs`:
  read its `/v1/models`, keep the strongest models that can see screenshots,
  order the best first, and keep Izuki's existing checks (a reply with no real
  step or broken JSON loses; the next brain answers). OmniRoute's own `auto`
  model also works.

### 2. "Move to my new PC": optional future feature

The later discussion made this optional, after the owner accepted Windows
Backup, WinGet export/import and USB copying for now. The design below is a
proposal, not a built feature or a promise to transfer every application.

- **Flow:** Izuki on both PCs. On the old one: "move me to my new PC" (or a
  button). It finds the new PC (same Wi-Fi), shows a code on both screens to
  confirm, then a checklist: apps, folders (Documents, Desktop, Pictures, Videos,
  Downloads, Music), Izuki's settings and memories (`%APPDATA%\Izuki`), anything
  else picked. **Move** shows live progress.
- **Apps:** `winget export` on the old PC, `winget import` on the new one (free,
  built into Windows). List the apps winget can't find, so the person
  reinstalls them by hand.
- **Online and offline:** over the network (Wi-Fi/LAN, reuse the existing PC
  pairing), **or offline** through a USB drive or external disk (write a move
  package, open it on the new PC).
- **Never deletes anything on the old PC.** Browser passwords move by signing in
  to the browser, not by copying. Paid licences (Adobe, games) may need a
  sign-in again.
- **Show Windows Backup as an alternative** in the same screen: "Or use Windows'
  own backup: Start → Windows Backup → Back up; on the new PC sign in with the
  same Microsoft account → Restore." Only on Windows.
- Test on the owner's real laptop and new PC.

### 3. "Drop your clips, get a video" (later)

The owner films PC-build steps and wants to paste all the clips and get one
finished video: join in order (by name or capture time), cut dead air, speed
up slow parts, add step titles and music, export. ffmpeg (free) does it. Ask
the owner for the folder.

### 4. Smaller asks still open

- Test everything new in VR **on the real Quest 3S** (plug in USB, allow USB
  debugging; use `adb` from PATH or your Android SDK’s `platform-tools/adb.exe`).
  Not yet done.
- The PC "Izuki's own window" (extension 1.6.5) has not run against the real
  extension; test it with a web task.
- Freebuff's VR queue: #171 (quiz with memory, **practice-only fill-in rule
  applies**), #172 (real part shapes), #173 (listening ring), #174 (wake name).

## Tools the owner asked for

- **ponytail** (Claude Code plugin, DietrichGebert/ponytail, MIT): installed by
  the owner. In VS Code `/plugin` doesn't exist; use the terminal `claude`.
- **graphify** (Graphify Labs): CLI and Claude/Codex skills installed and verified
  by Codex on 2026-11-25. Reopen PowerShell if an old terminal still cannot find
  `graphify`. Claude Code uses `/graphify`; Codex uses `$graphify` on a new turn.
  Parsing code can run locally; semantic extraction may use an external model,
  so do not describe all Graphify workflows as uploading nothing. Only setup
  was performed in this continuation, with no repository extraction.
- **agent skills:** Anthropic's official pack is already installed.

## Traps from this stretch

- `gh pr checks --watch` can return early: poll until nothing is pending
  (one PR merged with checks pending; main passed afterwards).
- Rust tests need `IZUKI_TEST_MANIFEST=1 cargo test --lib`. C: is nearly full;
  share one target folder (`CARGO_TARGET_DIR` = the main checkout's
  `src-tauri/target`).
- The laptop mic "hearing nothing" since 11-12 was **Windows' own mute** (28%);
  Izuki now says so, and "unmute my mic" fixes it.
- Never write `@name` in PR text for agents (it pings real GitHub users).
