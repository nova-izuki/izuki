//! "Hey Nova, wake up" — a status report, the way a film AI greets you when
//! you walk in: the time, the battery, how the PC is doing, today's
//! reminders, what's playing and which apps are linked, then "what are we
//! doing first?". Instant: read straight off this PC, no AI to wait for.

use chrono::{Datelike, Local, Timelike};
use serde::Serialize;

/// The same report as numbers, for the holographic status screen.
#[derive(Debug, Clone, Default, Serialize)]
pub struct Hud {
    pub greeting: String,
    pub time: String,
    pub date: String,
    /// Battery percent and whether it's charging (`None` on a desktop PC).
    pub battery: Option<(u8, bool)>,
    pub memory: Option<u32>,
    pub disk_free_gb: Option<u64>,
    /// Today's remaining reminders: (time, text).
    pub reminders: Vec<(String, String)>,
    pub playing: Option<String>,
    pub apps: Vec<String>,
    /// Unread emails today, and the first few (from, subject) — when Gmail is linked.
    pub inbox: Option<(usize, Vec<(String, String)>)>,
    /// The rest of today's calendar (time, title) — when Google Calendar is linked.
    pub calendar: Vec<(String, String)>,
    /// What Izuki says, so the screen can show it too.
    pub said: String,
}

/// Is this asking for the report? ("wake up", "status report", "how are the
/// apps doing", "catch me up", "good morning"…) Short requests only — "wake
/// me up at 7" is a reminder, not a report.
pub fn is_briefing(said: &str) -> bool {
    let s = said
        .to_lowercase()
        .replace(['’', '\''], "")
        .chars()
        .map(|c| if c.is_alphanumeric() || c == ' ' { c } else { ' ' })
        .collect::<String>();
    let s = s.split_whitespace().collect::<Vec<_>>().join(" ");
    let s = s.trim_start_matches("hey ").trim_start_matches("nova ").trim_start_matches("izuki ").trim_start_matches("jarvis ");
    if s.split_whitespace().count() > 12 || s.contains("wake me") || s.contains("remind") || s.contains("alarm") {
        return false;
    }
    // Clear asks, wherever they sit in the sentence.
    const ASKS: &[&str] = &[
        "wake up", "status report", "system status", "how are the apps", "hows the apps", "how are my apps",
        "hows my apps", "apps doing", "brief me", "briefing", "catch me up", "hows my pc", "how is my pc",
        "how is my computer", "hows my computer", "pc status", "computer status", "good morning nova",
        "good morning izuki", "morning nova",
    ];
    // Everyday phrases that only mean it when they're the whole thing
    // ("what's the status" yes; "what's the status of my order" no).
    const WHOLE: &[&str] = &["whats the status", "status update", "how are things", "hows everything", "how is everything", "what did i miss", "im home", "im back", "status"];
    WHOLE.contains(&s)
        || ASKS.iter().any(|a| s == *a || s.starts_with(&format!("{a} ")) || s.ends_with(&format!(" {a}")) || s.contains(&format!(" {a} ")))
}

/// The apps that carry messages (beyond Gmail and Calendar, read directly).
const MESSAGING: &[&str] = &[
    "slack", "discord", "whatsapp", "telegram", "outlook", "microsoft teams", "teams", "twitter", "x", "instagram",
    "facebook", "linkedin", "reddit", "notion", "github", "asana", "trello", "jira", "linear", "clickup",
];

/// What's new across the other linked apps (Slack, Discord, Outlook, GitHub…),
/// asked of the apps assistant in one go — a few seconds, so the status
/// screen shows it when it arrives. `None` when there's nothing to ask.
pub fn across_apps(apps: &[String]) -> Option<String> {
    let others: Vec<&String> = apps
        .iter()
        .filter(|a| MESSAGING.iter().any(|m| a.to_lowercase() == *m || a.to_lowercase().contains(m)))
        .collect();
    if others.is_empty() {
        return None;
    }
    let names = others.iter().map(|s| s.as_str()).collect::<Vec<_>>().join(", ");
    let ask = format!(
        "Quick status for my wake-up briefing: what's new for me today in {names}? Up to 4 short lines, each starting with the app's name (\"Slack — Sam: can we move the call?\"). Only read — don't send, post or change anything. If nothing's new, say so in one line."
    );
    let turn = crate::chat::Turn { role: "user".into(), content: ask };
    crate::composio::ask(&[turn]).ok().map(|a| a.text.trim().to_string()).filter(|t| !t.is_empty())
}

/// The report, ready to say.
pub fn compose() -> String {
    report().said
}

/// The report: what to say, and the numbers behind it for the screen.
pub fn report() -> Hud {
    let now = Local::now();
    let mut hud = Hud::default();
    let mut lines: Vec<String> = Vec::new();
    let hello = match now.hour() {
        0..=4 => "Up late, I see. I'm here.",
        5..=11 => "Good morning. I'm up and ready.",
        12..=16 => "Good afternoon. Online and ready.",
        _ => "Good evening. Online and ready.",
    };
    lines.push(hello.into());
    hud.greeting = hello.split('.').next().unwrap_or(hello).to_string();
    let weekday = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][now.weekday().num_days_from_monday() as usize];
    lines.push(format!("It's {} on {weekday}.", now.format("%-I:%M %p")));
    hud.time = now.format("%-I:%M").to_string();
    hud.date = format!("{weekday}, {}", now.format("%-d %B"));

    hud.battery = battery_raw();
    if let Some(b) = battery_line(hud.battery) {
        lines.push(b);
    }
    let (memory, disk) = health_raw();
    hud.memory = memory;
    hud.disk_free_gb = disk;
    lines.push(health_line(memory, disk));
    let (line, todays) = reminders_today(now.timestamp_millis());
    lines.push(line);
    hud.reminders = todays;
    if let Some(m) = crate::island::status().media.filter(|m| m.playing) {
        let by = if m.artist.trim().is_empty() { String::new() } else { format!(" by {}", m.artist) };
        lines.push(format!("{}{by} is playing.", m.title));
        hud.playing = Some(format!("{}{by}", m.title));
    }
    // Linked apps, the inbox and the calendar, asked at the same time so
    // the briefing stays quick.
    let ((line, apps), inbox, calendar) = std::thread::scope(|sc| {
        let linked = sc.spawn(apps);
        let ready = crate::state::try_store().is_some_and(|s| !s.settings().composio_api_key.trim().is_empty());
        let mail = sc.spawn(move || ready.then(|| crate::headsup::inbox_today().ok()).flatten());
        let cal = sc.spawn(move || ready.then(|| crate::headsup::calendar_today().ok()).flatten());
        (linked.join().unwrap_or_default(), mail.join().ok().flatten(), cal.join().ok().flatten())
    });
    let has = |slug: &str| apps.iter().any(|a| a.eq_ignore_ascii_case(slug) || a.to_lowercase().replace(' ', "") == slug);
    lines.push(line);
    if has("gmail") {
        if let Some((n, first)) = &inbox {
            lines.push(match (n, first.first()) {
                (0, _) => "No new email today.".into(),
                (1, Some((from, subject))) => format!("One new email, from {from}{}.", if subject.is_empty() { String::new() } else { format!(" — \"{subject}\"") }),
                (n, Some((from, _))) => format!("{}{n} new emails today — the latest from {from}.", if *n >= 20 { "Over " } else { "" }),
                (n, None) => format!("{n} new emails today."),
            });
            hud.inbox = inbox.clone();
        }
    }
    if has("googlecalendar") {
        if let Some(cal) = &calendar {
            lines.push(match cal.as_slice() {
                [] => "Nothing else on your calendar today.".into(),
                [(at, title)] => format!("On your calendar: {title} at {at}."),
                [(at, title), rest @ ..] => format!("{} things on your calendar — next is {title} at {at}.", rest.len() + 1),
            });
            hud.calendar = cal.clone();
        }
    }
    hud.apps = apps;
    lines.push("What are we doing first?".into());
    hud.said = lines.into_iter().filter(|l| !l.trim().is_empty()).collect::<Vec<_>>().join(" ");
    hud
}

fn reminders_today(now_ms: i64) -> (String, Vec<(String, String)>) {
    let today = Local::now().date_naive();
    let mut todays: Vec<_> = crate::reminders::list()
        .into_iter()
        .filter(|r| r.at > now_ms)
        .filter(|r| chrono::DateTime::from_timestamp_millis(r.at).is_some_and(|d| d.with_timezone(&Local).date_naive() == today))
        .collect();
    todays.sort_by_key(|r| r.at);
    let line = match todays.as_slice() {
        [] => "Nothing else on your reminders today.".into(),
        [r] => format!("One reminder left today: {} at {}.", r.text.trim_end_matches('.'), at(r.at)),
        [r, rest @ ..] => format!("{} reminders left today — next is {} at {}.", rest.len() + 1, r.text.trim_end_matches('.'), at(r.at)),
    };
    (line, todays.iter().take(4).map(|r| (at(r.at), r.text.clone())).collect())
}

fn at(ms: i64) -> String {
    chrono::DateTime::from_timestamp_millis(ms)
        .map(|d| d.with_timezone(&Local).format("%-I:%M %p").to_string())
        .unwrap_or_default()
}

fn apps() -> (String, Vec<String>) {
    let Some(store) = crate::state::try_store() else { return (String::new(), Vec::new()) };
    if store.settings().composio_api_key.trim().is_empty() {
        return ("No apps linked yet — say \"connect Gmail\" whenever you want me in your email.".into(), Vec::new());
    }
    let linked = crate::composio::connected();
    let names = linked.as_ref().map(|l| l.iter().map(|s| pretty(s)).collect()).unwrap_or_default();
    let line = match linked {
        Ok(list) if list.is_empty() => "Your apps key is set, but nothing's linked yet.".into(),
        Ok(list) => {
            let names: Vec<String> = list.iter().take(5).map(|s| pretty(s)).collect();
            let more = list.len().saturating_sub(5);
            let joined = join(&names);
            if more > 0 {
                format!("{joined} and {more} more are linked and working.")
            } else if names.len() == 1 {
                format!("{joined} is linked and working.")
            } else {
                format!("{joined} are linked and working.")
            }
        }
        Err(_) => "I couldn't reach your linked apps just now — the connection may be down.".into(),
    };
    (line, names)
}

/// "googlecalendar" → "Google Calendar", "gmail" → "Gmail".
fn pretty(slug: &str) -> String {
    match slug {
        "gmail" => "Gmail".into(),
        "googlecalendar" => "Google Calendar".into(),
        "googledrive" => "Google Drive".into(),
        "googledocs" => "Google Docs".into(),
        "googlesheets" => "Google Sheets".into(),
        "github" => "GitHub".into(),
        "linkedin" => "LinkedIn".into(),
        "youtube" => "YouTube".into(),
        "whatsapp" => "WhatsApp".into(),
        "tiktok" => "TikTok".into(),
        other => {
            let mut c = other.chars();
            c.next().map(|f| f.to_uppercase().collect::<String>() + c.as_str()).unwrap_or_default()
        }
    }
}

fn join(items: &[String]) -> String {
    match items {
        [] => String::new(),
        [a] => a.clone(),
        [rest @ .., last] => format!("{} and {last}", rest.join(", ")),
    }
}

#[cfg(windows)]
pub(crate) fn battery_raw() -> Option<(u8, bool)> {
    use windows::Win32::System::Power::{GetSystemPowerStatus, SYSTEM_POWER_STATUS};
    let mut s = SYSTEM_POWER_STATUS::default();
    unsafe { GetSystemPowerStatus(&mut s).ok()? };
    // 128 = no battery (a desktop PC); 255 = unknown.
    if s.BatteryFlag & 128 != 0 || s.BatteryLifePercent > 100 {
        return None;
    }
    Some((s.BatteryLifePercent, s.ACLineStatus == 1))
}

#[cfg(not(windows))]
pub(crate) fn battery_raw() -> Option<(u8, bool)> {
    None
}

fn battery_line(b: Option<(u8, bool)>) -> Option<String> {
    let (pct, plugged) = b?;
    Some(match (pct, plugged) {
        (p, true) if p >= 99 => "Battery's full.".into(),
        (p, true) => format!("Battery's at {p}% and charging."),
        (p, false) if p <= 15 => format!("Battery's low — {p}%. Plug in soon."),
        (p, false) => format!("Battery's at {p}%."),
    })
}

#[cfg(windows)]
pub(crate) fn health_raw() -> (Option<u32>, Option<u64>) {
    use windows::Win32::Storage::FileSystem::GetDiskFreeSpaceExW;
    use windows::Win32::System::SystemInformation::{GlobalMemoryStatusEx, MEMORYSTATUSEX};
    let mut mem = MEMORYSTATUSEX { dwLength: std::mem::size_of::<MEMORYSTATUSEX>() as u32, ..Default::default() };
    let memory = unsafe { GlobalMemoryStatusEx(&mut mem).ok().map(|_| mem.dwMemoryLoad) };
    let mut free = 0u64;
    let disk = unsafe { GetDiskFreeSpaceExW(windows::core::w!("C:\\"), Some(&mut free), None, None).ok().map(|_| free / 1_000_000_000) };
    (memory, disk)
}

#[cfg(not(windows))]
pub(crate) fn health_raw() -> (Option<u32>, Option<u64>) {
    (None, None)
}

fn health_line(memory: Option<u32>, disk_gb: Option<u64>) -> String {
    let mut parts = Vec::new();
    let mut busy = false;
    if let Some(m) = memory {
        if m >= 85 {
            busy = true;
            parts.push(format!("memory's working hard at {m}% — closing a few tabs would help"));
        } else {
            parts.push(format!("{m}% of memory in use"));
        }
    }
    if let Some(d) = disk_gb {
        if d < 10 {
            busy = true;
            parts.push(format!("only {d} GB left on your drive — worth clearing some space"));
        } else {
            parts.push(format!("{d} GB free"));
        }
    }
    if parts.is_empty() {
        return String::new();
    }
    let lead = if busy { "Heads up:" } else { "Your PC's running smoothly —" };
    format!("{lead} {}.", parts.join(", "))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn knows_when_it_is_asked() {
        for said in [
            "wake up", "Hey Nova, wake up.", "hey nova wake up hows the apps doing", "status report", "How are the apps doing?",
            "catch me up", "Good morning Nova", "how's my PC", "I'm back",
        ] {
            assert!(is_briefing(said), "{said}");
        }
        for said in ["wake me up at 7", "set an alarm to wake up at 6", "open youtube", "what's the status of my order on amazon today then tell me"] {
            assert!(!is_briefing(said), "{said}");
        }
    }

    #[test]
    fn health_says_what_matters() {
        assert_eq!(health_line(Some(41), Some(120)), "Your PC's running smoothly — 41% of memory in use, 120 GB free.");
        assert!(health_line(Some(91), Some(120)).starts_with("Heads up:"));
        assert!(health_line(Some(40), Some(4)).contains("only 4 GB left"));
        assert_eq!(health_line(None, None), "");
    }

    #[test]
    fn apps_read_like_names() {
        assert_eq!(pretty("googlecalendar"), "Google Calendar");
        assert_eq!(pretty("slack"), "Slack");
        assert_eq!(join(&["Gmail".into(), "Slack".into(), "GitHub".into()]), "Gmail, Slack and GitHub");
    }

    /// Run by hand: the real report for this PC.
    #[test]
    #[ignore]
    fn reads_this_pc() {
        println!("{}", compose());
    }
}

/// The status screen's live pulse, asked every couple of seconds while it's up.
#[derive(Debug, Clone, serde::Serialize)]
pub struct Pulse {
    pub cpu: Option<u32>,
    pub memory: Option<u32>,
    pub disk_free_gb: Option<u64>,
    pub battery: Option<(u8, bool)>,
    pub online: bool,
}

pub fn pulse() -> Pulse {
    let (memory, disk_free_gb) = health_raw();
    let online = ["1.1.1.1:443", "8.8.8.8:53"].iter().any(|a| {
        a.parse::<std::net::SocketAddr>().is_ok_and(|addr| std::net::TcpStream::connect_timeout(&addr, std::time::Duration::from_millis(900)).is_ok())
    });
    Pulse { cpu: cpu_load(), memory, disk_free_gb, battery: battery_raw(), online }
}

/// CPU in use since the last ask, 0–100.
#[cfg(windows)]
fn cpu_load() -> Option<u32> {
    use windows::Win32::Foundation::FILETIME;
    use windows::Win32::System::Threading::GetSystemTimes;
    static LAST: parking_lot::Mutex<Option<(u64, u64)>> = parking_lot::Mutex::new(None);
    let (mut idle, mut kernel, mut user) = (FILETIME::default(), FILETIME::default(), FILETIME::default());
    unsafe { GetSystemTimes(Some(&mut idle), Some(&mut kernel), Some(&mut user)).ok()? };
    let n = |f: FILETIME| ((f.dwHighDateTime as u64) << 32) | f.dwLowDateTime as u64;
    let (idle, total) = (n(idle), n(kernel) + n(user));
    let mut last = LAST.lock();
    let out = last.and_then(|(pi, pt)| {
        let dt = total.saturating_sub(pt);
        (dt > 0).then(|| (100 - (idle.saturating_sub(pi) * 100 / dt).min(100)) as u32)
    });
    *last = Some((idle, total));
    out
}

#[cfg(not(windows))]
fn cpu_load() -> Option<u32> {
    None
}
