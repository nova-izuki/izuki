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

/**
 * A short request that has no attached/pasted material and no earlier turn to
 * continue. Returns the one useful question to ask instead of sending the
 * fragment to a model or to a local command.
 */
export function clarificationFor(text: string, hasContext: boolean): string | null {
  if (hasContext) return null;
  const s = normalized(text);
  if (!s) return null;
  const words = s.split(" ");
  const first = words[0];
  const wantsAnswer = ["answer", "solve", "do", "complete", "finish", "explain"].includes(first);
  const hasQuestionNoun = words.some((w) =>
    ["question", "questions", "quiz", "quizzes", "test", "tests", "problem", "problems", "exercise", "exercises", "assignment", "assignments"].includes(w)
  );
  const hasAll = words.some((w) => ["all", "these", "those", "them", "everything", "each"].includes(w));
  const hasAboutMaterial =
    words.includes("about") &&
    words.some((w) => ["document", "page", "book", "file", "assignment", "quiz", "test", "chapter"].includes(w));

  if (/^(?:answer|answer this|answer that)$/.test(s)) {
    return "What should I answer? Paste the question or attach the document, and I'll take it from there.";
  }
  if (/^(?:help me|explain|continue|go on|carry on)$/.test(s)) {
    return "What would you like me to help with? Paste the question or a little context, and I'll pick it up from there.";
  }
  if (wantsAnswer && (hasAll || hasQuestionNoun || hasAboutMaterial)) {
    return "What should I answer? Paste the questions or attach the document, and tell me whether they're practice or graded. For graded work I can explain and give hints, but I won't complete or submit it for you.";
  }
  return null;
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
  const rate = /(?:http\s*)?429|rate[- ]?limit|too many requests/.test(t);
  const credits = /no credits|insufficient[_ ]quota|credit balance|out of credits/.test(t);
  const retired = /(?:http\s*)?410|\bend of life\b|has been retired/.test(t);
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
  const sorry = /^(?:i'm sorry|i am sorry|sorry)[, ]/.test(t);
  const cannot = /\b(?:can't|cannot|can not|unable to|won't|will not)\s+(?:help|assist|comply|do that|provide|support)\b/.test(t);
  const policy = /\b(?:against (?:my|the) (?:policy|guidelines)|as an ai|not able to help|not able to assist)\b/.test(t);
  return (sorry && (cannot || policy)) || (t.startsWith("i ") && cannot) || (policy && !t.startsWith("i can "));
}
