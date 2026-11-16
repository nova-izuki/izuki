package com.novaizuki.mobile;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

/** The "Hey Nova" listener's rules: no loops, quiet in silence, a bounded budget. */
public class WakeGateTest {

  private static short[] tone(double amplitude, int count) {
    short[] s = new short[count];
    for (int i = 0; i < count; i++) s[i] = (short) Math.round(Math.sin(i * 0.3) * amplitude * 32767);
    return s;
  }

  @Test public void silenceNeverStartsARecognizerSession() {
    WakeGate gate = new WakeGate();
    short[] hiss = tone(0.0015, 320); // about -60 dBFS: a quiet room
    for (int i = 0; i < 50 * 60 * 5; i++) { // five minutes of 20 ms frames
      assertFalse("a quiet room must never wake the recognizer", gate.frame(WakeGate.levelDb(hiss, hiss.length)));
    }
  }

  @Test public void speechOverTheRoomStartsOneSession() {
    WakeGate gate = new WakeGate();
    short[] room = tone(0.002, 320);
    short[] voice = tone(0.2, 320); // about -17 dBFS
    for (int i = 0; i < 200; i++) gate.frame(WakeGate.levelDb(room, room.length));
    int onsets = 0;
    for (int i = 0; i < 6; i++) if (gate.frame(WakeGate.levelDb(voice, voice.length))) onsets++;
    assertEquals("five loud frames out of eight are speech", 1, onsets);
  }

  @Test public void aSteadyNoiseBecomesTheFloor() {
    WakeGate gate = new WakeGate();
    short[] fan = tone(0.02, 320); // a fan: loud but steady, about -37 dBFS
    int onsets = 0;
    for (int i = 0; i < 50 * 30; i++) if (gate.frame(WakeGate.levelDb(fan, fan.length))) onsets++;
    // It may trigger once while the floor learns the room, never again after.
    assertTrue("a steady fan doesn't keep waking the recognizer, got " + onsets, onsets <= 2);
  }

  @Test public void sessionsAreSpacedAndBudgeted() {
    WakeGate gate = new WakeGate();
    long now = 100_000;
    assertTrue(gate.mayHear(now));
    gate.began(now);
    gate.ended(now + 1000);
    assertFalse("never straight after the last session", gate.mayHear(now + 2000));
    assertTrue(gate.mayHear(now + 1000 + WakeGate.MIN_GAP_MS));
    int started = 1;
    boolean spent = false;
    long t = now + 10_000;
    while (!spent && started < 100) {
      assertTrue(gate.mayHear(t));
      spent = gate.began(t);
      gate.ended(t + 500);
      started++;
      t += WakeGate.MIN_GAP_MS + 600;
    }
    assertEquals("the budget is " + WakeGate.BUDGET + " sessions per window", WakeGate.BUDGET, started);
    long until = gate.rest(t);
    assertFalse("resting after the budget", gate.mayHear(t + 1000));
    assertTrue("listening again after the rest", gate.mayHear(until + 1));
  }

  @Test public void failuresBackOffAndThenStop() {
    WakeGate gate = new WakeGate();
    assertEquals(0, gate.after(WakeGate.Failure.SILENCE));
    long last = 0;
    for (int i = 1; i < WakeGate.GIVE_UP_AFTER; i++) {
      long delay = gate.after(WakeGate.Failure.BUSY);
      assertTrue("each retry waits longer: " + delay, delay > last);
      assertTrue(delay <= WakeGate.MAX_BACKOFF_MS);
      last = delay;
    }
    assertEquals("then it stops instead of looping", -1, gate.after(WakeGate.Failure.BUSY));
    gate.reset();
    assertEquals(1000, gate.after(WakeGate.Failure.NETWORK));
    gate.worked();
    assertEquals("a working session starts the count over", 1000, gate.after(WakeGate.Failure.NETWORK));
  }

  @Test public void aMissingPermissionStopsAtOnce() {
    WakeGate gate = new WakeGate();
    assertEquals(-1, gate.after(WakeGate.Failure.PERMISSION));
    assertEquals(-1, new WakeGate().after(WakeGate.Failure.UNAVAILABLE));
  }

  @Test public void androidErrorsAreSortedHonestly() {
    assertEquals(WakeGate.Failure.SILENCE, WakeGate.classify(6));
    assertEquals(WakeGate.Failure.SILENCE, WakeGate.classify(7));
    assertEquals(WakeGate.Failure.BUSY, WakeGate.classify(8));
    assertEquals(WakeGate.Failure.NETWORK, WakeGate.classify(2));
    assertEquals(WakeGate.Failure.PERMISSION, WakeGate.classify(9));
    assertEquals(WakeGate.Failure.CLIENT, WakeGate.classify(5));
    assertEquals(WakeGate.Failure.CLIENT, WakeGate.classify(99));
  }

  @Test public void transitionsAreControlled() {
    assertTrue(WakeGate.canMove(WakeGate.State.OFF, WakeGate.State.STARTING));
    assertTrue(WakeGate.canMove(WakeGate.State.STARTING, WakeGate.State.ARMED));
    assertTrue(WakeGate.canMove(WakeGate.State.ARMED, WakeGate.State.HEARING));
    assertTrue(WakeGate.canMove(WakeGate.State.HEARING, WakeGate.State.DETECTED));
    assertTrue(WakeGate.canMove(WakeGate.State.DETECTED, WakeGate.State.ARMED));
    assertTrue(WakeGate.canMove(WakeGate.State.ARMED, WakeGate.State.PAUSED));
    assertTrue(WakeGate.canMove(WakeGate.State.ERROR, WakeGate.State.STARTING));
    assertFalse("never hear from a paused listener", WakeGate.canMove(WakeGate.State.PAUSED, WakeGate.State.HEARING));
    assertFalse("a wake only comes from hearing", WakeGate.canMove(WakeGate.State.ARMED, WakeGate.State.DETECTED));
    assertFalse("nothing listens once off", WakeGate.canMove(WakeGate.State.OFF, WakeGate.State.ARMED));
    assertFalse("off only after stopping", WakeGate.canMove(WakeGate.State.ARMED, WakeGate.State.OFF));
    assertFalse("a second start is not a transition", WakeGate.canMove(WakeGate.State.ARMED, WakeGate.State.ARMED));
  }

  @Test public void theWakePhrase() {
    assertTrue(WakeGate.isWake("Hey Nova", false));
    assertTrue(WakeGate.isWake("okay izuki what's the time", false));
    assertTrue(WakeGate.isWake("hey nova", true));
    assertFalse(WakeGate.isWake("supernova is bright", false));
    assertFalse(WakeGate.isWake("nova what's the time", false));
    assertTrue("the start can be cut off when the recognizer opened the mic itself", WakeGate.isWake("nova what's the time", true));
    assertFalse(WakeGate.isWake("I watched a nova documentary", true));
    assertFalse(WakeGate.isWake("", true));
    assertFalse(WakeGate.isWake(null, true));
  }

  @Test public void theirOwnPhrase() {
    assertEquals("hey jarvis", WakeGate.cleanPhrase("  Hey, Jarvis! "));
    assertEquals("too short to be safe", "", WakeGate.cleanPhrase("jarvis"));
    assertEquals("", WakeGate.cleanPhrase("one two three four five"));
    assertEquals("", WakeGate.cleanPhrase(null));
    assertTrue(WakeGate.isWake("hey jarvis what's the time", false, "hey jarvis"));
    assertTrue("Hey Nova keeps working", WakeGate.isWake("hey nova", false, "hey jarvis"));
    assertFalse(WakeGate.isWake("jarvis what's the time", false, "hey jarvis"));
    assertTrue("a clipped start may lose the first word", WakeGate.isWake("jarvis what's the time", true, "hey jarvis"));
    assertFalse("only as whole words", WakeGate.isWake("they jarvised it", false, "hey jarvis"));
    assertFalse("an unusable phrase never wakes", WakeGate.isWake("computer", false, "computer"));
  }

  @Test public void spellingsSpeechServicesUse() {
    assertTrue(WakeGate.isWake("HeyNova", false));
    assertTrue(WakeGate.isWake("Hey, Nova! What's the weather", false));
    assertTrue("a quick “Hey Nova” at the start is often written Hanover", WakeGate.isWake("Hanover what's the weather", false));
    assertFalse("Hanover in a sentence is a place", WakeGate.isWake("I moved to Hanover last year", false));
    assertFalse(WakeGate.isWake("they nova", false));
  }

  @Test public void theCommandAfterThePhrase() {
    assertEquals("what's the time?", WakeGate.command("Hey Nova, what's the time?", false, ""));
    assertEquals("", WakeGate.command("hey nova", false, ""));
    assertEquals("turn on the flashlight", WakeGate.command("HeyNova turn on the flashlight", false, ""));
    assertEquals("play some music", WakeGate.command("Hanover, play some music", false, ""));
    assertEquals("open YouTube", WakeGate.command("Hey Jarvis open YouTube", false, "hey jarvis"));
    assertEquals("what's the time", WakeGate.command("nova what's the time", true, ""));
    assertEquals("not clipped: no phrase, no command", "", WakeGate.command("nova what's the time", false, ""));
    assertEquals("", WakeGate.command(null, true, ""));
  }

  @Test public void levels() {
    assertEquals(-96, WakeGate.levelDb(new short[320], 320), 0.001);
    double loud = WakeGate.levelDb(tone(0.5, 320), 320);
    assertTrue("a half-scale tone is about -9 dBFS: " + loud, loud > -12 && loud < -6);
  }
}
