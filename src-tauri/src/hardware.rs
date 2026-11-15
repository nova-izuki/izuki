//! What this PC is, and where its hardware settings really live.
//!
//! Asked to "set my battery charge limit", the agent used to open Windows
//! Settings → Power & battery and scroll for a control that isn't there: on
//! almost every laptop the charge limit belongs to the maker's own app
//! (Lenovo Vantage, MyASUS, Dell Power Manager…), and on some only to the
//! BIOS. It narrated "I'll have that charge limit sorted" four times and then
//! gave up. Now a hardware request starts from facts: the maker and model
//! (from the BIOS keys in the registry) and which maker apps are installed
//! (from the per-user app repository), read once and kept. The agent is told
//! where the setting lives and that Windows Settings doesn't have it, so it
//! checks what exists before operating it.
//!
//! Nothing here changes a setting by itself, and no hardware is touched at a
//! low level: the person's own maker app does that, with their yes.

use std::sync::OnceLock;

#[derive(Debug, Clone, Default, PartialEq)]
pub struct Device {
    /// "LENOVO", "ASUSTeK COMPUTER INC.", "Dell Inc."…
    pub maker: String,
    /// "20S1SA4W03"
    pub model: String,
    /// "ThinkPad T14 Gen 1" (empty when the BIOS doesn't say)
    pub family: String,
    /// The maker apps installed for this user: (display name, package family name).
    pub apps: Vec<(String, String)>,
}

impl Device {
    /// "LENOVO ThinkPad T14 Gen 1 (20S1SA4W03)"
    pub fn name(&self) -> String {
        let maker = self.maker.trim();
        let family = self.family.trim();
        let model = self.model.trim();
        match (family.is_empty(), model.is_empty()) {
            (false, false) => format!("{maker} {family} ({model})"),
            (false, true) => format!("{maker} {family}"),
            (true, false) => format!("{maker} {model}"),
            (true, true) => maker.to_string(),
        }
        .trim()
        .to_string()
    }

    fn brand(&self) -> &'static str {
        let m = self.maker.to_lowercase();
        if m.contains("lenovo") {
            "lenovo"
        } else if m.contains("asus") {
            "asus"
        } else if m.contains("dell") || m.contains("alienware") {
            "dell"
        } else if m.contains("hp") || m.contains("hewlett") {
            "hp"
        } else if m.contains("microsoft") {
            "microsoft"
        } else if m.contains("samsung") {
            "samsung"
        } else if m.contains("micro-star") || m.contains("msi") {
            "msi"
        } else if m.contains("acer") {
            "acer"
        } else {
            ""
        }
    }

    pub fn has_app(&self, name: &str) -> Option<&(String, String)> {
        self.apps.iter().find(|(n, _)| n == name)
    }
}

/// Maker apps worth knowing about: (package name prefix, display name).
const MAKER_APPS: &[(&str, &str)] = &[
    ("E046963F.LenovoSettingsforEnterprise", "Lenovo Commercial Vantage"),
    ("E046963F.LenovoCompanion", "Lenovo Vantage"),
    ("B9ECED6F.ASUSPCAssistant", "MyASUS"),
    ("DellInc.MyDell", "MyDell"),
    ("DellInc.DellPowerManager", "Dell Power Manager"),
    ("DellInc.DellOptimizer", "Dell Optimizer"),
    ("AD2F1837.HPPowerManager", "HP Power Manager"),
    ("AD2F1837.myHP", "myHP"),
    ("Microsoft.SurfaceApp", "Surface"),
    ("SAMSUNGELECTRONICSCoLtd.SamsungSettings", "Samsung Settings"),
    ("9426MICRO-STARINTERNATION.MSICenter", "MSI Center"),
    ("AcerIncorporated.AcerCareCenterS", "Acer Care Center"),
];

/// `reg query …\BIOS` output → (maker, model, family).
pub fn parse_bios(out: &str) -> (String, String, String) {
    let value = |key: &str| {
        out.lines()
            .find_map(|line| {
                let mut parts = line.split_whitespace();
                (parts.next() == Some(key)).then(|| {
                    let rest: Vec<&str> = parts.collect();
                    // "SystemManufacturer    REG_SZ    LENOVO"
                    rest.iter().position(|p| p.starts_with("REG_")).map(|i| rest[i + 1..].join(" ")).unwrap_or_default()
                })
            })
            .unwrap_or_default()
    };
    (value("SystemManufacturer"), value("SystemProductName"), value("SystemFamily"))
}

/// The per-user package repository (`reg query …\Repository\Packages`) →
/// maker apps installed, as (display name, package family name).
pub fn parse_packages(out: &str) -> Vec<(String, String)> {
    let mut found: Vec<(String, String)> = Vec::new();
    for line in out.lines() {
        let full = line.trim().rsplit('\\').next().unwrap_or("").trim();
        // Name_Version_Arch_Resource_PublisherId
        let parts: Vec<&str> = full.split('_').collect();
        if parts.len() < 5 {
            continue;
        }
        let (name, publisher) = (parts[0], parts[parts.len() - 1]);
        if let Some((_, shown)) = MAKER_APPS.iter().find(|(prefix, _)| name.eq_ignore_ascii_case(prefix)) {
            let family = format!("{name}_{publisher}");
            if !found.iter().any(|(n, _)| n == shown) {
                found.push((shown.to_string(), family));
            }
        }
    }
    found
}

#[cfg(windows)]
fn reg_query(key: &str) -> String {
    use std::os::windows::process::CommandExt;
    const CREATE_NO_WINDOW: u32 = 0x0800_0000;
    std::process::Command::new("reg")
        .args(["query", key])
        .creation_flags(CREATE_NO_WINDOW)
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).into_owned())
        .unwrap_or_default()
}

#[cfg(not(windows))]
fn reg_query(_key: &str) -> String {
    String::new()
}

/// The package's full name in the listing, from its family name (Name_PublisherId).
fn full_name(listing: &str, family: &str) -> Option<String> {
    let (name, publisher) = family.split_once('_')?;
    listing
        .lines()
        .map(|l| l.trim().rsplit('\\').next().unwrap_or("").trim().to_string())
        .find(|full| full.starts_with(&format!("{name}_")) && full.ends_with(&format!("__{publisher}")))
}

/// A package key's listing → its first application id subkey ("App").
pub fn app_id(out: &str) -> Option<String> {
    let mut keys = out.lines().map(str::trim).filter(|l| l.starts_with("HKEY_"));
    let key = keys.next()?;
    keys.find_map(|l| {
        l.strip_prefix(key)
            .and_then(|rest| rest.strip_prefix('\\'))
            .filter(|id| !id.is_empty() && !id.contains('\\'))
            .map(str::to_string)
    })
}

/// What to start for a maker app asked for by name ("open Lenovo Vantage"):
/// `shell:AppsFolder\Family!AppId` — Store apps have no Start-menu file.
pub fn launch_target(asked: &str) -> Option<String> {
    let asked = asked.to_lowercase();
    let words: Vec<&str> = asked.split_whitespace().filter(|w| !["the", "app", "my", "open"].contains(w)).collect();
    if words.is_empty() {
        return None;
    }
    device()
        .apps
        .iter()
        .find(|(name, _)| {
            let name = name.to_lowercase();
            words.iter().all(|w| name.contains(w))
        })
        .map(|(_, aumid)| format!(r"shell:AppsFolder\{aumid}"))
}

const PACKAGES_KEY: &str = r"HKCU\Software\Classes\Local Settings\Software\Microsoft\Windows\CurrentVersion\AppModel\Repository\Packages";

/// The maker apps installed now: (display name, "Family!AppId"). The app id
/// is the package key's own subkey ("App" almost always).
fn installed_maker_apps() -> Vec<(String, String)> {
    let listing = reg_query(PACKAGES_KEY);
    parse_packages(&listing)
        .into_iter()
        .map(|(name, family)| {
            let id = full_name(&listing, &family)
                .and_then(|full| app_id(&reg_query(&format!(r"{PACKAGES_KEY}\{full}"))))
                .unwrap_or_else(|| "App".to_string());
            (name, format!("{family}!{id}"))
        })
        .collect()
}

/// This PC. The maker and model never change, so they're read once; the
/// maker apps are re-read after a few minutes, so an app installed since
/// (MyASUS, Vantage) isn't reported as missing from a stale list.
pub fn device() -> Device {
    static IDENTITY: OnceLock<(String, String, String)> = OnceLock::new();
    static APPS: std::sync::Mutex<Option<(std::time::Instant, Vec<(String, String)>)>> = std::sync::Mutex::new(None);
    let (maker, model, family) = IDENTITY
        .get_or_init(|| parse_bios(&reg_query(r"HKLM\HARDWARE\DESCRIPTION\System\BIOS")))
        .clone();
    let apps = {
        let mut cached = APPS.lock().unwrap_or_else(|e| e.into_inner());
        match cached.as_ref() {
            Some((at, apps)) if at.elapsed() < std::time::Duration::from_secs(300) => apps.clone(),
            _ => {
                let fresh = installed_maker_apps();
                *cached = Some((std::time::Instant::now(), fresh.clone()));
                fresh
            }
        }
    };
    let d = Device { maker, model, family, apps };
    eprintln!("[hardware] {} · maker apps: {}", d.name(), if d.apps.is_empty() { "none".into() } else { d.apps.iter().map(|(n, _)| n.as_str()).collect::<Vec<_>>().join(", ") });
    d
}

/// Where a battery charge limit lives on this PC: (the apps that have it, the path inside).
pub struct Route {
    pub apps: &'static [&'static str],
    pub path: &'static str,
}

pub fn charge_limit_route(d: &Device) -> Option<Route> {
    let family = d.family.to_lowercase();
    Some(match d.brand() {
        "lenovo" if family.contains("thinkpad") || family.contains("thinkbook") => Route {
            apps: &["Lenovo Commercial Vantage", "Lenovo Vantage"],
            path: "Device → Power → Battery Charge Threshold: turn it on, then set “Stop charging at” (for example 80%)",
        },
        "lenovo" => Route {
            apps: &["Lenovo Vantage"],
            path: "Device → Power → Conservation Mode (keeps the battery around 80% while plugged in)",
        },
        "asus" => Route { apps: &["MyASUS"], path: "Customization → Power & Performance → Battery Health Charging" },
        "dell" => Route {
            apps: &["MyDell", "Dell Power Manager", "Dell Optimizer"],
            path: "MyDell: Power → Charging Mode → Custom (Dell Power Manager / Optimizer: Battery Settings → Custom) — choose when charging starts and stops",
        },
        "hp" => Route {
            apps: &["HP Power Manager", "myHP"],
            path: "Battery health manager (on many HP laptops it's only in the BIOS: Advanced → Battery Health Manager)",
        },
        "microsoft" => Route { apps: &["Surface"], path: "Battery → Smart charging / battery limit" },
        "samsung" => Route { apps: &["Samsung Settings"], path: "Battery Life Extender" },
        "msi" => Route { apps: &["MSI Center"], path: "Features → Battery Master" },
        "acer" => Route { apps: &["Acer Care Center"], path: "Battery → Battery charge limit" },
        _ => return None,
    })
}

/// "battery charge limit", "stop charging at 80", "conservation mode"…
pub fn about_charge_limit(prompt: &str) -> bool {
    let p = prompt.to_lowercase();
    let battery = p.contains("battery") || p.contains("charg");
    battery
        && ["limit", "threshold", "stop charging", "stops charging", "cap ", "capped", "conservation", "80%", "80 %", "80 percent", "battery health", "smart charging", "charge to", "charging to"]
            .iter()
            .any(|w| p.contains(w))
}

/// A request about the machine itself (not a website or a document).
pub fn about_hardware(prompt: &str) -> bool {
    let p = prompt.to_lowercase();
    about_charge_limit(&p)
        || [
            "battery", "charging", "charger", "fan speed", "fan noise", "keyboard light", "keyboard backlight", "backlight",
            "bios", "uefi", "performance mode", "power mode", "thermal", "overheat", "touchpad", "trackpad", "fn key",
            "function key", "webcam shutter", "privacy shutter", "fingerprint reader", "hardware",
        ]
        .iter()
        .any(|w| p.contains(w))
}

/// Facts for the agent's prompt, for hardware requests only ("" otherwise).
pub fn prompt_block(prompt: &str) -> String {
    if !about_hardware(prompt) {
        return String::new();
    }
    block_for(&device(), prompt)
}

pub fn block_for(d: &Device, prompt: &str) -> String {
    let name = d.name();
    let mut out = String::from("\n\nTHIS PC (read from Windows, not guessed): ");
    out += if name.is_empty() { "the maker and model aren't reported" } else { name.as_str() };
    out += ". Maker apps installed: ";
    out += &if d.apps.is_empty() { "none found".to_string() } else { d.apps.iter().map(|(n, _)| n.as_str()).collect::<Vec<_>>().join(", ") };
    out += ". Check what exists before operating it: a hardware setting the screen doesn't show may simply not be on this page or this PC — say so instead of scrolling or clicking around for it.";
    if about_charge_limit(prompt) {
        out += "\nBATTERY CHARGE LIMIT: Windows Settings (System → Power & battery) has no charge-limit control on this PC — don't look for one there.";
        match charge_limit_route(d) {
            Some(route) => {
                let installed = route.apps.iter().find(|a| d.has_app(a).is_some());
                match installed {
                    Some(app) => {
                        out += &format!(" It's set in {app} (installed): {}. Open {app} (search it in Start), go there, and use that control.", route.path);
                    }
                    None => {
                        out += &format!(
                            " On this maker's laptops it's set in {}: {}. That app isn't installed here: say so plainly and offer to open the maker's download page — don't pretend another control does it.",
                            route.apps.join(" or "),
                            route.path
                        );
                    }
                }
            }
            None => out += " This maker isn't one Izuki knows: say Windows has no general charge limit and suggest the laptop maker's own app or the BIOS.",
        }
        out += " If they didn't say a number, ask which limit they want (80% is common) before changing it. Only say it's set once the app shows the saved value.";
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    const BIOS: &str = "\r\nHKEY_LOCAL_MACHINE\\HARDWARE\\DESCRIPTION\\System\\BIOS\r\n    BIOSVendor    REG_SZ    LENOVO\r\n    SystemFamily    REG_SZ    ThinkPad T14 Gen 1\r\n    SystemManufacturer    REG_SZ    LENOVO\r\n    SystemProductName    REG_SZ    20S1SA4W03\r\n";
    const PACKAGES: &str = "\r\nHKEY_CURRENT_USER\\Software\\Classes\\Local Settings\\Software\\Microsoft\\Windows\\CurrentVersion\\AppModel\\Repository\\Packages\\E046963F.LenovoSettingsforEnterprise_20.2608.13.0_x64__k1h2ywk1493x8\r\nHKEY_CURRENT_USER\\Software\\Classes\\Local Settings\\Software\\Microsoft\\Windows\\CurrentVersion\\AppModel\\Repository\\Packages\\Microsoft.WindowsCalculator_11.2408.0.0_x64__8wekyb3d8bbwe\r\n";

    fn thinkpad() -> Device {
        let (maker, model, family) = parse_bios(BIOS);
        Device { maker, model, family, apps: parse_packages(PACKAGES) }
    }

    #[test]
    fn reads_the_maker_model_and_maker_apps() {
        let d = thinkpad();
        assert_eq!(d.name(), "LENOVO ThinkPad T14 Gen 1 (20S1SA4W03)");
        assert_eq!(d.apps, vec![("Lenovo Commercial Vantage".to_string(), "E046963F.LenovoSettingsforEnterprise_k1h2ywk1493x8".to_string())]);
        assert_eq!(
            full_name(PACKAGES, "E046963F.LenovoSettingsforEnterprise_k1h2ywk1493x8").as_deref(),
            Some("E046963F.LenovoSettingsforEnterprise_20.2608.13.0_x64__k1h2ywk1493x8")
        );
    }

    #[test]
    fn the_app_id_is_the_package_keys_subkey() {
        let key = r"HKEY_CURRENT_USER\Software\Classes\Local Settings\Software\Microsoft\Windows\CurrentVersion\AppModel\Repository\Packages\E046963F.LenovoSettingsforEnterprise_20.2608.13.0_x64__k1h2ywk1493x8";
        let listing = format!("\r\n{key}\r\n    DisplayName    REG_SZ    Lenovo Commercial Vantage\r\n\r\n{key}\\App\r\n");
        assert_eq!(app_id(&listing).as_deref(), Some("App"));
        assert_eq!(app_id(""), None);
        assert_eq!(app_id(&format!("{key}\r\n")), None, "no subkey: the caller falls back to App");
    }

    #[test]
    fn a_thinkpad_charge_limit_goes_to_vantage_not_windows_settings() {
        let block = block_for(&thinkpad(), "help me set my battery charging limit");
        assert!(block.contains("Windows Settings (System → Power & battery) has no charge-limit control"));
        assert!(block.contains("Lenovo Commercial Vantage (installed)"));
        assert!(block.contains("Battery Charge Threshold"));
        assert!(block.contains("Only say it's set once the app shows the saved value"));
    }

    #[test]
    fn a_missing_maker_app_is_said_not_invented() {
        let d = Device { maker: "ASUSTeK COMPUTER INC.".into(), model: "UX425".into(), family: "ZenBook".into(), apps: vec![] };
        let block = block_for(&d, "cap my battery at 80%");
        assert!(block.contains("MyASUS"));
        assert!(block.contains("isn't installed here"));
        let unknown = Device { maker: "Framework".into(), ..Default::default() };
        assert!(block_for(&unknown, "set a charge limit").contains("isn't one Izuki knows"));
    }

    #[test]
    fn only_hardware_requests_get_the_facts() {
        assert!(about_charge_limit("help me configure my battery charging limit"));
        assert!(about_charge_limit("turn on conservation mode for the battery"));
        assert!(about_charge_limit("stop charging at 80"));
        assert!(!about_charge_limit("how much battery do I have"));
        assert!(about_hardware("why is my fan noise so loud"));
        assert!(!about_hardware("open youtube and search lofi"));
        assert!(!about_hardware("summarise this page"));
        assert_eq!(prompt_block("open youtube"), "");
    }

    #[test]
    fn short_bios_answers_still_read() {
        let (maker, model, family) = parse_bios("    SystemManufacturer    REG_SZ    Dell Inc.\r\n    SystemProductName    REG_SZ    Latitude 7420\r\n");
        assert_eq!((maker.as_str(), model.as_str(), family.as_str()), ("Dell Inc.", "Latitude 7420", ""));
        let d = Device { maker, model, family, apps: vec![] };
        assert_eq!(d.name(), "Dell Inc. Latitude 7420");
        assert!(charge_limit_route(&d).unwrap().apps.contains(&"Dell Power Manager"));
    }
}
