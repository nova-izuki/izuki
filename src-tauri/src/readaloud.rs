//! Read it to me — select text anywhere and say "read this to me", or with
//! nothing selected, "read this page / this email / this article". Long
//! reads come in parts: "keep reading" carries on where it stopped.

use parking_lot::Mutex;

/// What's left to read, for "keep reading".
static REST: Mutex<String> = Mutex::new(String::new());
const PART: usize = 1400;

pub fn is_read_request(said: &str) -> bool {
    let s = said.to_lowercase();
    let s = s.trim().trim_end_matches(['.', '!', '?']);
    let s = s.trim_start_matches("hey nova").trim_start_matches("hey izuki").trim_start_matches([',', ' ']).trim();
    [
        "read this", "read it to me", "read that to me", "read me this", "read the selected", "read what i selected",
        "read what's selected", "read this page", "read this email", "read this article", "read this out", "read it out",
        "read the page", "read the email", "read the article", "read aloud", "read out loud",
    ]
    .iter()
    .any(|p| s.starts_with(p))
}

pub fn is_keep_reading(said: &str) -> bool {
    let s = said.to_lowercase();
    ["keep reading", "continue reading", "read more", "carry on reading", "read the rest", "go on reading"].iter().any(|p| s.contains(p))
}

/// The text to read now (the selection, else the page in front).
pub fn start() -> String {
    let selected = crate::automation::selected_text().unwrap_or_default();
    let text = if selected.trim().split_whitespace().count() >= 2 {
        selected
    } else {
        crate::uia::document_text(20_000)
    };
    let text = clean(&text);
    if text.split_whitespace().count() < 2 {
        return "I couldn't find anything to read — select some text first, then ask again.".into();
    }
    next_part(text)
}

pub fn keep_going() -> String {
    let rest = std::mem::take(&mut *REST.lock());
    if rest.trim().is_empty() {
        return "That's the end.".into();
    }
    next_part(rest)
}

fn next_part(text: String) -> String {
    if text.len() <= PART {
        REST.lock().clear();
        return text;
    }
    // Stop at a sentence end near the limit.
    let mut cut = PART;
    while !text.is_char_boundary(cut) {
        cut -= 1;
    }
    let head = &text[..cut];
    let end = head.rfind(['.', '!', '?', '\n']).map(|i| i + 1).filter(|i| *i > PART / 2).unwrap_or(cut);
    *REST.lock() = text[end..].trim().to_string();
    format!("{} … (say “keep reading” for more)", text[..end].trim())
}

/// Said the way a person would read it: no links, no code-ish clutter.
fn clean(t: &str) -> String {
    let no_links: Vec<String> = t.split_whitespace().filter(|w| !w.starts_with("http://") && !w.starts_with("https://") && !w.starts_with("www.")).map(str::to_string).collect();
    no_links.join(" ").replace(" .", ".")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hears_read_requests_and_reads_in_parts() {
        assert!(is_read_request("Hey Nova, read this to me"));
        assert!(is_read_request("read this email"));
        assert!(!is_read_request("what is reading comprehension"));
        assert!(is_keep_reading("keep reading please"));
        let long = "This is a sentence. ".repeat(200);
        let first = next_part(long.clone());
        assert!(first.ends_with("(say “keep reading” for more)"));
        assert!(!REST.lock().is_empty());
        assert_eq!(clean("see https://x.com now"), "see now");
    }
}
