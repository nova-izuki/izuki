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

Validation pending. No native code changes; no live owner profile is read.
