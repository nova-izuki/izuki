//! Pausing whatever else is playing before Izuki starts a song — the way a
//! phone stops one app's music when another starts. Without it, "play Burna
//! Boy" left Spotify (or another tab) playing underneath the new video.
//!
//! Uses Windows' media sessions (the play/pause controls in the volume
//! pop-up), so only things that are actually *playing* are paused — never a
//! toggle that could start something the user had paused. Izuki's own voice
//! is left alone.

use std::time::Duration;

/// How long Windows gets to answer; a stuck media service must never hold
/// up the song that was asked for.
#[cfg_attr(not(windows), allow(dead_code))]
const PATIENCE: Duration = Duration::from_millis(1500);

/// Pause every other app that is playing sound. Returns how many it paused.
#[cfg(windows)]
pub fn pause_others() -> usize {
    match try_pause_others() {
        Ok(n) => {
            if n > 0 {
                eprintln!("[media] paused {n} other player(s)");
            }
            n
        }
        Err(e) => {
            eprintln!("[media] couldn't check other players: {e}");
            0
        }
    }
}

#[cfg(not(windows))]
pub fn pause_others() -> usize {
    0
}

#[cfg(windows)]
fn try_pause_others() -> windows_core::Result<usize> {
    use windows::Media::Control::{
        GlobalSystemMediaTransportControlsSessionManager as Manager,
        GlobalSystemMediaTransportControlsSessionPlaybackStatus as Status,
    };
    let Some(manager) = wait(Manager::RequestAsync()?)? else { return Ok(0) };
    let sessions = manager.GetSessions()?;
    let mut paused = 0;
    for i in 0..sessions.Size()? {
        let session = sessions.GetAt(i)?;
        let app = session.SourceAppUserModelId().map(|s| s.to_string()).unwrap_or_default();
        if is_izuki(&app) {
            continue;
        }
        let playing = session.GetPlaybackInfo().and_then(|p| p.PlaybackStatus()).is_ok_and(|s| s == Status::Playing);
        if playing && wait(session.TryPauseAsync()?)?.unwrap_or(false) {
            paused += 1;
        }
    }
    Ok(paused)
}

/// "Pause" / "play" as a setting, not a toggle: "pause" when nothing is
/// playing must never *start* music, and "play" while music plays must not
/// stop it. `Some(true)` when it's done (or already that way); `None` when
/// Windows can't tell — then the caller falls back to the media key.
#[cfg(windows)]
pub fn set_playing(play: bool) -> Option<bool> {
    let done = if play { try_resume() } else { try_pause_others().map(|_| Some(true)) };
    match done {
        Ok(v) => v,
        Err(e) => {
            eprintln!("[media] couldn't reach the players: {e}");
            None
        }
    }
}

#[cfg(not(windows))]
pub fn set_playing(_play: bool) -> Option<bool> {
    None
}

/// Resume what was playing last (Windows' "current" player, else the first
/// paused one). Already playing is already done. `Ok(None)` if no player is
/// known at all.
#[cfg(windows)]
fn try_resume() -> windows_core::Result<Option<bool>> {
    use windows::Media::Control::{
        GlobalSystemMediaTransportControlsSessionManager as Manager,
        GlobalSystemMediaTransportControlsSessionPlaybackStatus as Status,
    };
    let Some(manager) = wait(Manager::RequestAsync()?)? else { return Ok(None) };
    let sessions = manager.GetSessions()?;
    let mut paused = Vec::new();
    for i in 0..sessions.Size()? {
        let session = sessions.GetAt(i)?;
        if is_izuki(&session.SourceAppUserModelId().map(|s| s.to_string()).unwrap_or_default()) {
            continue;
        }
        match session.GetPlaybackInfo().and_then(|p| p.PlaybackStatus()) {
            Ok(s) if s == Status::Playing => return Ok(Some(true)),
            Ok(_) => paused.push(session),
            Err(_) => {}
        }
    }
    let current = manager.GetCurrentSession().ok().filter(|c| {
        !is_izuki(&c.SourceAppUserModelId().map(|s| s.to_string()).unwrap_or_default())
    });
    let Some(pick) = current.or_else(|| paused.into_iter().next()) else { return Ok(None) };
    Ok(Some(wait(pick.TryPlayAsync()?)?.unwrap_or(false)))
}

/// Waits for a Windows answer, giving up (None) after `PATIENCE`.
#[cfg(windows)]
fn wait<T>(op: windows_future::IAsyncOperation<T>) -> windows_core::Result<Option<T>>
where
    T: windows_core::RuntimeType + 'static,
{
    use windows_future::AsyncStatus;
    let started = std::time::Instant::now();
    while op.Status()? == AsyncStatus::Started {
        if started.elapsed() > PATIENCE {
            let _ = op.Cancel();
            return Ok(None);
        }
        std::thread::sleep(Duration::from_millis(5));
    }
    op.GetResults().map(Some)
}

/// Izuki's own voice can show up as a media session; never pause it.
#[cfg_attr(not(windows), allow(dead_code))]
fn is_izuki(app_id: &str) -> bool {
    app_id.to_lowercase().contains("izuki")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn never_pauses_itself() {
        assert!(is_izuki("com.izuki.companion"));
        assert!(is_izuki("C:\\Program Files\\Izuki\\Izuki.exe"));
        assert!(!is_izuki("Spotify.exe"));
        assert!(!is_izuki("MSEdge"));
    }

    /// Run by hand: lists the players Windows knows, touching none of them.
    #[cfg(windows)]
    #[test]
    #[ignore]
    fn lists_players() {
        use windows::Media::Control::GlobalSystemMediaTransportControlsSessionManager as Manager;
        let started = std::time::Instant::now();
        let manager = wait(Manager::RequestAsync().unwrap()).unwrap().expect("Windows answered");
        let sessions = manager.GetSessions().unwrap();
        for i in 0..sessions.Size().unwrap() {
            let s = sessions.GetAt(i).unwrap();
            let status = s.GetPlaybackInfo().and_then(|p| p.PlaybackStatus()).map(|st| st.0);
            println!("player {:?} status {:?}", s.SourceAppUserModelId().map(|a| a.to_string()), status);
        }
        println!("asked in {:?}", started.elapsed());
    }

    /// Run by hand: pauses what's playing, then plays it again.
    #[test]
    #[ignore]
    fn pause_then_play_sets_rather_than_toggles() {
        println!("pause: {:?}", set_playing(false));
        println!("pause again (must stay paused): {:?}", set_playing(false));
        std::thread::sleep(Duration::from_secs(2));
        println!("play: {:?}", set_playing(true));
        println!("play again (must keep playing): {:?}", set_playing(true));
    }

    /// Run by hand with music playing: it should stop, and report 1.
    #[test]
    #[ignore]
    fn pauses_what_is_playing() {
        println!("paused {}", pause_others());
    }
}
