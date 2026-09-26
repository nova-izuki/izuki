//! "Call Izuki" — talk to Izuki hands-free from your phone, like a Gemini
//! Live call, for free.
//!
//! Izuki serves a small voice page from this PC, and a free Cloudflare
//! "quick tunnel" gives it a public https address (no account, nothing to
//! host). Open the link on your phone, tap once, and talk: the phone's own
//! speech recognition hears you and its own voice answers, so the only AI
//! used is the same free brain as everywhere else. The link carries a long
//! secret, so only someone who has it can open the page.
//!
//! The tunnel's address changes each time it starts, so the fresh link is
//! texted to the paired phone (telegram.rs) and shown in Settings.

use std::io::{BufRead, BufReader, Read};
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;

use parking_lot::Mutex;
use serde::Serialize;
use serde_json::{json, Value};
use tauri::{AppHandle, Emitter};

pub const CHANGED: &str = "izuki://call-changed";
const PAGE: &str = include_str!("call.html");
/// So "Add to Home Screen" gives a proper Izuki icon and name.
const ICON: &[u8] = include_bytes!("../icons/128x128@2x.png");
const MANIFEST: &str = r##"{"name":"Call Izuki","short_name":"Izuki","start_url":"./","scope":"./","display":"standalone","background_color":"#05060d","theme_color":"#05060d","icons":[{"src":"icon.png","sizes":"256x256","type":"image/png"}]}"##;
const CLOUDFLARED_URL: &str = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe";

#[derive(Debug, Clone, Default, Serialize)]
pub struct Status {
    /// "off", "downloading", "starting", "ready" or "error".
    pub state: String,
    /// The full link to open on the phone, once ready.
    pub link: String,
    pub error: Option<String>,
}

static STATUS: Mutex<Status> = Mutex::new(Status { state: String::new(), link: String::new(), error: None });
static TUNNEL: Mutex<Option<Child>> = Mutex::new(None);
static STARTED: AtomicBool = AtomicBool::new(false);

pub fn status() -> Status {
    let mut s = STATUS.lock().clone();
    if s.state.is_empty() {
        s.state = "off".into();
    }
    s
}

fn set(app: &AppHandle, state: &str, link: &str, error: Option<String>) {
    *STATUS.lock() = Status { state: state.into(), link: link.into(), error };
    let _ = app.emit(CHANGED, ());
}

/// Start the page server and keep the tunnel matching the setting. Once,
/// at startup; costs nothing while the setting is off.
pub fn spawn(app: AppHandle) {
    if STARTED.swap(true, Ordering::SeqCst) {
        return;
    }
    let server = match tiny_http::Server::http("127.0.0.1:0") {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[call] couldn't start the page server: {e}");
            return;
        }
    };
    let port = server.server_addr().to_ip().map(|a| a.port()).unwrap_or(0);
    eprintln!("[call] page server on 127.0.0.1:{port}");
    let serve_app = app.clone();
    std::thread::Builder::new()
        .name("izuki-call-http".into())
        .spawn(move || {
            for request in server.incoming_requests() {
                let app = serve_app.clone();
                std::thread::spawn(move || handle(&app, request));
            }
        })
        .ok();

    std::thread::Builder::new()
        .name("izuki-call-tunnel".into())
        .spawn(move || loop {
            let want = crate::state::store().settings().call_enabled;
            let running = TUNNEL.lock().as_mut().is_some_and(|c| matches!(c.try_wait(), Ok(None)));
            if want && !running {
                if let Err(e) = start_tunnel(&app, port) {
                    eprintln!("[call] tunnel: {e}");
                    set(&app, "error", "", Some(e.to_string()));
                    std::thread::sleep(Duration::from_secs(20));
                }
            } else if !want && TUNNEL.lock().is_some() {
                stop();
                set(&app, "off", "", None);
            }
            std::thread::sleep(Duration::from_secs(2));
        })
        .ok();
}

/// Shut the tunnel (setting off, or Izuki closing).
pub fn stop() {
    if let Some(mut c) = TUNNEL.lock().take() {
        let _ = c.kill();
        let _ = c.wait();
    }
}

fn cloudflared_path() -> PathBuf {
    let name = if cfg!(windows) { "cloudflared.exe" } else { "cloudflared" };
    crate::store::data_dir().join("bin").join(name)
}

/// Cloudflare's tunnel program, downloaded once (about 60 MB) from its
/// official GitHub releases.
fn ensure_cloudflared(app: &AppHandle) -> anyhow::Result<PathBuf> {
    let path = cloudflared_path();
    if path.exists() {
        return Ok(path);
    }
    if !cfg!(windows) {
        anyhow::bail!("install cloudflared first");
    }
    set(app, "downloading", "", None);
    eprintln!("[call] downloading cloudflared");
    let bytes = reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(600))
        .build()?
        .get(CLOUDFLARED_URL)
        .send()?
        .error_for_status()?
        .bytes()?;
    if bytes.len() < 1_000_000 {
        anyhow::bail!("the tunnel download looks broken — try again later");
    }
    std::fs::create_dir_all(path.parent().expect("bin dir"))?;
    let tmp = path.with_extension("download");
    std::fs::write(&tmp, &bytes)?;
    std::fs::rename(&tmp, &path)?;
    Ok(path)
}

fn start_tunnel(app: &AppHandle, port: u16) -> anyhow::Result<()> {
    let exe = ensure_cloudflared(app)?;
    set(app, "starting", "", None);
    let mut cmd = Command::new(exe);
    cmd.args(["tunnel", "--no-autoupdate", "--url", &format!("http://127.0.0.1:{port}")])
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::piped());
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x0800_0000); // CREATE_NO_WINDOW: no console pops up
    }
    let mut child = cmd.spawn()?;
    let stderr = child.stderr.take().ok_or_else(|| anyhow::anyhow!("no tunnel output"))?;
    *TUNNEL.lock() = Some(child);

    // cloudflared prints its address to stderr; keep reading so it never
    // blocks on a full pipe.
    let app = app.clone();
    std::thread::spawn(move || {
        let mut announced = false;
        for line in BufReader::new(stderr).lines().map_while(Result::ok) {
            if announced {
                continue;
            }
            if let Some(base) = find_tunnel_url(&line) {
                announced = true;
                let token = crate::state::store().settings().call_token;
                let link = format!("{base}/{token}/");
                eprintln!("[call] ready at {base}/…");
                set(&app, "ready", &link, None);
                crate::companion::notify_everywhere(&format!("📞 Call Izuki — open this on your phone and tap to talk:\n{link}"));
            }
        }
        if !announced {
            set(&app, "error", "", Some("The tunnel stopped before it was ready — is the internet on?".into()));
        }
    });
    Ok(())
}

fn find_tunnel_url(line: &str) -> Option<String> {
    let start = line.find("https://")?;
    let rest = &line[start..];
    let end = rest.find(|c: char| c.is_whitespace() || c == '|' || c == '"').unwrap_or(rest.len());
    let url = rest[..end].trim_end_matches('/');
    url.ends_with(".trycloudflare.com").then(|| url.to_string())
}

// ---------------------------------------------------------------------------
// The page and its two calls
// ---------------------------------------------------------------------------

fn handle(app: &AppHandle, mut req: tiny_http::Request) {
    let token = crate::state::store().settings().call_token;
    let url = req.url().split('?').next().unwrap_or("").to_string();
    let base = format!("/{token}");
    let path = url.strip_prefix(&base).filter(|_| token.len() >= 20);
    let method = req.method().clone();

    let respond = |req: tiny_http::Request, code: u16, ctype: &str, body: Vec<u8>| {
        let mut r = tiny_http::Response::from_data(body).with_status_code(code);
        if let Ok(h) = tiny_http::Header::from_bytes("Content-Type", ctype) {
            r.add_header(h);
        }
        if let Ok(h) = tiny_http::Header::from_bytes("Cache-Control", "no-store") {
            r.add_header(h);
        }
        cors(&mut r);
        let _ = req.respond(r);
    };
    let json_reply = |req: tiny_http::Request, v: Value| respond(req, 200, "application/json", v.to_string().into_bytes());

    match (method, path) {
        // The Izuki phone app (another web address) asking first.
        (tiny_http::Method::Options, Some(_)) => {
            let mut r = tiny_http::Response::empty(204);
            cors(&mut r);
            let _ = req.respond(r);
        }
        (tiny_http::Method::Get, Some("")) => {
            let r = tiny_http::Response::empty(302)
                .with_header(tiny_http::Header::from_bytes("Location", format!("{base}/")).expect("header"));
            let _ = req.respond(r);
        }
        (tiny_http::Method::Get, Some("/")) => respond(req, 200, "text/html; charset=utf-8", PAGE.as_bytes().to_vec()),
        (tiny_http::Method::Get, Some("/icon.png")) => respond(req, 200, "image/png", ICON.to_vec()),
        (tiny_http::Method::Get, Some("/manifest.webmanifest")) => {
            respond(req, 200, "application/manifest+json", MANIFEST.as_bytes().to_vec())
        }
        (tiny_http::Method::Post, Some("/talk")) => {
            let mut body = String::new();
            let _ = req.as_reader().take(64 * 1024).read_to_string(&mut body);
            let asked = serde_json::from_str::<Value>(&body).unwrap_or(Value::Null);
            let said = asked["text"].as_str().map(|s| s.trim().to_string()).unwrap_or_default();
            // The call page wants the reply as audio too: the phone's own
            // voice is silenced by the iPhone's silent switch, a file isn't.
            let want_voice = asked["voice"].as_bool().unwrap_or(false);
            if said.is_empty() {
                return json_reply(req, json!({ "text": "", "links": [] }));
            }
            eprintln!("[call] heard: {}", said.chars().take(80).collect::<String>());
            let reply = if matches!(said.to_lowercase().trim_matches(|c: char| !c.is_alphanumeric()), "stop" | "stop it" | "cancel") {
                crate::brain::cancel_task();
                let _ = app.emit(crate::events::STOP_SPEAKING, ());
                crate::companion::Reply { text: "Stopped.".into(), links: Vec::new() }
            } else {
                crate::companion::respond(app, &said, true, &|_| {})
            };
            let audio = if want_voice {
                let settings = crate::state::store().settings();
                match crate::tts::speak_to_wav(&settings, &reply.text) {
                    Ok(wav) => {
                        use base64::Engine;
                        Some(base64::engine::general_purpose::STANDARD.encode(wav))
                    }
                    Err(e) => {
                        eprintln!("[call] no voice for the reply: {e}");
                        None
                    }
                }
            } else {
                None
            };
            json_reply(req, json!({ "text": reply.text, "links": reply.links, "audio": audio }))
        }
        (tiny_http::Method::Post, Some("/hear")) => {
            // For phones whose browser has no speech recognition: the
            // recording comes here and the cloud ears transcribe it.
            let mime = req
                .headers()
                .iter()
                .find(|h| h.field.equiv("Content-Type"))
                .map(|h| h.value.as_str().split(';').next().unwrap_or("audio/webm").trim().to_string())
                .unwrap_or_else(|| "audio/webm".into());
            let mut audio = Vec::new();
            let _ = req.as_reader().take(8 * 1024 * 1024).read_to_end(&mut audio);
            let settings = crate::state::store().settings();
            let ext = if mime.contains("mp4") || mime.contains("m4a") { "m4a" } else if mime.contains("ogg") { "ogg" } else { "webm" };
            match crate::stt::transcribe_clip(&settings, audio, &mime, &format!("speech.{ext}")) {
                Ok(text) => json_reply(req, json!({ "text": text })),
                Err(_) => json_reply(req, json!({ "text": "", "error": "Add a free Gemini key in Izuki so I can hear you on this phone." })),
            }
        }
        _ => respond(req, 404, "text/plain", b"Not found".to_vec()),
    }
}

/// Let the Izuki phone app (served from its own web address) call `talk`
/// and `hear`. The secret in the link is what keeps others out.
fn cors<R: std::io::Read>(r: &mut tiny_http::Response<R>) {
    for (k, v) in [
        ("Access-Control-Allow-Origin", "*"),
        ("Access-Control-Allow-Methods", "GET, POST, OPTIONS"),
        ("Access-Control-Allow-Headers", "Content-Type"),
        ("Access-Control-Max-Age", "86400"),
    ] {
        if let Ok(h) = tiny_http::Header::from_bytes(k, v) {
            r.add_header(h);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::find_tunnel_url;

    #[test]
    fn finds_the_quick_tunnel_address() {
        let line = "2026-09-26T10:00:00Z INF |  https://calm-otter-lake.trycloudflare.com                     |";
        assert_eq!(find_tunnel_url(line).as_deref(), Some("https://calm-otter-lake.trycloudflare.com"));
        assert!(find_tunnel_url("INF Requesting new quick Tunnel on trycloudflare.com...").is_none());
        assert!(find_tunnel_url("see https://www.cloudflare.com/website-terms/").is_none());
    }
}
