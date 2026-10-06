//! Updates, always straight to the newest version: an old copy never steps
//! through the versions in between. Checks run by themselves; with automatic
//! checks on, a new version downloads in the background and — right after
//! Izuki starts, before you're doing anything — installs itself. Otherwise
//! it waits for "Restart to update". Every download is signature-checked.
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
/// When Izuki started: an update found in the first minutes installs itself.
static STARTED: std::sync::LazyLock<Instant> = std::sync::LazyLock::new(Instant::now);
const QUIET_START: Duration = Duration::from_secs(10 * 60);

pub fn check_later(app: &AppHandle) {
    if cfg!(debug_assertions) || std::env::var("IZUKI_SELFTEST").is_ok() { return; }
    let _ = *STARTED;
    let app=app.clone();
    tauri::async_runtime::spawn(async move {
        // Soon after starting: an old copy (an old installer, a PC that was off
        // for weeks) goes straight to the newest version.
        tokio::time::sleep(Duration::from_secs(8)).await;
        loop {
            if crate::state::store().settings().automatic_update_checks { auto_update(&app).await; }
            tokio::time::sleep(Duration::from_secs(2*60*60)).await;
        }
    });
}

/// Check, download the newest in the background, and install it if Izuki has
/// only just started and isn't busy; otherwise it's ready for "Restart to update".
async fn auto_update(app: &AppHandle) {
    let Ok(status) = check(app).await else { return };
    if status.phase != "available" && status.phase != "ready" { return; }
    let Ok(status) = fetch(app).await else { return };
    if status.phase == "ready" && STARTED.elapsed() < QUIET_START && !crate::hotkey::is_busy() {
        let package = PACKAGE.lock().await;
        if let Some(p) = package.as_ref() {
            if let Some(bytes) = p.bytes.as_ref() {
                publish(app, |s| { s.phase = "installing".into(); s.error = None; });
                if let Err(e) = p.update.install(bytes) { failed(app, e); }
                return;
            }
        }
    }
    if status.phase == "ready" { alert(&status.version); }
}

/// The version downloaded and waiting to be installed, if any.
pub fn ready_version() -> Option<String> {
    let s = STATUS.lock();
    (s.phase == "ready" && !s.version.is_empty()).then(|| s.version.clone())
}

/// Tell you once per version that it's downloaded and ready: on the Island
/// (with Update now) and on your phone.
fn alert(version: &str) {
    static TOLD: Mutex<String> = Mutex::new(String::new());
    if version.is_empty() || *TOLD.lock() == version { return; }
    *TOLD.lock() = version.to_string();
    crate::activity::show_update(version);
    crate::companion::notify_everywhere(&format!("⬆️ Izuki {version} is ready on your PC — open the Island and tap Update now (it takes a few seconds)."));
}

/// "Update now" from the Island: download if needed, then install (unless Izuki is mid-task).
pub async fn install_now(app: AppHandle) -> Result<(), String> {
    if crate::hotkey::is_busy() { return Err("I'm in the middle of something — I'll be ready to update when it's done.".into()); }
    if STATUS.lock().phase != "ready" { fetch(&app).await?; }
    let package = PACKAGE.try_lock().map_err(|_| "An update operation is already running.".to_string())?;
    let p = package.as_ref().ok_or("There's no update waiting.")?;
    let bytes = p.bytes.as_ref().ok_or("The update hasn't finished downloading.")?;
    publish(&app, |s| { s.phase = "installing".into(); s.error = None; });
    p.update.install(bytes).map_err(|e| failed(&app, e))
}

/// Ask for the newest version. A download already held for an older one is
/// dropped — there's no point installing a version that's already been replaced.
async fn check(app: &AppHandle) -> Result<UpdateStatus,String> {
    let mut package=PACKAGE.try_lock().map_err(|_| "An update operation is already running.".to_string())?;
    refresh(app, &mut package).await
}
async fn refresh(app: &AppHandle, package: &mut Option<Package>) -> Result<UpdateStatus,String> {
    publish(app, |s| { s.phase="checking".into(); s.error=None; });
    let updater=app.updater_builder().timeout(Duration::from_secs(30)).build().map_err(|e| failed(app,e))?;
    let update=updater.check().await.map_err(|e| failed(app,format!("Couldn't check for updates: {e}")))?;
    let version=update.as_ref().map(|u|u.version.clone()).unwrap_or_default();
    let held=package.as_ref().filter(|p| p.bytes.is_some() && p.update.version==version).is_some();
    if !held { *package=update.map(|update|Package{update,bytes:None}); }
    let (phase, size)=match package.as_ref() {
        None => ("current", 0),
        Some(p) => match &p.bytes { Some(b) => ("ready", b.len() as u64), None => ("available", 0) },
    };
    Ok(publish(app, |s| { s.phase=phase.into(); s.version=version; s.checked_at=crate::model::now_ms(); s.downloaded=size; s.total=if size>0 {Some(size)} else {None}; }))
}

/// Download (and verify) the version found, if it isn't already.
async fn fetch(app: &AppHandle) -> Result<UpdateStatus,String> {
    let mut package=PACKAGE.try_lock().map_err(|_| "An update operation is already running.".to_string())?;
    let p=package.as_mut().ok_or("Check for an update first.")?;
    if p.bytes.is_some() { return Ok(publish(app,|s|{s.phase="ready".into();s.error=None;})); }
    publish(app,|s|{s.phase="downloading".into();s.error=None;s.downloaded=0;s.total=None;});
    p.update.timeout=Some(Duration::from_secs(10*60));
    let mut received=0u64; let mut tick=Instant::now();
    let bytes=p.update.download(|len,total| {
        received=received.saturating_add(len as u64);
        if tick.elapsed()>=Duration::from_millis(250) {
            publish(app,|s|{s.downloaded=received;s.total=total;});tick=Instant::now();
        }
    }, ||{}).await.map_err(|e|failed(app,format!("Download or signature verification failed: {e}")))?;
    let size=bytes.len() as u64; p.bytes=Some(bytes);
    Ok(publish(app,|s|{s.phase="ready".into();s.downloaded=size;s.total=Some(size);} ))
}
#[tauri::command]
pub fn update_status(window: WebviewWindow) -> Result<UpdateStatus,String> { main_only(&window)?; Ok(STATUS.lock().clone()) }
#[tauri::command]
pub async fn check_updates(app: AppHandle, window: WebviewWindow) -> Result<UpdateStatus,String> { main_only(&window)?; check(&app).await }
#[tauri::command]
pub async fn download_update(app: AppHandle, window: WebviewWindow) -> Result<UpdateStatus,String> {
    main_only(&window)?;
    // The newest, not whatever was found hours ago.
    { let mut package=PACKAGE.try_lock().map_err(|_| "An update operation is already running.".to_string())?; let _=refresh(&app,&mut package).await; }
    fetch(&app).await
}
#[tauri::command]
pub async fn install_update(app: AppHandle, window: WebviewWindow, version: String) -> Result<(),String> {
    main_only(&window)?;
    // One last look: if an even newer version came out since the download,
    // get that and install it instead of making you update twice.
    let mut version=version;
    {
        let mut package=PACKAGE.try_lock().map_err(|_| "An update operation is already running.".to_string())?;
        let before=package.as_ref().map(|p|p.update.version.clone()).unwrap_or_default();
        if refresh(&app,&mut package).await.is_ok() {
            let now=package.as_ref().map(|p|p.update.version.clone()).unwrap_or_default();
            if !now.is_empty() && now!=before && before==version { version=now; }
        }
    }
    if STATUS.lock().phase!="ready" { fetch(&app).await?; }
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
