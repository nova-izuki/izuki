//! Magnetic hand.
//!
//! A mark drawn by hand is never pixel-exact, so before clicking we ask
//! Windows UI Automation what is actually under (and around) the point, then
//! move to the centre of the nearest interactive control. Chrome, Excel, the
//! Settings app and most games' launchers all expose this tree.
//!
//! Every call is time-boxed and failure is always survivable: if UIA is slow,
//! unavailable, or the app is a raw canvas, we just click the raw pixel.

use crate::model::Rect;

pub struct Snap {
    pub x: i32,
    pub y: i32,
    pub name: String,
    pub rect: Rect,
}

/// Controls worth snapping to, roughly in order of how much a user means them.
#[cfg(windows)]
fn interactive_score(ct: uiautomation::types::ControlType) -> Option<i32> {
    use uiautomation::types::ControlType as C;
    Some(match ct {
        C::Button => 100,
        C::Hyperlink => 95,
        C::MenuItem => 92,
        C::ListItem => 88,
        C::TabItem => 88,
        C::CheckBox => 86,
        C::RadioButton => 86,
        C::ComboBox => 84,
        C::Edit => 82,
        C::Slider => 70,
        C::SplitButton => 90,
        C::TreeItem => 78,
        C::DataItem => 74,
        C::Image => 40,
        C::Text => 20,
        _ => return None,
    })
}

#[cfg(windows)]
fn to_rect(r: &uiautomation::types::Rect) -> Rect {
    Rect {
        x: r.get_left(),
        y: r.get_top(),
        w: r.get_right() - r.get_left(),
        h: r.get_bottom() - r.get_top(),
    }
}

/// Find the best interactive control near (x, y).
///
/// `radius` is how far out we are willing to look; a mark is usually within a
/// few dozen pixels of what the user meant.
#[cfg(windows)]
pub fn snap_to_control(x: i32, y: i32, radius: i32) -> Option<Snap> {
    use uiautomation::types::Point;
    use uiautomation::UIAutomation;

    let automation = UIAutomation::new().or_else(|_| UIAutomation::new_direct()).ok()?;
    let hit = automation.element_from_point(Point::new(x, y)).ok()?;

    let walker = automation.create_tree_walker().ok();

    // Walk from the hit element up through its ancestors. The deepest
    // interactive node wins; a label inside a button should click the button.
    let mut best: Option<(i32, Snap)> = None;
    let mut current = hit;

    for depth in 0..6 {
        let bounds = current
            .get_bounding_rectangle()
            .ok()
            .map(|r| to_rect(&r))
            .unwrap_or_default();

        // Ignore absurd rects: a full-window "pane" is not what was meant.
        let sane = bounds.w > 4 && bounds.h > 4 && bounds.area() < 2_000_000;

        if sane && !current.is_offscreen().unwrap_or(false) {
            if let Ok(ct) = current.get_control_type() {
                if let Some(mut score) = interactive_score(ct) {
                    // Prefer controls we actually landed inside, and prefer
                    // shallower walks (closer to what the cursor touched).
                    if bounds.contains(x, y) {
                        score += 30;
                    }
                    score -= depth * 6;
                    if current.is_enabled().unwrap_or(true) {
                        score += 10;
                    }

                    let (cx, cy) = bounds.center();
                    let drift = (((cx - x).pow(2) + (cy - y).pow(2)) as f64).sqrt() as i32;
                    if drift <= radius.max(8) {
                        let name = current
                            .get_name()
                            .ok()
                            .filter(|n| !n.trim().is_empty())
                            .unwrap_or_else(|| format!("{ct:?}"));

                        if best.as_ref().map_or(true, |(b, _)| score > *b) {
                            best = Some((
                                score,
                                Snap {
                                    x: cx,
                                    y: cy,
                                    name,
                                    rect: bounds,
                                },
                            ));
                        }
                    }
                }
            }
        }

        let Some(w) = walker.as_ref() else { break };
        match w.get_parent(&current) {
            Ok(parent) => current = parent,
            Err(_) => break,
        }
    }

    best.map(|(_, s)| s)
}

#[cfg(not(windows))]
pub fn snap_to_control(_x: i32, _y: i32, _radius: i32) -> Option<Snap> {
    None
}

// ---------------------------------------------------------------------------
// Izuki's "hands": the real controls on screen, by number
// ---------------------------------------------------------------------------

/// One real, on-screen control the model can act on by id instead of
/// guessing pixel coordinates.
#[derive(Debug, Clone)]
pub struct Control {
    pub id: u32,
    pub kind: String,
    pub name: String,
    pub rect: Rect,
    /// In the app but not drawn until the mouse is over it — the ✕ on a
    /// browser tab or a notification, a row's "…" menu. Izuki hovers there
    /// first and gives it a moment to appear before clicking.
    pub hidden: bool,
    /// What's in it now, for text fields and drop-downs — the address in
    /// the browser's address bar, what's already typed in a search box. The
    /// model reads the app itself here instead of squinting at pixels.
    /// Never read from password fields.
    pub value: String,
    /// Where typing goes right now (the field with the keyboard focus).
    pub focused: bool,
    /// Further down the page (scrolled out of view). Acting on it has the
    /// app scroll it into view first — see [`scroll_into_view`].
    pub below: bool,
}

/// The window the user is actually working in. Normally the foreground
/// window — but clicking Izuki's own chat bubble or panel makes *that*
/// foreground, so Izuki's windows (and invisible, minimised, tool and
/// cloaked UWP windows) are skipped, walking down the z-order to the first
/// real app window under them.
#[cfg(windows)]
pub fn target_window() -> Option<isize> {
    use windows::Win32::Foundation::HWND;
    use windows::Win32::Graphics::Dwm::{DwmGetWindowAttribute, DWMWA_CLOAKED};
    use windows::Win32::UI::WindowsAndMessaging::{
        GetForegroundWindow, GetWindow, GetWindowLongW, GetWindowTextLengthW,
        GetWindowThreadProcessId, IsIconic, IsWindowVisible, GWL_EXSTYLE, GW_HWNDNEXT,
        WS_EX_TOOLWINDOW,
    };

    let me = std::process::id();
    unsafe {
        let mut hwnd: HWND = GetForegroundWindow();
        for _ in 0..300 {
            if hwnd.0.is_null() {
                return None;
            }
            let mut pid: u32 = 0;
            GetWindowThreadProcessId(hwnd, Some(&mut pid));
            let ex = GetWindowLongW(hwnd, GWL_EXSTYLE) as u32;
            let mut cloaked: u32 = 0;
            let _ = DwmGetWindowAttribute(
                hwnd,
                DWMWA_CLOAKED,
                (&mut cloaked as *mut u32).cast(),
                std::mem::size_of::<u32>() as u32,
            );
            let usable = pid != 0
                && pid != me
                && IsWindowVisible(hwnd).as_bool()
                && !IsIconic(hwnd).as_bool()
                && ex & WS_EX_TOOLWINDOW.0 == 0
                && cloaked == 0
                && GetWindowTextLengthW(hwnd) > 0;
            if usable {
                return Some(hwnd.0 as isize);
            }
            hwnd = match GetWindow(hwnd, GW_HWNDNEXT) {
                Ok(next) => next,
                Err(_) => return None,
            };
        }
    }
    None
}

#[cfg(not(windows))]
pub fn target_window() -> Option<isize> {
    None
}

/// Walk the target window's accessibility tree and list its visible,
/// actionable controls — buttons, links, fields, menu/list/tab items —
/// numbered in reading order (top-to-bottom, left-to-right).
///
/// This is what lets *any* model drive the screen reliably, even a fast,
/// text-only chat model: it answers "click #7" and Izuki clicks the exact
/// centre of control 7. No coordinate guessing, so nothing to hallucinate.
/// Time- and node-boxed, because some trees (a busy Chrome tab) are huge.
#[cfg(windows)]
pub fn list_controls(max: usize) -> Vec<Control> {
    use std::time::{Duration, Instant};
    use uiautomation::UIAutomation;

    let Ok(automation) = UIAutomation::new().or_else(|_| UIAutomation::new_direct()) else {
        return Vec::new();
    };
    let Ok(walker) = automation.get_control_view_walker() else { return Vec::new() };

    let started = Instant::now();
    let mut found: Vec<Control> = Vec::new();

    // The app you're working in gets most of the budget…
    if let Some(hwnd) = target_window() {
        if let Ok(root) = automation.element_from_handle(hwnd.into()) {
            collect(&walker, root, 2500, started + Duration::from_millis(650), max * 2, &mut found);
        }
    }
    // …and the taskbar always gets a look too: Start, search, pinned and
    // running apps, the tray. "Open Start", "open File Explorer" and
    // "switch to Chrome" all live there, and it's a tool window the target
    // search deliberately skips.
    // (It hardly ever changes, so it's read at most every 30 s — that was
    // a third of a second on every single look.)
    let cached = TASKBAR.lock().as_ref().filter(|(at, _)| at.elapsed() < Duration::from_secs(30)).map(|(_, c)| c.clone());
    match cached {
        Some(bar) => found.extend(bar),
        None => {
            if let Some(taskbar) = taskbar_window() {
                if let Ok(root) = automation.element_from_handle(taskbar.into()) {
                    let mut bar = Vec::new();
                    collect(&walker, root, 600, Instant::now() + Duration::from_millis(350), 40, &mut bar);
                    *TASKBAR.lock() = Some((Instant::now(), bar.clone()));
                    found.extend(bar);
                }
            }
        }
    }

    // Reading order, in coarse rows so a row of buttons stays left-to-right.
    found.sort_by_key(|c| (c.rect.y / 12, c.rect.x));
    found.dedup_by(|a, b| a.rect == b.rect && a.name == b.name);
    // What's on screen first, but keep room for some of what's further down.
    let (mut here, below): (Vec<Control>, Vec<Control>) = found.into_iter().partition(|c| !c.below);
    let room_below = below.len().min(15).min(max / 4);
    here.truncate(max - room_below);
    here.extend(below.into_iter().take(room_below));
    let mut found = here;
    for (i, c) in found.iter_mut().enumerate() {
        c.id = i as u32 + 1;
    }
    found
}

/// The taskbar's controls, and when they were read.
#[cfg(windows)]
static TASKBAR: parking_lot::Mutex<Option<(std::time::Instant, Vec<Control>)>> = parking_lot::Mutex::new(None);

/// The primary taskbar (`Shell_TrayWnd`).
#[cfg(windows)]
fn taskbar_window() -> Option<isize> {
    use windows::core::w;
    use windows::Win32::UI::WindowsAndMessaging::FindWindowW;
    unsafe { FindWindowW(w!("Shell_TrayWnd"), None).ok().map(|h| h.0 as isize) }
}

/// Depth-first walk under `root`, pushing every visible, actionable control
/// inside `root`'s own bounds into `out`. Stops at the node budget, the
/// deadline, or `cap` finds.
#[cfg(windows)]
fn collect(
    walker: &uiautomation::UITreeWalker,
    root: uiautomation::UIElement,
    node_budget: usize,
    deadline: std::time::Instant,
    cap: usize,
    out: &mut Vec<Control>,
) {
    let window = root.get_bounding_rectangle().ok().map(|r| to_rect(&r));
    let start_len = out.len();
    let mut hidden_found = 0usize;
    let mut below_found = 0usize;
    let mut visited = 0usize;
    // Each element travels with the area it can actually be seen in: the
    // window, narrowed to the page itself inside a browser (a Document). A
    // link half-scrolled under the address bar used to be clicked at the
    // middle of its *whole* box — on the address bar or a tab. Now its box
    // is cut to the visible part, and that's where the click goes.
    let mut stack: Vec<(uiautomation::UIElement, Option<Rect>)> = vec![(root, window)];

    while let Some((el, view)) = stack.pop() {
        visited += 1;
        if visited > node_budget
            || std::time::Instant::now() > deadline
            || out.len() - start_len >= cap
        {
            break;
        }

        if let Ok(ct) = el.get_control_type() {
            let score = interactive_score(ct).unwrap_or(0);
            let offscreen = el.is_offscreen().unwrap_or(true);
            // Hidden-until-hover buttons report "offscreen" while sitting
            // inside the window. (Ones scrolled out of view sit outside it
            // and are dropped by the bounds check below.) Only the kinds
            // that hide like this, and only named ones — a nameless hidden
            // thing is no use to anyone.
            let hover_only = offscreen && score >= 90 && hidden_found < 20;
            // Links and buttons scrolled out of view below: listed too, so
            // "open Blackboard" can find the link further down the page.
            let maybe_below = offscreen && score >= 88 && below_found < 25;
            if score >= 70 && (!offscreen || hover_only || maybe_below) {
                if let Ok(r) = el.get_bounding_rectangle() {
                    let rect = to_rect(&r);
                    let inside = window.as_ref().map_or(true, |w| {
                        let (cx, cy) = rect.center();
                        w.contains(cx, cy)
                    });
                    let name = el
                        .get_name()
                        .ok()
                        .map(|n| n.split_whitespace().collect::<Vec<_>>().join(" "))
                        .unwrap_or_default();
                    let hidden_ok = !offscreen || (!name.is_empty() && rect.w < 400 && rect.h < 200);
                    let below = maybe_below
                        && !inside
                        && !name.is_empty()
                        && window.as_ref().is_some_and(|w| {
                            let (cx, cy) = rect.center();
                            cx >= w.x && cx <= w.x + w.w && cy > w.y + w.h && cy < w.y + w.h * 5
                        });
                    if below && rect.w > 2 && rect.h > 2 {
                        below_found += 1;
                        out.push(Control {
                            id: 0,
                            kind: format!("{ct:?}"),
                            name: name.chars().take(60).collect(),
                            rect,
                            hidden: false,
                            value: String::new(),
                            focused: false,
                            below: true,
                        });
                    } else if let Some(rect) = rect
                        .intersect(view.as_ref().unwrap_or(&rect))
                        .filter(|r| r.w > 2 && r.h > 2 && inside && hidden_ok && (!offscreen || hover_only))
                    {
                        if offscreen {
                            hidden_found += 1;
                        }
                        use uiautomation::types::ControlType as C;
                        let (value, focused) = if matches!(ct, C::Edit | C::ComboBox) && !offscreen {
                            let value = if el.is_password().unwrap_or(true) {
                                String::new()
                            } else {
                                el.get_property_value(uiautomation::types::UIProperty::ValueValue)
                                    .and_then(|v| v.get_string())
                                    .map(|v| v.split_whitespace().collect::<Vec<_>>().join(" ").chars().take(120).collect())
                                    .unwrap_or_default()
                            };
                            (value, el.has_keyboard_focus().unwrap_or(false))
                        } else {
                            (String::new(), false)
                        };
                        out.push(Control {
                            id: 0,
                            kind: format!("{ct:?}"),
                            name: name.chars().take(60).collect(),
                            rect,
                            hidden: offscreen,
                            value,
                            focused,
                            below: false,
                        });
                    }
                }
            }
        }

        // Inside a web page (or any document), only its own area shows its content.
        let child_view = match el.get_control_type() {
            Ok(uiautomation::types::ControlType::Document) => el
                .get_bounding_rectangle()
                .ok()
                .map(|r| to_rect(&r))
                .and_then(|doc| match &view {
                    Some(v) => doc.intersect(v),
                    None => Some(doc),
                })
                .or(view),
            _ => view,
        };
        // Depth-first, children pushed in reverse so they pop in order.
        if let Ok(first) = walker.get_first_child(&el) {
            let mut kids = vec![first];
            while kids.len() < 400 {
                match walker.get_next_sibling(kids.last().expect("non-empty")) {
                    Ok(next) => kids.push(next),
                    Err(_) => break,
                }
            }
            stack.extend(kids.into_iter().rev().map(|k| (k, child_view)));
        }
    }
}

/// Give keyboard focus back to the user's app before Izuki acts. Clicking
/// Izuki's chat bubble makes Izuki the foreground window, so without this,
/// typed text and key presses ("ctrl+l", "enter") landed in Izuki's own
/// overlay instead of the app they were meant for. Only does anything when
/// Izuki currently holds the foreground — which is also exactly when
/// Windows allows it to hand focus away.
#[cfg(windows)]
pub fn focus_target_window() {
    use windows::Win32::Foundation::HWND;
    use windows::Win32::UI::WindowsAndMessaging::{
        GetForegroundWindow, GetWindowThreadProcessId, SetForegroundWindow,
    };
    unsafe {
        let mut pid: u32 = 0;
        GetWindowThreadProcessId(GetForegroundWindow(), Some(&mut pid));
        if pid != std::process::id() {
            return;
        }
        if let Some(raw) = target_window() {
            let _ = SetForegroundWindow(HWND(raw as *mut core::ffi::c_void));
        }
    }
}

#[cfg(not(windows))]
pub fn focus_target_window() {}

// ---------------------------------------------------------------------------
// Safe hands: checks right before a click, each a few milliseconds
// ---------------------------------------------------------------------------

/// What's really at a click point, compared with the control Izuki means.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AtPoint {
    /// It's there, and it can be pressed.
    Right,
    /// It's there but greyed out — clicking would do nothing.
    Disabled,
    /// It moved since the screenshot (the page shifted): it's here now.
    Moved(i32, i32),
    /// Can't tell (no name to go by, or the app doesn't say).
    Unknown,
}

fn same_name(have: &str, want: &str) -> bool {
    let n = |s: &str| s.split_whitespace().collect::<Vec<_>>().join(" ").to_lowercase();
    let (h, w) = (n(have), n(want));
    // Names in Izuki's list are cut at 60 characters: a longer real name starts with it.
    !w.is_empty() && (h == w || (w.chars().count() >= 3 && h.starts_with(&w)))
}

#[cfg(windows)]
fn find_named(automation: &uiautomation::UIAutomation, name: &str) -> Option<uiautomation::UIElement> {
    use uiautomation::types::{PropertyConditionFlags, TreeScope, UIProperty};
    let root = automation.element_from_handle(target_window()?.into()).ok()?;
    let needle: String = name.chars().take(50).collect();
    let cond = automation
        .create_property_condition(UIProperty::Name, needle.as_str().into(), Some(PropertyConditionFlags::All))
        .ok()?;
    root.find_first(TreeScope::Descendants, &cond).ok()
}

/// Right before a click on the control called `name` at (x, y): is it really
/// there, and can it be pressed? Pages move after the screenshot (an ad or a
/// picture loads and everything shifts) — then this says where it is now.
/// One quick question to Windows when all is well; a search only when not.
#[cfg(windows)]
pub fn check_target(x: i32, y: i32, name: &str) -> AtPoint {
    use uiautomation::types::Point;
    use uiautomation::UIAutomation;
    if name.trim().chars().count() < 2 {
        return AtPoint::Unknown;
    }
    let Ok(automation) = UIAutomation::new().or_else(|_| UIAutomation::new_direct()) else { return AtPoint::Unknown };
    // What's under the point — or one of its parents (the text inside a link).
    if let Ok(hit) = automation.element_from_point(Point::new(x, y)) {
        let walker = automation.get_control_view_walker().ok();
        let mut el = Some(hit);
        for _ in 0..5 {
            let Some(e) = el else { break };
            if same_name(&e.get_name().unwrap_or_default(), name) {
                return if e.is_enabled().unwrap_or(true) { AtPoint::Right } else { AtPoint::Disabled };
            }
            el = walker.as_ref().and_then(|w| w.get_parent(&e).ok());
        }
    }
    // Not there: find it again.
    let Some(el) = find_named(&automation, name) else { return AtPoint::Unknown };
    if !el.is_enabled().unwrap_or(true) {
        return AtPoint::Disabled;
    }
    let Ok(r) = el.get_bounding_rectangle() else { return AtPoint::Unknown };
    let r = to_rect(&r);
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
pub fn check_target(_x: i32, _y: i32, _name: &str) -> AtPoint {
    AtPoint::Unknown
}

/// Press the control called `name` directly through Windows, no mouse — for
/// when something sits on top of it. (Microsoft's UFO² desktop agent found
/// acting on controls directly recovers a quarter of failed clicks.)
#[cfg(windows)]
pub fn press_named(name: &str) -> bool {
    use uiautomation::patterns::{UIInvokePattern, UILegacyIAccessiblePattern, UISelectionItemPattern, UITogglePattern};
    use uiautomation::UIAutomation;
    let Ok(automation) = UIAutomation::new().or_else(|_| UIAutomation::new_direct()) else { return false };
    let Some(el) = find_named(&automation, name) else { return false };
    if let Ok(p) = el.get_pattern::<UIInvokePattern>() {
        if p.invoke().is_ok() {
            return true;
        }
    }
    if let Ok(p) = el.get_pattern::<UITogglePattern>() {
        if p.toggle().is_ok() {
            return true;
        }
    }
    if let Ok(p) = el.get_pattern::<UISelectionItemPattern>() {
        if p.select().is_ok() {
            return true;
        }
    }
    el.get_pattern::<UILegacyIAccessiblePattern>().is_ok_and(|p| p.do_default_action().is_ok())
}

#[cfg(not(windows))]
pub fn press_named(_name: &str) -> bool {
    false
}

/// What the text box with the keyboard focus holds now (never a password box).
#[cfg(windows)]
pub fn focused_value() -> Option<String> {
    use uiautomation::patterns::UIValuePattern;
    use uiautomation::UIAutomation;
    let automation = UIAutomation::new().or_else(|_| UIAutomation::new_direct()).ok()?;
    let el = automation.get_focused_element().ok()?;
    if el.is_password().unwrap_or(true) {
        return None;
    }
    el.get_pattern::<UIValuePattern>().ok()?.get_value().ok()
}

#[cfg(not(windows))]
pub fn focused_value() -> Option<String> {
    None
}

/// Is something else sitting on top of (x, y) — another app's window, a
/// notification, a floating chat head — so a click there would land on it
/// instead of the window Izuki is working in? Its name if so. Menus, pop-ups
/// and dialogs of the same app don't count (they're what you click), nor do
/// Izuki's own windows (they let clicks through while Izuki acts).
#[cfg(windows)]
pub fn covered_at(x: i32, y: i32) -> Option<String> {
    use windows::Win32::Foundation::{HWND, POINT};
    use windows::Win32::UI::WindowsAndMessaging::{
        GetAncestor, GetClassNameW, GetWindowTextW, GetWindowThreadProcessId, WindowFromPoint, GA_ROOT,
    };
    let target = HWND(target_window()? as *mut core::ffi::c_void);
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
        let mut name = String::from_utf16_lossy(&buf[..n.max(0) as usize]).trim().to_string();
        if name.is_empty() {
            let n = GetClassNameW(root, &mut buf);
            let class = String::from_utf16_lossy(&buf[..n.max(0) as usize]);
            name = match class.as_str() {
                "Windows.UI.Core.CoreWindow" => "a Windows notification".to_string(),
                "Shell_TrayWnd" | "Shell_SecondaryTrayWnd" => "the taskbar".to_string(),
                _ => format!("another window ({})", process_name(theirs)),
            };
        }
        Some(name)
    }
}

#[cfg(not(windows))]
pub fn covered_at(_x: i32, _y: i32) -> Option<String> {
    None
}

/// If the window `raw` (from [`target_window`]) has been minimised, put it
/// back in front and say what it was called. For when one of Izuki's own
/// steps minimised the very window it was working in.
#[cfg(windows)]
pub fn restore_if_minimised(raw: isize) -> Option<String> {
    use windows::Win32::Foundation::HWND;
    use windows::Win32::UI::WindowsAndMessaging::{GetWindowTextW, IsIconic, IsWindow, SetForegroundWindow, ShowWindow, SW_RESTORE};
    unsafe {
        let hwnd = HWND(raw as *mut core::ffi::c_void);
        if !IsWindow(Some(hwnd)).as_bool() || !IsIconic(hwnd).as_bool() {
            return None;
        }
        let _ = ShowWindow(hwnd, SW_RESTORE);
        let _ = SetForegroundWindow(hwnd);
        let mut buf = [0u16; 256];
        let n = GetWindowTextW(hwnd, &mut buf);
        Some(String::from_utf16_lossy(&buf[..n.max(0) as usize]))
    }
}

#[cfg(not(windows))]
pub fn restore_if_minimised(_raw: isize) -> Option<String> {
    None
}

/// Have the app scroll the control named `name` into view (browsers and
/// most apps can, exactly), and say where it is now. `None` if it couldn't
/// be found or scrolled.
#[cfg(windows)]
pub fn scroll_into_view(name: &str) -> Option<(i32, i32)> {
    use uiautomation::patterns::UIScrollItemPattern;
    use uiautomation::types::{PropertyConditionFlags, TreeScope, UIProperty};
    use uiautomation::UIAutomation;

    let automation = UIAutomation::new().or_else(|_| UIAutomation::new_direct()).ok()?;
    let root = automation.element_from_handle(target_window()?.into()).ok()?;
    // Names in the list are cut to 60 characters — match on the start.
    let needle: String = name.chars().take(50).collect();
    let cond = automation
        .create_property_condition(UIProperty::Name, needle.as_str().into(), Some(PropertyConditionFlags::All))
        .ok()?;
    let el = root.find_first(TreeScope::Descendants, &cond).ok()?;
    match el.get_pattern::<UIScrollItemPattern>() {
        Ok(p) => {
            let _ = p.scroll_into_view();
        }
        // Focusing a link scrolls the page to it in every browser.
        Err(_) => {
            let _ = el.set_focus();
        }
    }
    std::thread::sleep(std::time::Duration::from_millis(350));
    let r = to_rect(&el.get_bounding_rectangle().ok()?);
    (r.w > 2 && r.h > 2 && !el.is_offscreen().unwrap_or(false)).then(|| r.center())
}

#[cfg(not(windows))]
pub fn scroll_into_view(_name: &str) -> Option<(i32, i32)> {
    None
}

#[cfg(not(windows))]
pub fn list_controls(_max: usize) -> Vec<Control> {
    Vec::new()
}

/// Name of the process owning the window the user is working in, e.g.
/// "chrome.exe". Flows and the ghost-hand model are keyed on this.
#[cfg(windows)]
pub fn foreground_app() -> String {
    use windows::Win32::Foundation::HWND;
    use windows::Win32::UI::WindowsAndMessaging::GetWindowThreadProcessId;

    unsafe {
        let Some(raw) = target_window() else { return String::new() };
        let hwnd = HWND(raw as *mut core::ffi::c_void);
        let mut pid: u32 = 0;
        GetWindowThreadProcessId(hwnd, Some(&mut pid));
        if pid == 0 {
            return String::new();
        }
        process_name(pid)
    }
}

/// A process's file name, e.g. "chrome.exe" ("" if it can't be read).
#[cfg(windows)]
pub fn process_name(pid: u32) -> String {
    use windows::Win32::Foundation::{CloseHandle, MAX_PATH};
    use windows::Win32::System::Threading::{
        OpenProcess, QueryFullProcessImageNameW, PROCESS_NAME_FORMAT,
        PROCESS_QUERY_LIMITED_INFORMATION,
    };

    unsafe {
        let Ok(handle) = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid) else {
            return String::new();
        };

        let mut buf = [0u16; MAX_PATH as usize];
        let mut len = buf.len() as u32;
        let ok = QueryFullProcessImageNameW(
            handle,
            PROCESS_NAME_FORMAT(0),
            windows::core::PWSTR(buf.as_mut_ptr()),
            &mut len,
        )
        .is_ok();
        let _ = CloseHandle(handle);

        if !ok {
            return String::new();
        }

        String::from_utf16_lossy(&buf[..len as usize])
            .rsplit('\\')
            .next()
            .unwrap_or_default()
            .to_string()
    }
}

#[cfg(not(windows))]
pub fn foreground_app() -> String {
    String::new()
}

/// Whether Windows is locked (or at its sign-in screen): its lock screen
/// (LogonUI.exe) is running. Izuki never clicks or types while it is — a
/// keystroke there lands in the PIN / password box.
#[cfg(windows)]
pub fn screen_locked() -> bool {
    use windows::Win32::Foundation::{CloseHandle, MAX_PATH};
    use windows::Win32::System::ProcessStatus::EnumProcesses;
    use windows::Win32::System::Threading::{
        OpenProcess, QueryFullProcessImageNameW, PROCESS_NAME_FORMAT, PROCESS_QUERY_LIMITED_INFORMATION,
    };
    unsafe {
        let mut pids = vec![0u32; 4096];
        let mut bytes = 0u32;
        if EnumProcesses(pids.as_mut_ptr(), (pids.len() * 4) as u32, &mut bytes).is_err() {
            return false;
        }
        for &pid in &pids[..(bytes as usize / 4)] {
            if pid == 0 {
                continue;
            }
            let Ok(h) = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid) else { continue };
            let mut buf = [0u16; MAX_PATH as usize];
            let mut len = buf.len() as u32;
            let ok = QueryFullProcessImageNameW(h, PROCESS_NAME_FORMAT(0), windows::core::PWSTR(buf.as_mut_ptr()), &mut len).is_ok();
            let _ = CloseHandle(h);
            if ok && String::from_utf16_lossy(&buf[..len as usize]).to_lowercase().ends_with("\\logonui.exe") {
                return true;
            }
        }
    }
    false
}

#[cfg(not(windows))]
pub fn screen_locked() -> bool {
    false
}

/// The readable text of the page or document in front — a web page, a PDF
/// in the browser, a Word document — straight from the app, word for word:
/// the exact question, every answer option, the instructions. The
/// screenshot shows where things are; this says exactly what they say.
#[cfg(windows)]
pub fn document_text(max_chars: usize) -> String {
    use uiautomation::patterns::UITextPattern;
    use uiautomation::types::ControlType;
    use uiautomation::UIAutomation;
    let Some(hwnd) = target_window() else { return String::new() };
    let Ok(automation) = UIAutomation::new().or_else(|_| UIAutomation::new_direct()) else { return String::new() };
    let Ok(root) = automation.element_from_handle(hwnd.into()) else { return String::new() };
    let Ok(doc) = automation
        .create_matcher()
        .from(root)
        .control_type(ControlType::Document)
        .depth(14)
        .timeout(450)
        .find_first()
    else {
        return String::new();
    };
    let Ok(text) = doc
        .get_pattern::<UITextPattern>()
        .and_then(|p| p.get_document_range())
        .and_then(|r| r.get_text(max_chars as i32))
    else {
        return String::new();
    };
    // Tidy: no runs of blank lines or spaces.
    let mut out = String::new();
    for line in text.lines().map(str::trim).filter(|l| !l.is_empty()) {
        out.push_str(&line.split_whitespace().collect::<Vec<_>>().join(" "));
        out.push('\n');
    }
    out.chars().take(max_chars).collect()
}

#[cfg(not(windows))]
pub fn document_text(_max_chars: usize) -> String {
    String::new()
}

/// Whether what's in front is still loading, and how that shows: the
/// mouse's busy cursor, or the browser's Reload button having turned into
/// "Stop" while a page loads. A person waits for that before deciding a
/// click failed or a page has nothing on it — so does Izuki.
/// With `keep`, a finished page's controls (read to check for the Stop
/// button) are kept for the next look, so it isn't read twice.
pub fn loading(keep: bool) -> Option<&'static str> {
    if busy_cursor() {
        return Some("the mouse shows the busy cursor");
    }
    let app = foreground_app().to_lowercase();
    if ["chrome", "msedge", "firefox", "brave", "opera", "vivaldi"].iter().any(|b| app.starts_with(b)) {
        let controls = list_controls(crate::brain::MAX_CONTROLS);
        if controls.iter().any(|c| c.kind == "Button" && is_stop_loading(&c.name)) {
            return Some("the browser's reload button still says Stop — the page is loading");
        }
        if keep {
            keep_controls(controls);
        }
    }
    None
}

/// The browser's "Stop loading this page" / "Stop (Esc)" button.
fn is_stop_loading(name: &str) -> bool {
    let n = name.trim().to_lowercase();
    n == "stop" || n.starts_with("stop loading") || n.starts_with("stop (")
}

#[cfg(windows)]
fn busy_cursor() -> bool {
    use windows::Win32::UI::WindowsAndMessaging::{GetCursorInfo, LoadCursorW, CURSORINFO, IDC_APPSTARTING, IDC_WAIT};
    unsafe {
        let mut ci = CURSORINFO { cbSize: std::mem::size_of::<CURSORINFO>() as u32, ..Default::default() };
        if GetCursorInfo(&mut ci).is_err() || ci.hCursor.is_invalid() {
            return false;
        }
        [IDC_WAIT, IDC_APPSTARTING]
            .into_iter()
            .any(|id| LoadCursorW(None, id).is_ok_and(|c| c == ci.hCursor))
    }
}

#[cfg(not(windows))]
fn busy_cursor() -> bool {
    false
}

#[cfg(test)]
mod loading_tests {
    #[test]
    fn knows_the_browsers_stop_button() {
        assert!(super::is_stop_loading("Stop loading this page"));
        assert!(super::is_stop_loading("Stop (Esc)"));
        assert!(!super::is_stop_loading("Stop sharing"));
        assert!(!super::is_stop_loading("Reload"));
    }
}

/// Every real app window that's open (title and whether it's minimised),
/// front to back — so the agent knows Blackboard is already open in a
/// background window and switches to it instead of hunting for it.
#[cfg(windows)]
pub fn open_windows(max: usize) -> Vec<String> {
    use windows::Win32::Graphics::Dwm::{DwmGetWindowAttribute, DWMWA_CLOAKED};
    use windows::Win32::UI::WindowsAndMessaging::{
        GetForegroundWindow, GetWindow, GetWindowLongW, GetWindowTextW, GetWindowThreadProcessId, IsIconic,
        IsWindowVisible, GWL_EXSTYLE, GW_HWNDFIRST, GW_HWNDNEXT, WS_EX_TOOLWINDOW,
    };
    let me = std::process::id();
    let mut out = Vec::new();
    unsafe {
        let Ok(mut hwnd) = GetWindow(GetForegroundWindow(), GW_HWNDFIRST) else { return out };
        for _ in 0..600 {
            if hwnd.0.is_null() || out.len() >= max {
                break;
            }
            let mut pid: u32 = 0;
            GetWindowThreadProcessId(hwnd, Some(&mut pid));
            let ex = GetWindowLongW(hwnd, GWL_EXSTYLE) as u32;
            let mut cloaked: u32 = 0;
            let _ = DwmGetWindowAttribute(hwnd, DWMWA_CLOAKED, (&mut cloaked as *mut u32).cast(), std::mem::size_of::<u32>() as u32);
            if pid != 0 && pid != me && IsWindowVisible(hwnd).as_bool() && ex & WS_EX_TOOLWINDOW.0 == 0 && cloaked == 0 {
                let mut buf = [0u16; 256];
                let n = GetWindowTextW(hwnd, &mut buf);
                if n > 0 {
                    let title = String::from_utf16_lossy(&buf[..n as usize]);
                    if title != "Program Manager" {
                        out.push(if IsIconic(hwnd).as_bool() { format!("{title} (minimised)") } else { title });
                    }
                }
            }
            hwnd = match GetWindow(hwnd, GW_HWNDNEXT) {
                Ok(next) => next,
                Err(_) => break,
            };
        }
    }
    out
}

#[cfg(not(windows))]
pub fn open_windows(_max: usize) -> Vec<String> {
    Vec::new()
}

/// Title of the window the user is working in, as extra context for the model.
#[cfg(windows)]
pub fn foreground_title() -> String {
    use windows::Win32::Foundation::HWND;
    use windows::Win32::UI::WindowsAndMessaging::GetWindowTextW;
    unsafe {
        let Some(raw) = target_window() else { return String::new() };
        let hwnd = HWND(raw as *mut core::ffi::c_void);
        let mut buf = [0u16; 512];
        let n = GetWindowTextW(hwnd, &mut buf);
        if n <= 0 {
            return String::new();
        }
        String::from_utf16_lossy(&buf[..n as usize])
    }
}

#[cfg(not(windows))]
pub fn foreground_title() -> String {
    String::new()
}

// ---------------------------------------------------------------------------
// Walking the screen ahead of time
// ---------------------------------------------------------------------------

/// A controls walk started early — while the user is still talking or
/// typing — so the ~1.3 s it takes is off the critical path by the time
/// the request goes to the model.
static PREFETCH: parking_lot::Mutex<Option<(std::time::Instant, std::thread::JoinHandle<Vec<Control>>)>> =
    parking_lot::Mutex::new(None);

/// Controls just read, handed to the next `controls_fresh_or_now`.
fn keep_controls(controls: Vec<Control>) {
    *PREFETCH.lock() = Some((std::time::Instant::now(), std::thread::spawn(move || controls)));
}

/// Start walking the target window's controls in the background.
pub fn prefetch_controls(max: usize) {
    let handle = std::thread::spawn(move || list_controls(max));
    *PREFETCH.lock() = Some((std::time::Instant::now(), handle));
}

/// The walk started by `prefetch_controls` if it's recent (waiting for it
/// to finish if need be), otherwise a fresh one.
pub fn controls_fresh_or_now(max: usize) -> Vec<Control> {
    let pending = PREFETCH.lock().take();
    if let Some((at, handle)) = pending {
        if at.elapsed() < std::time::Duration::from_secs(12) {
            if let Ok(controls) = handle.join() {
                return controls;
            }
        }
    }
    list_controls(max)
}

#[cfg(test)]
mod lock_tests {
    /// `cargo test lock_check -- --ignored --nocapture` — prints whether Windows is locked right now, and how long checking takes.
    #[test]
    #[ignore]
    fn lock_check() {
        let t = std::time::Instant::now();
        let locked = super::screen_locked();
        println!("locked: {locked} (checked in {} ms)", t.elapsed().as_millis());
    }
}
