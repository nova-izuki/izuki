# Izuki 1.0.198: Chat history, a safer Eye Control, and tasks that pick up where they stopped

Your chats are now saved on your PC and can be searched and pinned. A task cut short by a restart waits for you to say "keep going", and a step that didn't really work is no longer counted as done. Eye Control gets an emergency stop that works even when the rest of Izuki is busy. It stays off unless you turn it on.

## 💬 Chat history you can come back to

- Recent conversations are kept on this PC, and you can search them and carry on where you left off. Nothing is uploaded.
- Pin the chats that matter: pinned ones stay above the recent list and aren't trimmed with old history.
- Deleting a chat asks once more ("Delete?") before it goes, and a deleted chat stays deleted. It no longer comes back when you leave the page.
- Switching tabs is instant: the new page shows at once instead of waiting for the old one to animate away.

## ↩️ Unfinished tasks wait for "keep going"

- If Izuki stops partway through a task, even across a restart, say **"keep going"** and it resumes from where it was.
- A plain "yes" only resumes a task that stopped moments ago in this session. A task left over from an earlier run never takes over your screen because you said "yes" to something else.
- If the text Izuki typed didn't land as intended, or a video it opened never started, that step now counts as failed and Izuki fixes it on its next look instead of reporting success.

## 🛑 Eye Control: an emergency stop first

- **Ctrl+Alt+Shift+X** stops Eye Control at once, from anywhere. It works even if the camera or the panel is stuck, lets go of any held button or key, and doesn't switch itself back on. The keys are shown on the Eye Control card.
- A red **Stop eye control** button is always on screen while it runs, and you can say "Izuki, stop eye control", "Izuki, pause" or "Izuki, resume eye control".
- Moving the real mouse or typing pauses eye steering straight away. Erratic tracking pauses it too.
- After calibration, a short accuracy check with five fresh dots measures how far off your looks really are.
- **In this version the eye cursor is drawn but doesn't move your mouse.** Moving the mouse with your eyes is switched on after a supervised test on a real webcam. Eye Control is still off unless you turn it on, and Hand control works as before.

## ✨ A refreshed panel

- The desktop panel has a softer, light-catching glass surface, a tab indicator that glides between tabs, and a Chat presence orb. Every control is where it was.

## Behind the scenes

- The agent coordinator can rank agents by measured productivity (off for now), and a shared integration list shows what each agent has finished and what's left.
- A real-Windows safety probe checks the emergency stop end to end: it never leaves a key held or the pointer moved.

## Checked before release

The full Rust suite (including the new safety tests), the TypeScript check, the frontend build, the eye-control, chat-history and scheduler checks, the hand-overlay browser regression, and the Windows and web CI jobs pass on the release commit. The emergency stop passed six of six checks on real Windows. Eye-driven mouse movement stays off until the supervised camera test; the release page is updated only after the installer, signatures and updater manifest verify.

---

Free, as always. No account, no subscription, nothing to pay.
