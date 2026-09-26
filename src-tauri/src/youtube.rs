//! YouTube, done properly — "play Bundle by Bundle by Burna Boy on YouTube".
//!
//! This used to go through the screen agent: open YouTube, wait, screenshot,
//! ask the AI, click — seconds per step, and when a free AI was busy the
//! task quietly ended with nothing playing. And once a video did play, the
//! AI called the job done while an ad was running, and never skipped it.
//!
//! Now it's a skill with no AI at all: open the search, read the results
//! the way a screen reader does (UI Automation), click the video whose title
//! best matches, and keep an eye out for ads — the moment a "Skip" button
//! appears, it's pressed, for every ad, for the next few minutes. The ad
//! watch also starts whenever the agent opens or clicks around YouTube.

use std::sync::atomic::{AtomicBool, Ordering};
use std::time::{Duration, Instant};

use anyhow::Result;
use parking_lot::Mutex;

/// Keep skipping ads until then.
static WATCH_UNTIL: Mutex<Option<Instant>> = Mutex::new(None);
static WATCHING: AtomicBool = AtomicBool::new(false);
/// How long ads are watched for after something is played.
pub const AD_WATCH: Duration = Duration::from_secs(4 * 60);

pub fn search_url(query: &str) -> String {
    let q: String = query
        .trim()
        .bytes()
        .map(|b| match b {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => (b as char).to_string(),
            b' ' => "+".to_string(),
            _ => format!("%{b:02X}"),
        })
        .collect();
    format!("https://www.youtube.com/results?search_query={q}")
}

/// Search YouTube for `query` and start the best match. `Some(title)` once
/// it clicked a video; `None` if the results are open but no video matched
/// well enough to pick (they're left on screen).
pub fn play(query: &str) -> Result<Option<String>> {
    crate::apps::open_url(&search_url(query))?;
    watch_ads(AD_WATCH);
    let words = words(query);
    let started = Instant::now();
    // The results take a moment to arrive; look a few times rather than
    // waiting a fixed while.
    while started.elapsed() < Duration::from_secs(12) {
        std::thread::sleep(Duration::from_millis(700));
        if crate::automation::aborted() {
            return Ok(None);
        }
        if !crate::uia::foreground_title().to_lowercase().contains("youtube") {
            continue;
        }
        let controls = crate::uia::list_controls(160);
        if let Some(best) = best_result(&controls, &words) {
            let (x, y) = best.rect.center();
            eprintln!("[youtube] playing \"{}\"", best.name);
            crate::automation::click_at(x, y, enigo::Button::Left, 1, 260)?;
            return Ok(Some(short_title(&best.name)));
        }
    }
    Ok(None)
}

fn words(s: &str) -> Vec<String> {
    s.to_lowercase()
        .split(|c: char| !c.is_alphanumeric())
        .filter(|w| w.len() > 1 && !matches!(*w, "on" | "the" | "by" | "youtube" | "play" | "video" | "song" | "music"))
        .map(str::to_string)
        .collect()
}

/// The video link whose title shares the most words with the request —
/// never an ad, a Short, a channel or the page's own links.
fn best_result<'a>(controls: &'a [crate::uia::Control], want: &[String]) -> Option<&'a crate::uia::Control> {
    if want.is_empty() {
        return None;
    }
    let mut best: Option<(usize, &crate::uia::Control)> = None;
    for c in controls {
        if c.kind != "Hyperlink" || c.hidden || c.rect.w < 80 {
            continue;
        }
        let name = c.name.to_lowercase();
        if name.len() < 6
            || ["sponsored", "shorts", "subscribe", "skip navigation", "sign in", "home", "channel"]
                .iter()
                .any(|bad| name.contains(bad))
        {
            continue;
        }
        let have = words(&name);
        let hits = want.iter().filter(|w| have.contains(w)).count();
        // Most of what was asked for, at least.
        if hits * 2 < want.len() || hits == 0 {
            continue;
        }
        // Reading order breaks ties: the topmost result wins.
        if best.is_none_or(|(b, _)| hits > b) {
            best = Some((hits, c));
        }
    }
    best.map(|(_, c)| c)
}

/// "Burna Boy - Bundle by Bundle [Official Video] 3 minutes…" → the title part.
fn short_title(name: &str) -> String {
    let cut = name.find(" by ").filter(|i| *i > 8).unwrap_or(name.len());
    name[..cut].trim().chars().take(60).collect()
}

/// Press YouTube's "Skip" button whenever it shows up, for `how_long` (a new
/// call just extends the watch). Cheap: a look at the page's buttons about
/// once a second, only while YouTube is the window in front, no AI.
pub fn watch_ads(how_long: Duration) {
    *WATCH_UNTIL.lock() = Some(Instant::now() + how_long);
    if WATCHING.swap(true, Ordering::SeqCst) {
        return;
    }
    std::thread::Builder::new()
        .name("izuki-ads".into())
        .spawn(|| {
            loop {
                std::thread::sleep(Duration::from_millis(1100));
                let until = *WATCH_UNTIL.lock();
                if until.is_none_or(|u| Instant::now() > u) {
                    break;
                }
                if crate::uia::screen_locked() || !crate::uia::foreground_title().to_lowercase().contains("youtube") {
                    continue;
                }
                let controls = crate::uia::list_controls(140);
                if let Some(skip) = controls.iter().find(|c| is_skip_button(c)) {
                    let (x, y) = skip.rect.center();
                    // Put the pointer back where the user had it.
                    let back = crate::capture::cursor_pos();
                    if crate::automation::click_at(x, y, enigo::Button::Left, 1, 120).is_ok() {
                        eprintln!("[youtube] skipped an ad");
                        let _ = crate::automation::glide_to(back.0, back.1, 120);
                    }
                    std::thread::sleep(Duration::from_millis(1500));
                }
            }
            WATCHING.store(false, Ordering::SeqCst);
        })
        .ok();
}

fn is_skip_button(c: &crate::uia::Control) -> bool {
    if c.kind != "Button" || c.hidden {
        return false;
    }
    let n = c.name.trim().to_lowercase();
    n.starts_with("skip") && n.len() <= 24 && !n.contains("navigation") && !n.contains("intro") && !n.contains("forward")
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::Rect;
    use crate::uia::Control;

    fn c(id: u32, kind: &str, name: &str) -> Control {
        Control { id, kind: kind.into(), name: name.into(), rect: Rect { x: 0, y: id as i32 * 100, w: 300, h: 40 }, hidden: false, value: String::new(), focused: false }
    }

    #[test]
    fn picks_the_matching_video() {
        let list = vec![
            c(1, "Hyperlink", "Skip navigation"),
            c(2, "Hyperlink", "Sponsored · Burna Boy concert tickets"),
            c(3, "Hyperlink", "Burna Boy - Bundle by Bundle [Official Music Video] by Burna Boy 3 minutes"),
            c(4, "Hyperlink", "Burna Boy - Last Last"),
        ];
        let got = best_result(&list, &words("play bundle by bundle by burna boy on youtube")).unwrap();
        assert_eq!(got.id, 3);
        assert_eq!(short_title(&got.name), "Burna Boy - Bundle");
        assert!(best_result(&list, &words("taylor swift")).is_none());
    }

    #[test]
    fn knows_a_skip_button() {
        assert!(is_skip_button(&c(1, "Button", "Skip")));
        assert!(is_skip_button(&c(1, "Button", "Skip Ad")));
        assert!(is_skip_button(&c(1, "Button", "Skip ads")));
        assert!(!is_skip_button(&c(1, "Hyperlink", "Skip navigation")));
        assert!(!is_skip_button(&c(1, "Button", "Skip navigation")));
        assert!(!is_skip_button(&c(1, "Button", "Subscribe")));
    }

    #[test]
    fn builds_the_search_address() {
        assert_eq!(search_url("burna boy & wizkid"), "https://www.youtube.com/results?search_query=burna+boy+%26+wizkid");
    }
}
