# Izuki 1.0.107: new emails on the Island, and suggestions for creative apps

## 📧 New emails on the Island
When a new email lands in your main inbox (not promotions or social), the Island shows a tile with who it's from and the subject, for example "📧 Sam: Interview tomorrow". Tap it and Izuki reads the email to you, then says in a sentence or two what it's about and whether you need to do anything.

- **More than one?** The tile says how many more ("+2 more").
- **Notifications too:** you still get the Windows notification (and the phone one) as before.
- **Quiet when you want it:** it stays away while you're busy with Izuki or watching something full screen, and when you've turned off "Suggest help by itself".
- **Needs Gmail linked** in Apps. It uses the check Izuki already does every few minutes, so there's no extra AI use.

## 💡 Suggestions for creative apps
The Island's one-tap help now knows these apps too:
- **Music apps** (FL Studio, Ableton, REAPER, Studio One, Cubase, Bitwig, Audacity, LMMS): "Make a beat" and "Mixing tips".
- **Blender:** "Explain this tool" and "Help me model this".
- **Video editors** (DaVinci Resolve, Premiere Pro, Vegas, CapCut, Clipchamp): "Editing tips" and "Explain this panel".
- **Design** (Photoshop, GIMP, Krita, Figma, Illustrator, Canva): "Design feedback" and "Explain this tool".
- **OBS:** "Check my stream setup".
- **PowerPoint and Google Slides:** "Make this slide better".

These come on top of the existing browser, email, chat, Word, PDF, Excel and code suggestions. They're plain rules, so they're instant and free and nothing leaves the PC. They only offer help Izuki really gives: looking at the screen and explaining, or making a beat for any music app.

## Reviewed
- **Tests:** 261 Rust tests, including 7 new suggestion cases, plus the build.
- **CodeRabbit:** 1 finding fixed (the email tile respects "Suggest help by itself").
