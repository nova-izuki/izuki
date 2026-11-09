// Guards for the exact short-message failures reported in native Chat.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { build } from 'esbuild';

const require = createRequire(import.meta.url);
const { outputFiles } = await build({
  entryPoints: ['src/lib/chatIntent.ts'],
  bundle: true,
  write: false,
  platform: 'node',
  format: 'cjs',
});
const mod = { exports: {} };
new Function('require', 'module', 'exports', outputFiles[0].text)(require, mod, mod.exports);
const { clarificationFor, friendlyProviderError, providerRefusal, PROVIDER_REFUSAL_NOTE } = mod.exports;

// A bare request without context gets one question, never a local action.
assert.match(clarificationFor('answer', false), /what should i answer/i);
assert.match(clarificationFor('answer all for me', false), /what should i answer/i);
assert.match(clarificationFor('answer this', false), /what should i answer/i);
assert.match(clarificationFor('help me', false), /help with/i);
assert.match(clarificationFor('continue', false), /help with/i);
assert.match(clarificationFor('answer all these practice questions.', false), /practice or graded/i);
assert.match(clarificationFor('answer all my questions about this document.', false), /practice or graded/i);
assert.match(clarificationFor('explain all these graded questions', false), /practice or graded/i);

// A real follow-up is not interrupted with a question.
assert.equal(clarificationFor('answer', true), null);
assert.equal(clarificationFor('answer all for me', true), null);
assert.equal(clarificationFor('answer this: 2 + 2', true), null);
assert.equal(clarificationFor('whatttt', false), null);
assert.equal(clarificationFor('windows', false), null);
assert.equal(clarificationFor('turn off study log', false), null);
assert.equal(clarificationFor('what is photosynthesis?', false), null);

// A real request after the verb is never stopped with a question.
for (const said of [
  'explain everything about black holes',
  'explain each step of photosynthesis',
  'do everything you can to speed up my PC',
  'do everything on this page',
  'finish all the steps',
  'complete all my reminders for today',
  'answer the email from mom',
  'solve x^2 = 4',
]) assert.equal(clarificationFor(said, false), null, said);
assert.match(clarificationFor('do the quiz', false), /practice or graded/i);

assert.equal(providerRefusal("I'm sorry, but I can't help with that."), true);
assert.equal(providerRefusal("As an AI, I can't help with that."), true);
// An answer isn't a refusal because of a phrase somewhere in it.
assert.equal(providerRefusal('As an AI tutor, here is the method: first isolate x, then divide both sides.'), false);
assert.equal(providerRefusal('Here is a full explanation of the topic. '.repeat(8) + 'That would be against the guidelines of most schools.'), false);
// Status codes are whole numbers: "4290 tokens" is not a 429.
assert.doesNotMatch(friendlyProviderError('Used 4290 tokens of 6000 this minute; try a shorter message'), /rate-limited/i);
assert.equal(providerRefusal("I can't help with that."), true);
assert.equal(providerRefusal("That answer is correct."), false);
assert.equal(providerRefusal("I can help with that once you paste the question."), false);
assert.match(PROVIDER_REFUSAL_NOTE, /won't complete or submit/i);

// Raw fallback dumps must never become a wall of chat text.
assert.equal(friendlyProviderError("Stopped."), "Stopped.");
const rough = 'Done — that ran. (I couldn\'t write the summary: Groq (free, very fast): HTTP 429 Too Many Requests: {"error":{"message":"Rate limit reached"}}; OpenRouter: HTTP 429; NVIDIA NIM: HTTP 410 Gone; OpenAI compatible: no credits remaining)';
const friendly = friendlyProviderError(rough);
assert.match(friendly, /rate-limited|unavailable/i);
assert.ok(!friendly.includes("Groq"), friendly);
assert.ok(!friendly.includes("429"), friendly);
assert.ok(!friendly.includes("{"), friendly);
assert.match(friendlyProviderError("error sending request for url (https://generativelanguage.googleapis.com/v1beta/openai/chat/completions)"), /couldn't reach/i);

console.log('chat intent: ok (bare prompts ask once, follow-ups pass, failures are concise)');
