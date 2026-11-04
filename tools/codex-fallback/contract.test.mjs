import test from 'node:test';
import assert from 'node:assert/strict';
import { execArguments, CompletionReader } from './contract.mjs';
import { probe } from './probe.mjs';

const start = [{ type: 'thread.started', thread_id: 'test-thread' }, { type: 'turn.started' }];
const message = (text) => ({ type: 'item.completed', item: { type: 'agent_message', text } });
const done = { type: 'turn.completed', usage: { input_tokens: 5, output_tokens: 5 } };
const encode = (events) => events.map((e) => JSON.stringify(e)).join('\r\n');
const read = (events, exit = 0, signal = null) => {
  const reader = new CompletionReader(); reader.push(encode(events)); return reader.finish(exit, signal);
};

test('stdin prompt and explicit sandbox preserve paths with spaces and shell syntax literally', () => {
  const dir = process.platform === 'win32' ? 'C:\\work space\\$(literal)' : '/work space/$(literal)';
  assert.deepEqual(execArguments(dir), ['exec', '--json', '--ephemeral', '--color', 'never', '--sandbox', 'read-only', '--cd', dir, '-']);
  assert.ok(execArguments(dir, { sandbox: 'workspace-write' }).includes('workspace-write'));
  for (const invalid of ['danger-full-access', '--full-auto', 'anything']) assert.throws(() => execArguments(dir, { sandbox: invalid }));
  for (const invalid of ['relative', '', null, `${dir}\0`]) assert.throws(() => execArguments(invalid));
});

test('UTF-8, CRLF and final unterminated line survive every possible byte boundary', () => {
  const input = Buffer.from(encode([...start, message('Checked café 🎯\nRESULT: done — verified'), done]));
  for (let split = 0; split <= input.length; split++) {
    const reader = new CompletionReader(); reader.push(input.subarray(0, split)); reader.push(input.subarray(split));
    assert.deepEqual(reader.finish(0), { success: true, reason: null, verificationRequired: true });
  }
});

test('never treats command output or an earlier RESULT as the final task result', () => {
  assert.equal(read([...start, { type: 'item.completed', item: { type: 'command_execution', aggregated_output: 'RESULT: done' } }, done]).reason, 'missing-result');
  assert.equal(read([...start, message('RESULT: done\nActually blocked'), done]).reason, 'missing-result');
  assert.equal(read([...start, message('RESULT: done'), message('Still working'), done]).reason, 'missing-result');
});

test('runtime success still requires completed turn, clean exit and no signal', () => {
  const events = [...start, message('RESULT: done'), done];
  assert.equal(read(events, 1).reason, 'process-failed');
  assert.equal(read(events, null, 'SIGTERM').reason, 'interrupted');
  assert.equal(read(events.slice(0, -1)).reason, 'incomplete-turn');
  assert.equal(read([...start, message('RESULT: paused — checkpoint'), done]).reason, 'paused');
  assert.equal(read([...start, message('RESULT: failed tests-failed — diagnosis'), done]).reason, 'task-failed');
});

test('errors remain failures even if later events claim success', () => {
  for (const type of ['turn.failed', 'error']) {
    assert.equal(read([...start, { type, error: { message: 'private runtime details' } }, message('RESULT: done'), done]).reason, 'runtime-failed');
  }
});

test('a new turn invalidates the preceding turn completion', () => {
  assert.equal(read([...start, message('RESULT: done'), done, { type: 'turn.started' }]).reason, 'incomplete-turn');
  assert.equal(read([...start, message('RESULT: done'), done, { type: 'turn.started' }, done]).reason, 'missing-result');
});

test('malformed or oversized output fails closed without leaking raw output', () => {
  for (const [input, reason] of [['not-json\n', 'invalid-jsonl'], ['null\n', 'invalid-event'], ['{}\n', 'invalid-event']]) {
    const reader = new CompletionReader(); reader.push(input); assert.equal(reader.finish(0).reason, reason);
  }
  for (const input of ['123456', '123456\n']) {
    const reader = new CompletionReader({ maxLineBytes: 5 }); reader.push(input); assert.equal(reader.finish(0).reason, 'output-limit');
  }
  const reader = new CompletionReader(); reader.finish(0);
  assert.throws(() => reader.push('x')); assert.throws(() => reader.finish(0));
});

test('unknown progress is tolerated but invalid lifecycle is rejected', () => {
  assert.equal(read([...start, { type: 'future.progress' }, message('RESULT: done'), done]).success, true);
  for (const events of [[done], [{ type: 'turn.started' }], [...start, { type: 'turn.started' }], [...start, done, message('RESULT: done')]]) {
    assert.equal(read(events).reason, 'invalid-lifecycle');
  }
});

test('probe only executes bounded metadata commands, never exec with a task or login', () => {
  const calls = [];
  const report = probe('trusted-codex', (binary, args, options) => {
    calls.push(args); assert.equal(binary, 'trusted-codex'); assert.equal(options.shell, false);
    assert.ok(options.timeout > 0); assert.equal(options.stdio[0], 'ignore');
    if (args[0] === '--version') return 'codex-cli 0.162.0-alpha.2\n';
    if (args[0] === 'exec') return '--json --ephemeral --sandbox --cd --color';
    return 'Logged in';
  });
  assert.deepEqual(calls, [['--version'], ['exec', '--help'], ['login', 'status']]);
  assert.equal(report.readyForManualTrial, true);
  assert.equal(report.automaticDispatch, false); assert.equal(report.runtimeTaskTested, false);
});

test('probe sanitizes missing executable, unsupported CLI and authentication failure', () => {
  const fail = () => { throw new Error('private credential and owner path'); };
  assert.deepEqual(probe('missing', fail).problems, ['cli-unavailable']);
  assert.deepEqual(probe('wrong', () => 'unrelated command').problems, ['unrecognized-cli']);
  const report = probe('codex', (_, args) => {
    if (args[0] === '--version') return 'codex-cli 1.0.0';
    if (args[0] === 'exec') return '--json';
    return fail();
  });
  assert.equal(report.readyForManualTrial, false);
  assert.deepEqual(report.problems, ['unsupported-exec-interface', 'authentication-unavailable']);
  assert.ok(!JSON.stringify(report).includes('private'));
});
