# Izuki 1.0.111: "Nova, dance!"

Ask your character to move, by voice or typing:
- **Wave** (or "say hi", "say bye")
- **Cheer** or "celebrate"
- **Clap**
- **Dance:** a little routine of cheers, claps and a ta-da
- **Nod**, **shrug**, **laugh**, **facepalm**
- **Give me a thumbs up**

Your character does it, with a short line to match ("Hey! 👋", "Let's go! 💃"). Starting a new move cancels the rest of a dance still going.

## Reviewed
- **Checks:** the build, and the Air and conversation tests, pass.
- **CodeRabbit:** 2 findings fixed (a dance can't overwrite a newer move, and every reply can be spoken out loud).
