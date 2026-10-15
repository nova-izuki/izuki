# Izuki 1.0.125: Deep research in the chat, and web search that works again

## 🔭 Deep research (like Perplexity and Comet)
In the Chat tab, switch on **🔭 Deep** next to Ask/Auto, or just type "research …", "deep research on …" or "do a deep dive into …".

Here's what Izuki does, in about a minute:
1. **Plans the searches.** It always searches your exact question, plus 4–5 other angles: key facts, recent news, an opposing view, hard numbers.
2. **Reads the best pages** in the background, four at a time, with no browser window. At most two pages per site, so one site can't be the whole story. It also adds a Wikipedia article.
3. **Checks what's missing** and searches again.
4. **Writes a long answer** with numbered citations like [1][3], sections, what's uncertain, and a bottom line.

While it works, the reply shows a **computer with an eye** that looks around as it browses, with what it's doing right now ("Searching: …", "Reading nrel.gov…"). Every search and page appears as a step; pages that wouldn't open are crossed out. When it's done, the steps fold away and you get clickable **source chips** and **Save to Notes**. Stop works at any moment.

### Honesty guards
- **Every number is checked against the pages read.** Free AIs sometimes invent figures. In testing, one cited "10–20%" from a page that never said it. Numbers Izuki can't find in its sources are listed at the end under "double-check these".
- **Thin research says so.** If fewer than 3 sources could be read, the answer opens by saying the search was limited and suggests trying again in a few minutes.
- **Only sources it really cites** are listed.
- **Read only.** It doesn't sign in, buy, post or submit anything.

## 🔎 Web search fixed (in the normal chat too)
Testing deep research showed Izuki's web search had quietly broken:
- **DuckDuckGo** now answers background searches with a bot check, so Izuki got nothing.
- **Bing**, the backup, only uses the first word of a background search. That's why searches came back with Best Buy and online games.

Searches now go:
1. **Google, through your Gemini key** (Gemini's Google Search tool).
2. **Brave Search**, at a person's pace (2.5 seconds apart, a 3-minute rest if it says "too many").
3. **Wikipedia's official search**, which always answers.
4. **DuckDuckGo, then Bing**, with Bing's hidden redirect links decoded to the real pages.

Results that don't match the search are dropped.

**Your Gemini key's Google Search allowance is currently used up or not included** (Google answers "quota exceeded"; plain Gemini chat still works). Izuki retries it every hour. Until then, searches come from Brave and Wikipedia. Brave slows down after many searches in a row, so a second deep research straight after a first may find fewer pages. A Gemini plan with Google Search included would make research steadier. That's a paid option, so it's your call.
