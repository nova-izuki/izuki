//! Campus: "what's due this week?", "what should I do first?", and
//! "connect my Blackboard" — from your school's own calendar feed (the
//! private .ics link Blackboard, Canvas, Moodle and others give you), the
//! same feed the school-work heads-ups use. Read only; nothing is ever
//! submitted or changed in the school's site.
//!
//! Connecting: Izuki opens your school site's calendar and watches the
//! clipboard for three minutes — when you press "Copy" on the calendar
//! link, it's saved by itself (nothing to paste).

use chrono::Local;

#[derive(Debug, Clone, PartialEq)]
pub enum Ask {
    /// What's due: "today", "tomorrow", "week" or "all" (the next two weeks).
    Due(&'static str),
    /// "Which should I do first?"
    First,
    Connect,
    /// "Show me everything overdue."
    Overdue,
}

pub fn parse(said: &str) -> Option<Ask> {
    let s = format!(" {} ", said.to_lowercase().replace(['?', '!', '.', ','], " ").split_whitespace().collect::<Vec<_>>().join(" "));
    let school = [" blackboard", " canvas", " moodle", " brightspace", " d2l", " school calendar", " my classes", " my courses"].iter().any(|w| s.contains(w));
    if (s.contains(" connect ") || s.contains(" link ") || s.contains(" set up ") || s.contains(" hook up ")) && school {
        return Some(Ask::Connect);
    }
    // Clearly about school deadlines: "due", "homework", "deadline" — or
    // assignments/labs/quizzes with a when ("this week", "do I have").
    let school_work = [" assignment", " homework", " lab", " quiz", " exam", " essay", " project", " discussion"].iter().any(|w| s.contains(w));
    let missed = [" missed", " miss any", " miss an ", " miss a ", " missing"].iter().any(|w| s.contains(w));
    if (s.contains(" overdue") || s.contains(" past due") || (missed && school_work) || (s.contains(" late ") && school_work)) && !s.contains(" connect") {
        return Some(Ask::Overdue);
    }
    let due = [" due", " homework", " deadline"].iter().any(|w| s.contains(w));
    let work = [" assignment", " lab ", " labs", " quiz", " exam"].iter().any(|w| s.contains(w));
    let timed = [" today", " tonight", " tomorrow", " week", " upcoming", " coming up", " next", " do i have", " left to do"].iter().any(|w| s.contains(w));
    if !(due || work && timed) {
        if work && [" do first", " start with", " prioriti", " most urgent", " should i do"].iter().any(|w| s.contains(w)) {
            return Some(Ask::First);
        }
        return None;
    }
    if [" do first", " start with", " prioriti", " most urgent", " what should i do"].iter().any(|w| s.contains(w)) {
        return Some(Ask::First);
    }
    let asks = [" what", " whats", " what's", " any ", " do i have", " show", " list", " check", " chck", " chrck", " chek", " cheak", " tell me", " give me", " see ", " see my", " look", " find", " get ", " read", " pull up", " when is", " when's", " when are"].iter().any(|w| s.contains(w));
    // "Blackboard due dates": with the school's site named, a "due" needs no
    // question word to be one. Never a reminder or a statement, though
    // ("remind me my essay is due Friday", "I submitted the lab due today").
    let statement = [" remind", " reminder", " alarm", " remember that", " note that", " i finished", " i submitted", " i turned in"].iter().any(|w| s.contains(w));
    if !asks && (statement || !school) {
        return None;
    }
    Some(Ask::Due(if s.contains(" today") || s.contains(" tonight") {
        "today"
    } else if s.contains(" tomorrow") {
        "tomorrow"
    } else if s.contains(" week") {
        "week"
    } else {
        "all"
    }))
}

/// Everything due in the next two weeks, soonest first: (title, when).
fn upcoming() -> anyhow::Result<Vec<(String, chrono::DateTime<Local>)>> {
    items(0, 14)
}

/// Calendar items from `back` days ago to `ahead` days ahead, soonest first.
fn items(back: i64, ahead: i64) -> anyhow::Result<Vec<(String, chrono::DateTime<Local>)>> {
    let feeds: Vec<String> = crate::state::store().settings().school_feeds.iter().map(|f| f.trim().to_string()).filter(|f| !f.is_empty()).collect();
    let now = Local::now();
    let mut all = Vec::new();
    let mut errors = Vec::new();
    if feeds.is_empty() {
        // No calendar link: read Blackboard itself, signed in as you, through
        // the browser extension.
        if !crate::blackboard::can_read_due() {
            anyhow::bail!("no school calendar is linked yet");
        }
        all = crate::blackboard::due_items(back, ahead)?;
    }
    for f in &feeds {
        match crate::headsup::fetch_school_feed(f) {
            Ok(items) => all.extend(items),
            Err(e) => errors.push(e.to_string()),
        }
    }
    if all.is_empty() && !errors.is_empty() {
        anyhow::bail!("I couldn't read your school calendar: {}", errors[0]);
    }
    let mut seen = std::collections::HashSet::new();
    let mut out: Vec<(String, chrono::DateTime<Local>)> = all
        .into_iter()
        .filter(|(uid, _, at)| *at > now - chrono::Duration::days(back) && *at < now + chrono::Duration::days(ahead) && seen.insert(uid.clone()))
        .map(|(_, t, at)| (t, at))
        .collect();
    out.sort_by_key(|(_, at)| *at);
    Ok(out)
}

fn when(at: chrono::DateTime<Local>) -> String {
    let today = Local::now().date_naive();
    let d = at.date_naive();
    let day = if d == today {
        "today".to_string()
    } else if d == today + chrono::Days::new(1) {
        "tomorrow".to_string()
    } else {
        at.format("%A %-d %b").to_string()
    };
    format!("{day} at {}", at.format("%-I:%M %p"))
}

pub fn handle(ask: Ask) -> String {
    match ask {
        Ask::Connect => connect(),
        Ask::Overdue => match items(14, 0) {
            Ok(items) if items.is_empty() => "Nothing on your school calendar was due in the last two weeks. 🎉".into(),
            Ok(items) => {
                let mut out = format!(
                    "{} on your school calendar {} due in the last two weeks — the calendar can't show whether you submitted, so check any you haven't:",
                    if items.len() == 1 { "One thing".to_string() } else { format!("{} things", items.len()) },
                    if items.len() == 1 { "was" } else { "were" }
                );
                for (t, at) in items.iter().rev().take(10) {
                    out.push_str(&format!("\n• {t} — was due {}", when(*at)));
                }
                if items.len() > 10 {
                    out.push_str(&format!("\n…and {} more.", items.len() - 10));
                }
                out
            }
            Err(e) => no_feed(&e.to_string()),
        },
        Ask::First => match upcoming() {
            Ok(items) if items.is_empty() => "Nothing's due in the next two weeks on your school calendar. 🎉".into(),
            Ok(items) => {
                let (t, at) = &items[0];
                let next = items.get(1).map(|(t2, a2)| format!(" After that: {t2} ({}).", when(*a2))).unwrap_or_default();
                format!("Start with “{t}” — it's due {}, the soonest.{next} Say “teach me this assignment” once it's open and I'll guide you.", when(*at))
            }
            Err(e) => no_feed(&e.to_string()),
        },
        Ask::Due(range) => match upcoming() {
            Ok(items) => {
                let today = Local::now().date_naive();
                let end_of_week = today + chrono::Days::new(7);
                let pick: Vec<&(String, chrono::DateTime<Local>)> = items
                    .iter()
                    .filter(|(_, at)| match range {
                        "today" => at.date_naive() == today,
                        "tomorrow" => at.date_naive() == today + chrono::Days::new(1),
                        "week" => at.date_naive() <= end_of_week,
                        _ => true,
                    })
                    .collect();
                let span = match range {
                    "today" => "today",
                    "tomorrow" => "tomorrow",
                    "week" => "in the next 7 days",
                    _ => "in the next two weeks",
                };
                if pick.is_empty() {
                    return format!("Nothing's due {span} on your school calendar.");
                }
                let mut out = format!("{} due {span}:", if pick.len() == 1 { "One thing".to_string() } else { format!("{} things", pick.len()) });
                for (t, at) in pick.iter().take(10) {
                    out.push_str(&format!("\n• {t} — {}", when(*at)));
                }
                if pick.len() > 10 {
                    out.push_str(&format!("\n…and {} more.", pick.len() - 10));
                }
                out
            }
            Err(e) => no_feed(&e.to_string()),
        },
    }
}

/// What the Campus hub shows: past two weeks and next two weeks.
#[derive(Debug, Clone, serde::Serialize, Default)]
pub struct Hub {
    /// A school calendar is linked.
    pub linked: bool,
    /// (title, unix ms) — was due in the last 14 days (submission unknown).
    pub past: Vec<(String, i64)>,
    /// (title, unix ms) — due in the next 14 days.
    pub coming: Vec<(String, i64)>,
    /// Why the calendar couldn't be read, if it couldn't.
    pub error: Option<String>,
}

pub fn hub() -> Hub {
    let linked = crate::state::store().settings().school_feeds.iter().any(|f| !f.trim().is_empty());
    if !linked {
        return Hub::default();
    }
    match items(14, 14) {
        Ok(all) => {
            let now = Local::now();
            let (past, coming): (Vec<_>, Vec<_>) = all.into_iter().partition(|(_, at)| *at <= now);
            let ms = |v: Vec<(String, chrono::DateTime<Local>)>| v.into_iter().map(|(t, at)| (t, at.timestamp_millis())).collect();
            Hub { linked, past: ms(past), coming: ms(coming), error: None }
        }
        Err(e) => Hub { linked, error: Some(e.to_string()), ..Default::default() },
    }
}

fn no_feed(e: &str) -> String {
    if e.contains("no school calendar") && crate::ext::outdated() {
        "I can't see your due dates yet — your Izuki browser extension is an older version that can't read Blackboard. Update it (Settings → Browser extension → download it again, then reload it), keep Blackboard open, and ask again. Or say “connect my Blackboard” to link its calendar once.".into()
    } else if e.contains("no school calendar") {
        "I can't see your due dates yet. Open your school's Blackboard in Chrome or Edge (signed in, with the Izuki browser extension) and ask again — I'll read them from there and remember it. Or say “connect my Blackboard” to link its calendar once.".into()
    } else {
        e.to_string()
    }
}

/// Open the school's calendar and catch the calendar link when it's copied.
fn connect() -> String {
    // The school's Blackboard (remembered or looked up), its calendar page.
    let base = crate::sites::school_site();
    let url = match base {
        Some(u) => {
            let host = u.split("://").nth(1).unwrap_or(&u).split('/').next().unwrap_or(&u).to_string();
            if host.contains("blackboard") { format!("https://{host}/ultra/calendar") } else { u }
        }
        None => String::new(),
    };
    if !url.is_empty() {
        let _ = crate::patience::open_url(&url);
    }
    watch_clipboard();
    format!(
        "{}On the Calendar, open its settings (⋯ or the gear) → “Get external calendar link” (Canvas: Calendar → “Calendar feed”) → Copy. I'm watching for it for 3 minutes and I'll save it by myself.",
        if url.is_empty() { "Open your school site's calendar. ".to_string() } else { "I opened your school calendar. ".to_string() }
    )
}

/// A calendar feed link: https/webcal and an .ics or calendar feed path.
fn is_feed(t: &str) -> bool {
    let t = t.trim();
    (t.starts_with("https://") || t.starts_with("webcal://") || t.starts_with("http://")) && !t.contains(' ') && (t.contains(".ics") || t.contains("/calendar") && (t.contains("feed") || t.contains("ical") || t.contains("export")))
}

fn watch_clipboard() {
    static ON: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);
    if ON.swap(true, std::sync::atomic::Ordering::SeqCst) {
        return;
    }
    std::thread::spawn(|| {
        let started = std::time::Instant::now();
        let Ok(mut board) = arboard::Clipboard::new() else {
            ON.store(false, std::sync::atomic::Ordering::SeqCst);
            return;
        };
        let before = board.get_text().unwrap_or_default();
        while started.elapsed() < std::time::Duration::from_secs(180) {
            std::thread::sleep(std::time::Duration::from_millis(700));
            let Ok(now) = board.get_text() else { continue };
            if now != before && is_feed(&now) {
                let link = now.trim().to_string();
                let store = crate::state::store();
                let mut s = store.settings();
                if !s.school_feeds.iter().any(|f| f.trim() == link) {
                    s.school_feeds.push(link);
                    store.set_settings(s);
                    crate::state::settings_changed_elsewhere();
                }
                eprintln!("[campus] school calendar linked");
                crate::island::refresh_glance();
                if let Some(app) = crate::state::app() {
                    crate::headsup::deliver_now(&app, "School calendar linked ✓", "Ask me “what's due this week?” any time — and I'll remind you before things are due.");
                }
                break;
            }
        }
        ON.store(false, std::sync::atomic::Ordering::SeqCst);
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hears_school_questions() {
        assert_eq!(parse("what's due this week?"), Some(Ask::Due("week")));
        assert_eq!(parse("do I have any assignments due tomorrow"), Some(Ask::Due("tomorrow")));
        assert_eq!(parse("which assignment should I do first"), Some(Ask::First));
        assert_eq!(parse("connect my blackboard"), Some(Ask::Connect));
        assert_eq!(parse("what time is it"), None);
        assert_eq!(parse("teach me this assignment"), None, "that's the study coach");
        assert_eq!(parse("what labs are in this folder"), None, "not a deadline question");
        assert_eq!(parse("show me the lab instructions"), None);
        assert_eq!(parse("show me everything overdue"), Some(Ask::Overdue));
        assert_eq!(parse("did I miss any assignments?"), Some(Ask::Overdue));
        assert_eq!(parse("I'm running late"), None);
        assert_eq!(parse("chrck my assignments on blackboard and tell me the due dates"), Some(Ask::Due("all")), "typos and “tell me”");
        assert_eq!(parse("blackboard due dates"), Some(Ask::Due("all")));
        assert_eq!(parse("tell me what assignments are due this week"), Some(Ask::Due("week")));
        assert_eq!(parse("remind me my essay is due friday"), None, "a reminder");
        assert_eq!(parse("my essay is due friday"), None, "a statement");
    }

    #[test]
    fn knows_a_calendar_link() {
        assert!(is_feed("https://blackboard.sanjac.edu/webapps/calendar/calendarFeed/abc123/learn.ics"));
        assert!(is_feed("webcal://school.instructure.com/feeds/calendars/user_abc.ics"));
        assert!(!is_feed("https://blackboard.sanjac.edu/ultra/course"));
        assert!(!is_feed("my homework notes"));
    }
}
