# The product principle: one Izuki, millions of companions

Izuki is a publicly distributed personal AI assistant — not one person's
assistant. Every person who installs Izuki gets their own private,
personalized companion that adapts to their preferences, personality,
routines, connected apps, devices, goals and authorized activities. It
becomes more useful to each person over time, while that person stays in
control of their data.

This is the rule written in `AGENTS.md` ("What Izuki is"), and this document
is where the codebase is checked against it — what already honors the rule,
what is missing, and the guardrail to keep applying.

## What the codebase already honors (audited 2026-11-03)

- **Per-user storage.** Everything Izuki keeps — settings, memories, logs,
  backups, thumbnails — lives under `dirs::data_dir()\Izuki`
  (`store::data_dir`), i.e. each Windows account sees only its own data.
  Recent additions follow the same rule: safe-save backups, and the owner-only
  observer's token/KDA frames all write inside that per-user folder.
- **No owner coupling in code.** A scan of the Rust sources finds no
  hardcoded owner name, home path, account, course or device. The owner's
  requests are inputs for what a user might need, not constants.
- **User-controlled memories.** Memories can be listed, added, deleted and
  forgotten-by-topic (`commands::{list,add,delete}_memory`,
  `forget_memories`, `companion::forget`), so a person can inspect and deny
  what Izuki remembers about them.
- **Per-machine updates and rollback.** Install, update and "go back to the
  previous version" operate on the user's own machine with signature checks,
  tied to that user's approvals, never to a developer's account.

## Gaps between here and the long-term vision

These are recorded, not started — the milestone-1.0.196 work ships first:

1. **Data export.** No single "take a copy of everything Izuki knows about
   me" action yet. Memories and settings can be read piecewise, but export
   should be one clearly-labeled command producing one file.
2. **Delete everything.** Memories and connected-app links (Composio) can be
   forgotten individually; there is no one "erase all my data" boundary that
   also clears caches, logs and backups.
3. **Accounts across devices.** The data boundary today is the Windows
   account. The vision wants a user's own multiple devices (PC, phone PWA)
   to share *their* companion — optional sync under one account — without
   any central hardcoding around one person.
4. **Permissions register.** Integrations (Composio, camera, mic, screen)
   each have settings, but there is no one page where a user sees and revokes
   everything granted, per device.
5. **Privacy-preserving learning.** Personalization currently accumulates in
   plain files in the user's folder. Fine for a local product; anything
   server-side in the future must keep the same "only the user reads this"
   property, per the existing secret-handling rules in AGENTS.md.

## Guardrail for every new feature, from now on

When a feature is designed, ask: does it work the same for the ten-thousandth
user with different apps, devices and habits — storing only in their folder,
asking for their permissions, exportable and erasable by them? If a design
needs "the developer's setup" to function, that is a bug of kind, not degree.
This check applies to every row of every milestone, including past ones
responded to with 🧪/⏳ honesty notes.

Nothing above disrupts the milestone-1.0.196 work: the audit found the
foundation sound, and the gaps are for the milestone after, with the owner's
say on ordering.
