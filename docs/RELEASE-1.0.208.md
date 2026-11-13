# Izuki 1.0.208: "any good emails?" means what you meant

## 📬 Email requests understood properly

You asked: "check my gmail on chrome for any good message". Izuki searched for emails containing the words "chrome" and "good" and found none. That was wrong. Now:

- **"Any good emails?", "anything worth reading in my inbox", "check my gmail for anything important"** go through your inbox and pick out what needs you. That's the same check as Apps → Inbox, done straight from your Gmail account with no clicking around in Chrome.
- **Where you'd read it isn't the topic.** "On Chrome", "in my browser" and "on my phone" are no longer searched for.
- **A real topic still searches:** "any good emails from Amazon" looks for Amazon.
- **Attachments and topics stay searches:** "any good emails with attachments" still filters for attachments, and "emails about my website" searches for the website instead of treating it as a place.

## 🤫 Heads-ups wait while you're talking

A heads-up that isn't urgent (like "your C drive is nearly full") no longer cuts in while you're in the middle of asking Izuki something or while it's working. It is kept for your next welcome-back summary instead of being lost.

## Checked before release

- **Automatic checks:**
  - The full Rust suite, with your exact words as a test case, plus attachment, topic and "using Chrome" cases.
  - The Windows, web and phone CI jobs.
  - Review rounds.

---

Free, as always. No account, no subscription, nothing to pay.
