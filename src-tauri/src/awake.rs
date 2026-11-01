//! Keep the PC from going to sleep while Izuki works on your missions — and
//! only then. While a `KeepAwake` is alive, Windows won't sleep on its own;
//! when it's dropped (the missions finish, are stopped, or the thread ends
//! however it ends), Windows' own power settings are back in charge.
//!
//! Only the system is kept awake, not the display: the screen still turns
//! off and locks on your normal schedule, so walking away never leaves the
//! PC sitting unlocked. Work that needs the screen reports that the PC is
//! locked instead of pretending.

/// Holds sleep off for as long as it lives (on this thread).
pub struct KeepAwake {
    _private: (),
}

impl KeepAwake {
    pub fn new(why: &str) -> Self {
        #[cfg(windows)]
        unsafe {
            use windows::Win32::System::Power::{SetThreadExecutionState, ES_CONTINUOUS, ES_SYSTEM_REQUIRED};
            SetThreadExecutionState(ES_CONTINUOUS | ES_SYSTEM_REQUIRED);
        }
        eprintln!("[awake] keeping the PC awake: {why}");
        KeepAwake { _private: () }
    }
}

impl Drop for KeepAwake {
    fn drop(&mut self) {
        #[cfg(windows)]
        unsafe {
            use windows::Win32::System::Power::{SetThreadExecutionState, ES_CONTINUOUS};
            SetThreadExecutionState(ES_CONTINUOUS);
        }
        eprintln!("[awake] normal sleep settings are back");
    }
}


// ---------------------------------------------------------------------------
// "Keep my PC awake" — on request, for a while
// ---------------------------------------------------------------------------
//
// The owner's other coding assistant stopped mid-check because the laptop
// went to sleep, and its terminal went with it. The same happens to a long
// download, a render, an export or an overnight agent. `KeepAwake` already
// held sleep off for missions; this lets anyone ask for it, for as long as
// they say, and stops on its own. As with missions, only the system is held:
// the screen still turns off (and locks, where Windows is set to). Closing the
// lid or pressing the power button still puts it to sleep: those are the
// owner's own choices, and a request can't override them anyway.

use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{Duration, Instant};

/// "Keep my PC awake (for two hours)", "let it sleep", "are you keeping it awake?".
#[derive(Debug, Clone, PartialEq)]
pub enum Ask {
    /// Hold sleep off — for this long, or (None) until told, at most `LONGEST`.
    Hold(Option<Duration>),
    Release,
    Status,
}

/// The longest it holds on its own: an overnight run, but not a battery
/// left flattened for days by a request nobody remembers making.
pub const LONGEST: Duration = Duration::from_secs(12 * 3600);

/// Which hold is the current one, so an old one ending can't clear a new one.
static GEN: AtomicU64 = AtomicU64::new(0);
/// The current hold: its number and when it ends.
static HELD: parking_lot::Mutex<Option<(u64, Instant)>> = parking_lot::Mutex::new(None);
/// Dropping this wakes the holding thread, which then lets go.
static STOP: parking_lot::Mutex<Option<std::sync::mpsc::Sender<()>>> = parking_lot::Mutex::new(None);

/// Read a request to keep the PC awake (or stop), from plain words.
pub fn parse(said: &str) -> Option<Ask> {
    let s = said.to_lowercase().replace('\u{2019}', "'");
    let s = s.trim().trim_end_matches(['.', '!', '?']).trim();
    const RELEASE: &[&str] = &[
        "let it sleep", "let my pc sleep", "let the pc sleep", "let my computer sleep", "let my laptop sleep",
        "you can let it sleep", "allow sleep", "stop keeping it awake", "stop keeping my pc awake",
        "stop keeping the pc awake", "stop keeping my computer awake", "stop keeping my laptop awake",
        "normal sleep settings", "stop staying awake", "turn off keep awake", "turn off caffeine",
    ];
    const STATUS: &[&str] = &[
        "are you keeping my pc awake", "are you keeping it awake", "is my pc being kept awake",
        "is it being kept awake", "how long will it stay awake", "how long is it staying awake",
    ];
    if STATUS.iter().any(|p| s.contains(p)) {
        return Some(Ask::Status);
    }
    // A question about keeping it awake is answered, not done: "how do I keep
    // my laptop awake?", "should I keep it awake overnight?", "is it bad
    // to…". The chat explains (and can offer). Holding for twelve hours on a
    // question would be acting on a guess. Two parts, so it isn't a list of
    // every way to ask:
    // - a sentence that opens as a question. Not "when" ("when I leave, keep
    //   my pc awake") or "can I" ("can I keep it awake for 2 hours" wants it
    //   done); "how long…" was already taken as a status question above.
    const OPENS: &[&str] = &[
        "how", "why", "what", "which", "should", "is it", "is there", "does", "do i", "do you know",
        "will it", "would it", "explain", "i wonder",
    ];
    // - asking-how phrases anywhere ("can you tell me how to keep it awake").
    const ASKS: &[&str] = &[
        "how do", "how does", "how can", "how to", "how would", "how should", "how come", "why does",
        "why is", "why won't", "why doesn't", "way to", "possible to", "what happens", "what setting",
        "which setting", "is it bad", "is it safe", "is it ok", "is it okay",
    ];
    // Both only where a word starts and ends: "however long it takes" isn't
    // "how", and "the show tonight" holds the letters "how to".
    let word_at = |i: usize, p: &str| {
        !s[..i].ends_with(|c: char| c.is_alphanumeric()) && !s[i + p.len()..].starts_with(|c: char| c.is_alphanumeric())
    };
    let opens = OPENS.iter().any(|p| s.starts_with(p) && word_at(0, p));
    let asks = ASKS.iter().any(|p| s.match_indices(p).any(|(i, _)| word_at(i, p)));
    if opens || asks {
        return None;
    }
    // Release only after the question guard: "how do I change my normal
    // sleep settings?" holds "normal sleep settings" and asks, not tells.
    // "don't let it sleep" contains "let it sleep": checked the other way
    // round, asking to keep it awake would have let it sleep. Likewise
    // "never let", and "can't/won't let it sleep" isn't asking to let it.
    const NOT: &[&str] = &["don't", "dont", "do not", "never", "can't", "cannot", "won't", "not"];
    let negated = NOT.iter().any(|n| s.contains(&format!("{n} let")));
    if !negated && RELEASE.iter().any(|p| s.contains(p)) {
        return Some(Ask::Release);
    }
    // Told not to: "never let my laptop sleep" is a hold, but only as an
    // instruction ("something won't let my pc sleep" is a complaint). And
    // "don't keep my pc awake" / "you don't need to keep it awake anymore" is
    // letting it sleep — read as-is, the "keep my pc awake" inside it started
    // a hold. (MACHINE and RELEASE are the lists below and above.)
    const TOLD_NOT: &[&str] = &["don't", "dont", "do not", "never"];
    const NO_NEED: &[&str] = &["don't need to", "dont need to", "do not need to", "no need to"];
    /// One of `negs`, then one of the `list` phrases that start with `lead`.
    fn after(s: &str, negs: &[&str], lead: &str, list: &[&str]) -> bool {
        list.iter()
            .filter(|p| p.starts_with(lead))
            .any(|p| negs.iter().any(|n| s.contains(&format!("{n} {p}"))))
    }
    let told_not_to_sleep = after(s, TOLD_NOT, "let ", RELEASE);
    let told_not_to_keep = after(s, TOLD_NOT, "keep ", MACHINE) || after(s, NO_NEED, "keep ", MACHINE);
    if told_not_to_keep {
        return Some(Ask::Release);
    }
    // Said about the machine — unambiguous whoever else is in the sentence.
    const MACHINE: &[&str] = &[
        "keep my pc awake", "keep the pc awake", "keep my computer awake", "keep the computer awake",
        "keep my laptop awake", "keep the laptop awake", "keep it awake", "keep this pc awake",
        "don't let my pc sleep", "dont let my pc sleep", "don't let the pc sleep", "dont let the pc sleep",
        "don't let it sleep", "dont let it sleep", "don't let my computer sleep", "dont let my computer sleep",
        "don't let my laptop sleep", "dont let my laptop sleep", "do not let it sleep", "do not let my pc sleep",
        "stop my pc from sleeping",
        "stop it from sleeping", "stop my laptop from sleeping", "stop my computer from sleeping",
    ];
    // Said bare — could be about the person ("help me stay awake to study").
    const BARE: &[&str] = &["keep awake", "stay awake", "no sleep mode", "caffeine mode"];
    let machine = told_not_to_sleep || MACHINE.iter().any(|p| s.contains(p));
    let bare = BARE.iter().any(|p| s.contains(p));
    if !machine && !bare {
        return None;
    }
    if !machine {
        // Said bare, the phrase has to be the request itself ("stay awake",
        // "hey izuki, please stay awake for an hour", "turn on caffeine
        // mode") — not something mentioned in passing: "tips to keep awake in
        // class", "coffee helps you stay awake".
        const LEAD: &[&str] = &[
            "hey izuki", "izuki", "please", "can you", "could you", "would you", "will you", "ok", "okay",
            "just", "turn on", "switch on", "enable", "go into", "start",
        ];
        let mut rest = s;
        loop {
            let before = rest;
            for lead in LEAD {
                if let Some(r) = rest.strip_prefix(lead) {
                    if r.is_empty() || r.starts_with(|c: char| !c.is_alphanumeric()) {
                        rest = r.trim_start_matches(|c: char| !c.is_alphanumeric());
                    }
                }
            }
            if rest == before {
                break;
            }
        }
        if !BARE.iter().any(|p| rest.starts_with(p)) {
            return None;
        }
        let about_person = s
            .split(|c: char| !c.is_alphanumeric() && c != '\'')
            // Not "you": said to Izuki, "can you stay awake" means the PC.
            .any(|w| matches!(w, "me" | "myself" | "i" | "i'm" | "im" | "we" | "us"));
        if about_person {
            return None;
        }
    }
    Some(Ask::Hold(duration_in(s)))
}

/// "for 2 hours", "for thirty minutes", "for an hour", "1h", "90 mins",
/// "half an hour", "overnight" — or None (until told).
pub fn duration_in(s: &str) -> Option<Duration> {
    if s.contains("half an hour") || s.contains("half hour") {
        return Some(Duration::from_secs(30 * 60));
    }
    if s.contains("overnight") || s.contains("all night") {
        return Some(LONGEST);
    }
    // Number words, the way speech-to-text writes them: "five", "fifteen",
    // "twenty five", "twenty-five". A tens word on its own was read and its
    // ones word dropped, so "twenty five minutes" held for five.
    const ONES: [&str; 9] = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
    const TEENS: [&str; 10] =
        ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
    const TENS: [&str; 8] = ["twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
    let ones = |w: &str| ONES.iter().position(|n| *n == w).map(|i| i as f64 + 1.0);
    let tens = |w: &str| TENS.iter().position(|n| *n == w).map(|i| (i as f64 + 2.0) * 10.0);
    let small = |w: &str| match w {
        "a" | "an" => Some(1.0),
        _ => ones(w).or_else(|| TEENS.iter().position(|n| *n == w).map(|i| i as f64 + 10.0)),
    };
    let unit = |w: &str| -> Option<f64> {
        let w = w.trim_end_matches(|c: char| !c.is_alphanumeric());
        match w {
            "h" | "hr" | "hrs" | "hour" | "hours" => Some(3600.0),
            "m" | "min" | "mins" | "minute" | "minutes" => Some(60.0),
            // Held for a minute at least, but "10 seconds" must not fall
            // through to "until told" and hold for twelve hours.
            "s" | "sec" | "secs" | "second" | "seconds" => Some(1.0),
            _ => None,
        }
    };
    // "2h", "90mins", "1.5hrs", "2h30m": the whole word's seconds, and the
    // last unit (for "2h and a half").
    let compact = |w: &str| -> Option<(f64, f64)> {
        let (mut total, mut last, mut rest) = (0.0, 0.0, w.trim_end_matches(|c: char| !c.is_alphanumeric()));
        while !rest.is_empty() {
            let digits = rest.find(|c: char| !(c.is_ascii_digit() || c == '.')).unwrap_or(rest.len());
            let letters = rest[digits..].find(|c: char| c.is_ascii_digit()).map_or(rest.len(), |i| digits + i);
            if digits == 0 || digits == letters {
                return None;
            }
            let u = unit(&rest[digits..letters])?;
            total += rest[..digits].parse::<f64>().ok()? * u;
            last = u;
            rest = &rest[letters..];
        }
        (last > 0.0).then_some((total, last))
    };
    let words: Vec<&str> = s.split_whitespace().collect();
    // The number at word i, and the word after it.
    let number_at = |i: usize| -> Option<(f64, usize)> {
        let w = *words.get(i)?;
        if let Some((t, o)) = w.split_once('-') {
            if let (Some(t), Some(o)) = (tens(t), ones(o)) {
                return Some((t + o, i + 1));
            }
        }
        if let Some(t) = tens(w) {
            return Some(match words.get(i + 1).and_then(|n| ones(n)) {
                Some(o) => (t + o, i + 2),
                None => (t, i + 1),
            });
        }
        small(w).or_else(|| w.parse().ok()).map(|n| (n, i + 1))
    };
    // One part of a duration at word i: its seconds, its unit, the next word.
    let part = |i: usize| -> Option<(f64, f64, usize)> {
        // "2 hours", "an hour", "thirty minutes", "twenty five minutes"
        if let Some((n, at)) = number_at(i) {
            if let Some(u) = words.get(at).and_then(|w| unit(w)) {
                return Some((n * u, u, at + 1));
            }
        }
        compact(words.get(i)?).map(|(secs, u)| (secs, u, i + 1))
    };
    let word = |i: usize| words.get(i).map(|w| w.trim_end_matches(|c: char| !c.is_alphanumeric()));
    for i in 0..words.len() {
        let Some((mut total, mut last, mut next)) = part(i) else { continue };
        // The parts that follow add up: "1 hour 30 minutes", "an hour and a
        // half", "2 hours and 15 minutes". Stopping at the first held "an
        // hour and a half" for an hour.
        loop {
            let at = if word(next) == Some("and") { next + 1 } else { next };
            if word(at) == Some("a") && word(at + 1) == Some("half") {
                total += last / 2.0;
                next = at + 2;
            } else if let Some((secs, u, after)) = part(at) {
                total += secs;
                last = u;
                next = after;
            } else {
                break;
            }
        }
        return Some(clamp(total));
    }
    None
}

fn clamp(secs: f64) -> Duration {
    if !secs.is_finite() || secs <= 0.0 {
        return LONGEST;
    }
    // Capped before converting: from_secs_f64 panics on a value too big
    // for a Duration ("for 99999999999999999999 hours").
    Duration::from_secs_f64(secs.min(LONGEST.as_secs_f64())).max(Duration::from_secs(60))
}

/// A duration the way a person says it.
pub fn words(d: Duration) -> String {
    let mins = (d.as_secs() + 59) / 60;
    match (mins / 60, mins % 60) {
        (0, m) => format!("{m} minute{}", if m == 1 { "" } else { "s" }),
        (h, 0) => format!("{h} hour{}", if h == 1 { "" } else { "s" }),
        (h, m) => format!("{h} hour{} {m} minute{}", if h == 1 { "" } else { "s" }, if m == 1 { "" } else { "s" }),
    }
}

/// Hold sleep off for `d`. A new request replaces the old one. False if the
/// holding thread couldn't start — nothing is held then, not even the old one.
pub fn hold(d: Duration) -> bool {
    let (tx, rx) = std::sync::mpsc::channel::<()>();
    let gen = GEN.fetch_add(1, Ordering::SeqCst) + 1;
    // Replacing the sender drops the old one: the old thread wakes and lets go.
    *STOP.lock() = Some(tx);
    *HELD.lock() = Some((gen, Instant::now() + d));
    let spawned = std::thread::Builder::new().name("izuki-awake".into()).spawn(move || {
        let _awake = KeepAwake::new("you asked to keep the PC awake");
        let _ = rx.recv_timeout(d);
        let mut held = HELD.lock();
        if held.is_some_and(|(g, _)| g == gen) {
            *held = None;
        }
    });
    if spawned.is_err() {
        // Only this request's entry: a newer one may already be in its place.
        let mut held = HELD.lock();
        if held.is_some_and(|(g, _)| g == gen) {
            *held = None;
        }
        return false;
    }
    true
}

/// Let the PC sleep normally again. True if it was being held.
pub fn release() -> bool {
    let was = HELD.lock().take().is_some();
    STOP.lock().take();
    was
}

/// How much longer it's being held, if it is.
pub fn left() -> Option<Duration> {
    HELD.lock().map(|(_, until)| until.saturating_duration_since(Instant::now())).filter(|d| !d.is_zero())
}

/// On battery right now, and how full — `None` when plugged in, on a
/// desktop, or Windows can't say.
fn on_battery() -> Option<u8> {
    #[cfg(windows)]
    unsafe {
        use windows::Win32::System::Power::{GetSystemPowerStatus, SYSTEM_POWER_STATUS};
        let mut status = SYSTEM_POWER_STATUS::default();
        GetSystemPowerStatus(&mut status).ok()?;
        // 0 = on battery. 255 = no battery / unknown (a desktop on mains).
        if status.ACLineStatus == 0 && status.BatteryLifePercent != 255 {
            return Some(status.BatteryLifePercent);
        }
    }
    None
}

/// What Izuki says back.
pub fn handle(ask: Ask) -> String {
    match ask {
        Ask::Hold(d) => {
            let d = d.unwrap_or(LONGEST).min(LONGEST);
            if !hold(d) {
                return "I couldn't keep your PC awake \u{2014} Windows didn't let me start it. Your normal sleep settings are still in charge; try again in a moment.".into();
            }
            let until_told = if d == LONGEST { " (or until you say \u{201c}let it sleep\u{201d})" } else { "" };
            let battery = match on_battery() {
                Some(p) if p <= 30 => format!(" You're on battery at {p}% \u{2014} plug in, or it may run out before then."),
                Some(p) => format!(" You're on battery ({p}%), so it'll drain faster than usual."),
                None => String::new(),
            };
            format!(
                "Keeping your PC awake for {}{until_told}. The screen still turns off on its usual timer (and locks, if Windows is set to). Closing the lid or pressing the power button still puts it to sleep.{battery}",
                words(d)
            )
        }
        Ask::Release => {
            if release() {
                "Done \u{2014} your PC's normal sleep settings are back.".into()
            } else {
                "I'm not keeping it awake \u{2014} your normal sleep settings are already in charge.".into()
            }
        }
        Ask::Status => match left() {
            Some(d) => format!("Yes \u{2014} for about another {}. Say \u{201c}let it sleep\u{201d} to stop sooner.", words(d)),
            None => "No \u{2014} your PC's normal sleep settings are in charge.".into(),
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn holds_and_releases() {
        // Windows reports the previous state; holding and dropping must not panic
        // and must leave the thread back at "continuous only".
        let held = KeepAwake::new("test");
        drop(held);
        #[cfg(windows)]
        unsafe {
            use windows::Win32::System::Power::{SetThreadExecutionState, ES_CONTINUOUS, ES_SYSTEM_REQUIRED};
            let before = SetThreadExecutionState(ES_CONTINUOUS);
            assert_eq!(before.0 & ES_SYSTEM_REQUIRED.0, 0, "sleep is no longer held after drop");
        }
    }

    /// The machine, said any way — and the person, never mistaken for it.
    #[test]
    fn hears_a_request_to_keep_the_pc_awake() {
        use std::time::Duration;
        for said in [
            "keep my pc awake",
            "Keep my laptop awake while I'm away",
            "keep it awake while im in the shower",
            "don't let my pc sleep",
            "dont let it sleep for 2 hours",
            "stay awake",
            "can you stay awake for 2 hours",
            "caffeine mode",
            // "show tonight" holds the letters "how to": not a question.
            "keep my pc awake for the show tonight",
            // Requests that only look like questions at a glance.
            "when I leave, keep my pc awake",
            "however long it takes, keep my laptop awake",
            "can I keep my pc awake for 2 hours",
            "anyway, keep it awake",
            // Bare phrases, as the request itself.
            "hey izuki, please stay awake for an hour",
            "turn on caffeine mode",
            "ok just keep awake till 6",
        ] {
            assert!(matches!(parse(said), Some(Ask::Hold(_))), "{said}");
        }
        for said in [
            "help me stay awake while I study",
            "how do I keep awake in class",
            "I need to stay awake tonight",
            "what keeps you awake at night",
            "open spotify",
            "put my pc to sleep",
            "how do I keep my laptop awake?",
            "how to stop my computer from sleeping",
            "why does my pc keep going to sleep, I said keep it awake",
            "can you tell me how to keep my pc awake",
            "what's the best way to keep my laptop awake",
            "which setting will keep my pc awake",
            "should I keep my laptop awake overnight",
            "is it bad to keep my pc awake all night",
            "is it okay to keep my laptop awake",
            "what happens if I keep my pc awake",
            "is there any way to keep my pc awake",
            "does it hurt to keep my laptop awake",
            "do you know how to keep my pc awake",
            "explain how to keep it awake",
            "what's the easiest way to keep my pc awake",
            "how come my pc won't stay awake",
            "i wonder if I should keep my pc awake",
            "would it drain the battery to keep my laptop awake",
            // A bare phrase mentioned in passing.
            "tips to keep awake in class",
            "coffee helps you stay awake",
            "my cat likes caffeine mode videos",
        ] {
            assert_eq!(parse(said), None, "{said} is not a request to hold sleep off");
        }
        // "don't let it sleep" contains "let it sleep" — it must still hold.
        assert!(matches!(parse("don't let it sleep"), Some(Ask::Hold(_))), "a negated release is a hold");
        assert!(matches!(parse("do not let my pc sleep"), Some(Ask::Hold(_))));
        assert_eq!(parse("let it sleep"), Some(Ask::Release));
        assert_eq!(parse("ok you can let it sleep now"), Some(Ask::Release));
        assert_eq!(parse("stop keeping my pc awake"), Some(Ask::Release));
        // Negations, read the right way round.
        assert!(matches!(parse("never let it sleep"), Some(Ask::Hold(_))), "never letting it sleep is a hold");
        assert!(matches!(parse("never let my laptop sleep tonight"), Some(Ask::Hold(_))));
        assert_eq!(parse("don't keep my pc awake"), Some(Ask::Release), "not keeping it awake is letting it sleep");
        assert_eq!(parse("you don't need to keep it awake anymore"), Some(Ask::Release));
        assert_eq!(parse("it won't let my pc sleep"), None, "a complaint, not a request either way");
        assert_eq!(parse("i can't let it sleep, my download is running"), None);
        // Questions that hold a release phrase are asked, not told.
        assert_eq!(parse("how do I change my normal sleep settings?"), None, "a question, not a release");
        assert_eq!(parse("is it ok to let it sleep now"), None);
        assert_eq!(parse("back to normal sleep settings"), Some(Ask::Release));
        assert_eq!(parse("are you keeping my pc awake?"), Some(Ask::Status));
        assert_eq!(parse("keep my pc awake for 2 hours"), Some(Ask::Hold(Some(Duration::from_secs(7200)))));
    }

    #[test]
    fn reads_how_long() {
        use std::time::Duration;
        let h = |n: u64| Some(Duration::from_secs(n * 3600));
        let m = |n: u64| Some(Duration::from_secs(n * 60));
        assert_eq!(duration_in("for 2 hours"), h(2));
        assert_eq!(duration_in("for two hours"), h(2));
        assert_eq!(duration_in("for an hour"), h(1));
        assert_eq!(duration_in("for 30 minutes"), m(30));
        assert_eq!(duration_in("for thirty mins"), m(30));
        assert_eq!(duration_in("for 90m"), m(90));
        assert_eq!(duration_in("for 1.5hrs"), m(90));
        assert_eq!(duration_in("for half an hour"), m(30));
        // Parts that follow each other add up.
        assert_eq!(duration_in("for an hour and a half"), m(90), "not just the hour");
        assert_eq!(duration_in("for 1 hour 30 minutes"), m(90));
        assert_eq!(duration_in("for 2 hours and 15 minutes please"), m(135));
        assert_eq!(duration_in("for 2h30m"), m(150));
        assert_eq!(duration_in("for two hours and a half, thanks"), m(150));
        // Number words as speech-to-text writes them.
        assert_eq!(duration_in("for twenty five minutes"), m(25), "not five");
        assert_eq!(duration_in("for twenty-five minutes"), m(25));
        assert_eq!(duration_in("for forty-five minutes"), m(45));
        assert_eq!(duration_in("for seventeen minutes"), m(17));
        assert_eq!(duration_in("for eighty minutes"), m(80));
        assert_eq!(duration_in("for seventy five mins"), m(75));
        assert_eq!(duration_in("for one hour and twenty minutes"), m(80));
        assert_eq!(duration_in("for twenty minutes"), m(20), "a tens word alone still counts");
        // Times of day and ordinals aren't durations.
        assert_eq!(duration_in("until 3am"), None);
        assert_eq!(duration_in("on the 2nd floor"), None);
        assert_eq!(duration_in("keep it awake overnight"), Some(LONGEST));
        assert_eq!(duration_in("keep my pc awake"), None, "no time said: until told");
        // Never past the cap, never less than a minute.
        assert_eq!(duration_in("for 400 hours"), Some(LONGEST));
        assert_eq!(duration_in("for 99999999999999999999 hours"), Some(LONGEST), "too big for a Duration: capped, not a panic");
        assert_eq!(duration_in("for 1e300 hours"), Some(LONGEST));
        assert_eq!(duration_in("for 0 minutes"), Some(LONGEST), "a zero is a slip, not 'no time at all'");
        assert_eq!(duration_in("for 10 seconds"), m(1), "seconds round up to the one-minute minimum, never to twelve hours");
    }

    #[test]
    fn says_durations_like_a_person() {
        use std::time::Duration;
        assert_eq!(words(Duration::from_secs(60)), "1 minute");
        assert_eq!(words(Duration::from_secs(45 * 60)), "45 minutes");
        assert_eq!(words(Duration::from_secs(3600)), "1 hour");
        assert_eq!(words(Duration::from_secs(5400)), "1 hour 30 minutes");
        assert_eq!(words(LONGEST), "12 hours");
    }

    /// Holding and letting go, for real: a short hold is visible, ends on
    /// release, and a newer hold isn't cleared when an older one finishes.
    #[test]
    fn holds_releases_and_never_lets_an_old_hold_clear_a_new_one() {
        use std::time::Duration;
        let _serial = HOLD_TESTS.lock();
        release();
        assert!(hold(Duration::from_millis(150)), "the holding thread starts");
        assert!(left().is_some(), "held right after asking");
        std::thread::sleep(Duration::from_millis(400));
        assert!(left().is_none(), "lets go on its own when the time is up");

        hold(Duration::from_secs(60));
        hold(Duration::from_millis(100)); // replaces it
        std::thread::sleep(Duration::from_millis(300));
        assert!(left().is_none(), "the newer, shorter hold is the one that counts");

        // The replaced thread wakes at once (its sender is dropped) and must
        // not take the newer hold down with it on the way out.
        hold(Duration::from_millis(100));
        hold(Duration::from_secs(60));
        std::thread::sleep(Duration::from_millis(300));
        assert!(left().is_some(), "an older hold ending cleared the newer one");

        hold(Duration::from_secs(60));
        assert!(release(), "release reports it was holding");
        assert!(left().is_none());
        assert!(!release(), "and that it no longer is");
    }

    /// The hold tests share one global hold, so they run one at a time.
    static HOLD_TESTS: parking_lot::Mutex<()> = parking_lot::Mutex::new(());
}
