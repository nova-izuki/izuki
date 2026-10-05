//! IZUKI — draw on your screen, Izuki does it.

pub mod android;
pub mod apps;
pub mod briefing;
pub mod browser;
pub mod bugs;
pub mod automation;
pub mod call;
pub mod brain;
pub mod capture;
pub mod duck;
pub mod easy;
pub mod chat;
pub mod commands;
pub mod discord;
pub mod companion;
pub mod composio;
pub mod events;
pub mod ext;
pub mod files;
pub mod follow;
pub mod headsup;
pub mod ghost;
pub mod hotkey;
pub mod instant;
pub mod island;
pub mod keys;
pub mod live;
pub mod looks;
pub mod media;
pub mod memory;
pub mod model;
pub mod models;
pub mod notes;
pub mod ocr;
pub mod overlay;
pub mod patience;
pub mod planner;
pub mod recipes;
pub mod reminders;
pub mod settings;
pub mod state;
pub mod store;
pub mod suggest;
pub mod stt;
pub mod tags;
pub mod telegram;
pub mod tray;
pub mod tv;
pub mod tvlink;
pub mod buddy;
pub mod link;
pub mod later;
pub mod focus;
pub mod clip;
pub mod recall;
pub mod timers;
pub mod activity;
pub mod screentime;
pub mod readaloud;
pub mod tts;
pub mod uia;
pub mod updates;
pub mod vision;
pub mod voices;
pub mod watcher;
pub mod web;
pub mod youtube;
#[cfg(test)]
mod provider_tests;

use tauri::{AppHandle, Emitter, Manager, WindowEvent};

use crate::model::{DesktopBounds, OverlayOpenPayload, StatusEvent};

/// Open the drawing overlay.
///
/// The overlay is shown *before* anything is captured or encoded: it is a
/// transparent window, so it appears in a couple of frames and the user can
/// start drawing immediately. The freeze frame, which costs real milliseconds
/// to encode, arrives a moment later and fades in behind the marks.
pub fn open_draw_overlay(app: &AppHandle) {
    let settings = state::store().settings();
    automation::clear_abort();

    let b = capture::virtual_bounds();
    let payload = OverlayOpenPayload {
        desktop: DesktopBounds {
            x: b.x,
            y: b.y,
            w: b.w,
            h: b.h,
            scale: 1.0,
        },
        freeze: settings.freeze_screen,
        mode: "draw",
        shape: Some(settings.default_draw_shape.clone()),
    };

    match overlay::show_overlay(app, true) {
        Ok(_) => {
            let _ = app.emit(events::OVERLAY_OPEN, payload);
        }
        Err(e) => {
            let _ = app.emit(
                events::STATUS,
                StatusEvent::error("Could not open the overlay", e.to_string()),
            );
            return;
        }
    }

    if settings.freeze_screen {
        let handle = app.clone();
        std::thread::Builder::new()
            .name("izuki-freeze".into())
            .spawn(move || match brain::capture_frozen() {
                Ok(url) => {
                    let _ = handle.emit(events::FROZEN_FRAME, url);
                }
                Err(e) => {
                    let _ = handle.emit(
                        events::STATUS,
                        StatusEvent::error("Could not capture the screen", e.to_string()),
                    );
                }
            })
            .ok();
    } else {
        // Still grab a frame for the model, just without painting it.
        std::thread::Builder::new()
            .name("izuki-grab".into())
            .spawn(|| {
                if let Ok(f) = capture::capture_all() {
                    brain::set_frozen(Some(f));
                }
            })
            .ok();
    }
}

pub fn set_autostart(app: &AppHandle, enabled: bool) {
    use tauri_plugin_autostart::ManagerExt;
    let manager = app.autolaunch();
    let _ = if enabled {
        manager.enable()
    } else {
        manager.disable()
    };
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
/// Two encryption engines end up in the build (reqwest brings aws-lc-rs,
/// the websocket library brings ring), and with two the TLS library won't
/// guess: the first websocket (the Natural voice, Discord) panicked with
/// "Could not automatically determine the process-level CryptoProvider".
/// Pick one, once, before any websocket connects.
pub fn tls_ready() {
    static ONCE: std::sync::Once = std::sync::Once::new();
    ONCE.call_once(|| {
        let _ = rustls::crypto::aws_lc_rs::default_provider().install_default();
    });
}

pub fn run() {
    tls_ready();
    // Every log line to %APPDATA%\Izuki\logs\izuki.log from here on, and
    // crashes and errors reported (bugs.rs).
    bugs::start();
    eprintln!("[izuki] starting v{}", env!("CARGO_PKG_VERSION"));
    // Physical pixels everywhere, so a point drawn on the overlay is the same
    // point the mouse is later moved to.
    automation::make_dpi_aware();

    let store = state::init();
    // The bridge to the Izuki browser extension (localhost only).
    ext::spawn();
    // The flow tidy-up: once now, then every hour while Izuki runs.
    {
        let store = store.clone();
        std::thread::Builder::new()
            .name("izuki-flow-tidy".into())
            .spawn(move || loop {
                store.prune_flows();
                std::thread::sleep(std::time::Duration::from_secs(3600));
            })
            .ok();
    }
    bugs::set_enabled(store.settings().send_bug_reports);

    tauri::Builder::default()
        // Voice model files for the webviews — see models.rs for why they
        // don't just download them themselves.
        .register_asynchronous_uri_scheme_protocol(models::SCHEME, |ctx, request, responder| {
            let app = ctx.app_handle().clone();
            std::thread::spawn(move || responder.respond(models::handle(&app, &request)));
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--minimised"]),
        ))
        .invoke_handler(tauri::generate_handler![
            updates::update_status,
            updates::check_updates,
            updates::download_update,
            updates::install_update,
            commands::get_settings,
            commands::save_settings,
            commands::list_flows,
            commands::run_flow,
            commands::delete_flow,
            commands::archive_flows,
            commands::restore_flows,
            commands::rename_flow,
            commands::list_watchers,
            commands::toggle_watcher,
            commands::delete_watcher,
            commands::add_watcher,
            commands::open_overlay,
            commands::close_overlay,
            commands::set_overlay_interactive,
            commands::set_overlay_hit,
            commands::frontend_log,
            commands::list_memories,
            commands::add_memory,
            commands::delete_memory,
            commands::forget_memories,
            commands::clear_memories,
            commands::speak_cloud,
            commands::voice_catalog,
            commands::voice_test,
            commands::clipboard_key,
            commands::recognise_key,
            commands::n8n_import,
            commands::prefetch_screen,
            commands::save_clip,
            commands::list_wakewords,
            commands::open_wakewords_folder,
            commands::import_wakewords,
            commands::chat_stream,
            commands::chat_cancel,
            commands::android_connect,
            commands::android_do,
            commands::show_caption_overlay,
            commands::screen_backdrop,
            commands::show_config,
            commands::desktop_bounds,
            commands::cursor_pos,
            commands::frozen_frame,
            commands::submit_draw,
            commands::submit_voice_command,
            commands::link_status,
            commands::later_list,
            commands::system_pulse,
            commands::recall_forget,
            commands::activity_do,
            commands::copy_again,
            commands::type_here,
            commands::later_add,
            commands::later_done,
            commands::later_remove,
            commands::link_forget,
            commands::instant_command,
            commands::report_bug,
            commands::bug_reports_ready,
            commands::open_log_folder,
            commands::answer_help,
            commands::set_busy,
            commands::cloud_ears_ready,
            commands::cloud_transcribe,
            commands::duck_audio,
            commands::phone_status,
            commands::discord_status,
            commands::discord_test,
            commands::discord_unpair,
            commands::call_status,
            commands::apps_ask,
            commands::apps_test,
            commands::apps_connected,
            commands::apps_connect,
            commands::headsup_test,
            commands::browser_show,
            commands::browser_video,
            commands::chat_action,
            commands::phone_unpair,
            commands::tv_find,
            commands::tv_do,
            commands::tv_show,
            commands::chat_allow_last,
            commands::ext_status,
            commands::notes_list,
            commands::notes_delete,
            commands::notes_capture,
            commands::notes_lesson,
            commands::notes_flashcards,
            commands::island_status,
            commands::media_control,
            commands::music_meter,
            commands::overlay_state,
            commands::reminders_list,
            commands::reminder_remove,
            commands::cancel_task,
            commands::quit_app,
            commands::selftest_enabled,
            commands::open_app,
            commands::open_url,
            commands::play_youtube,
            commands::preview_plan,
            commands::panic_stop,
            commands::probe_provider,
            commands::ghost_predict,
            commands::read_clipboard,
            commands::write_clipboard,
            commands::clip_region,
            commands::foreground_app,
        ])
        .setup(move |app| {
            state::set_app(app.handle());
            let handle = app.handle().clone();
            let settings = store.settings();

            overlay::track_orb(&handle);
            let config = overlay::ensure_config(&handle)?;
            overlay::apply_backdrop(&config, settings.backdrop);
            overlay::normalise_config_size(&config);

            // Built eagerly so the overlay is warm the first time it is needed.
            overlay::ensure_overlay(&handle).ok();

            tray::build(&handle)?;
            hotkey::rebind(&handle, &settings);
            hotkey::install_escape_watch(&handle);
            updates::check_later(&handle);
            watcher::spawn(handle.clone(), store.clone());
            follow::spawn(handle.clone(), store.clone());
            reminders::spawn(handle.clone());
            telegram::spawn(handle.clone());
            discord::spawn(handle.clone());
            call::spawn(handle.clone());
            headsup::spawn(handle.clone());
            buddy::spawn(handle.clone());
            link::spawn(handle.clone());
            recall::spawn();
            activity::spawn();
            screentime::spawn();
            browser::init(&handle);

            Ok(())
        })
        .on_window_event(|window, event| {
            // Back from the taskbar after being minimised: the same blank
            // "frosted glass only" as coming back from the tray — redraw it.
            if window.label() == overlay::CONFIG_LABEL {
                use std::sync::atomic::{AtomicBool, Ordering};
                static WAS_MINIMISED: AtomicBool = AtomicBool::new(false);
                match event {
                    WindowEvent::Resized(_) if window.is_minimized().unwrap_or(false) => {
                        WAS_MINIMISED.store(true, Ordering::Relaxed);
                    }
                    // Any time it comes to the front, not just after the
                    // taskbar: it also went blank while left open (sleep, a
                    // lock, a graphics hiccup). At most every few seconds.
                    WindowEvent::Focused(true) => {
                        WAS_MINIMISED.store(false, Ordering::Relaxed);
                        static LAST: parking_lot::Mutex<Option<std::time::Instant>> = parking_lot::Mutex::new(None);
                        let mut last = LAST.lock();
                        if last.is_none_or(|t| t.elapsed() > std::time::Duration::from_secs(3)) {
                            *last = Some(std::time::Instant::now());
                            if let Some(w) = window.app_handle().get_webview_window(overlay::CONFIG_LABEL) {
                                overlay::repaint(&w);
                            }
                        }
                    }
                    _ => {}
                }
            }
            // The Izuki browser keeps its page and sign-ins: closing hides it.
            if window.label() == browser::LABEL {
                if let WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    let _ = window.hide();
                }
                return;
            }
            if let WindowEvent::CloseRequested { api, .. } = event {
                // Izuki keeps its watchers running, so closing the panel hides
                // it to the tray rather than quitting.
                if window.label() == overlay::CONFIG_LABEL {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        })
        .build(tauri::generate_context!())
        .expect("Izuki failed to start")
        .run(|app, event| {
            // Showing the panel here, rather than inline in `.setup()`, is
            // deliberate: `Ready` fires the moment the platform event loop
            // takes over, which is the earliest point a window's native
            // handle is reliably in a good state to show and focus.
            // Quitting (or updating) mid-listen must never leave other
            // apps' sound turned down.
            if let tauri::RunEvent::Exit = event {
                duck::restore_now();
                call::stop();
            }
            if let tauri::RunEvent::Ready = event {
                // `--minimised` is passed by the autostart entry so Izuki
                // boots into the tray rather than stealing focus at login.
                let quiet = std::env::args().any(|a| a == "--minimised");
                if !quiet {
                    let _ = overlay::show_config(app);
                }

                // Pick follow mode back up if it was left on last time Izuki
                // closed — that's the entire point of it persisting.
                if overlay::stays_up(&state::store().settings()) {
                    let _ = overlay::show_follow(app);
                }
            }
        });
}
