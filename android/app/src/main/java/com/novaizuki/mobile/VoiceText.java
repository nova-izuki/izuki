package com.novaizuki.mobile;

import java.util.ArrayList;
import java.util.List;

/**
 * The text rules of Izuki's native voice and voice turn, free of Android
 * classes so the JVM tests can check them (VoiceTextTest).
 */
final class VoiceText {
  private VoiceText() { }

  /**
   * A reply cut into pieces Android's TextToSpeech accepts (it refuses input
   * over getMaxSpeechInputLength(), about 4000 characters), split at sentence
   * ends where possible so a piece never stops mid-word.
   */
  static List<String> pieces(String text, int max) {
    List<String> out = new ArrayList<>();
    if (text == null) return out;
    String rest = text.replaceAll("\\s+", " ").trim();
    int limit = Math.max(40, max);
    while (rest.length() > limit) {
      int cut = -1;
      for (int i = limit; i > limit / 2; i--) {
        char c = rest.charAt(i - 1);
        if ((c == '.' || c == '!' || c == '?' || c == '…') && (i == rest.length() || rest.charAt(i) == ' ')) { cut = i; break; }
      }
      if (cut < 0) cut = rest.lastIndexOf(' ', limit);
      if (cut <= 0) cut = limit;
      out.add(rest.substring(0, cut).trim());
      rest = rest.substring(cut).trim();
    }
    if (!rest.isEmpty()) out.add(rest);
    return out;
  }

  /** Words for the orb's caption: one line of speech, cut at a word with "…". */
  static String caption(String text, int max) {
    if (text == null) return "";
    String t = text.replaceAll("\\s+", " ").trim();
    if (t.length() <= max) return t;
    int cut = t.lastIndexOf(' ', Math.max(1, max - 1));
    if (cut < max / 2) cut = max - 1;
    return t.substring(0, cut).trim() + "…";
  }

  /**
   * How good an installed voice is for Izuki: -1 when it can't be used (another
   * language, not downloaded, or online-only while offline). Quality first
   * (Android's 100–500), then the person's country, then a voice that works
   * on the phone itself (no wait for the network). Legacy voices (quality
   * 300 and below) are what sounded robotic.
   */
  static int voiceScore(String voiceLang, String voiceCountry, int quality, boolean network, boolean installed,
                        String wantLang, String wantCountry, boolean online) {
    if (!installed || voiceLang == null || wantLang == null) return -1;
    if (!voiceLang.equalsIgnoreCase(wantLang)) return -1;
    if (network && !online) return -1;
    int score = Math.max(0, Math.min(500, quality));
    if (wantCountry != null && !wantCountry.isEmpty() && wantCountry.equalsIgnoreCase(voiceCountry)) score += 30;
    if (!network) score += 20;
    return score;
  }

  /**
   * How loud a WAV line is every `ms` milliseconds, 0..1 (its loudest moment
   * is 1): the orb and the edges follow the real voice while it plays.
   * 16-bit PCM, any rate and channel count; null if it isn't one.
   */
  static float[] loudness(byte[] wav, int ms) {
    if (wav == null || wav.length < 44 || ms <= 0) return null;
    if (wav[0] != 'R' || wav[1] != 'I' || wav[2] != 'F' || wav[3] != 'F') return null;
    int rate = 0, channels = 1, bits = 0, data = -1, size = 0;
    for (int at = 12; at + 8 <= wav.length; ) {
      String id = new String(wav, at, 4, java.nio.charset.StandardCharsets.US_ASCII);
      int len = le32(wav, at + 4);
      if (len < 0) return null;
      if ("fmt ".equals(id) && at + 24 <= wav.length) {
        channels = Math.max(1, le16(wav, at + 10));
        rate = le32(wav, at + 12);
        bits = le16(wav, at + 22);
      } else if ("data".equals(id)) {
        data = at + 8;
        size = Math.min(len, wav.length - data);
        break;
      }
      // A broken length can't wrap the offset round to the start.
      long next = (long) at + 8 + len + (len & 1);
      if (next > wav.length) break;
      at = (int) next;
    }
    if (data < 0 || bits != 16 || rate <= 0) return null;
    int frame = Math.max(1, rate * ms / 1000) * channels;
    int samples = size / 2;
    int n = (samples + frame - 1) / frame;
    if (n == 0) return null;
    float[] out = new float[n];
    float peak = 0;
    for (int i = 0; i < n; i++) {
      double sum = 0;
      int from = i * frame, to = Math.min(samples, from + frame);
      for (int s = from; s < to; s++) {
        short v = (short) ((wav[data + 2 * s] & 0xff) | (wav[data + 2 * s + 1] << 8));
        sum += (double) v * v;
      }
      out[i] = (float) Math.sqrt(sum / Math.max(1, to - from));
      peak = Math.max(peak, out[i]);
    }
    for (int i = 0; i < n; i++) out[i] = peak <= 0 ? 0f : (float) Math.pow(out[i] / peak, 0.7);
    return out;
  }

  private static int le16(byte[] b, int at) { return (b[at] & 0xff) | ((b[at + 1] & 0xff) << 8); }
  private static int le32(byte[] b, int at) { return le16(b, at) | (le16(b, at + 2) << 16); }

  /** A voice's name made readable for the picker ("en-us-x-tpf-local" → "English (US) · voice tpf"). */
  static String voiceLabel(String name, String language, String country, boolean network) {
    String n = name == null ? "" : name;
    java.util.regex.Matcher m = java.util.regex.Pattern.compile("-x-([a-z0-9]+)").matcher(n.toLowerCase(java.util.Locale.ROOT));
    String id = m.find() ? m.group(1) : n;
    String where = country == null || country.isEmpty() ? "" : " (" + country.toUpperCase(java.util.Locale.ROOT) + ")";
    return (language == null || language.isEmpty() ? "Voice" : language) + where + " · " + id + (network ? " · online" : "");
  }

  /** Android's SpeechRecognizer error codes as one word for the page and the orb. */
  static String errorWord(int error) {
    switch (error) {
      case 6: case 7: return "silence";
      case 9: return "permission";
      case 8: case 10: return "busy";
      case 3: return "audio";
      case 1: case 2: return "network";
      case 4: case 11: return "server";
      case 12: case 13: case 14: return "language";
      default: return "client";
    }
  }

  /**
   * Listen again after Android ended a session with nothing heard? Only
   * before anyone spoke (a real "no match" after speech is an answer), only
   * for the errors a fresh start can fix, with time left for someone to
   * talk, and a few times at most.
   */
  static boolean listenAgain(String errorWord, boolean spoke, long leftMs, int tries) {
    // One quiet try at most. Every try is a fresh recognizer and Android plays
    // its microphone sound on each start and stop, so three tries after a
    // greeting (with the page's own retry waiting behind them) was the chime
    // loop on a “Hey Nova” that got no answer. The session already runs 20 s,
    // so one extra try is what keeps the ear open while someone decides.
    if (spoke || tries >= 1 || leftMs < 6000) return false;
    return "silence".equals(errorWord) || "busy".equals(errorWord) || "client".equals(errorWord) || "server".equals(errorWord);
  }

  /**
   * Is this what the ear heard actually the greeting coming back through the
   * microphone? True when its words are a stretch of the greeting, the last one
   * allowed to be half-heard ("go ahe" for "go ahead") — so "Yes?" answering
   * the greeting "Yes?" is not taken for the person's command. A longer
   * sentence that merely contains the greeting is the person ("yes, open maps").
   */
  static boolean greetingEcho(String heard, String greeting) {
    String[] have = words(heard), said = words(greeting);
    if (have.length == 0 || said.length == 0 || have.length > said.length) return false;
    for (int start = 0; start + have.length <= said.length; start++) {
      boolean fits = true;
      for (int i = 0; i < have.length && fits; i++) {
        boolean last = i == have.length - 1;
        fits = last ? said[start + i].startsWith(have[i]) : said[start + i].equals(have[i]);
      }
      if (fits) return true;
    }
    return false;
  }

  /** Spoken words, lower case and letters only: "I'm here." → ["i", "m", "here"]. */
  static String[] words(String text) {
    if (text == null) return new String[0];
    String clean = text.toLowerCase(java.util.Locale.ROOT).replaceAll("[^a-z0-9]+", " ").trim();
    return clean.isEmpty() ? new String[0] : clean.split(" ");
  }

  /** What the orb says when listening ended without words. */
  static String sayError(String word) {
    switch (word == null ? "" : word) {
      case "silence": return "I didn't hear anything. Tap me and talk when you're ready.";
      case "unclear": return "I heard you but couldn't make out the words. Tap me and say it again.";
      case "permission": return "Izuki needs the microphone permission.";
      case "busy": return "The speech service is busy. Try again.";
      case "network": return "Speech recognition needs the internet right now.";
      case "language": return "Speech recognition doesn't support this language here.";
      case "audio": return "The microphone stopped giving sound.";
      default: return "I couldn't listen just then. Try again.";
    }
  }

  /** A greeting for "Hey Nova" on its own: short, like a person turning round. */
  static String greeting(long seed) {
    String[] lines = { "Yes?", "Mm-hm?", "I'm here.", "Yes?" };
    return lines[(int) Math.floorMod(seed, (long) lines.length)];
  }
}
