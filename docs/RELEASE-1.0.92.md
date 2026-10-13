# Izuki 1.0.92: tasks finish instead of going in circles, and all 35 characters animated

## Tasks finish
Izuki's own log showed why tasks stopped halfway, so these are fixed:
- **No more going in circles.** It now notices when it's about to do the same thing again (for example "Opening Blackboard" for the third time while the page was still loading). It waits for the page instead, then carries on with the next part of the task. The first repeat already gets a nudge to wait rather than open it again.
- **The fastest free brain isn't shut out any more.** A one-minute "too many requests" from Groq was mistaken for "out of credits," because its message says "Used 4029" and 402 is the "payment required" code. Groq was then left out for 6 hours. Now it rests for a minute and comes back.

## All 35 characters really animated
The last 14 characters got their real animation too. Every character now walks, talks with gestures, thinks, types on a laptop, waves, gives a thumbs up, cheers, points and shrugs.

## Reviewed
CodeRabbit reviewed it: 3 findings fixed.
