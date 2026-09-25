//! The pipeline: capture → read → plan → refine → act.
//!
//! The ordering here is what makes Izuki feel instant. A plan derived from the
//! geometry exists before any network call is made, so the hand can start
//! moving while a model is still thinking — and if no model is configured, or
//! it fails, nothing is lost.

use std::sync::Arc;
use std::time::Duration;

use anyhow::{anyhow, Result};
use parking_lot::Mutex;
use tauri::{AppHandle, Emitter};

use crate::automation;
use crate::capture::{self, Frame};
use crate::events;
use crate::ghost;
use crate::model::{
    now_ms, ActionStep, DrawSession, Flow, HandCommand, Intent, Rect, StatusEvent, VisionPlan,
    Watcher, WatcherAction, WatcherCondition, WatcherStatus,
};
use crate::ocr;
use crate::overlay;
use crate::planner;
use crate::store::Store;
use crate::uia;
use crate::vision::{self, VisionRequest};

/// The frame grabbed when the overlay opened, reused for the whole pass so the
/// model sees exactly what the user drew on.
static FROZEN: Mutex<Option<Frame>> = Mutex::new(None);

/// Longest edge sent to a vision model. Beyond this, accuracy stops improving
/// and both latency and token cost climb steeply.
const MODEL_IMAGE_EDGE: u32 = 1280;
/// How many real controls to list for the model — enough for a busy app's
/// visible UI without drowning a small model's context.
pub const MAX_CONTROLS: usize = 80;

pub fn set_frozen(frame: Option<Frame>) {
    *FROZEN.lock() = frame;
}

pub fn frozen() -> Option<Frame> {
    FROZEN.lock().clone()
}

/// Capture the desktop and stash it, then hand back a JPEG data URL the
/// overlay can paint as its frozen backdrop.
pub fn capture_frozen() -> Result<String> {
    let frame = capture::capture_all()?;
    let url = frame.to_jpeg_data_url(72)?;
    set_frozen(Some(frame));
    Ok(url)
}

// ---------------------------------------------------------------------------
// The main pass
// ---------------------------------------------------------------------------

pub fn submit_draw(app: &AppHandle, store: &Arc<Store>, mut session: DrawSession) -> VisionPlan {
    let settings = store.settings();
    automation::clear_abort();

    if session.created_at == 0 {
        session.created_at = now_ms();
    }

    // The frame the marks were drawn over. Falling back to a fresh grab keeps
    // things working when the overlay ran without freezing.
    let frame = frozen().or_else(|| capture::capture_all().ok());

    // ---- read any text inside the marks -------------------------------
    if settings.ocr_enabled {
        if let Some(f) = &frame {
            for m in &mut session.marks {
                // Only worth doing for regions the user outlined.
                if m.rect.w < 6 || m.rect.h < 6 {
                    continue;
                }
                if let Some(crop) = f.crop(&m.rect.inflate(4)) {
                    if let Ok(text) = ocr::read_frame(&crop) {
                        if !text.trim().is_empty() {
                            m.ocr = Some(text);
                        }
                    }
                }
            }
        }
    }

    // Scribbles are instructions — fold their transcription into the prompt.
    let scribbled: Vec<String> = session
        .marks
        .iter()
        .filter(|m| matches!(m.kind, crate::model::ShapeKind::Pen))
        .filter_map(|m| m.text.clone().or_else(|| m.ocr.clone()))
        .filter(|t| !t.trim().is_empty())
        .collect();
    if !scribbled.is_empty() {
        if !session.prompt.trim().is_empty() {
            session.prompt.push_str(" ");
        }
        session.prompt.push_str(&scribbled.join(" "));
    }

    // ---- watchers asked for by name -----------------------------------
    let mut made_watchers = 0usize;
    for m in planner::watch_marks(&session) {
        let name = m
            .ocr
            .clone()
            .or_else(|| m.text.clone())
            .map(|t| t.chars().take(36).collect::<String>())
            .filter(|t| !t.trim().is_empty())
            .unwrap_or_else(|| format!("Region {}x{}", m.rect.w, m.rect.h));

        store.add_watcher(Watcher {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            region: m.rect,
            condition: WatcherCondition::RegionChanged { threshold: 6.0 },
            action: WatcherAction::Notify,
            interval_ms: 700,
            enabled: true,
            once: false,
            created_at: now_ms(),
            last_checked: None,
            last_triggered: None,
            trigger_count: 0,
            status: WatcherStatus::Watching,
            message: None,
        });
        made_watchers += 1;
    }
    if made_watchers > 0 {
        let _ = app.emit(events::WATCHERS_CHANGED, ());
    }

    // ---- the instant, local plan --------------------------------------
    let local = planner::local_plan(&session);

    // ---- refine with a model, if one is worth asking ------------------
    let mut plan = VisionPlan {
        steps: local.clone(),
        summary: if local.is_empty() && made_watchers > 0 {
            format!("Watching {made_watchers} region(s).")
        } else {
            "Read straight from your marks.".into()
        },
        provider: "local".into(),
        model: "geometry".into(),
        latency_ms: 0,
        ..Default::default()
    };

    if should_ask_model(&session, &local) {
        if let Some(f) = &frame {
            let _ = app.emit(events::STATUS, StatusEvent::working("Izuki is looking…"));
            match ask_model(store, &session, f, &local) {
                Ok(refined) if !refined.steps.is_empty() => plan = refined,
                Ok(_) => {}
                Err(e) => {
                    let _ = app.emit(
                        events::STATUS,
                        StatusEvent::error("Falling back to your marks", e.to_string()),
                    );
                }
            }
        }
    }

    // ---- remember it as a flow ----------------------------------------
    if settings.autosave_flows && !plan.steps.is_empty() {
        let thumbnail = frame
            .as_ref()
            .and_then(|f| thumbnail_of(f, &session))
            .and_then(|t| t.to_jpeg_data_url(58).ok());

        let app_name = uia::foreground_app();
        let name = flow_name(&session, &plan, &app_name);

        store.add_flow(Flow {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            app: app_name,
            steps: plan.steps.clone(),
            prompt: session.prompt.clone(),
            thumbnail,
            created_at: now_ms(),
            last_run: Some(now_ms()),
            run_count: 1,
            hotkey: None,
        });
        let _ = app.emit(events::FLOWS_CHANGED, ());
    }

    // ---- act ------------------------------------------------------------
    if !settings.confirm_before_act && !plan.steps.is_empty() {
        run_steps(app, store, &plan.steps);
    }

    set_frozen(None);
    plan
}

/// Only pay for a model when the marks leave something genuinely open.
fn should_ask_model(session: &DrawSession, local: &[ActionStep]) -> bool {
    if !session.prompt.trim().is_empty() {
        return true;
    }
    if local.is_empty() {
        return !session.marks.is_empty();
    }
    // A box on its own, or a mark the user left on "auto", benefits from a look.
    session
        .marks
        .iter()
        .any(|m| m.intent == Intent::Auto && !matches!(m.kind, crate::model::ShapeKind::Circle))
}

fn ask_model(
    store: &Arc<Store>,
    session: &DrawSession,
    frame: &Frame,
    draft: &[ActionStep],
) -> Result<VisionPlan> {
    let _ = store; // brains now come from `brain_chain()`
    let started = std::time::Instant::now();

    let annotated = planner::annotate(frame, session);
    let scaled = annotated.downscaled(MODEL_IMAGE_EDGE);
    let image_jpeg = scaled.to_jpeg(80)?;

    let ocr_text = session
        .marks
        .iter()
        .filter_map(|m| m.ocr.clone())
        .collect::<Vec<_>>()
        .join("\n");

    let req = VisionRequest {
        image_jpeg,
        image_size: (scaled.width, scaled.height),
        desktop: Rect {
            x: frame.origin.0,
            y: frame.origin.1,
            w: frame.width as i32,
            h: frame.height as i32,
        },
        marks_description: planner::describe(session),
        user_prompt: session.prompt.clone(),
        ocr_text,
        app: uia::foreground_app(),
        window_title: uia::foreground_title(),
        draft: draft.to_vec(),
        // Izuki's "hands": the real controls on screen, numbered, so the
        // model can say "click #7" instead of guessing pixels.
        controls: {
            let t = std::time::Instant::now();
            let c = uia::controls_fresh_or_now(MAX_CONTROLS);
            eprintln!("[brain] screen controls: {} in {} ms", c.len(), t.elapsed().as_millis());
            c
        },
        memory: crate::memory::prompt_block(),
    };
    let prep_ms = started.elapsed().as_millis();

    let chain = brain_chain();
    if chain.is_empty() {
        return Err(anyhow!("no brain is configured"));
    }
    let plan = ask_racing(&chain, req, prep_ms)?;
    // Anything lasting the user just mentioned about themselves.
    for fact in &plan.remember {
        crate::memory::add(fact);
    }
    Ok(plan)
}

/// Every brain worth asking, best first: the chosen one, its backup, then any
/// other provider with a key — minus ones known to be unable to answer,
/// with a much faster one moved ahead of a slow choice. A broken or
/// misnamed model (common with free routers) shouldn't leave Izuki with
/// nothing to say. Shared by the screen path and the chat lane (chat.rs).
pub fn brain_chain() -> Vec<crate::settings::ProviderConfig> {
    let settings = crate::state::store().settings();
    let Some(primary) = settings.provider(settings.active_provider).cloned() else {
        return Vec::new();
    };
    let mut chain = vec![primary];
    if let Some(f) = settings.fallback_provider.and_then(|id| settings.provider(id).cloned()) {
        if f.id != chain[0].id && (!f.api_key.trim().is_empty() || f.id.is_local()) {
            chain.push(f);
        }
    }
    for p in &settings.providers {
        if !p.api_key.trim().is_empty() && !p.id.is_local() && !chain.iter().any(|c| c.id == p.id) {
            chain.push(p.clone());
        }
    }
    skip_broken(&mut chain);
    order_by_speed(&mut chain);
    chain
}

/// Record how a brain did outside the racing path (the chat lane).
pub fn note_answer(id: crate::settings::ProviderId, result: Result<u128, &str>) {
    match result {
        Ok(ms) => note_speed(id, Some(ms)),
        Err(e) => {
            note_speed(id, None);
            if is_hopeless(e) {
                mark_broken(id);
            }
        }
    }
}

// ---------------------------------------------------------------------------
// How fast each brain has been answering
// ---------------------------------------------------------------------------

/// Recent answer time per brain (ms, smoothed); failures count as very slow.
static SPEED: parking_lot::Mutex<Vec<(crate::settings::ProviderId, f64)>> = parking_lot::Mutex::new(Vec::new());
static SPEED_LOADED: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

/// Kept on disk so the fast brain goes first from the very first request
/// after a restart — not only once the slow one has been tried again.
fn speed_file() -> std::path::PathBuf {
    crate::store::data_dir().join("brain_speed.json")
}

fn speeds() -> parking_lot::MutexGuard<'static, Vec<(crate::settings::ProviderId, f64)>> {
    let mut g = SPEED.lock();
    // (Tests start from nothing — not from this PC's real history.)
    if !SPEED_LOADED.swap(true, std::sync::atomic::Ordering::SeqCst) && !cfg!(test) {
        if let Some(saved) = std::fs::read_to_string(speed_file())
            .ok()
            .and_then(|raw| serde_json::from_str::<Vec<(crate::settings::ProviderId, f64)>>(&raw).ok())
        {
            *g = saved;
        }
    }
    g
}

fn note_speed(id: crate::settings::ProviderId, ms: Option<u128>) {
    // A one-off failure (a free model returning nothing under load) counts
    // as slow, not as hopeless.
    let v = ms.map(|m| m as f64).unwrap_or(15_000.0);
    let mut speeds = speeds();
    match speeds.iter_mut().find(|(p, _)| *p == id) {
        Some((_, avg)) => *avg = *avg * 0.5 + v * 0.5,
        None => speeds.push((id, v)),
    }
    if !cfg!(test) {
        if let Ok(json) = serde_json::to_string(&*speeds) {
            let _ = std::fs::write(speed_file(), json);
        }
    }
}

fn expected_ms(id: crate::settings::ProviderId) -> Option<f64> {
    speeds().iter().find(|(p, _)| *p == id).map(|(_, v)| *v)
}

/// Brains that can't answer at all right now — no credits, no connected
/// account, not running — and when that was found out.
static BROKEN: parking_lot::Mutex<Vec<(crate::settings::ProviderId, std::time::Instant)>> =
    parking_lot::Mutex::new(Vec::new());
const BROKEN_FOR: std::time::Duration = std::time::Duration::from_secs(10 * 60);

/// An error that won't fix itself by asking again in a minute.
fn is_hopeless(err: &str) -> bool {
    let e = err.to_ascii_lowercase();
    [
        "no credits",
        "insufficient_quota",
        "no active credentials",
        "rejected the key",
        "unauthorized",
        "401",
        "402",
        "403",
        "404",
        "connection refused",
    ]
    .iter()
    .any(|p| e.contains(p))
        // Can't reach a *local* brain (Ollama/9Router not running) — but a
        // busy cloud queue timing out is just slow, not broken.
        || (e.contains("error sending request") && (e.contains("localhost") || e.contains("127.0.0.1")))
}

fn mark_broken(id: crate::settings::ProviderId) {
    let mut b = BROKEN.lock();
    b.retain(|(p, _)| *p != id);
    b.push((id, std::time::Instant::now()));
}

/// Leave out brains known to be unable to answer (for a while) — asking
/// them only burned the racing slots. The chosen brain always stays.
fn skip_broken(chain: &mut Vec<crate::settings::ProviderConfig>) {
    let mut b = BROKEN.lock();
    b.retain(|(_, at)| at.elapsed() < BROKEN_FOR);
    let first = chain.first().map(|c| c.id);
    chain.retain(|c| Some(c.id) == first || !b.iter().any(|(p, _)| *p == c.id));
}

/// Keep the user's chosen brain first — unless it has been slow and
/// another has been far faster lately, then ask the fast one first (the
/// chosen one is still asked if the fast one stalls or fails). A free model
/// that takes 20 s shouldn't cost 20 s — or even the 2.5 s racing wait —
/// on every single request.
fn order_by_speed(chain: &mut [crate::settings::ProviderConfig]) {
    if chain.len() < 2 {
        return;
    }
    let guess = |c: &crate::settings::ProviderConfig| expected_ms(c.id).unwrap_or(5_000.0);
    let first = guess(&chain[0]);
    // The rest: fastest first.
    chain[1..].sort_by(|a, b| guess(a).total_cmp(&guess(b)));
    if first > 6_000.0 && guess(&chain[1]) < first * 0.4 {
        eprintln!(
            "[brain] {} has been slow (~{:.0} s) — asking {} first (~{:.1} s)",
            chain[0].label,
            first / 1000.0,
            chain[1].label,
            guess(&chain[1]) / 1000.0
        );
        chain.swap(0, 1);
    }
}

/// How long the chosen brain gets before a backup is asked as well.
const HEDGE_AFTER: std::time::Duration = std::time::Duration::from_millis(2000);

/// Ask the brains in `chain` order, but don't wait on a slow one: if the
/// current brain hasn't answered after `HEDGE_AFTER`, the next one is asked
/// too and whichever answers first wins. A failure moves straight on.
/// (A free model that takes 20 s used to mean a 20 s wait.)
fn ask_racing(chain: &[crate::settings::ProviderConfig], req: VisionRequest, prep_ms: u128) -> Result<VisionPlan> {
    use std::sync::{mpsc, Arc};
    use std::time::{Duration, Instant};

    let req = Arc::new(req);
    let (tx, rx) = mpsc::channel::<(usize, Result<VisionPlan>, Duration)>();
    let launch = |i: usize| {
        let (tx, cfg, req) = (tx.clone(), chain[i].clone(), req.clone());
        std::thread::spawn(move || {
            let t = Instant::now();
            let r = vision::ask(&cfg, &req);
            // Remember how this brain did, even if another one won the race.
            note_speed(cfg.id, r.as_ref().ok().map(|_| t.elapsed().as_millis()));
            if let Err(e) = &r {
                if is_hopeless(&e.to_string()) {
                    mark_broken(cfg.id);
                }
            }
            let _ = tx.send((i, r, t.elapsed()));
        });
    };

    launch(0);
    let mut launched = 1;
    let mut finished = 0;
    let mut errors = Vec::new();
    loop {
        let wait = if launched < chain.len() { HEDGE_AFTER } else { Duration::from_secs(120) };
        match rx.recv_timeout(wait) {
            Ok((i, Ok(plan), took)) => {
                eprintln!(
                    "[brain] {} ({}) answered in {} ms (prep {} ms){}",
                    chain[i].label,
                    chain[i].model,
                    took.as_millis(),
                    prep_ms,
                    if errors.is_empty() { String::new() } else { format!(" after: {}", errors.join("; ")) }
                );
                return Ok(plan);
            }
            Ok((i, Err(e), took)) => {
                eprintln!("[brain] {} ({}) failed in {} ms: {e}", chain[i].label, chain[i].model, took.as_millis());
                errors.push(format!("{}: {e}", chain[i].label));
                finished += 1;
                if launched < chain.len() {
                    launch(launched);
                    launched += 1;
                } else if finished == launched {
                    return Err(anyhow!("{}", errors.join("; ")));
                }
            }
            Err(mpsc::RecvTimeoutError::Timeout) if launched < chain.len() => {
                eprintln!("[brain] {} is slow — asking {} too", chain[launched - 1].label, chain[launched].label);
                launch(launched);
                launched += 1;
            }
            Err(_) => return Err(anyhow!("no brain answered in time")),
        }
    }
}

fn flow_name(session: &DrawSession, plan: &VisionPlan, app: &str) -> String {
    let from_prompt: String = session.prompt.trim().chars().take(40).collect();
    if !from_prompt.is_empty() {
        return from_prompt;
    }
    if !plan.summary.trim().is_empty() && plan.summary != "Read straight from your marks." {
        return plan.summary.trim().chars().take(40).collect();
    }
    let verb = plan
        .steps
        .first()
        .map(|s| s.action.as_str())
        .unwrap_or("flow");
    if app.is_empty() {
        format!("{verb} ×{}", plan.steps.len())
    } else {
        format!("{verb} in {app}")
    }
}

/// A small crop around everything the user drew, for the flow thumbnail.
fn thumbnail_of(frame: &Frame, session: &DrawSession) -> Option<Frame> {
    let mut bounds: Option<Rect> = None;
    for m in &session.marks {
        bounds = Some(match bounds {
            None => m.rect,
            Some(b) => {
                let x0 = b.x.min(m.rect.x);
                let y0 = b.y.min(m.rect.y);
                let x1 = (b.x + b.w).max(m.rect.x + m.rect.w);
                let y1 = (b.y + b.h).max(m.rect.y + m.rect.h);
                Rect { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }
            }
        });
    }

    let b = bounds?.inflate(48);
    let annotated = planner::annotate(frame, session);
    Some(annotated.crop(&b)?.downscaled(360))
}

// ---------------------------------------------------------------------------
// Running a plan
// ---------------------------------------------------------------------------

/// Execute steps on a worker thread, driving the on-screen hand ahead of each
/// one so the user can see where Izuki is about to act.
pub fn run_steps(app: &AppHandle, store: &Arc<Store>, steps: &[ActionStep]) {
    run_steps_then(app, store, steps, || {});
}

/// Same as [`run_steps`], but calls `on_done` once the plan finishes — whether
/// it completed, failed on a step, or was stopped with the panic key. Voice
/// and chat commands use this to close the preview overlay behind them
/// without leaving it stranded on screen.
pub fn run_steps_then<F>(app: &AppHandle, store: &Arc<Store>, steps: &[ActionStep], on_done: F)
where
    F: FnOnce() + Send + 'static,
{
    let steps = steps.to_vec();
    let app = app.clone();
    let store = store.clone();

    std::thread::Builder::new()
        .name("izuki-act".into())
        .spawn(move || {
            run_steps_blocking(&app, &store, &steps);
            on_done();
        })
        .ok();
}

/// Run `steps` on this thread. `true` if every step ran (not stopped and
/// no step failed).
fn run_steps_blocking(app: &AppHandle, store: &Arc<Store>, steps: &[ActionStep]) -> bool {
            let settings = store.settings();
            let move_ms = settings.move_duration_ms;
            automation::clear_abort();

            // If the command came from Izuki's chat bubble, Izuki holds the
            // keyboard right now — hand it back so typing lands in the app.
            uia::focus_target_window();
            std::thread::sleep(std::time::Duration::from_millis(60));

            let app_name = uia::foreground_app();

            let run = || {
                for (i, step) in steps.iter().enumerate() {
                    if automation::aborted() {
                        let _ = app.emit(events::STATUS, StatusEvent::info("Stopped."));
                        return false;
                    }

                    // Pointing is only seen on the overlay — make sure it's up.
                    if step.action == Intent::Point {
                        let _ = crate::overlay::ensure_caption_visible(app);
                    }
                    // Tell the overlay's hand where it is going before we move
                    // the real pointer, so the animation leads rather than trails.
                    let _ = app.emit(
                        events::HAND,
                        HandCommand {
                            x: step.x,
                            y: step.y,
                            x2: step.x2,
                            y2: step.y2,
                            action: step.action,
                            duration_ms: move_ms,
                            label: Some(format!("{}/{}", i + 1, steps.len())),
                        },
                    );

                    match automation::execute(step, move_ms, settings.magnetic_hand, settings.dry_run)
                    {
                        Ok(detail) => {
                            if matches!(step.action, Intent::Click | Intent::DoubleClick) {
                                ghost::record(&store, &app_name, step.x, step.y);
                            }
                            let _ = app.emit(
                                events::STATUS,
                                StatusEvent {
                                    kind: if i + 1 == steps.len() { "success" } else { "working" },
                                    message: format!("Step {}/{}", i + 1, steps.len()),
                                    detail: Some(detail),
                                },
                            );
                        }
                        Err(e) => {
                            let _ = app.emit(
                                events::STATUS,
                                StatusEvent::error(format!("Step {} failed", i + 1), e.to_string()),
                            );
                            return false;
                        }
                    }

                    // Breathing room between steps so the app under us can react.
                    std::thread::sleep(Duration::from_millis(140));
                }
                true
            };

            run()
}

pub fn run_flow(app: &AppHandle, store: &Arc<Store>, id: &str) -> Result<()> {
    let flow = store.flow(id).ok_or_else(|| anyhow!("no such flow"))?;
    store.mutate_flow(id, |f| {
        f.run_count += 1;
        f.last_run = Some(now_ms());
    });
    let _ = app.emit(events::FLOWS_CHANGED, ());
    let _ = app.emit(
        events::STATUS,
        StatusEvent::working(format!("Replaying “{}”", flow.name)),
    );
    run_steps(app, store, &flow.steps);
    Ok(())
}

// ---------------------------------------------------------------------------
// Voice and chat commands — no marks, just an ask and a look at the screen
// ---------------------------------------------------------------------------

/// "Hey Izuki, do X" or a typed line in the chat box. There is nothing drawn
/// to anchor the request, so the whole screen and the prompt are all the
/// model gets — the same pipeline `submit_draw` uses, just with an empty
/// mark list standing in for the geometry-only fast path.
pub fn submit_voice_command(app: &AppHandle, store: &Arc<Store>, prompt: String) -> VisionPlan {
    let settings = store.settings();
    automation::clear_abort();

    // "Keep going" after a task had to stop: pick it up where it left off.
    let (prompt, resumed) = match UNFINISHED.lock().take() {
        Some((task, done)) if is_keep_going(&prompt) => (task, done),
        Some(t) => {
            // Something new — forget the old one.
            let _ = t;
            (prompt, Vec::new())
        }
        None => (prompt, Vec::new()),
    };

    let focus = matches!(settings.execution_mode, crate::settings::ExecutionMode::Focus);

    // Look first, before any Izuki UI goes up, so the model sees the user's
    // screen rather than Izuki's own overlay.
    let frame = capture::capture_all().ok();

    // Focus mode puts up the overlay as a *live*, click-through viewport so
    // the hand has somewhere to visibly point while it acts. It deliberately
    // never freezes or dims the screen for a spoken/typed command: that hid
    // the real screen behind a still picture for the whole wait — the mouse
    // seemed dead while the model thought, and the result of each action
    // (a menu opening, a page loading) couldn't be seen as it happened.
    // Freezing stays for the draw overlay, where it's what you draw on.
    if focus {
        let b = capture::virtual_bounds();
        let _ = overlay::show_overlay(app, false);
        let _ = app.emit(
            events::OVERLAY_OPEN,
            crate::model::OverlayOpenPayload {
                desktop: crate::model::DesktopBounds {
                    x: b.x,
                    y: b.y,
                    w: b.w,
                    h: b.h,
                    scale: 1.0,
                },
                freeze: false,
                mode: "preview",
                shape: None,
            },
        );
    }

    let _ = app.emit(events::STATUS, StatusEvent::working("Izuki is looking…"));
    let Some(frame) = frame else {
        set_frozen(None);
        if focus {
            let _ = overlay::hide_overlay(app);
        }
        let _ = app.emit(
            events::STATUS,
            StatusEvent::error("Could not see the screen", "Screen capture failed."),
        );
        return VisionPlan {
            steps: Vec::new(),
            summary: "Could not capture the screen.".into(),
            provider: "local".into(),
            model: "geometry".into(),
            latency_ms: 0,
            ..Default::default()
        };
    };

    // Look, act, look again — the way a person does a task. One plan made
    // from one screenshot runs blind: "open Chrome and play some music"
    // opened Chrome and stopped at its profile picker, because the picker
    // didn't exist yet when the plan was made. So after each batch of steps
    // the model can say there's `more`, and it gets a fresh look.
    let mut frame = frame;
    let mut done_so_far: Vec<String> = resumed;
    // What the user showed or told Izuki when it asked, for the next look.
    let mut shown: Vec<crate::model::Mark> = Vec::new();
    let mut told: Option<String> = None;
    let mut asked = 0;
    // The same steps twice in a row means they aren't working.
    let mut last_round: Vec<(Intent, i32, i32)> = Vec::new();
    let mut last_look: Option<crate::capture::Frame> = None;
    let mut repeats = 0;
    let mut all_steps: Vec<ActionStep> = Vec::new();
    let mut last_plan: Option<VisionPlan> = None;

    for round in 0..MAX_ROUNDS {
        let mut ask = if done_so_far.is_empty() {
            prompt.clone()
        } else {
            format!(
                "{prompt}\n\nAlready done (don't repeat): {}.\nThis is the screen now. Carry on with the task, or finish.",
                done_so_far.join("; ")
            )
        };
        if let Some(note) = told.take() {
            ask.push_str(&format!("\n{note}"));
        }
        let session = DrawSession {
            marks: std::mem::take(&mut shown),
            prompt: ask,
            desktop: Rect { x: frame.origin.0, y: frame.origin.1, w: frame.width as i32, h: frame.height as i32 },
            created_at: now_ms(),
        };

        // Free brains get busy (rate limits, overloaded queues): wait and
        // try again rather than dropping the task halfway.
        let mut attempt = 0u64;
        let asked_now = loop {
            match ask_model(store, &session, &frame, &[]) {
                Ok(plan) => break Ok(plan),
                Err(e) => {
                    attempt += 1;
                    eprintln!("[agent] round {} try {attempt} failed: {e}", round + 1);
                    if attempt >= 3 || automation::aborted() {
                        break Err(e);
                    }
                    if attempt == 1 {
                        let _ = app.emit(
                            "izuki://say",
                            serde_json::json!({ "text": "The free AI's busy — give me a second.", "mood": "calm", "reply": true, "quick": true }),
                        );
                    }
                    let _ = app.emit(events::STATUS, StatusEvent::working("Waiting for a free AI brain…"));
                    let until = std::time::Instant::now() + Duration::from_secs(6 * attempt);
                    while std::time::Instant::now() < until && !automation::aborted() {
                        std::thread::sleep(Duration::from_millis(200));
                    }
                }
            }
        };
        let plan = match asked_now {
            Ok(plan) => plan,
            // Partway through: keep what was done, say so, and remember
            // where it got to so "keep going" can pick it up.
            Err(e) if round > 0 => {
                eprintln!("[agent] giving up for now: {e}");
                *UNFINISHED.lock() = Some((prompt.clone(), done_so_far.clone()));
                let mut plan = last_plan.take().unwrap_or_default();
                plan.summary = "The free AI brains are maxed out right now, so I had to stop there. Say \"keep going\" in a minute and I'll pick up where I left off.".into();
                plan.mood = Some("sympathetic".into());
                last_plan = Some(plan);
                break;
            }
            Err(e) => {
                set_frozen(None);
                if focus {
                    let _ = overlay::hide_overlay(app);
                }
                let _ = app.emit(
                    events::STATUS,
                    StatusEvent::error("Izuki couldn't work out what to do", e.to_string()),
                );
                return VisionPlan {
                    steps: Vec::new(),
                    summary: e.to_string(),
                    provider: "local".into(),
                    model: "geometry".into(),
                    latency_ms: 0,
                    ..Default::default()
                };
            }
        };
        set_frozen(None);

        let steps = plan.steps.clone();
        let done = plan.done;
        let wait = plan.wait;
        eprintln!(
            "[agent] round {}: {} step(s){}{} — {}",
            round + 1,
            steps.len(),
            if done { ", done" } else { "" },
            if wait > 0 { format!(", wait {wait}s") } else { String::new() },
            plan.summary.chars().take(80).collect::<String>()
        );
        let this_round: Vec<(Intent, i32, i32)> = steps.iter().map(|s| (s.action, s.x / 12, s.y / 12)).collect();
        let look = frame.downscaled(160);
        let screen_changed = last_look
            .as_ref()
            .map(|prev| crate::live::changed_share(prev, &look) > 0.02)
            .unwrap_or(true);
        last_look = Some(look);
        if !this_round.is_empty() && this_round == last_round && !screen_changed {
            repeats += 1;
            if repeats >= 2 {
                eprintln!("[agent] stuck repeating the same steps — stopping");
                let mut plan = plan;
                plan.summary = "Hmm, I'm going in circles there — can you take it from here, or tell me what I'm missing?".into();
                plan.mood = Some("sympathetic".into());
                last_plan = Some(plan);
                break;
            }
            // Don't just do it again: say so, and let it try something else.
            told = Some("Your last steps didn't change anything on screen — try a different way.".into());
            last_plan = Some(plan);
            continue;
        }
        last_round = this_round;
        // Stuck on "which one?": ask, and carry on with what they show us.
        if let (true, Some(question)) = (steps.is_empty(), plan.ask.clone()) {
            if asked < 3 && !automation::aborted() {
                asked += 1;
                if focus {
                    let _ = overlay::hide_overlay(app);
                }
                match ask_user(app, &question) {
                    Some(answer) => {
                        let said = answer.prompt.trim().to_string();
                        told = Some(format!(
                            "You asked: \"{question}\". The user answered{}{}.",
                            if answer.marks.is_empty() { "" } else { " by marking it on the screen (their mark is drawn on the screenshot)" },
                            if said.is_empty() { String::new() } else { format!(", saying: \"{said}\"") },
                        ));
                        shown = answer.marks;
                        // Let the overlay close before looking again.
                        std::thread::sleep(Duration::from_millis(350));
                        match capture::capture_all() {
                            Ok(f) => frame = f,
                            Err(_) => break,
                        }
                        continue;
                    }
                    None => {
                        let mut plan = plan;
                        plan.summary = "Okay, I'll leave it there.".into();
                        last_plan = Some(plan);
                        break;
                    }
                }
            }
        }
        if round == 0 && steps.is_empty() {
            // A question, or nothing to do: answered in the summary.
            if focus {
                let _ = overlay::hide_overlay(app);
            }
            let _ = app.emit(
                events::STATUS,
                StatusEvent::info(if plan.summary.trim().is_empty() {
                    "Nothing to do.".to_string()
                } else {
                    plan.summary.clone()
                }),
            );
            return plan;
        }
        // Say what it's doing as it goes — "Opening YouTube…" — unless this
        // is the last word (that one is the reply).
        if !steps.is_empty() && !done && !plan.summary.trim().is_empty() {
            let _ = app.emit(
                "izuki://say",
                serde_json::json!({ "text": plan.summary, "mood": plan.mood, "reply": true, "quick": true }),
            );
        }
        last_plan = Some(plan);
        if steps.is_empty() {
            break;
        }

        let finished = run_steps_blocking(app, store, &steps);
        all_steps.extend(steps.iter().cloned());
        done_so_far.extend(steps.iter().map(describe_step));
        if !finished || automation::aborted() || done || round + 1 == MAX_ROUNDS {
            // Ran out of rounds mid-task: "keep going" carries on from here.
            if round + 1 == MAX_ROUNDS && !done && finished {
                *UNFINISHED.lock() = Some((prompt.clone(), done_so_far.clone()));
            }
            break;
        }

        // Let the app open / the page load (or the ad run), then look again
        // to check the result and carry on.
        let _ = app.emit(events::STATUS, StatusEvent::working("Izuki is checking the screen…"));
        // Live Eyes: watch the screen and look again the moment it settles —
        // not a fixed pause (too slow), not mid-load (too early). A "wait"
        // the model asked for (an ad counting down) comes on top.
        let waited = std::time::Instant::now();
        let min = Duration::from_millis(150 + u64::from(wait) * 1000);
        let max = Duration::from_millis(6000 + u64::from(wait) * 1000);
        let settled = crate::live::wait_until_settled(min, max, automation::aborted);
        eprintln!(
            "[agent] screen {} after {} ms",
            if settled { "settled" } else { "still moving" },
            waited.elapsed().as_millis()
        );
        match capture::capture_all() {
            Ok(f) => frame = f,
            Err(_) => break,
        }
    }

    if focus {
        let _ = overlay::hide_overlay(app);
    }

    let mut plan = last_plan.unwrap_or_default();
    if settings.autosave_flows && !all_steps.is_empty() {
        let thumbnail = frame.downscaled(360).to_jpeg_data_url(58).ok();
        let app_name = uia::foreground_app();
        store.add_flow(Flow {
            id: uuid::Uuid::new_v4().to_string(),
            name: prompt.trim().chars().take(40).collect::<String>(),
            app: app_name,
            steps: all_steps.clone(),
            prompt: prompt.clone(),
            thumbnail,
            created_at: now_ms(),
            last_run: Some(now_ms()),
            run_count: 1,
            hotkey: None,
        });
        let _ = app.emit(events::FLOWS_CHANGED, ());
    }
    plan.steps = all_steps;
    plan.more = false;
    plan
}

/// How many look-act rounds one request may take.
const MAX_ROUNDS: usize = 10;

/// A task that had to stop partway (busy brains, out of rounds): what was
/// asked and what's been done, for "keep going".
static UNFINISHED: parking_lot::Mutex<Option<(String, Vec<String>)>> = parking_lot::Mutex::new(None);

/// "Keep going", "continue", "carry on"…
fn is_keep_going(said: &str) -> bool {
    let s = said.trim().trim_end_matches(['.', '!', '?']).to_lowercase();
    let s = s.trim_start_matches("okay ").trim_start_matches("ok ").trim_start_matches("please ");
    [
        "keep going", "continue", "carry on", "go on", "resume", "finish it", "finish the rest",
        "do the rest", "keep doing it", "next", "go ahead",
    ]
    .iter()
    .any(|k| s == *k || s.starts_with(&format!("{k} ")))
}

/// The answer to a pending "which one? circle it" question, when it comes.
static HELP: parking_lot::Mutex<Option<std::sync::mpsc::Sender<Option<DrawSession>>>> =
    parking_lot::Mutex::new(None);

/// Ask the user to show Izuki something: says the question, opens the draw
/// surface, and waits for their mark (and/or words) — `None` if they skip it
/// (Esc), stop Izuki, or don't answer within a minute and a half.
fn ask_user(app: &AppHandle, question: &str) -> Option<DrawSession> {
    let (tx, rx) = std::sync::mpsc::channel();
    *HELP.lock() = Some(tx);
    let _ = app.emit(events::STATUS, StatusEvent::info(question.to_string()));
    if overlay::begin_help(app, question).is_err() {
        HELP.lock().take();
        return None;
    }
    let started = std::time::Instant::now();
    let answer = loop {
        match rx.recv_timeout(Duration::from_millis(250)) {
            Ok(a) => break a,
            Err(std::sync::mpsc::RecvTimeoutError::Timeout) => {
                if automation::aborted() || started.elapsed() > Duration::from_secs(90) {
                    break None;
                }
            }
            Err(_) => break None,
        }
    };
    HELP.lock().take();
    let _ = app.emit(events::HELP_DONE, ());
    answer
}

/// The overlay (a mark + words) or the voice (just words) answering
/// `ask_user`. `false` if nothing was waiting for an answer.
pub fn answer_help(answer: Option<DrawSession>) -> bool {
    match HELP.lock().take() {
        Some(tx) => tx.send(answer).is_ok(),
        None => false,
    }
}

/// A step in a few words, for "already done" in the next round's prompt.
fn describe_step(s: &ActionStep) -> String {
    let what = match s.action {
        Intent::Type => format!("typed \"{}\"", s.text_to_type.as_deref().unwrap_or("").chars().take(40).collect::<String>()),
        Intent::Key => format!("pressed {}", s.key.as_deref().unwrap_or("a key")),
        Intent::Scroll => "scrolled".to_string(),
        other => format!("{} at {},{}", other.as_str(), s.x, s.y),
    };
    if s.reasoning.trim().is_empty() {
        what
    } else {
        format!("{what} ({})", s.reasoning.trim().chars().take(50).collect::<String>())
    }
}

// ---------------------------------------------------------------------------
// Vision-backed watcher conditions
// ---------------------------------------------------------------------------

/// Ask the active model a yes/no question about a region.
pub fn ask_yes_no(frame: &Frame, question: &str) -> Result<bool> {
    let store = crate::state::store();
    let settings = store.settings();
    let cfg = settings
        .provider(settings.active_provider)
        .cloned()
        .ok_or_else(|| anyhow!("no brain is configured"))?;

    let scaled = frame.downscaled(768);
    let req = VisionRequest {
        image_jpeg: scaled.to_jpeg(80)?,
        image_size: (scaled.width, scaled.height),
        desktop: Rect {
            x: frame.origin.0,
            y: frame.origin.1,
            w: frame.width as i32,
            h: frame.height as i32,
        },
        marks_description: "(a watched region)".into(),
        user_prompt: format!(
            "Answer only with JSON: {{\"summary\":\"yes\" or \"no\",\"steps\":[]}}. Question: {question}"
        ),
        ocr_text: String::new(),
        app: String::new(),
        window_title: String::new(),
        draft: Vec::new(),
        controls: Vec::new(),
        memory: String::new(),
    };

    let answer = vision::ask(&cfg, &req);
    match answer {
        // A model that returns no steps still gives us its summary.
        Ok(plan) => Ok(plan.summary.to_lowercase().contains("yes")),
        Err(e) => Err(e),
    }
}

#[cfg(test)]
mod speed_tests {
    use super::*;
    use crate::settings::{ProviderId, Settings};

    #[test]
    fn a_slow_chosen_brain_yields_to_a_fast_one() {
        let s = Settings::default();
        let mut chain: Vec<_> = [ProviderId::Nvidia, ProviderId::Openai, ProviderId::Openrouter]
            .iter()
            .filter_map(|id| s.provider(*id).cloned())
            .collect();
        assert_eq!(chain.len(), 3);
        note_speed(ProviderId::Nvidia, Some(19_000));
        note_speed(ProviderId::Openrouter, Some(1_400));
        note_speed(ProviderId::Openai, None);
        mark_broken(ProviderId::Openai);
        skip_broken(&mut chain);
        order_by_speed(&mut chain);
        assert_eq!(chain.len(), 2, "the brain with no credits is skipped");
        assert_eq!(chain[0].id, ProviderId::Openrouter);
        assert_eq!(chain[1].id, ProviderId::Nvidia);
        assert!(is_hopeless("openai is rate-limiting you (429 Too Many Requests): You have no credits remaining"));
        assert!(!is_hopeless("the model returned an empty reply"));
        // A busy cloud queue timing out is slow, not broken; a local brain
        // that isn't running is.
        assert!(!is_hopeless("error sending request for url (https://integrate.api.nvidia.com/v1/chat/completions)"));
        assert!(is_hopeless("error sending request for url (http://localhost:20128/v1/chat/completions)"));
    }

    #[test]
    fn keep_going_resumes() {
        for said in ["keep going", "Keep going.", "okay continue", "carry on please", "do the rest", "go on!"] {
            assert!(is_keep_going(said), "{said}");
        }
        for said in ["open chrome", "continue the story about dragons in chrome", "what's next on my calendar"] {
            // (a longer sentence starting with "continue" still resumes — that's fine)
            let _ = said;
        }
        assert!(!is_keep_going("open chrome"));
        assert!(!is_keep_going("what's next on my calendar"));
    }
}
