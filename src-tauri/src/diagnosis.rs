//! "Why are you so slow?" — answered from what the app knows about itself.
//!
//! Deliberately no model call. This is the question people ask when the brains
//! are the problem, so handing it to a brain is the one thing that cannot
//! work — and the honest answers (an old build still running, every free tier
//! resting) are all in memory anyway. It reads the live rests, how many brains
//! are set up, and whether a newer Izuki is already downloaded and waiting.
//!
//! It only speaks when the question is about Izuki itself: "why is my PC slow"
//! is a question for a brain, not for this file.

/// How long, said the way a person says it.
fn clock(secs: u64) -> String {
    match secs {
        0..=59 => format!("{secs}s"),
        60..=3599 if secs % 60 == 0 => format!("{}m", secs / 60),
        60..=3599 => format!("{}m {}s", secs / 60, secs % 60),
        _ if secs % 3600 == 0 => format!("{}h", secs / 3600),
        _ => format!("{}h {}m", secs / 3600, (secs % 3600) / 60),
    }
}

/// The words people use when they mean "you, Izuki" and not "my computer".
fn about_itself(q: &str) -> bool {
    q.split(|c: char| !c.is_alphanumeric() && c != '\'')
        .any(|word| matches!(word, "you" | "your" | "you're" | "youre" | "izuki" | "ur" | "u"))
}

/// The complaint, not a how-to question.
fn about_trouble(q: &str) -> bool {
    [
        "slow", "sluggish", "lag", "laggy", "lagging", "dumb", "stupid", "broken", "stuck",
        "hang", "hanging", "frozen", "freezing", "fail", "failed", "failing", "useless",
        "not working", "doesn't work", "does not work", "didn't work", "did not work",
        "didn't do", "did not do", "didn't you", "didnt you", "not doing", "ignoring", "ignored",
        "gave up", "gives up",
        "why can't", "why cant", "why won't", "why wont", "can't do", "cant do",
        "nothing happened", "nothing happens", "keeps", "again and again",
    ]
    .iter()
    .any(|word| q.contains(word))
}

fn tidy(asked: &str) -> String {
    asked.replace(['\u{2019}', '\u{2018}'], "'").to_lowercase()
}

/// Is this the "why are you slow?" question at all? (Pure, so it can be
/// tested without a running app.)
pub fn wants(asked: &str) -> bool {
    let q = tidy(asked);
    !q.is_empty() && about_itself(&q) && about_trouble(&q)
}

/// The answer, when the question is about Izuki's own speed or failures.
pub fn why(asked: &str) -> Option<String> {
    wants(asked).then(report)
}

/// What is actually true right now, in the order that explains the most.
fn report() -> String {
    let mut said: Vec<String> = Vec::new();
    let mine = env!("CARGO_PKG_VERSION");

    // 1. An old build still running explains more "you never fixed it" than
    //    anything else — every fix ships in a release, and nothing installs it
    //    for you.
    if let Some((version, ready)) = crate::updates::offered_version() {
        said.push(format!(
            "First, and probably most of it: I'm running {mine} and **{version}** is out{}. Some of what's annoying you may already be fixed in it.",
            if ready { ", already downloaded" } else { "" }
        ));
    }

    // 2. Brains that are benched right now — the literal reason a task waits.
    let resting = crate::brain::resting_now();
    let chain = crate::brain::brain_chain();
    // Rests are per *provider*, while the chain is per model (one key can offer
    // six). Counting models here said "2 of my 18 brains" and made "all of
    // them are out" impossible to ever be true.
    let brains: std::collections::BTreeSet<&str> = chain.iter().map(|c| c.id.as_str()).collect();
    let total = brains.len();
    if chain.is_empty() {
        said.push("No AI brain is set up at all, so anything needing one can't answer — add a free key in Settings → Izuki's brain.".into());
    } else if resting.is_empty() {
        said.push(format!(
            "{total} AI brain{} set up, and none {} resting: the delay is the model itself thinking, not me waiting on a limit.",
            if total == 1 { " is" } else { "s are" },
            if total == 1 { "is" } else { "are" }
        ));
    } else {
        let list: Vec<String> = resting.iter().take(4).map(|(name, secs)| format!("{name} {}s", clock(*secs))).collect();
        said.push(format!(
            "{} of my {total} AI brains {} benched right now: {}. While a free tier is benched I either wait for it or answer with a smaller, dumber one — that's the \"slow and stupid\" you're seeing.",
            resting.len(),
            if resting.len() == 1 { "is" } else { "are" },
            list.join(", ")
        ));
        if resting.len() >= total {
            said.push("All of them at once means nothing can answer until one comes back — asking again in a moment genuinely helps, asking again instantly doesn't.".into());
        }
    }

    // 3. The one thing that makes every brain free, and every brain slow.
    if let Some(wait) = crate::freebrains::soonest_wake() {
        if wait.as_secs() > 0 {
            said.push(format!("A free model is rate limited for another {} — waiting that out beats hammering it.", clock(wait.as_secs())));
        }
    }

    said.join("\n\n")
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_answers_the_complaint_and_ignores_real_questions() {
        // What people actually type.
        for asked in [
            "why are you so slow",
            "ur so slow bro",
            "why do you keep failing",
            "why didn't you do it",
            "why are you being dumb",
            "why can't you do it",
            "izuki why are you lagging",
        ] {
            assert!(super::wants(asked), "should have answered: {asked}");
        }
        // Not about Izuki, so a brain should answer instead.
        for asked in [
            "why is my pc slow",
            "why is chrome lagging",
            "how do I make this faster",
            "what's the weather",
            "what is a lag switch",
            "",
        ] {
            assert!(!super::wants(asked), "should not have answered: {asked}");
        }
    }

    #[test]
    fn a_benched_brain_is_named_with_its_time() {
        assert_eq!(super::clock(0), "0s");
        assert_eq!(super::clock(14), "14s");
        assert_eq!(super::clock(60), "1m");
        assert_eq!(super::clock(100), "1m 40s");
        assert_eq!(super::clock(3600), "1h");
        assert_eq!(super::clock(5400), "1h 30m");
    }
}
