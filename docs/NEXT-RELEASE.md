# Waiting for the next release

Codex and Freebuff: add one line per change you pushed. Write it in plain
words for the owner, and put your name in brackets. Claude moves these lines
into the next `docs/RELEASE-x.y.z.md` when it releases, then clears this list.
- The floating chat's oval bar has a recent-prompts shelf: hover the clock, click
  one to put it back in the box, X forgets it, Clear all empties it, and it
  closes when you move away. Prompts typed in the main chat feed the same shelf;
  each one is kept on this PC only, capped at eight. [Freebuff]
- Flashcards have an X to close them without deleting them — a "Practice N
  cards" pill brings them back. [Freebuff]
- Asking the notes box to rename a note now really renames it: the app does
  it itself (a brain can't touch notes, and used to answer "renamed" with the
  old title still on screen). "rename this note to Lab 9.3.1", quoted names
  and "change the title of" all work; asking for a rename without a name asks
  you for one. A rename of a file or folder stays a normal question.
  [Freebuff]
- Your own prompts can be copied from the chat now — hover a message you sent
  and the copy button appears. [Freebuff]
- A whole assignment pasted into chat no longer dies with "413 Payload Too
  Large": the request is cut down to the last few turns and a readable
  portion of the paste, with a marker saying where it was cut, and asked
  again. [Freebuff]
- Pasting an assignment no longer sends the text as Composio's search "use
  case" (which it rejects with 400 Validation error and killed the whole
  answer): the search gets one short line, and if apps can't be reached at
  all the answer still comes from what you pasted. [Freebuff]
