//! A single shared `Store`, reachable from the watcher thread and the command
//! handlers alike without threading it through every signature.

use std::sync::{Arc, OnceLock};

use crate::store::Store;

static STORE: OnceLock<Arc<Store>> = OnceLock::new();

pub fn init() -> Arc<Store> {
    STORE.get_or_init(|| Arc::new(Store::load())).clone()
}

/// Panics only if called before `init`, which `run()` does first thing.
pub fn store() -> Arc<Store> {
    STORE
        .get()
        .cloned()
        .expect("the Izuki store is read before it is initialised")
}
