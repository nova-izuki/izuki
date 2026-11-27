//! Native own-window inspection. No Tauri dispatch, AI, focus changes or
//! process termination. Also compiled directly by the Windows rescue probe.
use crate::rescue_core::{owned_overlay, Visibility};

#[cfg(windows)]
mod win {
    use super::*;
    use std::ffi::c_void;
    type Hwnd = *mut c_void;
    #[link(name = "user32")]
    extern "system" {
        fn EnumWindows(callback: unsafe extern "system" fn(Hwnd, isize) -> i32, data: isize)
            -> i32;
        fn GetWindowThreadProcessId(window: Hwnd, pid: *mut u32) -> u32;
        fn GetClassNameW(window: Hwnd, text: *mut u16, max: i32) -> i32;
        fn SetPropW(window: Hwnd, key: *const u16, value: *mut c_void) -> i32;
        fn GetPropW(window: Hwnd, key: *const u16) -> *mut c_void;
        fn IsWindow(window: Hwnd) -> i32;
        fn IsWindowVisible(window: Hwnd) -> i32;
        fn ShowWindowAsync(window: Hwnd, command: i32) -> i32;
        fn GetShellWindow() -> Hwnd;
    }
    #[derive(Clone, Debug, PartialEq, Eq)]
    struct Window {
        handle: isize,
        pid: u32,
        title: String,
        class: String,
    }
    fn property() -> Vec<u16> {
        "Izuki.NativeRescue.Overlay\0".encode_utf16().collect()
    }
    pub fn register(handle: isize) -> bool {
        let hwnd = handle as Hwnd;
        let mut pid = 0;
        unsafe {
            GetWindowThreadProcessId(hwnd, &mut pid);
        }
        pid == std::process::id()
            && unsafe { SetPropW(hwnd, property().as_ptr(), 1usize as *mut c_void) != 0 }
    }
    unsafe fn inspect(handle: Hwnd) -> Option<Window> {
        if IsWindow(handle) == 0 {
            return None;
        }
        let mut pid = 0;
        if GetWindowThreadProcessId(handle, &mut pid) == 0 {
            return None;
        }
        // Only read our own window titles. Other applications are excluded
        // by PID before any content is collected.
        if pid != std::process::id() {
            return None;
        }
        // GetWindowText would send WM_GETTEXT to our own UI thread and could
        // hang with it. A property set at creation is checked by Windows
        // without messaging that thread; destroyed/reused HWNDs lose it.
        if GetPropW(handle, property().as_ptr()) as usize != 1 {
            return None;
        }
        let mut class = [0u16; 80];
        let c = GetClassNameW(handle, class.as_mut_ptr(), class.len() as i32).max(0) as usize;
        let class = String::from_utf16_lossy(&class[..c]);
        let title = if class == "Tauri Window" {
            "Izuki Overlay"
        } else {
            ""
        }
        .to_string();
        let window = Window {
            handle: handle as isize,
            pid,
            title,
            class,
        };
        owned_overlay(pid, std::process::id(), &window.title, &window.class).then_some(window)
    }
    unsafe extern "system" fn collect(handle: Hwnd, data: isize) -> i32 {
        if IsWindowVisible(handle) != 0 {
            if let Some(window) = inspect(handle) {
                (*(data as *mut Vec<Window>)).push(window);
            }
        }
        1
    }
    pub fn visible() -> Option<usize> {
        let mut found = Vec::<Window>::new();
        (unsafe { EnumWindows(collect, &mut found as *mut _ as isize) } != 0).then_some(found.len())
    }
    pub fn hide() -> Visibility {
        let mut found = Vec::<Window>::new();
        if unsafe { EnumWindows(collect, &mut found as *mut _ as isize) } == 0 {
            return Visibility {
                unknown: 1,
                ..Default::default()
            };
        }
        let mut report = Visibility {
            found: found.len(),
            ..Default::default()
        };
        for original in found {
            let handle = original.handle as Hwnd;
            // HWND values can be recycled: prove PID, title and class again
            // immediately before posting any native operation.
            if unsafe { inspect(handle) } != Some(original.clone()) {
                report.unknown += 1;
                continue;
            }
            unsafe {
                ShowWindowAsync(handle, 0);
            }
            let until = std::time::Instant::now() + std::time::Duration::from_millis(400);
            loop {
                if unsafe { IsWindow(handle) } == 0 {
                    report.hidden += 1;
                    break;
                }
                if unsafe { inspect(handle) } != Some(original.clone()) {
                    report.unknown += 1;
                    break;
                }
                if unsafe { IsWindowVisible(handle) } == 0 {
                    report.hidden += 1;
                    break;
                }
                if std::time::Instant::now() >= until {
                    report.remaining += 1;
                    break;
                }
                std::thread::sleep(std::time::Duration::from_millis(15));
            }
        }
        report
    }
    pub fn shell() -> Option<bool> {
        Some(unsafe { !GetShellWindow().is_null() })
    }
}
#[cfg(windows)]
pub use win::{hide, register, shell, visible};
#[cfg(not(windows))]
pub fn register(_handle: isize) -> bool {
    false
}
#[cfg(not(windows))]
pub fn hide() -> Visibility {
    Visibility {
        unknown: 1,
        ..Default::default()
    }
}
#[cfg(not(windows))]
pub fn shell() -> Option<bool> {
    None
}
#[cfg(not(windows))]
pub fn visible() -> Option<usize> {
    None
}
