//! Little things Izuki does on its own, only when you turn them on: press
//! "Skip ad" on YouTube and "Reject all" on cookie banners.
//!
//! Deliberately narrow. Each action presses one clearly-named button in the
//! browser that's in front of you — nothing is typed, bought, signed into or
//! closed, and nothing runs while Izuki is busy with something you asked for
//! or the PC is locked. The switches are `auto_skip_ads` and
//! `auto_reject_cookies` in Settings.

use std::time::{Duration, Instant};

use tauri::AppHandle;

const BROWSERS: &[&str] = &["chrome", "msedge", "firefox", "brave", "opera", "vivaldi", "arc"];

/// How often to look while a YouTube tab is in front (a skip button shows
/// after ~5 s, so a couple of seconds' wait is fine).
const YOUTUBE_EVERY: Duration = Duration::from_secs(2);
/// A cookie banner shows as a page loads: look a few times after the page
/// changes, then leave that page alone.
const COOKIE_LOOKS_PER_PAGE: u8 = 4;

/// A YouTube "Skip" button: "Skip", "Skip ad", "Skip ads", "Skip Ad ›".
pub fn is_skip_ad(name: &str) -> bool {
    let n = name.trim().to_lowercase();
    let n = n.trim_end_matches(|c: char| !c.is_alphanumeric()).trim();
    matches!(n, "skip" | "skip ad" | "skip ads" | "skip advertisement")
}

/// A cookie banner's refuse button. It has to say so plainly — a bare
/// "Reject" or "Close" could be anything.
pub fn is_reject_cookies(name: &str) -> bool {
    let n = name.trim().to_lowercase();
    if n.len() > 48 {
        return false;
    }
    let refuse = ["reject all", "reject all cookies", "decline all", "decline all cookies", "refuse all", "deny all",
        "only necessary cookies", "necessary cookies only", "use necessary cookies only", "only essential cookies",
        "essential cookies only", "reject non-essential", "reject optional cookies", "decline optional cookies"];
    refuse.iter().any(|r| n == *r) || (n.contains("cookie") && (n.starts_with("reject") || n.starts_with("decline")))
}

fn browser_in_front() -> bool {
    let app = crate::uia::front_app();
    BROWSERS.contains(&app.as_str())
}

/// The first visible button in the window in front that `want` says yes to.
fn press_first(want: fn(&str) -> bool) -> Option<String> {
    let control = crate::uia::list_controls(160)
        .into_iter()
        .find(|c| !c.hidden && matches!(c.kind.as_str(), "Button" | "Hyperlink") && want(&c.name))?;
    crate::uia::press_named(&control.name).then_some(control.name)
}

/// Run in the background: does nothing at all until one of the two is on.
pub fn spawn(_app: AppHandle) {
    let _ = std::thread::Builder::new().name("izuki-autonomous".into()).spawn(|| {
        let mut page = String::new();
        let mut cookie_looks = 0u8;
        let mut last_youtube = Instant::now() - YOUTUBE_EVERY;
        loop {
            std::thread::sleep(Duration::from_millis(1000));
            let Some(store) = crate::state::try_store() else { continue };
            let s = store.settings();
            if !(s.auto_skip_ads || s.auto_reject_cookies) {
                continue;
            }
            if crate::hotkey::is_busy() || crate::uia::screen_locked() || !browser_in_front() {
                continue;
            }
            let title = crate::uia::foreground_title();
            if title != page {
                page = title.clone();
                cookie_looks = 0;
            }
            let _ = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
                if s.auto_skip_ads && title.to_lowercase().contains("youtube") && last_youtube.elapsed() >= YOUTUBE_EVERY {
                    last_youtube = Instant::now();
                    if let Some(name) = press_first(is_skip_ad) {
                        eprintln!("[autonomous] pressed \"{name}\" on YouTube");
                    }
                }
                if s.auto_reject_cookies && cookie_looks < COOKIE_LOOKS_PER_PAGE {
                    cookie_looks += 1;
                    if let Some(name) = press_first(is_reject_cookies) {
                        eprintln!("[autonomous] pressed \"{name}\" on a cookie banner");
                        cookie_looks = COOKIE_LOOKS_PER_PAGE;
                    }
                }
            }));
        }
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn skip_buttons_only() {
        assert!(is_skip_ad("Skip"));
        assert!(is_skip_ad("Skip Ad"));
        assert!(is_skip_ad("Skip ads ›"));
        assert!(!is_skip_ad("Skip navigation"));
        assert!(!is_skip_ad("Skip intro"));
        assert!(!is_skip_ad("Subscribe"));
    }

    #[test]
    fn cookie_refusals_only() {
        assert!(is_reject_cookies("Reject all"));
        assert!(is_reject_cookies("Decline optional cookies"));
        assert!(is_reject_cookies("Only necessary cookies"));
        assert!(!is_reject_cookies("Accept all"));
        assert!(!is_reject_cookies("Reject"));
        assert!(!is_reject_cookies("Close"));
        assert!(!is_reject_cookies("Allow"));
        assert!(!is_reject_cookies("Decline invitation"));
    }
}
