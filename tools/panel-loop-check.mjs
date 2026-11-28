// The task loop: after a round the panel looks at the page again and carries on,
// and that next round is a question like any other — which is exactly where it
// used to die, because the 20 ms hand-off landed on a panel that a question had
// just made busy, and ask() returned false without a word.
//
// What this drives: the rules the loop is built from (page-actions.js) across
// three rounds against a stand-in page, the guard that lets a continuation wait
// instead of being dropped, and the loop stop when a round changes nothing.
// It also reads sidepanel.js to check ask() still asks the guard, still hands
// the same task along, and keeps how many steps the page actually took.
//
// What this does NOT prove: a real browser. ask() needs chrome.scripting and a
// live tab, so it cannot run here — the rounds below are the rules the panel
// follows, not the panel itself. Only loading the fixture in Chrome does that.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MAX_STEPS, MAX_ROUNDS, moreRounds, roundVerdict, startNow } from '../extension/page-actions.js';

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const panel = read('../extension/sidepanel.js').replace(/\r\n/g, '\n');
const test = (name, fn) => { fn(); console.log('  ✓ ' + name); };

// ---- the loop, round by round ----------------------------------------------

/**
 * One task as ask() runs it: do what the answer asked for on the page as it is
 * now, then let roundVerdict() say whether to look again. `page.take()` stands
 * in for actOnPage() and says what it did and how many steps landed; `answers`
 * stands in for the model, which sees the page as the last round left it.
 */
function drive({ answers, page, queued = () => 0, stop = () => false }) {
  const task = { steps: 0, rounds: 0 };
  const rounds = [];
  for (;;) {
    if (stop()) return { rounds, verdict: 'stopped' };
    const asked = answers(task);
    const did = asked ? page.take(asked) : { text: '', count: 0 };
    task.steps += did.count;
    task.rounds += 1;
    rounds.push({ ...did, steps: task.steps, rounds: task.rounds });
    const verdict = roundVerdict({ asked: !!did.text, landed: did.count, steps: task.steps, rounds: task.rounds, queued: queued() });
    if (verdict !== 'again') return { rounds, verdict };
  }
}

test('a three-step form takes three rounds, and only then does it stop', () => {
  // Step one per round: the page moves on under the model, so each answer is
  // about the page the last one left.
  const form = {
    left: 3,
    take() {
      if (!this.left) return { text: '', count: 0 };
      this.left -= 1;
      return { text: `Filled step ${3 - this.left}`, count: 1 };
    },
  };
  const run = drive({ answers: () => '[PAGE_CLICK: 5]', page: form });
  // Two rounds really happen: that is the case that never ran before.
  assert.equal(run.rounds.length, 4, 'three steps, then one round with nothing asked');
  assert.deepEqual(run.rounds.map((r) => r.count), [1, 1, 1, 0]);
  assert.deepEqual(run.rounds.map((r) => r.steps), [1, 2, 3, 3], 'the budget counts steps, not rounds');
  assert.equal(run.verdict, 'quiet', 'it stops because the answer asked for nothing, not because it ran out');
});

test('a round the page takes nothing from ends the task', () => {
  // The control was renumbered away: the step was attempted and changed nothing,
  // so looking again would only ask for the same thing again.
  const gone = { take: () => ({ text: 'Couldn\u2019t press item 5 \u2014 that item is no longer on the page', count: 0 }) };
  const run = drive({ answers: () => '[PAGE_CLICK: 5]', page: gone });
  assert.equal(run.rounds.length, 1);
  assert.equal(run.verdict, 'unchanged');
  assert.equal(run.rounds[0].steps, 0);
});

test('the budget ends it, by steps or by rounds, and says which', () => {
  assert.equal(moreRounds(11, 2, 1), true);
  assert.equal(moreRounds(12, 2, 1), false, 'twelve steps is twelve steps');
  assert.equal(moreRounds(2, MAX_ROUNDS, 1), false, 'and five rounds is five rounds');
  assert.equal(moreRounds(2, 1, 0), false, 'nothing landed: no more rounds whatever is left');

  const oneAtATime = { take: () => ({ text: 'Pressed \u201cNext\u201d', count: 1 }) };
  const slow = drive({ answers: () => '[PAGE_CLICK: 5]', page: oneAtATime });
  assert.equal(slow.verdict, 'budget');
  assert.equal(slow.rounds.length, MAX_ROUNDS, 'five rounds of one step');

  const fourAtATime = { take: () => ({ text: 'four things at once', count: 4 }) };
  const fast = drive({ answers: () => '[PAGE_CLICK: 1][PAGE_CLICK: 2][PAGE_CLICK: 3][PAGE_CLICK: 4]', page: fourAtATime });
  assert.equal(fast.verdict, 'budget');
  assert.equal(fast.rounds.length, 3, 'twelve steps in three rounds, not five');
  assert.equal(fast.rounds.at(-1).steps, MAX_STEPS);
});

test('a question waiting for the panel ends the loop, with no round spent on it', () => {
  const page = { take: () => ({ text: 'Pressed \u201cNext\u201d', count: 1 }) };
  const run = drive({ answers: () => '[PAGE_CLICK: 5]', page, queued: () => 1 });
  assert.equal(run.verdict, 'queued');
  assert.equal(run.rounds.length, 1);
});

test('Stop ends the loop mid-task, after the round it lands in', () => {
  // Stop bumps the epoch the task started in; the loop looks before each round.
  let epoch = 0;
  let taken = 0;
  const page = { take: () => { taken += 1; return { text: 'Pressed \u201cNext\u201d', count: 1 }; } };
  const taskEpoch = epoch;
  const run = drive({ answers: () => '[PAGE_CLICK: 5]', page, stop: () => { if (taken === 2) epoch += 1; return epoch !== taskEpoch; } });
  assert.equal(run.verdict, 'stopped');
  assert.equal(run.rounds.length, 2, 'it does not run to the budget after Stop');
});

// ---- the guard the loop's hand-off has to get through ----------------------

test('a continuation waits for the panel; a question the person typed does not', () => {
  assert.equal(startNow(), 'start');
  assert.equal(startNow({ busy: false, starting: false, desktopTask: false }), 'start');
  // The next round is the same task carrying on: a busy panel must not eat it.
  assert.equal(startNow({ busy: true, continuation: true }), 'wait');
  assert.equal(startNow({ starting: true, continuation: true }), 'wait');
  assert.equal(startNow({ desktopTask: true, continuation: true }), 'wait');
  // A question typed while something is running is refused here and queued.
  assert.equal(startNow({ busy: true }), 'refuse');
  assert.equal(startNow({ desktopTask: true }), 'refuse');
});

test('ask() asks the guard, and the next round is the same task', () => {
  assert.match(panel, /const gate = startNow\(\{ busy: !!busy, starting, desktopTask: !!desktopTask, continuation: !!after \}\)/, 'the entry guard must be the tested rule');
  assert.match(panel, /if \(gate === "refuse"\) return false;/, 'a busy panel still refuses a new question');
  assert.match(panel, /if \(gate === "wait"\)/, 'a continuation must wait rather than return false');
  assert.match(panel, /task\.epoch !== epoch/, 'Stop or Clear ends a continuation while it waits');
  assert.match(panel, /const task = walk \|\| \{ steps: 0, rounds: 0, epoch \};/, 'the task remembers the run it started in');
  assert.match(panel, /ask\(question, source, false, next, task\)/, 'the next round carries the task and what was just done');
  assert.match(panel, /landed = did\.count/, 'the panel must keep how many steps actually landed');
  assert.match(panel, /const verdict = roundVerdict\(/, 'the loop must decide with the tested rule');
  assert.match(panel, /if \(verdict === "again"\)/, 'and act on it');
  assert.match(panel, /verdict === "unchanged"\) \{\s*divider\(/, 'a round that changed nothing says so');
  assert.doesNotMatch(panel, /moreRounds\(/, 'the budget lives in page-actions.js, in one place');
});

// ---- the page to try it on -------------------------------------------------

test('the fixture has a chat box, a long-form body and a three-step form', () => {
  const page = read('./fixtures/page-actions.html');
  assert.match(page, /contenteditable="true"[^>]*aria-label="Message"/, 'a composer that sends on Enter');
  assert.match(page, /aria-label="Message body"/, 'a long-form body, where Enter is a new line');
  assert.match(page, /<button[^>]*>Send<\/button>/, 'with a Send button beside each');
  for (const step of [1, 2, 3]) assert.match(page, new RegExp(`data-step="${step}"`), `step ${step} of the form`);
  assert.match(page, /type="password"/, 'a password box, to see it is never numbered');
  assert.doesNotMatch(page, /<script[^>]+src=/, 'one file, nothing fetched: it opens from disk');
});

console.log('\npanel-loop: ok (three rounds driven, the guard waits, a round that changes nothing stops it)');
