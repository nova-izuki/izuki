//! Global shortcuts.
//!
//! These are registered with the OS, so they fire from any app — including
//! full-screen games, where an in-app hook would never be seen.

use std::sync::atomic::{AtomicBool, Ordering};

use tauri::{AppHandle, Emitter};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

use crate::events;
use crate::model::StatusEvent;
use crate::settings::Settings;

/// Push-to-talk is being held down right now.
static VOICE_DOWN: AtomicBool = AtomicBool::new(false);
/// The quickdraw chord is being held down right now.
static QUICK_DOWN: AtomicBool = AtomicBool::new(false);

/// Turn "Ctrl+Shift+I" into a shortcut. Accepts Ctrl/Control, Alt/Option,
/// Shift, Super/Win/Cmd, and either a single character or a named key.
pub fn parse(combo: &str) -> Option<Shortcut> {
    let mut mods = Modifiers::empty();
    let mut code: Option<Code> = None;

    for token in combo.split('+').map(str::trim).filter(|t| !t.is_empty()) {
        match token.to_ascii_lowercase().as_str() {
            "ctrl" | "control" | "commandorcontrol" | "cmdorctrl" => mods |= Modifiers::CONTROL,
            "shift" => mods |= Modifiers::SHIFT,
            "alt" | "option" => mods |= Modifiers::ALT,
            "super" | "win" | "meta" | "cmd" | "command" => mods |= Modifiers::SUPER,
            other => code = code_for(other),
        }
    }

    code.map(|c| {
        Shortcut::new(
            if mods.is_empty() { None } else { Some(mods) },
            c,
        )
    })
}

fn code_for(token: &str) -> Option<Code> {
    // `Code` parses the W3C names, so map friendly spellings onto those.
    let name = match token {
        "esc" | "escape" => "Escape".to_string(),
        "enter" | "return" => "Enter".to_string(),
        "space" | "spacebar" => "Space".to_string(),
        "tab" => "Tab".to_string(),
        "backspace" => "Backspace".to_string(),
        "delete" | "del" => "Delete".to_string(),
        "insert" | "ins" => "Insert".to_string(),
        "home" => "Home".to_string(),
        "end" => "End".to_string(),
        "pageup" => "PageUp".to_string(),
        "pagedown" => "PageDown".to_string(),
        "up" => "ArrowUp".to_string(),
        "down" => "ArrowDown".to_string(),
        "left" => "ArrowLeft".to_string(),
        "right" => "ArrowRight".to_string(),
        "`" | "backquote" => "Backquote".to_string(),
        "," | "comma" => "Comma".to_string(),
        "." | "period" => "Period".to_string(),
        "/" | "slash" => "Slash".to_string(),
        t if t.len() == 1 && t.chars().next().is_some_and(|c| c.is_ascii_alphabetic()) => {
            format!("Key{}", t.to_ascii_uppercase())
        }
        t if t.len() == 1 && t.chars().next().is_some_and(|c| c.is_ascii_digit()) => {
            format!("Digit{t}")
        }
        t if t.starts_with('f') && t[1..].chars().all(|c| c.is_ascii_digit()) && t.len() > 1 => {
            format!("F{}", &t[1..])
        }
        t => {
            // Already a W3C name such as "Escape" or "F5".
            let mut chars = t.chars();
            match chars.next() {
                Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),
                None => return None,
            }
        }
    };

    name.parse::<Code>().ok()
}

/// Drop every shortcut and register the current set.
pub fn rebind(app: &AppHandle, settings: &Settings) {
    let gs = app.global_shortcut();
    let _ = gs.unregister_all();

    let mut failed: Vec<String> = Vec::new();

    for (combo, action) in [
        (settings.hotkey_draw.clone(), Action::Draw),
        (settings.hotkey_replay.clone(), Action::Replay),
        (settings.hotkey_panic.clone(), Action::Panic),
        (settings.hotkey_voice.clone(), Action::Voice),
        (settings.hotkey_quickdraw.clone(), Action::Quickdraw),
    ] {
        match parse(&combo) {
            Some(sc) => {
                let handle = app.clone();
                let label = combo.clone();
                let result = gs.on_shortcut(sc, move |_app, _sc, event| {
                    // Quickdraw cares about both edges of the chord — press
                    // opens the overlay for drawing, release commits it.
                    // Everything else only ever acts on the press, so the
                    // overlay/action fires the instant the chord completes.
                    match (action, event.state) {
                        // Holding a key auto-repeats its press; each repeat
                        // used to restart quickdraw and wipe the line being
                        // drawn. Only the first press counts.
                        (Action::Quickdraw, ShortcutState::Pressed) => {
                            if !QUICK_DOWN.swap(true, Ordering::SeqCst) {
                                let _ = crate::overlay::begin_quickdraw(&handle);
                            }
                        }
                        (Action::Quickdraw, ShortcutState::Released) => {
                            QUICK_DOWN.store(false, Ordering::SeqCst);
                            crate::overlay::end_quickdraw(&handle);
                        }
                        // Holding push-to-talk auto-repeats the press; only
                        // the first one counts, and letting go ends a held
                        // recording (a quick tap keeps listening instead).
                        (Action::Voice, ShortcutState::Pressed) => {
                            if !VOICE_DOWN.swap(true, Ordering::SeqCst) {
                                action.run(&handle);
                            }
                        }
                        (Action::Voice, ShortcutState::Released) => {
                            VOICE_DOWN.store(false, Ordering::SeqCst);
                            let _ = handle.emit(events::PUSH_TO_TALK_RELEASE, ());
                        }
                        (_, ShortcutState::Pressed) => action.run(&handle),
                        _ => {}
                    }
                });
                if result.is_err() {
                    failed.push(label);
                }
            }
            None => failed.push(combo),
        }
    }

    if !failed.is_empty() {
        let _ = app.emit(
            events::STATUS,
            StatusEvent::error(
                "Some shortcuts could not be registered",
                format!(
                    "{} — another app may already own them.",
                    failed.join(", ")
                ),
            ),
        );
    }
}

#[derive(Clone, Copy)]
enum Action {
    Draw,
    Replay,
    Panic,
    Voice,
    /// Handled directly in `rebind`'s match on both press and release —
    /// never reaches `Action::run`.
    Quickdraw,
}

impl Action {
    fn run(self, app: &AppHandle) {
        match self {
            Action::Draw => crate::open_draw_overlay(app),
            Action::Replay => {
                let store = crate::state::store();
                if let Some(flow) = store.latest_flow() {
                    let _ = crate::brain::run_flow(app, &store, &flow.id);
                } else {
                    let _ = app.emit(
                        events::STATUS,
                        StatusEvent::info("No flows saved yet — draw something first."),
                    );
                }
            }
            Action::Panic => {
                crate::automation::request_abort();
                let _ = app.emit(events::STOP_SPEAKING, ());
                let _ = crate::overlay::hide_overlay(app);
                let _ = app.emit(events::STATUS, StatusEvent::info("Stopped everything."));
            }
            // A one-shot mic capture, no wake word, no window to open first —
            // the config panel's `VoiceEngine` is always mounted (even
            // hidden to tray) and is what actually listens for this. The
            // overlay needs to be visible too, or the "I'm listening"
            // indicator the frontend shows next has nowhere to render — safe
            // to call even when the panel and draw overlay are both closed,
            // and `hide_overlay` (called once listening ends) already knows
            // to leave the hand up afterward if follow mode was already on.
            Action::Voice => {
                let _ = crate::overlay::show_follow(app);
                let _ = app.emit(events::PUSH_TO_TALK, ());
            }
            Action::Quickdraw => {}
        }
    }
}
