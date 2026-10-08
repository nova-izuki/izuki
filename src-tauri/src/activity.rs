//! Live activities on the Island — things happening right now, each with the
//! smart next step for what it is:
//! - a download: in progress, then done → Open / Show in folder, plus the
//!   right extra for the kind of file (Sum it up, Install it, Unzip it…);
//! - a screenshot: read on this PC (no internet) → Copy the text, and if it
//!   shows an error, a question or another language: Fix / Explain / Translate;
//! - charging: plugged in or unplugged, the battery for a moment;
//! - recent copies: the last few things copied, one tap to copy again.

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::time::{Duration, Instant, SystemTime};

use parking_lot::Mutex;
use serde::Serialize;

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Activity {
    pub id: String,
    /// "download", "downloading", "screenshot", "charging".
    pub kind: &'static str,
    pub icon: &'static str,
    pub title: String,
    pub detail: String,
    pub actions: Vec<Action>,
}

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Action {
    pub label: String,
    /// "ask:<what to ask Izuki>", "open:<path>", "show:<path>",
    /// "copytext:<path>", "unzip:<path>".
    pub op: String,
}

/// How long a finished thing stays on the Island.
const SHOW_FOR: Duration = Duration::from_secs(75);

struct Shown {
    activity: Activity,
    at: Instant,
}

static SHOWN: Mutex<Vec<Shown>> = Mutex::new(Vec::new());
static RECENT_COPIES: Mutex<Vec<String>> = Mutex::new(Vec::new());

fn push(a: Activity) {
    let mut s = SHOWN.lock();
    s.retain(|x| x.activity.id != a.id);
    s.push(Shown { activity: a, at: Instant::now() });
    s.retain(|x| x.at.elapsed() < SHOW_FOR);
}

/// What the Island shows now: running timers, downloads in progress, and
/// what just finished.
pub fn now() -> Vec<Activity> {
    let mut out: Vec<Activity> = crate::timers::running()
        .into_iter()
        .map(|t| Activity {
            id: format!("timer-{}", t.id),
            kind: "timer",
            icon: "⏱️",
            title: t.label.clone(),
            detail: clock(t.left),
            actions: vec![Action { label: "Cancel".into(), op: format!("ask:cancel the {} timer", t.label.trim_end_matches(" timer")) }],
        })
        .collect();
    out.extend(downloading());
    let mut s = SHOWN.lock();
    s.retain(|x| x.at.elapsed() < SHOW_FOR);
    // Update state owns this tile so it cannot expire or retain stale wording.
    out.extend(s.iter().rev().filter(|x| x.activity.id != "update").map(|x| x.activity.clone()));
    if let Some((version, ready)) = crate::updates::offered_version() {
        out.insert(0, update_activity(&version, ready));
    }
    out.truncate(4);
    out
}

fn clock(secs: u64) -> String {
    if secs >= 3600 {
        format!("{}:{:02}:{:02}", secs / 3600, (secs % 3600) / 60, secs % 60)
    } else {
        format!("{}:{:02}", secs / 60, secs % 60)
    }
}

/// PC Boost on the Island: an offer to speed things up (with the buttons),
/// or what it just did by itself.
pub fn show_boost(text: &str, offer: bool) {
    push(Activity {
        id: "boost".into(),
        kind: "boost",
        icon: "⚡",
        title: if offer { "PC running slow".into() } else { "PC Boost".into() },
        detail: text.to_string(),
        actions: if offer {
            vec![Action { label: "Speed it up".into(), op: "ask:speed up my PC".into() }]
        } else {
            Vec::new()
        },
    });
}

/// An available update: one explicit action to download and install it.
pub fn show_update(version: &str) {
    push(update_activity(version, false));
}

fn update_activity(version: &str, ready: bool) -> Activity {
    Activity {
        id: "update".into(),
        kind: "update",
        icon: "⬆️",
        title: format!("Izuki {version} is {}", if ready { "ready to install" } else { "available" }),
        detail: if ready { "Signed update downloaded and verified".into() } else { "Download and install when you're ready".into() },
        actions: vec![Action { label: if ready { "Install now".into() } else { "Download & install".into() }, op: "update:now".into() }],
    }
}

/// The last few things copied (newest first), never anything secret.
pub fn recent_copies() -> Vec<String> {
    RECENT_COPIES.lock().clone()
}

/// Called by clip.rs when something new is copied.
pub fn copied(text: &str) {
    let t = text.trim();
    if t.is_empty() || t.len() > 5000 || crate::clip::is_secret(t) {
        return;
    }
    let mut r = RECENT_COPIES.lock();
    r.retain(|x| x != t);
    r.insert(0, t.to_string());
    r.truncate(6);
}

pub fn copy_again(i: usize) -> bool {
    let t = RECENT_COPIES.lock().get(i).cloned();
    t.is_some_and(|t| crate::automation::write_clipboard(&t).is_ok())
}

// ---- watching ---------------------------------------------------------------------

fn downloads_dir() -> Option<PathBuf> {
    dirs::download_dir()
}

fn screenshots_dir() -> Option<PathBuf> {
    dirs::picture_dir().map(|p| p.join("Screenshots"))
}

/// Downloads still arriving (Chrome .crdownload, Firefox .part, Edge .partial).
fn downloading() -> Vec<Activity> {
    let Some(dir) = downloads_dir() else { return Vec::new() };
    let Ok(rd) = std::fs::read_dir(&dir) else { return Vec::new() };
    rd.flatten()
        .filter_map(|e| {
            let name = e.file_name().to_string_lossy().to_string();
            let lower = name.to_lowercase();
            let real = [".crdownload", ".part", ".partial", ".download"].iter().find_map(|x| lower.strip_suffix(x).map(|_| name[..name.len() - x.len()].to_string()))?;
            let fresh = e.metadata().ok()?.modified().ok()?.elapsed().ok()? < Duration::from_secs(30);
            fresh.then(|| Activity {
                id: format!("dl-{real}"),
                kind: "downloading",
                icon: "⬇️",
                title: tidy_name(&real),
                detail: format!("Downloading… {}", size(e.metadata().map(|m| m.len()).unwrap_or(0))),
                actions: Vec::new(),
            })
        })
        .take(2)
        .collect()
}

/// Watch Downloads and Screenshots for new arrivals; note charging changes.
pub fn spawn() {
    std::thread::spawn(|| {
        let mut seen: HashMap<PathBuf, (u64, u8)> = HashMap::new();
        let mut started = false;
        let mut plugged: Option<bool> = None;
        loop {
            std::thread::sleep(Duration::from_secs(3));
            if !crate::state::try_store().is_some_and(|s| s.settings().island_enabled) {
                continue;
            }
            for (dir, kind) in [(downloads_dir(), "download"), (screenshots_dir(), "screenshot")] {
                let Some(dir) = dir else { continue };
                let Ok(rd) = std::fs::read_dir(&dir) else { continue };
                for e in rd.flatten() {
                    let path = e.path();
                    let Ok(meta) = e.metadata() else { continue };
                    if !meta.is_file() || is_temp(&path) {
                        continue;
                    }
                    let len = meta.len();
                    let recent = meta.modified().ok().and_then(|m| SystemTime::now().duration_since(m).ok()).is_some_and(|d| d < Duration::from_secs(120));
                    let entry = seen.entry(path.clone()).or_insert((len, if started { 0 } else { 9 }));
                    // A new file whose size held still for one look: finished.
                    if entry.1 == 9 || !recent {
                        entry.0 = len;
                        continue;
                    }
                    if entry.0 != len {
                        *entry = (len, 0);
                        continue;
                    }
                    entry.1 += 1;
                    if entry.1 == 1 {
                        entry.1 = 9;
                        let p = path.clone();
                        std::thread::spawn(move || {
                            let a = if kind == "download" { finished_download(&p) } else { screenshot(&p) };
                            if let Some(a) = a {
                                push(a);
                            }
                        });
                    }
                }
            }
            started = true;
            if seen.len() > 5000 {
                seen.clear();
                started = false;
            }
            // Charging: a moment on the Island when it changes.
            if let Some((pct, now_plugged)) = crate::briefing::battery_raw() {
                if plugged.is_some_and(|p| p != now_plugged) {
                    push(Activity {
                        id: "charging".into(),
                        kind: "charging",
                        icon: if now_plugged { "⚡" } else { "🔋" },
                        title: if now_plugged { "Charging".into() } else { "On battery".into() },
                        detail: format!("{pct}%"),
                        actions: Vec::new(),
                    });
                    // It's news for a few seconds, not a minute.
                    let mut s = SHOWN.lock();
                    if let Some(x) = s.iter_mut().find(|x| x.activity.id == "charging") {
                        x.at = Instant::now() - SHOW_FOR + Duration::from_secs(6);
                    }
                }
                plugged = Some(now_plugged);
            }
        }
    });
}

fn is_temp(p: &Path) -> bool {
    let n = p.file_name().map(|n| n.to_string_lossy().to_lowercase()).unwrap_or_default();
    n.starts_with('.') || n.starts_with("~$") || [".crdownload", ".part", ".partial", ".download", ".tmp", ".ini"].iter().any(|x| n.ends_with(x))
}

fn tidy_name(n: &str) -> String {
    if n.chars().count() > 42 {
        let head: String = n.chars().take(30).collect();
        let tail: String = n.chars().rev().take(9).collect::<Vec<_>>().into_iter().rev().collect();
        format!("{head}…{tail}")
    } else {
        n.to_string()
    }
}

fn size(b: u64) -> String {
    match b {
        0 => String::new(),
        b if b < 1_000_000 => format!("{} KB", b / 1000),
        b if b < 1_000_000_000 => format!("{:.1} MB", b as f64 / 1e6),
        b => format!("{:.2} GB", b as f64 / 1e9),
    }
}

/// A download that just finished: what it is decides the extra button.
pub fn finished_download(path: &Path) -> Option<Activity> {
    let name = path.file_name()?.to_string_lossy().to_string();
    let p = path.to_string_lossy().to_string();
    let ext = path.extension().map(|e| e.to_string_lossy().to_lowercase()).unwrap_or_default();
    let mut actions = vec![Action { label: "Open".into(), op: format!("open:{p}") }];
    let (icon, extra): (&'static str, Option<Action>) = match ext.as_str() {
        "pdf" | "docx" | "doc" | "pptx" | "txt" | "md" | "rtf" | "csv" | "xlsx" => (
            "📄",
            Some(Action { label: "Sum it up".into(), op: format!("ask:Read the file \"{p}\" and sum it up for me in a few short lines.") }),
        ),
        "exe" | "msi" | "msix" | "appx" => ("📦", Some(Action { label: "Install it".into(), op: format!("open:{p}") })),
        "zip" | "7z" | "rar" => ("🗜️", Some(Action { label: "Unzip it".into(), op: format!("unzip:{p}") })),
        "png" | "jpg" | "jpeg" | "gif" | "webp" => ("🖼️", None),
        "mp3" | "wav" | "m4a" | "flac" | "mp4" | "mkv" | "mov" | "avi" => ("🎬", None),
        _ => ("✅", None),
    };
    if let Some(x) = extra {
        if x.label != "Install it" {
            actions.push(x);
        } else {
            actions[0] = x;
        }
    }
    actions.push(Action { label: "Show in folder".into(), op: format!("show:{p}") });
    let bytes = std::fs::metadata(path).map(|m| m.len()).unwrap_or(0);
    Some(Activity { id: format!("dl-{name}"), kind: "download", icon, title: tidy_name(&name), detail: format!("Downloaded · {}", size(bytes)), actions })
}

/// A screenshot just saved: read it on this PC, and offer what fits it.
pub fn screenshot(path: &Path) -> Option<Activity> {
    let p = path.to_string_lossy().to_string();
    let text = read_image_text(path).unwrap_or_default();
    let mut actions = Vec::new();
    let lower = text.to_lowercase();
    let short: String = text.chars().take(1200).collect();
    if ["error", "exception", "failed", "not found", "denied", "cannot", "couldn't"].iter().any(|w| lower.contains(w)) {
        actions.push(Action { label: "Fix this error".into(), op: format!("ask:My screenshot shows this — what's wrong and how do I fix it?\n{short}") });
    } else if text.contains('?') && text.split_whitespace().count() > 6 {
        actions.push(Action { label: "Explain this question".into(), op: format!("ask:Explain this question from my screenshot like a teacher — help me understand it, don't just give the answer:\n{short}") });
    } else if !crate::clip::for_text(&text).iter().any(|i| i.label.starts_with("Translate")) {
        // nothing special
    } else {
        actions.push(Action { label: "Translate".into(), op: format!("ask:Translate this into English:\n{short}") });
    }
    if !text.trim().is_empty() {
        actions.push(Action { label: "Copy the text".into(), op: format!("copytext:{p}") });
    }
    actions.push(Action { label: "Open".into(), op: format!("open:{p}") });
    actions.truncate(3);
    Some(Activity {
        id: format!("shot-{p}"),
        kind: "screenshot",
        icon: "📸",
        title: "Screenshot saved".into(),
        detail: if text.trim().is_empty() { "No words in it".into() } else { format!("{} words in it", text.split_whitespace().count()) },
        actions,
    })
}

/// The words in an image file, read on this PC (Windows' own OCR).
pub fn read_image_text(path: &Path) -> Option<String> {
    let img = image::open(path).ok()?.to_rgba8();
    let (w, h) = img.dimensions();
    let mut bgra = img.into_raw();
    for px in bgra.chunks_exact_mut(4) {
        px.swap(0, 2);
    }
    let frame = crate::capture::Frame { width: w, height: h, origin: (0, 0), bgra };
    crate::ocr::read_frame(&frame).ok()
}

/// Do one of the Island's buttons. What to say back, if anything.
pub fn act(app: &tauri::AppHandle, op: &str) -> Option<String> {
    use tauri_plugin_opener::OpenerExt;
    let (kind, arg) = op.split_once(':')?;
    match kind {
        "open" => {
            let _ = app.opener().open_path(arg, None::<&str>);
            None
        }
        "update" => {
            let app = app.clone();
            let _ = arg;
            tauri::async_runtime::spawn(async move {
                if let Err(e) = crate::updates::install_now(app).await {
                    eprintln!("[update] {e}");
                }
            });
            Some("Updating now — I'll be right back.".into())
        }
        "show" => {
            #[cfg(windows)]
            {
                use std::os::windows::process::CommandExt;
                let _ = std::process::Command::new("explorer.exe").arg(format!("/select,{arg}")).creation_flags(0x0800_0000).spawn();
            }
            None
        }
        "copytext" => {
            let text = read_image_text(Path::new(arg)).unwrap_or_default();
            if text.trim().is_empty() {
                return Some("I couldn't find any words in that screenshot.".into());
            }
            let _ = crate::automation::write_clipboard(text.trim());
            Some("Copied the text from your screenshot.".into())
        }
        "unzip" => {
            let src = Path::new(arg);
            let dest = src.with_extension("");
            let cmd = format!("Expand-Archive -LiteralPath '{}' -DestinationPath '{}' -Force", arg.replace('\'', "''"), dest.to_string_lossy().replace('\'', "''"));
            if crate::files::run_ok(&cmd) {
                let _ = app.opener().open_path(dest.to_string_lossy(), None::<&str>);
                Some("Unzipped it — the folder's open.".into())
            } else {
                Some("I couldn't unzip that one.".into())
            }
        }
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_finished_download_gets_the_right_buttons() {
        let labels = |name: &str| finished_download(Path::new(&format!("C:\\Users\\me\\Downloads\\{name}"))).unwrap().actions.into_iter().map(|a| a.label).collect::<Vec<_>>();
        assert_eq!(labels("syllabus.pdf"), vec!["Open", "Sum it up", "Show in folder"]);
        assert_eq!(labels("ZoomInstaller.exe"), vec!["Install it", "Show in folder"]);
        assert_eq!(labels("photos.zip"), vec!["Open", "Unzip it", "Show in folder"]);
        assert_eq!(labels("song.mp3"), vec!["Open", "Show in folder"]);
        assert!(is_temp(Path::new("C:\\x\\file.pdf.crdownload")));
        assert!(!is_temp(Path::new("C:\\x\\file.pdf")));
        assert_eq!(clock(754), "12:34");
        assert_eq!(size(2_500_000), "2.5 MB");
    }

    #[test]
    fn update_tile_matches_download_state() {
        let available = update_activity("1.2.3", false);
        assert!(available.title.contains("available"));
        assert_eq!(available.actions[0].label, "Download & install");
        let ready = update_activity("1.2.3", true);
        assert!(ready.title.contains("ready to install"));
        assert_eq!(ready.actions[0].label, "Install now");
    }
}
