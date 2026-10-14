# Izuki 1.0.117: sideways scrolling, tested

**Peace sign ✌️, then move your hand left or right** to scroll sideways. It works on wide pages, carousels, timelines and spreadsheets. Up and down still scrolls up and down.

- **One direction per scroll.** Izuki goes whichever way your hand clearly moves first, and sticks to it until you drop the peace sign. A wobble never scrolls diagonally, and a hand that's only shaking a little doesn't scroll at all.
- **The scroll logic is its own piece** (`src/lib/airScroll.ts`) with its own test (`npm run test:air`). The test runs 10 hand paths: straight, wobbly, mostly-diagonal, changing direction, and still with jitter.
- **The guided Air test and the gesture list** now mention sideways scrolling.
