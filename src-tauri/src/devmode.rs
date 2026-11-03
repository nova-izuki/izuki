//! The private Developer Control system (owner-only, `--features devvision`).
//!
//! One dev build of Izuki carries a small control panel with three
//! independent switches: Smart Vision objection→observation (the §5 watcher),
//! Claude Live Auto-Review (approved diagnostic analysis of what was
//! captured), and Smart Real Testing (a fixed, approved list of test
//! scenarios that run in the repo's own test environment). Everything is OFF
//! whenever the app starts; nothing here can merge, publish, deploy or
//! release anything, and the testing scenarios may never touch real user
//! data or production systems — the allowlist is fixed in this file and a
//! scenario outside it is refused. Public builds compile none of these guts,
//! and the `dev_*` commands politely refuse outside this repo's dev builds.
//!
//! There is deliberately no second application and no persistent companion
//! service: the dev build's own loopback server (observer.rs) and these
//! toggles meet every requirement with the least moving parts. Nothing is
//! keyed to one machine: the workspace root is discovered, the scenario list
//! is plain commands, and files live in the per-user data folder.

#[cfg(feature = "devvision")]
use tauri::Manager as _;

#[cfg(feature = "devvision")]
pub mod real {
use std::collections::VecDeque;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::time::{Duration, Instant};

use parking_lot::Mutex;
use serde_json::{json, Value};

/// History kept per toggle: the most notes and most test runs, oldest
/// dropped past these bounds.
const MAX_NOTES: usize = 12;
const MAX_RUNS: usize = 20;

#[derive(Clone, Debug)]
pub struct Toggle {
    pub on: bool,
    pub note: String,
    pub at: u64,
}

pub struct TestRun {
    pub id: String,
    pub at: u64,
    pub ok: Option<bool>,
    /// A human line: the verdict while running, or the first failing line.
    pub summary: String,
    /// The run's own output tail (bounded) for reading in the panel.
    pub tail: String,
}

static VISION: Mutex<Toggle> = Mutex::new(Toggle { on: false, note: String::new(), at: 0 });
static REVIEW: Mutex<Toggle> = Mutex::new(Toggle { on: false, note: String::new(), at: 0 });
static TESTING: Mutex<Toggle> = Mutex::new(Toggle { on: false, note: String::new(), at: 0 });

static TEST_CHILD: Mutex<Option<Child>> = Mutex::new(None);
static TEST_TAIL: Mutex<String> = Mutex::new(String::new());
static TEST_CHILD_BUSY: AtomicBool = AtomicBool::new(false);
static RUNS: Mutex<VecDeque<TestRun>> = Mutex::new(VecDeque::new());
static REVIEWED_UP_TO: AtomicU64 = AtomicU64::new(0);
static DIGEST: Mutex<Option<String>> = Mutex::new(None);
static BOOTED: AtomicBool = AtomicBool::new(false);

fn now_ms() -> u64 {
    std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap_or_default().as_millis() as u64
}

/// One honest note on a toggle's little log (what happened, when).
fn note(state: &Toggle, text: &str) {
    let _ = state;
    crate::observer::record("verification", format!("[dev] {text}"));
}

/// The repo root for scenario runs: discovered by walking up from the
/// running dev build's own location until the tree's signature shows up —
/// no path from any particular machine is written down anywhere.
pub fn workspace_root() -> Option<PathBuf> {
    if let Some(from_env) = std::env::var_os("IZUKI_DEV_ROOT") {
        let p = PathBuf::from(from_env);
        if p.join("src-tauri").join("Cargo.toml").is_file() {
            return Some(p);
        }
    }
    let exe = std::env::current_exe().ok()?;
    let mut up: Option<&Path> = exe.parent();
    while let Some(dir) = up {
        if dir.join("src-tauri").join("Cargo.toml").is_file() && dir.join("package.json").is_file() {
            return Some(dir.to_path_buf());
        }
        up = dir.parent();
    }
    None
}

/// The approved test scenarios: fixed in this file, all read-only toward
/// user data (temp dirs and the repo's own build outputs only), portable to
/// any dev machine with the repo checked out.
pub const SCENARIOS: &[(&str, &str, &str, &[&str])] = &[
    ("rust-core", "Izuki's own Rust tests (the 570-ish suite)", "cargo", &["test", "--lib"]),
    ("workspace", "Workspace / worker / panel checks from package.json", "npm", &["run", "-s", "test:workspace"]),
    ("panel", "Panel browser checks (headless Edge)", "npm", &["run", "-s", "test:panel"]),
];

pub fn scenario_by_id(id: &str) -> Option<&'static (&'static str, &'static str, &'static str, &'static [ &'static str])> {
    SCENARIOS.iter().find(|s| s.0 == id)
}

/// The digest for Claude Live Auto-Review: everything the observer kept
/// since the marker moved — events verbatim, frames as their indexes and
/// moments (bytes stay servable through /api/frames without copying).
pub fn build_digest() -> Result<Value, String> {
    let marker = REVIEWED_UP_TO.load(Ordering::SeqCst);
    let all = crate::observer::snapshot_events();
    let new_events: Vec<crate::observer::Event> =
        all.iter().filter(|e| e.at > marker).cloned().collect();
    let events_new = new_events.len();
    let frames = crate::observer::frames_index();
    let payload = json!({
        "generated_at": now_ms(),
        "from_ms": marker,
        "events": new_events,
        "events_new": events_new,
        "frames": frames,
        "reading_how": "GET /api/frames/<n> (newest = highest n) and /api/events, with the Bearer token from the vision token file",
    });
    *DIGEST.lock() = Some(payload.to_string());
    if let Some(e) = new_events.last() {
        REVIEWED_UP_TO.store(e.at, Ordering::SeqCst);
    }
    Ok(payload)
}

pub fn review_digest_json() -> Option<String> {
    DIGEST.lock().clone()
}

pub fn review_on() -> bool {
    REVIEW.lock().on
}

/// Smart Vision ON: the same §5 watcher, the same guards — the observer only
/// observes when the owner asked (IZUKI_VISION=1), one grab per floor-time,
/// bounded ring.
pub fn set_vision(on: bool, hwnd: isize) -> Result<(), String> {
    let mut t = VISION.lock();
    t.at = now_ms();
    if on {
        crate::observer::ENABLED.store(true, Ordering::SeqCst);
        crate::observer::start(hwnd)?;
        t.on = true;
        t.note = "observing this app's own window (bounded ring, duplicate views dropped)".into();
        note(&t, "Smart Vision turned ON");
    } else {
        crate::observer::stop();
        crate::observer::clear_frames();
        t.on = false;
        t.note = "capture stopped; frames and buffers released".into();
        note(&t, "Smart Vision turned OFF (capture released)");
    }
    Ok(())
}

/// Claude Live Auto-Review ON: arms the diagnostic-analysis channel — while
/// on, review digests may be assembled and read through the token-guarded
/// loopback endpoints. OFF drops the collected digest.
pub fn set_review(on: bool) {
    let mut t = REVIEW.lock();
    t.at = now_ms();
    if on {
        t.on = true;
        t.note = "armed: digests readable via the token-guarded endpoints".into();
        note(&t, "Claude Live Auto-Review armed");
    } else {
        t.on = false;
        *DIGEST.lock() = None;
        t.note = "disarmed; collected digest dropped".into();
        note(&t, "Claude Live Auto-Review disarmed");
    }
}

/// Smart Real Testing ON/OFF: ON arms the runner; OFF cancels a run in
/// flight. Finished results stay readable, so the record of what happened
/// is never hidden by a switch.
pub fn set_testing(on: bool) -> Result<(), String> {
    let mut t = TESTING.lock();
    t.at = now_ms();
    if on {
        workspace_root().ok_or("not an Izuki dev checkout (no src-tauri + package.json above the running binary)")?;
        t.on = true;
        t.note = "armed: only the approved scenarios in this file may run".into();
        note(&t, "Smart Real Testing armed (approved scenarios only)");
    } else {
        cancel_run();
        t.on = false;
        t.note = "disarmed; any running scenario was cancelled".into();
        note(&t, "Smart Real Testing disarmed");
    }
    Ok(())
}

/// Run one approved scenario: allowlist check first (an id outside the list
/// is refused — that is the whole point), then one child process in the
/// workspace. Output lands in a bounded tail here, and a scenario can never
/// be started twice over a still-running one.
pub fn run_scenario(id: &str) -> Result<u64, String> {
    if !TESTING.lock().on {
        return Err("Smart Real Testing is OFF; nothing runs until you arm it.".into());
    }
    if TEST_CHILD_BUSY.load(Ordering::SeqCst) {
        return Err("a scenario is already running; wait for it or turn testing off".into());
    }
    let (sid, label, program, args) = scenario_by_id(id)
        .ok_or_else(|| format!("'{id}' is not an approved scenario — anything outside devmode::SCENARIOS is refused."))?;
    let root = workspace_root().ok_or("no Izuki dev checkout found")?;
    let cwd = if *program == "cargo" { root.join("src-tauri") } else { root.clone() };
    if !cwd.is_dir() {
        return Err(format!("the scenario's folder is missing: {}", cwd.display()));
    }
    let mut cmd = Command::new(program);
    cmd.args(args.iter())
        .current_dir(&cwd)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .env("IZUKI_TEST_MANIFEST", "1");
    let child = cmd.spawn()
        .map_err(|e| format!("starting {program} failed: {e} (is it on PATH on this dev machine?)"))?;
    *TEST_TAIL.lock() = String::new();
    *TEST_CHILD.lock() = Some(child);
    TEST_CHILD_BUSY.store(true, Ordering::SeqCst);
    let run_at = now_ms();
    {
        let mut runs = RUNS.lock();
        if runs.len() >= MAX_RUNS { runs.pop_front(); }
        runs.push_back(TestRun {
            id: sid.to_string(), at: run_at, ok: None,
            summary: format!("running ({label})"), tail: String::new(),
        });
    }
    let id_owned = sid.to_string();
    std::thread::Builder::new().name("izuki-dev-run".into()).spawn(move || {
        let mut guard = TEST_CHILD.lock();
        if let Some(child) = guard.as_mut() {
            let mut out: Vec<u8> = Vec::new();
            if let Some(mut so) = child.stdout.take() { let _ = so.read_to_end(&mut out); }
            if let Some(mut se) = child.stderr.take() { let _ = se.read_to_end(&mut out); }
            let ok = child.wait().map(|s| s.success()).unwrap_or(false);
            drop(guard);
            let text = String::from_utf8_lossy(&out).to_string();
            let summary = if ok {
                "passed".to_string()
            } else {
                text.lines().rev()
                    .find(|l| l.contains("FAILED") || l.contains("error"))
                    .unwrap_or("FAILED").to_string()
            };
            let tail = text.lines().rev().take(60).collect::<Vec<_>>()
                .into_iter().rev().collect::<Vec<_>>().join("\n");
            let mut runs = RUNS.lock();
            if let Some(r) = runs.iter_mut().rev().find(|r| r.id == id_owned && r.ok.is_none()) {
                r.ok = Some(ok);
                r.summary = summary;
                r.tail = tail.chars().skip(tail.chars().count().saturating_sub(8000)).collect();
            }
            TEST_CHILD_BUSY.store(false, Ordering::SeqCst);
            *TEST_CHILD.lock() = None;
        }
    }).map_err(|e| format!("the runner thread never started: {e}"))?;
    Ok(run_at)
}

/// Kill a running scenario child, if any (safe to call at any time).
pub fn cancel_run() {
    let mut guard = TEST_CHILD.lock();
    if let Some(child) = guard.as_mut() {
        let _ = child.kill();
        let _ = child.wait();
    }
    *guard = None;
    TEST_CHILD_BUSY.store(false, Ordering::SeqCst);
}

/// The one big red button: everything goes OFF for real — capture released,
/// a running scenario cancelled, digest dropped.
pub fn stop_all() -> String {
    let mut happened = Vec::new();
    if VISION.lock().on { let _ = set_vision(false, 0); happened.push("Smart Vision stopped"); }
    if REVIEW.lock().on { set_review(false); happened.push("Auto-Review disarmed"); }
    if TESTING.lock().on { set_testing(false); happened.push("Testing arm dropped"); }
    if TEST_CHILD_BUSY.load(Ordering::SeqCst) { cancel_run(); happened.push("a running scenario was killed"); }
    if happened.is_empty() { happened.push("everything was already off"); }
    format!("Stop All: {}", happened.join(", "))
}

/// Everything the panel shows, as one JSON value.
pub fn status_json() -> Value {
    json!({
        "available": true,
        "feature": "devvision",
        "vision": toggle_json(&VISION.lock()),
        "review": toggle_json(&REVIEW.lock()),
        "testing": {
            "on": TESTING.lock().on,
            "note": TESTING.lock().note.clone(),
            "at": TESTING.lock().at,
            "busy": TEST_CHILD_BUSY.load(Ordering::SeqCst),
            "scenarios": SCENARIOS.iter().map(|(id, label, _, _)| json!({"id": id, "label": label})).collect::<Vec<_>>(),
            "runs": RUNS.lock().iter().rev().take(8)
                .map(|r| json!({"id": r.id, "at": r.at, "ok": r.ok, "summary": r.summary, "tail": r.tail}))
                .collect::<Vec<_>>(),
        },
        "observer": {
            "server_port": crate::observer::server_port(),
            "token_path": crate::observer::token_path().display().to_string(),
        },
        "root": workspace_root().map(|p| p.display().to_string()),
    })
}

fn toggle_json(t: &Toggle) -> Value {
    json!({"on": t.on, "note": t.note, "at": t.at})
}
} // pub mod real

// ─── the four panel commands (every build has them; only dev builds act) ─

#[cfg(feature = "devvision")]
#[tauri::command]
pub fn dev_status() -> String {
    real::status_json().to_string()
}

#[cfg(not(feature = "devvision"))]
#[tauri::command]
pub fn dev_status() -> String {
    "{\"available\":false,\"why\":\"developer tools are not in this build\"}".to_string()
}

#[cfg(feature = "devvision")]
#[tauri::command]
pub fn dev_set_toggle(app: tauri::AppHandle, kind: String, on: bool) -> String {
    let outcome: Outcome = match kind.as_str() {
        "vision" => match app.get_webview_window("main").map(|w| w.hwnd()) {
            Some(Ok(h)) => match real::set_vision(on, h.0 as isize) {
                Ok(()) => Outcome::Ok("Smart Vision moved".into()),
                Err(e) => Outcome::Err(e),
            },
            Some(Err(_)) => Outcome::Err("the main window's handle could not be read".into()),
            None => Outcome::Err("no main window to observe".into()),
        },
        "review" => { real::set_review(on); Outcome::Ok("Claude Live Auto-Review moved".into()) }
        "testing" => match real::set_testing(on) { Ok(()) => Outcome::Ok("Smart Real Testing moved".into()), Err(e) => Outcome::Err(e) },
        other => Outcome::Err(format!("unknown developer switch '{other}'")),
    };
    match outcome { Outcome::Ok(m) => format!("{{\"ok\":true,\"message\":\"{m}\"}}"), Outcome::Err(e) => format!("{{\"ok\":false,\"error\":\"{}\"}}", e.replace('"', "'")) }
}

#[cfg(not(feature = "devvision"))]
#[tauri::command]
pub fn dev_set_toggle(_app: tauri::AppHandle, _kind: String, _on: bool) -> String {
    NO.to_string()
}

#[cfg(feature = "devvision")]
#[tauri::command]
pub fn dev_run_scenario(id: String) -> String {
    match real::run_scenario(&id) {
        Ok(at) => format!("{{\"ok\":true,\"started_at\":{at}}}"),
        Err(e) => format!("{{\"ok\":false,\"error\":\"{}\"}}", e.replace('"', "'")),
    }
}

#[cfg(not(feature = "devvision"))]
#[tauri::command]
pub fn dev_run_scenario(_id: String) -> String { NO.to_string() }

#[cfg(feature = "devvision")]
#[tauri::command]
pub fn dev_capture_bug() -> String {
    match crate::observer::capture_bug() {
        Ok(path) => serde_json::json!({"ok": true, "path": path.display().to_string()}).to_string(),
        Err(e) => format!("{{\"ok\":false,\"error\":\"{}\"}}", e.replace('"', "'")),
    }
}

#[cfg(not(feature = "devvision"))]
#[tauri::command]
pub fn dev_capture_bug() -> String { NO.to_string() }

#[cfg(feature = "devvision")]
#[tauri::command]
pub fn dev_stop_all() -> String {
    real::stop_all()
}

#[cfg(not(feature = "devvision"))]
#[tauri::command]
pub fn dev_stop_all() -> String { NO.to_string() }

#[cfg(feature = "devvision")]
enum Outcome { Ok(String), Err(String) }

#[cfg(not(feature = "devvision"))]
const NO: &str = "{\"ok\":false,\"error\":\"developer tools are not in this build\"}";

// ─── tests (run with the feature) ─────────────────────────────────────────

#[cfg(all(test, feature = "devvision"))]
mod tests {
    use super::real as dm;

    #[test]
    fn every_switch_is_off_until_you_act() {
        // No ON state survives an app start (nothing persisted anywhere).
        assert!(!dm::review_on());
        assert_eq!(dm::stop_all(), "Stop All: everything was already off");
    }

    #[test]
    fn a_scenario_outside_the_approved_list_is_refused() {
        // This refusal is the control that keeps automated testing away from
        // anything not studied line-by-line in this file.
        assert!(dm::scenario_by_id("publish-to-github").is_none());
        assert!(dm::scenario_by_id("delete-user-data").is_none());
        assert!(dm::scenario_by_id("cargo build --release && push").is_none());
        assert!(dm::scenario_by_id("rust-core").is_some(), "the approved ones still exist");
    }

    #[test]
    fn running_is_refused_while_testing_is_off() {
        assert!(dm::run_scenario("rust-core").unwrap_err().contains("OFF"));
    }

    #[test]
    fn the_workspace_root_is_discovered_not_hardcoded() {
        // Works on this dev machine's checkout AND any other: IZUKI_DEV_ROOT
        // points the discovery, never a literal path from one ThinkPad.
        let root = dm::workspace_root();
        assert!(root.is_some(), "in the repo's own tests the checkout is above target/");
        let root = root.unwrap();
        assert!(root.join("src-tauri/Cargo.toml").is_file());
    }

    #[test]
    fn the_review_digest_only_holds_new_events() {
        // First digest with nothing new: empty and bounded.
        let empty = dm::build_digest().unwrap();
        assert_eq!(empty["events"].as_array().map(|a| a.len()), Some(0));
    }
}
