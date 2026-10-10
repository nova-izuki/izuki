# Izuki 1.0.69: camera in the Island, chores on its own, live waveform

## Show Izuki with your camera
The Island has a real camera view now. Tap **Show Izuki with your camera** to see a live preview, then **Ask Izuki about this** to send that one still to Chat ("what am I holding?", "how does this look?"). The camera turns off as soon as you close it. Nothing is recorded or sent until you tap Ask. If Windows has the camera switched off for apps, Izuki tells you where to turn it on.

## On its own (Settings)
Two small chores Izuki can do in the browser in front of you, both **off until you turn them on**:
- **Skip YouTube ads**: presses "Skip" when it shows up.
- **Say no to cookie banners**: presses "Reject all" or "Only necessary" when a site asks.

It only presses buttons with exactly those names. It never types, buys, signs in or closes anything. It waits while Izuki is busy with something you asked for, and does nothing on the lock screen.

## The Island moves with your music
While something plays, the Island shows a live waveform that follows the PC's sound level. It only measures loudness, nothing is recorded, and it stops when the music stops.

## Calls pick up where you left off
Reopening the call page on your phone shows the conversation so far (words only; pictures stay on the PC), so "continue" carries on the same thread.

## Fixes
- Version numbers are consistent again across the app, the Rust core and Android.
- CodeRabbit config added (`.coderabbit.yaml`). Reviews start once the CodeRabbit GitHub App is installed on the repo.
