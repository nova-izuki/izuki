//! Heads-ups — Izuki telling you things before you ask, the way a good
//! assistant does: a new email the moment it lands, a meeting a few minutes
//! before it starts, a short brief in the morning, and anything your own
//! automations (n8n, or anything that can send a web request) want to say.
//!
//! No AI is used for any of it: the checks run the apps' own tools through
//! Composio (the user's free key) and the messages are written from the
//! results, so it costs no AI quota at all. Each goes to a Windows
//! notification on the PC and/or the paired phone (Telegram / Discord),
//! as chosen in Izuki → Apps.

use std::collections::HashSet;
use std::time::{Duration, Instant};

use chrono::{Local, TimeZone};
use parking_lot::Mutex;
use serde_json::{json, Value};
use tauri::{AppHandle, Emitter};

use crate::model::StatusEvent;

const TICK: Duration = Duration::from_secs(30);
const EMAIL_EVERY: Duration = Duration::from_secs(3 * 60);
const CALENDAR_EVERY: Duration = Duration::from_secs(2 * 60);
const APPS_EVERY: Duration = Duration::from_secs(10 * 60);
const SCHOOL_EVERY: Duration = Duration::from_secs(30 * 60);
/// How far ahead a meeting is announced.
const MEETING_AHEAD_MIN: i64 = 15;

#[derive(Default)]
struct State {
    account_scope: String,
    connected: Vec<String>,
    apps_at: Option<Instant>,
    email_at: Option<Instant>,
    calendar_at: Option<Instant>,
    /// Emails already seen (the first look only learns what's there).
    seen_mail: Option<HashSet<String>>,
    told_events: HashSet<String>,
    school_at: Option<Instant>,
    /// Everything due, from the school calendar links.
    school: Vec<Due>,
    /// (assignment, "24h" / "2h") already told.
    told_school: HashSet<String>,
    /// Why nothing is arriving, said once when it changes. Every failure below
    /// is otherwise only a line in the log, so the switches read "on" while
    /// nothing can possibly arrive.
    reason: String,
}

static STATE: Mutex<Option<State>> = Mutex::new(None);

/// Refresh checks after the user returns from connecting an app. `tick`
/// itself holds STATE while listing accounts, so never block on that lock.
pub fn connections_checked(list: &[String]) {
    if let Some(mut guard) = STATE.try_lock() {
        let st = guard.get_or_insert_with(State::default);
        if st.connected != list {
            st.connected = list.to_vec();
            st.email_at = None;
            st.calendar_at = None;
        }
        st.apps_at = Some(Instant::now());
    }
}

pub fn spawn(app: AppHandle) {
    std::thread::Builder::new()
        .name("izuki-headsup".into())
        .spawn(move || loop {
            std::thread::sleep(TICK);
            let _ = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| tick(&app)));
        })
        .ok();
}

fn due(at: Option<Instant>, every: Duration) -> bool {
    at.is_none_or(|t| t.elapsed() >= every)
}

/// Say once — and only when it changes — why no heads-up is arriving, so the
/// switches in the Apps tab can't sit "on" while nothing can possibly come.
/// Empty means everything it needs is there.
fn set_reason(app: &AppHandle, st: &mut State, why: &str) {
    if st.reason == why {
        return;
    }
    st.reason = why.to_string();
    if why.is_empty() {
        return;
    }
    eprintln!("[headsup] idle: {why}");
    let _ = app.emit(
        crate::events::STATUS,
        StatusEvent { kind: "info", message: "Heads-ups are on but can't run yet".into(), detail: Some(why.to_string()) },
    );
}

fn tick(app: &AppHandle) {
    let settings = crate::state::store().settings();
    let mut guard = STATE.lock();
    let st = guard.get_or_insert_with(State::default);
    let scope = format!("{}:{}", settings.composio_user_id, settings.composio_api_key);
    if st.account_scope != scope {
        st.account_scope = scope;
        st.connected.clear(); st.apps_at = None;
        st.email_at = None; st.calendar_at = None;
        st.seen_mail = None; st.told_events.clear();
        st.reason.clear();
    }

    // School work: from the calendar links, no app key needed.
    let feeds: Vec<String> = settings.school_feeds.iter().map(|f| f.trim().to_string()).filter(|f| !f.is_empty()).collect();
    if !feeds.is_empty() && due(st.school_at, SCHOOL_EVERY) {
        st.school_at = Some(Instant::now());
        let mut all = Vec::new();
        for f in &feeds {
            match fetch_feed(f) {
                Ok(mut d) => all.append(&mut d),
                Err(e) => eprintln!("[headsup] school feed: {e}"),
            }
        }
        if !all.is_empty() {
            st.school = all;
        }
    }
    if settings.heads_up_school {
        for line in school_due_soon(st) {
            deliver(app, "School", &format!("📚 {line}"));
        }
    }

    if !crate::composio::configured() {
        set_reason(
            app,
            st,
            "Email and calendar heads-ups need your accounts connected. Add your free Composio key in Izuki → Apps, then connect Gmail or Google Calendar.",
        );
        if settings.morning_brief && brief_due(&settings.morning_brief_at) {
            let text = morning_brief(false, false, &st.school);
            mark_brief_sent();
            deliver(app, "Good morning", &text);
        }
        return;
    }

    if due(st.apps_at, APPS_EVERY) {
        st.apps_at = Some(Instant::now());
        match crate::composio::connected() {
            Ok(list) => st.connected = list,
            Err(e) => eprintln!("[headsup] couldn't list linked apps: {e}"),
        }
    }
    let linked = st.connected.clone();
    let has = |slug: &str| linked.iter().any(|c| c == slug);

    // Connected, but not to anything this watches: say so rather than leaving
    // every switch on and nothing arriving.
    set_reason(
        app,
        st,
        match (!has("gmail"), !has("googlecalendar")) {
            (true, true) => "Connected, but Gmail and Google Calendar aren't linked yet. Link either one and heads-ups start on their own.",
            (true, false) => "Google Calendar is linked, but Gmail isn't — link Gmail for new-mail heads-ups.",
            (false, true) => "Gmail is linked, but Google Calendar isn't — link it for meeting heads-ups.",
            (false, false) => "",
        },
    );

    if settings.heads_up_email && has("gmail") && due(st.email_at, EMAIL_EVERY) {
        st.email_at = Some(Instant::now());
        match new_emails(st) {
            Ok(lines) => {
                deliver_many(app, "📧", &lines, "new emails");
                // The ones that matter, Izuki also says out loud (buddy mode).
                crate::buddy::new_mail(app, &lines);
            }
            Err(e) => eprintln!("[headsup] email check: {e}"),
        }
    }

    if settings.heads_up_calendar && has("googlecalendar") && due(st.calendar_at, CALENDAR_EVERY) {
        st.calendar_at = Some(Instant::now());
        match meetings_soon(st) {
            Ok(lines) => {
                for l in lines {
                    deliver(app, "Coming up", &format!("📅 {l}"));
                    crate::buddy::say(app, &format!("meeting-{l}"), &format!("Coming up: {l}."), crate::buddy::Level::Important);
                }
            }
            Err(e) => eprintln!("[headsup] calendar check: {e}"),
        }
    }

    if settings.morning_brief && brief_due(&settings.morning_brief_at) {
        let text = morning_brief(has("gmail"), has("googlecalendar"), &st.school);
        mark_brief_sent();
        deliver(app, "Good morning", &text);
    }
}

// ---------------------------------------------------------------------------
// Email
// ---------------------------------------------------------------------------

fn new_emails(st: &mut State) -> anyhow::Result<Vec<String>> {
    let data = crate::composio::execute(
        "GMAIL_FETCH_EMAILS",
        json!({ "query": "is:unread in:inbox category:primary newer_than:1d", "max_results": 8, "include_payload": false, "verbose": false }),
    )?;
    let mails = messages(&data);
    let first_look = st.seen_mail.is_none();
    let seen = st.seen_mail.get_or_insert_with(HashSet::new);
    let mut lines = Vec::new();
    for m in mails {
        if !seen.insert(m.id.clone()) || first_look {
            continue;
        }
        lines.push(if m.subject.is_empty() { format!("New email from {}", m.from) } else { format!("{}: {}", m.from, m.subject) });
    }
    Ok(lines)
}

// ---------------------------------------------------------------------------
// Digging through the inbox
// ---------------------------------------------------------------------------

/// One email that matters, and what to do about it.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, PartialEq)]
pub struct InboxItem {
    pub from: String,
    pub subject: String,
    /// "reply", "money", "delivery", "school", "work", "meeting", "security", "personal".
    pub kind: String,
    /// The to-do, in plain words ("Pay the electric bill by Friday").
    #[serde(default)]
    pub action: String,
    #[serde(default)]
    pub urgent: bool,
}

#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
pub struct InboxDigest {
    /// One or two spoken sentences.
    pub summary: String,
    pub items: Vec<InboxItem>,
    /// How many emails were looked at, and how many were just noise.
    pub looked_at: usize,
    pub skipped: usize,
}

static DIGEST: Mutex<Option<(InboxDigest, Instant)>> = Mutex::new(None);

/// Read the last few days of email (not promotions or social) and have the
/// AI pick out what actually matters and the real to-dos — the way a good
/// assistant goes through your inbox, not just a count. Cached ten minutes.
pub fn inbox_digest(fresh: bool) -> anyhow::Result<InboxDigest> {
    if !fresh {
        if let Some((d, at)) = DIGEST.lock().clone() {
            if at.elapsed() < Duration::from_secs(600) {
                return Ok(d);
            }
        }
    }
    let data = crate::composio::execute(
        "GMAIL_FETCH_EMAILS",
        json!({ "query": "in:inbox newer_than:3d -category:promotions -category:social", "max_results": 25, "include_payload": false, "verbose": false }),
    )?;
    let mails = messages(&data);
    if mails.is_empty() {
        let d = InboxDigest { summary: "Your inbox is quiet — nothing new in the last few days.".into(), ..Default::default() };
        *DIGEST.lock() = Some((d.clone(), Instant::now()));
        return Ok(d);
    }
    let list: String = mails
        .iter()
        .enumerate()
        .map(|(i, m)| format!("{}. From: {} | Subject: {} | {}\n", i + 1, m.from, m.subject, m.snippet))
        .collect();
    let reply = crate::chat::complete(&[
        json!({ "role": "system", "content": DIGEST_PROMPT }),
        json!({ "role": "user", "content": format!("Today is {}.\nEmails:\n{list}", chrono::Local::now().format("%A %-d %B %Y")) }),
    ])?;
    let mut d = parse_digest(&reply).unwrap_or_else(|| InboxDigest { summary: reply.trim().chars().take(400).collect(), ..Default::default() });
    d.looked_at = mails.len();
    d.skipped = mails.len().saturating_sub(d.items.len());
    *DIGEST.lock() = Some((d.clone(), Instant::now()));
    Ok(d)
}

const DIGEST_PROMPT: &str = "You go through the user's recent emails like a sharp personal assistant. \
Pick ONLY the ones that matter to them as a person: someone waiting for a reply, money (bills, payments, \
refunds, invoices, bank), deliveries, school or work tasks and deadlines, meetings and appointments, \
security alerts about their accounts, and personal messages from real people. Skip newsletters, marketing, \
receipts with nothing to do, and automated noise. For each one that matters, write the real to-do in plain \
words with any date or amount (\"Pay the £42 electric bill by Friday\", \"Reply to Sam about Saturday's \
shift\"). Reply with ONLY JSON: {\"summary\": \"one or two friendly spoken sentences about what matters most\", \
\"items\": [{\"from\": \"name\", \"subject\": \"subject\", \"kind\": \"reply|money|delivery|school|work|meeting|security|personal\", \
\"action\": \"the to-do, or empty\", \"urgent\": true or false}]}. Most important first, at most 8 items. \
If nothing matters, items is [] and the summary says the inbox is all clear.";

fn parse_digest(reply: &str) -> Option<InboxDigest> {
    let a = reply.find('{')?;
    let b = reply.rfind('}')?;
    let v: Value = serde_json::from_str(&reply[a..=b]).ok()?;
    let items: Vec<InboxItem> = v["items"].as_array().map(|arr| arr.iter().filter_map(|x| serde_json::from_value(x.clone()).ok()).take(8).collect()).unwrap_or_default();
    Some(InboxDigest { summary: v["summary"].as_str().unwrap_or("").trim().to_string(), items, looked_at: 0, skipped: 0 })
}

/// "What's important in my email?", "go through my inbox", "anything I need to do in my email?"
pub fn is_inbox_question(said: &str) -> bool {
    let s = said.to_lowercase();
    let mail = ["email", "e-mail", "inbox", "gmail", "mail"].iter().any(|w| s.contains(w));
    let dig = [
        "important", "anything i need", "what do i need", "go through", "dig through", "check my", "summar", "catch me up",
        "what's new", "whats new", "anything new", "to do", "todo", "need to do", "anything urgent", "urgent",
    ]
    .iter()
    .any(|w| s.contains(w));
    mail && dig && !["send", "write", "reply to", "draft", "delete", "archive"].iter().any(|w| s.contains(w))
}

/// The digest, said out loud.
pub fn inbox_spoken() -> String {
    match inbox_digest(false) {
        Ok(d) => {
            let mut s = d.summary.clone();
            let todo: Vec<String> = d.items.iter().filter(|i| !i.action.trim().is_empty()).take(3).map(|i| i.action.trim().trim_end_matches('.').to_string()).collect();
            if !todo.is_empty() && !s.to_lowercase().contains(&todo[0].to_lowercase()) {
                s.push_str(&format!(" To do: {}.", todo.join("; ")));
            }
            if d.skipped > 0 {
                s.push_str(&format!(" I skipped {} that didn't need you.", d.skipped));
            }
            s
        }
        Err(e) => format!("I couldn't read your email just now: {e}"),
    }
}

/// What's in the inbox right now, for the "wake up" briefing: how many
/// unread emails came today (primary inbox), and who the first few are
/// from, with their subjects.
pub fn inbox_today() -> anyhow::Result<(usize, Vec<(String, String)>)> {
    let data = crate::composio::execute(
        "GMAIL_FETCH_EMAILS",
        json!({ "query": "is:unread in:inbox category:primary newer_than:1d", "max_results": 20, "include_payload": false, "verbose": false }),
    )?;
    let mails = messages(&data);
    Ok((mails.len(), mails.into_iter().take(3).map(|m| (m.from, m.subject)).collect()))
}

/// The rest of today's calendar: (time, title), for the briefing.
pub fn calendar_today() -> anyhow::Result<Vec<(String, String)>> {
    let now = Local::now();
    let end = now.date_naive().and_hms_opt(23, 59, 0).and_then(|t| Local.from_local_datetime(&t).single()).unwrap_or(now);
    Ok(events_between(now, end)?
        .into_iter()
        .take(4)
        .map(|e| (e.start.with_timezone(&Local).format("%-I:%M %p").to_string(), e.title))
        .collect())
}

struct Mail {
    id: String,
    from: String,
    subject: String,
    /// The start of the email itself, when the tool gives it.
    snippet: String,
}

/// The messages in a Gmail tool result, however it nests them.
fn messages(data: &Value) -> Vec<Mail> {
    let list = find_array(data, &["messages", "emails"]).unwrap_or_default();
    list.iter()
        .filter_map(|m| {
            let id = str_of(m, &["messageId", "message_id", "id", "threadId"])?;
            let from = str_of(m, &["sender", "from"]).map(|f| display_name(&f)).unwrap_or_else(|| "someone".into());
            let subject = str_of(m, &["subject"]).unwrap_or_default();
            let snippet = str_of(m, &["preview", "snippet", "messageText", "body", "text"]).map(|s| clip(&s.split_whitespace().collect::<Vec<_>>().join(" "), 400)).unwrap_or_default();
            Some(Mail { id, from, subject: clip(&subject, 90), snippet })
        })
        .collect()
}

/// "Sam Lee <sam@x.com>" → "Sam Lee".
fn display_name(from: &str) -> String {
    let name = from.split('<').next().unwrap_or(from).trim().trim_matches('"').trim();
    if name.is_empty() {
        from.trim_matches(|c| c == '<' || c == '>').to_string()
    } else {
        name.to_string()
    }
}

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------

struct Event {
    id: String,
    title: String,
    start: chrono::DateTime<chrono::FixedOffset>,
}

fn events_between(from: chrono::DateTime<Local>, to: chrono::DateTime<Local>) -> anyhow::Result<Vec<Event>> {
    let data = crate::composio::execute(
        "GOOGLECALENDAR_EVENTS_LIST",
        json!({
            "calendarId": "primary",
            "timeMin": from.to_rfc3339(),
            "timeMax": to.to_rfc3339(),
            "singleEvents": true,
            "orderBy": "startTime",
            "maxResults": 10
        }),
    )?;
    Ok(find_array(&data, &["items", "events"])
        .unwrap_or_default()
        .iter()
        .filter_map(|e| {
            // All-day events have a date, not a time — nothing to warn about.
            let start = e["start"]["dateTime"].as_str().or(e["start_time"].as_str())?;
            let start = chrono::DateTime::parse_from_rfc3339(start).ok()?;
            let title = str_of(e, &["summary", "title"]).unwrap_or_else(|| "(no title)".into());
            let id = str_of(e, &["id", "event_id"]).unwrap_or_else(|| format!("{title}@{start}"));
            Some(Event { id, title: clip(&title, 80), start })
        })
        .collect())
}

fn meetings_soon(st: &mut State) -> anyhow::Result<Vec<String>> {
    let now = Local::now();
    let events = events_between(now, now + chrono::Duration::minutes(MEETING_AHEAD_MIN + 1))?;
    let mut lines = Vec::new();
    for e in events {
        let mins = (e.start.timestamp() - now.timestamp()) / 60;
        if !(0..=MEETING_AHEAD_MIN).contains(&mins) || !st.told_events.insert(e.id.clone()) {
            continue;
        }
        lines.push(if mins <= 1 { format!("Starting now: {}", e.title) } else { format!("In {mins} min: {}", e.title) });
    }
    if st.told_events.len() > 500 {
        st.told_events.clear();
    }
    Ok(lines)
}

// ---------------------------------------------------------------------------
// Morning brief
// ---------------------------------------------------------------------------

fn brief_file() -> std::path::PathBuf {
    crate::store::data_dir().join("brief-sent.txt")
}

fn today() -> String {
    Local::now().format("%Y-%m-%d").to_string()
}

/// Past the chosen time today (within 3 hours of it) and not sent yet.
fn brief_due(at: &str) -> bool {
    let Some((h, m)) = at.split_once(':').and_then(|(h, m)| Some((h.trim().parse::<u32>().ok()?, m.trim().parse::<u32>().ok()?))) else {
        return false;
    };
    let now = Local::now();
    let Some(when) = now.date_naive().and_hms_opt(h.min(23), m.min(59), 0) else { return false };
    let Some(when) = Local.from_local_datetime(&when).single() else { return false };
    let late = now.signed_duration_since(when);
    if late < chrono::Duration::zero() || late > chrono::Duration::hours(3) {
        return false;
    }
    std::fs::read_to_string(brief_file()).map(|d| d.trim() != today()).unwrap_or(true)
}

fn mark_brief_sent() {
    let _ = std::fs::write(brief_file(), today());
}

fn morning_brief(gmail: bool, calendar: bool, school: &[Due]) -> String {
    let mut parts = vec!["☀️ Good morning! Here's your day:".to_string()];
    if calendar {
        let now = Local::now();
        let end = now.date_naive().and_hms_opt(23, 59, 0).and_then(|t| Local.from_local_datetime(&t).single()).unwrap_or(now);
        match events_between(now, end) {
            Ok(ev) if ev.is_empty() => parts.push("📅 Nothing on your calendar today.".into()),
            Ok(ev) => {
                parts.push(format!("📅 {} on your calendar:", if ev.len() == 1 { "One thing".to_string() } else { format!("{} things", ev.len()) }));
                for e in ev.iter().take(6) {
                    parts.push(format!("  • {} — {}", e.start.with_timezone(&Local).format("%-I:%M %p"), e.title));
                }
            }
            Err(e) => eprintln!("[headsup] brief calendar: {e}"),
        }
    }
    if gmail {
        if let Ok(data) = crate::composio::execute(
            "GMAIL_FETCH_EMAILS",
            json!({ "query": "is:unread in:inbox category:primary newer_than:1d", "max_results": 20, "include_payload": false, "verbose": false }),
        ) {
            let n = messages(&data).len();
            parts.push(match n {
                0 => "📧 No new email overnight.".into(),
                1 => "📧 1 new email.".into(),
                20 => "📧 20+ new emails.".into(),
                n => format!("📧 {n} new emails."),
            });
        }
    }
    let now = Local::now();
    let soon: Vec<&Due> = school
        .iter()
        .filter(|d| d.at > now && d.at.date_naive() <= now.date_naive() + chrono::Days::new(1))
        .collect();
    if !soon.is_empty() {
        parts.push("📚 School work due today or tomorrow:".into());
        for d in soon.iter().take(6) {
            parts.push(format!("  • {} — {}", when(d.at), d.title));
        }
    }
    let now_ms = Local::now().timestamp_millis();
    let end_ms = Local::now().date_naive().and_hms_opt(23, 59, 59).and_then(|t| Local.from_local_datetime(&t).single()).map(|t| t.timestamp_millis()).unwrap_or(now_ms);
    let todays: Vec<_> = crate::reminders::list().into_iter().filter(|r| r.at >= now_ms && r.at <= end_ms).collect();
    if !todays.is_empty() {
        parts.push("⏰ Reminders today:".into());
        for r in todays.iter().take(5) {
            let at = Local.timestamp_millis_opt(r.at).single().map(|t| t.format("%-I:%M %p").to_string()).unwrap_or_default();
            parts.push(format!("  • {at} — {}", r.text));
        }
    }
    if parts.len() == 1 {
        parts.push("Nothing scheduled — a clear day. Have a great one!".into());
    }
    parts.join("\n")
}

// ---------------------------------------------------------------------------
// School work (a private calendar link from Blackboard, Canvas, Moodle…)
// ---------------------------------------------------------------------------

#[derive(Debug, Clone)]
pub struct Due {
    uid: String,
    title: String,
    at: chrono::DateTime<Local>,
}

fn fetch_feed(url: &str) -> anyhow::Result<Vec<Due>> {
    // Calendar apps hand these out as webcal://; it's plain https.
    let url = url.replacen("webcal://", "https://", 1);
    let text = reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(30))
        .build()?
        .get(&url)
        .send()?
        .error_for_status()?
        .text()?;
    let items = parse_ics(&text);
    if items.is_empty() && !text.contains("BEGIN:VCALENDAR") {
        anyhow::bail!("that link isn't a calendar feed (.ics)");
    }
    Ok(items)
}

/// The events in an iCalendar file: what's due and when.
pub fn parse_ics(text: &str) -> Vec<Due> {
    // Long lines are folded onto the next line starting with a space.
    let mut lines: Vec<String> = Vec::new();
    for raw in text.lines() {
        if (raw.starts_with(' ') || raw.starts_with('\t')) && !lines.is_empty() {
            lines.last_mut().unwrap().push_str(&raw[1..]);
        } else {
            lines.push(raw.trim_end_matches('\r').to_string());
        }
    }
    let mut out = Vec::new();
    let (mut uid, mut title, mut start, mut end, mut inside) = (String::new(), String::new(), None, None, false);
    for l in lines {
        if l == "BEGIN:VEVENT" {
            inside = true;
            uid.clear();
            title.clear();
            start = None;
            end = None;
            continue;
        }
        if l == "END:VEVENT" {
            inside = false;
            // Assignments are often all-day or end-at-the-deadline events.
            if let Some(at) = end.or(start) {
                if !title.is_empty() {
                    let id = if uid.is_empty() { format!("{title}@{at}") } else { uid.clone() };
                    out.push(Due { uid: id, title: clip(&title, 90), at });
                }
            }
            continue;
        }
        if !inside {
            continue;
        }
        let Some((key, value)) = l.split_once(':') else { continue };
        let name = key.split(';').next().unwrap_or("");
        match name {
            "UID" => uid = value.to_string(),
            "SUMMARY" => title = value.replace("\\,", ",").replace("\\;", ";").replace("\\n", " ").trim().to_string(),
            "DTSTART" => start = ics_time(key, value),
            "DTEND" | "DUE" => end = ics_time(key, value),
            _ => {}
        }
    }
    out
}

fn ics_time(key: &str, value: &str) -> Option<chrono::DateTime<Local>> {
    let v = value.trim();
    if key.contains("VALUE=DATE") && !key.contains("DATE-TIME") || v.len() == 8 {
        // A whole day: treat it as due by the end of it.
        let d = chrono::NaiveDate::parse_from_str(v, "%Y%m%d").ok()?;
        return Local.from_local_datetime(&d.and_hms_opt(23, 59, 0)?).single();
    }
    if let Some(utc) = v.strip_suffix('Z') {
        let t = chrono::NaiveDateTime::parse_from_str(utc, "%Y%m%dT%H%M%S").ok()?;
        return Some(chrono::Utc.from_utc_datetime(&t).with_timezone(&Local));
    }
    let t = chrono::NaiveDateTime::parse_from_str(v, "%Y%m%dT%H%M%S").ok()?;
    Local.from_local_datetime(&t).earliest()
}

fn when(at: chrono::DateTime<Local>) -> String {
    let today = Local::now().date_naive();
    let day = if at.date_naive() == today {
        "today".to_string()
    } else if at.date_naive() == today + chrono::Days::new(1) {
        "tomorrow".to_string()
    } else {
        at.format("%a").to_string()
    };
    format!("{day} {}", at.format("%-I:%M %p"))
}

/// Work due within a day (once) and within two hours (once more).
fn school_due_soon(st: &mut State) -> Vec<String> {
    let now = Local::now();
    let mut lines = Vec::new();
    for d in &st.school {
        let left = d.at.signed_duration_since(now);
        if left <= chrono::Duration::zero() {
            continue;
        }
        let stage = if left <= chrono::Duration::hours(2) {
            "2h"
        } else if left <= chrono::Duration::hours(24) {
            "24h"
        } else {
            continue;
        };
        if !st.told_school.insert(format!("{}:{stage}", d.uid)) {
            continue;
        }
        // Told "within 2 hours" first? Don't say "within a day" after.
        st.told_school.insert(format!("{}:24h", d.uid));
        lines.push(format!("Due {}: {}", when(d.at), d.title));
    }
    lines
}

// ---------------------------------------------------------------------------
// Delivery
// ---------------------------------------------------------------------------

fn deliver_many(app: &AppHandle, icon: &str, lines: &[String], plural: &str) {
    match lines.len() {
        0 => {}
        1..=3 => {
            for l in lines {
                deliver(app, "New email", &format!("{icon} {l}"));
            }
        }
        n => deliver(app, "New email", &format!("{icon} {n} {plural} — the latest from {}", lines[0])),
    }
}

/// Tell the user, wherever they chose: a Windows notification (and the
/// panel's toast) on this PC, and/or their phone.
pub fn deliver(app: &AppHandle, title: &str, body: &str) {
    let settings = crate::state::store().settings();
    eprintln!("[headsup] {title}: {}", body.lines().next().unwrap_or(""));
    if settings.heads_up_pc {
        use tauri_plugin_notification::NotificationExt;
        if let Err(e) = app.notification().builder().title(title).body(body).show() {
            eprintln!("[headsup] Windows notification failed: {e}");
        }
        let _ = app.emit(crate::events::STATUS, StatusEvent { kind: "info", message: title.to_string(), detail: Some(body.to_string()) });
    }
    if settings.heads_up_phone {
        crate::companion::notify_everywhere(body);
    }
}

/// A sample, from the Apps tab, so the user sees where heads-ups land.
pub fn test(app: &AppHandle) {
    deliver(app, "Izuki heads-up", "👋 This is how I'll tell you about new email, meetings and more.");
}

// ---------------------------------------------------------------------------
// Reading tool results
// ---------------------------------------------------------------------------

/// The first array under any of `keys`, searched a few levels deep —
/// tool results nest their lists differently.
fn find_array(v: &Value, keys: &[&str]) -> Option<Vec<Value>> {
    fn walk(v: &Value, keys: &[&str], depth: u8) -> Option<Vec<Value>> {
        if depth > 4 {
            return None;
        }
        if let Some(obj) = v.as_object() {
            for k in keys {
                if let Some(a) = obj.get(*k).and_then(Value::as_array) {
                    return Some(a.clone());
                }
            }
            for child in obj.values() {
                if let Some(a) = walk(child, keys, depth + 1) {
                    return Some(a);
                }
            }
        }
        None
    }
    walk(v, keys, 0)
}

fn str_of(v: &Value, keys: &[&str]) -> Option<String> {
    keys.iter().find_map(|k| v[*k].as_str().map(|s| s.trim().to_string()).filter(|s| !s.is_empty()))
}

fn clip(s: &str, max: usize) -> String {
    if s.chars().count() <= max {
        s.to_string()
    } else {
        format!("{}…", s.chars().take(max).collect::<String>())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_a_digest_and_hears_inbox_questions() {
        let d = parse_digest(r#"Sure! {"summary":"Two things need you.","items":[{"from":"EDF","subject":"Your bill","kind":"money","action":"Pay the £42 bill by Friday","urgent":true},{"from":"Sam","subject":"Saturday","kind":"reply","action":"Reply to Sam","urgent":false}]}"#).unwrap();
        assert_eq!(d.items.len(), 2);
        assert_eq!(d.items[0].kind, "money");
        assert!(d.items[0].urgent);
        assert!(is_inbox_question("what's important in my email?"));
        assert!(is_inbox_question("go through my inbox"));
        assert!(is_inbox_question("anything urgent in my gmail"));
        assert!(!is_inbox_question("send an email to sam"));
        assert!(!is_inbox_question("what is email"));
    }

    #[test]
    fn reads_gmail_results() {
        let data = json!({ "messages": [
            { "messageId": "a1", "sender": "Sam Lee <sam@x.com>", "subject": "Friday?" },
            { "id": "a2", "from": "\"Bank\" <no-reply@bank.com>", "subject": "" }
        ]});
        let m = messages(&json!({ "response_data": data }));
        assert_eq!(m.len(), 2);
        assert_eq!(m[0].from, "Sam Lee");
        assert_eq!(m[0].subject, "Friday?");
        assert_eq!(m[1].from, "Bank");
    }

    #[test]
    fn first_look_only_learns() {
        let mut st = State::default();
        // Can't call the real tool here; check the seen-set rule directly.
        let seen = st.seen_mail.get_or_insert_with(HashSet::new);
        assert!(seen.insert("x".into()));
        assert!(!seen.insert("x".into()));
    }

    #[test]
    fn reads_a_school_calendar() {
        let ics = "BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nUID:bb-1\r\nSUMMARY:Essay 2 \\, English 101\r\nDTSTART;VALUE=DATE:20300115\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nUID:bb-2\r\nSUMMARY:Lab report due for CHEM 110 - a very long title that\r\n  continues here\r\nDTSTART:20300116T045900Z\r\nDTEND:20300116T045900Z\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n";
        let items = parse_ics(ics);
        assert_eq!(items.len(), 2);
        assert_eq!(items[0].title, "Essay 2 , English 101");
        assert_eq!(items[0].at.format("%H:%M").to_string(), "23:59");
        assert!(items[1].title.ends_with("continues here"), "{}", items[1].title);
    }

    #[test]
    fn school_work_is_told_once_per_stage() {
        let mut st = State::default();
        st.school = vec![Due { uid: "a".into(), title: "Quiz".into(), at: Local::now() + chrono::Duration::hours(5) }];
        assert_eq!(school_due_soon(&mut st).len(), 1);
        assert_eq!(school_due_soon(&mut st).len(), 0);
        st.school[0].at = Local::now() + chrono::Duration::minutes(90);
        assert_eq!(school_due_soon(&mut st).len(), 1);
        assert_eq!(school_due_soon(&mut st).len(), 0);
    }

    #[test]
    fn brief_time_parses() {
        assert!(!brief_due("nonsense"));
        assert!(!brief_due("25"));
    }
}
