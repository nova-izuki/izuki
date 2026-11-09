// The Chat tab's recent list: titles, ordering, search and removal.
// These are pure helpers, so this runs without a browser.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { build } from 'esbuild';

const require = createRequire(import.meta.url);
const { outputFiles } = await build({
  entryPoints: ['src/lib/chatHistory.ts'],
  bundle: true,
  write: false,
  platform: 'node',
  format: 'cjs',
});
const mod = { exports: {} };
new Function('require', 'module', 'exports', outputFiles[0].text)(require, mod, mod.exports);
const { chatTitle, timeAgo, orderSessions, pinSession, rememberSession, removeSession, searchSessions, RECENT_CHAT_LIMIT } = mod.exports;

const msg = (role, content) => ({ role, content });

assert.equal(chatTitle([msg('assistant', 'Hello'), msg('user', '  Plan my **revision**\nfor Friday  ')]), 'Plan my revision for Friday');
assert.equal(chatTitle([msg('assistant', 'Hello')]), 'New chat');
assert(chatTitle([msg('user', 'x'.repeat(80))]).endsWith('…'), 'long titles are clipped');
assert.equal(chatTitle([msg('user', 'a_b `code` [link]')]), 'a_b code link');

assert.equal(timeAgo(1_000, 1_000), 'Just now');
assert.equal(timeAgo(1_000, 1_000 + 5 * 60_000), '5m ago');
assert.equal(timeAgo(1_000, 1_000 + 3 * 3_600_000), '3h ago');
assert.equal(timeAgo(1_000, 1_000 + 25 * 3_600_000), 'Yesterday');
assert.equal(timeAgo(1_000, 1_000 + 3 * 86_400_000), '3d ago');

const long = Array.from({ length: RECENT_CHAT_LIMIT + 3 }, (_, i) => ({
  id: `old-${i}`,
  title: `Old ${i}`,
  at: i,
  messages: [msg('user', `old ${i}`)],
}));
let list = rememberSession(long, 'active', 'Active chat', [msg('user', 'Active chat')], 10_000);
assert.equal(list.length, RECENT_CHAT_LIMIT, 'the list is capped');
assert.equal(list[0].id, 'active', 'the updated chat is first');
assert.equal(list[0].title, 'Active chat');
list = rememberSession(list, 'active', 'Renamed active', [msg('user', 'Active chat')], 20_000);
assert.equal(list.filter((s) => s.id === 'active').length, 1, 'no duplicate sessions');
assert.equal(list[0].title, 'Renamed active');

assert.deepEqual(searchSessions(list, 'OLD 1').map((s) => s.title).slice(0, 2), ['Old 12', 'Old 11']);
assert.deepEqual(searchSessions(list, '  ').length, list.length);
assert.deepEqual(removeSession(list, 'active').map((s) => s.id).includes('active'), false);

// Pinned chats stay first and survive both updates and the recent cap.
const withPin = pinSession(list, 'old-9', true);
assert.equal(withPin[0].id, 'old-9', 'a pinned chat goes to the top');
assert.equal(withPin[0].pinned, true);
const afterPin = rememberSession(withPin, 'after-pin', 'After pin', [msg('user', 'After pin')], 40_000);
assert.equal(afterPin[0].id, 'old-9', 'a pinned chat stays first when another chat is saved');
assert.equal(afterPin.find((s) => s.id === 'old-9')?.pinned, true, 'the pin survives an update');
assert.equal(afterPin.filter((s) => s.id === 'old-9').length, 1, 'pinning does not duplicate the chat');
assert.equal(pinSession(afterPin, 'old-9', false)[0].id, 'after-pin', 'unpinning restores newest-first order');
assert.deepEqual(
  orderSessions([
    { id: 'a', title: 'A', at: 1, messages: [], pinned: true },
    { id: 'b', title: 'B', at: 3, messages: [] },
    { id: 'c', title: 'C', at: 2, messages: [] },
  ]).map((s) => s.id),
  ['a', 'b', 'c'],
  'orderSessions puts pinned chats first, then newest first'
);

console.log('chat history: ok (titles, relative times, ordering, cap, pin, search and removal)');
