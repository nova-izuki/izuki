//! IZUKI — draw on your screen, Izuki does it.

pub mod apps;
pub mod automation;
pub mod brain;
pub mod capture;
pub mod chat;
pub mod commands;
pub mod events;
pub mod follow;
pub mod ghost;
pub mod hotkey;
pub mod live;
pub mod memory;
pub mod model;
pub mod models;
pub mod ocr;
pub mod overlay;
pub mod planner;
pub mod recipes;
pub mod settings;
pub mod state;
pub mod store;
pub mod tray;
pub mod tts;
pub mod uia;
pub mod updates;
pub mod vision;
pub mod watcher;

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
pub fn run() {
    // Physical pixels everywhere, so a point drawn on the overlay is the same
    // point the mouse is later moved to.
    automation::make_dpi_aware();

    let store = state::init();

    tauri::Builder::default()
        // Voice model files for the webviews — see models.rs for why they
        // don't just download them themselves.
        .register_asynchronous_uri_scheme_protocol(models::SCHEME, |ctx, request, responder| {
            let app = ctx.app_handle().clone();
            std::thread::spawn(move || responder.respond(models::handle(&app, &request)));
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--minimised"]),
        ))
        .invoke_handler(tauri::generate_handler![
            commands::get_settings,
            commands::save_settings,
            commands::list_flows,
            commands::run_flow,
            commands::delete_flow,
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
            commands::prefetch_screen,
            commands::save_clip,
            commands::list_wakewords,
            commands::open_wakewords_folder,
            commands::import_wakewords,
            commands::chat_stream,
            commands::chat_cancel,
            commands::show_caption_overlay,
            commands::screen_backdrop,
            commands::show_config,
            commands::desktop_bounds,
            commands::cursor_pos,
            commands::frozen_frame,
            commands::submit_draw,
            commands::submit_voice_command,
            commands::answer_help,
            commands::set_busy,
            commands::cancel_task,
            commands::quit_app,
            commands::selftest_enabled,
            commands::open_app,
            commands::open_url,
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

            Ok(())
        })
        .on_window_event(|window, event| {
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
            if let tauri::RunEvent::Ready = event {
                // `--minimised` is passed by the autostart entry so Izuki
                // boots into the tray rather than stealing focus at login.
                let quiet = std::env::args().any(|a| a == "--minimised");
                if !quiet {
                    if let Some(config) = app.get_webview_window(overlay::CONFIG_LABEL) {
                        let _ = config.show();
                        let _ = config.set_focus();
                    }
                }

                // Pick follow mode back up if it was left on last time Izuki
                // closed — that's the entire point of it persisting.
                if state::store().settings().follow_mode_enabled {
                    let _ = overlay::show_follow(app);
                }
            }
        });
}
