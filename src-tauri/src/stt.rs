//! Sharper ears: your words, worked out by a cloud model you already have a
//! free key for — Groq's Whisper (large) if there's a Groq key, else Gemini.
//!
//! The on-device model is quick but small: it turned "play Bundle by Bundle
//! by Burna Boy" into "play bonto by bonto", and writes down the lyrics of
//! whatever music is playing. A big model gets names right, and Gemini can
//! be told to leave the music out. The on-device model still runs alongside
//! (speechInput.ts) and is used whenever this is slow, offline or has no key.

use std::time::Duration;

use anyhow::{anyhow, Result};
use serde_json::{json, Value};

use crate::settings::ProviderId;

const GEMINI_ASK: &str = "Transcribe what the person says to their computer assistant in this recording, \
word for word, in the language they speak. They may name songs, artists, apps, websites or people — \
spell those the way they're normally written (for example \"Burna Boy\", \"YouTube\", \"Blackboard\"). \
Leave out background music, singing, TV, other people and noise: only the words spoken to the assistant. \
If nobody speaks to the assistant, reply with nothing at all. Reply with the words only — no quotes, no notes.";

/// A hint for Whisper: the kind of words it's likely to hear.
const WHISPER_HINT: &str = "Hey Nova, open YouTube and play Burna Boy. Open Chrome, Blackboard, Spotify, Notepad.";

fn client() -> Result<reqwest::blocking::Client> {
    Ok(reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(8))
        .connect_timeout(Duration::from_secs(3))
        .build()?)
}

/// The words in a 16 kHz WAV clip. Errors when no cloud ears are set up
/// (no key) or they didn't answer — the caller keeps the on-device words.
pub fn transcribe(wav: Vec<u8>) -> Result<String> {
    let settings = crate::state::store().settings();
    let started = std::time::Instant::now();
    let groq = settings.groq_api_key.trim().to_string();
    let text = if !groq.is_empty() {
        groq_whisper(&groq, wav)?
    } else if let Some(g) = settings.provider(ProviderId::Gemini).filter(|g| !g.api_key.trim().is_empty()) {
        gemini(g.base_url.trim_end_matches('/'), g.api_key.trim(), &wav)?
    } else {
        return Err(anyhow!("no cloud ears"));
    };
    let text = text.split_whitespace().collect::<Vec<_>>().join(" ");
    // Whisper's words for silence and noise.
    let text = if text.trim_matches(|c: char| !c.is_alphanumeric()).is_empty()
        || matches!(text.to_lowercase().trim_matches('.'), "you" | "thank you" | "thanks for watching")
    {
        String::new()
    } else {
        text
    };
    eprintln!("[stt] cloud heard in {} ms: \"{}\"", started.elapsed().as_millis(), text.chars().take(80).collect::<String>());
    Ok(text)
}

fn groq_whisper(key: &str, wav: Vec<u8>) -> Result<String> {
    use reqwest::blocking::multipart::{Form, Part};
    let form = Form::new()
        .text("model", "whisper-large-v3-turbo")
        .text("response_format", "json")
        .text("temperature", "0")
        .text("prompt", WHISPER_HINT)
        .part("file", Part::bytes(wav).file_name("speech.wav").mime_str("audio/wav")?);
    let res = client()?
        .post("https://api.groq.com/openai/v1/audio/transcriptions")
        .bearer_auth(key)
        .multipart(form)
        .send()?;
    let status = res.status();
    let value: Value = res.json()?;
    if !status.is_success() {
        return Err(anyhow!("Groq answered {status}"));
    }
    Ok(value["text"].as_str().unwrap_or_default().to_string())
}

fn gemini(base: &str, key: &str, wav: &[u8]) -> Result<String> {
    use base64::Engine;
    let base = if base.is_empty() { "https://generativelanguage.googleapis.com" } else { base };
    // The light model: quick, and its own free allowance (the screen work
    // uses the main one).
    let url = format!("{base}/v1beta/models/gemini-2.5-flash-lite:generateContent");
    let body = json!({
        "contents": [{
            "role": "user",
            "parts": [
                { "text": GEMINI_ASK },
                { "inline_data": { "mime_type": "audio/wav", "data": base64::engine::general_purpose::STANDARD.encode(wav) } }
            ]
        }],
        "generationConfig": { "temperature": 0, "maxOutputTokens": 200, "thinkingConfig": { "thinkingBudget": 0 } }
    });
    let res = client()?.post(url).header("x-goog-api-key", key).json(&body).send()?;
    let status = res.status();
    let value: Value = res.json()?;
    if !status.is_success() {
        return Err(anyhow!("Gemini answered {status}"));
    }
    Ok(value["candidates"][0]["content"]["parts"][0]["text"].as_str().unwrap_or_default().trim().to_string())
}
