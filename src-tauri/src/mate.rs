//! Mate — your Izuki character living on the desktop, like a pet that's a
//! person: it walks along the bottom of the screen with its own pet, dances
//! when music plays, dozes off when you're away, and notices what you do —
//! switching apps, a build finishing, a download landing, coming back after a
//! break — and reacts on its own, in its own voice. Double-click it to talk:
//! that goes to Izuki's whole brain, tools and all.
//!
//! Here: its window (small, see-through, always on top, clicks pass through
//! everywhere but the character itself) and the events it reacts to. The
//! character, its moves and its mind are mate.tsx.

use std::collections::HashSet;
use std::time::{Duration, Instant};

use anyhow::Result;
use parking_lot::Mutex;
use serde::Serialize;
use tauri::{AppHandle, Emitter, LogicalSize, Manager, PhysicalPosition, WebviewUrl, WebviewWindow, WebviewWindowBuilder};

pub const LABEL: &str = "mate";
pub const EVENT: &str = "izuki://mate-event";
/// Logical size of its window: the character and its pet, with room to bounce.
const W: f64 = 300.0;
const H: f64 = 340.0;

#[derive(Debug, Clone, Serialize)]
pub struct MateEvent {
    /// "app", "idle", "back", "build-start", "build-done", "download",
    /// "music", "music-stop", "say", "fullscreen".
    pub kind: String,
    pub detail: String,
}

static APP: std::sync::OnceLock<AppHandle> = std::sync::OnceLock::new();

/// Tell the character something happened, from anywhere (no handle needed).
pub fn notify(kind: &str, detail: &str) {
    if let Some(app) = APP.get() {
        emit(app, kind, detail);
    }
}

/// Tell the character something happened.
pub fn emit(app: &AppHandle, kind: &str, detail: &str) {
    let _ = app.emit_to(LABEL, EVENT, MateEvent { kind: kind.into(), detail: detail.chars().take(200).collect() });
}

/// Where in its window the character is right now (logical px), so only
/// clicks on it are caught.
static HOT: Mutex<Option<(f64, f64, f64, f64)>> = Mutex::new(None);

pub fn set_hot(x: f64, y: f64, w: f64, h: f64) {
    *HOT.lock() = Some((x, y, w, h));
}

fn enabled() -> bool {
    crate::state::try_store().is_some_and(|s| s.settings().mate_enabled)
}

fn ensure(app: &AppHandle) -> Result<WebviewWindow> {
    if let Some(w) = app.get_webview_window(LABEL) {
        return Ok(w);
    }
    let w = WebviewWindowBuilder::new(app, LABEL, WebviewUrl::App("mate.html".into()))
        .title("Izuki Mate")
        .decorations(false)
        .transparent(true)
        .always_on_top(true)
        .skip_taskbar(true)
        .resizable(false)
        .shadow(false)
        .focused(false)
        .visible(false)
        .inner_size(W, H)
        .build()?;
    // Bottom right, standing on the taskbar.
    if let Ok(Some(m)) = app.primary_monitor() {
        let wa = m.work_area();
        let scale = m.scale_factor();
        let (pw, ph) = ((W * scale) as i32, (H * scale) as i32);
        let _ = w.set_position(PhysicalPosition::new(wa.position.x + wa.size.width as i32 - pw - (40.0 * scale) as i32, wa.position.y + wa.size.height as i32 - ph));
    }
    let _ = w.set_size(LogicalSize::new(W, H));
    w.set_ignore_cursor_events(true).ok();
    Ok(w)
}

/// Show or hide it to match the setting.
pub fn apply(app: &AppHandle) {
    if enabled() {
        if let Ok(w) = ensure(app) {
            let _ = w.show();
            let _ = w.set_always_on_top(true);
        }
    } else if let Some(w) = app.get_webview_window(LABEL) {
        let _ = w.hide();
    }
}

/// Build tools whose runs it notices ("that build took 4 minutes").
const BUILDERS: &[&str] = &["cargo", "msbuild", "dotnet", "gradle", "cmake", "ninja", "go", "flutter"];

/// Watch and react: in the background, cheap — the click-through check runs
/// 15 times a second only while it's shown; the rest every couple of seconds.
pub fn spawn(app: AppHandle) {
    // Once: a second call never starts a second watcher.
    if APP.set(app.clone()).is_err() {
        return;
    }
    let _ = std::thread::Builder::new().name("izuki-mate".into()).spawn(move || {
        std::thread::sleep(Duration::from_secs(6));
        apply(&app);
        let mut catching = false;
        let mut last_app = String::new();
        let mut idle_since: Option<Instant> = None;
        let mut builds: std::collections::HashMap<String, Instant> = std::collections::HashMap::new();
        let mut playing = false;
        let mut hidden_for_fullscreen = false;
        let mut tick = 0u64;
        let mut was_on = false;
        loop {
            let on = enabled();
            // Quick only while it's up; once a second otherwise.
            let shown = on && !hidden_for_fullscreen && app.get_webview_window(LABEL).is_some_and(|w| w.is_visible().unwrap_or(false));
            std::thread::sleep(Duration::from_millis(if shown { 66 } else { 1000 }));
            // (Slow ticks stay on multiples of 15, so the 2 s and 6 s checks still land.)
            tick = if shown { tick + 1 } else { (tick / 15 + 1) * 15 };
            if on != was_on {
                was_on = on;
                apply(&app);
            }
            if !on {
                continue;
            }
            let Some(w) = app.get_webview_window(LABEL) else {
                apply(&app);
                continue;
            };
            // Clicks: caught only over the character.
            if w.is_visible().unwrap_or(false) {
                let (cx, cy) = crate::capture::cursor_pos();
                let over = match (w.outer_position(), w.scale_factor(), *HOT.lock()) {
                    (Ok(p), Ok(scale), Some((x, y, hw, hh))) => {
                        let lx = (cx - p.x) as f64 / scale;
                        let ly = (cy - p.y) as f64 / scale;
                        lx >= x && lx <= x + hw && ly >= y && ly <= y + hh
                    }
                    _ => false,
                };
                if over != catching {
                    catching = over;
                    let _ = w.set_ignore_cursor_events(!over);
                }
            }
            if tick % 30 >= if shown { 1 } else { 15 } {
                continue;
            }
            // Every 2 s: what's going on.
            let full = crate::island::fullscreen_now();
            if full != hidden_for_fullscreen {
                hidden_for_fullscreen = full;
                if full {
                    let _ = w.hide();
                } else {
                    let _ = w.show();
                }
            }
            if full {
                continue;
            }
            let front = crate::uia::foreground_app();
            let f = front.to_lowercase();
            if !front.is_empty() && f != last_app && !f.contains("izuki") {
                last_app = f.clone();
                emit(&app, "app", &format!("{front}|{}", crate::island::page_title(&crate::uia::foreground_title())));
            }
            let idle = crate::buddy::idle_duration();
            if idle > Duration::from_secs(180) {
                if idle_since.is_none() {
                    idle_since = Some(Instant::now() - idle);
                    emit(&app, "idle", "");
                }
            } else if let Some(since) = idle_since.take() {
                emit(&app, "back", &format!("{}", since.elapsed().as_secs() / 60));
            }
            let media = crate::island::status().media;
            let now_playing = media.as_ref().is_some_and(|m| m.playing);
            if now_playing != playing {
                playing = now_playing;
                if playing {
                    let m = media.unwrap_or_default();
                    emit(&app, "music", &format!("{}|{}", m.title, m.artist));
                } else {
                    emit(&app, "music-stop", "");
                }
            }
            if tick % 90 == 0 {
                let running: HashSet<String> = crate::boost::running_names().into_iter().filter(|n| BUILDERS.contains(&n.as_str())).collect();
                for b in &running {
                    if !builds.contains_key(b) {
                        builds.insert(b.clone(), Instant::now());
                        emit(&app, "build-start", b);
                    }
                }
                let done: Vec<String> = builds.keys().filter(|b| !running.contains(*b)).cloned().collect();
                for b in done {
                    if let Some(t) = builds.remove(&b) {
                        if t.elapsed() > Duration::from_secs(8) {
                            emit(&app, "build-done", &format!("{b}|{}", t.elapsed().as_secs()));
                        }
                    }
                }
            }
        }
    });
}

/// A line in the character's own voice for what just happened (or an idle
/// thought), short enough for a speech bubble. Falls back to `None` when no
/// AI answers — the character then uses its own stock lines.
pub fn line(event: &str, detail: &str, recent: &[String]) -> Option<String> {
    let s = crate::state::store().settings();
    let who = crate::voices::active(&s);
    let style = if who.persona.style.is_empty() { "warm, quick and a little playful".to_string() } else { who.persona.style.to_string() };
    let what = match event {
        "app" => format!("The user just switched to {detail}."),
        "idle" => "The user has stepped away from the PC.".into(),
        "back" => format!("The user just came back after about {detail} minutes away."),
        "build-start" => format!("A build just started ({detail})."),
        "build-done" => {
            let (tool, secs) = detail.split_once('|').unwrap_or((detail, "0"));
            format!("A build ({tool}) just finished after {secs} seconds.")
        }
        "download" => format!("A download just finished: {detail}."),
        "music" => format!("Music started playing: {}.", detail.replace('|', " by ")),
        "thought" => format!("Nothing special is happening; the user is in {detail}. Share a tiny idle thought, joke or encouragement."),
        other => format!("{other}: {detail}"),
    };
    let msgs = serde_json::json!([
        { "role": "system", "content": format!(
            "You are {name}, the user's Izuki — a little character living on their desktop who walks around their screen. Personality: {style}. React to what just happened in ONE short line (max 12 words), in character, funny or kind, like a friend glancing over. No hashtags, no quotes, at most one emoji. Never repeat these recent lines: {recent}",
            name = who.name, recent = recent.join(" / ")) },
        { "role": "user", "content": what },
    ]);
    let reply = crate::chat::complete(msgs.as_array()?).ok()?;
    let line = reply.lines().next().unwrap_or("").trim().trim_matches('"').to_string();
    (!line.is_empty() && line.chars().count() <= 120).then_some(line)
}

#[cfg(test)]
mod tests {
    #[test]
    fn builders_are_process_names() {
        assert!(super::BUILDERS.iter().all(|b| !b.ends_with(".exe") && b.to_lowercase() == **b));
    }
}
