package com.novaizuki.mobile;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

/** The local half of Izuki's own wake word: does this audio sound like that audio? */
public class WakeWordTest {

  /** 16 kHz mono 16-bit, a tone for `ms` milliseconds. */
  private static short[] tone(double freq, int ms, double amplitude) {
    int n = RATE(ms);
    short[] s = new short[n];
    for (int i = 0; i < n; i++) s[i] = (short) Math.round(Math.sin(2 * Math.PI * freq * i / 16000.0) * amplitude * 32767);
    return s;
  }

  private static int RATE(int ms) { return 16 * ms; }

  private static short[] join(short[]... parts) {
    int n = 0;
    for (short[] p : parts) n += p.length;
    short[] out = new short[n];
    int at = 0;
    for (short[] p : parts) {
      System.arraycopy(p, 0, out, at, p.length);
      at += p.length;
    }
    return out;
  }

  /** Four syllables standing in for "hey no-va": rising, brief, falling, higher. */
  private static short[] phrase() {
    return join(tone(300, 120, 0.3), tone(700, 80, 0.3), tone(500, 160, 0.3), tone(1100, 120, 0.3));
  }

  /** The same samples stretched by `ratio`: the same words, said slower. */
  private static short[] slower(short[] in, double ratio) {
    int n = (int) Math.round(in.length * ratio);
    short[] out = new short[n];
    for (int i = 0; i < n; i++) out[i] = in[Math.min(in.length - 1, (int) (i / ratio))];
    return out;
  }

  private static String numbers(double same, double slow, double other, double noise) {
    return "same=" + same + " slow=" + slow + " other=" + other + " noise=" + noise;
  }

  @Test public void theSameWordsMatchThemselves() {
    double[][] p = WakeWord.features(phrase());
    assertTrue("the phrase has frames: " + p.length, p.length > 10);
    assertEquals(0, WakeWord.distance(p, p), 1e-9);
    assertTrue(WakeWord.matches(p, p, 0.5));
  }

  @Test public void sayingItSlowerIsStillTheSameWords() {
    short[] said = phrase();
    double[][] exact = WakeWord.features(said);
    double dSlow = WakeWord.distance(WakeWord.features(slower(said, 1.4)), exact);
    short[] other = join(tone(1100, 120, 0.3), tone(300, 120, 0.3), tone(700, 80, 0.3), tone(2400, 160, 0.3));
    double dOther = WakeWord.distance(WakeWord.features(other), exact);
    double dSame = WakeWord.distance(exact, exact);
    String all = numbers(dSame, dSlow, dOther, 0);
    assertTrue("a slower phrase is closer than different words: " + all, dSlow < dOther);
    assertTrue("and it is still close: " + all, WakeWord.matches(WakeWord.features(slower(said, 1.4)), exact, dSlow + 0.5));
    assertFalse("different words are not the phrase at that distance: " + all, WakeWord.matches(WakeWord.features(other), exact, dSlow));
  }

  @Test public void noiseIsNotThePhrase() {
    short[] said = phrase();
    double[][] exact = WakeWord.features(said);
    java.util.Random rnd = new java.util.Random(7);
    short[] hiss = new short[said.length];
    for (int i = 0; i < hiss.length; i++) hiss[i] = (short) rnd.nextInt(6000);
    double dSlow = WakeWord.distance(WakeWord.features(slower(said, 1.4)), exact);
    double dNoise = WakeWord.distance(WakeWord.features(hiss), exact);
    assertTrue("noise must be further than a slow phrase: " + numbers(0, dSlow, 0, dNoise), dNoise > dSlow);
    assertFalse(WakeWord.matches(WakeWord.features(hiss), exact, dSlow));
  }

  @Test public void loudIsTheSameAsQuiet() {
    // The feature is shape, not level: the same words, thrown a third as hard.
    // Scaling the samples after the fact would only measure 16-bit rounding
    // noise in the bands that barely hear the tone, so the quieter words are
    // generated quiet instead.
    short[] loud = phrase();
    short[] quiet = join(tone(300, 120, 0.1), tone(700, 80, 0.1), tone(500, 160, 0.1), tone(1100, 120, 0.1));
    double d = WakeWord.distance(WakeWord.features(quiet), WakeWord.features(loud));
    short[] other = join(tone(1100, 120, 0.3), tone(300, 120, 0.3), tone(700, 80, 0.3), tone(2400, 160, 0.3));
    double dOther = WakeWord.distance(WakeWord.features(other), WakeWord.features(loud));
    // Not zero: a pure tone puts almost all of its energy in one or two bands, so
    // the rest are leakage and near the rounding floor, and that ratio shifts
    // slightly with level. Speech spreads across the bands, so the same words at
    // a third of the volume stay far closer than different words do — which is
    // what a threshold has to rely on.
    assertTrue("quiet words are much closer than different words: " + d + " vs " + dOther, d < dOther / 2);
    assertTrue("and close in absolute terms, got " + d, d < 0.6);
  }

  @Test public void nothingToCompare() {
    double[][] none = WakeWord.features(new short[0]);
    assertEquals(0, none.length);
    assertEquals(Double.MAX_VALUE, WakeWord.distance(none, WakeWord.features(phrase())), 0);
    assertFalse(WakeWord.matches(none, null, 10));
  }
}
