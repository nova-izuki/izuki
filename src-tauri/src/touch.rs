//! Touch Grass: run your PC's work from your phone while you're out.
//!
//! What the paired phone sees and can do (call.rs `/touch/*`, the same
//! per-phone pass as the Remote — no pass, nothing):
//! - Missions, with their real results (Verified, Partly done, Blocked…),
//!   add one, start them, stop everything.
//! - Things waiting for your yes (approvals.rs): Approve or Reject.
//! - What Izuki is doing right now, and whether the PC can work (locked or
//!   not, missions keeping it awake).
//!
//! Every change from the phone goes in the remote audit log.

use serde_json::{json, Value};
use tauri::AppHandle;

/// Everything the phone's Touch Grass page shows.
pub fn status() -> Value {
    let missions: Vec<Value> = crate::missions::list()
        .into_iter()
        .map(|m| json!({ "id": m.id, "text": m.text, "state": m.state, "result": m.result, "at": m.at }))
        .collect();
    let approvals = crate::approvals::list();
    json!({
        "ok": true,
        "missions": missions,
        "running": crate::missions::running(),
        "approvals": approvals,
        "waiting": approvals.iter().filter(|a| a.state == "waiting").count(),
        "doing": crate::state::doing_now(),
        "busy": crate::state::task_running(),
        "locked": crate::uia::screen_locked(),
        "lesson": crate::tutor::glance(),
        "vapid": crate::webpush::public_key().ok(),
    })
}

/// Has this phone switched notifications on?
pub fn push_on(device: &str) -> bool {
    crate::webpush::subs().iter().any(|s| s.device == device)
}

/// One thing the phone asked for.
pub fn act(app: &AppHandle, asked: &Value, device: &str) -> anyhow::Result<Value> {
    let op = asked["op"].as_str().unwrap_or_default();
    match op {
        "add" => {
            let text = asked["text"].as_str().unwrap_or_default().trim();
            if text.is_empty() {
                anyhow::bail!("say what the mission is");
            }
            if text.chars().count() > 400 {
                anyhow::bail!("keep a mission under 400 characters");
            }
            let before = crate::missions::list().len();
            let after = crate::missions::add(text).len();
            if after <= before {
                anyhow::bail!("the mission couldn't be saved on the PC");
            }
            crate::remote::audit(device, "mission added", "");
            Ok(json!({ "ok": true }))
        }
        "run" => {
            let started = crate::missions::run_all(app);
            crate::remote::audit(device, "missions started", "");
            Ok(json!({ "ok": true, "started": started }))
        }
        "stop" => {
            crate::missions::stop();
            crate::brain::cancel_task();
            crate::composio::stop();
            crate::remote::audit(device, "stopped everything", "");
            Ok(json!({ "ok": true }))
        }
        "approve" => {
            let id = asked["id"].as_str().unwrap_or_default();
            let a = crate::approvals::approve(id, device)?;
            Ok(json!({ "ok": a.state == "sent", "approval": a }))
        }
        "reject" => {
            let id = asked["id"].as_str().unwrap_or_default();
            let a = crate::approvals::reject(id, device)?;
            Ok(json!({ "ok": true, "approval": a }))
        }
        "remove" => {
            let id = asked["id"].as_str().unwrap_or_default();
            crate::missions::remove(id);
            crate::remote::audit(device, "mission removed", "");
            Ok(json!({ "ok": true }))
        }
        "push_on" => {
            crate::webpush::subscribe(device, &asked["sub"])?;
            crate::remote::audit(device, "phone notifications on", "");
            crate::webpush::send_to(device, "🌱 Notifications are on", "Izuki will tell you here when something needs your yes or your missions finish.", "welcome");
            Ok(json!({ "ok": true }))
        }
        "push_off" => {
            crate::webpush::unsubscribe(device);
            Ok(json!({ "ok": true }))
        }
        "clear" => {
            crate::missions::clear_done();
            Ok(json!({ "ok": true }))
        }
        _ => anyhow::bail!("unknown request"),
    }
}
