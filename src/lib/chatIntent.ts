/**
 * Small, deliberate front-door checks for the Chat tab.
 *
 * These are not a second AI and they must never guess at intent. They only
 * catch the two cases that used to become confident, unrelated actions:
 * a bare "answer" with nothing to answer, and a provider policy refusal
 * being presented as Izuki's own decision.
 */

export const PROVIDER_REFUSAL_NOTE =
  "The AI provider declined that request. For practice or self-study, paste the questions or attach the document and ask again. For graded work I can explain the method and give feedback, but I won't complete or submit it for you.";

function normalized(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Work to be answered, by name ("answer all these questions"). */
const QUESTION_NOUNS = new Set([
  "question", "questions", "quiz", "quizzes", "test", "tests", "exam", "exams", "problem", "problems", "exercise",
  "exercises", "assignment", "assignments", "homework", "worksheet", "worksheets",
]);
/** Where the work would be, if it had been pasted or attached. */
const MATERIAL = new Set(["document", "documents", "doc", "pdf", "page", "pages", "book", "file", "files", "chapter", "text"]);
/** Words that point at something without saying what it is. */
const FILLER = new Set([
  "all", "these", "those", "them", "this", "that", "it", "everything", "each", "every", "one", "ones", "of", "the",
  "a", "my", "for", "me", "please", "pls", "plz", "now", "quick", "quickly", "about", "on", "in", "from", "practice",
  "graded", "here", "there", "above", "below", "and", "to", "with",
]);

const WHAT_TO_ANSWER = "What should I answer? Paste the question or attach the document, and I'll take it from there.";
const PRACTICE_OR_GRADED =
  "What should I answer? Paste the questions or attach the document, and tell me whether they're practice or graded. For graded work I can explain and give hints, but I won't complete or submit it for you.";

/**
 * A short request that has no attached/pasted material and no earlier turn to
 * continue. Returns the one useful question to ask instead of sending the
 * fragment to a model or to a local command.
 *
 * Only a request that is nothing but a pointer qualifies ("answer all of
 * these", "do the quiz"). Anything with real content after the verb
 * ("explain everything about black holes", "do everything you can to speed
 * up my PC", "finish all the steps") goes on as it is. Mirrors
 * `intent::clarification` in Rust.
 */
export function clarificationFor(text: string, hasContext: boolean): string | null {
  if (hasContext) return null;
  const s = normalized(text);
  if (!s) return null;
  if (/^(?:help|help me|explain|explain this|continue|go on|carry on)$/.test(s)) {
    return "What would you like me to help with? Paste the question or a little context, and I'll pick it up from there.";
  }
  const [first, ...rest] = s.split(" ");
  const namesWork = rest.some((w) => QUESTION_NOUNS.has(w));
  const onlyPointers = rest.every((w) => FILLER.has(w) || QUESTION_NOUNS.has(w) || MATERIAL.has(w));
  const asks =
    first === "answer" || first === "solve"
      ? onlyPointers
      : ["do", "complete", "finish", "explain"].includes(first)
        ? namesWork && onlyPointers
        : false;
  if (!asks) return null;
  return namesWork || rest.some((w) => MATERIAL.has(w)) ? PRACTICE_OR_GRADED : WHAT_TO_ANSWER;
}

/**
 * True only for the familiar policy-refusal openings. This is used to label
 * the reply as the provider's decision, not to rewrite or override it.
 */
/**
 * Turn a provider/transport failure into one readable sentence. Raw HTTP
 * bodies, JSON and fallback URLs belong in diagnostics, never in the chat.
 */
export function friendlyProviderError(text: string): string {
  const raw = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!raw) return "The AI service didn't return an answer. Try again in a minute.";
  const t = raw.toLowerCase();
  const rate = /\b429\b|rate[- ]?limit|too many requests/.test(t);
  const credits = /no credits|insufficient[_ ]quota|credit balance|out of credits/.test(t);
  const retired = /\b410\b|\bend of life\b|has been retired/.test(t);
  const unreachable = /error sending request|failed to fetch|connection (?:refused|reset)|network error|timed? out|offline/.test(t);
  const crowded =
    "All available AI services are rate-limited or unavailable right now. Try again in a minute, or check Settings → Izuki's brain.";
  if (credits && rate) return crowded;
  if (retired && (rate || credits)) return crowded;
  if (rate) return "The AI service is rate-limited right now. Try again in a minute.";
  if (credits) return "The configured AI account is out of credits. Add credits or choose another model in Settings.";
  if (retired) return "A configured AI model has been retired. Choose another model in Settings.";
  if (unreachable) return "Izuki couldn't reach an AI service. Check your internet or local Ollama, then try again.";
  const technical = /[{}\[\]"\\]|https?:\/\/|http\s+\d{3}|organization|api[_ ]?key|bearer/i.test(raw);
  if (!technical && raw.length <= 180) return /[.!?]$/.test(raw) ? raw : raw + ".";
  return "The AI service didn't return a usable answer. Try again in a minute.";
}

export function providerRefusal(text: string): boolean {
  const t = text.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ").trim();
  if (!t) return false;
  // A refusal says so up front, and briefly. A long answer that says "as an
  // AI tutor…" or quotes a rule further down is an answer, not a refusal.
  const opening = t.slice(0, 160);
  const short = t.length <= 320;
  const sorry = /^(?:i'm sorry|i am sorry|sorry)[, ]/.test(t);
  const cannot = /\b(?:can't|cannot|can not|unable to|won't|will not)\s+(?:help|assist|comply|do that|provide|support)\b/.test(opening);
  const policy = /\b(?:against (?:my|the) (?:policy|guidelines)|not able to help|not able to assist)\b/.test(opening);
  return (sorry && (cannot || policy)) || ((t.startsWith("i ") || t.startsWith("as an ai")) && cannot && short) || (policy && short && !t.startsWith("i can "));
}
