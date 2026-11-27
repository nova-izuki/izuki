//! Sites you're signed into. Through the browser extension Izuki works
//! inside the tab you're using, with your own sign-ins — it never sees,
//! stores or types a password. This decides where it may act:
//!
//! - ordinary sites: yes;
//! - money, health, government and sign-in pages: only once you've said so
//!   ("let Izuki use chase.com");
//! - sites you've blocked ("never let Izuki use reddit.com"): never.
//!
//! The rule is checked at the moment of every click and every typed word on
//! a page (ext.rs, automation.rs), so no plan or model can talk its way past
//! it, and a refused step is never retried with the mouse.

use crate::settings::Settings;

/// Starts every refusal, so a refused step stops instead of being tried
/// again another way (the mouse, the window behind).
pub const REFUSED: &str = "site_refused:";

pub fn refused(e: &anyhow::Error) -> bool {
    let e = e.to_string();
    // The extension's own refusals count too: a password, card or code box
    // (typing it with the keyboard would defeat it), and a tab that moved to
    // another site since the look (the next step takes a fresh one).
    e.starts_with(REFUSED) || e.contains("secret: I never type") || e.contains("page_changed:")
}

/// Keys that only leave or move around (close the tab, back, Esc, switch
/// tabs, reload): not acting on the site, so never held back by a rule.
pub fn leaving_key(key: &str) -> bool {
    let k = key.to_lowercase().replace(' ', "");
    const LEAVING: &[&str] = &[
        "ctrl+w", "ctrl+f4", "ctrl+t", "ctrl+n", "ctrl+shift+t", "ctrl+tab", "ctrl+shift+tab", "ctrl+pagedown", "ctrl+pageup",
        "alt+left", "alt+right", "browserback", "browserforward", "backspace+alt", "esc", "escape", "f5", "ctrl+r", "ctrl+l",
        "alt+f4", "win", "win+d", "alt+tab", "pageup", "pagedown", "home", "end", "up", "down",
    ];
    LEAVING.contains(&k.as_str())
}

/// The site's host, lower case, without "www." —
/// "https://www.Chase.com/acct" and "chase.com" both give "chase.com".
pub fn host_of(url: &str) -> String {
    let url = url.trim();
    let with_scheme = if url.contains("://") { url.to_string() } else { format!("https://{url}") };
    reqwest::Url::parse(&with_scheme)
        .ok()
        .and_then(|u| u.host_str().map(str::to_lowercase))
        .map(|h| h.trim_start_matches("www.").trim_end_matches('.').to_string())
        .unwrap_or_default()
}

/// A rule for "chase.com" covers chase.com and secure.chase.com.
fn covers(rule: &str, host: &str) -> bool {
    !rule.is_empty() && (host == rule || host.ends_with(&format!(".{rule}")))
}

/// Sites where one wrong click costs money, health records or an account:
/// Izuki asks before acting there, even when it's sure.
const MONEY: &[&str] = &[
    "paypal.com", "venmo.com", "cash.app", "wise.com", "stripe.com", "zellepay.com", "klarna.com", "afterpay.com",
    "chase.com", "bankofamerica.com", "wellsfargo.com", "capitalone.com", "citi.com", "usbank.com", "pnc.com",
    "discover.com", "americanexpress.com", "schwab.com", "fidelity.com", "vanguard.com", "robinhood.com",
    "coinbase.com", "binance.com", "kraken.com", "sofi.com", "chime.com", "ally.com", "hsbc.com", "barclays.co.uk",
    "revolut.com", "monzo.com", "n26.com", "opayweb.com", "kuda.com", "palmpay.com", "moniepoint.com",
    "flutterwave.com", "paystack.com", "remitly.com", "westernunion.com", "moneygram.com",
];
const HEALTH: &[&str] = &[
    "mychart.com", "followmyhealth.com", "kp.org", "myuhc.com", "anthem.com", "cigna.com", "aetna.com", "humana.com",
    "healthcare.gov", "medicare.gov", "nhs.uk",
];
const SIGN_IN: &[&str] = &[
    "accounts.google.com", "myaccount.google.com", "login.microsoftonline.com", "login.live.com", "account.microsoft.com",
    "appleid.apple.com", "account.apple.com", "id.apple.com",
];

/// What kind of careful site this is, if it is one.
pub fn careful(host: &str) -> Option<&'static str> {
    let listed = |list: &[&str]| list.iter().any(|r| covers(r, host));
    if listed(SIGN_IN) {
        return Some("sign-in");
    }
    if listed(MONEY) || host.contains("bank") || host.contains("creditunion") || host.ends_with(".fcu.org") {
        return Some("bank or payment");
    }
    if listed(HEALTH) || host.contains("mychart") || host.contains("patientportal") {
        return Some("health");
    }
    if host.ends_with(".gov") || host.contains(".gov.") || host.ends_with(".mil") {
        return Some("government");
    }
    None
}

#[derive(Debug, PartialEq)]
pub enum Verdict {
    Go,
    Blocked(String),
    Ask { host: String, kind: &'static str },
}

/// May Izuki click or type on this page?
pub fn verdict(url: &str, allowed: &[String], blocked: &[String]) -> Verdict {
    let host = host_of(url);
    if host.is_empty() || !url.trim_start().starts_with("http") {
        return Verdict::Go;
    }
    if blocked.iter().any(|r| covers(r, &host)) {
        return Verdict::Blocked(host);
    }
    if allowed.iter().any(|r| covers(r, &host)) {
        return Verdict::Go;
    }
    match careful(&host) {
        Some(kind) => Verdict::Ask { host, kind },
        None => Verdict::Go,
    }
}

/// The verdict as a step's error: `Err` stops the step (it starts with
/// [`REFUSED`]) and says plainly how to change it.
pub fn gate(url: &str) -> anyhow::Result<()> {
    let Some(store) = crate::state::try_store() else { return Ok(()) };
    let s = store.settings();
    match verdict(url, &s.sites_allowed, &s.sites_blocked) {
        Verdict::Go => Ok(()),
        Verdict::Blocked(host) => anyhow::bail!(
            "{REFUSED} You told me never to use {host}, so I stopped there. Say \"let Izuki use {host}\" if you change your mind."
        ),
        Verdict::Ask { host, kind } => anyhow::bail!(
            "{REFUSED} {host} looks like a {kind} site, so I don't click or type there unless you say so. Say \"let Izuki use {host}\" and ask me again."
        ),
    }
}

/// Lower case, hosts only, no repeats.
pub fn tidy(list: &mut Vec<String>) {
    let mut out: Vec<String> = Vec::new();
    for h in list.iter().map(|h| host_of(h)).filter(|h| !h.is_empty()) {
        if !out.contains(&h) {
            out.push(h);
        }
    }
    *list = out;
}

#[derive(Debug, PartialEq)]
pub enum Ask {
    Allow(String),
    Block(String),
    Forget(String),
    List,
}

/// "let izuki use chase.com", "never let izuki use reddit.com", "forget
/// chase.com", "which sites can you use?". The site must look like one
/// (a dotted name), so "forget my birthday" or "allow notifications" never
/// lands here.
pub fn parse(said: &str) -> Option<Ask> {
    let s = said.to_lowercase().replace(['’', '\''], "");
    // "@" stays, so an email address is seen as one and never taken for a site.
    let s: String = s.chars().map(|c| if c.is_alphanumeric() || " .-/:@".contains(c) { c } else { ' ' }).collect();
    let s = s.split_whitespace().collect::<Vec<_>>().join(" ");
    let s = s.trim_start_matches("hey ").trim_start_matches("nova ").trim_start_matches("please ");
    // "Izuki can use chase.com" needs its "izuki"; "Izuki, let Izuki use …"
    // doesn't. Both are tried.
    let calls = [s, s.strip_prefix("izuki ").unwrap_or(s)];
    // The first dotted word; an email address ("a@b.com") is never a site.
    let site = |rest: &str| {
        let word = rest.split_whitespace().find(|w| w.contains('.'))?.trim_end_matches('.');
        if word.contains('@') {
            return None;
        }
        let host = host_of(word);
        (host.contains('.') && host.chars().all(|c| c.is_ascii_alphanumeric() || c == '.' || c == '-')).then_some(host)
    };
    const LIST: &[&str] = &["which sites can you use", "what sites can you use", "which sites can izuki use", "what sites can izuki use", "show my sites", "list my sites", "my site permissions"];
    if calls.iter().any(|s| LIST.iter().any(|l| s.starts_with(l))) {
        return Some(Ask::List);
    }
    // Only phrasings that are clearly about Izuki acting on a site: "don't
    // use google.com" or "block youtube.com" may mean something else.
    const BLOCK: &[&str] = &["never let izuki use ", "dont let izuki use ", "do not let izuki use ", "keep izuki off ", "izuki cant use ", "you cant use ", "never use the site "];
    const ALLOW: &[&str] = &["let izuki use ", "you can use ", "allow izuki to use ", "allow izuki on ", "izuki can use ", "you may use "];
    for (list, make) in [(BLOCK, Ask::Block as fn(String) -> Ask), (ALLOW, Ask::Allow)] {
        if let Some(rest) = calls.iter().find_map(|s| list.iter().find_map(|p| s.strip_prefix(p))) {
            return site(rest).map(make);
        }
    }
    let s = calls[1];
    // "forget chase.com": the site alone, so "forget my email is a@b.com" or
    // "forget what I said about x.com" stay with memory.
    if let Some(rest) = ["forget the site ", "forget site "].iter().find_map(|p| s.strip_prefix(p)) {
        return site(rest).map(Ask::Forget);
    }
    if let Some(rest) = s.strip_prefix("forget ").filter(|r| r.split_whitespace().count() == 1) {
        return site(rest).map(Ask::Forget);
    }
    None
}

/// Carry out a site request and say what changed.
pub fn handle(ask: Ask) -> String {
    change(ask).map(|(_, reply)| reply).unwrap_or_else(|| "I can't change that just now — try again in a moment.".into())
}

/// One change to the site rules, made on the stored lists (never a stale
/// copy): the settings after it, and what to say. `None`: no store yet.
pub fn change(ask: Ask) -> Option<(Settings, String)> {
    let store = crate::state::try_store()?;
    if matches!(ask, Ask::List) {
        let mut s = store.settings();
        let reply = apply(&mut s, &ask);
        return Some((s, reply));
    }
    let (s, reply) = store.change_sites(|s| apply(s, &ask));
    crate::state::settings_changed_elsewhere();
    Some((s, reply))
}

/// A site name as typed in Settings ("www.Chase.com/login" → "chase.com"),
/// or `None` when it isn't one.
pub fn site_name(typed: &str) -> Option<String> {
    let host = host_of(typed.trim());
    (host.contains('.') && !typed.contains('@') && host.chars().all(|c| c.is_ascii_alphanumeric() || c == '.' || c == '-')).then_some(host)
}

/// The change itself, on a copy of the settings (testable).
fn apply(s: &mut Settings, ask: &Ask) -> String {
    let without = |list: &mut Vec<String>, host: &str| list.retain(|h| h != host);
    match ask {
        Ask::Allow(host) => {
            // A block on the site it belongs to still wins: say so, change nothing.
            if let Some(parent) = s.sites_blocked.iter().find(|r| r.as_str() != host.as_str() && covers(r, host)) {
                return format!("You told me never to use {parent}, and {host} is part of it. Say \"forget {parent}\" first if you want me there.");
            }
            without(&mut s.sites_blocked, host);
            if !s.sites_allowed.contains(host) {
                s.sites_allowed.push(host.clone());
            }
            format!("Okay — I'll act on {host} when you ask. I still check with you before anything is sent, paid or deleted, and I never type passwords or card numbers; those stay with you.")
        }
        Ask::Block(host) => {
            without(&mut s.sites_allowed, host);
            if !s.sites_blocked.contains(host) {
                s.sites_blocked.push(host.clone());
            }
            format!("Done. I won't click or type anything on {host}.")
        }
        Ask::Forget(host) => {
            without(&mut s.sites_allowed, host);
            without(&mut s.sites_blocked, host);
            match careful(host) {
                Some(kind) => format!("{host} is back to normal: it looks like a {kind} site, so I'll ask before acting there."),
                None => format!("{host} is back to normal."),
            }
        }
        Ask::List => {
            let mut lines = Vec::new();
            if !s.sites_allowed.is_empty() {
                lines.push(format!("You've let me use {}.", s.sites_allowed.join(", ")));
            }
            if !s.sites_blocked.is_empty() {
                lines.push(format!("I never touch {}.", s.sites_blocked.join(", ")));
            }
            if lines.is_empty() {
                lines.push("You haven't changed any sites yet.".into());
            }
            lines.push("Everywhere else I work in sites you're signed into, ask first on bank, payment, health, government and sign-in pages, and never type passwords or card numbers.".into());
            lines.join(" ")
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hosts_are_plain_and_rules_cover_subdomains() {
        assert_eq!(host_of("https://www.Chase.com/acct?x=1"), "chase.com");
        assert_eq!(host_of("chase.com"), "chase.com");
        assert_eq!(host_of("http://secure.chase.com"), "secure.chase.com");
        assert_eq!(host_of("not a url"), "");
        assert!(covers("chase.com", "secure.chase.com"));
        assert!(!covers("chase.com", "notchase.com"), "a name that only ends the same is another site");
    }

    #[test]
    fn careful_sites_need_a_yes_blocked_never_ordinary_go() {
        let none: Vec<String> = vec![];
        assert_eq!(verdict("https://www.youtube.com/watch?v=1", &none, &none), Verdict::Go);
        assert_eq!(verdict("https://secure.chase.com/x", &none, &none), Verdict::Ask { host: "secure.chase.com".into(), kind: "bank or payment" });
        assert!(matches!(verdict("https://www.gtbank.com", &none, &none), Verdict::Ask { kind: "bank or payment", .. }));
        assert!(matches!(verdict("https://www.irs.gov/refunds", &none, &none), Verdict::Ask { kind: "government", .. }));
        assert!(matches!(verdict("https://accounts.google.com/signin", &none, &none), Verdict::Ask { kind: "sign-in", .. }));
        // Your yes covers the site and its pages.
        assert_eq!(verdict("https://secure.chase.com/x", &["chase.com".into()], &none), Verdict::Go);
        // Blocked wins over everything, even a yes.
        assert_eq!(verdict("https://www.reddit.com/r/x", &["reddit.com".into()], &["reddit.com".into()]), Verdict::Blocked("reddit.com".into()));
        // Not a web page: nothing to decide.
        assert_eq!(verdict("file:///C:/notes.txt", &none, &none), Verdict::Go);
    }

    #[test]
    fn site_requests_are_understood_and_others_left_alone() {
        assert_eq!(parse("Let Izuki use chase.com"), Some(Ask::Allow("chase.com".into())));
        assert_eq!(parse("hey nova, never let Izuki use www.reddit.com"), Some(Ask::Block("reddit.com".into())));
        assert_eq!(parse("keep Izuki off tiktok.com please"), Some(Ask::Block("tiktok.com".into())));
        assert_eq!(parse("forget chase.com"), Some(Ask::Forget("chase.com".into())));
        assert_eq!(parse("Which sites can you use?"), Some(Ask::List));
        assert_eq!(parse("Izuki can use amazon.com"), Some(Ask::Allow("amazon.com".into())));
        assert_eq!(parse("Izuki, never let Izuki use x.com"), Some(Ask::Block("x.com".into())));
        assert_eq!(parse("let Izuki use a@b.com"), None, "an email address is never a site");
        // Not about Izuki and a site: left for the rest of Izuki.
        assert_eq!(parse("forget that I like jazz"), None);
        assert_eq!(parse("forget my email is a@b.com"), None, "memory, not a site");
        assert_eq!(parse("forget what I said about x.com"), None);
        assert_eq!(parse("allow notifications"), None);
        assert_eq!(parse("don't use google.com, use bing"), None, "a search preference, not a block");
        assert_eq!(parse("block youtube.com for an hour"), None);
        assert_eq!(parse("open chase.com"), None);
    }

    #[test]
    fn a_yes_or_a_block_moves_the_site_and_forget_puts_it_back() {
        let mut s = Settings::default();
        apply(&mut s, &Ask::Block("chase.com".into()));
        assert_eq!(s.sites_blocked, vec!["chase.com".to_string()]);
        apply(&mut s, &Ask::Allow("chase.com".into()));
        assert!(s.sites_blocked.is_empty(), "a yes lifts the block");
        assert_eq!(s.sites_allowed, vec!["chase.com".to_string()]);
        let said = apply(&mut s, &Ask::Forget("chase.com".into()));
        assert!(s.sites_allowed.is_empty() && said.contains("ask before"));
        // A yes under a blocked parent says so and changes nothing.
        let mut t = Settings::default();
        apply(&mut t, &Ask::Block("chase.com".into()));
        let said = apply(&mut t, &Ask::Allow("secure.chase.com".into()));
        assert!(t.sites_allowed.is_empty() && said.contains("forget chase.com"));
        // Leaving a site is never held back; acting keys are.
        assert!(leaving_key("Ctrl+W") && leaving_key("alt+left") && leaving_key("Esc"));
        assert!(!leaving_key("enter") && !leaving_key("ctrl+v") && !leaving_key("space"));
        let mut list = vec!["https://www.Chase.com/x".to_string(), "chase.com".into(), "".into()];
        tidy(&mut list);
        assert_eq!(list, vec!["chase.com".to_string()]);
    }
}
