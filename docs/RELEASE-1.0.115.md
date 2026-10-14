# Izuki 1.0.115: every Gmail account, searched for real

## The bug
"Find my Home Depot email" could answer "there are no Home Depot emails" while the email was sitting in Gmail. Here's why:
- **Only one account was ever read.** Gmail is linked through Composio. When a tool runs without naming an account, Composio reads only its default one, so any other linked Gmail account was never searched.
- **The Gmail tool returned one email by default** unless the AI remembered to ask for more.
- **The morning briefing counted only the Primary tab.** A hiring email filed under "Updates" wasn't in the count, and "2 new emails" never said which two.
- **The answer never said what was searched,** so "none in the one account I could see" sounded like "none anywhere".

## The fix (PC chat, voice, phone app and Discord, which all use the same engine)
- **Every linked Gmail account is searched**, each by its own connection, and every result keeps the account it came from.
- **Linking the same Google account twice no longer causes double results.** It's searched once.
- **Names are matched in all their spellings:** "Home Depot", "Home_Depot_Hiring", "homedepot", in the sender, subject and text. That covers all mail (archived included), not spam or trash.
- **Answers say exactly what was searched**, and they tell these cases apart:
  - Found, with sender, subject, time, read/unread and account.
  - Nothing found in the accounts that were searched.
  - An account that couldn't be searched, so the email might still be there.
  - A Gmail link that needs signing in again.
  - "That account isn't linked to Izuki yet."
- **Morning briefing:** it lists emails received in the last day and how many are unread. Every count comes with the emails behind it. Job, security, school, appointment and money emails are picked out even if Gmail filed them under Promotions or Updates. It also says which accounts it checked and which it couldn't.
- **Apps → Inbox → "Gmail accounts Izuki can read"** shows exactly which accounts Izuki searches, flags any that need signing in again, and has an **➕ Add another Gmail account** button.
- **The apps assistant:** Gmail read tools run on every account, labelled by account. A tool that opens one specific email goes to the account that has it.

## AI rate limits
When a free AI says "too many requests, try again in 7 seconds", Izuki now rests it for those 7 seconds instead of a fixed minute. If one keeps rate-limiting, each rest is twice as long as the last, up to 15 minutes. Izuki goes to a brain that's answering in the meantime.
