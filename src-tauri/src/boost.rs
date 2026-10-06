//! PC Boost — notices when the PC is struggling and helps, the way a friend
//! who knows computers would: "your PC's working hard — want me to speed it
//! up?", then clears old temp files, closes the background helpers that are
//! eating it (updaters, crash reporters, telemetry — never a window you're
//! using), and says which open app is the heavy one.
//!
//! - Watching (Settings → PC Boost, on by default) only looks: a few cheap
//!   system calls every 5 s, no AI. When the PC is pinned for a while, the
//!   Island offers "Speed it up".
//! - "Fix it by itself" (off by default) does the safe part on its own.
//! - "Speed up my PC" / "my PC is lagging" runs it at once, from anywhere.
//!
//! Nothing here ever closes an app with a window, a system process, a
//! security tool or Izuki itself, and only files in the user's own temp
//! folder that are days old are deleted.

use std::time::{Duration, Instant};

use parking_lot::Mutex;
use serde::Serialize;

/// One process worth mentioning.
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Hog {
    pub pid: u32,
    pub name: String,
    /// Share of the whole PC's processor, 0–100.
    pub cpu: f32,
    pub mem_mb: u64,
    /// Has a visible window (an app the user is using): never closed here.
    pub window: bool,
}

#[derive(Debug, Clone, Default, Serialize)]
pub struct Health {
    /// The whole PC's processor use, 0–100.
    pub cpu: u8,
    /// Memory in use, 0–100.
    pub ram: u8,
    pub ram_free_gb: f32,
    /// Pinned long enough to feel slow.
    pub lagging: bool,
    /// The heaviest few processes right now.
    pub hogs: Vec<Hog>,
}

/// Never touched, whatever they use.
const NEVER: &[&str] = &[
    "system", "idle", "registry", "smss", "csrss", "wininit", "winlogon", "services", "lsass", "lsaiso", "svchost",
    "dwm", "explorer", "fontdrvhost", "spoolsv", "audiodg", "ctfmon", "sihost", "taskhostw", "runtimebroker",
    "startmenuexperiencehost", "shellexperiencehost", "searchhost", "searchapp", "textinputhost", "conhost",
    "msmpeng", "nissrv", "mpdefendercoreservice", "securityhealthservice", "securityhealthsystray", "smartscreen",
    "memory compression", "secure system", "wudfhost", "dllhost", "lockapp", "logonui", "taskmgr", "izuki",
    "msedgewebview2", "applicationframehost", "systemsettings", "useroobebroker", "wmiprvse", "trustedinstaller",
    "tiworker", "msiexec", "setup", "installer",
];

/// Background helpers that are safe to close when they hog the PC: they
/// start again by themselves when they're needed.
fn safe_helper(name: &str) -> bool {
    let n = name.to_lowercase();
    !NEVER.contains(&n.as_str())
        && ["update", "updater", "crashpad", "crashreport", "crash_report", "telemetry", "reporter", "feedbackhub", "adobearm", "jusched", "acrotray"]
            .iter()
            .any(|w| n.contains(w))
}

/// How the last few looks went: (cpu, ram) samples, newest last.
static SAMPLES: Mutex<Vec<(u8, u8)>> = Mutex::new(Vec::new());
/// When the Island last offered help, and when it last ran by itself.
static OFFERED: Mutex<Option<Instant>> = Mutex::new(None);
static AUTO_RAN: Mutex<Option<Instant>> = Mutex::new(None);
/// The once-a-day tidy (with "Keep my PC fast by itself" on).
static DAILY: Mutex<Option<Instant>> = Mutex::new(None);

/// Slow enough to notice: the processor pinned for ~30 s, or memory nearly
/// full for ~15 s.
pub fn is_lagging(samples: &[(u8, u8)]) -> bool {
    let busy = samples.iter().rev().take(6).filter(|(c, _)| *c >= 88).count() >= 6;
    let full = samples.iter().rev().take(3).filter(|(_, r)| *r >= 92).count() >= 3;
    busy || full
}

/// "Speed up my PC", "my PC is lagging", "free up some memory"…
pub fn is_request(said: &str) -> bool {
    let t = said.to_lowercase();
    let t = t.trim().trim_start_matches("hey nova").trim_matches(|c: char| !c.is_alphanumeric() && c != ' ').trim();
    [
        "speed up my pc", "speed up my computer", "speed up my laptop", "speed my pc up", "make my pc faster",
        "make my computer faster", "my pc is slow", "my pc is lagging", "my computer is slow", "my computer is lagging",
        "my laptop is slow", "my laptop is lagging", "pc is lagging", "computer is lagging", "free up memory",
        "free up some memory", "free up ram", "boost my pc", "pc boost", "unlag", "clean up my pc", "why is my pc slow",
        "why is my computer slow", "why is my laptop slow",
    ]
    .iter()
    .any(|p| t.contains(p))
}

/// What a boost did, said in a sentence or two.
pub fn summary(freed_mb: u64, closed: &[String], heavy: Option<&Hog>, health: &Health) -> String {
    let mut parts: Vec<String> = Vec::new();
    if freed_mb >= 1 {
        parts.push(if freed_mb >= 1024 {
            format!("cleared {:.1} GB of old temp files", freed_mb as f64 / 1024.0)
        } else {
            format!("cleared {freed_mb} MB of old temp files")
        });
    }
    if !closed.is_empty() {
        parts.push(format!("closed {} background {} ({})", closed.len(), if closed.len() == 1 { "helper" } else { "helpers" }, closed.join(", ")));
    }
    let mut out = if parts.is_empty() {
        "Nothing to clear right now — your temp files are tidy and no background helpers are hogging it.".to_string()
    } else {
        format!("Done — I {}.", join_and(&parts))
    };
    if let Some(h) = heavy {
        let what = if h.mem_mb >= 1024 { format!("{:.1} GB of memory", h.mem_mb as f64 / 1024.0) } else { format!("{} MB of memory", h.mem_mb) };
        out.push_str(&format!(
            " The heavy one is {} ({}{}) — closing some of its tabs or windows would help most.",
            pretty(&h.name),
            what,
            if h.cpu >= 15.0 { format!(", {:.0}% of the processor", h.cpu) } else { String::new() }
        ));
    } else if health.cpu > 0 {
        out.push_str(&format!(" Right now: processor {}%, memory {}%.", health.cpu, health.ram));
    }
    out
}

fn join_and(parts: &[String]) -> String {
    match parts.len() {
        0 => String::new(),
        1 => parts[0].clone(),
        _ => format!("{} and {}", parts[..parts.len() - 1].join(", "), parts[parts.len() - 1]),
    }
}

/// "chrome" → "Chrome", "msedge" → "Edge".
pub fn pretty(name: &str) -> String {
    let n = name.trim_end_matches(".exe");
    match n.to_lowercase().as_str() {
        "msedge" => "Edge".into(),
        "chrome" => "Chrome".into(),
        "firefox" => "Firefox".into(),
        "code" => "VS Code".into(),
        "winword" => "Word".into(),
        "excel" => "Excel".into(),
        "powerpnt" => "PowerPoint".into(),
        "teams" | "ms-teams" => "Teams".into(),
        _ => {
            let mut c = n.chars();
            c.next().map(|f| f.to_uppercase().collect::<String>() + c.as_str()).unwrap_or_default()
        }
    }
}

/// Files in the user's temp folder untouched for 2+ days: deleted, skipping
/// anything in use. Returns MB freed.
pub fn clear_old_temp() -> u64 {
    let Some(dir) = std::env::var_os("TEMP").or_else(|| std::env::var_os("TMP")).map(std::path::PathBuf::from) else { return 0 };
    // Only ever a folder called Temp inside the user's own profile.
    let ok = dir.file_name().is_some_and(|n| n.to_string_lossy().eq_ignore_ascii_case("temp"));
    if !ok {
        return 0;
    }
    let mut freed = 0u64;
    clear_dir(&dir, Duration::from_secs(2 * 24 * 3600), 0, &mut freed);
    freed / (1024 * 1024)
}

fn clear_dir(dir: &std::path::Path, age: Duration, depth: usize, freed: &mut u64) {
    let Ok(rd) = std::fs::read_dir(dir) else { return };
    for e in rd.flatten() {
        let Ok(meta) = e.metadata() else { continue };
        let old = meta.modified().ok().and_then(|m| m.elapsed().ok()).is_some_and(|el| el > age);
        let path = e.path();
        if meta.is_dir() {
            if depth < 6 && !meta.file_type().is_symlink() {
                clear_dir(&path, age, depth + 1, freed);
                if old {
                    let _ = std::fs::remove_dir(&path); // only if now empty
                }
            }
        } else if old && std::fs::remove_file(&path).is_ok() {
            *freed += meta.len();
        }
    }
}

/// Close the background helpers hogging the PC (never a window, never a
/// system or security process). Their names.
pub fn close_helpers() -> Vec<String> {
    let health = sys::health();
    let mut closed = Vec::new();
    for h in &health.hogs {
        if !h.window && safe_helper(&h.name) && (h.cpu >= 8.0 || h.mem_mb >= 300) && sys::close(h.pid) {
            closed.push(pretty(&h.name));
        }
    }
    closed
}

/// Processes with a window on screen (never trimmed or closed).
pub fn windowed_pids() -> std::collections::HashSet<u32> {
    sys::windowed()
}

/// A system, security or Izuki process (by its open handle).
#[cfg(windows)]
pub fn is_protected_pid(h: windows::Win32::Foundation::HANDLE) -> bool {
    let n = sys::name_of(h).to_lowercase();
    n.is_empty() || NEVER.contains(&n.as_str())
}

/// The names of the programs running now ("chrome", "msedge"…).
pub fn running_names() -> Vec<String> {
    sys::health_all_names()
}

/// Clear temp and caches, trim memory, close hogging background helpers, and
/// name the heavy app. `auto`: run by itself ("Keep my PC fast by itself").
pub fn run(auto: bool) -> String {
    let freed = clear_old_temp() + crate::deepclean::clear_caches();
    let ram = crate::deepclean::trim();
    let health = sys::health();
    let closed = close_helpers();
    let heavy = health.hogs.iter().find(|h| h.window && !NEVER.contains(&h.name.to_lowercase().as_str()) && (h.mem_mb >= 900 || h.cpu >= 25.0));
    let mut line = summary(freed, &closed, heavy, &health);
    if ram >= 50 {
        line.push_str(&format!(" Freed {} of memory too.", if ram >= 1024 { format!("{:.1} GB", ram as f64 / 1024.0) } else { format!("{ram} MB") }));
    }
    eprintln!("[boost] {} — {line}", if auto { "by itself" } else { "asked" });
    line
}

/// Watch quietly while Izuki runs; offer (or do) the boost when it's slow.
pub fn spawn(app: tauri::AppHandle) {
    std::thread::Builder::new()
        .name("izuki-boost".into())
        .spawn(move || loop {
            std::thread::sleep(Duration::from_secs(5));
            let s = crate::state::store().settings();
            if !s.pc_boost {
                SAMPLES.lock().clear();
                continue;
            }
            let (cpu, ram) = sys::load();
            let lagging = {
                let mut v = SAMPLES.lock();
                v.push((cpu, ram));
                let excess = v.len().saturating_sub(12);
                v.drain(..excess);
                is_lagging(&v)
            };
            // "Keep my PC fast by itself": a light clean once a day too, at a quiet moment.
            if s.pc_boost_auto && cpu < 30 && DAILY.lock().is_none_or(|t| t.elapsed() > Duration::from_secs(24 * 3600)) {
                *DAILY.lock() = Some(Instant::now());
                let line = run(true);
                eprintln!("[boost] daily tidy: {line}");
            }
            if !lagging {
                continue;
            }
            if s.pc_boost_auto && AUTO_RAN.lock().is_none_or(|t| t.elapsed() > Duration::from_secs(30 * 60)) {
                *AUTO_RAN.lock() = Some(Instant::now());
                let line = run(true);
                crate::activity::show_boost(&format!("Sped up your PC — {line}"), false);
                SAMPLES.lock().clear();
            } else if OFFERED.lock().is_none_or(|t| t.elapsed() > Duration::from_secs(20 * 60)) {
                *OFFERED.lock() = Some(Instant::now());
                crate::activity::show_boost(&format!("Your PC is working hard (processor {cpu}%, memory {ram}%)."), true);
            }
            let _ = &app;
        })
        .ok();
}

/// The current load and heaviest processes (for the Settings card).
pub fn health() -> Health {
    sys::health()
}

#[cfg(windows)]
mod sys {
    use super::{Health, Hog, NEVER};
    use parking_lot::Mutex;
    use std::collections::{HashMap, HashSet};
    use std::time::Instant;
    use windows::Win32::Foundation::{CloseHandle, FILETIME, HWND, LPARAM};
    use windows::Win32::System::ProcessStatus::{K32EnumProcesses, K32GetProcessMemoryInfo, PROCESS_MEMORY_COUNTERS};
    use windows::Win32::System::SystemInformation::{GlobalMemoryStatusEx, MEMORYSTATUSEX};
    use windows::Win32::System::Threading::{
        GetProcessTimes, GetSystemTimes, OpenProcess, QueryFullProcessImageNameW, TerminateProcess, PROCESS_NAME_WIN32,
        PROCESS_QUERY_LIMITED_INFORMATION, PROCESS_TERMINATE,
    };
    use windows::Win32::UI::WindowsAndMessaging::{EnumWindows, GetWindowTextLengthW, GetWindowThreadProcessId, IsWindowVisible};
    use windows_core::BOOL;

    fn ticks(f: FILETIME) -> u64 {
        ((f.dwHighDateTime as u64) << 32) | f.dwLowDateTime as u64
    }

    static LAST_SYS: Mutex<Option<(u64, u64)>> = Mutex::new(None);
    static LAST_PROC: Mutex<Option<(Instant, HashMap<u32, u64>)>> = Mutex::new(None);

    /// (processor %, memory %) for the whole PC.
    pub fn load() -> (u8, u8) {
        let (mut idle, mut kernel, mut user) = (FILETIME::default(), FILETIME::default(), FILETIME::default());
        let cpu = unsafe { GetSystemTimes(Some(&mut idle), Some(&mut kernel), Some(&mut user)) }
            .ok()
            .map(|_| {
                let (i, total) = (ticks(idle), ticks(kernel) + ticks(user));
                let mut last = LAST_SYS.lock();
                let pct = match *last {
                    Some((li, lt)) if total > lt => 100.0 * (1.0 - (i.saturating_sub(li)) as f64 / (total - lt) as f64),
                    _ => 0.0,
                };
                *last = Some((i, total));
                pct.clamp(0.0, 100.0) as u8
            })
            .unwrap_or(0);
        let mut m = MEMORYSTATUSEX { dwLength: std::mem::size_of::<MEMORYSTATUSEX>() as u32, ..Default::default() };
        let ram = if unsafe { GlobalMemoryStatusEx(&mut m) }.is_ok() { m.dwMemoryLoad as u8 } else { 0 };
        (cpu, ram)
    }

    fn free_gb() -> f32 {
        let mut m = MEMORYSTATUSEX { dwLength: std::mem::size_of::<MEMORYSTATUSEX>() as u32, ..Default::default() };
        if unsafe { GlobalMemoryStatusEx(&mut m) }.is_ok() {
            m.ullAvailPhys as f32 / (1024.0 * 1024.0 * 1024.0)
        } else {
            0.0
        }
    }

    pub fn windowed() -> HashSet<u32> {
        with_windows()
    }

    /// Every running program's name (lower case).
    pub fn health_all_names() -> Vec<String> {
        let mut pids = vec![0u32; 4096];
        let mut got = 0u32;
        if !unsafe { K32EnumProcesses(pids.as_mut_ptr(), (pids.len() * 4) as u32, &mut got) }.as_bool() {
            return vec![];
        }
        pids.truncate(got as usize / 4);
        let mut names = Vec::new();
        for pid in pids.into_iter().filter(|p| *p > 4) {
            let Ok(h) = (unsafe { OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid) }) else { continue };
            let n = name_of(h).to_lowercase();
            unsafe {
                let _ = CloseHandle(h);
            }
            if !n.is_empty() && !names.contains(&n) {
                names.push(n);
            }
        }
        names
    }

    fn with_windows() -> HashSet<u32> {
        unsafe extern "system" fn each(h: HWND, l: LPARAM) -> BOOL {
            let set = &mut *(l.0 as *mut HashSet<u32>);
            if IsWindowVisible(h).as_bool() && GetWindowTextLengthW(h) > 0 {
                let mut pid = 0u32;
                GetWindowThreadProcessId(h, Some(&mut pid));
                set.insert(pid);
            }
            BOOL(1)
        }
        let mut set: HashSet<u32> = HashSet::new();
        unsafe {
            let _ = EnumWindows(Some(each), LPARAM(&mut set as *mut _ as isize));
        }
        set
    }

    pub fn name_of(h: windows::Win32::Foundation::HANDLE) -> String {
        let mut buf = [0u16; 520];
        let mut len = buf.len() as u32;
        if unsafe { QueryFullProcessImageNameW(h, PROCESS_NAME_WIN32, windows_core::PWSTR(buf.as_mut_ptr()), &mut len) }.is_ok() {
            let full = String::from_utf16_lossy(&buf[..len as usize]);
            full.rsplit(['\\', '/']).next().unwrap_or("").trim_end_matches(".exe").trim_end_matches(".EXE").to_string()
        } else {
            String::new()
        }
    }

    pub fn health() -> Health {
        let (cpu, ram) = load();
        let mut pids = vec![0u32; 4096];
        let mut got = 0u32;
        if unsafe { K32EnumProcesses(pids.as_mut_ptr(), (pids.len() * 4) as u32, &mut got) }.as_bool() {
            pids.truncate(got as usize / 4);
        } else {
            pids.clear();
        }
        let windows = with_windows();
        let cores = std::thread::available_parallelism().map(|n| n.get()).unwrap_or(1) as f64;
        let now = Instant::now();
        let mut times: HashMap<u32, u64> = HashMap::new();
        let prev = LAST_PROC.lock().take();
        let mut hogs = Vec::new();
        for pid in pids.into_iter().filter(|p| *p > 4) {
            let Ok(h) = (unsafe { OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid) }) else { continue };
            let name = name_of(h);
            let (mut c, mut e, mut k, mut u) = (FILETIME::default(), FILETIME::default(), FILETIME::default(), FILETIME::default());
            let used = if unsafe { GetProcessTimes(h, &mut c, &mut e, &mut k, &mut u) }.is_ok() { ticks(k) + ticks(u) } else { 0 };
            let mut pmc = PROCESS_MEMORY_COUNTERS { cb: std::mem::size_of::<PROCESS_MEMORY_COUNTERS>() as u32, ..Default::default() };
            let mem = if unsafe { K32GetProcessMemoryInfo(h, &mut pmc, pmc.cb) }.as_bool() { pmc.WorkingSetSize as u64 / (1024 * 1024) } else { 0 };
            unsafe {
                let _ = CloseHandle(h);
            }
            times.insert(pid, used);
            let cpu_pct = match &prev {
                Some((at, map)) => match map.get(&pid) {
                    Some(before) if used >= *before => {
                        let secs = now.duration_since(*at).as_secs_f64().max(0.1);
                        ((used - before) as f64 / 1e7 / secs / cores * 100.0) as f32
                    }
                    _ => 0.0,
                },
                None => 0.0,
            };
            if name.is_empty() || NEVER.contains(&name.to_lowercase().as_str()) {
                continue;
            }
            hogs.push(Hog { pid, name, cpu: cpu_pct.min(100.0), mem_mb: mem, window: windows.contains(&pid) });
        }
        *LAST_PROC.lock() = Some((now, times));
        // Group by app (Chrome is dozens of processes) for the heavy-app line.
        let mut by_app: HashMap<(String, bool), Hog> = HashMap::new();
        for h in &hogs {
            let key = (h.name.to_lowercase(), h.window);
            let e = by_app.entry(key).or_insert_with(|| Hog { cpu: 0.0, mem_mb: 0, ..h.clone() });
            e.cpu += h.cpu;
            e.mem_mb += h.mem_mb;
        }
        // An app's helper processes (Chrome's renderers) belong with its window.
        let windowed: HashSet<String> = by_app.keys().filter(|(_, w)| *w).map(|(n, _)| n.clone()).collect();
        let mut merged: HashMap<String, Hog> = HashMap::new();
        for ((name, window), h) in by_app {
            let key = if windowed.contains(&name) { format!("{name}|w") } else { format!("{name}|{window}") };
            let e = merged.entry(key).or_insert_with(|| Hog { cpu: 0.0, mem_mb: 0, window: window || windowed.contains(&name), ..h.clone() });
            e.cpu += h.cpu;
            e.mem_mb += h.mem_mb;
        }
        let mut list: Vec<Hog> = merged.into_values().collect();
        list.sort_by(|a, b| (b.cpu * 40.0 + b.mem_mb as f32).total_cmp(&(a.cpu * 40.0 + a.mem_mb as f32)));
        list.truncate(8);
        // Closing works on single processes: keep the real pids of helpers.
        for h in list.iter_mut().filter(|h| !h.window) {
            if let Some(p) = hogs.iter().filter(|x| x.name.eq_ignore_ascii_case(&h.name) && !x.window).max_by_key(|x| x.mem_mb) {
                h.pid = p.pid;
            }
        }
        Health { cpu, ram, ram_free_gb: free_gb(), lagging: super::is_lagging(&super::SAMPLES.lock()), hogs: list }
    }

    /// End one background helper.
    pub fn close(pid: u32) -> bool {
        let Ok(h) = (unsafe { OpenProcess(PROCESS_TERMINATE, false, pid) }) else { return false };
        let ok = unsafe { TerminateProcess(h, 0) }.is_ok();
        unsafe {
            let _ = CloseHandle(h);
        }
        ok
    }
}

#[cfg(not(windows))]
mod sys {
    use super::Health;
    pub fn load() -> (u8, u8) {
        (0, 0)
    }
    pub fn health() -> Health {
        Health::default()
    }
    pub fn close(_pid: u32) -> bool {
        false
    }
    pub fn windowed() -> std::collections::HashSet<u32> {
        Default::default()
    }
    pub fn health_all_names() -> Vec<String> {
        vec![]
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn notices_a_struggling_pc_only_when_it_lasts() {
        assert!(!is_lagging(&[(95, 50); 5]));
        assert!(is_lagging(&[(95, 50); 6]));
        assert!(!is_lagging(&[(95, 50), (95, 50), (40, 50), (95, 50), (95, 50), (95, 50)]));
        assert!(is_lagging(&[(10, 95); 3]));
        assert!(!is_lagging(&[(10, 80); 10]));
    }

    #[test]
    fn hears_the_request_and_never_closes_the_wrong_thing() {
        for s in ["Hey Nova, speed up my PC", "my laptop is lagging!", "why is my computer slow", "free up some memory"] {
            assert!(is_request(s), "{s}");
        }
        assert!(!is_request("open chrome"));
        assert!(safe_helper("GoogleUpdate"));
        assert!(safe_helper("AdobeARM"));
        assert!(safe_helper("chrome_crashpad_handler"));
        for n in ["svchost", "explorer", "MsMpEng", "izuki", "chrome", "Spotify", "msedgewebview2", "TiWorker"] {
            assert!(!safe_helper(n), "{n}");
        }
    }

    /// The real PC, read twice (the processor needs two looks):
    /// `cargo test boost::tests::live -- --ignored --nocapture`.
    #[test]
    #[ignore]
    fn live() {
        let _ = health();
        std::thread::sleep(Duration::from_millis(800));
        let h = health();
        eprintln!("cpu {}% ram {}% free {:.1} GB", h.cpu, h.ram, h.ram_free_gb);
        for x in &h.hogs {
            eprintln!("  {:<28} {:>6.1}% {:>6} MB window={}", x.name, x.cpu, x.mem_mb, x.window);
        }
        assert!(h.ram > 0);
    }

    #[test]
    fn says_what_it_did_plainly() {
        let h = Health { cpu: 92, ram: 81, ..Default::default() };
        let chrome = Hog { pid: 1, name: "chrome".into(), cpu: 30.0, mem_mb: 2150, window: true };
        let s = summary(1300, &["GoogleUpdate".into()], Some(&chrome), &h);
        assert!(s.starts_with("Done — I cleared 1.3 GB of old temp files and closed 1 background helper (GoogleUpdate)."), "{s}");
        assert!(s.contains("Chrome (2.1 GB of memory, 30% of the processor)"), "{s}");
        let none = summary(0, &[], None, &h);
        assert!(none.starts_with("Nothing to clear right now") && none.contains("processor 92%"), "{none}");
        assert_eq!(pretty("msedge.exe"), "Edge");
        assert_eq!(pretty("spotify"), "Spotify");
    }
}
