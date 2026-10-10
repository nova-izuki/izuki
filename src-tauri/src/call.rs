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
use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};
use std::sync::Arc;
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

/// Cloudflared is about 60 MB, so anything much smaller is a download that was
/// cut short, an error page saved as the file, or a program Windows blocked.
/// Either way it's re-fetched instead of being trusted — a bad file used to
/// leave the call line broken for good, with nothing the user could do but
/// reinstall the app.
const MIN_CLOUDFLARED_BYTES: u64 = 1_000_000;

fn usable(path: &std::path::Path) -> bool {
    std::fs::metadata(path).is_ok_and(|m| m.len() > MIN_CLOUDFLARED_BYTES)
}

/// Cloudflare's tunnel program, downloaded once (about 60 MB) from its
/// official GitHub releases.
fn ensure_cloudflared(app: &AppHandle) -> anyhow::Result<PathBuf> {
    let path = cloudflared_path();
    if usable(&path) {
        return Ok(path);
    }
    if !cfg!(windows) {
        anyhow::bail!("install cloudflared first");
    }
    if path.exists() {
        eprintln!("[call] the saved cloudflared is broken — downloading it again");
        let _ = std::fs::remove_file(&path);
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
    if (bytes.len() as u64) <= MIN_CLOUDFLARED_BYTES {
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
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x0800_0000); // CREATE_NO_WINDOW: no console pops up
    }
    let mut child = cmd.spawn()?;
    let stderr = child.stderr.take();
    let stdout = child.stdout.take();
    *TUNNEL.lock() = Some(child);

    // Cloudflared prints its address as it starts — but which of its two output
    // streams that lands on has moved between releases, so both are read and
    // both are kept drained, or the child blocks on a full pipe. Whatever it
    // complains about is kept too, so the reason a call line wouldn't start is
    // shown instead of a bare "it didn't work".
    let announced = Arc::new(AtomicBool::new(false));
    let closed = Arc::new(AtomicUsize::new(0));
    let watching = usize::from(stderr.is_some()) + usize::from(stdout.is_some());
    for stream in [stdout.map(Stream::Out), stderr.map(Stream::Err)] {
        let Some(stream) = stream else { continue };
        let (announced, closed) = (Arc::clone(&announced), Arc::clone(&closed));
        let app = app.clone();
        std::thread::spawn(move || {
            let mut complaint = String::new();
            for line in BufReader::new(stream.reader()).lines().map_while(Result::ok) {
                if announced.load(Ordering::SeqCst) {
                    continue;
                }
                if let Some(base) = find_tunnel_url(&line) {
                    announced.store(true, Ordering::SeqCst);
                    let token = crate::state::store().settings().call_token;
                    let link = format!("{base}/{token}/");
                    eprintln!("[call] ready at {base}/…");
                    set(&app, "ready", &link, None);
                    crate::companion::notify_everywhere(&format!("📞 Call Izuki — open this on your phone and tap to talk:\n{link}"));
                    continue;
                }
                if looks_like_a_complaint(&line) {
                    complaint = line;
                }
            }
            // Only a tunnel that got no address *and* finished saying why is
            // worth reporting; the other stream may still be opening.
            if closed.fetch_add(1, Ordering::SeqCst) + 1 == watching && !announced.load(Ordering::SeqCst) {
                let why = if complaint.is_empty() {
                    "The tunnel stopped before it was ready — is the internet on?".to_string()
                } else {
                    complaint
                };
                eprintln!("[call] tunnel never opened: {why}");
                set(&app, "error", "", Some(why));
            }
        });
    }
    Ok(())
}

/// Either of cloudflared's two output streams, so both can be read the same way.
enum Stream {
    Out(std::process::ChildStdout),
    Err(std::process::ChildStderr),
}

impl Stream {
    fn reader(self) -> impl Read {
        match self {
            Stream::Out(o) => Box::new(o) as Box<dyn Read + Send>,
            Stream::Err(e) => Box::new(e) as Box<dyn Read + Send>,
        }
    }
}

/// The lines worth showing the user when the line never opens: an error or a
/// refused connection, not the cheerful banner it prints while starting.
fn looks_like_a_complaint(line: &str) -> bool {
    let lower = line.to_lowercase();
    lower.contains("err")
        || lower.contains("fail")
        || lower.contains("unable to")
        || lower.contains("could not")
        || lower.contains("denied")
        || lower.contains("refused")
        || lower.contains("rate")
        || lower.contains("try again")
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
    if !crate::state::store().settings().call_enabled {
        let _ = req.respond(tiny_http::Response::from_string("Phone connection is switched off").with_status_code(503));
        return;
    }
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
        (tiny_http::Method::Get, Some("/health")) => json_reply(req, json!({ "ok": true, "service": "izuki", "version": env!("CARGO_PKG_VERSION") })),
        // The conversation so far, so a reopened call picks up where it was
        // (words only — pictures stay on the PC).
        (tiny_http::Method::Get, Some("/history")) => {
            let history: Vec<_> = crate::companion::HISTORY
                .lock()
                .iter()
                .filter(|t| t.role == "user" || t.role == "assistant")
                .map(|t| json!({ "role": t.role, "content": t.content }))
                .collect();
            json_reply(req, json!(history))
        }
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
        // What the call page can rely on: can the PC turn a clip into words?
        (tiny_http::Method::Get, Some("/caps")) => {
            let settings = crate::state::store().settings();
            json_reply(req, json!({ "hear": crate::stt::has_key(&settings) }))
        }
        // "Set me up from my PC": the phone app (through the private link it
        // already has) asks for a copy of the setup; the PC asks the user first.
        (tiny_http::Method::Post, Some("/link")) => {
            let mut body = String::new();
            let _ = req.as_reader().take(16 * 1024).read_to_string(&mut body);
            let asked = serde_json::from_str::<Value>(&body).unwrap_or(Value::Null);
            let name = asked["name"].as_str().unwrap_or("My phone");
            let kind = asked["kind"].as_str().unwrap_or("phone");
            let code = asked["code"].as_str().unwrap_or("");
            json_reply(req, crate::link::link_request(name, kind, code))
        }
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
                match crate::tts::speak_audio(&settings, &reply.text) {
                    Ok((bytes, kind)) => {
                        use base64::Engine;
                        Some((base64::engine::general_purpose::STANDARD.encode(bytes), kind))
                    }
                    Err(e) => {
                        eprintln!("[call] no voice for the reply: {e}");
                        None
                    }
                }
            } else {
                None
            };
            let (audio, audio_type) = match audio {
                Some((a, t)) => (Some(a), Some(t)),
                None => (None, None),
            };
            json_reply(req, json!({ "text": reply.text, "links": reply.links, "audio": audio, "audio_type": audio_type }))
        }
        // Anything that can send a web request — an n8n workflow, Zapier,
        // IFTTT, a script — can hand Izuki a heads-up:
        // POST {link}notify  {"title": "…", "text": "…"}
        (tiny_http::Method::Post, Some("/notify")) => {
            let mut body = String::new();
            let _ = req.as_reader().take(16 * 1024).read_to_string(&mut body);
            let v = serde_json::from_str::<Value>(&body).unwrap_or_else(|_| json!({ "text": body.trim() }));
            let text = v["text"].as_str().or(v["message"].as_str()).unwrap_or("").trim().chars().take(1500).collect::<String>();
            if text.is_empty() {
                return respond(req, 400, "application/json", br#"{"ok":false,"error":"send {\"text\": \"...\"}"}"#.to_vec());
            }
            let title = v["title"].as_str().unwrap_or("Heads-up").trim().chars().take(80).collect::<String>();
            crate::headsup::deliver(app, &title, &text);
            json_reply(req, json!({ "ok": true }))
        }
        // Something went wrong on the phone (an error, the voice never
        // finishing): into the PC's log and the bug tracker (bugs.rs).
        (tiny_http::Method::Post, Some("/bug")) => {
            let mut body = String::new();
            let _ = req.as_reader().take(16 * 1024).read_to_string(&mut body);
            let v = serde_json::from_str::<Value>(&body).unwrap_or_else(|_| json!({ "message": body.trim() }));
            let msg = v["message"].as_str().unwrap_or("").trim().chars().take(2000).collect::<String>();
            if !msg.is_empty() {
                let phone = v["phone"].as_str().unwrap_or("").chars().take(120).collect::<String>();
                eprintln!("[bug] call page: {msg} ({phone})");
            }
            json_reply(req, json!({ "ok": true }))
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
    use super::{find_tunnel_url, looks_like_a_complaint};

    #[test]
    fn finds_the_quick_tunnel_address() {
        let line = "2026-09-26T10:00:00Z INF |  https://calm-otter-lake.trycloudflare.com                     |";
        assert_eq!(find_tunnel_url(line).as_deref(), Some("https://calm-otter-lake.trycloudflare.com"));
        assert!(find_tunnel_url("INF Requesting new quick Tunnel on trycloudflare.com...").is_none());
        assert!(find_tunnel_url("see https://www.cloudflare.com/website-terms/").is_none());
    }

    #[test]
    fn keeps_the_address_whichever_stream_it_arrives_on() {
        // Cloudflared has printed this on stdout and stderr in different
        // releases; both have to be read or the link never appears.
        let url = "https://quiet-river-fern.trycloudflare.com";
        for line in [format!("INF |  {url}  |"), format!("{url}\n"), format!("INF Your quick Tunnel: {url}")] {
            assert_eq!(find_tunnel_url(&line).as_deref(), Some(url), "{line}");
        }
    }

    #[test]
    fn a_broken_tunnel_explains_itself() {
        // The reason the line didn't open is shown, not swallowed.
        for line in [
            "2026-09-26T10:00:00Z ERR failed to create tunnel: too many active quick tunnels",
            "2026-09-26T10:00:00Z INF Unable to reach the origin service",
            "2026-09-26T10:00:00Z ERR connection refused",
            "2026-09-26T10:00:00Z WRN rate limited, try again shortly",
        ] {
            assert!(looks_like_a_complaint(line), "{line}");
        }
        // The cheerful banner it prints while starting is not an error.
        for line in [
            "INF Thank you for trying Cloudflare Tunnel.",
            "INF +----------------------------------------+",
            "INF Your quick Tunnel has been created!",
            "INF Cannot determine default configuration path.",
        ] {
            assert!(!looks_like_a_complaint(line), "{line}");
        }
    }
}
