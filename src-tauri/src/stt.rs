//! Sharper ears: your words, worked out by a big cloud model you already have
//! a key for — Groq's Whisper (large) if there's a Groq key, else Gemini.
//!
//! The on-device model is quick but small: it turned "play Bundle by Bundle
//! by Burna Boy" into "play bonto by bonto", and writes down the lyrics of
//! whatever music is playing. A big model gets names right, and Gemini can
//! be told to leave the music out. The on-device words are still used
//! whenever this is slow, offline or has no key (speechInput.ts).

use std::time::Duration;

use anyhow::{anyhow, Result};
use serde_json::{json, Value};

use crate::settings::{ProviderId, Settings};

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

/// Whether there's a key for cloud ears at all (Groq or Gemini).
pub fn has_key(settings: &Settings) -> bool {
    !settings.groq_api_key.trim().is_empty()
        || settings.provider(ProviderId::Gemini).is_some_and(|g| !g.api_key.trim().is_empty())
}

/// Whether the PC's listening should use them (a key, and switched on).
pub fn available(settings: &Settings) -> bool {
    settings.cloud_ears && has_key(settings)
}

/// The words in a 16 kHz WAV clip. Errors when no cloud ears are set up or
/// they didn't answer — the caller keeps the on-device words.
pub fn transcribe(settings: &Settings, wav: Vec<u8>) -> Result<String> {
    if !available(settings) {
        return Err(anyhow!("no cloud ears"));
    }
    transcribe_clip(settings, wav, "audio/wav", "speech.wav")
}

/// The words in any audio clip — a phone voice note is `audio/ogg`.
pub fn transcribe_clip(settings: &Settings, audio: Vec<u8>, mime: &str, file_name: &str) -> Result<String> {
    if !has_key(settings) {
        return Err(anyhow!("no cloud ears"));
    }
    let wav = audio;
    let started = std::time::Instant::now();
    let groq = settings.groq_api_key.trim();
    let gemini_cfg = settings.provider(ProviderId::Gemini).filter(|g| !g.api_key.trim().is_empty());
    let text = match (groq.is_empty(), gemini_cfg) {
        // Whisper first (fast, great with names); Gemini if Groq is down.
        (false, g) => match groq_whisper(groq, wav.clone(), mime, file_name) {
            Ok(t) => t,
            Err(e) => match g {
                Some(g) => {
                    eprintln!("[stt] {e} — asking Gemini");
                    gemini(&g.base_url, g.api_key.trim(), &wav, mime)?
                }
                None => return Err(e),
            },
        },
        (true, Some(g)) => gemini(&g.base_url, g.api_key.trim(), &wav, mime)?,
        (true, None) => return Err(anyhow!("no cloud ears")),
    };
    let text = clean(&text);
    eprintln!(
        "[stt] cloud heard in {} ms: \"{}\"",
        started.elapsed().as_millis(),
        text.chars().take(80).collect::<String>()
    );
    Ok(text)
}

/// One line, and nothing for the stock phrases speech models write for
/// silence and noise.
fn clean(text: &str) -> String {
    let text = text.split_whitespace().collect::<Vec<_>>().join(" ");
    let text = text.trim_matches('"').trim().to_string();
    let bare = text.to_lowercase();
    let bare = bare.trim_matches(|c: char| !c.is_alphanumeric());
    let filler = bare.is_empty()
        || matches!(bare, "you" | "thank you" | "thanks for watching" | "music" | "silence" | "no speech")
        || (text.starts_with('[') && text.ends_with(']'))
        || (text.starts_with('(') && text.ends_with(')'));
    if filler {
        String::new()
    } else {
        text
    }
}

fn groq_whisper(key: &str, wav: Vec<u8>, mime: &str, file_name: &str) -> Result<String> {
    use reqwest::blocking::multipart::{Form, Part};
    let form = Form::new()
        .text("model", "whisper-large-v3-turbo")
        .text("response_format", "json")
        .text("temperature", "0")
        .text("prompt", WHISPER_HINT)
        .part("file", Part::bytes(wav).file_name(file_name.to_string()).mime_str(mime)?);
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

fn gemini(base: &str, key: &str, wav: &[u8], mime: &str) -> Result<String> {
    use base64::Engine;
    let base = base.trim().trim_end_matches('/');
    let base = if base.is_empty() { "https://generativelanguage.googleapis.com" } else { base };
    // The light model: quick, and its own free allowance (the screen work
    // uses the main one).
    let model = crate::vision::GEMINI_LITE;
    let url = format!("{base}/v1beta/models/{model}:generateContent");
    let knob = crate::vision::gemini_no_think(model);
    let mut body = json!({
        "contents": [{
            "role": "user",
            "parts": [
                { "text": GEMINI_ASK },
                { "inline_data": { "mime_type": mime, "data": base64::engine::general_purpose::STANDARD.encode(wav) } }
            ]
        }],
        "generationConfig": { "temperature": 0, "maxOutputTokens": 200 }
    });
    if let Some(config) = knob.thinking_config() {
        body["generationConfig"]["thinkingConfig"] = config;
    }
    let res = client()?.post(url).header("x-goog-api-key", key).json(&body).send()?;
    let status = res.status();
    let value: Value = res.json()?;
    if status.as_u16() == 400 && knob != crate::vision::NoThink::Neither {
        crate::vision::gemini_refused_no_think(model, knob);
        return gemini(base, key, wav, mime);
    }
    if !status.is_success() {
        return Err(anyhow!("Gemini answered {status}"));
    }
    Ok(value["candidates"][0]["content"]["parts"][0]["text"]
        .as_str()
        .unwrap_or_default()
        .trim()
        .to_string())
}

#[cfg(test)]
mod tests {
    use super::clean;

    #[test]
    fn filler_is_dropped() {
        assert_eq!(clean("[Music]"), "");
        assert_eq!(clean("  Thank you. "), "");
        assert_eq!(clean("(background noise)"), "");
        assert_eq!(clean("..."), "");
    }

    /// A real clip through the real cloud ears, with the key in this PC's
    /// Izuki settings: `IZUKI_STT_CLIP=path\to.wav cargo test stt -- --ignored`.
    /// One free Gemini (or Groq) call.
    #[test]
    #[ignore]
    fn hears_a_real_clip() {
        let clip = std::env::var("IZUKI_STT_CLIP").expect("set IZUKI_STT_CLIP to a 16 kHz WAV");
        let path = dirs::config_dir().unwrap().join("Izuki").join("settings.json");
        let settings: crate::settings::Settings =
            serde_json::from_str(&std::fs::read_to_string(path).unwrap()).unwrap();
        let text = super::transcribe_clip(&settings, std::fs::read(clip).unwrap(), "audio/wav", "speech.wav").unwrap();
        eprintln!("heard: {text}");
        assert!(text.to_lowercase().contains("burna boy"), "heard: {text}");
    }

    #[test]
    fn real_words_are_kept() {
        assert_eq!(clean("  play Bundle by Bundle\nby Burna Boy "), "play Bundle by Bundle by Burna Boy");
        assert_eq!(clean("\"open YouTube\""), "open YouTube");
    }
}
