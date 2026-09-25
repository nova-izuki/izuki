/**
 * Meta-commands Izuki handles itself, instantly, without asking any model.
 *
 * "Hey Izuki, hide" should not cost a screenshot and a network round trip —
 * it should just happen. Anything that doesn't match one of these goes to
 * the real pipeline as a task for the AI to look at the screen and do.
 */

export type LocalCommand =
  | { kind: "hide" }
  | { kind: "show" }
  | { kind: "stop" }
  | { kind: "chat" }
  | { kind: "mute" }
  | { kind: "resetChat" }
  | { kind: "remember"; text: string }
  | { kind: "forget"; about: string }
  | { kind: "forgetAll" }
  | { kind: "sphere"; on: boolean }
  | { kind: "endConversation" }
  | { kind: "greeting" };

const PATTERNS: Array<{ test: RegExp; command: LocalCommand }> = [
  // Checked before "chat" so "chat back"/"reset chat" don't just open it.
  {
    test: /^(reset (the )?chat|bring (back )?(the )?chat( back)?|where'?s (the |my )?chat|find (the |my )?chat|chat back)\.?$/i,
    command: { kind: "resetChat" },
  },
  { test: /^(hide|go away|get out of the way|disappear|go ghost|leave me alone)\.?$/i, command: { kind: "hide" } },
  { test: /^(show yourself|come back|i'?m back|reveal yourself|reveal|where are you)\.?$/i, command: { kind: "show" } },
  // "Be quiet"/"shut up" mean stop *talking* — cut Izuki off — not stop listening.
  {
    test: /^(stop|stop everything|stop talking|cancel|cancel that|stand down|never ?mind|abort|shut up|be quiet|quiet|hush|enough|ok stop|okay stop)\.?!?$/i,
    command: { kind: "stop" },
  },
  { test: /^(chat|let me type|text mode|type instead|i'?d rather type)\.?$/i, command: { kind: "chat" } },
  { test: /^(mute|stop listening|turn off listening|mute yourself)\.?$/i, command: { kind: "mute" } },
  // Just saying hi — answered instantly, no trip to the AI.
  {
    test: /^(hey|hi|hello|hiya|howdy|yo|sup|hey there|hi there|hello there|what'?s up|wassup|good (morning|afternoon|evening))( izuki| nova| jarvis| there)?[.!?]*$/i,
    command: { kind: "greeting" },
  },
  // Ending a "Hey Izuki" conversation, the way you'd end one with a person.
  {
    test: /^(ok(ay)?,? )?(i'?m done|i am done|we'?re done|done|that'?s all|that'?s it|that will be all|that'?ll be all|nothing else|no,? that'?s all|no thanks|no thank you|thanks|thank you|thanks,? (that'?s all|i'?m done|bye)|thank you,? (that'?s all|i'?m done|bye)|bye|bye bye|goodbye|good ?night|see you|see ya|later|talk (to you )?later|end (the )?(chat|conversation)|close|you can go)[.!]*$/i,
    command: { kind: "endConversation" },
  },
];

/** "remember (that) I like tea" → "I like tea", in the user's own words. */
const REMEMBER = /^(?:please\s+)?(?:remember|don'?t forget|note|keep in mind)(?:\s+that)?[,:]?\s+(.{3,})$/i;
const FORGET_ALL = /^(?:please\s+)?(?:forget|clear|wipe|erase)\s+(?:everything|all)(?:\s+(?:about me|you know about me|you remember))?\.?$/i;
const FORGET = /^(?:please\s+)?forget(?:\s+(?:that|about))?\s+(.{3,}?)\.?$/i;

/** Turn "I like tea" into a line that reads right later: "User likes tea". */
function asFact(said: string): string {
  const t = said.trim().replace(/[.!]+$/, "");
  const swaps: Array<[RegExp, string]> = [
    [/^i am\b/i, "User is"],
    [/^i'm\b/i, "User is"],
    [/^i have\b/i, "User has"],
    [/^i've\b/i, "User has"],
    [/^i was\b/i, "User was"],
    [/^my\b/i, "User's"],
    [/^i\s+(\w+)/i, "User $1s"],
  ];
  for (const [re, to] of swaps) if (re.test(t)) return t.replace(re, to);
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/**
 * Lasting facts people mention in passing — "my name is Sam", "I love
 * jazz", "call me Jay" — caught on the spot, whatever model is in use
 * (free ones often ignore the memory instructions). The model still adds
 * anything subtler itself.
 */
const FACTS: Array<[RegExp, (m: RegExpMatchArray) => string]> = [
  [/\bmy name is ([a-z][a-z' -]{1,30}?)(?:[.,!?]|$| and\b)/i, (m) => `User's name is ${cap(m[1])}`],
  [/\bcall me ([a-z][a-z' -]{1,30}?)(?:[.,!?]|$| from now| please)/i, (m) => `User wants to be called ${cap(m[1])}`],
  [/\bi(?:'m| am) (\d{1,2}) (?:years old|yrs old|y\/o)\b/i, (m) => `User is ${m[1]} years old`],
  [/\bi (?:really )?(love|like|enjoy|hate|can't stand|prefer) ([^.!?,]{3,60})/i, (m) => `User ${verb(m[1])} ${m[2].trim()}`],
  [/\bmy favou?rite ([a-z ]{2,20}) is ([^.!?,]{2,40})/i, (m) => `User's favourite ${m[1].trim()} is ${m[2].trim()}`],
  [/\bi(?:'m| am) (?:a|an) ([a-z ]{3,40}?)(?:[.,!?]|$| and\b| at\b| from\b)/i, (m) => `User is a ${m[1].trim()}`],
  [/\bi live in ([^.!?,]{2,40})/i, (m) => `User lives in ${m[1].trim()}`],
  [/\bi work (?:at|for|as) ([^.!?,]{2,50})/i, (m) => `User works ${m[0].match(/\b(at|for|as)\b/i)![1].toLowerCase()} ${m[1].trim()}`],
];

function cap(s: string) {
  return s.trim().replace(/\b\w/g, (c) => c.toUpperCase());
}
function verb(v: string) {
  const l = v.toLowerCase();
  return l === "can't stand" ? "can't stand" : `${l}s`;
}

/** Facts worth remembering in something the user just said or typed. */
export function autoFacts(said: string): string[] {
  const out: string[] = [];
  for (const [re, make] of FACTS) {
    const m = said.match(re);
    if (m) out.push(make(m));
  }
  // "I like it", "I love you", "I'm a bit lost" aren't facts about the user.
  return out.filter(
    (f) => !/\b(it|that|this|them|you|u)$/i.test(f) && !/^User is a (bit|little|tad|lot|mess)\b/i.test(f)
  );
}

/** "hide the sphere", "no more orb", "turn the circle back on"… */
const SPHERE_WORD = String.raw`(?:voice\s+)?(?:sphere|orb|circle|ball|wave|blob)`;
const SPHERE_OFF = new RegExp(
  String.raw`^(?:please\s+)?(?:hide|turn off|disable|remove|stop showing|get rid of|no more|close|dismiss)\s+(?:the\s+|that\s+|your\s+)?(?:round\s+|big\s+|watery\s+)*${SPHERE_WORD}(?:\s+(?:thing|off))?\.?$`,
  "i"
);
const SPHERE_ON = new RegExp(
  String.raw`^(?:please\s+)?(?:show|turn on|enable|bring back)\s+(?:the\s+|that\s+|your\s+)?(?:round\s+|big\s+|watery\s+)*${SPHERE_WORD}(?:\s+(?:thing|back|on))?(?:\s+on)?\.?$`,
  "i"
);

export function matchLocalCommand(heard: string): LocalCommand | null {
  const norm = heard.trim();
  if (!norm) return null;
  if (SPHERE_OFF.test(norm)) return { kind: "sphere", on: false };
  if (SPHERE_ON.test(norm)) return { kind: "sphere", on: true };
  if (FORGET_ALL.test(norm)) return { kind: "forgetAll" };
  const forget = norm.match(FORGET);
  // "Forget it" / "forget that" mean "never mind", not "delete a memory".
  if (forget && !/^(it|that|this|about it|about that|everything i said)$/i.test(forget[1].trim())) {
    return { kind: "forget", about: forget[1].replace(/^(?:that\s+)?(?:i|my)\s+/i, "") };
  }
  if (/^forget (it|that|this)\.?$/i.test(norm)) return { kind: "stop" };
  const remember = norm.match(REMEMBER);
  if (remember) return { kind: "remember", text: asFact(remember[1]) };
  for (const { test, command } of PATTERNS) {
    if (test.test(norm)) return command;
  }
  return null;
}
