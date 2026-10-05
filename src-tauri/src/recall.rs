//! Recall — "what was that site I was on this morning?", "what was I doing at
//! 3?". Off until the user turns it on. When on, Izuki notes the title of the
//! window in front when it changes (never its contents, never private or
//! sign-in windows), keeps a week of it on this PC only, and answers from it.

use std::path::PathBuf;
use std::time::Duration;

use chrono::{Local, TimeZone, Timelike};
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Seen {
    /// When, in ms since 1970.
    pub at: u64,
    pub app: String,
    pub title: String,
}

static LOCK: Mutex<()> = Mutex::new(());
const KEEP_DAYS: u64 = 7;
const KEEP_MAX: usize = 4000;

fn path() -> PathBuf {
    crate::store::data_dir().join("recall.json")
}

fn read() -> Vec<Seen> {
    std::fs::read_to_string(path()).ok().and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default()
}

fn write(all: &[Seen]) {
    if let Ok(s) = serde_json::to_string(all) {
        let _ = std::fs::write(path(), s);
    }
}

fn now_ms() -> u64 {
    std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).map(|d| d.as_millis() as u64).unwrap_or(0)
}

/// Note the window in front every few seconds while Recall is on.
pub fn spawn() {
    std::thread::spawn(|| {
        let mut last = String::new();
        loop {
            std::thread::sleep(Duration::from_secs(8));
            let on = crate::state::try_store().is_some_and(|s| s.settings().recall_enabled);
            if !on {
                continue;
            }
            let app = crate::uia::foreground_app();
            let title = crate::uia::foreground_title();
            if title.trim().is_empty() || private(&app, &title) {
                continue;
            }
            let key = format!("{app}|{title}");
            if key == last {
                continue;
            }
            last = key;
            let _g = LOCK.lock();
            let mut all = read();
            all.push(Seen { at: now_ms(), app: app.trim_end_matches(".exe").to_string(), title: title.chars().take(200).collect() });
            let keep = now_ms().saturating_sub(KEEP_DAYS * 86_400_000);
            all.retain(|s| s.at > keep);
            let excess = all.len().saturating_sub(KEEP_MAX);
            all.drain(..excess);
            write(&all);
        }
    });
}

/// Windows that are never written down.
fn private(app: &str, title: &str) -> bool {
    let t = title.to_lowercase();
    let a = app.to_lowercase();
    ["inprivate", "incognito", "private browsing", "sign in", "log in", "login", "password", "bank", "1password", "bitwarden", "keepass", "lastpass"]
        .iter()
        .any(|w| t.contains(w) || a.contains(w))
        || a.contains("izuki")
}

pub fn forget() {
    let _g = LOCK.lock();
    write(&[]);
}

/// "What was that site…", "what was I doing at 3", "what did I have open
/// about tax" — the question, if it is one.
pub fn is_recall_question(said: &str) -> bool {
    let s = said.to_lowercase();
    [
        "what was i doing", "what was i looking at", "what was i working on", "what did i have open", "what was that site",
        "what was that page", "what was that website", "what was that video", "what was that document", "what was that file",
        "find the page i", "find that page", "find the site i", "where was i", "what was i reading", "what was i watching",
        "which site was i", "which page was i",
    ]
    .iter()
    .any(|p| s.contains(p))
}

/// Answer from the record. `None` when Recall is off.
pub fn answer(said: &str) -> Option<String> {
    if !crate::state::try_store().is_some_and(|s| s.settings().recall_enabled) {
        return Some("Recall is off, so I haven't been keeping track of what was on screen. You can turn it on under Talk to Izuki → Recall — it stays on this PC only.".into());
    }
    let all = { let _g = LOCK.lock(); read() };
    Some(answer_from(&all, said, now_ms()))
}

fn answer_from(all: &[Seen], said: &str, now: u64) -> String {
    let s = said.to_lowercase();
    // When: "this morning", "yesterday", "at 3", "an hour ago" — or any time.
    let today = Local.timestamp_millis_opt(now as i64).single().unwrap_or_else(Local::now);
    let day_start = today.with_hour(0).and_then(|d| d.with_minute(0)).and_then(|d| d.with_second(0)).map(|d| d.timestamp_millis() as u64).unwrap_or(0);
    let (from, to) = if s.contains("yesterday") {
        (day_start.saturating_sub(86_400_000), day_start)
    } else if s.contains("this morning") {
        (day_start, day_start + 12 * 3_600_000)
    } else if s.contains("this afternoon") {
        (day_start + 12 * 3_600_000, day_start + 18 * 3_600_000)
    } else if s.contains("tonight") || s.contains("this evening") {
        (day_start + 18 * 3_600_000, now)
    } else if s.contains("an hour ago") || s.contains("earlier") {
        (now.saturating_sub(3 * 3_600_000), now)
    } else if let Some(h) = hour_asked(&s) {
        let at = day_start + h * 3_600_000;
        (at.saturating_sub(20 * 60_000), at + 40 * 60_000)
    } else {
        (now.saturating_sub(KEEP_DAYS * 86_400_000), now)
    };
    // What about: the question's own words, minus the asking.
    const ASKING: &[&str] = &[
        "what", "was", "i", "doing", "looking", "at", "working", "on", "did", "have", "open", "that", "site", "page", "website",
        "video", "document", "file", "find", "the", "where", "reading", "watching", "which", "about", "this", "morning",
        "afternoon", "evening", "yesterday", "earlier", "an", "hour", "ago", "today", "tonight", "a", "for", "me", "my", "with",
        "hey", "nova", "izuki", "it", "is", "in", "of", "to", "pm", "am", "o'clock",
    ];
    let words: Vec<String> = s
        .split(|c: char| !c.is_alphanumeric())
        .filter(|w| w.len() > 1 && !ASKING.contains(w) && w.parse::<u32>().is_err())
        .map(str::to_string)
        .collect();
    let mut hits: Vec<&Seen> = all
        .iter()
        .filter(|e| e.at >= from && e.at <= to)
        .filter(|e| words.is_empty() || { let t = e.title.to_lowercase(); words.iter().any(|w| t.contains(w.as_str())) })
        .collect();
    if hits.is_empty() {
        return if words.is_empty() {
            "I don't have anything noted for that time.".into()
        } else {
            format!("I couldn't find anything about {} in what was on your screen.", words.join(" "))
        };
    }
    hits.reverse(); // newest first
    hits.dedup_by(|a, b| a.title == b.title);
    let clock = |ms: u64| Local.timestamp_millis_opt(ms as i64).single().map(|d| d.format("%-I:%M %p").to_string()).unwrap_or_default();
    let lines: Vec<String> = hits.iter().take(3).map(|e| format!("{} — {}", clock(e.at), tidy(&e.title))).collect();
    format!("Here's what I found: {}.", lines.join("; "))
}

/// "at 3", "at 3pm", "around 10" → 15, 15, 10 (afternoon guessed for 1–6).
fn hour_asked(s: &str) -> Option<u64> {
    let words: Vec<&str> = s.split_whitespace().collect();
    for (i, w) in words.iter().enumerate() {
        if *w == "at" || *w == "around" {
            let next = words.get(i + 1)?;
            let pm = next.ends_with("pm") || words.get(i + 2).is_some_and(|x| *x == "pm");
            let n: u64 = next.trim_end_matches("pm").trim_end_matches("am").split(':').next()?.parse().ok()?;
            if n > 23 {
                return None;
            }
            return Some(if pm && n < 12 { n + 12 } else if !pm && (1..=6).contains(&n) && !next.ends_with("am") { n + 12 } else { n });
        }
    }
    None
}

/// "Stranger Things | Netflix - Google Chrome" → "Stranger Things | Netflix".
fn tidy(title: &str) -> String {
    for tail in [" - Google Chrome", " - Microsoft​ Edge", " - Microsoft Edge", " — Mozilla Firefox", " - Mozilla Firefox", " - Brave"] {
        if let Some(t) = title.strip_suffix(tail) {
            return t.to_string();
        }
    }
    title.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn answers_from_what_was_on_screen() {
        let base = Local.with_ymd_and_hms(2026, 10, 4, 0, 0, 0).single().unwrap().timestamp_millis() as u64;
        let at = |h: u64, m: u64| base + h * 3_600_000 + m * 60_000;
        let all = vec![
            Seen { at: at(9, 10), app: "chrome".into(), title: "Tax refund guide | GOV.UK - Google Chrome".into() },
            Seen { at: at(15, 5), app: "chrome".into(), title: "Stranger Things | Netflix - Google Chrome".into() },
            Seen { at: at(15, 30), app: "winword".into(), title: "Journal week 4.docx - Word".into() },
        ];
        let now = at(18, 0);
        assert!(answer_from(&all, "what was that site about tax", now).contains("Tax refund guide"));
        assert!(answer_from(&all, "what was I doing at 3", now).contains("Stranger Things"));
        assert!(answer_from(&all, "what was I looking at this morning", now).contains("Tax refund"));
        assert!(answer_from(&all, "what was that page about pizza", now).contains("couldn't find"));
        assert!(is_recall_question("Hey Nova, what was that site I was on this morning?"));
        assert!(!is_recall_question("open netflix"));
        assert!(private("chrome.exe", "New InPrivate tab"));
        assert!(private("chrome.exe", "Sign in - Google Accounts"));
    }
}
