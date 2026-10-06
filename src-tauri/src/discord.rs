//! Izuki on your phone through Discord — for anyone Telegram doesn't suit
//! (Discord signs you up with just an email). Same idea as telegram.rs: you
//! make a free bot, paste its token, send it the pairing code once, and
//! Izuki on this PC answers your direct messages — text or voice messages —
//! from anywhere. Nothing is hosted.
//!
//! Discord only delivers messages over its "gateway" (a websocket), so this
//! keeps one open from the PC. Replies go out over Discord's REST API. Only
//! the one paired Discord user is ever answered, and only in DMs.

use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;

use anyhow::{anyhow, Result};
use futures_util::{SinkExt, StreamExt};
use parking_lot::Mutex;
use serde::Serialize;
use serde_json::{json, Value};
use tauri::{AppHandle, Emitter};
use tokio_tungstenite::tungstenite::Message;

const API: &str = "https://discord.com/api/v10";
const GATEWAY: &str = "wss://gateway.discord.gg/?v=10&encoding=json";
/// DIRECT_MESSAGES. Message text in DMs comes without the privileged
/// "message content" intent, so nothing extra has to be switched on.
const INTENTS: u64 = 1 << 12;

pub const CHANGED: &str = "izuki://discord-changed";

#[derive(Debug, Clone, Default, Serialize)]
pub struct Status {
    /// The bot's name once the token checks out.
    pub bot: String,
    /// Link that adds the bot to a server of yours (needed before you can
    /// DM it).
    pub invite: String,
    pub paired: bool,
    pub online: bool,
    pub code: String,
    pub error: Option<String>,
}

static STATUS: Mutex<Status> =
    Mutex::new(Status { bot: String::new(), invite: String::new(), paired: false, online: false, code: String::new(), error: None });
static STARTED: AtomicBool = AtomicBool::new(false);

pub fn status() -> Status {
    let s = crate::state::store().settings();
    let mut st = STATUS.lock().clone();
    st.paired = !s.discord_user_id.is_empty();
    st.code = s.telegram_code.clone();
    if s.discord_token.trim().is_empty() {
        st = Status { code: st.code, ..Default::default() };
    }
    st
}

fn set_status(app: &AppHandle, f: impl FnOnce(&mut Status)) {
    f(&mut STATUS.lock());
    let _ = app.emit(CHANGED, ());
}

// ---------------------------------------------------------------------------
// REST
// ---------------------------------------------------------------------------

fn client() -> Result<reqwest::blocking::Client> {
    Ok(reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(30))
        .connect_timeout(Duration::from_secs(8))
        .user_agent("DiscordBot (https://github.com/nova-izuki/izuki, 1)")
        .build()?)
}

fn rest(token: &str, method: reqwest::Method, path: &str, body: Option<&Value>) -> Result<Value> {
    let mut rq = client()?.request(method, format!("{API}{path}")).header("Authorization", format!("Bot {token}"));
    if let Some(b) = body {
        rq = rq.json(b);
    }
    let res = rq.send()?;
    let status = res.status();
    let v: Value = res.json().unwrap_or(Value::Null);
    if !status.is_success() {
        return Err(anyhow!("Discord answered {status}: {}", v["message"].as_str().unwrap_or("no details")));
    }
    Ok(v)
}

fn send_text(token: &str, channel: &str, text: &str) {
    if let Err(e) = send_text_checked(token, channel, text) {
        eprintln!("[discord] couldn't send: {e}");
        STATUS.lock().error = Some("A Discord message could not be delivered. Check your internet and that DMs from the bot are allowed.".into());
    }
}

fn send_text_checked(token: &str, channel: &str, text: &str) -> Result<()> {
    // Discord caps a message at 2000 characters.
    let chars: Vec<char> = text.chars().collect();
    for part in chars.chunks(1900) {
        let content: String = part.iter().collect();
        rest(token, reqwest::Method::POST, &format!("/channels/{channel}/messages"), Some(&json!({ "content": content, "allowed_mentions": { "parse": [] } })))?;
    }
    Ok(())
}

/// Called only by the user's Test button. Success means Discord accepted
/// the DM, not that the phone OS displayed a push notification.
pub fn test_delivery() -> Result<()> {
    let s = crate::state::store().settings();
    if s.discord_token.trim().is_empty() || s.discord_user_id.is_empty() {
        return Err(anyhow!("Pair Discord with this PC first."));
    }
    let dm = rest(s.discord_token.trim(), reqwest::Method::POST, "/users/@me/channels", Some(&json!({ "recipient_id": s.discord_user_id })))?;
    let channel = dm["id"].as_str().ok_or_else(|| anyhow!("Discord didn't open the conversation."))?;
    send_text_checked(s.discord_token.trim(), channel, "Izuki connection check: this PC can message you here. Email and calendar alerts use your Apps → Heads-ups settings while Izuki is running.")
}

fn typing(token: &str, channel: &str) {
    let _ = rest(token, reqwest::Method::POST, &format!("/channels/{channel}/typing"), None);
}

fn send_screen(token: &str, channel: &str) -> Result<()> {
    use reqwest::blocking::multipart::{Form, Part};
    let jpeg = match crate::companion::screenshot() {
        Ok(j) => j,
        Err(e) => {
            send_text(token, channel, &e.to_string());
            return Ok(());
        }
    };
    let form = Form::new()
        .text("payload_json", json!({ "content": "Your screen right now:" }).to_string())
        .part("files[0]", Part::bytes(jpeg).file_name("screen.jpg").mime_str("image/jpeg")?);
    let res = client()?
        .post(format!("{API}/channels/{channel}/messages"))
        .header("Authorization", format!("Bot {token}"))
        .multipart(form)
        .send()?;
    if !res.status().is_success() {
        send_text(token, channel, "Couldn't send the screenshot, sorry.");
    }
    Ok(())
}

/// Message the paired Discord user (reminders, the call link). Returns at
/// once; a no-op when nobody is paired.
pub fn notify(text: &str) {
    let s = crate::state::store().settings();
    let token = s.discord_token.trim().to_string();
    let user = s.discord_user_id.clone();
    if token.is_empty() || user.is_empty() {
        return;
    }
    let text = text.to_string();
    std::thread::spawn(move || {
        match rest(&token, reqwest::Method::POST, "/users/@me/channels", Some(&json!({ "recipient_id": user }))) {
            Ok(dm) => {
                if let Some(ch) = dm["id"].as_str() {
                    send_text(&token, ch, &text);
                }
            }
            Err(e) => eprintln!("[discord] couldn't open the DM: {e}"),
        }
    });
}

/// Forget the paired Discord user (a fresh code is made).
pub fn unpair() {
    let store = crate::state::store();
    let mut next = store.settings();
    next.discord_user_id.clear();
    next.telegram_code.clear(); // heal() makes a new one
    store.set_settings(next);
}

// ---------------------------------------------------------------------------
// The gateway
// ---------------------------------------------------------------------------

/// Start answering the bot (once, at startup). Picks up a new or changed
/// token by itself.
pub fn spawn(app: AppHandle) {
    if STARTED.swap(true, Ordering::SeqCst) {
        return;
    }
    std::thread::Builder::new()
        .name("izuki-discord".into())
        .spawn(move || {
            let rt = match tokio::runtime::Builder::new_current_thread().enable_all().build() {
                Ok(rt) => rt,
                Err(e) => return eprintln!("[discord] no runtime: {e}"),
            };
            rt.block_on(run_forever(app));
        })
        .ok();
}

async fn run_forever(app: AppHandle) {
    loop {
        let token = crate::state::store().settings().discord_token.trim().to_string();
        if token.is_empty() {
            *STATUS.lock() = Status::default();
            tokio::time::sleep(Duration::from_secs(3)).await;
            continue;
        }
        // Who the bot is, and the link that adds it to a server.
        let me = {
            let t = token.clone();
            tokio::task::spawn_blocking(move || rest(&t, reqwest::Method::GET, "/oauth2/applications/@me", None)).await
        };
        match me {
            Ok(Ok(me)) => {
                let id = me["id"].as_str().unwrap_or_default().to_string();
                let bot = me["bot"]["username"].as_str().or(me["name"].as_str()).unwrap_or("your bot").to_string();
                set_status(&app, |s| {
                    s.bot = bot;
                    s.invite = format!("https://discord.com/oauth2/authorize?client_id={id}&scope=bot&permissions=0");
                    s.error = None;
                });
            }
            Ok(Err(e)) => {
                let msg = if e.to_string().contains("401") {
                    "That bot token doesn't work — copy it again (Bot → Reset Token).".to_string()
                } else {
                    format!("Can't reach Discord: {e}")
                };
                set_status(&app, |s| {
                    *s = Status { error: Some(msg), ..Default::default() };
                });
                wait_for_new_token(&token, Duration::from_secs(20)).await;
                continue;
            }
            Err(_) => continue,
        }

        if let Err(e) = session(&app, &token).await {
            set_status(&app, |s| { s.online = false; s.error = Some("Reconnecting to Discord…".into()); });
            eprintln!("[discord] connection ended: {e}");
            if e.to_string().contains("4004") {
                set_status(&app, |s| s.error = Some("Discord refused the token — copy it again.".into()));
                wait_for_new_token(&token, Duration::from_secs(60)).await;
                continue;
            }
        }
        set_status(&app, |s| s.online = false);
        tokio::time::sleep(Duration::from_secs(5)).await;
    }
}

/// Sleep, but wake early if the token is changed in Settings.
async fn wait_for_new_token(old: &str, max: Duration) {
    let started = std::time::Instant::now();
    while started.elapsed() < max {
        tokio::time::sleep(Duration::from_secs(2)).await;
        if crate::state::store().settings().discord_token.trim() != old {
            return;
        }
    }
}

/// One gateway connection, until it drops or the token changes.
async fn session(app: &AppHandle, token: &str) -> Result<()> {
    crate::tls_ready();
    let (ws, _) = tokio_tungstenite::connect_async(GATEWAY).await?;
    let (mut tx, mut rx) = ws.split();

    // Hello → the heartbeat interval.
    let hello = next_json(&mut rx).await?;
    let every = Duration::from_millis(hello["d"]["heartbeat_interval"].as_u64().unwrap_or(41_250));

    let identify = json!({
        "op": 2,
        "d": {
            "token": token,
            "intents": INTENTS,
            "properties": { "os": "windows", "browser": "izuki", "device": "izuki" }
        }
    });
    tx.send(Message::Text(identify.to_string().into())).await?;

    let mut seq: Value = Value::Null;
    let mut beat = tokio::time::interval(every);
    beat.tick().await; // the first tick is immediate
    let mut acked = true;
    let mut token_check = tokio::time::interval(Duration::from_secs(3));

    loop {
        tokio::select! {
            _ = beat.tick() => {
                if !acked {
                    return Err(anyhow!("Discord stopped answering heartbeats"));
                }
                acked = false;
                tx.send(Message::Text(json!({ "op": 1, "d": seq }).to_string().into())).await?;
            }
            _ = token_check.tick() => {
                if crate::state::store().settings().discord_token.trim() != token {
                    let _ = tx.close().await;
                    return Ok(());
                }
            }
            msg = rx.next() => {
                let Some(msg) = msg else { return Err(anyhow!("closed")) };
                let text = match msg? {
                    Message::Text(t) => t.to_string(),
                    Message::Close(frame) => {
                        return Err(anyhow!("closed: {}", frame.map(|f| u16::from(f.code).to_string()).unwrap_or_default()));
                    }
                    _ => continue,
                };
                let Ok(v) = serde_json::from_str::<Value>(&text) else { continue };
                if !v["s"].is_null() {
                    seq = v["s"].clone();
                }
                match v["op"].as_u64() {
                    Some(11) => acked = true,
                    Some(1) => tx.send(Message::Text(json!({ "op": 1, "d": seq }).to_string().into())).await?,
                    Some(7) | Some(9) => return Err(anyhow!("Discord asked to reconnect")),
                    Some(0) => match v["t"].as_str() {
                        Some("READY") => {
                            eprintln!("[discord] connected");
                            set_status(app, |s| { s.online = true; s.error = None; });
                        }
                        Some("MESSAGE_CREATE") => {
                            let (app, token, d) = (app.clone(), token.to_string(), v["d"].clone());
                            // Replies can take a while (a PC task) — never
                            // hold up the gateway.
                            std::thread::spawn(move || {
                                if let Err(e) = handle(&app, &token, &d) {
                                    eprintln!("[discord] {e}");
                                }
                            });
                        }
                        _ => {}
                    },
                    _ => {}
                }
            }
        }
    }
}

async fn next_json<S>(rx: &mut S) -> Result<Value>
where
    S: futures_util::Stream<Item = Result<Message, tokio_tungstenite::tungstenite::Error>> + Unpin,
{
    while let Some(m) = rx.next().await {
        if let Message::Text(t) = m? {
            return Ok(serde_json::from_str(&t)?);
        }
    }
    Err(anyhow!("closed before hello"))
}

// ---------------------------------------------------------------------------
// A message
// ---------------------------------------------------------------------------

fn handle(app: &AppHandle, token: &str, m: &Value) -> Result<()> {
    // DMs only, and never another bot (or ourselves).
    if m["author"]["bot"].as_bool() == Some(true) || !m["guild_id"].is_null() {
        return Ok(());
    }
    let (Some(channel), Some(author)) = (m["channel_id"].as_str(), m["author"]["id"].as_str()) else { return Ok(()) };
    let store = crate::state::store();
    let settings = store.settings();
    let text = m["content"].as_str().unwrap_or_default().trim().to_string();

    // ---- pairing ---------------------------------------------------------
    if settings.discord_user_id.is_empty() {
        let code = settings.telegram_code.clone();
        if !code.is_empty() && text.contains(&code) {
            let mut next = settings.clone();
            next.discord_user_id = author.to_string();
            store.set_settings(next);
            let _ = app.emit("izuki://patch-settings", json!({ "discord_user_id": author }));
            let _ = app.emit(CHANGED, ());
            send_text(
                token,
                channel,
                "You're paired! 🎉 I'm Izuki — message me or send a voice message any time.\n\n\
                 Try: \"remind me in 20 minutes to stretch\", \"play some lofi on my PC\", \
                 or /screen to see your PC. /stop stops whatever I'm doing.",
            );
        } else {
            send_text(token, channel, "Hi! To pair me with your PC, send the 6-digit code shown in Izuki → Settings → Phone.");
        }
        return Ok(());
    }
    if author != settings.discord_user_id {
        send_text(token, channel, "Sorry — this Izuki belongs to someone else.");
        return Ok(());
    }

    // ---- pictures they sent (a photo, a screenshot of an error…) --------
    let pictures: Vec<String> = m["attachments"]
        .as_array()
        .map(|all| {
            all.iter()
                .filter(|a| a["content_type"].as_str().is_some_and(|t| t.starts_with("image/")))
                .filter(|a| a["size"].as_u64().unwrap_or(0) <= 20 * 1024 * 1024)
                .take(4)
                .filter_map(|a| {
                    let bytes = client().ok()?.get(a["url"].as_str()?).send().ok()?.bytes().ok()?;
                    crate::chat::picture_data_url(&bytes, a["content_type"].as_str().unwrap_or("image/jpeg"))
                })
                .collect()
        })
        .unwrap_or_default();
    // ("/stop" with a picture attached is still just /stop — handled below.)
    if !pictures.is_empty() && !text.starts_with('/') {
        typing(token, channel);
        let reply = crate::companion::respond_with(app, &text, pictures, false, &|line| send_text(token, channel, line));
        send_text(token, channel, &reply.text);
        return Ok(());
    }

    // ---- what they said (typed, or a voice message) --------------------
    let said = if !text.is_empty() {
        text
    } else if let Some(a) = m["attachments"]
        .as_array()
        .and_then(|a| a.iter().find(|a| a["content_type"].as_str().is_some_and(|t| t.starts_with("audio/"))))
    {
        typing(token, channel);
        let url = a["url"].as_str().unwrap_or_default();
        let mime = a["content_type"].as_str().unwrap_or("audio/ogg");
        let audio = client()?.get(url).send()?.bytes()?.to_vec();
        match crate::stt::transcribe_clip(&settings, audio, mime, a["filename"].as_str().unwrap_or("voice.ogg")) {
            Ok(t) if !t.trim().is_empty() => t,
            Ok(_) => {
                send_text(token, channel, "I couldn't make out any words in that — try again?");
                return Ok(());
            }
            Err(_) => {
                send_text(token, channel, "Voice messages need a free Gemini (or Groq) key in Izuki's Settings — text works right now though!");
                return Ok(());
            }
        }
    } else {
        send_text(token, channel, "I can read text, voice messages and pictures 🙂");
        return Ok(());
    };

    // ---- quick commands --------------------------------------------------
    match crate::companion::quick(app, &said) {
        Some(crate::companion::Quick::Text(t)) => {
            send_text(token, channel, &t);
            return Ok(());
        }
        Some(crate::companion::Quick::Screen) => return send_screen(token, channel),
        None => {}
    }

    // ---- the companion ---------------------------------------------------
    typing(token, channel);
    let reply = crate::companion::respond(app, &said, false, &|line| send_text(token, channel, line));
    let mut out = reply.text.clone();
    for (name, url) in &reply.links {
        out.push_str(&format!("\n\n🔗 Connect {name}: {url}"));
    }
    send_text(token, channel, &out);
    Ok(())
}
