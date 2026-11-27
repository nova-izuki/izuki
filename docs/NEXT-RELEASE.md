# Waiting for the next release

Codex and Freebuff: add one line per change you pushed. Write it in plain
words for the owner, and put your name in brackets. Claude moves these lines
into the next `docs/RELEASE-x.y.z.md` when it releases, then clears this list.
- The version bump is one command now (`tools/bump-version.mjs`): it writes every file `docs/BUMP-CHECKLIST.md` names, phone build numbers included, turns the pending lines into that release’s notes, and fails rather than skipping a row. [Freebuff]
- The iPhone build retries the Capacitor package clone, so a network blip no longer leaves a release a draft with no IPA. [Freebuff]
