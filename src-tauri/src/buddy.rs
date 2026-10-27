//! Buddy mode — Izuki speaking up by itself, like a friend at your desk.
//!
//! It keeps half an eye on things and, when something's worth it, the orb
//! comes up and says so: an important email (a job, an interview, money, a
//! deadline — the AI judges which), the battery running low, the drive
//! nearly full, the internet dropping, "welcome back" with what you missed,
//! a nudge after hours without a break. Small, undoable things it just
//! handles and says so (battery saver when the battery's nearly empty).
//!
//! It knows when not to: never in quiet hours unless it's urgent, never over
//! a film or game unless it's urgent, never twice about the same thing, and
//! not more than every few minutes. While you're away from the PC, what's
//! important goes to your phone too (Telegram / Discord), and the rest waits
//! for "welcome back".

use std::collections::HashMap;
use std::time::{Duration, Instant};

use chrono::Timelike;
use parking_lot::Mutex;
use serde::Serialize;
use tauri::{AppHandle, Emitter};

pub const EVENT: &str = "izuki://buddy";

const TICK: Duration = Duration::from_secs(30);
/// Nothing in the first moments after Izuki starts.
const SETTLE: Duration = Duration::from_secs(120);
/// The least time between two things it brings up by itself (urgent aside).
const GAP: Duration = Duration::from_secs(6 * 60);
/// Idle this long = away from the PC.
const AWAY_AFTER: Duration = Duration::from_secs(5 * 60);
/// Back after at least this long away = "welcome back".
const WELCOME_AFTER: Duration = Duration::from_secs(15 * 60);
/// Going this long without a 5-minute break = a nudge.
const BREAK_AFTER: Duration = Duration::from_secs(150 * 60);

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum Level {
    /// Nice to know ("internet's back", a break nudge).
    Chat,
    /// Worth interrupting for (an important email, a meeting soon).
    Important,
    /// Right now, whatever's going on (battery about to die).
    Urgent,
}

#[derive(Debug, Clone, Serialize)]
pub struct Say {
    pub text: String,
    pub urgent: bool,
}

#[derive(Default)]
struct State {
    started: Option<Instant>,
    last_spoke: Option<Instant>,
    /// What's been said, by key, and when — never the same thing twice.
    told: HashMap<String, Instant>,
    /// Saved for "welcome back".
    missed: Vec<String>,
    away_since: Option<Instant>,
    streak_since: Option<Instant>,
    break_told: bool,
    battery_told: u8,
    saver_on: bool,
    memory_high: u8,
    net_down: u8,
    net_told: bool,
}

static STATE: Mutex<Option<State>> = Mutex::new(None);

fn with<T>(f: impl FnOnce(&mut State) -> T) -> T {
    let mut g = STATE.lock();
    f(g.get_or_insert_with(State::default))
}

pub fn spawn(app: AppHandle) {
    with(|s| s.started = Some(Instant::now()));
    std::thread::spawn(move || loop {
        std::thread::sleep(TICK);
        if crate::state::try_store().is_none() {
            continue;
        }
        let _ = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| tick(&app)));
    });
}

/// Something Izuki brings up that it can also do: said like [`say`], and if
/// it was said, a plain "yes" next asks for `request` (offers.rs).
pub fn offer(app: &AppHandle, key: &str, text: &str, level: Level, request: &str) {
    if say(app, key, text, level) {
        crate::offers::make(request);
    }
}

/// Something Izuki might bring up. `key` stops repeats; `level` decides
/// whether now is the moment. True only when it reached the user now —
/// spoken, or sent to their phone — not when it was kept for later.
pub fn say(app: &AppHandle, key: &str, text: &str, level: Level) -> bool {
    // The desktop mate says the important ones in its bubble too.
    if level >= Level::Important {
        crate::mate::notify("say", text);
    }
    let Some(store) = crate::state::try_store() else { return false };
    let settings = store.settings();
    let idle = idle_for();
    let away = idle >= AWAY_AFTER;
    let hour = chrono::Local::now().hour();
    let quiet = !(7..22).contains(&hour);
    let decision = with(|s| {
        if s.told.get(key).is_some_and(|t| t.elapsed() < Duration::from_secs(12 * 3600)) {
            return None;
        }
        if s.started.is_some_and(|t| t.elapsed() < SETTLE) && level < Level::Urgent {
            return None;
        }
        s.told.insert(key.to_string(), Instant::now());
        s.told.retain(|_, t| t.elapsed() < Duration::from_secs(24 * 3600));
        // Away: the important things reach the phone; all of it waits for later.
        if away {
            if level < Level::Urgent {
                s.missed.push(text.to_string());
                s.missed.truncate(8);
            }
            return Some((level >= Level::Important, level == Level::Urgent));
        }
        // Focus mode: everything that isn't urgent waits for "time's up".
        if crate::focus::active() && level < Level::Urgent {
            s.missed.push(text.to_string());
            s.missed.truncate(8);
            return Some((false, false));
        }
        let busy = crate::island::fullscreen_now();
        let too_soon = s.last_spoke.is_some_and(|t| t.elapsed() < GAP);
        let speak_now = level == Level::Urgent || (!quiet && !busy && (level == Level::Important || !too_soon));
        if !speak_now {
            if level >= Level::Important {
                s.missed.push(text.to_string());
                s.missed.truncate(8);
            }
            return Some((false, false));
        }
        s.last_spoke = Some(Instant::now());
        Some((false, true))
    });
    let Some((to_phone, out_loud)) = decision else { return false };
    eprintln!("[buddy] {key}: {text} (phone {to_phone}, aloud {out_loud})");
    let mut reached = false;
    if to_phone && settings.heads_up_phone {
        crate::companion::notify_everywhere(text);
        reached = true;
    }
    if out_loud && settings.buddy_speaks {
        let _ = app.emit(EVENT, Say { text: text.to_string(), urgent: level == Level::Urgent });
        reached = true;
    }
    reached
}

fn tick(app: &AppHandle) {
    let settings = crate::state::store().settings();
    if !settings.buddy_speaks && !settings.heads_up_phone {
        return;
    }
    let idle = idle_for();
    welcome_back(app, idle);
    if settings.buddy_breaks {
        break_nudge(app, idle);
    }
    battery(app, settings.buddy_acts);
    later_list(app);
    revision(app);
    meeting(app);
    disk_and_memory(app);
    internet(app);
}

/// Back at the PC after a while away: what was missed, in one breath.
fn welcome_back(app: &AppHandle, idle: Duration) {
    let back = with(|s| {
        if idle >= AWAY_AFTER {
            s.away_since.get_or_insert_with(|| Instant::now().checked_sub(idle).unwrap_or_else(Instant::now));
            return None;
        }
        let since = s.away_since.take()?;
        if since.elapsed() < WELCOME_AFTER || s.missed.is_empty() {
            return None;
        }
        Some(std::mem::take(&mut s.missed))
    });
    let Some(missed) = back else { return };
    let shown: Vec<String> = missed.iter().take(3).map(|m| m.trim_end_matches('.').to_string()).collect();
    let more = missed.len().saturating_sub(3);
    let mut text = format!("Welcome back! While you were away: {}.", shown.join("; "));
    if more > 0 {
        text.push_str(&format!(" And {more} more — ask me if you want them."));
    }
    if let Some(later) = crate::later::nudge_line() {
        text.push(' ');
        text.push_str(&later);
    }
    // Straight out — the user has just come back, this is the moment.
    with(|s| s.last_spoke = Some(Instant::now()));
    let _ = app.emit(EVENT, Say { text, urgent: false });
}

/// The Later list, at the moments it's useful: late afternoon (before the
/// shops close) and the first time you're at the PC in the morning.
/// Cards gone cold: mentioned once a day, in the evening.
///
/// Spaced repetition only works if something brings you back to it, and
/// remembering to ask "what should I revise?" is exactly the thing a person
/// with an exam coming doesn't do. So Izuki says it — once, quietly, and
/// only when there's a real pile, never while you're busy with something.
fn revision(app: &AppHandle) {
    let now = chrono::Local::now();
    // Early evening, when there's still time to do something about it.
    if !(17..=21).contains(&now.hour()) {
        return;
    }
    let due = crate::studytrack::due_now(&crate::studytrack::events(), crate::model::now_ms());
    // A couple of cards isn't worth interrupting anyone for.
    if due.len() < 5 {
        return;
    }
    let overdue = due.iter().filter(|d| d.overdue > 0).count();
    let subject = due
        .iter()
        .map(|d| d.topic.trim())
        .find(|t| !t.is_empty())
        .unwrap_or("your notes")
        .to_string();
    let line = format!(
        "{} flashcards are ready to review{} \u{2014} mostly {subject}. Want to run through them? Say \u{201c}practise my cards\u{201d}.",
        due.len(),
        if overdue > 0 { format!(", {overdue} of them overdue") } else { String::new() }
    );
    say(app, &format!("revise-{}", now.format("%Y%m%d")), &line, Level::Chat);
}

/// A call or an online class just started: offer to write it down.
///
/// Nobody remembers to start a recorder in the ten seconds before a lecture
/// begins, which is exactly when it matters. Izuki sees the meeting window
/// come to the front and asks once — one answer and the whole thing is
/// written down and turned into notes, with the user doing nothing.
fn meeting(app: &AppHandle) {
    // Already writing one down: nothing to offer.
    if crate::roomrec::is_recording() {
        return;
    }
    let title = crate::uia::foreground_title();
    let app_name = crate::uia::foreground_app();
    let hay = format!("{} {}", title.to_lowercase(), app_name.to_lowercase());
    // The window has to look like a call that is actually happening, not the
    // Zoom home screen or a tab someone left open.
    const CALLING: [&str; 7] = ["zoom meeting", "microsoft teams", "google meet", "meet.google", "webex", "zoom workplace", "teams meeting"];
    if !CALLING.iter().any(|w| hay.contains(w)) {
        return;
    }
    // A meeting window that is merely open shouldn't nag: offered once, and
    // not again for this title until it's been gone a while.
    let name = if title.trim().is_empty() { "this call".to_string() } else { title.chars().take(60).collect() };
    offer(
        app,
        &format!("meeting-{}", name.to_lowercase().replace(' ', "-")),
        &format!("Looks like you're in {name}. Want me to write it down and turn it into notes? You won't have to follow it."),
        Level::Chat,
        &format!("write down this call: {name}"),
    );
}

fn later_list(app: &AppHandle) {
    let now = chrono::Local::now();
    let slot = match now.hour() {
        8..=10 => "morning",
        17 => "evening",
        _ => return,
    };
    if let Some(line) = crate::later::nudge_line() {
        say(app, &format!("later-{slot}-{}", now.format("%Y%m%d")), &line, Level::Chat);
    }
}

/// A focus session ended (`minutes` 0 = stopped early): say so, and what
/// came in meanwhile.
pub fn focus_over(app: &AppHandle, minutes: u64) {
    let missed = with(|s| {
        s.last_spoke = Some(Instant::now());
        // Back at the desk, focused — no "welcome back" on top of this.
        s.away_since = None;
        s.streak_since = Some(Instant::now());
        std::mem::take(&mut s.missed)
    });
    let mut text = if minutes > 0 {
        format!("Time's up — {minutes} minutes of focus done. Nice work!")
    } else {
        "Focus mode's off.".to_string()
    };
    if missed.is_empty() {
        if minutes > 0 {
            text.push_str(" Nothing came in meanwhile. Take a quick stretch?");
        }
    } else {
        let shown: Vec<String> = missed.iter().take(3).map(|m| m.trim_end_matches('.').to_string()).collect();
        text.push_str(&format!(" While you were focused: {}.", shown.join("; ")));
        if missed.len() > 3 {
            text.push_str(&format!(" And {} more.", missed.len() - 3));
        }
    }
    let _ = app.emit(EVENT, Say { text, urgent: false });
}

fn break_nudge(app: &AppHandle, idle: Duration) {
    let due = with(|s| {
        if idle >= AWAY_AFTER {
            s.streak_since = None;
            s.break_told = false;
            return false;
        }
        let since = *s.streak_since.get_or_insert_with(Instant::now);
        if since.elapsed() >= BREAK_AFTER && !s.break_told {
            s.break_told = true;
            return true;
        }
        false
    });
    if due && !crate::island::fullscreen_now() {
        let lines = [
            "You've been at it for over two hours — stand up and stretch for a minute? I'll keep an eye on things.",
            "Two and a half hours straight! Grab some water — your eyes will thank you.",
            "Quick break? You've been going a long while. I'll be right here.",
        ];
        let pick = lines[(rand::random::<u32>() as usize) % lines.len()];
        say(app, &format!("break-{}", chrono::Local::now().format("%Y%m%d%H")), pick, Level::Chat);
    }
}

fn battery(app: &AppHandle, may_act: bool) {
    let Some((pct, plugged)) = crate::briefing::battery_raw() else { return };
    if plugged {
        let restore = with(|s| {
            s.battery_told = 0;
            std::mem::take(&mut s.saver_on)
        });
        if restore {
            let _ = crate::files::run_ok("powercfg /setdcvalueindex SCHEME_CURRENT SUB_ENERGYSAVER ESBATTTHRESHOLD 20; powercfg /setactive SCHEME_CURRENT");
        }
        return;
    }
    let stage = if pct <= 10 { 3 } else if pct <= 15 { 2 } else if pct <= 20 { 1 } else { 0 };
    let new = with(|s| {
        if stage > s.battery_told {
            s.battery_told = stage;
            true
        } else {
            false
        }
    });
    if !new {
        return;
    }
    match stage {
        1 => {
            say(app, "battery-20", &format!("Heads up — the battery's at {pct}%. Might be time to find the charger."), Level::Important);
        }
        2 => {
            // Only say it's on if Windows really did it.
            let saver = may_act && crate::files::run_ok("powercfg /setdcvalueindex SCHEME_CURRENT SUB_ENERGYSAVER ESBATTTHRESHOLD 100; powercfg /setactive SCHEME_CURRENT");
            if saver {
                with(|s| s.saver_on = true);
            }
            let text = if saver {
                format!("Battery's down to {pct}%, so I've switched on battery saver to stretch it. It goes back to normal when you plug in.")
            } else {
                format!("Battery's down to {pct}% — please plug in soon.")
            };
            say(app, "battery-15", &text, Level::Important);
        }
        _ => {
            say(app, "battery-10", &format!("Battery's at {pct}% — plug in now or save your work, it'll shut down soon."), Level::Urgent);
        }
    }
}

fn disk_and_memory(app: &AppHandle) {
    let (memory, disk_gb) = crate::briefing::health_raw();
    if let Some(gb) = disk_gb {
        if gb < 5 {
            offer(
                app,
                "disk-low",
                &format!(
                    "Your C drive is nearly full — {} left. Want me to find what's taking the space? Just say yes (or “clear the safe stuff” for old temporary files).",
                    if gb == 0 { "less than 1 GB".to_string() } else { format!("about {gb} GB") }
                ),
                Level::Important,
                "what's taking up space on my drive",
            );
        }
    }
    let high = with(|s| {
        if memory.is_some_and(|m| m >= 92) {
            s.memory_high = s.memory_high.saturating_add(1);
        } else {
            s.memory_high = 0;
        }
        s.memory_high == 3
    });
    if high {
        let top = crate::files::run("Get-Process | Sort-Object WS -Descending | Select-Object -First 1 -ExpandProperty ProcessName")
            .ok()
            .map(|t| t.trim().lines().last().unwrap_or("").trim().to_string())
            .filter(|t| !t.is_empty() && !t.contains(' '));
        // The offer is the safe clean-up (background helpers only, never a
        // window with your work in it); the heaviest app is just named.
        let text = match top {
            Some(name) => format!("Your PC's memory is almost full, which is why things may feel slow — {name} is using the most. Want me to free some up? I'll close background helpers, never your windows. Just say yes."),
            None => "Your PC's memory is almost full, which is why things may feel slow. Want me to free some up? I'll close background helpers, never your windows. Just say yes.".into(),
        };
        offer(app, "memory-high", &text, Level::Chat, "speed up my pc");
    }
}

fn internet(app: &AppHandle) {
    let up = ["1.1.1.1:443", "8.8.8.8:53"].iter().any(|a| {
        a.parse::<std::net::SocketAddr>().is_ok_and(|addr| std::net::TcpStream::connect_timeout(&addr, Duration::from_secs(2)).is_ok())
    });
    let (dropped, back) = with(|s| {
        if up {
            let back = s.net_told;
            s.net_down = 0;
            s.net_told = false;
            (false, back)
        } else {
            s.net_down = s.net_down.saturating_add(1);
            let tell = s.net_down == 2;
            if tell {
                s.net_told = true;
            }
            (tell, false)
        }
    });
    let stamp = chrono::Local::now().format("%Y%m%d%H%M").to_string();
    if dropped {
        say(app, &format!("net-down-{stamp}"), "Your internet just dropped. I'll tell you the moment it's back.", Level::Important);
    }
    if back {
        say(app, &format!("net-up-{stamp}"), "Internet's back.", Level::Chat);
    }
}

// ---- new email, from the heads-up checks ---------------------------------------------

/// New emails ("Sarah Lee: Interview on Friday") — the ones that matter are
/// said out loud. The AI judges what matters (a job, money, a deadline,
/// family); without one, a word list does.
pub fn new_mail(app: &AppHandle, lines: &[String]) {
    if lines.is_empty() {
        return;
    }
    let lines = lines.to_vec();
    let app = app.clone();
    std::thread::spawn(move || {
        let (picked, said) = judge(&lines);
        if picked.is_empty() {
            return;
        }
        let text = said.unwrap_or_else(|| {
            let first = &lines[picked[0]];
            if picked.len() == 1 {
                format!("You've got an email that looks important — {first}.")
            } else {
                format!("{} emails that look important just came in — the first: {first}.", picked.len())
            }
        });
        let key = format!("mail-{}", picked.iter().map(|i| lines[*i].clone()).collect::<Vec<_>>().join("|"));
        say(&app, &key, &text, Level::Important);
    });
}

const IMPORTANT_WORDS: &[&str] = &[
    "interview", "job", "offer", "hiring", "position", "application", "recruit", "onboarding", "contract",
    "invoice", "payment", "paid", "overdue", "bank", "refund", "salary", "deadline", "due", "urgent", "asap",
    "important", "action required", "security alert", "suspicious", "sign-in", "exam", "grade", "result",
    "admission", "scholarship", "visa", "appointment", "doctor", "hospital", "flight", "delivery", "court",
];

/// Which lines matter, and (from the AI) a friendly sentence to say.
/// Plainly an advert, a newsletter or a social notification.
fn plainly_junk(line: &str) -> bool {
    let l = line.to_lowercase();
    ["newsletter", "unsubscribe", "% off", " sale", "promo", "deal of", "no-reply", "noreply", "digest", "notification", "new follower", "liked your", "commented on"]
        .iter()
        .any(|w| l.contains(w))
}

/// Is this batch worth an AI call?
///
/// Only when something might matter. A note from a friend has none of the
/// "important" words either, so "no keyword" alone must never be enough to
/// drop it — every line has to look like junk before the AI is skipped.
fn worth_asking(lines: &[String], by_words: &[usize]) -> bool {
    !by_words.is_empty() || !lines.iter().all(|l| plainly_junk(l))
}

fn judge(lines: &[String]) -> (Vec<usize>, Option<String>) {
    let by_words: Vec<usize> = lines
        .iter()
        .enumerate()
        .filter(|(_, l)| {
            let l = l.to_lowercase();
            IMPORTANT_WORDS.iter().any(|w| l.contains(w)) && !["newsletter", "unsubscribe", "% off", "sale", "promo", "deal"].iter().any(|w| l.contains(w))
        })
        .map(|(i, _)| i)
        .collect();
    // Nothing here even looks like it matters: don't spend an AI call on it.
    //
    // This runs in the background every few minutes. On a free tier that
    // allows roughly one request a minute, every judgement here is one the
    // user doesn't get for a question they actually asked — and the usual
    // answer is "none of these matter", which the words already told us.
    if !worth_asking(lines, &by_words) {
        return (Vec::new(), None);
    }
    let list: String = lines.iter().enumerate().map(|(i, l)| format!("{}) {l}\n", i + 1)).collect();
    let ask = serde_json::json!([
        { "role": "system", "content": "You are Izuki, the user's warm, sharp companion. You decide which new emails are worth interrupting them for RIGHT NOW: jobs and interviews, money and bills, deadlines, school results, family or friends who need them, security alerts, anything time-sensitive. Not newsletters, promotions, social media or receipts. Reply with ONLY JSON: {\"tell\":[numbers],\"say\":\"one or two short spoken sentences, friendly, naming who it's from and what it's about\"} — or {\"tell\":[]} if none matter." },
        { "role": "user", "content": format!("New emails:\n{list}") }
    ]);
    let ai = ask.as_array().and_then(|m| crate::chat::complete(m).ok());
    if let Some(reply) = ai {
        let json = reply.find('{').and_then(|a| reply.rfind('}').map(|b| &reply[a..=b])).and_then(|j| serde_json::from_str::<serde_json::Value>(j).ok());
        if let Some(v) = json {
            let picked: Vec<usize> = v["tell"]
                .as_array()
                .map(|a| a.iter().filter_map(|n| n.as_u64()).map(|n| n as usize).filter(|n| *n >= 1 && *n <= lines.len()).map(|n| n - 1).collect())
                .unwrap_or_default();
            let said = v["say"].as_str().map(|s| s.trim().to_string()).filter(|s| !s.is_empty() && s.len() < 400);
            return (picked, said);
        }
    }
    (by_words, None)
}

// ---- how long since the keyboard or mouse was touched -------------------------------

/// Seconds since the keyboard or mouse was last touched.
pub fn idle_secs() -> u64 {
    idle_for().as_secs()
}

/// How long since the keyboard or mouse was last touched (by anyone).
pub fn idle_duration() -> Duration {
    idle_for()
}

#[cfg(windows)]
fn idle_for() -> Duration {
    use windows::Win32::System::SystemInformation::GetTickCount;
    use windows::Win32::UI::Input::KeyboardAndMouse::{GetLastInputInfo, LASTINPUTINFO};
    let mut info = LASTINPUTINFO { cbSize: std::mem::size_of::<LASTINPUTINFO>() as u32, dwTime: 0 };
    unsafe {
        if !GetLastInputInfo(&mut info).as_bool() {
            return Duration::ZERO;
        }
        Duration::from_millis(GetTickCount().wrapping_sub(info.dwTime) as u64)
    }
}

#[cfg(not(windows))]
fn idle_for() -> Duration {
    Duration::ZERO
}

#[cfg(test)]
mod tests {
    #[test]
    fn plain_junk_never_costs_an_ai_call() {
        // Nothing important-looking: judged by the words alone, no AI.
        let junk = vec![
            "Weekly newsletter from SomeShop".to_string(),
            "50% off everything this weekend".to_string(),
            "You have a new follower".to_string(),
        ];
        assert!(!worth_asking(&junk, &[]), "junk mail would have asked an AI what to think");
        // A plain note from a person has none of the "important" words
        // either, and must never be dropped to save a request.
        assert!(worth_asking(&["Mum — are you free on Sunday?".to_string()], &[]), "a personal email was dropped without being read");
        assert!(worth_asking(&["Re: the flat".to_string()], &[]));
        // One real email among the adverts still gets read.
        let mixed = vec!["Weekly newsletter".to_string(), "Mum — call me".to_string()];
        assert!(worth_asking(&mixed, &[]));
        // Something the words already flagged is always worth asking about.
        assert!(worth_asking(&junk, &[0]));
    }

    use super::*;

    #[test]
    fn spots_important_mail_without_an_ai() {
        let lines = vec![
            "Acme Careers: Interview invitation for Friday".to_string(),
            "Shop: 50% off everything — sale ends today".to_string(),
            "Mum: Call me when you can".to_string(),
        ];
        let picked: Vec<usize> = lines
            .iter()
            .enumerate()
            .filter(|(_, l)| {
                let l = l.to_lowercase();
                IMPORTANT_WORDS.iter().any(|w| l.contains(w)) && !["newsletter", "unsubscribe", "% off", "sale", "promo", "deal"].iter().any(|w| l.contains(w))
            })
            .map(|(i, _)| i)
            .collect();
        assert_eq!(picked, vec![0]);
    }

    #[test]
    fn levels_are_ordered() {
        assert!(Level::Urgent > Level::Important && Level::Important > Level::Chat);
    }
}
