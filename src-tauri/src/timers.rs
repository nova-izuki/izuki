//! Timers — "Hey Nova, set a timer for 10 minutes", "pasta timer 12
//! minutes", "timer for the laundry, 45 minutes". Each one counts down on
//! the Island; when it's done Izuki chimes and says so out loud. Several can
//! run at once. "How long's left on the pasta?", "cancel the timer".

use std::time::{Duration, Instant};

use parking_lot::Mutex;
use serde::Serialize;
use tauri::{AppHandle, Emitter};

#[derive(Debug, Clone)]
struct Timer {
    id: u64,
    label: String,
    ends: Instant,
    total: u64,
}

static TIMERS: Mutex<Vec<Timer>> = Mutex::new(Vec::new());

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Running {
    pub id: u64,
    pub label: String,
    pub left: u64,
    pub total: u64,
}

/// The timers running now, soonest first (for the Island).
pub fn running() -> Vec<Running> {
    let now = Instant::now();
    let mut out: Vec<Running> = TIMERS
        .lock()
        .iter()
        .filter(|t| t.ends > now)
        .map(|t| Running { id: t.id, label: t.label.clone(), left: (t.ends - now).as_secs(), total: t.total })
        .collect();
    out.sort_by_key(|t| t.left);
    out
}

#[derive(Debug, PartialEq)]
pub enum Ask {
    Start { secs: u64, label: String },
    Cancel(Option<String>),
    Left(Option<String>),
}

/// What a timer request wants, or None when it isn't one.
pub fn parse(said: &str) -> Option<Ask> {
    let s = said.to_lowercase();
    let s = s.trim().trim_end_matches(['.', '!', '?']);
    let s = s.trim_start_matches("hey nova").trim_start_matches("hey izuki").trim_start_matches([',', ' ']).trim();
    if !s.contains("timer") {
        return None;
    }
    let label = label_in(s);
    if ["cancel", "stop", "delete", "remove", "clear", "turn off"].iter().any(|w| s.starts_with(w) || s.contains(&format!(" {w} "))) {
        return Some(Ask::Cancel(label));
    }
    if s.contains("how long") || s.contains("how much time") || s.contains("left on") || s.contains("time left") {
        return Some(Ask::Left(label));
    }
    let secs = duration_in(s)?;
    Some(Ask::Start { secs, label: label.unwrap_or_else(|| default_label(secs)) })
}

/// "12 minutes", "an hour and a half", "90 seconds", "1h 30m", "half an hour".
fn duration_in(s: &str) -> Option<u64> {
    if s.contains("half an hour") || s.contains("half hour") {
        return Some(30 * 60);
    }
    let words: Vec<&str> = s.split(|c: char| c.is_whitespace() || c == ',').filter(|w| !w.is_empty()).collect();
    let mut total = 0u64;
    let mut found = false;
    for (i, w) in words.iter().enumerate() {
        let next = words.get(i + 1).copied().unwrap_or("");
        let (num, unit_inline) = split_num(w);
        let n: Option<f64> = match num.as_str() {
            "a" | "an" | "one" => Some(1.0),
            "two" => Some(2.0),
            "three" => Some(3.0),
            "five" => Some(5.0),
            "ten" => Some(10.0),
            "fifteen" => Some(15.0),
            "twenty" => Some(20.0),
            "thirty" => Some(30.0),
            "forty" => Some(40.0),
            other => other.parse::<f64>().ok(),
        };
        let Some(n) = n else { continue };
        let unit = if unit_inline.is_empty() { next.to_string() } else { unit_inline };
        let mult = if unit.starts_with("hour") || unit == "h" || unit == "hr" || unit == "hrs" {
            3600.0
        } else if unit.starts_with("min") || unit == "m" {
            60.0
        } else if unit.starts_with("sec") || unit == "s" {
            1.0
        } else {
            continue;
        };
        total += (n * mult) as u64;
        found = true;
        if unit.starts_with("hour") && words.get(i + 2..i + 5).is_some_and(|x| x.join(" ") == "and a half") {
            total += 1800;
        }
    }
    (found && total > 0).then_some(total.min(24 * 3600))
}

/// "12m" → ("12", "m"); "12" → ("12", "").
fn split_num(w: &str) -> (String, String) {
    let i = w.find(|c: char| !(c.is_ascii_digit() || c == '.')).unwrap_or(w.len());
    if i == 0 {
        (w.to_string(), String::new())
    } else {
        (w[..i].to_string(), w[i..].to_string())
    }
}

/// "pasta timer", "timer for the pasta", "laundry timer" → "Pasta"/"Laundry".
fn label_in(s: &str) -> Option<String> {
    const SKIP: &[&str] = &["a", "an", "the", "my", "set", "start", "make", "cancel", "stop", "how", "long", "is", "left", "on", "for", "of", "please", "new", "another", "minute", "minutes", "hour", "hours", "second", "seconds", "and", "half"];
    let clean = |w: &str| -> Option<String> {
        let w = w.trim_matches(|c: char| !c.is_alphabetic());
        (w.len() > 2 && !SKIP.contains(&w) && w.parse::<f64>().is_err() && !w.chars().next().is_some_and(|c| c.is_ascii_digit()))
            .then(|| w[..1].to_uppercase() + &w[1..])
    };
    let words: Vec<&str> = s.split_whitespace().collect();
    let at = words.iter().position(|w| w.starts_with("timer"))?;
    // "pasta timer"
    if at > 0 {
        if let Some(l) = clean(words[at - 1]) {
            return Some(l);
        }
    }
    // "timer for the pasta (for 12 minutes)"
    let mut i = at + 1;
    while i < words.len() {
        if ["for", "the", "my"].contains(&words[i]) {
            i += 1;
            continue;
        }
        return clean(words[i]);
    }
    None
}

fn default_label(secs: u64) -> String {
    format!("{} timer", pretty(secs))
}

/// 750 → "12 minutes 30 seconds"; 3600 → "1 hour".
pub fn pretty(secs: u64) -> String {
    let (h, m, s) = (secs / 3600, (secs % 3600) / 60, secs % 60);
    let part = |n: u64, w: &str| format!("{n} {w}{}", if n == 1 { "" } else { "s" });
    let mut parts = Vec::new();
    if h > 0 {
        parts.push(part(h, "hour"));
    }
    if m > 0 {
        parts.push(part(m, "minute"));
    }
    if s > 0 && h == 0 {
        parts.push(part(s, "second"));
    }
    if parts.is_empty() { "0 seconds".into() } else { parts.join(" ") }
}

fn find(label: &Option<String>) -> Option<Timer> {
    let now = Instant::now();
    let t = TIMERS.lock();
    match label {
        Some(l) => t.iter().find(|x| x.ends > now && x.label.to_lowercase().contains(&l.to_lowercase())).cloned(),
        None => t.iter().filter(|x| x.ends > now).min_by_key(|x| x.ends).cloned(),
    }
}

pub fn run(app: &AppHandle, ask: Ask) -> String {
    match ask {
        Ask::Start { secs, label } => {
            let id = rand::random::<u32>() as u64;
            TIMERS.lock().push(Timer { id, label: label.clone(), ends: Instant::now() + Duration::from_secs(secs), total: secs });
            let app = app.clone();
            let l = label.clone();
            std::thread::spawn(move || {
                std::thread::sleep(Duration::from_secs(secs));
                let still = {
                    let mut t = TIMERS.lock();
                    let had = t.iter().any(|x| x.id == id);
                    t.retain(|x| x.id != id);
                    had
                };
                if still {
                    let text = if l.ends_with(" timer") { format!("⏰ Your {l} is done!") } else { format!("⏰ {l} — time's up!") };
                    let _ = app.emit(crate::buddy::EVENT, crate::buddy::Say { text, urgent: true });
                }
            });
            if label.ends_with(" timer") {
                format!("{} — starting now.", capital(&label))
            } else {
                format!("{label} timer set for {}.", pretty(secs))
            }
        }
        Ask::Cancel(label) => match find(&label) {
            Some(t) => {
                TIMERS.lock().retain(|x| x.id != t.id);
                format!("Cancelled the {} timer.", t.label.trim_end_matches(" timer"))
            }
            None => "There's no timer running.".into(),
        },
        Ask::Left(label) => match find(&label) {
            Some(t) => format!("{} left on the {}.", pretty(t.ends.saturating_duration_since(Instant::now()).as_secs()), t.label.trim_end_matches(" timer")),
            None => "There's no timer running.".into(),
        },
    }
}

fn capital(s: &str) -> String {
    let mut c = s.chars();
    c.next().map(|f| f.to_uppercase().collect::<String>() + c.as_str()).unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn understands_timer_requests() {
        assert_eq!(parse("Hey Nova, set a timer for 10 minutes"), Some(Ask::Start { secs: 600, label: "10 minutes timer".into() }));
        assert_eq!(parse("pasta timer 12 minutes"), Some(Ask::Start { secs: 720, label: "Pasta".into() }));
        assert_eq!(parse("set a timer for the laundry for 45 minutes"), Some(Ask::Start { secs: 2700, label: "Laundry".into() }));
        assert_eq!(parse("timer for an hour and a half"), Some(Ask::Start { secs: 5400, label: "1 hour 30 minutes timer".into() }));
        assert_eq!(parse("set a 90 second timer"), Some(Ask::Start { secs: 90, label: "1 minute 30 seconds timer".into() }));
        assert_eq!(parse("timer half an hour"), Some(Ask::Start { secs: 1800, label: "30 minutes timer".into() }));
        assert_eq!(parse("cancel the pasta timer"), Some(Ask::Cancel(Some("Pasta".into()))));
        assert_eq!(parse("how long is left on the timer"), Some(Ask::Left(None)));
        assert_eq!(parse("open notepad"), None);
        assert_eq!(parse("what is a timer in electronics"), None);
        assert_eq!(pretty(750), "12 minutes 30 seconds");
    }
}
