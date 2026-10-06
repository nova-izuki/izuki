//! "Take a screenshot", "record my screen", "stop recording" — done at once,
//! no AI. Screenshots go to Pictures › Screenshots (and the clipboard);
//! recordings to Videos › Izuki Recordings, made with FFmpeg (free — Izuki
//! offers to install it the first time).

use std::io::Write;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::time::{Duration, Instant};

use anyhow::{anyhow, Result};
use parking_lot::Mutex;

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Shot {
    Picture,
    RecordStart,
    RecordStop,
}

pub fn parse(said: &str) -> Option<Shot> {
    let s = said.to_lowercase();
    let s = s.trim().trim_end_matches(['.', '!', '?']);
    if s.split_whitespace().count() > 10 {
        return None;
    }
    let screen = s.contains("screen") || s.contains("display") || s.contains("desktop");
    if (s.contains("stop") || s.contains("end") || s.contains("finish")) && s.contains("record") {
        return Some(Shot::RecordStop);
    }
    if (s.contains("record") || s.contains("recording")) && (screen || s.starts_with("record") || s.contains("start recording")) && !s.contains("audio") && !s.contains("voice") {
        return Some(Shot::RecordStart);
    }
    if s.contains("screenshot") || s.contains("screen shot") || s.contains("screengrab") || (screen && (s.contains("capture") || s.contains("snap") || s.contains("picture of"))) {
        return Some(Shot::Picture);
    }
    None
}

pub fn run(shot: Shot) -> Result<String> {
    match shot {
        Shot::Picture => picture(),
        Shot::RecordStart => record_start(),
        Shot::RecordStop => record_stop(),
    }
}

fn stamp() -> String {
    chrono::Local::now().format("%Y-%m-%d %H.%M.%S").to_string()
}

fn picture() -> Result<String> {
    if crate::uia::screen_locked() {
        return Err(anyhow!("Your PC is locked, so there's nothing to capture."));
    }
    let frame = crate::capture::capture_all()?;
    let dir = dirs::picture_dir().ok_or_else(|| anyhow!("no Pictures folder"))?.join("Screenshots");
    std::fs::create_dir_all(&dir)?;
    let path = dir.join(format!("Izuki {}.png", stamp()));
    std::fs::write(&path, frame.to_png()?)?;
    // On the clipboard too, ready to paste.
    let copied = frame.rgba().and_then(|(w, h, bytes)| {
        arboard::Clipboard::new().ok()?.set_image(arboard::ImageData { width: w as usize, height: h as usize, bytes: bytes.into() }).ok()
    });
    Ok(format!(
        "Got it — saved to Pictures › Screenshots{}.",
        if copied.is_some() { " and copied, so you can paste it anywhere" } else { "" }
    ))
}

// ---- recording ---------------------------------------------------------------------

struct Recording {
    child: Child,
    path: PathBuf,
    started: Instant,
}
static RECORDING: Mutex<Option<Recording>> = Mutex::new(None);
const LONGEST: Duration = Duration::from_secs(60 * 60);

/// FFmpeg, if it's on this PC (on PATH, or where winget puts it).
fn ffmpeg() -> Option<PathBuf> {
    let probe = |p: &PathBuf| {
        let mut c = Command::new(p);
        c.arg("-version").stdout(Stdio::null()).stderr(Stdio::null());
        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            c.creation_flags(0x0800_0000);
        }
        c.status().is_ok_and(|s| s.success())
    };
    let mut candidates = vec![PathBuf::from("ffmpeg")];
    if let Some(local) = dirs::data_local_dir() {
        candidates.push(local.join("Microsoft").join("WinGet").join("Links").join("ffmpeg.exe"));
        if let Ok(pkgs) = std::fs::read_dir(local.join("Microsoft").join("WinGet").join("Packages")) {
            for p in pkgs.flatten().filter(|p| p.file_name().to_string_lossy().to_lowercase().contains("ffmpeg")) {
                if let Ok(inner) = std::fs::read_dir(p.path()) {
                    for d in inner.flatten() {
                        candidates.push(d.path().join("bin").join("ffmpeg.exe"));
                    }
                }
            }
        }
    }
    candidates.into_iter().find(probe)
}

fn record_start() -> Result<String> {
    if crate::uia::screen_locked() {
        return Err(anyhow!("Your PC is locked, so there's nothing to record."));
    }
    let mut rec = RECORDING.lock();
    if let Some(r) = rec.as_mut() {
        if r.child.try_wait().ok().flatten().is_none() {
            return Ok("I'm already recording — say “stop recording” when you're done.".into());
        }
    }
    let Some(ff) = ffmpeg() else {
        return Ok("Screen recording needs FFmpeg, a free tool (about 100 MB). Say “install ffmpeg” and I'll set it up, then ask me to record again.".into());
    };
    let dir = dirs::video_dir().ok_or_else(|| anyhow!("no Videos folder"))?.join("Izuki Recordings");
    std::fs::create_dir_all(&dir)?;
    let path = dir.join(format!("Recording {}.mp4", stamp()));
    let mut c = Command::new(ff);
    c.args(["-y", "-f", "gdigrab", "-framerate", "30", "-draw_mouse", "1", "-i", "desktop",
            "-c:v", "libx264", "-preset", "ultrafast", "-crf", "23", "-pix_fmt", "yuv420p",
            "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2"])
        .arg(&path)
        .stdin(Stdio::piped())
        .stdout(Stdio::null())
        .stderr(Stdio::null());
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        c.creation_flags(0x0800_0000);
    }
    let child = c.spawn().map_err(|e| anyhow!("FFmpeg didn't start: {e}"))?;
    *rec = Some(Recording { child, path, started: Instant::now() });
    drop(rec);
    // Never left running by accident.
    std::thread::spawn(|| {
        std::thread::sleep(LONGEST);
        if RECORDING.lock().as_ref().is_some_and(|r| r.started.elapsed() >= LONGEST) {
            if let Ok(msg) = record_stop() {
                crate::companion::notify_everywhere(&format!("I stopped the screen recording after an hour. {msg}"));
            }
        }
    });
    Ok("Recording your screen 🔴 — say “stop recording” when you're done.".into())
}

fn record_stop() -> Result<String> {
    let Some(mut r) = RECORDING.lock().take() else {
        return Ok("I'm not recording anything right now.".into());
    };
    // "q" lets FFmpeg finish the file properly.
    if let Some(mut stdin) = r.child.stdin.take() {
        let _ = stdin.write_all(b"q");
    }
    let until = Instant::now() + Duration::from_secs(15);
    while Instant::now() < until && r.child.try_wait().ok().flatten().is_none() {
        std::thread::sleep(Duration::from_millis(150));
    }
    if r.child.try_wait().ok().flatten().is_none() {
        let _ = r.child.kill();
    }
    let secs = r.started.elapsed().as_secs();
    if !r.path.exists() {
        return Err(anyhow!("The recording didn't save — FFmpeg stopped early."));
    }
    // Show it in File Explorer.
    let _ = Command::new("explorer").arg("/select,").arg(&r.path).spawn();
    Ok(format!("Saved your {} recording to Videos › Izuki Recordings.", if secs >= 60 { format!("{} min {} s", secs / 60, secs % 60) } else { format!("{secs} s") }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn understands_screen_requests() {
        assert_eq!(parse("take a screenshot"), Some(Shot::Picture));
        assert_eq!(parse("screenshot this"), Some(Shot::Picture));
        assert_eq!(parse("capture my screen"), Some(Shot::Picture));
        assert_eq!(parse("record my screen"), Some(Shot::RecordStart));
        assert_eq!(parse("start recording the screen"), Some(Shot::RecordStart));
        assert_eq!(parse("stop recording"), Some(Shot::RecordStop));
        assert_eq!(parse("record a voice note"), None);
        assert_eq!(parse("what's on my screen"), None);
    }
}
