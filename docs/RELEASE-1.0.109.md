# Izuki 1.0.109: your inbox, gone through, and an honest "what are you doing?"

## 📥 Inbox
Apps → **Inbox** → **Check my inbox**. Izuki reads the last few days of your Gmail (not promotions or social) and shows what needs you, **urgent first**: who it's from, the subject, and the to-do in plain words ("Pay the electric bill by Friday").

For each one:
- **✍️ Draft a reply.** Izuki writes a reply and shows you the draft in the chat. Nothing is sent until you say yes (the check from 1.0.108).
- **⏰ Follow up in 3 days.** A real reminder: "Follow up with Sam about 'Interview' if they haven't replied."

Below that, **"Done in your apps"** lists what Izuki really sent or changed for you this session. An item is only listed once it actually went through.

Needs Gmail linked in Apps. Going through the inbox uses your AI brain once, and the result is kept for ten minutes.

## 🤖 "What are you doing?"
Ask Izuki "what are you doing?", "what are you working on?", "what's going on?" or "status update", by voice or typing. It tells you the truth, taken from the task it's actually running and its latest step, for example: *I'm working on "open Blackboard". Right now: Opening Blackboard in Chrome (14 seconds in.)* If nothing is running, it says so. It never makes up an activity.

Asking in the middle of a task doesn't stop the task.

## Reviewed
- **Tests:** 264 Rust tests, including a new one for overlapping tasks, plus the build.
- **CodeRabbit:** 4 findings fixed (the log no longer records who a message went to, an older task can't erase a newer one's status, and the conversation ends properly after the answer).
