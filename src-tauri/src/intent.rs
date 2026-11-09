//! Deliberate front-door checks for plain chat.
//!
//! The model should answer real conversation. These rules only stop a short,
//! context-free fragment from being mistaken for an action and label a
//! provider policy refusal without hiding it.

fn normalized(text: &str) -> String {
    text.to_lowercase()
        .replace(['’', '\''], "")
        .replace(|c: char| !c.is_alphanumeric() && c != ' ', " ")
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
}

fn words(s: &str) -> Vec<&str> {
    s.split_whitespace().collect()
}

/// `None` means send it to the brain. `Some(question)` means the request has
/// no material to work from yet, so ask exactly one useful thing instead.
pub fn clarification(text: &str, has_context: bool) -> Option<&'static str> {
    if has_context {
        return None;
    }
    let s = normalized(text);
    if s.is_empty() {
        return None;
    }
    let w = words(&s);
    let first = *w.first().unwrap_or(&"");
    let wants_answer = ["answer", "solve", "do", "complete", "finish", "explain"].contains(&first);
    let has_question_noun = w.iter().any(|x| {
        [
            "question", "questions", "quiz", "quizzes", "test", "tests", "problem", "problems", "exercise",
            "exercises", "assignment", "assignments",
        ]
        .contains(x)
    });
    let has_all = w.iter().any(|x| ["all", "these", "those", "them", "everything", "each"].contains(x));
    let has_about_material = w.contains(&"about")
        && w.iter().any(|x| ["document", "page", "book", "file", "assignment", "quiz", "test", "chapter"].contains(x));

    if matches!(s.as_str(), "answer" | "answer this" | "answer that") {
        return Some("What should I answer? Paste the question or attach the document, and I'll take it from there.");
    }
    if matches!(s.as_str(), "help me" | "explain" | "continue" | "go on" | "carry on") {
        return Some("What would you like me to help with? Paste the question or a little context, and I'll pick it up from there.");
    }
    if wants_answer && (has_all || has_question_noun || has_about_material) {
        return Some("What should I answer? Paste the questions or attach the document, and tell me whether they're practice or graded. For graded work I can explain and give hints, but I won't complete or submit it for you.");
    }
    None
}

/// A short, public explanation for a failed AI call. Provider bodies often
/// contain several HTTP errors and JSON; they are useful in logs, not chat.
pub fn public_failure(error: &str) -> &'static str {
    let e = error.to_ascii_lowercase();
    let rate = e.contains("429") || e.contains("rate limit") || e.contains("too many requests");
    let credits = e.contains("no credits") || e.contains("insufficient_quota") || e.contains("credit balance");
    let retired = e.contains("410") || e.contains("end of life") || e.contains("has been retired");
    let unreachable = e.contains("connection refused")
        || e.contains("connection reset")
        || e.contains("error sending request")
        || e.contains("timed out")
        || e.contains("no answer in time");
    if credits && rate {
        "The AI services are rate-limited, and one fallback account is out of credits."
    } else if retired && (rate || credits) {
        "The AI services are rate-limited, and one configured model has been retired."
    } else if rate {
        "The AI services are rate-limited right now."
    } else if credits {
        "The configured AI account is out of credits, and no other model answered."
    } else if retired {
        "A configured AI model has been retired, and no other model answered."
    } else if unreachable {
        "The AI service could not be reached."
    } else {
        "No AI service answered."
    }
}

/// After a step ran, a failed final completion must not be dressed up as
/// success. Say what happened, point at the real result card, and explain the
/// outage in one line.
pub fn after_tool_failure(step_ok: Option<bool>, error: Option<&str>) -> String {
    let outcome = match step_ok {
        Some(true) => "The step finished, but I couldn't get a final summary from any AI service.",
        Some(false) => "The step didn't finish, and I couldn't get a final explanation from any AI service.",
        None => "I couldn't get a final summary from any AI service.",
    };
    let detail = error.map(public_failure).unwrap_or("No AI service answered.");
    format!("{outcome} {detail} The result card above shows what actually happened.")
}

/// A provider's own policy refusal is not an Izuki answer. We keep the text,
/// but logs can name its source and the UI can explain the limitation.
pub fn refusal_kind(text: &str) -> Option<&'static str> {
    let t = text
        .trim()
        .to_lowercase()
        .replace(['’', '\''], "'")
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ");
    if t.is_empty() {
        return None;
    }
    let sorry = t.starts_with("i'm sorry") || t.starts_with("i am sorry") || t.starts_with("sorry,");
    let cannot = ["can't help", "cannot help", "can not help", "unable to help", "can't assist", "cannot assist"]
        .iter()
        .any(|x| t.contains(x));
    let policy = t.contains("against my policy")
        || t.contains("against the policy")
        || t.contains("against my guidelines")
        || t.contains("as an ai")
        || t.contains("not able to help")
        || t.contains("not able to assist");
    ((sorry && (cannot || policy)) || (t.starts_with("i ") && cannot) || (policy && !t.starts_with("i can ")))
        .then_some("provider-policy")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn bare_answer_never_becomes_an_action() {
        for said in ["answer", "answer all for me", "answer this", "help me", "continue", "answer all these practice questions."] {
            assert!(clarification(said, false).is_some(), "{said}");
        }
        assert!(clarification("answer", true).is_none(), "a follow-up has context");
        assert!(clarification("answer all for me", true).is_none());
        assert!(clarification("windows", false).is_none());
        assert!(clarification("whatttt", false).is_none());
        assert!(clarification("turn off study log", false).is_none());
        assert!(clarification("what is photosynthesis?", false).is_none());
    }

    #[test]
    fn policy_refusals_are_identified_without_rewriting() {
        assert_eq!(refusal_kind("I'm sorry, but I can't help with that."), Some("provider-policy"));
        assert_eq!(refusal_kind("I cannot assist with that request."), Some("provider-policy"));
        assert_eq!(refusal_kind("That answer is correct."), None);
        assert_eq!(refusal_kind("I can help once you paste the question."), None);
    }

    #[test]
    fn provider_dumps_become_a_short_honest_note() {
        let raw = "Groq (free, very fast): HTTP 429 Too Many Requests: {\"error\":{\"message\":\"rate limit\"}}; OpenRouter (any vision model): HTTP 429; NVIDIA NIM: HTTP 410 Gone; OpenAI compatible: no credits remaining";
        let said = after_tool_failure(Some(true), Some(raw));
        assert!(said.contains("finished"));
        assert!(said.contains("rate-limited") || said.contains("retired") || said.contains("credits"));
        assert!(!said.contains("Groq"));
        assert!(!said.contains("429"));
        assert!(!said.contains("HTTP"));
        assert!(!said.contains('{'));
        assert!(after_tool_failure(Some(false), Some(raw)).contains("didn't finish"));
        assert!(after_tool_failure(Some(true), None).contains("result card"));
    }
}
