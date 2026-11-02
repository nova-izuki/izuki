//! Is this page a graded assessment, a practice exercise, or neither?
//!
//! Every page with "quiz", "test" or "assessment" on it and two answer
//! buttons used to count as a graded test — "practice test" was even on that
//! list — so a self-check got the same hands-off treatment as an exam. The
//! answer here comes from the page's own evidence:
//!
//! - Graded signs (points, attempts, a timer, "submit for grading", a
//!   proctoring tool, "counts toward", a due date, a midterm or final): graded,
//!   even if the page also says "practice" — a practice test worth points is
//!   graded.
//! - Practice signs, and none of those: practice. Izuki may answer, pick and
//!   check, like any other page. A practice NAME (practice quiz, self-check,
//!   ungraded, flashcards, sample questions) counts only in the page's own
//!   title, address or main heading, since a sidebar link names another quiz.
//!   A SENTENCE saying so ("does not count toward your grade", "this quiz is
//!   ungraded", "test yourself") counts anywhere.
//! - Points ("1 point", "10 pts") are a grading sign, and grading signs count
//!   anywhere on the page, however long it is.
//! - Quiz-like with no evidence either way: treated as graded, and helped
//!   with explanations, suggested answers in the panel and feedback.
//! - Not quiz-like at all: nothing here applies, and nothing is held back.
//!
//! What the page says decides it, never what someone says about it: a "no,
//! it's practice" would otherwise unlock any exam.

/// What the page is.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Kind {
    /// An exam, test or quiz that's marked, or one that can't be told apart.
    Graded,
    /// The page itself says it's practice, and shows no grading.
    Practice,
    /// Not a quiz or test.
    NotAQuiz,
}

/// Signs a page is marked. Any one makes it graded.
const GRADED: &[&str] = &[
    "points possible", " pts", " points)", "(1 point", "(2 points", "attempt 1 of", "attempt 2 of", "attempts remaining", "attempts allowed",
    "attempts left", "attempt due", "time remaining", "time left", "time limit", "timer", "submit quiz", "submit test", "submit exam",
    "submit assessment", "finish attempt", "submit for grading", "save and submit", "submit all and finish", "proctor", "lockdown browser",
    "honorlock", "respondus", "proctorio", "counts toward", "count toward", "graded quiz", "graded test", "graded assessment",
    "midterm", "final exam", "due date", "due:", "% of your grade", "of your final grade", "marked out of",
];

/// Said to say it ISN'T graded — taken out before looking for graded signs
/// ("does not count toward" holds "count toward"; "ungraded quiz" holds
/// "graded quiz").
const NOT_GRADED: &[&str] = &[
    "does not count toward", "doesn't count toward", "won't count toward", "will not count toward", "not count toward",
    "not part of your grade", "won't be graded", "will not be graded", "not graded", "ungraded",
];

/// Phrases that NAME a practice activity. They count only in the page's own
/// title, address or main heading: the same words in a sidebar link name a
/// different quiz ("Week 3 Quiz" with a "Practice quiz" link in the menu is
/// not practice).
const PRACTICE_NAMES: &[&str] = &[
    "practice quiz", "practice test", "practice exam", "practice question", "practice set", "practice mode", "practice problems",
    "self-check", "self check", "selfcheck", "ungraded", "study mode", "flashcard", "learn mode", "sample question",
    "example question", "demo quiz", "demonstration",
];

/// Sentences that SAY this activity isn't graded, or invite the user to try
/// it. They count anywhere on the page.
const PRACTICE_SAYS: &[&str] = &[
    "not graded", "won't be graded", "will not be graded", "does not count", "doesn't count", "won't count", "will not count",
    "not part of your grade", "is ungraded", "an ungraded", "is a practice", "is for practice", "for practice only",
    "test yourself", "quiz yourself", "check your understanding", "try it yourself",
];

/// Signs the page is a quiz or test at all.
// (" exam", not "exam": "example" isn't one.)
const QUIZ_LIKE: &[&str] = &["quiz", " test", " exam", "assessment", "midterm", "knowledge check"];

/// "1 point", "(2 points)", "10 pts", "0.5 pt": a score on the page.
fn shows_points(words: &str) -> bool {
    let b = words.as_bytes();
    ["point", "pt"].iter().any(|unit| {
        words.match_indices(unit).any(|(i, _)| {
            let mut j = i;
            while j > 0 && b[j - 1].is_ascii_whitespace() {
                j -= 1;
            }
            let after = words[i + unit.len()..].strip_prefix('s').unwrap_or(&words[i + unit.len()..]);
            j > 0 && b[j - 1].is_ascii_digit() && !after.starts_with(|c: char| c.is_ascii_alphabetic())
        })
    })
}

/// What this page is, from its title (in a browser, plus its main heading),
/// address and words.
pub fn kind(title: &str, url: &str, text: &str) -> Kind {
    // The page itself. (A space in front: "Test 3 …" at the very start is
    // " test"; "practice-quiz" in an address reads as "practice quiz".)
    let page = format!(" {} {} ", title.to_lowercase(), url.to_lowercase().replace(['-', '_'], " "));
    // Everything on it. Grading signs anywhere count: a due date under a long
    // question list still makes the page graded. (Bounded: no page is this long.)
    let words = format!("{page}{}", text.chars().take(200_000).collect::<String>().to_lowercase());
    let named = PRACTICE_NAMES.iter().any(|w| page.contains(w));
    let says = PRACTICE_SAYS.iter().any(|w| words.contains(w));
    let quiz_like = QUIZ_LIKE.iter().any(|w| words.contains(w)) || (words.contains("question ") && words.contains(" of ")) || named || says;
    if !quiz_like {
        return Kind::NotAQuiz;
    }
    let said_ungraded = NOT_GRADED.iter().fold(words.clone(), |w, n| w.replace(n, " "));
    if GRADED.iter().any(|w| said_ungraded.contains(w)) || shows_points(&said_ungraded) {
        return Kind::Graded;
    }
    if named || says {
        return Kind::Practice;
    }
    Kind::Graded
}

/// What Izuki can do on this kind of page, said plainly (instead of only
/// what it won't).
pub fn what_i_can_do(kind: Kind) -> &'static str {
    match kind {
        Kind::Graded => "This looks like a graded quiz or test, so I won't pick or submit answers. I can explain each question and the idea behind it, check the answer you're thinking of, and in the browser panel's “Go through each question” I suggest an answer with the reason — you click it. If it's really practice and the page says so (practice, self-check, ungraded), I can do it with you.",
        Kind::Practice => "This page is practice, so I can answer, pick choices, go to the next question and check results with you.",
        Kind::NotAQuiz => "",
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// The cases the browser extension checks too (tools/assessment-cases.json).
    #[test]
    fn tells_graded_from_practice_from_neither() {
        let cases: serde_json::Value = serde_json::from_str(include_str!("../../tools/assessment-cases.json")).unwrap();
        for c in cases.as_array().unwrap() {
            let (title, url, want) = (c["title"].as_str().unwrap(), c["url"].as_str().unwrap(), c["kind"].as_str().unwrap());
            // "padBefore": that many filler sentences first (a long page).
            let text = format!("{}{}", "Read the passage carefully. ".repeat(c["padBefore"].as_u64().unwrap_or(0) as usize), c["text"].as_str().unwrap());
            let got = match kind(title, url, &text) {
                Kind::Graded => "graded",
                Kind::Practice => "practice",
                Kind::NotAQuiz => "none",
            };
            assert_eq!(got, want, "{title} | {}", text.chars().rev().take(160).collect::<String>().chars().rev().collect::<String>());
        }
    }

    #[test]
    fn reads_points_as_a_score() {
        for yes in [" question 1 — 1 point", "(2 points)", "10 pts", "0.5 pt.", "worth 3\npoints"] {
            assert!(shows_points(yes), "{yes}");
        }
        for no in [" checkpoint 2", "1 pointer", "point of view", "a script", "chapter 4 key points"] {
            assert!(!shows_points(no), "{no}");
        }
    }

    #[test]
    fn says_what_it_can_do() {
        assert!(what_i_can_do(Kind::Graded).contains("explain each question") && what_i_can_do(Kind::Graded).contains("you click it"));
        assert!(what_i_can_do(Kind::Practice).contains("pick choices"));
        assert!(what_i_can_do(Kind::NotAQuiz).is_empty());
    }
}
