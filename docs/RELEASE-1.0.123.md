# Izuki 1.0.123: Campus (what's due), a smoother phone remote, a voice that keeps up with its words, and fewer junk answers

## 🎓 Campus: "what's due this week?"
- **Ask** "what's due this week?", "what's due tomorrow?", "do I have any assignments today?" or "which assignment should I do first?". Izuki answers from your school's own calendar, soonest first. Then say "teach me this assignment" once one is open.
- **"Connect my Blackboard":** Izuki opens your school's Blackboard calendar (the one you've visited, like blackboard.sanjac.edu, never Blackboard's company site). Open the calendar's settings → "Get external calendar link" → Copy. Izuki watches for 3 minutes and saves the link by itself, with nothing to paste. Canvas and Moodle calendar links work too.
- **The same link powers your due-date reminders**, a day before and two hours before, on the PC and your phone.
- **Read only:** Izuki never submits or changes anything on your school's site.

## 📱 The phone remote's live view is much faster
Measured on this PC, one picture of the screen took about **200 ms** to make: capture 45 ms, shrink 42 ms, compress 100 ms. On top of that, the next picture waited until the last one had reached the phone, so the view was choppy.
- **A faster JPEG encoder** works straight from the screen's own pixel format, with no extra copies. Compressing went from **45–100 ms to about 17 ms**, and the pictures are 15% smaller.
- **The next picture is made while the last one is still travelling**, and only the newest is sent. A slow connection gets fresh pictures, never a backlog.
- **One picture now takes about 65 ms to make**, about three times faster. A still screen still costs almost nothing, because unchanged pictures aren't re-sent.

## 🗣️ The voice keeps up with the words on screen
You said the text showed, but the voice came late or out of step:
- **The chosen voice was failing first on every line.** When your chosen cloud voice failed (Groq's daily voice limit), every line waited for that failure before another voice spoke. Now, for 10 minutes after a failure, Izuki goes straight to the voice that last worked.
- **The ChatGPT voice is rested while its account has no credits**, instead of a failed try on every line.
- **The Windows voice:** captions used to start the moment Izuki *asked* Windows to speak, and Windows can take a second or more to start. Now they start when it really starts talking.

## 🧹 Junk "answers" no longer count
One free AI router sometimes replies with a safety-checker label ("User Safety: safe") instead of an answer. That's now treated as a failure, so the router is rested and a real answer is used. This was part of why your lab attempt went nowhere.

## About doing labs
Your Wireshark lab attempt failed mostly because nearly every free AI service was failing at once: Groq rate-limited, OpenRouter rate-limited, Gemini and NVIDIA timing out, OpenAI out of credits, and UI-TARS asking for payment. Operating *inside* a lab's virtual machine needs one AI look per click, which those limits block.

What works well now: with the lab page open, say **"help me with this lab"**. Izuki reads the lab instructions from the page, saves a step-by-step guide to your Notes, and walks you through it ("next step", "explain that"). That takes only one or two AI calls.
