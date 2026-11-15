# Nova Notch review follow-up — 2026-11-15

Codex claims the eight unresolved CodeRabbit threads on PR #103, in isolated
`codex/notch-review` from `10d7402`. Freebuff's branch remains unchanged.

| Thread | Current evidence and disposition |
| --- | --- |
| 4577827461 — menu pointer events | Existing `.izk-island-menu` override is present; browser regression pending. |
| 4577827477 — Shadow off | Existing flat shell filter override is present; browser regression pending. |
| 4578746137 — negative answer intent | Chat and voice already share `wantsDirectAnswer`; ordinary refusals work; extend coaching coverage. |
| 4579033150 — Light glass contrast | Local scrim exists but nearly disappears at high opacity; rendered contrast verification and correction claimed. |
| 4579060354 — qualified answer refusals | Existing broad qualifier support works for the supplied example; add bounded qualifier/refusal regressions. |
| 4579119904 — teacher-mode conversion | Confirmed: teacher command is rewritten before TUTOR_START; shared intent correction claimed. |
| 4579816737 — compact keyboard access | Confirmed: status div has no activation target; labelled native button claimed. |
| 4579816741 — escaping notch glow | Confirmed: parent glow is unmasked while overflow is visible; notch-specific suppression claimed. |

## Validation (2026-11-15)

- `npm run test:conversation`: **74 passed, 0 failed**, including the new
  coaching/refusal cases and the shared teacher-mode command.
- `npm run build`: passed (TypeScript and Vite production build).
- `node tools/notch-browser-check.cjs`: passed against the real React
  components in headless Edge. Enter, Space and pointer click all open the
  notch; the transparent shoulders stay click-through; the menu receives
  pointer events and its action closes the menu; Shadow off removes the shell
  filter; 36 rendered light-glass contrast checks pass with a **5.81:1**
  minimum over white and mid-grey desktops at 50/94/100% opacity.
- The branch now includes current `main` (`167ac2d`); only the ownership table
  needed a manual merge. No native code changes; no live owner profile is read.

Not verified: the installed Windows app and a real screen-reader session; the
checks use the component fixture, not the packaged WebView2 overlay.
