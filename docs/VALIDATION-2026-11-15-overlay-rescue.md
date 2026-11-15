# Native overlay rescue — 2026-11-15

The owner resumed Codex to continue Claude's interrupted `claude/overlay-escape` work. This work is isolated on `codex/overlay-rescue` from main `167ac2d`. Claude's original worktree and Freebuff's worktrees remain intact.

## Actual change

- A short, explicit request such as “remove the black screen” or “close Izuki overlay” goes to native recovery before a provider call. Streaming chat, non-streaming chat, screen tasks and instant commands share it. Explanations, negations, references to other apps and pasted transcripts do not trigger recovery.
- Esc pressed three times within 1.5 seconds, Ctrl+Shift+Q and Stop everything latch out late overlay-show requests, invalidate the current task and stop Air/Eye input. Native hiding and cleanup run independently of AI/provider work. Held Esc and Izuki's own injected Esc do not count as new physical presses. The polling backup also recognizes three Esc presses when the hook is unavailable.
- Only windows registered by Izuki at creation, with its current process ID and expected native class, can be hidden. The registration property disappears with a destroyed window. No process is killed; Explorer and other applications are untouched.
- Native inspection does not use `GetWindowText` or send a synchronous message to the window thread. `ShowWindowAsync` is followed by bounded visibility checks. A frozen UI can prevent Windows from handling a hide request; this is reported rather than called successful.
- A rescued overlay stays hidden. Restore overlay in the tray, or “restore Izuki overlay,” rebuilds it explicitly. A newer Stop invalidates an in-flight restore. Restoration has a five-second response limit; screen appearance checks have a 500 ms limit, with at most one outstanding worker of each kind.
- Mostly-black captured pixels are a symptom, never proof of cause. The result distinguishes a hidden window, a still-visible window, missing native evidence and unavailable capture. A missing desktop shell window is reported without restarting Explorer.

## Verification

- `npm run test:rescue`: five pure Rust tests passed. The real Windows probe passed five scenarios: fullscreen-sized registered overlay and veil hidden; main and foreign same-title windows retained; repeated hiding; frozen UI returns within its deadline and later processes the queued hide; destroyed handles ignored. All test windows were disposable and off-screen. The installed app and owner data were not accessed.
- `npm run build` (includes TypeScript checking): passed.
- Conversation, Air, hotkeys, voice, companion, panel and workspace checks: passed.
- Rust source parsing: passed. Full Tauri library/default and devvision suites are delegated to Windows CI: this PC has approximately 3 GB free and no reusable target cache, so a new full Rust build would exhaust its disk. Their result remains pending until CI completes.
- CodeRabbit CLI review: in progress; findings and final CI evidence will be added before merge.

## Practical limits

The probe verifies actual Windows window operations, including a deliberately unresponsive window. It does not reproduce a graphics-driver transparency fault inside the installed WebView2 app, prove the current cause of the owner's black screen, or verify the new keys in the packaged app. The existing physical-PC checklist remains necessary for that final check. A frozen Windows window thread may not process an asynchronous hide until it recovers; no unrelated application is terminated to work around that.

Separate integration: PR #110 handles Android/wake/relay review fixes. Freebuff PR #103 remains separate pending its own review follow-up. No version bump is included here.
