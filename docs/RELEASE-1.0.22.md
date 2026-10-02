# Izuki 1.0.22

Fixes for conversations losing their thread, a chat that could get stuck, and
the "Call Izuki" phone line.

## It remembers what you were talking about

- **A plain "yes" now carries on.** If Izuki asked "want me to scroll and
  continue?", saying **yes** actually resumes the task instead of being read as
  the start of a new conversation.
- **One conversation, not two.** The Chat tab and the voice orb, the
  hands-free bar and the floating chat now share the same thread. Previously
  each kept its own, so a short reply after switching between them came back
  blank. Opening the Chat tab no longer ends the conversation you're in.

## The chat can't get stuck any more

- **X to close, and Esc works mid-request.** Both cancel the wait for a reply
  that may never come.
- **A retry button when nothing answers.** The chat says so and puts your
  message back, instead of spinning silently for three minutes.

## One-tap replies

Suggestion chips appear under the chat with the likeliest next replies —
"Yes, do that" when it asks, "Check that" after it acts on your PC, plus
"Keep going" and "Start over", which are always there so you're never stuck in
a thread that went the wrong way.

## Call Izuki (phone) fixes

- A broken or half-finished download of the Cloudflare tunnel program is now
  re-downloaded automatically. Previously one interrupted download could leave
  the phone line broken for good.
- The tunnel's own error is now shown ("too many active quick tunnels",
  "connection refused") instead of a generic "is the internet on?".

## Heads-ups explain themselves

Email and calendar notifications now say what's missing when nothing can
arrive — "add your Composio key", or which account isn't linked — instead of
leaving every switch on and nothing happening.

## Google search

The sitemap now lists every page with a `lastmod` date, so Google recrawls and
the site listing stays fresh.