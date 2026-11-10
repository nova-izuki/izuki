//! Your data, all of it: "Take a copy of my data" and "Erase everything".
//!
//! Everything Izuki keeps about you is in `%APPDATA%\Izuki` (memories, notes,
//! chats, routines, reminders, settings, logs, the "What Izuki did" list) and
//! in its window's own storage (chat history). Nothing is kept on a server.
//!
//! - **Copy:** one .zip in Downloads with all of it, readable JSON and text,
//!   plus a README saying what's inside. Never your keys or passwords: every
//!   key in a settings file is replaced by "[removed]", and Izuki's own
//!   secrets aren't copied at all. Downloaded AI models aren't data, so they
//!   stay out too.
//! - **Erase:** wipes it all, the next time Izuki starts, before anything
//!   has loaded (a running Izuki holds some of it in memory and would write
//!   it back). Izuki closes, starts again by itself, erases, and opens fresh.
//!   Kept: downloaded AI models and tools, and what's needed to undo
//!   changes to Windows (looks, tweaks, services), which are about the PC,
//!   not you. Your AI keys only if you ask to keep them.

use std::io::Write;
use std::path::{Path, PathBuf};

use anyhow::{anyhow, Context, Result};
use serde::{Deserialize, Serialize};
use serde_json::Value;

/// Folders in the data folder that are downloads or tools, not your data.
const NOT_DATA_DIRS: &[&str] = &["models", "bin", "elevated", "wakewords", "workspaces", "looks"];
/// Izuki's own secrets: never copied.
const SECRET_FILES: &[&str] = &["bridge-key"];
/// Kept by Erase: what puts Windows back the way it was.
const UNDO_FILES: &[&str] = &["looks.json", "services-undo.json", "tweak-packs-undo.json"];
/// The biggest single file put in the copy, and the whole copy.
const MOST_PER_FILE: u64 = 25 * 1024 * 1024;
const MOST_IN_ALL: u64 = 400 * 1024 * 1024;

const MARKER: &str = "erase-pending.json";

fn data() -> PathBuf {
    crate::store::data_dir()
}

/// Fields whose whole value is private though the name doesn't say so: a
/// TV's pairing pass, private calendar links, webhook addresses.
const SECRET_NAMES: &[&str] = &["tv_pair", "school_feeds", "n8n_hooks"];

/// A field that holds a key, token, password or pairing code ("api_key",
/// "telegram_token", "roku_dev_password", "call_token", "tv_pair") — not
/// "hotkey_draw".
fn is_secret_field(name: &str) -> bool {
    let lower = name.to_ascii_lowercase();
    SECRET_NAMES.contains(&lower.as_str()) || lower.split(|c: char| c == '_' || c == '-' || c == '.').any(|part| matches!(part, "key" | "token" | "password" | "pass" | "secret" | "code" | "pin"))
}

/// The same JSON, with every secret field's value replaced.
fn without_secrets(v: &mut Value) {
    match v {
        Value::Object(map) => {
            for (k, val) in map.iter_mut() {
                let empty = matches!(val, Value::Null | Value::Bool(_)) || val.as_str() == Some("") || val.as_array().is_some_and(|a| a.is_empty());
                if is_secret_field(k) && !empty {
                    *val = Value::String("[removed]".into());
                } else {
                    without_secrets(val);
                }
            }
        }
        Value::Array(items) => items.iter_mut().for_each(without_secrets),
        _ => {}
    }
}

/// A settings file (settings.json and its backups) carries keys.
fn is_settings_file(name: &str) -> bool {
    name.starts_with("settings") && name.ends_with(".json")
}

/// Every file in the data folder that belongs in a copy, with its path
/// inside the folder.
fn files_for_copy(root: &Path) -> Vec<(PathBuf, String)> {
    let mut out = Vec::new();
    let mut stack = vec![root.to_path_buf()];
    while let Some(dir) = stack.pop() {
        let Ok(read) = std::fs::read_dir(&dir) else { continue };
        for e in read.flatten() {
            let path = e.path();
            let Ok(rel) = path.strip_prefix(root) else { continue };
            let rel = rel.to_string_lossy().replace('\\', "/");
            let top = rel.split('/').next().unwrap_or("");
            let Ok(kind) = e.file_type() else { continue };
            // Never follow a link out of the folder.
            if kind.is_symlink() {
                continue;
            }
            if kind.is_dir() {
                if !NOT_DATA_DIRS.contains(&top) && top != "vision" {
                    stack.push(path);
                }
                continue;
            }
            // Never the copy being written.
            if SECRET_FILES.contains(&rel.as_str()) || rel == MARKER || rel.ends_with(".part") {
                continue;
            }
            out.push((path, rel));
        }
    }
    out.sort_by(|a, b| a.1.cmp(&b.1));
    out
}

/// Make the copy: a .zip in Downloads. `app_data` is the window's own
/// storage (chat history and the like), already without secrets.
pub fn export(app_data: Option<Value>) -> Result<PathBuf> {
    let root = data();
    let folder = dirs::download_dir().or_else(dirs::desktop_dir).unwrap_or_else(|| root.clone());
    let name = format!("Izuki data {}.zip", chrono::Local::now().format("%Y-%m-%d %H%M"));
    let out = folder.join(name);
    write_zip(&root, &out, app_data)?;
    crate::actlog::record("files", &format!("Made a copy of your Izuki data in {}", folder.display()));
    Ok(out)
}

fn write_zip(root: &Path, out: &Path, app_data: Option<Value>) -> Result<()> {
    use zip::write::SimpleFileOptions;
    let partial = out.with_extension("zip.part");
    let file = std::fs::File::create(&partial).with_context(|| format!("couldn't make {}", partial.display()))?;
    let mut zip = zip::ZipWriter::new(file);
    let opts = SimpleFileOptions::default().compression_method(zip::CompressionMethod::Deflated);
    let mut total = 0u64;
    let mut left_out: Vec<String> = Vec::new();
    let mut put = 0usize;
    for (path, rel) in files_for_copy(root) {
        let size = std::fs::metadata(&path).map(|m| m.len()).unwrap_or(0);
        if size > MOST_PER_FILE || total + size > MOST_IN_ALL {
            left_out.push(format!("{rel} (too big for the copy: {} MB)", size / 1024 / 1024));
            continue;
        }
        let Ok(bytes) = std::fs::read(&path) else {
            left_out.push(format!("{rel} (in use, couldn't be read)"));
            continue;
        };
        let bytes = if is_settings_file(rel.rsplit('/').next().unwrap_or(&rel)) {
            match serde_json::from_slice::<Value>(&bytes) {
                Ok(mut v) => {
                    without_secrets(&mut v);
                    serde_json::to_vec_pretty(&v)?
                }
                // A settings file that isn't JSON could hold anything: left out.
                Err(_) => {
                    left_out.push(format!("{rel} (couldn't be read safely)"));
                    continue;
                }
            }
        } else {
            bytes
        };
        total += bytes.len() as u64;
        zip.start_file(format!("Izuki/{rel}"), opts)?;
        zip.write_all(&bytes)?;
        put += 1;
    }
    if let Some(mut v) = app_data {
        without_secrets(&mut v);
        zip.start_file("Izuki/app-window-data.json", opts)?;
        zip.write_all(&serde_json::to_vec_pretty(&v)?)?;
        put += 1;
    }
    zip.start_file("README.txt", opts)?;
    zip.write_all(readme(put, &left_out).as_bytes())?;
    zip.finish()?;
    std::fs::rename(&partial, out).with_context(|| format!("couldn't save {}", out.display()))?;
    Ok(())
}

fn readme(put: usize, left_out: &[String]) -> String {
    let mut s = format!(
        "Your Izuki data, copied {}\r\n\r\n\
         This is everything Izuki keeps about you on this PC ({put} files): memories, notes, chats,\r\n\
         routines, reminders, research, the \"What Izuki did\" list, settings and logs. The files are\r\n\
         JSON and plain text, so any text editor opens them. app-window-data.json is what Izuki's\r\n\
         window keeps (your chat history and the like).\r\n\r\n\
         Left out on purpose:\r\n\
         - Your keys, tokens and passwords: in every settings file they read \"[removed]\".\r\n\
         - Izuki's own secrets (the key it signs its messages with).\r\n\
         - Downloaded AI models, tools and wallpapers: those are downloads, not your data.\r\n\r\n\
         Izuki keeps nothing about you on a server. Accounts you linked through Composio (like\r\n\
         Gmail) stay linked there until you remove them in Izuki (Apps → Inbox) or at composio.dev.\r\n",
        chrono::Local::now().format("%A %-d %B %Y, %H:%M")
    );
    if !left_out.is_empty() {
        s.push_str("\r\nAlso left out:\r\n");
        for l in left_out {
            s.push_str(&format!("- {l}\r\n"));
        }
    }
    s
}

#[derive(Debug, Serialize, Deserialize)]
struct Pending {
    /// The Izuki that asked; the erase waits for it to close.
    pid: u32,
    keep_keys: bool,
}

/// Erase everything: remembered now, done as Izuki starts again (it closes
/// and starts again by itself right after this).
pub fn ask_to_erase(keep_keys: bool) -> Result<()> {
    let root = data();
    std::fs::create_dir_all(&root)?;
    let p = Pending { pid: std::process::id(), keep_keys };
    std::fs::write(root.join(MARKER), serde_json::to_vec(&p)?).context("couldn't save the request to erase")?;
    eprintln!("[mydata] erase asked for (keep keys: {keep_keys}); closing to erase at the next start");
    // A fresh Izuki, which waits for this one to close and then erases.
    let exe = match std::env::current_exe() {
        Ok(exe) => exe,
        Err(e) => {
            let _ = std::fs::remove_file(root.join(MARKER));
            return Err(anyhow!("couldn't find Izuki to start it again ({e}); nothing was erased"));
        }
    };
    let mut c = std::process::Command::new(exe);
    c.stdin(std::process::Stdio::null()).stdout(std::process::Stdio::null()).stderr(std::process::Stdio::null());
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const DETACHED_PROCESS: u32 = 0x0000_0008;
        c.creation_flags(DETACHED_PROCESS);
    }
    if let Err(e) = c.spawn() {
        // Nothing erased, and nothing left waiting to surprise you at the next start.
        let _ = std::fs::remove_file(root.join(MARKER));
        return Err(anyhow!("couldn't start Izuki again to erase ({e}); nothing was erased"));
    }
    Ok(())
}

/// The fields of settings.json that are your keys (kept when asked).
const KEY_FIELDS: &[&str] = &[
    "providers", "active_provider", "fallback_provider", "groq_api_key", "elevenlabs_key", "azure_speech_key", "azure_speech_region", "composio_api_key",
    "composio_user_id", "telegram_token", "telegram_chat_id", "discord_token", "discord_user_id", "stripe_key", "shopify_store", "shopify_token", "n8n_url",
    "n8n_api_key",
];

/// Runs first thing at start, before the log, settings or windows: if an
/// erase was asked for, wait for the Izuki that asked to close, then wipe.
pub fn erase_if_asked() {
    let root = data();
    let marker = root.join(MARKER);
    let Ok(raw) = std::fs::read(&marker) else { return };
    let pending: Pending = serde_json::from_slice(&raw).unwrap_or(Pending { pid: 0, keep_keys: false });
    if pending.pid != 0 && pending.pid != std::process::id() {
        wait_for_exit(pending.pid);
    }
    let kept_keys = if pending.keep_keys { keys_from(&root.join("settings.json")) } else { None };
    let mut left = erase_in(&root);
    // A file the old Izuki still held a moment ago: once more, after a pause.
    if !left.is_empty() {
        std::thread::sleep(std::time::Duration::from_millis(1500));
        left = erase_in(&root);
    }
    if let Some(keys) = kept_keys {
        let _ = std::fs::write(root.join("settings.json"), serde_json::to_vec_pretty(&settings_with(&keys)).unwrap_or_default());
    }
    if let Some(why) = erase_window_storage() {
        left.push(why);
    }
    let _ = std::fs::remove_file(&marker);
    // The log starts after this; the line goes into the fresh one.
    ERASED.store(true, std::sync::atomic::Ordering::SeqCst);
    if !left.is_empty() {
        *LEFT.lock() = left;
    }
}

static ERASED: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);
static LEFT: parking_lot::Mutex<Vec<String>> = parking_lot::Mutex::new(Vec::new());

/// Called once the log is running: says what the erase did.
pub fn report_erase() {
    if ERASED.load(std::sync::atomic::Ordering::SeqCst) {
        let left = LEFT.lock().clone();
        if left.is_empty() {
            eprintln!("[mydata] everything was erased at start");
        } else {
            eprintln!("[mydata] erased at start; Windows kept {} file(s) in use: {}", left.len(), left.join(", "));
        }
    }
}

/// Fresh settings with the kept keys in: a whole settings file, so it loads
/// like any other (every field there, everything else new). A kept field
/// that wouldn't load is left out rather than spoil the file.
fn settings_with(keys: &Value) -> Value {
    let mut base = serde_json::to_value(crate::settings::Settings::default()).unwrap_or_else(|_| Value::Object(Default::default()));
    let Some(kept) = keys.as_object() else { return base };
    for (name, v) in kept {
        let mut next = base.clone();
        if let Some(b) = next.as_object_mut() {
            b.insert(name.clone(), v.clone());
        }
        if serde_json::from_value::<crate::settings::Settings>(next.clone()).is_ok() {
            base = next;
        } else {
            eprintln!("[mydata] a kept setting ({name}) wouldn't load; left out");
        }
    }
    base
}

fn keys_from(settings: &Path) -> Option<Value> {
    let v: Value = serde_json::from_slice(&std::fs::read(settings).ok()?).ok()?;
    let map = v.as_object()?;
    let kept: serde_json::Map<String, Value> = KEY_FIELDS.iter().filter_map(|k| map.get(*k).map(|v| ((*k).to_string(), v.clone()))).collect();
    Some(Value::Object(kept))
}

/// Delete everything in the data folder except downloads, tools and the
/// undo for Windows changes. What couldn't be deleted, by name.
fn erase_in(root: &Path) -> Vec<String> {
    let mut left = Vec::new();
    let Ok(read) = std::fs::read_dir(root) else { return left };
    for e in read.flatten() {
        let name = e.file_name().to_string_lossy().to_string();
        if NOT_DATA_DIRS.contains(&name.as_str()) || UNDO_FILES.contains(&name.as_str()) || name == MARKER {
            continue;
        }
        let path = e.path();
        let gone = match e.file_type() {
            Ok(t) if t.is_dir() => std::fs::remove_dir_all(&path),
            _ => std::fs::remove_file(&path),
        };
        if gone.is_err() {
            left.push(name);
        }
    }
    left
}

/// The window's own storage (chat history, cached voice lines): WebView2's
/// folder, before any window has opened it. The old window's helpers can
/// hold it for a few seconds after Izuki closes, so it's tried for up to
/// five. What couldn't be removed, in words.
fn erase_window_storage() -> Option<String> {
    let folder = dirs::data_local_dir()?.join("com.novaizuki.izuki").join("EBWebView");
    for _ in 0..10 {
        match std::fs::remove_dir_all(&folder) {
            Ok(()) => return None,
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => return None,
            Err(_) => std::thread::sleep(std::time::Duration::from_millis(500)),
        }
    }
    Some("the window's own storage (chat history)".into())
}

#[cfg(windows)]
fn wait_for_exit(pid: u32) {
    use windows::Win32::Foundation::CloseHandle;
    use windows::Win32::System::Threading::{OpenProcess, WaitForSingleObject, PROCESS_SYNCHRONIZE};
    unsafe {
        if let Ok(h) = OpenProcess(PROCESS_SYNCHRONIZE, false, pid) {
            // At most 20 s: Izuki closes itself in about 2.
            let _ = WaitForSingleObject(h, 20_000);
            let _ = CloseHandle(h);
        }
    }
}

#[cfg(not(windows))]
fn wait_for_exit(_pid: u32) {
    std::thread::sleep(std::time::Duration::from_secs(3));
}

/// What's kept about you right now, for the Privacy page: how many files
/// and how much space.
#[derive(Debug, Clone, Serialize)]
pub struct Summary {
    pub files: usize,
    pub bytes: u64,
    pub folder: String,
}

pub fn summary() -> Summary {
    let root = data();
    let list = files_for_copy(&root);
    let bytes = list.iter().filter_map(|(p, _)| std::fs::metadata(p).ok()).map(|m| m.len()).sum();
    Summary { files: list.len(), bytes, folder: root.display().to_string() }
}

/// Is an erase waiting (the Privacy page shouldn't offer it twice)?
pub fn erase_waiting() -> bool {
    data().join(MARKER).exists()
}

/// Refuses a copy or erase while one of those is already going.
static BUSY: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

pub fn one_at_a_time<T>(f: impl FnOnce() -> Result<T>) -> Result<T> {
    if BUSY.swap(true, std::sync::atomic::Ordering::SeqCst) {
        return Err(anyhow!("Izuki is already doing that — give it a moment."));
    }
    let out = f();
    BUSY.store(false, std::sync::atomic::Ordering::SeqCst);
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    fn temp() -> PathBuf {
        let d = std::env::temp_dir().join(format!("izuki-mydata-{}-{}", std::process::id(), rand::random::<u32>()));
        let _ = std::fs::remove_dir_all(&d);
        std::fs::create_dir_all(&d).unwrap();
        d
    }

    #[test]
    fn secrets_never_leave_in_a_copy() {
        assert!(is_secret_field("api_key") && is_secret_field("telegram_token") && is_secret_field("roku_dev_password") && is_secret_field("call_token"));
        assert!(is_secret_field("telegram_code") && is_secret_field("azure_speech_key"));
        assert!(!is_secret_field("hotkey_draw") && !is_secret_field("keep_activity") && !is_secret_field("keyboard") && !is_secret_field("monkey"));
        let mut v = serde_json::json!({
            "groq_api_key": "gsk_live",
            "providers": [{ "id": "gemini", "api_key": "AIza", "model": "flash" }],
            "linked_devices": [{ "name": "Pixel", "token": "t0k" }],
            "hotkey_draw": "Ctrl+D",
            "stripe_key": "",
            "keep_activity": true,
            "tv_pair": "samsung-pass",
            "school_feeds": ["https://blackboard.example/feeds/ical/private-token.ics"],
            "n8n_hooks": []
        });
        without_secrets(&mut v);
        let s = v.to_string();
        assert!(!s.contains("gsk_live") && !s.contains("AIza") && !s.contains("t0k") && !s.contains("samsung-pass") && !s.contains("private-token"), "{s}");
        assert_eq!(v["n8n_hooks"], serde_json::json!([]), "an empty list stays empty");
        assert!(s.contains("Ctrl+D") && s.contains("flash") && s.contains("Pixel"));
        assert_eq!(v["stripe_key"], "", "an empty field stays empty: nothing to hide");
    }

    #[test]
    fn a_copy_has_your_data_but_not_downloads_or_secrets() {
        let root = temp();
        std::fs::write(root.join("memories.json"), r#"[{"text":"likes tea"}]"#).unwrap();
        std::fs::write(root.join("settings.json"), r#"{"groq_api_key":"gsk_secret","name":"Sam"}"#).unwrap();
        std::fs::write(root.join("settings.backup-1.json"), r#"{"providers":[{"api_key":"AIza_old"}]}"#).unwrap();
        std::fs::write(root.join("bridge-key"), "never").unwrap();
        std::fs::create_dir_all(root.join("models")).unwrap();
        std::fs::write(root.join("models").join("big.onnx"), "weights").unwrap();
        std::fs::create_dir_all(root.join("actions")).unwrap();
        std::fs::write(root.join("actions").join("2026-11-10.jsonl"), "{}\n").unwrap();
        let rels: Vec<String> = files_for_copy(&root).into_iter().map(|(_, r)| r).collect();
        assert_eq!(rels, ["actions/2026-11-10.jsonl", "memories.json", "settings.backup-1.json", "settings.json"]);
        let out_dir = temp();
        let out = out_dir.join("out.zip");
        write_zip(&root, &out, Some(serde_json::json!({ "izuki.chats": "[…]", "izuki.pass_token": "p" }))).unwrap();
        let mut z = zip::ZipArchive::new(std::fs::File::open(&out).unwrap()).unwrap();
        let mut all = String::new();
        for i in 0..z.len() {
            let mut f = z.by_index(i).unwrap();
            all.push_str(f.name());
            std::io::Read::read_to_string(&mut f, &mut all).unwrap();
        }
        assert!(all.contains("likes tea") && all.contains("Sam") && all.contains("README.txt") && all.contains("izuki.chats"));
        assert!(!all.contains("gsk_secret") && !all.contains("AIza_old") && !all.contains("never") && !all.contains("weights") && !all.contains("\"p\""), "{all}");
        let _ = std::fs::remove_dir_all(&root);
        let _ = std::fs::remove_dir_all(&out_dir);
    }

    #[test]
    fn erase_keeps_downloads_and_undo_and_can_keep_keys() {
        let root = temp();
        for f in ["memories.json", "notes.json", "settings.json", "looks.json", "tweak-packs-undo.json", "bridge-key"] {
            std::fs::write(root.join(f), "{}").unwrap();
        }
        std::fs::write(root.join("settings.json"), r#"{"groq_api_key":"gsk","name":"Sam","providers":[{"api_key":"AIza"}]}"#).unwrap();
        for d in ["models", "logs", "debug", "actions"] {
            std::fs::create_dir_all(root.join(d)).unwrap();
            std::fs::write(root.join(d).join("x"), "x").unwrap();
        }
        let keys = keys_from(&root.join("settings.json")).unwrap();
        assert_eq!(keys["groq_api_key"], "gsk");
        assert!(keys.get("name").is_none(), "only the keys are kept");
        // What's written back is a whole settings file that loads, keys in;
        // a kept field that wouldn't load (this provider has no id) is left out.
        let fresh: crate::settings::Settings = serde_json::from_value(settings_with(&keys)).expect("kept keys make a settings file that loads");
        assert_eq!(fresh.groq_api_key, "gsk");
        assert!(!fresh.onboarding_seen, "everything else starts fresh");
        // A real settings file: the AI keys in the providers come through.
        let mut real = crate::settings::Settings::default();
        real.providers[0].api_key = "AIza-real".into();
        real.onboarding_seen = true;
        std::fs::write(root.join("real.json"), serde_json::to_vec(&real).unwrap()).unwrap();
        let back: crate::settings::Settings = serde_json::from_value(settings_with(&keys_from(&root.join("real.json")).unwrap())).unwrap();
        assert_eq!(back.providers[0].api_key, "AIza-real");
        assert!(!back.onboarding_seen);
        let _ = std::fs::remove_file(root.join("real.json"));
        assert!(erase_in(&root).is_empty());
        let mut left: Vec<String> = std::fs::read_dir(&root).unwrap().flatten().map(|e| e.file_name().to_string_lossy().to_string()).collect();
        left.sort();
        assert_eq!(left, ["looks.json", "models", "tweak-packs-undo.json"]);
        let _ = std::fs::remove_dir_all(&root);
    }
}
