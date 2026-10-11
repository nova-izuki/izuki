# Izuki 1.0.80: Concept style, "what's taking my space", safer and clearer

## Concept (beta): the character style you asked for
A new style next to Flat, Comic, Ink and Painted: **Concept**. A fashion concept-art look:
- very tall figures with small heads;
- flat two-tone gouache colour, angular faces, almost no lines;
- big oversized clothes and chunky boots;
- one loud accent colour on off-white paper.

**Dre** is the first, and he talks with his painted mouth and blinks. Pick Settings → Voice orb → Character style → **Concept (beta)**, or say "make your style concept art". Other characters show in Ink until theirs are made.

## "What's taking up my space?"
Ask in any words: "list the apps taking space", "what's eating my storage", "how much space do I have left". Izuki answers in a few seconds, with no AI needed and nothing on screen:
- free space on each drive;
- the biggest installed apps;
- the biggest folders.

It only looks. Cleaning up is a separate step you ask for.

## See what Izuki is doing
While it works, the Island shows a live line from underneath instead of a blind "Thinking…":
- "Read your screen — 45 things I can press"
- "Asking Gemini…" / "Groq is busy — asking another…"
- "Clicking 'Next'…", "Typing…", "Pressing Enter…", "Opening Chrome…"

## Fixes
- **Stop on the Island** now clears "Thinking…" and its Stop button at once, instead of waiting for the cancelled request to finish unwinding.
- **No commands typed on a guess.** In a terminal (Command Prompt, PowerShell, Windows Terminal, or a command in VS Code), Izuki only types a command you spelled out. Otherwise it asks you which one. A plan that gets held back is never counted as finished.
- **No made-up notes on screen.** The teaching pen only writes words on your screen when you asked to be shown or taught something.
- **The voice no longer breaks** when the free Groq voice hits its daily limit. It rests that voice for an hour, or a minute for a per-minute limit, and uses the free voice straight away.
- **"Continue" / "try again"** in Chat carries on with your last request, spelled out, instead of being sent off to your connected apps.

## Reviewed
CodeRabbit reviewed every part: 5 findings fixed.
