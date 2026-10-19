//! Each AI's per-minute allowance, learned and respected.
//!
//! Free AIs cap how much they take per minute (Groq's free screen model:
//! 7,000 tokens a minute — and one look at the screen was 5,000–6,300, so
//! Izuki could ask it about once a minute, then waited out refusals). Here:
//! - the allowance is learned from the AI's own refusal ("Limit 7000");
//! - what was sent in the last minute is counted;
//! - a request too big for a tight allowance is sent leaner (fewer controls,
//!   shorter page text) — the screenshot and the ask stay whole;
//! - an AI that would refuse is skipped at once, with how long until it has
//!   room, instead of a round trip that ends in "too many requests".

use std::collections::{HashMap, VecDeque};
use std::time::{Duration, Instant};

use parking_lot::Mutex;

struct Book {
    /// Learned tokens-per-minute limits, by "provider/model".
    limits: HashMap<String, usize>,
    /// What was sent, by key: (when, tokens).
    sent: HashMap<String, VecDeque<(Instant, usize)>>,
}

static BOOK: Mutex<Option<Book>> = Mutex::new(None);

fn with<T>(f: impl FnOnce(&mut Book) -> T) -> T {
    let mut g = BOOK.lock();
    let b = g.get_or_insert_with(|| Book { limits: HashMap::new(), sent: HashMap::new() });
    f(b)
}

pub fn key(provider: &str, model: &str) -> String {
    format!("{provider}/{model}").to_lowercase()
}

/// Tokens a request will cost, roughly: text at ~4 characters a token, a
/// picture at about (width × height) / 750.
pub fn estimate(text_chars: usize, image: Option<(u32, u32)>) -> usize {
    text_chars / 4 + image.map(|(w, h)| (w as usize * h as usize) / 750).unwrap_or(0)
}

/// "…tokens per minute (ITPM): Limit 7000, Used 2091, Requested 5231…" → 7000.
pub fn limit_in(err: &str) -> Option<usize> {
    let e = err.to_lowercase();
    // Input tokens only: an output-token limit (OTPM) is a different allowance.
    let per_minute = e.contains("per minute") || e.contains("tpm");
    let output = e.contains("otpm") || e.contains("output tokens");
    if !per_minute || output || !e.contains("token") {
        return None;
    }
    // The "limit" with a number after it ("Rate limit reached… Limit 7000").
    e.match_indices("limit ").find_map(|(at, _)| {
        let n: String = e[at + 6..].chars().take_while(|c| c.is_ascii_digit()).collect();
        n.parse().ok().filter(|n: &usize| *n >= 500)
    })
}

/// Learn from a refusal.
pub fn learn(key: &str, err: &str) {
    if let Some(limit) = limit_in(err) {
        let known = with(|b| b.limits.insert(key.to_string(), limit));
        if known != Some(limit) {
            eprintln!("[budget] {key} takes about {limit} tokens a minute — requests to it will be sized for that");
        }
    }
}

pub fn limit(key: &str) -> Option<usize> {
    with(|b| b.limits.get(key).copied())
}

fn used(b: &mut Book, key: &str, now: Instant) -> usize {
    let q = b.sent.entry(key.to_string()).or_default();
    while q.front().is_some_and(|(t, _)| now.duration_since(*t) > Duration::from_secs(60)) {
        q.pop_front();
    }
    q.iter().map(|(_, n)| n).sum()
}

/// A request this big should be sent leaner to this AI (it's over half its allowance).
pub fn tight(key: &str, tokens: usize) -> bool {
    limit(key).is_some_and(|l| tokens > l / 2)
}

/// `None`: it fits now. `Some(wait)`: this AI won't have room for that long.
pub fn room_in(key: &str, tokens: usize) -> Option<Duration> {
    let now = Instant::now();
    with(|b| {
        let lim = *b.limits.get(key)?;
        let cap = lim * 95 / 100;
        // Bigger than the whole allowance even with nothing else sent:
        // waiting won't help — send it and let the AI decide.
        if tokens > cap || used(b, key, now) + tokens <= cap {
            return None;
        }
        // When enough of the last minute's sends age out.
        let q = b.sent.get(key)?;
        let mut freed = 0;
        let total: usize = q.iter().map(|(_, n)| n).sum();
        for (t, n) in q {
            freed += n;
            if total - freed + tokens <= cap {
                return Some(Duration::from_secs(60).saturating_sub(now.duration_since(*t)) + Duration::from_secs(1));
            }
        }
        Some(Duration::from_secs(60))
    })
}

/// A refused request didn't use the allowance: take it back off.
pub fn release(key: &str, tokens: usize) {
    with(|b| {
        if let Some(q) = b.sent.get_mut(key) {
            if let Some(i) = q.iter().rposition(|(_, n)| *n == tokens) {
                q.remove(i);
            }
        }
    });
}

pub fn record(key: &str, tokens: usize) {
    let now = Instant::now();
    with(|b| {
        used(b, key, now);
        b.sent.entry(key.to_string()).or_default().push_back((now, tokens));
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn learns_and_respects_the_allowance() {
        let err = "groq is rate-limiting you (429 Too Many Requests): Rate limit reached for model `qwen/qwen3.8-27b` in organization `org_x` service tier `on_demand` on input tokens per minute (ITPM): Limit 7000, Used 2091, Requested 5231.";
        assert_eq!(limit_in(err), Some(7000));
        assert_eq!(limit_in("Rate limit reached on tokens per day (TPD): Limit 3600"), None, "a daily limit isn't a per-minute one");
        assert_eq!(limit_in("HTTP 500"), None);
        assert_eq!(limit_in("Request too large on output tokens per minute (OTPM): Limit 1000, Requested 1035"), None, "output limits aren't the input allowance");
        let k = key("groq", "test-model-a");
        learn(&k, err);
        assert!(tight(&k, 5000), "5,000 of 7,000 is too big to send whole");
        assert!(!tight(&k, 2000));
        assert_eq!(room_in(&k, 3000), None);
        record(&k, 3000);
        record(&k, 3000);
        let wait = room_in(&k, 3000).expect("9,000 > 6,650: no room now");
        assert!(wait <= Duration::from_secs(61) && wait >= Duration::from_secs(1));
        assert_eq!(room_in(&key("groq", "never-refused"), 99_999), None, "unknown allowance: always try");
        release(&k, 3000);
        assert_eq!(room_in(&k, 3000), None, "a refused request is taken back off");
        assert_eq!(room_in(&k, 50_000), None, "bigger than the whole allowance: try it anyway, waiting won't help");
        assert_eq!(estimate(4000, Some((1280, 720))), 1000 + 1228);
    }
}
