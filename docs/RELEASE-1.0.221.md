# Izuki 1.0.221: one IZUKI NOVA icon, and Drive mode that rides along

## 🔮 One icon everywhere

- The glass orb from IZUKI NOVA's profile picture is now the icon of the Windows app, the taskbar and the installer, the Android and iPhone apps and izukinova.ai. It replaces the old hand, and it's redrawn so it stays sharp from a 16-pixel browser tab to the app icon.
- The website and its picture gallery are named IZUKI NOVA throughout, so searches for "Izuki Nova", "Nova Izuki" and the official pictures lead to one recognisable name and icon.

## 🚗 Drive mode rides along

- Once you name a destination, Drive mode measures the trip itself from your location and shows a trip line: where to, how far you've gone, how many minutes.
- The place is looked up on OpenStreetMap and routed from where you are, so "how long is left" answers with the real distance and the road's usual drive time (not live traffic, and it says so).
- It speaks at real moments: a check-in on a long leg, a word when you're crawling, a nearly-there line, and a nudge when a long stop looks like arrival. A switch in Settings → Drive mode turns the talking off.
- When a place can't be found, there's no signal, or "home" has no saved address, it says exactly that instead of guessing. Google Maps still owns the turn-by-turn.

## 📱 On the phone

- The phone agent can drag a control onto another (reorder, sliders, maps) and scroll until a named control is on screen; both refuse risky targets.
- iPhone: its own "On your phone" list and the best installed speaking voice.
- The orb no longer cuts listening off, the natural voice is kept whenever it can be, and questions about today's news or events really search the web (and say so when they can't). A thinking indicator shows a reply is on its way.
- Settings → Your orb has one **Orb colour**, and every orb takes it: on your screen, floating over other apps, and the preview, in every state.
- A PC screen answer says "PC screen captured" only when the PC really took a fresh look while it answered, and "PC screen not verified" when it can't tell.

## Checked before release

- `npm run test:phone` (every suite) and `npm run test:site` (every page indexable with its canonical address and icons, every sitemap page and image present, no broken links; all 9 pages and 28 sitemap images answered live).
- The icons at 16, 32 and 48 pixels and as Windows, Android (adaptive and round), iPhone and the web app show them; the website at phone and desktop width.
- CI: the Android APK build with its tests, the Windows build, web and the iPhone project. CodeRabbit on every change.

## Not verified yet

- The new icon in the Windows taskbar and Start menu after updating, and on the Android and iPhone home screens.
- Drive mode's trip line and timing on a real drive.
