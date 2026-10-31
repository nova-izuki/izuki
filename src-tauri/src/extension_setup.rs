//! Prepare our bundled extension; the browser still owns its installation prompt.
use anyhow::{anyhow, Result};
use serde::Serialize;
use std::{io::{Cursor, Read}, path::{Path, PathBuf}};

const ARCHIVE: &[u8] = include_bytes!("../../docs/extension/izuki-extension.zip");
static SETUP: std::sync::Mutex<()> = std::sync::Mutex::new(());

#[derive(Serialize)]
pub struct Browser { pub id: &'static str, pub name: &'static str }
#[derive(Serialize)]
pub struct Prepared { pub folder: String, pub version: String, pub opened: bool }

fn candidates(id: &str) -> Vec<PathBuf> {
    let relative: &[&str] = match id {
        "chrome" => &[r"Google\Chrome\Application\chrome.exe"],
        "edge" => &[r"Microsoft\Edge\Application\msedge.exe"],
        "brave" => &[r"BraveSoftware\Brave-Browser\Application\brave.exe"],
        "vivaldi" => &[r"Vivaldi\Application\vivaldi.exe"],
        "opera" => &[r"Programs\Opera\opera.exe", r"Opera\opera.exe", r"Opera\launcher.exe"],
        _ => return vec![],
    };
    ["LOCALAPPDATA", "ProgramFiles", "ProgramFiles(x86)"].into_iter()
        .filter_map(std::env::var_os)
        .flat_map(|base| relative.iter().map(move |path| PathBuf::from(&base).join(path))).collect()
}

pub fn browsers() -> Vec<Browser> {
    [("chrome", "Chrome"), ("edge", "Microsoft Edge"), ("brave", "Brave"), ("vivaldi", "Vivaldi"), ("opera", "Opera")]
        .into_iter().filter(|(id, _)| candidates(id).iter().any(|p| p.is_file()))
        .map(|(id, name)| Browser { id, name }).collect()
}

fn unpack(bytes: &[u8], destination: &Path) -> Result<String> {
    let mut zip = zip::ZipArchive::new(Cursor::new(bytes))?;
    if zip.len() > 100 || zip.len() == 0 { return Err(anyhow!("The bundled extension is incomplete. Update Izuki and try again.")); }
    let mut total = 0u64;
    for i in 0..zip.len() {
        let mut entry = zip.by_index(i)?;
        let enclosed = entry.enclosed_name().ok_or_else(|| anyhow!("The extension contains an unsafe path."))?;
        // The shipped zip keeps its files at the root (Windows' "Extract All"
        // names the folder after the zip, so a wrapper folder put every file
        // one level too deep to load). An older zip with the wrapper is still
        // read, so an update never disagrees with the archive it replaces.
        let relative = enclosed.strip_prefix("izuki-extension").unwrap_or(enclosed.as_path());
        if relative.as_os_str().is_empty() { continue; }
        if entry.unix_mode().is_some_and(|m| m & 0o170000 == 0o120000) { return Err(anyhow!("The extension contains an unsafe link.")); }
        total = total.checked_add(entry.size()).ok_or_else(|| anyhow!("The extension is too large."))?;
        if total > 10 * 1024 * 1024 { return Err(anyhow!("The extension is too large.")); }
        let path = destination.join(relative);
        if entry.is_dir() { std::fs::create_dir_all(&path)?; continue; }
        if let Some(parent) = path.parent() { std::fs::create_dir_all(parent)?; }
        let mut data = Vec::new();
        entry.by_ref().take(10 * 1024 * 1024 + 1).read_to_end(&mut data)?;
        if data.len() as u64 != entry.size() { return Err(anyhow!("The extension file is incomplete.")); }
        std::fs::write(path, data)?;
    }
    let manifest: serde_json::Value = serde_json::from_slice(&std::fs::read(destination.join("manifest.json"))?)?;
    let version = manifest["version"].as_str().ok_or_else(|| anyhow!("The extension version is missing."))?;
    if manifest["manifest_version"] != 3 || !destination.join("background.js").is_file() || !destination.join("sidepanel.html").is_file() {
        return Err(anyhow!("The bundled extension is incomplete."));
    }
    Ok(version.to_string())
}

fn plain_directory(path: &Path) -> bool {
    let Ok(meta) = std::fs::symlink_metadata(path) else { return false; };
    if !meta.is_dir() || meta.file_type().is_symlink() { return false; }
    #[cfg(windows)] {
        use std::os::windows::fs::MetadataExt;
        if meta.file_attributes() & 0x400 != 0 { return false; }
    }
    true
}

fn cleanup_generated(parent: &Path, path: &Path) {
    let Some(name) = path.file_name().and_then(|s| s.to_str()) else { return; };
    let token = name.strip_prefix("BrowserExtension.stage-").or_else(|| name.strip_prefix("BrowserExtension.previous-"));
    if !token.is_some_and(|s| uuid::Uuid::parse_str(s).is_ok()) || !plain_directory(path) { return; }
    let (Ok(base), Ok(resolved)) = (parent.canonicalize(), path.canonicalize()) else { return; };
    if resolved.parent() != Some(base.as_path()) { return; }
    fn no_links(path: &Path, remaining: &mut usize) -> bool {
        if *remaining == 0 { return false; }
        *remaining -= 1;
        let Ok(meta) = std::fs::symlink_metadata(path) else { return false; };
        if meta.file_type().is_symlink() { return false; }
        #[cfg(windows)] {
            use std::os::windows::fs::MetadataExt;
            if meta.file_attributes() & 0x400 != 0 { return false; }
        }
        if meta.is_dir() {
            let Ok(entries) = std::fs::read_dir(path) else { return false; };
            for entry in entries { if !entry.is_ok_and(|e| no_links(&e.path(), remaining)) { return false; } }
        }
        true
    }
    if no_links(&resolved, &mut 1000) { let _ = std::fs::remove_dir_all(&resolved); }
}

pub fn prepare(id: &str) -> Result<Prepared> {
    let _lock = SETUP.lock().unwrap_or_else(|e| e.into_inner());
    let executable = candidates(id).into_iter().find(|p| p.is_file()).ok_or_else(|| anyhow!("Choose an installed Chrome, Edge, Brave, Vivaldi or Opera browser."))?;
    let parent = dirs::data_local_dir().ok_or_else(|| anyhow!("Windows couldn't find your app folder."))?.join("Izuki");
    if parent.exists() && !plain_directory(&parent) { return Err(anyhow!("The Izuki setup folder is a link. Choose the normal desktop installation.")); }
    std::fs::create_dir_all(&parent)?;
    let target = parent.join("BrowserExtension");
    if target.exists() && !plain_directory(&target) { return Err(anyhow!("The extension setup folder is a link. Choose the normal desktop installation.")); }
    let token = uuid::Uuid::new_v4();
    let stage = parent.join(format!("BrowserExtension.stage-{token}"));
    std::fs::create_dir(&stage)?;
    let version = match unpack(ARCHIVE, &stage) {
        Ok(version) => version,
        Err(error) => { cleanup_generated(&parent, &stage); return Err(error); }
    };
    let backup = parent.join(format!("BrowserExtension.previous-{token}"));
    if target.exists() {
        if let Err(error) = std::fs::rename(&target, &backup) { cleanup_generated(&parent, &stage); return Err(error.into()); }
    }
    if let Err(error) = std::fs::rename(&stage, &target) {
        if backup.exists() { let _ = std::fs::rename(&backup, &target); }
        cleanup_generated(&parent, &stage);
        return Err(error.into());
    }
    cleanup_generated(&parent, &backup);
    // Only a browser page is opened. No profiles, policies or preferences are edited.
    let url = if id == "edge" { "edge://extensions/" } else if id == "brave" { "brave://extensions/" } else if id == "vivaldi" { "vivaldi://extensions/" } else if id == "opera" { "opera://extensions/" } else { "chrome://extensions/" };
    let opened = std::process::Command::new(executable).arg(url).spawn().is_ok();
    Ok(Prepared { folder: target.to_string_lossy().into_owned(), version, opened })
}

#[cfg(test)]
mod tests {
    use super::*;
    /// Removes a folder this test created, even when an assertion fails.
    /// Only ever pointed at a scratch path built from a fresh UUID.
    struct Scratch(PathBuf);
    impl Drop for Scratch {
        fn drop(&mut self) { let _ = std::fs::remove_dir_all(&self.0); }
    }
    #[test]
    fn bundled_extension_is_complete_and_extracts_in_one_folder() {
        let parent = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../.work");
        std::fs::create_dir_all(&parent).unwrap();
        let destination = parent.join(format!("extension-setup-test-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir(&destination).unwrap();
        let _scratch = Scratch(destination.clone());
        let version = unpack(ARCHIVE, &destination).unwrap();
        assert!(version.split('.').all(|p| p.parse::<u32>().is_ok()));
        assert!(destination.join("connect.js").is_file());
        assert!(destination.join("providers.js").is_file());
    }
    #[test]
    fn browser_choice_cannot_be_a_path_or_command() {
        assert!(candidates("chrome --disable-security").is_empty());
        assert!(candidates(r"C:\somewhere\app.exe").is_empty());
        assert!(candidates("firefox").is_empty());
    }
    #[test]
    fn cleanup_only_removes_our_unique_generated_directories() {
        let parent = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join(format!("../.work/setup-cleanup-test-{}", uuid::Uuid::new_v4()));
        let _scratch = Scratch(parent.clone());
        let target = parent.join("BrowserExtension");
        std::fs::create_dir_all(&target).unwrap();
        std::fs::write(target.join("keep.txt"), "keep the live extension").unwrap();
        let stage = parent.join(format!("BrowserExtension.stage-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir(&stage).unwrap();
        std::fs::write(stage.join("generated.txt"), "temporary bundle").unwrap();
        cleanup_generated(&parent, &target);
        assert!(target.join("keep.txt").exists());
        cleanup_generated(&parent, &stage);
        assert!(!stage.exists());
        assert!(target.join("keep.txt").exists());
    }
}
