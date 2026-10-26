//! Writing down a Zoom call, an online class or any video — from what the PC
//! itself plays, not the microphone.
//!
//! Lecture Mode records the room through the mic, which is right for a
//! lecture you're sitting in. It's useless for a call you're wearing
//! headphones in: the mic hears you, not them. This takes the speakers' own
//! sound instead (Windows' loopback capture — the same one FL Studio's beat
//! listening uses), in pieces, and hands each piece to Lecture Mode, so the
//! transcript, the timings and the study notes at the end are all the same.
//!
//! Nothing is saved as audio. Each piece is written down and the sound is
//! dropped; only the words are kept.
//!
//! It records what your computer plays, which may include other people's
//! voices. Whether you may record a call is yours to know — Izuki asks for
//! the title and starts only when you say so, and shows that it's recording
//! the whole time.

use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};

use anyhow::Result;

/// A piece of sound, written down while the next is recorded.
const PIECE_SECS: f32 = 120.0;
/// Recorded in chunks this long, so "stop" is noticed within one of them
/// rather than at the end of a whole piece — and whatever was said in the
/// last few seconds is still written down instead of thrown away.
const CHUNK_SECS: f32 = 15.0;

static RECORDING: AtomicBool = AtomicBool::new(false);
static PIECES: AtomicU32 = AtomicU32::new(0);
/// The recording thread is still running (it may owe one last piece).
static RECORDING_THREAD: AtomicBool = AtomicBool::new(false);
/// The lecture this recording is filling, so "stop" finds it.
static LIVE_ID: parking_lot::Mutex<Option<String>> = parking_lot::Mutex::new(None);

/// What's being recorded right now, if anything.
pub fn live_id() -> Option<String> {
    LIVE_ID.lock().clone()
}

pub fn is_recording() -> bool {
    RECORDING.load(Ordering::Relaxed)
}

/// 16-bit mono WAV — what the speech services expect, and a quarter the size
/// of the floats the capture gives back.
fn wav_of(samples: &[f32], rate: u32) -> Vec<u8> {
    let mut data = Vec::with_capacity(samples.len() * 2);
    for s in samples {
        data.extend(((s.clamp(-1.0, 1.0) * 32767.0) as i16).to_le_bytes());
    }
    let mut d = Vec::with_capacity(data.len() + 44);
    d.extend(b"RIFF");
    d.extend((36 + data.len() as u32).to_le_bytes());
    d.extend(b"WAVEfmt ");
    d.extend(16u32.to_le_bytes());
    d.extend(1u16.to_le_bytes()); // PCM
    d.extend(1u16.to_le_bytes()); // mono
    d.extend(rate.to_le_bytes());
    d.extend((rate * 2).to_le_bytes());
    d.extend(2u16.to_le_bytes());
    d.extend(16u16.to_le_bytes());
    d.extend(b"data");
    d.extend((data.len() as u32).to_le_bytes());
    d.extend(data);
    d
}

/// Loud enough that somebody was talking. A muted call or a paused video is
/// silence, and sending silence to be written down wastes the free
/// allowance and invites made-up words.
fn has_sound(samples: &[f32]) -> bool {
    if samples.is_empty() {
        return false;
    }
    let sum: f64 = samples.iter().map(|s| f64::from(*s) * f64::from(*s)).sum();
    (sum / samples.len() as f64).sqrt() > 0.004
}

/// Start writing down whatever the PC plays. Returns the lecture's id, so it
/// finishes and turns into notes exactly like a recorded lecture.
pub fn start(title: &str) -> Result<String> {
    if is_recording() {
        anyhow::bail!("I'm already writing down what your PC is playing — say “stop recording” first.");
    }
    // The last recording may still be handing over its final piece.
    if RECORDING_THREAD.load(Ordering::Relaxed) {
        anyhow::bail!("I'm just finishing the last recording — give me a few seconds and ask again.");
    }
    let id = crate::lecture::start(title)?;
    RECORDING.store(true, Ordering::Relaxed);
    PIECES.store(0, Ordering::Relaxed);
    *LIVE_ID.lock() = Some(id.clone());
    RECORDING_THREAD.store(true, Ordering::Relaxed);
    let for_thread = id.clone();
    std::thread::Builder::new()
        .name("izuki-roomrec".into())
        .spawn(move || {
            let mut index = 0u32;
            // The capture or the writing-down broke: let the lecture go
            // rather than leave it open with nothing ever arriving.
            let mut broke = false;
            let mut held: Vec<f32> = Vec::new();
            let mut rate = 16_000u32;
            let mut held_secs = 0.0f32;
            let mut began = 0.0f32;
            // Send what's been gathered, if anyone was talking in it.
            let mut send = |samples: &mut Vec<f32>, rate: u32, at: f32, index: &mut u32| {
                let gathered = std::mem::take(samples);
                if !has_sound(&gathered) {
                    return true;
                }
                let wav = wav_of(&gathered, rate);
                match crate::lecture::piece(&for_thread, *index, at as u32, wav, "audio/wav") {
                    Ok(()) => {
                        PIECES.fetch_add(1, Ordering::Relaxed);
                        *index += 1;
                        true
                    }
                    Err(e) => {
                        eprintln!("[roomrec] stopping: {e}");
                        false
                    }
                }
            };
            while is_recording() {
                match crate::loopback::record(CHUNK_SECS, || {}) {
                    Ok((samples, r)) => {
                        rate = r;
                        held.extend(samples);
                        held_secs += CHUNK_SECS;
                    }
                    Err(e) => {
                        eprintln!("[roomrec] couldn't hear the speakers: {e}");
                        RECORDING.store(false, Ordering::Relaxed);
                        broke = true;
                        break;
                    }
                }
                if held_secs >= PIECE_SECS {
                    if !send(&mut held, rate, began, &mut index) {
                        RECORDING.store(false, Ordering::Relaxed);
                        broke = true;
                        break;
                    }
                    began += held_secs;
                    held_secs = 0.0;
                }
            }
            // Stopped mid-piece: the last words still count.
            send(&mut held, rate, began, &mut index);
            if broke {
                // Nothing more is coming: don't leave a half-open lecture for
                // "stop recording" to find later.
                if PIECES.load(Ordering::Relaxed) == 0 {
                    let _ = crate::lecture::cancel(&for_thread);
                }
                *LIVE_ID.lock() = None;
            }
            RECORDING_THREAD.store(false, Ordering::Relaxed);
            eprintln!("[roomrec] stopped after {} piece(s)", PIECES.load(Ordering::Relaxed));
        })
        .ok();
    Ok(id)
}

/// Stop, and turn what was said into notes (lecture.rs does the writing).
pub fn stop(id: &str) -> Result<(String, String)> {
    RECORDING.store(false, Ordering::Relaxed);
    *LIVE_ID.lock() = None;
    // The recorder is inside a chunk: give it long enough to finish that one
    // and hand over the last words, so they're in the notes rather than
    // arriving after they're written.
    let waited = std::time::Instant::now();
    while RECORDING_THREAD.load(Ordering::Relaxed) && waited.elapsed() < std::time::Duration::from_secs(CHUNK_SECS as u64 + 8) {
        std::thread::sleep(std::time::Duration::from_millis(200));
    }
    if PIECES.load(Ordering::Relaxed) == 0 {
        let _ = crate::lecture::cancel(id);
        anyhow::bail!("I didn't hear anything from your PC's speakers. Check the call or video was actually playing out loud (not muted), then try again.");
    }
    crate::lecture::finish(id)
}

/// "Write down this call", "take notes on this zoom meeting", "record this class".
pub fn parse(said: &str) -> Option<String> {
    let s = said.to_lowercase();
    let s = s.trim().trim_end_matches(['.', '!', '?']);
    let about = ["call", "zoom", "meeting", "class", "lecture", "webinar", "teams", "meet", "video"].iter().any(|w| s.contains(w));
    if !about {
        return None;
    }
    let asks = ["write down", "take notes", "note down", "record", "transcribe", "listen to", "capture"].iter().any(|w| s.contains(w));
    // The microphone version is Lecture Mode; this one is what the PC plays.
    let from_pc = ["my pc", "this pc", "the speakers", "playing", "on screen", "zoom", "teams", "meet", "online", "call", "webinar"].iter().any(|w| s.contains(w));
    (asks && from_pc).then(|| {
        for marker in [" this ", " the ", " my "] {
            if let Some(at) = s.find(marker) {
                let name = s[at + marker.len()..].trim();
                if !name.is_empty() && name.len() <= 60 {
                    let mut c = name.chars();
                    return c.next().map(|f| f.to_uppercase().collect::<String>() + c.as_str()).unwrap_or_default();
                }
            }
        }
        "Call".to_string()
    })
}

/// "Stop recording", "that's enough, stop writing it down".
pub fn asks_to_stop(said: &str) -> bool {
    let s = said.to_lowercase();
    ["stop", "finish", "end", "done", "that's enough", "thats enough"].iter().any(|w| s.contains(w))
        && ["recording", "writing it down", "taking notes", "the call", "listening"].iter().any(|w| s.contains(w))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_wav_says_what_it_is() {
        let w = wav_of(&[0.0, 0.5, -0.5], 16_000);
        assert_eq!(&w[..4], b"RIFF");
        assert_eq!(&w[8..12], b"WAVE");
        // mono, 16-bit, the rate it was given.
        assert_eq!(u16::from_le_bytes([w[22], w[23]]), 1);
        assert_eq!(u32::from_le_bytes([w[24], w[25], w[26], w[27]]), 16_000);
        assert_eq!(u16::from_le_bytes([w[34], w[35]]), 16);
        // Three samples, two bytes each.
        assert_eq!(w.len(), 44 + 6);
    }

    #[test]
    fn silence_is_not_sent_to_be_written_down() {
        assert!(!has_sound(&[]));
        assert!(!has_sound(&vec![0.0; 16_000]));
        // A tiny hiss is still silence; real talking isn't.
        assert!(!has_sound(&vec![0.001; 16_000]));
        assert!(has_sound(&vec![0.2; 16_000]));
    }

    #[test]
    fn it_knows_a_call_from_a_room() {
        assert!(parse("write down this zoom call").is_some());
        assert!(parse("take notes on my online class").is_some());
        assert!(parse("transcribe this teams meeting").is_some());
        // Not about a call, or not asking for it to be written down.
        assert!(parse("call my mum").is_none());
        assert!(parse("what's on my screen").is_none());
        assert!(parse("record a voice note").is_none());
        // Stopping.
        assert!(asks_to_stop("stop recording"));
        assert!(asks_to_stop("that's enough, stop taking notes"));
        assert!(!asks_to_stop("stop the music"));
    }
}
