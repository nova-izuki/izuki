//! "Ask about this page" from the Island — like asking Gemini in Chrome,
//! without opening anything. Type a question while a web page is in front
//! and the answer types itself out in the Island.
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

fn messages(read: &Read, question: &str, history: &[Turn]) -> Vec<Value> {
    let mut context = format!("The page the user is on: {}\n{}\n\n{}", read.title, read.url, cut(&read.text, 14_000));
    if !read.linked.trim().is_empty() {
        context.push_str("\n\n");
        context.push_str(&cut(&read.linked, 6000));
    }
    let mut msgs = vec![
        json!({ "role": "system", "content": "You are Izuki, answering a question about the web page the user has open. Answer from the page (and any linked pages read for you) when you can; if the answer isn't there, say so in a few words and answer from what you know. Lead with the answer, keep it short (a few sentences or a few bullet points with -), plain friendly words, no headings. Never ask for or repeat passwords or card numbers." }),
        json!({ "role": "user", "content": context }),
        json!({ "role": "assistant", "content": "I can see the page. What would you like to know?" }),
    ];
    for t in history.iter().rev().take(8).rev() {
        if (t.role == "user" || t.role == "assistant") && !t.content.trim().is_empty() {
            msgs.push(json!({ "role": t.role, "content": cut(&t.content, 3000) }));
        }
    }
    msgs.push(json!({ "role": "user", "content": cut(question, 1500) }));
    msgs
}

/// Answer `question` about the page in front, sending the answer to the
/// Island piece by piece. Runs on the calling thread.
pub fn ask(app: &AppHandle, id: u64, question: &str, history: &[Turn]) {
    let send = |p: Piece| {
        let _ = app.emit(EVENT, p);
    };
    let read = read_page(question);
    if read.text.trim().is_empty() {
        let hint = if crate::ext::connected() {
            "I couldn't read that page. Click into the page once, then ask again."
        } else {
            "I couldn't read that page. Bring the browser to the front and ask again — or add the Izuki browser extension (Settings → Browser) so I can read any page."
        };
        return send(Piece { id, text: String::new(), done: true, error: Some(hint.into()), page: Some(read.title) });
    }
    send(Piece { id, text: String::new(), done: false, error: None, page: Some(read.title.clone()) });
    let msgs = messages(&read, question, history);
    let result = crate::chat::complete_streaming(&msgs, id, &|t: &str| {
        send(Piece { id, text: t.to_string(), done: false, error: None, page: None });
    });
    match result {
        Ok(_) => send(Piece { id, text: String::new(), done: true, error: None, page: None }),
        Err(e) => send(Piece { id, text: String::new(), done: true, error: Some(format!("My AI brain didn't answer: {e}")), page: None }),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn question_goes_last_with_the_page_first() {
        let read = Read { title: "Syllabus".into(), url: "https://x.edu/s".into(), text: "Essay due Friday.".into(), linked: String::new() };
        let history = vec![Turn { role: "user".into(), content: "hi".into() }, Turn { role: "assistant".into(), content: "hello".into() }];
        let m = messages(&read, "when is the essay due?", &history);
        assert!(m[1]["content"].as_str().unwrap().contains("Essay due Friday."));
        assert_eq!(m.last().unwrap()["content"], "when is the essay due?");
        assert_eq!(m.len(), 6);
    }
}
