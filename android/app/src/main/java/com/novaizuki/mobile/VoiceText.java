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

  /** What the orb says when listening ended without words. */
  static String sayError(String word) {
    switch (word == null ? "" : word) {
      case "silence": return "I didn't catch that.";
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
