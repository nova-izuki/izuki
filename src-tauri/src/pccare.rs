//! PC Care: keeps an eye on what keeps a PC safe and healthy — antivirus,
//! firewall, disk space, drive health, a restart Windows Update is waiting
//! for — and says so on the Island (and on your phone, if one is linked) the
//! moment one needs you, with the fix one tap away. Quiet otherwise: the
//! same problem is mentioned at most twice a day, and only while it lasts.
//!
//! It only looks. Turning anything on is Windows' own screen, opened for you.

use parking_lot::Mutex;
use serde::Serialize;
use std::collections::HashMap;
use std::time::{Duration, Instant};

/// One line of the health check.
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Check {
    /// "antivirus", "firewall", "space:C:", "drive", "restart".
    pub key: String,
    pub label: String,
    pub ok: bool,
    pub detail: String,
    /// The one-tap fix: (button, Island op).
    pub fix: Option<(String, String)>,
}

/// What Windows says, read in one go by a fixed script (nothing from
/// outside goes into it). The firewall comes from the registry (a Group
/// Policy setting wins) and drives from CIM directly: the friendlier
/// cmdlets took 10–15 s each just to load.
const SCRIPT: &str = r#"$o = @{}
try { $o.av = @(Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntiVirusProduct -ErrorAction Stop | ForEach-Object { @{ name = [string]$_.displayName; state = [int64]$_.productState } }) } catch { $o.av = $null }
try { $o.fwp = @(Get-CimInstance -Namespace root/SecurityCenter2 -ClassName FirewallProduct -ErrorAction Stop | ForEach-Object { @{ name = [string]$_.displayName; state = [int64]$_.productState } }) } catch { $o.fwp = @() }
try { $m = Get-MpComputerStatus -ErrorAction Stop; $o.mp = @{ rtp = [bool]$m.RealTimeProtectionEnabled; age = [int]$m.AntivirusSignatureAge } } catch { $o.mp = $null }
$base = 'HKLM:\SYSTEM\CurrentControlSet\Services\SharedAccess\Parameters\FirewallPolicy'; $pol = 'HKLM:\SOFTWARE\Policies\Microsoft\WindowsFirewall'
$o.fw = @(foreach ($p in @(@('Domain','DomainProfile','DomainProfile'), @('Private','StandardProfile','PrivateProfile'), @('Public','PublicProfile','PublicProfile'))) { $v = (Get-ItemProperty -Path "$pol\$($p[2])" -Name EnableFirewall -ErrorAction SilentlyContinue).EnableFirewall; if ($null -eq $v) { $v = (Get-ItemProperty -Path "$base\$($p[1])" -Name EnableFirewall -ErrorAction SilentlyContinue).EnableFirewall }; if ($null -ne $v) { @{ name = $p[0]; on = ($v -eq 1) } } })
try { $o.disks = @(Get-CimInstance -Namespace root/Microsoft/Windows/Storage -ClassName MSFT_PhysicalDisk -ErrorAction Stop | ForEach-Object { @{ name = [string]$_.FriendlyName; health = switch ([int]$_.HealthStatus) { 0 { 'Healthy' } 1 { 'Warning' } 2 { 'Unhealthy' } default { '' } } } }) } catch { $o.disks = @() }
$o.restart = (Test-Path 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate\Auto Update\RebootRequired')
$o | ConvertTo-Json -Compress -Depth 4"#;

/// A Security Center product state: (switched on, definitions up to date).
/// The middle byte is 0x10/0x11 when on; the low byte is 0x00 when current.
fn product_state(state: i64) -> (bool, bool) {
    let mid = (state >> 8) & 0xff;
    let low = state & 0xff;
    (mid == 0x10 || mid == 0x11, low == 0x00)
}

fn named(list: &serde_json::Value) -> Vec<(String, i64)> {
    list.as_array()
        .map(|a| {
            a.iter()
                .map(|p| (p["name"].as_str().unwrap_or("").trim().to_string(), p["state"].as_i64().unwrap_or(0)))
                .filter(|(n, _)| !n.is_empty())
                .collect()
        })
        .unwrap_or_default()
}

const OPEN_SECURITY: &str = "settings:windowsdefender:";
const OPEN_FIREWALL: &str = "settings:windowsdefender://network";
const OPEN_UPDATE: &str = "settings:ms-settings:windowsupdate";

/// The security and drive checks, from what the script read.
fn from_windows(v: &serde_json::Value) -> Vec<Check> {
    let mut out = Vec::new();

    // Antivirus: any product Windows' Security Center says is on (Defender,
    // or one you installed — then Defender rightly steps back).
    let avs = named(&v["av"]);
    let on: Vec<&(String, i64)> = avs.iter().filter(|(_, s)| product_state(*s).0).collect();
    let mp_on = v["mp"]["rtp"].as_bool();
    let age = v["mp"]["age"].as_i64().unwrap_or(0);
    if let Some((name, state)) = on.first() {
        // Microsoft's own (its definitions' age is what Get-MpComputerStatus
        // reports) — not "Bitdefender".
        let lower = name.to_lowercase();
        let defender = lower.starts_with("windows defender") || lower.starts_with("microsoft defender");
        let stale = !product_state(*state).1 || (defender && age > 7);
        out.push(Check {
            key: "antivirus".into(),
            label: "Antivirus".into(),
            ok: !stale,
            detail: if stale {
                format!("{name} is on, but its virus definitions are out of date{}.", if defender && age > 0 { format!(" ({age} days old)") } else { String::new() })
            } else {
                format!("{name} is on and up to date.")
            },
            fix: stale.then(|| ("Update it".into(), OPEN_SECURITY.into())),
        });
    } else if v["av"].is_array() || mp_on.is_some() {
        // Windows answered, and nothing is protecting this PC.
        let ok = mp_on == Some(true);
        out.push(Check {
            key: "antivirus".into(),
            label: "Antivirus".into(),
            ok,
            detail: if ok { "Microsoft Defender is on.".into() } else { "No antivirus is protecting this PC — real-time protection is off.".into() },
            fix: (!ok).then(|| ("Turn it on".into(), OPEN_SECURITY.into())),
        });
    }

    // Firewall: Windows' own, every network type — unless another firewall
    // Security Center knows about is on instead.
    let other_fw = named(&v["fwp"]).into_iter().find(|(_, s)| product_state(*s).0).map(|(n, _)| n);
    // Nothing read is nothing claimed.
    if let Some(profiles) = v["fw"].as_array().filter(|p| !p.is_empty()) {
        let off: Vec<String> = profiles.iter().filter(|p| p["on"].as_bool() == Some(false)).filter_map(|p| p["name"].as_str().map(str::to_string)).collect();
        let ok = off.is_empty() || other_fw.is_some();
        out.push(Check {
            key: "firewall".into(),
            label: "Firewall".into(),
            ok,
            detail: match (&other_fw, off.is_empty()) {
                (_, true) => "On for every network.".into(),
                (Some(name), false) => format!("{name} is protecting this PC."),
                (None, false) => format!("Off for {} networks — anyone on the same Wi-Fi can reach this PC more easily.", off.join(" and ").to_lowercase()),
            },
            fix: (!ok).then(|| ("Turn it on".into(), OPEN_FIREWALL.into())),
        });
    }

    // Drive health, as the drive itself reports it.
    if let Some(disks) = v["disks"].as_array() {
        let sick: Vec<String> = disks
            .iter()
            .filter(|d| d["health"].as_str().is_some_and(|h| !h.is_empty() && !h.eq_ignore_ascii_case("healthy")))
            .map(|d| format!("{} ({})", d["name"].as_str().unwrap_or("A drive").trim(), d["health"].as_str().unwrap_or("").to_lowercase()))
            .collect();
        if !disks.is_empty() {
            out.push(Check {
                key: "drive".into(),
                label: "Drive health".into(),
                ok: sick.is_empty(),
                detail: if sick.is_empty() {
                    format!("{} healthy.", if disks.len() == 1 { "Your drive is".to_string() } else { format!("All {} drives are", disks.len()) })
                } else {
                    format!("{} may be failing — back up what matters now.", sick.join(", "))
                },
                fix: (!sick.is_empty()).then(|| ("Back up now".into(), "ask:Help me back up my important files now — my drive may be failing.".into())),
            });
        }
    }

    if v["restart"].as_bool() == Some(true) {
        out.push(Check {
            key: "restart".into(),
            label: "Windows Update".into(),
            ok: false,
            detail: "Updates are installed and waiting for a restart to finish.".into(),
            fix: Some(("Open Windows Update".into(), OPEN_UPDATE.into())),
        });
    } else if v.is_object() {
        out.push(Check { key: "restart".into(), label: "Windows Update".into(), ok: true, detail: "Nothing waiting on a restart.".into(), fix: None });
    }
    out
}

/// Free space on each drive: low under 10 GB, or under 5% (and 30 GB) —
/// 39 GB free on a big drive is fine.
fn space_checks() -> Vec<Check> {
    crate::storage::drives()
        .into_iter()
        .filter(|(_, _, total)| *total > 1.0)
        .map(|(d, free, total)| {
            let low = free < 10.0 || (free / total < 0.05 && free < 30.0);
            Check {
                key: format!("space:{d}"),
                label: format!("Space on {d}"),
                ok: !low,
                detail: if low { format!("Only {free:.1} GB free of {total:.0} GB — the PC slows down and updates fail when a drive is this full.") } else { format!("{free:.0} GB free of {total:.0} GB.") },
                fix: low.then(|| ("Free up space".into(), "ask:make my PC fast".into())),
            }
        })
        .collect()
}

/// The whole check, now (a few seconds: Windows is asked once).
pub fn check() -> Vec<Check> {
    let raw = crate::deepclean::powershell(SCRIPT, Duration::from_secs(25)).unwrap_or_default();
    let v: serde_json::Value = serde_json::from_str(raw.trim()).unwrap_or(serde_json::Value::Null);
    let mut out = from_windows(&v);
    out.extend(space_checks());
    let order = |c: &Check| ["antivirus", "firewall", "drive", "space", "restart"].iter().position(|k| c.key.starts_with(k)).unwrap_or(9);
    out.sort_by_key(order);
    *LAST.lock() = Some(out.clone());
    out
}

/// The last full check (for the Settings card to show at once).
pub fn last() -> Option<Vec<Check>> {
    LAST.lock().clone()
}

static LAST: Mutex<Option<Vec<Check>>> = Mutex::new(None);
/// When each problem was last mentioned.
static TOLD: Mutex<Option<HashMap<String, Instant>>> = Mutex::new(None);
const RETELL_AFTER: Duration = Duration::from_secs(12 * 3600);

/// Mention what's wrong that hasn't been mentioned lately; forget what's fixed.
fn alert(checks: &[Check], only: Option<&str>) {
    let mut told = TOLD.lock();
    let told = told.get_or_insert_with(HashMap::new);
    for c in checks.iter().filter(|c| only.is_none_or(|k| c.key.starts_with(k))) {
        if c.ok {
            told.remove(&c.key);
            continue;
        }
        if told.get(&c.key).is_some_and(|t| t.elapsed() < RETELL_AFTER) {
            continue;
        }
        told.insert(c.key.clone(), Instant::now());
        eprintln!("[pc-care] {}: {}", c.label, c.detail);
        crate::activity::show_care(c);
        // The restart reminder isn't worth a phone buzz.
        if c.key != "restart" {
            crate::companion::notify_everywhere(&format!("🛡️ PC Care — {}: {}", c.label, c.detail));
        }
    }
}

/// "Is my PC safe?", "is my antivirus on?", "check my PC's health" — any
/// wording. ("Check my PC" alone is the status screen.)
pub fn is_care_question(said: &str) -> bool {
    let s = said.to_lowercase().replace(['’', '\''], "");
    let about = ["antivirus", "anti virus", "anti-virus", "firewall", "defender", "virus protection", "drive health", "disk health", "pc health", "computer health", "laptop health", "pcs health", "health check"]
        .iter()
        .any(|w| s.contains(w));
    let safe = ["my pc", "my computer", "my laptop", "this pc"].iter().any(|w| s.contains(w))
        && ["safe", "secure", "protected", "healthy", "health"].iter().any(|w| s.contains(w));
    // Asking, not telling it to change something.
    let changing = ["turn off", "disable", "uninstall", "remove ", "switch off"].iter().any(|w| s.contains(w));
    (about || safe) && !changing
}

/// The check, said out loud in a sentence or two.
pub fn spoken() -> String {
    let checks = check();
    if checks.is_empty() {
        return "I couldn't read your PC's health just now — try again in a moment.".into();
    }
    let bad: Vec<&Check> = checks.iter().filter(|c| !c.ok).collect();
    if bad.is_empty() {
        let names: Vec<String> = checks.iter().filter(|c| !c.key.starts_with("space") && c.key != "restart").map(|c| c.label.to_lowercase()).collect();
        return format!("Your PC looks healthy — {} all good, and plenty of space. Settings → PC Care has the details.", names.join(", "));
    }
    for c in &bad {
        crate::activity::show_care(c);
    }
    let lines: Vec<String> = bad.iter().map(|c| format!("{}: {}", c.label, c.detail)).collect();
    format!(
        "{} need{} you. {} The fix is on the Island, or in Settings → PC Care.",
        if bad.len() == 1 { "One thing".to_string() } else { format!("{} things", bad.len()) },
        if bad.len() == 1 { "s" } else { "" },
        lines.join(" ")
    )
}

/// In the background: disk space every 10 minutes (instant), the full check
/// a few minutes after start and then every 3 hours. Nothing at all while
/// alerts are switched off.
pub fn spawn() {
    let _ = std::thread::Builder::new().name("izuki-pc-care".into()).spawn(|| {
        std::thread::sleep(Duration::from_secs(4 * 60));
        let mut full_at: Option<Instant> = None;
        loop {
            let on = crate::state::try_store().is_some_and(|s| s.settings().pc_care_alerts);
            if on && !crate::uia::screen_locked() {
                let due = full_at.is_none_or(|t| t.elapsed() >= Duration::from_secs(3 * 3600));
                let ran = std::panic::catch_unwind(|| {
                    if due {
                        alert(&check(), None);
                    } else {
                        alert(&space_checks(), Some("space"));
                    }
                });
                // A check that broke is tried again next time, not in 3 hours.
                if due && ran.is_ok() {
                    full_at = Some(Instant::now());
                }
            }
            std::thread::sleep(Duration::from_secs(10 * 60));
        }
    });
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    /// The real check on this PC: run by hand with --ignored --nocapture.
    #[test]
    #[ignore]
    fn prints_the_real_check() {
        let t = Instant::now();
        for c in check() {
            println!("{} {} — {} {:?}", if c.ok { "OK " } else { "!! " }, c.label, c.detail, c.fix);
        }
        println!("(took {} ms)", t.elapsed().as_millis());
    }

    #[test]
    fn reads_security_center_states() {
        assert_eq!(product_state(0x061100), (true, true)); // Defender on, current
        assert_eq!(product_state(0x060100), (false, true)); // off
        assert_eq!(product_state(0x061110), (true, false)); // on, out of date
    }

    #[test]
    fn a_healthy_pc_is_all_ticks() {
        let v = json!({
            "av": [{ "name": "Windows Defender", "state": 0x061100 }],
            "mp": { "rtp": true, "age": 0 },
            "fw": [{ "name": "Domain", "on": true }, { "name": "Private", "on": true }, { "name": "Public", "on": true }],
            "fwp": [],
            "disks": [{ "name": "NVMe SSD", "health": "Healthy" }],
            "restart": false
        });
        let c = from_windows(&v);
        assert!(c.iter().all(|c| c.ok), "{c:?}");
        assert_eq!(c.len(), 4);
    }

    #[test]
    fn problems_come_with_their_fix() {
        let v = json!({
            "av": [{ "name": "Windows Defender", "state": 0x060100 }],
            "mp": { "rtp": false, "age": 2 },
            "fw": [{ "name": "Public", "on": false }, { "name": "Private", "on": true }],
            "fwp": [],
            "disks": [{ "name": "WD Blue", "health": "Warning" }],
            "restart": true
        });
        let c = from_windows(&v);
        let by = |k: &str| c.iter().find(|c| c.key == k).unwrap();
        assert!(!by("antivirus").ok && by("antivirus").fix.as_ref().unwrap().1 == OPEN_SECURITY);
        assert!(!by("firewall").ok && by("firewall").detail.contains("public"));
        assert!(!by("drive").ok && by("drive").detail.contains("WD Blue"));
        assert!(!by("restart").ok);
    }

    #[test]
    fn another_antivirus_or_firewall_counts() {
        let v = json!({
            "av": [{ "name": "Windows Defender", "state": 0x060100 }, { "name": "Bitdefender", "state": 0x041000 }],
            "mp": { "rtp": false, "age": 30 },
            "fw": [{ "name": "Public", "on": false }],
            "fwp": [{ "name": "Bitdefender Firewall", "state": 0x041000 }],
            "disks": []
        });
        let c = from_windows(&v);
        assert!(c.iter().find(|c| c.key == "antivirus").unwrap().ok);
        assert!(c.iter().find(|c| c.key == "firewall").unwrap().ok);
    }

    #[test]
    fn hears_health_questions() {
        for said in ["is my pc safe", "is my antivirus on?", "check my pc's health", "is the firewall on", "run a health check", "is my laptop protected"] {
            assert!(is_care_question(said), "{said}");
        }
        for said in ["check my pc", "turn off the firewall", "open youtube", "how much space do i have"] {
            assert!(!is_care_question(said), "{said}");
        }
    }

    #[test]
    fn nothing_read_means_nothing_claimed() {
        assert!(from_windows(&serde_json::Value::Null).is_empty());
    }
}
