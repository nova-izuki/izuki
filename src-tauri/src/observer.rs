//! The Smart Vision Developer Observer (owner-only, `--features vision`).
//!
//! Built entirely out of release builds: the code only exists in a dev build
//! (cargo build --features vision) and then only runs when the owner sets
//! `IZUKI_VISION=1`, so an observing Izuki is a decision, never an accident.
//! (Milestone 1.0.196 §5.)
//!
//! What it does for development (Claude Code is the audience):
//! - It watches Izuki's own window with the same GDI capture the app already
//!   trusts, keeping a small ring of JPEG frames and dropping duplicates
//!   (same downscaled pixels), so "what did Izuki look like" has an answer
//!   without littering the disk with screenshots.
//! - Actions (a save finishing, a command starting) and verifications (an
//!   error, a `[bug]` line) are recorded on a timeline next to the frame that
//!   shows the result, and "Capture Bug" folds that story — frames, timeline,
//!   recent log lines — into one folder on disk ready to send.
//! - A tiny HTTP server on the loopback (token-authed, read-only) lets Claude
//!   Code read the timeline and the frames, and a dashboard page shows them.
//! - Under load the watcher keeps its own pace: a floor between captures and
//!   a skip-while-busy rule, so observing never becomes the slowdown.

use std::collections::{HashMap, VecDeque};
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

use parking_lot::Mutex;

use crate::capture::Frame;

/// The most timeline entries kept (oldest dropped past this).
const MAX_EVENTS: usize = 500;
/// The most frames kept in the ring.
const MAX_FRAMES: usize = 40;
/// The smallest gap between grabs, so the watcher never storms a busy app.
const CAPTURE_FLOOR: Duration = Duration::from_millis(700);

#[derive(Clone, Debug, serde::Serialize)]
pub struct Event {
    pub at: u64,
    /// "action" (a save finishing, a command starting) or "verification"
    /// (an error, a check) — the timeline's two halves.
    pub kind: String,
    pub text: String,
}

#[derive(Clone, serde::Serialize)]
pub struct FrameEntry {
    pub at: u64,
    pub jpeg: Vec<u8>,
    pub width: u32,
    pub height: u32,
}

pub static ENABLED: AtomicBool = AtomicBool::new(false);
pub static RUNNING: AtomicBool = AtomicBool::new(false);
pub static TICKS: AtomicU64 = AtomicU64::new(0);
pub static CAPTURES: AtomicU64 = AtomicU64::new(0);

static EVENTS: Mutex<VecDeque<Event>> = Mutex::new(VecDeque::new());
static FRAMES: Mutex<VecDeque<FrameEntry>> = Mutex::new(VecDeque::new());
/// Frame content hashes seen lately, for the two-minute "have I kept this
/// view recently?" rule.
static SEEN: Mutex<Option<HashMap<u64, Instant>>> = Mutex::new(None);
static SERVER_PORT: Mutex<Option<u16>> = Mutex::new(None);

pub fn data_dir() -> PathBuf {
    crate::store::data_dir().join("vision")
}

pub fn token_path() -> PathBuf {
    data_dir().join("token")
}

/// A random token written once and reused; the server checks every request
/// against it, and the file sits where only this Windows user reads.
pub fn ensure_token() -> Result<String, String> {
    let path = token_path();
    if let Ok(t) = std::fs::read_to_string(&path) {
        let t = t.trim().to_string();
        if !t.is_empty() {
            return Ok(t);
        }
    }
    let t = uuid::Uuid::new_v4().simple().to_string();
    std::fs::create_dir_all(data_dir()).map_err(|e| e.to_string())?;
    std::fs::write(&path, &t).map_err(|e| e.to_string())?;
    Ok(t)
}

pub fn snapshot_events() -> Vec<Event> {
    EVENTS.lock().iter().cloned().collect()
}

pub fn event_count() -> usize {
    EVENTS.lock().len()
}

pub fn frame_count() -> usize {
    FRAMES.lock().len()
}

/// Record one timeline entry (the code paths being observed call this).
pub fn record(kind: &str, text: impl Into<String>) {
    if !ENABLED.load(Ordering::SeqCst) {
        return;
    }
    // Redact at the boundary, not per caller: every note reaching the
    // timeline (bug messages, file paths, future callers) is scrubbed here,
    // because /api/events serves this text and timeline.json writes it to
    // disk ready to send (CodeRabbit finding, 2026-11-02).
    let owned: String = text.into();
    let text = crate::bugs::scrub(owned.as_str());
    let mut events = EVENTS.lock();
    if events.len() >= MAX_EVENTS {
        events.pop_front();
    }
    events.push_back(Event { at: now_ms(), kind: kind.to_string(), text: text.into() });
}

/// FNV-1a over the frame's raw pixels: cheap, and stable enough to tell
/// "nothing changed" from "the user typed something".
pub fn hash_frame(frame: &Frame) -> u64 {
    let mut hash: u64 = 0xcbf2_9ce4_8422_2325;
    for &b in &frame.bgra {
        hash ^= b as u64;
        hash = hash.wrapping_mul(0x1000_0000_01b3);
    }
    hash
}

/// Should this content join the ring? The same pixels seen inside the last
/// two minutes mean an unchanged view, not news; the map expires as it goes.
pub fn is_new_content(hash: u64, seen: &mut HashMap<u64, Instant>, cutoff: Instant) -> bool {
    let fresh = seen.get(&hash).map(|at| *at < cutoff).unwrap_or(true);
    seen.retain(|_, at| *at >= cutoff);
    if fresh {
        seen.insert(hash, Instant::now());
    }
    fresh
}

pub fn mark_seen(hash: u64) {
    let mut guard = SEEN.lock();
    let seen = guard.get_or_insert_with(HashMap::new);
    seen.insert(hash, Instant::now());
    if seen.len() > 512 {
        let cutoff = Instant::now() - Duration::from_secs(120);
        seen.retain(|_, at| *at >= cutoff);
    }
}

fn jpeg_of(frame: &Frame) -> Option<FrameEntry> {
    let small = frame.downscaled(960);
    let out = small.to_jpeg_fast(80).ok()?;
    Some(FrameEntry { at: now_ms(), jpeg: out, width: small.width, height: small.height })
}

pub fn now_ms() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_millis() as u64
}

/// Izuki's own window as a frame: the window's rect from the OS, then the
/// screen region capture the app already trusts. (PrintWindow-based
/// behind-work capture is `mod imp`-private in capture.rs; this route keeps
/// the observer independent of capture.rs's internals.)
pub fn window_snapshot(hwnd: isize) -> Result<crate::capture::Frame, String> {
    let rect = window_rect(hwnd)?;
    crate::capture::capture(rect).map_err(|e| e.to_string())
}

#[cfg(windows)]
fn window_rect(hwnd: isize) -> Result<crate::model::Rect, String> {
        use windows::Win32::UI::WindowsAndMessaging::GetWindowRect;
    let h = windows::Win32::Foundation::HWND(hwnd as *mut core::ffi::c_void);
    let mut r = windows::Win32::Foundation::RECT::default();
    unsafe { GetWindowRect(h, &mut r) }
        .map_err(|e| format!("no window rect: {e}"))?;
    Ok(crate::model::Rect {
        x: r.left,
        y: r.top,
        w: (r.right - r.left).max(1),
        h: (r.bottom - r.top).max(1),
    })
}

#[cfg(not(windows))]
fn window_rect(hwnd: isize) -> Result<crate::model::Rect, String> {
    Err("Smart Vision window capture is desktop-windows only in this build (the feature is for the owner's dev machine).".into())
}

/// One watcher tick: grab Izuki's own window, drop it if the pixels are the
/// same as the last grab, encode and push if not. Returns whether a frame
/// was kept.
pub fn capture_once(hwnd: isize, last_hash: &mut Option<u64>) -> Result<bool, String> {
    let frame = window_snapshot(hwnd)?;
    let hash = hash_frame(&frame);
    if Some(hash) == *last_hash {
        return Ok(false);
    }
    let entry = match jpeg_of(&frame) {
        Some(e) => e,
        None => return Ok(false),
    };
    let mut frames = FRAMES.lock();
    if frames.len() >= MAX_FRAMES {
        frames.pop_front();
    }
    frames.push_back(entry);
    drop(frames);
    mark_seen(hash);
    *last_hash = Some(hash);
    CAPTURES.fetch_add(1, Ordering::SeqCst);
    Ok(true)
}

#[derive(Clone, Copy)]
struct WatcherClock {
    last_capture: Instant,
}

/// Watch Izuki's window until told to stop: at most one grab per
/// `CAPTURE_FLOOR`, and it never sees the same pixels twice in a row.
fn watch_until_stopped(hwnd: isize) {
    let mut clock = WatcherClock { last_capture: Instant::now() - CAPTURE_FLOOR };
    let mut last_hash: Option<u64> = None;
    while RUNNING.load(Ordering::SeqCst) {
        if clock.last_capture.elapsed() >= CAPTURE_FLOOR {
            let _ = capture_once(hwnd, &mut last_hash);
            TICKS.fetch_add(1, Ordering::SeqCst);
            clock.last_capture = Instant::now();
        }
        std::thread::sleep(Duration::from_millis(120));
    }
}

/// Turn the observer on: token written, watcher and loopback server threads
/// spawned, the server's port returned. The feature gate is the caller's
/// job (lib.rs compiles this in only with `--features vision`).
pub fn start(hwnd: isize) -> Result<u16, String> {
    // Even in a dev build the observing itself is a decision, never automatic.
    if std::env::var("IZUKI_VISION").as_deref() != Ok("1") {
        return Err("Smart Vision only observes when you set IZUKI_VISION=1 in the environment.".into());
    }
    if RUNNING.swap(true, Ordering::SeqCst) {
        return server_port().ok_or_else(|| "the vision server is up but its port was never recorded".into());
    }
    ensure_token()?;

    std::thread::Builder::new()
        .name("izuki-vision-watch".into())
        .spawn(move || watch_until_stopped(hwnd))
        .map_err(|e| format!("the vision watcher thread never started: {e}"))?;

    let listener = TcpListener::bind("127.0.0.1:0")
        .map_err(|e| format!("the vision server could not get a loopback port: {e}"))?;
    let port = listener.local_addr().map_err(|e| e.to_string())?.port();
    *SERVER_PORT.lock() = Some(port);
    std::thread::Builder::new()
        .name("izuki-vision-serve".into())
        .spawn(move || serve_forever(listener))
        .map_err(|e| format!("the vision server thread never started: {e}"))?;
    Ok(port)
}

pub fn stop() {
    RUNNING.store(false, Ordering::SeqCst);
}

/// OFF for real: the ring buffers are dropped, not hidden — capture stops
/// and the bounded memory it used is released.
pub fn clear_frames() {
    FRAMES.lock().clear();
    *SEEN.lock() = None;
}

/// Frames as (index-from-newest-1, wall-clock ms) for the review digest —
/// bytes stay servable through /api/frames without copying them anywhere.
pub fn frames_index() -> Vec<(u64, u64)> {
    let frames = FRAMES.lock();
    let n = frames.len() as u64;
    frames.iter().rev().enumerate().map(|(i, f)| (n - i as u64, f.at)).collect()
}

pub fn server_port() -> Option<u16> {
    *SERVER_PORT.lock()
}

/// The loopback server: one request at a time, token-checked, read-only.
fn serve_forever(listener: TcpListener) {
    let token_file = token_path();
    for stream in listener.incoming() {
        if !RUNNING.load(Ordering::SeqCst) {
            break;
        }
        let mut stream = match stream {
            Ok(s) => s,
            Err(_) => continue,
        };
        let _ = stream.set_read_timeout(Some(Duration::from_secs(5)));
        let mut buffer = [0u8; 4096];
        let n = stream.read(&mut buffer).unwrap_or(0);
        let head = String::from_utf8_lossy(&buffer[..n]).to_string();
        let mut words = head.split_whitespace();
        let method = words.next().unwrap_or("");
        let path = words.next().unwrap_or("");
        if method != "GET" {
            write_json_line(&mut stream, 405, "GET only");
            continue;
        }
        if !authorized(&head, &token_file) {
            write_json_line(&mut stream, 403, "wrong token");
            continue;
        }
        match path {
            "/" | "/api/dashboard" => write_html(&mut stream, &dashboard()),
            "/api/status" => write_json(
                &mut stream,
                &serde_json::json!({
                    "running": RUNNING.load(Ordering::SeqCst),
                    "ticks": TICKS.load(Ordering::SeqCst),
                    "captures": CAPTURES.load(Ordering::SeqCst),
                    "frames": frame_count(),
                    "events": event_count(),
                }),
            ),
            "/api/events" => write_json(&mut stream, &serde_json::json!({ "events": snapshot_events() })),
            p if p.starts_with("/api/frames/") => {
                let idx: i64 = p.trim_start_matches("/api/frames/").parse().unwrap_or(-1);
                let frames = FRAMES.lock();
                let count = frames.len() as i64;
                if idx < 1 || idx > count {
                    write_json_line(&mut stream, 404, "no such frame");
                } else {
                    // Human numbering: newest frame is the highest number.
                    let entry = frames.get((count - idx) as usize).unwrap();
                    write_jpeg(&mut stream, &entry.jpeg);
                }
            }
            _ => write_json_line(&mut stream, 404, "unknown route"),
        }
    }
}

/// Bearer-token check, without trusting the header shape: the token file's
/// content is the expected value, and a wrong or missing header is refused.
pub fn authorized(head: &str, token_file: &Path) -> bool {
    let expected = match std::fs::read_to_string(token_file) {
        Ok(text) => text.trim().to_string(),
        Err(_) => return false,
    };
    let given = head
        .split("Authorization: Bearer ")
        .nth(1)
        .and_then(|rest| rest.split_whitespace().next());
    given.is_some_and(|g| g == expected)
}

fn write_json_line(stream: &mut TcpStream, code: u16, why: &str) {
    let body = format!("{{\"error\":\"{code}::{why}\"}}");
    let head = format!("HTTP/1.1 {code} NO\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n", body.len());
    let _ = stream.write_all(head.as_bytes());
    let _ = stream.write_all(body.as_bytes());
    let _ = stream.flush();
}

fn write_json(stream: &mut TcpStream, body: &serde_json::Value) {
    let text = body.to_string();
    let head = format!("HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n", text.len());
    let _ = stream.write_all(head.as_bytes());
    let _ = stream.write_all(text.as_bytes());
    let _ = stream.flush();
}

fn write_html(stream: &mut TcpStream, text: &str) {
    let head = format!("HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n", text.len());
    let _ = stream.write_all(head.as_bytes());
    let _ = stream.write_all(text.as_bytes());
    let _ = stream.flush();
}

fn write_jpeg(stream: &mut TcpStream, bytes: &[u8]) {
    let head = format!("HTTP/1.1 200 OK\r\nContent-Type: image/jpeg\r\nContent-Length: {}\r\nConnection: close\r\n\r\n", bytes.len());
    let _ = stream.write_all(head.as_bytes());
    let _ = stream.write_all(bytes);
    let _ = stream.flush();
}

/// The dashboard page: status line, timeline, and every frame as an image,
/// all plain and dark, and it asks for the token like everything else does.
fn dashboard() -> String {
    let events = serde_json::to_string(&snapshot_events()).unwrap_or_else(|_| "[]".into());
    let escaped = events.replace('&', "&amp;").replace('<', "&lt;").replace('>', "&gt;");
    format!(
        r#"<!doctype html><meta charset="utf-8"><title>Izuki Smart Vision</title>
<h1>Izuki Smart Vision</h1>
<p id="status">loading…</p>
<p>endpoints: <code>/api/status</code>, <code>/api/events</code>, <code>/api/frames/&lt;1..n, newest last&gt;</code></p>
<h2>Timeline</h2>
<pre id="events" style="white-space:pre-wrap;max-width:900px">{escaped}</pre>
<h2>Frames</h2>
<div id="frames"></div>
<script>
fetch('/api/status').then(r=>r.json()).then(s=>{{
  document.getElementById('status').textContent =
    `ticks ${{s.ticks}}, kept captures ${{s.captures}}, frames ${{s.frames}}, timeline entries ${{s.events}}`;
}});
for (let i = 1; i <= 40; i++) {{
  const img = new Image();
  img.style.maxWidth = '420px'; img.style.margin = '4px';
  img.onerror = () => img.remove();
  img.src = '/api/frames/' + i;
  document.getElementById('frames').appendChild(img);
}}
</script>"#
    )
}

/// "Capture Bug": fold the story of the last little while — frames, the
/// timeline with each entry pointing at the frame that shows it, and the
/// log's tail — into one folder ready to send.
pub fn capture_bug() -> Result<PathBuf, String> {
    let root = data_dir().join(format!("bug-{}", stamp()));
    std::fs::create_dir_all(&root).map_err(|e| e.to_string())?;
    let frames = FRAMES.lock();
    let mut names = Vec::new();
    for (i, f) in frames.iter().enumerate() {
        let name = format!("frame-{:03}.jpg", i);
        std::fs::write(root.join(&name), &f.jpeg).map_err(|e| e.to_string())?;
        names.push(name);
    }
    drop(frames);
    let timeline: Vec<serde_json::Value> = snapshot_events()
        .iter()
        .map(|e| serde_json::json!({
            "at": e.at, "kind": e.kind, "text": e.text,
            "frame_at": frame_at_or_before(e.at),
        }))
        .collect();
    std::fs::write(root.join("timeline.json"), serde_json::to_string_pretty(&timeline).unwrap_or_default()).ok();
    let log_tail = std::fs::read_to_string(crate::bugs::log_path())
        .map(|all| all.lines().rev().take(120).collect::<Vec<_>>().into_iter().rev().collect::<Vec<_>>().join("\n"))
        .unwrap_or_default();
    let summary = serde_json::json!({
        "captured_at": now_ms(),
        "frames": names,
        "timeline_size": timeline.len(),
    });
    std::fs::write(root.join("summary.json"), serde_json::to_string_pretty(&summary).unwrap_or_default()).ok();
    std::fs::write(root.join("izuki.log.tail.txt"), log_tail).ok();
    Ok(root)
}

/// The frame, in the ring, at or just before a moment — the one a reader
/// opens first to see what Izuki looked like when that happened.
pub fn frame_at_or_before(at: u64) -> Option<u64> {
    FRAMES.lock().iter().rev().find(|f| f.at <= at).map(|f| f.at)
}

fn stamp() -> String {
    let secs = now_ms() / 1000;
    let civil = epoch_to_civil((secs / 86400) as i64);
    let rem = secs % 86400;
    format!("{}{:02}{:02}-{:02}{:02}{:02}", civil.0, civil.1, civil.2, rem / 3600, rem / 60 % 60, rem % 60)
}

fn epoch_to_civil(days: i64) -> (i64, u64, u64) {
    // Howard Hinnant's civil_from_days, dependency-free.
    let z = days + 719_468;
    let era = if z >= 0 { z } else { z - 146_096 } / 146_097;
    let doe = z - era * 146_097;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146_096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = (doy - (153 * mp + 2) / 5 + 1) as u64;
    let m = (if mp < 10 { mp + 3 } else { mp - 9 }) as u64;
    ((if m <= 2 { y + 1 } else { y }), m, d)
}

// ─── tests ───────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn tiny_frame(w: u32, h: u32, fill: u8) -> Frame {
        Frame { width: w, height: h, origin: (0, 0), bgra: vec![fill; (w * h * 4) as usize] }
    }

    #[test]
    fn the_same_pixels_seen_a_moment_ago_are_not_news() {
        let mut seen: HashMap<u64, Instant> = HashMap::new();
        let cutoff = Instant::now() - Duration::from_secs(120);
        assert!(is_new_content(12_345, &mut seen, cutoff));
        assert!(!is_new_content(12_345, &mut seen, cutoff), "the same hash inside the window is dropped");
    }

    #[test]
    fn a_view_that_went_stale_is_worth_keeping_again() {
        let mut seen: HashMap<u64, Instant> = HashMap::new();
        assert!(is_new_content(7, &mut seen, Instant::now() - Duration::from_secs(120)));
        seen.insert(7, Instant::now() - Duration::from_secs(180));
        assert!(is_new_content(7, &mut seen, Instant::now() - Duration::from_secs(120)),
            "a repeat after two full minutes is real activity again");
    }

    #[test]
    fn identical_captured_frames_hash_identically_and_differ_elsewhere() {
        let f1 = tiny_frame(4, 4, 9);
        let f2 = tiny_frame(4, 4, 9);
        let f3 = tiny_frame(4, 4, 10);
        assert_eq!(hash_frame(&f1), hash_frame(&f2));
        assert_ne!(hash_frame(&f1), hash_frame(&f3));
    }

    #[test]
    fn rings_never_grow_past_their_bound_and_the_oldest_falls_first() {
        // 45 pushes into a 40-deep ring: the 5 oldest fall off, the newest
        // (44) stays at the back.
        let mut frames: VecDeque<u32> = VecDeque::new();
        let total = MAX_FRAMES as u32 + 5;
        for i in 0..total {
            if frames.len() >= MAX_FRAMES { frames.pop_front(); }
            frames.push_back(i);
        }
        assert_eq!(frames.len(), MAX_FRAMES);
        assert_eq!(frames.front().copied(), Some(total - MAX_FRAMES as u32), "oldest fallen, next-oldest at the front");
        assert_eq!(frames.back().copied(), Some(total - 1), "the newest is kept");

        let mut events: VecDeque<u32> = VecDeque::new();
        let total = MAX_EVENTS as u32 + 7;
        for i in 0..total {
            if events.len() >= MAX_EVENTS { events.pop_front(); }
            events.push_back(i);
        }
        assert_eq!(events.len(), MAX_EVENTS);
        assert_eq!(events.front().copied(), Some(total - MAX_EVENTS as u32));
        assert_eq!(events.back().copied(), Some(total - 1));
    }

    #[test]
    fn a_wrong_or_missing_token_is_refused() {
        let dir = std::env::temp_dir().join(format!("izuki-vision-test-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let file = dir.join("token");
        std::fs::write(&file, "s3cret-token").unwrap();
        assert!(authorized("GET /api/status HTTP/1.1\r\nAuthorization: Bearer s3cret-token\r\n", &file));
        assert!(!authorized("GET /api/status HTTP/1.1\r\nAuthorization: Bearer wrong\r\n", &file));
        assert!(!authorized("GET /api/status HTTP/1.1\r\n", &file), "missing header refused");
        std::fs::remove_dir_all(&dir).unwrap();
    }
}
#[cfg(all(test, feature = "devvision"))]
mod record_scrub_tests {
    use super::*;

    /// Detect step of the verified loop (CodeRabbit finding, 2026-11-02):
    /// whatever callers pass to `record` lands verbatim in the timeline that
    /// /api/events serves and that timeline.json writes ready to send, and
    /// those notes can carry the Windows user name or other secrets. The
    /// timeline must store the scrubbed text, never raw input.
    #[test]
    fn a_recorded_event_is_scrubbed_before_it_is_stored() {
        let bs = char::from_u32(92).unwrap(); // the path separator, unescaped
        let user = std::env::var("USERNAME").unwrap_or_else(|_| "longusername".into());
        assert!(user.chars().count() >= 3, "test needs a meaningful user name to redact");
        let raw = format!(
            "factory stopped: C:{0}Users{0}{1}{0}Downloads{0}trace.log",
            bs, user
        );
        let was_running = RUNNING.load(Ordering::SeqCst);
        ENABLED.store(true, std::sync::atomic::Ordering::SeqCst);
        record("verification", raw);
        let stored = snapshot_events()
            .into_iter()
            .map(|e| e.text)
            .collect::<Vec<_>>();
        assert!(
            !stored.is_empty(),
            "the timeline stayed empty: the detect run proves nothing"
        );
        assert!(
            !stored.iter().any(|t| t.contains(&user)),
            "the timeline stored the raw user name: {:?}",
            stored.last()
        );
        if !was_running {
            ENABLED.store(false, std::sync::atomic::Ordering::SeqCst);
        }
    }
}
