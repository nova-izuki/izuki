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
fn audit(device: &str, op: &str, detail: &str) {
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
pub struct Live {
    /// Which stream this is: a newer one replaces it (one live view at a time).
    gen: u64,
    began: Instant,
    width: u32,
    every: Duration,
    quality: u8,
    device: String,
    buf: Vec<u8>,
    pos: usize,
    last: Option<Vec<u8>>,
    last_sent: Instant,
    window: (Instant, u32, usize),
}

impl Live {
    pub fn new(width: u32, fps: u32, quality: u8, device: &str) -> Live {
        Live {
            gen: STREAM_GEN.fetch_add(1, std::sync::atomic::Ordering::SeqCst) + 1,
            began: Instant::now(),
            width: width.clamp(320, 1600),
            every: Duration::from_millis(1000 / u64::from(fps.clamp(1, 15))),
            quality: quality.clamp(30, 85),
            device: device.to_string(),
            buf: Vec::new(),
            pos: 0,
            last: None,
            last_sent: Instant::now() - Duration::from_secs(10),
            window: (Instant::now(), 0, 0),
        }
    }

    fn next_frame(&mut self) -> std::io::Result<bool> {
        loop {
            // Switched off, the PC locked, a newer live view started, or two
            // hours up (the phone reconnects by itself): this one ends.
            let replaced = STREAM_GEN.load(std::sync::atomic::Ordering::SeqCst) != self.gen;
            if allowed().is_err() || replaced || self.began.elapsed() > Duration::from_secs(2 * 3600) {
                return Ok(false);
            }
            let started = Instant::now();
            let frame = crate::capture::capture_all().map_err(std::io::Error::other)?;
            // Changed since the last picture? (A tiny copy is compared.)
            let thumb = frame.downscaled(48);
            let sig: Vec<u8> = thumb.bgra.iter().skip(1).step_by(4).copied().collect();
            let same = self.last.as_ref().is_some_and(|l| l.len() == sig.len() && l.iter().zip(&sig).filter(|(a, b)| a.abs_diff(**b) > 6).count() < 3);
            if same && self.last_sent.elapsed() < Duration::from_secs(3) {
                std::thread::sleep(self.every.saturating_sub(started.elapsed()).max(Duration::from_millis(40)));
                continue;
            }
            self.last = Some(sig);
            let jpeg = frame.downscaled(self.width).to_jpeg(self.quality).map_err(std::io::Error::other)?;
            let took = started.elapsed();
            self.buf.clear();
            self.pos = 0;
            let _ = write!(self.buf, "--frame\r\nContent-Type: image/jpeg\r\nContent-Length: {}\r\n\r\n", jpeg.len());
            self.buf.extend_from_slice(&jpeg);
            self.buf.extend_from_slice(b"\r\n");
            self.last_sent = Instant::now();
            seen(&self.device, false);
            // The numbers, every second.
            self.window.1 += 1;
            self.window.2 += jpeg.len();
            let w = self.window.0.elapsed().as_secs_f32();
            if w >= 1.0 {
                *STATS.lock() = Stats { fps: self.window.1 as f32 / w, kbps: self.window.2 as f32 * 8.0 / 1000.0 / w, encode_ms: took.as_millis() as u32 };
                self.window = (Instant::now(), 0, 0);
            }
            std::thread::sleep(self.every.saturating_sub(took));
            return Ok(true);
        }
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

fn allowed() -> Result<()> {
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
