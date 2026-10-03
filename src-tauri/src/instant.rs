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
}

/// The command in `said`, and the few words said back — or `None` when it's
/// anything more than a plain everyday command.
pub fn parse(said: &str) -> Option<(Act, &'static str)> {
    let (n, big) = normalise(said);
    let notches = if big { 12 } else { 5 };
    let keys = |key, times| Act::Keys { key, times };
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

fn step(v: serde_json::Value) -> ActionStep {
    // Built from JSON so a new ActionStep field never breaks this file.
    serde_json::from_value(v).expect("an instant step is always well-formed")
}

/// The steps for `act`, for the same runner every task uses (the hand goes
/// there, Esc stops it). `Minimize`, `Mute` and `Playing` aren't steps — see [`run_direct`].
pub fn steps(act: Act) -> Vec<ActionStep> {
    match act {
        Act::Scroll { down, notches } => {
            let (x, y) = middle_of_window().unwrap_or((0, 0));
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
        Act::Minimize | Act::Mute(_) | Act::Playing(_) => Vec::new(),
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
        _ => true,
    }
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
        volume.SetMute(on, std::ptr::null()).is_ok()
    }
}

#[cfg(not(windows))]
fn set_mute(_on: bool) -> bool {
    false
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
            "ctrl+home", "ctrl+end", "f", "f11",
        ] {
            assert!(crate::automation::key_is_known(key), "the hands can't press {key}");
        }
    }
}
