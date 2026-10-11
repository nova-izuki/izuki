# Izuki 1.0.83: PC Care, Drive mode, and calls on school Wi-Fi

## PC Care: alerts when something needs you
PC Boost is now **PC Care** (Settings → PC Care). A health check sits at the top and shows:
- **Antivirus:** on and up to date? Defender, or one you installed.
- **Firewall:** on for every network?
- **Drive health:** is a drive reporting it may fail?
- **Space:** is a drive nearly full?
- **Windows Update:** is a restart waiting to finish updates?

Each problem has its fix one tap away: Windows' own security page, Windows Update, Izuki's clean-up, or help backing up.

**Alert me when something needs attention** is on by default. Izuki checks quietly every few hours, and disk space every 10 minutes. When something's wrong, the Island says so with the fix, and so does your phone if you've linked Telegram or Discord. The same problem comes up at most twice a day, and only while it lasts.

PC Care only looks. You can also just ask: "is my PC safe?", "is my antivirus on?", "check my PC's health".

## Drive mode on your phone
Tap **Drive** at the top of the phone app, or say "drive mode". Izuki becomes a hands-free co-pilot:
- **Your speed, the time and your battery** in huge type.
- **"Take me to…"** starts Google Maps' turn-by-turn. There are no maps of our own to go out of date.
- **"Find gas near me", "play Drake", "text that I'm on my way"** are done at once, with no AI to wait for.
- Big buttons: Navigate, Gas, Food, Music, On my way, Fun mode.
- **It speaks up by itself** after 2 hours at the wheel, when your battery runs low, and above a speed you choose (optional, in Settings).
- 🎉 **Fun mode:** a cheeky road-trip buddy with jokes, roasts, trivia and games.

There's no typing while driving, and the screen stays on. Your speed comes from your phone's location, only while Drive mode is on, and is never saved or sent.

## Calling Izuki on school or work Wi-Fi
- The PC's call line now connects over TCP. School and work networks often block the UDP it used before, so the line never came up.
- On the phone, a request for your PC gives up after 9 seconds instead of hanging. When the network blocks the PC, Izuki says so plainly: "try mobile data for PC tasks". Everything else, including the call itself, keeps working on the phone's own AI. Reminders are set on the phone instead of failing.

## Reviewed
CodeRabbit reviewed it: 3 findings fixed. 1 declined: it wanted PC Care alerts off by default, but they only read Windows' own status and you asked for them on.
