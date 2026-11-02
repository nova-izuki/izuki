# Izuki 1.0.193: a browser panel that shows its work

Update the browser extension to **1.5.6** to get the panel changes: Izuki → Settings → Browser extension → Download, then reload it on the extensions page.

## ⬆️ Updates install without "Error opening file for writing"

Pressing Update started the installer and closed Izuki. The installer then force-closed any copy still running, waited half a second, and started copying. On a slower laptop Izuki takes longer than that to let go of its file, so the copy failed with *"Error opening file for writing"*, and Abort left you with no Izuki running at all.

Now, during an update, the installer waits for Izuki to close by itself (up to 20 seconds), closes it if it hasn't, and waits until izuki.exe is free before copying anything. Before handing over, Izuki also puts the volume back and hangs up a call, the same as a normal quit. This was tested with a stand-in program that took four seconds to close and one that never closed: both installed cleanly, where before both showed the error. A manual install still asks "Izuki is running, close it?" as before.

The installer that runs during an update is the new version's, so this already applies to installing 1.0.193. If you ever do see the box, press **Retry**, not Abort: by then Izuki has closed and the copy goes through.

## 🔎 You can see it thinking and searching

The panel used to show three dots for the whole answer, so a long answer looked like nothing was happening. Now the waiting bubble says what's going on: *Reading the page…*, *Reading "Assignment details" too…*, *Searching the web for "…"*, *Reading hhs.gov…*, *Putting the answer together…*. A task running on your PC shows the step it's on (*Now: Opening the discussion*) instead of one line for the whole task.

## 🐛 Bugs fixed in the panel

- **A question typed while an answer was coming disappeared.** The box emptied and nothing was asked. Now it waits its turn: *"Next up: …"*, asked as soon as the answer is in (up to three).
- **Switching tabs while waiting threw the answer away**, with no message. The answer now arrives in the conversation as it should.
- **"The page changed before it could be read"** came back every time on pages that change their own address as you use them (Blackboard, Gmail, a quiz moving to the next question). The panel now reads the page as it is and answers.
- **Two questions sent very quickly** could cancel each other.
- **Copy** now says *Copied ✓*, and a link at the end of a sentence no longer has the full stop stuck to it.
- **Faster on big pages:** reading a page with thousands of links checked every one first. It now stops at the 400 it uses, and a slow linked page holds an answer up for 3.5 seconds at most instead of 5.

## ✨ New in the panel

- **Side by side** for any AI website. Choose ChatGPT, Gemini, Claude or another AI under *Answering with*, and **Side by side** puts your page on the left and the AI on the right, filling your screen, the way Gemini sits beside a page in Chrome. It works in Chrome, Edge, Brave or any browser the extension runs in. If the AI isn't open yet, Connect opens it there. **Back to one window** puts everything back as it was. Browsers don't let extensions open their own split view, so it uses two windows.
- **🧹 Clear**: a clean slate (the chat stays in Recent chats). Typing *clear* does the same.
- **Follow-ups under each answer**: ✂️ Shorter, 🧒 Simpler, 🧩 Example, 📝 Quiz me (three practice questions, answers at the end).
- **↑** in an empty box brings your last question back to change and resend.

## ✅ No made-up facts

Asked for an example, the panel invented one: a "2019 healthcare provider" breach with "30,000 records" and a "$3 million fine" that never happened, written up as fact. Every part of Izuki that writes answers (the panel, the Chat tab, voice, your phone and the screen helper) now follows one rule. It uses only real events, figures and sources it's sure of, named so you can check them. It searches when it isn't sure. When an example is made up, it says so.

## 📚 Graded work: one line, then real help

For a journal, discussion post or essay you hand in, Izuki doesn't write the text you'd submit. That was already the screen helper's rule, and now the panel and the Chat tab follow it too. It no longer lectures: one short sentence, then what makes it quick. It tells you what the prompt asks for, gives you the key points and real examples you can cite, and offers to check your draft. You can also say your answer out loud and Izuki types your words.

## ❓ A help page

[nova-izuki.github.io/izuki/help](https://nova-izuki.github.io/izuki/help/) covers installing, free AI keys, the browser extension, updates and common problems in one place. It's linked from the website's menu and the README.

---

Free, as always. No account, no subscription, nothing to pay.
