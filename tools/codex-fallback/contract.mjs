// Inert building blocks for a future dispatcher adapter. Importing this module
// never starts Codex, changes queue ownership, or grants additional permissions.
import path from 'node:path';
import { StringDecoder } from 'node:string_decoder';

export function execArguments(worktree, { sandbox = 'read-only' } = {}) {
  if (typeof worktree !== 'string' || !path.isAbsolute(worktree) || worktree.includes('\0')) {
    throw new Error('An absolute, isolated worktree path is required');
  }
  if (!['read-only', 'workspace-write'].includes(sandbox)) throw new Error('Unsupported sandbox');
  // Prompt goes through stdin, never a shell or the process command line.
  // Preserve configured approval/rule enforcement; never use bypass flags.
  return ['exec', '--json', '--ephemeral', '--color', 'never', '--sandbox', sandbox, '--cd', worktree, '-'];
}

/** Consume documented Codex exec JSONL. A final message alone is not success:
 * require a completed turn, clean process exit, and the bridge RESULT contract.
 * This proves a runtime result only, never independent CI verification. */
export class CompletionReader {
  constructor({ maxLineBytes = 1024 * 1024 } = {}) {
    if (!Number.isSafeInteger(maxLineBytes) || maxLineBytes < 1) throw new Error('Invalid line limit');
    this.limit = maxLineBytes;
    this.decoder = new StringDecoder('utf8');
    this.buffer = '';
    this.thread = false;
    this.completed = false;
    this.active = false;
    this.message = '';
    this.failure = null;
    this.closed = false;
  }
  push(chunk) {
    if (this.closed) throw new Error('Reader already closed');
    if (this.failure) return;
    this.buffer += this.decoder.write(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    this.drain();
  }
  drain(final = false) {
    let newline;
    while ((newline = this.buffer.indexOf('\n')) !== -1) {
      const line = this.buffer.slice(0, newline);
      this.buffer = this.buffer.slice(newline + 1);
      this.line(line);
      if (this.failure) { this.buffer = ''; return; }
    }
    if (Buffer.byteLength(this.buffer) > this.limit) { this.failure = 'output-limit'; this.buffer = ''; }
    if (final && this.buffer) { this.line(this.buffer); this.buffer = ''; }
  }
  line(line) {
    if (Buffer.byteLength(line) > this.limit) { this.failure = 'output-limit'; return; }
    if (!line.trim()) return;
    let event;
    try { event = JSON.parse(line); } catch { this.failure = 'invalid-jsonl'; return; }
    if (!event || typeof event !== 'object' || typeof event.type !== 'string') {
      this.failure = 'invalid-event'; return;
    }
    switch (event.type) {
      case 'thread.started':
        if (this.thread || typeof event.thread_id !== 'string' || !event.thread_id) this.failure = 'invalid-lifecycle';
        else this.thread = true;
        break;
      case 'turn.started':
        if (!this.thread || this.active) { this.failure = 'invalid-lifecycle'; break; }
        this.active = true; this.completed = false; this.message = ''; break;
      case 'turn.completed':
        if (!this.active) { this.failure = 'invalid-lifecycle'; break; }
        this.active = false; this.completed = true; break;
      case 'turn.failed': case 'error': this.failure = 'runtime-failed'; break;
      case 'item.completed':
        if (event.item?.type === 'agent_message' && typeof event.item.text === 'string') {
          if (!this.active) this.failure = 'invalid-lifecycle';
          else this.message = event.item.text;
        }
        break;
      // Progress and future event types are not completion signals.
    }
  }
  finish(exitCode, signal = null) {
    if (this.closed) throw new Error('Reader already closed');
    this.closed = true;
    if (!this.failure) { this.buffer += this.decoder.end(); this.drain(true); }
    const last = this.message.trim().split(/\r?\n/).at(-1) || '';
    const result = /^RESULT:\s*(done|failed|paused)\b/i.exec(last)?.[1]?.toLowerCase();
    const reason = this.failure || (signal ? 'interrupted' : exitCode !== 0 ? 'process-failed' :
      !this.thread ? 'missing-thread' : !this.completed ? 'incomplete-turn' :
      result === 'paused' ? 'paused' : result === 'failed' ? 'task-failed' : result !== 'done' ? 'missing-result' : null);
    // Do not echo model/tool text, credentials or raw runtime diagnostics.
    return { success: reason === null, reason, verificationRequired: true };
  }
}
