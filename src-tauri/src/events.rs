//! Event names shared with the frontend. Mirrors the EV map in src/lib/ipc.ts.

pub const OVERLAY_OPEN: &str = "izuki://overlay-open";
pub const OVERLAY_CLOSE: &str = "izuki://overlay-close";
pub const FROZEN_FRAME: &str = "izuki://frozen-frame";
pub const HAND: &str = "izuki://hand";
pub const STATUS: &str = "izuki://status";
pub const FLOWS_CHANGED: &str = "izuki://flows-changed";
pub const WATCHERS_CHANGED: &str = "izuki://watchers-changed";
pub const NAVIGATE: &str = "izuki://navigate";
pub const CURSOR: &str = "izuki://cursor";
pub const PUSH_TO_TALK: &str = "izuki://push-to-talk";
/// The push-to-talk key came back up — ends a held-down recording.
pub const PUSH_TO_TALK_RELEASE: &str = "izuki://push-to-talk-release";
/// Fired when the quickdraw hotkey is released — tells the overlay to
/// submit whatever's been sketched (or just quietly close if nothing was).
pub const QUICKDRAW_COMMIT: &str = "izuki://quickdraw-commit";
/// Cut Izuki's voice off mid-sentence (the frontend owns the voice).
pub const STOP_SPEAKING: &str = "izuki://stop-speaking";
/// Izuki is stuck and asks the user to show it (payload: the question).
pub const HELP_ASK: &str = "izuki://help-ask";
/// The question was answered, skipped or timed out.
pub const HELP_DONE: &str = "izuki://help-done";
