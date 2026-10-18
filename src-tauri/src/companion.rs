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
pub(crate) static HISTORY: Mutex<Vec<Turn>> = Mutex::new(Vec::new());
const KEEP: usize = 16;

#[derive(Debug, Clone, Default, Serialize)]
pub struct Reply {
    pub text: String,
    /// Sign-in links for apps that aren't linked yet: (app, url).
    pub links: Vec<(String, String)>,
    /// Structured executor result. Text such as "Done" cannot set this.
    pub outcome: crate::model::TaskOutcome,
}

impl Reply {
    fn text(t: impl Into<String>) -> Self {
        Reply { text: t.into(), ..Default::default() }
    }

    fn with_outcome(mut self, outcome: crate::model::TaskOutcome) -> Self {
        self.outcome = outcome;
        self
    }

    fn from_plan(plan: &crate::model::VisionPlan) -> Self {
        use crate::model::TaskOutcome;
        let outcome = if plan.ask.is_some() { TaskOutcome::NeedsUser }
            else if plan.outcome != TaskOutcome::Unverified { plan.outcome }
            else if !plan.steps.is_empty() { TaskOutcome::Partial }
            else { TaskOutcome::Unverified };
        let text = if plan.summary.trim().is_empty() {
            plan.ask.as_deref().unwrap_or(if outcome == TaskOutcome::Verified { "Done." } else { "I couldn't verify that this task finished." })
        } else { plan.summary.trim() };
        Self::text(text).with_outcome(outcome)
    }
}

fn push(role: &str, content: &str) {
    push_with(role, content, Vec::new());
}

fn push_with(role: &str, content: &str, images: Vec<String>) {
    let mut h = HISTORY.lock();
    h.push(Turn { role: role.into(), content: content.to_string(), images });
    let excess = h.len().saturating_sub(KEEP);
    h.drain(..excess);
}

/// Pictures are big: only the last two turns that had any keep them.
fn forget_old_pictures() {
    let mut h = HISTORY.lock();
    let mut seen = 0;
    for t in h.iter_mut().rev() {
        if !t.images.is_empty() {
            seen += 1;
            if seen > 2 {
                t.images.clear();
                t.content = format!("{} [sent a picture]", t.content).trim().to_string();
            }
        }
    }
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

/// "Open Outlook", "switch to Discord", "close Slack": the app itself, on the
/// PC — not the linked account. ("Open Outlook" used to go to Composio.)
/// Anything about what's *in* it ("open my latest email") is still the account.
pub fn opens_an_app(said: &str) -> bool {
    let t = said.to_lowercase();
    let words: Vec<&str> = t.split(|c: char| !c.is_alphanumeric()).filter(|w| !w.is_empty()).collect();
    const LEAD: &[&str] = &["hey", "ok", "okay", "nova", "izuki", "please", "can", "could", "would", "you", "go", "ahead", "and"];
    let mut rest: &[&str] = &words;
    while let Some((w, more)) = rest.split_first() {
        if LEAD.contains(w) { rest = more; } else { break; }
    }
    let verb_len = match rest {
        ["switch", "to", ..] | ["bring", "up", ..] | ["pull", "up", ..] | ["go", "to", ..] | ["show", "me", ..] => 2,
        [w, ..] if matches!(*w, "open" | "launch" | "start" | "run" | "close" | "quit" | "exit" | "minimise" | "minimize" | "maximise" | "maximize" | "focus") => 1,
        _ => return false,
    };
    const FILLER: &[&str] = &["the", "my", "app", "application", "program", "for", "me", "please", "now", "up", "desktop", "new", "classic"];
    const DATA: &[&str] = &["email", "emails", "mail", "inbox", "message", "messages", "dm", "dms", "calendar", "schedule", "event", "events", "meeting", "meetings", "unread", "notifications", "latest", "last", "newest", "recent", "from", "about", "file", "files", "doc", "docs", "repo", "repos", "post", "posts", "channel", "channels", "task", "tasks", "note", "notes", "contact", "contacts"];
    let named: Vec<&&str> = rest[verb_len..].iter().filter(|w| !FILLER.contains(w)).collect();
    !named.is_empty() && named.len() <= 3 && !named.iter().any(|w| DATA.contains(w))
}

/// Connected-account work takes priority over generic verbs such as
/// "read", "open" and "send" on every remote channel — except opening the
/// app itself ([`opens_an_app`]).
pub fn needs_apps(said: &str) -> bool {
    if wants_reminder(said) || opens_an_app(said) { return false; }
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
    respond_with(app, said, Vec::new(), spoken, status)
}

/// The same, with pictures they sent (a photo in Discord or Telegram): the
/// brain looks at them with the words — "what's this?", "fix this error",
/// "solve question 3".
pub fn respond_with(app: &AppHandle, said: &str, images: Vec<String>, spoken: bool, status: &dyn Fn(&str)) -> Reply {
    if let Err(reason) = crate::execution::check() {
        return Reply::text(reason.explanation()).with_outcome(if reason == crate::execution::StopReason::Cancelled { crate::model::TaskOutcome::Cancelled } else { crate::model::TaskOutcome::Blocked });
    }
    if !images.is_empty() {
        push_with("user", said, images);
        forget_old_pictures();
        let history = HISTORY.lock().clone();
        let reply = match crate::chat::reply(&history, Style::Phone) {
            Ok(r) => crate::reminders::take_tags(&r),
            Err(e) => {
                HISTORY.lock().pop();
                return Reply::text(format!("I couldn't look at that just now ({e}). Try again in a moment?"));
            }
        };
        // A picture about the PC ("do this on my screen"): hand it over.
        if hands_over(&reply, "SCREEN") {
            let out = on_pc(app, said, status);
            push("assistant", &out.text);
            return out;
        }
        let text = tidy(&reply);
        push("assistant", &text);
        return Reply::text(text);
    }
    // The TV, from the phone, Telegram or Discord too: "open Netflix on the TV".
    if crate::tv::handles(said) {
        push("user", said);
        status("Talking to your TV…");
        let text = crate::tv::run(said).unwrap_or_else(|e| e.to_string());
        push("assistant", &text);
        return Reply::text(text);
    }
    // Study diary, Blackboard and textbooks from the phone too.
    if let Some(ask) = crate::studytrack::parse(said).filter(|a| *a != crate::studytrack::Ask::Practise || crate::studytrack::mistakes(&crate::studytrack::events()).is_empty()) {
        push("user", said);
        let text = crate::studytrack::handle(ask);
        push("assistant", &text);
        return Reply::text(text);
    }
    if let Some(ask) = crate::blackboard::parse(said) {
        push("user", said);
        let text = crate::blackboard::handle(ask);
        push("assistant", &text);
        return Reply::text(text);
    }
    if let Some(ask) = crate::textbook::parse(said, crate::textbook::has_books()) {
        push("user", said);
        let text = crate::textbook::handle(ask);
        push("assistant", &text);
        return Reply::text(text);
    }
    // APA references from the phone too (a link, DOI or ISBN) (cite.rs).
    if crate::cite::asks(said) && crate::cite::target_of(said) != crate::cite::Target::ThisPage {
        push("user", said);
        let text = crate::cite::handle(said);
        push("assistant", &text);
        return Reply::text(text);
    }
    // Money and the shop from the phone too (money.rs, shop.rs).
    if let Some(ask) = crate::money::parse_here(said) {
        push("user", said);
        let text = crate::money::handle(ask);
        push("assistant", &text);
        return Reply::text(text);
    }
    if let Some(ask) = crate::shop::parse_here(said) {
        push("user", said);
        let text = crate::shop::handle(ask);
        push("assistant", &text);
        return Reply::text(text);
    }
    // "Save every question and answer to my notes" from the phone too (studylog.rs).
    if let Some(on) = crate::studylog::parse(said) {
        push("user", said);
        let text = crate::studylog::handle(on);
        push("assistant", &text);
        return Reply::text(text);
    }
    // "What's due this week?" from the phone and Discord too (campus.rs).
    if let Some(ask) = crate::campus::parse(said) {
        push("user", said);
        let text = if ask == crate::campus::Ask::Connect {
            pc_allowed().unwrap_or_else(|| crate::campus::handle(ask))
        } else {
            crate::campus::handle(ask)
        };
        push("assistant", &text);
        return Reply::text(text);
    }
    // An assignment on the PC's screen, coached (study.rs) — phone and Discord too.
    if let Some(text) = crate::study::follow_up(said).or_else(|| crate::study::explain_current(said)) {
        push("user", said);
        push("assistant", &text);
        return Reply::text(text);
    }
    if crate::study::parse(said).is_some_and(|a| a.open_first.is_none()) {
        push("user", said);
        let text = match pc_allowed() {
            Some(no) => no,
            None => crate::study::coach().unwrap_or_else(|e| e.to_string()),
        };
        push("assistant", &text);
        return Reply::text(text);
    }
    // "Go to San Jac Blackboard" on the PC, from the phone and Discord too.
    if crate::sites::is_wrong_site(said) {
        push("user", said);
        let text = crate::sites::wrong_site();
        push("assistant", &text);
        return Reply::text(text);
    }
    if let Some(name) = crate::sites::parse(said) {
        push("user", said);
        let text = match pc_allowed() {
            Some(no) => no,
            None => crate::sites::go(&name),
        };
        push("assistant", &text);
        return Reply::text(text);
    }
    // Routines, from the phone and Discord too: "every morning at 8, …".
    if let Some(ask) = crate::routines::parse(said) {
        push("user", said);
        let text = crate::routines::handle(ask);
        push("assistant", &text);
        return Reply::text(text);
    }
    // Your DAW (dawctl.rs), from the phone and Discord too: "record in Ableton".
    if !crate::flstudio::fl_running() {
        if let Some(act) = crate::dawctl::parse(said) {
            push("user", said);
            let text = match pc_allowed() {
                Some(no) => no,
                None => crate::dawctl::run(said, act),
            };
            push("assistant", &text);
            return Reply::text(text);
        }
    }
    // A terminal lesson (tutor.rs), from the phone and Discord too.
    if let Some(ask) = crate::tutor::parse(said) {
        push("user", said);
        let text = crate::tutor::handle(ask);
        push("assistant", &text);
        return Reply::text(text);
    }
    // "Find my Home Depot email": every linked Gmail account searched, and
    // the answer says exactly which (mail.rs) — Discord, phone, Telegram.
    if let Some(ask) = crate::mail::parse_ask(said).filter(|_| crate::composio::configured()) {
        push("user", said);
        status("Searching your email…");
        let (text, outcome) = crate::mail::answer_checked(&ask);
        push("assistant", &text);
        return Reply::text(text).with_outcome(outcome);
    }
    // "What's important in my email?", from the phone and Telegram too.
    if crate::headsup::is_inbox_question(said) && crate::composio::configured() {
        push("user", said);
        let text = crate::headsup::inbox_spoken();
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
    // "Make a trap beat", from the phone too: the MIDI lands on the PC.
    if let Some(text) = crate::beats::parse(said).and_then(|_| crate::beats::make(said)) {
        push("user", said);
        push("assistant", &text);
        return Reply::text(text);
    }
    // "My PC is lagging", from the phone too: PC Boost on the PC.
    if crate::boost::is_request(said) {
        push("user", said);
        let text = crate::boost::run(false);
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
            Ok(a) => Reply { text: crate::reminders::take_tags(&a.text), links: a.links, ..Default::default() },
            Err(e) => Reply::text(format!("I couldn't reach your apps ({e}).")).with_outcome(crate::model::TaskOutcome::Failed),
        };
        push("assistant", &answer.text);
        return answer;
    }
    // Plainly a PC job? Do it — don't gamble on the chat model tagging it.
    if needs_screen(said) && !pc_asked(said) { return Reply::text(CHOOSE_DEVICE); }
    if needs_screen(said) {
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
            return Reply::text(format!("My AI brain didn't answer ({e}). Try again in a moment?")).with_outcome(crate::model::TaskOutcome::Failed);
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
            Ok(a) => Reply { text: crate::reminders::take_tags(&a.text), links: a.links, ..Default::default() },
            Err(e) => Reply::text(format!("I couldn't get into your apps just now ({e}).")).with_outcome(crate::model::TaskOutcome::Failed),
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
/// Acting on the PC from here (phone, Discord): the same rules as `on_pc` —
/// only when the user allowed it, never while the PC is locked. `Some(why not)`.
fn pc_allowed() -> Option<String> {
    if !crate::state::store().settings().phone_controls_pc {
        return Some("That needs your PC, and doing things on it from your phone is switched off (Izuki → Settings → Phone).".into());
    }
    if crate::uia::screen_locked() {
        return Some("Your PC is locked, so I can't do that right now — unlock it and ask again.".into());
    }
    None
}

fn on_pc(app: &AppHandle, said: &str, status: &dyn Fn(&str)) -> Reply {
    let store = crate::state::store();
    if !store.settings().phone_controls_pc {
        return Reply::text("That needs your PC, and doing things on it from your phone is switched off (Izuki → Settings → Phone).").with_outcome(crate::model::TaskOutcome::Blocked);
    }
    if crate::uia::screen_locked() {
        return Reply::text("Your PC is locked, so I can't do that right now — unlock it and ask again.").with_outcome(crate::model::TaskOutcome::Blocked);
    }
    status("On it — doing that on your PC…");
    // What was said on the phone just before, so "that one" means something.
    let recent: Vec<Turn> = HISTORY.lock().iter().rev().take(8).rev().cloned().collect();
    let plan = crate::brain::submit_voice_command_in(app, &store, said.to_string(), &recent);
    Reply::from_plan(&plan)
}

/// "Teach me…", "show me how…", "I want to learn…": the user asked to be
/// taught, so demonstrating harmless basics is part of the request.
pub fn asks_to_learn(said: &str) -> bool {
    let s = format!(" {} ", said.to_lowercase());
    [" teach", " learn ", " learn how", " lesson", " tutorial", " show me how", " walk me through", " how do i use", " explain how to use"]
        .iter()
        .any(|w| s.contains(w))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn knows_a_request_to_be_taught() {
        assert!(asks_to_learn("teach me git in the terminal"));
        assert!(asks_to_learn("Can you show me how to use PowerShell"));
        assert!(!asks_to_learn("inspect my project"));
        assert!(!asks_to_learn("open the learning center app"));
    }

    #[test]
    fn executor_verdict_survives_the_companion_handoff() {
        use crate::model::{TaskOutcome, VisionPlan};
        let mut plan = VisionPlan::default();
        let reply = Reply::from_plan(&plan);
        assert_eq!(reply.outcome, TaskOutcome::Unverified);
        assert!(!reply.text.contains("Done"));
        plan.summary = "Done.".into();
        assert_eq!(Reply::from_plan(&plan).outcome, TaskOutcome::Unverified);
        plan.done = true;
        assert_eq!(Reply::from_plan(&plan).outcome, TaskOutcome::Unverified);
        plan.outcome = TaskOutcome::Verified;
        assert_eq!(Reply::from_plan(&plan).outcome, TaskOutcome::Verified);
        plan.ask = Some("Which account?".into());
        assert_eq!(Reply::from_plan(&plan).outcome, TaskOutcome::NeedsUser);
        plan.done = false;
        plan.outcome = TaskOutcome::Unverified;
        plan.ask = None;
        plan.steps.push(serde_json::from_value(serde_json::json!({"action":"click","x":1,"y":1})).unwrap());
        assert_eq!(Reply::from_plan(&plan).outcome, TaskOutcome::Partial);
        assert_eq!(Reply::text("I did everything!").outcome, TaskOutcome::Unverified);
        // Even an external JSON claim cannot set the executor-only verdict.
        let mut json = serde_json::to_value(&plan).unwrap();
        assert!(json.get("outcome").is_none());
        json["outcome"] = serde_json::json!("verified");
        let injected: VisionPlan = serde_json::from_value(json).unwrap();
        assert_eq!(injected.outcome, TaskOutcome::Unverified);
    }

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
        for text in ["read my emails", "what's on my calendar", "check my Instagram", "send a Slack message", "open my latest email from Sam", "open my outlook inbox", "what's in my inbox"] {
            assert!(needs_apps(text), "{text}");
        }
        for text in ["help me write an email", "open Chrome", "mailbox-shaped cake", "tell me a joke"] {
            assert!(!needs_apps(text), "{text}");
        }
    }

    #[test]
    fn opening_an_app_is_the_app_not_the_account() {
        // The same table the PC-side check reads (tools/conversation-check.cjs).
        let cases: serde_json::Value = serde_json::from_str(include_str!("../../tools/opens-app-cases.json")).unwrap();
        for text in cases["opens"].as_array().unwrap().iter().filter_map(|v| v.as_str()) {
            assert!(opens_an_app(text), "{text}");
            assert!(!needs_apps(text), "{text}");
        }
        for text in cases["account"].as_array().unwrap().iter().filter_map(|v| v.as_str()) {
            assert!(!opens_an_app(text), "{text}");
        }
    }
}
