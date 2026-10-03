//! What the Island (the pill at the top of the screen) needs to know, in one
//! cheap look: what's playing — title, artist, cover — and whether the app
//! in front is full screen (a film or a game), when the Island steps aside.
//!
//! Asked about every couple of seconds while the overlay is up, off the UI
//! thread; the cover is read once per song, not on every look.

use serde::Serialize;

#[derive(Debug, Clone, Default, Serialize, PartialEq)]
pub struct NowPlaying {
    pub title: String,
    pub artist: String,
    /// Which app is playing it ("Spotify", "Chrome"…), tidied for people.
    pub app: String,
    pub playing: bool,
    /// The cover as a `data:` URL, when the player shares one.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub art: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize)]
pub struct IslandStatus {
    pub media: Option<NowPlaying>,
    pub fullscreen: bool,
}

pub fn status() -> IslandStatus {
    IslandStatus { media: now_playing(), fullscreen: front_is_fullscreen() }
}

/// "play", "pause", "next" or "previous" for what's playing. `false` if
/// nothing answered.
pub fn control(action: &str) -> bool {
    match action {
        "play" => crate::media::set_playing(true).unwrap_or(false),
        "pause" => crate::media::set_playing(false).unwrap_or(false),
        "next" | "previous" => skip(action == "next"),
        _ => false,
    }
}

/// "Microsoft.ZuneMusic_8wekyb3d8bbwe!Microsoft.ZuneMusic" → "Media Player",
/// "Spotify.exe" → "Spotify", "MSEdge" → "Edge".
fn app_name(id: &str) -> String {
    let lower = id.to_lowercase();
    for (needle, name) in [
        ("spotify", "Spotify"),
        ("zunemusic", "Media Player"),
        ("msedge", "Edge"),
        ("chrome", "Chrome"),
        ("firefox", "Firefox"),
        ("brave", "Brave"),
        ("opera", "Opera"),
        ("vlc", "VLC"),
        ("applemusic", "Apple Music"),
        ("itunes", "iTunes"),
        ("tidal", "Tidal"),
        ("deezer", "Deezer"),
        ("youtube", "YouTube"),
    ] {
        if lower.contains(needle) {
            return name.into();
        }
    }
    let tail = id.rsplit(['\\', '/', '!']).next().unwrap_or(id);
    tail.trim_end_matches(".exe").trim_end_matches(".EXE").to_string()
}

#[cfg(windows)]
mod imp {
    use super::NowPlaying;
    use base64::Engine;
    use parking_lot::Mutex;
    use windows::Media::Control::{
        GlobalSystemMediaTransportControlsSessionManager as Manager,
        GlobalSystemMediaTransportControlsSessionPlaybackStatus as Status,
    };

    /// The last cover read, keyed by "app|title|artist".
    static ART: Mutex<Option<(String, Option<String>)>> = Mutex::new(None);
    /// Covers bigger than this aren't worth sending 30 times a minute.
    const ART_MAX: u32 = 600 * 1024;

    pub fn now_playing() -> Option<NowPlaying> {
        let manager = crate::media::wait(Manager::RequestAsync().ok()?).ok()??;
        // What's playing beats what Windows calls "current" (which may be a
        // paused tab); otherwise the current one, paused.
        let sessions = manager.GetSessions().ok()?;
        let mut pick = None;
        for i in 0..sessions.Size().ok()? {
            let s = sessions.GetAt(i).ok()?;
            let id = s.SourceAppUserModelId().map(|a| a.to_string()).unwrap_or_default();
            if crate::media::is_izuki(&id) {
                continue;
            }
            let playing = s.GetPlaybackInfo().and_then(|p| p.PlaybackStatus()).is_ok_and(|st| st == Status::Playing);
            if playing {
                pick = Some((s, id, true));
                break;
            }
        }
        if pick.is_none() {
            let s = manager.GetCurrentSession().ok()?;
            let id = s.SourceAppUserModelId().map(|a| a.to_string()).unwrap_or_default();
            if crate::media::is_izuki(&id) {
                return None;
            }
            pick = Some((s, id, false));
        }
        let (session, id, playing) = pick?;
        let props = crate::media::wait(session.TryGetMediaPropertiesAsync().ok()?).ok()??;
        let title = props.Title().map(|t| t.to_string()).unwrap_or_default();
        if title.trim().is_empty() {
            return None;
        }
        let artist = props.Artist().map(|t| t.to_string()).unwrap_or_default();
        let app = super::app_name(&id);
        let key = format!("{app}|{title}|{artist}");
        let art = {
            let cached = ART.lock().clone();
            match cached {
                Some((k, a)) if k == key => a,
                _ => {
                    let a = props.Thumbnail().ok().and_then(|t| read_art(&t));
                    *ART.lock() = Some((key, a.clone()));
                    a
                }
            }
        };
        Some(NowPlaying { title, artist, app, playing, art })
    }

    fn read_art(thumb: &windows::Storage::Streams::IRandomAccessStreamReference) -> Option<String> {
        use windows::Storage::Streams::DataReader;
        let stream = crate::media::wait(thumb.OpenReadAsync().ok()?).ok()??;
        let size = stream.Size().ok()? as u32;
        if size == 0 || size > ART_MAX {
            return None;
        }
        let mime = stream.ContentType().map(|c| c.to_string()).ok().filter(|c| c.starts_with("image/"));
        let reader = DataReader::CreateDataReader(&stream.GetInputStreamAt(0).ok()?).ok()?;
        crate::ocr::wait(reader.LoadAsync(size).ok()?).ok()?;
        let mut buf = vec![0u8; size as usize];
        reader.ReadBytes(&mut buf).ok()?;
        let mime = mime.unwrap_or_else(|| if buf.starts_with(b"\x89PNG") { "image/png".into() } else { "image/jpeg".into() });
        Some(format!("data:{mime};base64,{}", base64::engine::general_purpose::STANDARD.encode(&buf)))
    }

    pub fn skip(next: bool) -> bool {
        let Ok(Some(manager)) = Manager::RequestAsync().and_then(crate::media::wait) else { return false };
        let Ok(session) = manager.GetCurrentSession() else { return false };
        let op = if next { session.TrySkipNextAsync() } else { session.TrySkipPreviousAsync() };
        op.ok().and_then(|op| crate::media::wait(op).ok().flatten()).unwrap_or(false)
    }

    /// The window in front fills its whole monitor (a full-screen video,
    /// a game, a slideshow) — not just maximised, which leaves the taskbar.
    pub fn front_is_fullscreen() -> bool {
        use windows::Win32::Foundation::{HWND, RECT};
        use windows::Win32::Graphics::Gdi::{GetMonitorInfoW, MonitorFromWindow, MONITORINFO, MONITOR_DEFAULTTONEAREST};
        use windows::Win32::UI::WindowsAndMessaging::{GetClassNameW, GetWindowRect};
        let Some(raw) = crate::uia::target_window() else { return false };
        let hwnd = HWND(raw as *mut core::ffi::c_void);
        unsafe {
            // The desktop itself is "full screen" but never in the way.
            let mut class = [0u16; 64];
            let n = GetClassNameW(hwnd, &mut class) as usize;
            let class = String::from_utf16_lossy(&class[..n.min(class.len())]);
            if matches!(class.as_str(), "Progman" | "WorkerW" | "Shell_TrayWnd") {
                return false;
            }
            let mut r = RECT::default();
            if GetWindowRect(hwnd, &mut r).is_err() {
                return false;
            }
            let mon = MonitorFromWindow(hwnd, MONITOR_DEFAULTTONEAREST);
            let mut info = MONITORINFO { cbSize: std::mem::size_of::<MONITORINFO>() as u32, ..Default::default() };
            if !GetMonitorInfoW(mon, &mut info).as_bool() {
                return false;
            }
            let m = info.rcMonitor;
            r.left <= m.left && r.top <= m.top && r.right >= m.right && r.bottom >= m.bottom
        }
    }
}

#[cfg(windows)]
use imp::{front_is_fullscreen, now_playing, skip};

#[cfg(not(windows))]
fn now_playing() -> Option<NowPlaying> {
    None
}
#[cfg(not(windows))]
fn skip(_next: bool) -> bool {
    false
}
#[cfg(not(windows))]
fn front_is_fullscreen() -> bool {
    false
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn players_get_names_people_know() {
        assert_eq!(app_name("Microsoft.ZuneMusic_8wekyb3d8bbwe!Microsoft.ZuneMusic"), "Media Player");
        assert_eq!(app_name("Spotify.exe"), "Spotify");
        assert_eq!(app_name("MSEdge"), "Edge");
        assert_eq!(app_name("Chrome"), "Chrome");
        assert_eq!(app_name("C:\\Apps\\Foobar2000.exe"), "Foobar2000");
    }

    /// Run by hand with something playing.
    #[test]
    #[ignore]
    fn reads_what_is_playing() {
        let s = status();
        let m = s.media.clone().map(|m| NowPlaying { art: m.art.map(|a| format!("{}… ({} chars)", &a[..30.min(a.len())], a.len())), ..m });
        println!("now playing: {m:?}\nfullscreen: {}", s.fullscreen);
    }
}
