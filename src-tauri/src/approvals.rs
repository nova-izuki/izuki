//! Things waiting for your yes — so you can approve them from your phone.
//!
//! When Izuki has a send, post or change ready in your apps (composio.rs's
//! hard gate holds it), the exact draft lands here too. From the paired phone
//! (Touch Grass) you can see it and Approve or Reject it:
//! - Approve runs exactly that draft — the same tool, the same words, the
//!   same account — once. The app has to confirm it, or it's reported as
//!   failed (never "sent" on a guess).
//! - Reject drops it. Nothing happens.
//! - Waiting longer than 30 minutes, it expires: silence is never a yes.
//!
//! Kept in memory only: a restart forgets pending drafts rather than
//! carrying an old approval into a new session.

use std::time::{Duration, Instant};

use parking_lot::Mutex;
use serde::Serialize;
use serde_json::Value;

/// How long a draft waits for a yes.
pub const EXPIRES: Duration = Duration::from_secs(30 * 60);

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Approval {
    pub id: String,
    /// "Gmail", "Slack"…
    pub app: String,
    /// What would happen, exactly as Izuki showed it.
    pub draft: String,
    /// Unix ms when it was made.
    pub at: i64,
    /// "waiting", "sent", "rejected", "failed", "expired".
    pub state: String,
    /// What happened when it was approved (or why not).
    #[serde(skip_serializing_if = "String::is_empty")]
    pub result: String,
    #[serde(skip)]
    pub tool: String,
    #[serde(skip)]
    pub args: Value,
    #[serde(skip)]
    pub account: Option<String>,
    #[serde(skip)]
    made: Option<Instant>,
}

static LIST: Mutex<Vec<Approval>> = Mutex::new(Vec::new());

/// A held change: keep the exact draft so it can be approved from the phone.
/// The same draft again replaces the old entry (never two of one thing).
pub fn hold(tool: &str, args: &Value, account: Option<&str>, app: &str, draft: &str) -> String {
    let mut list = LIST.lock();
    expire(&mut list);
    list.retain(|a| !(a.state == "waiting" && a.tool == tool && a.args == *args && a.account.as_deref() == account));
    let id = uuid::Uuid::new_v4().simple().to_string()[..12].to_string();
    list.insert(
        0,
        Approval {
            id: id.clone(),
            app: app.to_string(),
            draft: draft.replace("Want me to go ahead? Say “yes, send it” — or tell me what to change.", "").trim().to_string(),
            at: chrono::Utc::now().timestamp_millis(),
            state: "waiting".into(),
            result: String::new(),
            tool: tool.to_string(),
            args: args.clone(),
            account: account.map(str::to_string),
            made: Some(Instant::now()),
        },
    );
    list.truncate(20);
    eprintln!("[approvals] waiting for a yes: {app}");
    id
}

fn expire(list: &mut [Approval]) {
    for a in list.iter_mut().filter(|a| a.state == "waiting") {
        if a.made.is_none_or(|m| m.elapsed() > EXPIRES) {
            a.state = "expired".into();
            a.result = "Nobody approved it within 30 minutes, so nothing was sent.".into();
        }
    }
}

/// Everything recent (waiting first), for the phone.
pub fn list() -> Vec<Approval> {
    let mut list = LIST.lock();
    expire(&mut list);
    let mut out = list.clone();
    out.sort_by_key(|a| (a.state != "waiting", -a.at));
    out
}

/// How many are waiting right now.
pub fn waiting() -> usize {
    list().iter().filter(|a| a.state == "waiting").count()
}

/// The same draft was approved in the chat: mark it sent here too.
pub fn settled_in_chat(tool: &str, args: &Value, account: Option<&str>, ok: bool) {
    let mut list = LIST.lock();
    if let Some(a) = list.iter_mut().find(|a| a.state == "waiting" && a.tool == tool && a.args == *args && a.account.as_deref() == account) {
        a.state = if ok { "sent" } else { "failed" }.into();
        a.result = if ok { "Approved in the chat — done.".into() } else { "Approved in the chat, but the app reported a failure.".into() };
    }
}

/// Reject: nothing happens.
pub fn reject(id: &str, by: &str) -> anyhow::Result<Approval> {
    let mut list = LIST.lock();
    expire(&mut list);
    let a = list.iter_mut().find(|a| a.id == id).ok_or_else(|| anyhow::anyhow!("that draft isn't here any more"))?;
    if a.state != "waiting" {
        anyhow::bail!("that one is already {}", a.state);
    }
    a.state = "rejected".into();
    a.result = format!("Rejected from {by}. Nothing was sent.");
    crate::composio::forget_proposal(&a.tool, &a.args, a.account.as_deref());
    crate::remote::audit(by, "approval rejected", &a.app);
    Ok(a.clone())
}

/// Approve: run exactly that draft, once, and report what the app said.
pub fn approve(id: &str, by: &str) -> anyhow::Result<Approval> {
    let (tool, args, account) = {
        let mut list = LIST.lock();
        expire(&mut list);
        let a = list.iter_mut().find(|a| a.id == id).ok_or_else(|| anyhow::anyhow!("that draft isn't here any more"))?;
        if a.state != "waiting" {
            anyhow::bail!("that one is already {}", a.state);
        }
        // Claimed before running, so two taps can't send it twice.
        a.state = "sending".into();
        (a.tool.clone(), a.args.clone(), a.account.clone())
    };
    crate::remote::audit(by, "approval approved", &tool);
    let outcome = crate::composio::run_approved(&tool, &args, account.as_deref());
    let mut list = LIST.lock();
    let a = list.iter_mut().find(|a| a.id == id).ok_or_else(|| anyhow::anyhow!("that draft disappeared"))?;
    match outcome {
        Ok(()) => {
            a.state = "sent".into();
            a.result = format!("Done — {} confirmed it.", a.app);
        }
        Err(e) => {
            a.state = "failed".into();
            a.result = format!("It didn't go through: {e}");
        }
    }
    Ok(a.clone())
}

#[cfg(test)]
pub fn clear() {
    LIST.lock().clear();
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    /// The list is shared: these tests take turns.
    static TURN: Mutex<()> = Mutex::new(());

    #[test]
    fn a_draft_waits_once_and_expires() {
        let _turn = TURN.lock();
        clear();
        let args = json!({ "to": "sam@example.com", "body": "Running late" });
        hold("GMAIL_SEND_EMAIL", &args, None, "Gmail", "Here's what I'd do…\n\nWant me to go ahead? Say “yes, send it” — or tell me what to change.");
        hold("GMAIL_SEND_EMAIL", &args, None, "Gmail", "Here's what I'd do…");
        let l = list();
        assert_eq!(l.iter().filter(|a| a.state == "waiting").count(), 1, "the same draft is held once");
        assert!(!l[0].draft.contains("yes, send it"), "the phone shows buttons, not the chat instruction");
        // Old: expired, never sent.
        LIST.lock()[0].made = Some(Instant::now() - EXPIRES - Duration::from_secs(1));
        assert_eq!(list()[0].state, "expired");
        assert_eq!(waiting(), 0);
        assert!(approve(&list()[0].id, "test phone").is_err(), "an expired draft can't be approved");
    }

    #[test]
    fn reject_sends_nothing_and_cant_be_undone_into_a_send() {
        let _turn = TURN.lock();
        clear();
        let id = hold("SLACK_SEND_MESSAGE", &json!({ "channel": "#team", "text": "hi" }), None, "Slack", "draft");
        let r = reject(&id, "test phone").unwrap();
        assert_eq!(r.state, "rejected");
        assert!(approve(&id, "test phone").is_err());
    }

    #[test]
    fn the_phone_never_sees_the_raw_tool_call() {
        let _turn = TURN.lock();
        clear();
        hold("GMAIL_SEND_EMAIL", &json!({ "to": "a@b.c" }), Some("ca_x"), "Gmail", "draft");
        let v = serde_json::to_value(list()).unwrap();
        let s = v.to_string();
        assert!(!s.contains("GMAIL_SEND_EMAIL") && !s.contains("ca_x"), "{s}");
    }
}
