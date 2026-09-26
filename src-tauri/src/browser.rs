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
    let w = WebviewWindowBuilder::new(app, LABEL, WebviewUrl::External("about:blank".parse().expect("url")))
        // Must match every other Izuki window, or WebView2 refuses to start.
        .additional_browser_args(crate::overlay::BROWSER_ARGS)
        .title("Izuki browser — sign in here once, then close this window")
        .inner_size(1180.0, 820.0)
        .visible(false)
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
    let r = run(&w, &format!(
        "(() => {{ const el = document.querySelector('[data-izk-n=\"{n}\"]'); if (!el) return 'missing'; \
         el.scrollIntoView({{block:'center'}}); el.click(); return 'ok'; }})()"
    ))?;
    if r.contains("missing") {
        return Err(anyhow!("there's no number {n} on the page any more — look again with [BROWSE: …]"));
    }
    std::thread::sleep(Duration::from_millis(900));
    settle(&w);
    snapshot(&w)
}

/// Type into field number `n` (and press Enter if `submit`).
pub fn type_into(n: u32, text: &str, submit: bool) -> Result<String> {
    let _one = BUSY.lock();
    let w = window()?;
    let value = serde_json::to_string(text)?;
    let r = run(&w, &format!(
        "(() => {{ const el = document.querySelector('[data-izk-n=\"{n}\"]'); if (!el) return 'missing'; \
         el.scrollIntoView({{block:'center'}}); el.focus(); const v = {value}; \
         if (el.isContentEditable) {{ el.textContent = v; }} else {{ \
           const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype; \
           Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v); }} \
         el.dispatchEvent(new Event('input', {{bubbles:true}})); el.dispatchEvent(new Event('change', {{bubbles:true}})); \
         if ({submit}) {{ const k = {{key:'Enter', code:'Enter', keyCode:13, which:13, bubbles:true}}; \
           el.dispatchEvent(new KeyboardEvent('keydown', k)); el.dispatchEvent(new KeyboardEvent('keyup', k)); \
           if (el.form) {{ el.form.requestSubmit ? el.form.requestSubmit() : el.form.submit(); }} }} \
         return 'ok'; }})()"
    ))?;
    if r.contains("missing") {
        return Err(anyhow!("there's no field number {n} on the page any more — look again"));
    }
    std::thread::sleep(Duration::from_millis(if submit { 1200 } else { 250 }));
    settle(&w);
    snapshot(&w)
}

/// Wait for the page to finish loading (and a moment for scripts to draw it).
fn settle(w: &WebviewWindow) {
    let start = Instant::now();
    while start.elapsed() < Duration::from_secs(20) {
        match run(w, "document.readyState") {
            Ok(s) if s.contains("complete") => break,
            _ => std::thread::sleep(Duration::from_millis(300)),
        }
    }
    std::thread::sleep(Duration::from_millis(1200));
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

const SNAPSHOT_JS: &str = r#"(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false;
    const cs = getComputedStyle(el); return cs.visibility !== 'hidden' && cs.display !== 'none'; };
  document.querySelectorAll('[data-izk-n]').forEach((e) => e.removeAttribute('data-izk-n'));
  const items = []; let n = 0;
  for (const el of document.querySelectorAll('a[href],button,input,textarea,select,[role=button],[role=link],[role=tab],[role=menuitem],[contenteditable=true]')) {
    if (items.length >= 70 || !vis(el)) continue;
    const t = (el.getAttribute('type') || '').toLowerCase();
    if (t === 'hidden') continue;
    const label = (el.innerText || el.value || el.getAttribute('aria-label') || el.placeholder || el.title || el.name || '')
      .trim().replace(/\s+/g, ' ').slice(0, 80);
    const field = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable;
    if (!label && !field) continue;
    n++; el.setAttribute('data-izk-n', String(n));
    const kind = el.tagName === 'A' ? 'link' : field ? 'field' + (t ? ':' + t : '') : el.tagName === 'SELECT' ? 'menu' : 'button';
    items.push(n + '. [' + kind + '] ' + (label || '(empty)'));
  }
  const text = (document.body ? document.body.innerText : '').replace(/\n{3,}/g, '\n\n').slice(0, 9000);
  const password = !!document.querySelector('input[type=password]');
  return JSON.stringify({ title: document.title || '', url: location.href, text, items, password });
})()"#;

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
