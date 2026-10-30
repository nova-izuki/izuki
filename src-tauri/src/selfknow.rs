//! Izuki knows its own app.
//!
//! "Open Izuki notes", "my notes", "Izuki settings": Izuki's own parts, opened
//! in the Izuki window — never a Windows app with a similar name (it opened
//! Notepad for "Izuki notes"). "Look through this and save it to my notes",
//! "save this discussion to my Izuki notes": the page in front is read and
//! saved as study notes in Izuki Notes directly, nothing typed anywhere.

#[derive(Debug, Clone, PartialEq)]
pub enum Ask {
    /// Open this tab of the Izuki window.
    Open(&'static str),
    /// Read what's in front and save it to Izuki Notes.
    SaveNotes,
    /// Link the note being studied to the one named ("link this to Chapter 4").
    LinkNote(String),
}

/// Izuki's own parts, by what people call them → the tab that holds them.
const PARTS: &[(&[&str], &str)] = &[
    (&["notes", "note", "study log", "flashcards", "campus", "textbooks", "lecture mode"], "notes"),
    (&["settings", "setting", "preferences", "options"], "settings"),
    (&["chat", "chats", "conversation"], "chat"),
    (&["style", "looks", "themes", "tweaks", "wallpaper looks"], "style"),
    (&["apps", "money", "empire", "heads-ups", "heads ups", "inbox", "writing style"], "apps"),
    (&["missions", "hands-free", "hands free", "draw"], "draw"),
    (&["flows", "flow", "saved flows", "flow library"], "flows"),
    (&["watchers", "watcher"], "watchers"),
];

fn words(said: &str) -> String {
    let s: String = said.to_lowercase().chars().map(|c| if c.is_alphanumeric() || c == '\'' || c == '-' { c } else { ' ' }).collect();
    format!(" {} ", s.split_whitespace().collect::<Vec<_>>().join(" "))
}

pub fn parse(said: &str) -> Option<Ask> {
    // "Link this to Chapter 4": joining two of their own notes, which is
    // nothing to do with the notes apps ruled out just below.
    if let Some(name) = crate::notes::link_request(said) {
        return Some(Ask::LinkNote(name));
    }
    let s = words(said);
    // Another notes app named outright: that app, not Izuki's.
    if [" onenote", " one note", " evernote", " google keep", " keep notes", " sticky notes", " notion", " notepad", " apple notes", " samsung notes"].iter().any(|w| s.contains(w)) {
        return None;
    }
    let ours = s.contains(" izuki ") || s.contains(" nova ") || s.contains(" izuki's ") || s.contains(" nova's ");
    let my_notes = [" my notes ", " my study notes ", " izuki notes ", " nova notes ", " izuki's notes ", " nova's notes "].iter().any(|w| s.contains(w));
    let notes_word = s.contains(" notes") || s.contains(" note ");
    // Saving what's in front: "save this to my notes", "look through my
    // assignment discussion and save it to my Izuki notes", "take notes on this".
    let save_verb = [" save", " put", " add", " keep", " store", " copy"].iter().any(|w| s.contains(w));
    let take_notes = [" take notes", " make notes", " note down", " notes on this", " notes on the", " notes on my", " summarize this into", " summarise this into"].iter().any(|w| s.contains(w));
    let what_in_front = [" this", " it ", " the page", " the discussion", " my assignment", " the assignment", " discussion", " the article", " the screen", " what's on", " look through", " read through", " go through"]
        .iter()
        .any(|w| s.contains(w));
    // "Don't save this to my notes" is a no.
    let negated = [" don't save", " dont save", " do not save", " don't put", " never save", " not save"].iter().any(|w| s.contains(w));
    // Only what's on screen: "add buy milk to my notes" is a note to write,
    // not a page to read. And one page: "go through all the questions and
    // save them" is the agent's — it keeps each explanation as it goes.
    let many = [" all the ", " all of ", " every ", " each ", " questions", " all my "].iter().any(|w| s.contains(w));
    if notes_word && !negated && !many && (take_notes || (save_verb && (my_notes || ours) && what_in_front)) {
        return Some(Ask::SaveNotes);
    }
    // Many pages to save ("open my notes and go through all the questions and
    // save them"): the agent's whole job, not just opening a tab.
    if notes_word && !negated && many && (save_verb || take_notes) {
        return None;
    }
    // Opening one of Izuki's own parts.
    let open = [" open", " show", " go to", " take me to", " bring up", " pull up", " launch"].iter().any(|w| s.contains(w));
    if !open {
        return None;
    }
    if my_notes {
        return Some(Ask::Open("notes"));
    }
    if !ours {
        return None;
    }
    PARTS.iter().find(|(names, _)| names.iter().any(|n| s.contains(&format!(" {n} ")) || s.contains(&format!(" {n}s ")))).map(|(_, tab)| Ask::Open(tab))
}

/// For the screen brain: what's Izuki's own, so it never opens a look-alike.
pub const PROMPT: &str = "IZUKI'S OWN APP: Izuki has its own window with Notes (study notes Izuki saves — \"Izuki notes\", \"my notes\"), Chat, Settings, Style and Apps. Those are NOT Windows apps: never open Notepad, Sticky Notes or OneNote for \"Izuki notes\" or \"my notes\", and only open Notepad when the user names Notepad. Never type notes into another app. If the user wants something saved to their Izuki notes, stop and tell them in `summary` to say “save this to my notes” — never say it's saved.\n";

// ---------------------------------------------------------------------------
// What Izuki is, right now
// ---------------------------------------------------------------------------

/// The newest releases' notes up to this build, newest first, baked in by
/// build.rs from docs/.
///
/// Asked "what are Izuki's new features", the chat searched the web and read
/// back the GitHub pages for 1.0.36 and 1.0.172 while 1.0.185 was running —
/// and put an invented "October 2026" on both. Nothing about the app was in
/// the app. Now the notes travel with the build they describe.
const NOTES: &str = include_str!(concat!(env!("OUT_DIR"), "/release-notes.md"));

/// Is this a question about Izuki itself — what it can do, what's new, which
/// version — rather than a request for it to do something?
pub fn about_izuki(asked: &str) -> bool {
    let q = asked.to_lowercase().replace('\u{2019}', "'");
    // "nova" as a whole word: "renovation", "innovation" and "supernova" all
    // contain it, and "what's new in kitchen renovation" is not about Izuki.
    let names_it = q.split(|c: char| !c.is_alphanumeric() && c != '\'')
        .any(|w| matches!(w, "izuki" | "izukis" | "izuki's" | "nova" | "novas" | "nova's"));
    // Phrases about the assistant itself. Not bare "update", "latest" or
    // "can you do": "can you update my resume" and "can you do my homework"
    // are requests, and pulling the release notes into those costs a free
    // tier's allowance for nothing.
    let about = [
        "new feature", "features", "what's new", "whats new", "what is new", "your version", "what version",
        "which version", "changelog", "release notes", "latest version", "new update", "latest update",
        "your update", "did you update", "you got updated", "were you updated", "have you updated",
        "what can you do", "what can u do", "what do you do", "what are you capable", "your abilities",
        "what are you", "who made you", "who built you", "who created you", "new stuff", "new things",
    ]
    .iter()
    .any(|w| q.contains(w));
    // A polite "do you know what's new in Python?" is about Python. Only
    // clear second-person phrases can stand in for the assistant's name.
    let direct = [
        "your version", "ur version", "what version are you", "which version are you", "what version r u",
        "your feature", "your new feature", "ur feature", "ur new feature", "your abilities",
        "your update", "did you update", "you got updated", "were you updated", "have you updated",
        "what can you do", "what can u do", "what do you do", "what are you capable",
        "who made you", "who built you", "who created you", "what's new with you", "whats new with you",
    ].iter().any(|phrase| q.contains(phrase));
    (names_it && about) || direct
}

/// Plain text from a line of markdown: no **bold**, `code`, or link targets.
fn plain(line: &str) -> String {
    let s = line.replace("**", "").replace('`', "").replace("__", "");
    // [text](url) -> text. Slices only at the ASCII brackets themselves, so
    // every cut lands on a character boundary.
    let mut out = String::with_capacity(s.len());
    let mut rest = s.as_str();
    while let Some(open) = rest.find('[') {
        let after = &rest[open + 1..];
        let link = after.find("](").and_then(|close| after[close + 2..].find(')').map(|paren| (close, close + 2 + paren)));
        match link {
            Some((close, end)) => {
                out.push_str(&rest[..open]);
                out.push_str(&after[..close]);
                rest = &after[end + 1..];
            }
            None => {
                out.push_str(&rest[..=open]);
                rest = after;
            }
        }
    }
    out.push_str(rest);
    // Single emphasis markers too, while keeping underscores inside words.
    let mut plain = String::new();
    let mut rest = out.as_str();
    while let Some(at) = rest.find(['*', '_']) {
        plain.push_str(&rest[..at]);
        let marker = rest.as_bytes()[at] as char;
        let tail = &rest[at + 1..];
        let opens = rest[..at].chars().next_back().is_none_or(|c| !c.is_alphanumeric() && c != '_')
            && tail.chars().next().is_some_and(|c| !c.is_whitespace());
        let close = opens.then(|| tail.match_indices(marker).find(|(i, _)| {
            *i > 0 && tail[..*i].chars().next_back().is_some_and(|c| !c.is_whitespace())
                && tail[*i + 1..].chars().next().is_none_or(|c| !c.is_alphanumeric() && c != '_')
        })).flatten();
        if let Some((end, _)) = close {
            plain.push_str(&tail[..end]);
            rest = &tail[end + 1..];
        } else {
            plain.push(marker);
            rest = tail;
        }
    }
    plain.push_str(rest);
    plain.trim().to_string()
}

fn first_sentence(text: &str) -> &str {
    for (i, c) in text.char_indices() {
        if matches!(c, '.' | '!' | '?') && text[i + 1..].chars().next().is_none_or(char::is_whitespace) {
            return &text[..i + 1];
        }
    }
    text
}

/// The release notes, cut to what fits in a chat prompt: the title, each
/// section heading, and the first sentence under it. A free AI tier counts
/// every word of the prompt against a per-minute allowance, so the whole
/// file (5–6 KB) would cost more than the question.
pub fn notes_summary() -> String {
    let mut out: Vec<String> = Vec::new();
    let mut want_first_line = false;
    for line in NOTES.lines() {
        let t = line.trim();
        if let Some(title) = t.strip_prefix("# ") {
            out.push(plain(title));
        } else if let Some(head) = t.strip_prefix("## ").or_else(|| t.strip_prefix("### ")) {
            out.push(format!("- {}", plain(head)));
            want_first_line = true;
        } else if want_first_line && !t.is_empty() && !t.starts_with('|') && !t.starts_with('>') && !t.starts_with("---") {
            let first = plain(t);
            let sentence = first_sentence(&first).trim();
            if let Some(last) = out.last_mut() {
                last.push_str(": ");
                last.push_str(&sentence.chars().take(220).collect::<String>());
            }
            want_first_line = false;
        }
    }
    let text = out.join("\n");
    text.chars().take(2200).collect()
}

/// What goes in the chat prompt when the question is about Izuki itself.
pub fn self_block() -> String {
    let version = env!("CARGO_PKG_VERSION");
    let notes = notes_summary();
    let notes = if notes.trim().is_empty() { "(no release notes were built into this copy)".to_string() } else { notes };
    format!(
        "\nABOUT YOU, IZUKI — you are version {version}. What's new in your latest releases, newest first:\n{notes}\n\
         When they ask about Izuki itself — its features, what's new, what it can do, its version — answer from \
         this and from what you know of the app. Do NOT search the web for it: results about Izuki are old \
         release pages and will be wrong. Never put a date on a release you weren't given. If something isn't \
         covered here, say you're not sure and point them to What's new (the ✨ button) or Ctrl+K search.\n"
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    /// "what are izukis new features now" was answered from GitHub pages for
    /// releases a hundred versions old. Questions about Izuki itself have to
    /// be recognised; requests that merely say "you" must not be.
    #[test]
    fn knows_a_question_about_itself_from_a_request() {
        for asked in [
            "what are izukis new features now",
            "what's new in Izuki?",
            "what version are you on",
            "what can you do",
            "did you update?",
            "Nova, what are your new features",
            "who made you",
        ] {
            assert!(about_izuki(asked), "should know this is about itself: {asked}");
        }
        for asked in [
            "can you update my resume",
            "can you do my homework",
            "what's the latest news",
            "whats up today",
            "open spotify",
            "what are the features of a good thesis statement",
            "im not in london bro",
            // "nova" inside another word.
            "what's new in kitchen renovation",
            "what are the latest features of innovation hubs",
            "whats new about the supernova",
            "do you know what's new in Python 3.14?",
            "can you explain the features of this camera",
            "do you know the latest version of Rust",
        ] {
            assert!(!about_izuki(asked), "this is not about Izuki: {asked}");
        }
    }

    #[test]
    fn the_notes_for_this_build_are_inside_it() {
        let summary = notes_summary();
        assert!(!summary.trim().is_empty(), "build.rs baked in no release notes");
        assert!(summary.chars().count() <= 2200, "too long for a free tier's prompt");
        assert!(summary.lines().any(|l| l.starts_with("- ")), "no section headings came through:\n{summary}");
        // Markdown is for the page, not the prompt.
        assert!(!summary.contains("**") && !summary.contains("]("), "markdown left in:\n{summary}");
        let block = self_block();
        assert!(block.contains(env!("CARGO_PKG_VERSION")), "it must say which version it is");
        assert!(block.contains("Do NOT search the web"));
    }

    #[test]
    fn plain_text_from_markdown() {
        assert_eq!(plain("**Bold** and `code`"), "Bold and code");
        assert_eq!(plain("*Italic* and _emphasis_ with file_name"), "Italic and emphasis with file_name");
        assert_eq!(first_sentence("Speed 11.3× real time. Next sentence."), "Speed 11.3× real time.");
        assert_eq!(first_sentence("Version 1.0.186 works! Next."), "Version 1.0.186 works!");
        assert_eq!(plain("see [the docs](https://x.y/z) now"), "see the docs now");
        assert_eq!(plain("[a](b) and [c](d)"), "a and c");
        // A bracket that isn't a link is left alone, and never panics.
        assert_eq!(plain("array [1, 2] here"), "array [1, 2] here");
        assert_eq!(plain("half [link"), "half [link");
        assert_eq!(plain("Zürich [ü](ö) ✨"), "Zürich ü ✨");
    }

    #[test]
    fn its_own_notes_never_notepad() {
        assert_eq!(parse("open izuki notes so it can look through my assignment discussion and save to my izuki notes"), Some(Ask::SaveNotes));
        assert_eq!(parse("look through my assignment discussion and save it to my notes"), Some(Ask::SaveNotes));
        assert_eq!(parse("take notes on this"), Some(Ask::SaveNotes));
        assert_eq!(parse("save this page to my notes"), Some(Ask::SaveNotes));
        assert_eq!(parse("open izuki notes"), Some(Ask::Open("notes")));
        assert_eq!(parse("open my notes"), Some(Ask::Open("notes")));
        assert_eq!(parse("open izuki settings"), Some(Ask::Open("settings")));
        assert_eq!(parse("show me nova's chat"), Some(Ask::Open("chat")));
        assert_eq!(parse("open izuki watchers"), Some(Ask::Open("watchers")));
        assert_eq!(parse("open my izuki flows"), Some(Ask::Open("flows")));
        assert_eq!(parse("open notepad"), None, "Notepad when Notepad is named");
        assert_eq!(parse("open sticky notes"), None);
        assert_eq!(parse("open settings"), None, "Windows settings, unless it's Izuki's");
        assert_eq!(parse("don't save this to my notes"), None);
        assert_eq!(parse("add buy milk to my notes"), None, "a note to write, not the screen");
        assert_eq!(parse("go through all the questions and save them to my notes"), None, "many pages: the agent keeps each one");
        assert_eq!(parse("open my notes and go through all the questions and save them to my notes"), None, "not just the tab");
        assert_eq!(parse("open my notes in onenote"), None, "OneNote when OneNote is named");
    }
}
