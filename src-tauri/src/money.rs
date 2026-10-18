//! Money (Empire part two): your bank statement, understood.
//!
//! Import a statement (the CSV every bank lets you download) and Izuki sorts
//! each line into a category and answers in plain words:
//! - "how much did I spend this month?";
//! - "any unusual spending?" (a charge far above normal for its kind, a
//!   category well over its usual month, the same charge twice in two days);
//! - "what subscriptions am I paying for?" (repeating monthly charges, and
//!   which went up).
//!
//! Plus a watchlist: "how are my stocks?". Prices only, never advice, never
//! a trade.
//!
//! Everything stays on this PC (money.json). Read only: Izuki never moves
//! money, buys or sells anything.

use std::collections::BTreeMap;

use anyhow::{anyhow, bail, Result};
use chrono::{Datelike, NaiveDate};
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Tx {
    /// "2026-10-17".
    pub date: String,
    pub desc: String,
    /// Money in is positive, money out negative.
    pub amount: f64,
    pub category: String,
    /// Which statement it came from (the file's name).
    #[serde(default)]
    pub source: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Book {
    pub txs: Vec<Tx>,
    /// Stock / fund symbols ("AAPL", "VOO").
    #[serde(default)]
    pub watchlist: Vec<String>,
}

static TURN: Mutex<()> = Mutex::new(());

fn path() -> std::path::PathBuf {
    crate::store::data_dir().join("money.json")
}

pub fn load() -> Book {
    std::fs::read_to_string(path()).ok().and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default()
}

fn save(b: &Book) -> Result<()> {
    let tmp = path().with_extension("json.tmp");
    std::fs::write(&tmp, serde_json::to_string(b)?)?;
    std::fs::rename(&tmp, path())?;
    Ok(())
}

// ---------------------------------------------------------------------------
// Reading a statement
// ---------------------------------------------------------------------------

/// CSV rows, with quoted fields ("Coffee, large") and doubled quotes.
pub fn csv_rows(text: &str) -> Vec<Vec<String>> {
    // One separator per file: whichever the first line uses most (outside
    // quotes), so "12,50" in a semicolon file stays one field.
    // Counted over the first lines (a bank's preamble can come before the
    // header); a tie or nothing at all means comma.
    let mut counts = [(',', 0usize), (';', 0), ('\t', 0)];
    for line in text.lines().filter(|l| !l.trim().is_empty()).take(20) {
        let mut inq = false;
        for c in line.chars() {
            if c == '"' {
                inq = !inq;
            } else if !inq {
                for (sep, n) in counts.iter_mut() {
                    if c == *sep {
                        *n += 1;
                    }
                }
            }
        }
    }
    let best = counts.iter().map(|(_, n)| *n).max().unwrap_or(0);
    let sep = if best == 0 || counts[0].1 == best { ',' } else { counts.iter().find(|(_, n)| *n == best).map(|(c, _)| *c).unwrap_or(',') };
    let mut rows = Vec::new();
    let mut row = Vec::new();
    let mut field = String::new();
    let mut quoted = false;
    let mut chars = text.trim_start_matches('\u{feff}').chars().peekable();
    while let Some(c) = chars.next() {
        match c {
            '"' if quoted && chars.peek() == Some(&'"') => {
                field.push('"');
                chars.next();
            }
            '"' => quoted = !quoted,
            c if c == sep && !quoted => row.push(std::mem::take(&mut field).trim().to_string()),
            '\r' if !quoted => {}
            '\n' if !quoted => {
                row.push(std::mem::take(&mut field).trim().to_string());
                if row.iter().any(|f| !f.is_empty()) {
                    rows.push(std::mem::take(&mut row));
                } else {
                    row.clear();
                }
            }
            c => field.push(c),
        }
    }
    row.push(field.trim().to_string());
    if row.iter().any(|f| !f.is_empty()) {
        rows.push(row);
    }
    rows
}

/// "$1,234.50", "(12.00)", "-5", "12.00 CR" → a number (None: not money).
pub fn money_of(s: &str) -> Option<f64> {
    let t = s.trim();
    if t.is_empty() {
        return None;
    }
    let negative = t.starts_with('(') && t.ends_with(')') || t.starts_with('-') || t.ends_with('-') || t.to_uppercase().ends_with("DR");
    // "12,50" (a decimal comma) vs "1,250" (thousands): two digits after the
    // last comma and no dot means decimals.
    let decimal_comma = match (t.rfind(','), t.rfind('.')) {
        // Both: the rightmost one is the decimal point ("1.234,50" vs "1,234.50").
        (Some(c), Some(d)) => c > d,
        (Some(c), None) => {
            let after: String = t[c + 1..].chars().take_while(char::is_ascii_digit).collect();
            (1..=2).contains(&after.len())
        }
        _ => false,
    };
    let t2 = if decimal_comma { t.replace('.', "").replace(',', ".") } else { t.to_string() };
    let digits: String = t2.chars().filter(|c| c.is_ascii_digit() || *c == '.').collect();
    if digits.is_empty() || digits.chars().filter(|c| *c == '.').count() > 1 {
        return None;
    }
    let v: f64 = digits.parse().ok()?;
    Some(if negative { -v } else { v })
}

/// A date in any of the usual bank formats. `day_first`: "03/04" is 3 April.
pub fn date_of(s: &str, day_first: bool) -> Option<NaiveDate> {
    let t = s.trim().split([' ', 'T']).next().unwrap_or("").trim();
    let full = s.trim();
    let us = ["%m/%d/%Y", "%m/%d/%y", "%m-%d-%Y"];
    let eu = ["%d/%m/%Y", "%d/%m/%y", "%d-%m-%Y", "%d.%m.%Y"];
    let (first, second) = if day_first { (eu.as_slice(), us.as_slice()) } else { (us.as_slice(), eu.as_slice()) };
    for f in ["%Y-%m-%d", "%Y/%m/%d"].iter().chain(first).chain(second) {
        if let Ok(d) = NaiveDate::parse_from_str(t, f) {
            return Some(d);
        }
    }
    for f in ["%b %d, %Y", "%d %b %Y", "%B %d, %Y", "%d %B %Y"] {
        if let Ok(d) = NaiveDate::parse_from_str(full, f) {
            return Some(d);
        }
    }
    None
}

/// Which column holds what, from the header row.
#[derive(Debug, Default, PartialEq)]
struct Columns {
    date: Option<usize>,
    desc: Option<usize>,
    amount: Option<usize>,
    debit: Option<usize>,
    credit: Option<usize>,
    kind: Option<usize>,
}

fn columns(header: &[String]) -> Columns {
    let mut c = Columns::default();
    // The description: "Description" beats "Payee"/"Name", which beat
    // "Details"/"Memo" (Chase's "Details" column just says DEBIT/CREDIT).
    const DESC: &[&[&str]] = &[&["description"], &["payee", "merchant", "name"], &["narrative", "memo", "transaction", "reference", "details"]];
    let mut desc_rank = usize::MAX;
    for (i, h) in header.iter().enumerate() {
        let lower = h.to_lowercase();
        if let Some(rank) = DESC.iter().position(|words| words.iter().any(|w| lower.contains(w))) {
            let is_money_or_date = ["date", "amount", "debit", "credit", "type"].iter().any(|w| lower.contains(w));
            if rank < desc_rank && !is_money_or_date {
                desc_rank = rank;
                c.desc = Some(i);
            }
        }
    }
    for (i, h) in header.iter().enumerate() {
        if Some(i) == c.desc {
            continue;
        }
        let h = h.to_lowercase();
        let has = |words: &[&str]| words.iter().any(|w| h.contains(w));
        if c.date.is_none() && has(&["date", "posted", "time"]) {
            c.date = Some(i);
        } else if c.debit.is_none() && has(&["debit", "withdrawal", "money out", "paid out", "outflow", "spent"]) {
            c.debit = Some(i);
        } else if c.credit.is_none() && has(&["credit", "deposit", "money in", "paid in", "inflow", "received"]) {
            c.credit = Some(i);
        } else if c.amount.is_none() && has(&["amount", "value", "sum"]) {
            c.amount = Some(i);
        } else if c.kind.is_none() && has(&["type", "dr/cr", "cr/dr"]) {
            c.kind = Some(i);
        }
    }
    c
}

/// The statement's lines as transactions (pure, so it's tested).
pub fn parse_statement(text: &str, source: &str) -> Result<Vec<Tx>> {
    let rows = csv_rows(text);
    // The header: the first row naming a date and some money column.
    let (head_at, cols) = rows
        .iter()
        .enumerate()
        .take(15)
        .map(|(i, r)| (i, columns(r)))
        .find(|(_, c)| c.date.is_some() && (c.amount.is_some() || c.debit.is_some() || c.credit.is_some()))
        .ok_or_else(|| anyhow!("I couldn't find the columns in that file — it needs a date and an amount (or money in / money out)"))?;
    let date_col = cols.date.expect("checked");
    let body = &rows[head_at + 1..];
    // 25/10/2026 can only be day-first: if any date says so, all are.
    let day_first = body.iter().filter_map(|r| r.get(date_col)).any(|d| {
        let parts: Vec<&str> = d.split(['/', '-', '.']).collect();
        parts.len() == 3 && parts[0].len() <= 2 && parts[0].parse::<u32>().is_ok_and(|n| n > 12)
    });
    let mut out = Vec::new();
    for r in body {
        let Some(date) = r.get(date_col).and_then(|d| date_of(d, day_first)) else { continue };
        let pick = |i: Option<usize>| i.and_then(|i| r.get(i)).and_then(|v| money_of(v));
        let mut amount = match (pick(cols.amount), pick(cols.debit), pick(cols.credit)) {
            (Some(a), _, _) => a,
            (None, d, c) => c.map(f64::abs).unwrap_or(0.0) - d.map(f64::abs).unwrap_or(0.0),
        };
        // Some banks write every amount as positive and say which way in a column.
        if let Some(kind) = cols.kind.and_then(|i| r.get(i)).map(|k| k.to_lowercase()) {
            if cols.amount.is_some() && amount > 0.0 && (kind.contains("debit") || kind == "dr" || kind.contains("withdrawal") || kind.contains("purchase") || kind.contains("payment")) {
                amount = -amount;
            }
        }
        if amount == 0.0 {
            continue;
        }
        let desc = cols
            .desc
            .and_then(|i| r.get(i))
            .cloned()
            .or_else(|| r.iter().enumerate().filter(|(i, v)| Some(*i) != Some(date_col) && money_of(v).is_none() && !v.is_empty()).map(|(_, v)| v.clone()).max_by_key(|v| v.len()))
            .unwrap_or_default();
        let category = categorize(&desc, amount);
        out.push(Tx { date: date.format("%Y-%m-%d").to_string(), desc: desc.trim().to_string(), amount: (amount * 100.0).round() / 100.0, category, source: source.to_string() });
    }
    if out.is_empty() {
        bail!("that file had no transactions I could read");
    }
    Ok(out)
}

/// A category from what the bank wrote (the obvious ones; the rest is "Other").
pub fn categorize(desc: &str, amount: f64) -> String {
    // Padded, so " rent" can't match "current" and " gas" can't match "vegas".
    let d = format!(" {} ", desc.to_lowercase());
    let has = |words: &[&str]| words.iter().any(|w| d.contains(w));
    let cat = if amount > 0.0 {
        if has(&["payroll", "salary", "wages", "direct dep", "paycheck"]) {
            "Pay"
        } else if has(&["refund", "reversal", "return"]) {
            "Refunds"
        } else if has(&["stripe", "shopify", "square", "paypal", "etsy", "sales"]) {
            "Sales"
        } else if has(&["transfer", "zelle", "venmo", "cash app", "xfer"]) {
            "Transfers in"
        } else {
            "Money in"
        }
    } else if has(&[" rent", "mortgage", "landlord", "apartment", " lease"]) {
        "Rent & housing"
    } else if has(&["uber eats", "doordash", "grubhub", "mcdonald", "starbucks", "chipotle", "restaurant", "cafe", "coffee", "pizza", "burger", "wendy", "taco", "kfc", "subway ", "chick-fil", "dunkin", "popeyes", "domino"]) {
        "Food & drink"
    } else if has(&["walmart", "kroger", "heb", "h-e-b", "aldi", "costco", "target", "whole foods", "trader joe", "grocery", "safeway", "publix", "market"]) {
        "Groceries & shopping"
    } else if has(&["netflix", "spotify", "hulu", "disney", "youtube", "apple.com", "icloud", "google storage", "prime video", "hbo", "max.com", "xbox", "playstation", "steam", "openai", "chatgpt", "adobe", "microsoft", "github", "notion", "canva", "subscription"]) {
        "Subscriptions & software"
    } else if has(&["uber", "lyft", "shell", "exxon", "chevron", "valero", " bp ", " gas ", "fuel", "parking", "toll", "metro", "transit", "airline", "airlines", "delta", "united", "southwest", "american air"]) {
        "Transport & travel"
    } else if has(&["electric", "energy", "water", "utility", "internet", "comcast", "xfinity", "at&t", "verizon", "t-mobile", "spectrum", "phone bill"]) {
        "Bills & utilities"
    } else if has(&["amazon", "amzn", "ebay", "best buy", "temu", "shein", "aliexpress"]) {
        "Online shopping"
    } else if has(&["facebook ads", "meta ads", "google ads", "fb ads", "tiktok ads", "advert"]) {
        "Ads & marketing"
    } else if has(&["fee", "overdraft", "interest charge", "service charge", "atm"]) {
        "Bank fees"
    } else if has(&["pharmacy", "cvs", "walgreens", "doctor", "clinic", "hospital", "dental", "medical"]) {
        "Health"
    } else if has(&["tuition", "college", "university", "school", "ucertify", "textbook", "bookstore"]) {
        "School"
    } else if has(&["transfer", "zelle", "venmo", "cash app", "xfer"]) {
        "Transfers out"
    } else {
        "Other"
    };
    cat.to_string()
}

/// "AMAZON MKTPL*2K4 SEATTLE WA 0042" → "amazon mktpl": the same shop each time.
pub fn merchant(desc: &str) -> String {
    let d = desc.to_lowercase();
    let words: Vec<String> = d
        .split(|c: char| !c.is_alphanumeric() && c != '&' && c != '\'')
        .filter(|w| w.len() > 2 && !w.chars().any(|c| c.is_ascii_digit()) && !["pos", "purchase", "debit", "card", "visa", "ach", "online", "payment", "recurring", "www", "com"].contains(w))
        .take(2)
        .map(String::from)
        .collect();
    words.join(" ")
}

/// Add a statement's transactions, skipping ones already there. Returns (added, skipped).
pub fn import(text: &str, source: &str) -> Result<(usize, usize)> {
    let new = parse_statement(text, source)?;
    let _turn = TURN.lock();
    let mut book = load();
    let key = |t: &Tx| format!("{}|{:.2}|{}", t.date, t.amount, t.desc.to_lowercase());
    // Counted, not just seen: two identical coffees on one day are two
    // coffees, but importing the same statement twice adds nothing.
    let mut have: std::collections::HashMap<String, usize> = std::collections::HashMap::new();
    for t in &book.txs {
        *have.entry(key(t)).or_default() += 1;
    }
    let mut incoming: std::collections::HashMap<String, usize> = std::collections::HashMap::new();
    let mut added = 0;
    for t in new.iter() {
        let k = key(t);
        let n = incoming.entry(k.clone()).or_default();
        *n += 1;
        if *n <= have.get(&k).copied().unwrap_or(0) {
            continue;
        }
        book.txs.push(t.clone());
        added += 1;
    }
    book.txs.sort_by(|a, b| a.date.cmp(&b.date));
    save(&book)?;
    eprintln!("[money] imported a statement: {added} new, {} already there", new.len() - added);
    Ok((added, new.len() - added))
}

pub fn import_file(path: &str) -> Result<String> {
    let p = std::path::Path::new(path.trim().trim_matches('"'));
    let text = std::fs::read(p).map_err(|e| anyhow!("couldn't open that file ({e})"))?;
    let text = String::from_utf8_lossy(&text).to_string();
    let name = p.file_name().and_then(|n| n.to_str()).unwrap_or("statement").to_string();
    let (added, skipped) = import(&text, &name)?;
    Ok(if skipped > 0 { format!("Added {added} transactions ({skipped} were already here).") } else { format!("Added {added} transactions.") })
}

pub fn clear() -> Result<()> {
    let _turn = TURN.lock();
    let mut b = load();
    b.txs.clear();
    save(&b)
}

// ---------------------------------------------------------------------------
// Understanding it
// ---------------------------------------------------------------------------

fn month_of(t: &Tx) -> &str {
    &t.date[..7.min(t.date.len())]
}

#[derive(Debug, Clone, Serialize, Default, PartialEq)]
pub struct Month {
    /// "2026-10".
    pub month: String,
    pub money_in: f64,
    pub money_out: f64,
    /// (category, spent), most first.
    pub categories: Vec<(String, f64)>,
}

pub fn months(txs: &[Tx]) -> Vec<Month> {
    let mut by: BTreeMap<String, Month> = BTreeMap::new();
    for t in txs {
        let m = by.entry(month_of(t).to_string()).or_insert_with(|| Month { month: month_of(t).to_string(), ..Default::default() });
        if t.amount > 0.0 {
            // Money moved between your own accounts isn't income.
            if t.category != "Transfers in" {
                m.money_in += t.amount;
            }
        } else if t.category != "Transfers out" {
            m.money_out += -t.amount;
            match m.categories.iter_mut().find(|(c, _)| *c == t.category) {
                Some((_, v)) => *v += -t.amount,
                None => m.categories.push((t.category.clone(), -t.amount)),
            }
        }
    }
    let mut out: Vec<Month> = by.into_values().collect();
    for m in &mut out {
        m.categories.sort_by(|a, b| b.1.total_cmp(&a.1));
        m.money_in = (m.money_in * 100.0).round() / 100.0;
        m.money_out = (m.money_out * 100.0).round() / 100.0;
        for c in &mut m.categories {
            c.1 = (c.1 * 100.0).round() / 100.0;
        }
    }
    out
}

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Unusual {
    pub date: String,
    pub desc: String,
    pub amount: f64,
    /// Why it stands out, in words.
    pub why: String,
}

fn median(mut v: Vec<f64>) -> f64 {
    if v.is_empty() {
        return 0.0;
    }
    v.sort_by(f64::total_cmp);
    v[v.len() / 2]
}

/// What stands out in the latest month (pure, so it's tested).
pub fn unusual(txs: &[Tx]) -> Vec<Unusual> {
    let Some(latest) = txs.iter().map(month_of).max().map(str::to_string) else { return Vec::new() };
    let mut out = Vec::new();
    let spend: Vec<&Tx> = txs.iter().filter(|t| t.amount < 0.0 && !t.category.starts_with("Transfers")).collect();
    // 1. Far above normal for its kind.
    for t in spend.iter().filter(|t| month_of(t) == latest) {
        let others: Vec<f64> = spend.iter().filter(|o| o.category == t.category && !std::ptr::eq(**o, *t)).map(|o| -o.amount).collect();
        let usual = median(others.clone());
        if others.len() >= 3 && -t.amount >= 50.0 && -t.amount > usual * 3.0 {
            out.push(Unusual { date: t.date.clone(), desc: t.desc.clone(), amount: t.amount, why: format!("about {:.0}× your usual {} charge (${usual:.0})", -t.amount / usual.max(1.0), t.category.to_lowercase()) });
        }
    }
    // 2. The same charge twice within two days.
    for (i, a) in spend.iter().enumerate() {
        for b in spend.iter().skip(i + 1) {
            if month_of(b) != latest || (a.amount - b.amount).abs() > 0.005 || merchant(&a.desc) != merchant(&b.desc) || merchant(&a.desc).is_empty() {
                continue;
            }
            let (Ok(da), Ok(db)) = (NaiveDate::parse_from_str(&a.date, "%Y-%m-%d"), NaiveDate::parse_from_str(&b.date, "%Y-%m-%d")) else { continue };
            if (db - da).num_days().abs() <= 2 && -a.amount >= 5.0 {
                out.push(Unusual { date: b.date.clone(), desc: b.desc.clone(), amount: b.amount, why: format!("the same amount at the same place on {} too — a double charge?", a.date) });
            }
        }
    }
    // 3. A category well over its usual month.
    let ms = months(txs);
    if let Some(now) = ms.iter().find(|m| m.month == latest) {
        let before: Vec<&Month> = ms.iter().filter(|m| m.month < latest).rev().take(3).collect();
        if !before.is_empty() {
            for (cat, spent) in &now.categories {
                let avg = before.iter().map(|m| m.categories.iter().find(|(c, _)| c == cat).map(|c| c.1).unwrap_or(0.0)).sum::<f64>() / before.len() as f64;
                if *spent > avg * 1.5 && spent - avg >= 100.0 {
                    out.push(Unusual { date: latest.clone(), desc: cat.clone(), amount: -spent, why: format!("${spent:.0} this month against about ${avg:.0} usually") });
                }
            }
        }
    }
    out
}

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Subscription {
    pub merchant: String,
    /// The latest charge.
    pub amount: f64,
    pub last: String,
    /// It costs more than it used to: (was, now).
    pub went_up: Option<(f64, f64)>,
}

/// Charges that repeat about monthly at the same place for about the same amount.
pub fn subscriptions(txs: &[Tx]) -> Vec<Subscription> {
    let mut by: BTreeMap<String, Vec<&Tx>> = BTreeMap::new();
    for t in txs.iter().filter(|t| t.amount < 0.0 && !t.category.starts_with("Transfers") && t.category != "Rent & housing") {
        let m = merchant(&t.desc);
        if !m.is_empty() {
            by.entry(m).or_default().push(t);
        }
    }
    let newest = txs.iter().filter_map(|t| NaiveDate::parse_from_str(&t.date, "%Y-%m-%d").ok()).max();
    let mut out = Vec::new();
    for (m, list) in by {
        if list.len() < 2 {
            continue;
        }
        // Cancelled ones stop: only those charged lately.
        let last_day = list.iter().filter_map(|t| NaiveDate::parse_from_str(&t.date, "%Y-%m-%d").ok()).max();
        match (last_day, newest) {
            (Some(l), Some(n)) if (n - l).num_days() <= 40 => {}
            _ => continue,
        }
        let dates: Vec<NaiveDate> = list.iter().filter_map(|t| NaiveDate::parse_from_str(&t.date, "%Y-%m-%d").ok()).collect();
        let gaps: Vec<i64> = dates.windows(2).map(|w| (w[1] - w[0]).num_days()).collect();
        let monthly = !gaps.is_empty() && gaps.iter().all(|g| (25..=35).contains(g));
        let first = -list[0].amount;
        let last = -list[list.len() - 1].amount;
        let steady = list.windows(2).all(|w| {
            let (a, b) = (-w[0].amount, -w[1].amount);
            (b - a).abs() <= a * 0.25 + 0.01
        });
        if monthly && steady {
            out.push(Subscription {
                merchant: m,
                amount: last,
                last: list[list.len() - 1].date.clone(),
                went_up: (last > first + 0.5).then_some((first, last)),
            });
        }
    }
    out.sort_by(|a, b| b.amount.total_cmp(&a.amount));
    out
}

// ---------------------------------------------------------------------------
// Watchlist (prices only)
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Quote {
    pub symbol: String,
    pub price: f64,
    /// Since today's open, as a percentage.
    pub change_pct: f64,
    pub date: String,
}

/// Stooq's quote line: "AAPL.US,2026-10-17,22:00:09,231.1,233.5,229.8,232.4,51234567".
pub fn parse_quote(line: &str) -> Option<Quote> {
    let f: Vec<&str> = line.trim().split(',').collect();
    if f.len() < 7 {
        return None;
    }
    let open: f64 = f[3].parse().ok()?;
    let close: f64 = f[6].parse().ok()?;
    Some(Quote {
        symbol: f[0].trim_end_matches(".US").trim_end_matches(".us").to_uppercase(),
        price: close,
        change_pct: if open > 0.0 { (close - open) / open * 100.0 } else { 0.0 },
        date: f[1].to_string(),
    })
}

pub fn quotes(symbols: &[String]) -> Vec<Result<Quote, String>> {
    let client = reqwest::blocking::Client::builder().timeout(std::time::Duration::from_secs(10)).user_agent("Mozilla/5.0 Izuki").build();
    symbols
        .iter()
        .map(|s| {
            let client = client.as_ref().map_err(|e| e.to_string())?;
            let sym = if s.contains('.') { s.to_lowercase() } else { format!("{}.us", s.to_lowercase()) };
            let body = client
                .get(format!("https://stooq.com/q/l/?s={sym}&f=sd2t2ohlcv&h&e=csv"))
                .send()
                .and_then(|r| r.text())
                .map_err(|e| format!("{s}: couldn't reach the price service ({e})"))?;
            body.lines().nth(1).and_then(parse_quote).filter(|q| q.price > 0.0).ok_or_else(|| format!("{s}: no price found"))
        })
        .collect()
}

pub fn set_watch(symbol: &str, add: bool) -> Result<Vec<String>> {
    let s = symbol.trim().trim_start_matches('$').to_uppercase();
    if s.is_empty() || s.len() > 12 || !s.chars().all(|c| c.is_ascii_alphanumeric() || c == '.' || c == '-') {
        bail!("“{symbol}” doesn't look like a stock symbol (like AAPL or VOO)");
    }
    let _turn = TURN.lock();
    let mut b = load();
    b.watchlist.retain(|x| x != &s);
    if add {
        b.watchlist.push(s);
    }
    save(&b)?;
    Ok(b.watchlist)
}

// ---------------------------------------------------------------------------
// In words
// ---------------------------------------------------------------------------

fn dollars(v: f64) -> String {
    let v = v.abs();
    if v >= 1000.0 {
        let whole = v.round() as i64;
        let s = whole.to_string();
        let mut out = String::new();
        for (i, c) in s.chars().enumerate() {
            if i > 0 && (s.len() - i) % 3 == 0 {
                out.push(',');
            }
            out.push(c);
        }
        format!("${out}")
    } else {
        format!("${v:.2}")
    }
}

fn month_name(m: &str) -> String {
    NaiveDate::parse_from_str(&format!("{m}-01"), "%Y-%m-%d").map(|d| d.format("%B %Y").to_string()).unwrap_or_else(|_| m.to_string())
}

pub fn say_month(ms: &[Month]) -> String {
    let Some(now) = ms.last() else {
        return "No statement yet — import one in Apps → Money (download a CSV from your bank's website).".into();
    };
    let mut out = format!(
        "{}: {} in, {} out — {} {}.",
        month_name(&now.month),
        dollars(now.money_in),
        dollars(now.money_out),
        if now.money_in >= now.money_out { "you kept" } else { "you're down" },
        dollars(now.money_in - now.money_out)
    );
    if !now.categories.is_empty() {
        let top: Vec<String> = now.categories.iter().take(4).map(|(c, v)| format!("{c} {}", dollars(*v))).collect();
        out.push_str(&format!("\nMost went on: {}.", top.join(", ")));
    }
    if let Some(prev) = ms.iter().rev().nth(1) {
        let diff = now.money_out - prev.money_out;
        if diff.abs() >= 20.0 {
            out.push_str(&format!("\nThat's {} {} than {}.", dollars(diff), if diff > 0.0 { "more spending" } else { "less spending" }, month_name(&prev.month)));
        }
    }
    let first_day = ms.last().map(|m| m.month.clone()).unwrap_or_default();
    if chrono::Local::now().format("%Y-%m").to_string() != first_day {
        out.push_str("\n(From your latest statement — import a newer one for this month.)");
    }
    out
}

pub fn say_unusual(list: &[Unusual]) -> String {
    if list.is_empty() {
        return "Nothing unusual in your latest month — no charges far above normal, no doubles, no category way over its usual. 👍".into();
    }
    let lines: Vec<String> = list.iter().take(8).map(|u| format!("• {} — {} on {}: {}", u.desc, dollars(u.amount), u.date, u.why)).collect();
    format!("Worth a look:\n{}\n\n(Read only — check with your bank if anything's wrong.)", lines.join("\n"))
}

pub fn say_subscriptions(list: &[Subscription]) -> String {
    if list.is_empty() {
        return "I don't see any monthly charges yet — I need at least two months of statements to spot them.".into();
    }
    let total: f64 = list.iter().map(|s| s.amount).sum();
    let lines: Vec<String> = list
        .iter()
        .take(15)
        .map(|s| {
            let up = s.went_up.map(|(was, now)| format!(" — went up from {} to {}", dollars(was), dollars(now))).unwrap_or_default();
            format!("• {} {}/month{up}", s.merchant, dollars(s.amount))
        })
        .collect();
    format!("Your monthly charges ({} a month, {} a year):\n{}", dollars(total), dollars(total * 12.0), lines.join("\n"))
}

pub fn say_quotes(list: &[Result<Quote, String>]) -> String {
    if list.is_empty() {
        return "Your watchlist is empty — say “add Apple to my watchlist” or add symbols in Apps → Money.".into();
    }
    let lines: Vec<String> = list
        .iter()
        .map(|q| match q {
            Ok(q) => format!("• {} {} ({}{:.1}% today)", q.symbol, dollars(q.price), if q.change_pct >= 0.0 { "+" } else { "" }, q.change_pct),
            Err(e) => format!("• {e}"),
        })
        .collect();
    format!("{}\n\n(Prices only — not advice. Izuki never buys or sells.)", lines.join("\n"))
}

// ---------------------------------------------------------------------------
// Asking
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, PartialEq)]
pub enum Ask {
    Month,
    Unusual,
    Subscriptions,
    Quotes,
    Watch(String, bool),
}

const NAMES: &[(&str, &str)] = &[
    ("apple", "AAPL"), ("microsoft", "MSFT"), ("tesla", "TSLA"), ("amazon", "AMZN"), ("google", "GOOGL"), ("alphabet", "GOOGL"), ("nvidia", "NVDA"),
    ("meta", "META"), ("netflix", "NFLX"), ("amd", "AMD"), ("intel", "INTC"), ("s&p 500", "VOO"), ("s&p", "VOO"), ("nasdaq", "QQQ"),
];

pub fn parse(said: &str) -> Option<Ask> {
    let s = format!(" {} ", said.to_lowercase().replace(['?', '!', ',', '.'], " ").split_whitespace().collect::<Vec<_>>().join(" "));
    if s.contains(" watchlist") || s.contains(" watch list") {
        let add = !(s.contains(" remove ") || s.contains(" take ") || s.contains(" delete ") || s.contains(" drop "));
        let change = s.contains(" add ") || s.contains(" put ") || !add;
        if change {
            let rest = s.replace(" watch list", " watchlist");
            let words: Vec<&str> = rest.split_whitespace().collect();
            let skip = ["add", "put", "remove", "take", "delete", "drop", "to", "from", "on", "off", "my", "the", "watchlist", "stock", "stocks", "please", "and", "of", "out"];
            let name: String = words.iter().filter(|w| !skip.contains(w)).cloned().collect::<Vec<_>>().join(" ");
            let sym = NAMES.iter().find(|(n, _)| name == *n).map(|(_, s)| s.to_string()).unwrap_or_else(|| name.to_uppercase());
            if !sym.is_empty() && !sym.contains(' ') {
                return Some(Ask::Watch(sym, add));
            }
        }
        return Some(Ask::Quotes);
    }
    if s.contains(" my stocks") || s.contains(" my portfolio") || s.contains(" my investments") || s.contains(" stocks doing") {
        return Some(Ask::Quotes);
    }
    let mine = [" my subscriptions", " subscriptions am i", " subscriptions do i", " subscriptions i ", " subscriptions i'm", " subscriptions im "].iter().any(|w| s.contains(w));
    if mine || s.contains(" monthly charges") || s.contains(" recurring charges") || s.contains(" what am i paying for") {
        return Some(Ask::Subscriptions);
    }
    let money = [" spend", " spent", " spending", " expenses", " money", " budget", " bank", " charges"].iter().any(|w| s.contains(w));
    if money && (s.contains(" unusual") || s.contains(" weird") || s.contains(" suspicious") || s.contains(" double charge") || s.contains(" strange") || s.contains(" anything off")) {
        return Some(Ask::Unusual);
    }
    if money && (s.contains(" how much") || s.contains(" this month") || s.contains(" last month") || s.contains(" summary") || s.contains(" where does my money") || s.contains(" where did my money") || s.contains(" breakdown")) {
        return Some(Ask::Month);
    }
    None
}

/// `parse`, but only the asks this data can answer: money questions need a
/// statement imported; the watchlist always works.
pub fn parse_here(said: &str) -> Option<Ask> {
    let ask = parse(said)?;
    match ask {
        Ask::Quotes | Ask::Watch(..) => Some(ask),
        _ if load().txs.is_empty() => None,
        _ => Some(ask),
    }
}

pub fn handle(ask: Ask) -> String {
    let book = load();
    match ask {
        Ask::Month => say_month(&months(&book.txs)),
        Ask::Unusual if book.txs.is_empty() => say_month(&[]),
        Ask::Unusual => say_unusual(&unusual(&book.txs)),
        Ask::Subscriptions if book.txs.is_empty() => say_month(&[]),
        Ask::Subscriptions => say_subscriptions(&subscriptions(&book.txs)),
        Ask::Quotes => say_quotes(&quotes(&book.watchlist)),
        Ask::Watch(sym, add) => match set_watch(&sym, add) {
            Ok(list) => format!("{} {} your watchlist. It now has: {}.", if add { "Added" } else { "Took" }, if add { format!("{sym} to") } else { format!("{sym} off") }, if list.is_empty() { "nothing".into() } else { list.join(", ") }),
            Err(e) => e.to_string(),
        },
    }
}

/// For "what needs my attention?" and the phone: the money lines that matter.
pub fn attention() -> Vec<String> {
    let book = load();
    if book.txs.is_empty() {
        return Vec::new();
    }
    let mut out = Vec::new();
    let odd = unusual(&book.txs);
    if !odd.is_empty() {
        out.push(format!("💸 {} unusual charge{} in your latest statement (ask “any unusual spending?”)", odd.len(), if odd.len() == 1 { "" } else { "s" }));
    }
    let up: Vec<String> = subscriptions(&book.txs).into_iter().filter_map(|s| s.went_up.map(|(was, now)| format!("{} went up {} → {}", s.merchant, dollars(was), dollars(now)))).collect();
    if !up.is_empty() {
        out.push(format!("📈 Subscriptions that went up: {}", up.join("; ")));
    }
    out
}

/// The money view for the panel and the phone.
#[derive(Debug, Clone, Serialize, Default)]
pub struct View {
    pub months: Vec<Month>,
    pub unusual: Vec<Unusual>,
    pub subscriptions: Vec<Subscription>,
    pub watchlist: Vec<String>,
    pub transactions: usize,
    /// The latest few, newest first.
    pub recent: Vec<Tx>,
}

pub fn view() -> View {
    let book = load();
    let ms = months(&book.txs);
    View {
        months: ms.iter().rev().take(6).rev().cloned().collect(),
        unusual: unusual(&book.txs),
        subscriptions: subscriptions(&book.txs),
        watchlist: book.watchlist.clone(),
        transactions: book.txs.len(),
        recent: book.txs.iter().rev().take(12).cloned().collect(),
    }
}

/// Today, for "this month" comparisons in tests.
pub fn this_month() -> String {
    let n = chrono::Local::now();
    format!("{}-{:02}", n.year(), n.month())
}

#[cfg(test)]
mod tests {
    use super::*;

    const CHASE: &str = "Details,Posting Date,Description,Amount,Type,Balance,Check or Slip #\n\
DEBIT,10/01/2026,\"NETFLIX.COM  866-579-7172 CA\",-15.49,ACH_DEBIT,1000.00,,\n\
DEBIT,09/01/2026,\"NETFLIX.COM  866-579-7172 CA\",-15.49,ACH_DEBIT,1000.00,,\n\
DEBIT,08/02/2026,\"NETFLIX.COM  866-579-7172 CA\",-12.99,ACH_DEBIT,1000.00,,\n\
CREDIT,10/03/2026,\"ACME CORP PAYROLL\",\"1,850.00\",ACH_CREDIT,2850.00,,\n\
DEBIT,10/05/2026,\"STARBUCKS STORE 1234\",-6.25,DEBIT_CARD,,,\n\
DEBIT,10/06/2026,\"STARBUCKS STORE 1234\",-5.75,DEBIT_CARD,,,\n";

    #[test]
    fn reads_bank_csvs() {
        let t = parse_statement(CHASE, "chase.csv").unwrap();
        assert_eq!(t.len(), 6);
        assert_eq!(t[3].amount, 1850.0);
        assert_eq!(t[3].category, "Pay");
        assert_eq!(t[0].date, "2026-10-01");
        assert_eq!(t[0].category, "Subscriptions & software");
        // Money out / money in columns, day-first dates, a currency sign.
        let uk = "Date,Description,Money Out,Money In\n25/10/2026,TESCO STORES,£12.40,\n26/10/2026,SALARY,,£2000.00\n";
        let t = parse_statement(uk, "uk.csv").unwrap();
        assert_eq!((t[0].date.as_str(), t[0].amount), ("2026-10-25", -12.40));
        assert_eq!(t[1].amount, 2000.0);
        // All amounts positive, the type column says which way.
        let typed = "Date,Name,Amount,Transaction Type\n2026-10-02,Shell Oil,45.10,Debit\n2026-10-03,Refund Amazon,20,Credit\n";
        let t = parse_statement(typed, "x").unwrap();
        assert_eq!((t[0].amount, t[1].amount), (-45.10, 20.0));
        assert!(parse_statement("hello,world\n1,2\n", "x").is_err());
        // Semicolons and decimal commas (much of Europe).
        let eu = "Datum;Description;Amount\n18.10.2026;Café, Lyon;-4,50\n";
        let t = parse_statement(eu.replace("Datum", "Date").as_str(), "x").unwrap();
        assert_eq!((t[0].desc.as_str(), t[0].amount), ("Café, Lyon", -4.5));
    }

    #[test]
    fn money_and_dates() {
        assert_eq!(money_of("$1,234.50"), Some(1234.5));
        assert_eq!(money_of("(12.00)"), Some(-12.0));
        assert_eq!(money_of("abc"), None);
        assert_eq!(money_of("1,250"), Some(1250.0));
        assert_eq!(money_of("-4,50"), Some(-4.5));
        assert_eq!(money_of("1.234,50"), Some(1234.5));
        assert_eq!(money_of("1,234.50"), Some(1234.5));
        assert_eq!(date_of("10/17/2026", false), NaiveDate::from_ymd_opt(2026, 10, 17));
        assert_eq!(date_of("17/10/2026", true), NaiveDate::from_ymd_opt(2026, 10, 17));
        assert_eq!(date_of("Oct 17, 2026", false), NaiveDate::from_ymd_opt(2026, 10, 17));
        assert_eq!(merchant("NETFLIX.COM  866-579-7172 CA"), "netflix");
        assert_eq!(merchant("POS PURCHASE AMAZON MKTPL*2K4 SEATTLE"), "amazon mktpl");
    }

    fn tx(date: &str, desc: &str, amount: f64) -> Tx {
        Tx { date: date.into(), desc: desc.into(), amount, category: categorize(desc, amount), source: String::new() }
    }

    #[test]
    fn finds_subscriptions_and_price_rises() {
        let t = parse_statement(CHASE, "chase.csv").unwrap();
        let mut t = t;
        t.sort_by(|a, b| a.date.cmp(&b.date));
        let subs = subscriptions(&t);
        assert_eq!(subs.len(), 1, "{subs:?}");
        assert_eq!(subs[0].merchant, "netflix");
        assert_eq!(subs[0].went_up, Some((12.99, 15.49)));
        assert!(say_subscriptions(&subs).contains("went up from $12.99 to $15.49"));
    }

    #[test]
    fn spots_what_stands_out() {
        let mut t = vec![
            tx("2026-07-03", "UBER EATS", -18.0), tx("2026-08-03", "UBER EATS", -22.0), tx("2026-09-03", "DOORDASH", -20.0),
            tx("2026-10-04", "UBER EATS", -19.0), tx("2026-10-09", "DOORDASH ORDER", -140.0),
            tx("2026-10-11", "SPOTIFY USA", -10.99), tx("2026-10-12", "SPOTIFY USA", -10.99),
        ];
        t.sort_by(|a, b| a.date.cmp(&b.date));
        let odd = unusual(&t);
        assert!(odd.iter().any(|u| u.desc == "DOORDASH ORDER" && u.why.contains("usual")), "{odd:?}");
        assert!(odd.iter().any(|u| u.desc == "SPOTIFY USA" && u.why.contains("double charge")), "{odd:?}");
        assert!(odd.iter().any(|u| u.desc == "Food & drink" && u.why.contains("this month")), "{odd:?}");
        assert!(unusual(&[tx("2026-10-01", "COFFEE", -4.0)]).is_empty());
    }

    #[test]
    fn months_add_up() {
        let t = vec![tx("2026-10-03", "ACME PAYROLL", 2000.0), tx("2026-10-04", "RENT OCTOBER", -900.0), tx("2026-10-05", "ZELLE TO SAVINGS", -500.0), tx("2026-10-06", "KROGER", -80.0)];
        let ms = months(&t);
        assert_eq!((ms[0].money_in, ms[0].money_out), (2000.0, 980.0), "a transfer to savings isn't spending");
        assert_eq!(ms[0].categories[0], ("Rent & housing".to_string(), 900.0));
        assert!(say_month(&ms).contains("$2,000 in, $980.00 out"));
    }

    #[test]
    fn quotes_and_asks() {
        let q = parse_quote("AAPL.US,2026-10-17,22:00:09,230,233.5,229.8,232.3,51234567").unwrap();
        assert_eq!((q.symbol.as_str(), q.price), ("AAPL", 232.3));
        assert!((q.change_pct - 1.0).abs() < 0.01);
        assert_eq!(parse_quote("AAPL.US,N/D,N/D,N/D,N/D,N/D,N/D,N/D"), None);
        assert_eq!(parse("how much did I spend this month?"), Some(Ask::Month));
        assert_eq!(parse("any unusual spending"), Some(Ask::Unusual));
        assert_eq!(parse("what subscriptions am I paying for"), Some(Ask::Subscriptions));
        assert_eq!(parse("how are my stocks doing"), Some(Ask::Quotes));
        assert_eq!(parse("add tesla to my watchlist"), Some(Ask::Watch("TSLA".into(), true)));
        assert_eq!(parse("remove NVDA from my watch list"), Some(Ask::Watch("NVDA".into(), false)));
        assert_eq!(parse("spend some time with me"), None);
        assert_eq!(parse("are netflix subscriptions worth it"), None);
        assert_eq!(parse("how much charge does my battery have this month"), None);
        assert_eq!(parse("what's the weather"), None);
    }

    #[test]
    #[ignore]
    fn live_quote() {
        let q = quotes(&["AAPL".to_string()]);
        println!("{}", say_quotes(&q));
        assert!(q[0].is_ok(), "{:?}", q[0]);
    }
}
