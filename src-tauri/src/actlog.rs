//! "What Izuki did": a plain list of what Izuki did or changed on this PC
//! (clicks and keys on the screen, apps opened, looks, tweaks and layouts,
//! files cleared, messages sent), newest first, so you can always see what
//! happened and when.
//!
//! It stays on this PC (`%APPDATA%\Izuki\actions\<day>.jsonl`) for two weeks.
//! It never holds what was typed into a box (only how much) and never a
//! password. Settings → Privacy → "Keep a list of what Izuki does" turns it
//! off; "Clear the list" empties it.

use std::io::Write;
use std::path::PathBuf;

use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Entry {
    /// When (Unix milliseconds).
    pub at: i64,
    /// What sort of thing: screen, apps, style, files, messages, phone, system.
    pub kind: String,
    /// What happened, in plain words.
    pub text: String,
}

/// How many days are kept.
const KEEP_DAYS: i64 = 14;
/// The longest line kept (a long window title is cut).
const MOST_CHARS: usize = 180;

/// Serialises writes, and remembers the day already tidied this run.
static WRITING: parking_lot::Mutex<String> = parking_lot::Mutex::new(String::new());

fn dir() -> PathBuf {
    crate::store::data_dir().join("actions")
}

fn enabled() -> bool {
    crate::state::try_store().map_or(true, |s| s.settings().keep_activity)
}

/// One line, short, no stray spaces.
fn tidy(text: &str) -> String {
    let one: String = text.split_whitespace().collect::<Vec<_>>().join(" ");
    if one.chars().count() <= MOST_CHARS {
        return one;
    }
    let cut: String = one.chars().take(MOST_CHARS - 1).collect();
    format!("{}…", cut.trim_end())
}

/// A day's file name ("2026-11-10") is all a day can be: nothing else
/// reaches the folder.
fn is_day(day: &str) -> bool {
    day.len() == 10 && day.chars().enumerate().all(|(i, c)| if i == 4 || i == 7 { c == '-' } else { c.is_ascii_digit() })
}

/// Note something Izuki did. Never fails the action it describes: a list
/// that can't be written is only logged.
pub fn record(kind: &str, text: &str) {
    // Tests never write into the real list.
    if cfg!(test) || !enabled() {
        return;
    }
    let now = chrono::Local::now();
    let entry = Entry { at: now.timestamp_millis(), kind: kind.to_string(), text: tidy(text) };
    if entry.text.is_empty() {
        return;
    }
    let day = now.format("%Y-%m-%d").to_string();
    if let Err(e) = write_to(&dir(), &day, &entry) {
        eprintln!("[actlog] couldn't note what was done: {e}");
    }
}

fn write_to(folder: &std::path::Path, day: &str, entry: &Entry) -> Result<()> {
    let mut tidied = WRITING.lock();
    std::fs::create_dir_all(folder)?;
    // Once a day, older days go.
    if *tidied != day {
        prune(folder, day);
        *tidied = day.to_string();
    }
    let mut f = std::fs::OpenOptions::new().create(true).append(true).open(folder.join(format!("{day}.jsonl")))?;
    let mut line = serde_json::to_string(entry)?;
    line.push('\n');
    f.write_all(line.as_bytes())?;
    Ok(())
}

/// Removes days older than two weeks before `today`.
fn prune(folder: &std::path::Path, today: &str) {
    let Ok(today) = chrono::NaiveDate::parse_from_str(today, "%Y-%m-%d") else { return };
    let Ok(read) = std::fs::read_dir(folder) else { return };
    for e in read.flatten() {
        let name = e.file_name().to_string_lossy().to_string();
        let Some(day) = name.strip_suffix(".jsonl") else { continue };
        let Ok(d) = chrono::NaiveDate::parse_from_str(day, "%Y-%m-%d") else { continue };
        if (today - d).num_days() >= KEEP_DAYS {
            let _ = std::fs::remove_file(e.path());
        }
    }
}

/// The days that have something on them, newest first.
pub fn days() -> Vec<String> {
    days_in(&dir())
}

fn days_in(folder: &std::path::Path) -> Vec<String> {
    let mut out: Vec<String> = std::fs::read_dir(folder)
        .map(|r| r.flatten().filter_map(|e| e.file_name().to_string_lossy().strip_suffix(".jsonl").map(str::to_string)).filter(|d| is_day(d)).collect())
        .unwrap_or_default();
    out.sort_unstable_by(|a, b| b.cmp(a));
    out
}

/// What was done on one day ("2026-11-10"), newest first.
pub fn day(day: &str) -> Result<Vec<Entry>> {
    day_in(&dir(), day)
}

fn day_in(folder: &std::path::Path, day: &str) -> Result<Vec<Entry>> {
    if !is_day(day) {
        return Err(anyhow!("that isn't a day"));
    }
    let raw = match std::fs::read_to_string(folder.join(format!("{day}.jsonl"))) {
        Ok(raw) => raw,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(Vec::new()),
        Err(e) => return Err(e.into()),
    };
    // A line cut short (the PC switched off mid-write) is skipped, not fatal.
    let mut out: Vec<Entry> = raw.lines().filter_map(|l| serde_json::from_str(l).ok()).collect();
    out.reverse();
    Ok(out)
}

/// Empty the list.
pub fn clear() -> Result<()> {
    let _held = WRITING.lock();
    match std::fs::remove_dir_all(dir()) {
        Ok(()) => Ok(()),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(e) => Err(anyhow!("couldn't clear the list ({e})")),
    }
}

/// "What did you do today?", "what have you changed on my PC?". `Some(true)`
/// for yesterday. Not "what are you doing" (that's now), not small talk
/// about someone else.
pub fn parse_ask(said: &str) -> Option<bool> {
    let s = format!(" {} ", said.to_lowercase().replace(['’', '\''], "").chars().map(|c| if c.is_alphanumeric() { c } else { ' ' }).collect::<String>().split_whitespace().collect::<Vec<_>>().join(" "));
    let has = |w: &str| s.contains(w);
    let asks = [" what did you ", " what have you ", " whatve you ", " show me what you ", " show me what izuki ", " what did izuki ", " what has izuki ", " list what you "].iter().any(|w| has(w));
    let did = [" did", " done", " changed", " change "].iter().any(|w| has(w));
    let when_or_where = [" today", " yesterday", " on my pc", " on my computer", " on my laptop", " to my pc", " to my computer", " so far", " while i was away", " while i was gone"].iter().any(|w| has(w));
    (asks && did && when_or_where).then(|| has(" yesterday"))
}

/// The spoken answer: the day's actions in a sentence or two.
pub fn answer(yesterday: bool) -> String {
    if !enabled() {
        return "I don't keep a list of what I do right now — it's off in Settings → Privacy. Turn on \"Keep a list of what Izuki does\" and I'll note everything from then on.".into();
    }
    let when = if yesterday { chrono::Local::now() - chrono::Duration::days(1) } else { chrono::Local::now() };
    let list = day(&when.format("%Y-%m-%d").to_string()).unwrap_or_default();
    summary(&list, if yesterday { "yesterday" } else { "today" })
}

fn summary(list: &[Entry], when: &str) -> String {
    if list.is_empty() {
        return format!("Nothing {when} — I haven't done or changed anything on your PC.");
    }
    // Oldest first when told as a story; the last few only.
    let shown: Vec<String> = list.iter().take(6).rev().map(|e| lower_first(&e.text)).collect();
    let more = list.len().saturating_sub(shown.len());
    let mut out = format!("{} I {}", capitalise(when), join(&shown));
    out.push('.');
    if more > 0 {
        out.push_str(&format!(" That's the latest {} of {} things; the whole list is in Settings → Privacy → What Izuki did.", shown.len(), list.len()));
    }
    out
}

fn lower_first(s: &str) -> String {
    let mut c = s.chars();
    match c.next() {
        // Leave names and "I" as they are ("Opened Chrome" → "opened Chrome").
        Some(f) if c.clone().next().is_some_and(|n| n.is_lowercase()) => f.to_lowercase().chain(c).collect(),
        _ => s.to_string(),
    }
}

fn capitalise(s: &str) -> String {
    let mut c = s.chars();
    c.next().map_or_else(String::new, |f| f.to_uppercase().chain(c).collect())
}

fn join(items: &[String]) -> String {
    match items {
        [] => String::new(),
        [one] => one.clone(),
        [a, b] => format!("{a} and {b}"),
        [rest @ .., last] => format!("{}, and {last}", rest.join(", ")),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn temp() -> PathBuf {
        let d = std::env::temp_dir().join(format!("izuki-actlog-{}-{}", std::process::id(), rand::random::<u32>()));
        let _ = std::fs::remove_dir_all(&d);
        d
    }

    #[test]
    fn notes_read_back_newest_first_and_old_days_go() {
        let d = temp();
        let e = |t: &str| Entry { at: 1, kind: "apps".into(), text: t.into() };
        write_to(&d, "2026-10-01", &e("old")).unwrap();
        // A new day tidies away anything two weeks old.
        write_to(&d, "2026-11-10", &e("Opened Chrome")).unwrap();
        write_to(&d, "2026-11-10", &e("Arranged 2 windows side by side")).unwrap();
        assert_eq!(days_in(&d), vec!["2026-11-10".to_string()]);
        let today = day_in(&d, "2026-11-10").unwrap();
        assert_eq!(today.iter().map(|e| e.text.as_str()).collect::<Vec<_>>(), ["Arranged 2 windows side by side", "Opened Chrome"]);
        assert!(day_in(&d, "2026-11-09").unwrap().is_empty(), "a day with nothing");
        assert!(day_in(&d, "../settings").is_err(), "only a day reaches the folder");
        // A line cut short by a power cut is skipped.
        std::fs::OpenOptions::new().append(true).open(d.join("2026-11-10.jsonl")).unwrap().write_all(b"{\"at\":2,\"ki").unwrap();
        assert_eq!(day_in(&d, "2026-11-10").unwrap().len(), 2);
        let _ = std::fs::remove_dir_all(&d);
    }

    #[test]
    fn lines_are_short_and_on_one_line() {
        assert_eq!(tidy("  Clicked\n\"Send\"   in Gmail "), "Clicked \"Send\" in Gmail");
        let long = "x".repeat(400);
        assert_eq!(tidy(&long).chars().count(), MOST_CHARS);
        assert!(is_day("2026-11-10") && !is_day("2026-1-10") && !is_day("..\\x.json"));
    }

    #[test]
    fn asked_in_plain_words() {
        assert_eq!(parse_ask("what did you do today?"), Some(false));
        assert_eq!(parse_ask("Izuki, what have you changed on my PC?"), Some(false));
        assert_eq!(parse_ask("what did you do yesterday"), Some(true));
        assert_eq!(parse_ask("show me what you did while I was away"), Some(false));
        assert_eq!(parse_ask("what are you doing"), None, "now, not the list");
        assert_eq!(parse_ask("what did you think of the movie"), None);
        assert_eq!(parse_ask("what did my teacher do today"), None);
    }

    #[test]
    fn the_day_is_told_in_a_sentence() {
        let e = |t: &str| Entry { at: 1, kind: "apps".into(), text: t.into() };
        // Newest first, as read from the file.
        let list = vec![e("Arranged 2 windows side by side"), e("Opened Chrome")];
        assert_eq!(summary(&list, "today"), "Today I opened Chrome and arranged 2 windows side by side.");
        assert!(summary(&[], "today").starts_with("Nothing today"));
        let many: Vec<Entry> = (0..9).map(|i| e(&format!("Clicked button {i}"))).collect();
        assert!(summary(&many, "today").contains("latest 6 of 9"));
    }
}
