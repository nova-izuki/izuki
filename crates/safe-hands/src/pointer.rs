//! The pointer and keyboard, exact. The cursor goes on the exact physical
//! pixel on any monitor (a common mouse library's absolute move scales
//! against the main screen only, so clicks on a second monitor land on the
//! first one's edge), and clicks and typing are sent the way a real device
//! sends them.

/// Put the cursor exactly on (x, y) — physical pixels anywhere on the
/// virtual desktop, every monitor included — and send a real mouse-move
/// event there so hover effects react.
#[cfg(windows)]
pub fn place(x: i32, y: i32) -> bool {
    use windows::Win32::UI::WindowsAndMessaging::SetCursorPos;
    let ok = unsafe { SetCursorPos(x, y) }.is_ok();
    if ok {
        send_mouse(windows::Win32::UI::Input::KeyboardAndMouse::MOUSEEVENTF_MOVE);
    }
    ok
}

/// Glide from where the cursor is to (x, y) over about `ms` milliseconds —
/// visible, human-like movement. Lands exactly on the pixel.
#[cfg(windows)]
pub fn glide(x: i32, y: i32, ms: u64) {
    let (sx, sy) = position();
    let steps = (ms / 8).clamp(1, 120) as i32;
    for i in 1..=steps {
        let t = i as f64 / steps as f64;
        let e = 1.0 - (1.0 - t).powi(3); // ease out
        place(sx + ((x - sx) as f64 * e).round() as i32, sy + ((y - sy) as f64 * e).round() as i32);
        std::thread::sleep(std::time::Duration::from_millis(ms / steps as u64));
    }
    place(x, y);
}

/// Where the cursor is now.
#[cfg(windows)]
pub fn position() -> (i32, i32) {
    use windows::Win32::Foundation::POINT;
    use windows::Win32::UI::WindowsAndMessaging::GetCursorPos;
    let mut p = POINT::default();
    unsafe {
        let _ = GetCursorPos(&mut p);
    }
    (p.x, p.y)
}

/// Which button a click uses.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Button {
    Left,
    Right,
}

/// Click where the cursor is, `times` times (2 = a double click).
#[cfg(windows)]
pub fn click_here(button: Button, times: u8) {
    use windows::Win32::UI::Input::KeyboardAndMouse::{
        MOUSEEVENTF_LEFTDOWN, MOUSEEVENTF_LEFTUP, MOUSEEVENTF_RIGHTDOWN, MOUSEEVENTF_RIGHTUP,
    };
    let (down, up) = match button {
        Button::Left => (MOUSEEVENTF_LEFTDOWN, MOUSEEVENTF_LEFTUP),
        Button::Right => (MOUSEEVENTF_RIGHTDOWN, MOUSEEVENTF_RIGHTUP),
    };
    for i in 0..times.max(1) {
        send_mouse(down);
        std::thread::sleep(std::time::Duration::from_millis(30));
        send_mouse(up);
        if i + 1 < times {
            std::thread::sleep(std::time::Duration::from_millis(60));
        }
    }
}

/// Type `text` as real key presses (any character, any language).
#[cfg(windows)]
pub fn type_text(text: &str) {
    use windows::Win32::UI::Input::KeyboardAndMouse::{
        SendInput, INPUT, INPUT_0, INPUT_KEYBOARD, KEYBDINPUT, KEYBD_EVENT_FLAGS, KEYEVENTF_KEYUP, KEYEVENTF_UNICODE, VIRTUAL_KEY,
    };
    for unit in text.encode_utf16() {
        let key = |flags: KEYBD_EVENT_FLAGS| INPUT {
            r#type: INPUT_KEYBOARD,
            Anonymous: INPUT_0 { ki: KEYBDINPUT { wVk: VIRTUAL_KEY(0), wScan: unit, dwFlags: flags, time: 0, dwExtraInfo: 0 } },
        };
        let inputs = [key(KEYEVENTF_UNICODE), key(KEYEVENTF_UNICODE | KEYEVENTF_KEYUP)];
        unsafe {
            SendInput(&inputs, std::mem::size_of::<INPUT>() as i32);
        }
        std::thread::sleep(std::time::Duration::from_millis(4));
    }
}

/// Press Ctrl+A (select everything in the focused box).
#[cfg(windows)]
pub fn select_all() {
    use windows::Win32::UI::Input::KeyboardAndMouse::{
        SendInput, INPUT, INPUT_0, INPUT_KEYBOARD, KEYBDINPUT, KEYBD_EVENT_FLAGS, KEYEVENTF_KEYUP, VIRTUAL_KEY, VK_A, VK_CONTROL,
    };
    let key = |vk: VIRTUAL_KEY, flags: KEYBD_EVENT_FLAGS| INPUT {
        r#type: INPUT_KEYBOARD,
        Anonymous: INPUT_0 { ki: KEYBDINPUT { wVk: vk, wScan: 0, dwFlags: flags, time: 0, dwExtraInfo: 0 } },
    };
    let inputs = [
        key(VK_CONTROL, KEYBD_EVENT_FLAGS(0)),
        key(VK_A, KEYBD_EVENT_FLAGS(0)),
        key(VK_A, KEYEVENTF_KEYUP),
        key(VK_CONTROL, KEYEVENTF_KEYUP),
    ];
    unsafe {
        SendInput(&inputs, std::mem::size_of::<INPUT>() as i32);
    }
}

#[cfg(windows)]
fn send_mouse(flags: windows::Win32::UI::Input::KeyboardAndMouse::MOUSE_EVENT_FLAGS) {
    use windows::Win32::UI::Input::KeyboardAndMouse::{SendInput, INPUT, INPUT_0, INPUT_MOUSE, MOUSEINPUT};
    let input = INPUT {
        r#type: INPUT_MOUSE,
        Anonymous: INPUT_0 { mi: MOUSEINPUT { dx: 0, dy: 0, mouseData: 0, dwFlags: flags, time: 0, dwExtraInfo: 0 } },
    };
    unsafe {
        SendInput(&[input], std::mem::size_of::<INPUT>() as i32);
    }
}
