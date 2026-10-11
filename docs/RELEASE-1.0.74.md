# Izuki 1.0.74: Keep my PC fast 24/7, and clear duplicate downloads

## Keep my PC fast 24/7
The switch (Settings → PC Boost) now works on its own — it used to need "Watch for lag" on as well, or it silently did nothing. Whenever the PC slows down, Izuki clears junk and old browser files, frees memory and closes background update tools; once a day it also tidies quietly. Apps are only ever removed when you tap.

## Clear duplicate downloads (new, off until you turn it on)
Once a day, and when you press **Make my PC fast**, extra copies of a download go to the **Recycle Bin**, so you can restore them:
- Only byte-for-byte identical files, in the same folder, where one has the plain name and the others are copies of it: `report.pdf` next to `report (1).pdf` or `report - Copy.pdf`.
- Never touched: identical files you named differently, a year in brackets like `(2024)`, files in different folders, anything saved in the last half hour or still downloading, hidden or system files, and files over 1 GB.
- Files go through Windows' own Recycle Bin. If Windows ever couldn't recycle one and would delete it for good, it asks first — the same warning File Explorer gives.

## Reviewed
Written with CodeRabbit reviewing every step: eight review passes and 14 findings fixed before release — including a critical one (file names had been passed to PowerShell, so a crafted download name could have run code; the Recycle Bin is now reached through Windows directly).
