//! Deep research, Perplexity/Comet style: Izuki plans several searches,
//! reads the best pages (in the background — no browser window), looks for
//! what's still missing and searches again, then writes a long answer with
//! numbered citations and its sources. The Chat tab shows each search and
//! each page live (the "computer with an eye" while it browses).
//!
//! Only public web pages are read (web.rs); nothing is signed into, bought,
//! posted or submitted.
//!
//! Every investigation is kept (questions, searches, the pages read, the
//! pages that couldn't be, the answer) in %APPDATA%\Izuki\research, so
//! "continue the research" / "dig deeper into …" picks it up later: what was
//! read stays read, and only what's missing is searched for.

use std::collections::HashSet;
use std::sync::Mutex;

use serde::{Deserialize, Serialize};
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
        // "Research more about …" carries on an earlier one (see `continues`).
        if continues(t).is_some() {
            return Some(t.trim_end_matches(['.', '!']).to_string());
        }
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

const WRITE_PROMPT: &str = "You are Izuki, a smart assistant who just researched the web for the user. Give them the most useful answer possible — the web pages are your evidence, not your limit.
- If they asked you to MAKE something (a prompt, plan, message, email, essay outline, code, checklist, comparison table), make it FIRST: complete, specific and ready to use — e.g. a full prompt in a ```text block they can copy. Use what the pages taught you plus your own knowledge. Never answer \"the sources don't contain one\" when you can write it yourself.
- If they asked a QUESTION, start with a 2–3 sentence direct answer, then sections with short ## headings: details, numbers, dates, differing views, what's uncertain.
- Facts taken from a page get its number in square brackets, like [2] or [1][4]. Never invent a source, a quote, or a number and pin it on a source. Your own general knowledge is welcome where the pages fall short — don't cite it, and say so when it matters (\"from general knowledge\").
- If a page is about something else, ignore it rather than describing it.
- End with a short '## Bottom line' (for a question) or '## How to use it' (for something you made). Don't write a sources list — it's added for you.
- Plain, friendly English. Markdown is fine.";

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Page {
    title: String,
    url: String,
    text: String,
}

/// A page (or a search) that couldn't be read, and why — said in the answer,
/// never quietly dropped.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
struct Missed {
    title: String,
    site: String,
    why: String,
}

/// One investigation, kept so it can be picked up again.
#[derive(Debug, Clone, Serialize, Deserialize)]
struct Saved {
    question: String,
    at: i64,
    queries: Vec<String>,
    pages: Vec<Page>,
    #[serde(default)]
    missed: Vec<Missed>,
    answer: String,
}

/// How many investigations are kept (the newest).
const KEEP: usize = 40;

fn saved_dir() -> std::path::PathBuf {
    crate::store::data_dir().join("research")
}

fn save(s: &Saved) {
    let dir = saved_dir();
    if std::fs::create_dir_all(&dir).is_err() {
        return;
    }
    if let Ok(text) = serde_json::to_string(s) {
        let _ = std::fs::write(dir.join(format!("{}.json", s.at)), text);
    }
    // Only the newest are kept.
    let mut files: Vec<_> = std::fs::read_dir(&dir).map(|d| d.flatten().map(|e| e.path()).filter(|p| p.extension().is_some_and(|x| x == "json")).collect()).unwrap_or_default();
    files.sort();
    while files.len() > KEEP {
        let _ = std::fs::remove_file(files.remove(0));
    }
}

/// The investigation to carry on (see `pick`).
fn latest(about: &str) -> Option<Saved> {
    let mut files: Vec<_> = std::fs::read_dir(saved_dir()).ok()?.flatten().map(|e| e.path()).filter(|p| p.extension().is_some_and(|x| x == "json")).collect();
    files.sort();
    files.reverse();
    let all: Vec<Saved> = files.iter().take(KEEP).filter_map(|p| serde_json::from_str(&std::fs::read_to_string(p).ok()?).ok()).collect();
    pick(all, about, chrono::Local::now().timestamp_millis())
}

/// Which kept investigation "continue / dig deeper into `about`" means: the
/// newest one sharing a word with it. No topic named: the newest. A topic no
/// kept one is about: the newest only if it's from the last half hour (going
/// on from what was just done), else none — a new research on that.
fn pick(all: Vec<Saved>, about: &str, now_ms: i64) -> Option<Saved> {
    const SMALL: &[&str] = &["that", "this", "those", "these", "them", "they", "their", "there", "here", "more", "into", "about", "with", "from", "what", "stuff", "part", "parts", "thing", "things", "topic", "info", "information", "details", "deeper", "further", "again", "some", "please", "research"];
    let words: Vec<String> = about.to_lowercase().split(|c: char| !c.is_alphanumeric()).filter(|w| w.len() >= 4 && !SMALL.contains(w)).map(str::to_string).collect();
    if words.is_empty() {
        return all.into_iter().next();
    }
    if let Some(s) = all.iter().find(|s| {
        let q = s.question.to_lowercase();
        q.split(|c: char| !c.is_alphanumeric()).any(|qw| words.iter().any(|w| same_word(w, qw)))
    }) {
        return Some(s.clone());
    }
    all.into_iter().next().filter(|s| now_ms - s.at < 30 * 60 * 1000)
}

/// The same word, give or take its ending: "batteries" / "battery",
/// "prices" / "price", "rent" / "rental".
fn same_word(a: &str, b: &str) -> bool {
    let shared = a.chars().zip(b.chars()).take_while(|(x, y)| x == y).count();
    shared >= 5 || (shared >= 4 && shared == a.chars().count().min(b.chars().count()))
}

/// "Continue the research", "keep researching …", "dig deeper into …",
/// "research more about …": carry on an earlier investigation. The words
/// after it (maybe none) say what to go deeper on.
pub fn continues(said: &str) -> Option<String> {
    let t = said.trim().trim_end_matches(['.', '!', '?']).trim();
    for lead in [
        "continue the research", "continue my research", "continue that research", "continue this research", "continue researching", "continue research",
        "keep researching", "keep digging", "resume the research", "resume my research", "pick up the research", "pick the research back up",
        "dig deeper", "go deeper", "research more", "do more research", "research further", "look deeper",
    ] {
        if t.get(..lead.len()).is_some_and(|p| p.eq_ignore_ascii_case(lead)) && t[lead.len()..].chars().next().is_none_or(|c| !c.is_alphanumeric()) {
            let mut rest = t[lead.len()..].trim().trim_start_matches([':', ',', '-', '—']).trim();
            for joint in ["on ", "into ", "about ", "in ", "for "] {
                if rest.get(..joint.len()).is_some_and(|p| p.eq_ignore_ascii_case(joint)) {
                    rest = rest[joint.len()..].trim();
                    break;
                }
            }
            return Some(rest.to_string());
        }
    }
    None
}

/// Why a page couldn't be read, in plain words.
fn why_not(err: &str) -> String {
    let l = err.to_lowercase();
    let status = |codes: &[&str]| codes.iter().any(|c| l.contains(&format!("answered {c}")));
    if status(&["401", "403", "429", "451"]) {
        "the site turned Izuki away (a sign-in, paywall or bot check)".into()
    } else if status(&["404", "410"]) {
        "the page is gone".into()
    } else if l.contains("pdf") {
        "it's a PDF (open it on screen and Izuki can read it there)".into()
    } else if l.contains("timed out") || l.contains("timeout") {
        "it didn't load in time".into()
    } else if status(&["500", "502", "503", "504"]) {
        "the site had an error".into()
    } else {
        "it wouldn't load".into()
    }
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

    // "Continue the research" / "dig deeper into …": pick up a kept one —
    // what was read stays read; only what's missing is searched for.
    let deeper = continues(question);
    let resumed = deeper.as_deref().and_then(latest);
    if deeper.is_some() && resumed.is_none() {
        match deeper.as_deref().filter(|d| d.split_whitespace().count() >= 2) {
            // Nothing to carry on, but it says what about: a new one on that.
            Some(about) => return run(id, about, history, send),
            None => anyhow::bail!("There's no earlier research to continue yet — say “research …” and what about to start one."),
        }
    }
    let extra = deeper.unwrap_or_default();
    // What it's about, kept as first asked (going deeper doesn't pile up in it).
    let topic = resumed.as_ref().map(|s| s.question.clone()).unwrap_or_else(|| question.to_string());
    let asked = match &resumed {
        Some(s) if !extra.is_empty() => format!("{} — and now, going deeper: {extra}", s.question),
        Some(s) => s.question.clone(),
        None => question.to_string(),
    };
    let question = asked.as_str();

    let mut pages: Vec<Page> = Vec::new();
    let mut missed: Vec<Missed> = Vec::new();
    let mut seen_urls = HashSet::new();
    let mut per_site: std::collections::HashMap<String, usize> = Default::default();
    let mut queries: Vec<String>;
    if let Some(s) = &resumed {
        send(Update { kind: "plan", text: format!("Picking up your research on “{}” — {} pages already read…", s.question, s.pages.len()), ..Default::default() });
        for p in &s.pages {
            seen_urls.insert(p.url.split('#').next().unwrap_or(&p.url).trim_end_matches('/').to_string());
            *per_site.entry(site_of(&p.url)).or_default() += 1;
        }
        pages = s.pages.clone();
        missed = s.missed.clone();
        queries = s.queries.clone();
    } else {
        send(Update { kind: "plan", text: "Planning the searches…".into(), ..Default::default() });
        let plan = crate::chat::complete(&[
            json!({ "role": "system", "content": PLAN_PROMPT }),
            json!({ "role": "user", "content": format!("{}Question: {question}\nToday is {}.", if context.is_empty() { String::new() } else { format!("Conversation so far:\n{context}\n") }, chrono::Local::now().format("%A %-d %B %Y")) }),
        ])
        .unwrap_or_default();
        // The question itself always goes first, so a planner that drifts
        // can't lose it.
        queries = query_lines(&format!("{question}\n{plan}"), FIRST_SEARCHES + 1);
        // An encyclopedia view of it too (Wikipedia always answers).
        let wiki_query = query_lines(question, 1).pop().unwrap_or_else(|| question.to_string());
        stop()?;
        gather(id, &queries, FIRST_PAGES, &mut pages, &mut seen_urls, &mut per_site, &mut missed, send)?;
        gather_wiki(id, &wiki_query, &mut pages, &mut seen_urls, &mut missed, send);
    }

    // Round two (or, carrying on, the round): what's still missing?
    if !pages.is_empty() {
        send(Update { kind: "think", text: "Checking what's still missing…".into(), ..Default::default() });
        let notes: String = pages.iter().map(|p| format!("- {}: {}\n", p.title, p.text.chars().take(600).collect::<String>().replace('\n', " "))).collect();
        let gaps = crate::chat::complete(&[
            json!({ "role": "system", "content": GAPS_PROMPT }),
            json!({ "role": "user", "content": format!("Question: {question}\n\nNotes so far:\n{notes}") }),
        ])
        .unwrap_or_default();
        stop()?;
        let (searches, reads) = if resumed.is_some() { (MORE_SEARCHES + 1, MORE_PAGES + 2) } else { (MORE_SEARCHES, MORE_PAGES) };
        let mut more: Vec<String> = Vec::new();
        if !gaps.trim().eq_ignore_ascii_case("none") && !gaps.to_uppercase().starts_with("NONE") {
            more = query_lines(&gaps, searches).into_iter().filter(|q| !queries.iter().any(|d| d.eq_ignore_ascii_case(q))).collect();
        }
        // Asked to go deeper on something: that's searched for, whatever the check said.
        if !extra.is_empty() && !more.iter().any(|q| q.eq_ignore_ascii_case(&extra)) {
            more.insert(0, query_lines(&extra, 1).pop().unwrap_or_else(|| extra.clone()));
        }
        if !more.is_empty() {
            gather(id, &more, reads, &mut pages, &mut seen_urls, &mut per_site, &mut missed, send)?;
            queries.extend(more);
        }
    }
    if pages.is_empty() {
        anyhow::bail!("I couldn't read any web pages for that — the web search may be blocked or offline. Try again in a moment.");
    }

    let sources: Vec<Source> = pages.iter().enumerate().map(|(i, p)| Source { n: i + 1, title: p.title.clone(), url: p.url.clone(), site: site_of(&p.url) }).collect();
    send(Update { kind: "write", text: format!("Writing it up from {} sources…", sources.len()), sources: sources.clone(), ..Default::default() });
    let each = (PAGE_CHARS * 15 / pages.len().max(15)).max(400);
    let material: String = pages.iter().enumerate().map(|(i, p)| format!("[{}] {} — {}\n{}\n\n", i + 1, p.title, p.url, p.text.chars().take(each).collect::<String>())).collect();
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
        json!({ "role": "system", "content": if crate::studylog::on() { format!("{WRITE_PROMPT}{}", crate::studylog::RULE) } else { WRITE_PROMPT.to_string() } }),
        json!({ "role": "user", "content": format!(
            "{}Request: {question}\nToday is {}.\n\nSources:\n\n{material}",
            if context.is_empty() { String::new() } else { format!("The conversation so far (for context):\n{context}\n") },
            chrono::Local::now().format("%A %-d %B %Y")
        ) }),
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
    // What couldn't be read is said, not quietly dropped.
    if !missed.is_empty() {
        tail.push_str("\n## Couldn't read\n");
        for m in missed.iter().take(8) {
            if m.site.is_empty() {
                tail.push_str(&format!("- {} — {}\n", m.title, m.why));
            } else {
                tail.push_str(&format!("- {} ({}) — {}\n", m.title, m.site, m.why));
            }
        }
        if missed.len() > 8 {
            tail.push_str(&format!("- and {} more\n", missed.len() - 8));
        }
    }
    tail.push_str("\n_Say “continue the research” or “dig deeper into …” to carry on from here._\n");
    save(&Saved { question: topic, at: chrono::Local::now().timestamp_millis(), queries: queries.clone(), pages: pages.clone(), missed: missed.clone(), answer: format!("{answer}{tail}") });
    crate::studylog::record(&question, &format!("{answer}{tail}"));
    send(Update { kind: "text", text: tail, ..Default::default() });
    send(Update { kind: "done", text: String::new(), sources: list, ..Default::default() });
    eprintln!("[research] done: {} pages", pages.len());
    Ok(())
}

/// The top Wikipedia article(s) for the question, read like any page.
fn gather_wiki(id: u64, q: &str, pages: &mut Vec<Page>, seen: &mut HashSet<String>, missed: &mut Vec<Missed>, send: &dyn Fn(Update)) {
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
            r => {
                let why = match r {
                    Err(e) => why_not(&e.to_string()),
                    Ok(_) => "almost no readable text".into(),
                };
                missed.push(Missed { title: h.title.clone(), site: "wikipedia.org".into(), why });
                send(Update { kind: "skip", text: h.title, url: Some(h.url), site: Some("wikipedia.org".into()), ..Default::default() });
            }
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
    missed: &mut Vec<Missed>,
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
            Err(e) => {
                eprintln!("[research] search failed: {e}");
                missed.push(Missed { title: format!("the search “{q}”"), site: String::new(), why: "no search engine answered (they slow down after many searches)".into() });
            }
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
                r => {
                    // A page that wouldn't load (or had nothing on it): said in
                    // the answer — and its search snippet still counts.
                    let mut why = match r {
                        Err(e) => why_not(&e.to_string()),
                        Ok(_) => "almost no readable text (often a sign-in page, a paywall or an app-only page)".into(),
                    };
                    send(Update { kind: "skip", text: hit.title.clone(), url: Some(hit.url.clone()), site: Some(hit_site(&hit)), ..Default::default() });
                    if hit.snippet.split_whitespace().count() > 12 {
                        why.push_str(" — only its search summary was used");
                        pages.push(Page { title: hit.title.clone(), url: hit.url.clone(), text: hit.snippet.clone() });
                    }
                    let site = hit_site(&hit);
                    missed.push(Missed { title: hit.title, site, why });
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
        if chars[i].is_ascii_digit() {
            // The whole number-like word: "47.6", "1.0.20", "2026".
            let start = i;
            while i < chars.len() && (chars[i].is_ascii_digit() || chars[i] == '.' && chars.get(i + 1).is_some_and(|c| c.is_ascii_digit())) {
                i += 1;
            }
            let n: String = chars[start..i].iter().collect();
            // Not a figure: part of a word or name ("v1.0.20", "GPT4"), a
            // version ("1.0.20"), a citation ("[3]").
            let before = start.checked_sub(1).map(|b| chars[b]);
            let glued = before.is_some_and(|c| c.is_alphanumeric() || c == '[' || c == '.' || c == '_') || chars.get(i).is_some_and(|c| c.is_alphabetic());
            let version = n.matches('.').count() >= 2;
            let cited = chars.get(i) == Some(&']');
            if !glued && !version && !cited && (n.len() >= 2 || n.contains('.')) && !has_number(&sources, &n) && !out.iter().any(|o| o.trim_end_matches('%') == n) {
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
        // Carrying on an earlier one (the whole request goes to `run`).
        assert_eq!(asks("research more about the battery prices").as_deref(), Some("research more about the battery prices"));
        assert_eq!(continues("Continue the research."), Some(String::new()));
        assert_eq!(continues("dig deeper into the battery prices"), Some("the battery prices".into()));
        assert_eq!(continues("keep researching: rent in Houston"), Some("rent in Houston".into()));
        assert_eq!(continues("research more about EVs"), Some("EVs".into()));
        assert_eq!(continues("digger deeper"), None);
        assert_eq!(continues("go deeper"), Some(String::new()));
        assert_eq!(continues("research how solar works"), None, "a new one");
    }

    #[test]
    fn carries_on_the_right_one_and_says_what_it_missed() {
        let s = |q: &str, at: i64| Saved { question: q.into(), at, queries: vec![], pages: vec![], missed: vec![], answer: String::new() };
        let now = 10 * 3600 * 1000;
        let all = vec![s("Houston rent prices 2026", now - 3600 * 1000), s("best laptops for college", 2), s("EV battery prices", 1)];
        assert_eq!(pick(all.clone(), "the battery stuff", now).unwrap().question, "EV battery prices", "the one it's about");
        assert_eq!(pick(all.clone(), "", now).unwrap().question, "Houston rent prices 2026", "no topic: the newest");
        assert_eq!(pick(all.clone(), "that", now).unwrap().question, "Houston rent prices 2026", "“dig deeper into that”");
        assert_eq!(pick(all.clone(), "quantum batteries", now).unwrap().question, "EV battery prices", "shares a word");
        assert!(pick(all.clone(), "quantum computing", now).is_none(), "a new topic, the last one an hour old: a new research");
        let fresh = vec![s("Houston rent prices 2026", now - 60 * 1000)];
        assert_eq!(pick(fresh, "the costs", now).unwrap().question, "Houston rent prices 2026", "just researched: going on from it");
        assert_eq!(pick(vec![], "x", now).map(|s| s.question), None);
        assert!(same_word("batteries", "battery") && same_word("rent", "rental") && same_word("prices", "price"));
        assert!(!same_word("rent", "recent") && !same_word("cost", "coast"));
        assert_eq!(why_not("that page answered 403 Forbidden"), "the site turned Izuki away (a sign-in, paywall or bot check)");
        assert_eq!(why_not("that page answered 404 Not Found"), "the page is gone");
        assert_eq!(why_not("error sending request: operation timed out"), "it didn't load in time");
        assert_eq!(why_not("that's a PDF — open it on screen and I'll read it there"), "it's a PDF (open it on screen and Izuki can read it there)");
        assert_eq!(why_not("connection refused"), "it wouldn't load");
        // Old saved files without the newer fields still load.
        let old: Saved = serde_json::from_str(r#"{"question":"q","at":1,"queries":[],"pages":[],"answer":"a"}"#).unwrap();
        assert!(old.missed.is_empty());
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
        assert!(unsupported_numbers("Izuki v1.0.20 was released; version 1.0.20 too; GPT4o and 3rd place.", "nothing").is_empty(), "versions and names aren't figures");
        let hit = |t: &str, s: &str, u: &str| crate::web::Hit { title: t.into(), snippet: s.into(), url: u.into() };
        let q = "free AI API rate limits students";
        assert!(relevant(q, &hit("Rate limits | Gemini API", "Free tier requests per minute", "https://ai.google.dev/gemini-api/docs/rate-limits")));
        assert!(!relevant(q, &hit("Rate | Mortgage Branches in Colorado Springs", "Find the perfect loan", "https://www.rate.com/branches")));
        assert_eq!(query_lines("How do solar panels work on cloudy days in winter and at night really?", 3), vec!["How do solar panels work on cloudy days in winter"]);
    }
}
