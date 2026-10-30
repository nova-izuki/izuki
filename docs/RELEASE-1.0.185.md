# Izuki 1.0.185: any AI you already pay for, in a panel beside the page

## 🧩 Use the AI you already have

Open the side panel in Chrome or Edge and pick who answers:

**ChatGPT · Gemini · Claude · Copilot · Perplexity · Grok · DeepSeek · Le Chat · Izuki on this PC · or any AI tab you pick.**

Press **Connect** and the panel finds that assistant's tab — or opens one beside the page you're reading. From then on, what you ask in the panel goes to it, with the page you're on attached, in **your own signed-in tab**. No second subscription, no API key, no account: if you already pay for one of these, that's the best AI you have and it's already logged in.

The last option matters most. That list will always be out of date, so **"Any AI tab I pick"** takes whatever tab you choose and types into whatever message box it finds. Nothing here knows a provider's API — it types into the page you're already using, the way you would.

### Follow the page
Turn on **Follow questions on this tab** and each new question that appears on the page you're reading is carried over once, by itself — you don't retype anything. It's off until you turn it on, it sends a question once and never re-sends it, and it never touches the page: on anything graded it reads the question and shows you what the AI said. Picking and submitting stays yours.

### Hand a job to your PC
Type what you want done — *"download the project files and open the report in Word"* — and the panel shows you **the exact words** before anything happens. Press **Run with Izuki** and it goes through the desktop app's normal action engine: the same checks, the same buttons it won't press without asking, the same Esc. The panel then tells you how it went, with a **Stop** button throughout.

An answer from an AI tab is never a command. Only the words you reviewed carry any authority — not the page, not the assistant's reply.

### The character is optional
**Show companion with answers** is just a switch. Off, you get answers in the panel with nothing on screen at all. It's the same setting as *Only the glowing edges* in the app, so turning it off here turns it off there.

## 🧍 The characters stand properly again

Two earlier attempts measured each painting's "lean" — the centre of mass of its top against its bottom — and rotated it upright. Measured against the real body axis (a line fitted through the torso), it was reading **coats, scarves and arm position**, not posture:

| | true body axis | what it measured |
|---|---|---|
| Ada | **0.16°** — straight | −2.38° |
| Nova | **0.49°** — straight | −2.10° |
| Leo | **1.50°** | −1.76° (the wrong way) |

So it was tilting straight characters by up to 2.4°. And because the cutoff sat at 1.15°, the same character could be rotated while talking and left alone while idle — which made it **jolt every time it opened its mouth**. That's the "they're posing" you could see and couldn't name.

They were standing straight all along. The correction is gone, and the measurements are written into the file so nobody adds it back. PC and phone share one file, so both are fixed.

## 🐞 Also

- **"Groq 15ss"** — the new "why are you slow?" answer added a second "s" to a time that already had one. Fixed, with a test that catches the whole family.
- The desktop handoff, the task review and the companion switch were all written in the last release but **had no route** — nothing could reach them. They're wired up now.
- The extension the website hands out was three weeks out of date and missing files the panel had started using — it would have opened blank for anyone who downloaded it. It's packed by a script now, and the script refuses to build one that's missing a file.
- If you've added Izuki to your phone's home screen, it had been serving you the old character code from its own cache. Bumped, so the standing fix reaches phones too.

---

Free, as always. No account, no subscription, nothing to pay.
