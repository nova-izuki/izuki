// Where the voice starts: the first breath has to be early, whole, and in
// order. Pure text, no audio and no network.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const html = fs.readFileSync(path.join(root, 'docs/app/index.html'), 'utf8');

const from = html.indexOf('  const CLING = new Set(');
const end = html.indexOf('  // ---- end when the voice starts ----');
assert.ok(from > 0 && end > from, 'the first-breath block must be in the page');
const ctx = vm.createContext({});
vm.runInContext(html.slice(from, end) + '\nglobalThis.firstBreath = firstBreath;', ctx);
const firstBreath = ctx.firstBreath;

const words = (s) => s.trim().split(/\s+/).length;
const CLINGERS = new Set(['the', 'and', 'of', 'to', 'a', 'is', 'in', 'that', 'my']);

// A short full sentence is the best first breath.
assert.equal(firstBreath('It is going to rain later today, so take an umbrella with you. Then go out.'),
  'It is going to rain later today, so take an umbrella with you.');
// …but "Hi." alone is not offered yet: nothing follows it to prove it is complete.
assert.equal(firstBreath('Hi.'), '');

// A long sentence with a clause breaks at the clause.
const longClause = 'The top event in Houston this weekend, a free jazz night at the park, starts at eight.';
assert.equal(firstBreath(longClause), 'The top event in Houston this weekend,');
assert.ok(words(firstBreath(longClause)) <= 8, 'the opening stays short');

// A long sentence with no clause: about eight words, never ending on a word
// that dangles (here "is" would have been word eight).
const noClause = 'The top event in Houston this weekend is a free jazz night at the park downtown.';
const cut = firstBreath(noClause);
assert.equal(cut, 'The top event in Houston this weekend');
assert.ok(!CLINGERS.has(cut.split(' ').pop()), 'never stop on a clinging word');
assert.equal(words(cut), 7);

// Never inside a word, and always a prefix: the rest follows in order.
for (const text of [noClause, longClause, 'One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen.']) {
  const piece = firstBreath(text);
  assert.ok(text.startsWith(piece), 'the first breath must be a prefix');
  const next = text[piece.length];
  assert.equal(next, ' ', 'the cut must land on a space, never inside a word');
  assert.ok(piece.trim() === piece, 'no trailing space is spoken');
}

// Not enough yet: say nothing rather than half a phrase.
assert.equal(firstBreath('The top event'), '');
assert.equal(firstBreath(''), '');
assert.equal(firstBreath('   '), '');
assert.equal(firstBreath(null), '');

// The eight-word rule only fires once a ninth word has begun.
assert.equal(firstBreath('one two three four five six seven eight'), '');
assert.equal(firstBreath('one two three four five six seven eight nine'), 'one two three four five six seven eight');

// A dash or a semicolon is a clause too.
assert.equal(firstBreath('Here is the thing about that — it only works if you ask first.'), 'Here is the thing about that —');
// A very long clause with no break still gets an eight-word opening.
const runOn = 'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu.';
assert.equal(words(firstBreath(runOn)), 8);

// More words in the opening is not automatically sooner: the first audio is
// timed in the page itself (`first audio after … ms`), not assumed here.
console.log('speechseg: 18 checks passed');
