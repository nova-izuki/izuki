//! Skills: the jobs Izuki knows how to do, written down once and done the
//! same way every time.
//!
//! A skill is a `SKILL.md` file — what the job is, the rules that keep it
//! safe, and the exact steps that work. Only the skills an ask is actually
//! about are handed to the brain, so a chat about email never pays for the
//! video-editing recipe book, and "play that video on YouTube" doesn't
//! accidentally load an editing skill.
//!
//! Bundled skills are compiled in ([`BUNDLED`]) so they work offline on a
//! fresh PC. Matching is deliberately strict: two of a skill's own words have
//! to be there, which is why "trim my clip" matches and "play that video"
//! doesn't.

/// One thing Izuki knows how to do.
pub struct Skill {
    /// Stable id (`video-editing`), for saving a switch against.
    pub key: &'static str,
    /// What it's called in words the user would recognise.
    pub name: &'static str,
    /// The words that mean "this is that job". A phrase (with a space) is
    /// matched inside the ask; a single word has to be a whole word.
    pub says: &'static [&'static str],
    /// The whole skill, handed over only when the ask is about it.
    pub body: &'static str,
}

/// Every skill that ships with Izuki.
pub const BUNDLED: &[Skill] = &[Skill {
    key: "video-editing",
    name: "Video editing for content creators",
    says: &[
        "video", "videos", "clip", "clips", "footage", "reel", "reels", "tiktok", "shorts", "vlog",
        "montage", "b-roll", "broll", "edit", "editing", "trim", "cut", "crop", "vertical",
        "caption", "captions", "subtitle", "subtitles", "srt", "thumbnail", "export",
        "youtube video", "instagram", "premiere", "ffmpeg",
    ],
    body: include_str!("../../skills/video-editing/SKILL.md"),
}];

/// How many of a skill's own words an ask needs before the skill is loaded.
/// Two: "trim my clip" is editing, "play that video" is not.
const NEEDED: usize = 2;

fn words(ask: &str) -> Vec<String> {
    ask.to_lowercase()
        .split(|c: char| !c.is_alphanumeric() && c != '-' && c != '\'')
        .filter(|w| !w.is_empty())
        .map(|w| w.trim_matches('-').to_string())
        .collect()
}

fn hits(skill: &Skill, said: &[String]) -> usize {
    let whole = said.join(" ");
    skill
        .says
        .iter()
        .filter(|needle| {
            if needle.contains(' ') {
                whole.contains(**needle)
            } else {
                said.iter().any(|w| w == *needle)
            }
        })
        .count()
}

/// The skills this ask is about, best first. Empty for most asks, and that is
/// the point: a chat message should not carry a recipe book it never uses.
pub fn matched(ask: &str) -> Vec<&'static Skill> {
    let said = words(ask);
    if said.is_empty() {
        return Vec::new();
    }
    let mut found: Vec<(usize, &'static Skill)> =
        BUNDLED.iter().map(|s| (hits(s, &said), s)).filter(|(n, _)| *n >= NEEDED).collect();
    // Most of its words first, then the order they ship in, so the result is
    // the same on every machine.
    found.sort_by(|a, b| b.0.cmp(&a.0));
    found.into_iter().map(|(_, s)| s).collect()
}

/// The block for the brain's instructions: the skills this ask is about, in
/// full, or nothing at all.
pub fn prompt_block(ask: &str) -> String {
    let found = matched(ask);
    if found.is_empty() {
        return String::new();
    }
    let mut s = String::from(
        "\nA skill of yours covers this job. Follow it exactly — its rules, its steps — \
         and say plainly anything you couldn't do:\n",
    );
    // Two at most: a long ask is not a reason to send four recipe books.
    for skill in found.iter().take(2) {
        s.push_str(&format!("\n=== SKILL: {} ===\n{}\n", skill.name, skill.body));
    }
    s
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn an_editing_ask_loads_the_editing_skill() {
        for ask in [
            "trim my clip to 30 seconds",
            "make this video vertical for tiktok",
            "add captions to my video",
            "cut the first 10 seconds of my footage",
            "edit this reel for me",
        ] {
            let found = matched(ask);
            assert_eq!(found.len(), 1, "\"{ask}\" should load the video skill");
            assert_eq!(found[0].key, "video-editing");
        }
    }

    #[test]
    fn watching_something_is_not_editing_it() {
        for ask in [
            "play that video on youtube",
            "open lofi beats on youtube",
            "what's in my email",
            "",
            "   ",
        ] {
            assert!(matched(ask).is_empty(), "\"{ask}\" must not load an editing skill");
        }
    }

    #[test]
    fn the_block_is_empty_until_it_is_needed() {
        assert!(prompt_block("how's my battery").is_empty());
        let block = prompt_block("trim my clip and add captions");
        assert!(block.contains("SKILL: Video editing"));
        assert!(block.contains("ffmpeg"), "the real steps go with it");
        assert!(block.contains("Never overwrite the source"));
    }

    #[test]
    fn the_bundled_skill_is_the_real_file() {
        let skill = &BUNDLED[0];
        assert_eq!(skill.key, "video-editing");
        assert!(skill.body.len() > 2000, "a skill is the whole recipe, not a summary");
        assert!(skill.body.contains("loudnorm"), "the loudness step is in it");
    }
}
