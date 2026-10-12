//! "Turn off services I don't use" — Windows' side of a classic hardening
//! step (on Linux: disabling unused daemons). Every background service that
//! runs is one more thing that can be attacked or that watches; most people
//! never use these.
//!
//! Only a known list is ever touched, never a guess, and only with Windows'
//! permission (one prompt). Each is set to start only when something asks
//! for it, or switched off for the ones that only open a door (Remote
//! Registry, Telnet…). What each was before is kept, so Undo puts it back.

use anyhow::Result;
use serde::Serialize;
use std::collections::HashMap;
use std::path::PathBuf;
use std::time::Duration;

/// A service worth turning off, as found on this PC.
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Svc {
    pub id: String,
    pub name: String,
    /// What it does and why it's worth turning off.
    pub why: String,
    /// "security", "privacy" or "speed".
    pub kind: &'static str,
    /// Leave it alone if… (shown with it).
    pub only_if: Option<String>,
    /// Ticked to start with.
    pub recommended: bool,
    pub running: bool,
    /// Windows' start type now: "Automatic", "Manual" or "Disabled".
    pub start: String,
}

struct Known {
    id: &'static str,
    why: &'static str,
    kind: &'static str,
    only_if: Option<&'static str>,
    recommended: bool,
    /// Switched off entirely (a door nobody at home needs), not just "on demand".
    disable: bool,
}

const fn k(id: &'static str, why: &'static str, kind: &'static str, only_if: Option<&'static str>, recommended: bool, disable: bool) -> Known {
    Known { id, why, kind, only_if, recommended, disable }
}

const KNOWN: &[Known] = &[
    k("RemoteRegistry", "Lets other computers on the network read and change this PC's settings.", "security", None, true, true),
    k("TlntSvr", "An old, unencrypted way to log in to this PC.", "security", None, true, true),
    k("SNMP", "Reports this PC's details to network-management tools.", "security", None, true, true),
    k("RemoteAccess", "Makes this PC a router or VPN server.", "security", None, true, true),
    k("SharedAccess", "Hands this PC's internet to other devices.", "security", Some("you use Mobile hotspot, WSL, Docker or a virtual machine — they share the internet through it"), false, false),
    k("Spooler", "No printer is set up, and it's been the target of real attacks (PrintNightmare).", "security", Some("you're about to set up a printer"), true, false),
    k("SSDPSrv", "Finds smart devices on your network and lets them find this PC.", "security", Some("you cast or stream from Windows to a TV, speaker or media box"), false, false),
    k("upnphost", "Hosts UPnP devices so others on the network can control them.", "security", Some("you share media from this PC to a TV or console"), false, false),
    k("sshd", "Lets people log in to this PC with SSH.", "security", Some("you log in to this PC with SSH from another machine"), false, false),
    k("FTPSVC", "Shares files from this PC over the network.", "security", Some("you run an FTP server on purpose"), false, false),
    k("DiagTrack", "Sends usage data about this PC to Microsoft.", "privacy", None, true, false),
    k("dmwappushservice", "Routes device-management push messages (part of telemetry).", "privacy", None, true, false),
    k("MapsBroker", "Keeps offline maps updated in the background.", "speed", Some("you use offline maps in the Windows Maps app"), true, false),
    k("RetailDemo", "Store demo mode for display PCs.", "speed", None, true, false),
    k("Fax", "Sends and receives faxes.", "speed", Some("you fax from this PC"), true, false),
    k("WMPNetworkSvc", "Shares your Windows Media Player library over the network.", "speed", None, true, false),
    k("XblAuthManager", "Xbox Live sign-in.", "speed", Some("you play Xbox or Game Pass games on this PC"), false, false),
    k("XblGameSave", "Xbox Live cloud saves.", "speed", Some("you play Xbox or Game Pass games on this PC"), false, false),
    k("XboxNetApiSvc", "Xbox Live networking.", "speed", Some("you play Xbox or Game Pass games on this PC"), false, false),
    k("XboxGipSvc", "Xbox accessories (controllers).", "speed", Some("you use an Xbox controller or accessory"), false, false),
];

fn known(id: &str) -> Option<&'static Known> {
    KNOWN.iter().find(|s| s.id.eq_ignore_ascii_case(id))
}

/// "Turn off services I don't use", "disable unnecessary services", "shut
/// down the daemons I don't need".
pub fn is_request(said: &str) -> bool {
    let s = said.to_lowercase();
    let what = ["service", "daemon"].iter().any(|w| s.contains(w));
    let off = ["turn off", "shut down", "shutdown", "disable", "stop", "don't use", "dont use", "don't need", "dont need", "unnecessary", "unused", "harden"]
        .iter()
        .any(|w| s.contains(w));
    what && off && !s.contains("customer service")
}

/// What's on this PC from the list, still starting by itself or running.
pub fn scan() -> Vec<Svc> {
    let ids: Vec<String> = KNOWN.iter().map(|s| format!("'{}'", s.id)).collect();
    let script = format!(
        r#"$names = @({})
$o = @{{}}
$o.svc = @(Get-Service -Name $names -ErrorAction SilentlyContinue | ForEach-Object {{ @{{ id = [string]$_.Name; name = [string]$_.DisplayName; status = [string]$_.Status; start = [string]$_.StartType }} }})
$o.printers = @(Get-CimInstance Win32_Printer -ErrorAction SilentlyContinue | Where-Object {{ $_.Name -notmatch 'PDF|XPS|OneNote|Fax|Send To' }}).Count
$o | ConvertTo-Json -Compress -Depth 4"#,
        ids.join(",")
    );
    let raw = crate::deepclean::powershell(&script, Duration::from_secs(25)).unwrap_or_default();
    let v: serde_json::Value = serde_json::from_str(raw.trim()).unwrap_or(serde_json::Value::Null);
    from_windows(&v)
}

fn from_windows(v: &serde_json::Value) -> Vec<Svc> {
    let printers = v["printers"].as_u64().unwrap_or(1);
    let mut out = Vec::new();
    for s in v["svc"].as_array().into_iter().flatten() {
        let id = s["id"].as_str().unwrap_or_default();
        let Some(k) = known(id) else { continue };
        let running = s["status"].as_str() == Some("Running");
        let start = s["start"].as_str().unwrap_or("").to_string();
        // Already quiet: nothing to do.
        if !running && start != "Automatic" {
            continue;
        }
        // The spooler is only worth turning off with no printer set up.
        if k.id == "Spooler" && printers > 0 {
            continue;
        }
        out.push(Svc {
            id: k.id.to_string(),
            name: s["name"].as_str().unwrap_or(k.id).to_string(),
            why: k.why.to_string(),
            kind: k.kind,
            only_if: k.only_if.map(|o| format!("Leave it on if {o}.")),
            recommended: k.recommended,
            running,
            start,
        });
    }
    let order = |s: &Svc| ["security", "privacy", "speed"].iter().position(|k| *k == s.kind).unwrap_or(3);
    out.sort_by_key(|s| (order(s), !s.recommended));
    out
}

fn undo_file() -> PathBuf {
    crate::store::data_dir().join("services-undo.json")
}

/// A fresh file in Izuki's own folder for a script run with Windows'
/// permission and its answer — never a fixed name in the shared temp folder,
/// where another program could swap it in the moment before it runs as admin.
pub(crate) fn private_file(stem: &str, ext: &str) -> Result<PathBuf> {
    let dir = crate::store::data_dir().join("elevated");
    std::fs::create_dir_all(&dir)?;
    Ok(dir.join(format!("{stem}-{}.{ext}", uuid::Uuid::new_v4().simple())))
}

/// Run a fixed script with Windows' permission (one prompt); what it wrote
/// to `result`. `None` if permission wasn't given.
pub(crate) fn run_elevated(body: &str, result: &std::path::Path, timeout: Duration) -> Result<Option<String>> {
    let _ = std::fs::remove_file(result);
    let script = private_file("run", "ps1")?;
    std::fs::write(&script, body)?;
    // What runs is exactly what was written.
    if std::fs::read_to_string(&script).ok().as_deref() != Some(body) {
        let _ = std::fs::remove_file(&script);
        anyhow::bail!("the script changed before it could run");
    }
    let q = |s: &str| format!("'{}'", s.replace('\'', "''"));
    let launch = format!(
        "try {{ Start-Process powershell -Verb RunAs -WindowStyle Hidden -Wait -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File',{} ; 'ok' }} catch {{ 'no' }}",
        q(&script.to_string_lossy())
    );
    let out = crate::deepclean::powershell(&launch, timeout);
    let _ = std::fs::remove_file(&script);
    if out?.trim().ends_with("no") {
        return Ok(None);
    }
    let text = std::fs::read_to_string(result).unwrap_or_default();
    let _ = std::fs::remove_file(result);
    Ok(Some(text))
}

fn elevated(body: &str, result: &std::path::Path) -> Result<Option<String>> {
    run_elevated(body, result, Duration::from_secs(180))
}

/// Quiet the chosen services (only ones on the list). What happened, in words.
pub fn quiet(ids: &[String]) -> Result<String> {
    let chosen: Vec<&Known> = ids.iter().filter_map(|i| known(i)).collect();
    if chosen.is_empty() {
        return Ok("Nothing chosen.".into());
    }
    // What each was, for Undo.
    let before: HashMap<String, String> = scan().into_iter().map(|s| (s.id, s.start)).collect();
    let result = private_file("services-result", "txt")?;
    let lines: Vec<String> = chosen
        .iter()
        .map(|k| {
            format!(
                "try {{ Stop-Service -Name '{id}' -Force -ErrorAction Stop; Set-Service -Name '{id}' -StartupType {t} -ErrorAction Stop; $ok += '{id}' }} catch {{ $bad += '{id}' }}",
                id = k.id,
                t = if k.disable { "Disabled" } else { "Manual" }
            )
        })
        .collect();
    let body = format!(
        "$ok = @(); $bad = @()\n{}\n\"$($ok -join ',')|$($bad -join ',')\" | Out-File -FilePath '{}' -Encoding ascii\n",
        lines.join("\n"),
        result.to_string_lossy().replace('\'', "''")
    );
    let Some(text) = elevated(&body, &result)? else {
        return Ok("Okay — I left the services as they were (Windows' permission wasn't given).".into());
    };
    let (ok_ids, bad) = text.trim().split_once('|').unwrap_or(("", ""));
    let changed: Vec<&str> = ok_ids.split(',').map(str::trim).filter(|s| !s.is_empty()).collect();
    // Only what really changed goes into Undo (kept with anything from before).
    if !changed.is_empty() {
        let mut undo: HashMap<String, String> = std::fs::read_to_string(undo_file()).ok().and_then(|t| serde_json::from_str(&t).ok()).unwrap_or_default();
        for id in &changed {
            if let Some(start) = before.get(*id) {
                undo.entry((*id).to_string()).or_insert_with(|| start.clone());
            }
        }
        std::fs::write(undo_file(), serde_json::to_string(&undo)?)?;
    }
    let ok = changed.len();
    let mut said = format!("Turned off {ok} service{} you don't use — less running in the background, fewer ways in.", if ok == 1 { "" } else { "s" });
    if !bad.trim().is_empty() {
        said.push_str(&format!(" Windows wouldn't let me change {}.", bad.trim().replace(',', ", ")));
    }
    said.push_str(" Undo puts them back.");
    Ok(said)
}

/// Put back the services turned off before, as they were.
pub fn undo() -> Result<String> {
    let undo: HashMap<String, String> = std::fs::read_to_string(undo_file()).ok().and_then(|t| serde_json::from_str(&t).ok()).unwrap_or_default();
    let back: Vec<(&Known, String)> = undo.iter().filter_map(|(id, start)| known(id).map(|k| (k, start.clone()))).collect();
    if back.is_empty() {
        return Ok("Nothing to undo.".into());
    }
    let result = private_file("services-result", "txt")?;
    let lines: Vec<String> = back
        .iter()
        .map(|(k, start)| {
            let t = match start.as_str() { "Automatic" => "Automatic", "Disabled" => "Disabled", _ => "Manual" };
            let then = if t == "Automatic" { format!("; Start-Service -Name '{}' -ErrorAction SilentlyContinue", k.id) } else { String::new() };
            format!("try {{ Set-Service -Name '{}' -StartupType {t} -ErrorAction Stop{then}; $ok++ }} catch {{}}", k.id)
        })
        .collect();
    let body = format!(
        "$ok = 0\n{}\n\"$ok\" | Out-File -FilePath '{}' -Encoding ascii\n",
        lines.join("\n"),
        result.to_string_lossy().replace('\'', "''")
    );
    let Some(text) = elevated(&body, &result)? else {
        return Ok("Okay — nothing changed (Windows' permission wasn't given).".into());
    };
    let _ = std::fs::remove_file(undo_file());
    let ok: usize = text.trim().parse().unwrap_or(0);
    Ok(format!("Put {ok} service{} back the way they were.", if ok == 1 { "" } else { "s" }))
}

/// "Turn off services I don't use" said out loud: what was found, and where to choose.
pub fn spoken() -> String {
    let found = scan();
    let rec: Vec<&Svc> = found.iter().filter(|s| s.recommended).collect();
    if found.is_empty() {
        return "Your PC's already lean — none of the usual unneeded services are running.".into();
    }
    let names: Vec<String> = rec.iter().take(4).map(|s| s.name.clone()).collect();
    format!(
        "I found {} background service{} you probably don't need{}. Open Settings → PC Care → Background services to pick them — Windows asks permission once, and Undo puts them back.",
        found.len(),
        if found.len() == 1 { "" } else { "s" },
        if names.is_empty() { String::new() } else { format!(", like {}", names.join(", ")) }
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    /// What it finds on this PC (only looks): run by hand with --ignored --nocapture.
    #[test]
    #[ignore]
    fn prints_the_real_scan() {
        for s in scan() {
            println!("{} [{}] {} — {} ({}{})", if s.recommended { "x" } else { " " }, s.kind, s.name, s.why, s.start, if s.running { ", running" } else { "" });
        }
    }

    #[test]
    fn hears_the_request() {
        for said in ["turn off services I don't use", "disable unnecessary services", "shut down the daemons I don't need", "harden my pc services"] {
            assert!(is_request(said), "{said}");
        }
        for said in ["call customer service and stop it", "what services do you offer"] {
            assert!(!is_request(said), "{said}");
        }
    }

    #[test]
    fn only_known_running_ones_are_offered() {
        let v = json!({
            "printers": 0,
            "svc": [
                { "id": "RemoteRegistry", "name": "Remote Registry", "status": "Stopped", "start": "Automatic" },
                { "id": "DiagTrack", "name": "Connected User Experiences and Telemetry", "status": "Running", "start": "Automatic" },
                { "id": "Fax", "name": "Fax", "status": "Stopped", "start": "Manual" },
                { "id": "Spooler", "name": "Print Spooler", "status": "Running", "start": "Automatic" },
                { "id": "XblGameSave", "name": "Xbox Live Game Save", "status": "Running", "start": "Manual" },
                { "id": "WSearch", "name": "Windows Search", "status": "Running", "start": "Automatic" }
            ]
        });
        let s = from_windows(&v);
        let ids: Vec<&str> = s.iter().map(|s| s.id.as_str()).collect();
        assert_eq!(ids, vec!["RemoteRegistry", "Spooler", "DiagTrack", "XblGameSave"]);
        assert!(!s.iter().find(|x| x.id == "XblGameSave").unwrap().recommended);
    }

    #[test]
    fn a_printer_keeps_the_spooler() {
        let v = json!({ "printers": 1, "svc": [{ "id": "Spooler", "name": "Print Spooler", "status": "Running", "start": "Automatic" }] });
        assert!(from_windows(&v).is_empty());
    }

    #[test]
    fn nothing_outside_the_list_is_ever_touched() {
        assert!(known("WSearch").is_none());
        assert!(known("wuauserv").is_none());
        assert!(known("remoteregistry").is_some());
    }
}
