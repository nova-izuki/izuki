package com.novaizuki.mobile;

import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * The decisions behind Android control and the Phone Readiness card, free of
 * Android classes so the JVM tests can check them
 * (android/app/src/test/.../ControlStateTest.java).
 */
final class ControlState {
  private ControlState() { }

  /**
   * Is Izuki in Android's colon-separated list of enabled accessibility
   * services? Entries are "package/full.Class" or the short
   * "package/.Class"; the old substring test missed the short form.
   */
  static boolean listed(String enabledServices, String pkg, String cls) {
    if (enabledServices == null || pkg == null || cls == null) return false;
    for (String raw : enabledServices.split(":")) {
      String entry = raw.trim();
      int slash = entry.indexOf('/');
      if (slash <= 0) continue;
      String p = entry.substring(0, slash);
      String c = entry.substring(slash + 1);
      if (c.startsWith(".")) c = p + c;
      if (p.equalsIgnoreCase(pkg) && c.equalsIgnoreCase(cls)) return true;
    }
    return false;
  }

  // AppOpsManager modes and PackageInstaller sources, as numbers so the
  // tests don't need Android.
  static final int OP_ALLOWED = 0, OP_IGNORED = 1, OP_ERRORED = 2, OP_DEFAULT = 3, OP_UNKNOWN = -1;
  static final int SOURCE_UNKNOWN = -1, SOURCE_STORE = 2, SOURCE_LOCAL_FILE = 3, SOURCE_DOWNLOADED_FILE = 4;

  /**
   * Android 13+ "restricted settings": an app installed from a file (not a
   * store) can't have Accessibility turned on until the person allows it in
   * App info. Samsung says "App was denied access".
   *
   * "restricted" only when Android itself says so (the app-op); "likely"
   * when all we know is that the app came from a file; "none" when it can't
   * apply; "unknown" when Android exposes neither.
   */
  static String restriction(int sdk, int opMode, int packageSource) {
    if (sdk < 33) return "none";
    if (opMode == OP_ERRORED || opMode == OP_IGNORED) return "restricted";
    if (opMode == OP_ALLOWED) return "allowed";
    if (packageSource == SOURCE_LOCAL_FILE || packageSource == SOURCE_DOWNLOADED_FILE) return "likely";
    if (packageSource == SOURCE_STORE) return "none";
    return "unknown";
  }

  /** One word for the Android control row. Connected is the only "ready". */
  static String control(boolean enabled, boolean connected, String restriction) {
    if (connected) return "ready";
    if (enabled) return "not-connected";
    if ("restricted".equals(restriction)) return "restricted";
    if ("likely".equals(restriction)) return "maybe-restricted";
    return "off";
  }

  // ---- finding a control by its label ------------------------------------------

  private static String norm(String s) {
    if (s == null) return "";
    return s.toLowerCase(Locale.ROOT).replace(' ', ' ').replaceAll("[“”\"'‘’]", "").replaceAll("\\s+", " ").trim();
  }

  static boolean wholeWord(String text, String word) {
    String t = norm(text), w = norm(word);
    if (w.isEmpty()) return false;
    return Pattern.compile("(^|[^\\p{L}\\p{N}])" + Pattern.quote(w) + "($|[^\\p{L}\\p{N}])").matcher(t).find();
  }

  /**
   * The best label for what the person said: exact, then starts-with, then a
   * whole word, then anywhere; the first on screen wins a tie (reading
   * order). -1 when nothing matches.
   */
  static int bestLabel(List<String> labels, String query) {
    String q = norm(query);
    if (q.isEmpty() || labels == null) return -1;
    int best = -1, bestScore = 0;
    for (int i = 0; i < labels.size(); i++) {
      String l = norm(labels.get(i));
      if (l.isEmpty()) continue;
      int score;
      if (l.equals(q)) score = 100;
      else if (l.startsWith(q + " ") || l.startsWith(q + ",")) score = 60;
      else if (wholeWord(l, q)) score = 40;
      else if (q.length() >= 3 && l.contains(q)) score = 20;
      else if (l.length() >= 3 && wholeWord(q, l)) score = 10; // "the search button" → "Search"
      else score = 0;
      if (score > bestScore) { best = i; bestScore = score; }
    }
    return best;
  }

  private static final Pattern RISKY = Pattern.compile(
      "\\b(send|pay|buy|order|purchase|delete|erase|remove|uninstall|check ?out|subscribe|transfer|place order)\\b");

  /** A control that sends, pays, buys or deletes: pressed only when the request named it. */
  static boolean risky(String label) {
    return RISKY.matcher(norm(label)).find();
  }

  /**
   * May this label be pressed for this request? A risky label only when the
   * request names every risky action in it: "Order" never presses
   * "Delete order"; "delete order" does.
   */
  static boolean riskyAllowed(String label, String query) {
    java.util.regex.Matcher m = RISKY.matcher(norm(label));
    while (m.find()) {
      if (!wholeWord(query, m.group(1))) return false;
    }
    return true;
  }

  private static final Pattern SEARCHY = Pattern.compile("search|find|query|url|address|omnibox|location bar|go to");

  /** Words around a text box that say it's for searching or an address. */
  static boolean searchy(String words) {
    return SEARCHY.matcher(norm(words)).find();
  }
}
