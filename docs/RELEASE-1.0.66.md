# Izuki 1.0.66

This hotfix corrects issues found while validating v1.0.65 and adds the requested movable Island.

## Fixed

- MIDI validation now compares the actual note pitch when spacing repeated hits. The full genre/key regression catches overlapping or stuck notes before a draft can report success.
- A screen brain's requested wait is honored before Izuki captures the verification frame. The wait remains bounded and cancellation stays responsive.
- Update activity stays on the Island while a release is available or downloaded. Its text and button change from **Download & install** to **Install now** only after signed bytes are ready.

## Island

Open the Island, then drag the new grip. It moves along a constrained top rail, remains on screen, and remembers where you leave it. This lets you place it away from browser tabs or the address bar. Quick actions use an aligned 4 × 2 grid and add Screenshot and PC Boost.

## Scope

This release strengthens the existing plan-act-observe loop; it does not claim flawless autonomy. Verified recipe replay, broader app compilers, live DAW audio analysis, character redesign, body collision/IK and static-face auto-rigging remain future work.
