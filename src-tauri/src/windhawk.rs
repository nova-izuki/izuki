//! Windhawk, for going further than Izuki's own tweaks: a vertical taskbar, a
//! restyled Start menu, a taskbar clock with your CPU and the weather.
//!
//! Izuki's tweaks only change Windows' own settings and never inject code
//! into Explorer. Windhawk (free, open source, by Ramen Software) does inject
//! its mods into Explorer and other apps; that's how it can restyle them. So
//! Izuki doesn't do it for you: it tells you what Windhawk is, installs it
//! with winget when you press the button (Windows asks you first), opens it,
//! and links the handful of mods worth starting with, each by its page on
//! windhawk.net. Mods are installed and switched off in Windhawk itself.

use anyhow::{anyhow, Result};
use serde::Serialize;
use std::path::PathBuf;
use std::time::{Duration, Instant};

/// Windhawk's id in winget (checked against microsoft/winget-pkgs).
const WINGET_ID: &str = "RamenSoftware.Windhawk";

#[derive(Debug, Clone, Serialize)]
pub struct Mod {
    /// Its id on windhawk.net and in ramensoftware/windhawk-mods.
    pub id: &'static str,
    pub name: &'static str,
    pub what: &'static str,
    /// Windows 11 only.
    pub win11: bool,
}

/// Mods worth starting with: popular, kept up to date, and each one easy to
/// switch off again in Windhawk. Every id was checked against Windhawk's own
/// mod repository.
pub const MODS: &[Mod] = &[
    Mod { id: "windows-11-taskbar-styler", name: "Windows 11 Taskbar Styler", what: "Ready-made taskbar themes: see-through, floating, rounded, and more.", win11: true },
    Mod { id: "windows-11-start-menu-styler", name: "Windows 11 Start Menu Styler", what: "Restyle Start: hide the recommended list, change its shape and colours.", win11: true },
    Mod { id: "taskbar-icon-size", name: "Taskbar height and icon size", what: "A slimmer or taller taskbar, with smaller or bigger icons.", win11: true },
    Mod { id: "taskbar-vertical", name: "Vertical Taskbar for Windows 11", what: "Put the taskbar on the left or right side of the screen.", win11: true },
    Mod { id: "taskbar-clock-customization", name: "Taskbar Clock Customization", what: "Your own clock format, plus the weather, CPU, RAM and network speed.", win11: false },
    Mod { id: "taskbar-labels", name: "Taskbar Labels for Windows 11", what: "App names next to their icons on the taskbar.", win11: true },
    Mod { id: "windows-11-notification-center-styler", name: "Windows 11 Notification Center Styler", what: "Themes for the notification and quick settings panels.", win11: true },
    Mod { id: "translucent-windows", name: "Translucent Windows", what: "Windows 11's own frosted-glass effect on more windows.", win11: true },
    Mod { id: "taskbar-music-lounge", name: "Taskbar Music Lounge", what: "What's playing, with controls, right on the taskbar.", win11: false },
    Mod { id: "taskbar-volume-control", name: "Taskbar Volume Control", what: "Scroll over the taskbar to change the volume.", win11: false },
    Mod { id: "explorer-details-better-file-sizes", name: "Better file sizes in Explorer details", what: "Folder sizes and easy-to-read sizes in File Explorer.", win11: false },
    Mod { id: "disable-rounded-corners", name: "Disable rounded corners in Windows 11", what: "Square window corners, like Windows 10.", win11: true },
];

#[derive(Debug, Clone, Serialize)]
pub struct Status {
    pub installed: bool,
    /// Windhawk's program, when it's installed.
    pub path: Option<String>,
    /// winget is there to install it with.
    pub can_install: bool,
    pub mods: Vec<Mod>,
    /// An install started earlier is still running.
    pub installing: bool,
}

/// Where Windhawk's program is, if it's installed: Program Files\Windhawk
/// (its installer's and winget's usual place), a per-user install, or
/// wherever its own uninstall entry says it went.
#[cfg(windows)]
fn program() -> Option<PathBuf> {
    const UNINSTALL: &str = r"Software\Microsoft\Windows\CurrentVersion\Uninstall\Windhawk";
    let mut places: Vec<PathBuf> = ["ProgramFiles", "ProgramW6432", "ProgramFiles(x86)"]
        .iter()
        .filter_map(|v| std::env::var(v).ok())
        .map(|dir| PathBuf::from(dir).join("Windhawk"))
        .collect();
    if let Ok(local) = std::env::var("LOCALAPPDATA") {
        places.push(PathBuf::from(local).join("Programs").join("Windhawk"));
    }
    for found in [crate::tweaks::reg::get_machine_text(UNINSTALL, "InstallLocation"), crate::tweaks::reg::get_text(UNINSTALL, "InstallLocation")]
        .into_iter()
        .flatten()
    {
        places.push(PathBuf::from(found.trim().trim_matches('"')));
    }
    places.into_iter().map(|dir| dir.join("windhawk.exe")).find(|p| p.is_file())
}

/// An install is running (only one at a time, wherever it was started).
static INSTALLING: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

/// Clears the install flag however `install` ends.
struct Installing;

impl Drop for Installing {
    fn drop(&mut self) {
        INSTALLING.store(false, std::sync::atomic::Ordering::SeqCst);
    }
}

#[cfg(not(windows))]
fn program() -> Option<PathBuf> {
    None
}

fn hidden(cmd: &mut std::process::Command) -> &mut std::process::Command {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x0800_0000); // CREATE_NO_WINDOW
    }
    cmd
}

fn has_winget() -> bool {
    hidden(std::process::Command::new("winget").arg("--version"))
        .stdout(std::process::Stdio::null())
        .stderr(std::process::Stdio::null())
        .status()
        .is_ok_and(|s| s.success())
}

pub fn status() -> Status {
    let path = program();
    Status {
        installed: path.is_some(),
        path: path.map(|p| p.to_string_lossy().into_owned()),
        can_install: cfg!(windows) && has_winget(),
        mods: MODS.to_vec(),
        installing: INSTALLING.load(std::sync::atomic::Ordering::SeqCst),
    }
}

/// Install Windhawk with winget. Windows shows its own permission prompt;
/// nothing is installed if the person says no there. Waits up to 10 minutes.
pub fn install() -> Result<Status> {
    if program().is_some() {
        return Ok(status());
    }
    if INSTALLING.swap(true, std::sync::atomic::Ordering::SeqCst) {
        return Err(anyhow!("Windhawk is already being installed. Give it a minute, then check here again."));
    }
    let _installing = Installing;
    if !has_winget() {
        return Err(anyhow!("winget (Windows' App Installer) isn't available on this PC. Get Windhawk from windhawk.net instead."));
    }
    let mut child = hidden(std::process::Command::new("winget").args([
        "install",
        "--id",
        WINGET_ID,
        "-e",
        "--source",
        "winget",
        "--accept-package-agreements",
        "--accept-source-agreements",
    ]))
    .stdout(std::process::Stdio::null())
    .stderr(std::process::Stdio::null())
    .spawn()
    .map_err(|e| anyhow!("couldn't start winget: {e}"))?;
    let began = Instant::now();
    loop {
        if let Some(done) = child.try_wait()? {
            let now = status();
            return if now.installed {
                crate::actlog::record("apps", "Installed Windhawk (from winget, after you pressed Install)");
                Ok(now)
            } else if done.success() {
                Err(anyhow!("winget finished, but Windhawk isn't where it should be. Open windhawk.net to install it."))
            } else {
                Err(anyhow!("Windhawk wasn't installed (the install was cancelled or failed). You can try again, or get it from windhawk.net."))
            };
        }
        if began.elapsed() > Duration::from_secs(600) {
            let _ = child.kill();
            return Err(anyhow!("Installing Windhawk took more than 10 minutes, so I stopped waiting. Check your internet and try again."));
        }
        std::thread::sleep(Duration::from_millis(400));
    }
}

/// Open Windhawk (where mods are installed, set up and turned off).
pub fn open() -> Result<()> {
    let exe = program().ok_or_else(|| anyhow!("Windhawk isn't installed yet."))?;
    std::process::Command::new(exe).spawn().map(|_| ()).map_err(|e| anyhow!("couldn't open Windhawk: {e}"))
}

/// A mod's page on windhawk.net, for an id from `MODS` only.
pub fn mod_page(id: &str) -> Result<String> {
    MODS.iter()
        .find(|m| m.id == id)
        .map(|m| format!("https://windhawk.net/mods/{}", m.id))
        .ok_or_else(|| anyhow!("unknown Windhawk mod"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn mods_are_unique_and_link_only_to_windhawk() {
        let mut ids: Vec<&str> = MODS.iter().map(|m| m.id).collect();
        ids.sort_unstable();
        ids.dedup();
        assert_eq!(ids.len(), MODS.len(), "no mod twice");
        for m in MODS {
            assert!(m.id.chars().all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '-'), "{}", m.id);
            assert_eq!(mod_page(m.id).unwrap(), format!("https://windhawk.net/mods/{}", m.id));
            assert!(!m.what.is_empty() && m.what.ends_with('.'));
        }
        assert!(mod_page("https://evil.example").is_err(), "only the listed mods");
    }
}
