//! Any music producer app, not just FL Studio: which DAW is open (or named
//! in the request), and how to bring Izuki's MIDI draft into it. Izuki never
//! opens the file in the DAW itself — that can replace the open project —
//! it shows the file, ready to drag in, and says where it goes.

pub struct Daw {
    pub name: &'static str,
    /// Process names, lower case without ".exe": exact, or a prefix if it ends in `*`.
    exes: &'static [&'static str],
    /// What you'd call it ("ableton", "pro tools").
    says: &'static [&'static str],
    /// How a MIDI file goes into a project there.
    pub import: &'static str,
}

const DAWS: &[Daw] = &[
    Daw { name: "Ableton Live", exes: &["ableton live*"], says: &["ableton"], import: "drag the .mid file into Arrangement View, onto a MIDI track" },
    Daw { name: "FL Studio", exes: &["fl64", "fl"], says: &["fl studio", "fruity loops", "fruityloops"], import: "drag the .mid file into the Playlist or the Channel rack" },
    Daw { name: "REAPER", exes: &["reaper"], says: &["reaper"], import: "drag the .mid file onto a track, or use Insert, then Media file" },
    Daw { name: "Studio One", exes: &["studio one*"], says: &["studio one"], import: "drag the .mid file onto the arrangement, under the other tracks" },
    Daw { name: "Cubase", exes: &["cubase*", "nuendo*"], says: &["cubase", "nuendo"], import: "use File, then Import, then MIDI File, or drag it onto the project" },
    Daw { name: "Bitwig Studio", exes: &["bitwig*"], says: &["bitwig"], import: "drag the .mid file onto a track in the Arranger" },
    Daw { name: "Cakewalk", exes: &["cakewalk", "sonar"], says: &["cakewalk", "sonar"], import: "use File, then Import, then MIDI, or drag it onto a track" },
    Daw { name: "Pro Tools", exes: &["protools*"], says: &["pro tools", "protools"], import: "use File, then Import, then MIDI" },
    Daw { name: "Reason", exes: &["reason"], says: &["reason studios", "in reason", "on reason", "with reason"], import: "use File, then Import MIDI File" },
    Daw { name: "LMMS", exes: &["lmms"], says: &["lmms"], import: "use Project, then Import — it opens as a new project, so save yours first" },
    Daw { name: "Waveform", exes: &["waveform*"], says: &["waveform"], import: "drag the .mid file onto a track" },
    Daw { name: "Ardour", exes: &["ardour*"], says: &["ardour"], import: "use Session, then Import (Ctrl+I)" },
    Daw { name: "MPC", exes: &["mpc", "mpc beats"], says: &["mpc"], import: "drag the .mid file onto a track, or use File, then Import" },
];

impl Daw {
    /// Is this process (an exe name) this DAW?
    pub fn matches_process(&self, exe: &str) -> bool {
        process_matches(self, exe)
    }
}

fn process_matches(d: &Daw, name: &str) -> bool {
    let n = name.trim().to_lowercase();
    let n = n.strip_suffix(".exe").unwrap_or(&n);
    d.exes.iter().any(|e| match e.strip_suffix('*') { Some(prefix) => n.starts_with(prefix), None => n == *e })
}

/// The DAW the request names ("make a trap beat in Ableton").
pub fn named(said: &str) -> Option<&'static Daw> {
    // Words only, so "in Ableton?" or "on reaper!" still match — whole words.
    let words: String = said.to_lowercase().chars().map(|c| if c.is_alphanumeric() { c } else { ' ' }).collect();
    let s = format!(" {} ", words.split_whitespace().collect::<Vec<_>>().join(" "));
    DAWS.iter().find(|d| d.says.iter().any(|w| s.contains(&format!(" {w} "))))
}

/// The first DAW among these running processes.
fn running_in(names: &[String]) -> Option<&'static Daw> {
    DAWS.iter().find(|d| names.iter().any(|n| process_matches(d, n)))
}

/// The DAW that's open right now, if any.
pub fn running() -> Option<&'static Daw> {
    running_in(&crate::boost::running_names())
}

/// Show `file` selected in File Explorer, ready to drag into the DAW.
pub fn reveal(file: &std::path::Path) {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        let _ = std::process::Command::new("explorer")
            .raw_arg(format!("/select,\"{}\"", file.display()))
            .spawn();
    }
    #[cfg(not(windows))]
    let _ = file;
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn knows_daws_by_name() {
        assert_eq!(named("make a trap beat in Ableton").map(|d| d.name), Some("Ableton Live"));
        assert_eq!(named("drill beat for pro tools please").map(|d| d.name), Some("Pro Tools"));
        assert_eq!(named("open fl studio and make a beat").map(|d| d.name), Some("FL Studio"));
        assert_eq!(named("make an afrobeats loop on reaper.").map(|d| d.name), Some("REAPER"));
        assert_eq!(named("can you make a beat in Ableton?").map(|d| d.name), Some("Ableton Live"));
        assert_eq!(named("drill beat on reaper!").map(|d| d.name), Some("REAPER"));
        assert!(named("make a beat for no reason").is_none());
        assert!(named("make a beat in abletonish").is_none());
        assert!(named("make a trap beat").is_none());
    }

    #[test]
    fn knows_daws_by_process() {
        let has = |p: &str| running_in(&[p.to_string()]).map(|d| d.name);
        assert_eq!(has("Ableton Live 12 Suite.exe"), Some("Ableton Live"));
        assert_eq!(has("FL64.exe"), Some("FL Studio"));
        assert_eq!(has("reaper.exe"), Some("REAPER"));
        assert_eq!(has("Studio One.exe"), Some("Studio One"));
        assert_eq!(has("Cubase14.exe"), Some("Cubase"));
        assert_eq!(has("Cubase 14.exe"), Some("Cubase"));
        assert_eq!(has("mpc-hc64.exe"), None); // the video player, not Akai's MPC
        assert_eq!(has("flow.exe"), None);
        assert_eq!(has("chrome.exe"), None);
    }
}
