# Izuki 1.0.189: the whole document, not a picture of it

## 📄 Attach the assignment itself

The chat's 📎 button only took pictures before (the Island took text and code,
but not a PDF or a Word file). Now both take the same things: **PDF, DOCX,
PPTX, text and code files**, alongside pictures, up to 15 MB each and four at a
time.

The file is read on your PC, not uploaded to a converter:

- **PDF** — up to 200 pages of real text, marked `[Page 7]` so "what does page
  4 say?" has an answer. A scanned PDF has no text to read, so it says so and
  asks for photographs of the pages instead of pretending it read something.
- **Word and PowerPoint** — the document body and the slides, in slide order,
  never the speaker notes, never a macro.
- **Text and code** — anything from `.txt` to `.rs`, checked for binary junk so
  a renamed `.exe` can't arrive as a page of gibberish.
- **Old Office files** (`.doc`, `.ppt`, `.xls`) and `.xlsx` are refused with the
  thing to do instead, because they are not what they look like inside.

Drag a file onto the chat or paste it, and it lands the same way. What reaches
the AI is capped — the first 32,000 characters of a file, 24,000 across the
message — and the file is fenced off as reference material, not instructions.

**And the document survives closing the app.** It didn't: every save dropped
the file text and left "📎 notes.pdf (reattach files after reopening)", so the
follow-up question you came back for had nothing to read. A reopened chat now
keeps the attached text, newest first, within a 60,000-character budget; a file
that only partly fits says so inside its own text, and anything that had to go
is still named so you can attach it again.

## 🧩 Set up the extension from Izuki

The browser extension used to be a download, an unzip, and three steps of
guesswork — and the guesswork is what produced a folder one level too deep,
`izuki-extension (1)`, and a browser that kept running version 1.0.0 while the
app asked it to update every day.

Settings → Browser extension now has **Set up in this browser**. Pick the
browser you use (Chrome, Edge, Brave, Vivaldi or Opera — only the ones actually
installed are offered), and Izuki unpacks its own bundled 1.5.3 copy to
`%LOCALAPPDATA%\Izuki\BrowserExtension`, opens that browser's extensions page,
and gives you the folder location with one tap to copy. Developer mode and
**Load unpacked** are still the browser's own confirmation — no program may add
an extension silently — but the folder is now right, and pressing **Reload**
after the next update is a real update.

Updating that folder can't leave litter behind either: a half-unpacked copy is
removed, the previous copy is swapped in and then deleted, and a failed swap
puts the old one back. The setup test cleans up its own scratch folders now, so
running the tests no longer grows `.work` by one folder each time.

The extension's manifest description is inside Chrome's 132-character limit,
and the packer refuses to build one that isn't — a store listing rejects the
whole upload over that line. Store-ready pages (what it does, what it never
does, a privacy page) are in `docs/extension/`, for whenever the listing is
created.

## 🧩 The browser panel, rearranged

The panel had three scrollbars inside a 360-pixel column: the setup block, the
page block and the conversation each scrolled on their own, and a long answer
was a wall of text you had to scroll past to find where it ended.

- **One line says who answers** — *“Answering with Gemini tab · ready”*. The
  assistant picker, Connect and the companion switch live under it, folded
  until you open them.
- **It finds the AI tab you already have open.** Open the Gemini tab, click
  Izuki, and the panel connects to it — no Connect press, no retyping. It also
  notices a tab opened *after* the panel: the Gemini icon, a new ChatGPT tab.
  Connecting only chooses which tab replies; nothing is typed, sent or read
  until you ask. The switch to stop it doing that is right there, and turning
  it off is remembered.
- **Answers are cards you can read.** Each says who wrote it and carries
  Copy, Read, Notes and **Wide**. An answer longer than about 1,200 characters
  starts folded with **Show the whole answer**, which opens it to a comfortable
  reading size and folds it back.
- **Code stays code.** Triple-backtick blocks keep their line breaks and
  spacing instead of being squashed into a paragraph, and `#` headings become
  headings.
- **Read new answers aloud** is a switch (off by default), for studying with
  your eyes elsewhere.
- **Other tabs to compare** fold away, so the page card is two switches and one
  summary line rather than a second scrollbar.

## 🗂️ Settings that fold

Every card with a title folds now, not just the few that asked for it. Settings
and the Style page start compact, so a page that used to be a wall of switches
is a list you can scan.

- Each card **remembers** whether you opened it.
- **Expand all / Collapse all** at the top, for when you'd rather see
  everything.
- **Searching opens what matches** — temporarily, without overwriting the
  choices you saved, and the same for a jump from a shortcut or the feature
  finder, including a section nested inside another.
- Closing a section **keeps what you were typing** in it.
- Characters, orbs and faces get their own groups, so finding "the cat" doesn't
  mean scrolling past every colour.

## 🖥️ Four Windows layouts

The Style page had nineteen colour looks but no answer to "make Windows feel
different". There are now four layouts, under Style:

- **Studio** — centred apps, a clean taskbar, tighter File Explorer rows.
- **Classic workspace** — apps on the left, a named button for each window.
- **Photo gallery** — your daily picture takes the stage; icons hide, and the
  taskbar comes back when the pointer reaches the bottom edge.
- **Room to breathe** — taskbar and search kept, roomier file rows.

They only touch Izuki's existing Windows switches — never the wallpaper, the
colours, or Auto. Each one has **Undo**, which puts back exactly the switches
it changed and leaves later hand edits alone. If Windows refuses a switch
halfway through, the ones already changed are put back and it tells you, rather
than leaving the desktop in half a layout.

And a colours-only theme keeps your daily picture: the picture is now matched
by the wallpaper Windows actually has, so its preview survives a colour change
and disappears only when the picture itself was replaced.

## ⌨️ Typing while it works

Enter while Izuki was working did nothing. The box took the letters and the
send was dropped because a task was running, so the only way to say "stop,
not that" was to hunt for Stop first — and anything typed in the meantime went
with it.

Now Enter during a job **stops that job and sends what you typed** the moment
the stop lands, with the files attached to it, and a line says *Stopping, then
sending: “…”* with Cancel in case you change your mind. The same lane covers a
buddy that is midway through a lab: your correction is a new message, not a
lost one.

## 🧮 “3 of my 2 AI brains are benched”

That sentence was in the app, and it was two bugs wearing one coat. The total
came from the list of brains *still available* — benched ones had already been
removed from it — while the benched list itself was counted from everything
resting, so three waiting brains out of two left read as "3 of my 2". And a
brain whose key you had removed could stay in its rest window and be named as
benched, so the app could offer to wait for something you don't have.

The count is now every brain that is set up, resting or not, and only those
are named. "All of them at once" means all of yours, not all that were ever
tried.

## ✅ Verification

- `node tools/desktop-features-check.mjs` — the four layouts against a stub
  Windows switch adapter (Undo, later edits, partial failure, silent failure,
  missing switches, stored-data validation), and the attachment reader: text,
  code, PDF, Word, PowerPoint, empty/binary/oversized files, Unicode cuts,
  balanced excerpts, and keeping attached text across a restart.
- Both new attachment checks were proved by putting the bug back: dropping the
  documents makes the run fail, and splitting an emoji on the size limit makes
  it fail; each passes again with the file restored byte-identical.
- `npm run build`, `npx tsc --noEmit`, `npm run test:html`, `npm run test:panel`
  and `npm run test:panel-browser` pass — the panel checks now include a fresh
  panel finding an already-open Gemini tab without Connect, connecting without
  reading the page, remembering the switch when it is turned off, a long answer
  folding and opening whole, and the assistant line naming the tab.
- Each of those was proved by removing the behaviour: without the open-time
  connection the fresh-panel check fails, and with folding disabled the answer
  check fails; both pass again with the file restored byte-identical.
- `npx tsc --noEmit` covers the composer change; the typed-during-work path
  was **not** exercised by a browser harness (there isn't one for the chat
  composer), only type-checked.
- The brain count is checked in the pure functions behind it: a rest with no
  configured brain behind it is dropped, an ended rest is not "benched now",
  and the sentence can never print a count larger than the number of brains
  (`min` clamp), including the exact "3 of my 2" case from the screenshot.
- `tools/test-windows.ps1` (the manifest-aware native run) passes the full
  `--lib` suite — 510 tests, 0 failed, 44 ignored.
- The layouts were rendered and looked at: five colour looks and four layouts,
  with the daily picture kept.

---

Free, as always. No account, no subscription, nothing to pay.
