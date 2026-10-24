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
/// Play FL and record the speakers for `secs`, then stop it. Checks FL
/// really played and that something was heard — and logs what was — so "I
/// couldn't hear it" says which: FL not playing, or silence at the speakers.
fn play_and_record(secs: f32) -> Result<(Vec<f32>, u32)> {
    // Never turned down while it's being heard (Izuki talking ducks other apps).
    let _up = crate::duck::Held::on();
    let play_failed = std::cell::RefCell::new(None);
    let heard = crate::loopback::record(secs, || {
        if let Err(e) = one(json!(["play"])) {
            *play_failed.borrow_mut() = Some(e);
        }
    });
    // Asked before stopping it.
    let playing = one(json!(["state"])).ok().and_then(|s| s["playing"].as_bool());
    let _ = one(json!(["stop"]));
    if let Some(e) = play_failed.into_inner() {
        bail!("I couldn't start FL playing ({e}). Make sure FL is open with Izuki on in its MIDI settings, then ask again.");
    }
    if playing.is_none() {
        bail!("I couldn't check that FL was playing — its link to Izuki didn't answer. Ask again in a moment.");
    }
    let (samples, rate) = heard?;
    let peak = samples.iter().fold(0f32, |m, s| m.max(s.abs()));
    let rms = (samples.iter().map(|s| s * s).sum::<f32>() / samples.len().max(1) as f32).sqrt();
    eprintln!("[fl] listened {secs:.1}s: FL playing {playing:?}, peak {peak:.3}, rms {rms:.4}");
    if playing == Some(false) {
        bail!("I pressed play, but FL didn't start playing. Click once in FL's Playlist (and close any FL window asking something), then ask again.");
    }
    if peak < 0.003 {
        bail!(
            "FL was playing, but your speakers got silence. FL's sound must be going somewhere else: in FL, Options → Audio settings, set the output to your speakers (with “FL Studio ASIO”, choose “Speakers (Realtek)” in its output list) — or everything that played is muted. Highlight your loop in the Playlist, then ask again."
        );
    }
    Ok((samples, rate))
}

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
    // The offer to set up is answered: a later "set it up" is a new ask.
    *NOT_LINKED_AT.lock() = None;
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
    // "Add an 808", "fix the timing": FL's whenever it's open — linked or
    // not (not linked, it says so instead of the screen helper snapping the
    // notes to the grid with FL's quantize).
    fl || asks_setup(&s) || setup_follow_up(&s) || wants_beat(&s) || ((job_of(&s).is_some() || s.contains("metronome") || asks_project(&s)) && fl_running())
}

/// Your own gear goes in FL's MIDI settings too — that's not Izuki's link.
const GEAR: &[&str] = &[
    "keyboard", "keyboards", "controller", "controllers", "launchpad", "speaker", "speakers", "monitors", "mic", "microphone",
    "interface", "headphones", "vst", "vsts", "plugin", "plugins", "akai", "arturia", "novation", "minilab", "keylab",
];

/// "Set up FL Studio", "connect Izuki to FL", "hook Izuki up in FL",
/// "enable Izuki in FL's MIDI settings" — the link itself, in any words.
/// Not "link my sample to the grid in FL" or "connect my MIDI keyboard to FL"
/// (the verb must be aimed at Izuki or FL itself, and no gear is named).
fn asks_setup(s: &str) -> bool {
    let s = s.to_lowercase();
    let words: Vec<&str> = s.split(|c: char| !c.is_alphanumeric()).filter(|w| !w.is_empty()).collect();
    let has = |w: &str| words.contains(&w);
    // About FL (or Izuki's MIDI link), and not undoing it.
    let about_fl = has("fl") || has("flstudio") || has("fruity") || s.contains("fruityloops") || (has("midi") && (has("izuki") || has("nova")));
    if !about_fl || ["disconnect", "unlink", "uninstall", "remove", "disable", "stop", "dont", "don"].iter().any(|w| has(w)) {
        return false;
    }
    if GEAR.iter().any(|g| has(g)) {
        return false;
    }
    aimed_setup(&words, &["izuki", "nova", "fl", "flstudio", "studio", "script", "link", "connection", "setup"])
}

/// A setup verb aimed (within a few words) at one of `aimed`: "set Izuki
/// up", "connect to FL", "do the setup".
fn aimed_setup(words: &[&str], aimed: &[&str]) -> bool {
    words.iter().enumerate().any(|(i, w)| {
        let next = &words[i + 1..words.len().min(i + 5)];
        let verb = match *w {
            // "set up", "set it up", "set izuki up"
            "set" => next.iter().take(3).any(|n| *n == "up"),
            // "setup" as a thing ("my studio setup in FL") isn't asking for one.
            "setup" => i == 0 || !["my", "your", "our", "his", "her", "their", "studio", "this", "fl", "whole"].contains(&words[i - 1]),
            "connect" | "link" | "hook" | "pair" | "install" | "enable" | "activate" => true,
            _ => false,
        };
        // "Install FL Studio" is the app; "install Izuki's script in FL" is the link.
        let own = ["izuki", "nova", "script"];
        let target = if ["install", "enable", "activate"].contains(w) { next.iter().any(|n| own.contains(n)) } else { next.iter().any(|n| aimed.contains(n)) };
        verb && (target || (*w == "setup" && i > 0 && words[i - 1] == "the"))
    })
}

/// When Izuki last said FL isn't linked yet: "set it up" or "hook it up"
/// right after means the link.
static NOT_LINKED_AT: Mutex<Option<Instant>> = Mutex::new(None);

/// A short "set it up", "hook it up", "do the setup" soon after Izuki said FL
/// isn't linked yet (used up once the setup runs).
fn setup_follow_up(s: &str) -> bool {
    let fresh = NOT_LINKED_AT.lock().is_some_and(|t| t.elapsed() < Duration::from_secs(10 * 60));
    let s = s.to_lowercase();
    let words: Vec<&str> = s.split(|c: char| !c.is_alphanumeric()).filter(|w| !w.is_empty()).collect();
    // Only a bare go-ahead: "set it up for my meeting" is something else.
    const BARE: &[&str] = &[
        "set", "it", "up", "setup", "the", "do", "connect", "link", "hook", "pair", "ok", "okay", "yes", "yeah", "yea", "ya", "please", "pls", "plz", "now",
        "go", "ahead", "and", "then", "izuki", "fl", "studio", "everything", "that", "bro", "just", "can", "you", "run", "start", "sure", "alright", "bet",
        "lets", "let", "s", "me", "for", "finish", "all", "of", "this",
    ];
    fresh && words.len() <= 8 && words.iter().all(|w| BARE.contains(w)) && aimed_setup(&words, &["it", "that", "izuki", "fl", "everything", "setup"])
}

/// What a "yes" to "want me to connect it now?" asks for.
const SETUP_OFFER: &str = "set up FL Studio";

/// FL open but not linked, said honestly — and a "yes" next runs the setup.
fn not_linked() -> String {
    crate::offers::make(SETUP_OFFER);
    *NOT_LINKED_AT.lock() = Some(Instant::now());
    NOT_LINKED.into()
}

/// The screen agent's check before it works FL Studio like a person: linking
/// Izuki to FL is Izuki's own setup (a virtual MIDI cable, then FL's MIDI
/// settings) — clicking through FL's menus only ever reaches an empty MIDI
/// list. And FL's jobs need the link: without it, the truth and the offer.
/// `resumes`: the task a "yes"/"keep going" would carry on. `last_said`:
/// Izuki's last words in this conversation.
pub fn screen_guard(prompt: &str, resumes: Option<&str>, last_said: Option<&str>) -> Option<String> {
    let s = prompt.to_lowercase();
    // A "yes" to Izuki's own offer to connect FL that reached the screen
    // agent anyway (typed in the chat, said mid-conversation) is still that yes.
    let yes_to_setup = crate::offers::pending().as_deref() == Some(SETUP_OFFER) && crate::offers::answer(prompt).is_some();
    // Izuki just talked about connecting FL, and this is a short push to do
    // it ("make it", "do it bro", "enable it", "connect it") — even after a
    // restart, when the offer itself is gone.
    let pushed = last_said.is_some_and(talked_about_link) && pushes_to_do_it(&s) && fl_running() && !has_cable();
    if yes_to_setup || pushed || asks_setup(&s) || setup_follow_up(&s) {
        return Some(setup(&|line| eprintln!("[fl] {line}")).unwrap_or_else(|e| format!("I couldn't finish connecting FL Studio: {e}")));
    }
    // Linked: what the link does (the metronome, play/stop, tempo, the jobs)
    // is done through it — never by clicking around FL's screen. (A question
    // about it is answered, never acted on.)
    if is_request(prompt) && !is_question(&s) && fl_running() && has_cable() {
        match handle(prompt) {
            Ok(Some(said)) => return Some(said),
            Err(e) => return Some(e.to_string()),
            Ok(None) => {}
        }
    }
    let all = format!("{s} {}", resumes.unwrap_or("").to_lowercase());
    let words: Vec<&str> = all.split(|c: char| !c.is_alphanumeric()).filter(|w| !w.is_empty()).collect();
    let about_link = words.contains(&"midi") && (words.contains(&"izuki") || words.contains(&"fl") || all.contains("fl studio"));
    if job_of(&all).is_none() && !about_link {
        return None;
    }
    (fl_running() && !has_cable()).then(not_linked)
}

/// A question ("is the metronome on?", "what tempo is it"), not a request —
/// "can you turn the metronome on?" is a request.
fn is_question(s: &str) -> bool {
    let first = s.split(|c: char| !c.is_alphanumeric() && c != '\'').find(|w| !w.is_empty()).unwrap_or("");
    ["is", "are", "was", "were", "what", "what's", "whats", "why", "how", "does", "do", "did", "which", "where", "when", "who"].contains(&first)
}

/// The project as it is now: FL saves it first (through the link), then
/// Izuki reads the file — exact clips, notes and sample files, muted or not.
/// With FL's older script (no "save"), the last save is read and the new
/// script put in place for FL's next start. (`true`: saved just now.)
fn project_now(save: bool) -> Result<(crate::flp::Project, std::path::PathBuf, bool)> {
    let path = crate::flp::open_project()?;
    let when = |p: &std::path::Path| std::fs::metadata(p).and_then(|m| m.modified()).ok();
    let before = when(&path);
    let saved = !save || match one(json!(["save"])) {
        Ok(_) => {
            // FL writes the file a moment later.
            let mut observed_save = false;
            for _ in 0..30 {
                std::thread::sleep(Duration::from_millis(150));
                if when(&path) != before {
                    std::thread::sleep(Duration::from_millis(300));
                    observed_save = true;
                    break;
                }
            }
            observed_save
        }
        Err(e) if e.to_string().contains("unknown op") => {
            let _ = install_script();
            false
        }
        Err(_) => false,
    };
    Ok((crate::flp::read(&path)?, path, saved))
}

/// "What's in my project?", "read my beat", "go through my FL project".
fn asks_project(s: &str) -> bool {
    // "My beat" is FL's; "my project" only with FL (or the beat) named — not a school project.
    let music = ["fl", "flp", "studio", "beat", "song", "track", "instrumental"].iter().any(|w| s.split(|c: char| !c.is_alphanumeric()).any(|x| x == *w));
    let about = ["my beat", "this beat", "my flp", "the flp", "my fl project"].iter().any(|w| s.contains(w))
        || (music && ["my project", "this project", "the project", "my session", "this session"].iter().any(|w| s.contains(w)));
    let asks = ["what's in", "whats in", "what is in", "read my", "read the", "read this", "look at my", "look through", "what do you see in", "what you see in", "break down", "go through", "what's on", "whats on"]
        .iter()
        .any(|w| s.contains(w));
    about && asks
}

/// What's really in the project, from the file: the sample, the parts with
/// notes, what's unused.
fn describe_project() -> Result<String> {
    let (p, path, saved) = project_now(true)?;
    let title = path.file_stem().map(|f| f.to_string_lossy().into_owned()).unwrap_or_default();
    let when = if saved { "just saved".to_string() } else { "as last saved".to_string() };
    // Audio clips, by the file they play.
    let mut audio: Vec<(String, usize, std::collections::BTreeSet<u16>)> = Vec::new();
    for c in &p.clips {
        let crate::flp::ClipOf::Audio(i) = c.of else { continue };
        let Some(ch) = p.channels.iter().find(|x| x.index == i) else { continue };
        match audio.iter_mut().find(|(n, _, _)| *n == ch.name) {
            Some((_, n, tracks)) => {
                *n += 1;
                tracks.insert(c.track + 1);
            }
            None => audio.push((ch.name.clone(), 1, [c.track + 1].into_iter().collect())),
        }
    }
    // Parts with notes in the song.
    let counts = p.song_note_counts();
    let mut parts: Vec<(String, usize)> = p.channels.iter().map(|c| (c.name.clone(), counts.get(&c.index).copied().unwrap_or(0))).filter(|(_, n)| *n > 0).collect();
    parts.sort_by(|a, b| b.1.cmp(&a.1));
    let used: std::collections::HashSet<&str> = audio.iter().map(|(n, _, _)| n.as_str()).chain(parts.iter().map(|(n, _)| n.as_str())).collect();
    let unused: Vec<&str> = p.channels.iter().map(|c| c.name.as_str()).filter(|n| !used.contains(n)).collect();
    let mut out = format!("“{title}” ({when}): {} channels.", p.channels.len());
    if !audio.is_empty() {
        let list: Vec<String> = audio
            .iter()
            .take(6)
            .map(|(n, k, t)| format!("{n} ({k} clip{} on track{} {})", if *k == 1 { "" } else { "s" }, if t.len() == 1 { "" } else { "s" }, t.iter().map(|x| x.to_string()).collect::<Vec<_>>().join(", ")))
            .collect();
        out.push_str(&format!(" Audio in the Playlist: {}.", list.join("; ")));
    }
    if !parts.is_empty() {
        let list: Vec<String> = parts.iter().take(8).map(|(n, k)| format!("{n} plays {k} note{}", if *k == 1 { "" } else { "s" })).collect();
        out.push_str(&format!(" With notes in the song: {}.", list.join("; ")));
    }
    if !unused.is_empty() {
        out.push_str(&format!(" Not used in the song yet: {}.", unused.iter().take(8).cloned().collect::<Vec<_>>().join(", ")));
    }
    let warnings = p.arrangement_warnings();
    if !warnings.is_empty() {
        out.push_str(&format!(" Project check: {}. This overview may be incomplete.", warnings.join("; ")));
    }
    Ok(out)
}

/// How late a channel's own sample punches after each note starts, in ms,
/// read from its file (`None` when it isn't a WAV this PC has).
fn sample_attack_ms(channel: &str) -> Option<f64> {
    // (Only its sound file is needed: the last save, never a save mid-job.)
    let (p, _, _) = project_now(false).ok()?;
    let path = p.channel(channel)?.sample.clone()?;
    if path.starts_with('%') {
        return None;
    }
    let (samples, rate) = crate::audiofile::read_wav(std::path::Path::new(&path)).ok()?;
    crate::audiofile::attack_s(&samples, rate).map(|s| s * 1000.0)
}

/// When Izuki last wrote the “Izuki align” fix, and for which part: "do it"
/// right after runs it.
static ALIGN_READY: Mutex<Option<(Instant, String)>> = Mutex::new(None);

/// "Do it", "fix it", "yes", "line them up" soon after Izuki wrote the align
/// fix — or "run the Izuki align script" any time: the clicks that run it in
/// the Piano roll (FL draws its own menus; Izuki reads their labels). `None`
/// for anything else.
pub fn apply_follow_up(said: &str) -> Option<String> {
    let s = said.to_lowercase();
    // "Don't run Izuki align", "never mind": not a go-ahead.
    let refused = crate::offers::is_no(&s) || ["don't", "dont", "do not", "never", "stop", "cancel", "never mind", "nevermind"].iter().any(|w| s.contains(w));
    if refused {
        return None;
    }
    let named = s.contains("izuki align") && !is_question(&s);
    let ready = ALIGN_READY.lock().clone().filter(|(t, _)| t.elapsed() < Duration::from_secs(15 * 60));
    let go = named || (ready.is_some() && (crate::offers::is_yes(&s) || pushes_to_do_it(&s) || applies_fix(&s)));
    if !go || !fl_running() {
        return None;
    }
    *ALIGN_READY.lock() = None;
    let part = ready.map(|(_, n)| n).unwrap_or_else(|| "your notes".into());
    Some(format!(
        "In FL Studio, the Piano roll should be open with “{part}”. First check its title shows “{part}” — if it doesn't, stop and say so. Then run its Piano roll script “Izuki align”: open the Piano roll's menu (the small arrow at the top-left corner of the Piano roll), then Tools, then Scripting, then click “Izuki align”; when its window opens, click Accept. Only those clicks — change nothing else in FL."
    ))
}

/// A short "fix it", "apply it", "line them up", "run it" — made only of
/// those words ("fix the hats" is another job).
fn applies_fix(s: &str) -> bool {
    let words: Vec<&str> = s.split(|c: char| !c.is_alphanumeric()).filter(|w| !w.is_empty()).collect();
    const GO: &[&str] = &["fix", "apply", "run", "do", "line", "go"];
    const REST: &[&str] = &[
        "it", "that", "this", "them", "those", "the", "my", "808", "notes", "timing", "now", "please", "pls", "bro", "yes", "yeah", "ok", "okay", "just",
        "for", "me", "up", "ahead", "fix", "then", "already",
    ];
    !words.is_empty()
        && words.len() <= 8
        && !s.contains('?')
        && !crate::offers::is_no(s)
        && words.iter().any(|w| GO.contains(w))
        && words.iter().all(|w| GO.contains(w) || REST.contains(w))
}

/// Izuki's words were about connecting FL ("I'm not connected to it…",
/// "…Options → MIDI settings…", "say “set up FL Studio”").
fn talked_about_link(said: &str) -> bool {
    let t = said.to_lowercase();
    t.contains("fl") && ["not connected", "connect it", "midi settings", "set up fl studio", "connecting fl", "connect fl"].iter().any(|p| t.contains(p))
}

/// A short push to just do it: a yes, or "make it", "do it bro", "enable it",
/// "connect it", "set it up" — made only of those words. Not a question, a
/// no, your own gear, or something else ("turn it up", "make it louder",
/// "open YouTube").
fn pushes_to_do_it(s: &str) -> bool {
    let words: Vec<&str> = s.split(|c: char| !c.is_alphanumeric()).filter(|w| !w.is_empty()).collect();
    if words.is_empty() || words.len() > 8 || s.contains('?') || crate::offers::is_no(s) || GEAR.iter().any(|g| words.contains(g)) {
        return false;
    }
    const DO: &[&str] = &["make", "do", "connect", "enable", "link", "hook", "set", "setup", "pair", "install", "run"];
    const REST: &[&str] = &[
        "it", "that", "this", "izuki", "fl", "studio", "midi", "up", "everything", "work", "happen", "already", "now", "then", "just", "please", "pls",
        "bro", "bruh", "fam", "man", "g", "ok", "okay", "yes", "yeah", "yea", "ya", "so", "can", "you", "go", "ahead", "right", "the", "connection",
    ];
    crate::offers::is_yes(s) || (words.iter().any(|w| DO.contains(w)) && words.iter().all(|w| DO.contains(w) || REST.contains(w)))
}

/// The screen agent has ended up in FL's MIDI settings while FL isn't linked
/// to Izuki: no click there can connect Izuki (its port doesn't exist yet),
/// so it stops and offers the real setup. Your own gear (a keyboard, a
/// controller) is still fine to help with.
pub fn midi_window_guard(task: &str) -> Option<String> {
    // FL's own "Settings - MIDI input / output devices" window.
    if !crate::uia::foreground_title().to_lowercase().contains("midi input") || !crate::uia::foreground_app().to_lowercase().starts_with("fl") {
        return None;
    }
    let t = task.to_lowercase();
    let words: Vec<&str> = t.split(|c: char| !c.is_alphanumeric()).filter(|w| !w.is_empty()).collect();
    if GEAR.iter().any(|g| words.contains(g)) || !fl_running() || has_cable() {
        return None;
    }
    Some(not_linked())
}

/// Where an FL request goes, from what's known: FL named in it, FL
/// running, linked to Izuki, an FL job asked for.
#[derive(Debug, PartialEq)]
enum Route {
    /// Not for FL (the beat starter or others take it).
    Pass,
    /// FL named but not running: open it.
    Open,
    /// FL open but not linked: said honestly (never snapped to the grid).
    NotLinked,
    Go,
}

fn route(named: bool, running: bool, linked: bool, job: bool) -> Route {
    match (named, running, linked) {
        (false, false, _) => Route::Pass,
        (false, true, false) if job => Route::NotLinked,
        (false, true, false) => Route::Pass,
        (true, false, _) => Route::Open,
        (_, true, false) => Route::NotLinked,
        _ => Route::Go,
    }
}

/// What to say when FL is open but not linked to Izuki — honestly, with the way to fix it.
const NOT_LINKED: &str = "I can't do that inside FL Studio yet — I'm not connected to it. Clicking around FL's screen only gives me FL's own quantize, which snaps your notes to the grid (the thing that makes it sound more off), so I won't fake it that way. Want me to connect it now? Say yes — it's a one-time setup of about 2 minutes (Windows may ask permission), then I'll tell you the one switch to flip in FL's MIDI settings. After that I can listen to your beat and line your notes up by ear, tune the 808 and more.";

/// The parts of a beat Izuki can add, fix or vary (phases 2–5).
#[derive(Debug, Clone, Copy, PartialEq)]
enum Job {
    Bass,
    Melody,
    /// Chords / pads, held a bar each (the Piano roll, through a script).
    Chords,
    /// A melody of long, held notes over the chords (the Piano roll too).
    LongMelody,
    /// Vocal tracks: levels, panning, and what their effect chain is missing.
    Vocals,
    Quantize,
    /// The sample (a loop or clip in the Playlist) against FL's metronome:
    /// its own tempo (FL's tempo set to match, then checked) and how late it
    /// starts (said, to trim — FL doesn't let scripts move clips).
    Match,
    /// The 808's own tuning, by ear: retuned (its pitch knob) when every hit
    /// is off its note by the same amount — and checked again after.
    Tune,
    /// The 808 (or bass) lined up with the kick as it really plays — by ear,
    /// off the grid where the kick is — and the notes between with its feel.
    Align,
    Balance,
    Intro,
    Fill,
}

/// "Align" in any spelling: "allign", "alighn", "misaligned", "misaallgiment"…
/// but not the real words that look like it ("assign", "alien", "alike").
fn aligning(words: &[&str]) -> bool {
    const LOOKALIKES: &[&str] = &["alien", "aliens", "alike", "alive", "alight", "allied", "allies", "alliance"];
    words.iter().any(|w| {
        let w = w.strip_prefix("mis").unwrap_or(w);
        w.len() >= 5
            && (w.starts_with("al") || w.starts_with("aal"))
            && !LOOKALIKES.contains(&w)
            && ["align", "aligns", "aligning", "aligned", "alignment"].iter().any(|a| crate::sites::edits(w, a) <= if a.len() >= 8 { 3 } else { 2 })
    })
}

fn job_of(s: &str) -> Option<Job> {
    // Whole words only ("lead" isn't in "leader", "add" isn't in "address").
    let words: Vec<&str> = s.split(|c: char| !c.is_alphanumeric() && c != '#').filter(|w| !w.is_empty()).collect();
    let has = |ws: &[&str]| ws.iter().any(|w| words.contains(w));
    let phrase = |ps: &[&str]| ps.iter().any(|p| s.contains(p));
    let add = has(&["add", "make", "put", "give", "write", "lay", "create", "need", "want"]);
    // A new part, not fixing one: "add …", "make an …", "give me a …".
    let new_part = has(&["add", "write", "create", "lay"]) || phrase(&["make a ", "make an ", "put a ", "put an ", "give me a ", "give me an ", "need a ", "need an ", "want a ", "want an "]);
    // Unless FL is named, it has to be about music.
    let fl = s.contains("fl studio") || words.contains(&"fl");
    let music = fl || has(&["beat", "beats", "track", "song", "pattern", "808", "melody", "melodies", "drums", "drum", "hats", "hat", "kick", "snare", "clap", "bass", "bassline", "mix", "instrumental", "loop", "loops", "sample", "samples", "clip", "chords", "chord", "pads", "vocals", "vocal", "vox"]) || phrase(&["piano roll"]);
    let long = phrase(&["long notes", "held notes", "sustained", "long note", "hold the notes", "slow melody"]);
    if !music {
        return None;
    }
    if has(&["vocals", "vocal", "vox"]) && (has(&["mix", "balance", "levels", "level", "sit", "clean", "better", "eq", "polish", "chain", "louder", "quieter"]) || phrase(&["sound better", "sound good"])) {
        Some(Job::Vocals)
    } else if add && (has(&["chords", "chord", "pads", "pad", "progression"]) || (long && !has(&["melody", "lead", "hook"]))) {
        Some(Job::Chords)
    } else if add && long && has(&["melody", "lead", "hook", "melodies"]) {
        Some(Job::LongMelody)
    } else if has(&["sample", "samples", "loop", "loops", "clip", "audio"])
        && !has(&["808", "808s", "bass", "bassline", "sub", "notes", "note", "melody", "chords"])
        && !new_part
        && (has(&["metronome", "grid", "drift", "drifting", "drifts", "stretch", "warp"])
            || phrase(&["off time", "out of time", "not in time", "off beat", "off-beat", "not on beat", "match the tempo", "match fl"])
            // "Tempo" or the click only with a mismatch ("what tempo is my sample"
            // is a question; "click on the sample" isn't the metronome's click).
            || ((has(&["tempo", "bpm"]) || words.iter().enumerate().any(|(i, w)| *w == "click" && i > 0 && ["the", "a", "fl", "s", "metronome", "its", "fls"].contains(&words[i - 1])))
                && (has(&["match", "matching", "sync", "synced", "fit", "fits", "flow", "flowing", "sit", "sits", "off", "align", "aligned"])
                    || phrase(&["doesn't", "doesnt", "isn't", "isnt", "not on", "not with"]))))
    {
        Some(Job::Match)
    } else if has(&["808", "808s", "bass", "bassline", "sub"])
        && !new_part
        && !has(&["octave", "octaves", "semitone", "semitones", "transpose"])
        // ("The 808 in this tune is late" is timing, not tuning.)
        && !has(&["late", "early", "rushing", "rushes", "dragging", "drags", "sync", "synced", "groove", "pocket", "timing", "align", "aligned"])
        && !phrase(&["off beat", "off-beat", "out of time", "off time", "on time", "in time", "on the beat", "with the beat"])
        && (has(&["tune", "tuned", "tuning", "retune", "detuned", "pitch"])
            || phrase(&["out of tune", "off key", "off-key", "not in key", "wrong key", "in key", "sounds flat", "sounds sharp", "too flat", "too sharp"]))
    {
        Some(Job::Tune)
    } else if (has(&["808", "808s", "bass", "bassline", "sub", "notes", "note"]) || phrase(&["piano roll"]))
        && (aligning(&words)
            || has(&["synced", "syncing", "timing"])
            // Vaguer: not when a new part is asked for ("add an 808 with groove").
            || (!new_part && has(&["sync", "pocket", "groove", "rhythm", "rhyme"]))
            || phrase(&[
                "line up", "lined up", "line it up", "lining up", "sounding off", "sounds off", "sound off", "still off", "feels off", "feel off", "off beat", "off-beat",
                "off time", "not on time", "not in time", "out of time", "not flowing", "isn't flowing", "isnt flowing", "aint flowing", "ain't flowing", "not flowin",
            ])
            // Softer words: unless a new part is being asked for ("add an
            // 808 that flows with the beat" writes one).
            || (!new_part
                && (has(&["late", "early", "rushing", "rushes", "dragging", "drags"])
                    || phrase(&[
                        "with the kick", "to the kick", "on the kick", "with the beat", "to the beat", "with the drums", "follow the kick", "match the kick", "lock to the kick",
                        "flow with", "flowing with", "flows with", "flow wit", "sit with", "sits with", "sitting with", "lock in with", "off with", "with the sample",
                        "with the loop", "with the clip", "to the sample", "to the loop", "with the sound",
                    ]))))
    {
        Some(Job::Align)
    } else if (has(&["timing", "quantize", "quantise", "tighten"]) || phrase(&["off beat", "off-beat", "on beat", "on the grid"])) && !has(&["melody"]) {
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
/// A NEW beat asked for: "make a beat", "cook up an afrobeat", "give me a
/// drill beat", "make afrobeats". Not anything about the beat that's there —
/// "fix the beat", "make the beat louder", "make my beat hit harder", "the
/// beat doesn't make sense" (each of those once wrote fresh trap drums into
/// the person's project).
fn wants_beat(s: &str) -> bool {
    let s = s.to_lowercase();
    let words: Vec<&str> = s.split(|c: char| !c.is_alphanumeric()).filter(|w| !w.is_empty()).collect();
    let has = |ws: &[&str]| ws.iter().any(|w| words.contains(w));
    // Working on what's there.
    if has(&[
        "fix", "louder", "quieter", "better", "harder", "mix", "balance", "flow", "flowing", "align", "tune", "quantize", "clean", "master", "eq", "sync",
        "synced", "match", "off", "volume", "level", "levels", "sounds", "sound", "sense", "add",
    ]) {
        return false;
    }
    // "the beat", "my beat", "this beat": the one that's there.
    let beatish = |w: &str| ["beat", "beats", "drums", "drum", "instrumental"].contains(&w) || genre_of(w).is_some();
    if words.iter().enumerate().any(|(i, w)| beatish(w) && i > 0 && ["the", "my", "this", "that", "our", "your", "his", "her", "their", "its"].contains(&words[i - 1])) {
        return false;
    }
    let make = has(&["make", "cook", "build", "create", "produce", "start", "drop", "give", "whip"]);
    make && (has(&["beat", "beats", "drums", "instrumental"]) || s.contains("drum pattern") || genre_of(&s).is_some())
}

/// Do it: what to say back — or `None` for anything this doesn't do yet,
/// which goes on to Izuki's screen control (it works FL like a person).
pub fn handle(said: &str) -> Result<Option<String>> {
    let s = said.to_lowercase();
    // Running "Izuki align" in the Piano roll: clicks, done by the screen helper.
    if s.contains("izuki align") && s.contains("piano roll") {
        return Ok(None);
    }
    // "What's in my project?": read from the saved file — exact, muted or not.
    if asks_project(&s) && fl_running() {
        return describe_project().map(Some);
    }
    let words = s.trim().trim_end_matches(['.', '!']);
    let opening = ["open fl", "launch fl", "start fl", "open up fl"].iter().any(|w| words.starts_with(w));
    let transport = ["stop", "pause", "play", "start", "tempo", "bpm", "faster", "slower", "metronome"].iter().any(|w| words.contains(w));
    let job = job_of(&s);
    // "Set up FL Studio": the script and the cable, right from the chat.
    if asks_setup(&s) || setup_follow_up(&s) {
        return setup(&|line| eprintln!("[fl] {line}")).map(Some);
    }
    if !opening && !wants_beat(&s) && !transport && job.is_none() {
        return Ok(None);
    }
    // "Make afrobeats" without naming FL: FL only when it's open and linked —
    // otherwise the beat starter makes a MIDI file (beats.rs), as before.
    let named = s.contains("fl studio") || s.contains(" in fl") || s.contains("on fl") || s.starts_with("fl ");
    match route(named, fl_running(), has_cable(), job.is_some()) {
        Route::Pass => return Ok(None),
        Route::Open => {
            let Some(exe) = fl_exe() else { bail!("FL Studio isn't installed on this PC.") };
            let _ = std::process::Command::new(exe).spawn();
            return Ok(Some(if opening { "Opening FL Studio.".into() } else { "Opening FL Studio — give it a few seconds, then ask me again.".into() }));
        }
        // ("Open FL Studio" when it's already open is just that.)
        Route::NotLinked if !opening => return Ok(Some(not_linked())),
        _ => {}
    }
    if opening {
        return Ok(Some("FL Studio's already open.".into()));
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
    // "Turn the metronome on", "metronome off" — through the link, never by
    // hunting for its button (that pressed FL shortcuts and opened dialogs).
    if s.contains("metronome") && ["volume", "louder", "quieter", "softer", "turn it up", "turn it down", "up the metronome"].iter().any(|w| s.contains(w)) {
        return Ok(Some(
            "FL doesn't let other apps change the metronome's volume, so that one's yours to set in FL. I switch the metronome itself on and off whenever I listen, so you never need to."
                .into(),
        ));
    }
    if s.contains("metronome") && !is_question(&s) {
        let off = [
            "metronome off", "off the metronome", "disable the metronome", "mute the metronome", "stop the metronome", "no metronome", "without the metronome",
            "kill the metronome",
        ]
        .iter()
        .any(|w| s.contains(w));
        one(json!(["metronome", !off]))?;
        return Ok(Some(if off {
            "Metronome's off.".into()
        } else {
            "Metronome's on. (When I listen to your beat I switch it on and off myself, so you never need to.)".into()
        }));
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

// ------------------------------------------------------------ chords and long notes

/// A chord: its root above the key's root, and its notes above that.
type Chord = (u8, &'static [u8]);
const MIN: &[u8] = &[0, 3, 7];
const MAJ: &[u8] = &[0, 4, 7];
const MIN7: &[u8] = &[0, 3, 7, 10];
const MAJ7: &[u8] = &[0, 4, 7, 11];
const DOM7: &[u8] = &[0, 4, 7, 10];

/// Four bars of chords that suit the genre and key; `seed` picks one of a few.
pub fn progression(genre: &str, minor: bool, seed: u64) -> Vec<Chord> {
    let sevenths = matches!(genre, "rnb" | "lofi" | "amapiano");
    let options: Vec<Vec<Chord>> = match (minor, sevenths) {
        (true, false) => vec![
            vec![(0, MIN), (8, MAJ), (3, MAJ), (10, MAJ)], // i–VI–III–VII
            vec![(0, MIN), (5, MIN), (8, MAJ), (7, MAJ)],  // i–iv–VI–V
            vec![(0, MIN), (10, MAJ), (8, MAJ), (10, MAJ)], // i–VII–VI–VII
            vec![(0, MIN), (5, MIN), (10, MAJ), (3, MAJ)], // i–iv–VII–III
        ],
        (true, true) => vec![
            vec![(0, MIN7), (5, MIN7), (10, DOM7), (3, MAJ7)], // i7–iv7–VII7–IIImaj7
            vec![(0, MIN7), (8, MAJ7), (5, MIN7), (7, MIN7)],  // i7–VImaj7–iv7–v7
        ],
        (false, false) => vec![
            vec![(0, MAJ), (7, MAJ), (9, MIN), (5, MAJ)], // I–V–vi–IV
            vec![(0, MAJ), (9, MIN), (5, MAJ), (7, MAJ)], // I–vi–IV–V
            vec![(9, MIN), (5, MAJ), (0, MAJ), (7, MAJ)], // vi–IV–I–V
        ],
        (false, true) => vec![
            vec![(2, MIN7), (7, DOM7), (0, MAJ7), (0, MAJ7)], // ii7–V7–Imaj7
            vec![(0, MAJ7), (9, MIN7), (2, MIN7), (7, DOM7)], // Imaj7–vi7–ii7–V7
        ],
    };
    options[(seed as usize) % options.len()].clone()
}

/// The chords as notes: each voiced near the last (smooth, like a player's
/// hands), around middle C, held a whole bar. (pitch, start beat, beats, velocity)
pub fn chord_notes(key_root: u8, chords: &[Chord]) -> Vec<(u8, f32, f32, f32)> {
    let mut out = Vec::new();
    let mut centre = 62.0f32;
    for (bar, (root, shape)) in chords.iter().enumerate() {
        // Every inversion in a comfortable range; the one nearest the last chord wins.
        let base = 48 + ((key_root + root) % 12);
        let mut best: Option<(f32, Vec<u8>)> = None;
        for octave in [0u8, 12] {
            for inv in 0..shape.len() {
                let mut notes: Vec<u8> = shape.iter().enumerate().map(|(i, s)| base + octave + s + if i < inv { 12 } else { 0 }).collect();
                notes.sort_unstable();
                if notes[0] < 52 || *notes.last().unwrap_or(&0) > 79 {
                    continue;
                }
                let avg = notes.iter().map(|n| *n as f32).sum::<f32>() / notes.len() as f32;
                let d = (avg - centre).abs();
                if best.as_ref().is_none_or(|(bd, _)| d < *bd) {
                    best = Some((d, notes));
                }
            }
        }
        let notes = best.map(|(_, n)| n).unwrap_or_else(|| shape.iter().map(|s| base + 12 + s).collect());
        centre = notes.iter().map(|n| *n as f32).sum::<f32>() / notes.len() as f32;
        // The root an octave below, for weight.
        out.push((base.saturating_sub(12).max(36), bar as f32 * 4.0, 4.0, 0.62));
        for n in notes {
            out.push((n, bar as f32 * 4.0, 4.0, 0.72));
        }
    }
    out
}

/// A slow melody over the chords: two held notes a bar, chord tones up high.
pub fn long_melody_notes(key_root: u8, chords: &[Chord], seed: u64) -> Vec<(u8, f32, f32, f32)> {
    let mut out = Vec::new();
    for (bar, (root, shape)) in chords.iter().enumerate() {
        let base = 72 + ((key_root + root) % 12);
        for half in 0..2u64 {
            let pick = ((seed >> (bar * 2 + half as usize)) as usize + bar + half as usize) % shape.len();
            let mut p = base + shape[pick];
            while p > 84 {
                p -= 12;
            }
            out.push((p, bar as f32 * 4.0 + half as f32 * 2.0, if half == 1 && bar == chords.len() - 1 { 2.0 } else { 1.9 }, 0.8));
        }
    }
    out
}

/// A Piano roll script (FL Studio's own scripting) that adds these notes.
pub fn piano_roll_script(what: &str, notes: &[(u8, f32, f32, f32)]) -> String {
    let what = what.replace(['"', '\\', '\n'], " ");
    let list: Vec<String> = notes.iter().map(|(p, s, l, v)| format!("({p}, {s:.3}, {l:.3}, {v:.2})")).collect();
    format!(
        "\"\"\"Izuki: {what}\"\"\"\n\
         # Written by Izuki. Piano roll → Tools → Scripting → Izuki notes, then Accept.\n\
         # Ctrl+Z takes the notes back.\n\
         import flpianoroll as flp\n\n\
         NOTES = [{}]\n\n\
         def createDialog():\n    \
             return flp.ScriptDialog(\"Izuki notes\", \"{what}. Press Accept to add them (Ctrl+Z takes them back).\")\n\n\
         def apply(form):\n    \
             ppq = flp.score.PPQ\n    \
             for pitch, start, length, vel in NOTES:\n        \
                 n = flp.Note()\n        \
                 n.number = pitch\n        \
                 n.time = int(start * ppq)\n        \
                 n.length = int(length * ppq)\n        \
                 n.velocity = vel\n        \
                 flp.score.addNote(n)\n",
        list.join(", ")
    )
}

/// What a person would say listening to the 808 against the kick: each hit
/// heard with both playing that isn't a kick, and isn't where the beat's
/// feel puts it — "beat 2.50 rushes by 35 ms". `both`/`kicks`: beats in the loop.
fn review_hits(hits: &[f64], kicks: &[f64], bpm: f64, loop_beats: f64, lag: f64, skip_kicks: bool) -> Vec<String> {
    let ms = |beats: f64| beats * 60_000.0 / bpm;
    let mut out = Vec::new();
    for &b in hits {
        // Heard together with the kick, a hit on the kick is the kick itself.
        if skip_kicks && kicks.iter().any(|&k| loop_gap(b, k, loop_beats) < 0.06) {
            continue;
        }
        // The delay every hit shares is the sound's own, said once, not per hit.
        let at = b - lag;
        let off = ms(at - where_it_belongs(at, kicks, loop_beats));
        if off.abs() >= 15.0 {
            out.push(format!("beat {:.2} {} by {:.0} ms", b + 1.0, if off < 0.0 { "rushes" } else { "drags" }, off.abs()));
        }
    }
    out
}

/// How far apart two beats are around the loop.
fn loop_gap(a: f64, b: f64, loop_beats: f64) -> f64 {
    let d = (a - b).rem_euclid(loop_beats);
    d.min(loop_beats - d)
}

/// A note closer than this to a kick is meant to be with it. A 32nd is 0.125
/// of a beat, so a note written a 32nd or a 16th away from the kick stays there.
const WITH_KICK: f64 = 0.08;
/// A note closer than this to a 16th is meant to be on it; further off it's
/// swing or a placement that was chosen, and it stays where it was put.
const ON_GRID: f64 = 0.075;

/// On the nearest kick when it's within `reach` beats, else on the nearest
/// 16th, pushed or pulled like that kick (the beat's own feel). (true: the kick.)
fn on_the_feel(b: f64, kicks: &[f64], loop_beats: f64, reach: f64) -> (f64, bool) {
    let near = kicks.iter().copied().fold(None::<f64>, |best, k| match best {
        Some(x) if loop_gap(x, b, loop_beats) <= loop_gap(k, b, loop_beats) => Some(x),
        _ => Some(k),
    });
    match near {
        Some(k) if loop_gap(k, b, loop_beats) < reach => (
            b + {
                let d = (k - b).rem_euclid(loop_beats);
                if d > loop_beats / 2.0 { d - loop_beats } else { d }
            },
            true,
        ),
        Some(k) => ((b * 4.0).round() / 4.0 + (k - (k * 4.0).round() / 4.0), false),
        None => ((b * 4.0).round() / 4.0, false),
    }
}

/// On a triplet or a 32nd (a roll), not a 16th.
fn is_fine(b: f64) -> bool {
    [6.0, 8.0].iter().any(|d| {
        let g = (b * d).round() / d;
        (b - g).abs() < 0.03 && ((g * 4.0) - (g * 4.0).round()).abs() > 1e-6
    })
}

/// Where a note belongs, keeping the rhythm as written: with the kick when
/// it's right by one, else on the beat's feel when it's near a 16th. A
/// triplet, a roll or a note well off the 16ths stays where it was put.
fn where_it_belongs(b: f64, kicks: &[f64], loop_beats: f64) -> f64 {
    let (t, on_kick) = on_the_feel(b, kicks, loop_beats, WITH_KICK);
    let grid = (b * 4.0).round() / 4.0;
    if on_kick || (!is_fine(b) && ((b - t).abs() < ON_GRID || (b - grid).abs() < ON_GRID)) { t } else { b }
}

/// The 808's own delay, in beats: how late (or early) it sounds on nearly
/// every hit against where it belongs — its attack, or a plugin's delay.
/// 0 when the hits don't agree (then it's the notes, not the sound).
fn common_lag(hits: &[f64], kicks: &[f64], loop_beats: f64, bpm: f64) -> f64 {
    if hits.len() < 3 {
        return 0.0;
    }
    let mut d: Vec<f64> = hits.iter().map(|&b| b - on_the_feel(b, kicks, loop_beats, 0.25).0).collect();
    d.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
    let m = d[d.len() / 2];
    let mut spread: Vec<f64> = d.iter().map(|x| (x - m).abs()).collect();
    spread.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
    let ms = |beats: f64| beats * 60_000.0 / bpm;
    if ms(m).abs() >= 8.0 && ms(spread[spread.len() / 2]) <= 12.0 { m } else { 0.0 }
}

/// A Piano roll script that lines the notes up with the kick as it was heard
/// (`kicks`: beats within the loop, off the grid where the kick is), and
/// gives the notes between kicks the kick's own feel. Lengths are kept, so
/// 808 slides (overlapping notes) stay slides.
/// `heard`: where the notes themselves were heard (Song mode — then the
/// script finds where the pattern sits in that loop by matching its notes to
/// them; empty when it plays from its own start).
pub fn align_script(name: &str, kicks: &[f64], loop_beats: f64, lag: f64, heard: &[f64]) -> String {
    let name = name.replace(['"', '\\', '\n'], " ");
    let list: Vec<String> = kicks.iter().map(|k| format!("{k:.4}")).collect();
    let heard_list: Vec<String> = heard.iter().map(|k| format!("{k:.4}")).collect();
    format!(
        "\"\"\"Izuki: line {name} up with the kick, by ear\"\"\"\n\
         # Written by Izuki. Piano roll → Tools → Scripting → Izuki align, then Accept.\n\
         # Ctrl+Z takes it back.\n\
         import flpianoroll as flp\n\n\
         KICKS = [{}]\n\
         # Where the notes themselves were heard (Song mode), in the same loop.\n\
         HEARD = [{}]\n\
         LOOP = {loop_beats:.4}\n\
         # How late the sound itself is (its attack, a plugin): notes start this much earlier.\n\
         LAG = {lag:.4}\n\
         # Nearer a 16th than this: on it. Further: swing or a chosen spot, left alone.\n\
         ON_GRID = {ON_GRID}\n\n\
         def createDialog():\n    \
             form = flp.ScriptDialog(\"Izuki align\", \"Moves notes right by a kick onto it as it really plays (off the grid where the kick is) and gives the 16ths between the same feel. Triplets, rolls and notes you placed a 16th or a 32nd from the kick stay where they are. Slides are kept. Ctrl+Z takes it back.\")\n    \
             form.AddInputKnob(\"Reach (beats)\", {WITH_KICK}, 0.02, 0.24)\n    \
             form.AddInputKnob(\"Strength\", 100, 0, 100)\n    \
             return form\n\n\
         def _shift(beats):\n    \
             # Where the pattern sits in the loop that was heard: its notes\n    \
             # (sounding LAG late) best meet the hits heard from them.\n    \
             if not HEARD or not beats:\n        \
                 return 0.0\n    \
             best, best_score = 0.0, None\n    \
             for k in range(int(LOOP * 4)):\n        \
                 o = k / 4.0\n        \
                 met, gap = 0, 0.0\n        \
                 for b in beats:\n            \
                     p = (b + o + LAG) % LOOP\n            \
                     d = min(min(abs(p - h), LOOP - abs(p - h)) for h in HEARD)\n            \
                     if d < 0.12:\n                \
                         met += 1\n                \
                         gap += d\n        \
                 score = (met, -gap)\n        \
                 if best_score is None or score > best_score:\n            \
                     best, best_score = o, score\n    \
             return best\n\n\
         def _nearest(beat, anchors):\n    \
             base = (beat // LOOP) * LOOP\n    \
             best = None\n    \
             for k in anchors:\n        \
                 for c in (base + k - LOOP, base + k, base + k + LOOP):\n            \
                     if best is None or abs(c - beat) < abs(best - beat):\n                \
                         best = c\n    \
             return best\n\n\
         def _feel(beat, anchors):\n    \
             pos = beat % LOOP\n    \
             near = min(anchors, key=lambda k: min(abs(k - pos), LOOP - abs(k - pos)))\n    \
             return near - round(near * 4) / 4.0\n\n\
         def _fine(beat):\n    \
             # On a triplet or a 32nd (a roll), not a 16th.\n    \
             for div in (6.0, 8.0):\n        \
                 g = round(beat * div) / div\n        \
                 if abs(beat - g) < 0.03 and abs(g * 4 - round(g * 4)) > 1e-6:\n            \
                     return True\n    \
             return False\n\n\
         def apply(form):\n    \
             ppq = flp.score.PPQ\n    \
             reach = form.GetInputValue(\"Reach (beats)\")\n    \
             strength = form.GetInputValue(\"Strength\") / 100.0\n    \
             o = _shift([flp.score.getNote(i).time / float(ppq) for i in range(flp.score.noteCount)])\n    \
             anchors = [(k - o) % LOOP for k in KICKS]\n    \
             for i in range(flp.score.noteCount):\n        \
                 n = flp.score.getNote(i)\n        \
                 beat = n.time / float(ppq)\n        \
                 k = _nearest(beat, anchors)\n        \
                 if k is not None and abs(k - beat) < reach:\n            \
                     target = k\n        \
                 else:\n            \
                     g = round(beat * 4) / 4.0\n            \
                     felt = g + _feel(beat, anchors)\n            \
                     if not _fine(beat) and (abs(beat - felt) < ON_GRID or abs(beat - g) < ON_GRID):\n                \
                         target = felt\n            \
                     else:\n                \
                         target = beat\n        \
                 target = target - LAG\n        \
                 n.time = max(0, int(round((beat + (target - beat) * strength) * ppq)))\n",
        list.join(", "),
        heard_list.join(", ")
    )
}

/// FL Studio's Piano roll scripts folder.
fn piano_roll_dir() -> Option<std::path::PathBuf> {
    Some(dirs::document_dir()?.join("Image-Line").join("FL Studio").join("Settings").join("Piano roll scripts"))
}

// ------------------------------------------------------------ vocals

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum VocalRole {
    Lead,
    Backing,
    Adlib,
}

/// What a mixer track's name says it carries.
pub fn vocal_role(name: &str) -> Option<VocalRole> {
    let n = format!(" {} ", name.to_lowercase().replace(['-', '_', '.'], " "));
    let has = |ws: &[&str]| ws.iter().any(|w| n.contains(w));
    if has(&[" adlib", " ad lib", " adlibs", " ad libs", " fx vox"]) {
        Some(VocalRole::Adlib)
    } else if has(&[" bv ", " bvs ", " backing", " harmony", " harmonies", " dbl", " double", " stack"]) && has(&[" vox", " vocal", " voc ", " bv ", " bvs ", " harmony", " harmonies"]) {
        Some(VocalRole::Backing)
    } else if has(&[" vocal", " vox", " voc ", " lead vox", " lead vocal"]) {
        Some(VocalRole::Lead)
    } else {
        None
    }
}

/// What a vocal chain is missing, from its effect names, as plain advice.
pub fn chain_advice(slots: &[String]) -> Vec<&'static str> {
    let names: Vec<String> = slots.iter().map(|s| s.to_lowercase()).collect();
    let has = |ws: &[&str]| names.iter().any(|n| ws.iter().any(|w| n.contains(w)));
    let mut out = Vec::new();
    if !has(&["eq", "parametric", "pro-q", "equo"]) {
        out.push("an EQ first (Fruity Parametric EQ 2): cut everything below about 100 Hz, and a small dip around 300 Hz if it sounds muddy");
    }
    if !has(&["compressor", "comp", "pro-c", "1176", "la-2a", "cla-", "rcompressor", "fruity limiter"]) {
        out.push("a compressor (Fruity Compressor): ratio about 3:1 to 4:1, so the loudest words come down 3–6 dB");
    }
    if !has(&["de-ess", "deess", "de ess", "pro-ds", "sibil"]) {
        out.push("a de-esser if the S sounds are sharp (Maximus or a free de-esser)");
    }
    if !has(&["reverb", "reeverb", "valhalla", "room", "plate", "delay"]) {
        out.push("reverb and a little delay on a send track, not on the vocal itself, kept low so the voice stays up front");
    }
    out
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
        Job::Chords | Job::LongMelody => {
            // The instrument: your selected one if it plays notes, else one that does.
            let selected = one(json!(["selected"])).ok().and_then(|v| v.as_i64()).filter(|i| *i >= 0).map(|i| i as usize);
            let ch = selected
                .and_then(|i| chans.iter().find(|(c, n)| *c == i && role_of(n).is_none() && is_melodic_name(n) && !is_bass_name(n)).cloned())
                .or_else(|| chans.iter().find(|(_, n)| is_melodic_name(n) && !is_bass_name(n)).cloned());
            let Some((ch, name)) = ch else {
                bail!("I need an instrument for that: add keys, a pad or a synth to the Channel rack (FL Keys, FLEX or Sytrus) and click it, then ask again.");
            };
            let key = key_of(s).unwrap_or_else(|| key_for(genre));
            let seed = (crate::model::now_ms() as u64) ^ (ch as u64 * 7919);
            let chords = progression(genre, key.1, seed);
            let (notes, what) = if job == Job::Chords {
                (chord_notes(key.0, &chords), format!("Chords in {} for {name}, a bar each", key_name(key)))
            } else {
                (long_melody_notes(key.0, &chords, seed), format!("A long-note melody in {} for {name}", key_name(key)))
            };
            let dir = piano_roll_dir().ok_or_else(|| anyhow!("couldn't find your Documents folder"))?;
            std::fs::create_dir_all(&dir)?;
            std::fs::write(dir.join("Izuki notes.pyscript"), piano_roll_script(&what, &notes))?;
            // Open that instrument's Piano roll.
            one(json!(["select", ch]))?;
            let _ = one(json!(["show", "pianoroll"]));
            let names: Vec<String> = chords.iter().map(|(r, shape)| {
                let n = NOTES[((key.0 + r) % 12) as usize];
                let q = if *shape == MIN { "m" } else if *shape == MIN7 { "m7" } else if *shape == MAJ7 { "maj7" } else if *shape == DOM7 { "7" } else { "" };
                format!("{n}{q}")
            }).collect();
            Ok(format!(
                "{what}: {} — four bars, held. I've opened “{name}” in the Piano roll; to drop them in: Piano roll menu → Tools → Scripting → “Izuki notes”, then Accept. (FL only lets scripts add Piano roll notes that way.) Ctrl+Z takes them back; ask again for a different idea.",
                names.join(" → ")
            ))
        }
        Job::Vocals => {
            let tracks: Vec<(usize, String)> = one(json!(["tracks"]))?
                .as_array()
                .map(|a| a.iter().filter_map(|t| Some((t[0].as_u64()? as usize, t[1].as_str()?.to_string()))).collect())
                .unwrap_or_default();
            let vocal: Vec<(usize, String, VocalRole)> = tracks.iter().filter_map(|(i, n)| vocal_role(n).map(|r| (*i, n.clone(), r))).collect();
            if vocal.is_empty() {
                bail!("I can't find a vocal mixer track — name it in the Mixer (right-click the track → Rename): “Vocals”, “Backing vox” or “Adlibs”, then ask again.");
            }
            one(json!(["undo_point", "Izuki: vocal levels"]))?;
            let (mut backs, mut adlibs) = (0, 0);
            let mut lines = Vec::new();
            for (i, name, role) in &vocal {
                let (vol, pan) = match role {
                    VocalRole::Lead => (0.8, 0.0),
                    VocalRole::Backing => {
                        backs += 1;
                        (0.64, if backs % 2 == 1 { -0.35 } else { 0.35 })
                    }
                    VocalRole::Adlib => {
                        adlibs += 1;
                        (0.56, if adlibs % 2 == 1 { 0.5 } else { -0.5 })
                    }
                };
                call(vec![json!(["track_vol", i, vol]), json!(["track_pan", i, pan])], true)?;
                let slots: Vec<String> = one(json!(["slots", i])).ok().and_then(|v| v.as_array().cloned()).unwrap_or_default().iter().filter_map(|s| s.as_str().map(String::from)).collect();
                let advice = chain_advice(&slots);
                let has = if slots.is_empty() { "no effects yet".to_string() } else { slots.join(", ") };
                lines.push(if advice.is_empty() {
                    format!("• “{name}” ({has}) — the chain looks complete.")
                } else {
                    format!("• “{name}” ({has}) — add {}.", advice.join("; then "))
                });
            }
            Ok(format!(
                "Set your vocal levels: lead in the middle at full level, backing vocals a little lower and spread left and right, adlibs softer and wider. Ctrl+Z in FL undoes it.\n{}\n(FL doesn't let scripts add plugins, so the effects are yours to add — say “mix my vocals” again after, and I'll check the chain.)",
                lines.join("\n")
            ))
        }
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
        Job::Match => {
            let bpm = st["tempo"].as_f64().filter(|t| *t > 20.0).unwrap_or(140.0);
            let secs = (16.0 * 60.0 / bpm * 1.5).clamp(8.0, 20.0) as f32;
            // The beat as you hear it, in Song mode (where the Playlist's
            // clips play), with FL's metronome as the clock. Mode and
            // metronome go back as they were.
            let hear = || -> Result<(Vec<f64>, Option<f64>)> {
                let _ = one(json!(["stop"]));
                let song_was = one(json!(["songmode", true]))?.as_bool().unwrap_or(false);
                let click_was = one(json!(["metronome", true])).ok().and_then(|v| v.as_bool()).unwrap_or(false);
                let heard = play_and_record(secs);
                if !click_was {
                    let _ = one(json!(["metronome", false]));
                }
                if !song_was {
                    let _ = one(json!(["songmode", false]));
                }
                let (samples, rate) = heard?;
                let mut hits = crate::loopback::body_hits(&samples, rate);
                if hits.len() < 6 {
                    hits = crate::loopback::low_hits(&samples, rate);
                }
                let tempo_now = one(json!(["state"])).ok().and_then(|s| s["tempo"].as_f64()).unwrap_or(bpm);
                Ok((hits, crate::loopback::click_grid(&crate::loopback::high_clicks(&samples, rate), tempo_now)))
            };
            let (hits, beat0) = hear()?;
            let Some(beat0) = beat0 else {
                bail!("I couldn't hear FL's metronome click — it's my clock here. Turn the metronome's volume up, highlight your loop in the Playlist, and ask again.");
            };
            let Some((fit, phase, tight)) = crate::loopback::beat_fit(&hits, bpm) else {
                bail!("I couldn't hear enough of your sample to tell — highlight the loop in the Playlist so it plays there, and ask again.");
            };
            if !crate::loopback::steady(hits.len(), tight) {
                return Ok("I listened to your sample against FL's metronome, but its hits don't sit on any steady grid (strong swing, or more than one loop playing at once), so I'm not changing anything — that's better done by ear in the Playlist.".into());
            }
            let late_ms = |phase: f64, beat0: f64, tempo: f64| crate::loopback::grid_offset(phase, beat0, tempo) * 1000.0;
            let trim = |ms: f64| {
                if ms.abs() < 12.0 {
                    String::new()
                } else if ms > 0.0 {
                    format!(" Its hits land about {ms:.0} ms after FL's grid — there's a little silence (or a pickup) at the start of the clip. Trim {ms:.0} ms off the clip's start (zoom in and drag its left edge) or slide it left by that much; FL doesn't let me move clips myself.")
                } else {
                    format!(" Its hits land about {:.0} ms before FL's grid — slide the clip right by {:.0} ms (FL doesn't let me move clips myself).", -ms, -ms)
                }
            };
            // Its own tempo isn't FL's: FL's tempo set to match, then heard again.
            if (fit - bpm).abs() >= 0.15 {
                let to = (fit * 100.0).round() / 100.0;
                one(json!(["tempo", to]))?;
                // Couldn't listen again: the tempo goes back before saying so.
                let (again, beat1) = match hear() {
                    Ok(x) => x,
                    Err(e) => {
                        return Err(match one(json!(["tempo", bpm])) {
                            Ok(_) => e,
                            Err(_) => anyhow!("{e} — and I couldn't put the tempo back: FL is at {to:.2} BPM now, so set it back to {bpm:.2} yourself"),
                        });
                    }
                };
                let after = beat1.and_then(|b1| crate::loopback::beat_fit(&again, to).map(|f| (f, b1)));
                return match after {
                    Some(((fit2, phase2, tight2), b1)) if (fit2 - to).abs() < 0.08 && tight2 >= tight - 0.05 => Ok(format!(
                        "Your sample plays at about {to:.2} BPM, not FL's {bpm:.2} — that's why it drifted off the metronome and why snapping the 808 never felt right. I set FL's tempo to {to:.2} and listened again: it now sits on the click.{} Then snapping your 808 to the grid lines up with the sample.",
                        trim(late_ms(phase2, b1, to))
                    )),
                    _ => {
                        let back = if one(json!(["tempo", bpm])).is_ok() {
                            format!("so I put the tempo back to {bpm:.2}")
                        } else {
                            format!("and I couldn't put the tempo back — FL is still at {to:.2}, so set it back to {bpm:.2} yourself")
                        };
                        Ok(format!("Your sample sounds like about {to:.2} BPM against FL's {bpm:.2}, but setting FL's tempo to that didn't make it sit on the click when I listened again, {back}. The clip may be stretching with FL's tempo (its stretch mode) — set the clip to play at its own speed, then ask me again."))
                    }
                };
            }
            let ms = late_ms(phase, beat0, bpm);
            if ms.abs() < 12.0 {
                return Ok(format!("Your sample sits on FL's metronome (its tempo matches {bpm:.2} BPM and its hits land within {:.0} ms of the grid), so snapping the 808 to the grid will line up with it.", ms.abs().max(1.0)));
            }
            Ok(format!("Your sample's tempo matches FL's {bpm:.2} BPM.{} Once it starts on the grid, snapping your 808 to the grid lines up with it.", trim(ms)))
        }
        Job::Tune => {
            // The sound to tune: named, else the selected channel, else one named like a bass.
            let selected = one(json!(["selected"])).ok().and_then(|v| v.as_i64()).filter(|i| *i >= 0).map(|i| i as usize);
            let named = chans.iter().find(|(_, n)| {
                let lower = n.to_lowercase();
                role_of(n).is_none() && ((s.contains("808") && lower.contains("808")) || (s.contains("bass") && lower.contains("bass")))
            });
            let Some((ch, name)) = named
                .cloned()
                .or_else(|| selected.and_then(|i| chans.iter().find(|(c, n)| *c == i && role_of(n).is_none()).cloned()))
                .or_else(|| chans.iter().find(|(_, n)| role_of(n).is_none() && is_bass_name(n)).cloned())
            else {
                bail!("Which one's the 808? Click it in the Channel rack (or name it “808”), then ask again.");
            };
            let bpm = st["tempo"].as_f64().filter(|t| *t > 20.0).unwrap_or(140.0);
            let beats = st["pattern_beats"].as_f64().filter(|b| *b >= 1.0).unwrap_or(16.0);
            let secs = ((beats * 60.0 / bpm) + 0.5).clamp(4.0, 12.0) as f32;
            let was_muted: Vec<(usize, bool)> = st["channels"]
                .as_array()
                .map(|a| a.iter().filter_map(|c| Some((c["i"].as_u64()? as usize, c["muted"].as_bool().unwrap_or(false)))).collect())
                .unwrap_or_default();
            // The 808 alone, every mute put back after — in the pattern, and
            // in Song mode when the pattern alone is silent.
            let hear = || -> Result<Vec<f64>> {
                let flips: Vec<(usize, bool)> = was_muted.iter().filter_map(|(c, m)| (*c != ch && !*m).then_some((*c, true))).chain((was_muted.iter().any(|(c, m)| *c == ch && *m)).then_some((ch, false))).collect();
                let _ = one(json!(["stop"]));
                if !flips.is_empty() {
                    if let Err(e) = call(flips.iter().map(|(c, on)| json!(["mute", c, on])).collect(), false) {
                        let _ = call(flips.iter().map(|(c, on)| json!(["mute", c, !on])).collect(), false);
                        return Err(e);
                    }
                }
                let heard = play_and_record(secs);
                if !flips.is_empty() {
                    let _ = call(flips.iter().map(|(c, on)| json!(["mute", c, !on])).collect(), false);
                }
                let (samples, rate) = heard?;
                let hits = crate::loopback::low_hits(&samples, rate);
                Ok(crate::loopback::hit_pitches(&samples, rate, &hits))
            };
            // Heard in Song mode (the pattern alone was silent): checked there too.
            let hear_in = |song: bool| -> Result<Vec<f64>> {
                if !song {
                    return hear();
                }
                let was = one(json!(["songmode", true]))?.as_bool().unwrap_or(false);
                let got = hear();
                if !was {
                    let _ = one(json!(["songmode", false]));
                }
                got
            };
            let mut song = false;
            let mut pitches = hear_in(false)?;
            if pitches.len() < 2 {
                song = true;
                pitches = hear_in(true)?;
            }
            if pitches.len() < 2 {
                bail!("I couldn't hear clear notes from “{name}” on its own (too short, too distorted, or nothing playing), so I'm not changing its tuning.");
            }
            let cents: Vec<f64> = pitches.iter().map(|h| crate::loopback::cents_off(*h)).collect();
            let heard: Vec<String> = pitches.iter().zip(&cents).take(6).map(|(h, c)| format!("{} {:+.0}¢", crate::loopback::note_name(*h), c)).collect();
            let Some(detune) = crate::loopback::common_detune(&cents) else {
                return Ok(format!("I listened to “{name}”: {}. Its notes are off by different amounts — that's slides or a choice, not the sound's own tuning — so I left it alone.", heard.join(", ")));
            };
            let spread = cents.iter().fold(0.0f64, |m, c| m.max(c.abs()));
            if detune.abs() < 8.0 {
                return Ok(format!(
                    "I listened to “{name}”: {}. On average it's {detune:+.0} cents from in tune (each note within {spread:.0}), so there's nothing to change.",
                    heard.join(", ")
                ));
            }
            // Retuned by its pitch knob, then heard again: kept only if it landed.
            let before = one(json!(["fine", ch]))?.as_f64().unwrap_or(0.0);
            let set = before - detune;
            one(json!(["fine", ch, set]))?;
            // Kept only when the shared offset is gone and no note is further
            // out than detection allows (the same ±15 cents).
            let after: Vec<f64> = hear_in(song).map(|p| p.into_iter().map(crate::loopback::cents_off).collect()).unwrap_or_default();
            let worst = after.iter().fold(0.0f64, |m, c| m.max(c.abs()));
            let left = crate::loopback::common_detune(&after);
            if after.len() >= 2 && worst <= 15.0 && left.is_some_and(|l| l.abs() <= 8.0) {
                return Ok(format!(
                    "I listened to “{name}”: every hit was about {detune:+.0} cents off its note ({}) — the sound's own tuning, which is why it didn't sit with the beat. I set its pitch knob from {before:+.0} to {set:+.0} cents and listened again: now {:+.0} cents on average, each note within {worst:.0}. (To undo it, set its pitch back to {before:+.0}.)",
                    heard.join(", "),
                    left.unwrap_or(0.0)
                ));
            }
            if let Err(e) = one(json!(["fine", ch, before])) {
                bail!("Retuning “{name}” didn't check out when I listened again, and I couldn't put its pitch back ({e}). Set the pitch knob of “{name}” back to {before:+.0} cents yourself.");
            }
            Ok(format!(
                "I heard “{name}” about {detune:+.0} cents off its notes ({}), but after retuning, {} when I listened again, so I put its pitch back to {before:+.0} cents. Its pitch range may be too small, or a plugin changes the pitch.",
                heard.join(", "),
                if after.len() < 2 { "I couldn't hear clear notes".to_string() } else { format!("some notes were still {worst:.0} cents off") }
            ))
        }
        Job::Align => {
            // The notes to line up: named in the request, else the selected
            // channel (the one open in the Piano roll) if it plays notes, else
            // one named like a bass.
            let selected = one(json!(["selected"])).ok().and_then(|v| v.as_i64()).filter(|i| *i >= 0).map(|i| i as usize);
            let named = chans.iter().find(|(_, n)| {
                let lower = n.to_lowercase();
                role_of(n).is_none() && ((s.contains("808") && lower.contains("808")) || (s.contains("bass") && lower.contains("bass")))
            });
            let target = named
                .cloned()
                .or_else(|| selected.and_then(|i| chans.iter().find(|(c, n)| *c == i && role_of(n).is_none()).cloned()))
                .or_else(|| chans.iter().find(|(_, n)| role_of(n).is_none() && is_bass_name(n)).cloned());
            let Some((ch, name)) = target else {
                bail!("Which notes should I line up? Click their channel in the Channel rack (or open them in the Piano roll), then ask again.");
            };
            let bpm = st["tempo"].as_f64().filter(|t| *t > 20.0).unwrap_or(140.0);
            // What they go with. A kick programmed in the Channel rack — unless
            // the sample / loop / clip is what's named. Else the beat itself
            // as it plays: a sample loop or a clip in the Playlist (not made on
            // FL's grid, so its hits needn't sit on it) — everything you hear
            // but these notes, in Song mode, where the Playlist plays.
            let kick = chans.iter().find(|(_, n)| role_of(n) == Some(Role::Kick)).cloned().filter(|(k, _)| !steps_on(*k).is_empty());
            let names_sample = ["sample", "loop", "clip", "audio", "playlist", "song"].iter().any(|w| s.contains(w));
            let by_kick = kick.filter(|_| !names_sample);
            let loop_beats = match &by_kick {
                Some((k, _)) => row_len(*k).max(16) as f64 / 4.0,
                // FL gives the pattern's length in beats.
                None => st["pattern_beats"].as_f64().filter(|b| *b >= 1.0).unwrap_or(16.0),
            };
            // Where the first kick is written (the anchor when there's no click).
            let anchor = by_kick.as_ref().and_then(|(k, _)| steps_on(*k).first().map(|s| *s as f64 / 4.0)).unwrap_or(0.0);
            // Listen with only `keep` playing — and FL's metronome as the clock,
            // like a producer checking against the click — two loops. Every mute
            // and the metronome go back exactly as they were. The hits, as beats
            // in the loop: timed against the click when it's heard, else
            // against the first kick. (true: on the click.)
            let was_muted: Vec<(usize, bool)> = st["channels"]
                .as_array()
                .map(|a| a.iter().filter_map(|c| Some((c["i"].as_u64()? as usize, c["muted"].as_bool().unwrap_or(false)))).collect())
                .unwrap_or_default();
            let listen = |keep: &[usize]| -> Result<(Vec<f64>, bool, Vec<f64>)> {
                let flips: Vec<(usize, bool)> = was_muted
                    .iter()
                    .filter_map(|(c, m)| {
                        let want = !keep.contains(c);
                        (want != *m).then_some((*c, want))
                    })
                    .collect();
                let _ = one(json!(["stop"]));
                let click_was = one(json!(["metronome", true]))?.as_bool().unwrap_or(false);
                if !flips.is_empty() {
                    if let Err(e) = call(flips.iter().map(|(c, on)| json!(["mute", c, on])).collect(), false) {
                        // Some may have changed before it failed (mute sets, never toggles).
                        let _ = call(flips.iter().map(|(c, on)| json!(["mute", c, !on])).collect(), false);
                        if !click_was {
                            let _ = one(json!(["metronome", false]));
                        }
                        return Err(e);
                    }
                }
                let secs = (loop_beats * 2.0 * 60.0 / bpm + 0.8) as f32;
                let heard = play_and_record(secs);
                if !flips.is_empty() {
                    let _ = call(flips.iter().map(|(c, on)| json!(["mute", c, !on])).collect(), false);
                }
                if !click_was {
                    let _ = one(json!(["metronome", false]));
                }
                let (samples, rate) = heard?;
                // A loop without a deep kick: its snares and claps count too.
                let mut lows = crate::loopback::low_hits(&samples, rate);
                if lows.len() < 2 {
                    lows = crate::loopback::body_hits(&samples, rate);
                }
                let clicks = crate::loopback::high_clicks(&samples, rate);
                eprintln!("[fl] {} channel(s) playing: {} hit(s), {} click(s)", keep.len(), lows.len(), clicks.len());
                // Each hit's pitch too (for the notes alone: their tuning).
                let pitches = crate::loopback::hit_pitches(&samples, rate, &lows);
                Ok(match crate::loopback::click_grid(&clicks, bpm) {
                    Some(beat0) => (crate::loopback::hits_on_clock(&lows, beat0, bpm, loop_beats), true, pitches),
                    None => (crate::loopback::hits_to_beats(&lows, bpm, anchor, loop_beats), false, pitches),
                })
            };
            // Song mode for the beat; put back as it was afterwards, whatever happens.
            let song_was = match by_kick {
                None => Some(one(json!(["songmode", true]))?.as_bool().unwrap_or(false)),
                Some(_) => None,
            };
            let done = (|| -> Result<String> {
                let off_grid = |hits: &[f64]| -> Vec<String> {
                    hits.iter().filter(|k| (*k - (*k * 4.0).round() / 4.0).abs() > 0.02).take(6).map(|k| format!("beat {:.2}", k + 1.0)).collect()
                };
                let plural = |n: usize| if n == 1 { "" } else { "s" };
                let (beat, hits, separate, intro, pitches) = match &by_kick {
                    Some((kick, kick_name)) => {
                        // 1. The kick alone: the beat's real feel.
                        let (kicks, clocked, _) = listen(&[*kick])?;
                        if kicks.is_empty() {
                            bail!("I couldn't hear the kick. Is FL's sound coming out of your speakers or headphones (and the kick not silent)? Other sound playing on the PC can get in the way too.");
                        }
                        // 2. The notes alone against the same click: where each
                        //    hit really sounds — late (or early) on every hit is
                        //    the sound itself (its attack, a plugin's delay), which
                        //    no grid fixes. No click: kick and notes together, the
                        //    notes' own hits only (timed the same way as the kick's).
                        let together = || listen(&[*kick, ch]).ok().filter(|(_, c, _)| *c == clocked).map(|(h, _, _)| h).unwrap_or_default();
                        let (hits, separate, pitches) = if clocked {
                            match listen(&[ch]) {
                                Ok((h, true, p)) if !h.is_empty() => (h, true, p),
                                _ => (together(), false, Vec::new()),
                            }
                        } else {
                            (together(), false, Vec::new())
                        };
                        let off = off_grid(&kicks);
                        let intro = format!(
                            "I listened to “{kick_name}”: it lands {} time{} in each loop{}.",
                            kicks.len(),
                            plural(kicks.len()),
                            if off.is_empty() { ", right on the grid".to_string() } else { format!(" — off the grid at {} (that's the groove “{name}” will follow)", off.join(", ")) },
                        );
                        (kicks, hits, separate, intro, pitches)
                    }
                    None => {
                        // 1. The beat as you hear it, without these notes.
                        let keep: Vec<usize> = was_muted.iter().filter(|(c, m)| !*m && *c != ch).map(|(c, _)| *c).collect();
                        let (beat, clocked, _) = listen(&keep)?;
                        if beat.is_empty() {
                            bail!("I couldn't hear the beat. Is FL's sound coming out of your speakers or headphones? Highlight your loop in the Playlist (the part with your sample) so it plays there, then ask again.");
                        }
                        if !clocked {
                            bail!("I couldn't hear FL's metronome click — it's my clock for timing against your sample. Turn the metronome's volume up (I switch it on and off myself), then ask again.");
                        }
                        // 2. The notes alone, in the same loop and the same clock.
                        let (hits, clocked, pitches) = listen(&[ch])?;
                        if hits.is_empty() || !clocked {
                            bail!("I heard your beat, but not “{name}” playing with it in Song mode. Put its pattern in the Playlist under your highlighted loop, then ask again.");
                        }
                        let off = off_grid(&beat);
                        let intro = format!(
                            "I listened to your beat as it plays — everything but “{name}”, in Song mode: its main hits land {} time{} in each {:.0}-beat loop{}.",
                            beat.len(),
                            plural(beat.len()),
                            loop_beats,
                            if off.is_empty() {
                                ", on FL's grid".to_string()
                            } else {
                                format!(" — off FL's grid at {} (a sample isn't made on FL's grid, so that's the groove “{name}” has to follow)", off.join(", "))
                            },
                        );
                        (beat, hits, true, intro, pitches)
                    }
                };
                // Heard alone, every hit off its note by the same amount: the
                // sample's own tuning — said, and offered.
                let detune = crate::loopback::common_detune(&pitches.iter().map(|h| crate::loopback::cents_off(*h)).collect::<Vec<_>>()).filter(|d| d.abs() >= 10.0);
                let tuning = detune
                    .map(|d| format!(" Its pitch is also about {:+.0} cents off the notes it plays on every hit — that's the sound's own tuning; say “tune the 808” and I'll fix that too.", d))
                    .unwrap_or_default();
                let song = by_kick.is_none();
                let with = if song { "the beat" } else { "the kick" };
                let heard_lag = if separate { common_lag(&hits, &beat, loop_beats, bpm) } else { 0.0 };
                // Not clear by ear: the sample's own punch, read from its file.
                let file_ms = if heard_lag == 0.0 { sample_attack_ms(&name).filter(|ms| *ms >= 8.0) } else { None };
                let lag = file_ms.map(|ms| ms * bpm / 60_000.0).unwrap_or(heard_lag);
                let review = review_hits(&hits, &beat, bpm, loop_beats, lag, !separate);
                let dir = piano_roll_dir().ok_or_else(|| anyhow!("couldn't find your Documents folder"))?;
                std::fs::create_dir_all(&dir)?;
                std::fs::write(dir.join("Izuki align.pyscript"), align_script(&name, &beat, loop_beats, lag, if song { &hits } else { &[] }))?;
                one(json!(["select", ch]))?;
                // "Do it" next runs it in the Piano roll (apply_follow_up) — only
                // once the Piano roll really shows this part.
                if one(json!(["show", "pianoroll"])).is_ok() {
                    *ALIGN_READY.lock() = Some((Instant::now(), name.to_string()));
                }
                let lag_ms = lag * 60_000.0 / bpm;
                let sound = if lag_ms.abs() >= 8.0 {
                    format!(
                        " Your {name} sounds about {:.0} ms {} on every hit even where the notes are on time — that's the sound itself (its attack, or a plugin on its mixer track), which is why quantizing didn't fix it. The fix starts each note {:.0} ms {} so it lands with {with}.",
                        lag_ms.abs(),
                        if lag_ms > 0.0 { "late" } else { "early" },
                        lag_ms.abs(),
                        if lag_ms > 0.0 { "earlier" } else { "later" }
                    )
                } else {
                    String::new()
                };
                // The hits there was anything to judge: heard together with the
                // kick, a hit on a kick can't be told from the kick.
                let judged = hits.iter().filter(|b| separate || !beat.iter().any(|k| loop_gap(**b, *k, loop_beats) < 0.06)).count();
                let heard_808 = if judged == 0 {
                    format!("I couldn't pick out your {name} clearly{}, so I can't tell you yet whether it rushes or drags.", if separate { "" } else { " apart from the kick" })
                } else if review.is_empty() {
                    format!("Against it, your {name} sounds in the pocket — nothing rushing or dragging that I could hear.{sound}")
                } else {
                    format!("Against it, your {name} is off in {} place{}: {}.{sound}", review.len(), plural(review.len()), review.join(", "))
                };
                Ok(format!(
                    "{intro} {heard_808}{tuning} Your notes and rhythm stay as you wrote them. I've opened “{name}” in the Piano roll with the fix ready — say “do it” and I'll run it there for you (or yourself: Piano roll menu → Tools → Scripting → “Izuki align”, then Accept). Notes right by a hit of {with} move onto it exactly as it plays and the 16ths between get the same feel; triplets, rolls and notes you placed a 16th or a 32nd away stay put, and so do lengths and slides. Ctrl+Z takes it back."
                ))
            })();
            if song_was == Some(false) {
                let _ = one(json!(["songmode", false]));
            }
            done
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
    fn chords_long_notes_and_vocals() {
        assert_eq!(job_of("add some chords in fl"), Some(Job::Chords));
        assert_eq!(job_of("make pads for my beat"), Some(Job::Chords));
        assert_eq!(job_of("add a melody with long notes"), Some(Job::LongMelody));
        assert_eq!(job_of("mix my vocals"), Some(Job::Vocals));
        assert_eq!(job_of("make my vocals sound better"), Some(Job::Vocals));
        assert_eq!(job_of("add a melody"), Some(Job::Melody), "short notes stay on the Channel rack");
        // A minor: i–VI–III–VII is Am F C G; voiced close together.
        let ch = progression("trap", true, 0);
        assert_eq!(ch.iter().map(|(r, _)| *r).collect::<Vec<_>>(), vec![0, 8, 3, 10]);
        let notes = chord_notes(9, &ch);
        let bar = |b: f32| notes.iter().filter(|(_, s, _, _)| *s == b).map(|(p, _, _, _)| *p).collect::<Vec<_>>();
        assert_eq!(notes.len(), 16, "a bass note and a triad, four bars");
        let pcs = |v: Vec<u8>| { let mut x: Vec<u8> = v.iter().map(|p| p % 12).collect(); x.sort_unstable(); x.dedup(); x };
        assert_eq!(pcs(bar(0.0)), vec![0, 4, 9], "A minor: A C E");
        assert_eq!(pcs(bar(4.0)), vec![0, 5, 9], "F major: F A C");
        assert!(notes.iter().all(|(_, _, l, _)| *l == 4.0), "held a whole bar");
        let mel = long_melody_notes(9, &ch, 42);
        assert_eq!(mel.len(), 8);
        assert!(mel.iter().all(|(p, _, l, _)| (60..=84).contains(p) && *l >= 1.9));
        let script = piano_roll_script("Chords in A minor", &notes[..2]);
        assert!(script.contains("import flpianoroll as flp") && script.contains("def apply(form)") && script.contains("NOTES = [(45, 0.000, 4.000, 0.62)"), "{script}");
        assert_eq!(vocal_role("Lead Vox"), Some(VocalRole::Lead));
        assert_eq!(vocal_role("Backing vox L"), Some(VocalRole::Backing));
        assert_eq!(vocal_role("Adlibs"), Some(VocalRole::Adlib));
        assert_eq!(vocal_role("Kick"), None);
        assert_eq!(vocal_role("Hook synth"), None, "a hook isn't always a voice");
        assert_eq!(vocal_role("Double bass"), None);
        assert_eq!(vocal_role("Vox double"), Some(VocalRole::Backing));
        let advice = chain_advice(&["Fruity Parametric EQ 2".into(), "Fruity Compressor".into()]);
        assert_eq!(advice.len(), 2, "de-esser and reverb still to add: {advice:?}");
    }

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
        assert_eq!(job_of("help me quantize this 808 notes cos they not aligning with the beat"), Some(Job::Align));
        assert_eq!(job_of("my 808 is sounding off with the kick"), Some(Job::Align));
        assert_eq!(job_of("line the bass up with the drums"), Some(Job::Align));
        assert_eq!(job_of("quantize the 808"), Some(Job::Quantize), "the grid, when that's all that's asked");
        // The user's own words (typos and all): lining up, by ear.
        assert_eq!(job_of("i ur a profssional producer. so pls my notes here some of them are not flowing with the beat"), Some(Job::Align));
        assert_eq!(job_of("theres an misaallgiment the 808 isnt flowing with the sample"), Some(Job::Align));
        assert_eq!(job_of("even tho its on grid some notes wouldnt allign with the loops"), Some(Job::Align));
        assert_eq!(job_of("make the 808 flow with the beat"), Some(Job::Align), "fixing it, not a new one");
        assert_eq!(job_of("add an 808 that flows with the beat"), Some(Job::Bass), "a new one");
        assert_eq!(job_of("add an 808 with some groove"), Some(Job::Bass));
        assert_eq!(job_of("make a bass with a nice rhythm"), Some(Job::Bass));
        assert_eq!(job_of("put the 808 in the pocket"), Some(Job::Align), "fixing the one there");
        assert_eq!(job_of("my notes aren't syncing"), None, "Izuki's Notes, not music");
        assert_eq!(job_of("tune the 808"), Some(Job::Tune));
        assert_eq!(job_of("my 808 is out of tune with the sample"), Some(Job::Tune));
        assert_eq!(job_of("the 808 sounds off key"), Some(Job::Tune));
        assert_eq!(job_of("pitch the 808 up an octave"), None, "moving it, not tuning it");
        assert_eq!(job_of("fix the timing on my 808"), Some(Job::Align), "timing isn't tuning");
        assert_eq!(job_of("the 808 in this tune is late"), Some(Job::Align), "a tune (the song), and timing");
        assert_eq!(job_of("the sample isnt flowing with the metronome"), Some(Job::Match));
        assert_eq!(job_of("make the loop match the tempo"), Some(Job::Match));
        assert_eq!(job_of("my sample is drifting off the grid"), Some(Job::Match));
        assert_eq!(job_of("line my 808 up with the sample"), Some(Job::Align), "the 808 to the sample, not the sample itself");
        assert_eq!(job_of("add a sample"), None);
        assert_eq!(job_of("what tempo is my sample"), None, "a question, not a fix");
        assert_eq!(job_of("add a click sample"), None);
        assert_eq!(job_of("the sample is off the click"), Some(Job::Match));
        assert_eq!(job_of("click on the sample and turn it off"), None, "a click of the mouse");
        // A new beat only when one is asked for — never "fix the beat".
        for new in ["make a beat", "make afrobeats", "cook up a trap beat", "give me a drill beat", "make me a beat in fl", "start a beat", "make an afrobeat at 105"] {
            assert!(wants_beat(new), "{new}");
        }
        for there in [
            "fix the beat", "make the beat louder", "make my beat hit harder", "the beat doesn't make sense", "make the 808 flow with the beat",
            "this beat makes me happy", "make the drums sound better", "why is the beat so quiet", "add an 808 to my beat",
        ] {
            assert!(!wants_beat(there), "{there}");
        }
        assert!(asks_setup("set up FL Studio") && asks_setup("can you connect izuki to fl") && asks_setup("link fl please"));
        assert!(!asks_setup("set up my flight") && !asks_setup("reflect on it"), "not FL");
        // The link, in any words.
        for said in [
            "set izuki up in fl", "hook izuki up to fl studio", "connect to FL studio", "enable izuki in fl's midi settings",
            "install the izuki script in fl", "do the setup for fl", "set up izuki midi", "pair izuki with fruity loops", "setup fl",
            "connect izuki to fl so it can fix my drums", "hook it up in fl",
        ] {
            assert!(asks_setup(said), "{said}");
        }
        // A verb aimed at something inside FL, your own gear, or undoing the link.
        for said in [
            "link my sample to the grid in fl", "connect the 808 to a mixer track in fl", "set the tempo up in fl", "disconnect izuki from fl", "don't set up fl",
            "my studio setup in fl is messy", "connect my midi keyboard to fl", "set up my controller in fl studio", "hook my speakers up to fl", "install a vst in fl",
            "install fl studio", "enable the metronome in fl", "activate my fl studio license",
        ] {
            assert!(!asks_setup(said), "{said}");
        }
        // Right after Izuki offered: "set it up" is the link; anything else isn't.
        *NOT_LINKED_AT.lock() = Some(Instant::now());
        assert!(setup_follow_up("set it up") && setup_follow_up("hook it up") && setup_follow_up("do the setup") && setup_follow_up("ok connect it"));
        assert!(!setup_follow_up("set an alarm up") && !setup_follow_up("install spotify"), "not the link");
        assert!(!setup_follow_up("set it up for my meeting") && !setup_follow_up("connect it to my wifi"), "something else");
        assert!(setup_follow_up("yeah set it up for me"));
        // After the 808 fix is written: "do it" runs it; another job doesn't.
        for go in ["fix it", "do it", "apply it", "line them up", "fix my 808", "run it bro", "go ahead"] {
            assert!(applies_fix(go), "{go}");
        }
        for other in ["fix the hats", "make it louder", "why is it off?", "no", "open youtube"] {
            assert!(!applies_fix(other), "{other}");
        }
        assert_eq!(apply_follow_up("don't run izuki align"), None);
        // "What's in my project?"
        for ask in ["what's in my fl project", "read my beat", "go through my fl project", "what do you see in this beat", "what's in this project in fl studio"] {
            assert!(asks_project(ask), "{ask}");
        }
        for not in ["save my project", "make a beat", "what's the weather", "export my project", "what's in my project folder for school"] {
            assert!(!asks_project(not), "{not}");
        }
        // After Izuki talked about connecting FL: a short push is the setup.
        assert!(talked_about_link(NOT_LINKED) && talked_about_link("Set up. Now in FL Studio (restart it first if it's open): Options → MIDI settings."));
        assert!(!talked_about_link("Tempo's 140 BPM."));
        for push in ["make it", "do it bro", "enable it", "connect it", "just set it up", "yea bro", "make it work", "ok do the connection"] {
            assert!(pushes_to_do_it(push), "{push}");
        }
        for other in [
            "open youtube", "how long does it take?", "no", "enable my midi keyboard", "fix my 808", "what's the weather", "turn it up", "make it louder",
            "turn it on", "set the volume up",
        ] {
            assert!(!pushes_to_do_it(other), "{other}");
        }
        *NOT_LINKED_AT.lock() = None;
        assert!(!setup_follow_up("set it up"), "no offer waiting");
        // FL open but not linked: an FL job is told so — never handed to the screen.
        assert_eq!(route(false, true, false, true), Route::NotLinked);
        assert_eq!(route(false, true, false, false), Route::Pass, "not a job: others take it");
        assert_eq!(route(false, false, false, true), Route::Pass, "FL closed: the beat starter");
        assert_eq!(route(true, false, false, true), Route::Open);
        assert_eq!(route(true, true, false, false), Route::NotLinked);
        assert_eq!(route(true, true, true, true), Route::Go);
        assert_eq!(route(false, true, true, true), Route::Go);
        assert_eq!(job_of("fix the timing on the hats"), Some(Job::Quantize));
        assert!(!aligning(&["along", "allow", "alone", "agreement", "apartment", "assign", "assigned", "assignment", "alien", "alike", "alive", "malign"]));
        assert!(aligning(&["allign"]) && aligning(&["alighn"]) && aligning(&["misaligned"]) && aligning(&["misaallgiment"]) && aligning(&["alligned"]));
        assert_eq!(job_of("assign the 808 to a mixer track"), None, "not lining it up");
        assert_eq!(job_of("my 808 is still off even after i quantize"), Some(Job::Align));
        assert_eq!(job_of("the 808 comes in late on beat 3"), Some(Job::Align));
        assert_eq!(job_of("add a bass line"), Some(Job::Bass), "writing one, not lining one up");
        assert_eq!(job_of("add an 808 that follows the kick"), Some(Job::Bass));
        // 120 bpm: a beat is 500 ms. Kicks on 0 and 2; 808 hits at 1.0 (in time), 1.43 (35 ms early of 1.5), 3.06 (30 ms late).
        let review = review_hits(&[0.0, 1.0, 1.43, 2.0, 3.06], &[0.0, 2.0], 120.0, 4.0, 0.0, true);
        assert_eq!(review, vec!["beat 2.43 rushes by 35 ms".to_string(), "beat 4.06 drags by 30 ms".to_string()]);
        // Heard alone, 30 ms late on every hit (0.06 of a beat at 120 bpm): the sound's own delay.
        let lag = common_lag(&[0.06, 1.06, 2.06, 3.06], &[0.0, 2.0], 4.0, 120.0);
        assert!((lag - 0.06).abs() < 0.001, "{lag}");
        assert!(review_hits(&[0.06, 1.06, 2.06, 3.06], &[0.0, 2.0], 120.0, 4.0, lag, false).is_empty(), "said once, not per hit");
        assert_eq!(common_lag(&[0.0, 1.07, 2.0, 2.93], &[0.0, 2.0], 4.0, 120.0), 0.0, "notes off in different ways: the notes, not the sound");
        // A note written a 16th or a 32nd after the kick, a triplet, a roll: their own rhythm.
        for b in [0.25, 2.125, 1.3333, 1.6667, 3.375] {
            assert!((where_it_belongs(b, &[0.0, 2.0], 4.0) - b).abs() < 1e-9, "{b} stays");
        }
        assert!((where_it_belongs(2.05, &[0.0, 2.0], 4.0) - 2.0).abs() < 1e-9, "right by the kick: with it");
        // A lag bigger than a note's window is still the sound's own.
        let big = common_lag(&[0.11, 1.11, 2.11, 3.11], &[0.0, 2.0], 4.0, 120.0);
        assert!((big - 0.11).abs() < 0.001, "{big}");
        assert!(review_hits(&[0.11, 1.11, 2.11, 3.11], &[0.0, 2.0], 120.0, 4.0, big, false).is_empty());
        let script = align_script("808", &[0.0, 1.56, 3.0], 4.0, 0.06, &[]);
        assert!(script.contains("ON_GRID = 0.075") && script.contains("0.08, 0.02, 0.24") && script.contains("def _fine(beat):"));
        // (To run the real script against a stand-in Piano roll.)
        if let Ok(path) = std::env::var("IZUKI_DUMP_ALIGN") {
            std::fs::write(path, &script).unwrap();
        }
        assert!(script.contains("LAG = 0.0600"));
        assert!(script.contains("KICKS = [0.0000, 1.5600, 3.0000]") && script.contains("def apply(form):"));
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
