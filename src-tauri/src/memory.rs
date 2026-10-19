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
    let all: Vec<Memory> = fs::read_to_string(path())
        .ok()
        .and_then(|raw| serde_json::from_str(&raw).ok())
        .unwrap_or_default();
    // Older versions sometimes took a command for a name ("go back" →
    // "User wants to be called Back"): those never come back out.
    all.into_iter().filter(|m| !is_misheard_name(&m.text)).collect()
}

/// Words people say to Izuki all the time — never someone's name. "Check
/// again", "go back", "to check" were being saved as "User's name is Again".
const NOT_NAMES: &[&str] = &[
    "back", "again", "to", "check", "to check", "next", "done", "stop", "go", "ok", "okay", "yes", "no", "please",
    "it", "that", "this", "there", "here", "me", "more", "now", "later", "up", "down", "on", "off", "open", "close",
    "the", "a", "an", "and", "but", "so", "then", "continue", "keep going", "again with spark", "nova", "izuki",
    "atlas", "hey", "hi", "hello", "thanks", "thank you", "bye", "sure", "right", "left", "first", "second", "last",
];

fn is_misheard_name(text: &str) -> bool {
    let l = text.to_lowercase();
    let name = ["user's name is ", "users name is ", "user wants to be called ", "call the user ", "the user is called "]
        .iter()
        .find_map(|p| l.find(p).map(|i| l[i + p.len()..].trim().trim_end_matches(['.', '!']).to_string()));
    let Some(name) = name else { return false };
    NOT_NAMES.contains(&name.as_str()) || name.split_whitespace().next().is_some_and(|w| NOT_NAMES.contains(&w) && ["again", "back", "to", "check"].contains(&w))
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
/// Answers to a quiz or test, kept to be given back during one: never
/// remembered. Study notes in Izuki Notes are where those belong — to learn
/// from, not to be answered for.
fn test_answer(s: &str) -> bool {
    let l = format!(" {} ", s.to_lowercase());
    let about_a_test = [" quiz", " test", " exam", " midterm", " final", " question ", " questions", " q1", " q2", " ucertify", " assessment"].iter().any(|w| l.contains(w));
    let an_answer = [" answer", " correct option", " correct choice", " is true", " is false", " option a", " option b", " option c", " option d", " choice a", " choice b"].iter().any(|w| l.contains(w));
    about_a_test && an_answer || numbered_choice(&l)
}

/// "Question 3: B", "q12 - c", "#4) a": a numbered question with a letter answer.
fn numbered_choice(l: &str) -> bool {
    let b = l.as_bytes();
    let mut i = 0;
    while i < b.len() {
        let rest = &l[i..];
        let after = rest.strip_prefix("question").or_else(|| rest.strip_prefix('q')).or_else(|| rest.strip_prefix('#'));
        // The marker starts a word: "Q3", never the q in "unique".
        let starts_word = i == 0 || !b[i - 1].is_ascii_alphanumeric();
        if let (Some(after), true) = (after, starts_word) {
            let after = after.trim_start();
            let digits = after.chars().take_while(|c| c.is_ascii_digit()).count();
            if digits > 0 {
                let tail = after[digits..].trim_start_matches([':', '-', ')', '.', '=', ' ']);
                let mut cs = tail.chars();
                if let Some(c) = cs.next() {
                    if ('a'..='e').contains(&c) && cs.next().is_none_or(|n| !n.is_alphanumeric()) {
                        return true;
                    }
                }
            }
        }
        i += rest.chars().next().map_or(1, char::len_utf8);
    }
    false
}

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
    if text.len() < 3 || looks_secret(&text) || is_misheard_name(&text) || test_answer(&text) {
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
    // Test answers kept before this rule existed are never handed back either.
    let all: Vec<Memory> = list().into_iter().filter(|m| !test_answer(&m.text)).collect();
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
    fn commands_are_never_taken_for_a_name() {
        assert!(is_misheard_name("User wants to be called Back"));
        assert!(is_misheard_name("User's name is Again"));
        assert!(is_misheard_name("User wants to be called To Check"));
        assert!(is_misheard_name("User wants to be called Again With Spark"));
        assert!(!is_misheard_name("User's name is Sam"));
        assert!(!is_misheard_name("User wants to be called Ada"));
        assert!(!is_misheard_name("User likes jazz"));
    }

    #[test]
    fn never_keeps_test_answers() {
        assert!(test_answer("Quiz question 3 answer: the Tax Return hoax"));
        assert!(test_answer("For the security test, the correct option is B"));
        assert!(!test_answer("User has a security exam on Friday"));
        assert!(!test_answer("User likes to be quizzed with flashcards"));
        assert!(test_answer("Question 3: B"));
        assert!(test_answer("q12 - c and q13 - a"));
        assert!(!test_answer("User's unique id is 4"));
        assert!(!test_answer("Question 3 was hard for the user"));
    }

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
