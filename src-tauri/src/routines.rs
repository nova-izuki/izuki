//! Routines: things Izuki does by itself on a schedule — "every weekday at 8,
//! check my email and send me the summary on my phone". Made by talking; no
//! nodes, no JSON (the user never has to build an n8n workflow by hand).
//!
//! - Said once, shown back in plain English, and **off until the user turns
//!   it on** ("turn it on"). Silence is never a yes.
//! - Each run goes through the same path as a mission (companion::respond
//!   inside an execution budget), so the same rules hold: anything that
//!   sends, posts, deletes or pays only ever becomes a draft waiting for a
//!   yes (approvals.rs, with a phone notification).
//! - The result goes to the PC and, when asked, the phone, and is kept with
//!   the routine (last run, what it said, how it ended).
//! - Never two runs of one routine at once; a run that was missed while the
//!   PC was off happens once when it's back, not once per missed time.
//! - Kept in `%APPDATA%\Izuki\routines.json`.

use std::sync::atomic::{AtomicBool, Ordering};

use chrono::{Datelike, Duration, Local, NaiveTime, TimeZone, Timelike, Weekday};
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Routine {
    pub id: String,
    /// What to do, in the user's words ("check my email and summarise it").
    pub task: String,
    /// "daily", "weekdays", "weekends", "mon".."sun", or "hourly".
    pub every: String,
    /// "HH:MM" (ignored for hourly).
    pub at: String,
    /// Also tell the phone (Telegram/Discord/notifications).
    pub phone: bool,
    pub active: bool,
    #[serde(default)]
    pub next: i64,
    #[serde(default)]
    pub last_run: i64,
    #[serde(default)]
    pub last_result: String,
    #[serde(default)]
    pub last_outcome: String,
    pub made: i64,
    /// "Run it now": once, soon, without switching it on.
    #[serde(default)]
    pub run_once: bool,
}

impl Routine {
    /// "Every weekday at 8:00 AM: check my email — told on your phone too."
    pub fn describe(&self) -> String {
        let when = match self.every.as_str() {
            "hourly" => "Every hour".to_string(),
            "daily" => format!("Every day at {}", nice_time(&self.at)),
            "weekdays" => format!("Every weekday at {}", nice_time(&self.at)),
            "weekends" => format!("Every Saturday and Sunday at {}", nice_time(&self.at)),
            d => format!("Every {} at {}", day_name(d), nice_time(&self.at)),
        };
        format!("{when}: {}{}", self.task, if self.phone { " — and I'll tell you on your phone" } else { "" })
    }
}

fn nice_time(at: &str) -> String {
    NaiveTime::parse_from_str(at, "%H:%M").map(|t| t.format("%-I:%M %p").to_string()).unwrap_or_else(|_| at.to_string())
}

fn day_name(d: &str) -> &'static str {
    match d {
        "mon" => "Monday",
        "tue" => "Tuesday",
        "wed" => "Wednesday",
        "thu" => "Thursday",
        "fri" => "Friday",
        "sat" => "Saturday",
        _ => "Sunday",
    }
}

static LOCK: Mutex<()> = Mutex::new(());
/// The routine just described and not yet turned on: (id, when).
static PENDING: Mutex<Option<(String, std::time::Instant)>> = Mutex::new(None);
static RUNNING: AtomicBool = AtomicBool::new(false);

fn path() -> std::path::PathBuf {
    crate::store::data_dir().join("routines.json")
}

pub fn list() -> Vec<Routine> {
    std::fs::read_to_string(path()).ok().and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default()
}

fn save(all: &[Routine]) -> bool {
    let p = path();
    let tmp = p.with_extension("json.tmp");
    std::fs::write(&tmp, serde_json::to_string_pretty(all).unwrap_or_default()).is_ok() && std::fs::rename(&tmp, &p).is_ok()
}

fn now_ms() -> i64 {
    chrono::Utc::now().timestamp_millis()
}

/// The next time `r` is due after `after` (local time), in ms.
pub fn next_after(r: &Routine, after: chrono::DateTime<Local>) -> i64 {
    if r.every == "hourly" {
        let next = (after + Duration::hours(1)).with_minute(0).and_then(|t| t.with_second(0)).unwrap_or(after + Duration::hours(1));
        return next.timestamp_millis();
    }
    let t = NaiveTime::parse_from_str(&r.at, "%H:%M").unwrap_or(NaiveTime::from_hms_opt(8, 0, 0).unwrap());
    for add in 0..8 {
        let day = after.date_naive() + Duration::days(add);
        let Some(when) = Local.from_local_datetime(&day.and_time(t)).single() else { continue };
        if when <= after {
            continue;
        }
        let wd = day.weekday();
        let ok = match r.every.as_str() {
            "daily" => true,
            "weekdays" => !matches!(wd, Weekday::Sat | Weekday::Sun),
            "weekends" => matches!(wd, Weekday::Sat | Weekday::Sun),
            d => format!("{wd:?}").to_lowercase().starts_with(d),
        };
        if ok {
            return when.timestamp_millis();
        }
    }
    (after + Duration::days(1)).timestamp_millis()
}

// ---------------------------------------------------------------------------
// Understanding what was said
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, PartialEq)]
pub enum Ask {
    /// A new routine: (every, at, task, phone).
    New { every: String, at: String, task: String, phone: bool },
    TurnOn,
    List,
    /// Pause / resume / delete / run now — the routine whose words match, else the newest.
    Pause(String),
    Resume(String),
    Delete(String),
    RunNow(String),
    /// "change it to 9am": (which, new time).
    Retime(String, String),
}

/// "every weekday at 8 check my email and send it to my phone".
pub fn parse(said: &str) -> Option<Ask> {
    let s = format!(" {} ", said.to_lowercase().replace([',', '!', '?'], " ").split_whitespace().collect::<Vec<_>>().join(" "));
    let pending = PENDING.lock().as_ref().is_some_and(|(_, at)| at.elapsed() < std::time::Duration::from_secs(15 * 60));
    if pending && [" turn it on", " start it", " activate it", " switch it on", " yes turn it on", " yes start it", " turn the routine on", " start the routine"].iter().any(|p| s.starts_with(p) || s.contains(&format!("{p} "))) {
        return Some(Ask::TurnOn);
    }
    let about = s.contains(" routine") || s.contains(" automation");
    if about && [" my routines", " list routines", " show routines", " what routines", " my automations"].iter().any(|p| s.contains(p)) {
        return Some(Ask::List);
    }
    if about {
        let which = s.replace(" routine", " ").replace(" automation", " ");
        let which = which.split_whitespace().filter(|w| !["pause", "stop", "resume", "restart", "delete", "remove", "run", "now", "the", "my", "it", "turn", "off", "on", "start", "again"].contains(w)).collect::<Vec<_>>().join(" ");
        // "stop …" only as the request's own verb ("stop the email routine"),
        // not a word inside a routine's name ("the stop smoking routine").
        let stop = s.trim_start().starts_with("stop ") || s.contains(" please stop ");
        if s.contains(" pause") || stop || s.contains(" turn off") {
            return Some(Ask::Pause(which));
        }
        if s.contains(" resume") || s.contains(" turn on") || s.contains(" restart") {
            return Some(Ask::Resume(which));
        }
        if s.contains(" delete") || s.contains(" remove") {
            return Some(Ask::Delete(which));
        }
        if s.contains(" run") && s.contains(" now") {
            return Some(Ask::RunNow(which));
        }
        if let Some(at) = time_in(&s).filter(|_| s.contains(" change") || s.contains(" move") || s.contains(" make it")) {
            return Some(Ask::Retime(which, at));
        }
    }
    // "remind me every day at 8 to…" is a repeating reminder (reminders.rs).
    if s.contains(" remind me") || s.contains(" reminder") || s.contains(" alarm") {
        return None;
    }
    // A new routine needs a repeating time word.
    let every = if s.contains(" every hour") || s.contains(" hourly") {
        "hourly"
    } else if s.contains(" every weekday") || s.contains(" on weekdays") || s.contains(" every work day") {
        "weekdays"
    } else if s.contains(" every weekend") || s.contains(" on weekends") {
        "weekends"
    } else if let Some(d) = [("monday", "mon"), ("tuesday", "tue"), ("wednesday", "wed"), ("thursday", "thu"), ("friday", "fri"), ("saturday", "sat"), ("sunday", "sun")]
        .iter()
        .find(|(w, _)| s.contains(&format!(" every {w}")) || s.contains(&format!(" on {w}s")))
        .map(|(_, d)| *d)
    {
        d
    } else if [" every day", " every morning", " every evening", " every night", " daily", " each morning", " each day", " every afternoon"].iter().any(|w| s.contains(w)) {
        "daily"
    } else {
        return None;
    };
    let at = time_in(&s).unwrap_or_else(|| {
        if s.contains(" evening") { "18:00" } else if s.contains(" night") { "21:00" } else if s.contains(" afternoon") { "14:00" } else { "08:00" }.to_string()
    });
    let phone = [" my phone", " on discord", " on telegram", " text me", " message me", " notify me", " send me", " ping me"].iter().any(|w| s.contains(w));
    // The task: the words left once the timing is taken out.
    let t = strip_timing(said);
    let task = t.split_whitespace().collect::<Vec<_>>().join(" ").trim_matches(|c: char| c == ',' || c == '.' || c == ' ').trim_start_matches("and ").to_string();
    if task.split_whitespace().count() < 2 {
        return None;
    }
    Some(Ask::New { every: every.to_string(), at, task, phone })
}

/// The task words without the timing words.
fn strip_timing(text: &str) -> String {
    let words: Vec<&str> = text.split_whitespace().collect();
    let low: Vec<String> = words.iter().map(|w| w.to_lowercase().trim_matches(|c: char| !c.is_alphanumeric() && c != ':').to_string()).collect();
    let mut keep = vec![true; words.len()];
    let timing = ["hour", "hours", "day", "days", "morning", "mornings", "evening", "evenings", "night", "nights", "afternoon", "afternoons", "weekday", "weekdays", "weekend", "weekends", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "mondays", "tuesdays", "wednesdays", "thursdays", "fridays", "saturdays", "sundays"];
    let mut i = 0;
    while i < words.len() {
        let w = low[i].as_str();
        if (w == "every" || w == "each" || w == "on") && low.get(i + 1).is_some_and(|n| timing.contains(&n.as_str()) || n == "work") {
            keep[i] = false;
            keep[i + 1] = false;
            if low.get(i + 1).map(String::as_str) == Some("work") && low.get(i + 2).map(String::as_str) == Some("day") {
                keep[i + 2] = false;
            }
            i += 2;
            continue;
        }
        if w == "hourly" || w == "daily" || w == "nova" || w == "izuki" || (i == 0 && (w == "hey" || w == "hi" || w == "please")) {
            keep[i] = false;
        }
        if w == "at" && low.get(i + 1).is_some_and(|n| n.chars().next().is_some_and(|c| c.is_ascii_digit())) {
            keep[i] = false;
            keep[i + 1] = false;
            if low.get(i + 2).is_some_and(|n| ["am", "pm", "a.m", "p.m", "o'clock", "oclock"].contains(&n.as_str())) {
                keep[i + 2] = false;
            }
            i += 2;
            continue;
        }
        i += 1;
    }
    words.iter().zip(keep).filter(|(_, k)| *k).map(|(w, _)| *w).collect::<Vec<_>>().join(" ")
}

/// "at 8", "at 8:30", "at 7pm", "9 am" → "HH:MM".
fn time_in(s: &str) -> Option<String> {
    let words: Vec<&str> = s.split_whitespace().collect();
    for (i, w) in words.iter().enumerate() {
        let w = w.trim_matches(|c: char| !c.is_alphanumeric() && c != ':');
        let (num, rest) = w.split_at(w.find(|c: char| !c.is_ascii_digit() && c != ':').unwrap_or(w.len()));
        if num.is_empty() || !num.chars().next().unwrap().is_ascii_digit() {
            continue;
        }
        let after = if rest.is_empty() { words.get(i + 1).copied().unwrap_or("") } else { rest };
        let pm = after.starts_with("pm") || after.starts_with("p.m");
        let am = after.starts_with("am") || after.starts_with("a.m");
        let prev = if i > 0 { words[i - 1] } else { "" };
        if !(am || pm || prev == "at") {
            continue;
        }
        let (h, m) = match num.split_once(':') {
            Some((h, m)) => (h.parse::<u32>().ok()?, m.parse::<u32>().ok()?),
            None => (num.parse::<u32>().ok()?, 0),
        };
        if h > 23 || m > 59 {
            continue;
        }
        let h = if pm && h < 12 { h + 12 } else if am && h == 12 { 0 } else { h };
        return Some(format!("{h:02}:{m:02}"));
    }
    None
}

// ---------------------------------------------------------------------------
// Doing it
// ---------------------------------------------------------------------------

/// Pick the routine whose task words best match `which` (else the newest).
fn pick(all: &[Routine], which: &str) -> Option<usize> {
    let words: Vec<&str> = which.split_whitespace().filter(|w| w.len() > 2).collect();
    if !words.is_empty() {
        if let Some(i) = all.iter().position(|r| words.iter().any(|w| r.task.to_lowercase().contains(w))) {
            return Some(i);
        }
    }
    if all.is_empty() { None } else { Some(all.len() - 1) }
}

pub fn handle(ask: Ask) -> String {
    let _g = LOCK.lock();
    let mut all = list();
    match ask {
        Ask::New { every, at, task, phone } => {
            let mut r = Routine { id: uuid::Uuid::new_v4().simple().to_string()[..10].to_string(), task, every, at, phone, active: false, next: 0, last_run: 0, last_result: String::new(), last_outcome: String::new(), made: now_ms(), run_once: false };
            r.next = next_after(&r, Local::now());
            let said = r.describe();
            *PENDING.lock() = Some((r.id.clone(), std::time::Instant::now()));
            all.push(r);
            if !save(&all) {
                return "I couldn't save that routine on this PC.".into();
            }
            format!("Here's the routine: {said}.\nIt's off until you say “turn it on”. Anything that would send, post or delete only becomes a draft for your yes.")
        }
        Ask::TurnOn => {
            let id = PENDING.lock().take().map(|(id, _)| id);
            let Some(r) = id.and_then(|id| all.iter_mut().find(|r| r.id == id)) else { return "There's no new routine waiting to be turned on.".into() };
            r.active = true;
            r.next = next_after(r, Local::now());
            let when = chrono::DateTime::from_timestamp_millis(r.next).map(|t| t.with_timezone(&Local).format("%A at %-I:%M %p").to_string()).unwrap_or_default();
            let said = r.describe();
            save(&all);
            format!("On ✓ {said}. First run: {when}.")
        }
        Ask::List => {
            if all.is_empty() {
                return "No routines yet. Try “every weekday at 8, check my email and send me the summary”.".into();
            }
            all.iter().map(|r| format!("• {}{}", r.describe(), if r.active { "" } else { " (off)" })).collect::<Vec<_>>().join("\n")
        }
        Ask::Pause(w) | Ask::Resume(w) | Ask::Delete(w) | Ask::RunNow(w) | Ask::Retime(w, _) if all.is_empty() => {
            let _ = w;
            "You don't have any routines yet.".into()
        }
        Ask::Pause(w) => {
            let i = pick(&all, &w).unwrap();
            all[i].active = false;
            let d = all[i].describe();
            save(&all);
            format!("Paused: {d}.")
        }
        Ask::Resume(w) => {
            let i = pick(&all, &w).unwrap();
            all[i].active = true;
            all[i].next = next_after(&all[i], Local::now());
            let d = all[i].describe();
            save(&all);
            format!("Back on: {d}.")
        }
        Ask::Delete(w) => {
            let i = pick(&all, &w).unwrap();
            let r = all.remove(i);
            save(&all);
            format!("Deleted: {}.", r.describe())
        }
        Ask::Retime(w, at) => {
            let i = pick(&all, &w).unwrap();
            all[i].at = at;
            if all[i].every == "hourly" {
                all[i].every = "daily".into();
            }
            all[i].next = next_after(&all[i], Local::now());
            let d = all[i].describe();
            save(&all);
            format!("Changed: {d}.")
        }
        Ask::RunNow(w) => {
            let i = pick(&all, &w).unwrap();
            // Once, within half a minute — its on/off setting stays as it was.
            all[i].run_once = true;
            let d = all[i].task.clone();
            save(&all);
            format!("Running “{d}” now — I'll tell you how it went.")
        }
    }
}

/// Switch one on or off (the Routines card).
pub fn set_active(id: &str, on: bool) -> Vec<Routine> {
    let _g = LOCK.lock();
    let mut all = list();
    if let Some(r) = all.iter_mut().find(|r| r.id == id) {
        r.active = on;
        if on {
            r.next = next_after(r, Local::now());
        }
    }
    save(&all);
    all
}

pub fn delete(id: &str) -> Vec<Routine> {
    let _g = LOCK.lock();
    let mut all = list();
    all.retain(|r| r.id != id);
    save(&all);
    all
}

/// Check for due routines every 30 s; run each in turn, one at a time.
pub fn spawn(app: AppHandle) {
    static ONCE: std::sync::Once = std::sync::Once::new();
    let mut first = false;
    ONCE.call_once(|| first = true);
    if !first {
        return;
    }
    std::thread::spawn(move || loop {
        std::thread::sleep(std::time::Duration::from_secs(30));
        if RUNNING.swap(true, Ordering::SeqCst) {
            continue;
        }
        let due: Vec<Routine> = {
            let _g = LOCK.lock();
            let mut all = list();
            let now = now_ms();
            let mut due = Vec::new();
            for r in all.iter_mut().filter(|r| r.run_once || (r.active && r.next > 0 && r.next <= now)) {
                if r.run_once {
                    r.run_once = false;
                } else {
                    // A time missed while the PC was off runs once, not once per miss.
                    r.next = next_after(r, Local::now());
                }
                due.push(r.clone());
            }
            if !due.is_empty() {
                save(&all);
            }
            due
        };
        for r in due {
            run_one(&app, &r);
        }
        RUNNING.store(false, Ordering::SeqCst);
    });
}

fn run_one(app: &AppHandle, r: &Routine) {
    eprintln!("[routines] running: {}", r.task.chars().take(60).collect::<String>());
    let contract = crate::execution::TaskContract::new(&r.task.chars().take(400).collect::<String>());
    let started = std::time::Instant::now();
    let reply = match crate::execution::Scope::enter(&contract, move || started.elapsed() > std::time::Duration::from_secs(600)) {
        Ok(scope) => {
            let mut reply = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| crate::companion::respond(app, &r.task, false, &|_| {})))
                .unwrap_or_else(|_| crate::companion::Reply { text: "Something went wrong running it.".into(), outcome: crate::model::TaskOutcome::Failed, ..Default::default() });
            scope.finish(&mut reply);
            reply
        }
        Err(e) => crate::companion::Reply { text: e.into(), outcome: crate::model::TaskOutcome::Blocked, ..Default::default() },
    };
    let outcome = format!("{:?}", reply.outcome).to_lowercase();
    {
        let _g = LOCK.lock();
        let mut all = list();
        if let Some(x) = all.iter_mut().find(|x| x.id == r.id) {
            x.last_run = now_ms();
            x.last_result = reply.text.chars().take(1200).collect();
            x.last_outcome = outcome.clone();
            save(&all);
        }
    }
    let title = format!("Routine: {}", r.task.chars().take(50).collect::<String>());
    // On the PC always; the phone too when the routine asked for it.
    {
        use tauri_plugin_notification::NotificationExt;
        let _ = app.notification().builder().title(&title).body(reply.text.chars().take(240).collect::<String>()).show();
    }
    if r.phone {
        crate::companion::notify_everywhere(&format!("{title}\n{}", reply.text));
        crate::webpush::send_all(&title, &reply.text, "routine");
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn understands_routines_by_ear() {
        match parse("every weekday at 8 check my email and send me the summary on my phone").unwrap() {
            Ask::New { every, at, task, phone } => {
                assert_eq!((every.as_str(), at.as_str(), phone), ("weekdays", "08:00", true));
                assert_eq!(task, "check my email and send me the summary on my phone");
            }
            other => panic!("{other:?}"),
        }
        match parse("Hey Nova, every evening summarise my unread emails").unwrap() {
            Ask::New { every, at, task, .. } => assert_eq!((every.as_str(), at.as_str(), task.as_str()), ("daily", "18:00", "summarise my unread emails")),
            other => panic!("{other:?}"),
        }
        match parse("every friday at 5pm make a weekly report of my missions").unwrap() {
            Ask::New { every, at, .. } => assert_eq!((every.as_str(), at.as_str()), ("fri", "17:00")),
            other => panic!("{other:?}"),
        }
        assert!(parse("what time is it").is_none());
        assert!(parse("remind me at 5pm to call mum").is_none(), "a one-off reminder isn't a routine");
        assert!(parse("remind me every day at 8 to take my pills").is_none(), "a repeating reminder stays a reminder");
        assert_eq!(parse("pause the email routine"), Some(Ask::Pause("email".into())));
        assert_eq!(parse("stop the email routine"), Some(Ask::Pause("email".into())));
        assert!(!matches!(parse("delete the stop smoking routine"), Some(Ask::Pause(_))), "“stop” in a name isn't “pause”");
    }

    #[test]
    fn next_run_follows_the_schedule() {
        let r = Routine { id: "x".into(), task: "t".into(), every: "weekdays".into(), at: "08:00".into(), phone: false, active: true, next: 0, last_run: 0, last_result: String::new(), last_outcome: String::new(), made: 0, run_once: false };
        // Friday 9:00 → Monday 8:00.
        let fri = Local.with_ymd_and_hms(2026, 10, 16, 9, 0, 0).single().unwrap();
        let next = chrono::DateTime::from_timestamp_millis(next_after(&r, fri)).unwrap().with_timezone(&Local);
        assert_eq!((next.weekday(), next.hour(), next.minute()), (Weekday::Mon, 8, 0));
        // Before 8 on a weekday: the same day.
        let tue = Local.with_ymd_and_hms(2026, 10, 13, 7, 30, 0).single().unwrap();
        let next = chrono::DateTime::from_timestamp_millis(next_after(&r, tue)).unwrap().with_timezone(&Local);
        assert_eq!((next.weekday(), next.hour()), (Weekday::Tue, 8));
    }

    #[test]
    fn reads_times() {
        assert_eq!(time_in(" at 8 "), Some("08:00".into()));
        assert_eq!(time_in(" at 7:30pm "), Some("19:30".into()));
        assert_eq!(time_in(" 9 am "), Some("09:00".into()));
        assert_eq!(time_in(" at 12am "), Some("00:00".into()));
        assert_eq!(time_in(" 3 emails "), None);
    }
}
