//! Learning from experience.
//!
//! When a task works, how it was done is kept: "open blackboard" → pressed
//! ctrl+l, typed "blackboard.school.edu", clicked "Sign in". The next time a
//! similar task comes in, the agent is told what worked last time and goes
//! straight there instead of rediscovering it. The more Izuki is used on a
//! PC, the quicker it gets on that PC. Kept on disk (recipes.json), newest
//! first, a few dozen at most.

use std::collections::HashSet;
use std::path::PathBuf;

use parking_lot::Mutex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Recipe {
    /// What the user asked, as they said it.
    pub task: String,
    /// The app it was done in (e.g. "chrome.exe").
    #[serde(default)]
    pub app: String,
    /// What was done, step by step, in a few words each.
    pub steps: Vec<String>,
    /// When it last worked (ms since epoch).
    pub at: i64,
}

const KEEP: usize = 60;
/// How alike two requests must be (share of meaningful words) to reuse a recipe.
const ALIKE: f32 = 0.5;

static CACHE: Mutex<Option<Vec<Recipe>>> = Mutex::new(None);

fn file() -> PathBuf {
    crate::store::data_dir().join("recipes.json")
}

fn with_recipes<T>(f: impl FnOnce(&mut Vec<Recipe>) -> T) -> T {
    let mut guard = CACHE.lock();
    let list = guard.get_or_insert_with(|| {
        if cfg!(test) {
            return Vec::new();
        }
        std::fs::read_to_string(file())
            .ok()
            .and_then(|raw| serde_json::from_str(&raw).ok())
            .unwrap_or_default()
    });
    f(list)
}

/// The words that carry the meaning of a request.
fn words(s: &str) -> HashSet<String> {
    const SKIP: &[&str] = &[
        "a", "an", "the", "my", "me", "to", "and", "please", "can", "you", "could", "would", "for", "on",
        "in", "of", "it", "this", "that", "some", "go", "i", "want", "need", "hey", "nova", "izuki", "now",
        "just", "up", "open", "with", "at", "is", "be",
    ];
    s.to_lowercase()
        .split(|c: char| !c.is_alphanumeric())
        .filter(|w| w.len() > 1 && !SKIP.contains(w))
        .map(str::to_string)
        .collect()
}

/// How alike two requests are: 0 (nothing shared) … 1 (same words).
pub fn likeness(a: &str, b: &str) -> f32 {
    let (x, y) = (words(a), words(b));
    if x.is_empty() || y.is_empty() {
        // "Open Spotify" vs "open spotify": only the skipped word "open" plus one word each.
        return if a.trim().eq_ignore_ascii_case(b.trim()) { 1.0 } else { 0.0 };
    }
    let shared = x.intersection(&y).count() as f32;
    shared / x.union(&y).count() as f32
}

/// Keep how a task was done (replacing an older way of doing the same thing).
pub fn remember(task: &str, app: &str, steps: &[String]) {
    if steps.is_empty() || task.trim().is_empty() {
        return;
    }
    let recipe = Recipe {
        task: task.trim().chars().take(160).collect(),
        app: app.to_string(),
        steps: steps.iter().take(20).cloned().collect(),
        at: chrono_now_ms(),
    };
    with_recipes(|list| {
        list.retain(|r| likeness(&r.task, &recipe.task) < 0.85);
        list.insert(0, recipe);
        list.truncate(KEEP);
        if !cfg!(test) {
            if let Ok(json) = serde_json::to_string_pretty(list) {
                let _ = std::fs::write(file(), json);
            }
        }
    });
}

/// The best past recipe for a request, if one is alike enough.
pub fn recall(task: &str) -> Option<Recipe> {
    with_recipes(|list| {
        list.iter()
            .map(|r| (likeness(&r.task, task), r))
            .filter(|(l, _)| *l >= ALIKE)
            .max_by(|a, b| a.0.total_cmp(&b.0))
            .map(|(_, r)| r.clone())
    })
}

fn chrono_now_ms() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn similar_requests_find_the_recipe() {
        assert!(likeness("open blackboard", "Open Blackboard please") > 0.9);
        assert!(likeness("play some chill music on youtube", "play chill music on YouTube") >= ALIKE);
        assert!(likeness("open blackboard", "open spotify") < ALIKE);
        remember("open blackboard", "chrome.exe", &["pressed ctrl+l".into(), "typed \"blackboard.uh.edu\"".into()]);
        let r = recall("hey nova open my blackboard").expect("found");
        assert_eq!(r.steps.len(), 2);
        assert!(recall("check the weather").is_none());
    }
}
