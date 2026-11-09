//! A durable "keep going" checkpoint.
//!
//! A long task can stop because the screen locked, a step needs a fresh look,
//! or the app is closing. The agent already keeps the objective and the work
//! completed so far in memory. This module writes that small record to the
//! user's own data folder before the process can disappear, and reads it back
//! on the next start. It is a checkpoint, not a replay script: nothing runs
//! until the user says "keep going".

use std::io::{self, Write};
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

const VERSION: u8 = 1;
const FILE: &str = "unfinished-task.json";
const MAX_OBJECTIVE: usize = 4_000;
const MAX_DONE: usize = 64;
const MAX_DONE_ITEM: usize = 400;
const MAX_FILE_BYTES: u64 = 256 * 1024;
/// A checkpoint older than this isn't what anyone means by "keep going" now:
/// resuming it would hand the screen to a task from another day.
pub const MAX_AGE_MS: i64 = 6 * 60 * 60 * 1000;

/// Too old to resume, or stamped by a clock that has since moved a long way.
pub fn expired(task: &SavedTask, now_ms: i64) -> bool {
    let age = now_ms.saturating_sub(task.stopped_at);
    !(-MAX_AGE_MS..=MAX_AGE_MS).contains(&age)
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct SavedTask {
    pub version: u8,
    pub objective: String,
    #[serde(default)]
    pub done: Vec<String>,
    /// Unix milliseconds when the task stopped.
    pub stopped_at: i64,
}

pub fn path(root: &Path) -> PathBuf {
    root.join(FILE)
}

fn valid(task: &SavedTask) -> bool {
    task.version == VERSION
        && !task.objective.trim().is_empty()
        && task.objective.chars().count() <= MAX_OBJECTIVE
        && task.done.len() <= MAX_DONE
        && task.done.iter().all(|item| item.chars().count() <= MAX_DONE_ITEM)
}

fn clean(objective: &str, done: &[String]) -> Option<(String, Vec<String>)> {
    let objective = objective.trim();
    if objective.is_empty() {
        return None;
    }
    let objective = objective.chars().take(MAX_OBJECTIVE).collect::<String>();
    let done = done
        .iter()
        .map(|item| item.trim())
        .filter(|item| !item.is_empty())
        .take(MAX_DONE)
        .map(|item| item.chars().take(MAX_DONE_ITEM).collect::<String>())
        .collect();
    Some((objective, done))
}

/// Save the one waiting task. An empty objective clears the checkpoint: there
/// is nothing useful to resume. The old file is only replaced after the new
/// bytes are safely on disk.
pub fn save(root: &Path, objective: &str, done: &[String]) -> io::Result<()> {
    let Some((objective, done)) = clean(objective, done) else {
        return clear(root);
    };
    let task = SavedTask {
        version: VERSION,
        objective,
        done,
        stopped_at: chrono::Utc::now().timestamp_millis(),
    };
    let bytes = serde_json::to_vec(&task).map_err(io::Error::other)?;
    std::fs::create_dir_all(root)?;
    let destination = path(root);
    let temporary = destination.with_extension("json.tmp");
    let mut file = std::fs::File::create(&temporary)?;
    file.write_all(&bytes)?;
    file.sync_all()?;
    drop(file);
    std::fs::rename(&temporary, &destination).inspect_err(|_| {
        let _ = std::fs::remove_file(&temporary);
    })
}

/// Read a checkpoint if it is complete, current and within its bounds. A
/// corrupt or truncated file is ignored, never guessed at.
pub fn load(root: &Path) -> Option<SavedTask> {
    let file = std::fs::File::open(path(root)).ok()?;
    let metadata = file.metadata().ok()?;
    if !metadata.is_file() || metadata.len() > MAX_FILE_BYTES {
        return None;
    }
    let bytes = std::fs::read(path(root)).ok()?;
    let task: SavedTask = serde_json::from_slice(&bytes).ok()?;
    valid(&task).then_some(task)
}

/// Remove the checkpoint, if present. Only the checkpoint file is touched.
pub fn clear(root: &Path) -> io::Result<()> {
    match std::fs::remove_file(path(root)) {
        Ok(()) => Ok(()),
        Err(error) if error.kind() == io::ErrorKind::NotFound => Ok(()),
        Err(error) => Err(error),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn fixture() -> PathBuf {
        let id = uuid::Uuid::new_v4();
        std::env::temp_dir().join(format!("izuki-resume-test-{id}"))
    }

    #[test]
    fn a_task_and_its_completed_work_survive_a_restart() {
        let root = fixture();
        save(&root, "Find the assignment and save a summary", &["Opened the browser".into(), "Found the course".into()]).unwrap();
        let saved = load(&root).unwrap();
        assert_eq!(saved.objective, "Find the assignment and save a summary");
        assert_eq!(saved.done, vec!["Opened the browser".to_string(), "Found the course".to_string()]);
        assert_eq!(saved.version, 1);
        assert!(saved.stopped_at > 0);
        std::fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn a_new_checkpoint_replaces_the_old_one_atomically() {
        let root = fixture();
        save(&root, "First task", &["one".into()]).unwrap();
        save(&root, "Second task", &["two".into()]).unwrap();
        let saved = load(&root).unwrap();
        assert_eq!(saved.objective, "Second task");
        assert_eq!(saved.done, vec!["two".to_string()]);
        assert!(!root.join("unfinished-task.json.tmp").exists());
        std::fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn an_empty_task_clears_the_checkpoint() {
        let root = fixture();
        save(&root, "Do the thing", &[]).unwrap();
        save(&root, "   ", &[]).unwrap();
        assert!(load(&root).is_none());
        clear(&root).unwrap();
        std::fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn a_corrupt_or_oversized_file_is_never_guessed_at() {
        let root = fixture();
        std::fs::create_dir_all(&root).unwrap();
        std::fs::write(path(&root), b"{not-json").unwrap();
        assert!(load(&root).is_none());
        std::fs::write(path(&root), vec![b'x'; (MAX_FILE_BYTES + 1) as usize]).unwrap();
        assert!(load(&root).is_none());
        let wrong_version = SavedTask { version: 99, objective: "Old".into(), done: vec![], stopped_at: 1 };
        std::fs::write(path(&root), serde_json::to_vec(&wrong_version).unwrap()).unwrap();
        assert!(load(&root).is_none());
        std::fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn a_checkpoint_from_another_day_has_expired() {
        let task = |stopped_at| SavedTask { version: 1, objective: "Old".into(), done: vec![], stopped_at };
        let now = 1_800_000_000_000;
        assert!(!expired(&task(now - 60_000), now), "a minute ago resumes");
        assert!(!expired(&task(now - MAX_AGE_MS), now), "right at the limit resumes");
        assert!(expired(&task(now - MAX_AGE_MS - 1), now), "past the limit doesn't");
        assert!(expired(&task(now - 3 * 24 * 60 * 60 * 1000), now), "days ago doesn't");
        assert!(expired(&task(now + MAX_AGE_MS + 1), now), "a clock that jumped back a long way doesn't");
    }

    #[test]
    fn the_objective_and_completed_list_are_bounded() {
        let root = fixture();
        let long = "word ".repeat(1_000);
        let done: Vec<String> = (0..100).map(|i| format!("{i}-{}", "x".repeat(800))).collect();
        save(&root, &long, &done).unwrap();
        let saved = load(&root).unwrap();
        assert_eq!(saved.objective.chars().count(), MAX_OBJECTIVE);
        assert_eq!(saved.done.len(), MAX_DONE);
        assert!(saved.done.iter().all(|item| item.chars().count() <= MAX_DONE_ITEM));
        std::fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn clearing_removes_only_the_named_checkpoint() {
        let root = fixture();
        std::fs::create_dir_all(&root).unwrap();
        std::fs::write(root.join("keep.txt"), "unrelated").unwrap();
        save(&root, "Task", &[]).unwrap();
        clear(&root).unwrap();
        assert_eq!(std::fs::read_to_string(root.join("keep.txt")).unwrap(), "unrelated");
        assert!(!path(&root).exists());
        std::fs::remove_dir_all(root).unwrap();
    }
}
