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

/// Glide the real cursor from where it is to (x, y).
pub fn glide_to(x: i32, y: i32, duration_ms: u64) -> Result<()> {
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
        return Ok(());
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
    Ok(())
}

fn tiny_pause() {
    std::thread::sleep(Duration::from_millis(rand::rng().random_range(24..52)));
}

pub fn click_at(x: i32, y: i32, button: Button, times: u8, duration_ms: u64) -> Result<()> {
    glide_to(x, y, duration_ms)?;
    click_at_here(button, times)
}

/// Click something that may only appear once the mouse is over it. Glide
/// there, give hover effects a moment, and — if a control showed up under
/// the pointer — land on its centre. `reveal` is for a control known to be
/// hidden until hover (the waits are longer); `look_again` is for a guessed
/// point that found nothing to snap to before the hover.
fn hover_then_click(x: i32, y: i32, button: Button, times: u8, duration_ms: u64, reveal: bool, look_again: bool) -> Result<()> {
    glide_to(x, y, duration_ms)?;
    if reveal || look_again {
        std::thread::sleep(Duration::from_millis(if reveal { 380 } else { 140 }));
        if aborted() {
            return Err(anyhow!("stopped"));
        }
        if let Some(hit) = uia::snap_to_control(x, y, if reveal { 40 } else { 28 }) {
            if (hit.x, hit.y) != (x, y) {
                glide_to(hit.x, hit.y, 120)?;
            }
        }
    }
    click_at_here(button, times)
}

fn click_at_here(button: Button, times: u8) -> Result<()> {
    tiny_pause();
    let mut e = enigo()?;
    for i in 0..times.max(1) {
        e.button(button, Direction::Click)
            .map_err(|err| anyhow!("click failed: {err:?}"))?;
        if i + 1 < times {
            std::thread::sleep(Duration::from_millis(55));
        }
    }
    Ok(())
}

pub fn drag(from: (i32, i32), to: (i32, i32), duration_ms: u64) -> Result<()> {
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
    let mut e = enigo()?;
    // Chunked so a long paragraph still responds to the panic key.
    for chunk in text.as_bytes().chunks(48) {
        if aborted() {
            return Err(anyhow!("stopped"));
        }
        let part = String::from_utf8_lossy(chunk);
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
    for m in &held {
        e.key(*m, Direction::Press).map_err(|err| anyhow!("key press failed: {err:?}"))?;
        std::thread::sleep(Duration::from_millis(25));
    }
    let tapped = e.key(key, Direction::Click);
    for m in held.iter().rev() {
        e.key(*m, Direction::Release).ok();
    }
    tapped.map_err(|err| anyhow!("key press failed: {err:?}"))
}

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
        e.scroll(step, axis).ok();
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

/// Run a single planned step. `magnetic` snaps the point onto a real control
/// first; `dry_run` animates nothing at the OS level.
pub fn execute(step: &ActionStep, move_ms: u64, magnetic: bool, dry_run: bool) -> Result<String> {
    // Never act on the lock screen: a keystroke there goes into the PIN or
    // password box.
    if crate::uia::screen_locked() {
        request_abort();
        return Err(anyhow!("your PC is locked"));
    }
    if aborted() {
        return Err(anyhow!("stopped"));
    }

    let (mut x, mut y) = (step.x, step.y);
    let mut snapped = None;

    // A step already pinned to a real control (by id) is exact — only guessed
    // pixels need the magnetic snap.
    let pointless = matches!(
        step.action,
        Intent::Watch | Intent::OpenApp | Intent::OpenUrl | Intent::Search | Intent::PlayYoutube | Intent::Draw
    );

    // Further down the page: the app scrolls exactly to it first, and the
    // click lands where it ended up — no blind wheel turns.
    if step.scroll_first && !dry_run {
        if let Some(name) = step.snapped_to.as_deref() {
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
    if magnetic && step.snapped_to.is_none() && !pointless {
        if let Some(hit) = uia::snap_to_control(x, y, 64) {
            x = hit.x;
            y = hit.y;
            snapped = Some(hit.name);
        }
    }

    // Safe hands: right before a click on a known control, make sure it's
    // really there and can be pressed. A few milliseconds when all is well.
    let clicking = matches!(step.action, Intent::Click | Intent::DoubleClick | Intent::RightClick);
    if let (Some(name), true) = (step.snapped_to.as_deref().filter(|_| !dry_run && !step.hover_first), clicking) {
        match uia::check_target(x, y, name) {
            // The page shifted since the screenshot (an ad or picture loaded).
            uia::AtPoint::Moved(nx, ny) => {
                eprintln!("[hands] \"{name}\" moved since the look — clicking where it is now");
                x = nx;
                y = ny;
            }
            uia::AtPoint::Disabled => return Err(anyhow!("disabled: \"{name}\" is greyed out, so clicking it does nothing yet")),
            uia::AtPoint::Right => {}
            uia::AtPoint::Unknown => return Err(anyhow!("target_changed: I can't verify \"{name}\" here anymore; take another look before clicking")),
        }
        // Another window or pop-up on top: press it directly, no mouse.
        if let Some(cover) = uia::covered_at(x, y) {
            if step.action == Intent::Click && uia::press_named(name) {
                eprintln!("[hands] \"{name}\" was under {cover} — pressed it directly");
                return Ok(format!("pressed \"{name}\" directly (it was behind {cover})"));
            }
            return Err(anyhow!("covered: {cover} is on top of \"{name}\""));
        }
    }

    let label = snapped
        .clone()
        .unwrap_or_else(|| format!("{},{}", x, y));

    if dry_run {
        return Ok(format!("[dry run] {} at {}", step.action.as_str(), label));
    }

    if step.action == Intent::Click && !step.hover_first
        && crate::state::try_store().is_some_and(|s| s.settings().control_style == "precision") {
        if let Some(name) = step.snapped_to.as_deref().or(snapped.as_deref()) {
            if aborted() { return Err(anyhow!("stopped")); }
            if uia::press_at(x, y, name)? {
                return Ok(format!("pressed \"{name}\" through Windows controls"));
            }
        }
    }

    // Hover-only controls (a tab's ✕) need the pointer over them before
    // they exist on screen; a guessed point with nothing under it gets one
    // more look once the hover has had its effect.
    let reveal = step.hover_first;
    let look_again = magnetic && step.snapped_to.is_none() && snapped.is_none();
    match step.action {
        Intent::Click | Intent::Auto => hover_then_click(x, y, Button::Left, 1, move_ms, reveal, look_again)?,
        Intent::DoubleClick => hover_then_click(x, y, Button::Left, 2, move_ms, reveal, look_again)?,
        Intent::RightClick => hover_then_click(x, y, Button::Right, 1, move_ms, reveal, look_again)?,
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
        Intent::OpenApp => {
            let what = step.text_to_type.as_deref().unwrap_or_default();
            let shown = crate::apps::open_app(what)?;
            return Ok(format!("opened {shown}"));
        }
        Intent::OpenUrl => {
            let url = step.text_to_type.as_deref().unwrap_or_default();
            crate::apps::open_url(url)?;
            if url.contains("youtube.com") || url.contains("youtu.be") {
                crate::youtube::watch_ads(crate::youtube::AD_WATCH);
            }
            return Ok(format!("opened {url}"));
        }
        Intent::PlayYoutube => {
            let what = step.text_to_type.as_deref().unwrap_or_default();
            return Ok(match crate::youtube::play(what)? {
                Some(title) => format!("started playing \"{title}\" on YouTube (ads are skipped by themselves)"),
                None => format!("opened YouTube results for \"{what}\" but didn't pick a video"),
            });
        }
        Intent::Search => {
            let q = step.text_to_type.as_deref().unwrap_or_default();
            crate::apps::web_search(q)?;
            return Ok(format!("searched the web for {q}"));
        }
        Intent::Drag => {
            let to = (step.x2.unwrap_or(x), step.y2.unwrap_or(y));
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
            // Focus the field first unless the model gave no coordinates.
            if x > 0 || y > 0 {
                click_at(x, y, Button::Left, 1, move_ms)?;
                std::thread::sleep(Duration::from_millis(90));
            }
            if let Some(text) = &step.text_to_type {
                type_text(text)?;
                if let Some(shown) = check_typed(text)? {
                    return Ok(format!("typed \"{text}\", but the box shows \"{shown}\""));
                }
            }
        }
        Intent::Key => {
            if let Some(k) = &step.key {
                press_key(k)?;
            }
        }
        Intent::Scroll => {
            // No point given: scroll wherever the cursor already is, rather
            // than dragging it to the top-left corner of the screen.
            let (sx, sy) = if x <= 0 && y <= 0 { crate::capture::cursor_pos() } else { (x, y) };
            let (amount, axis) = scroll_direction(step.key.as_deref(), step.scroll_amount.unwrap_or(3));
            scroll_axis(sx, sy, amount, axis, move_ms)?
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
    std::thread::sleep(Duration::from_millis(120));
    Ok(uia::focused_value().filter(|again| !has_typed(again, typed)).map(|s| s.chars().take(80).collect()))
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
