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
use std::io::Write;

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
/// The one place inside Izuki's own folder an edit may reach: the staged
/// copies of files the person attached. Everything else there (settings,
/// memories, logs) stays private; writes never use this exception.
pub fn is_staged_attachment(p: &Path) -> bool {
    p.starts_with(crate::store::data_dir().join("attachments"))
}

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

/// An IO error said in plain words: "the disk is full" beats "os error 112".
fn what_io(e: &std::io::Error) -> String {
    match e.raw_os_error() {
        Some(112) => "the disk is full — free some space and try again".into(),
        Some(5) => "Windows said no (the file may be open, or the folder is write-protected)".into(),
        Some(32) => "the file is open in another program — close it and try again".into(),
        _ => e.to_string(),
    }
}

/// Put `bytes` in place of `tmp`'s target as one move — no moment where the
/// file exists only half-written. The temp file (`tmp`) must be on the same
/// drive as the target.
#[cfg(windows)]
fn replace(tmp: &Path, target: &Path) -> std::io::Result<()> {
    use std::os::windows::ffi::OsStrExt;
    use windows::core::PCWSTR;
    use windows::Win32::Storage::FileSystem::{MoveFileExW, MOVEFILE_REPLACE_EXISTING, MOVEFILE_WRITE_THROUGH};
    // PCWSTR needs the string to outlive the call, so the Vecs live here.
    let a: Vec<u16> = tmp.as_os_str().encode_wide().chain([0]).collect();
    let b: Vec<u16> = target.as_os_str().encode_wide().chain([0]).collect();
    let ok = unsafe {
        MoveFileExW(PCWSTR(a.as_ptr()), PCWSTR(b.as_ptr()), MOVEFILE_REPLACE_EXISTING | MOVEFILE_WRITE_THROUGH)
    };
    ok.map_err(|e| {
        // HRESULT 0x8007xxxx = a Windows error: keep its number so `what_io`
        // can still say it plainly (0x0070 = disk full).
        let code = e.code().0 & 0xFFFF;
        if code > 0 { std::io::Error::from_raw_os_error(code) } else { std::io::Error::other(e.to_string()) }
    })
}

#[cfg(not(windows))]
fn replace(tmp: &Path, target: &Path) -> std::io::Result<()> {
    std::fs::rename(tmp, target) // on POSIX this already replaces the target
}

/// Save `data`'s bytes to `p` so a crash or a full disk can't leave half a
/// file behind: everything is written to a hidden temp file beside it, that
/// is flushed to the drive, and only then does it replace the real file in
/// one move. If anything fails on the way, the temp file is removed and the
/// file that was there before is still exactly as it was. `data` runs only
/// after the temp file exists, so a failure before any byte is spent costs
/// nothing (it's how Office files tailor themselves to the save).
pub(crate) fn atomic_save(p: &Path, data: impl FnOnce() -> Result<Vec<u8>>) -> Result<()> {
    let dir = p
        .parent()
        .filter(|d| !d.as_os_str().is_empty())
        .ok_or_else(|| anyhow!("{} has no folder to save into", p.display()))?;
    std::fs::create_dir_all(dir).map_err(|e| anyhow!("couldn't create {}: {e}", dir.display()))?;
    let stem = p.file_name().map(|s| s.to_string_lossy().to_string()).unwrap_or_default();
    // A crash can leave a half-finished save behind. The pattern is only
    // ever Izuki's own (a dot name here), and an hour-old one belongs to a
    // dead process — sweep those so a badly crashed save never litters a
    // folder with dozens of tombstones and then refuses to save again.
    if let Ok(entries) = std::fs::read_dir(dir) {
        let an_hour_ago = SystemTime::now().checked_sub(Duration::from_secs(3600)).unwrap_or(
            SystemTime::UNIX_EPOCH,
        );
        for e in entries.filter_map(|e| e.ok()) {
            let name = e.file_name().to_string_lossy().to_string();
            if name.starts_with(&format!(".{stem}.izuki-tmp"))
                && e.metadata().ok().map(|m| m.modified().ok().map(|t| t < an_hour_ago)) == Some(Some(true))
            {
                let _ = std::fs::remove_file(e.path());
            }
        }
    }
    // A hidden name: [FIND:] and [LIST:] skip them (name.startswith('.')).
    let tmp = (1..100)
        .map(|n| dir.join(format!(".{stem}.izuki-tmp{n}")))
        .find(|c| !c.exists())
        .ok_or_else(|| anyhow!("{} has dozens of half-finished saves already", dir.display()))?;
    let run = (|| -> Result<()> {
        let bytes = data()?;
        let mut f = std::fs::File::create(&tmp).map_err(|e| anyhow!("couldn't start saving {}: {}", p.display(), what_io(&e)))?;
        if let Err(e) = f.write_all(&bytes).and_then(|_| f.sync_all()) {
            return Err(anyhow!("couldn't save {}: {}. The old file is untouched.", p.display(), what_io(&e)));
        }
        // From here on the drive has the whole file; the swap itself is one move.
        replace(&tmp, p).map_err(|e| anyhow!("couldn't put the new {} in place: {}. The old file is untouched.", p.display(), what_io(&e)))
    })();
    if run.is_err() {
        let _ = std::fs::remove_file(&tmp);
    }
    // The owner-only observer likes knowing when a save finished (dev builds
    // only: the `devvision` feature), so the timeline can show the frame of
    // the app right after a save landed.
    #[cfg(feature = "devvision")]
    if run.is_ok() {
        crate::observer::record("action", format!("atomic save finished: {}", p.display()));
    }
    run
}

/// Where an overwritten file's old copy goes: "report (before Izuki).txt",
/// then "(before Izuki 2)" and on — a second save never steals the first
/// backup, so the version from two saves ago still exists.
fn backup_path(p: &Path) -> PathBuf {
    let stem = p.file_stem().map(|s| s.to_string_lossy().to_string()).unwrap_or_else(|| "file".into());
    let ext = p.extension().map(|e| format!(".{}", e.to_string_lossy())).unwrap_or_default();
    let mut n = 1;
    loop {
        let name = if n == 1 { format!("{stem} (before Izuki){ext}") } else { format!("{stem} (before Izuki {n}){ext}") };
        let b = p.with_file_name(name);
        if !b.exists() {
            return b;
        }
        n += 1;
    }
}

/// Files where plain text would be damage, not words: pictures, music,
/// video, archives, installers, old Word/Excel (they're all true binary
/// containers), and anything whose bytes say so. FL Studio's .flp is text
/// at heart and has no signature here — it stays writable. The signatures
/// are built from their numbers so no escape sequence can be mistyped.
fn looks_binary(b: &[u8]) -> bool {
    if b.iter().take(4000).filter(|x| **x == 0).count() > 4 {
        return true; // binary data has zero bytes; text does not
    }
    // zip ("PK"): any docx/xlsx/pptx too; then 7z, gz, bz2, PNG, JPEG,
    // GIF, MP3, WAV/AVI/WebP (RIFF), Ogg, PDF, Windows programs, the old
    // Word/Excel format (0xD0 0xCF 11 E0), SMB, and the MP3 sync word
    let sigs: [&[u8]; 15] = [
        &[0x50u8, 0x4B, 0x03, 0x04],
        &[0x50u8, 0x4B, 0x05, 0x06],
        &[0x37u8, 0x7A, 0xBC, 0xAF, 0x27, 0x1C],
        &[0x1Fu8, 0x8B],
        &[0x42u8, 0x5A, 0x68],
        &[0x89u8, 0x50, 0x4E, 0x47],
        &[0xFFu8, 0xD8, 0xFF],
        b"GIF8",
        b"ID3",
        b"RIFF",
        b"OggS",
        b"%PDF",
        b"MZ",
        &[0xD0u8, 0xCF, 0x11, 0xE0],
        &[0xFFu8, 0x53, 0x4D, 0x42],
    ];
    sigs.iter().any(|s| b.starts_with(s))
        // an MP3 (or any MPEG audio) begins with a sync word: eleven 1s, then two more
        || (b.len() >= 2 && b[0] == 0xFF && (b[1] & 0xE0) == 0xE0)
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
        // Each cell with its address ("B3: 42"), so an edit can name it.
        "xlsx" => crate::officeedit::read_xlsx(&p)?,
        // A PDF's words, page by page. To change one: [WRITE:] its text as a .docx.
        "pdf" => crate::textbook::pdf_text(&p, READ_CHARS + 2_000)?,
        // LibreOffice / OpenDocument: zipped XML too.
        "odt" | "ods" | "odp" => office_text(&p, |n| n == "content.xml")?,
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
    let xml = xml
        .replace("</w:p>", "\n")
        .replace("</a:p>", "\n")
        .replace("<w:tab/>", "\t")
        .replace("</text:p>", "\n")
        .replace("</text:h>", "\n")
        .replace("<text:tab/>", "\t")
        .replace("</table:table-cell>", " | ")
        .replace("</table:table-row>", "\n");
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
    // Plain text saved as report.docx made a file Word couldn't open.
    if crate::officeedit::is_office(&p) && p.exists() {
        return Err(anyhow!("{} is an Office file: plain text would break it. Change it with [EDIT: path] (REPLACE/WITH, ADD AFTER/TEXT, ADD, CELL lines) — the changes go into a copy beside it", p.display()));
    }
    // A new Word or Excel file from text: built as a real one.
    let ext = p.extension().map(|e| e.to_string_lossy().to_lowercase()).unwrap_or_default();
    let office = match ext.as_str() {
        "docx" => Some(("Word", crate::officeedit::new_docx(content)?)),
        "xlsx" => Some(("Excel", crate::officeedit::new_xlsx(content)?)),
        "pptx" => return Err(anyhow!("making a new slide deck isn't something I can do yet — I can edit an existing .pptx with [EDIT:]")),
        "pdf" | "doc" | "xls" | "ppt" => return Err(anyhow!("I can't make a .{ext} — save it as .docx or .xlsx (Word and Excel open those)")),
        _ => None,
    };
    if let Some((kind, bytes)) = office {
        // A brand-new Office file is checked before any of it lands: the
        // zip opens and the parts it declares are really there. If not,
        // it's torn up and that is said — never saved as a broken file.
        crate::officeedit::validate_new(ext.as_str(), &bytes)
            .map_err(|e| anyhow!("the new {ext} didn't pass its own integrity check, so I threw it away: {e}"))?;
        let mut note = String::new();
        if p.exists() {
            let backup = backup_path(&p);
            std::fs::copy(&p, &backup)?;
            note = format!(" (the old version is kept as {})", backup.display());
        }
        atomic_save(&p, || Ok(bytes))?;
        return Ok(format!("Made {} (a real {kind} file).{note}", p.display()));
    }
    let mut note = String::new();
    if p.exists() {
        // Only the start: looks_binary reads no further, and the file could be
        // a video of several gigabytes.
        let mut old = Vec::with_capacity(8192);
        std::fs::File::open(&p)
            .and_then(|f| std::io::Read::read_to_end(&mut std::io::Read::take(f, 8192), &mut old))
            .map_err(|e| anyhow!("couldn't open {}: {e}", p.display()))?;
        if looks_binary(&old) {
            return Err(anyhow!("{} isn't a text file (a picture, archive or a program), and plain words written over it would ruin it. I left it alone — save the words under a new name", p.display()));
        }
        let backup = backup_path(&p);
        std::fs::copy(&p, &backup)?;
        note = format!(" (the old version is kept as {})", backup.display());
    }
    atomic_save(&p, || Ok(content.to_owned().into_bytes()))?;
    Ok(format!("Saved {}{note}.", p.display()))
}

/// Edit a file into a copy beside it (only ever after the user clicked
/// Allow): Word, PowerPoint, Excel and PDFs keep their structure
/// (officeedit.rs). Staged attachment copies are editable here even though
/// they live inside Izuki's own folder; nothing else in there is.
/// Returns the words for the reply and the copy it wrote, so the chat can
/// open exactly that file.
pub fn edit(path: &str, body: &str) -> Result<(String, PathBuf)> {
    let p = resolve(path);
    if off_limits(&p) && !is_staged_attachment(&p) {
        return Err(anyhow!("that file is private"));
    }
    if !p.is_file() {
        return Err(anyhow!("{} isn't there — find it first with [FIND:]", p.display()));
    }
    let edits = crate::officeedit::parse_edits(body);
    let (copy, report) = crate::officeedit::apply(&p, &edits)?;
    let said = format!("Saved the changes as a copy: {} (the original is untouched).\n{}", copy.display(), report.iter().map(|l| format!("• {l}")).collect::<Vec<_>>().join("\n"));
    Ok((said, copy))
}

/// Run a PowerShell command (only ever after the user clicked Allow) and
/// return what it printed.
pub fn run(command: &str) -> Result<String> {
    run_within(command, Duration::from_secs(90))
}

/// [`run`] with its own time limit: stopped (and said so) past `limit`.
pub fn run_within(command: &str, limit: Duration) -> Result<String> {
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
    // Read what it prints *while* it runs: a command with a lot to say (the
    // installed-apps list) otherwise fills the pipe, stalls, and hits the
    // 90-second limit with half an answer.
    // Each pipe is read on its own thread and handed back over a channel, so
    // waiting for it can be bounded: a program the command started may keep
    // the pipe open after the command itself has been stopped.
    let drain = |pipe: Option<Box<dyn Read + Send>>| {
        let (tx, rx) = std::sync::mpsc::channel::<String>();
        std::thread::spawn(move || {
            let mut text = String::new();
            if let Some(mut p) = pipe {
                let mut bytes = Vec::new();
                let _ = p.read_to_end(&mut bytes);
                text = String::from_utf8_lossy(&bytes).into_owned();
            }
            let _ = tx.send(text);
        });
        rx
    };
    let out_reader = drain(child.stdout.take().map(|p| Box::new(p) as Box<dyn Read + Send>));
    let err_reader = drain(child.stderr.take().map(|p| Box::new(p) as Box<dyn Read + Send>));
    let started = std::time::Instant::now();
    let status = loop {
        if let Some(s) = child.try_wait()? {
            break Some(s);
        }
        if started.elapsed() > limit {
            let _ = child.kill();
            break None;
        }
        std::thread::sleep(Duration::from_millis(100));
    };
    // Finished: what it printed comes right away. Stopped: a couple of seconds at most.
    let wait = if status.is_some() { Duration::from_secs(30) } else { Duration::from_secs(2) };
    let out = out_reader.recv_timeout(wait).unwrap_or_default();
    let err = err_reader.recv_timeout(wait).unwrap_or_default();
    let mut s = match status {
        None => format!("It took over {} seconds, so I stopped it.\n", limit.as_secs()),
        Some(st) if st.success() => "Done.\n".to_string(),
        // Told to skip what it can't touch (files in use, already gone) and it
        // did: that's done, with some things skipped — not a failure.
        Some(_) if err.trim().is_empty() && command.to_lowercase().contains("silentlycontinue") => "Done — a few items were skipped (in use or protected).\n".to_string(),
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

/// Run a command and say whether it really worked (finished cleanly, no
/// errors printed) — for Izuki's own actions, which must not claim success
/// when Windows said no.
pub fn run_ok(command: &str) -> bool {
    run(command).is_ok_and(|s| s.starts_with("Done.") && !s.contains("Errors:"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_staged_attachments_are_editable_inside_izukis_own_folder() {
        let root = crate::store::data_dir();
        assert!(is_staged_attachment(&root.join("attachments").join("report-abc123.pdf")));
        assert!(!is_staged_attachment(&root.join("settings.json")), "settings stay private");
        assert!(!is_staged_attachment(&root.join("memories").join("note.json")), "memories stay private");
        assert!(!is_staged_attachment(&root.join("attachments-old.pdf")), "a lookalike sibling isn't inside the folder");
    }

    #[test]
    fn an_edit_returns_the_copy_it_wrote() {
        let dir = std::env::temp_dir().join(format!("izuki-edit-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let src = dir.join("notes.txt");
        std::fs::write(&src, "line one\nline two\n").unwrap();
        let (said, copy) = edit(&src.to_string_lossy(), "REPLACE: two\nWITH: 2").unwrap();
        assert!(copy.exists(), "the copy is really there: {}", copy.display());
        assert_eq!(std::fs::read_to_string(&copy).unwrap(), "line one\nline 2\n");
        assert_eq!(std::fs::read_to_string(&src).unwrap(), "line one\nline two\n", "the original is untouched");
        assert!(said.contains("copy"), "{said}");
        let _ = std::fs::remove_dir_all(dir);
    }

    #[test]
    #[cfg(windows)]
    fn long_output_does_not_stall() {
        // ~200 KB of output: used to fill the pipe and hang until the 90 s limit.
        //
        // The thing that goes wrong here is a deadlock, which shows up as
        // hitting that limit and losing the output — not as being slow. This
        // test used to allow 30 s and failed at 41 s on a loaded laptop
        // (PowerShell's own start-up is seconds before a single line is
        // printed), which is a test reporting the machine rather than the
        // code. So: it has to come back under the limit, and it has to come
        // back whole.
        let started = std::time::Instant::now();
        let out = run("1..4000 | ForEach-Object { 'line number ' + $_ + ' of a long listing that keeps going' }").unwrap();
        assert!(started.elapsed() < Duration::from_secs(85), "took {:?} — the pipe deadlocked", started.elapsed());
        assert!(out.starts_with("Done."));
        // A deadlock loses everything after the pipe filled up; a clean run
        // is cut only by the 6000-character clip.
        assert!(out.contains("line number 1 of"), "the start of the output is missing");
        assert!(out.len() > 5000, "only {} characters came back", out.len());
        assert!(!run_ok("exit 3"));
        assert!(run_ok("Write-Output ok"));
    }

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

    #[test]
    fn repeat_saves_keep_every_backup() {
        // The old code wrote every save over the same "(before Izuki)"
        // backup, so three saves left only the second-newest version.
        let dir = std::env::temp_dir().join(format!("izuki-backups-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let path = dir.join("notes.md").to_string_lossy().to_string();
        write(&path, "v1").unwrap();
        write(&path, "v2").unwrap();
        write(&path, "v3").unwrap();
        assert_eq!(std::fs::read_to_string(&path).unwrap(), "v3");
        // The backups stack up in save order: the first ever save's old
        // content keeps the plain name, each later save its own number —
        // nothing is overwritten, so nothing is lost.
        assert_eq!(std::fs::read_to_string(dir.join("notes (before Izuki).md")).unwrap(), "v1");
        assert_eq!(std::fs::read_to_string(dir.join("notes (before Izuki 2).md")).unwrap(), "v2");
        let msg = write(&path, "v4").unwrap();
        assert!(msg.contains("(before Izuki 3)"), "{msg}");
        let _ = std::fs::remove_dir_all(dir);
    }

    #[test]
    fn a_failed_save_leaves_the_file_whole() {
        // Halfway through a save (a full disk, a crash): what was there
        // must still be exactly what was there, and no half-file may stay.
        let dir = std::env::temp_dir().join(format!("izuki-half-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let f = dir.join("essay.txt");
        std::fs::write(&f, "the good version").unwrap();
        let err = atomic_save(&f, || Err(anyhow!("the simulated disk is full"))).unwrap_err().to_string();
        assert!(err.contains("simulated disk"), "{err}");
        assert_eq!(std::fs::read_to_string(&f).unwrap(), "the good version");
        let junk: Vec<String> = std::fs::read_dir(&dir).unwrap().filter_map(|e| e.ok()).map(|e| e.file_name().to_string_lossy().to_string()).filter(|n| n.contains("izuki-tmp")).collect();
        assert!(junk.is_empty(), "a half-save was left behind: {junk:?}");
        // A full disk is said plainly, not as "os error 112".
        let full = std::io::Error::from_raw_os_error(112);
        assert_eq!(what_io(&full), "the disk is full — free some space and try again");
        let _ = std::fs::remove_dir_all(dir);
    }

    #[test]
    fn a_failed_swap_never_takes_the_original_with_it() {
        // The last step of the save is one move that replaces the real
        // file. If that move can't happen (here: a folder is sitting where
        // the file would go), the folder must come out of it untouched and
        // the half-saved file must not stay behind either.
        let dir = std::env::temp_dir().join(format!("izuki-swap-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let where_the_file_would_go = dir.join("report.txt");
        std::fs::create_dir(&where_the_file_would_go).unwrap();
        std::fs::write(where_the_file_would_go.join("inside.txt"), "someone's folder").unwrap();
        let err = atomic_save(&where_the_file_would_go, || Ok("new bytes".into()))
            .unwrap_err()
            .to_string();
        assert!(err.contains("old file is untouched"), "{err}");
        assert!(where_the_file_would_go.is_dir(), "the folder was destroyed by the failed save");
        assert_eq!(std::fs::read_to_string(where_the_file_would_go.join("inside.txt")).unwrap(), "someone's folder");
        let junk: Vec<String> = std::fs::read_dir(&dir)
            .unwrap()
            .filter_map(|e| e.ok())
            .map(|e| e.file_name().to_string_lossy().to_string())
            .filter(|n| n.contains("izuki-tmp"))
            .collect();
        assert!(junk.is_empty(), "the swap left its half-save behind: {junk:?}");
        let _ = std::fs::remove_dir_all(dir);
    }

    #[test]
    fn saves_sweep_the_leftovers_of_a_dead_save() {
        // A crash in the middle of a save leaves the hidden temp file
        // behind. An hour later it can only be a dead process's litter:
        // the next save sweeps it (but never touches a temp file of a save
        // that is running right now).
        let dir = std::env::temp_dir().join(format!("izuki-sweep-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let f = dir.join("notes.txt");
        let old = dir.join(".notes.txt.izuki-tmp1");
        std::fs::write(&old, "half of something, from a crash").unwrap();
        let two_hours_ago = SystemTime::now() - Duration::from_secs(2 * 3600);
        std::fs::File::options().write(true).open(&old).unwrap().set_modified(two_hours_ago).unwrap();
        // A temp file younger than an hour stays: a live save may own it.
        let fresh = dir.join(".notes.txt.izuki-tmp2");
        std::fs::write(&fresh, "a save in flight").unwrap();
        atomic_save(&f, || Ok("today's note".into())).unwrap();
        assert_eq!(std::fs::read_to_string(&f).unwrap(), "today's note");
        assert!(!old.exists(), "the hour-old leftover was not swept");
        assert!(fresh.exists(), "a fresh temp file was swept while its save may still run");
        let _ = std::fs::remove_dir_all(dir);
    }

    #[test]
    fn text_never_overwrites_a_binary_file() {
        // A photo, a zip or a song mistaken for notes must not
        // be hollowed out into text.
        let dir = std::env::temp_dir().join(format!("izuki-bin-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        for (name, magic) in [
            ("photo.png", vec![0x89u8, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
            ("archive.zip", vec![0x50u8, 0x4B, 0x03, 0x04, 0x14, 0x00]),
            ("song.mp3", vec![0xFFu8, 0xFB, 0x90, 0x44]),
        ] {
            let p = dir.join(name);
            let whole: Vec<u8> = magic.iter().copied().chain(std::iter::repeat(0xABu8).take(20)).collect();
            std::fs::write(&p, &whole).unwrap();
            let err = write(&p.to_string_lossy(), "these looked like notes").unwrap_err();
            assert!(err.to_string().contains("isn't a text file"), "{err}");
            assert_eq!(std::fs::read(&p).unwrap(), whole, "{name} was changed");
        }
        // Text files without a signature stay writable (an .flp is text):
        assert!(!looks_binary(b"FLStudio = {data = []}"));
        // and the MP3 sync word is still caught:
        assert!(looks_binary(&[0xFFu8, 0xFB, 0x90, 0x00]));
        let _ = std::fs::remove_dir_all(dir);
    }

    #[test]
    fn office_files_are_made_whole_and_checked() {
        let dir = std::env::temp_dir().join(format!("izuki-doc-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let path = dir.join("todo.docx").to_string_lossy().to_string();
        let lines = char::from(10u8).to_string();
        let msg = write(&path, &format!("# Done today{}nothing, twice", lines)).unwrap();
        assert!(msg.contains("real Word file"), "{msg}");
        // What landed opens like a document: the validator agrees.
        let bytes = std::fs::read(&path).unwrap();
        crate::officeedit::validate_new("docx", &bytes).unwrap();
        crate::officeedit::validate("docx", &bytes).unwrap();
        // An Office file that already exists is never overwritten with text.
        let err = write(&path, "start over").unwrap_err();
        assert!(err.to_string().contains("[EDIT:"), "{err}");
        let _ = std::fs::remove_dir_all(dir);
    }
}
