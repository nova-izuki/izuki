//! The checks around every action — each a few milliseconds when all is well.

use crate::controls::Control;
use crate::pointer;

/// What's really at a click point, compared with the control you mean.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AtPoint {
    /// It's there and can be pressed.
    Right,
    /// It's there but greyed out.
    Disabled,
    /// It moved since the controls were listed (the page shifted): it's here now.
    Moved(i32, i32),
    /// Can't tell (no name to go by, or the app doesn't say).
    Unknown,
}

/// How a [`safe_click`] went.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Outcome {
    Clicked,
    /// The page had moved; it was clicked where it is now.
    ClickedWhereItMoved,
    /// Something was on top of it, so it was pressed directly through UI Automation.
    PressedDirectly { cover: String },
    /// Greyed out: nothing was clicked.
    Disabled,
    /// Something is on top and it couldn't be pressed directly: nothing was clicked.
    Covered { by: String },
    Failed(String),
}

/// How [`type_and_check`] went.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Typed {
    /// The box shows what was typed.
    Checked,
    /// The box showed something else, so it was typed again — and now matches.
    Fixed,
    /// The box still shows something else (returned). Long boxes (a document)
    /// are never select-all'd and retyped, so nothing of the user's is lost.
    Mismatch(String),
    /// The box can't be read (a password box, or an app that doesn't say).
    Unchecked,
}

fn tidy(s: &str) -> String {
    s.split_whitespace().collect::<Vec<_>>().join(" ").to_lowercase()
}

fn same_name(have: &str, want: &str) -> bool {
    let (h, w) = (tidy(have), tidy(want));
    !w.is_empty() && (h == w || (w.chars().count() >= 3 && h.starts_with(&w)))
}

/// Whether `shown` (what a box holds) has `typed` in it, ignoring case and spacing.
pub fn has_typed(shown: &str, typed: &str) -> bool {
    tidy(shown).contains(&tidy(typed))
}

#[cfg(windows)]
fn automation() -> Option<uiautomation::UIAutomation> {
    uiautomation::UIAutomation::new().or_else(|_| uiautomation::UIAutomation::new_direct()).ok()
}

#[cfg(windows)]
fn find_named(a: &uiautomation::UIAutomation, window: isize, name: &str) -> Option<uiautomation::UIElement> {
    use uiautomation::types::{PropertyConditionFlags, TreeScope, UIProperty};
    let hwnd = windows::Win32::Foundation::HWND(window as *mut core::ffi::c_void);
    let root = a.element_from_handle(hwnd.into()).ok()?;
    let needle: String = name.chars().take(50).collect();
    let cond = a.create_property_condition(UIProperty::Name, needle.as_str().into(), Some(PropertyConditionFlags::All)).ok()?;
    root.find_first(TreeScope::Descendants, &cond).ok()
}

/// Is the control called `name` really at (x, y), and can it be pressed?
/// If the page moved since the list was made, where it is now.
#[cfg(windows)]
pub fn check_target(window: isize, x: i32, y: i32, name: &str) -> AtPoint {
    use uiautomation::types::Point;
    if name.trim().chars().count() < 2 {
        return AtPoint::Unknown;
    }
    let Some(a) = automation() else { return AtPoint::Unknown };
    if let Ok(hit) = a.element_from_point(Point::new(x, y)) {
        let walker = a.get_control_view_walker().ok();
        let mut el = Some(hit);
        for _ in 0..5 {
            let Some(e) = el else { break };
            if same_name(&e.get_name().unwrap_or_default(), name) {
                return if e.is_enabled().unwrap_or(true) { AtPoint::Right } else { AtPoint::Disabled };
            }
            el = walker.as_ref().and_then(|w| w.get_parent(&e).ok());
        }
    }
    let Some(el) = find_named(&a, window, name) else { return AtPoint::Unknown };
    if !el.is_enabled().unwrap_or(true) {
        return AtPoint::Disabled;
    }
    let Ok(r) = el.get_bounding_rectangle() else { return AtPoint::Unknown };
    let r = crate::controls::to_rect(&r);
    if r.w <= 2 || r.h <= 2 || el.is_offscreen().unwrap_or(false) {
        return AtPoint::Unknown;
    }
    let (cx, cy) = r.center();
    if (cx - x).abs() + (cy - y).abs() > 8 {
        AtPoint::Moved(cx, cy)
    } else {
        AtPoint::Right
    }
}

#[cfg(not(windows))]
pub fn check_target(_window: isize, _x: i32, _y: i32, _name: &str) -> AtPoint {
    AtPoint::Unknown
}

/// Is another app's window (a pop-up, a notification, a chat head) on top of
/// (x, y), so a click there would land on it instead of `window`? Its name if
/// so. Menus and dialogs of the same app don't count, nor do this process's
/// own windows.
#[cfg(windows)]
pub fn covered_at(window: isize, x: i32, y: i32) -> Option<String> {
    use windows::Win32::Foundation::{HWND, POINT};
    use windows::Win32::UI::WindowsAndMessaging::{GetAncestor, GetClassNameW, GetWindowTextW, GetWindowThreadProcessId, WindowFromPoint, GA_ROOT};
    let target = HWND(window as *mut core::ffi::c_void);
    unsafe {
        let here = WindowFromPoint(POINT { x, y });
        if here.0.is_null() {
            return None;
        }
        let root = GetAncestor(here, GA_ROOT);
        if root == target || here == target {
            return None;
        }
        let pid_of = |h: HWND| {
            let mut pid = 0u32;
            GetWindowThreadProcessId(h, Some(&mut pid));
            pid
        };
        let theirs = pid_of(root);
        if theirs == std::process::id() || theirs == pid_of(target) {
            return None;
        }
        let mut buf = [0u16; 256];
        let n = GetWindowTextW(root, &mut buf);
        let name = String::from_utf16_lossy(&buf[..n.max(0) as usize]).trim().to_string();
        if !name.is_empty() {
            return Some(name);
        }
        let n = GetClassNameW(root, &mut buf);
        Some(match String::from_utf16_lossy(&buf[..n.max(0) as usize]).as_str() {
            "Windows.UI.Core.CoreWindow" => "a Windows notification".to_string(),
            "Shell_TrayWnd" | "Shell_SecondaryTrayWnd" => "the taskbar".to_string(),
            class => format!("another window ({class})"),
        })
    }
}

#[cfg(not(windows))]
pub fn covered_at(_window: isize, _x: i32, _y: i32) -> Option<String> {
    None
}

/// Press the control called `name` in `window` directly, no mouse: Invoke,
/// then Toggle, SelectionItem, and the accessibility default action.
#[cfg(windows)]
pub fn press_named(window: isize, name: &str) -> bool {
    use uiautomation::patterns::{UIInvokePattern, UILegacyIAccessiblePattern, UISelectionItemPattern, UITogglePattern};
    let Some(a) = automation() else { return false };
    let Some(el) = find_named(&a, window, name) else { return false };
    if el.get_pattern::<UIInvokePattern>().is_ok_and(|p| p.invoke().is_ok()) {
        return true;
    }
    if el.get_pattern::<UITogglePattern>().is_ok_and(|p| p.toggle().is_ok()) {
        return true;
    }
    if el.get_pattern::<UISelectionItemPattern>().is_ok_and(|p| p.select().is_ok()) {
        return true;
    }
    el.get_pattern::<UILegacyIAccessiblePattern>().is_ok_and(|p| p.do_default_action().is_ok())
}

#[cfg(not(windows))]
pub fn press_named(_window: isize, _name: &str) -> bool {
    false
}

/// Click `control` of `window` — checked first: really there (else where it
/// moved to), not greyed out, not covered (else pressed directly).
#[cfg(windows)]
pub fn safe_click(window: isize, control: &Control) -> Outcome {
    let (mut x, mut y) = control.rect.center();
    let mut moved = false;
    match check_target(window, x, y, &control.name) {
        AtPoint::Disabled => return Outcome::Disabled,
        AtPoint::Moved(nx, ny) => {
            x = nx;
            y = ny;
            moved = true;
        }
        AtPoint::Right | AtPoint::Unknown => {}
    }
    if let Some(cover) = covered_at(window, x, y) {
        return if press_named(window, &control.name) { Outcome::PressedDirectly { cover } } else { Outcome::Covered { by: cover } };
    }
    pointer::glide(x, y, 250);
    pointer::click_here(pointer::Button::Left, 1);
    if moved {
        Outcome::ClickedWhereItMoved
    } else {
        Outcome::Clicked
    }
}

#[cfg(not(windows))]
pub fn safe_click(_window: isize, _control: &Control) -> Outcome {
    Outcome::Failed("Safe Hands works on Windows only".into())
}

/// Type `text` where the keyboard focus is, then read the box back; a short
/// box that shows something else is select-all'd and typed again once.
#[cfg(windows)]
pub fn type_and_check(text: &str) -> Typed {
    use uiautomation::patterns::UIValuePattern;
    let read = || -> Option<String> {
        let a = automation()?;
        let el = a.get_focused_element().ok()?;
        if el.is_password().unwrap_or(true) {
            return None;
        }
        el.get_pattern::<UIValuePattern>().ok()?.get_value().ok()
    };
    pointer::type_text(text);
    std::thread::sleep(std::time::Duration::from_millis(120));
    let Some(shown) = read() else { return Typed::Unchecked };
    if has_typed(&shown, text) {
        return Typed::Checked;
    }
    if shown.chars().count() > text.chars().count() * 2 + 20 {
        return Typed::Mismatch(shown.chars().take(80).collect());
    }
    pointer::select_all();
    pointer::type_text(text);
    std::thread::sleep(std::time::Duration::from_millis(120));
    match read() {
        Some(again) if !has_typed(&again, text) => Typed::Mismatch(again.chars().take(80).collect()),
        _ => Typed::Fixed,
    }
}

#[cfg(not(windows))]
pub fn type_and_check(_text: &str) -> Typed {
    Typed::Unchecked
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn names_match_through_truncation_and_spacing() {
        assert!(same_name("Sign  in", "sign in"));
        assert!(same_name("Luffy Relax Study Music 🎧 1 hour of calm", "Luffy Relax Study Music"));
        assert!(!same_name("Sign up", "Sign in"));
        assert!(!same_name("anything", ""));
    }

    #[test]
    fn typed_text_is_found_ignoring_case_and_spacing() {
        assert!(has_typed("Lofi  Study", "lofi study"));
        assert!(!has_typed("lofi stdy", "lofi study"));
    }
}
