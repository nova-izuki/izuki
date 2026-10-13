# Izuki 1.0.110: Missions, so Izuki works while you rest

Draw → **Missions (Rest mode)**. Give Izuki a list of things to do while you're away, for example:
- "check my assignments and list what's due this week"
- "summarise my unread emails"
- "find the cheapest flight to Lagos next month"

Press **Start** (or say "start my missions") and step away. Izuki works through them **one after the other**. When they're all finished you get **one report** on the PC and your phone, for example "Missions finished — 1 needs you".

Each mission shows its status: ⏳ waiting, ⚙️ working on it, ✅ done (tap it to read what Izuki found), ✋ needs you, or ⏹ stopped.

## Safe while you're away
- **The same safety as everything else.** Each mission goes through the same paths as a request you'd make yourself, so every safety rule still holds: **nothing is sent, posted or bought without your yes**.
- **Anything that needs you waits.** A draft to approve or a question is marked ✋ "needs you", with what Izuki said, and the rest carry on.
- **Esc or Stop** stops the missions.
- **The list is saved** (in %APPDATA%\Izuki\missions.json) and written safely, so a crash can't wipe it.

## By voice or typing
- "Add to my missions: check my assignments"
- "Start my missions" or "start rest mode"

Saying "mission" in passing never starts anything.

## Reviewed
- **Tests:** 265 Rust tests, including a new one that recognises when a mission needs you, plus the build.
- **CodeRabbit:** 7 findings fixed.
