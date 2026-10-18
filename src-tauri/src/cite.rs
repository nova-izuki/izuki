//! APA 7 references, from the real source — never made up.
//!
//! "Cite this page in APA", "APA reference for 10.1037/…", "cite ISBN
//! 9781284…": the details come from the source itself (Crossref for a DOI,
//! Open Library for an ISBN, the page's own author/date/title tags for a web
//! page), then they're put together the APA 7 way, with the in-text citation.
//! What the source doesn't say is never invented: no date is "(n.d.)", and
//! anything worth checking is said.

use std::time::Duration;

use anyhow::{anyhow, bail, Result};
use serde_json::Value;

#[derive(Debug, Clone, Default, PartialEq)]
pub struct Source {
    /// People as (family, given) — or one group name in `group`.
    pub authors: Vec<(String, String)>,
    pub group: Option<String>,
    pub year: Option<String>,
    /// "October 17" for web pages and news (APA gives month and day there).
    pub month_day: Option<String>,
    pub title: String,
    /// Journal or website name.
    pub container: Option<String>,
    pub volume: Option<String>,
    pub issue: Option<String>,
    pub pages: Option<String>,
    pub publisher: Option<String>,
    pub edition: Option<String>,
    pub doi: Option<String>,
    pub url: Option<String>,
    pub kind: Kind,
}

#[derive(Debug, Clone, Copy, Default, PartialEq)]
pub enum Kind {
    Journal,
    Book,
    #[default]
    Web,
}

fn client() -> Result<reqwest::blocking::Client> {
    Ok(reqwest::blocking::Client::builder().timeout(Duration::from_secs(15)).user_agent("Izuki/1.0 (mailto:hello@nova-izuki.github.io)").build()?)
}

/// "Ama K. Mensah" → ("Mensah", "Ama K."); "Mensah, Ama" → ("Mensah", "Ama").
pub fn split_name(full: &str) -> (String, String) {
    let full = full.trim();
    if let Some((family, given)) = full.split_once(',') {
        return (family.trim().to_string(), given.trim().to_string());
    }
    let parts: Vec<&str> = full.split_whitespace().collect();
    match parts.len() {
        0 => (String::new(), String::new()),
        1 => (parts[0].to_string(), String::new()),
        n => (parts[n - 1].to_string(), parts[..n - 1].join(" ")),
    }
}

/// "Ama Kofi" → "A. K."; "Jean-Paul" → "J.-P."
pub fn initials(given: &str) -> String {
    given
        .split_whitespace()
        .filter_map(|w| {
            let parts: Vec<String> = w.split('-').filter_map(|p| p.chars().find(|c| c.is_alphabetic()).map(|c| format!("{}.", c.to_uppercase()))).collect();
            (!parts.is_empty()).then(|| parts.join("-"))
        })
        .collect::<Vec<_>>()
        .join(" ")
}

/// The author part of the reference: "Mensah, A. K., & Osei, B." (up to 20).
pub fn authors_ref(s: &Source) -> String {
    if s.authors.is_empty() {
        return s.group.clone().unwrap_or_default();
    }
    let names: Vec<String> = s.authors.iter().take(20).map(|(f, g)| if g.is_empty() { f.clone() } else { format!("{f}, {}", initials(g)) }).collect();
    match names.len() {
        1 => names[0].clone(),
        2 => format!("{}, & {}", names[0], names[1]),
        n => format!("{}, & {}", names[..n - 1].join(", "), names[n - 1]),
    }
}

/// The in-text citation: (Mensah, 2024), (Mensah & Osei, 2024), (Mensah et al., 2024).
pub fn in_text(s: &Source) -> String {
    let year = s.year.clone().unwrap_or_else(|| "n.d.".into());
    let who = match s.authors.len() {
        0 => s.group.clone().unwrap_or_else(|| short_title(&s.title)),
        1 => s.authors[0].0.clone(),
        2 => format!("{} & {}", s.authors[0].0, s.authors[1].0),
        _ => format!("{} et al.", s.authors[0].0),
    };
    format!("({who}, {year})")
}

fn short_title(t: &str) -> String {
    let words: Vec<&str> = t.split_whitespace().take(4).collect();
    format!("*{}*", words.join(" "))
}

/// APA 7 sentence case for titles of articles, books and pages: the first
/// word, the first after a colon, and acronyms keep their capitals.
pub fn sentence_case(t: &str) -> String {
    let mut out = Vec::new();
    let mut cap_next = true;
    for w in t.split_whitespace() {
        let letters: String = w.chars().filter(|c| c.is_alphabetic()).collect();
        let acronym = letters.len() >= 2 && letters.chars().all(|c| c.is_uppercase());
        let word = if acronym {
            w.to_string()
        } else if cap_next {
            let mut c = w.chars();
            match c.next() {
                Some(f) => f.to_uppercase().collect::<String>() + &c.as_str().to_lowercase(),
                None => String::new(),
            }
        } else {
            w.to_lowercase()
        };
        cap_next = w.ends_with(':') || w.ends_with('?') || w.ends_with('!');
        out.push(word);
    }
    out.join(" ")
}

fn end_dot(s: &str) -> String {
    let s = s.trim();
    if s.ends_with(['.', '?', '!']) { s.to_string() } else { format!("{s}.") }
}

/// The reference, APA 7. Titles that APA puts in italics are wrapped in *…*.
pub fn reference(s: &Source) -> String {
    let who = authors_ref(s);
    let date = match (&s.year, &s.month_day) {
        (Some(y), Some(md)) if s.kind == Kind::Web => format!("({y}, {md})"),
        (Some(y), _) => format!("({y})"),
        _ => "(n.d.)".into(),
    };
    let title = sentence_case(&s.title);
    let lead = if who.is_empty() { format!("*{}* {date}.", end_dot(&title).trim_end_matches('.')) } else { format!("{} {date}.", end_dot(&who)) };
    // No author: the title moves to the front (APA 7), so it isn't repeated.
    let titled = !who.is_empty();
    let link = s.doi.as_ref().map(|d| format!(" https://doi.org/{d}")).or_else(|| s.url.as_ref().map(|u| format!(" {u}"))).unwrap_or_default();
    match s.kind {
        Kind::Journal => {
            let mut part = String::new();
            if let Some(j) = &s.container {
                part = format!(" *{j}*");
                if let Some(v) = &s.volume {
                    part.push_str(&format!(", *{v}*"));
                    if let Some(i) = &s.issue {
                        part.push_str(&format!("({i})"));
                    }
                }
                if let Some(p) = &s.pages {
                    part.push_str(&format!(", {p}"));
                }
                part.push('.');
            }
            format!("{lead}{}{part}{link}", if titled { format!(" {}", end_dot(&title)) } else { String::new() })
        }
        Kind::Book => {
            let ed = s.edition.as_ref().map(|e| format!(" ({e} ed.)")).unwrap_or_default();
            let book = if titled { format!(" *{}*{ed}.", title.trim_end_matches('.')) } else { String::new() };
            let publisher = s.publisher.as_ref().filter(|p| Some(p.as_str()) != s.group.as_deref()).map(|p| format!(" {}.", p.trim_end_matches('.'))).unwrap_or_default();
            format!("{lead}{book}{publisher}{link}")
        }
        Kind::Web => {
            let page = if titled { format!(" *{}*.", title.trim_end_matches('.')) } else { String::new() };
            // The site's name, unless it's also the author.
            let site = s.container.as_ref().filter(|c| Some(c.as_str()) != s.group.as_deref()).map(|c| format!(" {}.", c.trim_end_matches('.'))).unwrap_or_default();
            format!("{lead}{page}{site}{link}")
        }
    }
}

// ---------------------------------------------------------------------------
// Reading the source
// ---------------------------------------------------------------------------

/// Crossref's record for a DOI → a source (pure, so it's tested).
pub fn from_crossref(m: &Value) -> Source {
    let authors: Vec<(String, String)> = m["author"]
        .as_array()
        .map(|a| a.iter().filter_map(|p| Some((p["family"].as_str()?.to_string(), p["given"].as_str().unwrap_or("").to_string()))).collect())
        .unwrap_or_default();
    let group = m["author"].as_array().and_then(|a| a.iter().find_map(|p| p["name"].as_str().map(String::from)));
    let year = ["published-print", "published-online", "issued", "created"].iter().find_map(|k| m[*k]["date-parts"][0][0].as_i64()).map(|y| y.to_string());
    let kind = match m["type"].as_str().unwrap_or("") {
        "journal-article" => Kind::Journal,
        "book" | "monograph" | "edited-book" | "reference-book" => Kind::Book,
        _ => Kind::Journal,
    };
    let first = |k: &str| m[k].as_array().and_then(|a| a.first()).and_then(|v| v.as_str()).map(|s| s.trim().to_string()).filter(|s| !s.is_empty());
    Source {
        authors,
        group,
        year,
        title: first("title").unwrap_or_default(),
        container: first("container-title"),
        volume: m["volume"].as_str().map(String::from),
        issue: m["issue"].as_str().map(String::from),
        pages: m["page"].as_str().map(|p| p.replace('-', "–")),
        publisher: m["publisher"].as_str().map(String::from),
        doi: m["DOI"].as_str().map(|d| d.to_lowercase()),
        kind,
        ..Default::default()
    }
}

/// A web page's own tags → a source (pure, so it's tested).
pub fn from_html(html: &str, url: &str) -> Source {
    let doc = scraper::Html::parse_document(html);
    let meta = |names: &[&str]| -> Vec<String> {
        let mut out = Vec::new();
        for n in names {
            for attr in ["name", "property"] {
                if let Ok(sel) = scraper::Selector::parse(&format!("meta[{attr}=\"{n}\"]")) {
                    for e in doc.select(&sel) {
                        if let Some(c) = e.value().attr("content").map(str::trim).filter(|c| !c.is_empty()) {
                            if !out.contains(&c.to_string()) {
                                out.push(c.to_string());
                            }
                        }
                    }
                }
            }
        }
        out
    };
    let authors: Vec<(String, String)> = meta(&["citation_author", "author", "article:author", "dc.creator"])
        .into_iter()
        .filter(|a| !a.starts_with("http") && a.split_whitespace().count() <= 5)
        .map(|a| split_name(&a))
        .collect();
    let site = meta(&["og:site_name", "citation_journal_title", "application-name"]).into_iter().next();
    let date = meta(&["citation_publication_date", "article:published_time", "datePublished", "dc.date", "date", "citation_date"]).into_iter().next();
    let (year, month_day) = date
        .as_deref()
        .and_then(|d| {
            let d = d.trim().get(..10).unwrap_or(d.trim()).replace('/', "-");
            chrono::NaiveDate::parse_from_str(&d, "%Y-%m-%d").ok().map(|nd| (nd.format("%Y").to_string(), Some(nd.format("%B %-d").to_string())))
                .or_else(|| d.get(..4).filter(|y| y.chars().all(|c| c.is_ascii_digit())).map(|y| (y.to_string(), None)))
        })
        .map(|(y, md)| (Some(y), md))
        .unwrap_or((None, None));
    let title = meta(&["citation_title", "og:title", "twitter:title"]).into_iter().next().or_else(|| {
        scraper::Selector::parse("title").ok().and_then(|s| doc.select(&s).next().map(|t| t.text().collect::<String>().trim().to_string()))
    });
    let mut title = title.unwrap_or_default();
    // "Page title | Site" → "Page title".
    if let Some(site) = &site {
        for sep in [" | ", " - ", " — ", " – "] {
            if let Some(stripped) = title.strip_suffix(&format!("{sep}{site}")) {
                title = stripped.to_string();
            }
        }
    }
    let doi = meta(&["citation_doi", "dc.identifier"]).into_iter().find(|d| d.contains("10.")).map(|d| d.trim_start_matches("doi:").trim_start_matches("https://doi.org/").to_lowercase());
    let journal = meta(&["citation_journal_title"]).into_iter().next();
    let group = if authors.is_empty() { site.clone() } else { None };
    Source {
        authors,
        group,
        year,
        month_day,
        title,
        container: journal.clone().or(site),
        volume: meta(&["citation_volume"]).into_iter().next(),
        issue: meta(&["citation_issue"]).into_iter().next(),
        pages: meta(&["citation_firstpage"]).into_iter().next().map(|f| match meta(&["citation_lastpage"]).into_iter().next() {
            Some(l) => format!("{f}–{l}"),
            None => f,
        }),
        doi,
        url: Some(url.to_string()),
        kind: if journal.is_some() { Kind::Journal } else { Kind::Web },
        ..Default::default()
    }
}

/// What was asked to be cited: a DOI, an ISBN, a web address — or nothing (the page in front).
#[derive(Debug, Clone, PartialEq)]
pub enum Target {
    Doi(String),
    Isbn(String),
    Url(String),
    ThisPage,
    /// "ISBN" was said, but no valid one followed it.
    BadIsbn,
}

/// The ISBN right after the word "ISBN" (hyphens and spaces allowed); an X
/// only as the last character of a 10-character one.
pub fn isbn_after(said: &str) -> Option<String> {
    let lower = said.to_lowercase();
    let at = lower.find("isbn")? + 4;
    let rest = said[at..].trim_start_matches([':', ' ', '-', '#']);
    let mut digits = String::new();
    for c in rest.chars() {
        if c.is_ascii_digit() || ((c == 'X' || c == 'x') && digits.len() == 9) {
            digits.push(c.to_ascii_uppercase());
        } else if c == '-' || c == ' ' {
            if digits.len() >= 13 {
                break;
            }
            continue;
        } else {
            break;
        }
        if digits.len() == 13 {
            break;
        }
    }
    let ok10 = digits.len() == 10 && digits[..9].chars().all(|c| c.is_ascii_digit());
    let ok13 = digits.len() == 13 && digits.chars().all(|c| c.is_ascii_digit());
    (ok10 || ok13).then_some(digits)
}

pub fn target_of(said: &str) -> Target {
    let words: Vec<&str> = said.split_whitespace().collect();
    if let Some(d) = words.iter().find_map(|w| {
        let w = w.trim_matches(|c: char| c == '(' || c == ')' || c == ',' || c == ';' || c == '<' || c == '>');
        let w = w.trim_start_matches("https://doi.org/").trim_start_matches("http://doi.org/").trim_start_matches("doi:");
        (w.starts_with("10.") && w.contains('/')).then(|| w.trim_end_matches('.').to_lowercase())
    }) {
        return Target::Doi(d);
    }
    if said.to_lowercase().contains("isbn") {
        return isbn_after(said).map(Target::Isbn).unwrap_or(Target::BadIsbn);
    }
    if let Some(u) = words.iter().find(|w| w.starts_with("http://") || w.starts_with("https://") || (w.starts_with("www.") && w.contains('.'))) {
        let u = u.trim_end_matches(['.', ',', ')']);
        return Target::Url(if u.starts_with("www.") { format!("https://{u}") } else { u.to_string() });
    }
    Target::ThisPage
}

/// A request for a citation: APA (the word) with a citing word, or "cite"
/// with a source (a link, DOI, ISBN, or "this page/article/book").
pub fn asks(said: &str) -> bool {
    let lower = said.to_lowercase();
    let words: Vec<&str> = lower.split(|c: char| !c.is_alphanumeric()).filter(|w| !w.is_empty()).collect();
    let has = |w: &str| words.contains(&w);
    let apa = has("apa");
    let citing = has("cite") || has("citation") || has("citations") || has("reference") || has("references") || has("bibliography") || lower.contains("works cited");
    let verb = has("cite") || has("citation") || has("citations");
    let source = lower.contains("isbn")
        || lower.contains("http://")
        || lower.contains("https://")
        || lower.contains("www.")
        || words.windows(2).any(|w| w[0].starts_with("10") && w[0].len() == 2 && lower.contains("10."))
        || ["this page", "this article", "this source", "this website", "this site", "this book", "this paper", "this journal"].iter().any(|p| lower.contains(p));
    (apa && citing) || (verb && source)
}

fn crossref(doi: &str) -> Result<Source> {
    let res = client()?.get(format!("https://api.crossref.org/works/{doi}")).send()?;
    if res.status() == reqwest::StatusCode::NOT_FOUND {
        bail!("Crossref doesn't know that DOI ({doi}) — check it's typed right");
    }
    let v: Value = res.error_for_status()?.json()?;
    if v["status"].as_str() != Some("ok") {
        bail!("Crossref doesn't know that DOI ({doi}) — check it's typed right");
    }
    Ok(from_crossref(&v["message"]))
}

fn open_library(isbn: &str) -> Result<Source> {
    let c = client()?;
    let v: Value = c.get(format!("https://openlibrary.org/isbn/{isbn}.json")).send()?.json().map_err(|_| anyhow!("Open Library doesn't have ISBN {isbn}"))?;
    let mut authors = Vec::new();
    for a in v["authors"].as_array().cloned().unwrap_or_default().iter().take(10) {
        if let Some(key) = a["key"].as_str() {
            if let Ok(p) = c.get(format!("https://openlibrary.org{key}.json")).send().and_then(|r| r.json::<Value>()) {
                if let Some(n) = p["name"].as_str() {
                    authors.push(split_name(n));
                }
            }
        }
    }
    let year = v["publish_date"].as_str().and_then(|d| d.split(|c: char| !c.is_ascii_digit()).find(|p| p.len() == 4).map(String::from));
    let edition = v["edition_name"].as_str().map(|e| e.trim_end_matches(" ed.").trim_end_matches(" edition").trim_end_matches(" Edition").to_string());
    let title = match v["subtitle"].as_str() {
        Some(sub) => format!("{}: {sub}", v["title"].as_str().unwrap_or("")),
        None => v["title"].as_str().unwrap_or("").to_string(),
    };
    Ok(Source {
        authors,
        year,
        title,
        publisher: v["publishers"][0].as_str().map(String::from),
        edition,
        kind: Kind::Book,
        ..Default::default()
    })
}

fn web(url: &str) -> Result<Source> {
    let html = client()?.get(url).send()?.text()?;
    let s = from_html(&html, url);
    // A journal article page that names its DOI: Crossref has the full record.
    if let Some(doi) = s.doi.clone() {
        if let Ok(full) = crossref(&doi) {
            return Ok(full);
        }
    }
    Ok(s)
}

pub fn handle(said: &str) -> String {
    let target = match target_of(said) {
        Target::ThisPage => match crate::ext::snapshot().map(|p| p.url).filter(|u| u.starts_with("http")) {
            Some(u) => Target::Url(u),
            None => {
                return "Which source? Paste its web address, DOI or ISBN — or open the page in Chrome or Edge with the Izuki extension and say “cite this page in APA”.".into();
            }
        },
        t => t,
    };
    let got = match &target {
        Target::Doi(d) => crossref(d),
        Target::Isbn(i) => open_library(i),
        Target::Url(u) => web(u),
        Target::ThisPage => unreachable!(),
        Target::BadIsbn => return "I couldn't read that ISBN — it's the 10 or 13 digits after “ISBN” on the back cover or copyright page (like 978-1-284-11645-8).".into(),
    };
    let s = match got {
        Ok(s) if !s.title.trim().is_empty() => s,
        Ok(_) => return "I couldn't find that source's title, so I won't guess a reference. Paste its DOI or ISBN if it has one.".into(),
        Err(e) => return format!("I couldn't read that source ({e}). I won't make up a reference — check the address, DOI or ISBN."),
    };
    let r = reference(&s);
    let mut checks = Vec::new();
    if s.year.is_none() {
        checks.push("no date was published, so it's (n.d.)");
    }
    if s.authors.is_empty() && s.group.is_none() {
        checks.push("no author was listed");
    }
    checks.push("titles are in sentence case — capitalize names of people, places and organizations in the title yourself");
    let saved = crate::notes::add_to_log("References (APA)", "APA", &format!("{r}\n  In-text: {}", in_text(&s)));
    format!(
        "📚 APA 7 reference:\n{r}\n\nIn-text: {}\n\nCheck: {}.\n{}",
        in_text(&s),
        checks.join("; "),
        if saved.is_ok() { "(Saved to today's “References (APA)” note. *Asterisks* mark what goes in italics.)" } else { "(*Asterisks* mark what goes in italics.)" }
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn names_and_authors() {
        assert_eq!(split_name("Ama K. Mensah"), ("Mensah".into(), "Ama K.".into()));
        assert_eq!(initials("Jean-Paul Kofi"), "J.-P. K.");
        let s = Source { authors: vec![("Mensah".into(), "Ama".into()), ("Osei".into(), "Kwame B.".into()), ("Lee".into(), "Jo".into())], year: Some("2024".into()), ..Default::default() };
        assert_eq!(authors_ref(&s), "Mensah, A., Osei, K. B., & Lee, J.");
        assert_eq!(in_text(&s), "(Mensah et al., 2024)");
        assert_eq!(sentence_case("Security Awareness In HIPAA Programs: A Review"), "Security awareness in HIPAA programs: A review");
    }

    #[test]
    fn journal_article_from_crossref() {
        let m = json!({ "type": "journal-article", "title": ["Phishing Awareness Training in Hospitals"], "container-title": ["Journal of Health Informatics"],
            "author": [{ "given": "Ama", "family": "Mensah" }, { "given": "Kwame", "family": "Osei" }],
            "published-print": { "date-parts": [[2023, 4]] }, "volume": "12", "issue": "3", "page": "45-60", "DOI": "10.1234/JHI.2023.45" });
        let s = from_crossref(&m);
        assert_eq!(
            reference(&s),
            "Mensah, A., & Osei, K. (2023). Phishing awareness training in hospitals. *Journal of Health Informatics*, *12*(3), 45–60. https://doi.org/10.1234/jhi.2023.45"
        );
        assert_eq!(in_text(&s), "(Mensah & Osei, 2023)");
    }

    #[test]
    fn book_and_web_page() {
        let b = Source { authors: vec![("Kim".into(), "David".into())], year: Some("2021".into()), title: "Fundamentals of Information Systems Security".into(), edition: Some("4th".into()), publisher: Some("Jones & Bartlett Learning".into()), kind: Kind::Book, ..Default::default() };
        assert_eq!(reference(&b), "Kim, D. (2021). *Fundamentals of information systems security* (4th ed.). Jones & Bartlett Learning.");
        let html = r#"<html><head><title>Security Awareness Training | HHS.gov</title><meta property="og:site_name" content="HHS.gov"><meta property="article:published_time" content="2024-03-05T10:00:00Z"></head></html>"#;
        let s = from_html(html, "https://www.hhs.gov/security/awareness");
        assert_eq!(reference(&s), "HHS.gov. (2024, March 5). *Security awareness training*. https://www.hhs.gov/security/awareness");
        assert_eq!(in_text(&s), "(HHS.gov, 2024)");
        let undated = from_html("<html><head><title>Password Tips</title></head></html>", "https://example.org/tips");
        assert_eq!(reference(&undated), "*Password tips* (n.d.). https://example.org/tips");
    }

    #[test]
    fn hears_what_to_cite() {
        assert_eq!(target_of("APA reference for https://doi.org/10.1234/ABC.5"), Target::Doi("10.1234/abc.5".into()));
        assert_eq!(target_of("cite ISBN 978-1-284-11645-8 in APA"), Target::Isbn("9781284116458".into()));
        assert_eq!(target_of("cite https://www.hhs.gov/x in apa"), Target::Url("https://www.hhs.gov/x".into()));
        assert_eq!(target_of("cite this page in APA"), Target::ThisPage);
        assert!(asks("cite this page in APA"));
        assert!(asks("make an APA reference for 10.1234/abc"));
        assert!(!asks("give me a reference letter template"));
        assert!(!asks("find me an apartment near campus"));
        assert!(!asks("what is APA style"), "a question about APA, not a citation");
        assert!(!asks("my reference number is 10.5 and see https://x.com"), "a reference number isn't a citation ask");
        assert!(asks("cite https://www.hhs.gov/x"));
        assert_eq!(target_of("cite www.hhs.gov/x"), Target::Url("https://www.hhs.gov/x".into()));
        assert_eq!(target_of("cite ISBN 978-1-284-11645-8 for my class of 2026"), Target::Isbn("9781284116458".into()), "only the digits after ISBN");
        assert_eq!(target_of("cite isbn please"), Target::BadIsbn);
        assert_eq!(isbn_after("ISBN: 0-306-40615-X"), Some("030640615X".into()));
    }
}
