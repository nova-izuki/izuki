# Izuki 1.0.122: the right website first try, assignments taught step by step, routines, phone notifications, more lessons, and fixes from your testing

## 📘 "Open my lab assignment, teach me while I do it, and save it to my notes"
- **Izuki opens it** (it goes to Blackboard the fixed way), reads the instructions, and writes a guide: what the assignment asks, what to hand in, the due date if it's shown, numbered steps with the *why* of each, key terms, and a checklist before submitting.
- **The guide is saved to Notes**, so it's easy to come back to and remember.
- **Then it walks you through:** say "next step", "repeat", "go back" or "explain that". Extra explanations go into today's lesson notes.
- **It coaches you through doing it yourself.** It doesn't write answers for you to hand in as your own, and it never submits anything.
- **Already have the assignment open?** Say "teach me this assignment".

## 🌐 "Open Chrome and go to San Jac Blackboard" goes to the right site
Your test went to Blackboard's corporate "trust center" page. Here's why, and the fix:
- **Chrome's address bar quietly finished the address from your history**, and Enter went there. Now, whenever Izuki types into a browser's address bar, it clears that greyed-in guess first, so Enter goes to exactly what was typed. That also applies to Izuki's own "go to this page in the same tab".
- **"Go to [a website]" is now worked out directly, not by typing:**
  - An address you say ("sanjac.blackboard.com") opens as is.
  - A site Izuki has opened for you before opens again, even when speech mishears the name ("Sanjag" or "Sanjay" for "San Jac").
  - Otherwise Izuki looks it up and opens the top result. "San Jac Blackboard" finds `blackboard.sanjac.edu`, the real login.
  - Izuki then remembers it.
- **Say "wrong site"** and Izuki forgets that one, so you can give it the right address.
- **From the phone or Discord**, this only works when you've allowed controlling the PC from your phone, and never while the PC is locked.

## 🐢 Less waiting when a free AI isn't answering
In your test, one free AI server didn't answer and cost **14 seconds every time**. Now, while your internet is fine, a server that doesn't answer rests for 90 seconds (longer if it keeps failing), and Izuki goes straight to one that answers. When your own internet is down, nothing is rested.

## 🔄 Routines: Izuki does things by itself on a schedule
Say it: **"every weekday at 8, check my email and send me the summary on my phone"**. Izuki tells you what it understood. It's **off until you say "turn it on"**.
- **Schedules:** every day, weekdays, weekends, a given day, every hour, morning, evening or night.
- **Manage by voice:** "my routines", "pause the email routine", "change it to 9am", "run it now", "delete it".
- **Each run** follows the same rules as missions. Anything that would send, post or delete only becomes a draft waiting for your yes.
- **Results** show on the PC and, if you asked, on your phone. A time missed while the PC was off runs once when it's back.
- **The Routines card** under Draw shows each routine, its next run and its last result.

## 🔔 Real notifications on your phone
In the phone app: **🌱 Grass → 🔔 Notify me on this phone**. Your phone then buzzes, even with Izuki closed, when a draft needs your yes, missions finish, or a heads-up arrives. Tapping the notification opens Touch Grass.
- **It uses standard Web Push**, encrypted so only your phone can read it.
- **On iPhone**, first add Izuki to your Home Screen (iOS 16.4 or newer).

## 🎓 New lessons: Python, JavaScript and Git
"Teach me Python", "teach me JavaScript" or "teach me Git". Every step runs for real in your practice folder, and you see the real output.
- **Python and JavaScript** cover your first program, variables, if, loops, functions, and how to read an error message.
- **Git** covers starting a repository, status, commit, history and diff. The practice commits never change your own Git settings.
- **"Check my work"** really runs your program, or counts your commits.

## ✋ Air control picks up your hand more easily
You said it wasn't registering your hand:
- **A hand tilted forward still counts.** Only a hand truly side-on is ignored.
- **Your hand is picked up faster and dropped more slowly.**
- **There's more time** between opening your hand and making the fist to pause.
- **Clicking pauses only after 7 seconds** of a still hand, not 4.
- **Typing hands are still ignored.** Checked with the recorded test video: 0 moves, 0 clicks.
- **New:** every 30 seconds Izuki's log notes how many camera frames used your hand, and why any didn't (too low, not raised, turned sideways). The next tuning can use your real numbers.

## 💬 The hands-free chat no longer spins forever
In hands-free mode, background sound (a video, music) could make Izuki start transcribing. When that turned out to be nothing, the orb stayed on "thinking" forever. Now it goes straight back to listening.

## Also
- **"Record in Ableton" and other DAW commands from the phone or Discord** now need phone control allowed, the same as other PC actions.
