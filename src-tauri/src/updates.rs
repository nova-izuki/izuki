//! Keeping Izuki up to date by itself.
//!
//! A little after start-up, Izuki asks GitHub whether there's a newer release
//! (latest.json, signed — see tauri.conf.json). If there is, it downloads and
//! installs it (Windows shows a small progress bar, then Izuki opens again).
//! Never in a development build, and never in the middle of something:
//! it waits until Izuki isn't busy.

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
        check_and_install(app).await;
    });
}

async fn check_and_install(app: AppHandle) {
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
    // Not while Izuki is doing something for you.
    for _ in 0..120 {
        if !crate::hotkey::is_busy() {
            break;
        }
        tokio::time::sleep(Duration::from_secs(5)).await;
    }
    let _ = app.emit(
        events::STATUS,
        StatusEvent::info(format!("Updating Izuki to {} — it'll open again in a moment.", update.version)),
    );
    if let Err(e) = update.download_and_install(|_, _| {}, || {}).await {
        eprintln!("[update] couldn't install: {e}");
        return;
    }
    // (On Windows the installer has taken over by now; elsewhere, restart.)
    app.restart();
}
