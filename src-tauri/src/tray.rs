//! The tray eye. Izuki lives here when the panel is closed.

use tauri::menu::{Menu, MenuEvent, MenuItem, PredefinedMenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Emitter};

use crate::events;
use crate::overlay;
use crate::settings::Settings;

const TRAY_ID: &str = "izuki";

pub fn build(app: &AppHandle) -> tauri::Result<()> {
    let settings = crate::state::store().settings();
    let menu = build_menu(app, &settings)?;

    let mut builder = TrayIconBuilder::with_id(TRAY_ID)
        .tooltip("Izuki — YO IZUKI, DO IT.")
        .menu(&menu)
        // Left click opens the panel; the menu belongs on right click.
        .show_menu_on_left_click(false)
        .on_menu_event(on_menu)
        .on_tray_icon_event(on_icon);

    if let Some(icon) = app.default_window_icon() {
        builder = builder.icon(icon.clone());
    }

    builder.build(app)?;
    Ok(())
}

fn build_menu(app: &AppHandle, settings: &Settings) -> tauri::Result<Menu<tauri::Wry>> {
    let draw = MenuItem::with_id(
        app,
        "draw",
        format!("Draw\t{}", settings.hotkey_draw),
        true,
        None::<&str>,
    )?;
    let follow_label = if settings.follow_mode_enabled {
        "Always show the hand   ✓"
    } else {
        "Always show the hand"
    };
    let follow = MenuItem::with_id(app, "follow", follow_label, true, None::<&str>)?;
    let flows = MenuItem::with_id(app, "flows", "My flows", true, None::<&str>)?;
    let watchers = MenuItem::with_id(app, "watchers", "Watchers", true, None::<&str>)?;
    let settings_item = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
    let stop = MenuItem::with_id(
        app,
        "stop",
        format!("Stop everything\t{}", settings.hotkey_panic),
        true,
        None::<&str>,
    )?;
    let quit = MenuItem::with_id(app, "quit", "Quit Izuki", true, None::<&str>)?;
    let sep1 = PredefinedMenuItem::separator(app)?;
    let sep2 = PredefinedMenuItem::separator(app)?;

    Menu::with_items(
        app,
        &[
            &draw,
            &follow,
            &sep1,
            &flows,
            &watchers,
            &settings_item,
            &sep2,
            &stop,
            &quit,
        ],
    )
}

/// Redraw the tray menu against the current settings — called after
/// anything the menu's own labels depend on changes (a rebound hotkey, the
/// follow-mode flip) so the tray never shows stale text.
pub fn refresh(app: &AppHandle) {
    let settings = crate::state::store().settings();
    if let (Some(tray), Ok(menu)) = (app.tray_by_id(TRAY_ID), build_menu(app, &settings)) {
        let _ = tray.set_menu(Some(menu));
    }
}

fn on_menu(app: &AppHandle, event: MenuEvent) {
    match event.id.as_ref() {
        "draw" => crate::open_draw_overlay(app),
        "follow" => {
            let store = crate::state::store();
            let mut settings = store.settings();
            settings.follow_mode_enabled = !settings.follow_mode_enabled;
            let saved = store.set_settings(settings);

            let _ = if saved.follow_mode_enabled {
                overlay::show_follow(app)
            } else {
                overlay::hide_overlay(app)
            };

            refresh(app);

            let _ = app.emit(
                events::STATUS,
                crate::model::StatusEvent::info(if saved.follow_mode_enabled {
                    "The hand will stay on screen from now on."
                } else {
                    "Follow mode off."
                }),
            );
        }
        "flows" => navigate(app, "flows"),
        "watchers" => navigate(app, "watchers"),
        "settings" => navigate(app, "settings"),
        "stop" => {
            crate::brain::cancel_task();
            let _ = app.emit(events::STOP_SPEAKING, ());
            overlay::orb_closed();
            let _ = overlay::hide_overlay(app);
            let _ = app.emit(
                events::STATUS,
                crate::model::StatusEvent::info("Stopped everything."),
            );
        }
        "quit" => app.exit(0),
        _ => {}
    }
}

fn navigate(app: &AppHandle, tab: &str) {
    let _ = overlay::show_config(app);
    let _ = app.emit(events::NAVIGATE, tab);
}

fn on_icon(tray: &TrayIcon, event: TrayIconEvent) {
    if let TrayIconEvent::Click {
        button: MouseButton::Left,
        button_state: MouseButtonState::Up,
        ..
    } = event
    {
        let _ = overlay::show_config(tray.app_handle());
    }
}
