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

/// Open an app by name. `Err` if nothing installed matches.
pub fn open_app(name: &str) -> Result<String> {
    let target = find_app(name).ok_or_else(|| anyhow!("no app called \"{}\" is installed", name.trim()))?;
    start(&target)?;
    let shown = Path::new(&target).file_stem().and_then(|s| s.to_str()).unwrap_or(name).to_string();
    Ok(shown)
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
