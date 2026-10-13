//! Missions (Rest mode): a list of things for Izuki to do while you're
//! away — "check my assignments and list what's due", "summarise my unread
//! emails", "find a cheap flight to Lagos next month" — done one after the
//! other, each through the same front door as everything else (companion.rs:
//! the screen, your apps, chat), so every safety rule still holds: nothing
//! is sent, posted or bought without your yes. A mission that needs you
//! (a draft to approve, a question) waits as "needs you" and the rest go on.
//! When they're all done you get one report, on the PC and your phone.
//!
//! Saved in %APPDATA%\Izuki\missions.json. Esc / Stop stops them.

use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};

use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Mission {
    pub id: String,
    pub text: String,
    /// "waiting", "running", "done", "needs_you", "stopped".
    pub state: String,
    /// What Izuki said when it finished (or why it stopped).
    #[serde(default)]
    pub result: String,
    /// Unix ms, when it was added / last changed.
    pub at: i64,
}

pub const CHANGED: &str = "izuki://missions-changed";
static LOCK: Mutex<()> = Mutex::new(());
static RUNNING: AtomicBool = AtomicBool::new(false);
/// Bumped by Esc / Stop: the run ends before the next mission.
static STOPS: AtomicU64 = AtomicU64::new(0);

fn file() -> std::path::PathBuf {
    crate::store::data_dir().join("missions.json")
}

fn read() -> Vec<Mission> {
    std::fs::read_to_string(file()).ok().and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default()
}

/// Saved whole or not at all: written to a side file first, then swapped
/// in — a crash mid-save can't wipe the list.
fn write(all: &[Mission]) {
    let path = file();
    let tmp = path.with_extension("json.tmp");
    let saved = serde_json::to_string_pretty(all)
        .map_err(std::io::Error::other)
        .and_then(|s| std::fs::write(&tmp, s))
        .and_then(|_| std::fs::rename(&tmp, &path));
    if let Err(e) = saved {
        eprintln!("[missions] couldn't save the list: {e}");
        let _ = std::fs::remove_file(&tmp);
    }
}

fn now() -> i64 {
    chrono::Utc::now().timestamp_millis()
}

pub fn list() -> Vec<Mission> {
    let _g = LOCK.lock();
    read()
}

pub fn add(text: &str) -> Vec<Mission> {
    let text = text.trim();
    let _g = LOCK.lock();
    let mut all = read();
    if !text.is_empty() {
        all.push(Mission { id: uuid::Uuid::new_v4().to_string(), text: text.chars().take(400).collect(), state: "waiting".into(), result: String::new(), at: now() });
        write(&all);
    }
    all
}

pub fn remove(id: &str) -> Vec<Mission> {
    let _g = LOCK.lock();
    let mut all = read();
    all.retain(|m| m.id != id || m.state == "running");
    write(&all);
    all
}

/// Clear the finished ones (done, stopped); keep what's waiting or needs you.
pub fn clear_done() -> Vec<Mission> {
    let _g = LOCK.lock();
    let mut all = read();
    all.retain(|m| m.state == "waiting" || m.state == "running" || m.state == "needs_you");
    write(&all);
    all
}

fn set(id: &str, state: &str, result: &str) {
    let _g = LOCK.lock();
    let mut all = read();
    if let Some(m) = all.iter_mut().find(|m| m.id == id) {
        m.state = state.into();
        if !result.is_empty() {
            m.result = result.chars().take(1200).collect();
        }
        m.at = now();
    }
    write(&all);
}

/// Esc / Stop: the missions stop (the one running is cancelled with the task).
pub fn stop() {
    STOPS.fetch_add(1, Ordering::SeqCst);
}

pub fn running() -> bool {
    RUNNING.load(Ordering::SeqCst)
}

/// A reply that's waiting on the user: a draft to approve, or a question.
fn needs_you(reply: &str) -> bool {
    let r = reply.trim().to_lowercase();
    r.ends_with('?') || r.contains("want me to go ahead") || r.contains("say “yes") || r.contains("sign in with the link")
}

/// Do every waiting mission, one after the other, then report. Returns at
/// once; the work happens on its own thread.
pub fn run_all(app: &AppHandle) -> bool {
    if RUNNING.swap(true, Ordering::SeqCst) {
        return false;
    }
    let app = app.clone();
    // Counted before the work starts, so a Stop right away still counts.
    let started = STOPS.load(Ordering::SeqCst);
    std::thread::spawn(move || {
        // "Running" always ends with the thread, however it ends.
        struct Running;
        impl Drop for Running {
            fn drop(&mut self) {
                RUNNING.store(false, Ordering::SeqCst);
            }
        }
        let _running = Running;
        let mut report: Vec<String> = Vec::new();
        eprintln!("[missions] starting");
        loop {
            if STOPS.load(Ordering::SeqCst) != started {
                break;
            }
            let next = { let _g = LOCK.lock(); read().into_iter().find(|m| m.state == "waiting") };
            let Some(m) = next else { break };
            set(&m.id, "running", "");
            let _ = app.emit(CHANGED, ());
            eprintln!("[missions] doing: {}", m.text.chars().take(80).collect::<String>());
            let reply = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| crate::companion::respond(&app, &m.text, false, &|_| {}).text))
                .unwrap_or_else(|_| "Something went wrong with this one.".into());
            let state = if STOPS.load(Ordering::SeqCst) != started {
                "stopped"
            } else if needs_you(&reply) {
                "needs_you"
            } else {
                "done"
            };
            set(&m.id, state, if state == "stopped" { "Stopped." } else { &reply });
            let _ = app.emit(CHANGED, ());
            report.push(format!(
                "{} {}",
                match state { "done" => "✅", "needs_you" => "✋", _ => "⏹" },
                m.text.chars().take(60).collect::<String>()
            ));
        }
        RUNNING.store(false, Ordering::SeqCst);
        let _ = app.emit(CHANGED, ());
        eprintln!("[missions] finished ({} looked at)", report.len());
        if !report.is_empty() {
            let waiting = report.iter().filter(|l| l.starts_with('✋')).count();
            let title = if waiting > 0 { format!("Missions finished — {waiting} need you") } else { "Missions finished".to_string() };
            crate::headsup::deliver(&app, &title, &report.join("\n"));
        }
    });
    true
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn knows_when_a_mission_needs_you() {
        assert!(needs_you("Here's what I'd do in Gmail… Want me to go ahead? Say “yes, send it”."));
        assert!(needs_you("Which account should I use?"));
        assert!(!needs_you("Done — you have 3 assignments due this week: …"));
    }
}
