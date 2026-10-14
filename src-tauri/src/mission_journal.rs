//! Append-only execution metadata. A synced start record must exist before
//! an operation runs. This is evidence for inspection, never a replay script.
use std::{fs::{File, OpenOptions}, io::{self, Write}, path::{Path, PathBuf}, sync::{Arc, atomic::{AtomicBool, Ordering}}};
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};

const MAX_STEPS: u64 = 300;
const MAX_BYTES: u64 = 1_048_576;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EvidenceKind { DesktopAction, ConnectedTool }

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EvidenceOutcome { InFlight, Returned, Failed, Unknown }

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Evidence {
    pub sequence: u64,
    pub kind: EvidenceKind,
    /// A tool slug or action enum, never arguments, body text, URLs or errors.
    pub operation: String,
    /// Opaque connection ID only; email addresses and credentials are excluded.
    pub account: Option<String>,
    pub started_at: i64,
    pub finished_at: Option<i64>,
    pub outcome: EvidenceOutcome,
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "event", rename_all = "snake_case")]
enum Event {
    Started { evidence: Evidence },
    Finished { sequence: u64, at: i64, outcome: EvidenceOutcome },
}

#[derive(Debug, Default)]
pub struct Report { pub evidence: Vec<Evidence>, pub incomplete: bool }

struct Writer { file: File, next: u64, bytes: u64 }

pub struct Journal {
    writer: Mutex<Writer>,
    failed: AtomicBool,
    max_steps: u64,
}

pub fn path(root: &Path, id: &str) -> io::Result<PathBuf> {
    let id = uuid::Uuid::parse_str(id).map_err(|_| io::Error::new(io::ErrorKind::InvalidInput, "invalid mission ID"))?;
    Ok(root.join(format!("{id}.jsonl")))
}

pub fn remove(root: &Path, id: &str) -> io::Result<()> {
    match std::fs::remove_file(path(root, id)?) {
        Err(e) if e.kind() == io::ErrorKind::NotFound => Ok(()),
        result => result,
    }
}

fn identifier(s: &str) -> bool {
    !s.is_empty() && s.len() <= 128 && s.bytes().all(|b| b.is_ascii_alphanumeric() || b == b'_' || b == b'-')
}

impl Journal {
    pub fn create(root: &Path, id: &str) -> io::Result<Self> {
        let path = path(root, id)?;
        std::fs::create_dir_all(root)?;
        let file = OpenOptions::new().create_new(true).write(true).open(path)?;
        file.sync_all()?;
        Ok(Self { writer: Mutex::new(Writer { file, next: 1, bytes: 0 }), failed: AtomicBool::new(false), max_steps: MAX_STEPS })
    }

    pub fn healthy(&self) -> bool { !self.failed.load(Ordering::SeqCst) }

    fn append(&self, writer: &mut Writer, event: &Event) -> io::Result<()> {
        if !self.healthy() { return Err(io::Error::other("execution journal is unavailable")); }
        let result = (|| {
            let mut line = serde_json::to_vec(event).map_err(io::Error::other)?;
            line.push(b'\n');
            if writer.bytes + line.len() as u64 > MAX_BYTES { return Err(io::Error::other("execution journal reached its size limit")); }
            writer.file.write_all(&line)?;
            writer.file.sync_data()?;
            writer.bytes += line.len() as u64;
            if let Some(app) = crate::state::app() {
                use tauri::Emitter;
                let _ = app.emit(crate::missions::CHANGED, ());
            }
            Ok(())
        })();
        if result.is_err() { self.failed.store(true, Ordering::SeqCst); }
        result
    }

    pub fn begin(self: &Arc<Self>, kind: EvidenceKind, operation: &str, account: Option<&str>) -> io::Result<Step> {
        if !identifier(operation) || account.is_some_and(|a| !identifier(a)) {
            self.failed.store(true, Ordering::SeqCst);
            return Err(io::Error::new(io::ErrorKind::InvalidInput, "invalid execution metadata"));
        }
        let mut writer = self.writer.lock();
        if writer.next > self.max_steps {
            self.failed.store(true, Ordering::SeqCst);
            return Err(io::Error::other("execution journal reached its step limit"));
        }
        let sequence = writer.next;
        self.append(&mut writer, &Event::Started { evidence: Evidence {
            sequence, kind, operation: operation.into(), account: account.map(str::to_string),
            started_at: chrono::Utc::now().timestamp_millis(), finished_at: None, outcome: EvidenceOutcome::InFlight,
        } })?;
        writer.next += 1;
        Ok(Step { journal: self.clone(), sequence, finished: false })
    }
}

pub struct Step { journal: Arc<Journal>, sequence: u64, finished: bool }

impl Step {
    pub fn finish(mut self, outcome: EvidenceOutcome) -> io::Result<()> {
        // Mark first: a failed completion write must not trigger a second write
        // in Drop which might hide the original persistence failure.
        self.finished = true;
        let outcome = if outcome == EvidenceOutcome::InFlight { EvidenceOutcome::Unknown } else { outcome };
        let mut writer = self.journal.writer.lock();
        self.journal.append(&mut writer, &Event::Finished { sequence: self.sequence, at: chrono::Utc::now().timestamp_millis(), outcome })
    }
}

impl Drop for Step {
    fn drop(&mut self) {
        if !self.finished {
            let mut writer = self.journal.writer.lock();
            let _ = self.journal.append(&mut writer, &Event::Finished { sequence: self.sequence, at: chrono::Utc::now().timestamp_millis(), outcome: EvidenceOutcome::Unknown });
        }
    }
}

pub fn read(root: &Path, id: &str) -> io::Result<Report> {
    use std::io::Read;
    let file = File::open(path(root, id)?)?;
    // Bound the read even if another process grows/replaces the file.
    let mut bytes = Vec::new();
    file.take(MAX_BYTES + 1).read_to_end(&mut bytes)?;
    if bytes.len() as u64 > MAX_BYTES { return Err(io::Error::other("execution journal is too large")); }
    Ok(decode(&bytes))
}

fn decode(bytes: &[u8]) -> Report {
    let mut report = Report::default();
    for line in bytes.split_inclusive(|b| *b == b'\n') {
        // A torn final record cannot be evidence that an operation finished.
        if line.last() != Some(&b'\n') { report.incomplete = true; break; }
        let Ok(event) = serde_json::from_slice::<Event>(line) else { report.incomplete = true; break };
        match event {
            Event::Started { evidence } if evidence.sequence == report.evidence.len() as u64 + 1
                && evidence.sequence <= MAX_STEPS && identifier(&evidence.operation)
                && evidence.account.as_deref().is_none_or(identifier)
                && evidence.outcome == EvidenceOutcome::InFlight && evidence.finished_at.is_none() => report.evidence.push(evidence),
            Event::Finished { sequence, at, outcome } if outcome != EvidenceOutcome::InFlight => {
                let Some(e) = sequence.checked_sub(1).and_then(|i| usize::try_from(i).ok()).and_then(|i| report.evidence.get_mut(i)) else { report.incomplete = true; break };
                if e.finished_at.is_some() { report.incomplete = true; break; }
                e.finished_at = Some(at); e.outcome = outcome;
            }
            _ => { report.incomplete = true; break; }
        }
    }
    report
}

#[cfg(test)]
mod tests {
    use super::*;
    fn fixture() -> (PathBuf, String) {
        let id = uuid::Uuid::new_v4().to_string();
        let root = std::env::temp_dir().join(format!("izuki-journal-test-{id}"));
        (root, id)
    }

    #[test]
    fn real_disk_records_distinguish_returned_failed_and_unknown_operations() {
        let (root, id) = fixture();
        let journal = Arc::new(Journal::create(&root, &id).unwrap());
        let step = journal.begin(EvidenceKind::ConnectedTool, "GMAIL_FETCH_EMAILS", Some("ca_fixture")).unwrap();
        assert_eq!(read(&root, &id).unwrap().evidence[0].outcome, EvidenceOutcome::InFlight);
        step.finish(EvidenceOutcome::Returned).unwrap();
        journal.begin(EvidenceKind::DesktopAction, "Click", None).unwrap().finish(EvidenceOutcome::Failed).unwrap();
        drop(journal.begin(EvidenceKind::ConnectedTool, "GMAIL_GET_PROFILE", None).unwrap());
        let r = read(&root, &id).unwrap();
        assert!(!r.incomplete);
        assert_eq!(r.evidence.iter().map(|e| e.outcome).collect::<Vec<_>>(), [EvidenceOutcome::Returned, EvidenceOutcome::Failed, EvidenceOutcome::Unknown]);
        assert!(Journal::create(&root, &id).is_err(), "existing evidence must not be overwritten");
        drop(journal); std::fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn deleting_a_journal_is_limited_to_the_named_mission_file() {
        let (root, id) = fixture();
        drop(Journal::create(&root, &id).unwrap());
        std::fs::write(root.join("keep.txt"), "unrelated").unwrap();
        assert!(remove(&root, "../keep.txt").is_err());
        remove(&root, &id).unwrap();
        assert_eq!(std::fs::read_to_string(root.join("keep.txt")).unwrap(), "unrelated");
        assert!(!path(&root, &id).unwrap().exists());
        std::fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn torn_completion_retains_the_start_and_never_invents_success() {
        let (root, id) = fixture();
        let journal = Arc::new(Journal::create(&root, &id).unwrap());
        let step = journal.begin(EvidenceKind::ConnectedTool, "GMAIL_SEND_EMAIL", None).unwrap();
        let mut bytes = std::fs::read(path(&root, &id).unwrap()).unwrap();
        bytes.extend_from_slice(b"{\"event\":\"finished\",\"sequence\":1");
        let r = decode(&bytes);
        assert!(r.incomplete);
        assert_eq!(r.evidence[0].outcome, EvidenceOutcome::InFlight);
        drop(step); drop(journal); std::fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn failed_start_write_blocks_dispatch_and_latches_the_failure() {
        let (root, id) = fixture();
        let journal = Arc::new(Journal::create(&root, &id).unwrap());
        journal.writer.lock().file = File::open(path(&root, &id).unwrap()).unwrap(); // read-only handle
        assert!(journal.begin(EvidenceKind::DesktopAction, "Click", None).is_err());
        assert!(!journal.healthy());
        assert!(journal.begin(EvidenceKind::DesktopAction, "Type", None).is_err());
        assert!(read(&root, &id).unwrap().evidence.is_empty());
        drop(journal); std::fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn step_limits_and_identifier_validation_prevent_unbounded_or_private_logs() {
        let (root, id) = fixture();
        assert!(Journal::create(&root, "../outside").is_err());
        let mut journal = Journal::create(&root, &id).unwrap(); journal.max_steps = 1;
        let journal = Arc::new(journal);
        journal.begin(EvidenceKind::ConnectedTool, "GMAIL_FETCH_EMAILS", None).unwrap().finish(EvidenceOutcome::Returned).unwrap();
        assert!(journal.begin(EvidenceKind::DesktopAction, "Click", None).is_err());
        assert!(!identifier("body=private text"));
        assert!(!identifier("someone@example.com"));
        drop(journal); std::fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn worker_threads_append_ordered_records_to_one_journal() {
        let (root, id) = fixture();
        let journal = Arc::new(Journal::create(&root, &id).unwrap());
        let jobs: Vec<_> = (0..4).map(|_| { let j = journal.clone(); std::thread::spawn(move || j.begin(EvidenceKind::ConnectedTool, "GMAIL_GET_PROFILE", None).unwrap().finish(EvidenceOutcome::Returned).unwrap()) }).collect();
        for job in jobs { job.join().unwrap(); }
        let r = read(&root, &id).unwrap();
        assert!(!r.incomplete); assert_eq!(r.evidence.len(), 4);
        assert!(r.evidence.iter().all(|e| e.outcome == EvidenceOutcome::Returned));
        drop(journal); std::fs::remove_dir_all(root).unwrap();
    }
}
