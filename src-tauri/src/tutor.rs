//! The terminal tutor: "teach me how to code on CMD" becomes a real lesson,
//! not "opens CMD, types dir, stops".
//!
//! What went wrong before (log, Oct 14): the screen agent opened CMD, then
//! every command it wanted to show was held back (commands only run when the
//! user spells them out), so it could only talk about `cls` — and it stopped.
//! A lesson can't be a screen agent guessing keystrokes.
//!
//! So a lesson here is a fixed, tested path, one concept a step:
//! say what the command does → run it for real (in a practice folder, with
//! its real output and exit code captured) → explain what actually came back
//! → next. A CMD window opens in the same practice folder for the user to
//! try things themselves, and "check my work" looks at the folder to see
//! whether they really did the exercise. Progress is kept on disk, so
//! "next", "explain again", "check my work", "start over" and "stop the
//! lesson" work across messages, voice, the phone and Discord.
//!
//! Nothing outside `%USERPROFILE%\IzukiPractice` is ever touched.

use std::path::{Path, PathBuf};
use std::time::Duration;

use parking_lot::Mutex;
use serde::{Deserialize, Serialize};

/// Which shell the lesson is in.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "lowercase")]
pub enum Shell {
    #[default]
    Cmd,
    PowerShell,
}

impl Shell {
    fn name(self) -> &'static str {
        match self {
            Shell::Cmd => "CMD (Command Prompt)",
            Shell::PowerShell => "PowerShell",
        }
    }
}

/// Where the lesson is, kept between messages.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Progress {
    pub active: bool,
    pub shell: Shell,
    /// The step shown last.
    pub step: usize,
    /// The folder the lesson is "in", inside the practice folder ("" = its top).
    pub cwd: String,
    /// When it was last used (ms).
    pub at: i64,
}

/// One thing a step does for real.
enum Act {
    /// Nothing to run (an explanation, or something to try yourself).
    None,
    /// Run this line in the lesson folder; then the folder may change.
    Run { line: &'static str, then_cwd: Option<&'static str> },
    /// Write a small file into the lesson folder, then run a line.
    WriteAndRun { file: &'static str, body: &'static str, line: &'static str },
}

/// One step of a lesson.
struct Step {
    title: &'static str,
    /// Before it runs: what it is and what to expect.
    before: &'static str,
    act: Act,
    /// After: what the result means. `{out}` is the real output.
    after: &'static str,
    /// An exercise the user does; checked with `check`.
    exercise: Option<Exercise>,
}

struct Exercise {
    /// What to do, in words.
    task: &'static str,
    /// Inside the practice folder, this must exist afterwards.
    must_exist: &'static str,
    /// A folder (true) or a file (false).
    is_dir: bool,
}

const CMD: &[Step] = &[
    Step {
        title: "What CMD is",
        before: "CMD (Command Prompt) is a window where you give Windows instructions by typing instead of clicking. It isn't a programming language — it's where you run commands, and later scripts and programs like Python. The demonstrations run in the background in IzukiPractice, and their real output appears here. The practice window is for you to type commands yourself. The line that ends in > is the prompt: it shows which folder you're in, and waits for a command. First command: “cd” on its own, which prints the folder you're in.",
        act: Act::Run { line: "cd", then_cwd: None },
        after: "It printed: {out}\nThat's your current folder — the same path the prompt shows.",
        exercise: None,
    },
    Step {
        title: "dir — what's in this folder",
        before: "“dir” lists everything in the current folder. It only looks; it never changes anything.",
        act: Act::Run { line: "dir", then_cwd: None },
        after: "Here's what came back:\n{out}\nA line with <DIR> is a folder; a number there instead is a file's size in bytes. “.” means this folder and “..” the one above it. The last lines count the files and show the free space on the drive.",
        exercise: None,
    },
    Step {
        title: "mkdir — make a folder",
        before: "“mkdir notes” makes a new folder called notes, right here. Making a folder never deletes anything.",
        act: Act::Run { line: "mkdir notes", then_cwd: None },
        after: "{out}\nNow there's a folder called notes in IzukiPractice — “dir” would show it with <DIR>. (If it says it already exists, that's from last time, and it's harmless.)",
        exercise: None,
    },
    Step {
        title: "cd — go into a folder",
        before: "“cd notes” moves you into the notes folder. “cd ..” goes back up one folder. Then plain “cd” shows where you are now.",
        act: Act::Run { line: "cd notes && cd", then_cwd: Some("notes") },
        after: "It printed: {out}\nYou're inside notes now — when you type this yourself, the CMD prompt changes to show it.",
        exercise: None,
    },
    Step {
        title: "echo — write text (and into a file)",
        before: "“echo” prints text back. Add > and a file name and the text goes into that file instead of the screen. Careful: > replaces what was in the file; >> adds to the end.",
        act: Act::Run { line: "echo Hello from Izuki> hello.txt && dir /b", then_cwd: None },
        after: "The folder now has: {out}\nThat file holds the line “Hello from Izuki”.",
        exercise: None,
    },
    Step {
        title: "type — read a file",
        before: "“type hello.txt” shows what's inside a text file.",
        act: Act::Run { line: "type hello.txt", then_cwd: None },
        after: "It printed: {out}\nThat's exactly what echo wrote into it.",
        exercise: None,
    },
    Step {
        title: "cls — clear the screen",
        before: "“cls” clears the CMD window so it's tidy again. It only wipes what's on the screen — it doesn't delete any files. Try it now in the CMD window: type cls and press Enter.",
        act: Act::None,
        after: "",
        exercise: None,
    },
    Step {
        title: "Your first script",
        before: "A batch file (.bat) is a list of commands that run in order — your first program. I'm writing greet.bat with four lines:\n@echo off — don't print each command, just the results\nset name=friend — a variable called name\necho Hello, %name%! — %name% is replaced by its value\nif exist hello.txt echo hello.txt is here too. — a decision\nThen I run it with .\\greet.bat (the .\\ means the one in this folder).",
        act: Act::WriteAndRun {
            file: "greet.bat",
            body: "@echo off\r\nset name=friend\r\necho Hello, %name%!\r\nif exist hello.txt echo hello.txt is here too.\r\n",
            line: ".\\greet.bat",
        },
        after: "It printed:\n{out}\nThat's variables (set, %name%) and a decision (if exist) — the same ideas every programming language has.",
        exercise: None,
    },
    Step {
        title: "Your turn",
        before: "Your turn, in the CMD window: go to IzukiPractice first (use “cd ..” if you are in notes), make a folder called projects with “mkdir projects”, then go into it with “cd projects”. Say “check my work” when you're done.",
        act: Act::None,
        after: "",
        exercise: Some(Exercise { task: "make a folder called projects in IzukiPractice", must_exist: "projects", is_dir: true }),
    },
];

const POWERSHELL: &[Step] = &[
    Step {
        title: "What PowerShell is",
        before: "PowerShell is Windows' newer command window — like CMD, but its commands work with objects, and they're named verb-noun (Get-ChildItem, Set-Location). The demonstrations run in the background in IzukiPractice, with their real output shown here. The practice window is for you to type commands yourself. First: “Get-Location”, which shows the folder you're in.",
        act: Act::Run { line: "Get-Location | Select-Object -ExpandProperty Path", then_cwd: None },
        after: "It printed: {out}\nThat's your current folder.",
        exercise: None,
    },
    Step {
        title: "Get-ChildItem — what's here",
        before: "“Get-ChildItem” (short: ls or dir) lists what's in the folder. It only looks.",
        act: Act::Run { line: "Get-ChildItem | Format-Table Mode, Name, Length -AutoSize | Out-String -Width 100", then_cwd: None },
        after: "Here's what came back:\n{out}\nMode starting with d means a folder; Length is a file's size in bytes.",
        exercise: None,
    },
    Step {
        title: "New-Item — make a folder",
        before: "“New-Item -ItemType Directory notes” makes a folder called notes (mkdir notes works too).",
        act: Act::Run { line: "New-Item -ItemType Directory -Force notes | Select-Object -ExpandProperty Name", then_cwd: None },
        after: "It made: {out}",
        exercise: None,
    },
    Step {
        title: "Set-Location — go into it",
        before: "“Set-Location notes” (short: cd notes) moves into the folder.",
        act: Act::Run { line: "Set-Location notes; Get-Location | Select-Object -ExpandProperty Path", then_cwd: Some("notes") },
        after: "You're now in: {out}",
        exercise: None,
    },
    Step {
        title: "Set-Content / Get-Content — write and read a file",
        before: "“Set-Content hello.txt 'Hello from Izuki'” writes a file (it replaces what's there); “Get-Content hello.txt” reads it back.",
        act: Act::Run { line: "Set-Content hello.txt 'Hello from Izuki'; Get-Content hello.txt", then_cwd: None },
        after: "It read back: {out}",
        exercise: None,
    },
    Step {
        title: "Clear-Host — clear the screen",
        before: "“Clear-Host” (short: cls) clears the window — it doesn't delete anything. Try it now in the PowerShell window.",
        act: Act::None,
        after: "",
        exercise: None,
    },
    Step {
        title: "Your turn",
        before: "Your turn, in the PowerShell window: go to IzukiPractice first (use “cd ..” if you are in notes), then “mkdir projects” and “cd projects”. Say “check my work” when you're done.",
        act: Act::None,
        after: "",
        exercise: Some(Exercise { task: "make a folder called projects in IzukiPractice", must_exist: "projects", is_dir: true }),
    },
];

fn steps(shell: Shell) -> &'static [Step] {
    match shell {
        Shell::Cmd => CMD,
        Shell::PowerShell => POWERSHELL,
    }
}

/// `%USERPROFILE%\IzukiPractice` — the only place a lesson changes.
pub fn practice_dir() -> PathBuf {
    dirs::home_dir().unwrap_or_else(std::env::temp_dir).join("IzukiPractice")
}

fn state_path() -> Option<PathBuf> {
    dirs::config_dir().map(|d| d.join("Izuki").join("tutor.json"))
}

static PROGRESS: Mutex<Option<Progress>> = Mutex::new(None);

fn load() -> Progress {
    if let Some(p) = PROGRESS.lock().clone() {
        return p;
    }
    let p: Progress = state_path().and_then(|p| std::fs::read_to_string(p).ok()).and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default();
    *PROGRESS.lock() = Some(p.clone());
    p
}

fn save(p: &Progress) {
    *PROGRESS.lock() = Some(p.clone());
    if let Some(path) = state_path() {
        let _ = std::fs::create_dir_all(path.parent().unwrap_or(Path::new(".")));
        let tmp = path.with_extension("json.tmp");
        if std::fs::write(&tmp, serde_json::to_string_pretty(p).unwrap_or_default()).is_ok() {
            let _ = std::fs::rename(&tmp, &path);
        }
    }
}

fn now() -> i64 {
    chrono::Utc::now().timestamp_millis()
}

/// A lesson used in the last three hours.
fn live(p: &Progress) -> bool {
    p.active && now() - p.at < 3 * 60 * 60 * 1000
}

/// Used in the last twenty minutes: only then do bare words like "next" or
/// "again" belong to the lesson (later they mean something else).
fn recent(p: &Progress) -> bool {
    p.active && now() - p.at < 20 * 60 * 1000
}

// ---------------------------------------------------------------------------
// Understanding the request
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, PartialEq)]
pub enum Ask {
    Start(Shell),
    Next,
    Again,
    Check,
    TryIt,
    Challenge,
    Restart,
    Stop,
    Where,
}

/// "Teach me how to code on CMD" → a lesson; and while one is going,
/// "next", "explain again", "check my work"…
pub fn parse(said: &str) -> Option<Ask> {
    let s = format!(" {} ", said.to_lowercase().replace(['?', '!', '.', ','], " ").split_whitespace().collect::<Vec<_>>().join(" "));
    let learn = [" teach", " learn", " lesson", " tutorial", " show me how", " how do i use", " how to use", " how to code", " walk me through", " get started with", " basics of", " tutor"]
        .iter()
        .any(|w| s.contains(w));
    let ps = s.contains("powershell");
    let cmd = [" cmd ", "command prompt", "command line", " terminal", " batch ", " the console", " cmd"].iter().any(|w| s.contains(w));
    if learn && (ps || cmd) {
        return Some(Ask::Start(if ps { Shell::PowerShell } else { Shell::Cmd }));
    }
    let p = load();
    if !live(&p) {
        return None;
    }
    let fresh = recent(&p);
    // Only short follow-ups count while a lesson is on.
    let t = s.trim();
    if t.split_whitespace().count() > 7 {
        return None;
    }
    let is = |ws: &[&str]| ws.iter().any(|w| is_followup(t, w));
    if is(&["stop the lesson", "end the lesson", "stop teaching", "end lesson", "stop lesson", "quit the lesson", "that's enough", "thats enough"]) {
        return Some(Ask::Stop);
    }
    if is(&["start over", "restart", "from the beginning", "start again", "restart the lesson"]) {
        return Some(Ask::Restart);
    }
    if is(&["check my work", "check it", "i did it", "did i do it right", "did it work", "check my answer"]) {
        return Some(Ask::Check);
    }
    if !fresh {
        // A while later, only clearly lesson-shaped words count.
        if is(&["explain again"]) {
            return Some(Ask::Again);
        }
        return is(&["next step", "continue the lesson", "next lesson step"]).then_some(Ask::Next);
    }
    if is(&["explain again", "explain that", "again", "repeat", "repeat that", "say that again", "go slower", "slower", "what does that mean", "i don't get it", "i dont get it", "huh"]) {
        return Some(Ask::Again);
    }
    if is(&["let me try", "can i try", "my turn"]) {
        return Some(Ask::TryIt);
    }
    if is(&["give me a challenge", "challenge me", "test me", "quiz me"]) {
        return Some(Ask::Challenge);
    }
    if is(&["where are we", "where was i", "what step", "what are we on"]) {
        return Some(Ask::Where);
    }
    if is(&["next", "continue", "go on", "keep going", "next step", "next one", "ok next", "okay next", "show me the next step", "go ahead", "do it for me", "type again", "now type again", "carry on"]) {
        return Some(Ask::Next);
    }
    None
}

fn is_followup(text: &str, phrase: &str) -> bool {
    text == phrase || text == format!("{phrase} please") || text == format!("please {phrase}")
}

// ---------------------------------------------------------------------------
// Doing it
// ---------------------------------------------------------------------------

/// What a command really printed, and its exit code.
pub struct Ran {
    pub out: String,
    pub code: Option<i32>,
}

/// Run one line in `dir`, with a time limit, never showing a window.
fn run(shell: Shell, line: &str, dir: &Path) -> std::io::Result<Ran> {
    use std::process::{Command, Stdio};
    let mut c = match shell {
        Shell::Cmd => {
            let mut c = Command::new("cmd");
            c.args(["/D", "/C", line]);
            c
        }
        Shell::PowerShell => {
            let mut c = Command::new("powershell");
            c.args(["-NoProfile", "-NonInteractive", "-Command", &format!("$ErrorActionPreference = 'Stop'; {line}")]);
            c
        }
    };
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        c.creation_flags(0x0800_0000); // no window
    }
    let mut child = c.current_dir(dir).stdin(Stdio::null()).stdout(Stdio::piped()).stderr(Stdio::piped()).spawn()?;
    let started = std::time::Instant::now();
    loop {
        if let Some(status) = child.try_wait()? {
            let o = child.wait_with_output()?;
            let mut out = String::from_utf8_lossy(&o.stdout).to_string();
            let err = String::from_utf8_lossy(&o.stderr).to_string();
            if !err.trim().is_empty() {
                out.push_str(&err);
            }
            return Ok(Ran { out: tidy(&out), code: status.code() });
        }
        if started.elapsed() > Duration::from_secs(20) {
            let _ = child.kill();
            let _ = child.wait();
            return Err(std::io::Error::new(std::io::ErrorKind::TimedOut, "the command took longer than 20 seconds"));
        }
        std::thread::sleep(Duration::from_millis(50));
    }
}

/// Output fit for a chat bubble: no blank runs, at most 14 lines.
fn tidy(out: &str) -> String {
    let lines: Vec<&str> = out.lines().map(str::trim_end).filter(|l| !l.trim().is_empty()).collect();
    if lines.len() > 14 {
        format!("{}\n… ({} more lines)", lines[..14].join("\n"), lines.len() - 14)
    } else {
        lines.join("\n")
    }
}

/// The lesson folder for `p`, made if missing.
fn folder(p: &Progress) -> PathBuf {
    let root = practice_dir();
    let _ = std::fs::create_dir_all(&root);
    let d = if p.cwd.is_empty() { root.clone() } else { root.join(&p.cwd) };
    if d.starts_with(&root) && d.is_dir() {
        d
    } else {
        root
    }
}

static WINDOW: Mutex<Option<std::process::Child>> = Mutex::new(None);

/// One visible window in the practice folder to try things in — opened once
/// and reused while it's open (never a new one per step).
fn open_window(shell: Shell) -> bool {
    let mut w = WINDOW.lock();
    if let Some(child) = w.as_mut() {
        if matches!(child.try_wait(), Ok(None)) {
            return false;
        }
    }
    let root = practice_dir();
    let _ = std::fs::create_dir_all(&root);
    let mut c = match shell {
        Shell::Cmd => {
            let mut c = std::process::Command::new("cmd");
            c.args(["/K", "title Izuki practice - CMD"]);
            c
        }
        Shell::PowerShell => {
            let mut c = std::process::Command::new("powershell");
            c.args(["-NoExit", "-NoProfile", "-Command", "$Host.UI.RawUI.WindowTitle = 'Izuki practice - PowerShell'"]);
            c
        }
    };
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        c.creation_flags(0x0000_0010); // its own console window
    }
    match c.current_dir(&root).spawn() {
        Ok(child) => {
            *w = Some(child);
            true
        }
        Err(e) => {
            eprintln!("[tutor] couldn't open the {} window: {e}", shell.name());
            false
        }
    }
}

/// Show step `i`: say what it does, really do it, explain the real result.
fn cwd_before(shell: Shell, i: usize) -> String {
    steps(shell)[..i].iter().filter_map(|s| match s.act {
        Act::Run { then_cwd, .. } => then_cwd,
        _ => None,
    }).collect::<Vec<_>>().join("\\")
}

fn show(p: &mut Progress, i: usize) -> String {
    let all = steps(p.shell);
    let Some(step) = all.get(i) else {
        p.active = false;
        save(p);
        return format!(
            "That's the {} basics done ✅ — folders, files, echo, type, cls and your first script. Next you could try “teach me PowerShell”, or start a real language like Python. Your practice files stay in IzukiPractice.",
            p.shell.name()
        );
    };
    // Each demonstration starts in its own expected folder. Repeating a cd
    // step must not try to enter notes/notes, or leave later steps there.
    p.cwd = cwd_before(p.shell, i);
    p.step = i;
    p.at = now();
    let head = format!("Step {} of {} — {}\n{}", i + 1, all.len(), step.title, step.before);
    let result = match &step.act {
        Act::None => String::new(),
        Act::Run { line, then_cwd } => match run(p.shell, line, &folder(p)) {
            Ok(r) => {
                if let Some(c) = then_cwd {
                    if r.code == Some(0) && folder(p).join(c).is_dir() {
                        p.cwd = if p.cwd.is_empty() { (*c).to_string() } else { format!("{}\\{c}", p.cwd) };
                    }
                }
                explain(step, &r)
            }
            Err(e) => format!("I tried “{line}”, but it didn't run: {e}. Say “again” and I'll try once more."),
        },
        Act::WriteAndRun { file, body, line } => {
            let dir = folder(p);
            match std::fs::write(dir.join(file), body) {
                Ok(()) => match run(p.shell, line, &dir) {
                    Ok(r) => explain(step, &r),
                    Err(e) => format!("I wrote {file}, but running it failed: {e}."),
                },
                Err(e) => format!("I couldn't write {file}: {e}."),
            }
        }
    };
    save(p);
    let tail = if i + 1 < all.len() && step.exercise.is_none() { "\nSay “next” to keep going, “let me try” to do it yourself, or “explain again”." } else { "" };
    format!("{head}{}{}{tail}", if result.is_empty() { "" } else { "\n\n" }, result)
}

/// What the real result means — and if it failed, that it failed.
fn explain(step: &Step, r: &Ran) -> String {
    let out = if r.out.trim().is_empty() { "(nothing — which is normal for this command)".to_string() } else { r.out.clone() };
    if r.code != Some(0) {
        return format!("That came back with an error:\n{out}\nThat's useful too: CMD tells you what went wrong. Say “again” to retry it, or “next” to move on.");
    }
    step.after.replace("{out}", &out)
}

/// Check the exercise against what's really in the practice folder.
fn check(p: &Progress) -> String {
    let Some(ex) = steps(p.shell).get(p.step).and_then(|s| s.exercise.as_ref()) else {
        return "There's no exercise on this step yet — say “give me a challenge” for one, or “next” to keep going.".into();
    };
    let root = practice_dir();
    let mut hits: Vec<PathBuf> = Vec::new();
    find(&root, ex.must_exist, ex.is_dir, 3, &mut hits);
    match hits.first() {
        Some(at) => format!(
            "✅ Done — I can see {} at {}. Nice work. Say “next” to finish up.",
            if ex.is_dir { "the folder" } else { "the file" },
            at.display()
        ),
        None => format!(
            "Not yet — I looked in IzukiPractice and there's no {} called “{}”. The task: {}. Type the commands in the practice window, then say “check my work” again.",
            if ex.is_dir { "folder" } else { "file" },
            ex.must_exist,
            ex.task
        ),
    }
}

/// Look for `name` up to `depth` folders down.
fn find(dir: &Path, name: &str, is_dir: bool, depth: usize, out: &mut Vec<PathBuf>) {
    let Ok(rd) = std::fs::read_dir(dir) else { return };
    for e in rd.flatten() {
        let path = e.path();
        let d = path.is_dir();
        if e.file_name().to_string_lossy().eq_ignore_ascii_case(name) && d == is_dir {
            out.push(path.clone());
        }
        if d && depth > 0 {
            find(&path, name, is_dir, depth - 1, out);
        }
    }
}

/// Handle a lesson request.
pub fn handle(ask: Ask) -> String {
    let mut p = load();
    match ask {
        Ask::Start(shell) => {
            p = Progress { active: true, shell, step: 0, cwd: String::new(), at: now() };
            let opened = open_window(shell);
            eprintln!("[tutor] {} lesson started", shell.name());
            let intro = if opened { format!("Let's learn {} together. ", shell.name()) } else { String::new() };
            format!("{intro}{}", show(&mut p, 0))
        }
        Ask::Next => {
            let next = if steps(p.shell).get(p.step).is_some_and(|s| s.exercise.is_some()) { steps(p.shell).len() } else { p.step + 1 };
            show(&mut p, next)
        }
        Ask::Again => {
            let i = p.step;
            show(&mut p, i)
        }
        Ask::Check => {
            p.at = now();
            save(&p);
            check(&p)
        }
        Ask::TryIt => {
            p.at = now();
            save(&p);
            open_window(p.shell);
            let line = match steps(p.shell).get(p.step).map(|s| &s.act) {
                Some(Act::Run { line, .. }) | Some(Act::WriteAndRun { line, .. }) => line.split("&&").next().unwrap_or(line).trim().to_string(),
                _ => String::new(),
            };
            if line.is_empty() {
                "Go ahead in the practice window. Say “next” when you're ready, or “check my work” if there's an exercise.".into()
            } else {
                format!("Use {} as the current folder in the practice window, then type “{line}” and press Enter. Say “next” when you're ready.", folder(&p).display())
            }
        }
        Ask::Challenge => {
            let last = steps(p.shell).len() - 1;
            show(&mut p, last)
        }
        Ask::Restart => {
            p.cwd.clear();
            p.active = true;
            open_window(p.shell);
            show(&mut p, 0)
        }
        Ask::Stop => {
            p.active = false;
            save(&p);
            "Lesson paused. Your practice folder stays in IzukiPractice — say “teach me CMD” any time to start again.".into()
        }
        Ask::Where => format!(
            "We're on step {} of {} in {}: {}. Say “next” to continue.",
            p.step + 1,
            steps(p.shell).len(),
            p.shell.name(),
            steps(p.shell).get(p.step).map(|s| s.title).unwrap_or("done")
        ),
    }
}

/// For the Island while a lesson is on: "CMD · step 3 of 9 · mkdir — make a folder".
pub fn glance() -> Option<String> {
    let p = load();
    if !live(&p) {
        return None;
    }
    let all = steps(p.shell);
    let title = all.get(p.step).map(|s| s.title).unwrap_or("done");
    let shell = match p.shell {
        Shell::Cmd => "CMD",
        Shell::PowerShell => "PowerShell",
    };
    Some(format!("{shell} lesson · step {} of {} · {title}", (p.step + 1).min(all.len()), all.len()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn knows_a_lesson_from_other_requests() {
        assert_eq!(parse("Teach me how to code on CMD"), Some(Ask::Start(Shell::Cmd)));
        assert_eq!(parse("can you teach me the command prompt?"), Some(Ask::Start(Shell::Cmd)));
        assert_eq!(parse("I want to learn powershell"), Some(Ask::Start(Shell::PowerShell)));
        assert_eq!(parse("open cmd"), None);
        assert_eq!(parse("teach me how to cook rice"), None);
    }

    #[test]
    fn lesson_followups_do_not_capture_other_tasks() {
        assert!(is_followup("next please", "next"));
        assert!(is_followup("please continue", "continue"));
        assert!(!is_followup("next meeting", "next"));
        assert!(!is_followup("continue my project", "continue"));
        assert!(!is_followup("check my work on the build", "check my work"));
    }

    #[test]
    fn every_step_runs_for_real_in_the_practice_folder() {
        // A throwaway practice folder: the real lesson commands, run for real.
        let dir = std::env::temp_dir().join(format!("izuki-tutor-test-{}", rand::random::<u32>()));
        std::fs::create_dir_all(&dir).unwrap();
        let r = run(Shell::Cmd, "mkdir notes", &dir).unwrap();
        assert_eq!(r.code, Some(0));
        assert!(dir.join("notes").is_dir());
        let notes = dir.join("notes");
        let r = run(Shell::Cmd, "echo Hello from Izuki> hello.txt && dir /b", &notes).unwrap();
        assert!(r.out.contains("hello.txt"), "{}", r.out);
        let r = run(Shell::Cmd, "type hello.txt", &notes).unwrap();
        assert_eq!(r.out.trim(), "Hello from Izuki");
        std::fs::write(notes.join("greet.bat"), "@echo off\r\nset name=friend\r\necho Hello, %name%!\r\nif exist hello.txt echo hello.txt is here too.\r\n").unwrap();
        let r = run(Shell::Cmd, ".\\greet.bat", &notes).unwrap();
        assert!(r.out.contains("Hello, friend!") && r.out.contains("hello.txt is here too."), "{}", r.out);
        // A wrong command is reported as an error, with CMD's own words.
        let r = run(Shell::Cmd, "dri", &notes).unwrap();
        assert_ne!(r.code, Some(0));
        assert!(explain(&CMD[1], &r).contains("error"));
        // The exercise check looks at the real folder.
        let mut hits = Vec::new();
        find(&dir, "notes", true, 2, &mut hits);
        assert_eq!(hits.len(), 1);
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn lessons_have_one_exercise_at_the_end() {
        for s in [Shell::Cmd, Shell::PowerShell] {
            let all = steps(s);
            assert!(all.last().unwrap().exercise.is_some());
            assert_eq!(all.iter().filter(|x| x.exercise.is_some()).count(), 1);
        }
    }

    #[test]
    fn both_lessons_execute_in_their_expected_folders_including_retries() {
        for shell in [Shell::Cmd, Shell::PowerShell] {
            let root = std::env::temp_dir().join(format!("izuki-tutor-steps-{}", rand::random::<u32>()));
            std::fs::create_dir_all(&root).unwrap();
            for (i, step) in steps(shell).iter().enumerate() {
                let dir = root.join(cwd_before(shell, i));
                let result = match step.act {
                    Act::None => continue,
                    Act::Run { line, then_cwd } => {
                        let result = run(shell, line, &dir).unwrap();
                        if let Some(next) = then_cwd {
                            // Repeat a directory-changing step from the same starting point.
                            assert!(dir.join(next).is_dir());
                            let retry = run(shell, line, &root.join(cwd_before(shell, i))).unwrap();
                            assert_eq!(retry.code, Some(0), "{}", retry.out);
                            assert!(!dir.join(next).join(next).exists());
                        }
                        result
                    }
                    Act::WriteAndRun { file, body, line } => {
                        std::fs::write(dir.join(file), body).unwrap();
                        run(shell, line, &dir).unwrap()
                    }
                };
                assert_eq!(result.code, Some(0), "{shell:?} step {i}: {}", result.out);
            }
            assert_eq!(std::fs::read_to_string(root.join("notes/hello.txt")).unwrap().trim(), "Hello from Izuki");
            std::fs::remove_dir_all(root).unwrap();
        }
    }

    #[test]
    fn powershell_errors_are_reported_as_failures() {
        let r = run(Shell::PowerShell, "Get-Content 'izuki-tutor-nonexistent-file-713946'", &std::env::temp_dir()).unwrap();
        assert_ne!(r.code, Some(0));
        assert!(explain(&POWERSHELL[4], &r).contains("error"));
    }
}
