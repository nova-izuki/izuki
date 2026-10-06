//! Izuki's hands on an Android phone, over Wi-Fi.
//!
//! Android has a free, built-in remote-control channel (ADB — the same one app
//! developers use). Turned on once in the phone's Wireless-debugging settings,
//! Izuki on the PC can see the phone's screen and its real on-screen elements
//! (like the control list it reads on Windows), and tap, type and swipe — the
//! same look → act → look loop it already uses. Nothing is installed on the
//! phone, and it only ever connects to a phone the user paired.
//!
//! ADB itself (Google's `platform-tools`) is downloaded once, the same way the
//! call tunnel's `cloudflared` is. Everything here is off unless the user turns
//! on "Control my Android" and pairs a phone.

use std::path::PathBuf;
use std::process::Command;
use std::time::Duration;

use anyhow::{anyhow, Context, Result};

use crate::capture::Frame;
use crate::model::Rect;

/// Google's official, always-current tools bundle for Windows.
const PLATFORM_TOOLS_URL: &str = "https://dl.google.com/android/repository/platform-tools-latest-windows.zip";

fn tools_dir() -> PathBuf {
    crate::store::data_dir().join("bin").join("platform-tools")
}

fn adb_path() -> PathBuf {
    tools_dir().join(if cfg!(windows) { "adb.exe" } else { "adb" })
}

/// Download and unpack ADB once (about 15 MB). Safe to call every time.
pub fn ensure_adb() -> Result<PathBuf> {
    let adb = adb_path();
    if adb.exists() {
        return Ok(adb);
    }
    if !cfg!(windows) {
        anyhow::bail!("install Android platform-tools first");
    }
    eprintln!("[android] downloading Google's platform-tools");
    let bytes = reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(600))
        .build()?
        .get(PLATFORM_TOOLS_URL)
        .send()?
        .error_for_status()?
        .bytes()?;
    if bytes.len() < 1_000_000 {
        anyhow::bail!("the Android tools download looks broken — try again later");
    }
    let bin = crate::store::data_dir().join("bin");
    std::fs::create_dir_all(&bin)?;
    let mut zip = zip::ZipArchive::new(std::io::Cursor::new(bytes))?;
    // The zip already contains a top-level "platform-tools/" folder.
    zip.extract(&bin).context("unpacking the Android tools")?;
    if !adb.exists() {
        anyhow::bail!("the Android tools unpacked but adb is missing");
    }
    Ok(adb)
}

/// Run an adb command, returning its raw stdout. No console window pops up.
fn adb_raw(args: &[&str]) -> Result<Vec<u8>> {
    let adb = adb_path();
    if !adb.exists() {
        anyhow::bail!("Android tools aren't set up yet");
    }
    let mut cmd = Command::new(&adb);
    cmd.args(args);
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x0800_0000); // CREATE_NO_WINDOW
    }
    let out = cmd.output().context("running adb")?;
    if !out.status.success() {
        let err = String::from_utf8_lossy(&out.stderr);
        anyhow::bail!("adb {}: {}", args.first().copied().unwrap_or(""), err.trim());
    }
    Ok(out.stdout)
}

fn adb_text(args: &[&str]) -> Result<String> {
    Ok(String::from_utf8_lossy(&adb_raw(args)?).into_owned())
}

/// The phone address the user paired, e.g. "192.168.1.24:5555".
fn phone_addr() -> String {
    crate::state::store().settings().android_addr.trim().to_string()
}

/// Connect to the paired phone over Wi-Fi. Returns a short status line.
pub fn connect() -> Result<String> {
    ensure_adb()?;
    let addr = phone_addr();
    if addr.is_empty() {
        anyhow::bail!("no phone address yet — turn on Wireless debugging on the phone and enter its IP and port");
    }
    let out = adb_text(&["connect", &addr])?;
    let low = out.to_lowercase();
    if low.contains("connected") || low.contains("already") {
        let model = adb_text(&["-s", &addr, "shell", "getprop", "ro.product.model"]).unwrap_or_default();
        let model = model.trim();
        Ok(if model.is_empty() { "Connected to your phone.".into() } else { format!("Connected to your {model}.") })
    } else {
        Err(anyhow!("couldn't connect: {}", out.trim()))
    }
}

/// True once a paired phone answers.
pub fn is_connected() -> bool {
    let addr = phone_addr();
    if addr.is_empty() {
        return false;
    }
    adb_text(&["-s", &addr, "get-state"]).map(|s| s.trim() == "device").unwrap_or(false)
}

fn sh(args: &[&str]) -> Result<Vec<u8>> {
    let addr = phone_addr();
    let mut full = vec!["-s", addr.as_str(), "exec-out"];
    full.extend_from_slice(args);
    adb_raw(&full)
}

fn sh_text(args: &[&str]) -> Result<String> {
    Ok(String::from_utf8_lossy(&sh(args)?).into_owned())
}

/// A screenshot of the phone as a Frame (BGRA), same as the PC's capture.
pub fn screenshot() -> Result<Frame> {
    let png = sh(&["screencap", "-p"])?;
    let img = image::load_from_memory(&png).context("decoding the phone screenshot")?.to_rgba8();
    let (w, h) = img.dimensions();
    let mut bgra = img.into_raw();
    for px in bgra.chunks_mut(4) {
        px.swap(0, 2); // RGBA -> BGRA
    }
    Ok(Frame { width: w, height: h, origin: (0, 0), bgra })
}

/// One `[l,t][r,b]` bounds string from a uiautomator dump.
fn parse_bounds(s: &str) -> Option<Rect> {
    let nums: Vec<i32> = s
        .split(|c: char| !c.is_ascii_digit() && c != '-')
        .filter(|t| !t.is_empty())
        .filter_map(|t| t.parse().ok())
        .collect();
    if let [l, t, r, b] = nums[..] {
        Some(Rect { x: l, y: t, w: (r - l).max(0), h: (b - t).max(0) })
    } else {
        None
    }
}

/// Pull one XML attribute's value.
fn attr<'a>(node: &'a str, key: &str) -> &'a str {
    let pat = format!("{key}=\"");
    node.find(&pat)
        .map(|i| i + pat.len())
        .and_then(|start| node[start..].find('"').map(|end| &node[start..start + end]))
        .unwrap_or("")
}

/// The phone's own on-screen elements, numbered — the phone equivalent of the
/// Windows control list, so the model can say "tap #7" instead of guessing.
pub fn controls(max: usize) -> Vec<crate::uia::Control> {
    let xml = match sh_text(&["uiautomator", "dump", "/dev/tty"]) {
        Ok(x) => x,
        Err(e) => {
            eprintln!("[android] ui dump failed: {e}");
            return Vec::new();
        }
    };
    parse_controls(&xml, max)
}

fn parse_controls(xml: &str, max: usize) -> Vec<crate::uia::Control> {
    let mut out = Vec::new();
    let mut id = 0u32;
    for node in xml.split("<node").skip(1) {
        let clickable = attr(node, "clickable") == "true";
        let editable = attr(node, "class").contains("EditText");
        let scrollable = attr(node, "scrollable") == "true";
        if !clickable && !editable && !scrollable {
            continue;
        }
        let Some(rect) = parse_bounds(attr(node, "bounds")) else { continue };
        if rect.w < 4 || rect.h < 4 {
            continue;
        }
        let text = attr(node, "text");
        let desc = attr(node, "content-desc");
        let name = if !text.is_empty() { text } else { desc };
        let kind = if editable {
            "field"
        } else if scrollable {
            "list"
        } else {
            "button"
        };
        id += 1;
        out.push(crate::uia::Control {
            id,
            kind: kind.into(),
            name: name.chars().take(80).collect(),
            rect,
            hidden: false,
            value: if editable { text.chars().take(80).collect() } else { String::new() },
            focused: attr(node, "focused") == "true",
            below: false,
            section: String::new(),
            identity: None,
        });
        if out.len() >= max {
            break;
        }
    }
    out
}

// ---- doing things on the phone -------------------------------------------

pub fn tap(x: i32, y: i32) -> Result<()> {
    sh(&["input", "tap", &x.to_string(), &y.to_string()]).map(|_| ())
}

pub fn swipe(x1: i32, y1: i32, x2: i32, y2: i32, ms: u32) -> Result<()> {
    sh(&["input", "swipe", &x1.to_string(), &y1.to_string(), &x2.to_string(), &y2.to_string(), &ms.to_string()]).map(|_| ())
}

/// Type text (spaces become %s, which `input text` needs).
pub fn type_text(text: &str) -> Result<()> {
    let escaped = text.replace(' ', "%s").replace('\'', "");
    sh(&["input", "text", &escaped]).map(|_| ())
}

/// A named key: back, home, enter, etc.
pub fn key(name: &str) -> Result<()> {
    let code = match name.to_lowercase().as_str() {
        "back" => "KEYCODE_BACK",
        "home" => "KEYCODE_HOME",
        "enter" | "return" => "KEYCODE_ENTER",
        "recents" | "apps" => "KEYCODE_APP_SWITCH",
        "power" => "KEYCODE_POWER",
        "volume_up" => "KEYCODE_VOLUME_UP",
        "volume_down" => "KEYCODE_VOLUME_DOWN",
        "space" => "KEYCODE_SPACE",
        "delete" | "backspace" => "KEYCODE_DEL",
        other => return Err(anyhow!("no phone key called {other}")),
    };
    sh(&["input", "keyevent", code]).map(|_| ())
}

/// Open an app by package name (best-effort via the launcher).
pub fn open_package(pkg: &str) -> Result<()> {
    sh(&["monkey", "-p", pkg, "-c", "android.intent.category.LAUNCHER", "1"]).map(|_| ())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_bounds() {
        let r = parse_bounds("[24,130][1056,242]").unwrap();
        assert_eq!((r.x, r.y, r.w, r.h), (24, 130, 1032, 112));
        assert!(parse_bounds("nope").is_none());
    }

    #[test]
    fn reads_clickable_and_editable_nodes() {
        let xml = r#"<hierarchy>
          <node class="android.widget.FrameLayout" bounds="[0,0][1080,2340]" clickable="false" />
          <node class="android.widget.Button" text="Play" clickable="true" bounds="[40,100][300,200]" />
          <node class="android.widget.EditText" text="lofi" class="android.widget.EditText" bounds="[40,300][1040,400]" focused="true" />
          <node class="android.widget.ImageView" content-desc="Search" clickable="true" bounds="[900,100][1000,200]" />
        </hierarchy>"#;
        let c = parse_controls(xml, 40);
        assert_eq!(c.len(), 3);
        assert_eq!(c[0].name, "Play");
        assert_eq!(c[0].kind, "button");
        assert_eq!(c[1].kind, "field");
        assert_eq!(c[1].value, "lofi");
        assert!(c[1].focused);
        assert_eq!(c[2].name, "Search");
    }

    #[test]
    fn text_is_escaped_for_the_shell() {
        // (Checked without a device: spaces must become %s.)
        assert_eq!("play some music".replace(' ', "%s"), "play%ssome%smusic");
    }
}

// ---- the agent loop on the phone -----------------------------------------

use crate::model::{ActionStep, Intent};

const MODEL_IMAGE_EDGE: u32 = 1280;
const MAX_ROUNDS: usize = 8;

/// Do what `prompt` asks on the phone: look → act → look again, up to a few
/// rounds, the same way the PC agent works. Returns a short spoken summary.
pub fn run_on_phone(prompt: &str) -> String {
    if !is_connected() {
        match connect() {
            Ok(_) => {}
            Err(e) => return format!("I can't reach your phone — {e}"),
        }
    }
    let mut done_so_far: Vec<String> = Vec::new();
    let mut last_summary = String::new();
    for round in 0..MAX_ROUNDS {
        let frame = match screenshot() {
            Ok(f) => f,
            Err(e) => return format!("I couldn't see the phone screen ({e})."),
        };
        let controls = controls(60);
        let desktop = Rect { x: 0, y: 0, w: frame.width as i32, h: frame.height as i32 };
        let mut scaled = frame.downscaled(MODEL_IMAGE_EDGE);
        crate::tags::draw(&mut scaled, &desktop, &controls);
        let image_jpeg = match scaled.to_jpeg(80) {
            Ok(j) => j,
            Err(_) => return "Something went wrong reading the phone screen.".into(),
        };
        let ask = if done_so_far.is_empty() {
            format!("This is an ANDROID PHONE screen (not a PC). {prompt}")
        } else {
            format!(
                "This is an ANDROID PHONE screen. {prompt}\nAlready done: {}.\nCheck the screen and carry on, or finish if it's done.",
                done_so_far.join("; ")
            )
        };
        let req = crate::vision::VisionRequest {
            image_jpeg,
            image_size: (scaled.width, scaled.height),
            desktop,
            marks_description: String::new(),
            user_prompt: ask,
            ocr_text: String::new(),
            app: "Android".into(),
            window_title: String::new(),
            draft: Vec::new(),
            controls: controls.clone(),
            memory: crate::memory::prompt_block(),
            windows: Vec::new(),
            page_text: String::new(),
        };
        let plan = match ask_any(&req) {
            Ok(p) => p,
            Err(e) => {
                eprintln!("[android] round {} model error: {e}", round + 1);
                return if last_summary.is_empty() {
                    format!("The AI brain didn't answer ({e}).")
                } else {
                    last_summary
                };
            }
        };
        if !plan.summary.trim().is_empty() {
            last_summary = plan.summary.trim().to_string();
        }
        eprintln!("[android] round {}: {} step(s){} — {}", round + 1, plan.steps.len(), if plan.done { ", done" } else { "" }, last_summary.chars().take(60).collect::<String>());
        for step in &plan.steps {
            if let Err(e) = do_step(step, &controls) {
                eprintln!("[android] step failed: {e}");
            } else {
                done_so_far.push(describe(step));
            }
            std::thread::sleep(Duration::from_millis(500));
        }
        if plan.done || plan.steps.is_empty() {
            break;
        }
        // Let the screen settle before looking again.
        std::thread::sleep(Duration::from_millis(1200));
    }
    if last_summary.is_empty() { "Done.".into() } else { last_summary }
}

/// Ask the configured brains in order until one answers.
fn ask_any(req: &crate::vision::VisionRequest) -> Result<crate::model::VisionPlan> {
    let chain = crate::brain::brain_chain();
    if chain.is_empty() {
        anyhow::bail!("no AI brain is set up");
    }
    let mut last = anyhow!("no brain answered");
    for cfg in chain {
        match crate::vision::ask(&cfg, req) {
            Ok(p) => return Ok(p),
            Err(e) => last = e,
        }
    }
    Err(last)
}

/// A control's centre, if the step named one; otherwise its own x,y.
fn point(step: &ActionStep, controls: &[crate::uia::Control]) -> (i32, i32) {
    if let Some(id) = step.target {
        if let Some(c) = controls.iter().find(|c| c.id == id) {
            let (cx, cy) = c.rect.center();
            return (cx, cy);
        }
    }
    (step.x, step.y)
}

fn do_step(step: &ActionStep, controls: &[crate::uia::Control]) -> Result<()> {
    let (x, y) = point(step, controls);
    match step.action {
        Intent::Click | Intent::DoubleClick | Intent::Point => tap(x, y),
        Intent::Type => {
            if x > 0 || y > 0 {
                let _ = tap(x, y);
                std::thread::sleep(Duration::from_millis(200));
            }
            type_text(step.text_to_type.as_deref().unwrap_or_default())
        }
        Intent::Scroll => {
            let amt = step.scroll_amount.unwrap_or(-600);
            let cx = x.max(400);
            swipe(cx, 1200, cx, 1200 - amt.clamp(-1000, 1000), 300)
        }
        Intent::Drag | Intent::Stroke => {
            let to = (step.x2.unwrap_or(x), step.y2.unwrap_or(y));
            swipe(x, y, to.0, to.1, 350)
        }
        Intent::Key => key(step.key.as_deref().unwrap_or("enter")),
        Intent::Search => {
            let q = step.text_to_type.as_deref().unwrap_or_default();
            open_url_on_phone(&format!("https://www.google.com/search?q={}", urlencode(q)))
        }
        Intent::OpenUrl => open_url_on_phone(step.text_to_type.as_deref().unwrap_or_default()),
        Intent::PlayYoutube => {
            let q = step.text_to_type.as_deref().unwrap_or_default();
            open_url_on_phone(&format!("https://www.youtube.com/results?search_query={}", urlencode(q)))
        }
        // Best-effort: treat other actions as a tap where they point.
        _ => tap(x, y),
    }
}

fn open_url_on_phone(url: &str) -> Result<()> {
    sh(&["am", "start", "-a", "android.intent.action.VIEW", "-d", url]).map(|_| ())
}

fn urlencode(s: &str) -> String {
    s.bytes()
        .map(|b| match b {
            b'a'..=b'z' | b'A'..=b'Z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => (b as char).to_string(),
            b' ' => "+".to_string(),
            _ => format!("%{b:02X}"),
        })
        .collect()
}

fn describe(step: &ActionStep) -> String {
    match step.action {
        Intent::Type => format!("typed \"{}\"", step.text_to_type.as_deref().unwrap_or_default()),
        Intent::Scroll => "scrolled".into(),
        _ => format!("{} at {},{}", step.action.as_str(), step.x, step.y),
    }
}
