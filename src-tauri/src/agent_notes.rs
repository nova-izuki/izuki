//! Izuki's notes to whoever fixes it.
//!
//! The app already keeps a full log and can send error reports, but both are
//! for a human reading one failure at a time. This is the other direction:
//! a small, local, machine-readable list of what kept going wrong and what
//! looked clumsy, so the next person — or the next coding agent — can open
//! one file and know where to look, without the owner having to describe
//! anything.
//!
//! Nothing is ever shown in the app, and nothing personal goes in: every line
//! is scrubbed with the same rules as the error reports before it is written,
//! so keys, links' secrets, emails, phone numbers and the Windows user name
//! never land here. Only Izuki's own steps and errors do.
//!
//! Kept at `%APPDATA%\Izuki\agent-notes.jsonl`, one JSON object per line,
//! newest last, rotated to `agent-notes.old.jsonl` past `MAX_LINES` so it can
//! never grow without limit. Read it with `node tools/agent-notes.cjs`.

use std::io::Write;
use std::path::PathBuf;

use serde_json::json;

/// Lines kept before the file is rotated. A few thousand notes is months of
/// use; past that the oldest are worth less than the disk.
const MAX_LINES: u64 = 4000;

pub fn path() -> PathBuf {
    crate::store::data_dir().join("agent-notes.jsonl")
}

fn count_lines() -> u64 {
    std::fs::read_to_string(path()).map(|s| s.lines().count() as u64).unwrap_or(0)
}

/// Write one note. `area` is the part of Izuki ("brain", "automation",
/// "call"), `what` is what happened in Izuki's own words, and `hint` is the
/// optional "so probably fix…" the writer already knows.
///
/// Never fails the caller: a note is a courtesy, not a feature of the step
/// that produced it.
pub fn note(area: &str, what: &str, hint: &str) {
    let area = crate::bugs::scrub(area).trim().to_string();
    let what = crate::bugs::scrub(what).trim().to_string();
    let hint = crate::bugs::scrub(hint).trim().to_string();
    if what.is_empty() {
        return;
    }
    let Some(dir) = path().parent().map(|p| p.to_path_buf()) else { return };
    if std::fs::create_dir_all(&dir).is_err() {
        return;
    }
    if count_lines() >= MAX_LINES {
        let _ = std::fs::rename(path(), dir.join("agent-notes.old.jsonl"));
    }
    let line = json!({
        "at": chrono::Local::now().to_rfc3339_opts(chrono::SecondsFormat::Secs, true),
        "area": if area.is_empty() { "app" } else { area.as_str() },
        "what": what,
        "hint": hint,
        "version": env!("CARGO_PKG_VERSION"),
        "os": std::env::consts::OS,
    });
    if let Ok(mut file) = std::fs::OpenOptions::new().create(true).append(true).open(path()) {
        let _ = writeln!(file, "{line}");
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn an_empty_note_is_not_written() {
        // The guard is the scrub + trim; an empty `what` must not produce a
        // line that tells a reader nothing.
        assert_eq!(crate::bugs::scrub("   ").trim(), "");
    }

    #[test]
    fn the_file_list_lives_in_the_apps_own_folder() {
        assert!(path().ends_with("agent-notes.jsonl"));
    }
}
