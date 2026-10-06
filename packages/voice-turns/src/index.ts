/**
 * voice-turns — two small pieces every voice assistant needs, with no
 * dependencies. Made for Izuki (github.com/nova-izuki/izuki); MIT.
 *
 * - EchoGate: while the assistant talks, is that the user talking over it —
 *   or just the assistant's own voice coming back into a laptop mic?
 * - QuietGate: let an always-on detector (a wake word) rest in a silent room
 *   without ever missing the first syllable when someone speaks.
 *
 * Levels are plain RMS of float samples (-1..1).
 */

/** RMS level of a chunk of float samples. */
export function rms(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  return Math.sqrt(sum / Math.max(1, samples.length));
}

export interface EchoGateOptions {
  /** How long it only listens and learns when the assistant starts talking. */
  warmupMs?: number;
  /** How much louder than the expected echo the mic must be to count as the user. */
  margin?: number;
  /** Never count anything quieter than this as the user. */
  minLevel?: number;
  /** A starting guess for mic level ÷ output level. */
  startGain?: number;
}

/**
 * Talking over the assistant ("barge-in"). Feed it every mic chunk while
 * the assistant is speaking, with the assistant's own output level at that
 * moment. It learns how much of the output comes back into the mic (the
 * echo gain) from chunks that aren't the user, and says what level the mic
 * must beat right now for it to be the user.
 *
 * A fixed threshold fails both ways: speakers turned up drown the user out,
 * or the assistant's own voice interrupts itself. Relative to the measured
 * echo, neither happens.
 */
export class EchoGate {
  private gain: number;
  private talkingMs = 0;
  private readonly warmupMs: number;
  private readonly margin: number;
  private readonly minLevel: number;

  constructor(o: EchoGateOptions = {}) {
    this.warmupMs = o.warmupMs ?? 500;
    this.margin = o.margin ?? 2.2;
    this.minLevel = o.minLevel ?? 0.018;
    this.gain = o.startGain ?? 0.6;
  }

  /** The assistant stopped talking: the next time starts with a fresh warm-up. */
  reset() {
    this.talkingMs = 0;
  }

  /** The learned mic ÷ output ratio (for logs). */
  get echoGain() {
    return this.gain;
  }

  /**
   * One mic chunk while the assistant talks. `mic` and `out` are RMS levels,
   * `roomFloor` the room's level with nobody talking. Returns the level the
   * mic must exceed to count as the user — or `null` during the warm-up,
   * when nothing counts yet (it's learning the echo).
   */
  threshold(mic: number, out: number, chunkMs: number, roomFloor = 0): number | null {
    this.talkingMs += chunkMs;
    if (this.talkingMs <= this.warmupMs) {
      if (out > 0.01) this.gain = Math.min(3, this.gain * 0.6 + (mic / out) * 0.4);
      return null;
    }
    const bar = Math.max(this.minLevel, roomFloor * 3, this.gain * out * this.margin);
    // Keep learning, only from chunks that aren't the user (under the bar).
    if (out > 0.01 && mic < bar) this.gain = Math.min(3, this.gain * 0.9 + (mic / out) * 0.1);
    return bar;
  }
}

export interface QuietGateOptions {
  sampleRate?: number;
  /** How much audio from before a sound is replayed when waking. */
  holdSeconds?: number;
  /** How long it stays awake after the last sound. */
  awakeMs?: number;
  /** Anything under this is silence, whatever the room. */
  minLevel?: number;
}

/**
 * Rest an always-on detector in silence. `push` every chunk: it returns the
 * audio to run now — with the moment before a sound replayed first when it
 * wakes up — or `null` to rest. The room's own level is learned, so a fan
 * or hum doesn't keep it awake forever.
 */
export class QuietGate {
  private held: Float32Array[] = [];
  private heldLength = 0;
  private floor = 0.003;
  private awakeUntil = 0;
  /** Chunks skipped while resting (for "how much did we save"). */
  rested = 0;
  private readonly hold: number;
  private readonly awakeMs: number;
  private readonly minLevel: number;

  constructor(o: QuietGateOptions = {}) {
    this.hold = Math.round((o.sampleRate ?? 16000) * (o.holdSeconds ?? 1.6));
    this.awakeMs = o.awakeMs ?? 2500;
    this.minLevel = o.minLevel ?? 0.006;
  }

  push(samples: Float32Array, now = Date.now()): Float32Array[] | null {
    const level = rms(samples);
    const sound = level > Math.max(this.minLevel, this.floor * 3);
    if (!sound) this.floor = this.floor * 0.95 + level * 0.05;
    if (sound) {
      const waking = now > this.awakeUntil;
      this.awakeUntil = now + this.awakeMs;
      if (waking && this.heldLength) return [this.takeHeld(), samples];
    }
    if (now > this.awakeUntil) {
      this.held.push(samples);
      this.heldLength += samples.length;
      while (this.held.length > 1 && this.heldLength - this.held[0].length >= this.hold) {
        this.heldLength -= this.held.shift()!.length;
      }
      this.rested++;
      return null;
    }
    return [samples];
  }

  private takeHeld(): Float32Array {
    const out = new Float32Array(this.heldLength);
    let at = 0;
    for (const h of this.held) {
      out.set(h, at);
      at += h.length;
    }
    this.held = [];
    this.heldLength = 0;
    return out;
  }
}
