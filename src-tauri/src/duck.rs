//! Turning other sounds down while Izuki listens — the way Siri lowers your
//! music when you talk to it. Music or a video playing on this PC reaches the
//! mic (and the speech model happily writes down the lyrics); a quieter room
//! means your words are what gets heard.
//!
//! Each app's own volume (the per-app sliders in Windows' Volume Mixer) is
//! lowered, never the master volume, and put back exactly as it was. Izuki's
//! own sound (its voice plays from its WebView2 helper) is left alone. If the
//! user moves a slider meanwhile, that app stays where they put it.

use std::sync::mpsc::{channel, RecvTimeoutError, Sender};
use std::sync::OnceLock;
use std::time::Duration;

/// Other apps go down to this share of their own volume.
#[cfg_attr(not(windows), allow(dead_code))]
const DUCKED_TO: f32 = 0.2;
/// However it's left, sound always comes back after this long — a listen
/// that never said "done" can't leave the music stuck quiet.
#[cfg_attr(not(windows), allow(dead_code))]
const SAFETY: Duration = Duration::from_secs(45);

static WORKER: OnceLock<Sender<bool>> = OnceLock::new();

/// Lower (`true`) or restore (`false`) other apps' sound. Returns at once;
/// the work happens on Izuki's audio thread.
pub fn set(on: bool) {
    let tx = WORKER.get_or_init(|| {
        let (tx, rx) = channel::<bool>();
        std::thread::Builder::new()
            .name("izuki-duck".into())
            .spawn(move || worker(rx))
            .ok();
        tx
    });
    let _ = tx.send(on);
}

#[cfg(windows)]
fn worker(rx: std::sync::mpsc::Receiver<bool>) {
    use windows::Win32::System::Com::{CoInitializeEx, COINIT_MULTITHREADED};
    unsafe {
        let _ = CoInitializeEx(None, COINIT_MULTITHREADED);
    }
    let mut ducked: Vec<imp::Ducked> = Vec::new();
    loop {
        let wait = if ducked.is_empty() { Duration::from_secs(3600) } else { SAFETY };
        match rx.recv_timeout(wait) {
            Ok(true) => {
                if ducked.is_empty() {
                    ducked = imp::duck_all();
                    if !ducked.is_empty() {
                        eprintln!("[duck] turned {} app(s) down while listening", ducked.len());
                    }
                }
            }
            Ok(false) | Err(RecvTimeoutError::Timeout) => {
                if !ducked.is_empty() {
                    imp::restore(std::mem::take(&mut ducked));
                    eprintln!("[duck] sound back up");
                }
            }
            Err(RecvTimeoutError::Disconnected) => {
                imp::restore(std::mem::take(&mut ducked));
                return;
            }
        }
    }
}

#[cfg(not(windows))]
fn worker(rx: std::sync::mpsc::Receiver<bool>) {
    while rx.recv().is_ok() {}
}

/// Put everything back — called on the way out, so quitting mid-listen
/// never leaves the music quiet.
pub fn restore_now() {
    if WORKER.get().is_some() {
        set(false);
        // Give the audio thread a moment before the process goes.
        std::thread::sleep(Duration::from_millis(150));
    }
}

#[cfg(windows)]
mod imp {
    use windows::core::Interface;
    use windows::Win32::Media::Audio::{
        eMultimedia, eRender, AudioSessionStateActive, IAudioSessionControl2, IAudioSessionManager2,
        IMMDeviceEnumerator, ISimpleAudioVolume, MMDeviceEnumerator,
    };
    use windows::Win32::System::Com::{CoCreateInstance, CLSCTX_ALL};

    pub struct Ducked {
        volume: ISimpleAudioVolume,
        was: f32,
        set_to: f32,
    }

    /// Processes whose sound is Izuki's own (its voice, its chimes).
    fn is_ours(pid: u32) -> bool {
        if pid == std::process::id() {
            return true;
        }
        let name = crate::uia::process_name(pid).to_ascii_lowercase();
        name == "msedgewebview2.exe" || name == "izuki.exe"
    }

    pub fn duck_all() -> Vec<Ducked> {
        let mut out = Vec::new();
        unsafe {
            let Ok(devices) = CoCreateInstance::<_, IMMDeviceEnumerator>(&MMDeviceEnumerator, None, CLSCTX_ALL) else {
                return out;
            };
            let Ok(speaker) = devices.GetDefaultAudioEndpoint(eRender, eMultimedia) else { return out };
            let Ok(manager) = speaker.Activate::<IAudioSessionManager2>(CLSCTX_ALL, None) else { return out };
            let Ok(sessions) = manager.GetSessionEnumerator() else { return out };
            let count = sessions.GetCount().unwrap_or(0);
            for i in 0..count {
                let Ok(control) = sessions.GetSession(i) else { continue };
                // Only apps actually making sound right now.
                if control.GetState().map(|s| s != AudioSessionStateActive).unwrap_or(true) {
                    continue;
                }
                let Ok(control2) = control.cast::<IAudioSessionControl2>() else { continue };
                // S_OK (0) means it *is* the system-sounds session.
                if control2.IsSystemSoundsSession().0 == 0 {
                    continue;
                }
                let pid = control2.GetProcessId().unwrap_or(0);
                if pid == 0 || is_ours(pid) {
                    continue;
                }
                let Ok(volume) = control.cast::<ISimpleAudioVolume>() else { continue };
                let Ok(was) = volume.GetMasterVolume() else { continue };
                if was < 0.03 {
                    continue;
                }
                let set_to = was * super::DUCKED_TO;
                if volume.SetMasterVolume(set_to, std::ptr::null()).is_ok() {
                    out.push(Ducked { volume, was, set_to });
                }
            }
        }
        out
    }

    pub fn restore(ducked: Vec<Ducked>) {
        for d in ducked {
            unsafe {
                // Moved by the user meanwhile? Leave it where they put it.
                let now = d.volume.GetMasterVolume().unwrap_or(d.set_to);
                if (now - d.set_to).abs() < 0.02 {
                    let _ = d.volume.SetMasterVolume(d.was, std::ptr::null());
                }
            }
        }
    }
}
