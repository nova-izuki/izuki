//! The mouse wheel scrolls Izuki's own floating widgets — the answer bubble
//! and the open Island.
//!
//! The overlay is click-through and, by design, never takes keyboard focus
//! (hovering it must not pull the keyboard from whatever you're typing in).
//! But Windows sends the wheel to the *focused* window, so when you hovered
//! the answer bubble and scrolled, the window behind scrolled instead —
//! clicking and dragging the bubble worked, scrolling never did. ("Scroll
//! inactive windows" only helps when that setting is on and the message is
//! actually routed to the overlay, which it often isn't.)
//!
//! So: a low-level mouse hook catches the wheel while the pointer is over one
//! of Izuki's widgets (the window is "clickable" then), swallows it so the
//! app behind doesn't also scroll, and hands the delta to the overlay, which
//! scrolls whatever scrollable thing is under the pointer itself. Nothing
//! takes focus, and nothing is swallowed anywhere else.

#[cfg(windows)]
use std::sync::OnceLock;
#[cfg(windows)]
use tauri::{AppHandle, Emitter};

#[cfg(windows)]
static TX: OnceLock<std::sync::mpsc::Sender<Wheel>> = OnceLock::new();
/// The hook thread, so the overlay can have the hook put in and taken out.
#[cfg(windows)]
static HOOK_THREAD: OnceLock<u32> = OnceLock::new();
/// Whether the hook should be in right now. Kept separately from the message
/// so a decision made before the thread finished starting isn't lost.
#[cfg(windows)]
static WANTED: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

#[cfg(windows)]
#[derive(Clone, serde::Serialize)]
struct Wheel {
    /// Physical screen pixels (converted to overlay client pixels in JS, the
    /// same way the cursor stream is).
    x: i32,
    y: i32,
    /// WM_MOUSEWHEEL delta: +120 per notch forward (scroll up).
    delta: i32,
}

/// Give this thread a message queue and return its id, so other threads can
/// post to it.
///
/// It must not block: waiting for a message here instead meant the id was
/// never published, `watching()` could never reach this thread, the hook was
/// never installed, and the whole wheel feature was dead code that every
/// test still passed. `PeekMessageW` creates the queue and returns at once.
#[cfg(windows)]
fn open_queue() -> u32 {
    use windows::Win32::System::Threading::GetCurrentThreadId;
    use windows::Win32::UI::WindowsAndMessaging::{PeekMessageW, MSG, PM_NOREMOVE, WM_APP};
    unsafe {
        let mut msg = MSG::default();
        let _ = PeekMessageW(&mut msg, None, WM_APP, WM_APP, PM_NOREMOVE);
        GetCurrentThreadId()
    }
}

/// Ask the hook thread to put the hook in (`on`) or take it out.
#[cfg(windows)]
pub fn watching(on: bool) {
    use windows::Win32::UI::WindowsAndMessaging::{PostThreadMessageW, WM_APP};
    WANTED.store(on, std::sync::atomic::Ordering::Relaxed);
    // Still starting up: it reads WANTED itself once its queue exists.
    if let Some(thread) = HOOK_THREAD.get() {
        unsafe {
            let _ = PostThreadMessageW(*thread, WM_APP, windows::Win32::Foundation::WPARAM(0), windows::Win32::Foundation::LPARAM(0));
        }
    }
}

#[cfg(not(windows))]
pub fn watching(_on: bool) {}

#[cfg(windows)]
pub fn install(app: &AppHandle) {
    use windows::Win32::System::Threading::{GetCurrentThread, SetThreadPriority, THREAD_PRIORITY_TIME_CRITICAL};
    use windows::Win32::UI::WindowsAndMessaging::{
        GetMessageW, SetTimer, SetWindowsHookExW, UnhookWindowsHookEx, HHOOK, MSG, WH_MOUSE_LL, WM_APP, WM_TIMER,
    };
    let (tx, rx) = std::sync::mpsc::channel::<Wheel>();
    if TX.set(tx).is_err() {
        return;
    }
    // The emit is kept off the hook's own thread: a low-level hook must
    // return within a few milliseconds or Windows quietly drops it.
    let app2 = app.clone();
    std::thread::Builder::new()
        .name("izuki-wheel-emit".into())
        .spawn(move || {
            while let Ok(w) = rx.recv() {
                let _ = app2.emit_to(crate::overlay::OVERLAY_LABEL, "izuki://wheel", w);
            }
        })
        .ok();
    std::thread::Builder::new()
        .name("izuki-wheel".into())
        .spawn(|| unsafe {
            let _ = SetThreadPriority(GetCurrentThread(), THREAD_PRIORITY_TIME_CRITICAL);
            // A thread message queue has to exist before anything can post to
            // it, and PeekMessageW makes one without blocking. Waiting on
            // GetMessageW here instead meant the id below was never published,
            // so the hook was never put in and the wheel did nothing at all.
            let _ = HOOK_THREAD.set(open_queue());
            let mut msg = MSG::default();
            let mut hook: Option<HHOOK> = None;
            let want = || WANTED.load(std::sync::atomic::Ordering::Relaxed);
            let put_in = |hook: &mut Option<HHOOK>| {
                if hook.is_none() {
                    match SetWindowsHookExW(WH_MOUSE_LL, Some(wheel_hook), None, 0) {
                        Ok(h) => *hook = Some(h),
                        Err(_) => eprintln!("[bug] couldn't watch the mouse wheel"),
                    }
                }
            };
            let take_out = |hook: &mut Option<HHOOK>| {
                if let Some(h) = hook.take() {
                    let _ = UnhookWindowsHookEx(h);
                }
            };
            // Whatever was decided while this thread was still starting.
            if want() {
                put_in(&mut hook);
            }
            // While the hook is in, put it back every 30 s in case Windows
            // dropped it (the Esc hook had exactly this happen on a slow laptop).
            SetTimer(None, 0, 30_000, None);
            while GetMessageW(&mut msg, None, 0, 0).as_bool() {
                match msg.message {
                    WM_APP if want() => put_in(&mut hook),
                    WM_APP => take_out(&mut hook),
                    WM_TIMER if hook.is_some() => {
                        if let Ok(fresh) = SetWindowsHookExW(WH_MOUSE_LL, Some(wheel_hook), None, 0) {
                            take_out(&mut hook);
                            hook = Some(fresh);
                        }
                    }
                    _ => {}
                }
            }
            take_out(&mut hook);
        })
        .ok();
}

#[cfg(windows)]
unsafe extern "system" fn wheel_hook(
    code: i32,
    wparam: windows::Win32::Foundation::WPARAM,
    lparam: windows::Win32::Foundation::LPARAM,
) -> windows::Win32::Foundation::LRESULT {
    use windows::Win32::Foundation::LRESULT;
    use windows::Win32::UI::WindowsAndMessaging::{CallNextHookEx, MSLLHOOKSTRUCT, WM_MOUSEWHEEL};
    // Only when the pointer is actually over one of Izuki's own widgets (the
    // overlay is clickable then) — never anywhere else.
    if code >= 0 && wparam.0 as u32 == WM_MOUSEWHEEL && crate::overlay::wheel_wanted() {
        let ms = &*(lparam.0 as *const MSLLHOOKSTRUCT);
        let delta = ((ms.mouseData >> 16) as i16) as i32;
        if delta != 0 {
            if let Some(tx) = TX.get() {
                let _ = tx.send(Wheel { x: ms.pt.x, y: ms.pt.y, delta });
            }
            // Swallow it: the app behind must not scroll at the same time.
            return LRESULT(1);
        }
    }
    CallNextHookEx(None, code, wparam, lparam)
}

#[cfg(not(windows))]
pub fn install(_app: &tauri::AppHandle) {}

#[cfg(all(test, windows))]
mod tests {
    use super::*;

    /// The wheel feature once shipped doing nothing because the hook thread
    /// waited for a message before saying which thread to send messages to.
    /// Nothing could catch it: a mouse hook can't be driven from a test, and
    /// every other test passed. So this covers the one step that was wrong —
    /// opening the queue must hand back an id straight away, with nobody
    /// posting anything.
    #[test]
    fn opening_the_queue_never_waits_for_a_message() {
        let (tx, rx) = std::sync::mpsc::channel();
        std::thread::spawn(move || {
            let _ = tx.send(open_queue());
        });
        let id = rx
            .recv_timeout(std::time::Duration::from_secs(5))
            .expect("open_queue blocked: the hook thread would never be reachable and the wheel would do nothing");
        assert_ne!(id, 0, "no thread id, so watching() could never reach the hook thread");
    }
}
