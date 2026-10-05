//! The home link: how Izuki's phone and TV apps find this PC on the Wi-Fi
//! and get set up from it — one setup for everything.
//!
//! A small server on port 47616, on the home network only, and only while
//! "Let my phone and TV link to this PC" is on. A device says hello, asks to
//! link, and this PC asks the user — a box on top of everything, showing the
//! same 4-digit code the device shows. On Allow, the device gets a pass and
//! a copy of the setup: the AI brains and their keys, the apps key
//! (Composio), the voice and character, the orb, and what Izuki remembers —
//! so it works by itself afterwards, even with this PC switched off.
//!
//! With the pass it can also: follow along (the orb's state and words, to
//! mirror on a TV), hand a request to this PC, and say "I just heard the
//! wake word" so the two don't both answer.

use std::collections::{HashMap, VecDeque};
use std::io::Read;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::time::{Duration, Instant};

use parking_lot::{Condvar, Mutex};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::{AppHandle, Emitter};

pub const PORT: u16 = 47616;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct LinkedDevice {
    pub name: String,
    /// "phone" or "tv".
    pub kind: String,
    pub token: String,
    #[serde(default)]
    pub added: u64,
}

static RUNNING: AtomicBool = AtomicBool::new(false);
static ASKING: AtomicBool = AtomicBool::new(false);

/// What Izuki is doing, for devices following along: (number, state, words).
static EVENTS: Mutex<VecDeque<(u64, String, String)>> = Mutex::new(VecDeque::new());
static EVENT_SEQ: AtomicU64 = AtomicU64::new(0);
static NEW_EVENT: Condvar = Condvar::new();
static EVENT_WAIT: Mutex<()> = Mutex::new(());

/// Spoken lines for the TV to play, by id (the Roku channel fetches them).
static AUDIO: Mutex<Vec<(String, Vec<u8>, &'static str, Instant)>> = Mutex::new(Vec::new());

/// Keep the server up while the setting is on (checked every few seconds).
pub fn spawn(app: AppHandle) {
    std::thread::spawn(move || loop {
        let on = crate::state::try_store().is_some_and(|s| s.settings().lan_link);
        if on && !RUNNING.load(Ordering::SeqCst) {
            start(app.clone());
        }
        std::thread::sleep(Duration::from_secs(3));
    });
}

fn start(app: AppHandle) {
    let Ok(server) = tiny_http::Server::http(("0.0.0.0", PORT)) else {
        eprintln!("[link] port {PORT} is busy — phone/TV link off");
        std::thread::sleep(Duration::from_secs(30));
        return;
    };
    RUNNING.store(true, Ordering::SeqCst);
    eprintln!("[link] phone/TV link on at {}:{PORT}", lan_ip().unwrap_or_default());
    std::thread::spawn(move || {
        for req in server.incoming_requests() {
            let on = crate::state::try_store().is_some_and(|s| s.settings().lan_link);
            if !on {
                let _ = req.respond(tiny_http::Response::from_string("off").with_status_code(503));
                continue;
            }
            let app = app.clone();
            std::thread::spawn(move || handle(&app, req));
        }
        RUNNING.store(false, Ordering::SeqCst);
    });
}

/// This PC's address on the home network ("192.168.1.20").
pub fn lan_ip() -> Option<String> {
    let s = std::net::UdpSocket::bind("0.0.0.0:0").ok()?;
    s.connect("8.8.8.8:80").ok()?;
    Some(s.local_addr().ok()?.ip().to_string())
}

pub fn running() -> bool {
    RUNNING.load(Ordering::SeqCst)
}

fn reply(v: Value) -> tiny_http::Response<std::io::Cursor<Vec<u8>>> {
    tiny_http::Response::from_string(v.to_string())
        .with_header(tiny_http::Header::from_bytes(&b"Content-Type"[..], &b"application/json"[..]).expect("header"))
        .with_header(tiny_http::Header::from_bytes(&b"Access-Control-Allow-Origin"[..], &b"*"[..]).expect("header"))
        .with_header(tiny_http::Header::from_bytes(&b"Access-Control-Allow-Headers"[..], &b"*"[..]).expect("header"))
}

fn device_for(req: &tiny_http::Request) -> Option<LinkedDevice> {
    let auth = req.headers().iter().find(|h| h.field.to_string().eq_ignore_ascii_case("Authorization"))?.value.as_str().to_string();
    let token = auth.trim().strip_prefix("Bearer ")?.trim().to_string();
    if token.len() < 20 {
        return None;
    }
    crate::state::try_store()?.settings().linked_devices.into_iter().find(|d| d.token == token)
}

fn handle(app: &AppHandle, mut req: tiny_http::Request) {
    let url = req.url().to_string();
    let path = url.split('?').next().unwrap_or("").to_string();
    if req.method() == &tiny_http::Method::Options {
        let _ = req.respond(reply(json!({})));
        return;
    }
    let mut body = String::new();
    let _ = req.as_reader().take(200_000).read_to_string(&mut body);
    let body: Value = serde_json::from_str(&body).unwrap_or(Value::Null);

    // Open to the home network: who's here, and asking to link.
    if path == "/izuki/hello" {
        let name = std::env::var("COMPUTERNAME").unwrap_or_else(|_| "this PC".into());
        let _ = req.respond(reply(json!({ "service": "izuki", "name": name, "version": env!("CARGO_PKG_VERSION") })));
        return;
    }
    if let Some(id) = path.strip_prefix("/izuki/say/") {
        let found = AUDIO.lock().iter().find(|(k, ..)| k == id).map(|(_, b, t, _)| (b.clone(), *t));
        let _ = match found {
            Some((bytes, kind)) => req.respond(
                tiny_http::Response::from_data(bytes).with_header(tiny_http::Header::from_bytes(&b"Content-Type"[..], kind.as_bytes()).expect("header")),
            ),
            None => req.respond(tiny_http::Response::from_string("gone").with_status_code(404)),
        };
        return;
    }
    if path == "/izuki/link" {
        let r = link_request(body["name"].as_str().unwrap_or("A device"), body["kind"].as_str().unwrap_or("phone"), body["code"].as_str().unwrap_or(""));
        let _ = req.respond(reply(r));
        return;
    }


    // Everything else needs the pass from linking.
    let Some(device) = device_for(&req) else {
        let _ = req.respond(reply(json!({ "ok": false, "error": "not linked" })).with_status_code(401));
        return;
    };
    match path.as_str() {
        "/izuki/setup" => {
            let _ = req.respond(reply(json!({ "ok": true, "setup": setup() })));
        }
        "/izuki/events" => {
            let after: u64 = url.split("after=").nth(1).and_then(|v| v.split('&').next()).and_then(|v| v.parse().ok()).unwrap_or(0);
            let until = Instant::now() + Duration::from_secs(20);
            loop {
                let fresh: Vec<Value> = EVENTS
                    .lock()
                    .iter()
                    .filter(|(n, ..)| *n > after)
                    .map(|(n, s, t)| json!({ "n": n, "state": s, "text": t }))
                    .collect();
                if !fresh.is_empty() || Instant::now() >= until {
                    let _ = req.respond(reply(json!({ "events": fresh, "last": EVENT_SEQ.load(Ordering::SeqCst) })));
                    return;
                }
                let mut g = EVENT_WAIT.lock();
                NEW_EVENT.wait_for(&mut g, Duration::from_secs(2));
            }
        }
        "/izuki/talk" => {
            let said = body["text"].as_str().unwrap_or("").trim().to_string();
            let text = if said.is_empty() {
                "I didn't catch that.".to_string()
            } else {
                eprintln!("[link] {} asks: {}", device.name, said.chars().take(80).collect::<String>());
                crate::companion::respond(app, &said, true, &|_| {}).text
            };
            let _ = req.respond(reply(json!({ "ok": true, "text": text })));
        }
        "/izuki/woke" => {
            // The device heard "Hey Nova": this PC stays quiet for a moment.
            let _ = app.emit("izuki://wake-elsewhere", device.name.clone());
            let _ = req.respond(reply(json!({ "ok": true })));
        }
        "/izuki/unlink" => {
            let store = crate::state::store();
            let mut s = store.settings();
            s.linked_devices.retain(|d| d.token != device.token);
            store.set_settings(s);
            crate::state::settings_changed_elsewhere();
            let _ = req.respond(reply(json!({ "ok": true })));
        }
        _ => {
            let _ = req.respond(reply(json!({ "ok": false })).with_status_code(404));
        }
    }
}

/// A phone or TV asking to link (over the home Wi-Fi, or through the
/// private Call Izuki link): the user decides on the PC.
pub fn link_request(name: &str, kind: &str, code: &str) -> Value {
    let name: String = name.chars().filter(|c| !c.is_control()).take(40).collect();
    let kind = if kind == "tv" { "tv" } else { "phone" };
    let code: String = code.chars().filter(|c| c.is_ascii_digit()).take(6).collect();
    match ask_user(&name, kind, &code) {
        Some(true) => {
            let token = format!("{:032x}{:032x}", rand::random::<u128>(), rand::random::<u128>());
            let store = crate::state::store();
            let mut s = store.settings();
            s.linked_devices.retain(|d| !(d.name == name && d.kind == kind));
            s.linked_devices.push(LinkedDevice { name: name.clone(), kind: kind.into(), token: token.clone(), added: now_ms() });
            store.set_settings(s);
            crate::state::settings_changed_elsewhere();
            eprintln!("[link] linked {kind} \"{name}\"");
            json!({ "ok": true, "token": token, "setup": setup() })
        }
        Some(false) => json!({ "ok": false, "error": "The PC said no." }),
        None => json!({ "ok": false, "error": "Nobody answered on the PC — try again and press Allow there." }),
    }
}

fn now_ms() -> u64 {
    std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).map(|d| d.as_millis() as u64).unwrap_or(0)
}

/// Ask the person at the PC. One box at a time; None if nobody answers.
fn ask_user(name: &str, kind: &str, code: &str) -> Option<bool> {
    if ASKING.swap(true, Ordering::SeqCst) {
        return None;
    }
    let what = if kind == "tv" { "TV" } else { "phone" };
    let code_line = if code.is_empty() { String::new() } else { format!("\n\nIt should be showing the code {code}.") };
    let text = format!(
        "Your {what} \"{name}\" wants to link to Izuki on this PC.{code_line}\n\nIf you allow it, it gets a copy of your Izuki setup — your AI keys, your connected apps (Composio), your voice and what Izuki remembers — so it works on its own, even when this PC is off.\n\nOnly allow your own devices. Allow it?"
    );
    let answer = message_box("Izuki — link a device", &text);
    ASKING.store(false, Ordering::SeqCst);
    answer
}

#[cfg(windows)]
fn message_box(title: &str, text: &str) -> Option<bool> {
    use windows::core::HSTRING;
    use windows::Win32::UI::WindowsAndMessaging::{MessageBoxW, IDYES, MB_ICONQUESTION, MB_SETFOREGROUND, MB_SYSTEMMODAL, MB_TOPMOST, MB_YESNO};
    let r = unsafe { MessageBoxW(None, &HSTRING::from(text), &HSTRING::from(title), MB_YESNO | MB_ICONQUESTION | MB_TOPMOST | MB_SETFOREGROUND | MB_SYSTEMMODAL) };
    Some(r == IDYES)
}

#[cfg(not(windows))]
fn message_box(_title: &str, _text: &str) -> Option<bool> {
    None
}

/// The setup a linked device copies: brains, apps, voice, look, memories.
pub fn setup() -> Value {
    let Some(store) = crate::state::try_store() else { return json!({}) };
    let s = store.settings();
    let key_of = |id: crate::settings::ProviderId| s.providers.iter().find(|p| p.id == id && !p.api_key.trim().is_empty()).map(|p| p.api_key.trim().to_string());
    use crate::settings::ProviderId as P;
    let mut brains = serde_json::Map::new();
    for (name, id) in [("groq", P::Groq), ("openrouter", P::Openrouter), ("mistral", P::Mistral)] {
        if let Some(k) = key_of(id) {
            brains.insert(name.into(), json!(k));
        }
    }
    let groq = if s.groq_api_key.trim().is_empty() { None } else { Some(s.groq_api_key.trim().to_string()) };
    if !brains.contains_key("groq") {
        if let Some(g) = groq {
            brains.insert("groq".into(), json!(g));
        }
    }
    let memories: Vec<String> = crate::memory::list().into_iter().rev().take(80).map(|m| m.text).collect();
    json!({
        "pcName": std::env::var("COMPUTERNAME").unwrap_or_default(),
        "gemini": key_of(P::Gemini).unwrap_or_default(),
        "brains": brains,
        "composio": s.composio_api_key.trim(),
        "composioUser": s.composio_user_id.trim(),
        "persona": s.persona,
        "language": s.speech_language,
        "orbStyle": s.orb_style,
        "homeCity": crate::web::home_city(),
        "memories": memories,
    })
}

/// What Izuki is doing now, for linked devices following along.
pub fn publish(state: &str, text: Option<&str>) {
    if !running() {
        return;
    }
    let n = EVENT_SEQ.fetch_add(1, Ordering::SeqCst) + 1;
    let mut q = EVENTS.lock();
    q.push_back((n, state.to_string(), text.unwrap_or("").chars().take(600).collect()));
    while q.len() > 40 {
        q.pop_front();
    }
    drop(q);
    NEW_EVENT.notify_all();
}

/// A line of speech, kept for a few minutes at an address on the home
/// network the TV can play. None when the link isn't running.
pub fn audio_url(text: &str) -> Option<String> {
    if !running() {
        return None;
    }
    let ip = lan_ip()?;
    let settings = crate::state::try_store()?.settings();
    let (bytes, kind) = crate::tts::speak_audio(&settings, text).ok()?;
    let id = format!("{:016x}", rand::random::<u64>());
    let ext = if kind == "audio/mpeg" { "mp3" } else { "wav" };
    let mut a = AUDIO.lock();
    a.retain(|(_, _, _, t)| t.elapsed() < Duration::from_secs(180));
    a.push((format!("{id}.{ext}"), bytes, kind, Instant::now()));
    Some(format!("http://{ip}:{PORT}/izuki/say/{id}.{ext}"))
}

/// Linked devices, for the Settings list (no passes).
pub fn devices() -> Vec<HashMap<&'static str, String>> {
    crate::state::try_store()
        .map(|s| s.settings().linked_devices)
        .unwrap_or_default()
        .into_iter()
        .map(|d| HashMap::from([("name", d.name), ("kind", d.kind), ("added", d.added.to_string())]))
        .collect()
}
