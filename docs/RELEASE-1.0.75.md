# Izuki 1.0.75: a sharp eye for clicks

Most of Izuki's clicks name a real button by number, which is exact. When the AI instead picks a spot by eye ("the blue Submit button" at a guessed pixel), a model made for pointing at things on screens now looks again before anything is clicked:

- **Gemini by default**, free with your Gemini key. In a live test it pointed at the exact pixel of a button.
- **UI-TARS (optional):** ByteDance's screen-control model through your OpenRouter key. Paid, about $0.0002 a look (5,000 looks for $1). It falls back to Gemini if it can't answer.
- The spot it points at is matched to the real button under it, so the click becomes an exact one Izuki verifies before pressing.
- **Safe by design:** a click only moves to a button whose name says what was meant, or to a spot close to the original. It never lands on a Delete, Buy, Send, Pay or Sign out button the plan didn't name. If the pointer disagrees with the plan in a way that isn't safe, that click and the rest of the plan are dropped, and Izuki takes a fresh look. If the pointer doesn't answer (offline, slow), everything works as before. At most two looks per step, 8 seconds each, and only over encrypted connections.

Settings → Control: **Sharp eye for clicks** (on) and **Use UI-TARS for that look** (off).

Reviewed with CodeRabbit (4 passes; findings fixed, and two declined with reasons: keeping the switch on by default, since the screenshot goes only to an AI you've already added; and allowing short, safe moves).
