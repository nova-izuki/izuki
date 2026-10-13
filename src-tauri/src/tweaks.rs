//! Windows tweaks, Windhawk-style: small ways to make Windows yours, each one
//! a switch. Only your own user settings (HKCU — no admin, nothing system
//! wide), every one reversible by flipping it back, and nothing changes until
//! you flip it. Some only show after Windows Explorer restarts; those say so,
//! and "Restart Explorer" does it when you ask.

use anyhow::{anyhow, Result};
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct Tweak {
    pub id: &'static str,
    pub label: &'static str,
    pub hint: &'static str,
    /// Shows only after Explorer restarts.
    pub restart: bool,
    /// Is it on now (read from Windows, not remembered by Izuki).
    pub on: bool,
}

/// A registry value under HKCU: (key, value name, DWORD when the tweak is on, DWORD when off).
type Dword = (&'static str, &'static str, u32, u32);

const ADV: &str = r"Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced";
const THEME: &str = r"Software\Microsoft\Windows\CurrentVersion\Themes\Personalize";
const CLASSIC_MENU: &str = r"Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32";

struct Def {
    id: &'static str,
    label: &'static str,
    hint: &'static str,
    restart: bool,
    how: How,
}

enum How {
    /// One or more DWORDs, all set together.
    Values(&'static [Dword]),
    /// The taskbar hides until the mouse reaches the screen edge.
    AutoHide,
    /// Windows 11's full right-click menu, the classic one.
    ClassicMenu,
}

const DEFS: &[Def] = &[
    Def { id: "taskbar_left", label: "Taskbar icons on the left", hint: "Start and your apps sit on the left, like Windows 10, instead of the middle.", restart: false, how: How::Values(&[(ADV, "TaskbarAl", 0, 1)]) },
    Def { id: "taskbar_autohide", label: "Hide the taskbar", hint: "The taskbar slides away until your mouse touches the bottom of the screen — more room for everything else.", restart: false, how: How::AutoHide },
    Def { id: "clock_seconds", label: "Seconds on the clock", hint: "The taskbar clock shows seconds too.", restart: false, how: How::Values(&[(ADV, "ShowSecondsInSystemClock", 1, 0)]) },
    Def { id: "end_task", label: "\"End task\" on the taskbar", hint: "Right-click an app on the taskbar to close a frozen one straight away (Windows 11).", restart: false, how: How::Values(&[(r"Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\TaskbarDeveloperSettings", "TaskbarEndTask", 1, 0)]) },
    Def { id: "no_task_view", label: "Hide the Task view button", hint: "One less button on the taskbar (Win+Tab still works).", restart: false, how: How::Values(&[(ADV, "ShowTaskViewButton", 0, 1)]) },
    Def { id: "no_search_box", label: "Hide the taskbar search box", hint: "Press the Start button and type to search instead.", restart: false, how: How::Values(&[(r"Software\Microsoft\Windows\CurrentVersion\Search", "SearchboxTaskbarMode", 0, 1)]) },
    Def { id: "classic_menu", label: "Full right-click menu", hint: "Right-click shows every option at once again, without \"Show more options\" (Windows 11). Shows after Explorer restarts.", restart: true, how: How::ClassicMenu },
    Def { id: "file_extensions", label: "Show file extensions", hint: "See .pdf, .exe, .jpg in File Explorer — easier to spot a fake \"photo.jpg.exe\".", restart: false, how: How::Values(&[(ADV, "HideFileExt", 0, 1)]) },
    Def { id: "hidden_files", label: "Show hidden files", hint: "File Explorer shows hidden files and folders (faded).", restart: false, how: How::Values(&[(ADV, "Hidden", 1, 2)]) },
    Def { id: "dark_mode", label: "Dark mode everywhere", hint: "Windows and apps in dark colours.", restart: false, how: How::Values(&[(THEME, "AppsUseLightTheme", 0, 1), (THEME, "SystemUsesLightTheme", 0, 1)]) },
    Def { id: "no_transparency", label: "Turn off see-through effects", hint: "Solid taskbar and menus — a little faster on a slow PC.", restart: false, how: How::Values(&[(THEME, "EnableTransparency", 0, 1)]) },
];

/// Every tweak, with whether it's on right now.
pub fn list() -> Vec<Tweak> {
    DEFS.iter().map(|d| Tweak { id: d.id, label: d.label, hint: d.hint, restart: d.restart, on: is_on(d) }).collect()
}

/// Flip one. Returns the fresh list.
pub fn set(id: &str, on: bool) -> Result<Vec<Tweak>> {
    let d = DEFS.iter().find(|d| d.id == id).ok_or_else(|| anyhow!("no tweak called {id}"))?;
    match &d.how {
        How::Values(vals) => {
            for (key, name, yes, no) in vals.iter() {
                reg::set_dword(key, name, if on { *yes } else { *no })?;
            }
        }
        How::AutoHide => shell::set_autohide(on),
        How::ClassicMenu => {
            if on { reg::set_default_empty(CLASSIC_MENU)? } else { reg::delete_tree(r"Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}")? }
        }
    }
    shell::announce();
    eprintln!("[tweaks] {} {}", d.id, if on { "on" } else { "off" });
    Ok(list())
}

fn is_on(d: &Def) -> bool {
    match &d.how {
        // On when every value says so; a missing value means Windows' default (off).
        How::Values(vals) => vals.iter().all(|(key, name, yes, _)| reg::get_dword(key, name) == Some(*yes)),
        How::AutoHide => shell::autohide(),
        How::ClassicMenu => reg::exists(CLASSIC_MENU),
    }
}

/// Restart Windows Explorer (the taskbar and desktop) so a tweak shows.
/// Open File Explorer windows close; nothing else does.
pub fn restart_explorer() -> Result<()> {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        let killed = std::process::Command::new("taskkill").args(["/F", "/IM", "explorer.exe"]).creation_flags(CREATE_NO_WINDOW).status();
        // Windows usually brings the taskbar back by itself; wait for it (a
        // few seconds at most), and start it only if it hasn't — never leave
        // you without a taskbar, and never open a stray Explorer window.
        let until = std::time::Instant::now() + std::time::Duration::from_secs(4);
        std::thread::sleep(std::time::Duration::from_millis(600));
        while !shell::taskbar_up() && std::time::Instant::now() < until {
            std::thread::sleep(std::time::Duration::from_millis(250));
        }
        if !shell::taskbar_up() {
            std::process::Command::new("explorer.exe").spawn()?;
        }
        killed?;
        eprintln!("[tweaks] restarted Explorer");
        Ok(())
    }
    #[cfg(not(windows))]
    Err(anyhow!("only on Windows"))
}

#[cfg(windows)]
mod reg {
    use anyhow::{anyhow, Result};
    use windows::core::{HSTRING, PCWSTR};
    use windows::Win32::System::Registry::{
        RegCloseKey, RegDeleteTreeW, RegGetValueW, RegOpenKeyExW, RegSetKeyValueW, HKEY, HKEY_CURRENT_USER, KEY_READ, REG_DWORD, REG_SZ, RRF_RT_REG_DWORD,
    };

    pub fn get_dword(key: &str, name: &str) -> Option<u32> {
        let mut data = 0u32;
        let mut size = 4u32;
        let r = unsafe {
            RegGetValueW(HKEY_CURRENT_USER, &HSTRING::from(key), &HSTRING::from(name), RRF_RT_REG_DWORD, None, Some(&mut data as *mut u32 as *mut _), Some(&mut size))
        };
        r.is_ok().then_some(data)
    }

    pub fn set_dword(key: &str, name: &str, v: u32) -> Result<()> {
        let bytes = v.to_le_bytes();
        let r = unsafe { RegSetKeyValueW(HKEY_CURRENT_USER, &HSTRING::from(key), &HSTRING::from(name), REG_DWORD.0, Some(bytes.as_ptr() as *const _), 4) };
        if r.is_ok() { Ok(()) } else { Err(anyhow!("Windows wouldn't save {name} ({r:?})")) }
    }

    /// The key's default value set to "" (creating the key).
    pub fn set_default_empty(key: &str) -> Result<()> {
        let empty = [0u16; 1];
        let r = unsafe { RegSetKeyValueW(HKEY_CURRENT_USER, &HSTRING::from(key), PCWSTR::null(), REG_SZ.0, Some(empty.as_ptr() as *const _), 2) };
        if r.is_ok() { Ok(()) } else { Err(anyhow!("Windows wouldn't save that ({r:?})")) }
    }

    pub fn delete_tree(key: &str) -> Result<()> {
        let r = unsafe { RegDeleteTreeW(HKEY_CURRENT_USER, &HSTRING::from(key)) };
        // Already gone is fine.
        if r.is_ok() || r.0 == 2 { Ok(()) } else { Err(anyhow!("Windows wouldn't remove that ({r:?})")) }
    }

    pub fn exists(key: &str) -> bool {
        let mut h = HKEY::default();
        let ok = unsafe { RegOpenKeyExW(HKEY_CURRENT_USER, &HSTRING::from(key), None, KEY_READ, &mut h) }.is_ok();
        if ok {
            unsafe { let _ = RegCloseKey(h); }
        }
        ok
    }
}

#[cfg(not(windows))]
mod reg {
    use anyhow::{anyhow, Result};
    pub fn get_dword(_: &str, _: &str) -> Option<u32> { None }
    pub fn set_dword(_: &str, _: &str, _: u32) -> Result<()> { Err(anyhow!("only on Windows")) }
    pub fn set_default_empty(_: &str) -> Result<()> { Err(anyhow!("only on Windows")) }
    pub fn delete_tree(_: &str) -> Result<()> { Err(anyhow!("only on Windows")) }
    pub fn exists(_: &str) -> bool { false }
}

#[cfg(windows)]
mod shell {
    use windows::core::w;
    use windows::Win32::Foundation::{LPARAM, WPARAM};
    use windows::Win32::UI::Shell::{SHAppBarMessage, ABM_GETSTATE, ABM_SETSTATE, APPBARDATA};
    use windows::Win32::UI::WindowsAndMessaging::{FindWindowW, SendMessageTimeoutW, HWND_BROADCAST, SMTO_ABORTIFHUNG, WM_SETTINGCHANGE};

    const ABS_AUTOHIDE: u32 = 1;
    const ABS_ALWAYSONTOP: u32 = 2;

    fn bar() -> APPBARDATA {
        let mut d = APPBARDATA { cbSize: std::mem::size_of::<APPBARDATA>() as u32, ..Default::default() };
        if let Ok(h) = unsafe { FindWindowW(w!("Shell_TrayWnd"), None) } {
            d.hWnd = h;
        }
        d
    }

    /// The taskbar (Explorer's shell) is running.
    pub fn taskbar_up() -> bool {
        unsafe { FindWindowW(w!("Shell_TrayWnd"), None) }.is_ok_and(|h| !h.is_invalid())
    }

    pub fn autohide() -> bool {
        let mut d = bar();
        (unsafe { SHAppBarMessage(ABM_GETSTATE, &mut d) } as u32) & ABS_AUTOHIDE != 0
    }

    pub fn set_autohide(on: bool) {
        let mut d = bar();
        d.lParam = LPARAM((if on { ABS_AUTOHIDE } else { ABS_ALWAYSONTOP }) as isize);
        unsafe { SHAppBarMessage(ABM_SETSTATE, &mut d) };
    }

    /// Tell Windows settings changed, so the taskbar and Explorer pick them up.
    pub fn announce() {
        for what in [w!("TraySettings"), w!("ImmersiveColorSet"), w!("Policy")] {
            let mut out = 0usize;
            unsafe {
                let _ = SendMessageTimeoutW(HWND_BROADCAST, WM_SETTINGCHANGE, WPARAM(0), LPARAM(what.as_ptr() as isize), SMTO_ABORTIFHUNG, 1500, Some(&mut out));
            }
        }
    }
}

#[cfg(not(windows))]
mod shell {
    pub fn taskbar_up() -> bool { true }
    pub fn autohide() -> bool { false }
    pub fn set_autohide(_: bool) {}
    pub fn announce() {}
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn every_tweak_has_a_way_back() {
        for d in DEFS {
            if let How::Values(vals) = &d.how {
                for (_, name, yes, no) in vals.iter() {
                    assert_ne!(yes, no, "{}: {name} must differ on and off", d.id);
                }
            }
            assert!(!d.label.is_empty() && !d.hint.is_empty());
        }
        let mut ids: Vec<_> = DEFS.iter().map(|d| d.id).collect();
        ids.sort();
        ids.dedup();
        assert_eq!(ids.len(), DEFS.len(), "ids are unique");
    }

    /// Reads the real values (changes nothing).
    #[test]
    #[cfg(windows)]
    fn reads_the_current_state() {
        let all = list();
        assert_eq!(all.len(), DEFS.len());
    }
}
