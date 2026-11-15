//! Practical mode: the same task engine, with your hands in it.
//!
//! "Teach me how to turn on Bluetooth", "show me how to…", "walk me
//! through…": Izuki works the task out exactly as it would to do it itself
//! (the same look, the same numbered controls, the same safety checks), but
//! each step is yours. It points at the control, says what to do and why,
//! and waits while you do it; the next look checks it worked (and explains
//! what came back) before the next step. "Do it with me" takes turns. Any
//! other request is the usual agent ("do it"). Mid-task, "you do this one"
//! or "let me do it" hands the next step to the other pair of hands, and
//! "do the rest" / "teach me instead" changes the mode for the rest.
//!
//! Nothing here clicks or types: a step that's yours is shown and watched,
//! never performed. Nothing is wired to an app either: the steps are the
//! planner's, for whatever is on screen, so Settings, a terminal, VS Code or
//! Wireshark all work the same way.

use crate::model::{ActionStep, Intent};
use parking_lot::Mutex;
use std::sync::atomic::{AtomicBool, AtomicU8, Ordering};
use std::time::{Duration, Instant};

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Mode {
    /// Izuki does every step (the usual agent).
    Do,
    /// You do every step; Izuki shows, explains and checks.
    Teach,
    /// Turns: Izuki one step, you the next.
    WithMe,
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Hands {
    Izuki,
    Person,
}

/// How a step that was yours ended.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Turn {
    /// The screen changed and settled (or you said you'd done it).
    Done,
    /// "Do it for me": Izuki does this one.
    HandBack,
    Stopped,
    /// Nothing happened for a long time.
    Idle,
}

/// The note a finished turn leaves for the next look (brain.rs).
pub const YOUR_TURN_DONE: &str = "your_turn_done:";
/// A step left with the person for a long time: the task waits for "keep going".
pub const YOUR_TURN_IDLE: &str = "your_turn_idle";

struct Session {
    task: u64,
    mode: Mode,
    /// Set by "you do this one" / "let me do it": the next step's hands.
    next: Option<Hands>,
    last: Option<Hands>,
    /// What you did yourself, for the summary at the end.
    yours: Vec<String>,
    mine: usize,
    /// When the session last did anything (a "keep going" keeps a recent one).
    at: Option<Instant>,
}

static SESSION: Mutex<Session> = Mutex::new(Session { task: 0, mode: Mode::Do, next: None, last: None, yours: Vec::new(), mine: 0, at: None });
/// A step is yours right now: Izuki is watching, not acting.
static WAITING: AtomicBool = AtomicBool::new(false);
/// Said or pressed during your turn: 1 = done, 2 = do it for me.
static SIGNAL: AtomicU8 = AtomicU8::new(0);

fn words(s: &str) -> String {
    let w: Vec<String> = s
        .to_lowercase()
        .replace(['’', '\''], "")
        .split(|c: char| !c.is_alphanumeric())
        .filter(|w| !w.is_empty())
        .map(String::from)
        .collect();
    format!(" {} ", w.join(" "))
}

/// Which mode a request asks for, from its own words.
pub fn mode_of(task: &str) -> Mode {
    // Teacher mode for quizzes (VoiceEngine) and the quiz coach have their
    // own rules for whose hands do what: never changed here.
    if task.contains("TEACHER MODE") {
        return Mode::Do;
    }
    let s = words(task);
    let has = |list: &[&str]| list.iter().any(|w| s.contains(w));
    // "Don't teach me, just do it": doing, when it's said plainly.
    if has(&[" just do it ", " do it for me ", " dont teach ", " dont show me ", " no need to teach ", " do the rest "]) {
        return Mode::Do;
    }
    if has(&[
        " do it with me ", " do this with me ", " do that with me ", " with me step by step ", " step by step with me ",
        " take turns ", " do it together ", " do this together ", " lets do it together ", " work through it with me ",
        " go through it with me ", " work on it together ",
    ]) {
        return Mode::WithMe;
    }
    if has(&[
        " teach me ", " show me how ", " walk me through ", " guide me through ", " guide me ", " help me learn ",
        " i want to learn ", " explain how to ", " let me try ", " ill do it myself ", " i want to do it myself ",
    ]) {
        return Mode::Teach;
    }
    Mode::Do
}

/// "Keep going", "carry on": a continuation, not a new request.
fn continues(task: &str) -> bool {
    let s = words(task);
    let s = s.trim();
    ["keep going", "carry on", "continue", "go on", "next", "next step", "resume", "keep at it"].contains(&s)
}

/// A task is starting (brain.rs `Working::on`). A continuation of a recent
/// session keeps its mode and its record of who did what.
pub fn begin(task: u64, said: &str) {
    let mut s = SESSION.lock();
    let recent = s.at.is_some_and(|t| t.elapsed() < Duration::from_secs(30 * 60));
    let asked = mode_of(said);
    if asked == Mode::Do && continues(said) && recent && s.mode != Mode::Do {
        s.task = task;
        s.at = Some(Instant::now());
        return;
    }
    *s = Session { task, mode: asked, next: None, last: None, yours: Vec::new(), mine: 0, at: Some(Instant::now()) };
    WAITING.store(false, Ordering::SeqCst);
    SIGNAL.store(0, Ordering::SeqCst);
}

/// The mode of the task running now.
pub fn mode() -> Mode {
    SESSION.lock().mode
}

/// The last job the three ways were offered for (asked once per job).
static OFFERED: Mutex<Option<String>> = Mutex::new(None);

/// The question, word for word (the conversation's chips answer it).
pub const OFFER: &str = "Happy to. Want me to do it, do it with you, or teach you step by step?";

/// Would `offer` ask? A job a person might want to learn, share or hand
/// over, said without saying how: "help me investigate…", "help me set up…".
pub fn offers(said: &str) -> bool {
    if said.contains("TEACHER MODE") || mode_of(said) != Mode::Do {
        return false;
    }
    let s = words(said);
    let s = s.trim();
    let starts = ["help me ", "can you help me ", "could you help me ", "please help me ", "i need help to ", "i need help with "];
    let Some(rest) = starts.iter().find_map(|p| s.strip_prefix(p)) else { return false };
    ["investigate", "set up", "setup", "configure", "troubleshoot", "fix ", "diagnose", "figure out", "install", "use ", "learn", "understand", "analy"]
        .iter()
        .any(|j| rest.starts_with(j))
}

/// The three ways, offered once in a line, before anything is touched. The
/// answer ("teach me", "do it with me", "just do it") carries on with the
/// same job: the conversation goes with it. `None`: they already said how,
/// it isn't that kind of job, or it was just offered (the same words again
/// mean "go ahead").
pub fn offer(said: &str) -> Option<String> {
    if !offers(said) {
        return None;
    }
    let key = words(said).trim().to_string();
    let mut last = OFFERED.lock();
    if last.as_deref() == Some(key.as_str()) {
        return None;
    }
    *last = Some(key);
    Some(OFFER.into())
}

/// Showing steps change nothing on screen: they're always Izuki's.
fn showing(step: &ActionStep) -> bool {
    matches!(step.action, Intent::Point | Intent::Draw | Intent::Watch | Intent::Hover)
}

/// Whose hands this step is for.
pub fn hands_for(step: &ActionStep) -> Hands {
    if showing(step) {
        return Hands::Izuki;
    }
    let mut s = SESSION.lock();
    if let Some(h) = s.next.take() {
        return h;
    }
    match s.mode {
        Mode::Do => Hands::Izuki,
        Mode::Teach => Hands::Person,
        Mode::WithMe => {
            if s.last == Some(Hands::Izuki) {
                Hands::Person
            } else {
                Hands::Izuki
            }
        }
    }
}

/// A step finished by these hands.
pub fn record(hands: Hands, what: &str) {
    let mut s = SESSION.lock();
    s.last = Some(hands);
    s.at = Some(Instant::now());
    match hands {
        Hands::Person => s.yours.push(what.to_string()),
        Hands::Izuki => s.mine += 1,
    }
}

/// What to tell the person to do, in one plain sentence: the planner's own
/// reason when it wrote one for them, else said from the step itself.
pub fn say_what(step: &ActionStep) -> String {
    let why = step.reasoning.trim();
    if !why.is_empty() && why.chars().count() <= 300 && !why.to_lowercase().starts_with("i ") {
        return why.to_string();
    }
    let name = step.snapped_to.as_deref().map(str::trim).filter(|n| !n.is_empty());
    let text = step.text_to_type.as_deref().unwrap_or_default().trim();
    let it = |verb: &str| match name {
        Some(n) => format!("{verb} “{n}”."),
        None => format!("{verb} where I'm pointing."),
    };
    match step.action {
        Intent::Type => match name {
            Some(n) => format!("Type “{text}” into {n}."),
            None => format!("Type “{text}”."),
        },
        Intent::Key => format!("Press {}.", step.key.as_deref().unwrap_or("the key")),
        Intent::Scroll => format!("Scroll {} a little.", if step.scroll_amount.unwrap_or(-1) > 0 { "up" } else { "down" }),
        Intent::OpenApp => format!("Open {text}."),
        Intent::OpenUrl => format!("Go to {text}."),
        Intent::Search => format!("Search for “{text}”."),
        Intent::PlayYoutube => format!("Find “{text}” on YouTube and play it."),
        Intent::Do => format!("Do this: {text}."),
        Intent::DoubleClick => it("Double-click"),
        Intent::RightClick => it("Right-click"),
        Intent::Drag | Intent::Stroke => "Drag from where I'm pointing.".into(),
        Intent::Copy => it("Select and copy"),
        _ => it("Click"),
    }
}

/// What's on screen, in one number: the window in front, its title, its
/// controls (names, values, whether they're in view) and its text. A step
/// done changes it. (Positions aren't in it: a window nudged isn't a step.)
pub fn fingerprint() -> u64 {
    use std::hash::{Hash, Hasher};
    let mut h = std::collections::hash_map::DefaultHasher::new();
    crate::uia::foreground_hwnd().hash(&mut h);
    crate::uia::foreground_title().hash(&mut h);
    for c in crate::uia::list_controls(160) {
        (c.kind, c.name, c.value, c.below).hash(&mut h);
    }
    crate::uia::document_text(1500).hash(&mut h);
    h.finish()
}

/// Is a step yours right now?
pub fn waiting() -> bool {
    WAITING.load(Ordering::SeqCst)
}

/// Watch for the person's step: the screen changing and then settling
/// (typing gets longer to settle), or "I did it" / "do it for me". A look
/// every second and a half, through accessibility: no screenshot, nothing
/// uploaded while you work.
pub fn wait_for_person(alive: &dyn Fn() -> bool, typing: bool) -> Turn {
    SIGNAL.store(0, Ordering::SeqCst);
    WAITING.store(true, Ordering::SeqCst);
    let out = watch(alive, typing);
    WAITING.store(false, Ordering::SeqCst);
    SIGNAL.store(0, Ordering::SeqCst);
    out
}

fn watch(alive: &dyn Fn() -> bool, typing: bool) -> Turn {
    let before = fingerprint();
    let started = Instant::now();
    let settle = Duration::from_millis(if typing { 2500 } else { 1200 });
    let mut changed: Option<(u64, Instant)> = None;
    loop {
        for _ in 0..5 {
            if !alive() {
                return Turn::Stopped;
            }
            match SIGNAL.swap(0, Ordering::SeqCst) {
                1 => return Turn::Done,
                2 => return Turn::HandBack,
                _ => {}
            }
            std::thread::sleep(Duration::from_millis(300));
        }
        if started.elapsed() > Duration::from_secs(15 * 60) {
            return Turn::Idle;
        }
        let now = fingerprint();
        match changed {
            None if now != before => changed = Some((now, Instant::now())),
            Some((last, _)) if now != last => changed = Some((now, Instant::now())),
            Some((_, since)) if since.elapsed() >= settle => return Turn::Done,
            _ => {}
        }
    }
}

/// Words said while a practical task runs: "I did it", "do it for me",
/// "let me do this one", "do the rest", "teach me instead", "take turns".
/// `None` when they're not about the turns (or nothing's running).
pub fn heard(said: &str, task_running: bool) -> Option<String> {
    if !task_running {
        return None;
    }
    let s = words(said);
    let s = s.trim();
    let s = s.strip_prefix("ok ").or_else(|| s.strip_prefix("okay ")).unwrap_or(s);
    let mut session = SESSION.lock();
    let yours = waiting();
    match s {
        "i did it" | "ive done it" | "i have done it" | "done" | "finished" | "i finished" | "did it" if yours => {
            SIGNAL.store(1, Ordering::SeqCst);
            Some("Okay — let me check.".into())
        }
        "you do it" | "you do this one" | "you do that one" | "do it for me" | "do this one for me" | "can you do it" | "your turn" => {
            if yours {
                SIGNAL.store(2, Ordering::SeqCst);
            } else {
                session.next = Some(Hands::Izuki);
            }
            Some("Okay — I'll do this one. Watch where it goes.".into())
        }
        "let me do it" | "let me do this one" | "ill do it" | "ill do this one" | "my turn" | "let me try" => {
            session.next = Some(Hands::Person);
            Some("Go for it — I'll point and watch.".into())
        }
        "do the rest" | "just do the rest" | "you finish it" | "finish it for me" | "you do the rest" => {
            session.mode = Mode::Do;
            session.next = None;
            if yours {
                SIGNAL.store(2, Ordering::SeqCst);
            }
            Some("Okay — I'll do the rest.".into())
        }
        "teach me instead" | "let me do the rest" | "ill do the rest" | "i want to do it myself" => {
            session.mode = Mode::Teach;
            Some("Sure — your hands from here. I'll show you each step.".into())
        }
        "take turns" | "lets take turns" | "do it with me" => {
            session.mode = Mode::WithMe;
            Some("Deal — we'll take turns.".into())
        }
        _ => None,
    }
}

/// The Task Stage's "I did it" / "Do it for me".
pub fn press(done: bool) -> bool {
    if !waiting() {
        return false;
    }
    SIGNAL.store(if done { 1 } else { 2 }, Ordering::SeqCst);
    true
}

/// The spoken wrap-up for a practical task: who did what (the planner's own
/// summary says what was learned).
pub fn wrap_up() -> Option<String> {
    let s = SESSION.lock();
    if s.mode == Mode::Do && s.yours.is_empty() {
        return None;
    }
    Some(match (s.yours.len(), s.mine) {
        (0, _) => return None,
        (1, 0) => "You did that step yourself.".into(),
        (n, 0) => format!("You did all {n} steps yourself."),
        (n, m) => format!("You did {n} step{} and I did {m}.", if n == 1 { "" } else { "s" }),
    })
}

/// Teaching and turn-taking instructions for the planner (empty for "do it").
pub fn prompt_block() -> &'static str {
    match mode() {
        Mode::Do => "",
        Mode::Teach => TEACH_PROMPT,
        Mode::WithMe => WITH_ME_PROMPT,
    }
}

const TEACH_PROMPT: &str = "PRACTICAL MODE (teach me): the person wants to learn this, so THEY do every step and you guide. \
Plan the real on-screen way a person does it (numbered controls, keys, typing), one or two steps at a time, never a `do` \
step or a shortcut only Izuki has: they need to learn where things are. In each step's `reasoning`, write ONE short spoken \
sentence, to them, saying what to do and why it matters (\"Click Bluetooth & devices: that's where every wireless gadget \
lives.\"). Izuki points at it and waits while they do it. The next look shows their result: say in a sentence whether it \
worked and what came back (explain command output or an error in plain words), then give the next step. If they did \
something else, say so kindly and how to get back. Never run a command for them that changes files or settings unless they \
ask. When it's complete, return no steps and sum up in two or three sentences what they learned.\n";

const WITH_ME_PROMPT: &str = "PRACTICAL MODE (do it with me): you and the person take turns, Izuki one step and they the \
next. Plan the real on-screen way, one or two steps at a time. In each step's `reasoning`, write ONE short spoken sentence, \
to them, saying what the step does and why (it's read out when it's their turn). The next look shows the result: say in a \
sentence whether it worked, then go on. When it's complete, return no steps and say in two sentences what was done.\n";

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn modes_come_from_the_request_itself() {
        assert_eq!(mode_of("teach me how to turn on bluetooth"), Mode::Teach);
        assert_eq!(mode_of("Show me how to find my IP address"), Mode::Teach);
        assert_eq!(mode_of("walk me through making a Wireshark filter"), Mode::Teach);
        assert_eq!(mode_of("explain how to change my wallpaper"), Mode::Teach);
        // A question is answered the usual way (the chat offers the three
        // modes when it's a job to do); directions aren't a lesson.
        assert_eq!(mode_of("how do I get to the airport"), Mode::Do);
        assert_eq!(mode_of("TEACHER MODE: the student just said: teach me this question"), Mode::Do);
        assert_eq!(mode_of("let's do it together: set up a python venv"), Mode::WithMe);
        assert_eq!(mode_of("do this with me step by step"), Mode::WithMe);
        assert_eq!(mode_of("turn on bluetooth"), Mode::Do);
        assert_eq!(mode_of("don't teach me, just do it"), Mode::Do);
        // Not turn-taking: "put together", "show me where".
        assert_eq!(mode_of("put together a list of my files"), Mode::Do);
        assert_eq!(mode_of("show me where the wifi button is"), Mode::Do);
    }

    // The tests share the one session: one at a time.
    static ONE: Mutex<()> = Mutex::new(());

    fn step(action: Intent) -> ActionStep {
        serde_json::from_value(serde_json::json!({ "action": action.as_str() })).unwrap()
    }

    #[test]
    fn turns_follow_the_mode_and_showing_is_always_izukis() {
        let _one = ONE.lock();
        begin(1, "teach me how to open settings");
        assert_eq!(hands_for(&step(Intent::Click)), Hands::Person);
        assert_eq!(hands_for(&step(Intent::Point)), Hands::Izuki);
        begin(2, "do it with me: open settings");
        assert_eq!(hands_for(&step(Intent::Click)), Hands::Izuki);
        record(Hands::Izuki, "opened Start");
        assert_eq!(hands_for(&step(Intent::Click)), Hands::Person);
        record(Hands::Person, "clicked Settings");
        assert_eq!(hands_for(&step(Intent::Key)), Hands::Izuki);
        begin(3, "open settings");
        assert_eq!(hands_for(&step(Intent::Click)), Hands::Izuki);
    }

    #[test]
    fn keep_going_keeps_a_teaching_session() {
        let _one = ONE.lock();
        begin(10, "teach me how to use ipconfig");
        record(Hands::Person, "opened the terminal");
        begin(11, "keep going");
        assert_eq!(mode(), Mode::Teach);
        assert_eq!(wrap_up().as_deref(), Some("You did that step yourself."));
        begin(12, "open notepad");
        assert_eq!(mode(), Mode::Do);
        assert_eq!(wrap_up(), None);
    }

    #[test]
    fn hand_offs_by_voice_only_while_a_task_runs() {
        let _one = ONE.lock();
        begin(20, "teach me how to rename a file");
        assert_eq!(heard("you do this one", false), None);
        assert!(heard("you do this one", true).is_some());
        assert_eq!(hands_for(&step(Intent::Click)), Hands::Izuki, "the next step is Izuki's, once");
        assert_eq!(hands_for(&step(Intent::Click)), Hands::Person);
        assert!(heard("do the rest", true).is_some());
        assert_eq!(mode(), Mode::Do);
        // "Done" only means something while a step is yours.
        assert_eq!(heard("done", true), None);
        assert!(!press(true));
    }

    #[test]
    fn a_job_gets_the_three_ways_offered_once() {
        let _one = ONE.lock();
        *OFFERED.lock() = None;
        let job = "Help me investigate suspicious login activity on my computer.";
        assert_eq!(offer(job).as_deref(), Some(OFFER));
        assert_eq!(offer(job), None, "asked once: the same words again mean go ahead");
        assert!(!offers("teach me how to investigate suspicious logins"), "they already said how");
        assert!(!offers("help me write an email to my teacher"));
        assert!(!offers("open notepad"));
        assert!(offers("can you help me set up a python virtual environment"));
    }

    #[test]
    fn the_person_is_told_what_to_do_in_plain_words() {
        let mut s = step(Intent::Click);
        s.snapped_to = Some("Bluetooth & devices".into());
        assert_eq!(say_what(&s), "Click “Bluetooth & devices”.");
        s.reasoning = "Click Bluetooth & devices: that's where your wireless gadgets live.".into();
        assert!(say_what(&s).starts_with("Click Bluetooth"));
        // Written as Izuki's own plan: said from the step instead.
        s.reasoning = "I will click the Bluetooth tab".into();
        assert_eq!(say_what(&s), "Click “Bluetooth & devices”.");
        let mut k = step(Intent::Key);
        k.key = Some("win+i".into());
        assert_eq!(say_what(&k), "Press win+i.");
        let mut t = step(Intent::Type);
        t.text_to_type = Some("ipconfig".into());
        assert_eq!(say_what(&t), "Type “ipconfig”.");
    }
}
