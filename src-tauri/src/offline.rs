//! Offline mode: no internet and no AI on this PC (Ollama / LM Studio), and
//! Izuki still helps instead of just saying "you're offline".
//!
//! Done right here: the time and date, maths, and what works offline (opening
//! apps, volume and music keys, reminders, Air control, Windows tweaks, the
//! voice and speech — all of those never needed the internet). Anything that
//! does need it is kept as a mission and done by itself the moment the
//! internet is back.

use std::sync::atomic::{AtomicBool, Ordering};

use chrono::Local;

/// Something was saved for when the internet is back.
static WAITING: AtomicBool = AtomicBool::new(false);

/// The offline answer to `said`.
pub fn answer(said: &str) -> String {
    let t = said.trim().to_lowercase();
    let t = t.trim_end_matches(['?', '!', '.']);
    if asks_clock(t) {
        let now = Local::now();
        return format!("It's {} on {}. (I'm offline right now, but I always know the time.)", now.format("%-I:%M %p"), now.format("%A, %B %-d"));
    }
    if let Some(v) = math(t) {
        let shown = if (v - v.round()).abs() < 1e-9 { format!("{}", v.round() as i64) } else { format!("{:.4}", v).trim_end_matches('0').trim_end_matches('.').to_string() };
        return format!("That's {shown}.");
    }
    if ["what can you do offline", "what works offline", "are you offline", "am i offline", "offline mode", "is the internet"].iter().any(|p| t.contains(p)) {
        return OFFLINE_HELP.into();
    }
    // A mission running right now must not save itself again; "hi",
    // "thanks", "ok" aren't things to do later.
    if crate::missions::running() || t.len() < 4 || small_talk(t) {
        return format!("{} {}", crate::brain::OFFLINE, "Things that work offline: opening apps, volume and music keys, reminders, Air control and the time.");
    }
    // Final or hard to undo: never done later on its own — the user asks
    // again when they're back and confirms it then.
    if risky(t) {
        return "I'm offline right now. That's something I'd want you to confirm, so I won't do it later by myself — ask me again once the internet's back.".into();
    }
    let same = |m: &crate::missions::Mission| m.state == "waiting" && m.text.trim().eq_ignore_ascii_case(said.trim());
    if crate::missions::list().iter().any(same) {
        WAITING.store(true, Ordering::SeqCst);
        return "I'm offline — that one's already saved, and I'll do it as soon as the internet's back.".into();
    }
    crate::missions::add(said);
    WAITING.store(true, Ordering::SeqCst);
    eprintln!("[offline] saved a request for when the internet is back");
    "I'm offline right now, so I've saved that — I'll do it by myself as soon as the internet's back (it's in your Missions). Meanwhile, opening apps, volume, music keys, reminders and Air control all still work.".into()
}

/// A greeting or a thanks — nothing to do later.
fn small_talk(t: &str) -> bool {
    const SMALL: &[&str] = &[
        "hi", "hey", "hello", "yo", "sup", "thanks", "thank you", "thx", "ok", "okay", "cool", "nice", "good", "great", "lol", "bye",
        "goodbye", "good night", "good morning", "how are you", "how are you doing", "what's up", "whats up", "you there", "are you there",
        "hey nova", "hi nova", "hello nova", "yes", "no", "nope", "yeah", "sure",
    ];
    let t = t.trim_matches(|c: char| !c.is_alphanumeric());
    SMALL.contains(&t) || t.split_whitespace().count() <= 4 && SMALL.iter().any(|s| t.starts_with(s) && ["nova", "izuki", "there", "buddy"].iter().any(|w| t.ends_with(w)))
}

/// "What time is it?" / "what's the date?" — not just any mention of time.
fn asks_clock(t: &str) -> bool {
    [
        "what time is it", "what's the time", "whats the time", "what is the time", "tell me the time", "current time", "time is it now",
        "what day is it", "what day is today", "what's the date", "whats the date", "what is the date", "today's date", "todays date", "what date is it",
    ]
    .iter()
    .any(|p| t.contains(p))
}

/// Sending, deleting, paying, posting…: never saved to run by itself later.
fn risky(t: &str) -> bool {
    const WORDS: &[&str] = &[
        "send", "email", "text", "message", "reply", "forward", "post", "publish", "tweet", "delete", "remove", "erase",
        "uninstall", "format", "wipe", "pay", "buy", "purchase", "order", "checkout", "transfer", "submit", "book", "cancel", "unsubscribe",
    ];
    let words: Vec<&str> = t.split(|c: char| !c.is_alphanumeric()).filter(|w| !w.is_empty()).collect();
    words.iter().any(|w| WORDS.contains(w)) || ["sign out", "log out", "shut down", "restart"].iter().any(|p| t.contains(p))
}

pub const OFFLINE_HELP: &str = "You're offline. Still working: opening apps and folders, volume and music keys, scrolling and tabs, reminders and timers, Air control, the Windows tweaks, the time and date, maths, and my voice and hearing. Anything that needs the internet, I save and do as soon as you're back online. For full answers offline, add a local AI (Ollama) in Settings.";

/// Watch for the internet coming back, then do what was saved.
pub fn spawn(app: tauri::AppHandle) {
    std::thread::spawn(move || loop {
        std::thread::sleep(std::time::Duration::from_secs(20));
        // Missions already running: wait for the next tick, never a second run.
        if WAITING.load(Ordering::SeqCst) && !crate::missions::running() && crate::brain::online() {
            WAITING.store(false, Ordering::SeqCst);
            eprintln!("[offline] back online — doing what was saved");
            crate::headsup::deliver(&app, "Back online", "Doing the things you asked for while you were offline.");
            crate::missions::run_all(&app);
        }
    });
}

/// "12 times 4", "(3 + 4) * 2", "15% of 80", "2^10" → the number.
fn math(t: &str) -> Option<f64> {
    let t = t
        .trim_start_matches("what is ")
        .trim_start_matches("what's ")
        .trim_start_matches("whats ")
        .trim_start_matches("calculate ")
        .trim_start_matches("work out ");
    // "15% of 80"
    if let Some((a, b)) = t.split_once("% of ") {
        let (a, b) = (a.trim().parse::<f64>().ok()?, b.trim().parse::<f64>().ok()?);
        return Some(a / 100.0 * b);
    }
    let e = t
        .replace("multiplied by", "*")
        .replace("divided by", "/")
        .replace(" times ", " * ")
        .replace(" x ", " * ")
        .replace(" plus ", " + ")
        .replace(" minus ", " - ")
        .replace(" over ", " / ")
        .replace("to the power of", "^")
        .replace(',', "");
    // Only digits and operators — a sentence is not maths.
    if !e.chars().any(|c| c.is_ascii_digit()) || !e.chars().all(|c| c.is_ascii_digit() || " .+-*/^()".contains(c)) || !e.chars().any(|c| "+-*/^".contains(c)) {
        return None;
    }
    let tokens: Vec<char> = e.chars().filter(|c| !c.is_whitespace()).collect();
    let mut p = Parser { t: tokens, i: 0 };
    let v = p.sum()?;
    (p.i == p.t.len() && v.is_finite()).then_some(v)
}

struct Parser {
    t: Vec<char>,
    i: usize,
}

impl Parser {
    fn peek(&self) -> Option<char> {
        self.t.get(self.i).copied()
    }
    fn sum(&mut self) -> Option<f64> {
        let mut v = self.product()?;
        while let Some(c @ ('+' | '-')) = self.peek() {
            self.i += 1;
            let r = self.product()?;
            v = if c == '+' { v + r } else { v - r };
        }
        Some(v)
    }
    fn product(&mut self) -> Option<f64> {
        let mut v = self.power()?;
        while let Some(c @ ('*' | '/')) = self.peek() {
            self.i += 1;
            let r = self.power()?;
            v = if c == '*' { v * r } else { v / r };
        }
        Some(v)
    }
    fn power(&mut self) -> Option<f64> {
        let base = self.unary()?;
        if self.peek() == Some('^') {
            self.i += 1;
            let exp = self.power()?;
            return Some(base.powf(exp));
        }
        Some(base)
    }
    fn unary(&mut self) -> Option<f64> {
        if self.peek() == Some('-') {
            self.i += 1;
            return Some(-self.unary()?);
        }
        self.atom()
    }
    fn atom(&mut self) -> Option<f64> {
        if self.peek() == Some('(') {
            self.i += 1;
            let v = self.sum()?;
            if self.peek() != Some(')') {
                return None;
            }
            self.i += 1;
            return Some(v);
        }
        let start = self.i;
        while self.peek().is_some_and(|c| c.is_ascii_digit() || c == '.') {
            self.i += 1;
        }
        self.t[start..self.i].iter().collect::<String>().parse().ok()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn does_the_maths() {
        assert_eq!(math("12 times 4"), Some(48.0));
        assert_eq!(math("what is (3 + 4) * 2"), Some(14.0));
        assert_eq!(math("15% of 80"), Some(12.0));
        assert_eq!(math("2^10"), Some(1024.0));
        assert_eq!(math("10 divided by 4"), Some(2.5));
        assert_eq!(math("open chrome"), None);
        assert_eq!(math("2024"), None);
    }

    #[test]
    fn knows_the_time_offline() {
        assert!(answer("what time is it?").starts_with("It's "));
        assert!(answer("what's the date today").starts_with("It's "));
        assert!(!asks_clock("remind me what the time zone in tokyo is"));
        assert!(!asks_clock("the time we went to the beach"));
        assert!(answer("what's 7 times 6").contains("42"));
        assert!(answer("what works offline").contains("Still working"));
    }

    #[test]
    fn never_saves_final_things() {
        assert!(risky("send mum a message saying i'm late"));
        assert!(risky("delete my downloads"));
        assert!(risky("buy the shoes in my cart"));
        assert!(!risky("find me a pasta recipe"));
        assert!(!risky("postpone thinking about it"));
        assert!(answer("email my boss the report").contains("confirm"));
        assert!(small_talk("hey nova") && small_talk("thanks!") && small_talk("how are you"));
        assert!(!small_talk("find me a cheap flight to lagos"));
    }
}
