// How a chat reply is drawn: what shows as bold, italic, code and links, and
// what must be left exactly as written.
//
// Research replies ended with `_Say "continue the research"…_` and showed the
// underscores, because only *asterisk* italics were understood. Every AI
// writes both. The trap in fixing it is the other kind of underscore —
// snake_case names, URLs, __dunders__ — which must never turn italic.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { build } from 'esbuild';

const require = createRequire(import.meta.url);
const { outputFiles } = await build({
  entryPoints: ['src/components/ChatText.tsx'],
  bundle: true,
  write: false,
  platform: 'node',
  format: 'cjs',
  jsx: 'automatic',
  external: ['react', 'react/jsx-runtime', 'react-dom', 'lucide-react', '../lib/ipc'],
});
const stub = new Proxy({}, { get: () => () => null });
const mod = { exports: {} };
const load = (name) => (name === '../lib/ipc' || name === 'lucide-react' ? stub : require(name));
new Function('require', 'module', 'exports', outputFiles[0].text)(load, mod, mod.exports);

const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const html = (text) => renderToStaticMarkup(React.createElement(mod.exports.ChatText, { text }));
const italics = (text) => [...html(text).matchAll(/<i>(.*?)<\/i>/g)].map((m) => m[1]);

// The research footer, exactly as research.rs writes it.
const footer = '_Say “continue the research” or “dig deeper into …” to carry on from here._';
assert.equal(italics(footer).length, 1, 'the research footer should be italic');
assert(!html(footer).includes('>_Say'), 'the underscores themselves must not show');

assert.deepEqual(italics('this is _really_ good'), ['really']);
assert.deepEqual(italics('and *this* too'), ['this']);
assert.deepEqual(italics('a_b _c_ d_e'), ['c']);

// Underscores that are part of a word, a URL or a name stay as written.
for (const text of [
  'use my_var and file_name here',
  'snake_case_name_x',
  '__init__ is special',
  '_unclosed italic',
  'see https://example.com/a_b_c/d_e now',
]) {
  assert.deepEqual(italics(text), [], `nothing here is italic: ${text}`);
}
assert(html('use my_var here').includes('my_var'), 'snake_case is left alone');

// Bold, code and links still work alongside it.
assert(html('**bold** and `code_with_underscores`').includes('<b'), 'bold');
assert(html('`code_with_underscores`').includes('code_with_underscores'), 'code keeps its underscores');

console.log('chat text: ok (both kinds of italic; snake_case, URLs and __dunders__ untouched)');
