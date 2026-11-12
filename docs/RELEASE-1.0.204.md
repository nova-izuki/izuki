# Izuki 1.0.204: dim the rest, windows that float, and a smarter agent

## 🌗 Dim the rest

Say **"dim the rest"** (or open Style → Layouts) and everything except the window you're working in fades into the background. Switch windows and the light moves with you.

- **How dark:** "dim the rest a little" for soft, "make the dim darker" for deep.
- **With Focus mode:** turn on "Also while I focus" and "focus for 25 minutes" dims the rest by itself. It brightens again when the session ends.
- **Turning it off:** **"undim"** brings everything back.

Clicks go straight through the dim, and it never takes focus. It stays out of screenshots, recordings and the phone remote, so Izuki's AI always sees your real screen. It needs Windows 10 version 2004 or newer, and Izuki tells you if your PC is older.

## 📌 Keep on top, see-through, hide the rest

- **"Keep Spotify on top"** keeps that app above every other window. "Unpin Spotify" lets it go, even if another tool pinned it.
- **"Make Discord see-through"**, "make this window 50% transparent" or "a little see-through" lets you see behind it. "Make Discord solid again" undoes it.
- **"Hide everything except this"** (or "clear the clutter") sends every other window to the taskbar. "Undo the layout" brings them back.

Every window goes back to normal when Izuki quits. All of these work from your phone, Discord and Telegram too.

## 🔁 The agent re-plans after a failed step (Freebuff)

When a step doesn't work (a click, typing, a shortcut, scrolling, opening something), Izuki takes a fresh look and re-plans from what's on screen now. It gives up after three fresh looks instead of looping.

A Send, Pay or Delete button that Izuki has pressed once in a task is never pressed again in that task, so an email or a payment can't happen twice. The exception is a request about several things, like "delete these three files" or "accept all the invites": after a fresh look, the same button can be pressed for the next one.

## 🩹 Fixed

- **A retired AI model kept failing your messages.** NVIDIA retired the free llama-3.2-11b-vision model on 5 November, but Izuki kept asking it first. When your other AIs were busy, your message failed. Now a model its provider retired, or won't serve to your key, is benched for a day and that provider's other models answer instead.
- **The website's ability counts now match the list.**

## Checked before release

- **Automatic checks:**
  - The full Rust suite (698 tests), with new tests for the wording, Focus mode, retired models and the final-press rule.
  - Real-desktop tests on this PC: the dim sits right under the window in front, fades in and out, and leaves screenshots alone; keep-on-top and see-through apply and undo on a real window.
  - The phone routing checks.
  - The Windows, web and phone CI jobs.
  - Review rounds.
- **Not tried by you yet:** dim the rest while you work, see-through on your own apps, and the agent's re-plan on a real task.

---

Free, as always. No account, no subscription, nothing to pay.
