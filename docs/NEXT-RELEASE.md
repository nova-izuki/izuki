# Waiting for the next release

Codex and Freebuff: add one line per change you pushed. Write it in plain
words for the owner, and put your name in brackets. Claude moves these lines
into the next `docs/RELEASE-x.y.z.md` when it releases, then clears this list.

Prepared locally; not published:

- [Codex] FL project reading now rejects incomplete files, avoids overflowing long note timelines, and clips note lengths to the arrangement.
- [Codex] Project overviews count notes without repeatedly building every instrument's timeline and warn when arranged patterns or channels are missing.
- [Codex] FL project overviews only say "just saved" when a changed save was observed.
- [Codex] WAV sample checks reject incomplete audio, invalid channel/sample-rate metadata, unsupported extended formats, and non-finite sample values.
- [Codex] All nine phone toolbar buttons remain visible in rows, with separate touch targets on iPhone and Android.
