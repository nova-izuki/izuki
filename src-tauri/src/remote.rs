//! The phone as a remote for this PC: a trackpad, clicks, scrolling, typing,
//! keys and media buttons, and a look at the screen — through the phone's
//! private link (call.rs: a secret address only your paired phone has).
//!
//! Off until you switch it on ("Let my phone control this PC"). Never while
//! the PC is locked. Only these actions, and only keys the PC knows — no
//! commands, no files.

use anyhow::{anyhow, bail, Result};
use serde_json::{json, Value};

/// One thing from the phone: `{ "op": "move", "dx": 12, "dy": -4 }`, and so on.
pub fn run(req: &Value) -> Result<Value> {
    allowed()?;
    let op = req["op"].as_str().unwrap_or("");
    let right = req["button"].as_str() == Some("right");
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
pub fn screen(width: u32) -> Result<Vec<u8>> {
    allowed()?;
    let frame = crate::capture::capture_all()?;
    frame.downscaled(width.clamp(320, 1280)).to_jpeg(55)
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
        for op in ["move", "click", "type", "key", "scroll"] {
            assert!(run(&json!({ "op": op, "dx": 5, "text": "hi", "combo": "enter" })).is_err(), "{op}");
        }
        assert!(screen(640).is_err());
    }
}
