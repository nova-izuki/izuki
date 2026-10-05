//! Focus mode — "Hey Nova, focus for 25 minutes". A countdown on the Island,
//! buddy mode holds everything that isn't urgent, and when time's up Izuki
//! says so and tells you what came in meanwhile.

use std::time::{Duration, Instant};

use parking_lot::Mutex;
use tauri::AppHandle;

static UNTIL: Mutex<Option<Instant>> = Mutex::new(None);
static RUN: Mutex<u64> = Mutex::new(0);

#[derive(Debug, PartialEq)]
pub enum Ask {
    Start(u64),
    Stop,
    Left,
}

/// Seconds left, if a focus session is on.
pub fn left() -> Option<u64> {
    let until = (*UNTIL.lock())?;
    let now = Instant::now();
    (until > now).then(|| (until - now).as_secs())
}

pub fn active() -> bool {
    left().is_some()
}

/// "focus for 25 minutes", "pomodoro", "focus mode for an hour", "stop focus".
pub fn parse(said: &str) -> Option<Ask> {
    let s = said.to_lowercase();
    let s = s.trim().trim_end_matches(['.', '!', '?']);
    let s = s.trim_start_matches("hey nova").trim_start_matches("hey izuki").trim_start_matches([',', ' ']);
    if ["stop focus", "end focus", "stop focusing", "focus off", "turn off focus", "cancel focus", "end the focus", "stop the focus"].iter().any(|p| s.starts_with(p)) {
        return Some(Ask::Stop);
    }
    if ["how long left", "how much time left", "how long is left"].iter().any(|p| s.starts_with(p)) && active() {
        return Some(Ask::Left);
    }
    let asks = s.starts_with("focus") || s.contains("focus mode") || s.contains("pomodoro") || s.starts_with("help me focus") || s.starts_with("let me focus") || s.starts_with("i need to focus");
    if !asks {
        return None;
    }
    // How long: "25 minutes", "an hour", "half an hour", "1.5 hours", default 25.
    let words: Vec<&str> = s.split_whitespace().collect();
    let mut minutes = 25u64;
    if s.contains("half an hour") || s.contains("half hour") || s.contains("30 min") {
        return Some(Ask::Start(30));
    }
    for (i, w) in words.iter().enumerate() {
        let next = words.get(i + 1).copied().unwrap_or("");
        let n = match *w {
            "an" | "a" | "one" => Some(1.0),
            "half" => None,
            "two" => Some(2.0),
            "three" => Some(3.0),
            other => other.parse::<f64>().ok(),
        };
        if let Some(n) = n {
            if next.starts_with("hour") {
                minutes = (n * 60.0) as u64;
            } else if next.starts_with("min") {
                minutes = n as u64;
            }
        }
        if *w == "half" && (next == "an" || next.starts_with("hour")) {
            minutes = 30;
        }
    }
    Some(Ask::Start(minutes.clamp(1, 240)))
}

/// Do it; what to say back.
pub fn run(app: &AppHandle, ask: Ask) -> String {
    match ask {
        Ask::Start(m) => {
            *UNTIL.lock() = Some(Instant::now() + Duration::from_secs(m * 60));
            let run = {
                let mut r = RUN.lock();
                *r += 1;
                *r
            };
            let app = app.clone();
            std::thread::spawn(move || {
                std::thread::sleep(Duration::from_secs(m * 60));
                if *RUN.lock() != run {
                    return; // stopped or restarted meanwhile
                }
                *UNTIL.lock() = None;
                crate::buddy::focus_over(&app, m);
            });
            format!("Focus mode on for {m} minutes. I'll keep everything that isn't urgent until you're done — go get it.")
        }
        Ask::Stop => {
            let was = UNTIL.lock().take().is_some();
            *RUN.lock() += 1;
            if was {
                let app = app.clone();
                std::thread::spawn(move || crate::buddy::focus_over(&app, 0));
                "Focus mode off.".into()
            } else {
                "Focus mode wasn't on.".into()
            }
        }
        Ask::Left => match left() {
            Some(s) if s >= 60 => format!("{} minutes left. You've got this.", s.div_ceil(60)),
            Some(s) => format!("{s} seconds left — nearly there."),
            None => "Focus mode isn't on.".into(),
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn understands_focus_requests() {
        assert_eq!(parse("Hey Nova, focus for 25 minutes"), Some(Ask::Start(25)));
        assert_eq!(parse("focus mode for an hour"), Some(Ask::Start(60)));
        assert_eq!(parse("focus for half an hour"), Some(Ask::Start(30)));
        assert_eq!(parse("pomodoro"), Some(Ask::Start(25)));
        assert_eq!(parse("i need to focus for 2 hours"), Some(Ask::Start(120)));
        assert_eq!(parse("stop focus"), Some(Ask::Stop));
        assert_eq!(parse("open notepad"), None);
        assert_eq!(parse("what is the focus of this essay"), None);
    }
}
