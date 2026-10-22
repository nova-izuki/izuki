# Izuki 1.0.160: safe with your windows and your volume, straight with FL Studio

## 🪟 "It mistakenly clicks FL Studio and the window minimises… and what if it closed FL?"
**The problem:** Izuki's log shows it minimised the window it was working in 5 times in a week: FL Studio 3 times and Chrome twice. It happened two ways:
- **Misclicks on the window's own buttons.** A click meant for something near the top-right corner landed on Minimise. Close (X) sits right next to it, so the same slip could close FL Studio and lose unsaved work.
- **Clicking the taskbar to "switch" to a window that was already in front.** Windows treats that click as "minimise". Izuki then said "let's switch back to FL Studio", clicked again, and hid it again.

On top of that, when Izuki thought it had opened the wrong window, it was told to "press Alt+F4" to close it. If it was wrong about which window that was, that closes your app.

**What changed:**
- **Window buttons only when asked.** Before every click, Izuki checks whether the spot is a window's minimise, maximise or close button, worked out from the window's own frame and screen scaling, so it holds for apps that draw their own title bar like FL Studio. It also checks key presses for Alt+F4, Ctrl+Q and Win+D. If you didn't ask to close, minimise or maximise something, Izuki doesn't do it. It tells the AI why and to aim at the control it meant.
- **Taskbar toggles are put right.** If a taskbar click minimises the window that was already in front, Izuki puts it straight back. The AI is told the window was already open, so it doesn't loop.
- **Wrong window? Go back, don't close.** When Izuki ends up in a window it didn't mean to open, it now presses Esc for a menu or switches back. It never closes an app it didn't open.
- **Buttons that throw work away are final.** "Don't save", "Discard" and "Close without saving" join "Submit", "Send" and "Delete": Izuki only presses them when you ask in so many words.

**Where it applies:** every screen task (voice, chat, Island, phone) and the quick "click X" shortcut, since they all run steps the same way. Replays of your saved flows still do exactly what you recorded.

**How it was checked:** the agent tests pass, plus new ones:
- "line my 808 up", "enable Izuki in FL's MIDI settings" and "search afro beats" don't allow closing, minimising or maximising.
- "close Notepad", "minimise everything" and "make Chrome full screen" do.

The top-right-corner rule follows Windows' standard window buttons. It hasn't been watched live on FL yet.

## 🎛️ FL Studio: through the link, never the mouse
**The problem (after FL was connected):**
- **The metronome went to the mouse helper.** Izuki said it couldn't hear the beat, then couldn't hear the metronome, and its "turn the metronome's volume up" sent you asking the screen helper. The helper hunted for FL's metronome button, pressed a shortcut that opened FL's "Open" dialog, then said "Turning the metronome on now…" and called that done.
- **"Fix the beat" made a new beat.** A request with "make" and "beat" in it ("make the beat louder", "make my beat hit harder") was taken as "make a new beat", so Izuki wrote fresh trap drums into your project. Ctrl+Z in FL takes them back.

**What changed:**
- **Once FL is connected, Izuki works FL through its link:** the metronome, play/stop, tempo and the 808, sample and tuning jobs. A request that would have gone to the screen helper goes to the link first. "Turn the metronome on/off" just does it, and when Izuki listens it switches the metronome on and off itself.
- **Listening says what really happened.** Before, Izuki pressed play and recorded without checking anything. Now it checks FL actually started playing and how loud the sound reaching your speakers was, and logs both. If something's wrong you get the real reason: "FL didn't start playing", or "FL was playing but your speakers got silence", with where to point FL's output.
- **A new beat only when you ask for one:** "make a beat", "cook up an afrobeat", "give me a drill beat". Anything about *the/my/this* beat, or fix, louder, better, mix, flow, align or tune, is never a new beat.
- **No more "done" that's only a promise.** "Turning the metronome on now", with nothing actually done, is no longer accepted as finished.

**How it was checked:** tests for the new-beat wording (7 asks, 9 that aren't) and the existing FL, agent and listening tests. The listening checks will show in Izuki's log (`[fl] listened …`) the next time you ask.

## 🔉 "When it talks it lowers the sound a little, that's cool — but FL keeps getting quieter"
**The problem:** while Izuki listens or speaks, it turns other apps down to a fifth, then puts them back. It put them back through a handle to each app's sound, so two things went wrong:
- **The put-back missed.** When FL Studio restarted its sound while turned down (FL Studio ASIO does), the handle pointed at the old sound and missed the new one. Windows remembers each app's volume, so FL came back at a fifth.
- **It stacked.** The next time, Izuki turned *that* down to a fifth again. That's FL "keeps reducing".
- **It turned FL down while listening to FL.** Izuki was ducking FL during its own 808, metronome and sample checks, then wondering why it couldn't hear the beat.

**What changed:**
- **Apps are remembered by name with their real level,** on disk until they're put back. Putting back finds an app again even if it restarted its sound, and a turn-down never stacks on an earlier one.
- **Anything a previous run left turned down is put back when Izuki starts.**
- **No ducking while Izuki records FL.**
- **If you move an app's slider yourself meanwhile, it stays where you put it.**

**If FL is quiet right now:** right-click the speaker icon, open Volume mixer, and drag FL Studio back up. From this version on, Izuki won't leave it down.

## 🧠 Room for more AI: a custom AI on the internet joins the backups
**The problem:** "the free AIs are maxed out". Today's log showed 82 screen rounds (mostly FL fumbling), Groq refusing 72 times, Gemini 40 and NVIDIA 18. Izuki's Custom AI slot was always treated as a model on this PC, so a free cloud service like GitHub Models couldn't join the backups.

**What changed:** a Custom AI pointing at the internet (such as GitHub Models, `https://models.github.ai/inference`) now counts as a normal cloud AI. It joins the backups when Groq or Gemini is busy. A Custom AI on this PC (localhost) is still treated as local.

**Your FL setup:** done. loopMIDI's "Izuki" port starts with Windows, and Izuki shows under FL's MIDI Input and Output on Port 236.
