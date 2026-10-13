//! A single shared `Store`, reachable from the watcher thread and the command
//! handlers alike without threading it through every signature.

use std::sync::{Arc, OnceLock};

use crate::store::Store;

static STORE: OnceLock<Arc<Store>> = OnceLock::new();

pub fn init() -> Arc<Store> {
    STORE.get_or_init(|| Arc::new(Store::load())).clone()
}

/// The store if it's been loaded — for code that can run before `init`
/// (a crash report at startup).
pub fn try_store() -> Option<Arc<Store>> {
    STORE.get().cloned()
}

static APP: OnceLock<tauri::AppHandle> = OnceLock::new();

pub fn set_app(app: &tauri::AppHandle) {
    let _ = APP.set(app.clone());
}

/// A live line for the Island while Izuki works — "Asking Gemini…",
/// "Clicking “Next”…" — so it's never just a blind "Thinking…". Shown,
/// never spoken; the newest wins.
/// What Izuki is really doing right now — the task it's on, its latest
/// step, and since when — so "what are you doing?" is answered from fact,
/// never made up.
static DOING: parking_lot::Mutex<Option<(u64, String, String, std::time::Instant)>> = parking_lot::Mutex::new(None);
static DOING_ID: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(1);

/// A task running for as long as this lives (the agent loop, an apps
/// request). Each has its own number: an older one finishing never clears
/// (or rewrites) a newer one.
pub struct Doing(u64);

impl Doing {
    pub fn start(goal: &str) -> Doing {
        let id = DOING_ID.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
        *DOING.lock() = Some((id, goal.trim().chars().take(140).collect(), String::new(), std::time::Instant::now()));
        Doing(id)
    }
}

impl Drop for Doing {
    fn drop(&mut self) {
        let mut d = DOING.lock();
        if d.as_ref().is_some_and(|t| t.0 == self.0) {
            d.take();
        }
    }
}

/// The current task's latest step ("Opening Blackboard…").
pub fn task_step(step: &str) {
    if let Some(d) = DOING.lock().as_mut() {
        d.2 = step.trim().chars().take(140).collect();
    }
}

/// The honest answer to "what are you doing?".
pub fn doing_now() -> String {
    match DOING.lock().as_ref() {
        Some((_, goal, step, since)) => {
            let secs = since.elapsed().as_secs();
            let how_long = if secs < 60 { format!("{secs} seconds") } else { format!("{} minutes", secs / 60) };
            if step.is_empty() {
                format!("I'm working on “{goal}” — just started ({how_long} in).")
            } else {
                format!("I'm working on “{goal}”. Right now: {step} ({how_long} in.)")
            }
        }
        None => "Nothing right now — no task running. I'm here whenever you need me.".into(),
    }
}

pub fn trace(line: impl Into<String>) {
    use tauri::Emitter;
    if let Some(app) = APP.get() {
        let _ = app.emit_to("overlay", "izuki://trace", line.into());
    }
}

/// A provider's name without its "(free tier)" / "· model" extras.
pub fn short_name(label: &str) -> String {
    let base = label.split(" · ").next().unwrap_or(label);
    base.split(" (").next().unwrap_or(base).trim().to_string()
}

/// Settings were changed here in the core (by voice, or the TV being
/// found): the windows reload theirs, so an open Settings page never saves
/// its older copy back over the change.
pub fn settings_changed_elsewhere() {
    use tauri::Emitter;
    if let Some(app) = APP.get() {
        let _ = app.emit("izuki://settings-external", ());
        let _ = app.emit("izuki://settings-changed", ());
    }
}

/// Panics only if called before `init`, which `run()` does first thing.
pub fn store() -> Arc<Store> {
    STORE
        .get()
        .cloned()
        .expect("the Izuki store is read before it is initialised")
}

#[cfg(test)]
mod doing_tests {
    use super::*;

    #[test]
    fn says_what_is_really_running() {
        let first = Doing::start("open Blackboard");
        task_step("Opening Blackboard…");
        assert!(doing_now().contains("open Blackboard") && doing_now().contains("Opening Blackboard"));
        // A newer task takes over; the older one finishing doesn't erase it.
        let second = Doing::start("check my email");
        drop(first);
        assert!(doing_now().contains("check my email"));
        drop(second);
        assert!(doing_now().starts_with("Nothing right now"));
    }
}
