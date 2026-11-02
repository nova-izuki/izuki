//! Messages to the phone that couldn't leave yet.
//!
//! Waking the laptop, Izuki ran its checks before Wi-Fi was back: eight
//! school heads-ups went to Discord in the first second, every one failed with
//! "error sending request", and every one was gone. A message that never
//! reached the server is safe to send again, so it waits here and goes once
//! the internet is back, in the order it was written, with the time it was
//! meant for. Anything the server did receive (an error it answered, a reply
//! that timed out half-way) is never sent twice.

use std::collections::VecDeque;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::{Duration, Instant};

use parking_lot::Mutex;

/// What didn't go out, and why. `rest` is the part still to send: a long
/// message goes in pieces, and the pieces that went aren't sent again.
pub struct Unsent {
    pub rest: String,
    pub error: anyhow::Error,
}

impl Unsent {
    pub fn all(text: &str, error: impl Into<anyhow::Error>) -> Unsent {
        Unsent { rest: text.to_string(), error: error.into() }
    }
}

/// Sends one message on a channel, reading that channel's current settings
/// (so unpairing while a message waits drops it: there's nowhere to send).
pub type Sender = fn(&str) -> Result<(), Unsent>;

/// Most waiting at once; past this the oldest go.
const MOST: usize = 20;
/// Longer than this and it isn't news any more.
const STALE: Duration = Duration::from_secs(6 * 3600);
/// Waited this long: say when it was from.
const LATE: Duration = Duration::from_secs(120);

struct Waiting {
    channel: &'static str,
    send: Sender,
    text: String,
    since: Instant,
    /// "1:51 AM", for the note on a late message.
    written: String,
    /// The note is on it already (the rest of a message that went in part).
    noted: bool,
}

static QUEUE: Mutex<VecDeque<Waiting>> = Mutex::new(VecDeque::new());
/// One sender at a time, so two passes can't send the same message.
static SENDING: Mutex<()> = Mutex::new(());
static RETRYING: AtomicBool = AtomicBool::new(false);
static KICK: AtomicBool = AtomicBool::new(false);

/// True when the error says the request never reached the server: no
/// connection (offline, Wi-Fi still waking, DNS down). Nothing went out, so
/// sending it again can't send it twice.
pub fn never_left(e: &anyhow::Error) -> bool {
    e.chain().any(|c| c.downcast_ref::<reqwest::Error>().is_some_and(reqwest::Error::is_connect))
}

/// Send now, or keep it for when the internet is back. Blocks while
/// sending: call it from the channel's own thread.
pub fn send_or_keep(channel: &'static str, send: Sender, text: &str) {
    // Held until the message is sent or kept: a retry pass takes a message
    // out of the queue while it tries it, and a failed one is only queued
    // after its try — either way, nothing from the same channel overtakes it.
    let _one = SENDING.lock();
    // Others from this channel are still waiting: this one goes after them.
    if waiting(channel) {
        keep(channel, send, text, false);
        KICK.store(true, Ordering::SeqCst);
        return;
    }
    match send(text) {
        Ok(()) => {}
        Err(u) if never_left(&u.error) => {
            eprintln!("[outbox] {channel}: offline — keeping the message for when the internet is back");
            keep(channel, send, &u.rest, false);
        }
        Err(u) => eprintln!("[{}] couldn't send: {}", channel.to_lowercase(), u.error),
    }
}

/// Messages from this channel still waiting.
pub fn waiting(channel: &str) -> bool {
    QUEUE.lock().iter().any(|w| w.channel == channel)
}

fn keep(channel: &'static str, send: Sender, text: &str, noted: bool) {
    if text.trim().is_empty() {
        return;
    }
    {
        let mut q = QUEUE.lock();
        q.push_back(Waiting {
            channel,
            send,
            text: text.to_string(),
            since: Instant::now(),
            written: chrono::Local::now().format("%-I:%M %p").to_string(),
            noted,
        });
        while q.len() > MOST {
            if let Some(gone) = q.pop_front() {
                eprintln!("[outbox] {}: too many waiting — dropped the oldest", gone.channel);
            }
        }
    }
    start_retrying();
}

/// One pass: send what's waiting, in order. A channel that still can't
/// reach its server keeps the rest of its messages back (their order is the
/// point), but not the other channel's: Telegram blocked on a network
/// mustn't hold Discord up. How many went.
fn flush() -> usize {
    // (Nothing is added while this runs: keeping one needs this lock too.)
    let _one = SENDING.lock();
    let mut sent = 0;
    let mut blocked: Vec<&'static str> = Vec::new();
    let mut later: VecDeque<Waiting> = VecDeque::new();
    loop {
        let Some(mut w) = QUEUE.lock().pop_front() else { break };
        if w.since.elapsed() > STALE {
            eprintln!("[outbox] {}: dropped a message that waited over 6 hours", w.channel);
            continue;
        }
        if blocked.contains(&w.channel) {
            later.push_back(w);
            continue;
        }
        let note = !w.noted && w.since.elapsed() >= LATE;
        let text = if note { format!("(From {}, while I was offline) {}", w.written, w.text) } else { w.text.clone() };
        match (w.send)(&text) {
            Ok(()) => sent += 1,
            Err(u) if never_left(&u.error) => {
                // Still offline: kept as it was (plus the note if part of
                // it, with the note, already went).
                if u.rest != text {
                    w.text = u.rest;
                    w.noted = w.noted || note;
                }
                blocked.push(w.channel);
                later.push_back(w);
            }
            Err(u) => eprintln!("[{}] couldn't send a waiting message: {}", w.channel.to_lowercase(), u.error),
        }
    }
    QUEUE.lock().extend(later);
    if sent > 0 {
        eprintln!("[outbox] sent {sent} message(s) that waited for the internet");
    }
    sent
}

/// Try again a little later each time (10 s, 20 s … every 5 minutes), sooner
/// when a new message comes. Stops when nothing is waiting.
fn start_retrying() {
    if cfg!(test) || RETRYING.swap(true, Ordering::SeqCst) {
        return;
    }
    let started = std::thread::Builder::new().name("izuki-outbox".into()).spawn(|| {
        let mut wait = Duration::from_secs(10);
        loop {
            let until = Instant::now() + wait;
            while Instant::now() < until && !KICK.swap(false, Ordering::SeqCst) {
                std::thread::sleep(Duration::from_secs(1));
            }
            let before = QUEUE.lock().len();
            let sent = flush();
            let left = QUEUE.lock().len();
            if left == 0 {
                RETRYING.store(false, Ordering::SeqCst);
                // A message kept between the check and the flag: go round again.
                if QUEUE.lock().is_empty() || RETRYING.swap(true, Ordering::SeqCst) {
                    return;
                }
            }
            wait = if sent > 0 && left < before { Duration::from_secs(10) } else { (wait * 2).min(Duration::from_secs(300)) };
        }
    });
    if started.is_err() {
        RETRYING.store(false, Ordering::SeqCst);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// The tests share the queue and the fake channel.
    static TESTS: Mutex<()> = Mutex::new(());
    static ONLINE: AtomicBool = AtomicBool::new(false);
    static GOT: Mutex<Vec<String>> = Mutex::new(Vec::new());

    /// A real "couldn't connect" from reqwest: a port nobody listens on.
    fn offline_error() -> anyhow::Error {
        let port = std::net::TcpListener::bind("127.0.0.1:0").unwrap().local_addr().unwrap().port();
        let e = reqwest::blocking::Client::new().get(format!("http://127.0.0.1:{port}/")).send().unwrap_err();
        anyhow::Error::from(e).context("Discord didn't answer")
    }

    fn fake(text: &str) -> Result<(), Unsent> {
        if !ONLINE.load(Ordering::SeqCst) {
            return Err(Unsent::all(text, offline_error()));
        }
        if text.contains("refused") {
            return Err(Unsent::all(text, anyhow::anyhow!("Discord answered 403 Forbidden")));
        }
        GOT.lock().push(text.to_string());
        Ok(())
    }

    fn reset() {
        QUEUE.lock().clear();
        GOT.lock().clear();
        ONLINE.store(false, Ordering::SeqCst);
    }

    #[test]
    fn tells_a_message_that_never_left_from_one_the_server_got() {
        assert!(never_left(&offline_error()));
        assert!(!never_left(&anyhow::anyhow!("Discord answered 403 Forbidden")));
        assert!(!never_left(&anyhow::anyhow!("error sending request")), "words alone prove nothing");
    }

    #[test]
    fn what_couldnt_leave_goes_once_the_internet_is_back_in_order() {
        let _t = TESTS.lock();
        reset();
        send_or_keep("Discord", fake, "📚 3 things due soon");
        send_or_keep("Discord", fake, "Coming up: standup");
        assert!(GOT.lock().is_empty());
        assert_eq!(QUEUE.lock().len(), 2);

        // Still offline: nothing lost, nothing reordered.
        assert_eq!(flush(), 0);
        assert_eq!(QUEUE.lock().len(), 2);

        ONLINE.store(true, Ordering::SeqCst);
        // Online again, a new one waits behind the old ones.
        send_or_keep("Discord", fake, "Reminder: call mum");
        assert!(GOT.lock().is_empty(), "it must not overtake the ones waiting");
        assert_eq!(flush(), 3);
        assert_eq!(*GOT.lock(), ["📚 3 things due soon", "Coming up: standup", "Reminder: call mum"]);
        assert!(!waiting("Discord"));

        // Back to normal: straight out.
        send_or_keep("Discord", fake, "hi");
        assert_eq!(GOT.lock().last().map(String::as_str), Some("hi"));
    }

    fn always_online(text: &str) -> Result<(), Unsent> {
        GOT.lock().push(format!("telegram: {text}"));
        Ok(())
    }

    #[test]
    fn one_channel_offline_doesnt_hold_up_the_other() {
        let _t = TESTS.lock();
        reset();
        send_or_keep("Discord", fake, "first");
        send_or_keep("Discord", fake, "second");
        keep("Telegram", always_online, "waited behind them", false);
        assert_eq!(flush(), 1);
        assert_eq!(*GOT.lock(), ["telegram: waited behind them"]);
        let q: Vec<String> = QUEUE.lock().iter().map(|w| w.text.clone()).collect();
        assert_eq!(q, ["first", "second"], "the offline channel's keep their order");
    }

    #[test]
    fn a_message_the_server_answered_is_never_sent_again() {
        let _t = TESTS.lock();
        reset();
        ONLINE.store(true, Ordering::SeqCst);
        send_or_keep("Discord", fake, "refused by Discord");
        assert!(QUEUE.lock().is_empty(), "the server had it: sending again could send it twice");
    }

    #[test]
    fn a_late_message_says_when_it_was_from_and_a_stale_one_is_dropped() {
        let _t = TESTS.lock();
        reset();
        send_or_keep("Discord", fake, "late one");
        send_or_keep("Discord", fake, "ancient one");
        {
            let mut q = QUEUE.lock();
            q[0].since = Instant::now() - Duration::from_secs(5 * 60);
            q[0].written = "1:51 AM".into();
            q[1].since = Instant::now() - Duration::from_secs(7 * 3600);
        }
        ONLINE.store(true, Ordering::SeqCst);
        assert_eq!(flush(), 1);
        assert_eq!(*GOT.lock(), ["(From 1:51 AM, while I was offline) late one"]);
        assert!(QUEUE.lock().is_empty());
    }

    #[test]
    fn only_the_newest_few_wait() {
        let _t = TESTS.lock();
        reset();
        for i in 0..(MOST + 5) {
            send_or_keep("Discord", fake, &format!("message {i}"));
        }
        let q = QUEUE.lock();
        assert_eq!(q.len(), MOST);
        assert_eq!(q.front().map(|w| w.text.as_str()), Some("message 5"));
    }
}
