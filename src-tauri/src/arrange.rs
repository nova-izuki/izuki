//! Window layouts: "put my windows side by side", "tile my windows in a
//! grid", "focus layout". The app windows on the screen you're using are
//! arranged in one go, the one you used last taking the biggest spot, and
//! "undo the layout" puts every one back exactly where it was (Windows' own
//! saved placement, so a maximised window comes back maximised).
//!
//! Only ordinary app windows move: never Izuki's own, never tool windows,
//! hidden, minimised, always-on-top or full-screen ones (a game, a video),
//! never dialogs that can't be resized. A window run as administrator can't be
//! moved by an app that isn't, so Windows refuses it and Izuki says so.

use anyhow::{anyhow, Result};
use serde::Serialize;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Kind {
    /// Two windows, half the screen each.
    Side,
    /// The one you're using big on the left, two more stacked on the right.
    Focus,
    /// Up to four tall columns.
    Columns,
    /// Up to four in a grid.
    Grid,
}

impl Kind {
    pub fn from_id(id: &str) -> Option<Kind> {
        match id {
            "side" => Some(Kind::Side),
            "focus" => Some(Kind::Focus),
            "columns" => Some(Kind::Columns),
            "grid" => Some(Kind::Grid),
            _ => None,
        }
    }

    fn name(self) -> &'static str {
        match self {
            Kind::Side => "side by side",
            Kind::Focus => "in a focus layout",
            Kind::Columns => "in columns",
            Kind::Grid => "in a grid",
        }
    }

    /// The most windows the layout places; the rest stay where they are.
    fn most(self) -> usize {
        match self {
            Kind::Side => 2,
            Kind::Focus => 3,
            Kind::Columns | Kind::Grid => 4,
        }
    }
}

/// A rectangle in screen pixels.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Area {
    pub x: i32,
    pub y: i32,
    pub w: i32,
    pub h: i32,
}

/// `total` pixels cut into `parts` pieces that cover it exactly: (start, size).
fn split(start: i32, total: i32, parts: usize) -> Vec<(i32, i32)> {
    let parts = parts.max(1) as i32;
    (0..parts)
        .map(|i| {
            let a = start + total * i / parts;
            let b = start + total * (i + 1) / parts;
            (a, b - a)
        })
        .collect()
}

/// Where each of `n` windows goes inside `work`, the front window first.
/// Fewer spots than windows when the layout holds fewer; the spots never
/// overlap and together cover the whole area.
pub fn slots(kind: Kind, n: usize, work: Area) -> Vec<Area> {
    let n = n.min(kind.most());
    if n == 0 || work.w <= 0 || work.h <= 0 {
        return Vec::new();
    }
    if n == 1 {
        return vec![work];
    }
    let cols = |count: usize| -> Vec<Area> {
        split(work.x, work.w, count).into_iter().map(|(x, w)| Area { x, y: work.y, w, h: work.h }).collect()
    };
    // A left spot `left_w` wide, and `rest` windows stacked on the right.
    let left_and_stack = |left_w: i32, rest: usize| -> Vec<Area> {
        let mut out = vec![Area { x: work.x, y: work.y, w: left_w, h: work.h }];
        let right = Area { x: work.x + left_w, y: work.y, w: work.w - left_w, h: work.h };
        out.extend(split(right.y, right.h, rest).into_iter().map(|(y, h)| Area { x: right.x, y, w: right.w, h }));
        out
    };
    match kind {
        Kind::Side => cols(2),
        Kind::Columns => cols(n),
        Kind::Focus => left_and_stack(work.w * 2 / 3, n - 1),
        Kind::Grid => match n {
            2 => cols(2),
            3 => left_and_stack(work.w / 2, 2),
            _ => {
                let xs = split(work.x, work.w, 2);
                let ys = split(work.y, work.h, 2);
                ys.iter().flat_map(|&(y, h)| xs.iter().map(move |&(x, w)| Area { x, y, w, h })).collect()
            }
        },
    }
}

/// What's asked for in plain words.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Ask {
    Arrange(Kind),
    Undo,
}

/// "Put my windows side by side", "tile my windows", "split my screen",
/// "grid layout", "focus layout", "undo the window layout". `None` for
/// anything else, and for questions about how to do it ("how do I…").
pub fn parse(said: &str) -> Option<Ask> {
    let s = format!(
        " {} ",
        said.to_lowercase()
            .replace(['’', '\''], "")
            .chars()
            .map(|c| if c.is_alphanumeric() { c } else { ' ' })
            .collect::<String>()
            .split_whitespace()
            .collect::<Vec<_>>()
            .join(" ")
    );
    let has = |w: &str| s.contains(w);
    if [" how do", " how to", " how can i", " what is", " whats ", " why "].iter().any(|w| has(w)) {
        return None;
    }
    if [" dont ", " do not ", " never ", " stop "].iter().any(|w| has(w)) {
        return None;
    }
    // About the windows on screen, and asked to arrange them: "compare these
    // two phones side by side" or "Windows 10 and 11 side by side" isn't.
    let windows = [" window", " apps ", " my apps", " my screen", " the screen"].iter().any(|w| has(w));
    let layout = has(" layout");
    let verb = [" put ", " arrange", " tile", " place ", " move ", " snap ", " organi", " show ", " set ", " lay ", " split", " sort out", " tidy", " clean up"]
        .iter()
        .any(|w| has(w));
    // Undo: "undo the (window) layout", "put my windows back".
    if (has(" undo") || has(" put back") || has(" restore")) && (layout || has(" windows back") || has(" put my windows")) {
        return Some(Ask::Undo);
    }
    if has(" put my windows back") || has(" put the windows back") {
        return Some(Ask::Undo);
    }
    // "Split my screen" is about this screen; a bare "split screen" is often
    // a game's mode ("does Mario Kart have split screen?").
    if has(" split my screen") || has(" split the screen") || (has(" split screen") && windows) {
        return Some(Ask::Arrange(Kind::Side));
    }
    if has(" focus layout") {
        return Some(Ask::Arrange(Kind::Focus));
    }
    // About the windows, and asked to arrange them: "a grid layout for my
    // website" or "set the layout to two columns" is about something else.
    if !windows || !(verb || layout) {
        return None;
    }
    if has(" side by side") || has(" next to each other") || has(" half and half") {
        return Some(Ask::Arrange(Kind::Side));
    }
    if has(" grid") || (has(" tile ") && windows) || has(" tile my") || has(" tile all") {
        return Some(Ask::Arrange(Kind::Grid));
    }
    if has(" columns") || has(" column layout") {
        return Some(Ask::Arrange(Kind::Columns));
    }
    let arrange = [" arrange", " organize", " organise", " tidy up my windows", " sort out my windows", " clean up my windows"].iter().any(|w| has(w));
    if arrange && windows {
        return Some(Ask::Arrange(Kind::Grid));
    }
    None
}

/// Run what was asked and say what happened.
pub fn handle(ask: Ask) -> String {
    let done = match ask {
        Ask::Arrange(kind) => apply(kind),
        Ask::Undo => undo(),
    };
    done.unwrap_or_else(|e| e.to_string())
}

#[cfg(windows)]
mod win {
    use super::Area;
    use windows::Win32::Foundation::{HWND, LPARAM, RECT};
    use windows::Win32::Graphics::Dwm::{DwmGetWindowAttribute, DWMWA_CLOAKED, DWMWA_EXTENDED_FRAME_BOUNDS};
    use windows::Win32::Graphics::Gdi::{GetMonitorInfoW, MonitorFromWindow, MONITORINFO, MONITOR_DEFAULTTONEAREST};
    use windows::Win32::UI::WindowsAndMessaging::{
        EnumWindows, GetClassNameW, GetForegroundWindow, GetWindow, GetWindowLongW, GetWindowPlacement, GetWindowRect,
        GetWindowTextLengthW, GetWindowTextW, GetWindowThreadProcessId, IsIconic, IsWindow, IsWindowVisible, IsZoomed,
        SetWindowPlacement, SetWindowPos, ShowWindow, GWL_EXSTYLE, GWL_STYLE, GW_OWNER, SWP_NOACTIVATE, SWP_NOOWNERZORDER,
        SWP_NOZORDER, SW_RESTORE, WINDOWPLACEMENT, WS_EX_TOOLWINDOW, WS_EX_TOPMOST, WS_THICKFRAME,
    };
    use windows_core::BOOL;

    pub fn hwnd(raw: isize) -> HWND {
        HWND(raw as *mut core::ffi::c_void)
    }

    /// Every top-level window, front to back (EnumWindows' own order).
    fn all() -> Vec<isize> {
        unsafe extern "system" fn each(h: HWND, l: LPARAM) -> BOOL {
            let v = &mut *(l.0 as *mut Vec<isize>);
            v.push(h.0 as isize);
            BOOL(1)
        }
        let mut out: Vec<isize> = Vec::new();
        unsafe {
            let _ = EnumWindows(Some(each), LPARAM(&mut out as *mut _ as isize));
        }
        out
    }

    fn class(h: HWND) -> String {
        let mut buf = [0u16; 128];
        let n = unsafe { GetClassNameW(h, &mut buf) };
        String::from_utf16_lossy(&buf[..n.max(0) as usize])
    }

    pub fn title(raw: isize) -> String {
        let mut buf = [0u16; 256];
        let n = unsafe { GetWindowTextW(hwnd(raw), &mut buf) };
        String::from_utf16_lossy(&buf[..n.max(0) as usize])
    }

    fn monitor_of(h: HWND) -> (isize, Area, Area) {
        unsafe {
            let mon = MonitorFromWindow(h, MONITOR_DEFAULTTONEAREST);
            let mut info = MONITORINFO { cbSize: std::mem::size_of::<MONITORINFO>() as u32, ..Default::default() };
            let _ = GetMonitorInfoW(mon, &mut info);
            let a = |r: RECT| Area { x: r.left, y: r.top, w: r.right - r.left, h: r.bottom - r.top };
            (mon.0 as isize, a(info.rcWork), a(info.rcMonitor))
        }
    }

    /// An ordinary app window someone would want arranged.
    fn arrangeable(h: HWND, me: u32) -> bool {
        unsafe {
            let mut pid = 0u32;
            GetWindowThreadProcessId(h, Some(&mut pid));
            if pid == 0 || pid == me || !IsWindowVisible(h).as_bool() || IsIconic(h).as_bool() || GetWindowTextLengthW(h) <= 0 {
                return false;
            }
            // Owned windows are dialogs and pop-ups of another window.
            if GetWindow(h, GW_OWNER).is_ok_and(|o| !o.0.is_null()) {
                return false;
            }
            let style = GetWindowLongW(h, GWL_STYLE) as u32;
            let ex = GetWindowLongW(h, GWL_EXSTYLE) as u32;
            if ex & WS_EX_TOOLWINDOW.0 != 0 || ex & WS_EX_TOPMOST.0 != 0 || style & WS_THICKFRAME.0 == 0 {
                return false;
            }
            let mut cloaked = 0u32;
            let _ = DwmGetWindowAttribute(h, DWMWA_CLOAKED, (&mut cloaked as *mut u32).cast(), std::mem::size_of::<u32>() as u32);
            if cloaked != 0 {
                return false;
            }
            if matches!(class(h).as_str(), "Progman" | "WorkerW" | "Shell_TrayWnd" | "Shell_SecondaryTrayWnd") {
                return false;
            }
            // Full screen without being maximised: a game or a video.
            let mut r = RECT::default();
            if GetWindowRect(h, &mut r).is_err() {
                return false;
            }
            let (_, _, screen) = monitor_of(h);
            let full = r.left <= screen.x && r.top <= screen.y && r.right >= screen.x + screen.w && r.bottom >= screen.y + screen.h;
            !(full && !IsZoomed(h).as_bool())
        }
    }

    /// The screen to arrange (the one with the window in front, which is
    /// Izuki's panel when its button was pressed) and its app windows on it,
    /// the one used last first.
    pub fn windows_here() -> (Area, Vec<isize>) {
        let me = std::process::id();
        let front = unsafe { GetForegroundWindow() };
        let (mon, work, _) = monitor_of(front);
        let list = all()
            .into_iter()
            .filter(|&raw| {
                let h = hwnd(raw);
                arrangeable(h, me) && monitor_of(h).0 == mon
            })
            .collect();
        (work, list)
    }

    pub fn placement(raw: isize) -> Option<WINDOWPLACEMENT> {
        let mut p = WINDOWPLACEMENT { length: std::mem::size_of::<WINDOWPLACEMENT>() as u32, ..Default::default() };
        unsafe { GetWindowPlacement(hwnd(raw), &mut p) }.ok().map(|_| p)
    }

    pub fn restore_placement(raw: isize, p: &WINDOWPLACEMENT) -> bool {
        let h = hwnd(raw);
        unsafe { IsWindow(Some(h)).as_bool() && SetWindowPlacement(h, p).is_ok() }
    }

    /// Put the window's visible frame exactly on `to`. Windows 10/11 windows
    /// have an invisible resize border around them; it's added back so the
    /// visible edges meet with no gaps.
    pub fn place(raw: isize, to: Area) -> bool {
        let h = hwnd(raw);
        unsafe {
            if IsZoomed(h).as_bool() {
                let _ = ShowWindow(h, SW_RESTORE);
            }
            let mut r = RECT::default();
            let mut f = RECT::default();
            let (mut l, mut t, mut rt, mut b) = (0, 0, 0, 0);
            if GetWindowRect(h, &mut r).is_ok()
                && DwmGetWindowAttribute(h, DWMWA_EXTENDED_FRAME_BOUNDS, (&mut f as *mut RECT).cast(), std::mem::size_of::<RECT>() as u32).is_ok()
            {
                l = (f.left - r.left).clamp(0, 32);
                t = (f.top - r.top).clamp(0, 32);
                rt = (r.right - f.right).clamp(0, 32);
                b = (r.bottom - f.bottom).clamp(0, 32);
            }
            SetWindowPos(h, None, to.x - l, to.y - t, to.w + l + rt, to.h + t + b, SWP_NOZORDER | SWP_NOACTIVATE | SWP_NOOWNERZORDER).is_ok()
        }
    }
}

#[cfg(windows)]
static UNDO: parking_lot::Mutex<Vec<(isize, windows::Win32::UI::WindowsAndMessaging::WINDOWPLACEMENT)>> = parking_lot::Mutex::new(Vec::new());

/// "Chrome" from "New tab - Google Chrome": the short end of a title.
#[cfg(windows)]
fn short(title: &str) -> String {
    let tail = [" - ", " — ", " | "]
        .iter()
        .filter_map(|sep| title.rfind(sep).map(|i| i + sep.len()))
        .max()
        .map_or(title, |i| &title[i..]);
    let t: String = tail.trim().chars().take(28).collect();
    if t.is_empty() { "a window".into() } else { t }
}

/// Arrange the windows on this screen; one Undo for the last arrangement.
#[cfg(windows)]
pub fn apply(kind: Kind) -> Result<String> {
    let (work, list) = win::windows_here();
    if list.is_empty() {
        return Err(anyhow!("There are no app windows on this screen to arrange. Open the apps you want side by side first."));
    }
    let spots = slots(kind, list.len(), work);
    let mut saved = Vec::new();
    let mut moved = Vec::new();
    let mut refused = 0;
    for (&raw, &spot) in list.iter().zip(spots.iter()) {
        let before = win::placement(raw);
        if win::place(raw, spot) {
            if let Some(p) = before {
                saved.push((raw, p));
            }
            moved.push(short(&win::title(raw)));
        } else {
            refused += 1;
        }
    }
    if moved.is_empty() {
        return Err(anyhow!("Windows didn't let me move those windows. If they're running as administrator, only an app running as administrator can move them."));
    }
    // A new arrangement replaces the undo only when something really moved.
    *UNDO.lock() = saved;
    let left = list.len().saturating_sub(spots.len());
    let mut said = match moved.as_slice() {
        [one] => format!("{one} now fills the screen."),
        [a, b] => format!("{a} and {b} are {}.", kind.name()),
        _ => format!("{} windows are {}: {}.", moved.len(), kind.name(), moved.join(", ")),
    };
    if left > 0 {
        said.push_str(&format!(" {left} more {} where {} {}.", if left == 1 { "stays" } else { "stay" }, if left == 1 { "it" } else { "they" }, if left == 1 { "was" } else { "were" }));
    }
    if refused > 0 {
        said.push_str(&format!(" {refused} couldn't be moved (Windows protects windows run as administrator)."));
    }
    said.push_str(" Say “undo the layout” to put them back.");
    Ok(said)
}

/// Is there an arrangement to put back?
#[cfg(windows)]
pub fn can_undo() -> bool {
    !UNDO.lock().is_empty()
}

#[cfg(not(windows))]
pub fn can_undo() -> bool {
    false
}

/// Put the last arranged windows back where they were.
#[cfg(windows)]
pub fn undo() -> Result<String> {
    let saved = std::mem::take(&mut *UNDO.lock());
    if saved.is_empty() {
        return Err(anyhow!("There's no window layout to undo."));
    }
    let back = saved.iter().filter(|(raw, p)| win::restore_placement(*raw, p)).count();
    Ok(match back {
        0 => "Those windows are closed now, so there was nothing to put back.".into(),
        1 => "Put that window back where it was.".into(),
        n => format!("Put {n} windows back where they were."),
    })
}

#[cfg(not(windows))]
pub fn apply(_kind: Kind) -> Result<String> {
    Err(anyhow!("Arranging windows works on Windows."))
}

#[cfg(not(windows))]
pub fn undo() -> Result<String> {
    Err(anyhow!("Arranging windows works on Windows."))
}

#[cfg(test)]
mod tests {
    use super::*;

    const WORK: Area = Area { x: -1920, y: 0, w: 1920, h: 1040 };

    fn covers_exactly(spots: &[Area], work: Area) -> bool {
        let area: i64 = spots.iter().map(|a| a.w as i64 * a.h as i64).sum();
        let inside = spots.iter().all(|a| a.x >= work.x && a.y >= work.y && a.x + a.w <= work.x + work.w && a.y + a.h <= work.y + work.h);
        let apart = spots.iter().enumerate().all(|(i, a)| {
            spots.iter().skip(i + 1).all(|b| a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y)
        });
        inside && apart && area == work.w as i64 * work.h as i64
    }

    #[test]
    fn every_layout_fills_the_screen_with_no_overlap() {
        for kind in [Kind::Side, Kind::Focus, Kind::Columns, Kind::Grid] {
            for n in 1..=6 {
                let spots = slots(kind, n, WORK);
                assert_eq!(spots.len(), n.min(kind.most()), "{kind:?} {n}");
                assert!(covers_exactly(&spots, WORK), "{kind:?} with {n}: {spots:?}");
            }
        }
        // An odd width still adds up, pixel for pixel.
        let odd = Area { x: 0, y: 0, w: 1365, h: 767 };
        assert!(covers_exactly(&slots(Kind::Columns, 3, odd), odd));
        assert!(slots(Kind::Grid, 0, WORK).is_empty());
    }

    #[test]
    fn the_front_window_gets_the_biggest_spot() {
        let focus = slots(Kind::Focus, 3, WORK);
        assert_eq!(focus[0].w, 1280);
        assert!(focus[1].w < focus[0].w && focus[1].h < WORK.h);
        let side = slots(Kind::Side, 5, WORK);
        assert_eq!(side.len(), 2, "side by side is two");
    }

    #[test]
    fn asks_in_plain_words() {
        assert_eq!(parse("put my windows side by side"), Some(Ask::Arrange(Kind::Side)));
        assert_eq!(parse("Hey Nova, split my screen"), Some(Ask::Arrange(Kind::Side)));
        assert_eq!(parse("tile my windows"), Some(Ask::Arrange(Kind::Grid)));
        assert_eq!(parse("arrange my windows in a grid"), Some(Ask::Arrange(Kind::Grid)));
        assert_eq!(parse("put my windows in columns"), Some(Ask::Arrange(Kind::Columns)));
        assert_eq!(parse("focus layout"), Some(Ask::Arrange(Kind::Focus)));
        assert_eq!(parse("organise my windows"), Some(Ask::Arrange(Kind::Grid)));
        assert_eq!(parse("undo the window layout"), Some(Ask::Undo));
        assert_eq!(parse("put my windows back"), Some(Ask::Undo));
    }

    #[test]
    fn leaves_other_things_alone() {
        assert_eq!(parse("focus for 25 minutes"), None, "Focus mode, not a layout");
        assert_eq!(parse("how do I put windows side by side"), None, "a question");
        assert_eq!(parse("open a new window"), None);
        assert_eq!(parse("don't move my windows"), None);
        assert_eq!(parse("make a grid in excel"), None);
        assert_eq!(parse("undo that"), None);
        assert_eq!(parse("arrange the desktop icons"), None);
        assert_eq!(parse("compare these two phones side by side"), None, "a question for the chat");
        assert_eq!(parse("compare windows 10 and windows 11 side by side"), None);
        assert_eq!(parse("I want a grid layout for my website"), None, "CSS, not windows");
        assert_eq!(parse("set the layout to two columns"), None, "a document's layout");
        assert_eq!(parse("does Mario Kart have split screen"), None, "a game's mode");
        assert_eq!(parse("set up split screen for Minecraft"), None);
        assert_eq!(parse("put my windows in a grid layout"), Some(Ask::Arrange(Kind::Grid)));
    }

    #[cfg(windows)]
    #[test]
    fn a_title_is_shortened_to_the_app() {
        assert_eq!(short("New Tab - Google Chrome"), "Google Chrome");
        assert_eq!(short("Notes — Izuki | Work"), "Work");
        assert_eq!(short("Calculator"), "Calculator");
        assert_eq!(short(""), "a window");
    }
}
