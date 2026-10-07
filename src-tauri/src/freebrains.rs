//! Making free AI keys work sharply.
//!
//! Free tiers limit each *model* separately — Groq's Llama 4 Scout and
//! Maverick, Gemini's Flash and Flash-Lite, every ":free" model on OpenRouter
//! each have their own allowance. Izuki used to rest a whole provider when
//! one model said "too many requests", throwing the rest of that free
//! capacity away, and fall back to whatever tiny model was left (which then
//! "answered" without doing anything).
//!
//! Now, once a day, Izuki asks each provider you have a key for which models
//! it offers, keeps the strong ones that can see a screenshot, and uses them
//! as siblings: when one model is resting, the next one from the same key
//! answers. A rate limit rests only that model. Tiny models are never used
//! to drive the screen while a stronger one is free.

use std::collections::HashMap;
use std::time::{Duration, Instant};

use parking_lot::Mutex;
use serde::{Deserialize, Serialize};

use crate::settings::{ProviderConfig, ProviderId};

#[derive(Default, Serialize, Deserialize)]
struct Saved {
    /// When the lists were fetched (unix seconds).
    at: u64,
    /// Provider (as its serde name) → strong vision models, best first.
    models: HashMap<String, Vec<String>>,
}

static SAVED: Mutex<Option<Saved>> = Mutex::new(None);
/// (provider, model) resting after "too many requests", until when.
static RESTING: Mutex<Vec<(ProviderId, String, Instant)>> = Mutex::new(Vec::new());

fn file() -> std::path::PathBuf {
    crate::store::data_dir().join("free_models.json")
}

fn key(id: ProviderId) -> String {
    serde_json::to_value(id).ok().and_then(|v| v.as_str().map(str::to_string)).unwrap_or_default()
}

fn load() -> parking_lot::MutexGuard<'static, Option<Saved>> {
    let mut g = SAVED.lock();
    if g.is_none() {
        *g = Some(if cfg!(test) { Saved::default() } else {
            std::fs::read_to_string(file()).ok().and_then(|t| serde_json::from_str(&t).ok()).unwrap_or_default()
        });
    }
    g
}

/// A tiny model: fine for chat, too weak to drive a screen.
pub fn too_small(model: &str) -> bool {
    let m = model.to_ascii_lowercase();
    if ["-nano", "-mini", "inkling-small", "tinyllama"].iter().any(|k| m.contains(k)) {
        return true;
    }
    // Mixture-of-experts: "17b" active, but a big model (Llama 4 Scout, Maverick).
    if ["maverick", "scout", "-moe", "a3b", "a4b", "a22b", "128e", "16e"].iter().any(|k| m.contains(k)) {
        return false;
    }
    let size = m
        .split(|c: char| !(c.is_ascii_alphanumeric() || c == '.'))
        .filter_map(|part| part.strip_suffix('b').and_then(|n| n.parse::<f32>().ok()))
        .next();
    size.is_some_and(|b| b < 20.0) || ["-nano", "-mini", "gemma-3-4b", "gemma-3n", "phi-", "tinyllama", "1b", "3b"].iter().any(|k| m.contains(k))
}

/// How good a free model is at reading a screen (bigger is better).
fn rank(m: &str) -> i32 {
    let m = m.to_ascii_lowercase();
    let mut r = 0;
    for (k, v) in [("maverick", 60), ("gemini-2.5-flash", 58), ("gemini-flash-latest", 57), ("pro", 55), ("qwen2.5-vl-72b", 54), ("qwen3", 50), ("90b", 50), ("72b", 48), ("scout", 45), ("70b", 44), ("gemma-3-27b", 42), ("gemma-4", 46), ("flash-lite", 40), ("pixtral", 38), ("mistral-small", 30), ("32b", 34), ("27b", 32)] {
        if m.contains(k) {
            r = r.max(v);
        }
    }
    if m.contains("preview") || m.contains("exp") {
        r -= 5;
    }
    r
}

/// Can it see a screenshot? From its name (OpenRouter says so outright).
fn sees(id: ProviderId, m: &str) -> bool {
    let m = m.to_ascii_lowercase();
    match id {
        ProviderId::Gemini => m.contains("gemini") && !["tts", "image", "embedding", "audio", "live", "aqa", "learnlm"].iter().any(|k| m.contains(k)),
        _ => ["vision", "-vl", "vl-", "llama-4", "maverick", "scout", "pixtral", "gemma-3", "gemma-4", "qwen3", "llava", "kimi-vl", "mistral-small-3"].iter().any(|k| m.contains(k)),
    }
}

/// Fetch the model lists (once a day, in the background).
pub fn refresh_later() {
    std::thread::spawn(|| {
        std::thread::sleep(Duration::from_secs(20));
        let stale = load().as_ref().is_none_or(|s| crate::model::now_ms() as u64 / 1000 - s.at > 24 * 3600 || s.models.is_empty());
        if stale {
            refresh();
        }
    });
}

pub fn refresh() {
    let Some(store) = crate::state::try_store() else { return };
    let settings = store.settings();
    let out = discover(&settings.providers);
    if out.is_empty() {
        return;
    }
    let saved = Saved { at: crate::model::now_ms() as u64 / 1000, models: out };
    let _ = std::fs::write(file(), serde_json::to_string(&saved).unwrap_or_default());
    *SAVED.lock() = Some(saved);
}

/// Each keyed provider's strong free vision models, best first.
fn discover(providers: &[ProviderConfig]) -> HashMap<String, Vec<String>> {
    let Ok(client) = reqwest::blocking::Client::builder().timeout(Duration::from_secs(15)).build() else { return HashMap::new() };
    let mut out: HashMap<String, Vec<String>> = HashMap::new();
    for p in providers.iter().filter(|p| !p.api_key.trim().is_empty()) {
        let base = p.base_url.trim_end_matches('/');
        let mut names: Vec<String> = Vec::new();
        match p.id {
            ProviderId::Gemini => {
                let root = base.split("/v1").next().unwrap_or(base).trim_end_matches('/');
                let url = format!("{root}/v1beta/models?key={}&pageSize=200", p.api_key.trim());
                if let Ok(v) = client.get(url).send().and_then(|r| r.json::<serde_json::Value>()) {
                    for m in v["models"].as_array().into_iter().flatten() {
                        let methods = m["supportedGenerationMethods"].as_array().map(|a| a.iter().any(|x| x == "generateContent")).unwrap_or(false);
                        let name = m["name"].as_str().unwrap_or("").trim_start_matches("models/").to_string();
                        // The free tier: Flash and Flash-Lite (Pro has no free quota for images).
                        if methods && name.contains("flash") && sees(p.id, &name) {
                            names.push(name);
                        }
                    }
                }
            }
            ProviderId::Groq | ProviderId::Openrouter | ProviderId::Nvidia | ProviderId::Mistral => {
                if let Ok(v) = client.get(format!("{base}/models")).bearer_auth(p.api_key.trim()).send().and_then(|r| r.json::<serde_json::Value>()) {
                    for m in v["data"].as_array().into_iter().flatten() {
                        let id = m["id"].as_str().unwrap_or("").to_string();
                        let ok = if p.id == ProviderId::Openrouter {
                            // Free, and takes images.
                            let free = id.ends_with(":free") || m["pricing"]["prompt"].as_str() == Some("0");
                            let image = m["architecture"]["input_modalities"].as_array().is_some_and(|a| a.iter().any(|x| x == "image"));
                            free && image
                        } else {
                            sees(p.id, &id)
                        };
                        // Not chat models at all (music, safety filters, embeddings).
                        let odd = ["lyria", "safety", "guard", "embed", "moderation", "rerank", "-tts", "whisper", "image-gen", "imagen"].iter().any(|k| id.to_lowercase().contains(k));
                        if ok && !odd && !too_small(&id) {
                            names.push(id);
                        }
                    }
                }
            }
            _ => continue,
        }
        names.sort_by_key(|n| -rank(n));
        names.dedup();
        names.truncate(6);
        if !names.is_empty() {
            eprintln!("[free-brains] {:?}: {}", p.id, names.join(", "));
            out.insert(key(p.id), names);
        }
    }
    out
}

/// Other strong models on the same key (best first), not counting `cfg.model`.
pub fn siblings(cfg: &ProviderConfig) -> Vec<String> {
    let g = load();
    g.as_ref()
        .and_then(|s| s.models.get(&key(cfg.id)))
        .map(|v| v.iter().filter(|m| **m != cfg.model).cloned().collect())
        .unwrap_or_default()
}

pub fn has_siblings(cfg: &ProviderConfig) -> bool {
    !siblings(cfg).is_empty()
}

/// Rest just this model (the rest of the key's free allowance is still there).
pub fn rest_model(cfg: &ProviderConfig, d: Duration) {
    let mut r = RESTING.lock();
    r.retain(|(p, m, _)| !(*p == cfg.id && *m == cfg.model));
    r.push((cfg.id, cfg.model.clone(), Instant::now() + d));
    eprintln!("[free-brains] resting {} for {} s — its siblings carry on", cfg.model, d.as_secs());
}

fn resting(id: ProviderId, model: &str) -> bool {
    let mut r = RESTING.lock();
    let now = Instant::now();
    r.retain(|(_, _, until)| *until > now);
    r.iter().any(|(p, m, _)| *p == id && m == model)
}

/// The chain with every key's sibling models added (each provider's models
/// together, its chosen one first), resting models left out — and, to drive
/// the screen, no tiny model while a strong one is free.
pub fn expand(chain: Vec<ProviderConfig>, for_screen: bool) -> Vec<ProviderConfig> {
    // Each provider's models (its chosen one first)…
    let mut groups: Vec<Vec<ProviderConfig>> = Vec::new();
    for cfg in chain {
        let mut models = vec![cfg.model.clone()];
        models.extend(siblings(&cfg));
        let mut group = Vec::new();
        for m in models {
            if resting(cfg.id, &m) || group.iter().any(|c: &ProviderConfig| c.model == m) {
                continue;
            }
            if for_screen && too_small(&m) {
                continue;
            }
            let mut c = cfg.clone();
            if m != cfg.model {
                c.label = format!("{} · {}", cfg.label.split(" · ").next().unwrap_or(&cfg.label), short(&m));
            }
            c.model = m;
            group.push(c);
        }
        if !group.is_empty() {
            groups.push(group);
        }
    }
    // …then taken in turns: the best of each provider, then their next best,
    // so one provider's per-minute limit never holds up the rest.
    let mut out = Vec::new();
    let longest = groups.iter().map(|g| g.len()).max().unwrap_or(0);
    for i in 0..longest {
        for g in &groups {
            if let Some(c) = g.get(i) {
                out.push(c.clone());
            }
        }
    }
    // Never bring a blocked/resting or unsuitable model back merely because
    // it was the last one. The caller reports that none is available.
    out
}

fn short(m: &str) -> String {
    m.rsplit('/').next().unwrap_or(m).trim_end_matches(":free").chars().take(28).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn exhausted_chain_does_not_resurrect_a_blocked_model() {
        let cfg = ProviderConfig { id: ProviderId::Openrouter, label: "test".into(), base_url: "http://unused.invalid".into(), model: "izuki-test-access-denied".into(), api_key: String::new(), enabled: true };
        rest_model(&cfg, Duration::from_secs(60));
        assert!(expand(vec![cfg], true).is_empty());
        let tiny = ProviderConfig { id: ProviderId::Ollama, label: "test".into(), base_url: "http://unused.invalid".into(), model: "tinyllama".into(), api_key: String::new(), enabled: true };
        assert!(expand(vec![tiny.clone()], true).is_empty());
        assert_eq!(expand(vec![tiny], false).len(), 1);
    }

    /// What this PC's own keys offer (names only, never keys):
    /// `cargo test freebrains::tests::live -- --ignored --nocapture`.
    #[test]
    #[ignore]
    fn live() {
        let raw = std::fs::read_to_string(crate::store::data_dir().join("settings.json")).unwrap();
        let s: crate::settings::Settings = serde_json::from_str(&raw).unwrap();
        for (p, models) in discover(&s.providers) {
            eprintln!("{p}: {}", models.join(", "));
        }
    }

    #[test]
    fn knows_strong_vision_models_from_tiny_ones() {
        assert!(too_small("meta/llama-3.2-11b-vision-instruct"));
        assert!(!too_small("meta-llama/llama-4-maverick-17b-128e-instruct"));
        assert!(!too_small("gemini-2.5-flash"));
        assert!(too_small("gemma-3-4b-it"));
        assert!(sees(ProviderId::Groq, "meta-llama/llama-4-scout-17b-16e-instruct"));
        assert!(!sees(ProviderId::Groq, "llama-3.3-70b-versatile"));
        assert!(sees(ProviderId::Gemini, "gemini-2.5-flash-lite"));
        assert!(!sees(ProviderId::Gemini, "gemini-2.5-flash-preview-tts"));
        assert!(rank("meta-llama/llama-4-maverick-17b-128e-instruct") > rank("meta-llama/llama-4-scout-17b-16e-instruct"));
    }
}
