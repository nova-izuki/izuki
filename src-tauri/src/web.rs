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

pub struct Hit {
    pub title: String,
    pub url: String,
    pub snippet: String,
}

/// Search the web — DuckDuckGo first, Bing if that's unavailable.
pub fn search(query: &str) -> Result<Vec<Hit>> {
    let q = query.trim();
    if q.is_empty() {
        return Err(anyhow!("nothing to search for"));
    }
    match duckduckgo(q) {
        Ok(h) if !h.is_empty() => Ok(h),
        _ => bing(q),
    }
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
                url: a.value().attr("href")?.to_string(),
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
    let url = url.trim().trim_matches(|c| c == '<' || c == '>');
    let url = if url.starts_with("http") { url.to_string() } else { format!("https://{url}") };
    let res = client()?.get(&url).send()?;
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
        return Ok(clip(&body, PAGE_CHARS));
    }
    Ok(page_text(&body, &url))
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
