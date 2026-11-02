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
    /// "What haven't I done?", "which assignments are done and not done?"
    Left,
}

pub fn parse(said: &str) -> Option<Ask> {
    let s = format!(" {} ", said.to_lowercase().replace(['?', '!', '.', ','], " ").split_whitespace().collect::<Vec<_>>().join(" "));
    let school = [" blackboard", " canvas", " moodle", " brightspace", " d2l", " school calendar", " my classes", " my courses"].iter().any(|w| s.contains(w));
    if (s.contains(" connect ") || s.contains(" link ") || s.contains(" set up ") || s.contains(" hook up ")) && school {
        return Some(Ask::Connect);
    }
    // Clearly about school deadlines: "due", "homework", "deadline" — or
    // assignments/labs/quizzes with a when ("this week", "do I have").
    let school_work = [" assignment", " homework", " lab", " quiz", " exam", " essay", " project", " discussion", " journal"].iter().any(|w| s.contains(w));
    // What's handed in and what isn't.
    let left = [
        " haven't done", " havent done", " have not done", " not done", " still have to do", " still need to do", " still got to do",
        " what's left", " whats left", " left to do", " not handed in", " haven't handed in", " havent handed in", " haven't submitted",
        " havent submitted", " not submitted", " done and not done", " done or not", " which are done", " which ones are done",
        " did i submit", " have i submitted", " what do i still", " haven't i handed in",
        " havent i handed in", " have i handed in", " haven't i submitted", " havent i submitted", " have i turned in",
        " haven't i turned in", " havent i turned in", " not turned in", " haven't i done", " havent i done", " have i not done",
    ]
    .iter()
    .any(|w| s.contains(w));
    // "What's left to do" alone could be anything: it's about school with a
    // school word. Handing in is school already, with any piece of work.
    let school_term = school || [" assignment", " homework", " due", " school", " class", " course", " coursework"].iter().any(|w| s.contains(w));
    let handing_in = [" handed in", " submit", " turned in"].iter().any(|w| s.contains(w));
    // ("Remind me to finish the homework that's not done" is a reminder.)
    let reminder = [" remind", " reminder", " alarm", " set a timer"].iter().any(|w| s.contains(w));
    // ("My essay is done", "I submitted the lab" say what happened; they don't ask.)
    // (At the start: "what haven't I handed in" contains "I handed in".)
    let statement = s.starts_with(" my ") || [" i finished", " i submitted", " i turned in", " i handed in", " i'm done", " im done", " i did "].iter().any(|w| s.starts_with(w));
    if left && (school_term || (handing_in && school_work)) && !s.contains(" connect") && !reminder && !statement {
        return Some(Ask::Left);
    }
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

/// One thing due: its title, when, and whether it's handed in (None: the
/// calendar feed can't say).
type Item = (String, chrono::DateTime<Local>, Option<bool>);

/// Everything due in the next two weeks, soonest first.
fn upcoming() -> anyhow::Result<Vec<Item>> {
    items(0, 14)
}

/// A calendar link can't say what's handed in; Blackboard can, when it's
/// readable too: each item's answer from Blackboard's copy of it (None for
/// any it can't match, and for all of them when Blackboard can't be read).
/// Shared by the answers here and the heads-ups (headsup.rs).
pub fn handed_in_from_blackboard(items: &[(&str, chrono::DateTime<Local>)], back: i64, ahead: i64) -> Vec<Option<bool>> {
    if items.is_empty() || !crate::blackboard::can_read_due() {
        return vec![None; items.len()];
    }
    let Ok(bb) = crate::blackboard::due_items(back, ahead) else { return vec![None; items.len()] };
    let bb: Vec<(String, chrono::DateTime<Local>, Option<bool>)> = bb.into_iter().map(|d| (d.title, d.at, d.done)).collect();
    items.iter().map(|(t, at)| same_item(t, *at, &bb)).collect()
}

/// Whether a calendar-feed item is handed in, from Blackboard's copy of it:
/// due within two minutes of it, with the same title before the course part
/// (a feed writes "Quiz [COURSE]", Blackboard "Quiz — Course").
fn same_item(title: &str, at: chrono::DateTime<Local>, bb: &[(String, chrono::DateTime<Local>, Option<bool>)]) -> Option<bool> {
    // ("(" stays: "Lab (Part 2)" and "Lab (Part 3)" are different labs.)
    let key = |t: &str| t.split(['[', '—']).next().unwrap_or(t).to_lowercase().chars().filter(|c| c.is_alphanumeric()).collect::<String>();
    let mine = key(title);
    if mine.len() < 4 {
        return None;
    }
    // Exactly one match, or it can't be told which.
    let mut matches = bb.iter().filter(|(t, when, _)| (*when - at).num_seconds().abs() <= 120 && key(t) == mine);
    match (matches.next(), matches.next()) {
        (Some((_, _, done)), None) => *done,
        _ => None,
    }
}

/// " ✓ handed in" / " (not handed in yet)" / nothing, after an item.
fn mark(done: Option<bool>) -> &'static str {
    match done {
        Some(true) => " ✓ handed in",
        Some(false) => " (not handed in yet)",
        None => "",
    }
}

/// Calendar items from `back` days ago to `ahead` days ahead, soonest first.
fn items(back: i64, ahead: i64) -> anyhow::Result<Vec<Item>> {
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
        all = crate::blackboard::due_items(back, ahead)?.into_iter().map(|d| (d.id, d.title, d.at, d.done)).collect();
    }
    for f in &feeds {
        match crate::headsup::fetch_school_feed(f) {
            Ok(items) => all.extend(items.into_iter().map(|(id, t, at)| (id, t, at, None))),
            Err(e) => errors.push(e.to_string()),
        }
    }
    if all.is_empty() && !errors.is_empty() {
        anyhow::bail!("I couldn't read your school calendar: {}", errors[0]);
    }
    if !feeds.is_empty() && all.iter().any(|(_, _, _, d)| d.is_none()) {
        let wanted: Vec<(&str, chrono::DateTime<Local>)> = all.iter().map(|(_, t, at, _)| (t.as_str(), *at)).collect();
        let marks = handed_in_from_blackboard(&wanted, back, ahead);
        for (item, mark) in all.iter_mut().zip(marks) {
            if item.3.is_none() {
                item.3 = mark;
            }
        }
    }
    let mut seen = std::collections::HashSet::new();
    let mut out: Vec<Item> = all
        .into_iter()
        .filter(|(uid, _, at, _)| *at > now - chrono::Duration::days(back) && *at < now + chrono::Duration::days(ahead) && seen.insert(uid.clone()))
        .map(|(_, t, at, done)| (t, at, done))
        .collect();
    out.sort_by_key(|(_, at, _)| *at);
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
            Ok(items) => overdue(&items),
            Err(e) => no_feed(&e.to_string()),
        },
        Ask::Left => match items(14, 14) {
            Ok(items) if items.is_empty() => "Nothing was due in the last two weeks or is due in the next two, on your school calendar. 🎉".into(),
            Ok(items) => left(&items, Local::now()),
            Err(e) => no_feed(&e.to_string()),
        },
        Ask::First => match upcoming() {
            Ok(items) if items.is_empty() => "Nothing's due in the next two weeks on your school calendar. 🎉".into(),
            Ok(items) if items.iter().all(|(_, _, d)| *d == Some(true)) => "Everything due in the next two weeks is already handed in. 🎉".into(),
            Ok(items) => {
                // The soonest that isn't handed in yet.
                let open: Vec<&Item> = items.iter().filter(|(_, _, d)| *d != Some(true)).collect();
                let (t, at, _) = open[0];
                let next = open.get(1).map(|(t2, a2, _)| format!(" After that: {t2} ({}).", when(*a2))).unwrap_or_default();
                format!("Start with “{t}” — it's due {}, the soonest.{next} Say “teach me this assignment” once it's open and I'll guide you.", when(*at))
            }
            Err(e) => no_feed(&e.to_string()),
        },
        Ask::Due(range) => match upcoming() {
            Ok(items) => {
                let today = Local::now().date_naive();
                let end_of_week = today + chrono::Days::new(7);
                let pick: Vec<&Item> = items
                    .iter()
                    .filter(|(_, at, _)| match range {
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
                for (t, at, done) in pick.iter().take(10) {
                    out.push_str(&format!("\n• {t} — {}{}", when(*at), mark(*done)));
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

/// Was due in the last two weeks: what isn't handed in, and (apart) what
/// can't be told, when Blackboard says. A calendar link alone can't: then
/// everything is listed, as it always was.
fn overdue(items: &[Item]) -> String {
    let plural = |n: usize| if n == 1 { "One thing".to_string() } else { format!("{n} things") };
    if !items.iter().any(|(_, _, d)| d.is_some()) {
        let n = items.len();
        let mut out = format!(
            "{} on your school calendar {} due in the last two weeks — the calendar can't show whether you submitted, so check any you haven't:",
            plural(n),
            if n == 1 { "was" } else { "were" }
        );
        for (t, at, _) in items.iter().rev().take(10) {
            out.push_str(&format!("\n• {t} — was due {}", when(*at)));
        }
        if n > 10 {
            out.push_str(&format!("\n…and {} more.", n - 10));
        }
        return out;
    }
    let done = items.iter().filter(|(_, _, d)| *d == Some(true)).count();
    let missing: Vec<&Item> = items.iter().filter(|(_, _, d)| *d == Some(false)).collect();
    let unsure: Vec<&Item> = items.iter().filter(|(_, _, d)| d.is_none()).collect();
    if missing.is_empty() && unsure.is_empty() {
        return format!("Everything due in the last two weeks is handed in ({done}). 🎉");
    }
    let others = |k: usize| match k {
        0 => String::new(),
        k => format!(" ({k} other{} {} done)", if k == 1 { "" } else { "s" }, if k == 1 { "is" } else { "are" }),
    };
    let mut out = if missing.is_empty() {
        format!("Nothing due in the last two weeks shows as missing{}.", if done > 0 { format!(" ({done} handed in)") } else { String::new() })
    } else {
        let n = missing.len();
        let mut out = format!("{} due in the last two weeks {} handed in yet{}:", plural(n), if n == 1 { "isn't" } else { "aren't" }, others(done));
        for (t, at, _) in missing.iter().rev().take(10) {
            out.push_str(&format!("\n• {t} — was due {}", when(*at)));
        }
        if n > 10 {
            out.push_str(&format!("\n…and {} more.", n - 10));
        }
        out
    };
    if !unsure.is_empty() {
        out.push_str(&format!(
            "\n\n{} I can't tell (Blackboard doesn't show {} handed in or not):",
            unsure.len(),
            if unsure.len() == 1 { "it as" } else { "them as" }
        ));
        for (t, at, _) in unsure.iter().rev().take(5) {
            out.push_str(&format!("\n• {t} — was due {}", when(*at)));
        }
    }
    out
}

/// "What haven't I done?": what isn't handed in (late first, then coming up),
/// what is, and what can't be told.
fn left(items: &[Item], now: chrono::DateTime<Local>) -> String {
    let done = items.iter().filter(|(_, _, d)| *d == Some(true)).count();
    let late: Vec<&Item> = items.iter().filter(|(_, at, d)| *at <= now && *d == Some(false)).collect();
    let coming: Vec<&Item> = items.iter().filter(|(_, at, d)| *at > now && *d == Some(false)).collect();
    let unsure: Vec<&Item> = items.iter().filter(|(_, _, d)| d.is_none()).collect();
    if late.is_empty() && coming.is_empty() && unsure.is_empty() {
        return format!("You've handed in everything on your school calendar from the last two weeks to the next two ({done}). 🎉");
    }
    // Only a calendar link: it can't show submissions at all, so everything,
    // said that way (not as Blackboard not knowing).
    if !items.is_empty() && unsure.len() == items.len() {
        let mut out = "Your school calendar can't show what's handed in, so here's everything due from two weeks ago to two weeks ahead. Check any you haven't done:".to_string();
        for (t, at, _) in items.iter().take(8) {
            out.push_str(&format!("
• {t} — {}{}", if *at <= now { "was due " } else { "due " }, when(*at)));
        }
        if items.len() > 8 {
            out.push_str(&format!("
…and {} more.", items.len() - 8));
        }
        return out;
    }
    let mut out = String::new();
    if !late.is_empty() {
        out.push_str(&format!("Past due and not handed in ({}):", late.len()));
        for (t, at, _) in late.iter().rev().take(8) {
            out.push_str(&format!("\n• {t} — was due {}", when(*at)));
        }
    }
    if !coming.is_empty() {
        if !out.is_empty() {
            out.push_str("\n\n");
        }
        out.push_str(&format!("Still to do ({}):", coming.len()));
        for (t, at, _) in coming.iter().take(8) {
            out.push_str(&format!("\n• {t} — due {}", when(*at)));
        }
    }
    if !unsure.is_empty() {
        if !out.is_empty() {
            out.push_str("\n\n");
        }
        out.push_str(&format!(
            "{} I can't tell (Blackboard doesn't show {} handed in or not — work on another site only shows once it reports back):",
            unsure.len(),
            if unsure.len() == 1 { "it as" } else { "them as" }
        ));
        for (t, at, _) in unsure.iter().take(5) {
            out.push_str(&format!("\n• {t} — {}", when(*at)));
        }
    }
    if done > 0 {
        out.push_str(&format!("\n\nAlready handed in: {done} ✓"));
    }
    out
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
            // Past items already handed in aren't "was due" any more.
            let (past, coming): (Vec<_>, Vec<_>) = all.into_iter().filter(|(_, at, d)| !(*at <= now && *d == Some(true))).partition(|(_, at, _)| *at <= now);
            let ms = |v: Vec<Item>| v.into_iter().map(|(t, at, _)| (t, at.timestamp_millis())).collect();
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
    fn hears_what_is_and_isnt_done() {
        for q in ["which assignments are done and not done", "what haven't I done yet for school", "what homework is left to do", "did I submit the lab", "what assignments haven't I handed in", "what's left due this week"] {
            assert_eq!(parse(q), Some(Ask::Left), "{q}");
        }
        assert_ne!(parse("is dinner done"), Some(Ask::Left));
        assert_ne!(parse("what's left in the fridge"), Some(Ask::Left));
        assert_ne!(parse("what's left to do on my project"), Some(Ask::Left), "a project alone isn't school");
        assert_ne!(parse("remind me to finish the homework that's not done"), Some(Ask::Left), "a reminder");
        assert_ne!(parse("my assignment is done"), Some(Ask::Left), "a statement");
        assert_ne!(parse("how did I do in class this week"), Some(Ask::Left), "how they did is grades");
        assert_ne!(parse("how have I done on my homework"), Some(Ask::Left), "how they did is grades");
        assert_ne!(parse("I submitted the lab but not the quiz"), Some(Ask::Left), "a statement");
    }

    #[test]
    fn says_what_is_handed_in_and_what_isnt() {
        let now = Local::now();
        let h = chrono::Duration::hours;
        let items: Vec<Item> = vec![
            ("Quiz: Module 11".into(), now - h(30), Some(false)),
            ("Journal: Data Retention".into(), now - h(20), Some(true)),
            ("Lab 9.3.1 Taking a Full Backup".into(), now + h(20), Some(false)),
            ("Discussion: Ethics".into(), now + h(40), Some(true)),
            ("uCertify lab".into(), now + h(50), None),
        ];
        let s = left(&items, now);
        assert!(s.starts_with("Past due and not handed in (1):\n• Quiz: Module 11"), "{s}");
        assert!(s.contains("Still to do (1):\n• Lab 9.3.1"), "{s}");
        assert!(s.contains("1 I can't tell") && s.contains("uCertify lab"), "{s}");
        assert!(s.ends_with("Already handed in: 2 ✓"), "{s}");
        let feed_only: Vec<Item> = vec![("Essay".into(), now - h(5), None), ("Lab".into(), now + h(5), None)];
        let f = left(&feed_only, now);
        assert!(f.starts_with("Your school calendar can't show what's handed in") && f.contains("Essay") && f.contains("Lab") && !f.contains("Blackboard"), "{f}");
        assert!(!s.contains("Journal") && !s.contains("Discussion"), "handed-in work isn't listed: {s}");
        let past: Vec<Item> = items.iter().filter(|(_, at, _)| *at <= now).cloned().collect();
        let o = overdue(&past);
        assert!(o.starts_with("One thing due in the last two weeks isn't handed in yet (1 other is done):"), "{o}");
        assert!(!o.contains("Journal"), "{o}");
        let all_done: Vec<Item> = vec![("Journal".into(), now - h(5), Some(true))];
        assert!(overdue(&all_done).starts_with("Everything due in the last two weeks is handed in"));
        // Handed in plus can't-tell: never "0 things aren't handed in".
        let mixed: Vec<Item> = vec![("Journal".into(), now - h(5), Some(true)), ("uCertify lab".into(), now - h(8), None)];
        let m = overdue(&mixed);
        assert!(m.starts_with("Nothing due in the last two weeks shows as missing (1 handed in)."), "{m}");
        assert!(m.contains("1 I can't tell") && m.contains("uCertify lab") && !m.contains("0 things"), "{m}");
        // A calendar feed alone can't tell: the old wording, everything listed.
        let feed: Vec<Item> = vec![("Essay".into(), now - h(5), None)];
        assert!(overdue(&feed).contains("can't show whether you submitted"));
        assert_eq!(mark(Some(true)), " ✓ handed in");
        // A calendar-link item takes Blackboard's answer for the same item.
        let bb = vec![("Quiz: Module 11 — Security Management Practices (ITSY-2341)".to_string(), now + h(3), Some(true))];
        assert_eq!(same_item("Quiz: Module 11 [ITSY-2341-372]", now + h(3), &bb), Some(true));
        assert_eq!(same_item("Quiz: Module 11", now + h(30), &bb), None, "a different time is a different item");
        assert_eq!(same_item("Lab 9.2.1", now + h(3), &bb), None, "a different title too");
        let twins = vec![("Quiz: Module 11 — A".to_string(), now + h(3), Some(true)), ("Quiz: Module 11 — B".to_string(), now + h(3), Some(false))];
        assert_eq!(same_item("Quiz: Module 11 [X]", now + h(3), &twins), None, "two matches: can't tell which");
    }

    #[test]
    fn knows_a_calendar_link() {
        assert!(is_feed("https://blackboard.sanjac.edu/webapps/calendar/calendarFeed/abc123/learn.ics"));
        assert!(is_feed("webcal://school.instructure.com/feeds/calendars/user_abc.ics"));
        assert!(!is_feed("https://blackboard.sanjac.edu/ultra/course"));
        assert!(!is_feed("my homework notes"));
    }
}
