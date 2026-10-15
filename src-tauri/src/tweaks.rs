//! Windows tweaks, Windhawk-style: small ways to make Windows yours, each one
//! a switch. Only your own user settings (HKCU — no admin, nothing system
//! wide, nothing injected into Explorer), every one reversible by flipping
//! it back, and nothing changes until you flip it. Some only show after
//! Windows Explorer restarts; those say so, and "Restart Explorer" does it
//! when you ask.

use anyhow::{anyhow, Result};
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct Tweak {
    pub id: &'static str,
    pub label: &'static str,
    pub hint: &'static str,
    /// Which tab it shows under: taskbar, start, desktop, explorer, look, speed, quiet.
    pub group: &'static str,
    /// Shows only after Explorer restarts.
    pub restart: bool,
    /// Is it on now (read from Windows, not remembered by Izuki).
    pub on: bool,
}

/// A registry value under HKCU: (key, value name, DWORD when the tweak is on, DWORD when off).
type Dword = (&'static str, &'static str, u32, u32);
/// A text value: (key, value name, text when on, text when off — None removes it, Windows' default).
type Text = (&'static str, &'static str, &'static str, Option<&'static str>);

const ADV: &str = r"Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced";
const EXPLORER: &str = r"Software\Microsoft\Windows\CurrentVersion\Explorer";
const THEME: &str = r"Software\Microsoft\Windows\CurrentVersion\Themes\Personalize";
const DESK: &str = r"Control Panel\Desktop";
const ICONS: &str = r"Software\Microsoft\Windows\CurrentVersion\Explorer\HideDesktopIcons\NewStartPanel";
/// Windows' own tips, suggested apps and lock-screen ads.
const CDM: &str = r"Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager";
const CLASSIC_MENU: &str = r"Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32";

struct Def {
    id: &'static str,
    label: &'static str,
    hint: &'static str,
    group: &'static str,
    restart: bool,
    how: How,
}

enum How {
    /// One or more DWORDs, all set together.
    Values(&'static [Dword]),
    /// DWORDs that are on with a value and off when removed (Windows' default).
    ValuesOrNone(&'static [(&'static str, &'static str, u32)]),
    /// Text values.
    Texts(&'static [Text]),
    /// The taskbar hides until the mouse reaches the screen edge.
    AutoHide,
    /// Windows 11's full right-click menu, the classic one.
    ClassicMenu,
    /// One of Windows' own cursor sets (by its name in Windows); off = the standard one.
    Cursors(&'static str),
    /// Window and menu animations off (snappier).
    NoAnimations,
}

const fn d(id: &'static str, group: &'static str, label: &'static str, hint: &'static str, restart: bool, how: How) -> Def {
    Def { id, label, hint, group, restart, how }
}

const DEFS: &[Def] = &[
    // ---- Taskbar ----
    d("taskbar_left", "taskbar", "Taskbar icons on the left", "Start and your apps sit on the left, like Windows 10.", false, How::Values(&[(ADV, "TaskbarAl", 0, 1)])),
    d("taskbar_autohide", "taskbar", "Hide the taskbar", "It slides away until your mouse touches the bottom edge — more room for everything else.", false, How::AutoHide),
    d("never_combine", "taskbar", "App names on the taskbar", "Each window gets its own button with its name, instead of stacked icons (Windows 11 23H2 and later).", false, How::Values(&[(ADV, "TaskbarGlomLevel", 2, 0), (ADV, "MMTaskbarGlomLevel", 2, 0)])),
    d("clock_seconds", "taskbar", "Seconds on the clock", "The taskbar clock shows seconds too.", false, How::Values(&[(ADV, "ShowSecondsInSystemClock", 1, 0)])),
    d("end_task", "taskbar", "\"End task\" on the taskbar", "Right-click an app on the taskbar to close a frozen one straight away.", false, How::Values(&[(r"Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced\TaskbarDeveloperSettings", "TaskbarEndTask", 1, 0)])),
    d("no_task_view", "taskbar", "Hide the Task view button", "One less button (Win+Tab still works).", false, How::Values(&[(ADV, "ShowTaskViewButton", 0, 1)])),
    d("no_search_box", "taskbar", "Hide the search box", "Press Start and type to search instead.", false, How::Values(&[(r"Software\Microsoft\Windows\CurrentVersion\Search", "SearchboxTaskbarMode", 0, 1)])),
    d("no_widgets", "taskbar", "Hide the Widgets button", "No weather and news button on the taskbar (some Windows versions protect this one).", false, How::Values(&[(ADV, "TaskbarDa", 0, 1)])),
    d("no_copilot_button", "taskbar", "Hide the Copilot button", "One less button, where Windows shows it.", false, How::Values(&[(ADV, "ShowCopilotButton", 0, 1)])),
    d("no_badges", "taskbar", "No red badges", "Taskbar icons stop showing unread counts and alert dots.", false, How::Values(&[(ADV, "TaskbarBadges", 0, 1)])),
    d("taskbar_main_only", "taskbar", "Taskbar on the main screen only", "With more than one screen, only the main one has a taskbar.", false, How::Values(&[(ADV, "MMTaskbarEnabled", 0, 1)])),
    // ---- Start ----
    d("more_pins", "start", "More pinned apps", "Start shows more of your pinned apps and fewer recommendations.", true, How::Values(&[(ADV, "Start_Layout", 1, 0)])),
    d("no_start_tips", "start", "No suggested apps in Start", "Recommended stops suggesting tips and apps you didn't ask for.", true, How::Values(&[(ADV, "Start_IrisRecommendations", 0, 1)])),
    d("no_recent_files", "start", "Hide recent files", "Start, Jump Lists and File Explorer stop listing files you opened recently.", false, How::Values(&[(ADV, "Start_TrackDocs", 0, 1)])),
    d("no_recent_apps", "start", "Hide most-used apps", "Start stops tracking and showing your most-used apps.", false, How::Values(&[(ADV, "Start_TrackProgs", 0, 1)])),
    d("no_account_nags", "start", "No account reminders", "Start stops nagging about your Microsoft account.", true, How::Values(&[(ADV, "Start_AccountNotifications", 0, 1)])),
    d("no_bing_search", "start", "Search only your PC (no Bing)", "Searching from Start shows your apps, files and settings — no web results. Shows after Explorer restarts.", true, How::Values(&[(r"Software\Microsoft\Windows\CurrentVersion\Search", "BingSearchEnabled", 0, 1)])),
    // ---- Desktop ----
    d("this_pc_icon", "desktop", "\"This PC\" on the desktop", "One click to your drives, like older Windows.", false, How::Values(&[(ICONS, "{20D04FE0-3AEA-1069-A2D8-08002B30309D}", 0, 1)])),
    d("user_folder_icon", "desktop", "Your folder on the desktop", "Your personal folder (Documents, Downloads…) as a desktop icon.", false, How::Values(&[(ICONS, "{59031a47-3f72-44a7-89c5-5595fe6b30ee}", 0, 1)])),
    d("no_recycle_icon", "desktop", "Hide the Recycle Bin icon", "A cleaner desktop (the bin still works from File Explorer).", false, How::Values(&[(ICONS, "{645FF040-5081-101B-9F08-00AA002F954E}", 1, 0)])),
    d("no_spotlight_icon", "desktop", "Hide \"Learn about this picture\"", "Removes the Spotlight icon Windows puts on the desktop.", false, How::Values(&[(ICONS, "{2cc5ca98-6485-489a-920e-b3e88a6ccce3}", 1, 0)])),
    d("clean_desktop", "desktop", "Clean desktop", "Hide every desktop icon — just your wallpaper. Shows after Explorer restarts.", true, How::Values(&[(ADV, "HideIcons", 1, 0)])),
    d("sharp_wallpaper", "desktop", "Full-quality wallpaper", "Windows stops compressing your wallpaper, so it looks sharper.", false, How::ValuesOrNone(&[(DESK, "JPEGImportQuality", 100)])),
    // ---- File Explorer ----
    d("file_extensions", "explorer", "Show file extensions", "See .pdf, .exe, .jpg — easier to spot a fake \"photo.jpg.exe\".", false, How::Values(&[(ADV, "HideFileExt", 0, 1)])),
    d("hidden_files", "explorer", "Show hidden files", "Hidden files and folders appear (faded).", false, How::Values(&[(ADV, "Hidden", 1, 2)])),
    d("open_this_pc", "explorer", "Open to This PC", "File Explorer starts on your drives instead of Home.", false, How::Values(&[(ADV, "LaunchTo", 1, 2)])),
    d("no_recent_quick", "explorer", "Home without recent files", "File Explorer's Home stops listing recent files and frequent folders.", false, How::Values(&[(EXPLORER, "ShowRecent", 0, 1), (EXPLORER, "ShowFrequent", 0, 1)])),
    d("full_path", "explorer", "Full path in the title", "The window title shows the whole folder path.", false, How::Values(&[(r"Software\Microsoft\Windows\CurrentVersion\Explorer\CabinetState", "FullPath", 1, 0)])),
    d("checkboxes", "explorer", "Tick boxes to select files", "A tick box on each file — select several without holding Ctrl.", false, How::Values(&[(ADV, "AutoCheckSelect", 1, 0)])),
    d("compact_explorer", "explorer", "Compact view", "Tighter rows, so more files fit on screen.", false, How::Values(&[(ADV, "UseCompactMode", 1, 0)])),
    d("no_shortcut_suffix", "explorer", "No \"- Shortcut\" in names", "New shortcuts are named just like the thing they open.", false, How::Texts(&[(r"Software\Microsoft\Windows\CurrentVersion\Explorer\NamingTemplates", "ShortcutNameTemplate", "\"%s.lnk\"", None)])),
    d("classic_menu", "explorer", "Full right-click menu", "Every option at once again, no \"Show more options\". Shows after Explorer restarts.", true, How::ClassicMenu),
    // ---- Look & cursor ----
    d("dark_mode", "look", "Dark mode everywhere", "Windows and apps in dark colours.", false, How::Values(&[(THEME, "AppsUseLightTheme", 0, 1), (THEME, "SystemUsesLightTheme", 0, 1)])),
    d("no_transparency", "look", "No see-through effects", "Solid taskbar and menus — a little faster on a slow PC.", false, How::Values(&[(THEME, "EnableTransparency", 0, 1)])),
    d("cursor_black", "look", "Black cursor", "Windows' own black pointer set — sharp on light pages.", false, How::Cursors("Windows Black")),
    d("cursor_black_big", "look", "Big black cursor", "The black set, larger and easy to find.", false, How::Cursors("Windows Black (large)")),
    d("cursor_big", "look", "Big white cursor", "Windows' standard pointer, larger.", false, How::Cursors("Windows Aero L")),
    d("cursor_inverted", "look", "Inverted cursor", "A pointer that flips the colours under it — shows on any background.", false, How::Cursors("Windows Inverted")),
    // ---- Speed & gaming ----
    d("no_animations", "speed", "Snappy windows", "Windows open, close and minimise instantly — no animations.", false, How::NoAnimations),
    d("fast_menus", "speed", "Faster menus", "Menus open after 100 ms instead of 400.", false, How::Texts(&[(DESK, "MenuShowDelay", "100", Some("400"))])),
    d("no_startup_delay", "speed", "No startup delay", "Your startup apps open straight away after sign-in, not 10 seconds later.", false, How::ValuesOrNone(&[(r"Software\Microsoft\Windows\CurrentVersion\Explorer\Serialize", "StartupDelayInMSec", 0)])),
    d("no_game_dvr", "speed", "No background game recording", "Xbox Game Bar stops recording in the background — more FPS in games.", false, How::Values(&[(r"System\GameConfigStore", "GameDVR_Enabled", 0, 1), (r"Software\Microsoft\Windows\CurrentVersion\GameDVR", "AppCaptureEnabled", 0, 1)])),
    d("no_sticky_popup", "speed", "No Sticky Keys pop-up", "Pressing Shift five times (in a game) no longer pops up Sticky Keys.", false, How::Texts(&[(r"Control Panel\Accessibility\StickyKeys", "Flags", "506", Some("510"))])),
    d("no_snap_popup", "speed", "No snap layouts pop-up", "Hovering the maximise button no longer shows the layouts (Win+Z still does).", false, How::Values(&[(ADV, "EnableSnapAssistFlyout", 0, 1)])),
    // ---- Quiet & private ----
    d("no_suggested_apps", "quiet", "No suggested apps or ads", "Windows stops suggesting and quietly installing promoted apps.", false, How::Values(&[(CDM, "SystemPaneSuggestionsEnabled", 0, 1), (CDM, "SubscribedContent-338388Enabled", 0, 1), (CDM, "SilentInstalledAppsEnabled", 0, 1)])),
    d("no_lock_tips", "quiet", "Clean lock screen", "Just your picture and the time — no \"fun facts\" or ads.", false, How::Values(&[(CDM, "RotatingLockScreenOverlayEnabled", 0, 1), (CDM, "SubscribedContent-338387Enabled", 0, 1)])),
    d("no_windows_tips", "quiet", "No tips while you work", "Windows stops popping up tips and suggestions.", false, How::Values(&[(CDM, "SubscribedContent-338389Enabled", 0, 1), (CDM, "SoftLandingEnabled", 0, 1)])),
    d("no_welcome", "quiet", "No \"what's new\" screens", "No welcome tour after Windows updates.", false, How::Values(&[(CDM, "SubscribedContent-310093Enabled", 0, 1)])),
    d("no_finish_setup", "quiet", "No \"finish setting up\" nags", "Windows stops asking you to finish setting up your device.", false, How::Values(&[(r"Software\Microsoft\Windows\CurrentVersion\UserProfileEngagement", "ScoobeSystemSettingEnabled", 0, 1)])),
    d("no_ad_id", "quiet", "No advertising ID", "Apps can't use an ID to show you targeted ads.", false, How::Values(&[(r"Software\Microsoft\Windows\CurrentVersion\AdvertisingInfo", "Enabled", 0, 1)])),
    d("no_tailored", "quiet", "No tailored experiences", "Microsoft stops using your diagnostic data for tips and ads.", false, How::Values(&[(r"Software\Microsoft\Windows\CurrentVersion\Privacy", "TailoredExperiencesWithDiagnosticDataEnabled", 0, 1)])),
];

/// One-tap sets of tweaks.
pub struct Pack {
    pub id: &'static str,
    pub ids: &'static [&'static str],
}

pub const PACKS: &[Pack] = &[
    Pack { id: "gamer", ids: &["no_animations", "fast_menus", "no_startup_delay", "no_game_dvr", "no_sticky_popup", "no_windows_tips", "no_badges"] },
    Pack { id: "clean", ids: &["no_suggested_apps", "no_lock_tips", "no_windows_tips", "no_welcome", "no_finish_setup", "no_ad_id", "no_tailored", "no_start_tips", "no_account_nags", "no_spotlight_icon", "no_copilot_button", "no_widgets"] },
    Pack { id: "power", ids: &["file_extensions", "hidden_files", "full_path", "open_this_pc", "end_task", "clock_seconds", "classic_menu", "never_combine", "this_pc_icon"] },
];

/// Every tweak, with whether it's on right now.
pub fn list() -> Vec<Tweak> {
    DEFS.iter().map(|d| Tweak { id: d.id, label: d.label, hint: d.hint, group: d.group, restart: d.restart, on: is_on(d) }).collect()
}

/// Flip one. Returns the fresh list.
pub fn set(id: &str, on: bool) -> Result<Vec<Tweak>> {
    apply(id, on)?;
    shell::announce();
    Ok(list())
}

/// Turn on every tweak in a pack (the ones already on stay on). Errors
/// don't stop the rest; they're reported together.
pub fn set_pack(id: &str) -> Result<Vec<Tweak>> {
    let pack = PACKS.iter().find(|p| p.id == id).ok_or_else(|| anyhow!("no pack called {id}"))?;
    let mut problems = Vec::new();
    for t in pack.ids {
        if let Err(e) = apply(t, true) {
            let label = DEFS.iter().find(|d| d.id == *t).map_or(*t, |d| d.label);
            problems.push(format!("{label} ({e})"));
        }
    }
    shell::announce();
    if !problems.is_empty() {
        return Err(anyhow!("Most of it is on, but Windows kept these as they were: {}", problems.join("; ")));
    }
    Ok(list())
}

fn apply(id: &str, on: bool) -> Result<()> {
    let d = DEFS.iter().find(|d| d.id == id).ok_or_else(|| anyhow!("no tweak called {id}"))?;
    match &d.how {
        How::Values(vals) => {
            for (key, name, yes, no) in vals.iter() {
                reg::set_dword(key, name, if on { *yes } else { *no })?;
            }
        }
        How::ValuesOrNone(vals) => {
            for (key, name, yes) in vals.iter() {
                if on { reg::set_dword(key, name, *yes)? } else { reg::delete_value(key, name)? }
            }
        }
        How::Texts(vals) => {
            for (key, name, yes, no) in vals.iter() {
                match (on, no) {
                    (true, _) => reg::set_text(key, name, yes)?,
                    (false, Some(no)) => reg::set_text(key, name, no)?,
                    (false, None) => reg::delete_value(key, name)?,
                }
            }
        }
        How::AutoHide => shell::set_autohide(on),
        How::ClassicMenu => {
            if on { reg::set_default_empty(CLASSIC_MENU)? } else { reg::delete_tree(r"Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}")? }
        }
        // Turning one pointer set off only resets the pointers if it's the one in use.
        How::Cursors(scheme) => {
            if on || is_on(d) {
                shell::set_cursors(if on { scheme } else { "Windows Default" })?
            }
        }
        How::NoAnimations => shell::set_animations(!on),
    }
    eprintln!("[tweaks] {} {}", d.id, if on { "on" } else { "off" });
    Ok(())
}

fn is_on(d: &Def) -> bool {
    match &d.how {
        // On when every value says so; a missing value means Windows' default (off).
        How::Values(vals) => vals.iter().all(|(key, name, yes, _)| reg::get_dword(key, name) == Some(*yes)),
        How::ValuesOrNone(vals) => vals.iter().all(|(key, name, yes)| reg::get_dword(key, name) == Some(*yes)),
        How::Texts(vals) => vals.iter().all(|(key, name, yes, _)| reg::get_text(key, name).as_deref() == Some(*yes)),
        How::AutoHide => shell::autohide(),
        How::ClassicMenu => reg::exists(CLASSIC_MENU),
        How::Cursors(scheme) => reg::get_text(r"Control Panel\Cursors", "").as_deref() == Some(*scheme),
        How::NoAnimations => !shell::animations(),
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
        RegCloseKey, RegDeleteKeyValueW, RegDeleteTreeW, RegGetValueW, RegOpenKeyExW, RegSetKeyValueW, HKEY, HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE, KEY_READ, REG_DWORD,
        REG_EXPAND_SZ, REG_SZ, RRF_NOEXPAND, RRF_RT_REG_DWORD, RRF_RT_REG_EXPAND_SZ, RRF_RT_REG_SZ,
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

    fn get_string(root: windows::Win32::System::Registry::HKEY, key: &str, name: &str) -> Option<String> {
        let (k, n) = (HSTRING::from(key), HSTRING::from(name));
        let flags = RRF_RT_REG_SZ | RRF_RT_REG_EXPAND_SZ | RRF_NOEXPAND;
        let mut size = 0u32;
        unsafe { RegGetValueW(root, &k, &n, flags, None, None, Some(&mut size)) }.ok().ok()?;
        let mut buf = vec![0u16; size as usize / 2 + 1];
        unsafe { RegGetValueW(root, &k, &n, flags, None, Some(buf.as_mut_ptr() as *mut _), Some(&mut size)) }.ok().ok()?;
        let end = buf.iter().position(|c| *c == 0).unwrap_or(buf.len());
        Some(String::from_utf16_lossy(&buf[..end]))
    }

    /// A text value under HKCU ("" = the key's default value).
    pub fn get_text(key: &str, name: &str) -> Option<String> {
        get_string(HKEY_CURRENT_USER, key, name)
    }

    /// A text value under HKLM (read only — Windows' own definitions).
    pub fn get_machine_text(key: &str, name: &str) -> Option<String> {
        get_string(HKEY_LOCAL_MACHINE, key, name)
    }

    fn put_string(key: &str, name: &str, v: &str, kind: u32) -> Result<()> {
        let wide: Vec<u16> = v.encode_utf16().chain(std::iter::once(0)).collect();
        let name_h = HSTRING::from(name);
        let name_p = if name.is_empty() { PCWSTR::null() } else { PCWSTR(name_h.as_ptr()) };
        let r = unsafe { RegSetKeyValueW(HKEY_CURRENT_USER, &HSTRING::from(key), name_p, kind, Some(wide.as_ptr() as *const _), (wide.len() * 2) as u32) };
        if r.is_ok() { Ok(()) } else { Err(anyhow!("Windows wouldn't save {name} ({r:?})")) }
    }

    pub fn set_text(key: &str, name: &str, v: &str) -> Result<()> {
        put_string(key, name, v, REG_SZ.0)
    }

    pub fn set_expand_text(key: &str, name: &str, v: &str) -> Result<()> {
        put_string(key, name, v, REG_EXPAND_SZ.0)
    }

    pub fn delete_value(key: &str, name: &str) -> Result<()> {
        let r = unsafe { RegDeleteKeyValueW(HKEY_CURRENT_USER, &HSTRING::from(key), &HSTRING::from(name)) };
        // Already gone is fine.
        if r.is_ok() || r.0 == 2 { Ok(()) } else { Err(anyhow!("Windows wouldn't remove {name} ({r:?})")) }
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
    pub fn get_text(_: &str, _: &str) -> Option<String> { None }
    pub fn get_machine_text(_: &str, _: &str) -> Option<String> { None }
    pub fn set_text(_: &str, _: &str, _: &str) -> Result<()> { Err(anyhow!("only on Windows")) }
    pub fn set_expand_text(_: &str, _: &str, _: &str) -> Result<()> { Err(anyhow!("only on Windows")) }
    pub fn delete_value(_: &str, _: &str) -> Result<()> { Err(anyhow!("only on Windows")) }
    pub fn set_default_empty(_: &str) -> Result<()> { Err(anyhow!("only on Windows")) }
    pub fn delete_tree(_: &str) -> Result<()> { Err(anyhow!("only on Windows")) }
    pub fn exists(_: &str) -> bool { false }
}

/// The pointer roles in the order Windows lists them in a cursor scheme.
const CURSOR_ROLES: &[&str] = &["Arrow", "Help", "AppStarting", "Wait", "Crosshair", "IBeam", "NWPen", "No", "SizeNS", "SizeWE", "SizeNWSE", "SizeNESW", "SizeAll", "UpArrow", "Hand", "Pin", "Person"];
const SCHEMES: &str = r"SOFTWARE\Microsoft\Windows\CurrentVersion\Control Panel\Cursors\Schemes";

#[cfg(windows)]
mod shell {
    use anyhow::{anyhow, Result};
    use windows::core::w;
    use windows::Win32::Foundation::{LPARAM, WPARAM};
    use windows::Win32::UI::Shell::{SHAppBarMessage, SHChangeNotify, ABM_GETSTATE, ABM_SETSTATE, APPBARDATA, SHCNE_ASSOCCHANGED, SHCNF_IDLIST};
    use windows::Win32::UI::WindowsAndMessaging::{
        FindWindowW, SendMessageTimeoutW, SystemParametersInfoW, ANIMATIONINFO, HWND_BROADCAST, SMTO_ABORTIFHUNG, SPIF_SENDCHANGE, SPIF_UPDATEINIFILE, SPI_GETANIMATION,
        SPI_GETCLIENTAREAANIMATION, SPI_SETANIMATION, SPI_SETCLIENTAREAANIMATION, SPI_SETCURSORS, WM_SETTINGCHANGE,
    };

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

    /// Window open/close/minimise animations are on.
    pub fn animations() -> bool {
        let mut on = windows::core::BOOL(1);
        let ok = unsafe { SystemParametersInfoW(SPI_GETCLIENTAREAANIMATION, 0, Some(&mut on as *mut _ as *mut _), Default::default()) }.is_ok();
        !ok || on.as_bool()
    }

    pub fn set_animations(on: bool) {
        let flags = SPIF_UPDATEINIFILE | SPIF_SENDCHANGE;
        unsafe {
            // This one takes the value itself where the pointer would go.
            let _ = SystemParametersInfoW(SPI_SETCLIENTAREAANIMATION, 0, Some(on as usize as *mut _), flags);
            let mut info = ANIMATIONINFO { cbSize: std::mem::size_of::<ANIMATIONINFO>() as u32, iMinAnimate: 0 };
            let _ = SystemParametersInfoW(SPI_GETANIMATION, info.cbSize, Some(&mut info as *mut _ as *mut _), Default::default());
            info.iMinAnimate = i32::from(on);
            let _ = SystemParametersInfoW(SPI_SETANIMATION, info.cbSize, Some(&mut info as *mut _ as *mut _), flags);
        }
    }

    /// Use one of Windows' own cursor sets, by its name ("Windows Default" =
    /// the standard one), the way the Mouse settings do.
    pub fn set_cursors(scheme: &str) -> Result<()> {
        let cursors = r"Control Panel\Cursors";
        let list = if scheme == "Windows Default" {
            super::reg::get_machine_text(super::SCHEMES, "Windows Aero").ok_or_else(|| anyhow!("this Windows doesn't list its standard pointers"))?
        } else {
            super::reg::get_machine_text(super::SCHEMES, scheme).ok_or_else(|| anyhow!("this Windows doesn't have the {scheme} pointers"))?
        };
        let paths: Vec<&str> = list.split(',').collect();
        for (i, role) in super::CURSOR_ROLES.iter().enumerate() {
            super::reg::set_expand_text(cursors, role, paths.get(i).copied().unwrap_or(""))?;
        }
        super::reg::set_text(cursors, "", scheme)?;
        super::reg::set_dword(cursors, "Scheme Source", 2)?;
        unsafe { SystemParametersInfoW(SPI_SETCURSORS, 0, None, SPIF_UPDATEINIFILE | SPIF_SENDCHANGE) }.map_err(|e| anyhow!("Windows didn't reload the pointers ({e})"))?;
        Ok(())
    }

    /// Tell Windows settings changed, so the taskbar, desktop and Explorer pick them up.
    pub fn announce() {
        for what in [w!("TraySettings"), w!("ImmersiveColorSet"), w!("Policy"), w!("Environment")] {
            let mut out = 0usize;
            unsafe {
                let _ = SendMessageTimeoutW(HWND_BROADCAST, WM_SETTINGCHANGE, WPARAM(0), LPARAM(what.as_ptr() as isize), SMTO_ABORTIFHUNG, 1500, Some(&mut out));
            }
        }
        // Desktop icons shown or hidden: the desktop redraws.
        unsafe { SHChangeNotify(SHCNE_ASSOCCHANGED, SHCNF_IDLIST, None, None) };
    }
}

#[cfg(not(windows))]
mod shell {
    use anyhow::{anyhow, Result};
    pub fn taskbar_up() -> bool { true }
    pub fn autohide() -> bool { false }
    pub fn set_autohide(_: bool) {}
    pub fn animations() -> bool { true }
    pub fn set_animations(_: bool) {}
    pub fn set_cursors(_: &str) -> Result<()> { Err(anyhow!("only on Windows")) }
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
            if let How::Texts(vals) = &d.how {
                for (_, name, yes, no) in vals.iter() {
                    assert_ne!(Some(*yes), *no, "{}: {name} must differ on and off", d.id);
                }
            }
            assert!(!d.label.is_empty() && !d.hint.is_empty());
            assert!(["taskbar", "start", "desktop", "explorer", "look", "speed", "quiet"].contains(&d.group), "{} has a known group", d.id);
        }
        let mut ids: Vec<_> = DEFS.iter().map(|d| d.id).collect();
        ids.sort();
        ids.dedup();
        assert_eq!(ids.len(), DEFS.len(), "ids are unique");
        for p in PACKS {
            for t in p.ids {
                assert!(DEFS.iter().any(|d| d.id == *t), "pack {} names a real tweak ({t})", p.id);
            }
        }
    }

    /// Writes each existing value back unchanged, to find any Windows
    /// protects (changes nothing): `cargo test --lib probe_writes -- --ignored --nocapture`
    #[test]
    #[ignore]
    #[cfg(windows)]
    fn probe_writes() {
        for d in DEFS {
            let r: Vec<String> = match &d.how {
                How::Values(vals) => vals.iter().filter_map(|(k, n, _, _)| reg::get_dword(k, n).map(|v| reg::set_dword(k, n, v).err().map(|e| e.to_string()).unwrap_or_else(|| "ok".into()))).collect(),
                How::ValuesOrNone(vals) => vals.iter().filter_map(|(k, n, _)| reg::get_dword(k, n).map(|v| reg::set_dword(k, n, v).err().map(|e| e.to_string()).unwrap_or_else(|| "ok".into()))).collect(),
                How::Texts(vals) => vals.iter().filter_map(|(k, n, _, _)| reg::get_text(k, n).map(|v| reg::set_text(k, n, &v).err().map(|e| e.to_string()).unwrap_or_else(|| "ok".into()))).collect(),
                _ => vec!["(not a value)".into()],
            };
            eprintln!("{:<20} on={:<5} {}", d.id, is_on(d), if r.is_empty() { "(not set yet — Windows' default)".to_string() } else { r.join(", ") });
        }
    }

    /// Reads the real values (changes nothing), and Windows' own cursor sets.
    #[test]
    #[cfg(windows)]
    fn reads_the_current_state() {
        let all = list();
        assert_eq!(all.len(), DEFS.len());
        for d in DEFS {
            if let How::Cursors(scheme) = d.how {
                let list = reg::get_machine_text(SCHEMES, scheme).unwrap_or_else(|| panic!("Windows has {scheme}"));
                assert!(list.split(',').count() >= 14, "{scheme}: {list}");
            }
        }
        assert!(reg::get_machine_text(SCHEMES, "Windows Aero").is_some());
    }
}
