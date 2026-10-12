//! FL Studio co-producer — Izuki driving FL Studio like a producer would,
//! fast and exact: through FL Studio's own scripting API, not the mouse.
//!
//! The link: a small controller script (flstudio/device_Izuki.py) in FL's
//! Hardware folder, joined to Izuki by a virtual MIDI cable — Windows' own
//! (Windows MIDI Services loopback "Izuki (A)"/"Izuki (B)"), or loopMIDI if
//! FL can't see that one. Izuki sends commands as SysEx; the script runs them
//! (only the ones it knows) and answers. Every change starts with an undo
//! point, so Ctrl+Z in FL takes it back.
//!
//! Phase 1 (here): "make afrobeats", "make a trap beat at 140" — a fresh
//! pattern, the drums written step by step so you watch it build, the tempo
//! set, and it plays. Play / stop / tempo by voice too.

use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::mpsc::{channel, Receiver};
use std::time::{Duration, Instant};

use anyhow::{anyhow, bail, Result};
use parking_lot::Mutex;
use serde::Serialize;
use serde_json::{json, Value};

const SCRIPT: &str = include_str!("flstudio/device_Izuki.py");
const HEAD: [u8; 4] = [0xF0, 0x7D, 0x49, 0x5A];
const CHUNK: usize = 800;

struct Link {
    out: midir::MidiOutputConnection,
    rx: Receiver<Vec<u8>>,
    _input: midir::MidiInputConnection<()>,
}

static LINK: Mutex<Option<Link>> = Mutex::new(None);
static NEXT_ID: AtomicU32 = AtomicU32::new(1);

// ------------------------------------------------------------ the cable

/// The port Izuki uses: Windows' loopback "Izuki (A)" (FL takes "(B)"), or a
/// single loopMIDI port named "Izuki" that both share.
fn pick(names: &[String]) -> Option<usize> {
    let lower: Vec<String> = names.iter().map(|n| n.to_lowercase()).collect();
    lower
        .iter()
        .position(|n| n.contains("izuki") && n.contains("(a)"))
        .or_else(|| lower.iter().position(|n| n.contains("izuki") && !n.contains("(b)")))
}

/// Every MIDI port name Windows lists, (outputs, inputs).
pub fn port_names() -> (Vec<String>, Vec<String>) {
    let outs = midir::MidiOutput::new("Izuki")
        .map(|o| o.ports().iter().filter_map(|p| o.port_name(p).ok()).collect())
        .unwrap_or_default();
    let ins = midir::MidiInput::new("Izuki")
        .map(|i| i.ports().iter().filter_map(|p| i.port_name(p).ok()).collect())
        .unwrap_or_default();
    (outs, ins)
}

/// The name FL Studio should pick (the other side of the cable).
fn fl_side(names: &[String]) -> Option<String> {
    names
        .iter()
        .find(|n| n.to_lowercase().contains("izuki") && n.to_lowercase().contains("(b)"))
        .or_else(|| names.iter().find(|n| n.to_lowercase().contains("izuki")))
        .cloned()
}

fn connect() -> Result<Link> {
    let mut input = midir::MidiInput::new("Izuki").map_err(|e| anyhow!("{e}"))?;
    input.ignore(midir::Ignore::None);
    let in_ports = input.ports();
    let in_names: Vec<String> = in_ports.iter().filter_map(|p| input.port_name(p).ok()).collect();
    let i = pick(&in_names).ok_or_else(|| anyhow!("no Izuki MIDI cable — set it up in Settings → FL Studio"))?;
    let (tx, rx) = channel::<Vec<u8>>();
    let conn_in = input
        .connect(&in_ports[i], "izuki-fl-in", move |_, msg, _| {
            // Only this script's answers (a shared loopMIDI port also echoes our own requests).
            if msg.len() > 5 && msg[..4] == HEAD && msg[4] == b'R' {
                let _ = tx.send(msg.to_vec());
            }
        }, ())
        .map_err(|e| anyhow!("{e}"))?;
    let output = midir::MidiOutput::new("Izuki").map_err(|e| anyhow!("{e}"))?;
    let out_ports = output.ports();
    let out_names: Vec<String> = out_ports.iter().filter_map(|p| output.port_name(p).ok()).collect();
    let o = pick(&out_names).ok_or_else(|| anyhow!("no Izuki MIDI cable — set it up in Settings → FL Studio"))?;
    let out = output.connect(&out_ports[o], "izuki-fl-out").map_err(|e| anyhow!("{e}"))?;
    Ok(Link { out, rx, _input: conn_in })
}

// ------------------------------------------------------------ the protocol

/// A Python literal for a JSON value (what the script reads).
fn py(v: &Value) -> String {
    match v {
        Value::Null => "None".into(),
        Value::Bool(b) => if *b { "True".into() } else { "False".into() },
        Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                i.to_string()
            } else {
                // Never scientific notation (the script reads plain digits only).
                let f = n.as_f64().unwrap_or(0.0);
                let s = format!("{f:.6}");
                let s = s.trim_end_matches('0').trim_end_matches('.');
                if s.is_empty() || s == "-" { "0".into() } else { s.to_string() }
            }
        }
        Value::String(s) => {
            let mut out = String::from("'");
            for c in s.chars() {
                match c {
                    '\\' => out.push_str("\\\\"),
                    '\'' => out.push_str("\\'"),
                    '\n' => out.push_str("\\n"),
                    c if (c as u32) < 0x20 => {}
                    c if c.is_ascii() => out.push(c),
                    c => out.push_str(&format!("\\u{:04x}", c as u32 & 0xffff)),
                }
            }
            out.push('\'');
            out
        }
        Value::Array(a) => format!("[{}]", a.iter().map(py).collect::<Vec<_>>().join(", ")),
        Value::Object(o) => format!("{{{}}}", o.iter().map(|(k, v)| format!("{}: {}", py(&Value::String(k.clone())), py(v))).collect::<Vec<_>>().join(", ")),
    }
}

/// The script's answer (Python's repr of a dict) as JSON.
fn from_py(s: &str) -> Option<Value> {
    let mut out = String::with_capacity(s.len());
    let mut chars = s.chars().peekable();
    while let Some(c) = chars.next() {
        match c {
            '\'' | '"' => {
                let quote = c;
                let mut text = String::new();
                while let Some(c) = chars.next() {
                    if c == quote {
                        break;
                    }
                    if c == '\\' {
                        match chars.next()? {
                            'n' => text.push('\n'),
                            't' => text.push('\t'),
                            'r' => text.push('\r'),
                            'x' => {
                                let h: String = [chars.next()?, chars.next()?].iter().collect();
                                text.push(char::from_u32(u32::from_str_radix(&h, 16).ok()?)?);
                            }
                            'u' => {
                                let h: String = (0..4).filter_map(|_| chars.next()).collect();
                                text.push(char::from_u32(u32::from_str_radix(&h, 16).ok()?).unwrap_or('?'));
                            }
                            other => text.push(other),
                        }
                    } else {
                        text.push(c);
                    }
                }
                out.push_str(&serde_json::to_string(&text).ok()?);
            }
            '(' => out.push('['),
            ')' => out.push(']'),
            c if c.is_ascii_alphabetic() => {
                let mut word = String::from(c);
                while let Some(&n) = chars.peek() {
                    if n.is_ascii_alphanumeric() {
                        word.push(n);
                        chars.next();
                    } else {
                        break;
                    }
                }
                out.push_str(match word.as_str() {
                    "True" => "true",
                    "False" => "false",
                    "None" => "null",
                    "inf" | "nan" => "null",
                    _ => return None,
                });
            }
            c => out.push(c),
        }
    }
    serde_json::from_str(&out).ok()
}

fn frame(id: u32, payload: &[u8]) -> Vec<Vec<u8>> {
    let total = payload.len().div_ceil(CHUNK).max(1);
    (0..total)
        .map(|part| {
            let piece = &payload[(part * CHUNK).min(payload.len())..((part + 1) * CHUNK).min(payload.len())];
            let mut m = HEAD.to_vec();
            m.extend_from_slice(format!("Q{:04}{:02}{:02}", id % 10000, part, total).as_bytes());
            m.extend_from_slice(piece);
            m.push(0xF7);
            m
        })
        .collect()
}

fn key() -> String {
    crate::state::try_store().map(|s| s.settings().fl_key).unwrap_or_default()
}

/// Run `ops` in FL Studio: their results, in order (each `{ok, value|error}`).
/// `quiet` sends and moves on without waiting (for the step-by-step writing).
pub fn call(ops: Vec<Value>, quiet: bool) -> Result<Vec<Value>> {
    let mut guard = LINK.lock();
    if guard.is_none() {
        *guard = Some(connect()?);
    }
    let link = guard.as_mut().expect("just connected");
    let id = NEXT_ID.fetch_add(1, Ordering::Relaxed) % 10000;
    let req = json!({ "key": key(), "quiet": quiet, "ops": ops });
    for msg in frame(id, py(&req).as_bytes()) {
        if link.out.send(&msg).is_err() {
            *guard = None;
            bail!("the MIDI cable to FL Studio dropped — try again");
        }
    }
    if quiet {
        return Ok(Vec::new());
    }
    // Gather the answer's parts (anything older is a reply nobody waited for).
    let until = Instant::now() + Duration::from_millis(2500);
    let mut parts: Vec<Option<String>> = Vec::new();
    let mut dropped = false;
    loop {
        let left = until.saturating_duration_since(Instant::now());
        if left.is_zero() {
            bail!("FL Studio didn't answer — is it open, with Izuki picked in Options → MIDI settings?");
        }
        let msg = match link.rx.recv_timeout(left) {
            Ok(m) => m,
            Err(std::sync::mpsc::RecvTimeoutError::Timeout) => continue,
            Err(std::sync::mpsc::RecvTimeoutError::Disconnected) => {
                dropped = true;
                break;
            }
        };
        // Header (4) + direction + id/part/total (8) + the end byte.
        if msg.len() < 14 {
            continue;
        }
        let head = String::from_utf8_lossy(&msg[5..13]).to_string();
        let (Ok(mid), Ok(part), Ok(total)) = (head.get(0..4).unwrap_or("").parse::<u32>(), head.get(4..6).unwrap_or("").parse::<usize>(), head.get(6..8).unwrap_or("").parse::<usize>()) else { continue };
        if mid != id || total == 0 || part >= total {
            continue;
        }
        if parts.len() != total {
            parts = vec![None; total];
        }
        parts[part] = Some(String::from_utf8_lossy(&msg[13..msg.len().saturating_sub(1)]).to_string());
        if parts.iter().all(Option::is_some) {
            break;
        }
    }
    if dropped {
        *guard = None;
        bail!("the MIDI cable to FL Studio closed — try again");
    }
    let text: String = parts.into_iter().flatten().collect();
    let v = from_py(&text).ok_or_else(|| anyhow!("FL Studio's answer couldn't be read"))?;
    Ok(v["results"].as_array().cloned().unwrap_or_default())
}

/// One op's value, or its error.
fn one(op: Value) -> Result<Value> {
    let r = call(vec![op], false)?;
    let first = r.into_iter().next().ok_or_else(|| anyhow!("no answer"))?;
    if first["ok"].as_bool() == Some(true) {
        Ok(first["value"].clone())
    } else {
        bail!("{}", first["error"].as_str().unwrap_or("FL Studio couldn't do that"))
    }
}

// ------------------------------------------------------------ setup

/// Where FL Studio looks for controller scripts (Documents may live in OneDrive).
fn hardware_dir() -> Option<std::path::PathBuf> {
    Some(dirs::document_dir()?.join("Image-Line").join("FL Studio").join("Settings").join("Hardware"))
}

pub fn fl_running() -> bool {
    crate::boost::running_names().iter().any(|n| n.eq_ignore_ascii_case("fl64.exe") || n.eq_ignore_ascii_case("fl.exe") || n.eq_ignore_ascii_case("fl64") || n.eq_ignore_ascii_case("fl"))
}

fn fl_exe() -> Option<std::path::PathBuf> {
    let base = std::path::PathBuf::from(std::env::var("ProgramFiles").unwrap_or_else(|_| "C:\\Program Files".into())).join("Image-Line");
    let mut found: Vec<std::path::PathBuf> = std::fs::read_dir(&base)
        .ok()?
        .flatten()
        .map(|e| e.path().join("FL64.exe"))
        .filter(|p| p.exists())
        .collect();
    found.sort();
    found.pop()
}

#[derive(Debug, Clone, Serialize)]
pub struct Status {
    /// The cable's name for FL to pick, if there is one.
    pub cable: Option<String>,
    pub script: bool,
    pub fl_installed: bool,
    pub fl_running: bool,
    /// FL answered just now.
    pub connected: bool,
    pub problem: Option<String>,
}

pub fn status() -> Status {
    let (outs, ins) = port_names();
    let cable = fl_side(&ins).or_else(|| fl_side(&outs));
    let script = hardware_dir().is_some_and(|d| d.join("Izuki").join("device_Izuki.py").exists());
    let running = fl_running();
    let (connected, problem) = if cable.is_some() && running {
        match one(json!(["selftest"])) {
            Ok(v) => {
                let missing: Vec<String> = v["missing"].as_array().map(|a| a.iter().filter_map(|m| m.as_str().map(str::to_string)).collect()).unwrap_or_default();
                (true, (!missing.is_empty()).then(|| format!("This FL Studio is missing: {}", missing.join(", "))))
            }
            Err(e) => (false, Some(e.to_string())),
        }
    } else {
        (false, None)
    };
    Status { cable, script, fl_installed: fl_exe().is_some(), fl_running: running, connected, problem }
}

fn run(cmd: &str, args: &[&str], timeout: Duration) -> Option<String> {
    let mut c = std::process::Command::new(cmd);
    // Nothing is read back: discarding the output means a chatty installer
    // can never fill a pipe and stall.
    c.args(args).stdout(std::process::Stdio::null()).stderr(std::process::Stdio::null());
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        c.creation_flags(0x0800_0000);
    }
    let mut child = c.spawn().ok()?;
    let began = Instant::now();
    loop {
        if let Ok(Some(_)) = child.try_wait() {
            return Some(String::new());
        }
        if began.elapsed() > timeout {
            let _ = child.kill();
            return None;
        }
        std::thread::sleep(Duration::from_millis(200));
    }
}

/// Windows MIDI Services' console, if its tools are installed.
fn midi_console() -> Option<std::path::PathBuf> {
    let pf = std::path::PathBuf::from(std::env::var("ProgramFiles").unwrap_or_else(|_| "C:\\Program Files".into()));
    for p in [pf.join("Windows MIDI Services").join("Tools").join("midi.exe"), pf.join("Windows MIDI Services").join("midi.exe")] {
        if p.exists() {
            return Some(p);
        }
    }
    // Wherever the installer put it.
    walk(&pf.join("Windows MIDI Services"), 3)
}

fn walk(dir: &std::path::Path, depth: u8) -> Option<std::path::PathBuf> {
    if depth == 0 {
        return None;
    }
    for e in std::fs::read_dir(dir).ok()?.flatten() {
        let p = e.path();
        if p.file_name().is_some_and(|n| n.eq_ignore_ascii_case("midi.exe")) {
            return Some(p);
        }
        if p.is_dir() {
            if let Some(f) = walk(&p, depth - 1) {
                return Some(f);
            }
        }
    }
    None
}

fn has_cable() -> bool {
    let (outs, ins) = port_names();
    pick(&outs).is_some() && pick(&ins).is_some()
}

/// Put the script in FL Studio's Hardware folder, with this PC's key.
fn install_script() -> Result<std::path::PathBuf> {
    let store = crate::state::store();
    let mut key = store.settings().fl_key;
    if key.len() < 16 {
        key = uuid::Uuid::new_v4().simple().to_string();
        let mut s = store.settings();
        s.fl_key = key.clone();
        store.set_settings(s);
    }
    let dir = hardware_dir().ok_or_else(|| anyhow!("couldn't find your Documents folder"))?.join("Izuki");
    std::fs::create_dir_all(&dir)?;
    let path = dir.join("device_Izuki.py");
    std::fs::write(&path, SCRIPT.replace("__IZUKI_KEY__", &key))?;
    Ok(path)
}

/// Set everything up: the script, then the cable (Windows' own; loopMIDI if
/// FL can't see that). What happened, and what's left to do in FL Studio.
pub fn setup(progress: &dyn Fn(&str)) -> Result<String> {
    progress("Putting Izuki's script into FL Studio…");
    install_script()?;
    *LINK.lock() = None;
    if !has_cable() {
        progress("Making a virtual MIDI cable with Windows' own MIDI system…");
        let mut console = midi_console();
        if console.is_none() {
            progress("Installing Microsoft's MIDI tools (Windows may ask permission)…");
            let _ = run("winget", &["install", "--id", "Microsoft.MIDI.SDK", "-e", "--silent", "--accept-package-agreements", "--accept-source-agreements"], Duration::from_secs(600));
            console = midi_console();
        }
        if let Some(console) = console {
            let exe = console.to_string_lossy().to_string();
            let _ = run(&exe, &["loopback", "create", "--root-name", "Izuki", "--unique-identifier", "izuki", "--save-to-config"], Duration::from_secs(60));
            // Windows lists a new port after a moment.
            for _ in 0..10 {
                if has_cable() {
                    break;
                }
                std::thread::sleep(Duration::from_millis(500));
            }
        }
    }
    if !has_cable() {
        progress("Windows' cable isn't visible to FL — setting up loopMIDI instead…");
        let _ = run("winget", &["install", "--id", "TobiasErichsen.loopMIDI", "-e", "--silent", "--accept-package-agreements", "--accept-source-agreements"], Duration::from_secs(600));
        let pf86 = std::env::var("ProgramFiles(x86)").unwrap_or_else(|_| "C:\\Program Files (x86)".into());
        let exe = std::path::Path::new(&pf86).join("Tobias Erichsen").join("loopMIDI").join("loopMIDI.exe");
        if exe.exists() {
            let _ = std::process::Command::new(&exe).spawn();
        }
        return Ok("Almost there. loopMIDI is open: type Izuki as the new port's name and press +. Then in FL Studio, Options → MIDI settings: pick Izuki under Input, switch Enable on, choose Izuki as the Controller type, and set Port to 236; pick Izuki under Output and set its Port to 236 too. Restart FL Studio if Izuki isn't in the Controller list yet.".into());
    }
    let (outs, ins) = port_names();
    let side = fl_side(&ins).or_else(|| fl_side(&outs)).unwrap_or_else(|| "Izuki (B)".into());
    Ok(format!(
        "Set up. Now in FL Studio (restart it first if it's open): Options → MIDI settings. Under Input, click “{side}”, switch Enable on, choose “Izuki” as the Controller type and set Port to 236. Under Output, click “{side}” and set its Port to 236 too. Then say “make afrobeats”."
    ))
}

// ------------------------------------------------------------ the beats

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Role {
    Kick,
    Clap,
    Snare,
    Hat,
    OpenHat,
    Perc,
}

fn role_of(name: &str) -> Option<Role> {
    let n = name.to_lowercase();
    let has = |ws: &[&str]| ws.iter().any(|w| n.contains(w));
    if has(&["kick", "kik", "bd ", "bassdrum", "bass drum"]) || n == "bd" {
        Some(Role::Kick)
    } else if has(&["open"]) && has(&["hat", "hh", "oh"]) {
        Some(Role::OpenHat)
    } else if has(&["hat", "hh", "hihat"]) {
        Some(Role::Hat)
    } else if has(&["clap", "clp"]) {
        Some(Role::Clap)
    } else if has(&["snare", "snr", "rim"]) {
        Some(Role::Snare)
    } else if has(&["perc", "shaker", "shk", "conga", "bongo", "tom", "tamb", "cowbell", "log"]) {
        Some(Role::Perc)
    } else {
        None
    }
}

/// A beat: tempo, and for each role, its steps (of 16) with velocities.
struct Beat {
    name: &'static str,
    bpm: f64,
    rows: Vec<(Role, Vec<(u8, u8)>)>,
}

/// Steps with one velocity.
fn at(steps: &[u8], vel: u8) -> Vec<(u8, u8)> {
    steps.iter().map(|s| (*s, vel)).collect()
}

/// Sixteenth hats, accented on the beat, softer on the "e" and "a".
fn hats16() -> Vec<(u8, u8)> {
    (0..16).map(|s| (s, if s % 4 == 0 { 108 } else if s % 2 == 0 { 84 } else { 62 })).collect()
}

fn hats8() -> Vec<(u8, u8)> {
    (0..16).step_by(2).map(|s| (s, if s % 4 == 0 { 104 } else { 76 })).collect()
}

fn beat_for(genre: &str) -> Beat {
    use Role::*;
    match genre {
        "afrobeats" => Beat { name: "Afrobeats", bpm: 104.0, rows: vec![
            (Kick, at(&[0, 6, 8, 14], 118)),
            (Clap, at(&[4, 12], 104)),
            (Snare, vec![(3, 70), (7, 82), (10, 70), (13, 86)]),
            (Hat, hats16()),
            (Perc, vec![(0, 90), (3, 70), (6, 90), (8, 74), (11, 70), (14, 90)]),
        ]},
        "amapiano" => Beat { name: "Amapiano", bpm: 113.0, rows: vec![
            (Kick, at(&[0, 4, 8, 12], 112)),
            (Clap, at(&[8], 96)),
            (Snare, vec![(3, 66), (7, 72), (11, 66), (14, 80), (15, 70)]),
            (Hat, at(&[2, 6, 10, 14], 92)),
            (Perc, hats16()),
        ]},
        "trap" => Beat { name: "Trap", bpm: 140.0, rows: vec![
            (Kick, vec![(0, 120), (7, 104), (10, 112)]),
            (Clap, at(&[8], 112)),
            (Snare, at(&[8], 96)),
            (Hat, (0..16).map(|s| (s, if s % 2 == 0 { 100 } else { 70 })).collect()),
            (OpenHat, at(&[14], 84)),
        ]},
        "drill" => Beat { name: "Drill", bpm: 142.0, rows: vec![
            (Kick, vec![(0, 120), (10, 108)]),
            (Clap, at(&[8], 110)),
            (Snare, vec![(13, 96), (15, 70)]),
            (Hat, vec![(0, 100), (3, 76), (6, 92), (8, 100), (11, 76), (14, 92)]),
            (Perc, at(&[5, 12], 70)),
        ]},
        "boombap" => Beat { name: "Boom bap", bpm: 90.0, rows: vec![
            (Kick, vec![(0, 120), (7, 100), (10, 112)]),
            (Snare, at(&[4, 12], 112)),
            (Clap, at(&[12], 80)),
            (Hat, hats8()),
            (OpenHat, at(&[14], 72)),
        ]},
        "house" => Beat { name: "House", bpm: 124.0, rows: vec![
            (Kick, at(&[0, 4, 8, 12], 118)),
            (Clap, at(&[4, 12], 104)),
            (OpenHat, at(&[2, 6, 10, 14], 92)),
            (Hat, hats16()),
            (Perc, vec![(3, 66), (11, 66)]),
        ]},
        "reggaeton" => Beat { name: "Reggaeton", bpm: 95.0, rows: vec![
            (Kick, at(&[0, 4, 8, 12], 118)),
            (Snare, vec![(3, 104), (6, 100), (11, 104), (14, 100)]),
            (Clap, at(&[6, 14], 80)),
            (Hat, hats8()),
        ]},
        "dancehall" => Beat { name: "Dancehall", bpm: 100.0, rows: vec![
            (Kick, vec![(0, 118), (7, 100), (8, 112)]),
            (Snare, vec![(3, 100), (6, 96), (11, 100), (14, 96)]),
            (Clap, at(&[4, 12], 90)),
            (Hat, hats8()),
            (Perc, vec![(2, 70), (10, 70)]),
        ]},
        "rnb" => Beat { name: "R&B", bpm: 82.0, rows: vec![
            (Kick, vec![(0, 116), (9, 96), (10, 108)]),
            (Snare, at(&[4, 12], 104)),
            (Clap, at(&[12], 86)),
            (Hat, hats16()),
        ]},
        "lofi" => Beat { name: "Lo-fi", bpm: 82.0, rows: vec![
            (Kick, vec![(0, 108), (7, 92), (9, 100)]),
            (Snare, at(&[4, 12], 96)),
            (Hat, vec![(0, 84), (2, 60), (4, 80), (6, 58), (8, 84), (10, 60), (12, 80), (14, 58)]),
        ]},
        _ => Beat { name: "Pop", bpm: 120.0, rows: vec![
            (Kick, at(&[0, 8, 10], 116)),
            (Clap, at(&[4, 12], 106)),
            (Hat, hats8()),
            (Snare, at(&[15], 72)),
        ]},
    }
}

/// The genre named in what was said.
fn genre_of(said: &str) -> Option<&'static str> {
    let s = said.to_lowercase();
    let has = |ws: &[&str]| ws.iter().any(|w| s.contains(w));
    Some(if has(&["amapiano", "log drum"]) {
        "amapiano"
    } else if has(&["afro", "naija beat", "wizkid", "burna"]) {
        "afrobeats"
    } else if has(&["drill"]) {
        "drill"
    } else if has(&["trap"]) {
        "trap"
    } else if has(&["boom bap", "boombap", "boom-bap", "old school hip hop", "90s hip hop"]) {
        "boombap"
    } else if has(&["house", "four on the floor", "edm"]) {
        "house"
    } else if has(&["reggaeton", "dembow", "latin"]) {
        "reggaeton"
    } else if has(&["dancehall"]) {
        "dancehall"
    } else if has(&["r&b", "rnb", "r and b", "slow jam"]) {
        "rnb"
    } else if has(&["lofi", "lo-fi", "lo fi", "chill beat", "study beat"]) {
        "lofi"
    } else if has(&["pop"]) {
        "pop"
    } else {
        return None;
    })
}

/// "at 140", "140 bpm".
fn bpm_of(said: &str) -> Option<f64> {
    let s = said.to_lowercase();
    let words: Vec<&str> = s.split(|c: char| !c.is_ascii_alphanumeric() && c != '.').filter(|w| !w.is_empty()).collect();
    for (i, w) in words.iter().enumerate() {
        let w = w.trim_end_matches("bpm");
        if let Ok(n) = w.parse::<f64>() {
            let next = words.get(i + 1).copied().unwrap_or("");
            let prev = if i > 0 { words[i - 1] } else { "" };
            if (60.0..=200.0).contains(&n) && (next.starts_with("bpm") || prev == "at" || prev == "tempo" || words[i].ends_with("bpm")) {
                return Some(n);
            }
        }
    }
    None
}

/// What was said is for FL Studio (`handle` decides what it does with it).
pub fn is_request(said: &str) -> bool {
    let s = said.to_lowercase();
    let fl = s.contains("fl studio") || s.contains(" in fl") || s.contains("on fl") || s.starts_with("fl ");
    fl || wants_beat(&s)
}

/// Making a beat (not mixing, arranging or anything else in FL).
fn wants_beat(s: &str) -> bool {
    let make = ["make", "cook", "build", "create", "produce", "give me", "do a", "start a", "drop a"].iter().any(|w| s.contains(w));
    make && (["beat", "drums", "drum pattern", "instrumental"].iter().any(|w| s.contains(w)) || genre_of(s).is_some())
}

/// Do it: what to say back — or `None` for anything this doesn't do yet,
/// which goes on to Izuki's screen control (it works FL like a person).
pub fn handle(said: &str) -> Result<Option<String>> {
    let s = said.to_lowercase();
    let words = s.trim().trim_end_matches(['.', '!']);
    let opening = ["open fl", "launch fl", "start fl", "open up fl"].iter().any(|w| words.starts_with(w));
    let transport = ["stop", "pause", "play", "start", "tempo", "bpm", "faster", "slower"].iter().any(|w| words.contains(w));
    if !opening && !wants_beat(&s) && !transport {
        return Ok(None);
    }
    // "Make afrobeats" without naming FL: FL only when it's open and linked —
    // otherwise the beat starter makes a MIDI file (beats.rs), as before.
    let named = s.contains("fl studio") || s.contains(" in fl") || s.contains("on fl") || s.starts_with("fl ");
    if !named && (!fl_running() || !has_cable()) {
        return Ok(None);
    }
    if !fl_running() {
        let Some(exe) = fl_exe() else { bail!("FL Studio isn't installed on this PC.") };
        let _ = std::process::Command::new(exe).spawn();
        return Ok(Some(if opening { "Opening FL Studio.".into() } else { "Opening FL Studio — give it a few seconds, then ask me again.".into() }));
    }
    if opening {
        return Ok(Some("FL Studio's already open.".into()));
    }
    if !has_cable() {
        return Ok(Some("I'm not linked to FL Studio yet — open Settings → FL Studio and press Set up (one time).".into()));
    }
    if wants_beat(&s) {
        return make_beat(said).map(Some);
    }
    // Plain controls first.
    let words = s.trim().trim_end_matches(['.', '!']);
    let fl_words = |w: &str| words.ends_with(w) || words.ends_with(&format!("{w} in fl studio")) || words.ends_with(&format!("{w} in fl"));
    if ["stop", "stop it", "stop the beat", "pause", "pause it", "stop playing"].iter().any(|w| fl_words(w)) {
        one(json!(["stop"]))?;
        return Ok(Some("Stopped.".into()));
    }
    if ["play it", "play the beat", "play", "start it", "start playing", "play it back"].iter().any(|w| fl_words(w)) {
        one(json!(["play"]))?;
        return Ok(Some("Playing.".into()));
    }
    if let Some(bpm) = bpm_of(&s).or_else(|| {
        // "set the tempo to 128"
        s.split_whitespace().filter_map(|w| w.trim_end_matches("bpm").parse::<f64>().ok()).find(|n| (60.0..=200.0).contains(n)).filter(|_| s.contains("tempo"))
    }) {
        let v = one(json!(["tempo", bpm]))?;
        return Ok(Some(format!("Tempo's {} BPM.", v.as_f64().unwrap_or(bpm).round())));
    }
    if s.contains("faster") || s.contains("slower") {
        let st = one(json!(["state"]))?;
        let now = st["tempo"].as_f64().unwrap_or(120.0);
        let to = if s.contains("faster") { now + 6.0 } else { now - 6.0 };
        one(json!(["tempo", to]))?;
        return Ok(Some(format!("Tempo's {} BPM now.", to.round())));
    }
    Ok(None)
}

/// A fresh pattern with the drums written step by step — you watch it build —
/// the tempo set, and it plays.
fn make_beat(said: &str) -> Result<String> {
    let genre = genre_of(said).unwrap_or("trap");
    let mut beat = beat_for(genre);
    if let Some(bpm) = bpm_of(said) {
        beat.bpm = bpm;
    }
    let st = one(json!(["state"]))?;
    let chans: Vec<(usize, String)> = st["channels"]
        .as_array()
        .map(|a| a.iter().filter_map(|c| Some((c["i"].as_u64()? as usize, c["name"].as_str()?.to_string()))).collect())
        .unwrap_or_default();
    // Which channel plays which part; a missing clap borrows the snare, and so on.
    let find = |r: Role| chans.iter().find(|(_, n)| role_of(n) == Some(r)).map(|(i, _)| *i);
    let mut plan: Vec<(usize, Vec<(u8, u8)>)> = Vec::new();
    let mut used = Vec::new();
    for (role, steps) in &beat.rows {
        let ch = find(*role).or_else(|| match role {
            Role::Clap => find(Role::Snare),
            Role::Snare => find(Role::Perc),
            Role::OpenHat => None,
            Role::Perc => None,
            _ => None,
        });
        if let Some(ch) = ch.filter(|c| !used.contains(c)) {
            used.push(ch);
            plan.push((ch, steps.clone()));
        }
    }
    if plan.is_empty() {
        bail!("I can't find any drum sounds in this project — add a Kick, Clap, Hat and Snare to the Channel rack (FL's default template has them), then ask again.");
    }
    one(json!(["undo_point", format!("Izuki: {} beat", beat.name)]))?;
    // A fresh pattern first — never written over one of yours.
    one(json!(["new_pattern", format!("Izuki {}", beat.name)])).map_err(|e| anyhow!("FL Studio couldn't make a new pattern ({e}), so I left your project alone."))?;
    let _ = one(json!(["show", "rack"]));
    one(json!(["tempo", beat.bpm]))?;
    // Row by row, step by step: it builds in front of you.
    for (ch, steps) in &plan {
        for (step, vel) in steps {
            call(vec![json!(["step", ch, step, true]), json!(["vel", ch, step, vel])], true)?;
            std::thread::sleep(Duration::from_millis(28));
        }
        std::thread::sleep(Duration::from_millis(120));
    }
    // Read it back: only say it's done if it's really there.
    let mut wrong = 0;
    for (ch, steps) in &plan {
        if let Ok(Value::Array(row)) = one(json!(["row", ch])) {
            let on: Vec<u8> = row.iter().enumerate().filter(|(_, v)| v.as_i64().unwrap_or(0) != 0).map(|(i, _)| i as u8).collect();
            let want: Vec<u8> = steps.iter().map(|(s, _)| *s).collect();
            if want.iter().any(|s| !on.contains(s)) {
                wrong += 1;
            }
        }
    }
    if wrong > 0 {
        bail!("Some of the drums didn't land in FL Studio ({wrong} row{} came out different) — press Ctrl+Z in FL and ask me again.", if wrong == 1 { "" } else { "s" });
    }
    one(json!(["play"]))?;
    let missing: Vec<&str> = beat
        .rows
        .iter()
        .filter(|(r, _)| !plan.iter().any(|(ch, _)| chans.iter().any(|(i, n)| i == ch && role_of(n) == Some(*r))))
        .map(|(r, _)| match r {
            Role::Kick => "kick",
            Role::Clap => "clap",
            Role::Snare => "snare",
            Role::Hat => "hi-hat",
            Role::OpenHat => "open hat",
            Role::Perc => "percussion",
        })
        .collect();
    let mut said_back = format!("{} drums at {} BPM — playing. Ctrl+Z in FL takes it back.", beat.name, beat.bpm.round());
    if !missing.is_empty() && missing.len() < beat.rows.len() {
        said_back.push_str(&format!(" Add {} to the Channel rack and I'll fill those in too.", missing.join(" and ")));
    }
    Ok(said_back)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn literals_round_trip() {
        let v = json!({ "key": "k'y", "ops": [["step", 0, 4, true], ["tempo", 104.5], ["undo_point", "Izuki: drüms"]], "x": null });
        let p = py(&v);
        assert!(p.contains("True") && p.contains("None") && p.contains("104.5") && p.contains("'key'"));
        assert!(p.contains("\\'") && p.contains("\\u00fc"));
        let back = from_py("{'id': 7, 'results': [{'ok': True, 'value': {'tempo': 104.5, 'name': \"it's\", 'u': '\\xe9'}}, {'ok': False, 'error': 'x: y'}, {'ok': True, 'value': None}]}").unwrap();
        assert_eq!(back["id"], 7);
        assert_eq!(back["results"][0]["value"]["name"], "it's");
        assert_eq!(back["results"][0]["value"]["u"], "é");
        assert_eq!(back["results"][1]["ok"], false);
        assert!(back["results"][2]["value"].is_null());
    }

    #[test]
    fn long_requests_are_split() {
        let big = vec![b'a'; 2000];
        let parts = frame(12, &big);
        assert_eq!(parts.len(), 3);
        assert!(parts.iter().all(|m| m[0] == 0xF0 && *m.last().unwrap() == 0xF7 && m[4] == b'Q'));
        assert_eq!(&parts[1][5..13], b"00120103");
    }

    #[test]
    fn hears_beat_requests() {
        for said in ["make afrobeats", "make me an afrobeat", "cook up a trap beat at 140", "make a drill beat", "make some amapiano", "make a beat in fl studio", "stop the beat in fl"] {
            assert!(is_request(said), "{said}");
        }
        for said in ["what's the beat of this song", "play some music", "open youtube"] {
            assert!(!is_request(said), "{said}");
        }
        assert!(wants_beat("make afrobeats for me") && !wants_beat("mix my vocals in fl studio"));
        assert_eq!(genre_of("make afro beats for me"), Some("afrobeats"));
        assert_eq!(genre_of("amapiano with log drums"), Some("amapiano"));
        assert_eq!(bpm_of("make a trap beat at 140"), Some(140.0));
        assert_eq!(bpm_of("drill 142 bpm"), Some(142.0));
        assert_eq!(bpm_of("make 2 beats"), None);
    }

    #[test]
    fn channels_are_matched_by_name() {
        assert_eq!(role_of("Kick"), Some(Role::Kick));
        assert_eq!(role_of("Open Hat"), Some(Role::OpenHat));
        assert_eq!(role_of("Hat"), Some(Role::Hat));
        assert_eq!(role_of("Clap"), Some(Role::Clap));
        assert_eq!(role_of("Snare"), Some(Role::Snare));
        assert_eq!(role_of("Shaker 2"), Some(Role::Perc));
        assert_eq!(role_of("Sytrus"), None);
        assert_eq!(pick(&["Izuki (B)".into(), "Izuki (A)".into()]), Some(1));
        assert_eq!(pick(&["Microsoft GS".into(), "Izuki".into()]), Some(1));
    }

    #[test]
    fn every_beat_stays_in_one_bar() {
        for g in ["afrobeats", "amapiano", "trap", "drill", "boombap", "house", "reggaeton", "dancehall", "rnb", "lofi", "pop"] {
            let b = beat_for(g);
            assert!(b.rows.iter().all(|(_, s)| s.iter().all(|(st, v)| *st < 16 && *v <= 127)), "{g}");
            assert!((60.0..=200.0).contains(&b.bpm));
        }
    }
}
