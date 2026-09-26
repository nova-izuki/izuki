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

fn system_prompt(style: Style) -> String {
    let mut s = match style {
        Style::Voice { expressive } => voice_prompt(expressive),
        Style::Text | Style::Phone => written_prompt(style == Style::Phone),
    };
    s.push_str(APPS_RULE);
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

/// Brains that speak the OpenAI chat-completions dialect (all but a few).
/// Gemini does too, at its OpenAI-compatible address — and it's the
/// quickest free brain (first words in under a second).
fn streamable(c: &ProviderConfig) -> bool {
    !matches!(c.id, ProviderId::Anthropic | ProviderId::Ollama)
}

fn chat_url(cfg: &ProviderConfig) -> String {
    let base = cfg.base_url.trim_end_matches('/');
    if cfg.id == ProviderId::Gemini {
        let root = base.trim_end_matches("/v1beta").trim_end_matches("/v1");
        format!("{root}/v1beta/openai/chat/completions")
    } else {
        format!("{base}/chat/completions")
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
            let _ = app.emit(DELTA, Delta { id, text, done, error });
        };
        let chain: Vec<ProviderConfig> = crate::brain::brain_chain().into_iter().filter(streamable).collect();
        if chain.is_empty() {
            return emit(String::new(), true, Some("no chat-capable brain is set up".into()));
        }
        race(&chain, &messages_for(&history, style), id, &emit);
    });
}

fn messages_for(history: &[Turn], style: Style) -> Vec<Value> {
    let mut messages = vec![json!({ "role": "system", "content": system_prompt(style) })];
    for t in history.iter().rev().take(12).rev() {
        let role = if t.role == "assistant" { "assistant" } else { "user" };
        messages.push(json!({ "role": role, "content": t.content }));
    }
    messages
}

/// A whole reply at once (the phone lane), with the same racing of brains
/// as the streamed one. Reminder tags are left in for the caller.
pub fn reply(history: &[Turn], style: Style) -> anyhow::Result<String> {
    complete(&messages_for(history, style))
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
            match stream_one(&cfg, &messages, &stop, &on_text) {
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
    let mut launched = 1;
    let mut failed = 0;
    let mut errors = Vec::new();
    loop {
        let won = winner.load(Ordering::SeqCst);
        let wait = if won == usize::MAX && launched < chain.len() { HEDGE_AFTER } else { Duration::from_secs(90) };
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
            Err(_) => return emit(String::new(), true, Some("no brain answered in time".into())),
        }
    }
}

/// One provider. `Ok(true)` = finished, `Ok(false)` = cancelled. Only fails
/// over to the next provider if nothing was sent yet.
fn stream_one(cfg: &ProviderConfig, messages: &[Value], stop: &dyn Fn() -> bool, on_text: &dyn Fn(String)) -> anyhow::Result<bool> {
    let client = reqwest::blocking::Client::builder()
        .connect_timeout(Duration::from_secs(6))
        .timeout(Duration::from_secs(60))
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
