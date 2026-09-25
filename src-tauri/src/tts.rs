//! Cloud voices — for when Izuki should sound as human as ChatGPT does.
//!
//! The on-device voice (Kokoro, in the webview) is free and offline but
//! only so expressive. These go further, and both take the reply's mood:
//! - **orpheus** — Canopy Labs' Orpheus on Groq. Very human, reads vocal
//!   directions like `[cheerful]` or `[whisper]`, and free with a Groq
//!   account (a daily request allowance). 200 characters per request, so
//!   the webview sends one sentence at a time.
//! - **openai** — `gpt-4o-mini-tts`, the voice tech behind ChatGPT, steered
//!   with plain-English instructions. Uses the OpenAI key already in Izuki;
//!   paid, but about a cent for several minutes of speech.
//!
//! Keys never leave Rust; the webview only ever gets the WAV back.

use std::time::Duration;

use serde_json::json;

use crate::settings::{ProviderId, Settings};

/// Orpheus reads at most this many characters per request.
pub const ORPHEUS_MAX: usize = 200;

fn orpheus_direction(mood: Option<&str>) -> &'static str {
    match mood {
        Some("cheerful") => "cheerful",
        Some("excited") => "excited",
        Some("calm") => "calm",
        Some("serious") => "serious",
        Some("sympathetic") => "gentle",
        Some("playful") => "playful",
        Some("curious") => "curious",
        _ => "friendly",
    }
}

fn openai_instructions(mood: Option<&str>) -> String {
    let feeling = match mood {
        Some("cheerful") => "cheerful and upbeat, smiling as you speak",
        Some("excited") => "genuinely excited and energetic",
        Some("calm") => "calm, relaxed and reassuring",
        Some("serious") => "serious and focused, but still kind",
        Some("sympathetic") => "gentle, caring and sympathetic",
        Some("playful") => "playful and a little teasing",
        Some("curious") => "curious and interested",
        _ => "warm and friendly",
    };
    format!(
        "You are Izuki, the user's close friend and computer companion. Speak {feeling}. \
         Sound like a real person in a casual conversation: natural rhythm, small pauses, \
         never like an announcer or a robot."
    )
}

fn client() -> Result<reqwest::blocking::Client, String> {
    reqwest::blocking::Client::builder()
        .connect_timeout(Duration::from_secs(8))
        .timeout(Duration::from_secs(40))
        .build()
        .map_err(|e| e.to_string())
}

fn friendly_error(service: &str, status: reqwest::StatusCode, body: &str) -> String {
    match status.as_u16() {
        401 | 403 => format!("{service} rejected the key — check it in Talk to Izuki"),
        402 => format!("{service} needs credits on the account"),
        429 if body.contains("credit") || body.contains("quota") => {
            format!("{service} has no credits left on this account")
        }
        429 => format!("{service} voice limit reached for now"),
        _ => format!("{service} voice failed (HTTP {status})"),
    }
}

/// One line of speech as WAV bytes.
pub fn synthesize(settings: &Settings, engine: &str, text: &str, mood: Option<&str>) -> Result<Vec<u8>, String> {
    let text = text.trim();
    if text.is_empty() {
        return Err("nothing to say".into());
    }
    let c = client()?;
    let voice = settings.cloud_voice.trim();

    let resp = match engine {
        "orpheus" => {
            let key = settings.groq_api_key.trim();
            if key.is_empty() {
                return Err("add a free Groq key to use the Orpheus voice".into());
            }
            let direction = orpheus_direction(mood);
            let budget = ORPHEUS_MAX.saturating_sub(direction.len() + 3);
            let line: String = text.chars().take(budget).collect();
            c.post("https://api.groq.com/openai/v1/audio/speech")
                .bearer_auth(key)
                .json(&json!({
                    "model": "canopylabs/orpheus-v1-english",
                    "input": format!("[{direction}] {line}"),
                    "voice": if voice.is_empty() { "hannah" } else { voice },
                    "response_format": "wav",
                }))
                .send()
        }
        "openai" => {
            let cfg = settings
                .provider(ProviderId::Openai)
                .ok_or("OpenAI isn't set up")?;
            if cfg.api_key.trim().is_empty() {
                return Err("add an OpenAI key to use the ChatGPT voice".into());
            }
            let base = if cfg.base_url.trim().is_empty() {
                "https://api.openai.com/v1".to_string()
            } else {
                cfg.base_url.trim().trim_end_matches('/').to_string()
            };
            c.post(format!("{base}/audio/speech"))
                .bearer_auth(cfg.api_key.trim())
                .json(&json!({
                    "model": "gpt-4o-mini-tts",
                    "input": text,
                    "voice": if voice.is_empty() { "marin" } else { voice },
                    "instructions": openai_instructions(mood),
                    "response_format": "wav",
                }))
                .send()
        }
        other => return Err(format!("unknown voice engine: {other}")),
    }
    .map_err(|e| format!("couldn't reach the voice service ({e})"))?;

    let status = resp.status();
    if !status.is_success() {
        let body = resp.text().unwrap_or_default();
        let service = if engine == "orpheus" { "Groq" } else { "OpenAI" };
        eprintln!("[tts] {engine} HTTP {status}: {}", body.chars().take(200).collect::<String>());
        return Err(friendly_error(service, status, &body));
    }
    resp.bytes().map(|b| b.to_vec()).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn moods_map_to_directions() {
        assert_eq!(orpheus_direction(Some("sympathetic")), "gentle");
        assert_eq!(orpheus_direction(None), "friendly");
        assert!(openai_instructions(Some("excited")).contains("excited"));
    }
}
