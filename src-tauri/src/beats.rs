//! Beat starter: "make me an afrobeats drum pattern at 108 bpm" writes a real
//! MIDI file — the genre's groove, swung and slightly off the grid with
//! changing velocities like a person played it, a fill to end the loop —
//! ready to drag into FL Studio, Ableton or any music app. No AI, instant,
//! and exact: the notes land where they should, which dragging them in by
//! hand on a canvas never does.

use std::path::PathBuf;

/// General MIDI drum notes (channel 10).
const KICK: u8 = 36;
const SNARE: u8 = 38;
const RIM: u8 = 37;
const CLAP: u8 = 39;
const HAT: u8 = 42;
const OPEN_HAT: u8 = 46;
const SHAKER: u8 = 82;
const CONGA_HI: u8 = 63;
const CONGA_MUTE: u8 = 62;
const CONGA_LO: u8 = 64;
const COWBELL: u8 = 56;
const RIDE: u8 = 51;
const CRASH: u8 = 49;
const TOM_HI: u8 = 48;
const TOM_LO: u8 = 45;

/// One genre: its tempo, swing, and a bar of 16 steps per instrument
/// ("x" hit, "X" accent, "g" ghost, "." rest; 32 characters = a half-time
/// two-bar phrase).
pub struct Genre {
    pub key: &'static str,
    pub name: &'static str,
    says: &'static [&'static str],
    pub bpm: u32,
    /// How late the off-beat 16ths come (0 = straight, 0.33 = full shuffle).
    swing: f32,
    /// How far notes wander off the grid, in ticks (a 16th is 24).
    loose: i32,
    parts: &'static [(u8, &'static str)],
    /// The drum that plays the fill at the end of the loop.
    fill: &'static [u8],
}

pub const GENRES: &[Genre] = &[
    Genre {
        key: "afrobeats", name: "Afrobeats", says: &["afrobeats", "afrobeat", "afro beat", "afro pop", "afropop", "naija"], bpm: 105, swing: 0.12, loose: 4,
        parts: &[
            (KICK, "X.....x.x.....x."), (RIM, "...x..x....x..x."), (CLAP, "....X.......X..."),
            (SHAKER, "gxgXgxgXgxgXgxgX"), (CONGA_HI, "..x.x..x..x.x..x"), (CONGA_MUTE, "......x.......x."), (CONGA_LO, "x......x.......x"),
        ],
        fill: &[CONGA_HI, CONGA_LO],
    },
    Genre {
        key: "amapiano", name: "Amapiano", says: &["amapiano", "piano piano", "log drum"], bpm: 113, swing: 0.1, loose: 3,
        parts: &[
            (KICK, "X...x...X...x..."), (CLAP, "....x.......x..."), (SHAKER, "gxgxgXgxgxgXgxgx"),
            (RIM, "..x...x.x.x...x."), (OPEN_HAT, "..x...x...x...x."), (CONGA_LO, "..x...x...xx..x."),
        ],
        fill: &[RIM, CONGA_LO],
    },
    Genre {
        key: "afrohouse", name: "Afro house", says: &["afro house", "afrohouse", "afro tech"], bpm: 122, swing: 0.06, loose: 3,
        parts: &[
            (KICK, "X...X...X...X..."), (CLAP, "....x.......x..."), (OPEN_HAT, "..x...x...x...x."),
            (SHAKER, "gxgxgxgxgxgxgxgx"), (CONGA_HI, "x..x..x...x..x.."), (COWBELL, "x.x..x.x..x..x.x"),
        ],
        fill: &[CONGA_HI, CONGA_LO],
    },
    Genre {
        key: "highlife", name: "Highlife", says: &["highlife", "high life"], bpm: 120, swing: 0.08, loose: 4,
        parts: &[
            (KICK, "x.......x......."), (COWBELL, "x.x.xx.x.x.x.xx."), (SHAKER, "xxxxxxxxxxxxxxxx"),
            (CONGA_HI, "..x...x...x...x."), (CONGA_LO, "x.....x.x.....x."), (RIM, "....x.......x..."),
        ],
        fill: &[CONGA_HI, CONGA_LO],
    },
    Genre {
        key: "trap", name: "Trap", says: &["trap"], bpm: 140, swing: 0.0, loose: 2,
        parts: &[
            (KICK, "X.........x..x..X.....x...x....."), (CLAP, "........X...............X......."),
            (HAT, "x.x.x.x.x.x.xxx.x.x.x.x.xxxxx.x."), (OPEN_HAT, "..............x...............x."),
        ],
        fill: &[HAT],
    },
    Genre {
        key: "drill", name: "Drill", says: &["drill", "uk drill", "ny drill"], bpm: 142, swing: 0.0, loose: 2,
        parts: &[
            (KICK, "X.....x.......x...x.....x......."), (SNARE, "......X.........X......X........"),
            (HAT, "x..x..x.x..x..x.x..x..x.x..x.x.x"),
        ],
        fill: &[SNARE],
    },
    Genre {
        key: "boombap", name: "Boom bap", says: &["boom bap", "boombap", "hip hop", "hiphop", "hip-hop", "rap", "old school"], bpm: 90, swing: 0.2, loose: 5,
        parts: &[(KICK, "X......x..x....."), (SNARE, "....X.......X..g"), (HAT, "x.x.x.x.x.x.x.x.")],
        fill: &[SNARE],
    },
    Genre {
        key: "lofi", name: "Lo-fi", says: &["lofi", "lo-fi", "lo fi", "chill"], bpm: 80, swing: 0.28, loose: 7,
        parts: &[(KICK, "X......x.x......"), (SNARE, "....x.......x..."), (HAT, "x.xgx.x.x.xgx.x."), (RIM, "..........g.....")],
        fill: &[RIM],
    },
    Genre {
        key: "rnb", name: "R&B", says: &["r&b", "rnb", "r and b", "soul", "neo soul"], bpm: 75, swing: 0.18, loose: 5,
        parts: &[(KICK, "X......x..x....."), (SNARE, "....X..g....X..."), (HAT, "xgxgxgxgxgxgxgxg"), (RIM, "...g.......g....")],
        fill: &[TOM_HI, TOM_LO],
    },
    Genre {
        key: "gospel", name: "Gospel", says: &["gospel", "praise", "worship"], bpm: 78, swing: 0.2, loose: 5,
        parts: &[(KICK, "X.....x...x....."), (SNARE, "....X..g....X.gg"), (HAT, "xgxgxgxgxgxgxgxg"), (RIDE, "x...x...x...x...")],
        fill: &[SNARE, TOM_HI, TOM_LO],
    },
    Genre {
        key: "house", name: "House", says: &["house", "deep house", "tech house"], bpm: 124, swing: 0.04, loose: 2,
        parts: &[(KICK, "X...X...X...X..."), (CLAP, "....x.......x..."), (OPEN_HAT, "..x...x...x...x."), (HAT, "xgxgxgxgxgxgxgxg")],
        fill: &[CLAP],
    },
    Genre {
        key: "reggaeton", name: "Reggaeton", says: &["reggaeton", "dembow", "latin", "perreo"], bpm: 95, swing: 0.0, loose: 3,
        parts: &[(KICK, "X...X...X...X..."), (SNARE, "...x..x....x..x."), (HAT, "x.x.x.x.x.x.x.x."), (RIM, "...g..g....g..g.")],
        fill: &[SNARE],
    },
    Genre {
        key: "dancehall", name: "Dancehall", says: &["dancehall", "dance hall", "riddim"], bpm: 100, swing: 0.05, loose: 3,
        parts: &[(KICK, "X..x..x.X..x..x."), (SNARE, "....X.......X..."), (HAT, "x.xxx.xxx.xxx.xx"), (RIM, "..x.....x.....x.")],
        fill: &[SNARE],
    },
    Genre {
        key: "dnb", name: "Drum & bass", says: &["drum and bass", "drum & bass", "dnb", "jungle"], bpm: 174, swing: 0.0, loose: 2,
        parts: &[(KICK, "X.........X....."), (SNARE, "....X.......X..."), (HAT, "x.x.x.x.x.x.x.x."), (RIDE, "x...x...x...x...")],
        fill: &[SNARE],
    },
    Genre {
        key: "jerseyclub", name: "Jersey club", says: &["jersey club", "jersey", "club beat"], bpm: 140, swing: 0.0, loose: 2,
        parts: &[(KICK, "X..x..x.X.x.x.x."), (CLAP, "....x.......x..."), (HAT, "x.x.x.x.x.x.x.x.")],
        fill: &[KICK],
    },
    Genre {
        key: "pop", name: "Pop", says: &["pop"], bpm: 118, swing: 0.0, loose: 3,
        parts: &[(KICK, "X.......X.x....."), (SNARE, "....X.......X..."), (HAT, "x.x.x.x.x.x.x.x.")],
        fill: &[TOM_HI, TOM_LO],
    },
    Genre {
        key: "rock", name: "Rock", says: &["rock", "punk"], bpm: 120, swing: 0.0, loose: 4,
        parts: &[(KICK, "X.......XX......"), (SNARE, "....X.......X..."), (HAT, "x.x.x.x.x.x.x.x.")],
        fill: &[TOM_HI, SNARE, TOM_LO],
    },
];

/// "Make me an afrobeats drum pattern at 108 bpm" → the genre and the tempo
/// (the genre's own when none is said). None when it isn't a beat request.
pub fn parse(said: &str) -> Option<(&'static Genre, u32)> {
    let s = format!(" {} ", said.to_lowercase().replace(['-', '_'], " "));
    let wants = ["beat", "drum", "drums", "groove", "rhythm", "pattern", "loop", "midi"].iter().any(|w| s.contains(&format!(" {w}")));
    let make = ["make", "create", "give me", "generate", "write", "build", "start", "cook", "program"].iter().any(|w| s.contains(w));
    if !wants || !make {
        return None;
    }
    let padded = s.replace("hip-hop", "hip hop");
    let genre = GENRES
        .iter()
        .flat_map(|g| g.says.iter().map(move |w| (g, *w)))
        .filter(|(_, w)| padded.contains(&format!(" {w} ")) || padded.contains(&format!(" {w}s ")))
        .max_by_key(|(_, w)| w.len())
        .map(|(g, _)| g)?;
    let bpm = s
        .split_whitespace()
        .collect::<Vec<_>>()
        .windows(2)
        .find_map(|w| (w[1].starts_with("bpm")).then(|| w[0].parse::<u32>().ok()).flatten())
        .or_else(|| s.split_whitespace().find_map(|w| w.strip_suffix("bpm").and_then(|n| n.parse::<u32>().ok())))
        .filter(|b| (50..=200).contains(b))
        .unwrap_or(genre.bpm);
    Some((genre, bpm))
}

const PPQ: u32 = 96;
const STEP: u32 = PPQ / 4;

/// The loop as notes: (tick, note, velocity, length), `bars` long.
fn notes(g: &Genre, bars: u32, seed: u32) -> Vec<(u32, u8, u8, u32)> {
    let mut s = seed.max(1);
    let mut rnd = move || {
        s ^= s << 13;
        s ^= s >> 17;
        s ^= s << 5;
        (s % 10_000) as f32 / 10_000.0
    };
    let mut out = Vec::new();
    for (drum, pattern) in g.parts {
        let steps: Vec<char> = pattern.chars().collect();
        let len = steps.len().max(1) as u32;
        let total = bars * 16;
        for step in 0..total {
            let bar = step / 16;
            // The last half-bar of the loop is the fill.
            if bar == bars - 1 && step % 16 >= 12 && !g.fill.is_empty() {
                continue;
            }
            let c = steps[(step % len) as usize];
            let vel: f32 = match c {
                'X' => 118.0,
                'x' => 96.0,
                'g' => 52.0,
                _ => continue,
            };
            let mut tick = step * STEP;
            if step % 2 == 1 {
                tick += (g.swing * STEP as f32) as u32;
            }
            // Off the grid like a person: a few ticks early or late.
            let nudge = ((rnd() - 0.5) * 2.0 * g.loose as f32) as i32;
            let tick = (tick as i32 + nudge).max(0) as u32;
            let vel = (vel + (rnd() - 0.5) * 16.0).clamp(30.0, 127.0) as u8;
            out.push((tick, *drum, vel, STEP / 2));
        }
    }
    // The fill: 16ths rising in loudness over the last four steps, then a crash on top.
    let start = (bars * 16 - 4) * STEP;
    for i in 0..8u32 {
        let drum = g.fill[(i as usize / 2) % g.fill.len()];
        let vel = (70 + i * 7).min(124) as u8;
        out.push((start + i * STEP / 2, drum, vel, STEP / 3));
    }
    out.push((0, CRASH, 100, STEP));
    out.sort_by_key(|n| n.0);
    out
}

fn vlq(mut v: u32, out: &mut Vec<u8>) {
    let mut bytes = vec![(v & 0x7f) as u8];
    v >>= 7;
    while v > 0 {
        bytes.push(((v & 0x7f) as u8) | 0x80);
        v >>= 7;
    }
    bytes.reverse();
    out.extend(bytes);
}

/// A standard MIDI file (type 0): tempo, a track name, the drums on channel 10.
pub fn midi(g: &Genre, bpm: u32, bars: u32, seed: u32) -> Vec<u8> {
    let mut events: Vec<(u32, Vec<u8>)> = Vec::new();
    let tempo = 60_000_000 / bpm.max(1);
    events.push((0, vec![0xff, 0x51, 0x03, (tempo >> 16) as u8, (tempo >> 8) as u8, tempo as u8]));
    events.push((0, vec![0xff, 0x58, 0x04, 4, 2, 24, 8]));
    let name = format!("{} drums {bpm} BPM", g.name);
    let mut meta = vec![0xff, 0x03];
    vlq(name.len() as u32, &mut meta);
    meta.extend(name.as_bytes());
    events.push((0, meta));
    for (tick, note, vel, len) in notes(g, bars, seed) {
        events.push((tick, vec![0x99, note, vel]));
        events.push((tick + len, vec![0x89, note, 0]));
    }
    // Note-offs before note-ons at the same tick; then end the track on the bar line.
    events.sort_by_key(|(t, e)| (*t, e[0] != 0x89));
    let end = bars * 16 * STEP;
    let mut track = Vec::new();
    let mut last = 0;
    for (t, e) in events {
        let t = t.min(end);
        vlq(t - last, &mut track);
        track.extend(e);
        last = t;
    }
    vlq(end - last, &mut track);
    track.extend([0xff, 0x2f, 0x00]);

    let mut f = b"MThd".to_vec();
    f.extend(6u32.to_be_bytes());
    f.extend(0u16.to_be_bytes());
    f.extend(1u16.to_be_bytes());
    f.extend((PPQ as u16).to_be_bytes());
    f.extend(b"MTrk");
    f.extend((track.len() as u32).to_be_bytes());
    f.extend(track);
    f
}

/// Where beats go: Music\Izuki Beats.
fn folder() -> PathBuf {
    let home = std::env::var("USERPROFILE").or_else(|_| std::env::var("HOME")).unwrap_or_else(|_| ".".into());
    PathBuf::from(home).join("Music").join("Izuki Beats")
}

/// Make the beat, save it, show it in File Explorer, and say what to do next.
pub fn make(said: &str) -> Option<String> {
    let (g, bpm) = parse(said)?;
    let bars = if said.contains("8 bar") || said.contains("eight bar") { 8 } else { 4 };
    let seed = (crate::model::now_ms() % 1_000_000) as u32;
    let dir = folder();
    if std::fs::create_dir_all(&dir).is_err() {
        return Some("I couldn't make a folder for the beat in your Music folder.".into());
    }
    let stamp = chrono::Local::now().format("%H%M%S");
    let path = dir.join(format!("{} {bpm}bpm {stamp}.mid", g.name.replace('&', "and")));
    if std::fs::write(&path, midi(g, bpm, bars, seed)).is_err() {
        return Some("I couldn't save the beat.".into());
    }
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        let _ = std::process::Command::new("explorer.exe").arg(format!("/select,{}", path.display())).creation_flags(0x0800_0000).spawn();
    }
    Some(format!(
        "Made a {bars}-bar {} drum groove at {bpm} BPM — swung and slightly off the grid like a real player, with a fill at the end. It's in Music › Izuki Beats (open in File Explorer now): drag it onto your Playlist or a channel in FL Studio, or into any music app, and set the project to {bpm} BPM. Ask again for a fresh variation.",
        g.name
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hears_beat_requests_in_any_genre() {
        let (g, bpm) = parse("make me an afrobeats drum pattern at 110 bpm").expect("afrobeats");
        assert_eq!((g.key, bpm), ("afrobeats", 110));
        assert_eq!(parse("create a trap beat").map(|(g, b)| (g.key, b)), Some(("trap", 140)));
        assert_eq!(parse("give me a boom bap drum loop at 92bpm").map(|(g, b)| (g.key, b)), Some(("boombap", 92)));
        assert_eq!(parse("make an afro house groove").map(|(g, _)| g.key), Some("afrohouse"));
        assert_eq!(parse("make a reggaeton beat").map(|(g, _)| g.key), Some("reggaeton"));
        assert!(parse("what is a trap beat").is_none());
        assert!(parse("make a house reservation").is_none());
    }

    #[test]
    fn writes_a_valid_midi_file_for_every_genre() {
        for g in GENRES {
            let f = midi(g, g.bpm, 4, 7);
            assert_eq!(&f[..4], b"MThd", "{}", g.key);
            assert_eq!(&f[14..18], b"MTrk", "{}", g.key);
            let len = u32::from_be_bytes([f[18], f[19], f[20], f[21]]) as usize;
            assert_eq!(f.len(), 22 + len, "{}: track length", g.key);
            assert!(f.ends_with(&[0xff, 0x2f, 0x00]), "{}: end of track", g.key);
            let hits = notes(g, 4, 7);
            assert!(hits.len() > 20, "{}: has a groove", g.key);
            assert!(hits.iter().all(|n| n.0 < 4 * 16 * STEP + STEP), "{}: inside the loop", g.key);
        }
    }
}
