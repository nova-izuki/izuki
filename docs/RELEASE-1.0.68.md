# Izuki 1.0.68 — phone routing, voice fixes, orb smoothing, chat history, web redesign

## Phone vs PC routing fix
Phone no longer auto-controls the PC without an explicit device mention. "Play music" from the Call page now falls through to chat instead of silently controlling the PC. Use "on my PC" or "the PC" to target the computer.

## Voice/Siri playback fixes
- Mute notice now styled (red, bold) instead of relying on `hidden`
- Audio recovery button offered when iPhone silent-switch blocks autoplay
- `offerAudio` button text explains "PC audio still blocked"
- iPhone silent-switch notice text updated

## Orb motion smoothing
Replaced asymmetric easing with symmetric easing (0.15/0.05), removing the snap-back when exiting the thinking state.

## Chat continuity on orb side
Added `GET /history` endpoint returning conversation history as JSON. Call page fetches `/history` on load and repopulates the log so continuing the call keeps the same thread.

## PC Boost High Performance power plan
Settings → PC Boost includes High Performance mode toggle. Reads actual Windows plan on open/focus, confirms changes, reports failures on unsupported devices.

## Website redesign
- Search menu in Try It chat
- Clearer chat cards with better typography
- Draft saving (auto-saves when you pause typing)
- Chat export (download .txt or copy to clipboard)

## Validation
Frontend build passes. Regression tests pass for phone routing, voice recovery, orb easing, history endpoint, power plan detection.