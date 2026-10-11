//! The Recycle Bin: how full it is, emptying it when you say so, and —
//! only if you switch it on — clearing out things that have sat in it for
//! 30 days or more, so a mistake made today can still be undone for a month.

use std::time::Duration;

/// (items, MB) across every drive's Recycle Bin — `None` if Windows
/// couldn't say.
#[cfg(windows)]
pub fn size() -> Option<(u64, u64)> {
    use windows::core::PCWSTR;
    use windows::Win32::UI::Shell::{SHQueryRecycleBinW, SHQUERYRBINFO};
    let mut info = SHQUERYRBINFO { cbSize: std::mem::size_of::<SHQUERYRBINFO>() as u32, ..Default::default() };
    unsafe { SHQueryRecycleBinW(PCWSTR::null(), &mut info) }
        .ok()
        .map(|_| (info.i64NumItems.max(0) as u64, (info.i64Size.max(0) as u64) / (1024 * 1024)))
}

#[cfg(not(windows))]
pub fn size() -> Option<(u64, u64)> {
    None
}

/// Empty it for good (asked for, and confirmed, in Settings). Plain words back.
#[cfg(windows)]
pub fn empty() -> String {
    use windows::core::PCWSTR;
    use windows::Win32::UI::Shell::{SHEmptyRecycleBinW, SHERB_NOCONFIRMATION, SHERB_NOPROGRESSUI, SHERB_NOSOUND};
    let known = size();
    if known.is_some_and(|(items, _)| items == 0) {
        return "The Recycle Bin is already empty.".into();
    }
    match unsafe { SHEmptyRecycleBinW(None, PCWSTR::null(), SHERB_NOCONFIRMATION | SHERB_NOPROGRESSUI | SHERB_NOSOUND) } {
        Ok(()) => match known {
            Some((items, mb)) => format!("Emptied the Recycle Bin — {items} item{} ({}).", if items == 1 { "" } else { "s" }, pretty_mb(mb)),
            None => "Emptied the Recycle Bin.".into(),
        },
        Err(e) => format!("I couldn't empty the Recycle Bin: {e}"),
    }
}

#[cfg(not(windows))]
pub fn empty() -> String {
    "The Recycle Bin is only on Windows.".into()
}

fn pretty_mb(mb: u64) -> String {
    if mb >= 1024 { format!("{:.1} GB", mb as f64 / 1024.0) } else { format!("{mb} MB") }
}

/// Delete what has been in the Recycle Bin for `days` or more: each item's
/// file and its record, so nothing half-deleted is left listed. The script
/// reads the bin itself — only the number of days is put into it. How many went.
pub fn clear_older_than(days: u32) -> usize {
    let script = format!(
        "$bin = (New-Object -ComObject Shell.Application).Namespace(10); $cut = (Get-Date).AddDays(-{days}); $n = 0; \
         $bad = 0; foreach ($i in @($bin.Items())) {{ $d = $i.ExtendedProperty('System.Recycle.DateDeleted'); \
           if ($d -and $d -lt $cut) {{ $p = $i.Path; $leaf = Split-Path $p -Leaf; \
             if ($leaf -like '$R*') {{ $rec = Join-Path (Split-Path $p) ('$I' + $leaf.Substring(2)); \
               try {{ Remove-Item -LiteralPath $p -Recurse -Force -ErrorAction Stop; Remove-Item -LiteralPath $rec -Force -ErrorAction Stop; $n++ }} catch {{ $bad++ }} }} }} }}; \"$n $bad\""
    );
    let out = crate::deepclean::powershell(&script, Duration::from_secs(90)).unwrap_or_default();
    let mut nums = out.split_whitespace().filter_map(|w| w.parse::<usize>().ok());
    let (n, bad) = (nums.next().unwrap_or(0), nums.next().unwrap_or(0));
    if n > 0 {
        eprintln!("[recycle] cleared {n} item(s) older than {days} days from the Recycle Bin");
    }
    if bad > 0 {
        eprintln!("[recycle] {bad} old item(s) couldn't be fully removed (in use or protected) — left for next time");
    }
    n
}

#[cfg(test)]
mod tests {
    #[test]
    fn sizes_read_plainly() {
        assert_eq!(super::pretty_mb(512), "512 MB");
        assert_eq!(super::pretty_mb(2048), "2.0 GB");
    }
}
