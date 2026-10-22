//! Offers: when Izuki offers to do something by itself — "Your drive is
//! nearly full. Want me to find what's taking the space?" — a plain "yes"
//! does exactly that. The offer is remembered with the request it stands
//! for, for a few minutes; "no" (or anything else) lets it go.
//!
//! Anything already waiting on a yes goes first: a command waiting for
//! "allow" (chat.rs), or a task paused for "keep going" (brain.rs) unless
//! the offer is newer than it.

use std::time::{Duration, Instant};

use parking_lot::Mutex;

/// How long a "yes" still answers the offer.
const FRESH: Duration = Duration::from_secs(5 * 60);

/// (what "yes" will ask for, when it was offered).
static OFFER: Mutex<Option<(String, Instant)>> = Mutex::new(None);

/// Remember an offer just made: `request` is what a "yes" asks for, in the
/// words a person would use ("what's taking up space").
pub fn make(request: &str) {
    *OFFER.lock() = Some((request.trim().to_string(), Instant::now()));
}

/// A short yes, on its own, in everyday words: "yes", "yeah do it", "sure, go
/// ahead", "yea bro", "bet, run it", "yesss", "for sure", "let's go", "why not".
/// Not "yes but first open Spotify", "let me think", "go away" or "yes?".
pub fn is_yes(said: &str) -> bool {
    let s = said.trim().trim_end_matches(['.', '!']).to_lowercase().replace('\u{2019}', "'");
    // "Yes?" asks something back.
    if s.ends_with('?') {
        return false;
    }
    let words: Vec<&str> = s.split(|c: char| !c.is_alphanumeric() && c != '\'').map(|w| w.trim_matches('\'')).filter(|w| !w.is_empty()).collect();
    if words.is_empty() || words.len() > 6 {
        return false;
    }
    // Stretched for feeling: "yesss", "yeaaa", "okayyy", "brooo", "gooo".
    let squash = |w: &str| -> String {
        let mut out = String::new();
        for c in w.chars() {
            if !out.ends_with(c) {
                out.push(c);
            }
        }
        out
    };
    let any = |list: &[&str], w: &str| list.contains(&w) || list.contains(&squash(w).as_str());
    // A yes on its own.
    const ALONE: &[&str] = &[
        "yes", "yeah", "yep", "yup", "ya", "yea", "yeh", "yah", "yh", "yuh", "yas", "yesir", "yessir", "sure", "ok", "okay", "k", "kk", "alright",
        "aight", "ight", "absolutely", "definitely", "certainly", "bet", "please", "pls", "plz", "ofc", "fs", "cool", "perfect", "mhm",
    ];
    // How a yes starts ("go ahead", "do it", "for sure", "let's go", "run it").
    const START: &[&str] = &["go", "do", "for", "of", "sounds", "lets", "let's", "let", "why", "run", "connect", "set", "hook", "start", "proceed"];
    // What can follow.
    const MORE: &[&str] = &[
        "go", "ahead", "do", "it", "that", "this", "nova", "izuki", "for", "of", "course", "sounds", "good", "great", "fine", "lets", "let's", "let", "s",
        "why", "not", "bro", "bruh", "fam", "man", "dude", "sir", "g", "gang", "lol", "now", "then", "just", "right", "run", "connect", "set", "up", "hook",
        "start", "proceed", "please", "pls", "plz", "me", "on", "already", "thing",
    ];
    if words.len() == 1 {
        return any(ALONE, words[0]);
    }
    // "Yeah, not now", "yes not yet": a no in the end — "why not" is the only yes with "not".
    if words.iter().enumerate().any(|(i, w)| squash(w) == "not" && (i == 0 || words[i - 1] != "why")) {
        return false;
    }
    (any(ALONE, words[0]) || START.contains(&words[0])) && words.iter().all(|w| any(ALONE, w) || any(MORE, w))
}

/// The request a "yes" would ask for right now, if an offer is still fresh
/// (without using it up).
pub fn pending() -> Option<String> {
    OFFER.lock().as_ref().filter(|(_, at)| at.elapsed() <= FRESH).map(|(r, _)| r.clone())
}

/// A no: "no", "nah", "no thanks", "no, don't", "no way", "not now".
pub fn is_no(said: &str) -> bool {
    let s = said.trim().trim_end_matches(['.', '!', '?']).to_lowercase();
    let first = s.split(|c: char| !c.is_alphanumeric()).find(|w| !w.is_empty()).unwrap_or("");
    ["no", "nah", "nope"].contains(&first) || ["not now", "maybe later", "don't", "dont", "never mind", "nevermind"].contains(&s.as_str())
}

/// If `said` answers a fresh offer, the request it stands for (the offer is
/// used up); else `None`. A "no" just lets the offer go.
pub fn answer(said: &str) -> Option<String> {
    let mut offer = OFFER.lock();
    let (request, at) = offer.clone()?;
    if at.elapsed() > FRESH {
        *offer = None;
        return None;
    }
    if is_no(said) {
        *offer = None;
        return None;
    }
    if !is_yes(said) {
        return None;
    }
    // Something else is already waiting on this yes: a command waiting for
    // "allow", or a task paused after the offer was made.
    if crate::chat::voice_pending() || crate::brain::unfinished_since().is_some_and(|t| t > at) {
        return None;
    }
    *offer = None;
    eprintln!("[offers] “{}” → {request}", said.trim());
    Some(request)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hears_a_plain_yes() {
        for said in ["yes", "Yeah.", "yes please", "sure, go ahead", "ok do it", "yeah do that", "bet", "please do"] {
            assert!(is_yes(said), "{said}");
        }
        for said in ["yesterday's notes", "yes but first open spotify and play lofi", "do my homework", "no", "what's taking up space"] {
            assert!(!is_yes(said), "{said}");
        }
        // Everyday yeses: a casual one used to go to the screen helper instead.
        for said in [
            "yea bro", "yuh", "yesss", "Yeaaa", "bet, run it", "for sure", "let's go", "lets gooo", "of course", "sounds good", "why not", "ok connect it",
            "yeah set it up", "aight bet", "k", "yessir", "ofc", "yes pls", "sure thing bro",
        ] {
            assert!(is_yes(said), "{said}");
        }
        for said in [
            "let me think", "go away", "set an alarm", "run chrome", "start over", "yes?", "why", "not now", "cool story", "sure?", "connect my keyboard",
            "yeah not now", "yes not yet", "ok but not now", "yeah nottt now",
        ] {
            assert!(!is_yes(said), "{said}");
        }
        assert!(is_no("no thanks") && is_no("Nah.") && is_no("no, don't") && is_no("no way") && !is_no("now") && !is_no("nobody told me"));
        assert!(!is_yes("go") && !is_yes("do") && is_yes("go ahead") && is_yes("do it"));
    }

    #[test]
    fn a_yes_does_what_was_offered_once() {
        make("what's taking up space on my drive");
        assert_eq!(answer("what's the weather"), None, "something else: the offer waits");
        assert_eq!(answer("yeah do it").as_deref(), Some("what's taking up space on my drive"));
        assert_eq!(answer("yes"), None, "used up");
        make("speed up my pc");
        assert_eq!(answer("no thanks"), None);
        assert_eq!(answer("yes"), None, "a no lets it go");
    }
}
