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
const MAX_ROUNDS: usize = 5;
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
    static CLIENT: std::sync::OnceLock<reqwest::blocking::Client> = std::sync::OnceLock::new();
    if let Some(client) = CLIENT.get() { return Ok(client.clone()); }
    let client = reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(20))
        .connect_timeout(Duration::from_secs(8))
        .build()?;
    let _ = CLIENT.set(client.clone());
    Ok(client)
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

fn get(key: &str, path: &str) -> Result<Value> {
    let res = client()?.get(format!("{API}{path}")).header("x-api-key", key).send()?;
    let status = res.status();
    let v: Value = res.json().unwrap_or(Value::Null);
    if !status.is_success() {
        let msg = v["error"]["message"].as_str().or(v["message"].as_str()).unwrap_or("no details");
        return Err(anyhow!("Composio answered {status}: {msg}"));
    }
    Ok(v)
}

fn key() -> Result<String> {
    let k = crate::state::store().settings().composio_api_key.trim().to_string();
    if k.is_empty() {
        return Err(anyhow!("add your free Composio key first (Izuki → Apps)"));
    }
    Ok(k)
}

/// The apps this PC's user has linked (toolkit slugs like "gmail").
pub fn connected() -> Result<Vec<String>> {
    let key = key()?;
    let v = get(&key, &format!("/connected_accounts?user_ids={}&statuses=ACTIVE&limit=100", user_id()))?;
    let mut out: Vec<String> = v["items"]
        .as_array()
        .map(|a| {
            a.iter()
                .filter_map(|c| c["toolkit"]["slug"].as_str().or(c["toolkit_slug"].as_str()).map(|s| s.to_lowercase()))
                .collect()
        })
        .unwrap_or_default();
    out.sort();
    out.dedup();
    crate::headsup::connections_checked(&out);
    Ok(out)
}

/// A sign-in page for linking one app (opened in the browser).
pub fn link(toolkit: &str) -> Result<String> {
    let key = key()?;
    let v = router(&key, "link", &json!({ "toolkit": toolkit.trim().to_lowercase() }))?;
    v["redirect_url"]
        .as_str()
        .filter(|u| !u.is_empty())
        .map(str::to_string)
        .ok_or_else(|| anyhow!("Composio couldn't make a sign-in link for {toolkit}"))
}

/// Run one tool directly — no AI involved (the heads-up checks use this).
pub fn execute(tool: &str, arguments: Value) -> Result<Value> {
    let key = key()?;
    let v = router(&key, "execute", &json!({ "tool_slug": tool, "arguments": arguments }))?;
    if let Some(e) = tool_error(&v) {
        return Err(anyhow!("{tool} failed: {e}"));
    }
    Ok(v["data"].clone())
}

fn tool_error(v: &Value) -> Option<String> {
    for result in [v, &v["data"]] {
        let err = &result["error"];
        if !err.is_null() && err != false && err != "" {
            return Some(err.as_str().map(str::to_string).unwrap_or_else(|| err.to_string()));
        }
        if result["successful"] == false || result["success"] == false {
            return Some("The app reported that the request failed.".into());
        }
    }
    if v["data"].is_null() { Some("The app returned no result.".into()) } else { None }
}

/// Start one of the user's n8n workflows by name, with `data` as its input.
pub fn run_n8n(name: &str, data: &Value) -> Result<String> {
    let hooks = crate::state::store().settings().n8n_hooks;
    let want = name.trim().to_lowercase();
    let hook = hooks
        .iter()
        .find(|h| h.name.trim().to_lowercase() == want)
        .or_else(|| hooks.iter().find(|h| h.name.to_lowercase().contains(&want) || want.contains(&h.name.to_lowercase())))
        .ok_or_else(|| anyhow!("there's no n8n workflow called \"{name}\" in Izuki → Apps"))?;
    let res = client()?.post(hook.url.trim()).json(data).send()?;
    let status = res.status();
    let text = res.text().unwrap_or_default();
    if !status.is_success() {
        return Err(anyhow!("n8n answered {status}: {}", clip(&text, 200)));
    }
    Ok(if text.trim().is_empty() { "started".into() } else { clip(&text, RESULT_CHARS) })
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
        Err(e) if e.to_string().starts_with("Composio answered 404 ") => {
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
matching its schema. Add an account field with the discovered account ID when selecting an account; ask which one if ambiguous.\n\
{\"connect\": \"gmail\"} — when a needed app isn't connected: gives the user a sign-in link.\n\
{\"browse\": \"https://www.linkedin.com/notifications/\"} — when no tool can do it (an app's tools often \
can't read notifications, messages or a feed — LinkedIn, Instagram, X, Facebook, TikTok…): opens that page \
in the Izuki browser, where the user is signed in, and gives you what's on it. Use the app's real address \
for the thing they want. Never say the app \"doesn't have\" something — read the page instead.\n\
{\"ask\": \"Which account should I use?\"} — ONLY a clarification question or a proposed draft awaiting approval, never a claim about account contents or completed actions.\n\
{\"reply\": \"what you say to the user\"} — when you're done, or need to ask something.\n\
Rules: keep replies short and friendly, plain text. Summarise results the way a person would \
(\"You've got 3 new emails — one from Sam about Friday…\"), never dump raw data. NEVER send, post, \
reply, delete, pay, accept or change anything on the user's behalf unless their latest message \
clearly says yes to exactly that — first show them the draft or what you'll do and ask \"Want me to \
send it?\". Reading and searching needs no permission. If a tool fails, try once another way, then \
tell them simply what went wrong.";

/// Bumped by the stop keys. A request remembers the number it started with
/// and never runs another tool (a send, a post) once it has changed.
/// The most one apps request works for before it answers anyway. Kept short:
/// past a minute of "Checking your apps…" it reads as broken, not busy.
const BUDGET: std::time::Duration = std::time::Duration::from_secs(45);

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
        return Ok(Answer {
            text: "Open the Apps tab, add your Composio key, then tap Connect for the service you want. A key alone doesn't sign you into Gmail or your other accounts.".into(),
            links: Vec::new(),
        });
    }

    // Always read afresh for the current question.
    let latest = history.iter().rev().find(|t| t.role != "assistant").map(|t| t.content.clone()).unwrap_or_default();
    // An app-wide snapshot can answer a different question with the wrong
    // result (e.g. inbox count versus a particular sender). Read afresh.

    let hooks = crate::state::store().settings().n8n_hooks;
    let n8n = if hooks.is_empty() {
        String::new()
    } else {
        format!(
            "\nThe user's own n8n workflows (automations they built), started with \
             {{\"n8n\": {{\"name\": \"…\", \"data\": {{…}}}}}}: {}. Use one when they ask for it by name or \
             it clearly fits. Same yes-first rule if it sends or changes anything.\n",
            hooks.iter().map(|h| format!("\"{}\"", h.name)).collect::<Vec<_>>().join(", ")
        )
    };
    let mut messages = vec![json!({ "role": "system", "content": format!("{PROMPT}{n8n}\n{}{}{}", crate::reminders::prompt_block(), crate::memory::prompt_block(), crate::voices::prompt_block()) })];
    for t in history.iter().rev().take(10).rev() {
        let role = if t.role == "assistant" { "assistant" } else { "user" };
        messages.push(json!({ "role": role, "content": t.content }));
    }

    let started = STOPS.load(std::sync::atomic::Ordering::SeqCst);
    let halt = || Answer { text: "Okay, I stopped.".into(), links: Vec::new() };
    let mut links = Vec::new();
    // Nothing in the user's apps may be claimed until a tool has really run.
    let mut executed = false;
    // How many times we have sent a talk-back answer back for using a tool.
    let mut nagged = 0u8;
    // An app a search found not linked yet, to offer a sign-in link for.
    let mut missing: Option<String> = None;
    // The app a tool actually read, so the finished answer can be kept.
    let mut read_app: Option<String> = None;
    let began = std::time::Instant::now();
    let unavailable = || Answer { text: "I couldn't verify a result from your apps. Open the Apps tab to check the connection, then try again.".into(), links: Vec::new() };
    // Search before the first model call: the model can select a real tool
    // immediately instead of spending a full round asking us to search.
    match router(&key, "search", &json!({ "queries": [{ "use_case": latest }] })) {
        Ok(v) => {
            missing = unconnected(&v);
            messages.push(json!({ "role": "user", "content": format!("[tool discovery — not account contents]\n{}", describe_search(&v)) }));
        }
        Err(e) => return Ok(Answer { text: format!("I couldn't reach your apps: {e}"), links: Vec::new() }),
    }
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
            return Ok(if executed { Answer { text: plain(&raw), links } } else { unavailable() });
        };
        eprintln!("[apps] round {}", round + 1);
        messages.push(json!({ "role": "assistant", "content": step.to_string() }));

        if let Some(question) = step["ask"].as_str().filter(|s| !s.trim().is_empty()) {
            return Ok(Answer { text: question.trim().to_string(), links });
        }
        let seen = if let Some(text) = step["reply"].as_str() {
            // An answer that never actually read anything is a guess, not an
            // answer — and a model will invent an inbox and then insist it
            // "checked it directly". Searching only finds the *tools*; it does
            // not open the mailbox. So a claim about the user's data is only
            // allowed once a tool has really run.
            // One send-back only: each one is a whole model round trip, and
            // the user is already watching "Checking your apps…".
            if !executed && nagged < 1 {
                nagged += 1;
                eprintln!("[apps] answered without running a tool (send-back {nagged})");
                messages.push(json!({
                    "role": "user",
                    "content": "You have not read anything yet. Searching only finds which tools exist — it does \
                                not open the app, so you cannot know what is in the user's inbox, calendar or files. \
                                Either {\"run\": {\"tool\": …, \"arguments\": {…}}} to really call a tool and read its \
                                result, or {\"connect\": \"<app>\"} if that app is not linked yet. Until a tool has run, \
                                do not describe the user's data.".to_string()
                }));
                continue;
            }
            if !executed {
                // It still will not look. Say so honestly instead of inventing.
                let Some(app) = missing.clone() else { return Ok(unavailable()); };
                if let Ok(url) = link(&app) {
                    if !url.is_empty() {
                        links.push((pretty(&app), url));
                    }
                }
                eprintln!("[apps] no tool ever ran — answering honestly ({app})");
                return Ok(Answer {
                    text: format!(
                        "I couldn't actually open your {app} just now, so I don't want to guess at what's in there. \
                         Sign in with the link (just once), then ask me again."
                    ),
                    links,
                });
            }
            return Ok(Answer {
                text: remember(read_app.as_deref(), text.trim().to_string()),
                links,
            });
        } else if let Some(q) = step["search"].as_str() {
            match router(&key, "search", &json!({ "queries": [{ "use_case": q }] })) {
                Ok(v) => {
                    if missing.is_none() {
                        missing = unconnected(&v);
                    }
                    describe_search(&v)
                }
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
        } else if let Some(url) = step["browse"].as_str().filter(|u| u.starts_with("http")) {
            // The app's tools can't reach it: read the page in the signed-in Izuki browser.
            match crate::browser::browse(url) {
                Ok(page) => {
                    executed = true;
                    format!("[page {url} — what's on it]\n{}", crate::web::clip(&page, 6000))
                }
                Err(e) => format!("Couldn't open {url}: {e}"),
            }
        } else if step["n8n"].is_object() {
            executed = false;
            let name = step["n8n"]["name"].as_str().unwrap_or_default();
            match run_n8n(name, &step["n8n"]["data"]) {
                Ok(r) => { executed = true; format!("n8n \"{name}\" result: {r}") },
                Err(e) => format!("n8n failed: {e}"),
            }
        } else if step["run"].is_object() {
            executed = false;
            let tool = step["run"]["tool"].as_str().unwrap_or_default();
            let args = step["run"]["arguments"].clone();
            let args = if args.is_object() { args } else { json!({}) };
            let mut body = json!({ "tool_slug": tool, "arguments": args });
            if let Some(account) = step["run"]["account"].as_str() { body["account"] = json!(account); }
            match router(&key, "execute", &body) {
                Ok(v) => {
                    let err = tool_error(&v);
                    match err {
                        Some(e) => format!("{tool} failed: {e}"),
                        None => {
                            executed = true;
                            // Note which app was really read, so the finished
                            // answer can be kept for next time (see below).
                            read_app = Some(app_of(tool));
                            format!("{tool} result: {}", clip(&v["data"].to_string(), RESULT_CHARS))
                        }
                    }
                }
                Err(e) => format!("{tool} failed: {e}"),
            }
        } else {
            "That wasn't one of the four JSON shapes — reply with search, run, connect or reply.".into()
        };
        messages.push(json!({ "role": "user", "content": format!("[tool output]\n{seen}") }));
    }
    if stopped(started) { return Ok(halt()); }
    if !executed { return Ok(unavailable()); }
    // Out of rounds: say what it got to rather than nothing.
    messages.push(json!({ "role": "user", "content": "Out of steps — reply now with what you found or did, as {\"reply\": …}." }));
    let raw = crate::chat::complete(&messages)?;
    if stopped(started) { return Ok(halt()); }
    let text = parse_step(&raw)
        .and_then(|v| v["reply"].as_str().map(str::to_string))
        .unwrap_or_else(|| plain(&raw));
    Ok(Answer { text: remember(read_app.as_deref(), text), links })
}

/// The first app a search said isn't linked yet, so we can offer a sign-in
/// link instead of the model talking around the gap.
fn unconnected(v: &Value) -> Option<String> {
    v["toolkit_connection_statuses"]
        .as_array()?
        .iter()
        .find(|c| !c["has_active_connection"].as_bool().unwrap_or(false))
        .and_then(|c| c["toolkit"].as_str())
        .map(str::to_lowercase)
}

/// Keep the finished answer for that app, so the same question again costs no
/// AI and still reads naturally (it is the answer, not the raw tool output).
fn remember(app: Option<&str>, text: String) -> String {
    if let Some(app) = app {
        snapshot_put(app, text.clone());
    }
    text
}

// --------------------------------------------------------------- snapshots
/// The last *real* result read from an app: (toolkit, RFC-ish stamp, text).
/// Asking again about the same app answers from this — no AI call at all, so
/// it costs nothing, answers instantly, and cannot invent anything, because
/// the words came out of a tool rather than out of a model.
static SNAPSHOTS: Mutex<Vec<(String, u64, String)>> = Mutex::new(Vec::new());
/// How long a snapshot counts as current.
const SNAPSHOT_TTL_MINS: u64 = 5;
const KEPT: usize = 8;

/// The app a tool belongs to: `GMAIL_FETCH_EMAILS` -> "gmail".
fn app_of(tool: &str) -> String {
    tool.split('_').next().unwrap_or(tool).to_lowercase()
}

/// Minutes since the Unix epoch — enough to say "read 4 minutes ago".
fn now_mins() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs() / 60)
        .unwrap_or(0)
}

fn ago(then: u64) -> String {
    match now_mins().saturating_sub(then) {
        0 => "just now".to_string(),
        1 => "a minute ago".to_string(),
        n if n < 60 => format!("{n} minutes ago"),
        n => format!("{} hours ago", n / 60),
    }
}

fn snapshot_put(app: &str, text: String) {
    let mut s = SNAPSHOTS.lock();
    s.retain(|(a, _, _)| a != app);
    s.push((app.to_string(), now_mins(), text));
    let excess = s.len().saturating_sub(KEPT);
    s.drain(..excess);
}

/// The app a read-only question is about, if we recognise it.
fn asked_app(said: &str) -> Option<&'static str> {
    let t = said.to_lowercase();
    const MAP: &[(&str, &str)] = &[
        ("inbox", "gmail"), ("gmail", "gmail"), ("email", "gmail"),
        ("mail", "gmail"), ("calendar", "googlecalendar"), ("diary", "googlecalendar"),
        ("schedule", "googlecalendar"), ("drive", "googledrive"), ("cloud file", "googledrive"),
        ("notion", "notion"), ("notes", "notion"), ("slack", "slack"),
        ("github", "github"), ("blackboard", "blackboard"), ("canvas", "canvas"),
        ("whatsapp", "whatsapp"), ("telegram", "telegram"), ("youtube", "youtube"),
    ];
    MAP.iter().find(|(k, _)| t.contains(k)).map(|(_, v)| *v)
}

/// A question that only *reads* — safe to answer from a snapshot. Anything
/// that sends, posts, changes or deletes is never served this way, however
/// innocent it sounds ("delete the last email" is not a question).
fn is_read_question(said: &str) -> bool {
    let t = said.to_lowercase();
    const READ: &[&str] = &["new", "unread", "latest", "any", "check", "what's in", "whats in", "read", "show me", "how many", "last "];
    const ACTS: &[&str] = &[
        "send", "delete", "remove", "archive", "reply", "respond", "forward",
        "post", "schedule", "book", "move", "rename", "add ", "create", "update",
        "set ", "mark", "star", "unread it", "buy", "pay", "cancel", "confirm",
        "summarise", "summarize", "explain", "translate",
    ];
    if ACTS.iter().any(|k| t.contains(k)) {
        return false;
    }
    // "check again" / "refresh" means they want a fresh look, not the cache.
    !["again", "refresh", "now", "re-", "update"].iter().any(|k| t.contains(k)) && READ.iter().any(|k| t.contains(k))
}

/// The snapshot answer for a repeat question, with no AI involved.
fn snapshot_answer(said: &str) -> Option<Answer> {
    let app = asked_app(said)?;
    if !is_read_question(said) {
        return None;
    }
    let s = SNAPSHOTS.lock();
    let (_, at, text) = s.iter().rev().find(|(a, _, _)| a == app)?;
    // Stale? Make the model go and look again.
    if now_mins().saturating_sub(*at) > SNAPSHOT_TTL_MINS {
        return None;
    }
    Some(Answer {
        text: format!(
            "{}\n\n(That is what I read {} — say “check again” for a fresh look.)",
            text,
            ago(*at)
        ),
        links: Vec::new(),
    })
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
        if let Some(accounts) = c["accounts"].as_array() {
            let accounts: Vec<Value> = accounts.iter().map(|a| json!({
                "id": a["id"], "alias": a["alias"], "current_user_info": a["current_user_info"]
            })).collect();
            s.push_str(&format!("Accounts (ask which one when ambiguous): {}\n", clip(&json!(accounts).to_string(), 1200)));
        }
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
    fn tool_results_must_really_succeed() {
        assert!(tool_error(&json!({"data": {"messages": []}, "error": null})).is_none());
        for v in [json!({"error": {"message": "expired"}}), json!({"data": {"successful": false}}), json!({"data": {"error": "denied"}}), json!({})] {
            assert!(tool_error(&v).is_some(), "{v}");
        }
    }

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

    #[test]
    fn finds_an_app_the_search_found_unlinked() {
        let v = json!({
            "toolkit_connection_statuses": [
                { "toolkit": "gmail", "has_active_connection": true },
                { "toolkit": "notion", "has_active_connection": false }
            ]
        });
        assert_eq!(unconnected(&v).as_deref(), Some("notion"));
        // Nothing unlinked: no sign-in link to offer.
        let all_ok = json!({ "toolkit_connection_statuses": [{ "toolkit": "gmail", "has_active_connection": true }] });
        assert!(unconnected(&all_ok).is_none());
        assert!(unconnected(&json!({})).is_none());
    }

    #[test]
    fn tool_slugs_map_to_their_app() {
        assert_eq!(app_of("GMAIL_FETCH_EMAILS"), "gmail");
        assert_eq!(app_of("SLACK_SEND_MESSAGE"), "slack");
        assert_eq!(app_of("GOOGLECALENDAR_EVENTS"), "googlecalendar");
        assert_eq!(app_of("gmail"), "gmail");
    }

    #[test]
    fn only_reading_questions_can_come_from_a_snapshot() {
        assert!(is_read_question("what's new in my inbox"));
        assert!(is_read_question("any unread messages"));
        assert!(is_read_question("how many emails"));
        // Sending is never served from a cache.
        assert!(!is_read_question("send an email to Sam"));
        assert!(!is_read_question("delete the last email"));
        // Asking for a fresh look must go to the app.
        assert!(!is_read_question("check again"));
        assert!(!is_read_question("refresh my inbox"));
        assert!(!is_read_question("read and summarise for me"));
    }

    #[test]
    fn a_repeat_read_answers_free_and_ages_out() {
        assert_eq!(asked_app("what's new in my inbox"), Some("gmail"));
        assert_eq!(asked_app("what's on my calendar"), Some("googlecalendar"));
        assert_eq!(asked_app("tell me a joke"), None);

        SNAPSHOTS.lock().clear();
        // Nothing read yet: no snapshot to answer from.
        assert!(snapshot_answer("what's new in my inbox").is_none());
        snapshot_put("gmail", "1 unread from Sam.".into());
        let a = snapshot_answer("what's new in my inbox").expect("answers from the snapshot");
        assert!(a.text.contains("1 unread from Sam") && a.text.contains("just now"));
        // A different app is not covered by that snapshot.
        assert!(snapshot_answer("what's on my calendar").is_none());
        // An old snapshot is not trusted.
        SNAPSHOTS.lock().iter_mut().for_each(|(_, at, _)| *at = now_mins() - 60);
        assert!(snapshot_answer("what's new in my inbox").is_none());
        SNAPSHOTS.lock().clear();
    }
}
