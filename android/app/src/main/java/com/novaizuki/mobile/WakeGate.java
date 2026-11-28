package com.novaizuki.mobile;

import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
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
  /** Frames since the current stretch of sound started a session. */
  private int speechRun = 0;
  /**
   * A long stretch of sound (a TV, people talking) gets a fresh look this
   * often. Before, one onset waited for 300 ms of quiet, so "Hey Nova" said
   * over continuing sound was never checked: "sometimes it doesn't come up".
   */
  static final int AGAIN_AFTER = 125; // 2.5 s

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
      if (quietRun >= RELEASE) { inSpeech = false; return false; }
      if (++speechRun >= AGAIN_AFTER && loud) { speechRun = 0; return true; }
      return false;
    }
    if (loudInWindow >= NEEDED) {
      clearWindow();
      inSpeech = true;
      speechRun = 0;
      return true;
    }
    return false;
  }

  private void clearWindow() {
    for (int i = 0; i < WINDOW; i++) window[i] = false;
    loudInWindow = 0;
  }

  // ---- how often a recognizer session may start ---------------------------

  // A short gap after a session (4 s missed a "Hey Nova" said right after
  // other talk), a bigger budget, and a shorter rest when it runs out.
  static final long MIN_GAP_MS = 1_500;
  static final int BUDGET = 30;
  static final long BUDGET_WINDOW_MS = 10 * 60_000;
  static final long QUIET_MS = 60_000;

  private final ArrayDeque<Long> sessions = new ArrayDeque<>();
  private long lastSessionEnd = -MIN_GAP_MS;
  private long quietUntil = 0;

  /** True when a session may start now; false while resting or over budget. */
  boolean mayHear(long now) {
    return whyNot(now).isEmpty();
  }

  /** Why someone speaking now wouldn't be checked ("" = it would), for the diagnostics. */
  String whyNot(long now) {
    if (now < quietUntil) return "resting after lots of talk nearby";
    if (now - lastSessionEnd < MIN_GAP_MS) return "just checked something else";
    while (!sessions.isEmpty() && now - sessions.peekFirst() > BUDGET_WINDOW_MS) sessions.pollFirst();
    return sessions.size() < BUDGET ? "" : "used up its checks for now";
  }

  /**
   * Words that sound close to the wake phrase without being it: a greeting
   * ("hey …") or something like "nova". Only whether, never the words, goes
   * into the diagnostics.
   */
  static boolean nearMiss(String heard) {
    if (heard == null) return false;
    String t = heard.toLowerCase(Locale.ROOT);
    return t.matches("(?s).*\\b(?:hey|hi|ok|okay|hay)\\b.*") || t.matches("(?s).*\\b(?:no+v|noa)\\w*.*");
  }

  /** A session is starting. Returns true when this one used up the budget (go QUIET after it). */
  boolean began(long now) {
    sessions.addLast(now);
    return sessions.size() >= BUDGET;
  }

  /** "Hey Nova" was heard: those checks were wanted, so the budget starts over (no rest). */
  void woke() { sessions.clear(); }

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
  // Also the ways speech services write a quick "Nova": "nover", "novar", "noba", "nowa".
  private static final Pattern WAKE = Pattern.compile("\\b(?:hey|hi|ok|okay|hay|hei)\\s*(?:nova|novah|nover|novar|noba|nowa|izuki)\\b|^(?:hannover|hanover)\\b");
  // The start of the phrase can be cut off when the recognizer had to open
  // the microphone itself after speech began: "nova, what's the time".
  private static final Pattern CLIPPED = Pattern.compile("^\\W*(?:a\\s+|ey\\s+)?(?:nova|izuki)\\b");
  /** Word edges as isWake sees them: letters and digits are words; "_", apostrophes and punctuation aren't. */
  private static final String NOT_WORD_BEFORE = "(?<![\\p{L}\\p{N}])";
  private static final String NOT_WORD_AFTER = "(?![\\p{L}\\p{N}])";
  /** The same phrases on the raw words, case-insensitive, to find where the command starts. */
  private static final Pattern WAKE_AT = Pattern.compile(
      "(?iu)(?:" + NOT_WORD_BEFORE + "(?:hey|hi|ok|okay|hay|hei)[^\\p{L}\\p{N}']*(?:nova|novah|nover|novar|noba|nowa|izuki)" + NOT_WORD_AFTER
      + "|^[^\\p{L}\\p{N}]*(?:hannover|hanover)" + NOT_WORD_AFTER + ")[^\\p{L}\\p{N}]*");
  // The separators and edges above are isWake's: it turns everything but
  // letters, digits and the apostrophe into spaces (so "_" is a space too),
  // and both must accept and refuse the same phrases.
  private static final Pattern CLIPPED_AT = Pattern.compile(
      "(?iu)^[^\\p{L}\\p{N}]*(?:(?:a|ey)[^\\p{L}\\p{N}']+)?(?:nova|izuki)" + NOT_WORD_AFTER + "[^\\p{L}\\p{N}]*");

  /**
   * What came after the wake phrase in the same breath ("Hey Nova, what's
   * the time?" → "what's the time?"), or "" when they only said the phrase.
   */
  static String command(String heard, boolean clipped, String custom) {
    if (heard == null) return "";
    String phrase = cleanPhrase(custom);
    // "Hey Nova", their own phrase (any punctuation between its words), or
    // a clipped start that lost its first word, as isWake accepts: the one
    // said first is the one that woke Izuki.
    java.util.List<int[]> found = new java.util.ArrayList<>();
    found.add(span(WAKE_AT, heard));
    if (!phrase.isEmpty()) found.add(span(phrasePattern(phrase, false), heard));
    if (clipped) {
      found.add(span(CLIPPED_AT, heard));
      if (phrase.indexOf(' ') > 0) found.add(span(phrasePattern(phrase.substring(phrase.indexOf(' ') + 1), true), heard));
    }
    int[] first = null;
    for (int[] s : found) if (s != null && (first == null || s[0] < first[0])) first = s;
    return first == null ? "" : heard.substring(first[1]).trim();
  }

  /** Where a pattern first matches: {start, end}, or null. */
  private static int[] span(Pattern p, String text) {
    java.util.regex.Matcher m = p.matcher(text);
    return m.find() ? new int[] { m.start(), m.end() } : null;
  }



  /** A cleaned phrase as a pattern: any spaces or punctuation between its words, optionally only at the start. */
  private static Pattern phrasePattern(String phrase, boolean atStart) {
    StringBuilder b = new StringBuilder("(?iu)").append(atStart ? "^[^\\p{L}\\p{N}]*" : NOT_WORD_BEFORE);
    String[] words = phrase.split(" ");
    for (int i = 0; i < words.length; i++) {
      if (i > 0) b.append("[^\\p{L}\\p{N}']+");
      b.append(Pattern.quote(words[i]));
    }
    return Pattern.compile(b.append(NOT_WORD_AFTER).append("[^\\p{L}\\p{N}]*").toString());
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
   * Words too common to be a wake phrase. "So now" or "hey there" as a phrase
   * would make half of everything said a call, so a phrase made only of these
   * is refused, exactly as the headset refuses an ordinary name.
   */
  private static final Set<String> ORDINARY = new HashSet<>(Arrays.asList(
      ("a an the and or but so if then than now okay ok hey hi hello yo yes yeah no not you your i me my we us they them "
          + "this that these those what when where who why how is are was were be been do does did done can could will would "
          + "should may might must just only also very really well good bad go come here there up down out over under again "
          + "more most some any all one two three please thanks thank").split(" ")));

  /** The phrase in the shape a wake phrase may take: 2–4 words, up to 32 letters. "" otherwise. */
  private static String shape(String raw) {
    if (raw == null) return "";
    String lowered = raw.toLowerCase(Locale.ROOT);
    StringBuilder b = new StringBuilder();
    for (int i = 0; i < lowered.length(); i++) {
      char c = lowered.charAt(i);
      b.append(Character.isLetter(c) || c == 39 || c == 32 ? c : ' ');
    }
    String p = b.toString().replaceAll("  +", " ").trim();
    int words = p.isEmpty() ? 0 : p.split(" ").length;
    return words >= 2 && words <= 4 && p.length() <= 32 ? p : "";
  }

  /**
   * A phrase the person may choose: 2–4 words, letters only, up to 32
   * characters, and not every-day words only. "" when it isn't usable (too
   * short to be safe, or ordinary), so a phrase that is all everyday words
   * never wakes Izuki.
   */
  static String cleanPhrase(String raw) {
    String p = shape(raw);
    if (p.isEmpty()) return "";
    for (String word : p.split(" ")) if (!ORDINARY.contains(word)) return p;
    return "";
  }

  /** Why a phrase can't wake Izuki, as the sentence to show — "" when it can. */
  static String phraseProblem(String raw) {
    if (raw == null || raw.trim().isEmpty()) return "";
    if (shape(raw).isEmpty()) return "Use 2 to 4 words, letters only — for example “hey jarvis”.";
    return cleanPhrase(raw).isEmpty()
        ? "Those are all everyday words, so Izuki would wake all the time. Pick a name — for example “hey jarvis”."
        : "";
  }
}
