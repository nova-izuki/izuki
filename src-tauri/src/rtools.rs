//! Files and a terminal for the phone remote (remote.rs / call.rs), for a
//! phone you allowed on this PC only.
//!
//! Files: only inside your own folders (Desktop, Documents, Downloads,
//! Pictures, Music, Videos) — every path is checked to really sit inside one
//! of them, so "..\..\Windows" or a shortcut can't lead out. Download, upload,
//! new folder, rename; nothing is ever overwritten or deleted from here.
//!
//! Terminal: PowerShell, only while "Let my phone use the terminal" is on.
//! A command that only looks (chat::looks_only — the Chat tab's own rule)
//! runs at once; anything that could change something is shown back first
//! and runs only when the phone confirms that exact command. Never while
//! the PC is locked; every command is written to the remote audit log.

use std::path::{Path, PathBuf};

use anyhow::{anyhow, bail, Result};
use serde_json::{json, Value};

/// Uploads bigger than this are refused (the phone says so).
pub const UPLOAD_MAX: u64 = 200 * 1024 * 1024;
/// Downloads bigger than this too.
pub const DOWNLOAD_MAX: u64 = 1024 * 1024 * 1024;

/// Your own folders: the only places the phone can see.
fn roots() -> Vec<(String, PathBuf)> {
    [
        ("Desktop", dirs::desktop_dir()),
        ("Documents", dirs::document_dir()),
        ("Downloads", dirs::download_dir()),
        ("Pictures", dirs::picture_dir()),
        ("Music", dirs::audio_dir()),
        ("Videos", dirs::video_dir()),
    ]
    .into_iter()
    .filter_map(|(n, p)| p.and_then(|p| std::fs::canonicalize(p).ok()).map(|p| (n.to_string(), p)))
    .collect()
}

/// A path the phone asked for, only if it really sits inside one of your
/// folders (checked after resolving links and "..").
fn inside(path: &str) -> Result<PathBuf> {
    let real = std::fs::canonicalize(path.trim()).map_err(|_| anyhow!("not found"))?;
    if roots().iter().any(|(_, r)| real.starts_with(r)) {
        Ok(real)
    } else {
        bail!("outside your folders")
    }
}

/// A new name in a folder: one plain name, no slashes, no "..", nothing hidden.
fn plain_name(name: &str) -> Result<String> {
    let n = name.trim();
    if n.is_empty() || n.len() > 200 || n == "." || n == ".." || n.contains(['/', '\\', ':', '*', '?', '"', '<', '>', '|']) || n.chars().any(char::is_control) {
        bail!("that name can't be used");
    }
    Ok(n.to_string())
}

/// Never overwrite: "photo.jpg" → "photo (2).jpg" if it's taken.
fn free_path(dir: &Path, name: &str) -> PathBuf {
    let first = dir.join(name);
    if !first.exists() {
        return first;
    }
    let (stem, ext) = match name.rfind('.') {
        Some(i) if i > 0 => (&name[..i], &name[i..]),
        _ => (name, ""),
    };
    (2..1000).map(|n| dir.join(format!("{stem} ({n}){ext}"))).find(|p| !p.exists()).unwrap_or(first)
}

pub fn file_roots() -> Value {
    json!({ "roots": roots().into_iter().map(|(n, p)| json!({ "name": n, "path": p.to_string_lossy() })).collect::<Vec<_>>() })
}

pub fn file_list(path: &str) -> Result<Value> {
    let dir = inside(path)?;
    let mut items = Vec::new();
    for e in std::fs::read_dir(&dir)?.flatten().take(2000) {
        let Ok(meta) = e.metadata() else { continue };
        let name = e.file_name().to_string_lossy().to_string();
        if name.starts_with('.') || name.eq_ignore_ascii_case("desktop.ini") || name.eq_ignore_ascii_case("thumbs.db") {
            continue;
        }
        let modified = meta.modified().ok().and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok()).map(|d| d.as_millis() as u64).unwrap_or(0);
        items.push(json!({ "name": name, "dir": meta.is_dir(), "size": meta.len(), "modified": modified }));
    }
    items.sort_by(|a, b| b["dir"].as_bool().cmp(&a["dir"].as_bool()).then_with(|| a["name"].as_str().unwrap_or("").to_lowercase().cmp(&b["name"].as_str().unwrap_or("").to_lowercase())));
    // The folder above, unless this is one of your folders itself.
    let up = dir.parent().filter(|p| roots().iter().any(|(_, r)| p.starts_with(r))).map(|p| p.to_string_lossy().to_string());
    Ok(json!({ "path": dir.to_string_lossy(), "up": up, "items": items }))
}

/// A file to send to the phone: (its name, the open file, its size).
pub fn file_get(path: &str) -> Result<(String, std::fs::File, u64)> {
    let p = inside(path)?;
    let meta = std::fs::metadata(&p)?;
    if !meta.is_file() {
        bail!("that's a folder");
    }
    if meta.len() > DOWNLOAD_MAX {
        bail!("too big to download from the phone (over 1 GB)");
    }
    let name = p.file_name().map(|n| n.to_string_lossy().to_string()).unwrap_or_else(|| "file".into());
    Ok((name, std::fs::File::open(&p)?, meta.len()))
}

/// Save what the phone sent into one of your folders (never over another file).
pub fn file_put(dir: &str, name: &str, body: &mut dyn std::io::Read, len: Option<usize>) -> Result<Value> {
    let dir = inside(dir)?;
    if !dir.is_dir() {
        bail!("that's not a folder");
    }
    if len.is_some_and(|l| l as u64 > UPLOAD_MAX) {
        bail!("too big (the most is 200 MB)");
    }
    let name = plain_name(name)?;
    // Each upload its own side file; the final name is claimed atomically
    // (a hard link fails if the name is taken), so two uploads at once can
    // never land on — or replace — the same file.
    let tmp = dir.join(format!(".izuki-upload-{:016x}", rand::random::<u64>()));
    let written = {
        let mut out = std::fs::OpenOptions::new().write(true).create_new(true).open(&tmp)?;
        std::io::copy(&mut std::io::Read::take(body, UPLOAD_MAX + 1), &mut out)
    };
    match written {
        Ok(n) if n > UPLOAD_MAX => {
            let _ = std::fs::remove_file(&tmp);
            bail!("too big (the most is 200 MB)")
        }
        Ok(_) => {
            let (stem, ext) = match name.rfind('.') {
                Some(i) if i > 0 => (name[..i].to_string(), name[i..].to_string()),
                _ => (name.clone(), String::new()),
            };
            for n in 1..1000 {
                let target = if n == 1 { dir.join(&name) } else { dir.join(format!("{stem} ({n}){ext}")) };
                match std::fs::hard_link(&tmp, &target) {
                    Ok(()) => {
                        let _ = std::fs::remove_file(&tmp);
                        return Ok(json!({ "ok": true, "saved": target.to_string_lossy() }));
                    }
                    Err(e) if e.kind() == std::io::ErrorKind::AlreadyExists => continue,
                    Err(e) => {
                        let _ = std::fs::remove_file(&tmp);
                        return Err(anyhow!("couldn't save it: {e}"));
                    }
                }
            }
            let _ = std::fs::remove_file(&tmp);
            bail!("too many files with that name")
        }
        Err(e) => {
            let _ = std::fs::remove_file(&tmp);
            Err(anyhow!("the upload stopped: {e}"))
        }
    }
}

pub fn file_mkdir(dir: &str, name: &str) -> Result<Value> {
    let dir = inside(dir)?;
    let target = free_path(&dir, &plain_name(name)?);
    std::fs::create_dir(&target)?;
    Ok(json!({ "ok": true, "path": target.to_string_lossy() }))
}

pub fn file_rename(path: &str, name: &str) -> Result<Value> {
    let p = inside(path)?;
    if roots().iter().any(|(_, r)| *r == p) {
        bail!("your main folders keep their names");
    }
    let parent = p.parent().ok_or_else(|| anyhow!("can't rename that"))?;
    let target = parent.join(plain_name(name)?);
    if target.exists() {
        bail!("something with that name is already there");
    }
    std::fs::rename(&p, &target)?;
    Ok(json!({ "ok": true, "path": target.to_string_lossy() }))
}

/// "%41b" → "Ab": a query value as sent by the phone (encodeURIComponent).
pub fn unescape(s: &str) -> String {
    let b = s.as_bytes();
    let mut out = Vec::with_capacity(b.len());
    let mut i = 0;
    while i < b.len() {
        match b[i] {
            b'%' if i + 2 < b.len() => {
                match u8::from_str_radix(std::str::from_utf8(&b[i + 1..i + 3]).unwrap_or(""), 16) {
                    Ok(v) => {
                        out.push(v);
                        i += 3;
                    }
                    Err(_) => {
                        out.push(b'%');
                        i += 1;
                    }
                }
            }
            b'+' => {
                out.push(b' ');
                i += 1;
            }
            c => {
                out.push(c);
                i += 1;
            }
        }
    }
    String::from_utf8_lossy(&out).into_owned()
}

/// A terminal command from the phone. One that only looks runs at once;
/// anything else needs `confirmed` (the phone shows it back first).
pub fn terminal(cmd: &str, confirmed: bool) -> Result<Value> {
    let on = crate::state::try_store().is_some_and(|s| s.settings().phone_terminal);
    if !on {
        bail!("terminal_off");
    }
    let cmd = cmd.trim();
    if cmd.is_empty() || cmd.len() > 4000 {
        bail!("empty or too long");
    }
    if !crate::chat::looks_only(cmd) && !confirmed {
        return Ok(json!({ "ok": true, "needs_ok": true, "message": "This could change things on your PC. Run it?" }));
    }
    let out = crate::files::run(cmd)?;
    Ok(json!({ "ok": true, "output": out }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn nothing_outside_your_folders() {
        assert!(inside("C:\\Windows\\System32").is_err());
        assert!(inside("C:\\").is_err());
        if let Some(docs) = dirs::document_dir() {
            let sneaky = docs.join("..").join("..").join("..").join("Windows");
            assert!(inside(&sneaky.to_string_lossy()).is_err());
            assert!(inside(&docs.to_string_lossy()).is_ok());
        }
    }

    #[test]
    fn names_stay_plain() {
        for bad in ["", "..", "a/b", "a\\b", "..\\x", "c:x", "x?", "\u{7}bell"] {
            assert!(plain_name(bad).is_err(), "{bad:?}");
        }
        assert_eq!(plain_name(" notes.txt ").unwrap(), "notes.txt");
    }

    #[test]
    fn reads_what_the_phone_sent() {
        assert_eq!(unescape("My%20Files%2Fnotes%2B1.txt"), "My Files/notes+1.txt");
        assert_eq!(unescape("a+b"), "a b");
        assert_eq!(unescape("100%"), "100%");
        assert_eq!(unescape("%E2%9C%93"), "✓");
    }

    #[test]
    fn terminal_is_off_by_default() {
        assert!(!crate::settings::Settings::default().phone_terminal);
        assert!(!crate::settings::Settings::default().phone_remote);
        assert!(terminal("Get-Date", false).is_err());
    }
}
