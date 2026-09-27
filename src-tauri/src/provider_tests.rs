//! Every brain in Settings, end to end against a stand-in server that
//! answers the way each real service does: the settings "Test" check, the
//! screen agent (a plan from a screenshot) and the chat lane (a streamed
//! reply). Catches a wrong address, header or reply shape for any of them.

use std::sync::Arc;

use parking_lot::Mutex;
use serde_json::{json, Value};

use crate::model::Rect;
use crate::settings::{ProviderConfig, ProviderId};
use crate::vision::{self, VisionRequest};

const PLAN: &str = r#"{"summary":"Opening Notepad","steps":[{"action":"open_app","text_to_type":"notepad"}],"done":true}"#;

#[derive(Clone, Debug)]
struct Seen {
    method: String,
    url: String,
    headers: Vec<(String, String)>,
    body: Value,
}

impl Seen {
    fn header(&self, name: &str) -> Option<&str> {
        self.headers.iter().find(|(k, _)| k.eq_ignore_ascii_case(name)).map(|(_, v)| v.as_str())
    }
}

fn sse(words: &[&str]) -> String {
    let mut out = String::new();
    for w in words {
        out.push_str(&format!("data: {}\n\n", json!({ "choices": [{ "delta": { "content": w } }] })));
    }
    out.push_str("data: [DONE]\n\n");
    out
}

/// A fake of every provider's API on one local port.
fn server() -> (String, Arc<Mutex<Vec<Seen>>>) {
    let srv = tiny_http::Server::http("127.0.0.1:0").unwrap();
    let port = srv.server_addr().to_ip().unwrap().port();
    let seen = Arc::new(Mutex::new(Vec::new()));
    let log = seen.clone();
    std::thread::spawn(move || {
        for mut rq in srv.incoming_requests() {
            let mut raw = String::new();
            let _ = rq.as_reader().read_to_string(&mut raw);
            let body: Value = serde_json::from_str(&raw).unwrap_or(Value::Null);
            let s = Seen {
                method: rq.method().to_string(),
                url: rq.url().to_string(),
                headers: rq.headers().iter().map(|h| (h.field.to_string(), h.value.to_string())).collect(),
                body: body.clone(),
            };
            log.lock().push(s.clone());
            let authed = s.header("authorization").is_some() || s.header("x-api-key").is_some() || s.header("x-goog-api-key").is_some();
            let model = body["model"].as_str().unwrap_or_default().to_string();
            let (code, text, sse_reply) = if s.url.ends_with("/api/tags") {
                (200, json!({ "models": [{ "name": "moondream:latest" }, { "name": "llama3.2:latest" }] }).to_string(), false)
            } else if s.url.ends_with("/api/generate") {
                if model == "missing" {
                    (404, json!({ "error": "model \"missing\" not found, try pulling it first" }).to_string(), false)
                } else if model.starts_with("llama3.2") && body.get("images").is_some() {
                    (500, json!({ "error": "this model is missing data required for image input" }).to_string(), false)
                } else {
                    (200, json!({ "model": model, "response": PLAN, "done": true }).to_string(), false)
                }
            } else if s.url.contains(":generateContent") {
                if s.url.contains("key=") || s.header("x-goog-api-key").is_none() {
                    (403, json!({ "error": { "message": "key must be in the header" } }).to_string(), false)
                } else {
                    (200, json!({ "candidates": [{ "content": { "parts": [{ "text": PLAN }] } }] }).to_string(), false)
                }
            } else if s.url.ends_with("/messages") {
                (200, json!({ "content": [{ "type": "text", "text": PLAN }] }).to_string(), false)
            } else if s.url.ends_with("/chat/completions") {
                if !authed && !s.url.contains(":11434") && !s.url.starts_with("/v1/chat") && !s.url.starts_with("/local") {
                    (401, json!({ "error": { "message": "no key" } }).to_string(), false)
                } else if body["stream"] == json!(true) {
                    (200, sse(&["Hey", " there", "!"]), true)
                } else if model == "strict" && body.get("response_format").is_some() {
                    (400, json!({ "error": { "message": "response_format is not supported" } }).to_string(), false)
                } else {
                    (200, json!({ "choices": [{ "message": { "content": PLAN } }] }).to_string(), false)
                }
            } else if s.url.ends_with("/models") {
                if authed || s.url.starts_with("/local") { (200, json!({ "data": [] }).to_string(), false) } else { (401, "{}".into(), false) }
            } else {
                (404, json!({ "error": format!("no route {}", s.url) }).to_string(), false)
            };
            let ct = if sse_reply { "text/event-stream" } else { "application/json" };
            let resp = tiny_http::Response::from_string(text)
                .with_status_code(code)
                .with_header(tiny_http::Header::from_bytes("Content-Type", ct).unwrap());
            let _ = rq.respond(resp);
        }
    });
    (format!("http://127.0.0.1:{port}"), seen)
}

fn cfg(id: ProviderId, base: String, model: &str, key: &str) -> ProviderConfig {
    ProviderConfig { id, label: id.as_str().into(), base_url: base, model: model.into(), api_key: key.into(), enabled: true }
}

fn request() -> VisionRequest {
    VisionRequest {
        image_jpeg: vec![0xFF, 0xD8, 0xFF, 0xD9],
        image_size: (100, 100),
        desktop: Rect { x: 0, y: 0, w: 100, h: 100 },
        marks_description: String::new(),
        user_prompt: "open notepad".into(),
        ocr_text: String::new(),
        app: "explorer".into(),
        window_title: "Desktop".into(),
        draft: Vec::new(),
        controls: Vec::new(),
        memory: String::new(),
        windows: Vec::new(),
        page_text: String::new(),
    }
}

fn chat(c: &ProviderConfig) -> anyhow::Result<String> {
    let out = Mutex::new(String::new());
    let msgs = vec![json!({ "role": "system", "content": "be brief" }), json!({ "role": "user", "content": "hi" })];
    crate::chat::stream_one(c, &msgs, &|| false, &|t| out.lock().push_str(&t))?;
    Ok(out.into_inner())
}

/// Each provider as a user would set it up: its real address shape and a key.
fn all(base: &str) -> Vec<ProviderConfig> {
    vec![
        cfg(ProviderId::Ollama, base.to_string(), "moondream", ""),
        cfg(ProviderId::Gemini, base.to_string(), "gemini-2.5-flash", "AIza-test"),
        cfg(ProviderId::Openrouter, format!("{base}/api/v1"), "google/gemma-4-31b-it:free", "sk-or-test"),
        cfg(ProviderId::Openai, format!("{base}/v1"), "gpt-4.1-mini", "sk-test"),
        cfg(ProviderId::Anthropic, format!("{base}/v1"), "claude-haiku-4-5-20251001", "sk-ant-test"),
        cfg(ProviderId::Nvidia, format!("{base}/v1"), "strict", "nvapi-test"),
        cfg(ProviderId::NineRouter, format!("{base}/local9/v1"), "kr/claude-haiku-4.5", ""),
        cfg(ProviderId::Xai, format!("{base}/xai/v1"), "grok-4-fast-non-reasoning", "xai-test"),
        cfg(ProviderId::Custom, format!("{base}/local/v1"), "local-vlm", ""),
    ]
}

#[test]
fn every_brain_passes_the_settings_test() {
    let (base, _) = server();
    for c in all(&base) {
        let r = vision::probe(&c);
        let msg = r.unwrap_or_else(|e| panic!("{} probe failed: {e}", c.id.as_str()));
        assert!(msg.starts_with("ok"), "{}: {msg}", c.id.as_str());
    }
}

#[test]
fn every_brain_can_plan_from_a_screenshot() {
    let (base, seen) = server();
    for c in all(&base) {
        let plan = vision::ask(&c, &request()).unwrap_or_else(|e| panic!("{} plan failed: {e}", c.id.as_str()));
        assert_eq!(plan.summary, "Opening Notepad", "{}", c.id.as_str());
        assert_eq!(plan.steps.len(), 1, "{}", c.id.as_str());
        assert!(plan.done, "{}", c.id.as_str());
    }
    let log = seen.lock();
    // Gemini's key travels in a header, never in the address.
    let g = log.iter().find(|s| s.url.contains(":generateContent")).unwrap();
    assert!(!g.url.contains("key="));
    // The strict model got asked again without JSON mode.
    assert!(log.iter().filter(|s| s.body["model"] == "strict").count() >= 2);
    // OpenRouter gets its attribution headers.
    let or = log.iter().find(|s| s.url.starts_with("/api/v1/chat")).unwrap();
    assert_eq!(or.header("x-title"), Some("Izuki"));
    assert_eq!(or.method, "POST");
}

#[test]
fn every_brain_can_chat() {
    let (base, seen) = server();
    for c in all(&base) {
        let said = chat(&c).unwrap_or_else(|e| panic!("{} chat failed: {e}", c.id.as_str()));
        assert_eq!(said, "Hey there!", "{}", c.id.as_str());
    }
    let log = seen.lock();
    assert!(log.iter().any(|s| s.url == "/v1beta/openai/chat/completions"), "Gemini's OpenAI-style address");
    assert!(log.iter().any(|s| s.url == "/v1/chat/completions" && s.body["model"] == "moondream"), "Ollama's /v1 address");
    let ant = log.iter().find(|s| s.body["model"] == "claude-haiku-4-5-20251001" && s.url.ends_with("/chat/completions")).unwrap();
    assert_eq!(ant.header("authorization"), Some("Bearer sk-ant-test"));
}

#[test]
fn local_models_that_cant_see_still_work_and_missing_ones_say_how_to_fix() {
    let (base, _) = server();
    let text_only = cfg(ProviderId::Ollama, base.clone(), "llama3.2", "");
    let plan = vision::ask(&text_only, &request()).expect("text-only local model");
    assert_eq!(plan.summary, "Opening Notepad");

    let missing = cfg(ProviderId::Ollama, base.clone(), "missing", "");
    let err = vision::ask(&missing, &request()).unwrap_err().to_string();
    assert!(err.contains("ollama pull missing"), "{err}");

    // Someone typed Ollama's OpenAI-style address into the box.
    let v1 = cfg(ProviderId::Ollama, format!("{base}/v1"), "moondream", "");
    assert_eq!(chat(&v1).unwrap(), "Hey there!");
    assert!(vision::probe(&v1).unwrap().starts_with("ok — moondream"));
}

#[test]
fn nothing_listening_is_a_clear_error() {
    let dead = cfg(ProviderId::Ollama, "http://127.0.0.1:9".into(), "moondream", "");
    let err = vision::probe(&dead).unwrap_err().to_string();
    assert!(err.contains("Ollama isn't running"), "{err}");
}
