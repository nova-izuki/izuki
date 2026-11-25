# Hand-off from Claude, 2026-11-25: where things stopped, and what's next

Claude's usage is nearly out. Freebuff or Codex: this is everything the owner
and Claude agreed, in order. Read `docs/HANDOFF-2026-11-23-claude-vr.md` too
(VR, the store, 1.0.222–1.0.224) and AGENTS.md (the rules).

## Released

- **1.0.224** (Latest): Izuki's own browser window with a live view, whole moves
  per look, the grid for apps with nothing to number (#188); phone answer depth,
  key links (#185, #187, #192).

## Merged but NOT released yet (release 1.0.225 is due)

| PR | What |
|---|---|
| #196 | Phone/VR: **free starter brain**, no key needed (live on the web already: Pages deploys main) |
| #198 | PC: the same **free starter brain** when no AI is set up (`brain::starter_brain`, `with_starter`); its "402 Free limit reached, please wait N seconds" is an N-second rest, never a 6-hour bench |
| #199 | Quizzes, the owner's choice (see below) |
| #201 | PC: the local router brain is labelled **"9Router or OmniRoute"** (same `localhost:20128/v1`) |

To release: bump every version file to 1.0.225 (`node tools/check-versions.mjs`
must agree), write `docs/RELEASE-1.0.225.md`, add a What's New item, add the
checklist block, move `docs/NEXT-RELEASE.md` lines into the note, PR, merge;
`auto-release.yml` tags it after Verify passes. AGENTS.md says Claude is the
release coordinator: ask the owner before releasing in Claude's place.

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

### 1. "Move to my new PC": free, one click (the owner's top ask)

Replaces paid PCmover / EaseUS for Izuki users.

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

### 2. "Think with my PC" + smart OmniRoute picking

- One switch on the phone and in VR: questions go to the **paired PC**, which
  answers with whatever brains it has (OmniRoute, keys). No keys on the phone
  or headset. Off unless turned on; only while the PC is on.
- On the PC, treat OmniRoute like the free-key providers in `freebrains.rs`:
  read its `/v1/models`, keep the strongest models that can see screenshots,
  order the best first, and keep Izuki's existing checks (a reply with no real
  step or broken JSON loses; the next brain answers). OmniRoute's own `auto`
  model also works.

### 3. "Drop your clips, get a video" (later)

The owner films PC-build steps and wants to paste all the clips and get one
finished video: join in order (by name or capture time), cut dead air, speed
up slow parts, add step titles and music, export. ffmpeg (free) does it. Ask
the owner for the folder.

### 4. Smaller asks still open

- Test everything new in VR **on the real Quest 3S** (plug in USB, allow USB
  debugging; adb is at `C:\Users\nwach\tools\android-sdk\platform-tools\adb.exe`).
  Not yet done.
- The PC "Izuki's own window" (extension 1.6.5) has not run against the real
  extension; test it with a web task.
- Freebuff's VR queue: #171 (quiz with memory, **practice-only fill-in rule
  applies**), #172 (real part shapes), #173 (listening ring), #174 (wake name).

## Tools the owner asked for

- **ponytail** (Claude Code plugin, DietrichGebert/ponytail, MIT): installed by
  the owner. In VS Code `/plugin` doesn't exist; use the terminal `claude`.
- **graphify** (Graphify Labs, Apache-2.0; code parsed locally, nothing
  uploaded): not installed yet. `pip install graphifyy` (two y's), then in the
  izuki folder `graphify install`.
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
