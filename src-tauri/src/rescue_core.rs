//! Pure decisions shared by the native rescue and its standalone tests.

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Request {
    Hide,
    Restore,
}

pub struct Latch {
    hidden: std::sync::atomic::AtomicBool,
    epoch: std::sync::atomic::AtomicUsize,
}
impl Latch {
    pub const fn new() -> Self {
        Self {
            hidden: std::sync::atomic::AtomicBool::new(false),
            epoch: std::sync::atomic::AtomicUsize::new(0),
        }
    }
    pub fn hide(&self) {
        use std::sync::atomic::Ordering::SeqCst;
        self.epoch.fetch_add(1, SeqCst);
        self.hidden.store(true, SeqCst);
    }
    pub fn hidden(&self) -> bool {
        self.hidden.load(std::sync::atomic::Ordering::SeqCst)
    }
    pub fn epoch(&self) -> usize {
        self.epoch.load(std::sync::atomic::Ordering::SeqCst)
    }
    pub fn resume(&self, epoch: usize) -> bool {
        use std::sync::atomic::Ordering::SeqCst;
        if self.epoch() != epoch {
            return false;
        }
        self.hidden.store(false, SeqCst);
        if self.epoch() != epoch {
            self.hidden.store(true, SeqCst);
            return false;
        }
        true
    }
}

pub fn request(said: &str) -> Option<Request> {
    // Only the user's short, current instruction, never a pasted transcript.
    if said.chars().count() > 300 || said.contains(['\n', '"', '`']) {
        return None;
    }
    let normalized: String = said
        .to_lowercase()
        .replace(['’', '\''], "")
        .chars()
        .map(|c| if c.is_alphanumeric() { c } else { ' ' })
        .collect();
    let words: Vec<&str> = normalized.split_whitespace().collect();
    let text = words.join(" ");
    if [
        "dont",
        "not",
        "never",
        "if",
        "when",
        "why",
        "what",
        "how",
        "explain",
        "example",
        "video",
        "movie",
        "game",
        "chrome",
        "obs",
        "photoshop",
        "terminal",
    ]
    .iter()
    .any(|w| words.contains(w))
    {
        return None;
    }
    let own = words.contains(&"izuki") || words.contains(&"nova");
    let overlay = words.contains(&"overlay");
    if own
        && overlay
        && ["restore", "reopen", "show", "enable"]
            .iter()
            .any(|w| words.contains(w))
    {
        return Some(Request::Restore);
    }
    let hide = [
        "remove", "close", "hide", "dismiss", "clear", "reset", "fix", "stop", "kill", "blocking",
        "covering", "stuck",
    ]
    .iter()
    .any(|w| words.contains(w))
        || text.contains("get rid")
        || text.contains("turn off");
    if own && overlay && hide {
        return Some(Request::Hide);
    }
    let black = text.contains("black screen")
        || text.contains("screen is black")
        || text.contains("screen went black")
        || text.contains("screen turned black")
        || text.contains("screens black")
        || text.contains("screen is all black")
        || text.contains("black overlay")
        || text.contains("everything went black");
    if black
        && (hide
            || [
                "my screen is black",
                "the screen is black",
                "screen is black",
                "my screen went black",
                "the screen went black",
                "everything went black",
            ]
            .contains(&text.as_str()))
    {
        return Some(Request::Hide);
    }
    if own && hide && (text.contains("my screen") || text.contains("the screen")) {
        return Some(Request::Hide);
    }
    None
}

pub fn owned_overlay(pid: u32, own_pid: u32, title: &str, class: &str) -> bool {
    pid == own_pid
        && ((title == "Izuki Overlay" && class == "Tauri Window") || class == "IzukiDimTheRest")
}

#[derive(Default, Debug)]
pub struct EscapeSequence {
    held: bool,
    presses: [Option<u64>; 3],
}
impl EscapeSequence {
    pub const fn new() -> Self {
        Self {
            held: false,
            presses: [None; 3],
        }
    }
    pub fn event(&mut self, down: bool, ours: bool, now: u64) -> bool {
        if ours {
            return false;
        }
        if !down {
            self.held = false;
            return false;
        }
        if self.held {
            return false;
        }
        self.held = true;
        self.presses.rotate_left(1);
        self.presses[2] = Some(now);
        let hit = self.presses[0].is_some_and(|start| now >= start && now - start <= 1500);
        if hit {
            self.presses = [None; 3];
        }
        hit
    }
}

/// Sample actual pixels without allocating or mistaking missing data for a
/// clear screen. This is only a symptom; it never establishes the cause.
pub fn black_share(bgra: &[u8], width: u32, height: u32) -> Option<f32> {
    let size = (width as usize)
        .checked_mul(height as usize)?
        .checked_mul(4)?;
    if width == 0 || height == 0 || bgra.len() < size {
        return None;
    }
    let (mut black, mut total) = (0u32, 0u32);
    for row in (0..height).step_by((height / 96).max(1) as usize) {
        for col in (0..width).step_by((width / 96).max(1) as usize) {
            let i = (row as usize * width as usize + col as usize) * 4;
            black += u32::from(bgra[i..i + 3].iter().all(|c| *c < 10));
            total += 1;
        }
    }
    Some(black as f32 / total as f32)
}

#[derive(Debug, Default)]
pub struct Visibility {
    pub found: usize,
    pub hidden: usize,
    pub remaining: usize,
    pub unknown: usize,
}
pub fn report(result: &Visibility, black: Option<bool>, shell: Option<bool>) -> String {
    let native = if result.remaining > 0 || result.unknown > 0 {
        format!("Emergency stop requested. {} Izuki overlay window(s) are still visible or could not be checked; Windows did not confirm that they hid. No other application was closed.", result.remaining + result.unknown)
    } else if result.found == 0 {
        "Emergency stop requested. No visible Izuki overlay was found. No other application was closed.".into()
    } else {
        format!("Emergency stop requested. Hid and checked {} Izuki overlay window(s). No other application was closed. The overlay stays off until you use Restore overlay in the tray or say ‘restore Izuki overlay’.", result.hidden)
    };
    let screen = match black {
        Some(true) => {
            " The captured screen still looks mostly black. That does not establish its cause."
        }
        Some(false) => " The captured screen is not mostly black now.",
        None => " Screen capture was unavailable, so I could not check its appearance.",
    };
    let desktop = if shell == Some(false) {
        " Windows did not expose its desktop shell window; Explorer was not restarted or closed."
    } else {
        ""
    };
    native + screen + desktop
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn a_late_restore_cannot_undo_a_new_stop() {
        let latch = Latch::new();
        assert!(!latch.hidden());
        latch.hide();
        let first = latch.epoch();
        latch.hide();
        assert!(!latch.resume(first));
        assert!(latch.hidden());
        assert!(latch.resume(latch.epoch()));
        assert!(!latch.hidden());
        latch.hide();
        assert!(latch.hidden());
    }
    #[test]
    fn commands_target_only_our_ui() {
        for text in [
            "remove the black screen",
            "my screen is black",
            "close the Izuki overlay",
            "turn off Izuki overlay",
            "clear the black overlay and restore the desktop",
            "Nova is covering my screen",
            "please fix my black screen",
        ] {
            assert_eq!(request(text), Some(Request::Hide), "{text}");
        }
        for text in ["restore Izuki overlay", "show Nova overlay"] {
            assert_eq!(request(text), Some(Request::Restore));
        }
        for text in [
            "close Chrome",
            "close the OBS overlay",
            "remove the overlay from this video",
            "why is my screen black?",
            "how do I close the Izuki overlay?",
            "don't close Izuki overlay",
            "show a black screen in the terminal",
            "explain how to close the Izuki overlay",
            "if the screen went black reset it",
            "close the overlay",
            "screen capture example\nremove the black screen",
        ] {
            assert_eq!(request(text), None, "{text}");
        }
    }
    #[test]
    fn no_other_window_is_a_target() {
        assert!(owned_overlay(7, 7, "Izuki Overlay", "Tauri Window"));
        assert!(owned_overlay(7, 7, "", "IzukiDimTheRest"));
        assert!(!owned_overlay(8, 7, "Izuki Overlay", "Tauri Window"));
        assert!(!owned_overlay(7, 7, "Izuki", "Tauri Window"));
        assert!(!owned_overlay(7, 7, "Izuki Overlay", "Notepad"));
        assert!(!owned_overlay(8, 7, "", "Progman"));
    }
    #[test]
    fn physical_edges_not_repeats_or_our_injected_keys() {
        let mut seq = EscapeSequence::default();
        assert!(!seq.event(true, false, 0));
        assert!(!seq.event(true, false, 1));
        assert!(!seq.event(false, true, 2));
        assert!(!seq.event(true, false, 3));
        seq.event(false, false, 100);
        assert!(!seq.event(true, false, 500));
        seq.event(false, false, 600);
        assert!(seq.event(true, false, 1500));
        seq.event(false, false, 1501);
        assert!(!seq.event(true, false, 1502));
        let mut slow = EscapeSequence::default();
        for now in [0, 1000, 2000] {
            assert!(!slow.event(true, false, now));
            slow.event(false, false, now + 1);
        }
    }
    #[test]
    fn appearance_is_not_proof_of_cause_or_visibility() {
        assert_eq!(black_share(&[], 0, 0), None);
        assert_eq!(black_share(&[0; 4], 2, 2), None);
        assert_eq!(black_share(&[0; 400], 10, 10), Some(1.0));
        assert_eq!(black_share(&[40; 400], 10, 10), Some(0.0));
        let denied = report(
            &Visibility {
                found: 1,
                remaining: 1,
                ..Default::default()
            },
            Some(false),
            Some(true),
        );
        assert!(denied.contains("still visible"));
        assert!(!denied.contains("Hid and checked"));
        let missing = report(&Visibility::default(), Some(true), Some(false));
        assert!(missing.contains("does not establish"));
        assert!(missing.contains("Explorer was not restarted"));
        let hidden = report(
            &Visibility {
                found: 1,
                hidden: 1,
                ..Default::default()
            },
            None,
            None,
        );
        assert!(hidden.contains("Hid and checked"));
        assert!(hidden.contains("capture was unavailable"));
    }
}
