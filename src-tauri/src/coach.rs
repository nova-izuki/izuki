//! Quiz coach: through a quiz or test WITH the student, never for them.
//!
//! "Coach me through this quiz": for each question Izuki reads it, explains
//! the idea behind it in plain words — without saying or hinting which
//! choice is right — and then waits quietly ("your turn") while the
//! student picks. No hanging up, no listening for a reply. Once a choice is
//! made and left alone for a moment, Izuki presses Next (never Submit, End
//! or Finish: those stay the student's) and explains the next question.
//! After the student submits, "go over my results" reviews what was missed.
//!
//! Stop it with "stop coaching", Stop, or Esc.

use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{Duration, Instant};

use parking_lot::Mutex;
use serde_json::json;
use tauri::{AppHandle, Emitter};

/// The run allowed to keep going (0: none); `stop` clears it at once.
static GEN: AtomicU64 = AtomicU64::new(0);
/// The run holding the coaching slot (0: free).
static RUNNING: AtomicU64 = AtomicU64::new(0);
static NEXT_ID: AtomicU64 = AtomicU64::new(0);
/// What the Island shows: "Quiz coach · your turn".
static STAGE: Mutex<Option<String>> = Mutex::new(None);

pub fn active() -> bool {
    RUNNING.load(Ordering::SeqCst) != 0
}

pub fn glance() -> Option<String> {
    STAGE.lock().clone()
}

pub fn stop() {
    GEN.store(0, Ordering::SeqCst);
    // Free the slot now: a new start needn't wait for the old thread to notice.
    RUNNING.store(0, Ordering::SeqCst);
    *STAGE.lock() = None;
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Ask {
    Start,
    Stop,
}

/// Quizzes, for the doing-verbs below. Not "questions": "do the questions in
/// this email" isn't a quiz.
pub const QUIZ_NOUNS: &[&str] = &["quiz", "quizzes", "test", "tests", "exam", "exams", "assessment", "assessments"];

/// Is a doing-verb (do, take, finish, complete, start, answer) aimed at one
/// of `nouns` — "finish my test", "do a practice quiz", "complete chapter 3
/// assignment"?
///
/// The verb has to be *applied to* the noun: right after it, or with only a
/// few words like my/this/the/practice/chapter 3 between. A verb anywhere and
/// a noun anywhere was the earlier rule, and it sent "do a speed test",
/// "finish the unit tests", "take the test drive booking" and "do this task
/// for me" to the quiz coach or the assignment guide — ordinary requests,
/// taken over by a study tool that reads the screen instead of doing them.
pub fn verb_on(said: &str, nouns: &[&str]) -> bool {
    const VERBS: &[&str] = &["do", "take", "finish", "complete", "start", "answer", "attempt"];
    // Allowed between the verb and the noun.
    const BETWEEN: &[&str] = &[
        "my", "this", "the", "a", "an", "our", "that", "these", "those", "next", "practice", "final", "midterm",
        "pop", "online", "graded", "chapter", "module", "week", "section", "lesson", "today's", "todays",
    ];
    // A noun followed by one of these is a different thing: a test drive, a
    // test plan, an exam room.
    const COMPOUND: &[&str] = &[
        "plan", "plans", "drive", "run", "runs", "case", "cases", "room", "show", "match", "suite", "booking",
        "series", "kit", "strip", "tube", "pilot", "flight", "server", "data", "file", "environment", "results",
    ];
    let words: Vec<String> = said
        .to_lowercase()
        .replace('\u{2019}', "'")
        .split(|c: char| !c.is_alphanumeric() && c != '\'')
        .filter(|w| !w.is_empty())
        .map(str::to_string)
        .collect();
    for (i, w) in words.iter().enumerate() {
        if !VERBS.contains(&w.as_str()) {
            continue;
        }
        for (gap, next) in words.iter().enumerate().skip(i + 1).take(4) {
            let next = next.as_str();
            if nouns.contains(&next) {
                let after = words.get(gap + 1).map(String::as_str).unwrap_or("");
                if !COMPOUND.contains(&after) {
                    return true;
                }
                break;
            }
            let numeric = next.chars().all(|c| c.is_ascii_digit());
            if !BETWEEN.contains(&next) && !numeric {
                break;
            }
        }
    }
    false
}

pub fn parse(said: &str) -> Option<Ask> {
    let s = format!(" {} ", said.to_lowercase().replace(['?', '!', ',', '.'], " ").split_whitespace().collect::<Vec<_>>().join(" "));
    if s.contains(" stop coaching") || s.contains(" quit coaching") || s.contains(" end coaching") || s.contains(" stop the coach") || s.contains(" stop quiz coach") {
        return Some(Ask::Stop);
    }
    let quiz = [" quiz", " test", " exam", " questions", " assessment"].iter().any(|w| s.contains(w));
    // Asking to be coached, by name: these are specific enough to pair with a
    // quiz word anywhere in the sentence ("walk me through this test").
    let coach = [" coach me", " quiz coach", " coach mode", " walk me through", " go through", " do this quiz with me", " do it with me", " help me with this", " help me through", " study along", " tutor me"]
        .iter()
        .any(|w| s.contains(w));
    // "Do my quiz", "finish this test", "help me do a quiz": a doing-verb
    // aimed at the quiz itself (see verb_on — a loose version of this took
    // over "do a speed test" and "finish the unit tests").
    let doing = verb_on(said, QUIZ_NOUNS);
    (quiz && coach || doing || s.contains(" quiz coach") || s.contains(" coach mode")).then_some(Ask::Start)
}

/// Answer choices on screen, grouped by question (the part of the page they
/// sit in), in order: [(group, [(name, selected, control)])].
type Choice = (String, bool, crate::uia::Control);

/// One look at the page: its answer choices by question, and its Next button.
struct Look {
    groups: Vec<(String, Vec<Choice>)>,
    next: Option<crate::uia::Control>,
}

fn look() -> Look {
    let controls = crate::uia::list_controls(220);
    let next = next_of(&controls);
    Look { groups: group(controls), next }
}

/// Choices grouped by question: a new question where the part of the page
/// changes or there's a clear gap (several Blackboard questions share one
/// part of the page, but sit well apart).
fn group(controls: Vec<crate::uia::Control>) -> Vec<(String, Vec<Choice>)> {
    let mut opts: Vec<crate::uia::Control> = controls.into_iter().filter(|c| matches!(c.kind.as_str(), "RadioButton" | "CheckBox") && !c.name.trim().is_empty()).collect();
    opts.sort_by_key(|c| (c.below, c.rect.y));
    let gaps: Vec<i32> = opts.windows(2).map(|w| (w[1].rect.y - w[0].rect.y).max(0)).collect();
    let mut sorted = gaps.clone();
    sorted.sort_unstable();
    let usual = sorted.get(sorted.len() / 2).copied().unwrap_or(30).max(18);
    let mut groups: Vec<(String, Vec<Choice>)> = Vec::new();
    for (i, c) in opts.into_iter().enumerate() {
        let new_group = i == 0
            || groups.last().is_some_and(|(k, list)| *k != c.section || list.last().is_some_and(|(_, _, p)| p.below != c.below))
            || gaps.get(i - 1).is_some_and(|g| *g > usual * 5 / 2);
        let item = (c.name.trim().to_string(), c.value == "selected", c.clone());
        if new_group {
            groups.push((c.section.clone(), vec![item]));
        } else if let Some((_, list)) = groups.last_mut() {
            list.push(item);
        }
    }
    groups.retain(|(_, list)| list.len() >= 2);
    groups
}

/// The question to coach next: the first group with nothing chosen (pure).
pub fn current(groups: &[(String, Vec<(String, bool)>)]) -> Option<usize> {
    groups.iter().position(|(_, list)| !list.iter().any(|(_, sel)| *sel))
}

const EXPLAIN: &str = "You are Izuki, a patient tutor sitting next to a student who is taking a quiz or test. \
Explain the idea behind the question whose answer choices are listed — what it's really asking and the concept \
they need to think about — in 2 to 4 short spoken sentences, plain words, warm. You must NOT say, hint at, rank or \
rule out any of the choices, and never say which one is right: the student chooses. End with a short line inviting \
them to pick (\"Take your time and pick the one that fits.\"). No markdown.";

fn say(app: &AppHandle, text: &str, quick: bool) {
    let _ = app.emit("izuki://say", json!({ "text": text, "mood": "calm", "reply": true, "quick": quick }));
}

fn stage(text: Option<&str>) {
    *STAGE.lock() = text.map(String::from);
}

/// Start coaching the quiz on screen. Returns what to say at once.
pub fn start(app: &AppHandle) -> String {
    // Claim the one coaching slot first: two starts at once never run two coaches.
    let my_gen = NEXT_ID.fetch_add(1, Ordering::SeqCst) + 1;
    if RUNNING.compare_exchange(0, my_gen, Ordering::SeqCst, Ordering::SeqCst).is_err() {
        return "I'm already coaching you through this quiz — pick your answer when you're ready. (Say “stop coaching” to stop.)".into();
    }
    let groups = look().groups;
    if groups.is_empty() {
        RUNNING.store(0, Ordering::SeqCst);
        return "I can't see a question with answers to pick on screen. Open the quiz in front, then say “coach me through this quiz”.".into();
    }
    GEN.store(my_gen, Ordering::SeqCst);
    crate::hotkey::set_escape(app, true);
    stage(Some("Quiz coach · reading the question"));
    let app2 = app.clone();
    std::thread::spawn(move || {
        let _ = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| run(&app2, my_gen)));
        let _ = RUNNING.compare_exchange(my_gen, 0, Ordering::SeqCst, Ordering::SeqCst);
        // No coach running now (this one ended, or was stopped): Esc goes back to normal.
        if RUNNING.load(Ordering::SeqCst) == 0 {
            stage(None);
            crate::hotkey::set_escape(&app2, false);
        }
    });
    "Quiz coach on 🎓 I'll explain each question, then wait while you pick — I won't choose for you, and I'll never press Submit. Once you've picked, I'll go to the next one.".into()
}

fn alive(my_gen: u64) -> bool {
    my_gen != 0 && GEN.load(Ordering::SeqCst) == my_gen
}

/// A choice's identity on the page (new question, new elements).
fn rid(c: &crate::uia::Control) -> String {
    c.identity.as_ref().map(|i| i.runtime_id.iter().map(|n| n.to_string()).collect::<Vec<_>>().join(".")).unwrap_or_default()
}

/// What identifies a question on screen: its choices, the elements they are
/// and where they sit (True/False questions share choices, not elements).
fn key_of(group: &(String, Vec<Choice>)) -> String {
    let names: Vec<&str> = group.1.iter().map(|(n, _, _)| n.as_str()).collect();
    // The element's id says which question it is; where it sits only when
    // there's no id (scrolling mustn't make it a "new" question).
    let first = group.1.first().map(|(_, _, c)| { let id = rid(c); if id.is_empty() { format!("@{}", c.rect.y / 40) } else { id } }).unwrap_or_default();
    format!("{}|{}|{first}", group.0, names.join("/"))
}

/// Every choice, which element it is and whether it's chosen: when this
/// changes without a pick, the page moved on.
fn state_of(l: &Look) -> String {
    l.groups.iter().flat_map(|(k, list)| list.iter().map(move |(n, s, c)| format!("{k}:{n}:{}:{s}", rid(c)))).collect::<Vec<_>>().join(",")
}

const IDLE: Duration = Duration::from_secs(20 * 60);

/// Wait (quietly) for the page to change by itself. `false`: stopped, or idle too long.
fn wait_change(app: &AppHandle, my_gen: u64, before: &str, idle_since: Instant) -> bool {
    while alive(my_gen) {
        if idle_since.elapsed() > IDLE {
            say(app, "I'll stop coaching for now — say “coach me through this quiz” when you're back.", false);
            return false;
        }
        std::thread::sleep(Duration::from_millis(2500));
        crate::hotkey::set_escape(app, true);
        if state_of(&look()) != before {
            return true;
        }
    }
    false
}

fn run(app: &AppHandle, my_gen: u64) {
    // The question last explained, and whether the student has picked since.
    let mut explained: Option<String> = None;
    let mut idle_since = Instant::now();
    while alive(my_gen) {
        if idle_since.elapsed() > IDLE {
            say(app, "I'll stop coaching for now — say “coach me through this quiz” when you're back.", false);
            return;
        }
        let l = look();
        let groups = &l.groups;
        let simple: Vec<(String, Vec<(String, bool)>)> = groups.iter().map(|(k, list)| (k.clone(), list.iter().map(|(n, s, _)| (n.clone(), *s)).collect())).collect();
        let Some(i) = current(&simple) else {
            // Everything on this page has an answer.
            let before = state_of(&l);
            let multi = groups.iter().any(|(_, list)| list.iter().any(|(_, _, c)| c.kind == "CheckBox"));
            let Some(next) = l.next.clone() else {
                say(app, if groups.is_empty() {
                    "That looks like the end of the questions. Check your answers and submit when you're ready — that part's yours. After, say “go over my results” and we'll look at anything you missed."
                } else {
                    "You've answered everything I can see. Look them over, then submit when you're ready — I won't press it. After, say “go over my results” and we'll go through what you missed."
                }, false);
                return;
            };
            if explained.is_none() || multi {
                // Answered before I explained anything (or "tick all that apply"):
                // moving on is the student's call.
                say(app, if multi {
                    "Tick everything that applies, then press Next yourself — I'll explain the next question."
                } else {
                    "These already have answers. Press Next when you're ready, and I'll explain the next question."
                }, false);
                stage(Some("Quiz coach · press Next when you're ready"));
                if !wait_change(app, my_gen, &before, idle_since) {
                    return;
                }
                explained = None;
                idle_since = Instant::now();
                continue;
            }
            // They picked after the explanation: a moment to change their mind, then Next.
            if !wait_steady(my_gen) {
                continue;
            }
            // The very same button, right before pressing (not just one with the same name).
            let now = look();
            if !alive(my_gen) {
                return;
            }
            let before = state_of(&now);
            let same = now.next.filter(|n| n.name == next.name && rid(n) == rid(&next));
            let pressed = same.as_ref().is_some_and(|n| press(app, n));
            let moved = pressed
                && (0..8).any(|_| {
                    std::thread::sleep(Duration::from_millis(750));
                    alive(my_gen) && state_of(&look()) != before
                });
            if !moved {
                say(app, "I couldn't move to the next question — press Next yourself, and I'll explain the next one.", false);
                stage(Some("Quiz coach · press Next when you're ready"));
                if !wait_change(app, my_gen, &before, idle_since) {
                    return;
                }
            }
            explained = None;
            idle_since = Instant::now();
            continue;
        };
        let (_, list) = &groups[i];
        let names: Vec<String> = list.iter().map(|(n, _, _)| n.clone()).collect();
        // Further down the page: wait for it to be scrolled into view.
        if list.iter().all(|(_, _, c)| c.below) {
            stage(Some("Quiz coach · scroll down to the next question"));
            std::thread::sleep(Duration::from_millis(2500));
            continue;
        }
        let key = key_of(&groups[i]);
        if explained.as_ref() != Some(&key) {
            stage(Some("Quiz coach · explaining"));
            let page: String = crate::uia::document_text(5000);
            let prompt = format!("The page (the question is near these choices):\n{}\n\nAnswer choices:\n- {}", page.chars().take(3500).collect::<String>(), names.join("\n- "));
            let text = crate::chat::complete(&[json!({ "role": "system", "content": EXPLAIN }), json!({ "role": "user", "content": prompt })])
                .map(|t| leak_guard(&t, &names))
                .unwrap_or_else(|_| "Read the question carefully and think about what it's really asking. Take your time and pick the one that fits.".into());
            if !alive(my_gen) {
                return;
            }
            say(app, &text, false);
            crate::studylog::record_on_page(&format!("Quiz question: {}", names.join(" / ")), &text, &crate::uia::foreground_title(), &page);
            explained = Some(key);
            idle_since = Instant::now();
            stage(Some(if list.iter().any(|(_, _, c)| c.kind == "CheckBox") { "Quiz coach · your turn — tick what applies" } else { "Quiz coach · your turn — pick an answer" }));
        }
        // Their turn: watch for a choice, quietly (a look every few seconds is plenty).
        std::thread::sleep(Duration::from_millis(2500));
        crate::hotkey::set_escape(app, true);
    }
}

/// The model must not give the answer away: a line naming a choice as the
/// answer is dropped (the explanation stays).
pub fn leak_guard(text: &str, choices: &[String]) -> String {
    let pad = |s: &str| format!(" {} ", s.to_lowercase().chars().map(|c| if c.is_alphanumeric() { c } else { ' ' }).collect::<String>().split_whitespace().collect::<Vec<_>>().join(" "));
    // A choice's own words ("a. Phishing emails" → "phishing emails").
    let choice_words: Vec<String> = choices
        .iter()
        .map(|c| {
            let p = pad(c);
            let p = p.trim();
            let p = p.strip_prefix(|ch: char| ch.is_ascii_alphabetic()).filter(|r| r.starts_with(' ')).map(str::trim).unwrap_or(p);
            format!(" {p} ")
        })
        .filter(|c| c.trim().len() >= 2)
        .collect();
    // One-letter or one-digit choices ("A", "1"): only next to a tell word.
    let short: Vec<String> = choices.iter().map(|c| c.trim().to_lowercase()).filter(|c| c.chars().count() == 1).collect();
    let tells = [" answer", " correct", " right", " is "];
    let kept: Vec<&str> = text
        .split_inclusive(['.', '!', '?'])
        .filter(|sentence| {
            let s = pad(sentence);
            let names_choice = choice_words.iter().any(|c| s.contains(c.as_str()));
            // "option B", "answer (c)", "choice d" — not the article "a".
            let by_letter = ["option", "answer", "choice", "letter"].iter().any(|w| ["a", "b", "c", "d", "e"].iter().any(|l| s.contains(&format!(" {w} {l} "))))
                || ["b", "c", "d", "e"].iter().any(|l| sentence.to_lowercase().contains(&format!("({l})")) || s.starts_with(&format!(" {l} ")));
            // "the second one", "the last option", "the top answer".
            let by_place = [" first ", " second ", " third ", " fourth ", " last ", " top ", " bottom "].iter().any(|w| s.contains(w))
                && [" one ", " option", " choice", " answer"].iter().any(|w| s.contains(w));
            let short_named = short.iter().any(|c| s.contains(&format!(" {c} "))) && tells.iter().any(|t| s.contains(t));
            !(names_choice || by_letter || by_place || short_named)
        })
        .collect();
    let out = kept.concat().trim().to_string();
    if out.is_empty() { "Think about what the question is really asking. Take your time and pick the one that fits.".into() } else { out }
}

/// The page's Next button (never a final one), on screen now.
fn next_of(controls: &[crate::uia::Control]) -> Option<crate::uia::Control> {
    controls.iter().cloned().find(|c| {
        if !matches!(c.kind.as_str(), "Button" | "Hyperlink") || c.below || c.hidden {
            return false;
        }
        let n = c.name.trim().to_lowercase();
        let next = n == "next" || n.starts_with("next ") || n == "next question" || n == "save and next" || n == "save & next" || n == "continue" || n == ">" || n == "→" || n == "next →";
        let final_ = ["submit", "finish", "end", "hand in", "turn in", "grade", "done"].iter().any(|f| n.contains(f));
        next && !final_
    })
}

/// A choice made and left alone for a moment (they might change their mind).
fn wait_steady(my_gen: u64) -> bool {
    let mut last: Option<Vec<bool>> = None;
    let mut since = Instant::now();
    let started = Instant::now();
    while alive(my_gen) && started.elapsed() < Duration::from_secs(30) {
        let now: Vec<bool> = look().groups.iter().flat_map(|(_, l)| l.iter().map(|(_, s, _)| *s)).collect();
        if last.as_ref() != Some(&now) {
            last = Some(now);
            since = Instant::now();
        } else if since.elapsed() >= Duration::from_millis(1800) {
            return true;
        }
        std::thread::sleep(Duration::from_millis(1200));
    }
    false
}

/// Press it behind the scenes if the page allows (your mouse stays put), else click it.
fn press(app: &AppHandle, c: &crate::uia::Control) -> bool {
    stage(Some("Quiz coach · next question"));
    let (x, y) = c.rect.center();
    let behind = c.identity.as_ref().map(|id| crate::uia::act_behind(id.window, crate::uia::Behind::Press { name: Some(&c.name), identity: Some(id), x, y }));
    match behind {
        Some(Ok(Some(_))) => {}
        // Greyed out: not yet (the page wants something first).
        Some(Err(e)) if e.to_string().starts_with("disabled") => {
            eprintln!("[coach] Next is greyed out");
            return false;
        }
        _ => {
            let _guard = crate::overlay::acting(app);
            if let Err(e) = crate::automation::click_at(x, y, enigo::Button::Left, 1, 120) {
                eprintln!("[coach] couldn't press Next: {e}");
                return false;
            }
        }
    }
    eprintln!("[coach] pressed Next");
    true
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ordinary_requests_are_not_quizzes() {
        // A verb anywhere plus "test" anywhere used to start the coach.
        for said in [
            "do a speed test",
            "finish the unit tests",
            "take the test drive booking",
            "do the questions in this email",
            "complete the test plan document",
            "finish the exam room booking",
            "do this task for me",
            "open spotify and play something",
        ] {
            assert_eq!(parse(said), None, "\"{said}\" is not a request to be coached through a quiz");
        }
        // Asking for help with a quiz still is.
        assert_eq!(parse("help me do a quiz for me and finish the assignment"), Some(Ask::Start));
        for said in ["do my quiz", "finish this test", "take the practice exam", "start chapter 3 quiz", "do a quiz"] {
            assert_eq!(parse(said), Some(Ask::Start), "{said}");
        }
    }

    #[test]
    fn hears_coach_asks() {
        assert_eq!(parse("coach me through this quiz"), Some(Ask::Start));
        assert_eq!(parse("help me with this test"), Some(Ask::Start));
        assert_eq!(parse("quiz coach"), Some(Ask::Start));
        assert_eq!(parse("help me do a quiz for me and finish the assignment"), Some(Ask::Start));
        assert_eq!(parse("finish my test"), Some(Ask::Start));
        assert_eq!(parse("do my quiz"), Some(Ask::Start));
        assert_eq!(parse("stop coaching"), Some(Ask::Stop));
        assert_eq!(parse("help me with this email"), None);
    }

    #[test]
    fn first_unanswered_question() {
        let g = |sel: &[bool]| (String::new(), sel.iter().enumerate().map(|(i, s)| (format!("opt{i}"), *s)).collect::<Vec<_>>());
        assert_eq!(current(&[g(&[false, true]), g(&[false, false])]), Some(1));
        assert_eq!(current(&[g(&[true, false])]), None);
        assert_eq!(current(&[]), None);
    }

    #[test]
    fn never_gives_the_answer_away() {
        let choices = vec!["Personally identifiable information".to_string(), "Phishing emails".to_string()];
        let t = leak_guard("DLP tools look for sensitive data leaving the company. The answer is Personally identifiable information. Take your time and pick.", &choices);
        assert!(!t.to_lowercase().contains("answer is"), "{t}");
        assert!(t.contains("DLP tools look for sensitive data"), "the teaching stays: {t}");
        let t = leak_guard("Think about what spreads by itself. Option B is correct.", &choices);
        assert!(!t.contains("Option B"), "{t}");
        // Any sentence naming a choice goes, tell-word or not.
        let t = leak_guard("Phishing emails trick people into clicking. Think about data leaving the company.", &choices);
        assert!(!t.contains("Phishing emails"), "{t}");
        let t = leak_guard("It's a question about a company's data. Take your time.", &choices);
        assert!(t.contains("a company's data"), "the article 'a' isn't a choice: {t}");
        let t = leak_guard("Think about who it targets. I'd lean towards the second one. Take your time.", &choices);
        assert!(!t.contains("second one"), "{t}");
        let t = leak_guard("Think about the order. The answer is 3. Take your time.", &["1".into(), "3".into()]);
        assert!(!t.contains("answer is 3"), "{t}");
    }
}
