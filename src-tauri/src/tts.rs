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
//! - **gemini** — Google's Gemini speech, steered in plain words (accent,
//!   feeling) like the ChatGPT voice, and free with the same Gemini key as
//!   the brain (a daily allowance; past it, the natural voice takes over).
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

/// The accent a character's language tag stands for (for the ChatGPT voice,
/// which does accents well when asked).
fn accent_of(lang: &str) -> Option<&'static str> {
    Some(match lang {
        "en-NG" => "Nigerian (Lagos)",
        "en-GB" => "British (London)",
        "en-IE" => "Irish (Dublin)",
        "en-AU" => "Australian",
        "en-IN" => "Indian",
        "en-KE" => "Kenyan",
        "en-ZA" => "South African",
        "es-MX" => "Mexican Spanish",
        "es-ES" => "Castilian Spanish",
        _ => return None,
    })
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
    let accent = accent_of(a.persona.lang);
    let who = if a.persona.id == "nova" {
        String::new()
    } else if a.persona.id == "chidi" || a.persona.id == "amaka" {
        " Speak with a strong, authentic Nigerian accent, straight from Lagos — the real rhythm, melody and \
         bounce of Nigerian Pidgin, like a Nigerian friend talking, never like a British or American reading it."
            .to_string()
    } else if let Some(accent) = accent {
        format!(" Your voice: {}. Speak with a strong, natural, authentic {accent} accent all the way through.", a.persona.blurb)
    } else {
        format!(" Your voice: {} ({}).", a.persona.blurb, a.persona.lang)
    };
    format!(
        "You are Izuki, the user's close friend and computer companion. Speak {feeling}.{who} \
         Sound like a real person in a casual conversation: natural rhythm, a small pause at \
         every comma and full stop, a lift on questions — never like an announcer or a robot."
    )
}

/// How the Gemini voice is told to say a line: the feeling and the
/// character's accent in a few words, before the line itself.
fn gemini_direction(settings: &Settings, mood: Option<&str>) -> String {
    let feeling = match mood {
        Some("cheerful") => "cheerfully, smiling",
        Some("excited") => "with real excitement",
        Some("calm") => "calmly and reassuringly",
        Some("serious") => "seriously but kindly",
        Some("sympathetic") => "gently, with care",
        Some("playful") => "playfully, a little teasing",
        Some("curious") => "with curiosity",
        _ => "warmly, like a close friend",
    };
    let a = crate::voices::active(settings);
    let accent = if a.persona.id == "chidi" || a.persona.id == "amaka" {
        " in a strong Nigerian accent, with the rhythm and bounce of Lagos Pidgin".to_string()
    } else {
        accent_of(a.persona.lang).map(|x| format!(" in a strong, authentic {x} accent")).unwrap_or_default()
    };
    format!("Say {feeling}{accent}, in a natural conversational rhythm")
}

/// A Gemini voice for the character: its chosen one, else the closest to
/// its ChatGPT voice.
fn gemini_voice(chosen: &str, openai: &str) -> &'static str {
    if let Some(v) = GEMINI_VOICES.iter().find(|v| v.eq_ignore_ascii_case(chosen)) {
        return v;
    }
    match openai {
        "ash" => "Algieba",
        "cedar" => "Charon",
        "marin" => "Aoede",
        "sage" => "Vindemiatrix",
        _ => "Sulafat",
    }
}

/// Gemini's speech models, newest guess first; the one that answers is
/// remembered (a retired name just answers 404).
const GEMINI_TTS_MODELS: &[&str] = &[
    "gemini-2.5-flash-preview-tts",
    "gemini-2.5-flash-tts",
    "gemini-3.1-flash-tts-preview",
    "gemini-3.8-flash-tts",
    "gemini-3.8-flash-lite-tts",
];

/// Only the 2.5 speech models act on a spoken direction ("Say warmly, in a
/// Nigerian accent: …"). Newer ones read it out loud word for word (checked
/// on 3.8), and refuse a separate style instruction — they get just the
/// words, and the chosen voice carries the character.
fn takes_direction(model: &str) -> bool {
    model.starts_with("gemini-2.5")
}
static GEMINI_TTS_MODEL: parking_lot::Mutex<Option<&'static str>> = parking_lot::Mutex::new(None);

/// Gemini returns bare 16-bit PCM (24 kHz, mono): put a WAV header on it.
fn pcm_to_wav(pcm: &[u8], rate: u32) -> Vec<u8> {
    let mut w = Vec::with_capacity(44 + pcm.len());
    let len = pcm.len() as u32;
    w.extend_from_slice(b"RIFF");
    w.extend_from_slice(&(36 + len).to_le_bytes());
    w.extend_from_slice(b"WAVEfmt ");
    w.extend_from_slice(&16u32.to_le_bytes());
    w.extend_from_slice(&1u16.to_le_bytes()); // PCM
    w.extend_from_slice(&1u16.to_le_bytes()); // mono
    w.extend_from_slice(&rate.to_le_bytes());
    w.extend_from_slice(&(rate * 2).to_le_bytes());
    w.extend_from_slice(&2u16.to_le_bytes());
    w.extend_from_slice(&16u16.to_le_bytes());
    w.extend_from_slice(b"data");
    w.extend_from_slice(&len.to_le_bytes());
    w.extend_from_slice(pcm);
    w
}

fn gemini_speak(settings: &Settings, c: &reqwest::blocking::Client, text: &str, mood: Option<&str>) -> Result<Vec<u8>, String> {
    let cfg = settings.provider(ProviderId::Gemini).ok_or("Gemini isn't set up")?;
    let key = cfg.api_key.trim();
    if key.is_empty() {
        return Err("add your free Gemini key to use the Gemini voice".into());
    }
    let persona = crate::voices::active(settings).persona;
    let directed = format!("{}: {text}", gemini_direction(settings, mood));
    let mut body = json!({
        "contents": [{ "parts": [{ "text": directed }] }],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": { "voiceConfig": { "prebuiltVoiceConfig": {
                "voiceName": gemini_voice(settings.cloud_voice.trim(), persona.openai)
            } } }
        }
    });
    let known = *GEMINI_TTS_MODEL.lock();
    // The one that worked last time first, then the rest: each model has its
    // own small free daily allowance (10 requests), so when one is used up
    // the next still speaks.
    let mut models: Vec<&'static str> = known.into_iter().collect();
    models.extend(GEMINI_TTS_MODELS.iter().filter(|m| Some(**m) != known));
    let mut last = String::from("Gemini voice failed");
    for model in models {
        body["contents"][0]["parts"][0]["text"] = json!(if takes_direction(model) { directed.as_str() } else { text });
        let resp = c
            .post(format!("https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"))
            .header("x-goog-api-key", key)
            .json(&body)
            .send()
            .map_err(|e| format!("couldn't reach the voice service ({e})"))?;
        let status = resp.status();
        let text = resp.text().unwrap_or_default();
        // Retired for this account ("no longer available to new users") or
        // not there at all: the next name.
        let gone = text.to_lowercase();
        if status.as_u16() == 404
            || (status.as_u16() == 400 && (gone.contains("no longer available") || gone.contains("not found") || gone.contains("not supported")))
        {
            last = format!("Gemini has no voice model called {model}");
            continue;
        }
        if status.as_u16() == 429 {
            eprintln!("[tts] {model} is used up for now — trying the next Gemini voice model");
            last = friendly_error("Gemini", status, &text);
            continue;
        }
        if !status.is_success() {
            eprintln!("[tts] gemini HTTP {status}: {}", text.chars().take(200).collect::<String>());
            return Err(friendly_error("Gemini", status, &text));
        }
        let v: serde_json::Value = serde_json::from_str(&text).map_err(|e| format!("Gemini voice: {e}"))?;
        let part = &v["candidates"][0]["content"]["parts"][0]["inlineData"];
        let Some(data) = part["data"].as_str() else {
            return Err("Gemini sent no audio back — try again".into());
        };
        use base64::Engine as _;
        let pcm = base64::engine::general_purpose::STANDARD.decode(data).map_err(|e| format!("Gemini voice: {e}"))?;
        let rate = part["mimeType"]
            .as_str()
            .and_then(|m| m.split("rate=").nth(1))
            .and_then(|r| r.trim_end_matches(|c: char| !c.is_ascii_digit()).parse().ok())
            .unwrap_or(24_000);
        *GEMINI_TTS_MODEL.lock() = Some(model);
        // Newer speech models send a finished WAV; older ones bare PCM.
        if pcm.starts_with(b"RIFF") || part["mimeType"].as_str().is_some_and(|m| m.contains("wav")) {
            return Ok(pcm);
        }
        return Ok(pcm_to_wav(&pcm, rate));
    }
    Err(last)
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
    // Out of credits — ElevenLabs says so with a 401, which made it look like
    // a bad key. It isn't: the month's free credits are used up.
    let lower = body.to_lowercase();
    if lower.contains("quota_exceeded") || lower.contains("credits remaining") || lower.contains("exceeds your quota") {
        return format!("{service} has used up this month's free credits — it'll work again when they renew. Using the free voice until then");
    }
    match status.as_u16() {
        401 | 403 => format!("{service} rejected the key — check it in Talk to Izuki"),
        402 => format!("{service} needs credits on the account"),
        429 if service == "Gemini" => "the free Gemini voice has used today's allowance".into(),
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

/// ElevenLabs out of credits: left alone until then.
static ELEVEN_RESTING_UNTIL: parking_lot::Mutex<Option<std::time::Instant>> = parking_lot::Mutex::new(None);

/// ElevenLabs' ready-made voices (free on every plan).
pub const ELEVEN_VOICES: &[(&str, &str)] = &[
    ("cgSgspJ2msm6clMCkdW9", "Jessica"),
    ("Xb7hH8MSUJpSbSDYk0k2", "Alice"),
    ("pFZP5JQG7iQjIQuC4Bku", "Lily"),
    ("XrExE9yKIg1WjnnlVkGX", "Matilda"),
    ("nPczCjzI2devNBz1zQrb", "Brian"),
    ("JBFqnCBsd6RMkjVDRZzb", "George"),
    ("onwK4e9ZLuTAKqWW03F9", "Daniel"),
    ("TX3LPaxmHKxFdv7VOQHJ", "Liam"),
];

/// The character's ElevenLabs voice: a deeper male one for the male
/// characters (their ChatGPT voice says which), a warm female one otherwise.
fn eleven_voice(chosen: &str, openai: &str) -> &'static str {
    if let Some((id, _)) = ELEVEN_VOICES.iter().find(|(id, _)| *id == chosen) {
        return id;
    }
    if matches!(openai, "cedar" | "ash" | "verse" | "echo" | "onyx" | "ballad") {
        "nPczCjzI2devNBz1zQrb" // Brian — deep, calm
    } else {
        "cgSgspJ2msm6clMCkdW9" // Jessica — warm
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
    if engine == "gemini" {
        return gemini_speak(settings, &c, text, mood);
    }
    if engine == "azure" {
        // Microsoft's official, free route to the very voices "Natural" uses —
        // the character's voice, speed and pitch, all the same.
        let key = settings.azure_speech_key.trim();
        if key.is_empty() {
            return Err("add your free Azure Speech key to use the Azure voice".into());
        }
        let a = crate::voices::active(settings);
        let (dr, dp) = edge_mood(mood);
        let region = settings.azure_speech_region.trim();
        let resp = c
            .post(format!("https://{region}.tts.speech.microsoft.com/cognitiveservices/v1"))
            .header("Ocp-Apim-Subscription-Key", key)
            .header("Content-Type", "application/ssml+xml")
            .header("X-Microsoft-OutputFormat", "riff-24khz-16bit-mono-pcm")
            .header("User-Agent", "Izuki")
            .body(crate::voices::azure_ssml(text, &a.voice, a.rate + dr, a.pitch + dp))
            .send()
            .map_err(|e| format!("couldn't reach Azure Speech in \"{region}\" — check the region ({e})"))?;
        let status = resp.status();
        if !status.is_success() {
            let body = resp.text().unwrap_or_default();
            eprintln!("[tts] azure HTTP {status}: {}", body.chars().take(200).collect::<String>());
            return Err(if status.as_u16() == 401 {
                "Azure didn't accept that key — copy Key 1 again, and check the region matches your resource".into()
            } else {
                friendly_error("Azure Speech", status, &body)
            });
        }
        return resp.bytes().map(|b| b.to_vec()).map_err(|e| e.to_string());
    }
    if engine == "elevenlabs" {
        let key = settings.elevenlabs_key.trim();
        if key.is_empty() {
            return Err("add your free ElevenLabs key to use the ElevenLabs voice".into());
        }
        // Out of credits: don't ask again on every line for the next hour —
        // each failed try delayed the voice before the free one took over.
        if ELEVEN_RESTING_UNTIL.lock().is_some_and(|t| std::time::Instant::now() < t) {
            return Err("ElevenLabs has used up this month's free credits — using the free voice".into());
        }
        let persona = crate::voices::active(settings).persona;
        // A pasted voice ID (any voice from ElevenLabs' library — e.g. a strong
        // Nigerian one) is used as-is; otherwise the character's default.
        let chosen = settings.cloud_voice.trim();
        let voice: &str = if !chosen.is_empty() { chosen } else { eleven_voice("", persona.openai) };
        let resp = c
            .post(format!("https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=pcm_24000"))
            .header("xi-api-key", key)
            .json(&json!({ "text": text, "model_id": "eleven_flash_v2_5" }))
            .send()
            .map_err(|e| format!("couldn't reach ElevenLabs ({e})"))?;
        let status = resp.status();
        if !status.is_success() {
            let body = resp.text().unwrap_or_default();
            eprintln!("[tts] elevenlabs HTTP {status}: {}", body.chars().take(200).collect::<String>());
            let lower = body.to_lowercase();
            if lower.contains("quota_exceeded") || lower.contains("credits remaining") || status.as_u16() == 402 {
                *ELEVEN_RESTING_UNTIL.lock() = Some(std::time::Instant::now() + std::time::Duration::from_secs(3600));
                eprintln!("[tts] elevenlabs is out of credits — resting it for an hour");
            }
            return Err(friendly_error("ElevenLabs", status, &body));
        }
        let pcm = resp.bytes().map_err(|e| e.to_string())?;
        return Ok(pcm_to_wav(&pcm, 24_000));
    }
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
        assert!(openai_instructions(&s, None).contains("strong, natural, authentic Nigerian"));
        s.persona = "chidi".into();
        assert!(openai_instructions(&s, None).contains("Pidgin"));
        assert_eq!(edge_mood(Some("calm")), (-6, -2));
        assert!(friendly_error("Groq", reqwest::StatusCode::BAD_REQUEST, r#"{"error":{"message":"The model requires terms acceptance","code":"model_terms_required"}}"#).contains("accept"));
        assert!(friendly_error("OpenAI", reqwest::StatusCode::BAD_REQUEST, r#"{"error":{"message":"Invalid voice"}}"#).contains("Invalid voice"));
    }

    #[test]
    fn gemini_voice_is_steered_and_wrapped() {
        let mut s = Settings::default();
        s.persona = "chidi".into();
        let d = gemini_direction(&s, Some("excited"));
        assert!(d.contains("excitement") && d.contains("Pidgin"), "{d}");
        assert_eq!(gemini_voice("charon", "coral"), "Charon");
        assert_eq!(gemini_voice("", "cedar"), "Charon");
        assert_eq!(gemini_voice("nope", "coral"), "Sulafat");
        let wav = pcm_to_wav(&[0u8; 480], 24_000);
        assert_eq!(&wav[..4], b"RIFF");
        assert_eq!(&wav[8..16], b"WAVEfmt ");
        assert_eq!(u32::from_le_bytes(wav[24..28].try_into().unwrap()), 24_000);
        assert_eq!(wav.len(), 44 + 480);
        assert!(friendly_error("Gemini", reqwest::StatusCode::TOO_MANY_REQUESTS, "{}").contains("today's allowance"));
    }
}

/// A reply as spoken audio for another device — the "Call Izuki" page on a
/// phone, where the browser's own voice is muted by the iPhone's silent
/// switch but a plain audio file isn't. The chosen voice, else the free
/// natural one, else Windows' own (offline, instant). Returns the bytes and
/// their type.
pub fn speak_audio(settings: &Settings, text: &str) -> Result<(Vec<u8>, &'static str), String> {
    let engine = settings.voice_engine.as_str();
    if matches!(engine, "orpheus" | "openai" | "gemini" | "azure" | "elevenlabs") {
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
pub const GEMINI_VOICES: &[&str] = &[
    "Charon", "Algieba", "Orus", "Iapetus", "Umbriel", "Achird", "Sadaltager", "Puck",
    "Sulafat", "Aoede", "Kore", "Vindemiatrix", "Despina", "Leda", "Zephyr", "Gacrux",
];
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
