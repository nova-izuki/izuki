# Izuki 1.0.101: "Open Outlook" opens Outlook

## The bug
Any request with the word "Outlook" in it went to your linked accounts (Composio), even "open Outlook". The same went for Discord, Slack, WhatsApp, Instagram, Gmail and other app names. So instead of opening the app, Izuki tried to read your account.

## The fix
- **Opening an app opens it:** "open Outlook", "switch to Discord", "launch Slack" and "close WhatsApp" now control the real app on your PC.
- **The new Outlook works too:** it's found even though it has no Start-menu shortcut.
- **Questions about what's inside still use your account:** "read my emails", "what's in my inbox", "open my latest email", "check my Outlook" and "send a Slack message" go to your linked account, as before.

The rule is the same on the PC, in the chat and from the phone. The PC and phone test suites read one shared list of example requests, so the two can't drift apart.

## Reviewed
- **Tests:** 258 Rust tests and 35 conversation checks, all passing.
- **CodeRabbit:** 2 findings fixed.
