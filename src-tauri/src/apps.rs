//! Instant skills: open an app or a website directly, the way Windows itself
//! would — no screenshots, no clicking through the Start menu, no AI.
//!
//! "Open Notepad" used to take the agent several slow looks (Start menu →
//! type → Enter → check → sometimes a web search opened instead). Launching
//! the Start-menu shortcut takes a fraction of a second and never misses.
//! The agent can use these too (`open_app` / `open_url` steps), so bigger
//! tasks start from the right place in one move.

use std::path::{Path, PathBuf};

use anyhow::{anyhow, Result};

/// Built into Windows but not (always) a Start-menu shortcut — name → what to run.
const BUILT_IN: &[(&str, &str)] = &[
    ("notepad", "notepad.exe"),
    ("calculator", "calculator:"),
    ("calc", "calculator:"),
    ("settings", "ms-settings:"),
    ("windows settings", "ms-settings:"),
    ("file explorer", "explorer.exe"),
    ("explorer", "explorer.exe"),
    ("files", "explorer.exe"),
    ("my files", "explorer.exe"),
    ("task manager", "taskmgr.exe"),
    ("paint", "mspaint.exe"),
    ("command prompt", "cmd.exe"),
    ("cmd", "cmd.exe"),
    ("powershell", "powershell.exe"),
    ("terminal", "wt.exe"),
    ("control panel", "control.exe"),
    ("microsoft store", "ms-windows-store:"),
    ("store", "ms-windows-store:"),
    ("camera", "microsoft.windows.camera:"),
    ("photos", "ms-photos:"),
    ("clock", "ms-clock:"),
    ("alarms", "ms-clock:"),
    ("snipping tool", "ms-screenclip:"),
    ("screenshot", "ms-screenclip:"),
    ("mail", "outlookmail:"),
    // The new Outlook (a Store app) has no Start-menu shortcut to find;
    // classic Outlook's shortcut still wins when it's installed.
    ("outlook", "outlookmail:"),
    ("calendar", "outlookcal:"),
    ("maps", "bingmaps:"),
    ("weather", "bingweather:"),
];

/// Words that don't help tell apps apart.
fn tidy(name: &str) -> String {
    let lower = name.to_lowercase();
    let lower = lower
        .trim()
        .trim_end_matches(['.', '!', '?'])
        .trim_start_matches("the ")
        .trim_start_matches("my ")
        .trim_end_matches(" app")
        .trim_end_matches(" application")
        .trim_end_matches(" program");
    lower
        .split(|c: char| !c.is_alphanumeric() && c != '+' && c != '#')
        .filter(|w| !w.is_empty())
        .collect::<Vec<_>>()
        .join(" ")
}

/// Every Start-menu shortcut, as (tidy name, path).
fn shortcuts() -> Vec<(String, PathBuf)> {
    let mut roots = Vec::new();
    if let Ok(pd) = std::env::var("ProgramData") {
        roots.push(PathBuf::from(pd).join(r"Microsoft\Windows\Start Menu\Programs"));
    }
    if let Ok(ad) = std::env::var("APPDATA") {
        roots.push(PathBuf::from(ad).join(r"Microsoft\Windows\Start Menu\Programs"));
    }
    let mut out = Vec::new();
    for root in roots {
        walk(&root, 0, &mut out);
    }
    out
}

fn walk(dir: &Path, depth: usize, out: &mut Vec<(String, PathBuf)>) {
    if depth > 3 {
        return;
    }
    let Ok(entries) = std::fs::read_dir(dir) else { return };
    for e in entries.flatten() {
        let p = e.path();
        if p.is_dir() {
            walk(&p, depth + 1, out);
        } else if matches!(p.extension().and_then(|x| x.to_str()).map(str::to_lowercase).as_deref(), Some("lnk" | "url")) {
            let name = p.file_stem().and_then(|s| s.to_str()).unwrap_or_default();
            // Uninstallers and help files are never what anyone means.
            let lower = name.to_lowercase();
            if lower.contains("uninstall") || lower.contains("readme") || lower.contains("help") {
                continue;
            }
            out.push((tidy(name), p));
        }
    }
}

/// How well a shortcut's name matches what was asked for (0 = not at all).
fn score(asked: &str, name: &str) -> u32 {
    if name == asked {
        return 100;
    }
    if name.starts_with(&format!("{asked} ")) || name.ends_with(&format!(" {asked}")) {
        return 80;
    }
    let asked_words: Vec<&str> = asked.split(' ').collect();
    let name_words: Vec<&str> = name.split(' ').collect();
    if asked_words.iter().all(|w| name_words.contains(w)) {
        // All the asked words are in it — the fewer extra words, the better.
        return 60u32.saturating_sub((name_words.len() - asked_words.len()) as u32 * 5).max(30);
    }
    0
}

/// What would run for an app name, if anything matches.
pub fn find_app(name: &str) -> Option<String> {
    let asked = tidy(name);
    if asked.is_empty() {
        return None;
    }
    let best = shortcuts()
        .into_iter()
        .map(|(n, p)| (score(&asked, &n), p))
        .filter(|(s, _)| *s > 0)
        .max_by_key(|(s, _)| *s);
    if let Some((s, p)) = &best {
        if *s >= 80 {
            return Some(p.to_string_lossy().into_owned());
        }
    }
    if let Some((_, target)) = BUILT_IN.iter().find(|(n, _)| *n == asked) {
        return Some((*target).to_string());
    }
    best.map(|(_, p)| p.to_string_lossy().into_owned())
}

/// Start something the way double-clicking it would.
fn start(target: &str) -> Result<()> {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        std::process::Command::new("cmd")
            .args(["/C", "start", "", target])
            .creation_flags(CREATE_NO_WINDOW)
            .spawn()?;
        Ok(())
    }
    #[cfg(not(windows))]
    {
        let _ = target;
        Err(anyhow!("only on Windows"))
    }
}

/// Chrome, Edge and Brave open on a "Who's using Chrome?" picker when there's
/// more than one profile — and the agent used to sit there thinking. Open
/// straight into the profile used last instead: (the browser, its profile).
fn browser_with_profile(target: &str) -> Option<(std::path::PathBuf, String)> {
    let low = target.to_lowercase();
    let (exe, data) = if low.contains("chrome") {
        ("Google\\Chrome\\Application\\chrome.exe", "Google\\Chrome\\User Data")
    } else if low.contains("msedge") || low.contains("microsoft edge") || low.ends_with("edge.lnk") {
        ("Microsoft\\Edge\\Application\\msedge.exe", "Microsoft\\Edge\\User Data")
    } else if low.contains("brave") {
        ("BraveSoftware\\Brave-Browser\\Application\\brave.exe", "BraveSoftware\\Brave-Browser\\User Data")
    } else {
        return None;
    };
    let roots = ["ProgramFiles", "ProgramFiles(x86)", "LOCALAPPDATA"].iter().filter_map(|v| std::env::var(v).ok()).collect::<Vec<_>>();
    let exe = roots.iter().map(|r| Path::new(r).join(exe)).find(|p| p.exists())?;
    let state = dirs::data_local_dir()?.join(data).join("Local State");
    let profile = std::fs::read_to_string(state)
        .ok()
        .and_then(|t| serde_json::from_str::<serde_json::Value>(&t).ok())
        .and_then(|v| v["profile"]["last_used"].as_str().map(str::to_string))
        .filter(|p| !p.is_empty() && !p.contains(['"', '\\', '/']))
        .unwrap_or_else(|| "Default".into());
    Some((exe, profile))
}

/// "Open downloads", "show my documents", "open my files and open downloads":
/// a folder to open in File Explorer (the last one named). Not "open the
/// newest PDF in my downloads" — that's a file, the agent's job.
pub fn folder_request(said: &str) -> Option<(std::path::PathBuf, &'static str)> {
    let s = said.to_lowercase();
    if !["open", "show", "go to", "take me to", "pull up", "bring up"].iter().any(|v| s.contains(v)) {
        return None;
    }
    if [" in my ", " from my ", " in the ", " inside ", "latest", "newest", "recent", ".pdf", ".doc", "file called", "file named"].iter().any(|w| s.contains(w)) {
        return None;
    }
    let words: Vec<&str> = s.split(|c: char| !c.is_alphanumeric()).filter(|w| !w.is_empty()).collect();
    let pos = |w: &str| words.iter().rposition(|x| *x == w);
    let mut best: Option<(usize, std::path::PathBuf, &'static str)> = None;
    for (keys, name) in [(&["downloads", "download"][..], "Downloads"), (&["documents", "docs"][..], "Documents"), (&["desktop"][..], "Desktop"), (&["pictures", "photos"][..], "Pictures"), (&["music"][..], "Music"), (&["videos"][..], "Videos")] {
        let Some(at) = keys.iter().filter_map(|k| pos(k)).max() else { continue };
        let dir = match name {
            "Downloads" => dirs::download_dir(),
            "Documents" => dirs::document_dir(),
            "Desktop" => dirs::desktop_dir(),
            "Pictures" => dirs::picture_dir(),
            "Music" => dirs::audio_dir(),
            _ => dirs::video_dir(),
        };
        if let Some(dir) = dir {
            if best.as_ref().is_none_or(|(b, _, _)| at > *b) {
                best = Some((at, dir, name));
            }
        }
    }
    best.map(|(_, d, n)| (d, n))
}

/// A folder named on its own ("Downloads", "my documents", "the Downloads
/// folder"), as the agent asks to open it: where it is and its name.
pub fn known_folder(name: &str) -> Option<(std::path::PathBuf, &'static str)> {
    let s = name.trim().to_lowercase();
    let s = s.strip_prefix("my ").or_else(|| s.strip_prefix("the ")).unwrap_or(&s);
    let s = s.strip_suffix(" folder").unwrap_or(s).trim();
    if s.is_empty() || s.split_whitespace().count() > 1 {
        return None;
    }
    folder_request(&format!("open {s}"))
}

/// Open a folder in File Explorer — once. An Explorer window already showing
/// it comes to the front instead (true); asked again, a person switches to
/// the window that's open, they don't open another. On 9 Nov the agent
/// opened Downloads six times: each one opened behind another window, and
/// the next look opened it again.
pub fn open_folder(dir: &std::path::Path) -> Result<bool> {
    let names: Vec<String> = dir.file_name().and_then(|n| n.to_str()).map(|n| vec![n.to_string()]).unwrap_or_default();
    if crate::arrange::bring_folder_window(&names) {
        return Ok(true);
    }
    std::process::Command::new("explorer").arg(dir).spawn()?;
    Ok(false)
}

/// Open an app by name. `Err` if nothing installed matches.
pub fn open_app(name: &str) -> Result<String> {
    let opened = open_app_now(name);
    if opened.is_ok() {
        crate::actlog::record("apps", &format!("Opened {}", name.trim()));
    }
    opened
}

fn open_app_now(name: &str) -> Result<String> {
    let target = find_app(name).ok_or_else(|| anyhow!("no app called \"{}\" is installed", name.trim()))?;
    if let Some((exe, profile)) = browser_with_profile(&target) {
        let mut c = std::process::Command::new(&exe);
        c.arg(format!("--profile-directory={profile}"));
        if c.spawn().is_ok() {
            let shown = Path::new(&target).file_stem().and_then(|s| s.to_str()).unwrap_or(name).to_string();
            return Ok(shown);
        }
    }
    start(&target)?;
    let shown = Path::new(&target).file_stem().and_then(|s| s.to_str()).unwrap_or(name).to_string();
    Ok(shown)
}

#[cfg(test)]
mod folder_tests {
    use super::*;

    /// Opt-in, on a real desktop (IZUKI_WINDOWS_REAL=1): asking for
    /// Downloads twice leaves one Downloads window, and only windows this
    /// test opened are closed again.
    #[cfg(windows)]
    #[test]
    fn real_a_folder_opens_once() {
        use windows::Win32::Foundation::{HWND, LPARAM, WPARAM};
        use windows::Win32::UI::WindowsAndMessaging::{PostMessageW, WM_CLOSE};
        if std::env::var("IZUKI_WINDOWS_REAL").is_err() {
            return;
        }
        let Some(dir) = dirs::download_dir() else { return };
        let names = vec![dir.file_name().unwrap().to_string_lossy().into_owned()];
        let before = crate::arrange::folder_windows(&names);
        let first = open_folder(&dir).unwrap();
        assert_eq!(first, !before.is_empty(), "reused exactly when one was open");
        let mut now = crate::arrange::folder_windows(&names);
        for _ in 0..40 {
            if !now.is_empty() {
                break;
            }
            std::thread::sleep(std::time::Duration::from_millis(250));
            now = crate::arrange::folder_windows(&names);
        }
        assert!(!now.is_empty(), "a Downloads window is open");
        assert!(open_folder(&dir).unwrap(), "the second ask finds the open window");
        std::thread::sleep(std::time::Duration::from_millis(1500));
        let after = crate::arrange::folder_windows(&names);
        assert_eq!(after.len(), now.len(), "no second Downloads window");
        // Close only what this test opened.
        for raw in after.into_iter().filter(|r| !before.contains(r)) {
            let _ = unsafe { PostMessageW(Some(HWND(raw as *mut core::ffi::c_void)), WM_CLOSE, WPARAM(0), LPARAM(0)) };
        }
    }

    #[test]
    fn opens_the_folder_asked_for() {
        assert_eq!(folder_request("open my files and open downloads").map(|f| f.1), Some("Downloads"));
        assert_eq!(folder_request("open downloads").map(|f| f.1), Some("Downloads"));
        assert_eq!(known_folder("Downloads").map(|f| f.1), Some("Downloads"));
        assert_eq!(known_folder("the Downloads folder").map(|f| f.1), Some("Downloads"));
        assert_eq!(known_folder("my documents").map(|f| f.1), Some("Documents"));
        assert_eq!(known_folder("Spotify"), None);
        assert_eq!(known_folder("downloads manager"), None, "an app, not the folder");
        assert_eq!(folder_request("show me my documents folder").map(|f| f.1), Some("Documents"));
        assert_eq!(folder_request("open file explorer then go to pictures").map(|f| f.1), Some("Pictures"));
        assert_eq!(folder_request("open the newest pdf in my downloads"), None);
        assert_eq!(folder_request("what's in my downloads"), None);
        assert_eq!(folder_request("open chrome"), None);
    }
}

/// Open a web address (or a bare domain like "youtube.com") in the default browser.
pub fn open_url(url: &str) -> Result<()> {
    let u = url.trim();
    if u.is_empty() || u.contains(char::is_whitespace) && !u.starts_with("http") {
        return Err(anyhow!("that isn't a web address"));
    }
    let full = if u.starts_with("http://") || u.starts_with("https://") { u.to_string() } else { format!("https://{u}") };
    start(&full)
}

/// The address of a web search for `query`.
pub fn search_url(query: &str) -> String {
    let q: String = query
        .trim()
        .bytes()
        .map(|b| match b {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => (b as char).to_string(),
            b' ' => "+".to_string(),
            _ => format!("%{b:02X}"),
        })
        .collect();
    format!("https://www.google.com/search?q={q}")
}

/// A web search in the default browser.
pub fn web_search(query: &str) -> Result<()> {
    let q: String = query
        .trim()
        .bytes()
        .map(|b| match b {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => (b as char).to_string(),
            b' ' => "+".to_string(),
            _ => format!("%{b:02X}"),
        })
        .collect();
    start(&format!("https://www.google.com/search?q={q}"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn names_are_tidied_and_scored() {
        assert_eq!(tidy("the Spotify app."), "spotify");
        assert_eq!(tidy("Google Chrome"), "google chrome");
        assert_eq!(score("chrome", "google chrome"), 80);
        assert_eq!(score("spotify", "spotify"), 100);
        assert!(score("visual studio code", "visual studio code insiders") > 0);
        assert_eq!(score("word", "wordpad"), 0);
    }

    #[test]
    fn built_ins_are_found() {
        assert!(find_app("notepad").is_some());
        assert_eq!(find_app("the calculator app").as_deref().map(|t| t.ends_with(".lnk") || t == "calculator:"), Some(true));
    }
}
