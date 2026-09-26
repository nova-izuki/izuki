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
    found.truncate(max);
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
    let mut visited = 0usize;
    let mut stack = vec![root];

    while let Some(el) = stack.pop() {
        visited += 1;
        if visited > node_budget
            || std::time::Instant::now() > deadline
            || out.len() - start_len >= cap
        {
            break;
        }

        if let Ok(ct) = el.get_control_type() {
            if interactive_score(ct).is_some_and(|s| s >= 70) && !el.is_offscreen().unwrap_or(true) {
                if let Ok(r) = el.get_bounding_rectangle() {
                    let rect = to_rect(&r);
                    let inside = window.as_ref().map_or(true, |w| {
                        let (cx, cy) = rect.center();
                        w.contains(cx, cy)
                    });
                    if rect.w > 2 && rect.h > 2 && inside {
                        let name = el
                            .get_name()
                            .ok()
                            .map(|n| n.split_whitespace().collect::<Vec<_>>().join(" "))
                            .unwrap_or_default();
                        out.push(Control {
                            id: 0,
                            kind: format!("{ct:?}"),
                            name: name.chars().take(60).collect(),
                            rect,
                        });
                    }
                }
            }
        }

        // Depth-first, children pushed in reverse so they pop in order.
        if let Ok(first) = walker.get_first_child(&el) {
            let mut kids = vec![first];
            while kids.len() < 400 {
                match walker.get_next_sibling(kids.last().expect("non-empty")) {
                    Ok(next) => kids.push(next),
                    Err(_) => break,
                }
            }
            stack.extend(kids.into_iter().rev());
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

#[cfg(not(windows))]
pub fn list_controls(_max: usize) -> Vec<Control> {
    Vec::new()
}

/// Name of the process owning the window the user is working in, e.g.
/// "chrome.exe". Flows and the ghost-hand model are keyed on this.
#[cfg(windows)]
pub fn foreground_app() -> String {
    use windows::Win32::Foundation::{CloseHandle, HWND, MAX_PATH};
    use windows::Win32::System::Threading::{
        OpenProcess, QueryFullProcessImageNameW, PROCESS_NAME_FORMAT,
        PROCESS_QUERY_LIMITED_INFORMATION,
    };
    use windows::Win32::UI::WindowsAndMessaging::GetWindowThreadProcessId;

    unsafe {
        let Some(raw) = target_window() else { return String::new() };
        let hwnd = HWND(raw as *mut core::ffi::c_void);
        let mut pid: u32 = 0;
        GetWindowThreadProcessId(hwnd, Some(&mut pid));
        if pid == 0 {
            return String::new();
        }

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
