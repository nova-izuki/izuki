//! Lessons per app and site: what tripped Izuki up there, and what worked.
//!
//! When a click had to be done another way, a step kept failing, or a task
//! had to pause, a short tip is kept for that app or site ("pressing things
//! by name worked when the screen position didn't"). The next task there
//! gets those tips in its instructions — so the same trap isn't fallen into
//! every time, in any app, without anyone fixing that app by hand.
//!
//! Small and local: lessons.json, at most 8 tips per app, the most useful
//! (seen most, seen lately) first; old ones fade.

use std::collections::BTreeMap;

use parking_lot::Mutex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Tip {
    pub text: String,
    pub seen: u32,
    /// Unix ms.
    pub last: i64,
}

static TURN: Mutex<()> = Mutex::new(());

fn path() -> std::path::PathBuf {
    crate::store::data_dir().join("lessons.json")
}

fn load() -> BTreeMap<String, Vec<Tip>> {
    std::fs::read_to_string(path()).ok().and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default()
}

/// "chrome.exe" + a page → the site; anything else → the app.
pub fn place(app: &str, page_url: Option<&str>) -> String {
    if let Some(host) = page_url.and_then(|u| u.split("://").nth(1)).and_then(|r| r.split('/').next()).filter(|h| !h.is_empty()) {
        return host.trim_start_matches("www.").to_lowercase();
    }
    app.trim().trim_end_matches(".exe").to_lowercase()
}

/// Keep (or strengthen) a tip for this app or site.
pub fn note(app: &str, tip: &str) {
    let key = place(app, crate::ext::snapshot_url_cached().as_deref());
    if key.is_empty() || tip.trim().is_empty() {
        return;
    }
    let _turn = TURN.lock();
    let mut all = load();
    let now = crate::model::now_ms();
    let list = all.entry(key).or_default();
    match list.iter_mut().find(|t| t.text == tip) {
        Some(t) => {
            t.seen += 1;
            t.last = now;
        }
        None => list.push(Tip { text: tip.chars().take(200).collect(), seen: 1, last: now }),
    }
    rank(list, now);
    list.truncate(8);
    let tmp = path().with_extension("json.tmp");
    if std::fs::write(&tmp, serde_json::to_string(&all).unwrap_or_default()).and_then(|_| std::fs::rename(&tmp, path())).is_err() {
        eprintln!("[lessons] couldn't save");
    }
}

/// Most useful first: seen often, seen lately (a tip fades over ~60 days).
pub fn rank(list: &mut [Tip], now: i64) {
    let score = |t: &Tip| t.seen as f64 / (1.0 + ((now - t.last).max(0) as f64 / (60.0 * 86_400_000.0)));
    list.sort_by(|a, b| score(b).total_cmp(&score(a)));
}

/// What to tell the brain about this app or site (empty when nothing's known).
pub fn prompt_block(app: &str, page_url: Option<&str>) -> String {
    let key = place(app, page_url);
    let all = load();
    let Some(list) = all.get(&key).filter(|l| !l.is_empty()) else { return String::new() };
    let tips: Vec<String> = list.iter().take(4).map(|t| format!("- {}", t.text)).collect();
    format!("\nLESSONS FROM EARLIER TASKS IN {key} (use them):\n{}\n", tips.join("\n"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn where_and_what_first() {
        assert_eq!(place("chrome.exe", Some("https://www.blackboard.sanjac.edu/ultra/course")), "blackboard.sanjac.edu");
        assert_eq!(place("FL64.exe", None), "fl64");
        let now = 100 * 86_400_000;
        let mut l = vec![
            Tip { text: "old but common".into(), seen: 5, last: now - 120 * 86_400_000 },
            Tip { text: "fresh".into(), seen: 2, last: now },
            Tip { text: "once, long ago".into(), seen: 1, last: now - 200 * 86_400_000 },
        ];
        rank(&mut l, now);
        assert_eq!(l[0].text, "fresh", "seen lately beats seen long ago");
        assert_eq!(l[2].text, "once, long ago");
    }
}
