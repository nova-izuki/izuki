//! Smart Care: what's actually slowing the PC down, found before anything is
//! "fixed".
//!
//! PC Care used to answer "my PC is slow" by cleaning: temp files, caches,
//! memory. On the user's laptop the real causes were a C: drive 96% full,
//! Chrome holding 9.8 GB, and a Rust build using a quarter of the processor —
//! none of which a cleanup touches — and part of the cleanup (deleting the
//! graphics shader caches) made Chrome and games stutter while they rebuilt
//! them. So this looks first: the disk, memory, the processor over the last
//! minute (a spike isn't a slowdown), which apps are behind each, whether
//! that's real work (a build, a test run), and Izuki's own share. Each cause
//! comes with why it slows things and the fix that would help, marked by
//! risk. Nothing here changes anything; Auto Care (boost.rs) acts, only on
//! the safe fixes, only for the cause that's there.

use serde::Serialize;

/// How bad a cause is.
#[derive(Debug, Clone, Copy, Serialize, PartialEq, Eq, PartialOrd, Ord)]
#[serde(rename_all = "lowercase")]
pub enum Level {
    /// Worth knowing, nothing to do.
    Info,
    /// Slowing things a little, or will soon.
    Warn,
    /// What's slowing the PC now.
    Bad,
}

/// What a fix does to the PC.
#[derive(Debug, Clone, Copy, Serialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Risk {
    /// Only looks, or opens a settings page: changes nothing by itself.
    Look,
    /// Changes something that undoes itself (a helper that restarts when
    /// needed). Auto Care may do it.
    Safe,
    /// Deletes or turns something off: only when the person presses it.
    Ask,
}

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Fix {
    pub label: String,
    /// What the button runs (smartcare::fix).
    pub op: String,
    pub risk: Risk,
}

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Cause {
    /// "disk", "memory", "cpu", "browser", "work", "izuki", "spike", "fine".
    pub key: String,
    pub level: Level,
    pub title: String,
    pub why: String,
    pub fix: Option<Fix>,
}

/// One app, all its processes together.
#[derive(Debug, Clone, Serialize, PartialEq, Default)]
pub struct App {
    pub name: String,
    /// Share of the whole processor, 0–100.
    pub cpu: f32,
    pub mem_mb: u64,
    pub window: bool,
}

/// The readings a diagnosis is made from.
#[derive(Debug, Clone, Serialize, PartialEq, Default)]
pub struct Readings {
    pub cpu_now: u8,
    /// Over the last minute (the 5-second looks PC Care already takes).
    pub cpu_minute: u8,
    /// How many of those looks were 85% or more.
    pub cpu_busy_looks: usize,
    pub looks: usize,
    pub ram: u8,
    pub ram_free_gb: f32,
    /// The system drive.
    pub drive: String,
    pub disk_free_gb: f64,
    pub disk_total_gb: f64,
    /// The heaviest apps, grouped.
    pub apps: Vec<App>,
    /// Izuki itself.
    pub izuki_cpu: f32,
    pub izuki_mem_mb: u64,
}

#[derive(Debug, Clone, Serialize)]
pub struct Report {
    pub readings: Readings,
    /// Worst first.
    pub causes: Vec<Cause>,
}

const BROWSERS: &[&str] = &["chrome", "msedge", "brave", "firefox", "opera", "vivaldi", "comet", "arc", "librewolf", "waterfox"];

/// Programs doing real work for the person: a build, a test run, a coding
/// assistant. Their load is the work, not a problem to clean up.
const WORK: &[&str] = &[
    "rustc", "cargo", "link", "cl", "msbuild", "devenv", "node", "bun", "deno", "python", "pythonw", "java", "gradle", "dotnet",
    "code", "cursor", "claude", "freebuff", "codebuff", "codex", "git", "tsc", "esbuild", "go", "clang", "gcc", "cmake", "ninja",
    "makensis", "pwsh", "blender", "obs64", "ffmpeg", "handbrake", "premiere", "afterfx", "resolve", "fl64", "fl",
];

pub fn is_browser(name: &str) -> bool {
    BROWSERS.contains(&name.trim_end_matches(".exe").to_lowercase().as_str())
}

pub fn is_work(name: &str) -> bool {
    WORK.contains(&name.trim_end_matches(".exe").to_lowercase().as_str())
}

/// What the person would call it.
fn named(app: &App) -> String {
    match app.name.trim_end_matches(".exe").to_lowercase().as_str() {
        "rustc" | "cargo" => "the Rust compiler".into(),
        "node" => "Node.js".into(),
        "bun" => "Bun".into(),
        "claude" => "Claude Code".into(),
        "freebuff" | "codebuff" => "Freebuff".into(),
        "brave" => "Brave".into(),
        "comet" => "Comet".into(),
        _ => crate::boost::pretty(&app.name),
    }
}

fn gb(mb: u64) -> String {
    if mb >= 1024 { format!("{:.1} GB", mb as f64 / 1024.0) } else { format!("{mb} MB") }
}

/// The browser's own memory setting, where it has one.
fn memory_saver(browser: &str) -> Option<Fix> {
    let b = browser.trim_end_matches(".exe").to_lowercase();
    let label = match b.as_str() {
        "chrome" | "brave" => "Turn on Memory Saver",
        "msedge" => "Turn on sleeping tabs",
        _ => return None,
    };
    Some(Fix { label: label.into(), op: format!("memory_saver:{b}"), risk: Risk::Look })
}

/// The causes, worst first. Pure: the same readings always give the same
/// answer, so it's tested on the user's real numbers.
pub fn diagnose(r: &Readings) -> Vec<Cause> {
    let mut out = Vec::new();

    // The disk. Under ~10% free, Windows has nowhere to put memory it pages
    // out or updates it downloads, and everything waits on the drive.
    if r.disk_total_gb > 1.0 {
        let share = r.disk_free_gb / r.disk_total_gb;
        let level = if r.disk_free_gb < 10.0 || share < 0.05 { Some(Level::Bad) } else if share < 0.10 { Some(Level::Warn) } else { None };
        if let Some(level) = level {
            out.push(Cause {
                key: "disk".into(),
                level,
                title: format!("{} is {:.0}% full: {:.0} GB free of {:.0} GB", r.drive, (1.0 - share) * 100.0, r.disk_free_gb, r.disk_total_gb),
                why: "Windows uses free space for the memory it pages out and for updates. When a drive is this full, apps wait on it and feel slow, whatever the processor is doing.".into(),
                fix: Some(Fix { label: "See what's using the space".into(), op: "storage_report".into(), risk: Risk::Look }),
            });
        }
    }

    let heaviest_mem = r.apps.iter().max_by_key(|a| a.mem_mb);
    let busy: Vec<&App> = {
        let mut v: Vec<&App> = r.apps.iter().filter(|a| a.cpu >= 8.0).collect();
        v.sort_by(|a, b| b.cpu.total_cmp(&a.cpu));
        v
    };

    // Memory.
    if r.ram >= 75 {
        let level = if r.ram >= 88 { Level::Bad } else { Level::Warn };
        let top: Vec<&App> = {
            let mut v: Vec<&App> = r.apps.iter().filter(|a| a.mem_mb >= 600).collect();
            v.sort_by(|a, b| b.mem_mb.cmp(&a.mem_mb));
            v.truncate(3);
            v
        };
        let who = if top.is_empty() { String::new() } else { format!(" Most of it: {}.", top.iter().map(|a| format!("{} ({})", named(a), gb(a.mem_mb))).collect::<Vec<_>>().join(", ")) };
        let fix = heaviest_mem.filter(|a| is_browser(&a.name)).and_then(|a| memory_saver(&a.name));
        out.push(Cause {
            key: "memory".into(),
            level,
            title: format!("Memory is {}% used ({:.1} GB free)", r.ram, r.ram_free_gb),
            why: format!("When memory runs short, Windows moves parts of apps to the drive and back, and switching between them stalls.{who}"),
            fix,
        });
    }

    // A browser holding a lot, even when memory isn't short yet.
    if let Some(b) = r.apps.iter().filter(|a| is_browser(&a.name)).max_by_key(|a| a.mem_mb) {
        if b.mem_mb >= 3 * 1024 && r.ram < 75 {
            out.push(Cause {
                key: "browser".into(),
                level: Level::Warn,
                title: format!("{} is holding {}", named(b), gb(b.mem_mb)),
                why: format!("Every open tab keeps running in the background. {} can put tabs you aren't using to sleep and wake them when you click them.", named(b)),
                fix: memory_saver(&b.name),
            });
        }
    }

    // The processor: only a real slowdown if it lasted.
    let sustained = r.looks >= 6 && (r.cpu_minute >= 80 || r.cpu_busy_looks * 2 >= r.looks);
    if sustained {
        let work: Vec<&&App> = busy.iter().filter(|a| is_work(&a.name)).collect();
        let lead = busy.first();
        match lead {
            Some(a) if is_work(&a.name) => out.push(Cause {
                key: "work".into(),
                level: Level::Info,
                title: format!("{} is working hard ({:.0}% of the processor)", named(a), a.cpu),
                why: "That's real work, like a build or a test run, not something to clean up. The PC eases when it finishes; nothing is stopped.".into(),
                fix: None,
            }),
            Some(a) if is_browser(&a.name) => out.push(Cause {
                key: "cpu".into(),
                level: Level::Bad,
                title: format!("{}'s tabs are using {:.0}% of the processor", named(a), a.cpu),
                why: format!("A busy page (video, a web app, ads) keeps the processor going. In {} press Shift+Esc to see which tab it is.", named(a)),
                fix: memory_saver(&a.name),
            }),
            // (Named only with a real share: a 9% app isn't what's slowing it.)
            Some(a) if a.cpu >= 15.0 => out.push(Cause {
                key: "cpu".into(),
                level: Level::Bad,
                title: format!("The processor has been {}% busy for the last minute: {} is using {:.0}%", r.cpu_minute, named(a), a.cpu),
                why: if a.window { format!("{} is open and busy. If you aren't using it, closing it frees the processor.", named(a)) } else { format!("{} runs in the background.", named(a)) },
                fix: crate::boost::safe_helper_name(&a.name).then(|| Fix { label: format!("Close {}", named(a)), op: format!("close_helper:{}", a.name), risk: Risk::Safe }),
            }),
            _ => out.push(Cause {
                key: "cpu".into(),
                level: Level::Bad,
                title: format!("The processor has been {}% busy for the last minute", r.cpu_minute),
                why: "No single app stands out: it's spread across many, or Windows itself (updates, indexing, a scan).".into(),
                fix: None,
            }),
        }
        // The rest of the work going on (not the lead again, when it's work).
        let others: Vec<String> = work
            .iter()
            .filter(|a| lead.is_none_or(|l| !(is_work(&l.name) && l.name == a.name)))
            .map(|a| format!("{} ({:.0}%)", named(a), a.cpu))
            .collect();
        if !others.is_empty() {
            out.push(Cause { key: "work".into(), level: Level::Info, title: format!("Also working: {}", others.join(", ")), why: "Real work, left alone.".into(), fix: None });
        }
    } else if r.cpu_now >= 85 && r.looks < 6 {
        // Just started watching: one look can't tell a spike from a slowdown.
        out.push(Cause {
            key: "unsure".into(),
            level: Level::Info,
            title: format!("The processor is {}% busy right now", r.cpu_now),
            why: "Smart Care has only just started watching, so it can't tell yet whether that's a short spike or a slowdown. Ask again in a minute.".into(),
            fix: None,
        });
    } else if r.cpu_now >= 85 {
        out.push(Cause {
            key: "spike".into(),
            level: Level::Info,
            title: format!("A short spike ({}% right now)", r.cpu_now),
            why: format!("Over the last minute it averaged {}%, so this isn't what's making the PC slow.", r.cpu_minute),
            fix: None,
        });
    }

    // Izuki's own share, said plainly.
    if r.izuki_cpu >= 10.0 || r.izuki_mem_mb >= 1500 {
        out.push(Cause {
            key: "izuki".into(),
            level: Level::Warn,
            title: format!("Izuki itself is using {:.0}% of the processor and {}", r.izuki_cpu, gb(r.izuki_mem_mb)),
            why: "Air control, the character and the on-device voice cost the most. Turning off the ones you don't use frees it.".into(),
            fix: None,
        });
    }

    // ("Nothing is slowing it" next to "a build is working hard" would
    // contradict itself: the build line says it all.)
    if !out.iter().any(|c| c.level >= Level::Warn || c.key == "work") {
        // One look is all there is just after starting: said as such.
        let (title, cpu) = if r.looks < 6 {
            ("Nothing stands out right now", format!("Processor {}% right now (Smart Care has only just started watching)", r.cpu_now))
        } else {
            ("Nothing is slowing the PC down right now", format!("Processor {}% over the last minute", r.cpu_minute))
        };
        out.push(Cause {
            key: "fine".into(),
            level: Level::Info,
            title: title.into(),
            why: format!("{cpu}, memory {}% used, {:.0} GB free on {}.", r.ram, r.disk_free_gb, r.drive),
            fix: None,
        });
    }
    out.sort_by(|a, b| b.level.cmp(&a.level));
    out
}

/// The answer to "why is my PC slow?", in a few sentences.
pub fn explain(causes: &[Cause]) -> String {
    let main: Vec<&Cause> = causes.iter().filter(|c| c.level >= Level::Warn).collect();
    if main.is_empty() {
        return causes.iter().map(|c| format!("{}. {}", c.title, c.why)).collect::<Vec<_>>().join(" ");
    }
    let mut s = String::new();
    for (i, c) in main.iter().take(3).enumerate() {
        s.push_str(if i == 0 { "Here's what's slowing it down: " } else { " Also: " });
        s.push_str(&format!("{}. {}", c.title, c.why));
        if let Some(f) = &c.fix {
            s.push_str(&format!(" In Settings → PC Care, tap “{}”.", f.label));
        }
    }
    if let Some(w) = causes.iter().find(|c| c.key == "work") {
        s.push_str(&format!(" {}: real work, left alone.", w.title));
    }
    s
}

/// The real readings now. Takes about a second and a half (the processor
/// needs two looks), and only reads: nothing is enumerated on a timer here.
pub fn now() -> Report {
    // First looks, so the second can say how busy each was in between.
    let _ = crate::boost::health();
    let _ = crate::boost::own_usage();
    std::thread::sleep(std::time::Duration::from_millis(1500));
    let h = crate::boost::health();
    let samples = crate::boost::recent_samples();
    let looks = samples.len();
    let cpu_minute = if looks == 0 { h.cpu } else { (samples.iter().map(|(c, _)| *c as u32).sum::<u32>() / looks as u32) as u8 };
    let cpu_busy_looks = samples.iter().filter(|(c, _)| *c >= 85).count();
    let system = std::env::var("SystemDrive").unwrap_or_else(|_| "C:".into());
    let (drive, free, total) = crate::storage::drives()
        .into_iter()
        .find(|(d, _, _)| d.trim_end_matches('\\').eq_ignore_ascii_case(system.trim_end_matches('\\')))
        .unwrap_or((system, 0.0, 0.0));
    let (izuki_cpu, izuki_mem_mb) = crate::boost::own_usage();
    let readings = Readings {
        cpu_now: h.cpu,
        cpu_minute,
        cpu_busy_looks,
        looks,
        ram: h.ram,
        ram_free_gb: h.ram_free_gb,
        drive,
        disk_free_gb: free,
        disk_total_gb: total,
        apps: h.hogs.iter().map(|x| App { name: x.name.clone(), cpu: x.cpu, mem_mb: x.mem_mb, window: x.window }).collect(),
        izuki_cpu,
        izuki_mem_mb,
    };
    let causes = diagnose(&readings);
    Report { readings, causes }
}

/// "Why is my PC slow?", "what's slowing my laptop?" — a question, answered
/// with the diagnosis. ("Speed up my PC" is a request: boost.rs.)
pub fn is_question(said: &str) -> bool {
    // (Speech-to-text writes "what’s" with a curly apostrophe.)
    let t = said.to_lowercase().replace('\u{2019}', "'");
    let t = t.trim().trim_start_matches("hey nova").trim_matches(|c: char| !c.is_alphanumeric() && c != ' ' && c != '\'').trim();
    let words: Vec<&str> = t.split(|c: char| !c.is_alphanumeric() && c != '\'').filter(|w| !w.is_empty()).collect();
    // A whole word, and the machine itself: "computer science", "my laptop bag" aren't.
    const MACHINE: &[&str] = &["pc", "pcs", "computer", "laptop", "machine"];
    const NOT_IT: &[&str] = &["science", "class", "course", "lab", "labs", "program", "bag", "case", "stand", "screen"];
    let machine = words.windows(2).any(|w| MACHINE.contains(&w[0]) && !NOT_IT.contains(&w[1])) || words.last().is_some_and(|w| MACHINE.contains(w));
    let symptom = words.iter().any(|w| ["hot", "fan", "fans", "using", "check"].contains(w) || ["slow", "lag", "freez", "struggl", "diagnos"].iter().any(|p| w.starts_with(p)));
    machine
        && [
            "why is my", "why's my", "whys my", "what's slowing", "whats slowing", "what is slowing", "what's making my",
            "whats making my", "what is making my", "why does my", "is my pc slow", "is my computer slow", "is my laptop slow",
            "why so slow", "why is it so slow", "what's using my", "whats using my", "what is using my", "check my pc",
            "check my computer", "check my laptop", "diagnose",
        ]
        .iter()
        .any(|p| t.contains(p))
        && symptom
}

/// A Safe fix, done by Auto Care: what it changed, or None when it changed
/// nothing (then nothing is said or checked).
pub fn fix_done(op: &str) -> Option<String> {
    let name = op.strip_prefix("close_helper:")?;
    let closed = crate::boost::close_named(name);
    (!closed.is_empty()).then(|| format!("Closed {} (it starts again by itself when it's needed).", closed.join(", ")))
}

/// A fix the person pressed (or Auto Care chose, for Risk::Safe ones only).
pub fn fix(op: &str) -> String {
    if op == "storage_report" {
        return crate::storage::report();
    }
    if op.starts_with("close_helper:") {
        return fix_done(op).unwrap_or_else(|| "Nothing to close: it isn't running any more.".into());
    }
    if let Some(browser) = op.strip_prefix("memory_saver:") {
        return open_memory_saver(browser);
    }
    "I don't know that fix.".into()
}

/// The browser's performance settings, opened for the person to switch on.
fn open_memory_saver(browser: &str) -> String {
    let (exe, page, what) = match browser {
        "chrome" => ("chrome", "chrome://settings/performance", "Chrome's Performance settings: turn on Memory Saver"),
        "brave" => ("brave", "brave://settings/performance", "Brave's Performance settings: turn on Memory Saver"),
        "msedge" => ("msedge", "edge://settings/system", "Edge's System and performance settings: turn on sleeping tabs and efficiency mode"),
        _ => return "That browser has no memory setting I can open.".into(),
    };
    let mut cmd = std::process::Command::new("cmd");
    cmd.args(["/C", "start", "", exe, page]);
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        // No console window flashing up for the moment `start` runs.
        cmd.creation_flags(0x0800_0000);
    }
    match cmd.spawn() {
        Ok(_) => format!("Asked Windows to open {what}."),
        Err(_) => format!("Open {page} in {} and turn it on there.", crate::boost::pretty(exe)),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn app(name: &str, cpu: f32, mem_mb: u64, window: bool) -> App {
        App { name: name.into(), cpu, mem_mb, window }
    }

    /// The user's laptop on 1 November, as measured: C: 96% full, Chrome at
    /// 34% of the processor and 9.8 GB earlier, a Rust build at 26%.
    fn the_users_laptop() -> Readings {
        Readings {
            cpu_now: 71,
            cpu_minute: 82,
            cpu_busy_looks: 7,
            looks: 12,
            ram: 63,
            ram_free_gb: 5.9,
            drive: "C:".into(),
            disk_free_gb: 20.1,
            disk_total_gb: 568.0,
            apps: vec![app("rustc", 26.4, 1509, false), app("chrome", 33.6, 4300, true), app("Freebuff", 2.5, 333, true), app("bun", 2.8, 156, false)],
            izuki_cpu: 3.0,
            izuki_mem_mb: 420,
        }
    }

    #[test]
    fn finds_the_real_causes_on_the_users_laptop() {
        let causes = diagnose(&the_users_laptop());
        let keys: Vec<&str> = causes.iter().map(|c| c.key.as_str()).collect();
        assert_eq!(causes[0].key, "disk", "the full drive comes first: {keys:?}");
        assert_eq!(causes[0].level, Level::Bad);
        assert!(causes[0].title.contains("96% full"), "{}", causes[0].title);
        assert_eq!(causes[0].fix.as_ref().map(|f| f.risk), Some(Risk::Look), "looking at what uses space changes nothing");
        let cpu = causes.iter().find(|c| c.key == "cpu").expect("Chrome's busy tabs are a cause");
        assert!(cpu.title.starts_with("Chrome's tabs"), "{}", cpu.title);
        assert_eq!(cpu.fix.as_ref().map(|f| f.op.as_str()), Some("memory_saver:chrome"));
        let browser = causes.iter().find(|c| c.key == "browser").expect("4.2 GB in Chrome is worth knowing");
        assert!(browser.title.contains("4.2 GB"), "{}", browser.title);
        let work = causes.iter().find(|c| c.key == "work").expect("the build is named as work");
        assert!(work.title.contains("the Rust compiler"), "{}", work.title);
        assert_eq!(work.level, Level::Info, "a build is never something to clean up");
        assert!(work.fix.is_none(), "and nothing offers to stop it");
        assert!(!keys.contains(&"izuki"), "Izuki's 3% isn't a cause");
        assert!(!keys.contains(&"fine"));
    }

    #[test]
    fn a_build_leading_the_processor_is_work_not_a_problem() {
        let mut r = the_users_laptop();
        r.apps = vec![app("rustc", 70.0, 2000, false), app("chrome", 5.0, 1200, true)];
        r.disk_free_gb = 200.0;
        let causes = diagnose(&r);
        assert!(causes.iter().all(|c| c.fix.as_ref().is_none_or(|f| !f.op.starts_with("close_helper"))), "never offers to close a build");
        let work = causes.iter().find(|c| c.key == "work").unwrap();
        assert!(work.title.contains("70%") && work.why.contains("nothing is stopped"), "{work:?}");
        assert!(!causes.iter().any(|c| c.key == "cpu"), "the build's load isn't reported as a problem: {causes:?}");
        assert!(!causes.iter().any(|c| c.key == "fine"), "and not as 'nothing is slowing it' beside it: {causes:?}");
    }

    #[test]
    fn a_spike_is_not_a_slowdown_and_a_quiet_pc_says_so() {
        let mut r = Readings { cpu_now: 97, cpu_minute: 22, cpu_busy_looks: 1, looks: 12, ram: 41, ram_free_gb: 9.0, drive: "C:".into(), disk_free_gb: 300.0, disk_total_gb: 512.0, ..Default::default() };
        let causes = diagnose(&r);
        assert!(causes.iter().any(|c| c.key == "spike"), "{causes:?}");
        assert!(causes.iter().any(|c| c.key == "fine"), "{causes:?}");
        assert!(!causes.iter().any(|c| c.key == "cpu"));
        r.cpu_now = 10;
        let calm = diagnose(&r);
        assert_eq!(calm.len(), 1);
        assert!(calm[0].title.starts_with("Nothing is slowing"));
        // Too few looks to judge (Izuki just started): no slowdown claimed.
        let fresh = Readings { cpu_now: 95, cpu_minute: 95, cpu_busy_looks: 2, looks: 2, ram: 40, drive: "C:".into(), disk_free_gb: 300.0, disk_total_gb: 512.0, ..Default::default() };
        let fresh_causes = diagnose(&fresh);
        assert!(!fresh_causes.iter().any(|c| c.key == "cpu" || c.key == "spike"), "{fresh_causes:?}");
        assert!(fresh_causes.iter().any(|c| c.key == "unsure"), "it says it can't tell yet: {fresh_causes:?}");
    }

    #[test]
    fn memory_pressure_names_who_and_the_browsers_own_fix() {
        let r = Readings {
            looks: 12, ram: 91, ram_free_gb: 0.7, drive: "C:".into(), disk_free_gb: 200.0, disk_total_gb: 512.0,
            apps: vec![app("chrome", 4.0, 9800, true), app("Teams", 1.0, 1300, true)], ..Default::default()
        };
        let causes = diagnose(&r);
        let m = &causes[0];
        assert_eq!((m.key.as_str(), m.level), ("memory", Level::Bad));
        assert!(m.why.contains("Chrome (9.6 GB)") && m.why.contains("Teams (1.3 GB)"), "{}", m.why);
        assert_eq!(m.fix.as_ref().map(|f| (f.op.as_str(), f.risk)), Some(("memory_saver:chrome", Risk::Look)));
        assert!(!causes.iter().any(|c| c.key == "browser"), "said once, under memory");
    }

    #[test]
    fn izuki_owns_up_to_its_own_load() {
        let mut r = Readings { looks: 12, ram: 50, drive: "C:".into(), disk_free_gb: 200.0, disk_total_gb: 512.0, izuki_cpu: 14.0, izuki_mem_mb: 900, ..Default::default() };
        assert!(diagnose(&r).iter().any(|c| c.key == "izuki" && c.title.contains("14%")));
        r.izuki_cpu = 2.0;
        assert!(!diagnose(&r).iter().any(|c| c.key == "izuki"));
    }

    #[test]
    fn a_small_share_is_never_named_as_the_cause() {
        let r = Readings { cpu_minute: 90, cpu_busy_looks: 10, looks: 12, ram: 40, drive: "C:".into(), disk_free_gb: 300.0, disk_total_gb: 512.0, apps: vec![app("Spotify", 9.0, 300, true)], ..Default::default() };
        let cpu = diagnose(&r).into_iter().find(|c| c.key == "cpu").unwrap();
        assert!(!cpu.title.contains("Spotify"), "{}", cpu.title);
        // A build leading, a second one behind it: each named once.
        let r = Readings { apps: vec![app("rustc", 60.0, 900, false), app("node", 20.0, 400, false)], ..r };
        let titles: Vec<String> = diagnose(&r).into_iter().map(|c| c.title).collect();
        assert_eq!(titles.iter().filter(|t| t.contains("the Rust compiler")).count(), 1, "{titles:?}");
        assert!(titles.iter().any(|t| t == "Also working: Node.js (20%)"), "{titles:?}");
    }

    #[test]
    fn says_it_like_a_person() {
        let s = explain(&diagnose(&the_users_laptop()));
        assert!(s.starts_with("Here's what's slowing it down: C: is 96% full"), "{s}");
        assert!(s.contains("the Rust compiler") && s.contains("left alone"), "{s}");
    }

    #[test]
    fn hears_a_question_not_a_request() {
        for q in ["why is my PC so slow?", "Hey Nova, what's slowing my laptop down", "why does my computer lag", "is my pc slow", "check my PC", "what's using my computer"] {
            assert!(is_question(q), "{q}");
        }
        for q in ["speed up my pc", "why is the sky blue", "my pc is slow", "check my email", "what's slowing the download", "why is my computer science class so slow", "why is my laptop bag so heavy"] {
            assert!(!is_question(q), "{q}");
        }
    }

    #[test]
    fn knows_work_and_browsers() {
        for w in ["rustc", "cargo.exe", "node", "bun", "Code", "claude", "Freebuff", "git"] {
            assert!(is_work(w), "{w}");
        }
        for b in ["chrome", "msedge.exe", "Brave", "firefox", "Comet"] {
            assert!(is_browser(b), "{b}");
        }
        assert!(!is_work("chrome") && !is_browser("rustc"));
    }
}
