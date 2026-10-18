//! Your shop and payments (Empire part two), read only.
//!
//! - **Stripe**, with a *restricted* key that can only read (Stripe →
//!   Developers → API keys → Create restricted key; Charges, Balance and
//!   Customers set to Read).
//! - **Shopify**, with a custom app's Admin API token (Shopify admin →
//!   Settings → Apps → Develop apps; read_orders and read_products only).
//!
//! It answers "how are sales today?", "how much did I make this month?",
//! "any new orders?" and "what's low on stock?". Nothing is ever charged,
//! refunded, changed or sent from here. Keys stay in this PC's settings and
//! are never written to the log.

use std::time::Duration;

use anyhow::{anyhow, bail, Result};
use chrono::{Local, TimeZone};
use serde::Serialize;
use serde_json::{json, Value};

const SHOPIFY_API: &str = "2026-07";

fn client() -> Result<reqwest::blocking::Client> {
    Ok(reqwest::blocking::Client::builder().timeout(Duration::from_secs(20)).user_agent("Izuki").build()?)
}

fn start_of_today() -> i64 {
    let now = Local::now();
    Local.from_local_datetime(&now.date_naive().and_hms_opt(0, 0, 0).expect("midnight")).single().map(|d| d.timestamp()).unwrap_or(now.timestamp() - 86_400)
}

fn start_of_month() -> i64 {
    use chrono::Datelike;
    let now = Local::now();
    let first = now.date_naive().with_day(1).expect("day 1");
    Local.from_local_datetime(&first.and_hms_opt(0, 0, 0).expect("midnight")).single().map(|d| d.timestamp()).unwrap_or(now.timestamp() - 30 * 86_400)
}

fn money(cents: i64, currency: &str) -> String {
    let sign = if currency.eq_ignore_ascii_case("usd") { "$" } else if currency.eq_ignore_ascii_case("gbp") { "£" } else if currency.eq_ignore_ascii_case("eur") { "€" } else { "" };
    let v = cents as f64 / 100.0;
    if sign.is_empty() { format!("{v:.2} {}", currency.to_uppercase()) } else { format!("{sign}{v:.2}") }
}

// ---------------------------------------------------------------------------
// Stripe
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Default, PartialEq)]
pub struct Sales {
    pub currency: String,
    /// Cents.
    pub today: i64,
    pub today_count: usize,
    pub month: i64,
    pub month_count: usize,
    pub refunded: i64,
    /// Available and on the way, cents.
    pub available: i64,
    pub pending: i64,
    /// The latest few: (when, who/what, cents).
    pub recent: Vec<(i64, String, i64)>,
    /// More payments than were read (5 pages): totals are "at least".
    #[serde(default)]
    pub partial: bool,
}

/// Charges and balance read into totals (pure, so it's tested).
pub fn sales_from(charges: &[Value], balance: &Value, today_from: i64) -> Sales {
    let mut s = Sales::default();
    for c in charges {
        if c["status"].as_str() != Some("succeeded") || c["paid"].as_bool() == Some(false) {
            continue;
        }
        let amount = c["amount"].as_i64().unwrap_or(0);
        let refunded = c["amount_refunded"].as_i64().unwrap_or(0);
        let created = c["created"].as_i64().unwrap_or(0);
        if s.currency.is_empty() {
            s.currency = c["currency"].as_str().unwrap_or("usd").to_string();
        }
        s.month += amount - refunded;
        s.month_count += 1;
        s.refunded += refunded;
        if created >= today_from {
            s.today += amount - refunded;
            s.today_count += 1;
        }
        if s.recent.len() < 5 {
            let who = c["billing_details"]["name"].as_str().or(c["description"].as_str()).or(c["receipt_email"].as_str()).unwrap_or("A payment").to_string();
            s.recent.push((created, who, amount));
        }
    }
    let sum = |k: &str| balance[k].as_array().map(|a| a.iter().filter(|b| s.currency.is_empty() || b["currency"].as_str() == Some(s.currency.as_str())).filter_map(|b| b["amount"].as_i64()).sum()).unwrap_or(0);
    s.available = sum("available");
    s.pending = sum("pending");
    if s.currency.is_empty() {
        s.currency = balance["available"][0]["currency"].as_str().unwrap_or("usd").to_string();
    }
    s
}

pub fn stripe_sales() -> Result<Sales> {
    let key = crate::state::store().settings().stripe_key.trim().to_string();
    if key.is_empty() {
        bail!("Stripe isn't connected — add a read-only (restricted) key in Apps → Money → Shop & payments");
    }
    if !key.starts_with("rk_") {
        bail!("use a restricted, read-only Stripe key (it starts with rk_) — a secret key (sk_) can move money, so Izuki won't use one");
    }
    let c = client()?;
    let get = |path: &str| -> Result<Value> {
        let r = c.get(format!("https://api.stripe.com/v1/{path}")).bearer_auth(&key).send()?;
        let status = r.status();
        let v: Value = r.json().unwrap_or(Value::Null);
        if !status.is_success() {
            let msg = v["error"]["message"].as_str().unwrap_or("no details");
            // A restricted key without this permission says so: tell the user which one.
            bail!("Stripe answered {status}: {msg}");
        }
        Ok(v)
    };
    let from = start_of_month();
    let mut charges: Vec<Value> = Vec::new();
    let mut after: Option<String> = None;
    let mut partial = false;
    for page_no in 0..10 {
        let page = get(&format!("charges?limit=100&created[gte]={from}{}", after.as_ref().map(|a| format!("&starting_after={a}")).unwrap_or_default()))?;
        let data = page["data"].as_array().cloned().unwrap_or_default();
        after = data.last().and_then(|c| c["id"].as_str()).map(String::from);
        charges.extend(data);
        if page["has_more"].as_bool() != Some(true) || after.is_none() {
            break;
        }
        if page_no == 9 {
            partial = true; // a very busy month: counted the first 1,000
        }
    }
    let balance = get("balance").unwrap_or(Value::Null);
    let mut s = sales_from(&charges, &balance, start_of_today());
    s.partial = partial;
    Ok(s)
}

pub fn say_sales(s: &Sales) -> String {
    let c = &s.currency;
    let mut out = format!(
        "💳 Stripe — today: {} from {} payment{}. This month: {}{} from {}.",
        money(s.today, c),
        s.today_count,
        if s.today_count == 1 { "" } else { "s" },
        if s.partial { "at least " } else { "" },
        money(s.month, c),
        s.month_count
    );
    if s.refunded > 0 {
        out.push_str(&format!(" Refunded this month: {}.", money(s.refunded, c)));
    }
    out.push_str(&format!("\nBalance: {} available, {} on the way.", money(s.available, c), money(s.pending, c)));
    if !s.recent.is_empty() {
        let lines: Vec<String> = s
            .recent
            .iter()
            .map(|(at, who, cents)| {
                let when = Local.timestamp_opt(*at, 0).single().map(|d| d.format("%a %-I:%M %p").to_string()).unwrap_or_default();
                format!("• {} — {who} ({when})", money(*cents, c))
            })
            .collect();
        out.push_str(&format!("\nLatest:\n{}", lines.join("\n")));
    }
    out
}

// ---------------------------------------------------------------------------
// Shopify
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Default, PartialEq)]
pub struct Store {
    pub currency: String,
    pub today_orders: usize,
    pub today_total: f64,
    pub month_orders: usize,
    pub month_total: f64,
    /// Paid but not sent yet.
    pub to_ship: usize,
    /// (order, customer, total, status).
    pub recent: Vec<(String, String, f64, String)>,
    /// (product, how many left).
    pub low_stock: Vec<(String, i64)>,
    /// More orders than were read: totals are "at least".
    #[serde(default)]
    pub partial: bool,
}

/// "my-shop" or "https://my-shop.myshopify.com/admin" → "my-shop.myshopify.com".
pub fn shop_domain(raw: &str) -> Option<String> {
    let t = raw.trim().trim_start_matches("https://").trim_start_matches("http://");
    let host = t.split('/').next()?.trim().to_lowercase();
    if host.is_empty() || !host.chars().all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '.') {
        return None;
    }
    Some(if host.ends_with(".myshopify.com") { host } else if host.contains('.') { return None } else { format!("{host}.myshopify.com") })
}

/// The GraphQL answer read into totals (pure, so it's tested).
pub fn store_from(orders: &Value, low: &Value, today: &str) -> Store {
    let mut s = Store::default();
    for edge in orders["data"]["orders"]["edges"].as_array().cloned().unwrap_or_default() {
        let o = &edge["node"];
        let amount: f64 = o["totalPriceSet"]["shopMoney"]["amount"].as_str().and_then(|a| a.parse().ok()).unwrap_or(0.0);
        if s.currency.is_empty() {
            s.currency = o["totalPriceSet"]["shopMoney"]["currencyCode"].as_str().unwrap_or("USD").to_string();
        }
        let created_day = o["createdAt"].as_str().and_then(|c| chrono::DateTime::parse_from_rfc3339(c).ok()).map(|d| d.with_timezone(&Local).format("%Y-%m-%d").to_string());
        s.month_orders += 1;
        s.month_total += amount;
        if created_day.as_deref() == Some(today) {
            s.today_orders += 1;
            s.today_total += amount;
        }
        let paid = o["displayFinancialStatus"].as_str().unwrap_or("");
        let sent = o["displayFulfillmentStatus"].as_str().unwrap_or("");
        if paid == "PAID" && sent == "UNFULFILLED" {
            s.to_ship += 1;
        }
        if s.recent.len() < 5 {
            let who = o["customer"]["displayName"].as_str().unwrap_or("A customer").to_string();
            let status = match (paid, sent) {
                ("PAID", "UNFULFILLED") => "paid · to ship".to_string(),
                (_, "FULFILLED") => "sent".to_string(),
                (p, _) => p.to_lowercase().replace('_', " "),
            };
            s.recent.push((o["name"].as_str().unwrap_or("#?").to_string(), who, amount, status));
        }
    }
    for edge in low["data"]["productVariants"]["edges"].as_array().cloned().unwrap_or_default() {
        let v = &edge["node"];
        // Stock not tracked (made to order, digital): never "low".
        if v["inventoryItem"]["tracked"].as_bool() == Some(false) {
            continue;
        }
        if let (Some(name), Some(n)) = (v["displayName"].as_str(), v["inventoryQuantity"].as_i64()) {
            s.low_stock.push((name.to_string(), n));
        }
    }
    s.low_stock.sort_by_key(|(_, n)| *n);
    s.month_total = (s.month_total * 100.0).round() / 100.0;
    s.today_total = (s.today_total * 100.0).round() / 100.0;
    s
}

pub fn shopify_store() -> Result<Store> {
    let st = crate::state::store().settings();
    let token = st.shopify_token.trim().to_string();
    let Some(domain) = shop_domain(&st.shopify_store) else {
        bail!("Shopify isn't connected — add your store address and an Admin API token in Apps → Money → Shop & payments");
    };
    if token.is_empty() {
        bail!("add your Shopify Admin API token (read_orders and read_products) in Apps → Money → Shop & payments");
    }
    let c = client()?;
    let ask = |query: &str| -> Result<Value> {
        let r = c
            .post(format!("https://{domain}/admin/api/{SHOPIFY_API}/graphql.json"))
            .header("X-Shopify-Access-Token", &token)
            .json(&json!({ "query": query }))
            .send()?;
        let status = r.status();
        let v: Value = r.json().unwrap_or(Value::Null);
        if !status.is_success() {
            bail!("Shopify answered {status}{}", if status.as_u16() == 401 { " — check the token" } else { "" });
        }
        if let Some(e) = v["errors"].as_array().and_then(|a| a.first()) {
            bail!("Shopify: {}", e["message"].as_str().unwrap_or("an error"));
        }
        Ok(v)
    };
    let month = Local::now().format("%Y-%m-01").to_string();
    // Page through the month's orders (250 at a time, up to 2,000).
    let mut edges: Vec<Value> = Vec::new();
    let mut cursor: Option<String> = None;
    let mut partial = false;
    for page_no in 0..8 {
        let after = cursor.as_ref().map(|c| format!(", after: \"{c}\"")).unwrap_or_default();
        let page = ask(&format!(
            "{{ orders(first: 250{after}, sortKey: CREATED_AT, reverse: true, query: \"created_at:>={month}\") {{ pageInfo {{ hasNextPage endCursor }} edges {{ node {{ name createdAt displayFinancialStatus displayFulfillmentStatus customer {{ displayName }} totalPriceSet {{ shopMoney {{ amount currencyCode }} }} }} }} }} }}"
        ))?;
        edges.extend(page["data"]["orders"]["edges"].as_array().cloned().unwrap_or_default());
        let info = &page["data"]["orders"]["pageInfo"];
        cursor = info["endCursor"].as_str().map(String::from);
        if info["hasNextPage"].as_bool() != Some(true) || cursor.is_none() {
            break;
        }
        if page_no == 7 {
            partial = true;
        }
    }
    let orders = json!({ "data": { "orders": { "edges": edges } } });
    let low = ask("{ productVariants(first: 20, query: \"inventory_quantity:<5\") { edges { node { displayName inventoryQuantity inventoryItem { tracked } } } } }").unwrap_or(Value::Null);
    let mut s = store_from(&orders, &low, &Local::now().format("%Y-%m-%d").to_string());
    s.partial = partial;
    Ok(s)
}

pub fn say_store(s: &Store) -> String {
    let c = &s.currency;
    let m = |v: f64| if c == "USD" { format!("${v:.2}") } else { format!("{v:.2} {c}") };
    let mut out = format!(
        "🛍️ Shopify — today: {} order{} ({}). This month: {}{} ({}).",
        s.today_orders,
        if s.today_orders == 1 { "" } else { "s" },
        m(s.today_total),
        if s.partial { "at least " } else { "" },
        s.month_orders,
        m(s.month_total)
    );
    if s.to_ship > 0 {
        out.push_str(&format!("\n📦 {} paid order{} waiting to be sent.", s.to_ship, if s.to_ship == 1 { "" } else { "s" }));
    }
    if !s.low_stock.is_empty() {
        let items: Vec<String> = s.low_stock.iter().take(6).map(|(n, q)| format!("{n} ({q} left)")).collect();
        out.push_str(&format!("\n⚠️ Low on stock: {}.", items.join(", ")));
    }
    if !s.recent.is_empty() {
        let lines: Vec<String> = s.recent.iter().map(|(name, who, total, status)| format!("• {name} — {who}, {} ({status})", m(*total))).collect();
        out.push_str(&format!("\nLatest orders:\n{}", lines.join("\n")));
    }
    out
}

// ---------------------------------------------------------------------------
// Asking
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Ask {
    Sales,
    Orders,
    Stock,
}

pub fn parse(said: &str) -> Option<Ask> {
    let s = format!(" {} ", said.to_lowercase().replace(['?', '!', ',', '.'], " ").split_whitespace().collect::<Vec<_>>().join(" "));
    if s.contains(" low on stock") || s.contains(" low stock") || s.contains(" running out of stock") || s.contains(" out of stock") || s.contains(" inventory") {
        return Some(Ask::Stock);
    }
    if s.contains(" new orders") || s.contains(" any orders") || s.contains(" my orders") || s.contains(" shopify orders") || s.contains(" orders to ship") || s.contains(" orders today") {
        return Some(Ask::Orders);
    }
    if s.contains(" my sales") || s.contains(" sales today") || s.contains(" sales this") || s.contains(" how much did i make") || s.contains(" how much have i made") || s.contains(" my revenue") || s.contains(" stripe balance") || s.contains(" stripe payments") || s.contains(" stripe sales") || s.contains(" my stripe") {
        return Some(Ask::Sales);
    }
    None
}

/// `parse`, but generic asks ("any new orders?") only when a shop is
/// connected; naming Stripe or Shopify always counts.
pub fn parse_here(said: &str) -> Option<Ask> {
    let ask = parse(said)?;
    let st = crate::state::store().settings();
    let connected = !st.stripe_key.trim().is_empty() || !st.shopify_token.trim().is_empty();
    // Not connected: a clear shop ask still gets told how to connect.
    let named = { let s = said.to_lowercase(); s.contains("stripe") || s.contains("shopify") };
    (connected || named).then_some(ask)
}

pub fn handle(ask: Ask) -> String {
    let st = crate::state::store().settings();
    let has_stripe = !st.stripe_key.trim().is_empty();
    let has_shopify = !st.shopify_token.trim().is_empty();
    let stripe = || stripe_sales().map(|s| say_sales(&s)).unwrap_or_else(|e| format!("💳 Stripe: {e}"));
    let shopify = || shopify_store().map(|s| say_store(&s)).unwrap_or_else(|e| format!("🛍️ Shopify: {e}"));
    let out = match ask {
        Ask::Stock | Ask::Orders => shopify(),
        Ask::Sales => match (has_stripe, has_shopify) {
            (true, true) => format!("{}\n\n{}", stripe(), shopify()),
            (false, true) => shopify(),
            _ => stripe(),
        },
    };
    eprintln!("[shop] answered a {ask:?} question");
    format!("{out}\n\n(Read only — nothing was charged, refunded or changed.)")
}

/// For "what needs my attention?": orders to ship, low stock, today's sales.
pub fn attention() -> (Vec<String>, Vec<String>, bool) {
    let st = crate::state::store().settings();
    let (mut lines, mut couldnt, mut checked) = (Vec::new(), Vec::new(), false);
    if !st.stripe_key.trim().is_empty() {
        match stripe_sales() {
            Ok(s) => {
                checked = true;
                lines.push(format!("💳 Stripe today: {} from {} payment{}", money(s.today, &s.currency), s.today_count, if s.today_count == 1 { "" } else { "s" }));
            }
            Err(e) => couldnt.push(format!("Stripe ({e})")),
        }
    }
    if !st.shopify_token.trim().is_empty() {
        match shopify_store() {
            Ok(s) => {
                checked = true;
                if s.to_ship > 0 {
                    lines.push(format!("📦 {} Shopify order{} to send", s.to_ship, if s.to_ship == 1 { "" } else { "s" }));
                }
                if !s.low_stock.is_empty() {
                    lines.push(format!("⚠️ Low stock: {}", s.low_stock.iter().take(3).map(|(n, q)| format!("{n} ({q})")).collect::<Vec<_>>().join(", ")));
                }
            }
            Err(e) => couldnt.push(format!("Shopify ({e})")),
        }
    }
    (lines, couldnt, checked)
}

/// What the panel and the phone show.
#[derive(Debug, Clone, Serialize, Default)]
pub struct View {
    pub stripe: Option<Sales>,
    pub stripe_error: Option<String>,
    pub shopify: Option<Store>,
    pub shopify_error: Option<String>,
}

pub fn view() -> View {
    let st = crate::state::store().settings();
    let mut v = View::default();
    if !st.stripe_key.trim().is_empty() {
        match stripe_sales() {
            Ok(s) => v.stripe = Some(s),
            Err(e) => v.stripe_error = Some(e.to_string()),
        }
    }
    if !st.shopify_token.trim().is_empty() || !st.shopify_store.trim().is_empty() {
        match shopify_store() {
            Ok(s) => v.shopify = Some(s),
            Err(e) => v.shopify_error = Some(e.to_string()),
        }
    }
    v
}

pub fn test_stripe(key: &str) -> Result<String> {
    if key.trim().is_empty() {
        return Err(anyhow!("paste a key first"));
    }
    Ok(say_sales(&stripe_sales()?))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn stripe_totals() {
        let today = 1_000_000;
        let charges = vec![
            json!({ "status": "succeeded", "paid": true, "amount": 2500, "amount_refunded": 0, "currency": "usd", "created": today + 50, "billing_details": { "name": "Ama" } }),
            json!({ "status": "succeeded", "paid": true, "amount": 1000, "amount_refunded": 1000, "currency": "usd", "created": today - 500 }),
            json!({ "status": "failed", "paid": false, "amount": 9999, "currency": "usd", "created": today + 60 }),
        ];
        let balance = json!({ "available": [{ "amount": 12000, "currency": "usd" }], "pending": [{ "amount": 3000, "currency": "usd" }] });
        let s = sales_from(&charges, &balance, today);
        assert_eq!((s.today, s.today_count, s.month, s.month_count, s.refunded), (2500, 1, 2500, 2, 1000));
        assert_eq!((s.available, s.pending), (12000, 3000));
        let said = say_sales(&s);
        assert!(said.contains("today: $25.00 from 1 payment") && said.contains("$120.00 available"), "{said}");
    }

    #[test]
    fn shopify_totals() {
        let orders = json!({ "data": { "orders": { "edges": [
            { "node": { "name": "#1002", "createdAt": "2026-10-18T09:00:00Z", "displayFinancialStatus": "PAID", "displayFulfillmentStatus": "UNFULFILLED", "customer": { "displayName": "Kofi" }, "totalPriceSet": { "shopMoney": { "amount": "40.00", "currencyCode": "USD" } } } },
            { "node": { "name": "#1001", "createdAt": "2026-10-02T09:00:00Z", "displayFinancialStatus": "PAID", "displayFulfillmentStatus": "FULFILLED", "customer": null, "totalPriceSet": { "shopMoney": { "amount": "15.50", "currencyCode": "USD" } } } }
        ] } } });
        let low = json!({ "data": { "productVariants": { "edges": [ { "node": { "displayName": "Mug - Blue", "inventoryQuantity": 2 } }, { "node": { "displayName": "Tee - M", "inventoryQuantity": 0 } }, { "node": { "displayName": "E-book", "inventoryQuantity": 0, "inventoryItem": { "tracked": false } } } ] } } });
        let s = store_from(&orders, &low, "2026-10-18");
        assert_eq!((s.today_orders, s.month_orders, s.month_total, s.to_ship), (1, 2, 55.5, 1));
        assert_eq!(s.low_stock[0], ("Tee - M".to_string(), 0));
        assert_eq!(s.low_stock.len(), 2, "the untracked e-book isn't low stock");
        let said = say_store(&s);
        assert!(said.contains("1 paid order waiting") && said.contains("Tee - M (0 left)") && said.contains("#1002 — Kofi"), "{said}");
    }

    #[test]
    fn hears_shop_asks() {
        assert_eq!(parse("how are my sales today?"), Some(Ask::Sales));
        assert_eq!(parse("how much did I make this month"), Some(Ask::Sales));
        assert_eq!(parse("any new orders"), Some(Ask::Orders));
        assert_eq!(parse("what's low on stock"), Some(Ask::Stock));
        assert_eq!(parse("make me a sandwich"), None);
        assert_eq!(parse("what is shopify"), None, "a question about the product, not my shop");
        assert_eq!(parse("is stripe a good company"), None);
        assert_eq!(parse("what's my stripe balance"), Some(Ask::Sales));
        assert_eq!(shop_domain("https://ama-bakery.myshopify.com/admin").as_deref(), Some("ama-bakery.myshopify.com"));
        assert_eq!(shop_domain("ama-bakery").as_deref(), Some("ama-bakery.myshopify.com"));
        assert_eq!(shop_domain("evil.com"), None, "only Shopify's own addresses get the token");
    }
}
