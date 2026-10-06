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
//!
//! Alarms are reminders that ring: `[ALARM 2026-09-30 07:00 | Wake up | weekdays]`
//! — a sound that keeps going until Stop or Snooze, the panel brought up,
//! and (with a repeat) set again for the next time.

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
    /// Rings (a sound until Stop or Snooze) instead of just being said.
    #[serde(default)]
    pub alarm: bool,
    /// "" (once), "daily", "weekdays", "weekends", or days like "mon,wed,fri".
    #[serde(default)]
    pub repeat: String,
}

pub const ALARM: &str = "izuki://alarm";

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
    add_full(at, text, false, "")
}

pub fn add_full(at: i64, text: &str, alarm: bool, repeat: &str) -> Reminder {
    let _g = LOCK.lock();
    let r = Reminder {
        id: uuid::Uuid::new_v4().to_string(),
        at,
        text: text.trim().chars().take(300).collect(),
        alarm,
        repeat: normalise_repeat(repeat),
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
         they ask for a reminder.\n\
         For an ALARM (\"wake me up at 7\", \"set an alarm\", \"alarm every weekday at 6:30\") use \
         [ALARM YYYY-MM-DD HH:MM | label | repeat] instead — it rings until they stop it. repeat is \
         empty for once, or daily, weekdays, weekends, or days like mon,wed,fri. The first time is \
         the next time that clock time comes round.\n\
         PLANNING: when they give you their plans or ask you to plan their day or week (\"gym at 7, \
         class at 10, study 2 to 4\"), lay it out briefly and add a [REMIND] a few minutes before \
         each thing (and an [ALARM] to wake them if they mention getting up), one tag per line.\n",
        now.format("%A %-d %B %Y, %H:%M"),
        now.format("%Z"),
        (now + chrono::Duration::minutes(20)).format("%Y-%m-%d %H:%M"),
    )
}

/// "Weekdays" → "weekdays", "Mon, Wed" → "mon,wed"; anything unknown → "" (once).
fn normalise_repeat(repeat: &str) -> String {
    let r = repeat.trim().to_lowercase();
    match r.as_str() {
        "" | "once" | "none" | "no" => String::new(),
        "daily" | "every day" | "everyday" => "daily".into(),
        "weekdays" | "every weekday" | "workdays" => "weekdays".into(),
        "weekends" | "every weekend" => "weekends".into(),
        _ => {
            let days: Vec<&str> = r
                .split([',', ' ', '/'])
                .filter_map(|d| {
                    let d = d.trim();
                    ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].into_iter().find(|n| !d.is_empty() && d.starts_with(n))
                })
                .collect();
            days.join(",")
        }
    }
}

/// When a repeating alarm rings next, after `at` (same clock time).
pub fn next_time(at: i64, repeat: &str) -> Option<i64> {
    use chrono::Datelike;
    if repeat.is_empty() {
        return None;
    }
    let t = Local.timestamp_millis_opt(at).single()?;
    let ok = |w: chrono::Weekday| -> bool {
        let n = w.num_days_from_monday();
        match repeat {
            "daily" => true,
            "weekdays" => n < 5,
            "weekends" => n >= 5,
            days => days.split(',').any(|d| ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].iter().position(|x| *x == d) == Some(n as usize)),
        }
    };
    (1..=7).find_map(|k| {
        let day = t.date_naive() + chrono::Duration::days(k);
        ok(day.weekday()).then(|| Local.from_local_datetime(&day.and_time(t.time())).earliest())?
    }).map(|d| d.timestamp_millis())
}

/// Snooze: the same alarm again in `minutes`.
pub fn snooze(text: &str, minutes: i64) -> Reminder {
    let r = add_full(Local::now().timestamp_millis() + minutes * 60_000, text, true, "");
    if let Some(app) = APP.get() {
        let _ = app.emit(CHANGED, ());
    }
    r
}

/// Pull every `[REMIND … | …]` out of a reply, setting each one. Returns the
/// reply without them.
pub fn take_tags(reply: &str) -> String {
    let mut out = String::with_capacity(reply.len());
    let mut rest = reply;
    let mut added = false;
    loop {
        let next = [rest.find("[REMIND"), rest.find("[ALARM")].into_iter().flatten().min();
        let Some(start) = next else { break };
        out.push_str(&rest[..start]);
        let after = &rest[start..];
        let end = after.find(']').map(|e| e + 1).unwrap_or(after.len());
        let tag = &after[..end];
        if tag.starts_with("[ALARM") {
            if let Some((at, text, repeat)) = parse_alarm(tag) {
                add_full(at, &text, true, &repeat);
                added = true;
            }
        } else if let Some((at, text)) = parse_tag(tag) {
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

/// `[ALARM 2026-09-30 07:00 | Wake up | weekdays]` (label and repeat optional).
fn parse_alarm(tag: &str) -> Option<(i64, String, String)> {
    let inner = tag.trim_start_matches("[ALARM").trim_end_matches(']').trim();
    let mut parts = inner.split('|');
    let when = parts.next()?.trim();
    let label = parts.next().map(str::trim).filter(|l| !l.is_empty()).unwrap_or("Alarm").to_string();
    let repeat = parts.next().map(str::trim).unwrap_or_default().to_string();
    let (at, _) = parse_tag(&format!("[REMIND {when} | x]"))?;
    Some((at, label, repeat))
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
                let (due, mut keep): (Vec<_>, Vec<_>) = all.into_iter().partition(|r| r.at <= now);
                // A repeating alarm is set again for its next day.
                for r in &due {
                    if let Some(next) = next_time(r.at, &r.repeat) {
                        keep.push(Reminder { id: uuid::Uuid::new_v4().to_string(), at: next, ..r.clone() });
                    }
                }
                if !due.is_empty() {
                    write(&keep);
                }
                due
            };
            for r in due {
                // Missed while the PC was asleep for hours: say so quietly,
                // never ring an alarm that's long gone.
                let late = now - r.at > 30 * 60_000;
                if r.alarm && !late {
                    eprintln!("[remind] alarm: {}", r.text);
                    let _ = crate::overlay::show_config(&app);
                    let _ = app.emit(ALARM, serde_json::json!({ "id": r.id, "text": r.text, "at": r.at }));
                    crate::companion::notify_everywhere(&format!("⏰ {}", r.text));
                    let _ = app.emit(CHANGED, ());
                    continue;
                }
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
    fn alarms_are_read_and_repeat() {
        use chrono::Datelike;
        let (at, label, repeat) = parse_alarm("[ALARM 2030-01-02 07:00 | Wake up | Weekdays]").unwrap();
        assert_eq!(label, "Wake up");
        assert_eq!(normalise_repeat(&repeat), "weekdays");
        assert_eq!(parse_alarm("[ALARM 2030-01-02 07:00]").unwrap().1, "Alarm");
        assert_eq!(normalise_repeat("Mon, Wed and Fri"), "mon,wed,fri");
        assert_eq!(normalise_repeat("once"), "");
        // 2030-01-04 is a Friday: the next weekday alarm is Monday the 7th, same time.
        let fri = Local.from_local_datetime(&NaiveDateTime::parse_from_str("2030-01-04 07:00", "%Y-%m-%d %H:%M").unwrap()).earliest().unwrap();
        let next = Local.timestamp_millis_opt(next_time(fri.timestamp_millis(), "weekdays").unwrap()).unwrap();
        assert_eq!(next.format("%Y-%m-%d %H:%M").to_string(), "2030-01-07 07:00");
        let next = Local.timestamp_millis_opt(next_time(fri.timestamp_millis(), "sat,sun").unwrap()).unwrap();
        assert_eq!(next.weekday(), chrono::Weekday::Sat);
        assert!(next_time(fri.timestamp_millis(), "").is_none());
        let _ = at;
    }

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
