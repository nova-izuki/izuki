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

#[cfg(test)]
mod tests {
    use super::*;

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
