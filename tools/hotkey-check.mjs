// A global shortcut is taken from every app on the PC, so Izuki must never
// save one that a person needs while typing. The Shortcuts list used to accept
// a bare Space or letter, which registered that key globally and swallowed it
// everywhere — this checks the rule, and the spellings Windows and Rust share.
import assert from 'node:assert/strict';
import { build } from 'esbuild';

const { outputFiles } = await build({
  entryPoints: ['src/lib/hotkeys.ts'],
  bundle: true,
  write: false,
  platform: 'node',
  format: 'cjs',
});
const module = { exports: {} };
new Function('module', 'exports', outputFiles[0].text)(module, module.exports);
const { shortcutFromKey, canonicalShortcut, needsModifier } = module.exports;

const press = (key, code = key, mods = {}) => ({
  key,
  code,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  metaKey: false,
  ...mods,
});

// A key on its own is not a shortcut — except an F-key, which nothing types.
assert.equal(shortcutFromKey(press(' ', 'Space')), null, 'bare Space must be refused');
assert.equal(shortcutFromKey(press('a', 'KeyA')), null, 'a bare letter must be refused');
assert.equal(shortcutFromKey(press('1', 'Digit1')), null, 'a bare digit must be refused');
assert.equal(shortcutFromKey(press('Enter', 'Enter')), null, 'bare Enter must be refused');
assert.equal(shortcutFromKey(press('F9', 'F9')), 'F9', 'an F-key works alone');
assert.equal(shortcutFromKey(press('F24', 'F24')), 'F24', 'F24 works alone');

// The combos people actually pick.
assert.equal(shortcutFromKey(press(' ', 'Space', { ctrlKey: true, shiftKey: true })), 'Ctrl+Shift+Space');
assert.equal(shortcutFromKey(press(' ', 'Space', { ctrlKey: true, altKey: true })), 'Ctrl+Alt+Space');
assert.equal(shortcutFromKey(press('!', 'Digit1', { shiftKey: true })), 'Shift+1', 'Shift+1 is not Shift+!');
assert.equal(shortcutFromKey(press('Control', 'ControlLeft', { ctrlKey: true })), null, 'a modifier alone waits for a key');

// Two spellings of the same chord must compare equal, or the clash check
// lets a duplicate through and Windows silently drops the second.
assert.equal(canonicalShortcut('Ctrl+Shift+Space'), canonicalShortcut('control + shift + spacebar'));
assert.equal(canonicalShortcut('Win+Space'), canonicalShortcut('super+space'));
assert.notEqual(canonicalShortcut('Ctrl+Space'), canonicalShortcut('Shift+Space'));
assert.equal(canonicalShortcut('Ctrl+A+B'), '', 'two keys are not a shortcut');

assert.equal(needsModifier('F5'), false);
assert.equal(needsModifier('Space'), true);
assert.equal(needsModifier('A'), true);

console.log('hotkey-check: ok');
