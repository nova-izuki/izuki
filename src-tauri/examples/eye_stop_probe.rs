//! A real-Windows check of Eye Control's emergency stop (airsafe.rs), with no
//! camera: Izuki's own two key watchers and the real pointer. It moves the
//! pointer and presses Ctrl+Alt+Shift+X, so run it only while nobody is using
//! the PC (anyone touching the mouse or keyboard pauses the eye pointer, which
//! is the point, and fails the run):
//!
//!   IZUKI_TEST_MANIFEST=1 cargo run --example eye_stop_probe
//!
//! (The manifest switch gives it the Common Controls v6 that Izuki itself
//! has; without it Windows refuses to start it: TaskDialogIndirect missing.)
//!
//! It never clicks, never opens a window and never opens Izuki's settings
//! store (so it can't change anyone's settings); the pointer is put back
//! where it was at the end. Prints `EYE STOP PROBE: ... passed` or panics
//! with the check that failed.
#[cfg(windows)]
fn main() {
    use izuki_lib::airsafe;
    use std::time::{Duration, Instant};
    use windows::Win32::Foundation::POINT;
    use windows::Win32::UI::Input::KeyboardAndMouse::{keybd_event, KEYBD_EVENT_FLAGS, KEYEVENTF_KEYUP, VK_CONTROL, VK_MENU, VK_SHIFT};
    use windows::Win32::UI::WindowsAndMessaging::{GetCursorPos, SetCursorPos};

    let mut context = tauri::generate_context!();
    context.config_mut().identifier = "app.izuki.eye-stop-probe".into();
    context.config_mut().app.windows.clear();
    let app = tauri::Builder::default().build(context).expect("build the probe app");
    let handle = app.handle().clone();
    // Exactly what Izuki starts: the key watchers, then the safety layer.
    izuki_lib::hotkey::install_escape_watch(&handle);
    airsafe::install(&handle, "Ctrl+Alt+Shift+X", true);

    let cursor = || {
        let mut p = POINT::default();
        let _ = unsafe { GetCursorPos(&mut p) };
        (p.x, p.y)
    };
    let near = |a: (i32, i32), b: (i32, i32)| (a.0 - b.0).abs() <= 3 && (a.1 - b.1).abs() <= 3;
    let wait_for = |what: &str, ms: u64, f: &dyn Fn() -> bool| {
        let t = Instant::now();
        while t.elapsed() < Duration::from_millis(ms) {
            if f() {
                return t.elapsed().as_millis();
            }
            std::thread::sleep(Duration::from_millis(10));
        }
        panic!("{what} didn't happen within {ms} ms");
    };
    /// Puts the pointer back however the probe ends (a failed check panics,
    /// and panics unwind in this crate, so this runs).
    struct PutBack((i32, i32));
    impl Drop for PutBack {
        fn drop(&mut self) {
            let _ = unsafe { SetCursorPos(self.0 .0, self.0 .1) };
        }
    }
    let start = cursor();
    let put_back = PutBack(start);
    let (cx, cy) = izuki_lib::air::to_screen(0.5, 0.5);
    let mut passed: Vec<String> = Vec::new();

    // 1. The stop's two watchers are running, so the gaze pointer may move.
    let ms = wait_for("the emergency stop's watchers starting", 3_000, &|| airsafe::ready());
    passed.push(format!("both stop watchers running ({ms} ms)"));

    // 2. The gaze pointer moves the real pointer, in small steady steps.
    let mut last = (cx, cy);
    for i in 0..5 {
        last = (cx + i * 4, cy);
        assert!(airsafe::eye_pointer(last.0, last.1, 0.5, 0.5), "a steady gaze move was refused ({:?}); if paused because the mouse moved or a key was pressed, someone used the PC during the probe", airsafe::status());
        std::thread::sleep(Duration::from_millis(120));
    }
    assert!(near(cursor(), last), "the real pointer is at {:?}, not {:?}", cursor(), last);
    passed.push("the gaze pointer moves the real pointer".into());

    // 3. The person moving the mouse pauses it, and it doesn't fight back.
    let theirs = (cx + 260, cy + 140);
    unsafe { SetCursorPos(theirs.0, theirs.1) }.expect("move the pointer like a person would");
    wait_for("the watchdog noticing the person moved the mouse", 1_000, &|| airsafe::status().paused.is_some());
    assert!(!airsafe::eye_pointer(cx, cy, 0.5, 0.5), "the gaze pointer moved while paused");
    assert!(near(cursor(), theirs), "the pointer was taken back from the person");
    assert_eq!(airsafe::status().paused.as_deref(), Some("you moved the mouse"));
    assert!(airsafe::resume());
    passed.push("moving the mouse pauses the gaze pointer; it stays where the person put it".into());

    // 4. A pointer jumping side to side is paused as erratic.
    let (lx, _) = izuki_lib::air::to_screen(0.15, 0.5);
    let (rx, _) = izuki_lib::air::to_screen(0.85, 0.5);
    let mut refused = false;
    for i in 0..16 {
        let (x, nx) = if i % 2 == 0 { (lx, 0.15) } else { (rx, 0.85) };
        if !airsafe::eye_pointer(x, cy, nx, 0.5) {
            refused = true;
            break;
        }
        std::thread::sleep(Duration::from_millis(40));
    }
    assert!(refused, "an erratic gaze pointer was never stopped");
    assert!(airsafe::status().paused.as_deref().is_some_and(|p| p.contains("jumping around")), "paused for the wrong reason: {:?}", airsafe::status().paused);
    assert!(airsafe::resume());
    passed.push("an erratic gaze pointer is paused".into());

    // 5. The real emergency keys, pressed: caught, latched, and nothing moves after.
    unsafe { SetCursorPos(cx, cy) }.ok();
    assert!(airsafe::eye_pointer(cx, cy, 0.5, 0.5));
    std::thread::sleep(Duration::from_millis(150));
    let before = cursor();
    let x_key = 0x58u8;
    /// Lets go of the emergency keys however the wait below ends, so a
    /// failed check never leaves Ctrl, Alt, Shift or X held on the PC.
    struct LetGo(u8);
    impl Drop for LetGo {
        fn drop(&mut self) {
            unsafe {
                keybd_event(self.0, 0, KEYEVENTF_KEYUP, 0);
                keybd_event(VK_SHIFT.0 as u8, 0, KEYEVENTF_KEYUP, 0);
                keybd_event(VK_MENU.0 as u8, 0, KEYEVENTF_KEYUP, 0);
                keybd_event(VK_CONTROL.0 as u8, 0, KEYEVENTF_KEYUP, 0);
            }
        }
    }
    let held = LetGo(x_key);
    unsafe {
        keybd_event(VK_CONTROL.0 as u8, 0, KEYBD_EVENT_FLAGS(0), 0);
        keybd_event(VK_MENU.0 as u8, 0, KEYBD_EVENT_FLAGS(0), 0);
        keybd_event(VK_SHIFT.0 as u8, 0, KEYBD_EVENT_FLAGS(0), 0);
        keybd_event(x_key, 0, KEYBD_EVENT_FLAGS(0), 0);
    }
    let caught = wait_for("Ctrl+Alt+Shift+X stopping Eye Control", 1_000, &|| airsafe::stopped());
    drop(held);
    assert!(!airsafe::eye_pointer(cx + 200, cy + 100, 0.6, 0.6), "the gaze pointer moved after the emergency stop");
    assert!(!airsafe::resume(), "resume undid an emergency stop");
    assert!(!airsafe::button_allowed(false, true), "a click passed after the emergency stop");
    std::thread::sleep(Duration::from_millis(300));
    assert!(near(cursor(), before), "the pointer moved after the emergency stop");
    assert!(airsafe::status().stopped);
    passed.push(format!("Ctrl+Alt+Shift+X stops it ({caught} ms), latched: no move, no click, no resume"));

    // 6. Only arming again (the person turning Air on) brings it back.
    airsafe::arm();
    assert!(airsafe::eye_pointer(cx, cy, 0.5, 0.5), "arming didn't bring the gaze pointer back");
    passed.push("turning Air on again re-arms it".into());

    // process::exit skips destructors: put the pointer back here.
    drop(put_back);
    for line in &passed {
        println!("  ok  {line}");
    }
    println!("EYE STOP PROBE: {} checks passed", passed.len());
    std::process::exit(0);
}

#[cfg(not(windows))]
fn main() {
    panic!("eye_stop_probe needs a real Windows desktop");
}
