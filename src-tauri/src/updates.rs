//! Automatic checks, explicit downloads and installation. Every downloaded
//! update is signature-checked; a timer never installs or closes Izuki.
use std::time::{Duration, Instant};
use parking_lot::Mutex;
use serde::Serialize;
use tauri::{AppHandle, Emitter, WebviewWindow};
use tauri_plugin_updater::{Update, UpdaterExt};

#[derive(Clone, Default, Serialize)]
pub struct UpdateStatus {
    pub phase: String, pub version: String, pub downloaded: u64,
    pub total: Option<u64>, pub checked_at: i64, pub error: Option<String>,
    /// The newest published release below this one, once looked up: the
    /// version Settings → Updates offers "go back" to.
    pub rollback: Option<String>,
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
        // Soon after startup, then every hour by the clock on the wall — a PC
        // that slept through the hour checks once it wakes. A check that
        // failed (Wi-Fi not up yet right after Windows starts) tries again in
        // a few minutes, not an hour later: that left updates unseen until
        // "Check now" was clicked.
        tokio::time::sleep(Duration::from_secs(20)).await;
        let mut next = 0i64;
        let mut failures = 0usize;
        loop {
            if crate::model::now_ms() >= next && crate::state::store().settings().automatic_update_checks {
                let ok = auto_update(&app).await;
                failures = if ok { 0 } else { failures + 1 };
                next = crate::model::now_ms() + retry_minutes(failures) * 60_000;
            }
            tokio::time::sleep(Duration::from_secs(60)).await;
        }
    });
}

/// Minutes to the next automatic check after `failures` failed ones in a row.
fn retry_minutes(failures: usize) -> i64 {
    if failures == 0 { 60 } else { [2, 5, 10, 30, 60][(failures - 1).min(4)] }
}

/// Automatic checks may notify; downloading/installing requires a user action.
/// Whether the check itself worked.
async fn auto_update(app: &AppHandle) -> bool {
    match check(app).await {
        Ok(status) if status.phase == "available" || status.phase == "ready" => {
            alert(app, &status.version);
            true
        }
        Ok(_) => {
            eprintln!("[update] checked: {} is the newest", env!("CARGO_PKG_VERSION"));
            true
        }
        Err(e) => {
            eprintln!("[update] automatic check failed: {e}");
            false
        }
    }
}

/// The version downloaded and waiting to be installed, if any.
pub fn ready_version() -> Option<String> {
    let s = STATUS.lock();
    (s.phase == "ready" && !s.version.is_empty()).then(|| s.version.clone())
}

/// The update currently worth showing, and whether its signed bytes are ready.
pub fn offered_version() -> Option<(String, bool)> {
    let s = STATUS.lock();
    matches!(s.phase.as_str(), "available" | "ready")
        .then(|| (s.version.clone(), s.phase == "ready"))
        .filter(|(version, _)| !version.is_empty())
}

/// Tell you once per version that an update is available — where you'll
/// see it without going to look: a Windows notification, and the Island's
/// pill (whenever nothing else is on it) until it's installed.
fn alert(app: &AppHandle, version: &str) {
    static TOLD: Mutex<String> = Mutex::new(String::new());
    if version.is_empty() || *TOLD.lock() == version { return; }
    *TOLD.lock() = version.to_string();
    eprintln!("[update] {version} is available (you have {})", env!("CARGO_PKG_VERSION"));
    crate::activity::show_update(version);
    {
        use tauri_plugin_notification::NotificationExt;
        if let Err(e) = app
            .notification()
            .builder()
            .title(format!("Izuki {version} is out"))
            .body("Hover over the Island at the top of your screen (or open Settings \u{2192} Updates) to download and install it.")
            .show()
        {
            eprintln!("[update] Windows notification failed: {e}");
        }
    }
    crate::companion::notify_everywhere(&format!("⬆️ Izuki {version} is available — open Settings → Updates on your PC to review, download and install it."));
}

/// "Update now" from the Island: download if needed, then install (unless Izuki is mid-task).
pub async fn install_now(app: AppHandle) -> Result<(), String> {
    if crate::hotkey::is_busy() { return Err("I'm in the middle of something — I'll be ready to update when it's done.".into()); }
    if STATUS.lock().phase != "ready" { fetch(&app).await?; }
    let package = PACKAGE.try_lock().map_err(|_| "An update operation is already running.".to_string())?;
    let p = package.as_ref().ok_or("There's no update waiting.")?;
    let bytes = p.bytes.as_ref().ok_or("The update hasn't finished downloading.")?;
    // A task may have started while the download was in progress.
    install_allowed(&p.update.version, &p.update.version, true, crate::hotkey::is_busy())?;
    publish(&app, |s| { s.phase = "installing".into(); s.error = None; });
    p.update.install(bytes).map_err(|e| failed(&app, e))
}

/// A version tag or number ("v1.0.195", "1.0.195") as numbers, for ordering
/// releases. Malformed tags read as (0,0,0), which can never be newest.
fn parts(v: &str) -> (u64, u64, u64) {
    let digits: Vec<u64> = v
        .trim()
        .strip_prefix('v')
        .unwrap_or(v)
        .split('.')
        .map(|p| p.chars().take_while(|c| c.is_ascii_digit()).collect::<String>())
        .filter_map(|p| p.parse().ok())
        .collect();
    (digits.first().copied().unwrap_or(0), digits.get(1).copied().unwrap_or(0), digits.get(2).copied().unwrap_or(0))
}

/// The previous published release: its version and the URL of its signed
/// updater manifest. Releases are taken newest first from GitHub (public
/// releases only), and the first one strictly older than this build wins —
/// that is exactly where "go back to the previous version" should land.
async fn previous_release() -> Result<Option<(String, String)>, String> {
    let current = parts(env!("CARGO_PKG_VERSION"));
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(15))
        .user_agent("izuki")
        .build()
        .map_err(|e| e.to_string())?;
    let text = client
        .get("https://api.github.com/repos/nova-izuki/izuki/releases?per_page=30")
        .send()
        .await
        .map_err(|e| e.to_string())?
        .text()
        .await
        .map_err(|e| e.to_string())?;
    let list: serde_json::Value = serde_json::from_str(&text).map_err(|e| format!("the release list wasn't JSON: {e}"))?;
    let releases = list.as_array().ok_or("the release list wasn't a list")?;
    let mut best: Option<&serde_json::Value> = None;
    for r in releases {
        if r["draft"].as_bool().unwrap_or(false) || r["prerelease"].as_bool().unwrap_or(false) { continue; }
        let tag = r["tag_name"].as_str().unwrap_or_default();
        if parts(tag) < current && best.as_ref().map(|b| parts(tag) > parts(b["tag_name"].as_str().unwrap_or_default())).unwrap_or(true) {
            best = Some(r);
        }
    }
    let chosen = match best { Some(r) => r, None => return Ok(None) };
    let version = chosen["tag_name"].as_str().unwrap_or_default().trim_start_matches('v').to_string();
    let manifest = chosen["assets"].as_array().ok_or("the release has no assets")?
        .iter()
        .find(|a| a["name"].as_str().is_some_and(|n| n.eq_ignore_ascii_case("latest.json")))
        .and_then(|a| a["browser_download_url"].as_str())
        .ok_or("the previous release has no signed updater manifest to reinstall from")?;
    Ok(Some((version, manifest.to_string())))
}

/// The version Settings → Updates will offer to go back to, after this lookup.
#[tauri::command]
pub async fn check_rollback(app: AppHandle, window: WebviewWindow) -> Result<UpdateStatus, String> {
    main_only(&window)?;
    let looked = previous_release().await;
    let status = publish(&app, |s| match looked.as_ref() {
        Ok(Some((version, _))) => { s.rollback = Some(version.clone()); s.error = None; }
        Ok(None) => { s.rollback = None; }
        Err(e) => { s.rollback = None; s.error = Some(format!("I couldn't look up the previous release: {e}")); }
    });
    Ok(status)
}

/// "Go back to the previous version": the previous release's own signed
/// updater manifest is fetched from GitHub, the installer is downloaded and
/// checked against the same key this build was born with, and only then run —
/// the same three steps, and the same signature, as a normal update. The
/// updater itself refuses to go down; here going down is the point.
#[tauri::command]
pub async fn rollback_previous(app: AppHandle, window: WebviewWindow) -> Result<(), String> {
    main_only(&window)?;
    if crate::hotkey::is_busy() { return Err("I'm in the middle of something — I can go back when it's done.".into()); }
    let (previous, manifest) = previous_release().await?.ok_or("There's no older published version to go back to.")?;
    {
        let s = STATUS.lock();
        if matches!(s.phase.as_str(), "downloading" | "rollback-downloading" | "installing") {
            return Err("An update operation is already running.".into());
        }
    }
    publish(&app, |s| { s.phase = "rollback-downloading".into(); s.version = previous.clone(); s.downloaded = 0; s.total = None; s.error = None; });
    let run = async {
        let url = reqwest::Url::parse(&manifest).map_err(|e| e.to_string())?;
        let updater = app
            .updater_builder()
            .endpoints(vec![url])
            .map_err(|e| e.to_string())?
            .version_comparator(|_current, remote| remote.version < _current)
            .build()
            .map_err(|e| e.to_string())?;
        let progress = app.clone();
        let update = updater
            .check()
            .await
            .map_err(|e| format!("I couldn't read the previous release's manifest: {e}"))?
            .ok_or("That release has no signed installer for this PC (it may predate the signature key).")?;
        let bytes = update
            .download(
                move |chunk, total| {
                    publish(&progress, |s| { s.downloaded = s.downloaded.wrapping_add(chunk as u64); s.total = total; });
                },
                || {},
            )
            .await
            .map_err(|e| format!("The installer didn't finish downloading: {e}"))?;
        // A task may have started while the download was in progress.
        if crate::hotkey::is_busy() { return Err("I'm in the middle of something — the installer wasn't run. Try again when I'm idle.".to_string()); }
        publish(&app, |s| { s.phase = "installing".into(); s.total = None; });
        update.install(bytes).map_err(|e| failed(&app, e))
    }
    .await;
    if let Err(e) = run { let msg: String = e.into(); publish(&app, |s| { s.phase = "error".into(); s.error = Some(msg.clone()); }); return Err(msg); }
    Ok(())
}

/// Ask for the newest version. A download already held for an older one is
/// dropped — there's no point installing a version that's already been replaced.
async fn check(app: &AppHandle) -> Result<UpdateStatus,String> {
    let mut package=PACKAGE.try_lock().map_err(|_| "An update operation is already running.".to_string())?;
    refresh(app, &mut package).await
}
async fn refresh(app: &AppHandle, package: &mut Option<Package>) -> Result<UpdateStatus,String> {
    publish(app, |s| { s.phase="checking".into(); s.error=None; });
    // The installer starts, then Izuki ends at once (process::exit). Put the
    // volume back and hang up a call first, the way a normal quit does, so
    // nothing is left half-done; the installer then waits for izuki.exe to
    // be free before copying (windows/hooks.nsh).
    let updater=app.updater_builder().timeout(Duration::from_secs(30))
        .on_before_exit(|| { eprintln!("[update] closing for the installer"); crate::duck::restore_now(); crate::call::stop(); })
        .build().map_err(|e| failed(app,e))?;
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
    // Install exactly the verified version the person reviewed. A newer
    // release must be downloaded and confirmed, not substituted silently.
    let package=PACKAGE.try_lock().map_err(|_| "An update operation is already running.".to_string())?;
    let p=package.as_ref().ok_or("Download an update first.")?;
    install_allowed(&version,&p.update.version,p.bytes.is_some(),crate::hotkey::is_busy())?;
    publish(&app,|s|{s.phase="installing".into();s.error=None;});
    // Windows exits only after successfully starting the signed installer.
    p.update.install(p.bytes.as_ref().unwrap()).map_err(|e|failed(&app,e))
}
#[cfg(test)] mod tests {
    use super::*;
    #[test] fn the_previous_release_is_the_newest_one_below_this_build() {
        assert_eq!(parts("1.0.195"), (1, 0, 195));
        assert_eq!(parts("v1.0.195"), (1, 0, 195));
        assert_eq!(parts("1.0.196-rc1"), (1, 0, 196), "build junk after the patch number is ignored");
        assert_eq!(parts("nope"), (0, 0, 0));
        // The picker itself is index logic over sorted results; this is its rule.
        let mut older: Vec<&str> = vec!["v1.0.172", "v1.0.193", "v1.0.159", "v1.0.195"];
        older.sort_by_key(|t| std::cmp::Reverse(parts(t)));
        assert_eq!(older[0], "v1.0.195", "newest below 1.0.196 wins");
        assert_eq!(parts("just breaking"), (0, 0, 0), "a broken tag is never the newest");
        assert!(parts("just breaking") < parts("1.0.159"), "and loses to every real release");
    }

    #[test] fn a_failed_check_tries_again_soon() {
        assert_eq!(retry_minutes(0), 60);
        assert_eq!(retry_minutes(1), 2);
        assert_eq!(retry_minutes(2), 5);
        assert_eq!(retry_minutes(9), 60);
    }
    #[test] fn install_requires_reviewed_verified_version_and_idle_app() {
        assert!(install_allowed("1.0.22","1.0.22",true,false).is_ok());
        assert!(install_allowed("1.0.22","1.0.22",true,true).is_err());
        assert!(install_allowed("1.0.21","1.0.22",true,false).is_err());
        assert!(install_allowed("1.0.22","1.0.22",false,false).is_err());
        assert!(install_allowed("","",true,false).is_err());
    }
}
