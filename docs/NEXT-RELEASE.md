# Waiting for the next release

Codex and Freebuff: add one line per change you pushed. Write it in plain
words for the owner, and put your name in brackets. Claude moves these lines
into the next `docs/RELEASE-x.y.z.md` when it releases, then clears this list.

- Added a safe Codex compatibility check and tested completion reader for future backup development; automatic dispatch stays off. (Codex)
- Pending native verification: removed the idle robot hand; an optional hand appears only for active screen actions. Floating chat and Air gestures remain separate. (Codex)
- Added an optional eye calibration: look at a marker, blink once, and Izuki learns where your eyes sit. It starts off, is only usable while you have the eye camera on, and needs your own webcam test before it's called finished. (Freebuff)
- Izuki can now fix words inside a PDF too: it makes an edited copy beside the original and leaves the original alone. PDFs whose text is stored in a special font are refused with a plain reason instead of being garbled. (Freebuff)
