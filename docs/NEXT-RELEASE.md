# Waiting for the next release

Codex and Freebuff: add one line per change you pushed. Write it in plain
words for the owner, and put your name in brackets. Claude moves these lines
into the next `docs/RELEASE-x.y.z.md` when it releases, then clears this list.

- A task that was saved before a restart can be finished: say “keep
  going” (a saved task expires after six hours). Izuki also checks short
  typed boxes it can read before counting them as done. [Freebuff]
- Pause now works even while Izuki is still thinking: it holds before the
  first click, tells you the step it stopped at, and Resume continues from
  there. [Freebuff]
- The floating panel looks richer: deeper colours, a clearer selected tab,
  and the typing box lifts when you click into it. [Freebuff]
- Empty-chat suggestions now shuffle through a wider desk and refresh every
  45 seconds, so the welcome feels alive instead of showing the same four
  canned prompts. [Freebuff]
- The hand chip now shows whether AIR is on, opens a compact hand-gesture
  guide, can stop AIR immediately, and jumps straight to its settings.
  [Freebuff]
- After a scroll or a shortcut in the window you're looking at, Izuki
  checks the screen really changed, and says so when it can't confirm it.
  During a task it then looks again before going on, and never presses it
  twice blindly. After opening an app it notes when nothing new appeared. Volume,
  music, copy and cut keys aren't checked, since they change nothing on
  screen. [Freebuff]
- Inbox now retries a transient Gmail account check, shows an unfinished
  sign-in as unfinished instead of a broken account, and names the Gmail
  address it actually read. [Freebuff]
