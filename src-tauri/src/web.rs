//! Izuki's web reader — the "BeautifulSoup" part: search the web and read
//! any page as clean text, in the background, with no browser window, no
//! key and nothing extra to install. Used by the chat on the PC and the
//! phone (the chat asks with a [SEARCH: …] or [READ: …] tag; chat.rs runs
//! it and hands the text back).
//!
//! Pages behind a sign-in (Blackboard, NotebookLM…) need the user's own
//! session instead — that's the hidden Izuki browser (browser.rs).

use std::time::Duration;

use anyhow::{anyhow, Result};
use scraper::{Html, Selector};

/// A normal browser's name, so sites send the same page a person sees.
const UA: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
/// How much of a page the model gets (enough to answer, cheap to send).
pub const PAGE_CHARS: usize = 7000;

fn client() -> Result<reqwest::blocking::Client> {
    Ok(reqwest::blocking::Client::builder()
        .user_agent(UA)
        .timeout(Duration::from_secs(20))
        .connect_timeout(Duration::from_secs(8))
        .build()?)
}

#[derive(Clone)]
pub struct Hit {
    pub title: String,
    pub url: String,
    pub snippet: String,
}

/// Search the web — Google through the user's Gemini key first (Gemini's
/// own Google Search tool: real results, its own free daily allowance),
/// then Brave, DuckDuckGo and Bing pages. (Oct 2026: DuckDuckGo answers
/// background requests with a bot check, Bing only uses the first word,
/// and Brave stops answering after a burst — fine as backups only.) An
/// engine that comes back empty is skipped for 90 s, so a long research
/// doesn't wait on it.
pub fn search(query: &str) -> Result<Vec<Hit>> {
    let q = query.trim();
    if q.is_empty() {
        return Err(anyhow!("nothing to search for"));
    }
    let engines: [(&str, fn(&str) -> Result<Vec<Hit>>); 5] =
        [("google", google_via_gemini), ("brave", brave), ("wikipedia", wikipedia), ("duckduckgo", duckduckgo), ("bing", bing)];
    let mut last = anyhow!("the web search didn't answer — try again in a moment");
    for (name, engine) in engines {
        if resting(name) {
            continue;
        }
        match engine(q) {
            Ok(h) if !h.is_empty() => return Ok(h),
            // Wikipedia having no article isn't the engine failing.
            Ok(_) if name == "wikipedia" => {}
            Ok(_) => rest(name, 90),
            Err(e) => {
                // Out of quota / "too many requests": a long rest.
                let busy = e.to_string().contains("429");
                rest(name, match (name, busy) {
                    ("google", true) => 3600,
                    (_, true) => 180,
                    _ => 90,
                });
                last = e;
            }
        }
    }
    Err(last)
}

/// Wikipedia's own search (its public API — always answers, no key).
pub fn wikipedia(q: &str) -> Result<Vec<Hit>> {
    let v: serde_json::Value = client()?
        .get(format!("https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={}&srlimit=5&format=json&utf8=1", enc(q)))
        .send()?
        .error_for_status()?
        .json()?;
    Ok(v["query"]["search"]
        .as_array()
        .into_iter()
        .flatten()
        .filter_map(|r| {
            let title = r["title"].as_str()?.to_string();
            let snippet = Html::parse_fragment(r["snippet"].as_str().unwrap_or("")).root_element().text().collect::<String>();
            Some(Hit { url: format!("https://en.wikipedia.org/wiki/{}", enc(&title.replace(' ', "_"))), title: format!("{title} - Wikipedia"), snippet })
        })
        .collect())
}

static RESTING: std::sync::Mutex<Vec<(&'static str, std::time::Instant)>> = std::sync::Mutex::new(Vec::new());

fn resting(name: &str) -> bool {
    let mut r = RESTING.lock().unwrap_or_else(|e| e.into_inner());
    r.retain(|(_, until)| *until > std::time::Instant::now());
    r.iter().any(|(n, _)| *n == name)
}

fn rest(name: &'static str, secs: u64) {
    eprintln!("[web] {name} gave no results — resting it for {secs} s");
    RESTING.lock().unwrap_or_else(|e| e.into_inner()).push((name, std::time::Instant::now() + Duration::from_secs(secs)));
}

/// Brave answers a person's pace, not a burst: searches at least 2.5 s apart.
static BRAVE_LAST: std::sync::Mutex<Option<std::time::Instant>> = std::sync::Mutex::new(None);

/// Google results through Gemini's Google Search tool. The links are
/// Google's redirects to the real pages (reading one lands on the page).
fn google_via_gemini(q: &str) -> Result<Vec<Hit>> {
    use crate::settings::ProviderId;
    let settings = crate::state::try_store().ok_or_else(|| anyhow!("not ready"))?.settings();
    let cfg = settings.provider(ProviderId::Gemini).filter(|c| !c.api_key.trim().is_empty()).cloned().ok_or_else(|| anyhow!("no Gemini key"))?;
    let base = cfg.base_url.trim_end_matches('/').to_string();
    let base = if base.is_empty() { "https://generativelanguage.googleapis.com".to_string() } else { base };
    let mut last = anyhow!("Google search through Gemini didn't answer");
    // The light model first (quick, and its own allowance), then the chosen one.
    for model in ["gemini-flash-lite-latest".to_string(), crate::vision::gemini_model_now(&cfg.model)] {
        let mut body = serde_json::json!({
            "contents": [{ "role": "user", "parts": [{ "text": format!("Search the web for: {q}\nSum up what the best results say — the key facts, numbers and dates — in a few sentences.") }] }],
            "tools": [{ "google_search": {} }],
            "generationConfig": { "temperature": 0.2, "maxOutputTokens": 600 }
        });
        if let Some(config) = crate::vision::gemini_no_think(&model).thinking_config() {
            body["generationConfig"]["thinkingConfig"] = config;
        }
        let res = client()?.post(format!("{base}/v1beta/models/{model}:generateContent")).header("x-goog-api-key", cfg.api_key.trim()).json(&body).send()?;
        let status = res.status();
        if !status.is_success() {
            let why: String = res.text().unwrap_or_default().split_whitespace().collect::<Vec<_>>().join(" ").chars().take(1400).collect();
            eprintln!("[web] Google search through {model} answered {status}: {why}");
            last = anyhow!("Google search through Gemini answered {}", status.as_u16());
            continue;
        }
        let v: serde_json::Value = res.json()?;
        let hits = parse_grounding(&v);
        if !hits.is_empty() {
            return Ok(hits);
        }
        eprintln!("[web] Google search through {model} came back with no pages ({})", v["candidates"][0]["finishReason"].as_str().unwrap_or("?"));
    }
    Err(last)
}

/// The pages Gemini's Google search used, each with the sentences it
/// supported as its snippet.
fn parse_grounding(v: &serde_json::Value) -> Vec<Hit> {
    let meta = &v["candidates"][0]["groundingMetadata"];
    let chunks = meta["groundingChunks"].as_array().cloned().unwrap_or_default();
    let mut snippets = vec![String::new(); chunks.len()];
    for s in meta["groundingSupports"].as_array().into_iter().flatten() {
        let text = s["segment"]["text"].as_str().unwrap_or("");
        for i in s["groundingChunkIndices"].as_array().into_iter().flatten().filter_map(|i| i.as_u64()) {
            if let Some(sn) = snippets.get_mut(i as usize) {
                if sn.len() < 400 {
                    sn.push_str(text);
                    sn.push(' ');
                }
            }
        }
    }
    chunks
        .iter()
        .zip(snippets)
        .filter_map(|(c, snippet)| {
            let url = c["web"]["uri"].as_str()?.to_string();
            let title = c["web"]["title"].as_str().unwrap_or("").to_string();
            url.starts_with("http").then(|| Hit { title, url, snippet: snippet.trim().to_string() })
        })
        .take(8)
        .collect()
}

fn brave(q: &str) -> Result<Vec<Hit>> {
    {
        let mut last = BRAVE_LAST.lock().unwrap_or_else(|e| e.into_inner());
        if let Some(at) = *last {
            let gap = Duration::from_millis(2500);
            if at.elapsed() < gap {
                std::thread::sleep(gap - at.elapsed());
            }
        }
        *last = Some(std::time::Instant::now());
    }
    let html = client()?
        .get(format!("https://search.brave.com/search?q={}&source=web", enc(q)))
        .header("Accept-Language", "en-US,en;q=0.9")
        .send()?
        .error_for_status()?
        .text()?;
    Ok(parse_brave(&html))
}

fn parse_brave(html: &str) -> Vec<Hit> {
    let doc = Html::parse_document(html);
    let result = Selector::parse(r#"div.snippet[data-type="web"]"#).unwrap();
    let link = Selector::parse("a[href]").unwrap();
    let title = Selector::parse(".title").unwrap();
    let snip = Selector::parse(".generic-snippet .content, .snippet-description, .content").unwrap();
    doc.select(&result)
        .filter_map(|r| {
            let a = r.select(&link).find(|a| a.value().attr("href").is_some_and(|h| h.starts_with("http") && !h.contains("brave.com")))?;
            let t = r.select(&title).next()?;
            Some(Hit {
                title: t.value().attr("title").map(str::to_string).unwrap_or_else(|| text_of(t.text())),
                url: a.value().attr("href")?.to_string(),
                snippet: r.select(&snip).next().map(|s| text_of(s.text())).unwrap_or_default(),
            })
        })
        .filter(|h| !h.title.is_empty())
        .take(6)
        .collect()
}

fn duckduckgo(q: &str) -> Result<Vec<Hit>> {
    let html = client()?
        .get(format!("https://html.duckduckgo.com/html/?q={}", enc(q)))
        .send()?
        .error_for_status()?
        .text()?;
    Ok(parse_duckduckgo(&html))
}

fn parse_duckduckgo(html: &str) -> Vec<Hit> {
    let doc = Html::parse_document(html);
    let result = Selector::parse(".result").unwrap();
    let link = Selector::parse("a.result__a").unwrap();
    let snip = Selector::parse(".result__snippet").unwrap();
    doc.select(&result)
        .filter(|r| !r.value().classes().any(|c| c == "result--ad"))
        .filter_map(|r| {
            let a = r.select(&link).next()?;
            let href = a.value().attr("href")?;
            Some(Hit {
                title: text_of(a.text()),
                url: unwrap_ddg(href),
                snippet: r.select(&snip).next().map(|s| text_of(s.text())).unwrap_or_default(),
            })
        })
        .filter(|h| h.url.starts_with("http"))
        .take(6)
        .collect()
}

/// DuckDuckGo links go through a redirect; the real address is `uddg`.
fn unwrap_ddg(href: &str) -> String {
    if let Some(i) = href.find("uddg=") {
        let enc = href[i + 5..].split('&').next().unwrap_or("");
        return percent_decode(enc);
    }
    if href.starts_with("//") {
        format!("https:{href}")
    } else {
        href.to_string()
    }
}

/// Bing's links go through bing.com/ck/a; the real address is `u=a1` +
/// base64url.
fn unwrap_bing(href: &str) -> String {
    use base64::Engine;
    if href.contains("bing.com/ck/") {
        if let Some(b) = href.split(['?', '&']).find_map(|p| p.strip_prefix("u=a1")) {
            if let Ok(bytes) = base64::engine::general_purpose::URL_SAFE_NO_PAD.decode(b.trim_end_matches('=')) {
                if let Ok(real) = String::from_utf8(bytes) {
                    if real.starts_with("http") {
                        return real;
                    }
                }
            }
        }
    }
    href.to_string()
}

fn bing(q: &str) -> Result<Vec<Hit>> {
    let html = client()?
        .get(format!("https://www.bing.com/search?q={}", enc(q)))
        .send()?
        .error_for_status()?
        .text()?;
    let doc = Html::parse_document(&html);
    let item = Selector::parse("li.b_algo").unwrap();
    let link = Selector::parse("h2 a").unwrap();
    let snip = Selector::parse(".b_caption p, p").unwrap();
    let hits: Vec<Hit> = doc
        .select(&item)
        .filter_map(|r| {
            let a = r.select(&link).next()?;
            Some(Hit {
                title: text_of(a.text()),
                url: unwrap_bing(a.value().attr("href")?),
                snippet: r.select(&snip).next().map(|s| text_of(s.text())).unwrap_or_default(),
            })
        })
        .filter(|h| h.url.starts_with("http"))
        .take(6)
        .collect();
    if hits.is_empty() {
        return Err(anyhow!("the web search didn't answer — try again in a moment"));
    }
    Ok(hits)
}

/// The search results, written for the model to read.
pub fn search_text(query: &str) -> Result<String> {
    let hits = search(query)?;
    let mut s = format!("Web results for \"{query}\":\n");
    for (i, h) in hits.iter().enumerate() {
        s.push_str(&format!("{}. {} — {}\n   {}\n", i + 1, h.title, h.url, h.snippet));
    }
    s.push_str("(Read one with [READ: url] for the details.)");
    Ok(s)
}

/// A page as clean, readable text: title, the main words, and its links.
pub fn read(url: &str) -> Result<String> {
    read_page(url).map(|(_, text)| text)
}

/// `read`, plus the address it really landed on (after any redirect).
pub fn read_page(url: &str) -> Result<(String, String)> {
    let url = url.trim().trim_matches(|c| c == '<' || c == '>');
    let url = if url.starts_with("http") { url.to_string() } else { format!("https://{url}") };
    let res = client()?.get(&url).send()?;
    let landed = res.url().to_string();
    let status = res.status();
    let kind = res.headers().get("content-type").and_then(|v| v.to_str().ok()).unwrap_or("").to_lowercase();
    if !status.is_success() {
        return Err(anyhow!("that page answered {status}"));
    }
    if kind.contains("pdf") {
        return Err(anyhow!("that's a PDF — open it on screen and I'll read it there"));
    }
    let body = res.text()?;
    if !kind.contains("html") && !body.trim_start().starts_with('<') {
        return Ok((landed, clip(&body, PAGE_CHARS)));
    }
    let text = page_text(&body, &landed);
    Ok((landed, text))
}

/// The readable part of an HTML page (what a person would read), then a
/// short list of its links.
pub fn page_text(html: &str, base: &str) -> String {
    let doc = Html::parse_document(html);
    let title = Selector::parse("title").unwrap();
    let title = doc.select(&title).next().map(|t| text_of(t.text())).unwrap_or_default();

    // Prefer the article/main area; fall back to the whole body.
    let main = ["main", "article", "[role=main]", "#content", ".content", "body"]
        .iter()
        .filter_map(|s| Selector::parse(s).ok())
        .find_map(|s| doc.select(&s).next());

    let mut out = String::new();
    if !title.is_empty() {
        out.push_str(&format!("# {title}\n"));
    }
    if let Some(root) = main {
        let skip = ["script", "style", "noscript", "svg", "nav", "footer", "header", "form", "iframe", "template"];
        let block = ["p", "div", "li", "h1", "h2", "h3", "h4", "tr", "br", "section", "article", "td", "dd", "dt"];
        // Depth-first walk that drops page furniture and keeps line breaks.
        fn walk(node: scraper::ElementRef, skip: &[&str], block: &[&str], out: &mut String) {
            for child in node.children() {
                if let Some(t) = child.value().as_text() {
                    let t = t.split_whitespace().collect::<Vec<_>>().join(" ");
                    if !t.is_empty() {
                        if !out.ends_with(['\n', ' ']) && !out.is_empty() {
                            out.push(' ');
                        }
                        out.push_str(&t);
                    }
                } else if let Some(el) = scraper::ElementRef::wrap(child) {
                    let name = el.value().name();
                    if skip.contains(&name) || el.value().attr("aria-hidden") == Some("true") {
                        continue;
                    }
                    let is_block = block.contains(&name);
                    if is_block && !out.ends_with('\n') {
                        out.push('\n');
                    }
                    walk(el, skip, block, out);
                    if is_block && !out.ends_with('\n') {
                        out.push('\n');
                    }
                }
            }
        }
        walk(root, &skip, &block, &mut out);
    }
    // Squash runs of blank lines.
    let mut text = String::new();
    for line in out.lines().map(str::trim).filter(|l| l.len() > 1) {
        text.push_str(line);
        text.push('\n');
    }
    let mut text = clip(&text, PAGE_CHARS);

    let a = Selector::parse("a[href]").unwrap();
    let mut links = Vec::new();
    for el in doc.select(&a) {
        let label = text_of(el.text());
        let href = el.value().attr("href").unwrap_or("");
        if label.len() < 3 || href.starts_with('#') || href.starts_with("javascript") {
            continue;
        }
        let full = absolute(base, href);
        if !links.iter().any(|(_, u): &(String, String)| u == &full) {
            links.push((clip(&label, 60), full));
        }
        if links.len() >= 15 {
            break;
        }
    }
    if !links.is_empty() {
        text.push_str("\nLinks on the page:\n");
        for (label, url) in links {
            text.push_str(&format!("- {label}: {url}\n"));
        }
    }
    text
}

fn absolute(base: &str, href: &str) -> String {
    if href.starts_with("http") {
        return href.to_string();
    }
    let Ok(b) = reqwest::Url::parse(base) else { return href.to_string() };
    b.join(href).map(|u| u.to_string()).unwrap_or_else(|_| href.to_string())
}

fn text_of<'a>(parts: impl Iterator<Item = &'a str>) -> String {
    parts.collect::<Vec<_>>().join(" ").split_whitespace().collect::<Vec<_>>().join(" ")
}

/// A query, safe inside a web address.
fn enc(q: &str) -> String {
    q.bytes()
        .map(|b| match b {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => (b as char).to_string(),
            b' ' => "+".to_string(),
            _ => format!("%{b:02X}"),
        })
        .collect()
}

fn percent_decode(s: &str) -> String {
    let bytes = s.as_bytes();
    let mut out = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'%' if i + 2 < bytes.len() => {
                match u8::from_str_radix(&s[i + 1..i + 3], 16) {
                    Ok(b) => {
                        out.push(b);
                        i += 3;
                        continue;
                    }
                    Err(_) => out.push(b'%'),
                }
            }
            b'+' => out.push(b' '),
            b => out.push(b),
        }
        i += 1;
    }
    String::from_utf8_lossy(&out).into_owned()
}

pub fn clip(s: &str, max: usize) -> String {
    if s.chars().count() <= max {
        s.to_string()
    } else {
        format!("{}…", s.chars().take(max).collect::<String>())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// The real web, no AI: a search and a page read. Needs the internet, so
    /// only when asked: `cargo test live_web -- --ignored --nocapture`.
    #[test]
    #[ignore]
    fn live_web_search_and_read() {
        let found = search_text("Burna Boy latest news").unwrap();
        eprintln!("search:
{}", clip(&found, 700));
        assert!(found.to_lowercase().contains("burna"), "{found}");
        let page = read("https://en.wikipedia.org/wiki/Burna_Boy").unwrap();
        eprintln!("page:
{}", clip(&page, 400));
        assert!(page.contains("Burna Boy"), "{page}");
    }

    /// Google through this PC's Gemini key: `cargo test --lib live_google -- --ignored --nocapture`
    #[test]
    #[ignore]
    fn live_google_search() {
        crate::state::init();
        let hits = google_via_gemini("Gemini API free tier rate limits").unwrap();
        for h in &hits {
            eprintln!("{} | {} | {}", h.title, &h.url[..h.url.len().min(80)], &h.snippet[..h.snippet.len().min(100)]);
        }
        assert!(!hits.is_empty());
    }

    #[test]
    fn reads_brave_and_bing_results() {
        let html = r#"<main><div class="snippet svelte-x" data-pos="0" data-type="web"><a href="https://ai.google.dev/gemini-api/docs/rate-limits" class="l1"><div class="title search-snippet-title" title="Rate limits | Gemini API">Rate limits | Gemini API</div></a><div class="generic-snippet"><div class="content">Default rate limits are <strong>0.3x</strong> the standard.</div></div></div>
            <div class="snippet" data-type="video"><a href="https://youtube.com/x"><div class="title">A video</div></a></div></main>"#;
        let hits = parse_brave(html);
        assert_eq!(hits.len(), 1);
        assert_eq!(hits[0].url, "https://ai.google.dev/gemini-api/docs/rate-limits");
        assert_eq!(hits[0].title, "Rate limits | Gemini API");
        assert!(hits[0].snippet.contains("0.3x"), "{}", hits[0].snippet);
        assert_eq!(
            unwrap_bing("https://www.bing.com/ck/a?!&&p=07f4&ptn=3&ver=2&hsh=4&fclid=02cc&u=a1aHR0cHM6Ly93d3cuYmVzdGJ1eS5jb20v&ntb=1"),
            "https://www.bestbuy.com/"
        );
        assert_eq!(unwrap_bing("https://example.com/a"), "https://example.com/a");
        let g = serde_json::json!({"candidates":[{"groundingMetadata":{
            "groundingChunks":[{"web":{"uri":"https://vertexaisearch.cloud.google.com/grounding-api-redirect/abc","title":"ai.google.dev"}},{"web":{"uri":"https://vertexaisearch.cloud.google.com/grounding-api-redirect/def","title":"groq.com"}}],
            "groundingSupports":[{"segment":{"text":"Gemini's free tier allows 15 requests a minute."},"groundingChunkIndices":[0]},{"segment":{"text":"Groq is free with limits."},"groundingChunkIndices":[1,0]}]}}]});
        let hits = parse_grounding(&g);
        assert_eq!(hits.len(), 2);
        assert_eq!(hits[0].title, "ai.google.dev");
        assert!(hits[0].snippet.contains("15 requests") && hits[0].snippet.contains("Groq"), "{}", hits[0].snippet);
    }

    #[test]
    fn reads_the_article_not_the_furniture() {
        let html = r#"<html><head><title>Bundle by Bundle</title><style>.x{}</style></head><body>
            <nav><a href="/home">Home</a> Menu stuff</nav>
            <main><h1>Burna Boy</h1><p>Bundle by Bundle is a   song.</p><script>var a=1;</script>
            <p>Released in 2020. <a href="/lyrics">See the lyrics</a></p></main>
            <footer>© site</footer></body></html>"#;
        let t = page_text(html, "https://music.example/songs/1");
        assert!(t.starts_with("# Bundle by Bundle"), "{t}");
        assert!(t.contains("Bundle by Bundle is a song."), "{t}");
        assert!(!t.contains("var a"), "{t}");
        assert!(!t.contains("Menu stuff"), "{t}");
        assert!(t.contains("See the lyrics: https://music.example/lyrics"), "{t}");
    }

    #[test]
    fn reads_duckduckgo_results() {
        let html = r#"<div class="result results_links"><a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.com%2Fa%3Fb%3D1&rut=x">Example <b>A</b></a>
            <a class="result__snippet">The first one.</a></div>
            <div class="result result--ad"><a class="result__a" href="https://ads.example">Ad</a></div>"#;
        let hits = parse_duckduckgo(html);
        assert_eq!(hits.len(), 1);
        assert_eq!(hits[0].url, "https://example.com/a?b=1");
        assert_eq!(hits[0].title, "Example A");
        assert_eq!(hits[0].snippet, "The first one.");
    }
}

// ---------------------------------------------------------------------------
// Weather — Open-Meteo: free, no key, no account
// ---------------------------------------------------------------------------

/// Today's weather and the next few days for a place, in words.
pub fn weather(place: &str) -> Result<String> {
    let place = place.trim();
    if place.is_empty() {
        return Err(anyhow!("which town or city?"));
    }
    let c = client()?;
    let geo: serde_json::Value = c
        .get(format!("https://geocoding-api.open-meteo.com/v1/search?count=1&language=en&name={}", enc(place)))
        .send()?
        .error_for_status()?
        .json()?;
    let hit = geo["results"].get(0).ok_or_else(|| anyhow!("couldn't find a place called \"{place}\""))?;
    let (lat, lon) = (hit["latitude"].as_f64().unwrap_or(0.0), hit["longitude"].as_f64().unwrap_or(0.0));
    let name = [hit["name"].as_str(), hit["admin1"].as_str(), hit["country"].as_str()]
        .into_iter()
        .flatten()
        .collect::<Vec<_>>()
        .join(", ");
    let w: serde_json::Value = c
        .get(format!(
            "https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&timezone=auto&forecast_days=4\
             &current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m\
             &daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max"
        ))
        .send()?
        .error_for_status()?
        .json()?;
    Ok(weather_text(&name, &w))
}

/// The weather right now in `place`, short: ("Lagos", 29, "🌤️ partly cloudy").
/// Cached for half an hour — the Island asks every few seconds.
pub fn weather_now(place: &str) -> Option<(String, i64, String)> {
    static CACHE: parking_lot::Mutex<Option<(String, std::time::Instant, Option<(String, i64, String)>)>> = parking_lot::Mutex::new(None);
    let place = place.trim();
    if place.is_empty() {
        return None;
    }
    if let Some((p, at, v)) = CACHE.lock().clone() {
        if p == place && at.elapsed() < std::time::Duration::from_secs(1800) {
            return v;
        }
    }
    let fetch = || -> Result<(String, i64, String)> {
        let c = client()?;
        let geo: serde_json::Value = c
            .get(format!("https://geocoding-api.open-meteo.com/v1/search?count=1&language=en&name={}", enc(place)))
            .send()?
            .json()?;
        let hit = geo["results"].get(0).ok_or_else(|| anyhow!("no such place"))?;
        let (lat, lon) = (hit["latitude"].as_f64().unwrap_or(0.0), hit["longitude"].as_f64().unwrap_or(0.0));
        let name = hit["name"].as_str().unwrap_or(place).to_string();
        let w: serde_json::Value = c
            .get(format!("https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&timezone=auto&current=temperature_2m,weather_code"))
            .send()?
            .json()?;
        let t = w["current"]["temperature_2m"].as_f64().map(|x| x.round() as i64).ok_or_else(|| anyhow!("no reading"))?;
        let code = w["current"]["weather_code"].as_i64().unwrap_or(-1);
        Ok((name, t, format!("{} {}", sky_icon(code), sky(code))))
    };
    let v = fetch().ok();
    *CACHE.lock() = Some((place.to_string(), std::time::Instant::now(), v.clone()));
    v
}

fn sky_icon(code: i64) -> &'static str {
    match code {
        0 => "☀️",
        1 | 2 => "🌤️",
        3 => "☁️",
        45 | 48 => "🌫️",
        51..=67 | 80..=82 => "🌧️",
        71..=77 | 85 | 86 => "❄️",
        95..=99 => "⛈️",
        _ => "🌡️",
    }
}

/// Where the user lives: the city they set, else what Izuki remembers
/// ("User lives in Lagos").
pub fn home_city() -> String {
    let set = crate::state::try_store().map(|s| s.settings().home_city).unwrap_or_default();
    if !set.trim().is_empty() {
        return set.trim().to_string();
    }
    for m in crate::memory::list() {
        let l = m.text.to_lowercase();
        for p in ["lives in ", "is based in ", "is from ", "lives at ", "located in "] {
            if let Some(i) = l.find(p) {
                let rest = &m.text[i + p.len()..];
                let city: String = rest.split([',', '.', ';', '(']).next().unwrap_or("").trim().chars().take(40).collect();
                if !city.is_empty() {
                    return city;
                }
            }
        }
    }
    String::new()
}

fn weather_text(name: &str, w: &serde_json::Value) -> String {
    let cur = &w["current"];
    let num = |v: &serde_json::Value| v.as_f64().map(|x| x.round() as i64);
    let mut s = format!("Weather for {name} (Open-Meteo):\n");
    if let Some(t) = num(&cur["temperature_2m"]) {
        s.push_str(&format!(
            "Now: {t}°C ({}°F), {}, feels like {}°C, humidity {}%, wind {} km/h.\n",
            t * 9 / 5 + 32,
            sky(cur["weather_code"].as_i64().unwrap_or(-1)),
            num(&cur["apparent_temperature"]).unwrap_or(t),
            num(&cur["relative_humidity_2m"]).unwrap_or(0),
            num(&cur["wind_speed_10m"]).unwrap_or(0),
        ));
    }
    let d = &w["daily"];
    for i in 0..4 {
        let (Some(day), Some(hi), Some(lo)) = (d["time"][i].as_str(), num(&d["temperature_2m_max"][i]), num(&d["temperature_2m_min"][i])) else {
            break;
        };
        let rain = num(&d["precipitation_probability_max"][i]).unwrap_or(0);
        let label = match i {
            0 => "Today".to_string(),
            1 => "Tomorrow".to_string(),
            _ => day.to_string(),
        };
        s.push_str(&format!("{label}: {} — high {hi}°C, low {lo}°C, {rain}% chance of rain.\n", sky(d["weather_code"][i].as_i64().unwrap_or(-1))));
    }
    s
}

/// WMO weather code → words.
fn sky(code: i64) -> &'static str {
    match code {
        0 => "clear sky",
        1 => "mostly clear",
        2 => "partly cloudy",
        3 => "cloudy",
        45 | 48 => "foggy",
        51..=57 => "drizzle",
        61 | 63 | 80 | 81 => "rain",
        65 | 82 => "heavy rain",
        66 | 67 => "freezing rain",
        71..=77 | 85 | 86 => "snow",
        95..=99 => "thunderstorms",
        _ => "mixed weather",
    }
}

#[cfg(test)]
mod weather_tests {
    #[test]
    fn says_the_weather_in_words() {
        let w = serde_json::json!({
            "current": { "temperature_2m": 31.4, "apparent_temperature": 35.0, "relative_humidity_2m": 70, "weather_code": 2, "wind_speed_10m": 11.2 },
            "daily": { "time": ["2026-09-27", "2026-09-28"], "weather_code": [95, 61],
                       "temperature_2m_max": [32.0, 29.6], "temperature_2m_min": [24.1, 23.0], "precipitation_probability_max": [80, 55] }
        });
        let t = super::weather_text("Lagos, Nigeria", &w);
        assert!(t.contains("Now: 31°C (87°F), partly cloudy, feels like 35°C"), "{t}");
        assert!(t.contains("Today: thunderstorms — high 32°C, low 24°C, 80% chance of rain."), "{t}");
        assert!(t.contains("Tomorrow: rain"), "{t}");
    }
}
