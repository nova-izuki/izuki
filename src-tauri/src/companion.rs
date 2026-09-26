//! One companion for everywhere away from the PC — the Telegram bot and the
//! "Call Izuki" page share this, and share one conversation, so a chat
//! started by text carries on in a call.
//!
//! It answers from the fast chat lane, sets reminders, hands PC work to the
//! task loop (brain.rs) and account work to the apps lane (composio.rs).

use parking_lot::Mutex;
use serde::Serialize;
use tauri::AppHandle;

use crate::chat::{Style, Turn};

/// The away-from-the-PC conversation (oldest first).
static HISTORY: Mutex<Vec<Turn>> = Mutex::new(Vec::new());
const KEEP: usize = 16;

#[derive(Debug, Clone, Default, Serialize)]
pub struct Reply {
    pub text: String,
    /// Sign-in links for apps that aren't linked yet: (app, url).
    pub links: Vec<(String, String)>,
}

impl Reply {
    fn text(t: impl Into<String>) -> Self {
        Reply { text: t.into(), links: Vec::new() }
    }
}

fn push(role: &str, content: &str) {
    let mut h = HISTORY.lock();
    h.push(Turn { role: role.into(), content: content.to_string() });
    let excess = h.len().saturating_sub(KEEP);
    h.drain(..excess);
}

pub fn forget() {
    HISTORY.lock().clear();
}

/// Is the model handing over with `[TAG]`?
fn hands_over(reply: &str, tag: &str) -> bool {
    let r = reply.trim();
    r.trim_matches(|c| c == '[' || c == ']').eq_ignore_ascii_case(tag) || r.starts_with(&format!("[{tag}]"))
}

/// A spoken reply's mood tag and "[END]" — not for a text or a call.
fn tidy(reply: &str) -> String {
    let mut r = reply.trim();
    if r.starts_with('[') {
        if let Some(end) = r.find(']') {
            let tag = &r[1..end];
            if tag.chars().all(|c| c.is_ascii_alphabetic()) && tag.len() < 14 && !tag.eq_ignore_ascii_case("screen") && !tag.eq_ignore_ascii_case("apps") {
                r = r[end + 1..].trim_start();
            }
        }
    }
    r.replace("[END]", "").trim().to_string()
}

/// Answer `said`. `spoken`: the reply will be read aloud (a call), so it's
/// asked for in the spoken style. `status` hears progress lines ("On it —
/// doing that on your PC…") while a long piece of work runs.
pub fn respond(app: &AppHandle, said: &str, spoken: bool, status: &dyn Fn(&str)) -> Reply {
    push("user", said);
    let history = HISTORY.lock().clone();
    let style = if spoken { Style::Voice { expressive: false } } else { Style::Phone };
    let reply = match crate::chat::reply(&history, style) {
        Ok(r) => crate::reminders::take_tags(&r),
        Err(e) => {
            HISTORY.lock().pop();
            return Reply::text(format!("My AI brain didn't answer ({e}). Try again in a moment?"));
        }
    };

    if hands_over(&reply, "SCREEN") {
        HISTORY.lock().pop();
        let out = on_pc(app, said, status);
        push("user", said);
        push("assistant", &out.text);
        return out;
    }
    if hands_over(&reply, "APPS") {
        let answer = match crate::composio::ask(&history) {
            Ok(a) => Reply { text: crate::reminders::take_tags(&a.text), links: a.links },
            Err(e) => Reply::text(format!("I couldn't get into your apps just now ({e}).")),
        };
        push("assistant", &answer.text);
        return answer;
    }
    let text = tidy(&reply);
    push("assistant", &text);
    Reply::text(text)
}

/// The quick commands every away channel understands, answered without the
/// AI: stop, screenshot, reminders, the call link, help.
pub enum Quick {
    Text(String),
    /// Send a screenshot of the PC (see [`screenshot`]).
    Screen,
}

pub fn quick(app: &AppHandle, said: &str) -> Option<Quick> {
    use tauri::Emitter;
    let lower = said.to_lowercase();
    let bare = lower.trim().trim_start_matches(['/', '!']).trim_end_matches(|c: char| !c.is_alphanumeric());
    // "/screen@izuki_bot" in a group.
    let bare = bare.split('@').next().unwrap_or(bare);
    Some(match bare {
        "stop" | "cancel" => {
            crate::brain::cancel_task();
            let _ = app.emit(crate::events::STOP_SPEAKING, ());
            Quick::Text("Stopped. ✋".into())
        }
        "screen" | "screenshot" | "show me my screen" | "show my screen" => Quick::Screen,
        "call" => {
            let st = crate::call::status();
            Quick::Text(if st.state == "ready" {
                format!("📞 Open this and tap to talk:\n{}", st.link)
            } else if crate::state::store().settings().call_enabled {
                "The call link is still starting — I'll message it to you the moment it's ready.".to_string()
            } else {
                "Turn on \"Call Izuki\" in Izuki → Settings → Phone first, then ask for the call link again.".to_string()
            })
        }
        "reminders" => {
            let list = crate::reminders::list();
            Quick::Text(if list.is_empty() {
                "No reminders set. Say \"remind me…\" to add one.".to_string()
            } else {
                list.iter()
                    .map(|r| format!("⏰ {} — {}", crate::reminders::describe_time(r.at), r.text))
                    .collect::<Vec<_>>()
                    .join("\n")
            })
        }
        "start" | "help" => Quick::Text(
            "I'm Izuki 👋 Text me or send a voice message.\n\
             • Ask me anything, or to draft something\n\
             • \"Remind me at 6 to call Mum\" — /reminders lists them\n\
             • \"Open Spotify on my PC\" — I'll do it and tell you\n\
             • /call — a link to talk to me hands-free\n\
             • /screen shows your PC's screen, /stop stops me"
                .into(),
        ),
        _ => return None,
    })
}

/// The PC's screen as a JPEG, for "/screen" — or why not.
pub fn screenshot() -> anyhow::Result<Vec<u8>> {
    if crate::uia::screen_locked() {
        anyhow::bail!("Your PC is locked 🔒");
    }
    let frame = crate::capture::capture_all()?;
    frame.downscaled(1600).to_jpeg(78)
}

/// Message every paired phone channel (Telegram, Discord) — reminders, the
/// call link. A no-op for channels that aren't set up.
pub fn notify_everywhere(text: &str) {
    crate::telegram::notify(text);
    crate::discord::notify(text);
}

/// Something to do on the PC, asked from away.
fn on_pc(app: &AppHandle, said: &str, status: &dyn Fn(&str)) -> Reply {
    let store = crate::state::store();
    if !store.settings().phone_controls_pc {
        return Reply::text("That needs your PC, and doing things on it from your phone is switched off (Izuki → Settings → Phone).");
    }
    if crate::uia::screen_locked() {
        return Reply::text("Your PC is locked, so I can't do that right now — unlock it and ask again.");
    }
    status("On it — doing that on your PC…");
    let plan = crate::brain::submit_voice_command(app, &store, said.to_string());
    let summary = plan.summary.trim();
    Reply::text(if summary.is_empty() { "Done.".to_string() } else { summary.to_string() })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn spoken_tags_are_tidied() {
        assert_eq!(tidy("[cheerful] Sure thing! [END]"), "Sure thing!");
        assert_eq!(tidy("Plain reply."), "Plain reply.");
        assert!(hands_over(" [SCREEN] ", "SCREEN"));
        assert!(hands_over("APPS", "APPS"));
        assert!(!hands_over("Let me check the screen", "SCREEN"));
    }
}
