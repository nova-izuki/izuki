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
/// Whether a message plainly asks for something on the PC (play, open, close,
/// search, "what's on my screen"…). Away channels (Discord, Telegram, calls)
/// route these straight to the PC instead of hoping the free chat model emits
/// the [SCREEN] tag — small models often just chat back instead.
/// Words that ask for something to be *done* on the PC.
const DO: &[&str] = &[
    "open ", "close ", "click ", "tap ", "type ", "press ", "scroll ", "go to ",
    "play ", "pause ", "resume ", "skip ", "next song", "previous song", "mute", "unmute",
    "volume", "search ", "google ", "look up ", "send ", "reply ", "delete ", "remove ",
    "download ", "install ", "launch ", "run ", "switch to ", "screenshot", "refresh ",
    "reload ", "log in", "log out", "sign in", "sign out", "submit", "turn on ", "turn off ",
    "bookmark", "print ", "watch ", "listen to ", "put on ", "buy ", "order ", "fill in",
    "fill out", "skip the ad", "keep going", "carry on", "do the rest", "on youtube",
];
/// Words that ask about what's on the screen.
const LOOK: &[&str] = &[
    "on my screen", "my screen", "this page", "this window", "this tab", "this app",
    "what's this", "whats this", "what is this", "what's on", "whats on", "read this",
    "look at", "in front of me",
];

fn wants_reminder(said: &str) -> bool {
    let t = said.to_lowercase();
    ["remind me", "set a reminder", "set an reminder", "my reminders"].iter().any(|p| t.contains(p))
}

pub fn needs_screen(said: &str) -> bool {
    if wants_reminder(said) { return false; }
    let t = format!(" {} ", said.to_lowercase());
    DO.iter().chain(LOOK).any(|k| t.contains(k)) || crate::instant::parse(said).is_some()
}

/// Connected-account work takes priority over generic verbs such as
/// "read", "open" and "send" on every remote channel.
pub fn needs_apps(said: &str) -> bool {
    if wants_reminder(said) { return false; }
    let t = said.to_lowercase();
    if ["help me write", "help me draft", "help me compose", "write an email", "draft an email"]
        .iter().any(|p| t.contains(p)) { return false; }
    let words: Vec<&str> = t.split(|c: char| !c.is_alphanumeric()).filter(|w| !w.is_empty()).collect();
    words.iter().any(|w| matches!(*w,
        "gmail" | "email" | "emails" | "inbox" | "outlook" | "calendar" | "slack" |
        "notion" | "github" | "linkedin" | "instagram" | "twitter" | "facebook" |
        "tiktok" | "reddit" | "discord" | "whatsapp" | "todoist" | "trello" | "dropbox" |
        "onedrive")) || ["my drive", "google drive", "my schedule", "my contacts", "google docs", "google sheets"]
        .iter().any(|p| t.contains(p))
}

/// Asks for something to be *done* ("play…", "open…", "scroll…") — not just
/// a question about the screen. A reply to one of these that does nothing
/// isn't an answer (brain::good_enough).
pub fn asks_to_do(said: &str) -> bool {
    let t = format!(" {} ", said.to_lowercase());
    DO.iter().any(|k| t.contains(k))
}

/// "…on my phone" / "on my android" — the request is for the phone, not the PC.
pub fn on_phone_asked(said: &str) -> bool {
    let words = said.to_lowercase().split(|c: char| !c.is_alphanumeric()).filter(|w| !w.is_empty()).map(str::to_owned).collect::<Vec<_>>();
    words.windows(2).any(|w| matches!(w[0].as_str(), "my" | "the" | "this" | "on" | "open") && matches!(w[1].as_str(), "phone" | "iphone" | "android" | "mobile"))
}

/// Never redirect an unavailable phone action onto Windows.
pub fn phone_guidance(said: &str, android_enabled: bool) -> Option<String> {
    if !on_phone_asked(said) { return None; }
    let t=said.to_lowercase();
    Some(if t.contains("iphone") {
        "That request is for your iPhone, not this PC. Use a supported Siri Shortcut on the iPhone; I can't unlock it or control arbitrary iPhone apps.".into()
    } else if android_enabled {
        "Do you mean the paired Android phone? Say the specific action, for example ‘open Chrome on my Android’. I haven't changed this PC.".into()
    } else {
        "That request is for your phone, not this PC. Which phone action do you want? Connect Android in Settings → Phone, or use a supported Siri Shortcut on iPhone. I haven't changed either device.".into()
    })
}
fn pc_asked(said: &str) -> bool {
    let t=format!(" {} ", said.to_lowercase().replace(|c: char| !c.is_alphanumeric(), " "));
    [" my pc ", " the pc ", " on pc ", " my computer ", " the computer ", " my laptop ", " the laptop ", " on windows ", " on desktop "].iter().any(|p|t.contains(p))
}
const CHOOSE_DEVICE: &str = "Do you mean your phone or your PC? Repeat the action with ‘on my PC’ or ‘on my Android’. I haven't changed either device.";

pub fn respond(app: &AppHandle, said: &str, spoken: bool, status: &dyn Fn(&str)) -> Reply {
    // The TV, from the phone, Telegram or Discord too: "open Netflix on the TV".
    if crate::tv::parse(said).is_some() {
        push("user", said);
        status("Talking to your TV…");
        let text = crate::tv::run(said).unwrap_or_else(|e| e.to_string());
        push("assistant", &text);
        return Reply::text(text);
    }
    // Screen time, asked from the phone too.
    if crate::screentime::is_question(said) {
        push("user", said);
        let text = crate::screentime::answer(said);
        push("assistant", &text);
        return Reply::text(text);
    }
    // Timers, from the phone or Telegram too.
    if let Some(ask) = crate::timers::parse(said) {
        push("user", said);
        let text = crate::timers::run(app, ask);
        push("assistant", &text);
        return Reply::text(text);
    }
    // Focus mode and Recall, from the phone or Telegram too.
    if let Some(ask) = crate::focus::parse(said) {
        push("user", said);
        let text = crate::focus::run(app, ask);
        push("assistant", &text);
        return Reply::text(text);
    }
    if crate::recall::is_recall_question(said) {
        if let Some(text) = crate::recall::answer(said) {
            push("user", said);
            push("assistant", &text);
            return Reply::text(text);
        }
    }
    // The Later list, from the phone or Telegram too.
    if let Some(ask) = crate::later::parse_for_list(said) {
        push("user", said);
        let text = crate::later::run(ask);
        push("assistant", &text);
        return Reply::text(text);
    }
    // "Wake up" / "status report" from anywhere.
    if crate::briefing::is_briefing(said) {
        push("user", said);
        let text = crate::briefing::compose();
        push("assistant", &text);
        return Reply::text(text);
    }
    if on_phone_asked(said) && pc_asked(said) { return Reply::text(CHOOSE_DEVICE); }
    if let Some(guidance) = phone_guidance(said, crate::state::store().settings().android_enabled) {
        push("user", said);
        let t=said.to_lowercase();
        let explicit_android=t.contains("on my android") || t.contains("on the android");
        let text=if explicit_android && !t.contains("iphone") && crate::state::store().settings().android_enabled {
            status("Working on your paired Android…"); crate::android::run_on_phone(said)
        } else { guidance };
        push("assistant", &text); return Reply::text(text);
    }
    if needs_apps(said) {
        push("user", said);
        status("Checking your connected apps…");
        let history = HISTORY.lock().clone();
        let answer = match crate::composio::ask(&history) {
            Ok(a) => Reply { text: crate::reminders::take_tags(&a.text), links: a.links },
            Err(e) => Reply::text(format!("I couldn't reach your apps ({e}).")),
        };
        push("assistant", &answer.text);
        return answer;
    }
    // Plainly a PC job? Do it — don't gamble on the chat model tagging it.
    if needs_screen(said) && !pc_asked(said) { return Reply::text(CHOOSE_DEVICE); }
    if needs_screen(said) && crate::state::store().settings().phone_controls_pc && !crate::uia::screen_locked() {
        push("user", said);
        let out = on_pc(app, said, status);
        push("assistant", &out.text);
        return out;
    }
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
        if !pc_asked(said) { push("assistant", CHOOSE_DEVICE); return Reply::text(CHOOSE_DEVICE); }
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
            crate::composio::stop();
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
    fn phone_intent_cannot_fall_through_to_windows() {
        for s in ["open my phone", "Open my iPhone!", "open Gmail on my phone", "scroll on my Android", "open phone", "look at this phone"] {
            assert!(on_phone_asked(s), "{s}");
            assert!(phone_guidance(s, false).is_some(), "{s}");
            assert!(phone_guidance(s, true).is_some(), "{s}");
        }
        for s in ["open Chrome on my PC", "explain phonetics", "write an essay about phones"] {
            assert!(!on_phone_asked(s), "{s}");
        }
        assert!(phone_guidance("open my iPhone", true).unwrap().contains("Siri"));
    }

    #[test]
    fn spoken_tags_are_tidied() {
        assert!(!needs_apps("remind me to email Sam"));
        assert!(!needs_screen("remind me to open Spotify"));
        assert_eq!(tidy("[cheerful] Sure thing! [END]"), "Sure thing!");
        assert_eq!(tidy("Plain reply."), "Plain reply.");
assert!(hands_over(" [SCREEN] ", "SCREEN"));
        assert!(needs_screen("play some music"));
        assert!(needs_screen("open chrome and play burna boy on youtube"));
        assert!(needs_screen("what's on my screen"));
        assert!(!needs_screen("how are you today"));
        assert!(!needs_screen("what's a good name for a cat"));
        assert!(needs_screen("louder"));
        assert!(asks_to_do("play some chill music"));
        assert!(!asks_to_do("what's on my screen"));
        assert!(hands_over("APPS", "APPS"));
        assert!(!hands_over("Let me check the screen", "SCREEN"));
    }

    #[test]
    fn accounts_take_priority_over_screen_verbs() {
        for text in ["open gmail", "read my emails", "what's on my calendar", "check my Instagram", "send a Slack message"] {
            assert!(needs_apps(text), "{text}");
        }
        for text in ["help me write an email", "open Chrome", "mailbox-shaped cake", "tell me a joke"] {
            assert!(!needs_apps(text), "{text}");
        }
    }
}
