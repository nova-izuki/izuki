//! The Later list — things to remember with no time attached, like a sticky
//! note: "remind me later I'm buying Scrubbing Bubbles and Sensodyne",
//! "add milk to my list", "don't let me forget the charger". Izuki brings
//! them up at good moments by itself (welcome back, the morning brief,
//! before the shops close) and ticks them off when you say so ("I got the
//! toothpaste").

use std::path::PathBuf;

use anyhow::Result;
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Item {
    pub id: String,
    pub text: String,
    #[serde(default)]
    pub done: bool,
    pub added: u64,
}

static LOCK: Mutex<()> = Mutex::new(());

fn path() -> PathBuf {
    crate::store::data_dir().join("later.json")
}

fn read() -> Vec<Item> {
    std::fs::read_to_string(path()).ok().and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default()
}

fn write(all: &[Item]) -> Result<()> {
    std::fs::write(path(), serde_json::to_string_pretty(all)?)?;
    Ok(())
}

fn now_ms() -> u64 {
    std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).map(|d| d.as_millis() as u64).unwrap_or(0)
}

/// Everything on the list: still to do first, then done (newest first).
pub fn list() -> Vec<Item> {
    let _g = LOCK.lock();
    let mut all = read();
    // Ticked-off things clear themselves after two days.
    let keep = now_ms().saturating_sub(2 * 86_400_000);
    all.retain(|i| !i.done || i.added > keep);
    all.sort_by_key(|i| (i.done, std::cmp::Reverse(i.added)));
    all
}

pub fn open_items() -> Vec<String> {
    list().into_iter().filter(|i| !i.done).map(|i| i.text).collect()
}

pub fn add(texts: &[String]) -> Vec<Item> {
    let _g = LOCK.lock();
    let mut all = read();
    let mut added = Vec::new();
    for t in texts {
        let t = t.trim().trim_end_matches(['.', '!']).to_string();
        if t.is_empty() || all.iter().any(|i| !i.done && i.text.eq_ignore_ascii_case(&t)) {
            continue;
        }
        let item = Item { id: format!("{:x}", rand::random::<u64>()), text: t, done: false, added: now_ms() };
        all.push(item.clone());
        added.push(item);
    }
    let _ = write(&all);
    added
}

pub fn set_done(id: &str, done: bool) {
    let _g = LOCK.lock();
    let mut all = read();
    for i in all.iter_mut().filter(|i| i.id == id) {
        i.done = done;
    }
    let _ = write(&all);
}

pub fn remove(id: &str) {
    let _g = LOCK.lock();
    let mut all = read();
    all.retain(|i| i.id != id);
    let _ = write(&all);
}

/// Tick off whatever matches ("I got the toothpaste" → "Sensodyne toothpaste").
fn tick_matching(words: &str) -> Vec<String> {
    let _g = LOCK.lock();
    let mut all = read();
    let w = words.to_lowercase();
    let mut ticked = Vec::new();
    for i in all.iter_mut().filter(|i| !i.done) {
        let t = i.text.to_lowercase();
        let hit = t.split_whitespace().filter(|x| x.len() > 3).any(|x| w.contains(x)) || w.split_whitespace().filter(|x| x.len() > 3).any(|x| t.contains(x));
        if hit {
            i.done = true;
            ticked.push(i.text.clone());
        }
    }
    let _ = write(&all);
    ticked
}

#[derive(Debug, PartialEq)]
pub enum Ask {
    Add(Vec<String>),
    Read,
    Tick(String),
    Clear,
}

/// What a request to the list wants — worked out without any AI.
pub fn parse(said: &str) -> Option<Ask> {
    let s = said.trim().trim_end_matches(['.', '!', '?']).to_string();
    let l = s.to_lowercase();
    let l = l.trim_start_matches("hey nova").trim_start_matches("hey izuki").trim_start_matches([',', ' ']).to_string();
    let rest_after = |prefixes: &[&str]| -> Option<String> {
        prefixes.iter().find_map(|p| l.strip_prefix(p).map(|r| s[s.len() - r.len()..].trim().to_string()))
    };
    if ["what's on my list", "whats on my list", "what is on my list", "read my list", "what's on my later list", "my list", "what do i need to buy", "what do i need to get", "what was i supposed to buy", "what did i ask you to remind me", "what's on my shopping list"].iter().any(|p| l == *p || l.starts_with(p)) {
        return Some(Ask::Read);
    }
    if ["clear my list", "clear the list", "empty my list"].iter().any(|p| l == *p) {
        return Some(Ask::Clear);
    }
    for p in ["i got the ", "i got ", "i bought the ", "i bought ", "got the ", "done with the ", "i did the ", "tick off ", "cross off ", "check off "] {
        if let Some(r) = l.strip_prefix(p) {
            return Some(Ask::Tick(r.to_string()));
        }
    }
    // "add milk and eggs to my list"
    if let Some(r) = l.strip_prefix("add ").or_else(|| l.strip_prefix("put ")) {
        for tail in [" to my shopping list", " to the shopping list", " to my later list", " to my list", " to the list", " on my list", " on the list"] {
            if let Some(what) = r.strip_suffix(tail) {
                let start = s.len() - r.len();
                return Some(Ask::Add(split(&s[start..start + what.len()])));
            }
        }
    }
    let what = rest_after(&[
        "remind me later that i'm ", "remind me later that i am ", "remind me later that ", "remind me later to ", "remind me later about ",
        "remind me later ", "remember for later that ", "remember for later ", "don't let me forget to ", "dont let me forget to ",
        "don't let me forget ", "dont let me forget ", "note for later ", "for later: ", "later list: ",
    ])?;
    let what = what.trim_end_matches(" later").trim().to_string();
    // "…I'm buying X and Y" — the things themselves go on the list.
    let lw = what.to_lowercase();
    for lead in ["buying ", "going to buy ", "gonna buy ", "need to buy ", "to buy ", "buy ", "getting ", "to get ", "get "] {
        if lw.starts_with(lead) {
            return Some(Ask::Add(split(&what[lead.len()..])));
        }
    }
    (!what.is_empty()).then(|| Ask::Add(vec![capital(&what)]))
}

/// "scrubbing bubbles cleaner and sensodyne toothpaste" → two things.
fn split(list: &str) -> Vec<String> {
    list.replace(", and ", ",").replace(" and ", ",").replace(" & ", ",")
        .split(',')
        .map(|p| p.trim().trim_start_matches("some ").trim_start_matches("a ").trim_start_matches("an ").trim_start_matches("the ").trim())
        .filter(|p| !p.is_empty())
        .map(capital)
        .collect()
}

fn capital(s: &str) -> String {
    let mut c = s.chars();
    c.next().map(|f| f.to_uppercase().collect::<String>() + c.as_str()).unwrap_or_default()
}

fn join(items: &[String]) -> String {
    match items.len() {
        0 => String::new(),
        1 => items[0].clone(),
        n => format!("{} and {}", items[..n - 1].join(", "), items[n - 1]),
    }
}

/// Do it; what to say back.
pub fn run(ask: Ask) -> String {
    match ask {
        Ask::Add(things) => {
            let added = add(&things);
            if added.is_empty() {
                "That's already on your list.".into()
            } else {
                let names: Vec<String> = added.iter().map(|i| i.text.clone()).collect();
                format!("Got it — {} on your Later list. I'll remind you.", join(&names))
            }
        }
        Ask::Read => {
            let open = open_items();
            if open.is_empty() { "Your Later list is empty.".into() } else { format!("On your list: {}.", join(&open)) }
        }
        Ask::Tick(what) => {
            let ticked = tick_matching(&what);
            if ticked.is_empty() { "I couldn't find that on your list.".into() } else { format!("Nice — ticked off {}.", join(&ticked)) }
        }
        Ask::Clear => {
            let _g = LOCK.lock();
            let _ = write(&[]);
            "Cleared your Later list.".into()
        }
    }
}

/// A gentle mention for Izuki to bring up ("Don't forget: …"), if anything's open.
pub fn nudge_line() -> Option<String> {
    let open = open_items();
    (!open.is_empty()).then(|| format!("Don't forget — on your Later list: {}.", join(&open.iter().take(4).cloned().collect::<Vec<_>>())))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn understands_later_requests() {
        assert_eq!(
            parse("remind me later that I'm buying scrubbing bubbles cleaner and sensodyne toothpaste"),
            Some(Ask::Add(vec!["Scrubbing bubbles cleaner".into(), "Sensodyne toothpaste".into()]))
        );
        assert_eq!(parse("Add milk, eggs and bread to my shopping list."), Some(Ask::Add(vec!["Milk".into(), "Eggs".into(), "Bread".into()])));
        assert_eq!(parse("don't let me forget to call the plumber"), Some(Ask::Add(vec!["Call the plumber".into()])));
        assert_eq!(parse("what's on my list?"), Some(Ask::Read));
        assert_eq!(parse("I got the toothpaste"), Some(Ask::Tick("toothpaste".into())));
        assert_eq!(parse("remind me at 6pm to call mum"), None);
        assert_eq!(parse("open notepad"), None);
    }
}
