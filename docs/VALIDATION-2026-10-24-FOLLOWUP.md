# Voice, Island chat and background web follow-up

Local changes requested after 1.0.164. This document is not a release announcement.
Other uncommitted 1.0.165 release work in the shared checkout belongs to Claude.

## What changed

- Physical hold-to-talk sends on release, including a quick release before the next render. It waits through pauses while held, cancels obsolete transcription, and respects the reply-orb preference. Air/click activation still ends when speech pauses.
- Optional enrolled-voice wake filter: three takes per person, multiple people, local normalized voice templates, and local WavLM inference on a worker only after a wake detection. Enrollment suppresses wake activation. The talk key remains available when the filter cannot match a voice. No owner voice was recorded by this validation.
- Direct factual-answer requests use an answer-first route instead of the blanket quiz-answer suppression. Coaching remains separate, and an answer request does not authorize selecting or submitting answers. Background progress stays on screen rather than interrupting speech. Assignment guides no longer offer Notes unasked.
- Notes study actions carry reference material to a tool-free answer endpoint. Recent additions are included in bounded study context. Flashcard selection is safe when switching notes or regenerating cards. Reload failures are visible and obsolete list responses cannot replace newer ones.
- Island chat has a stable live conversation that moves between its dock, floating window and minimized bubble. Moving it preserves the component and in-flight response. Reopening restores the active conversation ID rather than creating a history row. Clear all includes pinned chats and requires a second click.
- Transcript text is scrollable and participates in overlay hit testing.
- The shared backend reader supports up to four deduplicated links, bounded parallel reads, source URLs, response size limits and per-hop public-address checks with pinned DNS resolution. The Island gains a read-only search/read tool loop. Paired phone webpage requests use the backend without asking which device to control; an unavailable backend is reported instead of pretending a page was fetched.

## Checks

- Production build and TypeScript check: passed during implementation; final rerun recorded below when complete.
- Conversation, voice, Air voice/scroll, companion, phone and HTML/encoding checks: passed. Phone routing includes three new backend-web cases (98 routing assertions passed).
- `node tools/voice-notes-check.cjs`: passed. Includes speaker validation and matching, recent note context, reference-only routing, release before rerender, cancellation during transcription and obsolete-listener rejection.
- `node tools/speaker-model-check.mjs`: passed using four public model-author example recordings, never owner audio. Q8 same-speaker cosine scores: 0.96094 and 0.91432. Different-speaker scores: 0.79432 and 0.66576, below the 0.85 threshold. This is a fixture check, not a universal accuracy claim.
- Browser checks and final native tests: in progress at the time this document was created.
- Initial native test run: 437 passed, 43 intentionally ignored by the existing suite, one failed. `files::tests::long_output_does_not_stall` took about 51 seconds against its existing 30-second limit under load. Final rerun uses two test threads; no test or threshold was disabled or relaxed.
- CodeRabbit reviewed the uncommitted checkout twice. Fixed the actionable answer-routing, test-discovery, all-pinned history and public-reader address-validation findings. Reminder-comment wording and the separately owned wheel-hook lifecycle were outside this follow-up's implementation scope.

## Practical limits

The installed app was not replaced or restarted. No new version was published by this follow-up. Live enrollment, the owner's microphone acoustics, native mouse-wheel delivery and cloud answers still require hands-on validation in the Windows app. The phone's backend scraping requires a paired, reachable PC. Public scraping does not bypass sign-ins or bot challenges. Voice matching helps reduce accidental wakes; it is not a lock-screen authentication mechanism.
