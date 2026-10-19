//! Blackboard beyond due dates: grades, announcements and course materials.
//!
//! Blackboard's own REST API is read through the Izuki browser extension,
//! from the browser where you're already signed in to Blackboard — so Izuki
//! never sees or types a password, and reads only what you could see
//! yourself. Read only: nothing is submitted or changed. The school's address
//! comes from the calendar link you already gave (campus.rs).
//!
//! Every answer says what it could and couldn't read: a course whose grades
//! Blackboard wouldn't show is named, never silently left out.

use std::time::Duration;

use anyhow::{anyhow, bail, Result};
use serde_json::Value;

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Want {
    Grades,
    Announcements,
    Materials,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Ask {
    pub want: Want,
    /// A course named in the ask ("biology"), lower-case; empty: all.
    pub course: String,
}

/// "What are my grades?", "my grade in biology", "any new announcements on
/// Blackboard", "course materials for chem".
pub fn parse(said: &str) -> Option<Ask> {
    let s = format!(" {} ", said.to_lowercase().replace(['?', '!', ',', '.'], " "));
    let s = s.split_whitespace().collect::<Vec<_>>().join(" ");
    let s = format!(" {s} ");
    let school = [" blackboard", " class", " course", " my grade", " my grades", " announcement", " materials", " lecture slides", " syllabus"].iter().any(|w| s.contains(w));
    if !school {
        return None;
    }
    // Announcements and materials could be anyone's (Slack, an email, a
    // recipe): only with Blackboard or a class/course named.
    let schooly = [" blackboard", " my class", " my classes", " my course", " my courses", " course ", " class ", " syllabus", " lecture slides", " course materials", " course content"].iter().any(|w| s.contains(w));
    let grade_lookup = s.contains(" my grades") || s.contains(" my grade in ") || s.contains(" my grade for ");
    let want = if grade_lookup || ((s.contains(" grade") || s.contains(" marks ") || s.contains(" gpa ")) && schooly) {
        Want::Grades
    } else if schooly && (s.contains(" announcement") || s.contains(" news from") || s.contains(" any updates")) {
        Want::Announcements
    } else if schooly && (s.contains(" materials") || s.contains(" slides") || s.contains(" syllabus") || s.contains(" course content") || s.contains(" readings") || s.contains(" files in")) {
        Want::Materials
    } else {
        return None;
    };
    let course = [" in ", " for ", " from "]
        .iter()
        .find_map(|w| {
            let at = s.find(w)? + w.len();
            let rest = &s[at..];
            let cut = [" on blackboard", " class", " course", " this week", " today", " please"].iter().filter_map(|x| rest.find(x)).min().unwrap_or(rest.len());
            let c = rest[..cut].trim().trim_start_matches("my ").trim_start_matches("the ").to_string();
            (c.len() >= 3 && !["blackboard", "school", "all", "my classes", "my courses", "classes", "courses"].contains(&c.as_str())).then_some(c)
        })
        .unwrap_or_default();
    Some(Ask { want, course })
}

/// "https://host" of an address.
fn base_of(url: &str) -> Option<String> {
    let rest = url.trim().strip_prefix("https://").or_else(|| url.trim().strip_prefix("http://"))?;
    let host = rest.split(['/', '?', '#']).next()?.to_lowercase();
    (host.contains('.') && !host.is_empty()).then(|| format!("https://{host}"))
}

/// Blackboard's own website (not a school's).
fn vendor(base: &str) -> bool {
    ["https://blackboard.com", "https://www.blackboard.com", "https://help.blackboard.com"].contains(&base)
}

/// The school's Blackboard address: from the linked calendar feed, else a
/// Blackboard site Izuki opened for you before, else a Blackboard tab open in
/// your browser (remembered once found, so it works after that too).
pub fn host() -> Option<String> {
    let feeds = crate::state::store().settings().school_feeds;
    let from_feed = feeds.iter().find_map(|f| {
        let f = f.trim();
        let base = base_of(f)?;
        (f.contains("/webapps/calendar") || base.contains("blackboard")).then_some(base)
    });
    if from_feed.is_some() {
        return from_feed;
    }
    // Found in a tab before (remembered as "blackboard", whatever its address).
    if let Some(base) = crate::sites::list().into_iter().find(|s| s.name == "blackboard").and_then(|s| base_of(&s.url)).filter(|b| !vendor(b)) {
        return Some(base);
    }
    if let Some(base) = crate::sites::school_site().and_then(|u| base_of(&u)).filter(|b| b.contains("blackboard") && !vendor(b)) {
        return Some(base);
    }
    if !crate::ext::connected() {
        return None;
    }
    let tabs = crate::ext::request("lmstabs", serde_json::json!({}), Duration::from_secs(4)).ok()?;
    let mut candidates: Vec<String> = tabs
        .as_array()?
        .iter()
        .filter_map(|t| {
            let url = t["url"].as_str()?;
            let base = base_of(url)?;
            let path = url.trim().strip_prefix(&base).unwrap_or("").to_lowercase();
            let looks = base.contains("blackboard") || t["title"].as_str().is_some_and(|x| x.contains("Blackboard")) || ["/ultra", "/webapps/", "/learn/"].iter().any(|p| path.starts_with(p));
            (looks && !vendor(&base)).then_some(base)
        })
        .collect();
    candidates.dedup();
    // Only a site that answers Blackboard's own API, signed in, is remembered.
    let base = candidates.into_iter().take(3).find(|b| get(b, "/learn/api/public/v1/users/me").is_ok())?;
    eprintln!("[blackboard] found your school's Blackboard in an open tab: {base}");
    crate::sites::remember("blackboard", &base);
    Some(base)
}

/// Where to read due dates from when no school calendar is linked: a known
/// Blackboard, through the browser extension.
pub fn can_read_due() -> bool {
    crate::ext::connected() && host().is_some()
}

/// Everything due from `back` days ago to `ahead` days ahead, read from
/// Blackboard itself: (id, "title — course", when). Blackboard's calendar
/// first; if it won't say, each course's gradebook due dates.
pub fn due_items(back: i64, ahead: i64) -> Result<Vec<(String, String, chrono::DateTime<chrono::Local>)>> {
    use chrono::{Local, Utc};
    let Some(base) = host() else {
        bail!("open your school's Blackboard in your browser (signed in), then ask again — I'll remember where it is");
    };
    let since = Utc::now() - chrono::Duration::days(back.max(0));
    let until = Utc::now() + chrono::Duration::days(ahead.max(0));
    let iso = |t: chrono::DateTime<Utc>| t.format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string();
    let when = |v: &Value| v.as_str().and_then(|d| chrono::DateTime::parse_from_rfc3339(d).ok()).map(|d| d.with_timezone(&Local));
    let in_range = |t: &chrono::DateTime<Local>| t.with_timezone(&Utc) >= since && t.with_timezone(&Utc) <= until;
    *DEADLINE.lock() = Some(std::time::Instant::now() + Duration::from_secs(45));
    let out = (|| -> Result<Vec<(String, String, chrono::DateTime<Local>)>> {
        let mut out = Vec::new();
        if let Ok(v) = get(&base, &format!("/learn/api/public/v1/calendars/items?type=GradebookColumn&since={}&until={}&limit=200", iso(since), iso(until))) {
            for x in results(&v) {
                let Some(at) = when(&x["end"]).or_else(|| when(&x["start"])) else { continue };
                let title = x["title"].as_str().unwrap_or("Something").trim();
                let course = x["calendarName"].as_str().unwrap_or("").trim();
                let id = x["id"].as_str().unwrap_or(title).to_string();
                if in_range(&at) {
                    out.push((id, if course.is_empty() { title.to_string() } else { format!("{title} — {course}") }, at));
                }
            }
            if !out.is_empty() {
                return Ok(out);
            }
        }
        // The calendar wouldn't say: the due dates on each course's work.
        let user = me(&base)?;
        for c in courses(&base, &user)?.iter().take(12) {
            let Ok(v) = get(&base, &format!("/learn/api/public/v2/courses/{}/gradebook/columns?limit=200", c.id)) else { continue };
            for col in results(&v) {
                let Some(at) = when(&col["grading"]["due"]) else { continue };
                let title = col["name"].as_str().unwrap_or("Something").trim();
                let id = col["id"].as_str().map(|i| format!("{}:{i}", c.id)).unwrap_or_else(|| title.to_string());
                if in_range(&at) {
                    out.push((id, format!("{title} — {}", c.name), at));
                }
            }
        }
        Ok(out)
    })();
    *DEADLINE.lock() = None;
    out
}

/// The whole answer's time budget: one slow course can't hold it up forever.
static DEADLINE: parking_lot::Mutex<Option<std::time::Instant>> = parking_lot::Mutex::new(None);

fn get(base: &str, path: &str) -> Result<Value> {
    let url = format!("{base}{path}");
    let left = DEADLINE.lock().map(|d| d.saturating_duration_since(std::time::Instant::now())).unwrap_or(Duration::from_secs(20));
    if left < Duration::from_secs(1) {
        bail!("out of time");
    }
    let v = crate::ext::request("bbfetch", serde_json::json!({ "url": url }), left.min(Duration::from_secs(20))).map_err(|e| {
        if e.to_string().contains("unknown request") {
            anyhow!("your Izuki browser extension is an older version — update it (Settings → Browser extension → Download) and reload it")
        } else {
            e
        }
    })?;
    let status = v["status"].as_u64().unwrap_or(0);
    match status {
        200..=299 => Ok(v["json"].clone()),
        401 | 403 => bail!("Blackboard said no ({status}) — open Blackboard in your browser and sign in, then ask again"),
        404 => bail!("not found (404)"),
        0 => bail!("Blackboard didn't answer"),
        s => bail!("Blackboard answered {s}"),
    }
}

fn results(v: &Value) -> Vec<Value> {
    v["results"].as_array().cloned().unwrap_or_default()
}

struct Course {
    id: String,
    name: String,
}

fn me(base: &str) -> Result<String> {
    let v = get(base, "/learn/api/public/v1/users/me")?;
    v["id"].as_str().map(String::from).ok_or_else(|| anyhow!("Blackboard didn't say who you are"))
}

fn courses(base: &str, user: &str) -> Result<Vec<Course>> {
    let v = get(base, &format!("/learn/api/public/v1/users/{user}/courses?expand=course&limit=100"))?;
    let mut out = Vec::new();
    for m in results(&v) {
        let c = &m["course"];
        let open = c["availability"]["available"].as_str().is_none_or(|a| a != "No") && m["availability"]["available"].as_str().is_none_or(|a| a != "No");
        let (Some(id), Some(name)) = (c["id"].as_str().or(m["courseId"].as_str()), c["name"].as_str()) else { continue };
        if open {
            out.push(Course { id: id.to_string(), name: name.trim().to_string() });
        }
    }
    Ok(out)
}

/// A grade as words: "18/20 (90%)", "A-", "not graded yet".
pub fn grade_words(result: &Value, possible: Option<f64>) -> Option<String> {
    let shown = result["displayGrade"]["text"].as_str().or(result["text"].as_str()).map(str::trim).filter(|t| !t.is_empty());
    let score = result["displayGrade"]["score"].as_f64().or(result["score"].as_f64());
    match (score, possible, shown) {
        (Some(s), Some(p), _) if p > 0.0 => Some(format!("{}/{} ({:.0}%)", trim_num(s), trim_num(p), s / p * 100.0)),
        (_, _, Some(t)) => Some(t.to_string()),
        (Some(s), _, _) => Some(trim_num(s)),
        _ => None,
    }
}

fn trim_num(n: f64) -> String {
    if (n - n.round()).abs() < 0.005 { format!("{}", n.round() as i64) } else { format!("{n:.1}") }
}

/// Plain text from Blackboard's HTML bodies.
pub fn plain(html: &str) -> String {
    let mut out = String::new();
    let mut tag = false;
    for c in html.replace("<br", "\n<br").replace("</p>", "</p>\n").chars() {
        match c {
            '<' => tag = true,
            '>' => tag = false,
            c if !tag => out.push(c),
            _ => {}
        }
    }
    let out = out.replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&#39;", "'").replace("&quot;", "\"");
    out.lines().map(str::trim).filter(|l| !l.is_empty()).collect::<Vec<_>>().join(" ")
}

fn pick<'a>(all: &'a [Course], named: &str) -> Vec<&'a Course> {
    if named.is_empty() {
        return all.iter().collect();
    }
    let words: Vec<&str> = named.split_whitespace().filter(|w| w.len() > 2).collect();
    all.iter().filter(|c| { let n = c.name.to_lowercase(); words.iter().all(|w| n.contains(w)) }).collect()
}

pub fn answer(ask: &Ask) -> Result<String> {
    let Some(base) = host() else {
        bail!("I don't know where your school's Blackboard is yet. Open it in your browser (signed in) and ask again — I'll remember it. Or say “connect my Blackboard” to link its calendar.");
    };
    if !crate::ext::connected() {
        bail!("I read Blackboard through the Izuki browser extension, signed in as you — it isn't connected. Install it from Settings → Browser extension, open Blackboard in that browser, then ask again.");
    }
    let user = me(&base)?;
    let all = courses(&base, &user)?;
    if all.is_empty() {
        return Ok("Blackboard shows no open courses for you right now.".into());
    }
    let chosen = pick(&all, &ask.course);
    if chosen.is_empty() {
        let names: Vec<&str> = all.iter().map(|c| c.name.as_str()).collect();
        return Ok(format!("I couldn't find a course called “{}”. Your courses: {}.", ask.course, names.join(", ")));
    }
    let mut lines = Vec::new();
    let mut missed = Vec::new();
    let deadline = std::time::Instant::now() + Duration::from_secs(60);
    *DEADLINE.lock() = Some(deadline);
    for c in chosen.iter().take(12) {
        if std::time::Instant::now() >= deadline {
            missed.push(format!("{} (out of time)", c.name));
            continue;
        }
        let got = match ask.want {
            Want::Grades => grades(&base, &user, c),
            Want::Announcements => announcements(&base, c),
            Want::Materials => materials(&base, c),
        };
        match got {
            Ok(Some(text)) => lines.push(text),
            Ok(None) => {}
            Err(e) => missed.push(format!("{} ({e})", c.name)),
        }
    }
    *DEADLINE.lock() = None;
    let head = match ask.want {
        Want::Grades => "🎓 Your grades on Blackboard",
        Want::Announcements => "📣 Latest announcements",
        Want::Materials => "📚 Course materials",
    };
    let mut out = if lines.is_empty() { format!("{head}: nothing to show yet.") } else { format!("{head}:\n\n{}", lines.join("\n\n")) };
    if !missed.is_empty() {
        out.push_str(&format!("\n\nCouldn't read: {}.", missed.join("; ")));
    }
    out.push_str("\n\n(Read from Blackboard just now, signed in as you. Nothing was changed.)");
    Ok(out)
}

fn grades(base: &str, user: &str, c: &Course) -> Result<Option<String>> {
    let v = get(base, &format!("/learn/api/public/v2/courses/{}/gradebook/users/{user}", c.id))?;
    // Column names and points (students may not be allowed: then ids only).
    let cols = get(base, &format!("/learn/api/public/v2/courses/{}/gradebook/columns?limit=200", c.id)).map(|v| results(&v)).unwrap_or_default();
    let mut rows = Vec::new();
    for r in results(&v) {
        let col_id = r["columnId"].as_str().unwrap_or("");
        let col = cols.iter().find(|x| x["id"].as_str() == Some(col_id));
        let name = col.and_then(|x| x["name"].as_str()).unwrap_or("A grade");
        let possible = col.and_then(|x| x["score"]["possible"].as_f64());
        if let Some(g) = grade_words(&r, possible) {
            let total = name.to_lowercase().contains("total") || name.to_lowercase().contains("weighted");
            rows.push((total, format!("• {name}: {g}")));
        }
    }
    if rows.is_empty() {
        return Ok(Some(format!("{} — no grades posted yet.", c.name)));
    }
    // Totals first, then the newest few.
    rows.sort_by_key(|(total, _)| !*total);
    let shown: Vec<String> = rows.into_iter().take(8).map(|(_, l)| l).collect();
    Ok(Some(format!("{}\n{}", c.name, shown.join("\n"))))
}

fn announcements(base: &str, c: &Course) -> Result<Option<String>> {
    let v = get(base, &format!("/learn/api/public/v1/courses/{}/announcements?limit=3&sort=modified(desc)", c.id))?;
    let items: Vec<String> = results(&v)
        .iter()
        .take(3)
        .map(|a| {
            let title = a["title"].as_str().unwrap_or("Announcement").trim();
            let body: String = plain(a["body"].as_str().unwrap_or("")).chars().take(220).collect();
            let when = a["modified"].as_str().or(a["created"].as_str()).and_then(|d| chrono::DateTime::parse_from_rfc3339(d).ok()).map(|d| d.with_timezone(&chrono::Local).format("%a %-d %b").to_string()).unwrap_or_default();
            format!("• {title}{}{}", if when.is_empty() { String::new() } else { format!(" ({when})") }, if body.is_empty() { String::new() } else { format!(" — {body}") })
        })
        .collect();
    Ok((!items.is_empty()).then(|| format!("{}\n{}", c.name, items.join("\n"))))
}

fn materials(base: &str, c: &Course) -> Result<Option<String>> {
    let v = get(base, &format!("/learn/api/public/v1/courses/{}/contents?limit=50", c.id))?;
    let mut items = Vec::new();
    for x in results(&v).iter().take(20) {
        let title = x["title"].as_str().unwrap_or("").trim();
        if title.is_empty() || title.starts_with("ultraDocumentBody") {
            continue;
        }
        let folder = x["hasChildren"].as_bool().unwrap_or(false);
        let kind = x["contentHandler"]["id"].as_str().unwrap_or("");
        let icon = if folder { "📁" } else if kind.contains("assignment") { "📝" } else if kind.contains("file") || kind.contains("document") { "📄" } else if kind.contains("link") { "🔗" } else { "•" };
        items.push(format!("{icon} {title}"));
    }
    Ok((!items.is_empty()).then(|| format!("{}\n{}", c.name, items.join("\n"))))
}

pub fn handle(ask: Ask) -> String {
    answer(&ask).unwrap_or_else(|e| {
        eprintln!("[blackboard] {e}");
        e.to_string()
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn hears_school_asks() {
        assert_eq!(parse("what are my grades?"), Some(Ask { want: Want::Grades, course: String::new() }));
        assert_eq!(parse("what's my grade in biology"), Some(Ask { want: Want::Grades, course: "biology".into() }));
        assert_eq!(parse("any new announcements on Blackboard"), Some(Ask { want: Want::Announcements, course: String::new() }));
        assert_eq!(parse("show me the course materials for chem 101"), Some(Ask { want: Want::Materials, course: "chem 101".into() }));
        assert_eq!(parse("what's due this week"), None, "due dates are campus.rs");
        assert_eq!(parse("grade this essay for me"), None, "not about Blackboard");
        assert_eq!(parse("any new announcements in slack"), None);
        assert_eq!(parse("what grade of steel is my knife"), None);
        assert_eq!(parse("my gpa calculator is broken"), None);
        assert_eq!(parse("read the announcement email from my boss"), None);
        assert_eq!(parse("what materials do I need for this recipe"), None);
        assert_eq!(parse("what are the announcements in my biology class"), Some(Ask { want: Want::Announcements, course: "biology".into() }));
    }

    #[test]
    fn finds_the_schools_address() {
        assert_eq!(base_of("https://blackboard.sanjac.edu/ultra/course?x=1").as_deref(), Some("https://blackboard.sanjac.edu"));
        assert_eq!(base_of("http://Learn.School.edu"), Some("https://learn.school.edu".into()));
        assert_eq!(base_of("chrome://newtab"), None);
        assert!(vendor("https://www.blackboard.com"));
        assert!(!vendor("https://blackboard.sanjac.edu"));
    }

    #[test]
    fn grades_read_as_words() {
        assert_eq!(grade_words(&json!({ "score": 18.0 }), Some(20.0)).as_deref(), Some("18/20 (90%)"));
        assert_eq!(grade_words(&json!({ "displayGrade": { "text": "A-" } }), None).as_deref(), Some("A-"));
        assert_eq!(grade_words(&json!({ "status": "NeedsGrading" }), Some(10.0)), None);
        assert_eq!(plain("<p>Exam moved&nbsp;to <b>Friday</b></p><p>Room 2</p>"), "Exam moved to Friday Room 2");
    }
}
