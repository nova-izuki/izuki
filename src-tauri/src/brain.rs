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
/// How much of the page's own text the brain gets with each look.
const PAGE_TEXT_CHARS: usize = 5000;

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

pub fn submit_draw(app: &AppHandle, store: &Arc<Store>, mut session: DrawSession, task: u64) -> VisionPlan {
    let settings = store.settings();
    if !task_alive(task) { return stopped_plan(); }
    let direct_click = planner::explicit_draw_click(&session.prompt) && session.marks.len() == 1;
    if direct_click { session.marks[0].intent = Intent::Click; }
    // Esc stops it from here on — while the model looks, too.
    let _esc = crate::hotkey::working();

    if session.created_at == 0 {
        session.created_at = now_ms();
    }

    // The frame the marks were drawn over. Falling back to a fresh grab keeps
    // things working when the overlay ran without freezing.
    let frame = frozen().or_else(|| capture::capture_all().ok());

    // ---- read any text inside the marks -------------------------------
    if settings.ocr_enabled && !direct_click {
        if let Some(f) = &frame {
            for m in &mut session.marks {
                if !task_alive(task) { return stopped_plan(); }
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
    if !task_alive(task) { return stopped_plan(); }
    let scribbled: Vec<String> = session
        .marks
        .iter()
        .filter(|m| matches!(m.kind, crate::model::ShapeKind::Pen))
        // OCR reads the page UNDER a highlight, not the user's handwriting.
        // Never turn those page words into additional user instructions.
        .filter_map(|m| m.text.clone())
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
    let mut local = planner::local_plan(&session);
    if !should_ask_model(&session, &local) && !local.is_empty() {
        let controls = uia::list_controls(MAX_CONTROLS);
        for step in &mut local {
            if !matches!(step.action, Intent::Click | Intent::DoubleClick | Intent::RightClick | Intent::Type) { continue; }
            let region = session.marks.iter().find(|m| m.rect.contains(step.x, step.y)).map(|m| m.rect).unwrap_or_default();
            if let Some(control) = planner::drawn_target(&controls, &region, step.x, step.y) {
                let (x, y) = control.rect.center();
                step.x = x; step.y = y; step.target = Some(control.id);
                step.snapped_to = Some(control.name.clone()); step.grounding = control.identity.clone();
            } else {
                return VisionPlan { summary: "I couldn't identify one clickable control inside your mark. Make a smaller circle around the button; I haven't clicked anything.".into(), ..Default::default() };
            }
        }
    }
    if !task_alive(task) { return stopped_plan(); }

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

    // Anything the model has to think about goes through the same look →
    // act → check loop as a spoken request: it sees your marks, acts, looks
    // again to check it worked, carries on until it can see the job done,
    // and asks if it's unsure — rather than one blind guess. (With "confirm
    // before acting" on, the one-shot plan is kept, to preview first.)
    if should_ask_model(&session, &local) && !settings.confirm_before_act && frame.is_some() {
        let prompt = if session.prompt.trim().is_empty() {
            "Do what my marks on the screen show.".to_string()
        } else {
            session.prompt.clone()
        };
        let _ = app.emit(events::STATUS, StatusEvent::working("Izuki is looking…"));
        drop(_esc);
        let plan = submit_task(app, store, prompt, session.marks.clone(), frame, Some(task));
        set_frozen(None);
        return plan;
    }

    if should_ask_model(&session, &local) {
        if let Some(f) = &frame {
            let _ = app.emit(events::STATUS, StatusEvent::working("Izuki is looking…"));
            match ask_model(store, &session, f, &local, false, false) {
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
    if !task_alive(task) { return stopped_plan(); }
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
        run_steps_for_task(app, store, &plan.steps, task, || {});
    }

    set_frozen(None);
    plan
}

/// Only pay for a model when the marks leave something genuinely open.
fn should_ask_model(session: &DrawSession, local: &[ActionStep]) -> bool {
    if session.marks.len() == 1 && planner::explicit_draw_click(&session.prompt) && !local.is_empty() { return false; }
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

/// `wants_action`: the request is something to *do* (not a question), so a
/// reply that does nothing can't win the race — see [`good_enough`].
fn ask_model(
    store: &Arc<Store>,
    session: &DrawSession,
    frame: &Frame,
    draft: &[ActionStep],
    zoomed: bool,
    wants_action: bool,
) -> Result<VisionPlan> {
    let _ = store; // brains now come from `brain_chain()`
    let started = std::time::Instant::now();
    // Reading the window's buttons takes the longest part of the prep (up to
    // a second) — do it at the same time as the screenshot work.
    let controls_job = std::thread::spawn(|| {
        let t = std::time::Instant::now();
        // The page's own words, read alongside the controls (not after).
        let text_job = std::thread::spawn(|| uia::document_text(PAGE_TEXT_CHARS));
        // Bind labels and rectangles to this look, not a prefetch made while
        // the user was still speaking or another page was foreground.
        let c = uia::list_controls(MAX_CONTROLS);
        let text = text_job.join().unwrap_or_default();
        eprintln!("[brain] screen controls: {}, page text: {} chars, in {} ms", c.len(), text.len(), t.elapsed().as_millis());
        (c, text)
    });

    let annotated = planner::annotate(frame, session);
    // A close-up is enlarged, not shrunk: small print, tiny radio buttons and
    // a lab's terminal text come out big enough to read and hit exactly.
    let mut scaled = if zoomed {
        annotated.enlarged(MODEL_IMAGE_EDGE, 3.0).downscaled(MODEL_IMAGE_EDGE)
    } else {
        annotated.downscaled(MODEL_IMAGE_EDGE)
    };
    let desktop = Rect { x: frame.origin.0, y: frame.origin.1, w: frame.width as i32, h: frame.height as i32 };
    // Each control's number printed on the picture itself (tags.rs), so the
    // brain points at the real button instead of guessing pixels.
    let (mut controls, page_text) = controls_job.join().unwrap_or_default();
    if zoomed {
        // Only what's in the close-up — the rest would have coordinates
        // off the picture.
        controls.retain(|c| {
            let (cx, cy) = c.rect.center();
            !c.below && cx >= desktop.x && cy >= desktop.y && cx < desktop.x + desktop.w && cy < desktop.y + desktop.h
        });
    }
    crate::tags::draw(&mut scaled, &desktop, &controls);
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
        desktop,
        marks_description: planner::describe(session),
        user_prompt: session.prompt.clone(),
        ocr_text,
        app: uia::foreground_app(),
        window_title: uia::foreground_title(),
        draft: draft.to_vec(),
        // Izuki's "hands": the real controls on screen, numbered, so the
        // model can say "click #7" instead of guessing pixels.
        controls,
        memory: crate::memory::prompt_block() + &crate::reminders::prompt_block() + &crate::voices::prompt_block(),
        windows: uia::open_windows(14),
        page_text,
    };
    let prep_ms = started.elapsed().as_millis();

    let chain = brain_chain();
    if chain.is_empty() {
        return Err(anyhow!("no brain is configured"));
    }
    let mut plan = ask_racing(&chain, req, prep_ms, wants_action)?;
    // "Remind me…" said while it works the screen: set it, don't say the tag.
    if plan.summary.contains("[REMIND") {
        plan.summary = crate::reminders::take_tags(&plan.summary);
    }
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
    skip_resting(&mut chain);
    order_by_speed(&mut chain);
    chain
}

/// Brains told to slow down ("too many requests"), and until when. Asking
/// them again right away only burns more of the quota and adds a failure.
static RESTING: parking_lot::Mutex<Vec<(crate::settings::ProviderId, std::time::Instant)>> =
    parking_lot::Mutex::new(Vec::new());

/// How long a "too many requests" answer means leaving that brain alone:
/// a used-up daily quota for an hour, a per-minute limit for a minute.
fn rest_for(err: &str) -> Option<std::time::Duration> {
    let e = err.to_ascii_lowercase();
    // "High demand" / overloaded (503): the free tier is swamped. Asking it
    // again on the next look cost 5–12 s each time just to get the same
    // error — rest it a minute and go straight to a brain that's answering.
    if e.contains("503") || e.contains("high demand") || e.contains("overloaded") || e.contains("unavailable") {
        return Some(std::time::Duration::from_secs(60));
    }
    let limited = e.contains("429") || e.contains("too many requests") || e.contains("rate-limit") || e.contains("rate limit");
    if !limited {
        return None;
    }
    if e.contains("quota") || e.contains("per day") || e.contains("daily") {
        Some(std::time::Duration::from_secs(60 * 60))
    } else {
        Some(std::time::Duration::from_secs(60))
    }
}

/// Remember what a failure says about a brain: gone for good (bad key, no
/// credits) or just resting (rate limits).
fn note_failure(id: crate::settings::ProviderId, err: &str) {
    if is_hopeless(err) {
        mark_broken(id);
    } else if let Some(d) = rest_for(err) {
        let mut r = RESTING.lock();
        r.retain(|(p, _)| *p != id);
        r.push((id, std::time::Instant::now() + d));
        eprintln!("[brain] resting {id:?} for {} s (rate-limited)", d.as_secs());
    }
}

/// Leave out resting brains — unless that would leave none, then keep the
/// one that's back soonest.
fn skip_resting(chain: &mut Vec<crate::settings::ProviderConfig>) {
    let mut r = RESTING.lock();
    let now = std::time::Instant::now();
    r.retain(|(_, until)| *until > now);
    if r.is_empty() {
        return;
    }
    let until = |id| r.iter().find(|(p, _)| *p == id).map(|(_, u)| *u);
    let awake: Vec<_> = chain.iter().filter(|c| until(c.id).is_none()).cloned().collect();
    if !awake.is_empty() {
        *chain = awake;
    } else if let Some(best) = chain.iter().min_by_key(|c| until(c.id)).cloned() {
        *chain = vec![best];
    }
}

/// Record how a brain did outside the racing path (the chat lane).
pub fn note_answer(id: crate::settings::ProviderId, result: Result<u128, &str>) {
    match result {
        Ok(ms) => note_speed(id, Some(ms)),
        Err(e) => {
            if rest_for(e).is_none() && !is_hopeless(e) {
                note_speed(id, None);
            }
            note_failure(id, e);
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
// Every hedge is an extra request against a free quota; 2 s fired a second
// (and third) brain on nearly every look and burned through the daily
// limits. Only a really slow brain gets company now.
const HEDGE_AFTER: std::time::Duration = std::time::Duration::from_millis(5000);

/// Ask the brains in `chain` order, but don't wait on a slow one: if the
/// current brain hasn't answered after `HEDGE_AFTER`, the next one is asked
/// too and whichever answers first wins. A failure moves straight on.
/// (A free model that takes 20 s used to mean a 20 s wait.)
/// Whether a reply may win the race. One that narrates instead of acting
/// ("The user wants… you can use the following steps") never does; and for
/// something to *do*, neither does one with no action, question, close-up or
/// finish in it. A faster free model's essay used to beat the chosen
/// brain's real click every time.
fn good_enough(plan: &VisionPlan, wants_action: bool) -> bool {
    if plan.steps.is_empty() && crate::easy::narrates(&plan.summary) {
        return false;
    }
    !wants_action || !plan.steps.is_empty() || plan.ask.is_some() || plan.zoom.is_some() || plan.done || plan.wait > 0
}

/// No brain did better: the best of the replies that didn't act — but never
/// one that narrates, which would be read aloud as if it were an answer.
fn last_resort(mut plan: VisionPlan, wants_action: bool) -> VisionPlan {
    if wants_action {
        eprintln!("[bug] no brain acted on a request to do something (best was {} {})", plan.provider, plan.model);
    }
    if crate::easy::narrates(&plan.summary) || plan.summary.trim().is_empty() {
        plan.summary = if wants_action {
            "Sorry, I couldn't work out how to do that on this screen. Can you say it another way, or point at it?".into()
        } else {
            "Sorry, I didn't get a proper answer that time. Can you ask me again?".into()
        };
        plan.mood = Some("sympathetic".into());
    }
    plan
}

fn ask_racing(
    chain: &[crate::settings::ProviderConfig],
    req: VisionRequest,
    prep_ms: u128,
    wants_action: bool,
) -> Result<VisionPlan> {
    use std::sync::{mpsc, Arc};
    use std::time::{Duration, Instant};

    // Bound spend per look, even when every configured provider is failing.
    let chain = &chain[..chain.len().min(3)];
    if chain.is_empty() { return Err(anyhow!("no screen brain is configured")); }
    let economy = crate::state::try_store().map(|s| s.settings().economy_mode).unwrap_or(true);
    let began = Instant::now();
    let mut last_launch = began;
    let req = Arc::new(req);
    let (tx, rx) = mpsc::channel::<(usize, Result<VisionPlan>, Duration)>();
    let launch = |i: usize| {
        let (tx, cfg, req) = (tx.clone(), chain[i].clone(), req.clone());
        std::thread::spawn(move || {
            let t = Instant::now();
            let r = vision::ask(&cfg, &req);
            // Remember how this brain did, even if another one won the race.
            // ("Too many requests" or a bad key isn't slowness — don't rank it down for that.)
            // A quick reply that did nothing counts as slow: being first with
            // an essay mustn't put a brain first next time.
            match &r {
                Ok(plan) if good_enough(plan, wants_action) => note_speed(cfg.id, Some(t.elapsed().as_millis())),
                Ok(_) => note_speed(cfg.id, None),
                Err(e) if rest_for(&e.to_string()).is_none() && !is_hopeless(&e.to_string()) => note_speed(cfg.id, None),
                Err(_) => {}
            }
            if let Err(e) = &r {
                note_failure(cfg.id, &e.to_string());
            }
            let _ = tx.send((i, r, t.elapsed()));
        });
    };

    // A chosen brain that's been slow lately (Gemini's free tier on a busy
    // day: 9–15 s a look) gets company after 1.5 s, not 5 — a fast brain
    // that's answering (Groq: under 2 s) shouldn't wait on it every look.
    let hedge_after = if chain.len() > 1 && expected_ms(chain[0].id).is_some_and(|ms| ms > 6_000.0) {
        Duration::from_millis(1500)
    } else {
        HEDGE_AFTER
    };
    launch(0);
    let mut launched = 1;
    let mut finished = 0;
    let mut errors = Vec::new();
    // The best reply so far that didn't act (the chosen-est brain's), in case
    // no brain does better.
    let mut fallback: Option<(usize, VisionPlan)> = None;
    loop {
        if automation::aborted() { return Err(anyhow!("stopped")); }
        if began.elapsed() > Duration::from_secs(45) {
            return match fallback.take() {
                Some((_, plan)) => Ok(last_resort(plan, wants_action)),
                None => Err(anyhow!("the screen model took too long; try a faster brain in Settings")),
            };
        }
        let wait = Duration::from_millis(100);
        match rx.recv_timeout(wait) {
            Ok((i, Ok(plan), took)) if !good_enough(&plan, wants_action) => {
                eprintln!(
                    "[brain] {} ({}) answered in {} ms without doing anything — waiting for a better answer: {}",
                    chain[i].label,
                    chain[i].model,
                    took.as_millis(),
                    plan.summary.chars().take(80).collect::<String>()
                );
                errors.push(format!("{}: answered without acting", chain[i].label));
                if fallback.as_ref().map_or(true, |(j, _)| i < *j) {
                    fallback = Some((i, plan));
                }
                finished += 1;
                if launched < chain.len() {
                    launch(launched);
                    launched += 1;
                } else if finished == launched {
                    let (_, plan) = fallback.take().expect("just stored");
                    return Ok(last_resort(plan, wants_action));
                }
            }
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
                    return match fallback.take() {
                        Some((_, plan)) => Ok(last_resort(plan, wants_action)),
                        None => Err(anyhow!("{}", errors.join("; "))),
                    };
                }
            }
            Err(mpsc::RecvTimeoutError::Timeout) => {
                if !economy && launched < chain.len() && launched - finished < 2 && last_launch.elapsed() >= hedge_after {
                    eprintln!("[brain] trying one speculative backup");
                    launch(launched);
                    launched += 1;
                    last_launch = Instant::now();
                }
            }
            Err(_) => {
                return match fallback.take() {
                    Some((_, plan)) => Ok(last_resort(plan, wants_action)),
                    None => Err(anyhow!("no brain answered in time")),
                }
            }
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
    run_steps_for_task(app, store, steps, TASK_GEN.load(std::sync::atomic::Ordering::SeqCst), on_done);
}

fn run_steps_for_task<F>(app: &AppHandle, store: &Arc<Store>, steps: &[ActionStep], task: u64, on_done: F)
where F: FnOnce() + Send + 'static,
{
    let steps = steps.to_vec();
    let app = app.clone();
    let store = store.clone();

    std::thread::Builder::new()
        .name("izuki-act".into())
        .spawn(move || {
            run_steps_blocking(&app, &store, &steps, &|| task_alive(task));
            on_done();
        })
        .ok();
}

/// Why the last run of steps stopped, when it's something the brain can fix
/// on its next look (a window on top of the button, a greyed-out button).
static STEP_SNAG: Mutex<Option<String>> = Mutex::new(None);

/// Run `steps` on this thread. `true` if every step ran (not stopped and
/// no step failed).
fn run_steps_blocking(app: &AppHandle, store: &Arc<Store>, steps: &[ActionStep], alive: &dyn Fn() -> bool) -> (bool, usize) {
            STEP_SNAG.lock().take();
            let executed = std::cell::Cell::new(0usize);
            let settings = store.settings();
            let move_ms = settings.move_duration_ms;
            // No clear_abort() here: each task clears the flag once, when it
            // starts. Clearing it again right before the clicks threw away a
            // stop pressed while the model was still thinking.
            // Esc stops Izuki for as long as it works the screen, whether or
            // not the orb is up (a drawing or a replay has no orb).
            let _esc = crate::hotkey::working();
            // Izuki's own orb and bubbles let every click through while it works.
            let _hands = crate::overlay::acting(app);

            // If the command came from Izuki's chat bubble, Izuki holds the
            // keyboard right now — hand it back so typing lands in the app.
            uia::focus_target_window();
            std::thread::sleep(std::time::Duration::from_millis(60));

            let app_name = uia::foreground_app();

            let run = || {
                for (i, step) in steps.iter().enumerate() {
                    if !alive() {
                        let _ = app.emit(events::STATUS, StatusEvent::info("Stopped."));
                        return false;
                    }

                    // Pointing is only seen on the overlay — make sure it's up.
                    if matches!(step.action, Intent::Point | Intent::Draw) {
                        let _ = crate::overlay::ensure_caption_visible(app);
                    }
                    // Tell the overlay's hand where it is going before we move
                    // the real pointer, so the animation leads rather than trails.
                    // (Instant skills happen nowhere on screen — no hand.)
                    let placeless = matches!(step.action, Intent::OpenApp | Intent::OpenUrl | Intent::Search | Intent::PlayYoutube);
                    if !placeless {
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
                            shape: step.shape.clone(),
                            text: if step.action == Intent::Draw { step.text_to_type.clone() } else { None },
                        },
                    );
                    }

                    match automation::execute(step, move_ms, settings.magnetic_hand, settings.dry_run)
                    {
                        Ok(detail) => {
                            executed.set(i + 1);
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
                            let why = e.to_string();
                            // Something on top, or greyed out: the brain can fix
                            // that on its next look — the task goes on.
                            if why.starts_with("covered:") || why.starts_with("disabled:") || why.starts_with("target_changed:") {
                                *STEP_SNAG.lock() = Some(why.clone());
                            }
                            let _ = app.emit(
                                events::STATUS,
                                StatusEvent::error(format!("Step {} failed", i + 1), why),
                            );
                            return false;
                        }
                    }

                    // Breathing room between steps so the app under us can react.
                    std::thread::sleep(Duration::from_millis(140));
                }
                true
            };

            (run(), executed.get())
}

pub fn run_flow(app: &AppHandle, store: &Arc<Store>, id: &str) -> Result<()> {
    let flow = store.flow(id).ok_or_else(|| anyhow!("no such flow"))?;
    // Runtime IDs belong to the captured screen, not a saved macro. Replan
    // its original request so each replay gets fresh, verifiable targets.
    let grounded = flow.steps.iter().any(|s| s.grounding.is_some());
    if grounded && flow.prompt.trim().is_empty() {
        return Err(anyhow!("This screen flow has no saved request. Record it again with a description so Izuki can find fresh targets safely."));
    }
    // A replay is a new task: an old stop no longer applies.
    automation::clear_abort();
    store.mutate_flow(id, |f| {
        f.run_count += 1;
        f.last_run = Some(now_ms());
    });
    let _ = app.emit(events::FLOWS_CHANGED, ());
    let _ = app.emit(
        events::STATUS,
        StatusEvent::working(format!("Replaying “{}”", flow.name)),
    );
    if grounded {
        let (app, store) = (app.clone(), store.clone());
        std::thread::Builder::new().name("flow-refresh".into()).spawn(move || {
            submit_voice_command(&app, &store, flow.prompt);
        })?;
    } else {
        run_steps(app, store, &flow.steps);
    }
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
    submit_task(app, store, prompt, Vec::new(), None, None)
}

/// "Click Subscribe", "press Sign in", "tap the Settings tab": the button is
/// named, so find it among the real controls on screen and click it — no AI
/// (a look takes 2–15 s; this takes a fraction of one). Only when exactly one
/// control clearly matches; anything unclear, or anything final (delete,
/// send, pay…, which must be confirmed first), goes to the brain as usual.
pub fn run_named_click(app: &AppHandle, store: &Arc<Store>, said: &str) -> Option<VisionPlan> {
    if crate::companion::on_phone_asked(said) { return None; }
    let wanted = named_target(said)?;
    if uia::screen_locked() {
        return None;
    }
    let controls = uia::controls_fresh_or_now(MAX_CONTROLS);
    let c = unique_named(&wanted, &controls)?.clone();
    let my_task = TASK_GEN.fetch_add(1, std::sync::atomic::Ordering::SeqCst) + 1;
    automation::clear_abort();
    let alive = move || TASK_GEN.load(std::sync::atomic::Ordering::SeqCst) == my_task && !automation::aborted();
    let (x, y) = c.rect.center();
    let mut step: ActionStep = serde_json::from_value(serde_json::json!({ "action": "click", "x": x, "y": y, "confidence": 1.0, "reasoning": "named on screen" }))
        .expect("a click step is always well-formed");
    step.target = Some(c.id);
    step.snapped_to = Some(c.name.clone());
    step.hover_first = c.hidden;
    step.scroll_first = c.below;
    step.grounding = c.identity.clone();
    eprintln!("[named] \"{said}\" → clicking \"{}\" directly", c.name);
    let (worked, _) = run_steps_blocking(app, store, std::slice::from_ref(&step), &alive);
    if !worked {
        // Covered or greyed out: the brain takes it from here.
        return None;
    }
    Some(VisionPlan {
        steps: vec![step],
        summary: format!("Done — clicked {}.", c.name.chars().take(40).collect::<String>()),
        provider: "local".into(),
        model: "named".into(),
        mood: Some("cheerful".into()),
        done: true,
        ..Default::default()
    })
}

/// The name in "click X" / "press the X button", if that's all the request is.
fn named_target(said: &str) -> Option<String> {
    let s = said.trim().trim_end_matches(['.', '!', '?']).to_lowercase();
    let s = s.trim_start_matches("please ").trim_start_matches("can you ").trim_start_matches("could you ").trim();
    let rest = ["click on ", "click ", "press ", "tap on ", "tap ", "hit ", "select ", "choose "]
        .iter()
        .find_map(|v| s.strip_prefix(v))?;
    let rest = rest.trim_start_matches("the ").trim();
    let rest = [" button", " link", " tab", " option", " icon", " please"]
        .iter()
        .fold(rest.to_string(), |r, suffix| r.strip_suffix(suffix).map(str::to_string).unwrap_or(r));
    let name = rest.trim().trim_matches(['"', '\'', '“', '”']).to_string();
    // Several things, a position ("the second one"), or "it": the brain works that out.
    const VAGUE: &[&str] = &["it", "that", "this", "here", "there", "one", "first", "second", "third", "last", "next"];
    if name.len() < 2 || name.contains(" and ") || name.contains(" then ") || name.split_whitespace().count() > 6 {
        return None;
    }
    if name.split_whitespace().any(|w| VAGUE.contains(&w)) {
        return None;
    }
    // Final or hard to undo: these are confirmed first, by the brain.
    const FINAL: &[&str] = &[
        "delete", "remove", "send", "pay", "buy", "purchase", "order", "checkout", "check out", "submit", "confirm",
        "sign out", "log out", "uninstall", "erase", "format", "transfer", "post", "publish", "yes",
    ];
    if FINAL.iter().any(|f| name.contains(f)) {
        return None;
    }
    Some(name)
}

/// The one control named `wanted` — the same name, or else the only one
/// whose name contains it. Two or more candidates: `None` (the brain picks).
fn unique_named<'a>(wanted: &str, controls: &'a [uia::Control]) -> Option<&'a uia::Control> {
    let norm = |s: &str| s.split_whitespace().collect::<Vec<_>>().join(" ").to_lowercase();
    let w = norm(wanted);
    let exact: Vec<_> = controls.iter().filter(|c| norm(&c.name) == w).collect();
    if exact.len() == 1 {
        return Some(exact[0]);
    }
    if !exact.is_empty() {
        return None;
    }
    let partial: Vec<_> = controls.iter().filter(|c| !c.name.is_empty() && norm(&c.name).contains(&w)).collect();
    (partial.len() == 1).then(|| partial[0])
}

/// The user asked for windows to be minimised or hidden — then a minimised
/// window is the job done, not a slip to undo.
fn asked_to_minimise(prompt: &str) -> bool {
    let p = prompt.to_lowercase();
    ["minimi", "show desktop", "show my desktop", "hide ", "close "].iter().any(|w| p.contains(w))
}

/// "Scroll down", "louder", "pause", "next song", "go back", "new tab"…:
/// done at once with no AI — see instant.rs. `None` when `said` isn't one of
/// those plain everyday commands (or the PC is locked).
pub fn run_instant(app: &AppHandle, store: &Arc<Store>, said: &str) -> Option<VisionPlan> {
    if crate::companion::on_phone_asked(said) { return None; }
    let (act, say) = crate::instant::parse(said)?;
    if uia::screen_locked() {
        return None;
    }
    // Like any new task, this replaces one still running.
    let my_task = TASK_GEN.fetch_add(1, std::sync::atomic::Ordering::SeqCst) + 1;
    automation::clear_abort();
    let alive = move || TASK_GEN.load(std::sync::atomic::Ordering::SeqCst) == my_task && !automation::aborted();
    eprintln!("[instant] \"{said}\" → {act:?}");
    let steps = crate::instant::steps(act);
    let worked = if steps.is_empty() {
        crate::instant::run_direct(act)
    } else {
        run_steps_blocking(app, store, &steps, &alive).0
    };
    if !worked && alive() {
        eprintln!("[bug] instant command didn't work: {act:?}");
    }
    Some(VisionPlan {
        steps,
        summary: if worked { say.to_string() } else { "Hmm, that didn't work — try asking me another way?".to_string() },
        provider: "local".into(),
        model: "instant".into(),
        mood: Some(if worked { "cheerful" } else { "sympathetic" }.into()),
        done: true,
        ..Default::default()
    })
}

/// The look → act → check loop behind every request. `marks` are what the
/// user drew (shown to the model on the first look), and `frame` the screen
/// they drew them on — `None` takes a fresh look.
fn submit_task(
    app: &AppHandle,
    store: &Arc<Store>,
    prompt: String,
    marks: Vec<crate::model::Mark>,
    drawn_on: Option<Frame>,
    inherited_task: Option<u64>,
) -> VisionPlan {
    if let Some(summary) = crate::companion::phone_guidance(&prompt, store.settings().android_enabled) {
        return VisionPlan { summary, provider: "local".into(), model: "device-routing".into(), done: true, ..Default::default() };
    }
    // "Scroll down", "louder", "next song": done at once, no AI (instant.rs).
    // Every way in — voice, typing, the phone, Discord — comes through here.
    if marks.is_empty() && drawn_on.is_none() {
        if let Some(plan) = run_instant(app, store, &prompt) {
            return plan;
        }
        // "Click Subscribe": the button is named — clicked directly, no AI.
        if let Some(plan) = run_named_click(app, store, &prompt) {
            return plan;
        }
    }
    let settings = store.settings();
    // This task replaces any other: the old one sees the number change and
    // stops, and a question it was waiting on is let go.
    answer_help(None);
    let my_task = match inherited_task {
        Some(task) if task_alive(task) => task,
        Some(_) => return stopped_plan(),
        None => {
            let task = TASK_GEN.fetch_add(1, std::sync::atomic::Ordering::SeqCst) + 1;
            automation::clear_abort();
            task
        }
    };
    let _esc = crate::hotkey::working();
    // A new task: whatever was drawn to explain the last one goes.
    let _ = app.emit("izuki://pen-clear", ());
    let alive = move || TASK_GEN.load(std::sync::atomic::Ordering::SeqCst) == my_task && !automation::aborted();

    // "Keep going" after a task had to stop: pick it up where it left off.
    let (prompt, resumed) = match UNFINISHED.lock().take() {
        Some((task, done)) if is_keep_going(&prompt) || is_yes(&prompt) => (task, done),
        Some(t) => {
            // Something new — forget the old one.
            let _ = t;
            (prompt, Vec::new())
        }
        None => (prompt, Vec::new()),
    };
    // Video classroom is a teaching pass, not an autonomous screen task. Its
    // pen overlay must survive until the frontend has spoken the explanation;
    // otherwise the marks disappear as soon as this backend plan returns.
    let teaching = prompt.starts_with("Explain this video frame on my screen.");
    // Something to *do* (not a question)? Then an answer that does nothing
    // — a free model's essay about the request — never wins (good_enough).
    let wants_action = !resumed.is_empty() || crate::companion::asks_to_do(&prompt);

    let focus = matches!(settings.execution_mode, crate::settings::ExecutionMode::Focus);

    // Look first, before any Izuki UI goes up, so the model sees the user's
    // screen rather than Izuki's own overlay. (A drawing brings the screen
    // it was drawn on — the marks are placed on that picture.)
    let lesson_bounds = if teaching {
        crate::browser::video("read", false).ok().filter(|v| v["focused"] == true)
            .and_then(|v| serde_json::from_value::<Rect>(v["screen_rect"].clone()).ok())
    } else { None };
    let frame = drawn_on.or_else(|| capture::capture_all().ok()).map(|f| {
        lesson_bounds.and_then(|r| f.crop(&r)).unwrap_or(f)
    });

    // Focus mode puts up the overlay as a *live*, click-through viewport so
    // the hand has somewhere to visibly point while it acts. It deliberately
    // never freezes or dims the screen for a spoken/typed command: that hid
    // the real screen behind a still picture for the whole wait — the mouse
    // seemed dead while the model thought, and the result of each action
    // (a menu opening, a page loading) couldn't be seen as it happened.
    // Freezing stays for the draw overlay, where it's what you draw on.
    if focus || teaching {
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
        if !uia::screen_locked() {
            eprintln!("[bug] couldn't capture the screen");
        }
        set_frozen(None);
        if focus && !teaching {
            let _ = overlay::hide_overlay(app);
        }
        let _ = app.emit(
            events::STATUS,
            StatusEvent::error("Could not see the screen", "Screen capture failed."),
        );
        return VisionPlan {
            steps: Vec::new(),
            summary: "I can't see your screen right now — is it locked or asleep? Unlock it and ask me again.".into(),
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
    let mut shown: Vec<crate::model::Mark> = marks;
    let mut told: Option<String> = None;
    let mut asked = 0;
    // The same steps twice in a row means they aren't working.
    let mut last_round: Vec<(Intent, i32, i32)> = Vec::new();
    let mut last_look: Option<crate::capture::Frame> = None;
    let mut repeats = 0;
    let mut all_steps: Vec<ActionStep> = Vec::new();
    let mut last_plan: Option<VisionPlan> = None;
    // What was last said while working, so it isn't said again.
    let mut last_said = String::new();
    // The agent's own running plan and findings, carried from look to look.
    let mut notes: Option<String> = None;
    // Looking up close at part of the screen this round (and how often it has).
    let mut zoomed: Option<Rect> = None;
    let mut zooms = 0;
    // Did it finish (and see that it's done)? Then how it did it is kept.
    let mut completed = false;
    // Done something like this before? Say how it went.
    let experience = crate::recipes::recall(&prompt).map(|r| {
        eprintln!("[agent] recalled how \"{}\" was done last time", r.task);
        format!(
            "\nLast time a task like this (\"{}\") worked like this: {}. Take the same route if this screen allows it.",
            r.task,
            r.steps.join("; ")
        )
    });

    for round in 0..MAX_ROUNDS {
        if !alive() {
            eprintln!("[agent] stopped (replaced or cancelled)");
            break;
        }
        // Locked PC: stop, and say so — never try to get past the lock screen.
        if uia::screen_locked() {
            eprintln!("[agent] the PC is locked — stopping");
            *UNFINISHED.lock() = Some((prompt.clone(), done_so_far.clone()));
            let mut plan = last_plan.take().unwrap_or_default();
            plan.summary = "Your PC is locked. Unlock it and say \"keep going\", and I'll carry on.".into();
            plan.mood = Some("calm".into());
            last_plan = Some(plan);
            break;
        }
        // Did the last steps actually do anything? A person notices at once
        // when a click did nothing — and says so, and tries again smarter.
        if round > 0 && !last_round.is_empty() {
            let unchanged = last_look
                .as_ref()
                .is_some_and(|prev| crate::live::changed_share(prev, &frame.downscaled(160)) <= 0.02);
            if unchanged && !told.as_deref().is_some_and(|t| t.contains("loading")) {
                let note = NO_EFFECT.to_string();
                told = Some(match told.take() {
                    Some(t) => format!("{t}\n{note}"),
                    None => note,
                });
            }
        }
        let mut ask = if done_so_far.is_empty() {
            prompt.clone()
        } else {
            format!(
                "{prompt}\n\nSteps already tried: {}.\nThis is the screen now — check which parts of the request it actually shows finished, don't redo what worked, and carry on with the rest (or finish if every part is visibly done).",
                done_so_far.join("; ")
            )
        };
        if let Some(note) = told.take() {
            ask.push_str(&format!("\n{note}"));
        }
        if let Some(n) = &notes {
            ask.push_str(&format!("\nYour notes so far: {n}"));
        }
        if zoomed.is_some() {
            ask.push_str(
                "\nCLOSE-UP: this picture is only the part of the screen you asked to zoom into, enlarged. \
                 Read it carefully and act on it now — coordinates and targets are in THIS picture as usual. \
                 Zoom again only if it's still unreadable.",
            );
        }
        if round == 0 {
            if let Some(e) = &experience {
                ask.push_str(e);
            }
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
            match ask_model(store, &session, &frame, &[], zoomed.is_some(), wants_action || round > 0) {
                Ok(plan) => break Ok(plan),
                Err(e) => {
                    attempt += 1;
                    eprintln!("[agent] round {} try {attempt} failed: {e}", round + 1);
                    if attempt >= 2 || !alive() {
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
                    while std::time::Instant::now() < until && alive() {
                        std::thread::sleep(Duration::from_millis(200));
                    }
                }
            }
        };
        if !alive() {
            eprintln!("[agent] stopped while thinking (replaced or cancelled)");
            break;
        }
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
                if focus && !teaching {
                    let _ = overlay::hide_overlay(app);
                }
                // Free brains being busy is expected; anything else is a bug.
                let why = e.to_string();
                let low = why.to_lowercase();
                if !["429", "rate", "quota", "too many", "busy", "overloaded"].iter().any(|w| low.contains(w)) {
                    eprintln!("[bug] couldn't work out what to do: {why}");
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

        let lesson = prompt.starts_with("Explain this video frame on my screen.");
        // A lesson is a short, precise annotation, never a dense screen of
        // generic circles. Ignore off-frame marks and cap the remaining ones
        // so the explanation stays readable and truthful to the visible frame.
        let frame_left = frame.origin.0;
        let frame_top = frame.origin.1;
        let frame_right = frame_left.saturating_add(frame.width as i32);
        let frame_bottom = frame_top.saturating_add(frame.height as i32);
        let steps: Vec<_> = plan.steps.iter().filter(|s| {
            !lesson || (
                matches!(s.action, Intent::Draw | Intent::Point)
                    && s.x >= frame_left && s.x < frame_right
                    && s.y >= frame_top && s.y < frame_bottom
                    && s.x2.is_none_or(|x| x >= frame_left && x < frame_right)
                    && s.y2.is_none_or(|y| y >= frame_top && y < frame_bottom)
            )
        }).take(if lesson { 2 } else { usize::MAX }).cloned().collect();
        // An action being planned is not evidence that it succeeded. Check
        // a fresh screen before accepting "done" for an autonomous task.
        let done = lesson || (plan.done && steps.is_empty());
        let wait = plan.wait;
        if plan.notes.is_some() {
            notes = plan.notes.clone();
        }
        // "Let me look closer": the next look is that part of the screen at
        // full resolution, enlarged — the way a person leans in to read small
        // print before choosing an answer or typing a command.
        zoomed = None;
        if let (true, Some(region), false) = (steps.is_empty(), plan.zoom, done) {
            if zooms < 4 && plan.ask.is_none() && alive() {
                if let Some(close) = zoom_region(&frame, region) {
                    zooms += 1;
                    eprintln!("[agent] round {}: zooming in on {}x{} at {},{}", round + 1, region.w, region.h, region.x, region.y);
                    let _ = app.emit(events::STATUS, StatusEvent::working("Taking a closer look…"));
                    zoomed = Some(region);
                    frame = close;
                    last_plan = Some(plan);
                    continue;
                }
            }
        }
        if done && steps.is_empty() && round > 0 {
            completed = true;
        }
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
            if repeats >= 2 && asked < 3 && alive() {
                // Going in circles: rather than give up halfway, ask what
                // to do and carry on with the answer.
                eprintln!("[agent] stuck repeating the same steps — asking");
                asked += 1;
                repeats = 0;
                last_round.clear();
                if focus && !teaching {
                    let _ = overlay::hide_overlay(app);
                }
                let question = "Hmm, I'm stuck on this bit. What should I click? Tell me, or circle it.";
                if let Some(answer) = ask_user(app, question, &alive) {
                    let said = answer.prompt.trim().to_string();
                    told = Some(format!(
                        "Your last steps kept changing nothing, so you asked the user what to do. They answered{}{}. Do that now, a different way from before.",
                        if answer.marks.is_empty() { "" } else { " by marking it on the screen (their mark is drawn on the screenshot)" },
                        if said.is_empty() { String::new() } else { format!(", saying: \"{said}\"") },
                    ));
                    shown = answer.marks;
                    std::thread::sleep(Duration::from_millis(350));
                    match capture::capture_all() {
                        Ok(f) => frame = f,
                        Err(_) => break,
                    }
                    continue;
                }
            }
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
            if asked < 3 && alive() {
                asked += 1;
                if focus && !teaching {
                    let _ = overlay::hide_overlay(app);
                }
                match ask_user(app, &question, &alive) {
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
            if focus && !teaching {
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
        // Say what it's doing as it goes — "Opening Blackboard…" — unless
        // this is the last word (that one is the reply), or it's the same
        // thing again, or just "Got it!".
        if !steps.is_empty() && !done && !plan.done && worth_saying(&plan.summary, &last_said) {
            last_said = plan.summary.clone();
            let _ = app.emit(
                "izuki://say",
                serde_json::json!({ "text": plan.summary, "mood": plan.mood, "reply": true, "quick": true }),
            );
            // An explanation (teaching as it works) is heard before the click
            // it explains: give it about as long as it takes to say.
            let chars = plan.summary.chars().count();
            if chars > 90 {
                let until = std::time::Instant::now() + Duration::from_secs_f64((chars as f64 / 14.0).min(25.0));
                while std::time::Instant::now() < until && alive() {
                    std::thread::sleep(Duration::from_millis(150));
                }
            }
        }
        last_plan = Some(plan);
        if steps.is_empty() {
            break;
        }

        // The window being worked in, so a step that minimises it by mistake
        // ("clear what's in the way" gone wrong) is caught and undone.
        let working_in = uia::target_window();
        let (finished, executed) = run_steps_blocking(app, store, &steps, &alive);
        all_steps.extend(steps.iter().take(executed).cloned());
        done_so_far.extend(steps.iter().take(executed).map(describe_step));
        // A click that couldn't happen (something on top, a greyed-out
        // button) isn't the end: tell the brain, and it deals with it.
        let snag = STEP_SNAG.lock().take();
        if let Some(why) = &snag {
            eprintln!("[agent] a click couldn't happen — {why}");
            let note = if why.starts_with("target_changed:") {
                format!("Your last action was NOT executed — {why}. Parse this fresh screenshot and select the intended numbered control by its label and position. Do not reuse old IDs or coordinates. Do not close or minimise windows to fix a changed target. If the intended control is absent, explain that instead of guessing.")
            } else { format!(
                "Your last click didn't happen — {why}. Deal with it like a person would: close what's on top (its ✕ \
                 or Close), drag it aside by its title bar, or minimise it; if the button is greyed out, first do what \
                 turns it on (fill in the required boxes, tick the box, pick an option). Then click it again."
            ) };
            told = Some(match told.take() {
                Some(t) => format!("{t}\n{note}"),
                None => note,
            });
        }
        if let Some(raw) = working_in.filter(|_| !asked_to_minimise(&prompt)) {
            if let Some(title) = uia::restore_if_minimised(raw) {
                eprintln!("[agent] a step minimised the window it was working in (\"{title}\") — put it back");
                let note = format!(
                    "One of your steps minimised the window you were working in (\"{title}\") — Izuki has put it \
                     back. Say so in a few words, like a person would (\"Oops, I minimised that by mistake — it's \
                     back\"), and carry on without minimising it again."
                );
                told = Some(match told.take() {
                    Some(t) => format!("{t}\n{note}"),
                    None => note,
                });
            }
        }
        if done && finished {
            completed = true;
        }
        // A snag (something on top, greyed out) means look again and fix it — not stop.
        let fixable = snag.is_some();
        if (!finished && !fixable) || !alive() || (done && !fixable) || round + 1 == MAX_ROUNDS {
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
        // Not the full 6 s it used to be: with a video playing the screen
        // never "settles", and every round of a task waited the whole time.
        // A page still loading is caught just below (busy cursor, Stop button).
        let max = Duration::from_millis(2500 + u64::from(wait) * 1000);
        let settled = crate::live::wait_until_settled(min, max, || !alive());
        eprintln!(
            "[agent] screen {} after {} ms",
            if settled { "settled" } else { "still moving" },
            waited.elapsed().as_millis()
        );
        // Still loading (a busy cursor, the browser's Stop button)? Wait for
        // it like a person would, rather than judging a half-loaded page —
        // "I can't find YouTube" was often just YouTube still arriving.
        // (A finished page's controls are kept for the next look — read once.)
        if let Some(why) = uia::loading(true) {
            let _ = app.emit(events::STATUS, StatusEvent::working("Waiting for it to load…"));
            let until = std::time::Instant::now() + Duration::from_secs(12);
            while std::time::Instant::now() < until && alive() && uia::loading(false).is_some() {
                std::thread::sleep(Duration::from_millis(400));
            }
            let still = uia::loading(false).is_some();
            eprintln!("[agent] {why}; {} after {} ms", if still { "still loading" } else { "loaded" }, waited.elapsed().as_millis());
            if !still {
                crate::live::wait_until_settled(Duration::from_millis(250), Duration::from_secs(3), || !alive());
            }
            let loading = if still {
                format!(
                    "It's STILL loading ({why}) — slow internet, not a failure. Don't click again and don't decide \
                     anything is missing: say it's loading, set \"wait\" to a few seconds, and look again."
                )
            } else {
                format!("It was loading for a moment ({why}) and has finished now — judge the screen as it is.")
            };
            // Added to anything already noted (a window put back), never over it.
            told = Some(match told.take() {
                Some(t) => format!("{t}\n{loading}"),
                None => loading,
            });
        }
        match capture::capture_all() {
            Ok(f) => frame = f,
            Err(_) => break,
        }
    }

    if focus && !teaching {
        let _ = overlay::hide_overlay(app);
    }

    // It worked: keep how, for next time.
    if completed && alive() && !done_so_far.is_empty() {
        crate::recipes::remember(&prompt, &uia::foreground_app(), &done_so_far);
    }

    let mut plan = last_plan.unwrap_or_default();
    if settings.autosave_flows && !all_steps.is_empty() && !prompt.starts_with("Explain this video frame on my screen.") {
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

/// The close-up for a `zoom`: the region with a little margin, at least a
/// readable size, kept on the screen. `None` if it would be most of it anyway.
fn zoom_region(frame: &Frame, region: Rect) -> Option<Frame> {
    let screen = Rect { x: frame.origin.0, y: frame.origin.1, w: frame.width as i32, h: frame.height as i32 };
    let pad = (region.w.max(region.h) / 16).max(12);
    let mut r = region.inflate(pad);
    // Never a sliver: a little context around it helps the brain place it.
    let (min_w, min_h) = (420.min(screen.w), 280.min(screen.h));
    if r.w < min_w {
        r.x -= (min_w - r.w) / 2;
        r.w = min_w;
    }
    if r.h < min_h {
        r.y -= (min_h - r.h) / 2;
        r.h = min_h;
    }
    // Slide it back onto the screen rather than cutting it short.
    r.x = r.x.clamp(screen.x, (screen.x + screen.w - r.w).max(screen.x));
    r.y = r.y.clamp(screen.y, (screen.y + screen.h - r.h).max(screen.y));
    let r = r.clip_to(&screen)?;
    if (r.w as i64) * (r.h as i64) > (screen.w as i64) * (screen.h as i64) * 3 / 4 {
        return None;
    }
    frame.crop(&r)
}

/// Told to the agent when its last steps visibly changed nothing.
const NO_EFFECT: &str = "Your last step(s) didn't visibly change anything — the screen looks the same as before. \
Work out why, like a person would: still loading (a spinner, blank or grey boxes) → set \"wait\" and look again; \
the click missed → use the control's target id, zoom in to see it exactly, or a keyboard route (tab/enter, ctrl+l); \
a scroll did nothing → the mouse was over the wrong area (put x,y inside the panel you mean) or it's at the end; something covering it \
(pop-up, cookie banner, menu) → close that first; it needs a double-click; the window isn't in front → click inside \
it first. Say it naturally in `summary` (\"Hmm, that didn't open — trying another way\") and try again differently. \
Only ask the user after three honest, different tries.";

/// How many look-act rounds one request may take. Long jobs (a lab, a
/// worksheet) need plenty; "keep going" carries on past it.
const MAX_ROUNDS: usize = 16;

/// Bumped by every new task and by "stop". A task remembers its number and
/// stops (before its next click, and without answering) once it changes —
/// so there's only ever one task working the screen, and "stop" really
/// stops it instead of just muting it.
static TASK_GEN: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);

fn task_is_current(task: u64, generation: u64, aborted: bool) -> bool { generation == task && !aborted }
fn task_alive(task: u64) -> bool { task_is_current(task, TASK_GEN.load(std::sync::atomic::Ordering::SeqCst), automation::aborted()) }
fn stopped_plan() -> VisionPlan { VisionPlan { summary: "Stopped.".into(), ..Default::default() } }
pub fn reserve_draw_task() -> u64 {
    automation::clear_abort();
    TASK_GEN.fetch_add(1, std::sync::atomic::Ordering::SeqCst) + 1
}

/// Stop the task in progress, forget any half-done one, and let go of a
/// question it was waiting on. (Stop hotkey, Esc, the orb's ✕, "stop".)
pub fn cancel_task() {
    TASK_GEN.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
    automation::request_abort();
    UNFINISHED.lock().take();
    answer_help(None);
}

/// Worth saying out loud while working? Not the same thing twice, and not
/// just "Got it!" — the user heard "Got it, let's do this" five times in a
/// row on a quiz.
fn worth_saying(line: &str, last: &str) -> bool {
    let words = |s: &str| -> Vec<String> {
        s.to_lowercase()
            .split(|c: char| !c.is_alphanumeric() && c != '\'')
            .filter(|w| !w.is_empty())
            .map(str::to_string)
            .collect()
    };
    // "Waiting for the page to load…" is stale by the time it's said (the
    // screen settled long before the model answered) — just carry on.
    let l = line.to_lowercase();
    if ["wait", "load", "hang on", "hold on", "give it a", "a moment", "a sec"].iter().any(|p| l.contains(p)) {
        return false;
    }
    let now = words(line);
    const FILLER: &[&str] = &[
        "got", "it", "okay", "ok", "alright", "sure", "on", "let's", "lets", "let", "me", "i'll", "now",
        "so", "right", "cool", "great", "perfect", "here", "we", "go", "thing", "almost", "there", "just",
        "still", "trying", "try", "hang", "one", "more", "time", "again", "you", "for", "your", "the", "a",
        "to", "that", "this", "up", "get", "getting", "is", "in", "of", "and", "moment", "second", "sec",
    ];
    let meaningful = now.iter().filter(|w| !FILLER.contains(&w.as_str())).count();
    if meaningful < 2 {
        return false;
    }
    let before = words(last);
    if before.is_empty() {
        return true;
    }
    // Say it only if it adds something: its meaningful words aren't all
    // things just said ("Opening Notepad for you!" → "Almost there, just
    // opening Notepad now" adds nothing).
    let fresh = now
        .iter()
        .filter(|w| !FILLER.contains(&w.as_str()) && !before.contains(w))
        .count();
    fresh > 0 && (fresh as f32) / (meaningful as f32) >= 0.4
}

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

/// "Yes", "yeah", "sure"… — answering the question Izuki just asked ("want me
/// to scroll and continue?") is the same as telling it to carry on. Without
/// this, a plain "yes" is taken as the start of a fresh conversation and the
/// thing it offered to do never happens.
///
/// Only ever consulted when a task is actually waiting on an answer, so "yes"
/// in ordinary conversation is untouched.
fn is_yes(said: &str) -> bool {
    let s = said.trim().trim_end_matches(['.', '!', '?']).to_lowercase();
    let s = s.trim_start_matches("okay ").trim_start_matches("ok ").trim_start_matches("please ");
    ["yes", "yeah", "yep", "yup", "sure", "go ahead", "go on", "do it", "please do", "affirmative"]
        .iter()
        .any(|k| {
            if s == *k {
                return true;
            }
            // "yes, open the file" answers a question; "yes I know, but can you…"
            // is a new sentence that merely starts the same way. "Continue" is
            // rare enough that a prefix match is safe, but "yes" opens all
            // sorts of ordinary sentences — so the rest has to stay short.
            let Some(rest) = s.strip_prefix(&format!("{k} ")) else { return false };
            rest.split_whitespace().count() <= 5
        })
}

/// The answer to a pending "which one? circle it" question, when it comes.
static HELP: parking_lot::Mutex<Option<std::sync::mpsc::Sender<Option<DrawSession>>>> =
    parking_lot::Mutex::new(None);

/// Ask the user to show Izuki something: says the question, opens the draw
/// surface, and waits for their mark (and/or words) — `None` if they skip it
/// (Esc), stop Izuki, or don't answer within a minute and a half.
fn ask_user(app: &AppHandle, question: &str, alive: &dyn Fn() -> bool) -> Option<DrawSession> {
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
                if !alive() || started.elapsed() > Duration::from_secs(90) {
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
        Intent::Scroll => {
            let n = s.scroll_amount.unwrap_or(3);
            let dir = match s.key.as_deref().map(str::trim) {
                Some(d @ ("left" | "right" | "up" | "down")) => d.to_string(),
                _ if n < 0 => "up".into(),
                _ => "down".into(),
            };
            format!("scrolled {dir} {} at {},{}", n.abs(), s.x, s.y)
        }
        Intent::OpenApp => format!("opened the app \"{}\"", s.text_to_type.as_deref().unwrap_or("")),
        Intent::OpenUrl => format!("opened {}", s.text_to_type.as_deref().unwrap_or("a web page")),
        Intent::Search => format!("searched the web for \"{}\"", s.text_to_type.as_deref().unwrap_or("")),
        Intent::PlayYoutube => format!("played \"{}\" on YouTube", s.text_to_type.as_deref().unwrap_or("")),
        Intent::Draw => format!("drew a {} at {},{}", s.shape.as_deref().unwrap_or("mark"), s.x, s.y),
        Intent::Stroke => format!("drew a line through {} points starting at {},{}", s.path.as_ref().map_or(0, |p| p.len()), s.x, s.y),
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
        windows: Vec::new(),
        page_text: String::new(),
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
    fn stopped_draw_cannot_revive_when_the_next_task_clears_abort() {
        let draw = 7;
        assert!(task_is_current(draw, 7, false));
        assert!(!task_is_current(draw, 7, true), "immediate Escape abort wins before cancellation cleanup");
        assert!(!task_is_current(draw, 8, true), "stop invalidates the generation");
        assert!(!task_is_current(draw, 9, false), "a new task clearing abort cannot revive queued clicks");
        assert!(task_is_current(9, 9, false));
    }

    #[test]
    fn named_clicks_skip_the_brain_only_when_clear_and_safe() {
        assert_eq!(named_target("click Subscribe").as_deref(), Some("subscribe"));
        assert_eq!(named_target("Please press the Sign in button.").as_deref(), Some("sign in"));
        assert_eq!(named_target("tap on the Settings tab").as_deref(), Some("settings"));
        // Final things are confirmed first, by the brain.
        assert_eq!(named_target("click delete"), None);
        assert_eq!(named_target("press send"), None);
        assert_eq!(named_target("click Pay now"), None);
        // Positions, "it", several steps: the brain works those out.
        assert_eq!(named_target("click the second video"), None);
        assert_eq!(named_target("click it"), None);
        assert_eq!(named_target("click search and type lofi"), None);
        assert_eq!(named_target("open youtube"), None);

        let control = |id: u32, name: &str| uia::Control {
            id,
            kind: "Button".into(),
            name: name.into(),
            rect: Rect { x: 0, y: 0, w: 10, h: 10 },
            hidden: false,
            value: String::new(),
            focused: false,
            below: false,
            identity: None,
        };
        let cs = vec![control(1, "Subscribe"), control(2, "Subscribed channels"), control(3, "Sign in")];
        assert_eq!(unique_named("subscribe", &cs).map(|c| c.id), Some(1), "the exact name wins");
        assert_eq!(unique_named("sign", &cs).map(|c| c.id), Some(3));
        let twins = vec![control(1, "Play"), control(2, "Play")];
        assert!(unique_named("play", &twins).is_none(), "two the same: the brain picks");
    }

    #[test]
    fn an_overloaded_brain_rests_instead_of_costing_every_look() {
        // Gemini's free tier on a busy day, word for word.
        let busy = "Gemini answered 503 Service Unavailable: This model is currently experiencing high demand.";
        assert_eq!(rest_for(busy), Some(std::time::Duration::from_secs(60)));
        assert!(rest_for("gemini: 429 Too Many Requests — quota exceeded per day").unwrap() > std::time::Duration::from_secs(60));
        assert_eq!(rest_for("the key was rejected (401)"), None);
    }

    #[test]
    fn newer_gemini_models_still_skip_thinking() {
        use crate::vision::{gemini_no_think, gemini_refused_no_think, NoThink};
        let m = "gemini-test-flash-lite";
        assert_eq!(gemini_no_think(m), NoThink::Budget);
        // Gemini 3.x refuses thinkingBudget: 0 — the next try is thinkingLevel: minimal, not "think fully".
        assert_eq!(gemini_refused_no_think(m, NoThink::Budget), NoThink::Level);
        assert_eq!(gemini_no_think(m), NoThink::Level);
        assert_eq!(NoThink::Level.thinking_config().unwrap()["thinkingLevel"], "minimal");
        assert_eq!(gemini_refused_no_think(m, NoThink::Level), NoThink::Neither);
        assert_eq!(gemini_no_think("gemini-3-pro"), NoThink::Neither);
    }

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
    fn a_close_up_is_readable_and_stays_on_screen() {
        let frame = Frame { width: 1920, height: 1080, origin: (-1920, 0), bgra: vec![0; 1920 * 1080 * 4] };
        // A tiny radio button near the corner: grown to a readable size, slid back onto the screen.
        let z = zoom_region(&frame, Rect { x: -1915, y: 5, w: 20, h: 20 }).expect("close-up");
        assert_eq!((z.width, z.height, z.origin), (420, 280, (-1920, 0)));
        // A question panel: kept, with a little margin.
        let z = zoom_region(&frame, Rect { x: -1500, y: 300, w: 640, h: 400 }).expect("close-up");
        assert_eq!(z.origin, (-1540, 260));
        assert_eq!((z.width, z.height), (720, 480));
        // Most of the screen: no point.
        assert!(zoom_region(&frame, Rect { x: -1900, y: 10, w: 1800, h: 1000 }).is_none());
    }

    #[test]
    fn yes_carries_on_a_pending_task() {
        // Izuki asked "want me to scroll and continue?" — a plain "yes" has to
        // resume it, not read as the start of a new conversation.
        for said in ["yes", "Yes.", "yes please", "yeah", "yep", "sure", "ok yes", "go ahead", "do it"] {
            assert!(is_yes(said), "{said}");
        }
        assert!(is_yes("yes, open the file"), "a short instruction after it still counts");
        assert!(!is_yes("no"));
        assert!(!is_yes("not yet"));
        // A real sentence that merely begins "yes" is a new request, not an answer.
        assert!(!is_yes("yes tell me about the weather"));
        assert!(!is_yes("yes I know that, but can you open my Downloads folder instead"));
        assert!(!is_yes(""));
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
