//! Account health: every app linked to Izuki (through Composio), every
//! account behind it, and whether it really works right now — not just
//! whether a link exists.
//!
//! Each link is one of:
//! - working        — a cheap read-only "who am I" call answered (we know whose account it is)
//! - linked         — Composio says it's active, but this app has no quick check
//! - needs sign-in  — expired, revoked or refused: it has to be connected again
//! - error          — the check failed for another reason (or took over 10 s)
//! - unfinished     — a sign-in was started and never completed (not an account)
//! …and an app with no links at all is "not linked".
//!
//! Several links to the same address count once. Results are kept for five
//! minutes (one minute when something failed, so it's re-checked soon), and
//! anything that fails to search elsewhere (`forget`) makes the next ask
//! re-check. Read only: nothing here sends, changes or deletes anything.
//! Logs carry counts and masked addresses, never tokens or full addresses.

use std::collections::{BTreeMap, HashSet};
use std::time::{Duration, Instant};

use anyhow::Result;
use parking_lot::Mutex;
use serde::Serialize;
use serde_json::{json, Value};

/// The quick read-only check per app: (toolkit, tool, arguments).
const PROBES: &[(&str, &str)] = &[
    ("gmail", "GMAIL_GET_PROFILE"),
    ("googlecalendar", "GOOGLECALENDAR_GET_CALENDAR"),
    ("googledrive", "GOOGLEDRIVE_GET_ABOUT"),
    ("googletasks", "GOOGLETASKS_LIST_TASK_LISTS"),
    ("outlook", "OUTLOOK_OUTLOOK_GET_PROFILE"),
    ("notion", "NOTION_GET_ABOUT_ME"),
    ("github", "GITHUB_GET_THE_AUTHENTICATED_USER"),
    ("slack", "SLACK_RETRIEVE_A_USER_S_IDENTITY_DETAILS"),
    ("linkedin", "LINKEDIN_GET_MY_INFO"),
    ("todoist", "TODOIST_GET_ALL_PROJECTS"),
    ("clay", "CLAY_GET_CURRENT_USER"),
];

fn probe_args(tool: &str) -> Value {
    match tool {
        "GOOGLECALENDAR_GET_CALENDAR" => json!({ "calendar_id": "primary" }),
        "GOOGLEDRIVE_GET_ABOUT" => json!({ "fields": "user" }),
        "GOOGLETASKS_LIST_TASK_LISTS" => json!({ "maxResults": 1 }),
        _ => json!({}),
    }
}

/// Apps most people expect, listed as "not linked" when they aren't.
const EXPECTED: &[&str] = &["gmail", "googlecalendar", "googledrive", "outlook"];

pub fn app_name(toolkit: &str) -> String {
    match toolkit {
        "gmail" => "Gmail".into(),
        "googlecalendar" => "Google Calendar".into(),
        "googledrive" => "Google Drive".into(),
        "googledocs" => "Google Docs".into(),
        "googlesheets" => "Google Sheets".into(),
        "googletasks" => "Google Tasks".into(),
        "outlook" => "Outlook".into(),
        "github" => "GitHub".into(),
        "linkedin" => "LinkedIn".into(),
        "youtube" => "YouTube".into(),
        "serpapi" => "SerpApi".into(),
        other => {
            let mut c = other.chars();
            c.next().map(|f| f.to_uppercase().collect::<String>() + c.as_str()).unwrap_or_default()
        }
    }
}

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Checked {
    /// The connection id (to reconnect exactly this one).
    pub id: String,
    /// Whose account it is (an address or a name), "" when unknown.
    pub who: String,
    /// "working", "linked", "needs_sign_in", "error".
    pub state: String,
    #[serde(skip_serializing_if = "String::is_empty")]
    pub note: String,
}

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct AppHealth {
    pub app: String,
    pub name: String,
    pub accounts: Vec<Checked>,
    /// Sign-ins started and never finished.
    pub unfinished: usize,
    /// Extra links to an account already listed.
    pub duplicates: usize,
}

#[derive(Debug, Clone, Serialize, Default)]
pub struct Health {
    pub apps: Vec<AppHealth>,
    /// Expected apps with no link at all.
    pub not_linked: Vec<String>,
    pub at: String,
}

/// One Composio link, as listed.
#[derive(Debug, Clone)]
pub struct RawLink {
    pub app: String,
    pub id: String,
    pub status: String,
    pub reason: String,
}

/// Where links come from and how one is checked: Composio in the app,
/// a fake in tests.
pub trait Probe: Sync {
    fn links(&self) -> Result<Vec<RawLink>>;
    /// Run the app's quick check on one link (at most 10 s). Ok(None) when
    /// the app has no quick check.
    fn check(&self, app: &str, link: &str) -> Result<Option<Value>>;
}

pub struct Composio;

impl Probe for Composio {
    fn links(&self) -> Result<Vec<RawLink>> {
        crate::composio::all_connections()
    }
    fn check(&self, app: &str, link: &str) -> Result<Option<Value>> {
        let Some((_, tool)) = PROBES.iter().find(|(a, _)| *a == app) else { return Ok(None) };
        crate::composio::execute_on_within(link, tool, probe_args(tool), Duration::from_secs(10)).map(Some)
    }
}

/// Whose account an answer is about: the first address in it, else a
/// login or name.
pub fn identity(v: &Value) -> String {
    fn find(v: &Value, keys: &[&str], depth: usize) -> Option<String> {
        if depth > 6 {
            return None;
        }
        match v {
            Value::Object(m) => {
                for k in keys {
                    if let Some(s) = m.get(*k).and_then(Value::as_str).map(str::trim).filter(|s| !s.is_empty()) {
                        return Some(s.to_string());
                    }
                }
                m.values().find_map(|x| find(x, keys, depth + 1))
            }
            Value::Array(a) => a.iter().find_map(|x| find(x, keys, depth + 1)),
            _ => None,
        }
    }
    let email_keys = ["emailAddress", "email", "mail", "userPrincipalName", "user_email"];
    if let Some(e) = find(v, &email_keys, 0).filter(|e| e.contains('@')) {
        return e.to_lowercase();
    }
    // A calendar's id is its owner's address.
    if let Some(e) = find(v, &["id"], 0).filter(|e| e.contains('@') && !e.contains("group.")) {
        return e.to_lowercase();
    }
    find(v, &["login", "username", "name", "displayName", "localizedFirstName", "full_name"], 0).unwrap_or_default()
}

/// Does an error mean "connect it again"?
fn needs_sign_in(e: &str) -> bool {
    let e = e.to_lowercase();
    ["401", "403", "unauthor", "invalid_grant", "expired", "revoked", "reauth", "re-auth", "token has been", "insufficient", "not active", "inactive"]
        .iter()
        .any(|w| e.contains(w))
}

fn short(e: &str) -> String {
    let line = e.lines().next().unwrap_or(e);
    if line.chars().count() > 120 { format!("{}…", line.chars().take(120).collect::<String>()) } else { line.to_string() }
}

/// Check everything `p` lists (pure apart from `p`, so it's tested).
pub fn health_with(p: &dyn Probe) -> Result<Health> {
    let links = p.links()?;
    let mut by_app: BTreeMap<String, Vec<RawLink>> = BTreeMap::new();
    for l in links {
        by_app.entry(l.app.to_lowercase()).or_default().push(l);
    }
    // The active links, checked all at once.
    let active: Vec<&RawLink> = by_app.values().flatten().filter(|l| l.status.eq_ignore_ascii_case("ACTIVE")).collect();
    let context = crate::execution::current();
    // Eight at a time, so many links can't flood the connection.
    let mut results: Vec<(String, Result<Option<Value>>)> = Vec::new();
    for batch in active.chunks(8) {
        results.extend(std::thread::scope(|sc| {
            let jobs: Vec<_> = batch
                .iter()
                .map(|l| {
                    let context = context.clone();
                    (l.id.clone(), sc.spawn(move || {
                        let _scope = crate::execution::attach(context);
                        p.check(&l.app.to_lowercase(), &l.id)
                    }))
                })
                .collect();
            jobs.into_iter().map(|(id, j)| (id, j.join().unwrap_or_else(|_| Err(anyhow::anyhow!("the check crashed"))))).collect::<Vec<_>>()
        }));
    }
    let mut checked: std::collections::HashMap<String, Result<Option<Value>>> = results.into_iter().collect();

    let mut apps = Vec::new();
    for (app, links) in &by_app {
        let mut h = AppHealth { app: app.clone(), name: app_name(app), accounts: Vec::new(), unfinished: 0, duplicates: 0 };
        let mut seen: HashSet<String> = HashSet::new();
        for l in links {
            let status = l.status.to_uppercase();
            if status == "ACTIVE" {
                let c = match checked.remove(&l.id).unwrap_or(Ok(None)) {
                    Ok(Some(v)) => Checked { id: l.id.clone(), who: identity(&v), state: "working".into(), note: String::new() },
                    Ok(None) => Checked { id: l.id.clone(), who: String::new(), state: "linked".into(), note: String::new() },
                    Err(e) => {
                        let e = e.to_string();
                        let timed_out = e.to_lowercase().contains("timed out") || e.to_lowercase().contains("timeout");
                        Checked {
                            id: l.id.clone(),
                            who: String::new(),
                            state: if needs_sign_in(&e) { "needs_sign_in".into() } else { "error".into() },
                            note: if timed_out { "didn't answer within 10 seconds".into() } else { short(&e) },
                        }
                    }
                };
                // The same account linked twice: listed once.
                if !c.who.is_empty() && !seen.insert(c.who.to_lowercase()) {
                    h.duplicates += 1;
                    continue;
                }
                h.accounts.push(c);
            } else if status == "INITIATED" || status == "INITIALIZING" || l.reason.to_lowercase().contains("not completed") {
                h.unfinished += 1;
            } else {
                h.accounts.push(Checked { id: l.id.clone(), who: String::new(), state: "needs_sign_in".into(), note: short(&l.reason) });
            }
        }
        apps.push(h);
    }
    let not_linked = EXPECTED.iter().filter(|a| !by_app.contains_key(**a)).map(|a| app_name(a)).collect();
    let h = Health { apps, not_linked, at: chrono::Local::now().format("%-I:%M %p").to_string() };
    log(&h);
    Ok(h)
}

fn log(h: &Health) {
    let mut parts = Vec::new();
    for a in &h.apps {
        let n = |s: &str| a.accounts.iter().filter(|c| c.state == s).count();
        let who: Vec<String> = a.accounts.iter().filter(|c| c.who.contains('@')).map(|c| crate::mail::masked(&c.who)).collect();
        parts.push(format!(
            "{} {}w/{}l/{}s/{}e/{}u/{}d{}",
            a.app,
            n("working"),
            n("linked"),
            n("needs_sign_in"),
            n("error"),
            a.unfinished,
            a.duplicates,
            if who.is_empty() { String::new() } else { format!(" ({})", who.join(", ")) }
        ));
    }
    eprintln!("[accounts] checked: {}", parts.join("; "));
}

static CACHE: Mutex<Option<(Health, Instant)>> = Mutex::new(None);

/// The account health, re-checked at most every 5 minutes — every minute
/// while something is failing.
pub fn health() -> Result<Health> {
    fn fresh() -> Option<Health> {
        let (h, at) = CACHE.lock().clone()?;
        let failing = h.apps.iter().any(|a| a.accounts.iter().any(|c| c.state == "error"));
        let keep = if failing { Duration::from_secs(60) } else { Duration::from_secs(300) };
        (at.elapsed() < keep).then_some(h)
    }
    if let Some(h) = fresh() {
        return Ok(h);
    }
    // One check at a time: a second ask waits and gets the same answer.
    static CHECKING: Mutex<()> = Mutex::new(());
    let _one = CHECKING.lock();
    if let Some(h) = fresh() {
        return Ok(h);
    }
    let h = health_with(&Composio)?;
    *CACHE.lock() = Some((h.clone(), Instant::now()));
    Ok(h)
}

/// Something failed elsewhere (a search, a link added or removed): check again next time.
pub fn forget() {
    CACHE.lock().take();
}

/// The health, in plain words (pure, so it's tested).
pub fn report(h: &Health) -> String {
    if h.apps.is_empty() {
        return "No apps are linked to Izuki yet — open Apps and connect Gmail, Calendar or the others, then ask me again.".into();
    }
    let mut out = format!("Your connected accounts (checked {}):", h.at);
    // Apps with only unfinished sign-ins aren't linked: said together, once.
    let mut never_finished: Vec<&str> = Vec::new();
    for a in &h.apps {
        if a.accounts.is_empty() && a.unfinished > 0 {
            never_finished.push(&a.name);
            continue;
        }
        let working: Vec<&Checked> = a.accounts.iter().filter(|c| c.state == "working").collect();
        let linked = a.accounts.iter().filter(|c| c.state == "linked").count();
        let sign_in: Vec<&Checked> = a.accounts.iter().filter(|c| c.state == "needs_sign_in").collect();
        let errors: Vec<&Checked> = a.accounts.iter().filter(|c| c.state == "error").collect();
        if !working.is_empty() {
            let who: Vec<&str> = working.iter().map(|c| if c.who.is_empty() { "an account" } else { c.who.as_str() }).collect();
            out.push_str(&format!(
                "\n✅ {} — {} working: {}{}",
                a.name,
                if working.len() == 1 { "1 account".to_string() } else { format!("{} accounts", working.len()) },
                who.join(", "),
                if a.duplicates > 0 { format!(" ({} extra link{} to the same account, counted once)", a.duplicates, if a.duplicates == 1 { "" } else { "s" }) } else { String::new() }
            ));
        }
        if linked > 0 {
            out.push_str(&format!("\n✅ {} — linked (Composio says it's active; there's no quick check for this app)", a.name));
        }
        for c in &sign_in {
            out.push_str(&format!(
                "\n⚠️ {} — a link needs signing in again{} → Apps → {} → Connect",
                a.name,
                if c.note.is_empty() { String::new() } else { format!(" ({})", c.note) },
                a.name
            ));
        }
        for c in &errors {
            out.push_str(&format!("\n❌ {} — couldn't check an account ({}). I'll check again in a minute.", a.name, c.note));
        }
        if a.unfinished > 0 {
            out.push_str(&format!(
                "\n⏳ {} — also {} unfinished sign-in{} (if one was for another account, connect it again to finish)",
                a.name,
                a.unfinished,
                if a.unfinished == 1 { "" } else { "s" }
            ));
        }
    }
    if !never_finished.is_empty() {
        out.push_str(&format!(
            "\n⏳ Sign-in started but never finished, so not linked: {} → Apps → Connect to finish{}",
            never_finished.join(", "),
            if never_finished.len() == 1 { " it" } else { " any you want" }
        ));
    }
    if !h.not_linked.is_empty() {
        out.push_str(&format!("\n➖ Not linked: {}", h.not_linked.join(", ")));
    }
    out
}

/// "Check my connected accounts", "which accounts are linked", "are my apps connected?"
pub fn asks(said: &str) -> bool {
    let s = said.to_lowercase();
    let about = ["account", "apps", "connections", "integrations", "linked", "connected"].iter().any(|w| s.contains(w));
    let check = [
        "check my connected",
        "check my accounts",
        "check my apps",
        "check my connections",
        "which accounts",
        "what accounts",
        "which apps are",
        "what apps are",
        "are my apps",
        "are my accounts",
        "account health",
        "accounts health",
        "connected accounts",
        "linked accounts",
        "what's connected",
        "whats connected",
        "what is connected",
        "what's linked",
    ]
    .iter()
    .any(|w| s.contains(w));
    about && check && !["connect my", "link my", "disconnect", "remove", "unlink", "add another", "add a "].iter().any(|w| s.contains(w))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    struct Fake {
        links: Vec<RawLink>,
        answers: HashMap<String, Result<Option<Value>, String>>,
    }

    impl Probe for Fake {
        fn links(&self) -> Result<Vec<RawLink>> {
            Ok(self.links.clone())
        }
        fn check(&self, _app: &str, link: &str) -> Result<Option<Value>> {
            match self.answers.get(link) {
                Some(Ok(v)) => Ok(v.clone()),
                Some(Err(e)) => Err(anyhow::anyhow!(e.clone())),
                None => Ok(None),
            }
        }
    }

    fn link(app: &str, id: &str, status: &str, reason: &str) -> RawLink {
        RawLink { app: app.into(), id: id.into(), status: status.into(), reason: reason.into() }
    }

    fn fake() -> Fake {
        let mut answers: HashMap<String, Result<Option<Value>, String>> = HashMap::new();
        answers.insert("g1".into(), Ok(Some(json!({ "emailAddress": "Ama@gmail.com", "messagesTotal": 10 }))));
        answers.insert("g2".into(), Ok(Some(json!({ "emailAddress": "ama@gmail.com" }))));
        answers.insert("g3".into(), Ok(Some(json!({ "emailAddress": "ama.school@sanjac.edu" }))));
        answers.insert("g4".into(), Err("Composio answered 401 Unauthorized: token has been expired or revoked".into()));
        answers.insert("n1".into(), Err("operation timed out".into()));
        answers.insert("c1".into(), Ok(Some(json!({ "data": { "id": "ama@gmail.com", "summary": "Ama" } }))));
        Fake {
            links: vec![
                link("gmail", "g1", "ACTIVE", ""),
                link("gmail", "g2", "ACTIVE", ""),
                link("gmail", "g3", "ACTIVE", ""),
                link("gmail", "g4", "ACTIVE", ""),
                link("gmail", "g5", "EXPIRED", "Authorization was started but not completed within 10 minutes"),
                link("googlecalendar", "c1", "ACTIVE", ""),
                link("notion", "n1", "ACTIVE", ""),
                link("googlesheets", "s1", "ACTIVE", ""),
                link("outlook", "o1", "EXPIRED", "Authorization was started but not completed within 10 minutes"),
                link("github", "h1", "EXPIRED", "The user revoked access"),
            ],
            answers,
        }
    }

    #[test]
    fn every_state_is_told_apart() {
        let h = health_with(&fake()).unwrap();
        let app = |a: &str| h.apps.iter().find(|x| x.app == a).unwrap().clone();
        let g = app("gmail");
        let working: Vec<_> = g.accounts.iter().filter(|c| c.state == "working").map(|c| c.who.as_str()).collect();
        assert_eq!(working, vec!["ama@gmail.com", "ama.school@sanjac.edu"], "two links to one address count once");
        assert_eq!(g.duplicates, 1);
        assert_eq!(g.unfinished, 1, "a sign-in never finished isn't an account");
        assert!(g.accounts.iter().any(|c| c.state == "needs_sign_in"), "an expired token needs signing in again");
        assert_eq!(app("googlecalendar").accounts[0].who, "ama@gmail.com", "a calendar's id is its owner");
        assert_eq!(app("notion").accounts[0].state, "error");
        assert_eq!(app("notion").accounts[0].note, "didn't answer within 10 seconds");
        assert_eq!(app("googlesheets").accounts[0].state, "linked", "no quick check: linked, not 'working'");
        assert_eq!(app("outlook").unfinished, 1);
        assert!(app("outlook").accounts.is_empty());
        assert_eq!(app("github").accounts[0].state, "needs_sign_in");
        assert_eq!(h.not_linked, vec!["Google Drive"]);
    }

    #[test]
    fn the_report_names_each_problem_and_its_fix() {
        let r = report(&health_with(&fake()).unwrap());
        assert!(r.contains("✅ Gmail — 2 accounts working: ama@gmail.com, ama.school@sanjac.edu (1 extra link to the same account, counted once)"), "{r}");
        assert!(r.contains("⚠️ Gmail — a link needs signing in again"), "{r}");
        assert!(r.contains("⏳ Gmail — also 1 unfinished sign-in"), "{r}");
        assert!(r.contains("⏳ Sign-in started but never finished, so not linked: Outlook → Apps → Connect to finish it"), "{r}");
        assert!(r.contains("❌ Notion — couldn't check an account (didn't answer within 10 seconds)"), "{r}");
        assert!(r.contains("✅ Google Sheets — linked"), "{r}");
        assert!(r.contains("➖ Not linked: Google Drive"), "{r}");
    }

    #[test]
    fn every_account_failing_is_never_called_working() {
        let mut f = fake();
        for v in f.answers.values_mut() {
            *v = Err("Composio answered 500 Internal Server Error".into());
        }
        let h = health_with(&f).unwrap();
        assert!(h.apps.iter().all(|a| a.accounts.iter().all(|c| c.state != "working")));
        let r = report(&h);
        assert!(!r.contains("working"), "{r}");
        assert!(r.contains("❌ Gmail — couldn't check an account"), "{r}");
    }

    #[test]
    fn finds_who_an_account_belongs_to() {
        assert_eq!(identity(&json!({ "response_data": { "emailAddress": "A@B.com" } })), "a@b.com");
        assert_eq!(identity(&json!({ "user": { "displayName": "Ama", "emailAddress": "ama@x.com" } })), "ama@x.com");
        assert_eq!(identity(&json!({ "login": "ama-dev", "id": 5 })), "ama-dev");
        assert_eq!(identity(&json!({ "items": [] })), "");
    }

    /// This PC's real links, each checked read-only:
    /// `cargo test --lib real_account_health -- --ignored --nocapture`
    #[test]
    #[ignore]
    fn real_account_health() {
        crate::state::init();
        let started = std::time::Instant::now();
        let h = health_with(&Composio).unwrap();
        eprintln!("{}
(took {:.1}s)", report(&h), started.elapsed().as_secs_f32());
    }

    #[test]
    fn hears_account_checks() {
        assert!(asks("check my connected accounts"));
        assert!(asks("which accounts are linked to izuki?"));
        assert!(asks("are my apps connected"));
        assert!(!asks("connect my gmail"));
        assert!(!asks("check my email"));
        assert!(!asks("add another gmail account"));
    }
}
