//! PC Boost, the deep part — "Make my PC fast", one button.
//!
//! Right away, no permission needed:
//!   - old temp files; browser caches (only when that browser is closed —
//!     never cookies, logins or history); graphics shader caches; crash dumps
//!     and Windows error-report leftovers
//!   - memory: every background program that isn't on screen has its working
//!     memory trimmed (Windows' own EmptyWorkingSet) — measured before/after
//!   - hogging background updaters closed (boost.rs)
//! Found, then done with one more tap (they're harder to undo):
//!   - bloatware: preinstalled Store junk (Candy Crush, TikTok, Disney+…),
//!     removed for this user — reinstallable from the Store any time
//!   - startup slowdowns: apps launching on every boot, switched off the way
//!     Task Manager does it (fully reversible — Undo brings them back)
//! Deeper, with Windows' permission (a UAC prompt): Windows' own temp, old
//! update downloads, the delivery-optimisation cache, and startup items for
//! all users.
//!
//! Never: your files, the recycle bin, security software, drivers, sync
//! (OneDrive, Dropbox, Google Drive), input methods, or Izuki.

use std::path::{Path, PathBuf};
use std::time::Duration;

use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Item {
    /// What to pass back to remove/disable it.
    pub id: String,
    pub name: String,
    /// "bloat" | "startup"
    pub kind: String,
    /// Ticked by default (known to be safe to lose).
    pub recommended: bool,
    /// Startup: "user" (no permission needed) or "all" (needs permission).
    #[serde(default)]
    pub scope: String,
}

#[derive(Debug, Clone, Default, Serialize)]
pub struct Report {
    pub said: String,
    pub freed_mb: u64,
    pub ram_freed_mb: u64,
    pub closed: Vec<String>,
    pub bloat: Vec<Item>,
    pub startup: Vec<Item>,
    /// Browsers left alone because they were open.
    pub skipped: Vec<String>,
}

// ---- PowerShell, hidden ---------------------------------------------------------------

fn ps(script: &str, timeout: Duration) -> Result<String> {
    use std::io::Read;
    use std::process::{Command, Stdio};
    let mut c = Command::new("powershell");
    c.args(["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", script])
        .stdout(Stdio::piped())
        .stderr(Stdio::null());
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        c.creation_flags(0x0800_0000);
    }
    let mut child = c.spawn()?;
    let mut out = child.stdout.take().ok_or_else(|| anyhow!("no output"))?;
    let reader = std::thread::spawn(move || {
        let mut s = String::new();
        let _ = out.read_to_string(&mut s);
        s
    });
    let start = std::time::Instant::now();
    loop {
        if child.try_wait()?.is_some() {
            break;
        }
        if start.elapsed() > timeout {
            let _ = child.kill();
            return Err(anyhow!("it took too long"));
        }
        std::thread::sleep(Duration::from_millis(100));
    }
    Ok(reader.join().unwrap_or_default())
}

/// A single-quoted PowerShell string.
fn q(s: &str) -> String {
    format!("'{}'", s.replace('\'', "''"))
}

// ---- caches -------------------------------------------------------------------------

/// Everything under `dir` older than `age` (files in use are skipped). MB freed.
fn clear(dir: &Path, age: Duration) -> u64 {
    let mut freed = 0u64;
    clear_dir(dir, age, 0, &mut freed);
    freed / (1024 * 1024)
}

fn clear_dir(dir: &Path, age: Duration, depth: usize, freed: &mut u64) {
    let Ok(rd) = std::fs::read_dir(dir) else { return };
    for e in rd.flatten() {
        let Ok(meta) = std::fs::symlink_metadata(e.path()) else { continue };
        if meta.file_type().is_symlink() {
            continue;
        }
        let old = age.is_zero() || meta.modified().ok().and_then(|m| m.elapsed().ok()).is_some_and(|el| el > age);
        let path = e.path();
        if meta.is_dir() {
            if depth < 8 {
                clear_dir(&path, age, depth + 1, freed);
                if old {
                    let _ = std::fs::remove_dir(&path);
                }
            }
        } else if old && std::fs::remove_file(&path).is_ok() {
            *freed += meta.len();
        }
    }
}

/// Caches that rebuild themselves: (folder, only-files-older-than).
fn cache_dirs() -> Vec<(PathBuf, Duration)> {
    let mut v = Vec::new();
    let day = Duration::from_secs(24 * 3600);
    if let Some(local) = dirs::data_local_dir() {
        for (p, age) in [
            ("CrashDumps", Duration::ZERO),
            ("Microsoft\\Windows\\WER\\ReportArchive", Duration::ZERO),
            ("Microsoft\\Windows\\WER\\ReportQueue", Duration::ZERO),
            ("D3DSCache", day),
            ("NVIDIA\\DXCache", day),
            ("NVIDIA\\GLCache", day),
            ("AMD\\DxCache", day),
            ("AMD\\GLCache", day),
            ("Microsoft\\Windows\\INetCache\\IE", day),
        ] {
            v.push((local.join(p), age));
        }
    }
    v
}

/// Browser caches (Chrome, Edge, Brave): every profile's Cache, Code Cache and
/// GPUCache — never cookies, logins, history or site data. Only for browsers
/// that are closed. (freed MB, browsers skipped because open)
fn browser_caches(running: &[String]) -> (u64, Vec<String>) {
    let Some(local) = dirs::data_local_dir() else { return (0, vec![]) };
    let mut freed = 0;
    let mut skipped = Vec::new();
    for (name, exe, data) in [
        ("Chrome", "chrome", "Google\\Chrome\\User Data"),
        ("Edge", "msedge", "Microsoft\\Edge\\User Data"),
        ("Brave", "brave", "BraveSoftware\\Brave-Browser\\User Data"),
    ] {
        let root = local.join(data);
        if !root.exists() {
            continue;
        }
        if running.iter().any(|r| r.eq_ignore_ascii_case(exe)) {
            skipped.push(name.to_string());
            continue;
        }
        let Ok(rd) = std::fs::read_dir(&root) else { continue };
        for profile in rd.flatten().filter(|e| e.path().is_dir()) {
            let pn = profile.file_name().to_string_lossy().to_string();
            if pn != "Default" && !pn.starts_with("Profile ") && pn != "Guest Profile" {
                continue;
            }
            for sub in ["Cache", "Code Cache", "GPUCache", "DawnCache", "DawnGraphiteCache", "GrShaderCache"] {
                freed += clear(&profile.path().join(sub), Duration::ZERO);
            }
        }
        for sub in ["ShaderCache", "GrShaderCache", "GraphiteDawnCache"] {
            freed += clear(&root.join(sub), Duration::ZERO);
        }
    }
    (freed, skipped)
}

/// The caches that rebuild themselves (not browsers'): MB freed.
pub fn clear_caches() -> u64 {
    cache_dirs().into_iter().map(|(d, age)| clear(&d, age)).sum()
}

/// Trim background programs' memory: MB freed.
pub fn trim() -> u64 {
    trim_memory()
}

// ---- memory ----------------------------------------------------------------------

/// Trim the working memory of background programs (no window on screen):
/// Windows pages out what they aren't using right now. MB freed (measured).
#[cfg(windows)]
fn trim_memory() -> u64 {
    use windows::Win32::Foundation::CloseHandle;
    use windows::Win32::System::ProcessStatus::{K32EmptyWorkingSet, K32EnumProcesses};
    use windows::Win32::System::Threading::{OpenProcess, PROCESS_QUERY_LIMITED_INFORMATION, PROCESS_SET_QUOTA};
    let before = free_mb();
    let fronts = crate::boost::windowed_pids();
    let me = std::process::id();
    let mut pids = vec![0u32; 4096];
    let mut got = 0u32;
    if !unsafe { K32EnumProcesses(pids.as_mut_ptr(), (pids.len() * 4) as u32, &mut got) }.as_bool() {
        return 0;
    }
    pids.truncate(got as usize / 4);
    for pid in pids.into_iter().filter(|p| *p > 4 && *p != me && !fronts.contains(p)) {
        let Ok(h) = (unsafe { OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION | PROCESS_SET_QUOTA, false, pid) }) else { continue };
        if crate::boost::is_protected_pid(h) {
            unsafe { let _ = CloseHandle(h); }
            continue;
        }
        unsafe {
            let _ = K32EmptyWorkingSet(h);
            let _ = CloseHandle(h);
        }
    }
    std::thread::sleep(Duration::from_millis(400));
    free_mb().saturating_sub(before)
}
#[cfg(not(windows))]
fn trim_memory() -> u64 {
    0
}

#[cfg(windows)]
fn free_mb() -> u64 {
    use windows::Win32::System::SystemInformation::{GlobalMemoryStatusEx, MEMORYSTATUSEX};
    let mut m = MEMORYSTATUSEX { dwLength: std::mem::size_of::<MEMORYSTATUSEX>() as u32, ..Default::default() };
    if unsafe { GlobalMemoryStatusEx(&mut m) }.is_ok() { m.ullAvailPhys / (1024 * 1024) } else { 0 }
}

// ---- bloatware ---------------------------------------------------------------------

/// Preinstalled Store apps that only slow a PC down: (package name pattern, nice name).
const BLOAT: &[(&str, &str)] = &[
    ("king.com.CandyCrush", "Candy Crush"),
    ("king.com.", "King games"),
    ("BytedancePte.Ltd.TikTok", "TikTok"),
    ("Disney.", "Disney+"),
    ("Microsoft.MicrosoftSolitaireCollection", "Solitaire Collection"),
    ("Microsoft.BingNews", "Microsoft News"),
    ("Microsoft.BingSports", "Microsoft Sports"),
    ("Microsoft.BingFinance", "Microsoft Money"),
    ("Microsoft.GetHelp", "Get Help"),
    ("Microsoft.Getstarted", "Tips"),
    ("Microsoft.WindowsFeedbackHub", "Feedback Hub"),
    ("Microsoft.MicrosoftOfficeHub", "Office hub (ads)"),
    ("Microsoft.People", "People"),
    ("Microsoft.Messaging", "Messaging"),
    ("Microsoft.OneConnect", "Mobile Plans"),
    ("Microsoft.MixedReality.Portal", "Mixed Reality Portal"),
    ("Microsoft.3DBuilder", "3D Builder"),
    ("Microsoft.Microsoft3DViewer", "3D Viewer"),
    ("Microsoft.Print3D", "Print 3D"),
    ("Microsoft.Wallet", "Wallet"),
    ("Microsoft.SkypeApp", "Skype"),
    ("Microsoft.ZuneVideo", "Movies & TV"),
    ("Microsoft.549981C3F5F10", "Cortana"),
    ("Clipchamp.Clipchamp", "Clipchamp"),
    ("Facebook.Facebook", "Facebook"),
    ("Facebook.InstagramBeta", "Instagram (preinstalled)"),
    ("AmazonVideo.PrimeVideo", "Prime Video (preinstalled)"),
    ("Microsoft.BingSearch", "Bing search"),
    ("Microsoft.Copilot_", "Copilot app (ads)"),
    ("Microsoft.OutlookForWindows", "New Outlook (preinstalled)"),
    ("4DF9E0F8.Netflix", "Netflix (preinstalled)"),
    ("SpotifyAB.SpotifyMusic", "Spotify (preinstalled)"),
    ("Microsoft.Todos", "Microsoft To Do"),
    ("Microsoft.PowerAutomateDesktop", "Power Automate"),
    ("Microsoft.WindowsMaps", "Maps"),
];
/// Ones people often use: listed, but not ticked.
const MAYBE_USED: &[&str] = &["SpotifyAB.SpotifyMusic", "4DF9E0F8.Netflix", "Microsoft.Todos", "Microsoft.WindowsMaps", "Facebook.InstagramBeta", "AmazonVideo.PrimeVideo", "Microsoft.OutlookForWindows", "Microsoft.SkypeApp"];

fn find_bloat() -> Vec<Item> {
    let Ok(out) = ps("Get-AppxPackage | Select-Object Name,PackageFullName | ConvertTo-Json -Compress", Duration::from_secs(25)) else { return vec![] };
    let list: Vec<serde_json::Value> = match serde_json::from_str::<serde_json::Value>(out.trim()) {
        Ok(serde_json::Value::Array(a)) => a,
        Ok(v @ serde_json::Value::Object(_)) => vec![v],
        _ => return vec![],
    };
    let mut found: Vec<Item> = Vec::new();
    for p in list {
        let name = p["Name"].as_str().unwrap_or("");
        let full = p["PackageFullName"].as_str().unwrap_or("");
        if let Some((pat, nice)) = BLOAT.iter().find(|(pat, _)| name.starts_with(pat)) {
            if found.iter().any(|f| f.name == *nice) {
                continue;
            }
            found.push(Item { id: full.to_string(), name: nice.to_string(), kind: "bloat".into(), recommended: !MAYBE_USED.iter().any(|m| pat.starts_with(m)), scope: "user".into() });
        }
    }
    found
}

// ---- startup ----------------------------------------------------------------------

/// Never switched off: security, drivers, audio, input, sync, Izuki.
const KEEP_STARTUP: &[&str] = &[
    "security", "defender", "antivirus", "avast", "avg", "norton", "mcafee", "malwarebytes", "bitdefender", "kaspersky", "eset",
    "realtek", "nvidia", "amd", "radeon", "intel", "synaptics", "elan", "touchpad", "audio", "sound", "dolby", "waves", "conexant",
    "onedrive", "dropbox", "googledrive", "google drive", "icloud", "izuki", "ctfmon", "ime", "keyboard", "logitech", "razer",
    "corsair", "steelseries", "bluetooth", "wacom", "vpn", "windowsdefender", "securityhealth", "igfx", "hotkey", "power",
];
/// Fine to stop launching on every boot (they start when you open them).
const SLOW_STARTUP: &[&str] = &[
    "spotify", "discord", "steam", "epicgames", "epic games", "teams", "skype", "microsoftedgeautolaunch", "edge", "opera", "ccleaner",
    "itunes", "adobe", "creative cloud", "webex", "zoom", "utorrent", "bittorrent", "battle.net", "eadesktop", "origin", "riot",
    "gog", "whatsapp", "telegram", "slack", "cortana", "update", "updater", "helper", "launcher", "wallpaper", "lghub", "autolaunch",
];

fn find_startup() -> Vec<Item> {
    let script = r#"
$out=@()
$ap='HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved'
function Off($sub,$n,$hive){ $k="$hive\Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\$sub"; try{ $v=(Get-ItemProperty -Path $k -Name $n -EA Stop).$n; return ($v[0] -band 1) -eq 1 }catch{ return $false } }
foreach($e in @(@('HKCU:\Software\Microsoft\Windows\CurrentVersion\Run','user','Run','HKCU:'),@('HKLM:\Software\Microsoft\Windows\CurrentVersion\Run','all','Run','HKLM:'),@('HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Run','all','Run32','HKLM:'))){
  if(Test-Path $e[0]){ $k=Get-ItemProperty $e[0]; foreach($p in $k.PSObject.Properties){ if($p.Name -notlike 'PS*'){ $out+=[pscustomobject]@{name=$p.Name;cmd=[string]$p.Value;scope=$e[1];sub=$e[2];off=(Off $e[2] $p.Name $e[3])} } } }
}
$sf=[Environment]::GetFolderPath('Startup')
Get-ChildItem $sf -Filter *.lnk -EA SilentlyContinue | ForEach-Object { $out+=[pscustomobject]@{name=$_.Name;cmd=$_.FullName;scope='user';sub='StartupFolder';off=(Off 'StartupFolder' $_.Name 'HKCU:')} }
$out | ConvertTo-Json -Compress
"#;
    let Ok(out) = ps(script, Duration::from_secs(20)) else { return vec![] };
    let list: Vec<serde_json::Value> = match serde_json::from_str::<serde_json::Value>(out.trim()) {
        Ok(serde_json::Value::Array(a)) => a,
        Ok(v @ serde_json::Value::Object(_)) => vec![v],
        _ => return vec![],
    };
    let mut items = Vec::new();
    for v in list {
        if v["off"].as_bool() == Some(true) {
            continue;
        }
        let name = v["name"].as_str().unwrap_or("").to_string();
        let cmd = v["cmd"].as_str().unwrap_or("").to_lowercase();
        let hay = format!("{} {}", name.to_lowercase(), cmd);
        if name.is_empty() || KEEP_STARTUP.iter().any(|k| hay.contains(k)) {
            continue;
        }
        let recommended = SLOW_STARTUP.iter().any(|k| hay.contains(k));
        let sub = v["sub"].as_str().unwrap_or("Run");
        let scope = v["scope"].as_str().unwrap_or("user").to_string();
        let shown = pretty_startup(&name);
        items.push(Item { id: format!("{sub}|{name}"), name: shown, kind: "startup".into(), recommended, scope });
    }
    items
}

/// "GoogleChromeAutoLaunch_3616BD…" → "Chrome auto-launch"; "Foo.lnk" → "Foo".
fn pretty_startup(name: &str) -> String {
    let n = name.trim_end_matches(".lnk");
    let low = n.to_lowercase();
    for (k, v) in [("googlechromeautolaunch", "Chrome auto-launch"), ("microsoftedgeautolaunch", "Edge auto-launch"), ("cometupdater", "Comet browser updater"), ("eadm", "EA app"), ("navigatorautolaunch", "Navigator auto-launch")] {
        if low.starts_with(k) {
            return v.to_string();
        }
    }
    // Drop long version numbers and hashes on the end.
    let cut = n.find(|c: char| c == '_').filter(|i| n[i + 1..].len() >= 16).unwrap_or(n.len());
    n[..cut].trim_end_matches(|c: char| c.is_ascii_digit() || c == '.').to_string()
}

/// StartupApproved bytes: 3 = off, 2 = on (what Task Manager writes).
fn startup_script(ids: &[String], hive: &str, on: bool) -> String {
    let byte = if on { 2 } else { 3 };
    let mut s = String::new();
    for id in ids {
        let Some((sub, name)) = id.split_once('|') else { continue };
        if !["Run", "Run32", "StartupFolder"].contains(&sub) {
            continue;
        }
        s.push_str(&format!(
            "$k='{hive}\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StartupApproved\\{sub}'; if(!(Test-Path $k)){{New-Item -Path $k -Force|Out-Null}}; Set-ItemProperty -Path $k -Name {} -Value ([byte[]]({byte},0,0,0,0,0,0,0,0,0,0,0)) -Type Binary;\n",
            q(name)
        ));
    }
    s
}

// ---- the button -----------------------------------------------------------------------

/// "Make my PC fast": the safe part now, and what else was found.
pub fn run() -> Report {
    let running = crate::boost::running_names();
    let mut freed = crate::boost::clear_old_temp();
    for (dir, age) in cache_dirs() {
        freed += clear(&dir, age);
    }
    let (browser, skipped) = browser_caches(&running);
    freed += browser;
    let closed = crate::boost::close_helpers();
    let ram = trim_memory();
    let bloat = find_bloat();
    let startup = find_startup();
    let mut r = Report { freed_mb: freed, ram_freed_mb: ram, closed, bloat, startup, skipped, said: String::new() };
    r.said = say(&r);
    eprintln!("[deepclean] {}", r.said);
    r
}

fn say(r: &Report) -> String {
    let size = |mb: u64| if mb >= 1024 { format!("{:.1} GB", mb as f64 / 1024.0) } else { format!("{mb} MB") };
    let mut done: Vec<String> = Vec::new();
    if r.freed_mb > 0 {
        done.push(format!("cleared {} of junk files", size(r.freed_mb)));
    }
    if r.ram_freed_mb >= 50 {
        done.push(format!("freed {} of memory", size(r.ram_freed_mb)));
    }
    if !r.closed.is_empty() {
        done.push(format!("closed {}", r.closed.join(", ")));
    }
    let mut s = if done.is_empty() { "Your PC was already clean.".to_string() } else { format!("Done — I {}.", done.join(", ")) };
    let bloat = r.bloat.iter().filter(|b| b.recommended).count();
    let boot = r.startup.iter().filter(|b| b.recommended).count();
    if bloat > 0 || boot > 0 {
        let mut found = Vec::new();
        if bloat > 0 {
            found.push(format!("{bloat} bloatware app{}", if bloat == 1 { "" } else { "s" }));
        }
        if boot > 0 {
            found.push(format!("{boot} app{} slowing your startup", if boot == 1 { "" } else { "s" }));
        }
        s.push_str(&format!(" I also found {} — say “remove the bloatware” or tap Remove to finish the job.", found.join(" and ")));
    }
    if !r.skipped.is_empty() {
        s.push_str(&format!(" ({} was open, so I left its cache.)", r.skipped.join(" and ")));
    }
    s
}

/// Remove the chosen bloatware and switch off the chosen startup apps (this
/// user's; ones for all users need permission — see `admin`).
pub fn remove(bloat_ids: &[String], startup_ids: &[String]) -> Result<String> {
    let mut script = String::new();
    for id in bloat_ids.iter().filter(|i| !i.is_empty() && !i.contains(['\'', '"', ';'])) {
        script.push_str(&format!("try{{Remove-AppxPackage -Package {} -EA Stop; $ok++}}catch{{$bad++}};\n", q(id)));
    }
    let user: Vec<String> = startup_ids.iter().filter(|i| !i.starts_with("Run32|") && !is_all_users(i)).cloned().collect();
    script.push_str(&startup_script(&user, "HKCU:", false));
    if script.is_empty() {
        return Ok("Nothing chosen.".into());
    }
    let full = format!("$ok=0;$bad=0;\n{script}\n\"$ok|$bad\"");
    let out = ps(&full, Duration::from_secs(180))?;
    let (ok, bad) = out.trim().lines().last().and_then(|l| l.split_once('|')).map(|(a, b)| (a.trim().parse::<u32>().unwrap_or(0), b.trim().parse::<u32>().unwrap_or(0))).unwrap_or((0, 0));
    let mut parts = Vec::new();
    if ok > 0 {
        parts.push(format!("removed {ok} bloatware app{}", if ok == 1 { "" } else { "s" }));
    }
    if !user.is_empty() {
        parts.push(format!("stopped {} app{} launching at startup", user.len(), if user.len() == 1 { "" } else { "s" }));
    }
    let mut s = if parts.is_empty() { "Nothing changed.".to_string() } else { format!("Done — I {}.", parts.join(" and ")) };
    if bad > 0 {
        s.push_str(&format!(" {bad} wouldn't come off (Windows protects some)."));
    }
    let all = startup_ids.len() - user.len();
    if all > 0 {
        s.push_str(&format!(" {all} startup app{} for all users need{} Windows' permission — tap Deeper clean.", if all == 1 { "" } else { "s" }, if all == 1 { "s" } else { "" }));
    }
    let _ = std::fs::write(undo_file(), serde_json::to_string(&user).unwrap_or_default());
    Ok(s)
}

fn is_all_users(id: &str) -> bool {
    LAST_ALL.lock().iter().any(|x| x == id)
}
static LAST_ALL: parking_lot::Mutex<Vec<String>> = parking_lot::Mutex::new(Vec::new());

/// Remember which startup items need permission (from the last scan).
pub fn note_scan(r: &Report) {
    *LAST_ALL.lock() = r.startup.iter().filter(|i| i.scope == "all").map(|i| i.id.clone()).collect();
}

fn undo_file() -> PathBuf {
    std::env::temp_dir().join("izuki-startup-undo.json")
}

/// Turn back on the startup apps switched off last time.
pub fn undo_startup() -> Result<String> {
    let ids: Vec<String> = std::fs::read_to_string(undo_file()).ok().and_then(|t| serde_json::from_str(&t).ok()).unwrap_or_default();
    if ids.is_empty() {
        return Ok("Nothing to undo.".into());
    }
    ps(&startup_script(&ids, "HKCU:", true), Duration::from_secs(30))?;
    let _ = std::fs::remove_file(undo_file());
    Ok(format!("Turned {} startup app{} back on.", ids.len(), if ids.len() == 1 { "" } else { "s" }))
}

/// The deeper clean, with Windows' permission (one UAC prompt): Windows' own
/// temp, old update downloads, the delivery-optimisation cache, and startup
/// apps for all users that were chosen.
pub fn admin(startup_ids: &[String]) -> Result<String> {
    let result = std::env::temp_dir().join("izuki-deepclean-result.txt");
    let _ = std::fs::remove_file(&result);
    let all: Vec<String> = startup_ids.iter().filter(|i| is_all_users(i) || i.starts_with("Run32|")).cloned().collect();
    let body = format!(
        r#"$ErrorActionPreference='SilentlyContinue'
$before=(Get-PSDrive C).Free
Get-ChildItem "$env:WINDIR\Temp" -Force | Where-Object {{ $_.LastWriteTime -lt (Get-Date).AddDays(-1) }} | Remove-Item -Recurse -Force
Stop-Service wuauserv -Force; Stop-Service bits -Force
Remove-Item "$env:WINDIR\SoftwareDistribution\Download\*" -Recurse -Force
Start-Service bits; Start-Service wuauserv
Delete-DeliveryOptimizationCache -Force
{}
$after=(Get-PSDrive C).Free
[math]::Max(0,[math]::Round(($after-$before)/1MB)) | Out-File -FilePath {} -Encoding ascii
"#,
        startup_script(&all, "HKLM:", false),
        q(&result.to_string_lossy())
    );
    let script = std::env::temp_dir().join("izuki-deepclean.ps1");
    std::fs::write(&script, body)?;
    let launch = format!(
        "try {{ Start-Process powershell -Verb RunAs -WindowStyle Hidden -Wait -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File',{} ; 'ok' }} catch {{ 'no' }}",
        q(&script.to_string_lossy())
    );
    let out = ps(&launch, Duration::from_secs(600))?;
    let _ = std::fs::remove_file(&script);
    if out.trim().ends_with("no") {
        return Ok("Okay — no deeper clean (Windows' permission wasn't given).".into());
    }
    let mb: u64 = std::fs::read_to_string(&result).ok().and_then(|t| t.trim().parse().ok()).unwrap_or(0);
    let _ = std::fs::remove_file(&result);
    let mut s = if mb > 0 { format!("Deep clean done — freed {} from Windows' own files.", if mb >= 1024 { format!("{:.1} GB", mb as f64 / 1024.0) } else { format!("{mb} MB") }) } else { "Deep clean done — Windows' own files were already tidy.".to_string() };
    if !all.is_empty() {
        s.push_str(&format!(" And {} startup app{} for all users switched off.", all.len(), if all.len() == 1 { "" } else { "s" }));
    }
    Ok(s)
}

/// "Remove the bloatware": everything recommended from a fresh scan.
pub fn remove_recommended() -> Result<String> {
    let r = Report { bloat: find_bloat(), startup: find_startup(), ..Default::default() };
    note_scan(&r);
    let b: Vec<String> = r.bloat.iter().filter(|i| i.recommended).map(|i| i.id.clone()).collect();
    let s: Vec<String> = r.startup.iter().filter(|i| i.recommended && i.scope == "user").map(|i| i.id.clone()).collect();
    if b.is_empty() && s.is_empty() {
        return Ok("No bloatware or slow startup apps found — your PC's already lean.".into());
    }
    remove(&b, &s)
}

/// "Remove the bloatware", "uninstall bloatware", "stop apps at startup".
pub fn is_bloat_request(said: &str) -> bool {
    let t = said.to_lowercase();
    (t.contains("bloat") && ["remove", "delete", "uninstall", "get rid", "clean", "kill"].iter().any(|w| t.contains(w)))
        || t.contains("stop apps at startup")
        || t.contains("startup apps off")
        || t.contains("disable startup apps")
}

/// "Deep clean my PC", "make my PC fast".
pub fn is_deep_request(said: &str) -> bool {
    let t = said.to_lowercase();
    ["deep clean", "make my pc fast", "make my computer fast", "make my laptop fast", "clean my pc", "clean my computer", "clean my laptop", "optimize my pc", "optimise my pc", "tune up my pc", "never lag", "stop lagging"]
        .iter()
        .any(|p| t.contains(p))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hears_the_requests() {
        assert!(is_bloat_request("remove the bloatware"));
        assert!(is_bloat_request("uninstall all bloat"));
        assert!(!is_bloat_request("what is bloatware"));
        assert!(is_deep_request("make my PC fast"));
        assert!(is_deep_request("deep clean my laptop"));
        assert!(!is_deep_request("clean my room"));
    }

    /// What the scans find on this PC (read only): `cargo test deepclean::tests::scan -- --ignored --nocapture`.
    #[test]
    #[ignore]
    fn scan() {
        for i in find_bloat() { eprintln!("bloat   {:<34} rec={}", i.name, i.recommended); }
        for i in find_startup() { eprintln!("startup {:<34} rec={} scope={}", i.name, i.recommended, i.scope); }
    }

    #[test]
    fn startup_changes_are_what_task_manager_writes() {
        let s = startup_script(&["Run|Spotify".into(), "StartupFolder|Discord.lnk".into(), "Evil|x".into()], "HKCU:", false);
        assert!(s.contains("StartupApproved\\Run'") && s.contains("-Name 'Spotify'") && s.contains("[byte[]](3,0"));
        assert!(s.contains("StartupApproved\\StartupFolder'") && s.contains("'Discord.lnk'"));
        assert!(!s.contains("Evil"));
        assert!(startup_script(&["Run|A".into()], "HKCU:", true).contains("[byte[]](2,0"));
        assert_eq!(q("it's"), "'it''s'");
    }
}
