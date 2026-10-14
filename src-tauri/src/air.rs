//! Air control — your hand in front of the camera drives the PC, Meta-Quest
//! style: the fingertip is the pointer, a pinch is a click (hold it to drag),
//! other pinches right-click, copy and paste, two fingers scroll. The camera
//! and the hand tracking live in the overlay (AirControl.tsx); this is the
//! PC side: the real pointer and buttons, and the box around whatever is
//! under your finger — sized to that thing exactly, from a whole window down
//! to one of FL Studio's tiny step buttons — so you see what a pinch will hit.

use anyhow::Result;
use serde::Serialize;

use crate::model::Rect;

/// Move the real pointer (physical pixels, any monitor).
pub fn pointer(x: i32, y: i32) {
    crate::automation::pointer_to(x, y);
}

/// Press or let go of a mouse button where the pointer is (a pinch held is a drag).
/// Letting go of the left button also lets go of a 3D grip — every way a
/// pinch can end (hand gone, paused, lowered) comes through here.
pub fn button(right: bool, down: bool) -> Result<()> {
    if !right && !down {
        let _ = grip_3d(false);
    }
    crate::automation::mouse_button(right, down)
}

// ---------------------------------------------------------------------------
// 3D apps: a pinch dragged turns the model (orbit), the way each app wants
// it — Blender orbits with the middle button, Unity with Alt + left… A quick
// pinch is still a click (the frontend decides), and ✌️ zooms (scroll).
// ---------------------------------------------------------------------------

/// How a 3D app orbits: (exe name, shown name, mouse button, keys held).
const APPS_3D: &[(&str, &str, Btn, &[&str])] = &[
    ("blender", "Blender", Btn::Middle, &[]),
    ("sketchup", "SketchUp", Btn::Middle, &[]),
    ("fusion360", "Fusion 360", Btn::Middle, &["shift"]),
    ("unity", "Unity", Btn::Left, &["alt"]),
    ("maya", "Maya", Btn::Left, &["alt"]),
    ("3dsmax", "3ds Max", Btn::Middle, &["alt"]),
    ("cinema 4d", "Cinema 4D", Btn::Left, &["alt"]),
    ("3dviewer", "3D Viewer", Btn::Left, &[]),
    ("paintstudio.view", "Paint 3D", Btn::Left, &[]),
    ("freecad", "FreeCAD", Btn::Middle, &[]),
];

#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Btn {
    Left,
    Middle,
}

/// The 3D app in front, if Air's 3D controls are on and it's one we know.
pub fn app_3d() -> Option<(&'static str, Btn, &'static [&'static str])> {
    let on = crate::state::try_store().is_some_and(|s| s.settings().air_3d);
    if !on {
        return None;
    }
    profile(&crate::uia::foreground_app())
}

fn profile(app: &str) -> Option<(&'static str, Btn, &'static [&'static str])> {
    let a = app.to_lowercase();
    let a = a.trim_end_matches(".exe");
    APPS_3D.iter().find(|(exe, _, _, _)| a == *exe).map(|(_, name, b, keys)| (*name, *b, *keys))
}

/// What's held for a 3D grip right now (to let go of exactly that). The lock
/// is held for a whole start or end, so a "let go" can never slip in while a
/// grip is still being pressed and leave it stuck down.
static GRIP: parking_lot::Mutex<Option<(Btn, &'static [&'static str])>> = parking_lot::Mutex::new(None);

fn let_go(held: &mut Option<(Btn, &'static [&'static str])>) -> bool {
    match held.take() {
        Some((b, keys)) => {
            let _ = press(b, false);
            for k in keys.iter().rev() {
                let _ = crate::automation::key_hold(k, false);
            }
            true
        }
        None => false,
    }
}

/// Start (down) or end a 3D grip. `Ok(false)` when there's no 3D app in front.
pub fn grip_3d(down: bool) -> Result<bool> {
    let mut held = GRIP.lock();
    if !down {
        return Ok(let_go(&mut held));
    }
    let Some((name, b, keys)) = app_3d() else { return Ok(false) };
    // Never two grips at once.
    let_go(&mut held);
    // Keys pressed so far: if one fails, the earlier ones are let go too.
    for (i, k) in keys.iter().enumerate() {
        if let Err(e) = crate::automation::key_hold(k, true) {
            for done in keys[..i].iter().rev() {
                let _ = crate::automation::key_hold(done, false);
            }
            return Err(e);
        }
    }
    if let Err(e) = press(b, true) {
        for k in keys.iter().rev() {
            let _ = crate::automation::key_hold(k, false);
        }
        return Err(e);
    }
    *held = Some((b, keys));
    eprintln!("[air] 3D: orbiting in {name}");
    Ok(true)
}

fn press(b: Btn, down: bool) -> Result<()> {
    match b {
        Btn::Left => crate::automation::mouse_button(false, down),
        Btn::Middle => crate::automation::middle_button(down),
    }
}

/// Scroll whatever is under the pointer: notches, down when positive.
pub fn scroll(amount: i32) -> Result<()> {
    crate::automation::scroll_here(amount)
}

/// Scroll sideways (carousels, wide pages, timelines): right when positive.
pub fn scroll_sideways(amount: i32) -> Result<()> {
    crate::automation::scroll_sideways_here(amount)
}

/// A key or combination ("ctrl+c", "alt+left").
pub fn keys(combo: &str) -> Result<()> {
    if !crate::automation::key_is_known(combo) {
        anyhow::bail!("unknown keys: {combo}");
    }
    crate::automation::press_key(combo)
}

#[derive(Debug, Clone, Copy, Serialize, PartialEq)]
pub struct Hit {
    pub x: i32,
    pub y: i32,
    pub w: i32,
    pub h: i32,
    /// "control" (Windows told us its edges) or "seen" (found in the picture).
    pub kind: &'static str,
    /// A box you can type into (point at it and talk).
    pub field: bool,
}

/// Normalized (0..1 over every monitor) → physical pixels.
pub fn to_screen(nx: f64, ny: f64) -> (i32, i32) {
    let b = crate::capture::virtual_bounds();
    let x = b.x + (nx.clamp(0.0, 1.0) * (b.w - 1).max(0) as f64).round() as i32;
    let y = b.y + (ny.clamp(0.0, 1.0) * (b.h - 1).max(0) as f64).round() as i32;
    (x, y)
}

/// A box, normalized like the pointer (what the overlay draws).
#[derive(Debug, Clone, Copy, Serialize)]
pub struct Seen {
    pub nx: f64,
    pub ny: f64,
    pub nw: f64,
    pub nh: f64,
    pub kind: &'static str,
    pub field: bool,
}

/// The box under a normalized point, normalized back for drawing.
/// `overlay` is the overlay window, kept out of the picture (its cursor ring
/// and box would otherwise be "the shape under the finger").
pub fn target_norm(nx: f64, ny: f64, overlay: Option<isize>) -> Option<Seen> {
    let (x, y) = to_screen(nx, ny);
    let b = crate::capture::virtual_bounds();
    let t = unseen(overlay, || target(x, y))?;
    let (w, h) = (b.w.max(1) as f64, b.h.max(1) as f64);
    Some(Seen { nx: (t.x - b.x) as f64 / w, ny: (t.y - b.y) as f64 / h, nw: t.w as f64 / w, nh: t.h as f64 / h, kind: t.kind, field: t.field })
}

/// Run `f` with the overlay hidden from screen grabs (still on screen for you).
#[cfg(windows)]
fn unseen<T>(overlay: Option<isize>, f: impl FnOnce() -> T) -> T {
    use windows::Win32::Foundation::HWND;
    use windows::Win32::UI::WindowsAndMessaging::{SetWindowDisplayAffinity, WDA_EXCLUDEFROMCAPTURE, WDA_NONE};
    // One look at a time, so one can't put the overlay back mid-grab of another.
    static ONE: parking_lot::Mutex<()> = parking_lot::Mutex::new(());
    let Some(h) = overlay else { return f() };
    let _one = ONE.lock();
    let hwnd = HWND(h as *mut _);
    let hidden = unsafe { SetWindowDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE) }.is_ok();
    let out = f();
    if hidden {
        let _ = unsafe { SetWindowDisplayAffinity(hwnd, WDA_NONE) };
    }
    out
}

#[cfg(not(windows))]
fn unseen<T>(_overlay: Option<isize>, f: impl FnOnce() -> T) -> T {
    f()
}

/// The thing under (x, y), boxed: the control Windows knows is there when it
/// is a sensible size, otherwise the shape seen in the picture around the
/// point (custom-drawn apps like FL Studio, games, canvases).
pub fn target(x: i32, y: i32) -> Option<Hit> {
    let screen = crate::capture::virtual_bounds();
    let big = (screen.w as i64 * screen.h as i64) / 6;
    let control = control_at(x, y);
    let field = control.is_some_and(|(_, f)| f);
    if let Some((r, _)) = control {
        let area = r.w as i64 * r.h as i64;
        // A whole pane or window says nothing about what's under the finger.
        if r.w >= 6 && r.h >= 6 && area < big && r.w < screen.w / 2 {
            return Some(Hit { x: r.x, y: r.y, w: r.w, h: r.h, kind: "control", field });
        }
    }
    seen_at(x, y).map(|h| Hit { field, ..h })
}

/// The control Windows knows is at (x, y), and whether it takes typing.
#[cfg(windows)]
fn control_at(x: i32, y: i32) -> Option<(Rect, bool)> {
    use uiautomation::types::{ControlType, Point};
    use uiautomation::UIAutomation;
    let a = UIAutomation::new().or_else(|_| UIAutomation::new_direct()).ok()?;
    let el = a.element_from_point(Point::new(x, y)).ok()?;
    let r = el.get_bounding_rectangle().ok()?;
    let rect = Rect { x: r.get_left(), y: r.get_top(), w: r.get_right() - r.get_left(), h: r.get_bottom() - r.get_top() };
    let field = matches!(el.get_control_type(), Ok(ControlType::Edit | ControlType::ComboBox));
    (rect.w > 0 && rect.h > 0 && x >= rect.x && y >= rect.y && x <= rect.x + rect.w && y <= rect.y + rect.h).then_some((rect, field))
}

#[cfg(not(windows))]
fn control_at(_x: i32, _y: i32) -> Option<(Rect, bool)> {
    None
}

/// The shape under the point, found in the picture: grow outwards from the
/// point over pixels that look alike until the edges stop it.
fn seen_at(x: i32, y: i32) -> Option<Hit> {
    const R: i32 = 110;
    let frame = crate::capture::capture(Rect { x: x - R, y: y - R, w: R * 2, h: R * 2 }).ok()?;
    let (w, h) = (frame.width as usize, frame.height as usize);
    if w < 8 || h < 8 {
        return None;
    }
    let lum = |i: usize| -> i32 {
        let p = &frame.bgra[i * 4..i * 4 + 3];
        (p[0] as i32 * 29 + p[1] as i32 * 150 + p[2] as i32 * 77) >> 8
    };
    let (cx, cy) = ((x - frame.origin.0).clamp(0, w as i32 - 1) as usize, (y - frame.origin.1).clamp(0, h as i32 - 1) as usize);
    let seed = lum(cy * w + cx);
    let mut seen = vec![false; w * h];
    let mut stack = vec![(cx, cy)];
    let (mut x0, mut y0, mut x1, mut y1) = (cx, cy, cx, cy);
    let mut count = 0usize;
    while let Some((px, py)) = stack.pop() {
        let i = py * w + px;
        if seen[i] || (lum(i) - seed).abs() > 18 {
            continue;
        }
        seen[i] = true;
        count += 1;
        if count > w * h / 2 {
            return None; // flat background all round: nothing in particular here
        }
        x0 = x0.min(px);
        y0 = y0.min(py);
        x1 = x1.max(px);
        y1 = y1.max(py);
        if px > 0 { stack.push((px - 1, py)); }
        if py > 0 { stack.push((px, py - 1)); }
        if px + 1 < w { stack.push((px + 1, py)); }
        if py + 1 < h { stack.push((px, py + 1)); }
    }
    let (bw, bh) = ((x1 - x0 + 1) as i32, (y1 - y0 + 1) as i32);
    // Reaching the edge of what we looked at means it's bigger than a target.
    if x0 == 0 || y0 == 0 || x1 + 1 == w || y1 + 1 == h || bw < 4 || bh < 4 {
        return None;
    }
    Some(Hit { x: frame.origin.0 + x0 as i32, y: frame.origin.1 + y0 as i32, w: bw, h: bh, kind: "seen", field: false })
}

/// What people call an app → the start of its program's name.
fn app_alias(name: &str) -> String {
    let n = name.trim().to_lowercase();
    let n = n.trim_start_matches("my ").trim_start_matches("the ").trim_end_matches(" window").trim_end_matches(" app").trim();
    match n {
        "google chrome" | "chrome" | "browser" => "chrome",
        "edge" | "microsoft edge" => "msedge",
        "word" | "microsoft word" => "winword",
        "excel" | "microsoft excel" => "excel",
        "powerpoint" => "powerpnt",
        "file explorer" | "files" | "explorer" | "folder" => "explorer",
        "fl studio" | "fl" => "fl64",
        "vs code" | "vscode" | "code" => "code",
        other => other,
    }
    .to_string()
}

/// Where an app's window is on screen (the middle of its title bar), for
/// "walk to my Chrome" — the window nearest the front that matches by its
/// program name or its title. None if it isn't open (or is minimised).
#[cfg(windows)]
pub fn app_spot(name: &str) -> Option<(i32, i32)> {
    use windows::Win32::Foundation::{CloseHandle, HWND, LPARAM, RECT};
    use windows::Win32::System::Threading::{OpenProcess, QueryFullProcessImageNameW, PROCESS_NAME_WIN32, PROCESS_QUERY_LIMITED_INFORMATION};
    use windows::Win32::UI::WindowsAndMessaging::{EnumWindows, GetWindowRect, GetWindowTextW, GetWindowThreadProcessId, IsIconic, IsWindowVisible};
    use windows_core::{BOOL, PWSTR};

    let want = app_alias(name);
    if want.len() < 2 {
        return None;
    }
    unsafe extern "system" fn each(h: HWND, l: LPARAM) -> BOOL {
        let v = &mut *(l.0 as *mut Vec<isize>);
        if IsWindowVisible(h).as_bool() && !IsIconic(h).as_bool() {
            v.push(h.0 as isize);
        }
        BOOL(1)
    }
    let mut hs: Vec<isize> = Vec::new();
    unsafe {
        let _ = EnumWindows(Some(each), LPARAM(&mut hs as *mut _ as isize));
    }
    let me = std::process::id();
    for raw in hs {
        let h = HWND(raw as *mut core::ffi::c_void);
        let mut buf = [0u16; 256];
        let n = unsafe { GetWindowTextW(h, &mut buf) };
        if n <= 0 {
            continue;
        }
        let title = String::from_utf16_lossy(&buf[..n as usize]).to_lowercase();
        let mut pid = 0u32;
        unsafe { GetWindowThreadProcessId(h, Some(&mut pid)) };
        if pid == me {
            continue;
        }
        let exe = unsafe {
            match OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid) {
                Ok(p) => {
                    let mut path = [0u16; 520];
                    let mut len = path.len() as u32;
                    let ok = QueryFullProcessImageNameW(p, PROCESS_NAME_WIN32, PWSTR(path.as_mut_ptr()), &mut len).is_ok();
                    let _ = CloseHandle(p);
                    if ok {
                        let full = String::from_utf16_lossy(&path[..len as usize]).to_lowercase();
                        full.rsplit('\\').next().unwrap_or("").trim_end_matches(".exe").to_string()
                    } else {
                        String::new()
                    }
                }
                Err(_) => String::new(),
            }
        };
        if !(exe.starts_with(&want) || title.contains(&want)) {
            continue;
        }
        let mut r = RECT::default();
        if unsafe { GetWindowRect(h, &mut r) }.is_err() || r.right - r.left < 120 || r.bottom - r.top < 80 {
            continue;
        }
        return Some(((r.left + r.right) / 2, r.top + 18));
    }
    None
}

#[cfg(not(windows))]
pub fn app_spot(_name: &str) -> Option<(i32, i32)> {
    None
}

/// That spot as a share of the whole desktop (what the overlay draws in).
pub fn app_spot_norm(name: &str) -> Option<(f64, f64)> {
    let (x, y) = app_spot(name)?;
    let b = crate::capture::virtual_bounds();
    Some(((x - b.x) as f64 / b.w.max(1) as f64, (y - b.y) as f64 / b.h.max(1) as f64))
}

#[cfg(test)]
mod tests {
    #[test]
    fn knows_how_each_3d_app_orbits() {
        use super::{profile, Btn};
        assert_eq!(profile("blender.exe").map(|p| p.1), Some(Btn::Middle));
        assert_eq!(profile("Unity.exe").map(|p| (p.1, p.2.to_vec())), Some((Btn::Left, vec!["alt"])));
        assert_eq!(profile("Fusion360.exe").map(|p| p.2.to_vec()), Some(vec!["shift"]));
        assert!(profile("chrome.exe").is_none());
        assert!(profile("notepad.exe").is_none());
    }

    #[test]
    fn corners_map_inside_the_screen() {
        let b = crate::capture::virtual_bounds();
        assert_eq!(super::to_screen(0.0, 0.0), (b.x, b.y));
        assert_eq!(super::to_screen(1.0, 1.0), (b.x + b.w - 1, b.y + b.h - 1));
        assert_eq!(super::to_screen(-3.0, 9.0), (b.x, b.y + b.h - 1));
    }

    #[test]
    fn app_names_people_use() {
        assert_eq!(super::app_alias("my Chrome"), "chrome");
        assert_eq!(super::app_alias("the Word window"), "winword");
        assert_eq!(super::app_alias("FL Studio"), "fl64");
        assert_eq!(super::app_alias("Spotify"), "spotify");
    }

    #[test]
    fn keys_must_be_known() {
        assert!(super::keys("definitely-not-a-key").is_err());
    }
}
