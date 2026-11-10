# Izuki 1.0.202: your data in your hands, saved window layouts, and steadier Eye and Hand control

## 🔒 Your data, in your hands (Settings → Privacy)

- **What Izuki can access.** Every way Izuki reaches your PC, your accounts and the internet, in one list:
  - the microphone and Sharper hearing, the screen, Recall, the camera;
  - your phone, linked accounts and saved keys;
  - Code mode's auto-run and bug reports.

  Each one has its switch, or a link to where you change it.
- **What Izuki did.** A list of everything Izuki did or changed on your PC, newest first, day by day: clicks and keys, apps opened, looks, tweaks and layouts, files cleared, messages sent from your connected apps, and your phone taking the controls.
  - It stays on your PC for two weeks and never holds what you typed into a box, only how much.
  - Ask **"what did you do today?"** for the short version.
- **Take a copy of my data.** One .zip in your Downloads with everything Izuki keeps about you, readable as JSON and text. Every key, token, password and private link is replaced with "[removed]".
- **Erase everything.** Type "erase" to confirm. Izuki closes, starts again by itself and erases everything before loading anything, then opens like new.
  - Kept: downloaded AI models and tools, and what lets you undo changes to Windows. You can choose to keep your keys.
  - If the old Izuki won't close, nothing is erased; it tries again at the next start.

## 🪟 Saved window layouts

Place your apps the way you work, then say **"save my windows as Work"** (or name it and tap Save in Style → Layouts). Later, **"set up my Work layout"** does three things:
- puts every window back where it was, on every screen;
- opens the apps that aren't running;
- says which ones it couldn't open.

"Undo the layout" works afterwards too, and "every weekday at 9, set up my Work layout" becomes a routine.

## ↩️ Undo for tweak packs

A one-tap pack (Gamer, Clean, Premium, Power user), a vibe's tweaks or "Make my PC premium" can now be put back exactly as it was, even after a restart. Use the button under the packs, or say **"undo the tweaks"**.

## 📱 From your phone

"Put my windows side by side", "set up my Work layout", "make my PC look cozy", "undo the tweaks" and "what did you do today?" now work from the phone app, Discord and Telegram, as long as "phone asks Izuki to do things here" is on. The phone app has two new shortcuts for them.

## 👁️ Eye control

- **The camera going away.** If the camera is unplugged, switched or taken by another app (Teams, Zoom), Eye control says so plainly and lets go of the mouse at once. It picks the camera back up by itself when it's free again, with no restart.
- **Your head moving.** If you lean, turn or move after calibrating, Izuki tells you. Too far, and the mouse waits while you're offered a quick recalibration.
- **A first-run guide:** how to stop it, how to calibrate, and what "preview" means.

## 🖐️ Hand control

A pinch now holds through a fast flick, so a drag isn't dropped halfway. If your hand leaves the picture mid-drag, Izuki lets go cleanly, and a hand that comes back still pinched never presses again by itself.

## 💬 Chat (Freebuff)

The Recent chats panel keeps the keyboard inside it and puts focus back on the History button when it closes. Its search box is easier to read on small screens, and switching tabs respects "reduce motion".

## Also

- One rule now decides what counts as "this PC" for both the key safety checks and the brain list. It also recognises `http://[::1]` addresses and addresses typed without `http://`.
- The website and privacy policy describe the new controls.

## Checked before release

- **Automatic checks:**
  - the full Rust suite (673 tests), with new ones for what a copy may never contain, what erase keeps, layouts and pack undo;
  - the TypeScript check, the build, and the phone, Eye, Air, panel and finder checks;
  - the Windows, web and phone CI jobs;
  - two review rounds.
- **Not tried on a real PC yet:**
  - erase and restart;
  - saving and setting up a layout with your real apps;
  - undoing a pack on your real settings;
  - unplugging the camera, moving your head, and a real hand drag.

---

Free, as always. No account, no subscription, nothing to pay.
