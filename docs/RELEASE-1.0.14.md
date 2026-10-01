# Izuki 1.0.14 — connected apps, precision controls and video classroom

## What changed

- Gmail and other connected-account requests go straight to the app tools. Phone conversations retain the actual words and follow-up history. A saved Composio key and a connected account are shown as different setup steps.
- Failed provider operations no longer count as successful reads. Different questions get fresh results. Expired-session recovery no longer retries merely because a network error contains the word “session.”
- Choose Mouse or Precision in Settings → Execution. Precision tries supported Windows controls directly. Known targets that disappear or become ambiguous trigger another look before clicking.
- Save AI credits avoids speculative screen-model races. Screen-model waits check Stop frequently and have a 45-second planning deadline. Idle cursor polling slows down and orb animation is capped.
- Choose Liquid glass, Water ripple or Constellation on PC and phone.
- Discord distinguishes pairing from an online gateway and provides a test notification button. Delivery to the Discord service and an OS notification on a phone are separate things.
- Phone voice requests use the same routing as typed messages. With a linked PC, reminder requests use the PC scheduler. Standalone phone reminders offer a calendar file for alerts after the page closes.
- Flow cleanup offers Clear all, Clear matching and Undo. Exact repeated recordings update the saved flow instead of duplicating it.
- The Izuki browser gains navigation/search controls, target checks and text-entry verification. Private sign-in fields are excluded from model snapshots. Form submission no longer dispatches both Enter and submit.
- Video classroom in Draw can explain a visible video frame, draw teaching marks, pause, keep playing, slow to 0.75× or resume. Follow this lesson checks every 45 seconds, while the same video is playing in the foreground, up to five explanations or ten minutes. Teaching responses can only draw or point.
- Updates are offered for download. Izuki does not silently install or restart in this version.
- The bug-report panel explains when reports remain local and provides a GitHub issue link.

## Setup and testing

1. Install this version from the website's Windows download.
2. In Apps, save your Composio key and connect Gmail. Ask “Read my latest five emails.” On the phone, either connect Gmail separately or use the linked PC's connections.
3. In Settings, select a control style and orb. Try a harmless action in Notepad before using screen control for important work.
4. Pair Discord, use Test notification, and set a reminder. PC reminders need Izuki running and the PC awake.
5. Open a video in the Izuki browser, then use Draw → Video classroom. Protected/embedded players may need opening on their original website. Explanations use visible content and available captions, not a continuously captured audio feed.

## Limits still being worked on

Native Android APK distribution and an incoming-call notification experience are separate work. The iPhone web app supports conversation, connected services and a Siri Shortcut handoff; it does not grant control of arbitrary iPhone apps. Social capabilities depend on the account type and the platform's API permissions.

The central error-reporting destination is currently unconfigured. Local diagnostics remain available; GitHub reports require the user to review and submit them. Live OAuth, phone/device behavior and screen accuracy require real-device checks. Automated checks do not establish error-free clicking or a measured battery-life improvement.
