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
//!
//! One app by name: "put Chrome on the left", "move Spotify to my other
//! screen", "Discord in the top right corner", "center Notepad", "make VS
//! Code full screen". Only when that app has a window open; "undo the
//! layout" puts it back.
//!
//! Saved layouts: "save my windows as Work" remembers where every app window
//! is, on every screen; "set up my Work layout" puts each one back, opening
//! the apps that aren't running yet (ordinary installed apps only, never
//! Store apps, File Explorer or Izuki), and "undo the layout" undoes that too.

use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};

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
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Ask {
    Arrange(Kind),
    Undo,
    /// "Save my windows as Work".
    Save(String),
    /// "Set up my Work layout".
    Restore(String),
    /// "Delete my Work layout".
    Forget(String),
    /// "Put Chrome on the left": one app (by name; "" = the window in front) to a spot.
    Place(String, Zone),
}

/// Where one app goes.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Zone {
    Left,
    Right,
    Top,
    Bottom,
    TopLeft,
    TopRight,
    BottomLeft,
    BottomRight,
    Center,
    Full,
    OtherScreen,
}

impl Zone {
    fn name(self) -> &'static str {
        match self {
            Zone::Left => "on the left half",
            Zone::Right => "on the right half",
            Zone::Top => "on the top half",
            Zone::Bottom => "on the bottom half",
            Zone::TopLeft => "in the top-left corner",
            Zone::TopRight => "in the top-right corner",
            Zone::BottomLeft => "in the bottom-left corner",
            Zone::BottomRight => "in the bottom-right corner",
            Zone::Center => "in the middle",
            Zone::Full => "full screen",
            Zone::OtherScreen => "on your other screen",
        }
    }

    /// Its rectangle in a screen's work area (none for full screen or
    /// another screen, which aren't a spot on this one). Halves and quarters
    /// cover the area exactly; the middle is 70% by 80%, centred.
    pub fn area(self, work: Area) -> Option<Area> {
        let xs = split(work.x, work.w, 2);
        let ys = split(work.y, work.h, 2);
        let at = |(x, w): (i32, i32), (y, h): (i32, i32)| Area { x, y, w, h };
        let whole_x = (work.x, work.w);
        let whole_y = (work.y, work.h);
        Some(match self {
            Zone::Left => at(xs[0], whole_y),
            Zone::Right => at(xs[1], whole_y),
            Zone::Top => at(whole_x, ys[0]),
            Zone::Bottom => at(whole_x, ys[1]),
            Zone::TopLeft => at(xs[0], ys[0]),
            Zone::TopRight => at(xs[1], ys[0]),
            Zone::BottomLeft => at(xs[0], ys[1]),
            Zone::BottomRight => at(xs[1], ys[1]),
            Zone::Center => {
                let (w, h) = (work.w * 7 / 10, work.h * 8 / 10);
                Area { x: work.x + (work.w - w) / 2, y: work.y + (work.h - h) / 2, w, h }
            }
            Zone::Full | Zone::OtherScreen => return None,
        })
    }
}

/// The spot named in a sentence (corners before halves: "top left" isn't "left").
fn spot_in(s: &str) -> Option<Zone> {
    let has = |w: &str| s.contains(w);
    let any = |ws: &[&str]| ws.iter().any(|w| has(w));
    if any(&[" other screen", " other monitor", " other display", " second screen", " second monitor", " second display", " next screen", " next monitor"]) {
        return Some(Zone::OtherScreen);
    }
    if any(&[" top left", " upper left"]) {
        return Some(Zone::TopLeft);
    }
    if any(&[" top right", " upper right"]) {
        return Some(Zone::TopRight);
    }
    if any(&[" bottom left", " lower left"]) {
        return Some(Zone::BottomLeft);
    }
    if any(&[" bottom right", " lower right"]) {
        return Some(Zone::BottomRight);
    }
    if any(&[" full screen ", " fullscreen ", " maximize ", " maximise ", " maximized ", " maximised "]) {
        return Some(Zone::Full);
    }
    if any(&[" center ", " centre ", " middle "]) {
        return Some(Zone::Center);
    }
    if any(&[" top half", " upper half", " top of the screen", " top of my screen"]) {
        return Some(Zone::Top);
    }
    if any(&[" bottom half", " lower half", " bottom of the screen", " bottom of my screen"]) {
        return Some(Zone::Bottom);
    }
    if has(" left ") {
        return Some(Zone::Left);
    }
    if has(" right ") {
        return Some(Zone::Right);
    }
    None
}

/// Words that never name one app ("put my windows on the left").
const NOT_ONE_APP: &[&str] = &["windows", "apps", "everything", "all", "all of them", "them", "all my windows", "both"];

/// "Put Chrome on the left", "move Spotify to my other screen", "center
/// Notepad", "make VS Code full screen", "maximize Discord". The app is the
/// words between the verb and where it goes; "it", "this" or "the window"
/// is the window in front ("").
fn parse_place(s: &str) -> Option<Ask> {
    let spot = spot_in(s)?;
    let verbs = [" put ", " move ", " snap ", " send ", " throw ", " drag ", " make ", " place ", " push ", " stick ", " center ", " centre ", " maximize ", " maximise "];
    let verb = verbs.iter().find(|v| s.starts_with(*v))?;
    let rest = &s[verb.len() - 1..];
    // The app ends where the place begins.
    let stops = [" on ", " to ", " in ", " into ", " onto ", " at ", " over ", " full ", " fullscreen ", " so ", " please "];
    let end = stops.iter().filter_map(|w| rest.find(w)).min().unwrap_or(rest.len());
    let mut app = rest[..end].trim();
    for lead in ["the ", "my ", "that ", "this "] {
        if let Some(r) = app.strip_prefix(lead) {
            app = r;
        }
    }
    for tail in [" window", " app", " please"] {
        if let Some(r) = app.strip_suffix(tail) {
            app = r;
        }
    }
    let app = app.trim();
    if NOT_ONE_APP.contains(&app) || app.split_whitespace().count() > 4 {
        return None;
    }
    // "Center it", "move this to my other screen": the window in front.
    let app = if ["", "it", "this", "that", "window", "the window", "this window"].contains(&app) { "" } else { app };
    // A verb that only means placing ("center", "maximize") needs no "on"/"to".
    if app.is_empty() && !matches!(*verb, " center " | " centre " | " maximize " | " maximise ") && end == rest.len() {
        return None;
    }
    // The window in front, said the everyday way ("snap left", "maximize it",
    // "make it full screen", which means the video): instant.rs already does
    // those, and "full screen" for the window in front is a video's.
    if app.is_empty() && (spot == Zone::Full || crate::instant::parse(s.trim()).is_some()) {
        return None;
    }
    // "Center this" in a document is the text; "put this in the corner" in a
    // design app is a shape. With no app named, only another screen, or
    // saying "window", means the window.
    if app.is_empty() && spot != Zone::OtherScreen && !s.contains(" window") {
        return None;
    }
    Some(Ask::Place(app.to_string(), spot))
}

/// The exe names people mean by an app's everyday name.
const APP_ALIASES: &[(&str, &str)] = &[
    ("vs code", "code"),
    ("vscode", "code"),
    ("visual studio code", "code"),
    ("word", "winword"),
    ("microsoft word", "winword"),
    ("powerpoint", "powerpnt"),
    ("edge", "msedge"),
    ("microsoft edge", "msedge"),
    ("file explorer", "explorer"),
    ("files", "explorer"),
    ("terminal", "windowsterminal"),
    ("windows terminal", "windowsterminal"),
    ("teams", "ms-teams"),
    ("obs", "obs64"),
    ("fl studio", "fl64"),
    ("after effects", "afterfx"),
    ("premiere", "adobe premiere pro"),
    ("premiere pro", "adobe premiere pro"),
    ("google chrome", "chrome"),
];

/// The open window that's `name`: by program first ("chrome" → chrome.exe),
/// then by the app's name in its title. The one used last wins a tie (the
/// list is front to back). `open` is (window, program path, title).
fn app_named(name: &str, open: &[(isize, String, String)]) -> Option<isize> {
    let want = name.to_lowercase();
    let squashed: String = want.split_whitespace().collect();
    let exe_wanted = APP_ALIASES.iter().find(|(n, _)| *n == want).map(|(_, e)| *e);
    let mut best: Option<(u8, isize)> = None;
    for (raw, exe, title) in open {
        let stem = exe.rsplit(['\\', '/']).next().unwrap_or("").to_lowercase();
        let stem = stem.trim_end_matches(".exe");
        let app = short_of(title).to_lowercase();
        let title_l = format!(" {} ", title.to_lowercase().split(|c: char| !c.is_alphanumeric()).filter(|w| !w.is_empty()).collect::<Vec<_>>().join(" "));
        let score = if exe_wanted.is_some_and(|e| stem == e) || stem == squashed {
            4
        } else if app == want {
            3
        } else if squashed.len() >= 4 && stem.contains(&squashed) {
            2
        } else if want.len() >= 3 && title_l.contains(&format!(" {want} ")) {
            1
        } else {
            0
        };
        if score > 0 && best.is_none_or(|(b, _)| score > b) {
            best = Some((score, *raw));
        }
    }
    best.map(|(_, raw)| raw)
}

/// Names that are already a built-in layout or mean "the windows".
const NOT_A_NAME: &[&str] = &[
    "window", "windows", "screen", "desktop", "focus", "grid", "column", "columns", "side by side", "split", "split screen", "old", "last", "previous",
    "current", "this", "app", "apps", "keyboard", "page", "slide", "document",
];

/// "Work" from " work ": a saved layout's name as said, tidied.
fn name_of(words: &str) -> Option<String> {
    let w = words.trim();
    let w = w.strip_prefix("the ").unwrap_or(w);
    if w.is_empty() || w.split_whitespace().count() > 4 || NOT_A_NAME.contains(&w) {
        return None;
    }
    let mut c = w.chars();
    c.next().map(|f| f.to_uppercase().chain(c).collect())
}

/// A saved layout named in a sentence: after "as", "called" or "named"
/// ("save my windows as Work"), or between "my"/"the" and "layout"/"setup"
/// ("set up my work layout").
fn saved_name(s: &str) -> Option<String> {
    for lead in [" as ", " called ", " named "] {
        if let Some(i) = s.rfind(lead) {
            let rest = &s[i + lead.len()..];
            let rest = rest.trim_end().trim_end_matches(" please").trim_end_matches(" layout").trim_end_matches(" setup");
            return name_of(&format!(" {rest} ").replace(" my ", " "));
        }
    }
    for tail in [" layout", " setup"] {
        let Some(end) = s.find(tail) else { continue };
        let before = &s[..end];
        let start = [" my ", " the "].iter().filter_map(|w| before.rfind(w).map(|i| i + w.len())).max()?;
        return name_of(&before[start..]);
    }
    None
}

/// Saving, setting up or deleting a saved layout, if that's what's asked.
fn parse_saved(s: &str) -> Option<Ask> {
    let has = |w: &str| s.contains(w);
    let about = has(" layout") || has(" setup") || has(" my windows") || has(" these windows") || has(" this window setup");
    if !about {
        return None;
    }
    if [" save ", " remember "].iter().any(|w| has(w)) {
        // "Save this layout as Work", "save my windows as Coding". Without a
        // name, only an explicit window layout ("save my window layout"); a
        // bare "save the layout" may be a document's.
        if let Some(n) = saved_name(s) {
            return Some(Ask::Save(n));
        }
        if has(" window layout") || has(" window setup") || has(" windows layout") {
            return Some(Ask::Save("My layout".into()));
        }
        return None;
    }
    if [" delete ", " forget ", " remove "].iter().any(|w| has(w)) {
        return saved_name(s).map(Ask::Forget);
    }
    let opens = [" set up ", " setup my ", " restore ", " load ", " open ", " bring back ", " switch to ", " use ", " go to ", " start ", " put on "].iter().any(|w| has(w));
    if opens && (has(" layout") || has(" setup")) {
        return saved_name(s).map(Ask::Restore);
    }
    None
}

/// "Put my windows side by side", "tile my windows", "split my screen",
/// "grid layout", "focus layout", "undo the window layout". `None` for
/// anything else, and for questions about how to do it ("how do I…").
pub fn parse(said: &str) -> Option<Ask> {
    let mut s = format!(
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
    // "Hey Nova, …" is a wake phrase, not part of the request.
    for wake in [" hey nova ", " hi nova ", " ok nova ", " okay nova ", " hey izuki ", " nova ", " izuki "] {
        if let Some(rest) = s.strip_prefix(wake) {
            s = format!(" {rest}");
            break;
        }
    }
    let has = |w: &str| s.contains(w);
    if [" how do", " how to", " how can i", " what is", " whats ", " why "].iter().any(|w| has(w)) {
        return None;
    }
    if [" dont ", " do not ", " never ", " stop "].iter().any(|w| has(w)) {
        return None;
    }
    if let Some(ask) = parse_saved(&s) {
        return Some(ask);
    }
    if let Some(ask) = parse_place(&s) {
        return Some(ask);
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
    // "Focus layout" on its own, or for the windows; not "a focus layout
    // for my website".
    let short = s.split_whitespace().count() <= 5 && !has(" for ") && !has(" in my ") && !has(" on my ");
    if has(" focus layout") && (windows || short) {
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

/// Whether a request is really for the windows. Setting up or deleting a
/// saved layout counts when you have one by that name, or say "layout"; a
/// "setup" that isn't one of yours ("load my coding setup" with none saved)
/// is left for the rest of Izuki.
pub fn claims(ask: &Ask, said: &str) -> bool {
    match ask {
        Ask::Restore(name) | Ask::Forget(name) => saved().iter().any(|s| s.name.eq_ignore_ascii_case(name)) || said.to_lowercase().contains("layout"),
        // "Put the chicken in the oven" names no window: not ours.
        Ask::Place(app, _) => app.is_empty() || window_for(app).is_some(),
        _ => true,
    }
}

/// Run what was asked and say what happened.
pub fn handle(ask: Ask) -> String {
    let done = match ask {
        Ask::Arrange(kind) => apply(kind),
        Ask::Undo => undo(),
        Ask::Save(name) => save(&name),
        Ask::Restore(name) => restore(&name),
        Ask::Forget(name) => forget(&name).map(|_| format!("Deleted your {name} layout.")),
        Ask::Place(app, spot) => place_app(&app, spot),
    };
    done.unwrap_or_else(|e| e.to_string())
}

#[cfg(windows)]
mod win {
    use super::Area;
    use windows::Win32::Foundation::{HWND, LPARAM, RECT};
    use windows::Win32::Graphics::Dwm::{DwmGetWindowAttribute, DWMWA_CLOAKED, DWMWA_EXTENDED_FRAME_BOUNDS};
    use windows::Win32::Graphics::Gdi::{EnumDisplayMonitors, GetMonitorInfoW, MonitorFromWindow, HDC, HMONITOR, MONITORINFO, MONITOR_DEFAULTTONEAREST};
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
        app_window(h, me, false)
    }

    /// `arrangeable`, or one minimised to the taskbar when `minimised_ok`.
    fn app_window(h: HWND, me: u32, minimised_ok: bool) -> bool {
        unsafe {
            let mut pid = 0u32;
            GetWindowThreadProcessId(h, Some(&mut pid));
            if pid == 0 || pid == me || !IsWindowVisible(h).as_bool() || (IsIconic(h).as_bool() && !minimised_ok) || GetWindowTextLengthW(h) <= 0 {
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
            if IsIconic(h).as_bool() {
                return true;
            }
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

    /// Every screen: (its id, its work area), in Windows' order.
    pub fn monitors() -> Vec<(isize, Area)> {
        unsafe extern "system" fn each(m: HMONITOR, _: HDC, _: *mut RECT, l: LPARAM) -> BOOL {
            let v = &mut *(l.0 as *mut Vec<(isize, Area)>);
            let mut info = MONITORINFO { cbSize: std::mem::size_of::<MONITORINFO>() as u32, ..Default::default() };
            if GetMonitorInfoW(m, &mut info).as_bool() {
                let r = info.rcWork;
                v.push((m.0 as isize, Area { x: r.left, y: r.top, w: r.right - r.left, h: r.bottom - r.top }));
            }
            BOOL(1)
        }
        let mut out: Vec<(isize, Area)> = Vec::new();
        unsafe {
            let _ = EnumDisplayMonitors(None, None, Some(each), LPARAM(&mut out as *mut _ as isize));
        }
        out
    }

    /// The screen a window is on: (its id, its work area).
    pub fn screen_of(raw: isize) -> (isize, Area) {
        let (m, work, _) = monitor_of(hwnd(raw));
        (m, work)
    }

    /// The window's outer rectangle, and whether it's maximised or minimised.
    pub fn rect_of(raw: isize) -> Option<(Area, bool, bool)> {
        let h = hwnd(raw);
        let mut r = RECT::default();
        unsafe {
            GetWindowRect(h, &mut r).ok()?;
            Some((Area { x: r.left, y: r.top, w: r.right - r.left, h: r.bottom - r.top }, IsZoomed(h).as_bool(), IsIconic(h).as_bool()))
        }
    }

    pub fn show(raw: isize, how: windows::Win32::UI::WindowsAndMessaging::SHOW_WINDOW_CMD) {
        unsafe {
            let _ = ShowWindow(hwnd(raw), how);
        }
    }

    /// The app window in front (not Izuki's own), if any.
    pub fn front_app() -> Option<isize> {
        let me = std::process::id();
        let front = unsafe { GetForegroundWindow() };
        if !front.0.is_null() && app_window(front, me, false) {
            return Some(front.0 as isize);
        }
        app_windows(false).into_iter().next()
    }

    /// Every app window on every screen, front to back (`minimised_ok`:
    /// ones on the taskbar too).
    pub fn app_windows(minimised_ok: bool) -> Vec<isize> {
        let me = std::process::id();
        all().into_iter().filter(|&raw| app_window(hwnd(raw), me, minimised_ok)).collect()
    }

    /// The program behind a window ("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe").
    pub fn exe_of(raw: isize) -> String {
        use windows::core::PWSTR;
        use windows::Win32::Foundation::CloseHandle;
        use windows::Win32::System::Threading::{OpenProcess, QueryFullProcessImageNameW, PROCESS_NAME_WIN32, PROCESS_QUERY_LIMITED_INFORMATION};
        unsafe {
            let mut pid = 0u32;
            GetWindowThreadProcessId(hwnd(raw), Some(&mut pid));
            let Ok(p) = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid) else { return String::new() };
            let mut path = [0u16; 520];
            let mut len = path.len() as u32;
            let ok = QueryFullProcessImageNameW(p, PROCESS_NAME_WIN32, PWSTR(path.as_mut_ptr()), &mut len).is_ok();
            let _ = CloseHandle(p);
            if ok { String::from_utf16_lossy(&path[..len as usize]) } else { String::new() }
        }
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

/// Where one window was, as Windows describes it (its normal size and
/// spot, and whether it was maximised), so it comes back exactly.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Spot {
    pub show: u32,
    pub flags: u32,
    pub min: (i32, i32),
    pub max: (i32, i32),
    /// left, top, right, bottom.
    pub normal: (i32, i32, i32, i32),
}

/// One window in a saved layout.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SavedWindow {
    /// The program, for finding (or opening) it again.
    pub exe: String,
    /// Its short name for messages ("Google Chrome").
    pub app: String,
    /// Its title then, to tell two windows of one app apart.
    pub title: String,
    pub spot: Spot,
}

/// A saved layout: "Work", "Coding", "Movie night".
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Saved {
    pub name: String,
    /// When (Unix seconds).
    pub at: u64,
    pub windows: Vec<SavedWindow>,
}

/// The most layouts kept.
const MOST_SAVED: usize = 12;

fn saved_path() -> std::path::PathBuf {
    crate::store::data_dir().join("layouts.json")
}

/// Your saved layouts, newest first.
pub fn saved() -> Vec<Saved> {
    let mut list: Vec<Saved> = std::fs::read_to_string(saved_path()).ok().and_then(|r| serde_json::from_str(&r).ok()).unwrap_or_default();
    list.sort_by(|a, b| b.at.cmp(&a.at));
    list
}

/// `saved`, for a change: a file that's there but can't be read is kept
/// aside as `layouts.json.bad` first, so saving a new layout never
/// overwrites layouts that might still be recovered.
fn saved_for_change() -> Result<Vec<Saved>> {
    let path = saved_path();
    if let Ok(raw) = std::fs::read_to_string(&path) {
        if serde_json::from_str::<Vec<Saved>>(&raw).is_err() {
            // Its own name each time, so an earlier backup is never replaced.
            let stamp = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).map_or(0, |d| d.as_secs());
            let aside = path.with_extension(format!("json.bad-{stamp}"));
            std::fs::rename(&path, &aside).map_err(|e| anyhow!("your saved layouts file couldn't be read or set aside ({e}), so nothing was changed"))?;
            eprintln!("[arrange] layouts.json couldn't be read; kept it as {}", aside.display());
        }
    }
    Ok(saved())
}

/// One change to the saved layouts at a time (the Style tab and the phone
/// could save at the same moment).
static SAVED_TURN: parking_lot::Mutex<()> = parking_lot::Mutex::new(());

/// Written whole: a new file, then swapped in, so a power cut mid-write
/// never leaves half a list (which would read as no layouts at all).
fn write_saved(list: &[Saved]) -> Result<()> {
    let path = saved_path();
    if let Some(d) = path.parent() {
        std::fs::create_dir_all(d)?;
    }
    let fresh = path.with_extension("json.new");
    std::fs::write(&fresh, serde_json::to_string_pretty(list)?).map_err(|e| anyhow!("couldn't save the layout ({e})"))?;
    std::fs::rename(&fresh, &path).map_err(|e| anyhow!("couldn't save the layout ({e})"))
}

fn find_saved<'a>(list: &'a [Saved], name: &str) -> Option<&'a Saved> {
    list.iter().find(|s| s.name.eq_ignore_ascii_case(name.trim()))
}

/// A name for a saved layout: trimmed, short, not a built-in one.
fn clean_name(name: &str) -> Result<String> {
    let n: String = name.split_whitespace().collect::<Vec<_>>().join(" ").chars().take(32).collect();
    if n.is_empty() {
        return Err(anyhow!("Give the layout a name, like Work or Coding."));
    }
    if NOT_A_NAME.contains(&n.to_lowercase().as_str()) {
        return Err(anyhow!("“{n}” is already one of my built-in layouts — pick another name, like Work or Coding."));
    }
    Ok(n)
}

/// Delete a saved layout.
pub fn forget(name: &str) -> Result<()> {
    let _turn = SAVED_TURN.lock();
    let mut list = saved_for_change()?;
    let before = list.len();
    list.retain(|s| !s.name.eq_ignore_ascii_case(name.trim()));
    if list.len() == before {
        return Err(anyhow!("You don't have a layout called {name}."));
    }
    write_saved(&list)
}

/// A program Izuki may open again for a layout: an ordinary installed app.
/// Never Store apps (they can't be started from their file), File Explorer,
/// Windows' own hosts, consoles or Izuki.
fn may_open(exe: &str) -> bool {
    let lower = exe.to_lowercase();
    let file = lower.rsplit(['\\', '/']).next().unwrap_or("");
    let hosts = [
        "applicationframehost.exe", "explorer.exe", "izuki.exe", "systemsettings.exe", "searchhost.exe", "shellexperiencehost.exe", "textinputhost.exe",
        "lockapp.exe", "cmd.exe", "powershell.exe", "pwsh.exe", "conhost.exe", "taskmgr.exe", "mmc.exe", "regedit.exe",
    ];
    lower.ends_with(".exe") && !lower.contains("\\windowsapps\\") && !hosts.contains(&file) && std::path::Path::new(exe).is_file()
}

/// The open window that's most likely the saved one: the same program, and
/// the same title if there is one; `taken` windows are already placed.
fn best_match(want: &SavedWindow, open: &[(isize, String, String)], taken: &[isize]) -> Option<isize> {
    let same_exe: Vec<&(isize, String, String)> = open.iter().filter(|(raw, exe, _)| !taken.contains(raw) && !exe.is_empty() && exe.eq_ignore_ascii_case(&want.exe)).collect();
    if let Some((raw, _, _)) = same_exe.iter().find(|(_, _, t)| *t == want.title) {
        return Some(*raw);
    }
    // Store apps all run in one host: tell them apart by the app's name.
    if want.exe.to_lowercase().ends_with("applicationframehost.exe") {
        return same_exe.iter().find(|(_, _, t)| short_of(t) == want.app).map(|(r, _, _)| *r);
    }
    same_exe.first().map(|(raw, _, _)| *raw)
}

/// "Chrome" from "New tab - Google Chrome": the short end of a title.
fn short_of(title: &str) -> String {
    let tail = [" - ", " — ", " | "].iter().filter_map(|sep| title.rfind(sep).map(|i| i + sep.len())).max().map_or(title, |i| &title[i..]);
    let t: String = tail.trim().chars().take(28).collect();
    if t.is_empty() { "a window".into() } else { t }
}

#[cfg(windows)]
fn spot_of(p: &windows::Win32::UI::WindowsAndMessaging::WINDOWPLACEMENT) -> Spot {
    Spot {
        show: p.showCmd,
        flags: p.flags.0,
        min: (p.ptMinPosition.x, p.ptMinPosition.y),
        max: (p.ptMaxPosition.x, p.ptMaxPosition.y),
        normal: (p.rcNormalPosition.left, p.rcNormalPosition.top, p.rcNormalPosition.right, p.rcNormalPosition.bottom),
    }
}

#[cfg(windows)]
fn placement_of(s: &Spot) -> windows::Win32::UI::WindowsAndMessaging::WINDOWPLACEMENT {
    use windows::Win32::Foundation::{POINT, RECT};
    use windows::Win32::UI::WindowsAndMessaging::{WINDOWPLACEMENT, WINDOWPLACEMENT_FLAGS};
    // A layout never brings a window back minimised.
    let show = if s.show == 2 || s.show == 6 || s.show == 7 { 1 } else { s.show };
    WINDOWPLACEMENT {
        length: std::mem::size_of::<WINDOWPLACEMENT>() as u32,
        flags: WINDOWPLACEMENT_FLAGS(s.flags),
        showCmd: show,
        ptMinPosition: POINT { x: s.min.0, y: s.min.1 },
        ptMaxPosition: POINT { x: s.max.0, y: s.max.1 },
        rcNormalPosition: RECT { left: s.normal.0, top: s.normal.1, right: s.normal.2, bottom: s.normal.3 },
    }
}

/// Remember where every app window is now, on every screen, as `name`.
#[cfg(windows)]
pub fn save(name: &str) -> Result<String> {
    let name = clean_name(name)?;
    let windows: Vec<SavedWindow> = win::app_windows(false)
        .into_iter()
        .filter_map(|raw| {
            let p = win::placement(raw)?;
            let title = win::title(raw);
            Some(SavedWindow { exe: win::exe_of(raw), app: short_of(&title), title, spot: spot_of(&p) })
        })
        .collect();
    if windows.is_empty() {
        return Err(anyhow!("There are no app windows open to save. Open and place the apps you want, then save."));
    }
    let _turn = SAVED_TURN.lock();
    let mut list = saved_for_change()?;
    let replaced = find_saved(&list, &name).is_some();
    list.retain(|s| !s.name.eq_ignore_ascii_case(&name));
    list.insert(0, Saved { name: name.clone(), at: std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).map_or(0, |d| d.as_secs()), windows: windows.clone() });
    list.truncate(MOST_SAVED);
    write_saved(&list)?;
    crate::actlog::record("style", &format!("Saved your windows as the {name} layout"));
    let apps: Vec<String> = windows.iter().map(|w| w.app.clone()).collect();
    Ok(format!(
        "{} {name}: {} window{} ({}). Say “set up my {name} layout” any time to get it back.",
        if replaced { "Updated" } else { "Saved" },
        windows.len(),
        if windows.len() == 1 { "" } else { "s" },
        apps.join(", ")
    ))
}

/// Put every window of a saved layout back where it was, opening the apps
/// that aren't running (and waiting a little for them). "Undo the layout"
/// puts things back as they were before.
#[cfg(windows)]
pub fn restore(name: &str) -> Result<String> {
    let list = saved();
    let Some(layout) = find_saved(&list, name) else {
        let names: Vec<String> = list.iter().map(|s| s.name.clone()).collect();
        return Err(anyhow!(if names.is_empty() {
            format!("You don't have a layout called {name} yet. Place your windows, then say “save my windows as {name}”.")
        } else {
            format!("You don't have a layout called {name}. Yours: {}.", names.join(", "))
        }));
    };
    let mut taken: Vec<isize> = Vec::new();
    let mut undo = Vec::new();
    let mut placed: Vec<String> = Vec::new();
    let mut opened: Vec<String> = Vec::new();
    let mut missing: Vec<&SavedWindow> = Vec::new();
    let open_now = || -> Vec<(isize, String, String)> { win::app_windows(true).into_iter().map(|r| (r, win::exe_of(r), win::title(r))).collect() };
    let open = open_now();
    for w in &layout.windows {
        match best_match(w, &open, &taken) {
            Some(raw) => {
                if let Some(before) = win::placement(raw) {
                    if win::restore_placement(raw, &placement_of(&w.spot)) {
                        undo.push((raw, before));
                        placed.push(w.app.clone());
                    }
                }
                taken.push(raw);
            }
            None => missing.push(w),
        }
    }
    // Start what isn't running (once per program), then place each as its window appears.
    let mut started: Vec<String> = Vec::new();
    let mut cant_open: Vec<String> = Vec::new();
    for w in &missing {
        if started.iter().any(|e| e.eq_ignore_ascii_case(&w.exe)) {
            continue;
        }
        if may_open(&w.exe) && open_program(&w.exe) {
            started.push(w.exe.clone());
        } else {
            cant_open.push(w.app.clone());
        }
    }
    let mut waiting: Vec<&SavedWindow> = missing.iter().copied().filter(|w| started.iter().any(|e| e.eq_ignore_ascii_case(&w.exe))).collect();
    let until = std::time::Instant::now() + std::time::Duration::from_secs(15);
    while !waiting.is_empty() && std::time::Instant::now() < until {
        std::thread::sleep(std::time::Duration::from_millis(400));
        let open = open_now();
        waiting.retain(|w| {
            let Some(raw) = best_match(w, &open, &taken) else { return true };
            // A fresh window: let it finish drawing before it's moved.
            std::thread::sleep(std::time::Duration::from_millis(300));
            if win::restore_placement(raw, &placement_of(&w.spot)) {
                opened.push(w.app.clone());
            }
            taken.push(raw);
            false
        });
    }
    let slow: Vec<String> = waiting.iter().map(|w| w.app.clone()).collect();
    if !undo.is_empty() {
        *UNDO.lock() = undo;
    }
    if placed.is_empty() && opened.is_empty() {
        return Err(anyhow!("None of the {} layout's apps could be placed. {}", layout.name, if cant_open.is_empty() { "They may still be starting — try again in a moment." } else { "Open them first, then say it again." }));
    }
    crate::actlog::record("style", &format!("Set up the {} layout ({} window{})", layout.name, placed.len() + opened.len(), if placed.len() + opened.len() == 1 { "" } else { "s" }));
    let mut said = format!("Your {} layout is set up", layout.name);
    if !placed.is_empty() {
        said.push_str(&format!(": {}", placed.join(", ")));
    }
    if !opened.is_empty() {
        said.push_str(&format!("{} opened {} for you", if placed.is_empty() { ": I" } else { ", and I" }, opened.join(", ")));
    }
    said.push('.');
    if !slow.is_empty() {
        said.push_str(&format!(" {} {} still starting — say it again once {} open.", slow.join(", "), if slow.len() == 1 { "is" } else { "are" }, if slow.len() == 1 { "it's" } else { "they're" }));
    }
    if !cant_open.is_empty() {
        said.push_str(&format!(" I can't open {} myself — open {} and say it again.", cant_open.join(", "), if cant_open.len() == 1 { "it" } else { "them" }));
    }
    if !UNDO.lock().is_empty() {
        said.push_str(" Say “undo the layout” to put things back.");
    }
    Ok(said)
}

/// The open window for an app named in words ("chrome", "vs code").
#[cfg(windows)]
fn window_for(app: &str) -> Option<isize> {
    let open: Vec<(isize, String, String)> = win::app_windows(true).into_iter().map(|r| (r, win::exe_of(r), win::title(r))).collect();
    app_named(app, &open)
}

#[cfg(not(windows))]
fn window_for(_app: &str) -> Option<isize> {
    None
}

/// Where a window lands on another screen: the same place and size,
/// relative to each screen's work area, kept inside the new one.
fn onto(rect: Area, from: Area, to: Area) -> Area {
    let scale = |v: i32, a: i32, b: i32| if a > 0 { (v as i64 * b as i64 / a as i64) as i32 } else { v };
    let w = scale(rect.w, from.w, to.w).clamp(200.min(to.w), to.w);
    let h = scale(rect.h, from.h, to.h).clamp(150.min(to.h), to.h);
    let x = (to.x + scale(rect.x - from.x, from.w, to.w)).clamp(to.x, to.x + to.w - w);
    let y = (to.y + scale(rect.y - from.y, from.h, to.h)).clamp(to.y, to.y + to.h - h);
    Area { x, y, w, h }
}

/// "Put Chrome on the left": that app's window to the spot ("" = the window
/// in front). "Undo the layout" puts it back.
#[cfg(windows)]
pub fn place_app(app: &str, spot: Zone) -> Result<String> {
    use windows::Win32::UI::WindowsAndMessaging::{SW_MAXIMIZE, SW_RESTORE};
    let raw = if app.is_empty() { win::front_app() } else { window_for(app) }
        .ok_or_else(|| anyhow!(if app.is_empty() { "There's no app window in front to move.".to_string() } else { format!("I don't see {app} open. Open it first, then say it again.") }))?;
    let shown = if app.is_empty() { short_of(&win::title(raw)) } else { short_of(&win::title(raw)).chars().next().map_or_else(|| app.to_string(), |_| short_of(&win::title(raw))) };
    let before = win::placement(raw).ok_or_else(|| anyhow!("Windows didn't say where {shown} is."))?;
    let (rect, maximised, minimised) = win::rect_of(raw).ok_or_else(|| anyhow!("Windows didn't say where {shown} is."))?;
    let (screen, work) = win::screen_of(raw);
    let moved = match spot {
        Zone::Full => {
            win::show(raw, SW_MAXIMIZE);
            true
        }
        Zone::OtherScreen => {
            let screens = win::monitors();
            if screens.len() < 2 {
                return Err(anyhow!("You have one screen, so there's no other screen to move {shown} to."));
            }
            let at = screens.iter().position(|(m, _)| *m == screen).unwrap_or(0);
            let (_, next) = screens[(at + 1) % screens.len()];
            if maximised || minimised {
                win::show(raw, SW_RESTORE);
            }
            // A restored window's own size, not the maximised one.
            let base = if maximised || minimised { win::rect_of(raw).map_or(rect, |(r, _, _)| r) } else { rect };
            let ok = win::place(raw, onto(base, work, next));
            if ok && maximised {
                win::show(raw, SW_MAXIMIZE);
            }
            ok
        }
        _ => {
            if minimised {
                win::show(raw, SW_RESTORE);
            }
            spot.area(work).is_some_and(|to| win::place(raw, to))
        }
    };
    if !moved {
        return Err(anyhow!("Windows didn't let me move {shown}. If it runs as administrator, only an app running as administrator can move it."));
    }
    *UNDO.lock() = vec![(raw, before)];
    crate::actlog::record("style", &format!("Moved {shown} {}", spot.name()));
    Ok(format!("{shown} is {}. Say “undo the layout” to put it back.", spot.name()))
}

#[cfg(not(windows))]
pub fn place_app(_app: &str, _spot: Zone) -> Result<String> {
    Err(anyhow!("Moving windows works on Windows."))
}

/// Start a program from its file, on its own (not tied to Izuki).
#[cfg(windows)]
fn open_program(exe: &str) -> bool {
    use std::os::windows::process::CommandExt;
    const DETACHED_PROCESS: u32 = 0x0000_0008;
    let dir = std::path::Path::new(exe).parent().map(std::path::Path::to_path_buf);
    let mut c = std::process::Command::new(exe);
    c.stdin(std::process::Stdio::null()).stdout(std::process::Stdio::null()).stderr(std::process::Stdio::null()).creation_flags(DETACHED_PROCESS);
    if let Some(d) = dir {
        c.current_dir(d);
    }
    match c.spawn() {
        Ok(_) => {
            crate::actlog::record("apps", &format!("Opened {} for a saved layout", short_of(exe.rsplit('\\').next().unwrap_or(exe).trim_end_matches(".exe"))));
            true
        }
        Err(e) => {
            eprintln!("[arrange] couldn't open {exe}: {e}");
            false
        }
    }
}

#[cfg(not(windows))]
pub fn save(_name: &str) -> Result<String> {
    Err(anyhow!("Saving layouts works on Windows."))
}

#[cfg(not(windows))]
pub fn restore(_name: &str) -> Result<String> {
    Err(anyhow!("Saved layouts work on Windows."))
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
    crate::actlog::record("style", &format!("Arranged {} window{} {}", moved.len(), if moved.len() == 1 { "" } else { "s" }, kind.name()));
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
    if back > 0 {
        crate::actlog::record("style", &format!("Put {back} window{} back where {} {}", if back == 1 { "" } else { "s" }, if back == 1 { "it" } else { "they" }, if back == 1 { "was" } else { "were" }));
    }
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
        assert_eq!(parse("make a focus layout for my website"), None, "a website's layout");
        assert_eq!(parse("switch to focus layout"), Some(Ask::Arrange(Kind::Focus)));
        assert_eq!(parse("Hey Nova, focus layout right now"), Some(Ask::Arrange(Kind::Focus)));
        assert_eq!(parse("Izuki focus layout please"), Some(Ask::Arrange(Kind::Focus)));
        assert_eq!(parse("put my windows in the focus layout"), Some(Ask::Arrange(Kind::Focus)));
    }

    #[test]
    fn saved_layouts_in_plain_words() {
        assert_eq!(parse("save my windows as Work"), Some(Ask::Save("Work".into())));
        assert_eq!(parse("Hey Nova, save this layout as coding"), Some(Ask::Save("Coding".into())));
        assert_eq!(parse("remember this window setup as movie night"), Some(Ask::Save("Movie night".into())));
        assert_eq!(parse("save my window layout"), Some(Ask::Save("My layout".into())));
        assert_eq!(parse("set up my work layout"), Some(Ask::Restore("Work".into())));
        assert_eq!(parse("load my coding setup"), Some(Ask::Restore("Coding".into())));
        assert_eq!(parse("switch to my gaming layout"), Some(Ask::Restore("Gaming".into())));
        assert_eq!(parse("delete my work layout"), Some(Ask::Forget("Work".into())));
        // The built-in ones and the undo stay as they were.
        assert_eq!(parse("restore my window layout"), Some(Ask::Undo));
        assert_eq!(parse("switch to focus layout"), Some(Ask::Arrange(Kind::Focus)));
        assert_eq!(parse("undo the layout"), Some(Ask::Undo));
        // Not windows.
        assert_eq!(parse("save the slide layout"), None);
        assert_eq!(parse("save my essay"), None);
        assert_eq!(parse("keep my windows open"), None, "not a save");
        assert_eq!(parse("keep my windows as they are"), None);
        assert_eq!(parse("store my windows passwords"), None);
        assert_eq!(parse("how do I save my window layout"), None);
        assert_eq!(parse("don't set up my work layout"), None);
    }

    #[test]
    fn one_app_to_a_spot_in_plain_words() {
        let p = |s: &str| parse(s);
        assert_eq!(p("put chrome on the left"), Some(Ask::Place("chrome".into(), Zone::Left)));
        assert_eq!(p("Hey Nova, move Spotify to my other screen"), Some(Ask::Place("spotify".into(), Zone::OtherScreen)));
        assert_eq!(p("put discord in the top right corner"), Some(Ask::Place("discord".into(), Zone::TopRight)));
        assert_eq!(p("snap vs code to the right half"), Some(Ask::Place("vs code".into(), Zone::Right)));
        assert_eq!(p("center notepad"), Some(Ask::Place("notepad".into(), Zone::Center)));
        assert_eq!(p("make chrome full screen"), Some(Ask::Place("chrome".into(), Zone::Full)));
        assert_eq!(p("maximize discord"), Some(Ask::Place("discord".into(), Zone::Full)));
        assert_eq!(p("move this to my second monitor"), Some(Ask::Place(String::new(), Zone::OtherScreen)));
        assert_eq!(p("center it"), None, "in a document that's the text");
        assert_eq!(p("center this window"), Some(Ask::Place(String::new(), Zone::Center)));
        assert_eq!(p("put this in the top right corner"), None, "a shape in a design app");
        assert_eq!(p("put this window in the top right corner"), Some(Ask::Place(String::new(), Zone::TopRight)));
        assert_eq!(p("make it full screen"), None, "the video's full screen (instant.rs)");
        assert_eq!(p("put it on the left"), None, "instant.rs snaps the window in front");
        assert_eq!(p("put the spotify window in the bottom-left corner"), Some(Ask::Place("spotify".into(), Zone::BottomLeft)));
        // Not one app, or not a place.
        assert_eq!(p("put my windows on the left"), None);
        assert_eq!(p("put my windows side by side"), Some(Ask::Arrange(Kind::Side)), "the layouts still work");
        assert_eq!(p("how do I put chrome on the left"), None);
        assert_eq!(p("don't move spotify to the other screen"), None);
        assert_eq!(p("turn left at the light"), None);
        assert_eq!(p("put the money in the middle drawer"), Some(Ask::Place("money".into(), Zone::Center)), "parsed, but no window is called that: claims() leaves it");
    }

    #[test]
    fn spots_cover_the_screen_exactly() {
        let work = Area { x: 0, y: 0, w: 1919, h: 1039 };
        let halves = [Zone::Left, Zone::Right].map(|s| s.area(work).unwrap());
        assert!(covers_exactly(&halves, work));
        let quarters = [Zone::TopLeft, Zone::TopRight, Zone::BottomLeft, Zone::BottomRight].map(|s| s.area(work).unwrap());
        assert!(covers_exactly(&quarters, work));
        let mid = Zone::Center.area(work).unwrap();
        assert!(mid.x > 0 && mid.y > 0 && mid.x + mid.w < work.w && mid.y + mid.h < work.h);
        assert!(Zone::Full.area(work).is_none() && Zone::OtherScreen.area(work).is_none());
    }

    #[test]
    fn a_window_keeps_its_place_on_the_other_screen() {
        let laptop = Area { x: 0, y: 0, w: 1366, h: 728 };
        let big = Area { x: 1366, y: -200, w: 2560, h: 1400 };
        let left_half = Area { x: 0, y: 0, w: 683, h: 728 };
        let there = onto(left_half, laptop, big);
        assert_eq!((there.x, there.y, there.w, there.h), (1366, -200, 1280, 1400), "the left half there too");
        // Never off the new screen, even from an odd spot.
        let odd = onto(Area { x: 1300, y: 700, w: 900, h: 600 }, laptop, Area { x: -800, y: 0, w: 800, h: 600 });
        assert!(odd.x >= -800 && odd.x + odd.w <= 0 && odd.y >= 0 && odd.y + odd.h <= 600, "{odd:?}");
    }

    #[test]
    fn an_app_is_found_by_the_name_people_use() {
        let open = vec![
            (1, "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe".to_string(), "Inbox - Gmail - Google Chrome".to_string()),
            (2, "C:\\Users\\x\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe".to_string(), "main.rs - izuki - Visual Studio Code".to_string()),
            (3, "C:\\Users\\x\\AppData\\Roaming\\Spotify\\Spotify.exe".to_string(), "Spotify Premium".to_string()),
            (4, "C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE".to_string(), "Essay.docx - Word".to_string()),
            (5, "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe".to_string(), "YouTube - Google Chrome".to_string()),
        ];
        assert_eq!(app_named("chrome", &open), Some(1), "the one used last");
        assert_eq!(app_named("vs code", &open), Some(2));
        assert_eq!(app_named("Spotify", &open), Some(3));
        assert_eq!(app_named("word", &open), Some(4));
        assert_eq!(app_named("discord", &open), None, "not open");
        assert_eq!(app_named("money", &open), None);
    }

    #[test]
    fn the_right_window_is_found_again() {
        let want = SavedWindow { exe: "C:\\Apps\\code.exe".into(), app: "Visual Studio Code".into(), title: "main.rs - izuki - Visual Studio Code".into(), spot: Spot { show: 1, flags: 0, min: (0, 0), max: (0, 0), normal: (0, 0, 10, 10) } };
        let open = vec![
            (1, "c:\\apps\\code.exe".to_string(), "notes.md - other - Visual Studio Code".to_string()),
            (2, "C:\\Apps\\code.exe".to_string(), "main.rs - izuki - Visual Studio Code".to_string()),
            (3, "C:\\Apps\\chrome.exe".to_string(), "main.rs - izuki - Visual Studio Code".to_string()),
        ];
        assert_eq!(best_match(&want, &open, &[]), Some(2), "same program and title first");
        assert_eq!(best_match(&want, &open, &[2]), Some(1), "then the same program");
        assert_eq!(best_match(&want, &open, &[1, 2]), None, "never another program");
        assert!(!may_open("C:\\Program Files\\WindowsApps\\Microsoft.Todos\\Todo.exe"), "Store apps start another way");
        assert!(!may_open("C:\\Windows\\explorer.exe"));
        assert!(!may_open("C:\\nowhere\\gone.exe"), "a program that's been uninstalled");
        assert!(clean_name("focus").is_err() && clean_name("  ").is_err());
        assert_eq!(clean_name("  Movie   night ").unwrap(), "Movie night");
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
