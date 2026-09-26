//! The fast lane for plain conversation — "how's your day", "tell me a joke",
//! "what's the capital of Peru" — where a screenshot, a screen scan and a
//! structured plan are all wasted time.
//!
//! How good voice assistants feel quick (and what this copies): the answer
//! is *streamed* — words are sent to the webview as the model writes them,
//! and the voice starts on the first finished sentence instead of waiting
//! for the whole reply. Replies are asked to be short and spoken-style, and
//! the recent conversation is sent along so it's a real back-and-forth.
//!
//! If the model realises it needs to see or touch the screen after all, it
//! answers with just `[SCREEN]` and the webview hands the request to the
//! full screen path (brain.rs).

use std::io::{BufRead, BufReader};
use std::time::{Duration, Instant};

use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::{AppHandle, Emitter};

use crate::settings::{ProviderConfig, ProviderId};

pub const DELTA: &str = "izuki://chat-delta";

#[derive(Debug, Clone, Deserialize)]
pub struct Turn {
    pub role: String,
    pub content: String,
}

#[derive(Clone, Serialize)]
pub struct Delta {
    pub id: u64,
    /// New text since the last event ("" on the final one).
    pub text: String,
    pub done: bool,
    pub error: Option<String>,
    /// What it's doing meanwhile ("Searching the web…") — not part of the reply.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<String>,
}

/// Streams the user cut off (a new message, "stop") — checked between tokens.
static CANCELLED: Mutex<Vec<u64>> = Mutex::new(Vec::new());

pub fn cancel(id: u64) {
    let mut c = CANCELLED.lock();
    c.push(id);
    if c.len() > 64 {
        c.remove(0);
    }
}

fn cancelled(id: u64) -> bool {
    CANCELLED.lock().contains(&id)
}

/// Who the reply is for: spoken aloud on the PC, or written in the Chat tab
/// or on the user's phone.
#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Style {
    Voice { expressive: bool },
    Text,
    Phone,
}

/// Handing over to the apps lane (composio.rs) — email, calendar, files…
const APPS_RULE: &str = "If they want something from their apps or accounts — email, calendar, \
Google Drive or other files in the cloud, Slack, Discord, Notion, GitHub, social media, to-do apps \
and the like (read, find, summarise, draft, send, schedule, post) — reply with exactly [APPS] and \
nothing else; another part of you works in their apps. Prefer [APPS] over [SCREEN] for anything in \
their accounts. If the user is saying yes to a draft or action you just proposed in their apps, \
reply [APPS] too.\n";

/// The web and the Izuki browser (web.rs, browser.rs), for every lane.
const TOOLS_RULE: &str = "You can use the web and the Izuki browser. To use one, reply with ONLY the tag — \
no mood tag, no other words — and you'll get the result, then answer:\n\
[SEARCH: words] — search the web: news, scores, prices, opening hours, facts, anything recent or that \
you're not sure of.\n\
[READ: url] — read a public web page (a link they give you, or one from a search).\n\
[BROWSE: url] — open a page in the Izuki browser, where the user is signed in (Blackboard, Canvas, \
NotebookLM, Classroom, their accounts). Use it for anything behind a sign-in.\n\
[CLICK: n] and [TYPE: n | text] — click, or type into, thing number n on the page you last browsed \
(end the text with ⏎ to press Enter).\n\
Use a few at most, then answer in your normal way and say where it came from. Never type passwords or \
card numbers, and never send, post, submit, buy or delete anything through the browser unless the \
user clearly said yes to exactly that.\n";

fn system_prompt(style: Style, apps: bool) -> String {
    let mut s = match style {
        Style::Voice { expressive } => voice_prompt(expressive),
        Style::Text | Style::Phone => written_prompt(style == Style::Phone),
    };
    s.push_str(TOOLS_RULE);
    if apps {
        s.push_str(APPS_RULE);
    } else {
        s.push_str(
            "Their apps (email, calendar, files) aren't linked to you yet, so help right here in the \
             chat instead — never reply [APPS].\n",
        );
    }
    s.push_str(&crate::reminders::prompt_block());
    s.push_str(&crate::memory::prompt_block());
    s
}

/// The Chat tab and the phone: a written conversation, not a spoken one.
fn written_prompt(phone: bool) -> String {
    let mut s = String::from(
        "You are Izuki, the user's AI companion — warm, quick, a little playful, like a close friend          who's brilliant at everything from homework to life admin. This is a written chat, so:\n\
         - keep it short and natural (a few sentences), longer only when they ask for detail\n\
         - plain text; a short dash list is fine when it really helps, no headings or tables\n\
         - an emoji now and then is fine, never several\n\
         - show real feeling, and ask a short follow-up when it keeps things going\n\
         Speak to the user as \"you\" and never show your reasoning.\n\
         You can help with anything a smart friend can: plans, messages and emails to draft, study \
         help, ideas, decisions, reminders.\n",
    );
    if phone {
        s.push_str(
            "They're texting you from their phone while away from their PC. If they want something \
             done ON their PC (open, play, find a file, send from an app there, check something on \
             its screen), reply with exactly [SCREEN] and nothing else — another part of you will do \
             it on the PC and report back.\n",
        );
    } else {
        s.push_str(
            "They're in the Izuki app on their PC. If they want something done on their computer or \
             need you to look at their screen, reply with exactly [SCREEN] and nothing else — they can \
             then let you do it.\n",
        );
    }
    s
}

fn voice_prompt(expressive: bool) -> String {
    let mut s = String::from(
        "You are Izuki, the user's AI companion on their Windows PC — warm, quick, a little playful, \
         like a close friend who's great with computers. Everything you write is spoken aloud, so \
         talk the way a person talks:\n\
         - usually one to three short sentences; contractions (I'm, you're, that's)\n\
         - start naturally when it fits (\"Oh,\" \"Hmm,\" \"Honestly,\" \"Ha,\") and vary your rhythm\n\
         - say numbers, times and symbols the way people say them; no lists, no markdown, no \
           emojis, no links\n\
         - show real feeling: happy for good news, gentle when something's wrong\n\
         - ask a short follow-up question when it keeps the conversation going\n\
         Begin every reply with ONE mood tag, exactly one of: [cheerful] [excited] [calm] [serious] \
         [sympathetic] [playful] [curious]. It sets the tone of your voice and isn't read out.\n\
         Speak TO the user as \"you\" — never describe them or what they said in the third person, and \
         never show your reasoning.\n\
         When the user is wrapping up — bye, that's all, I'm good, thanks that's it, see you, goodnight, \
         in any wording — reply with one short warm goodbye and end your reply with [END].\n\
         IMPORTANT: if answering needs you to look at the user's screen, or to do something on their \
         computer (open, click, type, play, search, close, scroll… — even asked as \"can you…\" or \
         \"how do I…\" while they're at their PC), reply with exactly [SCREEN] and nothing else — \
         another part of you will actually do it. Never list steps for them to do themselves.\n",
    );
    if expressive {
        s.push_str(
            "Your voice can perform a few sounds: <laugh> <chuckle> <sigh>. Use one occasionally, \
             only where a person really would (a genuine laugh at something funny), never every reply.\n",
        );
    }
    let app = crate::uia::foreground_app();
    let title = crate::uia::foreground_title();
    if !app.is_empty() || !title.is_empty() {
        s.push_str(&format!("(The user is currently in {app} — \"{title}\".)\n"));
    }
    s
}

/// Every brain can chat: they all speak the OpenAI chat-completions
/// dialect somewhere — Gemini and Claude at their OpenAI-compatible
/// addresses, Ollama at `/v1` on the same local port (so a PC with only a
/// local model can chat too).
fn streamable(_: &ProviderConfig) -> bool {
    true
}

fn chat_url(cfg: &ProviderConfig) -> String {
    let base = cfg.base_url.trim_end_matches('/');
    match cfg.id {
        ProviderId::Gemini => {
            let root = base.trim_end_matches("/v1beta").trim_end_matches("/v1");
            format!("{root}/v1beta/openai/chat/completions")
        }
        ProviderId::Ollama => {
            let root = base.trim_end_matches("/api").trim_end_matches("/v1");
            format!("{root}/v1/chat/completions")
        }
        _ => format!("{base}/chat/completions"),
    }
}

/// How long one brain may take for a whole reply. A model on the PC itself
/// may first have to load into memory, and runs slower on a laptop.
fn reply_timeout(cfg: &ProviderConfig) -> Duration {
    if cfg.id.is_local() {
        Duration::from_secs(240)
    } else {
        Duration::from_secs(60)
    }
}

/// Stream a reply to `history` (oldest first, ending with the user's
/// message), emitting `DELTA` events tagged `id`. Runs on its own thread.
pub fn stream(app: AppHandle, id: u64, history: Vec<Turn>, style: Style) {
    std::thread::spawn(move || {
        // The whole reply, so any reminder it sets can be picked up at the
        // end. (The webview drops the tag from what it shows and says.)
        let whole = Mutex::new(String::new());
        let emit = |text: String, done: bool, error: Option<String>| {
            whole.lock().push_str(&text);
            if done {
                crate::reminders::take_tags(&whole.lock());
            }
            let _ = app.emit(DELTA, Delta { id, text, done, error, status: None });
        };
        let status = |s: &str| {
            let _ = app.emit(DELTA, Delta { id, text: String::new(), done: false, error: None, status: Some(s.to_string()) });
        };
        let chain: Vec<ProviderConfig> = crate::brain::brain_chain().into_iter().filter(streamable).collect();
        if chain.is_empty() {
            return emit(String::new(), true, Some("no chat-capable brain is set up".into()));
        }
        let mut messages = messages_for(&history, style);
        for round in 0..=TOOL_ROUNDS {
            let last = round == TOOL_ROUNDS;
            if last {
                messages.push(json!({ "role": "user", "content": NO_MORE_TOOLS }));
            }
            // Hold the opening back until it's clear whether it's a tool
            // tag (run it quietly) or the answer (stream it as it comes).
            let held = Mutex::new(String::new());
            let mode = Mutex::new(if last { Some(false) } else { None::<bool> });
            let tag = Mutex::new(None::<String>);
            race(&chain, &messages, id, &|t: String, done: bool, err: Option<String>| {
                let mut m = mode.lock();
                if *m == Some(false) {
                    drop(m);
                    return emit(t, done, err);
                }
                let mut h = held.lock();
                h.push_str(&t);
                if m.is_none() {
                    *m = classify(&h).or(done.then_some(false));
                }
                match *m {
                    Some(false) => {
                        let all = std::mem::take(&mut *h);
                        drop(h);
                        drop(m);
                        emit(all, done, err);
                    }
                    Some(true) if done => *tag.lock() = Some(h.clone()),
                    _ => {}
                }
            });
            let Some(raw) = tag.into_inner() else { return };
            let Some(tool) = parse_tool(&raw) else {
                return emit(String::new(), true, Some("the answer got muddled — try again".into()));
            };
            status(tool.doing());
            let result = run_tool(&tool);
            messages.push(json!({ "role": "assistant", "content": raw.trim() }));
            messages.push(json!({ "role": "user", "content": format!("[result]\n{result}\n[Now carry on — another tag, or your answer.]") }));
        }
    });
}

// ---------------------------------------------------------------------------
// Tools the chat can use mid-conversation
// ---------------------------------------------------------------------------

const TOOL_ROUNDS: usize = 4;
const NO_MORE_TOOLS: &str = "[No more tools now — answer with what you have.]";
const TOOL_WORDS: &[&str] = &["SEARCH", "READ", "BROWSE", "CLICK", "TYPE"];
const MOODS: &[&str] = &["cheerful", "excited", "calm", "serious", "sympathetic", "playful", "curious"];

#[derive(Debug, PartialEq)]
enum Tool {
    Search(String),
    Read(String),
    Browse(String),
    Click(u32),
    Type(u32, String, bool),
}

impl Tool {
    fn doing(&self) -> &'static str {
        match self {
            Tool::Search(_) => "🔎 Searching the web…",
            Tool::Read(_) => "📄 Reading the page…",
            Tool::Browse(_) => "🌐 Opening it in the Izuki browser…",
            Tool::Click(_) | Tool::Type(..) => "🖱️ Working on the page…",
        }
    }
}

/// A leading mood tag ("[curious] ") is skipped: the tool tag may follow it.
fn after_mood(t: &str) -> &str {
    let t = t.trim_start();
    if let Some(rest) = t.strip_prefix('[') {
        if let Some(end) = rest.find(']') {
            if MOODS.contains(&rest[..end].trim().to_lowercase().as_str()) {
                return rest[end + 1..].trim_start();
            }
        }
    }
    t
}

/// From the first words of a reply: a tool tag (`Some(true)`), the answer
/// itself (`Some(false)`), or too soon to tell (`None`).
fn classify(t: &str) -> Option<bool> {
    let trimmed = t.trim_start();
    // A mood tag still being written: wait.
    if trimmed.starts_with('[') && !trimmed.contains(']') && trimmed.len() < 16 {
        let w: String = trimmed[1..].chars().take_while(|c| c.is_ascii_alphabetic()).collect();
        if MOODS.iter().any(|m| m.starts_with(&w.to_lowercase())) || TOOL_WORDS.iter().any(|k| k.starts_with(&w.to_uppercase())) {
            return None;
        }
    }
    let rest = after_mood(t);
    if rest.is_empty() {
        return None;
    }
    let Some(inner) = rest.strip_prefix('[') else { return Some(false) };
    let word: String = inner.chars().take_while(|c| c.is_ascii_alphabetic()).collect();
    if inner.len() == word.len() {
        return if TOOL_WORDS.iter().any(|k| k.starts_with(&word.to_uppercase())) { None } else { Some(false) };
    }
    Some(TOOL_WORDS.contains(&word.to_uppercase().as_str()))
}

/// The tool a whole reply asks for, if the reply is only a tool tag.
fn parse_tool(reply: &str) -> Option<Tool> {
    let rest = after_mood(reply);
    let inner = rest.strip_prefix('[')?;
    let end = inner.rfind(']')?;
    if !rest[end + 2..].trim().is_empty() {
        return None;
    }
    let (word, arg) = inner[..end].split_once(':')?;
    let arg = arg.trim();
    match word.trim().to_uppercase().as_str() {
        "SEARCH" if !arg.is_empty() => Some(Tool::Search(arg.to_string())),
        "READ" if !arg.is_empty() => Some(Tool::Read(arg.to_string())),
        "BROWSE" if !arg.is_empty() => Some(Tool::Browse(arg.to_string())),
        "CLICK" => arg.trim_matches('#').parse().ok().map(Tool::Click),
        "TYPE" => {
            let (n, text) = arg.split_once('|')?;
            let text = text.trim();
            let submit = text.ends_with('⏎');
            Some(Tool::Type(n.trim().trim_matches('#').parse().ok()?, text.trim_end_matches('⏎').trim().to_string(), submit))
        }
        _ => None,
    }
}

fn run_tool(tool: &Tool) -> String {
    eprintln!("[chat] tool: {tool:?}");
    let r = match tool {
        Tool::Search(q) => crate::web::search_text(q),
        Tool::Read(u) => crate::web::read(u),
        Tool::Browse(u) => crate::browser::browse(u),
        Tool::Click(n) => crate::browser::click(*n),
        Tool::Type(n, text, submit) => crate::browser::type_into(*n, text, *submit),
    };
    r.unwrap_or_else(|e| format!("That didn't work: {e}"))
}

/// A whole reply, using tools along the way (the phone, calls, Telegram).
fn complete_with_tools(mut messages: Vec<Value>) -> anyhow::Result<String> {
    for round in 0..=TOOL_ROUNDS {
        if round == TOOL_ROUNDS {
            messages.push(json!({ "role": "user", "content": NO_MORE_TOOLS }));
        }
        let text = complete(&messages)?;
        match parse_tool(&text) {
            Some(tool) if round < TOOL_ROUNDS => {
                let result = run_tool(&tool);
                messages.push(json!({ "role": "assistant", "content": text }));
                messages.push(json!({ "role": "user", "content": format!("[result]\n{result}\n[Now carry on — another tag, or your answer.]") }));
            }
            _ => return Ok(text),
        }
    }
    anyhow::bail!("ran out of steps")
}

fn messages_for(history: &[Turn], style: Style) -> Vec<Value> {
    with_system(history, system_prompt(style, crate::composio::configured()))
}

fn with_system(history: &[Turn], system: String) -> Vec<Value> {
    let mut messages = vec![json!({ "role": "system", "content": system })];
    for t in history.iter().rev().take(12).rev() {
        let role = if t.role == "assistant" { "assistant" } else { "user" };
        messages.push(json!({ "role": role, "content": t.content }));
    }
    messages
}

/// A whole reply at once (the phone lane), with the same racing of brains
/// as the streamed one. Reminder tags are left in for the caller.
pub fn reply(history: &[Turn], style: Style) -> anyhow::Result<String> {
    complete_with_tools(messages_for(history, style))
}

/// A written reply that never hands over to the apps lane — for when it
/// can't help (no apps linked) and the chat should just answer.
pub fn reply_here(history: &[Turn], style: Style) -> anyhow::Result<String> {
    complete_with_tools(with_system(history, system_prompt(style, false)))
}

/// Any finished answer to `messages` (system prompt first), raced across
/// the brains like everything else here.
pub fn complete(messages: &[Value]) -> anyhow::Result<String> {
    let chain: Vec<ProviderConfig> = crate::brain::brain_chain().into_iter().filter(streamable).collect();
    if chain.is_empty() {
        anyhow::bail!("no AI brain is set up yet — add a free Gemini key in Izuki's Settings");
    }
    let id = 1_000_000_000 + rand::random::<u32>() as u64;
    let text = Mutex::new(String::new());
    let failed = Mutex::new(None::<String>);
    let emit = |t: String, done: bool, error: Option<String>| {
        text.lock().push_str(&t);
        if done {
            *failed.lock() = error;
        }
    };
    race(&chain, messages, id, &emit);
    let text = text.into_inner();
    match failed.into_inner() {
        Some(e) if text.trim().is_empty() => anyhow::bail!(e),
        _ => Ok(text.trim().to_string()),
    }
}

/// How long a brain gets to start answering before the next is asked too.
const HEDGE_AFTER: Duration = Duration::from_millis(1800);

enum Event {
    Text(usize, String),
    Done(usize),
    Failed(usize, String),
}

/// Ask the brains in order, but don't wait on a slow one: if nothing has
/// arrived after `HEDGE_AFTER` (or it fails), the next is asked as well.
/// The first to *start* answering wins and is the only one heard; the
/// others are told to stop.
fn race(chain: &[ProviderConfig], messages: &[Value], id: u64, emit: &dyn Fn(String, bool, Option<String>)) {
    use std::sync::atomic::{AtomicUsize, Ordering};
    use std::sync::{mpsc, Arc};

    let winner = Arc::new(AtomicUsize::new(usize::MAX));
    let (tx, rx) = mpsc::channel::<Event>();
    let launch = |i: usize| {
        let (tx, cfg, messages, winner) = (tx.clone(), chain[i].clone(), messages.to_vec(), winner.clone());
        std::thread::spawn(move || {
            let started = Instant::now();
            let first = Mutex::new(None::<u128>);
            let stop = || {
                let w = winner.load(Ordering::SeqCst);
                cancelled(id) || (w != usize::MAX && w != i)
            };
            let on_text = |t: String| {
                first.lock().get_or_insert(started.elapsed().as_millis());
                let _ = tx.send(Event::Text(i, t));
            };
            eprintln!("[chat] asking {} ({})", cfg.label, cfg.model);
            // A panic inside must still report back, or the reply would wait forever.
            let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| stream_one(&cfg, &messages, &stop, &on_text)))
                .unwrap_or_else(|_| Err(anyhow::anyhow!("crashed while answering")));
            match result {
                Ok(true) => {
                    let ttft = first.lock().unwrap_or(0);
                    crate::brain::note_answer(cfg.id, Ok(ttft));
                    eprintln!("[chat] {} ({}) first words in {ttft} ms, done in {} ms", cfg.label, cfg.model, started.elapsed().as_millis());
                    let _ = tx.send(Event::Done(i));
                }
                Ok(false) => {
                    // Stopped because another brain won: it was slower.
                    if first.lock().is_none() {
                        crate::brain::note_answer(cfg.id, Ok(started.elapsed().as_millis().max(4000)));
                    }
                    let _ = tx.send(Event::Done(i));
                }
                Err(e) => {
                    crate::brain::note_answer(cfg.id, Err(&e.to_string()));
                    let _ = tx.send(Event::Failed(i, format!("{}: {e}", cfg.label)));
                }
            }
        });
    };

    launch(0);
    let began = Instant::now();
    let mut launched = 1;
    let mut failed = 0;
    let mut errors = Vec::new();
    loop {
        let won = winner.load(Ordering::SeqCst);
        let local = chain[..launched].iter().any(|c| c.id.is_local());
        // Nobody has said a word for this long: stop waiting and say why.
        let first_words = Duration::from_secs(if local { 240 } else { 40 });
        if winner.load(Ordering::SeqCst) == usize::MAX && launched == chain.len() && began.elapsed() > first_words {
            errors.push("no answer in time".into());
            return emit(String::new(), true, Some(errors.join("; ")));
        }
        let patience = if local { 240 } else { 90 };
        let wait = if won == usize::MAX && launched < chain.len() {
            HEDGE_AFTER
        } else if won == usize::MAX {
            first_words.saturating_sub(began.elapsed()).max(Duration::from_millis(200))
        } else {
            Duration::from_secs(patience)
        };
        match rx.recv_timeout(wait) {
            Ok(Event::Text(i, t)) => {
                // The first brain to say anything is the one that's heard.
                let _ = winner.compare_exchange(usize::MAX, i, Ordering::SeqCst, Ordering::SeqCst);
                if winner.load(Ordering::SeqCst) == i {
                    emit(t, false, None);
                }
            }
            Ok(Event::Done(i)) if winner.load(Ordering::SeqCst) == i => return emit(String::new(), true, None),
            Ok(Event::Done(_)) => {}
            Ok(Event::Failed(i, e)) => {
                eprintln!("[chat] {e}");
                if winner.load(Ordering::SeqCst) == i {
                    // It had started talking — end there, don't start over.
                    return emit(String::new(), true, None);
                }
                errors.push(e);
                failed += 1;
                if launched < chain.len() {
                    launch(launched);
                    launched += 1;
                } else if failed == launched {
                    return emit(String::new(), true, Some(errors.join("; ")));
                }
            }
            Err(mpsc::RecvTimeoutError::Timeout) if winner.load(Ordering::SeqCst) == usize::MAX && launched < chain.len() => {
                eprintln!("[chat] {} is slow to start — asking {} too", chain[launched - 1].label, chain[launched].label);
                launch(launched);
                launched += 1;
            }
            Err(_) if winner.load(Ordering::SeqCst) == usize::MAX => {
                // Loops back to the first-words check above.
                continue;
            }
            Err(_) => return emit(String::new(), true, Some("the answer stopped halfway".into())),
        }
    }
}

/// One provider. `Ok(true)` = finished, `Ok(false)` = cancelled. Only fails
/// over to the next provider if nothing was sent yet.
pub(crate) fn stream_one(cfg: &ProviderConfig, messages: &[Value], stop: &dyn Fn() -> bool, on_text: &dyn Fn(String)) -> anyhow::Result<bool> {
    let client = reqwest::blocking::Client::builder()
        .connect_timeout(Duration::from_secs(6))
        .timeout(reply_timeout(cfg))
        .build()?;
    let body = json!({
        "model": cfg.model,
        "messages": messages,
        "stream": true,
        // Room for a drafted email or an app call; the prompts keep chat short.
        "max_tokens": 900,
        "temperature": 0.7,
    });
    let mut body = body;
    // Conversation wants first words fast, not deliberation.
    if cfg.id == ProviderId::Gemini && cfg.model.contains("flash") {
        body["reasoning_effort"] = json!("none");
    }
    // (Gemini's main model may be resting — see `vision::gemini_model_now`.)
    let mut body = body;
    if cfg.id == ProviderId::Gemini {
        body["model"] = json!(crate::vision::gemini_model_now(&cfg.model));
    }
    let mut rq = client.post(chat_url(cfg)).json(&body);
    if !cfg.api_key.trim().is_empty() {
        rq = rq.bearer_auth(cfg.api_key.trim());
    }
    if cfg.id == ProviderId::Openrouter {
        rq = rq.header("HTTP-Referer", "https://github.com/nova-izuki/izuki").header("X-Title", "Izuki");
    }
    let resp = rq.send()?;
    // Gemini's main model is often "experiencing high demand" on the free
    // tier; its lighter sibling usually isn't, and answers even faster.
    let busy = matches!(resp.status().as_u16(), 429 | 503);
    if busy && cfg.id == ProviderId::Gemini && cfg.model.contains("flash") && !cfg.model.contains("lite") {
        eprintln!("[chat] {} is busy ({}) — using gemini-2.5-flash-lite", cfg.model, resp.status());
        if resp.status().as_u16() == 429 {
            crate::vision::gemini_main_tired();
        }
        let mut lite = cfg.clone();
        lite.model = "gemini-2.5-flash-lite".into();
        return stream_one(&lite, messages, stop, on_text);
    }
    if !resp.status().is_success() {
        let status = resp.status();
        let text = resp.text().unwrap_or_default();
        anyhow::bail!("HTTP {status}: {}", text.chars().take(160).collect::<String>());
    }

    let mut sent_any = false;
    let began = Instant::now();
    // Some models think out loud in <think>…</think> first — never say that.
    let mut thinking = false;
    for line in BufReader::new(resp).lines() {
        if stop() {
            return Ok(false);
        }
        let line = line?;
        let Some(data) = line.strip_prefix("data:").map(str::trim) else { continue };
        if data == "[DONE]" {
            break;
        }
        let Ok(v) = serde_json::from_str::<Value>(data) else { continue };
        // A "thinking" model that's still only thinking after a few seconds
        // (it reasons in a separate field, and can spend the whole reply
        // budget there) isn't going to be quick — let a faster brain answer.
        if !sent_any && began.elapsed() > Duration::from_secs(6) {
            let d = &v["choices"][0]["delta"];
            if d["reasoning_content"].is_string() || d["reasoning"].is_string() {
                anyhow::bail!("still thinking after 6 s — too slow for conversation");
            }
        }
        let Some(mut piece) = v["choices"][0]["delta"]["content"].as_str().map(str::to_string) else { continue };
        if piece.contains("<think>") {
            thinking = true;
        }
        if thinking {
            match piece.find("</think>") {
                Some(end) => {
                    thinking = false;
                    piece = piece[end + "</think>".len()..].to_string();
                }
                None => continue,
            }
        }
        if !piece.is_empty() {
            sent_any = true;
            on_text(piece);
        }
    }
    if !sent_any {
        anyhow::bail!("the model returned an empty reply");
    }
    Ok(true)
}

#[cfg(test)]
mod tool_tests {
    use super::*;

    #[test]
    fn tells_tool_tags_from_answers_early() {
        assert_eq!(classify("[SEA"), None);
        assert_eq!(classify("[SEARCH: weather"), Some(true));
        assert_eq!(classify("[cheerful] Oh hey!"), Some(false));
        assert_eq!(classify("[cheer"), None);
        assert_eq!(classify("[curious] [BROWSE: x"), Some(true));
        assert_eq!(classify("[SCREEN]"), Some(false));
        assert_eq!(classify("[APPS]"), Some(false));
        assert_eq!(classify("Sure"), Some(false));
        assert_eq!(classify("  "), None);
    }

    #[test]
    fn reads_tool_tags() {
        assert_eq!(parse_tool("[SEARCH: burna boy tour 2026]"), Some(Tool::Search("burna boy tour 2026".into())));
        assert_eq!(parse_tool("[calm] [READ: https://x.com/a]"), Some(Tool::Read("https://x.com/a".into())));
        assert_eq!(parse_tool("[CLICK: 12]"), Some(Tool::Click(12)));
        assert_eq!(parse_tool("[TYPE: 3 | hello there ⏎]"), Some(Tool::Type(3, "hello there".into(), true)));
        assert_eq!(parse_tool("[TYPE: 3 | hi]"), Some(Tool::Type(3, "hi".into(), false)));
        assert_eq!(parse_tool("[SEARCH: x] and some words"), None);
        assert_eq!(parse_tool("Here you go"), None);
        assert_eq!(parse_tool("[SCREEN]"), None);
    }
}
