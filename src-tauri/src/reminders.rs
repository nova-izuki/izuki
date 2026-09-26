//! Reminders — "remind me at five to call Mum", "in 20 minutes take the
//! pizza out". Kept as plain JSON in `%APPDATA%\Izuki\reminders.json`.
//!
//! No extra AI call is spent on them: whichever chat lane is answering
//! (voice, the Chat tab, the phone) is told the time, and adds a
//! `[REMIND 2026-09-26 17:00 | Call Mum]` line when the user asks for one.
//! [`take_tags`] pulls those lines out before the reply is shown or said.
//!
//! When one is due, Izuki says it out loud on the PC, shows it, and texts
//! it to the phone if one is paired (telegram.rs).

use std::fs;
use std::path::PathBuf;
use std::time::Duration;

use chrono::{Local, NaiveDateTime, TimeZone};
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};

pub const CHANGED: &str = "izuki://reminders-changed";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Reminder {
    pub id: String,
    /// When it's due, Unix milliseconds.
    pub at: i64,
    pub text: String,
}

static LOCK: Mutex<()> = Mutex::new(());
/// For telling the Chat tab the list changed, from wherever a tag is found.
static APP: std::sync::OnceLock<AppHandle> = std::sync::OnceLock::new();

fn path() -> PathBuf {
    crate::store::data_dir().join("reminders.json")
}

fn read() -> Vec<Reminder> {
    fs::read_to_string(path())
        .ok()
        .and_then(|raw| serde_json::from_str(&raw).ok())
        .unwrap_or_default()
}

fn write(all: &[Reminder]) {
    let p = path();
    if let Some(dir) = p.parent() {
        let _ = fs::create_dir_all(dir);
    }
    if let Ok(json) = serde_json::to_string_pretty(all) {
        let tmp = p.with_extension("json.tmp");
        if fs::write(&tmp, json).is_ok() {
            let _ = fs::rename(&tmp, &p);
        }
    }
}

/// Every pending reminder, soonest first.
pub fn list() -> Vec<Reminder> {
    let _g = LOCK.lock();
    let mut all = read();
    all.sort_by_key(|r| r.at);
    all
}

pub fn add(at: i64, text: &str) -> Reminder {
    let _g = LOCK.lock();
    let r = Reminder {
        id: uuid::Uuid::new_v4().to_string(),
        at,
        text: text.trim().chars().take(300).collect(),
    };
    let mut all = read();
    all.push(r.clone());
    write(&all);
    eprintln!("[remind] set for {}: {}", describe_time(at), r.text);
    r
}

pub fn remove(id: &str) {
    let _g = LOCK.lock();
    let mut all = read();
    all.retain(|r| r.id != id);
    write(&all);
}

/// "today at 5:00 PM", "tomorrow at 9:30 AM", "Fri 3 Oct at 8:00 AM".
pub fn describe_time(at: i64) -> String {
    let Some(t) = Local.timestamp_millis_opt(at).single() else { return "soon".into() };
    let today = Local::now().date_naive();
    let day = if t.date_naive() == today {
        "today".to_string()
    } else if Some(t.date_naive()) == today.succ_opt() {
        "tomorrow".to_string()
    } else {
        t.format("%a %-d %b").to_string()
    };
    format!("{day} at {}", t.format("%-I:%M %p"))
}

/// What the chat lanes are told so they can set reminders themselves.
pub fn prompt_block() -> String {
    let now = Local::now();
    format!(
        "It is now {} ({}). If the user asks you to remind them of something, confirm it in your \
         reply and add, on its own line at the very end, [REMIND YYYY-MM-DD HH:MM | what to remind \
         them] using their local time on a 24-hour clock — e.g. \"in 20 minutes\" is {}. Only when \
         they ask for a reminder.\n",
        now.format("%A %-d %B %Y, %H:%M"),
        now.format("%Z"),
        (now + chrono::Duration::minutes(20)).format("%Y-%m-%d %H:%M"),
    )
}

/// Pull every `[REMIND … | …]` out of a reply, setting each one. Returns the
/// reply without them.
pub fn take_tags(reply: &str) -> String {
    let mut out = String::with_capacity(reply.len());
    let mut rest = reply;
    let mut added = false;
    while let Some(start) = rest.find("[REMIND") {
        out.push_str(&rest[..start]);
        let after = &rest[start..];
        let end = after.find(']').map(|e| e + 1).unwrap_or(after.len());
        let tag = &after[..end];
        if let Some((at, text)) = parse_tag(tag) {
            add(at, &text);
            added = true;
        }
        rest = &after[end..];
    }
    out.push_str(rest);
    if added {
        if let Some(app) = APP.get() {
            let _ = app.emit(CHANGED, ());
        }
    }
    out.trim().to_string()
}

fn parse_tag(tag: &str) -> Option<(i64, String)> {
    let inner = tag.trim_start_matches("[REMIND").trim_end_matches(']').trim();
    let (when, what) = inner.split_once('|')?;
    let when = when.trim();
    let naive = NaiveDateTime::parse_from_str(when, "%Y-%m-%d %H:%M")
        .or_else(|_| NaiveDateTime::parse_from_str(when, "%Y-%m-%dT%H:%M"))
        .or_else(|_| NaiveDateTime::parse_from_str(when, "%Y-%m-%d %H:%M:%S"))
        .ok()?;
    let at = Local.from_local_datetime(&naive).earliest()?.timestamp_millis();
    let what = what.trim();
    (!what.is_empty()).then(|| (at, what.to_string()))
}

/// Check for due reminders every few seconds, for as long as Izuki runs.
pub fn spawn(app: AppHandle) {
    let _ = APP.set(app.clone());
    std::thread::Builder::new()
        .name("izuki-remind".into())
        .spawn(move || loop {
            std::thread::sleep(Duration::from_secs(5));
            let now = Local::now().timestamp_millis();
            let due: Vec<Reminder> = {
                let _g = LOCK.lock();
                let all = read();
                let (due, keep): (Vec<_>, Vec<_>) = all.into_iter().partition(|r| r.at <= now);
                if !due.is_empty() {
                    write(&keep);
                }
                due
            };
            for r in due {
                eprintln!("[remind] due: {}", r.text);
                let line = format!("Hey — reminder: {}", r.text);
                let _ = app.emit(
                    crate::events::STATUS,
                    crate::model::StatusEvent::info(format!("⏰ {}", r.text)),
                );
                let _ = app.emit(
                    "izuki://say",
                    serde_json::json!({ "text": line, "mood": "cheerful", "reply": true }),
                );
                crate::companion::notify_everywhere(&format!("⏰ Reminder: {}", r.text));
                let _ = app.emit(CHANGED, ());
            }
        })
        .ok();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_a_reminder_tag() {
        let (at, what) = parse_tag("[REMIND 2030-01-02 17:05 | Call Mum]").unwrap();
        let t = Local.timestamp_millis_opt(at).unwrap();
        assert_eq!(t.format("%Y-%m-%d %H:%M").to_string(), "2030-01-02 17:05");
        assert_eq!(what, "Call Mum");
        assert!(parse_tag("[REMIND tomorrow | x]").is_none());
        assert!(parse_tag("[REMIND 2030-01-02 17:05 | ]").is_none());
    }
}
