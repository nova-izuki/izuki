//! Smart clipboard — copy something and the Island offers the right thing to
//! do with it: a sentence in another language → Translate; a link → Sum up
//! the page; an address → Directions; an email address → Write to them;
//! code → Explain it; an error → Fix it; a long text → Sum it up; a short
//! one → Remind me later. Nothing leaves the PC unless one is tapped.

use std::time::{Duration, Instant};

use parking_lot::Mutex;
use serde::Serialize;

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Idea {
    pub label: String,
    pub ask: String,
    pub icon: &'static str,
    pub strong: bool,
}

/// What was last on the clipboard and when it changed.
static LAST: Mutex<Option<(String, Instant)>> = Mutex::new(None);
/// Offered for this long after a copy.
const FRESH: Duration = Duration::from_secs(90);

/// Ideas for something copied in the last minute and a half (none otherwise).
pub fn ideas() -> Vec<Idea> {
    let Ok(now) = crate::automation::read_clipboard() else { return Vec::new() };
    let now = now.trim().to_string();
    let mut last = LAST.lock();
    match last.as_ref() {
        Some((t, _)) if *t == now => {}
        // The first look only learns what's there — not something copied just now.
        None => {
            *last = Some((now, Instant::now() - FRESH));
            return Vec::new();
        }
        _ => *last = Some((now.clone(), Instant::now())),
    }
    let Some((text, at)) = last.clone() else { return Vec::new() };
    if at.elapsed() > FRESH {
        return Vec::new();
    }
    for_text(&text)
}

/// The ideas for a piece of copied text.
pub fn for_text(text: &str) -> Vec<Idea> {
    let t = text.trim();
    if t.is_empty() || t.len() > 20_000 || looks_secret(t) {
        return Vec::new();
    }
    let short: String = t.chars().take(1500).collect();
    let one_line = !t.contains('\n');
    let idea = |label: &str, icon: &'static str, ask: String| Idea { label: label.to_string(), ask, icon, strong: false };
    let mut out = Vec::new();
    if one_line && (t.starts_with("http://") || t.starts_with("https://")) && !t.contains(' ') {
        out.push(idea("Sum up the link you copied", "🔗", format!("Read this page and sum it up for me in a few lines: {t}")));
        return out;
    }
    if one_line && t.contains('@') && !t.contains(' ') && t.split('@').nth(1).is_some_and(|d| d.contains('.')) {
        out.push(idea("Write an email to them", "✉️", format!("Help me write an email to {t} — ask me what it's about.")));
        return out;
    }
    if looks_foreign(t) {
        out.push(idea("Translate what you copied", "🌍", format!("Translate this into English and tell me what it means:\n{short}")));
    }
    let lower = t.to_lowercase();
    if ["error", "exception", "failed", "traceback", "not recognized", "cannot find", "denied"].iter().any(|w| lower.contains(w)) {
        out.push(idea("Fix this error", "🛠️", format!("I copied this error — what does it mean and how do I fix it?\n{short}")));
    } else if looks_like_code(t) {
        out.push(idea("Explain this code", "💻", format!("Explain this code in plain words:\n{short}")));
    }
    if one_line && looks_like_address(t) {
        out.push(idea("Directions there", "🗺️", format!("Open directions to {t} in Google Maps.")));
    }
    if t.split_whitespace().count() > 60 {
        out.push(idea("Sum up what you copied", "📝", format!("Sum this up for me in a few short lines:\n{short}")));
    } else if one_line && t.len() <= 80 && out.is_empty() && t.split_whitespace().count() >= 2 {
        out.push(idea("Remind me later", "🗒️", format!("Remind me later: {t}")));
    }
    out.truncate(2);
    out
}

/// Passwords, keys and codes never become suggestions.
fn looks_secret(t: &str) -> bool {
    let one_word = !t.contains(char::is_whitespace);
    let mixed = t.chars().any(|c| c.is_ascii_digit()) && t.chars().any(|c| c.is_ascii_alphabetic());
    (one_word && mixed && (8..=128).contains(&t.len()) && !t.contains("://") && !t.contains('@'))
        || t.chars().all(|c| c.is_ascii_digit()) && (4..=8).contains(&t.len())
}

fn looks_foreign(t: &str) -> bool {
    let letters: Vec<char> = t.chars().filter(|c| c.is_alphabetic()).collect();
    if letters.len() < 8 {
        return false;
    }
    let non_ascii = letters.iter().filter(|c| !c.is_ascii()).count();
    if non_ascii * 3 > letters.len() {
        return true; // mostly another script (Arabic, Chinese, Cyrillic…)
    }
    let words: Vec<String> = t.to_lowercase().split(|c: char| !c.is_alphabetic()).filter(|w| !w.is_empty()).map(str::to_string).collect();
    const FOREIGN: &[&str] = &[
        "el", "la", "los", "las", "que", "es", "por", "para", "del", "con", "está", "dónde", "qué", "cómo", "y", "de", "en",
        "est", "les", "des", "une", "avec", "pour", "je", "ne", "pas", "et", "le", "dans", "sur", "der", "die", "und", "das",
        "ich", "sie", "wir",
        "nicht", "ist", "não", "uma", "com", "você", "che", "della", "sono", "ẹ", "ni", "kí", "ọ", "anyị", "ndi",
    ];
    let hits = words.iter().filter(|w| FOREIGN.contains(&w.as_str())).count();
    words.len() >= 4 && hits >= 3 && hits * 3 >= words.len()
}

fn looks_like_code(t: &str) -> bool {
    let signs = [";", "{", "}", "=>", "fn ", "def ", "function ", "const ", "let ", "import ", "return ", "</", "()", "#include", "public "];
    signs.iter().filter(|s| t.contains(**s)).count() >= 2
}

fn looks_like_address(t: &str) -> bool {
    let l = t.to_lowercase();
    let has_number = l.split_whitespace().next().is_some_and(|w| w.chars().any(|c| c.is_ascii_digit()));
    let street = [" street", " st", " road", " rd", " avenue", " ave", " lane", " ln", " drive", " dr", " boulevard", " blvd", " close", " way", " crescent"]
        .iter()
        .any(|s| l.contains(&format!("{s} ")) || l.ends_with(s) || l.contains(&format!("{s},")));
    has_number && street && t.len() < 120
}

#[cfg(test)]
mod tests {
    use super::*;

    fn labels(t: &str) -> Vec<String> {
        for_text(t).into_iter().map(|i| i.label).collect()
    }

    #[test]
    fn offers_the_right_thing_for_what_was_copied() {
        assert_eq!(labels("https://example.com/article/123"), vec!["Sum up the link you copied"]);
        assert_eq!(labels("sam@example.com"), vec!["Write an email to them"]);
        assert_eq!(labels("¿Dónde está la biblioteca? Necesito estudiar para el examen de mañana.")[0], "Translate what you copied");
        assert_eq!(labels("Je ne sais pas pourquoi les enfants sont avec des amis pour une heure")[0], "Translate what you copied");
        assert_eq!(labels("TypeError: Cannot read properties of undefined (reading 'map')")[0], "Fix this error");
        assert_eq!(labels("const x = items.map((i) => i.id); return x;")[0], "Explain this code");
        assert_eq!(labels("221 Baker Street, London"), vec!["Directions there"]);
        assert_eq!(labels("buy Sensodyne toothpaste"), vec!["Remind me later"]);
    }

    #[test]
    fn never_offers_anything_for_secrets() {
        assert!(labels("hunter2Secret99").is_empty());
        assert!(labels("sk-or-v1-abc123def456").is_empty());
        assert!(labels("482915").is_empty());
        assert!(!labels("La La Land is a great movie").contains(&"Translate what you copied".to_string()));
    }
}
