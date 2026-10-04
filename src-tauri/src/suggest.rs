//! Smart suggestions: the one-tap help that fits what you're looking at —
//! "Explain this video" on YouTube, "Help me reply" in your email, "Fix this
//! error" when an error box pops up — the way a phone suggests the next
//! thing before you ask.
//!
//! Plain rules on the app in front and its title: instant, free, no AI and
//! nothing leaves the PC, so it works the same with any brain and never
//! slows anything down. Tapping one simply asks Izuki that request.

use serde::Serialize;

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Suggestion {
    /// What the chip says ("Explain this video").
    pub label: &'static str,
    /// What Izuki is asked when it's tapped.
    pub ask: &'static str,
    /// An emoji for the chip.
    pub icon: &'static str,
    /// Worth a gentle peek from the Island without being asked (an error,
    /// a question, a video) — most suggestions just wait to be opened.
    pub strong: bool,
}

const fn s(label: &'static str, icon: &'static str, ask: &'static str) -> Suggestion {
    Suggestion { label, ask, icon, strong: false }
}
const fn strong(label: &'static str, icon: &'static str, ask: &'static str) -> Suggestion {
    Suggestion { label, ask, icon, strong: true }
}

const BROWSERS: &[&str] = &["chrome", "msedge", "firefox", "brave", "opera", "vivaldi", "arc", "iexplore"];

/// Up to three suggestions for the window in front (`app` is its program,
/// e.g. "chrome.exe"; `title` its title bar). `hour` is the local hour, for
/// the desktop's "plan my day"; `music` whether something is playing.
pub fn for_context(app: &str, title: &str, hour: u32, music: bool) -> Vec<Suggestion> {
    let a = app.to_lowercase();
    let t = title.to_lowercase();
    let has = |words: &[&str]| words.iter().any(|w| t.contains(w));
    // Whole words only, for short ones that hide inside others
    // ("me@example.com" is not an exam).
    let tokens: Vec<&str> = t.split(|c: char| !c.is_alphanumeric()).filter(|w| !w.is_empty()).collect();
    let has_word = |words: &[&str]| words.iter().any(|w| tokens.contains(w));
    let app_is = |names: &[&str]| names.iter().any(|n| a.trim_end_matches(".exe") == *n);
    let browser = BROWSERS.iter().any(|b| a.trim_end_matches(".exe") == *b);

    // Sign-in and password pages: nothing to suggest. Izuki never types
    // passwords, and nudging there would only get in the way.
    if has(&["sign in", "sign-in", "log in", "login", "password", "verification code"]) {
        return Vec::new();
    }

    let mut out: Vec<Suggestion> = Vec::new();
    if has(&["error", "not responding", "exception", "has stopped working", "crash", "failed to"]) && !has(&["youtube"]) {
        out.push(strong(
            "Fix this error",
            "🛠️",
            "There's an error on my screen. Read it, tell me in plain words what it means, and fix it if you can.",
        ));
    }
    if has(&["youtube"]) {
        out.push(strong(
            "Explain this video",
            "🎓",
            "Explain what's happening in this YouTube video like a teacher, pointing at the screen with the pen as you go.",
        ));
        out.push(s("Sum it up", "📝", "Summarise this video in a few short points."));
    }
    if has(&["blackboard", "classroom", "khan academy", "moodle"])
        || has_word(&["canvas", "quiz", "quizzes", "assignment", "homework", "exam", "exams", "worksheet", "question", "questions", "test"])
    {
        out.push(strong(
            "Explain this question",
            "✏️",
            "Explain the question on my screen like a teacher, step by step, marking the important words with the pen. Help me understand it — don't just give the answer.",
        ));
        out.push(s("Teach me through this quiz", "👩‍🏫", "teach me this quiz"));
    }
    if has(&[
        "ucertify", "coursera", "udemy", "edx", "brightspace", "d2l", "schoology", "pearson", "mcgraw", "cengage",
        "chegg", "quizlet", "duolingo", "codecademy", "w3schools", "skillsoft", "linkedin learning", "pluralsight",
    ]) || has_word(&["lab", "labs", "lesson", "lecture", "module", "chapter", "course", "tutorial"])
    {
        out.push(s(
            "Explain this like a teacher",
            "🎓",
            "Explain what's on my screen like a teacher, step by step, marking the key parts with the pen.",
        ));
        out.push(s("Quiz me on this", "🧠", "Quiz me on what's on my screen — one question at a time, and tell me if I'm right."));
    }
    if has(&["gmail", "inbox", "outlook", "yahoo mail", "proton mail"]) || app_is(&["outlook", "olk", "hxoutlook", "thunderbird"]) {
        out.push(s(
            "Help me reply",
            "✉️",
            "Read the email that's open and help me write a friendly reply. Show it to me before sending anything.",
        ));
        out.push(s("Sum up my inbox", "📥", "Look at my inbox and tell me what's important."));
    }
    if app_is(&["whatsapp", "discord", "telegram", "slack", "ms-teams", "teams", "signal", "messenger"])
        || has(&["whatsapp", "discord", "telegram", "messenger", "slack"])
    {
        out.push(s("Help me reply", "💬", "Read the chat that's open and suggest a good reply. Don't send it until I say so."));
    }
    if app_is(&["winword"]) || has(&["google docs", "- word", "document1"]) {
        out.push(s(
            "Check my writing",
            "✍️",
            "Read what I've written on screen and point out spelling, grammar and clarity fixes with the pen.",
        ));
    }
    if has(&[".pdf"]) || app_is(&["acrord32", "acrobat", "sumatrapdf"]) {
        out.push(s("Explain this page", "📄", "Explain this page to me simply, marking the key parts with the pen."));
    }
    if app_is(&["excel"]) || has(&["google sheets", "- excel"]) {
        out.push(s("Explain this formula", "🧮", "Explain the formula or numbers on my screen in plain words."));
        out.push(s("Make a chart", "📊", "Make a chart from the data on my screen."));
    }
    if app_is(&["code", "cursor", "devenv", "idea64", "pycharm64", "webstorm64", "sublime_text", "notepad++"]) || has(&["github", "stack overflow"]) {
        out.push(s("Explain this code", "🧑‍💻", "Explain the code on my screen simply, marking the important lines with the pen."));
        out.push(s("Find the bug", "🐞", "Look at the code on my screen and point out what might be wrong."));
    }
    if has(&["amazon", "jumia", "ebay", "aliexpress", "temu", "konga", "shopping cart", "your cart"]) {
        out.push(s("Is this a good deal?", "🏷️", "Look at this product and tell me if it's a good deal. Compare prices for me."));
    }
    if has(&["google maps", "- maps"]) {
        out.push(s("How long to get there?", "🗺️", "How long will it take me to get to the place on my screen?"));
    }
    if browser && out.is_empty() && !t.trim().is_empty() && !has(&["new tab", "start page"]) {
        out.push(s("Sum up this page", "📰", "Summarise this page for me in a few short points."));
    }
    if music && !has(&["youtube"]) {
        out.push(s("Play something like this", "🎵", "Play a song like the one that's playing now."));
    }
    if out.is_empty() {
        // The desktop, File Explorer, or an app with nothing special: a few
        // everyday starters, by time of day.
        if hour < 11 {
            out.push(s("Plan my day", "☀️", "Help me plan my day."));
        } else if hour >= 20 {
            out.push(s("Remind me tomorrow", "⏰", "Remind me tomorrow morning about what I need to do."));
        }
        out.push(s("What's on my screen?", "👀", "What's on my screen? Explain it simply."));
    }
    // Same chip twice (an email open in a browser tab named "Inbox - Gmail")?
    let mut seen = Vec::new();
    out.retain(|x| {
        let fresh = !seen.contains(&x.label);
        seen.push(x.label);
        fresh
    });
    out.truncate(3);
    out
}

/// Suggestions for whatever is in front right now. `question`: answer
/// choices are showing (see island.rs), whatever the page is called.
pub fn now(music: bool, question: bool) -> Vec<Suggestion> {
    // (No lock-screen check here: it walks every running process, and this
    // runs every couple of seconds. On the lock screen the window in front
    // is the lock screen itself, which gets no suggestions anyway.)
    let hour = local_hour();
    let title = crate::uia::foreground_title();
    with_question(for_context(&crate::uia::foreground_app(), &title, hour, music), question, &title)
}

/// A question with answers to choose is on screen: the teaching help goes
/// first, and is worth a peek — even when the title didn't give it away.
pub fn with_question(mut out: Vec<Suggestion>, question: bool, title: &str) -> Vec<Suggestion> {
    let t = title.to_lowercase();
    if !question || ["sign in", "log in", "login", "password"].iter().any(|w| t.contains(w)) {
        return out;
    }
    out.retain(|s| s.label != "Explain this question" && s.label != "Teach me through this quiz");
    out.insert(0, s("Teach me through this quiz", "👩‍🏫", "teach me this quiz"));
    out.insert(0, strong(
        "Explain this question",
        "✏️",
        "Explain the question on my screen like a teacher, step by step, marking the important words with the pen. Help me understand it — don't just give the answer.",
    ));
    out.truncate(3);
    out
}

fn local_hour() -> u32 {
    use chrono::Timelike;
    chrono::Local::now().hour()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn labels(app: &str, title: &str) -> Vec<&'static str> {
        for_context(app, title, 14, false).into_iter().map(|s| s.label).collect()
    }

    #[test]
    fn fits_what_is_on_screen() {
        assert_eq!(labels("chrome.exe", "Burna Boy - Last Last - YouTube - Google Chrome")[0], "Explain this video");
        assert_eq!(labels("msedge.exe", "Inbox (3) - me@example.com - Gmail")[0], "Help me reply");
        assert_eq!(labels("chrome.exe", "Week 4 Quiz – Blackboard Learn")[0], "Explain this question");
        assert_eq!(labels("Code.exe", "main.rs - izuki - Visual Studio Code")[0], "Explain this code");
        assert_eq!(labels("EXCEL.EXE", "Budget.xlsx - Excel")[0], "Explain this formula");
        assert_eq!(labels("WhatsApp.exe", "WhatsApp")[0], "Help me reply");
        assert_eq!(labels("chrome.exe", "Some news article - Google Chrome"), vec!["Sum up this page"]);
        let lab = labels("chrome.exe", "Performance Labs : ITSY-2345 [Network Defense 4e] en-uCertify - Google Chrome");
        assert_eq!(lab, vec!["Explain this like a teacher", "Quiz me on this"]);
        // Hidden inside other words, school words don't count.
        assert_eq!(labels("chrome.exe", "Contest results - Google Chrome"), vec!["Sum up this page"]);
    }

    #[test]
    fn errors_and_questions_are_worth_a_peek() {
        let e = for_context("setup.exe", "Installer error", 14, false);
        assert_eq!(e[0].label, "Fix this error");
        assert!(e[0].strong);
        assert!(!for_context("chrome.exe", "Inbox - Gmail", 14, false)[0].strong);
    }

    #[test]
    fn never_on_sign_in_pages() {
        assert!(labels("chrome.exe", "Sign in - Google Accounts").is_empty());
        assert!(labels("chrome.exe", "Enter your password").is_empty());
    }

    #[test]
    fn the_desktop_gets_everyday_starters() {
        let morning: Vec<_> = for_context("explorer.exe", "", 8, false).into_iter().map(|s| s.label).collect();
        assert_eq!(morning, vec!["Plan my day", "What's on my screen?"]);
        let night: Vec<_> = for_context("explorer.exe", "", 22, false).into_iter().map(|s| s.label).collect();
        assert_eq!(night[0], "Remind me tomorrow");
        assert_eq!(labels("explorer.exe", ""), vec!["What's on my screen?"]);
    }

    #[test]
    fn at_most_three_and_no_repeats() {
        let busy = for_context("chrome.exe", "Homework question - YouTube error", 14, true);
        assert!(busy.len() <= 3);
        let gmail_in_chrome = labels("chrome.exe", "Inbox - Gmail - Slack");
        assert_eq!(gmail_in_chrome.iter().filter(|l| **l == "Help me reply").count(), 1);
    }

    #[test]
    fn answer_choices_mean_a_question_whatever_the_title() {
        let base = for_context("chrome.exe", "Performance Labs : ITSY-2345 en-uCertify - Google Chrome", 14, false);
        let q = with_question(base.clone(), true, "Performance Labs");
        assert_eq!(q[0].label, "Explain this question");
        assert!(q[0].strong);
        assert_eq!(q[1].label, "Teach me through this quiz");
        assert!(q.len() <= 3);
        assert_eq!(with_question(base.clone(), false, "x"), base);
        assert_eq!(with_question(Vec::new(), true, "Sign in - Google"), Vec::new());
    }

    #[test]
    fn music_offers_more_like_it() {
        let m: Vec<_> = for_context("explorer.exe", "", 14, true).into_iter().map(|s| s.label).collect();
        assert_eq!(m, vec!["Play something like this"]);
    }
}

#[cfg(test)]
mod live {
    /// Run by hand: what it suggests for the window in front right now.
    #[test]
    #[ignore]
    fn suggests_for_the_real_screen() {
        println!("front: {} | {}", crate::uia::foreground_app(), crate::uia::foreground_title());
        for s in super::now(false, false) {
            println!("suggest: {} {} (strong: {})", s.icon, s.label, s.strong);
        }
    }
}
