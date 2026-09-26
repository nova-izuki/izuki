//! Everything the two windows can ask the core to do.
//!
//! Careful: in Tauri v2 a plain (non-`async`) command runs on the *main*
//! thread — the one that paints every window. Anything that captures, OCRs
//! or calls a model must go through [`blocking`] instead, which runs it on
//! tokio's blocking pool. (Not just `#[tauri::command(async)]` either: that
//! runs on an async worker, where the blocking HTTP client panics on drop.)

use tauri::{AppHandle, Emitter, Manager};

use crate::brain;
use crate::capture;
use crate::events;
use crate::ghost::{self, Prediction};
use crate::model::{DesktopBounds, DrawSession, Flow, StatusEvent, VisionPlan, Watcher};
use crate::overlay;
use crate::settings::{ProviderId, Settings};
use crate::state;
use crate::uia;
use crate::vision;
use crate::{automation, planner};

type R<T> = Result<T, String>;

fn err<E: std::fmt::Display>(e: E) -> String {
    e.to_string()
}

/// Run slow, blocking work off the UI thread and off the async workers.
async fn blocking<T, F>(f: F) -> R<T>
where
    F: FnOnce() -> T + Send + 'static,
    T: Send + 'static,
{
    tauri::async_runtime::spawn_blocking(f)
        .await
        .map_err(|e| format!("background task failed: {e}"))
}

fn failed_plan(msg: String) -> VisionPlan {
    VisionPlan {
        steps: Vec::new(),
        summary: msg,
        provider: "local".into(),
        model: "none".into(),
        latency_ms: 0,
        ..Default::default()
    }
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

#[tauri::command]
pub fn get_settings() -> Settings {
    state::store().settings()
}

#[tauri::command]
pub fn save_settings(app: AppHandle, settings: Settings) -> Settings {
    let previous = state::store().settings();
    let saved = state::store().set_settings(settings);

    if saved.backdrop != previous.backdrop {
        if let Some(w) = app.get_webview_window(overlay::CONFIG_LABEL) {
            overlay::apply_backdrop(&w, saved.backdrop);
        }
    }
    if saved.hotkey_draw != previous.hotkey_draw
        || saved.hotkey_replay != previous.hotkey_replay
        || saved.hotkey_panic != previous.hotkey_panic
        || saved.hotkey_voice != previous.hotkey_voice
        || saved.hotkey_quickdraw != previous.hotkey_quickdraw
    {
        crate::hotkey::rebind(&app, &saved);
    }
    if saved.start_with_windows != previous.start_with_windows {
        crate::set_autostart(&app, saved.start_with_windows);
    }
    if saved.follow_mode_enabled != previous.follow_mode_enabled {
        // The follow thread notices the setting on its own next tick either
        // way; only the overlay's own visibility needs a nudge right now.
        let _ = if saved.follow_mode_enabled {
            overlay::show_follow(&app)
        } else {
            overlay::hide_overlay(&app)
        };
        crate::tray::refresh(&app);
    }

    saved
}

// ---------------------------------------------------------------------------
// Flows
// ---------------------------------------------------------------------------

#[tauri::command]
pub fn list_flows() -> Vec<Flow> {
    state::store().flows()
}

#[tauri::command]
pub fn run_flow(app: AppHandle, id: String) -> R<()> {
    brain::run_flow(&app, &state::store(), &id).map_err(err)
}

#[tauri::command]
pub fn delete_flow(app: AppHandle, id: String) {
    state::store().remove_flow(&id);
    let _ = app.emit(events::FLOWS_CHANGED, ());
}

#[tauri::command]
pub fn rename_flow(app: AppHandle, id: String, name: String) {
    state::store().mutate_flow(&id, |f| f.name = name);
    let _ = app.emit(events::FLOWS_CHANGED, ());
}

// ---------------------------------------------------------------------------
// Watchers
// ---------------------------------------------------------------------------

#[tauri::command]
pub fn list_watchers() -> Vec<Watcher> {
    state::store().watchers()
}

#[tauri::command]
pub fn toggle_watcher(app: AppHandle, id: String, enabled: bool) {
    use crate::model::WatcherStatus;
    state::store().mutate_watcher(&id, |w| {
        w.enabled = enabled;
        w.status = if enabled {
            WatcherStatus::Watching
        } else {
            WatcherStatus::Idle
        };
        w.message = None;
    });
    let _ = app.emit(events::WATCHERS_CHANGED, ());
}

#[tauri::command]
pub fn delete_watcher(app: AppHandle, id: String) {
    state::store().remove_watcher(&id);
    let _ = app.emit(events::WATCHERS_CHANGED, ());
}

#[tauri::command]
pub fn add_watcher(app: AppHandle, watcher: Watcher) {
    state::store().add_watcher(watcher);
    let _ = app.emit(events::WATCHERS_CHANGED, ());
}

// ---------------------------------------------------------------------------
// Windows
// ---------------------------------------------------------------------------

#[tauri::command]
pub fn open_overlay(app: AppHandle) -> R<()> {
    crate::open_draw_overlay(&app);
    Ok(())
}

#[tauri::command]
pub fn close_overlay(app: AppHandle) -> R<()> {
    brain::set_frozen(None);
    overlay::hide_overlay(&app).map_err(err)
}

#[tauri::command]
pub fn set_overlay_interactive(app: AppHandle, interactive: bool) -> R<()> {
    overlay::set_overlay_interactive(&app, interactive).map_err(err)
}

/// Webview diagnostics into the process log — the webviews' own consoles
/// aren't visible anywhere in a normal run.
#[tauri::command]
pub fn frontend_log(message: String) {
    eprintln!("[webview] {message}");
}

#[tauri::command]
pub fn set_overlay_hit(app: AppHandle, hit: bool) -> R<()> {
    overlay::set_overlay_hit(&app, hit).map_err(err)
}

/// What the screen looks like just *around* one of the overlay's boxes (a
/// chat bubble, a caption) — so its text can switch to whatever reads best
/// there: light on dark, dark on light, a gradient on busy colours. The box
/// is given in overlay CSS pixels (the overlay spans the whole desktop);
/// only a ring outside it is measured, never the box itself.
#[derive(serde::Serialize)]
pub struct Backdrop {
    /// 0 = black … 1 = white.
    luma: f32,
    /// 0 = grey … 1 = vivid colour.
    color: f32,
}

#[tauri::command]
pub async fn screen_backdrop(x: f64, y: f64, w: f64, h: f64, scale: f64) -> Backdrop {
    blocking(move || {
        let vb = capture::virtual_bounds();
        let ring = (24.0 * scale).round() as i32;
        let bx = vb.x + (x * scale).round() as i32;
        let by = vb.y + (y * scale).round() as i32;
        let bw = (w * scale).round() as i32;
        let bh = (h * scale).round() as i32;
        let region = crate::model::Rect {
            x: (bx - ring).max(vb.x),
            y: (by - ring).max(vb.y),
            w: (bw + 2 * ring).min(vb.x + vb.w - (bx - ring).max(vb.x)),
            h: (bh + 2 * ring).min(vb.y + vb.h - (by - ring).max(vb.y)),
        };
        let Ok(frame) = capture::capture(region) else {
            return Backdrop { luma: 0.0, color: 0.0 };
        };
        let (mut luma, mut color, mut n) = (0f64, 0f64, 0f64);
        // Every 3rd pixel is plenty.
        for py in (0..frame.height as i32).step_by(3) {
            for px in (0..frame.width as i32).step_by(3) {
                let (sx, sy) = (region.x + px, region.y + py);
                if sx >= bx && sx < bx + bw && sy >= by && sy < by + bh {
                    continue; // the box itself
                }
                let i = ((py as u32 * frame.width + px as u32) * 4) as usize;
                let (b, g, r) = (frame.bgra[i] as f64, frame.bgra[i + 1] as f64, frame.bgra[i + 2] as f64);
                luma += (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
                let (mx, mn) = (r.max(g).max(b), r.min(g).min(b));
                color += if mx > 0.0 { (mx - mn) / mx } else { 0.0 };
                n += 1.0;
            }
        }
        let n = n.max(1.0);
        Backdrop { luma: (luma / n) as f32, color: (color / n) as f32 }
    })
    .await
    .unwrap_or(Backdrop { luma: 0.0, color: 0.0 })
}

#[tauri::command]
pub fn show_caption_overlay(app: AppHandle) -> R<()> {
    overlay::ensure_caption_visible(&app).map_err(err)
}

#[tauri::command]
pub fn show_config(app: AppHandle, tab: Option<String>) -> R<()> {
    overlay::show_config(&app).map_err(err)?;
    if let Some(t) = tab {
        let _ = app.emit(events::NAVIGATE, t);
    }
    Ok(())
}

#[tauri::command]
pub fn desktop_bounds() -> DesktopBounds {
    let b = capture::virtual_bounds();
    DesktopBounds {
        x: b.x,
        y: b.y,
        w: b.w,
        h: b.h,
        scale: 1.0,
    }
}

#[tauri::command]
pub fn cursor_pos() -> (i32, i32) {
    capture::cursor_pos()
}

// ---------------------------------------------------------------------------
// The main pass
// ---------------------------------------------------------------------------

// Everything below that captures the screen, runs OCR or calls a model goes
// through `blocking` — a 30-second wait on a free model used to freeze the
// hand, the captions and the panel ("Not Responding") for the whole wait.

/// The frozen backdrop for the overlay, as a JPEG data URL.
#[tauri::command]
pub async fn frozen_frame() -> R<Option<String>> {
    blocking(|| match brain::frozen() {
        Some(f) => f.to_jpeg_data_url(72).map(Some).map_err(err),
        None => Ok(None),
    })
    .await?
}

#[tauri::command]
pub async fn submit_draw(app: AppHandle, session: DrawSession) -> VisionPlan {
    // The overlay should disappear the instant the user commits; the work
    // continues underneath.
    let _ = overlay::hide_overlay(&app);
    blocking(move || brain::submit_draw(&app, &state::store(), session))
        .await
        .unwrap_or_else(failed_plan)
}

/// A spoken ("Hey Izuki, …") or typed command with nothing drawn to anchor
/// it. Izuki looks at the whole screen instead.
#[tauri::command]
pub async fn submit_voice_command(app: AppHandle, prompt: String) -> VisionPlan {
    blocking(move || brain::submit_voice_command(&app, &state::store(), prompt))
        .await
        .unwrap_or_else(failed_plan)
}

/// The user's answer to Izuki's "which one? circle it" question — marks in
/// screen pixels plus anything typed/said; `None` = skipped.
#[tauri::command]
pub fn answer_help(session: Option<DrawSession>) -> bool {
    brain::answer_help(session)
}

/// Preview what the geometry alone would do, with no capture and no model.
/// The overlay uses this to show the plan before anything runs.
#[tauri::command]
pub fn preview_plan(session: DrawSession) -> VisionPlan {
    let steps = planner::local_plan(&session);
    VisionPlan {
        summary: if steps.is_empty() {
            "Nothing to run yet.".into()
        } else {
            format!("{} step(s) from your marks.", steps.len())
        },
        steps,
        provider: "local".into(),
        model: "geometry".into(),
        latency_ms: 0,
        ..Default::default()
    }
}

/// Izuki is busy (thinking, working, talking) or not — Esc stops it only
/// while it's busy.
#[tauri::command]
pub fn set_busy(app: AppHandle, busy: bool) {
    crate::hotkey::set_escape(&app, busy);
}

/// "Stop": the task in progress stops before its next click and never
/// answers. (The voice and the orb are the webview's job.)
#[tauri::command]
pub fn cancel_task() {
    brain::cancel_task();
}

/// Self-test mode (developer only): launched with IZUKI_SELFTEST=1, the
/// engine runs a scripted set of requests and logs how each one behaved.
#[tauri::command]
pub fn selftest_enabled() -> String {
    std::env::var("IZUKI_SELFTEST").unwrap_or_default()
}

/// Instant skill: open an installed app by name (Start-menu shortcut or a
/// Windows built-in). Returns the app's name as shown, or why not.
#[tauri::command]
pub async fn open_app(name: String) -> R<String> {
    blocking(move || crate::apps::open_app(&name).map_err(|e| e.to_string())).await?
}

/// Instant skill: open a web address in the default browser.
#[tauri::command]
pub async fn open_url(url: String) -> R<()> {
    blocking(move || crate::apps::open_url(&url).map_err(|e| e.to_string())).await?
}

/// "Quit Izuki" — close the app completely.
#[tauri::command]
pub fn quit_app(app: AppHandle) {
    brain::cancel_task();
    app.exit(0);
}

#[tauri::command]
pub fn panic_stop(app: AppHandle) {
    brain::cancel_task();
    let _ = app.emit(events::STOP_SPEAKING, ());
    let _ = overlay::hide_overlay(&app);
    let _ = app.emit(events::STATUS, StatusEvent::info("Stopped everything."));
}

// ---------------------------------------------------------------------------
// Providers, clipboard, prediction
// ---------------------------------------------------------------------------

#[tauri::command]
pub async fn probe_provider(id: String) -> R<String> {
    let settings = state::store().settings();
    let pid = ProviderId::parse(&id).ok_or_else(|| format!("unknown provider: {id}"))?;
    let cfg = settings
        .provider(pid)
        .cloned()
        .ok_or_else(|| format!("{id} is not configured"))?;
    blocking(move || vision::probe(&cfg).map_err(err)).await?
}

#[tauri::command]
pub async fn ghost_predict() -> Option<Prediction> {
    blocking(|| ghost::predict(&state::store(), &uia::foreground_app()))
        .await
        .ok()
        .flatten()
}

#[tauri::command]
pub fn read_clipboard() -> R<String> {
    automation::read_clipboard().map_err(err)
}

#[tauri::command]
pub fn write_clipboard(text: String) -> R<()> {
    automation::write_clipboard(&text).map_err(err)
}

/// Clipboard bridge: copy what is under a region, tidy it, put it back.
#[tauri::command]
pub async fn clip_region(region: crate::model::Rect) -> R<String> {
    blocking(move || {
        let frame = capture::capture(region).map_err(err)?;
        let text = crate::ocr::read_frame(&frame).map_err(err)?;
        let cleaned = text
            .lines()
            .map(str::trim)
            .filter(|l| !l.is_empty())
            .collect::<Vec<_>>()
            .join("\n");
        if cleaned.is_empty() {
            return Err("no text found in that region".into());
        }
        automation::write_clipboard(&cleaned).map_err(err)?;
        Ok(cleaned)
    })
    .await?
}

#[tauri::command]
pub fn foreground_app() -> String {
    uia::foreground_app()
}

// ---------------------------------------------------------------------------
// Memory — what Izuki remembers about the user
// ---------------------------------------------------------------------------

#[tauri::command]
pub fn list_memories() -> Vec<crate::memory::Memory> {
    crate::memory::list()
}

#[tauri::command]
pub fn add_memory(text: String) -> Option<crate::memory::Memory> {
    crate::memory::add(&text)
}

#[tauri::command]
pub fn delete_memory(id: String) {
    crate::memory::remove(&id);
}

/// "Forget that I …" — drops every fact mentioning it; returns how many.
#[tauri::command]
pub fn forget_memories(about: String) -> usize {
    crate::memory::forget_about(&about)
}

#[tauri::command]
pub fn clear_memories() {
    crate::memory::clear();
}

// ---------------------------------------------------------------------------
// Cloud voices (tts.rs)
// ---------------------------------------------------------------------------

/// One sentence in a cloud voice, as WAV bytes (an ArrayBuffer in JS).
#[tauri::command]
pub async fn speak_cloud(
    engine: String,
    text: String,
    mood: Option<String>,
) -> R<tauri::ipc::Response> {
    let settings = state::store().settings();
    blocking(move || crate::tts::synthesize(&settings, &engine, &text, mood.as_deref()))
        .await?
        .map(tauri::ipc::Response::new)
}

// ---------------------------------------------------------------------------
// Hearing you over the music (stt.rs, duck.rs)
// ---------------------------------------------------------------------------

/// Whether a cloud speech model is set up (Groq or Gemini key, and on).
#[tauri::command]
pub fn cloud_ears_ready() -> bool {
    crate::stt::available(&state::store().settings())
}

/// What was said in a 16 kHz WAV clip (base64), per the big cloud model.
/// An error means "use the on-device words".
#[tauri::command]
pub async fn cloud_transcribe(wav_b64: String) -> R<String> {
    use base64::Engine;
    let wav = base64::engine::general_purpose::STANDARD.decode(wav_b64.as_bytes()).map_err(err)?;
    let settings = state::store().settings();
    blocking(move || crate::stt::transcribe(&settings, wav).map_err(err)).await?
}

/// Turn other apps' sound down while Izuki listens (and back up after).
#[tauri::command]
pub fn duck_audio(on: bool) {
    if !on || state::store().settings().duck_while_listening {
        crate::duck::set(on);
    }
}

/// Start looking at the screen early — called the moment the user starts
/// talking or typing, so the answer isn't waiting on it later.
#[tauri::command]
pub fn prefetch_screen() {
    uia::prefetch_controls(brain::MAX_CONTROLS);
}

/// Keep a recent wake-word clip Izuki couldn't make out, as a WAV, so a
/// missed "Hey Izuki" can be checked against the speech models afterwards.
/// Raw body = the WAV bytes; header `name` = a short file name. Only the
/// newest dozen are kept, in `%APPDATA%\Izuki\debug`.
#[tauri::command]
pub fn save_clip(request: tauri::ipc::Request) -> R<()> {
    let tauri::ipc::InvokeBody::Raw(bytes) = request.body() else {
        return Err("expected raw audio".into());
    };
    let name: String = request
        .headers()
        .get("name")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("clip")
        .chars()
        .filter(|c| c.is_ascii_alphanumeric() || *c == '-' || *c == '_')
        .take(40)
        .collect();
    let dir = crate::store::data_dir().join("debug");
    std::fs::create_dir_all(&dir).map_err(err)?;
    std::fs::write(dir.join(format!("{name}.wav")), bytes).map_err(err)?;
    // Newest dozen only.
    let mut files: Vec<_> = std::fs::read_dir(&dir)
        .map_err(err)?
        .filter_map(|e| e.ok())
        .filter(|e| e.path().extension().is_some_and(|x| x == "wav"))
        .filter_map(|e| Some((e.metadata().ok()?.modified().ok()?, e.path())))
        .collect();
    files.sort();
    let excess = files.len().saturating_sub(12);
    for (_, p) in files.into_iter().take(excess) {
        let _ = std::fs::remove_file(p);
    }
    Ok(())
}

// ---------------------------------------------------------------------------
// Wake words (the dedicated detector — see src/lib/wakeEngine.ts)
// ---------------------------------------------------------------------------

/// The wake-word models installed (file names) — the user's own; none is bundled.
#[tauri::command]
pub fn list_wakewords() -> Vec<String> {
    crate::models::custom_wakewords()
}

/// Open the folder custom wake-word models go in.
#[tauri::command]
pub fn open_wakewords_folder(app: AppHandle) -> R<()> {
    use tauri_plugin_opener::OpenerExt;
    let dir = crate::models::wakewords_dir();
    std::fs::create_dir_all(&dir).map_err(err)?;
    app.opener().open_path(dir.to_string_lossy(), None::<&str>).map_err(err)
}

/// What "Add it" found in Downloads.
#[derive(serde::Serialize)]
pub struct WakewordImport {
    /// Models added (file names).
    pub added: Vec<String>,
    /// Voice recordings seen (.wav/.mp3/…) — not models, a common mix-up.
    pub recordings: Vec<String>,
    /// The other model format openwakeword.com offers (.tflite) — not usable here.
    pub tflite: Vec<String>,
}

/// Bring in wake-word models just downloaded from openwakeword.com: any
/// `.onnx` directly in the Downloads folder (not in subfolders) from the
/// last 30 days — or inside a `.zip` from there — apart from the engine's
/// own parts. Also reports recordings/tflite files, so the app can say
/// what to download instead.
#[tauri::command]
pub fn import_wakewords() -> R<WakewordImport> {
    let downloads = dirs::download_dir().ok_or("no Downloads folder")?;
    let dest = crate::models::wakewords_dir();
    std::fs::create_dir_all(&dest).map_err(err)?;
    let recent = std::time::SystemTime::now() - std::time::Duration::from_secs(30 * 24 * 3600);
    let engine_part = |n: &str| ["melspectrogram", "embedding_model", "silero_vad"].iter().any(|x| n.starts_with(x));
    let mut report = WakewordImport { added: Vec::new(), recordings: Vec::new(), tflite: Vec::new() };

    let mut take = |path: &std::path::Path, name: &str| -> R<()> {
        if engine_part(&name.to_ascii_lowercase()) || dest.join(name).exists() {
            return Ok(());
        }
        std::fs::copy(path, dest.join(name)).map_err(err)?;
        report.added.push(name.to_string());
        Ok(())
    };

    for entry in std::fs::read_dir(&downloads).map_err(err)?.flatten() {
        let path = entry.path();
        let Some(name) = path.file_name().map(|n| n.to_string_lossy().into_owned()) else { continue };
        let lower = name.to_ascii_lowercase();
        let fresh = entry.metadata().and_then(|m| m.modified()).map(|t| t >= recent).unwrap_or(false);
        if !path.is_file() || !fresh {
            continue;
        }
        if lower.ends_with(".onnx") {
            take(&path, &name)?;
        } else if lower.ends_with(".zip") {
            // A download with both formats in it: unpack with Windows' own
            // tar and keep any .onnx inside.
            let tmp = std::env::temp_dir().join(format!("izuki-wake-{}", uuid::Uuid::new_v4()));
            std::fs::create_dir_all(&tmp).map_err(err)?;
            let ok = std::process::Command::new("tar")
                .arg("-xf")
                .arg(&path)
                .arg("-C")
                .arg(&tmp)
                .status()
                .map(|s| s.success())
                .unwrap_or(false);
            if ok {
                let mut stack = vec![tmp.clone()];
                while let Some(dir) = stack.pop() {
                    for e in std::fs::read_dir(&dir).map_err(err)?.flatten() {
                        let p = e.path();
                        if p.is_dir() {
                            stack.push(p);
                        } else if let Some(n) = p.file_name().map(|n| n.to_string_lossy().into_owned()) {
                            if n.to_ascii_lowercase().ends_with(".onnx") {
                                take(&p, &n)?;
                            }
                        }
                    }
                }
            }
            let _ = std::fs::remove_dir_all(&tmp);
        } else if lower.ends_with(".tflite") {
            report.tflite.push(name);
        } else if [".wav", ".mp3", ".m4a", ".ogg", ".webm", ".flac"].iter().any(|x| lower.ends_with(x)) {
            report.recordings.push(name);
        }
    }
    Ok(report)
}

// ---------------------------------------------------------------------------
// The fast conversation lane (chat.rs)
// ---------------------------------------------------------------------------

/// Stream a spoken-style reply to the conversation so far; words arrive as
/// `izuki://chat-delta` events tagged `id`.
#[tauri::command]
pub fn chat_stream(app: AppHandle, id: u64, history: Vec<crate::chat::Turn>, expressive: Option<bool>) {
    crate::chat::stream(app, id, history, expressive.unwrap_or(false));
}

#[tauri::command]
pub fn chat_cancel(id: u64) {
    crate::chat::cancel(id);
}
