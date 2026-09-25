//! Ghost hand.
//!
//! Izuki remembers where you tend to click in each app. Once it has seen the
//! same neighbourhood three times it can pre-draw a translucent hand there
//! before you draw anything — a guess you can accept with one click or ignore
//! entirely. Kept deliberately simple and local: a grid histogram per app, in
//! one small JSON file that never leaves the machine.

use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::Arc;

use crate::store::Store;

/// Clicks land within a cell this wide before they count as "the same spot".
const CELL: i32 = 48;
/// How many samples before we are willing to show a prediction.
const MIN_SAMPLES: u32 = 3;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct Spot {
    x: i32,
    y: i32,
    count: u32,
    last: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Prediction {
    pub x: i32,
    pub y: i32,
    pub confidence: f32,
    pub app: String,
}

fn cell_key(x: i32, y: i32) -> String {
    format!("{}:{}", x.div_euclid(CELL), y.div_euclid(CELL))
}

/// Record that a click happened at (x, y) inside `app`.
pub fn record(store: &Arc<Store>, app: &str, x: i32, y: i32) {
    if app.is_empty() {
        return;
    }
    let mut root = store.read_ghost();
    if !root.is_object() {
        root = serde_json::json!({});
    }

    let key = cell_key(x, y);
    let entry = root
        .as_object_mut()
        .expect("checked above")
        .entry(app.to_string())
        .or_insert_with(|| serde_json::json!({}));

    if !entry.is_object() {
        *entry = serde_json::json!({});
    }

    let obj = entry.as_object_mut().expect("checked above");
    let mut spot: Spot = obj
        .get(&key)
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();

    // Running mean keeps the prediction drifting toward where you actually
    // click rather than pinning to the first sample.
    let n = spot.count as f64;
    spot.x = (((spot.x as f64) * n + x as f64) / (n + 1.0)).round() as i32;
    spot.y = (((spot.y as f64) * n + y as f64) / (n + 1.0)).round() as i32;
    spot.count += 1;
    spot.last = crate::model::now_ms();

    obj.insert(key, serde_json::to_value(spot).unwrap_or(Value::Null));

    // Keep each app's history small so the file stays trivial to read.
    if obj.len() > 64 {
        let mut items: Vec<(String, u32)> = obj
            .iter()
            .map(|(k, v)| (k.clone(), v["count"].as_u64().unwrap_or(0) as u32))
            .collect();
        items.sort_by_key(|(_, c)| *c);
        for (k, _) in items.into_iter().take(obj.len() - 64) {
            obj.remove(&k);
        }
    }

    store.write_ghost(&root);
}

/// Best guess at where you are about to click in `app`, if we have enough
/// evidence to be worth showing.
pub fn predict(store: &Arc<Store>, app: &str) -> Option<Prediction> {
    if app.is_empty() {
        return None;
    }
    let root = store.read_ghost();
    let spots = root.get(app)?.as_object()?;

    let mut best: Option<Spot> = None;
    let mut total: u32 = 0;

    for v in spots.values() {
        let Ok(s) = serde_json::from_value::<Spot>(v.clone()) else {
            continue;
        };
        total += s.count;
        if best.as_ref().map_or(true, |b| s.count > b.count) {
            best = Some(s);
        }
    }

    let best = best?;
    if best.count < MIN_SAMPLES || total == 0 {
        return None;
    }

    Some(Prediction {
        x: best.x,
        y: best.y,
        confidence: (best.count as f32 / total as f32).clamp(0.0, 1.0),
        app: app.to_string(),
    })
}
