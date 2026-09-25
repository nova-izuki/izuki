//! Follow mode's heartbeat.
//!
//! One persistent thread, started once at boot, doing as little as possible
//! when follow mode is off: it just rechecks the setting and goes back to
//! sleep. When it's on, it polls the real cursor at a smooth-but-cheap
//! cadence and tells the overlay where to put the hand — the same pattern
//! the watcher pool uses, so there is nothing extra to start or stop by hand
//! when the setting flips.

use std::sync::Arc;
use std::time::Duration;

use tauri::{AppHandle, Emitter, Manager};

use crate::capture;
use crate::events;
use crate::model::CursorPosition;
use crate::overlay::OVERLAY_LABEL;
use crate::store::Store;

/// ~80 Hz — smooth to the eye, negligible on a modern CPU, and far below
/// what would make the OS's own cursor tracking look choppy by comparison.
const POLL: Duration = Duration::from_millis(12);
const IDLE_POLL: Duration = Duration::from_millis(250);
/// Re-read settings every ~250ms rather than cloning them 80 times a second.
const SETTINGS_EVERY: u32 = 20;
/// Re-assert the overlay's topmost slot every ~2s while it's up.
const TOPMOST_EVERY: u32 = 160;

pub fn spawn(app: AppHandle, store: Arc<Store>) {
    std::thread::Builder::new()
        .name("izuki-follow".into())
        .spawn(move || {
            let mut last: Option<(i32, i32)> = None;
            let mut follow = store.settings().follow_mode_enabled;
            let mut tick: u32 = 0;
            loop {
                tick = tick.wrapping_add(1);
                if tick % SETTINGS_EVERY == 0 {
                    follow = store.settings().follow_mode_enabled;
                }
                let shown = crate::overlay::overlay_shown();

                // Follow mode needs it to move the hand; any other time the
                // overlay is up, it's what lets the overlay's floating
                // widgets be clicked through an otherwise click-through window.
                if follow || shown {
                    let (x, y) = capture::cursor_pos();
                    if last != Some((x, y)) {
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
                    std::thread::sleep(POLL);
                } else {
                    last = None;
                    std::thread::sleep(IDLE_POLL);
                    // Idle ticks are already slow — just check every time.
                    follow = store.settings().follow_mode_enabled;
                }
            }
        })
        .ok();
}
