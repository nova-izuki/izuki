# Izuki 1.0.209: "any good email?" is checked, not searched

## 📬 Your Gmail question reaches the inbox

1.0.208 fixed the mail parser, but the Chat tab still sent Gmail questions through the generic apps and model lane. "Check my gmail on chrome for any good message" could still become a search for the words "chrome good". Now:

- **Typed in Chat**, a mail question takes the inbox/search lane before any model or screen step.
- **"Any good message?"** runs the same inbox check as Apps → Inbox. "On Chrome" is where you would read it, never a search term.
- **Real searches still search:** a named sender or topic, or a filter like "unread" or "today", stays a Gmail search.
- **Check again is fresh:** an explicit check reads the inbox again instead of replaying the ten-minute cache.
- **The wait says what it is doing:** "Checking your inbox…" instead of "Thinking…".

## Checked before release

- The exact sentence is covered by a route test: the inbox lane wins, while "unread" and named-topic searches stay searches.
- The TypeScript build passes.
- The full Rust suite and the Windows installer build run in CI.
