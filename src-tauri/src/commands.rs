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
use crate::model::{DesktopBounds, DrawSession, Flow, VisionPlan, Watcher};
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
    crate::bugs::set_enabled(saved.send_bug_reports);

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
    if saved.flows_keep_days != previous.flows_keep_days {
        crate::state::store().prune_flows();
    }
    if saved.start_with_windows != previous.start_with_windows {
        crate::set_autostart(&app, saved.start_with_windows);
    }
    if overlay::stays_up(&saved) != overlay::stays_up(&previous) || saved.follow_mode_enabled != previous.follow_mode_enabled {
        // The follow thread notices the setting on its own next tick either
        // way; only the overlay's own visibility needs a nudge right now.
        let _ = if overlay::stays_up(&saved) {
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
    let task = brain::reserve_draw_task();
    // The overlay should disappear the instant the user commits; the work
    // continues underneath.
    let _ = overlay::hide_overlay(&app);
    blocking(move || brain::submit_draw(&app, &state::store(), session, task))
        .await
        .unwrap_or_else(failed_plan)
}

/// A spoken ("Hey Izuki, …") or typed command with nothing drawn to anchor
/// it. Izuki looks at the whole screen instead.
#[tauri::command]
pub async fn submit_voice_command(app: AppHandle, prompt: String) -> VisionPlan {
    crate::tv::heard(&prompt);
    blocking(move || brain::submit_voice_command(&app, &state::store(), prompt))
        .await
        .unwrap_or_else(failed_plan)
}

/// "Report a problem": the user's words and Izuki's recent log (cleaned of
/// keys and personal details) go to the error tracker. `true` if it was sent;
/// `false` means it's only in the log file for now (bugs.rs).
#[tauri::command]
pub async fn report_bug(what: String) -> bool {
    blocking(move || crate::bugs::user_report(&what)).await.unwrap_or(false)
}

/// Whether error reports can be sent (the tracker is set up).
#[tauri::command]
pub fn bug_reports_ready() -> bool {
    crate::bugs::can_send()
}

/// Open the folder with Izuki's log files in Explorer.
#[tauri::command]
pub fn open_log_folder() -> R<()> {
    let dir = crate::bugs::log_dir();
    let _ = std::fs::create_dir_all(&dir);
    std::process::Command::new("explorer").arg(&dir).spawn().map(|_| ()).map_err(|e| e.to_string())
}

/// "Scroll down", "louder", "next song"…: done at once with no AI, and the
/// few words to say back — or `None` when it isn't one of those plain
/// everyday commands (instant.rs).
#[tauri::command]
pub async fn instant_command(app: AppHandle, said: String) -> Option<String> {
    crate::tv::heard(&said);
    // Answering Izuki's "which app?" for the TV ("Disney", "the first one").
    {
        let s2 = said.clone();
        if let Ok(Some(text)) = blocking(move || crate::tv::answer_choice(&s2)).await {
            return Some(text);
        }
    }
    // "What's important in my email?" — gone through properly, not just counted.
    if crate::headsup::is_inbox_question(&said) && crate::composio::configured() {
        return blocking(crate::headsup::inbox_spoken).await.ok();
    }
    // Read it to me: the selection, else the page — in parts.
    if crate::readaloud::is_keep_reading(&said) {
        return Some(crate::readaloud::keep_going());
    }
    if crate::readaloud::is_read_request(&said) {
        return blocking(crate::readaloud::start).await.ok();
    }
    // Screen time: "how long was I on YouTube today?"
    if crate::screentime::is_question(&said) {
        let s2 = said.clone();
        return blocking(move || crate::screentime::answer(&s2)).await.ok();
    }
    // "Make me an afrobeats drum pattern at 108 bpm": a real MIDI groove.
    if crate::beats::parse(&said).is_some() {
        let s2 = said.clone();
        return blocking(move || crate::beats::make(&s2)).await.ok().flatten();
    }
    // "Speed up my PC", "my laptop is lagging": PC Boost, at once.
    if crate::boost::is_request(&said) {
        return blocking(|| crate::boost::run(false)).await.ok();
    }
    // Timers: "set a pasta timer for 12 minutes", "cancel the timer".
    if let Some(ask) = crate::timers::parse(&said) {
        return Some(crate::timers::run(&app, ask));
    }
    // Focus mode: "focus for 25 minutes", "stop focus".
    if let Some(ask) = crate::focus::parse(&said) {
        return Some(crate::focus::run(&app, ask));
    }
    // Recall: "what was that site I was on this morning?"
    if crate::recall::is_recall_question(&said) {
        let s2 = said.clone();
        return blocking(move || crate::recall::answer(&s2)).await.ok().flatten();
    }
    // The Later list: "remind me later I'm buying…", "what's on my list".
    if let Some(ask) = crate::later::parse_for_list(&said) {
        let said = crate::later::run(ask);
        let _ = app.emit("izuki://later-changed", ());
        return Some(said);
    }
    // "Change your orb to stardust", "switch to Atlas": done at once.
    if let Some(look) = crate::looks::parse(&said) {
        return crate::looks::apply(&look);
    }
    // "Hey Nova, wake up" / "status report": the briefing, straight off this PC.
    if crate::briefing::is_briefing(&said) {
        let hud = blocking(crate::briefing::report).await.ok()?;
        // The holographic status screen, while it's read out.
        if !overlay::overlay_shown() {
            let _ = overlay::show_follow(&app);
        }
        let _ = app.emit_to(overlay::OVERLAY_LABEL, "izuki://hud", &hud);
        // Then everything else that's linked (Slack, Discord, Outlook…) —
        // slower, so it joins the screen when it's ready.
        let (apps, app2) = (hud.apps.clone(), app.clone());
        std::thread::spawn(move || {
            if let Some(text) = crate::briefing::across_apps(&apps) {
                let _ = app2.emit_to(overlay::OVERLAY_LABEL, "izuki://hud-apps", text);
            }
            // The inbox, gone through properly (it takes a few seconds).
            if apps.iter().any(|a| a.to_lowercase().contains("gmail")) {
                if let Ok(d) = crate::headsup::inbox_digest(false) {
                    let _ = app2.emit_to(overlay::OVERLAY_LABEL, "izuki://hud-inbox", d);
                }
            }
        });
        return Some(hud.said);
    }
    crate::instant::parse(&said)?;
    blocking(move || brain::run_instant(&app, &state::store(), &said).map(|p| p.summary))
        .await
        .ok()
        .flatten()
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
    crate::composio::stop();
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

/// Instant skill: play something on YouTube (and skip its ads). The title
/// it started, or null if it only got as far as the results.
#[tauri::command]
pub async fn play_youtube(query: String) -> R<Option<String>> {
    blocking(move || {
        crate::automation::clear_abort();
        crate::youtube::play(&query).map_err(|e| e.to_string())
    })
    .await?
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
    crate::hotkey::stop_current(&app);
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

/// A key the user just copied (Gemini, Groq, Composio…), if that's what's
/// on the clipboard — so setting up is copy on the website, come back, done.
#[tauri::command]
pub fn clipboard_key() -> Option<crate::keys::FoundKey> {
    crate::keys::from_clipboard()
}

/// What kind of key some pasted text is, if it's one.
#[tauri::command]
pub fn recognise_key(text: String) -> Option<crate::keys::FoundKey> {
    crate::keys::recognise(&text)
}

/// The user's n8n workflows, ready to run by name.
#[tauri::command]
pub async fn n8n_import(address: String, api_key: String) -> R<crate::keys::N8nImport> {
    blocking(move || crate::keys::n8n_import(&address, &api_key).map_err(err)).await?
}

/// Every character and natural voice, for the picker.
#[tauri::command]
pub fn voice_catalog() -> serde_json::Value {
    serde_json::json!({
        "personas": crate::voices::PERSONAS,
        "voices": crate::voices::VOICES.iter().map(|(id, label)| serde_json::json!({ "id": id, "label": label })).collect::<Vec<_>>(),
    })
}

/// A line in a voice, to hear it before choosing ("Hear it" / "Test voice").
/// `persona`: preview that character as it comes (none = the current one,
/// with the user's tweaks). An error says exactly why that voice can't speak.
#[tauri::command]
pub async fn voice_test(engine: String, persona: Option<String>, text: Option<String>) -> R<tauri::ipc::Response> {
    let mut settings = state::store().settings();
    if let Some(id) = persona.filter(|p| *p != settings.persona) {
        settings.persona = id;
        settings.persona_name.clear();
        settings.persona_voice.clear();
        settings.voice_rate = 0;
        settings.voice_pitch = 0;
        settings.cloud_voice.clear();
    }
    let line = text
        .filter(|t| !t.trim().is_empty())
        .unwrap_or_else(|| crate::voices::active(&settings).persona.sample.to_string());
    blocking(move || crate::tts::synthesize(&settings, &engine, &line, None))
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
pub fn duck_audio(on: bool, source: Option<String>) {
    let on = on && state::store().settings().duck_while_listening;
    if source.as_deref() == Some("speaking") { crate::duck::set_speaking(on); }
    else { crate::duck::set(on); }
}

// ---------------------------------------------------------------------------
// Phone (telegram.rs) and reminders (reminders.rs)
// ---------------------------------------------------------------------------

/// A request that needs the user's apps (email, calendar, …) — composio.rs.
#[tauri::command]
pub async fn apps_ask(history: Vec<crate::chat::Turn>) -> R<crate::composio::Answer> {
    blocking(move || crate::composio::ask(&history).map_err(err)).await?
}

/// The apps linked through Composio (for the Apps tab's ticks).
#[tauri::command]
pub async fn apps_connected() -> R<Vec<String>> {
    blocking(|| crate::composio::connected().map_err(err)).await?
}

/// A sign-in page for linking one app; the Apps tab opens it.
#[tauri::command]
pub async fn apps_connect(toolkit: String) -> R<String> {
    blocking(move || crate::composio::link(&toolkit).map_err(err)).await?
}

/// The user's Allow / No on a change the chat asked to make.
#[tauri::command]
pub async fn chat_action(id: u64, allow: bool) -> R<String> {
    blocking(move || crate::chat::answer_action(id, allow).map_err(err)).await?
}

/// Show the Izuki browser (to sign in to a site once), optionally at `url`.
#[tauri::command]
pub async fn browser_show(url: Option<String>) -> R<()> {
    blocking(move || crate::browser::show(url.as_deref()).map_err(err)).await?
}

/// Send a sample heads-up to wherever they're set to go.
#[tauri::command]
pub async fn headsup_test(app: AppHandle) {
    let _ = blocking(move || crate::headsup::test(&app)).await;
}

/// Check a Composio key (Settings → Apps → Test).
#[tauri::command]
pub async fn apps_test(key: String) -> R<()> {
    blocking(move || crate::composio::test_key(&key).map_err(err)).await?
}

#[tauri::command]
pub fn call_status() -> crate::call::Status {
    crate::call::status()
}

#[tauri::command]
pub fn discord_status() -> crate::discord::Status {
    crate::discord::status()
}

#[tauri::command]
pub async fn browser_video(action: String, show_window: bool, expected_video: Option<String>) -> R<serde_json::Value> {
    blocking(move || crate::browser::video_checked(&action, show_window, expected_video.as_deref()).map_err(err)).await?
}

#[tauri::command]
pub async fn archive_flows(app: AppHandle, ids: Vec<String>) -> R<String> {
    let token = blocking(move || state::store().archive_flows(&ids).map_err(err)).await??;
    let _ = app.emit(events::FLOWS_CHANGED, ());
    Ok(token)
}

#[tauri::command]
pub async fn restore_flows(app: AppHandle, token: String) -> R<usize> {
    let count = blocking(move || state::store().restore_flows(&token).map_err(err)).await??;
    let _ = app.emit(events::FLOWS_CHANGED, ());
    Ok(count)
}

#[tauri::command]
pub async fn discord_test() -> R<()> {
    blocking(|| crate::discord::test_delivery().map_err(err)).await?
}

/// Forget the paired Discord user; hands back the settings with the new code.
#[tauri::command]
pub fn discord_unpair(app: AppHandle) -> Settings {
    crate::discord::unpair();
    let s = state::store().settings();
    let _ = app.emit(
        "izuki://patch-settings",
        serde_json::json!({ "discord_user_id": "", "telegram_code": s.telegram_code }),
    );
    let _ = app.emit(crate::discord::CHANGED, ());
    s
}

#[tauri::command]
pub fn phone_status() -> crate::telegram::Status {
    crate::telegram::status()
}

/// Forget the paired phone; hands back the settings with the new code.
#[tauri::command]
pub fn phone_unpair(app: AppHandle) -> Settings {
    crate::telegram::unpair();
    let s = state::store().settings();
    let _ = app.emit(
        "izuki://patch-settings",
        serde_json::json!({ "telegram_chat_id": 0, "telegram_code": s.telegram_code }),
    );
    let _ = app.emit(crate::telegram::PHONE_CHANGED, ());
    s
}

/// Find the TV on the Wi-Fi (or check the saved one): its name, whether
/// it's on, and whether it allows control. `None` if there's none.
#[tauri::command]
pub async fn tv_find(fresh: bool) -> Option<crate::tv::TvInfo> {
    blocking(move || {
        if fresh {
            let host = crate::tv::discover()?;
            let store = state::store();
            let mut s = store.settings();
            s.tv_host = host.clone();
            store.set_settings(s);
            crate::state::settings_changed_elsewhere();
        }
        let host = crate::tv::host()?;
        crate::tv::info(&host).ok()
    })
    .await
    .ok()
    .flatten()
}

/// Is the Izuki browser extension connected?
#[tauri::command]
pub fn ext_status() -> bool {
    crate::ext::connected()
}

/// Nova Notes, newest first.
#[tauri::command]
pub fn notes_list() -> Vec<crate::notes::Note> {
    crate::notes::list()
}

#[tauri::command]
pub fn notes_delete(id: String) -> R<()> {
    crate::notes::delete(&id).map_err(err)
}

/// "Take notes on this": read the screen and write study notes.
#[tauri::command]
pub async fn notes_capture() -> R<crate::notes::Note> {
    blocking(|| crate::notes::from_screen().map_err(err)).await?
}

/// Teacher mode adds what it just explained to today's lesson notes.
#[tauri::command]
pub async fn notes_lesson(text: String) -> R<crate::notes::Note> {
    blocking(move || crate::notes::add_to_lesson(&text).map_err(err)).await?
}

/// Flashcards for a note (made by the AI, kept with it).
#[tauri::command]
pub async fn notes_flashcards(id: String) -> R<crate::notes::Note> {
    blocking(move || crate::notes::flashcards(&id).map_err(err)).await?
}

#[derive(serde::Serialize)]
pub struct TvChannel {
    /// The Izuki channel's version on the TV ("" if it isn't there or can't be read).
    installed: String,
    /// The one that comes with this app.
    latest: String,
    /// The TV is a Roku (the only kind this applies to).
    roku: bool,
}

#[tauri::command]
pub async fn tv_channel_status() -> TvChannel {
    blocking(|| {
        let host = state::store().settings().tv_host.trim().to_string();
        let roku = !host.is_empty() && crate::tv::make(&host).is_none();
        TvChannel { installed: if roku { crate::rokudev::installed(&host).unwrap_or_default() } else { String::new() }, latest: crate::rokudev::latest(), roku }
    })
    .await
    .unwrap_or(TvChannel { installed: String::new(), latest: crate::rokudev::latest(), roku: false })
}

/// Put this app's channel on the Roku now (password: the Roku's developer password).
#[tauri::command]
pub async fn tv_channel_update(password: Option<String>) -> R<String> {
    blocking(move || {
        let store = state::store();
        let mut s = store.settings();
        if let Some(p) = password.filter(|p| !p.trim().is_empty()) {
            s.roku_dev_password = p.trim().to_string();
            store.set_settings(s.clone());
        }
        let host = crate::tv::host().ok_or_else(|| "I couldn't find your Roku on the Wi-Fi.".to_string())?;
        crate::rokudev::install(&host, &s.roku_dev_password).map_err(|e| e.to_string())
    })
    .await?
}

/// What's on the TV now, for the status screen (Roku; None otherwise).
#[tauri::command]
pub async fn tv_now() -> Option<String> {
    blocking(crate::tv::now_on).await.ok().flatten()
}

/// The orb's state and words, to the Izuki channel on the TV (if it's open).
#[tauri::command]
pub async fn tv_show(state: String, text: Option<String>) -> bool {
    blocking(move || crate::tv::show(&state, text.as_deref())).await.unwrap_or(false)
}

/// One of the Island's live-activity buttons (Open, Copy the text, Unzip…).
#[tauri::command]
pub async fn activity_do(app: AppHandle, op: String) -> Option<String> {
    blocking(move || crate::activity::act(&app, &op)).await.ok().flatten()
}

/// Talk-to-type: the words go where the cursor is, in the app in front.
#[tauri::command]
pub async fn type_here(text: String) -> bool {
    blocking(move || {
        crate::uia::focus_target_window();
        std::thread::sleep(std::time::Duration::from_millis(80));
        crate::automation::type_text(&text).is_ok()
    })
    .await
    .unwrap_or(false)
}

/// Copy one of the recent copies again.
#[tauri::command]
pub fn copy_again(index: usize) -> bool {
    crate::activity::copy_again(index)
}

/// Forget everything Recall noted.
#[tauri::command]
pub fn recall_forget() {
    crate::recall::forget();
}

/// The status screen's live numbers (CPU, memory, space, battery, online).
#[tauri::command]
pub async fn system_pulse() -> Option<crate::briefing::Pulse> {
    blocking(crate::briefing::pulse).await.ok()
}

/// The Later list (things to remember, no time attached).
#[tauri::command]
pub fn later_list() -> Vec<crate::later::Item> {
    crate::later::list()
}

#[tauri::command]
pub fn later_add(app: AppHandle, text: String) -> String {
    let said = match crate::later::parse(&text) {
        Some(ask @ crate::later::Ask::Add(_)) => crate::later::run(ask),
        _ => crate::later::run(crate::later::Ask::Add(vec![text])),
    };
    let _ = app.emit("izuki://later-changed", ());
    said
}

#[tauri::command]
pub fn later_done(app: AppHandle, id: String, done: bool) {
    crate::later::set_done(&id, done);
    let _ = app.emit("izuki://later-changed", ());
}

#[tauri::command]
pub fn later_remove(app: AppHandle, id: String) {
    crate::later::remove(&id);
    let _ = app.emit("izuki://later-changed", ());
}

/// Phones and TVs linked to this PC (names only), and whether the link is up.
#[tauri::command]
pub fn link_status() -> serde_json::Value {
    serde_json::json!({ "running": crate::link::running(), "ip": crate::link::lan_ip(), "devices": crate::link::devices() })
}

/// Forget a linked phone or TV (it has to ask again).
#[tauri::command]
pub fn link_forget(name: String) {
    let store = state::store();
    let mut s = store.settings();
    s.linked_devices.retain(|d| d.name != name);
    store.set_settings(s);
    crate::state::settings_changed_elsewhere();
}

/// "Open Netflix on the TV" and friends. What to say back.
#[tauri::command]
pub async fn tv_do(said: String) -> R<String> {
    blocking(move || crate::tv::run(&said).map_err(|e| e.to_string())).await?
}

/// The Island's look at the world: what's playing, and whether a film or
/// game has the screen. Off the UI thread — it's asked every few seconds.
#[tauri::command]
pub async fn island_status() -> R<crate::island::IslandStatus> {
    blocking(crate::island::status).await
}

/// The overlay page asks this once it has loaded: what it should be
/// showing (it may have missed being told while it was still loading).
#[tauri::command]
pub fn overlay_state() -> Option<String> {
    overlay::current_open()
}

/// Music mode: the orb flows with what's playing (on) — or stops (off).
#[tauri::command]
pub fn music_meter(app: AppHandle, on: bool) {
    crate::media::music_meter(&app, on);
}

/// The Island's ⏮ ⏯ ⏭ buttons: "play", "pause", "next", "previous".
#[tauri::command]
pub async fn media_control(action: String) -> R<bool> {
    blocking(move || crate::island::control(&action)).await
}

#[tauri::command]
pub fn reminders_list() -> Vec<crate::reminders::Reminder> {
    crate::reminders::list()
}

/// "Match the voice to the face": the character to switch to for a face of
/// this gender — `None` when the voice already matches (or matching is off).
#[tauri::command]
pub fn voice_for_face(male: bool) -> Option<serde_json::Value> {
    let s = state::store().settings();
    if !s.match_voice_face {
        return None;
    }
    // A voice the user picked by hand that already fits: leave it alone.
    if crate::tv::voice_is_male(&s) == male {
        return None;
    }
    let p = crate::voices::persona_with_gender(&s.persona, male);
    (crate::voices::is_male(p) == male).then(|| serde_json::json!({ "id": p.id, "name": p.name, "kokoro": p.kokoro }))
}

/// How the PC is doing, and the heaviest apps (Settings → PC Boost).
#[tauri::command]
pub async fn boost_health() -> R<crate::boost::Health> {
    blocking(crate::boost::health).await
}

/// "Speed it up": clear old temp files, close hogging background helpers.
#[tauri::command]
pub async fn boost_now() -> R<String> {
    blocking(|| crate::boost::run(false)).await
}

#[tauri::command]
pub fn alarm_snooze(text: String, minutes: i64) -> crate::reminders::Reminder {
    crate::reminders::snooze(&text, minutes.clamp(1, 60))
}

#[tauri::command]
pub fn reminder_remove(app: AppHandle, id: String) {
    crate::reminders::remove(&id);
    let _ = app.emit(crate::reminders::CHANGED, ());
}

/// Start looking at the screen early — called the moment the user starts
/// talking or typing, so the answer isn't waiting on it later.
#[tauri::command]
pub fn prefetch_screen() {
    uia::prefetch_controls(brain::MAX_CONTROLS);
    // And open the line to the brains while you're still talking, so the
    // request doesn't also pay for connecting (HeyClicky warms up the same way).
    crate::vision::warm_up();
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
pub fn chat_stream(
    app: AppHandle,
    id: u64,
    history: Vec<crate::chat::Turn>,
    expressive: Option<bool>,
    written: Option<bool>,
) {
    let style = if written.unwrap_or(false) {
        crate::chat::Style::Text
    } else {
        crate::chat::Style::Voice { expressive: expressive.unwrap_or(false) }
    };
    crate::chat::stream(app, id, history, style);
}

/// "Allow" / "no" for the change Izuki asked about out loud. The result to
/// carry on from, or `None` if nothing was waiting.
#[tauri::command]
pub async fn chat_allow_last(allow: bool) -> R<Option<String>> {
    blocking(move || crate::chat::answer_last(allow).map(|r| r.unwrap_or_else(|e| format!("It didn't work: {e}")))).await
}

#[tauri::command]
pub fn chat_cancel(id: u64) {
    crate::chat::cancel(id);
}

/// Connect to the paired Android phone (Settings → Control my Android).
#[tauri::command]
pub async fn android_connect() -> Result<String, String> {
    blocking(|| crate::android::connect().map_err(|e| e.to_string()))
        .await
        .map_err(|e| e.to_string())?
}

/// Do something on the phone from the PC's Chat/voice ("… on my phone").
#[tauri::command]
pub async fn android_do(prompt: String) -> Result<String, String> {
    Ok(blocking(move || crate::android::run_on_phone(&prompt))
        .await
        .map_err(|e| e.to_string())?)
}
