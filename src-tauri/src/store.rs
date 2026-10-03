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

/// The user's settings — keys and all — read forgivingly. A strict read used
/// to fail on anything this copy of Izuki didn't know (a brain added in a
/// newer version, "groq" as the chosen one), fall back to blank defaults,
/// and the next save wiped every key the user had pasted. Now what isn't
/// understood is skipped, the rest is kept, and a file that still can't be
/// read is copied aside before anything is written over it.
fn read_settings(path: &Path) -> Settings {
    let Ok(raw) = fs::read_to_string(path) else { return Settings::default() };
    if let Ok(s) = serde_json::from_str::<Settings>(&raw) {
        return s;
    }
    if let Ok(mut v) = serde_json::from_str::<serde_json::Value>(&raw) {
        let known = |id: &serde_json::Value| id.as_str().and_then(crate::settings::ProviderId::parse).is_some();
        if let Some(list) = v.get_mut("providers").and_then(|p| p.as_array_mut()) {
            list.retain(|p| known(&p["id"]));
        }
        if !v.get("active_provider").is_some_and(|a| known(a)) {
            v["active_provider"] = serde_json::json!("gemini");
        }
        if v.get("fallback_provider").is_some_and(|f| !f.is_null() && !known(f)) {
            v["fallback_provider"] = serde_json::Value::Null;
        }
        if let Ok(s) = serde_json::from_value::<Settings>(v) {
            eprintln!("[store] settings had entries this version doesn't know — skipped them, kept the rest");
            return s;
        }
    }
    let aside = path.with_file_name(format!("settings.unreadable-{}.json", chrono::Local::now().format("%Y%m%d-%H%M%S")));
    let _ = fs::copy(path, &aside);
    eprintln!("[store] couldn't read settings.json — kept a copy at {}", aside.display());
    Settings::default()
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

        let mut settings: Settings = read_settings(&dir.join("settings.json"));
        settings.heal();

        let all: Vec<Flow> = read_json(&dir.join("flows.json")).unwrap_or_default();
        let flows = fresh_flows(all, crate::model::now_ms(), settings.flows_keep_days);
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

    pub fn add_flow(&self, mut flow: Flow) {
        {
            let mut flows = self.flows.write();
            // Repeating the same saved sequence updates it instead of
            // filling the library with identical recordings.
            if let Some(old) = flows.iter().find(|f| f.app == flow.app && f.prompt.trim() == flow.prompt.trim()
                && serde_json::to_value(&f.steps).ok() == serde_json::to_value(&flow.steps).ok()) {
                flow.id = old.id.clone();
                flow.name = old.name.clone();
                flow.run_count = old.run_count;
                flow.last_run = old.last_run;
                flow.hotkey = old.hotkey.clone();
                flow.created_at = old.created_at;
            }
            flows.retain(|f| f.id != flow.id);
            flows.push(flow);
            let keep_days = self.settings.read().flows_keep_days;
            let kept = fresh_flows(std::mem::take(&mut *flows), crate::model::now_ms(), keep_days);
            *flows = kept;
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

    /// Clear only the IDs the user selected. Keep a recoverable archive first.
    /// The daily tidy-up: drop flows unused past the setting, and "undo"
    /// archives older than a week, so saved flows (screenshots included)
    /// never pile up on the user's drive. Returns how many flows went.
    pub fn prune_flows(&self) -> usize {
        let keep_days = self.settings.read().flows_keep_days;
        let removed = {
            let mut flows = self.flows.write();
            let before = flows.len();
            let kept = fresh_flows(std::mem::take(&mut *flows), crate::model::now_ms(), keep_days);
            let removed = before - kept.len();
            if removed > 0 {
                let _ = write_json(&self.dir.join("flows.json"), &kept);
            }
            *flows = kept;
            removed
        };
        if let Ok(entries) = fs::read_dir(&self.dir) {
            let week = std::time::Duration::from_secs(7 * 86_400);
            for e in entries.flatten() {
                let name = e.file_name().to_string_lossy().to_string();
                let old = e.metadata().and_then(|m| m.modified()).ok().and_then(|t| t.elapsed().ok()).is_some_and(|age| age > week);
                if name.starts_with("flows-archive-") && name.ends_with(".json") && old {
                    let _ = fs::remove_file(e.path());
                }
            }
        }
        if removed > 0 {
            eprintln!("[flows] cleared {removed} unused flow(s)");
        }
        removed
    }

    pub fn archive_flows(&self, ids: &[String]) -> Result<String> {
        let mut flows = self.flows.write();
        let removed: Vec<Flow> = flows.iter().filter(|f| ids.contains(&f.id)).cloned().collect();
        if removed.is_empty() { anyhow::bail!("No matching flows to clear."); }
        let token = uuid::Uuid::new_v4().to_string();
        write_json(&self.dir.join(format!("flows-archive-{token}.json")), &removed)?;
        let keep: Vec<Flow> = flows.iter().filter(|f| !ids.contains(&f.id)).cloned().collect();
        write_json(&self.dir.join("flows.json"), &keep)?;
        *flows = keep;
        Ok(token)
    }

    pub fn restore_flows(&self, token: &str) -> Result<usize> {
        let token = uuid::Uuid::parse_str(token).context("invalid archive")?;
        let saved: Vec<Flow> = read_json(&self.dir.join(format!("flows-archive-{token}.json")))
            .ok_or_else(|| anyhow::anyhow!("That flow archive could not be read."))?;
        let mut flows = self.flows.write();
        let mut next = flows.clone();
        let mut count = 0;
        for flow in saved {
            if !next.iter().any(|f| f.id == flow.id) { next.push(flow); count += 1; }
        }
        write_json(&self.dir.join("flows.json"), &next)?;
        *flows = next;
        Ok(count)
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

#[cfg(test)]
mod tests {
    #[test]
    fn clearing_flows_is_scoped_and_recoverable() {
        use super::*;
        let dir = std::env::temp_dir().join(format!("izuki-flow-test-{}", uuid::Uuid::new_v4()));
        fs::create_dir_all(&dir).unwrap();
        // Keep everything: these test flows are dated 1970.
        let settings = Settings { flows_keep_days: 0, ..Settings::default() };
        let store = Store { dir: dir.clone(), settings: RwLock::new(settings), flows: RwLock::new(vec![]), watchers: RwLock::new(vec![]) };
        let flow = |id: &str| serde_json::from_value::<Flow>(serde_json::json!({"id":id,"name":id,"steps":[],"prompt":id,"created_at":1})).unwrap();
        store.add_flow(flow("keep")); store.add_flow(flow("clear"));
        let token = store.archive_flows(&["clear".into()]).unwrap();
        assert_eq!(store.flows().len(), 1);
        assert_eq!(store.flows()[0].id, "keep");
        assert_eq!(store.restore_flows(&token).unwrap(), 1);
        assert_eq!(store.restore_flows(&token).unwrap(), 0);
        assert!(store.restore_flows("../settings").is_err());
        assert_eq!(store.flows().len(), 2);
        fs::remove_dir_all(dir).unwrap();
    }
    /// A brain this version doesn't know — even as the chosen one — must not
    /// cost the user their keys.
    #[test]
    fn unknown_brains_never_wipe_the_keys() {
        let dir = std::env::temp_dir().join(format!("izuki-settings-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let path = dir.join("settings.json");
        let mut v = serde_json::to_value(crate::settings::Settings::default()).unwrap();
        for p in v["providers"].as_array_mut().unwrap() {
            if p["id"] == "gemini" {
                p["api_key"] = "AIza-keep-me".into();
            }
        }
        v["providers"].as_array_mut().unwrap().push(serde_json::json!({
            "id": "brand-new-brain", "label": "Future", "base_url": "https://x", "model": "m", "api_key": "k", "enabled": true
        }));
        v["active_provider"] = "brand-new-brain".into();
        std::fs::write(&path, v.to_string()).unwrap();
        let s = super::read_settings(&path);
        let gemini = s.provider(crate::settings::ProviderId::Gemini).unwrap();
        assert_eq!(gemini.api_key, "AIza-keep-me");
        assert_eq!(s.active_provider, crate::settings::ProviderId::Gemini);
        let _ = std::fs::remove_dir_all(&dir);
    }

}

/// Flows that are still wanted: run (or made) within `keep_days`, or given a
/// shortcut key. `keep_days` 0 keeps everything. Every Ctrl+D used to stay
/// in the library for good; most are one-offs.
pub fn fresh_flows(flows: Vec<Flow>, now_ms: i64, keep_days: u32) -> Vec<Flow> {
    if keep_days == 0 {
        return flows;
    }
    let cutoff = now_ms - i64::from(keep_days) * 86_400_000;
    flows
        .into_iter()
        .filter(|f| f.hotkey.as_deref().is_some_and(|k| !k.trim().is_empty()) || f.last_run.unwrap_or(f.created_at).max(f.created_at) >= cutoff)
        .collect()
}

#[cfg(test)]
mod fresh_flow_tests {
    use super::*;

    fn flow(id: &str, created: i64, last: Option<i64>, hotkey: Option<&str>) -> Flow {
        serde_json::from_value(serde_json::json!({
            "id": id, "name": id, "steps": [], "created_at": created, "last_run": last, "run_count": 1, "hotkey": hotkey,
        }))
        .unwrap()
    }

    #[test]
    fn old_one_offs_clear_but_saved_ones_stay() {
        let day = 86_400_000;
        let now = 100 * day;
        let flows = vec![
            flow("old", now - 3 * day, None, None),
            flow("used-today", now - 5 * day, Some(now - 3_600_000), None),
            flow("new", now - 60_000, None, None),
            flow("hotkeyed", now - 30 * day, None, Some("Ctrl+1")),
        ];
        let kept: Vec<String> = fresh_flows(flows.clone(), now, 1).into_iter().map(|f| f.id).collect();
        assert_eq!(kept, vec!["used-today", "new", "hotkeyed"]);
        assert_eq!(fresh_flows(flows.clone(), now, 0).len(), 4);
        assert_eq!(fresh_flows(flows, now, 7).len(), 4);
    }
}
