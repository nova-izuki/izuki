# Izuki 1.0.200: arrange your windows, describe a vibe, and a website you can trust

Your windows can now be arranged with one sentence. Your desktop can now be designed from a few words. Tasks can be paused. And the website now explains exactly what Izuki does with your things.

## 🪟 Arrange your windows with one sentence

Say **“put my windows side by side”**, **“tile my windows”**, **“put my windows in columns”** or **“focus layout”**. You can also tap a layout in **Style → Layouts → Arrange my windows**.

- The windows on the screen you're using move into place.
- The one you used last gets the biggest spot.
- Their edges meet with no gaps.
- **“Undo the layout”** puts every window back where it was, including any that were maximised.

Only ordinary app windows move. Izuki's own windows, hidden or minimised ones, full-screen games and videos, and small dialogs stay where they are. Windows won't let Izuki move an app run as administrator, so Izuki tells you when that happens.

## ✨ Describe a vibe, get a desktop

Type a mood into **Style → Looks → Describe a vibe**, or just say it:
- *“make my PC look cozy”*
- *“give my desktop a cyberpunk vibe”*
- *“black and gold”*

Izuki picks the closest of its 19 looks. If you want them, it adds tweaks that suit the mood too (a gaming vibe gets the Gamer tweaks). **Put my old look back** still undoes it all.

## 🧩 Go further with Windhawk

For changes Windows' own settings can't make, like a vertical taskbar, a restyled Start menu, or a taskbar clock with the weather and CPU, **Style → Tweaks** now has a **Windhawk** card:
- it explains what Windhawk is: free, open source, and it works by injecting its mods into Explorer, which Izuki itself never does;
- **Install** gets it with Windows' own installer, and Windows asks you first;
- **Open** starts it;
- 12 mods worth starting with, each linked to its page.

## ⏸️ Pause a task, then pick it up

Every task card has **Pause**:
- The step that's running finishes first, then Izuki waits.
- Use your PC as you like.
- When you press **Resume**, Izuki looks at the screen again before the next step, so it never clicks where things used to be.

After a scroll, a shortcut, or opening an app, Izuki also checks the screen really changed. If it didn't, it looks again rather than pressing the same thing twice.

## 🩺 A storage checkup you can read

**PC checkup** in the Chat tab now shows a card instead of a wall of text:
- a bar for each drive;
- the biggest apps, folders and files;
- what's safe to clear.

Nothing is deleted unless you say so. Asking *“what's filling my drive?”* gets the same card.

## 💬 Chat

- **Rename** a chat right in the list, and **search** inside your conversations, not just their titles.
- **Clear all** chats, with a second tap to confirm.
- Up to **50** recent chats are kept (pinned ones never count towards that).
- When an AI service fails, you get one clear sentence instead of a wall of error codes.
- If you send just “answer all of these” with nothing to answer, Izuki asks what you mean. A real question like “explain everything about black holes” goes straight through.
- **Hand or Eye control** can be picked, and stopped, right from the chat.
- **The empty chat's suggestions** come from more ideas and change every 45 seconds.
- **A task saved before a restart** can be finished by saying “keep going” (a saved task lasts six hours).

## 📬 Inbox

- A Gmail account check that fails for a moment is tried once more, instead of the account being reported as broken.
- An unfinished Gmail sign-in is shown as unfinished, not broken.
- The inbox card names the Gmail address it actually read, and how many checks failed.

## 🎨 Looks

- The floating panel looks richer: deeper colours, a clearer selected tab, and the typing box lifts when you click into it.

## 🌐 A website you can trust

- New **[Privacy](https://nova-izuki.github.io/izuki/privacy/)**, **[Terms](https://nova-izuki.github.io/izuki/terms/)** and **[Security](https://nova-izuki.github.io/izuki/security/)** pages. They explain:
  - what stays on your PC and what goes to the AI you chose;
  - how to check your download is the real one;
  - why Windows warns you the first time you install.
- A **“Built to be trusted with your PC”** section on the home page.
- **On phones**, there's now a menu, and the long list of features is a searchable **Everything Izuki can do** section in 7 groups.
- Fixed: parts of the page that should stay in place while you scroll were scrolling away, leaving screens of empty space.
- Removed the made-up like and comment counts from the short clips.

## Fixes

- **Important: asking about your Recycle Bin no longer empties it.** Before this update, a question like “is my recycle bin empty?” could empty it for good. Now even “empty the recycle bin” doesn't delete anything straight away. Izuki tells you what's in it (“3 items, 400 MB”) and waits for your **yes**. The AI can't empty the bin or clear files unless your own message asked for exactly that. A OneDrive or other cloud bin is never mistaken for Windows' own.
- **Saying “don't turn on study log” no longer turns it on.** “Don't stop saving my questions” no longer turns it off, and asking “is my study log on?” changes nothing.
- **A local picture-only AI model** (moondream) is no longer used to chat. A proper local vision model still does screen work.
- **Screen looks keep a backup AI.** A slow local model can no longer hold up every look.
- **Switching from Eye to Hand control** no longer turns Air control off.
- **The chat's welcome orb** moves gently at a lower frame rate, and holds still if you've asked Windows for reduced motion.
- **A question about Google Drive, OneDrive, Dropbox or box.com** never scans your PC's disk, and never cleans it up. Asking about your **D: or E: drive** now gets the storage card too.
- **When a quick command shows no visible change** (“scroll down” at the bottom of a page), Izuki now says it can't tell whether it worked, instead of “Done”.
- **Only real requests move your windows or change your look.** “A grid layout for my website”, “does Mario Kart have split screen” and “make my room look cozy” are left alone.

## Checked before release

- **Automatic checks:**
  - the full Rust suite, including the new tests: window layouts fill the screen exactly with no overlaps, and the vibe and study-log wording;
  - the TypeScript check;
  - the chat, storage, eye and panel checks;
  - the Windows and web CI jobs.
- **The website:** checked in a browser at phone and desktop sizes. The menu, the searchable feature list and the sticky sections work, nothing scrolls sideways, and there are no console errors.
- **Not yet tried on a real PC:**
  - arranging real windows;
  - installing Windhawk;
  - Pause and Resume during a real task.

  If any of them misbehaves, please say so.

---

Free, as always. No account, no subscription, nothing to pay.
