# Desktop checklist: what only your real PC can prove

CI builds Izuki and runs its tests, but it has no screen, no signed-in browser
and no administrator prompt. These checks are for the installed app on your
PC after an update. Each one says what should happen. If something doesn't,
tell Izuki's developers what you saw; the app's own log is
`%APPDATA%\Izuki\logs\izuki.log` (it never holds your keys or passwords).

## 1.0.215

### Practical Mode

1. Say or type **"teach me how to turn on dark mode"**.
   - Izuki points at the next control, says what to do and why, and waits.
   - The Task Stage shows **Your turn · step 1 of N** with **I did it** and **Do it for me**.
   - Do the step yourself: within a couple of seconds Izuki notices, checks it on the next look and gives the next step.
   - Nothing is clicked for you while it's your turn. Esc closes a menu in the app instead of stopping Izuki.
2. On one of your turns, press **Do it for me**: Izuki does that step, then hands the next one back.
3. Say **"do it with me: open Windows Settings and go to Bluetooth"**: you and Izuki take turns.
4. Mid-lesson, say **"do the rest"**: Izuki finishes the job itself.
5. Say **"help me set up a Python virtual environment"**: Izuki asks once whether to do it, do it with you, or teach you, and offers those as chips.

### Sign-in investigation

1. Say **"who signed in to my PC this week?"**
   - Izuki says Windows keeps that log for administrators and asks before Windows' prompt. Nothing pops up yet.
2. Answer **"yes"**.
   - Windows' administrator prompt appears. Approve it.
   - Izuki answers from the real log: counts, who signed in and how, anything that stands out with the events behind it. If nothing stands out, it says so.
3. Ask again and **decline** the prompt: Izuki says the log wasn't read and describes no sign-ins.

### Sites you're signed into (browser extension)

1. Say **"let Izuki use example.com"**, then **"which sites can you use?"**: it's listed. Settings → Privacy → **Sites Izuki can use** shows the same list.
2. Say **"never let Izuki use example.com"**, then ask Izuki to click something on example.com: it refuses and says why. It doesn't try with the mouse instead.
3. Ask Izuki to fill in a login form: it never types into the password box.

### Browser extension 1.6.3

Update the extension first (the app says when it's out of date).

1. Open the side panel: the status says **ready** only when the Izuki app is running. Close the app: it says so, and **Connect** appears.
2. Start **Go through each question** on a practice page, then start it again: Izuki asks **Stop it, start this one** / **Keep it**. The run bar above the message box always shows **Stop**.
3. Click through to another page on the same site and ask a question: it answers about the page that's open now and says so in the chat.
4. Choose Gemini or ChatGPT, open its tab, press **Side by side**: your page goes left, the AI right. **Back to one window** puts them back.
5. If the AI tab stops answering, the run stops with the reason after its time limit (no endless "Asking…").

## For developers on this PC

- `npm run trim:cache` reports old Izuki build outputs in `src-tauri/target`; add `-- --apply` to remove them. Only build output is touched.
- Dev builds now keep line numbers for Izuki and no debug info for dependencies, which keeps the cache much smaller.

## 1.0.216: Android phone (the owner's Samsung)

Install the 1.0.216 APK (Settings → Phone → App updates, or the download page). Then:

1. **Phone readiness** (Settings → Phone): every row matches what Android shows. Android control reads "Ready" only after it's on; if Android said "App was denied access", the card shows the Samsung steps; after App info → ⋮ → Allow restricted settings and turning it on, come back: the row turns Ready within ~3 s without tapping Check again, and "Enable Android controls" is gone.
2. **Floating orb → Show it**: the orb appears for ~5 s; leave Izuki: it rests ("Tap to talk"), never "Listening…". Drag it to the other side; long-press hides it. Open Android Settings: no orb over it.
3. **"Hey Nova" → Turn on**, then leave Izuki: no repeating connect/disconnect sound in a quiet room. Say "Hey Nova": the screen wakes and Izuki opens. Settings → Phone → Diagnostics shows ARMED / PAUSED / HEARING with the times. Try your own phrase (e.g. "hey jarvis").
4. **Voice match** (optional): Settings → Phone → “Hey Nova” → Teach my voice, then do the three recordings (the first time downloads about 95 MB). Then say "Hey Nova": it starts. Have someone else (or a video) say it: "That didn't sound like you". Turn it off again if you don't want it.
5. **Test phone control** (Autopilot sheet): tap, tap-by-label and swipe pass; any failure line names Android's reason.
6. **Autopilot: "open YouTube and search lofi"**: YouTube opens, the search box opens (not voice search), the results appear, and the log says "results are on screen".
7. **Stop**: ask something long; Send turns into Stop with "Asking Gemini… N s"; Stop ends it with "Stopped."; no late answer appears.
8. Diagnostics → **Copy report** and paste it into the chat with Claude if anything above failed.

## 1.0.216: browser extension 1.6.4 and Windows

1. **Emergency escape**: press Esc three times quickly: Izuki's overlay disappears and its work stops; tray → Restore overlay brings it back. Type "remove the black screen": the same, with a plain result. Ctrl+Shift+Q does it too. No other app closes.
2. **Do it / Type it**: on a reply, Do it acts on the screen; the composer's keyboard button types the draft into the app behind without sending.
3. Extension: ask a question in Gemini, close the side panel mid-answer, reopen it: it shows "Gemini is still answering …" with Stop and Show. Ask again: "Stop that one and ask this" works; "Show Gemini" brings the tab forward.
4. Windows: "help me set my battery charge limit to 80%": Izuki goes to Lenovo Commercial Vantage (not Windows Settings), asks before changing, and only says it's set when Vantage shows the saved value. If it stops, the message says what happened.

## 1.0.217: Android phone (the owner's Samsung)

Install the 1.0.217 APK (Settings → Phone → App updates). Android control and "Hey Nova" on (Settings → Phone).

1. **"Hey Nova" from another app**: open Chrome, say "Hey Nova". The orb pops up, says "Yes?" and listens. Ask "what's the weather today": it answers out loud over Chrome without opening Izuki. Then "Hey Nova, what time is it" in one breath: no "Yes?", just the answer.
2. **"Hey Nova" inside Izuki**: with Izuki open, say it. The orb answers the same way (it no longer ignores you there).
3. **Tap the orb** (turn "Keep a small orb resting" on first): it listens; tap again while it talks: it stops. Tap its words: Izuki opens.
4. **Lock screen**: lock the phone, say "Hey Nova, how far is the moon?": it answers. "Hey Nova, open WhatsApp": "Unlock your phone first…". The notification's **Ask Izuki** works there too.
5. **Speaking**: type a question in the app with Read aloud on: the reply is spoken. In a Call, speak quietly: it still hears you.
6. **Phone agent**: "what's taking space on my phone" → Storage opens and Izuki reads the sizes. "turn on dark mode" → done or explained. "delete my trash" → it tells you which button to press and doesn't press it.
7. **Settings → Phone**: no "Hey Siri" or iPhone alarm sections. One-tap controls: every label inside its tile; More controls shows flashlight, Wi-Fi, Bluetooth, volume…; the flashlight turns on and off.
8. **Teach my voice**: the guided screen shows each sentence big, the meter moves while you speak, all three get a ✓, then "Done". Say "Hey Nova": it starts. A video saying "Hey Nova": "That didn't sound like you".
9. If anything fails: Settings → Phone → Diagnostics → **Copy report**, paste it to Claude.

## 1.0.217: Windows

1. **Island**: at rest nothing shows at the top. Move the mouse to the top edge: it slides down and opens. Move away: it slides back up.
2. **Screen notch** (Shape Studio → Screen notch): its top corners curve out into the screen edge; it only comes down from the top middle (the top-left corner does nothing).
3. "what's taking up space on my PC": short lines, a split archive counted once, no "want me to find what's taking space?" right after it.

## 1.0.218: Android screen assistant

1. Open a web page in Chrome, say "Hey Nova, explain this": the orb answers about that page, out loud, without opening Izuki. Try "what does this mean" on a message and "summarize this" on an article.
2. "Hey Nova, open the second link" on that page: the phone agent does it (a doing request), not an explanation.
3. In Izuki, send "summarize https://izukinova.ai" with no PC linked: it reads the page and summarizes it.
4. On a practice quiz page, "Hey Nova, answer this" with the phone agent: it explains (and says the answer if asked) but doesn't tap an option.

## 1.0.219: Android Run, orb sides, glowing edges, Hey Nova

1. Autopilot → type "open my files and check what's taking space" → Run: the log shows AI steps (opening Files, reading the storage screen) and ends with an answer, never "I don't know that routine". "open YouTube" still opens straight away.
2. Drag the orb to the left edge, tap it and speak: the words grow to the right and stay on screen. Drag it to the right: they grow to the left.
3. While speaking to the orb it swells with your voice; while Izuki answers it pulses with the words.
4. "Hey Nova" or an orb tap: a rainbow light runs around the screen edges over any app and grows with the voice. Settings → Phone → glowing edges off: no light on the next turn (and none in the app).
5. "Hey Nova" ten times from across a room, with a TV on for some: count how many open. Settings → Phone → Diagnostics shows "heard someone but didn't check: …" or a "near miss" for the ones that didn't.
6. Ask a long question by voice: Izuki starts speaking before the whole answer is written.
