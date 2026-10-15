//! Deep research, Perplexity/Comet style: Izuki plans several searches,
//! reads the best pages (in the background — no browser window), looks for
//! what's still missing and searches again, then writes a long answer with
//! numbered citations and its sources. The Chat tab shows each search and
//! each page live (the "computer with an eye" while it browses).
//!
//! Only public web pages are read (web.rs); nothing is signed into, bought,
//! posted or submitted.

use std::collections::HashSet;
use std::sync::Mutex;

use serde::Serialize;
use serde_json::json;
use tauri::{AppHandle, Emitter};

pub const EVENT: &str = "izuki://research";

/// Searches in the first round, and at most in the follow-up round.
const FIRST_SEARCHES: usize = 5;
const MORE_SEARCHES: usize = 3;
/// Pages read in each round (and in all).
const FIRST_PAGES: usize = 8;
const MORE_PAGES: usize = 5;
/// How much of each page the writer sees.
const PAGE_CHARS: usize = 3500;
/// Pages from one site at most (so one site can't be the whole story).
const PER_SITE: usize = 2;

#[derive(Debug, Clone, Serialize)]
pub struct Source {
    pub n: usize,
    pub title: String,
    pub url: String,
    pub site: String,
}

/// One update for the Chat tab.
#[derive(Debug, Clone, Serialize, Default)]
pub struct Update {
    pub id: u64,
    /// "plan", "search", "read", "skip", "think", "write", "text", "done", "error"
    pub kind: &'static str,
    pub text: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub site: Option<String>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub sources: Vec<Source>,
}

static CANCELLED: Mutex<Vec<u64>> = Mutex::new(Vec::new());

pub fn cancel(id: u64) {
    let mut c = CANCELLED.lock().unwrap_or_else(|e| e.into_inner());
    c.push(id);
    if c.len() > 32 {
        c.remove(0);
    }
}

fn cancelled(id: u64) -> bool {
    CANCELLED.lock().unwrap_or_else(|e| e.into_inner()).contains(&id)
}

/// "Research …", "deep research on …", "do some deep research about …":
/// the question, or None.
pub fn asks(said: &str) -> Option<String> {
    let t = said.trim();
    for lead in [
        "do a deep research on ", "do a deep research about ", "do deep research on ", "do deep research about ", "do some deep research on ",
        "do some deep research about ", "do some research on ", "do some research about ", "deep research on ", "deep research about ", "deep research: ",
        "deep research ", "deep dive into ", "do a deep dive on ", "do a deep dive into ", "research this: ", "research: ", "research ",
    ] {
        // Compared on the original text (lower-casing can change its length).
        if t.get(..lead.len()).is_some_and(|p| p.eq_ignore_ascii_case(lead)) {
            let q = t[lead.len()..].trim().trim_end_matches(['.', '!']).trim();
            // "research" alone, or "research it", isn't a question.
            if q.split_whitespace().count() >= 2 {
                return Some(q.to_string());
            }
        }
    }
    None
}

/// A result's site — Google's results (through Gemini) are redirect links,
/// named by their site.
fn hit_site(h: &crate::web::Hit) -> String {
    if h.url.contains("grounding-api-redirect") || h.url.contains("vertexaisearch.cloud.google.com") {
        h.title.trim().trim_start_matches("www.").to_lowercase()
    } else {
        site_of(&h.url)
    }
}

fn site_of(url: &str) -> String {
    url.split("://").nth(1).unwrap_or(url).split('/').next().unwrap_or("").trim_start_matches("www.").to_string()
}

/// Search lines from the model's answer: one per line, numbering and quotes dropped.
fn query_lines(text: &str, max: usize) -> Vec<String> {
    let mut seen = HashSet::new();
    text.lines()
        .map(|l| l.trim().trim_start_matches(|c: char| c.is_ascii_digit() || matches!(c, '.' | ')' | '-' | '*' | '•')).trim().trim_matches('"').trim())
        .filter(|l| l.len() > 3 && l.len() < 160 && !l.ends_with(':') && !l.to_lowercase().starts_with("here"))
        // A search engine wants words, not a sentence.
        .map(|l| l.trim_end_matches('?').split_whitespace().take(10).collect::<Vec<_>>().join(" "))
        .filter(|l| seen.insert(l.to_lowercase()))
        .take(max)
        .collect()
}

const PLAN_PROMPT: &str = "You plan web research. Given a question, write 4 or 5 short web searches (3 to 8 words each) that together answer it well: the key facts, different angles, recent news when it matters, and one for an opposing view or hard data. Every search must stay on the exact question and keep its key words — never drift to a related topic. One search per line, nothing else — no numbering, no quotes, no commentary.";

const GAPS_PROMPT: &str = "You check web research. Given a question and notes from the pages read so far, write up to 3 more short web searches (3 to 8 words each, keeping the question's key words) for what is still missing or uncertain. One per line, nothing else. If nothing important is missing, write only: NONE";

const WRITE_PROMPT: &str = "You are Izuki, writing a deep research answer from web pages you just read.
- Start with a 2–3 sentence direct answer.
- Then sections with short ## headings: the details, numbers, dates, differing views, and what's uncertain.
- Cite every fact with the source's number in square brackets, like [2] or [1][4]. Only use the numbered sources given; never invent a source, a number or a quote.
- If the sources disagree, say so. If they don't answer part of the question, say that plainly.
- End with a short '## Bottom line'. Don't write a sources list — it's added for you.
- Plain, friendly English. Markdown is fine.";

struct Page {
    title: String,
    url: String,
    text: String,
}

pub fn start(app: AppHandle, id: u64, question: String, history: Vec<crate::chat::Turn>) {
    std::thread::spawn(move || {
        let send = |u: Update| {
            let _ = app.emit(EVENT, Update { id, ..u });
        };
        if let Err(e) = run(id, &question, &history, &send) {
            send(Update { kind: "error", text: e.to_string(), ..Default::default() });
        }
    });
}

fn run(id: u64, question: &str, history: &[crate::chat::Turn], send: &dyn Fn(Update)) -> anyhow::Result<()> {
    let stop = || -> anyhow::Result<()> {
        if cancelled(id) {
            anyhow::bail!("Stopped.");
        }
        Ok(())
    };
    // What the chat was about, so "research that" style follow-ups make sense.
    let context: String = history.iter().rev().skip(1).take(4).rev().map(|t| format!("{}: {}\n", t.role, t.content.chars().take(400).collect::<String>())).collect();

    send(Update { kind: "plan", text: "Planning the searches…".into(), ..Default::default() });
    let plan = crate::chat::complete(&[
        json!({ "role": "system", "content": PLAN_PROMPT }),
        json!({ "role": "user", "content": format!("{}Question: {question}\nToday is {}.", if context.is_empty() { String::new() } else { format!("Conversation so far:\n{context}\n") }, chrono::Local::now().format("%A %-d %B %Y")) }),
    ])
    .unwrap_or_default();
    // The question itself always goes first, so a planner that drifts
    // can't lose it.
    let queries = query_lines(&format!("{question}\n{plan}"), FIRST_SEARCHES + 1);
    // An encyclopedia view of it too (Wikipedia always answers).
    let wiki_query = query_lines(question, 1).pop().unwrap_or_else(|| question.to_string());
    stop()?;

    let mut pages: Vec<Page> = Vec::new();
    let mut seen_urls = HashSet::new();
    let mut per_site: std::collections::HashMap<String, usize> = Default::default();
    gather(id, &queries, FIRST_PAGES, &mut pages, &mut seen_urls, &mut per_site, send)?;
    gather_wiki(id, &wiki_query, &mut pages, &mut seen_urls, send);

    // Round two: what's still missing?
    if !pages.is_empty() {
        send(Update { kind: "think", text: "Checking what's still missing…".into(), ..Default::default() });
        let notes: String = pages.iter().map(|p| format!("- {}: {}\n", p.title, p.text.chars().take(600).collect::<String>().replace('\n', " "))).collect();
        let gaps = crate::chat::complete(&[
            json!({ "role": "system", "content": GAPS_PROMPT }),
            json!({ "role": "user", "content": format!("Question: {question}\n\nNotes so far:\n{notes}") }),
        ])
        .unwrap_or_default();
        stop()?;
        if !gaps.trim().eq_ignore_ascii_case("none") && !gaps.to_uppercase().starts_with("NONE") {
            let more: Vec<String> = query_lines(&gaps, MORE_SEARCHES).into_iter().filter(|q| !queries.iter().any(|d| d.eq_ignore_ascii_case(q))).collect();
            if !more.is_empty() {
                gather(id, &more, MORE_PAGES, &mut pages, &mut seen_urls, &mut per_site, send)?;
            }
        }
    }
    if pages.is_empty() {
        anyhow::bail!("I couldn't read any web pages for that — the web search may be blocked or offline. Try again in a moment.");
    }

    let sources: Vec<Source> = pages.iter().enumerate().map(|(i, p)| Source { n: i + 1, title: p.title.clone(), url: p.url.clone(), site: site_of(&p.url) }).collect();
    send(Update { kind: "write", text: format!("Writing it up from {} sources…", sources.len()), sources: sources.clone(), ..Default::default() });
    let material: String = pages.iter().enumerate().map(|(i, p)| format!("[{}] {} — {}\n{}\n\n", i + 1, p.title, p.url, p.text)).collect();
    if pages.len() < 3 {
        // Thin research says so up front, instead of posing as deep.
        let note = format!(
            "⚠️ The web searches were limited just now (free search engines slow down after many searches), so this is from only {} source{}. Ask again in a few minutes for a fuller answer.\n\n",
            pages.len(),
            if pages.len() == 1 { "" } else { "s" }
        );
        send(Update { kind: "text", text: note, ..Default::default() });
    }
    let messages = [
        json!({ "role": "system", "content": WRITE_PROMPT }),
        json!({ "role": "user", "content": format!("Question: {question}\nToday is {}.\n\nSources:\n\n{material}", chrono::Local::now().format("%A %-d %B %Y")) }),
    ];
    let answer = crate::chat::complete_streaming_deep(&messages, id, &|t| {
        if !cancelled(id) {
            send(Update { kind: "text", text: t.to_string(), ..Default::default() });
        }
    })?;
    stop()?;
    if answer.trim().is_empty() {
        anyhow::bail!("The AI didn't write the answer — try again.");
    }
    // Numbers the pages don't contain: a free AI sometimes invents them.
    let all_text: String = pages.iter().map(|p| p.text.as_str()).collect::<Vec<_>>().join(" ");
    let doubtful = unsupported_numbers(&answer, &format!("{question} {all_text}"));
    if !doubtful.is_empty() {
        send(Update {
            kind: "text",
            text: format!("\n\n⚠️ Double-check these — I couldn't find them in the pages I read: {}.", doubtful.join(", ")),
            ..Default::default()
        });
    }
    // Only the sources the answer really cites (all of them if it cites none).
    let cited: Vec<Source> = sources.iter().filter(|s| answer.contains(&format!("[{}]", s.n))).cloned().collect();
    let list = if cited.is_empty() { sources } else { cited };
    let mut tail = String::from("\n\n## Sources\n");
    for s in &list {
        tail.push_str(&format!("[{}] {} — {}\n", s.n, s.title, s.url));
    }
    send(Update { kind: "text", text: tail, ..Default::default() });
    send(Update { kind: "done", text: String::new(), sources: list, ..Default::default() });
    eprintln!("[research] done: {} pages", pages.len());
    Ok(())
}

/// The top Wikipedia article(s) for the question, read like any page.
fn gather_wiki(id: u64, q: &str, pages: &mut Vec<Page>, seen: &mut HashSet<String>, send: &dyn Fn(Update)) {
    if cancelled(id) {
        return;
    }
    send(Update { kind: "search", text: format!("Wikipedia: {q}"), ..Default::default() });
    let Ok(hits) = crate::web::wikipedia(q) else { return };
    for h in hits.into_iter().filter(|h| relevant(q, h)).take(2) {
        if !seen.insert(h.url.clone()) {
            continue;
        }
        send(Update { kind: "read", text: h.title.clone(), url: Some(h.url.clone()), site: Some("wikipedia.org".into()), ..Default::default() });
        match crate::web::read_page(&h.url) {
            Ok((landed, text)) if text.split_whitespace().count() > 80 => pages.push(Page { title: h.title, url: landed, text: text.chars().take(PAGE_CHARS).collect() }),
            _ => send(Update { kind: "skip", text: h.title, url: Some(h.url), site: Some("wikipedia.org".into()), ..Default::default() }),
        }
    }
}

/// Run the searches, pick the best new pages (a few per site at most), and
/// read them side by side.
fn gather(
    id: u64,
    queries: &[String],
    max_pages: usize,
    pages: &mut Vec<Page>,
    seen: &mut HashSet<String>,
    per_site: &mut std::collections::HashMap<String, usize>,
    send: &dyn Fn(Update),
) -> anyhow::Result<()> {
    let mut picks: Vec<crate::web::Hit> = Vec::new();
    // Take the top hits of each search in turn, so every angle gets a page.
    let mut lists: Vec<Vec<crate::web::Hit>> = Vec::new();
    for (i, q) in queries.iter().enumerate() {
        if cancelled(id) {
            anyhow::bail!("Stopped.");
        }
        // A short pause between searches, as a person would — a burst gets
        // the search engine to stop answering.
        if i > 0 {
            std::thread::sleep(std::time::Duration::from_millis(700));
        }
        send(Update { kind: "search", text: q.clone(), ..Default::default() });
        match crate::web::search(q) {
            Ok(h) => lists.push(h.into_iter().filter(|h| relevant(q, h)).collect()),
            Err(e) => eprintln!("[research] search failed: {e}"),
        }
    }
    let mut rank = 0;
    while picks.len() < max_pages && lists.iter().any(|l| l.len() > rank) {
        for l in &lists {
            if let Some(h) = l.get(rank) {
                let site = hit_site(h);
                let key = h.url.split('#').next().unwrap_or(&h.url).trim_end_matches('/').to_string();
                if picks.len() < max_pages && !skip_site(&site) && *per_site.get(&site).unwrap_or(&0) < PER_SITE && seen.insert(key) {
                    *per_site.entry(site).or_default() += 1;
                    picks.push(crate::web::Hit { title: h.title.clone(), url: h.url.clone(), snippet: h.snippet.clone() });
                }
            }
        }
        rank += 1;
    }
    // Read them, four at a time.
    for chunk in picks.chunks(4) {
        if cancelled(id) {
            anyhow::bail!("Stopped.");
        }
        let exec = crate::execution::current();
        let read: Vec<(crate::web::Hit, anyhow::Result<(String, String)>)> = std::thread::scope(|s| {
            let handles: Vec<_> = chunk
                .iter()
                .map(|h| {
                    send(Update { kind: "read", text: h.title.clone(), url: Some(h.url.clone()), site: Some(hit_site(h)), ..Default::default() });
                    let exec = exec.clone();
                    s.spawn(move || {
                        let _scope = crate::execution::attach(exec);
                        crate::web::read_page(&h.url)
                    })
                })
                .collect();
            chunk.iter().cloned().zip(handles.into_iter().map(|h| h.join().unwrap_or_else(|_| Err(anyhow::anyhow!("reading stopped"))))).collect()
        });
        for (hit, r) in read {
            match r {
                Ok((landed, text)) if text.split_whitespace().count() > 80 => {
                    let title = text.lines().next().and_then(|l| l.strip_prefix("# ")).map(str::to_string).filter(|t| !t.is_empty()).unwrap_or(hit.title);
                    // The real address (Google's results are redirects).
                    pages.push(Page { title, url: landed, text: text.chars().take(PAGE_CHARS).collect() });
                }
                Ok(_) | Err(_) => {
                    // A page that wouldn't load (or had nothing on it): its search snippet still counts.
                    send(Update { kind: "skip", text: hit.title.clone(), url: Some(hit.url.clone()), site: Some(hit_site(&hit)), ..Default::default() });
                    if hit.snippet.split_whitespace().count() > 12 {
                        pages.push(Page { title: hit.title, url: hit.url, text: hit.snippet });
                    }
                }
            }
        }
    }
    Ok(())
}

/// Numbers in the answer (with %, decimals, ranges) that appear in none of
/// the sources. Citation markers ([3]) and small counting words are ignored.
fn unsupported_numbers(answer: &str, sources: &str) -> Vec<String> {
    let squash = |s: &str| s.replace(',', "");
    let sources = squash(sources);
    let answer = squash(answer);
    let mut out: Vec<String> = Vec::new();
    let chars: Vec<char> = answer.chars().collect();
    let mut i = 0;
    while i < chars.len() {
        if chars[i].is_ascii_digit() && (i == 0 || !chars[i - 1].is_alphanumeric()) && !(i > 0 && chars[i - 1] == '[') {
            let start = i;
            while i < chars.len() && (chars[i].is_ascii_digit() || chars[i] == '.' && chars.get(i + 1).is_some_and(|c| c.is_ascii_digit())) {
                i += 1;
            }
            let n: String = chars[start..i].iter().collect();
            // Skip a citation ("[3]") and tiny counts ("3 steps").
            let cited = chars.get(i) == Some(&']');
            if !cited && (n.len() >= 2 || n.contains('.')) && !has_number(&sources, &n) && !out.iter().any(|o| o.trim_end_matches('%') == n) {
                let pct = if chars.get(i) == Some(&'%') { "%" } else { "" };
                out.push(format!("{n}{pct}"));
            }
        } else {
            i += 1;
        }
    }
    out.truncate(8);
    out
}

/// `n` as a whole number in `text` ("10" isn't in "1000" or "3.10").
fn has_number(text: &str, n: &str) -> bool {
    text.match_indices(n).any(|(at, _)| {
        let before = text[..at].chars().next_back();
        let after = text[at + n.len()..].chars().next();
        let digitish = |c: Option<char>| c.is_some_and(|c| c.is_ascii_digit());
        !digitish(before) && !digitish(after) && before != Some('.') && !(after == Some('.') && text[at + n.len() + 1..].starts_with(|c: char| c.is_ascii_digit()))
    })
}

const COMMON: &[&str] = &["work", "works", "days", "much", "many", "more", "most", "like", "make", "made", "used", "using", "will", "than", "then", "also", "some", "other", "need", "good", "really", "help", "what", "which", "when", "where", "with", "that", "this", "from", "your", "about", "best", "does", "have", "into", "they", "them", "their", "there", "would", "could", "should", "2025", "2026", "2027"];

/// A result that shares the search's real words (a fallback engine's
/// "Rate | Mortgages" for "rate limits for AI APIs" doesn't).
fn relevant(query: &str, hit: &crate::web::Hit) -> bool {
    let words: Vec<String> = query.to_lowercase().split(|c: char| !c.is_alphanumeric()).filter(|w| w.len() > 3 && !COMMON.contains(w)).map(str::to_string).collect();
    if words.len() < 2 {
        return true;
    }
    let seen = format!("{} {} {}", hit.title, hit.snippet, hit.url).to_lowercase();
    let found = words.iter().filter(|w| seen.contains(w.as_str())).count();
    // At least half of them (of the first six).
    found * 2 >= words.len().min(6)
}

/// Sites that are no use to read in the background (video, sign-in walls, social feeds).
fn skip_site(site: &str) -> bool {
    ["youtube.com", "m.youtube.com", "tiktok.com", "instagram.com", "facebook.com", "x.com", "twitter.com", "pinterest.com", "linkedin.com"].iter().any(|s| site == *s || site.ends_with(&format!(".{s}")))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hears_research_requests() {
        assert_eq!(asks("deep research on the best laptops for college 2026").as_deref(), Some("the best laptops for college 2026"));
        assert_eq!(asks("Research how solar panels work").as_deref(), Some("how solar panels work"));
        assert_eq!(asks("do some deep research about Houston rent prices.").as_deref(), Some("Houston rent prices"));
        assert_eq!(asks("research it"), None);
        assert_eq!(asks("İİİİ research"), None, "no panic on letters that change length when lower-cased");
        assert_eq!(asks("what's the weather"), None);
        assert_eq!(asks("researchers found a new planet"), None);
    }

    /// Real research with this PC's AI and the live web:
    /// `IZUKI_RESEARCH="question" cargo test --lib real_research -- --ignored --nocapture`
    #[test]
    #[ignore]
    fn real_research() {
        let q = std::env::var("IZUKI_RESEARCH").expect("set IZUKI_RESEARCH");
        // This PC's real settings (its AI keys), read only.
        crate::state::init();
        let started = std::time::Instant::now();
        let text = Mutex::new(String::new());
        let r = run(7, &q, &[], &|u: Update| {
            if u.kind == "text" {
                text.lock().unwrap().push_str(&u.text);
            } else {
                eprintln!("[{:>5.1}s] {} {} {}", started.elapsed().as_secs_f32(), u.kind, u.text, u.url.unwrap_or_default());
            }
        });
        eprintln!("---
{}
--- {:?} in {:.0}s", text.lock().unwrap(), r.as_ref().err(), started.elapsed().as_secs_f32());
        r.unwrap();
    }

    #[test]
    fn reads_search_lines() {
        let q = query_lines("Here are the searches:\n1. best laptop 2026 students\n2) \"laptop battery life review\"\n- best laptop 2026 students\nmacbook vs windows for college", 5);
        assert_eq!(q, vec!["best laptop 2026 students", "laptop battery life review", "macbook vs windows for college"]);
        assert_eq!(site_of("https://www.nytimes.com/2026/a"), "nytimes.com");
        assert!(skip_site("www.youtube.com".trim_start_matches("www.")));
        assert!(!skip_site("wikipedia.org"));
        assert_eq!(unsupported_numbers("Panels make 10-20% on cloudy days [1], and the record is 47.6% [2]. Over 1,000 tested.", "the record of 47.6% was set; 1000 panels"), vec!["10", "20%"]);
        let hit = |t: &str, s: &str, u: &str| crate::web::Hit { title: t.into(), snippet: s.into(), url: u.into() };
        let q = "free AI API rate limits students";
        assert!(relevant(q, &hit("Rate limits | Gemini API", "Free tier requests per minute", "https://ai.google.dev/gemini-api/docs/rate-limits")));
        assert!(!relevant(q, &hit("Rate | Mortgage Branches in Colorado Springs", "Find the perfect loan", "https://www.rate.com/branches")));
        assert_eq!(query_lines("How do solar panels work on cloudy days in winter and at night really?", 3), vec!["How do solar panels work on cloudy days in winter"]);
    }
}
