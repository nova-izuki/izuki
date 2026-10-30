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
use std::sync::{Arc, atomic::{AtomicBool, AtomicU64, Ordering}};
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

/// The newest extension (extension/manifest.json). Older copies don't know
/// every request Izuki makes (Blackboard, finding your school's tab).
pub const LATEST: &str = "1.5.1";
/// The connected extension's version; empty: one from before 1.4.1, which
/// didn't say.
static VERSION: Mutex<String> = Mutex::new(String::new());

/// "1.4.1" → (1, 4, 1).
fn parts(v: &str) -> (u32, u32, u32) {
    let mut it = v.trim().split('.').map(|p| p.parse::<u32>().unwrap_or(0));
    (it.next().unwrap_or(0), it.next().unwrap_or(0), it.next().unwrap_or(0))
}

/// The connected extension's version, if it said.
pub fn version() -> Option<String> {
    let v = VERSION.lock().clone();
    (!v.is_empty()).then_some(v)
}

/// Connected, but older than this Izuki needs: time to download it again.
pub fn outdated() -> bool {
    connected() && version().is_none_or(|v| parts(&v) < parts(LATEST))
}

/// Is the extension there (it polls at least every ~20 s)?
pub fn connected() -> bool {
    LAST_SEEN.lock().is_some_and(|t| t.elapsed() < Duration::from_secs(30))
}

/// Starts the error of a request the extension took but never answered: it
/// may have happened. Never retried another way — only after a fresh look.
pub const UNCONFIRMED: &str = "unconfirmed:";

/// The browser tab a task is working in (the extension's tab id): page
/// requests go to it even while you're on another tab.
static PINNED: Mutex<Option<i64>> = Mutex::new(None);
/// Which pin this is: a task only takes away its own (a replacement task may
/// have pinned another tab by the time the old one lets go).
static PIN_GEN: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);
/// The pinned tab isn't the one you're looking at (checked at each look):
/// Izuki works in it through the extension only — never the mouse or keys.
static TAB_HIDDEN: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

/// Pin the tab in front for the task starting now. Returns the pin's number
/// (for `unpin_own`); `None` without the extension (or one too old).
pub fn pin_front_tab() -> Option<u64> {
    let gen = PIN_GEN.fetch_add(1, std::sync::atomic::Ordering::SeqCst) + 1;
    PINNED.lock().take();
    TAB_HIDDEN.store(false, std::sync::atomic::Ordering::SeqCst);
    if !connected() {
        return None;
    }
    let v = request("pin", json!({}), Duration::from_secs(3)).ok()?;
    let id = v["tab"].as_i64()?;
    // Another task may have started meanwhile: then its pin stands.
    if PIN_GEN.load(std::sync::atomic::Ordering::SeqCst) != gen {
        return None;
    }
    *PINNED.lock() = Some(id);
    eprintln!("[ext] pinned the task's tab: {}", v["title"].as_str().unwrap_or(""));
    Some(gen)
}

/// The task that pinned `gen` is over: requests go to the tab in front
/// again — unless a newer task has pinned its own tab since.
pub fn unpin_own(gen: u64) {
    if PIN_GEN.load(std::sync::atomic::Ordering::SeqCst) == gen {
        PINNED.lock().take();
        TAB_HIDDEN.store(false, std::sync::atomic::Ordering::SeqCst);
    }
}

/// A tab is pinned for the running task.
pub fn pinned() -> bool {
    PINNED.lock().is_some()
}

/// Is the task's tab out of sight (you switched to another tab, or minimised
/// the browser)? Checked with the extension and remembered for the steps.
pub fn check_tab_hidden() -> bool {
    let Some(id) = *PINNED.lock() else {
        TAB_HIDDEN.store(false, std::sync::atomic::Ordering::SeqCst);
        return false;
    };
    let hidden = match request("tabinfo", json!({ "tab": id }), Duration::from_secs(2)) {
        Ok(v) if v["open"].as_bool() == Some(false) => {
            // Closed: nothing pinned any more — carry on in front.
            PINNED.lock().take();
            false
        }
        Ok(v) => v["visible"].as_bool() == Some(false),
        // Couldn't tell: stay as we were — a hiccup must never hand your
        // screen back to Izuki while you're on another tab.
        Err(_) => TAB_HIDDEN.load(std::sync::atomic::Ordering::SeqCst),
    };
    TAB_HIDDEN.store(hidden, std::sync::atomic::Ordering::SeqCst);
    hidden
}

/// The last `check_tab_hidden`: working in a tab you aren't looking at.
pub fn in_tab_mode() -> bool {
    TAB_HIDDEN.load(std::sync::atomic::Ordering::SeqCst)
}

/// Scroll the page in the task's tab (no mouse).
pub fn scroll(dy: i32) -> Result<()> {
    request("scroll", json!({ "dy": dy }), Duration::from_secs(4)).map(|_| ())
}

/// Ask the extension to do something and wait for the answer.
pub fn request(op: &str, args: Value, timeout: Duration) -> Result<Value> {
    if !connected() {
        return Err(anyhow!("the Izuki browser extension isn't connected"));
    }
    // Page work goes to the task's own tab while one is pinned.
    let mut args = args;
    if matches!(op, "snapshot" | "click" | "type" | "scroll" | "open") {
        if let (Some(id), Some(map)) = (*PINNED.lock(), args.as_object_mut()) {
            map.entry("tab").or_insert(json!(id));
        }
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
    let v = match out {
        Ok(v) => v,
        Err(_) => {
            // Never picked up (the browser was asleep): nothing happened, so
            // the screen can do it instead. Picked up but unanswered: it may
            // well have gone through (a link that navigated) — doing it again
            // with the mouse would click twice, so take a fresh look instead.
            let mut q = QUEUE.lock();
            let waiting = q.len();
            q.retain(|j| j.id != id);
            if q.len() < waiting {
                return Err(anyhow!("the browser extension didn't answer in time"));
            }
            return Err(anyhow!("{UNCONFIRMED} the page didn't confirm in time — it may have gone through; take a fresh look before doing it again"));
        }
    };
    if v["ok"].as_bool() == Some(false) {
        return Err(anyhow!("{}", v["error"].as_str().unwrap_or("the browser couldn't do that")));
    }
    Ok(v["data"].clone())
}

/// Only the extension may talk to the bridge.
fn trusted(req: &tiny_http::Request) -> bool {
    let header = |name: &str| req.headers().iter().find(|h| h.field.to_string().eq_ignore_ascii_case(name)).map(|h| h.value.as_str().to_string());
    let from_extension = header("Origin").map_or(true, |o| extension_origin(&o));
    from_extension && header("X-Izuki-Extension").is_some()
}

fn extension_origin(origin: &str) -> bool {
    let Some((scheme, host)) = origin.split_once("://") else { return false };
    matches!(scheme, "chrome-extension" | "moz-extension") && !host.is_empty() && host.len() <= 80
        && host.bytes().all(|c| c.is_ascii_alphanumeric() || c == b'-')
}

/// Browser-supplied Origin scopes the new side-panel controls. Old extension
/// helpers without Origin still work, but cannot start desktop tasks.
fn request_origin(req: &tiny_http::Request) -> String {
    req.headers().iter().find(|h| h.field.to_string().eq_ignore_ascii_case("Origin"))
        .map(|h| h.value.as_str().to_string()).unwrap_or_default()
}

#[derive(Clone, Debug, Eq, PartialEq, Hash)]
struct SideKey { origin: String, request: String, kind: &'static str }

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
enum SideState { Prepared, Running, Finished, Cancelled }

impl SideState {
    fn name(self) -> &'static str {
        match self { Self::Prepared => "prepared", Self::Running => "running", Self::Finished => "finished", Self::Cancelled => "cancelled" }
    }
}

#[derive(Clone)]
struct TaskReview { token: String, prompt: String, tab: i64, url: String, at: Instant }

struct SideWork {
    id: u64,
    stop: Arc<AtomicBool>,
    state: SideState,
    updated: Instant,
    text: String,
    outcome: Option<String>,
    review: Option<TaskReview>,
}

impl SideWork {
    fn new(state: SideState) -> Self {
        static NEXT: AtomicU64 = AtomicU64::new(1 << 63);
        Self { id: NEXT.fetch_add(1, Ordering::Relaxed), stop: Arc::new(AtomicBool::new(state == SideState::Cancelled)),
            state, updated: Instant::now(), text: String::new(), outcome: None, review: None }
    }
    fn json(&self) -> Value {
        json!({"ok":true,"state":self.state.name(),"text":self.text,"outcome":self.outcome})
    }
}

static SIDE_WORK: Mutex<Option<HashMap<SideKey, SideWork>>> = Mutex::new(None);
static SIDE_TASK_RUNNING: AtomicBool = AtomicBool::new(false);
const REVIEW_TTL: Duration = Duration::from_secs(120);
const SIDE_TTL: Duration = Duration::from_secs(300);
const SIDE_LIMIT: usize = 64;

fn side_id(v: &Value) -> Result<String> {
    let id = match &v["requestId"] {
        Value::String(s) if !s.is_empty() && s.len() <= 128 && s.bytes().all(|c| c.is_ascii_alphanumeric() || b"-_:.".contains(&c)) => s.clone(),
        Value::Number(n) => n.as_u64().filter(|n| *n <= 9_007_199_254_740_991).map(|n| n.to_string()).ok_or_else(|| anyhow!("Use a unique requestId."))?,
        _ => return Err(anyhow!("Use a unique requestId.")),
    };
    Ok(id)
}

fn side_key(origin: &str, v: &Value, kind: &'static str) -> Result<SideKey> {
    Ok(SideKey { origin: origin.into(), request: side_id(v)?, kind })
}

/// Keep cancellation tombstones long enough to cover Stop arriving before
/// the request's worker starts. Never evict a running worker.
fn tidy_side(map: &mut HashMap<SideKey, SideWork>) {
    map.retain(|_, work| work.state == SideState::Running
        || work.updated.elapsed() < if work.state == SideState::Prepared { REVIEW_TTL } else { SIDE_TTL });
    while map.len() >= SIDE_LIMIT {
        let oldest = map.iter().filter(|(_, w)| matches!(w.state, SideState::Finished | SideState::Cancelled))
            .min_by_key(|(_, w)| w.updated).map(|(k, _)| k.clone());
        match oldest { Some(key) => { map.remove(&key); }, None => break }
    }
}

fn begin_side_chat(origin: &str, v: &Value) -> Result<(SideKey, u64, Arc<AtomicBool>)> {
    let key = if v.get("requestId").is_some() { side_key(origin, v, "chat")? }
        else { SideKey { origin: origin.into(), request: uuid::Uuid::new_v4().to_string(), kind: "chat" } };
    let mut all = SIDE_WORK.lock();
    let map = all.get_or_insert_with(HashMap::new);
    tidy_side(map);
    if let Some(work) = map.get(&key) {
        return Err(anyhow!(if work.stop.load(Ordering::SeqCst) { "Stopped." } else { "That request already exists. Use a new requestId." }));
    }
    if map.len() >= SIDE_LIMIT || map.values().filter(|w| w.state == SideState::Running).count() >= 8 {
        return Err(anyhow!("Izuki is busy with other browser requests. Stop one or try again shortly."));
    }
    let work = SideWork::new(SideState::Running);
    let result = (key.clone(), work.id, work.stop.clone());
    map.insert(key, work);
    Ok(result)
}

fn finish_side(key: &SideKey, text: String, outcome: Option<String>) {
    if let Some(work) = SIDE_WORK.lock().as_mut().and_then(|m| m.get_mut(key)) {
        work.updated = Instant::now();
        work.review = None;
        if work.stop.load(Ordering::SeqCst) {
            work.state = SideState::Cancelled;
            work.text = "Stopped.".into();
            work.outcome = Some("cancelled".into());
        } else {
            work.state = SideState::Finished;
            work.text = text;
            work.outcome = outcome;
        }
    }
}

fn cancel_side(origin: &str, v: &Value) -> Result<Value> {
    let kind = match v["kind"].as_str().unwrap_or("chat") {
        "chat" => "chat", "task" => "task", _ => return Err(anyhow!("Unknown request kind.")),
    };
    let key = side_key(origin, v, kind)?;
    let mut all = SIDE_WORK.lock();
    let map = all.get_or_insert_with(HashMap::new);
    tidy_side(map);
    if !map.contains_key(&key) && map.len() >= SIDE_LIMIT { return Err(anyhow!("Too many pending browser requests.")); }
    let work = map.entry(key).or_insert_with(|| SideWork::new(SideState::Cancelled));
    if work.state != SideState::Finished {
        work.stop.store(true, Ordering::SeqCst);
        if kind == "chat" { crate::chat::cancel(work.id); }
        // A running task stays Running until its worker observes cancellation;
        // the UI must not treat a request to stop as proof a click has ended.
        if work.state != SideState::Running { work.state = SideState::Cancelled; }
        work.review = None;
        work.updated = Instant::now();
        work.text = if work.state == SideState::Running { "Stopping at the next safe boundary…" } else { "Stopped." }.into();
    }
    Ok(json!({"ok":true,"cancelled":true,"state":work.state.name(),"text":work.text}))
}

fn side_error(error: impl std::fmt::Display) -> Value {
    json!({"ok":false,"text":error.to_string()})
}

fn task_review(v: &Value) -> Result<TaskReview> {
    let prompt = v["prompt"].as_str().unwrap_or("").trim();
    if prompt.is_empty() || prompt.chars().count() > 400 {
        return Err(anyhow!("Type a desktop task of 1–400 characters, then review it before running."));
    }
    let tab = v["tabId"].as_i64().filter(|id| *id >= 0).ok_or_else(|| anyhow!("Choose an open browser tab first."))?;
    let url = v["url"].as_str().unwrap_or("");
    let parsed = reqwest::Url::parse(url).map_err(|_| anyhow!("Open a normal webpage before handing over a task."))?;
    if !matches!(parsed.scheme(), "http" | "https") || parsed.host_str().is_none()
        || !parsed.username().is_empty() || parsed.password().is_some() || url.len() > 4000 {
        return Err(anyhow!("Desktop handoff needs a normal webpage without embedded credentials."));
    }
    Ok(TaskReview { token: uuid::Uuid::new_v4().to_string(), prompt: prompt.into(), tab, url: url.into(), at: Instant::now() })
}

fn source_tab_matches(review: &TaskReview, info: &Value) -> bool {
    info["open"] == true && info["visible"] == true && info["focused"] == true
        && info["tab"].as_i64() == Some(review.tab) && info["url"].as_str() == Some(review.url.as_str())
}

fn check_task_source(review: &TaskReview) -> Result<()> {
    if crate::uia::screen_locked() { return Err(anyhow!("Unlock your PC before running this task.")); }
    let info = request("tabinfo", json!({"tab":review.tab}), Duration::from_secs(3))?;
    if !source_tab_matches(review, &info) {
        return Err(anyhow!("The page changed or its window is no longer in front. Return to that tab and review the task again."));
    }
    Ok(())
}

fn prepare_side_task(origin: &str, v: &Value) -> Result<Value> {
    if !extension_origin(origin) { return Err(anyhow!("Desktop handoff must come from Izuki's browser side panel.")); }
    let key = side_key(origin, v, "task")?;
    let review = task_review(v)?;
    check_task_source(&review)?;
    let mut all = SIDE_WORK.lock();
    let map = all.get_or_insert_with(HashMap::new);
    tidy_side(map);
    if map.contains_key(&key) { return Err(anyhow!("That request already exists or was stopped. Review it with a new requestId.")); }
    if map.len() >= SIDE_LIMIT { return Err(anyhow!("Too many pending browser requests. Try again shortly.")); }
    let out = json!({"ok":true,"state":"prepared","reviewToken":review.token,"prompt":review.prompt,
        "text":"Review this exact request, then press Run with Izuki. Nothing has run yet."});
    let mut work = SideWork::new(SideState::Prepared);
    work.text = "Waiting for you to review and run this request.".into();
    work.review = Some(review);
    map.insert(key, work);
    Ok(out)
}

fn consume_review(work: &mut SideWork, token: &str) -> Result<TaskReview> {
    if work.state != SideState::Prepared || work.stop.load(Ordering::SeqCst) { return Err(anyhow!("This task was already started or stopped. Review a new request.")); }
    let review = work.review.as_ref().ok_or_else(|| anyhow!("Review this task before running it."))?;
    if token.is_empty() || token != review.token { return Err(anyhow!("The review token does not match this request.")); }
    if review.at.elapsed() >= REVIEW_TTL { return Err(anyhow!("This review expired. Review the task again before running it.")); }
    let review = work.review.take().expect("review was checked");
    work.state = SideState::Running;
    work.updated = Instant::now();
    work.text = "Working on your reviewed request. Press Esc in Izuki to stop.".into();
    Ok(review)
}

struct SideTaskLane;
impl Drop for SideTaskLane {
    fn drop(&mut self) { SIDE_TASK_RUNNING.store(false, Ordering::SeqCst); }
}

fn run_side_task(origin: &str, v: &Value) -> Result<Value> {
    if !extension_origin(origin) { return Err(anyhow!("Desktop handoff must come from Izuki's browser side panel.")); }
    let key = side_key(origin, v, "task")?;
    let token = v["reviewToken"].as_str().unwrap_or("");
    let app = crate::state::app().ok_or_else(|| anyhow!("Izuki is still starting. Try again shortly."))?.clone();
    let store = crate::state::try_store().ok_or_else(|| anyhow!("Izuki is still starting. Try again shortly."))?;
    if crate::state::task_running() || SIDE_TASK_RUNNING.compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst).is_err() {
        return Err(anyhow!("Another desktop task is running. Finish or stop it before starting this one."));
    }
    let lane = SideTaskLane;
    let (review, stop) = {
        let mut all = SIDE_WORK.lock();
        let work = all.as_mut().and_then(|m| m.get_mut(&key)).ok_or_else(|| anyhow!("Review the task first."))?;
        (consume_review(work, token)?, work.stop.clone())
    };
    let task_key = key.clone();
    let spawned = std::thread::Builder::new().name("izuki-panel-task".into()).spawn(move || {
        let _lane = lane;
        let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| -> Result<(String, String)> {
            let cancelled = stop.clone();
            let contract = crate::execution::TaskContract::new(&review.prompt);
            let scope = crate::execution::Scope::enter(&contract, move || cancelled.load(Ordering::SeqCst)).map_err(|e| anyhow!(e))?;
            crate::execution::check().map_err(|r| anyhow!(r.explanation()))?;
            check_task_source(&review)?;
            // A newer desktop request may have started during source validation.
            if crate::state::task_running() { return Err(anyhow!("Another desktop task started. Review this one again when it finishes.")); }
            crate::execution::check().map_err(|r| anyhow!(r.explanation()))?;
            // Only the reviewed, user-written prompt is action authority.
            // Neither page content nor a provider's answer is appended here.
            let plan = crate::brain::submit_voice_command(&app, &store, review.prompt.clone());
            let usage = scope.usage();
            if let Some(reason) = usage.stop_reason {
                if reason == crate::execution::StopReason::Cancelled { stop.store(true, Ordering::SeqCst); }
                return Ok((reason.explanation().into(), if reason == crate::execution::StopReason::Cancelled { "cancelled" } else { "partial" }.into()));
            }
            let outcome = serde_json::to_value(&plan.outcome).ok().and_then(|v| v.as_str().map(str::to_string)).unwrap_or_else(|| "unknown".into());
            Ok((plan.summary, outcome))
        }));
        let (text, outcome) = match result {
            Ok(Ok(pair)) => pair,
            Ok(Err(error)) => (crate::brain::plain_error(&error.to_string()), "blocked".into()),
            Err(_) => ("The desktop task stopped unexpectedly. Check the page before trying again.".into(), "failed".into()),
        };
        finish_side(&task_key, text, Some(outcome));
    });
    if spawned.is_err() {
        finish_side(&key, "Izuki couldn't start that task. Try again shortly.".into(), Some("failed".into()));
        return Err(anyhow!("Izuki couldn't start that task."));
    }
    Ok(json!({"ok":true,"state":"running","text":"Izuki is checking the source page before starting."}))
}

fn side_task_status(origin: &str, v: &Value) -> Result<Value> {
    let key = side_key(origin, v, "task")?;
    let mut all = SIDE_WORK.lock();
    let map = all.get_or_insert_with(HashMap::new);
    tidy_side(map);
    map.get(&key).map(SideWork::json).ok_or_else(|| anyhow!("This task is no longer available. Review a new request."))
}

fn companion_preference(v: Option<&Value>) -> Result<Value> {
    let store = crate::state::try_store().ok_or_else(|| anyhow!("Izuki is still starting."))?;
    if let Some(v) = v {
        let show = v["show"].as_bool().ok_or_else(|| anyhow!("Choose whether to show the desktop companion."))?;
        let mut settings = store.settings();
        settings.glow_only = !show;
        store.set_settings(settings);
        crate::state::settings_changed_elsewhere();
    }
    Ok(json!({"ok":true,"show":!store.settings().glow_only}))
}

fn read_json_body(req: &mut tiny_http::Request, limit: u64) -> Result<Value> {
    let mut body = String::new();
    req.as_reader().take(limit + 1).read_to_string(&mut body)?;
    if body.len() as u64 > limit { return Err(anyhow!("This browser request is too large.")); }
    serde_json::from_str(&body).map_err(|_| anyhow!("The browser request was not valid JSON."))
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
                if let Some(v) = req.headers().iter().find(|h| h.field.to_string().eq_ignore_ascii_case("X-Izuki-Extension-Version")) {
                    let v = v.value.as_str().trim();
                    if !v.is_empty() && v.len() < 20 {
                        *VERSION.lock() = v.to_string();
                    }
                }
                let url = req.url().to_string();
                // The extension's own smart features: Explain / Translate /
                // Sum up / Ask about this page, Save to Notes, Remind me later,
                // and the Focus guard. Answers take a few seconds, so each runs
                // on its own thread and the bridge stays free.
                if url.starts_with("/izuki/ask") || url.starts_with("/izuki/note") || url.starts_with("/izuki/later") || url.starts_with("/izuki/focus") {
                    let origin = request_origin(&req);
                    let body = read_json_body(&mut req, 400_000);
                    std::thread::spawn(move || {
                        let out = match body {
                            Ok(v) => page_helper(&url, &v, &origin),
                            Err(error) => side_error(error),
                        };
                        let _ = req.respond(json_response(out));
                    });
                    continue;
                }
                // The side panel's desktop handoff, in the order it has to
                // happen: prepare shows the person the exact words and hands
                // back a token, run needs that token back, status says how it
                // went, and stop ends it. Only the reviewed prompt carries any
                // authority — never the page, never an AI tab's answer.
                let side = ["/izuki/side/prepare", "/izuki/side/run", "/izuki/side/status", "/izuki/side/stop", "/izuki/companion"]
                    .into_iter()
                    .find(|route| url.starts_with(route));
                if let Some(route) = side {
                    let origin = request_origin(&req);
                    let body = read_json_body(&mut req, 8_000);
                    std::thread::spawn(move || {
                        let out = match body {
                            Err(e) => side_error(e),
                            Ok(v) => {
                                let done = match route {
                                    "/izuki/side/prepare" => prepare_side_task(&origin, &v),
                                    "/izuki/side/run" => run_side_task(&origin, &v),
                                    "/izuki/side/status" => side_task_status(&origin, &v),
                                    "/izuki/side/stop" => cancel_side(&origin, &v),
                                    _ => companion_preference(if v["read"].as_bool() == Some(true) { None } else { Some(&v) }),
                                };
                                done.unwrap_or_else(side_error)
                            }
                        };
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
fn page_helper(url: &str, v: &Value, origin: &str) -> Value {
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
    let (key, id, stop) = match begin_side_chat(origin, v) {
        Ok(work) => work,
        Err(error) => return side_error(error),
    };
    let cancelled = stop.clone();
    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| -> Result<String> {
        let contract = crate::execution::TaskContract::new(&job);
        let _scope = crate::execution::Scope::enter(&contract, move || cancelled.load(Ordering::SeqCst)).map_err(|e| anyhow!(e))?;
        crate::execution::check().map_err(|r| anyhow!(r.explanation()))?;
        // The browser panel gets the same read-only backend tools as Island
        // chat. Page text cannot run desktop actions in this lane.
        crate::chat::complete_with_web(&msgs, id, false, &|_| {})
    }));
    let (ok, text) = match result {
        Ok(Ok(text)) => (true, text.trim().to_string()),
        Ok(Err(error)) => (false, crate::brain::plain_error(&error.to_string())),
        Err(_) => (false, "That browser answer stopped unexpectedly. Please try again.".into()),
    };
    finish_side(&key, text.clone(), Some(if ok { "answered" } else { "failed" }.into()));
    if stop.load(Ordering::SeqCst) { side_error("Stopped.") } else { json!({"ok":ok,"text":text}) }
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
    for linked in v["linked"].as_array().into_iter().flatten().take(4) {
        let t = linked["title"].as_str().unwrap_or_default();
        let body = cut(linked["text"].as_str().unwrap_or_default(), 3000);
        if !body.trim().is_empty() {
            context.push_str(&format!("\n\n--- A page linked from this one, read in the background: {t} ---\n{body}"));
        }
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

// ---------------------------------------------------------------------------
// Look-ahead: the answer is often behind a link on the page (the syllabus,
// the assignment details). The pages most related to the question are read
// in the background by the browser itself (with your sign-ins), never shown.
// ---------------------------------------------------------------------------

/// Links whose mere visit could change something: never read in the background.
fn risky_link(name: &str, url: &str) -> bool {
    let t = format!("{name} {url}").to_lowercase();
    ["logout", "log out", "log-out", "signout", "sign out", "sign-out", "delete", "remove", "unsubscribe", "cancel", "submit",
     "checkout", "buy", "pay", "purchase", "order", "confirm", "approve", "reset", "javascript:", "mailto:", "tel:"]
        .iter()
        .any(|w| t.contains(w))
}

/// Does this sound like a question to answer (rather than a job to do)?
pub fn is_question(prompt: &str) -> bool {
    let p = prompt.trim().to_lowercase();
    p.contains('?')
        || ["what", "why", "how", "who", "when", "which", "where", "explain", "answer", "solve", "tell me", "summar", "is ", "are ", "does ", "do ", "can ", "help me understand", "due"]
            .iter()
            .any(|w| p.starts_with(w))
}

/// The page's links most related to the question: (name, url), best first.
pub fn related_links(page: &Page, question: &str, max: usize) -> Vec<(String, String)> {
    const SKIP: &[&str] = &["what", "which", "where", "when", "does", "this", "that", "with", "from", "have", "about", "there", "their", "page", "please", "answer", "question", "tell"];
    let words: Vec<String> = question
        .to_lowercase()
        .split(|c: char| !c.is_alphanumeric())
        .filter(|w| w.len() >= 3 && !SKIP.contains(w))
        .map(str::to_string)
        .collect();
    let host = |u: &str| u.split("//").nth(1).and_then(|r| r.split('/').next()).unwrap_or("").to_string();
    let here = host(&page.url);
    let mut scored: Vec<(i32, String, String)> = Vec::new();
    for e in &page.elements {
        let Some(url) = e.href.as_deref() else { continue };
        if !url.starts_with("http") || url.split('#').next() == page.url.split('#').next() || risky_link(&e.name, url) {
            continue;
        }
        let name = e.name.to_lowercase();
        let mut score: i32 = words.iter().filter(|w| name.contains(w.as_str())).count() as i32 * 10;
        // Course pages people usually mean, even without the exact words.
        if ["syllabus", "instructions", "details", "rubric", "assignment", "overview", "guidelines", "readme", "docs", "documentation", "faq"].iter().any(|k| name.contains(k)) {
            score += 3;
        }
        if host(url) == here {
            score += 2;
        }
        if score >= 10 && !scored.iter().any(|(_, _, u)| u == url) {
            scored.push((score, e.name.clone(), url.to_string()));
        }
    }
    scored.sort_by(|a, b| b.0.cmp(&a.0));
    scored.into_iter().take(max).map(|(_, n, u)| (n, u)).collect()
}

/// Read those pages in the background (through the browser, so school and
/// work sign-ins apply): their words, labelled, ready to go to the brain.
pub fn read_links(links: &[(String, String)]) -> String {
    if links.is_empty() {
        return String::new();
    }
    let urls: Vec<&str> = links.iter().map(|(_, u)| u.as_str()).collect();
    let Ok(v) = request("readlinks", serde_json::json!({ "urls": urls }), Duration::from_secs(7)) else { return String::new() };
    let mut out = String::new();
    for (i, page) in v.as_array().into_iter().flatten().enumerate() {
        let text = page["text"].as_str().unwrap_or_default().trim();
        if text.is_empty() {
            continue;
        }
        let name = links.get(i).map(|(n, _)| n.as_str()).unwrap_or_default();
        out.push_str(&format!("--- Linked page \"{name}\" (read in the background) ---\n{}\n", text.chars().take(2500).collect::<String>()));
    }
    out
}

/// Ask for the page in front. `None` when there's no extension.
pub fn snapshot() -> Option<Page> {
    if !connected() {
        return None;
    }
    let v = request("snapshot", json!({}), Duration::from_millis(2500)).ok()?;
    let page = parse_page(&v);
    *LAST_URL.lock() = Some((page.url.clone(), crate::uia::foreground_hwnd()));
    Some(page)
}

/// The address of the page last read, and the window it was in front in.
static LAST_URL: Mutex<Option<(String, Option<isize>)>> = Mutex::new(None);

/// That address — only while the same browser window is still in front (no new request).
pub fn snapshot_url_cached() -> Option<String> {
    let (url, win) = LAST_URL.lock().clone()?;
    (url.starts_with("http") && win.is_some() && win == crate::uia::foreground_hwnd()).then_some(url)
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
    fn browser_chat_cancel_is_scoped_and_covers_stop_before_start() {
        let origin = "chrome-extension://test-panel";
        let request = json!({"requestId":uuid::Uuid::new_v4().to_string(),"kind":"chat"});
        cancel_side(origin, &request).unwrap();
        assert!(begin_side_chat(origin, &request).is_err(), "Stop before worker start must suppress it");
        let request = json!({"requestId":uuid::Uuid::new_v4().to_string(),"kind":"chat"});
        let (key, _, stopped) = begin_side_chat(origin, &request).unwrap();
        cancel_side("chrome-extension://other-panel", &request).unwrap();
        assert!(!stopped.load(Ordering::SeqCst), "another extension cannot cancel this request");
        cancel_side(origin, &request).unwrap();
        assert!(stopped.load(Ordering::SeqCst));
        finish_side(&key, "a late answer".into(), None);
        let all = SIDE_WORK.lock();
        let work = all.as_ref().unwrap().get(&key).unwrap();
        assert_eq!(work.state, SideState::Cancelled);
        assert_eq!(work.text, "Stopped.");
    }

    #[test]
    fn compares_versions() {
        assert!(parts("1.4.0") < parts(LATEST));
        assert!(parts("1.10.0") > parts("1.4.1"));
        // LATEST is the extension this build ships: they never drift apart.
        let manifest: Value = serde_json::from_str(include_str!("../../extension/manifest.json")).unwrap();
        assert_eq!(manifest["version"].as_str(), Some(LATEST));
    }

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

#[cfg(test)]
mod look_ahead_tests {
    use super::*;

    fn el(name: &str, href: &str) -> Element {
        Element { dom_id: "x".into(), kind: "Link".into(), name: name.into(), href: Some(href.into()), rect: crate::model::Rect { x: 0, y: 0, w: 10, h: 10 } }
    }

    #[test]
    fn reads_the_links_that_matter_and_never_risky_ones() {
        let page = Page {
            url: "https://school.edu/course/1".into(),
            title: "Course".into(),
            text: String::new(),
            elements: vec![
                el("Grades", "https://school.edu/grades"),
                el("Assignment 3 guidelines", "https://school.edu/a3"),
                el("Log out", "https://school.edu/logout"),
                el("Delete assignment 3", "https://school.edu/a3/delete"),
            ],
            viewport: crate::model::Rect { x: 0, y: 0, w: 100, h: 100 },
        };
        let links = related_links(&page, "when is assignment 3 due?", 3);
        assert_eq!(links.first().map(|(n, _)| n.as_str()), Some("Assignment 3 guidelines"));
        assert!(links.iter().all(|(n, _)| !n.contains("Log out") && !n.contains("Delete")));
        assert!(is_question("what does this error mean"));
        assert!(!is_question("open youtube"));
    }
}
