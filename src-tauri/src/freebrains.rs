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
    // Sizes are read from whole name parts above ("1b", "3b"); a bare "1b"
    // inside a name also matched "31b" and benched Gemma 4 31B as tiny.
    size.is_some_and(|b| b < 20.0) || ["-nano", "-mini", "gemma-3-4b", "gemma-3n", "phi-", "tinyllama"].iter().any(|k| m.contains(k))
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
    let mut out: HashMap<String, Vec<String>> = HashMap::new();
    for p in providers.iter().filter(|p| !p.api_key.trim().is_empty() && crate::transport::key_may_go(&p.base_url)) {
        let Ok(client) = key_client(&p.base_url, Duration::from_secs(15)) else { continue };
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
                        if ok && !not_chat(&id) && !too_small(&id) {
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

/// A new key for a provider: its models' rests (a denial for the old key, a
/// rate limit on it) don't carry over.
pub fn forget_rests(id: ProviderId) {
    RESTING.lock().retain(|(p, _, _)| *p != id);
}

/// Take one model's rest away (tests tidy up after themselves).
#[cfg(test)]
pub fn unrest(id: ProviderId, model: &str) {
    RESTING.lock().retain(|(p, m, _)| !(*p == id && m == model));
}

pub(crate) fn resting(id: ProviderId, model: &str) -> bool {
    let mut r = RESTING.lock();
    let now = Instant::now();
    r.retain(|(_, _, until)| *until > now);
    r.iter().any(|(p, m, _)| *p == id && m == model)
}

/// How long until the first resting model is free again, or `None` when
/// nothing is resting. A free tier says exactly when it's back ("try again in
/// 22s"); asking again after three seconds hit the same wall, and each failed
/// try doubled the rest — so the task died waiting for a queue it had made
/// longer itself. The retry loop waits *this* long instead.
pub fn soonest_wake() -> Option<Duration> {
    let mut r = RESTING.lock();
    let now = Instant::now();
    r.retain(|(_, _, until)| *until > now);
    r.iter().map(|(_, _, until)| until.saturating_duration_since(now)).min()
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

/// A client for requests that carry a key. A server on this PC is reached
/// directly, never through a proxy, which would carry the key off the
/// machine over plain http.
fn key_client(base_url: &str, timeout: Duration) -> reqwest::Result<reqwest::blocking::Client> {
    let builder = reqwest::blocking::Client::builder().timeout(timeout).redirect(crate::transport::redirects());
    let builder = if crate::transport::is_local(base_url) { builder.no_proxy() } else { builder };
    builder.build()
}

/// Not a chat model at all: music, safety filters, embeddings, speech, image
/// makers, and the specialist models NVIDIA lists beside the chat ones
/// (robot video, chip calibration plots, captioning, code-only).
fn not_chat(id: &str) -> bool {
    let id = id.to_lowercase();
    [
        "lyria", "safety", "guard", "embed", "moderation", "rerank", "-tts", "whisper", "image-gen", "imagen",
        "diffusion", "cosmos", "ising", "paligemma", "reward", "retriever", "parse", "riva", "translate",
        "coder", "codestral", "starcoder",
    ]
    .iter()
    .any(|k| id.contains(k))
}

/// One free model on the person's key that answered a real request.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct FreeModel {
    pub id: String,
    /// It was shown a picture and said what was in it: it can drive the screen.
    pub sees: bool,
    /// How long its short test answer took.
    pub ms: u64,
}

/// What a search of the person's key found.
#[derive(Debug, Clone, Serialize)]
pub struct FreeSearch {
    /// The models that answered, best for Izuki first: those that see the
    /// screen (strongest first), then chat-only ones (fastest first).
    pub working: Vec<FreeModel>,
    /// How many models the key lists, and how many were tried.
    pub listed: usize,
    pub tried: usize,
}

/// A 16×16 red square: a screen model must say "red".
const RED_PNG: &str = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAFklEQVR42mP4z8BAEmIY1TCqYfhqAACQ+f8B8u7oVwAAAABJRU5ErkJggg==";

/// Which listed models are worth a real try: the strongest few that should
/// see a screen, and a few chat models (a free list changes every few weeks
/// and lists models that no longer answer, so nothing is trusted by name).
fn candidates(ids: &[String]) -> (Vec<String>, Vec<String>) {
    let mut vision: Vec<String> = ids
        .iter()
        .filter(|m| sees(ProviderId::Nvidia, m.as_str()) && !not_chat(m.as_str()) && !too_small(m.as_str()))
        .cloned()
        .collect();
    vision.sort_by_key(|m| -rank(m.as_str()));
    vision.dedup();
    vision.truncate(4);
    let mut chat: Vec<String> = ids
        .iter()
        .filter(|m| !vision.contains(*m) && !not_chat(m.as_str()) && !too_small(m.as_str()) && chat_rank(m.as_str()) > 0)
        .cloned()
        .collect();
    chat.sort_by_key(|m| -chat_rank(m.as_str()));
    chat.dedup();
    chat.truncate(3);
    (vision, chat)
}

/// How good a free model is for plain chat (0: not a chat model by its name).
fn chat_rank(m: &str) -> i32 {
    let m = m.to_ascii_lowercase();
    let mut r = rank(&m);
    for (k, v) in [("llama-3.3-70b", 52), ("gpt-oss", 47), ("flash", 45), ("deepseek", 44), ("nemotron", 40), ("instruct", 20), ("-it", 20), ("chat", 20)] {
        if m.contains(k) {
            r = r.max(v);
        }
    }
    r
}

/// The text of a chat answer, if it has any. A "thinking" model that spent
/// its whole allowance reasoning answers with nothing: no use to Izuki.
fn answer_text(body: &serde_json::Value) -> Option<String> {
    let text = body["choices"][0]["message"]["content"].as_str().unwrap_or("").trim().to_string();
    (!text.is_empty()).then_some(text)
}

/// Try one model for real: a picture for a screen candidate, a word for chat.
fn try_model(client: &reqwest::blocking::Client, cfg: &ProviderConfig, model: &str, picture: bool) -> Option<FreeModel> {
    let content = if picture {
        serde_json::json!([
            { "type": "text", "text": "What colour fills this picture? Answer with one word." },
            { "type": "image_url", "image_url": { "url": format!("data:image/png;base64,{RED_PNG}") } }
        ])
    } else {
        serde_json::json!("Reply with the single word: ready")
    };
    let started = Instant::now();
    let body: serde_json::Value = client
        .post(format!("{}/chat/completions", cfg.base_url.trim_end_matches('/')))
        .bearer_auth(cfg.api_key.trim())
        .json(&serde_json::json!({ "model": model, "messages": [{ "role": "user", "content": content }], "max_tokens": 24, "temperature": 0 }))
        .send()
        .ok()
        .filter(|r| r.status().is_success())?
        .json()
        .ok()?;
    let text = answer_text(&body)?;
    let sees = picture && text.to_lowercase().contains("red");
    Some(FreeModel { id: model.to_string(), sees, ms: started.elapsed().as_millis() as u64 })
}

/// Search the person's own key for the free models that fit Izuki: list
/// what the key offers, try the likely ones with a real request (at the
/// same time, well inside a free tier's per-minute allowance), and keep
/// the ones that answered. The screen ones also become this key's siblings.
pub fn search(cfg: &ProviderConfig) -> anyhow::Result<FreeSearch> {
    if cfg.api_key.trim().is_empty() {
        anyhow::bail!("add your API key first");
    }
    if !crate::transport::key_may_go(&cfg.base_url) {
        anyhow::bail!("the endpoint starts with http://, so your key would travel unprotected — use the https:// address");
    }
    crate::tls_ready();
    let client = key_client(&cfg.base_url, Duration::from_secs(25))?;
    let res = client
        .get(format!("{}/models", cfg.base_url.trim_end_matches('/')))
        .bearer_auth(cfg.api_key.trim())
        .send()
        .map_err(|_| anyhow::anyhow!("couldn't reach {} — check the internet connection", cfg.label))?;
    match res.status().as_u16() {
        200..=299 => {}
        401 | 403 => anyhow::bail!("the key was turned down — copy it again, the whole key"),
        code => anyhow::bail!("{} answered {code}", cfg.label),
    }
    let body: serde_json::Value = res
        .json()
        .map_err(|_| anyhow::anyhow!("{} sent a model list Izuki couldn't read — try again in a minute", cfg.label))?;
    let ids: Vec<String> = body["data"].as_array().into_iter().flatten().filter_map(|m| m["id"].as_str().map(str::to_string)).collect();
    if ids.is_empty() {
        anyhow::bail!("the key works, but {} lists no models for it yet — a brand-new key can take a few minutes", cfg.label);
    }
    let (vision, chat) = candidates(&ids);
    let tries: Vec<(String, bool)> = vision.iter().map(|m| (m.clone(), true)).chain(chat.iter().map(|m| (m.clone(), false))).collect();
    let http = &client;
    let mut working: Vec<FreeModel> = std::thread::scope(|s| {
        // A screen candidate that turns the picture down (a text-only model
        // whose name looked like a vision one) is tried once more as chat,
        // so it shows up as chat-only instead of vanishing.
        let handles: Vec<_> = tries
            .iter()
            .map(|(m, picture)| {
                s.spawn(move || try_model(http, cfg, m, *picture).or_else(|| if *picture { try_model(http, cfg, m, false) } else { None }))
            })
            .collect();
        handles.into_iter().filter_map(|h| h.join().ok().flatten()).collect()
    });
    working.sort_by(|a, b| b.sees.cmp(&a.sees).then_with(|| if a.sees { rank(&b.id).cmp(&rank(&a.id)) } else { a.ms.cmp(&b.ms) }));
    let seeing: Vec<String> = working.iter().filter(|m| m.sees).map(|m| m.id.clone()).collect();
    if !seeing.is_empty() {
        let mut g = load();
        let saved = g.get_or_insert_with(Saved::default);
        saved.models.insert(key(cfg.id), seeing);
        saved.at = crate::model::now_ms() as u64 / 1000;
        if !cfg!(test) {
            let _ = std::fs::write(file(), serde_json::to_string(&*saved).unwrap_or_default());
        }
    }
    eprintln!("[free-brains] search on {}: {} listed, {} tried, {} answered", cfg.label, ids.len(), tries.len(), working.len());
    Ok(FreeSearch { working, listed: ids.len(), tried: tries.len() })
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
        assert!(!too_small("google/gemma-4-31b-it"), "31B isn't tiny (\"1b\" inside \"31b\")");
        assert!(!too_small("qwen/qwen2.5-vl-72b-instruct"));
        assert!(too_small("meta/llama-3.2-1b-instruct"));
        assert!(too_small("meta/llama-3.2-3b-instruct"));
        assert!(sees(ProviderId::Groq, "meta-llama/llama-4-scout-17b-16e-instruct"));
        assert!(!sees(ProviderId::Groq, "llama-3.3-70b-versatile"));
        assert!(sees(ProviderId::Gemini, "gemini-2.5-flash-lite"));
        assert!(!sees(ProviderId::Gemini, "gemini-2.5-flash-preview-tts"));
        assert!(rank("meta-llama/llama-4-maverick-17b-128e-instruct") > rank("meta-llama/llama-4-scout-17b-16e-instruct"));
    }

    #[test]
    fn soonest_wake_is_the_first_model_back() {
        let a = ProviderConfig { id: ProviderId::Groq, label: "a".into(), base_url: "http://unused.invalid".into(), model: "izuki-test-wake-slow".into(), api_key: String::new(), enabled: true };
        let b = ProviderConfig { model: "izuki-test-wake-fast".into(), ..a.clone() };
        rest_model(&a, Duration::from_secs(40));
        rest_model(&b, Duration::from_secs(5));
        // The soonest one, not the slowest: waiting 40 s when a key returns in
        // five would throw the task away for no reason.
        let d = soonest_wake().expect("two models are resting");
        assert!(d <= Duration::from_secs(5), "waited for the slowest: {d:?}");
        assert!(d > Duration::from_secs(3), "never waits for a model that is already back: {d:?}");
    }

    #[test]
    fn a_free_search_tries_the_strong_screen_models_and_a_few_chat_ones() {
        // Shaped like NVIDIA's free list in November 2026.
        let ids: Vec<String> = [
            "meta/llama-4-maverick-17b-128e-instruct",
            "google/gemma-4-31b-it",
            "meta/llama-3.2-90b-vision-instruct",
            "meta/llama-3.2-11b-vision-instruct",
            "nvidia/cosmos-nemotron-34b",
            "google/paligemma",
            "nvidia/nv-embedqa-e5-v5",
            "meta/llama-3.3-70b-instruct",
            "openai/gpt-oss-20b",
            "z-ai/glm-5.3-flash",
            "nvidia/nemotron-3.5-bolt-e4b",
            "qwen/qwen2.5-coder-32b-instruct",
            "nvidia/llama-3.1-nemoguard-8b-content-safety",
        ]
        .iter()
        .map(|s| s.to_string())
        .collect();
        let (vision, chat) = candidates(&ids);
        assert_eq!(vision.first().map(String::as_str), Some("meta/llama-4-maverick-17b-128e-instruct"), "{vision:?}");
        assert!(vision.iter().any(|m| m == "google/gemma-4-31b-it"), "{vision:?}");
        assert!(!vision.iter().any(|m| m.contains("11b")), "tiny screen models aren't offered: {vision:?}");
        assert!(!vision.iter().chain(&chat).any(|m| m.contains("cosmos") || m.contains("paligemma") || m.contains("embed") || m.contains("safety") || m.contains("coder")), "specialist models aren't chat: {vision:?} {chat:?}");
        assert!(chat.iter().any(|m| m == "meta/llama-3.3-70b-instruct"), "{chat:?}");
        assert!(chat.len() <= 3 && vision.len() <= 4, "a short, polite number of tries");
    }

    #[test]
    fn a_key_never_travels_over_plain_http_to_another_machine() {
        assert!(crate::transport::key_may_go("https://integrate.api.nvidia.com/v1"));
        assert!(crate::transport::key_may_go("http://127.0.0.1:20128/v1"));
        assert!(crate::transport::key_may_go("http://localhost:11434"));
        assert!(!crate::transport::key_may_go("http://integrate.api.nvidia.com/v1"));
        assert!(!crate::transport::key_may_go("http://192.168.1.20:8000/v1"));
        assert!(!crate::transport::key_may_go("http://127.example.com/v1"));
    }

    #[test]
    fn an_empty_answer_doesnt_count() {
        let said = serde_json::json!({ "choices": [{ "message": { "content": " Red. " } }] });
        assert_eq!(answer_text(&said).as_deref(), Some("Red."));
        // A "thinking" model that used its whole allowance thinking.
        let thought = serde_json::json!({ "choices": [{ "message": { "content": "", "reasoning_content": "Let me look…" } }] });
        assert_eq!(answer_text(&thought), None);
        assert_eq!(answer_text(&serde_json::json!({ "error": "not found" })), None);
    }
}
