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

/// "teach me this assignment", "open my lab assignment and walk me through it and save notes".
pub fn parse(said: &str) -> Option<Ask> {
    let s = format!(" {} ", said.to_lowercase().split_whitespace().collect::<Vec<_>>().join(" "));
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

/// Read the assignment in front, make the guide, save it to Notes, start walking through it.
pub fn coach() -> anyhow::Result<String> {
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
    let note = crate::notes::from_text(&format!("Assignment — {}", crate::notes::tidy_title(&title)), &title, &guide, false)?;
    let steps = steps_of(&guide);
    let asks = section(&guide, "WHAT IT ASKS").unwrap_or_default();
    let due = section(&guide, "DUE").filter(|d| !d.to_lowercase().contains("not shown"));
    *GUIDE.lock() = Some((steps.clone(), 0, std::time::Instant::now()));
    eprintln!("[study] guide saved ({} steps)", steps.len());
    let first = steps.first().cloned().unwrap_or_default();
    Ok(format!(
        "{}{}\nI saved a step-by-step guide to your Notes (“{}”).{}",
        if asks.is_empty() { "Here's the plan.".to_string() } else { asks },
        due.map(|d| format!(" Due: {d}.")).unwrap_or_default(),
        note.title,
        if first.is_empty() { String::new() } else { format!("\nStep 1 of {}: {first}\nSay “next step” when you're ready, or “explain that”.", steps.len()) }
    ))
}

fn section(guide: &str, name: &str) -> Option<String> {
    let start = guide.find(&format!("{name}:"))? + name.len() + 1;
    let rest = &guide[start..];
    let end = ["\nHAND IN:", "\nDUE:", "\nSTEPS:", "\nKEY TERMS:", "\nCHECK BEFORE SUBMITTING:", "\nWHAT IT ASKS:"].iter().filter_map(|m| rest.find(m)).min().unwrap_or(rest.len());
    let s = rest[..end].trim().to_string();
    (!s.is_empty()).then_some(s)
}

/// The numbered steps ("1. …").
fn steps_of(guide: &str) -> Vec<String> {
    let Some(body) = section(guide, "STEPS") else { return Vec::new() };
    body.lines()
        .map(str::trim)
        .filter_map(|l| {
            let (n, rest) = l.split_once(['.', ')'])?;
            (n.trim().parse::<u32>().is_ok() && !rest.trim().is_empty()).then(|| rest.trim().to_string())
        })
        .collect()
}

/// "next step" / "explain that" / "repeat" while a guide is open (2 hours).
pub fn follow_up(said: &str) -> Option<String> {
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
    let _ = crate::notes::add_to_lesson(&more);
    Some(format!("{more}\n(Added to your lesson notes.)"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hears_assignment_coaching() {
        assert_eq!(parse("teach me this assignment"), Some(Ask { open_first: None }));
        let a = parse("open my lab assignment on blackboard and teach me while I do it and save to my notes").unwrap();
        assert_eq!(a.open_first.as_deref(), Some("open my lab assignment on blackboard"));
        assert!(parse("open blackboard").is_none());
        assert!(parse("teach me python").is_none());
    }

    #[test]
    fn reads_the_guide() {
        let g = "WHAT IT ASKS: Configure a firewall rule.\nHAND IN: a screenshot.\nDUE: Friday 11:59 PM\nSTEPS:\n1. Open the lab VM — you need admin access.\n2) Add the rule — it blocks port 23.\nKEY TERMS:\n- port: a numbered door";
        assert_eq!(section(g, "WHAT IT ASKS").as_deref(), Some("Configure a firewall rule."));
        assert_eq!(section(g, "DUE").as_deref(), Some("Friday 11:59 PM"));
        assert_eq!(steps_of(g), vec!["Open the lab VM — you need admin access.".to_string(), "Add the rule — it blocks port 23.".to_string()]);
    }
}
