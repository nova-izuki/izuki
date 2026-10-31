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

/// The brains sentence, kept apart from the rest of the report so its numbers
/// can be checked without a running app.
fn brains_line(total: usize, resting: &[(String, u64)]) -> String {
    if total == 0 {
        return "No AI brain is set up at all, so anything needing one can't answer — add a free key in Settings → Izuki's brain.".into();
    }
    // A count larger than the number of brains reads as a bug, because it is
    // one; the list is cut to match so the sentence can never contradict it.
    let benched = resting.len().min(total);
    if benched == 0 {
        return format!(
            "{total} AI brain{} set up, and none {} resting: the delay is the model itself thinking, not me waiting on a limit.",
            if total == 1 { " is" } else { "s are" },
            if total == 1 { "is" } else { "are" }
        );
    }
    // clock() already says its own unit — adding "s" here read "Groq 15ss".
    let list: Vec<String> = resting.iter().take(benched.min(4)).map(|(name, secs)| format!("{name} {}", clock(*secs))).collect();
    let mut said = format!(
        "{benched} of my {total} AI brain{} {} benched right now: {}. While a free tier is benched I either wait for it or answer with a smaller, dumber one — that's the \"slow and stupid\" you're seeing.",
        if total == 1 { "" } else { "s" },
        if benched == 1 { "is" } else { "are" },
        list.join(", ")
    );
    if benched >= total {
        said.push_str("\n\nAll of them at once means nothing can answer until one comes back — asking again in a moment genuinely helps, asking again instantly doesn't.");
    }
    said
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
    // The total is every brain that is *set up*, resting or not. It used to be
    // `brain_chain`, which has the benched ones already taken out, so three
    // benched brains out of two still available read "3 of my 2".
    let configured = crate::brain::configured_brains();
    let mut ids: Vec<&str> = configured.iter().map(|c| c.id.as_str()).collect();
    ids.sort_unstable();
    ids.dedup();
    said.push(brains_line(ids.len(), &resting));

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
    fn the_benched_count_never_exceeds_the_brains_that_exist() {
        let resting = vec![
            ("Groq".to_string(), 16),
            ("Gemini".to_string(), 75),
            ("Nvidia".to_string(), 75),
        ];
        // Two brains set up, three resting entries: the old wording said
        // "3 of my 2", which is the sentence from the owner's screenshot.
        let said = super::brains_line(2, &resting);
        assert!(said.starts_with("2 of my 2"), "said: {said}");
        assert!(!said.contains("of my 2 AI brains are benched right now: Groq, Gemini, Nvidia"), "a clamped count kept the whole list: {said}");
        assert!(said.contains("All of them at once"), "everything is resting: {said}");

        // Nothing benched: no count of zero, and no "all of them" tail.
        let calm = super::brains_line(5, &[]);
        assert!(calm.starts_with("5 AI brains are set up"), "said: {calm}");
        assert!(!calm.contains("All of them at once"), "said: {calm}");

        // One brain, resting: singular all the way through.
        let one = super::brains_line(1, &[("Groq".to_string(), 16)]);
        assert!(one.starts_with("1 of my 1 AI brain is benched"), "said: {one}");

        // No brain at all is a setup problem, not a waiting problem.
        let none = super::brains_line(0, &resting);
        assert!(none.contains("No AI brain is set up"), "said: {none}");
    }

    #[test]
    fn a_benched_brain_is_named_with_its_time() {
        assert_eq!(super::clock(0), "0s");
        assert_eq!(super::clock(14), "14s");
        assert_eq!(super::clock(60), "1m");
        assert_eq!(super::clock(100), "1m 40s");
        assert_eq!(super::clock(3600), "1h");
        assert_eq!(super::clock(5400), "1h 30m");
        // Each one carries its own unit, so whoever writes it into a sentence
        // must not add another — "Groq 15ss" is how that goes wrong.
        for secs in [0, 14, 60, 100, 3600, 5400] {
            let said = super::clock(secs);
            assert!(!said.ends_with("ss"), "{secs}s came out as \"{said}\"");
            assert!(
                said.ends_with('s') || said.ends_with('m') || said.ends_with('h'),
                "{secs}s came out as \"{said}\" with no unit"
            );
        }
    }
}
