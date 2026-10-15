//! The phone as a remote for this PC: a trackpad, clicks, scrolling, typing,
//! keys and media buttons, and a look at the screen — through the phone's
//! private link (call.rs: a secret address only your paired phone has).
//!
//! Off until you switch it on ("Let my phone control this PC"). Never while
//! the PC is locked. Only these actions, and only keys the PC knows — no
//! commands, no files.
//!
//! Who: only a phone you allowed on this PC (the box with the 4-digit code
//! gives it its own pass — revoke it any time); knowing the private link is
//! not enough. While a phone is connected, the PC shows it ("📱 … End").
//! Every action is written to logs/remote-audit.log (never what was typed).
//! Touching the controls takes over: Izuki's own task stops at once, so the
//! two never fight over the mouse.

use std::io::Write as _;
use std::time::{Duration, Instant};

use anyhow::{anyhow, bail, Result};
use parking_lot::Mutex;
use serde_json::{json, Value};
use tauri::Emitter;

/// The phone this pass belongs to (one you allowed on this PC), or "pair".
pub fn device(token: Option<&str>) -> Result<String> {
    let token = token.map(str::trim).filter(|t| t.len() >= 20).ok_or_else(|| anyhow!("pair"))?;
    let s = crate::state::try_store().ok_or_else(|| anyhow!("off"))?.settings();
    s.linked_devices
        .iter()
        .find(|d| d.kind == "phone" && d.token == token)
        .map(|d| d.name.clone())
        .ok_or_else(|| anyhow!("pair"))
}

/// The phone connected right now: (name, last heard from, controlling).
static ACTIVE: Mutex<Option<(String, Instant, bool)>> = Mutex::new(None);
static WATCHING: std::sync::Once = std::sync::Once::new();
pub const ACTIVE_EVENT: &str = "izuki://remote-active";

/// A phone is viewing (or controlling) — the PC shows it, and stops showing
/// it a few seconds after the phone goes quiet.
fn seen(device: &str, controlling: bool) {
    let fresh = {
        let mut a = ACTIVE.lock();
        let was = a.clone();
        let ctrl = controlling || was.as_ref().is_some_and(|(d, at, c)| d == device && *c && at.elapsed() < Duration::from_secs(15));
        *a = Some((device.to_string(), Instant::now(), ctrl));
        was.map(|(d, _, c)| d != device || c != ctrl).unwrap_or(true)
    };
    if fresh {
        announce();
    }
    WATCHING.call_once(|| {
        std::thread::spawn(|| loop {
            std::thread::sleep(Duration::from_secs(2));
            let gone = ACTIVE.lock().as_ref().is_some_and(|(_, at, _)| at.elapsed() > Duration::from_secs(12));
            if gone {
                ACTIVE.lock().take();
                announce();
            }
        });
    });
}

fn announce() {
    let now = ACTIVE.lock().clone();
    if let Some(app) = crate::state::app() {
        // The overlay must be up for the indicator to show.
        if now.is_some() {
            let _ = crate::overlay::show_follow(app);
        }
        let _ = app.emit(ACTIVE_EVENT, now.map(|(d, _, c)| json!({ "device": d, "controlling": c })));
    }
}

/// Written down: who did what, when — never what was typed.
pub fn audit(device: &str, op: &str, detail: &str) {
    let path = crate::store::data_dir().join("logs").join("remote-audit.log");
    if let Ok(mut f) = std::fs::OpenOptions::new().create(true).append(true).open(path) {
        let _ = writeln!(f, "{} {device}: {op}{}", chrono::Local::now().format("%Y-%m-%d %H:%M:%S"), if detail.is_empty() { String::new() } else { format!(" ({detail})") });
    }
}

/// Stop Izuki's own work (the task, missions, apps) — the phone took over or pressed Stop.
fn stop_izuki(why: &str) {
    crate::brain::cancel_task();
    crate::missions::stop();
    crate::composio::stop();
    eprintln!("[remote] {why} — Izuki stopped");
    if let Some(app) = crate::state::app() {
        let _ = app.emit(crate::events::STATUS, crate::model::StatusEvent::info(why));
    }
}

/// What the phone's live view shows beside the screen: what Izuki is doing,
/// the missions, and how the stream is going.
pub fn status(device: &str) -> Result<Value> {
    allowed()?;
    seen(device, false);
    let s = STATS.lock().clone();
    Ok(json!({
        "doing": crate::state::doing_now(),
        "busy": crate::state::task_running() || crate::missions::running(),
        "missions": crate::missions::list().into_iter().filter(|m| m.state != "done" || m.at > chrono::Utc::now().timestamp_millis() - 3_600_000).collect::<Vec<_>>(),
        "fps": s.fps,
        "kbps": s.kbps,
        "encode_ms": s.encode_ms,
    }))
}

/// One thing from the phone: `{ "op": "move", "dx": 12, "dy": -4 }`, and so on.
pub fn run(req: &Value, device: &str) -> Result<Value> {
    allowed()?;
    let op = req["op"].as_str().unwrap_or("");
    let right = req["button"].as_str() == Some("right");
    // Stop Izuki (from the phone's live view).
    if op == "stop" {
        audit(device, "stop Izuki", "");
        stop_izuki("Stopped from your phone");
        return Ok(json!({ "ok": true }));
    }
    // You touched the controls: you have the mouse now, not Izuki.
    if crate::state::task_running() || crate::missions::running() {
        stop_izuki("You took over from your phone, so I stopped");
    }
    seen(device, true);
    let detail = match op {
        "type" => format!("{} characters", req["text"].as_str().map(|t| t.chars().count()).unwrap_or(0)),
        "key" => req["combo"].as_str().unwrap_or("").to_string(),
        "click" | "down" | "up" => if right { "right".into() } else { String::new() },
        _ => String::new(),
    };
    if op != "move" {
        audit(device, op, &detail);
    }
    match op {
        // The trackpad: how far the finger slid (already scaled by the phone).
        "move" => {
            let dx = req["dx"].as_f64().unwrap_or(0.0).clamp(-2000.0, 2000.0).round() as i32;
            let dy = req["dy"].as_f64().unwrap_or(0.0).clamp(-2000.0, 2000.0).round() as i32;
            let (x, y) = cursor();
            let b = crate::capture::virtual_bounds();
            let nx = (x + dx).clamp(b.x, b.x + b.w.max(1) - 1);
            let ny = (y + dy).clamp(b.y, b.y + b.h.max(1) - 1);
            crate::automation::pointer_to(nx, ny);
            Ok(json!({ "ok": true }))
        }
        // A tap on the phone's view of the screen: the pointer goes there.
        "point" => {
            let nx = req["nx"].as_f64().unwrap_or(0.5).clamp(0.0, 1.0);
            let ny = req["ny"].as_f64().unwrap_or(0.5).clamp(0.0, 1.0);
            let (x, y) = crate::air::to_screen(nx, ny);
            crate::automation::pointer_to(x, y);
            Ok(json!({ "ok": true }))
        }
        "click" => {
            let times = if req["double"].as_bool().unwrap_or(false) { 2 } else { 1 };
            for _ in 0..times {
                crate::automation::mouse_button(right, true)?;
                crate::automation::mouse_button(right, false)?;
            }
            Ok(json!({ "ok": true }))
        }
        // Press and hold (drag), then let go.
        "down" => {
            crate::automation::mouse_button(right, true)?;
            Ok(json!({ "ok": true }))
        }
        "up" => {
            crate::automation::mouse_button(right, false)?;
            Ok(json!({ "ok": true }))
        }
        "scroll" => {
            let n = req["dy"].as_i64().unwrap_or(0).clamp(-30, 30) as i32;
            if n != 0 {
                crate::automation::scroll_here(n)?;
            }
            Ok(json!({ "ok": true }))
        }
        "type" => {
            let text: String = req["text"].as_str().unwrap_or("").chars().take(2000).collect();
            if !text.is_empty() {
                crate::automation::type_text(&text)?;
            }
            Ok(json!({ "ok": true }))
        }
        "key" => {
            let combo = req["combo"].as_str().unwrap_or("").trim().to_lowercase();
            if !crate::automation::key_is_known(&combo) {
                bail!("unknown key: {combo}");
            }
            crate::automation::press_key(&combo)?;
            Ok(json!({ "ok": true }))
        }
        _ => Err(anyhow!("unknown remote action")),
    }
}

/// The screen as a small JPEG for the phone (`width` pixels across, at most 1280).
pub fn screen(width: u32, device: &str) -> Result<Vec<u8>> {
    allowed()?;
    seen(device, false);
    let frame = crate::capture::capture_all()?;
    frame.downscaled(width.clamp(320, 1280)).to_jpeg(55)
}

/// How the live view is going (for the phone's numbers).
#[derive(Clone, Default)]
struct Stats {
    fps: f32,
    kbps: f32,
    encode_ms: u32,
}
static STATS: Mutex<Stats> = Mutex::new(Stats { fps: 0.0, kbps: 0.0, encode_ms: 0 });
/// The newest live view (an older one stops when a newer one starts).
static STREAM_GEN: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);

/// The live view: a stream of JPEG pictures (multipart), `fps` a second at
/// most and `width` pixels across. A picture that hasn't changed isn't sent
/// again (only every few seconds, to show it's alive), so a still screen
/// costs almost nothing. Ends when the phone goes, the remote is switched
/// off or the PC locks.
///
/// Two halves so it stays smooth: a maker thread captures, shrinks and
/// compresses the next picture *while* the last one is still travelling to
/// the phone, and keeps only the newest (a slow connection gets fresh
/// pictures, never a backlog). Before this, each picture waited for the one
/// before it to arrive — about 5 a second at best on this PC.
pub struct Live {
    gen: u64,
    began: Instant,
    device: String,
    buf: Vec<u8>,
    pos: usize,
    shared: std::sync::Arc<Shared>,
    window: (Instant, u32, usize),
}

/// Between the maker thread and the sender.
struct Shared {
    /// The newest picture not sent yet.
    slot: Mutex<Option<Vec<u8>>>,
    ready: parking_lot::Condvar,
    /// Set when the stream ends (either side).
    stop: std::sync::atomic::AtomicBool,
    /// How long the last picture took to make, ms.
    make_ms: std::sync::atomic::AtomicU32,
}

impl Live {
    pub fn new(width: u32, fps: u32, quality: u8, device: &str) -> Live {
        let gen = STREAM_GEN.fetch_add(1, std::sync::atomic::Ordering::SeqCst) + 1;
        let shared = std::sync::Arc::new(Shared {
            slot: Mutex::new(None),
            ready: parking_lot::Condvar::new(),
            stop: std::sync::atomic::AtomicBool::new(false),
            make_ms: std::sync::atomic::AtomicU32::new(0),
        });
        let maker = shared.clone();
        let (width, every, quality) = (width.clamp(320, 1600), Duration::from_millis(1000 / u64::from(fps.clamp(1, 15))), quality.clamp(30, 85));
        let began = Instant::now();
        let spawned = std::thread::Builder::new()
            .name("izuki-live".into())
            .spawn(move || make_pictures(&maker, gen, began, width, every, quality));
        if spawned.is_err() {
            // No maker: end at once rather than wait for pictures that won't come.
            shared.stop.store(true, std::sync::atomic::Ordering::SeqCst);
        }
        Live { gen, began, device: device.to_string(), buf: Vec::new(), pos: 0, shared, window: (Instant::now(), 0, 0) }
    }

    fn ended(&self) -> bool {
        let replaced = STREAM_GEN.load(std::sync::atomic::Ordering::SeqCst) != self.gen;
        self.shared.stop.load(std::sync::atomic::Ordering::SeqCst) || replaced || allowed().is_err() || self.began.elapsed() > Duration::from_secs(2 * 3600)
    }

    fn next_frame(&mut self) -> std::io::Result<bool> {
        let jpeg = loop {
            if self.ended() {
                self.shared.stop.store(true, std::sync::atomic::Ordering::SeqCst);
                return Ok(false);
            }
            let mut slot = self.shared.slot.lock();
            if let Some(j) = slot.take() {
                break j;
            }
            // Wake when the maker has one (or check the stop signs each second).
            self.shared.ready.wait_for(&mut slot, Duration::from_secs(1));
            if let Some(j) = slot.take() {
                break j;
            }
        };
        self.buf.clear();
        self.pos = 0;
        let _ = write!(self.buf, "--frame\r\nContent-Type: image/jpeg\r\nContent-Length: {}\r\n\r\n", jpeg.len());
        self.buf.extend_from_slice(&jpeg);
        self.buf.extend_from_slice(b"\r\n");
        seen(&self.device, false);
        // The numbers, every second.
        self.window.1 += 1;
        self.window.2 += jpeg.len();
        let w = self.window.0.elapsed().as_secs_f32();
        if w >= 1.0 {
            *STATS.lock() = Stats {
                fps: self.window.1 as f32 / w,
                kbps: self.window.2 as f32 * 8.0 / 1000.0 / w,
                encode_ms: self.shared.make_ms.load(std::sync::atomic::Ordering::Relaxed),
            };
            self.window = (Instant::now(), 0, 0);
        }
        Ok(true)
    }
}

impl Drop for Live {
    fn drop(&mut self) {
        // The phone went: the maker thread stops too.
        self.shared.stop.store(true, std::sync::atomic::Ordering::SeqCst);
        self.shared.ready.notify_all();
    }
}

/// The maker: capture → shrink → (changed?) → compress, at most `every`,
/// leaving only the newest picture for the sender.
fn make_pictures(shared: &Shared, gen: u64, began: Instant, width: u32, every: Duration, quality: u8) {
    let mut last: Option<Vec<u8>> = None;
    let mut last_made = Instant::now() - Duration::from_secs(10);
    // Failures in a row: each waits longer (up to 2 s); 30 in a row ends it.
    let mut fails: u32 = 0;
    let rest = |fails: u32| Duration::from_millis((200u64 << fails.min(4)).min(2000)).max(every);
    loop {
        let replaced = STREAM_GEN.load(std::sync::atomic::Ordering::SeqCst) != gen;
        if shared.stop.load(std::sync::atomic::Ordering::SeqCst) || replaced || allowed().is_err() || began.elapsed() > Duration::from_secs(2 * 3600) {
            shared.stop.store(true, std::sync::atomic::Ordering::SeqCst);
            shared.ready.notify_all();
            return;
        }
        let started = Instant::now();
        let Ok(frame) = crate::capture::capture_all() else {
            fails += 1;
            if fails >= 30 {
                shared.stop.store(true, std::sync::atomic::Ordering::SeqCst);
                shared.ready.notify_all();
                return;
            }
            std::thread::sleep(rest(fails));
            continue;
        };
        // Shrink first; the "has it changed?" check uses the small picture.
        let small = frame.downscaled(width);
        let thumb = small.downscaled(48);
        let sig: Vec<u8> = thumb.bgra.iter().skip(1).step_by(4).copied().collect();
        let same = last.as_ref().is_some_and(|l| l.len() == sig.len() && l.iter().zip(&sig).filter(|(a, b)| a.abs_diff(**b) > 6).count() < 3);
        if same && last_made.elapsed() < Duration::from_secs(3) {
            std::thread::sleep(every.saturating_sub(started.elapsed()).max(Duration::from_millis(40)));
            continue;
        }
        let Ok(jpeg) = small.to_jpeg_fast(quality) else {
            fails += 1;
            if fails >= 30 {
                shared.stop.store(true, std::sync::atomic::Ordering::SeqCst);
                shared.ready.notify_all();
                return;
            }
            std::thread::sleep(rest(fails));
            continue;
        };
        // Only a picture that really made it counts as "the last one".
        last = Some(sig);
        fails = 0;
        shared.make_ms.store(started.elapsed().as_millis() as u32, std::sync::atomic::Ordering::Relaxed);
        last_made = Instant::now();
        // Newest wins: an unsent older picture is simply replaced.
        *shared.slot.lock() = Some(jpeg);
        shared.ready.notify_one();
        std::thread::sleep(every.saturating_sub(started.elapsed()));
    }
}

impl std::io::Read for Live {
    fn read(&mut self, out: &mut [u8]) -> std::io::Result<usize> {
        if self.pos >= self.buf.len() && !self.next_frame()? {
            return Ok(0);
        }
        let n = out.len().min(self.buf.len() - self.pos);
        out[..n].copy_from_slice(&self.buf[self.pos..self.pos + n]);
        self.pos += n;
        Ok(n)
    }
}

/// The PC's "End" on the indicator: the remote is switched off until you
/// switch it on again here.
pub fn end_from_pc() {
    if let Some(store) = crate::state::try_store() {
        let mut s = store.settings();
        s.phone_remote = false;
        store.set_settings(s);
        crate::state::settings_changed_elsewhere();
    }
    let device = ACTIVE.lock().take().map(|(d, _, _)| d).unwrap_or_default();
    audit(&device, "ended from the PC", "");
    announce();
}

/// Tests only: let the live view run without a settings file.
#[cfg(test)]
static TEST_ALLOW: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

fn allowed() -> Result<()> {
    #[cfg(test)]
    if TEST_ALLOW.load(std::sync::atomic::Ordering::SeqCst) {
        return Ok(());
    }
    let on = crate::state::try_store().is_some_and(|s| s.settings().phone_remote);
    if !on {
        bail!("off");
    }
    if crate::uia::screen_locked() {
        bail!("locked");
    }
    Ok(())
}

#[cfg(windows)]
fn cursor() -> (i32, i32) {
    use windows::Win32::Foundation::POINT;
    use windows::Win32::UI::WindowsAndMessaging::GetCursorPos;
    let mut p = POINT::default();
    unsafe {
        let _ = GetCursorPos(&mut p);
    }
    (p.x, p.y)
}

#[cfg(not(windows))]
fn cursor() -> (i32, i32) {
    (0, 0)
}

#[cfg(test)]
mod tests {
    use super::*;

    /// The real live view, read like the phone reads it: how many pictures
    /// arrive in 3 seconds (the PC changes enough — a clock — or every 3 s
    /// one is re-sent anyway). `cargo test --lib live_view_speed -- --ignored --nocapture`
    #[test]
    #[ignore]
    fn live_view_speed() {
        use std::io::Read;
        TEST_ALLOW.store(true, std::sync::atomic::Ordering::SeqCst);
        let mut live = Live::new(960, 15, 55, "test");
        let started = Instant::now();
        let (mut frames, mut bytes, mut buf) = (0u32, 0usize, vec![0u8; 64 * 1024]);
        let mut seen = Vec::new();
        while started.elapsed() < Duration::from_secs(3) {
            let n = live.read(&mut buf).unwrap();
            if n == 0 {
                break;
            }
            bytes += n;
            seen.extend_from_slice(&buf[..n]);
            frames += seen.windows(7).filter(|w| *w == b"--frame").count() as u32;
            let keep = seen.len().saturating_sub(6);
            seen.drain(..keep);
        }
        drop(live);
        TEST_ALLOW.store(false, std::sync::atomic::Ordering::SeqCst);
        eprintln!("live view: {frames} pictures in 3 s ({:.1}/s), {} KB", frames as f32 / 3.0, bytes / 1024);
        assert!(frames >= 1, "at least one picture arrives");
    }

    /// How long each part of one live-view picture takes on this PC.
    /// `cargo test --lib time_a_frame -- --ignored --nocapture`
    #[test]
    #[ignore]
    fn time_a_frame() {
        for _ in 0..6 {
            let t0 = Instant::now();
            let frame = crate::capture::capture_all().unwrap();
            let t1 = Instant::now();
            let _thumb = frame.downscaled(48);
            let t2 = Instant::now();
            let small = frame.downscaled(960);
            let t3 = Instant::now();
            let jpeg = small.to_jpeg(55).unwrap();
            let t4 = Instant::now();
            let fast = small.to_jpeg_fast(55).unwrap();
            let t5 = Instant::now();
            eprintln!("fast jpeg {} ms, {} KB", (t5 - t4).as_millis(), fast.len() / 1024);
            eprintln!(
                "capture {} ms ({}x{}), thumb {} ms, shrink {} ms, jpeg {} ms, {} KB",
                (t1 - t0).as_millis(), frame.width, frame.height, (t2 - t1).as_millis(), (t3 - t2).as_millis(), (t4 - t3).as_millis(), jpeg.len() / 1024
            );
        }
    }

    #[test]
    fn nothing_happens_while_it_is_off() {
        // No store in tests = switched off: every action is refused.
        for op in ["move", "click", "type", "key", "scroll", "stop"] {
            assert!(run(&json!({ "op": op, "dx": 5, "text": "hi", "combo": "enter" }), "phone").is_err(), "{op}");
        }
        assert!(screen(640, "phone").is_err());
        assert!(status("phone").is_err());
    }

    #[test]
    fn only_a_phone_you_allowed() {
        assert!(device(None).is_err());
        assert!(device(Some("short")).is_err());
        assert!(device(Some("0123456789abcdef0123456789abcdef")).is_err());
    }
}
