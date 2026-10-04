# Izuki 1.0.36

A "What's new" screen, news from all your apps on wake-up, and a chat that always reports back.

## What's new, in the app

- After every update Izuki shows **What's new** once — each new thing with a
  button to try it or jump straight to it. Open it again any time from the
  **✨ What's new** button at the top. The search (Ctrl+K) finds the new
  features too: TV, talk options, new orbs.

## Wake up — across all your apps

- Besides your inbox and calendar, the status screen now shows **what's new
  across your other linked apps** — Slack, Discord, Outlook, Teams, GitHub,
  Notion and more — in an **Across your apps** panel. It's read-only, and
  arrives a few seconds after the screen opens.

## Fixed

- **The chat went quiet after running something.** If the AI didn't write a
  summary after a command (often a free brain being busy at that moment),
  the chat just stopped — you had to type "continue". Now it always reports
  back: the summary, "Done", or what went wrong.
- **Small AI models "explaining" instead of doing.** In real use, a small
  11B model answered tasks with descriptions instead of actions dozens of
  times. Bigger brains now go first for tasks as well as questions; small
  ones stay as backups.
