/**
 * Turn a reply into something a voice can say well.
 *
 * Voice assistants never read out markdown, bullet points, links or
 * emojis, and they say "for example", not "e.g." — text written for the
 * eye trips any text-to-speech voice into the stumbles and oddities that
 * make it sound like a machine. Everything spoken goes through here first.
 *
 * `keepTags` leaves the Orpheus voice's sound effects in (<laugh>,
 * <chuckle>, <sigh>…): that voice performs them. Other voices, and the
 * captions, get them stripped.
 */

const SOUND_TAGS = /<\/?(laugh|chuckle|sigh|gasp|cough|groan|yawn|sniffle)>/gi;

/** Written shorthand → how a person would say it. */
const SPOKEN: Array<[RegExp, string]> = [
  [/\be\.g\.,?/gi, "for example,"],
  [/\bi\.e\.,?/gi, "that is,"],
  [/\betc\./gi, "and so on"],
  [/\bvs\.?(?=\s)/gi, "versus"],
  [/\bapprox\.?(?=\s)/gi, "about"],
  [/(\d)\s?%/g, "$1 percent"],
  [/(\d)\s?°\s?C\b/g, "$1 degrees Celsius"],
  [/(\d)\s?°\s?F\b/g, "$1 degrees Fahrenheit"],
  [/\s&\s/g, " and "],
  [/\s\+\s/g, " plus "],
  [/\s=\s/g, " equals "],
  [/(\d)\s?x\s?(\d)/g, "$1 by $2"],
  [/\bw\/o\b/gi, "without"],
  [/\bw\/(?=\s)/gi, "with"],
  [/\s*(?:→|->)\s*/g, ", then "],
  [/\bctrl\s?\+\s?/gi, "control "],
  [/\balt\s?\+\s?/gi, "alt "],
  [/\bshift\s?\+\s?/gi, "shift "],
  [/\bwin(?:dows)?\s?\+\s?/gi, "windows key "],
  [/\s\/\s/g, " or "],
];

export function speakable(text: string, keepTags = false): string {
  // Models sometimes repeat their delivery tag in a later streamed sentence.
  // Filter at the speech boundary too, including apps/screen replies which
  // don't pass through the conversational header parser.
  let s = text.replace(/\[\s*(?:cheerful|excited|calm|serious|sympathetic|playful|curious|END)\s*\]/gi, " ");
  // Code isn't for reading aloud.
  s = s.replace(/```[\s\S]*?```/g, " ");
  s = s.replace(/`([^`]+)`/g, "$1");
  // Markdown: links keep their words; emphasis and headings go.
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  s = s.replace(/\*\*|__/g, "").replace(/(^|\s)\*(\S[^*]*)\*(?=\s|[.,!?]|$)/g, "$1$2");
  s = s.replace(/^\s{0,3}#{1,6}\s+/gm, "");
  // Bullet and numbered items become their own short sentences, so they
  // don't run together ("Spotify is open Volume is at…").
  s = s
    .split(/\r?\n/)
    .map((line) => {
      const item = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
      if (!item) return line;
      const t = item[1].trim();
      return /[.!?:;,]$/.test(t) ? t : `${t}.`;
    })
    .join("\n");
  // Links and addresses are said as what they are.
  s = s.replace(/https?:\/\/\S+|www\.\S+/gi, "the link");
  for (const [re, to] of SPOKEN) s = s.replace(re, to);
  if (!keepTags) s = s.replace(SOUND_TAGS, " ");
  // Emojis and stray symbols.
  s = s.replace(/\p{Extended_Pictographic}|️|‍/gu, "");
  s = s.replace(/[|~^{}\\]/g, " ");
  if (!keepTags) s = s.replace(/[<>]/g, " ");
  // Tidy spacing and make sure it ends like a sentence.
  s = s.replace(/\s+([,.!?])/g, "$1").replace(/\s+/g, " ").trim();
  if (s && !/[.!?…"')\]>]$/.test(s)) s += ".";
  return s;
}
