//! The safety layer under Air and Eye control's input to the real PC.
//!
//! Everything Air and Eye do (pointer, buttons, scroll, keys) passes the gate
//! here first, in Rust, so stopping never depends on the overlay's React code,
//! the camera worker, the gaze model or a calibration. Why it exists: in the
//! owner's first real test the calibrated gaze pointer wandered across the
//! screen and nothing stopped it short of turning the laptop away.
//!
//! - **Emergency stop** (Ctrl+Alt+Shift+X by default, the Stop button, "stop
//!   eye control", Ctrl+Shift+Q while eye control is in use): latches. Held
//!   buttons and keys are let go at once, nothing passes the gate, and Air
//!   control is saved as off, so it never comes back by itself. Only the
//!   person turning Air control on again re-arms it.
//! - **The person takes over** (eye mode): a real mouse move or key press
//!   pauses the gaze pointer until they resume it (button or voice).
//! - **Watchdog**: a button Air holds is let go after 3 s with no word from
//!   Air (the overlay hung, the camera went, the tracker stalled); a gaze
//!   pointer that jumps around erratically is paused.
//! - **No stop, no eye pointer**: the gaze pointer moves only while both the
//!   key watcher and the watchdog are running, checked every move.

use std::collections::VecDeque;
use std::sync::atomic::{AtomicBool, AtomicU32, AtomicU64, AtomicU8, Ordering};
use std::sync::OnceLock;

use serde::Serialize;
use tauri::{AppHandle, Emitter};

/// The emergency stop has latched (until Air is turned on again by the person).
static STOPPED: AtomicBool = AtomicBool::new(false);
/// Why the gaze pointer is paused (0: it isn't). See [`Pause`].
static PAUSED: AtomicU8 = AtomicU8::new(0);
/// When the gaze pointer last moved the real pointer (ms since start).
static LAST_EYE: AtomicU64 = AtomicU64::new(0);
/// When Air or Eye last sent anything at all.
static LAST_CALL: AtomicU64 = AtomicU64::new(0);
/// Mouse buttons Air is holding down: 1 left, 2 right.
static BUTTONS: AtomicU8 = AtomicU8::new(0);
/// Heartbeats of the key watcher (hotkey.rs) and of the watchdog below.
static KEY_BEAT: AtomicU64 = AtomicU64::new(0);
static DOG_BEAT: AtomicU64 = AtomicU64::new(0);
/// The crash handler's release is running (never twice, never inside itself).
static RELEASING: AtomicBool = AtomicBool::new(false);
/// When Air last pressed a mouse button down (ms), for the eye lane's limit.
static PRESSED_AT: AtomicU64 = AtomicU64::new(0);
/// Settings say the eye lane is selected: every pointer move is the gaze's.
static EYE_LANE: AtomicBool = AtomicBool::new(false);
/// The emergency key combination: modifier bits (hotkey.rs's M_*) and key code.
static STOP_MODS: AtomicU8 = AtomicU8::new(1 | 2 | 4);
static STOP_VK: AtomicU32 = AtomicU32::new(0x58);
/// Where the gaze pointer last put the real pointer, read back from Windows.
static LAST_SET: parking_lot::Mutex<Option<(i32, i32)>> = parking_lot::Mutex::new(None);
/// The last second or so of gaze targets (ms, normalized x, y).
static TRAIL: parking_lot::Mutex<VecDeque<(u64, f64, f64)>> = parking_lot::Mutex::new(VecDeque::new());
static APP: OnceLock<AppHandle> = OnceLock::new();
static START: OnceLock<std::time::Instant> = OnceLock::new();

/// A button held this long with no word from Air is let go.
const SILENT_RELEASE_MS: u64 = 3_000;
/// The real pointer this far from where the gaze put it: the person moved it.
const TAKEOVER_PX: i32 = 16;
/// Gaze pointer travel within one second that counts as erratic (screen widths).
const ERRATIC_PATH: f64 = 3.0;
/// The eye lane never drags: a button it holds this long is let go.
const EYE_HOLD_MS: u64 = 1_500;
/// Eye control counts as "in use" this long after its last move.
const EYE_ACTIVE_MS: u64 = 3_000;
/// The watchdog's checks failing this many times in a row pauses the gaze pointer.
const WATCHDOG_FAILURES: u32 = 5;

/// Why the gaze pointer is paused.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u8)]
pub enum Pause {
    Mouse = 1,
    Keyboard = 2,
    Erratic = 3,
    Asked = 4,
    NoSafety = 5,
}

impl Pause {
    fn from(code: u8) -> Option<Pause> {
        Some(match code {
            1 => Pause::Mouse,
            2 => Pause::Keyboard,
            3 => Pause::Erratic,
            4 => Pause::Asked,
            5 => Pause::NoSafety,
            _ => return None,
        })
    }

    /// The reason in the person's words.
    pub fn words(self) -> &'static str {
        match self {
            Pause::Mouse => "you moved the mouse",
            Pause::Keyboard => "you used the keyboard",
            Pause::Erratic => "the eye pointer was jumping around, so tracking isn't steady",
            Pause::Asked => "you asked to pause it",
            Pause::NoSafety => "the emergency stop isn't running, so eye control can't move the pointer",
        }
    }
}

/// What the overlay and Settings show.
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Status {
    /// The emergency stop latched: Air control is off until turned on again.
    pub stopped: bool,
    /// The gaze pointer is paused, and why (in the person's words).
    pub paused: Option<String>,
    /// The emergency stop's watchers are running.
    pub ready: bool,
    /// The emergency key combination, as shown to the person.
    pub stop_key: String,
}

/// A line in the log that can never panic (stderr failing must not stop a stop).
fn log(line: &str) {
    use std::io::Write;
    let _ = writeln!(std::io::stderr(), "{line}");
}

fn now_ms() -> u64 {
    START.get_or_init(std::time::Instant::now).elapsed().as_millis() as u64
}

/// Start the watchdog and remember the app (once, at startup). Also let go of
/// held buttons if Izuki crashes.
pub fn install(app: &AppHandle, stop_key: &str, eye_lane: bool) {
    START.get_or_init(std::time::Instant::now);
    set_stop_key(stop_key);
    set_eye_lane(eye_lane);
    if APP.set(app.clone()).is_err() {
        return;
    }
    let previous = std::panic::take_hook();
    std::panic::set_hook(Box::new(move |info| {
        // Once, and never from inside itself: a second panic in a hook aborts.
        if !RELEASING.swap(true, Ordering::SeqCst) {
            let _ = std::panic::catch_unwind(release_now);
            RELEASING.store(false, Ordering::SeqCst);
        }
        previous(info);
    }));
    std::thread::Builder::new().name("izuki-air-watchdog".into()).spawn(watchdog).ok();
}

/// Use this emergency key combination ("Ctrl+Alt+Shift+X"). An unreadable
/// one leaves the previous (default Ctrl+Alt+Shift+X) in place.
pub fn set_stop_key(combo: &str) {
    if let Some((mods, vk)) = crate::hotkey::native_combo(combo) {
        STOP_MODS.store(mods, Ordering::SeqCst);
        STOP_VK.store(vk, Ordering::SeqCst);
    }
}

/// Settings changed which lane Air uses (hand or eye).
pub fn set_eye_lane(on: bool) {
    EYE_LANE.store(on, Ordering::SeqCst);
}

/// The eye lane is selected: a pointer move takes the gaze's checks even if
/// its caller didn't say it was the gaze.
pub fn eye_lane() -> bool {
    EYE_LANE.load(Ordering::SeqCst)
}

/// The emergency combination, for the key watchers: modifier bits and key code.
pub fn stop_key() -> (u8, u32) {
    (STOP_MODS.load(Ordering::SeqCst), STOP_VK.load(Ordering::SeqCst))
}

fn stop_key_words() -> String {
    let (mods, vk) = stop_key();
    let mut parts = Vec::new();
    for (bit, name) in [(1u8, "Ctrl"), (4, "Alt"), (2, "Shift"), (8, "Win")] {
        if mods & bit != 0 {
            parts.push(name.to_string());
        }
    }
    parts.push(match vk {
        0x20 => "Space".into(),
        0x0D => "Enter".into(),
        0x09 => "Tab".into(),
        0x70..=0x87 => format!("F{}", vk - 0x6F),
        _ => char::from_u32(vk).map(|c| c.to_string()).unwrap_or_else(|| format!("key {vk}")),
    });
    parts.join("+")
}

/// The key watcher (hotkey.rs) is alive: called on every pass.
pub fn key_watch_beat() {
    KEY_BEAT.store(now_ms().max(1), Ordering::SeqCst);
}

/// Both of the stop's watchers ran in the last second.
pub fn ready() -> bool {
    let now = now_ms();
    let fresh = |beat: &AtomicU64| {
        let b = beat.load(Ordering::SeqCst);
        b != 0 && now.saturating_sub(b) < 1_000
    };
    fresh(&KEY_BEAT) && fresh(&DOG_BEAT)
}

pub fn status() -> Status {
    Status {
        stopped: STOPPED.load(Ordering::SeqCst),
        paused: Pause::from(PAUSED.load(Ordering::SeqCst)).map(|p| p.words().to_string()),
        ready: ready(),
        stop_key: stop_key_words(),
    }
}

fn announce() {
    if let Some(app) = APP.get() {
        let _ = app.emit(crate::events::AIR_SAFETY, status());
    }
}

/// Eye control was in use in the last few seconds.
pub fn eye_active() -> bool {
    let last = LAST_EYE.load(Ordering::SeqCst);
    last != 0 && now_ms().saturating_sub(last) < EYE_ACTIVE_MS
}

/// Nothing stopped or paused: Air and Eye may act.
pub fn allowed() -> bool {
    !STOPPED.load(Ordering::SeqCst) && PAUSED.load(Ordering::SeqCst) == 0
}

/// Something from Air or Eye arrived (it's alive).
pub fn touch() {
    LAST_CALL.store(now_ms().max(1), Ordering::SeqCst);
}

/// THE EMERGENCY STOP. Safe to call from a keyboard hook: only atomics here
/// (no lock a hook could wait on, or Windows drops the hook); letting go of
/// buttons and saving Air as off happen on their own thread, once. The gaze
/// bookkeeping is cleared by [`arm`] and [`resume`].
pub fn stop(why: &str) {
    if STOPPED.swap(true, Ordering::SeqCst) {
        // Pressed again: one more try at letting go of anything still held.
        std::thread::spawn(release_now);
        return;
    }
    PAUSED.store(0, Ordering::SeqCst);
    let why = why.to_string();
    std::thread::spawn(move || {
        // Air is saved as off even if letting go of something fails.
        let released = std::panic::catch_unwind(release_now).is_ok();
        log(&format!(
            "[air] EMERGENCY STOP ({why}): pointer input blocked, {}, Air control saved as off",
            if released { "held buttons and keys let go" } else { "letting go of held input failed (the watchdog keeps trying)" }
        ));
        let _ = std::panic::catch_unwind(turn_air_off);
        announce();
    });
}

/// The emergency stop has latched (Air comes back only by an explicit enable).
pub fn stopped() -> bool {
    STOPPED.load(Ordering::SeqCst)
}

/// Ctrl+Shift+Q and the tray's Stop: a full emergency stop while eye control
/// is in use; otherwise (hand mode) only what Air holds is let go, as before.
pub fn stop_if_eye(why: &str) {
    if eye_active() {
        stop(why);
    } else {
        std::thread::spawn(release_now);
    }
}

/// Air control saved as off, the overlay and tray told — the tray's own path.
fn turn_air_off() {
    let Some(app) = APP.get() else { return };
    // Not opened yet (early in startup, or a test host): nothing saved to change.
    let Some(store) = crate::state::try_store() else { return };
    let mut settings = store.settings();
    if !settings.air_enabled {
        return;
    }
    settings.air_enabled = false;
    let saved = store.set_settings(settings);
    let _ = if crate::overlay::stays_up(&saved) { crate::overlay::show_follow(app) } else { crate::overlay::hide_overlay(app) };
    crate::state::settings_changed_elsewhere();
    crate::tray::refresh(app);
    let _ = app.emit(
        crate::events::STATUS,
        crate::model::StatusEvent::info(format!("Eye control stopped. Turn Air control on again when you're ready ({} stops it any time).", stop_key_words())),
    );
}

/// The person turned Air control on again: the stop is re-armed.
pub fn arm() {
    let was = STOPPED.swap(false, Ordering::SeqCst) || PAUSED.swap(0, Ordering::SeqCst) != 0;
    *LAST_SET.lock() = None;
    TRAIL.lock().clear();
    if was {
        log("[air] re-armed: Air control turned on by the person");
        announce();
    }
}

/// Pause the gaze pointer (it stays paused until [`resume`]).
pub fn pause(why: Pause) {
    if STOPPED.load(Ordering::SeqCst) {
        return;
    }
    if PAUSED.compare_exchange(0, why as u8, Ordering::SeqCst, Ordering::SeqCst).is_ok() {
        log(&format!("[air] eye pointer paused: {}", why.words()));
        std::thread::spawn(|| {
            release_now();
            announce();
        });
    }
}

/// Resume after a pause. Never undoes an emergency stop. `false` if stopped.
pub fn resume() -> bool {
    if STOPPED.load(Ordering::SeqCst) {
        return false;
    }
    if PAUSED.swap(0, Ordering::SeqCst) != 0 {
        *LAST_SET.lock() = None;
        TRAIL.lock().clear();
        log("[air] eye pointer resumed by the person");
        announce();
    }
    true
}

/// A real (not synthetic) key went down — from the keyboard hook, so cheap.
pub fn physical_key() {
    if eye_active() && allowed() {
        pause(Pause::Keyboard);
    }
}

/// The gaze pointer: move the real pointer to `(x, y)` (physical pixels; `nx`,
/// `ny` normalized) if that's safe. `false` when it didn't move.
pub fn eye_pointer(x: i32, y: i32, nx: f64, ny: f64) -> bool {
    touch();
    if !ready() {
        pause(Pause::NoSafety);
        return false;
    }
    if !allowed() {
        return false;
    }
    let now = now_ms();
    {
        let mut trail = TRAIL.lock();
        trail.push_back((now, nx, ny));
        while trail.front().is_some_and(|(t, ..)| now.saturating_sub(*t) > 1_500) {
            trail.pop_front();
        }
        if erratic(trail.make_contiguous(), now) {
            drop(trail);
            pause(Pause::Erratic);
            return false;
        }
    }
    let mut last = LAST_SET.lock();
    if let (Some(prev), Some(cur)) = (*last, cursor()) {
        if moved_away(prev, cur) {
            *last = None;
            drop(last);
            pause(Pause::Mouse);
            return false;
        }
    }
    crate::air::pointer(x, y);
    *last = cursor().or(Some((x, y)));
    LAST_EYE.store(now.max(1), Ordering::SeqCst);
    true
}

/// A mouse button from Air or Eye. Letting go always passes; pressing only
/// when nothing is stopped or paused. Held buttons are tracked for release:
/// a button counts as let go only once its release went through ([`released`]).
pub fn button_allowed(right: bool, down: bool) -> bool {
    touch();
    let bit = if right { 2 } else { 1 };
    if !down {
        return true;
    }
    if !allowed() {
        return false;
    }
    BUTTONS.fetch_or(bit, Ordering::SeqCst);
    PRESSED_AT.store(now_ms().max(1), Ordering::SeqCst);
    true
}

/// A release went through: the button is no longer held.
pub fn released(right: bool) {
    BUTTONS.fetch_and(!(if right { 2 } else { 1 }), Ordering::SeqCst);
}

/// Let go of one button; it stays recorded as held (for the watchdog to try
/// again) unless the release went through.
fn let_go(right: bool) {
    match crate::automation::mouse_button(right, false) {
        Ok(()) => released(right),
        Err(e) => log(&format!("[air] couldn't let go of the {} button: {e}", if right { "right" } else { "left" })),
    }
}

/// After a press was sent: if a stop or pause landed meanwhile, let it go at
/// once (the stop's own release may have run before the press reached Windows).
pub fn after_press(right: bool) {
    if !allowed() {
        let_go(right);
    }
}

/// Let go of everything Air holds: mouse buttons, a 3D grip, held keys.
pub fn release_now() {
    let held = BUTTONS.load(Ordering::SeqCst);
    if held & 1 != 0 {
        let_go(false);
    }
    if held & 2 != 0 {
        let_go(true);
    }
    let _ = crate::air::grip_3d(false);
    crate::automation::release_held_keys();
}

/// Where the real pointer is now.
fn cursor() -> Option<(i32, i32)> {
    #[cfg(windows)]
    {
        let mut p = windows::Win32::Foundation::POINT::default();
        unsafe { windows::Win32::UI::WindowsAndMessaging::GetCursorPos(&mut p) }.ok()?;
        Some((p.x, p.y))
    }
    #[cfg(not(windows))]
    {
        None
    }
}

/// The real pointer is no longer where the gaze put it: someone moved it.
pub(crate) fn moved_away(set: (i32, i32), now: (i32, i32)) -> bool {
    (set.0 - now.0).abs() > TAKEOVER_PX || (set.1 - now.1).abs() > TAKEOVER_PX
}

/// The last second of gaze targets travelled erratically far: more than
/// [`ERRATIC_PATH`] screen widths, over at least eight looks.
pub(crate) fn erratic(trail: &[(u64, f64, f64)], now: u64) -> bool {
    let recent: Vec<&(u64, f64, f64)> = trail.iter().filter(|(t, ..)| now.saturating_sub(*t) <= 1_000).collect();
    if recent.len() < 8 {
        return false;
    }
    let path: f64 = recent.windows(2).map(|w| ((w[1].1 - w[0].1).powi(2) + (w[1].2 - w[0].2).powi(2)).sqrt()).sum();
    path > ERRATIC_PATH
}

/// Every 200 ms: a held button with no word from Air is let go, and a real
/// mouse move while eye control is in use pauses it, even between gaze moves.
fn watchdog() {
    let mut failures = 0u32;
    loop {
        std::thread::sleep(std::time::Duration::from_millis(200));
        DOG_BEAT.store(now_ms().max(1), Ordering::SeqCst);
        // One failed check (a panic letting a button go) never ends the
        // watchdog; several in a row mean it can't be trusted to protect the
        // person, so the gaze pointer pauses.
        if std::panic::catch_unwind(watchdog_tick).is_err() {
            failures += 1;
            log(&format!("[air] watchdog: a check failed ({failures} in a row); carrying on"));
            if failures >= WATCHDOG_FAILURES {
                pause(Pause::NoSafety);
            }
        } else {
            failures = 0;
        }
    }
}

fn watchdog_tick() {
    // Stopped, with a key whose release didn't go through: keep trying.
    if STOPPED.load(Ordering::SeqCst) && crate::automation::keys_held() {
        crate::automation::release_held_keys();
    }
    {
        let now = now_ms();
        let held = BUTTONS.load(Ordering::SeqCst) != 0;
        if held && now.saturating_sub(LAST_CALL.load(Ordering::SeqCst)) > SILENT_RELEASE_MS {
            log(&format!("[air] watchdog: let go of a held button (no word from Air for {} s)", SILENT_RELEASE_MS / 1000));
            release_now();
        } else if held && !allowed() {
            log("[air] watchdog: let go of a button held after a stop or pause");
            release_now();
        } else if held && eye_lane() && now.saturating_sub(PRESSED_AT.load(Ordering::SeqCst)) > EYE_HOLD_MS {
            // The eye lane only clicks; a button down this long was never let go.
            log("[air] watchdog: let go of a button the eye lane held too long");
            release_now();
        }
        if eye_active() && allowed() {
            let mut last = LAST_SET.lock();
            if let (Some(prev), Some(cur)) = (*last, cursor()) {
                if moved_away(prev, cur) {
                    *last = None;
                    drop(last);
                    pause(Pause::Mouse);
                }
            }
        }
    }
}

/// "Stop eye control", "pause", "resume eye control": answered here, before
/// anything else hears them. `None` for anything else ("pause" with eye
/// control not in use is the music's).
pub fn voice(said: &str) -> Option<String> {
    let t = said.to_lowercase();
    let t = t.trim_matches(|c: char| !c.is_alphanumeric());
    let t = ["hey izuki", "izuki", "hey nova", "nova"]
        .iter()
        .find_map(|w| t.strip_prefix(w))
        .unwrap_or(t)
        .trim_matches(|c: char| !c.is_alphanumeric())
        .to_string();
    let eye_words = t.contains("eye control") || t.contains("eye tracking") || t.contains("eye pointer") || t.contains("eye mouse");
    let stopping = ["stop", "turn off", "disable", "kill", "end"].iter().any(|w| t.starts_with(w)) && eye_words;
    if stopping || t == "emergency stop" {
        stop("voice");
        return Some("Eye control stopped.".into());
    }
    let paused = PAUSED.load(Ordering::SeqCst) != 0;
    if (t.starts_with("pause") && eye_words) || (t == "pause" && eye_active()) {
        pause(Pause::Asked);
        return Some("Eye control paused. Say \"resume eye control\" when you're ready.".into());
    }
    if (t.starts_with("resume") || t.starts_with("unpause") || t.starts_with("continue")) && (eye_words || (t == "resume" && paused)) {
        return Some(if resume() { "Eye control resumed.".into() } else { "Eye control was stopped. Turn Air control on again in Settings to use it.".into() });
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    // The flags are global: these tests take turns.
    static SERIAL: parking_lot::Mutex<()> = parking_lot::Mutex::new(());

    fn fresh() {
        STOPPED.store(false, Ordering::SeqCst);
        PAUSED.store(0, Ordering::SeqCst);
        BUTTONS.store(0, Ordering::SeqCst);
        LAST_EYE.store(0, Ordering::SeqCst);
    }

    #[test]
    fn the_stop_latches_and_only_turning_air_on_again_rearms_it() {
        let _g = SERIAL.lock();
        fresh();
        assert!(allowed());
        stop("test");
        assert!(!allowed(), "stopped: nothing passes");
        assert!(!resume(), "resume never undoes an emergency stop");
        assert!(!allowed());
        assert!(!button_allowed(false, true), "no press while stopped");
        assert!(button_allowed(false, false), "letting go always passes");
        pause(Pause::Mouse);
        assert_eq!(PAUSED.load(Ordering::SeqCst), 0, "a pause doesn't replace a stop");
        arm();
        assert!(allowed(), "the person turning Air on again re-arms it");
    }

    #[test]
    fn a_pause_holds_until_the_person_resumes() {
        let _g = SERIAL.lock();
        fresh();
        pause(Pause::Keyboard);
        assert!(!allowed());
        assert_eq!(status().paused.as_deref(), Some("you used the keyboard"));
        pause(Pause::Mouse);
        assert_eq!(Pause::from(PAUSED.load(Ordering::SeqCst)), Some(Pause::Keyboard), "the first reason stays");
        assert!(resume());
        assert!(allowed());
    }

    #[test]
    fn held_buttons_are_tracked_so_they_can_be_let_go() {
        let _g = SERIAL.lock();
        fresh();
        assert!(button_allowed(false, true));
        assert!(button_allowed(true, true));
        assert_eq!(BUTTONS.load(Ordering::SeqCst), 3);
        assert!(button_allowed(false, false), "letting go is always allowed");
        assert_eq!(BUTTONS.load(Ordering::SeqCst), 3, "a button counts as let go only once its release went through");
        released(false);
        assert_eq!(BUTTONS.load(Ordering::SeqCst), 2, "left let go, right still held");
        BUTTONS.store(0, Ordering::SeqCst);
    }

    #[test]
    fn a_wandering_pointer_is_erratic_and_a_glance_is_not() {
        // A deliberate glance corner to corner and resting there: fine.
        let glance: Vec<(u64, f64, f64)> = (0..20).map(|i| (i * 50, (i as f64 / 6.0).min(1.0), (i as f64 / 6.0).min(1.0))).collect();
        assert!(!erratic(&glance, 950));
        // Jumping side to side every frame, as in the owner's test: erratic.
        let wander: Vec<(u64, f64, f64)> = (0..20).map(|i| (i * 50, if i % 2 == 0 { 0.1 } else { 0.9 }, 0.5)).collect();
        assert!(erratic(&wander, 950));
        // Too few looks to judge: not erratic.
        assert!(!erratic(&wander[..5], 250));
    }

    #[test]
    fn a_second_stop_only_retries_letting_go_and_the_eye_lane_is_remembered() {
        let _g = SERIAL.lock();
        fresh();
        stop("first");
        stop("second");
        assert!(!allowed(), "still stopped");
        arm();
        assert!(allowed(), "one arm undoes the one stop");
        set_eye_lane(true);
        assert!(eye_lane(), "with the eye lane selected every pointer move takes the gaze's checks");
        set_eye_lane(false);
        assert!(!eye_lane());
    }

    #[test]
    fn the_person_moving_the_mouse_is_noticed_and_tiny_rounding_is_not() {
        assert!(!moved_away((500, 500), (500, 501)));
        assert!(!moved_away((500, 500), (512, 490)));
        assert!(moved_away((500, 500), (540, 500)));
        assert!(moved_away((500, 500), (500, 300)));
    }

    #[test]
    fn the_stop_key_is_configurable_and_said_back_plainly() {
        let _g = SERIAL.lock();
        set_stop_key("Ctrl+Alt+Shift+X");
        assert_eq!(stop_key(), (1 | 2 | 4, 0x58));
        assert_eq!(stop_key_words(), "Ctrl+Alt+Shift+X");
        set_stop_key("Ctrl+Alt+F12");
        assert_eq!(stop_key_words(), "Ctrl+Alt+F12");
        set_stop_key("not a key");
        assert_eq!(stop_key_words(), "Ctrl+Alt+F12", "an unreadable combination keeps the last good one");
        set_stop_key("Ctrl+Alt+Shift+X");
    }

    #[test]
    fn voice_stops_pauses_and_resumes_and_leaves_music_alone() {
        let _g = SERIAL.lock();
        fresh();
        assert_eq!(voice("pause"), None, "plain pause with eye control not in use is the music's");
        assert_eq!(voice("what's the weather"), None);
        assert!(voice("Izuki, pause eye control.").is_some());
        assert!(!allowed());
        assert!(voice("resume eye control").is_some());
        assert!(allowed());
        LAST_EYE.store(now_ms().max(1), Ordering::SeqCst);
        assert!(voice("pause").is_some(), "plain pause while eye control is in use pauses it");
        assert!(voice("resume").is_some());
        assert!(allowed());
        assert_eq!(voice("Hey Izuki, stop eye control!").as_deref(), Some("Eye control stopped."));
        assert!(!allowed());
        assert!(voice("resume eye control").unwrap().contains("Turn Air control on again"), "voice never undoes the stop");
        arm();
        fresh();
    }
}
