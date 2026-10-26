//! "Ask about this page" from the Island — like asking Gemini in Chrome,
//! without opening anything. Type a question while a web page is in front
//! and the answer types itself out in the Island. Away from the browser it
//! asks about the screen itself (a fresh look at it), and files or photos
//! added with + go along with the question.
//!
//! With the browser extension, the page is read the way the page itself is
//! (its words, title and address) and the links most related to the question
//! are read in the background too, with your own sign-ins. Without it, the
//! page's words come from Windows' accessibility view of the browser.

use serde::Serialize;
use serde_json::{json, Value};
use tauri::{AppHandle, Emitter};

pub const EVENT: &str = "izuki://page-answer";

/// One piece of the answer, as it arrives.
#[derive(Debug, Clone, Serialize)]
pub struct Piece {
    pub id: u64,
    pub text: String,
    pub done: bool,
    pub error: Option<String>,
    /// The page the answer is about (on the first piece).
    pub page: Option<String>,
}

/// A turn of the conversation about the page (for follow-ups).
#[derive(Debug, Clone, serde::Deserialize)]
pub struct Turn {
    pub role: String,
    pub content: String,
}

/// Something added with + : a photo (`data:image/…` URL), a text file's
/// words, or "screen" — a fresh look at the screen, taken when asked.
#[derive(Debug, Clone, Default, serde::Deserialize)]
pub struct Attachment {
    pub name: String,
    pub kind: String,
    #[serde(default)]
    pub data: String,
}

/// What we could read of the page in front.
struct Read {
    title: String,
    url: String,
    text: String,
    linked: String,
}

fn read_page(question: &str) -> Read {
    if let Some(page) = crate::ext::snapshot() {
        let related = crate::ext::related_links(&page, question, 2);
        let linked = crate::ext::read_links(&related);
        return Read { title: page.title, url: page.url, text: page.text, linked };
    }
    Read {
        title: crate::island::page_title(&crate::uia::foreground_title()),
        url: String::new(),
        text: crate::uia::document_text(14_000),
        linked: String::new(),
    }
}

fn cut(s: &str, n: usize) -> String {
    s.chars().take(n).collect()
}

/// A fresh look at the whole screen, small enough to send.
fn screen_picture() -> Option<String> {
    if crate::uia::screen_locked() {
        return None;
    }
    crate::capture::capture_all().ok()?.downscaled(1600).to_jpeg_data_url(70).ok()
}

const SYSTEM: &str = "You are Izuki, answering a question about what the user has open: a web page, or their screen (a screenshot is attached). Answer from it (and any linked pages or files given) when you can; if the answer isn't there, say so in a few words and answer from what you know. Lead with the answer, keep it short (a few sentences or a few bullet points with -), plain friendly words, no headings. When they ask what to do, give short numbered steps that name the exact buttons, menus and boxes on their screen — they can press \"Do it for me\" and you'll do those steps. Never ask for or repeat passwords or card numbers.";

fn backend_web_request(question: &str) -> bool {
    let q = question.to_lowercase();
    q.contains("https://") || q.contains("http://") || ["scrape", "search the web", "search online", "look up online"].iter().any(|word| q.contains(word))
}

/// Deep thinking: take the time, and show the work that matters.
const DEEP: &str = "DEEP THINKING is on: the user wants your most careful answer, not your fastest. Think it through properly before you write: read everything given closely, work the problem step by step, consider other readings and check your result. Then answer clearly — the answer first, then the reasoning that matters (short steps or bullets), and anything they should double-check. Longer is fine when it helps; no filler.";

/// The conversation for the brain: what's open (page words or a screen
/// picture), any files, the turns so far, then the question with its photos.
fn messages(read: Option<&Read>, screen: Option<&str>, files: &[Attachment], question: &str, history: &[Turn]) -> Vec<Value> {
    let mut context = match read {
        Some(read) => {
            let mut c = format!("The page the user is on: {}\n{}\n\n{}", read.title, read.url, cut(&read.text, 14_000));
            if !read.linked.trim().is_empty() {
                c.push_str("\n\n");
                c.push_str(&cut(&read.linked, 6000));
            }
            c
        }
        None => format!(
            "The user is asking about their screen. The window in front: {}. The screenshot is with their question (the small dark pill at the top centre is Izuki itself — ignore it).",
            crate::island::page_title(&crate::uia::foreground_title())
        ),
    };
    let mut room = 16_000usize;
    for f in files.iter().filter(|f| f.kind == "text" && !f.data.trim().is_empty()) {
        if room < 200 {
            break;
        }
        let words = cut(&f.data, room.min(8000));
        room = room.saturating_sub(words.chars().count());
        context.push_str(&format!("\n\nThe file \"{}\" they added:\n{words}", cut(&f.name, 80)));
    }
    let seen = if read.is_some() { "I can see the page." } else { "I can see your screen." };
    let mut msgs = vec![
        json!({ "role": "system", "content": SYSTEM }),
        json!({ "role": "user", "content": context }),
        json!({ "role": "assistant", "content": format!("{seen} What would you like to know?") }),
    ];
    for t in history.iter().rev().take(8).rev() {
        if (t.role == "user" || t.role == "assistant") && !t.content.trim().is_empty() {
            msgs.push(json!({ "role": t.role, "content": cut(&t.content, 3000) }));
        }
    }
    let pictures: Vec<&str> = screen
        .into_iter()
        .chain(files.iter().filter(|f| f.kind == "image" && f.data.starts_with("data:image/")).map(|f| f.data.as_str()))
        .take(4)
        .collect();
    if pictures.is_empty() {
        msgs.push(json!({ "role": "user", "content": cut(question, 1500) }));
    } else {
        let mut parts = vec![json!({ "type": "text", "text": cut(question, 1500) })];
        parts.extend(pictures.iter().map(|url| json!({ "type": "image_url", "image_url": { "url": url } })));
        msgs.push(json!({ "role": "user", "content": parts }));
    }
    msgs
}

/// Answer `question` about the page in front — or, with `on_screen` (no
/// browser in front) or a page that can't be read, about the screen — and
/// send the answer to the Island piece by piece. Runs on the calling thread.
pub fn ask(app: &AppHandle, id: u64, question: &str, history: &[Turn], files: &[Attachment], on_screen: bool, deep: bool) {
    let send = |p: Piece| {
        let _ = app.emit(EVENT, p);
    };
    let read = if backend_web_request(question) {
        Some(Read { title: "Requested web research".into(), url: String::new(), text: "No requested website has been fetched yet. Use the backend SEARCH and READ tools to get real page content. This request does not require a screenshot or an open browser.".into(), linked: String::new() })
    } else if on_screen { None } else { Some(read_page(question)).filter(|r| !r.text.trim().is_empty()) };
    // Away from the browser, a page that couldn't be read, or "+ Screenshot":
    // look at the screen itself.
    let wants_shot = read.is_none() || files.iter().any(|f| f.kind == "screen");
    let shot = if wants_shot { screen_picture() } else { None };
    if read.is_none() && shot.is_none() {
        let hint = if crate::uia::screen_locked() { "Your PC is locked — unlock it and ask again." } else { "I couldn't see your screen just now — ask again in a moment." };
        return send(Piece { id, text: String::new(), done: true, error: Some(hint.into()), page: None });
    }
    let title = read.as_ref().map(|r| r.title.clone()).unwrap_or_else(|| "Your screen".into());
    send(Piece { id, text: String::new(), done: false, error: None, page: Some(title) });
    let mut msgs = messages(read.as_ref(), shot.as_deref(), files, question, history);
    if deep {
        if let Some(system) = msgs.first_mut() {
            system["content"] = serde_json::Value::String(format!("{SYSTEM}\n\n{DEEP}"));
        }
    }
    let on_piece = |t: &str| send(Piece { id, text: t.to_string(), done: false, error: None, page: None });
    // Only an explicit web request gets the search/read tools. A question about
    // the page or screen already has its words and picture, and the tool loop
    // only made it slower (and tempted the model to go looking elsewhere).
    let result = if backend_web_request(question) {
        crate::chat::complete_with_web(&msgs, id, deep, &on_piece)
    } else if deep {
        crate::chat::complete_streaming_deep(&msgs, id, &on_piece)
    } else {
        crate::chat::complete_streaming(&msgs, id, &on_piece)
    };
    match result {
        Ok(_) => send(Piece { id, text: String::new(), done: true, error: None, page: None }),
        Err(e) => send(Piece { id, text: String::new(), done: true, error: Some(crate::brain::plain_error(&e.to_string())), page: None }),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn explicit_web_reads_do_not_need_a_browser_or_screen_capture() {
        assert!(backend_web_request("extract the table from https://example.com"));
        assert!(backend_web_request("scrape these public sites"));
        assert!(!backend_web_request("explain this button on my screen"));
    }

    #[test]
    fn question_goes_last_with_the_page_first() {
        let read = Read { title: "Syllabus".into(), url: "https://x.edu/s".into(), text: "Essay due Friday.".into(), linked: String::new() };
        let history = vec![Turn { role: "user".into(), content: "hi".into() }, Turn { role: "assistant".into(), content: "hello".into() }];
        let m = messages(Some(&read), None, &[], "when is the essay due?", &history);
        assert!(m[1]["content"].as_str().unwrap().contains("Essay due Friday."));
        assert_eq!(m.last().unwrap()["content"], "when is the essay due?");
        assert_eq!(m.len(), 6);
    }

    #[test]
    fn files_and_photos_go_with_the_question() {
        let read = Read { title: "Doc".into(), url: String::new(), text: "Hello".into(), linked: String::new() };
        let files = vec![
            Attachment { name: "notes.txt".into(), kind: "text".into(), data: "Chapter 3 is on the test.".into() },
            Attachment { name: "photo.jpg".into(), kind: "image".into(), data: "data:image/jpeg;base64,AAAA".into() },
        ];
        let m = messages(Some(&read), None, &files, "what's on the test?", &[]);
        assert!(m[1]["content"].as_str().unwrap().contains("Chapter 3 is on the test."));
        let last = &m.last().unwrap()["content"];
        assert_eq!(last[0]["text"], "what's on the test?");
        assert_eq!(last[1]["image_url"]["url"], "data:image/jpeg;base64,AAAA");
    }

    #[test]
    fn the_screen_goes_first_when_theres_no_page() {
        let m = messages(None, Some("data:image/jpeg;base64,SCREEN"), &[], "what do I do here?", &[]);
        assert!(m[1]["content"].as_str().unwrap().contains("their screen"));
        assert_eq!(m.last().unwrap()["content"][1]["image_url"]["url"], "data:image/jpeg;base64,SCREEN");
    }
}
