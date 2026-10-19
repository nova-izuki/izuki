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

/// A short yes, on its own: "yes", "yeah do it", "sure, go ahead", "ok please".
pub fn is_yes(said: &str) -> bool {
    let s = said.trim().trim_end_matches(['.', '!', '?']).to_lowercase();
    let words: Vec<&str> = s.split(|c: char| !c.is_alphanumeric() && c != '\'').filter(|w| !w.is_empty()).collect();
    if words.is_empty() || words.len() > 5 {
        return false;
    }
    const YES: &[&str] = &["yes", "yeah", "yep", "yup", "ya", "yea", "sure", "ok", "okay", "please", "go", "ahead", "do", "it", "that", "alright", "absolutely", "definitely", "nova", "izuki", "bet", "pls", "plz"];
    const START: &[&str] = &["yes", "yeah", "yep", "yup", "ya", "yea", "sure", "ok", "okay", "alright", "absolutely", "definitely", "bet", "please", "go", "do"];
    // "Go" or "do" alone isn't a yes; "go ahead" and "do it" are.
    let bare_verb = words.len() == 1 && ["go", "do"].contains(&words[0]);
    !bare_verb && START.contains(&words[0]) && words.iter().all(|w| YES.contains(w))
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
