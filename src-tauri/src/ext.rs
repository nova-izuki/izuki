//! The bridge to the Izuki browser extension (Chrome / Edge).
//!
//! With the extension, Izuki sees a web page the way the page itself does —
//! every real link, button and box, with its name, where a link goes, and its
//! exact place — instead of guessing from a screenshot. It can also click or
//! type into one exact element inside the page (no mouse at all).
//!
//! The extension long-polls this tiny local server for something to do
//! (`GET /izuki/next`) and posts the outcome back (`POST /izuki/result`).
//! Only this PC can reach it (127.0.0.1), and only the extension: requests
//! must come from a browser-extension origin with Izuki's header — a web
//! page can't talk to it.

use std::collections::HashMap;
use std::io::Read;
use std::sync::mpsc::{channel, Receiver, Sender};
use std::time::{Duration, Instant};

use anyhow::{anyhow, Result};
use parking_lot::Mutex;
use serde_json::{json, Value};

/// The port the extension knows to look on.
pub const PORT: u16 = 47615;
/// How long the extension's poll waits for work before asking again.
const POLL_WAIT: Duration = Duration::from_secs(20);

struct Job {
    id: u64,
    op: String,
    args: Value,
}

static QUEUE: Mutex<Vec<Job>> = Mutex::new(Vec::new());
static WAITING: Mutex<Option<HashMap<u64, Sender<Value>>>> = Mutex::new(None);
static LAST_SEEN: Mutex<Option<Instant>> = Mutex::new(None);
static WAKE: Mutex<Option<Sender<()>>> = Mutex::new(None);

/// Is the extension there (it polls at least every ~20 s)?
pub fn connected() -> bool {
    LAST_SEEN.lock().is_some_and(|t| t.elapsed() < Duration::from_secs(30))
}

/// Ask the extension to do something and wait for the answer.
pub fn request(op: &str, args: Value, timeout: Duration) -> Result<Value> {
    if !connected() {
        return Err(anyhow!("the Izuki browser extension isn't connected"));
    }
    let id = rand::random::<u32>() as u64 + 1;
    let (tx, rx): (Sender<Value>, Receiver<Value>) = channel();
    WAITING.lock().get_or_insert_with(HashMap::new).insert(id, tx);
    QUEUE.lock().push(Job { id, op: op.into(), args });
    if let Some(w) = WAKE.lock().as_ref() {
        let _ = w.send(());
    }
    let out = rx.recv_timeout(timeout);
    WAITING.lock().get_or_insert_with(HashMap::new).remove(&id);
    let v = out.map_err(|_| anyhow!("the browser extension didn't answer in time"))?;
    if v["ok"].as_bool() == Some(false) {
        return Err(anyhow!("{}", v["error"].as_str().unwrap_or("the browser couldn't do that")));
    }
    Ok(v["data"].clone())
}

/// Only the extension may talk to the bridge.
fn trusted(req: &tiny_http::Request) -> bool {
    let header = |name: &str| req.headers().iter().find(|h| h.field.to_string().eq_ignore_ascii_case(name)).map(|h| h.value.as_str().to_string());
    let from_extension = header("Origin").map_or(true, |o| o.starts_with("chrome-extension://") || o.starts_with("moz-extension://"));
    from_extension && header("X-Izuki-Extension").is_some()
}

/// Start the bridge (once, at launch). Quietly does nothing if the port is taken.
pub fn spawn() {
    std::thread::Builder::new()
        .name("izuki-ext-bridge".into())
        .spawn(|| {
            // Right after an update the old Izuki can still hold the port for
            // a few seconds — wait for it rather than going without the
            // extension for the whole session.
            let mut tries = 0;
            let server = loop {
                match tiny_http::Server::http(("127.0.0.1", PORT)) {
                    Ok(s) => break s,
                    Err(_) if tries < 60 => {
                        if tries == 0 {
                            eprintln!("[ext] port {PORT} is busy — waiting for it to free up");
                        }
                        tries += 1;
                        std::thread::sleep(Duration::from_secs(5));
                    }
                    Err(_) => {
                        eprintln!("[ext] port {PORT} stayed busy — browser extension bridge off");
                        return;
                    }
                }
            };
            let (wake_tx, wake_rx) = channel::<()>();
            *WAKE.lock() = Some(wake_tx);
            let wake_rx = std::sync::Arc::new(Mutex::new(wake_rx));
            for mut req in server.incoming_requests() {
                if !trusted(&req) {
                    let _ = req.respond(tiny_http::Response::from_string("no").with_status_code(403));
                    continue;
                }
                *LAST_SEEN.lock() = Some(Instant::now());
                let url = req.url().to_string();
                // The extension's own smart features: Explain / Translate /
                // Sum up / Ask about this page, Save to Notes, Remind me later,
                // and the Focus guard. Answers take a few seconds, so each runs
                // on its own thread and the bridge stays free.
                if url.starts_with("/izuki/ask") || url.starts_with("/izuki/note") || url.starts_with("/izuki/later") || url.starts_with("/izuki/focus") {
                    let mut body = String::new();
                    let _ = req.as_reader().take(400_000).read_to_string(&mut body);
                    let v: Value = serde_json::from_str(&body).unwrap_or(Value::Null);
                    std::thread::spawn(move || {
                        let out = page_helper(&url, &v);
                        let _ = req.respond(json_response(out));
                    });
                    continue;
                }
                if url.starts_with("/izuki/ping") {
                    let _ = req.respond(json_response(json!({ "ok": true, "name": "Izuki" })));
                } else if url.starts_with("/izuki/next") {
                    // Long-poll in its own thread so results can still come in.
                    let wake_rx = wake_rx.clone();
                    std::thread::spawn(move || {
                        let started = Instant::now();
                        loop {
                            let next = {
                                let mut q = QUEUE.lock();
                                (!q.is_empty()).then(|| q.remove(0))
                            };
                            if let Some(job) = next {
                                let _ = req.respond(json_response(json!({ "id": job.id, "op": job.op, "args": job.args })));
                                return;
                            }
                            if started.elapsed() > POLL_WAIT {
                                let _ = req.respond(json_response(json!({ "id": 0, "op": "none" })));
                                return;
                            }
                            let _ = wake_rx.lock().recv_timeout(Duration::from_millis(250));
                        }
                    });
                } else if url.starts_with("/izuki/result") {
                    let mut body = String::new();
                    let _ = req.as_reader().take(4_000_000).read_to_string(&mut body);
                    if let Ok(v) = serde_json::from_str::<Value>(&body) {
                        let id = v["id"].as_u64().unwrap_or(0);
                        if let Some(tx) = WAITING.lock().get_or_insert_with(HashMap::new).remove(&id) {
                            let _ = tx.send(v);
                        }
                    }
                    let _ = req.respond(json_response(json!({ "ok": true })));
                } else {
                    let _ = req.respond(tiny_http::Response::from_string("?").with_status_code(404));
                }
            }
        })
        .ok();
}

/// What the extension asked for, done here on the PC with the user's own
/// brains — the extension holds no keys.
fn page_helper(url: &str, v: &Value) -> Value {
    let s = |k: &str| v[k].as_str().unwrap_or("").trim().to_string();
    if url.starts_with("/izuki/focus") {
        return json!({ "ok": true, "left": crate::focus::left() });
    }
    if url.starts_with("/izuki/later") {
        let said = crate::later::run(crate::later::Ask::Add(vec![s("text").chars().take(140).collect()]));
        return json!({ "ok": true, "text": said });
    }
    if url.starts_with("/izuki/note") {
        let whole = v["page"].as_bool().unwrap_or(false);
        return match crate::notes::from_text(&s("title"), &s("url"), &s("text"), whole) {
            Ok(n) => json!({ "ok": true, "text": format!("Saved to Nova Notes: “{}”.", n.title) }),
            Err(e) => json!({ "ok": false, "text": format!("I couldn't save that: {e}") }),
        };
    }
    // /izuki/ask
    let task = s("task");
    let mut text = s("text");
    let title = s("title");
    if task == "link" {
        text = match crate::web::read(&s("text")) {
            Ok(t) => t,
            Err(e) => return json!({ "ok": false, "text": format!("I couldn't open that link: {e}") }),
        };
    }
    let text: String = text.chars().take(14_000).collect();
    if text.trim().is_empty() && task != "ask" && task != "chat" {
        return json!({ "ok": false, "text": "There's nothing to work with — select some text first." });
    }
    let job = match task.as_str() {
        "explain" => "Explain this in plain, friendly words, as briefly as you can (2–5 sentences). If it's a word or name, say what it means.".to_string(),
        "translate" => "Translate this into English, keeping the meaning and tone. If it's already English, say so and give its meaning in one simple line.".to_string(),
        "summarise" | "link" => "Sum this up in 3–5 short bullet points, the way a friend would tell it. Plain words.".to_string(),
        "define" => "Define this word or phrase simply, with one example sentence.".to_string(),
        _ => format!(
            "Answer the user's question about this web page: \"{}\". Use the page; if the answer isn't there, say so and answer from what you know, saying which is which. Be brief.",
            s("question")
        ),
    };
    let msgs = if task == "chat" {
        chat_messages(&v, &title, &text)
    } else {
        vec![
            json!({ "role": "system", "content": format!("You are Izuki, a warm, sharp helper inside the user's web browser. {job} Plain text only, no markdown headings.") }),
            json!({ "role": "user", "content": format!("Page: {title}\n\n{text}") }),
        ]
    };
    match crate::chat::complete(&msgs) {
        Ok(t) => json!({ "ok": true, "text": t.trim() }),
        Err(e) => json!({ "ok": false, "text": format!("My AI brain didn't answer: {e}") }),
    }
}

/// The side panel's conversation about the page in front: the page (and any
/// other tabs shared), what's selected, the last few turns, then the question.
fn chat_messages(v: &Value, title: &str, text: &str) -> Vec<Value> {
    let cut = |s: &str, n: usize| s.chars().take(n).collect::<String>();
    let mut context = format!("The page the user is on: {title}\n{}\n\n{text}", v["url"].as_str().unwrap_or_default());
    let selection = v["selection"].as_str().unwrap_or_default().trim();
    if !selection.is_empty() {
        context.push_str(&format!("\n\nThe user has this selected on the page:\n{}", cut(selection, 3000)));
    }
    for tab in v["tabs"].as_array().into_iter().flatten().take(4) {
        let t = tab["title"].as_str().unwrap_or_default();
        let body = cut(tab["text"].as_str().unwrap_or_default(), 5000);
        if !body.trim().is_empty() {
            context.push_str(&format!("\n\n--- Another open tab the user shared: {t} ---\n{body}"));
        }
    }
    let mut msgs = vec![
        json!({ "role": "system", "content": "You are Izuki, a warm, sharp assistant in a side panel next to the user's web page. Answer from the page (and any shared tabs) when you can; if the answer isn't there, say so briefly and answer from what you know. Be direct and brief: lead with the answer. Short bullet points with - and **bold** are fine; no headings. Never ask for or repeat passwords or card numbers." }),
        json!({ "role": "user", "content": context }),
        json!({ "role": "assistant", "content": "Got it — I can see the page. What would you like to know?" }),
    ];
    let history: Vec<&Value> = v["history"].as_array().map(|a| a.iter().collect()).unwrap_or_default();
    for turn in history.iter().rev().take(10).rev() {
        let role = turn["role"].as_str().unwrap_or_default();
        let content = turn["content"].as_str().unwrap_or_default();
        if (role == "user" || role == "assistant") && !content.trim().is_empty() {
            msgs.push(json!({ "role": role, "content": cut(content, 4000) }));
        }
    }
    msgs.push(json!({ "role": "user", "content": cut(v["question"].as_str().unwrap_or_default(), 2000) }));
    msgs
}

fn json_response(v: Value) -> tiny_http::Response<std::io::Cursor<Vec<u8>>> {
    tiny_http::Response::from_string(v.to_string())
        .with_header(tiny_http::Header::from_bytes(&b"Content-Type"[..], &b"application/json"[..]).expect("header"))
}

// ---------------------------------------------------------------------------
// What the brain uses
// ---------------------------------------------------------------------------

/// A page element the extension reported, placed on the real screen.
#[derive(Debug, Clone)]
pub struct Element {
    /// The extension's own id for it (data-izuki-id).
    pub dom_id: String,
    pub kind: String,
    pub name: String,
    pub href: Option<String>,
    pub rect: crate::model::Rect,
}

/// The page in front, as the extension sees it: its address, title, words
/// and interactive elements (placed in real screen pixels).
pub struct Page {
    pub url: String,
    pub title: String,
    pub text: String,
    pub elements: Vec<Element>,
    /// Where the page itself sits on screen (below the tabs and address bar).
    pub viewport: crate::model::Rect,
}

/// Ask for the page in front. `None` when there's no extension.
pub fn snapshot() -> Option<Page> {
    if !connected() {
        return None;
    }
    let v = request("snapshot", json!({}), Duration::from_millis(2500)).ok()?;
    Some(parse_page(&v))
}

/// The extension's snapshot → elements in screen pixels. The page reports
/// boxes in CSS pixels inside the viewport, plus where its window is and
/// how big its pixels are.
pub fn parse_page(v: &Value) -> Page {
    let m = &v["metrics"];
    let num = |k: &str| m[k].as_f64().unwrap_or(0.0);
    let dpr = num("dpr").max(0.5);
    let left = num("screenX") + (num("outerWidth") - num("innerWidth")).max(0.0) / 2.0;
    let top = num("screenY") + (num("outerHeight") - num("innerHeight")).max(0.0) - (num("outerWidth") - num("innerWidth")).max(0.0) / 2.0;
    let elements = v["elements"]
        .as_array()
        .map(|a| {
            a.iter()
                .filter_map(|e| {
                    let r = &e["rect"];
                    let (x, y, w, h) = (r["x"].as_f64()?, r["y"].as_f64()?, r["w"].as_f64()?, r["h"].as_f64()?);
                    Some(Element {
                        dom_id: e["id"].as_str()?.to_string(),
                        kind: e["kind"].as_str().unwrap_or("Button").to_string(),
                        name: e["name"].as_str().unwrap_or("").chars().take(120).collect(),
                        href: e["href"].as_str().map(str::to_string),
                        rect: crate::model::Rect {
                            x: ((left + x) * dpr).round() as i32,
                            y: ((top + y) * dpr).round() as i32,
                            w: (w * dpr).round().max(1.0) as i32,
                            h: (h * dpr).round().max(1.0) as i32,
                        },
                    })
                })
                .collect()
        })
        .unwrap_or_default();
    let viewport = crate::model::Rect {
        x: (left * dpr).round() as i32,
        y: (top * dpr).round() as i32,
        w: (num("innerWidth") * dpr).round() as i32,
        h: (num("innerHeight") * dpr).round() as i32,
    };
    Page {
        viewport,
        url: v["url"].as_str().unwrap_or("").to_string(),
        title: v["title"].as_str().unwrap_or("").to_string(),
        text: v["text"].as_str().unwrap_or("").to_string(),
        elements,
    }
}

/// The page elements the last look listed, by the control number the AI
/// was shown — so "click #903" becomes a click inside the page.
static LISTED: Mutex<Vec<(u32, String)>> = Mutex::new(Vec::new());

pub fn remember_listed(pairs: Vec<(u32, String)>) {
    *LISTED.lock() = pairs;
}

pub fn dom_id_for(control: u32) -> Option<String> {
    LISTED.lock().iter().find(|(id, _)| *id == control).map(|(_, d)| d.clone())
}

/// Click an element inside the page — no mouse.
pub fn click(dom_id: &str) -> Result<()> {
    request("click", json!({ "id": dom_id }), Duration::from_secs(4)).map(|_| ())
}

/// Type into an element inside the page — no keyboard.
pub fn type_into(dom_id: &str, text: &str) -> Result<()> {
    request("type", json!({ "id": dom_id, "text": text }), Duration::from_secs(4)).map(|_| ())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn places_page_elements_on_the_screen() {
        let v = json!({
            "url": "https://example.com/quiz", "title": "Quiz", "text": "Question 1",
            "metrics": { "dpr": 1.5, "screenX": 0, "screenY": 0, "outerWidth": 1280, "innerWidth": 1264, "outerHeight": 800, "innerHeight": 680 },
            "elements": [ { "id": "i7", "kind": "Button", "name": "Next", "rect": { "x": 100, "y": 50, "w": 80, "h": 30 } } ]
        });
        let p = parse_page(&v);
        assert_eq!(p.elements.len(), 1);
        let e = &p.elements[0];
        assert_eq!(e.name, "Next");
        // left border 8 css px, top chrome 120 - 8 = 112 css px; ×1.5
        assert_eq!(e.rect.x, ((8.0 + 100.0) * 1.5) as i32);
        assert_eq!(e.rect.y, ((112.0 + 50.0) * 1.5) as i32);
        assert_eq!(e.rect.w, 120);
    }

    #[test]
    fn not_connected_means_no_requests() {
        assert!(request("snapshot", json!({}), Duration::from_millis(10)).is_err());
    }
}
