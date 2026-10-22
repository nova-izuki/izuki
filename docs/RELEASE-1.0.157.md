# Izuki 1.0.157: Premium Style, with fresh photos you've never seen

## 🌄 "The wallpaper doesn't look premium, and it's not still there"
**The problem:** two things together.
- **Your Auto was still on Shuffle.** Shuffle cycles Izuki's painted looks every hour, so Daily photo was never actually on and the photo never "stayed".
- **Daily photo itself was thin.** It used Bing's one photo a day, or the few Spotlight pictures already saved on this PC, so the same ones came round again. And it told you nothing about the picture.

**What changed:**
- **Fresh photos from Windows Spotlight's live feed.** These are the curated 4K pictures Windows itself shows, fetched new each time. Bing's photo of the day (and its last week of photos) takes turns with it.
- **Never one you've seen before.** Every photo shown is remembered (the last 500), so you won't get a repeat while there are new ones. Spotlight pictures saved on this PC are used only when you're offline, starting with the one shown longest ago.
- **About this picture.** The Style preview now shows the real photo, with where it is in the corner. Hover it for the story behind it (from Spotlight) and the photographer's credit. Say "what's this wallpaper?" and Izuki tells you.
- **♥ Keep it.** This saves the photo to Pictures → Izuki Wallpapers, which is yours for good. "Photos from → Your favourites" then rotates just the ones you kept. You can also say "save this wallpaper".
- **How often:** a new photo every 30 minutes, hour, 3 hours, or once a day. This is its own setting, separate from Shuffle's.
- **Recent photos.** A strip of your last photos (up to 16); tap one to go back to it, with its colours.
- **One tap: "Make my PC premium".** When your wallpaper is still on Izuki's painted looks, Style shows a banner that says so. One tap gives you real photos with matching accent colour and light or dark mode, plus a clean taskbar (just your apps; no search box, Task view, Widgets or Copilot). You can also say "make my PC look premium". Undo puts your old look back.
- **Switching to Daily photo now shows a photo straight away,** even if an attempt a few minutes earlier failed.

**Where it applies:** the Style tab, plus voice, the Chat tab and the Island, which all go through the same looks commands ("another wallpaper", "save this wallpaper", "what's this wallpaper?", "make my PC look premium").

**How it was checked:**
- **The live test** (`cargo test --lib real_photos -- --ignored`, run 2026-10-21) never changes Windows. It fetched:
  - Bing: "Winging it over the river", Nguyen Hoang Bridge over the Perfume River, Hue, Vietnam, 3840×2160.
  - Spotlight: "Here there be dragonflies", a dragonfly on loosestrife blossom, 3840×2160, with its story ("Dragonflies are among the most ancient insects on Earth…").

  Asked again with that photo marked as seen, Spotlight gave a different one. The feed can list the same photo twice in one batch; Izuki takes one per request and checks its seen list, so that never causes a repeat.
- **Voice tests** cover: "save this wallpaper", "I love this background keep it", "favourite the current wallpaper", "what's this wallpaper", "where is this background from", "make my pc look premium" and "make my laptop feel premium".
- **They stay with the chat:** "keep my wallpaper" (could mean "don't change it"), "save this slide background", "how do I save this wallpaper", "the style side doesn't make my pc look or feel premium" (a complaint) and "is youtube premium worth it on my pc".

**Not checked yet:** the new Style panel's look on screen. A headless screenshot couldn't load the dev build on this PC; other tools' dev servers were using most of the CPU. The code type-checks; open Style → Auto to see it.

**Limits:**
- Spotlight's live feed and Bing need the internet; offline, it uses the Spotlight pictures already on this PC.
- The lock screen keeps its own picture; this changes the desktop only.
- Taskbar tweaks fully show after Explorer restarts (Style → Tweaks offers the button).
