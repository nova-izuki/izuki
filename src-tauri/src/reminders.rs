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
//!
//! Cancelling: "cancel check in with Solomon", "don't remind me to call Mum",
//! "turn off my 7am alarm" ([`cancel_request`], no AI), the Island's × , or
//! `[REMIND-CANCEL Call Mum]` from whichever AI is answering.

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

fn remove_ids(ids: &[String]) {
    if ids.is_empty() {
        return;
    }
    {
        let _g = LOCK.lock();
        let mut all = read();
        all.retain(|r| !ids.contains(&r.id));
        write(&all);
    }
    if let Some(app) = APP.get() {
        let _ = app.emit(CHANGED, ());
    }
}

/// "Cancel the reminder", "cancel check in with Solomon", "don't remind me
/// to call Mum", "turn off my 7am alarm", "delete all my reminders" — what to
/// say back, or None when it isn't about a reminder (then the AI answers).
pub fn cancel_request(said: &str) -> Option<String> {
    // Cheap first: almost nothing said is a cancel, and every request used to
    // read reminders.json to find that out.
    if !might_be_cancel(said) {
        return None;
    }
    let all = {
        let _g = LOCK.lock();
        read()
    };
    let (reply, gone) = plan_cancel(said, &all)?;
    if !gone.is_empty() {
        remove_ids(&gone);
        eprintln!("[remind] cancelled {} by request", gone.len());
    }
    Some(reply)
}

/// Could this be a cancel at all? A cheap scan for the first word of any of
/// `plan_cancel`'s verbs, so a request that plainly isn't one costs no disk.
fn might_be_cancel(said: &str) -> bool {
    // Words that mean it on their own, and words that only mean it with the
    // word that follows ("do not", "no need") — "what do I have" is a
    // question, not a cancel.
    const ALONE: [&str; 8] = ["cancel", "delete", "remove", "clear", "unset", "dont", "skip", "nevermind"];
    const PAIRS: [(&str, &str); 6] = [("do", "not"), ("no", "need"), ("get", "rid"), ("turn", "off"), ("switch", "off"), ("never", "mind")];
    let w = words_of(said);
    w.iter().take(7).enumerate().any(|(i, x)| {
        ALONE.contains(&x.as_str())
            || x == "stop"
            || PAIRS.iter().any(|(a, b)| x == a && w.get(i + 1).is_some_and(|n| n == b))
    })
}

/// Lower case, letters and numbers only ("Solomon's" → "solomons").
fn words_of(s: &str) -> Vec<String> {
    s.to_lowercase()
        .replace(['\'', '\u{2019}'], "")
        .split(|c: char| !c.is_alphanumeric())
        .filter(|w| !w.is_empty())
        .map(str::to_string)
        .collect()
}

/// A word of the request found in a reminder ("solomon" in "Solomon's").
fn has_word(text: &[String], w: &str) -> bool {
    text.iter().any(|t| t == w || t.strip_suffix('s') == Some(w) || w.strip_suffix('s') == Some(t.as_str()) || (w.len() >= 5 && t.starts_with(w)))
}

/// Said before the verb without changing what's asked.
const POLITE: [&str; 22] = [
    "please", "hey", "nova", "izuki", "ok", "okay", "actually", "just", "so", "and", "also", "can", "could", "would", "you", "i", "want", "to", "need", "wanna", "yo", "oh",
];
/// Words that only say which reminder in general, not what it's about.
const FILLER: [&str; 34] = [
    "the", "my", "a", "an", "that", "this", "those", "these", "to", "about", "for", "me", "please", "it", "one", "ones", "set", "i", "you", "of", "on", "at", "in", "with", "and", "up", "now", "today", "tonight", "tomorrow", "timer", "timers", "countdown", "o",
];
const KIND: [&str; 7] = ["reminder", "reminders", "remind", "reminding", "alarm", "alarms", "alert"];

/// Which reminders a cancel request means, and what to say. `all` is in the
/// order they were set (the last one is the newest).
fn plan_cancel(said: &str, all: &[Reminder]) -> Option<(String, Vec<String>)> {
    let w = words_of(said);
    // The verb, near the start: "cancel", "please delete", "don't remind me".
    // Strong verbs can name a reminder by what it says alone; the others
    // ("stop the music") must say "reminder" or "alarm".
    const VERBS: [(&[&str], bool); 15] = [
        (&["cancel"], true),
        (&["delete"], true),
        (&["remove"], true),
        (&["clear"], true),
        (&["unset"], true),
        (&["get", "rid", "of"], true),
        (&["dont", "remind", "me"], true),
        (&["do", "not", "remind", "me"], true),
        (&["no", "need", "to", "remind", "me"], true),
        (&["stop"], false),
        (&["turn", "off"], false),
        (&["switch", "off"], false),
        (&["skip"], false),
        (&["never", "mind"], false),
        (&["nevermind"], false),
    ];
    let (start, verb, strong) = (0..w.len().min(6)).find_map(|i| {
        if !w[..i].iter().all(|x| POLITE.contains(&x.as_str())) {
            return None;
        }
        VERBS.iter().find(|(v, _)| w[i..].starts_with(&v.iter().map(|s| s.to_string()).collect::<Vec<_>>())).map(|(v, strong)| (i, *v, *strong))
    })?;
    let rest = &w[start + verb.len()..];
    let says_kind = verb.contains(&"remind") || rest.iter().any(|x| KIND.contains(&x.as_str()));
    let says_alarm = rest.iter().any(|x| x == "alarm" || x == "alarms");
    let says_reminder = verb.contains(&"remind") || rest.iter().any(|x| x == "reminder" || x == "reminders" || x == "remind" || x == "reminding");
    if !strong && !says_kind {
        return None;
    }
    let every = rest.iter().any(|x| x == "all" || x == "every" || x == "everything");
    let newest = rest.iter().any(|x| x == "that" || x == "last" || x == "latest" || x == "just");
    let soonest = rest.iter().any(|x| x == "next");
    // "my 7am alarm", "the 5 30 one": the hour it's at.
    let hour = rest.iter().enumerate().find_map(|(i, x)| {
        let (n, tail) = x.split_at(x.find(|c: char| !c.is_ascii_digit()).unwrap_or(x.len()));
        let n: u32 = n.parse().ok()?;
        let pm = tail == "pm" || rest.get(i + 1).is_some_and(|y| y == "pm");
        let am = tail == "am" || rest.get(i + 1).is_some_and(|y| y == "am");
        let marked = pm || am || i > 0 && rest[i - 1] == "at" || rest.get(i + 1).is_some_and(|y| y == "oclock" || y == "o");
        (tail.is_empty() || tail == "am" || tail == "pm").then_some(())?;
        // A bare number is only a time when it's marked as one ("at 7", "7pm").
        (marked && (1..=12).contains(&n)).then_some((n % 12, pm, am))
    });
    let content: Vec<&String> = rest
        .iter()
        .filter(|x| {
            !FILLER.contains(&x.as_str())
                && !KIND.contains(&x.as_str())
                && !["all", "every", "everything", "last", "latest", "just", "next", "am", "pm", "oclock", "please"].contains(&x.as_str())
                && !x.chars().next().is_some_and(|c| c.is_ascii_digit())
        })
        .collect();
    if content.is_empty() && !says_kind {
        return None;
    }
    let what = if says_alarm && !says_reminder { "alarm" } else { "reminder" };
    let mut pool: Vec<&Reminder> = all.iter().filter(|r| !says_alarm || says_reminder || r.alarm).collect();
    if let Some((h, pm, am)) = hour {
        pool.retain(|r| {
            Local.timestamp_millis_opt(r.at).single().is_some_and(|t| {
                use chrono::Timelike;
                t.hour() % 12 == h && (!pm || t.hour() >= 12) && (!am || t.hour() < 12)
            })
        });
    }
    let mut matched: Vec<&Reminder> = pool
        .iter()
        .copied()
        .filter(|r| {
            let text = words_of(&r.text);
            // "Delete old photos" said while a reminder says exactly that is
            // asking to do it, not to drop the reminder.
            let same_verb = !says_kind && text.first().is_some_and(|t| t == verb[0]);
            if same_verb || !content.iter().all(|c| has_word(&text, c)) {
                return false;
            }
            // Without the word "reminder" or "alarm" there's nothing saying
            // this is about a reminder at all, so the whole thing has to be
            // named: "cancel check in with Solomon" removes it, a bare
            // "cancel check" doesn't (deleting on half a name is too eager).
            if !says_kind {
                let named: Vec<&String> = text.iter().filter(|w| !FILLER.contains(&w.as_str())).collect();
                return named.iter().all(|w| content.iter().any(|c| has_word(std::slice::from_ref(w), c)));
            }
            true
        })
        .collect();
    if matched.is_empty() {
        if !says_kind {
            return None;
        }
        let have = if all.is_empty() { format!("You don't have any {what}s set.") } else { format!("You've got {}.", listing(&pool_or(&pool, all), false)) };
        if content.is_empty() && hour.is_some() {
            return Some((format!("I couldn't find a {what} at that time. {have}"), vec![]));
        }
        if content.is_empty() || all.is_empty() {
            return Some((have, vec![]));
        }
        let asked = content.iter().map(|s| s.as_str()).collect::<Vec<_>>().join(" ");
        return Some((format!("I couldn't find a {what} about \u{201c}{asked}\u{201d}. {have}"), vec![]));
    }
    if every {
        // "Delete all my reminders" leaves the alarms that wake them up.
        if says_reminder && !says_alarm {
            matched.retain(|r| !r.alarm);
        }
        // Only alarms were set: say so rather than "Cancelled all 0 reminders".
        if matched.is_empty() {
            return Some((format!("You don't have any {what}s set \u{2014} only alarms. Say \u{201c}cancel all my alarms\u{201d} if you want those gone."), vec![]));
        }
        let ids = matched.iter().map(|r| r.id.clone()).collect::<Vec<_>>();
        let n = ids.len();
        let said = if n == 1 { format!("Cancelled \u{201c}{}\u{201d}.", matched[0].text) } else { format!("Cancelled all {n} {what}s.") };
        return Some((said, ids));
    }
    if matched.len() > 1 && content.is_empty() {
        if newest {
            matched = vec![*matched.last()?];
        } else if soonest {
            matched.sort_by_key(|r| r.at);
            matched.truncate(1);
        }
    }
    // The same reminder set twice goes together.
    let first = words_of(&matched[0].text);
    if matched.len() > 1 && !matched.iter().all(|r| words_of(&r.text) == first) {
        let mut asked = matched.clone();
        asked.sort_by_key(|r| r.at);
        return Some((format!("Which one? {}.", listing(&asked, true)), vec![]));
    }
    let r = matched[0];
    let ids = matched.iter().map(|r| r.id.clone()).collect::<Vec<_>>();
    let said = if r.alarm {
        format!("Turned off the \u{201c}{}\u{201d} alarm{}.", r.text, if r.repeat.is_empty() { "" } else { " \u{2014} it won't ring again" })
    } else {
        format!("Cancelled \u{201c}{}\u{201d} ({}){}.", r.text, describe_time(r.at), if r.repeat.is_empty() { "" } else { " \u{2014} it won't come back" })
    };
    Some((said, ids))
}

fn pool_or<'a>(pool: &[&'a Reminder], all: &'a [Reminder]) -> Vec<&'a Reminder> {
    let mut out: Vec<&Reminder> = if pool.is_empty() { all.iter().collect() } else { pool.to_vec() };
    out.sort_by_key(|r| r.at);
    out
}

/// "Call Mum (today at 5:00 PM), Check in with Solomon (tomorrow at 9:00 AM)
/// and 2 more"; `or` for asking which.
fn listing(list: &[&Reminder], or: bool) -> String {
    let shown: Vec<String> = list.iter().take(4).map(|r| format!("{} ({})", r.text, describe_time(r.at))).collect();
    let more = list.len().saturating_sub(4);
    match (shown.len(), more) {
        (0, _) => "nothing set".into(),
        (1, 0) => shown[0].clone(),
        (_, 0) => format!("{} {} {}", shown[..shown.len() - 1].join(", "), if or { "or" } else { "and" }, shown[shown.len() - 1]),
        _ => format!("{} and {more} more", shown.join(", ")),
    }
}

/// `[REMIND-CANCEL Call Mum]` from the AI: the reminder that says that.
fn cancel_tag(what: &str) -> bool {
    let all = {
        let _g = LOCK.lock();
        read()
    };
    let want = words_of(what);
    if want.is_empty() {
        return false;
    }
    // Exactly what it says first; then the only one with all those words.
    let exact: Vec<String> = all.iter().filter(|r| words_of(&r.text) == want).map(|r| r.id.clone()).collect();
    let ids = if exact.is_empty() {
        let near: Vec<String> = all.iter().filter(|r| want.iter().all(|w| has_word(&words_of(&r.text), w))).map(|r| r.id.clone()).collect();
        if near.len() == 1 { near } else { vec![] }
    } else {
        exact
    };
    let any = !ids.is_empty();
    remove_ids(&ids);
    any
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
    let set = list();
    let theirs = if set.is_empty() {
        "They have no reminders set.".to_string()
    } else {
        format!(
            "Their reminders now: {}. If they ask to cancel one (in any words), confirm it and add on its own line [REMIND-CANCEL what it says].",
            set.iter().take(8).map(|r| format!("\u{201c}{}\u{201d} ({}{})", r.text, describe_time(r.at), if r.repeat.is_empty() { String::new() } else { format!(", {}", r.repeat) })).collect::<Vec<_>>().join("; ")
        )
    };
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
         each thing (and an [ALARM] to wake them if they mention getting up), one tag per line.\n\
         {theirs}\n",
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
        if let Some(what) = tag.strip_prefix("[REMIND-CANCEL") {
            // (Tells the lists itself when one goes.)
            cancel_tag(what.trim_end_matches(']').trim());
        } else if tag.starts_with("[ALARM") {
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

    fn r(id: &str, text: &str, hour: u32, alarm: bool) -> Reminder {
        let day = Local::now().date_naive() + chrono::Duration::days(1);
        let at = Local.from_local_datetime(&day.and_hms_opt(hour, 0, 0).unwrap()).earliest().unwrap().timestamp_millis();
        Reminder { id: id.into(), at, text: text.into(), alarm, repeat: String::new() }
    }

    fn ids(said: &str, all: &[Reminder]) -> Option<Vec<String>> {
        plan_cancel(said, all).map(|(_, ids)| ids)
    }

    #[test]
    fn cancels_the_reminder_people_mean() {
        let all = vec![r("a", "Check in with Solomon", 17, false), r("b", "Call Mum", 9, false), r("c", "Wake up", 7, true), r("d", "Delete old photos", 20, false)];
        // By what it says, with or without the word "reminder".
        assert_eq!(ids("Cancel check in with Solomon", &all).unwrap(), ["a"]);
        // Half a name, and nothing saying it's a reminder: left alone.
        assert!(ids("cancel check", &all).is_none(), "deleted a reminder from half its name");
        assert!(ids("cancel solomon", &all).is_none());
        // Saying "reminder" is enough to mean it, so half a name is fine then.
        assert_eq!(ids("cancel the solomon reminder", &all).unwrap(), ["a"]);
        assert_eq!(ids("hey nova cancel the check-in with Solomon's reminder", &all).unwrap(), ["a"]);
        assert_eq!(ids("cancel the check in with solomon timer", &all).unwrap(), ["a"]);
        assert_eq!(ids("don't remind me to call mum", &all).unwrap(), ["b"]);
        assert_eq!(ids("please delete the call mum reminder", &all).unwrap(), ["b"]);
        // Alarms, by name or by the hour.
        assert_eq!(ids("turn off my 7am alarm", &all).unwrap(), ["c"]);
        assert_eq!(ids("stop the wake up alarm", &all).unwrap(), ["c"]);
        assert_eq!(ids("cancel my alarm", &all).unwrap(), ["c"]);
        assert_eq!(ids("cancel the reminder at 5", &all).unwrap(), ["a"]);
        // Several and no name: ask which (nothing removed); "that" = the newest.
        let (said, gone) = plan_cancel("cancel the reminder", &all).unwrap();
        assert!(gone.is_empty() && said.starts_with("Which one?"), "{said}");
        assert_eq!(ids("cancel that reminder", &all).unwrap(), ["d"]);
        assert_eq!(ids("cancel the next reminder", &all).unwrap(), ["c"]);
        assert_eq!(ids("delete all my reminders", &all).unwrap().len(), 3, "the wake-up alarm stays");
        // Only alarms set: "all my reminders" cancels nothing and says so.
        let only_alarms = vec![r("c", "Wake up", 7, true)];
        let (said, gone) = plan_cancel("delete all my reminders", &only_alarms).unwrap();
        assert!(gone.is_empty() && said.contains("only alarms"), "{said}");
        // A plain question never touches the file.
        assert!(!might_be_cancel("what reminders do I have"));
        assert!(might_be_cancel("hey nova please cancel the call mum reminder"));
        assert_eq!(ids("stop reminding me to call mum", &all).unwrap(), ["b"]);
        assert_eq!(ids("cancel all my alarms", &all).unwrap(), ["c"]);
        // Not found: says what there is, removes nothing.
        let (said, gone) = plan_cancel("cancel the reminder about the dentist", &all).unwrap();
        assert!(gone.is_empty() && said.contains("dentist"), "{said}");
        // Not about reminders: left for the timers, the music, the AI.
        assert!(ids("cancel the timer", &all).is_none());
        assert!(ids("stop the music", &all).is_none());
        assert!(ids("cancel my netflix subscription", &all).is_none());
        assert!(ids("stop solomon", &all).is_none());
        assert!(ids("why did you cancel check in with solomon", &all).is_none());
        // Asking to do the thing a reminder is about isn't cancelling it.
        assert!(ids("delete old photos", &all).is_none());
        assert_eq!(ids("delete the delete old photos reminder", &all).unwrap(), ["d"]);
        // The same one set twice goes together.
        let twice = vec![r("x", "Call Mum", 9, false), r("y", "call mum", 10, false), r("z", "Gym", 6, false)];
        assert_eq!(ids("cancel call mum", &twice).unwrap(), ["x", "y"]);
        // Nothing set.
        let (said, _) = plan_cancel("cancel my reminder", &[]).unwrap();
        assert!(said.contains("don't have any"), "{said}");
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
