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
//! Phase 1: "make afrobeats", "make a trap beat at 140" — a fresh pattern,
//! the drums written step by step so you watch it build, the tempo set, and
//! it plays. Play / stop / tempo by voice too.
//!
//! Phases 2–5 (what FL's scripting really allows — said plainly where it doesn't):
//! - "add an 808" / "add a melody": key-aware lines written into a melodic
//!   channel's steps (one note per step — FL's controller scripts can't
//!   write chords or note lengths into the piano roll).
//! - "fix the timing on the hats": FL's own Quick quantize.
//! - "balance the mix": channel levels and a little panning, by role.
//! - "make an intro" / "make a fill": variation patterns of the current beat,
//!   to drag into the Playlist (scripts can't place patterns there).

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
    // "Add an 808", "fix the timing": FL's when it's open and linked.
    fl || wants_beat(&s) || (job_of(&s).is_some() && fl_running() && has_cable())
}

/// The parts of a beat Izuki can add, fix or vary (phases 2–5).
#[derive(Debug, Clone, Copy, PartialEq)]
enum Job {
    Bass,
    Melody,
    Quantize,
    Balance,
    Intro,
    Fill,
}

fn job_of(s: &str) -> Option<Job> {
    // Whole words only ("lead" isn't in "leader", "add" isn't in "address").
    let words: Vec<&str> = s.split(|c: char| !c.is_alphanumeric() && c != '#').filter(|w| !w.is_empty()).collect();
    let has = |ws: &[&str]| ws.iter().any(|w| words.contains(w));
    let phrase = |ps: &[&str]| ps.iter().any(|p| s.contains(p));
    let add = has(&["add", "make", "put", "give", "write", "lay", "create", "need", "want"]);
    // Unless FL is named, it has to be about music.
    let fl = s.contains("fl studio") || words.contains(&"fl");
    let music = fl || has(&["beat", "beats", "track", "song", "pattern", "808", "melody", "melodies", "drums", "drum", "hats", "hat", "kick", "snare", "clap", "bass", "bassline", "mix", "instrumental", "loop"]);
    if !music {
        return None;
    }
    if (has(&["timing", "quantize", "quantise", "tighten"]) || phrase(&["off beat", "off-beat", "on beat", "on the grid"])) && !has(&["melody"]) {
        Some(Job::Quantize)
    } else if (has(&["balance"]) && has(&["mix", "levels", "beat", "track", "song"])) || phrase(&["mix my beat", "mix the beat", "mixdown", "mix down"]) {
        Some(Job::Balance)
    } else if add && (has(&["808", "bassline", "bass"]) || phrase(&["bass line", "sub bass"])) {
        Some(Job::Bass)
    } else if add && (has(&["melody", "melodies", "lead", "hook", "riff"]) || phrase(&["piano line"])) {
        Some(Job::Melody)
    } else if add && has(&["intro"]) {
        Some(Job::Intro)
    } else if add && (has(&["fill"]) || phrase(&["drum roll", "transition"])) {
        Some(Job::Fill)
    } else {
        None
    }
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
    let job = job_of(&s);
    if !opening && !wants_beat(&s) && !transport && job.is_none() {
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
    if let Some(job) = job {
        return do_job(job, &s).map(Some);
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

// ------------------------------------------------------------ phases 2–5

/// Instruments that play notes (not drums), by the names FL gives them.
fn is_melodic_name(name: &str) -> bool {
    let n = name.to_lowercase();
    ["808", "bass", "sub", "keys", "piano", "lead", "pluck", "synth", "sytrus", "flex", "3x osc", "3xosc", "harmless", "harmor", "bell", "pad", "guitar", "strings", "vital", "serum", "nexus", "omnisphere", "keyscape", "gms", "transistor", "flute", "choir", "organ"]
        .iter()
        .any(|w| n.contains(w))
}

fn is_bass_name(name: &str) -> bool {
    let n = name.to_lowercase();
    ["808", "bass", "sub"].iter().any(|w| n.contains(w))
}

/// The key a genre usually sits in: (root pitch class 0=C, minor).
fn key_for(genre: &str) -> (u8, bool) {
    match genre {
        "trap" | "drill" => (5, true),        // F minor
        "afrobeats" => (9, true),             // A minor
        "amapiano" => (2, true),              // D minor
        "house" | "pop" => (0, false),        // C major
        "rnb" | "lofi" => (4, true),          // E minor
        "reggaeton" | "dancehall" => (7, true), // G minor
        _ => (9, true),
    }
}

const NOTES: [&str; 12] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/// "in C minor", "key of G", "in F#".
fn key_of(s: &str) -> Option<(u8, bool)> {
    let words: Vec<&str> = s.split_whitespace().collect();
    for (i, w) in words.iter().enumerate() {
        if *w == "in" || *w == "of" {
            let Some(n) = words.get(i + 1) else { continue };
            let n = n.trim_matches(|c: char| !c.is_alphanumeric() && c != '#').to_uppercase();
            if let Some(pc) = NOTES.iter().position(|x| x.eq_ignore_ascii_case(&n)) {
                // "in C minor", "key of G", "in F#" — not "in a minute".
                let next = words.get(i + 2).map(|w| w.trim_matches(|c: char| !c.is_alphanumeric()));
                let keyish = n.contains('#') || next.is_none_or(|w| ["major", "minor", "maj", "min", "key", "please", "and"].contains(&w)) || words[i - usize::from(i > 0)] == "key";
                if keyish {
                    let minor = next.is_none_or(|m| !m.starts_with("maj"));
                    return Some((pc as u8, minor));
                }
            }
        }
    }
    None
}

fn key_name(k: (u8, bool)) -> String {
    format!("{} {}", NOTES[k.0 as usize % 12], if k.1 { "minor" } else { "major" })
}

/// Scale degrees as semitones above the root.
fn scale(minor: bool) -> &'static [u8] {
    if minor { &[0, 3, 5, 7, 10] } else { &[0, 2, 4, 7, 9] }
}

/// The 808: on the kick's steps, the root, moving to the 5th or the minor
/// 7th near the end of the bar. FL notes: 60 is C5 (the sample's own pitch).
fn bass_line(genre: &str, key: (u8, bool)) -> Vec<(u8, u8, u8)> {
    let kick: Vec<u8> = beat_for(genre).rows.iter().find(|(r, _)| *r == Role::Kick).map(|(_, s)| s.iter().map(|(st, _)| *st).collect()).unwrap_or_else(|| vec![0, 8]);
    let root = 48 + key.0; // an octave below the sample's own pitch: deep
    let n = kick.len();
    kick.iter()
        .enumerate()
        .map(|(i, st)| {
            let pitch = if i + 1 == n && n > 2 { root + 7 } else if i + 2 == n && n > 3 { root + if key.1 { 10 } else { 9 } - 12 } else { root };
            (*st, pitch, 112)
        })
        .collect()
}

/// A one-bar melody: the genre's rhythm, notes from the scale, starting and
/// ending on the root. `seed` makes each ask a new idea.
fn melody_line(genre: &str, key: (u8, bool), seed: u64) -> Vec<(u8, u8, u8)> {
    let rhythm: &[u8] = match genre {
        "afrobeats" | "amapiano" | "dancehall" | "reggaeton" => &[0, 3, 6, 8, 10, 13],
        "trap" | "drill" => &[0, 3, 6, 10, 12],
        "house" | "pop" => &[0, 2, 4, 6, 8, 10, 12, 14],
        _ => &[0, 4, 7, 10, 12],
    };
    let sc = scale(key.1);
    let root = 72 + key.0; // an octave above middle C: clear over the beat
    let mut x = seed | 1;
    let mut next = || {
        x ^= x << 13;
        x ^= x >> 7;
        x ^= x << 17;
        x
    };
    let mut degree: i32 = 0;
    let last = rhythm.len() - 1;
    rhythm
        .iter()
        .enumerate()
        .map(|(i, st)| {
            if i > 0 && i < last {
                // A small step up or down the scale, now and then a leap.
                let r = next() % 10;
                degree += match r { 0..=3 => 1, 4..=7 => -1, 8 => 2, _ => -2 };
                degree = degree.clamp(-2, 6);
            } else if i == last {
                degree = if next() % 2 == 0 { 0 } else { 2 };
            }
            let octave = degree.div_euclid(sc.len() as i32);
            let step = degree.rem_euclid(sc.len() as i32) as usize;
            let pitch = (root as i32 + octave * 12 + sc[step] as i32).clamp(36, 108) as u8;
            let vel = if st % 4 == 0 { 104 } else { 88 };
            (*st, pitch, vel)
        })
        .collect()
}

/// The genre of the beat in front of you: the pattern's name ("Izuki
/// Afrobeats"), the request, or trap.
fn genre_now(st: &Value, s: &str) -> &'static str {
    let pat = st["pattern_name"].as_str().unwrap_or("").to_lowercase();
    genre_of(s).or_else(|| genre_of(&pat)).unwrap_or("trap")
}

fn channel_list(st: &Value) -> Vec<(usize, String)> {
    st["channels"].as_array().map(|a| a.iter().filter_map(|c| Some((c["i"].as_u64()? as usize, c["name"].as_str()?.to_string()))).collect()).unwrap_or_default()
}

/// How many steps the channel's row has in this pattern (16 when unsure).
fn row_len(ch: usize) -> usize {
    match one(json!(["row", ch])) {
        Ok(Value::Array(row)) if !row.is_empty() => row.len(),
        _ => 16,
    }
}

fn steps_on(ch: usize) -> Vec<u8> {
    match one(json!(["row", ch])) {
        Ok(Value::Array(row)) => row.iter().enumerate().filter(|(_, v)| v.as_i64().unwrap_or(0) != 0).map(|(i, _)| i as u8).collect(),
        _ => Vec::new(),
    }
}

fn do_job(job: Job, s: &str) -> Result<String> {
    match run_job(job, s) {
        // FL is still running the older script (it loads scripts when it
        // starts): put the new one in place and say what to do.
        Err(e) if e.to_string().contains("unknown op") => {
            install_script()?;
            Ok("I've just updated my FL Studio script for this — close FL Studio and open it again once, then ask me again.".into())
        }
        r => r,
    }
}

fn run_job(job: Job, s: &str) -> Result<String> {
    let st = one(json!(["state"]))?;
    let chans = channel_list(&st);
    let genre = genre_now(&st, s);
    match job {
        Job::Bass | Job::Melody => {
            let selected = one(json!(["selected"])).ok().and_then(|v| v.as_i64()).filter(|i| *i >= 0).map(|i| i as usize);
            let wanted = |n: &str| if job == Job::Bass { is_bass_name(n) } else { is_melodic_name(n) && !is_bass_name(n) };
            // Your selected channel if it plays notes, else one named for the job.
            let ch = selected
                .and_then(|i| chans.iter().find(|(c, n)| *c == i && role_of(n).is_none() && is_melodic_name(n)).cloned())
                .or_else(|| chans.iter().find(|(_, n)| wanted(n)).cloned());
            let Some((ch, name)) = ch else {
                bail!(
                    "I need an instrument for that: add {} to the Channel rack (click it so it's selected), then ask again. I won't put notes on a drum sound.",
                    if job == Job::Bass { "an 808 (or any bass)" } else { "a synth or keys — FLEX, FL Keys or Sytrus" }
                );
            };
            let had = steps_on(ch);
            let replace = s.contains("replace") || s.contains("new one") || s.contains("another");
            if !had.is_empty() && !replace {
                bail!("“{name}” already has notes in this pattern — say “replace the {}” to write over them (Ctrl+Z brings them back), or select an empty instrument.", if job == Job::Bass { "808" } else { "melody" });
            }
            let key = key_of(s).unwrap_or_else(|| key_for(genre));
            let seed = (crate::model::now_ms() as u64) ^ (ch as u64 * 7919);
            let line = if job == Job::Bass { bass_line(genre, key) } else { melody_line(genre, key, seed) };
            one(json!(["undo_point", format!("Izuki: {}", if job == Job::Bass { "808" } else { "melody" })]))?;
            let _ = one(json!(["show", "rack"]));
            for s in had {
                call(vec![json!(["step", ch, s, false])], true)?;
            }
            for (step, pitch, vel) in &line {
                call(vec![json!(["step", ch, step, true]), json!(["pitch", ch, step, pitch]), json!(["vel", ch, step, vel])], true)?;
                std::thread::sleep(Duration::from_millis(35));
            }
            // Read it back: only say it's there if it is.
            let on = steps_on(ch);
            if line.iter().any(|(st, _, _)| !on.contains(st)) {
                bail!("Some notes didn't land on “{name}” — press Ctrl+Z in FL and ask me again.");
            }
            one(json!(["play"]))?;
            Ok(format!(
                "{} on “{name}” in {}{} — playing. Ctrl+Z in FL takes it back. (Notes go on the Channel rack steps, one per step; for chords or long notes, open it in the Piano roll.)",
                if job == Job::Bass { "Added an 808" } else { "Wrote a melody" },
                key_name(key),
                if job == Job::Bass { ", following the kick" } else { "" }
            ))
        }
        Job::Quantize => {
            // Which sound: named in the request ("the hats"), else the selected one.
            const FILLER: &[&str] = &["the", "fix", "timing", "quantize", "quantise", "tighten", "my", "beat", "on", "of", "and", "please", "can", "you", "make", "them", "it", "grid", "off", "fl", "studio", "in", "channel"];
            let asked: Vec<String> = s.split(|c: char| !c.is_alphanumeric()).filter(|w| w.len() >= 2 && !FILLER.contains(w)).map(|w| w.trim_end_matches('s').to_string()).collect();
            let named = chans.iter().find(|(_, n)| {
                let n = n.to_lowercase();
                n.split(|c: char| !c.is_alphanumeric()).filter(|w| w.len() >= 2 && !FILLER.contains(w)).any(|w| asked.iter().any(|a| a == w.trim_end_matches('s')))
            });
            let selected = one(json!(["selected"])).ok().and_then(|v| v.as_i64()).filter(|i| *i >= 0).map(|i| i as usize);
            let target = named.cloned().or_else(|| selected.and_then(|i| chans.iter().find(|(c, _)| *c == i).cloned()));
            let Some((ch, name)) = target else { bail!("Which sound should I tighten? Say “fix the timing on the hats”, or click the channel in the Channel rack and ask again.") };
            one(json!(["undo_point", format!("Izuki: quantize {name}")]))?;
            one(json!(["quantize", ch, false]))?;
            Ok(format!("Quick-quantized “{name}” with FL's own Quick quantize — its notes snap to the grid. Ctrl+Z in FL takes it back."))
        }
        Job::Balance => {
            // Levels by role (FL's default channel level is 0.78).
            let mut changed = Vec::new();
            one(json!(["undo_point", "Izuki: balance"]))?;
            for (ch, name) in &chans {
                let (vol, pan) = match role_of(name) {
                    Some(Role::Kick) => (0.80, 0.0),
                    Some(Role::Clap) | Some(Role::Snare) => (0.70, 0.0),
                    Some(Role::Hat) => (0.52, 0.12),
                    Some(Role::OpenHat) => (0.48, 0.18),
                    Some(Role::Perc) => (0.50, -0.2),
                    None if is_bass_name(name) => (0.74, 0.0),
                    None if is_melodic_name(name) => (0.62, 0.0),
                    None => continue,
                };
                call(vec![json!(["chan_vol", ch, vol]), json!(["chan_pan", ch, pan])], true)?;
                changed.push(name.clone());
            }
            if changed.is_empty() {
                bail!("I couldn't tell which channel is which from their names, so I left the levels alone. Name them (Kick, 808, Hat…) and ask again.");
            }
            Ok(format!(
                "Balanced {} channel{}: kick and 808 up front, claps and snares just under, hats and percussion softer and a little to the sides, melodies in the middle. Ctrl+Z in FL undoes it. (Izuki can't add effects; EQ and compression are still yours.)",
                changed.len(),
                if changed.len() == 1 { "" } else { "s" }
            ))
        }
        Job::Intro | Job::Fill => {
            // The drums now, read from FL, varied into a new pattern.
            let drums: Vec<(usize, Option<Role>, Vec<u8>)> = chans.iter().filter_map(|(c, n)| role_of(n).map(|r| (*c, Some(r), steps_on(*c)))).filter(|(_, _, s)| !s.is_empty()).collect();
            if drums.is_empty() {
                bail!("There are no drums in this pattern to vary — make a beat first.");
            }
            let name = if job == Job::Intro { "Intro" } else { "Fill" };
            one(json!(["undo_point", format!("Izuki: {name}")]))?;
            one(json!(["new_pattern", format!("Izuki {name}")])).map_err(|e| anyhow!("FL Studio couldn't make a new pattern ({e})"))?;
            let mut written: Vec<(usize, Vec<u8>)> = Vec::new();
            for (ch, role, steps) in &drums {
                let len = row_len(*ch).max(16) as u8;
                let roll = len - 4;
                let keep: Vec<u8> = match (job, role) {
                    // Intro: no kick, half the hats.
                    (Job::Intro, Some(Role::Kick)) => Vec::new(),
                    (Job::Intro, Some(Role::Hat)) => steps.iter().copied().filter(|s| s % 4 == 0).collect(),
                    (Job::Intro, _) => steps.clone(),
                    // Fill: the bar as it is, then a snare/clap roll on the last four steps.
                    (_, Some(Role::Snare)) | (_, Some(Role::Clap)) => steps.iter().copied().filter(|s| *s < roll).chain(roll..len).collect(),
                    (_, Some(Role::Kick)) => steps.iter().copied().filter(|s| *s < roll).collect(),
                    _ => steps.clone(),
                };
                for s in &keep {
                    call(vec![json!(["step", ch, s, true])], true)?;
                }
                written.push((*ch, keep));
            }
            // Read it back: only say it's there if it is.
            if written.iter().any(|(ch, keep)| {
                let on = steps_on(*ch);
                keep.iter().any(|s| !on.contains(s))
            }) {
                bail!("The {} didn't come out right in FL Studio — press Ctrl+Z in FL and ask me again.", name.to_lowercase());
            }
            Ok(format!(
                "Made a new pattern, “Izuki {name}”, from your beat{}. Drag it into the Playlist where you want it — FL's scripts can't place patterns there for me. Ctrl+Z in FL takes it back.",
                if job == Job::Intro { " — no kick and lighter hats, to build up" } else { ", with a snare roll on the last beat" }
            ))
        }
    }
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
    fn hears_the_new_jobs() {
        assert_eq!(job_of("add an 808"), Some(Job::Bass));
        assert_eq!(job_of("put a bassline on this"), Some(Job::Bass));
        assert_eq!(job_of("add a melody in c minor"), Some(Job::Melody));
        assert_eq!(job_of("fix the timing on the hats"), Some(Job::Quantize));
        assert_eq!(job_of("balance the mix"), Some(Job::Balance));
        assert_eq!(job_of("make an intro for this beat"), Some(Job::Intro));
        assert_eq!(job_of("add a drum fill"), Some(Job::Fill));
        assert_eq!(job_of("play the beat"), None);
        assert_eq!(job_of("add a lead to my email list"), None, "not about music");
        assert_eq!(job_of("fix the timing of my meeting"), None);
        assert_eq!(job_of("balance my budget"), None);
        assert_eq!(job_of("add a lead synth to the beat"), Some(Job::Melody));
        assert_eq!(key_of("add a melody in a minute"), None, "not the key of A");
        assert_eq!(key_of("make it in the key of d"), Some((2, true)));
        assert_eq!(key_of("key of d minor"), Some((2, true)));
        assert_eq!(key_of("add a melody in c minor"), Some((0, true)));
        assert_eq!(key_of("808 in f# please"), Some((6, true)));
        assert_eq!(key_of("in g major"), Some((7, false)));
        assert!(is_bass_name("Sub 808") && !is_bass_name("FL Keys") && is_melodic_name("FL Keys"));
    }

    #[test]
    fn lines_stay_in_key_and_in_the_bar() {
        for g in ["afrobeats", "trap", "drill", "house", "rnb", "amapiano", "lofi"] {
            for key in [(0u8, true), (9, true), (7, false)] {
                let allowed: Vec<u8> = scale(key.1).to_vec();
                for seed in [1u64, 42, 99_999] {
                    let m = melody_line(g, key, seed);
                    assert!(!m.is_empty());
                    for (st, p, v) in &m {
                        assert!(*st < 16 && *v <= 127 && (36..=108).contains(p), "{g}");
                        assert!(allowed.contains(&(((*p as i32 - key.0 as i32).rem_euclid(12)) as u8)), "{g} {p} out of key");
                    }
                    assert_eq!((m[0].1 as i32 - key.0 as i32).rem_euclid(12), 0, "starts on the root");
                }
                let b = bass_line(g, key);
                assert!(b.iter().all(|(st, p, _)| *st < 16 && (36..=72).contains(p)));
                assert_eq!((b[0].1 as i32 - key.0 as i32).rem_euclid(12), 0, "808 starts on the root");
            }
        }
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
