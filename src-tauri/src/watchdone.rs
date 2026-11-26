//! Watch & notify when done: "tell me when this finishes".
//!
//! Three things can be watched, all of them locally — nothing is asked of a
//! model, and one tick is one small picture:
//!
//! - **a window**: its own picture (`capture::capture_window`, which draws even
//!   when the window is covered) and the text inside it, by UI Automation;
//! - **a box** on the screen: a progress bar, a download row, a "Stop
//!   generating" button;
//! - **a process**: its CPU time and disk traffic, for work that shows nothing
//!   on screen.
//!
//! A watch goes `Armed → Active → Settling → Completed`: nothing has moved yet
//! (`Armed`); the picture, the text or the process moved (`Active`, and every
//! change restarts the quiet clock); quiet for a moment (`Settling`); quiet for
//! the owner's threshold, or a shell prompt back at the bottom of a terminal
//! (`Completed`, which fires the alert and drops the watch, so it can never fire
//! twice).
//!
//! One thread does all of it, and only while something is being watched.

use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{Duration, Instant};

use parking_lot::Mutex;
use serde::Serialize;

use crate::capture::{self, Frame};
use crate::model::{now_ms, Rect};

/// How often a running watch looks. Cheap enough to leave armed for a render.
const TICK: Duration = Duration::from_millis(1500);
/// The idle slider's ends, in milliseconds.
pub const IDLE_MIN_MS: u32 = 2_000;
pub const IDLE_MAX_MS: u32 = 15_000;
/// Quiet for this long and a watch is `Settling` rather than `Active`.
const SETTLE_AT: Duration = Duration::from_millis(900);
/// A watch nobody ever starts shouldn't poll forever.
const EXPIRY: Duration = Duration::from_secs(2 * 60 * 60);
/// One 64th of the picture has to move this far, out of 15 levels of
/// brightness, to count as work: that leaves a blinking caret, a rounded corner
/// and a video's noise alone.
const CELL_STEP: u8 = 3;
/// A process that used less CPU time (100 ns units: 2% of a core over one tick)
/// and moved fewer disk bytes than this is idle.
const BUSY_CPU: u64 = 300_000;
const BUSY_IO: u64 = 64 * 1024;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Mode {
    Window,
    Region,
    Process,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Phase {
    Armed,
    Active,
    Settling,
    Completed,
}

/// What the frontend is shown.
#[derive(Debug, Clone, Serialize)]
pub struct Watch {
    pub id: String,
    pub mode: Mode,
    /// What to call it in the alert: "WindowsTerminal.exe", "the box on screen".
    pub name: String,
    /// The window title, the box, or the process — for the list.
    pub detail: String,
    pub phase: Phase,
    /// The owner's quiet threshold for this watch, in milliseconds.
    pub idle_ms: u32,
    pub started_at: i64,
}

/// The window in front, for the HUD's quick toggle.
#[derive(Debug, Clone, Serialize)]
pub struct WindowInfo {
    pub hwnd: isize,
    pub pid: u32,
    pub title: String,
    pub process: String,
}

// ---------------------------------------------------------------------------
// What one tick saw
// ---------------------------------------------------------------------------

/// The picture is compared as a grid of cells this many across.
const CELLS: u32 = 8;

/// A 64-cell thumbnail: an 8×8 grid of average brightness, four bits a cell.
/// Two pictures a person would call the same look the same here, so nothing
/// subtle — a caret, a spinner's rounding, video noise — keeps a watch awake.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
struct Thumb([u8; (CELLS * CELLS) as usize]);

impl Default for Thumb {
    /// All black: what a picture that could not be taken looks like. (std only
    /// derives `Default` for arrays up to 32, so this one is written out.)
    fn default() -> Thumb {
        Thumb([0; (CELLS * CELLS) as usize])
    }
}

impl Thumb {
    fn of(frame: &Frame) -> Thumb {
        thumb_of(|x, y| frame.pixel(x, y), frame.width, frame.height)
    }

    /// Has the picture moved? One cell is enough: a progress bar crossing a
    /// boundary, a list that grew, a button that turned into "Stop".
    fn differs(&self, other: &Thumb) -> bool {
        self.0.iter().zip(other.0.iter()).any(|(a, b)| a.abs_diff(*b) >= CELL_STEP)
    }
}

fn thumb_of(mut at: impl FnMut(u32, u32) -> Option<(u8, u8, u8)>, width: u32, height: u32) -> Thumb {
    let mut cells = [0u8; (CELLS * CELLS) as usize];
    if width == 0 || height == 0 {
        return Thumb(cells);
    }
    const SAMPLES: u32 = 4;
    for (i, cell) in cells.iter_mut().enumerate() {
        let (cx, cy) = (i as u32 % CELLS, i as u32 / CELLS);
        let x0 = cx * width / CELLS;
        let y0 = cy * height / CELLS;
        let x1 = ((cx + 1) * width / CELLS).min(width).max(x0 + 1);
        let y1 = ((cy + 1) * height / CELLS).min(height).max(y0 + 1);
        // A few samples a cell: enough for an average, cheap for eight windows.
        let mut sum = 0u32;
        let mut n = 0u32;
        for sy in 0..SAMPLES {
            for sx in 0..SAMPLES {
                let x = x0 + (x1 - x0) * sx / SAMPLES;
                let y = y0 + (y1 - y0) * sy / SAMPLES;
                if let Some((r, g, b)) = at(x, y) {
                    sum += (r as u32 * 30 + g as u32 * 59 + b as u32 * 11) / 100;
                    n += 1;
                }
            }
        }
        if n > 0 {
            *cell = ((sum / n) * 15 / 255) as u8;
        }
    }
    Thumb(cells)
}

/// One reading of whatever is being watched.
#[derive(Debug, Clone)]
enum Sample {
    /// A window or a box: its thumbnail, and the text inside a window.
    Picture { thumb: Thumb, text: String },
    /// A process: CPU time (100 ns units) and disk bytes so far.
    Process { cpu: u64, io: u64 },
}

impl Sample {
    /// Has anything moved since `before`?
    fn changed(&self, before: &Sample) -> bool {
        match (self, before) {
            (Sample::Picture { thumb, text }, Sample::Picture { thumb: was, text: was_text }) => {
                thumb.differs(was) || text.trim() != was_text.trim()
            }
            (Sample::Process { cpu, io }, Sample::Process { cpu: was_cpu, io: was_io }) => {
                cpu.saturating_sub(*was_cpu) > BUSY_CPU || io.saturating_sub(*was_io) > BUSY_IO
            }
            // A target that changed kind under us is always news.
            _ => true,
        }
    }

    /// The text inside a window, for spotting a shell prompt coming back.
    fn text(&self) -> &str {
        match self {
            Sample::Picture { text, .. } => text,
            Sample::Process { .. } => "",
        }
    }
}

/// Does this text end in a shell prompt? A prompt back at the bottom of a
/// terminal is the clearest "your command is done" there is, and it doesn't
/// need to wait out the idle threshold.
fn prompt_tail(text: &str) -> bool {
    let Some(line) = text.lines().rev().find(|l| !l.trim().is_empty()) else {
        return false;
    };
    let line = line.trim_end();
    // "PS C:\Users\nova>", "nova@pc:~$", "❯". Not "%": a download at 42% is
    // the opposite of finished.
    if matches!(line.chars().last(), Some('>' | '$' | '❯' | 'λ' | '#')) {
        return true;
    }
    // Windows' own prompt without the caret: "PS C:\src".
    line.starts_with("PS ") && line.contains(":\\")
}

// ---------------------------------------------------------------------------
// The state machine (pure, so it can be tested without a screen)
// ---------------------------------------------------------------------------

/// Where a watch goes next. `quiet` is how long nothing has changed.
fn advance(phase: Phase, changed: bool, prompt_now: bool, prompt_before: bool, quiet: Duration, idle: Duration) -> Phase {
    match phase {
        Phase::Completed => Phase::Completed,
        _ if changed => Phase::Active,
        // A prompt that has just come back at the bottom of a terminal is the
        // work ending, wherever on the screen the cursor happens to be.
        _ if prompt_now && !prompt_before && phase != Phase::Armed => Phase::Completed,
        Phase::Armed => Phase::Armed,
        Phase::Active if quiet >= idle.min(SETTLE_AT) => Phase::Settling,
        Phase::Active => Phase::Active,
        Phase::Settling if quiet >= idle => Phase::Completed,
        Phase::Settling => Phase::Settling,
    }
}

// ---------------------------------------------------------------------------
// The running watches
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Copy)]
enum Target {
    Window(isize),
    Box(Rect),
    Process(u32),
}

#[derive(Clone)]
struct Job {
    /// What the frontend is shown. Its `phase` is the watch's one phase.
    view: Watch,
    target: Target,
    /// When the picture last changed.
    quiet_since: Instant,
    /// The previous reading, to compare against.
    last: Option<Sample>,
    /// Whether a shell prompt was at the bottom of the text last time.
    prompt_before: bool,
    started: Instant,
}

static JOBS: Mutex<Option<HashMap<String, Job>>> = Mutex::new(None);
static SEQ: AtomicU64 = AtomicU64::new(0);

fn with_jobs<T>(f: impl FnOnce(&mut HashMap<String, Job>) -> T) -> T {
    let mut guard = JOBS.lock();
    f(guard.get_or_insert_with(HashMap::new))
}

fn emit_changed() {
    if let Some(app) = crate::state::app() {
        use tauri::Emitter;
        let _ = app.emit(crate::events::WATCH_CHANGED, list());
    }
}

/// Every watch, oldest first.
pub fn list() -> Vec<Watch> {
    let mut out = with_jobs(|jobs| jobs.values().map(|j| j.view.clone()).collect::<Vec<_>>());
    out.sort_by_key(|w| w.started_at);
    out
}

/// Stop a watch by id. False when it had already fired or been stopped.
pub fn stop(id: &str) -> bool {
    let stopped = with_jobs(|jobs| jobs.remove(id).is_some());
    if stopped {
        emit_changed();
    }
    stopped
}

fn name_of(process: &str, title: &str, mode: Mode) -> String {
    match (process.trim(), title.trim()) {
        ("", "") => match mode {
            Mode::Region => "the box on screen".into(),
            Mode::Process => "the app".into(),
            Mode::Window => "the window".into(),
        },
        ("", title) => title.chars().take(48).collect(),
        (process, _) => process.to_string(),
    }
}

/// The owner's quiet threshold, kept inside the slider's ends.
fn idle_from_settings() -> Duration {
    let ms = crate::state::try_store().map(|s| s.settings().watch_idle_ms).unwrap_or(4_000);
    Duration::from_millis(ms.clamp(IDLE_MIN_MS, IDLE_MAX_MS) as u64)
}

fn add(mode: Mode, target: Target, name: String, detail: String) -> Watch {
    let now = Instant::now();
    let view = Watch {
        id: format!("w{}", SEQ.fetch_add(1, Ordering::Relaxed) + 1),
        mode,
        name,
        detail,
        phase: Phase::Armed,
        idle_ms: idle_from_settings().as_millis() as u32,
        started_at: now_ms(),
    };
    let job = Job {
        view: view.clone(),
        target,
        quiet_since: now,
        last: None,
        prompt_before: false,
        started: now,
    };
    with_jobs(|jobs| jobs.insert(view.id.clone(), job));
    emit_changed();
    view
}

/// Watch the window in front, or the one handed in.
pub fn arm_window(hwnd: Option<isize>) -> Result<Watch, String> {
    let hwnd = hwnd.or_else(crate::uia::foreground_hwnd).ok_or("There's no window in front to watch.")?;
    let info = window_info(hwnd).ok_or("That window has gone.")?;
    let name = name_of(&info.process, &info.title, Mode::Window);
    let detail = if info.title.trim().is_empty() { info.process.clone() } else { info.title.clone() };
    Ok(add(Mode::Window, Target::Window(hwnd), name, detail))
}

/// Watch one box on the screen.
pub fn arm_region(x: i32, y: i32, w: i32, h: i32) -> Result<Watch, String> {
    if w < 8 || h < 8 {
        return Err("That box is too small to watch — drag a bigger one.".into());
    }
    let bounds = capture::virtual_bounds();
    let x = x.clamp(bounds.x, bounds.x + bounds.w - 8);
    let y = y.clamp(bounds.y, bounds.y + bounds.h - 8);
    let w = w.min(bounds.x + bounds.w - x).max(8);
    let h = h.min(bounds.y + bounds.h - y).max(8);
    let detail = format!("{w}×{h} at {x},{y}");
    Ok(add(Mode::Region, Target::Box(Rect { x, y, w, h }), "the box on screen".into(), detail))
}

/// Watch the process of the window in front, by its CPU and disk use.
pub fn arm_process() -> Result<Watch, String> {
    let hwnd = crate::uia::foreground_hwnd().ok_or("There's no window in front to watch.")?;
    let info = window_info(hwnd).ok_or("That window has gone.")?;
    if info.pid == 0 {
        return Err("I couldn't read that app's process.".into());
    }
    let name = name_of(&info.process, &info.title, Mode::Process);
    let detail = format!("{} (pid {})", info.process, info.pid);
    Ok(add(Mode::Process, Target::Process(info.pid), name, detail))
}

/// A window's handle, process and title.
pub fn window_info(hwnd: isize) -> Option<WindowInfo> {
    #[cfg(windows)]
    unsafe {
        use windows::Win32::Foundation::HWND;
        use windows::Win32::UI::WindowsAndMessaging::{GetWindowTextW, GetWindowThreadProcessId};
        let h = HWND(hwnd as *mut core::ffi::c_void);
        let mut pid = 0u32;
        GetWindowThreadProcessId(h, Some(&mut pid));
        let mut buf = [0u16; 512];
        let n = GetWindowTextW(h, &mut buf);
        let title = if n > 0 { String::from_utf16_lossy(&buf[..n as usize]) } else { String::new() };
        let process = crate::uia::process_name(pid);
        Some(WindowInfo { hwnd, pid, title, process })
    }
    #[cfg(not(windows))]
    {
        let _ = hwnd;
        None
    }
}

/// A JPEG of the whole screen, so the owner can drag the box to watch. Only
/// taken when they ask for it.
pub fn screen_preview() -> Result<String, String> {
    let frame = capture::capture_all().map_err(|e| format!("I couldn't look at the screen: {e}"))?;
    frame.to_jpeg_data_url(60).map_err(|e| format!("I couldn't prepare the preview: {e}"))
}

/// One reading of a target. `None` when it has gone: the window closed, or the
/// process ended — which is a finish too.
fn observe(target: Target) -> Option<Sample> {
    match target {
        Target::Window(hwnd) => {
            let (_, frame) = capture::capture_window(hwnd).ok()?;
            let text = crate::uia::window_text(hwnd, 4_000);
            Some(Sample::Picture { thumb: Thumb::of(&frame), text })
        }
        // A box has no text of its own: the picture is the whole signal.
        Target::Box(rect) => {
            let frame = capture::capture(rect).ok()?;
            Some(Sample::Picture { thumb: Thumb::of(&frame), text: String::new() })
        }
        Target::Process(pid) => {
            let (cpu, io) = process_totals(pid)?;
            Some(Sample::Process { cpu, io })
        }
    }
}

/// A process's total CPU time (100 ns units) and disk bytes so far.
#[cfg(windows)]
fn process_totals(pid: u32) -> Option<(u64, u64)> {
    use windows::Win32::Foundation::{CloseHandle, FILETIME};
    use windows::Win32::System::Threading::{
        GetProcessIoCounters, GetProcessTimes, OpenProcess, IO_COUNTERS, PROCESS_QUERY_LIMITED_INFORMATION,
    };
    unsafe {
        let handle = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid).ok()?;
        let mut idle = FILETIME::default();
        let mut kernel = FILETIME::default();
        let mut user = FILETIME::default();
        let mut created = FILETIME::default();
        let cpu = if GetProcessTimes(handle, &mut created, &mut idle, &mut kernel, &mut user).is_ok() {
            let units = |t: FILETIME| ((t.dwHighDateTime as u64) << 32) | t.dwLowDateTime as u64;
            units(kernel) + units(user)
        } else {
            0
        };
        let mut counters = IO_COUNTERS::default();
        let io = if GetProcessIoCounters(handle, &mut counters).is_ok() {
            counters.ReadTransferCount + counters.WriteTransferCount + counters.OtherTransferCount
        } else {
            0
        };
        let _ = CloseHandle(handle);
        Some((cpu, io))
    }
}

#[cfg(not(windows))]
fn process_totals(_pid: u32) -> Option<(u64, u64)> {
    None
}

/// The polling thread. Started once at boot; does nothing at all while there
/// are no watches.
pub fn spawn() {
    std::thread::Builder::new().name("izuki-watch-done".into()).spawn(run).ok();
}

fn run() {
    loop {
        let ids: Vec<String> = with_jobs(|jobs| jobs.keys().cloned().collect());
        if ids.is_empty() {
            std::thread::sleep(Duration::from_millis(400));
            continue;
        }
        std::thread::sleep(TICK);

        let mut finished: Vec<Watch> = Vec::new();
        let mut dirty = false;

        for id in ids {
            // Take the reading without holding the registry lock: a window's
            // text can take a moment to ask for.
            let Some(job) = with_jobs(|jobs| jobs.get(&id).cloned()) else { continue };
            let Some(current) = observe(job.target) else {
                // The window closed or the process ended: that is a finish too.
                if let Some(mut gone) = with_jobs(|jobs| jobs.remove(&id)) {
                    gone.view.phase = Phase::Completed;
                    finished.push(gone.view);
                    dirty = true;
                }
                continue;
            };

            let changed = job.last.as_ref().is_some_and(|was| current.changed(was));
            let prompt_now = prompt_tail(current.text());
            let idle = Duration::from_millis(job.view.idle_ms as u64);
            let next = advance(job.view.phase, changed, prompt_now, job.prompt_before, job.quiet_since.elapsed(), idle);
            if changed || next != job.view.phase {
                dirty = true;
            }

            let done = with_jobs(|jobs| {
                let job = jobs.get_mut(&id)?;
                if changed {
                    job.quiet_since = Instant::now();
                }
                job.view.phase = next;
                job.prompt_before = prompt_now;
                job.last = Some(current);
                (next == Phase::Completed).then(|| job.view.clone())
            });
            if let Some(view) = done {
                with_jobs(|jobs| jobs.remove(&id));
                finished.push(view);
                dirty = true;
            }
        }

        // A watch nobody ever starts shouldn't poll all day.
        let expired = with_jobs(|jobs| {
            let before = jobs.len();
            jobs.retain(|_, job| job.started.elapsed() < EXPIRY);
            before != jobs.len()
        });
        dirty |= expired;

        for watch in finished {
            fire(watch);
        }
        if dirty {
            emit_changed();
        }
    }
}

/// Tell the owner, however they asked to be told. On its own thread: the
/// webhook can take seconds and the poll loop mustn't wait for it.
fn fire(watch: Watch) {
    std::thread::Builder::new()
        .name("izuki-watch-tell".into())
        .spawn(move || {
            let Some(store) = crate::state::try_store() else { return };
            let settings = store.settings();
            let line = format!("{} is done.", watch.name);

            if let Some(app) = crate::state::app() {
                use tauri::Emitter;
                if settings.watch_toast {
                    use tauri_plugin_notification::NotificationExt;
                    if let Err(e) = app.notification().builder().title("Done").body(&line).show() {
                        eprintln!("[watchdone] Windows notification failed: {e}");
                    }
                }
                let _ = app.emit(crate::events::WATCH_DONE, &watch);
                if settings.watch_voice {
                    let _ = app.emit(crate::events::WATCH_SAY, &line);
                }
            }

            if settings.watch_push {
                crate::webpush::send_all("Done", &line, "watchdone");
            }

            let url = settings.watch_webhook.trim();
            if url.starts_with("http://") || url.starts_with("https://") {
                let body = serde_json::json!({
                    "text": line,
                    "name": watch.name,
                    "detail": watch.detail,
                    "at": now_ms(),
                });
                let sent = reqwest::blocking::Client::builder()
                    .timeout(Duration::from_secs(8))
                    .build()
                    .and_then(|client| client.post(url).json(&body).send());
                if let Err(e) = sent {
                    eprintln!("[watchdone] webhook failed: {e}");
                }
            }
        })
        .ok();
}

#[cfg(test)]
mod tests {
    use super::*;

    fn grey(level: u8) -> (u8, u8, u8) {
        (level, level, level)
    }

    fn thumb(level: u8) -> Thumb {
        thumb_of(|_, _| Some(grey(level)), 320, 200)
    }

    fn picture(text: &str) -> Sample {
        Sample::Picture { thumb: thumb(40), text: text.into() }
    }

    #[test]
    fn a_still_picture_looks_the_same_and_a_different_one_does_not() {
        assert_eq!(thumb(40), thumb(40));
        assert!(!thumb(40).differs(&thumb(40)));
        assert!(thumb(40).differs(&thumb(200)));
    }

    #[test]
    fn a_slight_noise_does_not_count_as_a_change() {
        // One pixel differs slightly: the cell averages and quantises it away.
        let base = thumb_of(|x, y| Some(grey(if x == 3 && y == 3 { 130 } else { 128 })), 400, 300);
        let same = thumb_of(|x, y| Some(grey(if x == 4 && y == 4 { 132 } else { 128 })), 400, 300);
        assert!(!same.differs(&base));
    }

    #[test]
    fn a_change_in_one_corner_counts() {
        // A bright block in the bottom-right corner of a 400×300 picture: two
        // cells across, two down.
        let changed = thumb_of(|x, y| Some(grey(if x > 300 && y > 200 { 240 } else { 30 })), 400, 300);
        assert!(changed.differs(&thumb(30)));
    }

    #[test]
    fn a_picture_that_could_not_be_taken_is_blank() {
        assert_eq!(thumb_of(|_, _| None, 0, 0), Thumb::default());
        let empty = Frame { width: 0, height: 0, origin: (0, 0), bgra: Vec::new() };
        assert!(!Thumb::of(&empty).differs(&Thumb::default()));
    }

    #[test]
    fn shell_prompts_are_recognised() {
        for text in ["PS C:\\Users\\nova>", "$ ", "nova@pc:~$", "❯ ", "C:\\src>", "λ"] {
            assert!(prompt_tail(text), "{text:?} is a prompt");
        }
        for text in ["Downloading 42%", "Build finished in 3.2s", "Done (1 file changed)", "[ok] tests", ""] {
            assert!(!prompt_tail(text), "{text:?} is not a prompt");
        }
    }

    #[test]
    fn a_prompt_at_the_bottom_of_a_long_buffer_counts() {
        let text = "npm run build\nvite v7 building for production...\n✓ built in 4.10s\nPS C:\\work>";
        assert!(prompt_tail(text));
    }

    #[test]
    fn armed_waits_for_activity_then_settles_then_completes() {
        let idle = Duration::from_secs(4);
        // Nothing happening: armed stays armed, however long it waits.
        assert_eq!(advance(Phase::Armed, false, false, false, Duration::from_secs(60), idle), Phase::Armed);
        // First movement.
        assert_eq!(advance(Phase::Armed, true, false, false, Duration::ZERO, idle), Phase::Active);
        // Quiet, but not long enough.
        assert_eq!(advance(Phase::Active, false, false, false, Duration::from_millis(500), idle), Phase::Active);
        // Quiet a moment: settling.
        assert_eq!(advance(Phase::Active, false, false, false, Duration::from_millis(1200), idle), Phase::Settling);
        // Quiet for the threshold: done, with no extra settling delay.
        assert_eq!(advance(Phase::Settling, false, false, false, idle - Duration::from_millis(1), idle), Phase::Settling);
        assert_eq!(advance(Phase::Settling, false, false, false, idle, idle), Phase::Completed);
        // One more change before the threshold puts it back to work.
        assert_eq!(advance(Phase::Settling, true, false, false, Duration::from_millis(3000), idle), Phase::Active);
    }

    #[test]
    fn a_prompt_that_comes_back_ends_the_watch_at_once() {
        let idle = Duration::from_secs(12);
        assert_eq!(advance(Phase::Active, false, true, false, Duration::from_millis(100), idle), Phase::Completed);
        // A prompt that was already there is not news.
        assert_eq!(advance(Phase::Active, false, true, true, Duration::from_millis(100), idle), Phase::Active);
        // And an armed watch is still waiting for the work to start.
        assert_eq!(advance(Phase::Armed, false, true, false, Duration::ZERO, idle), Phase::Armed);
    }

    #[test]
    fn completed_never_comes_back() {
        let idle = Duration::from_secs(4);
        assert_eq!(advance(Phase::Completed, true, false, false, Duration::ZERO, idle), Phase::Completed);
    }

    #[test]
    fn a_text_change_alone_counts_as_activity() {
        assert!(picture("Downloading 41%").changed(&picture("Downloading 40%")));
        assert!(!picture("Downloading 40% ").changed(&picture("Downloading 40%")));
        // A blank picture still compares its text.
        let blank = Sample::Picture { thumb: Thumb::default(), text: "same".into() };
        assert!(!blank.changed(&blank));
    }

    #[test]
    fn a_process_counts_as_moving_only_while_it_works() {
        let before = Sample::Process { cpu: 1_000_000, io: 10_000 };
        let busy = Sample::Process { cpu: 1_000_000 + BUSY_CPU + 1, io: 10_000 };
        let writing = Sample::Process { cpu: 1_000_000, io: 10_000 + BUSY_IO + 1 };
        let idle = Sample::Process { cpu: 1_000_000 + BUSY_CPU / 2, io: 10_000 + BUSY_IO / 2 };
        assert!(busy.changed(&before), "CPU time is work");
        assert!(writing.changed(&before), "disk traffic is work");
        assert!(!idle.changed(&before), "a quiet process is not news");
    }
}
