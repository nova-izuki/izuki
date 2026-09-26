//! Izuki on your phone, for free: a Telegram bot.
//!
//! No app store, no server. You make a bot with @BotFather (a minute,
//! free), paste its token into Izuki, and send it the pairing code once.
//! From then on Izuki on this PC answers it — by long polling, so it works
//! behind any home router with nothing to host. Text it, or hold the mic
//! button and send a voice note, from anywhere:
//!   * chat, advice, drafting — the same companion as the Chat tab;
//!   * reminders — set from the phone, and every reminder is texted to you;
//!   * your PC — "put on some lofi on my PC", "find my essay and send it",
//!     "/screen" to see it, "/stop" to stop. (Can be switched off.)
//!
//! Only the one paired chat is ever answered.

use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;

use anyhow::{anyhow, Result};
use parking_lot::Mutex;
use serde::Serialize;
use serde_json::{json, Value};
use tauri::{AppHandle, Emitter};


const API: &str = "https://api.telegram.org";

#[derive(Debug, Clone, Default, Serialize)]
pub struct Status {
    /// The bot's @username once the token checks out.
    pub bot: String,
    pub paired: bool,
    pub code: String,
    /// The last thing that went wrong (bad token, no internet), if any.
    pub error: Option<String>,
}

static STATUS: Mutex<Status> = Mutex::new(Status { bot: String::new(), paired: false, code: String::new(), error: None });
static STARTED: AtomicBool = AtomicBool::new(false);

pub fn status() -> Status {
    let s = crate::state::store().settings();
    let mut st = STATUS.lock().clone();
    st.paired = s.telegram_chat_id != 0;
    st.code = s.telegram_code.clone();
    if s.telegram_token.trim().is_empty() {
        st = Status { code: st.code, ..Default::default() };
    }
    st
}

fn client(timeout: Duration) -> Result<reqwest::blocking::Client> {
    Ok(reqwest::blocking::Client::builder()
        .timeout(timeout)
        .connect_timeout(Duration::from_secs(8))
        .build()?)
}

fn call(token: &str, method: &str, body: &Value, timeout: Duration) -> Result<Value> {
    let res = client(timeout)?.post(format!("{API}/bot{token}/{method}")).json(body).send()?;
    let v: Value = res.json()?;
    if v["ok"].as_bool() != Some(true) {
        return Err(anyhow!("{}", v["description"].as_str().unwrap_or("Telegram said no")));
    }
    Ok(v["result"].clone())
}

fn send_text(token: &str, chat: i64, text: &str) {
    // Telegram caps a message at 4096 characters.
    for part in split(text, 3900) {
        if let Err(e) = call(token, "sendMessage", &json!({ "chat_id": chat, "text": part }), Duration::from_secs(15)) {
            eprintln!("[phone] couldn't send: {e}");
        }
    }
}

fn split(text: &str, max: usize) -> Vec<String> {
    let chars: Vec<char> = text.chars().collect();
    if chars.is_empty() {
        return Vec::new();
    }
    chars.chunks(max).map(|c| c.iter().collect()).collect()
}

fn typing(token: &str, chat: i64) {
    let _ = call(token, "sendChatAction", &json!({ "chat_id": chat, "action": "typing" }), Duration::from_secs(8));
}

/// Text the paired phone (reminders, "done" for a long PC task). Returns at
/// once; a no-op when no phone is paired.
pub fn notify(text: &str) {
    let s = crate::state::store().settings();
    let token = s.telegram_token.trim().to_string();
    if token.is_empty() || s.telegram_chat_id == 0 {
        return;
    }
    let (chat, text) = (s.telegram_chat_id, text.to_string());
    std::thread::spawn(move || send_text(&token, chat, &text));
}

/// Start answering the bot (once, at startup). Picks up a new or changed
/// token by itself, so nothing needs restarting after pasting one in.
pub fn spawn(app: AppHandle) {
    if STARTED.swap(true, Ordering::SeqCst) {
        return;
    }
    std::thread::Builder::new()
        .name("izuki-phone".into())
        .spawn(move || poll_forever(app))
        .ok();
}

fn poll_forever(app: AppHandle) {
    let mut offset: i64 = 0;
    let mut known_token = String::new();
    loop {
        let token = crate::state::store().settings().telegram_token.trim().to_string();
        if token.is_empty() {
            known_token.clear();
            std::thread::sleep(Duration::from_secs(3));
            continue;
        }
        if token != known_token {
            offset = 0;
            match call(&token, "getMe", &json!({}), Duration::from_secs(12)) {
                Ok(me) => {
                    let bot = me["username"].as_str().unwrap_or_default().to_string();
                    eprintln!("[phone] answering @{bot}");
                    *STATUS.lock() = Status { bot, error: None, ..Default::default() };
                    known_token = token.clone();
                }
                Err(e) => {
                    let msg = if e.to_string().contains("Unauthorized") || e.to_string().contains("Not Found") {
                        "That bot token doesn't work — copy it again from @BotFather.".to_string()
                    } else {
                        format!("Can't reach Telegram: {e}")
                    };
                    *STATUS.lock() = Status { error: Some(msg), ..Default::default() };
                    std::thread::sleep(Duration::from_secs(10));
                    continue;
                }
            }
            let _ = app.emit(PHONE_CHANGED, ());
        }

        // Long poll: Telegram holds the request until a message arrives
        // (or 25 s pass), so this costs nothing while idle.
        let updates = call(
            &token,
            "getUpdates",
            &json!({ "offset": offset, "timeout": 25, "allowed_updates": ["message"] }),
            Duration::from_secs(40),
        );
        match updates {
            Ok(list) => {
                STATUS.lock().error = None;
                for u in list.as_array().cloned().unwrap_or_default() {
                    offset = offset.max(u["update_id"].as_i64().unwrap_or(0) + 1);
                    let (app, token) = (app.clone(), token.clone());
                    // Each message on its own thread: a long PC task must
                    // not stop "/stop" from being read.
                    std::thread::spawn(move || {
                        if let Err(e) = handle(&app, &token, &u["message"]) {
                            eprintln!("[phone] {e}");
                        }
                    });
                }
            }
            Err(e) => {
                eprintln!("[phone] poll failed: {e}");
                STATUS.lock().error = Some(format!("Can't reach Telegram: {e}"));
                std::thread::sleep(Duration::from_secs(5));
            }
        }
    }
}

pub const PHONE_CHANGED: &str = "izuki://phone-changed";

fn handle(app: &AppHandle, token: &str, msg: &Value) -> Result<()> {
    let Some(chat) = msg["chat"]["id"].as_i64() else { return Ok(()) };
    let store = crate::state::store();
    let settings = store.settings();
    let text = msg["text"].as_str().unwrap_or_default().trim().to_string();

    // ---- pairing -------------------------------------------------------
    if settings.telegram_chat_id == 0 {
        let code = settings.telegram_code.clone();
        if !code.is_empty() && text.contains(&code) {
            let mut next = settings.clone();
            next.telegram_chat_id = chat;
            store.set_settings(next);
            let _ = app.emit("izuki://patch-settings", json!({ "telegram_chat_id": chat }));
            let _ = app.emit(PHONE_CHANGED, ());
            send_text(
                token,
                chat,
                "You're paired! 🎉 I'm Izuki — text me or send a voice note any time.\n\n\
                 Try: \"remind me in 20 minutes to stretch\", \"play some lofi on my PC\", \
                 or /screen to see your PC. /stop stops whatever I'm doing.",
            );
        } else {
            send_text(token, chat, "Hi! To pair me with your PC, send the 6-digit code shown in Izuki → Settings → Phone.");
        }
        return Ok(());
    }
    if chat != settings.telegram_chat_id {
        send_text(token, chat, "Sorry — this Izuki belongs to someone else.");
        return Ok(());
    }

    // ---- what they said (typed, or a voice note) -------------------------
    let said = if !text.is_empty() {
        text
    } else if let Some(file_id) = msg["voice"]["file_id"].as_str().or(msg["audio"]["file_id"].as_str()) {
        typing(token, chat);
        let audio = download(token, file_id)?;
        let mime = msg["voice"]["mime_type"].as_str().or(msg["audio"]["mime_type"].as_str()).unwrap_or("audio/ogg");
        match crate::stt::transcribe_clip(&settings, audio, mime, "voice.ogg") {
            Ok(t) if !t.trim().is_empty() => t,
            Ok(_) => {
                send_text(token, chat, "I couldn't make out any words in that — try again?");
                return Ok(());
            }
            Err(_) => {
                send_text(token, chat, "Voice notes need a free Gemini (or Groq) key in Izuki's Settings — text works right now though!");
                return Ok(());
            }
        }
    } else {
        send_text(token, chat, "I can read text and voice notes 🙂");
        return Ok(());
    };

    // ---- quick commands --------------------------------------------------
    match crate::companion::quick(app, &said) {
        Some(crate::companion::Quick::Text(t)) => {
            send_text(token, chat, &t);
            return Ok(());
        }
        Some(crate::companion::Quick::Screen) => return send_screen(token, chat),
        None => {}
    }

    // ---- the companion -----------------------------------------------------
    typing(token, chat);
    let reply = crate::companion::respond(app, &said, false, &|line| send_text(token, chat, line));
    let mut text = reply.text.clone();
    for (name, url) in &reply.links {
        text.push_str(&format!("\n\n🔗 Connect {name}: {url}"));
    }
    send_text(token, chat, &text);
    Ok(())
}

fn download(token: &str, file_id: &str) -> Result<Vec<u8>> {
    let f = call(token, "getFile", &json!({ "file_id": file_id }), Duration::from_secs(15))?;
    let path = f["file_path"].as_str().ok_or_else(|| anyhow!("no file path"))?;
    let bytes = client(Duration::from_secs(30))?
        .get(format!("{API}/file/bot{token}/{path}"))
        .send()?
        .bytes()?;
    Ok(bytes.to_vec())
}

fn send_screen(token: &str, chat: i64) -> Result<()> {
    use reqwest::blocking::multipart::{Form, Part};
    let jpeg = match crate::companion::screenshot() {
        Ok(j) => j,
        Err(e) => {
            send_text(token, chat, &e.to_string());
            return Ok(());
        }
    };
    let form = Form::new()
        .text("chat_id", chat.to_string())
        .part("photo", Part::bytes(jpeg).file_name("screen.jpg").mime_str("image/jpeg")?);
    let res = client(Duration::from_secs(40))?.post(format!("{API}/bot{token}/sendPhoto")).multipart(form).send()?;
    if !res.status().is_success() {
        send_text(token, chat, "Couldn't send the screenshot, sorry.");
    }
    Ok(())
}

/// Forget the paired phone (a new code is made, so the old chat can't
/// pair again without it).
pub fn unpair() {
    let store = crate::state::store();
    let mut next = store.settings();
    next.telegram_chat_id = 0;
    next.telegram_code.clear(); // heal() makes a fresh one
    store.set_settings(next);
    crate::companion::forget();
}

#[cfg(test)]
mod tests {
    use super::split;

    #[test]
    fn long_messages_are_split() {
        assert!(split("", 10).is_empty());
        assert_eq!(split("abcdef", 4), vec!["abcd", "ef"]);
        assert_eq!(split("héllo", 3), vec!["hél", "lo"]);
    }
}
