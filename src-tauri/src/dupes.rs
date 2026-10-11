//! Duplicate downloads, tidied: the same file saved twice ("report.pdf" and
//! "report (1).pdf") goes to the Recycle Bin, so the Downloads folder stays
//! clean without you sorting it.
//!
//! Only byte-for-byte identical files that are plainly copies of one name
//! count ("report.pdf", "report (1).pdf", "report - Copy.pdf") — two identical
//! files you named differently are both kept. The clearest name, the oldest
//! of those, stays. Anything saved in the last half hour, still downloading,
//! hidden, or over 1 GB is left alone, and everything moved can be restored
//! from the Recycle Bin.

use std::collections::HashMap;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::time::{Duration, Instant, SystemTime};

use sha2::{Digest, Sha256};

/// One set of identical files: the one kept, and the copies to recycle.
#[derive(Debug, Clone)]
pub struct Found {
    pub keep: PathBuf,
    pub copies: Vec<PathBuf>,
    pub bytes: u64,
}

const UNFINISHED: &[&str] = &["crdownload", "part", "partial", "download", "tmp", "opdownload"];
/// Bigger files may not fit in the Recycle Bin (Windows would delete them for
/// good instead), so they're left alone.
const MAX_FILE: u64 = 1024 * 1024 * 1024;
const RECENT: Duration = Duration::from_secs(30 * 60);

struct File {
    path: PathBuf,
    len: u64,
    modified: SystemTime,
}

/// The "1" in "report (1).pdf" — a short number, not a year like "(2024)".
fn copy_number(inner: &str) -> bool {
    (1..=3).contains(&inner.len()) && inner.chars().all(|c| c.is_ascii_digit())
}

/// "report (1).pdf", "report - Copy.pdf", "report (2) - Copy.pdf" look like copies.
pub fn copy_named(path: &Path) -> bool {
    let stem = path.file_stem().map(|s| s.to_string_lossy().to_lowercase()).unwrap_or_default();
    let stem = stem.trim();
    let numbered = stem.ends_with(')') && stem.rfind('(').is_some_and(|i| copy_number(&stem[i + 1..stem.len() - 1]));
    numbered || stem.ends_with(" - copy") || stem.ends_with("- copy") || stem.contains(" - copy (")
}

fn eligible(path: &Path, meta: &std::fs::Metadata, now: SystemTime) -> bool {
    if !meta.is_file() || meta.file_type().is_symlink() || meta.len() < 1024 || meta.len() > MAX_FILE {
        return false;
    }
    let name = path.file_name().map(|n| n.to_string_lossy().to_lowercase()).unwrap_or_default();
    if name.starts_with('.') || name.starts_with("~$") || name == "desktop.ini" {
        return false;
    }
    let ext = path.extension().map(|e| e.to_string_lossy().to_lowercase()).unwrap_or_default();
    if UNFINISHED.contains(&ext.as_str()) {
        return false;
    }
    #[cfg(windows)]
    {
        use std::os::windows::fs::MetadataExt;
        const HIDDEN: u32 = 0x2;
        const SYSTEM: u32 = 0x4;
        if meta.file_attributes() & (HIDDEN | SYSTEM) != 0 {
            return false;
        }
    }
    meta.modified().ok().and_then(|m| now.duration_since(m).ok()).is_some_and(|age| age > RECENT)
}

/// "report (1).pdf" and "Report - Copy.PDF" → "report.pdf": the name the
/// copies share, so only copies of one download are ever grouped.
pub fn base_name(path: &Path) -> String {
    let stem = path.file_stem().map(|s| s.to_string_lossy().to_lowercase()).unwrap_or_default();
    let mut stem = stem.trim().to_string();
    loop {
        let before = stem.clone();
        for tail in [" - copy", "- copy"] {
            if let Some(s) = stem.strip_suffix(tail) {
                stem = s.trim_end().to_string();
            }
        }
        if stem.ends_with(')') {
            if let Some(i) = stem.rfind('(') {
                if copy_number(&stem[i + 1..stem.len() - 1]) {
                    stem = stem[..i].trim_end().to_string();
                }
            }
        }
        if stem == before {
            break;
        }
    }
    let ext = path.extension().map(|e| e.to_string_lossy().to_lowercase()).unwrap_or_default();
    format!("{stem}.{ext}")
}

fn collect(dir: &Path, depth: usize, now: SystemTime, deadline: Instant, out: &mut Vec<File>) {
    let Ok(rd) = std::fs::read_dir(dir) else { return };
    for e in rd.flatten() {
        if Instant::now() > deadline {
            return;
        }
        let path = e.path();
        let Ok(meta) = std::fs::symlink_metadata(&path) else { continue };
        if meta.is_dir() {
            if depth < 1 && !meta.file_type().is_symlink() {
                collect(&path, depth + 1, now, deadline, out);
            }
        } else if eligible(&path, &meta, now) {
            out.push(File { path, len: meta.len(), modified: meta.modified().unwrap_or(SystemTime::UNIX_EPOCH) });
        }
    }
}

/// The SHA-256 of a file's contents, or of its first `limit` bytes. `None`
/// past the deadline, so one huge file can't hold the scan up.
fn digest(path: &Path, limit: Option<u64>, deadline: Instant) -> Option<[u8; 32]> {
    let mut f = std::fs::File::open(path).ok()?;
    let mut h = Sha256::new();
    let mut buf = vec![0u8; 256 * 1024];
    let mut left = limit.unwrap_or(u64::MAX);
    while left > 0 {
        if Instant::now() > deadline {
            return None;
        }
        let want = buf.len().min(left.min(usize::MAX as u64) as usize);
        let n = f.read(&mut buf[..want]).ok()?;
        if n == 0 {
            break;
        }
        h.update(&buf[..n]);
        left -= n as u64;
    }
    Some(h.finalize().into())
}

/// Identical files in `dir` (and one level of folders under it). Stops
/// looking after `budget`, so a huge folder never holds things up.
pub fn find(dir: &Path, budget: Duration) -> Vec<Found> {
    let deadline = Instant::now() + budget;
    let mut files = Vec::new();
    collect(dir, 0, SystemTime::now(), deadline, &mut files);
    // Same name once "(1)" / "- Copy" is taken off, and the same size.
    // Same folder, same name once "(1)" / "- Copy" is off, same size.
    let mut by_name: HashMap<(PathBuf, String, u64), Vec<File>> = HashMap::new();
    for f in files {
        let folder = f.path.parent().map(Path::to_path_buf).unwrap_or_default();
        by_name.entry((folder, base_name(&f.path), f.len)).or_default().push(f);
    }
    let mut found = Vec::new();
    // Only when the original is there too: "report.pdf" beside "report (1).pdf".
    for ((_, _, len), group) in by_name.into_iter().filter(|(_, g)| g.len() > 1 && g.iter().any(|f| copy_named(&f.path)) && g.iter().any(|f| !copy_named(&f.path))) {
        if Instant::now() > deadline {
            break;
        }
        // A quick look at the first 64 KB, then the whole file for the ones that still match.
        let mut by_head: HashMap<[u8; 32], Vec<File>> = HashMap::new();
        for f in group {
            if let Some(d) = digest(&f.path, Some(64 * 1024), deadline) {
                by_head.entry(d).or_default().push(f);
            }
        }
        for (_, same_start) in by_head.into_iter().filter(|(_, g)| g.len() > 1) {
            if Instant::now() > deadline {
                break;
            }
            let mut by_full: HashMap<[u8; 32], Vec<File>> = HashMap::new();
            for f in same_start {
                if let Some(d) = digest(&f.path, None, deadline) {
                    by_full.entry(d).or_default().push(f);
                }
            }
            // The identical set must still hold the original, or nothing is touched.
            for (_, mut same) in by_full.into_iter().filter(|(_, g)| g.len() > 1 && g.iter().any(|f| !copy_named(&f.path))) {
                // Keep the clearest name, then the oldest.
                same.sort_by_key(|f| (copy_named(&f.path), f.path.file_name().map(|n| n.len()).unwrap_or(0), f.modified));
                let keep = same.remove(0).path;
                let copies: Vec<PathBuf> = same.into_iter().map(|f| f.path).collect();
                found.push(Found { keep, bytes: len * copies.len() as u64, copies });
            }
        }
    }
    found
}

/// Move files to the Recycle Bin (restorable), through Windows itself —
/// the path is only ever data. The ones that went.
#[cfg(windows)]
pub fn recycle(paths: &[PathBuf]) -> Vec<PathBuf> {
    use std::os::windows::ffi::OsStrExt;
    use windows::Win32::UI::Shell::{SHFileOperationW, FOF_ALLOWUNDO, FOF_NOCONFIRMATION, FOF_SILENT, FOF_WANTNUKEWARNING, FO_DELETE, SHFILEOPSTRUCTW};
    let mut moved = Vec::new();
    for p in paths {
        // Only a full path (a relative one would be resolved somewhere else),
        // and nothing that would be read as a list or a wildcard.
        let s = p.as_os_str();
        if !p.is_absolute() || p.to_string_lossy().contains(['*', '?']) {
            continue;
        }
        // Double-null terminated, as the call expects.
        let mut from: Vec<u16> = s.encode_wide().collect();
        from.extend([0, 0]);
        let mut op = SHFILEOPSTRUCTW {
            wFunc: FO_DELETE,
            pFrom: windows::core::PCWSTR(from.as_ptr()),
            // Recycle quietly — but if Windows can't recycle it and would delete
            // it for good, it asks first (as File Explorer does).
            fFlags: (FOF_ALLOWUNDO.0 | FOF_NOCONFIRMATION.0 | FOF_SILENT.0 | FOF_WANTNUKEWARNING.0) as u16,
            ..Default::default()
        };
        let ok = unsafe { SHFileOperationW(&mut op) } == 0 && !op.fAnyOperationsAborted.as_bool();
        if ok && !p.exists() {
            moved.push(p.clone());
        }
    }
    moved
}

#[cfg(not(windows))]
pub fn recycle(_paths: &[PathBuf]) -> Vec<PathBuf> {
    Vec::new()
}

/// Find and recycle duplicate downloads: (files moved, MB freed).
pub fn tidy_downloads() -> (usize, u64) {
    let Some(dir) = dirs::download_dir() else { return (0, 0) };
    let found = find(&dir, Duration::from_secs(20));
    // Each copy with its size, so the space freed counts only what moved.
    let sizes: HashMap<PathBuf, u64> = found
        .iter()
        .flat_map(|f| {
            let each = f.bytes / f.copies.len().max(1) as u64;
            f.copies.iter().map(move |c| (c.clone(), each))
        })
        .collect();
    let copies: Vec<PathBuf> = sizes.keys().cloned().collect();
    let moved = recycle(&copies);
    if !moved.is_empty() {
        eprintln!("[dupes] moved {} duplicate download(s) to the Recycle Bin", moved.len());
    }
    let bytes: u64 = moved.iter().filter_map(|p| sizes.get(p)).sum();
    (moved.len(), bytes / (1024 * 1024))
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Sends a real temp file to the Recycle Bin: run by hand with --ignored.
    #[test]
    #[ignore]
    fn recycles_a_real_file() {
        let p = std::env::temp_dir().join(format!("izuki-recycle-‘quote’-{}.txt", rand::random::<u32>()));
        std::fs::write(&p, b"izuki recycle test").unwrap();
        assert_eq!(recycle(std::slice::from_ref(&p)).len(), 1);
        assert!(!p.exists());
    }

    #[test]
    fn copies_share_a_base_name() {
        assert_eq!(base_name(Path::new("Report (1).PDF")), "report.pdf");
        assert_eq!(base_name(Path::new("report - Copy.pdf")), "report.pdf");
        assert_eq!(base_name(Path::new("report (2) - Copy.pdf")), "report.pdf");
        assert_ne!(base_name(Path::new("contract.pdf")), base_name(Path::new("receipt.pdf")));
    }

    #[test]
    fn identical_files_with_different_names_are_both_kept() {
        let dir = std::env::temp_dir().join(format!("izuki-dupes-names-{}", rand::random::<u32>()));
        std::fs::create_dir_all(&dir).unwrap();
        let body = vec![3u8; 4096];
        let old = SystemTime::now() - Duration::from_secs(3600);
        for n in ["contract.pdf", "receipt.pdf"] {
            std::fs::write(dir.join(n), &body).unwrap();
            std::fs::File::options().write(true).open(dir.join(n)).unwrap().set_modified(old).unwrap();
        }
        let found = find(&dir, Duration::from_secs(5));
        std::fs::remove_dir_all(&dir).ok();
        assert!(found.is_empty());
    }

    #[test]
    fn spots_copy_names() {
        assert!(copy_named(Path::new("report (1).pdf")));
        assert!(copy_named(Path::new("report (12).pdf")));
        assert!(copy_named(Path::new("report - Copy.pdf")));
        assert!(!copy_named(Path::new("report.pdf")));
        assert!(!copy_named(Path::new("notes (draft).txt")));
        assert!(!copy_named(Path::new("Chapter (2024)a.pdf")));
        assert!(!copy_named(Path::new("Chapter (2024).pdf")));
    }

    #[test]
    fn finds_identical_files_and_keeps_the_clear_name() {
        let dir = std::env::temp_dir().join(format!("izuki-dupes-{}", rand::random::<u32>()));
        std::fs::create_dir_all(&dir).unwrap();
        let body = vec![7u8; 5000];
        std::fs::write(dir.join("report.pdf"), &body).unwrap();
        std::fs::write(dir.join("report (1).pdf"), &body).unwrap();
        let mut other = body.clone();
        other[4999] = 8;
        std::fs::write(dir.join("different.pdf"), &other).unwrap();
        // Make them old enough to count.
        let old = SystemTime::now() - Duration::from_secs(3600);
        for n in ["report.pdf", "report (1).pdf", "different.pdf"] {
            std::fs::File::options().write(true).open(dir.join(n)).unwrap().set_modified(old).unwrap();
        }
        let found = find(&dir, Duration::from_secs(5));
        std::fs::remove_dir_all(&dir).ok();
        assert_eq!(found.len(), 1);
        assert!(found[0].keep.ends_with("report.pdf"));
        assert_eq!(found[0].copies.len(), 1);
        assert!(found[0].copies[0].ends_with("report (1).pdf"));
    }
}
