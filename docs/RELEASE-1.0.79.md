# Izuki 1.0.79: faster, and no more clicking on covered things

Fixes found in Izuki's own log on a real PC, reviewed with CodeRabbit.

## Much less waiting on "Thinking…"
- **AIs are raced, not queued.** When the first AI says "no" fast (rate-limited, out of quota), the next **two** are asked at once, instead of one at a time. One that hangs (Gemini can take 14 s on a busy day) is no longer the whole wait.
- **A backup after 4 seconds.** Whatever is running, if nothing has answered after 4 s, one backup is asked too, even with "Save AI credits" on. Never more than two at a time.
- In the log this was one round costing ~38 s (Groq → Gemini 14 s → a local AI that wasn't running → NVIDIA 14 s → Gemini Lite).

## "Keep my PC fast" was slowing busy programs. Fixed.
When the processor was busy, Izuki squeezed the memory of every background program, about 1 GB at a time, even with memory only 40% full. Squeezing a busy program (a game, a render, a compiler) makes it reload everything, so it runs slower.
- Memory is now only trimmed when it's actually short (75% or more in use).
- Programs that are working right now are always left alone. Only idle ones are trimmed.

## No clicking on covered things
When another app (your editor, say) covered the button Izuki meant to press, the mouse still went there. Now Izuki brings the window it's working in back to the front, checks everything again (still there, still enabled, PC not locked), and only then clicks. If it's still covered, it stops.

## Sharp eye: no waiting on UI-TARS without credit
If UI-TARS says "payment required" (no OpenRouter credit), Izuki stops asking it, uses Gemini for the sharp-eye looks, and tells you once. A rejected key gets its own message. Changing your OpenRouter key lets it try again.

## "Check status" opens the status screen
"Check status", "status check", "check my PC", "show me the dashboard" and "Jarvis mode" now open the Jarvis status screen straight away. Before, they went to the screen AI, which just said Izuki was running. "Check status of my order" still means your order.
