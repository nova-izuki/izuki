//! Lecture Mode: a lecture recorded *with permission*, written down, and
//! turned into study notes.
//!
//! The Notes tab records the microphone in two-minute pieces (each a whole
//! audio file) and hands each piece here as it's done; it's written down
//! straight away by the cloud ears you have a key for (Groq's Whisper, else
//! Gemini — stt.rs), so the transcript grows during the lecture. "Stop"
//! waits for the last pieces, then the AI writes structured notes from the
//! transcript — topics, definitions, examples, important dates, what the
//! instructor stressed, open questions, action items — each with its
//! [mm:ss] time, and the transcript itself is kept under the notes so
//! everything can be checked against what was really said.
//!
//! Recording is never hidden: it only starts after you confirm you're
//! allowed to record, it shows on the Island and in Notes the whole time,
//! and it stops when you say so. Nothing is recorded in the background.

use std::collections::BTreeMap;
use std::time::{Duration, Instant};

use anyhow::{anyhow, bail, Result};
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Piece {
    pub index: u32,
    /// Seconds into the lecture this piece starts.
    pub start: u32,
    pub text: String,
    /// It couldn't be written down (the reason is in `text`).
    #[serde(default)]
    pub failed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Lecture {
    pub id: String,
    pub title: String,
    /// Unix ms when recording started.
    pub started: i64,
    pub pieces: Vec<Piece>,
    #[serde(default)]
    pub note_id: Option<String>,
}

struct Live {
    lecture: Lecture,
    began: Instant,
    /// Pieces handed over and still being written down.
    pending: u32,
}

static LIVE: Mutex<Option<Live>> = Mutex::new(None);

fn dir() -> std::path::PathBuf {
    crate::store::data_dir().join("lectures")
}

fn load(id: &str) -> Option<Lecture> {
    std::fs::read_to_string(dir().join(format!("{id}.json"))).ok().and_then(|s| serde_json::from_str(&s).ok())
}

fn save(l: &Lecture) {
    let d = dir();
    let _ = std::fs::create_dir_all(&d);
    let p = d.join(format!("{}.json", l.id));
    let tmp = p.with_extension("json.tmp");
    if std::fs::write(&tmp, serde_json::to_string_pretty(l).unwrap_or_default()).is_ok() {
        let _ = std::fs::rename(&tmp, &p);
    }
}

/// Start a lecture (after the user confirmed they may record). Needs cloud
/// ears to write it down.
pub fn start(title: &str) -> Result<String> {
    let settings = crate::state::store().settings();
    if !crate::stt::has_key(&settings) {
        bail!("Lecture Mode writes lectures down with Groq's free Whisper — add a free Groq key in Settings → Izuki's brain first (or a Gemini key).");
    }
    let mut live = LIVE.lock();
    if live.is_some() {
        bail!("A lecture is already being recorded — stop it first.");
    }
    let title = title.trim();
    let title = if title.is_empty() { format!("Lecture {}", chrono::Local::now().format("%a %-d %b, %-I:%M %p")) } else { title.chars().take(80).collect() };
    let lecture = Lecture { id: uuid::Uuid::new_v4().to_string(), title, started: crate::model::now_ms(), pieces: Vec::new(), note_id: None };
    save(&lecture);
    let id = lecture.id.clone();
    *live = Some(Live { lecture, began: Instant::now(), pending: 0 });
    eprintln!("[lecture] recording started");
    Ok(id)
}

/// One finished piece of audio: written down in the background.
pub fn piece(id: &str, index: u32, start: u32, audio: Vec<u8>, mime: &str) -> Result<()> {
    {
        let mut live = LIVE.lock();
        let l = live.as_mut().filter(|l| l.lecture.id == id).ok_or_else(|| anyhow!("that lecture isn't recording"))?;
        l.pending += 1;
    }
    let (id, mime) = (id.to_string(), mime.to_string());
    std::thread::spawn(move || {
        let settings = crate::state::store().settings();
        let ext = if mime.contains("ogg") { "ogg" } else if mime.contains("mp4") { "m4a" } else { "webm" };
        let result = if audio.len() < 2_000 { Ok(String::new()) } else { crate::stt::transcribe_clip(&settings, audio, &mime, &format!("lecture.{ext}")) };
        let mut live = LIVE.lock();
        let piece = match result {
            Ok(text) => Piece { index, start, text, failed: false },
            Err(e) => Piece { index, start, text: format!("couldn't be written down ({})", first_line(&e.to_string())), failed: true },
        };
        // The lecture may have stopped meanwhile: it's in FINISHING then.
        if let Some(l) = live.as_mut().filter(|l| l.lecture.id == id) {
            l.lecture.pieces.push(piece);
            l.lecture.pieces.sort_by_key(|p| p.index);
            l.pending = l.pending.saturating_sub(1);
            save(&l.lecture);
        } else if let Some(f) = FINISHING.lock().get_mut(&id) {
            f.0.pieces.push(piece);
            f.0.pieces.sort_by_key(|p| p.index);
            f.1 = f.1.saturating_sub(1);
        } else if let Some(mut saved) = load(&id) {
            // Arrived after the notes were made: kept in the saved lecture.
            saved.pieces.retain(|p| p.index != u32::MAX);
            saved.pieces.push(piece);
            saved.pieces.sort_by_key(|p| p.index);
            save(&saved);
            eprintln!("[lecture] a late piece was added to the saved lecture");
        }
    });
    Ok(())
}

/// Lectures being turned into notes: (lecture, pieces still being written down).
static FINISHING: Mutex<BTreeMap<String, (Lecture, u32)>> = Mutex::new(BTreeMap::new());

fn first_line(e: &str) -> String {
    e.lines().next().unwrap_or(e).chars().take(120).collect()
}

/// "[12:30]"
fn stamp(secs: u32) -> String {
    format!("[{:02}:{:02}]", secs / 60, secs % 60)
}

/// The transcript with a time on every piece; unclear pieces said so.
pub fn transcript(l: &Lecture) -> String {
    l.pieces
        .iter()
        .filter(|p| p.failed || !p.text.trim().is_empty())
        .map(|p| if p.failed { format!("{} (this part {})", stamp(p.start), p.text) } else { format!("{} {}", stamp(p.start), p.text.trim()) })
        .collect::<Vec<_>>()
        .join("\n")
}

const NOTES_PROMPT: &str = "You turn a lecture transcript into clear study notes for a student. The transcript was written down by speech recognition, so it can have mistakes: never present a doubtful word or number as fact — mark it (unclear) instead. Use ONLY what was said; if you add a general explanation that wasn't in the lecture, label it (general knowledge).
Write markdown with these sections, leaving out any that would be empty:
## Summary — 3 to 5 sentences.
## Key points — the main ideas, each with its [mm:ss] time from the transcript.
## Definitions — term: meaning [mm:ss].
## Examples — the examples given [mm:ss].
## Important dates and numbers — deadlines, exams, figures mentioned [mm:ss].
## The instructor stressed — anything said to be important, on the exam, or repeated.
## Open questions — things left unclear or asked but not answered.
## Action items — readings, homework, things to do, with any dates.
Keep it short and plain.";

/// Stop recording, wait for the last pieces, and write the notes (saved in
/// Notes, transcript underneath). Returns (note id, title).
pub fn finish(id: &str) -> Result<(String, String)> {
    {
        // Moved over while LIVE is held, so a piece finishing right now
        // lands in one place or the other — never neither.
        let mut live = LIVE.lock();
        if !live.as_ref().is_some_and(|l| l.lecture.id == id) {
            bail!("that lecture isn't recording");
        }
        let l = live.take().expect("checked");
        eprintln!("[lecture] stopped — {} piece(s) written, {} still being written", l.lecture.pieces.len(), l.pending);
        FINISHING.lock().insert(id.to_string(), (l.lecture, l.pending));
    }
    // The last pieces: up to two minutes.
    let until = Instant::now() + Duration::from_secs(120);
    while Instant::now() < until && FINISHING.lock().get_mut(id).is_some_and(|f| f.1 > 0) {
        std::thread::sleep(Duration::from_millis(400));
    }
    let (mut lecture, still) = FINISHING.lock().remove(id).ok_or_else(|| anyhow!("the lecture went missing"))?;
    if still > 0 {
        // Said in the transcript, never silently missing.
        let at = lecture.pieces.iter().map(|p| p.start).max().unwrap_or(0);
        lecture.pieces.push(Piece { index: u32::MAX, start: at, text: format!("couldn't be written down in time ({still} last part{} still being written down)", if still == 1 { "" } else { "s" }), failed: true });
    }
    save(&lecture);
    let text = transcript(&lecture);
    let heard = lecture.pieces.iter().filter(|p| !p.failed && !p.text.trim().is_empty()).count();
    if heard == 0 {
        bail!("Nothing was written down — the microphone may not have picked up the lecture{}.", if lecture.pieces.iter().any(|p| p.failed) { ", or the transcription service failed" } else { "" });
    }
    let notes = match write_notes(&lecture.title, &text) {
        Ok(n) => n,
        Err(e) => {
            eprintln!("[lecture] notes couldn't be written: {e}");
            format!("> ⚠️ The AI couldn't write the notes just now ({}). The transcript is saved below — open this note later and ask me to “make notes from this”.", first_line(&e.to_string()))
        }
    };
    let failed = lecture.pieces.iter().filter(|p| p.failed).count();
    let warning = if failed > 0 { format!("\n\n> ⚠️ {failed} part(s) of the recording couldn't be written down — see the transcript below.\n") } else { String::new() };
    let body = format!("{notes}{warning}\n\n---\n## Transcript (speech recognition — may contain mistakes)\n{text}");
    let note = crate::notes::keep(&format!("Lecture — {}", lecture.title), "Lecture Mode", &body)?;
    let mut l = lecture;
    l.note_id = Some(note.id.clone());
    save(&l);
    eprintln!("[lecture] notes saved ({} pieces)", l.pieces.len());
    crate::studytrack::add("lecture", &l.title, "", "", None);
    Ok((note.id, l.title))
}

/// Notes from a transcript; a long one is taken in parts first.
pub(crate) fn write_notes(title: &str, transcript: &str) -> Result<String> {
    const PART: usize = 24_000;
    let source = if transcript.chars().count() <= PART {
        transcript.to_string()
    } else {
        // Each part to short timed notes, then those to the final notes.
        let chars: Vec<char> = transcript.chars().collect();
        let mut parts = Vec::new();
        for chunk in chars.chunks(PART) {
            let part: String = chunk.iter().collect();
            let n = crate::chat::complete(&[
                json!({ "role": "system", "content": "Condense this part of a lecture transcript into detailed timed notes: every key point, definition, example, date, number and instruction, each with its [mm:ss]. Mark doubtful words (unclear). Only what was said." }),
                json!({ "role": "user", "content": part }),
            ])?;
            parts.push(n);
        }
        parts.join("\n\n")
    };
    let notes = crate::chat::complete(&[json!({ "role": "system", "content": NOTES_PROMPT }), json!({ "role": "user", "content": format!("Lecture: {title}\n\nTranscript:\n{source}") })])?;
    if notes.trim().is_empty() {
        bail!("The AI didn't write the notes — the transcript is saved; try again from Notes.");
    }
    Ok(notes)
}

/// Throw a recording away (nothing is written).
pub fn cancel(id: &str) {
    let mut live = LIVE.lock();
    if live.as_ref().is_some_and(|l| l.lecture.id == id) {
        let l = live.take().expect("checked");
        let _ = std::fs::remove_file(dir().join(format!("{}.json", l.lecture.id)));
        eprintln!("[lecture] recording thrown away");
    }
}

/// For the Island and Notes: (title, seconds recorded, pieces written down).
pub fn now() -> Option<(String, u64, usize)> {
    LIVE.lock().as_ref().map(|l| (l.lecture.title.clone(), l.began.elapsed().as_secs(), l.lecture.pieces.len()))
}

/// The transcript so far (for the live view in Notes).
pub fn so_far(id: &str) -> Option<String> {
    LIVE.lock().as_ref().filter(|l| l.lecture.id == id).map(|l| transcript(&l.lecture))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn transcript_keeps_times_and_says_what_failed() {
        let l = Lecture {
            id: "x".into(),
            title: "Bio 101".into(),
            started: 0,
            pieces: vec![
                Piece { index: 0, start: 0, text: "Today: cell membranes.".into(), failed: false },
                Piece { index: 1, start: 120, text: "couldn't be written down (Groq answered 429)".into(), failed: true },
                Piece { index: 2, start: 240, text: " ".into(), failed: false },
                Piece { index: 3, start: 360, text: "Osmosis is water moving across a membrane.".into(), failed: false },
            ],
            note_id: None,
        };
        let t = transcript(&l);
        assert_eq!(t, "[00:00] Today: cell membranes.\n[02:00] (this part couldn't be written down (Groq answered 429))\n[06:00] Osmosis is water moving across a membrane.");
        assert_eq!(stamp(3725), "[62:05]");
    }
}
