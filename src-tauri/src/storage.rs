//! "What's taking up my space?" — answered straight off this PC, in a few
//! seconds, with no AI: free space on each drive, the installed apps by
//! size (Windows' own records), the biggest folders in your profile and
//! what's inside the biggest ones, the biggest single files, and what can
//! safely go. It only looks; clearing is a separate, asked-for step
//! ([`Ask::ClearSafe`]: old temporary files only; the Recycle Bin only when
//! asked for by name). The user's own files are shown, never deleted.

use std::path::Path;
use std::time::{Duration, Instant};

/// What's asked about the drive.
#[derive(Debug, Clone, PartialEq)]
pub enum Ask {
    /// What's using the space (and what could go).
    Report,
    /// Clear what's safe to clear: old temporary files.
    ClearSafe,
    /// Empty the Recycle Bin (asked for by name): only offers, with what's in
    /// it, since it can't be undone.
    EmptyBin,
    /// The "yes" to that offer, with its one-time code: empties it for good
    /// if the code is still the live one when it runs.
    EmptyBinConfirmed(String),
}

/// The code the offer's "yes" carries, and when it was made. Only that yes
/// empties the bin: no sentence, however it's worded, can delete by itself.
static CONFIRM: parking_lot::Mutex<Option<(String, Instant)>> = parking_lot::Mutex::new(None);

/// How long the offer to empty the bin stands (as long as any offer).
const CONFIRM_FOR: Duration = Duration::from_secs(5 * 60);

/// The offer: what's in the bin, and that a yes deletes it for good.
fn offer_empty() -> String {
    let what = match crate::recyclebin::size() {
        Some((0, _)) => return "The Recycle Bin is already empty.".into(),
        Some((items, mb)) => {
            let size = if mb >= 1024 { format!("{:.1} GB", mb as f64 / 1024.0) } else { format!("{mb} MB") };
            format!("{items} item{} ({size})", if items == 1 { "" } else { "s" })
        }
        None => "some items".into(),
    };
    let code = format!("{:016x}", rand::random::<u64>());
    *CONFIRM.lock() = Some((code.clone(), Instant::now()));
    crate::offers::make(&format!("empty the recycle bin confirmed {code}"));
    format!("The Recycle Bin has {what}. Emptying it deletes them for good, with no way back. Say yes if you want me to empty it.")
}

/// The offer's own yes: its code, while the offer stands. Only reads: the
/// code is used up when the bin is really emptied (`take_code`), so a check
/// that only looks (the chat's delete guard) can't spend it.
fn live_code(s: &str) -> Option<String> {
    let held = CONFIRM.lock();
    let (code, at) = held.as_ref()?;
    (at.elapsed() < CONFIRM_FOR && s.contains(&format!(" confirmed {code} "))).then(|| code.clone())
}

/// Use up the code, if it's still the live one; false otherwise.
fn take_code(code: &str) -> bool {
    let mut held = CONFIRM.lock();
    let live = held.as_ref().is_some_and(|(c, at)| c == code && at.elapsed() < CONFIRM_FOR);
    if live {
        *held = None;
    }
    live
}

/// "What's taking up space?" → Report; "free up some space", "clear the safe
/// stuff" → ClearSafe; "empty the recycle bin" → EmptyBin. Other wordings
/// reach [`handle`] through the chat's [IZUKI: storage | …] tool.
/// Emptying the Recycle Bin can't be undone, so only an instruction does it:
/// the verb before the bin ("empty the recycle bin", "can you clear my
/// recycle bin"). "Is my recycle bin empty?" or "how do I empty the recycle
/// bin" asks; it never deletes anything.
fn empties_bin(s: &str, bin_at: usize) -> bool {
    let first = s.split_whitespace().next().unwrap_or("");
    let question = matches!(first, "is" | "are" | "was" | "does" | "did" | "do" | "has" | "how" | "what" | "whats" | "why" | "where" | "when" | "which")
        || s.contains(" how do") || s.contains(" how to") || s.contains(" should i");
    let indirect = [" tell me if", " if i should", " whether", " should i", " if it", " if my"].iter().any(|w| s.contains(w));
    let refused = [" dont ", " do not ", " never ", " stop "].iter().any(|w| s.contains(w));
    // "Empty the recycle bin", "clear my recycling bin": the verb is for the
    // bin, at most two words before it, with no "and" between.
    let before: Vec<&str> = s[..bin_at].split_whitespace().rev().take(3).collect();
    let verb = before.iter().position(|w| matches!(*w, "empty" | "clear" | "clean")).is_some_and(|i| !before[..i].iter().any(|w| matches!(*w, "and" | "then")));
    verb && !question && !indirect && !refused
}

/// A cloud drive ("my Google Drive", "OneDrive storage", "box.com") with
/// nothing saying this PC: never a scan or a clean-up of this PC's disk.
fn cloud_only(s: &str) -> bool {
    // Google Drive by name ("Google Chrome" is an app on this PC).
    let cloud = ["google drive", "drive on google", "google one", "gdrive", "onedrive", "one drive", "dropbox", "icloud", "mega.nz", "mega nz", "box.com", "box com"]
        .iter()
        .any(|w| s.contains(w));
    let local = drive_letter(s) || ["my pc", "my laptop", "my computer", "this pc", "hard drive", "ssd", "local", "windows recycle bin", "windows recycling bin"].iter().any(|w| s.contains(w));
    cloud && !local
}

/// A drive letter: "my D drive", "the E: drive", "R:". Letters that are
/// usually words or texting ("a drive", "did u drive") count only with a colon.
fn drive_letter(s: &str) -> bool {
    let words: Vec<&str> = s.split_whitespace().collect();
    words.iter().enumerate().any(|(i, w)| {
        let letter = w.trim_end_matches(':');
        let colon = w.len() == 2 && w.ends_with(':');
        let single = letter.len() == 1 && letter.chars().all(|c| c.is_ascii_alphabetic());
        let named = words.get(i + 1).is_some_and(|n| *n == "drive" || *n == "drives");
        // "My U drive" names one; "did u drive" doesn't.
        let owned = i.checked_sub(1).and_then(|j| words.get(j)).is_some_and(|p| matches!(*p, "my" | "the"));
        single && (colon || (named && (owned || !matches!(letter, "a" | "i" | "u" | "r" | "y"))))
    })
}

pub fn parse(said: &str) -> Option<Ask> {
    // Apostrophes are dropped, not spaced: "friend's drive" must not leave an
    // "s drive" that reads as a drive letter.
    let s = format!(" {} ", said.to_lowercase().replace(['’', '\''], "").replace(['?', '!', ',', '.'], " ").split_whitespace().collect::<Vec<_>>().join(" "));
    if let Some(code) = live_code(&s) {
        return Some(Ask::EmptyBinConfirmed(code));
    }
    if cloud_only(&s) {
        return None;
    }
    if let Some(bin_at) = [" recycle bin", " recycling bin"].iter().filter_map(|w| s.find(w)).min() {
        return empties_bin(&s, bin_at).then_some(Ask::EmptyBin);
    }
    if s.contains(" safe stuff") && [" clear", " clean", " delete", " remove", " get rid"].iter().any(|w| s.contains(w)) {
        return Some(Ask::ClearSafe);
    }
    // Looking (even "…and clear it"): the report first, clearing on a yes.
    let looks = |t: &str| is_storage_question(t);
    let without_clear = [" and clear it", " and clean it", " and clear it up", " and free it up", " and delete it", " to clear it", " to clean it"]
        .iter()
        .fold(s.clone(), |acc, w| acc.replace(w, " "));
    if looks(&s) || looks(&without_clear) {
        return Some(Ask::Report);
    }
    let disk = [" storage", " disk", " drive", " space", " ssd", " gb"].iter().any(|w| s.contains(w))
        && ![" space bar", " spacebar", " outer space", " google drive", " onedrive", " one drive", " workspace", " memory"].iter().any(|w| s.contains(w));
    let clearing = [" free up", " clear up", " clear some", " clear space", " clean up space", " make room", " make space", " get more space", " get some space"].iter().any(|w| s.contains(w));
    (disk && clearing).then_some(Ask::ClearSafe)
}

/// Is this asking what's using the disk? Any wording (and the usual typos):
/// "list the apps taking many spac", "what's eating my storage", "check
/// for apps taking too much storaege", "how much space do I have left".
pub fn is_storage_question(said: &str) -> bool {
    let s = said.to_lowercase().replace(['’', '\''], "");
    let s = s.as_str();
    // Doing something about it is a different request (PC Boost / deep clean).
    if ["free up", "clean", "clear ", "delete", "uninstall", "remove "].iter().any(|w| s.contains(w)) {
        return false;
    }
    // A cloud drive ("my Google Drive", "OneDrive storage") isn't this PC's
    // disk, unless the PC is named too ("how much space is OneDrive taking
    // on my C drive").
    if cloud_only(s) {
        return false;
    }
    // "My drive" / "C drive" / "the D: drive" are the PC's own.
    let disk = drive_letter(s)
        || ["storage", "storag", "storaege", "disk", "drive space", "hard drive", "my drive", "c drive", "my drives", "ssd", " gb", " tb", "gigs"]
        .iter()
        .any(|w| s.contains(w));
    let space = ["spac"].iter().any(|w| s.contains(w))
        && !["space bar", "spacebar", "outer space", "spaces between", "spacing", "workspace", "namespace", "my space)"].iter().any(|w| s.contains(w));
    // Asking how it's used or how much is left — not just mentioning a disk.
    let asking = [
        "taking", "using", "eating", "hogging", "filling", "biggest", "largest", "how much", "how big", "left", "free", "full",
        "list the", "list apps", "list my", "check for", "check my", "check how", "show me what",
    ]
    .iter()
    .any(|w| s.contains(w));
    (disk || space) && asking
}

/// Free and total GB on each fixed drive: ("C:", free, total).
#[cfg(windows)]
pub(crate) fn drives() -> Vec<(String, f64, f64)> {
    use windows::core::PCWSTR;
    use windows::Win32::Storage::FileSystem::{GetDiskFreeSpaceExW, GetDriveTypeW, GetLogicalDrives};
    const FIXED: u32 = 3;
    let mask = unsafe { GetLogicalDrives() };
    let mut out = Vec::new();
    for i in 0..26u32 {
        if mask & (1 << i) == 0 {
            continue;
        }
        let letter = (b'A' + i as u8) as char;
        let root: Vec<u16> = format!("{letter}:\\").encode_utf16().chain([0]).collect();
        if unsafe { GetDriveTypeW(PCWSTR(root.as_ptr())) } != FIXED {
            continue;
        }
        let (mut free, mut total) = (0u64, 0u64);
        if unsafe { GetDiskFreeSpaceExW(PCWSTR(root.as_ptr()), Some(&mut free), Some(&mut total), None) }.is_ok() {
            out.push((format!("{letter}:"), free as f64 / 1e9, total as f64 / 1e9));
        }
    }
    out
}

#[cfg(not(windows))]
pub(crate) fn drives() -> Vec<(String, f64, f64)> {
    Vec::new()
}

/// The installed apps with the most space, from Windows' uninstall records:
/// (name, GB). A fixed script — nothing from outside goes into it.
fn biggest_apps(n: usize) -> Vec<(String, f64)> {
    let script = "$k = 'HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*','HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*','HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*'; \
        Get-ItemProperty $k -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -and $_.EstimatedSize -gt 0 -and -not $_.SystemComponent } | \
        Sort-Object EstimatedSize -Descending | Select-Object -First 40 DisplayName, EstimatedSize | ConvertTo-Json -Compress";
    let raw = crate::deepclean::powershell(script, Duration::from_secs(15)).unwrap_or_default();
    let v: serde_json::Value = serde_json::from_str(raw.trim()).unwrap_or(serde_json::Value::Null);
    let list = match v {
        serde_json::Value::Array(a) => a,
        one @ serde_json::Value::Object(_) => vec![one],
        _ => Vec::new(),
    };
    let mut apps: Vec<(String, f64)> = Vec::new();
    for item in list {
        let name = item["DisplayName"].as_str().unwrap_or_default().trim().to_string();
        let kb = item["EstimatedSize"].as_f64().unwrap_or(0.0);
        // The same app listed twice (32- and 64-bit): keep it once.
        if !name.is_empty() && !apps.iter().any(|(n, _)| *n == name) {
            apps.push((name, kb / 1_048_576.0));
        }
    }
    apps.truncate(n);
    apps
}

/// The size of a folder, stopping at `deadline`: (GB, finished counting).
fn folder_size(path: &Path, deadline: Instant) -> (f64, bool) {
    let mut bytes = 0u64;
    let mut stack = vec![path.to_path_buf()];
    while let Some(dir) = stack.pop() {
        if Instant::now() > deadline {
            return (bytes as f64 / 1e9, false);
        }
        let Ok(rd) = std::fs::read_dir(&dir) else { continue };
        for e in rd.flatten() {
            if Instant::now() > deadline {
                return (bytes as f64 / 1e9, false);
            }
            // The entry itself, never what a shortcut/junction points to.
            let Ok(kind) = e.file_type() else { continue };
            if kind.is_symlink() {
                continue;
            }
            if kind.is_dir() {
                stack.push(e.path());
            } else if let Ok(meta) = e.metadata() {
                bytes += meta.len();
            }
        }
    }
    (bytes as f64 / 1e9, true)
}

fn gb(v: f64) -> String {
    if v >= 100.0 { format!("{v:.0} GB") } else if v >= 1.0 { format!("{v:.1} GB") } else { format!("{:.0} MB", v * 1000.0) }
}

/// The answer, in plain words.
pub fn report() -> String {
    let started = Instant::now();
    let mut lines = Vec::new();
    // The biggest folders, by name, for a look inside the top two.
    let mut top_folders: Vec<String> = Vec::new();

    let ds = drives();
    if !ds.is_empty() {
        let parts: Vec<String> = ds.iter().map(|(d, free, total)| format!("{d} has {} free of {}", gb(*free), gb(*total))).collect();
        lines.push(format!("{}.", parts.join("; ")));
    }

    let apps = biggest_apps(8);
    if !apps.is_empty() {
        let list: Vec<String> = apps.iter().map(|(n, g)| format!("{n} ({})", gb(*g))).collect();
        lines.push(format!("Biggest installed apps: {}.", list.join(", ")));
    }

    // The usual big folders, each given a fair share of a few seconds.
    if let Some(home) = dirs::home_dir() {
        let folders = ["Downloads", "Videos", "Pictures", "Documents", "Desktop", "Music", "AppData\\Local", "AppData\\Roaming"];
        let budget = Duration::from_secs(10).saturating_sub(started.elapsed()).max(Duration::from_secs(3));
        let each = budget / folders.len() as u32;
        let mut sized: Vec<(String, f64, bool)> = folders
            .iter()
            .map(|f| {
                let (g, done) = folder_size(&home.join(f), Instant::now() + each);
                (f.replace("AppData\\", "AppData › "), g, done)
            })
            .filter(|(_, g, _)| *g >= 0.5)
            .collect();
        sized.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
        top_folders = sized.iter().map(|(n, _, _)| n.clone()).collect();
        if !sized.is_empty() {
            let list: Vec<String> = sized
                .iter()
                .take(5)
                .map(|(n, g, done)| format!("{n} {}{}", if *done { "" } else { "at least " }, gb(*g)))
                .collect();
            lines.push(format!("Biggest folders: {}.", list.join(", ")));
        }
    }

    if lines.is_empty() {
        return "I couldn't read your drives just now — try again in a moment.".into();
    }
    let low = ds.iter().any(|(_, free, total)| *free < 10.0 || *free / total.max(1.0) < 0.05);
    // Inside the two biggest folders, the biggest single files, and what can
    // go — in the time that's left (about 12 s more at most).
    let deadline = Instant::now() + Duration::from_secs(12);
    let found = std::sync::Arc::new(parking_lot::Mutex::new(Found::default()));
    if let Some(home) = dirs::home_dir() {
        let tops = top_folders.iter().take(2).cloned().collect::<Vec<_>>();
        let jobs: Vec<_> = tops
            .into_iter()
            .map(|name| {
                let (found, path) = (found.clone(), home.join(name.replace("AppData › ", "AppData\\")));
                std::thread::spawn(move || (name, look_inside(&path, deadline, &found)))
            })
            .collect();
        for j in jobs {
            if let Ok((name, inside)) = j.join() {
                let inside: Vec<String> = inside.iter().filter(|(_, b)| *b >= 500_000_000).take(3).map(|(n, b)| format!("{n} {}", gb(*b as f64 / 1e9))).collect();
                if !inside.is_empty() {
                    lines.push(format!("Biggest inside {name}: {}.", inside.join(", ")));
                }
            }
        }
    }
    let mut found = std::mem::take(&mut *found.lock());
    found.big_files.sort_by(|a, b| b.1.cmp(&a.1));
    found.big_files.dedup_by(|a, b| a.0 == b.0);
    if !found.big_files.is_empty() {
        let list: Vec<String> = found
            .big_files
            .iter()
            .take(4)
            .map(|(p, b)| format!("{} ({})", p.file_name().map(|n| n.to_string_lossy().into_owned()).unwrap_or_default(), gb(*b as f64 / 1e9)))
            .collect();
        lines.push(format!("Biggest single files: {}.", list.join(", ")));
    }
    let mut safe = Vec::new();
    let temp = old_temp_bytes(Instant::now() + Duration::from_secs(3));
    if temp >= 50_000_000 {
        safe.push(format!("old temporary files, about {} — say “clear the safe stuff” and I'll do it", gb(temp as f64 / 1e9)));
    }
    if let Some((items, mb)) = crate::recyclebin::size().filter(|(items, _)| *items > 0) {
        safe.push(format!("the Recycle Bin, {} ({items} item{}) — say “empty the Recycle Bin” if you're sure", gb(mb as f64 / 1000.0), if items == 1 { "" } else { "s" }));
    }
    found.rebuild.sort_by(|a, b| b.2.cmp(&a.2));
    if let Some((what, path, b)) = found.rebuild.first() {
        safe.push(format!("{what} at {} ({}) rebuilds itself if deleted — remove it yourself when you're done with that project", path.display(), gb(*b as f64 / 1e9)));
    }
    if !safe.is_empty() {
        lines.push(format!("Safe to clear: {}.", safe.join("; ")));
    }
    lines.push(if low {
        "Your own files I only show, never delete — say “open Downloads” (or any folder) to go through it, or “open apps and features” to uninstall something big.".into()
    } else {
        "Say “open apps and features” to remove an app, or “open Downloads” (or any folder) to go through it yourself.".into()
    });
    lines.join(" ")
}

/// Folders that rebuild themselves (safe for the user to delete when done).
fn rebuildable(dir: &Path) -> Option<&'static str> {
    let name = dir.file_name()?.to_string_lossy().to_lowercase();
    match name.as_str() {
        "node_modules" => Some("A JavaScript packages folder (node_modules)"),
        "target" if dir.parent().is_some_and(|p| p.join("Cargo.toml").exists()) => Some("A Rust build folder (target)"),
        ".gradle" => Some("A Gradle build cache"),
        "npm-cache" => Some("The npm download cache"),
        _ => None,
    }
}

#[derive(Default)]
struct Found {
    big_files: Vec<(std::path::PathBuf, u64)>,
    /// (kind, path, bytes): folders that rebuild themselves.
    rebuild: Vec<(&'static str, std::path::PathBuf, u64)>,
}

/// Bytes under `root` until `deadline`, noting big files and rebuildable
/// folders on the way. Never follows links or junctions.
fn walk(root: &Path, deadline: Instant, found: &parking_lot::Mutex<Found>) -> u64 {
    let mut total = 0u64;
    let mut stack = vec![root.to_path_buf()];
    let mut seen = 0u32;
    while let Some(dir) = stack.pop() {
        let Ok(rd) = std::fs::read_dir(&dir) else { continue };
        for e in rd.flatten() {
            seen += 1;
            if seen % 256 == 0 && Instant::now() >= deadline {
                return total;
            }
            let Ok(kind) = e.file_type() else { continue };
            if kind.is_symlink() {
                continue;
            }
            if kind.is_dir() {
                let path = e.path();
                if let Some(what) = rebuildable(&path) {
                    let (gbs, _) = folder_size(&path, deadline);
                    let bytes = (gbs * 1e9) as u64;
                    total += bytes;
                    if bytes >= 200_000_000 {
                        found.lock().rebuild.push((what, path, bytes));
                    }
                    continue;
                }
                stack.push(path);
            } else if let Ok(m) = e.metadata() {
                total += m.len();
                if m.len() >= 500_000_000 {
                    let mut f = found.lock();
                    f.big_files.push((e.path(), m.len()));
                    if f.big_files.len() > 40 {
                        f.big_files.sort_by(|a, b| b.1.cmp(&a.1));
                        f.big_files.truncate(20);
                    }
                }
            }
        }
    }
    total
}

/// The folders directly inside `root`, biggest first: (name, bytes).
fn look_inside(root: &Path, deadline: Instant, found: &parking_lot::Mutex<Found>) -> Vec<(String, u64)> {
    let mut inside = Vec::new();
    let Ok(rd) = std::fs::read_dir(root) else { return inside };
    for e in rd.flatten() {
        if Instant::now() >= deadline {
            break;
        }
        let Ok(kind) = e.file_type() else { continue };
        if kind.is_symlink() {
            continue;
        }
        if kind.is_dir() {
            let b = walk(&e.path(), deadline, found);
            inside.push((e.file_name().to_string_lossy().into_owned(), b));
        } else if let Ok(m) = e.metadata() {
            if m.len() >= 500_000_000 {
                found.lock().big_files.push((e.path(), m.len()));
            }
        }
    }
    inside.sort_by(|a, b| b.1.cmp(&a.1));
    inside
}

/// Old temporary files (what [`Ask::ClearSafe`] clears), in bytes.
fn old_temp_bytes(deadline: Instant) -> u64 {
    let Some(dir) = std::env::var_os("TEMP").map(std::path::PathBuf::from) else { return 0 };
    let cutoff = std::time::SystemTime::now() - Duration::from_secs(2 * 24 * 3600);
    let mut total = 0u64;
    let mut stack = vec![dir];
    while let Some(d) = stack.pop() {
        let Ok(rd) = std::fs::read_dir(&d) else { continue };
        for e in rd.flatten() {
            if Instant::now() >= deadline {
                return total;
            }
            let Ok(kind) = e.file_type() else { continue };
            if kind.is_symlink() {
                continue;
            }
            if kind.is_dir() {
                stack.push(e.path());
            } else if let Ok(m) = e.metadata() {
                if m.modified().is_ok_and(|t| t < cutoff) {
                    total += m.len();
                }
            }
        }
    }
    total
}

/// Clear old temporary files, then say what's free now.
pub fn clear_safe() -> String {
    let freed_mb = crate::boost::clear_old_temp();
    let mut out = if freed_mb > 0 {
        crate::actlog::record("files", &format!("Cleared {} of old temporary files", gb(freed_mb as f64 / 1000.0)));
        format!("Cleared {} of old temporary files.", gb(freed_mb as f64 / 1000.0))
    } else {
        "There were no old temporary files to clear.".to_string()
    };
    if let Some((_, free, _)) = drives().into_iter().find(|(d, _, _)| d == "C:") {
        out.push_str(&format!(" C: now has {} free.", gb(free)));
    }
    out.push_str(" To see what else is taking the space, say “what's taking up space”.");
    out
}

pub fn handle(ask: Ask) -> String {
    match ask {
        Ask::Report => report(),
        Ask::ClearSafe => clear_safe(),
        Ask::EmptyBin => offer_empty(),
        Ask::EmptyBinConfirmed(code) => {
            if take_code(&code) {
                crate::recyclebin::empty()
            } else {
                "That offer to empty the Recycle Bin has run out, so I didn't empty it. Ask again if you'd like to.".into()
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::is_storage_question;

    /// The real answer on this PC: run by hand with --ignored --nocapture.
    #[test]
    #[ignore]
    fn prints_the_real_report() {
        let t = std::time::Instant::now();
        println!("{}\n(took {} ms)", super::report(), t.elapsed().as_millis());
    }

    #[test]
    fn storage_asks_and_clearing() {
        use super::{parse, Ask};
        assert_eq!(parse("check my storage for whats containing space"), Some(Ask::Report));
        assert_eq!(parse("check my storage for whats coiontainuigng space"), Some(Ask::Report), "typos");
        assert_eq!(parse("check what's taking up space and clear it"), Some(Ask::Report), "look first; clear on a yes");
        assert_eq!(parse("free up some space"), Some(Ask::ClearSafe));
        assert_eq!(parse("clear the safe stuff"), Some(Ask::ClearSafe));
        assert_ne!(parse("what's the safe stuff"), Some(Ask::ClearSafe), "nothing is cleared without being asked to");
        assert_eq!(parse("make room on my drive"), Some(Ask::ClearSafe));
        assert_eq!(parse("empty the recycle bin"), Some(Ask::EmptyBin));
        assert_eq!(parse("open the recycle bin"), None);
        assert_eq!(parse("free up some memory"), None, "memory is PC Boost");
        assert_eq!(parse("press the space bar"), None);
        // The website's own wording, and the Chat tab's PC checkup button.
        assert_eq!(parse("What's filling my drive?"), Some(Ask::Report));
        assert_eq!(parse("What's taking up space on my PC?"), Some(Ask::Report));
        assert_eq!(parse("how full is my C drive"), Some(Ask::Report));
        assert_eq!(parse("what's in my google drive"), None);
        assert_eq!(parse("how full is my drive on google"), None, "a cloud drive");
        assert_eq!(parse("how much space is left in my google drive"), None);
        assert_eq!(parse("how much space is OneDrive taking on my PC"), Some(Ask::Report), "the PC's disk, named");
        assert_eq!(parse("how much space is left in my box.com drive"), None, "a cloud drive, dots and all");
        assert_eq!(parse("how full is my D drive"), Some(Ask::Report), "any drive letter");
        assert_eq!(parse("how much is left on the E: drive"), Some(Ask::Report));
        assert_eq!(parse("I need a drive to the airport, how much is left"), None, "not a drive letter");
        assert_eq!(parse("how much did u drive today"), None, "texting, not a drive");
        assert_eq!(parse("how much space is left in my box.com drive and clear it to make room"), None, "never clean this PC for a cloud drive");
        assert_eq!(parse("free up space on my google drive"), None);
        assert_eq!(parse("what's taking up space, Google Chrome?"), Some(Ask::Report), "an app on this PC");
        assert_eq!(parse("how much space does OneDrive use on my D: drive"), Some(Ask::Report), "the PC's drive, named");
        assert_eq!(parse("how full is my R: drive"), Some(Ask::Report), "a colon makes it a drive letter");
        assert_eq!(parse("free up space on my friend's drive on Google"), None, "a possessive isn't an S: drive");
        assert_eq!(parse("how full is my U drive"), Some(Ask::Report), "named as mine");
        assert_eq!(parse("empty the Windows Recycle Bin after downloading from Dropbox"), Some(Ask::EmptyBin), "the bin is this PC's");
        // A question about the bin never empties it.
        for asked in [
            "is my recycle bin empty?",
            "Is my OneDrive recycle bin empty?",
            "how do I empty the recycle bin",
            "what's in my recycle bin",
            "should I empty the recycle bin",
            "don't empty the recycle bin",
            "empty my OneDrive recycle bin",
        ] {
            assert_ne!(parse(asked), Some(Ask::EmptyBin), "{asked}");
        }
        assert_eq!(parse("can you empty my recycle bin"), Some(Ask::EmptyBin), "a request");
        assert_eq!(parse("please clear the recycling bin"), Some(Ask::EmptyBin));
        assert_ne!(parse("please tell me if I should empty the recycle bin"), Some(Ask::EmptyBin), "an indirect question");
        assert_ne!(parse("clear space on my C drive and show me the Windows Recycle Bin"), Some(Ask::EmptyBin), "the clearing is for the drive");
    }

    #[test]
    fn only_the_offers_own_yes_empties_the_bin() {
        use super::{live_code, parse, take_code, Ask, CONFIRM};
        // An instruction only offers (EmptyBin's handler), never deletes.
        assert_eq!(parse("empty the recycle bin"), Some(Ask::EmptyBin));
        // With no offer standing, a "confirmed" sentence is just a request.
        *CONFIRM.lock() = None;
        assert_eq!(parse("empty the recycle bin confirmed 1a2b"), Some(Ask::EmptyBin));
        // The offer's code, while it stands, once.
        *CONFIRM.lock() = Some(("1a2b".into(), std::time::Instant::now()));
        assert!(live_code(" empty the recycle bin confirmed 9999 ").is_none(), "another code");
        // Reading it (the chat's guard does) doesn't spend it.
        assert_eq!(parse("empty the recycle bin confirmed 1a2b"), Some(Ask::EmptyBinConfirmed("1a2b".into())));
        assert_eq!(parse("empty the recycle bin confirmed 1a2b"), Some(Ask::EmptyBinConfirmed("1a2b".into())));
        // Running it does, once.
        assert!(take_code("1a2b"));
        assert!(!take_code("1a2b"), "used up");
        assert_eq!(parse("empty the recycle bin confirmed 1a2b"), Some(Ask::EmptyBin));
        assert_eq!(parse("what's filling my drive?"), Some(Ask::Report), "still the website's own words");
    }

    #[test]
    fn hears_storage_questions_however_theyre_said() {
        for said in [
            "list the app taking many spac",
            "what app is taking so much space on my pc thats installed",
            "noo i said check for app thats taking too much storaege lemme see",
            "how much space do I have left",
            "what's eating my storage",
            "which apps are the biggest on my disk",
        ] {
            assert!(is_storage_question(said), "{said}");
        }
        for said in ["free up some space", "press the space bar", "delete the big files", "what is outer space", "open my workspace", "what disk encryption should i use"] {
            assert!(!is_storage_question(said), "{said}");
        }
    }
}
