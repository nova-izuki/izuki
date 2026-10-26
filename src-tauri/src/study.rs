//! "Open my lab assignment, teach me while I do it, and save it to my notes."
//!
//! Izuki reads the assignment that's open (the page's own words, or the
//! screen's for a PDF or picture), turns it into a study guide — what it
//! asks, what to hand in, when it's due, the steps with the *why* of each,
//! key terms, a checklist — saves that to Notes, and walks the user through
//! it one step at a time ("next step", "explain that", "repeat").
//!
//! It coaches the user through doing the work themselves; it doesn't write
//! answers to be handed in as theirs (schools' academic-integrity rules),
//! and it never submits anything.

use parking_lot::Mutex;
use serde_json::json;

/// A request to be coached through an assignment.
#[derive(Debug, Clone, PartialEq)]
pub struct Ask {
    /// "open my lab assignment on blackboard" — open this first (screen agent), if asked.
    pub open_first: Option<String>,
}

/// The guide being walked through: (steps, the step we're on, when).
static GUIDE: Mutex<Option<(Vec<String>, usize, std::time::Instant)>> = Mutex::new(None);

const WORK: &[&str] = &["assignment", "lab", "homework", "worksheet", "quiz", "project", "essay", "discussion", "module", "exercise", "problem set", "task"];
const COACH: &[&str] = &["teach me", "help me with", "help me do", "walk me through", "explain", "go through", "do it with me", "do this with me", "guide me", "study", "save to my notes", "save it to my notes", "take notes", "notes"];

/// Asks to be taught (not just to keep something in Notes).
fn asks_for_lesson(said: &str) -> bool {
    let s = said.to_lowercase();
    COACH.iter().filter(|w| !w.contains("notes")).any(|w| s.contains(w))
}

/// "teach me this assignment", "open my lab assignment and walk me through it and save notes".
pub fn parse(said: &str) -> Option<Ask> {
    // A short question about an option is not an assignment walkthrough.
    // Supplied Notes are reference material, never screen instructions.
    if crate::notes::is_study_prompt(said) {
        return None;
    }
    let s = format!(" {} ", said.to_lowercase().split_whitespace().collect::<Vec<_>>().join(" "));
    let walkthrough = ["walk me through", "go through", "guide me", "teach me", "do it with me", "do this with me", "help me do", "step by step"].iter().any(|w| s.contains(w));
    if !walkthrough && !crate::notes::asks_to_save(said) {
        return None;
    }
    let work = WORK.iter().any(|w| s.contains(&format!(" {w}")));
    let coach = COACH.iter().any(|w| s.contains(w));
    if !(work && coach) {
        return None;
    }
    // "open / find / go to … assignment" first?
    let opens = [" open ", " find ", " go to ", " pull up ", " bring up ", " get to "].iter().any(|w| s.contains(w)) && !s.contains(" this ") && !s.contains(" the one on my screen");
    let open_first = opens.then(|| {
        // Keep the "open …" part only, up to the coaching words.
        let mut part = s.trim().to_string();
        for cut in [" and teach", " and help", " and walk", " and explain", " and save", " then teach", " and do it", " and guide", " while teaching", " while you teach"] {
            if let Some(i) = part.find(cut) {
                part.truncate(i);
            }
        }
        part.trim().to_string()
    });
    Some(Ask { open_first })
}

const GUIDE_PROMPT: &str = "You are a patient tutor helping a student do their own assignment. From the assignment text, write a study guide in plain words, exactly in this shape:\n\
WHAT IT ASKS: one or two sentences.\n\
HAND IN: what they submit (format, length), if stated.\n\
DUE: the due date/time if stated, else \"not shown\".\n\
STEPS:\n\
1. what to do — why it matters / the idea behind it, explained simply\n\
2. …\n\
(4–8 steps, in order, each one doable.)\n\
KEY TERMS:\n\
- term: one-line meaning\n\
CHECK BEFORE SUBMITTING:\n\
- …\n\
Rules: only use what the assignment text says — never invent requirements, dates or points. Coach them to do the work themselves: \
explain how and why, give a small worked example of the method if useful, but do NOT write the final answers, the essay, or the code \
they're meant to hand in. If the text isn't an assignment, say so in WHAT IT ASKS.";

/// The last guide made (title, text), for "save the guide to my notes" later.
static LAST_GUIDE: Mutex<Option<(String, String, std::time::Instant)>> = Mutex::new(None);

/// Read the assignment in front, make the guide, start walking through it —
/// and keep it in Notes only when asked (`said` mentions saving to notes).
pub fn coach(said: &str) -> anyhow::Result<String> {
    let title = crate::uia::foreground_title();
    let mut text = crate::uia::document_text(14_000);
    if text.trim().len() < 120 {
        // A PDF, a lab VM, a picture: read the screen's own words.
        let frame = crate::capture::capture_all()?;
        text = crate::ocr::read_frame(&frame).unwrap_or_default();
    }
    if text.trim().len() < 40 {
        anyhow::bail!("I couldn't read an assignment on the screen. Open it (the page with the instructions), then say “teach me this assignment”.");
    }
    let text: String = text.chars().take(14_000).collect();
    let guide = crate::chat::complete(&[
        json!({ "role": "system", "content": GUIDE_PROMPT }),
        json!({ "role": "user", "content": format!("Page: {title}\n\n{text}") }),
    ])?;
    if guide.trim().is_empty() {
        anyhow::bail!("the AI didn't write a guide — try again in a moment");
    }
    let asks = section(&guide, "WHAT IT ASKS").unwrap_or_default();
    // A quiz question is not an assignment. Walking one through as "Step 1 of
    // 7: read the question carefully" was noise on a multiple-choice question
    // — and it kept a guide in Notes nobody asked for. Quizzes go to the quiz
    // coach, one question at a time, where Izuki never gives the answer.
    if is_quiz_page(&asks) {
        eprintln!("[study] that's a quiz question, not an assignment — handing it to the quiz coach");
        return Ok("That's a quiz question, not an assignment, so I won't turn it into a step-by-step guide (and I haven't kept anything in your Notes). Say \u{201c}coach me through this quiz\u{201d} and I'll go through it with you one question at a time."
            .into());
    }
    let note_title = format!("Assignment — {}", crate::notes::tidy_title(&title));
    let saved = if crate::notes::may_keep(said) { Some(crate::notes::from_text(&note_title, &title, &guide, false)?) } else { None };
    *LAST_GUIDE.lock() = Some((note_title.clone(), guide.clone(), std::time::Instant::now()));
    let steps = steps_of(&guide);
    let due = section(&guide, "DUE").filter(|d| !d.to_lowercase().contains("not shown"));
    *GUIDE.lock() = Some((steps.clone(), 0, std::time::Instant::now()));
    eprintln!("[study] guide ready ({} steps, {})", steps.len(), if saved.is_some() { "saved to Notes" } else { "not saved" });
    // No steps: never answer with a bare "Here's the plan." and stop, which
    // is what the user saw. Give them the guide's own words instead.
    if steps.is_empty() {
        eprintln!("[study] the guide came back with no steps — giving its own words instead");
        let words = guide.trim();
        if words.chars().count() < 40 {
            anyhow::bail!("I couldn't get a usable plan for that — the AI's answer came back nearly empty. Try again in a moment, or ask me to explain the assignment instead.");
        }
        *GUIDE.lock() = None;
        return Ok(format!("{words}\n\n(I couldn't break that into steps I can walk you through — say \u{201c}explain that\u{201d} and I'll go deeper on any part.)"));
    }
    let first = steps.first().cloned().unwrap_or_default();
    Ok(format!(
        "{}{}\n{}{}",
        if asks.is_empty() { "Here's the plan.".to_string() } else { asks },
        due.map(|d| format!(" Due: {d}.")).unwrap_or_default(),
        match &saved {
            Some(note) => format!("I saved the step-by-step guide to your Notes (“{}”).", note.title),
            None => String::new(),
        },
        if first.is_empty() { String::new() } else { format!("\nStep 1 of {}: {first}\nSay “next step” when you're ready, or “explain that”.", steps.len()) }
    ))
}

/// The guide itself saying what's on screen is a quiz question rather than
/// an assignment ("a multiple-choice question", "not an essay or long-form
/// assignment"). The prompt asks for exactly that when the text isn't one.
fn is_quiz_page(asks: &str) -> bool {
    let s = asks.to_lowercase();
    let quiz = ["multiple-choice", "multiple choice", "quiz question", "test question", "exam question", "interactive quiz", "practice question", "knowledge check"]
        .iter()
        .any(|w| s.contains(w));
    let denies = ["not an assignment", "not an essay", "isn't an assignment", "is not an assignment", "not a long-form", "not long-form"]
        .iter()
        .any(|w| s.contains(w));
    quiz || denies
}

fn section(guide: &str, name: &str) -> Option<String> {
    // "STEPS:", "**STEPS:**", "## STEPS" — the same heading either way.
    let flat = guide.replace("**", "").replace("##", "");
    let guide: &str = &flat;
    let start = guide.find(&format!("{name}:")).or_else(|| guide.find(name).map(|i| i + name.len() - 1))? + name.len() + 1;
    let rest = &guide[start..];
    let end = ["\nHAND IN:", "\nDUE:", "\nSTEPS:", "\nKEY TERMS:", "\nCHECK BEFORE SUBMITTING:", "\nWHAT IT ASKS:"].iter().filter_map(|m| rest.find(m)).min().unwrap_or(rest.len());
    let s = rest[..end].trim().to_string();
    (!s.is_empty()).then_some(s)
}

/// The numbered steps ("1. …").
fn steps_of(guide: &str) -> Vec<String> {
    // The shape was asked for, but a free model writes "**STEPS:**", or
    // "Step 1 —", or plain bullets. Demanding "STEPS:" with "1." numbering
    // meant an otherwise good guide came back with no steps at all, and the
    // user was told "Here's the plan" with nothing after it.
    let body = section(guide, "STEPS").unwrap_or_else(|| guide.to_string());
    let found: Vec<String> = body.lines().map(str::trim).filter_map(numbered_step).collect();
    if !found.is_empty() {
        return found;
    }
    // Still nothing: any bulleted line long enough to be a step.
    body.lines()
        .map(str::trim)
        .filter_map(|l| {
            let rest = l.strip_prefix("- ").or_else(|| l.strip_prefix("* "))?.trim();
            (rest.chars().count() >= 12 && !rest.ends_with(':')).then(|| clean_step(rest))
        })
        .collect()
}

/// "1. do this", "1) do this", "Step 1: do this", "**2.** do this".
fn numbered_step(line: &str) -> Option<String> {
    let l = line.trim_start_matches(['-', '*', '#', ' ']).trim_start_matches("**").trim();
    let l = l.strip_prefix("Step ").or_else(|| l.strip_prefix("step ")).unwrap_or(l);
    let (n, rest) = l.split_once(['.', ')', ':', '\u{2014}', '\u{2013}'])?;
    let n = n.trim().trim_end_matches("**").trim();
    (n.parse::<u32>().is_ok() && rest.trim().chars().count() >= 3).then(|| clean_step(rest.trim()))
}

fn clean_step(s: &str) -> String {
    s.trim().trim_start_matches("**").trim_end_matches("**").trim().to_string()
}

/// "next step" / "explain that" / "repeat" while a guide is open (2 hours).
pub fn follow_up(said: &str) -> Option<String> {
    // "Save the guide to my notes" (or "yes" to that offer): the last guide, kept.
    // (A new coaching request — "teach me this assignment and save the guide" —
    // makes a new guide instead.)
    if crate::notes::asks_to_save(said) && !asks_for_lesson(said) && ["guide", "plan", "steps", "assignment"].iter().any(|w| said.to_lowercase().contains(w)) {
        let last = LAST_GUIDE.lock().clone();
        if let Some((title, text, at)) = last.filter(|(_, _, at)| at.elapsed() < std::time::Duration::from_secs(4 * 3600)) {
            let _ = at;
            return Some(match crate::notes::from_text(&title, "Study coach", &text, false) {
                Ok(n) => format!("Saved the guide to your Notes (“{}”).", n.title),
                Err(e) => format!("I couldn't save the guide: {e}"),
            });
        }
    }
    let s = said.to_lowercase();
    let s = s.trim().trim_end_matches(['.', '!', '?']);
    let mut g = GUIDE.lock();
    let (steps, at, when) = g.as_mut()?;
    if when.elapsed() > std::time::Duration::from_secs(2 * 3600) || steps.is_empty() {
        return None;
    }
    let short = s.split_whitespace().count() <= 6;
    if short && ["next step", "next", "done next", "what's next", "whats next", "keep going", "continue"].contains(&s) {
        if *at + 1 >= steps.len() {
            *g = None;
            return Some("That was the last step ✅ — check the “Check before submitting” list in your note, then submit it yourself when you're happy.".into());
        }
        *at += 1;
        *when = std::time::Instant::now();
        return Some(format!("Step {} of {}: {}", *at + 1, steps.len(), steps[*at]));
    }
    if short && ["repeat", "again", "say that again", "repeat that"].contains(&s) {
        return Some(format!("Step {} of {}: {}", *at + 1, steps.len(), steps[*at]));
    }
    if short && ["previous step", "go back", "back"].contains(&s) {
        *at = at.saturating_sub(1);
        return Some(format!("Step {} of {}: {}", *at + 1, steps.len(), steps[*at]));
    }
    None
}

/// "explain that" / "I don't get it" on the current step: a simpler explanation, added to today's lesson note.
pub fn explain_current(said: &str) -> Option<String> {
    let s = said.to_lowercase();
    if !["explain that", "explain it", "i don't get it", "i dont get it", "what does that mean", "explain more", "explain this step"].iter().any(|w| s.contains(w)) {
        return None;
    }
    let step = {
        let g = GUIDE.lock();
        let (steps, at, when) = g.as_ref()?;
        if when.elapsed() > std::time::Duration::from_secs(2 * 3600) {
            return None;
        }
        steps.get(*at)?.clone()
    };
    let more = crate::chat::complete(&[
        json!({ "role": "system", "content": "Explain this assignment step to a beginner in 3–5 short sentences, with one everyday example. Teach the idea; don't write their graded answer." }),
        json!({ "role": "user", "content": step }),
    ])
    .ok()?;
    // Kept only when asked, or while the Study log is on.
    if crate::notes::may_keep(said) && crate::notes::add_to_lesson(&more).is_ok() {
        return Some(format!("{more}\n(Added to your lesson notes.)"));
    }
    Some(more)
}

#[cfg(test)]
mod tests {
    #[test]
    fn steps_are_read_however_the_model_writes_them() {
        // The shape that was asked for.
        let plain = "WHAT IT ASKS: do the lab.\nSTEPS:\n1. Open the VM — it hosts the target\n2. Run the scan\n";
        assert_eq!(steps_of(plain).len(), 2);
        assert_eq!(steps_of(plain)[0], "Open the VM \u{2014} it hosts the target");
        // Markdown, and "Step 1:" instead of "1.".
        let fancy = "**STEPS:**\n**Step 1:** Open the VM and sign in\n**Step 2 —** Run the scan against it\n";
        assert_eq!(steps_of(fancy).len(), 2, "{:?}", steps_of(fancy));
        // Bullets with no numbers at all.
        let bullets = "STEPS:\n- Open the lab VM and sign in\n- Run the scan against the target\n- ok\n";
        assert_eq!(steps_of(bullets).len(), 2, "too-short bullets aren't steps");
        // Nothing step-like: empty, so the caller gives the guide's own words.
        assert!(steps_of("WHAT IT ASKS: something.\nDUE: not shown").is_empty());
    }

    #[test]
    fn a_quiz_question_is_not_an_assignment() {
        assert!(is_quiz_page("This is an interactive quiz question asking why hidden file extensions are a threat. It is not an essay or long-form assignment, but a multiple-choice question within a larger set."));
        assert!(is_quiz_page("A multiple choice question about botnets."));
        assert!(!is_quiz_page("Write a 500-word reflection on your lab and submit it as a PDF."));
        assert!(!is_quiz_page("Build a small Python script that reads a CSV and prints the totals."));
    }

    use super::*;

    #[test]
    fn hears_assignment_coaching() {
        assert!(parse("explain the answer to this quiz question").is_none());
        assert!(parse("help me with the answer on this assignment").is_none());
        assert!(parse("Quiz me on these notes\n\nChapter 5 assignment: open terminal").is_none());
        assert_eq!(parse("teach me this assignment"), Some(Ask { open_first: None }));
        let a = parse("open my lab assignment on blackboard and teach me while I do it and save to my notes").unwrap();
        assert_eq!(a.open_first.as_deref(), Some("open my lab assignment on blackboard"));
        assert!(parse("open blackboard").is_none());
        assert!(parse("teach me python").is_none());
        // "Yes" to the offer runs its words: a save of the guide, not a new lesson.
        assert!(!asks_for_lesson("save the assignment guide to my notes"));
        assert!(asks_for_lesson("teach me this assignment and save the guide to my notes"));
    }

    #[test]
    fn reads_the_guide() {
        let g = "WHAT IT ASKS: Configure a firewall rule.\nHAND IN: a screenshot.\nDUE: Friday 11:59 PM\nSTEPS:\n1. Open the lab VM — you need admin access.\n2) Add the rule — it blocks port 23.\nKEY TERMS:\n- port: a numbered door";
        assert_eq!(section(g, "WHAT IT ASKS").as_deref(), Some("Configure a firewall rule."));
        assert_eq!(section(g, "DUE").as_deref(), Some("Friday 11:59 PM"));
        assert_eq!(steps_of(g), vec!["Open the lab VM — you need admin access.".to_string(), "Add the rule — it blocks port 23.".to_string()]);
    }
}
