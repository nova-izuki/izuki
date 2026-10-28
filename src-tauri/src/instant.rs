//! Instant commands: the everyday things people say to a computer —
//! "scroll down", "louder", "pause", "next song", "go back", "new tab" —
//! done at once, with no AI asked. Like Siri: nothing to wait for and
//! nothing for a model to get wrong ("scroll down again" used to get a free
//! model's essay about what the user wants instead of a scroll).
//!
//! Only a whole, plain command matches. Anything more ("scroll down and
//! click the second video") goes to the brain as usual.

use serde_json::json;

use crate::model::ActionStep;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Act {
    /// Turn the wheel over the middle of the window in front.
    Scroll { down: bool, notches: i32 },
    /// Press a key (or combination) `times` times.
    Keys { key: &'static str, times: usize },
    /// Full screen: YouTube's own `f`, otherwise the browser's F11.
    FullScreen,
    /// Minimise the window in front (not Win+Down, which only un-maximises
    /// a maximised window — and a second press would hit another window).
    Minimize,
    /// Sound on or off for the whole PC — set, not toggled, so "unmute"
    /// never mutes a PC that was already playing.
    Mute(bool),
    /// Music or video playing (`true`) or paused — set, not toggled, so
    /// "pause" never starts something that was quiet.
    Playing(bool),
    /// The whole PC's volume set to a level, 0–100 — "set the volume to 30"
    /// rather than eleven presses of the volume key, which lands wherever it
    /// lands and is never quite right.
    SetVolume(u8),
    /// A fact the PC already knows (the time, the date, the day), answered
    /// from the clock with no AI and no network — see [`spoken`].
    Tell(Tell),
}

/// The things Izuki can answer itself, without asking a model.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Tell {
    Time,
    Date,
    Day,
    Battery,
}

/// The command in `said`, and the few words said back — or `None` when it's
/// anything more than a plain everyday command.
pub fn parse(said: &str) -> Option<(Act, &'static str)> {
    let (n, big) = normalise(said);
    let notches = if big { 12 } else { 5 };
    let keys = |key, times| Act::Keys { key, times };
    // "Set the volume to 30" is a level, not a nudge — handled before the
    // list so every wording ("volume 30", "volume to 30 percent", "half
    // volume") lands on the same number instead of needing its own arm.
    if let Some(level) = volume_level(&n) {
        return Some((Act::SetVolume(level), "Volume set."));
    }
    Some(match n.as_str() {
        "scroll down" | "scroll" | "down" | "keep scrolling" | "scroll it down" | "scroll the page down"
        | "scroll down the page" | "page down" | "go down" | "move down" | "go further down" => {
            (Act::Scroll { down: true, notches }, "Scrolling down.")
        }
        "scroll up" | "up" | "scroll back up" | "scroll it up" | "scroll the page up" | "scroll up the page"
        | "page up" | "go up" | "move up" | "go back up" | "go further up" => (Act::Scroll { down: false, notches }, "Scrolling up."),
        "scroll to the top" | "go to the top" | "top of the page" | "back to the top" | "to the top"
        | "go to the top of the page" | "scroll all the way up" => (keys("ctrl+home", 1), "Back to the top."),
        "scroll to the bottom" | "go to the bottom" | "bottom of the page" | "to the bottom"
        | "go to the bottom of the page" | "scroll all the way down" => (keys("ctrl+end", 1), "All the way down."),

        "louder" | "volume up" | "turn it up" | "turn up the volume" | "turn the volume up" | "turn up"
        | "increase the volume" | "raise the volume" | "make it louder" | "turn up the sound" => {
            (keys("volumeup", 5), "Louder.")
        }
        "quieter" | "softer" | "volume down" | "turn it down" | "turn down the volume" | "turn the volume down"
        | "turn down" | "lower the volume" | "decrease the volume" | "reduce the volume" | "make it quieter"
        | "make it softer" | "turn down the sound" => (keys("volumedown", 5), "Quieter."),
        // Plain "mute" is Izuki's own (stop listening for its name).
        "mute the sound" | "mute the volume" | "mute the audio" | "mute the video" | "mute the music"
        | "mute my pc" | "mute my computer" | "mute the computer" | "mute the pc" | "mute my laptop"
        | "mute sound" | "mute audio" => (Act::Mute(true), "Muted."),
        "unmute" | "unmute it" | "unmute the sound" | "unmute the volume" | "unmute the audio"
        | "unmute the video" | "unmute the music" | "unmute my pc" | "unmute my computer" | "unmute sound"
        | "sound on" | "turn the sound on" | "turn the sound back on" => (Act::Mute(false), "Sound's on."),

        "pause" | "pause it" | "pause the music" | "pause the video" | "pause the song" | "pause music"
        | "pause video" | "pause that" | "stop the music" | "stop the video" | "stop the song" => {
            (Act::Playing(false), "Paused.")
        }
        "play" | "play it" | "resume" | "resume it" | "unpause" | "unpause it" | "keep playing"
        | "resume the music" | "resume the video" | "resume the song" | "play it again" => (Act::Playing(true), "Playing."),
        "next song" | "next track" | "skip song" | "skip this song" | "skip the song" | "skip this track"
        | "skip track" | "skip the track" | "play the next song" => (keys("nexttrack", 1), "Next one."),
        "previous song" | "previous track" | "last song" | "go back a song" | "play the previous song"
        | "play the last song" => (keys("prevtrack", 1), "Going back a song."),

        "go back" | "back" | "go back a page" | "previous page" | "go to the previous page" => {
            (keys("alt+left", 1), "Going back.")
        }
        "go forward" | "forward" | "go forward a page" => (keys("alt+right", 1), "Going forward."),
        "refresh" | "reload" | "refresh the page" | "reload the page" | "refresh it" | "reload it"
        | "refresh this page" | "refresh page" | "reload page" => (keys("f5", 1), "Refreshing."),

        "new tab" | "open a new tab" | "open new tab" | "a new tab" | "open a tab" => (keys("ctrl+t", 1), "New tab."),
        "close tab" | "close this tab" | "close the tab" | "close that tab" => (keys("ctrl+w", 1), "Closed it."),
        "next tab" | "switch tab" | "switch tabs" | "go to the next tab" => (keys("ctrl+tab", 1), "Next tab."),
        "previous tab" | "last tab" | "go to the previous tab" | "go to the last tab" => {
            (keys("ctrl+shift+tab", 1), "Previous tab.")
        }
        "reopen the tab" | "reopen that tab" | "reopen closed tab" | "reopen the closed tab" | "bring that tab back"
        | "bring back that tab" | "bring the tab back" | "undo close tab" => (keys("ctrl+shift+t", 1), "Brought it back."),

        "show desktop" | "show my desktop" | "show the desktop" | "minimize everything" | "minimise everything"
        | "minimize all" | "minimise all" | "hide everything" | "minimize all windows" | "minimise all windows" => {
            (keys("win+d", 1), "Here's your desktop.")
        }
        "switch window" | "switch windows" | "switch apps" | "switch app" | "other window" | "previous window"
        | "last window" | "switch back" => (keys("alt+tab", 1), "Switched."),
        "maximize" | "maximise" | "maximize it" | "maximise it" | "maximize this" | "maximise this"
        | "maximize the window" | "maximise the window" | "maximize this window" | "maximise this window" => {
            (keys("win+up", 1), "Made it bigger.")
        }
        "minimize" | "minimise" | "minimize it" | "minimise it" | "minimize this" | "minimise this"
        | "minimize the window" | "minimise the window" | "minimize this window" | "minimise this window" => {
            (Act::Minimize, "Minimised it.")
        }
        "snap left" | "snap it left" | "snap to the left" | "snap this to the left" | "put it on the left"
        | "left half" | "left half of the screen" | "put it on the left half" | "make it half the screen on the left" => {
            (keys("win+left", 1), "Snapped left.")
        }
        "snap right" | "snap it right" | "snap to the right" | "snap this to the right" | "put it on the right"
        | "right half" | "right half of the screen" | "put it on the right half" | "make it half the screen on the right" => {
            (keys("win+right", 1), "Snapped right.")
        }
        "lock my pc" | "lock the pc" | "lock my computer" | "lock the computer" | "lock the screen"
        | "lock my screen" | "lock my laptop" | "lock the laptop" | "lock it" => {
            (keys("win+l", 1), "Locking up.")
        }
        "screenshot" | "take a screenshot" | "take screenshot" | "grab a screenshot" | "screen shot"
        | "take a screen shot" | "capture the screen" | "capture my screen" | "take a capture" => {
            (keys("win+shift+s", 1), "Pick the part you want.")
        }
        "task manager" | "open task manager" | "show task manager" | "open the task manager"
        | "taskmanager" => (keys("ctrl+shift+esc", 1), "Task Manager."),

        // The clock is right here: answering from it is instant, free, and
        // can't be got wrong by a model — so these never go to the AI.
        "what time is it" | "what's the time" | "what is the time" | "the time" | "tell me the time"
        | "whats the time" | "what time is it now" | "time please" => (Act::Tell(Tell::Time), "One moment."),
        "what's the date" | "what is the date" | "whats the date" | "what's today's date"
        | "what is today's date" | "whats todays date" | "today's date" | "the date" | "tell me the date" => {
            (Act::Tell(Tell::Date), "One moment.")
        }
        "what day is it" | "what day is today" | "what's the day" | "what is the day" | "whats the day"
        | "which day is it" | "tell me the day" => (Act::Tell(Tell::Day), "One moment."),
        "battery" | "battery level" | "battery status" | "my battery" | "how much battery"
        | "how much battery is left" | "how much battery do i have" | "what's my battery"
        | "whats my battery" | "am i charging" | "is it charging" | "battery percentage" => {
            (Act::Tell(Tell::Battery), "One moment.")
        }
        "full screen" | "fullscreen" | "make it full screen" | "go full screen" | "exit full screen"
        | "leave full screen" | "exit fullscreen" | "make it fullscreen" => (Act::FullScreen, "Full screen."),

        "zoom in" | "make the page bigger" => (keys("ctrl+=", 1), "Zoomed in."),
        "zoom out" | "make the page smaller" => (keys("ctrl+-", 1), "Zoomed out."),
        "reset zoom" | "reset the zoom" | "normal zoom" => (keys("ctrl+0", 1), "Back to normal size."),

        "undo" | "undo that" | "undo it" => (keys("ctrl+z", 1), "Undone."),
        "redo" | "redo that" | "redo it" => (keys("ctrl+y", 1), "Redone."),
        "select all" | "select everything" => (keys("ctrl+a", 1), "Selected everything."),
        "copy" | "copy that" | "copy it" | "copy this" => (keys("ctrl+c", 1), "Copied."),
        "paste" | "paste it" | "paste that" | "paste this" => (keys("ctrl+v", 1), "Pasted."),
        "save" | "save it" | "save this" | "save the file" | "save my work" | "save that" => (keys("ctrl+s", 1), "Saved."),
        _ => return None,
    })
}

/// Lower-case words only, with the politeness and fillers around a command
/// taken off ("hey izuki can you scroll down a bit more please" → "scroll
/// down"). `true` alongside when they asked for a lot ("a lot", "way down").
fn normalise(said: &str) -> (String, bool) {
    let lower = said.to_lowercase().replace('\u{2019}', "'");
    let cleaned: String = lower
        .chars()
        .map(|c| if c.is_alphanumeric() || c == '\'' { c } else { ' ' })
        .collect();
    let mut words: Vec<&str> = cleaned.split_whitespace().collect();
    let mut big = false;

    const LEAD: &[&[&str]] = &[
        &["hey"], &["hi"], &["ok"], &["okay"], &["yo"], &["izuki"], &["nova"], &["please"], &["pls"],
        &["can", "you"], &["could", "you"], &["would", "you"], &["will", "you"], &["just"],
        &["go", "ahead", "and"], &["now"], &["bro"], &["and"], &["then"],
    ];
    const TRAIL: &[&[&str]] = &[
        &["please"], &["pls"], &["for", "me"], &["now"], &["again"], &["a", "little", "bit"],
        &["a", "little"], &["a", "bit"], &["bit"], &["some"], &["more"], &["thanks"], &["thank", "you"],
        &["bro"], &["izuki"], &["nova"], &["one", "more", "time"], &["once", "more"],
    ];
    const BIG: &[&[&str]] = &[&["a", "lot"], &["a", "lot", "more"], &["loads"], &["way", "more"]];

    loop {
        let before = words.len();
        for lead in LEAD {
            if words.len() > lead.len() && words.starts_with(lead) {
                words.drain(..lead.len());
            }
        }
        for trail in TRAIL {
            if words.len() > trail.len() && words.ends_with(trail) {
                words.truncate(words.len() - trail.len());
            }
        }
        for b in BIG {
            if words.len() > b.len() && words.ends_with(b) {
                words.truncate(words.len() - b.len());
                big = true;
            }
        }
        if words.len() == before {
            break;
        }
    }
    (words.join(" "), big)
}

/// The level asked for in "set the volume to 30", "volume 50", "volume to
/// 30 percent", "half volume", "max volume" — `None` for anything that isn't
/// a level ("volume up", "turn it down", "mute"), which keep their own
/// commands.
///
/// Any wording that names the volume and a number is a level; the position of
/// the number doesn't matter, so "volume to 30", "30 percent volume" and
/// "set the volume at 30 please" are one request.
fn volume_level(n: &str) -> Option<u8> {
    let words: Vec<&str> = n.split_whitespace().collect();
    if !words.contains(&"volume") {
        return None;
    }
    // Only the words a plain volume command is made of. A nudge ("volume
    // down") is not a level, and "set the volume to 30 and open Spotify" is
    // two jobs — it has to go to the brain whole, not have its first half
    // done silently while the rest is ignored.
    const ALLOWED: &[&str] = &[
        "set", "the", "volume", "level", "is", "to", "at", "percent", "please", "turn", "my", "pc",
        "computer", "speakers", "sound", "a", "of", "max", "maximum", "full", "half", "halfway", "off",
        "zero", "now", "hey", "izuki", "nova",
    ];
    if words
        .iter()
        .any(|w| !ALLOWED.contains(w) && w.trim_end_matches('%').parse::<u8>().is_err())
    {
        return None;
    }
    for w in &words {
        if let Ok(level) = w.trim_end_matches('%').parse::<u8>() {
            return (level <= 100).then_some(level);
        }
    }
    if words.iter().any(|w| ["max", "maximum", "full"].contains(w)) {
        return Some(100);
    }
    if words.iter().any(|w| ["half", "halfway"].contains(w)) {
        return Some(50);
    }
    if words.iter().any(|w| ["off", "zero"].contains(w)) {
        return Some(0);
    }
    None
}

fn step(v: serde_json::Value) -> ActionStep {
    // Built from JSON so a new ActionStep field never breaks this file.
    serde_json::from_value(v).expect("an instant step is always well-formed")
}

/// The steps for `act`, for the same runner every task uses (the hand goes
/// there, Esc stops it). `Minimize`, `Mute` and `Playing` aren't steps — see [`run_direct`].
pub fn steps(act: Act) -> Vec<ActionStep> {
    match act {
        Act::Scroll { down, notches } => {
            // Where a person would put the pointer to scroll: over the window,
            // or failing that where their pointer already is.
            //
            // This used to fall back to (0, 0) — the very corner of the
            // screen — so whenever there was no usable foreground window
            // "scroll down" turned the wheel over the desktop and nothing
            // moved, with no error to explain it.
            let (x, y) = middle_of_window()
                .or_else(|| Some(crate::capture::cursor_pos()).filter(|p| *p != (0, 0)))
                .unwrap_or_else(middle_of_screen);
            vec![step(json!({
                "action": "scroll", "x": x, "y": y,
                "key": if down { "down" } else { "up" },
                "scroll_amount": notches, "confidence": 1.0, "reasoning": "instant command"
            }))]
        }
        Act::Keys { key, times } => (0..times)
            .map(|_| step(json!({ "action": "key", "key": key, "confidence": 1.0, "reasoning": "instant command" })))
            .collect(),
        Act::FullScreen => {
            let key = if crate::uia::foreground_title().to_lowercase().contains("youtube") { "f" } else { "f11" };
            vec![step(json!({ "action": "key", "key": key, "confidence": 1.0, "reasoning": "instant command" }))]
        }
        Act::Minimize | Act::Mute(_) | Act::Playing(_) | Act::SetVolume(_) | Act::Tell(_) => Vec::new(),
    }
}

/// Do the acts that aren't mouse or keyboard steps. `false` if it couldn't.
pub fn run_direct(act: Act) -> bool {
    match act {
        Act::Minimize => minimize_front(),
        Act::Mute(on) => set_mute(on),
        // Windows couldn't say what's playing: the media key, as before.
        Act::Playing(play) => crate::media::set_playing(play)
            .unwrap_or_else(|| crate::automation::press_key("playpause").is_ok()),
        Act::SetVolume(level) => set_volume(level),
        // Nothing to do: the answer is the clock, read in [`spoken`].
        Act::Tell(_) => true,
        _ => true,
    }
}

/// The words said back for an act whose answer isn't fixed — today the clock.
/// `None` for every other act, whose reply is already in [`parse`].
pub fn spoken(act: Act) -> Option<String> {
    use chrono::{Local, Timelike};
    let now = Local::now();
    match act {
        Act::Tell(Tell::Time) => {
            // "It's 3:42 PM" — 12-hour with no leading zero, the way it's said;
            // midnight and noon are both 12, which `hour12` already gives.
            let hour = now.hour12().1;
            let half = if now.minute() < 10 { format!("0{}", now.minute()) } else { now.minute().to_string() };
            let ampm = if now.hour() < 12 { "AM" } else { "PM" };
            Some(format!("It's {hour}:{half} {ampm}."))
        }
        Act::Tell(Tell::Date) => {
            Some(format!("Today is {}.", now.format("%A, %-d %B %Y")))
        }
        Act::Tell(Tell::Day) => Some(format!("It's {}.", now.format("%A"))),
        Act::Tell(Tell::Battery) => Some(battery_line()),
        _ => None,
    }
}

/// What the battery is doing, in words — a desktop that has no battery says
/// so rather than going quiet or inventing a number.
#[cfg(windows)]
fn battery_line() -> String {
    use windows::Win32::System::Power::{GetSystemPowerStatus, SYSTEM_POWER_STATUS};
    let mut status = SYSTEM_POWER_STATUS::default();
    if unsafe { GetSystemPowerStatus(&mut status) }.is_err() {
        return "I can't read the battery on this PC.".to_string();
    }
    // 255 is Windows saying "no battery" / "not known" — a desktop on mains.
    if status.BatteryLifePercent == 255 {
        return "This PC has no battery — it's on mains power.".to_string();
    }
    let percent = u32::from(status.BatteryLifePercent);
    let charging = status.ACLineStatus == 1;
    match (charging, percent <= 20) {
        (true, _) => format!("{percent}% and charging."),
        (false, true) => format!("{percent}% — that's low. Plug in when you can."),
        (false, false) => format!("{percent}%."),
    }
}

#[cfg(not(windows))]
fn battery_line() -> String {
    "I can only read the battery on Windows.".to_string()
}

/// The middle of the desktop — the last resort for "scroll down" when there
/// is no window in front and no pointer position to go by. Anywhere on the
/// screen beats the corner, where the wheel reaches nothing.
fn middle_of_screen() -> (i32, i32) {
    let b = crate::capture::virtual_bounds();
    (b.x + b.w / 2, b.y + b.h / 2)
}

/// Middle of the window in front, so "scroll down" turns the page — not
/// whatever the mouse happens to rest on (the orb, where a wheel resizes it).
#[cfg(windows)]
fn middle_of_window() -> Option<(i32, i32)> {
    use windows::Win32::Foundation::{HWND, RECT};
    use windows::Win32::UI::WindowsAndMessaging::GetWindowRect;
    let raw = crate::uia::target_window()?;
    let mut r = RECT::default();
    unsafe { GetWindowRect(HWND(raw as *mut core::ffi::c_void), &mut r).ok()? };
    if r.right <= r.left || r.bottom <= r.top {
        return None;
    }
    Some(((r.left + r.right) / 2, (r.top + r.bottom) / 2))
}

#[cfg(not(windows))]
fn middle_of_window() -> Option<(i32, i32)> {
    None
}

#[cfg(windows)]
fn minimize_front() -> bool {
    use windows::Win32::Foundation::HWND;
    use windows::Win32::UI::WindowsAndMessaging::{ShowWindow, SW_MINIMIZE};
    let Some(raw) = crate::uia::target_window() else { return false };
    unsafe {
        let _ = ShowWindow(HWND(raw as *mut core::ffi::c_void), SW_MINIMIZE);
    }
    true
}

#[cfg(not(windows))]
fn minimize_front() -> bool {
    false
}

#[cfg(windows)]
fn set_mute(on: bool) -> bool {
    with_volume(|volume| unsafe { volume.SetMute(on, std::ptr::null()).is_ok() })
}

/// Set the whole PC's volume to `level` (0–100). Fails rather than guessing on
/// a machine whose audio stack won't answer, so "volume 30" can say it didn't
/// work instead of leaving the volume where it was.
#[cfg(windows)]
fn set_volume(level: u8) -> bool {
    let scalar = f32::from(level.min(100)) / 100.0;
    with_volume(|volume| unsafe { volume.SetMasterVolumeLevelScalar(scalar, std::ptr::null()).is_ok() })
}

#[cfg(not(windows))]
fn set_volume(_level: u8) -> bool {
    false
}

/// The default speakers' volume control, opened once per call.
#[cfg(windows)]
fn with_volume(
    f: impl FnOnce(&windows::Win32::Media::Audio::Endpoints::IAudioEndpointVolume) -> bool,
) -> bool {
    use windows::Win32::Media::Audio::Endpoints::IAudioEndpointVolume;
    use windows::Win32::Media::Audio::{eMultimedia, eRender, IMMDeviceEnumerator, MMDeviceEnumerator};
    use windows::Win32::System::Com::{CoCreateInstance, CoInitializeEx, CLSCTX_ALL, COINIT_MULTITHREADED};
    unsafe {
        let _ = CoInitializeEx(None, COINIT_MULTITHREADED);
        let Ok(devices) = CoCreateInstance::<_, IMMDeviceEnumerator>(&MMDeviceEnumerator, None, CLSCTX_ALL) else {
            return false;
        };
        let Ok(speaker) = devices.GetDefaultAudioEndpoint(eRender, eMultimedia) else { return false };
        let Ok(volume) = speaker.Activate::<IAudioEndpointVolume>(CLSCTX_ALL, None) else { return false };
        f(&volume)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn act(s: &str) -> Option<Act> {
        parse(s).map(|(a, _)| a)
    }

    #[test]
    fn plain_commands_match_through_the_fillers() {
        assert_eq!(act("scroll down again"), Some(Act::Scroll { down: true, notches: 5 }));
        assert_eq!(act("Hey Izuki, can you scroll down a bit more please?"), Some(Act::Scroll { down: true, notches: 5 }));
        assert_eq!(act("scroll down a lot"), Some(Act::Scroll { down: true, notches: 12 }));
        assert_eq!(act("scroll up"), Some(Act::Scroll { down: false, notches: 5 }));
        assert_eq!(act("louder"), Some(Act::Keys { key: "volumeup", times: 5 }));
        assert_eq!(act("turn it down please"), Some(Act::Keys { key: "volumedown", times: 5 }));
        assert_eq!(act("pause the video"), Some(Act::Playing(false)));
        assert_eq!(act("resume the music"), Some(Act::Playing(true)));
        assert_eq!(act("next song"), Some(Act::Keys { key: "nexttrack", times: 1 }));
        assert_eq!(act("go back"), Some(Act::Keys { key: "alt+left", times: 1 }));
        assert_eq!(act("open a new tab"), Some(Act::Keys { key: "ctrl+t", times: 1 }));
        assert_eq!(act("unmute"), Some(Act::Mute(false)));
        assert_eq!(act("mute the sound"), Some(Act::Mute(true)));
        assert_eq!(act("minimize this window"), Some(Act::Minimize));
    }

    #[test]
    fn a_volume_level_is_a_number_not_a_nudge() {
        assert_eq!(act("set the volume to 30"), Some(Act::SetVolume(30)));
        assert_eq!(act("volume 45"), Some(Act::SetVolume(45)));
        assert_eq!(act("volume to 30 percent"), Some(Act::SetVolume(30)));
        assert_eq!(act("Hey Izuki, turn the volume to 15 please"), Some(Act::SetVolume(15)));
        assert_eq!(act("volume max"), Some(Act::SetVolume(100)));
        assert_eq!(act("half volume"), Some(Act::SetVolume(50)));
        assert_eq!(act("volume 0"), Some(Act::SetVolume(0)));
        // Nudges, mute and nonsense stay what they were.
        assert_eq!(act("volume up"), Some(Act::Keys { key: "volumeup", times: 5 }));
        assert_eq!(act("mute the sound"), Some(Act::Mute(true)));
        assert_eq!(act("volume 200"), None);
        assert_eq!(act("volume"), None);
        assert_eq!(act("volume is 30"), Some(Act::SetVolume(30)));
        // Two jobs in one sentence are the brain's: half-done silently is worse
        // than not done at all.
        assert_eq!(act("set the volume to 30 and open spotify"), None);
        assert_eq!(act("volume 30 then play my playlist"), None);
    }

    #[test]
    fn the_clock_answers_itself() {
        assert_eq!(act("what time is it"), Some(Act::Tell(Tell::Time)));
        assert_eq!(act("Hey Izuki, what's the time?"), Some(Act::Tell(Tell::Time)));
        assert_eq!(act("what's today's date"), Some(Act::Tell(Tell::Date)));
        assert_eq!(act("what day is it"), Some(Act::Tell(Tell::Day)));
        // And the answer is a real sentence, not a placeholder.
        let time = spoken(Act::Tell(Tell::Time)).unwrap();
        assert!(time.starts_with("It's ") && time.ends_with('.'), "{time}");
        let date = spoken(Act::Tell(Tell::Date)).unwrap();
        assert!(date.starts_with("Today is "), "{date}");
        assert_eq!(act("how much battery is left"), Some(Act::Tell(Tell::Battery)));
        // Always an answer, never silence — a desktop says it has no battery.
        assert!(!spoken(Act::Tell(Tell::Battery)).unwrap().is_empty());
    }

    #[test]
    fn the_rest_of_the_pc_is_reachable_by_voice() {
        assert_eq!(act("snap left"), Some(Act::Keys { key: "win+left", times: 1 }));
        assert_eq!(act("snap it right"), Some(Act::Keys { key: "win+right", times: 1 }));
        assert_eq!(act("lock my pc"), Some(Act::Keys { key: "win+l", times: 1 }));
        assert_eq!(act("take a screenshot"), Some(Act::Keys { key: "win+shift+s", times: 1 }));
        assert_eq!(act("open task manager"), Some(Act::Keys { key: "ctrl+shift+esc", times: 1 }));
    }

    #[test]
    fn anything_more_than_a_plain_command_goes_to_the_brain() {
        assert_eq!(act("scroll down and click the second video"), None);
        assert_eq!(act("play burna boy"), None);
        assert_eq!(act("open youtube"), None);
        assert_eq!(act("what's on my screen"), None);
        assert_eq!(act("close it"), None);
        assert_eq!(act("next"), None);
        // Izuki's own "mute" (stop listening) and "stop" stay Izuki's.
        assert_eq!(act("mute"), None);
        assert_eq!(act("stop"), None);
        assert_eq!(act(""), None);
    }

    #[test]
    fn every_key_command_is_one_the_hands_can_press() {
        for key in [
            "volumeup", "volumedown", "playpause", "nexttrack", "prevtrack", "alt+left", "alt+right", "f5",
            "ctrl+t", "ctrl+w", "ctrl+tab", "ctrl+shift+tab", "ctrl+shift+t", "win+d", "alt+tab", "win+up",
            "ctrl+=", "ctrl+-", "ctrl+0", "ctrl+z", "ctrl+y", "ctrl+a", "ctrl+c", "ctrl+v", "ctrl+s",
            "ctrl+home", "ctrl+end", "f", "f11", "win+left", "win+right", "win+l", "win+shift+s",
            "ctrl+shift+esc",
        ] {
            assert!(crate::automation::key_is_known(key), "the hands can't press {key}");
        }
    }
}
