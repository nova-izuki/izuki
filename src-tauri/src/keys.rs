//! Setting Izuki up without typing anything technical.
//!
//! **Keys, caught from the clipboard.** Every free service Izuki uses gives
//! you a key on its website. Copy it there, come back to Izuki, and it's
//! recognised and put in the right place — no hunting for the right box.
//! Only text shaped exactly like a known key is ever looked at; anything
//! else on the clipboard is ignored and never stored or logged.
//!
//! **n8n, imported.** Instead of copying each workflow's webhook address by
//! hand, give Izuki your n8n address and an API key once: every active
//! workflow that starts with a Webhook becomes something Izuki can run by
//! name — and it picks the right one by itself.

use std::time::Duration;

use anyhow::{anyhow, Result};
use serde::Serialize;
use serde_json::Value;

use crate::settings::N8nHook;

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct FoundKey {
    /// "gemini", "groq", "openrouter", "xai", "nvidia", "anthropic",
    /// "openai", "composio" or "telegram".
    pub kind: &'static str,
    /// For the UI: "Google Gemini key".
    pub label: &'static str,
    pub key: String,
}

/// The key on the clipboard, if what's there is one.
pub fn from_clipboard() -> Option<FoundKey> {
    let text = arboard::Clipboard::new().ok()?.get_text().ok()?;
    recognise(&text)
}

/// What kind of key `text` is, if it's exactly one key and nothing else.
pub fn recognise(text: &str) -> Option<FoundKey> {
    let t = text.trim();
    let t = t.strip_prefix("Authorization:").map(str::trim).unwrap_or(t);
    let t = t.strip_prefix("Bearer ").map(str::trim).unwrap_or(t).trim_matches(|c| c == '"' || c == '\'');
    if t.len() < 20 || t.len() > 300 || t.chars().any(char::is_whitespace) {
        return None;
    }
    let tokenish = |s: &str| s.chars().all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_');
    let found = |kind, label| Some(FoundKey { kind, label, key: t.to_string() });
    if t.starts_with("AIza") && t.len() == 39 && tokenish(t) {
        return found("gemini", "Google Gemini key");
    }
    if t.starts_with("gsk_") && t.len() >= 40 && tokenish(t) {
        return found("groq", "Groq key");
    }
    if t.starts_with("sk-or-") && t.len() >= 40 && tokenish(t) {
        return found("openrouter", "OpenRouter key");
    }
    if t.starts_with("sk-ant-") && t.len() >= 40 && tokenish(t) {
        return found("anthropic", "Anthropic (Claude) key");
    }
    if t.starts_with("xai-") && t.len() >= 40 && tokenish(t) {
        return found("xai", "Grok (xAI) key");
    }
    if t.starts_with("nvapi-") && t.len() >= 40 && tokenish(t) {
        return found("nvidia", "NVIDIA key");
    }
    if t.starts_with("sk-") && t.len() >= 40 && tokenish(t) {
        return found("openai", "OpenAI key");
    }
    if t.starts_with("ak_") && t.len() >= 20 && tokenish(t) {
        return found("composio", "Composio key");
    }
    // Telegram bot token: 123456789:AA… (35 characters after the colon).
    if let Some((id, rest)) = t.split_once(':') {
        if (6..=12).contains(&id.len()) && id.chars().all(|c| c.is_ascii_digit()) && rest.len() == 35 && tokenish(rest) {
            return found("telegram", "Telegram bot token");
        }
    }
    None
}

#[derive(Debug, Serialize)]
pub struct N8nImport {
    pub hooks: Vec<N8nHook>,
    /// Workflows left out, and why ("Backup — not active").
    pub skipped: Vec<String>,
}

/// Every active n8n workflow that starts with a POST webhook, by name.
pub fn n8n_import(address: &str, api_key: &str) -> Result<N8nImport> {
    let base = n8n_base(address)?;
    let key = api_key.trim();
    if key.is_empty() {
        return Err(anyhow!("add your n8n API key (n8n → Settings → n8n API → Create an API key)"));
    }
    let res = reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(20))
        .build()?
        .get(format!("{base}/api/v1/workflows?limit=250"))
        .header("X-N8N-API-KEY", key)
        .send()
        .map_err(|e| anyhow!("couldn't reach n8n at {base} ({e})"))?;
    match res.status().as_u16() {
        200 => {}
        401 | 403 => return Err(anyhow!("n8n didn't accept that API key — make a new one in n8n → Settings → n8n API")),
        404 => return Err(anyhow!("that doesn't look like an n8n address — use the one you open n8n at")),
        s => return Err(anyhow!("n8n answered {s}")),
    }
    let body: Value = res.json()?;
    Ok(hooks_from(&base, &body))
}

/// "https://me.app.n8n.cloud/home/workflows" → "https://me.app.n8n.cloud".
fn n8n_base(address: &str) -> Result<String> {
    let a = address.trim();
    let a = if a.starts_with("http") { a.to_string() } else { format!("https://{a}") };
    let url = reqwest::Url::parse(&a).map_err(|_| anyhow!("that n8n address doesn't look right"))?;
    Ok(url.origin().ascii_serialization())
}

fn hooks_from(base: &str, body: &Value) -> N8nImport {
    let mut hooks = Vec::new();
    let mut skipped = Vec::new();
    for wf in body["data"].as_array().into_iter().flatten() {
        let name = wf["name"].as_str().unwrap_or("").trim().to_string();
        if name.is_empty() {
            continue;
        }
        let hook = wf["nodes"].as_array().into_iter().flatten().find(|n| {
            n["type"].as_str() == Some("n8n-nodes-base.webhook") && n["disabled"].as_bool() != Some(true)
        });
        let Some(hook) = hook else {
            skipped.push(format!("{name} — doesn't start with a Webhook"));
            continue;
        };
        let method = hook["parameters"]["httpMethod"].as_str().unwrap_or("GET").to_uppercase();
        if method != "POST" {
            skipped.push(format!("{name} — its Webhook is set to {method}; set it to POST"));
            continue;
        }
        if wf["active"].as_bool() != Some(true) {
            skipped.push(format!("{name} — not active (switch it on in n8n)"));
            continue;
        }
        let path = hook["parameters"]["path"].as_str().or(hook["webhookId"].as_str()).unwrap_or("").trim_matches('/');
        if path.is_empty() {
            skipped.push(format!("{name} — its Webhook has no path"));
            continue;
        }
        hooks.push(N8nHook { name, url: format!("{base}/webhook/{path}") });
    }
    N8nImport { hooks, skipped }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn knows_keys_when_it_sees_them() {
        let gemini = format!("AIza{}", "x".repeat(35));
        assert_eq!(recognise(&format!("  {gemini}\n")).unwrap().kind, "gemini");
        assert_eq!(recognise(&format!("Bearer gsk_{}", "a".repeat(52))).unwrap().kind, "groq");
        assert_eq!(recognise(&format!("sk-or-v1-{}", "b".repeat(64))).unwrap().kind, "openrouter");
        assert_eq!(recognise(&format!("sk-proj-{}", "c".repeat(60))).unwrap().kind, "openai");
        assert_eq!(recognise(&format!("sk-ant-api03-{}", "d".repeat(60))).unwrap().kind, "anthropic");
        assert_eq!(recognise(&format!("xai-{}", "e".repeat(60))).unwrap().kind, "xai");
        assert_eq!(recognise("ak_abcdefghijklmnopqrst").unwrap().kind, "composio");
        assert_eq!(recognise(&format!("123456789:{}", "A".repeat(35))).unwrap().kind, "telegram");
        // Ordinary clipboard text is left alone.
        assert!(recognise("hello there").is_none());
        assert!(recognise("https://aistudio.google.com/apikey").is_none());
        assert!(recognise(&format!("my key is AIza{}", "x".repeat(35))).is_none());
    }

    #[test]
    fn imports_n8n_workflows_by_name() {
        assert_eq!(n8n_base("me.app.n8n.cloud/home/workflows").unwrap(), "https://me.app.n8n.cloud");
        let body = serde_json::json!({ "data": [
            { "name": "Weekly report", "active": true, "nodes": [
                { "type": "n8n-nodes-base.webhook", "parameters": { "httpMethod": "POST", "path": "weekly-report" } },
                { "type": "n8n-nodes-base.gmail" } ] },
            { "name": "Backup", "active": false, "nodes": [
                { "type": "n8n-nodes-base.webhook", "parameters": { "httpMethod": "POST", "path": "backup" } } ] },
            { "name": "Ping", "active": true, "nodes": [
                { "type": "n8n-nodes-base.webhook", "parameters": { "path": "ping" } } ] },
            { "name": "Cron job", "active": true, "nodes": [ { "type": "n8n-nodes-base.cron" } ] }
        ]});
        let got = hooks_from("https://me.app.n8n.cloud", &body);
        assert_eq!(got.hooks.len(), 1);
        assert_eq!(got.hooks[0].name, "Weekly report");
        assert_eq!(got.hooks[0].url, "https://me.app.n8n.cloud/webhook/weekly-report");
        assert_eq!(got.skipped.len(), 3);
        assert!(got.skipped.iter().any(|s| s.contains("not active")));
        assert!(got.skipped.iter().any(|s| s.contains("POST")));
    }
}
