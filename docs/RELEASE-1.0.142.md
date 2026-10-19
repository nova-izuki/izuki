# Izuki 1.0.142: knows its own app, Blackboard due dates, Missions that do more, and easier to find your way around

## 🗂️ Izuki knows its own app
You asked it to open Izuki Notes, look through your assignment discussion and save it to your notes. It opened Windows Notepad instead, then started writing a script for your video response. That's fixed at the root:
- **"Open Izuki notes"** or **"open my notes"** opens Izuki's own Notes tab. "Izuki settings", "Izuki chat" and the other tabs work the same way. Izuki never opens a Windows app with a similar name for them.
- If you name another app (Notepad, OneNote, Sticky Notes, Keep, Notion), that app opens.
- **"Look through this and save it to my notes"** (or "save this discussion to my Izuki notes", or "take notes on this") reads the page in front and saves proper study notes straight into Izuki Notes, then shows them. Nothing gets typed anywhere. "Don't save this" is respected.
- The screen brain is now told the same thing, so even a request worded differently won't send it to Notepad.

## 🧹 No more messing up your PC
On that run it bounced between Chrome and Notepad seven times. Now, if a task keeps switching to windows you never mentioned, Izuki **stops after the third time and asks you** where you want it done, instead of thrashing around your PC. It also remembers that for next time.

## ✍️ Writing comes out right
- **Long text is pasted in one go**, instead of typed key by key, in any app. It's instant and exact, and it can't go wrong halfway because you touched the mouse.
- Your clipboard is put back afterwards. If it holds anything besides plain text (a picture, a file, formatted text from a web page), Izuki types instead, so nothing you copied is lost.
- **Fixed garbled characters:** typing used to cut text in places that could split a "curly quote", an em dash or an emoji into "�". Text is now always typed in whole characters.

## 🔇 No more "Bet, hold up, I'ma…" on every step
Every step of a task used to speak a progress line, starting with the same filler. Now:
- openers like "Bet", "Say less", "Yo Solomon", "Hold up", "fam" are stripped from progress lines;
- a progress line is spoken only when Izuki is doing something new, and at most about every 12 seconds. When it's teaching you, explanations are never held back;
- lines that were only filler aren't said at all.

## 📝 Graded writing stays yours
Discussion posts, replies to classmates, essays and video scripts are yours to write. Izuki helps you understand the prompt, lists what it asks for, suggests points and sources, and gives feedback on your draft.

## 📚 Blackboard due dates, straight from Blackboard
You asked a mission to "chrck my assignments on blackboard and tell me the due dates", and it gave up in 9 seconds. Two things were wrong:
- **Due dates were only read from a linked school calendar link**, and yours wasn't linked. Now, with Blackboard open in Chrome or Edge (signed in, with the Izuki extension), Izuki reads the due dates from **Blackboard itself**: its calendar first, then each course's assignments. It remembers where your Blackboard is, so next time it doesn't need the tab. Grades, announcements and course materials use the same lookup.
- **The question wasn't recognised:** "chrck" (a typo) and "tell me" didn't count as asking. Typos of "check", plus "tell me", "give me", "show me", "find" and "look", all work now. "Remind me my essay is due Friday" is still a reminder, not a question.
- **Update the browser extension** (Settings → Browser extension → Download, then reload it) to get this. It's version 1.4.1.

## 🎯 Missions do more
- **One-tap examples:** "What's due on Blackboard this week", "Check my grades on Blackboard", "Any new announcements in my classes", "Sum up my unread emails".
- **↻ Try again** on any finished mission puts it back on the list. No more removing it and typing it again.
- **📝 Save to Notes** keeps a mission's result in Izuki Notes.
- **📅 Every morning** turns a mission into a daily routine at 8 am, which tells you and your phone. Change the time by saying "change it to 9am".
- **Start them when I'm away:** turn it on, and your waiting missions start by themselves once you haven't touched the PC for 10 minutes. You get one report when they're done.

## 🧭 Easier to find your way around
- **Every tab shows its name.** At the window's usual size, seven of the eight tabs used to be bare icons. Now they all say Draw, Chat, Apps, Notes, Flows, Watchers, Style and Settings.
- **Nothing hides off the edge.** The quick-jump chips at the top of a tab scrolled sideways, which a mouse wheel can't do, so Settings' Phone, Discord, TV, Browser, Help and Updates (and more) were out of reach. They now wrap onto a second line.
- **Search boxes read cleanly.** The magnifying glass sat on the first letters of what you typed.
- **Boxes are the size they were designed to be.** A style rule made every text box the same big size, whatever it was meant to be.
- **The Draw tab is in parts:** The Island, On its own, Memory, The hand, and Answers and voice, instead of one long list of switches.
- The **Top / Bottom** buttons moved to the middle, so they no longer sit on top of the switches at the end of each row.
- Flows and Watchers no longer show two "nothing here yet" boxes saying the same thing.
- The command box on the Draw tab says what it's for ("Tell Izuki what to do…"), so it isn't confused with the search box above it.
- **Izuki Notes** is called that everywhere: the app, the browser extension's right-click menu and the website.

## 🐞 Bugs fixed from real logs
- **Discord alerts got lost** ("You are opening direct messages too fast"). The conversation is now opened once and reused, and alerts go out one at a time.
- **Heads-ups while offline:** starting Izuki without internet made it say "Gmail and Google Calendar aren't linked", which was wrong. It now waits until it can check, retries every couple of minutes, and logs an outage once instead of every time.
- **No more double clicks on web pages:** when a link click inside the page navigated away before the browser extension could answer, Izuki clicked again with the mouse. Now it takes a fresh look instead, and the extension answers before the page changes.
- **Taskbar buttons:** clicking a taskbar button was refused as "the taskbar is on top of" it.
- **The 2D character could freeze:** one bad number stopped every frame after it. It now starts its pose afresh.
- A model that chose not to act was being reported as an Izuki bug; it's now just logged.
