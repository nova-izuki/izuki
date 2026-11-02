# Izuki 1.0.194: PC Care that finds what's actually slowing your PC

PC Care used to answer "my PC is slow" by cleaning: temp files, caches, memory. On the laptop this was built on, the real causes were a C: drive 96% full, Chrome holding gigabytes of memory, and a code build using a quarter of the processor. A cleanup touches none of those, and part of it made things worse. PC Care now looks first.

## 🩺 What's slowing my PC?

Settings → PC Care → **What's slowing my PC?** (or ask "why is my PC so slow?") looks at:

- **The drive**: how full it is. Under about 10% free, Windows has nowhere to put the memory it pages out or the updates it downloads, and everything waits on the drive.
- **Memory**: how much is used, and which apps hold it.
- **The processor over the last minute**, not one moment. A short spike is said to be a spike, not a slowdown.
- **Which app is behind each**, all of its processes together (Chrome is dozens of them).
- **Real work**: a build, a test run or a coding assistant (the Rust compiler, Node, Bun, VS Code, Claude Code, Freebuff, Git and more) is named as work and left alone. Nothing offers to stop it.
- **Izuki's own share**, its WebView2 windows included, said plainly if it's what's heavy.

Each cause comes with why it slows things down and the fix that would help: *See what's using the space*, or *Turn on Memory Saver* (Chrome, Brave) or *sleeping tabs* (Edge), which opens the browser's own setting. Nothing changes until you press a button, and the busy-tab tip (Shift+Esc in Chrome) shows you which tab it is.

"Why is my PC slow?" used to run the cleanup instead of answering. It now answers, on the PC, in the chat and from your phone. "Speed up my PC" still does the speed-up.

## 🧠 Smart Care and 🛠️ Auto Care

PC Care's two switches now say what they do:

- **Smart Care: watch and explain.** A few cheap readings every 5 seconds, nothing more. When the PC stays slow, the Island says what's behind it and what would help. A build or test run isn't flagged. It changes nothing by itself.
- **Auto Care: fix the safe things by itself.** When the PC stays slow, it fixes only the safe causes it found: it closes a background updater or crash reporter that's hogging the processor (they start again when needed), and frees memory from idle background apps when memory is really short. **A minute later it checks whether that helped** (processor and memory before and after), says so, and stops doing what didn't help on your PC for a few hours. It never deletes your files, stops a build, closes a window or clears anything on a lag spike. The quiet daily tidy of old temp files stays.

## 🐢 A cleanup that caused lag, removed

Every PC Boost clean deleted the graphics shader caches (DirectX, NVIDIA, AMD). Chrome, Izuki's own windows and games keep ready-built drawing code there. Deleting it made them stutter and use more processor while they rebuilt it all, often right when the PC was already struggling, and it freed very little space. Those caches are no longer touched.

## 💾 "Drive almost full" shows what's using it

The low-space alert's button was *Free up space*, which only ran the temp-file clean and barely dents a drive that's 96% full. It's now **See what's using it**: the biggest folders and apps, and what's safe to clear.

## 🧩 Browser panel fixes (extension 1.5.7)

- **Run task from the floating panel.** Every task failed with *"The page changed or its window is no longer in front"*, because the floating panel's own window was the one in front. The panel now brings your page forward first.
- **"Your Gemini tab has a draft" on every question.** When Izuki typed a question into an AI tab and its Send didn't go through, that leftover text counted as *your* draft, and every later question stopped there. Izuki now recognises its own leftover and replaces it. Words you typed in that box yourself are still never touched.

Update the extension (Settings → Browser extension → Download, then reload it) to get these.

---

Free, as always. No account, no subscription, nothing to pay.
