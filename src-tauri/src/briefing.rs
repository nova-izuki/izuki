//! "Hey Nova, wake up" — a status report, the way a film AI greets you when
//! you walk in: the time, the battery, how the PC is doing, today's
//! reminders, what's playing and which apps are linked, then "what are we
//! doing first?". Instant: read straight off this PC, no AI to wait for.

use chrono::{Datelike, Local, Timelike};

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

/// The report, ready to say.
pub fn compose() -> String {
    let now = Local::now();
    let mut lines: Vec<String> = Vec::new();
    let hello = match now.hour() {
        0..=4 => "Up late, I see. I'm here.",
        5..=11 => "Good morning. I'm up and ready.",
        12..=16 => "Good afternoon. Online and ready.",
        _ => "Good evening. Online and ready.",
    };
    lines.push(hello.into());
    let weekday = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][now.weekday().num_days_from_monday() as usize];
    lines.push(format!("It's {} on {weekday}.", now.format("%-I:%M %p")));

    if let Some(b) = battery() {
        lines.push(b);
    }
    lines.push(pc_health());
    lines.push(reminders_today(now.timestamp_millis()));
    if let Some(m) = crate::island::status().media.filter(|m| m.playing) {
        let by = if m.artist.trim().is_empty() { String::new() } else { format!(" by {}", m.artist) };
        lines.push(format!("{}{by} is playing.", m.title));
    }
    lines.push(apps());
    lines.push("What are we doing first?".into());
    lines.into_iter().filter(|l| !l.trim().is_empty()).collect::<Vec<_>>().join(" ")
}

fn reminders_today(now_ms: i64) -> String {
    let today = Local::now().date_naive();
    let mut todays: Vec<_> = crate::reminders::list()
        .into_iter()
        .filter(|r| r.at > now_ms)
        .filter(|r| chrono::DateTime::from_timestamp_millis(r.at).is_some_and(|d| d.with_timezone(&Local).date_naive() == today))
        .collect();
    todays.sort_by_key(|r| r.at);
    match todays.as_slice() {
        [] => "Nothing else on your reminders today.".into(),
        [r] => format!("One reminder left today: {} at {}.", r.text.trim_end_matches('.'), at(r.at)),
        [r, rest @ ..] => format!("{} reminders left today — next is {} at {}.", rest.len() + 1, r.text.trim_end_matches('.'), at(r.at)),
    }
}

fn at(ms: i64) -> String {
    chrono::DateTime::from_timestamp_millis(ms)
        .map(|d| d.with_timezone(&Local).format("%-I:%M %p").to_string())
        .unwrap_or_default()
}

fn apps() -> String {
    let Some(store) = crate::state::try_store() else { return String::new() };
    if store.settings().composio_api_key.trim().is_empty() {
        return "No apps linked yet — say \"connect Gmail\" whenever you want me in your email.".into();
    }
    match crate::composio::connected() {
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
    }
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
fn battery() -> Option<String> {
    use windows::Win32::System::Power::{GetSystemPowerStatus, SYSTEM_POWER_STATUS};
    let mut s = SYSTEM_POWER_STATUS::default();
    unsafe { GetSystemPowerStatus(&mut s).ok()? };
    // 128 = no battery (a desktop PC); 255 = unknown.
    if s.BatteryFlag & 128 != 0 || s.BatteryLifePercent > 100 {
        return None;
    }
    let pct = s.BatteryLifePercent;
    let plugged = s.ACLineStatus == 1;
    Some(match (pct, plugged) {
        (p, true) if p >= 99 => "Battery's full.".into(),
        (p, true) => format!("Battery's at {p}% and charging."),
        (p, false) if p <= 15 => format!("Battery's low — {p}%. Plug in soon."),
        (p, false) => format!("Battery's at {p}%."),
    })
}

#[cfg(not(windows))]
fn battery() -> Option<String> {
    None
}

#[cfg(windows)]
fn pc_health() -> String {
    use windows::Win32::Storage::FileSystem::GetDiskFreeSpaceExW;
    use windows::Win32::System::SystemInformation::{GlobalMemoryStatusEx, MEMORYSTATUSEX};
    let mut mem = MEMORYSTATUSEX { dwLength: std::mem::size_of::<MEMORYSTATUSEX>() as u32, ..Default::default() };
    let memory = unsafe { GlobalMemoryStatusEx(&mut mem).ok().map(|_| mem.dwMemoryLoad) };
    let mut free = 0u64;
    let disk = unsafe { GetDiskFreeSpaceExW(windows::core::w!("C:\\"), Some(&mut free), None, None).ok().map(|_| free / 1_000_000_000) };
    health_line(memory, disk)
}

#[cfg(not(windows))]
fn pc_health() -> String {
    health_line(None, None)
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
