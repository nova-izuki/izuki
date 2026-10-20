# Izuki 1.0.154: a real photo every day, with your PC's colours to match

## 🖼️ Daily photo, like Windows Spotlight but for your whole look
**The problem:** Izuki's Looks didn't make the PC look or feel premium. Every Look used a wallpaper that Izuki painted with code: a colour gradient, a few soft glows and simple shapes. However well tuned, that reads as a theme, not a beautiful PC. The accent colours were also fixed per Look rather than matched to the picture. And there was no way to get what Windows Spotlight gives the lock screen: a fresh, real photo every day.

**What changed:** in **Style → Auto**, choose **Daily photo** (or say "give me a new wallpaper every day like Windows Spotlight"). Every day Izuki:
1. **Gets a real photo** from:
   - **Bing's photo of the day,** a new 4K photo daily with its title and credit;
   - **Windows Spotlight's own pictures** already on your PC;
   - or **both**, taking turns.

   If one isn't available (offline, say), it uses the other. If neither is, it tries again in half an hour, not every minute.
2. **Matches your PC to it:**
   - **Accent:** taken from the photo's most vivid colour that covers real area, kept readable on both themes.
   - **Light or dark mode:** chosen by how bright the photo is.
   - The accent stays subtle (not splashed across the taskbar), the way premium setups look.
3. **Sets it as your wallpaper.** **New photo now** (or "another wallpaper") gets a different one straight away.
4. **Shows today's photo** in the Style tab: its title, where it's from, the credit and the accent.

**Undo** still puts back your own wallpaper and colours exactly as before. Only the newest few photos are kept on disk.

## 💎 A premium, minimal taskbar in one tap
**Style → Tweaks → Premium & minimal** hides the search box, the Task view button, Widgets, the Copilot button, the "Learn about this picture" desktop icon and app badges. That's just your apps on a clean taskbar, using Windows' own settings only (no hacks). Each one can be turned back on separately.

**How it was checked:**
- **Today's real Bing photo** (3840×2160, a sloth in Costa Rica): green accent, light mode.
- **A real Windows Spotlight picture on this PC** (a lake at dusk): deep blue accent, dark mode. Both pairings were looked at side by side with a mock taskbar.
- **Spotlight's files have no file extension,** so the first version found none of them. Izuki now reads each file's real format, and found the 3 wide pictures on this PC.
- **Made-up photos:**
  - a night city gives dark mode with a blue accent;
  - a bright beach gives light mode with turquoise;
  - black and white gives a calm slate;
  - a near-black photo still gives a readable accent.
- **Your words:** "is there any way to put new pics as the cover randomly like windows does" turns Daily photo on, "another background please" gets a new one, and "stop changing my wallpaper every day" doesn't turn it on.

**Limits:**
- The lock screen keeps Windows' own Spotlight (turn it on in Settings → Personalisation → Lock screen). Izuki changes the desktop.
- Bing photos are for your own wallpaper, the way Bing's own wallpaper app uses them.
