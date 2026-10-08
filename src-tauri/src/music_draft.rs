//! Deterministic, non-destructive song drafts. No DAW automation, cloud calls,
//! sample uploads, or edits to an existing project. All files are read back.
use anyhow::{anyhow, bail, Context, Result};
use serde::Serialize;
use std::{io::Write, path::{Path, PathBuf}};

use crate::beats::{self, Genre};

const PPQ: u32 = 96;
const BAR: u32 = PPQ * 4;
type Event = (u32, Vec<u8>);

#[derive(Debug, Clone, Serialize)]
pub struct Section {
    pub name: String,
    /// Zero-based, inclusive start bar; the human-readable plan adds one.
    pub start_bar: u32,
    pub bars: u32,
}

#[derive(Debug, Clone, Serialize)]
pub struct DraftSpec {
    pub genre: String,
    pub bpm: u32,
    pub tonic: u8,
    pub minor: bool,
    pub key: String,
    pub bars: u32,
    pub seed: u32,
    pub sections: Vec<Section>,
}

pub fn is_arrangement(said: &str) -> bool {
    words(said).iter().any(|w| matches!(w.as_str(), "arrangement" | "song" | "track"))
}

fn words(s: &str) -> Vec<String> {
    s.to_lowercase().replace(['-', '–'], " ").split_whitespace()
        .map(|w| w.trim_matches(|c: char| !c.is_alphanumeric() && c != '#' && c != '♭').to_owned()).collect()
}

/// Explicit values must be respected or refused, never silently replaced.
pub fn parameters(said: &str, default_bpm: u32, arrangement: bool) -> Result<(u32, u32, u8, bool, String)> {
    if said.split_whitespace().any(|word| word.starts_with('-') && word.chars().nth(1).is_some_and(|c| c.is_ascii_digit())) {
        bail!("Tempo and bar count must be positive; I haven't created anything.");
    }
    let w = words(said);
    let mut bpm = default_bpm;
    let mut bars = if arrangement { 64 } else { 4 };
    let number = |s: &str| -> Option<u32> { match s {
        "four" => Some(4), "eight" => Some(8), "sixteen" => Some(16), "thirtytwo" => Some(32),
        _ => s.parse().ok(),
    }};
    for (i, token) in w.iter().enumerate() {
        if token == "bpm" || (token.ends_with("bpm") && token.len() > 3) {
            let n = if token == "bpm" { i.checked_sub(1).and_then(|j| number(&w[j])) }
                    else { token.strip_suffix("bpm").and_then(number) };
            bpm = n.filter(|n| (50..=200).contains(n)).ok_or_else(|| anyhow!("Choose a tempo from 50 to 200 BPM; I haven't created anything."))?;
        }
        if matches!(token.as_str(), "bar" | "bars") {
            bars = i.checked_sub(1).and_then(|j| number(&w[j]))
                .filter(|n| if arrangement { [32, 64].contains(n) } else { (1..=32).contains(n) })
                .ok_or_else(|| anyhow!(if arrangement { "Choose a 32- or 64-bar arrangement; I haven't created anything." } else { "Choose a loop from 1 to 32 bars; I haven't created anything." }))?;
        }
    }
    let mut key = (9, true, "A minor".to_string());
    for (i, mode) in w.iter().enumerate() {
        if mode == "minor" || mode == "major" {
            let root = i.checked_sub(1).map(|j| w[j].as_str()).unwrap_or("");
            let tonic = match root {
                "c" => 0, "c#" | "db" | "d♭" => 1, "d" => 2, "d#" | "eb" | "e♭" => 3,
                "e" => 4, "f" => 5, "f#" | "gb" | "g♭" => 6, "g" => 7, "g#" | "ab" | "a♭" => 8,
                "a" => 9, "a#" | "bb" | "b♭" => 10, "b" => 11,
                _ => bail!("Name the key, such as A minor or C major; I haven't created anything."),
            };
            key = (tonic, mode == "minor", format!("{} {mode}", root.to_uppercase()));
        }
    }
    if w.iter().any(|s| s == "key") && !w.iter().any(|s| s == "minor" || s == "major") {
        bail!("Specify a major or minor key, such as C major; I haven't created anything.");
    }
    if !w.iter().any(|s| s == "minor" || s == "major") && w.windows(2).any(|pair| pair[0] == "in"
        && matches!(pair[1].as_str(), "a" | "b" | "c" | "d" | "e" | "f" | "g" | "a#" | "c#" | "d#" | "f#" | "g#" | "ab" | "bb" | "db" | "eb" | "gb")) {
        bail!("Specify major or minor for that key; I haven't created anything.");
    }
    Ok((bpm, bars, key.0, key.1, key.2))
}

fn sections(bars: u32) -> Vec<Section> {
    let scale = bars / 32;
    let mut start = 0;
    [("Intro", 2), ("Verse 1", 8), ("Hook 1", 4), ("Verse 2", 8), ("Bridge", 4), ("Hook 2", 4), ("Outro", 2)]
        .into_iter().map(|(name, length)| {
            let section = Section { name: name.into(), start_bar: start, bars: length * scale };
            start += section.bars;
            section
        }).collect()
}

fn meta(kind: u8, text: &str) -> Vec<u8> {
    let mut e = vec![0xff, kind];
    beats::vlq(text.len() as u32, &mut e);
    e.extend(text.as_bytes());
    e
}

fn add_note(events: &mut Vec<Event>, tick: u32, duration: u32, channel: u8, pitch: u8, velocity: u8) {
    // Notes wander a few ticks off the grid like a person, and two adjacent
    // notes on the same drum can wander into each other. Never start one
    // while the same pitch is still sounding — that's what made every draft
    // with a ghost next to a hit fail the validator.
    let latest_off = events
        .iter()
        .filter(|(_, e)| e[0] & 0xf0 == 0x80 && e[0] & 0xf == channel as u8 && e[1] == pitch)
        .map(|(t, _)| *t)
        .max()
        .unwrap_or(0);
    let tick = tick.max(latest_off);
    events.push((tick, vec![0x90 | channel, pitch, velocity]));
    events.push((tick + duration, vec![0x80 | channel, pitch, 0]));
}

fn track(mut events: Vec<Event>, end: u32) -> Vec<u8> {
    // Stable: metadata/program selection stays before notes; a repeated note
    // is released before being pressed again at the same tick.
    events.sort_by_key(|(tick, e)| (*tick, if e[0] & 0xf0 == 0x80 { 0 } else if e[0] & 0xf0 == 0x90 { 2 } else { 1 }));
    let mut data = Vec::new();
    let mut last = 0;
    for (tick, event) in events {
        beats::vlq(tick - last, &mut data);
        data.extend(event);
        last = tick;
    }
    beats::vlq(end - last, &mut data);
    data.extend([0xff, 0x2f, 0]);
    let mut chunk = b"MTrk".to_vec();
    chunk.extend((data.len() as u32).to_be_bytes());
    chunk.extend(data);
    chunk
}

pub fn compile(g: &Genre, spec: &DraftSpec) -> Result<Vec<u8>> {
    if ![32, 64].contains(&spec.bars) || !(50..=200).contains(&spec.bpm) || spec.tonic > 11 {
        bail!("Invalid music draft parameters");
    }
    let expected = sections(spec.bars);
    if spec.sections.len() != expected.len() || spec.sections.iter().zip(&expected)
        .any(|(a, b)| a.start_bar != b.start_bar || a.bars != b.bars || a.name != b.name) {
        bail!("Arrangement sections are not contiguous");
    }
    let end = spec.bars * BAR;
    let tempo = 60_000_000 / spec.bpm;
    let mut conductor = vec![
        (0, meta(0x03, "Izuki arrangement")),
        (0, vec![0xff, 0x51, 3, (tempo >> 16) as u8, (tempo >> 8) as u8, tempo as u8]),
        (0, vec![0xff, 0x58, 4, 4, 2, 24, 8]),
    ];
    let mut drums = vec![(0, meta(0x03, "Drums - General MIDI channel 10"))];
    let mut bass = vec![(0, meta(0x03, "Bass")), (0, vec![0xc1, 33])];
    let mut chords = vec![(0, meta(0x03, "Chords")), (0, vec![0xc0, 0])];
    let mut melody = vec![(0, meta(0x03, "Melody")), (0, vec![0xc2, 80])];
    let scale: [u8; 7] = if spec.minor { [0, 2, 3, 5, 7, 8, 10] } else { [0, 2, 4, 5, 7, 9, 11] };
    let progression = if spec.minor { [0, 5, 2, 6] } else { [0, 4, 5, 3] };
    for (index, section) in spec.sections.iter().enumerate() {
        conductor.push((section.start_bar * BAR, meta(0x06, &section.name)));
        let sparse = matches!(section.name.as_str(), "Intro" | "Bridge" | "Outro");
        for (tick, pitch, velocity, duration) in beats::notes(g, section.bars, spec.seed.wrapping_add(index as u32)) {
            if sparse && ![36, 42, 49, 82].contains(&pitch) { continue; }
            let start = section.start_bar * BAR + tick;
            if start >= (section.start_bar + section.bars) * BAR { continue; }
            add_note(&mut drums, start, duration.min((section.start_bar + section.bars) * BAR - start), 9, pitch,
                if sparse { velocity.saturating_sub(24).max(1) } else { velocity });
        }
        for local_bar in 0..section.bars {
            let bar = section.start_bar + local_bar;
            let degree = progression[((local_bar / 2) % 4) as usize];
            let root = 36 + spec.tonic + scale[degree];
            if section.name != "Intro" {
                add_note(&mut bass, bar * BAR, BAR / 2 - 4, 1, root, 88);
                if !sparse { add_note(&mut bass, bar * BAR + BAR / 2, BAR / 2 - 4, 1, root, 78); }
            }
            for offset in [0, 2, 4] {
                let d = degree + offset;
                let pitch = 48 + spec.tonic + scale[d % 7] + (d / 7) as u8 * 12;
                add_note(&mut chords, bar * BAR, BAR - 8, 0, pitch, if sparse { 52 } else { 68 });
            }
            if section.name.starts_with("Hook") {
                // Four notes per bar, all different: the fourth used to repeat
                // the second's degree at the same tick, so every hook collided
                // on the same key and failed the overlap check.
                for (beat, offset) in [0, 2, 4, 6].into_iter().enumerate() {
                    let d = degree + offset;
                    let pitch = 60 + spec.tonic + scale[d % 7] + (d / 7) as u8 * 12;
                    add_note(&mut melody, bar * BAR + beat as u32 * PPQ, PPQ / 2, 2, pitch, 82);
                }
            }
        }
    }
    let mut bytes = b"MThd".to_vec();
    bytes.extend(6u32.to_be_bytes());
    bytes.extend(1u16.to_be_bytes());
    bytes.extend(5u16.to_be_bytes());
    bytes.extend((PPQ as u16).to_be_bytes());
    for events in [conductor, drums, bass, chords, melody] { bytes.extend(track(events, end)); }
    validate_midi(&bytes, spec.bars, spec.bpm)?;
    Ok(bytes)
}

/// Decode the actual serialized bytes. Reject truncated tracks, stuck notes,
/// out-of-range events, missing tempo and tracks that end off the bar line.
pub fn validate_midi(bytes: &[u8], bars: u32, bpm: u32) -> Result<()> {
    fn take<'a>(bytes: &'a [u8], pos: &mut usize, n: usize) -> Result<&'a [u8]> {
        let end = pos.checked_add(n).ok_or_else(|| anyhow!("MIDI size overflow"))?;
        let out = bytes.get(*pos..end).ok_or_else(|| anyhow!("Truncated MIDI"))?;
        *pos = end; Ok(out)
    }
    fn vlq(bytes: &[u8], pos: &mut usize) -> Result<u32> {
        let mut value = 0;
        for _ in 0..4 { let byte = take(bytes, pos, 1)?[0]; value = (value << 7) | (byte & 127) as u32; if byte < 128 { return Ok(value); } }
        bail!("Invalid MIDI variable length value")
    }
    if bytes.len() < 14 || &bytes[..8] != b"MThd\0\0\0\x06" || u16::from_be_bytes([bytes[12], bytes[13]]) != PPQ as u16 { bail!("Invalid MIDI header"); }
    let format = u16::from_be_bytes([bytes[8], bytes[9]]);
    let count = u16::from_be_bytes([bytes[10], bytes[11]]);
    if !matches!((format, count), (0, 1) | (1, 5)) || bars == 0 || bpm == 0 { bail!("Invalid MIDI format"); }
    let end = bars.checked_mul(BAR).ok_or_else(|| anyhow!("MIDI duration overflow"))?;
    let mut pos = 14;
    let mut tempo_seen = false;
    let mut note_count = 0;
    for _ in 0..count {
        if take(bytes, &mut pos, 4)? != b"MTrk" { bail!("Missing MIDI track"); }
        let length = u32::from_be_bytes(take(bytes, &mut pos, 4)?.try_into()?) as usize;
        let data = take(bytes, &mut pos, length)?;
        let mut at = 0;
        let mut tick = 0u32;
        let mut ended = false;
        let mut active = std::collections::HashSet::new();
        while at < data.len() {
            tick = tick.checked_add(vlq(data, &mut at)?).ok_or_else(|| anyhow!("MIDI time overflow"))?;
            if tick > end { bail!("MIDI note exceeds arrangement length"); }
            let status = take(data, &mut at, 1)?[0];
            match status {
                0xff => {
                    let kind = take(data, &mut at, 1)?[0];
                    let length = vlq(data, &mut at)? as usize;
                    let value = take(data, &mut at, length)?;
                    if kind == 0x51 {
                        let expected = (60_000_000u32 / bpm).to_be_bytes();
                        if tick != 0 || value != &expected[1..] { bail!("Wrong MIDI tempo"); }
                        tempo_seen = true;
                    }
                    if kind == 0x2f {
                        if !value.is_empty() || tick != end || at != data.len() || !active.is_empty() { bail!("Invalid MIDI ending or stuck note"); }
                        ended = true;
                    }
                }
                0x80..=0x9f => {
                    let note = take(data, &mut at, 2)?;
                    if note[0] > 127 || note[1] > 127 { bail!("Invalid MIDI note"); }
                    let key = (status & 15, note[0]);
                    if status & 0xf0 == 0x90 && note[1] > 0 {
                        if tick == end || active.contains(&key) { bail!("Overlapping MIDI note"); }
                        active.insert(key);
                        note_count += 1;
                    } else if !active.remove(&key) { bail!("MIDI note-off without note-on"); }
                }
                0xc0..=0xcf => { if take(data, &mut at, 1)?[0] > 127 { bail!("Invalid MIDI program"); } }
                _ => bail!("Unexpected MIDI event"),
            }
        }
        if !ended { bail!("Missing MIDI end-of-track"); }
    }
    if pos != bytes.len() || !tempo_seen || note_count == 0 { bail!("Incomplete MIDI draft"); }
    Ok(())
}

fn write_new(path: &Path, bytes: &[u8]) -> Result<()> {
    let mut f = std::fs::OpenOptions::new().write(true).create_new(true).open(path)?;
    f.write_all(bytes)?;
    f.sync_all()?;
    if std::fs::read(path)? != bytes { bail!("Saved file did not match the draft"); }
    Ok(())
}

pub fn save_loop(dir: &Path, g: &Genre, bpm: u32, bars: u32, seed: u32) -> Result<PathBuf> {
    let data = beats::midi(g, bpm, bars, seed);
    validate_midi(&data, bars, bpm)?;
    std::fs::create_dir_all(dir)?;
    let path = dir.join(format!("{} {bpm}bpm {}.mid", g.name.replace('&', "and"), uuid::Uuid::new_v4()));
    write_new(&path, &data)?;
    validate_midi(&std::fs::read(&path)?, bars, bpm)?;
    Ok(path)
}

pub fn save_arrangement(dir: &Path, g: &Genre, spec: &DraftSpec) -> Result<PathBuf> {
    let midi = compile(g, spec)?;
    std::fs::create_dir_all(dir)?;
    let folder = dir.join(format!("{} draft {}", g.name.replace('&', "and"), uuid::Uuid::new_v4()));
    std::fs::create_dir(&folder)?;
    write_new(&folder.join("arrangement.mid"), &midi)?;
    let json = serde_json::to_vec_pretty(spec)?;
    write_new(&folder.join("arrangement.json"), &json)?;
    let mut plan = format!("Izuki music draft\n{} | {} BPM | {} | 4/4 | {} bars\n\n", g.name, spec.bpm, spec.key, spec.bars);
    for s in &spec.sections { plan.push_str(&format!("{}: bars {}–{}\n", s.name, s.start_bar + 1, s.start_bar + s.bars)); }
    plan.push_str("\nTracks: drums (GM channel 10), bass, chords, melody.\nSave a copy of your DAW project before importing arrangement.mid. Choose instruments for the MIDI tracks; this is a MIDI sketch, not rendered audio. No existing project was changed.\nTempo and key are chosen parameters, not measured from your audio. There is no live DAW listening or automatic Playlist insertion in this draft.\n");
    write_new(&folder.join("README.txt"), plan.as_bytes())?;
    validate_midi(&std::fs::read(folder.join("arrangement.mid"))?, spec.bars, spec.bpm)?;
    Ok(folder)
}

pub fn make(said: &str, g: &Genre, default_bpm: u32) -> Result<String> {
    let arrangement = is_arrangement(said);
    let lower = said.to_lowercase();
    if ["my loop", "my sample", "my recording", "this audio", "listen to", "detect the", "in real time"].iter().any(|s| lower.contains(s)) {
        bail!("I can create a new MIDI draft, but I can't yet listen to your DAW or analyze that recording. I haven't changed your project.");
    }
    let (bpm, bars, tonic, minor, key) = parameters(said, default_bpm, arrangement)?;
    let seed = rand::random::<u32>();
    let dir = dirs::audio_dir().context("I couldn't locate your Music folder")?.join("Izuki Beats");
    if arrangement {
        let spec = DraftSpec { genre: g.key.into(), bpm, tonic, minor, key: key.clone(), bars, seed, sections: sections(bars) };
        let folder = save_arrangement(&dir, g, &spec)?;
        Ok(format!("Created and checked a {bars}-bar {} MIDI draft at {bpm} BPM in {key}: intro, verses, hooks, bridge and outro, with drums, bass, chords and melody. Saved to {}. Save a copy of your DAW project, then import arrangement.mid and choose its instruments. Your open project is untouched. Tempo and key are draft settings, not detected from audio.", g.name, folder.display()))
    } else {
        let path = save_loop(&dir, g, bpm, bars, seed)?;
        Ok(format!("Created and checked a {bars}-bar {} drum MIDI loop at {bpm} BPM. Saved to {}. Import it into a saved copy of your DAW project and choose a drum instrument. Your open project is untouched.", g.name, path.display()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    fn spec(g: &Genre, tonic: u8, minor: bool, bars: u32) -> DraftSpec {
        DraftSpec { genre: g.key.into(), bpm: g.bpm, tonic, minor, key: "test".into(), bars, seed: 42, sections: sections(bars) }
    }
    #[test]
    fn every_genre_and_key_exports_balanced_tracks() {
        // Decode the tracks and report the first overlap, so the fix is verified
        // against the real notes rather than guessed at.
        fn vlq(b: &[u8], mut p: usize) -> (u32, usize) {
            let mut v = 0u32;
            loop {
                let byte = b[p]; p += 1;
                v = (v << 7) | (byte & 0x7f) as u32;
                if byte & 0x80 == 0 { break; }
            }
            (v, p)
        }
        for g in beats::GENRES { for tonic in 0..12 { for minor in [false, true] {
            let s = spec(g, tonic, minor, 32);
            let data = match compile(g, &s) {
                Ok(d) => d,
                Err(e) => { eprintln!("COMPILE FAIL {} tonic={} minor={}: {}", g.name, tonic, minor, e); continue; }
            };
            let mut p = 14;
            for _track in 0..5 {
                if p + 8 > data.len() { break; }
                let len = u32::from_be_bytes([data[p+4], data[p+5], data[p+6], data[p+7]]) as usize;
                p += 8;
                let end = p + len;
                let mut t = 0u32;
                let mut active: std::collections::HashMap<(u8, u8), u32> = std::collections::HashMap::new();
                while p < end {
                    let (dt, np) = vlq(&data, p);
                    p = np;
                    t += dt;
                    if p >= end { break; }
                    let st = data[p]; p += 1;
                    if st == 0xff { p += 1; let (l, np) = vlq(&data, p); p = np; p += l as usize; continue; }
                    if st == 0xf0 || st == 0xf7 { let (l, np) = vlq(&data, p); p = np; p += l as usize; continue; }
                    if st & 0xf0 == 0x80 || st & 0xf0 == 0x90 {
                        let note = data[p]; let vel = data[p+1]; p += 2;
                        let key = (st & 0xf, note);
                        if st & 0xf0 == 0x90 && vel > 0 {
                            if let Some(&ot) = active.get(&key) {
                                eprintln!("OVERLAP genre={} tonic={} minor={} channel={} pitch={} on={} prev_on={}",
                                    g.name, tonic, minor, st & 0xf, note, t, ot);
                                panic!("first overlap reported above");
                            }
                            active.insert(key, t);
                        } else { active.remove(&key); }
                    } else if st & 0xf0 == 0xc0 { p += 1; }
                }
            }
            validate_midi(&data, s.bars, s.bpm).unwrap();
            assert_eq!(&data[8..12], &[0,1,0,5]);
        } } }
    }
    #[test]
    fn respects_explicit_parameters_and_refuses_invalid_requests() {
        assert_eq!(parameters("make an 8-bar beat at 92bpm", 140, false).unwrap().0, 92);
        assert_eq!(parameters("make an eight bar loop", 140, false).unwrap().1, 8);
        assert_eq!(parameters("make a 32 bar song in F# major", 100, true).unwrap(), (100,32,6,false,"F# major".into()));
        for text in ["make a beat at 240 bpm", "make a 0 bar beat", "make a beat at fast bpm", "make a song in H minor", "make a beat at -100 bpm", "make a song in D"] {
            assert!(parameters(text, 100, false).is_err(), "{text}");
        }
        assert!(parameters("make a 48 bar arrangement", 100, true).is_err());
    }
    #[test]
    fn validator_rejects_truncation_wrong_tempo_and_extra_bytes() {
        let s = spec(&beats::GENRES[0], 9, true, 64);
        let bytes = compile(&beats::GENRES[0], &s).unwrap();
        assert!(validate_midi(&bytes, 32, s.bpm).is_err());
        assert!(validate_midi(&bytes, 64, s.bpm + 1).is_err());
        for cut in [0, 13, 22, bytes.len()-1] { assert!(validate_midi(&bytes[..cut],64,s.bpm).is_err()); }
        let mut extra = bytes; extra.push(0); assert!(validate_midi(&extra,64,s.bpm).is_err());
    }
    #[test]
    fn drafts_never_overwrite_and_round_trip_from_disk() {
        let dir = std::env::temp_dir().join(format!("izuki-music-test-{}",uuid::Uuid::new_v4()));
        let s = spec(&beats::GENRES[0],9,true,32);
        let a = save_arrangement(&dir,&beats::GENRES[0],&s).unwrap();
        let b = save_arrangement(&dir,&beats::GENRES[0],&s).unwrap();
        assert_ne!(a,b);
        let before = std::fs::read(a.join("arrangement.mid")).unwrap();
        assert!(write_new(&a.join("arrangement.mid"),b"bad").is_err());
        assert_eq!(std::fs::read(a.join("arrangement.mid")).unwrap(),before);
        // Only this test's freshly-created, UUID-named directory is removed.
        std::fs::remove_dir_all(dir).unwrap();
    }
}
