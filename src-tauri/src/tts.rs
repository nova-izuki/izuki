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
//! - **edge** — Microsoft's free neural voices (voices.rs): no key, many
//!   accents and languages. The default.
//!
//! All of them follow the character the user picked (voices.rs): its
//! voice, its accent, its pace.
//!
//! Keys never leave Rust; the webview only ever gets the audio back.

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

/// How a mood nudges the natural voice: (rate %, pitch Hz).
fn edge_mood(mood: Option<&str>) -> (i32, i32) {
    match mood {
        Some("cheerful") => (4, 2),
        Some("excited") => (10, 4),
        Some("playful") => (5, 3),
        Some("curious") => (2, 2),
        Some("calm") => (-6, -2),
        Some("serious") => (-3, -1),
        Some("sympathetic") => (-8, -2),
        _ => (0, 0),
    }
}

fn openai_instructions(settings: &Settings, mood: Option<&str>) -> String {
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
    let a = crate::voices::active(settings);
    let who = if a.persona.id == "nova" {
        String::new()
    } else {
        format!(" Your voice: {} ({}).", a.persona.blurb, a.persona.lang)
    };
    format!(
        "You are Izuki, the user's close friend and computer companion. Speak {feeling}.{who} \
         Sound like a real person in a casual conversation: natural rhythm, a small pause at \
         every comma and full stop, a lift on questions — never like an announcer or a robot."
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
    // Groq's Orpheus voice has terms to accept once, on their site — until
    // then every request is refused, however good the key.
    if body.contains("terms") && service == "Groq" {
        return "Groq needs you to accept the Orpheus voice's terms once: open \
                console.groq.com/playground?model=canopylabs%2Forpheus-v1-english, sign in, \
                accept, then try again"
            .into();
    }
    let said = serde_json::from_str::<serde_json::Value>(body)
        .ok()
        .and_then(|v| v["error"]["message"].as_str().map(|m| m.chars().take(160).collect::<String>()));
    match status.as_u16() {
        401 | 403 => format!("{service} rejected the key — check it in Talk to Izuki"),
        402 => format!("{service} needs credits on the account"),
        429 if body.contains("credit") || body.contains("quota") => {
            format!("{service} has no credits left on this account")
        }
        429 => format!("{service} voice limit reached for now"),
        _ => match said {
            Some(m) => format!("{service} voice failed: {m}"),
            None => format!("{service} voice failed (HTTP {status})"),
        },
    }
}

/// One line of speech as WAV bytes.
pub fn synthesize(settings: &Settings, engine: &str, text: &str, mood: Option<&str>) -> Result<Vec<u8>, String> {
    let text = text.trim();
    if text.is_empty() {
        return Err("nothing to say".into());
    }
    if engine == "edge" {
        let a = crate::voices::active(settings);
        let (dr, dp) = edge_mood(mood);
        return crate::voices::synthesize(text, &a.voice, a.rate + dr, a.pitch + dp);
    }
    let c = client()?;
    let persona = crate::voices::active(settings).persona;
    let chosen = settings.cloud_voice.trim();

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
                    "voice": if ORPHEUS_VOICES.contains(&chosen) { chosen } else { persona.orpheus },
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
                    "voice": if OPENAI_VOICES.contains(&chosen) { chosen } else { persona.openai },
                    "instructions": openai_instructions(settings, mood),
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
        let mut s = Settings::default();
        assert!(openai_instructions(&s, Some("excited")).contains("excited"));
        s.persona = "ezinne".into();
        assert!(openai_instructions(&s, None).contains("Nigerian"));
        assert_eq!(edge_mood(Some("calm")), (-6, -2));
        assert!(friendly_error("Groq", reqwest::StatusCode::BAD_REQUEST, r#"{"error":{"message":"The model requires terms acceptance","code":"model_terms_required"}}"#).contains("accept"));
        assert!(friendly_error("OpenAI", reqwest::StatusCode::BAD_REQUEST, r#"{"error":{"message":"Invalid voice"}}"#).contains("Invalid voice"));
    }
}

/// A reply as spoken audio for another device — the "Call Izuki" page on a
/// phone, where the browser's own voice is muted by the iPhone's silent
/// switch but a plain audio file isn't. The chosen voice, else the free
/// natural one, else Windows' own (offline, instant). Returns the bytes and
/// their type.
pub fn speak_audio(settings: &Settings, text: &str) -> Result<(Vec<u8>, &'static str), String> {
    let engine = settings.voice_engine.as_str();
    if matches!(engine, "orpheus" | "openai") {
        match synthesize(settings, engine, text, None) {
            Ok(wav) => return Ok((wav, "audio/wav")),
            Err(e) => eprintln!("[tts] {engine} for the call: {e} — trying the natural voice"),
        }
    }
    match synthesize(settings, "edge", text, None) {
        Ok(mp3) => return Ok((mp3, "audio/mpeg")),
        Err(e) => eprintln!("[tts] natural voice for the call: {e} — using the Windows voice"),
    }
    windows_voice(text).map(|wav| (wav, "audio/wav"))
}

pub const ORPHEUS_VOICES: &[&str] = &["hannah", "autumn", "diana", "austin", "daniel", "troy"];
pub const OPENAI_VOICES: &[&str] = &["marin", "cedar", "coral", "sage", "ash", "verse", "alloy", "ballad", "echo", "fable", "nova", "onyx", "shimmer"];

/// Windows' built-in text-to-speech, as WAV bytes.
#[cfg(windows)]
pub fn windows_voice(text: &str) -> Result<Vec<u8>, String> {
    use windows::Media::SpeechSynthesis::SpeechSynthesizer;
    use windows::Storage::Streams::DataReader;
    use windows::Win32::System::Com::{CoInitializeEx, COINIT_MULTITHREADED};
    let text = text.trim();
    if text.is_empty() {
        return Err("nothing to say".into());
    }
    let go = || -> windows_core::Result<Vec<u8>> {
        unsafe {
            let _ = CoInitializeEx(None, COINIT_MULTITHREADED);
        }
        let synth = SpeechSynthesizer::new()?;
        let stream = crate::ocr::wait(synth.SynthesizeTextToStreamAsync(&windows_core::HSTRING::from(text))?)?;
        let size = stream.Size()? as u32;
        let reader = DataReader::CreateDataReader(&stream.GetInputStreamAt(0)?)?;
        crate::ocr::wait(reader.LoadAsync(size)?)?;
        let mut buf = vec![0u8; size as usize];
        reader.ReadBytes(&mut buf)?;
        Ok(buf)
    };
    go().map_err(|e| format!("Windows voice: {e}"))
}

#[cfg(not(windows))]
pub fn windows_voice(_text: &str) -> Result<Vec<u8>, String> {
    Err("no system voice here".into())
}
