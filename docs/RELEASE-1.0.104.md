# Izuki 1.0.104: call Izuki with your hand 🤙

Like the hand gesture that calls the assistant on Meta's headsets: with Air control on, make the **"call me" hand** and hold it for half a second. That's thumb and little finger out, the other three fingers folded. Izuki starts listening straight away, so just say what you want. No "Hey Nova" needed.

- **A hint first:** "🤙 Keep holding to talk…" shows by the ring while you hold it.
- **Once per gesture:** it calls once each time you make it. Lower your hand, or change the gesture, to call again.
- **Never by accident:** an open hand, a fist, a peace sign and the pinches never trigger it.
- **Your own gestures come first:** if you've taught Izuki its own 🤙, that one wins.
- **Never stops you mid-sentence:** if Izuki is already listening, nothing changes.

Meta's own gesture needs the headset's cameras to tell which way your palm faces. A normal webcam can't do that reliably, so Izuki uses a hand shape it can always recognise.

## Tested
A fake camera showed an open hand for 3 seconds, then the 🤙 hand for 5 seconds, on a loop. Izuki started listening exactly once each time the 🤙 appeared and never during the open hand. Tracking ran at 15 looks a second, 38 ms each, on your laptop's graphics chip.

CodeRabbit reviewed it: 2 findings fixed.
