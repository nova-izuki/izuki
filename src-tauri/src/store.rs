//! Flat-file persistence in %APPDATA%\Izuki.
//!
//! Everything is plain JSON so a user can read, edit, back up or share their
//! flows without the app running.

use anyhow::{Context, Result};
use parking_lot::RwLock;
use serde::{de::DeserializeOwned, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

use crate::model::{Flow, Watcher};
use crate::settings::Settings;

pub fn data_dir() -> PathBuf {
    let base = dirs::data_dir().unwrap_or_else(|| PathBuf::from("."));
    base.join("Izuki")
}

fn ensure_dir() -> PathBuf {
    let dir = data_dir();
    let _ = fs::create_dir_all(&dir);
    let _ = fs::create_dir_all(dir.join("thumbnails"));
    dir
}

fn read_json<T: DeserializeOwned>(path: &Path) -> Option<T> {
    let raw = fs::read_to_string(path).ok()?;
    serde_json::from_str(&raw).ok()
}

/// Write via a temp file then rename, so a crash mid-write cannot corrupt the
/// user's flow library.
fn write_json<T: Serialize>(path: &Path, value: &T) -> Result<()> {
    let tmp = path.with_extension("tmp");
    let body = serde_json::to_string_pretty(value)?;
    fs::write(&tmp, body).with_context(|| format!("writing {}", tmp.display()))?;
    fs::rename(&tmp, path).with_context(|| format!("replacing {}", path.display()))?;
    Ok(())
}

/// In-memory cache over the JSON files, guarded for cross-thread access from
/// the watcher pool and the command handlers alike.
pub struct Store {
    dir: PathBuf,
    settings: RwLock<Settings>,
    flows: RwLock<Vec<Flow>>,
    watchers: RwLock<Vec<Watcher>>,
}

impl Store {
    pub fn load() -> Self {
        let dir = ensure_dir();

        let mut settings: Settings = read_json(&dir.join("settings.json")).unwrap_or_default();
        settings.heal();

        let flows: Vec<Flow> = read_json(&dir.join("flows.json")).unwrap_or_default();
        let mut watchers: Vec<Watcher> = read_json(&dir.join("watchers.json")).unwrap_or_default();

        // Nothing is mid-trigger at boot.
        for w in &mut watchers {
            w.status = if w.enabled {
                crate::model::WatcherStatus::Watching
            } else {
                crate::model::WatcherStatus::Idle
            };
            w.message = None;
        }

        Self {
            dir,
            settings: RwLock::new(settings),
            flows: RwLock::new(flows),
            watchers: RwLock::new(watchers),
        }
    }

    pub fn dir(&self) -> &Path {
        &self.dir
    }

    // ---------------------------------------------------------------- settings

    pub fn settings(&self) -> Settings {
        self.settings.read().clone()
    }

    pub fn set_settings(&self, mut next: Settings) -> Settings {
        {
            // The panel saves its whole copy of the settings, and it may not
            // have heard yet that a phone paired in the background — don't
            // let that stale copy unpair it. (Unpairing makes a new code.)
            let current = self.settings.read();
            if next.telegram_chat_id == 0
                && current.telegram_chat_id != 0
                && next.telegram_code == current.telegram_code
                && next.telegram_token == current.telegram_token
            {
                next.telegram_chat_id = current.telegram_chat_id;
            }
            if next.discord_user_id.is_empty()
                && !current.discord_user_id.is_empty()
                && next.telegram_code == current.telegram_code
                && next.discord_token == current.discord_token
            {
                next.discord_user_id = current.discord_user_id.clone();
            }
        }
        next.heal();
        *self.settings.write() = next.clone();
        let _ = write_json(&self.dir.join("settings.json"), &next);
        next
    }

    // ------------------------------------------------------------------- flows

    pub fn flows(&self) -> Vec<Flow> {
        self.flows.read().clone()
    }

    pub fn flow(&self, id: &str) -> Option<Flow> {
        self.flows.read().iter().find(|f| f.id == id).cloned()
    }

    pub fn latest_flow(&self) -> Option<Flow> {
        self.flows.read().iter().max_by_key(|f| f.created_at).cloned()
    }

    pub fn add_flow(&self, flow: Flow) {
        {
            let mut flows = self.flows.write();
            flows.retain(|f| f.id != flow.id);
            flows.push(flow);
            // Keep the library from growing without bound.
            if flows.len() > 500 {
                flows.sort_by_key(|f| f.created_at);
                let overflow = flows.len() - 500;
                flows.drain(0..overflow);
            }
        }
        self.flush_flows();
    }

    pub fn mutate_flow<F: FnOnce(&mut Flow)>(&self, id: &str, f: F) -> bool {
        let hit = {
            let mut flows = self.flows.write();
            match flows.iter_mut().find(|x| x.id == id) {
                Some(flow) => {
                    f(flow);
                    true
                }
                None => false,
            }
        };
        if hit {
            self.flush_flows();
        }
        hit
    }

    pub fn remove_flow(&self, id: &str) {
        self.flows.write().retain(|f| f.id != id);
        self.flush_flows();
    }

    fn flush_flows(&self) {
        let snapshot = self.flows.read().clone();
        let _ = write_json(&self.dir.join("flows.json"), &snapshot);
    }

    // ---------------------------------------------------------------- watchers

    pub fn watchers(&self) -> Vec<Watcher> {
        self.watchers.read().clone()
    }

    pub fn add_watcher(&self, w: Watcher) {
        {
            let mut ws = self.watchers.write();
            ws.retain(|x| x.id != w.id);
            ws.push(w);
        }
        self.flush_watchers();
    }

    pub fn mutate_watcher<F: FnOnce(&mut Watcher)>(&self, id: &str, f: F) -> bool {
        let hit = {
            let mut ws = self.watchers.write();
            match ws.iter_mut().find(|x| x.id == id) {
                Some(w) => {
                    f(w);
                    true
                }
                None => false,
            }
        };
        if hit {
            self.flush_watchers();
        }
        hit
    }

    pub fn remove_watcher(&self, id: &str) {
        self.watchers.write().retain(|w| w.id != id);
        self.flush_watchers();
    }

    fn flush_watchers(&self) {
        let snapshot = self.watchers.read().clone();
        let _ = write_json(&self.dir.join("watchers.json"), &snapshot);
    }

    // ------------------------------------------------------------- ghost hand

    pub fn read_ghost(&self) -> serde_json::Value {
        read_json(&self.dir.join("ghost.json")).unwrap_or_else(|| serde_json::json!({}))
    }

    pub fn write_ghost(&self, v: &serde_json::Value) {
        let _ = write_json(&self.dir.join("ghost.json"), v);
    }
}
