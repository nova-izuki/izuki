//! Study log: "save every question and answer to my notes so I can learn
//! later". While it's on, each question asked — typed, spoken or from the
//! phone — goes into today's "Study log" note with its answer, and answers
//! are written to teach (the answer, why, and one thing to remember). Every
//! note can become flashcards or a quiz in Notes.

use anyhow::Result;

/// Added to the chat's instructions while the log is on.
pub const RULE: &str = "\n\nSTUDY LOG IS ON: every question the user asks and your answer are saved to their notes so they can learn from them later. When they ask a question, answer so it teaches: the answer first, then why or how in a few short steps, then one last line starting \"Remember:\" with the key idea. Commands and small talk are answered normally.";

/// "Save every question and answer to my notes" → Some(true); "stop saving my
/// questions" → Some(false).
pub fn parse(said: &str) -> Option<bool> {
    let s = format!(" {} ", said.to_lowercase().replace(['’', '\''], "").replace(|c: char| !c.is_alphanumeric() && c != ' ', " "));
    let s = s.split_whitespace().collect::<Vec<_>>().join(" ");
    let s = format!(" {s} ");
    let about = [" question", " questions", " quest ", " q and a", " qa ", " q&a", " answers", " study log", " what i ask", " everything i ask", " all i ask"];
    if !about.iter().any(|w| s.contains(w)) {
        return None;
    }
    let stop = [" stop ", " dont ", " do not ", " turn off ", " switch off ", " no more ", " quit "];
    let keep = [" save ", " keep ", " log ", " record ", " write down ", " put ", " add ", " store ", " study log on ", " turn on "];
    let to_notes = s.contains(" note") || s.contains(" study log") || s.contains(" learn later") || s.contains(" later ");
    let every = [" every ", " all ", " each ", " always ", " from now on ", " study log "].iter().any(|w| s.contains(w));
    if stop.iter().any(|w| s.contains(w)) && (to_notes || s.contains(" saving ")) {
        return Some(false);
    }
    (keep.iter().any(|w| s.contains(w)) && to_notes && every).then_some(true)
}

pub fn on() -> bool {
    crate::state::store().settings().study_log
}

pub fn set(on: bool) {
    let store = crate::state::store();
    let mut s = store.settings();
    if s.study_log != on {
        s.study_log = on;
        store.set_settings(s);
        crate::state::settings_changed_elsewhere();
    }
}

pub fn handle(turn_on: bool) -> String {
    set(turn_on);
    eprintln!("[studylog] {}", if turn_on { "on" } else { "off" });
    if turn_on {
        "Study log on 📝 From now on, every question you ask me — typed, spoken or from your phone — goes into today's “Study log” note in Notes, with the answer explained so you can learn it later. Open it in Notes to make flashcards or a quiz from it. Say “stop saving my questions” to turn it off.".into()
    } else {
        "Study log off. What's already saved stays in Notes.".into()
    }
}

/// A question (or a "teach me" ask), not a command or small talk.
pub fn is_question(text: &str) -> bool {
    let t = text.trim().to_lowercase();
    if t.len() < 6 || parse(&t).is_some() || asks_to_act(&t) {
        return false;
    }
    if t.ends_with('?') {
        return true;
    }
    let starts = [
        "what", "why", "how", "when", "where", "who", "which", "whats", "what's", "is ", "are ", "does ", "can you explain", "could you explain", "explain", "define", "teach me",
        "tell me about", "tell me what", "tell me why", "tell me how", "help me understand", "whats the difference", "difference between", "meaning of", "solve", "summarize", "summarise", "research", "look up", "find out",
    ];
    let t = t.trim_start_matches("hey nova").trim_start_matches([',', ' ']).trim_start_matches("nova").trim_start_matches([',', ' ']);
    let t = t.trim_start_matches("please ").trim_start_matches("can you ").trim_start_matches("could you ");
    starts.iter().any(|w| t.starts_with(w)) || t.starts_with("explain") || t.contains(" mean?") || t.ends_with(" mean")
}

/// "Can you open Chrome?", "please play some music": a command, even with a "?".
fn asks_to_act(t: &str) -> bool {
    let t = t.trim_start_matches("hey nova").trim_start_matches([',', ' ']);
    let t = ["can you ", "could you ", "would you ", "will you ", "please ", "pls "].iter().fold(t.to_string(), |s, p| s.trim_start_matches(p).to_string());
    let verbs = [
        "open ", "close ", "click ", "play ", "pause ", "stop ", "start ", "launch ", "send ", "email ", "text ", "call ", "turn ", "set ", "make ", "create ", "delete ", "remove ",
        "type ", "write ", "go to ", "search ", "find ", "download ", "install ", "remind ", "move ", "copy ", "paste ", "save ", "book ", "buy ", "add ", "check my ", "show me ", "mute",
        "unmute", "skip", "minimize", "maximise", "maximize", "scroll", "restart", "shut ",
    ];
    verbs.iter().any(|v| t.starts_with(v))
}

/// The answer as it reads in a note: no [mood] tag, voice cues or hidden tags.
pub fn clean(answer: &str) -> String {
    let mut out = String::with_capacity(answer.len());
    let mut rest = answer.trim();
    // "[happy] …" opening.
    if rest.starts_with('[') {
        if let Some(end) = rest.find(']') {
            if end < 24 && !rest[1..end].contains(' ') {
                rest = rest[end + 1..].trim_start();
            }
        }
    }
    let mut chars = rest.chars().peekable();
    while let Some(c) = chars.next() {
        if c == '<' {
            // <laugh>, <sigh>…: a short lowercase cue.
            let cue: String = chars.clone().take_while(|&x| x != '>').collect();
            if cue.len() <= 12 && cue.chars().all(|x| x.is_ascii_lowercase()) && chars.clone().nth(cue.len()) == Some('>') {
                for _ in 0..=cue.len() {
                    chars.next();
                }
                continue;
            }
        }
        out.push(c);
    }
    out.lines()
        .filter(|l| {
            let l = l.trim();
            !(l.starts_with("[SCREEN") || l.starts_with("[REMIND") || l.starts_with("[remind") || l.starts_with("[TOOL") || l.starts_with("[tool"))
        })
        .collect::<Vec<_>>()
        .join("\n")
        .trim()
        .to_string()
}

/// One entry for the log (pure, so it's tested).
pub fn entry(question: &str, answer: &str, at: chrono::DateTime<chrono::Local>) -> String {
    let q: String = question.trim().chars().take(400).collect();
    format!("### {} — {q}\n{}", at.format("%-I:%M %p"), clean(answer))
}

/// Save a question and its answer, if the log is on and it was a question.
pub fn record(question: &str, answer: &str) {
    if !on() || !is_question(question) || clean(answer).len() < 3 {
        return;
    }
    let question = question.to_string();
    let answer = answer.to_string();
    // Off the reply's thread: a slow disk never holds up the answer.
    std::thread::spawn(move || {
        if let Err(e) = save(&question, &answer) {
            eprintln!("[studylog] couldn't save: {e}");
        }
    });
}

fn save(question: &str, answer: &str) -> Result<()> {
    let now = chrono::Local::now();
    let title = format!("Study log — {}", now.format("%a %-d %b"));
    crate::notes::add_to_log(&title, "Study log", &entry(question, answer, now))?;
    eprintln!("[studylog] saved a question");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hears_the_ask_loosely() {
        assert_eq!(parse("save every quest and ans pn my notes nd explin so i can learn later"), Some(true));
        assert_eq!(parse("save every question and answer on my notes and explain so i can learn later"), Some(true));
        assert_eq!(parse("from now on keep all my questions in my notes"), Some(true));
        assert_eq!(parse("turn on study log"), Some(true));
        assert_eq!(parse("stop saving my questions"), Some(false));
        assert_eq!(parse("don't save my questions to notes any more"), Some(false));
        assert_eq!(parse("what is a question mark"), None);
        assert_eq!(parse("save this as a note"), None, "one answer, not every one");
    }

    #[test]
    fn only_questions_are_logged() {
        assert!(is_question("What is photosynthesis?"));
        assert!(is_question("explain recursion"));
        assert!(is_question("hey nova, how do vaccines work"));
        assert!(is_question("what does mitochondria mean"));
        assert!(!is_question("open chrome"));
        assert!(!is_question("thanks"));
        assert!(!is_question("save every question and answer to my notes"));
        assert!(!is_question("Can you open Chrome?"));
        assert!(!is_question("hey nova, please play some music?"));
        assert!(is_question("can you explain how loops work?"));
    }

    #[test]
    fn notes_read_clean() {
        assert_eq!(clean("[warm] Plants make food from light. <laugh> Easy!"), "Plants make food from light.  Easy!");
        assert_eq!(clean("Answer.\n[SCREEN] look"), "Answer.");
        assert_eq!(clean("a < b and c > d"), "a < b and c > d", "maths stays");
        let at = chrono::Local::now();
        assert!(entry("Why is the sky blue?", "[calm] Light scatters.", at).ends_with("Why is the sky blue?\nLight scatters."));
    }
}
