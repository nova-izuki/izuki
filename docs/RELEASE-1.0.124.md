# Izuki 1.0.124: Looks, a whole new Windows in one tap

You said the Windhawk-style tweaks felt useless, with no designs. Now there are **Looks**: Settings → Looks, or just say "make my PC look Nova".

## 🎨 Seven complete looks
Each one sets dark or light mode, an accent colour, where that colour shows (taskbar and Start, window title bars), see-through effects, and a wallpaper Izuki paints for your exact screen:

- **Nova:** a planet's glowing cyan edge under the stars. Izuki's own look.
- **Midnight:** violet and pink northern lights over dark mountains.
- **Ember:** warm sparks rising from an orange glow.
- **Forest:** misty mountains under a green night sky.
- **Sakura:** light pink and peach, with soft floating lights.
- **Paper:** clean and bright with fine flowing lines, for daytime.
- **Focus:** dark grey and one quiet ring. No see-through effects, a little faster on a slow PC.

Each card shows a small picture of Windows in that look before you tap it. "Change my wallpaper too" can be switched off to keep your own picture.

## Your own mix
- **Accent colour:** 12 swatches, or pick any colour.
- **Switches:** dark mode, see-through effects, accent on the taskbar and Start, accent on title bars.
- **By voice:** "accent colour purple", "switch to the midnight theme", "undo the look".

## Undo puts everything back
The first time a look changes anything, Izuki saves what you had. That covers every colour setting, your wallpaper, and a **wallpaper slideshow** with its pictures and timing (yours is one). "Put my old look back" restores all of it.

Tested for real on this PC: Nova applied, then Undo. All colour settings matched byte for byte, the accent came back through Windows' own call, and the 4-picture slideshow restarted with its 30-minute timing. The only trace left is the Nova picture in the "recent images" row of Windows' Background settings.

## How it works (and what it doesn't do)
Looks use only your own Windows settings (no admin) and the same accent-colour call Windows Settings itself makes. Nothing is injected into Windows Explorer.

That's why there's no TranslucentTB-style see-through taskbar. On Windows 11 the taskbar draws its own background, and TranslucentTB itself now injects code into Explorer to restyle it. The old call that doesn't need injection is still accepted on this PC, but I couldn't see whether it did anything: the screen was locked during the test. I won't ship a style I can't show working. The taskbar can still take your accent colour.
