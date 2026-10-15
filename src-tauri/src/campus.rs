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
}

pub fn parse(said: &str) -> Option<Ask> {
    let s = format!(" {} ", said.to_lowercase().replace(['?', '!', '.', ','], " ").split_whitespace().collect::<Vec<_>>().join(" "));
    let school = [" blackboard", " canvas", " moodle", " brightspace", " d2l", " school calendar", " my classes", " my courses"].iter().any(|w| s.contains(w));
    if (s.contains(" connect ") || s.contains(" link ") || s.contains(" set up ") || s.contains(" hook up ")) && school {
        return Some(Ask::Connect);
    }
    // Clearly about school deadlines: "due", "homework", "deadline" — or
    // assignments/labs/quizzes with a when ("this week", "do I have").
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
    let asks = [" what", " whats", " what's", " any ", " do i have", " show", " list", " check", " when is", " when's"].iter().any(|w| s.contains(w));
    if !asks {
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
    let feeds: Vec<String> = crate::state::store().settings().school_feeds.iter().map(|f| f.trim().to_string()).filter(|f| !f.is_empty()).collect();
    if feeds.is_empty() {
        anyhow::bail!("no school calendar is linked yet");
    }
    let now = Local::now();
    let mut all = Vec::new();
    let mut errors = Vec::new();
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
        .filter(|(uid, _, at)| *at > now && *at < now + chrono::Duration::days(14) && seen.insert(uid.clone()))
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

fn no_feed(e: &str) -> String {
    if e.contains("no school calendar") {
        "I can't see your due dates yet — your school calendar isn't linked. Say “connect my Blackboard” and I'll open it; just press Copy on its calendar link and I'll do the rest.".into()
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
                if let Some(app) = crate::state::app() {
                    crate::headsup::deliver(&app, "School calendar linked ✓", "Ask me “what's due this week?” any time — and I'll remind you before things are due.");
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
    }

    #[test]
    fn knows_a_calendar_link() {
        assert!(is_feed("https://blackboard.sanjac.edu/webapps/calendar/calendarFeed/abc123/learn.ics"));
        assert!(is_feed("webcal://school.instructure.com/feeds/calendars/user_abc.ics"));
        assert!(!is_feed("https://blackboard.sanjac.edu/ultra/course"));
        assert!(!is_feed("my homework notes"));
    }
}
