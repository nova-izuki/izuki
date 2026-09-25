//! What Izuki remembers about the user from one day to the next — its
//! ChatGPT-style memory.
//!
//! Facts arrive two ways: the model adds them when the user mentions
//! something lasting ("I'm Sam", "I hate light mode"), or the user says
//! "remember that …" outright. They're short third-person lines, kept as
//! plain JSON in `%APPDATA%\Izuki\memories.json` so they can be read,
//! edited or wiped by hand, and every one can be deleted from the app.

use std::fs;
use std::path::PathBuf;

use parking_lot::Mutex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Memory {
    pub id: String,
    pub text: String,
    pub created_at: u64,
}

/// Oldest facts fall off past this — the prompt has to stay small.
const MAX_MEMORIES: usize = 150;
/// How many of the newest go into each request.
const IN_PROMPT: usize = 60;
const MAX_LEN: usize = 240;

static LOCK: Mutex<()> = Mutex::new(());

fn path() -> PathBuf {
    crate::store::data_dir().join("memories.json")
}

fn read() -> Vec<Memory> {
    fs::read_to_string(path())
        .ok()
        .and_then(|raw| serde_json::from_str(&raw).ok())
        .unwrap_or_default()
}

fn write(all: &[Memory]) {
    let p = path();
    if let Some(dir) = p.parent() {
        let _ = fs::create_dir_all(dir);
    }
    if let Ok(json) = serde_json::to_string_pretty(all) {
        // Write-then-rename so a crash mid-save can't wipe what's there.
        let tmp = p.with_extension("json.tmp");
        if fs::write(&tmp, json).is_ok() {
            let _ = fs::rename(&tmp, &p);
        }
    }
}

fn normalise(s: &str) -> String {
    s.to_lowercase()
        .chars()
        .filter(|c| c.is_alphanumeric() || c.is_whitespace())
        .collect::<String>()
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
}

/// Things that must never be written down, whoever asks.
fn looks_secret(s: &str) -> bool {
    let l = s.to_lowercase();
    ["password", "passcode", "api key", "apikey", "secret key", "pin code", "credit card", "cvv"]
        .iter()
        .any(|w| l.contains(w))
        || s.split_whitespace().any(|w| {
            // Long unbroken tokens mixing letters and digits read like keys.
            w.len() >= 24 && w.chars().any(|c| c.is_ascii_digit()) && w.chars().any(|c| c.is_ascii_alphabetic())
        })
}

pub fn list() -> Vec<Memory> {
    let _g = LOCK.lock();
    read()
}

/// Remember one fact. Returns it, or `None` if it was empty, a duplicate,
/// or something that shouldn't be stored.
pub fn add(text: &str) -> Option<Memory> {
    let text: String = text.trim().trim_end_matches('.').chars().take(MAX_LEN).collect();
    if text.len() < 3 || looks_secret(&text) {
        return None;
    }
    let _g = LOCK.lock();
    let mut all = read();
    let key = normalise(&text);
    if all.iter().any(|m| normalise(&m.text) == key) {
        return None;
    }
    let m = Memory {
        id: uuid::Uuid::new_v4().to_string(),
        text,
        created_at: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_millis() as u64)
            .unwrap_or(0),
    };
    all.push(m.clone());
    if all.len() > MAX_MEMORIES {
        let drop = all.len() - MAX_MEMORIES;
        all.drain(..drop);
    }
    write(&all);
    Some(m)
}

pub fn remove(id: &str) {
    let _g = LOCK.lock();
    let mut all = read();
    all.retain(|m| m.id != id);
    write(&all);
}

/// Forget every fact that mentions `about` (e.g. "forget my birthday").
/// Returns how many were dropped.
pub fn forget_about(about: &str) -> usize {
    let needle = normalise(about);
    if needle.is_empty() {
        return 0;
    }
    let _g = LOCK.lock();
    let mut all = read();
    let before = all.len();
    all.retain(|m| !normalise(&m.text).contains(&needle));
    let dropped = before - all.len();
    if dropped > 0 {
        write(&all);
    }
    dropped
}

pub fn clear() {
    let _g = LOCK.lock();
    write(&[]);
}

/// The block that goes into every request, or "" when there's nothing yet.
pub fn prompt_block() -> String {
    let all = list();
    if all.is_empty() {
        return String::new();
    }
    let start = all.len().saturating_sub(IN_PROMPT);
    let mut s = String::from(
        "What you remember about the user (use it naturally when it's relevant — don't recite it):\n",
    );
    for m in &all[start..] {
        s.push_str("- ");
        s.push_str(&m.text);
        s.push('\n');
    }
    s
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn refuses_secrets() {
        assert!(looks_secret("User's password is hunter2"));
        assert!(looks_secret("key sk-or-v1-8f2a9c7d1e0b4a6f93c2d5e8"));
        assert!(!looks_secret("User's name is Sam"));
        assert!(!looks_secret("User likes dark mode and lo-fi music"));
    }

    #[test]
    fn duplicates_compare_loosely() {
        assert_eq!(normalise("User likes  Dark mode."), normalise("user likes dark mode"));
    }
}
