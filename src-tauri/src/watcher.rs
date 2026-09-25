//! The watcher eye.
//!
//! One background thread supervises every watcher. Each one owns a small screen
//! region and its own cadence, so ten watchers cost roughly ten small `BitBlt`s
//! per second rather than ten full-screen grabs — cheap enough to leave running
//! all day while you wait on a drop, a queue or a slow form.

use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;

use tauri::{AppHandle, Emitter};

use crate::automation;
use crate::capture::{self, Frame};
use crate::events;
use crate::model::{
    now_ms, ActionStep, Intent, StatusEvent, Watcher, WatcherAction, WatcherCondition,
    WatcherStatus,
};
use crate::ocr;
use crate::store::Store;

/// Per-watcher scratch state that never needs persisting.
#[derive(Default)]
struct Memory {
    baseline: Option<Frame>,
    next_due: i64,
    /// Consecutive failures, used to back off a watcher that keeps erroring.
    failures: u32,
}

pub fn spawn(app: AppHandle, store: Arc<Store>) {
    std::thread::Builder::new()
        .name("izuki-watchers".into())
        .spawn(move || run(app, store))
        .ok();
}

fn run(app: AppHandle, store: Arc<Store>) {
    let mut memory: HashMap<String, Memory> = HashMap::new();

    loop {
        std::thread::sleep(Duration::from_millis(80));

        let watchers = store.watchers();
        if watchers.is_empty() {
            memory.clear();
            std::thread::sleep(Duration::from_millis(400));
            continue;
        }

        // Forget state for watchers that no longer exist.
        memory.retain(|id, _| watchers.iter().any(|w| &w.id == id));

        let now = now_ms();
        let mut changed = false;

        for w in watchers.iter().filter(|w| w.enabled) {
            let mem = memory.entry(w.id.clone()).or_default();
            if now < mem.next_due {
                continue;
            }

            // Back off after repeated failures so a broken watcher cannot spin.
            let backoff = (1u64 << mem.failures.min(5)).min(32);
            mem.next_due = now + (w.interval_ms.max(80) * backoff) as i64;

            match check(w, mem, &app) {
                Ok(fired) => {
                    mem.failures = 0;
                    store.mutate_watcher(&w.id, |x| {
                        x.last_checked = Some(now);
                        if x.status == WatcherStatus::Error {
                            x.status = WatcherStatus::Watching;
                            x.message = None;
                        }
                    });

                    if fired {
                        changed = true;
                        trigger(&app, &store, w);
                    }
                }
                Err(e) => {
                    mem.failures += 1;
                    changed = true;
                    store.mutate_watcher(&w.id, |x| {
                        x.status = WatcherStatus::Error;
                        x.message = Some(e.to_string());
                        x.last_checked = Some(now);
                    });
                }
            }
        }

        if changed {
            let _ = app.emit(events::WATCHERS_CHANGED, ());
        }
    }
}

/// Evaluate one watcher. Returns whether its condition is now met.
fn check(w: &Watcher, mem: &mut Memory, app: &AppHandle) -> anyhow::Result<bool> {
    let frame = capture::capture(w.region)?;

    let fired = match &w.condition {
        WatcherCondition::PixelColor { color, tolerance } => {
            let (tr, tg, tb) = parse_hex(color).unwrap_or((0, 0, 0));
            let (r, g, b) = frame.average();
            let d = (r as i32 - tr as i32)
                .abs()
                .max((g as i32 - tg as i32).abs())
                .max((b as i32 - tb as i32).abs());
            d <= *tolerance as i32
        }

        WatcherCondition::RegionChanged { threshold } => {
            let fired = match &mem.baseline {
                Some(base) => frame.difference(base) >= *threshold,
                // First look establishes the baseline; never fire on it.
                None => false,
            };
            mem.baseline = Some(frame.clone());
            fired
        }

        WatcherCondition::TextAppears { text } => {
            let seen = ocr::read_frame(&frame).unwrap_or_default();
            ocr::contains_loose(&seen, text)
        }

        WatcherCondition::TextDisappears { text } => {
            let seen = ocr::read_frame(&frame).unwrap_or_default();
            !ocr::contains_loose(&seen, text)
        }

        WatcherCondition::Vision { question } => {
            // Deliberately the slowest path; only worth it when the answer
            // needs judgement rather than pixels.
            let _ = app;
            crate::brain::ask_yes_no(&frame, question)?
        }
    };

    Ok(fired)
}

fn trigger(app: &AppHandle, store: &Arc<Store>, w: &Watcher) {
    let settings = store.settings();
    let move_ms = settings.move_duration_ms;
    let dry = settings.dry_run;

    let detail = match &w.action {
        WatcherAction::Click { x, y } => {
            let step = ActionStep {
                action: Intent::Click,
                x: *x,
                y: *y,
                x2: None,
                y2: None,
                text_to_type: None,
                key: None,
                scroll_amount: None,
                confidence: 1.0,
                reasoning: "watcher fired".into(),
                snapped_to: None,
                target: None,
                target2: None,
            };
            automation::execute(&step, move_ms, settings.magnetic_hand, dry)
                .map(|s| s)
                .unwrap_or_else(|e| format!("click failed: {e}"))
        }
        WatcherAction::Type { text } => {
            if dry {
                format!("[dry run] would type {} characters", text.chars().count())
            } else {
                automation::type_text(text)
                    .map(|_| "typed".to_string())
                    .unwrap_or_else(|e| format!("typing failed: {e}"))
            }
        }
        WatcherAction::RunFlow { flow_id } => match store.flow(flow_id) {
            Some(flow) => {
                crate::brain::run_steps(app, store, &flow.steps);
                format!("ran flow “{}”", flow.name)
            }
            None => "that flow no longer exists".into(),
        },
        WatcherAction::Notify => "notified".into(),
    };

    store.mutate_watcher(&w.id, |x| {
        x.status = WatcherStatus::Triggered;
        x.last_triggered = Some(now_ms());
        x.trigger_count += 1;
        x.message = Some(detail.clone());
        if x.once {
            x.enabled = false;
        }
    });

    let _ = app.emit(
        events::STATUS,
        StatusEvent {
            kind: "success",
            message: format!("Watcher “{}” fired", w.name),
            detail: Some(detail),
        },
    );
}

fn parse_hex(s: &str) -> Option<(u8, u8, u8)> {
    let h = s.trim().trim_start_matches('#');
    if h.len() != 6 {
        return None;
    }
    Some((
        u8::from_str_radix(&h[0..2], 16).ok()?,
        u8::from_str_radix(&h[2..4], 16).ok()?,
        u8::from_str_radix(&h[4..6], 16).ok()?,
    ))
}
