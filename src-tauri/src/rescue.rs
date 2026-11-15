//! A native escape for Izuki's own overlays. No AI, scripted clicks, focus
//! assumptions, process killing or automatic Explorer restart.
pub use crate::rescue_core::{request, EscapeSequence, Request};
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{AppHandle, Emitter, Manager};
static CLEANING: AtomicBool = AtomicBool::new(false);
static HIDING: AtomicBool = AtomicBool::new(false);
static NOTIFYING: AtomicBool = AtomicBool::new(false);
static CAPTURING: AtomicBool = AtomicBool::new(false);
static RESTORING: AtomicBool = AtomicBool::new(false);

/// The hook only flips lock-free flags and queues a bounded native worker;
/// Windows must never remove the hook because an event handler took too long.
pub fn dispatch(app: &AppHandle) {
    crate::overlay::suppress_for_rescue();
    crate::automation::emergency_abort();
    crate::brain::emergency_cancel();
    crate::haze::emergency_stop();
    crate::airsafe::stop("overlay emergency escape");
    if HIDING
        .compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst)
        .is_err()
    {
        return;
    }
    let app = app.clone();
    if std::thread::Builder::new()
        .name("izuki-native-escape".into())
        .spawn(move || {
            struct Done;
            impl Drop for Done {
                fn drop(&mut self) {
                    HIDING.store(false, Ordering::SeqCst);
                }
            }
            let _done = Done;
            emergency(&app);
        })
        .is_err()
    {
        HIDING.store(false, Ordering::SeqCst);
    }
}

fn appearance() -> Option<bool> {
    if CAPTURING
        .compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst)
        .is_err()
    {
        return None;
    }
    let (send, receive) = std::sync::mpsc::channel();
    if std::thread::Builder::new()
        .name("izuki-rescue-capture".into())
        .spawn(move || {
            struct Done;
            impl Drop for Done {
                fn drop(&mut self) {
                    CAPTURING.store(false, Ordering::SeqCst);
                }
            }
            let _done = Done;
            let _ = send.send(capture_appearance());
        })
        .is_err()
    {
        CAPTURING.store(false, Ordering::SeqCst);
        return None;
    }
    receive
        .recv_timeout(std::time::Duration::from_millis(500))
        .ok()
        .flatten()
}
fn capture_appearance() -> Option<bool> {
    if crate::uia::screen_locked() {
        return None;
    }
    let frame = crate::capture::capture_all().ok()?;
    crate::rescue_core::black_share(&frame.bgra, frame.width, frame.height)
        .map(|share| share > 0.92)
}

/// Fast first half, callable from the independent keyboard watcher. Latch
/// out late show requests before native hiding. No task/state/storage locks.
pub fn hide_now() -> crate::rescue_core::Visibility {
    crate::overlay::suppress_for_rescue();
    crate::automation::emergency_abort();
    crate::brain::emergency_cancel();
    crate::airsafe::stop("overlay emergency escape");
    crate::haze::emergency_stop();
    crate::rescue_native::hide()
}

pub fn reset(app: &AppHandle) -> String {
    let result = hide_now();
    // Cleanup is independent of the emergency key watcher. A frozen engine
    // cannot hold up hiding or a second emergency key press.
    cleanup(app);
    crate::rescue_core::report(&result, appearance(), crate::rescue_native::shell())
}

fn cleanup(app: &AppHandle) {
    if CLEANING
        .compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst)
        .is_err()
    {
        return;
    }
    let app = app.clone();
    if std::thread::Builder::new()
        .name("izuki-rescue-cleanup".into())
        .spawn(move || {
            struct Done;
            impl Drop for Done {
                fn drop(&mut self) {
                    CLEANING.store(false, Ordering::SeqCst);
                }
            }
            let _done = Done;
            crate::brain::cancel_task();
            let _ = app.emit(crate::events::STOP_SPEAKING, ());
            let _ = app.emit(crate::events::OVERLAY_CLOSE, ());
        })
        .is_err()
    {
        CLEANING.store(false, Ordering::SeqCst);
    }
}

pub fn emergency(app: &AppHandle) {
    // Each invocation hides afresh, even if an earlier cleanup is stuck.
    let result = hide_now();
    cleanup(app);
    // Native visibility is already known. Capturing the screen or emitting
    // a UI status is allowed to wait on a separate, bounded number of workers.
    let text = crate::rescue_core::report(&result, None, crate::rescue_native::shell());
    if NOTIFYING
        .compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst)
        .is_err()
    {
        return;
    }
    let app = app.clone();
    if std::thread::Builder::new()
        .name("izuki-rescue-status".into())
        .spawn(move || {
            struct Done;
            impl Drop for Done {
                fn drop(&mut self) {
                    NOTIFYING.store(false, Ordering::SeqCst);
                }
            }
            let _done = Done;
            let _ = app.emit(crate::events::STATUS, crate::model::StatusEvent::info(text));
        })
        .is_err()
    {
        NOTIFYING.store(false, Ordering::SeqCst);
    }
}

/// Explicit restore only. A hide never recreates the window it just removed.
/// Rebuilding discards the broken renderer; the normal settings are retained.
pub fn restore(app: &AppHandle) -> String {
    if RESTORING
        .compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst)
        .is_err()
    {
        return "Windows is still finishing the previous overlay restore. Emergency hiding remains available with Esc three times or Ctrl+Shift+Q.".into();
    }
    let epoch = crate::overlay::rescue_epoch();
    let (send, receive) = std::sync::mpsc::channel();
    let worker_app = app.clone();
    if std::thread::Builder::new()
        .name("izuki-restore-overlay".into())
        .spawn(move || {
            struct Done;
            impl Drop for Done {
                fn drop(&mut self) {
                    RESTORING.store(false, Ordering::SeqCst);
                }
            }
            let _done = Done;
            let _ = send.send(restore_inner(&worker_app, epoch));
        })
        .is_err()
    {
        RESTORING.store(false, Ordering::SeqCst);
        return "Windows could not start overlay restoration. It remains hidden.".into();
    }
    match receive.recv_timeout(std::time::Duration::from_secs(5)) {
        Ok(text) => text,
        Err(_) => {
            hide_now();
            "Izuki's window thread did not finish restoring within five seconds. The overlay stays off; emergency hiding remains available. No other application was closed.".into()
        }
    }
}
fn restore_inner(app: &AppHandle, epoch: usize) -> String {
    if let Some(old) = app.get_webview_window(crate::overlay::OVERLAY_LABEL) {
        if let Err(error) = old.destroy() {
            return format!("The old overlay could not close: {error}. It remains hidden; no other app was closed.");
        }
        let until = std::time::Instant::now() + std::time::Duration::from_secs(2);
        while app
            .get_webview_window(crate::overlay::OVERLAY_LABEL)
            .is_some()
        {
            if std::time::Instant::now() >= until {
                return "The old overlay has not closed yet. It remains hidden; try Restore overlay again after Izuki responds.".into();
            }
            std::thread::sleep(std::time::Duration::from_millis(25));
        }
    }
    if let Err(error) = crate::overlay::resume_after_rescue(epoch) {
        return error.to_string();
    }
    match crate::overlay::show_follow(app){
        Ok(()) if crate::rescue_native::visible().is_some_and(|count|count>0)=>"Restored a fresh Izuki overlay and checked that Windows shows it. If it blocks the screen again, press Esc three times or Ctrl+Shift+Q.".into(),
        Ok(())=>{hide_now();"Windows did not confirm that the fresh overlay appeared. It remains hidden; try Restore overlay again after Izuki responds.".into()},
        Err(error)=>{hide_now();format!("The overlay could not be restored: {error}. It remains hidden.")}
    }
}

/// Shared chat surfaces bypass the provider for an exact current request.
pub fn handle(said: &str) -> Option<String> {
    let request = request(said)?;
    let Some(app) = crate::state::app() else {
        return Some("Izuki's native recovery is still starting. Press Esc three times for emergency hiding.".into());
    };
    Some(match request {
        Request::Hide => reset(app),
        Request::Restore => restore(app),
    })
}
