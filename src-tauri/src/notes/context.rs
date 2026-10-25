//! Evidence-based filing: chapter numbers alone never identify a course.
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(default)]
pub struct Context {
    pub subject: String,
    pub chapter: String,
    pub topic: String,
}

pub fn normalized(s: &str) -> String {
    s.chars().flat_map(char::to_lowercase).map(|c| if c.is_alphanumeric() { c } else { ' ' })
        .collect::<String>().split_whitespace().collect::<Vec<_>>().join(" ")
}

fn generic(s: &str) -> bool {
    let s = normalized(s);
    s.is_empty() || ["notes", "lesson", "review", "quiz", "practice", "assignment", "home", "dashboard",
        "blackboard", "blackboard learn", "canvas", "study log", "izuki", "nova", "google chrome",
        "microsoft edge", "mozilla firefox", "brave", "new tab", "untitled", "study coach", "lecture", "research", "quick note"].contains(&s.as_str())
}

fn assessment(s: &str) -> bool {
    normalized(s).split_whitespace().any(|w| ["quiz", "exam", "assignment", "practice", "question", "test", "week"].contains(&w))
}

fn number(s: &str) -> Option<String> {
    let s = s.trim_matches(|c: char| !c.is_alphanumeric() && c != '.').trim_end_matches('.');
    if !s.is_empty() && s.split('.').all(|n| !n.is_empty() && n.chars().all(|c| c.is_ascii_digit())) {
        return Some(s.split('.').map(|n| n.parse::<u32>().map(|n| n.to_string())).collect::<Result<Vec<_>, _>>().ok()?.join("."));
    }
    let words = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
    if let Some(i) = words.iter().position(|w| *w == s) { return Some((i + 1).to_string()); }
    let romans = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii", "xiii", "xiv", "xv", "xvi", "xvii", "xviii", "xix", "xx"];
    romans.iter().position(|w| *w == s).map(|i| (i + 1).to_string())
}

fn units(s: &str) -> Vec<String> {
    let lower = s.to_lowercase();
    let mut found = Vec::new();
    for (marker, label) in [("chapter", "Chapter"), ("ch.", "Chapter"), ("ch", "Chapter"), ("unit", "Unit"), ("module", "Module"), ("section", "Section")] {
        for (i, _) in lower.match_indices(marker) {
            if i > 0 && lower[..i].chars().next_back().is_some_and(char::is_alphanumeric) { continue; }
            let rest = &lower[i + marker.len()..];
            if rest.chars().next().is_some_and(|c| c.is_alphabetic()) { continue; }
            let rest = rest.trim_start_matches(|c: char| c.is_whitespace() || c == ':' || c == '#');
            if let Some(n) = rest.split(|c: char| c.is_whitespace() || c == ':' || c == ',').next().and_then(number) {
                let value = format!("{label} {n}");
                if !found.contains(&value) { found.push(value); }
            }
        }
    }
    found
}

impl Context {
    pub fn infer(title: &str, evidence: &str) -> Self {
        let heading_units = units(title);
        // A contents page listing many chapters must not silently choose chapter one.
        let all_units = if heading_units.is_empty() { units(evidence) } else { heading_units };
        let chapter = if all_units.len() == 1 { all_units[0].clone() } else { String::new() };
        let mut subject = String::new();
        let mut topic = String::new();
        for line in evidence.lines().take(80) {
            if let Some((label, value)) = line.trim().split_once(':') {
                let label = normalized(label.trim_start_matches('#'));
                let value: String = value.trim().chars().take(120).collect();
                if ["subject", "course", "class", "book", "project"].contains(&label.as_str()) && !generic(&value) && subject.is_empty() {
                    subject = value;
                } else if label == "topic" && !generic(&value) && topic.is_empty() { topic = value; }
            }
        }
        let parts: Vec<&str> = title.split([ '|', '\n', '\u{2014}', '\u{2013}' ])
            .flat_map(|s| s.split(" - ")).map(str::trim).filter(|s| !generic(s)).collect();
        if subject.is_empty() && (!chapter.is_empty() || parts.len() > 1) {
            let candidates: Vec<_> = parts.iter().filter(|p| units(p).is_empty() && !assessment(p)).collect();
            subject = candidates.iter().find(|p| p.chars().any(|c| c.is_ascii_digit()) && p.chars().any(char::is_alphabetic))
                .or_else(|| candidates.last()).map(|p| p.to_string()).unwrap_or_default();
        }
        if topic.is_empty() {
            topic = parts.iter().find_map(|p| {
                if !units(p).is_empty() { p.split_once(':').map(|(_, topic)| topic.trim().to_string()) } else { None }
            }).unwrap_or_else(|| if chapter.is_empty() { parts.iter().find(|p| **p != subject).map(|p| p.to_string()).unwrap_or_default() } else { String::new() });
        }
        Self { subject, chapter, topic }
    }

    /// Metadata from the same note-writing response is accepted only if it
    /// quotes the supplied material. No extra AI request is needed for filing.
    pub fn with_evidence(mut self, suggested: &Self, evidence: &str) -> Self {
        let evidence = normalized(evidence);
        for (field, value) in [(&mut self.subject, &suggested.subject), (&mut self.topic, &suggested.topic)] {
            let n = normalized(value);
            if field.is_empty() && n.len() >= 3 && value.chars().count() <= 120 && !generic(value)
                && format!(" {evidence} ").contains(&format!(" {n} ")) { *field = value.trim().to_string(); }
        }
        // A model cannot turn Quiz 5 into Chapter 5, or invent a chapter.
        self
    }

    pub fn key(&self) -> Option<String> {
        let subject = normalized(&self.subject);
        let chapter = normalized(&self.chapter);
        let topic = normalized(&self.topic);
        if !subject.is_empty() && !chapter.is_empty() { Some(format!("{subject}|{chapter}")) }
        else if chapter.is_empty() && !topic.is_empty() && !generic(&topic) { Some(format!("{subject}|topic:{topic}")) }
        else { None }
    }

    pub fn title(&self, fallback: &str) -> String {
        if !self.subject.is_empty() && !self.chapter.is_empty() { format!("{} — {}", self.subject, self.chapter) }
        else if !self.subject.is_empty() && !self.topic.is_empty() { format!("{} — {}", self.subject, self.topic) }
        else { fallback.to_string() }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn chapters_and_quizzes_share_a_course_but_not_another_course() {
        let a = Context::infer("Biology 101 - Chapter 05: Cells - Google Chrome", "");
        let b = Context::infer("Biology 101 | Chapter five | Quiz", "");
        assert_eq!(a.key(), b.key());
        assert_eq!(a.chapter, "Chapter 5");
        assert_ne!(a.key(), Context::infer("Chemistry 101 - Chapter 5", "").key());
        assert_ne!(a.key(), Context::infer("Biology 101 - Chapter 6", "").key());
        assert_ne!(a.key(), Context::infer("Biology 101 - Module 5", "").key());
        assert_eq!(Context::infer("Chapter 5", "").key(), None);
    }
    #[test]
    fn headings_general_topics_and_ambiguous_contents_are_handled() {
        let c = Context::infer("Quiz - Blackboard Learn", "Course: Network Security\nChapter IV: Encryption");
        assert_eq!(c.subject, "Network Security");
        assert_eq!(c.chapter, "Chapter 4");
        assert!(Context::infer("Contents", "Chapter 1\nChapter 5\nChapter 9").chapter.is_empty());
        assert!(Context::infer("Quiz 5", "").chapter.is_empty());
        assert!(Context::infer("家庭 Biology - Chapter 5", "").key().is_some());
        assert_eq!(Context::infer("Recursion - Google Chrome", "").key(), Context::infer("Recursion - Microsoft Edge", "").key());
        assert_ne!(Context::infer("Quiz 4 - Biology", "").key(), Context::infer("Quiz 4 - Chemistry", "").key());
        assert_eq!(Context::infer("Lecture — Biology - Chapter 5", "").subject, "Biology");
    }
    #[test]
    fn invented_labels_are_not_accepted() {
        let model = Context { subject: "Biology".into(), chapter: "Chapter 5".into(), topic: "Cells".into() };
        let c = Context::infer("Quiz", "").with_evidence(&model, "Cells divide.");
        assert!(c.subject.is_empty() && c.chapter.is_empty());
        assert_eq!(c.topic, "Cells");
    }
}
