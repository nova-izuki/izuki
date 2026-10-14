//! Email across every Gmail account linked to Izuki — searched for real,
//! every result kept with the account it came from, and every answer says
//! exactly what was searched.
//!
//! Why this exists: Gmail links are made through Composio, and a tool run
//! without naming an account only ever reads Composio's default one. So
//! "find my Home Depot email" searched one account, found nothing, and said
//! "no Home Depot emails" — while the email sat in another account. Here each
//! linked account is searched on its own (by its connection id), links to the
//! same address are counted once, and the answer separates:
//! found · nothing found in what was searched · couldn't search · needs
//! signing in again · not linked at all.
//!
//! Nothing here sends, deletes or changes anything — it only reads.

use std::collections::{HashMap, HashSet};
use std::time::{Duration, Instant};

use anyhow::{anyhow, Result};
use chrono::{DateTime, Local, Utc};
use parking_lot::Mutex;
use serde::Serialize;
use serde_json::{json, Value};

/// One Gmail link as Composio reports it.
#[derive(Debug, Clone)]
pub struct Link {
    pub id: String,
    /// "ACTIVE", "EXPIRED", "INITIATED", "FAILED"…
    pub status: String,
    pub reason: String,
}

/// One Gmail account Izuki can (or should be able to) read.
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Account {
    /// The connection used to read it.
    pub id: String,
    /// The address ("" if it couldn't be read).
    pub address: String,
    /// "ok", "needs_sign_in", "error".
    pub state: String,
    #[serde(skip_serializing_if = "String::is_empty")]
    pub note: String,
}

/// One email, with where it came from.
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Mail {
    pub account: String,
    pub id: String,
    pub thread_id: String,
    /// Display name ("Home_Depot_Hiring").
    pub from: String,
    /// The whole From line, address included.
    pub from_full: String,
    pub subject: String,
    /// When it arrived (ms since 1970).
    pub at: Option<i64>,
    pub snippet: String,
    pub unread: bool,
    pub labels: Vec<String>,
    pub attachments: usize,
}

/// What a search found, and exactly what it covered.
#[derive(Debug, Clone, Serialize, Default)]
pub struct Found {
    pub mails: Vec<Mail>,
    /// Addresses searched successfully.
    pub checked: Vec<String>,
    /// (account, what went wrong) — these were NOT searched.
    pub failed: Vec<(String, String)>,
    /// Gmail links that need signing in again (not searched).
    pub needs_sign_in: usize,
    /// Extra links to an address already counted (searched once).
    pub duplicates: usize,
    /// Some account had more results than were read.
    pub more: bool,
    /// When the search ran (live, never cached).
    pub at: String,
}

/// Reads Gmail. Composio in the app; fixtures in tests.
pub trait Source: Sync {
    fn links(&self) -> Result<Vec<Link>>;
    fn address(&self, link: &str) -> Result<String>;
    fn fetch(&self, link: &str, query: &str, max: usize) -> Result<Value>;
}

/// The real thing: Composio, one connection at a time.
pub struct Composio;

impl Source for Composio {
    fn links(&self) -> Result<Vec<Link>> {
        crate::composio::connections("gmail")
    }
    fn address(&self, link: &str) -> Result<String> {
        static KNOWN: Mutex<Option<HashMap<String, String>>> = Mutex::new(None);
        if let Some(a) = KNOWN.lock().as_ref().and_then(|m| m.get(link).cloned()) {
            return Ok(a);
        }
        let v = crate::composio::execute_on(link, "GMAIL_GET_PROFILE", json!({}))?;
        let d = if v["response_data"].is_object() { &v["response_data"] } else { &v };
        let a = d["emailAddress"].as_str().ok_or_else(|| anyhow!("Gmail didn't say which account this is"))?.to_lowercase();
        KNOWN.lock().get_or_insert_with(HashMap::new).insert(link.to_string(), a.clone());
        Ok(a)
    }
    fn fetch(&self, link: &str, query: &str, max: usize) -> Result<Value> {
        crate::composio::execute_on(
            link,
            "GMAIL_FETCH_EMAILS",
            json!({ "query": query, "max_results": max.clamp(1, 50), "include_payload": false, "verbose": false }),
        )
    }
}

/// Every Gmail account, links to the same address counted once.
/// Returns (accounts, how many duplicate links were skipped).
pub fn accounts(src: &dyn Source) -> Result<(Vec<Account>, usize)> {
    let links = src.links()?;
    let mut out: Vec<Account> = Vec::new();
    let mut seen: HashSet<String> = HashSet::new();
    let mut dupes = 0;
    for l in links {
        match l.status.to_uppercase().as_str() {
            "ACTIVE" => match src.address(&l.id) {
                Ok(a) => {
                    if seen.insert(a.clone()) {
                        out.push(Account { id: l.id, address: a, state: "ok".into(), note: String::new() });
                    } else {
                        dupes += 1;
                    }
                }
                Err(e) => out.push(Account { id: l.id, address: String::new(), state: "error".into(), note: short(&e.to_string()) }),
            },
            // A sign-in that was started and never finished isn't an account.
            _ if l.reason.to_lowercase().contains("not completed") || l.status.eq_ignore_ascii_case("INITIATED") => {}
            _ => out.push(Account { id: l.id, address: String::new(), state: "needs_sign_in".into(), note: short(&l.reason) }),
        }
    }
    Ok((out, dupes))
}

static ACCOUNTS: Mutex<Option<(Vec<Account>, usize, Instant)>> = Mutex::new(None);

/// The accounts, re-read at most every two minutes.
pub fn accounts_now() -> Result<(Vec<Account>, usize)> {
    if let Some((a, d, at)) = ACCOUNTS.lock().clone() {
        if at.elapsed() < Duration::from_secs(120) {
            return Ok((a, d));
        }
    }
    let (a, d) = accounts(&Composio)?;
    *ACCOUNTS.lock() = Some((a.clone(), d, Instant::now()));
    Ok((a, d))
}

/// Forget the cached account list (after linking or removing one).
pub fn refresh() {
    ACCOUNTS.lock().take();
}

/// Search `accounts` (all of them at once) with a Gmail query.
pub fn search_in(src: &dyn Source, accounts: &[Account], dupes: usize, query: &str, max: usize) -> Found {
    let mut found = Found { duplicates: dupes, at: Local::now().format("%-I:%M %p").to_string(), ..Default::default() };
    found.needs_sign_in = accounts.iter().filter(|a| a.state == "needs_sign_in").count();
    for a in accounts.iter().filter(|a| a.state == "error") {
        found.failed.push(("a Gmail account".into(), a.note.clone()));
    }
    let ok: Vec<&Account> = accounts.iter().filter(|a| a.state == "ok").collect();
    let execution_context = crate::execution::current();
    let results: Vec<(String, Result<Value>)> = std::thread::scope(|sc| {
        let jobs: Vec<_> = ok.iter().map(|a| {
            let context = execution_context.clone();
            (a.address.clone(), sc.spawn(move || {
                let _scope = crate::execution::attach(context);
                src.fetch(&a.id, query, max)
            }))
        }).collect();
        jobs.into_iter().map(|(addr, j)| (addr, j.join().unwrap_or_else(|_| Err(anyhow!("the search crashed"))))).collect()
    });
    let mut ids: HashSet<(String, String)> = HashSet::new();
    for (addr, r) in results {
        match r {
            Ok(v) => {
                found.checked.push(addr.clone());
                if v["nextPageToken"].as_str().is_some_and(|t| !t.is_empty()) {
                    found.more = true;
                }
                for m in parse(&v, &addr) {
                    if ids.insert((m.account.clone(), m.id.clone())) {
                        found.mails.push(m);
                    }
                }
            }
            Err(e) => found.failed.push((addr, short(&e.to_string()))),
        }
    }
    found.mails.sort_by(|a, b| b.at.cmp(&a.at));
    eprintln!(
        "[mail] searched {} account(s), {} failed, {} needing sign-in, {} duplicate link(s) — {} email(s)",
        found.checked.len(),
        found.failed.len(),
        found.needs_sign_in,
        found.duplicates,
        found.mails.len()
    );
    found
}

/// Search every linked Gmail account (or the ones `pick` names).
pub fn search(query: &str, max: usize, pick: Option<&str>) -> Result<Found> {
    let (all, dupes) = accounts_now()?;
    let chosen = choose(&all, pick);
    Ok(search_in(&Composio, &chosen, dupes, query, max))
}

/// "my school gmail", "the second account", "lmm@…": just those accounts.
fn choose(all: &[Account], pick: Option<&str>) -> Vec<Account> {
    let Some(p) = pick.map(str::to_lowercase).filter(|p| !p.is_empty()) else { return all.to_vec() };
    let ok: Vec<&Account> = all.iter().filter(|a| a.state == "ok").collect();
    let nth = ["first", "second", "third", "fourth", "fifth"].iter().position(|w| p == *w);
    if let Some(i) = nth {
        return ok.get(i).map(|a| vec![(*a).clone()]).unwrap_or_default();
    }
    let hits: Vec<Account> = ok.into_iter().filter(|a| a.address.contains(&p)).cloned().collect();
    hits
}

/// The emails in a Gmail tool result.
pub fn parse(v: &Value, account: &str) -> Vec<Mail> {
    let list = v["messages"].as_array().or(v["emails"].as_array()).cloned().unwrap_or_default();
    list.iter()
        .filter_map(|m| {
            let s = |k: &str| m[k].as_str().unwrap_or_default().trim().to_string();
            let id = [s("messageId"), s("id")].into_iter().find(|x| !x.is_empty())?;
            let from_full = [s("sender"), s("from")].into_iter().find(|x| !x.is_empty()).unwrap_or_default();
            let labels: Vec<String> = m["labelIds"].as_array().map(|a| a.iter().filter_map(|l| l.as_str().map(str::to_string)).collect()).unwrap_or_default();
            let snippet = [m["preview"]["body"].as_str().unwrap_or_default().to_string(), s("snippet"), s("messageText")]
                .into_iter()
                .find(|x| !x.trim().is_empty())
                .unwrap_or_default();
            Some(Mail {
                account: account.to_string(),
                id,
                thread_id: s("threadId"),
                from: display_name(&from_full),
                from_full,
                subject: clip(&s("subject"), 120),
                at: DateTime::parse_from_rfc3339(&s("messageTimestamp")).ok().map(|t| t.timestamp_millis()),
                snippet: clip(&snippet.split_whitespace().collect::<Vec<_>>().join(" "), 300),
                unread: labels.iter().any(|l| l == "UNREAD"),
                attachments: m["attachmentList"].as_array().map(Vec::len).unwrap_or(0),
                labels,
            })
        })
        .collect()
}

// ---------------------------------------------------------------------------
// Understanding the request
// ---------------------------------------------------------------------------

/// A request to look for email.
#[derive(Debug, Clone, PartialEq, Default)]
pub struct Ask {
    /// What it's about or who it's from ("home depot").
    pub about: String,
    pub unread: bool,
    pub attachments: bool,
    /// "today", "yesterday", "week" or "".
    pub when: String,
    /// Which account, if they named one.
    pub account: Option<String>,
}

const MAIL_WORDS: &[&str] = &["email", "emails", "e-mail", "mail", "mails", "inbox", "inboxes", "gmail"];
const LOOK: &[&str] = &[
    "find", "search", "look for", "looking for", "check", "show", "any ", "do i have", "did i get", "did i receive", "have i got", "got any",
    "is there", "are there", "latest", "last", "where is", "where's", "wheres", "what's", "whats", "what is", "list", "read me", "pull up", "get me",
];
/// Whole words/phrases that make it a different job (writing, changing, or
/// the digest's "what's important").
const CHANGE: &[&str] = &[
    "send", "write", "reply", "respond", "draft", "compose", "forward", "delete", "archive", "unsubscribe", "mark", "label", "move", "star",
    "trash", "block", "important", "urgent", "catch me up", "go through", "dig through", "need to do", "to do", "todo",
];
/// Word starts that do the same ("summarize", "summary", "summarise").
const CHANGE_STEMS: &[&str] = &["summar", "unsubscrib", "delet", "archiv", "forward"];
const FILLER: &[&str] = &[
    "hey", "hi", "nova", "izuki", "please", "can", "could", "would", "you", "u", "find", "search", "look", "looking", "for", "my", "me", "the", "a", "an",
    "any", "all", "every", "of", "in", "on", "at", "to", "from", "about", "regarding", "re", "show", "check", "do", "did", "i", "have", "has", "got",
    "get", "receive", "received", "is", "are", "there", "it", "that", "this", "those", "these", "latest", "last", "recent", "new", "newest", "unread",
    "read", "today", "todays", "today's", "yesterday", "week", "this", "with", "attachment", "attachments", "where", "wheres", "where's", "what",
    "whats", "what's", "list", "pull", "up", "and", "or", "accounts", "account", "connected", "linked", "mailbox", "mailboxes", "some", "one", "ones",
    "just", "only", "came", "come", "sent", "message", "messages", "first", "second", "third", "fourth", "fifth", "other", "lol", "pls", "bro", "rn",
];

/// "find my Home Depot email", "any emails from Sam today?", "check my
/// unread emails in my second gmail" → what to look for. `None` for
/// anything that writes, sends or changes mail, and for the "what's
/// important" kind (the inbox digest does those).
pub fn parse_ask(said: &str) -> Option<Ask> {
    let s = format!(" {} ", said.to_lowercase().replace(['?', '!', ',', '.'], " ").split_whitespace().collect::<Vec<_>>().join(" "));
    let words: Vec<&str> = s.split_whitespace().collect();
    if !words.iter().any(|w| MAIL_WORDS.contains(w)) {
        return None;
    }
    let changes = CHANGE.iter().any(|c| s.contains(&format!(" {c} "))) || words.iter().any(|w| CHANGE_STEMS.iter().any(|st| w.starts_with(st)));
    if !LOOK.iter().any(|l| s.contains(&format!(" {l}"))) || changes {
        return None;
    }
    let mut ask = Ask {
        unread: s.contains(" unread ") || s.contains(" haven't read ") || s.contains(" havent read "),
        attachments: s.contains("attachment"),
        when: if s.contains(" yesterday ") { "yesterday" } else if s.contains(" today ") || s.contains(" this morning ") { "today" } else if s.contains(" this week ") || s.contains(" past week ") { "week" } else { "" }.into(),
        ..Default::default()
    };
    // "my second gmail", "my school gmail" / "school email", "lmm@… inbox".
    for (i, w) in words.iter().enumerate() {
        if ["first", "second", "third", "fourth", "fifth"].contains(w) && words.get(i + 1).is_some_and(|n| MAIL_WORDS.contains(n) || *n == "account") {
            ask.account = Some(w.to_string());
        }
        if w.contains('@') {
            ask.account = Some(w.trim_matches(|c: char| !c.is_alphanumeric() && c != '@' && c != '.').to_string());
        }
    }
    let about: Vec<&str> = words
        .iter()
        .copied()
        .filter(|w| !FILLER.contains(w) && !MAIL_WORDS.contains(w) && !w.contains('@'))
        .collect();
    ask.about = about.join(" ");
    if ask.about.is_empty() && !ask.unread && !ask.attachments && ask.when.is_empty() && ask.account.is_none() {
        // "check my email" — the inbox digest answers that.
        return None;
    }
    Some(ask)
}

/// The Gmail query for an ask — every reasonable spelling of a name
/// ("Home Depot", "Home_Depot_Hiring", "homedepot"), all mail except spam
/// and trash (archived mail included).
pub fn query_for(ask: &Ask) -> String {
    let mut parts: Vec<String> = Vec::new();
    let a = ask.about.trim();
    if !a.is_empty() {
        let w: Vec<&str> = a.split_whitespace().collect();
        let mut alts = vec![format!("\"{a}\""), format!("from:\"{a}\""), format!("subject:\"{a}\"")];
        if w.len() > 1 {
            let joined = w.join("");
            let under = w.join("_");
            alts.push(joined.clone());
            alts.push(format!("from:{joined}"));
            alts.push(format!("from:{under}"));
            alts.push(format!("\"{under}\""));
        } else {
            alts.push(format!("from:{a}"));
        }
        alts.dedup();
        parts.push(format!("{{{}}}", alts.join(" ")));
    }
    if ask.unread {
        parts.push("is:unread".into());
    }
    if ask.attachments {
        parts.push("has:attachment".into());
    }
    let today = Local::now().date_naive();
    match ask.when.as_str() {
        "today" => parts.push(format!("after:{}", today.format("%Y/%m/%d"))),
        "yesterday" => {
            let y = today - chrono::Days::new(1);
            parts.push(format!("after:{} before:{}", y.format("%Y/%m/%d"), today.format("%Y/%m/%d")));
        }
        "week" => parts.push("newer_than:7d".into()),
        _ => {}
    }
    parts.join(" ")
}

/// Answer a mail search, in plain words, grounded in what was really found.
pub fn answer(ask: &Ask) -> String {
    answer_checked(ask).0
}

/// The answer and how complete the search really was: verified only when
/// every account in scope was searched (none failed, none needing sign-in).
pub fn answer_checked(ask: &Ask) -> (String, crate::model::TaskOutcome) {
    let q = query_for(ask);
    match search(&q, 10, ask.account.as_deref()) {
        Ok(f) => {
            let (all, _) = accounts_now().unwrap_or_default();
            (say(ask, &f, &all), coverage(&f))
        }
        Err(e) => (
            format!("I couldn't reach your email just now ({}), so I can't say whether it's there.", short(&e.to_string())),
            crate::model::TaskOutcome::Failed,
        ),
    }
}

/// How much of the asked-for scope a search covered.
pub fn coverage(f: &Found) -> crate::model::TaskOutcome {
    use crate::model::TaskOutcome;
    match (f.checked.is_empty(), f.failed.is_empty() && f.needs_sign_in == 0) {
        (true, _) if f.failed.is_empty() && f.needs_sign_in == 0 => TaskOutcome::Blocked,
        (true, _) => TaskOutcome::Failed,
        (false, true) => TaskOutcome::Verified,
        (false, false) => TaskOutcome::Partial,
    }
}

/// What to say about a search (pure, so it's tested).
pub fn say(ask: &Ask, f: &Found, all: &[Account]) -> String {
    let what = describe(ask);
    let many = f.checked.len() + f.failed.len() > 1;
    let mut out = String::new();
    if f.checked.is_empty() {
        if f.failed.is_empty() && f.needs_sign_in == 0 {
            if let Some(acc) = &ask.account {
                let have: Vec<&str> = all.iter().filter(|a| a.state == "ok").map(|a| a.address.as_str()).collect();
                return format!(
                    "I don't have a Gmail account that matches “{acc}”. The ones linked to Izuki: {}.",
                    if have.is_empty() { "none".into() } else { have.join(", ") }
                );
            }
            return "No Gmail account is linked to Izuki yet — open Apps and connect Gmail, then ask me again.".into();
        }
        out.push_str(&format!("I couldn't search your email, so I can't say whether {what} is there."));
    } else if f.mails.is_empty() {
        out.push_str(&format!("No {what} in {}.", scope(&f.checked)));
    } else {
        let n = f.mails.len();
        out.push_str(&format!("I found {}{} {}:", if f.more { "at least " } else { "" }, n, if n == 1 { describe_one(ask) } else { what.clone() }));
        for m in f.mails.iter().take(6) {
            out.push_str(&format!("\n• {}", line(m, many)));
        }
        if n > 6 {
            out.push_str(&format!("\n…and {} more.", n - 6));
        }
        out.push_str(&format!("\n(Searched {}.)", scope(&f.checked)));
    }
    for (acc, why) in &f.failed {
        out.push_str(&format!(" I couldn't search {acc} ({why}), so it might be there."));
    }
    if f.needs_sign_in > 0 {
        out.push_str(&format!(
            " {} Gmail link{} need{} signing in again (Apps → Gmail), so I couldn't check {}.",
            f.needs_sign_in,
            if f.needs_sign_in == 1 { "" } else { "s" },
            if f.needs_sign_in == 1 { "s" } else { "" },
            if f.needs_sign_in == 1 { "it" } else { "them" }
        ));
    }
    if f.mails.is_empty() && !f.checked.is_empty() && ask.account.is_none() && f.checked.len() == 1 {
        out.push_str(" If it's in a different Gmail account, that one isn't linked to Izuki yet — Apps → Gmail → Add another account, and pick that account when Google asks.");
    }
    out
}

fn describe(ask: &Ask) -> String {
    describe_n(ask, "emails")
}

fn describe_one(ask: &Ask) -> String {
    describe_n(ask, "email")
}

fn describe_n(ask: &Ask, noun: &str) -> String {
    let mut d = if ask.unread { format!("unread {noun}") } else { noun.to_string() };
    if !ask.about.is_empty() {
        d.push_str(&format!(" about “{}”", ask.about));
    }
    if ask.attachments {
        d.push_str(" with attachments");
    }
    match ask.when.as_str() {
        "today" => d.push_str(" from today"),
        "yesterday" => d.push_str(" from yesterday"),
        "week" => d.push_str(" from this week"),
        _ => {}
    }
    d
}

/// "your Gmail (x@gmail.com — all mail, not spam or trash)".
fn scope(checked: &[String]) -> String {
    match checked {
        [one] => format!("{one} (all mail except spam and trash)"),
        many => format!("all {} of your Gmail accounts — {} (all mail except spam and trash)", many.len(), many.join(", ")),
    }
}

/// "Home_Depot_Hiring — “Next Steps…” · today 7:21 AM · unread".
pub fn line(m: &Mail, with_account: bool) -> String {
    let mut s = format!("{} — “{}”", m.from, if m.subject.is_empty() { "(no subject)" } else { &m.subject });
    if let Some(at) = m.at {
        s.push_str(&format!(" · {}", when(at)));
    }
    if m.unread {
        s.push_str(" · unread");
    }
    if with_account {
        s.push_str(&format!(" · in {}", m.account));
    }
    s
}

pub fn when(at_ms: i64) -> String {
    let Some(t) = DateTime::<Utc>::from_timestamp_millis(at_ms).map(|t| t.with_timezone(&Local)) else { return String::new() };
    let today = Local::now().date_naive();
    if t.date_naive() == today {
        format!("today {}", t.format("%-I:%M %p"))
    } else if t.date_naive() + chrono::Days::new(1) == today {
        format!("yesterday {}", t.format("%-I:%M %p"))
    } else {
        t.format("%b %-d").to_string()
    }
}

// ---------------------------------------------------------------------------
// What matters
// ---------------------------------------------------------------------------

/// Why an email probably matters ("job application"), or `None`. A job or
/// security email counts even from a sender the user's never heard of, and
/// even when Gmail filed it under Promotions or Updates.
pub fn why_important(m: &Mail) -> Option<&'static str> {
    let t = format!("{} {} {} {}", m.from_full, m.subject, m.snippet, m.from).to_lowercase().replace('_', " ");
    let has = |ws: &[&str]| ws.iter().any(|w| t.contains(w));
    if has(&["interview", "hiring", "your application", "application journey", "job offer", "offer letter", "recruit", "candidate", "next steps in your application", "assessment invitation", "onboarding"]) {
        return Some("job application");
    }
    if has(&["security alert", "new sign-in", "suspicious", "verify it's you", "password was changed", "2-step verification", "unusual activity"]) {
        return Some("security");
    }
    if has(&["financial aid", "fafsa", "tuition", "assignment due", "deadline", "registration", "enrollment", "transcript", "your professor", "class cancelled"]) {
        return Some("school / deadline");
    }
    if has(&["appointment", "booking confirmed", "reservation", "your visit", "reschedul"]) {
        return Some("appointment");
    }
    if has(&["payment due", "past due", "bill is ready", "invoice", "overdraft", "refund", "statement is ready"]) && !m.labels.iter().any(|l| l == "CATEGORY_PROMOTIONS") {
        return Some("money");
    }
    None
}

fn noise(m: &Mail) -> bool {
    m.labels.iter().any(|l| l == "CATEGORY_PROMOTIONS" || l == "CATEGORY_SOCIAL" || l == "SPAM")
}

/// The email part of a briefing: what came in the last day, what's unread,
/// what needs attention — each count backed by the emails behind it — and
/// what couldn't be checked.
#[derive(Debug, Clone, Serialize, Default)]
pub struct Brief {
    /// Received in the last day (not promotions/social).
    pub received: Vec<Mail>,
    /// …of those, still unread.
    pub unread: usize,
    /// (email, why) — needs attention.
    pub important: Vec<(Mail, String)>,
    pub found: Found,
}

pub fn brief_from(f: Found) -> Brief {
    let mut received: Vec<Mail> = Vec::new();
    let mut important: Vec<(Mail, String)> = Vec::new();
    for m in &f.mails {
        if let Some(why) = why_important(m) {
            important.push((m.clone(), why.to_string()));
        }
        if !noise(m) {
            received.push(m.clone());
        }
    }
    let unread = received.iter().filter(|m| m.unread).count();
    Brief { received, unread, important, found: Found { mails: Vec::new(), ..f } }
}

/// The last day of email across every account.
pub fn brief() -> Result<Brief> {
    Ok(brief_from(search("newer_than:1d -in:chats", 40, None)?))
}

/// The briefing lines (pure, so it's tested).
pub fn brief_lines(b: &Brief) -> Vec<String> {
    let f = &b.found;
    let mut out = Vec::new();
    let many = f.checked.len() + f.failed.len() > 1;
    if f.checked.is_empty() {
        out.push("📧 I couldn't check your email this morning.".into());
    } else {
        let n = b.received.len();
        let checked = format!(
            "checked {} at {}",
            if f.checked.len() == 1 { f.checked[0].clone() } else { format!("{} Gmail accounts", f.checked.len()) },
            f.at
        );
        out.push(match n {
            0 => format!("📧 No new email in the last day ({checked})."),
            1 => format!("📧 1 email in the last day, {} unread ({checked}).", b.unread),
            n => format!("📧 {}{n} emails in the last day, {} unread ({checked}).", if f.more { "At least " } else { "" }, b.unread),
        });
        for (m, why) in b.important.iter().take(4) {
            out.push(format!("  ⭐ {} ({why})", line(m, many)));
        }
        let rest: Vec<&Mail> = b.received.iter().filter(|m| m.unread && !b.important.iter().any(|(i, _)| i.id == m.id && i.account == m.account)).take(4).collect();
        for m in rest {
            out.push(format!("  • {}", line(m, many)));
        }
    }
    for (acc, why) in &f.failed {
        out.push(format!("  ⚠️ Couldn't check {acc}: {why}"));
    }
    if f.needs_sign_in > 0 {
        out.push(format!("  ⚠️ {} Gmail link{} need signing in again (Apps → Gmail).", f.needs_sign_in, if f.needs_sign_in == 1 { "" } else { "s" }));
    }
    out
}

// ---------------------------------------------------------------------------

/// "Sam Lee <sam@x.com>" → "Sam Lee".
pub fn display_name(from: &str) -> String {
    let name = from.split('<').next().unwrap_or(from).trim().trim_matches('"').trim();
    if name.is_empty() {
        from.trim().trim_matches(|c| c == '<' || c == '>').to_string()
    } else {
        name.to_string()
    }
}

fn clip(s: &str, n: usize) -> String {
    if s.chars().count() <= n {
        s.to_string()
    } else {
        format!("{}…", s.chars().take(n).collect::<String>().trim_end())
    }
}

fn short(e: &str) -> String {
    clip(e.lines().next().unwrap_or(e), 140)
}

/// "lmm15180@gmail.com" → "l***@gmail.com", for logs only.
pub fn masked(a: &str) -> String {
    match a.split_once('@') {
        Some((u, d)) => format!("{}***@{d}", u.chars().next().unwrap_or('?')),
        None => "***".into(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Synthetic Gmail: accounts by link id, each with its emails.
    struct Fake {
        links: Vec<Link>,
        addrs: HashMap<String, String>,
        mail: HashMap<String, Vec<Value>>,
        broken: HashSet<String>,
    }

    fn email(id: &str, from: &str, subject: &str, labels: &[&str], ts: &str) -> Value {
        json!({ "messageId": id, "threadId": format!("t{id}"), "sender": from, "subject": subject, "labelIds": labels,
                "messageTimestamp": ts, "preview": { "body": "", "subject": subject }, "attachmentList": [] })
    }

    impl Source for Fake {
        fn links(&self) -> Result<Vec<Link>> {
            Ok(self.links.clone())
        }
        fn address(&self, link: &str) -> Result<String> {
            self.addrs.get(link).cloned().ok_or_else(|| anyhow!("no profile"))
        }
        fn fetch(&self, link: &str, query: &str, max: usize) -> Result<Value> {
            if self.broken.contains(link) {
                return Err(anyhow!("Composio answered 500: upstream error"));
            }
            // A tiny stand-in for Gmail search: any {…} alternative that
            // appears (case-insensitive, underscores as spaces) in the
            // sender or subject.
            let q = query.to_lowercase();
            let alts: Vec<String> = q
                .split(['{', '}'])
                .nth(1)
                .map(|inner| {
                    inner.split(' ').map(|a| a.trim_start_matches("from:").trim_start_matches("subject:").trim_matches('"').replace('_', " ")).filter(|a| !a.is_empty()).collect()
                })
                .unwrap_or_default();
            let all = self.mail.get(link).cloned().unwrap_or_default();
            let hits: Vec<Value> = all
                .into_iter()
                .filter(|m| {
                    let hay = format!("{} {}", m["sender"], m["subject"]).to_lowercase().replace('_', " ");
                    alts.is_empty() || alts.iter().any(|a| hay.contains(a.as_str()) || hay.replace(' ', "").contains(a.as_str()))
                })
                .filter(|m| !q.contains("is:unread") || m["labelIds"].as_array().unwrap().iter().any(|l| l == "UNREAD"))
                .take(max)
                .collect();
            Ok(json!({ "messages": hits, "resultSizeEstimate": 0 }))
        }
    }

    fn two_accounts() -> Fake {
        let link = |id: &str, st: &str, why: &str| Link { id: id.into(), status: st.into(), reason: why.into() };
        Fake {
            links: vec![
                link("ca_a", "ACTIVE", ""),
                link("ca_a2", "ACTIVE", ""), // the same address linked again
                link("ca_b", "ACTIVE", ""),
                link("ca_x", "EXPIRED", "Authorization was started but not completed within 10 minutes"),
            ],
            addrs: [("ca_a", "first@example.com"), ("ca_a2", "first@example.com"), ("ca_b", "second@example.com")]
                .into_iter()
                .map(|(a, b)| (a.to_string(), b.to_string()))
                .collect(),
            mail: [
                ("ca_a".to_string(), vec![email("1", "Sam <sam@example.com>", "Lunch?", &["INBOX", "UNREAD"], "2026-10-14T09:00:00Z")]),
                ("ca_a2".to_string(), vec![email("1", "Sam <sam@example.com>", "Lunch?", &["INBOX", "UNREAD"], "2026-10-14T09:00:00Z")]),
                (
                    "ca_b".to_string(),
                    vec![
                        email("9", "Home_Depot_Hiring <talent@careers.example.com>", "Next Steps in Your Application Journey", &["INBOX", "UNREAD", "CATEGORY_UPDATES"], "2026-10-14T11:21:00Z"),
                        email("10", "Deals <promo@shop.example.com>", "50% off everything", &["INBOX", "UNREAD", "CATEGORY_PROMOTIONS"], "2026-10-14T08:00:00Z"),
                    ],
                ),
            ]
            .into_iter()
            .collect(),
            broken: HashSet::new(),
        }
    }

    #[test]
    fn finds_home_depot_in_the_second_account() {
        let src = two_accounts();
        let (accs, dupes) = accounts(&src).unwrap();
        // The same address linked twice counts once; an abandoned sign-in isn't an account.
        assert_eq!(accs.iter().filter(|a| a.state == "ok").count(), 2);
        assert_eq!(dupes, 1);
        assert!(accs.iter().all(|a| a.state != "needs_sign_in"));
        let ask = parse_ask("Find my Home Depot email").unwrap();
        assert_eq!(ask.about, "home depot");
        let f = search_in(&src, &accs, dupes, &query_for(&ask), 10);
        assert_eq!(f.checked.len(), 2);
        assert_eq!(f.mails.len(), 1);
        assert_eq!(f.mails[0].account, "second@example.com");
        assert_eq!(f.mails[0].from, "Home_Depot_Hiring");
        let said = say(&ask, &f, &accs);
        assert!(said.contains("Home_Depot_Hiring") && said.contains("second@example.com"), "{said}");
        assert!(said.contains("all 2 of your Gmail accounts"), "{said}");
    }

    #[test]
    fn never_says_none_when_an_account_failed() {
        let mut src = two_accounts();
        src.broken.insert("ca_b".into());
        let (accs, dupes) = accounts(&src).unwrap();
        let ask = parse_ask("any emails from home depot?").unwrap();
        let f = search_in(&src, &accs, dupes, &query_for(&ask), 10);
        assert_eq!(f.checked, vec!["first@example.com".to_string()]);
        let said = say(&ask, &f, &accs);
        assert!(said.starts_with("No emails about “home depot” in first@example.com"), "{said}");
        assert!(said.contains("couldn't search second@example.com") && said.contains("might be there"), "{said}");
    }

    #[test]
    fn says_what_wasnt_linked() {
        let mut src = two_accounts();
        src.links.retain(|l| l.id == "ca_a");
        let (accs, d) = accounts(&src).unwrap();
        let ask = parse_ask("find my home depot email").unwrap();
        let said = say(&ask, &search_in(&src, &accs, d, &query_for(&ask), 10), &accs);
        assert!(said.contains("isn't linked to Izuki yet"), "{said}");
    }

    #[test]
    fn expired_links_are_reported_not_searched() {
        let mut src = two_accounts();
        src.links.push(Link { id: "ca_old".into(), status: "EXPIRED".into(), reason: "token expired".into() });
        let (accs, d) = accounts(&src).unwrap();
        let f = search_in(&src, &accs, d, "newer_than:1d", 10);
        assert_eq!(f.needs_sign_in, 1);
        let said = say(&parse_ask("check my unread emails").unwrap(), &f, &accs);
        assert!(said.contains("1 Gmail link needs signing in again"), "{said}");
    }

    #[test]
    fn one_account_when_asked() {
        let src = two_accounts();
        let (accs, d) = accounts(&src).unwrap();
        let ask = parse_ask("check my second gmail for unread emails").unwrap();
        assert_eq!(ask.account.as_deref(), Some("second"));
        let only = choose(&accs, ask.account.as_deref());
        assert_eq!(only.len(), 1);
        let f = search_in(&src, &only, d, &query_for(&ask), 10);
        assert_eq!(f.checked, vec!["second@example.com".to_string()]);
    }

    #[test]
    fn reads_requests_right() {
        assert!(parse_ask("send an email to sam").is_none());
        assert!(parse_ask("reply to the home depot email").is_none());
        assert!(parse_ask("what's important in my email").is_none());
        assert!(parse_ask("check my email").is_none());
        assert!(parse_ask("what is email").is_none());
        assert!(parse_ask("summarize my emails from sam").is_none());
        assert!(parse_ask("find the email from the marketing team").is_some_and(|a| a.about == "marketing team"));
        assert!(parse_ask("any emails from starbucks today").is_some_and(|a| a.about == "starbucks"));
        let a = parse_ask("did I get any emails from my professor today?").unwrap();
        assert_eq!((a.about.as_str(), a.when.as_str()), ("professor", "today"));
        let a = parse_ask("show me emails with attachments").unwrap();
        assert!(a.attachments && a.about.is_empty());
        let q = query_for(&parse_ask("find my home depot email").unwrap());
        assert!(q.contains("\"home depot\"") && q.contains("from:homedepot") && q.contains("from:home_depot"), "{q}");
    }

    #[test]
    fn briefing_counts_name_their_emails() {
        let src = two_accounts();
        let (accs, d) = accounts(&src).unwrap();
        let b = brief_from(search_in(&src, &accs, d, "newer_than:1d", 40));
        // Promotions aren't counted as received mail, but a hiring email in Updates is important.
        assert_eq!(b.received.len(), 2);
        assert_eq!(b.unread, 2);
        assert_eq!(b.important.len(), 1);
        assert_eq!(b.important[0].1, "job application");
        let lines = brief_lines(&b);
        assert!(lines[0].starts_with("📧 2 emails in the last day, 2 unread (checked 2 Gmail accounts"), "{lines:?}");
        // Every counted email is named: the important one and the other unread one.
        assert!(lines.iter().any(|l| l.contains("Home_Depot_Hiring")) && lines.iter().any(|l| l.contains("Sam")), "{lines:?}");
    }

    #[test]
    fn verified_only_when_every_account_was_searched() {
        use crate::model::TaskOutcome;
        let src = two_accounts();
        let (accs, d) = accounts(&src).unwrap();
        assert_eq!(coverage(&search_in(&src, &accs, d, "x", 10)), TaskOutcome::Verified);
        let mut broken = two_accounts();
        broken.broken.insert("ca_b".into());
        let (accs, d) = accounts(&broken).unwrap();
        assert_eq!(coverage(&search_in(&broken, &accs, d, "x", 10)), TaskOutcome::Partial);
        assert_eq!(coverage(&Found::default()), TaskOutcome::Blocked);
    }

    #[test]
    fn masks_addresses_for_logs() {
        assert_eq!(masked("someone@example.com"), "s***@example.com");
    }
}
