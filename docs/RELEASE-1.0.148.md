# Izuki 1.0.148: say "yes" to its offers, and deadline reminders straight from Blackboard

## 🙋 Just say yes
**The problem:** Izuki offers to help on its own ("Your drive is nearly full. Want me to find what's taking the space?"), but a "yes" didn't reliably do it. Izuki didn't remember what it had offered, so your "yes" went to the AI with nothing to go on.

**What changed:**
- Izuki now remembers each offer and what it means for a few minutes. A plain "yes" ("yeah do it", "sure, go ahead", "bet") does exactly that. "No" lets it go.
- It works the same on the PC (voice or typed) and on your phone and Discord.
- Anything already waiting for your yes still goes first: a command waiting for "allow", or a task paused for "keep going".
- **The full-memory offer is safer now.** It used to offer to close your heaviest app, which could lose unsaved work. Now it offers to close background helpers only, never your windows.

**What else it helps:** every offer Izuki makes this way. New offers only need to say what a "yes" stands for.

## 📚 Deadline reminders from Blackboard itself
**The problem:** the "due within a day / two hours" heads-ups only read a linked school calendar. Without one you were never reminded, even though Izuki can now read due dates from Blackboard (1.0.142).

**What changed:** with no calendar link, the heads-ups use the same Blackboard due dates as "what's due this week", read through the browser extension every 30 minutes. You're told a day before and again two hours before, on the PC and your phone.

**Limits:** Blackboard needs the browser extension (1.4.2) and a Blackboard tab opened once so Izuki learns where it is.

## 🌐 The website is up to date
New cards for asking in any words, the task to-do list, Izuki working in its own tab, "what's filling my drive?", "just say yes", and Blackboard deadlines.

**How it was checked:** automated tests for what counts as a yes or a no, and for an offer being used once and dropped after a "no".
