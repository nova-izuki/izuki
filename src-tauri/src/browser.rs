//! The Izuki browser — the "Selenium" part. A hidden browser window, inside
//! Izuki itself, where the user signs in once (Blackboard, NotebookLM, their
//! bank's statements page, a shop…) and Izuki can then open pages, read
//! them, click and type — in the background, while they do something else.
//!
//! Nothing to install: it's WebView2, the browser engine built into Windows
//! 10 and 11 that Izuki's own windows already run on, with its own saved
//! sign-ins (kept on this PC, like any browser's). The chat drives it with
//! tags — [BROWSE: url], [CLICK: n], [TYPE: n | text] — see chat.rs.
//!
//! The pages it opens get no access to Izuki itself: only Izuki's own
//! windows are listed in capabilities/default.json.

use std::sync::OnceLock;
use std::time::{Duration, Instant};

use anyhow::{anyhow, Result};
use serde::Deserialize;
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindow, WebviewWindowBuilder};

pub const LABEL: &str = "browser";
static APP: OnceLock<AppHandle> = OnceLock::new();
/// One page at a time: the chat and the phone share this browser.
static BUSY: parking_lot::Mutex<()> = parking_lot::Mutex::new(());

pub fn init(app: &AppHandle) {
    let _ = APP.set(app.clone());
}

fn app() -> Result<&'static AppHandle> {
    APP.get().ok_or_else(|| anyhow!("the Izuki browser isn't ready yet"))
}

/// The browser window, made (hidden) the first time it's needed.
fn window() -> Result<WebviewWindow> {
    let app = app()?;
    if let Some(w) = app.get_webview_window(LABEL) {
        return Ok(w);
    }
    // The first opening has a useful search page. Subsequent show(None) calls
    // retain the existing tab and its signed-in context.
    let w = WebviewWindowBuilder::new(app, LABEL, WebviewUrl::External("https://www.google.com/".parse().expect("url")))
        // Must match every other Izuki window, or WebView2 refuses to start.
        .additional_browser_args(crate::overlay::BROWSER_ARGS)
        .title("Izuki browser — sign in here once, then close this window")
        .inner_size(1180.0, 820.0)
        .visible(false)
        .focused(false)
        .initialization_script(include_str!("browser-page.js"))
        .build()?;
    Ok(w)
}

/// Show it so the user can sign in (Apps tab → "Open the Izuki browser").
pub fn show(url: Option<&str>) -> Result<()> {
    let w = window()?;
    if let Some(u) = url.filter(|u| !u.trim().is_empty()) {
        w.navigate(normalise(u).parse()?)?;
    }
    w.show()?;
    w.unminimize().ok();
    w.set_focus().ok();
    Ok(())
}

/// Closing it only hides it — the sign-ins and the page stay.
pub fn hide() {
    if let Some(w) = APP.get().and_then(|a| a.get_webview_window(LABEL)) {
        let _ = w.hide();
    }
}

/// No window creation or navigation: only adjust media in an existing page.
pub fn duck_media(on: bool) {
    if let Some(w) = APP.get().and_then(|a| a.get_webview_window(LABEL)) {
        let _ = w.eval(format!("window.__izukiPage?.duckMedia({on})"));
    }
}

#[cfg(windows)]
pub fn native_window() -> Option<isize> {
    APP.get()?.get_webview_window(LABEL)?.hwnd().ok().map(|h| h.0 as isize)
}

fn normalise(u: &str) -> String {
    let u = u.trim().trim_matches(|c| c == '<' || c == '>');
    if u.starts_with("http://") || u.starts_with("https://") {
        u.to_string()
    } else {
        format!("https://{u}")
    }
}

// ---------------------------------------------------------------------------
// What the chat can do
// ---------------------------------------------------------------------------

/// Open a page and read it.
pub fn browse(url: &str) -> Result<String> {
    let _one = BUSY.lock();
    let w = window()?;
    w.navigate(normalise(url).parse()?)?;
    std::thread::sleep(Duration::from_millis(400));
    settle(&w);
    snapshot(&w)
}

/// Click thing number `n` from the last look, then read what's there now.
pub fn click(n: u32) -> Result<String> {
    let _one = BUSY.lock();
    let w = window()?;
    let result = run(&w, &format!("window.__izukiPage.click({n})"))?;
    if result != "ok" { return Err(anyhow!("{result}")); }
    settle(&w);
    snapshot(&w)
}

/// Type into the exact field from the last snapshot.
pub fn type_into(n: u32, text: &str, submit: bool) -> Result<String> {
    let _one = BUSY.lock();
    let w = window()?;
    let value = serde_json::to_string(text)?;
    let result = run(&w, &format!("window.__izukiPage.type({n}, {value}, {submit})"))?;
    if result != "ok" { return Err(anyhow!("{result}")); }
    settle(&w);
    snapshot(&w)
}

/// Control the largest visible video and return its measured state.
pub fn video(action: &str, show_window: bool) -> Result<serde_json::Value> {
    video_checked(action, show_window, None)
}

pub fn video_checked(action: &str, show_window: bool, expected_video: Option<&str>) -> Result<serde_json::Value> {
    if !["read", "pause", "play", "slow", "normal"].contains(&action) {
        return Err(anyhow!("unknown video action"));
    }
    let _one = BUSY.lock();
    let w = window()?;
    if show_window { w.show()?; w.unminimize().ok(); w.set_focus().ok(); }
    let encoded = serde_json::to_string(action)?;
    let expected = serde_json::to_string(&expected_video)?;
    let raw = run(&w, &format!("window.__izukiPage.video({encoded}, {expected})"))?;
    let mut value: serde_json::Value = serde_json::from_str(&raw)?;
    if !value["error"].is_null() { return Err(anyhow!("{}", value["error"].as_str().unwrap_or("video unavailable"))); }
    if action == "play" {
        std::thread::sleep(Duration::from_millis(200));
        value = serde_json::from_str(&run(&w, "window.__izukiPage.video('read')")?)?;
        if value["paused"] == true { return Err(anyhow!("Tap Play in the video once; this site needs a user gesture.")); }
    }
    value["focused"] = serde_json::json!(w.is_focused().unwrap_or(false));
    if let Ok(origin) = w.inner_position() {
        let bounds = &value["bounds"];
        let scale = bounds["scale"].as_f64().unwrap_or(1.0).clamp(0.5, 8.0);
        let rect = crate::model::Rect {
            x: origin.x + (bounds["x"].as_f64().unwrap_or(0.0) * scale).round() as i32,
            y: origin.y + (bounds["y"].as_f64().unwrap_or(0.0) * scale).round() as i32,
            w: (bounds["w"].as_f64().unwrap_or(0.0) * scale).round() as i32,
            h: (bounds["h"].as_f64().unwrap_or(0.0) * scale).round() as i32,
        };
        if rect.w > 10 && rect.h > 10 { value["screen_rect"] = serde_json::to_value(rect)?; }
    }
    Ok(value)
}

/// Wait for two stable page readings, bounded to avoid needless delays.
fn settle(w: &WebviewWindow) {
    let start = Instant::now();
    let mut previous = String::new();
    let mut calm = 0;
    while start.elapsed() < Duration::from_secs(8) {
        std::thread::sleep(Duration::from_millis(200));
        let Ok(state) = run(w, "document.readyState === 'complete' ? location.href + '|' + (document.body?.innerText || '').slice(0, 9000) : ''") else { break };
        if !state.is_empty() && state == previous { calm += 1; } else { calm = 0; }
        previous = state;
        if calm >= 2 { break; }
    }
}

#[derive(Deserialize)]
struct Snap {
    title: String,
    url: String,
    text: String,
    items: Vec<String>,
    password: bool,
}

/// The page as the chat reads it: what it says, then everything it can use.
fn snapshot(w: &WebviewWindow) -> Result<String> {
    let raw = run(w, SNAPSHOT_JS)?;
    let snap: Snap = serde_json::from_str(&raw).map_err(|_| anyhow!("couldn't read that page"))?;
    let mut s = format!("Page: {} ({})\n{}\n", snap.title.trim(), snap.url, crate::web::clip(snap.text.trim(), crate::web::PAGE_CHARS));
    if !snap.items.is_empty() {
        s.push_str("\nThings on the page (use with [CLICK: n] or [TYPE: n | text]):\n");
        s.push_str(&snap.items.join("\n"));
        s.push('\n');
    }
    if snap.password {
        s.push_str(
            "\n(This page wants a sign-in. Never ask for or type their password — tell them to open \
             the Izuki browser from Izuki → Apps and sign in once; after that you can read it.)\n",
        );
    }
    Ok(s)
}

const SNAPSHOT_JS: &str = "window.__izukiPage.snapshot()";

// ---------------------------------------------------------------------------
// Running a script in the page and getting its answer back
// ---------------------------------------------------------------------------

/// Run `script` in the page; its value, as text.
#[cfg(windows)]
fn run(w: &WebviewWindow, script: &str) -> Result<String> {
    use std::sync::mpsc;
    let (tx, rx) = mpsc::channel::<std::result::Result<String, String>>();
    let script = script.to_string();
    w.with_webview(move |pw| unsafe {
        use webview2_com::{CoTaskMemPWSTR, ExecuteScriptCompletedHandler};
        let core = match pw.controller().CoreWebView2() {
            Ok(c) => c,
            Err(e) => {
                let _ = tx.send(Err(e.to_string()));
                return;
            }
        };
        let text = CoTaskMemPWSTR::from(script.as_str());
        let done = tx.clone();
        let handler = ExecuteScriptCompletedHandler::create(Box::new(move |hr, result| {
            let _ = done.send(hr.map(|_| result).map_err(|e| e.to_string()));
            Ok(())
        }));
        if let Err(e) = core.ExecuteScript(*text.as_ref().as_pcwstr(), &handler) {
            let _ = tx.send(Err(e.to_string()));
        }
    })?;
    let json = rx
        .recv_timeout(Duration::from_secs(15))
        .map_err(|_| anyhow!("the page took too long to answer"))?
        .map_err(|e| anyhow!("the page refused: {e}"))?;
    // The answer comes JSON-encoded: a string arrives in quotes.
    Ok(serde_json::from_str::<String>(&json).unwrap_or(json))
}

#[cfg(not(windows))]
fn run(_: &WebviewWindow, _: &str) -> Result<String> {
    Err(anyhow!("the Izuki browser needs Windows"))
}
