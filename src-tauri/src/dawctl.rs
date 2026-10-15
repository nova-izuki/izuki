//! Live control of any DAW, not just FL Studio: "record", "stop the beat",
//! "metronome on", "loop it", "go to the start", "save the project",
//! "undo that". Izuki brings the DAW to the front, checks it really is in
//! front, and presses that DAW's own default shortcut — never a guess: only
//! shortcuts each DAW ships with are used, and anything a DAW has no default
//! key for is said plainly instead of pressed.
//!
//! FL Studio keeps its deeper control (flstudio.rs, through its own
//! scripting); this is for Ableton, REAPER, Cubase, Studio One and the rest.

use anyhow::{anyhow, Result};

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Act {
    /// Play, or stop if playing (every DAW's space bar).
    PlayStop,
    /// Stop only — a dedicated stop key (Space would start it if stopped).
    Stop,
    Record,
    Undo,
    Save,
    Metronome,
    Loop,
    Start,
}

impl Act {
    fn words(self) -> &'static str {
        match self {
            Act::PlayStop => "play / stop",
            Act::Stop => "stop",
            Act::Record => "record",
            Act::Undo => "undo",
            Act::Save => "save the project",
            Act::Metronome => "the metronome",
            Act::Loop => "loop",
            Act::Start => "go back to the start",
        }
    }
}

/// One DAW's default shortcuts (Windows). `None`: it has no default key.
struct Keys {
    name: &'static str,
    /// A stop-only key (most DAWs only have Space, which also starts).
    stop: Option<&'static str>,
    record: Option<&'static str>,
    metronome: Option<&'static str>,
    looping: Option<&'static str>,
    start: Option<&'static str>,
}

const KEYS: &[Keys] = &[
    Keys { name: "Ableton Live", stop: None, record: Some("f9"), metronome: None, looping: None, start: Some("home") },
    Keys { name: "REAPER", stop: None, record: Some("ctrl+r"), metronome: None, looping: Some("r"), start: Some("home") },
    Keys { name: "Cubase", stop: Some("num0"), record: Some("num*"), metronome: Some("c"), looping: Some("num/"), start: Some("num.") },
    Keys { name: "Studio One", stop: Some("num0"), record: Some("num*"), metronome: Some("c"), looping: Some("num/"), start: None },
    Keys { name: "Reason", stop: Some("num0"), record: Some("num*"), metronome: Some("c"), looping: Some("l"), start: None },
    Keys { name: "Cakewalk", stop: None, record: Some("r"), metronome: None, looping: Some("l"), start: None },
    Keys { name: "Pro Tools", stop: None, record: Some("f12"), metronome: None, looping: None, start: None },
    Keys { name: "Ardour", stop: None, record: Some("shift+r"), metronome: None, looping: Some("l"), start: Some("home") },
    Keys { name: "Bitwig Studio", stop: None, record: None, metronome: None, looping: None, start: None },
    Keys { name: "LMMS", stop: None, record: None, metronome: None, looping: None, start: None },
    Keys { name: "Waveform", stop: None, record: None, metronome: None, looping: None, start: None },
    Keys { name: "MPC", stop: None, record: None, metronome: None, looping: None, start: None },
];

/// The key for `act` in `daw`, or None when it has no default.
fn key_for(daw: &str, act: Act) -> Option<&'static str> {
    match act {
        Act::PlayStop => Some("space"),
        Act::Undo => Some("ctrl+z"),
        Act::Save => Some("ctrl+s"),
        _ => {
            let k = KEYS.iter().find(|k| k.name == daw)?;
            match act {
                Act::Stop => k.stop,
                Act::Record => k.record,
                Act::Metronome => k.metronome,
                Act::Loop => k.looping,
                Act::Start => k.start,
                _ => None,
            }
        }
    }
}

/// "record in ableton", "stop the beat", "metronome on", "save the project"…
/// → (the act, the DAW to do it in). Only when it's clearly about the DAW:
/// a DAW is named, or one is open and the words are studio words. A plain
/// "play" / "pause" stays the music keys.
pub fn parse(said: &str) -> Option<Act> {
    let s = format!(" {} ", said.to_lowercase().replace(['?', '!', '.', ','], " ").split_whitespace().collect::<Vec<_>>().join(" "));
    let named = crate::daw::named(said).is_some_and(|d| d.name != "FL Studio");
    let studio = [" the beat", " the project", " the session", " the track", " the song", " in the daw", " my daw", " the loop"].iter().any(|w| s.contains(w));
    let stop = [" stop", " pause"].iter().any(|w| s.contains(w));
    let act = if s.contains(" metronome") || s.contains(" click track") {
        Act::Metronome
    } else if stop && (named || studio || s.contains(" recording") || s.contains(" playback")) {
        // "stop recording", "stop the beat", "pause the project": never a start.
        Act::Stop
    } else if [" record ", " record", " start recording", " recording now"].iter().any(|w| s.contains(w))
        && !stop
        && !s.contains(" screen")
        && !s.contains(" voice note")
        && !s.contains(" video")
        && !s.contains(" meeting")
    {
        Act::Record
    } else if s.contains(" go to the start") || s.contains(" back to the start") || s.contains(" rewind") || s.contains(" from the top") {
        Act::Start
    } else if (s.contains(" save") || s.contains(" ctrl s")) && (named || studio) {
        Act::Save
    } else if s.contains(" undo") && (named || studio) {
        Act::Undo
    } else if s.contains(" loop") {
        Act::Loop
    } else if s.contains(" play") && (named || studio) {
        Act::PlayStop
    } else {
        return None;
    };
    // Record / metronome / loop / back to the start are studio words only
    // while a DAW is open (or named); otherwise they're something else.
    if !named && !studio && !matches!(act, Act::PlayStop | Act::Stop) {
        let open = crate::daw::running().is_some_and(|d| d.name != "FL Studio");
        if !open {
            return None;
        }
    }
    Some(act)
}

/// Do it in the DAW that's named or open. Returns what to say.
pub fn run(said: &str, act: Act) -> String {
    let Some(daw) = crate::daw::named(said).or_else(crate::daw::running).filter(|d| d.name != "FL Studio") else {
        return "I don't see a music app open — open your DAW and ask again.".into();
    };
    let Some(key) = key_for(daw.name, act) else {
        if act == Act::Stop {
            return format!(
                "In {} the space bar both plays and stops, and I can't tell whether it's playing — so I didn't press it (it might have started it). Say “play/pause the beat” to toggle it.",
                daw.name
            );
        }
        return format!("{} has no default shortcut for {}, so I didn't press anything — click it in {} (or set a shortcut and tell me).", daw.name, act.words(), daw.name);
    };
    match press_in(daw, key) {
        Ok(()) => {
            eprintln!("[daw] {} → {key}", daw.name);
            match act {
                Act::PlayStop => format!("Pressed play/pause in {}.", daw.name),
                Act::Stop => format!("Stopped in {}.", daw.name),
                Act::Record => format!("Recording in {} — say “stop the beat” to stop.", daw.name),
                Act::Undo => format!("Undone in {}.", daw.name),
                Act::Save => format!("Saved your {} project.", daw.name),
                Act::Metronome => format!("Metronome switched in {}.", daw.name),
                Act::Loop => format!("Loop switched in {}.", daw.name),
                Act::Start => format!("Back to the start in {}.", daw.name),
            }
        }
        Err(e) => format!("I couldn't do that in {}: {e}", daw.name),
    }
}

/// Bring the DAW's window to the front, make sure it really is in front,
/// then press the key — never into some other window.
fn press_in(daw: &crate::daw::Daw, key: &str) -> Result<()> {
    let raw = window_of(daw).ok_or_else(|| anyhow!("its window isn't open"))?;
    if !crate::uia::raise_window(raw) {
        // Windows sometimes refuses the first time; once more after a moment.
        std::thread::sleep(std::time::Duration::from_millis(150));
        if !crate::uia::raise_window(raw) {
            return Err(anyhow!("Windows wouldn't bring it to the front — click it once and ask again"));
        }
    }
    std::thread::sleep(std::time::Duration::from_millis(120));
    if !daw.matches_process(&crate::uia::foreground_app()) {
        return Err(anyhow!("it wasn't in front, so I didn't press anything"));
    }
    crate::automation::press_key(key)
}

/// The DAW's main window (a visible top-level window of its process).
#[cfg(windows)]
fn window_of(daw: &crate::daw::Daw) -> Option<isize> {
    use windows::Win32::Foundation::{CloseHandle, HWND, LPARAM};
    use windows::Win32::System::Threading::{OpenProcess, QueryFullProcessImageNameW, PROCESS_NAME_WIN32, PROCESS_QUERY_LIMITED_INFORMATION};
    use windows::Win32::UI::WindowsAndMessaging::{EnumWindows, GetWindowTextLengthW, GetWindowThreadProcessId, IsWindowVisible};
    use windows_core::{BOOL, PWSTR};
    unsafe extern "system" fn each(h: HWND, l: LPARAM) -> BOOL {
        let v = &mut *(l.0 as *mut Vec<isize>);
        if IsWindowVisible(h).as_bool() && GetWindowTextLengthW(h) > 0 {
            v.push(h.0 as isize);
        }
        BOOL(1)
    }
    let mut hs: Vec<isize> = Vec::new();
    unsafe {
        let _ = EnumWindows(Some(each), LPARAM(&mut hs as *mut _ as isize));
    }
    hs.into_iter().find(|raw| {
        let h = HWND(*raw as *mut core::ffi::c_void);
        let mut pid = 0u32;
        unsafe { GetWindowThreadProcessId(h, Some(&mut pid)) };
        let Ok(p) = (unsafe { OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid) }) else { return false };
        let mut path = [0u16; 520];
        let mut len = path.len() as u32;
        let ok = unsafe { QueryFullProcessImageNameW(p, PROCESS_NAME_WIN32, PWSTR(path.as_mut_ptr()), &mut len) }.is_ok();
        unsafe {
            let _ = CloseHandle(p);
        }
        if !ok {
            return false;
        }
        let full = String::from_utf16_lossy(&path[..len as usize]);
        let exe = full.rsplit(['\\', '/']).next().unwrap_or("");
        daw.matches_process(exe)
    })
}

#[cfg(not(windows))]
fn window_of(_daw: &crate::daw::Daw) -> Option<isize> {
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn uses_only_each_daws_own_defaults() {
        assert_eq!(key_for("Ableton Live", Act::Record), Some("f9"));
        assert_eq!(key_for("REAPER", Act::Record), Some("ctrl+r"));
        assert_eq!(key_for("Cubase", Act::Metronome), Some("c"));
        assert_eq!(key_for("Ableton Live", Act::Metronome), None, "no default: said, not guessed");
        assert_eq!(key_for("Bitwig Studio", Act::PlayStop), Some("space"));
        for k in KEYS {
            for act in [Act::Stop, Act::Record, Act::Metronome, Act::Loop, Act::Start] {
                if let Some(key) = key_for(k.name, act) {
                    assert!(crate::automation::key_is_known(key), "{} {act:?}: {key}", k.name);
                }
            }
        }
    }

    #[test]
    fn studio_words_not_everyday_ones() {
        assert_eq!(parse("record in ableton"), Some(Act::Record));
        assert_eq!(parse("stop the beat"), Some(Act::Stop));
        assert_eq!(parse("stop recording in ableton"), Some(Act::Stop), "never starts a recording");
        assert_eq!(parse("play the beat"), Some(Act::PlayStop));
        assert_eq!(key_for("Ableton Live", Act::Stop), None, "Space would start it: said, not pressed");
        assert_eq!(key_for("Cubase", Act::Stop), Some("num0"));
        assert_eq!(key_for("Cubase", Act::Start), Some("num."));
        assert_eq!(parse("save the project in reaper"), Some(Act::Save));
        assert_eq!(parse("play"), None, "plain play stays the music keys");
        assert_eq!(parse("record my screen"), None);
        assert_eq!(parse("save this document"), None);
        assert_eq!(parse("make a trap beat in fl studio"), None);
    }
}
