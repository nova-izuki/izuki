//! Patience: open each thing once, then give it time.
//!
//! A person whose app is slow to open waits for it — they don't open five
//! copies. Izuki remembers what it opened a moment ago, waits for the window
//! as long as THIS PC usually takes (learned as it goes, so a slow laptop
//! gets more time and a fast one isn't kept waiting), and in a browser it's
//! already using it stays in the same tab — ctrl+L, type, Enter — instead of
//! opening yet another one.

use std::time::{Duration, Instant};

use anyhow::Result;
use parking_lot::Mutex;

/// Asking for the same thing again within this long means it's still coming.
const SAME_THING: Duration = Duration::from_secs(60);
/// A tab Izuki opened stays "its own" (fine to reuse) for this long.
const OWN_TAB: Duration = Duration::from_secs(600);

/// What Izuki opened lately: (what, when).
static OPENED: Mutex<Vec<(String, Instant)>> = Mutex::new(Vec::new());
/// How long a window usually takes to appear on this PC, in seconds.
static SPEED: Mutex<Option<f32>> = Mutex::new(None);
/// Browser tab titles Izuki itself brought up: (title, when).
static OWN_TITLES: Mutex<Vec<(String, Instant)>> = Mutex::new(Vec::new());

const BROWSERS: &[&str] = &["chrome", "msedge", "firefox", "brave", "opera", "vivaldi", "arc", "iexplore"];

/// The same thing written the same way ("https://www.x.com/" = "x.com").
pub fn key(kind: &str, what: &str) -> String {
    let w = what.trim().to_lowercase();
    let w = w.trim_start_matches("https://").trim_start_matches("http://").trim_start_matches("www.").trim_end_matches('/');
    format!("{kind}:{w}")
}

/// Izuki opened this a moment ago — how long ago.
pub fn opened_lately(k: &str) -> Option<Duration> {
    let mut list = OPENED.lock();
    list.retain(|(_, at)| at.elapsed() < SAME_THING);
    list.iter().rev().find(|(x, _)| x == k).map(|(_, at)| at.elapsed())
}

fn note_opened(k: String) {
    let mut list = OPENED.lock();
    list.retain(|(x, at)| at.elapsed() < SAME_THING && *x != k);
    list.push((k, Instant::now()));
}

/// A window took `secs` to show: fold it into how fast this PC is.
fn learn(secs: f32) {
    let mut s = SPEED.lock();
    *s = Some(match *s {
        Some(avg) => avg * 0.7 + secs * 0.3,
        None => secs,
    });
}

/// How long to wait for something to open on this PC: about two and a half
/// times what it usually takes, never under 4 s or over 25 s.
pub fn patience() -> Duration {
    patience_for(*SPEED.lock())
}

fn patience_for(avg: Option<f32>) -> Duration {
    let avg = avg.unwrap_or(2.5);
    Duration::from_secs_f32((avg * 2.5 + 1.5).clamp(4.0, 25.0))
}

/// 1.0 on a quick PC, up to 3.0 on a slow one — for stretching other waits.
pub fn slowness() -> f32 {
    SPEED.lock().map(|avg| (avg / 2.0).clamp(1.0, 3.0)).unwrap_or(1.0)
}

/// Wait for what was just opened to come up: the window in front changes,
/// or a new window named like it appears. Seconds it took, or `None` if it
/// still hasn't after all the patience this PC gets.
fn wait_for_window(before: &[String], before_front: &str, hint: &str) -> Option<f32> {
    let started = Instant::now();
    let limit = patience();
    let hint = hint.to_lowercase();
    while started.elapsed() < limit {
        std::thread::sleep(Duration::from_millis(150));
        if crate::automation::aborted() {
            return None;
        }
        let front = crate::uia::foreground_title();
        if !front.is_empty() && front != before_front {
            return Some(started.elapsed().as_secs_f32());
        }
        if !hint.is_empty()
            && crate::uia::open_windows(40).iter().any(|t| !before.contains(t) && t.to_lowercase().contains(&hint))
        {
            return Some(started.elapsed().as_secs_f32());
        }
    }
    None
}

/// The app Izuki is working in is a web browser.
fn browser_in_front() -> bool {
    let app = crate::uia::foreground_app().to_lowercase();
    let app = app.trim_end_matches(".exe");
    BROWSERS.contains(&app)
}

/// The tab in front is one Izuki may take over: a page it opened itself, a
/// search results page or a new tab — never one of the user's own pages (a
/// half-written form, their doc), which keep their tab.
fn tab_is_ours(title: &str) -> bool {
    let t = title.to_lowercase();
    let throwaway = ["new tab", "google search", "- search", "bing", "duckduckgo", "start page", "speed dial", "youtube"]
        .iter()
        .any(|w| t.contains(w));
    let mut own = OWN_TITLES.lock();
    own.retain(|(_, at)| at.elapsed() < OWN_TAB);
    throwaway || own.iter().any(|(x, _)| !x.is_empty() && t.starts_with(x.as_str()))
}

/// Remember the tab in front as Izuki's own — now, and once the page has
/// finished loading and named itself.
fn remember_tab() {
    let note = || {
        let t = crate::uia::foreground_title();
        // The browser's name on the end changes nothing ("… - Google Chrome").
        let t = t.rsplit_once(" - ").map(|(a, _)| a.to_string()).unwrap_or(t).to_lowercase();
        if !t.trim().is_empty() {
            OWN_TITLES.lock().push((t, Instant::now()));
        }
    };
    note();
    std::thread::spawn(move || {
        std::thread::sleep(Duration::from_millis(2500));
        if browser_in_front() {
            note();
        }
    });
}

/// Go to a web address the way a person would: in the tab Izuki is already
/// using when there is one (address bar, type, Enter), else a new tab.
/// `true` if it stayed in the same tab.
pub fn go_to(url: &str) -> Result<bool> {
    let full = if url.starts_with("http://") || url.starts_with("https://") { url.to_string() } else { format!("https://{url}") };
    if browser_in_front() && tab_is_ours(&crate::uia::foreground_title()) {
        crate::uia::focus_target_window();
        std::thread::sleep(Duration::from_millis(60));
        crate::automation::press_key("ctrl+l")?;
        std::thread::sleep(Duration::from_millis(90));
        crate::automation::type_text(&full)?;
        std::thread::sleep(Duration::from_millis(40));
        crate::automation::press_key("enter")?;
        remember_tab();
        return Ok(true);
    }
    crate::apps::open_url(&full)?;
    remember_tab();
    Ok(false)
}

/// The agent's "open this app": once, then wait for it.
pub fn open_app(name: &str) -> Result<String> {
    let k = key("app", &crate::apps::find_app(name).unwrap_or_else(|| name.to_string()));
    let shown = name.trim().to_string();
    if let Some(ago) = opened_lately(&k) {
        let left = patience().saturating_sub(ago);
        if !left.is_zero() {
            let before = crate::uia::open_windows(40);
            let front = crate::uia::foreground_title();
            if wait_for_window(&before, &front, &shown).is_some() {
                return Ok(format!("{shown} is open now (it was already opening — didn't open another)"));
            }
        }
        return Ok(format!(
            "{shown} was already started {}s ago — didn't open another copy. It's slow to come up on this PC: \
             set \"wait\" and look again, or use it if it's on screen.",
            ago.as_secs()
        ));
    }
    let before = crate::uia::open_windows(40);
    let front = crate::uia::foreground_title();
    let opened = crate::apps::open_app(name)?;
    note_opened(k);
    Ok(match wait_for_window(&before, &front, &opened) {
        Some(secs) => {
            learn(secs);
            format!("opened {opened}")
        }
        None => format!(
            "started {opened}, but it's taking a while to open on this PC — don't open it again; \
             set \"wait\" to a few seconds and look again"
        ),
    })
}

/// The agent's "open this page": once, in the same tab when it can.
pub fn open_url(url: &str) -> Result<String> {
    let k = key("url", url);
    if let Some(ago) = opened_lately(&k) {
        let front = crate::uia::foreground_title();
        return Ok(format!(
            "{url} was already opened {}s ago — didn't open it again{}. Use the page that's up, or set \"wait\" if it's still loading.",
            ago.as_secs(),
            if front.is_empty() { String::new() } else { format!(" (in front now: \"{front}\")") }
        ));
    }
    let before = crate::uia::open_windows(40);
    let front = crate::uia::foreground_title();
    let same_tab = go_to(url)?;
    note_opened(k);
    if let Some(secs) = wait_for_window(&before, &front, "") {
        learn(secs);
    }
    Ok(if same_tab { format!("went to {url} in the same tab") } else { format!("opened {url}") })
}

/// The agent's web search: in the tab it's already on when it can.
pub fn search(query: &str) -> Result<String> {
    let k = key("search", query);
    if let Some(ago) = opened_lately(&k) {
        return Ok(format!("already searched for \"{query}\" {}s ago — use those results instead of searching again", ago.as_secs()));
    }
    let before = crate::uia::open_windows(40);
    let front = crate::uia::foreground_title();
    let same_tab = go_to(&crate::apps::search_url(query))?;
    note_opened(k);
    if let Some(secs) = wait_for_window(&before, &front, "") {
        learn(secs);
    }
    Ok(if same_tab { format!("searched the web for {query} in the same tab") } else { format!("searched the web for {query}") })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn same_thing_is_the_same_and_waits_fit_the_pc() {
        assert_eq!(key("url", "https://www.lenovo.com/parts/"), key("url", "lenovo.com/parts"));
        assert_ne!(key("url", "lenovo.com"), key("app", "lenovo.com"));
        note_opened(key("app", "notepad"));
        assert!(opened_lately(&key("app", "notepad")).is_some());
        assert!(opened_lately(&key("app", "paint")).is_none());
        // A quick PC isn't kept waiting; a slow one gets more time, within reason.
        assert_eq!(patience_for(Some(0.5)), Duration::from_secs(4));
        assert!(patience_for(Some(6.0)) > Duration::from_secs(15));
        assert_eq!(patience_for(Some(60.0)), Duration::from_secs(25));
        // Search results and new tabs are fair game; the user's own pages aren't.
        assert!(tab_is_ours("lenovo 20s1sa4w03 webcam - Google Search - Google Chrome"));
        assert!(tab_is_ours("New Tab - Google Chrome"));
        assert!(!tab_is_ours("My journal assignment - Google Docs - Google Chrome"));
    }
}
