//! "What's taking up my space?" — answered straight off this PC, in a few
//! seconds, with no AI: free space on each drive, the installed apps by
//! size (Windows' own records), and the biggest folders in your profile.
//! It only looks; cleaning up is a separate, asked-for step.

use std::path::Path;
use std::time::{Duration, Instant};

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
    let disk = ["storage", "storag", "storaege", "disk", "drive space", "hard drive", "ssd", " gb", " tb", "gigs"].iter().any(|w| s.contains(w));
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
fn drives() -> Vec<(String, f64, f64)> {
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
fn drives() -> Vec<(String, f64, f64)> {
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
    lines.push(if low {
        "Space is tight — say “make my PC fast” for a safe clean-up, or “open apps and features” to uninstall something big.".into()
    } else {
        "Say “open apps and features” to remove an app, or “make my PC fast” for a safe clean-up.".into()
    });
    lines.join(" ")
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
