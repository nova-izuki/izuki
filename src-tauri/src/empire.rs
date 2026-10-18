//! Empire — Izuki for running a business, starting with what's real today:
//!
//! - **Your businesses**: name, what it does, website, goals, hours — each
//!   kept on its own (`%APPDATA%\Izuki\empire.json`), so two never mix.
//! - **"Check my website"**: a real check of the site — up or down, how
//!   fast, HTTPS, broken links on the home page, a missing title,
//!   description or mobile setting, a sitemap and robots.txt — compared with
//!   the last check, so a slowdown or an outage stands out.
//! - **"What needs my attention?"**: one briefing from what's really
//!   connected — approvals waiting, important unread email, today's
//!   reminders, missions, account problems and your website — and it always
//!   says what it checked and what it couldn't.
//!
//! Read only: nothing is bought, sent, posted or changed here. Shop and
//! payment platforms come later, one at a time, when there's a business to
//! connect.

use std::time::{Duration, Instant};

use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Business {
    pub id: String,
    pub name: String,
    /// What it does, in the owner's words.
    #[serde(default)]
    pub what: String,
    #[serde(default)]
    pub website: String,
    #[serde(default)]
    pub goals: Vec<String>,
    /// "Mon–Fri 9–5"…
    #[serde(default)]
    pub hours: String,
    /// The last website checks, newest last (at most 20).
    #[serde(default)]
    pub checks: Vec<SiteCheck>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct SiteCheck {
    /// Unix ms.
    pub at: i64,
    pub url: String,
    pub up: bool,
    /// HTTP status (0: no answer).
    pub status: u16,
    pub ms: u64,
    pub https: bool,
    pub bytes: usize,
    pub title: String,
    /// Plain-English problems, each with what to do.
    pub issues: Vec<String>,
    /// Links on the home page that failed: (url, why).
    pub broken: Vec<(String, String)>,
    /// How many home-page links were tried.
    pub links_checked: usize,
    #[serde(default)]
    pub error: String,
}

fn path() -> std::path::PathBuf {
    crate::store::data_dir().join("empire.json")
}

pub fn businesses() -> Vec<Business> {
    std::fs::read_to_string(path()).ok().and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default()
}

fn save_all(all: &[Business]) -> Result<()> {
    let p = path();
    let _ = std::fs::create_dir_all(crate::store::data_dir());
    let tmp = p.with_extension("json.tmp");
    std::fs::write(&tmp, serde_json::to_string_pretty(all)?)?;
    std::fs::rename(&tmp, &p)?;
    Ok(())
}

static TURN: parking_lot::Mutex<()> = parking_lot::Mutex::new(());

/// Add or update a business (by id; a new one gets an id).
pub fn save_business(mut b: Business) -> Result<Vec<Business>> {
    let _turn = TURN.lock();
    b.name = b.name.trim().chars().take(80).collect();
    if b.name.is_empty() {
        return Err(anyhow!("give the business a name"));
    }
    b.website = b.website.trim().to_string();
    let mut all = businesses();
    if b.id.is_empty() {
        b.id = uuid::Uuid::new_v4().simple().to_string();
        all.push(b);
    } else if let Some(x) = all.iter_mut().find(|x| x.id == b.id) {
        let checks = std::mem::take(&mut x.checks);
        *x = Business { checks, ..b };
    } else {
        return Err(anyhow!("that business isn't here any more"));
    }
    save_all(&all)?;
    Ok(all)
}

pub fn remove_business(id: &str) -> Result<Vec<Business>> {
    let _turn = TURN.lock();
    let mut all = businesses();
    all.retain(|b| b.id != id);
    save_all(&all)?;
    Ok(all)
}

/// "example.com" → "https://example.com/".
pub fn normalize(url: &str) -> Option<String> {
    let u = url.trim().trim_end_matches('/');
    if u.is_empty() || u.contains(' ') || !u.contains('.') {
        return None;
    }
    Some(if u.starts_with("http://") || u.starts_with("https://") { format!("{u}/") } else { format!("https://{u}/") })
}

fn host_of(url: &str) -> String {
    url.split("://").nth(1).unwrap_or(url).split('/').next().unwrap_or("").trim_start_matches("www.").to_lowercase()
}

fn client() -> Result<reqwest::blocking::Client> {
    Ok(reqwest::blocking::Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 Izuki-site-check")
        .timeout(Duration::from_secs(15))
        .connect_timeout(Duration::from_secs(8))
        .build()?)
}

/// What the home page says about itself (pure, so it's tested): title,
/// issues, and its links on the same site.
pub fn read_page(html: &str, base: &str) -> (String, Vec<String>, Vec<String>) {
    use scraper::{Html, Selector};
    let doc = Html::parse_document(html);
    let sel = |s: &str| Selector::parse(s).expect("selector");
    let title = doc.select(&sel("title")).next().map(|t| t.text().collect::<String>().split_whitespace().collect::<Vec<_>>().join(" ")).unwrap_or_default();
    let meta = |name: &str| doc.select(&sel(&format!("meta[name=\"{name}\"]"))).next().and_then(|m| m.value().attr("content")).map(str::trim).filter(|c| !c.is_empty()).map(str::to_string);
    let mut issues = Vec::new();
    if title.is_empty() {
        issues.push("No page title — add a <title> (it's what shows in Google and on the browser tab).".to_string());
    } else if title.chars().count() > 65 {
        issues.push(format!("The title is long ({} characters) — Google cuts it after about 60.", title.chars().count()));
    }
    match meta("description") {
        None => issues.push("No meta description — add one (one or two sentences) so Google shows what you do.".to_string()),
        Some(d) if d.chars().count() > 160 => issues.push("The meta description is long — Google shows about 155 characters.".to_string()),
        _ => {}
    }
    if meta("viewport").is_none() {
        issues.push("No mobile viewport setting — the page may look tiny on phones (add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">).".to_string());
    }
    let h1 = doc.select(&sel("h1")).count();
    if h1 == 0 {
        issues.push("No main heading (h1) — add one that says what you do.".to_string());
    }
    let no_alt = doc.select(&sel("img")).filter(|i| i.value().attr("alt").is_none_or(|a| a.trim().is_empty())).count();
    if no_alt > 0 {
        issues.push(format!("{no_alt} image{} without a description (alt text) — screen readers and Google can't tell what {} show.", if no_alt == 1 { "" } else { "s" }, if no_alt == 1 { "it" } else { "they" }));
    }
    let host = host_of(base);
    let page = reqwest::Url::parse(base).ok();
    let mut links: Vec<String> = Vec::new();
    for a in doc.select(&sel("a[href]")) {
        let href = a.value().attr("href").unwrap_or("").trim();
        if href.is_empty() || href.starts_with('#') {
            continue;
        }
        // Resolved the way a browser does (relative to this page's path).
        let Some(mut url) = page.as_ref().and_then(|p| p.join(href).ok()) else { continue };
        if url.scheme() != "http" && url.scheme() != "https" {
            continue; // mailto:, tel:, javascript:…
        }
        url.set_fragment(None);
        let abs = url.to_string();
        if host_of(&abs) == host && !links.contains(&abs) {
            links.push(abs);
        }
    }
    (title, issues, links)
}

/// Check a website for real.
pub fn check_site(url: &str) -> SiteCheck {
    let raw_url = url;
    let Some(url) = normalize(url) else {
        return SiteCheck { url: url.to_string(), error: "that doesn't look like a web address".into(), at: crate::model::now_ms(), ..Default::default() };
    };
    let mut c = SiteCheck { at: crate::model::now_ms(), url: url.clone(), ..Default::default() };
    let Ok(client) = client() else {
        c.error = "couldn't start the check".into();
        return c;
    };
    let started = Instant::now();
    // No scheme given and HTTPS doesn't connect: try plain http once.
    let typed_scheme = raw_url.trim().starts_with("http://") || raw_url.trim().starts_with("https://");
    let first = client.get(&url).send();
    let first = match first {
        Err(e) if !typed_scheme && e.is_connect() => {
            let http = url.replacen("https://", "http://", 1);
            match client.get(&http).send() {
                Ok(r) => {
                    c.url = http;
                    Ok(r)
                }
                Err(_) => Err(e),
            }
        }
        r => r,
    };
    let res = match first {
        Ok(r) => r,
        Err(e) => {
            c.ms = started.elapsed().as_millis() as u64;
            c.error = if e.is_timeout() { "it didn't answer within 15 seconds".into() } else if e.is_connect() { "couldn't connect — the site may be down, or the address is wrong".into() } else { e.to_string().chars().take(140).collect() };
            return c;
        }
    };
    c.status = res.status().as_u16();
    c.https = res.url().scheme() == "https";
    let final_url = res.url().to_string();
    let body = res.text().unwrap_or_default();
    c.ms = started.elapsed().as_millis() as u64;
    c.bytes = body.len();
    c.up = (200..400).contains(&c.status);
    if !c.up {
        c.error = format!("it answered {} instead of the page", c.status);
        return c;
    }
    if !c.https {
        c.issues.push("It isn't using HTTPS — browsers mark it \"Not secure\". Turn on HTTPS (most hosts do it free).".into());
    }
    if c.ms > 3000 {
        c.issues.push(format!("Slow: the home page took {:.1} s — under 2 s keeps visitors (compress images, use caching).", c.ms as f64 / 1000.0));
    }
    if c.bytes > 3_000_000 {
        c.issues.push(format!("The home page is heavy ({:.1} MB of HTML) — large pages load slowly on phones.", c.bytes as f64 / 1_000_000.0));
    }
    let (title, issues, links) = read_page(&body, &final_url);
    c.title = title;
    c.issues.extend(issues);
    // robots.txt and a sitemap.
    let origin = final_url.split('/').take(3).collect::<Vec<_>>().join("/");
    let exists = |p: &str| client.get(format!("{origin}{p}")).send().map(|r| r.status().is_success()).unwrap_or(false);
    if !exists("/sitemap.xml") && !exists("/sitemap_index.xml") {
        c.issues.push("No sitemap.xml — add one so Google finds all your pages.".into());
    }
    if !exists("/robots.txt") {
        c.issues.push("No robots.txt — small, but it tells search engines what to look at.".into());
    }
    // The home page's own links, 8 at a time (at most 25).
    let tried: Vec<String> = links.into_iter().take(25).collect();
    c.links_checked = tried.len();
    for batch in tried.chunks(8) {
        let results: Vec<(String, Option<String>)> = std::thread::scope(|s| {
            let jobs: Vec<_> = batch
                .iter()
                .map(|l| {
                    let client = client.clone();
                    (l.clone(), s.spawn(move || match client.head(l).send() {
                        Ok(r) if r.status().as_u16() == 405 || r.status().as_u16() == 403 => match client.get(l).send() {
                            Ok(r2) if r2.status().as_u16() >= 400 => Some(format!("answered {}", r2.status().as_u16())),
                            Ok(_) => None,
                            Err(e) => Some(if e.is_timeout() { "timed out".into() } else { "didn't load".into() }),
                        },
                        Ok(r) if r.status().as_u16() >= 400 => Some(format!("answered {}", r.status().as_u16())),
                        Ok(_) => None,
                        Err(e) => Some(if e.is_timeout() { "timed out".into() } else { "didn't load".into() }),
                    }))
                })
                .collect();
            jobs.into_iter().map(|(l, j)| (l, j.join().unwrap_or(Some("check crashed".into())))).collect()
        });
        for (l, bad) in results {
            if let Some(why) = bad {
                c.broken.push((l, why));
            }
        }
    }
    if !c.broken.is_empty() {
        c.issues.push(format!("{} broken link{} on the home page — fix or remove {}.", c.broken.len(), if c.broken.len() == 1 { "" } else { "s" }, if c.broken.len() == 1 { "it" } else { "them" }));
    }
    c
}

/// Check a business's website and remember it (the last 20).
pub fn check_business(id: &str) -> Result<SiteCheck> {
    let b = businesses().into_iter().find(|b| b.id == id).ok_or_else(|| anyhow!("that business isn't here any more"))?;
    if b.website.trim().is_empty() {
        return Err(anyhow!("{} has no website set — add it first", b.name));
    }
    let c = check_site(&b.website);
    let _turn = TURN.lock();
    let mut all = businesses();
    if let Some(x) = all.iter_mut().find(|x| x.id == id) {
        x.checks.push(c.clone());
        let n = x.checks.len();
        if n > 20 {
            x.checks.drain(..n - 20);
        }
    }
    save_all(&all)?;
    drop(_turn);
    crate::island::refresh_glance();
    eprintln!("[empire] checked a website: {}, {} ms, {} issue(s), {} broken link(s)", if c.up { "up" } else { "DOWN" }, c.ms, c.issues.len(), c.broken.len());
    Ok(c)
}

/// Businesses whose website was down at its last check: (name, url). A site
/// you've checked before is looked at again first when that check is old:
/// 3 hours while it was up, 25 minutes while it was down (so the alert clears
/// soon after it's back). A site never checked waits for you to check it.
pub fn sites_down() -> Vec<(String, String)> {
    let now = crate::model::now_ms();
    for b in businesses() {
        let stale = match b.checks.last() {
            None => false,
            Some(c) => now - c.at > if c.up { 3 * 3600 * 1000 } else { 25 * 60 * 1000 },
        };
        if !b.website.trim().is_empty() && stale {
            if let Err(e) = check_business(&b.id) {
                eprintln!("[empire] background check: {e}");
            }
        }
    }
    businesses()
        .into_iter()
        .filter(|b| !b.website.trim().is_empty())
        .filter_map(|b| {
            let c = b.checks.last()?;
            (!c.up).then(|| (b.name.clone(), c.url.clone()))
        })
        .collect()
}

/// The check in words, compared with the one before (pure, so it's tested).
pub fn say_check(name: &str, c: &SiteCheck, before: Option<&SiteCheck>) -> String {
    if !c.up {
        let was = before.filter(|b| b.up).map(|_| " It was up at the last check.").unwrap_or("");
        return format!("⚠️ {name}'s website ({}) is DOWN — {}.{was}", c.url, if c.error.is_empty() { "no answer".into() } else { c.error.clone() });
    }
    let mut out = format!("✅ {name}'s website is up — {} in {:.1} s{}.", c.url, c.ms as f64 / 1000.0, if c.https { ", secure (HTTPS)" } else { "" });
    if let Some(b) = before.filter(|b| b.up && b.ms > 0) {
        if c.ms > b.ms * 2 && c.ms > 1500 {
            out.push_str(&format!(" That's slower than last time ({:.1} s).", b.ms as f64 / 1000.0));
        }
    }
    if c.links_checked > 0 {
        out.push_str(&format!(" Checked {} link{} on the home page{}.", c.links_checked, if c.links_checked == 1 { "" } else { "s" }, if c.broken.is_empty() { " — none broken" } else { "" }));
    }
    if c.issues.is_empty() {
        out.push_str(" No problems found.");
    } else {
        out.push_str(&format!("\nTo fix ({}):", c.issues.len()));
        for i in c.issues.iter().take(8) {
            out.push_str(&format!("\n• {i}"));
        }
        for (l, why) in c.broken.iter().take(5) {
            out.push_str(&format!("\n   ↳ {l} ({why})"));
        }
    }
    out
}

/// "What needs my attention?" — from what's really connected, saying what
/// was checked and what couldn't be.
pub fn attention() -> String {
    let mut lines: Vec<String> = Vec::new();
    let mut checked: Vec<String> = Vec::new();
    let mut not: Vec<String> = Vec::new();
    // Approvals waiting.
    let waiting: Vec<crate::approvals::Approval> = crate::approvals::list().into_iter().filter(|a| a.state == "waiting").collect();
    checked.push("approvals".into());
    for a in waiting.iter().take(3) {
        lines.push(format!("✋ {} is waiting for your OK: {}", a.app, crate::island::approval_summary(&a.draft)));
    }
    // Email.
    match crate::mail::brief() {
        Ok(b) => {
            checked.push(if b.found.checked.len() == 1 { "email".into() } else { format!("email ({} accounts)", b.found.checked.len()) });
            for (m, why) in b.important.iter().take(4) {
                lines.push(format!("📧 {} ({why})", crate::mail::line(m, b.found.checked.len() > 1)));
            }
            if b.unread > b.important.len() {
                lines.push(format!("📧 {} other unread email{} from the last day.", b.unread - b.important.len(), if b.unread - b.important.len() == 1 { "" } else { "s" }));
            }
            for (acc, why) in &b.found.failed {
                not.push(format!("email in {acc} ({why})"));
            }
        }
        Err(e) => not.push(format!("email ({})", e.to_string().lines().next().unwrap_or("not linked"))),
    }
    // Reminders today.
    let now = crate::model::now_ms();
    let end = now + 18 * 3600 * 1000;
    let today: Vec<crate::reminders::Reminder> = crate::reminders::list().into_iter().filter(|r| r.at >= now && r.at <= end).collect();
    checked.push("reminders".into());
    for r in today.iter().take(4) {
        lines.push(format!("⏰ {} — {}", r.text, crate::reminders::describe_time(r.at)));
    }
    // Missions.
    if let Some((current, more)) = crate::missions::glance() {
        lines.push(format!("🎯 Mission running: {current}{}", if more > 0 { format!(" (+{more} waiting)") } else { String::new() }));
    }
    checked.push("missions".into());
    // Accounts that need signing in again.
    match crate::accounts::health() {
        Ok(h) => {
            checked.push("connected accounts".into());
            for a in &h.apps {
                if a.accounts.iter().any(|c| c.state == "needs_sign_in") {
                    lines.push(format!("🔐 {} needs signing in again (Apps → Account health).", a.name));
                }
            }
        }
        Err(_) => not.push("connected accounts".into()),
    }
    // Each business's website: the last check if it's fresh (6 h), else a quick look.
    for b in businesses().into_iter().filter(|b| !b.website.trim().is_empty()) {
        let fresh = b.checks.last().filter(|c| now - c.at < 6 * 3600 * 1000).cloned();
        let c = match fresh {
            Some(c) => c,
            None => match check_business(&b.id) {
                Ok(c) => c,
                Err(e) => {
                    not.push(format!("{}'s website ({e})", b.name));
                    continue;
                }
            },
        };
        checked.push(format!("{}'s website", b.name));
        if !c.up {
            lines.push(format!("🌐 {}'s website is DOWN — {}", b.name, c.error));
        } else if !c.broken.is_empty() {
            lines.push(format!("🌐 {}'s website has {} broken link{} on the home page.", b.name, c.broken.len(), if c.broken.len() == 1 { "" } else { "s" }));
        }
    }
    let mut out = if lines.is_empty() { "Nothing needs you right now. 🎉".to_string() } else { format!("Here's what needs you ({}):", lines.len()) };
    for l in &lines {
        out.push_str(&format!("\n{l}"));
    }
    out.push_str(&format!("\n\nChecked: {}.", checked.join(", ")));
    if !not.is_empty() {
        out.push_str(&format!(" Couldn't check: {}.", not.join("; ")));
    }
    out
}

// ---- Voice and chat

#[derive(Debug, Clone, PartialEq)]
pub enum Ask {
    /// "Check my website" (the first business with one), or a named site.
    CheckSite(Option<String>),
    Attention,
}

pub fn parse(said: &str) -> Option<Ask> {
    let s = format!(" {} ", said.to_lowercase().replace(['?', '!', ','], " ").split_whitespace().collect::<Vec<_>>().join(" "));
    // A named site first: "check example.org", "is example.org down?"
    let site = s.split_whitespace().find(|w| {
        w.contains('.') && !w.starts_with('.') && w.len() > 4
            && w.chars().all(|c| c.is_ascii_alphanumeric() || ".-/:".contains(c))
            && w.split('.').next_back().is_some_and(|t| t.len() >= 2 && t.chars().all(|c| c.is_ascii_alphabetic()))
    });
    if let Some(site) = site {
        let check_it = s.contains(" check ") || s.contains(" audit ");
        let up_down = s.contains(" is ") && (s.contains(" up ") || s.contains(" down "));
        if check_it || up_down {
            return Some(Ask::CheckSite(Some(site.trim_end_matches('/').to_string())));
        }
    }
    let attention = [" what needs my attention", " what needs me", " needs my attention", " business briefing", " business update", " how's my business", " hows my business", " how is my business", " check on my business"]
        .iter()
        .any(|p| s.contains(p));
    if attention {
        return Some(Ask::Attention);
    }
    let check = [" check my website", " check my site", " is my website", " is my site", " website check", " check the website", " audit my website", " audit my site"].iter().any(|p| s.contains(p));
    if check {
        return Some(Ask::CheckSite(None));
    }
    None
}

pub fn handle(ask: Ask) -> String {
    match ask {
        Ask::Attention => attention(),
        Ask::CheckSite(Some(url)) => {
            let c = check_site(&url);
            let name = host_of(&c.url);
            if c.up || !c.error.is_empty() { say_check(&name, &c, None) } else { format!("I couldn't check {url}.") }
        }
        Ask::CheckSite(None) => {
            let all = businesses();
            let Some(b) = all.iter().find(|b| !b.website.trim().is_empty()) else {
                return "Which website? Add your business in Apps → Empire (with its website), or say “check example.com”.".into();
            };
            let before = b.checks.last().cloned();
            match check_business(&b.id) {
                Ok(c) => say_check(&b.name, &c, before.as_ref()),
                Err(e) => e.to_string(),
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_a_home_page() {
        let html = r##"<html><head><title>Ama's Bakery</title></head><body><h1>Fresh bread</h1>
            <img src="a.jpg"><img src="b.jpg" alt="Sourdough">
            <a href="/menu">Menu</a><a href="https://amabakery.com/contact#form">Contact</a><a href="https://instagram.com/ama">IG</a>
            <a href="mailto:hi@x.com">Mail</a><a href="#top">Top</a><a href="/menu">Menu again</a></body></html>"##;
        let (title, issues, links) = read_page(html, "https://amabakery.com/");
        assert_eq!(title, "Ama's Bakery");
        assert!(issues.iter().any(|i| i.starts_with("No meta description")));
        assert!(issues.iter().any(|i| i.starts_with("No mobile viewport")));
        assert!(issues.iter().any(|i| i.starts_with("1 image without")));
        assert!(!issues.iter().any(|i| i.contains("main heading")));
        assert_eq!(links, vec!["https://amabakery.com/menu".to_string(), "https://amabakery.com/contact".to_string()], "only this site's own links, once each");
        let (_, _, rel) = read_page(r#"<a href="about.html">About</a><a href="../up.html">Up</a>"#, "https://amabakery.com/shop/index.html");
        assert_eq!(rel, vec!["https://amabakery.com/shop/about.html".to_string(), "https://amabakery.com/up.html".to_string()], "relative to the page's own folder");
    }

    #[test]
    fn says_a_check_plainly() {
        let up = SiteCheck { url: "https://x.com/".into(), up: true, status: 200, ms: 3400, https: true, links_checked: 12, issues: vec!["No sitemap.xml — add one.".into()], ..Default::default() };
        let before = SiteCheck { up: true, ms: 900, ..Default::default() };
        let s = say_check("Ama's Bakery", &up, Some(&before));
        assert!(s.starts_with("✅ Ama's Bakery's website is up — https://x.com/ in 3.4 s, secure (HTTPS)."), "{s}");
        assert!(s.contains("slower than last time (0.9 s)") && s.contains("Checked 12 links on the home page — none broken") && s.contains("• No sitemap.xml"), "{s}");
        let down = SiteCheck { url: "https://x.com/".into(), up: false, error: "couldn't connect".into(), ..Default::default() };
        let s = say_check("Ama's Bakery", &down, Some(&before));
        assert!(s.contains("is DOWN — couldn't connect. It was up at the last check."), "{s}");
    }

    /// A real check of a public site: `cargo test --lib live_site_check -- --ignored --nocapture`
    #[test]
    #[ignore]
    fn live_site_check() {
        let c = check_site("example.com");
        eprintln!("{}", say_check("Example", &c, None));
        assert!(c.up && c.https && c.title.contains("Example"), "{c:?}");
    }

    #[test]
    fn hears_business_asks() {
        assert_eq!(parse("what needs my attention?"), Some(Ask::Attention));
        assert_eq!(parse("give me my business briefing"), Some(Ask::Attention));
        assert_eq!(parse("check my website"), Some(Ask::CheckSite(None)));
        assert_eq!(parse("is amabakery.com down"), Some(Ask::CheckSite(Some("amabakery.com".into()))));
        assert_eq!(parse("check the website example.org please"), Some(Ask::CheckSite(Some("example.org".into()))));
        assert_eq!(parse("check example.org"), Some(Ask::CheckSite(Some("example.org".into()))));
        assert_eq!(parse("calm down, everything is fine"), None);
        assert_eq!(parse("is my site down"), Some(Ask::CheckSite(None)));
        assert_eq!(parse("check my email"), None);
        assert_eq!(parse("what time is it"), None);
        assert_eq!(normalize("amabakery.com"), Some("https://amabakery.com/".into()));
        assert_eq!(normalize("not a site"), None);
    }
}
