# Izuki 1.0.141: fewer "the free AI's busy" waits, and iPhone and Android each get their own design

## ⚡ Izuki respects each AI's per-minute allowance
Free AIs cap how much they'll take per minute. Groq's free screen model allows 7,000 tokens a minute, and one look at your screen was 5,000–6,300 of them. So Izuki could ask it about once a minute, then sat through "too many requests" refusals, and tasks stalled with "The free AI's busy".

Now Izuki:
- **learns each AI's allowance** from its own refusal message;
- **counts** what it has sent in the last minute;
- **sends a leaner request** to an AI with a tight allowance. Everything on screen stays; only buttons scrolled out of view, extra page text and extra notes are trimmed;
- **moves straight on** to another AI when one has no room left, instead of waiting for a refusal. It comes back when the allowance frees up.

The result: more of your requests go to the fast AI, with fewer stalls.

## 📱 The phone app looks like it belongs on your phone
- **On an iPhone:**
  - a frosted top bar with tinted icons, like iOS apps;
  - iMessage-style bubbles and typing bar;
  - settings sheets with a grab handle and grouped rows, like iPhone Settings;
  - iOS's own slide-up motion.
- **On Android:**
  - Material 3: a solid top bar and Material's colour tones;
  - Material-style chips and press feedback;
  - talk and send buttons in Material's rounded-square shape;
  - bottom sheets with a drag handle and Material's motion.
  - The status bar matches the top bar.
- Izuki's own look stays: the night colours, violet and teal, and the orb.
- **On every phone, the top buttons fit now.** Call used to be cut off at the edge. The shortcuts scroll sideways, and Call and Settings stay pinned on the right.
- The TV keeps its own big-screen design.
