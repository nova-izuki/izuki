//! Screen time — "how long was I on YouTube today?", "what did I spend most
//! time on?". Every few seconds while you're at the PC, the app in front (or
//! the big site in a browser: YouTube, Netflix, Instagram…) gets the time
//! counted. Only names and minutes are kept — never titles or what was on
//! screen — on this PC, for two weeks.

use std::collections::BTreeMap;
use std::path::PathBuf;
use std::time::Duration;

use parking_lot::Mutex;

/// day ("2026-10-04") → name → seconds.
type Days = BTreeMap<String, BTreeMap<String, u64>>;

static DAYS: Mutex<Option<Days>> = Mutex::new(None);
const TICK: u64 = 10;

fn path() -> PathBuf {
    crate::store::data_dir().join("screentime.json")
}

fn today() -> String {
    chrono::Local::now().format("%Y-%m-%d").to_string()
}

fn with<T>(f: impl FnOnce(&mut Days) -> T) -> T {
    let mut g = DAYS.lock();
    let days = g.get_or_insert_with(|| std::fs::read_to_string(path()).ok().and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default());
    f(days)
}

/// Big sites people ask about, found in a browser tab's title.
const SITES: &[(&str, &str)] = &[
    ("youtube", "YouTube"), ("netflix", "Netflix"), ("instagram", "Instagram"), ("tiktok", "TikTok"), ("facebook", "Facebook"),
    ("whatsapp", "WhatsApp"), ("gmail", "Gmail"), ("outlook", "Outlook"), ("blackboard", "Blackboard"), ("canvas", "Canvas"),
    ("chatgpt", "ChatGPT"), ("reddit", "Reddit"), ("spotify", "Spotify"), ("twitch", "Twitch"), ("linkedin", "LinkedIn"),
    ("google docs", "Google Docs"), ("- google sheets", "Google Sheets"), ("amazon", "Amazon"), ("disney+", "Disney+"),
    ("prime video", "Prime Video"), (" / x", "X"), ("snapchat", "Snapchat"), ("pinterest", "Pinterest"), ("discord", "Discord"),
];

const APPS: &[(&str, &str)] = &[
    ("chrome", "Chrome"), ("msedge", "Edge"), ("firefox", "Firefox"), ("brave", "Brave"), ("winword", "Word"), ("excel", "Excel"),
    ("powerpnt", "PowerPoint"), ("code", "VS Code"), ("explorer", "File Explorer"), ("spotify", "Spotify"), ("discord", "Discord"),
    ("whatsapp", "WhatsApp"), ("teams", "Teams"), ("ms-teams", "Teams"), ("zoom", "Zoom"), ("steam", "Steam"), ("notepad", "Notepad"),
    ("onenote", "OneNote"), ("outlook", "Outlook"), ("olk", "Outlook"), ("vlc", "VLC"), ("photoshop", "Photoshop"), ("telegram", "Telegram"),
];

/// What to count the window in front as: a known site, else the app.
pub fn name_for(app: &str, title: &str) -> Option<String> {
    let a = app.to_lowercase();
    let a = a.trim_end_matches(".exe");
    if a.is_empty() || a.contains("izuki") || a == "lockapp" || a == "searchhost" || a == "shellexperiencehost" {
        return None;
    }
    let browser = ["chrome", "msedge", "firefox", "brave", "opera", "vivaldi", "arc"].contains(&a);
    if browser {
        let t = title.to_lowercase();
        if let Some((_, site)) = SITES.iter().find(|(k, _)| t.contains(k)) {
            return Some(site.to_string());
        }
    }
    Some(APPS.iter().find(|(k, _)| a == *k).map(|(_, n)| n.to_string()).unwrap_or_else(|| {
        let mut c = a.chars();
        c.next().map(|f| f.to_uppercase().collect::<String>() + c.as_str()).unwrap_or_default()
    }))
}

pub fn spawn() {
    std::thread::spawn(|| {
        let mut since_save = 0u64;
        loop {
            std::thread::sleep(Duration::from_secs(TICK));
            let Some(store) = crate::state::try_store() else { continue };
            if !store.settings().screen_time_enabled || crate::buddy::idle_secs() > 120 {
                continue;
            }
            let Some(name) = name_for(&crate::uia::foreground_app(), &crate::uia::foreground_title()) else { continue };
            let day = today();
            with(|d| {
                *d.entry(day).or_default().entry(name).or_insert(0) += TICK;
                while d.len() > 14 {
                    let first = d.keys().next().cloned().unwrap_or_default();
                    d.remove(&first);
                }
            });
            since_save += TICK;
            if since_save >= 60 {
                since_save = 0;
                with(|d| {
                    if let Ok(s) = serde_json::to_string(d) {
                        let _ = std::fs::write(path(), s);
                    }
                });
            }
        }
    });
}

/// Today's top things, (name, minutes), most first.
pub fn top_today(n: usize) -> Vec<(String, u64)> {
    let day = today();
    with(|d| {
        let mut v: Vec<(String, u64)> = d.get(&day).map(|m| m.iter().map(|(k, s)| (k.clone(), s / 60)).collect()).unwrap_or_default();
        v.sort_by(|a, b| b.1.cmp(&a.1));
        v.retain(|(_, m)| *m > 0);
        v.truncate(n);
        v
    })
}

pub fn is_question(said: &str) -> bool {
    let s = said.to_lowercase();
    s.contains("screen time")
        || (s.contains("how long") || s.contains("how much time")) && (s.contains(" on ") || s.contains("spent") || s.contains("today") || s.contains("yesterday")) && !s.contains("timer") && !s.contains("left")
        || s.contains("what did i spend") || s.contains("spend most time") || s.contains("spent most time")
}

pub fn answer(said: &str) -> String {
    if !crate::state::try_store().is_some_and(|s| s.settings().screen_time_enabled) {
        return "Screen time is off — turn it on under Talk to Izuki → Screen time, and I'll start counting.".into();
    }
    let s = said.to_lowercase();
    let day = if s.contains("yesterday") {
        (chrono::Local::now() - chrono::Duration::days(1)).format("%Y-%m-%d").to_string()
    } else {
        today()
    };
    let when = if s.contains("yesterday") { "yesterday" } else { "today" };
    let totals: BTreeMap<String, u64> = with(|d| d.get(&day).cloned().unwrap_or_default());
    answer_from(&totals, &s, when)
}

fn answer_from(totals: &BTreeMap<String, u64>, s: &str, when: &str) -> String {
    if totals.is_empty() {
        return format!("I don't have any screen time counted for {when} yet.");
    }
    let pretty = |secs: u64| {
        let m = secs / 60;
        if m >= 60 { format!("{} h {} min", m / 60, m % 60) } else { format!("{} min", m.max(1)) }
    };
    // One thing asked about: "on YouTube".
    if let Some((name, secs)) = totals.iter().find(|(k, _)| s.contains(&k.to_lowercase())) {
        return format!("You've spent {} on {name} {when}.", pretty(*secs));
    }
    let total: u64 = totals.values().sum();
    let mut v: Vec<(&String, &u64)> = totals.iter().collect();
    v.sort_by(|a, b| b.1.cmp(a.1));
    let top: Vec<String> = v.iter().take(3).map(|(k, secs)| format!("{k} {}", pretty(**secs))).collect();
    format!("{} on the PC {when} — most of it on {}.", pretty(total).replace("min", "minutes"), top.join(", "))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn counts_apps_and_big_sites() {
        assert_eq!(name_for("chrome.exe", "Burna Boy - Last Last - YouTube - Google Chrome").as_deref(), Some("YouTube"));
        assert_eq!(name_for("msedge.exe", "Some article - Microsoft Edge").as_deref(), Some("Edge"));
        assert_eq!(name_for("WINWORD.EXE", "Essay.docx - Word").as_deref(), Some("Word"));
        assert_eq!(name_for("izuki.exe", "Izuki"), None);
        assert!(is_question("how long was I on youtube today"));
        assert!(is_question("what's my screen time"));
        assert!(!is_question("how long is left on the timer"));
        let mut t = BTreeMap::new();
        t.insert("YouTube".to_string(), 5400);
        t.insert("Word".to_string(), 1800);
        assert_eq!(answer_from(&t, "how long was i on youtube today", "today"), "You've spent 1 h 30 min on YouTube today.");
        assert!(answer_from(&t, "screen time", "today").starts_with("2 h 0 minutes on the PC today — most of it on YouTube"));
    }
}
