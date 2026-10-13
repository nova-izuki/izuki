# Izuki 1.0.113: files, a terminal and several PCs, from your phone

The phone's **Remote** now has three tabs: **🖥️ Screen**, **📁 Files** and **⌨️ Terminal**. Only phones you've paired with this PC (the 4-digit code from 1.0.112) can use any of them.

## 📁 Files
- **Your own folders only:** Desktop, Documents, Downloads, Pictures, Music and Videos. Every path is checked to really sit inside one of them, so tricks like "..\..\Windows" or shortcuts can't lead anywhere else.
- **Download** (up to 1 GB), **upload** (up to 200 MB, several at once), **new folder** and **rename**.
- **Nothing is ever overwritten or deleted from the phone.** An upload with a name that's taken becomes "photo (2).jpg". Two uploads at the same moment can't collide either.
- **Every download, upload, new folder and rename** is written to the audit log.

## ⌨️ Terminal (PowerShell)
- **Off until you switch it on:** Settings → Phone → **Let my phone use the terminal**.
- **Commands that only look** (Get-ChildItem, ipconfig, systeminfo…) run at once. **Anything that could change something** is shown to you on the phone first ("This could change things on your PC: … Run it?") and only runs if you confirm that exact command. These are the same rules the Chat tab uses.
- **A 90-second limit** on each command.
- **Every command is logged.**

## 🖥️ Several PCs
The PC picker at the top of the Remote lists your PCs. **➕ Add a PC** asks for the other PC's Izuki link, then you pair it with its own code. Each PC gives this phone its own pass.

## Also
The live picture only streams while you're on the Screen tab, so Files and Terminal don't use video data.

## Reviewed
- **Tests:** 270 Rust tests, including new ones that keep paths inside your folders, refuse unsafe names, and check the terminal is off by default. The build and the phone and page tests pass too.
- **CodeRabbit:** 3 findings fixed.
