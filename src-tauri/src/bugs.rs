//! Izuki's bug catcher.
//!
//! Every line Izuki writes about what it's doing — the `eprintln!`s all over
//! the app, the webviews' errors, the phone call page's — lands in a log
//! file with the time on it: `%APPDATA%\Izuki\logs\izuki.log`. Before this
//! they only went to a console the installed app doesn't have, so nothing
//! about a failure survived to be looked at.
//!
//! Anything that went wrong — a crash, an error in a window, a `[bug]` line
//! from the code — is also reported to Izuki's error tracker, together with
//! the log lines just before it, so a bug can be seen and fixed without the
//! user having to describe it. Reports go where
//! `https://nova-izuki.github.io/izuki/bugs.json` points (a Sentry project),
//! only while "Send error reports" is on, and always with API keys, links'
//! secrets, emails, phone numbers and the Windows user name taken out first.
//!
//! To report something from the code: `eprintln!("[bug] what went wrong")`.

use std::collections::VecDeque;
use std::io::{BufRead, Write};
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::{Duration, Instant};

use parking_lot::Mutex;
use serde_json::{json, Value};

/// Where the error tracker's address is kept — one place for the PC app, the
/// phone app and the website, changeable without a new release.
const CONFIG_URL: &str = "https://nova-izuki.github.io/izuki/bugs.json";
/// The log file is started afresh (the old one kept as `izuki.old.log`) past this.
const MAX_LOG_BYTES: u64 = 4 * 1024 * 1024;
/// Lines kept in memory to go with a report.
const RECENT_LINES: usize = 200;
/// Lines sent with a report.
const LINES_PER_REPORT: usize = 80;
/// Most reports sent in an hour, so a bug in a loop can't flood anything.
const MAX_PER_HOUR: usize = 20;

static ENABLED: AtomicBool = AtomicBool::new(true);
static RECENT: Mutex<VecDeque<String>> = Mutex::new(VecDeque::new());
static TRACKER: Mutex<Option<Tracker>> = Mutex::new(None);
/// Izuki's own backend (e.g. a Floot app), if bugs.json names one: each report
/// is also POSTed there as plain JSON.
static ENDPOINT: Mutex<Option<String>> = Mutex::new(None);
/// What was reported lately (its fingerprint, and when), for de-duplicating.
static SENT: Mutex<Vec<(String, Instant)>> = Mutex::new(Vec::new());

#[derive(Clone, Debug, PartialEq, Eq)]
struct Tracker {
    dsn: String,
    /// `https://host/api/<project>/envelope/`
    endpoint: String,
    key: String,
}

pub fn log_dir() -> PathBuf {
    crate::store::data_dir().join("logs")
}

pub fn log_path() -> PathBuf {
    log_dir().join("izuki.log")
}

/// Start catching: everything written to stderr goes to the log file, and
/// crashes are recorded and reported. Call once, first thing.
pub fn start() {
    let _ = std::fs::create_dir_all(log_dir());
    rotate();
    capture_stderr();
    install_panic_hook();
    std::thread::Builder::new().name("izuki-bug-config".into()).spawn(load_tracker).ok();
}

/// "Send error reports" on or off (settings).
pub fn set_enabled(on: bool) {
    ENABLED.store(on, Ordering::SeqCst);
}

fn rotate() {
    let path = log_path();
    if std::fs::metadata(&path).map(|m| m.len() > MAX_LOG_BYTES).unwrap_or(false) {
        let _ = std::fs::rename(&path, log_dir().join("izuki.old.log"));
    }
}

fn open_log() -> Option<std::fs::File> {
    std::fs::OpenOptions::new().create(true).append(true).open(log_path()).ok()
}

fn now_stamp() -> String {
    chrono::Local::now().format("%Y-%m-%d %H:%M:%S%.3f").to_string()
}

/// Point this process's stderr at a pipe, and copy every line that comes
/// through it into the log (and to the old console too, when running from a
/// terminal). `eprintln!` looks the handle up on every write, so this catches
/// every line from then on.
#[cfg(windows)]
fn capture_stderr() {
    use std::os::windows::io::IntoRawHandle;
    extern "system" {
        fn GetStdHandle(which: u32) -> *mut core::ffi::c_void;
        fn SetStdHandle(which: u32, handle: *mut core::ffi::c_void) -> i32;
    }
    const STD_ERROR_HANDLE: u32 = -12i32 as u32;

    let Ok((reader, writer)) = std::io::pipe() else { return };
    let console = unsafe { GetStdHandle(STD_ERROR_HANDLE) } as usize;
    // Reader first: once stderr is the pipe, a pipe nobody empties would
    // block every eprintln! in the app.
    let pump = std::thread::Builder::new().name("izuki-log".into()).spawn(move || pump(reader, console));
    if pump.is_err() {
        return;
    }
    let handle = writer.into_raw_handle();
    unsafe {
        SetStdHandle(STD_ERROR_HANDLE, handle.cast());
    }
}

#[cfg(not(windows))]
fn capture_stderr() {}

/// Read lines from the pipe for as long as the app runs. Nothing in here may
/// stop the loop: if it did, the next eprintln! anywhere would hang the app.
fn pump(reader: std::io::PipeReader, console: usize) {
    let mut console = open_console(console);
    let mut file = open_log();
    let mut reader = std::io::BufReader::new(reader);
    let mut buf = Vec::new();
    let mut since_check = 0u32;
    loop {
        buf.clear();
        match reader.read_until(b'\n', &mut buf) {
            Ok(0) => break,
            Ok(_) => {}
            Err(_) => continue,
        }
        let _ = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            let line = String::from_utf8_lossy(&buf);
            let line = line.trim_end_matches(['\r', '\n']);
            if let Some(c) = console.as_mut() {
                let _ = writeln!(c, "{line}");
            }
            let stamped = format!("{} {line}", now_stamp());
            if let Some(f) = file.as_mut() {
                let _ = writeln!(f, "{stamped}");
            }
            remember(&stamped);
            if let Some(kind) = worth_reporting(line) {
                report(kind, line, "error");
            }
            since_check += 1;
            if since_check >= 500 {
                since_check = 0;
                if std::fs::metadata(log_path()).map(|m| m.len() > MAX_LOG_BYTES).unwrap_or(false) {
                    drop(file.take());
                    rotate();
                    file = open_log();
                }
            }
        }));
    }
}

/// The terminal `tauri dev` runs in, if any — lines still show there too.
#[cfg(windows)]
fn open_console(handle: usize) -> Option<std::mem::ManuallyDrop<std::fs::File>> {
    use std::os::windows::io::FromRawHandle;
    // 0 = no console (the installed app); -1 = INVALID_HANDLE_VALUE.
    if handle == 0 || handle == usize::MAX {
        return None;
    }
    // Borrowed, never closed: it belongs to the process.
    Some(std::mem::ManuallyDrop::new(unsafe { std::fs::File::from_raw_handle(handle as *mut core::ffi::c_void) }))
}

fn remember(line: &str) {
    let mut recent = RECENT.lock();
    if recent.len() >= RECENT_LINES {
        recent.pop_front();
    }
    recent.push_back(line.to_string());
}

/// Which log lines mean something went wrong.
fn worth_reporting(line: &str) -> Option<&'static str> {
    if line.contains("[bug]") {
        Some("bug")
    } else if line.starts_with("[webview] [error]") {
        Some("window")
    } else {
        None
    }
}

fn install_panic_hook() {
    let default = std::panic::take_hook();
    std::panic::set_hook(Box::new(move |info| {
        let place = info.location().map(|l| format!(" at {}:{}", l.file(), l.line())).unwrap_or_default();
        let what = info
            .payload()
            .downcast_ref::<&str>()
            .map(|s| s.to_string())
            .or_else(|| info.payload().downcast_ref::<String>().cloned())
            .unwrap_or_else(|| "a crash".into());
        let thread = std::thread::current().name().unwrap_or("unnamed").to_string();
        let trace = std::backtrace::Backtrace::force_capture().to_string();
        let line = format!("[crash] thread '{thread}' panicked{place}: {what}");
        // Straight to the file: if the log pump itself is what crashed, a
        // write to stderr would never be read.
        if let Some(mut f) = open_log() {
            let _ = writeln!(f, "{} {line}\n{trace}", now_stamp());
        }
        remember(&line);
        report("crash", &format!("{line}\n{}", trace.lines().take(40).collect::<Vec<_>>().join("\n")), "fatal");
        if thread != "izuki-log" {
            default(info);
        }
    }));
}

/// Fetch where reports go (cached on disk, for starting offline).
fn load_tracker() {
    let cache = crate::store::data_dir().join("bugs.json");
    if let Ok(raw) = std::fs::read_to_string(&cache) {
        set_tracker(&raw);
    }
    crate::tls_ready();
    let fetched = reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .ok()
        .and_then(|c| c.get(CONFIG_URL).send().ok())
        .filter(|r| r.status().is_success())
        .and_then(|r| r.text().ok());
    if let Some(raw) = fetched {
        if set_tracker(&raw) {
            let _ = std::fs::write(&cache, raw);
        }
    }
}

/// Read `{"dsn": "...", "endpoint": "..."}`; `true` if it was well-formed
/// (even if both are empty). `dsn`: a Sentry project. `endpoint`: Izuki's own
/// backend, which gets each report as plain JSON.
fn set_tracker(raw: &str) -> bool {
    let Ok(v) = serde_json::from_str::<Value>(raw) else { return false };
    let dsn = v["dsn"].as_str().unwrap_or("").trim();
    *TRACKER.lock() = parse_dsn(dsn);
    let endpoint = v["endpoint"].as_str().unwrap_or("").trim();
    *ENDPOINT.lock() = endpoint.starts_with("https://").then(|| endpoint.to_string());
    true
}

/// `https://PUBLIC_KEY@o123.ingest.sentry.io/456` → where to send, and the key.
fn parse_dsn(dsn: &str) -> Option<Tracker> {
    let rest = dsn.strip_prefix("https://")?;
    let (key, rest) = rest.split_once('@')?;
    let (host, project) = rest.split_once('/')?;
    let project = project.trim_end_matches('/');
    if key.is_empty() || host.is_empty() || project.is_empty() || !project.chars().all(|c| c.is_ascii_digit()) {
        return None;
    }
    Some(Tracker { dsn: dsn.to_string(), endpoint: format!("https://{host}/api/{project}/envelope/"), key: key.to_string() })
}

/// Whether reports can be sent at all (a tracker or backend is set up).
pub fn can_send() -> bool {
    TRACKER.lock().is_some() || ENDPOINT.lock().is_some()
}

/// The user pressed "Report a problem": their words and the recent log go,
/// whatever the automatic setting says (they asked). `true` if it was sent.
pub fn user_report(what: &str) -> bool {
    let words = what.trim();
    let line = if words.is_empty() { "The user reported a problem".to_string() } else { format!("The user reported: {words}") };
    eprintln!("[report] {}", scrub(&line));
    send(&Report::new("user", &line, "warning"))
}

/// Report something that went wrong (a crash, a window error, a `[bug]`).
/// Quietly does nothing when reports are off or not set up, or when the same
/// thing was just reported. Never blocks: sending happens on its own thread.
pub fn report(kind: &str, message: &str, level: &str) {
    if !ENABLED.load(Ordering::SeqCst) || !can_send() {
        return;
    }
    let r = Report::new(kind, message, level);
    {
        let mut sent = SENT.lock();
        sent.retain(|(_, at)| at.elapsed() < Duration::from_secs(3600));
        if sent.len() >= MAX_PER_HOUR || sent.iter().any(|(f, _)| *f == r.fingerprint) {
            return;
        }
        sent.push((r.fingerprint.clone(), Instant::now()));
    }
    std::thread::Builder::new().name("izuki-bug-report".into()).spawn(move || { send(&r); }).ok();
}

struct Report {
    kind: String,
    message: String,
    level: String,
    fingerprint: String,
    lines: Vec<String>,
}

impl Report {
    fn new(kind: &str, message: &str, level: &str) -> Report {
        let message = scrub(message);
        let first = message.lines().next().unwrap_or("").to_string();
        let lines = {
            let recent = RECENT.lock();
            let skip = recent.len().saturating_sub(LINES_PER_REPORT);
            recent.iter().skip(skip).map(|l| scrub(l)).collect()
        };
        Report {
            kind: kind.to_string(),
            fingerprint: format!("{kind}:{}", same_kind(&first)),
            message,
            level: level.to_string(),
            lines,
        }
    }
}

/// Send a report everywhere that's set up. `false` if it went nowhere.
fn send(r: &Report) -> bool {
    let settings = crate::state::try_store().map(|s| s.settings());
    let (brain, model) = settings
        .as_ref()
        .and_then(|s| s.provider(s.active_provider).map(|p| (p.id.as_str().to_string(), p.model.clone())))
        .unwrap_or_default();
    let backend = ENDPOINT.lock().clone().is_some_and(|url| send_to_backend(&url, r, &brain, &model));
    let sentry = TRACKER.lock().clone().is_some_and(|t| send_to_sentry(&t, r, &brain, &model));
    backend || sentry
}

/// Izuki's own backend: the report as one plain JSON object.
fn send_to_backend(url: &str, r: &Report, brain: &str, model: &str) -> bool {
    let body = json!({
        "app": "pc",
        "version": env!("CARGO_PKG_VERSION"),
        "level": r.level,
        "kind": r.kind,
        "message": r.message.chars().take(4000).collect::<String>(),
        "fingerprint": r.fingerprint,
        "brain": brain,
        "model": model,
        "log": r.lines.join("\n"),
        "at": chrono::Utc::now().to_rfc3339(),
    });
    crate::tls_ready();
    let Ok(client) = reqwest::blocking::Client::builder().timeout(Duration::from_secs(15)).build() else { return false };
    client.post(url).json(&body).send().map(|res| res.status().is_success()).unwrap_or(false)
}

/// A Sentry project: the report as an envelope.
fn send_to_sentry(t: &Tracker, r: &Report, brain: &str, model: &str) -> bool {
    let now = chrono::Utc::now();
    let id = uuid::Uuid::new_v4().simple().to_string();
    let first_line = r.message.lines().next().unwrap_or("").chars().take(200).collect::<String>();
    let event = json!({
        "event_id": id,
        "timestamp": now.timestamp_millis() as f64 / 1000.0,
        "platform": "native",
        "level": r.level,
        "logger": r.kind,
        "release": format!("izuki@{}", env!("CARGO_PKG_VERSION")),
        "environment": if cfg!(debug_assertions) { "development" } else { "production" },
        "message": { "formatted": r.message.chars().take(4000).collect::<String>() },
        "fingerprint": [r.fingerprint],
        "tags": {
            "app": "pc",
            "kind": r.kind,
            "brain": brain,
            "model": model,
            "first_line": first_line,
        },
        "contexts": { "os": { "name": "Windows" } },
        "extra": { "log": r.lines.join("\n") },
    });
    let envelope = format!(
        "{}\n{}\n{}",
        json!({ "event_id": id, "sent_at": now.to_rfc3339(), "dsn": t.dsn }),
        json!({ "type": "event" }),
        event
    );
    crate::tls_ready();
    let Ok(client) = reqwest::blocking::Client::builder().timeout(Duration::from_secs(15)).build() else { return false };
    client
        .post(&t.endpoint)
        .header("Content-Type", "application/x-sentry-envelope")
        .header(
            "X-Sentry-Auth",
            format!("Sentry sentry_version=7, sentry_key={}, sentry_client=izuki/{}", t.key, env!("CARGO_PKG_VERSION")),
        )
        .body(envelope)
        .send()
        .map(|res| res.status().is_success())
        .unwrap_or(false)
}

/// Group reports of the same bug: numbers don't make a new one.
fn same_kind(line: &str) -> String {
    line.chars().map(|c| if c.is_ascii_digit() { '#' } else { c }).take(160).collect()
}

/// Take out anything personal or secret before a line leaves the PC: API
/// keys and tokens (and the secret in a call link), emails, phone numbers,
/// and the Windows user name (it's in every file path).
pub fn scrub(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut word = String::new();
    let flush = |word: &mut String, out: &mut String| {
        if !word.is_empty() {
            out.push_str(&scrub_word(word));
            word.clear();
        }
    };
    for c in s.chars() {
        if c.is_alphanumeric() || matches!(c, '_' | '-' | '.' | '@' | '+') {
            word.push(c);
        } else {
            flush(&mut word, &mut out);
            out.push(c);
        }
    }
    flush(&mut word, &mut out);
    let out = scrub_bearer(&out);
    match std::env::var("USERNAME") {
        Ok(user) if user.chars().count() >= 3 => replace_ignoring_case(&out, &user, "[user]"),
        _ => out,
    }
}

fn scrub_word(w: &str) -> String {
    const KEY_STARTS: &[&str] = &["AIza", "sk-", "sk_", "gsk_", "nvapi-", "xai-", "hf_", "ghp_", "github_pat_", "AKIA", "ak_"];
    let long = w.chars().count() >= 16;
    if long && KEY_STARTS.iter().any(|p| w.starts_with(p)) {
        return "[key]".into();
    }
    // An email: something@something.something.
    if let Some((name, domain)) = w.split_once('@') {
        if !name.is_empty() && domain.contains('.') {
            return "[email]".into();
        }
    }
    let digits = w.chars().filter(|c| c.is_ascii_digit()).count();
    let letters = w.chars().filter(|c| c.is_ascii_alphabetic()).count();
    // A long random-looking token: an unknown key, a call link's secret.
    if w.chars().count() >= 24 && digits >= 3 && letters >= 6 && !w.contains('.') {
        return "[token]".into();
    }
    // A phone number: +234…, or 10+ digits in a row.
    let digit_run = w.split(|c: char| !c.is_ascii_digit()).map(str::len).max().unwrap_or(0);
    if (w.starts_with('+') && digits >= 10) || digit_run >= 10 {
        return "[number]".into();
    }
    w.to_string()
}

fn scrub_bearer(s: &str) -> String {
    let mut out = String::new();
    let mut rest = s;
    while let Some(at) = rest.find("Bearer ") {
        out.push_str(&rest[..at + "Bearer ".len()]);
        rest = &rest[at + "Bearer ".len()..];
        let end = rest.find(char::is_whitespace).unwrap_or(rest.len());
        out.push_str("[key]");
        rest = &rest[end..];
    }
    out.push_str(rest);
    out
}

fn replace_ignoring_case(s: &str, find: &str, with: &str) -> String {
    let lower = s.to_lowercase();
    let needle = find.to_lowercase();
    if needle.is_empty() || lower.len() != s.len() {
        return s.to_string();
    }
    let mut out = String::new();
    let mut i = 0;
    while let Some(at) = lower[i..].find(&needle) {
        out.push_str(&s[i..i + at]);
        out.push_str(with);
        i += at + needle.len();
    }
    out.push_str(&s[i..]);
    out
}

/// The last lines of the log, cleaned — for "Copy a bug report".
pub fn recent_log(lines: usize) -> String {
    let recent = RECENT.lock();
    let skip = recent.len().saturating_sub(lines);
    recent.iter().skip(skip).map(|l| scrub(l)).collect::<Vec<_>>().join("\n")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn secrets_and_personal_details_never_leave() {
        let s = scrub("gemini key AIzaSyA1b2C3d4E5f6G7h8I9j0KlMnOpQrStUvW failed for sam.jones@gmail.com");
        assert!(!s.contains("AIza") && s.contains("[key]") && s.contains("[email]"), "{s}");
        let s = scrub("Authorization: Bearer gsk_abcdefghijklmnopqrstu12345 rejected");
        assert!(!s.contains("gsk_") && s.contains("Bearer [key]"), "{s}");
        // A Composio key must never ride along in a report either.
        let s = scrub("composio key ak_example0123456789example rejected");
        assert!(!s.contains("ak_example") && s.contains("[key]"), "{s}");
        let s = scrub("call link https://x.trycloudflare.com/k3J9sd82JdnQ0zPq7LmA4xYv/ ready");
        assert!(s.contains("[token]") && !s.contains("k3J9sd82"), "{s}");
        let s = scrub("text me on +2348012345678 or 08012345678");
        assert_eq!(s.matches("[number]").count(), 2, "{s}");
        // Ordinary log lines stay readable.
        let s = scrub("[brain] Gemini (gemini-flash-latest) answered in 14996 ms");
        assert_eq!(s, "[brain] Gemini (gemini-flash-latest) answered in 14996 ms");
    }

    #[test]
    fn reads_the_trackers_address() {
        let t = parse_dsn("https://abc123@o4507.ingest.us.sentry.io/4507890").expect("a DSN");
        assert_eq!(t.endpoint, "https://o4507.ingest.us.sentry.io/api/4507890/envelope/");
        assert_eq!(t.key, "abc123");
        assert!(parse_dsn("").is_none());
        assert!(parse_dsn("not a dsn").is_none());
    }

    /// The real thing: this process's stderr into the log file, and a flood of
    /// lines never blocks (a pipe nobody empties would hang every eprintln!).
    /// Run on its own: cargo test --lib stderr_lands_in_the_log -- --ignored --nocapture
    #[test]
    #[ignore]
    fn stderr_lands_in_the_log() {
        let _ = std::fs::create_dir_all(log_dir());
        capture_stderr();
        let marker = format!("izuki-log-test-{}", std::process::id());
        let started = Instant::now();
        for i in 0..1000 {
            eprintln!("[test] line {i} {}", "x".repeat(100));
        }
        eprintln!("{marker}");
        assert!(started.elapsed() < Duration::from_secs(20), "writing to stderr blocked");
        std::thread::sleep(Duration::from_millis(1000));
        let log = std::fs::read_to_string(log_path()).unwrap_or_default();
        assert!(log.contains(&marker), "the line never reached the log at {}", log_path().display());
        let last = log.lines().find(|l| l.contains(&marker)).unwrap_or_default();
        assert!(last.starts_with("20"), "no time on the line: {last}");
    }

    #[test]
    fn only_real_problems_are_reported() {
        assert_eq!(worth_reporting("[bug] no brain answered: timeout"), Some("bug"));
        assert_eq!(worth_reporting("[webview] [error] main: x is not a function"), Some("window"));
        assert_eq!(worth_reporting("[brain] Groq failed in 300 ms: 429"), None);
        assert_eq!(same_kind("timeout after 1500 ms"), same_kind("timeout after 2200 ms"));
    }
}
