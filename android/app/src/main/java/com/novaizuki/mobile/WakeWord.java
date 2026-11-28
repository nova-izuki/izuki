package com.novaizuki.mobile;

/**
 * Izuki's own "Hey Nova", without Android's speech service.
 *
 * The listener used to ask Android's recogniser whether the phrase was said,
 * and that recogniser opens the real microphone and plays its own start and
 * stop sound every single time — and this phone refuses to be fed Izuki's
 * audio instead ({@code ERROR_CLIENT}), so there was no way to keep it quiet.
 * The way out is to decide locally, on the microphone stream the listener
 * already has open, and only reach for the recogniser once the phrase is there.
 *
 * This is the half of that decision that can be checked without a phone: what
 * a piece of audio looks like as numbers, and how to compare it with words the
 * person recorded. Recording the phrase, storing it, and calling this from the
 * listener are the next steps; nothing in the running app uses it yet.
 *
 * Shape of the audio: 16 kHz mono 16-bit, 20 ms frames (320 samples), the same
 * frames the gate already reads. Each frame becomes eight log energies, one per
 * band, with the frame's own mean removed — so how loud the room is drops out
 * and the shape of the sound is what remains. Two utterances are compared with
 * dynamic time warping, which forgives talking faster or slower; the result is
 * a distance per aligned frame, small when they sound the same.
 */
final class WakeWord {

  static final int RATE = 16_000;
  static final int FRAME = 320; // 20 ms
  static final int BANDS = 8;

  /** Band centres, roughly log-spaced across a voice and well inside 8 kHz. */
  private static final double[] CENTRES = { 250, 400, 600, 850, 1200, 1700, 2300, 3100 };

  private WakeWord() { }

  /**
   * One 20 ms frame as eight log energies, less that frame's mean, with each
   * band divided by the frame's total first. Dividing by the total is what makes
   * the feature the *shape* of the sound rather than how loud it is: a phrase
   * whispered from across the room and shouted into the phone come out the same,
   * which is what a wake word needs. A plain log-energy with the mean taken off
   * (the first try) leaked level badly — bands that only hear leakage sat on the
   * logarithm's floor, so only some of the eight shifted with volume.
   */
  static double[] frameFeatures(short[] pcm, int off) {
    double[] mags = new double[BANDS];
    double total = 0;
    for (int b = 0; b < BANDS; b++) {
      mags[b] = band(pcm, off, FRAME, CENTRES[b]);
      total += mags[b];
    }
    if (total <= 0) total = 1;
    double[] out = new double[BANDS];
    double mean = 0;
    for (int b = 0; b < BANDS; b++) {
      // A band below a thousandth of the frame's energy carries no shape, only
      // numeric dust, and dust does not scale with the voice: every such band
      // lands on the same value instead of jittering with loudness.
      out[b] = Math.log(1e-2 + mags[b] / total);
      mean += out[b];
    }
    mean /= BANDS;
    for (int b = 0; b < BANDS; b++) out[b] -= mean;
    return out;
  }

  /** Every whole 20 ms frame of `len` samples. */
  static double[][] features(short[] pcm, int len) {
    if (pcm == null || len < FRAME) return new double[0][];
    int frames = len / FRAME;
    double[][] out = new double[frames][];
    for (int f = 0; f < frames; f++) out[f] = frameFeatures(pcm, f * FRAME);
    return out;
  }

  static double[][] features(short[] pcm) {
    return features(pcm, pcm == null ? 0 : pcm.length);
  }

  /**
   * Distance between two utterances, per aligned frame: 0 for identical audio,
   * larger as they differ. {@link Double#MAX_VALUE} when either is empty or too
   * different in length to align.
   */
  static double distance(double[][] a, double[][] b) {
    if (a == null || b == null || a.length == 0 || b.length == 0) return Double.MAX_VALUE;
    int n = a.length, m = b.length;
    int band = Math.max(8, Math.abs(n - m) + 6);
    if (Math.abs(n - m) > band) return Double.MAX_VALUE;
    double[][] d = new double[n + 1][m + 1];
    for (double[] row : d) java.util.Arrays.fill(row, Double.MAX_VALUE);
    d[0][0] = 0;
    for (int i = 1; i <= n; i++) {
      int from = Math.max(1, i - band), to = Math.min(m, i + band);
      for (int j = from; j <= to; j++) {
        double best = Math.min(d[i - 1][j], Math.min(d[i][j - 1], d[i - 1][j - 1]));
        if (best == Double.MAX_VALUE) continue;
        d[i][j] = best + apart(a[i - 1], b[j - 1]);
      }
    }
    double total = d[n][m];
    return total == Double.MAX_VALUE ? total : total / (n + m);
  }

  /** Does this audio sound like the recorded phrase, within `max`? */
  static boolean matches(double[][] heard, double[][] template, double max) {
    return distance(heard, template) <= max;
  }

  /** Euclid across the eight bands. */
  private static double apart(double[] a, double[] b) {
    double sum = 0;
    for (int i = 0; i < BANDS; i++) {
      double d = a[i] - b[i];
      sum += d * d;
    }
    return Math.sqrt(sum);
  }

  /**
   * Magnitude at one frequency over one windowed frame: a plain correlation with
   * a cosine and a sine, which is exactly linear in the samples. The Goertzel
   * recursion used first was cheaper but its result drifted at low levels (it
   * lost the quiet bands to rounding), and a wake word has to sound the same
   * whispered across the room as spoken into the phone.
   */
  private static double band(short[] pcm, int off, int n, double freq) {
    double re = 0, im = 0;
    for (int i = 0; i < n; i++) {
      // Hann: a hard edge would smear one loud tone across every band.
      double win = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (n - 1));
      double v = (pcm[off + i] / 32768.0) * win;
      double ph = 2 * Math.PI * freq * i / RATE;
      re += v * Math.cos(ph);
      im += v * Math.sin(ph);
    }
    return Math.sqrt(re * re + im * im) / n;
  }
}
