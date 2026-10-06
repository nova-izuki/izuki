# voice-turns

Two small pieces every voice assistant needs, from [Izuki](https://nova-izuki.github.io/izuki/). TypeScript, zero dependencies, MIT.

## EchoGate: did the user talk over the assistant?

With a fixed threshold, laptop speakers either drown the user out, or the assistant's own voice cuts itself off. EchoGate fixes that by learning how much of the assistant's voice comes back into the mic, then counting only sound that is clearly louder than that echo.

```ts
import { EchoGate, rms } from "./src/index.ts";

const echo = new EchoGate();
// For every mic chunk while the assistant is speaking:
const bar = echo.threshold(rms(micChunk), rms(outputChunk), chunkMs, roomLevel);
if (bar !== null && rms(micChunk) > bar) stopTalkingAndListen();
// When the assistant stops talking:
echo.reset();
```

- **`bar === null`:** EchoGate spends the first half second of each reply only learning the echo.
- **After that:** it keeps learning, but only from chunks that aren't the user.

## QuietGate: a wake-word detector that rests in silence

Always-on detectors burn battery all day in a silent room. Push every audio chunk through QuietGate:

- **While it's quiet:** it returns `null`, so the detector can skip that chunk.
- **When sound starts:** it returns the last 1.6 s it held back first, so a softly spoken wake word is still heard from its first syllable.

```ts
const gate = new QuietGate({ sampleRate: 16000 });
const run = gate.push(chunk);
if (run) for (const audio of run) await detector.feed(audio);
```

The room's own level is learned, so a fan or hum doesn't keep it awake.

## Test

```
node --experimental-strip-types --test src/index.test.ts
```
