// "Find anything in Izuki" has to find things. The user typed real feature
// names into it and got nothing back, because the old search needed every
// word they typed to appear literally — so one "how" or one typo emptied the
// list. These are the phrasings a person actually types.
import assert from 'node:assert/strict';
import { build } from 'esbuild';

const { outputFiles } = await build({
  entryPoints: ['src/components/FeatureFinder.tsx'],
  bundle: true,
  write: false,
  platform: 'node',
  format: 'cjs',
  jsx: 'automatic',
  // Only the search functions are under test; the React parts are stubbed.
  external: ['react', 'react/jsx-runtime', 'lucide-react', '../lib/store', '../lib/styleNav'],
});
const stub = new Proxy({}, { get: () => () => undefined });
const module = { exports: {} };
new Function('require', 'module', 'exports', outputFiles[0].text)(() => stub, module, module.exports);
const { findFeatures, FEATURES } = module.exports;

const find = (q, loose = true) => findFeatures(q, 10, loose).map((f) => f.label);

// A whole sentence, the way someone asks for it out loud.
const sentences = {
  'how do I record my classes': 'Write down a Zoom call or class',
  'can izuki type what I say': 'Hold a key and talk to type anywhere',
  'I want it to only answer me': 'Only answer my voice (Hey Nova)',
  'what do I do in the car': 'Drive mode (in the car)',
  'how do I change the theme': 'Looks',
  'where are my notes': 'Izuki Notes',
  'what should I revise': 'What should I revise today?',
};
for (const [typed, wanted] of Object.entries(sentences)) {
  const got = find(typed);
  assert(got.includes(wanted), `"${typed}" should find "${wanted}" — got ${JSON.stringify(got)}`);
}

// Typos and the wrong plural still find it.
for (const [typed, wanted] of Object.entries({
  whispr: 'Hold a key and talk to type anywhere',
  'wispr flow': 'Hold a key and talk to type anywhere',
  dictaton: 'Hold a key and talk to type anywhere',
  carplay: 'Drive mode (in the car)',
  flashcard: 'What should I revise today?',
  shortcuts: 'Keyboard shortcuts',
  'hotkey': 'Keyboard shortcuts',
})) {
  const got = find(typed);
  assert(got.includes(wanted), `"${typed}" should find "${wanted}" — got ${JSON.stringify(got)}`);
}

// Every feature must be findable by its own name — no dead rows in the list.
for (const f of FEATURES) {
  const got = find(f.label);
  assert(got.includes(f.label), `"${f.label}" cannot find itself — got ${JSON.stringify(got)}`);
}

// A short word must not fuzzily match something else.
assert(!find('tv').includes('Read it to me'), '"tv" must not fuzzily hit "to"');
assert(find('tv').some((l) => l.toLowerCase().includes('tv')), '"tv" should find the TV features');

// Nothing typed, or nothing like it, returns nothing — not the whole list.
assert.deepEqual(find(''), []);
assert.deepEqual(find('   '), []);
assert.deepEqual(find('zzzqqxx'), []);

// The command box stays strict: it must not suggest features while someone
// types an ordinary command.
assert.deepEqual(find('open spotify and play something', false), []);

// ---------------------------------------------------------------------------
// The same matcher now runs the Settings search, the Apps catalogue and the
// search over your own notes, so test it on their shape of data too.
// ---------------------------------------------------------------------------
const searchSrc = await build({
  entryPoints: ['src/lib/search.ts'],
  bundle: true,
  write: false,
  platform: 'node',
  format: 'cjs',
});
const sm = { exports: {} };
new Function('require', 'module', 'exports', searchSrc.outputFiles[0].text)(() => stub, sm, sm.exports);
const { rank, searchTerms, matchScore, nearly, forms } = sm.exports;

const notes = [
  { title: 'Photosynthesis', text: 'Light reactions happen in the thylakoid membrane.', subject: 'Biology' },
  { title: 'Cell division', text: 'Mitosis has four phases.', subject: 'Biology' },
  { title: 'Nigerian independence', text: '1960, from Britain.', subject: 'History' },
];
const noteText = (n) => `${n.title} ${n.text} ${n.subject}`;
const titles = (q) => rank(notes, q, noteText, 10, true).map((n) => n.title);

// Asked for the way a person asks.
assert.deepEqual(titles('that note about photosynthesis'), ['Photosynthesis']);
assert.deepEqual(titles('photosynthesis notes'), ['Photosynthesis']);
assert.deepEqual(titles('what were the phases of mitosis'), ['Cell division']);
assert(titles('biology').length === 2, 'a subject finds its notes');
// A typo in a long word still finds it.
assert.deepEqual(titles('photosynthisis'), ['Photosynthesis']);
// Nothing like it returns nothing, not everything.
assert.deepEqual(titles('quantum chromodynamics'), []);
// An empty box shows the notes list untouched (the caller handles that), and
// the matcher itself matches nothing.
assert.deepEqual(rank(notes, '', noteText, 10, true), []);

// Pieces, checked on their own.
assert.deepEqual(searchTerms('how do I record my classes'), ['record', 'classes']);
assert.deepEqual(searchTerms('on its own'), ['own']);
// A query that is nothing but filler still searches, rather than clearing
// the list — "do it for me" is what someone types when they mean the
// "Do it for me" button.
assert.deepEqual(searchTerms('do it for me'), ['do', 'it', 'for', 'me']);
assert.deepEqual(searchTerms('a'), [], 'one letter is not a search');
// Both plural shapes, because the letters alone don't say which it is.
assert(forms('classes').includes('class'), 'classes → class');
assert(forms('notes').includes('note'), 'notes → note');
assert(forms('phases').includes('phase'), 'phases → phase');
assert(forms('batteries').includes('battery'), 'batteries → battery');
assert.deepEqual(forms('glass'), ['glass'], 'double-s words are left alone');
assert.deepEqual(forms('tv'), ['tv'], 'short words are left alone');
// The short form must not leak into unrelated words.
assert.equal(matchScore(['notes'], 'nothing happens here'), 0, '"notes" must not match "nothing"');
assert.equal(matchScore(['notes'], 'my note about cells'), 1);
assert(nearly('whispr', 'wispr') && nearly('sortcut', 'shortcut') && nearly('record', 'recrd'));
assert(!nearly('record', 'reject') && !nearly('cat', 'dog'));
assert.equal(matchScore(['record', 'class'], 'Record an online class'), 2);
assert.equal(matchScore(['record', 'class'], 'Record a flow'), 1);
assert.equal(matchScore([], 'anything'), 0);

console.log(`finder: ok (${FEATURES.length} features, all findable by name; shared matcher checked on notes too)`);
