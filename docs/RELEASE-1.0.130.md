# Izuki 1.0.130: it clicks the button it says it will, Lecture Mode, and Campus in Notes

## 🖱️ "Click Continue" in FL Studio now really clicks it
You asked Izuki to press Continue on FL Studio's pop-up. It said it was clicking it, never did, then said it was done.

The log showed why:
- **FL Studio's pop-up has no buttons Windows can see** ("screen controls: 0"), so Izuki had to find Continue in a picture of the screen.
- **The precise pointer found it**, at (1248, 754). But the free AI's rough guess was somewhere else, and with no Windows button to settle it, Izuki treated that as a disagreement and **dropped the click**. Every time.
- **Then it called the task done.** The AI's reply ("Bet, hitting that Continue button for you") was read as finished: "hitting" wasn't a word Izuki knew means "about to do it", and in "Say less, I got you fam — clicking Continue right now" the word "clicking" came too late in the sentence to be checked.

Fixes:
- **Izuki now reads the words on screen to settle it.** When the precise pointer lands where Windows sees no button, Izuki reads the text right there. If the button's label is really there ("Continue"), it clicks the centre of that word. It never lands on a risky word (Delete, Buy, Send…) that wasn't asked for.
- **When the precise pointer can't answer** (busy or out of free quota), Izuki reads the words around the AI's guess and moves onto the real label.
- **The label comes from what the AI said** it would click: quoted text, or the word after "click / hit / press / tap / select". "Continue on the Cloud path warning pop-up" looks for **Continue**, not "warning".
- **A promise is no longer mistaken for "done"**, however chatty the reply. The first dozen words are checked, and "hitting", "right now", "I got you" and similar now count as "about to do it".

## 🖥️ The taskbar that disappeared
The "Hide the taskbar" tile was on. That's what made the taskbar hide behind open apps and only appear when the mouse touched the bottom edge. I switched it off on your PC, and the tile now warns exactly what it does.

## 🎓 Campus, at the top of Notes
- **Deadlines:** what's due in the next two weeks (anything within 2 days in amber), and what was due in the last two weeks under "Was due (check you submitted)". Your school calendar can't show submissions, so Izuki never claims to know.
- **Ask "show me everything overdue"** or "did I miss any assignments?" for the same list in chat.
- **Each note's menu** now has **Explain in 60 seconds** and **Teach me like a beginner**, next to Summarise and Quiz me. Izuki says which parts come from your notes and which are its own examples.

## 🎙️ Lecture Mode
**Notes → Campus → Start a lecture.** Recording starts only after you tick that you're allowed to record (your instructor and school permit it, people nearby know). You're also told the audio goes to your transcription service.

- It records in two-minute pieces, and each is written down straight away by Groq's Whisper (or Gemini). The transcript grows while the lecture goes on.
- **The Island shows LECTURE MODE • RECORDING** the whole time, and Notes shows a red RECORDING clock. Switching tabs doesn't stop it; only **Stop** or **Discard** does.
- **Stop and make notes:** after the last piece is written down, Izuki saves a note with a summary, key points, definitions, examples, important dates and numbers, what the instructor stressed, open questions and action items, each with its **[mm:ss] time**. Unclear words are marked "(unclear)", and anything the AI adds is labelled "(general knowledge)". The full transcript is kept underneath so you can check it.
- Long lectures are condensed part by part first. Any part that couldn't be written down is said so, never filled in.
- Needs a free Groq key (or Gemini) for the transcription. Izuki says so before it starts if there isn't one.
