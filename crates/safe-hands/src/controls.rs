//! The real controls of a window — buttons, links, fields, tabs, list items —
//! read from Windows UI Automation, numbered, and cut to the part that can
//! actually be seen. Hand this list to a model and it can answer "click 7"
//! instead of guessing coordinates.

/// A rectangle in physical screen pixels.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub struct Rect {
    pub x: i32,
    pub y: i32,
    pub w: i32,
    pub h: i32,
}

impl Rect {
    pub fn center(&self) -> (i32, i32) {
        (self.x + self.w / 2, self.y + self.h / 2)
    }

    pub fn contains(&self, x: i32, y: i32) -> bool {
        x >= self.x && y >= self.y && x < self.x + self.w && y < self.y + self.h
    }

    /// The part of this rectangle inside `other`, if any.
    pub fn intersect(&self, other: &Rect) -> Option<Rect> {
        let x = self.x.max(other.x);
        let y = self.y.max(other.y);
        let right = (self.x + self.w).min(other.x + other.w);
        let bottom = (self.y + self.h).min(other.y + other.h);
        (right > x && bottom > y).then(|| Rect { x, y, w: right - x, h: bottom - y })
    }
}

/// One control a model can act on by number.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Control {
    /// Its number in the list (1, 2, 3…) — what the model answers with.
    pub id: u32,
    /// "Button", "Hyperlink", "Edit", "TabItem"…
    pub kind: String,
    /// What it says ("Sign in", "Search"), whitespace tidied, at most 80 characters.
    pub name: String,
    /// The part of it that can be seen — click its centre.
    pub rect: Rect,
    /// Greyed out.
    pub disabled: bool,
    /// Where typing goes right now.
    pub focused: bool,
}

impl Control {
    /// One line for a model: `[7] button "Sign in"`.
    pub fn line(&self) -> String {
        let mut s = format!("[{}] {}", self.id, self.kind.to_lowercase());
        if !self.name.is_empty() {
            s.push_str(&format!(" \"{}\"", self.name));
        }
        if self.disabled {
            s.push_str(" (greyed out)");
        }
        if self.focused {
            s.push_str(" (typing goes here)");
        }
        s
    }
}

/// The window the user is working in (the foreground window), as a raw handle.
#[cfg(windows)]
pub fn foreground_window() -> Option<isize> {
    let h = unsafe { windows::Win32::UI::WindowsAndMessaging::GetForegroundWindow() };
    (!h.0.is_null()).then_some(h.0 as isize)
}

#[cfg(not(windows))]
pub fn foreground_window() -> Option<isize> {
    None
}

/// Up to `max` interactive controls of `window`, in reading order, numbered
/// from 1. Only what can be seen: off-screen controls are left out, and each
/// rectangle is cut to the window — and, inside a browser, to the page area,
/// so a link half-scrolled under the toolbar is clicked on its visible half.
#[cfg(windows)]
pub fn list(window: isize, max: usize) -> Vec<Control> {
    use uiautomation::types::ControlType as C;
    use uiautomation::UIAutomation;

    let Ok(automation) = UIAutomation::new().or_else(|_| UIAutomation::new_direct()) else { return Vec::new() };
    let hwnd = windows::Win32::Foundation::HWND(window as *mut core::ffi::c_void);
    let Ok(root) = automation.element_from_handle(hwnd.into()) else { return Vec::new() };
    let Ok(walker) = automation.get_control_view_walker() else { return Vec::new() };
    let win_rect = root.get_bounding_rectangle().ok().map(|r| to_rect(&r));

    let interactive = |ct: C| {
        matches!(
            ct,
            C::Button | C::Hyperlink | C::Edit | C::ComboBox | C::CheckBox | C::RadioButton | C::MenuItem
                | C::TabItem | C::ListItem | C::TreeItem | C::SplitButton | C::Slider | C::DataItem
        )
    };

    let deadline = std::time::Instant::now() + std::time::Duration::from_millis(1500);
    let mut out = Vec::new();
    let mut stack: Vec<(uiautomation::UIElement, Option<Rect>)> = vec![(root, win_rect)];
    let mut visited = 0usize;
    while let Some((el, view)) = stack.pop() {
        visited += 1;
        if visited > 6000 || out.len() >= max || std::time::Instant::now() > deadline {
            break;
        }
        let ct = el.get_control_type().ok();
        if let Some(ct) = ct.filter(|ct| interactive(*ct)) {
            if !el.is_offscreen().unwrap_or(true) {
                if let Some(seen) = el
                    .get_bounding_rectangle()
                    .ok()
                    .map(|r| to_rect(&r))
                    .and_then(|r| r.intersect(view.as_ref().unwrap_or(&r)))
                    .filter(|r| r.w > 2 && r.h > 2)
                {
                    let name = el.get_name().unwrap_or_default().split_whitespace().collect::<Vec<_>>().join(" ");
                    out.push(Control {
                        id: 0,
                        kind: format!("{ct:?}"),
                        name: name.chars().take(80).collect(),
                        rect: seen,
                        disabled: !el.is_enabled().unwrap_or(true),
                        focused: el.has_keyboard_focus().unwrap_or(false),
                    });
                }
            }
        }
        // Inside a page (a Document), only the page's own area shows its content.
        let child_view = if ct == Some(C::Document) {
            el.get_bounding_rectangle()
                .ok()
                .map(|r| to_rect(&r))
                .and_then(|d| match &view {
                    Some(v) => d.intersect(v),
                    None => Some(d),
                })
                .or(view)
        } else {
            view
        };
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
    // Reading order: top to bottom in rows, then left to right.
    out.sort_by_key(|c| (c.rect.y / 12, c.rect.x));
    for (i, c) in out.iter_mut().enumerate() {
        c.id = i as u32 + 1;
    }
    out
}

#[cfg(not(windows))]
pub fn list(_window: isize, _max: usize) -> Vec<Control> {
    Vec::new()
}

#[cfg(windows)]
pub(crate) fn to_rect(r: &uiautomation::types::Rect) -> Rect {
    Rect { x: r.get_left(), y: r.get_top(), w: r.get_right() - r.get_left(), h: r.get_bottom() - r.get_top() }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_half_hidden_control_is_clicked_on_its_visible_part() {
        let page = Rect { x: 0, y: 120, w: 1280, h: 600 };
        let link = Rect { x: 100, y: 100, w: 200, h: 40 };
        let seen = link.intersect(&page).expect("partly visible");
        assert_eq!(seen, Rect { x: 100, y: 120, w: 200, h: 20 });
        assert!(page.contains(seen.center().0, seen.center().1));
        assert!(Rect { x: 0, y: 0, w: 50, h: 50 }.intersect(&page).is_none());
    }

    #[test]
    fn a_line_for_the_model() {
        let c = Control { id: 7, kind: "Button".into(), name: "Sign in".into(), rect: Rect::default(), disabled: true, focused: false };
        assert_eq!(c.line(), "[7] button \"Sign in\" (greyed out)");
    }
}
