//! A sharp eye for clicks. Most clicks name a real control by number — exact.
//! When the AI instead picks a spot by eye ("the blue Submit button" at a
//! guessed pixel), a model trained to point at things on screens looks again
//! before anything is clicked: Gemini by default (free with its key), or
//! ByteDance's UI-TARS through OpenRouter if that's switched on (paid, about
//! $0.0002 a look). The spot it points at is then matched to the real control
//! under it, so the click becomes an exact, verified one.
//!
//! At most two looks per plan, each given 8 seconds — a slow or missing
//! pointer never holds a task up; the plan just carries on as it was.

use std::time::Duration;

use base64::Engine;
use serde_json::{json, Value};

use crate::model::{ActionStep, Intent};
use crate::settings::ProviderId;
use crate::vision::VisionRequest;

const MAX_LOOKS: usize = 2;

/// UI-TARS refused (no credit, a bad key): the key it refused, so it isn't
/// asked again — every look was costing seconds for nothing — until the
/// OpenRouter key changes.
static TARS_REFUSED: parking_lot::Mutex<Option<(String, Option<std::time::Instant>)>> = parking_lot::Mutex::new(None);

fn openrouter_key() -> String {
    crate::state::try_store()
        .and_then(|s| s.settings().provider(ProviderId::Openrouter).map(|c| c.api_key.trim().to_string()))
        .unwrap_or_default()
}
const TARS_MODEL: &str = "bytedance/ui-tars-1.5-7b";

fn clicky(a: Intent) -> bool {
    matches!(a, Intent::Click | Intent::DoubleClick | Intent::RightClick | Intent::Hover | Intent::Auto)
}

/// What the AI meant to click, in words — its own reason for the step.
fn describe(s: &ActionStep) -> Option<String> {
    let r = s.reasoning.trim();
    (r.chars().count() >= 3).then(|| r.chars().take(160).collect())
}

/// Look again at every guessed click (no control id) and move it onto the
/// thing the words describe. Steps already pinned to a control are exact
/// and left alone. When the pointer answers but points somewhere it isn't
/// safe to go, the plans disagree: that click and everything after it are
/// dropped, and the next look decides. No answer at all leaves the plan as
/// it was.
pub fn refine(steps: &mut Vec<ActionStep>, req: &VisionRequest) {
    let Some(store) = crate::state::try_store() else { return };
    let s = store.settings();
    if !s.sharp_eye || req.image_size.0 == 0 || req.image_size.1 == 0 {
        return;
    }
    let mut looks = 0;
    let mut cut = None;
    for (i, step) in steps.iter_mut().enumerate() {
        if looks >= MAX_LOOKS {
            break;
        }
        if !clicky(step.action) || step.grounding.is_some() || step.target.is_some() || step.snapped_to.is_some() || (step.x == 0 && step.y == 0) {
            continue;
        }
        let Some(what) = describe(step) else { continue };
        looks += 1;
        let Some((ix, iy)) = locate(req, &what, s.sharp_eye_tars) else {
            // No pointer answer (busy, out of quota): read the words around
            // the plan's own guess and land on the button's label if it's there.
            if let Some((x, y)) = confirm_by_text(&what, step.x, step.y, 260, 120).filter(|&(x, y)| safe_under(req, &what, x, y)) {
                eprintln!("[sharp-eye] \"{what}\": no pointer answer — the label is on screen, moved to {x},{y}");
                step.x = x;
                step.y = y;
            }
            continue;
        };
        let (x, y) = to_desktop(req, ix, iy);
        if pin(step, req, &what, x, y) {
            eprintln!("[sharp-eye] \"{what}\": moved to {x},{y}");
        } else {
            eprintln!("[sharp-eye] \"{what}\": pointed at {x},{y}, which isn't safe to go to — dropping this click and the rest of the plan for a fresh look");
            cut = Some(i);
            break;
        }
    }
    if let Some(i) = cut {
        steps.truncate(i);
    }
}

/// Words that make a button one Izuki never lands on by a second guess.
const RISKY: &[&str] = &["delete", "remove", "uninstall", "erase", "format", "reset", "buy", "pay", "purchase", "checkout", "order", "send", "submit", "sign out", "log out", "logout", "unsubscribe", "password", "pin"];

fn words(s: &str) -> Vec<String> {
    const SKIP: &[&str] = &["click", "the", "button", "tap", "press", "link", "icon", "on", "to", "and", "for", "open", "select", "choose", "into", "this", "that"];
    s.to_lowercase()
        .split(|c: char| !c.is_alphanumeric())
        .filter(|w| w.len() >= 3 && !SKIP.contains(w))
        .map(str::to_string)
        .collect()
}

/// Does `text` say `risky` as a word ("Delete", "Deletes", "Sign out") —
/// not inside another one ("pinned" isn't "pin")?
fn says(text: &str, risky: &str) -> bool {
    let t = format!(" {} ", text.to_lowercase().split(|c: char| !c.is_alphanumeric()).filter(|w| !w.is_empty()).collect::<Vec<_>>().join(" "));
    let short = risky.len() <= 3;
    t.contains(&format!(" {risky} ")) || (!short && t.contains(&format!(" {risky}")) && !risky.contains(' '))
}

/// A control named for something risky that the plan never asked for.
fn unasked_risk(control: &str, what: &str) -> bool {
    RISKY.iter().any(|r| says(control, r) && !says(what, r))
}

/// Image pixels → desktop pixels (the same mapping the plan's steps use).
fn to_desktop(req: &VisionRequest, ix: f64, iy: f64) -> (i32, i32) {
    let (iw, ih) = req.image_size;
    let x = req.desktop.x + (ix * req.desktop.w as f64 / iw as f64).round() as i32;
    let y = req.desktop.y + (iy * req.desktop.h as f64 / ih as f64).round() as i32;
    (x, y)
}

/// The smallest real control under the point becomes the target (exact,
/// and verifiable before the click); with none there, the point itself.
/// A click only moves when that's safe: near the plan's own guess, or onto
/// a control whose name says what was meant — and never onto a risky one
/// (Delete, Buy, Send…) the plan didn't name. `false`: left as it was.
fn pin(step: &mut ActionStep, req: &VisionRequest, what: &str, x: i32, y: i32) -> bool {
    let reach = (((req.desktop.w as f64).powi(2) + (req.desktop.h as f64).powi(2)).sqrt() * 0.08).max(120.0);
    let near = (((x - step.x) as f64).powi(2) + ((y - step.y) as f64).powi(2)).sqrt() <= reach;
    let under = req
        .controls
        .iter()
        .filter(|c| x >= c.rect.x - 3 && x <= c.rect.x + c.rect.w + 3 && y >= c.rect.y - 3 && y <= c.rect.y + c.rect.h + 3)
        .min_by_key(|c| c.rect.w as i64 * c.rect.h as i64);
    match under {
        Some(c) => {
            let named = { let n = c.name.to_lowercase(); words(what).iter().any(|w| n.contains(w.as_str())) };
            if unasked_risk(&c.name, what) {
                return false;
            }
            if !(near || named) {
                // The pointer and the plan disagree — the words on screen decide.
                return match confirm_by_text(what, x, y, 160, 70).filter(|&(tx, ty)| safe_under(req, what, tx, ty)) {
                    Some((tx, ty)) => {
                        eprintln!("[sharp-eye] \"{what}\": the label is there on screen — trusting the pointer");
                        step.x = tx;
                        step.y = ty;
                        true
                    }
                    None => false,
                };
            }
            if !named {
                // Near, but its name doesn't say what was meant: move there,
                // but don't vouch for it as the verified target.
                step.x = x;
                step.y = y;
                return true;
            }
            let (cx, cy) = c.rect.center();
            step.x = cx;
            step.y = cy;
            step.target = Some(c.id);
            step.snapped_to = Some(if c.name.is_empty() { c.kind.clone() } else { c.name.clone() });
            step.grounding = c.identity.clone();
            step.hover_first = c.hidden;
            step.scroll_first = c.below;
            true
        }
        None if near => {
            step.x = x;
            step.y = y;
            true
        }
        // Nothing Windows can see there (FL Studio, games, custom pop-ups) and
        // far from the plan's guess: only if the button's words are really there.
        None => match confirm_by_text(what, x, y, 160, 70).filter(|&(tx, ty)| safe_under(req, what, tx, ty)) {
            Some((tx, ty)) => {
                eprintln!("[sharp-eye] \"{what}\": no control here, but the label is on screen — clicking it");
                step.x = tx;
                step.y = ty;
                true
            }
            None => false,
        },
    }
}

/// Whatever Windows control is under a text-confirmed point mustn't be a
/// risky one the plan didn't ask for.
fn safe_under(req: &VisionRequest, what: &str, x: i32, y: i32) -> bool {
    req.controls
        .iter()
        .filter(|c| x >= c.rect.x && x <= c.rect.x + c.rect.w && y >= c.rect.y && y <= c.rect.y + c.rect.h)
        .min_by_key(|c| c.rect.w as i64 * c.rect.h as i64)
        .is_none_or(|c| !unasked_risk(&c.name, what))
}

/// The button's label in what the plan said: quoted text ("Continue"), or
/// the word after the click verb ("hitting that Continue button" → continue).
pub fn label_of(what: &str) -> Option<String> {
    // (Not plain ' — "it's" and "Izuki's" would read as quotes.)
    for (open, close) in [('“', '”'), ('"', '"'), ('‘', '’')] {
        if let Some(a) = what.find(open) {
            let rest = &what[a + open.len_utf8()..];
            if let Some(b) = rest.find(close) {
                let inside = rest[..b].trim();
                if (2..=40).contains(&inside.chars().count()) {
                    return Some(inside.to_string());
                }
            }
        }
    }
    const VERBS: &[&str] = &["click", "clicking", "clicked", "press", "pressing", "hit", "hitting", "tap", "tapping", "select", "selecting", "choose", "choosing", "pick"];
    const FILLER: &[&str] = &["on", "the", "that", "this", "a", "an", "its", "it", "button", "link", "now", "right", "for", "you", "fr", "so", "to"];
    let words: Vec<String> = what.split(|c: char| !c.is_alphanumeric() && c != '\'').filter(|w| !w.is_empty()).map(str::to_string).collect();
    let at = words.iter().position(|w| VERBS.contains(&w.to_lowercase().as_str()))?;
    let rest = &words[at + 1..];
    let first = rest.iter().position(|w| !FILLER.contains(&w.to_lowercase().as_str()) && w.chars().count() >= 2)?;
    // "Sign in", "Save as", "Log In Now": the label runs on through capitalised
    // words and the little words of a button; `confirm_by_text` falls back to
    // the first word when the whole run isn't on screen.
    const JOINERS: &[&str] = &["in", "as", "up", "out", "all", "now"];
    let mut label = vec![rest[first].clone()];
    for w in &rest[first + 1..] {
        let capital = w.chars().next().is_some_and(char::is_uppercase);
        if (capital || JOINERS.contains(&w.to_lowercase().as_str())) && label.len() < 4 && !FILLER.contains(&w.to_lowercase().as_str()) {
            label.push(w.clone());
        } else {
            break;
        }
    }
    Some(label.join(" "))
}

/// The label's centre, if a fresh look at the screen around (x, y) finds it
/// written there — never a risky word the plan didn't ask for.
fn confirm_by_text(what: &str, x: i32, y: i32, half_w: i32, half_h: i32) -> Option<(i32, i32)> {
    let label = label_of(what)?;
    if unasked_risk(&label, what) {
        return None;
    }
    let area = crate::model::Rect { x: x - half_w, y: y - half_h, w: half_w * 2, h: half_h * 2 };
    let frame = crate::capture::capture(area).ok()?;
    let words = crate::ocr::read_words(&frame).ok()?;
    let first = label.split_whitespace().next().unwrap_or(&label).to_string();
    let r = crate::ocr::find_phrase(&words, &label, Some((x, y))).or_else(|| (first != label).then(|| crate::ocr::find_phrase(&words, &first, Some((x, y)))).flatten())?;
    Some(r.center())
}

/// Where `what` is in the screenshot, in image pixels.
fn locate(req: &VisionRequest, what: &str, tars: bool) -> Option<(f64, f64)> {
    // A refusal holds until the key changes — or, for "no credit", for 30
    // minutes (credit may have been added since).
    let refused = TARS_REFUSED
        .lock()
        .as_ref()
        .is_some_and(|(k, until)| *k == openrouter_key() && until.is_none_or(|u| std::time::Instant::now() < u));
    if tars && !refused {
        match ask_tars(req, what) {
            Some(p) => return Some(p),
            None => eprintln!("[sharp-eye] UI-TARS didn't answer — asking Gemini"),
        }
    }
    ask_gemini(req, what)
}

/// Keys and screenshots only ever travel encrypted.
fn secure(base: &str) -> bool {
    base.trim().to_ascii_lowercase().starts_with("https://")
}

fn client() -> Option<reqwest::blocking::Client> {
    reqwest::blocking::Client::builder().connect_timeout(Duration::from_secs(4)).timeout(Duration::from_secs(8)).build().ok()
}

fn ask_gemini(req: &VisionRequest, what: &str) -> Option<(f64, f64)> {
    let settings = crate::state::try_store()?.settings();
    let cfg = settings.provider(ProviderId::Gemini).filter(|c| !c.api_key.trim().is_empty() && secure(&c.base_url))?.clone();
    let model = crate::vision::gemini_model_now(&cfg.model);
    let url = format!("{}/v1beta/models/{model}:generateContent", cfg.base_url.trim_end_matches('/'));
    let prompt = format!(
        "Point to the one thing on this screen that matches: \"{what}\". Answer only JSON like [{{\"point\": [y, x], \"label\": \"...\"}}] with the point normalized to 0-1000. If it isn't on the screen, answer []."
    );
    let mut body = json!({
        "contents": [{ "role": "user", "parts": [
            { "inline_data": { "mime_type": "image/jpeg", "data": base64::engine::general_purpose::STANDARD.encode(&req.image_jpeg) } },
            { "text": prompt }
        ]}],
        "generationConfig": { "temperature": 0.0, "maxOutputTokens": 200, "responseMimeType": "application/json" }
    });
    if let Some(config) = crate::vision::gemini_no_think(&model).thinking_config() {
        body["generationConfig"]["thinkingConfig"] = config;
    }
    let res = client()?.post(url).header("x-goog-api-key", cfg.api_key.trim()).json(&body).send().ok()?;
    if !res.status().is_success() {
        eprintln!("[sharp-eye] Gemini answered {}", res.status());
        return None;
    }
    let v: Value = res.json().ok()?;
    let text = v["candidates"][0]["content"]["parts"][0]["text"].as_str()?;
    let (y, x) = gemini_point(text)?;
    Some((x / 1000.0 * req.image_size.0 as f64, y / 1000.0 * req.image_size.1 as f64))
}

/// `[{"point": [y, x], ...}]` (0–1000) → (y, x).
pub fn gemini_point(text: &str) -> Option<(f64, f64)> {
    let v: Value = serde_json::from_str(text.trim().trim_start_matches("```json").trim_matches('`').trim()).ok()?;
    let first = v.as_array().and_then(|a| a.first()).or_else(|| v.get("point").map(|_| &v))?;
    let p = first["point"].as_array()?;
    let (y, x) = (p.first()?.as_f64()?, p.get(1)?.as_f64()?);
    ((0.0..=1000.0).contains(&y) && (0.0..=1000.0).contains(&x)).then_some((y, x))
}

fn ask_tars(req: &VisionRequest, what: &str) -> Option<(f64, f64)> {
    let settings = crate::state::try_store()?.settings();
    let cfg = settings.provider(ProviderId::Openrouter).filter(|c| !c.api_key.trim().is_empty() && secure(&c.base_url))?.clone();
    let url = format!("{}/chat/completions", cfg.base_url.trim_end_matches('/'));
    let image = format!("data:image/jpeg;base64,{}", base64::engine::general_purpose::STANDARD.encode(&req.image_jpeg));
    let body = json!({
        "model": TARS_MODEL,
        "temperature": 0.0,
        "max_tokens": 60,
        "messages": [{ "role": "user", "content": [
            { "type": "image_url", "image_url": { "url": image } },
            { "type": "text", "text": format!("Output only the coordinate of one point in your response. What element matches the following task: {what}") }
        ]}]
    });
    let res = client()?.post(url).bearer_auth(cfg.api_key.trim()).json(&body).send().ok()?;
    if !res.status().is_success() {
        eprintln!("[sharp-eye] UI-TARS answered {}", res.status());
        let code = res.status().as_u16();
        if matches!(code, 401 | 402 | 403) {
            let key = cfg.api_key.trim().to_string();
            let until = (code == 402).then(|| std::time::Instant::now() + Duration::from_secs(30 * 60));
            let first = TARS_REFUSED.lock().replace((key.clone(), until)).is_none_or(|(k, _)| k != key);
            if first {
                let line = if code == 402 {
                    "UI-TARS needs a little OpenRouter credit (openrouter.ai) — until then, Gemini is doing the sharp-eye looks."
                } else {
                    "UI-TARS wasn't allowed with your OpenRouter key — check the key in Settings → AI. Gemini is doing the sharp-eye looks meanwhile."
                };
                eprintln!("[sharp-eye] UI-TARS refused ({code}) — using Gemini until the OpenRouter key changes");
                crate::activity::show_boost(line, false);
            }
        }
        return None;
    }
    let v: Value = res.json().ok()?;
    let text = v["choices"][0]["message"]["content"].as_str()?;
    tars_point(text, req.image_size)
}

/// UI-TARS answers "(x,y)", "click(start_box='(x,y)')" or with box tokens,
/// in the image's own pixels; older builds answer on a 0–1000 grid instead.
/// A point outside the image can only be the grid.
pub fn tars_point(text: &str, (iw, ih): (u32, u32)) -> Option<(f64, f64)> {
    // The first "(…)" that holds two numbers — not the "(" of "click(".
    let (x, y) = text.match_indices('(').find_map(|(i, _)| {
        let rest = &text[i + 1..];
        let inner = &rest[..rest.find(')')?];
        let mut nums = inner.split(',').map(|n| n.trim().parse::<f64>());
        let (x, y) = (nums.next()?.ok()?, nums.next()?.ok()?);
        nums.next().is_none().then_some((x, y))
    })?;
    if x < 0.0 || y < 0.0 {
        return None;
    }
    if x <= iw as f64 && y <= ih as f64 {
        Some((x, y))
    } else if x <= 1000.0 && y <= 1000.0 {
        Some((x / 1000.0 * iw as f64, y / 1000.0 * ih as f64))
    } else {
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn finds_the_button_label_in_what_the_plan_said() {
        assert_eq!(label_of("Clicking Continue on the Cloud path warning pop-up").as_deref(), Some("Continue"));
        assert_eq!(label_of("Bet, hitting that Continue button for you, no cap.").as_deref(), Some("Continue"));
        assert_eq!(label_of("Click “Save as” in the menu").as_deref(), Some("Save as"));
        assert_eq!(label_of("Press the OK button").as_deref(), Some("OK"));
        assert_eq!(label_of("Click Sign in at the top").as_deref(), Some("Sign in"));
        assert_eq!(label_of("Clicking Save As to keep a copy").as_deref(), Some("Save As"));
        assert_eq!(label_of("Scrolling down the page"), None);
    }

    #[test]
    fn never_lands_on_an_unasked_risky_button() {
        assert!(unasked_risk("Delete account", "Click the Settings button"));
        assert!(!unasked_risk("Delete", "Click Delete on the old draft"));
        assert!(!unasked_risk("Settings", "Click the Settings button"));
        assert_eq!(words("Click the blue Submit button"), vec!["blue", "submit"]);
        assert!(!unasked_risk("Google Chrome pinned", "Click Chrome on the taskbar"));
        assert!(unasked_risk("Sign out", "Click my profile picture"));
        assert!(unasked_risk("Deletes forever", "Open the menu"));
    }

    #[test]
    fn only_encrypted_addresses() {
        assert!(secure("https://generativelanguage.googleapis.com"));
        assert!(!secure("http://generativelanguage.googleapis.com"));
    }

    #[test]
    fn reads_gemini_points() {
        assert_eq!(gemini_point(r#"[{"point": [500, 250], "label": "Submit"}]"#), Some((500.0, 250.0)));
        assert_eq!(gemini_point("```json\n[{\"point\": [10, 990]}]\n```"), Some((10.0, 990.0)));
        assert_eq!(gemini_point("[]"), None);
        assert_eq!(gemini_point(r#"[{"point": [1500, 20]}]"#), None);
    }

    #[test]
    fn reads_tars_points() {
        assert_eq!(tars_point("(320,180)", (1280, 720)), Some((320.0, 180.0)));
        assert_eq!(tars_point("click(start_box='<|box_start|>(640, 360)<|box_end|>')", (1280, 720)), Some((640.0, 360.0)));
        // Beyond the image: the 0–1000 grid.
        assert_eq!(tars_point("(900,950)", (800, 600)), Some((720.0, 570.0)));
        assert_eq!(tars_point("no idea", (800, 600)), None);
    }

    #[test]
    fn only_guessed_clicks_with_a_reason_are_looked_at() {
        let mut s: ActionStep = serde_json::from_value(json!({ "action": "click", "x": 10, "y": 10, "reasoning": "Click the blue Submit button" })).unwrap();
        assert!(clicky(s.action) && describe(&s).is_some());
        s.reasoning = "ok".into();
        assert!(describe(&s).is_none());
    }
}
