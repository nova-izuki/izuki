//! Who signed in to this PC, and who tried: read from the system's own
//! records, never guessed. "Help me investigate suspicious login activity"
//! gets real evidence: Windows' Security log (4624 signed in, 4625 failed to)
//! or, on Linux, the authentication log (sshd, login, display managers).
//!
//! Read only. Nothing here changes a setting, turns auditing on or clears a
//! log; a change the person might want ("record failed sign-ins") is only
//! suggested, for them to say yes to. Windows keeps the Security log for
//! administrators: when Izuki can't read it, it says so, and reads it with
//! administrator rights only after the person agreed to Windows' own prompt.
//!
//! The patterns are general (bursts of failures, many usernames from one
//! place, a success right after failures, sign-ins from outside the network,
//! lockouts, unusual hours) and every finding carries the events it rests
//! on, so the summary can show its evidence and nothing is invented.

use std::collections::{BTreeMap, BTreeSet};

/// One sign-in, or one failed try, in a common shape for every system.
#[derive(Debug, Clone, PartialEq)]
pub struct Logon {
    /// UTC, `YYYY-MM-DDTHH:MM:SS`.
    pub at: String,
    pub ok: bool,
    pub user: String,
    pub domain: String,
    /// How: "at the PC", "unlock", "network", "remote desktop", "ssh"…
    pub how: String,
    /// Where from (an IP address), when it was over the network.
    pub from: Option<String>,
    pub workstation: Option<String>,
    /// Why it failed, in plain words.
    pub why: Option<String>,
    /// The record's own number (Windows) or line (Linux), for the evidence.
    pub record: String,
}

impl Logon {
    pub fn line(&self) -> String {
        format!(
            "{} · {} · {}{} · {}{}{} [{}]",
            self.at.replace('T', " "),
            if self.ok { "signed in" } else { "FAILED" },
            if self.domain.is_empty() || self.domain == "-" { String::new() } else { format!("{}\\", self.domain) },
            self.user,
            self.how,
            self.from.as_deref().map(|f| format!(" from {f}")).unwrap_or_default(),
            self.why.as_deref().map(|w| format!(" ({w})")).unwrap_or_default(),
            self.record
        )
    }
}

// ---------------------------------------------------------------------------
// Windows: `wevtutil qe Security /f:xml` (one <Event> after another)
// ---------------------------------------------------------------------------

fn unescape(s: &str) -> String {
    s.replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", "\"").replace("&apos;", "'").replace("&amp;", "&")
}

fn between<'a>(s: &'a str, start: &str, end: &str) -> Option<&'a str> {
    let i = s.find(start)? + start.len();
    let j = s[i..].find(end)? + i;
    Some(&s[i..j])
}

/// `<Data Name='X'>value</Data>` (either quote; empty or `-` is none).
fn data(event: &str, name: &str) -> Option<String> {
    for q in ['\'', '"'] {
        let open = format!("<Data Name={q}{name}{q}>");
        if let Some(v) = between(event, &open, "</Data>") {
            let v = unescape(v.trim());
            return (!v.is_empty() && v != "-").then_some(v);
        }
    }
    None
}

fn system_time(event: &str) -> Option<String> {
    for q in ['\'', '"'] {
        if let Some(t) = between(event, &format!("SystemTime={q}"), &q.to_string()) {
            return Some(t.chars().take(19).collect());
        }
    }
    None
}

fn logon_type(t: Option<&str>) -> String {
    match t.and_then(|t| t.parse::<u8>().ok()) {
        Some(2) => "at the PC",
        Some(3) => "network",
        Some(4) => "scheduled task",
        Some(5) => "service",
        Some(7) => "unlock",
        Some(8) => "network (plain-text password)",
        Some(9) => "run as",
        Some(10) => "remote desktop",
        Some(11) => "at the PC (cached)",
        _ => "other",
    }
    .into()
}

/// Windows' failure codes, said plainly.
fn failure(sub: Option<&str>, status: Option<&str>) -> String {
    let code = sub.filter(|s| *s != "0x0").or(status).unwrap_or("").to_lowercase();
    match code.as_str() {
        "0xc000006a" => "wrong password",
        "0xc0000064" => "no such user",
        "0xc0000234" => "account locked out",
        "0xc0000072" => "account disabled",
        "0xc000006f" => "outside allowed hours",
        "0xc0000070" => "not allowed from this PC",
        "0xc0000071" => "password expired",
        "0xc0000193" => "account expired",
        "0xc0000224" => "must change password",
        "0xc000015b" => "that kind of sign-in isn't allowed",
        "0xc0000133" => "clock out of sync",
        "0xc000006d" => "bad user name or password",
        "" => "unknown reason",
        other => return format!("code {other}"),
    }
    .into()
}

/// Sign-ins Windows does for itself (services, the desktop, machine
/// accounts): not a person, so not evidence of one.
fn machine(user: &str, how: &str) -> bool {
    let u = user.to_uppercase();
    how == "service"
        || u.ends_with('$')
        || ["SYSTEM", "LOCAL SERVICE", "NETWORK SERVICE", "ANONYMOUS LOGON"].contains(&u.as_str())
        || u.starts_with("DWM-")
        || u.starts_with("UMFD-")
}

pub fn parse_windows(xml: &str) -> Vec<Logon> {
    let mut out = Vec::new();
    for chunk in xml.split("<Event ").skip(1) {
        let event = chunk.split("</Event>").next().unwrap_or(chunk);
        let id = between(event, "<EventID>", "</EventID>").or_else(|| between(event, "<EventID ", "</EventID>").and_then(|s| s.rsplit('>').next()));
        let ok = match id.map(str::trim) {
            Some("4624") => true,
            Some("4625") => false,
            _ => continue,
        };
        let Some(at) = system_time(event) else { continue };
        let user = data(event, "TargetUserName").unwrap_or_else(|| "?".into());
        let how = logon_type(data(event, "LogonType").as_deref());
        if machine(&user, &how) {
            continue;
        }
        let from = data(event, "IpAddress").filter(|ip| !["::1", "127.0.0.1"].contains(&ip.as_str()));
        out.push(Logon {
            at,
            ok,
            user,
            domain: data(event, "TargetDomainName").unwrap_or_default(),
            how,
            from,
            workstation: data(event, "WorkstationName"),
            why: (!ok).then(|| failure(data(event, "SubStatus").as_deref(), data(event, "Status").as_deref())),
            record: between(event, "<EventRecordID>", "</EventRecordID>").map(|r| format!("event {} #{}", if ok { 4624 } else { 4625 }, r.trim())).unwrap_or_default(),
        });
    }
    out
}

// ---------------------------------------------------------------------------
// Linux: auth.log / `journalctl -o short-iso`
// ---------------------------------------------------------------------------

const MONTHS: [&str; 12] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/// "2026-11-14T21:13:05+0000 host …" or "Nov 14 21:13:05 host …" (the year
/// from `year`): the time, and the rest of the line after the host.
fn linux_time(line: &str, year: i32) -> Option<(String, &str)> {
    use chrono::TimeZone;
    let first = line.split_whitespace().next()?;
    if first.len() >= 19 && first.as_bytes()[4] == b'-' && first.as_bytes()[10] == b'T' {
        let rest = line[first.len()..].trim_start();
        let rest = rest.split_once(' ').map(|(_, r)| r).unwrap_or("");
        // journalctl is asked for --utc, but auth.log can carry an offset.
        // Convert it, never just chop it off and call the clock UTC.
        let at = chrono::DateTime::parse_from_str(first, "%Y-%m-%dT%H:%M:%S%z")
            .map(|d| d.with_timezone(&chrono::Utc).format("%Y-%m-%dT%H:%M:%S").to_string())
            .unwrap_or_else(|_| {
                chrono::NaiveDateTime::parse_from_str(&first[..19], "%Y-%m-%dT%H:%M:%S")
                    .map(|n| chrono::Utc.from_utc_datetime(&n).format("%Y-%m-%dT%H:%M:%S").to_string())
                    .unwrap_or_else(|_| first[..19].to_string())
            });
        return Some((at, rest));
    }
    let mut parts = line.splitn(5, ' ').filter(|p| !p.is_empty());
    let (mon, day, time) = (parts.next()?, parts.next()?, parts.next()?);
    let m = (MONTHS.iter().position(|x| *x == mon)? + 1) as u32;
    let day: u32 = day.parse().ok()?;
    if time.len() != 8 {
        return None;
    }
    let hh: u32 = time[0..2].parse().ok()?;
    let mm: u32 = time[3..5].parse().ok()?;
    let ss: u32 = time[6..8].parse().ok()?;
    let naive = chrono::NaiveDate::from_ymd_opt(year, m, day)?.and_hms_opt(hh, mm, ss)?;
    // A legacy syslog line has no zone: it's the machine's local clock.
    let at = chrono::Local.from_local_datetime(&naive).earliest()
        .map(|d| d.with_timezone(&chrono::Utc))
        .unwrap_or_else(|| chrono::Utc.from_utc_datetime(&naive))
        .format("%Y-%m-%dT%H:%M:%S").to_string();
    let after_time = line.find(time)? + time.len();
    let rest = line[after_time..].trim_start();
    let rest = rest.split_once(' ').map(|(_, r)| r).unwrap_or("");
    Some((at, rest))
}

fn word_after<'a>(s: &'a str, key: &str) -> Option<&'a str> {
    let i = s.find(key)? + key.len();
    s[i..].split_whitespace().next()
}

pub fn parse_linux(log: &str, year: i32) -> Vec<Logon> {
    let mut out = Vec::new();
    // sshd says "Invalid user X from Y" and then, for a password try, "Failed
    // password for invalid user X from Y": one try, counted once.
    let mut probes: Vec<(String, String, i64, bool)> = Vec::new();
    for (n, line) in log.lines().enumerate() {
        let Some((at, rest)) = linux_time(line, year) else { continue };
        let record = format!("line {}", n + 1);
        let push = |out: &mut Vec<Logon>, ok: bool, user: &str, how: &str, from: Option<&str>, why: Option<&str>| {
            out.push(Logon {
                at: at.clone(),
                ok,
                user: user.trim_matches('\'').to_string(),
                domain: String::new(),
                how: how.into(),
                from: from.map(String::from).filter(|f| !["::1", "127.0.0.1"].contains(&f.as_str())),
                workstation: None,
                why: why.map(String::from),
                record: record.clone(),
            })
        };
        if rest.starts_with("sshd") {
            if let Some(body) = rest.split_once("Accepted ").map(|(_, b)| b) {
                // "password for bob from 192.168.1.10 port 51234 ssh2"
                let user = word_after(body, " for ").unwrap_or("?");
                push(&mut out, true, user, "ssh", word_after(body, " from "), None);
            } else if let Some(body) = rest.split_once("Failed ").map(|(_, b)| b) {
                let invalid = body.contains(" for invalid user ");
                let user = if invalid { word_after(body, " invalid user ") } else { word_after(body, " for ") }.unwrap_or("?");
                let from = word_after(body, " from ").unwrap_or("");
                // One "Invalid user" line is one probe. It may explain only
                // one following failure; several password attempts are still
                // several attempts and must be counted.
                let counted = invalid && {
                    let probe = probes.iter_mut().find(|(u, f, t, used)| {
                        !*used && u == user && f == from && (seconds(&at) - *t).abs() <= 10
                    });
                    if let Some((_, _, _, used)) = probe { *used = true; true } else { false }
                };
                if !counted {
                    push(&mut out, false, user, "ssh", Some(from).filter(|f| !f.is_empty()), Some(if invalid { "no such user" } else { "wrong password" }));
                }
            } else if let Some(body) = rest.split_once("Invalid user ").map(|(_, b)| b) {
                let user = body.split_whitespace().next().unwrap_or("?");
                let from = word_after(body, " from ").unwrap_or("");
                probes.push((user.to_string(), from.to_string(), seconds(&at), false));
                push(&mut out, false, user, "ssh", Some(from).filter(|f| !f.is_empty()), Some("no such user"));
            }
        } else if rest.starts_with("login") && rest.contains("FAILED LOGIN") {
            let user = rest.split_once(" FOR ").and_then(|(_, r)| r.split(',').next()).unwrap_or("?");
            push(&mut out, false, user, "at the PC", None, Some("wrong password"));
        } else if rest.contains("pam_unix(") && rest.contains("session opened for user ") {
            // At the PC (a console or a desktop sign-in); ssh is counted from
            // its own "Accepted" line, and cron or sudo aren't sign-ins.
            let how = if ["(login:", "gdm", "lightdm", "sddm"].iter().any(|k| rest.contains(k)) { "at the PC" } else { continue };
            let user = word_after(rest, "session opened for user ").unwrap_or("?");
            let user = user.split('(').next().unwrap_or(user);
            push(&mut out, true, user, how, None, None);
        }
    }
    out
}

// ---------------------------------------------------------------------------
// What stands out
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, PartialEq)]
pub struct Finding {
    /// "worth a look" or "probably fine".
    pub serious: bool,
    pub what: String,
    /// The events it rests on (a few).
    pub evidence: Vec<String>,
}

fn seconds(at: &str) -> i64 {
    chrono::NaiveDateTime::parse_from_str(at, "%Y-%m-%dT%H:%M:%S").map(|t| t.and_utc().timestamp()).unwrap_or(0)
}

/// Not this network: a public address.
fn outside(ip: &str) -> bool {
    match ip.parse::<std::net::IpAddr>() {
        Ok(std::net::IpAddr::V4(v4)) => !(v4.is_private() || v4.is_loopback() || v4.is_link_local() || v4.is_unspecified()),
        Ok(std::net::IpAddr::V6(v6)) => {
            let first = v6.segments()[0];
            !(v6.is_loopback() || v6.is_unspecified() || (first & 0xfe00) == 0xfc00 || (first & 0xffc0) == 0xfe80)
        }
        Err(_) => false,
    }
}

const WINDOW: i64 = 10 * 60;

fn evidence(list: &[&Logon]) -> Vec<String> {
    let mut lines: Vec<String> = list.iter().take(4).map(|l| l.line()).collect();
    if list.len() > 4 {
        lines.push(format!("…and {} more like these", list.len() - 4));
    }
    lines
}

/// Who the account is, including its Windows domain: DOMAIN_A/bob and
/// DOMAIN_B/bob are not the same person.
fn account(l: &Logon) -> String {
    if l.domain.is_empty() || l.domain == "-" {
        l.user.to_lowercase()
    } else {
        format!("{}\\{}", l.domain.to_lowercase(), l.user.to_lowercase())
    }
}

/// The patterns, oldest evidence first. `events` in any order.
pub fn analyze(events: &[Logon]) -> Vec<Finding> {
    let mut sorted: Vec<&Logon> = events.iter().collect();
    sorted.sort_by(|a, b| a.at.cmp(&b.at));
    let mut out = Vec::new();
    let fails: Vec<&Logon> = sorted.iter().copied().filter(|l| !l.ok).collect();

    // A burst of failures against one account, or from one place. Parse
    // each timestamp once and keep a moving window: Linux reads are not
    // capped, so a busy auth log must not become quadratic.
    let mut by: BTreeMap<String, Vec<&Logon>> = BTreeMap::new();
    for f in &fails {
        by.entry(format!("the account {}", account(f))).or_default().push(f);
        if let Some(from) = &f.from {
            by.entry(from.clone()).or_default().push(f);
        }
    }
    let mut burst_seen = BTreeSet::new();
    for (who, list) in &by {
        let times: Vec<i64> = list.iter().map(|l| seconds(&l.at)).collect();
        let (mut start, mut best, mut best_at) = (0usize, 0usize, 0usize);
        for end in 0..list.len() {
            while times[end] - times[start] > WINDOW {
                start += 1;
            }
            let count = end - start + 1;
            if count > best {
                best = count;
                best_at = start;
            }
        }
        if best >= 5 && burst_seen.insert(who.clone()) {
            // The evidence and the user count are about the burst that won,
            // not every failure this account ever had.
            let winning = &list[best_at..best_at + best];
            let users: BTreeSet<&str> = winning.iter().map(|l| l.user.as_str()).collect();
            let what = if who.starts_with("the account") {
                format!("{best} failed sign-ins to {who} within 10 minutes: someone (or something) kept trying passwords.")
            } else if users.len() >= 3 {
                format!("{best} failed sign-ins from {who} within 10 minutes, trying {} different user names: that looks like guessing.", users.len())
            } else {
                format!("{best} failed sign-ins from {who} within 10 minutes.")
            };
            out.push(Finding { serious: true, what, evidence: evidence(winning) });
        }
    }

    // A success right after failures for the same account. Binary-search the
    // account's sorted failures instead of rescanning every earlier event.
    let mut failures_by: BTreeMap<String, Vec<&Logon>> = BTreeMap::new();
    for f in &fails {
        failures_by.entry(account(f)).or_default().push(f);
    }
    for ok in sorted.iter().copied().filter(|l| l.ok) {
        let Some(list) = failures_by.get(&account(ok)) else { continue };
        let ok_at = seconds(&ok.at);
        let hi = list.partition_point(|l| seconds(&l.at) <= ok_at);
        let lo = list.partition_point(|l| seconds(&l.at) < ok_at - WINDOW);
        let before = &list[lo..hi];
        if before.len() >= 3 {
            // Keep room for the successful sign-in the finding talks about.
            let mut list: Vec<&Logon> = before.iter().rev().take(3).rev().copied().collect();
            list.push(ok);
            out.push(Finding {
                serious: true,
                what: format!("{} signed in after {} failed tries in the 10 minutes before. If that was you mistyping, it's fine; if not, change that password.", ok.user, before.len()),
                evidence: evidence(&list),
            });
        }
    }

    // From outside the network.
    let outside_ok: Vec<&Logon> = sorted.iter().copied().filter(|l| l.ok && l.from.as_deref().is_some_and(outside)).collect();
    if !outside_ok.is_empty() {
        let places: BTreeSet<&str> = outside_ok.iter().filter_map(|l| l.from.as_deref()).collect();
        out.push(Finding {
            serious: true,
            what: format!("{} sign-in(s) succeeded from outside your network ({}). Check each one was you.", outside_ok.len(), places.into_iter().collect::<Vec<_>>().join(", ")),
            evidence: evidence(&outside_ok),
        });
    }
    let outside_fail: Vec<&Logon> = fails.iter().copied().filter(|l| l.from.as_deref().is_some_and(outside)).collect();
    if !outside_fail.is_empty() && !out.iter().any(|f| f.what.contains("failed sign-ins from")) {
        out.push(Finding {
            serious: outside_fail.len() >= 3,
            what: format!("{} failed sign-in(s) came from outside your network: something on the internet can reach a sign-in on this PC.", outside_fail.len()),
            evidence: evidence(&outside_fail),
        });
    }

    // Lockouts.
    let locked: Vec<&Logon> = fails.iter().copied().filter(|l| l.why.as_deref() == Some("account locked out")).collect();
    if !locked.is_empty() {
        out.push(Finding { serious: true, what: format!("An account was locked out {} time(s) after too many wrong passwords.", locked.len()), evidence: evidence(&locked) });
    }

    // Sign-ins at the PC at an hour this person never otherwise signs in.
    let at_pc: Vec<&Logon> = sorted.iter().copied().filter(|l| l.ok && (l.how.starts_with("at the PC") || l.how == "unlock" || l.how == "remote desktop")).collect();
    if at_pc.len() >= 10 {
        let hour = |l: &Logon| l.at.get(11..13).and_then(|h| h.parse::<u32>().ok()).unwrap_or(0);
        let mut hours = [0usize; 24];
        for l in &at_pc {
            hours[hour(l) as usize] += 1;
        }
        let odd: Vec<&Logon> = at_pc.iter().copied().filter(|l| hours[hour(l) as usize] == 1).collect();
        if !odd.is_empty() && odd.len() * 10 <= at_pc.len() {
            out.push(Finding {
                serious: false,
                what: format!("{} sign-in(s) at an hour you don't usually sign in (times are UTC). Probably you, but worth a glance.", odd.len()),
                evidence: evidence(&odd),
            });
        }
    }
    out
}

/// The investigation, as text for the assistant and the person: what was
/// read, what stands out (each with its evidence), and what looks normal.
pub fn report(events: &[Logon], source: &str, days: u32) -> String {
    let ok = events.iter().filter(|l| l.ok).count();
    let failed = events.len() - ok;
    let users: BTreeSet<&str> = events.iter().filter(|l| l.ok).map(|l| l.user.as_str()).collect();
    let mut kinds: BTreeMap<&str, usize> = BTreeMap::new();
    for l in events.iter().filter(|l| l.ok) {
        *kinds.entry(l.how.as_str()).or_default() += 1;
    }
    let mut s = format!(
        "Read from {source}, the last {days} day(s): {ok} sign-in(s) by people ({}), {failed} failed tr{}.\n",
        if users.is_empty() { "none".to_string() } else { users.iter().copied().collect::<Vec<_>>().join(", ") },
        if failed == 1 { "y" } else { "ies" }
    );
    if !kinds.is_empty() {
        s.push_str(&format!("How: {}.\n", kinds.iter().map(|(k, n)| format!("{n} {k}")).collect::<Vec<_>>().join(", ")));
    }
    let findings = analyze(events);
    if events.is_empty() {
        s.push_str("No 4624 or 4625 records came back in this range. That can mean nobody signed in, or that Windows is not recording these sign-ins (auditing can be off). This read cannot tell those apart; check Local Security Policy → Audit Policy if you expected records.\n");
    } else if findings.is_empty() {
        s.push_str("Nothing stands out: no bursts of failures, no sign-ins from outside your network, no lockouts.\n");
    }
    for f in &findings {
        s.push_str(&format!("{} {}\n", if f.serious { "⚠" } else { "•" }, f.what));
        for e in &f.evidence {
            s.push_str(&format!("    {e}\n"));
        }
    }
    let recent: Vec<String> = {
        let mut v: Vec<&Logon> = events.iter().collect();
        v.sort_by(|a, b| b.at.cmp(&a.at));
        v.into_iter().take(6).map(|l| l.line()).collect()
    };
    if !recent.is_empty() {
        s.push_str("Most recent:\n");
        for r in recent {
            s.push_str(&format!("    {r}\n"));
        }
    }
    let outside = findings.iter().any(|f| f.what.contains("outside your network"));
    let guessing = findings.iter().any(|f| f.what.contains("different user names") || f.what.contains("kept trying passwords"));
    s.push_str("What you can do next:\n");
    if outside {
        s.push_str("    If a sign-in from outside your network wasn't you: change that password, sign out other sessions, turn on multi-factor sign-in, and check Remote Desktop and VPN access.\n");
    }
    if guessing {
        s.push_str("    If the failed attempts weren't you: keep a strong password and multi-factor sign-in on the account, and check whether a remote service is exposed to the internet.\n");
    }
    if !outside && !guessing {
        s.push_str("    No action is needed from this log alone; if something still feels wrong, check the account's recent activity in its own settings.\n");
    }
    s.push_str("(Times are UTC. Only what the log recorded is here; the read was read-only and no setting was changed. Findings are patterns to check, not proof of an attack.)");
    s
}

// ---------------------------------------------------------------------------
// Reading the real log
// ---------------------------------------------------------------------------

/// What reading the log came to.
pub enum Read {
    Events { source: String, events: Vec<Logon>, capped: bool },
    /// Windows keeps it for administrators.
    NeedsAdmin,
    Unavailable(String),
}

/// "today", "week", "month", or a number of days: how far back.
pub fn days_from(said: &str) -> u32 {
    let s = said.to_lowercase();
    let tokens: Vec<&str> = s
        .split(|c: char| !c.is_ascii_alphanumeric())
        .filter(|w| !w.is_empty())
        .collect();
    // A number only means a range when its unit follows it: "24 hours" is a
    // day, "Windows 11" is not eleven days, and "3 failed logins" is not three
    // days. The old first-number scan got all three wrong.
    for pair in tokens.windows(2) {
        let Ok(n) = pair[0].parse::<u32>() else { continue };
        let days = match pair[1] {
            "hour" | "hours" => (n + 23) / 24,
            "day" | "days" => n,
            "week" | "weeks" => n.saturating_mul(7),
            "month" | "months" => n.saturating_mul(30),
            _ => continue,
        };
        return days.clamp(1, 90);
    }
    if let Ok(n) = s.trim().parse::<u32>() {
        return n.clamp(1, 90);
    }
    if s.contains("today") || s.contains("24") { 1 } else if s.contains("month") { 30 } else { 7 }
}

#[cfg(windows)]
pub fn read(days: u32, as_admin: bool) -> Read {
    use std::os::windows::process::CommandExt;
    const NO_WINDOW: u32 = 0x0800_0000;
    let ms = u64::from(days) * 86_400_000;
    let query = format!("*[System[(EventID=4624 or EventID=4625) and TimeCreated[timediff(@SystemTime) <= {ms}]]]");
    if as_admin {
        // Two administrator reads share output names and a UAC prompt; only
        // one may hold them at a time.
        static ADMIN_READ: parking_lot::Mutex<()> = parking_lot::Mutex::new(());
        let Some(_one_at_a_time) = ADMIN_READ.try_lock() else {
            return Read::Unavailable("another administrator read is already waiting for approval".into());
        };
        let Some(dir) = dirs::data_dir().map(|d| d.join("Izuki").join("investigate")) else { return Read::Unavailable("no data folder".into()) };
        let _ = std::fs::create_dir_all(&dir);
        let out = dir.join("security-logons.xml");
        let err = dir.join("security-logons.err");
        let done = dir.join("security-logons.done");
        for f in [&out, &err, &done] {
            let _ = std::fs::remove_file(f);
        }
        // The fixed command runs from an encoded, fixed command line. It is
        // not written to a user-writable script that could be swapped while
        // Windows' prompt is open (TOCTOU).
        let q = |s: &str| format!("'{}'", s.replace('\'', "''"));
        let body = format!(
            "$q = {}\n& wevtutil qe Security \"/q:$q\" /f:xml /rd:true /c:3000 | Out-File -FilePath {} -Encoding utf8\n$code = $LASTEXITCODE\nSet-Content -Path {} -Encoding ascii -Value $code\n",
            q(&query),
            q(&out.display().to_string()),
            q(&done.display().to_string())
        );
        let encoded: Vec<u8> = body.encode_utf16().flat_map(|c| c.to_le_bytes()).collect();
        use base64::Engine;
        let encoded = base64::engine::general_purpose::STANDARD.encode(encoded);
        const START_PROCESS: &str = concat!("Start-", "Process");
        const VERB_RUN_AS: &str = concat!("-Verb ", "RunAs");
        let launch = format!(
            "try {{ {} powershell {} -WindowStyle Hidden -Wait -ArgumentList '-NoProfile','-NonInteractive','-EncodedCommand',{} ; 'ok' }} catch {{ 'no' }}",
            START_PROCESS, VERB_RUN_AS, encoded
        );
        let ran = std::process::Command::new("powershell")
            .args(["-NoProfile", "-NonInteractive", "-Command", &launch])
            .creation_flags(NO_WINDOW)
            .status();
        let xml = std::fs::read_to_string(&out).unwrap_or_default();
        let problem = std::fs::read_to_string(&err).unwrap_or_default();
        let finished = std::fs::read_to_string(&done).unwrap_or_default();
        // No event export is left behind: this investigation keeps no copy
        // of the Security log.
        for f in [&out, &err, &done] {
            let _ = std::fs::remove_file(f);
        }
        let capped = xml.matches("<Event ").count() >= 3000;
        // Only a read that really ran and said it finished counts: an empty
        // file is never taken for "nobody signed in".
        return match ran {
            Ok(st) if st.success() && finished.trim() == "0" => Read::Events { source: "the Windows Security log".into(), events: parse_windows(&xml), capped },
            Ok(st) if st.success() && !finished.is_empty() => Read::Unavailable(format!("the read as administrator failed: {}", problem.trim().chars().take(200).collect::<String>())),
            _ => Read::Unavailable("the administrator prompt was declined or closed, so the Security log wasn't read".into()),
        };
    }
    let out = std::process::Command::new("wevtutil")
        .args(["qe", "Security", &format!("/q:{query}"), "/f:xml", "/rd:true", "/c:3000"])
        .creation_flags(NO_WINDOW)
        .output();
    match out {
        Ok(o) if o.status.success() => {
            let xml = String::from_utf8_lossy(&o.stdout);
            let capped = xml.matches("<Event ").count() >= 3000;
            Read::Events { source: "the Windows Security log".into(), events: parse_windows(&xml), capped }
        }
        Ok(o) => {
            let err = String::from_utf8_lossy(&o.stderr).to_lowercase();
            if err.contains("access is denied") || err.contains("unauthorized") || o.status.code() == Some(5) {
                Read::NeedsAdmin
            } else {
                Read::Unavailable(err.trim().chars().take(200).collect())
            }
        }
        Err(e) => Read::Unavailable(e.to_string()),
    }
}
#[cfg(not(windows))]
pub fn read(days: u32, _as_admin: bool) -> Read {
    let since = format!("-{days}d");
    let journal = std::process::Command::new("journalctl")
        .args(["-q", "--no-pager", "-o", "short-iso", "--utc", "--since", &since, "-t", "sshd", "-t", "login", "-t", "gdm-password", "-t", "lightdm", "-t", "sddm"])
        .output();
    let cutoff = chrono::Utc::now().timestamp() - i64::from(days) * 86_400;
    let within = |events: Vec<Logon>| events.into_iter().filter(|l| seconds(&l.at) >= cutoff).collect::<Vec<_>>();
    if let Ok(o) = journal {
        let text = String::from_utf8_lossy(&o.stdout).to_string();
        if o.status.success() && !text.trim().is_empty() {
            return Read::Events { source: "the system journal".into(), events: within(parse_linux(&text, 0)), capped: false };
        }
    }
    for path in ["/var/log/auth.log", "/var/log/secure"] {
        if let Ok(text) = std::fs::read_to_string(path) {
            let year = chrono::Utc::now().format("%Y").to_string().parse().unwrap_or(2026);
            return Read::Events { source: path.into(), events: within(parse_linux(&text, year)), capped: false };
        }
    }
    Read::Unavailable("neither the journal nor /var/log/auth.log could be read (it may need sudo)".into())
}

/// A plain question about sign-ins to this PC ("who signed in this week?",
/// "any failed logins today?", "check for suspicious login activity"): the
/// evidence at once. `None` for anything else: signing in to a site or an
/// app ("log in to Blackboard", "who's logged in to Discord"), or a job to
/// learn or share (practical.rs asks how first).
pub fn asked(said: &str) -> Option<String> {
    let w: Vec<String> = said
        .to_lowercase()
        .replace(['’', '\''], "")
        .split(|c: char| !c.is_alphanumeric())
        .filter(|x| !x.is_empty())
        .map(String::from)
        .collect();
    let s = format!(" {} ", w.join(" "));
    let has = |list: &[&str]| list.iter().any(|x| s.contains(x));
    let about = has(&[" sign in", " signed in", " signin", " login", " logged in", " log in", " logon", " sign ins", " signins"]);
    let looking = has(&[" who ", " failed ", " suspicious ", " activity ", " attempts ", " attempt ", " history ", " investigate ", " unusual ", " anyone ", " someone ", " any ", " recent ", " check ", " show ", " list ", " review ", " today ", " this week ", " last ", " month "]);
    let this_pc = has(&[" pc ", " computer ", " laptop ", " windows ", " this machine ", " my machine ", " linux ", " this device "]);
    // A site or another app has its own account history; without a local
    // marker ("failed", "suspicious", "sign-ins", "on my PC") don't read the
    // PC's log for it. This is also what keeps "check my login for Blackboard"
    // out of the Security log.
    let local = this_pc
        || has(&[" failed ", " suspicious ", " unusual ", " sign ins ", " signins ", " sign-ins ", " logons ", " login activity ", " sign-in activity ", " login history ", " anyone ", " someone "]);
    // A named service/device is not this PC's log, even when "failed" made
    // the request look local ("any failed logins for Gmail today").
    let service_target = has(&[
        " gmail ", " outlook ", " blackboard ", " canvas ", " discord ", " slack ", " github ",
        " facebook ", " instagram ", " reddit ", " twitter ", " steam ", " xbox ", " email ",
        " bank ",
    ]);
    let somewhere_else = (has(&[" in to ", " into ", " on to ", " onto ", " me in "]) || service_target) && !this_pc;
    let ok = about && looking && local && !somewhere_else && crate::practical::mode_of(said) == crate::practical::Mode::Do && !crate::practical::offers(said);
    ok.then(|| said.to_string())
}

/// The person's own latest words agreed to Windows' administrator prompt
/// (a model asking for "admin" isn't enough: chat.rs checks this first).
pub fn agreed(said: &str) -> bool {
    let s = format!(" {} ", said.to_lowercase().replace(|c: char| !c.is_alphanumeric() && c != '\'', " "));
    // "admin" is the request, never the consent: "check logins as admin" is
    // a person asking what to do, not agreeing to Windows' prompt. The yes
    // has to be its own word in the latest message.
    let yes = [" yes ", " yeah ", " yep ", " ok ", " okay ", " sure ", " go ahead ", " do it ", " allow ", " fine ", " please do "];
    let no = [" no ", " dont ", " don't ", " not ", " nope ", " never "];
    yes.iter().any(|w| s.contains(w)) && !no.iter().any(|w| s.contains(w))
}

/// The one plain sentence that asks before Windows' administrator prompt.
pub const ASK_ADMIN: &str = "I need to read the Windows Security log as administrator once; Windows will ask you to allow it. Okay?";

/// The same request, with the words that let the person agree without
/// having to guess the next command.
pub fn ask_admin() -> String {
    format!("{} If you agree, say \"yes, read my sign-ins as admin\".", ASK_ADMIN)
}

/// `[IZUKI: logins | week]` / `[IZUKI: logins | month, admin]`: the real
/// evidence, or exactly why it couldn't be read and what to ask.
pub fn ability(details: &str) -> String {
    let days = days_from(details);
    let admin = details.to_lowercase().contains("admin");
    match read(days, admin) {
        Read::Events { source, events, capped } => {
            let mut text = report(&events, &source, days);
            if capped {
                text.push_str("Coverage: the read stopped at 3,000 matching records. Older events in this range were not read; ask for a shorter range to see them.
");
            }
            text
        }
        Read::NeedsAdmin => format!("Windows keeps the Security log (who signed in, and failed tries) for administrators, and Izuki \
isn't running as one. Ask the person: \"{}\" Only if they say yes, use [IZUKI: logins | the same days, admin]. \
They could also open Event Viewer → Windows Logs → Security themselves. Nothing was read.", ASK_ADMIN),
        Read::Unavailable(why) => format!("The sign-in log couldn't be read: {why}. Nothing was read, so don't describe any sign-ins."),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const WIN: &str = r#"<Event xmlns='http://schemas.microsoft.com/win/2004/08/events/event'><System><Provider Name='Microsoft-Windows-Security-Auditing'/><EventID>4625</EventID><TimeCreated SystemTime='2026-11-14T03:01:05.1234567Z'/><EventRecordID>101</EventRecordID></System><EventData><Data Name='TargetUserName'>admin</Data><Data Name='TargetDomainName'>PC</Data><Data Name='Status'>0xc000006d</Data><Data Name='SubStatus'>0xc0000064</Data><Data Name='LogonType'>3</Data><Data Name='IpAddress'>203.0.113.9</Data><Data Name='WorkstationName'>-</Data></EventData></Event>
<Event xmlns='http://schemas.microsoft.com/win/2004/08/events/event'><System><EventID>4624</EventID><TimeCreated SystemTime='2026-11-14T08:15:00.0000000Z'/><EventRecordID>102</EventRecordID></System><EventData><Data Name='TargetUserName'>nova</Data><Data Name='TargetDomainName'>PC</Data><Data Name='LogonType'>2</Data><Data Name='IpAddress'>127.0.0.1</Data></EventData></Event>
<Event xmlns='http://schemas.microsoft.com/win/2004/08/events/event'><System><EventID>4624</EventID><TimeCreated SystemTime='2026-11-14T08:15:01.0000000Z'/><EventRecordID>103</EventRecordID></System><EventData><Data Name='TargetUserName'>SYSTEM</Data><Data Name='LogonType'>5</Data></EventData></Event>
<Event xmlns='http://schemas.microsoft.com/win/2004/08/events/event'><System><EventID>4624</EventID><TimeCreated SystemTime='2026-11-14T08:15:02.0000000Z'/><EventRecordID>104</EventRecordID></System><EventData><Data Name='TargetUserName'>DWM-3</Data><Data Name='LogonType'>2</Data></EventData></Event>"#;

    #[test]
    fn windows_events_become_plain_records_without_the_machinery() {
        let ev = parse_windows(WIN);
        assert_eq!(ev.len(), 2, "SYSTEM and the desktop's own sign-ins are left out: {ev:?}");
        assert!(!ev[0].ok);
        assert_eq!(ev[0].user, "admin");
        assert_eq!(ev[0].why.as_deref(), Some("no such user"));
        assert_eq!(ev[0].from.as_deref(), Some("203.0.113.9"));
        assert_eq!(ev[0].how, "network");
        assert_eq!(ev[0].record, "event 4625 #101");
        assert_eq!(ev[1].at, "2026-11-14T08:15:00");
        assert_eq!(ev[1].how, "at the PC");
        assert_eq!(ev[1].from, None, "this PC itself isn't a place it came from");
    }

    fn fail(at: &str, user: &str, from: &str, why: &str) -> Logon {
        Logon { at: at.into(), ok: false, user: user.into(), domain: String::new(), how: "network".into(), from: Some(from.into()), workstation: None, why: Some(why.into()), record: format!("r{at}") }
    }
    fn ok(at: &str, user: &str, how: &str, from: Option<&str>) -> Logon {
        Logon { at: at.into(), ok: true, user: user.into(), domain: String::new(), how: how.into(), from: from.map(String::from), workstation: None, why: None, record: format!("r{at}") }
    }
    fn domain(mut l: Logon, d: &str) -> Logon { l.domain = d.into(); l }

    #[test]
    fn guessing_from_one_place_is_called_out_with_its_evidence() {
        let users = ["admin", "root", "test", "guest", "user", "oracle"];
        let ev: Vec<Logon> = users.iter().enumerate().map(|(i, u)| fail(&format!("2026-11-14T03:0{i}:00"), u, "203.0.113.9", "no such user")).collect();
        let f = analyze(&ev);
        let guess = f.iter().find(|f| f.what.contains("from 203.0.113.9")).expect("the burst from one address");
        assert!(guess.serious && guess.what.contains("6 different user names"), "{guess:?}");
        assert!(guess.evidence.iter().any(|e| e.contains("FAILED") && e.contains("admin")));
        assert!(f.iter().any(|f| f.what.contains("outside your network")) || f.iter().any(|f| f.what.contains("from 203.0.113.9")));
    }

    #[test]
    fn a_success_after_failures_is_flagged_and_ordinary_use_is_not() {
        let mut ev = vec![
            fail("2026-11-14T09:00:00", "nova", "192.168.1.20", "wrong password"),
            fail("2026-11-14T09:01:00", "nova", "192.168.1.20", "wrong password"),
            fail("2026-11-14T09:02:00", "nova", "192.168.1.20", "wrong password"),
            ok("2026-11-14T09:03:00", "nova", "network", Some("192.168.1.20")),
        ];
        let f = analyze(&ev);
        assert!(f.iter().any(|f| f.what.starts_with("nova signed in after 3 failed tries")), "{f:?}");
        assert!(!f.iter().any(|f| f.what.contains("outside your network")), "a home address is inside");
        ev = (0..12).map(|d| ok(&format!("2026-11-{:02}T08:30:00", d + 1), "nova", "at the PC", None)).collect();
        assert!(analyze(&ev).is_empty(), "the same morning sign-in every day is normal");
        let r = report(&ev, "sample", 14);
        assert!(r.contains("Nothing stands out") && r.contains("12 sign-in(s)"), "{r}");
        assert!(r.contains("read-only") && r.contains("not proof of an attack"), "{r}");
        let empty = report(&[], "sample", 7);
        assert!(empty.contains("No 4624 or 4625 records") && empty.contains("auditing can be off"), "{empty}");
    }

    #[test]
    fn the_same_name_in_another_domain_is_not_the_same_account() {
        let ev = vec![
            domain(fail("2026-11-14T09:00:00", "bob", "10.0.0.5", "wrong password"), "DOMAIN_A"),
            domain(fail("2026-11-14T09:01:00", "bob", "10.0.0.5", "wrong password"), "DOMAIN_A"),
            domain(fail("2026-11-14T09:02:00", "bob", "10.0.0.5", "wrong password"), "DOMAIN_A"),
            domain(ok("2026-11-14T09:03:00", "bob", "network", Some("10.0.0.5")), "DOMAIN_B"),
        ];
        let f = analyze(&ev);
        assert!(!f.iter().any(|f| f.what.contains("signed in after")), "a different domain is not the same account: {f:?}");
    }

    #[test]
    fn burst_evidence_is_the_burst_not_older_isolated_failures() {
        let mut ev: Vec<Logon> = (0..4).map(|i| fail(&format!("2026-11-14T01:0{i}:00"), "bob", "10.0.0.5", "wrong password")).collect();
        ev.extend((0..5).map(|i| fail(&format!("2026-11-14T02:0{i}:00"), "bob", "10.0.0.5", "wrong password")));
        let f = analyze(&ev);
        let burst = f.iter().find(|f| f.what.contains("the account bob")).expect("the burst");
        assert!(burst.evidence.iter().any(|e| e.contains("02:00:00")), "{burst:?}");
        assert!(!burst.evidence.iter().any(|e| e.contains("01:0")), "old isolated failures are not the burst: {burst:?}");
    }

    #[test]
    fn separate_password_attempts_are_not_swallowed_by_one_probe() {
        let log = "Nov 14 03:00:00 lab sshd[1]: Invalid user bob from 203.0.113.9 port 50000
Nov 14 03:00:01 lab sshd[1]: Failed password for invalid user bob from 203.0.113.9 port 50000 ssh2
Nov 14 03:00:02 lab sshd[1]: Failed password for invalid user bob from 203.0.113.9 port 50000 ssh2";
        let ev = parse_linux(log, 2026);
        assert_eq!(ev.len(), 3, "one probe explains one failure, not the next attempt: {ev:#?}");
    }

    #[test]
    fn remote_sign_ins_from_the_internet_and_odd_hours_stand_out() {
        let mut ev: Vec<Logon> = (0..12).map(|d| ok(&format!("2026-11-{:02}T08:30:00", d + 1), "nova", "at the PC", None)).collect();
        ev.push(ok("2026-11-13T03:40:00", "nova", "remote desktop", Some("198.51.100.7")));
        let f = analyze(&ev);
        assert!(f.iter().any(|f| f.serious && f.what.contains("outside your network (198.51.100.7)")), "{f:?}");
        assert!(f.iter().any(|f| !f.serious && f.what.contains("an hour you don't usually")), "{f:?}");
    }

    const AUTH: &str = "Nov 14 03:01:05 lab sshd[811]: Failed password for invalid user admin from 203.0.113.9 port 50112 ssh2
Nov 14 03:01:09 lab sshd[811]: Failed password for root from 203.0.113.9 port 50113 ssh2
Nov 14 08:15:00 lab sshd[901]: Accepted publickey for nova from 192.168.1.20 port 51234 ssh2
Nov 14 08:20:00 lab login[600]: FAILED LOGIN (1) on '/dev/tty1' FOR 'nova', Authentication failure
Nov 14 08:21:00 lab CRON[700]: pam_unix(cron:session): session opened for user root(uid=0) by (uid=0)
2026-11-14T09:00:00+0000 lab sshd[950]: Invalid user test from 203.0.113.9 port 50200
2026-11-14T09:00:02+0000 lab sshd[950]: Failed password for invalid user test from 203.0.113.9 port 50200 ssh2";

    #[test]
    fn linux_auth_logs_read_into_the_same_shape() {
        let ev = parse_linux(AUTH, 2026);
        assert_eq!(ev.len(), 5, "{ev:#?}");
        assert_eq!((ev[0].ok, ev[0].user.as_str(), ev[0].why.as_deref()), (false, "admin", Some("no such user")));
        assert_eq!((ev[1].user.as_str(), ev[1].why.as_deref()), ("root", Some("wrong password")));
        assert_eq!((ev[2].ok, ev[2].user.as_str(), ev[2].from.as_deref()), (true, "nova", Some("192.168.1.20")));
        assert_eq!((ev[3].ok, ev[3].user.as_str(), ev[3].how.as_str()), (false, "nova", "at the PC"));
        assert_eq!((ev[4].at.as_str(), ev[4].user.as_str()), ("2026-11-14T09:00:00", "test"));
        assert!(ev.iter().all(|e| e.user != "root" || !e.ok), "cron's own sessions aren't sign-ins");
        assert_eq!(ev.iter().filter(|e| e.user == "test").count(), 1, "one try, counted once");
    }

    #[test]
    fn an_administrator_read_needs_the_persons_own_yes() {
        assert!(agreed("yes go ahead"));
        assert!(agreed("okay, read it as admin"));
        assert!(!agreed("no don't"));
        assert!(!agreed("what did you find"));
        assert!(!agreed("check logins as admin"), "asking for admin is not agreeing to the prompt");
        assert!(!agreed("read it as administrator"), "still not a yes");
    }

    #[test]
    fn plain_sign_in_questions_and_nothing_else() {
        assert!(asked("who signed in to my pc this week?").is_some());
        assert!(asked("any failed logins today").is_some());
        assert!(asked("check for suspicious login activity").is_some());
        assert!(asked("check sign-ins this week").is_some(), "the agent's own wording");
        assert!(asked("log in to blackboard").is_none());
        assert!(asked("who's logged in to discord").is_none());
        assert!(asked("any failed logins for Gmail today").is_none(), "a named service is not this PC's log");
        assert!(asked("check my login for blackboard").is_none(), "a site's own login isn't this PC's log");
        assert!(asked("teach me how to check failed logins").is_none(), "a lesson, not the answer");
        assert!(asked("help me investigate suspicious login activity").is_none(), "asked how first");
        assert!(asked("what's the weather").is_none());
    }

    #[test]
    fn how_far_back() {
        assert_eq!(days_from("week"), 7);
        assert_eq!(days_from("today"), 1);
        assert_eq!(days_from("month, admin"), 30);
        assert_eq!(days_from("3 days"), 3);
        assert_eq!(days_from("400"), 90);
        assert_eq!(days_from("failed logins in the last 24 hours"), 1, "hours are not days");
        assert_eq!(days_from("Who signed in to Windows 11 this week?"), 7, "the 11 is not a range");
        assert_eq!(days_from("3 failed logins today"), 1, "the 3 is a count, not days");
    }
}
