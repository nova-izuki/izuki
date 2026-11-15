# PR #108 follow-up validation

Codex continued Claude's nine post-merge review findings from `167ac2d` on
`codex/post108-review`, with the owner's explicit teamwork instruction.
Freebuff's desktop work and the native rescue lane are separate.

Confirmed fixes:

- Android rejects a refreshed/revealed target whose captured label, view ID,
  class, package or description changed. Search purpose uses only the field's
  own hint, view ID and description. Queued wake-service starts catch Android
  rejection inside the main-handler callback and record the failure.
- Empty overlapping wake polls preserve audio and the spoken-wake flag.
  With voice matching enabled, an inline spoken command without recorded wake
  audio opens recording for verification instead of executing unchecked text.
- Stop is checked after session creation and before every apps-lane POST,
  including 404 re-session, tool execution and connection-link creation.
- Autopilot finds search/address boxes from metadata, rechecks the focused box
  before submitting, and preserves message drafts and unrelated Search controls.
- AI-tab pastes retain ownership after Stop. A stopped paste can be retried;
  a user's changed draft or a replaced composer is never overwritten or sent.
- Adjacent comment 4580348042 was also confirmed: a partial transcript returned
  after the deadline was discarded without resuming the active call. Timeout
  now explains the delay and resumes listening; explicit Stop remains silent.

Local checks passed:

- `npm run build` (includes TypeScript checking).
- `npm run test:phone`, including four actual apps-router cancellation races,
  actual `startWake()` voice-verification branches and actual `ask()` timeout/
  Stop transcription branches.
- Conversation, Air, panel, workspace/relay and HTML/encoding checks.
- Real headless Edge panel-browser checks, including in-flight paste Stop and
  retry (only the new request sends), draft editing during the wait, appended
  text and detached-composer refusal. No owner browser profile was used.
- Extension ZIP rebuilt from the changed source. Phone cache generation bumped
  so existing offline installations can receive the repaired shell.

Not claimed: real Samsung microphone/Accessibility behavior or live signed-in
AI website selector compatibility. This host has no Java/JDK available, so the
Android APK compilation and JUnit execution are left to the mobile PR workflow.
No Rust sources changed; the integration coordinator owns the full native gate.
No installed app, private profile or owner settings were opened or changed.

CodeRabbit's local review and the PR workflow results are recorded separately
before integration. This branch does not bump versions, merge or release.
