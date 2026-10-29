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
    // Circled one button and said "next" / "click it": click that button
    // now — no AI to wait for, nothing for a busy free model to get wrong.
    if let Some(plan) = click_what_was_circled(app, store, &session, task) {
        return plan;
    }
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
            match ask_model(store, &session, f, &local, false, false, false) {
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

/// One circle round one button, and a request that's just a click on it
/// ("next", "click next", "press submit", "click it"): find the real button
/// inside the circle and click its centre. `None` hands over to the usual
/// path (the AI) — when the words don't fit the button, or the circle holds
/// no single clickable thing.
fn click_what_was_circled(app: &AppHandle, store: &Arc<Store>, session: &DrawSession, task: u64) -> Option<VisionPlan> {
    let [mark] = session.marks.as_slice() else { return None };
    let words = planner::draw_click_words(&session.prompt)?;
    let started = std::time::Instant::now();
    let controls = uia::list_controls(MAX_CONTROLS);
    let (cx, cy) = mark.rect.center();
    let target = planner::drawn_target(&controls, &mark.rect, cx, cy)?;
    if !planner::name_fits(&target.name, &words) {
        eprintln!("[draw] circled \"{}\" but asked for \"{words}\" — asking the AI", target.name);
        return None;
    }
    let (x, y) = target.rect.center();
    let step: ActionStep = serde_json::from_value(serde_json::json!({
        "action": "click", "x": x, "y": y, "confidence": 1.0, "reasoning": "the button the user circled",
    }))
    .ok()?;
    let step = ActionStep { target: Some(target.id), snapped_to: Some(target.name.clone()), grounding: target.identity.clone(), ..step };
    eprintln!("[draw] clicking circled \"{}\" with no AI ({} ms to find it)", target.name, started.elapsed().as_millis());
    let name = target.name.trim().to_string();
    run_steps_for_task(app, store, std::slice::from_ref(&step), task, || {});
    set_frozen(None);
    Some(VisionPlan {
        steps: vec![step],
        summary: if name.is_empty() { "Clicked it.".into() } else { format!("Clicked “{name}”.") },
        provider: "local".into(),
        model: "circle".into(),
        done: true,
        outcome: crate::model::TaskOutcome::Partial,
        ..Default::default()
    })
}

/// When the user drew on the screen, the AI's clicks belong where they
/// pointed — never on the taskbar (a free model once clicked Windows'
/// Search icon instead of the circled "Next"). A stray taskbar click moves
/// onto the one button inside the user's mark, or is dropped.
fn keep_clicks_off_taskbar(steps: &mut Vec<ActionStep>, marks: &[crate::model::Mark], controls: Option<&[uia::Control]>) -> usize {
    if marks.is_empty() || marks.iter().any(|m| { let (x, y) = m.rect.center(); uia::on_taskbar(x, y) }) {
        return 0;
    }
    let mut fixed = 0;
    steps.retain_mut(|s| {
        let clicks = matches!(s.action, Intent::Click | Intent::DoubleClick | Intent::RightClick | Intent::Type | Intent::Drag);
        if !clicks || !uia::on_taskbar(s.x, s.y) {
            return true;
        }
        fixed += 1;
        let only = match (controls, marks) {
            (Some(cs), [m]) => { let (cx, cy) = m.rect.center(); planner::drawn_target(cs, &m.rect, cx, cy) }
            _ => None,
        };
        match only {
            Some(c) if matches!(s.action, Intent::Click | Intent::DoubleClick) => {
                eprintln!("[draw] the AI aimed at the taskbar — clicking the circled \"{}\" instead", c.name);
                let (x, y) = c.rect.center();
                s.x = x; s.y = y; s.target = Some(c.id); s.snapped_to = Some(c.name.clone()); s.grounding = c.identity.clone();
                true
            }
            _ => {
                eprintln!("[draw] dropped a click on the taskbar the user never pointed at ({},{})", s.x, s.y);
                false
            }
        }
    });
    fixed
}

/// Programs where typing a line runs it as a command.
const TERMINALS: &[&str] = &["cmd", "powershell", "pwsh", "windowsterminal", "wt", "openconsole", "conhost", "wsl", "bash", "mintty", "alacritty", "wezterm-gui", "terminal"];

/// A typed line that reads like a shell command ("git status", "rm -rf …").
fn looks_like_command(text: &str) -> bool {
    const STARTS: &[&str] = &[
        "git ", "npm ", "npx ", "yarn ", "pnpm ", "cargo ", "rustc ", "python", "py ", "pip ", "node ", "cd ", "dir", "ls", "rm ", "del ",
        "rmdir", "rd ", "format ", "move ", "copy ", "cp ", "mv ", "mkdir", "curl ", "wget ", "powershell", "pwsh", "cmd ", "start ", "taskkill",
        "shutdown", "reg ", "net ", "sc ", "choco ", "winget ", "set-", "get-", "remove-", "new-", "invoke-", "iwr ", "irm ", "sudo ", "chmod", "echo ",
    ];
    let t = text.trim().to_lowercase();
    !t.is_empty() && (STARTS.iter().any(|s| t.starts_with(s)) || t.contains(" && ") || t.contains(" | ") || t.contains("--force"))
}

/// A terminal line safe to type without the user spelling it out: it only
/// looks (the Chat tab's own rule), or it's a harmless basic a lesson shows
/// (cls, cd, echo to the screen, mkdir of a new plain folder…). Nothing that
/// deletes, overwrites, installs, chains or redirects.
pub fn safe_terminal_line(text: &str) -> bool {
    let l = text.trim().to_lowercase();
    if l.is_empty() || l.len() > 160 || l.contains(['\n', '\r']) {
        return false;
    }
    if ['&', '|', '>', '<', '^', '`', '$', ';', '*', '?', '%', '!', '(', ')', '{', '}'].iter().any(|c| l.contains(*c)) {
        return false;
    }
    let first = l.split_whitespace().next().unwrap_or("");
    let rest = l[first.len()..].trim();
    match first {
        "cls" | "clear" | "clear-host" | "ver" | "pwd" | "whoami" | "hostname" | "get-location" | "gl" => rest.is_empty(),
        "help" | "get-help" | "title" => true,
        "date" | "time" => rest == "/t",
        "echo" | "write-host" | "write-output" => true,
        "cd" | "chdir" | "set-location" | "sl" | "pushd" | "popd" => !rest.starts_with("/d \\\\"),
        "type" | "more" | "get-content" => !rest.is_empty(),
        "mkdir" | "md" => !rest.is_empty() && !rest.contains("..") && rest.chars().all(|c| c.is_alphanumeric() || "-_".contains(c)),
        "python" | "py" | "node" | "git" | "npm" | "java" | "gcc" | "rustc" | "cargo" => {
            ["--version", "-v", "-version", "version", "status", "log --oneline", "branch", "diff"].contains(&rest)
        }
        _ => false,
    }
}

/// What the last look saw that the step guard needs: the answer choices on
/// screen (radio buttons, check boxes) and whether the page is a quiz or test.
#[derive(Debug, Clone, Default)]
pub struct Look {
    pub options: Vec<String>,
    pub test_page: bool,
    /// Where each answer choice is on screen (a mark there marks the choice).
    pub choice_rects: Vec<Rect>,
}

thread_local! {
    /// What this thread's last look saw. Each task runs on its own thread, so
    /// the guards always judge a plan by the look it was made from — never by
    /// another task's.
    static LOOK: std::cell::RefCell<Look> = std::cell::RefCell::new(Look::default());
}

/// This task's last look.
fn this_look() -> Look {
    LOOK.with(|l| l.borrow().clone())
}

impl Look {
    pub fn of(controls: &[uia::Control], page_text: &str, title: &str) -> Look {
        // (A space in front, so "Test 3 …" at the very start counts as " test".)
        let words = format!(" {} {}", title.to_lowercase(), page_text.chars().take(4000).collect::<String>().to_lowercase());
        let testy = ["quiz", " test", "exam", "assessment", "practice test", "midterm", "final exam"].iter().any(|w| words.contains(w))
            || (words.contains("question ") && words.contains(" of "));
        // Choices: radio buttons and tick boxes — and, on a quiz, buttons that
        // read as choices ("A. Phishing", "(b) …", "True", "False").
        let chosen: Vec<&uia::Control> = controls
            .iter()
            .filter(|c| !c.name.trim().is_empty())
            .filter(|c| matches!(c.kind.as_str(), "RadioButton" | "CheckBox") || (testy && c.kind == "Button" && reads_as_choice(&c.name)))
            .collect();
        let options: Vec<String> = chosen.iter().map(|c| c.name.trim().to_lowercase()).collect();
        let choice_rects = chosen.iter().map(|c| c.rect).collect();
        Look { test_page: testy && options.len() >= 2, options, choice_rects }
    }
}

/// A button named like an answer choice: "A. Phishing", "(b) …", "True".
fn reads_as_choice(name: &str) -> bool {
    let n = name.trim().to_lowercase();
    let b = n.as_bytes();
    let lettered = n.len() > 2
        && ((b'a'..=b'e').contains(&b[0]) && matches!(b[1], b'.' | b')' | b':') || n.starts_with('(') && n.len() > 3 && (b'a'..=b'e').contains(&b[1]) && b[2] == b')');
    lettered || ["true", "false", "a", "b", "c", "d"].contains(&n.as_str())
}

/// Told to the brain while a quiz or test is on screen.
const QUIZ_PROMPT: &str = "QUIZ OR TEST IN PROGRESS: the student answers it. Explain what the question asks and the idea behind it, point at the key words in the question, and help them reason it out — but never say, hint at or mark which choice is correct, and never confirm or reject a choice they picked. Never click or type an answer. Going to the next question when they ask is fine.\n";

/// The owner asked for direct answers when explicitly requested. Coaching
/// remains a separate mode; answering never authorizes a click or submission.
pub(crate) fn direct_answer_requested(prompt: &str) -> bool {
    let latest = prompt.split("\n\n(The conversation just before,").next().unwrap_or(prompt);
    let s = latest.to_lowercase();
    if ["don't answer", "do not answer", "without the answer", "coach me", "tutor mode", "teacher mode"].iter().any(|p| s.contains(p)) {
        return false;
    }
    // Moving between questions is allowed while explaining — "answer this and
    // click next" is a normal way to work through a quiz, and the step filter
    // below keeps it to Next/Previous. Anything that would *pick* or *send* an
    // answer goes back to coaching, which never does either.
    const PICKS_OR_SENDS: [&str; 11] = [
        "submit", "select", "choose", "pick", "tick", "check the box", "mark it", "finish the test", "end test", "hand in", "turn it in",
    ];
    if PICKS_OR_SENDS.iter().any(|w| s.contains(w)) {
        return false;
    }
    if crate::companion::asks_to_do(latest) && !["next", "previous", "back", "forward", "carry on", "keep going"].iter().any(|w| s.contains(w)) {
        return false;
    }
    // Not a list of exact sentences: people don't say "what is the answer",
    // they say "help me ans the quiz and explain". Asking for the answer is
    // an answering word plus the thing it's about.
    let words: Vec<&str> = s.split(|c: char| !c.is_alphanumeric()).filter(|w| !w.is_empty()).collect();
    let answering = words.iter().any(|w| matches!(*w, "answer" | "answers" | "ans" | "solve" | "correct"));
    let about_this = words.iter().any(|w| matches!(*w, "this" | "that" | "it" | "them" | "these" | "question" | "questions" | "quiz" | "test" | "option" | "options" | "one"));
    // "the answer" on its own is already asking for it ("give me the answer").
    (answering && (about_this || s.contains("the answer") || s.contains("what") || s.contains("which")))
        || matches!(s.trim().trim_end_matches(['?', '!', '.']), "answer" | "answer it" | "answer this" | "ans")
}

const DIRECT_ANSWER_PROMPT: &str = "The user explicitly asked for the answer. Answer the visible factual question directly: answer first, with the option label only when clearly visible, then a short explanation. Do not refuse to name a factual answer or turn this into a walkthrough. Do not guess unreadable choices. If you are not certain of the fact, say which part you are unsure about instead of stating it confidently — being wrong costs them marks, and saying it is probably B but they should check whether X applies is far more use than a confident wrong letter. This is an explanation-only request: do not select, click, type or submit answers. Do not offer to save Notes.\n";

/// On a quiz or test page: what Izuki says never names the right choice and
/// its pen never marks one — the same rule Quiz coach follows (coach.rs),
/// whatever the request was. Sentences naming a choice are left out; marks
/// on a choice are dropped. Explaining the question itself stays.
fn keep_answers_out(plan: &mut VisionPlan, steps: &mut Vec<ActionStep>, look: &Look) {
    if !look.test_page {
        return;
    }
    let said = crate::coach::leak_guard(&plan.summary, &look.options);
    if said != plan.summary.trim() {
        eprintln!("[agent] quiz page: kept the answer out of what's said");
        plan.summary = said;
    }
    if let Some(q) = plan.ask.take() {
        plan.ask = Some(crate::coach::leak_guard(&q, &look.options));
    }
    let before = steps.len();
    steps.retain(|s| !(matches!(s.action, Intent::Draw | Intent::Point | Intent::Stroke) && marks_a_choice(s, look)));
    if steps.len() < before {
        eprintln!("[agent] quiz page: dropped {} mark(s) on an answer choice", before - steps.len());
    }
}

fn apply_answer_mode(plan: &mut VisionPlan, steps: &mut Vec<ActionStep>, look: &Look, prompt: &str) {
    // Only a quiz or test needs the answer kept out of Izuki's hands. On an
    // ordinary page this used to throw away the scroll that reaches the
    // question and the ask that says "I can't read the choices".
    if !look.test_page {
        return keep_answers_out(plan, steps, look);
    }
    if direct_answer_requested(prompt) {
        // Naming a fact is not permission to act on the test or page.
        let latest = prompt.split("\n\n(The conversation just before,").next().unwrap_or(prompt).to_lowercase();
        steps.retain(|step| {
            let name = step.snapped_to.as_deref().unwrap_or("").trim().to_lowercase();
            let navigation = match name.as_str() {
                "next" | "next question" => latest.contains("next question") || latest.contains("click next"),
                "previous" | "previous question" | "back" => latest.contains("previous question") || latest.contains("click back"),
                _ => false,
            };
            navigation && matches!(step.action, Intent::Click | Intent::Auto)
                && !look.options.contains(&name)
        });
        plan.ask = None;
    } else {
        keep_answers_out(plan, steps, look);
    }
}

/// A pen mark or pointer on one of the answer choices: by its control, by
/// the words it marks, or by where it is (a point, a box, a drawn path).
fn marks_a_choice(step: &ActionStep, look: &Look) -> bool {
    let options = &look.options;
    let norm = |s: &str| s.to_lowercase().chars().map(|c| if c.is_alphanumeric() { c } else { ' ' }).collect::<String>().split_whitespace().collect::<Vec<_>>().join(" ");
    let on_choice = |x: i32, y: i32| look.choice_rects.iter().any(|r| Rect { x: r.x - 6, y: r.y - 6, w: r.w + 12, h: r.h + 12 }.contains(x, y));
    let placed = (step.x != 0 || step.y != 0) && on_choice(step.x, step.y)
        || step.x2.zip(step.y2).is_some_and(|(x, y)| on_choice(x, y))
        || step.path.as_ref().is_some_and(|p| {
            // Every point, and along each segment between them (a quick swipe
            // across a choice has its points on either side of it).
            p.iter().any(|[x, y]| on_choice(*x, *y))
                || p.windows(2).any(|w| {
                    let ([x1, y1], [x2, y2]) = (w[0], w[1]);
                    let n = ((x2 - x1).abs().max((y2 - y1).abs()) / 6).clamp(1, 400);
                    (1..n).any(|i| on_choice(x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n))
                })
        });
    if placed {
        return true;
    }
    let on_control = step.snapped_to.as_deref().is_some_and(|n| options.contains(&n.trim().to_lowercase()));
    let words = step.text_to_type.as_deref().map(norm).unwrap_or_default();
    let on_words = words.chars().count() >= 3
        && options.iter().map(|o| norm(o)).any(|o| {
            // "a. phishing emails" is the same choice as "phishing emails".
            let o = o.split_once(' ').filter(|(l, _)| l.len() == 1).map(|(_, r)| r.to_string()).unwrap_or(o);
            o.contains(&words) || (words.contains(&o) && o.chars().count() >= 3)
        });
    on_control || on_words
}

/// Buttons that finish or send something: never pressed unless the user
/// said to in this request (the brain is told to ask first; this makes sure).
const FINAL_BUTTONS: &[&str] = &[
    "submit", "finish test", "end test", "finish quiz", "end quiz", "finish attempt", "end exam", "finish exam", "hand in", "turn in",
    "send", "pay ", "pay now", "buy", "place order", "checkout", "check out", "purchase", "delete", "remove account", "post", "publish", "transfer",
    "don't save", "dont save", "do not save", "discard", "close without saving",
    // Destroys something, with no undo anywhere in Windows.
    "erase", "wipe", "format", "uninstall", "empty bin", "empty trash", "delete forever", "delete permanently",
    "permanently delete", "remove permanently", "factory reset", "reset device", "clear all data", "overwrite",
    // Spends money or signs something up.
    "donate", "confirm payment", "confirm order", "place bid", "buy now", "subscribe and pay", "start subscription",
    // Reaches other people, and can't be taken back once it's gone.
    "share", "invite", "send invite", "send message", "send email", "reply all", "post now", "go live", "publish now",
    // Hands out access or cuts it off.
    "revoke", "deactivate", "close account", "delete account", "cancel subscription", "unsubscribe",
    "grant access", "allow access", "trust this", "sign out of all",
];

/// " words like this " — lower-case, punctuation gone, padded for whole-word matching.
fn words_of(s: &str) -> String {
    let w: String = s.to_lowercase().replace('\u{2019}', "'").chars().map(|c| if c.is_alphanumeric() || c == '\'' { c } else { ' ' }).collect();
    format!(" {} ", w.split_whitespace().collect::<Vec<_>>().join(" "))
}

/// Which FINAL_BUTTONS phrase a final button's name holds ("submit quiz" → "submit").
fn final_phrase(name: &str) -> Option<&'static str> {
    let padded = words_of(name);
    FINAL_BUTTONS.iter().map(|f| f.trim()).find(|f| padded.contains(&format!(" {f} ")))
}

/// The final button a step would press, if any.
fn final_button(step: &ActionStep) -> Option<String> {
    if !matches!(step.action, Intent::Click | Intent::DoubleClick | Intent::Auto) {
        return None;
    }
    // Whole words only: "Submit quiz" is final, "Sending options" and "Postcode"
    // aren't — names and entries put through the same normaliser, so "Don’t
    // Save" (any apostrophe) is caught.
    let raw = step.snapped_to.as_deref()?.trim().to_lowercase();
    let padded = words_of(&raw);
    FINAL_BUTTONS.iter().any(|f| padded.contains(&words_of(f))).then_some(raw)
}

/// Never on a guess: typing a command into a terminal (it runs, and can
/// delete things) unless the user spelled that command out, and writing
/// notes on the screen unless they asked to be shown or taught something.
/// Drops those steps (and what came after a held-back command) and says why,
/// for the next look. `None` when the plan was fine.
/// A held-back step, said to the person in plain words (the reasons from
/// `guard_steps` are written for the AI).
fn plainly(why: &str) -> String {
    if why.contains("Typing a command into a terminal") {
        "I didn't type that command into your terminal — I only run commands you spell out exactly. Tell me the exact command, or say what you want done (like “clear the safe stuff” to free up space) and I'll do it my own way.".into()
    } else if why.contains("This is a quiz or test") {
        "On a quiz or test I don't pick the answers — I can explain the question and the idea behind it, and you choose.".into()
    } else if let Some(rest) = why.strip_prefix("Pressing “") {
        let name = rest.split('”').next().unwrap_or("that");
        format!("I stopped before pressing “{name}” — it's a final button, so I only press it when you tell me to exactly.")
    } else {
        "I didn't do that part — it isn't something I do without you saying so exactly. Tell me exactly what you want, or do that part yourself.".into()
    }
}

fn guard_steps(steps: &mut Vec<ActionStep>, prompt: &str, lesson: bool, front: &str) -> Option<String> {
    let look = this_look();
    guard_steps_with(steps, prompt, lesson, front, &look)
}

fn guard_steps_with(steps: &mut Vec<ActionStep>, prompt: &str, lesson: bool, front: &str, look: &Look) -> Option<String> {
    let asked = prompt.to_lowercase();
    let mut why = Vec::new();
    // 0. A final button (Submit, End test, Send, Pay…) only when the user said
    //    so in this very request. The model is told to ask first; a backup
    //    model once submitted a whole test anyway — this makes it certain.
    // Every final step is checked; the plan stops at the first one not said.
    let said = words_of(&asked);
    let held = steps.iter().enumerate().find_map(|(i, s)| {
        let name = final_button(s)?;
        let phrase = final_phrase(&name)?;
        // Consent is the button's whole phrase in the request ("submit it",
        // "yes, end the test" doesn't count for "Finish attempt"), not negated.
        let negated = ["don't ", "dont ", "do not ", "never ", "without ", "not "].iter().any(|n| said.contains(&format!(" {n}{phrase} ")));
        let told = said.contains(&format!(" {phrase} ")) && !negated;
        (!told).then_some((i, name, phrase))
    });
    if let Some((i, name, phrase)) = held {
        steps.truncate(i);
        why.push(format!("Pressing “{name}” wasn't done: it's final. Stop right before it and set \"ask\" to check with the user first (\"Want me to {phrase} it?\")."));
    }
    // 0b. On a quiz or test the student picks the answers: Izuki explains,
    //     points at the key words and lets them choose (academic honesty).
    if look.test_page {
        let before = steps.len();
        steps.retain(|s| {
            let picks_answer = matches!(s.action, Intent::Click | Intent::DoubleClick | Intent::Auto)
                && s.snapped_to.as_deref().is_some_and(|n| look.options.contains(&n.trim().to_lowercase()));
            let types_answer = s.action == Intent::Type && s.text_to_type.as_deref().is_some_and(|t| !asked.contains(&t.trim().to_lowercase()));
            !(picks_answer || types_answer)
        });
        if steps.len() < before {
            why.push("This is a quiz or test, so the answer wasn't picked: the student chooses. Explain the question and the idea behind it, point at the key words, and let them click their answer — then you can tell them why it's right or wrong.".to_string());
        }
    }
    // 1. Commands.
    let terminal = TERMINALS.contains(&front);
    let cut = steps.iter().position(|s| {
        s.action == Intent::Type
            && s.text_to_type.as_deref().is_some_and(|t| {
                let spelled_out = asked.contains(&t.trim().to_lowercase());
                (terminal || looks_like_command(t)) && !spelled_out && !(lesson && terminal && safe_terminal_line(t))
            })
    });
    if let Some(i) = cut {
        steps.truncate(i);
        why.push("Typing a command into a terminal wasn't done: commands are only run when the user spells out the exact command. If one is needed, ask them which command to run (and say what it would do).".to_string());
    }
    // 2. Words written on the screen.
    let explaining = lesson
        || ["explain", "teach", "show me", "show where", "point", "draw", "mark", "circle", "highlight", "underline", "annotate", "note", "write", "label", "tutor", "help me understand"]
            .iter()
            .any(|w| asked.contains(w));
    if !explaining {
        let before = steps.len();
        steps.retain(|s| !(s.action == Intent::Draw && s.text_to_type.as_deref().is_some_and(|t| !t.trim().is_empty()) && s.shape.as_deref() == Some("note")));
        if steps.len() < before {
            why.push("Notes written on the screen weren't shown: the user didn't ask to be taught or shown anything, so just do the task.".to_string());
        }
    }
    (!why.is_empty()).then(|| why.join(" "))
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

fn is_browser(app: &str) -> bool {
    let a = app.to_lowercase();
    ["chrome", "msedge", "brave", "opera", "vivaldi", "firefox", "arc"].iter().any(|b| a.trim_end_matches(".exe") == *b)
}

/// The page's elements from the extension, numbered after the window's own
/// controls; Windows' copies of the same page elements are dropped.
fn merge_page(controls: &mut Vec<uia::Control>, page_text: &mut String, page: crate::ext::Page) {
    if page.elements.is_empty() {
        return;
    }
    let v = page.viewport;
    controls.retain(|c| {
        let (x, y) = c.rect.center();
        !(x >= v.x && x < v.x + v.w && y >= v.y && y < v.y + v.h)
    });
    let mut next = controls.iter().map(|c| c.id).max().unwrap_or(0).max(899) + 1;
    let mut listed = Vec::new();
    for e in page.elements.into_iter().take(120) {
        let name = match &e.href {
            Some(h) if !h.is_empty() && !e.name.is_empty() => format!("{} → {}", e.name, h.chars().take(80).collect::<String>()),
            Some(h) if !h.is_empty() => h.chars().take(80).collect(),
            _ => e.name.clone(),
        };
        listed.push((next, e.dom_id.clone()));
        controls.push(uia::Control {
            id: next,
            kind: e.kind.clone(),
            name,
            rect: e.rect,
            hidden: false,
            value: String::new(),
            focused: false,
            below: false,
            section: String::new(),
            identity: None,
        });
        next += 1;
    }
    crate::ext::remember_listed(listed);
    if !page.text.trim().is_empty() {
        *page_text = format!("Page: {}
{}", page.url, page.text.chars().take(PAGE_TEXT_CHARS).collect::<String>());
    }
    eprintln!("[ext] the page's own elements: {} (from the browser extension)", controls.len());
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
    think: bool,
) -> Result<VisionPlan> {
    let _ = store; // brains now come from `brain_chain()`
    let started = std::time::Instant::now();
    // Reading the window's buttons takes the longest part of the prep (up to
    // a second) — do it at the same time as the screenshot work.
    let (controls_tx, controls_rx) = std::sync::mpsc::channel();
    // The page's words arrive separately: they used to be joined into the same
    // message, so a slow text read held up a control list that was already
    // finished — and when the wait ran out, the whole message was thrown away
    // and a good list of buttons became "going by the picture".
    let (text_tx, text_rx) = std::sync::mpsc::channel();
    let controls_job = std::thread::spawn(move || {
        let t = std::time::Instant::now();
        // The page's own words, read alongside the controls (not after).
        let text_job = std::thread::spawn(|| uia::document_text(PAGE_TEXT_CHARS));
        // Bind labels and rectangles to this look, not a prefetch made while
        // the user was still speaking or another page was foreground.
        let c = uia::list_controls(MAX_CONTROLS);
        eprintln!("[brain] screen controls: {} in {} ms", c.len(), t.elapsed().as_millis());
        crate::state::trace(format!("Read your screen — {} things I can press", c.len()));
        let _ = controls_tx.send(c);
        let text = text_job.join().unwrap_or_default();
        eprintln!("[brain] page text: {} chars, in {} ms", text.len(), t.elapsed().as_millis());
        let _ = text_tx.send(text);
    });
    let _ = controls_job;

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
    // Apps that draw their own screens (FL Studio, games) can take Windows
    // 15+ s to describe — and then list almost nothing. Wait 2.5 s at most;
    // past that the picture alone guides the step.
    let mut controls = controls_rx.recv_timeout(std::time::Duration::from_millis(2500)).unwrap_or_else(|_| {
        eprintln!("[brain] the window was slow to list its controls — going by the picture");
        Vec::new()
    });
    // The page's words are a bonus on top of the numbered buttons, so they get
    // a short slice of their own and never delay or discard the list.
    let mut page_text: String = text_rx.recv_timeout(std::time::Duration::from_millis(400)).unwrap_or_default();
    // The task's tab is out of sight (you opened another tab): the look is the
    // page itself, read through the extension — no screenshot, which would
    // only show your tab — and every step goes into that page by number.
    let tab_mode = crate::ext::check_tab_hidden();
    let mut tab_title = String::new();
    if tab_mode {
        controls.clear();
        page_text.clear();
        if let Some(page) = crate::ext::snapshot() {
            tab_title = page.title.clone();
            merge_page(&mut controls, &mut page_text, page);
        }
        page_text = format!(
            "WORKING IN A TAB THE USER ISN'T LOOKING AT: the user switched to another tab, so there is no screenshot and you must not use the mouse or keyboard. \
             Act only on the numbered page elements with \"target\" (click, type) or scroll the page; nothing else can happen until they come back.\n{page_text}"
        );
        eprintln!("[agent] working in the pinned tab while you're on another one");
    } else if crate::ext::connected() && is_browser(&uia::foreground_app()) {
        if let Some(page) = crate::ext::snapshot() {
            // A question whose answer may be behind a link: read the most
            // related linked pages in the background, with your sign-ins.
            let behind = if crate::ext::is_question(&session.prompt) {
                crate::ext::read_links(&crate::ext::related_links(&page, &session.prompt, 3))
            } else {
                String::new()
            };
            merge_page(&mut controls, &mut page_text, page);
            if !behind.is_empty() {
                page_text.push_str("\n");
                page_text.push_str(&behind);
            }
        }
    }
    if zoomed {
        // Only what's in the close-up — the rest would have coordinates
        // off the picture.
        controls.retain(|c| {
            let (cx, cy) = c.rect.center();
            !c.below && cx >= desktop.x && cy >= desktop.y && cx < desktop.x + desktop.w && cy < desktop.y + desktop.h
        });
    }
    crate::tags::draw(&mut scaled, &desktop, &controls);
    let image_jpeg = if tab_mode { Vec::new() } else { scaled.to_jpeg(80)? };

    let ocr_text = session
        .marks
        .iter()
        .filter_map(|m| m.ocr.clone())
        .collect::<Vec<_>>()
        .join("\n");

    let title = if tab_mode && !tab_title.is_empty() { tab_title } else { uia::foreground_title() };
    let look = Look::of(&controls, &page_text, &title);
    let on_a_test = look.test_page;
    LOOK.with(|l| *l.borrow_mut() = look);
    let req = VisionRequest {
        image_jpeg,
        image_size: (scaled.width, scaled.height),
        desktop,
        marks_description: planner::describe(session),
        user_prompt: session.prompt.clone(),
        ocr_text,
        app: uia::foreground_app(),
        window_title: title,
        draft: draft.to_vec(),
        // Izuki's "hands": the real controls on screen, numbered, so the
        // model can say "click #7" instead of guessing pixels.
        controls,
        memory: crate::memory::prompt_block()
            + &crate::reminders::prompt_block()
            + &crate::voices::prompt_block()
            + &crate::lessons::prompt_block(&uia::foreground_app(), crate::ext::snapshot_url_cached().as_deref())
            + crate::selfknow::PROMPT
            + if direct_answer_requested(&session.prompt) { DIRECT_ANSWER_PROMPT } else if on_a_test { QUIZ_PROMPT } else { "" },
        windows: uia::open_windows(14),
        page_text,
        think,
    };
    let prep_ms = started.elapsed().as_millis();

    let mut chain = brain_chain();
    if chain.is_empty() {
        return Err(anyhow!("{}", if online() { NO_BRAIN } else { OFFLINE }));
    }
    // The smartest brain to hand goes first. Small models are quick, but they
    // got quiz answers wrong — and on tasks they mostly described the job
    // instead of doing it ("no brain acted" 35 times in one user's log, all
    // from an 11B model). They stay as backups.
    smartest_first(&mut chain);
    let mut plan = ask_racing(&chain, req, prep_ms, wants_action)?;
    // Marks aimed at words go exactly where those words really are.
    anchor_marks(&mut plan.steps, frame);
    // "Remind me…" said while it works the screen: set it, don't say the tag.
    if plan.summary.contains("[REMIND") || plan.summary.contains("[ALARM") {
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
/// Is this PC on the internet? Asked before every AI request, so it's cached
/// for a few seconds and fails in about a second: offline, a cloud brain used
/// to sit on "thinking" for ~22 s before giving up — every time.
pub fn online() -> bool {
    static LAST: parking_lot::Mutex<Option<(bool, std::time::Instant)>> = parking_lot::Mutex::new(None);
    if let Some((up, at)) = *LAST.lock() {
        if at.elapsed() < std::time::Duration::from_secs(if up { 20 } else { 4 }) {
            return up;
        }
    }
    let up = raw_probe() || service_probe();
    if !up {
        eprintln!("[brain] this PC looks offline — only brains on this PC can answer");
    }
    *LAST.lock() = Some((up, std::time::Instant::now()));
    up
}

/// Pinging public DNS by raw IP is quick and works on most home networks —
/// but school, campus and hotel Wi-Fi routinely drop traffic to those IPs
/// while ordinary web browsing is perfectly fine. Judging the internet by
/// them alone made Izuki announce "your internet just dropped", latch into
/// offline, and throw away every cloud brain ("only brains on this PC can
/// answer") while Discord, the browser and the updater all worked.
fn raw_probe() -> bool {
    ["1.1.1.1:443", "8.8.8.8:53", "208.67.222.222:443"].iter().any(|a| {
        a.parse::<std::net::SocketAddr>()
            .is_ok_and(|addr| std::net::TcpStream::connect_timeout(&addr, std::time::Duration::from_millis(900)).is_ok())
    })
}

/// The honest test: can Izuki reach the hosts it actually talks to? Asked
/// only when the raw probes fail, so it costs nothing on a normal network.
fn service_probe() -> bool {
    use std::net::ToSocketAddrs;
    ["generativelanguage.googleapis.com:443", "api.groq.com:443", "api.openai.com:443"]
        .iter()
        .any(|host| {
            host.to_socket_addrs().is_ok_and(|addrs| {
                addrs.take(2).any(|a| {
                    std::net::TcpStream::connect_timeout(&a, std::time::Duration::from_millis(1200)).is_ok()
                })
            })
        })
}

/// The very first thing someone can hit: installed, asked something, and
/// no AI key added yet. "no brain is configured" is what a developer calls
/// it, not what a person needs to be told.
pub(crate) const NO_BRAIN: &str = "I haven't got an AI to think with yet. Add a free key in Settings → Izuki's brain — Google's Gemini takes about a minute and costs nothing.";

/// What to say when the internet's down and no brain on this PC can answer.
pub const OFFLINE: &str = "You're offline right now — check your Wi-Fi, then ask me again.";

pub fn brain_chain() -> Vec<crate::settings::ProviderConfig> {
    let mut chain = brain_chain_inner();
    // Offline: only brains running on this PC can answer — don't wait on the rest.
    // Offline, only what runs on this PC can answer (9Router included).
    if chain.iter().any(|c| !on_this_pc(&c.base_url)) && !online() {
        chain.retain(|c| on_this_pc(&c.base_url));
    }
    chain
}

fn brain_chain_inner() -> Vec<crate::settings::ProviderConfig> {
    let settings = crate::state::store().settings();
    let Some(primary) = settings.provider(settings.active_provider).cloned() else {
        return Vec::new();
    };
    let mut chain = vec![primary];
    if let Some(f) = settings.fallback_provider.and_then(|id| settings.provider(id).cloned()) {
        if f.id != chain[0].id && (!f.api_key.trim().is_empty() || f.on_this_pc()) {
            chain.push(f);
        }
    }
    for p in &settings.providers {
        if !p.api_key.trim().is_empty() && !p.on_this_pc() && !chain.iter().any(|c| c.id == p.id) {
            chain.push(p.clone());
        }
    }
    skip_broken(&mut chain);
    skip_resting(&mut chain);
    skip_local_not_running(&mut chain);
    order_by_speed(&mut chain);
    chain
}

/// A brain on this PC (9Router, Ollama, LM Studio) that isn't running costs
/// ~2.4 s to fail on every first try — after each restart and every time
/// its five-minute rest ran out. A tenth-of-a-second knock on its port says
/// the same thing; the answer is kept for 15 s.
fn skip_local_not_running(chain: &mut Vec<crate::settings::ProviderConfig>) {
    if chain.len() < 2 {
        return;
    }
    // On this PC by its address (9Router is "local" without being Ollama).
    let up: Vec<bool> = chain.iter().map(|c| !on_this_pc(&c.base_url) || local_up(&c.base_url)).collect();
    if up.iter().any(|u| *u) && up.iter().any(|u| !*u) {
        let mut i = 0;
        chain.retain(|_| {
            i += 1;
            up[i - 1]
        });
    }
}

static LOCAL_UP: parking_lot::Mutex<Vec<(String, bool, std::time::Instant)>> = parking_lot::Mutex::new(Vec::new());

fn local_up(base_url: &str) -> bool {
    use std::net::ToSocketAddrs;
    let Some((host, port)) = host_port(base_url) else { return true };
    if let Some(&(_, up, _)) = LOCAL_UP.lock().iter().find(|(u, _, at)| u == base_url && at.elapsed() < std::time::Duration::from_secs(15)) {
        return up;
    }
    // "localhost" is both ::1 and 127.0.0.1 and a server may listen on only
    // one: knock on each. Something can accept the connection and then never
    // answer (a stuck 9Router did: every chat waited 2.4 s on it), so it only
    // counts as running if it replies to a tiny request — within ~0.6 s.
    let began = std::time::Instant::now();
    let budget = std::time::Duration::from_millis(250);
    let https = base_url.trim_start().to_ascii_lowercase().starts_with("https://");
    let path = base_url.split("://").nth(1).and_then(|r| r.find('/').map(|i| r[i..].trim_end_matches('/').to_string())).unwrap_or_default();
    let up = (host.as_str(), port).to_socket_addrs().is_ok_and(|addrs| {
        addrs.into_iter().any(|addr| {
            let left = budget.saturating_sub(began.elapsed());
            if left.is_zero() {
                return false;
            }
            let Ok(mut s) = std::net::TcpStream::connect_timeout(&addr, left.min(std::time::Duration::from_millis(120))) else { return false };
            // An HTTPS server says nothing until a TLS handshake, so for one
            // the connection itself is the answer.
            https || answers(&mut s, &host, &path)
        })
    });
    let mut cache = LOCAL_UP.lock();
    cache.retain(|(u, _, _)| u != base_url);
    cache.push((base_url.to_string(), up, std::time::Instant::now()));
    up
}

/// An address on this PC (localhost, 127.x, ::1).
pub(crate) fn on_this_pc(base_url: &str) -> bool {
    host_port(base_url).is_some_and(|(h, _)| {
        let h = h.to_ascii_lowercase();
        h == "localhost" || h.starts_with("127.") || h == "::1" || h == "0.0.0.0"
    })
}

/// A server that says anything at all to `GET <path>/models` is running.
fn answers(s: &mut std::net::TcpStream, host: &str, path: &str) -> bool {
    use std::io::{Read, Write};
    let wait = std::time::Duration::from_millis(400);
    let _ = s.set_read_timeout(Some(wait));
    let _ = s.set_write_timeout(Some(wait));
    let ask = format!("GET {path}/models HTTP/1.0\r\nHost: {host}\r\nConnection: close\r\n\r\n");
    if s.write_all(ask.as_bytes()).is_err() {
        return false;
    }
    let mut first = [0u8; 1];
    matches!(s.read(&mut first), Ok(n) if n > 0)
}

/// "http://localhost:20128/v1" → ("localhost", 20128).
fn host_port(base_url: &str) -> Option<(String, u16)> {
    let rest = base_url.split("://").nth(1).unwrap_or(base_url);
    let hostport = rest.split('/').next()?;
    let (host, port) = match hostport.rsplit_once(':') {
        Some((h, p)) => (h, p.parse().ok()?),
        None => (hostport, if base_url.starts_with("https") { 443 } else { 80 }),
    };
    (!host.is_empty()).then(|| (host.trim_matches(|c| c == '[' || c == ']').to_string(), port))
}

/// A small model (roughly 12B parameters or fewer): fast, but weak at
/// reasoning — fine for "click #7", not for working out a quiz answer.
fn small_model(model: &str) -> bool {
    let m = model.to_ascii_lowercase();
    let size = m
        .split(|c: char| !(c.is_ascii_alphanumeric() || c == '.'))
        .filter_map(|part| part.strip_suffix('b').and_then(|n| n.parse::<f32>().ok()))
        .next();
    size.is_some_and(|b| b <= 12.0) || ["-nano", "gemma-3-4b", "gemma-3n", "phi-3", "phi-4-mini", "tinyllama"].iter().any(|k| m.contains(k))
}

/// Small models move behind every bigger one (order otherwise kept).
fn smartest_first(chain: &mut Vec<crate::settings::ProviderConfig>) {
    if chain.iter().any(|c| !small_model(&c.model)) {
        chain.sort_by_key(|c| small_model(&c.model));
    }
}

/// Brains told to slow down ("too many requests"), and until when. Asking
/// them again right away only burns more of the quota and adds a failure.
static RESTING: parking_lot::Mutex<Vec<(crate::settings::ProviderId, std::time::Instant)>> =
    parking_lot::Mutex::new(Vec::new());

/// How long a "too many requests" answer means leaving that brain alone:
/// a used-up daily quota for an hour, a per-minute limit for a minute.
fn rest_for(err: &str) -> Option<std::time::Duration> {
    let e = err.to_ascii_lowercase();
    // A brain on this PC that isn't running (9Router, Ollama, LM Studio
    // closed): every look spent ~2.4 s failing to reach it. Leave it be for
    // five minutes; it's picked up again once it's back.
    let local = e.contains("localhost") || e.contains("127.0.0.1");
    if local && (e.contains("error sending request") || e.contains("connection refused") || e.contains("actively refused")) {
        return Some(std::time::Duration::from_secs(300));
    }
    // "High demand" / overloaded (503): the free tier is swamped. Asking it
    // again on the next look cost 5–12 s each time just to get the same
    // error — rest it a minute and go straight to a brain that's answering.
    if e.contains("503") || e.contains("high demand") || e.contains("overloaded") || e.contains("unavailable") {
        return Some(std::time::Duration::from_secs(60));
    }
    // "Request too large for model" (Groq's free tier caps one request's
    // size): only this big request didn't fit — the brain is fine for the
    // next, smaller one. Resting it a minute lost the fastest brain.
    if e.contains("request too large") || e.contains("too large for model") || e.contains("context length") {
        return None;
    }
    let limited = e.contains("429") || e.contains("too many requests") || e.contains("rate-limit") || e.contains("rate limit");
    if !limited {
        return None;
    }
    if e.contains("quota") || e.contains("per day") || e.contains("daily") {
        Some(std::time::Duration::from_secs(60 * 60))
    } else if let Some(d) = retry_after(&e) {
        // The provider said when: "Please try again in 7.2s" — no longer.
        Some(d.clamp(std::time::Duration::from_secs(5), std::time::Duration::from_secs(15 * 60)))
    } else {
        Some(std::time::Duration::from_secs(60))
    }
}

/// A remote brain that didn't answer at all (no reply, timed out) while
/// this PC's internet is fine: the trouble is that server, so it rests 90 s
/// (longer if it keeps happening) instead of costing ~14 s on every look.
/// With the internet down, nothing is rested — that's not the brain's fault.
fn unreachable_rest(err: &str) -> Option<std::time::Duration> {
    let e = err.to_ascii_lowercase();
    let local = e.contains("localhost") || e.contains("127.0.0.1");
    let silent = e.contains("error sending request") || e.contains("timed out") || e.contains("operation timed out") || e.contains("connection reset");
    (!local && silent && online()).then(|| std::time::Duration::from_secs(90))
}

/// "please try again in 7.2s", "retry in 1m30s", "retry after 12 seconds",
/// "retry_after: 20" → that long.
fn retry_after(e: &str) -> Option<std::time::Duration> {
    let at = ["try again in ", "retry in ", "retry after ", "retry_after\":", "retry_after:", "retry-after:", "retrydelay\":\""]
        .iter()
        .find_map(|k| e.find(k).map(|i| i + k.len()))?;
    let rest: Vec<char> = e[at..].trim_start_matches([' ', '"']).chars().take(16).collect();
    // Number+unit pairs: "1m30s", "7.2s", "250ms", "12 seconds", "20".
    let (mut secs, mut i, mut any) = (0.0f64, 0usize, false);
    while i < rest.len() {
        let start = i;
        while i < rest.len() && (rest[i].is_ascii_digit() || rest[i] == '.') {
            i += 1;
        }
        if i == start {
            break;
        }
        let v: f64 = rest[start..i].iter().collect::<String>().parse().unwrap_or(0.0);
        while i < rest.len() && rest[i] == ' ' {
            i += 1;
        }
        let unit: String = rest[i..].iter().take_while(|c| c.is_ascii_alphabetic()).collect();
        i += unit.len();
        any = true;
        secs += match unit.as_str() {
            "ms" | "msec" | "milliseconds" => v / 1000.0,
            "m" | "min" | "mins" | "minute" | "minutes" => v * 60.0,
            "h" | "hr" | "hour" | "hours" => v * 3600.0,
            _ => v,
        };
        if !matches!(unit.as_str(), "h" | "m") {
            break;
        }
    }
    (any && secs > 0.0).then(|| std::time::Duration::from_millis((secs * 1000.0).round() as u64))
}

/// Rate limits again and again from one brain: each rest twice the last
/// (within ten minutes of the previous one), up to fifteen minutes.
static STRIKES: parking_lot::Mutex<Vec<(crate::settings::ProviderId, u32, std::time::Instant)>> = parking_lot::Mutex::new(Vec::new());

fn escalate(id: crate::settings::ProviderId, base: std::time::Duration) -> std::time::Duration {
    if base >= std::time::Duration::from_secs(60 * 60) {
        return base;
    }
    let mut s = STRIKES.lock();
    let now = std::time::Instant::now();
    s.retain(|(_, _, at)| now.duration_since(*at) < std::time::Duration::from_secs(600));
    let n = match s.iter_mut().find(|(p, _, _)| *p == id) {
        Some(entry) => {
            entry.1 += 1;
            entry.2 = now;
            entry.1
        }
        None => {
            s.push((id, 1, now));
            1
        }
    };
    (base * 2u32.saturating_pow(n.saturating_sub(1).min(5))).min(std::time::Duration::from_secs(15 * 60))
}

/// Remember what a failure says about a brain: gone for good (bad key, no
/// credits) or just resting (rate limits).
fn note_failure(id: crate::settings::ProviderId, err: &str) {
    if is_hopeless(err) {
        let e = err.to_ascii_lowercase();
        if ["no credits", "insufficient_quota", "billing", "rejected the key", "unauthorized"].iter().any(|w| e.contains(w)) || has_status(&e, "401") || has_status(&e, "402") {
            let mut o = OUT_OF_CREDIT.lock();
            if !o.contains(&id) {
                o.push(id);
                eprintln!("[brain] {id:?} can't answer (no credits or a bad key) — leaving it out for 6 hours");
            }
        }
        mark_broken(id);
    } else if let Some(d) = rest_for(err).or_else(|| unreachable_rest(err)) {
        // When the provider said exactly when it's back ("Please try again in
        // 15s"), that *is* the answer. Doubling it benched the fastest free
        // brain for twice as long as it asked — the log has a 15 s window
        // becoming a 30 s rest — and the wait looked like a freeze.
        let stated = retry_after(&err.to_ascii_lowercase()).is_some();
        let d = if stated { d } else { escalate(id, d) };
        let mut r = RESTING.lock();
        r.retain(|(p, _)| *p != id);
        r.push((id, std::time::Instant::now() + d));
        let why = if rest_for(err).is_some() { "rate-limited or busy" } else { "not answering" };
        eprintln!("[brain] resting {id:?} for {} s ({why})", d.as_secs());
    }
}

/// Seconds until a resting brain may be asked again — the soonest one. Long
/// rests (a local brain that isn't running, a used-up daily quota) are left
/// out on purpose: those mean "use another brain", not "wait five minutes".
fn provider_wake() -> Option<std::time::Duration> {
    let mut r = RESTING.lock();
    let now = std::time::Instant::now();
    r.retain(|(_, until)| *until > now);
    r.iter()
        .map(|(_, until)| until.saturating_duration_since(now))
        .filter(|d| *d <= std::time::Duration::from_secs(180))
        .min()
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

/// The words that say what a round set out to do ("Opening Blackboard in
/// Chrome now" → opening, blackboard, chrome), filler left out.
fn goal_words(summary: &str) -> Vec<String> {
    const FILLER: &[&str] = &[
        "now", "that", "this", "your", "with", "from", "here", "just", "then", "again", "look", "looks", "like", "right",
        "okay", "alright", "sure", "there", "will", "have", "for", "you", "the", "and", "let", "oops", "seems", "page",
        "really", "quick", "quickly", "back",
    ];
    let mut w: Vec<String> = summary
        .to_lowercase()
        .split(|c: char| !c.is_alphanumeric())
        .filter(|t| t.len() >= 3 && !FILLER.contains(t))
        .map(str::to_string)
        .collect();
    w.sort();
    w.dedup();
    w
}

/// A round that says it's doing something ("Opening Blackboard for you now",
/// "Let me wait for it to load") — as opposed to an answer or a refusal.
/// With no step attached, the task isn't over: the step is still to come.
fn promises_action(summary: &str) -> bool {
    let s = summary.to_lowercase().replace('\u{2019}', "'");
    // "Done — saved it, now checking…" reports a finish, not a promise.
    let first = s.split(|c: char| !c.is_alphanumeric()).find(|w| !w.is_empty()).unwrap_or("");
    if ["done", "finished", "saved", "sent", "completed"].contains(&first) || s.starts_with("all set") || s.starts_with("all done") {
        return false;
    }
    // Each clause on its own: a refusal speaks only for its clause ("I can't
    // open that right now" isn't a promise), but another clause can still
    // promise ("I didn't type it, gonna run it now"), and so can a plain
    // promise after the refusal in the same clause ("I couldn't find it so
    // let me scroll down").
    const REFUSES: &[&str] = &["can't", "cannot", "can not", "unable", "won't", "not able", "isn't possible", "not possible", "don't have access", "couldn't", "could not", "didn't", "did not", "wasn't"];
    const STRONG: &[&str] = &["let me", "i'll", "i will", "i'm going to", "gonna", "finna", "about to", "imma", "i'ma"];
    let s = s.replace("let me know", "");
    let s = s
        .split(['.', '!', '?', ',', ';', '\u{2014}', '\u{2013}'])
        .filter_map(|c| match REFUSES.iter().filter_map(|p| c.rfind(p).map(|i| i + p.len())).max() {
            None => Some(c.to_string()),
            Some(end) => STRONG.iter().any(|p| c[end..].contains(p)).then(|| c[end..].to_string()),
        })
        .collect::<Vec<_>>()
        .join(", ");
    const DOING: &[&str] = &[
        "let me", "i'll", "i will", "i'm going to", "on it", "getting you", "get you", "bringing up", "pulling up",
        "wait for", "waiting for", "still loading", "finish loading", "here we go", "one sec", "hang on", "hold on",
        "right now", "right away", "i got you", "i gotchu", "gotchu", "imma", "i'ma", "fixing to",
    ];
    if DOING.iter().any(|p| s.contains(p)) {
        return true;
    }
    let words: Vec<&str> = s.split(|c: char| !c.is_alphanumeric()).filter(|w| !w.is_empty()).collect();
    // "Gonna", "about to", "going to": Izuki's own intent — not news about
    // something else ("it's gonna rain", "your battery is about to die").
    let news = |i: usize| i > 0 && ["it", "s", "is", "are", "was", "were", "that", "thats", "they", "re", "battery", "pc", "windows", "computer", "laptop"].contains(&words[i - 1]);
    const LOOSE: &[&[&str]] = &[&["gonna"], &["finna"], &["about", "to"], &["bout", "to"], &["going", "to"]];
    if (0..words.len()).any(|i| !news(i) && LOOSE.iter().any(|p| words[i..].starts_with(p))) {
        return true;
    }
    // "Opening…", "Clicking the first link now", "Signing you in".
    const VERBS: &[&str] = &[
        "opening", "clicking", "signing", "logging", "typing", "searching", "launching", "starting", "scrolling", "selecting",
        "picking", "heading", "switching", "loading", "closing", "playing", "pressing", "tapping", "filling", "entering",
        "navigating", "going", "checking", "finding", "moving", "dragging", "saving", "sending", "pasting", "copying",
        "hitting", "smashing", "punching", "choosing", "accepting", "confirming", "continuing", "dismissing", "running", "clearing",
        "cleaning", "deleting", "removing", "emptying", "freeing", "installing", "downloading", "fixing", "setting", "changing",
        "updating", "quantizing", "aligning", "tuning",
    ];
    // The first dozen words: a chatty opener ("Say less, I got you fam —")
    // mustn't hide the promise behind it. Not a state ("your PC is running
    // Windows 11", "Windows was updating").
    let state = |i: usize| i > 0 && ["is", "are", "was", "were", "been", "be", "keeps", "keep", "s", "re"].contains(&words[i - 1]);
    words.iter().take(12).enumerate().any(|(i, w)| VERBS.contains(w) && !state(i))
}

/// Empty rounds in a row (no step, not done) allowed while a task is waiting
/// on a page or about to act, before Izuki says it's stuck.
const MAX_IDLE_ROUNDS: u32 = 4;

/// Two rounds after the same thing: one's words are all in the other, or most are shared.
fn same_goal(a: &[String], b: &[String]) -> bool {
    if a.is_empty() || b.is_empty() {
        return false;
    }
    let shared = a.iter().filter(|w| b.contains(w)).count();
    let (small, big) = if a.len() <= b.len() { (a.len(), b.len()) } else { (b.len(), a.len()) };
    (small >= 2 && shared == small) || shared as f32 / (small + big - shared) as f32 >= 0.6
}

/// A status code standing alone ("(402 Payment Required)"), not inside a
/// bigger number — Groq's rate-limit text says "Used 4029", which used to
/// count as 402 (no credits) and shut the fastest brain out for 6 hours.
fn has_status(e: &str, code: &str) -> bool {
    let b = e.as_bytes();
    e.match_indices(code).any(|(i, m)| {
        let before = i.checked_sub(1).map(|j| b[j]);
        let after = b.get(i + m.len()).copied();
        !before.is_some_and(|c| c.is_ascii_alphanumeric()) && !after.is_some_and(|c| c.is_ascii_alphanumeric())
    })
}

/// Worth another try in a few seconds: a busy free tier, a queue that timed
/// out, a connection that blipped. A rejected key or a wrong model name is
/// not — asking again only makes the person wait for the same failure.
fn temporary_trouble(err: &str) -> bool {
    let e = err.to_ascii_lowercase();
    [
        "error sending request", "timed out", "timeout", "connection", "network", "unreachable",
        "no such host", "dns", "429", "too many requests", "rate limit", "rate-limit",
        "overloaded", "unavailable",
    ]
    .iter()
    .any(|p| e.contains(p))
        || ["500", "502", "503", "504"].iter().any(|c| has_status(&e, c))
}

/// An error that won't fix itself by asking again in a minute.
fn is_hopeless(err: &str) -> bool {
    let e = err.to_ascii_lowercase();
    let out_of_money = ["no credits", "insufficient_quota", "billing"].iter().any(|p| e.contains(p));
    // "Too many requests" is waiting, not broken — unless it says the money ran out.
    let limited = has_status(&e, "429") || e.contains("too many requests") || e.contains("rate limit") || e.contains("rate-limit");
    if limited && !out_of_money {
        return false;
    }
    out_of_money
        || ["no active credentials", "rejected the key", "unauthorized", "connection refused"].iter().any(|p| e.contains(p))
        || ["401", "402", "403", "404"].iter().any(|c| has_status(&e, c))
        // Can't reach a *local* brain (Ollama/9Router not running) — but a
        // busy cloud queue timing out is just slow, not broken.
        || (e.contains("error sending request") && (e.contains("localhost") || e.contains("127.0.0.1")))
}

fn mark_broken(id: crate::settings::ProviderId) {
    let mut b = BROKEN.lock();
    b.retain(|(p, _)| *p != id);
    b.push((id, std::time::Instant::now()));
}

/// Out of credits / a rejected key won't fix itself soon — leave that brain
/// alone for hours (it was being asked on every message, costing seconds
/// each time). Anything else broken is tried again after ten minutes.
static OUT_OF_CREDIT: parking_lot::Mutex<Vec<crate::settings::ProviderId>> = parking_lot::Mutex::new(Vec::new());

fn broken_for(id: crate::settings::ProviderId) -> std::time::Duration {
    if OUT_OF_CREDIT.lock().contains(&id) {
        std::time::Duration::from_secs(6 * 3600)
    } else {
        BROKEN_FOR
    }
}

/// Leave out brains known to be unable to answer (for a while) — asking
/// them only burned the racing slots. That includes the chosen brain: a
/// local one that isn't running (9Router, Ollama closed) used to be asked
/// first on every look and every chat message, ~2.4 s wasted each time.
/// If every brain is down, the chosen one is kept so there's still a try.
fn skip_broken(chain: &mut Vec<crate::settings::ProviderConfig>) {
    let mut b = BROKEN.lock();
    b.retain(|(p, at)| at.elapsed() < broken_for(*p));
    let working: Vec<_> = chain.iter().filter(|c| !b.iter().any(|(p, _)| *p == c.id)).cloned().collect();
    if !working.is_empty() {
        if working.len() < chain.len() {
            eprintln!("[brain] skipping {} brain(s) that can't be reached right now", chain.len() - working.len());
        }
        *chain = working;
    } else {
        chain.truncate(1);
    }
}

/// How much a brain knows and reasons, roughly (higher is stronger). The
/// paid frontier models top it, then Gemini, then the big free ones; the
/// small fast ones last.
pub fn strength(c: &crate::settings::ProviderConfig) -> u8 {
    use crate::settings::ProviderId as P;
    let m = c.model.to_lowercase();
    match c.id {
        P::Anthropic | P::Openai | P::Xai => 9,
        P::Gemini if m.contains("pro") => 9,
        P::Gemini if m.contains("lite") => 6,
        P::Gemini => 8,
        P::Mistral if m.contains("large") || m.contains("medium") => 7,
        P::Groq if m.contains("70b") || m.contains("120b") || m.contains("kimi") || m.contains("qwen3") => 6,
        _ if m.contains("405b") || m.contains("70b") || m.contains("deepseek") => 6,
        _ => 4,
    }
}

/// A question that needs real knowledge or reasoning (not "hi" or "thanks"):
/// explaining, comparing, working something out, or a long ask.
pub fn needs_thought(asked: &str) -> bool {
    let s = format!(" {} ", asked.to_lowercase());
    let words = s.split_whitespace().count();
    words >= 18
        || [" why ", " how does", " how do ", " how is ", " how can ", " explain", " compare", " difference between", " analy", " solve", " calculate", " prove", " step by step", " what causes", " pros and cons", " should i ", " plan ", " strategy", " write ", " essay", " summar", " teach me", " understand"]
            .iter()
            .any(|w| s.contains(w))
}

/// For a thinking question: the strongest brain that's working first (the
/// rest stay as backups). Speed still wins for small talk.
pub fn prefer_strong(chain: &mut [crate::settings::ProviderConfig]) {
    if chain.len() < 2 {
        return;
    }
    let best = (0..chain.len()).max_by_key(|i| (strength(&chain[*i]), std::cmp::Reverse(*i))).unwrap_or(0);
    if best != 0 && strength(&chain[best]) > strength(&chain[0]) {
        eprintln!("[brain] a thinking question — asking {} first", chain[best].label);
        chain[..=best].rotate_right(1);
    }
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

/// The task's to-do list, for the Island: [{text, done}] (empty: none).
const TODO_EVENT: &str = "izuki://task-todo";

/// The list as the model sent it now — plus anything still open from before
/// that it left out (a shortened list must not quietly drop unfinished work).
fn merge_todo(old: &[(String, bool)], new: &[(String, bool)]) -> Vec<(String, bool)> {
    let key = |t: &str| t.to_lowercase().split_whitespace().collect::<Vec<_>>().join(" ");
    let mut out = new.to_vec();
    for (text, done) in old {
        if !done && !new.iter().any(|(t, _)| key(t) == key(text)) {
            out.push((text.clone(), false));
        }
    }
    // Too long: finished items go first, so open work is never cut.
    while out.len() > 12 {
        match out.iter().position(|(_, d)| *d) {
            Some(i) => {
                out.remove(i);
            }
            None => out.truncate(12),
        }
    }
    out
}

/// "[x] Open Blackboard; [ ] Open Assignments" — the list as shown back to the model.
fn todo_line(todo: &[(String, bool)]) -> String {
    todo.iter().map(|(t, d)| format!("[{}] {t}", if *d { "x" } else { " " })).collect::<Vec<_>>().join("; ")
}

/// The snag left when Izuki waited ten minutes for you to come back to its tab.
const TAB_WAIT_OVER: &str = "tab_wait_over: you stayed on another tab";

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
        // A model's choice, not a fault in Izuki: logged, not reported.
        eprintln!("[brain] no brain acted on a request to do something (best was {} {})", plan.provider, plan.model);
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

/// One short, honest sentence for "nothing could answer", instead of every
/// provider's raw refusal joined together.
///
/// What the user used to be shown, in full: "groq is rate-limiting you (429
/// Too Many Requests): Rate limit reached for model `qwen/qwen3.8-27b` in
/// organization `org_01m3…` service tier `on_demand` on input tokens per
/// minute (ITPM): Limit 7000, Used 1291, Requested 6038…" and then the same
/// again for every other brain. It is unreadable, it says nothing anyone can
/// act on, and it prints an account id that belongs to nobody but them.
pub(crate) fn why_none_answered(errors: &[String]) -> String {
    let all = errors.join(" ").to_lowercase();
    let any = |words: &[&str]| words.iter().any(|w| all.contains(w));
    // Out of credit is not the same as busy: waiting won't fix it.
    if any(&["no credits remaining", "insufficient_quota", "exceeded your current quota", "billing"]) {
        return "That AI has no free credit left. Add another free key in Settings \u{2192} Izuki's brain \u{2014} Google's Gemini and Groq both have a free one.".into();
    }
    if any(&["rate limit", "rate-limiting", "429", "too many requests", "quota"]) {
        return "All your AI brains are busy right now \u{2014} free ones only allow so much a minute. Give it a moment and ask again, or add another free key in Settings \u{2192} Izuki's brain so there's one to spare.".into();
    }
    if any(&["api key", "unauthorized", "401", "403", "invalid key", "no credential"]) {
        return "That AI didn't accept the key. Check it in Settings \u{2192} Izuki's brain, or paste a fresh one.".into();
    }
    if any(&["error sending request", "dns", "timed out", "timeout", "connection", "unreachable", "network"]) {
        // "Usually the internet" sent people to check Wi-Fi that was fine:
        // a school or work network can block the AI service itself.
        return "I couldn't reach the AI just now \u{2014} it may be your internet, or this network blocking it. Try again, or switch networks.".into();
    }
    if any(&["overloaded", "503", "500", "internal server error", "unavailable"]) {
        return "That AI is having a moment (its servers, not your PC). Try again shortly, or add another free key in Settings so Izuki has a spare.".into();
    }
    "None of the AI brains could answer that one. Give it a moment and try again \u{2014} if it keeps happening, add another free key in Settings \u{2192} Izuki's brain.".into()
}

/// Anything shown to a person: a provider's raw refusal becomes the plain
/// sentence above; everything else (Izuki's own clear messages, like "that's
/// a PDF — open it on screen") is left exactly as it is.
pub(crate) fn plain_error(e: &str) -> String {
    let low = e.to_lowercase();
    let provider = [
        "rate-limiting", "rate limit", "429", "too many requests", "no credits", "insufficient_quota",
        "error sending request", "401 unauthorized", "invalid api key", "503", "internal server error",
    ]
    .iter()
    .any(|w| low.contains(w));
    if provider {
        why_none_answered(&[e.to_string()])
    } else {
        e.to_string()
    }
}

fn ask_racing(
    chain: &[crate::settings::ProviderConfig],
    req: VisionRequest,
    prep_ms: u128,
    wants_action: bool,
) -> Result<VisionPlan> {
    use std::sync::{mpsc, Arc};
    use std::time::{Duration, Instant};

    // Every key's other strong free models join in (free limits are per
    // model), resting ones and — to drive the screen — tiny ones left out.
    let expanded = crate::freebrains::expand(chain.to_vec(), wants_action);
    // Bound spend per look, even when every configured provider is failing
    // (a rate-limited model says so in well under a second).
    let chain = &expanded[..expanded.len().min(6)];
    if chain.is_empty() {
        // "may be resting or too small" was true and useless: it read like a
        // settings problem, it named nothing the retry loop recognises as
        // temporary, and so the loop cut itself to two tries and threw the
        // task away on a single per-minute limit. Say when it's back instead
        // — "rate limited" is also what tells the loop to wait and retry.
        return Err(match crate::freebrains::soonest_wake() {
            Some(d) => anyhow!(
                "Every free AI I have is rate limited for another {}s — I'll wait for the first one back.",
                d.as_secs().max(1)
            ),
            None => anyhow!(
                "None of the AI models set up can drive a screen — they're too small or have no key. Add a vision model in Settings → Izuki's brain."
            ),
        });
    }
    let economy = crate::state::try_store().map(|s| s.settings().economy_mode).unwrap_or(true);
    let began = Instant::now();
    let mut last_launch = began;
    let req = Arc::new(req);
    let (tx, rx) = mpsc::channel::<(usize, Result<VisionPlan>, Duration)>();
    let launch = |i: usize| {
        crate::state::trace(format!("Asking {}…", crate::state::short_name(&chain[i].label)));
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
                let e = e.to_string();
                // One model rate-limited, others on the same key free: rest just it.
                match rest_for(&e) {
                    // Denied for this key (a model it can't use at all): a day, not ten minutes.
                    _ if e.contains("denied access to model") => crate::freebrains::rest_model(&cfg, Duration::from_secs(24 * 3600)),
                    Some(d) if crate::freebrains::has_siblings(&cfg) && !is_hopeless(&e) => crate::freebrains::rest_model(&cfg, d),
                    _ => note_failure(cfg.id, &e),
                }
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
                    last_launch = Instant::now();
                } else if finished == launched {
                    let (_, plan) = fallback.take().expect("just stored");
                    return Ok(last_resort(plan, wants_action));
                }
            }
            Ok((i, Ok(mut plan), took)) => {
                // Only the plan that won gets the sharp-eye look — not every
                // brain's in the race.
                crate::sharpeye::refine(&mut plan.steps, &req);
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
                if launched < chain.len() {
                    crate::state::trace(format!("{} is busy — asking another…", crate::state::short_name(&chain[i].label)));
                }
                errors.push(format!("{}: {e}", chain[i].label));
                finished += 1;
                if launched < chain.len() {
                    launch(launched);
                    launched += 1;
                    last_launch = Instant::now();
                    // A quick "no" (rate-limited, out of quota) says nothing about
                    // the next brain's speed: ask two at once, so one that hangs
                    // (14 s on a busy day) isn't the whole wait.
                    if took < Duration::from_millis(2500) && launched < chain.len() && launched - finished < 2 {
                        launch(launched);
                        launched += 1;
                    }
                } else if finished == launched {
                    return match fallback.take() {
                        Some((_, plan)) => Ok(last_resort(plan, wants_action)),
                        None => {
                            // The full reasons go to the log, where they help;
                            // the user gets one sentence they can act on.
                            eprintln!("[brain] nothing answered: {}", errors.join("; "));
                            Err(anyhow!("{}", why_none_answered(&errors)))
                        }
                    };
                }
            }
            Err(mpsc::RecvTimeoutError::Timeout) => {
                // A brain that's been slow lately gets one backup even in economy
                // mode — a free model's 20 s wait shouldn't be the whole wait.
                let slow_first = expected_ms(chain[0].id).is_some_and(|ms| ms > 6_000.0);
                // Whatever is running now has said nothing for 4 s: one backup,
                // even when saving credits — never more than two at a time.
                let stuck = last_launch.elapsed() >= Duration::from_secs(4);
                if (!economy || slow_first || stuck) && launched < chain.len() && launched - finished < 2 && last_launch.elapsed() >= hedge_after {
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
    let execution_context = crate::execution::current();

    std::thread::Builder::new()
        .name("izuki-act".into())
        .spawn(move || {
            let _execution = crate::execution::attach(execution_context);
            run_steps_blocking(&app, &store, &steps, &|| task_alive(task));
            on_done();
        })
        .ok();
}

/// Why the last run of steps stopped, when it's something the brain can fix
/// on its next look (a window on top of the button, a greyed-out button).
static STEP_SNAG: Mutex<Option<String>> = Mutex::new(None);

/// What the screen is being worked for right now (the agent's task, a named
/// click) and its number, so each step can be checked against it; empty for
/// replays.
static WORK_TASK: Mutex<(u64, String)> = Mutex::new((0, String::new()));
static WORK_SEQ: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);

/// Steps stopped on purpose (FL's MIDI settings without Izuki's link): which
/// task's, and what to say instead.
static FL_STOP: Mutex<Option<(u64, String)>> = Mutex::new(None);

/// One task's hold on `WORK_TASK`, for as long as it lives. A task finishing
/// late never clears or takes the next task's.
struct Working(u64);

impl Working {
    fn on(task: &str) -> Self {
        let id = WORK_SEQ.fetch_add(1, std::sync::atomic::Ordering::SeqCst) + 1;
        *WORK_TASK.lock() = (id, task.to_string());
        Working(id)
    }

    /// This task's steps were stopped on purpose: what to say instead.
    fn stopped(&self) -> Option<String> {
        let mut stop = FL_STOP.lock();
        if stop.as_ref().is_some_and(|(id, _)| *id == self.0) {
            stop.take().map(|(_, said)| said)
        } else {
            None
        }
    }
}

impl Drop for Working {
    fn drop(&mut self) {
        let mut w = WORK_TASK.lock();
        if w.0 == self.0 {
            *w = (0, String::new());
        }
    }
}

/// Run `steps` on this thread. `true` if every step ran (not stopped and
/// no step failed).
fn run_steps_blocking(app: &AppHandle, store: &Arc<Store>, steps: &[ActionStep], alive: &dyn Fn() -> bool) -> (bool, usize) {
            if !crate::execution::allowed() { return (false, 0); }
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
            // When Izuki last touched the PC itself, so input after that is yours.
            let own = std::cell::Cell::new(LAST_OWN.lock().unwrap_or_else(std::time::Instant::now));

            let run = || {
                for (i, step) in steps.iter().enumerate() {
                    if crate::execution::charge(crate::execution::Work::Action).is_err() { return false; }
                    if !alive() {
                        let _ = app.emit(events::STATUS, StatusEvent::info("Stopped."));
                        return false;
                    }
                    // A step earlier in this same run may have opened FL's MIDI
                    // settings: never press or type there without Izuki's link.
                    // (Replays too: with no task, nothing exempts the step.)
                    if matches!(step.action, Intent::Auto | Intent::Click | Intent::DoubleClick | Intent::RightClick | Intent::Type | Intent::Key) {
                        let (id, task) = WORK_TASK.lock().clone();
                        if let Some(said) = crate::flstudio::midi_window_guard(&task) {
                            eprintln!("[agent] in FL's MIDI settings without Izuki's link — stopping before the step");
                            *FL_STOP.lock() = Some((id, said));
                            return false;
                        }
                    }

                    // The ink belongs to the screen it was drawn on: anything that
                    // changes the page takes the old marks away first, so they
                    // never sit over the next question's answers.
                    if matches!(
                        step.action,
                        Intent::Auto | Intent::Click | Intent::DoubleClick | Intent::RightClick | Intent::Type | Intent::Drag | Intent::Scroll | Intent::Key | Intent::OpenApp | Intent::OpenUrl | Intent::Search | Intent::PlayYoutube
                    ) {
                        let _ = app.emit("izuki://pen-clear", ());
                    }
                    // Pointing is only seen on the overlay — make sure it's up.
                    if matches!(step.action, Intent::Point | Intent::Draw) {
                        let _ = crate::overlay::ensure_caption_visible(app);
                    }
                    // Tell the overlay's hand where it is going before we move
                    // the real pointer, so the animation leads rather than trails.
                    // (Instant skills happen nowhere on screen — no hand.)
                    let placeless = matches!(step.action, Intent::OpenApp | Intent::OpenUrl | Intent::Search | Intent::PlayYoutube);
                    // Switched to another app? Izuki keeps working in its own
                    // window behind yours (automation::execute_behind).
                    uia::follow_or_hold(person_touched(own.get()));
                    // (Working in a tab you aren't looking at counts as behind:
                    // nothing there uses your mouse or keyboard.)
                    let behind = uia::working_behind().is_some() || crate::ext::in_tab_mode();
                    // You grabbed the mouse or keyboard in the same window:
                    // let go until you pause, then take a fresh look.
                    if !placeless && !behind {
                        match yield_to_user(app, own.get(), alive) {
                            Yielded::No => {}
                            Yielded::WaitedSameWindow if can_resume_after_input(step) => {}
                            Yielded::Busy => {
                                *STEP_SNAG.lock() = Some(USER_WAIT_OVER.into());
                                return false;
                            }
                            Yielded::Moved | Yielded::WaitedSameWindow => {
                                if !alive() {
                                    let _ = app.emit(events::STATUS, StatusEvent::info("Stopped."));
                                    return false;
                                }
                                *STEP_SNAG.lock() = Some(
                                    "paused: you used the PC while I worked — checking the current target before continuing".into(),
                                );
                                return false;
                            }
                        }
                    }
                    let highlight = settings.click_highlight
                        && matches!(step.action, Intent::Click | Intent::DoubleClick | Intent::RightClick | Intent::Auto | Intent::Type)
                        && (step.x != 0 || step.y != 0);
                    if !placeless && !behind {
                    let _ = app.emit(
                        events::HAND,
                        HandCommand {
                            highlight,
                            x: step.x,
                            y: step.y,
                            x2: step.x2,
                            y2: step.y2,
                            action: step.action,
                            duration_ms: move_ms,
                            label: Some(format!("{}/{}", i + 1, steps.len())),
                            shape: step.shape.clone(),
                            text: if step.action == Intent::Draw { step.text_to_type.clone() } else { None },
                            desktop: Some({
                                let b = capture::virtual_bounds();
                                crate::model::DesktopBounds { x: b.x, y: b.y, w: b.w, h: b.h, scale: 1.0 }
                            }),
                        },
                    );
                    }

                    // "Show where I'll click": a moment to see the box first.
                    if highlight && !placeless && !behind {
                        // In short beats, so Stop lands at once.
                        for _ in 0..10 {
                            std::thread::sleep(Duration::from_millis(50));
                            if !alive() {
                                let _ = app.emit(events::STATUS, StatusEvent::info("Stopped."));
                                return false;
                            }
                        }
                    }
                    let evidence = match crate::execution::begin_step(crate::mission_journal::EvidenceKind::DesktopAction, &format!("{:?}", step.action), None) {
                        Ok(evidence) => evidence,
                        Err(_) => return false,
                    };
                    // A window's minimise / maximise / close buttons (its top-right
                    // corner), alt+f4 or win+d, when the task didn't ask: a slip
                    // that minimised FL Studio three times — and close is right next
                    // to minimise. Never clicked or pressed.
                    let slip = match step.action {
                        Intent::Click | Intent::DoubleClick | Intent::Auto | Intent::Drag => uia::window_button_at(step.x, step.y),
                        Intent::Key => match step.key.as_deref().map(|k| k.to_lowercase().replace(' ', "")).as_deref() {
                            Some("alt+f4") | Some("ctrl+q") => Some("close"),
                            Some("win+d") | Some("win+m") | Some("win+down") => Some("minimise"),
                            _ => None,
                        },
                        _ => None,
                    };
                    if let Some(which) = slip {
                        let task = WORK_TASK.lock().1.clone();
                        if !asked_for_window(&task, which) {
                            eprintln!("[agent] that step would {which} a window the task didn't ask about — not done");
                            *STEP_SNAG.lock() = Some(format!(
                                "Not done: that step would {which} a window (its {which} button in the top-right corner, or the shortcut), \
                                 and the task didn't ask for that — closing an app can lose the person's work. Aim at the control you \
                                 meant (use its target id), press esc for a menu or pop-up, and never minimise, maximise or close a \
                                 window unless asked."
                            ));
                            return false;
                        }
                    }
                    // Clicking the taskbar button of the window that's already in
                    // front minimises it (Windows' toggle) — "switch to FL Studio"
                    // while FL was open hid it, again and again.
                    let front_before = (matches!(step.action, Intent::Click | Intent::Auto)
                        && uia::on_taskbar(step.x, step.y)
                        && !asked_for_window(&WORK_TASK.lock().1, "minimise"))
                    .then(uia::front_raw)
                    .flatten();
                    match automation::execute(step, move_ms, settings.magnetic_hand, settings.dry_run)
                    {
                        Ok(detail) => {
                            executed.set(i + 1);
                            if let Some(raw) = front_before {
                                // (The minimise animation takes a moment.)
                                std::thread::sleep(Duration::from_millis(350));
                                if let Some(title) = uia::restore_if_minimised(raw) {
                                    eprintln!("[agent] a taskbar click minimised \"{title}\", which was already in front — put it back");
                                    *STEP_SNAG.lock() = Some(format!(
                                        "\"{title}\" was already open in front — clicking its taskbar button minimised it, so Izuki put it straight back. \
                                         It's in front now: carry on in it, and never click the taskbar to switch to a window that's already in front."
                                    ));
                                }
                            }
                            if let Some(evidence) = evidence {
                                if evidence.finish(crate::mission_journal::EvidenceOutcome::Returned).is_err() { return false; }
                            }
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
                        Err(e) if e.to_string().starts_with("needs_front:") && crate::ext::in_tab_mode() => {
                            // In a tab you aren't looking at: never pull you
                            // over to it — wait until you go back there yourself.
                            let _ = app.emit(
                                events::STATUS,
                                StatusEvent::working("Izuki's tab needs the screen for the next step — it carries on when you go back to that tab."),
                            );
                            let until = std::time::Instant::now() + Duration::from_secs(600);
                            while alive() && std::time::Instant::now() < until && crate::ext::check_tab_hidden() {
                                std::thread::sleep(Duration::from_millis(1000));
                            }
                            if !alive() {
                                let _ = app.emit(events::STATUS, StatusEvent::info("Stopped."));
                                return false;
                            }
                            if crate::ext::in_tab_mode() {
                                // Ten minutes and you're still elsewhere: stop
                                // here, and pick it up when you say so.
                                *STEP_SNAG.lock() = Some(TAB_WAIT_OVER.into());
                                return false;
                            }
                            own.set(std::time::Instant::now());
                            *LAST_OWN.lock() = Some(own.get());
                            *STEP_SNAG.lock() = Some(
                                "paused: you were on another tab, so Izuki waited for you to come back to its tab — look again first".into(),
                            );
                            return false;
                        }
                        Err(e) if e.to_string().starts_with("needs_front:") => {
                            // Needs the real mouse or keyboard: wait for you
                            // to pause, borrow the window, look again.
                            let _ = app.emit(
                                events::STATUS,
                                StatusEvent::working("Working behind your app — I'll borrow the window when you pause."),
                            );
                            let until = std::time::Instant::now() + Duration::from_secs(120);
                            while alive() && std::time::Instant::now() < until && crate::buddy::idle_duration() < Duration::from_millis(2500) {
                                std::thread::sleep(Duration::from_millis(200));
                            }
                            if !alive() {
                                let _ = app.emit(events::STATUS, StatusEvent::info("Stopped."));
                                return false;
                            }
                            uia::front_held_window();
                            std::thread::sleep(Duration::from_millis(300));
                            own.set(std::time::Instant::now());
                            *LAST_OWN.lock() = Some(own.get());
                            *STEP_SNAG.lock() = Some(
                                "paused: you were in another app, so Izuki waited and brought its window back — look again first".into(),
                            );
                            return false;
                        }
                        // A click that didn't land: the same button, another way —
                        // the way a person tries again differently instead of
                        // clicking the same spot four times.
                        Err(e) if matches!(step.action, Intent::Click | Intent::DoubleClick)
                            && e.to_string().starts_with("target_changed:")
                            && !e.to_string().contains("covers")
                            && !crate::ext::in_tab_mode()
                            && recover_click(&app, step).is_some() =>
                        {
                            executed.set(i + 1);
                            if let Some(evidence) = evidence {
                                if evidence.finish(crate::mission_journal::EvidenceOutcome::Returned).is_err() { return false; }
                            }
                            crate::lessons::note(&app_name, "pressing things by name worked when the screen position didn't");
                        }
                        Err(e) => {
                            let why = e.to_string();
                            if let Some(evidence) = evidence { let _ = evidence.finish(crate::mission_journal::EvidenceOutcome::Unknown); }
                            // Something on top, or greyed out: the brain can fix
                            // that on its next look — the task goes on.
                            if why.starts_with("covered:") || why.starts_with("disabled:") || why.starts_with("target_changed:") || why.starts_with(crate::ext::UNCONFIRMED) {
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
                    own.set(std::time::Instant::now());
                    *LAST_OWN.lock() = Some(own.get());
                }
                true
            };

            (run(), executed.get())
}

/// The control a click was meant for, pressed another way: 1) inside the
/// page through the browser extension, 2) through Windows' accessibility
/// (no mouse), 3) by its words on screen (OCR). Only when exactly one thing
/// matches: two candidates is a guess, and then the brain looks again.
fn recover_click(app: &AppHandle, step: &ActionStep) -> Option<&'static str> {
    let name = step.snapped_to.as_deref().or(step.grounding.as_ref().map(|g| g.name.as_str()))?.trim().to_string();
    if name.chars().count() < 2 {
        return None;
    }
    // Never a final button by a back door (the guard allowed it only by name, and only here).
    let same = |a: &str| a.trim().eq_ignore_ascii_case(&name);
    // 1. The page's own element, by name — exact, no mouse.
    if crate::ext::connected() && is_browser(&uia::foreground_app()) {
        if let Some(page) = crate::ext::snapshot() {
            let hits: Vec<_> = page.elements.iter().filter(|e| same(&e.name)).collect();
            if hits.len() == 1 && crate::ext::click(&hits[0].dom_id).is_ok() {
                eprintln!("[agent] recovered: pressed “{name}” inside the page");
                return Some("page");
            }
        }
    }
    // 2. Windows' accessibility: the control by its name, near where it was.
    if let Some(win) = step.grounding.as_ref().map(|g| g.window).or_else(uia::target_window) {
        if let Ok(Some(_)) = uia::act_behind(win, uia::Behind::Press { name: Some(&name), identity: None, x: step.x, y: step.y }) {
            eprintln!("[agent] recovered: pressed “{name}” through accessibility");
            return Some("accessibility");
        }
    }
    // 3. Its words on screen: read them, click the middle.
    let frame = capture::capture_all().ok()?;
    let words = crate::ocr::read_words(&frame).ok()?;
    let rect = crate::ocr::find_phrase(&words, &name, Some((step.x, step.y)))?;
    let (x, y) = rect.center();
    if (x - step.x).abs() > 600 || (y - step.y).abs() > 600 {
        return None; // far from where it was meant to be: not the same thing
    }
    let _acting = overlay::acting(app);
    let button = enigo::Button::Left;
    let times = if step.action == Intent::DoubleClick { 2 } else { 1 };
    automation::click_at(x, y, button, times, 120).ok()?;
    eprintln!("[agent] recovered: clicked “{name}” by its words on screen");
    Some("words")
}

/// When Izuki last moved the mouse or typed (shared across a task's rounds).
static LAST_OWN: Mutex<Option<std::time::Instant>> = Mutex::new(None);

/// The person touched the keyboard or mouse after Izuki's own last move.
fn person_touched(own: std::time::Instant) -> bool {
    crate::buddy::idle_duration() + Duration::from_millis(250) < own.elapsed()
}

/// Input newer than Izuki's own last move is the person's: true when they're
/// using the PC right now.
fn user_is_active(own: std::time::Instant) -> bool {
    let idle = crate::buddy::idle_duration();
    idle < Duration::from_millis(1200) && idle + Duration::from_millis(250) < own.elapsed()
}

/// What happened when the person started using the PC mid-step.
#[derive(Debug, Clone, Copy, PartialEq)]
enum Yielded {
    /// They weren't using it — nothing to do.
    No,
    /// Waited for them to pause, and the same window is still in front, so
    /// the step it was about to do still makes sense.
    WaitedSameWindow,
    /// The wait limit elapsed while input was still arriving.
    Busy,
    /// They moved to another window (or stopped Izuki): the pinned point
    /// belongs to a screen that isn't there any more.
    Moved,
}

const USER_WAIT_OVER: &str = "user_input_wait_over";

/// Only steps whose destination will be resolved again can survive a pause.
/// A tab change, scroll or edit can replace content without changing HWND.
fn can_resume_after_input(step: &ActionStep) -> bool {
    match step.action {
        Intent::Click | Intent::Auto | Intent::DoubleClick | Intent::RightClick => {
            step.grounding.is_some()
                || (!step.hover_first && step.snapped_to.as_deref().is_some_and(|name| !name.trim().is_empty()))
        }
        Intent::Type => step.grounding.is_some(),
        _ => false,
    }
}

fn after_input_wait(alive: bool, idle: Duration, before: Option<isize>, after: Option<isize>) -> Yielded {
    if !alive {
        Yielded::Moved
    } else if idle < Duration::from_millis(1500) {
        Yielded::Busy
    } else if before.is_some() && before == after {
        Yielded::WaitedSameWindow
    } else {
        Yielded::Moved
    }
}

/// Izuki and you never fight over the mouse: while you're using the PC it
/// waits (up to 30 s, or until stopped), then carries on.
///
/// It used to wait politely and then throw the step away regardless, which
/// cost a whole fresh look at the screen — ten seconds and a sixth of a
/// minute's free AI allowance — because a trackpad was brushed once. The
/// click itself is already re-checked against live Windows state
/// (`uia::check_target` re-finds the control, or refuses), so carrying on is
/// useful when the same window is still in front and the step's target can
/// be revalidated. Raw coordinates and keyboard focus need a fresh look.
fn yield_to_user(app: &AppHandle, own: std::time::Instant, alive: &dyn Fn() -> bool) -> Yielded {
    if !user_is_active(own) {
        return Yielded::No;
    }
    let was = uia::foreground_hwnd();
    let _ = app.emit(events::STATUS, StatusEvent::working("You're using the PC — I'll carry on when you pause."));
    let until = std::time::Instant::now() + Duration::from_secs(30);
    while alive() && std::time::Instant::now() < until && crate::buddy::idle_duration() < Duration::from_millis(1500) {
        std::thread::sleep(Duration::from_millis(150));
    }
    after_input_wait(alive(), crate::buddy::idle_duration(), was, uia::foreground_hwnd())
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
    submit_voice_command_in(app, store, prompt, &[])
}

/// The same, knowing the conversation so far (chat answers included), so
/// "open Amazon and find that one" knows which one was being talked about.
pub fn submit_voice_command_in(app: &AppHandle, store: &Arc<Store>, prompt: String, recent: &[crate::chat::Turn]) -> VisionPlan {
    // A TV request that reached the screen path (a hand-over from the chat
    // lane, a follow-up mid-conversation) still goes to the TV — never "I
    // can't control your TV" while it opens Netflix on the PC instead.
    if crate::tv::handles(&prompt) {
        let said = crate::tv::run(&prompt).unwrap_or_else(|e| e.to_string());
        remember_task(&prompt, &said);
        return VisionPlan { summary: said, provider: "tv".into(), ..Default::default() };
    }
    // FL Studio: connecting it is Izuki's own setup, and FL's jobs need that
    // link — never worked out by clicking through FL's menus (that only ever
    // reached FL's MIDI list, empty without Izuki's cable).
    let resumes = (is_keep_going(&prompt) || is_yes(&prompt)).then(|| UNFINISHED.lock().as_ref().map(|(t, _)| t.clone())).flatten();
    // What Izuki said last: the conversation's, else the last screen task's.
    let last_said = recent
        .iter()
        .rev()
        .find(|t| t.role == "assistant")
        .map(|t| t.content.clone())
        .or_else(|| LAST_TASK.lock().as_ref().filter(|(_, _, at)| at.elapsed() < FOLLOW_ON_FOR).map(|(_, said, _)| said.clone()));
    if let Some(said) = crate::flstudio::screen_guard(&prompt, resumes.as_deref(), last_said.as_deref()) {
        remember_task(&prompt, &said);
        return VisionPlan { summary: said, provider: "fl".into(), ..Default::default() };
    }
    let asked = with_conversation(&with_what_came_before(&prompt), &prompt, recent);
    let plan = submit_task(app, store, asked, Vec::new(), None, None);
    remember_task(&prompt, &plan.summary);
    plan
}

/// The last thing asked of the screen, what Izuki said about it, and when —
/// so "continue", "play the next one" or "now pause it" carries on with it,
/// the way a conversation does, instead of starting from nothing.
static LAST_TASK: parking_lot::Mutex<Option<(String, String, std::time::Instant)>> = parking_lot::Mutex::new(None);
/// After this long, a short message is a new start, not a follow-on.
const FOLLOW_ON_FOR: Duration = Duration::from_secs(10 * 60);

/// A short message that probably leans on what came before ("continue",
/// "the next one", "now pause it", "and send it to Sam").
fn is_follow_on(said: &str) -> bool {
    let s = said.trim().to_lowercase();
    let words = s.split_whitespace().count();
    words > 0 && (is_keep_going(&s) || words <= 10)
}

/// The prompt, with the task it follows on from when it looks like a
/// follow-on. A "keep going" for a task that had to stop is left alone —
/// that one resumes exactly where it stopped (UNFINISHED).
fn with_what_came_before(prompt: &str) -> String {
    if UNFINISHED.lock().is_some() && (is_keep_going(prompt) || is_yes(prompt)) {
        return prompt.to_string();
    }
    let last = LAST_TASK.lock().clone();
    let Some((task, said, at)) = last.filter(|(_, _, at)| at.elapsed() < FOLLOW_ON_FOR) else {
        return prompt.to_string();
    };
    if !is_follow_on(prompt) {
        return prompt.to_string();
    }
    let _ = at;
    let said = said.chars().take(300).collect::<String>();
    if is_keep_going(prompt) {
        format!(
            "{prompt}\n\n(This continues what the user asked just before: \"{task}\". You said: \"{said}\". \
             Carry on with that same task from the screen as it is now — don't start something new.)"
        )
    } else {
        format!(
            "{prompt}\n\n(Just before, the user asked: \"{task}\", and you said: \"{said}\". \
             If this message follows on from that — \"it\", \"the next one\", \"now…\", \"again\" — carry that on; \
             if it's clearly something new, just do the new thing.)"
        )
    }
}

/// Words that lean on something said before: "it", "that one", "the same".
fn leans_on_before(said: &str) -> bool {
    let s = format!(" {} ", said.to_lowercase().replace(['?', '!', ',', '.'], " "));
    [" it ", " that ", " this ", " those ", " them ", " these ", " the one ", " that one ", " same ", " again ", " instead ", " also ", " what you said", " you said", " you mentioned", " above ", " earlier "]
        .iter()
        .any(|w| s.contains(w))
}

/// The conversation so far, for a request that leans on it. The chat lane
/// answers many things the screen never saw ("which webcam fits my
/// ThinkPad?"); without this, "open Amazon and find that one" meant nothing
/// to the agent — "it doesn't follow what I said".
pub fn with_conversation(asked: &str, prompt: &str, recent: &[crate::chat::Turn]) -> String {
    let mut turns: Vec<&crate::chat::Turn> = recent.iter().filter(|t| !t.content.trim().is_empty()).collect();
    // The request itself is often already the last turn.
    if turns.last().is_some_and(|t| t.role == "user" && t.content.trim() == prompt.trim()) {
        turns.pop();
    }
    if turns.is_empty() || !(is_follow_on(prompt) || leans_on_before(prompt)) {
        return asked.to_string();
    }
    let mut lines: Vec<String> = turns
        .iter()
        .rev()
        .take(6)
        .map(|t| {
            let who = if t.role == "assistant" { "Izuki" } else { "User" };
            let text: String = t.content.split_whitespace().collect::<Vec<_>>().join(" ").chars().take(400).collect();
            format!("{who}: {text}")
        })
        .collect();
    lines.reverse();
    format!(
        "{asked}\n\n(The conversation just before, oldest first — use it to know what \"it\", \"that one\" or \"the same\" mean. Act only on the latest request:\n{})",
        lines.join("\n")
    )
}

/// Keep the task a follow-on belongs to: a follow-on keeps the original
/// task (so "continue", "continue" still means the same job).
fn remember_task(prompt: &str, summary: &str) {
    let mut last = LAST_TASK.lock();
    let base = match last.as_ref() {
        Some((task, _, at)) if at.elapsed() < FOLLOW_ON_FOR && is_keep_going(prompt) => task.clone(),
        _ => prompt.trim().to_string(),
    };
    *last = Some((base, summary.trim().to_string(), std::time::Instant::now()));
}

/// The teaching pen, precise: a circle, box, underline or arrow aimed at
/// WORDS (the model names them in `text_to_type`) is placed where those words
/// really are — read off the full-resolution screen with Windows' own OCR, in
/// real desktop pixels. A model guessing corners on a shrunken screenshot of a
/// scaled (150 %, 4K) screen could never land an underline under the right
/// words; this does, in a browser, a PDF or a paused video. A mark whose words
/// can't be found and that has no place of its own is dropped, never drawn in
/// a corner. Marks already pinned to a real control keep its bounds.
fn anchor_marks(steps: &mut Vec<ActionStep>, frame: &Frame) {
    let on_words = |s: &ActionStep| s.action == Intent::Draw && s.snapped_to.is_none() && vision::marks_words(s);
    let wants_words = steps.iter().any(on_words);
    let wants_notes = steps.iter().any(|s| s.action == Intent::Draw && vision::note_to_place(s));
    if !wants_words && !wants_notes {
        return;
    }
    let started = std::time::Instant::now();
    let words = if wants_words {
        crate::ocr::read_words(frame).unwrap_or_else(|e| {
            eprintln!("[pen] couldn't read the screen's words: {e}");
            Vec::new()
        })
    } else {
        Vec::new()
    };
    let mut lost = Vec::new();
    // The last thing marked, so a note without a place goes just under it.
    let mut last: Option<Rect> = None;
    for (i, s) in steps.iter_mut().enumerate() {
        if s.action != Intent::Draw {
            continue;
        }
        if vision::note_to_place(s) {
            match last {
                Some(r) => {
                    s.x = r.x;
                    s.y = r.y + r.h + 34;
                }
                None => lost.push(i),
            }
            continue;
        }
        if !on_words(s) {
            // A mark with a place of its own (a control's bounds, the model's corners).
            if s.x != 0 || s.y != 0 {
                let (x2, y2) = (s.x2.unwrap_or(s.x), s.y2.unwrap_or(s.y));
                last = Some(Rect { x: s.x.min(x2), y: s.y.min(y2), w: (x2 - s.x).abs(), h: (y2 - s.y).abs() });
            }
            continue;
        }
        let phrase = s.text_to_type.clone().unwrap_or_default();
        let guessed = s.x != 0 || s.y != 0;
        let near = guessed.then(|| ((s.x + s.x2.unwrap_or(s.x)) / 2, (s.y + s.y2.unwrap_or(s.y)) / 2));
        match crate::ocr::find_phrase(&words, &phrase, near) {
            Some(r) => {
                place_mark(s, r);
                s.snapped_to = Some(phrase.clone());
                last = Some(r);
                eprintln!("[pen] \"{phrase}\" found on screen at {},{} {}x{}", r.x, r.y, r.w, r.h);
            }
            None if !guessed => {
                eprintln!("[pen] \"{phrase}\" isn't on screen — not drawing it");
                lost.push(i);
            }
            None => eprintln!("[pen] \"{phrase}\" not found — drawing where the model aimed"),
        }
    }
    for i in lost.into_iter().rev() {
        steps.remove(i);
    }
    eprintln!("[pen] placed marks on words in {} ms ({} words read)", started.elapsed().as_millis(), words.len());
}

/// Fit a mark to the box round its words: round it (circle, box), under it
/// (underline), or pointing at its left edge (arrow).
fn place_mark(s: &mut ActionStep, r: Rect) {
    match s.shape.as_deref() {
        Some("underline") => {
            s.x = r.x;
            s.y = r.y + r.h;
            s.x2 = Some(r.x + r.w);
            s.y2 = Some(r.y + r.h);
        }
        Some("arrow") => {
            let (tx, ty) = (r.x - 6, r.y + r.h / 2);
            // Keep the model's starting point if it gave one; else come in from above-left.
            if s.x2.is_none() || (s.x == 0 && s.y == 0) {
                s.x = tx - 130;
                s.y = ty - 80;
            }
            s.x2 = Some(tx);
            s.y2 = Some(ty);
        }
        _ => {
            s.x = r.x;
            s.y = r.y;
            s.x2 = Some(r.x + r.w);
            s.y2 = Some(r.y + r.h);
        }
    }
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
    // The exact name first; else a quick text-only pick from the numbered
    // list (no screenshot): "click settings" finds "Preferences".
    let c = unique_named(&wanted, &controls).or_else(|| pick_by_text(said, &controls))?.clone();
    // A choice (a radio button or tick box — or, on a quiz, a button that reads
    // as one) goes through the full agent with its quiz guard: this quick path
    // is for plain buttons and links.
    if matches!(c.kind.as_str(), "RadioButton" | "CheckBox") || (c.kind == "Button" && reads_as_choice(&c.name)) {
        return None;
    }
    let my_task = TASK_GEN.fetch_add(1, std::sync::atomic::Ordering::SeqCst) + 1;
    automation::clear_abort();
    let alive = move || TASK_GEN.load(std::sync::atomic::Ordering::SeqCst) == my_task && !automation::aborted() && crate::execution::allowed();
    let (x, y) = c.rect.center();
    let mut step: ActionStep = serde_json::from_value(serde_json::json!({ "action": "click", "x": x, "y": y, "confidence": 1.0, "reasoning": "named on screen" }))
        .expect("a click step is always well-formed");
    step.target = Some(c.id);
    step.snapped_to = Some(c.name.clone());
    step.hover_first = c.hidden;
    step.scroll_first = c.below;
    step.grounding = c.identity.clone();
    eprintln!("[named] \"{said}\" → clicking \"{}\" directly", c.name);
    let working = Working::on(said);
    let (worked, _) = run_steps_blocking(app, store, std::slice::from_ref(&step), &alive);
    let stop = working.stopped();
    drop(working);
    if let Some(stop) = stop {
        return Some(VisionPlan { summary: stop, provider: "fl".into(), ..Default::default() });
    }
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
        outcome: crate::model::TaskOutcome::Partial,
        ..Default::default()
    })
}

/// The semantic anchor: the app's controls as a short numbered text list
/// (with the section each sits in), and a fast text model names the one the
/// person means — just its number. No picture, so it's quick; anything
/// unsure or slow (over 4 s) goes to the full look instead.
fn pick_by_text<'a>(said: &str, controls: &'a [uia::Control]) -> Option<&'a uia::Control> {
    let named: Vec<&uia::Control> = controls.iter().filter(|c| !c.name.is_empty() && !c.below).collect();
    if named.len() < 2 {
        return None;
    }
    let mut list = String::new();
    for c in named.iter().take(70) {
        let section = if c.section.is_empty() || c.section == c.name { String::new() } else { format!(" (in {})", c.section) };
        list.push_str(&format!("{} | {} | {}{}\n", c.id, c.kind, c.name, section));
    }
    let msgs = vec![
        serde_json::json!({ "role": "system", "content": "You match a request to ONE control in an app. Reply with ONLY that control's number. If none clearly fits, or it would delete, send, pay, buy, submit or sign out, reply none." }),
        serde_json::json!({ "role": "user", "content": format!("Controls (number | kind | name):\n{list}\nRequest: \"{}\"\nNumber:", said.trim()) }),
    ];
    let (tx, rx) = std::sync::mpsc::channel();
    std::thread::spawn(move || {
        let _ = tx.send(crate::chat::complete(&msgs));
    });
    let reply = rx.recv_timeout(Duration::from_secs(4)).ok()?.ok()?;
    let id: u32 = reply.trim().trim_matches(|c: char| !c.is_ascii_digit()).parse().ok()?;
    let pick = named.into_iter().find(|c| c.id == id)?;
    // A button that's final or hard to undo is never pressed on a guess.
    let n = pick.name.to_lowercase();
    if ["delete", "remove", "send", "pay", "buy", "purchase", "order", "checkout", "submit", "confirm", "sign out", "log out", "uninstall", "erase", "transfer", "post", "publish"]
        .iter()
        .any(|f| n.contains(f))
    {
        return None;
    }
    eprintln!("[anchor] \"{said}\" → #{id} \"{}\" (text only)", pick.name);
    Some(pick)
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
    //
    // Being on this list only means "don't take the no-AI shortcut" — the
    // request still happens, through the brain, which confirms first. So the
    // cost of listing something harmless is a second or two, and the cost of
    // leaving something out is a click nobody agreed to. List generously.
    const FINAL: &[&str] = &[
        // Destroys or writes over something
        "delete", "remove", "erase", "wipe", "format", "reset", "discard", "overwrite", "replace", "empty",
        "uninstall", "transfer",
        // Spends money. Not "subscribe" or "upgrade": on YouTube and most
        // apps those are free and asked for constantly.
        "pay", "buy", "purchase", "order", "checkout", "check out", "donate", "place bid",
        // Sends or shows something to other people. Not "forward" or "reply
        // all" — those only open a draft, and Forward is a browser button.
        "send", "post", "publish", "share", "invite", "submit", "report",
        // Commits to something, or hands out access
        "confirm", "accept", "agree", "approve", "allow", "grant", "trust", "install", "yes",
        // Cuts you off from something
        "sign out", "log out", "deactivate", "close account", "cancel subscription", "cancel order",
        "unsubscribe", "withdraw", "revoke", "block", "unfollow", "unfriend", "leave meeting", "leave group",
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

/// The task asks for a window to be closed, minimised or maximised (`which`:
/// "close", "minimise", "maximise") — else a click on that window button, or
/// alt+f4 / win+d, is a slip that could close your app and lose your work.
/// Replays (no task) do what was recorded.
fn asked_for_window(task: &str, which: &str) -> bool {
    if task.trim().is_empty() {
        return true;
    }
    let t = words_of(task);
    let asks: &[&str] = match which {
        "close" => &["close", "exit", "quit", "x out", "shut down", "shut"],
        "minimise" => &["minimise", "minimize", "minimised", "minimized", "hide", "show desktop", "show my desktop", "clear my screen", "clear the screen"],
        _ => &["maximise", "maximize", "full screen", "fullscreen", "make it bigger", "bigger window", "restore"],
    };
    // Whole words ("a closer look" isn't "close"), and not "don't close FL".
    asks.iter().any(|a| {
        t.match_indices(&format!(" {a} ")).any(|(i, _)| {
            !t[..i].split_whitespace().rev().take(2).any(|w| ["don't", "dont", "not", "never", "no", "without"].contains(&w))
        })
    })
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
    let alive = move || TASK_GEN.load(std::sync::atomic::Ordering::SeqCst) == my_task && !automation::aborted() && crate::execution::allowed();
    eprintln!("[instant] \"{said}\" → {act:?}");
    let steps = crate::instant::steps(act);
    let worked = if steps.is_empty() {
        crate::execution::charge(crate::execution::Work::Action).is_ok() && alive() && crate::instant::run_direct(act)
    } else {
        run_steps_blocking(app, store, &steps, &alive).0
    };
    if !worked && alive() {
        eprintln!("[bug] instant command didn't work: {act:?}");
    }
    // A few acts answer from the PC itself (the clock); their words are made
    // now, not fixed in the parser.
    let answer = crate::instant::spoken(act).unwrap_or_else(|| say.to_string());
    Some(VisionPlan {
        steps,
        summary: if worked { answer } else { "Hmm, that didn't work — try asking me another way?".to_string() },
        provider: "local".into(),
        model: "instant".into(),
        mood: Some(if worked { "cheerful" } else { "sympathetic" }.into()),
        done: worked && alive(),
        outcome: if !alive() { crate::model::TaskOutcome::Cancelled } else if worked { crate::model::TaskOutcome::Partial } else { crate::model::TaskOutcome::Failed },
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
        return VisionPlan { summary, provider: "local".into(), model: "device-routing".into(), outcome: crate::model::TaskOutcome::Blocked, ..Default::default() };
    }
    // "Open my lab assignment and teach me while I do it": open it (this same
    // agent), then read it into a study guide saved to Notes (study.rs).
    if marks.is_empty() && drawn_on.is_none() {
        if let Some(open) = crate::study::parse(&prompt).and_then(|a| a.open_first) {
            let opened = submit_task(app, store, open, Vec::new(), None, inherited_task);
            if matches!(opened.outcome, crate::model::TaskOutcome::Failed | crate::model::TaskOutcome::Cancelled | crate::model::TaskOutcome::Blocked) {
                return opened;
            }
            let summary = match crate::study::coach(&prompt) {
                Ok(text) => text,
                Err(e) => format!("{} — but {e}", opened.summary.trim()),
            };
            return VisionPlan { summary, provider: "local".into(), model: "study".into(), outcome: opened.outcome, ..Default::default() };
        }
    }
    // "Scroll down", "louder", "next song": done at once, no AI (instant.rs).
    // Every way in — voice, typing, the phone, Discord — comes through here.
    if marks.is_empty() && drawn_on.is_none() {
        if let Some(plan) = run_instant(app, store, &prompt) {
            return plan;
        }
        // "Click Subscribe": the button is named — clicked directly, no AI
        // (works offline too).
        if let Some(plan) = run_named_click(app, store, &prompt) {
            return plan;
        }
        // Offline, with no AI on this PC: the offline helper (offline.rs).
        if brain_chain().is_empty() && !online() {
            return VisionPlan { summary: crate::offline::answer(&prompt), provider: "offline".into(), ..Default::default() };
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
    let alive = move || TASK_GEN.load(std::sync::atomic::Ordering::SeqCst) == my_task && !automation::aborted() && crate::execution::allowed();

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
    // Asking for the answer is a question, even when it also says "and click
    // next": the answer itself is the point, and on a test page every step is
    // stripped anyway. Demanding an action here threw away a correct reply
    // that arrived in 1.2 s and waited ~30 s for brains that then failed.
    let wants_action = (!resumed.is_empty() || crate::companion::asks_to_do(&prompt)) && !direct_answer_requested(&prompt);

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

    // Hold the window this task works in: switch to another app and Izuki
    // carries on there behind you (uia::working_behind). Let go at the end.
    struct LetGo(Option<u64>);
    impl Drop for LetGo {
        fn drop(&mut self) {
            uia::hold_window(None);
            if let Some(pin) = self.0 {
                crate::ext::unpin_own(pin);
            }
        }
    }
    uia::hold_window(uia::target_window());
    // In a browser: pin this tab too — open another tab and Izuki keeps
    // working in its own, through the extension, without touching yours.
    let pin = if crate::ext::connected() && is_browser(&uia::foreground_app()) { crate::ext::pin_front_tab() } else { None };
    *LAST_OWN.lock() = Some(std::time::Instant::now());
    let _let_go = LetGo(pin);

    // Look, act, look again — the way a person does a task. One plan made
    // from one screenshot runs blind: "open Chrome and play some music"
    // opened Chrome and stopped at its profile picker, because the picker
    // didn't exist yet when the plan was made. So after each batch of steps
    // the model can say there's `more`, and it gets a fresh look.
    let mut frame = frame;
    // The app that was in front before this round's steps (see unexpected_app_note).
    let mut front_before = String::new();
    let mut done_so_far: Vec<String> = resumed;
    // Steps that brought up windows the task never mentioned.
    let mut detours = 0u32;
    // When a progress line was last said (they're spaced out).
    let mut last_said_at = std::time::Instant::now() - Duration::from_secs(60);
    let mut progress_mark = 0usize;
    // Rounds in a row whose every step had already been done, and every
    // place acted on so far, so "already been done" has something to mean.
    let mut going_in_circles = 0u32;
    let mut places_seen: Vec<(usize, ActionProgress)> = Vec::new();
    let mut screen_epoch = 0usize;
    // What the user showed or told Izuki when it asked, for the next look.
    // What the user drew, kept for the whole task: its clicks belong there.
    let user_marks: Vec<crate::model::Mark> = marks.clone();
    let mut shown: Vec<crate::model::Mark> = marks;
    let mut told: Option<String> = None;
    let mut asked = 0;
    // The same steps twice in a row means they aren't working.
    let mut last_round: Vec<ActionProgress> = Vec::new();
    // The last named button clicked (and its number): if the mouse click
    // didn't take, it's pressed again "from behind" — Windows' own control,
    // or inside the web page — before anyone is asked anything.
    let mut last_click: Option<(String, Option<u32>)> = None;
    let mut last_look: Option<crate::capture::Frame> = None;
    let mut repeats = 0;
    // The same goal round after round ("Opening Blackboard…" again) — with
    // different clicks on a still-changing screen, which `repeats` misses.
    let mut last_goal: Option<Vec<String>> = None;
    let mut goal_repeats = 0u32;
    let mut waited_on_goal = false;
    // Rounds in a row that did nothing ("let me wait for it to load").
    let mut idle_rounds = 0u32;
    // A step held back and nothing done since: the last word must say so.
    let mut held_back: Option<String> = None;
    let mut all_steps: Vec<ActionStep> = Vec::new();
    let mut last_plan: Option<VisionPlan> = None;
    // What was last said while working, so it isn't said again.
    let mut last_said = String::new();
    // "…and save it to my notes": each explanation goes into one note for
    // this task, (title, source) fixed by the first one kept.
    let keep_notes = keeps_notes(&prompt);
    // Working in the pinned tab while you're on another one (said once).
    let mut in_own_tab = false;
    // The task's to-do list (the model keeps it; shown on the Island), and
    // whether "done" with items left has already been sent back once.
    let mut todo: Vec<(String, bool)> = Vec::new();
    let mut todo_nudged = false;
    // A new task: the last one's list goes.
    let _ = app.emit(TODO_EVENT, serde_json::json!([]));
    let mut kept_note: Option<(String, String)> = None;
    let mut last_kept = String::new();
    let mut kept = 0u32;
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

    // "What are you doing?" is answered from this, while the task runs.
    let _doing = crate::state::Doing::start(&prompt);
    // Izuki's last word, set when it stops on purpose (kept through finalizing).
    let mut final_word: Option<String> = None;
    let working = Working::on(&prompt);
    for round in 0..MAX_ROUNDS {
        if crate::execution::charge(crate::execution::Work::Round).is_err() { break; }
        if !alive() {
            eprintln!("[agent] stopped (replaced or cancelled)");
            break;
        }
        // Locked PC: stop, and say so — never try to get past the lock screen.
        if uia::screen_locked() {
            eprintln!("[agent] the PC is locked — stopping");
            set_unfinished((prompt.clone(), done_so_far.clone()));
            let mut plan = last_plan.take().unwrap_or_default();
            plan.summary = "Your PC is locked. Unlock it and say \"keep going\", and I'll carry on.".into();
            plan.mood = Some("calm".into());
            last_plan = Some(plan);
            break;
        }
        // FL Studio's MIDI settings while FL isn't linked to Izuki: no click
        // there can connect Izuki (its port doesn't exist yet) — stop and
        // offer the real setup instead of clicking around.
        if let Some(said) = crate::flstudio::midi_window_guard(&prompt) {
            eprintln!("[agent] in FL's MIDI settings without Izuki's link — offering the real setup instead of clicking");
            final_word = Some(said);
            break;
        }
        // A step brought a different app to the front that the task never
        // mentioned (Settings while looking for the Recycle Bin): a likely
        // detour. Say so, so it closes it instead of working around it.
        let front = crate::uia::front_app();
        if round > 0 && !last_round.is_empty() && !front.is_empty() && !front_before.is_empty() && front != front_before {
            if let Some(note) = unexpected_app_note(&prompt, &front) {
                eprintln!("[agent] a step brought {front} to the front, which the task didn't mention");
                detours += 1;
                // Flipping between windows the task never named is a mess, not
                // progress (it bounced Chrome ↔ Notepad seven times): stop and ask.
                if detours >= 3 {
                    eprintln!("[agent] kept switching to windows the task didn't mention — stopping to ask");
                    crate::lessons::note(&front, "a task kept switching between windows it wasn't asked to use — stay in the window the task is about");
                    set_unfinished((prompt.clone(), done_so_far.clone()));
                    let mut plan = last_plan.take().unwrap_or_default();
                    plan.summary = "I kept ending up in windows you didn't ask about, so I've stopped before making a mess. Tell me exactly where you want this done and I'll do just that.".into();
                    plan.mood = Some("sympathetic".into());
                    last_plan = Some(plan);
                    break;
                }
                told = Some(match told.take() {
                    Some(t) => format!("{t}\n{note}"),
                    None => note,
                });
            }
        }
        if !front.is_empty() {
            front_before = front.clone();
        }
        // A click that slipped onto the taskbar opens Windows Search or the
        // Start menu — notice it the way a person would, close it, and aim
        // again (unless that's what was asked for).
        if round > 0 && !last_round.is_empty() {
            if let Some(popup) = crate::uia::shell_popup_in_front() {
                let p = prompt.to_lowercase();
                let wanted = ["start menu", "search", "windows menu", "notification", "start button"].iter().any(|w| p.contains(w));
                if !wanted {
                    eprintln!("[agent] a step opened {popup} by mistake — closing it");
                    if crate::execution::charge(crate::execution::Work::Action).is_err() { break; }
                    let _ = crate::automation::press_key("esc");
                    std::thread::sleep(Duration::from_millis(350));
                    if let Ok(f) = capture::capture_all() {
                        frame = f;
                    }
                    let note = format!(
                        "Mistake caught: your last click opened {popup} instead (it landed on the taskbar), so it was closed again. \
                         The thing you meant is in the window above the taskbar — aim higher, use its target id, or a keyboard route."
                    );
                    told = Some(match told.take() {
                        Some(t) => format!("{t}\n{note}"),
                        None => note,
                    });
                }
            }
        }
        // Did the last steps actually do anything? A person notices at once
        // when a click did nothing — and says so, and tries again smarter.
        if round > 0 && !last_round.is_empty() {
            // (In a tab you aren't looking at, the screenshot is your tab: it
            // says nothing about whether the step worked.)
            let unchanged = !crate::ext::in_tab_mode()
                && last_look
                .as_ref()
                .is_some_and(|prev| crate::live::changed_share(prev, &frame.downscaled(160)) <= 0.02);
            // The mouse click didn't take: press the same button directly.
            let mut rescued = false;
            // (In a tab you aren't looking at, the screenshot is your tab:
            // "nothing changed" means nothing, and pressing again would click twice.)
            if unchanged && !crate::ext::in_tab_mode() {
                if let Some((name, target)) = last_click.take() {
                    let pressed = uia::press_named(&name)
                        || target.and_then(crate::ext::dom_id_for).is_some_and(|d| crate::ext::click(&d).is_ok());
                    if pressed {
                        crate::live::wait_until_settled(Duration::from_millis(300), Duration::from_millis(1500), || !alive());
                        if let Ok(f) = capture::capture_all() {
                            rescued = last_look.as_ref().is_some_and(|prev| crate::live::changed_share(prev, &f.downscaled(160)) > 0.02);
                            frame = f;
                        }
                        eprintln!("[hands] \"{name}\": the mouse click didn't take — pressed it directly ({})", if rescued { "worked" } else { "still no change" });
                        if rescued {
                            let note = format!("Your click on \"{name}\" didn't take with the mouse, so it was pressed directly instead — and that worked. Carry on from this screen.");
                            told = Some(match told.take() {
                                Some(t) => format!("{t}\n{note}"),
                                None => note,
                            });
                        }
                    }
                }
            }
            if unchanged && !rescued && !told.as_deref().is_some_and(|t| t.contains("loading")) {
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
        // Something went wrong last time (a failed or repeated step, something
        // to fix): this look thinks it through properly; otherwise it's fast.
        let think = told.is_some() || repeats > 0 || goal_repeats > 0;
        if let Some(note) = told.take() {
            ask.push_str(&format!("\n{note}"));
        }
        if let Some(n) = &notes {
            ask.push_str(&format!("\nYour notes so far: {n}"));
        }
        if !todo.is_empty() {
            ask.push_str(&format!("\nYour to-do list so far: {}", todo_line(&todo)));
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

        // Free brains get busy (rate limits, overloaded queues) and campus
        // Wi-Fi blips. A whole task used to be thrown away after just two
        // tries six seconds apart — mid-assignment, with the work half done.
        // Transient trouble is now waited out; a dropped connection is
        // waited *for*, so the task picks itself back up when the net
        // returns instead of telling the user it will "finish it later".
        const TRIES: u64 = 5;
        let mut attempt = 0u64;
        // Waiting is worth more than failing, but not forever: a task may
        // spend a minute and a half waiting for allowances, no more.
        let mut waited = Duration::ZERO;
        let asked_now = loop {
            match ask_model(store, &session, &frame, &[], zoomed.is_some(), wants_action || round > 0, think) {
                Ok(plan) => break Ok(plan),
                Err(e) => {
                    attempt += 1;
                    let why = e.to_string();
                    let temporary = temporary_trouble(&why);
                    eprintln!("[agent] round {} try {attempt} failed: {e}", round + 1);
                    if !alive() || attempt >= if temporary { TRIES } else { 2 } {
                        break Err(e);
                    }
                    // An offline PC needs a different sentence, and a
                    // different wait, from a rate-limited free tier.
                    let offline = !online();
                    // When everything is resting, the first model back is a
                    // known number of seconds away — so say that number. "Give
                    // me a second" while waiting twenty-three is the kind of
                    // small lie that makes the whole thing feel stuck.
                    let wake = if offline {
                        Duration::ZERO
                    } else {
                        // Either kind of rest counts: a free model that was put
                        // to bed, or a whole provider told to slow down. Only
                        // asking the first kind made a 22 s Groq window read as
                        // "give me a second", so the retry hit the same wall
                        // and the rest doubled.
                        crate::freebrains::soonest_wake()
                            .into_iter()
                            .chain(provider_wake())
                            .min()
                            .map(|d| d + Duration::from_secs(1))
                            .unwrap_or_default()
                    };
                    let line = if offline {
                        "Your internet blipped — waiting for it to come back.".to_string()
                    } else if temporary && wake >= Duration::from_secs(8) {
                        format!("The free AI is rate limited for another {}s — waiting for it.", wake.as_secs())
                    } else if temporary {
                        "The free AI's busy — give me a second.".to_string()
                    } else {
                        "That didn't go through — giving it one more try.".to_string()
                    };
                    let _ = app.emit(
                        "izuki://say",
                        serde_json::json!({ "text": line, "mood": "calm", "reply": true, "quick": true }),
                    );
                    let _ = app.emit(
                        events::STATUS,
                        StatusEvent::working(if offline { "Waiting for the internet…" } else { "Waiting for a free AI brain…" }),
                    );
                    if offline {
                        // Waiting six seconds for a network that comes back
                        // in thirty was pointless. Watch for it, up to 90 s.
                        let give_up = std::time::Instant::now() + Duration::from_secs(90);
                        while std::time::Instant::now() < give_up && alive() && !online() {
                            std::thread::sleep(Duration::from_millis(500));
                        }
                    } else {
                        // A per-minute allowance resets at a known moment, and
                        // knocking three seconds later hit the same wall and
                        // doubled the rest (see `escalate`) — the retry made
                        // its own queue longer. Wait for the soonest brain to
                        // come back, within a total budget — and count it down
                        // so a long wait never looks like a freeze.
                        let budget = Duration::from_secs(90).saturating_sub(waited);
                        let wait = Duration::from_secs(3 * attempt).max(wake).min(budget);
                        waited += wait;
                        let until = std::time::Instant::now() + wait;
                        let mut said = u64::MAX;
                        while std::time::Instant::now() < until && alive() {
                            std::thread::sleep(Duration::from_millis(200));
                            let left = until.saturating_duration_since(std::time::Instant::now()).as_secs();
                            if left > 3 && left % 3 == 0 && left != said {
                                said = left;
                                let _ = app.emit(
                                    events::STATUS,
                                    StatusEvent::working(format!("Waiting for a free AI brain — {left}s")),
                                );
                            }
                        }
                    }
                }
            }
        };
        if !alive() {
            eprintln!("[agent] stopped while thinking (replaced or cancelled)");
            break;
        }
        // Say it once when Izuki starts working in its own tab behind yours.
        if crate::ext::in_tab_mode() != in_own_tab {
            in_own_tab = crate::ext::in_tab_mode();
            if in_own_tab {
                let _ = app.emit(events::STATUS, StatusEvent::working("Working in its own tab — use your other tabs freely."));
            }
        }
        let mut plan = match asked_now {
            Ok(plan) => plan,
            // Partway through: keep what was done, say so, and remember
            // where it got to so "keep going" can pick it up.
            Err(e) if round > 0 => {
                eprintln!("[agent] giving up for now: {e}");
                set_unfinished((prompt.clone(), done_so_far.clone()));
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
        let mut steps = steps;
        if !user_marks.is_empty() && steps.iter().any(|s| uia::on_taskbar(s.x, s.y)) {
            let controls = (round == 0).then(|| uia::list_controls(MAX_CONTROLS));
            if keep_clicks_off_taskbar(&mut steps, &user_marks, controls.as_deref()) > 0 {
                told = Some("A click you planned was on the Windows taskbar, which the user never pointed at — it wasn't made. Act on what they marked.".into());
            }
        }
        // A real lesson ("teach me git in the terminal") may show harmless
        // basics; anything else still needs the exact command spelled out.
        // (Before anything is said, saved or drawn from this plan.)
        apply_answer_mode(&mut plan, &mut steps, &this_look(), &prompt);
        let teaching_now = lesson || crate::companion::asks_to_learn(&prompt);
        let explaining = teaching_now || explains_as_it_goes(&prompt);
        if keep_notes {
            let line = strip_filler(&plan.summary);
            // Every explanation, short ones too — only "Moving to question 4"
            // (where it's going, not what it means) and repeats are left out.
            if !line.is_empty() && line != last_kept && !only_progress(&line) && !crate::easy::narrates(&line) {
                let (title, source) = kept_note
                    .get_or_insert_with(|| {
                        let source = uia::foreground_title();
                        (format!("Review — {}", crate::notes::tidy_title(&source)), source)
                    })
                    .clone();
                match crate::notes::add_to_log(&title, &source, &line) {
                    Ok(_) => {
                        kept += 1;
                        last_kept = line;
                        let _ = app.emit("izuki://notes-changed", ());
                    }
                    Err(e) => eprintln!("[agent] couldn't keep that in Notes: {e}"),
                }
            }
        }
        let held = match guard_steps(&mut steps, &prompt, teaching_now, &uia::front_app()) {
            Some(why) => {
                eprintln!("[agent] held back: {why}");
                held_back = Some(why.clone());
                told = Some(why);
                true
            }
            None => false,
        };

        // An action being planned is not evidence that it succeeded. Check
        // a fresh screen before accepting "done" for an autonomous task —
        // and a plan whose steps were held back isn't done at all.
        let mut done = !held && (lesson || completion_observed(&plan, steps.is_empty(), round));
        // "Done — turning the metronome on now", with nothing attached: a
        // promise, not a finish (it was said as done and nothing happened).
        if done && steps.is_empty() && !lesson && promises_action(&plan.summary) {
            eprintln!("[agent] said done but only promised (\"{}\") — not done", plan.summary.chars().take(60).collect::<String>());
            done = false;
        }
        let wait = plan.wait;
        if plan.notes.is_some() {
            notes = plan.notes.clone();
        }
        if !plan.todo.is_empty() && plan.todo != todo {
            todo = merge_todo(&todo, &plan.todo);
            let items: Vec<serde_json::Value> = todo.iter().map(|(t, d)| serde_json::json!({ "text": t, "done": d })).collect();
            let _ = app.emit(TODO_EVENT, serde_json::Value::Array(items));
        }
        // "Done", with things on its own list still unticked: one look back at
        // them first — the way a person checks their list before saying
        // they're finished. (Once only: a model that never ticks can't loop.)
        if done && !todo_nudged && todo.iter().any(|(_, d)| !d) && alive() {
            todo_nudged = true;
            done = false;
            let left: Vec<&str> = todo.iter().filter(|(_, d)| !d).map(|(t, _)| t.as_str()).collect();
            eprintln!("[agent] said done with {} to-do item(s) left — checking them first", left.len());
            told = Some(format!(
                "You said it's finished, but your to-do list still has: {}. Check this fresh screen: do what's left now, \
                 or if an item is already done tick it, or if it can't be done say which and why — then finish.",
                left.join("; ")
            ));
            last_plan = Some(plan);
            match capture::capture_all() {
                Ok(f) => frame = f,
                Err(_) => break,
            }
            continue;
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
        crate::state::task_step(&plan.summary);
        let this_round: Vec<ActionProgress> = steps.iter().map(action_progress).collect();
        let look = frame.downscaled(160);
        // (In a tab you aren't looking at, the screenshot is your tab — the
        // same-goal and progress limits catch a stuck loop there instead.)
        let screen_changed = crate::ext::in_tab_mode()
            || last_look
                .as_ref()
                .map(|prev| crate::live::changed_share(prev, &look) > 0.02)
                .unwrap_or(true);
        last_look = Some(look);
        if screen_changed {
            screen_epoch += 1;
        }
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
        let goal = goal_words(&plan.summary);
        if !steps.is_empty() && last_goal.as_ref().is_some_and(|g| same_goal(g, &goal)) {
            goal_repeats += 1;
        } else {
            goal_repeats = 0;
            waited_on_goal = false;
        }
        last_goal = Some(goal);
        if goal_repeats >= 2 && !waited_on_goal && alive() {
            // A third go at the same thing: a page or app that's slow to
            // arrive, most likely. Don't open it yet again — wait for it,
            // like a person would, then look.
            eprintln!("[agent] same goal a third time (\"{}\") — waiting instead of redoing it", plan.summary.chars().take(60).collect::<String>());
            let _ = app.emit(events::STATUS, StatusEvent::working("Waiting for it to finish loading…"));
            let until = std::time::Instant::now() + Duration::from_secs_f32(8.0 * crate::patience::slowness());
            while std::time::Instant::now() < until && alive() {
                std::thread::sleep(Duration::from_millis(250));
            }
            waited_on_goal = true;
            goal_repeats = 0;
            told = Some(
                "You were about to do the same thing a third time, so Izuki waited for the screen to finish loading instead. \
                 Look carefully at what's on screen NOW: if what you were opening is there, carry on with the next part of the \
                 task; only if the screen clearly shows it failed (an error page), try a DIFFERENT way."
                    .into(),
            );
            last_plan = Some(plan);
            match capture::capture_all() {
                Ok(f) => frame = f,
                Err(_) => break,
            }
            continue;
        }
        if goal_repeats == 1 {
            told = Some(
                "You're doing the same thing as last round. On this PC pages and apps can take 10-20 seconds to arrive — \
                 if it's still loading, answer with no steps and \"wait\": 5 rather than opening it again."
                    .into(),
            );
        }
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
        if wants_action && !lesson && steps.is_empty() && !done && plan.ask.is_none() && alive()
            && (plan.done || wait > 0 || promises_action(&plan.summary)) {
            // A round with no step that waits for a page ("let me wait for it
            // to load") or promises one ("Opening Blackboard now") isn't the
            // end of the task — any round, not just the first two (the task
            // used to stop dead right there). Look again; a few empty rounds
            // in a row, though, and it says it's stuck instead of looping.
            idle_rounds += 1;
            if idle_rounds <= MAX_IDLE_ROUNDS {
                told = Some(if wait > 0 && !plan.done {
                    "You chose to wait for the screen. This is the screen now: if it's ready, give the next step of the task; \
                     if it is clearly still loading, answer with no steps and \"wait\" again. Don't open it again."
                        .into()
                } else {
                    "No action was executed from your last response. Check this fresh screen: name the visible result if the user's goal is already satisfied, otherwise provide the next grounded step. A promise to open/start something is not completion — send the step itself.".into()
                });
                last_plan = Some(plan);
                let _ = app.emit(events::STATUS, StatusEvent::working(if wait > 0 { "Waiting for it to finish loading…" } else { "Izuki is checking the screen…" }));
                let until = std::time::Instant::now()
                    + Duration::from_millis(250 + u64::from(wait.min(12)) * 1000);
                while std::time::Instant::now() < until && alive() {
                    std::thread::sleep(Duration::from_millis(100));
                }
                if !alive() { break; }
                match capture::capture_all() { Ok(f) => frame = f, Err(_) => break }
                continue;
            }
            eprintln!("[agent] {MAX_IDLE_ROUNDS} rounds in a row without a step — stopping");
            crate::lessons::note(&uia::foreground_app(), "pages here can take a long time to be ready — wait for them to finish loading before acting");
            set_unfinished((prompt.clone(), done_so_far.clone()));
            let mut plan = plan;
            plan.summary = if let Some(why) = held_back.as_deref() {
                plainly(why)
            } else if wait > 0 {
                "It's still not ready after a good while, so I'll pause here. Say \"keep going\" and I'll pick it up, or tell me what to click.".into()
            } else {
                "I kept meaning to do it but couldn't find a way on this screen, so I've stopped here rather than keep promising. Tell me what to click, or do that part yourself.".into()
            };
            plan.mood = Some("sympathetic".into());
            last_plan = Some(plan);
            break;
        }
        if !steps.is_empty() {
            idle_rounds = 0;
            held_back = None;
        }
        if round == 0 && steps.is_empty() && !wants_action {
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
        // Not every step out loud: something new, no filler, and not more
        // than about every 12 seconds ("Bet, hold up, I'ma…" every step).
        let progress = strip_filler(&plan.summary);
        // (Teaching: the explanation is the point — it's never held back.)
        let spaced = explaining || last_said_at.elapsed() >= Duration::from_secs(12);
        if !steps.is_empty() && !done && !plan.done && spaced && worth_saying(&progress, &last_said) {
            last_said = progress.clone();
            last_said_at = std::time::Instant::now();
            let _ = app.emit(
                "izuki://say",
                serde_json::json!({ "text": progress, "mood": plan.mood, "reply": true, "quick": true }),
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
        last_click = steps
            .iter()
            .take(executed)
            .filter(|s| matches!(s.action, Intent::Click | Intent::Auto))
            // Windows knows a page link by its name, not "Next → https://…".
            .filter_map(|s| s.snapped_to.as_deref().map(|n| (n.split(" → ").next().unwrap_or(n).to_string(), s.target)))
            .last();
        all_steps.extend(steps.iter().take(executed).cloned());
        // Going round in circles is not progress.
        //
        // The log caught the agent spending seven rounds — over a minute, and
        // a screen look each — re-reading the same four answers on a quiz
        // page: "let's check option C", "and option D", round after round.
        // Every round did steps, so every count-based check was satisfied.
        // What matters is whether a round did anything it hadn't done before.
        // Where it acted, on the same coarse grid as the same-steps check
        // just above. Not describe_step: that carries the model's own
        // wording, which differs every round ("let's check option C", "and
        // option D") even when the clicks go over the same ground, so
        // comparing it would never see a loop.
        // Repeated scrolling or Next clicks on a changing page are progress.
        // Distinct text, keys and destinations also must not collapse into
        // the same action merely because their coordinates match.
        let places_now: Vec<(usize, ActionProgress)> =
            steps.iter().take(executed).map(|s| (screen_epoch, action_progress(s))).collect();
        going_in_circles = if only_repeats(&places_now, &places_seen) { going_in_circles + 1 } else { 0 };
        places_seen.extend(places_now);
        done_so_far.extend(steps.iter().take(executed).map(describe_step));
        if going_in_circles >= CIRCLES_BEFORE_STOPPING {
            eprintln!("[agent] {going_in_circles} rounds doing only things already done — stopping");
            crate::lessons::note(
                &uia::foreground_app(),
                "a task here went round in circles: the same clicks were repeated with nothing changing — read what's on screen and say what's in the way instead of trying again",
            );
            set_unfinished((prompt.clone(), done_so_far.clone()));
            if let Some(p) = last_plan.as_mut() {
                p.summary = "I'm going round in circles here — I keep doing the same thing and the screen isn't moving on. Tell me what I'm missing, or say \"keep going\" to try again.".into();
            }
            break;
        }
        if let Some(said) = working.stopped() {
            final_word = Some(said);
            break;
        }
        if uia::working_behind().is_some() {
            let note = "The person switched to another app while you work, so you're working in your window BEHIND \
                        theirs (the screenshot shows your window as if it were in front). Clicking buttons, links, \
                        tabs and checkboxes, typing into boxes and scrolling all work there; keyboard shortcuts, \
                        right-clicks, dragging and opening apps wait until they pause. Prefer the steps that work.";
            told = Some(match told.take() {
                Some(t) => format!("{t}\n{note}"),
                None => note.to_string(),
            });
        }
        // A click that couldn't happen (something on top, a greyed-out
        // button) isn't the end: tell the brain, and it deals with it.
        let snag = STEP_SNAG.lock().take();
        if snag.as_deref() == Some(USER_WAIT_OVER) {
            set_unfinished((prompt.clone(), done_so_far.clone()));
            let mut plan = last_plan.take().unwrap_or_default();
            plan.summary = "You're still using the PC, so I've paused here. Say \"keep going\" when you're ready.".into();
            plan.mood = Some("calm".into());
            last_plan = Some(plan);
            break;
        }
        if snag.as_deref() == Some(TAB_WAIT_OVER) {
            set_unfinished((prompt.clone(), done_so_far.clone()));
            let mut plan = last_plan.take().unwrap_or_default();
            plan.summary = "The next step needs Izuki's tab on screen, and you've been on another tab for a while — so I've paused. Go back to that tab and say \"keep going\" when you're ready.".into();
            plan.mood = Some("calm".into());
            last_plan = Some(plan);
            break;
        }
        if let Some(why) = &snag {
            eprintln!("[agent] a click couldn't happen — {why}");
            let note = if why.starts_with("paused:") {
                "The person used the PC while you worked, so you paused. Things may have moved or another window may \
                 be in front: parse this fresh screenshot, bring the window you were working in back if needed, and \
                 carry on from where you were. Do not redo steps already done."
                    .to_string()
            } else if why.starts_with(crate::ext::UNCONFIRMED) {
                format!("Your last action may already have happened, but it wasn't confirmed — {why}. Check this fresh screenshot for whether it did (a new page, a ticked box, the typed text) before anything else, and do NOT repeat it if it did.")
            } else if why.starts_with("target_changed:") {
                crate::lessons::note(&uia::foreground_app(), "controls here move or redraw: take a fresh look and pick the control by its label right before clicking");
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
        // Every so often: still getting somewhere? (New steps done, not the same ones.)
        if (round + 1) % PROGRESS_EVERY == 0 && !done {
            // Steps done in this window that hadn't been done before it —
            // repeating old ones used to count, so a loop looked productive.
            let (before, window) = places_seen.split_at(progress_mark.min(places_seen.len()));
            let fresh = new_among(window, before);
            progress_mark = places_seen.len();
            if fresh < 3 {
                eprintln!("[agent] little progress in the last {PROGRESS_EVERY} rounds — pausing");
                crate::lessons::note(&uia::foreground_app(), "a task here stalled before: check the instructions on screen, scroll to find what's missing, and say what's in the way instead of retrying");
                set_unfinished((prompt.clone(), done_so_far.clone()));
                if let Some(p) = last_plan.as_mut() {
                    p.summary = "I've been at this a while without getting much further, so I'll pause here. Say \"keep going\" and I'll pick it up from where it is, or tell me what's in the way.".into();
                }
                break;
            }
        }
        if (!finished && !fixable) || !alive() || (done && !fixable) || round + 1 == MAX_ROUNDS {
            // Ran out of rounds mid-task: "keep going" carries on from here.
            if round + 1 == MAX_ROUNDS && !done && finished {
                set_unfinished((prompt.clone(), done_so_far.clone()));
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
        // A slow PC gets longer (patience.rs learns how long its windows take).
        let max = Duration::from_millis((2500.0 * crate::patience::slowness()) as u64 + u64::from(wait) * 1000);
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
            let until = std::time::Instant::now() + Duration::from_secs_f32(12.0 * crate::patience::slowness());
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
    // A step held back and nothing done since: an empty last word, a promise
    // or a claim of done is replaced by what wasn't done (kept through
    // finalizing below, so no generic line replaces it).
    let mut honest = None;
    if let Some(why) = held_back.as_deref() {
        if plan.summary.trim().is_empty() || promises_action(&plan.summary) || plan.done {
            eprintln!("[agent] last word after a held-back step — saying what wasn't done instead");
            plan.summary = plainly(why);
            honest = Some(plan.summary.clone());
        }
    }
    if settings.autosave_flows && completed && alive() && !all_steps.is_empty() && !prompt.starts_with("Explain this video frame on my screen.") {
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
    // "Playing some chill music now" … then "Chill music's rolling on
    // YouTube": the last word only restated what was already said aloud, so
    // Izuki sounded like it was repeating itself. Keep it to "Done."
    if completed && alive() && restates(&plan.summary, &last_said) {
        plan.summary = "Done.".into();
    }
    // "Yo, I already broke that one down for you — the answer is B": the
    // remark about having said it only confuses. The answer stays.
    if !last_said.is_empty() {
        plan.summary = strip_filler(&drop_already_said(&plan.summary));
    }
    if kept > 0 {
        let title = kept_note.as_ref().map(|(t, _)| t.as_str()).unwrap_or("Review");
        let said = format!("I saved {kept} explanation{} to Izuki Notes (“{title}”) so you can study them.", if kept == 1 { "" } else { "s" });
        plan.summary = if plan.summary.trim().is_empty() || plan.summary.trim() == "Done." { said } else { format!("{} {said}", plan.summary.trim_end()) };
    }
    // Its own list still has open items: not "verified done", even after the
    // one look back — say what's left instead of claiming the whole task.
    let open: Vec<&str> = todo.iter().filter(|(_, d)| !d).map(|(t, _)| t.as_str()).collect();
    let list_finished = open.is_empty();
    let said = plan.summary.clone();
    finalize_execution(&mut plan, completed && alive() && list_finished);
    if let Some(h) = final_word.or(honest) {
        plan.summary = h;
    }
    if completed && alive() && !list_finished {
        plan.outcome = crate::model::TaskOutcome::Partial;
        let base = if said.trim().is_empty() || said.trim() == "Done." { "I did part of it.".to_string() } else { said.trim_end().to_string() };
        plan.summary = format!("{base} Still open on my list: {}.", open.join("; "));
    }
    if !alive() { plan.outcome = crate::model::TaskOutcome::Cancelled; }
    plan
}

/// The clause saying it was already said ("I already broke that down for
/// you", "like I said") taken out; the rest of the line kept as it was.
pub fn drop_already_said(line: &str) -> String {
    const META: &[&str] = &[
        "i already broke", "i already explained", "i already told", "i already said", "i already covered", "i already answered", "i already went over", "i already walked you",
        "i've already explained", "i've already told", "i've already covered", "i've already answered", "i've already broken",
        "as i said", "like i said", "as i mentioned", "like i mentioned", "as i explained",
    ];
    const DELIMS: &[&str] = &[" — ", " – ", " - ", ", ", ". ", "! ", "? ", ": ", "; "];
    let lower = line.to_ascii_lowercase();
    let Some((m, mlen)) = META.iter().filter_map(|p| lower.find(p).map(|i| (i, p.len()))).min_by_key(|x| x.0) else {
        return line.to_string();
    };
    // The clause holding it: from the break before it to the break after.
    let before = DELIMS.iter().filter_map(|d| line[..m].rfind(d)).max();
    let after = DELIMS.iter().filter_map(|d| line[m + mlen..].find(d).map(|i| (m + mlen + i, *d))).min_by_key(|x| x.0);
    let prefix = before.map(|i| line[..i].trim_end()).unwrap_or("");
    let (rest, joint) = match after {
        Some((i, d)) => (line[i + d.len()..].trim_start(), d),
        None => ("", ""),
    };
    let out = match (prefix.is_empty(), rest.is_empty()) {
        (true, true) => return "Done.".into(),
        (true, false) => rest.to_string(),
        (false, true) => {
            if prefix.ends_with(['.', '!', '?']) { prefix.to_string() } else { format!("{prefix}.") }
        }
        (false, false) => format!("{prefix}{joint}{rest}"),
    };
    let mut chars = out.chars();
    match chars.next() {
        Some(c) => c.to_uppercase().chain(chars).collect(),
        None => "Done.".into(),
    }
}

/// Does the final reply mostly say again what was said mid-task? Compared
/// word-stem by word-stem ("music's" is "music"), ignoring filler. A reply
/// with something new in it (a total, an answer, a name) is kept.
fn restates(line: &str, said: &str) -> bool {
    const FILLER: &[&str] = &[
        "got", "it", "okay", "ok", "alright", "sure", "on", "let", "me", "i'll", "now", "so", "right", "cool", "great", "perfect",
        "here", "we", "go", "just", "you", "for", "your", "the", "a", "an", "to", "that", "this", "up", "is", "in", "of", "and",
        "all", "set", "done", "there", "good", "it's", "its", "some", "already", "should", "be", "i", "i've", "have", "has",
    ];
    let stems = |s: &str| -> Vec<String> {
        s.to_lowercase()
            .split(|c: char| !c.is_alphanumeric() && c != '\'')
            .map(|w| w.trim_matches('\''))
            .filter(|w| !w.is_empty() && !FILLER.contains(w))
            .map(|w| {
                let w = w.strip_suffix("'s").unwrap_or(w);
                let w = w.strip_suffix("ing").filter(|r| r.len() >= 3).unwrap_or(w);
                w.strip_suffix('s').filter(|r| r.len() >= 3).unwrap_or(w).to_string()
            })
            .collect()
    };
    let before = stems(said);
    let now = stems(line);
    if before.is_empty() || now.is_empty() {
        return false;
    }
    // Numbers, prices and times are news.
    if line.chars().any(|c| c.is_ascii_digit()) {
        return false;
    }
    let shared = now.iter().filter(|w| before.contains(w)).count();
    let share = (shared as f32) / (now.len() as f32);
    // Mostly the same words — not two shared words in a reply full of news.
    share >= 0.5 || (shared >= 2 && share >= 0.4)
}

/// Executing steps is not the same as observing the requested result. Keep
/// partial traces useful, but never return a stale success flag after a stop.
fn completion_observed(plan: &VisionPlan, no_steps: bool, round: usize) -> bool {
    // First-look claims get another fresh observation. An intention, a wait,
    // or a question is not a completed autonomous task.
    let summary = plan.summary.trim().to_lowercase();
    let intention = ["opening ", "starting ", "i'll ", "i will ", "i’m going to ", "i'm going to ", "let me "]
        .iter().any(|prefix| summary.starts_with(prefix));
    round > 0 && plan.done && no_steps && plan.ask.is_none() && plan.wait == 0
        && !summary.is_empty() && !intention
}

fn finalize_execution(plan: &mut VisionPlan, verified: bool) {
    let claimed_done = plan.done;
    plan.done = verified;
    plan.outcome = if verified { crate::model::TaskOutcome::Verified }
        else if plan.ask.is_some() { crate::model::TaskOutcome::NeedsUser }
        else if !plan.steps.is_empty() { crate::model::TaskOutcome::Partial }
        else { crate::model::TaskOutcome::Unverified };
    if !verified && (claimed_done || !plan.steps.is_empty()) {
        if claimed_done || plan.summary.trim().is_empty() {
            plan.summary = "I stopped before I could verify that the whole task finished. Some steps may have completed; check the current result before continuing.".into();
        } else {
            plan.summary.push_str(" I haven't verified that the whole task finished.");
        }
    }
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
/// When a step put an app in front that the request has nothing to do with,
/// the note that tells the model so. Apps a task naturally lands in (a
/// browser for a website, Explorer for files) don't count.
fn unexpected_app_note(prompt: &str, front: &str) -> Option<String> {
    let p = prompt.to_lowercase();
    let friendly = match front {
        "systemsettings" => "Settings",
        "explorer" => "File Explorer",
        "msedge" => "Edge",
        "chrome" => "Chrome",
        "winword" => "Word",
        "excel" => "Excel",
        "powerpnt" => "PowerPoint",
        "notepad" => "Notepad",
        "taskmgr" => "Task Manager",
        "control" => "Control Panel",
        "mspaint" => "Paint",
        "calc" | "calculatorapp" => "Calculator",
        other => other,
    };
    let mentioned = p.contains(front) || p.contains(&friendly.to_lowercase());
    // Where tasks naturally go: a browser for anything web, Explorer for
    // files and folders, Settings for settings.
    let browser = ["chrome", "msedge", "firefox", "brave", "opera"].contains(&front);
    let natural = (browser && ["http", ".com", "site", "web", "search", "google", "youtube", "gmail", "blackboard", "canvas", "online", "browser", "page", "link", "netflix", "spotify", "chatgpt"].iter().any(|w| p.contains(w)))
        || (front == "explorer" && ["file", "folder", "download", "document", "desktop", "recycle", "bin", "drive", "picture", "photo"].iter().any(|w| p.contains(w)))
        || (front == "systemsettings" && ["setting", "wifi", "wi-fi", "bluetooth", "display", "sound", "update", "network", "battery", "brightness"].iter().any(|w| p.contains(w)))
        || front == "applicationframehost" || front == "shellexperiencehost" || front == "searchhost";
    if mentioned || natural {
        return None;
    }
    Some(format!(
        "Check yourself: your last step brought {friendly} to the front, and this task didn't ask for it. If that was a mistake, \
         press esc if it's a menu or pop-up, or switch back to the window you were working in — never close an app you \
         didn't open; if the task really needs it, carry on."
    ))
}

const NO_EFFECT: &str = "Your last step(s) didn't visibly change anything — the screen looks the same as before. \
Work out why, like a person would: still loading (a spinner, blank or grey boxes) → set \"wait\" and look again; \
the click missed → use the control's target id, zoom in to see it exactly, or a keyboard route (tab/enter, ctrl+l); \
a scroll did nothing → the mouse was over the wrong area (put x,y inside the panel you mean) or it's at the end; something covering it \
(pop-up, cookie banner, menu) → close that first; it needs a double-click; the window isn't in front → click inside \
it first. Say it naturally in `summary` (\"Hmm, that didn't open — trying another way\") and try again differently. \
Only ask the user after three honest, different tries.";

/// How many look-act rounds one request may take. Long jobs (a lab, a
/// worksheet) need plenty; "keep going" carries on past it.
/// A safety cap only: tasks keep going while they're making progress (a long
/// form, a setup, many pages) — the old fixed 16 cut real work off halfway.
/// Loops are caught separately (same steps, same goal), and progress is
/// checked every PROGRESS_EVERY rounds.
const MAX_ROUNDS: usize = 60;
const PROGRESS_EVERY: usize = 12;
/// Did this round do nothing it hadn't already done?
///
/// A round with no steps isn't a repeat — it's a look, which the idle-round
/// count handles. A round that repeats one earlier step and does one new
/// thing is progress. Only a round that is entirely old ground counts.
fn only_repeats<T: PartialEq>(fresh: &[T], before: &[T]) -> bool {
    !fresh.is_empty() && fresh.iter().all(|s| before.contains(s))
}

/// How many of `window` weren't already in `before`.
fn new_among<T: PartialEq>(window: &[T], before: &[T]) -> usize {
    window.iter().enumerate().filter(|(i, s)| !before.contains(s) && !window[..*i].contains(s)).count()
}

/// Operational content only: model explanations and renumbered target IDs
/// change between looks even when the actual action does not.
#[derive(Debug, PartialEq)]
struct ActionProgress {
    action: Intent,
    point: (i32, i32),
    destination: (Option<i32>, Option<i32>),
    text: Option<String>,
    key: Option<String>,
    scroll: Option<i32>,
    shape: Option<String>,
    path: Option<Vec<[i32; 2]>>,
}

fn action_progress(step: &ActionStep) -> ActionProgress {
    ActionProgress {
        action: step.action,
        point: (step.x.div_euclid(12), step.y.div_euclid(12)),
        destination: (step.x2.map(|x| x.div_euclid(12)), step.y2.map(|y| y.div_euclid(12))),
        text: step.text_to_type.clone(),
        key: step.key.as_deref().map(|key| key.to_lowercase().replace(' ', "")),
        scroll: step.scroll_amount,
        shape: step.shape.clone(),
        path: step.path.clone(),
    }
}

/// Rounds in a row that only redo what's already been done, before Izuki
/// stops and says so. Three is enough to tell a loop from a retry.
const CIRCLES_BEFORE_STOPPING: u32 = 3;

/// Bumped by every new task and by "stop". A task remembers its number and
/// stops (before its next click, and without answering) once it changes —
/// so there's only ever one task working the screen, and "stop" really
/// stops it instead of just muting it.
static TASK_GEN: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);

fn task_is_current(task: u64, generation: u64, aborted: bool) -> bool { generation == task && !aborted }
fn task_alive(task: u64) -> bool { task_is_current(task, TASK_GEN.load(std::sync::atomic::Ordering::SeqCst), automation::aborted()) && crate::execution::allowed() }
fn stopped_plan() -> VisionPlan { VisionPlan { summary: "Stopped.".into(), outcome: crate::model::TaskOutcome::Cancelled, ..Default::default() } }
pub fn reserve_draw_task() -> u64 {
    automation::clear_abort();
    TASK_GEN.fetch_add(1, std::sync::atomic::Ordering::SeqCst) + 1
}

/// Stop the task in progress, forget any half-done one, and let go of a
/// question it was waiting on. (Stop hotkey, Esc, the orb's ✕, "stop".)
pub fn cancel_task() {
    TASK_GEN.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
    crate::coach::stop();
    automation::request_abort();
    UNFINISHED.lock().take();
    answer_help(None);
}

/// Worth saying out loud while working? Not the same thing twice, and not
/// just "Got it!" — the user heard "Got it, let's do this" five times in a
/// row on a quiz.
/// "Review all the questions and answers", "go over my results", "explain
/// each one": the explanations are the point, so every one is said (never
/// held back to space progress lines out).
fn explains_as_it_goes(prompt: &str) -> bool {
    let s = format!(" {} ", prompt.to_lowercase());
    [" review", " go over", " go through", " explain", " study", " understand", " walk me through", " teach", " break down", " break it down"].iter().any(|w| s.contains(w))
}

/// "Moving to question 4", "Opening the page": where it's going, not an
/// explanation worth keeping in notes.
fn only_progress(line: &str) -> bool {
    let l = line.trim().to_lowercase();
    l.chars().count() < 80
        && ["moving to", "moving on", "opening", "clicking", "scrolling", "going to", "heading to", "switching", "let me", "loading", "waiting", "next question", "on to", "pressing", "done"]
            .iter()
            .any(|p| l.starts_with(p))
}

/// "…and save it on my notes": what's explained on the way is kept in Izuki
/// Notes as it goes — only when asked (notes::asks_to_save; "the 808 notes"
/// in FL Studio are musical notes, not a request to save anything).
pub fn keeps_notes(prompt: &str) -> bool {
    crate::notes::asks_to_save(prompt)
}

/// The line without its chatty opener: "Bet, hold up — I'ma get that script
/// written" → "I'ma get that script written". The persona stays in the
/// answer; the play-by-play doesn't need it every time.
pub fn strip_filler(line: &str) -> String {
    const OPENERS: &[&str] = &[
        "bet", "say less", "yo", "aight", "alright", "all right", "okay", "ok", "hold up", "hold on", "gotchu", "got you", "i got you",
        // (Not "word", "man", "nice", "lit", "facts": those start real sentences — "Word is open".)
        "on it", "fam", "bro", "sure", "cool", "real talk", "let's keep cookin'", "let's keep cooking",
    ];
    let mut s = line.trim().to_string();
    loop {
        // ASCII lower-casing keeps every byte where it was, so offsets match `s`.
        let lower = s.to_ascii_lowercase();
        // "Yo Solomon," — an opener with a name after it.
        let hit = OPENERS.iter().find_map(|o| {
            let rest = lower.strip_prefix(o)?;
            let rest_trim = rest.trim_start_matches(|c: char| c == ',' || c == '!' || c == '.' || c == '—' || c == '-' || c.is_whitespace());
            if rest.len() == rest_trim.len() && !rest.is_empty() && !rest.starts_with(['!', ',', '.', '—', ' ']) {
                return None; // part of a longer word ("okayed")
            }
            let mut cut = s.len() - rest_trim.len();
            // A name right after "Yo"/"Bet": "Yo Solomon, …" — only straight
            // after a greeting ("Sure, Notepad, then Word" keeps Notepad).
            let vocative = ["yo", "bet", "aight", "alright", "okay", "ok", "say less", "hold up"].contains(o) && rest.starts_with(' ') && rest.len() - rest.trim_start().len() == rest.len() - rest_trim.len();
            let after = &s[cut..];
            if let Some((comma, mark)) = after.char_indices().find(|(_, c)| [',', '!', '—'].contains(c)).filter(|_| vocative) {
                let name = &after[..comma];
                if name.split_whitespace().count() == 1 && name.chars().next().is_some_and(|c| c.is_uppercase()) {
                    // The whole mark: "—" is three bytes, and cutting inside it panicked.
                    cut += comma + mark.len_utf8();
                }
            }
            Some(cut)
        });
        match hit {
            Some(cut) if cut > 0 && cut <= s.len() && s.is_char_boundary(cut) => s = s[cut..].trim_start_matches(|c: char| c == ',' || c == '!' || c == '.' || c == '—' || c == '-' || c.is_whitespace()).to_string(),
            _ => break,
        }
    }
    // "…for you, fam." → "…for you." (the closing mark kept).
    let (body, end) = match s.char_indices().last() {
        Some((i, c)) if ".!?".contains(c) => (&s[..i], &s[i..]),
        _ => (s.as_str(), ""),
    };
    let body = body.trim_end().trim_end_matches(", fam").trim_end_matches(" fam").trim_end_matches(", bro").trim_end_matches(',');
    let s = if body.trim().is_empty() { String::new() } else { format!("{body}{end}") };
    let mut c = s.chars();
    match c.next() {
        Some(f) => f.to_uppercase().chain(c).collect(),
        None => String::new(),
    }
}

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

/// When the task waiting for "keep going" stopped.
static UNFINISHED_AT: parking_lot::Mutex<Option<std::time::Instant>> = parking_lot::Mutex::new(None);

/// A task stopped partway: kept (with when) for "keep going".
fn set_unfinished(task: (String, Vec<String>)) {
    *UNFINISHED.lock() = Some(task);
    *UNFINISHED_AT.lock() = Some(std::time::Instant::now());
}

/// When the task waiting for "keep going" stopped (`None`: nothing waits).
pub fn unfinished_since() -> Option<std::time::Instant> {
    UNFINISHED.lock().as_ref().and(*UNFINISHED_AT.lock())
}

/// What that task was about, clipped to a sentence (`None`: nothing waits).
pub fn unfinished_task() -> Option<String> {
    UNFINISHED
        .lock()
        .as_ref()
        .map(|(task, _)| task.trim().chars().take(120).collect::<String>())
        .filter(|t| !t.is_empty())
}

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
            let Some(rest) = s.strip_prefix(k) else { return false };
            // A whole word only: "yes" answers, "yesterday" is a new request.
            if rest.chars().next().is_some_and(|c| c.is_alphanumeric()) {
                return false;
            }
            // Bare "yes", or a short instruction after it ("yes, open the
            // file"). "Continue" is rare enough that a prefix match is safe,
            // but "yes" opens all sorts of ordinary sentences — so the rest has
            // to stay short or it is read as a new request instead.
            let rest = rest.trim_start_matches([' ', ',', '.', '!', '?', ';', ':']);
            rest.is_empty() || rest.split_whitespace().count() <= 3
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
        .ok_or_else(|| anyhow!(NO_BRAIN))?;

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
        think: false,
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
    use super::promises_action;

    #[test]
    fn direct_factual_answers_are_kept_without_acting_on_the_page() {
        assert!(super::direct_answer_requested("Answer the question on my screen directly."));
        assert!(super::direct_answer_requested("which option is correct?"));
        assert!(!super::direct_answer_requested("Coach me but don't answer the question"));
        // How the owner actually asks, not a list of exact sentences.
        assert!(super::direct_answer_requested("help me ans the quiz and explain"));
        assert!(super::direct_answer_requested("help me answer this"));
        assert!(super::direct_answer_requested("answer it and explain why"));
        assert!(super::direct_answer_requested("which one is correct"));
        // Working through a quiz: answering and moving on is allowed, and the
        // step filter below keeps it to Next/Previous.
        assert!(super::direct_answer_requested("answer this and click next"));
        assert!(super::direct_answer_requested("answer the question then go to the next one"));
        // Picking or sending an answer never is.
        assert!(!super::direct_answer_requested("give me the answer and click it"));
        assert!(!super::direct_answer_requested("answer the question and submit the test"));
        assert!(!super::direct_answer_requested("answer this and select the right option"));
        assert!(!super::direct_answer_requested("answer them all and finish the test"));
        // Not about answering at all.
        assert!(!super::direct_answer_requested("explain this page to me"));
        assert!(!super::direct_answer_requested("open my email"));
        assert!(!super::direct_answer_requested("Next question\n\n(The conversation just before, oldest first: User: give me the answer)"));
        let look = super::Look { options: vec!["b. botnet".into()], test_page: true, ..Default::default() };
        let mut plan = crate::model::VisionPlan { summary: "B. Botnet. It is a network of infected devices.".into(), ..Default::default() };
        let mut steps = vec![serde_json::from_value(serde_json::json!({"action":"click","x":10,"y":10})).unwrap()];
        super::apply_answer_mode(&mut plan, &mut steps, &look, "give me the answer");
        assert!(plan.summary.starts_with("B. Botnet."));
        assert!(steps.is_empty(), "an answer request cannot authorize page actions");
    }

    #[test]
    fn promises_action_tells_a_promise_from_an_answer() {
        for s in [
            "Bet, hitting that Continue button for you, no cap.",
            "Say less, I got you fam — clicking Continue right now.",
            "Opening Blackboard for you now.",
            "Clicking the first Blackboard link for you now, Solomon.",
            "Let me wait for the Blackboard page to finish loading.",
            "Signing you in to Blackboard now.",
            "Bet, let me get you to Chrome, fam.",
            "The page is still loading — let me wait a moment for it to finish.",
            "Say less, I'm on it — Chrome, here we go.",
        ] {
            assert!(promises_action(s), "{s}");
        }
        for s in [
            "Your next assignment is due Friday at 11:59 PM.",
            "All set — I saved it after checking the totals.",
            "Done — saved it, then checking the next one.",
            "I can't open that — it needs your password.",
            "That's a photo of a sunset over the ocean.",
            "Done — the file is saved to your Desktop.",
            "",
        ] {
            assert!(!promises_action(s), "{s}");
        }
    }

    #[test]
    fn the_last_word_doesnt_say_it_again() {
        assert!(restates("Chill music's already rolling on YouTube. You good.", "Got you. Playing some chill music now."));
        assert!(restates("Notepad's open.", "Opening Notepad for you."));
        assert!(!restates("Your total is $42.10.", "Opening your cart."));
        assert!(!restates("Sent it — Maria will see it in her inbox.", "Writing the email now."));
        assert!(!restates("All set.", ""));
        assert_eq!(drop_already_said("Yo Solomon, I already broke that one down for you — the answer is B, Personally identifiable information."), "Yo Solomon — the answer is B, Personally identifiable information.");
        assert_eq!(drop_already_said("Like I said, the answer is B."), "The answer is B.");
        assert_eq!(drop_already_said("The answer is B, as I said. It's PII."), "The answer is B. It's PII.");
        assert_eq!(drop_already_said("I already explained it."), "Done.");
        assert_eq!(drop_already_said("The answer is C."), "The answer is C.");
        // The conversation reaches the screen agent when the request leans on it.
        let recent = vec![
            crate::chat::Turn::new("user", "which webcam fits my ThinkPad T14?"),
            crate::chat::Turn::new("assistant", "The Lenovo 5M11C21471 camera module fits the T14 Gen 1."),
            crate::chat::Turn::new("user", "open amazon and find that one"),
        ];
        let asked = with_conversation("open amazon and find that one", "open amazon and find that one", &recent);
        assert!(asked.contains("5M11C21471") && asked.contains("User: which webcam") && !asked.ends_with("User: open amazon and find that one)"), "{asked}");
        assert_eq!(with_conversation("open notepad and write a long shopping list for the week with eggs and bread and milk please", "open notepad and write a long shopping list for the week with eggs and bread and milk please", &recent), "open notepad and write a long shopping list for the week with eggs and bread and milk please", "a long new request stands alone");
        assert_eq!(with_conversation("open it", "open it", &[]), "open it");
        assert_eq!(drop_already_said("Maria already answered your email."), "Maria already answered your email.");
        assert!(!restates("Opened Notepad and wrote the whole shopping list: eggs, bread, milk, coffee, rice, beans.", "Opening Notepad now."));
    }


    #[test]
    fn knows_what_runs_on_this_pc() {
        assert!(on_this_pc("http://localhost:20128/v1"));
        assert!(on_this_pc("http://127.0.0.1:11434"));
        assert!(!on_this_pc("https://openrouter.ai/api/v1"));
    }

    use crate::model::ActionStep;

    fn step(v: serde_json::Value) -> ActionStep {
        serde_json::from_value(v).unwrap()
    }

    #[test]
    fn terminal_basics_are_only_exempt_during_a_lesson() {
        for line in ["cls", "echo Hello", "mkdir practice", "git status"] {
            let typed = || step(serde_json::json!({ "action": "type", "text_to_type": line }));
            assert!(guard_steps(&mut vec![typed()], "teach me terminal basics", true, "windowsterminal").is_none(), "{line}");
            assert!(guard_steps(&mut vec![typed()], "inspect my project", false, "windowsterminal").is_some(), "{line}");
        }
        for line in ["echo %PATH%", "echo hello\rdel file", "Get-ChildItem | ForEach-Object { Remove-Item $_ }", "mkdir C:\\outside", "echo hi > file", "echo hi & del file"] {
            assert!(!safe_terminal_line(line), "{line}");
        }
    }

    #[test]
    fn commands_only_when_spelled_out() {
        let mut steps = vec![
            step(serde_json::json!({ "action": "click", "x": 5, "y": 5 })),
            step(serde_json::json!({ "action": "type", "text_to_type": "git status" })),
            step(serde_json::json!({ "action": "key", "key": "enter" })),
        ];
        assert!(guard_steps(&mut steps, "check my code for bugs", false, "code").is_some());
        assert_eq!(steps.len(), 1);
        let mut steps = vec![step(serde_json::json!({ "action": "type", "text_to_type": "git status" }))];
        assert!(guard_steps(&mut steps, "open a terminal and run git status", false, "windowsterminal").is_none());
        assert_eq!(steps.len(), 1);
        // Ordinary typing elsewhere is fine.
        let mut steps = vec![step(serde_json::json!({ "action": "type", "text_to_type": "hello there" }))];
        assert!(guard_steps(&mut steps, "write hello there", false, "notepad").is_none());
    }

    #[test]
    fn screen_notes_only_when_explaining() {
        let note = || step(serde_json::json!({ "action": "draw", "shape": "note", "text_to_type": "This part details the session", "x": 10, "y": 10 }));
        let mut steps = vec![note()];
        assert!(guard_steps(&mut steps, "check for bugs", false, "code").is_some());
        assert!(steps.is_empty());
        let mut steps = vec![note()];
        assert!(guard_steps(&mut steps, "explain this page", false, "chrome").is_none());
    }

    fn radio(id: u32, name: &str) -> uia::Control {
        uia::Control { id, kind: "RadioButton".into(), name: name.into(), rect: crate::model::Rect::default(), hidden: false, value: String::new(), focused: false, below: false, section: String::new(), identity: None }
    }

    #[test]
    fn progress_lines_lose_their_filler() {
        assert_eq!(strip_filler("Bet, hold up — I'ma get that script written up for you, fam."), "I'ma get that script written up for you.");
        assert_eq!(strip_filler("Yo Solomon, I see the discussion prompt on Remote Work."), "I see the discussion prompt on Remote Work.");
        assert_eq!(strip_filler("Say less, let's knock out the Purpose section."), "Let's knock out the Purpose section.");
        assert_eq!(strip_filler("Opening the discussion."), "Opening the discussion.");
        assert_eq!(strip_filler("Okayed the change."), "Okayed the change.", "not part of a word");
        assert_eq!(strip_filler("Yo Solomon— opening the lab now."), "Opening the lab now.", "an em dash after a name, no panic");
        assert_eq!(strip_filler("Word is open — typing the title."), "Word is open — typing the title.", "the app, not filler");
        assert_eq!(strip_filler("Sure, Notepad, then Word."), "Notepad, then Word.", "a name only straight after a greeting");
        assert!(keeps_notes("review all the quests and ans and save on the notes for me to study"));
        assert!(keeps_notes("go over my results and put them in my notes"));
        assert!(!keeps_notes("don't save this to my notes"));
        assert!(!keeps_notes("do not write it in my notes"));
        assert!(!keeps_notes("never put this in my notebook"));
        // Musical notes are not Izuki Notes.
        assert!(!keeps_notes("make the 808 notes line up with the kick"));
        assert!(!keeps_notes("help me quantize this 808 notes cos they not aligning with the beat"));
        assert!(!keeps_notes("put the notes on the beat in fl studio"));
        assert!(keeps_notes("explain this beat and save it to my notes"), "Izuki's Notes named outright");
        assert!(!keeps_notes("review all the questions"));
        assert!(explains_as_it_goes("review all the quests and ans"));
        assert!(keeps_notes("go over this and take notes"));
        assert!(!keeps_notes("don't take notes"));
        assert!(only_progress("Moving to Question 4."));
        assert_eq!(todo_line(&[("Open Blackboard".into(), true), ("Read due dates".into(), false)]), "[x] Open Blackboard; [ ] Read due dates");
        let old = vec![("Open Blackboard".to_string(), true), ("Read due dates".to_string(), false), ("Save to notes".to_string(), false)];
        let new = vec![("Open Blackboard".to_string(), true), ("read  due dates".to_string(), true)];
        assert_eq!(merge_todo(&old, &new), vec![("Open Blackboard".into(), true), ("read  due dates".into(), true), ("Save to notes".into(), false)], "a dropped open item stays");
        assert!(!only_progress("Phishing tricks people into giving away passwords."));
        assert!(!explains_as_it_goes("open spotify"));
        assert_eq!(strip_filler("Bet."), "");
    }

    #[test]
    fn hard_questions_get_the_strong_brain() {
        assert!(needs_thought("why does the moon change shape?"));
        assert!(needs_thought("explain the difference between a virus and a worm"));
        assert!(!needs_thought("hi"));
        assert!(!needs_thought("thanks!"));
        let cfg = |id: crate::settings::ProviderId, model: &str| crate::settings::ProviderConfig { id, model: model.into(), label: model.into(), base_url: String::new(), api_key: String::new(), enabled: true };
        let mut chain = vec![cfg(crate::settings::ProviderId::Groq, "llama-3.1-8b-instant"), cfg(crate::settings::ProviderId::Openrouter, "free"), cfg(crate::settings::ProviderId::Gemini, "gemini-2.5-flash")];
        prefer_strong(&mut chain);
        assert_eq!(chain[0].model, "gemini-2.5-flash");
        assert_eq!(chain[1].model, "llama-3.1-8b-instant", "the fast one stays as the first backup");
    }

    #[test]
    fn final_buttons_and_tests_wait_for_the_student() {
        let click = |name: &str| {
            let mut s = step(serde_json::json!({ "action": "click" }));
            s.snapped_to = Some(name.into());
            s
        };
        let none = Look::default();
        // A whole quiz done by the AI and submitted at the end: never.
        let mut steps = vec![click("Next"), click("Submit")];
        assert!(guard_steps_with(&mut steps, "do this quiz for me", false, "chrome", &none).is_some());
        assert_eq!(steps.len(), 1, "Next stays, Submit is held");
        let mut steps = vec![click("End Test")];
        assert!(guard_steps_with(&mut steps, "finish it", false, "chrome", &none).is_some());
        // Work thrown away is final too, whatever the apostrophe.
        for name in ["Don't Save", "Don\u{2019}t Save", "Discard changes"] {
            let mut steps = vec![click(name)];
            assert!(guard_steps_with(&mut steps, "line my 808 up", false, "fl64", &none).is_some(), "{name}");
        }
        // Said in so many words: fine.
        let mut steps = vec![click("Submit")];
        assert!(guard_steps_with(&mut steps, "yes submit it", false, "chrome", &none).is_none());
        let mut steps = vec![click("Send")];
        assert!(guard_steps_with(&mut steps, "send it", false, "outlook", &none).is_none());
        // Saying something near it isn't saying it.
        let mut steps = vec![click("Checkout")];
        assert!(guard_steps_with(&mut steps, "check my cart", false, "chrome", &none).is_some(), "checking a cart isn't checking out");
        // Everything else nobody would forgive Izuki for doing on its own:
        // destroying something, spending money, or reaching other people.
        for name in [
            "Erase disk", "Wipe device", "Format drive", "Uninstall", "Empty bin", "Delete forever",
            "Permanently delete", "Factory reset", "Overwrite file", "Donate", "Confirm payment",
            "Buy now", "Place bid", "Share", "Invite people", "Send invite", "Reply all", "Go live",
            "Revoke", "Deactivate", "Close account", "Cancel subscription", "Unsubscribe", "Grant access",
        ] {
            let mut steps = vec![click(name)];
            assert!(
                guard_steps_with(&mut steps, "sort this page out for me", false, "chrome", &none).is_some(),
                "\"{name}\" must not be pressed on Izuki's own initiative"
            );
            assert!(steps.is_empty(), "\"{name}\" should have been held back");
        }
        // Still only whole words, so ordinary buttons stay instant.
        for name in ["Sharepoint", "Formatting", "Postcode", "Deleted items", "Buyer guide", "Shared with me"] {
            let mut steps = vec![click(name)];
            assert!(
                guard_steps_with(&mut steps, "open that", false, "chrome", &none).is_none(),
                "\"{name}\" is not a final button and must not be held back"
            );
        }
        let mut steps = vec![click("Finish attempt")];
        assert!(guard_steps_with(&mut steps, "finish it", false, "chrome", &none).is_some());
        let mut steps = vec![click("Submit")];
        assert!(guard_steps_with(&mut steps, "fill it in but don't submit", false, "chrome", &none).is_some());
        // Each final step needs its own yes.
        let mut steps = vec![click("Send"), click("Delete")];
        assert!(guard_steps_with(&mut steps, "send it", false, "outlook", &none).is_some());
        assert_eq!(steps.len(), 1, "the send was asked for, the delete wasn't");
        // Not final.
        let mut steps = vec![click("Sending options"), click("Postcode")];
        assert!(guard_steps_with(&mut steps, "open settings", false, "chrome", &none).is_none(), "words that merely start the same aren't final");
        // On a test page, the answer is the student's.
        let quiz = Look { options: vec!["a. phishing".into(), "b. personally identifiable information".into()], test_page: true, ..Default::default() };
        let mut steps = vec![click("B. Personally identifiable information"), click("Next")];
        assert!(guard_steps_with(&mut steps, "help me with this question", true, "chrome", &quiz).is_some());
        assert_eq!(steps.len(), 1, "the answer isn't clicked; Next is the student's call but harmless");
        let controls = vec![
            radio(1, "A. Phishing"),
            radio(2, "B. PII"),
        ];
        assert!(Look::of(&controls, "Question 3 of 20", "uCertify").test_page);
        assert!(Look::of(&controls, "", "Test 3 - Network Security").test_page, "\"Test\" at the very start");
        // Said and drawn on a quiz page: the question explained, the answer kept out.
        let look = Look { options: vec!["a. phishing".into(), "b. personally identifiable information".into()], test_page: true, choice_rects: vec![Rect { x: 100, y: 300, w: 400, h: 30 }] };
        let mut plan = VisionPlan { summary: "This one is about data that can identify someone. The answer is B, personally identifiable information.".into(), ..Default::default() };
        let mark = |words: &str| step(serde_json::json!({ "action": "draw", "shape": "underline", "x": 10, "y": 10, "text_to_type": words }));
        let mut steps = vec![mark("personally identifiable information"), mark("identify a person")];
        keep_answers_out(&mut plan, &mut steps, &look);
        assert_eq!(plan.summary, "This one is about data that can identify someone.");
        assert_eq!(steps.len(), 1, "the mark on the question's own words stays");
        // Not a test page: nothing changes.
        let mut plan2 = VisionPlan { summary: "The answer is B.".into(), ..Default::default() };
        let mut steps2 = vec![mark("phishing")];
        keep_answers_out(&mut plan2, &mut steps2, &Look { options: vec!["a. phishing".into()], test_page: false, ..Default::default() });
        assert_eq!((plan2.summary.as_str(), steps2.len()), ("The answer is B.", 1));
        // A circle placed on a choice by position alone is dropped too.
        let mut plan3 = VisionPlan::default();
        let mut steps3 = vec![step(serde_json::json!({ "action": "draw", "shape": "circle", "x": 150, "y": 310 })), step(serde_json::json!({ "action": "draw", "shape": "circle", "x": 150, "y": 100 }))];
        keep_answers_out(&mut plan3, &mut steps3, &look);
        assert_eq!(steps3.len(), 1, "only the mark off the choices stays");
        // A quick swipe across a choice (points either side of it) is dropped.
        let mut steps4 = vec![step(serde_json::json!({ "action": "stroke", "x": 50, "y": 250, "path": [[50, 250], [300, 360]] }))];
        keep_answers_out(&mut VisionPlan::default(), &mut steps4, &look);
        assert!(steps4.is_empty());
        // A question to the user can't name a choice either.
        let mut plan5 = VisionPlan { ask: Some("Do you want to go with personally identifiable information?".into()), ..Default::default() };
        keep_answers_out(&mut plan5, &mut Vec::new(), &look);
        assert!(!plan5.ask.unwrap().to_lowercase().contains("personally identifiable"));
        assert!(!Look::of(&controls, "Choose your shipping speed", "Checkout").test_page, "radio buttons alone aren't a test");
        assert_eq!(steps.len(), 1);
    }

    use super::*;

    #[test]
    fn reads_host_and_port_from_a_local_address() {
        assert_eq!(host_port("http://localhost:20128/v1"), Some(("localhost".into(), 20128)));
        assert_eq!(host_port("http://127.0.0.1:11434"), Some(("127.0.0.1".into(), 11434)));
        assert_eq!(host_port("https://example.com/v1"), Some(("example.com".into(), 443)));
    }

    #[test]
    fn completion_requires_a_followup_observation_not_an_intention() {
        let mut plan = VisionPlan { done: true, summary: "The file is visible in Downloads".into(), ..Default::default() };
        assert!(!completion_observed(&plan, true, 0));
        assert!(completion_observed(&plan, true, 1));
        assert!(!completion_observed(&plan, false, 1));
        plan.summary = "Opening it for you".into();
        assert!(!completion_observed(&plan, true, 1));
        plan.summary = "Done".into();
        plan.wait = 2;
        assert!(!completion_observed(&plan, true, 1));
    }

    #[test]
    fn interrupted_execution_cannot_keep_a_model_success_claim() {
        let step: ActionStep = serde_json::from_value(serde_json::json!({"action":"key", "key":"ctrl+s"})).unwrap();
        let mut plan = VisionPlan { done: true, summary: "Done, saved your file".into(), steps: vec![step], ..Default::default() };
        finalize_execution(&mut plan, false);
        assert!(!plan.done);
        assert!(!plan.summary.contains("saved your file"));
        assert!(plan.summary.contains("could verify"));
        plan.summary = "The requested file is visible".into();
        finalize_execution(&mut plan, true);
        assert!(plan.done);
        assert_eq!(plan.summary, "The requested file is visible");
    }
    use crate::settings::{ProviderId, Settings};

    #[test]
    fn notices_apps_the_task_never_asked_for() {
        assert!(unexpected_app_note("open the recycle bin so I can check", "systemsettings").is_some());
        assert!(unexpected_app_note("open the recycle bin", "explorer").is_none());
        assert!(unexpected_app_note("turn on bluetooth", "systemsettings").is_none());
        assert!(unexpected_app_note("open my blackboard", "chrome").is_none());
        assert!(unexpected_app_note("open spotify and play lofi", "spotify").is_none());
        assert!(unexpected_app_note("write a poem in notepad", "winword").is_some());
    }

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
    fn small_models_step_back_for_questions() {
        assert!(small_model("meta/llama-3.2-11b-vision-instruct"));
        assert!(small_model("llama-3.1-8b-instant"));
        assert!(!small_model("qwen/qwen3.8-27b"));
        assert!(!small_model("gemini-flash-latest"));
        assert!(!small_model("google/gemma-4-31b-it:free"));
        assert!(!small_model("meta/llama-4-maverick-17b-128e-instruct"));
        let cfg = |id: crate::settings::ProviderId, model: &str| {
            let mut c = crate::settings::Settings::default().provider(id).cloned().unwrap();
            c.model = model.into();
            c
        };
        let mut chain = vec![
            cfg(crate::settings::ProviderId::Nvidia, "meta/llama-3.2-11b-vision-instruct"),
            cfg(crate::settings::ProviderId::Gemini, "gemini-flash-latest"),
        ];
        smartest_first(&mut chain);
        assert_eq!(chain[0].id, crate::settings::ProviderId::Gemini);
        assert!(rest_for("error sending request for url (http://localhost:20128/v1/chat/completions)").is_some_and(|d| d.as_secs() == 300));
        assert!(rest_for("error sending request for url (https://integrate.api.nvidia.com/v1)").is_none());
    }

    #[test]
    fn marks_fit_the_words_they_are_aimed_at() {
        let words = Rect { x: 400, y: 300, w: 180, h: 30 };
        let mark = |shape: &str| -> ActionStep {
            serde_json::from_value(serde_json::json!({ "action": "draw", "shape": shape, "text_to_type": "total cost" })).unwrap()
        };
        let mut b = mark("box");
        place_mark(&mut b, words);
        assert_eq!((b.x, b.y, b.x2, b.y2), (400, 300, Some(580), Some(330)), "round the words");
        let mut u = mark("underline");
        place_mark(&mut u, words);
        assert_eq!((u.x, u.y, u.x2, u.y2), (400, 330, Some(580), Some(330)), "along the bottom of the words");
        let mut a = mark("arrow");
        place_mark(&mut a, words);
        assert_eq!((a.x2, a.y2), (Some(394), Some(315)), "the arrow's head at the words' left edge");
    }

    #[test]
    fn a_note_without_a_place_goes_under_the_last_mark() {
        let mark: ActionStep = serde_json::from_value(serde_json::json!({ "action": "draw", "shape": "box", "x": 400, "y": 300, "x2": 580, "y2": 330 })).unwrap();
        let note: ActionStep = serde_json::from_value(serde_json::json!({ "action": "draw", "shape": "note", "text_to_type": "= $6" })).unwrap();
        let lone: ActionStep = serde_json::from_value(serde_json::json!({ "action": "draw", "shape": "note", "text_to_type": "?" })).unwrap();
        let empty = Frame { width: 0, height: 0, origin: (0, 0), bgra: Vec::new() };

        let mut steps = vec![mark, note];
        anchor_marks(&mut steps, &empty);
        assert_eq!((steps[1].x, steps[1].y), (400, 364), "written just under the box");

        let mut alone = vec![lone];
        anchor_marks(&mut alone, &empty);
        assert!(alone.is_empty(), "nothing marked before it: not drawn in a corner");
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
        // Anything that spends money, hands out access, reaches other people,
        // or can't be undone goes the long way round — being on that list
        // only costs a second, and leaving something off it costs a click
        // nobody agreed to.
        for said in [
            "click Reset", "press Empty Trash", "click Share", "press Invite", "click Allow",
            "press Agree", "click Install", "press Deactivate", "click Unsubscribe", "press Revoke",
            "click Discard", "press Overwrite", "click Donate", "press Leave meeting", "click Block",
        ] {
            assert_eq!(named_target(said), None, "{said} must be confirmed, not clicked straight away");
        }
        // But not the ordinary things people ask for all day. Blocking these
        // would make Izuki slower at exactly what it's for: Subscribe and
        // Upgrade are free in most apps, Forward is a browser button, and
        // Reply all only opens a draft — Send is what commits it.
        for (said, want) in [
            ("click Subscribe", "subscribe"),
            ("press Upgrade", "upgrade"),
            ("click Forward", "forward"),
            ("press Reply all", "reply all"),
        ] {
            assert_eq!(named_target(said).as_deref(), Some(want), "{said} is harmless and asked for constantly");
        }
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
            section: String::new(),
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
        // The provider's own "try again in …" is used (at least 5 s).
        let groq = "HTTP 429 Too Many Requests: {\"error\":{\"message\":\"Rate limit reached for model `qwen` on tokens per minute (TPM): Limit 6000, Used 5000. Please try again in 7.2s.\"}}";
        assert_eq!(rest_for(groq), Some(std::time::Duration::from_millis(7200)));
        assert_eq!(retry_after("please try again in 1m30s."), Some(std::time::Duration::from_secs(90)));
        assert_eq!(retry_after("rate limit, retry after 12 seconds"), Some(std::time::Duration::from_secs(12)));
        assert_eq!(retry_after("please try again in 250ms"), Some(std::time::Duration::from_millis(250)));
        assert_eq!(rest_for("429 rate limit — please try again in 250ms"), Some(std::time::Duration::from_secs(5)));
        assert_eq!(retry_after("429 too many requests"), None);
        // Again and again: each rest twice the last, capped at 15 minutes.
        let id = crate::settings::ProviderId::Mistral;
        let one = std::time::Duration::from_secs(60);
        assert_eq!(escalate(id, one), one);
        assert_eq!(escalate(id, one), one * 2);
        assert_eq!(escalate(id, one), one * 4);
        for _ in 0..6 {
            escalate(id, one);
        }
        assert_eq!(escalate(id, one), std::time::Duration::from_secs(15 * 60));
        STRIKES.lock().retain(|(p, _, _)| *p != id);
        assert!(rest_for("groq is rate-limiting you (429 Too Many Requests): Request too large for model `qwen`").is_none());
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
        // Groq's per-minute limit mentions "Used 4029" — not a 402, not hopeless.
        assert!(!is_hopeless("groq is rate-limiting you (429 Too Many Requests): Rate limit reached for model `qwen` in organization `org_example01` on input tokens per minute (ITPM): Limit 7000, Used 4029, Requested 4059. Please try again in 9.3s. Need more tokens? Upgrade to Dev Tier today"));
        assert!(is_hopeless("payment needed (402 Payment Required)"));
        assert!(!is_hopeless("took 4021 ms"));
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
        assert!(!is_yes("yesterday's meeting"), "a longer word that starts 'yes' is not an answer");
        assert!(!is_yes("no"));
        assert!(!is_yes("not yet"));
        // A real sentence that merely begins "yes" is a new request, not an answer.
        assert!(!is_yes("yes tell me about the weather"));
        assert!(!is_yes("yes I know that, but can you open my Downloads folder instead"));
        assert!(!is_yes(""));
    }

    #[test]
    fn keep_going_resumes() {
        assert!(is_follow_on("continue"));
        assert!(is_follow_on("now play the next one"));
        assert!(!is_follow_on("open youtube and search for the best lofi music for studying late at night please"));
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

    #[test]
    fn the_same_goal_is_noticed_across_rounds() {
        let a = goal_words("Opening Blackboard to check your assignments.");
        let b = goal_words("Opening Blackboard in Chrome now.");
        let c = goal_words("Opening Blackboard now.");
        assert!(same_goal(&a, &c) && same_goal(&b, &c));
        assert!(same_goal(&goal_words("Clicking the first link on the left now."), &goal_words("Clicking that first link for you now.")));
        assert!(!same_goal(&goal_words("Opening Blackboard now."), &goal_words("Typing your password into the box.")));
        assert!(!same_goal(&goal_words("Searching for flights to Lagos."), &goal_words("Opening the Settings app.")));
    }
}

#[cfg(test)]
mod window_tests {
    use super::asked_for_window;

    #[test]
    fn closing_or_hiding_a_window_only_when_asked() {
        assert!(!asked_for_window("line my 808 up with the beat", "close"));
        assert!(!asked_for_window("get into fl's midi settings and enable izuki", "minimise"));
        assert!(!asked_for_window("open chrome and search afro beats", "maximise"));
        assert!(asked_for_window("close notepad", "close"));
        assert!(asked_for_window("minimise everything", "minimise"));
        assert!(asked_for_window("make chrome full screen", "maximise"));
        assert!(asked_for_window("", "close"), "a replay does what was recorded");
        assert!(!asked_for_window("take a closer look at the mixer", "close"));
        assert!(!asked_for_window("don't close fl studio", "close"));
        assert!(!asked_for_window("never minimise my windows", "minimise"));
    }
}

#[cfg(test)]
mod failure_tests {
    #[test]
    fn a_person_can_understand_why_nothing_answered() {
        // The real strings from a user's log, joined as they were shown.
        let busy = vec![
            "Groq (free, very fast): groq is rate-limiting you (429 Too Many Requests): Rate limit reached for model `qwen/qwen3.8-27b` in organization `org_examplexxxxxxxxxxxxxxxxxx` service tier `on_demand` on input tokens per minute (ITPM): Limit 7000, Used 1291, Requested 6038. Please try again in 2.82s.".to_string(),
            "OpenRouter: openrouter is rate-limiting you (429 Too Many Requests): Provider returned error.".to_string(),
        ];
        let said = super::why_none_answered(&busy);
        assert!(said.contains("busy"), "{said}");
        // Never the raw refusal, the model name, or the account id.
        assert!(!said.contains("429") && !said.contains("org_") && !said.contains("qwen"), "{said}");
        assert!(said.chars().count() < 280, "too long to read: {said}");

        // Out of credit needs a different answer: waiting won't help.
        let broke = vec!["openai is rate-limiting you (429): You have no credits remaining".to_string()];
        assert!(super::why_none_answered(&broke).contains("no free credit"));

        // The internet being down is not the AI being busy.
        let offline = vec!["error sending request for url (https://generativelanguage.googleapis.com/)".to_string()];
        assert!(super::why_none_answered(&offline).contains("internet"));

        // A bad key says so.
        assert!(super::why_none_answered(&["401 Unauthorized: invalid api key".to_string()]).contains("key"));

        // Izuki's own clear messages must survive untouched.
        let mine = "that's a PDF — open it on screen and I'll read it there";
        assert_eq!(super::plain_error(mine), mine);
        assert_eq!(super::plain_error("I couldn't find an assignment on the screen."), "I couldn't find an assignment on the screen.");
        // A provider's refusal is rewritten.
        let raw = "groq is rate-limiting you (429 Too Many Requests): Limit 7000, Used 1291";
        assert!(!super::plain_error(raw).contains("429"));

        // Anything unrecognised still gets a usable sentence, never a dump.
        let odd = super::why_none_answered(&["something nobody has seen before".to_string()]);
        assert!(!odd.is_empty() && !odd.contains("something nobody"), "{odd}");
    }
}

#[cfg(test)]
mod honesty_tests {
    use super::{action_progress, after_input_wait, can_resume_after_input, new_among, only_repeats, plainly, promises_action, ActionStep, Duration, Intent, Yielded};

    #[test]
    fn human_input_timeout_never_resumes_a_step() {
        assert_eq!(after_input_wait(true, Duration::ZERO, Some(7), Some(7)), Yielded::Busy);
        assert_eq!(after_input_wait(true, Duration::from_secs(2), Some(7), Some(7)), Yielded::WaitedSameWindow);
        assert_eq!(after_input_wait(true, Duration::from_secs(2), Some(7), Some(8)), Yielded::Moved);
        assert_eq!(after_input_wait(true, Duration::from_secs(2), None, None), Yielded::Moved);
        assert_eq!(after_input_wait(false, Duration::from_secs(2), Some(7), Some(7)), Yielded::Moved);
    }

    #[test]
    fn same_window_input_still_requires_a_verifiable_target() {
        let mut step: ActionStep = serde_json::from_value(serde_json::json!({"action":"click", "x":120, "y":240})).unwrap();
        assert!(!can_resume_after_input(&step), "raw coordinates can point to different content after a scroll");
        step.snapped_to = Some("Next".into());
        assert!(can_resume_after_input(&step));
        step.hover_first = true;
        assert!(!can_resume_after_input(&step), "hover-only targets bypass name checks");
        step.hover_first = false;
        step.action = Intent::Type;
        assert!(!can_resume_after_input(&step), "typing must not trust the user's changed focus");
        step.action = Intent::Key;
        assert!(!can_resume_after_input(&step));
    }

    #[test]
    fn progress_distinguishes_content_and_changed_screens() {
        let mut step: ActionStep = serde_json::from_value(serde_json::json!({"action":"type", "text_to_type":"first"})).unwrap();
        let first = action_progress(&step);
        step.reasoning = "A different model explanation".into();
        assert_eq!(first, action_progress(&step));
        step.text_to_type = Some("second".into());
        assert_ne!(first, action_progress(&step));
        step.action = Intent::Key;
        step.key = Some("ctrl+a".into());
        let select = action_progress(&step);
        step.key = Some("enter".into());
        assert_ne!(select, action_progress(&step));
        let mut scroll: ActionStep = serde_json::from_value(serde_json::json!({"action":"scroll", "x":300, "y":400, "key":"down"})).unwrap();
        let seen = vec![(1usize, action_progress(&scroll))];
        assert!(only_repeats(&[(1, action_progress(&scroll))], &seen));
        assert!(!only_repeats(&[(2, action_progress(&scroll))], &seen), "the page visibly advanced");
        scroll.key = Some("up".into());
        assert!(!only_repeats(&[(1, action_progress(&scroll))], &seen));
        assert_eq!(new_among(&[1, 1, 2, 2], &[1]), 1, "duplicates within this window aren't new progress");
    }

    /// The log caught the agent spending seven rounds on one quiz page —
    /// over a minute, and a screen look each — re-reading the same four
    /// answers: "let's check option C", "and option D", round after round.
    /// Every round did steps, so every count-based check was happy.
    #[test]
    fn redoing_the_same_steps_is_not_progress() {
        // What the agent is compared on: the action and where it happened,
        // on a coarse grid. Not the model's description of it, which differs
        // every round even when the clicks are identical.
        let a = (Intent::Click, 40, 25);
        let b = (Intent::Click, 40, 31);
        let next = (Intent::Click, 70, 60);
        let seen = vec![a, b];
        // A round that only goes over old ground, in either order.
        assert!(only_repeats(&[a], &seen));
        assert!(only_repeats(&[b, a], &seen));
        // One new thing among the repeats is progress.
        assert!(!only_repeats(&[a, next], &seen));
        // A round with no steps is a look, not a loop — the idle-round count
        // owns that case, and counting it here would stop a task that is
        // legitimately waiting for a page to load.
        assert!(!only_repeats::<(Intent, i32, i32)>(&[], &seen));
        // The every-so-often progress check counts new ground only.
        assert_eq!(new_among(&[a, b], &seen), 0);
        assert_eq!(new_among(&[a, next], &seen), 1);
        assert_eq!(new_among::<(Intent, i32, i32)>(&[], &seen), 0);
        assert_eq!(new_among(&[next], &[]), 1);
        // The real case from the log: four answers clicked in round 1, the
        // same four clicked again in round 5 — different words from the
        // model each time, the same ground underneath.
        let quiz = vec![(Intent::Click, 40, 25), (Intent::Click, 40, 31), (Intent::Click, 40, 37), (Intent::Click, 40, 43)];
        assert!(only_repeats(&quiz.clone(), &quiz), "the same four answers again is a loop");
        // Clicking Next after them is getting somewhere.
        let mut moved_on = quiz.clone();
        moved_on.push(next);
        assert!(!only_repeats(&moved_on, &quiz));
    }

    #[test]
    fn promises_in_any_words_are_promises() {
        // The reply that was spoken instead of an action.
        assert!(promises_action("Alright, since you said yes, I'm finna run the Disk Cleanup utility to clear out those safe temporary files for you"));
        assert!(promises_action("Bet, gonna clean that up for you"));
        assert!(promises_action("I'm about to quantize those 808s"));
        assert!(!promises_action("I couldn't run that — the terminal wasn't open"), "a refusal");
        assert!(!promises_action("Done — cleared 1.8 GB of temp files"));
        // A refusal decides its own clause only.
        assert!(!promises_action("I can't do that right now"));
        assert!(!promises_action("I can\u{2019}t open that one"), "curly apostrophe");
        assert!(!promises_action("I can't open that, sorry. Let me know if you need anything else"));
        assert!(promises_action("I didn't type the command, gonna run it now"));
        assert!(promises_action("That didn't work. Let me try the Start menu instead"));
        assert!(promises_action("I couldn't find it so let me scroll down"));
        assert!(!promises_action("I can't do that right away"));
        assert!(promises_action("Let me wait for it — the page wasn't ready"));
        assert!(promises_action("I can't, but I'll try the other button"));
        // News, not a promise.
        assert!(!promises_action("Your PC is running Windows 11, version 24H2"));
        assert!(!promises_action("It's gonna rain later today"));
        assert!(!promises_action("Your battery is about to die — plug in soon"));
        assert!(!promises_action("Windows was updating overnight, so it restarted"));
        assert!(promises_action("I'm running Disk Cleanup now"));
        // What a held-back step sounds like to the person.
        let said = plainly("Typing a command into a terminal wasn't done: commands are only run when the user spells out the exact command.");
        assert!(said.starts_with("I didn't type that command") && !said.contains("finna"));
        assert!(plainly("Pressing “Submit” wasn't done: it's final.").contains("“Submit”"));
    }

    #[test]
    fn a_stated_wait_is_honoured_instead_of_doubled() {
        // "Please try again in 15s" is the provider telling us the answer.
        // Escalating it anyway benched the fastest free brain twice as long
        // as it asked, and the silence read as the app freezing.
        let id = crate::settings::ProviderId::Groq;
        let clear = || {
            super::RESTING.lock().retain(|(p, _)| *p != id);
            super::STRIKES.lock().retain(|(p, _, _)| *p != id);
        };
        clear();
        let said = "groq: 429 Too Many Requests: Limit 7000. Please try again in 15s.";
        super::note_failure(id, said);
        super::note_failure(id, said);
        let woke = super::provider_wake().expect("a stated per-minute window is worth waiting for");
        assert!(woke <= std::time::Duration::from_secs(16), "still resting {woke:?} when the provider asked for 15 s");
        // No stated time at all still backs off, so a queue isn't made longer.
        clear();
        super::note_failure(id, "429 Too Many Requests");
        super::note_failure(id, "429 Too Many Requests");
        assert!(super::provider_wake().unwrap() > std::time::Duration::from_secs(60));
        clear();
    }

    #[test]
    fn a_brain_that_is_out_for_hours_is_not_waited_for() {
        // A local brain that isn't running rests five minutes. Waiting for it
        // would stall the task; the right move is a different brain.
        let id = crate::settings::ProviderId::NineRouter;
        super::RESTING.lock().retain(|(p, _)| *p != id);
        super::RESTING.lock().push((id, std::time::Instant::now() + std::time::Duration::from_secs(300)));
        assert!(super::provider_wake().is_none());
        super::RESTING.lock().retain(|(p, _)| *p != id);
    }

    #[test]
    fn an_empty_brain_pool_is_waited_out_not_called_a_settings_problem() {
        // The line the agent got while every free model was resting. It used
        // to read "configured models may be resting or too small", which the
        // retry loop saw as permanent, cut itself to two tries, and threw the
        // task away 21 s into a 22 s allowance window.
        let allowance = "Every free AI I have is rate limited for another 22s — I'll wait for the first one back.";
        assert!(super::temporary_trouble(allowance), "a per-minute allowance must be waited out, not treated as permanent");
        // A genuine setup problem still fails fast instead of burning five tries.
        let setup = "None of the AI models set up can drive a screen — they're too small or have no key.";
        assert!(!super::temporary_trouble(setup));
    }
}
