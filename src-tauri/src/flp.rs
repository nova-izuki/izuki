//! Reading an FL Studio project (.flp) as it really is — not by ear: every
//! channel's name and sample file, every pattern's notes (exact, in ticks),
//! and every Playlist clip's place, length and trim. FL's scripting can't
//! see clips or sample files at all; the saved project holds all of it, so
//! Izuki can be exact even when a channel is muted or quiet.
//!
//! The file is a stream of events: an id byte, then a value — 1 byte (ids
//! 0–63), 2 bytes (64–127), 4 bytes (128–191), or a length-prefixed blob
//! (192–255). Checked against a real FL Studio 2025 project: channel 23's
//! notes and the clips' millisecond trims matched the files exactly.

use std::path::{Path, PathBuf};

use anyhow::{anyhow, bail, Result};

/// A new channel starts (its index).
const NEW_CHANNEL: u8 = 64;
/// A new pattern starts (its number).
const NEW_PATTERN: u8 = 65;
/// Pattern name (UTF-16).
const PATTERN_NAME: u8 = 193;
/// The channel's sample file (UTF-16).
const SAMPLE_PATH: u8 = 196;
/// FL's version ("25.2.…", plain text).
const VERSION: u8 = 199;
/// The channel's (or plugin's) name (UTF-16).
const NAME: u8 = 203;
/// A pattern's notes, 24 bytes each.
const NOTES: u8 = 224;
/// The Playlist's clips.
const PLAYLIST: u8 = 233;

#[derive(Debug, Clone, PartialEq)]
pub struct Channel {
    pub index: u16,
    pub name: String,
    /// As FL saved it (may start with %FLStudioFactoryData% and the like).
    pub sample: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Note {
    /// From the pattern's start, in ticks.
    pub pos: u32,
    pub len: u32,
    pub key: u16,
    /// The channel it plays.
    pub channel: u16,
    pub velocity: u8,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Pattern {
    pub number: u16,
    pub name: String,
    pub notes: Vec<Note>,
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum ClipOf {
    Pattern(u16),
    /// An audio clip: the channel playing the sample.
    Audio(u16),
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Clip {
    /// In ticks from the song's start.
    pub pos: u32,
    pub len: u32,
    /// Playlist track, from 0 at the top.
    pub track: u16,
    pub of: ClipOf,
    /// Audio clips: where in the file it starts and ends (ms); `None`: the
    /// whole file from its start.
    pub start_ms: Option<f32>,
    pub end_ms: Option<f32>,
}

#[derive(Debug, Clone, Default)]
pub struct Project {
    /// Ticks per beat.
    pub ppq: u16,
    pub version: String,
    pub channels: Vec<Channel>,
    pub patterns: Vec<Pattern>,
    pub clips: Vec<Clip>,
}

impl Project {
    pub fn channel(&self, name: &str) -> Option<&Channel> {
        let n = name.trim().to_lowercase();
        self.channels.iter().find(|c| c.name.trim().to_lowercase() == n)
    }

    /// Broken Playlist references cannot be described as successfully read music.
    /// Count each missing source once even if the song repeats its clips.
    pub fn arrangement_warnings(&self) -> Vec<String> {
        let channels: std::collections::HashSet<_> = self.channels.iter().map(|c| c.index).collect();
        let patterns: std::collections::HashMap<_, _> = self.patterns.iter().map(|p| (p.number, p)).collect();
        let mut missing_patterns = std::collections::BTreeSet::new();
        let mut missing_channels = std::collections::BTreeSet::new();
        for clip in &self.clips {
            match clip.of {
                ClipOf::Pattern(n) => match patterns.get(&n) {
                    None => { missing_patterns.insert(n); }
                    Some(pattern) => {
                        for note in pattern.notes.iter().filter(|n| n.pos < clip.len) {
                            if !channels.contains(&note.channel) { missing_channels.insert(note.channel); }
                        }
                    }
                },
                ClipOf::Audio(n) if !channels.contains(&n) => { missing_channels.insert(n); }
                _ => {}
            }
        }
        let mut warnings = Vec::new();
        if !missing_patterns.is_empty() {
            warnings.push(format!("{} pattern source(s) could not be found", missing_patterns.len()));
        }
        if !missing_channels.is_empty() {
            warnings.push(format!("{} channel source(s) could not be found", missing_channels.len()));
        }
        warnings
    }

    /// Count arranged notes in one pass without building or sorting a timeline
    /// for every channel. Repeated clips count each audible occurrence.
    pub fn song_note_counts(&self) -> std::collections::HashMap<u16, usize> {
        let patterns: std::collections::HashMap<_, _> = self.patterns.iter().map(|p| (p.number, p)).collect();
        let mut counts = std::collections::HashMap::new();
        for clip in &self.clips {
            let ClipOf::Pattern(number) = clip.of else { continue };
            let Some(pattern) = patterns.get(&number) else { continue };
            for note in pattern.notes.iter().filter(|n| n.pos < clip.len) {
                *counts.entry(note.channel).or_insert(0) += 1;
            }
        }
        counts
    }

    /// Every note `channel` plays in the song, in beats from the song's start
    /// (each pattern clip's notes, cut to the clip's length).
    pub fn song_notes(&self, channel: u16) -> Vec<(f64, Note)> {
        let ppq = f64::from(self.ppq.max(1));
        let mut out = Vec::new();
        for clip in &self.clips {
            let ClipOf::Pattern(number) = clip.of else { continue };
            let Some(p) = self.patterns.iter().find(|p| p.number == number) else { continue };
            for n in p.notes.iter().filter(|n| n.channel == channel && n.pos < clip.len) {
                let mut note = *n;
                note.len = note.len.min(clip.len - note.pos);
                out.push(((f64::from(clip.pos) + f64::from(note.pos)) / ppq, note));
            }
        }
        out.sort_by(|a, b| a.0.total_cmp(&b.0));
        out
    }
}

/// Read a saved project.
pub fn read(path: &Path) -> Result<Project> {
    parse(&std::fs::read(path)?)
}

pub fn parse(d: &[u8]) -> Result<Project> {
    let u16_at = |i: usize| d.get(i..i + 2).map(|b| u16::from_le_bytes([b[0], b[1]]));
    let u32_at = |i: usize| d.get(i..i + 4).map(|b| u32::from_le_bytes([b[0], b[1], b[2], b[3]]));
    if d.get(..4) != Some(b"FLhd") {
        bail!("not an FL Studio project");
    }
    let hlen = u32_at(4).ok_or_else(|| anyhow!("cut short"))? as usize;
    if hlen < 6 {
        bail!("invalid FL Studio project header");
    }
    let ppq = u16_at(12).ok_or_else(|| anyhow!("cut short"))?;
    if ppq == 0 {
        bail!("invalid FL Studio project timing (zero ticks per beat)");
    }
    let mut p = 8usize.checked_add(hlen).ok_or_else(|| anyhow!("a bad header length"))?;
    if d.get(p..p + 4) != Some(b"FLdt") {
        bail!("not an FL Studio project (no data)");
    }
    let dlen = u32_at(p + 4).ok_or_else(|| anyhow!("cut short"))? as usize;
    p += 8;
    let end = p.checked_add(dlen).filter(|end| *end <= d.len()).ok_or_else(|| anyhow!("project data cut short"))?;
    let mut project = Project { ppq, ..Default::default() };
    let mut channel: Option<usize> = None;
    let mut pattern: Option<usize> = None;
    while p < end {
        let id = d[p];
        p += 1;
        let width = match id { 0..=63 => 1, 64..=127 => 2, 128..=191 => 4, _ => 0 };
        if end - p < width {
            bail!("project event cut short");
        }
        match id {
            0..=63 => p += 1,
            64..=127 => {
                let v = u16_at(p).ok_or_else(|| anyhow!("cut short"))?;
                p += 2;
                match id {
                    NEW_CHANNEL => {
                        project.channels.push(Channel { index: v, name: String::new(), sample: None });
                        channel = Some(project.channels.len() - 1);
                    }
                    NEW_PATTERN => {
                        pattern = match project.patterns.iter().position(|x| x.number == v) {
                            Some(i) => Some(i),
                            None => {
                                project.patterns.push(Pattern { number: v, name: String::new(), notes: Vec::new() });
                                Some(project.patterns.len() - 1)
                            }
                        };
                    }
                    _ => {}
                }
            }
            128..=191 => p += 4,
            _ => {
                let (n, used) = varint(&d[p..end])?;
                p += used;
                let next = p.checked_add(n).filter(|next| *next <= end).ok_or_else(|| anyhow!("project event cut short"))?;
                let blob = &d[p..next];
                p = next;
                match id {
                    VERSION => project.version = String::from_utf8_lossy(blob).trim_end_matches('\0').to_string(),
                    NAME => {
                        if let Some(c) = channel.and_then(|i| project.channels.get_mut(i)) {
                            if c.name.is_empty() {
                                c.name = utf16(blob);
                            }
                        }
                    }
                    SAMPLE_PATH => {
                        if let Some(c) = channel.and_then(|i| project.channels.get_mut(i)) {
                            c.sample = Some(utf16(blob)).filter(|s| !s.is_empty());
                        }
                    }
                    PATTERN_NAME => {
                        if let Some(pt) = pattern.and_then(|i| project.patterns.get_mut(i)) {
                            pt.name = utf16(blob);
                        }
                    }
                    NOTES => {
                        if blob.len() % 24 != 0 {
                            bail!("project notes cut short");
                        }
                        if let Some(pt) = pattern.and_then(|i| project.patterns.get_mut(i)) {
                            pt.notes.extend(blob.chunks_exact(24).map(|n| Note {
                                pos: u32::from_le_bytes([n[0], n[1], n[2], n[3]]),
                                channel: u16::from_le_bytes([n[6], n[7]]),
                                len: u32::from_le_bytes([n[8], n[9], n[10], n[11]]),
                                key: u16::from_le_bytes([n[12], n[13]]),
                                velocity: n[21],
                            }));
                        }
                    }
                    PLAYLIST => {
                        if !blob.is_empty() && ![80, 60, 32].iter().any(|size| blob.len() % size == 0) {
                            bail!("project Playlist clips cut short or unsupported");
                        }
                        project.clips.extend(clips(blob));
                    },
                    _ => {}
                }
            }
        }
    }
    Ok(project)
}

/// A blob's length: 7 bits a byte, low first.
fn varint(d: &[u8]) -> Result<(usize, usize)> {
    let mut n = 0usize;
    for (i, b) in d.iter().enumerate().take(5) {
        if i == 4 && b & 0xf0 != 0 {
            bail!("a bad length in the project");
        }
        n |= ((b & 0x7f) as usize) << (7 * i);
        if b & 0x80 == 0 {
            return Ok((n, i + 1));
        }
    }
    bail!("a bad length in the project")
}

fn utf16(b: &[u8]) -> String {
    let units: Vec<u16> = b.chunks_exact(2).map(|c| u16::from_le_bytes([c[0], c[1]])).collect();
    String::from_utf16_lossy(&units).trim_end_matches('\0').to_string()
}

/// The Playlist's clips: 80 bytes each (FL 21 and later), 60 or 32 before.
fn clips(b: &[u8]) -> Vec<Clip> {
    let size = [80usize, 60, 32].into_iter().find(|s| !b.is_empty() && b.len() % s == 0).unwrap_or(32);
    b.chunks_exact(size)
        .filter_map(|r| {
            let u16_at = |i: usize| u16::from_le_bytes([r[i], r[i + 1]]);
            let u32_at = |i: usize| u32::from_le_bytes([r[i], r[i + 1], r[i + 2], r[i + 3]]);
            let f32_at = |i: usize| f32::from_le_bytes([r[i], r[i + 1], r[i + 2], r[i + 3]]);
            let (base, index) = (u16_at(4), u16_at(6));
            // FL pads the list with empty rows.
            if base == 0 && index == 0 && u32_at(8) == 0 {
                return None;
            }
            let of = if index >= base { ClipOf::Pattern(index - base) } else { ClipOf::Audio(index) };
            // -1 (or nothing sensible) means "no trim".
            let trim = |v: f32| (v.is_finite() && v >= 0.0).then_some(v);
            Some(Clip {
                pos: u32_at(0),
                len: u32_at(8),
                track: 499u16.saturating_sub(u16_at(12)),
                of,
                start_ms: if matches!(of, ClipOf::Audio(_)) { trim(f32_at(24)) } else { None },
                end_ms: if matches!(of, ClipOf::Audio(_)) { trim(f32_at(28)) } else { None },
            })
        })
        .collect()
}

/// The project FL has open: its window title names the file ("Venzyyy.flp
/// - FL Studio 2025"); FL's recent-files list, then the usual folders, say
/// where it is.
pub fn open_project() -> Result<PathBuf> {
    let title = fl_title().ok_or_else(|| anyhow!("FL Studio isn't open (or its project has no name yet — save it once)"))?;
    let name = title.split(" - FL Studio").next().unwrap_or("").trim().trim_start_matches('*').trim().to_string();
    if !name.to_lowercase().ends_with(".flp") {
        bail!("FL's project isn't saved yet — save it once (Ctrl+S) and ask again");
    }
    for path in recent_projects() {
        if path.file_name().is_some_and(|f| f.to_string_lossy().eq_ignore_ascii_case(&name)) && path.exists() {
            return Ok(path);
        }
    }
    let home = std::env::var_os("USERPROFILE").map(PathBuf::from).unwrap_or_default();
    let roots = [home.join("Downloads"), home.join("Documents"), home.join("OneDrive").join("Documents"), home.join("Desktop"), home.join("OneDrive").join("Desktop"), home.join("Music")];
    let mut found: Vec<PathBuf> = Vec::new();
    for root in roots {
        find(&root, &name, 4, &mut found);
    }
    // Not FL's own backups; the newest of the rest.
    found.retain(|p| !p.components().any(|c| c.as_os_str().eq_ignore_ascii_case("Backup")));
    found.sort_by_key(|p| std::fs::metadata(p).and_then(|m| m.modified()).ok());
    found.pop().ok_or_else(|| anyhow!("I couldn't find “{name}” on this PC"))
}

fn find(dir: &Path, name: &str, depth: u8, out: &mut Vec<PathBuf>) {
    if depth == 0 {
        return;
    }
    let Ok(entries) = std::fs::read_dir(dir) else { return };
    for e in entries.flatten() {
        let p = e.path();
        if p.is_dir() {
            find(&p, name, depth - 1, out);
        } else if p.file_name().is_some_and(|f| f.to_string_lossy().eq_ignore_ascii_case(name)) {
            out.push(p);
        }
    }
}

/// FL's recent projects (newest first), from its settings.
fn recent_projects() -> Vec<PathBuf> {
    let mut out = Vec::new();
    for version in ["FL Studio 25", "FL Studio 24", "FL Studio 21", "FL Studio 20"] {
        for i in 0..20 {
            if let Some(v) = reg_text(&format!(r"Software\Image-Line\{version}\MRU"), &i.to_string()) {
                out.push(PathBuf::from(v));
            }
        }
    }
    out
}

#[cfg(windows)]
fn reg_text(key: &str, name: &str) -> Option<String> {
    use windows::core::HSTRING;
    use windows::Win32::System::Registry::{RegGetValueW, HKEY_CURRENT_USER, RRF_RT_REG_SZ};
    let mut buf = vec![0u16; 1024];
    let mut size = (buf.len() * 2) as u32;
    let ok = unsafe {
        RegGetValueW(HKEY_CURRENT_USER, &HSTRING::from(key), &HSTRING::from(name), RRF_RT_REG_SZ, None, Some(buf.as_mut_ptr().cast()), Some(&mut size))
    };
    if ok.is_err() {
        return None;
    }
    let n = (size as usize / 2).saturating_sub(1).min(buf.len());
    Some(String::from_utf16_lossy(&buf[..n])).filter(|s| !s.is_empty())
}

#[cfg(not(windows))]
fn reg_text(_key: &str, _name: &str) -> Option<String> {
    None
}

/// FL Studio's main window title.
#[cfg(windows)]
fn fl_title() -> Option<String> {
    use windows_core::BOOL;
    use windows::Win32::Foundation::{HWND, LPARAM};
    use windows::Win32::UI::WindowsAndMessaging::{EnumWindows, GetWindowTextW, GetWindowThreadProcessId, IsWindowVisible};
    unsafe extern "system" fn each(hwnd: HWND, found: LPARAM) -> BOOL {
        unsafe {
            if !IsWindowVisible(hwnd).as_bool() {
                return BOOL(1);
            }
            let mut pid = 0u32;
            GetWindowThreadProcessId(hwnd, Some(&mut pid));
            if !crate::uia::process_name(pid).to_ascii_lowercase().starts_with("fl") {
                return BOOL(1);
            }
            let mut buf = [0u16; 512];
            let n = GetWindowTextW(hwnd, &mut buf);
            let title = String::from_utf16_lossy(&buf[..n.max(0) as usize]);
            if title.contains(" - FL Studio") {
                *(found.0 as *mut Option<String>) = Some(title);
                return BOOL(0);
            }
            BOOL(1)
        }
    }
    let mut found: Option<String> = None;
    unsafe {
        let _ = EnumWindows(Some(each), LPARAM(&mut found as *mut Option<String> as isize));
    }
    found
}

#[cfg(not(windows))]
fn fl_title() -> Option<String> {
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    fn text_event(id: u8, s: &str) -> Vec<u8> {
        let bytes: Vec<u8> = s.encode_utf16().chain(std::iter::once(0)).flat_map(|u| u.to_le_bytes()).collect();
        let mut out = vec![id, bytes.len() as u8];
        out.extend(bytes);
        out
    }

    fn note(pos: u32, channel: u16, len: u32, key: u16) -> Vec<u8> {
        let mut n = Vec::with_capacity(24);
        n.extend(pos.to_le_bytes());
        n.extend(0u16.to_le_bytes());
        n.extend(channel.to_le_bytes());
        n.extend(len.to_le_bytes());
        n.extend(key.to_le_bytes());
        n.extend([0u8; 7]);
        n.push(100); // velocity
        n.extend([0u8; 2]);
        n
    }

    fn clip(pos: u32, index: u16, len: u32, track: u16, start: f32, end: f32) -> Vec<u8> {
        let mut r = Vec::with_capacity(80);
        r.extend(pos.to_le_bytes());
        r.extend(20480u16.to_le_bytes());
        r.extend(index.to_le_bytes());
        r.extend(len.to_le_bytes());
        r.extend((499 - track).to_le_bytes());
        r.extend([0u8; 10]);
        r.extend(start.to_le_bytes());
        r.extend(end.to_le_bytes());
        r.resize(80, 0);
        r
    }

    /// A small project built byte by byte the way FL writes them.
    fn project() -> Vec<u8> {
        let mut ev = Vec::new();
        ev.extend([VERSION, 6]);
        ev.extend(b"25.2.5");
        ev.extend([NEW_CHANNEL, 7, 0]);
        ev.extend(text_event(NAME, "Kick"));
        ev.extend([NEW_CHANNEL, 23, 0]);
        ev.extend(text_event(NAME, "NM - Baby 808"));
        ev.extend(text_event(SAMPLE_PATH, r"C:\808s\NM - Baby 808.wav"));
        ev.extend([NEW_CHANNEL, 9, 0]);
        ev.extend(text_event(NAME, "Stems_instruments"));
        ev.extend(text_event(SAMPLE_PATH, r"C:\stems\instruments.wav"));
        // Pattern 7: three 808 notes and a kick.
        ev.extend([NEW_PATTERN, 7, 0]);
        let notes: Vec<u8> = [note(0, 23, 92, 53), note(368, 23, 92, 61), note(512, 23, 92, 61), note(0, 7, 24, 60)].concat();
        ev.push(NOTES);
        ev.push(notes.len() as u8 | 0x80);
        ev.push((notes.len() >> 7) as u8);
        ev.extend(notes);
        // The Playlist: pattern 7 at beat 0 and beat 16 (the second cut to
        // 4 beats), an audio clip trimmed from 498.64 ms, and an empty row.
        let rows: Vec<u8> = [
            clip(0, 20480 + 7, 16 * 96, 1, -1.0, -1.0),
            clip(16 * 96, 20480 + 7, 4 * 96, 1, -1.0, -1.0),
            clip(0, 9, 130 * 96, 3, 498.64, 112326.53),
            vec![0u8; 80],
        ]
        .concat();
        ev.push(PLAYLIST);
        ev.push(rows.len() as u8 | 0x80);
        ev.push((rows.len() >> 7) as u8);
        ev.extend(rows);
        let mut d = Vec::new();
        d.extend(b"FLhd");
        d.extend(6u32.to_le_bytes());
        d.extend(0i16.to_le_bytes());
        d.extend(3u16.to_le_bytes());
        d.extend(96u16.to_le_bytes());
        d.extend(b"FLdt");
        d.extend((ev.len() as u32).to_le_bytes());
        d.extend(ev);
        d
    }

    #[test]
    fn reads_channels_notes_and_clips_as_fl_writes_them() {
        let p = parse(&project()).unwrap();
        assert_eq!((p.ppq, p.version.as_str()), (96, "25.2.5"));
        let b = p.channel("nm - baby 808").expect("the 808");
        assert_eq!((b.index, b.sample.as_deref()), (23, Some(r"C:\808s\NM - Baby 808.wav")));
        let pat = &p.patterns[0];
        assert_eq!((pat.number, pat.notes.len()), (7, 4));
        assert_eq!(pat.notes[1], Note { pos: 368, len: 92, key: 61, channel: 23, velocity: 100 });
        assert_eq!(p.clips.len(), 3, "the empty row isn't a clip");
        assert_eq!(p.clips[2], Clip { pos: 0, len: 130 * 96, track: 3, of: ClipOf::Audio(9), start_ms: Some(498.64), end_ms: Some(112326.53) });
        assert_eq!(p.clips[0].start_ms, None);
        // In the song: beat 0, 3.83, 5.33 — and the second clip, cut to 4
        // beats, plays only the notes inside it (not the one at 5.33).
        let at: Vec<f64> = p.song_notes(23).iter().map(|(b, _)| (b * 1000.0).round() / 1000.0).collect();
        assert_eq!(at, vec![0.0, 3.833, 5.333, 16.0, 19.833]);
    }

    #[test]
    fn says_what_isnt_a_project() {
        assert!(parse(b"RIFF....").is_err());
        assert!(parse(b"FLhd").is_err());
    }

    #[test]
    fn warns_about_missing_sources_without_counting_repeated_clips_twice() {
        let mut p = parse(&project()).unwrap();
        assert!(p.arrangement_warnings().is_empty());
        p.patterns.clear();
        p.channels.retain(|c| c.index != 9);
        assert_eq!(p.arrangement_warnings(), vec![
            "1 pattern source(s) could not be found",
            "1 channel source(s) could not be found",
        ]);
        let mut p = parse(&project()).unwrap();
        p.channels.retain(|c| c.index != 23);
        assert_eq!(p.arrangement_warnings(), vec!["1 channel source(s) could not be found"]);
        p.clips.retain(|c| !matches!(c.of, ClipOf::Pattern(_)));
        assert!(p.arrangement_warnings().is_empty(), "unarranged drafts do not affect the overview");
    }

    #[test]
    fn fast_note_counts_match_arranged_timelines() {
        let p = parse(&project()).unwrap();
        let counts = p.song_note_counts();
        for channel in &p.channels {
            assert_eq!(counts.get(&channel.index).copied().unwrap_or(0), p.song_notes(channel.index).len());
        }
        assert_eq!(counts.get(&23), Some(&5));
        assert_eq!(counts.get(&7), Some(&2));
    }

    #[test]
    fn large_arrangement_counts_match_without_building_each_timeline() {
        let mut p = Project { ppq: 96, ..Default::default() };
        for channel in 0..128 {
            p.channels.push(Channel { index: channel, name: format!("Part {channel}"), sample: None });
        }
        for number in 0..64 {
            p.patterns.push(Pattern { number, name: String::new(), notes: (0..128).map(|i| Note {
                pos: u32::from(i) * 24, len: 24, key: 60, channel: (number + i) % 128, velocity: 100,
            }).collect() });
        }
        for i in 0..512u32 {
            p.clips.push(Clip { pos: i * 3072, len: if i % 2 == 0 { 1536 } else { 3072 }, track: 0,
                of: ClipOf::Pattern((i % 64) as u16), start_ms: None, end_ms: None });
        }
        let start = std::time::Instant::now();
        let expected: Vec<_> = p.channels.iter().map(|c| (c.index, p.song_notes(c.index).len())).collect();
        let old_time = start.elapsed();
        let start = std::time::Instant::now();
        let counts = p.song_note_counts();
        let new_time = start.elapsed();
        for (channel, count) in expected {
            assert_eq!(counts.get(&channel).copied().unwrap_or(0), count);
        }
        eprintln!("128 channels, 512 clips: timelines {old_time:?}; single-pass counts {new_time:?}");
    }

    #[test]
    fn rejects_every_truncated_project() {
        let d = project();
        for end in 0..d.len() {
            assert!(parse(&d[..end]).is_err(), "accepted truncation at {end}");
        }
    }

    fn with_events(events: &[u8]) -> Vec<u8> {
        let mut d = project()[..22].to_vec();
        d[18..22].copy_from_slice(&(events.len() as u32).to_le_bytes());
        d.extend_from_slice(events);
        d
    }

    #[test]
    fn events_cannot_read_past_declared_data_into_trailing_bytes() {
        for event in [vec![0], vec![64, 0], vec![128, 0, 0, 0], vec![NAME, 4, 0, 0]] {
            let mut d = with_events(&event);
            d.extend_from_slice(&[0; 16]);
            assert!(parse(&d).is_err());
        }
        assert!(parse(&with_events(&[NEW_PATTERN, 1, 0, NOTES, 1, 0])).is_err());
        assert!(parse(&with_events(&[PLAYLIST, 1, 0])).is_err());
        assert!(varint(&[255, 255, 255, 255, 16]).is_err());
        assert_eq!(varint(&[255, 255, 255, 255, 15]).unwrap(), (u32::MAX as usize, 5));
        assert!(parse(&with_events(&[NAME, 255, 255, 255, 255, 255])).is_err());
    }

    #[test]
    fn invalid_header_and_timing_are_rejected() {
        let mut d = project();
        d[4..8].copy_from_slice(&0u32.to_le_bytes());
        assert!(parse(&d).is_err());
        let mut d = project();
        d[12..14].copy_from_slice(&0u16.to_le_bytes());
        assert!(parse(&d).is_err());
    }

    #[test]
    fn song_notes_clip_tails_and_do_not_overflow_long_timelines() {
        let mut p = parse(&project()).unwrap();
        p.clips.truncate(1);
        p.clips[0].pos = u32::MAX;
        p.clips[0].len = 400;
        let notes = p.song_notes(23);
        assert_eq!(notes.len(), 2);
        assert_eq!(notes[1].1.len, 32);
        assert_eq!(notes[1].0, (f64::from(u32::MAX) + 368.0) / 96.0);
    }

    /// A real project: `IZUKI_FLP=<path> cargo test --lib real_project -- --ignored --nocapture`.
    #[test]
    #[ignore]
    fn real_project() {
        let path = std::env::var("IZUKI_FLP").expect("IZUKI_FLP");
        let p = read(Path::new(&path)).unwrap();
        eprintln!("FL {} · ppq {} · {} channels · {} patterns · {} clips", p.version, p.ppq, p.channels.len(), p.patterns.len(), p.clips.len());
        for c in &p.channels {
            eprintln!("  ch {:2} {:40} {}", c.index, c.name, c.sample.as_deref().unwrap_or(""));
        }
        assert!(p.channels.len() > 1 && !p.clips.is_empty());
    }
}
