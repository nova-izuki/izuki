//! Automatic checks; signed downloads and installation only by user request.
use std::time::{Duration, Instant};
use parking_lot::Mutex;
use serde::Serialize;
use tauri::{AppHandle, Emitter, WebviewWindow};
use tauri_plugin_updater::{Update, UpdaterExt};

#[derive(Clone, Default, Serialize)]
pub struct UpdateStatus {
    pub phase: String, pub version: String, pub downloaded: u64,
    pub total: Option<u64>, pub checked_at: i64, pub error: Option<String>,
}
static STATUS: std::sync::LazyLock<Mutex<UpdateStatus>> = std::sync::LazyLock::new(|| Mutex::new(UpdateStatus::default()));
struct Package { update: Update, bytes: Option<Vec<u8>> }
static PACKAGE: tokio::sync::Mutex<Option<Package>> = tokio::sync::Mutex::const_new(None);
fn publish(app: &AppHandle, change: impl FnOnce(&mut UpdateStatus)) -> UpdateStatus {
    let status = { let mut state = STATUS.lock(); change(&mut state); state.clone() };
    let _ = app.emit("izuki://update-status", &status); status
}
fn failed(app: &AppHandle, error: impl std::fmt::Display) -> String {
    let message = error.to_string();
    publish(app, |s| { s.phase="error".into(); s.error=Some(message.clone()); }); message
}
fn main_only(window: &WebviewWindow) -> Result<(), String> {
    if window.label()=="main" { Ok(()) } else { Err("Open Settings → Updates in the main Izuki window.".into()) }
}
fn install_allowed(expected: &str, actual: &str, ready: bool, busy: bool) -> Result<(), String> {
    if busy { return Err("Finish or stop the current Izuki task/call before installing.".into()); }
    if !ready || expected.is_empty() || expected!=actual { return Err("Download and verify this version before installing it.".into()); }
    Ok(())
}
pub fn check_later(app: &AppHandle) {
    if cfg!(debug_assertions) || std::env::var("IZUKI_SELFTEST").is_ok() { return; }
    let app=app.clone();
    tauri::async_runtime::spawn(async move {
        tokio::time::sleep(Duration::from_secs(30)).await;
        loop {
            if crate::state::store().settings().automatic_update_checks { let _=check(&app).await; }
            tokio::time::sleep(Duration::from_secs(6*60*60)).await;
        }
    });
}
async fn check(app: &AppHandle) -> Result<UpdateStatus,String> {
    let mut package=PACKAGE.try_lock().map_err(|_| "An update operation is already running.".to_string())?;
    if package.as_ref().is_some_and(|p| p.bytes.is_some()) { return Ok(STATUS.lock().clone()); }
    publish(app, |s| { s.phase="checking".into(); s.error=None; });
    let updater=app.updater_builder().timeout(Duration::from_secs(30)).build().map_err(|e| failed(app,e))?;
    let update=updater.check().await.map_err(|e| failed(app,format!("Couldn't check for updates: {e}")))?;
    let version=update.as_ref().map(|u|u.version.clone()).unwrap_or_default();
    *package=update.map(|update|Package{update,bytes:None});
    Ok(publish(app, |s| { s.phase=if version.is_empty(){"current"}else{"available"}.into(); s.version=version; s.checked_at=crate::model::now_ms(); s.downloaded=0; s.total=None; }))
}
#[tauri::command]
pub fn update_status(window: WebviewWindow) -> Result<UpdateStatus,String> { main_only(&window)?; Ok(STATUS.lock().clone()) }
#[tauri::command]
pub async fn check_updates(app: AppHandle, window: WebviewWindow) -> Result<UpdateStatus,String> { main_only(&window)?; check(&app).await }
#[tauri::command]
pub async fn download_update(app: AppHandle, window: WebviewWindow) -> Result<UpdateStatus,String> {
    main_only(&window)?;
    let mut package=PACKAGE.try_lock().map_err(|_| "An update operation is already running.".to_string())?;
    let p=package.as_mut().ok_or("Check for an update first.")?;
    if p.bytes.is_some() { return Ok(publish(&app,|s|{s.phase="ready".into();s.error=None;})); }
    publish(&app,|s|{s.phase="downloading".into();s.error=None;s.downloaded=0;s.total=None;});
    p.update.timeout=Some(Duration::from_secs(10*60));
    let mut received=0u64; let mut tick=Instant::now();
    let bytes=p.update.download(|len,total| {
        received=received.saturating_add(len as u64);
        if tick.elapsed()>=Duration::from_millis(250) {
            publish(&app,|s|{s.downloaded=received;s.total=total;});tick=Instant::now();
        }
    }, ||{}).await.map_err(|e|failed(&app,format!("Download or signature verification failed: {e}")))?;
    let size=bytes.len() as u64; p.bytes=Some(bytes);
    Ok(publish(&app,|s|{s.phase="ready".into();s.downloaded=size;s.total=Some(size);} ))
}
#[tauri::command]
pub async fn install_update(app: AppHandle, window: WebviewWindow, version: String) -> Result<(),String> {
    main_only(&window)?;
    let package=PACKAGE.try_lock().map_err(|_| "An update operation is already running.".to_string())?;
    let p=package.as_ref().ok_or("Download an update first.")?;
    install_allowed(&version,&p.update.version,p.bytes.is_some(),crate::hotkey::is_busy())?;
    publish(&app,|s|{s.phase="installing".into();s.error=None;});
    // Windows exits only after successfully starting the signed installer.
    p.update.install(p.bytes.as_ref().unwrap()).map_err(|e|failed(&app,e))
}
#[cfg(test)] mod tests {
    use super::*;
    #[test] fn install_requires_reviewed_verified_version_and_idle_app() {
        assert!(install_allowed("1.0.22","1.0.22",true,false).is_ok());
        assert!(install_allowed("1.0.22","1.0.22",true,true).is_err());
        assert!(install_allowed("1.0.21","1.0.22",true,false).is_err());
        assert!(install_allowed("1.0.22","1.0.22",false,false).is_err());
        assert!(install_allowed("","",true,false).is_err());
    }
}
