//! Do it directly, like Jarvis: Izuki's own abilities, used by the screen
//! agent instead of clicking through menus. The agent writes a step
//! `{"action":"do","text_to_type":"turn on dark mode"}` and it runs through
//! the same list of abilities a spoken request reaches
//! (`commands::instant_command`): looks and dark mode, window layouts,
//! folders, Windows settings pages, closing an app, timers, focus,
//! screenshots, storage, notes… Nothing on screen is clicked. When no
//! ability fits, the step says so and the agent does that part on screen.
//!
//! A direct step that closes, deletes, sends, pays or restarts needs the
//! person's own words for it — the same rule as a final button.
//!
//! Also here: Windows' own settings pages by name ("open Bluetooth
//! settings"), opened straight away.

use anyhow::{anyhow, Result};
use std::cell::Cell;
use std::sync::OnceLock;

/// Runs a plain request through Izuki's abilities (set up in `lib.rs` with
/// the app handle). `None`: no ability fits.
type Runner = Box<dyn Fn(&str) -> Option<String> + Send + Sync>;
static RUNNER: OnceLock<Runner> = OnceLock::new();

thread_local! {
    /// This thread is running a direct step: the abilities list must not
    /// start another screen task or replace the running one.
    static IN_STEP: Cell<bool> = const { Cell::new(false) };
}

/// Set once at start-up.
pub fn set_runner(f: impl Fn(&str) -> Option<String> + Send + Sync + 'static) {
    let _ = RUNNER.set(Box::new(f));
}

/// A direct step is running on this thread.
pub fn in_step() -> bool {
    IN_STEP.with(|s| s.get())
}

/// Run one direct step. `Err` starting with `no_direct:` when no ability
/// fits (the agent then does it on screen).
pub fn run(request: &str) -> Result<String> {
    let request = request.trim();
    if request.is_empty() {
        return Err(anyhow!("no_direct: the step didn't say what to do"));
    }
    let Some(runner) = RUNNER.get() else {
        return Err(anyhow!("no_direct: Izuki's abilities aren't ready yet — do it on the screen"));
    };
    struct Leave;
    impl Drop for Leave {
        fn drop(&mut self) {
            IN_STEP.with(|s| s.set(false));
        }
    }
    IN_STEP.with(|s| s.set(true));
    let _leave = Leave;
    match runner(request) {
        // An ability that says it couldn't is a failed step, not a done one.
        Some(said) if sounds_failed(&said) => Err(anyhow!("direct_failed: {said}")),
        Some(said) => Ok(format!("did it directly: {said}")),
        None => Err(anyhow!("no_direct: Izuki has no direct way to \"{request}\" — do that part on the screen")),
    }
}

/// An ability's reply that says it didn't happen ("I couldn't open
/// Bluetooth settings", "I don't see Spotify open", "That didn't work.").
fn sounds_failed(said: &str) -> bool {
    let s = said.to_lowercase().replace('\u{2019}', "'");
    [
        "i couldn't", "couldn't ", "i can't ", "can't ", "i don't see", "didn't work", "that didn't", "doesn't work", "isn't working",
        "not set up", "isn't set up", "works on windows", "works in the windows app", "no app window", "windows didn't let", "failed",
    ]
    .iter()
    .any(|p| s.starts_with(p) || s.contains(&format!(" {p}")) || s.contains(&format!("—{p}")))
}

/// The risky kinds of thing a direct step can do, each with the words that
/// count as the person asking for it.
const SAY_SO: &[(&str, &[&str], &[&str])] = &[
    ("close", &["close", "quit", "exit", "kill", "end task", "shut"], &["close", "quit", "exit", "kill", "end task", "shut"]),
    (
        "delete",
        &["delete", "remove", "erase", "empty", "clear", "clean", "wipe", "uninstall", "format"],
        &["delete", "remove", "erase", "empty", "clear", "clean", "wipe", "uninstall", "format", "free up", "tidy"],
    ),
    ("send", &["send", "post", "publish", "reply", "tweet"], &["send", "post", "publish", "reply", "tweet", "email", "message"]),
    ("pay", &["pay", "buy", "order", "purchase", "checkout", "subscribe"], &["pay", "buy", "order", "purchase", "checkout", "subscribe"]),
    (
        "restart",
        &["restart", "reboot", "shut down", "shutdown", "sign out", "log off", "log out", "hibernate"],
        &["restart", "reboot", "shut down", "shutdown", "sign out", "log off", "log out", "hibernate"],
    ),
];

fn words(s: &str) -> String {
    format!(
        " {} ",
        s.to_lowercase()
            // "don't" is one word, "dont", so a "don't" is seen.
            .replace(['\'', '\u{2019}'], "")
            .chars()
            .map(|c| if c.is_alphanumeric() { c } else { ' ' })
            .collect::<String>()
            .split_whitespace()
            .collect::<Vec<_>>()
            .join(" ")
    )
}

/// Little words that don't name what a step acts on.
const FILLER: &[&str] = &[
    "the", "a", "an", "my", "this", "that", "these", "those", "it", "all", "of", "in", "on", "from", "to", "for", "and", "please", "now", "window",
    "windows", "app", "apps", "everything", "for", "me", "files", "file",
];

/// May this direct step run in a task the person asked for in `task`'s
/// words? Something that closes, deletes, sends, pays or restarts needs
/// their own words for it — the action (not said with "don't" or "never"
/// in front of it), and what it acts on ("close Spotify" never lets a step
/// close Chrome). `Err` names what needs their say-so.
pub fn allowed(request: &str, task: &str) -> Result<(), String> {
    let step = words(request);
    let asked = words(task);
    let asked_words: Vec<&str> = asked.split_whitespace().collect();
    for (kind, risky, consent) in SAY_SO {
        let risky_here: Vec<&str> = risky.iter().copied().filter(|w| step.contains(&format!(" {w} "))).collect();
        if risky_here.is_empty() {
            continue;
        }
        let refuse = || {
            Err(format!(
                "Not done: \"{}\" would {kind} something, and you didn't ask for that — say so if you want it",
                request.trim()
            ))
        };
        // Said, and not denied: "don't close Chrome" is no.
        let said_yes = consent.iter().any(|w| {
            let first = w.split(' ').next().unwrap_or(w);
            asked_words.iter().enumerate().any(|(i, aw)| {
                *aw == first
                    && asked.contains(&format!(" {w} "))
                    && !asked_words[i.saturating_sub(3)..i].iter().any(|n| ["dont", "not", "never", "no", "without"].contains(n))
            })
        });
        if !said_yes {
            return refuse();
        }
        // What it closes, sends to or pays for was named by them too ("close
        // Spotify" never lets a step close Chrome). Clean-ups and restarts
        // act on no one thing of theirs: the action said is enough.
        if !matches!(*kind, "close" | "send" | "pay") {
            continue;
        }
        let target: Vec<&str> = step
            .split_whitespace()
            .filter(|w| !FILLER.contains(w) && !risky.iter().any(|r| r.split(' ').any(|p| p == *w)))
            .collect();
        if !target.iter().all(|w| asked_words.contains(w)) {
            return refuse();
        }
    }
    Ok(())
}

/// Windows settings pages people ask for, and their addresses.
const PAGES: &[(&[&str], &str, &str)] = &[
    (&["wifi", "wi fi", "wireless"], "ms-settings:network-wifi", "Wi-Fi"),
    (&["bluetooth"], "ms-settings:bluetooth", "Bluetooth"),
    (&["display", "screen resolution", "resolution", "brightness", "scale"], "ms-settings:display", "Display"),
    (&["night light"], "ms-settings:nightlight", "Night light"),
    (&["sound", "audio", "volume"], "ms-settings:sound", "Sound"),
    (&["notifications", "notification"], "ms-settings:notifications", "Notifications"),
    (&["do not disturb", "focus assist"], "ms-settings:quiethours", "Do not disturb"),
    (&["battery", "battery saver"], "ms-settings:batterysaver", "Battery"),
    (&["power", "sleep"], "ms-settings:powersleep", "Power & sleep"),
    (&["storage", "disk space"], "ms-settings:storagesense", "Storage"),
    (&["windows update", "updates", "update"], "ms-settings:windowsupdate", "Windows Update"),
    (&["apps", "installed apps", "uninstall"], "ms-settings:appsfeatures", "Installed apps"),
    (&["default apps", "default browser"], "ms-settings:defaultapps", "Default apps"),
    (&["startup apps", "startup"], "ms-settings:startupapps", "Startup apps"),
    (&["background", "wallpaper"], "ms-settings:personalization-background", "Background"),
    (&["colors", "colours", "dark mode", "accent"], "ms-settings:colors", "Colours"),
    (&["themes", "theme"], "ms-settings:themes", "Themes"),
    (&["lock screen"], "ms-settings:lockscreen", "Lock screen"),
    (&["taskbar"], "ms-settings:taskbar", "Taskbar"),
    (&["mouse", "touchpad", "trackpad"], "ms-settings:mousetouchpad", "Mouse & touchpad"),
    (&["keyboard", "typing"], "ms-settings:typing", "Typing"),
    (&["language", "region"], "ms-settings:regionlanguage", "Language & region"),
    (&["date", "time", "time zone"], "ms-settings:dateandtime", "Date & time"),
    (&["vpn"], "ms-settings:network-vpn", "VPN"),
    (&["hotspot", "mobile hotspot"], "ms-settings:network-mobilehotspot", "Mobile hotspot"),
    (&["network", "internet", "ethernet"], "ms-settings:network-status", "Network & internet"),
    (&["printers", "printer", "scanner"], "ms-settings:printers", "Printers & scanners"),
    (&["camera", "webcam"], "ms-settings:privacy-webcam", "Camera privacy"),
    (&["microphone", "mic"], "ms-settings:privacy-microphone", "Microphone privacy"),
    (&["privacy", "permissions"], "ms-settings:privacy", "Privacy & security"),
    (&["accounts", "account", "sign in options", "password", "pin"], "ms-settings:signinoptions", "Sign-in options"),
    (&["about", "pc name", "specs", "system info"], "ms-settings:about", "About"),
    (&["accessibility", "narrator", "magnifier"], "ms-settings:easeofaccess", "Accessibility"),
    (&["gaming", "game mode", "game bar"], "ms-settings:gaming-gamebar", "Gaming"),
    (&["clipboard"], "ms-settings:clipboard", "Clipboard"),
    (&["multitasking", "snap"], "ms-settings:multitasking", "Multitasking"),
];

/// Something else's settings, not Windows' ("Chrome settings", "Izuki
/// settings", "my phone's settings").
const NOT_WINDOWS: &[&str] = &[
    " izuki ", " your settings", " your setting", " chrome ", " edge ", " firefox ", " browser ", " spotify ", " discord ", " steam ",
    " game settings", " in game", " zoom ", " teams ", " vs code ", " vscode ", " word ", " excel ", " phone ", " iphone ", " android ",
    " router ", " tv ", " obs ", " fl studio ", " app settings", " account settings on ",
];

/// "Open Bluetooth settings", "go to display settings", "take me to Windows
/// Update", "open settings": the page's address and name.
pub fn settings_page(said: &str) -> Option<(&'static str, &'static str)> {
    let s = words(said);
    let verb = [" open ", " go to ", " show ", " take me to ", " bring up ", " pull up ", " get me to ", " launch "].iter().any(|v| s.contains(v));
    if !verb || [" how ", " what ", " why ", " dont ", " do not ", " never "].iter().any(|w| s.contains(w)) {
        return None;
    }
    if NOT_WINDOWS.iter().any(|w| s.contains(w)) {
        return None;
    }
    let settings = s.contains(" settings ") || s.contains(" setting ") || s.contains(" windows update ");
    if !settings {
        return None;
    }
    // The longest name that fits wins ("default apps" over "apps").
    let mut best: Option<(usize, &'static str, &'static str)> = None;
    for (names, uri, title) in PAGES {
        for n in names.iter() {
            if s.contains(&format!(" {n} ")) && best.is_none_or(|(len, _, _)| n.len() > len) {
                best = Some((n.len(), uri, title));
            }
        }
    }
    if let Some((_, uri, title)) = best {
        return Some((uri, title));
    }
    // Just "open settings" / "open windows settings".
    let bare = s.trim();
    ["open settings", "open the settings", "open windows settings", "open my settings", "open pc settings", "open computer settings", "go to settings", "show settings"]
        .contains(&bare)
        .then_some(("ms-settings:", "Settings"))
}

/// Open a settings page by its address.
pub fn open_settings(uri: &str) -> Result<()> {
    if !uri.starts_with("ms-settings:") || uri.contains(['"', '&', '|', ' ']) {
        return Err(anyhow!("not a settings page"));
    }
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        // CREATE_NO_WINDOW: no console flashes up.
        std::process::Command::new("explorer.exe").arg(uri).creation_flags(0x0800_0000).spawn()?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn settings_pages_by_name() {
        assert_eq!(settings_page("open bluetooth settings").map(|p| p.1), Some("Bluetooth"));
        assert_eq!(settings_page("Hey Nova, go to my wifi settings").map(|p| p.1), Some("Wi-Fi"));
        assert_eq!(settings_page("open the default apps settings").map(|p| p.1), Some("Default apps"), "the longer name wins");
        assert_eq!(settings_page("take me to windows update").map(|p| p.1), Some("Windows Update"));
        assert_eq!(settings_page("open settings").map(|p| p.0), Some("ms-settings:"));
        assert_eq!(settings_page("open display settings").map(|p| p.0), Some("ms-settings:display"));
        // Not Windows' settings, or not a request to open them.
        assert_eq!(settings_page("open chrome settings"), None);
        assert_eq!(settings_page("open izuki settings"), None);
        assert_eq!(settings_page("how do I open bluetooth settings"), None);
        assert_eq!(settings_page("turn on bluetooth"), None, "that's a switch, not the page");
        assert_eq!(settings_page("open my phone settings"), None);
    }

    #[test]
    fn risky_direct_steps_need_the_persons_own_words() {
        assert!(allowed("close chrome", "my pc is slow, help").is_err(), "closing needs a say-so");
        assert!(allowed("close chrome", "close chrome and open spotify").is_ok());
        assert!(allowed("clear temp files", "my pc is slow, free up some space").is_ok(), "free up counts for cleaning");
        assert!(allowed("empty the recycle bin", "open downloads").is_err());
        assert!(allowed("turn on dark mode", "make my pc look nicer").is_ok(), "nothing risky");
        assert!(allowed("restart the pc", "update windows").is_err());
        assert!(allowed("open bluetooth settings", "connect my headphones").is_ok());
        // Consent is for that very thing, and "don't" is no.
        assert!(allowed("close chrome", "close spotify").is_err(), "a yes for Spotify isn't one for Chrome");
        assert!(allowed("close chrome", "don't close chrome, open spotify").is_err());
        assert!(allowed("close spotify", "please close spotify for me").is_ok());
    }

    #[test]
    fn an_ability_that_says_it_could_not_is_a_failed_step() {
        assert!(sounds_failed("I couldn't open Bluetooth settings: access denied"));
        assert!(sounds_failed("I don't see Spotify open. Open it first, then say it again."));
        assert!(sounds_failed("Windows didn't let me move Chrome."));
        assert!(!sounds_failed("Opened Bluetooth settings."));
        assert!(!sounds_failed("Closed Chrome — all 3 windows."));
    }

    #[test]
    fn a_step_with_nothing_to_do_is_said_so() {
        let e = run("   ").unwrap_err().to_string();
        assert!(e.starts_with("no_direct:"));
    }
}
