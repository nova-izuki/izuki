# Izuki companion upgrade — working checklist

User request: continue the existing work, make the PC, web, phone and Discord experience consistent, and publish tested downloads on GitHub/site. Do not install the desktop app on the owner's PC.

## In this release

- [x] Repair phone message/history handling and direct Gmail/account routing.
- [x] Stop failed account calls from being reported as successful; keep fresh queries independent.
- [x] Show individual phone app connection buttons and explain separate PC/phone account identities.
- [x] Report Discord gateway status separately from pairing; add a delivery test.
- [x] Route phone reminders to the linked PC; explain calendar export for standalone phone alerts.
- [x] Add Mouse / Precision preferences and direct Windows control invocation where supported.
- [x] Recheck named targets; refuse ambiguous relocation and request another look after target changes.
- [x] Cap speculative model calls; make waiting interruptible; reduce idle cursor polling.
- [x] Add matching Liquid / Ripple / Constellation orb choices and limit animation work.
- [x] Offer updates for the user to download, without automatic installation/restart.
- [x] Make local-only bug reporting status honest; offer a GitHub issue link.
- [ ] Add flow cleanup controls and prevent routine sessions from piling up.
- [ ] Repair browser convenience, page readiness, stale targets and private input handling.
- [ ] Add a usable video teaching workflow: pause, inspect, explain/draw, resume on request.
- [ ] Finish desktop/phone regression checks and a browser smoke check.
- [ ] Update README, handoff, website and release notes; publish and verify the release and Pages.

## Remaining product work / real-world checks

- [ ] Native Android companion APK with persistent signing and an update path; direct site distribution.
- [ ] Android device testing of pairing, accessibility controls, notifications and battery behavior.
- [ ] iPhone testing of hands-free web use, Siri Shortcut handoff and calendar alerts.
- [ ] Incoming call/urgent alert experience. This requires a native notification/call implementation and permissions; Discord currently sends messages.
- [ ] Verified multi-account social posting with per-platform drafts, explicit approval and independent delivery receipts. Availability depends on provider/platform permissions.
- [ ] Live OAuth checks of Gmail and each supported social account; do not infer access from a saved API key.
- [ ] A configured error collection backend (the current bugs.json has no destination).
- [ ] Live screen-control accuracy/latency and battery measurements on representative applications/devices.

A checked implementation item is not a claim of flawless live behavior. Never mark device/account tests complete without actually running them. Keep the owner's existing files, accounts and credentials intact.
