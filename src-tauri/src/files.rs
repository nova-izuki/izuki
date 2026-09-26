//! The Chat tab's hands on your files — like a coding assistant working in
//! a project folder, but for everyone: "find my resume", "what's in my
//! Downloads", "summarise this essay", "save these notes to my Desktop",
//! "zip up my photos from yesterday".
//!
//! Only the written Chat tab gets these (not the voice orb, not the phone).
//! Looking is free to do; changing anything is not: saving a file or running
//! a command is shown to the user as an Allow / No card first (chat.rs), and
//! only their click runs it — so nothing a web page says can make it happen.

use std::path::{Path, PathBuf};
use std::time::{Duration, SystemTime};

use anyhow::{anyhow, Result};

const READ_CHARS: usize = 20_000;
const LIST_MAX: usize = 80;
const FIND_MAX: usize = 25;
/// How many entries a name search looks at before giving up.
const FIND_BUDGET: usize = 60_000;

fn home() -> PathBuf {
    dirs::home_dir().unwrap_or_else(|| PathBuf::from("C:\\"))
}

/// "Desktop/notes.txt", "~/Documents", "C:\\x" → a real path. Relative
/// paths start in the user's home folder.
pub fn resolve(p: &str) -> PathBuf {
    let p = p.trim().trim_matches(|c| c == '"' || c == '\'' || c == '`');
    let named = |name: &str| -> Option<PathBuf> {
        match name.to_lowercase().as_str() {
            "desktop" => dirs::desktop_dir(),
            "documents" | "my documents" => dirs::document_dir(),
            "downloads" => dirs::download_dir(),
            "pictures" | "photos" => dirs::picture_dir(),
            "music" => dirs::audio_dir(),
            "videos" => dirs::video_dir(),
            "home" | "~" => Some(home()),
            _ => None,
        }
    };
    if p.is_empty() {
        return home();
    }
    if let Some(rest) = p.strip_prefix("~/").or_else(|| p.strip_prefix("~\\")) {
        return home().join(rest);
    }
    let path = Path::new(p);
    if path.is_absolute() {
        return path.to_path_buf();
    }
    let mut parts = p.splitn(2, ['/', '\\']);
    let first = parts.next().unwrap_or("");
    if let Some(base) = named(first) {
        return match parts.next() {
            Some(rest) if !rest.is_empty() => base.join(rest),
            _ => base,
        };
    }
    home().join(p)
}

/// Izuki's own settings hold the user's keys — never read out to an AI.
fn off_limits(p: &Path) -> bool {
    let s = p.to_string_lossy().to_lowercase();
    let own = crate::store::data_dir().to_string_lossy().to_lowercase();
    s.starts_with(&own)
        || s.contains("\\.ssh")
        || s.contains("/.ssh")
        || ["id_rsa", "id_ed25519", ".pem", ".key", ".kdbx", "passwords", "password"].iter().any(|b| s.ends_with(b) || s.contains(&format!("{b}.")))
}

fn when(t: SystemTime) -> String {
    let dt: chrono::DateTime<chrono::Local> = t.into();
    dt.format("%Y-%m-%d %H:%M").to_string()
}

fn size(n: u64) -> String {
    match n {
        n if n >= 1 << 30 => format!("{:.1} GB", n as f64 / (1u64 << 30) as f64),
        n if n >= 1 << 20 => format!("{:.1} MB", n as f64 / (1u64 << 20) as f64),
        n if n >= 1 << 10 => format!("{} KB", n >> 10),
        n => format!("{n} B"),
    }
}

/// What's in a folder: folders first, then files, newest first.
pub fn list(path: &str) -> Result<String> {
    let dir = resolve(path);
    if off_limits(&dir) {
        return Err(anyhow!("that folder is private to Izuki"));
    }
    let mut entries: Vec<(bool, String, u64, SystemTime)> = std::fs::read_dir(&dir)
        .map_err(|e| anyhow!("can't open {}: {e}", dir.display()))?
        .filter_map(|e| e.ok())
        .filter_map(|e| {
            let name = e.file_name().to_string_lossy().to_string();
            if name.starts_with('.') || name.eq_ignore_ascii_case("desktop.ini") {
                return None;
            }
            let m = e.metadata().ok()?;
            Some((m.is_dir(), name, m.len(), m.modified().unwrap_or(SystemTime::UNIX_EPOCH)))
        })
        .collect();
    let total = entries.len();
    entries.sort_by(|a, b| b.0.cmp(&a.0).then(b.3.cmp(&a.3)));
    let mut s = format!("{} ({} items):\n", dir.display(), total);
    for (is_dir, name, len, modified) in entries.iter().take(LIST_MAX) {
        if *is_dir {
            s.push_str(&format!("📁 {name}\\\n"));
        } else {
            s.push_str(&format!("   {name} — {}, {}\n", size(*len), when(*modified)));
        }
    }
    if total > LIST_MAX {
        s.push_str(&format!("…and {} more.\n", total - LIST_MAX));
    }
    Ok(s)
}

/// Files whose names contain all the words, in the usual places.
pub fn find(words: &str) -> Result<String> {
    let want: Vec<String> = words.to_lowercase().split_whitespace().map(str::to_string).collect();
    if want.is_empty() {
        return Err(anyhow!("what should I look for?"));
    }
    let mut roots: Vec<PathBuf> = [dirs::desktop_dir(), dirs::document_dir(), dirs::download_dir(), dirs::picture_dir(), dirs::video_dir(), dirs::audio_dir()]
        .into_iter()
        .flatten()
        .collect();
    // OneDrive keeps its own copies of Desktop/Documents.
    if let Ok(rd) = std::fs::read_dir(home()) {
        for e in rd.flatten() {
            if e.file_name().to_string_lossy().starts_with("OneDrive") {
                roots.push(e.path());
            }
        }
    }
    let skip = ["node_modules", "appdata", ".git", "$recycle.bin", "cache", "temp"];
    let mut hits: Vec<(SystemTime, PathBuf)> = Vec::new();
    let mut budget = FIND_BUDGET;
    let mut stack: Vec<(PathBuf, u8)> = roots.into_iter().map(|r| (r, 0)).collect();
    let mut seen = std::collections::HashSet::new();
    let started = std::time::Instant::now();
    while let Some((dir, depth)) = stack.pop() {
        if budget == 0 || started.elapsed() > Duration::from_secs(12) || !seen.insert(dir.clone()) {
            continue;
        }
        let Ok(rd) = std::fs::read_dir(&dir) else { continue };
        for e in rd.flatten() {
            budget = budget.saturating_sub(1);
            let name = e.file_name().to_string_lossy().to_lowercase();
            if name.starts_with('.') {
                continue;
            }
            let Ok(ft) = e.file_type() else { continue };
            if ft.is_dir() {
                if depth < 6 && !skip.iter().any(|s| name.contains(s)) {
                    stack.push((e.path(), depth + 1));
                }
                if want.iter().all(|w| name.contains(w)) {
                    hits.push((SystemTime::UNIX_EPOCH, e.path()));
                }
            } else if want.iter().all(|w| name.contains(w)) {
                let t = e.metadata().and_then(|m| m.modified()).unwrap_or(SystemTime::UNIX_EPOCH);
                hits.push((t, e.path()));
            }
        }
    }
    if hits.is_empty() {
        return Ok(format!("No files named like \"{words}\" in Desktop, Documents, Downloads, Pictures, Music, Videos or OneDrive."));
    }
    hits.sort_by(|a, b| b.0.cmp(&a.0));
    let mut s = format!("Files matching \"{words}\" (newest first):\n");
    for (t, p) in hits.iter().take(FIND_MAX) {
        if *t == SystemTime::UNIX_EPOCH {
            s.push_str(&format!("📁 {}\n", p.display()));
        } else {
            s.push_str(&format!("{} — {}\n", p.display(), when(*t)));
        }
    }
    Ok(s)
}

/// A file's words: text and code as-is, Word and PowerPoint unpacked.
pub fn read(path: &str) -> Result<String> {
    let p = resolve(path);
    if off_limits(&p) {
        return Err(anyhow!("that file is private"));
    }
    if p.is_dir() {
        return list(path);
    }
    let ext = p.extension().map(|e| e.to_string_lossy().to_lowercase()).unwrap_or_default();
    let text = match ext.as_str() {
        "docx" => office_text(&p, |n| n == "word/document.xml")?,
        "pptx" => office_text(&p, |n| n.starts_with("ppt/slides/slide") && n.ends_with(".xml"))?,
        "pdf" => return Err(anyhow!("PDFs can't be read as text here — open it on screen and ask me there")),
        "exe" | "dll" | "zip" | "png" | "jpg" | "jpeg" | "gif" | "mp3" | "mp4" | "mov" | "iso" => {
            let m = std::fs::metadata(&p)?;
            return Ok(format!("{} is a {} file ({}), not text.", p.display(), ext, size(m.len())));
        }
        _ => {
            let bytes = std::fs::read(&p).map_err(|e| anyhow!("can't open {}: {e}", p.display()))?;
            if bytes.iter().take(4000).filter(|b| **b == 0).count() > 4 {
                return Ok(format!("{} isn't a text file.", p.display()));
            }
            String::from_utf8_lossy(&bytes).into_owned()
        }
    };
    let total = text.chars().count();
    let mut s = format!("{}:\n{}", p.display(), crate::web::clip(&text, READ_CHARS));
    if total > READ_CHARS {
        s.push_str(&format!("\n(Only the first {READ_CHARS} of {total} characters.)"));
    }
    Ok(s)
}

/// The words inside a Word or PowerPoint file (they're zipped XML).
fn office_text(p: &Path, part: impl Fn(&str) -> bool) -> Result<String> {
    use std::io::Read;
    let mut zip = zip::ZipArchive::new(std::fs::File::open(p)?)?;
    let mut names: Vec<String> = zip.file_names().filter(|n| part(n)).map(str::to_string).collect();
    // slide2 before slide10.
    names.sort_by_key(|n| (n.len(), n.clone()));
    let mut out = String::new();
    for (i, name) in names.iter().enumerate() {
        let mut xml = String::new();
        zip.by_name(name)?.read_to_string(&mut xml)?;
        if names.len() > 1 {
            out.push_str(&format!("\n--- Slide {} ---\n", i + 1));
        }
        out.push_str(&xml_words(&xml));
    }
    Ok(out)
}

/// Text runs out of Office XML, a new line per paragraph.
fn xml_words(xml: &str) -> String {
    let xml = xml.replace("</w:p>", "\n").replace("</a:p>", "\n").replace("<w:tab/>", "\t");
    let mut out = String::new();
    let mut in_tag = false;
    for c in xml.chars() {
        match c {
            '<' => in_tag = true,
            '>' => in_tag = false,
            c if !in_tag => out.push(c),
            _ => {}
        }
    }
    out.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", "\"").replace("&apos;", "'")
}

/// Save `content` to `path` (only ever after the user clicked Allow). An
/// existing file is kept as a backup next to it first.
pub fn write(path: &str, content: &str) -> Result<String> {
    let p = resolve(path);
    if off_limits(&p) {
        return Err(anyhow!("that place is private to Izuki"));
    }
    if let Some(dir) = p.parent() {
        std::fs::create_dir_all(dir)?;
    }
    let mut note = String::new();
    if p.exists() {
        let stem = p.file_stem().map(|s| s.to_string_lossy().to_string()).unwrap_or_default();
        let ext = p.extension().map(|e| format!(".{}", e.to_string_lossy())).unwrap_or_default();
        let backup = p.with_file_name(format!("{stem} (before Izuki){ext}"));
        std::fs::copy(&p, &backup)?;
        note = format!(" (the old version is kept as {})", backup.display());
    }
    std::fs::write(&p, content)?;
    Ok(format!("Saved {}{note}.", p.display()))
}

/// Run a PowerShell command (only ever after the user clicked Allow) and
/// return what it printed.
pub fn run(command: &str) -> Result<String> {
    use std::io::Read;
    let mut cmd = std::process::Command::new("powershell.exe");
    cmd.args(["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", command])
        .current_dir(home())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped());
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x0800_0000); // no console window
    }
    let mut child = cmd.spawn().map_err(|e| anyhow!("couldn't start PowerShell: {e}"))?;
    let started = std::time::Instant::now();
    let status = loop {
        if let Some(s) = child.try_wait()? {
            break Some(s);
        }
        if started.elapsed() > Duration::from_secs(90) {
            let _ = child.kill();
            break None;
        }
        std::thread::sleep(Duration::from_millis(100));
    };
    let mut out = String::new();
    let mut err = String::new();
    if let Some(mut o) = child.stdout.take() {
        let _ = o.read_to_string(&mut out);
    }
    if let Some(mut e) = child.stderr.take() {
        let _ = e.read_to_string(&mut err);
    }
    let mut s = match status {
        None => "It took over 90 seconds, so I stopped it.\n".to_string(),
        Some(st) if st.success() => "Done.\n".to_string(),
        Some(st) => format!("It finished with an error (code {}).\n", st.code().unwrap_or(-1)),
    };
    if !out.trim().is_empty() {
        s.push_str(&crate::web::clip(out.trim(), 6000));
        s.push('\n');
    }
    if !err.trim().is_empty() {
        s.push_str("Errors:\n");
        s.push_str(&crate::web::clip(err.trim(), 2000));
    }
    Ok(s)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn named_folders_resolve() {
        assert_eq!(resolve("Desktop/notes.txt"), dirs::desktop_dir().unwrap().join("notes.txt"));
        assert_eq!(resolve("~/x.txt"), home().join("x.txt"));
        assert_eq!(resolve("essay.docx"), home().join("essay.docx"));
    }

    #[test]
    fn keeps_secrets_private() {
        assert!(off_limits(&crate::store::data_dir().join("settings.json")));
        assert!(off_limits(Path::new("C:\\Users\\a\\.ssh\\id_rsa")));
        assert!(!off_limits(Path::new("C:\\Users\\a\\Documents\\essay.docx")));
    }

    #[test]
    fn office_xml_to_words() {
        let xml = r#"<w:body><w:p><w:r><w:t>Hello &amp; welcome</w:t></w:r></w:p><w:p><w:r><w:t>Line two</w:t></w:r></w:p></w:body>"#;
        assert_eq!(xml_words(xml).trim(), "Hello & welcome\nLine two");
    }

    #[test]
    fn saves_with_a_backup() {
        let dir = std::env::temp_dir().join(format!("izuki-files-{}", std::process::id()));
        let f = dir.join("a.txt");
        let path = f.to_string_lossy().to_string();
        write(&path, "one").unwrap();
        let msg = write(&path, "two").unwrap();
        assert!(msg.contains("before Izuki"), "{msg}");
        assert_eq!(std::fs::read_to_string(&f).unwrap(), "two");
        assert_eq!(std::fs::read_to_string(dir.join("a (before Izuki).txt")).unwrap(), "one");
        assert!(read(&path).unwrap().contains("two"));
        let _ = std::fs::remove_dir_all(dir);
    }
}
