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
