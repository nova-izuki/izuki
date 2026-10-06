//! Turning marks into a plan without asking anybody.
//!
//! The geometry already carries most of the intent: a circle is a click, an
//! arrow is a drag, a box is a region. Deriving the plan locally means Izuki
//! responds in single-digit milliseconds, works with no model installed, and
//! still has something sensible to run when the network is down. The model,
//! when enabled, only refines this.

use crate::capture::Frame;
use crate::model::{ActionStep, DrawSession, Intent, Mark, Rect, ShapeKind};

/// Build a runnable plan straight from the marks.
pub fn local_plan(session: &DrawSession) -> Vec<ActionStep> {
    let mut marks = session.marks.clone();
    marks.sort_by_key(|m| m.order);

    let mut steps = Vec::new();

    for m in &marks {
        let intent = resolve_intent(m);
        let (cx, cy) = m.rect.center();

        let step = match intent {
            // Scribbles are instructions, not actions; they were transcribed
            // into the prompt already.
            Intent::Auto if m.kind == ShapeKind::Pen => continue,
            Intent::Watch => continue, // handled by the watcher path

            Intent::Drag => {
                let (from, to) = arrow_ends(m);
                ActionStep {
                    action: Intent::Drag,
                    x: from.0,
                    y: from.1,
                    x2: Some(to.0),
                    y2: Some(to.1),
                    text_to_type: None,
                    key: None,
                    scroll_amount: None,
                    confidence: 0.9,
                    reasoning: "arrow drawn from one point to another".into(),
                    snapped_to: None,
                    grounding: None,
                    hover_first: false,
                    scroll_first: false,
                    shape: None,
                    path: None,
                    target: None,
                    target2: None,
                }
            }

            Intent::Type => {
                let (_, to) = arrow_ends(m);
                let target = if m.kind == ShapeKind::Arrow { to } else { (cx, cy) };
                ActionStep {
                    action: Intent::Type,
                    x: target.0,
                    y: target.1,
                    x2: None,
                    y2: None,
                    text_to_type: m.text.clone().or_else(|| m.ocr.clone()),
                    key: None,
                    scroll_amount: None,
                    confidence: 0.8,
                    reasoning: "text attached to this mark".into(),
                    snapped_to: None,
                    grounding: None,
                    hover_first: false,
                    scroll_first: false,
                    shape: None,
                    path: None,
                    target: None,
                    target2: None,
                }
            }

            other => ActionStep {
                action: normalise(other),
                x: cx,
                y: cy,
                x2: None,
                y2: None,
                text_to_type: m.text.clone(),
                key: None,
                scroll_amount: None,
                confidence: confidence_for(m),
                reasoning: reason_for(m),
                snapped_to: None,
                grounding: None,
                hover_first: false,
                scroll_first: false,
                shape: None,
                path: None,
                target: None,
                target2: None,
            },
        };

        steps.push(step);
    }

    steps
}

/// Resolve an explicitly drawn target, never a nearby candidate outside it.
pub fn drawn_target<'a>(controls: &'a [crate::uia::Control], region: &Rect, x: i32, y: i32) -> Option<&'a crate::uia::Control> {
    let eligible = |c: &&crate::uia::Control| !c.hidden && !c.below && c.identity.is_some()
        && matches!(c.kind.as_str(), "Button" | "Hyperlink" | "MenuItem" | "ListItem" | "TabItem" | "CheckBox" | "RadioButton" | "ComboBox" | "Edit" | "SplitButton" | "TreeItem");
    let mut hit: Vec<_> = controls.iter().filter(eligible).filter(|c| c.rect.contains(x,y)).collect();
    hit.sort_by_key(|c| c.rect.area());
    if let Some(first) = hit.first() {
        // Nested parent controls are fine; overlapping peers are ambiguous.
        if hit.iter().skip(1).all(|c| c.rect.intersect(&first.rect) == Some(first.rect) && c.rect.area() > first.rect.area()) { return Some(first); }
        return None;
    }
    let mut enclosed = controls.iter().filter(eligible).filter(|c| region.intersect(&c.rect) == Some(c.rect));
    let first = enclosed.next()?;
    enclosed.next().is_none().then_some(first)
}

/// A circle plus "next", "click next", "press the submit button", "click it"
/// is a click on what was circled — no thinking needed. Returns the words
/// that name the button ("next"; "" for "click it"), or `None` when the
/// request is about something else ("explain this", "what's the answer").
pub fn draw_click_words(prompt: &str) -> Option<String> {
    const VERBS: &[&str] = &["click", "press", "tap", "hit", "select", "choose", "pick"];
    const FILLER: &[&str] = &[
        "on", "the", "this", "that", "it", "here", "there", "button", "link", "please", "for", "me", "now", "go", "to", "just",
        "can", "you", "could", "a",
    ];
    const BUTTONS: &[&str] = &[
        "next", "continue", "submit", "ok", "okay", "done", "back", "previous", "finish", "start", "skip", "confirm",
        "accept", "save", "close", "cancel", "retry", "check",
    ];
    let p = prompt.trim().trim_end_matches(['.', '!', '?']).to_lowercase();
    let words: Vec<&str> = p.split(|c: char| !c.is_alphanumeric() && c != '\'').filter(|w| !w.is_empty()).collect();
    let verb_at = words.iter().position(|w| VERBS.contains(w));
    // Only a request that *is* a click: everything before the verb is
    // politeness ("please", "can you", "go"), nothing else.
    if let Some(i) = verb_at {
        if words[..i].iter().all(|w| FILLER.contains(w)) {
            let rest: Vec<&str> = words[i + 1..].iter().filter(|w| !FILLER.contains(w)).copied().collect();
            return Some(rest.join(" "));
        }
        return None;
    }
    // A bare button word: "next", "go next", "submit please".
    let core: Vec<&str> = words.iter().filter(|w| !FILLER.contains(w)).copied().collect();
    (core.len() == 1 && BUTTONS.contains(&core[0])).then(|| core[0].to_string())
}

/// Does a control's name fit the words the user said ("next" fits "Next
/// question ›")? No words means any one control in the circle.
pub fn name_fits(name: &str, words: &str) -> bool {
    let tidy = |s: &str| s.to_lowercase().chars().map(|c| if c.is_alphanumeric() { c } else { ' ' }).collect::<String>();
    let name = tidy(name);
    let have: Vec<&str> = name.split_whitespace().collect();
    let words = tidy(words);
    words.split_whitespace().all(|w| have.iter().any(|h| *h == w || (w.len() >= 4 && h.starts_with(w))))
}

pub fn explicit_draw_click(prompt: &str) -> bool {
    matches!(prompt.trim().trim_end_matches(['.', '!']).to_ascii_lowercase().as_str(), "click" | "click here" | "click this" | "click that" | "click it" | "press this" | "tap this")
}

#[cfg(test)]
mod drawn_target_tests {
    use super::*;
    fn control(id: u32, rect: Rect) -> crate::uia::Control {
        crate::uia::Control { id, kind: "RadioButton".into(), name: "Option".into(), rect, hidden: false, value: String::new(), focused: false, below: false,
            section: String::new(),
            identity: Some(crate::uia::ControlIdentity { runtime_id: vec![id as i32], window: 1, rect, kind: "RadioButton".into(), name: "Option".into() }) }
    }
    #[test]
    fn marks_never_snap_to_neighbours_or_ambiguous_answers() {
        let a=Rect{x:-350,y:180,w:22,h:22}; let b=Rect{x:-350,y:230,w:22,h:22};
        let controls=vec![control(1,a),control(2,b)];
        assert_eq!(drawn_target(&controls,&a,-339,191).unwrap().id,1);
        let between=Rect{x:-355,y:206,w:35,h:18};
        assert!(drawn_target(&controls,&between,-339,215).is_none());
        let both=Rect{x:-360,y:170,w:45,h:95};
        assert!(drawn_target(&controls,&both,-339,217).is_none());
        assert_eq!(drawn_target(&controls,&a.inflate(5),-353,178).unwrap().id,1);
    }
    #[test]
    fn circled_buttons_are_clicked_by_their_words() {
        assert_eq!(draw_click_words("next").as_deref(), Some("next"));
        assert_eq!(draw_click_words("Click next").as_deref(), Some("next"));
        assert_eq!(draw_click_words("please press the Submit button.").as_deref(), Some("submit"));
        assert_eq!(draw_click_words("click it").as_deref(), Some(""));
        assert_eq!(draw_click_words("go next").as_deref(), Some("next"));
        assert_eq!(draw_click_words("explain this"), None);
        assert_eq!(draw_click_words("what's the answer"), None);
        assert_eq!(draw_click_words("why can't I click this"), None);
        assert_eq!(draw_click_words(""), None);
        assert!(name_fits("Next question ›", "next"));
        assert!(name_fits("Submit", "submit"));
        assert!(name_fits("Anything", ""));
        assert!(!name_fits("Search", "next"));
        assert!(!name_fits("Previous", "next"));
    }

    #[test]
    fn only_explicit_clicks_skip_reasoning() {
        assert!(explicit_draw_click("Click here!"));
        assert!(!explicit_draw_click("click the right answer"));
        assert!(!explicit_draw_click("don't click this"));
    }
}

/// Marks the user explicitly tagged as `watch` — these become watchers rather
/// than one-shot actions.
pub fn watch_marks(session: &DrawSession) -> Vec<&Mark> {
    session
        .marks
        .iter()
        .filter(|m| matches!(resolve_intent(m), Intent::Watch))
        .collect()
}

fn resolve_intent(m: &Mark) -> Intent {
    if m.intent != Intent::Auto {
        return m.intent;
    }
    match m.kind {
        ShapeKind::Circle => Intent::Click,
        // A box on its own means "keep an eye on this".
        ShapeKind::Box => Intent::Watch,
        ShapeKind::Arrow => Intent::Drag,
        ShapeKind::Pen => Intent::Auto,
        ShapeKind::Text => Intent::Type,
    }
}

fn normalise(i: Intent) -> Intent {
    if i == Intent::Auto {
        Intent::Click
    } else {
        i
    }
}

fn confidence_for(m: &Mark) -> f32 {
    match m.kind {
        ShapeKind::Circle => 0.92,
        ShapeKind::Box => 0.75,
        ShapeKind::Arrow => 0.88,
        _ => 0.6,
    }
}

fn reason_for(m: &Mark) -> String {
    match m.kind {
        ShapeKind::Circle => "circled, so click its centre".into(),
        ShapeKind::Box => "boxed region".into(),
        ShapeKind::Arrow => "arrow target".into(),
        ShapeKind::Pen => "freehand instruction".into(),
        ShapeKind::Text => "typed instruction".into(),
    }
}

/// Tail and head of an arrow. Falls back to the mark's bounds when the points
/// are missing, so a malformed mark still produces something runnable.
fn arrow_ends(m: &Mark) -> ((i32, i32), (i32, i32)) {
    if m.points.len() >= 2 {
        let a = m.points[0];
        let b = m.points[m.points.len() - 1];
        (
            (a.x.round() as i32, a.y.round() as i32),
            (b.x.round() as i32, b.y.round() as i32),
        )
    } else {
        (
            (m.rect.x, m.rect.y),
            (m.rect.x + m.rect.w, m.rect.y + m.rect.h),
        )
    }
}

/// Plain-language description of the marks, handed to the model alongside the
/// annotated screenshot.
pub fn describe(session: &DrawSession) -> String {
    let mut marks = session.marks.clone();
    marks.sort_by_key(|m| m.order);

    if marks.is_empty() {
        return "(none — the user spoke or typed this with nothing drawn; find the target yourself by reading the whole screenshot)".into();
    }

    marks
        .iter()
        .enumerate()
        .map(|(i, m)| {
            let (cx, cy) = m.rect.center();
            let kind = match m.kind {
                ShapeKind::Box => "box",
                ShapeKind::Arrow => "arrow",
                ShapeKind::Circle => "circle",
                ShapeKind::Pen => "scribble",
                ShapeKind::Text => "text note",
            };
            let mut line = format!(
                "{}. {kind} centred at ({cx},{cy}), {}x{} px",
                i + 1,
                m.rect.w,
                m.rect.h
            );
            if m.kind == ShapeKind::Arrow {
                let (a, b) = arrow_ends(m);
                line.push_str(&format!(" — from ({},{}) to ({},{})", a.0, a.1, b.0, b.1));
            }
            if m.intent != Intent::Auto {
                line.push_str(&format!(" — user tagged it \"{}\"", m.intent.as_str()));
            }
            if let Some(t) = m.text.as_ref().filter(|t| !t.trim().is_empty()) {
                line.push_str(&format!(" — note: {t}"));
            }
            if let Some(t) = m.ocr.as_ref().filter(|t| !t.trim().is_empty()) {
                line.push_str(&format!(" — text inside: {t}"));
            }
            line
        })
        .collect::<Vec<_>>()
        .join("\n")
}

// ---------------------------------------------------------------------------
// Burning the marks into the screenshot
// ---------------------------------------------------------------------------

const RED: (u8, u8, u8) = (255, 56, 80);
const TEAL: (u8, u8, u8) = (78, 205, 196);
const VIOLET: (u8, u8, u8) = (150, 120, 255);

/// Draw the marks onto a copy of the frame so the model literally sees what
/// the user drew. Vision models react far better to a visible red ring than to
/// a coordinate in the prompt.
pub fn annotate(frame: &Frame, session: &DrawSession) -> Frame {
    let mut out = frame.clone();
    let ox = frame.origin.0;
    let oy = frame.origin.1;

    for m in &session.marks {
        let colour = match m.kind {
            ShapeKind::Box => RED,
            ShapeKind::Arrow => TEAL,
            ShapeKind::Circle => VIOLET,
            _ => RED,
        };
        let r = Rect {
            x: m.rect.x - ox,
            y: m.rect.y - oy,
            w: m.rect.w,
            h: m.rect.h,
        };

        match m.kind {
            ShapeKind::Box => stroke_rect(&mut out, &r, colour, 3),
            ShapeKind::Circle => stroke_ellipse(&mut out, &r, colour, 3),
            ShapeKind::Arrow => {
                let (a, b) = arrow_ends(m);
                let a = (a.0 - ox, a.1 - oy);
                let b = (b.0 - ox, b.1 - oy);
                stroke_line(&mut out, a, b, colour, 3);
                arrow_head(&mut out, a, b, colour);
            }
            ShapeKind::Pen => {
                let pts: Vec<(i32, i32)> = m
                    .points
                    .iter()
                    .map(|p| (p.x.round() as i32 - ox, p.y.round() as i32 - oy))
                    .collect();
                for w in pts.windows(2) {
                    stroke_line(&mut out, w[0], w[1], colour, 3);
                }
            }
            ShapeKind::Text => stroke_rect(&mut out, &r, colour, 2),
        }
    }

    out
}

fn put(frame: &mut Frame, x: i32, y: i32, c: (u8, u8, u8)) {
    if x < 0 || y < 0 || x >= frame.width as i32 || y >= frame.height as i32 {
        return;
    }
    let i = ((y as u32 * frame.width + x as u32) * 4) as usize;
    frame.bgra[i] = c.2;
    frame.bgra[i + 1] = c.1;
    frame.bgra[i + 2] = c.0;
    frame.bgra[i + 3] = 255;
}

fn dot(frame: &mut Frame, x: i32, y: i32, c: (u8, u8, u8), weight: i32) {
    let half = weight / 2;
    for dy in -half..=half {
        for dx in -half..=half {
            put(frame, x + dx, y + dy, c);
        }
    }
}

fn stroke_line(frame: &mut Frame, a: (i32, i32), b: (i32, i32), c: (u8, u8, u8), weight: i32) {
    // Bresenham — no anti-aliasing needed, the model only needs the shape.
    let (mut x0, mut y0) = a;
    let (x1, y1) = b;
    let dx = (x1 - x0).abs();
    let sx = if x0 < x1 { 1 } else { -1 };
    let dy = -(y1 - y0).abs();
    let sy = if y0 < y1 { 1 } else { -1 };
    let mut err = dx + dy;

    loop {
        dot(frame, x0, y0, c, weight);
        if x0 == x1 && y0 == y1 {
            break;
        }
        let e2 = 2 * err;
        if e2 >= dy {
            err += dy;
            x0 += sx;
        }
        if e2 <= dx {
            err += dx;
            y0 += sy;
        }
    }
}

fn stroke_rect(frame: &mut Frame, r: &Rect, c: (u8, u8, u8), weight: i32) {
    let (x0, y0) = (r.x, r.y);
    let (x1, y1) = (r.x + r.w, r.y + r.h);
    stroke_line(frame, (x0, y0), (x1, y0), c, weight);
    stroke_line(frame, (x1, y0), (x1, y1), c, weight);
    stroke_line(frame, (x1, y1), (x0, y1), c, weight);
    stroke_line(frame, (x0, y1), (x0, y0), c, weight);
}

fn stroke_ellipse(frame: &mut Frame, r: &Rect, c: (u8, u8, u8), weight: i32) {
    let (cx, cy) = r.center();
    let rx = (r.w / 2).max(1) as f64;
    let ry = (r.h / 2).max(1) as f64;
    // Step count scaled to circumference so big circles stay unbroken.
    let steps = ((rx + ry) as i32 * 3).clamp(48, 1440);

    let mut prev: Option<(i32, i32)> = None;
    for i in 0..=steps {
        let t = (i as f64 / steps as f64) * std::f64::consts::TAU;
        let p = (
            cx + (rx * t.cos()).round() as i32,
            cy + (ry * t.sin()).round() as i32,
        );
        if let Some(q) = prev {
            stroke_line(frame, q, p, c, weight);
        }
        prev = Some(p);
    }
}

fn arrow_head(frame: &mut Frame, from: (i32, i32), to: (i32, i32), c: (u8, u8, u8)) {
    let dx = (to.0 - from.0) as f64;
    let dy = (to.1 - from.1) as f64;
    let len = (dx * dx + dy * dy).sqrt();
    if len < 1.0 {
        return;
    }
    let (ux, uy) = (dx / len, dy / len);
    let size = (len * 0.18).clamp(10.0, 34.0);
    let spread = 0.45_f64;

    for sign in [-1.0_f64, 1.0] {
        let angle = sign * spread;
        let (s, cs) = (angle.sin(), angle.cos());
        let bx = to.0 as f64 - (ux * cs - uy * s) * size;
        let by = to.1 as f64 - (uy * cs + ux * s) * size;
        stroke_line(frame, to, (bx.round() as i32, by.round() as i32), c, 3);
    }
}
