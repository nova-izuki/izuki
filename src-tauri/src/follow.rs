//! Cursor hit-testing for visible overlay widgets, not an idle hand follower.

use std::time::Duration;

use tauri::{AppHandle, Emitter, Manager};

use crate::capture;
use crate::events;
use crate::model::CursorPosition;
use crate::overlay::OVERLAY_LABEL;

/// ~80 Hz — smooth to the eye, negligible on a modern CPU, and far below
/// what would make the OS's own cursor tracking look choppy by comparison.
const POLL: Duration = Duration::from_millis(12);
const IDLE_POLL: Duration = Duration::from_millis(250);
/// Re-assert the overlay's topmost slot every ~2s while it's up.
const TOPMOST_EVERY: u32 = 160;

pub fn spawn(app: AppHandle) {
    std::thread::Builder::new()
        .name("izuki-follow".into())
        .spawn(move || {
            let mut last: Option<(i32, i32)> = None;
            let mut foreground = None;
            let mut tick: u32 = 0;
            let mut moved_at = std::time::Instant::now();
            loop {
                tick = tick.wrapping_add(1);
                let shown = crate::overlay::overlay_shown();

                // Visible floating widgets still need cursor hit-testing.
                // A saved chat preference alone must never wake fast polling.
                if shown {
                    let current = crate::uia::foreground_hwnd();
                    if foreground.is_some_and(|previous| previous != current) {
                        // No window title, handle or other private data crosses
                        // the bus. A pointer for the previous window is stale.
                        let _ = app.emit_to(OVERLAY_LABEL, "izuki://foreground-changed", ());
                    }
                    foreground = Some(current);
                    let (x, y) = capture::cursor_pos();
                    if last != Some((x, y)) {
                        moved_at = std::time::Instant::now();
                        last = Some((x, y));
                        // Scoped to the overlay — the config window has no
                        // use for 80Hz cursor updates and shouldn't pay to
                        // deserialize them just for being open in the background.
                        let _ = app.emit_to(OVERLAY_LABEL, events::CURSOR, CursorPosition { x, y });
                    }
                    // Other "always on top" windows (and some apps as they
                    // open or go full-screen) can land above the overlay,
                    // taking the hand and chat bubble with it. Reclaim the
                    // top of the stack now and then — it never takes focus.
                    if shown && tick % TOPMOST_EVERY == 0 {
                        if let Some(w) = app.get_webview_window(OVERLAY_LABEL) {
                            let _ = w.set_always_on_top(true);
                        }
                    }
                    // A parked cursor needs no 80 Hz polling. Resume full
                    // cadence on movement, with at most 80 ms wake latency.
                    std::thread::sleep(if moved_at.elapsed() > Duration::from_secs(2) {
                        Duration::from_millis(80)
                    } else { POLL });
                } else {
                    last = None;
                    foreground = None;
                    std::thread::sleep(IDLE_POLL);
                }
            }
        })
        .ok();
}
