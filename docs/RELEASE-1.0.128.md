# Izuki 1.0.128: honest connected-account checks

Ask "check my connected accounts", or press **Apps → Account health → Check my accounts**. Izuki goes through every app linked to it, and every account behind each app, and says what really works right now:
- **Working:** one quick read-only call answered, and Izuki names whose account it is (the address).
- **Linked:** the link is active, but this app has no quick check.
- **Sign in again:** expired or revoked → one tap **Reconnect**.
- **Couldn't check:** what went wrong (or "didn't answer within 10 seconds"). It's re-checked a minute later.
- **Started but never finished:** a sign-in that was opened and never completed. It's listed, not hidden, with **Connect** to finish it.
- **Not linked:** common apps (Gmail, Calendar, Drive, Outlook) with no link at all.

Several links to the same account count once. Results are kept for 5 minutes (1 minute while something is failing), and any account that fails during a search is re-checked next time. Up to 8 checks run at once, each with a 10-second limit.

Run on this PC (read-only, 1.3 seconds):
- **Gmail:** 1 account working, plus 3 extra links to that same address and 1 unfinished sign-in. So there is really only one Gmail account linked; the "4 Gmail accounts" were the same one.
- **Tasks and LinkedIn:** working.
- **Docs, Sheets and YouTube:** linked.
- **Calendar, Notion, Outlook, GitHub, Reddit, Todoist, Clay and SerpApi:** a sign-in was started and never finished, so they aren't linked.
- **Google Drive:** not linked.

## Email search
- **An unfinished Gmail sign-in is no longer silently dropped.** When an email isn't found, the answer says so and points you to Apps → Gmail → Add another account.
- **If every account fails, it never says "no emails"**; it says it couldn't search. That case is now tested, alongside duplicate links, an expired account, and the email being only in the second account.
- **Each account's profile check gives up after 10 seconds**, so one stuck account can't stall a search.

## Sending says which account
Before a Gmail send or draft, the approval now starts with **From: your-address**. If you have several Gmail accounts and none was picked, it lists them and tells you to say "send it from …".

Everything here is read-only unless you approve an action. Logs show counts and masked addresses (l***@gmail.com), never tokens or full addresses.
