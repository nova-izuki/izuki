//! What you've studied, and the mistakes you keep making.
//!
//! A small diary on this PC: each question saved to the Study log, each
//! flashcard you mark right or wrong, notes made, lectures recorded and
//! textbook chapters explained. From it: "what have I studied this week?"
//! and "what do I keep getting wrong?" — cards missed more than once, most
//! missed first, ready to practise.

use std::collections::BTreeMap;

use anyhow::Result;
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Event {
    /// Unix ms.
    pub at: i64,
    /// "question" | "card" | "notes" | "lecture" | "textbook".
    pub kind: String,
    /// The note, book or subject it belongs to.
    pub topic: String,
    /// The question or card front.
    #[serde(default)]
    pub q: String,
    /// The card's answer (for practising mistakes).
    #[serde(default)]
    pub a: String,
    /// A flashcard: known (true) or missed (false).
    #[serde(default)]
    pub right: Option<bool>,
}

static TURN: Mutex<()> = Mutex::new(());

fn path() -> std::path::PathBuf {
    crate::store::data_dir().join("study.json")
}

pub fn events() -> Vec<Event> {
    std::fs::read_to_string(path()).ok().and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default()
}

pub fn add(kind: &str, topic: &str, q: &str, a: &str, right: Option<bool>) {
    let _turn = TURN.lock();
    let mut all = events();
    all.push(Event {
        at: crate::model::now_ms(),
        kind: kind.into(),
        topic: topic.chars().take(120).collect(),
        q: q.chars().take(300).collect(),
        a: a.chars().take(300).collect(),
        right,
    });
    // A year at most, and never more than 20 000 entries.
    let year_ago = crate::model::now_ms() - 365 * 86_400_000;
    all.retain(|e| e.at >= year_ago);
    let n = all.len();
    if n > 20_000 {
        all.drain(..n - 20_000);
    }
    let text = match serde_json::to_string(&all) {
        Ok(t) => t,
        Err(e) => return eprintln!("[study] couldn't save: {e}"),
    };
    // Written beside it, then swapped in: a crash mid-write never loses the diary.
    let tmp = path().with_extension("json.tmp");
    if let Err(e) = std::fs::write(&tmp, text).and_then(|_| std::fs::rename(&tmp, path())) {
        eprintln!("[study] couldn't save: {e}");
    }
}

/// A flashcard marked right or wrong (Notes).
pub fn mark_card(topic: &str, q: &str, a: &str, right: bool) -> Result<()> {
    add("card", topic, q, a, Some(right));
    Ok(())
}

#[derive(Debug, Clone, Serialize, Default, PartialEq)]
pub struct Mistake {
    pub topic: String,
    pub q: String,
    pub a: String,
    pub missed: usize,
    pub right: usize,
}

/// Cards missed at least twice that you haven't since got right twice in a
/// row: most missed first.
pub fn mistakes(all: &[Event]) -> Vec<Mistake> {
    let mut by: BTreeMap<(String, String), (Mistake, usize)> = BTreeMap::new();
    for e in all.iter().filter(|e| e.kind == "card") {
        let Some(right) = e.right else { continue };
        let m = by.entry((e.topic.clone(), e.q.to_lowercase())).or_insert_with(|| (Mistake { topic: e.topic.clone(), q: e.q.clone(), a: e.a.clone(), ..Default::default() }, 0));
        if right {
            m.0.right += 1;
            m.1 += 1;
        } else {
            m.0.missed += 1;
            m.1 = 0;
        }
        if !e.a.is_empty() {
            m.0.a = e.a.clone();
        }
    }
    let mut out: Vec<Mistake> = by.into_values().filter(|(m, streak)| m.missed >= 2 && *streak < 2).map(|(m, _)| m).collect();
    out.sort_by(|a, b| b.missed.cmp(&a.missed).then(a.right.cmp(&b.right)));
    out
}

/// A card waiting to be practised again.
#[derive(Debug, Clone, Serialize, Default)]
pub struct Due {
    pub topic: String,
    pub q: String,
    pub a: String,
    /// How many times in a row it's been right (its Leitner box).
    pub streak: u32,
    /// When it was last practised (Unix ms).
    pub last: i64,
    /// Days late: bigger means more overdue, so it goes first.
    pub overdue: i64,
}

/// Days to wait after a card has been right `streak` times running.
///
/// Leitner's boxes: right again and it waits longer, missed and it comes
/// back tomorrow. Spacing what you revise is the part of studying that
/// actually moves exam marks, and all the marks needed to work it out are
/// already in the diary.
fn wait_days(streak: u32) -> i64 {
    match streak {
        0 => 1,
        1 => 2,
        2 => 4,
        3 => 8,
        4 => 16,
        _ => 30,
    }
}

const DAY_MS: i64 = 24 * 60 * 60 * 1000;

/// Cards ready to practise again, the most overdue first.
///
/// A card is only counted once it's been seen; a card marked today isn't
/// due again today, however it went, so one sitting can't loop on itself.
pub fn due_now(all: &[Event], now_ms: i64) -> Vec<Due> {
    let mut by: BTreeMap<(String, String), Due> = BTreeMap::new();
    for e in all.iter().filter(|e| e.kind == "card") {
        let Some(right) = e.right else { continue };
        let d = by.entry((e.topic.clone(), e.q.to_lowercase())).or_insert_with(|| Due { topic: e.topic.clone(), q: e.q.clone(), a: e.a.clone(), ..Default::default() });
        d.streak = if right { d.streak + 1 } else { 0 };
        d.last = d.last.max(e.at);
        if !e.a.is_empty() {
            d.a = e.a.clone();
        }
    }
    let mut out: Vec<Due> = by
        .into_values()
        .filter_map(|mut d| {
            if d.q.trim().is_empty() || d.a.trim().is_empty() {
                return None;
            }
            let ready = d.last + wait_days(d.streak) * DAY_MS;
            d.overdue = (now_ms - ready) / DAY_MS;
            (now_ms >= ready).then_some(d)
        })
        .collect();
    // Most overdue first; then the ones you know least well.
    out.sort_by(|a, b| b.overdue.cmp(&a.overdue).then(a.streak.cmp(&b.streak)));
    out
}

/// What to say when asked what's worth revising today.
pub fn due_line(all: &[Event], now_ms: i64) -> String {
    let due = due_now(all, now_ms);
    if due.is_empty() {
        let cards = all.iter().filter(|e| e.kind == "card" && e.right.is_some()).count();
        return if cards == 0 {
            "You haven't practised any flashcards yet. Open a note and tap Flashcards, and I'll start spacing them out for you.".into()
        } else {
            "Nothing's due for review — you're up to date. Practise anyway by opening a note and tapping Quiz me.".into()
        };
    }
    let mut topics: Vec<(String, usize)> = {
        let mut by: BTreeMap<String, usize> = BTreeMap::new();
        for d in &due {
            *by.entry(if d.topic.trim().is_empty() { "your notes".to_string() } else { d.topic.clone() }).or_default() += 1;
        }
        by.into_iter().collect()
    };
    topics.sort_by(|a, b| b.1.cmp(&a.1));
    let where_from: Vec<String> = topics.iter().take(3).map(|(t, n)| format!("{t} ({n})")).collect();
    let late = due.iter().filter(|d| d.overdue > 0).count();
    format!(
        "{} card{} ready to review: {}{}. Say \u{201c}practise my cards\u{201d} and I'll go through them with you.",
        due.len(),
        if due.len() == 1 { "" } else { "s" },
        where_from.join(", "),
        if late > 0 { format!(" \u{2014} {late} overdue") } else { String::new() }
    )
}

/// "What should I revise?", "what's due for review today?"
pub fn asks_what_is_due(said: &str) -> bool {
    let s = said.to_lowercase();
    let s = s.trim().trim_end_matches(['.', '!', '?']);
    // Asking what's waiting — not any sentence with "study" in it, which
    // would swallow "help me study this chapter".
    [
        "what should i revise",
        "what should i review",
        "what should i study today",
        "what do i need to revise",
        "what do i need to review",
        "anything to revise",
        "anything to review",
        "anything due",
        "what's due",
        "whats due",
        "what is due",
        "any cards due",
        "cards due",
        "due for review",
        "due to review",
        "what to revise",
    ]
    .iter()
    .any(|p| s.contains(p))
}

#[derive(Debug, Clone, Serialize, Default)]
pub struct Week {
    pub questions: usize,
    pub cards: usize,
    pub cards_right: usize,
    pub notes: usize,
    pub lectures: usize,
    pub textbook: usize,
    /// (topic, how many things), busiest first.
    pub topics: Vec<(String, usize)>,
    /// Days (0 = 6 days ago … 6 = today) with anything studied.
    pub days: Vec<usize>,
    pub mistakes: Vec<Mistake>,
}

/// Calendar days between two moments, here (0: the same day).
fn days_between(earlier_ms: i64, later_ms: i64) -> i64 {
    let day = |ms: i64| chrono::DateTime::from_timestamp_millis(ms).map(|d| d.with_timezone(&chrono::Local).date_naive());
    match (day(earlier_ms), day(later_ms)) {
        (Some(a), Some(b)) => (b - a).num_days(),
        _ => (later_ms - earlier_ms) / 86_400_000,
    }
}

pub fn week_of(all: &[Event], now_ms: i64) -> Week {
    let from = now_ms - 7 * 86_400_000;
    let mut w = Week { days: vec![0; 7], ..Default::default() };
    let mut topics: BTreeMap<String, usize> = BTreeMap::new();
    for e in all.iter().filter(|e| e.at > from && e.at <= now_ms && days_between(e.at, now_ms) <= 6) {
        match e.kind.as_str() {
            "question" => w.questions += 1,
            "card" => {
                w.cards += 1;
                if e.right == Some(true) {
                    w.cards_right += 1;
                }
            }
            "notes" => w.notes += 1,
            "lecture" => w.lectures += 1,
            "textbook" => w.textbook += 1,
            _ => {}
        }
        if !e.topic.is_empty() {
            *topics.entry(e.topic.clone()).or_default() += 1;
        }
        let day = days_between(e.at, now_ms).clamp(0, 6) as usize;
        w.days[6 - day] += 1;
    }
    let mut t: Vec<(String, usize)> = topics.into_iter().collect();
    t.sort_by(|a, b| b.1.cmp(&a.1));
    t.truncate(8);
    w.topics = t;
    w.mistakes = mistakes(all).into_iter().take(10).collect();
    w
}

pub fn week() -> Week {
    week_of(&events(), crate::model::now_ms())
}

/// The week in words (pure, so it's tested).
pub fn say_week(w: &Week) -> String {
    let studied = w.questions + w.cards + w.notes + w.lectures + w.textbook;
    if studied == 0 {
        return "Nothing studied with me this week yet. Ask me a question with the Study log on, practise flashcards in Notes, or say “explain chapter 1 of my textbook”.".into();
    }
    let days = w.days.iter().filter(|d| **d > 0).count();
    let mut parts = Vec::new();
    if w.questions > 0 {
        parts.push(format!("{} question{}", w.questions, if w.questions == 1 { "" } else { "s" }));
    }
    if w.cards > 0 {
        parts.push(format!("{} flashcard{} ({}% right)", w.cards, if w.cards == 1 { "" } else { "s" }, w.cards_right * 100 / w.cards.max(1)));
    }
    if w.notes > 0 {
        parts.push(format!("{} set{} of notes", w.notes, if w.notes == 1 { "" } else { "s" }));
    }
    if w.lectures > 0 {
        parts.push(format!("{} lecture{}", w.lectures, if w.lectures == 1 { "" } else { "s" }));
    }
    if w.textbook > 0 {
        parts.push(format!("{} textbook explanation{}", w.textbook, if w.textbook == 1 { "" } else { "s" }));
    }
    let mut out = format!("📈 This week: {} — on {days} of the last 7 days.", parts.join(", "));
    if !w.topics.is_empty() {
        out.push_str(&format!("\nMost studied: {}.", w.topics.iter().take(4).map(|(t, _)| t.as_str()).collect::<Vec<_>>().join(", ")));
    }
    if !w.mistakes.is_empty() {
        out.push_str(&format!("\nYou keep missing {} card{} — say “quiz me on my mistakes” to practise them.", w.mistakes.len(), if w.mistakes.len() == 1 { "" } else { "s" }));
    }
    out
}

pub fn say_mistakes(list: &[Mistake]) -> String {
    if list.is_empty() {
        return "No repeated mistakes — nothing you've missed twice on your flashcards. Nice. 🎉".into();
    }
    let lines: Vec<String> = list.iter().take(10).map(|m| format!("• {} — missed {}× ({})", m.q, m.missed, m.topic)).collect();
    format!("What you keep getting wrong:\n{}\n\nSay “quiz me on my mistakes” to practise them.", lines.join("\n"))
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Ask {
    Week,
    Mistakes,
    Practise,
}

pub fn parse(said: &str) -> Option<Ask> {
    let s = format!(" {} ", said.to_lowercase().replace(['?', '!', ',', '.', '’', '\''], " ").split_whitespace().collect::<Vec<_>>().join(" "));
    if s.contains(" quiz me on my mistakes") || s.contains(" practice my mistakes") || s.contains(" practise my mistakes") || s.contains(" quiz me on what i got wrong") {
        return Some(Ask::Practise);
    }
    let asks_mistakes = s.trim_end().ends_with(" my mistakes") && [" what ", " show ", " list ", " tell me "].iter().any(|w| s.starts_with(w) || s.contains(&format!("{w}are")));
    if s.contains(" keep getting wrong") || s.contains(" i keep missing") || s.contains(" what do i get wrong") || s.contains(" my weak spots") || s.contains(" my study mistakes") || asks_mistakes {
        return Some(Ask::Mistakes);
    }
    if s.contains(" have i studied") || s.contains(" did i study") || s.contains(" my study progress") || s.contains(" study stats") || s.contains(" how much have i studied") || s.contains(" study this week") {
        return Some(Ask::Week);
    }
    None
}

/// The answer, or for Practise: a quiz request for the chat to run.
pub fn handle(ask: Ask) -> String {
    match ask {
        Ask::Week => say_week(&week()),
        Ask::Mistakes => say_mistakes(&mistakes(&events())),
        Ask::Practise => {
            let list = mistakes(&events());
            if list.is_empty() {
                return say_mistakes(&list);
            }
            practise_prompt(&list)
        }
    }
}

/// A one-at-a-time quiz on these cards (sent to the chat).
pub fn practise_prompt(list: &[Mistake]) -> String {
    let cards: Vec<String> = list.iter().take(10).map(|m| format!("Q: {}\nA: {}", m.q, m.a)).collect();
    format!("Quiz me on the flashcards I keep missing — one question at a time, wait for my answer, tell me if I'm right and explain briefly:\n\n{}", cards.join("\n\n"))
}

#[cfg(test)]
mod tests {
    fn mark(topic: &str, q: &str, days_ago: i64, right: bool, now: i64) -> Event {
        Event { at: now - days_ago * DAY_MS, kind: "card".into(), topic: topic.into(), q: q.into(), a: "an answer".into(), right: Some(right) }
    }

    #[test]
    fn cards_come_back_when_they_should() {
        let now = 1_900_000_000_000i64;
        // Missed yesterday: back today. Right once yesterday: not yet (2 days).
        let all = vec![mark("Bio", "what is a cell", 1, false, now), mark("Bio", "what is dna", 1, true, now)];
        let due = due_now(&all, now);
        assert_eq!(due.len(), 1, "{due:?}");
        assert_eq!(due[0].q, "what is a cell");

        // Four right in a row waits 16 days: not due at 10, due at 20.
        let streak: Vec<Event> = (0..4).map(|i| mark("Bio", "mitosis", 10 + (4 - i), true, now)).collect();
        assert!(due_now(&streak, now).is_empty(), "a well-known card came back too soon");
        let older: Vec<Event> = (0..4).map(|i| mark("Bio", "mitosis", 20 + (4 - i), true, now)).collect();
        assert_eq!(due_now(&older, now).len(), 1, "a card 20 days old never came back");

        // Missing it resets the wait, however well it went before.
        let mut slipped = older.clone();
        slipped.push(mark("Bio", "mitosis", 1, false, now));
        assert_eq!(due_now(&slipped, now).len(), 1);
        assert_eq!(due_now(&slipped, now)[0].streak, 0);

        // Practised today is never due again today.
        let today = vec![mark("Bio", "osmosis", 0, false, now)];
        assert!(due_now(&today, now).is_empty(), "a card practised today came straight back");

        // The most overdue goes first.
        let mix = vec![mark("Bio", "old one", 30, false, now), mark("Bio", "newer one", 2, false, now)];
        assert_eq!(due_now(&mix, now)[0].q, "old one");

        // A card with no answer can't be practised.
        let blank = vec![Event { a: String::new(), ..mark("Bio", "no answer", 5, false, now) }];
        assert!(due_now(&blank, now).is_empty());
    }

    #[test]
    fn it_says_what_is_due_in_plain_words() {
        let now = 1_900_000_000_000i64;
        assert!(due_line(&[], now).contains("haven't practised"));
        let fresh = vec![mark("Bio", "q", 0, true, now)];
        assert!(due_line(&fresh, now).contains("up to date"), "{}", due_line(&fresh, now));
        let due = vec![mark("Bio", "q1", 5, false, now), mark("Chem", "q2", 3, false, now)];
        let line = due_line(&due, now);
        assert!(line.contains("2 cards ready") && line.contains("Bio") && line.contains("overdue"), "{line}");
        // Asked in the ways people ask.
        assert!(asks_what_is_due("what should I revise today"));
        assert!(asks_what_is_due("anything due for review?"));
        assert!(asks_what_is_due("any cards due?"));
        // Ordinary studying talk isn't a question about what's waiting.
        assert!(!asks_what_is_due("revise my essay"));
        assert!(!asks_what_is_due("help me study this chapter"));
        assert!(!asks_what_is_due("study with me"));
    }

    use super::*;

    fn card(at: i64, q: &str, right: bool) -> Event {
        Event { at, kind: "card".into(), topic: "Bio".into(), q: q.into(), a: "ans".into(), right: Some(right) }
    }

    #[test]
    fn repeated_misses_until_learned() {
        let all = vec![card(1, "Mitosis?", false), card(2, "Mitosis?", false), card(3, "ATP?", false), card(4, "DNA?", false), card(5, "DNA?", false), card(6, "DNA?", true), card(7, "DNA?", true)];
        let m = mistakes(&all);
        assert_eq!(m.iter().map(|m| m.q.as_str()).collect::<Vec<_>>(), vec!["Mitosis?"], "ATP missed once; DNA learned (right twice since)");
        assert_eq!(m[0].missed, 2);
    }

    #[test]
    fn a_week_in_words() {
        let day = 86_400_000;
        let now = 100 * day;
        let mut all = vec![card(now - 1000, "Q1", true), card(now - 2000, "Q2", false)];
        all.push(Event { at: now - 3 * day, kind: "question".into(), topic: "Physics".into(), q: "why".into(), a: String::new(), right: None });
        all.push(Event { at: now - 10 * day, kind: "question".into(), topic: "Old".into(), q: "x".into(), a: String::new(), right: None });
        let w = week_of(&all, now);
        assert_eq!((w.questions, w.cards, w.cards_right), (1, 2, 1));
        assert_eq!(w.days.iter().filter(|d| **d > 0).count(), 2);
        let said = say_week(&w);
        assert!(said.contains("1 question") && said.contains("2 flashcards (50% right)") && said.contains("2 of the last 7 days"), "{said}");
    }

    #[test]
    fn hears_study_asks() {
        assert_eq!(parse("what do I keep getting wrong?"), Some(Ask::Mistakes));
        assert_eq!(parse("quiz me on my mistakes"), Some(Ask::Practise));
        assert_eq!(parse("what have I studied this week"), Some(Ask::Week));
        assert_eq!(parse("what is studying"), None);
        assert_eq!(parse("fix my mistakes in this essay"), None);
        assert_eq!(parse("what are my mistakes"), Some(Ask::Mistakes));
    }
}
