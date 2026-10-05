//! Nova Notes — study notes from whatever's on screen, kept on this PC.
//! "Take notes on this" reads the page (its own text, or the screen's words
//! when it's a PDF, a lab or a picture) and writes clean notes; teacher mode
//! adds each question it explains to the day's lesson notes. Every note can
//! become flashcards, a quiz or a summary.

use std::path::PathBuf;

use anyhow::{bail, Result};
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub text: String,
    /// Where it came from (the window's title).
    #[serde(default)]
    pub source: String,
    pub created_at: i64,
    #[serde(default)]
    pub updated_at: i64,
    /// Made on request: (question, answer).
    #[serde(default)]
    pub cards: Vec<(String, String)>,
    /// A running "lesson" note that teacher mode adds to.
    #[serde(default)]
    pub lesson: bool,
}

static LOCK: Mutex<()> = Mutex::new(());

fn path() -> PathBuf {
    crate::store::data_dir().join("notes.json")
}

fn read() -> Vec<Note> {
    std::fs::read_to_string(path()).ok().and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default()
}

fn write(all: &[Note]) -> Result<()> {
    std::fs::write(path(), serde_json::to_string_pretty(all)?)?;
    Ok(())
}

/// Newest first.
pub fn list() -> Vec<Note> {
    let _g = LOCK.lock();
    let mut all = read();
    all.sort_by_key(|n| -n.updated_at.max(n.created_at));
    all
}

pub fn delete(id: &str) -> Result<()> {
    let _g = LOCK.lock();
    let mut all = read();
    all.retain(|n| n.id != id);
    write(&all)
}

fn save(note: Note) -> Result<Note> {
    let _g = LOCK.lock();
    let mut all = read();
    all.retain(|n| n.id != note.id);
    all.push(note.clone());
    write(&all)?;
    Ok(note)
}

fn get(id: &str) -> Option<Note> {
    read().into_iter().find(|n| n.id == id)
}

/// "Week 4 Quiz – Blackboard Learn - Google Chrome" → "Week 4 Quiz – Blackboard Learn".
pub fn tidy_title(title: &str) -> String {
    let t = title.trim();
    let t = ["- Google Chrome", "- Microsoft Edge", "- Mozilla Firefox", "- Brave", "- Opera", "— Mozilla Firefox"]
        .iter()
        .fold(t.to_string(), |acc, s| acc.trim_end_matches(s).trim().to_string());
    let t: String = t.chars().take(80).collect();
    if t.is_empty() { "Notes".into() } else { t }
}

const NOTES_PROMPT: &str = "You turn what's on someone's screen into clear study notes. Write: a one-line \
summary; then the key points as short bullet lines (\"- \"); key terms with one-line meanings; and any \
question shown, with its options. Plain words, no fluff, no made-up facts — only what the text supports. \
At most about 250 words.";

/// "Take notes on this": read what's on screen and write notes about it.
pub fn from_screen() -> Result<Note> {
    let title = crate::uia::foreground_title();
    let mut text = crate::uia::document_text(12_000);
    if text.trim().len() < 80 {
        // A PDF, a lab, a picture: read the screen's own words instead.
        let frame = crate::capture::capture_all()?;
        text = crate::ocr::read_frame(&frame).unwrap_or_default();
    }
    if text.trim().len() < 20 {
        bail!("I couldn't read anything on the screen to take notes from");
    }
    let text: String = text.chars().take(12_000).collect();
    let notes = crate::chat::complete(&[
        json!({ "role": "system", "content": NOTES_PROMPT }),
        json!({ "role": "user", "content": format!("From: {title}\n\n{text}") }),
    ])?;
    if notes.trim().is_empty() {
        bail!("the AI didn't write anything — try again");
    }
    let now = crate::model::now_ms();
    save(Note {
        id: uuid::Uuid::new_v4().to_string(),
        title: tidy_title(&title),
        text: notes,
        source: title,
        created_at: now,
        updated_at: now,
        cards: Vec::new(),
        lesson: false,
    })
}

/// A note from the browser extension: the selected text kept as it is, or a
/// whole page turned into study notes.
pub fn from_text(title: &str, source: &str, text: &str, make_notes: bool) -> Result<Note> {
    let text: String = text.trim().chars().take(12_000).collect();
    if text.len() < 3 {
        bail!("there was nothing to save");
    }
    let body = if make_notes {
        let n = crate::chat::complete(&[
            json!({ "role": "system", "content": NOTES_PROMPT }),
            json!({ "role": "user", "content": format!("From: {title}\n\n{text}") }),
        ])?;
        if n.trim().is_empty() {
            bail!("the AI didn't write anything — try again");
        }
        n
    } else {
        text
    };
    let now = crate::model::now_ms();
    save(Note {
        id: uuid::Uuid::new_v4().to_string(),
        title: tidy_title(title),
        text: body,
        source: source.to_string(),
        created_at: now,
        updated_at: now,
        cards: Vec::new(),
        lesson: false,
    })
}

/// Teacher mode: add what was just explained to today's lesson notes for
/// this page (one running note per page per day).
pub fn add_to_lesson(text: &str) -> Result<Note> {
    let text = text.trim();
    if text.is_empty() {
        bail!("nothing to add");
    }
    let source = crate::uia::foreground_title();
    let title = format!("Lesson — {}", tidy_title(&source));
    let today = chrono::Local::now().date_naive();
    let now = crate::model::now_ms();
    let same_day = |ms: i64| chrono::DateTime::from_timestamp_millis(ms).is_some_and(|d| d.with_timezone(&chrono::Local).date_naive() == today);
    let existing = read().into_iter().find(|n| n.lesson && n.title == title && same_day(n.created_at));
    let note = match existing {
        Some(mut n) => {
            n.text = format!("{}\n\n{}", n.text.trim_end(), text);
            n.updated_at = now;
            n
        }
        None => Note {
            id: uuid::Uuid::new_v4().to_string(),
            title,
            text: text.to_string(),
            source,
            created_at: now,
            updated_at: now,
            cards: Vec::new(),
            lesson: true,
        },
    };
    save(note)
}

/// Make (or remake) flashcards for a note.
pub fn flashcards(id: &str) -> Result<Note> {
    let Some(mut note) = get(id) else { bail!("that note is gone") };
    let reply = crate::chat::complete(&[
        json!({ "role": "system", "content": "Make study flashcards from these notes: 6 to 10 cards, each testing one fact or idea. Reply ONLY with lines in exactly this form:\nQ: <question> || A: <short answer>" }),
        json!({ "role": "user", "content": note.text.chars().take(8000).collect::<String>() }),
    ])?;
    let cards = parse_cards(&reply);
    if cards.is_empty() {
        bail!("the AI's flashcards came out muddled — try again");
    }
    note.cards = cards;
    note.updated_at = crate::model::now_ms();
    save(note)
}

/// "Q: … || A: …" lines → (question, answer).
pub fn parse_cards(reply: &str) -> Vec<(String, String)> {
    reply
        .lines()
        .filter_map(|l| {
            let l = l.trim().trim_start_matches(['-', '*', '•', ' ']).trim();
            let l = l.split_once(". ").filter(|(n, _)| n.chars().all(|c| c.is_ascii_digit())).map(|(_, r)| r).unwrap_or(l);
            let (q, a) = l.split_once("||").or_else(|| l.split_once(" A:"))?;
            let q = q.trim().trim_start_matches("Q:").trim();
            let a = a.trim().trim_start_matches("A:").trim();
            (!q.is_empty() && !a.is_empty()).then(|| (q.to_string(), a.to_string()))
        })
        .take(12)
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_flashcards_however_they_come() {
        let reply = "Here you go:\nQ: What does a router do? || A: Forwards packets between networks\n2. Q: Layer of a switch? || A: Layer 2\n- Q: PPTP weakness Q A: Weak encryption\nnonsense line";
        let cards = parse_cards(reply);
        assert_eq!(cards[0], ("What does a router do?".into(), "Forwards packets between networks".into()));
        assert_eq!(cards[1], ("Layer of a switch?".into(), "Layer 2".into()));
        assert_eq!(cards.len(), 3);
    }

    #[test]
    fn titles_lose_the_browser_name() {
        assert_eq!(tidy_title("Week 4 Quiz – Blackboard Learn - Google Chrome"), "Week 4 Quiz – Blackboard Learn");
        assert_eq!(tidy_title(""), "Notes");
    }
}
