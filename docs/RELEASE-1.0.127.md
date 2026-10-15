# Izuki 1.0.127: smarter deep research, a camera window for Air control, and Air control tells you when Windows blocks it

## 🔭 Deep research writes what you ask for
You asked deep research for "a prompt to make Izuki smarter at checking connected accounts". It answered that the sources didn't contain one. It had been told to use only the web pages, so it wouldn't write anything itself.
- **When you ask it to make something** (a prompt, plan, email, outline, code, checklist), it now writes the finished thing first, ready to copy, using what it read plus its own knowledge. After that come the notes and "How to use it".
- **Facts from pages still get their [numbers].** Its own general knowledge isn't dressed up as a source.
- **Pages about something else are ignored** instead of described.
- **It sees the conversation**, so "research that" follows on from what you were talking about.
- **Version numbers aren't "doubtful figures" any more.** It flagged "0.20" from "v1.0.20". Versions and names like v1.0.20 or GPT4o are no longer checked as numbers.

## 🖐️ Air control: a camera window
Settings → Air control → **Show the camera**. A small window shows you and your hand as the camera sees them:
- **The tracked hand drawn on**, with your pointing finger ringed, since that's what moves the mouse.
- **A dashed frame** showing where to keep your hand.
- **A red glow on the edge your hand is about to leave**, with which way to move it ("Near the top edge — ↓ move it down").
- **When your hand leaves the view**, it tells you which way to bring it back.
- Drag it anywhere by its top bar. **S/M/L** sizes it and **×** closes it. It remembers where you put it.

Tested with the recorded hand video: the window, the frame and the top-edge warning all showed.

## 🖐️ "Air control works on the desktop but not in that app"
Your log showed Air control seeing your hand fine (100% of looks used), so the camera side was working. A common reason it then does nothing in one app: **that app runs as administrator**. Windows blocks other apps (Izuki included) from clicking or typing into it, for security.
- Air control now checks the app in front every 1.5 seconds. If Windows is blocking it, Air control says so on screen: "Windows won't let Izuki click in X — it's running as administrator. Open it normally (or run Izuki as administrator)."
- **The log names the app in front** whenever it changes ("[air] in front: Claude.exe"). If it happens again, the log will show exactly which app and why.

When I checked, the Claude process on this PC was running normally, not as administrator. If Air control still doesn't work over Claude, the new log lines will show what's happening.
