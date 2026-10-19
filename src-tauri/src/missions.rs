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
use crate::model::TaskOutcome;
use crate::execution::{TaskContract, Checkpoint, Usage, Scope};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Mission {
    pub id: String,
    pub text: String,
    /// Queue state; "done" requires a structured Verified executor outcome.
    pub state: String,
    /// What Izuki said when it finished (or why it stopped).
    #[serde(default)]
    pub result: String,
    /// Unix ms, when it was added / last changed.
    pub at: i64,
    #[serde(default)]
    pub outcome: TaskOutcome,
    #[serde(default)]
    pub contract: Option<TaskContract>,
    #[serde(default)]
    pub checkpoint: Option<Checkpoint>,
    #[serde(default)]
    pub attempts: u32,
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
fn write(all: &[Mission]) -> bool {
    let path = file();
    let tmp = path.with_extension("json.tmp");
    let saved = serde_json::to_string_pretty(all)
        .map_err(std::io::Error::other)
        .and_then(|s| std::fs::write(&tmp, s))
        .and_then(|_| std::fs::rename(&tmp, &path));
    if let Err(e) = saved {
        eprintln!("[missions] couldn't save the list: {e}");
        let _ = std::fs::remove_file(&tmp);
        return false;
    }
    true
}

fn now() -> i64 {
    chrono::Utc::now().timestamp_millis()
}

fn journal_root() -> std::path::PathBuf { crate::store::data_dir().join("mission-journals") }

fn load_evidence(m: &mut Mission, root: &std::path::Path) {
    let Some(checkpoint) = m.checkpoint.as_mut().filter(|c| c.journal_version == Some(1)) else { return };
    match crate::mission_journal::read(root, &m.id) {
        Ok(report) => { checkpoint.evidence = report.evidence; checkpoint.journal_incomplete = report.incomplete; }
        Err(_) => checkpoint.journal_incomplete = true,
    }
    if m.state != "running" {
        for e in &mut checkpoint.evidence {
            if e.outcome == crate::mission_journal::EvidenceOutcome::InFlight { e.outcome = crate::mission_journal::EvidenceOutcome::Unknown; }
        }
    }
}

pub fn list() -> Vec<Mission> {
    let _g = LOCK.lock();
    let mut all = read();
    if !running() && recover_interrupted(&mut all) {
        write(&all);
    }
    for m in &mut all { load_evidence(m, &journal_root()); }
    all
}

pub fn add(text: &str) -> Vec<Mission> {
    let text = text.trim();
    let _g = LOCK.lock();
    let mut all = read();
    // Never silently shorten the user's objective into a different mission.
    if !text.is_empty() && text.chars().count() <= 400 {
        all.push(Mission { id: uuid::Uuid::new_v4().to_string(), text: text.into(), state: "waiting".into(), result: String::new(), at: now(), outcome: TaskOutcome::Unverified,
            contract: Some(TaskContract::new(text)), checkpoint: None, attempts: 0 });
        if !write(&all) { all.pop(); }
    }
    all
}

pub fn remove(id: &str) -> Vec<Mission> {
    let _g = LOCK.lock();
    let mut all = read();
    let original = all.clone();
    all.retain(|m| m.id != id || m.state == "running");
    if !write(&all) { return original; }
    if all.len() < original.len() {
        if crate::mission_journal::remove(&journal_root(), id).is_err() { eprintln!("[missions] could not remove a mission's evidence journal"); }
    }
    all
}

/// Clear the finished ones (done, stopped); keep what's waiting or needs you.
pub fn clear_done() -> Vec<Mission> {
    let _g = LOCK.lock();
    let mut all = read();
    let original = all.clone();
    all.retain(|m| m.state != "done" && m.state != "stopped");
    if !write(&all) { return original; }
    for m in original.iter().filter(|m| m.state == "done" || m.state == "stopped") {
        if crate::mission_journal::remove(&journal_root(), &m.id).is_err() { eprintln!("[missions] could not remove a finished mission's evidence journal"); }
    }
    all
}

fn set(id: &str, state: &str, result: &str, outcome: TaskOutcome, usage: Option<Usage>) -> bool {
    let _g = LOCK.lock();
    let mut all = read();
    // A user may remove the queued mission between selection and this lock.
    // A missing record must not authorize its actions.
    let Some(m) = all.iter_mut().find(|m| m.id == id) else { return false };
    m.state = state.into();
    m.outcome = outcome;
    if !result.is_empty() {
        m.result = result.chars().take(1200).collect();
    }
    m.at = now();
    if let Some(checkpoint) = m.checkpoint.as_mut() {
        checkpoint.phase = "returned".into();
        checkpoint.updated_at = m.at;
        if let Some(usage) = usage { checkpoint.usage = usage; }
    }
    load_evidence(m, &journal_root());
    write(&all)
}

fn prepare(m: &mut Mission, at: i64) -> Result<(), &'static str> {
    if m.state != "waiting" { return Err("This mission is no longer waiting."); }
    let contract = m.contract.get_or_insert_with(|| TaskContract::new(&m.text));
    contract.validate(&m.text)?;
    if m.attempts > 0 { return Err("This mission was already attempted. Inspect its result before creating a new mission."); }
    m.attempts += 1;
    m.state = "running".into();
    m.outcome = TaskOutcome::Unverified;
    m.at = at;
    m.checkpoint = Some(Checkpoint { started_at: at, updated_at: at, phase: "running".into(), usage: Usage::default(), journal_version: Some(1), evidence: Vec::new(), journal_incomplete: false });
    Ok(())
}

/// Claim the exact queued record and durably save its contract before any
/// executor runs. Removed, changed, or previously attempted records cannot run.
fn claim(id: &str) -> Result<Option<Mission>, &'static str> {
    let _g = LOCK.lock();
    let mut all = read();
    let Some(m) = all.iter_mut().find(|m| m.id == id && m.state == "waiting") else { return Ok(None) };
    if let Err(reason) = prepare(m, now()) {
        m.state = "blocked".into(); m.result = reason.into(); m.outcome = TaskOutcome::Blocked; m.at = now();
        return if write(&all) { Ok(None) } else { Err("I couldn't save the blocked mission's state.") };
    }
    let claimed = m.clone();
    if !write(&all) { return Err("I couldn't save the mission checkpoint, so I didn't start its actions."); }
    Ok(Some(claimed))
}

/// An interrupted mission may already have sent or changed something. Keep
/// its last result, and require inspection rather than automatically replaying.
fn recover_interrupted(all: &mut [Mission]) -> bool {
    let mut changed = false;
    for m in all.iter_mut().filter(|m| m.state == "running" || (m.state == "done" && m.outcome != TaskOutcome::Verified)) {
        let interrupted = m.state == "running";
        m.state = if interrupted { "needs_you" } else { "unverified" }.into();
        m.outcome = TaskOutcome::Unverified;
        let reason = if interrupted { "Interrupted before a verified result was saved. Check the current result before starting again." }
            else { "This older mission was marked done without a saved verification verdict. Its result needs checking." };
        m.result = format!("{reason}{}", if m.result.is_empty() { String::new() } else { format!(" Previous result: {}", m.result) });
        m.at = now();
        if let Some(checkpoint) = m.checkpoint.as_mut() {
            checkpoint.phase = "interrupted".into();
            checkpoint.updated_at = m.at;
        }
        changed = true;
    }
    changed
}

fn result_state(reply: &crate::companion::Reply, stopped: bool) -> &'static str {
    if stopped { return "stopped"; }
    match reply.outcome {
        TaskOutcome::Verified => "done",
        TaskOutcome::NeedsUser => "needs_you",
        TaskOutcome::Blocked => "blocked",
        TaskOutcome::Failed => "failed",
        TaskOutcome::Cancelled => "stopped",
        TaskOutcome::Partial => "partial",
        TaskOutcome::Unverified if !reply.links.is_empty() || needs_you(&reply.text) => "needs_you",
        TaskOutcome::Unverified => "unverified",
    }
}

/// "Try again": a fresh copy of a finished mission, in its place (the old
/// one's record goes with it — you've seen how it ended). Never one that's
/// running or still waiting.
pub fn retry(id: &str) -> Vec<Mission> {
    let _g = LOCK.lock();
    let mut all = read();
    let original = all.clone();
    let Some(i) = all.iter().position(|m| m.id == id && m.state != "running" && m.state != "waiting") else { return original };
    let text = all[i].text.clone();
    all[i] = Mission { id: uuid::Uuid::new_v4().to_string(), text: text.clone(), state: "waiting".into(), result: String::new(), at: now(), outcome: TaskOutcome::Unverified,
        contract: Some(TaskContract::new(&text)), checkpoint: None, attempts: 0 };
    if !write(&all) { return original; }
    if crate::mission_journal::remove(&journal_root(), id).is_err() { eprintln!("[missions] could not remove a retried mission's evidence journal"); }
    for m in &mut all { load_evidence(m, &journal_root()); }
    all
}

/// A mission's result kept in Izuki Notes, with what was asked.
pub fn save_to_notes(id: &str) -> Result<String, String> {
    let m = { let _g = LOCK.lock(); read().into_iter().find(|m| m.id == id) }.ok_or("That mission isn't on the list any more.")?;
    if m.result.trim().is_empty() {
        return Err("This mission has no result to save yet.".into());
    }
    let title: String = m.text.chars().take(70).collect();
    crate::notes::keep(&title, "Missions", &format!("Mission: {}

{}", m.text, m.result)).map_err(|e| e.to_string())?;
    Ok("Saved to Izuki Notes ✓".into())
}

/// The mission's words, for making it a routine.
pub fn text_of(id: &str) -> Option<String> {
    let _g = LOCK.lock();
    read().into_iter().find(|m| m.id == id).map(|m| m.text)
}

/// How long you've been away before "start them when I'm away" starts them.
const AWAY_FOR_SECS: u64 = 10 * 60;

/// Rest mode by itself: with "start when I'm away" on, waiting missions
/// start once nobody has touched the PC for ten minutes. Once per time away.
pub fn spawn_away_watch(app: AppHandle) {
    std::thread::Builder::new()
        .name("izuki-missions-away".into())
        .spawn(move || {
            let mut started_this_time = false;
            loop {
                std::thread::sleep(std::time::Duration::from_secs(60));
                let idle = crate::buddy::idle_secs();
                if idle < AWAY_FOR_SECS {
                    started_this_time = false;
                    continue;
                }
                if started_this_time || running() || !crate::state::store().settings().missions_when_away {
                    continue;
                }
                // Never on the lock screen: they start once you're away but the PC is still unlocked.
                if crate::uia::screen_locked() {
                    continue;
                }
                let waiting = { let _g = LOCK.lock(); read().iter().any(|m| m.state == "waiting") };
                if waiting && run_all(&app) {
                    eprintln!("[missions] you've been away {} min — starting your missions", idle / 60);
                    started_this_time = true;
                }
            }
        })
        .ok();
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
        // You may be away: the PC doesn't fall asleep halfway through (the
        // screen still locks on its normal schedule).
        let _awake = crate::awake::KeepAwake::new("missions running");
        {
            let _g = LOCK.lock();
            let mut all = read();
            if recover_interrupted(&mut all) && !write(&all) {
                return;
            }
        }
        let mut report: Vec<String> = Vec::new();
        eprintln!("[missions] starting");
        loop {
            if STOPS.load(Ordering::SeqCst) != started {
                break;
            }
            let next = { let _g = LOCK.lock(); read().into_iter().find(|m| m.state == "waiting") };
            let Some(m) = next else { break };
            // Do not execute unless the running checkpoint is durable.
            let m = match claim(&m.id) {
                Ok(Some(m)) => m,
                Ok(None) => { let _ = app.emit(CHANGED, ()); continue; }
                Err(reason) => { if crate::state::store().settings().heads_up_missions { crate::headsup::deliver(&app, "Missions paused", reason); } break; }
            };
            if STOPS.load(Ordering::SeqCst) != started {
                set(&m.id, "stopped", "Stopped before execution.", TaskOutcome::Cancelled, None);
                break;
            }
            let journal = match crate::mission_journal::Journal::create(&journal_root(), &m.id) {
                Ok(journal) => std::sync::Arc::new(journal),
                Err(_) => { set(&m.id, "blocked", "I couldn't create the execution journal, so this mission's executor was not started. Check the saved state before retrying.", TaskOutcome::Blocked, None); break; }
            };
            let scope = match Scope::enter_recorded(m.contract.as_ref().expect("claim saves a validated contract"), move || STOPS.load(Ordering::SeqCst) != started, journal) {
                Ok(scope) => scope,
                Err(reason) => { set(&m.id, "blocked", reason, TaskOutcome::Blocked, None); break; }
            };
            let _ = app.emit(CHANGED, ());
            eprintln!("[missions] doing: {}", m.text.chars().take(80).collect::<String>());
            let mut reply = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| crate::companion::respond(&app, &m.text, false, &|_| {})))
                .unwrap_or_else(|_| crate::companion::Reply { text: "The executor failed. Some actions may already have happened; inspect the current result before retrying.".into(), outcome: TaskOutcome::Failed, ..Default::default() });
            let usage = scope.finish(&mut reply);
            drop(scope);
            let stopped = STOPS.load(Ordering::SeqCst) != started;
            let state = result_state(&reply, stopped);
            let outcome = if stopped { TaskOutcome::Cancelled } else { reply.outcome };
            if !set(&m.id, state, if state == "stopped" { "Stopped. Some actions may already have completed; inspect the current result before retrying." } else { &reply.text }, outcome, Some(usage)) {
                crate::headsup::deliver(&app, "Mission result needs checking", "The actions returned, but I couldn't save their result. Check what happened before retrying.");
                break;
            }
            let _ = app.emit(CHANGED, ());
            report.push(format!(
                "{} {}",
                match state { "done" => "✅", "needs_you" => "✋", "stopped" => "⏹", _ => "⚠️" },
                m.text.chars().take(60).collect::<String>()
            ));
        }
        drop(_running);
        let _ = app.emit(CHANGED, ());
        eprintln!("[missions] finished ({} looked at)", report.len());
        if !report.is_empty() && crate::state::store().settings().heads_up_missions {
            let waiting = report.iter().filter(|l| !l.starts_with('✅')).count();
            let title = if waiting > 0 { format!("Missions checked — {waiting} need review") } else { "Missions verified".to_string() };
            crate::headsup::deliver(&app, &title, &report.join("\n"));
        }
    });
    true
}

/// For the Island while missions run: (the one being done now, how many
/// more are waiting). `None` when no missions are running.
pub fn glance() -> Option<(String, usize)> {
    if !running() {
        return None;
    }
    let all = { let _g = LOCK.lock(); read() };
    let now = all.iter().find(|m| m.state == "running").map(|m| m.text.chars().take(60).collect()).unwrap_or_default();
    Some((now, all.iter().filter(|m| m.state == "waiting").count()))
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

    #[test]
    fn claiming_a_legacy_mission_persists_its_goal_and_refuses_replay() {
        let mut m: Mission = serde_json::from_str(r#"{"id":"one","text":"Find my assignment and save its instructions","state":"waiting","result":"","at":1}"#).unwrap();
        prepare(&mut m, 20).unwrap();
        assert_eq!(m.state, "running");
        assert_eq!(m.attempts, 1);
        assert_eq!(m.contract.as_ref().unwrap().objective, m.text);
        assert_eq!(m.checkpoint.as_ref().unwrap().started_at, 20);
        let saved = serde_json::to_string(&m).unwrap();
        let mut restored: Mission = serde_json::from_str(&saved).unwrap();
        recover_interrupted(std::slice::from_mut(&mut restored));
        assert_eq!(restored.checkpoint.as_ref().unwrap().phase, "interrupted");
        restored.state = "waiting".into();
        assert!(prepare(&mut restored, 30).is_err());
        assert_eq!(restored.attempts, 1);
        assert_eq!(restored.checkpoint.as_ref().unwrap().started_at, 20);
    }

    #[test]
    fn mismatched_contracts_cannot_start_an_easier_task() {
        let mut m: Mission = serde_json::from_str(r#"{"id":"one","text":"Fix my project and run tests","state":"waiting","result":"","at":1}"#).unwrap();
        m.contract = Some(TaskContract::new("Open VS Code"));
        assert!(prepare(&mut m, 20).is_err());
        assert_eq!(m.attempts, 0);
        assert!(m.checkpoint.is_none());
    }

    #[test]
    fn restart_preserves_step_evidence_and_marks_unfinished_dispatch_unknown() {
        use crate::mission_journal::{Journal, EvidenceKind, EvidenceOutcome};
        let id = uuid::Uuid::new_v4().to_string();
        let root = std::env::temp_dir().join(format!("izuki-evidence-restart-{id}"));
        let journal = std::sync::Arc::new(Journal::create(&root, &id).unwrap());
        let step = journal.begin(EvidenceKind::ConnectedTool, "GMAIL_SEND_EMAIL", Some("ca_fixture")).unwrap();
        let start_only = std::fs::read(crate::mission_journal::path(&root, &id).unwrap()).unwrap();
        drop(step); drop(journal);
        // Restore the exact on-disk state that a process crash would leave.
        std::fs::write(crate::mission_journal::path(&root, &id).unwrap(), start_only).unwrap();
        let mut m: Mission = serde_json::from_value(serde_json::json!({"id":id,"text":"Send the approved draft","state":"waiting","result":"","at":1})).unwrap();
        prepare(&mut m, 10).unwrap();
        recover_interrupted(std::slice::from_mut(&mut m));
        load_evidence(&mut m, &root);
        assert_eq!(m.state, "needs_you");
        assert_eq!(m.attempts, 1);
        assert_eq!(m.checkpoint.as_ref().unwrap().evidence[0].outcome, EvidenceOutcome::Unknown);
        assert_eq!(m.outcome, TaskOutcome::Unverified);
        assert!(prepare(&mut m, 20).is_err());
        std::fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn wording_never_verifies_a_mission() {
        for text in ["Done.", "All finished successfully!", "I couldn't reach your apps.", "Opening VS Code now…", ""] {
            let reply = crate::companion::Reply { text: text.into(), ..Default::default() };
            assert_eq!(result_state(&reply, false), "unverified", "{text}");
        }
        let reply = crate::companion::Reply { text: "Something failed?".into(), outcome: TaskOutcome::Failed, ..Default::default() };
        assert_eq!(result_state(&reply, false), "failed");
    }

    #[test]
    fn structured_outcomes_and_stop_take_priority() {
        for (outcome, state) in [
            (TaskOutcome::Verified, "done"), (TaskOutcome::Partial, "partial"),
            (TaskOutcome::NeedsUser, "needs_you"), (TaskOutcome::Blocked, "blocked"),
            (TaskOutcome::Failed, "failed"), (TaskOutcome::Cancelled, "stopped"),
        ] {
            let reply = crate::companion::Reply { text: "Result".into(), outcome, ..Default::default() };
            assert_eq!(result_state(&reply, false), state);
            assert_eq!(result_state(&reply, true), "stopped");
        }
        let reply = crate::companion::Reply { text: "Please connect Gmail.".into(), links: vec![("gmail".into(), "https://example.com/connect".into())], ..Default::default() };
        assert_eq!(result_state(&reply, false), "needs_you");
    }

    #[test]
    fn interrupted_records_are_preserved_and_never_automatically_replayed() {
        let mut all: Vec<Mission> = serde_json::from_str(r#"[
            {"id":"old","text":"send the draft","state":"running","result":"draft prepared","at":1},
            {"id":"new","text":"check inbox","state":"waiting","result":"","at":2},
            {"id":"legacy","text":"check assignments","state":"done","result":"Finished","at":3},
            {"id":"verified","text":"open folder","state":"done","result":"Folder observed","at":4,"outcome":"verified"}
        ]"#).unwrap();
        assert_eq!(all[0].outcome, TaskOutcome::Unverified);
        assert!(recover_interrupted(&mut all));
        assert_eq!(all[0].state, "needs_you");
        assert!(all[0].result.contains("draft prepared"));
        assert_eq!(all[1].state, "waiting");
        assert_eq!(all[2].state, "unverified");
        assert!(all[2].result.contains("Finished"));
        assert_eq!(all[3].state, "done");
        assert!(!recover_interrupted(&mut all));
        let saved = serde_json::to_string(&all).unwrap();
        assert_eq!(serde_json::from_str::<Vec<Mission>>(&saved).unwrap(), all);
    }
}
