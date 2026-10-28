//! How every search box in Izuki matches what someone typed.
//!
//! All of them used to be `haystack.includes(query)` — the whole query, one
//! literal substring. That fails the way people actually type: "how do I
//! record my classes" finds nothing because of "how", "voice shortcut" finds
//! nothing because the words are the other way round, and one slipped letter
//! ("whispr") hides the feature completely. A search that answers "nothing
//! found" when the thing is right there is worse than no search.

/** Words that carry no meaning in a search box: "how do I record my class"
 *  is a search for "record class". */
const FILLER = new Set([
  "a", "about", "all", "an", "and", "any", "are", "as", "at", "be", "but", "by", "can", "could", "did", "do",
  "does", "dont", "for", "from", "get", "go", "has", "have", "how", "i", "if", "im", "in", "into", "is", "it",
  "its", "just", "like", "make", "me", "my", "no", "not", "of", "on", "or", "so", "some", "that", "the", "them",
  "then", "there", "they", "this", "to", "up", "use", "want", "was", "way", "we", "what", "when", "where",
  "which", "will", "with", "would", "you", "your",
]);

const WORDS = /[^\p{L}\p{N}+#]+/u;
const normalized = (value: string) => value.toLowerCase().normalize("NFKD").replace(/\p{M}/gu, "");

/** The forms of a word a search should treat as one: as typed, and the
 *  singular(s) it could be.
 *
 *  A list rather than one "stem" on purpose — English won't tell you from
 *  the letters alone whether the plural dropped an "s" ("notes" → "note")
 *  or an "es" ("classes" → "class"), so both are kept and a match on either
 *  counts. One stem per word got "notes" wrong as "not". */
export function forms(word: string): string[] {
  const out = [word];
  if (word.endsWith("ies") && word.length > 4) out.push(`${word.slice(0, -3)}y`);
  if (word.endsWith("es") && word.length > 4) out.push(word.slice(0, -2));
  if (word.endsWith("s") && !word.endsWith("ss") && word.length > 3) out.push(word.slice(0, -1));
  return out;
}

/** One letter wrong, missing or extra — "whispr" for "wispr", "sortcut" for
 *  "shortcut". People type fast; nothing should hide behind a typo. */
export function nearly(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let slips = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i += 1;
      j += 1;
      continue;
    }
    slips += 1;
    if (slips > 1) return false;
    if (a.length > b.length) i += 1;
    else if (b.length > a.length) j += 1;
    else {
      i += 1;
      j += 1;
    }
  }
  return slips + (a.length - i) + (b.length - j) <= 1;
}

/** The words worth searching for, filler dropped. Empty when nothing is
 *  typed — a search box with nothing in it matches nothing, not everything. */
export function searchTerms(query: string): string[] {
  const typed = [...new Set(normalized(query).split(WORDS).filter((t) => t.length > 1 || /^\p{N}$/u.test(t)))];
  const meaty = typed.filter((t) => !FILLER.has(t));
  // "on its own" is all filler words and still a real feature name.
  return meaty.length ? meaty : typed;
}

function hits(term: string, words: string[], hay: string): boolean {
  // Chapter 5 must remain searchable without also matching Chapter 15.
  if (/^\p{N}+$/u.test(term)) return words.includes(term);
  if (hay.includes(term)) return true;
  // Whole words only for the singular/plural match, so the short form of
  // "notes" can't turn up inside "nothing".
  const mine = forms(term);
  if (words.some((w) => forms(w).some((f) => mine.includes(f)))) return true;
  // Short words have to really be there — "tv" must not fuzzily hit "to".
  if (term.length < 5) return false;
  return words.some((w) => w.length >= 4 && nearly(w, term));
}

/** How many of `terms` this text answers to. 0 means show it to nobody. */
export function matchScore(terms: string[], text: string): number {
  if (!terms.length) return 0;
  const hay = normalized(text);
  const words = hay.split(WORDS).filter(Boolean);
  return terms.filter((t) => hits(t, words, hay)).length;
}

/** Everything that matches, best first.
 *
 *  `loose` is for a search box, where "nothing found" is the worst possible
 *  answer: it keeps the closest matches and anything within one word of them.
 *  Leave it off where the box is really a command line, so typing an ordinary
 *  sentence doesn't drag in half-related rows mid-keystroke. */
export function rank<T>(items: T[], query: string, text: (item: T) => string, max = 8, loose = false): T[] {
  const terms = searchTerms(query);
  if (!terms.length) return [];
  const scored = items
    .map((item) => ({ item, score: matchScore(terms, text(item)) }))
    .filter((s) => s.score > 0);
  const best = Math.max(...scored.map((s) => s.score), 1);
  const need = loose ? Math.max(best - 1, 1) : terms.length;
  return scored
    .filter((s) => s.score >= need)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((s) => s.item);
}
