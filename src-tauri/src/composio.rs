//! Izuki's hands in your apps — Gmail, Calendar, Drive, Slack, Notion,
//! GitHub, socials and hundreds more — through Composio's Tool Router.
//!
//! Free the same way the rest of Izuki is: each person uses their own free
//! Composio key (20,000 actions a month on the free plan), and Composio
//! handles every app's sign-in, so there's no Google/Microsoft review to go
//! through. Nothing is hosted by Izuki.
//!
//! Kept light on the AI: rather than stuffing hundreds of tool definitions
//! into the prompt, the model *searches* for what it needs ("send an
//! email"), gets back just those tools, runs one, sees the result, and
//! answers — usually two or three small calls. The model speaks a tiny JSON
//! protocol, so it works with every brain Izuki supports.
//!
//! Nothing is sent, posted, deleted or bought without the user saying yes
//! first — the draft is shown, and only an explicit yes runs it.

use std::time::Duration;

use anyhow::{anyhow, Result};
use parking_lot::Mutex;
use serde::Serialize;
use serde_json::{json, Value};

use crate::chat::Turn;

const API: &str = "https://backend.composio.dev/api/v3";
/// Look/act rounds for one request.
const MAX_ROUNDS: usize = 6;
/// How much of a tool's result the model gets to read.
const RESULT_CHARS: usize = 6000;

/// The answer to an apps request.
#[derive(Debug, Clone, Default, Serialize)]
pub struct Answer {
    pub text: String,
    /// Sign-in links for apps that aren't connected yet: (app, url).
    pub links: Vec<(String, String)>,
}

/// The Tool Router session in use: (key it was made with, session id).
static SESSION: Mutex<Option<(String, String)>> = Mutex::new(None);

pub fn configured() -> bool {
    !crate::state::store().settings().composio_api_key.trim().is_empty()
}

fn client() -> Result<reqwest::blocking::Client> {
    Ok(reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(45))
        .connect_timeout(Duration::from_secs(8))
        .build()?)
}

fn post(key: &str, path: &str, body: &Value) -> Result<Value> {
    let res = client()?.post(format!("{API}{path}")).header("x-api-key", key).json(body).send()?;
    let status = res.status();
    let v: Value = res.json().unwrap_or(Value::Null);
    if !status.is_success() {
        let msg = v["error"]["message"]
            .as_str()
            .or(v["message"].as_str())
            .or(v["error"].as_str())
            .unwrap_or("no details");
        return Err(anyhow!("Composio answered {status}: {msg}"));
    }
    Ok(v)
}

/// This PC's Composio user — made once, kept in settings.
fn user_id() -> String {
    let store = crate::state::store();
    let s = store.settings();
    if !s.composio_user_id.is_empty() {
        return s.composio_user_id;
    }
    let mut next = s.clone();
    next.composio_user_id = format!("izuki-{}", uuid::Uuid::new_v4().simple());
    store.set_settings(next).composio_user_id
}

fn session(key: &str, fresh: bool) -> Result<String> {
    if !fresh {
        if let Some((k, id)) = SESSION.lock().clone() {
            if k == key {
                return Ok(id);
            }
        }
    }
    let v = post(
        key,
        "/tool_router/session",
        // No premium (paid-per-call) tools: Izuki stays free.
        &json!({ "user_id": user_id(), "premium_usage": false }),
    )?;
    let id = v["session_id"].as_str().ok_or_else(|| anyhow!("Composio gave no session"))?.to_string();
    *SESSION.lock() = Some((key.to_string(), id.clone()));
    Ok(id)
}

/// Call the router, making a new session once if the old one expired.
fn router(key: &str, action: &str, body: &Value) -> Result<Value> {
    let id = session(key, false)?;
    match post(key, &format!("/tool_router/session/{id}/{action}"), body) {
        Err(e) if e.to_string().contains("404") || e.to_string().to_lowercase().contains("session") => {
            let id = session(key, true)?;
            post(key, &format!("/tool_router/session/{id}/{action}"), body)
        }
        r => r,
    }
}

const PROMPT: &str = "You are Izuki, the user's warm, quick AI companion, working in their apps \
(email, calendar, files, chat apps, notes, social media and more) through tools. Work step by step. \
Every reply is ONE JSON object and nothing else, one of:\n\
{\"search\": \"what you need to do, e.g. find unread emails from today\"} — finds the right tools and \
tells you which apps are connected. Always search before using a tool you haven't seen.\n\
{\"run\": {\"tool\": \"TOOL_SLUG\", \"arguments\": {…}}} — runs a tool you found, with arguments \
matching its schema.\n\
{\"connect\": \"gmail\"} — when a needed app isn't connected: gives the user a sign-in link.\n\
{\"reply\": \"what you say to the user\"} — when you're done, or need to ask something.\n\
Rules: keep replies short and friendly, plain text. Summarise results the way a person would \
(\"You've got 3 new emails — one from Sam about Friday…\"), never dump raw data. NEVER send, post, \
reply, delete, pay, accept or change anything on the user's behalf unless their latest message \
clearly says yes to exactly that — first show them the draft or what you'll do and ask \"Want me to \
send it?\". Reading and searching needs no permission. If a tool fails, try once another way, then \
tell them simply what went wrong.";

/// Bumped by the stop keys. A request remembers the number it started with
/// and never runs another tool (a send, a post) once it has changed.
/// The most one apps request works for before it answers anyway.
const BUDGET: std::time::Duration = std::time::Duration::from_secs(70);

static STOPS: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);

pub fn stop() {
    STOPS.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
}

fn stopped(since: u64) -> bool {
    STOPS.load(std::sync::atomic::Ordering::SeqCst) != since
}

/// Handle a request that needs the user's apps. `history` ends with it.
pub fn ask(history: &[Turn]) -> Result<Answer> {
    let key = crate::state::store().settings().composio_api_key.trim().to_string();
    if key.is_empty() {
        // No apps linked: still help ("plan my week" deserves a plan, not
        // a setup chore), and say once how to let it into their apps.
        let text = crate::chat::reply_here(history, crate::chat::Style::Text)?;
        return Ok(Answer {
            text: format!("{text}\n\n(Link your apps in Settings → Apps and I can put things straight into your email and calendar.)"),
            links: Vec::new(),
        });
    }

    let mut messages = vec![json!({ "role": "system", "content": format!("{PROMPT}\n{}{}", crate::reminders::prompt_block(), crate::memory::prompt_block()) })];
    for t in history.iter().rev().take(10).rev() {
        let role = if t.role == "assistant" { "assistant" } else { "user" };
        messages.push(json!({ "role": role, "content": t.content }));
    }

    let started = STOPS.load(std::sync::atomic::Ordering::SeqCst);
    let halt = || Answer { text: "Okay, I stopped.".into(), links: Vec::new() };
    let mut links = Vec::new();
    let began = std::time::Instant::now();
    for round in 0..MAX_ROUNDS {
        // Never keep them waiting for minutes: past this, answer with what
        // it has.
        if began.elapsed() > BUDGET {
            eprintln!("[apps] out of time after {round} rounds");
            break;
        }
        if stopped(started) {
            return Ok(halt());
        }
        let raw = crate::chat::complete(&messages)?;
        if stopped(started) {
            return Ok(halt());
        }
        let Some(step) = parse_step(&raw) else {
            // Not JSON: take it as the answer rather than fail.
            return Ok(Answer { text: plain(&raw), links });
        };
        eprintln!("[apps] round {}: {}", round + 1, step.to_string().chars().take(160).collect::<String>());
        messages.push(json!({ "role": "assistant", "content": step.to_string() }));

        let seen = if let Some(text) = step["reply"].as_str() {
            return Ok(Answer { text: text.trim().to_string(), links });
        } else if let Some(q) = step["search"].as_str() {
            match router(&key, "search", &json!({ "queries": [{ "use_case": q }] })) {
                Ok(v) => describe_search(&v),
                Err(e) => format!("Search failed: {e}"),
            }
        } else if let Some(app) = step["connect"].as_str() {
            let app = app.trim().to_lowercase();
            match router(&key, "link", &json!({ "toolkit": app })) {
                Ok(v) => {
                    let url = v["redirect_url"].as_str().unwrap_or_default().to_string();
                    if url.is_empty() {
                        format!("Couldn't make a sign-in link for {app}.")
                    } else {
                        let name = pretty(&app);
                        links.push((name.clone(), url));
                        return Ok(Answer {
                            text: format!("I need access to your {name} first — sign in with the link (just once), then ask me again."),
                            links,
                        });
                    }
                }
                Err(e) => format!("Couldn't make a sign-in link: {e}"),
            }
        } else if step["run"].is_object() {
            let tool = step["run"]["tool"].as_str().unwrap_or_default();
            let args = step["run"]["arguments"].clone();
            let args = if args.is_object() { args } else { json!({}) };
            match router(&key, "execute", &json!({ "tool_slug": tool, "arguments": args })) {
                Ok(v) => {
                    let err = v["error"].as_str().filter(|e| !e.is_empty());
                    match err {
                        Some(e) => format!("{tool} failed: {e}"),
                        None => format!("{tool} result: {}", clip(&v["data"].to_string(), RESULT_CHARS)),
                    }
                }
                Err(e) => format!("{tool} failed: {e}"),
            }
        } else {
            "That wasn't one of the four JSON shapes — reply with search, run, connect or reply.".into()
        };
        messages.push(json!({ "role": "user", "content": format!("[tool output]\n{seen}") }));
    }
    // Out of rounds: say what it got to rather than nothing.
    messages.push(json!({ "role": "user", "content": "Out of steps — reply now with what you found or did, as {\"reply\": …}." }));
    let raw = crate::chat::complete(&messages)?;
    let text = parse_step(&raw)
        .and_then(|v| v["reply"].as_str().map(str::to_string))
        .unwrap_or_else(|| plain(&raw));
    Ok(Answer { text, links })
}

/// The search result, trimmed to what the model needs to pick and call a
/// tool: which tools, how, their inputs, and which apps are connected.
fn describe_search(v: &Value) -> String {
    let mut s = String::new();
    let mut wanted: Vec<String> = Vec::new();
    for r in v["results"].as_array().into_iter().flatten() {
        let tools: Vec<String> = r["primary_tool_slugs"]
            .as_array()
            .into_iter()
            .flatten()
            .filter_map(|t| t.as_str().map(str::to_string))
            .collect();
        s.push_str(&format!("Tools for this: {}\n", tools.join(", ")));
        if let Some(g) = r["execution_guidance"].as_str() {
            s.push_str(&format!("How: {}\n", clip(g, 600)));
        }
        if let Some(steps) = r["recommended_plan_steps"].as_array() {
            let steps: Vec<String> = steps.iter().take(6).map(|x| clip(&x.as_str().map(str::to_string).unwrap_or_else(|| x.to_string()), 200)).collect();
            if !steps.is_empty() {
                s.push_str(&format!("Plan: {}\n", steps.join(" → ")));
            }
        }
        if let Some(p) = r["known_pitfalls"].as_array().filter(|p| !p.is_empty()) {
            s.push_str(&format!("Watch out: {}\n", clip(&p.iter().take(3).map(|x| x.to_string()).collect::<Vec<_>>().join("; "), 400)));
        }
        wanted.extend(tools);
    }
    for c in v["toolkit_connection_statuses"].as_array().into_iter().flatten() {
        let app = c["toolkit"].as_str().unwrap_or("?");
        let on = c["has_active_connection"].as_bool().unwrap_or(false);
        s.push_str(&format!("App {app}: {}\n", if on { "connected" } else { "NOT connected — use {\"connect\": \"<app>\"}" }));
    }
    if let Some(schemas) = v["tool_schemas"].as_object() {
        for slug in wanted.iter().take(4) {
            if let Some(schema) = schemas.get(slug) {
                s.push_str(&format!("Schema {slug}: {}\n", clip(&schema.to_string(), 1800)));
            }
        }
    }
    if s.is_empty() {
        s = format!("Nothing found. {}", clip(&v["error"].to_string(), 300));
    }
    clip(&s, 7000)
}

/// The first JSON object in a model reply (models wrap it in prose or
/// ``` fences now and then).
fn parse_step(raw: &str) -> Option<Value> {
    let start = raw.find('{')?;
    let end = raw.rfind('}')?;
    if end <= start {
        return None;
    }
    serde_json::from_str::<Value>(&raw[start..=end]).ok().filter(|v| v.is_object())
}

fn plain(raw: &str) -> String {
    raw.trim().trim_matches('`').trim().to_string()
}

fn clip(s: &str, max: usize) -> String {
    if s.chars().count() <= max {
        s.to_string()
    } else {
        format!("{}…", s.chars().take(max).collect::<String>())
    }
}

fn pretty(app: &str) -> String {
    match app {
        "gmail" => "Gmail".into(),
        "googlecalendar" => "Google Calendar".into(),
        "googledrive" => "Google Drive".into(),
        "googledocs" => "Google Docs".into(),
        "googlesheets" => "Google Sheets".into(),
        "outlook" => "Outlook".into(),
        "github" => "GitHub".into(),
        "linkedin" => "LinkedIn".into(),
        "youtube" => "YouTube".into(),
        other => {
            let mut c = other.chars();
            c.next().map(|f| f.to_uppercase().collect::<String>() + c.as_str()).unwrap_or_default()
        }
    }
}

/// Check a key works (Settings' "Test" button).
pub fn test_key(key: &str) -> Result<()> {
    let v = post(key.trim(), "/tool_router/session", &json!({ "user_id": user_id(), "premium_usage": false }))?;
    if v["session_id"].is_string() {
        Ok(())
    } else {
        Err(anyhow!("Composio didn't accept that key"))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_the_json_step() {
        assert_eq!(parse_step("```json\n{\"search\": \"unread email\"}\n```").unwrap()["search"], "unread email");
        assert!(parse_step("no json here").is_none());
        let run = parse_step("{\"run\": {\"tool\": \"GMAIL_FETCH_EMAILS\", \"arguments\": {\"max_results\": 5}}}").unwrap();
        assert_eq!(run["run"]["tool"], "GMAIL_FETCH_EMAILS");
    }

    #[test]
    fn search_results_are_trimmed_for_the_model() {
        let v = json!({
            "results": [{ "primary_tool_slugs": ["GMAIL_SEND_EMAIL"], "execution_guidance": "Use it." }],
            "toolkit_connection_statuses": [{ "toolkit": "gmail", "has_active_connection": false }],
            "tool_schemas": { "GMAIL_SEND_EMAIL": { "input_parameters": { "to": "string" } } }
        });
        let s = describe_search(&v);
        assert!(s.contains("GMAIL_SEND_EMAIL") && s.contains("NOT connected") && s.contains("Schema"));
        assert_eq!(pretty("googlecalendar"), "Google Calendar");
        assert_eq!(pretty("slack"), "Slack");
    }
}
