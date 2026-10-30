# Continuation of Claude's 1.0.186 work

The checkout was already at 1.0.186; the desktop version changes were made by Claude. Codex continued the unfinished work and is completing that release under the owner's standing auto-update request. The extension is 1.5.1; stale Android and iOS display/build versions were aligned to 1.0.186/build 186.

## Changes

- City learning is opt-in, wired through settings and Talk to Izuki. Map lookups share a four-second deadline across retries, check HTTP errors, and recheck the switch and manually edited city before saving. City-learning and weather-tool diagnostics omit city names. Rejected statements and short non-location replies stay out of the geocoder.
- Questions about Izuki use this build's release notes. Polite questions about another product keep their research route. Summaries preserve decimal numbers and remove emphasis markup. Stop during the frontend classification check prevents a later request from starting.
- Claude's underscore-italics and voice-speed reporting changes are retained.
- Five Windows Looks: Amber, Aurora, Deep Sea, Lavender and Obsidian, using the existing static renderer, previews, apply and Undo. Multiword names work in voice requests; feature search includes them.
- Browser-panel answers use the shared read-only web tools and scoped cancellation. The panel freezes page and connection context, rejects obsolete replies, keeps completed history per browser window, and respects page-sharing choices. Following questions stays on one tab and pauses on navigation or failed handoff. Provider drafts and ambiguous send controls are preserved. Failed handoffs offer copying. A visible Run task button opens reviewed desktop tasks; progress and Stop belong to that request.
- The extension archive was rebuilt with all twelve assets.

## Verification

- TypeScript and production build: passed. The final UI copy/type check also passed.
- Phone, conversation, speaker matching, Air voice/scroll, voice, voice/Notes, companion, finder, panel, chat-text, hotkey and HTML/encoding suites: passed.
- Edge Island fixture: passed detaching an in-flight answer without remounting, docking, follow-ups, stable history, active-thread restore, transcript scrolling and clearing history.
- Edge panel fixture: passed scoped cancellation, rejecting an obsolete reply after New chat, one completed history pair, not reading an unshared page, custom AI handoff, question deduplication, navigation pause, visible task review/token handoff and fitting 360/390-pixel sidebars. Page, AI and desktop APIs are disposable mocks; no account or native action was used.
- Initial native suite: 498 passed, zero failed, 43 existing ignored tests. Includes the new Looks and settings tests, predates the final review and extension wiring fixes. Final native rerun pending.
- Final native suite on the release source, including extension 1.5.1 and the last parser fix: **499 passed, zero failed, 43 existing ignored tests**, 28.12 seconds after compilation. No tests were disabled or thresholds relaxed.
- Wallpaper fixture: passed. All five new wallpapers were rendered at 960×540 and visually checked; the native suite also checks portrait/wide output and voice routing. The desktop appearance was not changed.
- CodeRabbit first pass: completed with five minor findings; all addressed. Second pass completed with two minor findings (plain wording and rejecting invalid first-person city statements before the bare-reply fallback); both addressed. Extracted production Rust helpers were also compiled and tested independently for routing, markup, decimal and city-parsing regressions.

## Limits

No signed-in AI website was operated. Website layouts and sign-in challenges can prevent a handoff; the panel reports this and offers copying. Task fixtures do not demonstrate live Word, browser or file editing. Owner microphone enrollment, native wheel delivery and cloud answers were not re-tested.

Native validation is complete. Signed Windows and phone build checks are the publication gate. Publication status is recorded below once complete. Unpacked extension copies require replacing their files and reloading the extension.
