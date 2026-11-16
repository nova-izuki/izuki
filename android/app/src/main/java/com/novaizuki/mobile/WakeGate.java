package com.novaizuki.mobile;

import java.util.ArrayDeque;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * The rules of the "Hey Nova" listener, kept free of Android classes so the
 * JVM tests can drive them (android/app/src/test/.../WakeGateTest.java).
 *
 * The old listener restarted Android's speech recognizer after every result
 * and every error, 250–1200 ms later, for ever. Each session plays the
 * recognizer's start sound and moves a Bluetooth headset into call mode: the
 * "connecting / disconnecting" sound the owner heard on a Samsung phone. Now
 * the microphone is read quietly here, and a recognizer session only starts
 * when someone actually speaks, within a budget, with backoff after errors
 * and a stop after repeated failures instead of a loop.
 */
final class WakeGate {

  /** Every state the listener can be in. Only {@link #canMove} transitions happen. */
  enum State { OFF, STARTING, ARMED, HEARING, DETECTED, PAUSED, QUIET, ERROR, STOPPING }

  /** What went wrong in a recognizer session, as far as Android says. */
  enum Failure { SILENCE, BUSY, AUDIO, NETWORK, SERVER, CLIENT, PERMISSION, UNAVAILABLE }

  static boolean canMove(State from, State to) {
    if (from == to) return false;
    boolean live = from != State.OFF && from != State.STOPPING;
    switch (to) {
      case OFF: return from == State.STOPPING;
      case STOPPING: return from != State.OFF;
      case STARTING: return from == State.OFF || from == State.ERROR;
      // Speech is only heard from ARMED, and a wake only comes from hearing.
      case HEARING: return from == State.ARMED;
      case DETECTED: return from == State.HEARING;
      default: return live; // ARMED, PAUSED, QUIET, ERROR
    }
  }

  // ---- voice activity ----------------------------------------------------

  /** Loud enough over the room, for long enough, to be someone talking. */
  static final double OVER_FLOOR_DB = 10;
  static final double ABSOLUTE_MIN_DB = -52;
  static final int WINDOW = 8;      // frames of 20 ms
  static final int NEEDED = 5;      // loud frames within the window

  /** Quiet frames (300 ms) that end one stretch of speech, so it starts one session, not many. */
  static final int RELEASE = 15;

  private double floorDb = -60;
  private final boolean[] window = new boolean[WINDOW];
  private int windowAt = 0;
  private int loudInWindow = 0;
  private boolean inSpeech = false;
  private int quietRun = 0;

  /** RMS level of 16-bit PCM in dBFS (-96 for silence). */
  static double levelDb(short[] samples, int count) {
    if (samples == null || count <= 0) return -96;
    double sum = 0;
    for (int i = 0; i < count; i++) {
      double v = samples[i] / 32768.0;
      sum += v * v;
    }
    double rms = Math.sqrt(sum / count);
    return rms <= 0.0000158 ? -96 : 20 * Math.log10(rms);
  }

  double floorDb() { return floorDb; }

  /** One 20 ms frame. True when speech just started (the caller still asks {@link #mayHear}). */
  boolean frame(double db) {
    boolean loud = db > Math.max(floorDb + OVER_FLOOR_DB, ABSOLUTE_MIN_DB);
    if (window[windowAt]) loudInWindow--;
    window[windowAt] = loud;
    if (loud) loudInWindow++;
    windowAt = (windowAt + 1) % WINDOW;
    // The room's level: quiet frames pull it quickly down or slowly up, and
    // loud ones creep it up (a 5 s time constant), so a fan or a running
    // TV becomes "the room" instead of waking the recognizer again and again.
    floorDb += (db - floorDb) * (loud ? 0.004 : db < floorDb ? 0.3 : 0.02);
    floorDb = Math.max(-75, Math.min(-30, floorDb));
    quietRun = loud ? 0 : quietRun + 1;
    if (inSpeech) {
      if (quietRun >= RELEASE) inSpeech = false;
      return false;
    }
    if (loudInWindow >= NEEDED) {
      clearWindow();
      inSpeech = true;
      return true;
    }
    return false;
  }

  private void clearWindow() {
    for (int i = 0; i < WINDOW; i++) window[i] = false;
    loudInWindow = 0;
  }

  // ---- how often a recognizer session may start ---------------------------

  static final long MIN_GAP_MS = 4_000;
  static final int BUDGET = 20;
  static final long BUDGET_WINDOW_MS = 10 * 60_000;
  static final long QUIET_MS = 2 * 60_000;

  private final ArrayDeque<Long> sessions = new ArrayDeque<>();
  private long lastSessionEnd = -MIN_GAP_MS;
  private long quietUntil = 0;

  /** True when a session may start now; false while resting or over budget. */
  boolean mayHear(long now) {
    if (now < quietUntil) return false;
    if (now - lastSessionEnd < MIN_GAP_MS) return false;
    while (!sessions.isEmpty() && now - sessions.peekFirst() > BUDGET_WINDOW_MS) sessions.pollFirst();
    return sessions.size() < BUDGET;
  }

  /** A session is starting. Returns true when this one used up the budget (go QUIET after it). */
  boolean began(long now) {
    sessions.addLast(now);
    return sessions.size() >= BUDGET;
  }

  /** A session ended (heard nothing, heard something else, or failed). */
  void ended(long now) { lastSessionEnd = now; }

  /** Rest for a while: lots of talking nearby that wasn't "Hey Nova". The budget starts over after it. */
  long rest(long now) {
    quietUntil = now + QUIET_MS;
    sessions.clear();
    return quietUntil;
  }

  long quietUntil() { return quietUntil; }

  // ---- failures --------------------------------------------------------------

  static final int GIVE_UP_AFTER = 6;
  static final long MAX_BACKOFF_MS = 60_000;

  private int failures = 0;

  /**
   * How long to wait before listening again after `failure`, or -1 to stop
   * (the listener goes to ERROR and says why; it never loops).
   */
  long after(Failure failure) {
    switch (failure) {
      case SILENCE:
        failures = 0;
        return 0;
      case PERMISSION:
      case UNAVAILABLE:
        failures = GIVE_UP_AFTER;
        return -1;
      default:
        failures++;
        if (failures >= GIVE_UP_AFTER) return -1;
        return Math.min(MAX_BACKOFF_MS, 1000L << (failures - 1));
    }
  }

  /** A session worked (it heard words): failures start over. */
  void worked() { failures = 0; }

  int failures() { return failures; }

  /** Start from scratch (a "try again" tap). */
  void reset() {
    failures = 0;
    quietUntil = 0;
    sessions.clear();
    lastSessionEnd = -MIN_GAP_MS;
    clearWindow();
    inSpeech = false;
    quietRun = 0;
  }

  /** Android's SpeechRecognizer error codes, sorted into what they mean here. */
  static Failure classify(int error) {
    switch (error) {
      case 6:  // ERROR_SPEECH_TIMEOUT
      case 7:  // ERROR_NO_MATCH
        return Failure.SILENCE;
      case 8:  // ERROR_RECOGNIZER_BUSY
      case 10: // ERROR_TOO_MANY_REQUESTS
        return Failure.BUSY;
      case 3:  // ERROR_AUDIO
        return Failure.AUDIO;
      case 1:  // ERROR_NETWORK_TIMEOUT
      case 2:  // ERROR_NETWORK
        return Failure.NETWORK;
      case 4:  // ERROR_SERVER
      case 11: // ERROR_SERVER_DISCONNECTED
        return Failure.SERVER;
      case 9:  // ERROR_INSUFFICIENT_PERMISSIONS
        return Failure.PERMISSION;
      case 12: // ERROR_LANGUAGE_NOT_SUPPORTED
      case 13: // ERROR_LANGUAGE_UNAVAILABLE
      case 14: // ERROR_CANNOT_CHECK_SUPPORT
        return Failure.UNAVAILABLE;
      default: // ERROR_CLIENT (5) and anything newer
        return Failure.CLIENT;
    }
  }

  /** Plain words for the notification and the diagnostics screen. */
  static String say(Failure failure) {
    switch (failure) {
      case BUSY: return "Android's speech service was busy.";
      case AUDIO: return "The microphone stopped giving sound.";
      case NETWORK: return "Android's speech service couldn't reach the internet.";
      case SERVER: return "Android's speech service stopped answering.";
      case PERMISSION: return "The microphone permission is off for Izuki.";
      case UNAVAILABLE: return "Android's speech service doesn't support this language here.";
      case CLIENT: return "Android's speech service refused to start.";
      default: return "";
    }
  }

  // ---- audio for voice match ----------------------------------------------

  /** 16-bit mono PCM → a WAV file's bytes. */
  static byte[] wav(short[] pcm, int rate) {
    int data = pcm.length * 2;
    java.nio.ByteBuffer b = java.nio.ByteBuffer.allocate(44 + data).order(java.nio.ByteOrder.LITTLE_ENDIAN);
    b.put(new byte[] { 'R', 'I', 'F', 'F' }).putInt(36 + data).put(new byte[] { 'W', 'A', 'V', 'E' });
    b.put(new byte[] { 'f', 'm', 't', ' ' }).putInt(16).putShort((short) 1).putShort((short) 1)
        .putInt(rate).putInt(rate * 2).putShort((short) 2).putShort((short) 16);
    b.put(new byte[] { 'd', 'a', 't', 'a' }).putInt(data);
    for (short v : pcm) b.putShort(v);
    return b.array();
  }

  // ---- the phrase --------------------------------------------------------

  // Speech services write "Hey Nova" in several ways: "hey nova", "heynova",
  // "hey, Nova", and "Hanover" for a quick "Hey Nova" at the very start.
  private static final Pattern WAKE = Pattern.compile("\\b(?:hey|hi|ok|okay|hay|hei)\\s*(?:nova|novah|izuki)\\b|^(?:hannover|hanover)\\b");
  // The start of the phrase can be cut off when the recognizer had to open
  // the microphone itself after speech began: "nova, what's the time".
  private static final Pattern CLIPPED = Pattern.compile("^\\W*(?:a\\s+|ey\\s+)?(?:nova|izuki)\\b");
  /** The same phrases on the raw words, case-insensitive, to find where the command starts. */
  private static final Pattern WAKE_AT = Pattern.compile(
      "(?i)(?:\\b(?:hey|hi|ok|okay|hay|hei)[\\s,]*(?:nova|novah|izuki)\\b|^\\W*(?:hannover|hanover)\\b)[\\s,.!?:;-]*");
  private static final Pattern CLIPPED_AT = Pattern.compile("(?i)^\\W*(?:a\\s+|ey\\s+)?(?:nova|izuki)\\b[\\s,.!?:;-]*");

  /**
   * What came after the wake phrase in the same breath ("Hey Nova, what's
   * the time?" → "what's the time?"), or "" when they only said the phrase.
   */
  static String command(String heard, boolean clipped, String custom) {
    if (heard == null) return "";
    java.util.regex.Matcher m = WAKE_AT.matcher(heard);
    int end = -1;
    if (m.find()) end = m.end();
    else {
      String phrase = cleanPhrase(custom);
      if (!phrase.isEmpty()) {
        Pattern own = Pattern.compile("(?i)\\b" + phrase.replace("'", "'?").replace(" ", "[\\s,]+") + "\\b[\\s,.!?:;-]*");
        java.util.regex.Matcher o = own.matcher(heard);
        if (o.find()) end = o.end();
      }
      if (end < 0 && clipped) {
        java.util.regex.Matcher c = CLIPPED_AT.matcher(heard);
        if (c.find()) end = c.end();
      }
    }
    return end < 0 ? "" : heard.substring(end).trim();
  }

  /** Did they say the wake phrase? `clipped` when the first moment may be missing. */
  static boolean isWake(String heard, boolean clipped) {
    return isWake(heard, clipped, "");
  }

  /**
   * The same, with the person's own phrase as well ("hey jarvis"). "Hey Nova"
   * and "Hey Izuki" always work too. A clipped start may have lost the
   * phrase's first word, so then the rest at the very start counts.
   */
  static boolean isWake(String heard, boolean clipped, String custom) {
    if (heard == null) return false;
    String t = heard.toLowerCase(Locale.ROOT).replaceAll("[^\\p{L}\\p{N}' ]", " ").replaceAll("\\s+", " ").trim();
    if (t.isEmpty()) return false;
    if (WAKE.matcher(t).find() || (clipped && CLIPPED.matcher(t).find())) return true;
    String phrase = cleanPhrase(custom);
    if (phrase.isEmpty()) return false;
    if ((" " + t + " ").contains(" " + phrase + " ")) return true;
    int space = phrase.indexOf(' ');
    return clipped && space > 0 && (t + " ").startsWith(phrase.substring(space + 1) + " ");
  }

  /**
   * A phrase the person may choose: 2–4 words, letters only, up to 32
   * characters. "" when it isn't usable (too short to be safe, or odd).
   */
  static String cleanPhrase(String raw) {
    if (raw == null) return "";
    String p = raw.toLowerCase(Locale.ROOT).replaceAll("[^\\p{L}' ]", " ").replaceAll("\\s+", " ").trim();
    int words = p.isEmpty() ? 0 : p.split(" ").length;
    return words >= 2 && words <= 4 && p.length() <= 32 ? p : "";
  }
}
