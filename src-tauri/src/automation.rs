//! Actually moving the mouse and pressing keys.
//!
//! Two things make this feel different from a macro recorder:
//!   * travel follows a jittered cubic Bézier with an ease-out profile, so the
//!     pointer arrives like a hand rather than teleporting;
//!   * targets are snapped to real UI Automation controls first, so a mark
//!     drawn roughly over a button still lands on the button.

use anyhow::{anyhow, Result};
use enigo::{Axis, Button, Coordinate, Direction, Enigo, Key, Keyboard, Mouse, Settings};
use rand::Rng;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::{Duration, Instant};

use crate::model::{ActionStep, Intent};
use crate::uia;

/// Flipped by the panic hotkey; every loop checks it between steps.
static ABORT: AtomicBool = AtomicBool::new(false);
/// When the last stop was asked for.
static ABORT_AT: parking_lot::Mutex<Option<Instant>> = parking_lot::Mutex::new(None);

pub fn request_abort() {
    *ABORT_AT.lock() = Some(Instant::now());
    ABORT.store(true, Ordering::SeqCst);
}

/// Forget a stop that's older than `age` — for work nobody is watching
/// start (a watcher firing), which shouldn't fail forever because the
/// user once pressed stop, but must still honour a stop pressed just now.
pub fn clear_stale_abort(age: Duration) {
    if ABORT_AT.lock().is_none_or(|at| at.elapsed() > age) {
        clear_abort();
    }
}

pub fn clear_abort() {
    ABORT.store(false, Ordering::SeqCst);
}

pub fn aborted() -> bool {
    ABORT.load(Ordering::SeqCst)
}

fn enigo() -> Result<Enigo> {
    Enigo::new(&Settings::default()).map_err(|e| anyhow!("could not open an input channel: {e:?}"))
}

/// Cubic Bézier through two control points offset perpendicular to the path.
fn bezier(p0: (f64, f64), p1: (f64, f64), p2: (f64, f64), p3: (f64, f64), t: f64) -> (f64, f64) {
    let u = 1.0 - t;
    let (a, b, c, d) = (u * u * u, 3.0 * u * u * t, 3.0 * u * t * t, t * t * t);
    (
        a * p0.0 + b * p1.0 + c * p2.0 + d * p3.0,
        a * p0.1 + b * p1.1 + c * p2.1 + d * p3.1,
    )
}

fn ease_out_quint(t: f64) -> f64 {
    1.0 - (1.0 - t).powi(5)
}

/// Put the cursor exactly on (x, y) — physical pixels anywhere on the
/// virtual desktop, every monitor included. enigo's absolute move scales
/// against the *main* screen only, so a point on a second monitor (or left
/// of the main one) landed on the main screen's edge instead. Windows' own
/// SetCursorPos is exact; a zero-length relative move then sends a real
/// mouse event, so hover effects and drawing apps see the movement.
fn place(e: &mut Enigo, x: i32, y: i32) {
    #[cfg(windows)]
    {
        use windows::Win32::UI::WindowsAndMessaging::SetCursorPos;
        if unsafe { SetCursorPos(x, y) }.is_ok() {
            let _ = e.move_mouse(0, 0, Coordinate::Rel);
            return;
        }
    }
    let _ = e.move_mouse(x, y, Coordinate::Abs);
}

/// Whether the pointer is within a couple of pixels of where it was put.
fn near(got: (i32, i32), want: (i32, i32)) -> bool {
    (got.0 - want.0).abs() <= 2 && (got.1 - want.1).abs() <= 2
}

/// Whether a point is on a real monitor (the virtual desktop can start left
/// of the main screen, so zero is not the edge).
fn on_screen(b: crate::model::Rect, x: i32, y: i32) -> bool {
    x >= b.x && y >= b.y && x < b.x + b.w && y < b.y + b.h
}

fn off_screen_message(b: crate::model::Rect, x: i32, y: i32) -> String {
    format!(
        "target_changed: {},{} is off the screen — it is {}x{} starting at {},{}. Use a numbered target from the controls list, or a point inside the screen",
        x, y, b.w, b.h, b.x, b.y
    )
}

/// The pointer really is at (x, y): put it back once if something moved it,
/// and refuse to continue if it still isn't there. Every glide ends here, so
/// a click, scroll, drag or draw always *starts* where it should. (A stroke's
/// points in between are placed as they come, with the button held, and
/// aren't checked one by one.)
fn ensure_pointer(e: &mut Enigo, x: i32, y: i32) -> Result<()> {
    if near(crate::capture::cursor_pos(), (x, y)) {
        return Ok(());
    }
    place(e, x, y);
    std::thread::sleep(Duration::from_millis(30));
    if near(crate::capture::cursor_pos(), (x, y)) {
        return Ok(());
    }
    Err(anyhow!("target_changed: the pointer couldn't reach {x},{y} (something moved it); take another look"))
}

/// Put the pointer right there at once (Air control's fingertip).
pub fn pointer_to(x: i32, y: i32) {
    if let Ok(mut e) = enigo() {
        place(&mut e, x, y);
    }
}

/// Press or release a mouse button where the pointer is (Air control's pinch:
/// pressed and moved is a drag and drop).
pub fn mouse_button(right: bool, down: bool) -> Result<()> {
    let mut e = enigo()?;
    e.button(if right { Button::Right } else { Button::Left }, if down { Direction::Press } else { Direction::Release })
        .map_err(|err| anyhow!("mouse button failed: {err:?}"))
}

/// Press or let go of the middle mouse button (3D apps orbit with it).
pub fn middle_button(down: bool) -> Result<()> {
    let mut e = enigo()?;
    e.button(Button::Middle, if down { Direction::Press } else { Direction::Release })
        .map_err(|err| anyhow!("middle button failed: {err:?}"))
}

/// Scroll whatever is under the pointer, where it is (no glide).
pub fn scroll_here(amount: i32) -> Result<()> {
    let mut e = enigo()?;
    e.scroll(amount, Axis::Vertical).map_err(|err| anyhow!("scroll failed: {err:?}"))
}

/// Scroll sideways whatever is under the pointer: notches, right when positive.
pub fn scroll_sideways_here(amount: i32) -> Result<()> {
    let mut e = enigo()?;
    e.scroll(amount, Axis::Horizontal).map_err(|err| anyhow!("sideways scroll failed: {err:?}"))
}

/// Glide the real cursor from where it is to (x, y), then prove it arrived.
pub fn glide_to(x: i32, y: i32, duration_ms: u64) -> Result<()> {
    let b = crate::capture::virtual_bounds();
    if !on_screen(b, x, y) {
        return Err(anyhow!("{}", off_screen_message(b, x, y)));
    }
    let mut e = enigo()?;
    let (sx, sy) = e.location().unwrap_or_else(|_| crate::capture::cursor_pos());
    let (sx, sy) = (sx as f64, sy as f64);
    let (tx, ty) = (x as f64, y as f64);

    let dx = tx - sx;
    let dy = ty - sy;
    let dist = (dx * dx + dy * dy).sqrt();

    // Very short hops are not worth animating.
    if dist < 3.0 {
        place(&mut e, x, y);
        return ensure_pointer(&mut e, x, y);
    }

    // Control points bowed off the straight line, sign chosen at random so
    // repeated runs do not trace an identical arc.
    let mut rng = rand::rng();
    let bow = (dist * 0.16).min(90.0) * if rng.random_bool(0.5) { 1.0 } else { -1.0 };
    let (nx, ny) = (-dy / dist, dx / dist);
    let jitter = |r: &mut rand::rngs::ThreadRng| r.random_range(-0.06_f64..0.06);

    let c1 = (
        sx + dx * (0.28 + jitter(&mut rng)) + nx * bow * 0.72,
        sy + dy * (0.28 + jitter(&mut rng)) + ny * bow * 0.72,
    );
    let c2 = (
        sx + dx * (0.72 + jitter(&mut rng)) + nx * bow * 0.42,
        sy + dy * (0.72 + jitter(&mut rng)) + ny * bow * 0.42,
    );

    let duration = Duration::from_millis(duration_ms.clamp(60, 2500));
    // ~120 Hz of updates, capped so long travels do not flood the input queue.
    let steps = ((duration.as_millis() as f64 / 8.0).round() as u32).clamp(6, 160);
    let start = Instant::now();

    for i in 1..=steps {
        if aborted() {
            return Err(anyhow!("stopped"));
        }
        let linear = i as f64 / steps as f64;
        let t = ease_out_quint(linear);
        let (px, py) = bezier((sx, sy), c1, c2, (tx, ty), t);
        place(&mut e, px.round() as i32, py.round() as i32);

        // Sleep against the wall clock so we stay on schedule even if a frame
        // of work ran long.
        let target = duration.mul_f64(linear);
        let elapsed = start.elapsed();
        if target > elapsed {
            std::thread::sleep(target - elapsed);
        }
    }

    place(&mut e, x, y);
    ensure_pointer(&mut e, x, y)
}

fn tiny_pause() {
    std::thread::sleep(Duration::from_millis(rand::rng().random_range(24..52)));
}

pub fn click_at(x: i32, y: i32, button: Button, times: u8, duration_ms: u64) -> Result<()> {
    glide_to(x, y, duration_ms)?;
    click_at_here(button, times)
}

/// The pointer is really on (x, y) before any mouse-down: re-placed once if
/// it isn't (you nudged the mouse, or the app held it back), and an error
/// rather than a click somewhere else if it still can't get there.
fn land_exactly(x: i32, y: i32) -> Result<()> {
    if near(crate::capture::cursor_pos(), (x, y)) {
        return Ok(());
    }
    let mut e = enigo()?;
    ensure_pointer(&mut e, x, y)
}

/// Click something that may only appear once the mouse is over it. Glide
/// there, give hover effects a moment, and — if a control showed up under
/// the pointer — land on its centre. `reveal` is for a control known to be
/// hidden until hover (the waits are longer); `look_again` is for a guessed
/// point that found nothing to snap to before the hover. For a known control
/// (`name`), hovering can shift a page (menus open, rows grow), so look once
/// more on arrival and follow the control to where it now is before pressing.
#[allow(clippy::too_many_arguments)]
fn hover_then_click(
    x: i32,
    y: i32,
    button: Button,
    times: u8,
    duration_ms: u64,
    reveal: bool,
    look_again: bool,
    name: Option<&str>,
) -> Result<()> {
    glide_to(x, y, duration_ms)?;
    let (mut x, mut y) = (x, y);
    if let Some(name) = name.filter(|_| !reveal) {
        if let uia::AtPoint::Moved(nx, ny) = uia::check_target(x, y, name) {
            eprintln!("[hands] \"{name}\" shifted as the pointer arrived — following it");
            glide_to(nx, ny, 90)?;
            (x, y) = (nx, ny);
        }
    }
    if reveal || look_again {
        std::thread::sleep(Duration::from_millis(if reveal { 380 } else { 140 }));
        if aborted() {
            return Err(anyhow!("stopped"));
        }
        if let Some(hit) = uia::snap_to_control(x, y, if reveal { 40 } else { 28 }) {
            if (hit.x, hit.y) != (x, y) {
                glide_to(hit.x, hit.y, 120)?;
                (x, y) = (hit.x, hit.y);
            }
        }
    }
    land_exactly(x, y)?;
    click_at_here(button, times)
}

fn click_at_here(button: Button, times: u8) -> Result<()> {
    // The Task Stage is clickable while a task runs so the person can pause
    // or stop it. Shield it for the instant Izuki's own click is injected.
    let _shield = crate::overlay::shield_pointer();
    tiny_pause();
    let mut e = enigo()?;
    for i in 0..times.max(1) {
        if aborted() { return Err(anyhow!("stopped")); }
        e.button(button, Direction::Click)
            .map_err(|err| anyhow!("click failed: {err:?}"))?;
        if i + 1 < times {
            std::thread::sleep(Duration::from_millis(55));
        }
    }
    Ok(())
}

pub fn drag(from: (i32, i32), to: (i32, i32), duration_ms: u64) -> Result<()> {
    // Check both ends before pressing: a refused destination must not turn
    // into a click where the drag started.
    let b = crate::capture::virtual_bounds();
    for (x, y) in [from, to] {
        if !on_screen(b, x, y) {
            return Err(anyhow!("{}", off_screen_message(b, x, y)));
        }
    }
    // Keep the whole press-travel-release sequence away from the Task Stage.
    let _shield = crate::overlay::shield_pointer();
    glide_to(from.0, from.1, duration_ms / 2)?;
    tiny_pause();
    {
        let mut e = enigo()?;
        e.button(Button::Left, Direction::Press)
            .map_err(|err| anyhow!("could not press the mouse: {err:?}"))?;
    }
    // A short settle before travelling makes drag-and-drop targets register.
    std::thread::sleep(Duration::from_millis(70));
    let travel = glide_to(to.0, to.1, duration_ms.max(240));
    std::thread::sleep(Duration::from_millis(70));
    {
        let mut e = enigo()?;
        e.button(Button::Left, Direction::Release)
            .map_err(|err| anyhow!("could not release the mouse: {err:?}"))?;
    }
    travel
}

/// Draw one continuous line with the button held down, like a hand with a
/// pen: through every point in turn, in small even steps (fast enough to
/// feel live, slow enough for drawing apps to catch every bit of it).
pub fn stroke(points: &[[i32; 2]], move_ms: u64) -> Result<()> {
    let Some(first) = points.first() else { return Ok(()) };
    let b = crate::capture::virtual_bounds();
    if let Some(p) = points.iter().find(|p| !on_screen(b, p[0], p[1])) {
        return Err(anyhow!("{}", off_screen_message(b, p[0], p[1])));
    }
    // The pen is a held drag too: shield the Task Stage until the pen lifts.
    let _shield = crate::overlay::shield_pointer();
    glide_to(first[0], first[1], move_ms / 2)?;
    tiny_pause();
    let mut e = enigo()?;
    e.button(Button::Left, Direction::Press)
        .map_err(|err| anyhow!("could not press the mouse: {err:?}"))?;
    std::thread::sleep(Duration::from_millis(40));
    let mut at = (first[0] as f64, first[1] as f64);
    let mut result = Ok(());
    'outer: for p in &points[1..] {
        let (tx, ty) = (p[0] as f64, p[1] as f64);
        let dist = ((tx - at.0).powi(2) + (ty - at.1).powi(2)).sqrt();
        let n = (dist / 5.0).ceil().max(1.0) as usize;
        for i in 1..=n {
            if aborted() {
                result = Err(anyhow!("stopped"));
                break 'outer;
            }
            let t = i as f64 / n as f64;
            let (x, y) = (at.0 + (tx - at.0) * t, at.1 + (ty - at.1) * t);
            place(&mut e, x.round() as i32, y.round() as i32);
            std::thread::sleep(Duration::from_millis(4));
        }
        at = (tx, ty);
    }
    std::thread::sleep(Duration::from_millis(30));
    // Always let go — even when stopped — or the button stays held down.
    e.button(Button::Left, Direction::Release)
        .map_err(|err| anyhow!("could not release the mouse: {err:?}"))?;
    result
}

pub fn type_text(text: &str) -> Result<()> {
    // A paragraph or more: pasted in one go — exact, instant, and nothing
    // half-typed if you touch the PC meanwhile. Your clipboard is put back.
    // Only when the clipboard holds nothing but plain text, which Izuki can
    // put back exactly: a picture, a file or formatted text you copied is
    // never lost — then it's typed instead.
    if text.chars().count() > 120 && clipboard_is_plain_text() {
        if let Ok(before) = read_clipboard() {
            if write_clipboard(text).is_ok() {
                std::thread::sleep(Duration::from_millis(40));
                if aborted() {
                    let _ = write_clipboard(&before);
                    return Err(anyhow!("stopped"));
                }
                let pasted = press_key("ctrl+v");
                std::thread::sleep(Duration::from_millis(300));
                // Put yours back — unless you copied something new meanwhile.
                if read_clipboard().ok().as_deref() == Some(text) {
                    let _ = write_clipboard(&before);
                }
                // A failed paste may still have landed: never type it a second time.
                return pasted.map_err(|e| anyhow!("{} pasting the text didn't go through ({e}) — it may have; take a fresh look before trying again", crate::ext::UNCONFIRMED));
            }
        }
    }
    let mut e = enigo()?;
    // Whole characters at a time (cutting bytes split “quotes”, dashes and
    // emoji into garbage), in chunks so Stop still lands mid-paragraph.
    let chars: Vec<char> = text.chars().collect();
    for chunk in chars.chunks(40) {
        if aborted() {
            return Err(anyhow!("stopped"));
        }
        let part: String = chunk.iter().collect();
        e.text(&part)
            .map_err(|err| anyhow!("typing failed: {err:?}"))?;
        std::thread::sleep(Duration::from_millis(12));
    }
    Ok(())
}

/// Press a key or a chord: "enter", "win", "ctrl+l", "ctrl+shift+esc",
/// "alt+f4", "win+d". Modifiers go down in order, the last key is tapped,
/// then the modifiers come back up in reverse. A chord of only modifiers
/// ("win", "ctrl+alt") taps the last one — "win" alone opens Start.
/// When Izuki itself last pressed Esc (a step closing a menu), so the Esc
/// watcher (hotkey.rs) doesn't take it for the user asking to stop.
static OWN_ESC: parking_lot::Mutex<Option<std::time::Instant>> = parking_lot::Mutex::new(None);

/// Izuki pressed Esc itself within the last moment.
pub fn pressed_esc_just_now() -> bool {
    OWN_ESC.lock().is_some_and(|t| t.elapsed() < Duration::from_millis(700))
}

pub fn press_key(name: &str) -> Result<()> {
    if name.split('+').next_back().is_some_and(|k| matches!(k.trim().to_ascii_lowercase().as_str(), "esc" | "escape")) {
        *OWN_ESC.lock() = Some(std::time::Instant::now());
    }
    let parts: Vec<&str> = name
        .split('+')
        .map(str::trim)
        .filter(|p| !p.is_empty())
        .collect();
    let Some((last, mods)) = parts.split_last() else {
        return Err(anyhow!("empty key"));
    };

    let mut held = Vec::new();
    for m in mods {
        held.push(parse_modifier(m).ok_or_else(|| anyhow!("unknown modifier \"{m}\" in {name}"))?);
    }
    let key = parse_modifier(last)
        .or_else(|| parse_key(last))
        .ok_or_else(|| anyhow!("unknown key: {name}"))?;

    let mut e = enigo()?;
    for (i, m) in held.iter().enumerate() {
        if let Err(err) = e.key(*m, Direction::Press) {
            // Never leave an earlier modifier stuck down because a later one
            // failed to press.
            for done in held[..i].iter().rev() {
                e.key(*done, Direction::Release).ok();
            }
            return Err(anyhow!("key press failed: {err:?}"));
        }
        std::thread::sleep(Duration::from_millis(25));
    }
    let tapped = e.key(key, Direction::Click);
    for m in held.iter().rev() {
        e.key(*m, Direction::Release).ok();
    }
    tapped.map_err(|err| anyhow!("key press failed: {err:?}"))
}

/// Hold one key down, or let it go — Air control's game controls (an arrow
/// held while the hand leans that way). Only single keys, no combinations.
pub fn key_hold(name: &str, down: bool) -> Result<()> {
    let key = parse_modifier(name).or_else(|| parse_key(name)).ok_or_else(|| anyhow!("unknown key: {name}"))?;
    let mut e = enigo()?;
    // Keys held for one window (the game) are let go when another window
    // comes to the front — they never carry over into a different app.
    let front = crate::uia::foreground_hwnd();
    {
        let mut h = HELD.lock();
        if down && h.0.is_some() && h.0 != front {
            for (k, _) in h.1.drain(..) {
                let _ = e.key(k, Direction::Release);
            }
        }
        if down {
            h.0 = front;
            if !h.1.iter().any(|(_, n)| n == name) {
                h.1.push((key, name.to_string()));
            }
        } else {
            h.1.retain(|(_, n)| n != name);
        }
    }
    e.key(key, if down { Direction::Press } else { Direction::Release })
        .map_err(|err| anyhow!("key {} failed: {err:?}", if down { "down" } else { "up" }))
}

/// Whether [`key_hold`] is holding any key (never waits on the lock).
pub fn keys_held() -> bool {
    HELD.try_lock().is_some_and(|h| !h.1.is_empty())
}

/// Let go of every key [`key_hold`] is holding (Air's emergency stop). A key
/// is forgotten only once its release was sent; the lock is never waited on
/// for long (this also runs from the crash handler).
pub fn release_held_keys() {
    use std::io::Write;
    // Never panics on a failed log line: this also runs from the crash handler.
    let log = |line: String| {
        let _ = writeln!(std::io::stderr(), "{line}");
    };
    let Some(mut held) = HELD.try_lock_for(std::time::Duration::from_millis(200)) else {
        log("[air] couldn't let go of held keys: busy".into());
        return;
    };
    if held.1.is_empty() {
        return;
    }
    let mut e = match enigo() {
        Ok(e) => e,
        Err(err) => {
            log(format!("[air] couldn't let go of held keys: {err}"));
            return;
        }
    };
    held.1.retain(|(k, name)| match e.key(*k, Direction::Release) {
        Ok(()) => false,
        Err(err) => {
            log(format!("[air] couldn't let go of {name}: {err:?}"));
            true
        }
    });
}

/// Keys held by [`key_hold`], and the window they were held for.
static HELD: parking_lot::Mutex<(Option<isize>, Vec<(Key, String)>)> = parking_lot::Mutex::new((None, Vec::new()));

/// Whether `press_key` understands this key or combination ("ctrl+t").
pub fn key_is_known(name: &str) -> bool {
    let parts: Vec<&str> = name.split('+').map(str::trim).filter(|p| !p.is_empty()).collect();
    let Some((last, mods)) = parts.split_last() else { return false };
    mods.iter().all(|m| parse_modifier(m).is_some()) && (parse_modifier(last).is_some() || parse_key(last).is_some())
}

fn parse_modifier(name: &str) -> Option<Key> {
    Some(match name.trim().to_ascii_lowercase().as_str() {
        "ctrl" | "control" | "ctl" => Key::Control,
        "shift" => Key::Shift,
        "alt" | "option" => Key::Alt,
        "win" | "windows" | "super" | "meta" | "cmd" | "command" | "start" => Key::Meta,
        _ => return None,
    })
}

/// A scroll step's direction: `key` may say "left", "right", "up" or
/// "down" (the amount's size is then the notches); otherwise the amount's
/// sign decides — positive down, negative up.
fn scroll_direction(key: Option<&str>, amount: i32) -> (i32, Axis) {
    let n = amount.abs().max(1);
    match key.map(|k| k.trim().to_ascii_lowercase()).as_deref() {
        Some("left") => (-n, Axis::Horizontal),
        Some("right") => (n, Axis::Horizontal),
        Some("up") => (-n, Axis::Vertical),
        Some("down") => (n, Axis::Vertical),
        _ => (amount, Axis::Vertical),
    }
}

pub fn scroll_at(x: i32, y: i32, amount: i32, duration_ms: u64) -> Result<()> {
    scroll_axis(x, y, amount, Axis::Vertical, duration_ms)
}

/// Scroll whatever is under (x, y) — the page, a side panel, a list, a code
/// box — `amount` notches: down/right when positive, up/left when negative.
/// Only the pane under the mouse moves, exactly as with a real wheel.
pub fn scroll_axis(x: i32, y: i32, amount: i32, axis: Axis, duration_ms: u64) -> Result<()> {
    glide_to(x, y, duration_ms)?;
    let mut e = enigo()?;
    // Break the scroll into notches so pages with momentum keep up.
    let step = if amount > 0 { 1 } else { -1 };
    for _ in 0..amount.abs().min(40) {
        if aborted() {
            return Err(anyhow!("stopped"));
        }
        e.scroll(step, axis).map_err(|err| anyhow!("scroll failed: {err:?}"))?;
        std::thread::sleep(Duration::from_millis(18));
    }
    Ok(())
}

fn parse_key(name: &str) -> Option<Key> {
    let n = name.trim().to_ascii_lowercase();
    Some(match n.as_str() {
        "enter" | "return" => Key::Return,
        "tab" => Key::Tab,
        "escape" | "esc" => Key::Escape,
        "space" | "spacebar" => Key::Space,
        "capslock" | "caps" => Key::CapsLock,
        "printscreen" | "prtsc" | "print" => Key::PrintScr,
        "backspace" => Key::Backspace,
        "delete" | "del" => Key::Delete,
        "up" => Key::UpArrow,
        "down" => Key::DownArrow,
        "left" => Key::LeftArrow,
        "right" => Key::RightArrow,
        "home" => Key::Home,
        // The number pad's own keys (DAWs use them for record and loop).
        "num*" | "multiply" => Key::Multiply,
        "num/" | "divide" => Key::Divide,
        "num." | "decimal" => Key::Decimal,
        "num0" => Key::Numpad0,
        "end" => Key::End,
        "pageup" => Key::PageUp,
        "pagedown" => Key::PageDown,
        "f1" => Key::F1,
        "f2" => Key::F2,
        "f3" => Key::F3,
        "f4" => Key::F4,
        "f5" => Key::F5,
        "f6" => Key::F6,
        "f7" => Key::F7,
        "f8" => Key::F8,
        "f9" => Key::F9,
        "f10" => Key::F10,
        "f11" => Key::F11,
        "f12" => Key::F12,
        // The keyboard's media keys: every player listens to these (YouTube
        // in the browser, Spotify, the Films app), whichever window is in front.
        "volumeup" | "volume_up" => Key::VolumeUp,
        "volumedown" | "volume_down" => Key::VolumeDown,
        "volumemute" | "volume_mute" => Key::VolumeMute,
        "playpause" | "play_pause" | "mediaplaypause" => Key::MediaPlayPause,
        "nexttrack" | "next_track" | "medianexttrack" => Key::MediaNextTrack,
        "prevtrack" | "prev_track" | "previoustrack" | "mediaprevtrack" => Key::MediaPrevTrack,
        other => {
            let mut chars = other.chars();
            let c = chars.next()?;
            if chars.next().is_some() {
                return None;
            }
            Key::Unicode(c)
        }
    })
}

/// What a step is doing, in a few words, for the Island.
fn doing_line(step: &ActionStep) -> String {
    let name = step.snapped_to.as_deref().map(|n| n.split(" → ").next().unwrap_or(n).trim()).filter(|n| !n.is_empty());
    let short = |s: &str| s.chars().take(40).collect::<String>();
    match step.action {
        Intent::Click | Intent::Auto | Intent::DoubleClick => name.map(|n| format!("Clicking “{}”…", short(n))).unwrap_or_else(|| "Clicking…".into()),
        Intent::RightClick => "Opening the menu…".into(),
        Intent::Type => name.map(|n| format!("Typing in “{}”…", short(n))).unwrap_or_else(|| "Typing…".into()),
        Intent::Key => format!("Pressing {}…", step.key.as_deref().unwrap_or("a key")),
        Intent::Scroll => "Scrolling…".into(),
        Intent::OpenApp => format!("Opening {}…", step.text_to_type.as_deref().map(short).unwrap_or_else(|| "the app".into())),
        Intent::OpenUrl => "Opening the page…".into(),
        Intent::Watch => "Watching for the change…".into(),
        Intent::Search => "Searching…".into(),
        Intent::PlayYoutube => "Finding it on YouTube…".into(),
        Intent::Do => format!("Doing it directly: {}…", step.text_to_type.as_deref().map(short).unwrap_or_default()),
        Intent::Draw | Intent::Point => "Showing you…".into(),
        _ => "Working on it…".into(),
    }
}

/// What a step did, for "What Izuki did" (actlog.rs). Never what was typed,
/// only how much; nothing for steps that only show or wait.
fn done_line(step: &ActionStep) -> Option<String> {
    let name = step.snapped_to.as_deref().map(|n| n.split(" → ").next().unwrap_or(n).trim()).filter(|n| !n.is_empty());
    let short = |s: &str| s.chars().take(48).collect::<String>();
    let what = match step.action {
        Intent::Click | Intent::Auto => name.map_or_else(|| "Clicked".to_string(), |n| format!("Clicked “{}”", short(n))),
        Intent::DoubleClick => name.map_or_else(|| "Double-clicked".to_string(), |n| format!("Double-clicked “{}”", short(n))),
        Intent::RightClick => "Opened a right-click menu".into(),
        Intent::Type => {
            let n = step.text_to_type.as_deref().map_or(0, |t| t.chars().count());
            let into = name.map(|b| format!(" into “{}”", short(b))).unwrap_or_default();
            format!("Typed {n} character{}{into}", if n == 1 { "" } else { "s" })
        }
        Intent::Key => format!("Pressed {}", step.key.as_deref().unwrap_or("a key")),
        Intent::Scroll => "Scrolled".into(),
        Intent::Drag | Intent::Stroke => "Dragged".into(),
        Intent::Copy => "Copied text".into(),
        Intent::OpenApp => format!("Opened {}", step.text_to_type.as_deref().map(short).unwrap_or_else(|| "an app".into())),
        Intent::OpenUrl => {
            let url = step.text_to_type.as_deref().unwrap_or_default();
            let host = reqwest::Url::parse(url).ok().and_then(|u| u.host_str().map(|h| h.trim_start_matches("www.").to_string()));
            format!("Opened {}", host.unwrap_or_else(|| "a web page".into()))
        }
        Intent::Search => "Searched the web".into(),
        Intent::PlayYoutube => "Played a video on YouTube".into(),
        Intent::Do => format!("Did “{}” directly", step.text_to_type.as_deref().map(short).unwrap_or_default()),
        _ => return None,
    };
    // Where: the app's name from its title ("Inbox - Gmail - Google Chrome" → "Google Chrome").
    let title = crate::uia::foreground_title();
    let tail = [" - ", " — ", " | "].iter().filter_map(|sep| title.rfind(sep).map(|i| i + sep.len())).max().unwrap_or(0);
    let app = title[tail..].trim().to_string();
    let opened = matches!(step.action, Intent::OpenApp | Intent::OpenUrl | Intent::Search | Intent::PlayYoutube | Intent::Do);
    // Working in Izuki's own tab or window behind yours: the app in front isn't where it happened.
    let elsewhere = crate::ext::in_tab_mode() || crate::uia::working_behind().is_some();
    Some(if app.is_empty() || opened || elsewhere || app.eq_ignore_ascii_case("izuki") { what } else { format!("{what} in {}", short(&app)) })
}

/// Run a single planned step. `magnetic` snaps the point onto a real control
/// first; `dry_run` animates nothing at the OS level. Every step that really
/// ran goes on "What Izuki did".
pub fn execute(step: &ActionStep, move_ms: u64, magnetic: bool, dry_run: bool) -> Result<String> {
    let done = execute_step(step, move_ms, magnetic, dry_run);
    if !dry_run && done.is_ok() {
        if let Some(line) = done_line(step) {
            crate::actlog::record("screen", &line);
        }
    }
    done
}

fn execute_step(step: &ActionStep, move_ms: u64, magnetic: bool, dry_run: bool) -> Result<String> {
    // Never act on the lock screen: a keystroke there goes into the PIN or
    // password box.
    if crate::uia::screen_locked() {
        request_abort();
        return Err(anyhow!("your PC is locked"));
    }
    if aborted() {
        return Err(anyhow!("stopped"));
    }
    if !dry_run {
        crate::state::trace(doing_line(step));
    }
    // Izuki's own abilities touch no screen: the same whether Izuki is
    // working in front, behind your app or in its own tab (direct.rs).
    if step.action == Intent::Do {
        if dry_run {
            return Ok(format!("[dry run] do {}", step.text_to_type.as_deref().unwrap_or_default()));
        }
        return crate::direct::run(step.text_to_type.as_deref().unwrap_or_default());
    }
    // You're using another app: work in Izuki's window behind it, through
    // Windows, without touching your mouse or keyboard.
    if !dry_run && crate::ext::pinned() {
        // You may have switched tabs since the look: check right before acting.
        // Was in front then and isn't now — nothing happens; a fresh look first.
        let was_hidden = crate::ext::in_tab_mode();
        if crate::ext::check_tab_hidden() {
            if !was_hidden {
                return Err(anyhow!("target_changed: you switched to another tab since the look — taking a fresh look in Izuki's own tab"));
            }
            return execute_in_tab(step);
        }
    }
    if !dry_run {
        if let Some(win) = uia::working_behind() {
            return execute_behind(step, win);
        }
    }

    let (mut x, mut y) = (step.x, step.y);
    let mut snapped = None;
    // Precision mode is deliberately stricter than Mouse mode: it must first
    // identify a real Windows control at the proposed answer/button. A raw
    // pixel fallback is useful for canvases in Mouse mode, but it is exactly
    // how a shifted multiple-choice answer turns into the wrong click.
    let precision = crate::state::try_store().is_some_and(|s| s.settings().control_style == "precision");
    let clicking = matches!(step.action, Intent::Click | Intent::Auto | Intent::DoubleClick | Intent::RightClick);
    let targeted_type = step.action == Intent::Type && (step.target.is_some() || step.x != 0 || step.y != 0);
    // A web page element the browser extension listed: click or type right
    // inside the page — exact, and no mouse at all. First, in every mode:
    // these have no Windows control id, so Precision's check below refused
    // them, and Windows names a link "Next" where the list says
    // "Next → https://…", so the safety check could never match either.
    if !dry_run && (matches!(step.action, Intent::Click | Intent::Auto) || targeted_type) {
        if let Some(dom) = step.target.and_then(crate::ext::dom_id_for) {
            let done = if targeted_type {
                crate::ext::type_into(&dom, step.text_to_type.as_deref().unwrap_or_default()).map(|_| "typed into")
            } else {
                crate::ext::click(&dom).map(|_| "clicked")
            };
            match done {
                Ok(what) => return Ok(format!("{what} page element {} directly (browser extension)", step.target.unwrap_or(0))),
                // It may have gone through: never do it a second time with the mouse.
                Err(e) if e.to_string().starts_with(crate::ext::UNCONFIRMED) => return Err(e),
                Err(e) => eprintln!("[ext] couldn't act inside the page ({e}) — using the screen instead"),
            }
        }
    }
    // Windows drops an ordinary app's clicks and keys in an app running as
    // administrator (its own protection). Say so plainly, instead of acting
    // for nothing and leaving the next look to wonder why nothing changed.
    // (Copy triple-clicks at its spot first.)
    let at_point = matches!(step.action, Intent::Click | Intent::Auto | Intent::DoubleClick | Intent::RightClick | Intent::Drag | Intent::Hover | Intent::Scroll | Intent::Stroke | Intent::Copy) || targeted_type;
    if !dry_run && (at_point || matches!(step.action, Intent::Type | Intent::Key)) {
        let at = match step.action {
            Intent::Stroke => step.path.as_ref().and_then(|p| p.first()).map(|p| (p[0], p[1])),
            // A scroll with no spot turns the wheel wherever the pointer is.
            Intent::Scroll if x <= 0 && y <= 0 => Some(crate::capture::cursor_pos()),
            _ => (at_point && (x != 0 || y != 0)).then_some((x, y)),
        };
        if let Some(app) = crate::air::blocked_target(at) {
            return Err(anyhow!(
                "{app} is running as administrator, so Windows doesn't let Izuki click or type in it. Do this part yourself, or run Izuki as administrator (right-click Izuki → Run as administrator) and ask again."
            ));
        }
    }
    // Precision must select an element from the parsed screen. Snapping a
    // guessed answer onto a nearby radio button only verifies the guess.
    // (A label read on the screen itself — FL Studio's own buttons, which
    // Windows can't list — is a real target too, for a click. Typing still
    // needs a real field: a label isn't the box beside it.)
    let read_here = clicking && crate::sharpeye::read_on_screen(step.x, step.y);
    if precision && !dry_run && (clicking || targeted_type) && step.grounding.is_none() && !read_here {
        return Err(anyhow!("target_changed: Precision needs a numbered target from the current screen parser; choose its target ID, not guessed coordinates"));
    }
    if !dry_run { uia::invalidate_controls(); }

    // A point that isn't on any monitor.
    //
    // Windows clamps the pointer to the screen edge, so the move "worked"
    // and then `land_exactly` found the cursor somewhere else and reported
    // that something had moved it — true, but useless to the model that
    // asked for a spot off the side of the screen. Say what's actually
    // wrong, with the real size, so the next look can aim properly.
    if clicking && !dry_run {
        let b = crate::capture::virtual_bounds();
        let inside = step.x >= b.x && step.y >= b.y && step.x < b.x + b.w && step.y < b.y + b.h;
        if !inside {
            return Err(anyhow!("{}", off_screen_message(b, step.x, step.y)));
        }
    }

    // A step already pinned to a real control (by id) is exact — only guessed
    // pixels need the magnetic snap.
    let pointless = matches!(
        step.action,
        Intent::Watch | Intent::OpenApp | Intent::OpenUrl | Intent::Search | Intent::PlayYoutube | Intent::Draw | Intent::Do
    );

    // Further down the page: the app scrolls exactly to it first, and the
    // click lands where it ended up — no blind wheel turns.
    if step.scroll_first && !dry_run {
        if let Some(name) = step.snapped_to.as_deref().map(|n| n.split(" → ").next().unwrap_or(n)) {
            match uia::scroll_into_view(name) {
                Some((nx, ny)) => {
                    x = nx;
                    y = ny;
                }
                None => {
                    // The app couldn't: turn the wheel a few notches instead.
                    let (cx, cy) = crate::capture::cursor_pos();
                    scroll_at(cx, cy, -5, 120)?;
                    std::thread::sleep(Duration::from_millis(350));
                }
            }
        }
    }
    if magnetic && step.snapped_to.is_none() && !pointless && !matches!(step.action, Intent::Key | Intent::Type) {
        if let Some(hit) = uia::snap_to_control(x, y, if precision { 48 } else { 64 }) {
            x = hit.x;
            y = hit.y;
            snapped = Some(hit.name);
        }
    }

    // Safe hands: right before a click on a known control, make sure it's
    // really there and can be pressed. A few milliseconds when all is well.
    let verified_name = step.snapped_to.as_deref().or(snapped.as_deref());
    if clicking && !dry_run && !step.hover_first && step.grounding.is_none() {
        if verified_name.is_none() && precision && !read_here {
            return Err(anyhow!("target_changed: Precision mode could not identify a real control at this point; take another look or use Mouse mode for a canvas-only target"));
        }
        if let Some(listed) = verified_name {
            // A page link is listed as "Next → https://…"; Windows calls it "Next".
            let name = listed.split(" → ").next().unwrap_or(listed);
            let mut right_here = false;
            match uia::check_target(x, y, name) {
                // The page shifted since the screenshot (an ad or picture loaded).
                uia::AtPoint::Moved(nx, ny) => {
                    eprintln!("[hands] \"{name}\" moved since the look — clicking where it is now");
                    x = nx;
                    y = ny;
                }
                uia::AtPoint::Disabled => return Err(anyhow!("disabled: \"{name}\" is greyed out, so clicking it does nothing yet")),
                uia::AtPoint::Right => right_here = true,
                uia::AtPoint::Unknown => return Err(anyhow!("target_changed: I can't verify \"{name}\" here anymore; take another look before clicking")),
            }
            // Another window or pop-up on top: press it directly, no mouse.
            // (A taskbar button is *in* the taskbar: the button itself is
            // right under the point, so the taskbar isn't covering anything.)
            let cover = uia::covered_at(x, y).filter(|c| !(right_here && c == "the taskbar"));
            if let Some(cover) = cover {
                if step.action == Intent::Click {
                    match uia::press_named_checked(name) {
                        Ok(true) => {
                            eprintln!("[hands] \"{name}\" was under {cover} — pressed it directly");
                            return Ok(format!("pressed \"{name}\" directly (it was behind {cover})"));
                        }
                        Ok(false) => {}
                        // The press itself errored: it may still have acted, so
                        // this is not "never pressed" (a Send stays remembered).
                        Err(e) => {
                            return Err(anyhow!(
                                "{}pressing \"{name}\" directly may have worked ({e}) — take a fresh look before trying it again",
                                crate::ext::UNCONFIRMED
                            ))
                        }
                    }
                }
                // Another app's window is in the way (the person's editor, say):
                // bring the window being worked in to the front and look again
                // — never move the mouse onto something that's covered.
                let raised = uia::held_window().is_some_and(|w| uia::raise_window(w));
                if raised {
                    std::thread::sleep(Duration::from_millis(250));
                }
                match uia::covered_at(x, y) {
                    None if raised => eprintln!("[hands] brought the window forward — \"{name}\" is clear now"),
                    Some(still) => return Err(anyhow!("covered: {still} is on top of \"{name}\"")),
                    None => return Err(anyhow!("covered: {cover} is on top of \"{name}\"")),
                }
                // The window moved to the front: check everything again before acting.
                if uia::screen_locked() {
                    request_abort();
                    return Err(anyhow!("your PC is locked"));
                }
                match uia::check_target(x, y, name) {
                    uia::AtPoint::Moved(nx, ny) => {
                        x = nx;
                        y = ny;
                        if let Some(cover) = uia::covered_at(x, y) {
                            return Err(anyhow!("covered: {cover} is on top of \"{name}\""));
                        }
                    }
                    uia::AtPoint::Disabled => return Err(anyhow!("disabled: \"{name}\" is greyed out, so clicking it does nothing yet")),
                    uia::AtPoint::Right => {}
                    uia::AtPoint::Unknown => return Err(anyhow!("target_changed: I can't verify \"{name}\" here anymore; take another look before clicking")),
                }
            }
        }
    }

    let label = snapped
        .clone()
        .unwrap_or_else(|| format!("{},{}", x, y));

    if dry_run {
        return Ok(format!("[dry run] {} at {}", step.action.as_str(), label));
    }

    if let Some(identity) = step.grounding.as_ref().filter(|_| clicking || targeted_type) {
        if step.hover_first {
            glide_to(x, y, move_ms)?;
            std::thread::sleep(Duration::from_millis(180));
        }
        if aborted() { return Err(anyhow!("stopped")); }
        // Do it, don't touch it: a real control is pressed through Windows
        // itself — exact, and your mouse stays where you left it. In Jarvis
        // mode always; otherwise where pressing is exactly a click (a
        // button, a link, a tab, a tick box — not a list item, which a press
        // would open).
        let double = step.action == Intent::DoubleClick;
        if matches!(step.action, Intent::Click | Intent::Auto | Intent::DoubleClick)
            && uia::clicks_directly(&identity.kind, double)
            && uia::click_grounded(identity, double).map_err(|e| {
                // It may have acted — unless it failed before acting (greyed
                // out, gone or moved, covered, not in front).
                let why = e.to_string();
                if ["disabled:", "target_changed:", "covered:", "needs_front:"].iter().any(|p| why.starts_with(p)) {
                    e
                } else {
                    anyhow!("{}{e} — take a fresh look before trying it again", crate::ext::UNCONFIRMED)
                }
            })?
        {
            return Ok(format!("{} parsed control {} directly (no mouse)", if double { "opened" } else { "activated" }, step.target.unwrap_or(0)));
        }
        if precision && matches!(step.action, Intent::Click | Intent::Auto) && uia::invoke_grounded(identity)? {
            return Ok(format!("activated parsed control {} directly (no mouse)", step.target.unwrap_or(0)));
        }
        // A one-line box (a search box, a name, an address) is filled
        // straight through Windows: no keys, the mouse stays put.
        if targeted_type {
            if let Some(text) = &step.text_to_type {
                if uia::fill_grounded(identity, text)? {
                    return Ok(format!("typed into parsed control {} directly (no mouse, no keys)", step.target.unwrap_or(0)));
                }
            }
        }
        // Typing straight into the box too: in Jarvis mode into any box whose
        // text can be read; otherwise only into an empty box (setting it
        // replaces what's there, where a click and typing would have added
        // to it). A box whose text can't be read is clicked and typed into.
        let now = uia::grounded_value(identity);
        if targeted_type && ((precision && now.is_some()) || now.is_some_and(|v| v.is_empty())) {
            if let Some(text) = &step.text_to_type {
                match uia::set_text_grounded(identity, text) {
                    Ok(true) => return Ok(format!("typed into parsed control {} directly (no mouse)", step.target.unwrap_or(0))),
                    Ok(false) => {}
                    // It may have gone in: never type it a second time by keyboard.
                    Err(e) => {
                        return Err(anyhow!(
                            "{}setting the text directly may have worked ({e}) — take a fresh look before typing it again",
                            crate::ext::UNCONFIRMED
                        ))
                    }
                }
            }
        }
        let point = uia::grounded_point(identity)?;
        glide_to(point.0, point.1, move_ms)?;
        // Hover/layout effects happen during travel: verify the same identity
        // at its current position before sending any mouse-down.
        let final_point = uia::grounded_point(identity)?;
        if final_point != point {
            return Err(anyhow!("target_changed: the control moved during pointer travel; parse the screen again"));
        }
        if aborted() { return Err(anyhow!("stopped")); }
        land_exactly(point.0, point.1)?;
        let button = if step.action == Intent::RightClick { Button::Right } else { Button::Left };
        click_at_here(button, if step.action == Intent::DoubleClick { 2 } else { 1 })?;
        if targeted_type {
            std::thread::sleep(Duration::from_millis(90));
            if let Some(text) = &step.text_to_type {
                type_text(text)?;
                if let Some(shown) = check_typed(text)? {
                    return Err(anyhow!("typed_mismatch: the focused field shows \"{shown}\" instead of \"{text}\" — look again before claiming it was typed"));
                }
            }
        }
        return Ok(format!("{} on parsed control {}", step.action.as_str(), step.target.unwrap_or(0)));
    }

    // Do it, don't touch it: a named button, link or tab under the point is
    // pressed through Windows itself; the pointer is only for what can't be
    // pressed that way (a canvas, a game, a list item, an app that draws its
    // own buttons).
    // A right-click menu: the control takes the keyboard focus and its menu
    // opens from the keyboard (shift+F10) — the pointer stays put.
    if step.action == Intent::RightClick && !step.hover_first {
        if let Some(name) = verified_name.map(|n| n.split(" → ").next().unwrap_or(n).to_string()) {
            if uia::focus_at(x, y, &name) {
                press_key("shift+f10")?;
                return Ok(format!("opened the menu of \"{name}\" directly (no mouse)"));
            }
        }
    }
    if matches!(step.action, Intent::Click | Intent::Auto | Intent::DoubleClick) && !step.hover_first {
        let double = step.action == Intent::DoubleClick;
        if let Some(name) = verified_name.map(|n| n.split(" → ").next().unwrap_or(n).to_string()) {
            match uia::click_at_direct(x, y, &name, double) {
                Ok(true) => {
                    // A press on YouTube is usually "play this": watch for its ads.
                    if uia::foreground_title().to_lowercase().contains("youtube") {
                        crate::youtube::watch_ads(crate::youtube::AD_WATCH);
                    }
                    return Ok(format!("pressed \"{name}\" directly (no mouse)"));
                }
                Ok(false) => {}
                Err(e) if e.to_string().starts_with("disabled:") => return Err(e),
                // It may have acted: never press it again another way.
                Err(e) => {
                    return Err(anyhow!(
                        "{}pressing \"{name}\" directly may have worked ({e}) — take a fresh look before trying it again",
                        crate::ext::UNCONFIRMED
                    ))
                }
            }
        }
    }

    // Hover-only controls (a tab's ✕) need the pointer over them before
    // they exist on screen; a guessed point with nothing under it gets one
    // more look once the hover has had its effect.
    let reveal = step.hover_first;
    let look_again = magnetic && step.snapped_to.is_none() && snapped.is_none();
    let known = verified_name.filter(|_| clicking);
    match step.action {
        Intent::Click | Intent::Auto => hover_then_click(x, y, Button::Left, 1, move_ms, reveal, look_again, known)?,
        Intent::DoubleClick => hover_then_click(x, y, Button::Left, 2, move_ms, reveal, look_again, known)?,
        Intent::RightClick => hover_then_click(x, y, Button::Right, 1, move_ms, reveal, look_again, known)?,
        Intent::Hover => glide_to(x, y, move_ms)?,
        // Only the on-screen hand goes there and circles it (the overlay
        // draws it off the HAND event) — the real mouse stays put. Held a
        // moment so there's time to look.
        Intent::Point => std::thread::sleep(Duration::from_millis(1800)),
        // Only the overlay draws it (off the HAND event), like a teacher's
        // pen — a beat for the stroke to land before the next one.
        Intent::Draw => {
            std::thread::sleep(Duration::from_millis(900));
            return Ok(format!("drew a {} on screen", step.shape.as_deref().unwrap_or("mark")));
        }
        // Instant skills: straight through Windows, no clicking around.
        // Patiently: each thing once, waited for as long as this PC needs,
        // and in the browser tab it's already using (patience.rs).
        Intent::OpenApp => {
            let what = step.text_to_type.as_deref().unwrap_or_default();
            let before = crate::uia::foreground_title();
            let said = crate::patience::open_app(what)?;
            return Ok(check_opened(said, &before, what));
        }
        Intent::OpenUrl => {
            let url = step.text_to_type.as_deref().unwrap_or_default();
            let before = crate::uia::foreground_title();
            let said = crate::patience::open_url(url)?;
            if url.contains("youtube.com") || url.contains("youtu.be") {
                crate::youtube::watch_ads(crate::youtube::AD_WATCH);
            }
            return Ok(check_opened(said, &before, url));
        }
        Intent::PlayYoutube => {
            let what = step.text_to_type.as_deref().unwrap_or_default();
            return match crate::youtube::play(what)? {
                Some(title) => Ok(format!("started playing \"{title}\" on YouTube (ads are skipped by themselves)")),
                None if aborted() => Err(anyhow!("stopped")),
                None => Err(anyhow!("play_not_started: YouTube opened results for \"{what}\" but didn't start a video; look at the results and choose one")),
            };
        }
        Intent::Search => {
            let q = step.text_to_type.as_deref().unwrap_or_default();
            return crate::patience::search(q);
        }
        // (Handled first, above: it touches no screen.)
        Intent::Do => return crate::direct::run(step.text_to_type.as_deref().unwrap_or_default()),
        Intent::Drag => {
            let to = (step.x2.unwrap_or(x), step.y2.unwrap_or(y));
            // A slider is set to that spot through Windows — no dragging
            // (both ends on a screen first, like any drag).
            let b = crate::capture::virtual_bounds();
            let on_screen = |(px, py): (i32, i32)| px >= b.x && py >= b.y && px < b.x + b.w && py < b.y + b.h;
            if !on_screen((x, y)) || !on_screen(to) {
                let (ox, oy) = if on_screen((x, y)) { to } else { (x, y) };
                return Err(anyhow!("{}", off_screen_message(b, ox, oy)));
            }
            if uia::slide_at(x, y, to.0, to.1)? {
                return Ok(format!("moved the slider at {label} directly (no mouse)"));
            }
            drag((x, y), to, move_ms)?;
        }
        Intent::Stroke => {
            let path = step.path.clone().unwrap_or_default();
            if path.len() < 2 {
                return Err(anyhow!("a stroke needs at least two points"));
            }
            stroke(&path, move_ms)?;
            return Ok(format!("drew a line through {} points", path.len()));
        }
        Intent::Type => {
            // A one-line box there is filled straight through Windows — no
            // keys, the mouse stays put (a document or a web page is typed
            // into as before).
            if x != 0 || y != 0 {
                if let Some(text) = &step.text_to_type {
                    if uia::fill_at(x, y, text)? {
                        return Ok(format!("typed into the box at {label} directly (no mouse, no keys)"));
                    }
                }
            }
            // Focus the field first unless the model gave no coordinates.
            if x != 0 || y != 0 {
                click_at(x, y, Button::Left, 1, move_ms)?;
                std::thread::sleep(Duration::from_millis(90));
            }
            // Never into a password box.
            //
            // The AI is told never to type a password, and Izuki already
            // refuses to read one. Typing had only the instruction behind
            // it, and an instruction is not a guarantee when the model
            // driving the keyboard is a free one. The box is asked what it
            // is, right after it takes the keyboard.
            if crate::uia::focused_is_password() {
                return Err(anyhow!(
                    "password_box: that's a password box — Izuki never types into one. Ask the user to type it themselves, then carry on"
                ));
            }
            if let Some(text) = &step.text_to_type {
                type_text(text)?;
                if let Some(shown) = check_typed(text)? {
                    return Err(anyhow!("typed_mismatch: the box shows \"{shown}\" instead of \"{text}\" — do not report this as typed; take another look and try the field again"));
                }
            }
        }
        Intent::Key => {
            if let Some(k) = &step.key {
                // Look at the app in front before the keys, so the shortcut's
                // effect can be told from nothing happening. Only for keys that
                // will be judged: Enter, Tab or the arrows cost no capture.
                let judged = shortcut_worth_checking(k);
                let before = judged.then(|| (front_look(), crate::uia::open_windows(40)));
                press_key(k)?;
                if let Some((look, windows)) = before {
                    // Unconfirmed, not failed: the batch stops for a fresh
                    // look, which tells it whether the key worked (a toggle
                    // pressed twice would undo itself).
                    if let Some(snag) = check_shortcut(k, look, &windows)? {
                        return Err(anyhow!("{}pressed {k}, but {snag}", crate::ext::UNCONFIRMED));
                    }
                }
            }
        }
        Intent::Scroll => {
            // No point given: scroll wherever the cursor already is, rather
            // than dragging it to the top-left corner of the screen.
            let (sx, sy) = if x <= 0 && y <= 0 { crate::capture::cursor_pos() } else { (x, y) };
            let (amount, axis) = scroll_direction(step.key.as_deref(), step.scroll_amount.unwrap_or(3));
            // The pane there scrolled straight through Windows — no wheel,
            // the mouse stays put; the wheel only if that didn't move it.
            if uia::scroll_direct(sx, sy, amount, matches!(axis, Axis::Horizontal)).unwrap_or(false) {
                return Ok(format!("scrolled at {label} directly (no mouse)"));
            }
            // Remember the spot, then check it really moved afterwards.
            let before = crate::capture::capture(watch_region(sx, sy)).ok();
            scroll_axis(sx, sy, amount, axis, move_ms)?;
            if let Some(snag) = check_scrolled(before, sx, sy)? {
                return Err(anyhow!("{}scrolled at {label}, but {snag}", crate::ext::UNCONFIRMED));
            }
        }
        Intent::Copy => {
            click_at(x, y, Button::Left, 3, move_ms)?;
            std::thread::sleep(Duration::from_millis(60));
            copy_selection()?;
        }
        Intent::Watch => return Ok("handed to the watcher".into()),
    }

    // A click on YouTube is usually "play this": watch for its ads.
    if matches!(step.action, Intent::Click | Intent::Auto | Intent::DoubleClick)
        && uia::foreground_title().to_lowercase().contains("youtube")
    {
        crate::youtube::watch_ads(crate::youtube::AD_WATCH);
    }

    Ok(format!("{} at {}", step.action.as_str(), label))
}

/// One step in Izuki's own tab while you're on another one: only through the
/// page itself (the browser extension). The screen shows *your* tab, so the
/// mouse, the keyboard and Windows' own buttons would all land there.
fn execute_in_tab(step: &ActionStep) -> Result<String> {
    let dom = step.target.and_then(crate::ext::dom_id_for);
    match step.action {
        Intent::Click | Intent::Auto => match dom {
            Some(d) => crate::ext::click(&d).map(|_| format!("clicked page element {} in Izuki's tab", step.target.unwrap_or(0))),
            None => Err(anyhow!("needs_front: that click isn't on a numbered page element, and you're on another tab — it waits until you're back on Izuki's tab")),
        },
        Intent::Type => match dom {
            Some(d) => crate::ext::type_into(&d, step.text_to_type.as_deref().unwrap_or_default()).map(|_| "typed into the page in Izuki's tab".to_string()),
            None => Err(anyhow!("needs_front: that box isn't a numbered page element, and you're on another tab — it waits until you're back on Izuki's tab")),
        },
        Intent::Scroll => {
            let (amount, axis) = scroll_direction(step.key.as_deref(), step.scroll_amount.unwrap_or(3));
            if matches!(axis, Axis::Horizontal) {
                return Err(anyhow!("needs_front: sideways scrolling waits until you're back on Izuki's tab"));
            }
            // Same as the wheel: positive is down, at most 40 notches.
            crate::ext::scroll(amount.clamp(-40, 40) * 120).map(|_| "scrolled the page in Izuki's tab".to_string())
        }
        // Marks and pointing would land on your tab: skipped there.
        Intent::Point | Intent::Draw | Intent::Stroke | Intent::Hover | Intent::Watch => Ok("skipped (you're on another tab)".into()),
        _ => Err(anyhow!("needs_front: that step needs the screen, and you're on another tab — it waits until you're back on Izuki's tab")),
    }
}

/// One step in a window behind the one you're using. Steps that need the
/// real mouse or keyboard come back as `needs_front:` — the caller waits for
/// you to pause before bringing the window forward.
fn execute_behind(step: &ActionStep, win: isize) -> Result<String> {
    // A page link is listed as "Next → https://…"; Windows calls it "Next".
    let name = step.snapped_to.as_deref().map(|n| n.split(" → ").next().unwrap_or(n));
    let identity = step.grounding.as_ref();
    let (x, y) = (step.x, step.y);
    // A web page element: the browser extension acts right inside the page,
    // whether or not the browser is in front.
    if let Some(dom) = step.target.and_then(crate::ext::dom_id_for) {
        let done = match step.action {
            Intent::Click | Intent::Auto => Some(crate::ext::click(&dom).map(|_| "clicked the page element in the background".to_string())),
            Intent::Type => Some(
                crate::ext::type_into(&dom, step.text_to_type.as_deref().unwrap_or_default())
                    .map(|_| "typed into the page in the background".to_string()),
            ),
            _ => None,
        };
        match done {
            Some(Ok(done)) => return Ok(done),
            // It may have gone through: never do it again through Windows.
            Some(Err(e)) if e.to_string().starts_with(crate::ext::UNCONFIRMED) => return Err(e),
            _ => {}
        }
    }
    let done = match step.action {
        Intent::Click | Intent::Auto => uia::act_behind(win, uia::Behind::Press { name, identity, x, y })?,
        Intent::Type if identity.is_some() || name.is_some() || x != 0 || y != 0 => {
            let text = step.text_to_type.as_deref().unwrap_or_default();
            uia::act_behind(win, uia::Behind::Type { name, identity, x, y, text })?
        }
        Intent::Scroll => {
            let (amount, axis) = scroll_direction(step.key.as_deref(), step.scroll_amount.unwrap_or(3));
            uia::act_behind(win, uia::Behind::Scroll { x, y, amount, horizontal: matches!(axis, Axis::Horizontal) })?
        }
        // Only the overlay shows these — nothing on the window itself.
        Intent::Point => {
            std::thread::sleep(Duration::from_millis(1800));
            Some("pointed it out".into())
        }
        Intent::Draw => {
            std::thread::sleep(Duration::from_millis(900));
            Some(format!("drew a {} on screen", step.shape.as_deref().unwrap_or("mark")))
        }
        Intent::Watch => Some("handed to the watcher".into()),
        _ => None,
    };
    done.ok_or_else(|| anyhow!("needs_front: this step needs the real mouse or keyboard"))
}

/// Whether `shown` (what a box holds) has `typed` in it, ignoring case and spacing.
fn has_typed(shown: &str, typed: &str) -> bool {
    let n = |s: &str| s.split_whitespace().collect::<Vec<_>>().join(" ").to_lowercase();
    n(shown).contains(&n(typed))
}

/// Read the box back after typing: autocorrect, a dropped letter or a slow
/// page can leave something else there. If so — and the box holds little
/// more than this text, so nothing of the user's is lost — type it again once.
/// `Some(what the box shows)` if it's still wrong afterwards.
fn check_typed(typed: &str) -> Result<Option<String>> {
    if typed.chars().count() > 200 {
        return Ok(None);
    }
    std::thread::sleep(Duration::from_millis(120));
    // A browser's address bar quietly finishes what you type from your
    // history ("blackboard" → blackboard.com/trust-center) and Enter goes
    // there. Delete drops that greyed-in part, so Enter goes to exactly what
    // was typed — the wrong-site bug from the San Jac Blackboard test.
    let address_bar = uia::focused_is_address_bar();
    if address_bar {
        press_key("delete")?;
        std::thread::sleep(Duration::from_millis(60));
    }
    let Some(shown) = uia::focused_value() else { return Ok(None) };
    if has_typed(&shown, typed) {
        return Ok(None);
    }
    // A long box (a document, an email body) is left alone: select-all
    // there would wipe the user's own writing.
    if shown.chars().count() > typed.chars().count() * 2 + 20 {
        return Ok(Some(shown.chars().take(80).collect()));
    }
    eprintln!("[hands] the box shows \"{}\" instead of what was typed — typing it again", shown.chars().take(40).collect::<String>());
    press_key("ctrl+a")?;
    type_text(typed)?;
    if address_bar {
        std::thread::sleep(Duration::from_millis(120));
        press_key("delete")?;
    }
    std::thread::sleep(Duration::from_millis(120));
    Ok(uia::focused_value().filter(|again| !has_typed(again, typed)).map(|s| s.chars().take(80).collect()))
}

// --- Result checks: act, then look that it did what it should -------------
//
// `check_typed` reads a box back after typing. These do the same for the
// other screen actions: decide what should have changed, look, and return a
// note when it didn't. A note is a snag to report, never a hard error — the
// action may still have half-happened, and a fresh look decides what's next.

/// A region's mean per-channel change (0–100, from `Frame::difference`) that
/// counts as the pane really having scrolled. A still picture drifts by well
/// under this; a page that moved changes far more.
const SCROLL_MOVED: f32 = 2.0;
/// A smaller change in the whole window in front still means a shortcut did
/// something (a word turned bold, a line was undone): only part of it moved,
/// so the average is small even when it's real.
const WINDOW_CHANGED: f32 = 0.5;

/// A small box around a point, clamped to the screen, to watch for movement
/// after a scroll.
fn watch_region(x: i32, y: i32) -> crate::model::Rect {
    let r = crate::model::Rect { x: x - 90, y: y - 70, w: 180, h: 140 };
    r.clip_to(&crate::capture::virtual_bounds()).unwrap_or(r)
}

/// Nothing under the pointer moved: the list is at the end already, or that
/// spot doesn't scroll.
fn scrolled_snag(diff: f32) -> Option<String> {
    (diff < SCROLL_MOVED)
        .then(|| "nothing under the pointer moved — it may be at the end already, or that spot doesn't scroll".to_string())
}

/// After a scroll: did the box around the point move? `before` is a snapshot
/// of it taken just before the wheel turned (the mouse cursor isn't in a
/// screen grab, so it doesn't count as movement). `Some(note)` when nothing
/// did. A still picture is left alone — only a frozen region is a snag.
fn check_scrolled(before: Option<crate::capture::Frame>, x: i32, y: i32) -> Result<Option<String>> {
    let Some(before) = before else { return Ok(None) };
    std::thread::sleep(Duration::from_millis(140));
    let Ok(after) = crate::capture::capture(watch_region(x, y)) else { return Ok(None) };
    Ok(scrolled_snag(before.difference(&after)))
}

/// patience's own message already names a snag (it didn't open, it was already
/// up, it's slow, or it stayed in the same tab where a look can't tell): then
/// the result check leaves it alone rather than piling a second note on.
fn open_already_flagged(message: &str) -> bool {
    let m = message.to_lowercase();
    m.contains("same tab")
        || m.contains("taking a while")
        || m.contains("was already")
        || m.contains("already opened")
        || m.contains("already searched")
        || m.contains("set \"wait\"")
}

/// After opening an app or page: did a new window come to the front, or one
/// named like what we asked for appear? `None` when something did; a note to
/// add when nothing seems to have.
fn opened_snag(before_front: &str, after_front: &str, windows: &[String], target: &str) -> Option<String> {
    // The window in front changed — something came up.
    if !after_front.trim().is_empty() && !after_front.eq_ignore_ascii_case(before_front) {
        return None;
    }
    // Or a window named like what we asked for is open now.
    let needle = target.trim().to_lowercase();
    if !needle.is_empty() && windows.iter().any(|w| w.to_lowercase().contains(&needle)) {
        return None;
    }
    Some("nothing new came to the front — it may still be loading, or it didn't open; set \"wait\" and look again".to_string())
}

/// The result check for OpenApp/OpenUrl: patience opens the thing and waits;
/// this takes one more look and adds a snag to its message when nothing really
/// came up.
fn check_opened(message: String, before_front: &str, target: &str) -> String {
    if open_already_flagged(&message) {
        return message;
    }
    match opened_snag(before_front, &crate::uia::foreground_title(), &crate::uia::open_windows(40), target) {
        Some(snag) => format!("{message}, but {snag}"),
        None => message,
    }
}

/// Keys and combinations that act off-screen — the volume, the media keys, a
/// copy or a cut — so "nothing changed on screen" is no sign they failed. The
/// shortcut check skips these rather than cry wolf.
fn shortcut_acts_offscreen(combo: &str) -> bool {
    let c = canonical_combo(combo);
    let last = c.rsplit('+').next().unwrap_or("");
    const SILENT: &[&str] = &[
        "volumeup", "volume_up", "volumedown", "volume_down", "volumemute", "volume_mute", "mute",
        "playpause", "play_pause", "mediaplaypause", "nexttrack", "next_track", "medianexttrack",
        "prevtrack", "prev_track", "previoustrack", "mediaprevtrack",
        "capslock", "caps", "numlock", "scrolllock", "printscreen", "prtsc", "print",
    ];
    SILENT.contains(&last) || matches!(c.as_str(), "ctrl+c" | "ctrl+x" | "ctrl+insert")
}

/// "Control + C", "ctl+c" and "Ctrl+C" are one shortcut: parts trimmed and
/// lower-cased, modifiers by what they mean (as `press_key` reads them).
fn canonical_combo(combo: &str) -> String {
    combo
        .split('+')
        .map(|part| {
            let p = part.trim().to_lowercase();
            match parse_modifier(&p) {
                Some(Key::Control) => "ctrl".to_string(),
                Some(Key::Shift) => "shift".to_string(),
                Some(Key::Alt) => "alt".to_string(),
                Some(Key::Meta) => "win".to_string(),
                _ => p.replace([' ', '-'], "_"),
            }
        })
        .collect::<Vec<_>>()
        .join("+")
}

/// Only modifier combinations are judged by the screen. A lone Tab, arrow or
/// Enter moves too little to tell "it did nothing" from "it worked", and the
/// off-screen keys can't be judged by the screen at all.
fn shortcut_worth_checking(combo: &str) -> bool {
    canonical_combo(combo).contains('+') && !shortcut_acts_offscreen(combo)
}

/// Any sign a shortcut did something: the window in front changed, a new one
/// (a dialog, a menu) appeared, or the app in front redrew.
fn shortcut_changed(
    before_title: &str,
    after_title: &str,
    window_diff: Option<f32>,
    before_windows: &[String],
    after_windows: &[String],
) -> bool {
    if !after_title.eq_ignore_ascii_case(before_title) {
        return true;
    }
    if after_windows.iter().any(|w| !before_windows.contains(w)) {
        return true;
    }
    window_diff.is_some_and(|d| d >= WINDOW_CHANGED)
}

/// Nothing changed after a shortcut. It may still have worked (bold on one
/// word, an undo, is a small change), and pressing a toggle twice undoes it:
/// so the note asks for a fresh look, never a blind repeat.
fn shortcut_snag(changed: bool) -> Option<String> {
    (!changed).then(|| {
        "it doesn't look like anything changed — it may still have worked (a small change is easy to miss), or the wrong window had focus. Take a fresh look before pressing it again; pressing a toggle twice undoes it"
            .to_string()
    })
}

/// A look at the app in front: its title and a picture of it, so a shortcut's
/// before and after can be compared.
fn front_look() -> (String, Option<crate::capture::Frame>) {
    let title = crate::uia::foreground_title();
    #[cfg(windows)]
    let shot = crate::uia::foreground_hwnd().and_then(|h| crate::capture::capture_window(h).ok().map(|(_, f)| f));
    #[cfg(not(windows))]
    let shot = None;
    (title, shot)
}

/// After a keyboard shortcut: did anything happen? `before` is a `front_look`
/// and `before_windows` the open windows, both from just before the keys.
/// `Some(note)` when nothing seems to have — skipped for keys that act
/// off-screen (volume, media, copy), where the screen is no evidence.
fn check_shortcut(combo: &str, before: (String, Option<crate::capture::Frame>), before_windows: &[String]) -> Result<Option<String>> {
    if !shortcut_worth_checking(combo) {
        return Ok(None);
    }
    std::thread::sleep(Duration::from_millis(140));
    let (after_title, after_shot) = front_look();
    let after_windows = crate::uia::open_windows(40);
    let window_diff = match (&before.1, &after_shot) {
        (Some(a), Some(b)) => Some(a.difference(b)),
        _ => None,
    };
    let changed = shortcut_changed(&before.0, &after_title, window_diff, before_windows, &after_windows);
    Ok(shortcut_snag(changed))
}

/// Ctrl+C, then read what landed on the clipboard.
pub fn copy_selection() -> Result<String> {
    {
        let mut e = enigo()?;
        e.key(Key::Control, Direction::Press).ok();
        e.key(Key::Unicode('c'), Direction::Click).ok();
        e.key(Key::Control, Direction::Release).ok();
    }
    std::thread::sleep(Duration::from_millis(120));
    read_clipboard()
}

/// The text selected in the app in front — and the clipboard put back as it
/// was. Empty when nothing is selected (Ctrl+C on nothing used to return
/// whatever was copied before, as if it were the selection).
pub fn selected_text() -> Result<String> {
    let before = read_clipboard().unwrap_or_default();
    let marker = format!("\u{2063}izuki-{}", rand::random::<u32>());
    let _ = write_clipboard(&marker);
    let got = copy_selection().unwrap_or_default();
    let _ = write_clipboard(&before);
    Ok(if got == marker { String::new() } else { got })
}

/// The clipboard holds nothing but text, which `read_clipboard` can put back
/// exactly. A copied picture, file or formatted text (a browser copy carries
/// HTML too) would lose its other parts, so Izuki types instead of pasting.
#[cfg(windows)]
fn clipboard_is_plain_text() -> bool {
    use clipboard_win::formats::{CF_LOCALE, CF_OEMTEXT, CF_TEXT, CF_UNICODETEXT};
    let Ok(_open) = clipboard_win::Clipboard::new_attempts(10) else { return false };
    let mut any = false;
    for format in clipboard_win::EnumFormats::new() {
        if ![CF_UNICODETEXT, CF_TEXT, CF_OEMTEXT, CF_LOCALE].contains(&format) {
            return false;
        }
        any = true;
    }
    any
}

#[cfg(not(windows))]
fn clipboard_is_plain_text() -> bool {
    false
}

pub fn read_clipboard() -> Result<String> {
    let mut cb = arboard::Clipboard::new().map_err(|e| anyhow!("clipboard unavailable: {e}"))?;
    cb.get_text().map_err(|e| anyhow!("clipboard is not text: {e}"))
}

pub fn write_clipboard(text: &str) -> Result<()> {
    let mut cb = arboard::Clipboard::new().map_err(|e| anyhow!("clipboard unavailable: {e}"))?;
    cb.set_text(text.to_string())
        .map_err(|e| anyhow!("could not write to the clipboard: {e}"))
}

/// Ask Windows to report physical pixels, so drawn coordinates and real
/// coordinates agree on high-DPI displays.
pub fn make_dpi_aware() {
    #[cfg(windows)]
    {
        let _ = enigo::set_dpi_awareness();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn scrolls_go_the_way_they_are_asked() {
        assert_eq!(scroll_direction(Some("right"), 4), (4, Axis::Horizontal));
        assert_eq!(scroll_direction(Some("Left"), 4), (-4, Axis::Horizontal));
        assert_eq!(scroll_direction(Some("up"), 3), (-3, Axis::Vertical));
        assert_eq!(scroll_direction(Some("down"), -3), (3, Axis::Vertical));
        assert_eq!(scroll_direction(None, -5), (-5, Axis::Vertical));
        assert_eq!(scroll_direction(Some("pagedown"), 2), (2, Axis::Vertical));
    }

    #[test]
    fn typed_text_is_checked_against_what_the_box_shows() {
        assert!(has_typed("Hello world", "hello"));
        assert!(has_typed("A  B", "a b"));
        assert!(!has_typed("Hello", "goodbye"));
        assert!(!has_typed("", "hello"));
    }

    #[test]
    fn pointer_landing_tolerates_a_two_pixel_near_miss_only() {
        assert!(near((100, 100), (102, 98)));
        assert!(!near((100, 100), (103, 100)));
    }

    #[test]
    fn points_off_the_screen_are_recognised_before_moving() {
        let b = crate::model::Rect { x: -1920, y: 0, w: 3840, h: 1080 };
        assert!(on_screen(b, -1920, 0));
        assert!(on_screen(b, 1919, 1079));
        assert!(!on_screen(b, -1921, 0));
        assert!(!on_screen(b, 1920, 0));
        assert!(!on_screen(b, 0, 1080));
    }

    #[test]
    fn windows_key_and_modifiers_are_understood() {
        assert_eq!(parse_modifier("win"), Some(Key::Meta));
        assert_eq!(parse_modifier("Windows"), Some(Key::Meta));
        assert_eq!(parse_modifier("ctrl"), Some(Key::Control));
        assert_eq!(parse_modifier("alt"), Some(Key::Alt));
        assert_eq!(parse_modifier("shift"), Some(Key::Shift));
        assert_eq!(parse_modifier("enter"), None);
    }

    #[test]
    fn plain_keys_are_understood() {
        assert_eq!(parse_key("enter"), Some(Key::Return));
        assert_eq!(parse_key("F4"), Some(Key::F4));
        assert_eq!(parse_key("l"), Some(Key::Unicode('l')));
        assert_eq!(parse_key("notakey"), None);
    }

    #[test]
    fn a_scroll_that_moved_nothing_is_a_snag() {
        // A still region barely drifts; a pane that scrolled changes a lot.
        assert!(scrolled_snag(0.1).is_some());
        assert!(scrolled_snag(SCROLL_MOVED - 0.01).is_some());
        assert!(scrolled_snag(SCROLL_MOVED).is_none());
        assert!(scrolled_snag(14.0).is_none());
        // The box around a point stays on the screen.
        let b = crate::capture::virtual_bounds();
        let w = watch_region(b.x + b.w / 2, b.y + b.h / 2);
        assert!(w.w > 0 && w.h > 0 && b.intersect(&w).is_some());
    }

    #[test]
    fn an_opened_window_is_seen_and_nothing_is_a_snag() {
        let wins = vec!["Untitled - Notepad".to_string(), "Izuki".to_string()];
        // The front changed — it opened.
        assert!(opened_snag("Desktop", "Untitled - Notepad", &wins, "notepad").is_none());
        // A window named like it is open, even if the front didn't change.
        assert!(opened_snag("Desktop", "Desktop", &wins, "notepad").is_none());
        // Nothing new, nothing named like it: a snag.
        assert!(opened_snag("Desktop", "Desktop", &wins, "calculator").is_some());
        // An empty front doesn't count as a change.
        assert!(opened_snag("Desktop", "", &wins, "calculator").is_some());
        // patience already flagged it, or it stayed in one tab: left alone.
        assert!(open_already_flagged("Spotify was already started 5s ago — didn't open another copy."));
        assert!(open_already_flagged("started X, but it's taking a while to open on this PC"));
        assert!(open_already_flagged("went to example.com in the same tab"));
        assert!(!open_already_flagged("opened Notepad"));
        // The message is passed through untouched when patience flagged it.
        assert_eq!(check_opened("went to x.com in the same tab".into(), "before", "x.com"), "went to x.com in the same tab");
    }

    #[test]
    fn a_shortcut_that_changed_nothing_is_a_snag_unless_it_acts_offscreen() {
        // Keys that act off-screen are never judged by the screen.
        assert!(shortcut_acts_offscreen("volumeup"));
        assert!(shortcut_acts_offscreen("ctrl+c"));
        assert!(shortcut_acts_offscreen("CapsLock"));
        assert!(shortcut_acts_offscreen("medianexttrack"));
        assert!(!shortcut_acts_offscreen("ctrl+s"));
        assert!(!shortcut_acts_offscreen("alt+tab"));
        // Spaced and aliased spellings are the same keys.
        assert!(shortcut_acts_offscreen("Ctrl + C"));
        assert!(shortcut_acts_offscreen("control+c"));
        assert!(shortcut_acts_offscreen(" volume_up "));
        assert!(!shortcut_worth_checking(" enter "));
        assert!(shortcut_worth_checking("Control + S"));
        // A new window, a new title, or a redrawn window all count as "it did something".
        let none: Vec<String> = vec![];
        let one = vec!["Save As".to_string()];
        assert!(shortcut_changed("Doc", "Doc", None, &none, &one)); // a dialog appeared
        assert!(shortcut_changed("Doc", "Doc *", None, &none, &none)); // the title changed
        assert!(shortcut_changed("Doc", "Doc", Some(3.0), &none, &none)); // the window redrew
        assert!(!shortcut_changed("Doc", "Doc", Some(0.0), &none, &none)); // nothing at all
        assert!(!shortcut_changed("Doc", "doc", Some(WINDOW_CHANGED - 0.01), &none, &none)); // case-only, too small
        assert_eq!(shortcut_snag(true), None);
        assert!(shortcut_snag(false).is_some());
    }
}

#[cfg(all(test, windows))]
mod stroke_tests {
    /// Draws a smiley in Paint with the real mouse, then saves a screenshot:
    /// `IZK_OUT=smile.jpg cargo test draws_in_paint -- --ignored`. Moves the
    /// mouse for a few seconds.
    #[test]
    #[ignore]
    fn draws_in_paint() {
        let mut paint = std::process::Command::new("mspaint").spawn().unwrap();
        std::thread::sleep(std::time::Duration::from_secs(4));
        let b = crate::capture::virtual_bounds();
        let (cx, cy, r) = (b.x + b.w / 2, b.y + b.h / 2 + 40, 150.0_f64);
        let ring = |r: f64, from: f64, to: f64, n: usize, ox: i32, oy: i32| -> Vec<[i32; 2]> {
            (0..=n)
                .map(|i| {
                    let a = from + (to - from) * i as f64 / n as f64;
                    [ox + (r * a.cos()).round() as i32, oy + (r * a.sin()).round() as i32]
                })
                .collect()
        };
        let tau = std::f64::consts::TAU;
        super::stroke(&ring(r, 0.0, tau, 24, cx, cy), 400).unwrap(); // face
        super::stroke(&ring(15.0, 0.0, tau, 10, cx - 55, cy - 40), 300).unwrap(); // eyes
        super::stroke(&ring(15.0, 0.0, tau, 10, cx + 55, cy - 40), 300).unwrap();
        super::stroke(&ring(85.0, 0.35, 2.8, 14, cx, cy), 300).unwrap(); // smile
        std::thread::sleep(std::time::Duration::from_millis(500));
        let f = crate::capture::capture_all().unwrap().downscaled(960);
        std::fs::write(std::env::var("IZK_OUT").unwrap(), f.to_jpeg(80).unwrap()).unwrap();
        let _ = paint.kill();
        let _ = std::process::Command::new("taskkill").args(["/IM", "mspaint.exe", "/F"]).output();
    }
}

#[cfg(all(test, windows))]
mod placing_tests {
    /// The cursor lands on the exact pixel asked for (nudged 5 px, then put back).
    /// Run on its own: cargo test --lib lands_on_the_exact_pixel -- --ignored
    #[test]
    #[ignore]
    fn lands_on_the_exact_pixel() {
        let (x0, y0) = crate::capture::cursor_pos();
        let mut e = super::enigo().expect("mouse");
        super::place(&mut e, x0 + 5, y0 + 5);
        std::thread::sleep(std::time::Duration::from_millis(40));
        let got = crate::capture::cursor_pos();
        super::place(&mut e, x0, y0);
        assert_eq!(got, (x0 + 5, y0 + 5), "the cursor didn't land where it was put");
    }
}

#[cfg(all(test, windows))]
mod action_bench {
    //! Smart Screen Actions, timed on a real window: act → check → recover,
    //! through the same `execute` an AI plan's steps go through (default
    //! 320 ms hand travel, magnetic hand on). It moves the real mouse and
    //! types, so it runs only by hand, and only when nobody has touched the
    //! PC for two minutes:
    //!   cargo test --lib action_bench -- --ignored --nocapture --test-threads=1
    //! The window is a throwaway PowerShell form in a process of its own
    //! (Izuki never acts on its own windows). It writes every click and the
    //! name box's text to a temp file, and that's what each result is checked
    //! against, never Izuki's own report. Nothing else is clicked or typed
    //! into: the mouse moves only where that form is really on top, and
    //! typing happens only while it's the window in front.
    use crate::model::ActionStep;
    use std::path::{Path, PathBuf};
    use std::time::{Duration, Instant};
    use windows::core::PCWSTR;
    use windows::Win32::Foundation::{HWND, POINT, RECT};
    use windows::Win32::UI::WindowsAndMessaging::{FindWindowW, GetAncestor, GetForegroundWindow, GetWindowRect, IsWindowVisible, WindowFromPoint, GA_ROOT};

    const FORM: &str = r#"param([string]$Log, [string]$Mode = 'fixture', [int]$X = 0, [int]$Y = 0, [int]$W = 0, [int]$H = 0, [string]$Title = '')
Add-Type -TypeDefinition 'using System.Runtime.InteropServices; public static class Dpi { [DllImport("user32.dll")] public static extern bool SetProcessDPIAware(); }'
[Dpi]::SetProcessDPIAware() | Out-Null
Add-Type -AssemblyName System.Windows.Forms, System.Drawing
$say = { param($what) Add-Content -LiteralPath $Log -Value $what }
$f = New-Object System.Windows.Forms.Form
$f.StartPosition = 'Manual'
if ($Mode -eq 'cover') {
  $f.Text = if ($Title) { $Title } else { 'Izuki bench cover' }; $f.FormBorderStyle = 'None'; $f.TopMost = $true; $f.ShowInTaskbar = $false
  $f.Location = New-Object System.Drawing.Point($X, $Y); $f.Size = New-Object System.Drawing.Size($W, $H); $f.BackColor = 'DarkSlateBlue'
  $f.Add_Click({ & $say 'cover' })
} else {
  $f.Text = 'Izuki action bench'; $f.TopMost = $true
  $f.Location = New-Object System.Drawing.Point(160, 160); $f.Size = New-Object System.Drawing.Size(700, 420)
  $f.Font = New-Object System.Drawing.Font('Segoe UI', 12)
  function Add-Button($text, $x, $y) { $b = New-Object System.Windows.Forms.Button; $b.Text = $text; $b.Location = New-Object System.Drawing.Point($x, $y); $b.Size = New-Object System.Drawing.Size(220, 56); $f.Controls.Add($b); $b }
  $save = Add-Button 'Save bench' 30 30; $save.Add_Click({ & $say 'save' })
  $moving = Add-Button 'Moving bench' 30 110; $moving.Add_Click({ & $say 'moving' })
  $locked = Add-Button 'Locked bench' 30 190; $locked.Enabled = $false; $locked.Add_Click({ & $say 'locked' })
  $label = New-Object System.Windows.Forms.Label; $label.Text = 'Bench name'; $label.AutoSize = $true; $label.Location = New-Object System.Drawing.Point(300, 30); $f.Controls.Add($label)
  $box = New-Object System.Windows.Forms.TextBox; $box.AccessibleName = 'Bench name'; $box.Location = New-Object System.Drawing.Point(300, 70); $box.Size = New-Object System.Drawing.Size(340, 40); $f.Controls.Add($box)
  $box.Add_TextChanged({ Set-Content -LiteralPath "$Log.text" -Value $box.Text -NoNewline })
  # A long list to scroll: its top line, written out whenever it changes, is
  # the ground truth for whether a scroll really moved it.
  $list = New-Object System.Windows.Forms.ListBox; $list.AccessibleName = 'Bench list'
  $list.Location = New-Object System.Drawing.Point(300, 130); $list.Size = New-Object System.Drawing.Size(340, 230)
  1..60 | ForEach-Object { [void]$list.Items.Add(("Line {0:D2}" -f $_)) }
  $f.Controls.Add($list)
  $script:topWas = -1
  # A shortcut that renames the window, so a result check can see the change.
  $f.KeyPreview = $true
  $f.Add_KeyDown({ param($s, $e) if ($e.Control -and $e.Shift -and $e.KeyCode -eq [System.Windows.Forms.Keys]::B) { $f.Text = 'Izuki action bench OK'; & $say 'shortcut'; $e.Handled = $true } })
  # The test's commands: "move" shifts a button, "untop" lets the cover sit above.
  $timer = New-Object System.Windows.Forms.Timer; $timer.Interval = 100
  $timer.Add_Tick({
    if ($list.TopIndex -ne $script:topWas) { $script:topWas = $list.TopIndex; Set-Content -LiteralPath "$Log.scroll" -Value $list.TopIndex -NoNewline }
    if (Test-Path -LiteralPath "$Log.cmd") {
      $c = (Get-Content -LiteralPath "$Log.cmd" -Raw).Trim(); Remove-Item -LiteralPath "$Log.cmd"
      if ($c -eq 'move') { $moving.Top += 140 }
      if ($c -eq 'untop') { $f.TopMost = $false }
      & $say "did $c"
    }
  })
  $timer.Start()
}
[System.Windows.Forms.Application]::Run($f)
"#;

    /// A form in its own PowerShell process, closed when dropped.
    struct Form(std::process::Child);
    impl Drop for Form {
        fn drop(&mut self) {
            let _ = self.0.kill();
            let _ = self.0.wait();
        }
    }

    fn open(dir: &Path, log: &Path, args: &[String]) -> Form {
        let script = dir.join("bench.ps1");
        std::fs::write(&script, FORM).unwrap();
        use std::os::windows::process::CommandExt;
        let mut cmd = std::process::Command::new("powershell");
        cmd.args(["-NoProfile", "-ExecutionPolicy", "Bypass", "-File"]).arg(&script).arg("-Log").arg(log).args(args);
        // No console window: one would open on top of the form.
        cmd.creation_flags(0x0800_0000); // CREATE_NO_WINDOW
        Form(cmd.spawn().expect("powershell"))
    }

    fn window(title: &str) -> Option<isize> {
        let wide: Vec<u16> = title.encode_utf16().chain(std::iter::once(0)).collect();
        // Found and shown: a window can exist a moment before it's on screen.
        unsafe { FindWindowW(PCWSTR::null(), PCWSTR(wide.as_ptr())) }.ok().filter(|h| !h.is_invalid() && unsafe { IsWindowVisible(*h) }.as_bool()).map(|h| h.0 as isize)
    }

    fn wait_for<T>(limit: Duration, mut f: impl FnMut() -> Option<T>) -> Option<T> {
        let until = Instant::now() + limit;
        loop {
            if let Some(v) = f() {
                return Some(v);
            }
            if Instant::now() > until {
                return None;
            }
            std::thread::sleep(Duration::from_millis(40));
        }
    }

    fn hwnd(raw: isize) -> HWND {
        HWND(raw as *mut core::ffi::c_void)
    }

    /// Which top-level window is really under this point.
    fn on_top_at(x: i32, y: i32) -> isize {
        unsafe { GetAncestor(WindowFromPoint(POINT { x, y }), GA_ROOT).0 as isize }
    }

    /// A window's title, to say what was in the way.
    fn title(raw: isize) -> String {
        let mut buf = [0u16; 256];
        let n = unsafe { windows::Win32::UI::WindowsAndMessaging::GetWindowTextW(hwnd(raw), &mut buf) };
        String::from_utf16_lossy(&buf[..n.max(0) as usize])
    }

    fn in_front() -> isize {
        unsafe { GetForegroundWindow().0 as isize }
    }

    fn lines(log: &Path) -> Vec<String> {
        std::fs::read_to_string(log).unwrap_or_default().lines().map(str::to_string).collect()
    }

    fn count(log: &Path, what: &str) -> usize {
        lines(log).iter().filter(|l| l.as_str() == what).count()
    }

    fn step(v: serde_json::Value) -> ActionStep {
        serde_json::from_value(v).unwrap()
    }

    fn control(name: &str) -> Option<crate::model::Rect> {
        crate::uia::invalidate_controls();
        crate::uia::list_controls(200).into_iter().find(|c| c.name == name && !c.hidden).map(|c| c.rect)
    }

    struct Row {
        what: &'static str,
        ok: bool,
        ms: u128,
        note: String,
    }

    #[test]
    #[ignore]
    fn action_bench() {
        let idle = crate::buddy::idle_duration();
        assert!(idle >= Duration::from_secs(120), "NOT RUN: the keyboard or mouse was used {} s ago; this test moves the real mouse, so it waits for nobody to be using the PC", idle.as_secs());
        assert!(!crate::uia::screen_locked(), "NOT RUN: the PC is locked");
        super::make_dpi_aware();
        super::clear_abort();
        let dir: PathBuf = std::env::temp_dir().join(format!("izuki-action-bench-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let log = dir.join("events.log");
        let text = dir.join("events.log.text");
        let say = |c: &str| std::fs::write(dir.join("events.log.cmd"), c).unwrap();
        let mut rows: Vec<Row> = Vec::new();

        // The test window, topmost so its title bar is surely what's clicked first.
        let _form = open(&dir, &log, &[]);
        let fixture = wait_for(Duration::from_secs(20), || window("Izuki action bench")).expect("the test window never opened");
        std::thread::sleep(Duration::from_millis(700));
        let mut r = RECT::default();
        unsafe { GetWindowRect(hwnd(fixture), &mut r) }.unwrap();
        let caption = (r.left + 140, r.top + 14);
        { let top = on_top_at(caption.0, caption.1); assert_eq!(top, fixture, "the test window isn't on top (\"{}\" is); nothing was clicked", title(top)); }
        super::click_at(caption.0, caption.1, super::Button::Left, 1, 320).unwrap();
        assert!(wait_for(Duration::from_secs(3), || (in_front() == fixture).then_some(())).is_some(), "the test window didn't come to the front; nothing else was done");

        // 1. Read the window's controls (what a look lists for the AI). The
        //    first look at a window that just opened can come back short
        //    (Windows is still loading its accessibility support), so: how
        //    long until all four are there, then one ordinary look.
        let names = ["Save bench", "Moving bench", "Locked bench", "Bench name"];
        let t = Instant::now();
        let mut looks = 0;
        let mut seen: Vec<String> = Vec::new();
        let first = wait_for(Duration::from_secs(8), || {
            looks += 1;
            crate::uia::invalidate_controls();
            let listed = crate::uia::list_controls(200);
            seen = listed.iter().map(|c| format!("{} \"{}\"", c.kind, c.name)).collect();
            let rect = |n: &str| listed.iter().find(|c| c.name == n && !c.hidden).map(|c| c.rect);
            Some([rect(names[0])?, rect(names[1])?, rect(names[2])?, rect(names[3])?])
        });
        rows.push(Row { what: "controls readable in a new window", ok: first.is_some(), ms: t.elapsed().as_millis(), note: format!("{looks} look(s)") });
        let Some([save, moving, locked, name_box]) = first else {
            panic!("Izuki never listed the test window's controls. Last look: {seen:?}");
        };
        let t = Instant::now();
        let again = names.iter().all(|n| control(n).is_some());
        rows.push(Row { what: "one ordinary look (list controls)", ok: again, ms: t.elapsed().as_millis(), note: String::new() });

        // 2. Click a button, checked by the window's own log.
        let (sx, sy) = save.center();
        let t = Instant::now();
        let said = super::execute(&step(serde_json::json!({"action":"click","x":sx,"y":sy,"snapped_to":"Save bench"})), 320, true, false);
        let landed = wait_for(Duration::from_secs(3), || (count(&log, "save") == 1).then_some(()));
        rows.push(Row { what: "click a button", ok: said.is_ok() && landed.is_some(), ms: t.elapsed().as_millis(), note: format!("{said:?}") });

        // 3. Click into a box and type, read back by Izuki and by the window.
        let (bx, by) = name_box.center();
        let t = Instant::now();
        let clicked = super::execute(&step(serde_json::json!({"action":"click","x":bx,"y":by,"snapped_to":"Bench name"})), 320, true, false);
        let typed = if in_front() == fixture {
            super::execute(&step(serde_json::json!({"action":"type","text_to_type":"izuki bench 42"})), 320, true, false)
        } else {
            Err(anyhow::anyhow!("not typed: the test window wasn't in front"))
        };
        let shown = wait_for(Duration::from_secs(3), || (std::fs::read_to_string(&text).unwrap_or_default() == "izuki bench 42").then_some(()));
        rows.push(Row { what: "click a box and type", ok: clicked.is_ok() && typed.is_ok() && shown.is_some(), ms: t.elapsed().as_millis(), note: format!("{typed:?}") });

        // 4. Recover: the button moved after the look.
        let (mx, my) = moving.center();
        say("move");
        assert!(wait_for(Duration::from_secs(3), || lines(&log).iter().any(|l| l == "did move").then_some(())).is_some(), "the button never moved");
        let t = Instant::now();
        let said = super::execute(&step(serde_json::json!({"action":"click","x":mx,"y":my,"snapped_to":"Moving bench"})), 320, true, false);
        let landed = wait_for(Duration::from_secs(3), || (count(&log, "moving") == 1).then_some(()));
        rows.push(Row { what: "recover: button moved after the look", ok: said.is_ok() && landed.is_some(), ms: t.elapsed().as_millis(), note: format!("{said:?}") });

        // 5. Recover: a greyed-out button is refused, not clicked.
        let (lx, ly) = locked.center();
        let t = Instant::now();
        let said = super::execute(&step(serde_json::json!({"action":"click","x":lx,"y":ly,"snapped_to":"Locked bench"})), 320, true, false);
        std::thread::sleep(Duration::from_millis(300));
        let refused = said.as_ref().err().is_some_and(|e| e.to_string().starts_with("disabled:"));
        rows.push(Row { what: "recover: greyed-out button refused", ok: refused && count(&log, "locked") == 0, ms: t.elapsed().as_millis(), note: format!("{said:?}") });

        // 6. Scroll a list: Izuki must see it move, and must call the end a snag.
        //    The window writes its top line out, which is the ground truth —
        //    never Izuki's own report.
        let scroll_file = dir.join("events.log.scroll");
        let top_index = || std::fs::read_to_string(&scroll_file).ok().and_then(|s| s.trim().parse::<i32>().ok());
        let t = Instant::now();
        let (scroll_ok, scroll_note) = if let Some(list) = control("Bench list") {
            let (lx, ly) = list.center();
            // Down the list: the lines move, and the check must not cry "nothing".
            let down = super::execute(&step(serde_json::json!({"action":"scroll","x":lx,"y":ly,"scroll_amount":4})), 320, true, false);
            let moved = wait_for(Duration::from_secs(3), || top_index().filter(|&v| v > 0).map(|_| ()));
            let down_ok = down.as_ref().map(|s| !s.contains("nothing")).unwrap_or(false) && moved.is_some();
            // Back to the top, then one more nudge up: now nothing moves, and
            // the check has to say so.
            let _ = super::execute(&step(serde_json::json!({"action":"scroll","x":lx,"y":ly,"key":"up","scroll_amount":30})), 320, true, false);
            wait_for(Duration::from_secs(3), || top_index().filter(|&v| v == 0).map(|_| ()));
            let at_end = super::execute(&step(serde_json::json!({"action":"scroll","x":lx,"y":ly,"key":"up","scroll_amount":4})), 320, true, false);
            let end_ok = at_end.as_ref().err().is_some_and(|e| e.to_string().contains("nothing")) && top_index() == Some(0);
            (down_ok && end_ok, format!("down={down:?} end={at_end:?}"))
        } else {
            (false, "no list control".into())
        };
        rows.push(Row { what: "scroll: it moved, and the end is a snag", ok: scroll_ok, ms: t.elapsed().as_millis(), note: scroll_note });

        // 7. A keyboard shortcut (Ctrl+Shift+B) renames the window: the check
        //    sees the change. The window logs "shortcut" as the ground truth.
        if in_front() != fixture {
            let top = on_top_at(caption.0, caption.1);
            if top == fixture {
                super::click_at(caption.0, caption.1, super::Button::Left, 1, 320).ok();
                std::thread::sleep(Duration::from_millis(250));
            }
        }
        let t = Instant::now();
        // The keys go only to the test window: if it couldn't be brought to
        // the front, the row fails rather than typing into the person's app.
        if in_front() != fixture {
            rows.push(Row { what: "shortcut: the change is seen", ok: false, ms: t.elapsed().as_millis(), note: "skipped: the test window isn't in front".into() });
        } else {
            let before_title = crate::uia::foreground_title();
            let said = super::execute(&step(serde_json::json!({"action":"key","key":"ctrl+shift+b"})), 320, true, false);
            let fired = wait_for(Duration::from_secs(3), || (count(&log, "shortcut") >= 1).then_some(()));
            let saw_change = said.as_ref().map(|s| !s.contains("doesn't look like anything changed")).unwrap_or(false);
            let title_changed = crate::uia::foreground_title() != before_title;
            rows.push(Row { what: "shortcut: the change is seen", ok: fired.is_some() && saw_change && title_changed, ms: t.elapsed().as_millis(), note: format!("{said:?}") });
        }

        // 8. Opening: a new window coming to the front is seen; nothing new is
        //    a snag. Exercised against a real window transition (not a launched
        //    app, to keep the test from leaving anything open).
        let before_front = crate::uia::foreground_title();
        let flags_nothing = super::check_opened("opened a thing".into(), &before_front, "a thing that is not open").contains("nothing new");
        let t = Instant::now();
        let sees_it = {
            let _opened = open(&dir, &log, &["-Mode".into(), "cover".into(), "-Title".into(), "Izuki bench opened".into(), "-X".into(), (r.left + 520).to_string(), "-Y".into(), (r.top + 30).to_string(), "-W".into(), "160".into(), "-H".into(), "110".into()]);
            let up = wait_for(Duration::from_secs(20), || window("Izuki bench opened"));
            std::thread::sleep(Duration::from_millis(500));
            up.is_some() && !super::check_opened("opened Izuki bench opened".into(), &before_front, "Izuki bench opened").contains("nothing new")
        };
        rows.push(Row { what: "open: a new window is seen, nothing is a snag", ok: flags_nothing && sees_it, ms: t.elapsed().as_millis(), note: format!("flagged={flags_nothing} seen={sees_it}") });
        // Focus back to the test window for the steps that follow.
        if in_front() != fixture {
            let top = on_top_at(caption.0, caption.1);
            if top == fixture {
                super::click_at(caption.0, caption.1, super::Button::Left, 1, 320).ok();
                std::thread::sleep(Duration::from_millis(250));
            }
        }

        // 9. Recover: another app's window lies on top of the button
        //    (a notification, a chat head). It's pressed directly, and the
        //    window on top gets nothing.
        say("untop");
        assert!(wait_for(Duration::from_secs(3), || lines(&log).iter().any(|l| l == "did untop").then_some(())).is_some(), "the test window stayed topmost");
        let pad = 8;
        let _cover = open(&dir, &log, &["-Mode".into(), "cover".into(), "-X".into(), (save.x - pad).to_string(), "-Y".into(), (save.y - pad).to_string(), "-W".into(), (save.w + 2 * pad).to_string(), "-H".into(), (save.h + 2 * pad).to_string()]);
        let cover = wait_for(Duration::from_secs(20), || window("Izuki bench cover")).expect("the covering window never opened");
        std::thread::sleep(Duration::from_millis(700));
        if in_front() != fixture {
            // The cover took the focus: give it back to the test window
            // (its title bar is clear of the cover), as a person working there would.
            { let top = on_top_at(caption.0, caption.1); assert_eq!(top, fixture, "the test window's title bar is covered by \"{}\"; nothing was clicked", title(top)); }
            super::click_at(caption.0, caption.1, super::Button::Left, 1, 320).unwrap();
            std::thread::sleep(Duration::from_millis(300));
        }
        let covered = on_top_at(sx, sy) == cover && in_front() == fixture;
        let t = Instant::now();
        let said = if covered {
            super::execute(&step(serde_json::json!({"action":"click","x":sx,"y":sy,"snapped_to":"Save bench"})), 320, true, false)
        } else {
            Err(anyhow::anyhow!("not run: the cover wasn't on top of the button with the test window in front"))
        };
        let landed = wait_for(Duration::from_secs(3), || (count(&log, "save") == 2).then_some(()));
        rows.push(Row { what: "recover: window on top of the button", ok: covered && said.is_ok() && landed.is_some() && count(&log, "cover") == 0, ms: t.elapsed().as_millis(), note: format!("{said:?}") });

        println!("\nSmart Screen Actions bench (real window, real mouse, default 320 ms hand travel)");
        for r in &rows {
            println!("  {} {:<40} {:>6} ms   {}", if r.ok { "PASS" } else { "FAIL" }, r.what, r.ms, r.note.chars().take(110).collect::<String>());
        }
        let _ = std::fs::remove_dir_all(&dir);
        assert!(rows.iter().all(|r| r.ok), "a screen action failed (see above)");
    }
}
