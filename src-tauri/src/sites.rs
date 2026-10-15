//! "Open Chrome and go to San Jac Blackboard": the right website, first try.
//!
//! What went wrong (log, Oct 14): speech heard "Sanjag" / "Sanjay", the
//! model typed a Blackboard address into Chrome's address bar, Chrome
//! finished it from history to blackboard.com/trust-center, and Enter went
//! there. Now a "go to <a website>" request is resolved here, without typing
//! into the address bar:
//! 1. an address said out loud ("go to sanjac.blackboard.com") opens as is;
//! 2. a site opened for you before opens again — matched even when speech
//!    mishears it ("sanjag blackboard" ≈ "san jac blackboard");
//! 3. otherwise the web is searched for it and the top result opens
//!    (and is remembered for next time).
//! Kept in `%APPDATA%\Izuki\sites.json`: (what you call it, the address).

use parking_lot::Mutex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Site {
    /// What you call it, tidied ("san jacinto college blackboard").
    pub name: String,
    pub url: String,
    /// How many times it's been opened (most used wins a tie).
    #[serde(default)]
    pub uses: u32,
}

static LOCK: Mutex<()> = Mutex::new(());
/// The last site opened (what "wrong site" refers to).
static LAST: Mutex<Option<String>> = Mutex::new(None);

fn path() -> std::path::PathBuf {
    crate::store::data_dir().join("sites.json")
}

pub fn list() -> Vec<Site> {
    std::fs::read_to_string(path()).ok().and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default()
}

fn save(all: &[Site]) {
    let p = path();
    let tmp = p.with_extension("json.tmp");
    if std::fs::write(&tmp, serde_json::to_string_pretty(all).unwrap_or_default()).is_ok() {
        let _ = std::fs::rename(&tmp, &p);
    }
}

/// Lower case, words only.
fn tidy(s: &str) -> String {
    s.to_lowercase().chars().map(|c| if c.is_alphanumeric() { c } else { ' ' }).collect::<String>().split_whitespace().collect::<Vec<_>>().join(" ")
}

/// Letters only, no spaces ("san jac" and "sanjac" are the same).
fn squash(s: &str) -> String {
    tidy(s).replace(' ', "")
}

fn edits(a: &str, b: &str) -> usize {
    let (a, b): (Vec<char>, Vec<char>) = (a.chars().collect(), b.chars().collect());
    let mut prev: Vec<usize> = (0..=b.len()).collect();
    for (i, ca) in a.iter().enumerate() {
        let mut cur = vec![i + 1];
        for (j, cb) in b.iter().enumerate() {
            cur.push((prev[j] + usize::from(ca != cb)).min(prev[j + 1] + 1).min(cur[j] + 1));
        }
        prev = cur;
    }
    prev[b.len()]
}

/// A site you've opened before whose name sounds like `name` — close
/// spelling counts (speech often gets a letter or two wrong).
fn known(all: &[Site], name: &str) -> Option<Site> {
    let want = squash(name);
    if want.len() < 4 {
        return None;
    }
    let mut best: Option<(usize, &Site)> = None;
    for s in all {
        let have = squash(&s.name);
        // Allow about one slip per six letters.
        let slack = (want.len().max(have.len()) / 6).max(1);
        let d = edits(&want, &have);
        if d <= slack && best.is_none_or(|(bd, bs)| d < bd || (d == bd && s.uses > bs.uses)) {
            best = Some((d, s));
        }
    }
    best.map(|(_, s)| s.clone())
}

/// Remember that `name` means `url`.
pub fn remember(name: &str, url: &str) {
    let _g = LOCK.lock();
    let mut all = list();
    let n = tidy(name);
    if n.is_empty() || !url.starts_with("http") {
        return;
    }
    match all.iter_mut().find(|s| s.name == n) {
        Some(s) => {
            s.url = url.to_string();
            s.uses += 1;
        }
        None => all.push(Site { name: n, url: url.to_string(), uses: 1 }),
    }
    all.sort_by(|a, b| b.uses.cmp(&a.uses));
    all.truncate(200);
    save(&all);
}

/// Forget a site ("that's the wrong site": the next time it's looked up again).
pub fn forget(name: &str) {
    let _g = LOCK.lock();
    let mut all = list();
    let before = all.len();
    if let Some(k) = known(&all, name) {
        all.retain(|s| s.name != k.name);
    }
    if all.len() != before {
        save(&all);
    }
}

/// The school's learning site opened for you before (Blackboard, Canvas,
/// Moodle, Brightspace) — never a guess at the vendor's own website.
pub fn school_site() -> Option<String> {
    list()
        .into_iter()
        .map(|s| s.url)
        .find(|u| {
            let host = u.split("://").nth(1).unwrap_or(u).split('/').next().unwrap_or(u).to_lowercase();
            let lms = ["blackboard", "instructure", "canvas", "moodle", "brightspace", "d2l"].iter().any(|w| host.contains(w));
            // The vendors' own sites aren't a school's.
            lms && !["www.blackboard.com", "blackboard.com", "www.instructure.com", "moodle.org", "www.d2l.com"].contains(&host.as_str())
        })
}

/// An address said out loud ("sanjac.blackboard.com", "https://…").
fn address_in(name: &str) -> Option<String> {
    let w = name.trim().trim_end_matches(['.', '!', '?']);
    if w.contains(' ') {
        return None;
    }
    let looks = w.starts_with("http://") || w.starts_with("https://") || (w.contains('.') && w.rsplit('.').next().is_some_and(|tld| (2..=6).contains(&tld.len()) && tld.chars().all(|c| c.is_ascii_alphabetic())));
    looks.then(|| if w.starts_with("http") { w.to_string() } else { format!("https://{w}") })
}

/// Where `name` is: (address, how it was found).
pub fn resolve(name: &str) -> anyhow::Result<(String, &'static str)> {
    if let Some(url) = address_in(name) {
        return Ok((url, "said"));
    }
    if let Some(s) = known(&list(), name) {
        return Ok((s.url, "remembered"));
    }
    // Looked up: the top result that isn't an ad or a video.
    let hits = crate::web::search(&format!("{name} login"))?;
    let hit = hits
        .into_iter()
        .find(|h| h.url.starts_with("http") && !h.url.contains("youtube.com") && !h.url.contains("duckduckgo.com/y.js"))
        .ok_or_else(|| anyhow::anyhow!("I couldn't find a website called “{name}”"))?;
    Ok((hit.url, "found"))
}

// ---------------------------------------------------------------------------

/// Words that make "go to X" about a website rather than an app or a place on the screen.
const WEB_WORDS: &[&str] = &[
    "blackboard", "canvas", "moodle", "brightspace", "d2l", "schoology", "google classroom", "classroom", "portal", "website", "site", "web page", "webpage",
    "login", "log in", "student", "mychart", "bank", "netflix", "hulu", "amazon", "ebay", "reddit", "twitter", "instagram", "facebook", "linkedin", "tiktok",
    "gmail", "outlook.com", "github", "chatgpt", "wikipedia",
];

/// "open chrome and go to san jac blackboard", "take me to my school portal",
/// "go to sanjac.blackboard.com" → the site's name.
pub fn parse(said: &str) -> Option<String> {
    let s = tidy_keep_dots(said);
    let s = s.trim();
    let starts = ["go to ", "open ", "take me to ", "bring up ", "pull up ", "navigate to ", "visit ", "get me to "];
    // "open chrome and go to …" / "in chrome go to …": the part after the browser.
    let mut rest = s.to_string();
    for b in ["open chrome and ", "open edge and ", "open the browser and ", "open my browser and ", "open google chrome and ", "open firefox and ", "can you ", "could you ", "please ", "hey nova ", "nova ", "i said "] {
        if let Some(r) = rest.strip_prefix(b) {
            rest = r.to_string();
        }
    }
    let rest = starts.iter().find_map(|p| rest.strip_prefix(p).map(str::to_string))?;
    let name = rest
        .trim_end_matches(" for me")
        .trim_end_matches(" please")
        .trim_end_matches(" in chrome")
        .trim_end_matches(" in edge")
        .trim_end_matches(" on chrome")
        .trim_start_matches("the ")
        .trim_start_matches("my ")
        .trim()
        .to_string();
    if name.is_empty() || name.split_whitespace().count() > 8 {
        return None;
    }
    let webby = address_in(&name).is_some() || WEB_WORDS.iter().any(|w| name.contains(w)) || known(&list(), &name).is_some();
    // An installed app ("open spotify") stays an app.
    if !webby || (address_in(&name).is_none() && crate::apps::find_app(&name).is_some() && !WEB_WORDS.iter().any(|w| name.contains(w))) {
        return None;
    }
    Some(name)
}

fn tidy_keep_dots(s: &str) -> String {
    s.to_lowercase().chars().map(|c| if c.is_alphanumeric() || c == '.' || c == ':' || c == '/' { c } else { ' ' }).collect::<String>().split_whitespace().collect::<Vec<_>>().join(" ")
}

/// "wrong site" / "that's the wrong website" right after Izuki opened one.
pub fn is_wrong_site(said: &str) -> bool {
    let s = tidy(said);
    LAST.lock().is_some() && ["wrong site", "wrong website", "wrong page", "not that site", "thats not it", "that s not it"].iter().any(|w| s.contains(w))
}

/// Forget the last site, so next time it's looked up afresh.
pub fn wrong_site() -> String {
    match LAST.lock().take() {
        Some(name) => {
            forget(&name);
            format!("Sorry — I'll forget that one for “{name}”. Tell me its address (like school.blackboard.com), or say the name another way, and I'll open the right one.")
        }
        None => "Which site did you want? Tell me its address and I'll open it.".into(),
    }
}

/// Open it, the patient way (the browser tab it's already using), and say where.
pub fn go(name: &str) -> String {
    match resolve(name) {
        Ok((url, how)) => match crate::patience::open_url(&url) {
            Ok(_) => {
                remember(name, &url);
                *LAST.lock() = Some(name.to_string());
                eprintln!("[sites] {how}: opened a site");
                let host = url.split("://").nth(1).unwrap_or(&url).split('/').next().unwrap_or(&url).to_string();
                match how {
                    "found" => format!("Opening {host} — the top result for “{name}”. If that's the wrong site, say “wrong site” and tell me the address."),
                    _ => format!("Opening {host}."),
                }
            }
            Err(e) => format!("I couldn't open it: {e}"),
        },
        Err(e) => e.to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn misheard_names_still_match() {
        let all = vec![Site { name: "san jac blackboard".into(), url: "https://sanjac.blackboard.com".into(), uses: 3 }];
        assert_eq!(known(&all, "Sanjag Blackboard").map(|s| s.url), Some("https://sanjac.blackboard.com".into()));
        assert_eq!(known(&all, "sanjay blackboard").map(|s| s.url), Some("https://sanjac.blackboard.com".into()));
        assert!(known(&all, "canvas").is_none());
    }

    #[test]
    fn addresses_open_as_said() {
        assert_eq!(address_in("sanjac.blackboard.com"), Some("https://sanjac.blackboard.com".into()));
        assert_eq!(address_in("https://x.org/a"), Some("https://x.org/a".into()));
        assert_eq!(address_in("san jac blackboard"), None);
        assert_eq!(address_in("v1.2"), None);
    }

    #[test]
    fn hears_go_to_a_website() {
        assert_eq!(parse("Open Chrome and go to San Jac Blackboard").as_deref(), Some("san jac blackboard"));
        assert_eq!(parse("take me to my school portal").as_deref(), Some("school portal"));
        assert_eq!(parse("go to sanjac.blackboard.com").as_deref(), Some("sanjac.blackboard.com"));
        assert_eq!(parse("go to the next page"), None);
        assert_eq!(parse("open notepad"), None);
    }
}
