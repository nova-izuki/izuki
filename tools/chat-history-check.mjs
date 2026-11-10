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
const { chatTitle, timeAgo, orderSessions, pinSession, rememberSession, removeSession, renameSession, clearSessions, searchSessions, startingMessages, RECENT_CHAT_LIMIT } = mod.exports;

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

assert.deepEqual(searchSessions(list, 'OLD 1').map((s) => s.title).slice(0, 2), ['Old 19', 'Old 18']);
const contentHit = [{ id: 'c', title: 'Untitled', at: 1, messages: [msg('user', 'photosynthesis and light')] }];
assert.equal(searchSessions(contentHit, 'PHOTOSYNTHESIS').length, 1, 'conversation text is searchable');
assert.deepEqual(searchSessions(list, '  ').length, list.length);
assert.deepEqual(removeSession(list, 'active').map((s) => s.id).includes('active'), false);
const renamed = renameSession(list, 'old-19', '  My   revision  ');
assert.equal(renamed.find((s) => s.id === 'old-19')?.title, 'My revision');
assert.equal(rememberSession(renamed, 'old-19', 'Auto title', [msg('user', 'new turn')], 30_000).find((s) => s.id === 'old-19')?.title, 'My revision', 'rename survives auto-save');
assert.deepEqual(clearSessions(), [], 'clear all is explicit and empty');

// Pinned chats stay first and survive both updates and the recent cap.
const withPin = pinSession(list, 'old-9', true);
assert.equal(withPin[0].id, 'old-9', 'a pinned chat goes to the top');
assert.equal(withPin[0].pinned, true);
const afterPin = rememberSession(withPin, 'after-pin', 'After pin', [msg('user', 'After pin')], 40_000);
assert.equal(afterPin[0].id, 'old-9', 'a pinned chat stays first when another chat is saved');
assert.equal(afterPin.find((s) => s.id === 'old-9')?.pinned, true, 'the pin survives an update');
assert.equal(afterPin.filter((s) => s.id === 'old-9').length, 1, 'pinning does not duplicate the chat');
assert.equal(pinSession(afterPin, 'old-9', false)[0].id, 'after-pin', 'unpinning restores newest-first order');
// An old pinned chat with a full list of newer ones: unpinning keeps it, and
// the oldest other unpinned chat makes room instead.
let full = pinSession(long, 'old-0', true);
for (let i = 0; i < RECENT_CHAT_LIMIT; i++) full = rememberSession(full, `new-${i}`, `New ${i}`, [msg('user', `new ${i}`)], 50_000 + i);
const unpinned = pinSession(full, 'old-0', false);
assert(unpinned.some((s) => s.id === 'old-0'), 'an unpinned old chat is never dropped');
assert.equal(unpinned.length, RECENT_CHAT_LIMIT, 'the cap still holds');
assert.equal(unpinned.at(-1).id, 'old-0', 'it goes back in age order (oldest last)');
assert(!unpinned.some((s) => s.id === 'new-0'), 'the oldest other chat made room');
assert.deepEqual(
  orderSessions([
    { id: 'a', title: 'A', at: 1, messages: [], pinned: true },
    { id: 'b', title: 'B', at: 3, messages: [] },
    { id: 'c', title: 'C', at: 2, messages: [] },
  ]).map((s) => s.id),
  ['a', 'b', 'c'],
  'orderSessions puts pinned chats first, then newest first'
);

// Which copy of the open chat to start with (two copies, saved separately).
const A = [msg('user', 'a1'), msg('assistant', 'a2'), msg('user', 'a3')];
const B = [msg('user', 'b1')];
const entry = (id, messages, rev) => ({ id, title: id, at: 1, messages, rev });
// An old install: no write numbers anywhere, the live copy wins as before.
assert.deepEqual(startingMessages({ rev: 0, messages: A }, 'chat', entry('chat', B)), A, 'old saves: live first');
// The live write failed and Recent's went through: Recent's is newer, whatever the counts.
assert.deepEqual(startingMessages({ rev: 4, session: 'chat', messages: B }, 'chat', entry('chat', A, 7)), A, 'newer Recent copy wins');
assert.deepEqual(startingMessages({ rev: 9, session: 'chat', messages: A }, 'chat', entry('chat', B, 7)), A, 'newer live copy wins');
// Equal counts don't decide anything: write order does.
assert.deepEqual(startingMessages({ rev: 3, session: 'chat', messages: [msg('user', 'old')] }, 'chat', entry('chat', [msg('user', 'new')], 4)), [msg('user', 'new')]);
// A chat cleared on purpose is a newer, empty live copy: it stays clear.
assert.deepEqual(startingMessages({ rev: 12, session: 'chat', messages: [] }, 'chat', entry('chat', A, 11)), [], 'a cleared chat stays cleared');
// A switch whose live write failed: the live copy is another chat's, never shown as this one.
assert.deepEqual(startingMessages({ rev: 20, session: 'other', messages: A }, 'chat', entry('chat', B)), B, 'another chat\'s live copy is never used');
assert.deepEqual(startingMessages({ rev: 20, session: 'other', messages: A }, 'chat', undefined), [], 'and nothing else to show is an empty chat');
// rememberSession keeps the write number with the entry.
assert.equal(rememberSession([], 's', 'S', B, 5, 31)[0].rev, 31);

console.log('chat history: ok (titles, relative times, ordering, cap, pin, search, removal and which saved copy is newer)');
