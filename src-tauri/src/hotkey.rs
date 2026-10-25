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

/// The talk key, caught by the keyboard hook itself when Windows wouldn't
/// register it — another program owns it (Windows uses Ctrl+Win+Space to
/// switch keyboard languages, so "couldn't register: Ctrl+Super+Space" left
/// the talk key doing nothing at all). (modifier bits, virtual key.)
static VOICE_HOOK: parking_lot::Mutex<Option<(u8, u32)>> = parking_lot::Mutex::new(None);
/// A combo with the Windows key was taken: when Win comes up, a harmless
/// invisible key first, so the Start menu doesn't open (as PowerToys does).
static WIN_SWALLOWED: AtomicBool = AtomicBool::new(false);
const M_CTRL: u8 = 1;
const M_SHIFT: u8 = 2;
const M_ALT: u8 = 4;
const M_WIN: u8 = 8;

/// A shortcut ("Ctrl+Super+Space") as modifier bits and a Windows virtual key.
fn hook_combo(combo: &str) -> Option<(u8, u32)> {
    let mut mods = 0u8;
    let mut vk = None;
    for token in combo.split('+').map(str::trim).filter(|t| !t.is_empty()) {
        let t = token.to_ascii_lowercase();
        match t.as_str() {
            "ctrl" | "control" | "commandorcontrol" | "cmdorctrl" => mods |= M_CTRL,
            "shift" => mods |= M_SHIFT,
            "alt" | "option" => mods |= M_ALT,
            "super" | "win" | "meta" | "cmd" | "command" => mods |= M_WIN,
            "space" | "spacebar" => vk = Some(0x20),
            "enter" | "return" => vk = Some(0x0D),
            "tab" => vk = Some(0x09),
            _ if t.len() == 1 && t.as_bytes()[0].is_ascii_alphanumeric() => vk = Some(t.to_ascii_uppercase().as_bytes()[0] as u32),
            _ if t.starts_with('f') && t[1..].parse::<u32>().is_ok_and(|n| (1..=24).contains(&n)) => vk = Some(0x6F + t[1..].parse::<u32>().unwrap_or(1)),
            _ => return None,
        }
    }
    vk.filter(|_| mods != 0).map(|v| (mods, v))
}
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

/// Esc stops Izuki — but only while it's busy (thinking, working or
/// talking). A plain-Esc system hotkey never fired here, and would have
/// swallowed Esc in every other app anyway; instead a light keyboard watcher
/// notices Esc (without taking it — the app you're in still gets it) and
/// only acts while Izuki is busy.
static ESC_ON: AtomicBool = AtomicBool::new(false);
/// When Esc was last armed, so a forgotten "busy" can't keep it armed forever.
static ESC_SINCE: parking_lot::Mutex<Option<std::time::Instant>> = parking_lot::Mutex::new(None);
static ESC_APP: std::sync::OnceLock<AppHandle> = std::sync::OnceLock::new();
/// How many tasks are working the screen right now (a drawing, a replay, a
/// spoken or typed command). Esc stops these too — the orb's "busy" alone
/// missed every drawing and replay, which run without the orb.
static WORKING: std::sync::atomic::AtomicUsize = std::sync::atomic::AtomicUsize::new(0);

/// Esc stops Izuki until this is dropped.
pub struct Working(());

impl Drop for Working {
    fn drop(&mut self) {
        WORKING.fetch_sub(1, Ordering::SeqCst);
    }
}

/// Arm Esc for as long as the returned guard lives.
pub fn working() -> Working {
    WORKING.fetch_add(1, Ordering::SeqCst);
    Working(())
}

fn esc_armed() -> bool {
    ESC_ON.load(Ordering::SeqCst) || WORKING.load(Ordering::SeqCst) > 0
}

/// Start the Esc watcher (once, at startup). Costs nothing while idle.
///
/// Two ways of noticing Esc, because one wasn't enough: Windows silently
/// *removes* a keyboard hook whose thread doesn't answer in time — on a busy
/// or throttled laptop that happened, and from then on Esc (and the Ctrl+Shift+Q
/// backup) did nothing for the rest of the session, with no error anywhere.
/// So the hook runs on a high-priority thread and is put back every 30 s, and
/// a second watcher simply checks the Esc key's state while Izuki is busy —
/// that one can't be taken away.
#[cfg(windows)]
pub fn install_escape_watch(app: &AppHandle) {
    use windows::Win32::System::Threading::{GetCurrentThread, SetThreadPriority, THREAD_PRIORITY_TIME_CRITICAL};
    use windows::Win32::UI::WindowsAndMessaging::{
        GetMessageW, SetTimer, SetWindowsHookExW, UnhookWindowsHookEx, MSG, WH_KEYBOARD_LL, WM_TIMER,
    };
    if ESC_APP.set(app.clone()).is_err() {
        return;
    }
    std::thread::Builder::new()
        .name("izuki-esc".into())
        .spawn(|| unsafe {
            // Answer Windows at once, however busy the rest of the PC is.
            let _ = SetThreadPriority(GetCurrentThread(), THREAD_PRIORITY_TIME_CRITICAL);
            let mut hook = match SetWindowsHookExW(WH_KEYBOARD_LL, Some(esc_hook), None, 0) {
                Ok(h) => h,
                Err(_) => {
                    eprintln!("[bug] couldn't watch for Esc");
                    return;
                }
            };
            // A timer on this thread: every 30 s the hook is put back fresh,
            // in case Windows quietly dropped it.
            SetTimer(None, 0, 30_000, None);
            // A low-level hook needs its thread to keep pumping messages.
            let mut msg = MSG::default();
            while GetMessageW(&mut msg, None, 0, 0).as_bool() {
                if msg.message == WM_TIMER {
                    if let Ok(fresh) = SetWindowsHookExW(WH_KEYBOARD_LL, Some(esc_hook), None, 0) {
                        let _ = UnhookWindowsHookEx(hook);
                        hook = fresh;
                    }
                }
            }
        })
        .ok();
    std::thread::Builder::new().name("izuki-esc-watch".into()).spawn(watch_esc_key).ok();
}

/// The second Esc watcher: while Izuki is busy, look at the Esc key itself
/// 25 times a second. Nothing can remove this one. (Izuki's own presses of
/// Esc — a step that closes a menu — are told apart and ignored.)
#[cfg(windows)]
fn watch_esc_key() {
    use windows::Win32::UI::Input::KeyboardAndMouse::{GetAsyncKeyState, VK_CONTROL, VK_ESCAPE, VK_SHIFT};
    let down = |vk: i32| unsafe { (GetAsyncKeyState(vk) as u16 & 0x8000) != 0 };
    let mut esc_was = false;
    let mut q_was = false;
    loop {
        std::thread::sleep(std::time::Duration::from_millis(40));
        let esc = down(VK_ESCAPE.0 as i32);
        let q = down(0x51) && down(VK_CONTROL.0 as i32) && down(VK_SHIFT.0 as i32);
        let esc_pressed = esc && !esc_was;
        let q_pressed = q && !q_was;
        esc_was = esc;
        q_was = q;
        if q_pressed && !key_repeat_of_last_stop() {
            crate::brain::cancel_task();
            if let Some(app) = ESC_APP.get() {
                eprintln!("[hotkey] Ctrl+Shift+Q (key watch) — emergency stop");
                stop_everything(app);
            }
            continue;
        }
        if esc_pressed && esc_armed() && !crate::automation::pressed_esc_just_now() && !key_repeat_of_last_stop() {
            ESC_ON.store(false, Ordering::SeqCst);
            if let Some(app) = ESC_APP.get() {
                eprintln!("[hotkey] Esc pressed (key watch) — stopping");
                stop_current(app);
            }
        }
    }
}

#[cfg(not(windows))]
pub fn install_escape_watch(_app: &AppHandle) {}

#[cfg(windows)]
unsafe extern "system" fn esc_hook(
    code: i32,
    wparam: windows::Win32::Foundation::WPARAM,
    lparam: windows::Win32::Foundation::LPARAM,
) -> windows::Win32::Foundation::LRESULT {
    use windows::Win32::UI::Input::KeyboardAndMouse::{
        keybd_event, GetAsyncKeyState, KEYBD_EVENT_FLAGS, KEYEVENTF_KEYUP, VK_CONTROL, VK_ESCAPE, VK_LWIN, VK_MENU, VK_RWIN, VK_SHIFT,
    };
    use windows::Win32::UI::WindowsAndMessaging::{CallNextHookEx, KBDLLHOOKSTRUCT, LLKHF_INJECTED, WM_KEYDOWN, WM_KEYUP, WM_SYSKEYDOWN, WM_SYSKEYUP};
    // The talk key, when Windows wouldn't give it to Izuki (see VOICE_HOOK):
    // press = listen (the orb and waveform come up), let go = done, and the
    // key itself is kept (so Windows doesn't also switch keyboard language).
    if code >= 0 {
        let talk = *VOICE_HOOK.lock();
        if let Some((mods, vk)) = talk {
            let key = &*(lparam.0 as *const KBDLLHOOKSTRUCT);
            let msg = wparam.0 as u32;
            let down_msg = msg == WM_KEYDOWN || msg == WM_SYSKEYDOWN;
            let up_msg = msg == WM_KEYUP || msg == WM_SYSKEYUP;
            let injected = key.flags.0 & LLKHF_INJECTED.0 != 0;
            let held = |vk: i32| (GetAsyncKeyState(vk) as u16 & 0x8000) != 0;
            if key.vkCode == vk && !injected {
                let now_mods = (if held(VK_CONTROL.0 as i32) { M_CTRL } else { 0 })
                    | (if held(VK_SHIFT.0 as i32) { M_SHIFT } else { 0 })
                    | (if held(VK_MENU.0 as i32) { M_ALT } else { 0 })
                    | (if held(VK_LWIN.0 as i32) || held(VK_RWIN.0 as i32) { M_WIN } else { 0 });
                if down_msg && now_mods == mods {
                    if !VOICE_DOWN.swap(true, Ordering::SeqCst) {
                        if let Some(app) = ESC_APP.get() {
                            let app = app.clone();
                            std::thread::spawn(move || {
                                eprintln!("[hotkey] talk key pressed (caught directly)");
                                Action::Voice.run(&app);
                            });
                        }
                    }
                    if mods & M_WIN != 0 {
                        WIN_SWALLOWED.store(true, Ordering::SeqCst);
                    }
                    return windows::Win32::Foundation::LRESULT(1);
                }
                if up_msg && VOICE_DOWN.swap(false, Ordering::SeqCst) {
                    if let Some(app) = ESC_APP.get() {
                        let app = app.clone();
                        std::thread::spawn(move || {
                            eprintln!("[hotkey] talk key released");
                            let _ = app.emit(events::PUSH_TO_TALK_RELEASE, ());
                        });
                    }
                    return windows::Win32::Foundation::LRESULT(1);
                }
            }
            // The Windows key let go after a combo Izuki took: an invisible
            // key first, so Windows doesn't open the Start menu.
            if up_msg && (key.vkCode == VK_LWIN.0 as u32 || key.vkCode == VK_RWIN.0 as u32) && WIN_SWALLOWED.swap(false, Ordering::SeqCst) {
                keybd_event(0xE8, 0, KEYBD_EVENT_FLAGS(0), 0);
                keybd_event(0xE8, 0, KEYEVENTF_KEYUP, 0);
            }
        }
    }
    // Emergency stop (Ctrl+Shift+Q) as a guaranteed backup, even if the
    // registered global shortcut didn't take (another app owns it) or Izuki is
    // busy. Ctrl and Shift held, Q pressed. cancel_task() only sets flags, so
    // it works even when the UI is bogged down.
    if code >= 0 && wparam.0 as u32 == WM_KEYDOWN {
        let key = &*(lparam.0 as *const KBDLLHOOKSTRUCT);
        let ctrl = (GetAsyncKeyState(VK_CONTROL.0 as i32) as u16 & 0x8000) != 0;
        let shift = (GetAsyncKeyState(VK_SHIFT.0 as i32) as u16 & 0x8000) != 0;
        if key.vkCode == 0x51 && ctrl && shift && !key_repeat_of_last_stop() {
            crate::brain::cancel_task();
            if let Some(app) = ESC_APP.get() {
                let app = app.clone();
                std::thread::spawn(move || {
                    eprintln!("[hotkey] Ctrl+Shift+Q (hook backup) — emergency stop");
                    stop_everything(&app);
                });
            }
        }
    }
    if code >= 0 && wparam.0 as u32 == WM_KEYDOWN && esc_armed() {
        let key = &*(lparam.0 as *const KBDLLHOOKSTRUCT);
        if cfg!(debug_assertions) && key.vkCode == VK_ESCAPE.0 as u32 {
            eprintln!("[hotkey] Esc seen (flags {:#x}, extra {})", key.flags.0, key.dwExtraInfo);
        }
        // Izuki's own key presses (a plan step that presses Esc to close a
        // menu) mustn't stop it. They all go through enigo, which tags each
        // one — ignore only those. Other injected keys still count: the
        // On-Screen Keyboard and voice-typing tools send Esc that way.
        let ours = key.flags.0 & LLKHF_INJECTED.0 != 0 && key.dwExtraInfo == enigo::EVENT_MARKER as usize;
        if key.vkCode == VK_ESCAPE.0 as u32 && !ours && !key_repeat_of_last_stop() {
            ESC_ON.store(false, Ordering::SeqCst);
            // Flip the abort flag inside the hook; cleanup may wait for a
            // worker, but another queued click must not get that head start.
            crate::automation::request_abort();
            if let Some(app) = ESC_APP.get() {
                let app = app.clone();
                // Never do real work inside the hook — Windows drops slow hooks.
                std::thread::spawn(move || {
                    eprintln!("[hotkey] Esc pressed — stopping");
                    stop_current(&app);
                });
            }
        }
    }
    CallNextHookEx(None, code, wparam, lparam)
}

/// A held Esc auto-repeats; one stop per press is plenty.
#[cfg(windows)]
fn key_repeat_of_last_stop() -> bool {
    static LAST: parking_lot::Mutex<Option<std::time::Instant>> = parking_lot::Mutex::new(None);
    let mut last = LAST.lock();
    let repeat = last.is_some_and(|t| t.elapsed() < std::time::Duration::from_millis(400));
    *last = Some(std::time::Instant::now());
    repeat
}

/// Whether Izuki is busy right now (thinking, working or talking).
pub fn is_busy() -> bool {
    esc_armed()
}

/// Izuki is busy (Esc stops it) or not (Esc is left alone).
pub fn set_escape(_app: &AppHandle, on: bool) {
    if on {
        *ESC_SINCE.lock() = Some(std::time::Instant::now());
        if !ESC_ON.swap(true, Ordering::SeqCst) {
            eprintln!("[hotkey] Esc stops Izuki while it's busy");
            // Safety net: busy for 3 minutes with no word from the app means
            // something forgot to say "done".
            std::thread::spawn(|| loop {
                std::thread::sleep(std::time::Duration::from_secs(15));
                if !ESC_ON.load(Ordering::SeqCst) {
                    return;
                }
                let stale = ESC_SINCE.lock().map(|t| t.elapsed() > std::time::Duration::from_secs(180)).unwrap_or(true);
                if stale {
                    ESC_ON.store(false, Ordering::SeqCst);
                    return;
                }
            });
        }
    } else if ESC_ON.swap(false, Ordering::SeqCst) {
        eprintln!("[hotkey] Esc left alone again");
    }
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
                                eprintln!("[hotkey] talk key pressed");
                                action.run(&handle);
                            }
                        }
                        (Action::Voice, ShortcutState::Released) => {
                            eprintln!("[hotkey] talk key released");
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

    // The talk key couldn't be registered: catch it in the keyboard hook instead.
    let caught = failed.iter().any(|f| *f == settings.hotkey_voice).then(|| hook_combo(&settings.hotkey_voice)).flatten();
    *VOICE_HOOK.lock() = caught;
    if caught.is_some() {
        eprintln!("[hotkey] {} is taken by another program — Izuki catches the talk key directly instead", settings.hotkey_voice);
        failed.retain(|f| *f != settings.hotkey_voice);
    }

    if !failed.is_empty() {
        eprintln!("[hotkey] couldn't register: {}", failed.join(", "));
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
            Action::Panic => stop_everything(app),
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
                let _ = app.emit(events::PUSH_TO_TALK, serde_json::json!({"mode": "hold"}));
            }
            Action::Quickdraw => {}
        }
    }
}

/// Stop what Izuki is doing right now: the screen task or flow, anything
/// it's saying, the orb, the pen, an apps request about to run a tool, and
/// the YouTube ad skipper. (Esc, the "Stop" button, "stop" by text.)
pub fn stop_current(app: &AppHandle) {
    halt(app);
    let _ = app.emit(events::STATUS, StatusEvent::info("Stopped."));
}

fn halt(app: &AppHandle) {
    // Each part on its own: one that fails (a device gone, a window already
    // closed) must never take the rest — or Izuki itself — down with it.
    // Stopping closes nothing but the overlay; the app stays open.
    let safe = |what: &str, f: &dyn Fn()| {
        if std::panic::catch_unwind(std::panic::AssertUnwindSafe(f)).is_err() {
            eprintln!("[hotkey] stopping {what} failed — carrying on");
        }
    };
    safe("the task", &|| crate::brain::cancel_task());
    safe("the apps lane", &|| crate::composio::stop());
    safe("the missions", &|| crate::missions::stop());
    safe("the ad watch", &|| crate::youtube::stop_watching_ads());
    safe("the voice", &|| {
        let _ = app.emit(events::STOP_SPEAKING, ());
    });
    safe("the orb", &|| crate::overlay::orb_closed());
    safe("the pen", &|| {
        let _ = app.emit("izuki://pen-clear", ());
    });
    safe("the overlay", &|| {
        let _ = crate::overlay::hide_overlay(app);
    });
    // Bring the music back up if it was lowered for listening.
    safe("the volume", &|| crate::duck::reset());
}

/// The emergency stop (Ctrl+Shift+Q, the tray's "Stop everything"): all of
/// the above, in every mode, and every watcher is switched off too so
/// nothing starts clicking again a second later. Works even when Esc can't
/// (Esc only reaches Izuki while it's busy, and never over admin windows
/// like Task Manager; a registered hotkey always does).
pub fn stop_everything(app: &AppHandle) {
    halt(app);
    let store = crate::state::store();
    let running: Vec<String> = store.watchers().into_iter().filter(|w| w.enabled).map(|w| w.id).collect();
    for id in &running {
        let _ = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| store.mutate_watcher(id, |w| w.enabled = false)));
    }
    if !running.is_empty() {
        let _ = app.emit(events::WATCHERS_CHANGED, ());
    }
    let detail = match running.len() {
        0 => None,
        1 => Some("Your watcher is paused — turn it back on in Watchers.".to_string()),
        n => Some(format!("{n} watchers are paused — turn them back on in Watchers.")),
    };
    eprintln!("[hotkey] emergency stop ({} watchers paused)", running.len());
    let detail = Some(detail.unwrap_or_else(|| "Izuki's still here — just ask when you're ready.".to_string()));
    let _ = app.emit(events::STATUS, StatusEvent { kind: "info", message: "Stopped everything.".into(), detail });
}

#[cfg(test)]
mod talk_key_tests {
    use super::*;

    #[test]
    fn reads_the_talk_key_for_the_keyboard_hook() {
        assert_eq!(hook_combo("Ctrl+Super+Space"), Some((M_CTRL | M_WIN, 0x20)));
        assert_eq!(hook_combo("Ctrl+Shift+K"), Some((M_CTRL | M_SHIFT, 0x4B)));
        assert_eq!(hook_combo("Alt+F9"), Some((M_ALT, 0x78)));
        assert_eq!(hook_combo("Space"), None); // a bare key is never taken
        assert_eq!(hook_combo("Ctrl+Mystery"), None);
    }
}
