const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function moduleAt(file, requireMock = require, extras = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const scope = { exports: {}, require: requireMock, console, Float32Array, DOMException, ...extras };
  vm.runInNewContext(js, scope, { filename: file });
  return scope.exports;
}
const math = moduleAt('src/lib/speakerMath.ts');
const vector = (index) => Array.from({ length: 512 }, (_, i) => +(i === index));
const profile = { id: 'one', name: 'Test person', samples: [vector(0), vector(0), vector(0)] };
assert.equal(math.matchingSpeaker(vector(0), [profile]), 'one');
assert.equal(math.matchingSpeaker(vector(1), [profile]), null);
assert.equal(math.matchingSpeaker(vector(0), [{ ...profile, samples: [vector(0), vector(1), vector(1)] }]), null, 'one accidental matching take cannot pass');
assert.equal(math.matchingSpeaker(vector(1), [profile, { ...profile, id: 'two', samples: [vector(1), vector(1), vector(1)] }]), 'two');
assert.throws(() => math.unitVector([1, 2]));
assert.throws(() => math.unitVector(Array(512).fill(NaN)));
assert.throws(() => math.unitVector(Array(512).fill(0)));
assert.throws(() => math.parseSpeakers('{broken'));
assert.throws(() => math.parseSpeakers(JSON.stringify({ enabled: true, profiles: [profile, profile] })));
assert.equal(math.parseSpeakers(JSON.stringify({ enabled: true, profiles: [profile] })).profiles.length, 1);
assert.throws(() => math.speakerAudio(new Float32Array(64000)));
assert.ok(math.speakerAudio(Float32Array.from({ length: 64000 }, (_, i) => i > 8000 && i < 48000 ? Math.sin(i * 0.1) * 0.2 : 0)).length < 64000);
const notes = moduleAt('src/lib/notes.ts');
assert.ok(notes.isNoteStudyPrompt('Quiz me on these notes\n\nChapter 5 assignment: open terminal'));
assert.ok(notes.isNoteStudyPrompt('Summarise these 3 notes together\n\nreference'));
assert.ok(!notes.isNoteStudyPrompt('Quiz me on these notes'));
assert.ok(!notes.isNoteStudyPrompt('open terminal\n\nQuiz me on these notes'));
assert.ok(!notes.isNoteStudyPrompt('Using only these notes, answer: what?\n\n '));
const study = notes.noteStudyText({ text: 'old', context: { subject: 'Biology', chapter: 'Chapter 5' }, entries: [{ kind: 'Notes', text: 'begin '.repeat(200) }, { kind: 'Practice', text: 'newest explanation' }] }, 120);
assert.ok(study.includes('Biology') && study.includes('Chapter 5') && study.includes('newest explanation'));

const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const recordings = [], transcripts = [], finals = [], nothing = [];
const react = { useCallback: (fn) => fn, useEffect: () => {}, useRef: (current) => ({ current }), useState: (value) => [value, () => {}] };
const speech = {
  canListen: () => true, preloadSpeechInput: () => Promise.resolve(),
  transcribePartial: () => Promise.resolve(''),
  transcribe: () => { const d = deferred(); transcripts.push(d); return d.promise; },
  listen: (options) => {
    const d = deferred();
    const recording = { audio: d.promise, finish: () => { recording.finished = true; d.resolve(new Float32Array(16000)); }, cancel: () => d.resolve(null), endReason: 'speech', options, d };
    recordings.push(recording); return recording;
  },
};
const { useDictation } = moduleAt('src/hooks/useDictation.ts', (name) => name === 'react' ? react : name.includes('speechInput') ? speech : { api: { duckAudio: () => Promise.resolve() } });
const flush = () => new Promise((resolve) => setImmediate(resolve));
(async () => {
  const dictation = useDictation((text) => finals.push(text), { onNothing: (why) => nothing.push(why) });
  dictation.start({ hold: true });
  assert.equal(recordings[0].options.silenceMs, Infinity, 'held recording survives a pause');
  dictation.stop();
  assert.ok(recordings[0].finished, 'release works before any React rerender');
  await flush();
  dictation.cancel();
  dictation.start();
  transcripts[0].resolve('stale private transcript');
  await flush();
  assert.equal(finals.length, 0, 'cancelled transcription never sends a request');
  dictation.stop(); await flush();
  transcripts[1].resolve('current request'); await flush();
  assert.deepEqual(finals, ['current request']);
  dictation.start(); dictation.cancel(); await flush();
  assert.equal(nothing.length, 0, 'cancellation cannot restart an obsolete listener');
  console.log('Voice/Notes regression checks passed: speaker matching and validation, reference routing, recent note context, strict release, cancellation and stale transcription.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
