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
