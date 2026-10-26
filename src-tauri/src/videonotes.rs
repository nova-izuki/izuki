//! Study notes from a recorded lecture on YouTube.
//!
//! Izuki can't watch a video. But almost every lecture upload carries
//! captions — either the lecturer's own or YouTube's — and those are the
//! words that matter. So: take the video's own transcript, keep the [mm:ss]
//! on every line, and hand it to the same writer Lecture Mode uses, so a
//! recorded lecture ends up as the same structured, checkable notes as one
//! sat through in person.
//!
//! Nothing is guessed. No captions means no notes, and it says so rather
//! than writing a plausible lecture from the title.

use anyhow::{bail, Result};

/// The video id in any of the forms people paste.
pub fn video_id(said: &str) -> Option<String> {
    // Take the id and stop at whatever follows it — "?t=42", "&list=PL1", a
    // space. Trimming the ends instead left the rest of the link attached.
    let ok = |rest: &str| {
        let id: String = rest.chars().take_while(|c| c.is_ascii_alphanumeric() || *c == '-' || *c == '_').collect();
        (id.len() == 11).then_some(id)
    };
    for marker in ["youtube.com/watch?v=", "youtube.com/live/", "youtube.com/embed/", "youtube.com/shorts/", "youtu.be/", "m.youtube.com/watch?v="] {
        if let Some(at) = said.find(marker) {
            if let Some(id) = ok(&said[at + marker.len()..]) {
                return Some(id);
            }
        }
    }
    // "&v=" anywhere in a longer link.
    if let Some(at) = said.find("v=") {
        if let Some(id) = ok(&said[at + 2..]) {
            return Some(id);
        }
    }
    None
}

/// What the lecture is called, from the watch page.
fn title_of(page: &str) -> String {
    for (open, close) in [("<meta name=\"title\" content=\"", "\""), ("<title>", "</title>")] {
        if let Some(at) = page.find(open) {
            let rest = &page[at + open.len()..];
            if let Some(end) = rest.find(close) {
                let raw = rest[..end].trim();
                let clean = unescape(raw).trim_end_matches(" - YouTube").trim().to_string();
                if !clean.is_empty() {
                    return clean;
                }
            }
        }
    }
    "Lecture".into()
}

/// The caption track to read: the lecturer's own English before an
/// automatic one, and something rather than nothing.
fn caption_url(page: &str) -> Option<String> {
    let at = page.find("\"captionTracks\":")?;
    let rest = &page[at..];
    let end = rest.find(']')?;
    let block = &rest[..end];
    let mut best: Option<(u8, String)> = None;
    for piece in block.split("{\"baseUrl\":\"").skip(1) {
        let Some(stop) = piece.find('"') else { continue };
        let url = piece[..stop].replace("\\u0026", "&").replace("\\/", "/");
        let english = piece.contains("\"languageCode\":\"en");
        let automatic = piece.contains("\"kind\":\"asr\"");
        // Lower is better: the lecturer's English, then auto English, then
        // the lecturer's other language, then anything.
        let rank = match (english, automatic) {
            (true, false) => 0,
            (true, true) => 1,
            (false, false) => 2,
            (false, true) => 3,
        };
        if best.as_ref().is_none_or(|(b, _)| rank < *b) {
            best = Some((rank, url));
        }
    }
    best.map(|(_, url)| url)
}

fn unescape(s: &str) -> String {
    s.replace("&amp;", "&").replace("&#39;", "'").replace("&quot;", "\"").replace("&apos;", "'").replace("&lt;", "<").replace("&gt;", ">").replace("&nbsp;", " ")
}

fn stamp(secs: f64) -> String {
    let s = secs.max(0.0) as u64;
    format!("[{:02}:{:02}]", s / 60, s % 60)
}

/// YouTube's caption XML into timed lines, the shape Lecture Mode writes from.
fn lines_from(xml: &str) -> String {
    let mut out = String::new();
    for piece in xml.split("<text ").skip(1) {
        let start = piece
            .find("start=\"")
            .map(|at| &piece[at + 7..])
            .and_then(|r| r.find('"').map(|e| &r[..e]))
            .and_then(|v| v.parse::<f64>().ok())
            .unwrap_or(0.0);
        let Some(body_at) = piece.find('>') else { continue };
        let body = &piece[body_at + 1..];
        let Some(end) = body.find("</text>") else { continue };
        // Captions arrive escaped twice: once as XML, once as HTML.
        let words = unescape(&unescape(&body[..end])).replace(['\n', '\r'], " ");
        let words = words.split_whitespace().collect::<Vec<_>>().join(" ");
        if words.is_empty() {
            continue;
        }
        out.push_str(&format!("{} {}\n", stamp(start), words));
    }
    out
}

/// The lecture's title and its timed transcript.
pub fn transcript(id: &str) -> Result<(String, String)> {
    let (_, page) = crate::web::read_page_raw(&format!("https://www.youtube.com/watch?v={id}"))?;
    let title = title_of(&page);
    let Some(url) = caption_url(&page) else {
        bail!("That video has no captions, so there are no words for me to work from. If you can turn on subtitles while it plays, use Lecture Mode in Notes instead and I'll write it down as it goes.");
    };
    let (_, xml) = crate::web::read_page_raw(&url)?;
    let lines = lines_from(&xml);
    if lines.trim().is_empty() {
        bail!("I reached the captions but they came back empty. Try again in a moment.");
    }
    Ok((title, lines))
}

/// "Take notes on this lecture <link>": the whole job, as one reply.
pub fn notes_from(said: &str) -> Result<String> {
    let Some(id) = video_id(said) else {
        bail!("Paste the video's link and I'll take notes from it.");
    };
    let (title, lines) = transcript(&id)?;
    let minutes = lines.lines().count() / 12;
    eprintln!("[video] {title}: {} caption lines", lines.lines().count());
    let notes = crate::lecture::write_notes(&title, &lines)?;
    let body = format!("{notes}\n\n## Transcript\nFrom the video's own captions, so every line can be checked.\n\n{lines}");
    let note = crate::notes::from_text(&format!("Lecture — {}", crate::notes::tidy_title(&title)), &format!("https://www.youtube.com/watch?v={id}"), &body, false)?;
    Ok(format!(
        "Done — “{}” is in your Notes{}. I worked from the video's own captions, and the whole transcript is kept under the notes so you can check anything against what was said.",
        note.title,
        if minutes > 0 { format!(" (about {minutes} minutes of talking)") } else { String::new() }
    ))
}

/// "Take notes on this lecture", "write notes from this video <link>".
pub fn parse(said: &str) -> Option<String> {
    let s = said.to_lowercase();
    if video_id(said).is_none() {
        return None;
    }
    let wants_notes = ["take notes", "make notes", "write notes", "notes from", "notes on", "summarise", "summarize", "study this", "lecture"]
        .iter()
        .any(|w| s.contains(w));
    wants_notes.then(|| said.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn finds_the_video_in_any_link() {
        assert_eq!(video_id("https://www.youtube.com/watch?v=dQw4w9WgXcQ").as_deref(), Some("dQw4w9WgXcQ"));
        assert_eq!(video_id("take notes on https://youtu.be/dQw4w9WgXcQ?t=42 please").as_deref(), Some("dQw4w9WgXcQ"));
        assert_eq!(video_id("https://m.youtube.com/watch?v=dQw4w9WgXcQ&list=PL1").as_deref(), Some("dQw4w9WgXcQ"));
        assert_eq!(video_id("https://www.youtube.com/live/dQw4w9WgXcQ").as_deref(), Some("dQw4w9WgXcQ"));
        assert!(video_id("https://example.com/watch?v=short").is_none());
        assert!(video_id("no link here at all").is_none());
    }

    #[test]
    fn only_a_request_for_notes_counts() {
        assert!(parse("take notes on https://youtu.be/dQw4w9WgXcQ").is_some());
        assert!(parse("write notes from this lecture https://youtu.be/dQw4w9WgXcQ").is_some());
        // A link with no ask, and an ask with no link.
        assert!(parse("https://youtu.be/dQw4w9WgXcQ").is_none());
        assert!(parse("take notes on this").is_none());
    }

    #[test]
    fn captions_become_timed_lines() {
        let xml = r#"<transcript><text start="0.5" dur="3">Welcome to &amp;quot;Chapter 5&amp;quot;</text><text start="63.２" dur="2">bad number</text><text start="65" dur="2">A botnet is a network
of infected devices</text><text start="70" dur="1">   </text></transcript>"#;
        let out = lines_from(xml);
        // Double-escaped captions come back as real punctuation.
        assert!(out.contains("[00:00] Welcome to \"Chapter 5\""), "{out}");
        // Newlines inside a caption are folded into one line.
        assert!(out.contains("[01:05] A botnet is a network of infected devices"), "{out}");
        // An unreadable start time is kept at 0 rather than dropping the words.
        assert!(out.contains("bad number"), "{out}");
        // Nothing is written for a caption with no words.
        assert_eq!(out.lines().count(), 3, "{out}");
    }

    #[test]
    fn the_lecturers_own_english_captions_win() {
        let page = r#"xx"captionTracks":[{"baseUrl":"https://a/auto?x=1&y=2","kind":"asr","languageCode":"en"},{"baseUrl":"https://a/real","languageCode":"en"},{"baseUrl":"https://a/fr","languageCode":"fr"}]yy"#;
        assert_eq!(caption_url(page).as_deref(), Some("https://a/real"));
        // Only an automatic one: still better than nothing.
        let auto = r#""captionTracks":[{"baseUrl":"https://a/auto?x=1&y=2","kind":"asr","languageCode":"en"}]"#;
        assert_eq!(caption_url(auto).as_deref(), Some("https://a/auto?x=1&y=2"));
        assert!(caption_url("a page with no captions at all").is_none());
    }

    #[test]
    fn the_title_is_read_from_the_page() {
        assert_eq!(title_of(r#"<meta name="title" content="Week 3 &amp; 4: Malware">"#), "Week 3 & 4: Malware");
        assert_eq!(title_of("<title>Lecture 2 - YouTube</title>"), "Lecture 2");
        assert_eq!(title_of("nothing"), "Lecture");
    }
}
