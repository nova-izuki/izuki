//! Keeping Izuki up to date by itself.
//!
//! A little after start-up, Izuki asks GitHub whether there's a newer release
//! (latest.json, signed — see tauri.conf.json). It offers a download in the
//! panel; the user chooses when to install. Never interrupts a running task.

use std::time::Duration;

use tauri::{AppHandle, Emitter};
use tauri_plugin_updater::UpdaterExt;

use crate::events;
use crate::model::StatusEvent;

/// Check once, a little after start-up (so it never slows the start down).
pub fn check_later(app: &AppHandle) {
    if cfg!(debug_assertions) || std::env::var("IZUKI_SELFTEST").is_ok() {
        return;
    }
    let app = app.clone();
    tauri::async_runtime::spawn(async move {
        tokio::time::sleep(Duration::from_secs(30)).await;
        check_and_notify(app).await;
    });
}

async fn check_and_notify(app: AppHandle) {
    let Ok(updater) = app.updater() else { return };
    let update = match updater.check().await {
        Ok(Some(u)) => u,
        Ok(None) => return,
        Err(e) => {
            eprintln!("[update] couldn't check: {e}");
            return;
        }
    };
    eprintln!("[update] {} → {} available", update.current_version, update.version);
    let _ = app.emit("izuki://update-available", update.version.clone());
    let _ = app.emit(
        events::STATUS,
        StatusEvent::info(format!("Izuki {} is available — open Settings → Updates when you're ready.", update.version)),
    );
}
