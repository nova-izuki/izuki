//! Easy Mode: how a small or free model drives the screen accurately.
//!
//! The full prompt (vision.rs) is a long rulebook answered in a detailed JSON
//! shape. Big models thrive on it; small ones drown in it — they narrate
//! ("The user wants to scroll… to fulfill this request, you can use the
//! following steps") instead of acting. Easy Mode gives them a short menu
//! and a reply made of plain command lines:
//!
//! ```text
//! CLICK "Luffy Relax Study"
//! PLAY chill lofi music
//! TYPE 12 "hello"
//! DONE
//! ```
//!
//! Picking from a menu is what small models are good at. Izuki does the
//! hard part itself: a button named in quotes is matched to the real control
//! on screen (UI Automation), so the model never guesses pixels.

use serde_json::json;

use crate::model::ActionStep;
use crate::settings::{ProviderConfig, ProviderId};
use crate::vision::VisionRequest;

pub const EASY_PROMPT: &str = concat!(
    "You are Izuki. You control this Windows PC for the user: you see their screen and you DO what ",
    "they ask with the mouse and keyboard yourself. Never tell them steps to follow — do the steps.\n",
    "Reply with command lines ONLY, one per line, no other text. Up to 3 actions, then Izuki does them ",
    "and shows you the screen again so you can carry on.\n",
    "Commands:\n",
    "CLICK 7 — click control number 7 from the list (the number is also on a small yellow tag in the picture)\n",
    "CLICK \"Sign in\" — click the button, link or tab with that name\n",
    "DOUBLECLICK 7 / RIGHTCLICK 7 — same, double or right click\n",
    "TYPE 7 \"words\" — click control 7 and type the words (TYPE \"words\" types where the cursor already is)\n",
    "KEY enter — press a key or keys: enter, tab, escape, ctrl+l, ctrl+t, alt+left, pagedown, win, space\n",
    "SCROLL down — or SCROLL up; SCROLL down 7 scrolls over control 7\n",
    "OPEN spotify — open an installed app\n",
    "GO youtube.com — open a web address\n",
    "SEARCH blackboard login — search the web\n",
    "PLAY lofi study music — find a song or video on YouTube and start it\n",
    "WAIT 3 — let a page load for 3 seconds, then look again\n",
    "SAY words — what to say out loud: an answer, or a few words on what you're doing\n",
    "ASK question — only before sending, buying, deleting or submitting, or when a costly choice is truly theirs\n",
    "DONE — only when you can SEE on screen that the whole request is finished\n",
    "Rules: start with the command, never with \"The user…\" — no describing the request, the screen or ",
    "your plan. If you can see the thing to act on, act on it now. Prefer OPEN, GO, SEARCH and PLAY: they ",
    "never miss. Only click what's in the list or clearly on screen. Never type passwords, PINs or card ",
    "numbers. A question about the screen: SAY the answer, then DONE.\n",
    "Examples:\n",
    "User: play some chill music\nPLAY chill lofi music\nSAY Putting some chill music on.\n",
    "User: scroll down (the song they want is in the list)\nCLICK \"Luffy Relax Study Music\"\n",
    "User: what does this error mean?\nSAY It says the file is missing, so the app can't start. Reinstalling it should fix that.\nDONE\n",
    "User: open notepad and write hello\nOPEN notepad\nWAIT 1\n",
);

/// Small or free models that do better with Easy Mode than the full rulebook.
/// Only brains that aren't the big hosted ones are candidates — Gemini,
/// OpenAI, Claude and Grok follow the full prompt well.
pub fn is_small(cfg: &ProviderConfig) -> bool {
    let candidate = matches!(
        cfg.id,
        ProviderId::Ollama
            | ProviderId::Openrouter
            | ProviderId::Nvidia
            | ProviderId::Groq
            | ProviderId::Mistral
            | ProviderId::NineRouter
            | ProviderId::Custom
    );
    candidate && model_is_small(&cfg.model)
}

fn model_is_small(model: &str) -> bool {
    let m = model.to_ascii_lowercase();
    if m == "openrouter/free" {
        return true;
    }
    const FAMILIES: &[&str] = &["moondream", "llava", "smol", "tiny", "nano", "phi", "gemma", "minicpm", "small"];
    if FAMILIES.iter().any(|f| m.contains(f)) {
        return true;
    }
    // A size in the name: "llama-3.2-11b-vision", "qwen3.8-27b". Up to ~40B
    // parameters counts as small.
    m.split(|c: char| !c.is_ascii_alphanumeric())
        .filter_map(|t| t.strip_suffix('b'))
        .filter_map(|n| n.parse::<u32>().ok())
        .any(|size| size > 0 && size <= 40)
}

/// What Easy Mode tells the model about the screen: short and to the point.
pub fn user_text(req: &VisionRequest) -> String {
    let mut s = String::new();
    if !req.memory.trim().is_empty() {
        s.push_str(req.memory.trim());
        s.push('\n');
    }
    if !req.app.is_empty() {
        s.push_str(&format!("App in front: {}", req.app));
        if !req.window_title.is_empty() {
            s.push_str(&format!(" — {}", req.window_title));
        }
        s.push('\n');
    }
    if req.windows.len() > 1 {
        s.push_str(&format!("Open windows: {}\n", req.windows.join(" | ")));
    }
    if !req.controls.is_empty() {
        s.push_str("Controls you can act on (use the number):\n");
        for c in &req.controls {
            let mut extra = String::new();
            if !c.value.is_empty() {
                extra.push_str(&format!(" = \"{}\"", c.value));
            }
            if c.focused {
                extra.push_str(" (typing goes here)");
            }
            if c.below {
                extra.push_str(" (further down — Izuki scrolls to it)");
            }
            let name = if c.name.is_empty() { "(no label)".to_string() } else { format!("\"{}\"", c.name) };
            s.push_str(&format!("[{}] {} {name}{extra}\n", c.id, c.kind.to_lowercase()));
        }
    }
    let page = req.page_text.trim();
    if !page.is_empty() {
        let page: String = page.chars().take(1500).collect();
        s.push_str(&format!("Text on the page:\n{page}\n"));
    }
    if !req.ocr_text.trim().is_empty() {
        s.push_str(&format!("Text inside what the user marked:\n{}\n", req.ocr_text.trim()));
    }
    if !req.marks_description.starts_with("(none") && !req.marks_description.trim().is_empty() {
        s.push_str(&format!("The user drew on the screen:\n{}\n", req.marks_description));
    }
    s.push_str(&format!("User: {}", req.user_prompt.trim()));
    s
}

/// A reply read from command lines.
#[derive(Debug, Default)]
pub struct Reply {
    pub steps: Vec<ActionStep>,
    pub say: Option<String>,
    pub ask: Option<String>,
    pub done: bool,
    pub wait: u32,
    /// At least one line was a command (otherwise it's plain prose).
    pub any: bool,
}

/// Read command lines out of a reply, tolerating bullets, numbering and code
/// fences. Steps come back in *image* pixels (or pinned to a control id),
/// like the JSON path, for `vision::ask` to rescale and pin.
///
/// `any_case`: accept "click 7" as well as "CLICK 7" — for a model that was
/// given the menu. Otherwise only CAPITALS count, so a prose answer ("Open
/// Settings, then Privacy.") is never taken for a command and acted on.
pub fn parse(raw: &str, req: &VisionRequest, any_case: bool) -> Reply {
    let mut out = Reply::default();
    for line in raw.lines() {
        let line = line
            .trim()
            .trim_start_matches(|c: char| c == '-' || c == '*' || c == '•' || c == '`' || c == '>' || c.is_ascii_digit() || c == '.' || c == ')')
            .trim()
            .trim_matches('`')
            .trim_matches('*')
            .trim();
        if line.is_empty() {
            continue;
        }
        let (word, rest) = match line.split_once(|c: char| c.is_whitespace() || c == ':' || c == '(' || c == '[') {
            Some((w, r)) => (w, r.trim().trim_start_matches(':').trim().trim_end_matches(')').trim()),
            None => (line, ""),
        };
        if !any_case && word.chars().any(|c| c.is_ascii_lowercase()) {
            continue;
        }
        let word = word.to_ascii_uppercase();
        let step = match word.as_str() {
            "CLICK" | "TAP" => pointer("click", rest, req),
            "DOUBLECLICK" | "DOUBLE_CLICK" => pointer("double_click", rest, req),
            "RIGHTCLICK" | "RIGHT_CLICK" => pointer("right_click", rest, req),
            "HOVER" => pointer("hover", rest, req),
            "TYPE" => typing(rest, req),
            "KEY" | "PRESS" => {
                let key = rest.trim_matches('"').to_ascii_lowercase().replace(' ', "");
                crate::automation::key_is_known(&key).then(|| step(json!({ "action": "key", "key": key })))
            }
            "SCROLL" => Some(scroll(rest, req)),
            "OPEN" => skill("open_app", rest),
            "GO" | "GOTO" | "VISIT" => {
                let url = rest.trim_matches('"').trim();
                let url = if url.contains("://") { url.to_string() } else { format!("https://{url}") };
                skill("open_url", &url)
            }
            "SEARCH" => skill("search", rest),
            "PLAY" => skill("play_youtube", rest),
            "WAIT" => {
                out.any = true;
                out.wait = rest.split_whitespace().next().and_then(|n| n.parse::<f64>().ok()).map(|n| n.clamp(0.0, 20.0) as u32).unwrap_or(2);
                continue;
            }
            "SAY" => {
                out.any = true;
                let said = rest.trim_matches('"').trim();
                if !said.is_empty() {
                    out.say = Some(match out.say.take() {
                        Some(before) => format!("{before} {said}"),
                        None => said.to_string(),
                    });
                }
                continue;
            }
            "ASK" => {
                out.any = true;
                let q = rest.trim_matches('"').trim();
                if !q.is_empty() {
                    out.ask = Some(q.to_string());
                }
                continue;
            }
            "DONE" => {
                out.any = true;
                out.done = true;
                let what = rest.trim_matches('"').trim();
                if out.say.is_none() && !what.is_empty() {
                    out.say = Some(what.to_string());
                }
                continue;
            }
            _ => continue,
        };
        out.any = true;
        if let Some(s) = step {
            if out.steps.len() < 4 {
                out.steps.push(s);
            }
        }
    }
    out
}

fn step(v: serde_json::Value) -> ActionStep {
    serde_json::from_value(v).expect("an Easy Mode step is always well-formed")
}

fn unquote(s: &str) -> &str {
    s.trim().trim_matches(|c| c == '"' || c == '\'' || c == '“' || c == '”').trim()
}

/// "7", "[7]", "#7" → 7.
fn number(s: &str) -> Option<u32> {
    s.trim().trim_matches(|c| c == '[' || c == ']' || c == '#' || c == '(' || c == ')').parse().ok()
}

/// "340,220" / "340 220" → image pixels.
fn point(s: &str) -> Option<(i32, i32)> {
    let mut it = s.split(|c: char| c == ',' || c.is_whitespace()).filter(|t| !t.is_empty());
    let x = it.next()?.trim_matches(|c| c == '(' || c == ')').parse().ok()?;
    let y = it.next()?.trim_matches(|c| c == '(' || c == ')').parse().ok()?;
    it.next().is_none().then_some((x, y))
}

/// The control whose name matches `wanted` best: the same name, then one
/// containing it, then one it contains. Controls in view come first.
pub fn find_control(wanted: &str, controls: &[crate::uia::Control]) -> Option<u32> {
    let norm = |s: &str| -> String {
        s.to_lowercase().chars().filter(|c| c.is_alphanumeric() || *c == ' ').collect::<String>().split_whitespace().collect::<Vec<_>>().join(" ")
    };
    let w = norm(wanted);
    if w.is_empty() {
        return None;
    }
    let named: Vec<(&crate::uia::Control, String)> = controls.iter().map(|c| (c, norm(&c.name))).filter(|(_, n)| !n.is_empty()).collect();
    let pick = |ok: &dyn Fn(&str) -> bool| {
        named
            .iter()
            .filter(|(_, n)| ok(n))
            .min_by_key(|(c, n)| (c.below || c.hidden, n.len()))
            .map(|(c, _)| c.id)
    };
    pick(&|n| n == w)
        .or_else(|| pick(&|n| n.contains(&w)))
        .or_else(|| pick(&|n| n.len() >= 4 && w.contains(n)))
}

fn pointer(action: &str, rest: &str, req: &VisionRequest) -> Option<ActionStep> {
    if let Some(id) = number(rest).filter(|id| req.controls.iter().any(|c| c.id == *id)) {
        return Some(step(json!({ "action": action, "target": id })));
    }
    if let Some((x, y)) = point(rest) {
        return Some(step(json!({ "action": action, "x": x, "y": y })));
    }
    // A name: matched to the real control, never a guessed spot.
    find_control(unquote(rest), &req.controls).map(|id| step(json!({ "action": action, "target": id })))
}

fn typing(rest: &str, req: &VisionRequest) -> Option<ActionStep> {
    let (target, text) = match rest.split_once(char::is_whitespace) {
        Some((first, more)) if number(first).is_some_and(|id| req.controls.iter().any(|c| c.id == id)) => (number(first), more),
        _ => (None, rest),
    };
    let text = unquote(text);
    if text.is_empty() {
        return None;
    }
    Some(step(match target {
        Some(id) => json!({ "action": "type", "target": id, "text_to_type": text }),
        None => json!({ "action": "type", "text_to_type": text }),
    }))
}

fn scroll(rest: &str, req: &VisionRequest) -> ActionStep {
    let mut dir = "down";
    let mut target = None;
    for t in rest.split_whitespace() {
        match t.to_ascii_lowercase().as_str() {
            "up" => dir = "up",
            "down" => dir = "down",
            "left" => dir = "left",
            "right" => dir = "right",
            other => {
                if let Some(id) = number(other).filter(|id| req.controls.iter().any(|c| c.id == *id)) {
                    target = Some(id);
                }
            }
        }
    }
    match target {
        Some(id) => step(json!({ "action": "scroll", "target": id, "key": dir, "scroll_amount": 5 })),
        // No area named: the middle of the picture (the page), not wherever
        // the mouse happens to be.
        None => {
            let (w, h) = req.image_size;
            step(json!({ "action": "scroll", "x": w / 2, "y": h / 2, "key": dir, "scroll_amount": 5 }))
        }
    }
}

fn skill(action: &str, what: &str) -> Option<ActionStep> {
    let what = unquote(what);
    (!what.is_empty()).then(|| step(json!({ "action": action, "text_to_type": what })))
}

/// A reply that talks *about* the request instead of doing it — "The user
/// wants…", "To fulfill this request, you can use the following steps…".
/// Izuki talks *to* the user, so these are never a real answer.
pub fn narrates(text: &str) -> bool {
    let t = text.to_lowercase();
    const MARKS: &[&str] = &[
        "the user ",
        "the user's",
        "the user'",
        "fulfill this request",
        "fulfil this request",
        "the following steps",
        "here are the steps",
        "step 1",
        "step one:",
        "is asking you to",
        "they have already",
        "the request is",
        "this request,",
    ];
    MARKS.iter().any(|m| t.contains(m))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::{Intent, Rect};
    use crate::uia::Control;

    fn control(id: u32, name: &str) -> Control {
        Control {
            id,
            kind: "Button".into(),
            name: name.into(),
            rect: Rect { x: 100, y: 100 * id as i32, w: 80, h: 20 },
            hidden: false,
            value: String::new(),
            focused: false,
            below: false,
        }
    }

    fn req(controls: Vec<Control>) -> VisionRequest {
        VisionRequest {
            image_jpeg: Vec::new(),
            image_size: (1280, 720),
            desktop: Rect { x: 0, y: 0, w: 1920, h: 1080 },
            marks_description: String::new(),
            user_prompt: "scroll down again".into(),
            ocr_text: String::new(),
            app: "Chrome".into(),
            window_title: "YouTube".into(),
            draft: Vec::new(),
            controls,
            memory: String::new(),
            windows: Vec::new(),
            page_text: String::new(),
        }
    }

    #[test]
    fn small_models_get_easy_mode() {
        assert!(model_is_small("meta/llama-3.2-11b-vision-instruct"));
        assert!(model_is_small("google/gemma-4-31b-it:free"));
        assert!(model_is_small("qwen/qwen3.8-27b"));
        assert!(model_is_small("mistral-small-latest"));
        assert!(model_is_small("moondream"));
        assert!(!model_is_small("meta/llama-3.1-405b-instruct"));
        assert!(!model_is_small("llama-3.3-70b-versatile"));
        assert!(!model_is_small("gemini-flash-latest"));
    }

    #[test]
    fn reads_commands_and_finds_buttons_by_name() {
        let r = req(vec![control(3, "Search"), control(7, "Luffy Relax Study Music 🎧 1 hour")]);
        let reply = parse(
            "1. CLICK \"Luffy Relax Study Music\"\n- `TYPE 3 \"lofi\"`\nkey Enter\nSAY Here it is.\nDONE",
            &r,
            true,
        );
        assert_eq!(reply.steps.len(), 3);
        assert_eq!(reply.steps[0].action, Intent::Click);
        assert_eq!(reply.steps[0].target, Some(7));
        assert_eq!(reply.steps[1].action, Intent::Type);
        assert_eq!(reply.steps[1].target, Some(3));
        assert_eq!(reply.steps[1].text_to_type.as_deref(), Some("lofi"));
        assert_eq!(reply.steps[2].key.as_deref(), Some("enter"));
        assert_eq!(reply.say.as_deref(), Some("Here it is."));
        assert!(reply.done);
    }

    #[test]
    fn skills_and_scrolling() {
        let r = req(vec![control(4, "Comments")]);
        let reply = parse("PLAY chill lofi music\nSCROLL down\nGO youtube.com\nOPEN notepad\nWAIT 2", &r, false);
        let acts: Vec<Intent> = reply.steps.iter().map(|s| s.action).collect();
        assert_eq!(acts, vec![Intent::PlayYoutube, Intent::Scroll, Intent::OpenUrl, Intent::OpenApp]);
        assert_eq!(reply.steps[1].x, 640, "an unnamed scroll turns the middle of the page");
        assert_eq!(reply.steps[2].text_to_type.as_deref(), Some("https://youtube.com"));
        assert_eq!(reply.wait, 2);
    }

    #[test]
    fn never_guesses_a_button_that_isnt_there() {
        let r = req(vec![control(1, "Home")]);
        let reply = parse("CLICK \"Subscribe\"\nCLICK 99", &r, true);
        assert!(reply.steps.is_empty());
        assert!(reply.any);
    }

    #[test]
    fn a_big_models_prose_answer_is_never_acted_on() {
        let r = req(vec![control(2, "Settings")]);
        let prose = "Open Settings, then Privacy, and switch the camera on.\nPlay around with it after.";
        assert!(!parse(prose, &r, false).any, "prose from a big model mustn't open or play anything");
        // A small model told the format may write the commands in lower case.
        assert!(parse("open notepad", &r, true).any);
    }

    #[test]
    fn prose_is_not_commands() {
        let reply = parse("\"some chill music\". They have already scrolled down once and are now asking you to scroll down again.", &req(Vec::new()), true);
        assert!(!reply.any);
        assert!(narrates("\"some chill music\". They have already scrolled down once and are now asking you to scroll down again. To fulfill this request, you can use the following steps"));
        assert!(narrates("Step 1: Identify the task The user wants to play the Luffy Relax Study music."));
        assert!(!narrates("It's playing now — enjoy!"));
        assert!(!narrates("Your battery is at 40 percent."));
    }
}
