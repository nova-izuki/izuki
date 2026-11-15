# Izuki 1.0.214: the Task Stage finishes the job

## 🪟 A real finish state

- When a multi-step task finishes, the glass Task Stage no longer vanishes. It changes to **Complete**, keeps every finished step with its real result and time, and shows `4/4` at 100%.
- **Run it again** replays the last real multi-step plan. It is a replay, not a fake sandbox: if the screen has moved on, it stops rather than clicking where something used to be. **Done** closes the stage, and it also closes itself after 30 seconds so it never becomes furniture.
- A task that ends early changes to **Ended** instead of claiming success. Its finished steps stay visible, with Done as the way out.
- Collapsing the stage while it is finished leaves a small **Task Stage · complete** pill, so you can bring the room back until it times out.

## ✅ Tested without touching your desktop

- The real `TaskStage` component now has a headless-browser regression that walks through its whole life: start before the first click, step, pause, resume, complete, Run it again / Done, and dismissal.
- This is the same fixture used by the hand-overlay check, so the finish card is exercised with the real styles and pointer-hole behavior. It is not a mock drawing of the card.

## 🧵 The queue already exists

- **Missions (Rest mode)** is the task queue: add jobs, start them once, and Izuki does them one after another with a real result for each. I did not add a second queue beside it; the Task Stage is the view of the job currently running.

## Under the hood

- The last completed multi-step plan is kept in memory for the finish card's replay. Single clicks are never cached as a task.
- New native command: `rerun_task`. The overlay bridge falls back safely in a plain browser.
- Android `versionCode` is 214, so this installs over 1.0.213 without uninstalling.

## Checked before release

- `npm run build` (TypeScript and the desktop bundle).
- `node tools/hand-overlay-check.cjs` with the new finish-state assertions.
- `npm run test:phone`.
- `cargo check --manifest-path src-tauri/Cargo.toml`.
- The 390px Android and iPhone phone previews were inspected for the six matching glass circles and the blue-tinted Call control.

No physical Android phone was attached here. The permission screens, floating orb, live-call glass and APK install still need a device pass.
