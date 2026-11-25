//! The Smart File Organizer: the loose files sitting on your Desktop and in
//! Downloads, sorted into one tidy tree under `Izuki_Organized`.
//!
//! Looking is free; moving is not. [`preview`] only reads, and returns every
//! move it would make as an `original -> new` pair for the owner to approve.
//! [`organize`] does exactly what that preview said, and writes the undo log
//! *before* the first file moves, so there is never a moment where a file has
//! moved and nothing remembers it.
//!
//! What is never touched, whatever the folder holds:
//! - system folders (`Windows`, `Program Files`, `ProgramData`, `AppData`),
//!   refused as sources ([`check_source`]) and again as a destination;
//! - hidden files and dotfiles, `desktop.ini`, `~$` Office lock files;
//! - folders that are projects (a `.git`, `package.json`, `Cargo.toml`,
//!   `pyproject.toml` or `.env` inside). A project is never split and never
//!   moved out of: it stays exactly where it is and the plan says so;
//! - ordinary folders, which are not descended into at all — only the loose
//!   files beside them move;
//! - files written in the last five minutes, or still downloading
//!   (`.crdownload`, `.part`, `.tmp`…), which may be half a file;
//! - anything that is already inside `Izuki_Organized`.
//!
//! Nothing is ever overwritten: a name already taken becomes `name_1.ext`,
//! `name_2.ext`, and so on. If any move fails, the ones already made are put
//! back before the error is returned.

use std::collections::BTreeSet;
use std::ffi::OsStr;
use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::time::{Duration, SystemTime};

use serde::{Deserialize, Serialize};

/// The one folder everything is sorted into, in the user's home.
pub const ROOT_NAME: &str = "Izuki_Organized";

pub const CODE: &str = "Code_Projects";
pub const MUSIC: &str = "Music_Production";
pub const MODELS: &str = "AI_and_Models";
pub const INSTALLERS: &str = "Installers";
pub const DOCUMENTS: &str = "Documents_and_Notes";
pub const MEDIA: &str = "Media_and_Assets";
pub const FOLDERS: [&str; 6] = [CODE, MUSIC, MODELS, INSTALLERS, DOCUMENTS, MEDIA];

/// A file written this recently may still be downloading or being saved.
const SETTLED: Duration = Duration::from_secs(5 * 60);

/// Half-finished downloads and temporary copies: never moved.
const UNFINISHED: [&str; 7] = ["crdownload", "part", "partial", "download", "tmp", "opdownload", "!ut"];

/// A folder holding any of these is somebody's project.
pub const PROJECT_MARKERS: [&str; 5] = [".git", "package.json", "Cargo.toml", "pyproject.toml", ".env"];

/// At most this many "left alone" lines in a preview, so a busy Downloads
/// folder can't turn the list into a novel.
const SKIP_MAX: usize = 120;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Category {
    Code,
    Music,
    Models,
    Installers,
    Documents,
    Media,
}

impl Category {
    /// The folder this category lives in.
    pub fn folder(self) -> &'static str {
        match self {
            Category::Code => CODE,
            Category::Music => MUSIC,
            Category::Models => MODELS,
            Category::Installers => INSTALLERS,
            Category::Documents => DOCUMENTS,
            Category::Media => MEDIA,
        }
    }

    fn from_ext(ext: &str) -> Option<Category> {
        Some(match ext {
            "rs" | "py" | "js" | "mjs" | "cjs" | "ts" | "tsx" | "jsx" | "java" | "c" | "h" | "hpp" | "cpp" | "cs"
            | "go" | "rb" | "php" | "swift" | "kt" | "lua" | "sh" | "ps1" | "bat" | "sql" | "ipynb" | "vue"
            | "svelte" | "dart" => Category::Code,
            "flp" | "wav" | "mp3" | "stems" | "mid" | "midi" | "aiff" | "aif" | "flac" | "ogg" => Category::Music,
            "glb" | "onnx" | "gguf" | "pt" | "safetensors" | "ino" => Category::Models,
            "exe" | "msi" | "zip" | "7z" | "rar" | "msix" | "iso" => Category::Installers,
            "pdf" | "docx" | "doc" | "txt" | "md" | "csv" | "xlsx" | "xls" | "pptx" | "ppt" | "rtf" | "odt" => {
                Category::Documents
            }
            "png" | "jpg" | "jpeg" | "mp4" | "mov" | "svg" | "gif" | "webp" | "bmp" | "heic" | "avi" | "mkv"
            | "webm" | "m4v" | "psd" | "tif" | "tiff" => Category::Media,
            _ => return None,
        })
    }

    fn name(self) -> &'static str {
        self.folder()
    }
}

/// Which folder a file belongs in, from its extension alone.
pub fn category_of(path: &Path) -> Option<Category> {
    let ext = path.extension()?.to_string_lossy().to_lowercase();
    Category::from_ext(&ext)
}

/// The folder names the organizer sorts into.
pub fn folder_names() -> Vec<String> {
    FOLDERS.iter().map(|f| f.to_string()).collect()
}

/// Is this folder somebody's project? Then it stays exactly where it is.
pub fn is_project(dir: &Path) -> bool {
    PROJECT_MARKERS.iter().any(|m| dir.join(m).exists())
}

/// A path as Windows shows it (`\\?\C:\…` → `C:\…`), for comparing and
/// printing.
fn plain(p: &Path) -> PathBuf {
    let text = p.to_string_lossy();
    match text.strip_prefix("\\\\?\\") {
        Some(rest) => PathBuf::from(rest),
        None => p.to_path_buf(),
    }
}

/// Folders nothing here may ever move, create in, or sort.
pub fn forbidden(p: &Path) -> bool {
    let text = format!("\\{}", p.to_string_lossy().to_lowercase().replace('/', "\\"));
    const BAD: [&str; 6] = ["\\windows", "\\program files", "\\programdata", "\\appdata", "\\system32", "\\$recycle.bin"];
    BAD.iter().any(|b| text.contains(b))
}

/// A folder the owner asked to tidy, if it's somewhere this may look: a real
/// folder inside their own user folder, and not a system one.
pub fn check_source(p: &Path) -> Result<PathBuf, String> {
    let canon = plain(&fs::canonicalize(p).map_err(|_| format!("{} isn't a folder I can read.", p.display()))?);
    if !canon.is_dir() {
        return Err(format!("{} isn't a folder.", canon.display()));
    }
    if forbidden(&canon) {
        return Err(format!("{} is a system folder — Izuki leaves those alone.", canon.display()));
    }
    let home = dirs::home_dir().map(|h| plain(&h)).ok_or("I couldn't find your user folder.")?;
    if !canon.starts_with(&home) {
        return Err("Izuki only tidies folders inside your own user folder.".into());
    }
    Ok(canon)
}

/// Where the tidy tree goes: `C:\Users\<you>\Izuki_Organized`.
pub fn default_root() -> PathBuf {
    dirs::home_dir().unwrap_or_else(|| PathBuf::from("C:\\")).join(ROOT_NAME)
}

/// The folders tidied unless the owner says otherwise: Desktop and Downloads.
pub fn default_sources() -> Vec<PathBuf> {
    let mut out = Vec::new();
    for dir in [dirs::desktop_dir(), dirs::download_dir()] {
        if let Some(dir) = dir {
            if dir.is_dir() {
                out.push(plain(&dir));
            }
        }
    }
    out
}

/// Where undo logs live: `%APPDATA%\Izuki\organizer`.
pub fn log_dir() -> PathBuf {
    crate::store::data_dir().join("organizer")
}

#[derive(Debug, Clone, Serialize)]
pub struct PlannedMove {
    /// The file's path right now.
    pub from: String,
    /// Where it would go.
    pub to: String,
    /// The folder name it lands in, e.g. `Music_Production`.
    pub category: String,
    pub bytes: u64,
}

#[derive(Debug, Clone, Serialize)]
pub struct Skipped {
    pub path: String,
    pub why: String,
}

/// What an organization *would* do. Nothing has moved yet.
#[derive(Debug, Clone, Serialize)]
pub struct Plan {
    pub root: String,
    pub sources: Vec<String>,
    pub moves: Vec<PlannedMove>,
    pub skipped: Vec<Skipped>,
    /// How many skipped entries were left out of `skipped` to keep it short.
    pub skipped_more: usize,
    pub bytes: u64,
    pub folders: Vec<String>,
}

/// What an organization did.
#[derive(Debug, Clone, Serialize)]
pub struct Done {
    pub moved: usize,
    pub bytes: u64,
    /// The undo log written before the first file moved.
    pub undo_log: String,
    /// Anything that didn't go to plan, in plain words.
    pub problems: Vec<String>,
}

/// What an undo did.
#[derive(Debug, Clone, Serialize)]
pub struct Restored {
    pub restored: usize,
    pub problems: Vec<String>,
}

/// The last organization still waiting to be undone.
#[derive(Debug, Clone, Serialize)]
pub struct Last {
    pub at: String,
    pub files: usize,
    pub root: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    pub from: String,
    pub to: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Log {
    pub version: u32,
    pub at: String,
    pub root: String,
    pub moves: Vec<LogEntry>,
}

/// `name.ext` → `name_1.ext` for the first free `n`.
fn numbered(name: &OsStr, n: usize) -> String {
    let path = Path::new(name);
    let stem = path.file_stem().map(|s| s.to_string_lossy().to_string()).unwrap_or_default();
    match path.extension().map(|e| e.to_string_lossy().to_string()) {
        Some(ext) if !ext.is_empty() => format!("{stem}_{n}.{ext}"),
        _ => format!("{stem}_{n}"),
    }
}

/// `dir/name`, or the first `dir/name_N.ext` that is free and not already
/// claimed by this plan. Never an existing file.
fn free_name(dir: &Path, name: &OsStr, taken: &mut BTreeSet<String>) -> PathBuf {
    let first = dir.join(name);
    let key = first.to_string_lossy().to_lowercase();
    if !first.exists() && !taken.contains(&key) {
        taken.insert(key);
        return first;
    }
    for n in 1..10_000 {
        let candidate = dir.join(numbered(name, n));
        let key = candidate.to_string_lossy().to_lowercase();
        if !candidate.exists() && !taken.contains(&key) {
            taken.insert(key);
            return candidate;
        }
    }
    let fallback = dir.join(format!("{}-{}", name.to_string_lossy(), std::process::id()));
    taken.insert(fallback.to_string_lossy().to_lowercase());
    fallback
}

/// A name beside `path` that is free (used when an original spot is taken
/// again by the time an undo runs).
fn free_beside(path: &Path) -> PathBuf {
    let dir = path.parent().map(Path::to_path_buf).unwrap_or_else(|| PathBuf::from("."));
    let name = path.file_name().unwrap_or_else(|| OsStr::new("file"));
    let mut taken = BTreeSet::new();
    free_name(&dir, name, &mut taken)
}

/// Move one file. A rename when that works (instant, same drive); a copy and
/// then a remove when the root is on another drive. The original is never
/// removed before the copy is complete.
fn move_file(from: &Path, to: &Path) -> io::Result<()> {
    if let Some(parent) = to.parent() {
        fs::create_dir_all(parent)?;
    }
    match fs::rename(from, to) {
        Ok(()) => Ok(()),
        Err(_) => match fs::copy(from, to) {
            Ok(_) => fs::remove_file(from),
            Err(e) => {
                // A half copy is worse than no copy: the log must match the disk.
                let _ = fs::remove_file(to);
                Err(e)
            }
        },
    }
}

fn hidden_by_windows(meta: &fs::Metadata) -> bool {
    #[cfg(windows)]
    {
        use std::os::windows::fs::MetadataExt;
        const HIDDEN: u32 = 0x2;
        const SYSTEM: u32 = 0x4;
        if meta.file_attributes() & (HIDDEN | SYSTEM) != 0 {
            return true;
        }
    }
    let _ = meta;
    false
}

/// Why this loose file is not going anywhere, or `None` if it is.
fn leave_alone(path: &Path, meta: &fs::Metadata, now: SystemTime) -> Option<String> {
    let name = path.file_name().map(|n| n.to_string_lossy().to_lowercase()).unwrap_or_default();
    let ext = path.extension().map(|e| e.to_string_lossy().to_lowercase()).unwrap_or_default();
    if name.starts_with('.') || name.starts_with("~$") {
        return Some("a hidden or temporary file".into());
    }
    if name == "desktop.ini" || name == "thumbs.db" {
        return Some("a Windows folder file".into());
    }
    if UNFINISHED.contains(&ext.as_str()) {
        return Some("still downloading".into());
    }
    if hidden_by_windows(meta) {
        return Some("hidden".into());
    }
    if meta.file_type().is_symlink() {
        return Some("a link, not a file".into());
    }
    if meta.modified().ok().and_then(|m| now.duration_since(m).ok()).is_some_and(|age| age < SETTLED) {
        return Some("written in the last five minutes".into());
    }
    None
}

/// Everything that would move, and everything that would be left alone.
/// Only reads: nothing on disk changes.
pub fn scan(sources: &[PathBuf], root: &Path) -> Plan {
    let now = SystemTime::now();
    let mut moves: Vec<PlannedMove> = Vec::new();
    let mut skipped: Vec<Skipped> = Vec::new();
    let mut skipped_more = 0usize;
    let mut taken: BTreeSet<String> = BTreeSet::new();
    let mut bytes = 0u64;

    let skip = |path: &Path, why: String, skipped: &mut Vec<Skipped>, more: &mut usize| {
        if skipped.len() < SKIP_MAX {
            skipped.push(Skipped { path: plain(path).display().to_string(), why });
        } else {
            *more += 1;
        }
    };

    for source in sources {
        let source = plain(source);
        let Ok(listing) = fs::read_dir(&source) else {
            skip(&source, "couldn't be read".into(), &mut skipped, &mut skipped_more);
            continue;
        };
        let mut entries: Vec<_> = listing.flatten().collect();
        entries.sort_by_key(|e| e.file_name().to_string_lossy().to_lowercase());

        for entry in entries {
            let path = plain(&entry.path());
            // Never look inside the tidy tree itself.
            if path.starts_with(root) {
                continue;
            }
            let Ok(meta) = fs::symlink_metadata(&path) else { continue };

            if meta.is_dir() {
                if is_project(&path) {
                    skip(&path, "a project folder (kept whole, where it is)".into(), &mut skipped, &mut skipped_more);
                } else {
                    skip(&path, "a folder (only loose files are sorted)".into(), &mut skipped, &mut skipped_more);
                }
                continue;
            }
            if !meta.is_file() {
                continue;
            }
            if let Some(why) = leave_alone(&path, &meta, now) {
                skip(&path, why, &mut skipped, &mut skipped_more);
                continue;
            }
            let Some(category) = category_of(&path) else {
                skip(&path, "not a file type Izuki sorts".into(), &mut skipped, &mut skipped_more);
                continue;
            };
            let Some(name) = path.file_name() else { continue };
            let dest = free_name(&root.join(category.folder()), name, &mut taken);
            bytes += meta.len();
            moves.push(PlannedMove {
                from: path.display().to_string(),
                to: dest.display().to_string(),
                category: category.name().to_string(),
                bytes: meta.len(),
            });
        }
    }

    // Stable, readable order: folder by folder, then by name.
    moves.sort_by(|a, b| (&a.category, a.to.to_lowercase()).cmp(&(&b.category, b.to.to_lowercase())));

    Plan {
        root: plain(root).display().to_string(),
        sources: sources.iter().map(|s| plain(s).display().to_string()).collect(),
        moves,
        skipped,
        skipped_more,
        bytes,
        folders: folder_names(),
    }
}

/// The plan for the owner's Desktop and Downloads.
pub fn preview() -> Result<Plan, String> {
    let sources = default_sources();
    if sources.is_empty() {
        return Err("I couldn't find your Desktop or Downloads folder.".into());
    }
    Ok(scan(&sources, &default_root()))
}

/// Write the undo log: complete, on disk, before anything moves.
fn write_log(dir: &Path, log: &Log) -> Result<PathBuf, String> {
    fs::create_dir_all(dir).map_err(|e| format!("I couldn't make {}: {e}", dir.display()))?;
    let stamp = chrono::Local::now().format("%Y%m%d-%H%M%S").to_string();
    let mut path = dir.join(format!("undo_log_{stamp}.json"));
    let mut n = 2;
    while path.exists() {
        path = dir.join(format!("undo_log_{stamp}-{n}.json"));
        n += 1;
    }
    let text = serde_json::to_string_pretty(log).map_err(|e| e.to_string())?;
    let temp = path.with_extension("json.part");
    fs::write(&temp, text).map_err(|e| format!("I couldn't write the undo log: {e}"))?;
    fs::rename(&temp, &path).map_err(|e| format!("I couldn't write the undo log: {e}"))?;
    Ok(path)
}

/// Do exactly what the preview said, and remember it.
pub fn apply(plan: &Plan, logs: &Path) -> Result<Done, String> {
    if plan.moves.is_empty() {
        return Ok(Done { moved: 0, bytes: 0, undo_log: String::new(), problems: Vec::new() });
    }
    let root = PathBuf::from(&plan.root);
    if forbidden(&root) {
        return Err(format!("{} is a system folder — I won't sort into it.", root.display()));
    }
    for folder in FOLDERS {
        let dir = root.join(folder);
        fs::create_dir_all(&dir).map_err(|e| format!("I couldn't make {}: {e}", dir.display()))?;
    }

    // The preview may be minutes old, so names are settled again here: nothing
    // is ever written over.
    let mut taken = BTreeSet::new();
    let mut log = Log {
        version: 1,
        at: chrono::Local::now().to_rfc3339(),
        root: plan.root.clone(),
        moves: Vec::new(),
    };
    for m in &plan.moves {
        let from = PathBuf::from(&m.from);
        if !from.is_file() {
            continue;
        }
        let Some(name) = from.file_name() else { continue };
        // The folder comes from this module's own six, never from the plan
        // as written: a plan is data, and data is not a destination.
        if !FOLDERS.contains(&m.category.as_str()) {
            continue;
        }
        let dest = free_name(&root.join(&m.category), name, &mut taken);
        log.moves.push(LogEntry { from: from.display().to_string(), to: dest.display().to_string() });
    }
    if log.moves.is_empty() {
        return Ok(Done { moved: 0, bytes: 0, undo_log: String::new(), problems: Vec::new() });
    }

    let log_path = write_log(logs, &log)?;
    let mut done: Vec<usize> = Vec::new();
    let mut problems: Vec<String> = Vec::new();
    let mut bytes = 0u64;

    for (i, entry) in log.moves.iter().enumerate() {
        let from = PathBuf::from(&entry.from);
        let to = PathBuf::from(&entry.to);
        match fs::metadata(&from) {
            Ok(meta) => bytes += meta.len(),
            Err(_) => {
                problems.push(format!("{} was gone before it moved.", entry.from));
                continue;
            }
        }
        if let Err(e) = move_file(&from, &to) {
            problems.push(format!("{} couldn't move: {e}", entry.from));
            // Put back what already went, newest first, so nothing is left
            // half organized. If even that fails, the log stays for Undo.
            let mut stuck = 0usize;
            for j in done.iter().rev() {
                let back_from = PathBuf::from(&log.moves[*j].to);
                let back_to = PathBuf::from(&log.moves[*j].from);
                if move_file(&back_from, &back_to).is_err() {
                    stuck += 1;
                }
            }
            if stuck == 0 {
                let _ = fs::remove_file(&log_path);
            } else {
                problems.push(format!(
                    "{stuck} file(s) are still in {ROOT_NAME} — press Undo Last Organization to put them back."
                ));
            }
            return Err(problems.join(" "));
        }
        done.push(i);
    }

    Ok(Done { moved: done.len(), bytes, undo_log: log_path.display().to_string(), problems })
}

/// Sort the owner's Desktop and Downloads, after they approved the preview.
pub fn organize() -> Result<(Plan, Done), String> {
    let plan = preview()?;
    let done = apply(&plan, &log_dir())?;
    Ok((plan, done))
}

/// The newest log that hasn't been undone yet.
pub fn latest_log(dir: &Path) -> Option<PathBuf> {
    let listing = fs::read_dir(dir).ok()?;
    let mut best: Option<(SystemTime, String, PathBuf)> = None;
    for entry in listing.flatten() {
        let name = entry.file_name().to_string_lossy().to_string();
        if !name.starts_with("undo_log_") || !name.ends_with(".json") || name.contains(".undone") {
            continue;
        }
        let written = entry.metadata().and_then(|m| m.modified()).unwrap_or(SystemTime::UNIX_EPOCH);
        let newer = best.as_ref().is_none_or(|(seen, seen_name, _)| (written, &name) > (*seen, seen_name));
        if newer {
            best = Some((written, name, entry.path()));
        }
    }
    best.map(|(_, _, path)| path)
}

/// The last organization, if it can still be undone.
pub fn last() -> Option<Last> {
    let path = latest_log(&log_dir())?;
    let log: Log = serde_json::from_str(&fs::read_to_string(path).ok()?).ok()?;
    Some(Last { at: log.at, files: log.moves.len(), root: log.root })
}

/// Put every file of the newest organization back where it came from, newest
/// move first. A spot taken again by something else is never overwritten: the
/// file goes back beside it as `name_1.ext` and the result says so.
pub fn undo(logs: &Path) -> Result<Restored, String> {
    let Some(path) = latest_log(logs) else {
        return Err("There's no organization to undo yet.".into());
    };
    let raw = fs::read_to_string(&path).map_err(|e| format!("I couldn't read the undo log: {e}"))?;
    let log: Log = serde_json::from_str(&raw).map_err(|e| format!("That undo log can't be read: {e}"))?;

    let mut restored = 0usize;
    let mut problems: Vec<String> = Vec::new();
    let mut stopped = false;

    for entry in log.moves.iter().rev() {
        let to = PathBuf::from(&entry.to);
        let from = PathBuf::from(&entry.from);
        if !to.exists() {
            // Already back (an undo that stopped half way), or moved on since.
            if from.exists() {
                restored += 1;
            }
            continue;
        }
        if forbidden(&from) {
            problems.push(format!("{} is a system folder, so nothing goes back there.", entry.from));
            continue;
        }
        let target = if from.exists() {
            let beside = free_beside(&from);
            problems.push(format!("{} was taken again, so the file went back as {}.", entry.from, beside.display()));
            beside
        } else {
            from.clone()
        };
        if let Some(parent) = target.parent() {
            let _ = fs::create_dir_all(parent);
        }
        match move_file(&to, &target) {
            Ok(()) => restored += 1,
            Err(e) => {
                problems.push(format!("{} couldn't go back: {e}", entry.to));
                stopped = true;
                break;
            }
        }
    }

    if !stopped {
        // The folders Izuki made, if they're empty now.
        for folder in FOLDERS {
            let _ = fs::remove_dir(PathBuf::from(&log.root).join(folder));
        }
        let _ = fs::remove_dir(PathBuf::from(&log.root));
        let stem = path.file_stem().map(|s| s.to_string_lossy().to_string()).unwrap_or_else(|| "undo_log".into());
        let _ = fs::rename(&path, path.with_file_name(format!("{stem}.undone.json")));
    }

    Ok(Restored { restored, problems })
}

/// Undo the newest organization of the owner's Desktop and Downloads.
pub fn undo_last() -> Result<Restored, String> {
    undo(&log_dir())
}

#[cfg(test)]
mod tests {
    use super::*;

    /// A scratch folder for one test, in the user's home: the only place
    /// the organizer ever runs, so the guards apply exactly as they do on a
    /// real Desktop. Named so it is obvious, and removed at the end.
    fn scratch(tag: &str) -> PathBuf {
        let dir = dirs::home_dir()
            .unwrap()
            .join(format!(".izuki-organizer-test-{tag}-{}", rand::random::<u32>()));
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).unwrap();
        dir
    }

    fn settle(path: &Path) {
        let old = SystemTime::now() - Duration::from_secs(3600);
        fs::File::options().write(true).open(path).unwrap().set_modified(old).unwrap();
    }

    #[test]
    fn the_six_folders_are_the_ones_asked_for() {
        assert_eq!(folder_names(), vec![CODE, MUSIC, MODELS, INSTALLERS, DOCUMENTS, MEDIA]);
        assert_eq!(CODE, "Code_Projects");
        assert_eq!(MUSIC, "Music_Production");
        assert_eq!(MODELS, "AI_and_Models");
        assert_eq!(INSTALLERS, "Installers");
        assert_eq!(DOCUMENTS, "Documents_and_Notes");
        assert_eq!(MEDIA, "Media_and_Assets");
    }

    #[test]
    fn every_listed_extension_has_a_home() {
        for (name, want) in [
            ("main.rs", CODE),
            ("sketch.py", CODE),
            ("beat.flp", MUSIC),
            ("kick.wav", MUSIC),
            ("hook.mid", MUSIC),
            ("room.stems", MUSIC),
            ("head.glb", MODELS),
            ("net.onnx", MODELS),
            ("llm.gguf", MODELS),
            ("w.pt", MODELS),
            ("m.safetensors", MODELS),
            ("sketch.ino", MODELS),
            ("setup.exe", INSTALLERS),
            ("pack.msi", INSTALLERS),
            ("src.zip", INSTALLERS),
            ("backup.7z", INSTALLERS),
            ("old.rar", INSTALLERS),
            ("report.pdf", DOCUMENTS),
            ("letter.docx", DOCUMENTS),
            ("notes.txt", DOCUMENTS),
            ("README.md", DOCUMENTS),
            ("rows.csv", DOCUMENTS),
            ("sheet.xlsx", DOCUMENTS),
            ("shot.png", MEDIA),
            ("photo.jpg", MEDIA),
            ("clip.mp4", MEDIA),
            ("take.mov", MEDIA),
            ("logo.svg", MEDIA),
        ] {
            assert_eq!(category_of(Path::new(name)).map(Category::folder), Some(want), "{name}");
        }
        assert_eq!(category_of(Path::new("save.sav")), None);
        assert_eq!(category_of(Path::new("no-extension")), None);
    }

    #[test]
    fn a_project_folder_is_recognised_by_each_marker() {
        for marker in PROJECT_MARKERS {
            let dir = scratch("project");
            fs::create_dir_all(dir.join("thing")).unwrap();
            fs::write(dir.join("thing").join(marker), b"x").unwrap();
            assert!(is_project(&dir.join("thing")), "{marker} should mark a project");
            let _ = fs::remove_dir_all(&dir);
        }
        let dir = scratch("not-project");
        fs::write(dir.join("notes.md"), b"x").unwrap();
        assert!(!is_project(&dir));
        let _ = fs::remove_dir_all(&dir);
    }

    #[test]
    fn system_folders_are_never_sources() {
        assert!(forbidden(Path::new("C:\\Windows")));
        assert!(forbidden(Path::new("C:\\Windows\\System32\\drivers")));
        assert!(forbidden(Path::new("C:\\Program Files\\Izuki")));
        assert!(forbidden(Path::new("C:\\Users\\sam\\AppData\\Roaming\\Izuki")));
        assert!(forbidden(Path::new("C:\\ProgramData\\Something")));
        assert!(!forbidden(Path::new("C:\\Users\\sam\\Desktop")));
        assert!(!forbidden(Path::new("C:\\Users\\sam\\Downloads")));
        assert!(check_source(Path::new("C:\\Windows")).is_err());
        // A plain folder in the user's home is fine; the temp folder is not,
        // because it sits under AppData.
        let home_folder = scratch("check");
        assert!(check_source(&home_folder).is_ok(), "a folder in home is a source");
        assert!(check_source(&std::env::temp_dir()).is_err(), "AppData/temp is never a source");
        let _ = fs::remove_dir_all(&home_folder);
    }

    #[test]
    fn hidden_files_and_unfinished_downloads_stay_put() {
        let base = scratch("hidden");
        let src = base.join("Desktop");
        fs::create_dir_all(&src).unwrap();
        let root = base.join(ROOT_NAME);
        for name in ["notes.txt", ".env", "desktop.ini", "movie.mp4.crdownload", "big.zip.part"] {
            fs::write(src.join(name), b"x").unwrap();
            settle(&src.join(name));
        }
        let plan = scan(std::slice::from_ref(&src), &root);
        assert_eq!(plan.moves.len(), 1, "{:?}", plan.moves);
        assert!(plan.moves[0].from.ends_with("notes.txt"));
        let _ = fs::remove_dir_all(&base);
    }

    #[test]
    fn a_file_written_this_minute_is_left_alone() {
        let base = scratch("recent");
        let src = base.join("Downloads");
        fs::create_dir_all(&src).unwrap();
        fs::write(src.join("just-saved.pdf"), b"x").unwrap();
        let plan = scan(std::slice::from_ref(&src), &base.join(ROOT_NAME));
        assert!(plan.moves.is_empty());
        assert!(plan.skipped.iter().any(|s| s.why.contains("five minutes")));
        let _ = fs::remove_dir_all(&base);
    }

    #[test]
    fn a_name_already_taken_gets_a_number() {
        let base = scratch("collision");
        let src = base.join("Desktop");
        fs::create_dir_all(&src).unwrap();
        let root = base.join(ROOT_NAME);
        fs::create_dir_all(root.join(DOCUMENTS)).unwrap();
        fs::write(root.join(DOCUMENTS).join("notes.md"), b"older").unwrap();
        fs::write(src.join("notes.md"), b"new").unwrap();
        settle(&src.join("notes.md"));
        let plan = scan(std::slice::from_ref(&src), &root);
        assert_eq!(plan.moves.len(), 1);
        assert!(plan.moves[0].to.ends_with("notes_1.md"), "{}", plan.moves[0].to);
        let done = apply(&plan, &base.join("logs")).unwrap();
        assert_eq!(done.moved, 1);
        assert_eq!(fs::read_to_string(root.join(DOCUMENTS).join("notes.md")).unwrap(), "older");
        assert_eq!(fs::read_to_string(root.join(DOCUMENTS).join("notes_1.md")).unwrap(), "new");
        let _ = fs::remove_dir_all(&base);
    }

    #[test]
    fn tidies_then_puts_everything_back() {
        let base = scratch("roundtrip");
        let desk = base.join("Desktop");
        let down = base.join("Downloads");
        fs::create_dir_all(&desk).unwrap();
        fs::create_dir_all(&down).unwrap();
        let root = base.join(ROOT_NAME);
        let logs = base.join("logs");

        for (dir, name, body) in [
            (&desk, "song.flp", "flp"),
            (&desk, "notes.md", "md"),
            (&down, "setup.exe", "exe"),
            (&down, "shot.png", "png"),
        ] {
            fs::write(dir.join(name), body).unwrap();
            settle(&dir.join(name));
        }
        // Never touched: a project folder, a dotfile, an unsorted type.
        fs::create_dir_all(desk.join("MyGame").join(".git")).unwrap();
        fs::write(desk.join("MyGame").join("Cargo.toml"), b"[package]").unwrap();
        fs::write(desk.join(".env"), b"KEY=1").unwrap();
        fs::write(desk.join("save.sav"), b"game").unwrap();

        let plan = scan(&[desk.clone(), down.clone()], &root);
        assert_eq!(plan.moves.len(), 4, "{:?}", plan.moves);
        assert!(plan.skipped.iter().any(|s| s.path.ends_with("MyGame") && s.why.contains("project")));
        assert_eq!(plan.bytes, 3 + 2 + 3 + 3);

        let done = apply(&plan, &logs).unwrap();
        assert_eq!(done.moved, 4);
        assert!(root.join(MUSIC).join("song.flp").exists());
        assert!(root.join(DOCUMENTS).join("notes.md").exists());
        assert!(root.join(INSTALLERS).join("setup.exe").exists());
        assert!(root.join(MEDIA).join("shot.png").exists());
        assert!(!desk.join("song.flp").exists());
        assert!(desk.join("MyGame").exists(), "a project folder is never moved");
        assert!(desk.join(".env").exists(), "hidden files stay");
        assert!(desk.join("save.sav").exists(), "unsorted types stay");
        assert!(Path::new(&done.undo_log).exists(), "the log is on disk");

        let undone = undo(&logs).unwrap();
        assert_eq!(undone.restored, 4);
        assert!(desk.join("song.flp").exists());
        assert!(desk.join("notes.md").exists());
        assert!(down.join("setup.exe").exists());
        assert!(down.join("shot.png").exists());
        assert!(!root.join(MUSIC).exists(), "the folders Izuki made go too");
        assert!(!root.exists());
        assert!(latest_log(&logs).is_none(), "an undone log is not offered again");
        let _ = fs::remove_dir_all(&base);
    }

    #[test]
    fn undo_never_writes_over_something_new() {
        let base = scratch("undo-clash");
        let src = base.join("Desktop");
        fs::create_dir_all(&src).unwrap();
        let root = base.join(ROOT_NAME);
        let logs = base.join("logs");
        fs::write(src.join("notes.md"), b"the original").unwrap();
        settle(&src.join("notes.md"));

        let plan = scan(std::slice::from_ref(&src), &root);
        apply(&plan, &logs).unwrap();
        // Something new takes the old spot while the file is filed away.
        fs::write(src.join("notes.md"), b"brand new").unwrap();

        let undone = undo(&logs).unwrap();
        assert_eq!(undone.restored, 1);
        assert_eq!(fs::read_to_string(src.join("notes.md")).unwrap(), "brand new");
        assert_eq!(fs::read_to_string(src.join("notes_1.md")).unwrap(), "the original");
        assert!(undone.problems.iter().any(|p| p.contains("went back as")));
        let _ = fs::remove_dir_all(&base);
    }

    #[test]
    fn undo_with_nothing_to_undo_says_so() {
        let base = scratch("undo-empty");
        let err = undo(&base.join("logs")).unwrap_err();
        assert!(err.contains("no organization to undo"));
        let _ = fs::remove_dir_all(&base);
    }

    #[test]
    fn an_empty_preview_moves_nothing() {
        let base = scratch("empty");
        let src = base.join("Desktop");
        fs::create_dir_all(&src).unwrap();
        let plan = scan(std::slice::from_ref(&src), &base.join(ROOT_NAME));
        assert!(plan.moves.is_empty());
        let done = apply(&plan, &base.join("logs")).unwrap();
        assert_eq!(done.moved, 0);
        assert!(done.undo_log.is_empty());
        assert!(!base.join("logs").exists());
        let _ = fs::remove_dir_all(&base);
    }

    #[test]
    fn the_tidy_tree_is_never_sorted_into_itself() {
        let base = scratch("self");
        let src = base.join("Desktop");
        let root = base.join(ROOT_NAME);
        fs::create_dir_all(&src).unwrap();
        fs::write(src.join("keep.txt"), b"x").unwrap();
        settle(&src.join("keep.txt"));
        // A source that *is* the root: every file in it is left alone.
        let plan = scan(std::slice::from_ref(&root), &root);
        assert!(plan.moves.is_empty());
        let _ = fs::remove_dir_all(&base);
    }
}
