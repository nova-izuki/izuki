/**
 * Chat shorthand → plain words, so the instant commands (which match plain
 * phrases, no AI) understand "wats the ans", "pls open yt", "nxt song",
 * "turn it up rn". The AI brains read shorthand fine; this is for the parts
 * of Izuki that answer without one. Whole words only — "answer" stays put.
 */
const SHORT: Record<string, string> = {
  ans: "answer",
  pls: "please",
  plz: "please",
  pleas: "please",
  u: "you",
  ur: "your",
  wat: "what",
  wht: "what",
  wats: "what's",
  whats: "what's",
  nxt: "next",
  abt: "about",
  thx: "thanks",
  ty: "thank you",
  msg: "message",
  msgs: "messages",
  vid: "video",
  vids: "videos",
  yt: "youtube",
  rn: "right now",
  b4: "before",
  "2day": "today",
  "2moro": "tomorrow",
  tmrw: "tomorrow",
  tmr: "tomorrow",
  bc: "because",
  cuz: "because",
  coz: "because",
  ppl: "people",
  pic: "picture",
  pics: "pictures",
  info: "information",
  qs: "questions",
  qn: "question",
  pwr: "power",
  vol: "volume",
  opn: "open",
  plsss: "please",
  gonna: "going to",
  wanna: "want to",
  gimme: "give me",
  lemme: "let me",
};

export function expandShortWords(text: string): string {
  return text.replace(/[A-Za-z0-9']+/g, (word) => {
    const full = SHORT[word.toLowerCase()];
    if (!full) return word;
    // Keep a capital at the start of a sentence.
    return word[0] === word[0].toUpperCase() && /[a-z]/i.test(word[0]) ? full[0].toUpperCase() + full.slice(1) : full;
  });
}
