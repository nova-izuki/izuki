package com.novaizuki.mobile;

import android.Manifest;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.AudioAttributes;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.function.BiConsumer;
import java.util.function.Consumer;

/**
 * Izuki's own voice and ears on Android, and the Siri-style voice turn.
 *
 * The voice is Android's TextToSpeech: the WebView has no working speech
 * synthesis, so replies that weren't spoken by the cloud voice were silent.
 * It works with the app in the background and on the lock screen.
 *
 * The ears are Android's SpeechRecognizer, one short session at a time: for
 * the page's calls (it used to record and upload, and its own loudness gate
 * dropped quiet speech) and for the voice turn.
 *
 * A voice turn starts from "Hey Nova", a tap on the orb, the Quick Settings
 * tile or the notification, over whatever app is open:
 * greet ("Yes?", only after "Hey Nova" on its own) → listen → think (the words
 * go to the page as a "turn" event) → talk (the page's answer, spoken here)
 * → listen again if the answer asked something, else done. A tap on the orb
 * stops it. The page answers; this class only listens, speaks and shows the orb.
 * When the page isn't running, Izuki opens with the words instead.
 *
 * Everything here runs on the main looper.
 */
final class IzukiVoice {
  private IzukiVoice() { }

  private static final Handler ui = new Handler(Looper.getMainLooper());
  private static Context app;
  /** The page's hearing language ("" = the phone's) and the keep-orb setting, from the page. */
  static volatile String lang = "";
  static volatile boolean keepOrb = false;
  /** The glowing screen edges during a turn (Settings → Phone; on unless switched off). */
  static volatile boolean edgeGlow = true;
  /** The voice the person picked in Settings → Phone ("" = the best one installed). */
  static volatile String voiceName = "";

  /** The glow switch, applied to a turn that's running now too. */
  static void setEdgeGlow(boolean on) {
    edgeGlow = on;
    ui.post(() -> {
      if (turn.isEmpty()) return;
      IzukiAccessibilityService.edgeGlow(on, "greet".equals(phase) ? "listen" : phase);
    });
  }

  private static void bind(Context c) {
    if (app == null && c != null) app = c.getApplicationContext();
  }

  // ---- the voice --------------------------------------------------------------

  private static TextToSpeech tts;
  private static boolean ttsReady = false;
  private static boolean ttsFailed = false;
  private static String ttsLang = "";
  private static final List<Runnable> afterInit = new ArrayList<>();
  /** What's being said now: its id, the id of its last piece, and its turn ("" for the page's own speech). */
  private static String speakingId = "";
  private static String speakingLast = "";
  private static String speakingTurn = "";

  /** Google's speech engine, when the phone has it: its voices sound far less robotic than most built-in ones. */
  private static final String GOOGLE_TTS = "com.google.android.tts";
  private static boolean googleFailed = false;

  private static boolean hasGoogleTts() {
    if (googleFailed) return false;
    try { app.getPackageManager().getPackageInfo(GOOGLE_TTS, 0); return true; }
    catch (Exception e) { return false; }
  }

  private static void withTts(Runnable then) {
    if (ttsReady) { then.run(); return; }
    if (ttsFailed) { tts = null; ttsFailed = false; }
    afterInit.add(then);
    if (tts != null) return;
    boolean google = hasGoogleTts();
    TextToSpeech.OnInitListener init = status -> ui.post(() -> {
      if (status != TextToSpeech.SUCCESS || tts == null) {
        // Google's engine didn't start: the phone's own next time.
        if (google) googleFailed = true;
        ttsFailed = true;
        if (tts != null) { try { tts.shutdown(); } catch (Exception ignored) { } }
        List<Runnable> waiting = new ArrayList<>(afterInit);
        afterInit.clear();
        for (Runnable r : waiting) r.run(); // they see ttsReady == false and report the failure
        return;
      }
      ttsReady = true;
      try {
        tts.setAudioAttributes(new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ASSISTANT)
            .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build());
      } catch (Exception ignored) { }
      tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
        @Override public void onStart(String id) { IzukiAccessibilityService.voiceLevel(0.5f); ui.post(() -> started(id)); }
        // Each word Izuki says pulses the orb and the edges: they move with the voice.
        @Override public void onRangeStart(String id, int start, int end, int frame) {
          IzukiAccessibilityService.voiceLevel(0.45f + 0.5f * (float) Math.random());
        }
        @Override public void onDone(String id) { ui.post(() -> ended(id, "done")); }
        @Override public void onError(String id) { ui.post(() -> ended(id, "error")); }
        @Override public void onError(String id, int code) { ui.post(() -> ended(id, "error")); }
        @Override public void onStop(String id, boolean interrupted) { ui.post(() -> ended(id, "stopped")); }
      });
      List<Runnable> waiting = new ArrayList<>(afterInit);
      afterInit.clear();
      for (Runnable r : waiting) r.run();
    });
    tts = google ? new TextToSpeech(app, init, GOOGLE_TTS) : new TextToSpeech(app, init);
  }

  private static void useLanguage() {
    String want = lang == null ? "" : lang;
    String picked = voiceName == null ? "" : voiceName;
    boolean online = online();
    String key = want + "|" + picked + "|" + online;
    if (tts == null || key.equals(ttsLang)) return;
    Locale locale = want.isEmpty() ? Locale.getDefault() : Locale.forLanguageTag(want);
    try {
      if (tts.isLanguageAvailable(locale) >= TextToSpeech.LANG_AVAILABLE) tts.setLanguage(locale);
      else { locale = Locale.getDefault(); tts.setLanguage(locale); }
    } catch (Exception ignored) { }
    Voice best = bestVoice(locale, picked, online);
    if (best != null) { try { tts.setVoice(best); } catch (Exception ignored) { } }
    ttsLang = key;
  }

  private static boolean online() {
    try {
      android.net.ConnectivityManager cm = (android.net.ConnectivityManager) app.getSystemService(Context.CONNECTIVITY_SERVICE);
      android.net.NetworkCapabilities caps = cm == null ? null : cm.getNetworkCapabilities(cm.getActiveNetwork());
      return caps != null && caps.hasCapability(android.net.NetworkCapabilities.NET_CAPABILITY_INTERNET);
    } catch (Exception e) { return false; }
  }

  private static boolean usable(Voice v) {
    java.util.Set<String> f = v.getFeatures();
    return f == null || !f.contains(TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED);
  }

  /**
   * The person's pick when it can be used now, else the most natural voice
   * installed for the language (Android's default is often an old, robotic one).
   */
  private static Voice bestVoice(Locale locale, String picked, boolean online) {
    java.util.Set<Voice> all;
    try { all = tts.getVoices(); } catch (Exception e) { return null; }
    if (all == null) return null;
    Voice best = null;
    int top = -1;
    for (Voice v : all) {
      if (v == null || v.getLocale() == null) continue;
      // The person's pick, only in the language being spoken (an English voice can't read French).
      if (!picked.isEmpty() && picked.equals(v.getName()) && usable(v) && (online || !v.isNetworkConnectionRequired())
          && v.getLocale().getLanguage().equals(locale.getLanguage())) return v;
      int s = VoiceText.voiceScore(v.getLocale().getLanguage(), v.getLocale().getCountry(), v.getQuality(),
          v.isNetworkConnectionRequired(), usable(v), locale.getLanguage(), locale.getCountry(), online);
      if (s > top || (s == top && s >= 0 && best != null && v.getName().compareTo(best.getName()) < 0)) { best = v; top = s; }
    }
    return top >= 0 ? best : null;
  }

  /** The voices for the picker, best first: {name, label, online}; the first is the one used when nothing is picked. */
  static void voices(Context c, Consumer<List<String[]>> done) {
    ui.post(() -> {
      bind(c);
      withTts(() -> {
        List<String[]> out = new ArrayList<>();
        if (!ttsReady || tts == null) { done.accept(out); return; }
        String want = lang == null ? "" : lang;
        Locale locale = want.isEmpty() ? Locale.getDefault() : Locale.forLanguageTag(want);
        boolean online = online();
        List<Object[]> ranked = new ArrayList<>();
        try {
          for (Voice v : tts.getVoices()) {
            if (v == null || v.getLocale() == null) continue;
            int s = VoiceText.voiceScore(v.getLocale().getLanguage(), v.getLocale().getCountry(), v.getQuality(),
                v.isNetworkConnectionRequired(), usable(v), locale.getLanguage(), locale.getCountry(), online);
            if (s >= 0) ranked.add(new Object[] { s, v });
          }
        } catch (Exception ignored) { }
        ranked.sort((a, b) -> {
          int by = Integer.compare((Integer) b[0], (Integer) a[0]);
          return by != 0 ? by : ((Voice) a[1]).getName().compareTo(((Voice) b[1]).getName());
        });
        for (Object[] r : ranked) {
          Voice v = (Voice) r[1];
          if (out.size() >= 24) break;
          out.add(new String[] { v.getName(),
              VoiceText.voiceLabel(v.getName(), v.getLocale().getDisplayLanguage(), v.getLocale().getCountry(), v.isNetworkConnectionRequired()),
              v.isNetworkConnectionRequired() ? "1" : "0" });
        }
        done.accept(out);
      });
    });
  }

  /** Is Izuki talking right now (native voice)? */
  static boolean speaking() { return !speakingId.isEmpty(); }

  /**
   * Say `text`. Events go to the page as {id, event: start|done|error|stopped};
   * `turnId` ties it to a voice turn (the orb shows it talking).
   */
  static void say(Context c, String text, String id, String turnId, float rate) {
    ui.post(() -> {
      bind(c);
      String words = text == null ? "" : text.trim();
      String uid = id == null || id.isEmpty() ? "say-" + System.currentTimeMillis() : id;
      if (words.isEmpty()) { IzukiControlPlugin.speechEvent(uid, "done"); return; }
      // A Stop (or the turn ending) while the voice engine is still starting
      // cancels this line too: it must not start talking afterwards.
      int gen = speechGen;
      withTts(() -> {
        if (gen != speechGen) { IzukiControlPlugin.speechEvent(uid, "stopped"); return; }
        speakNow(words, uid, turnId == null ? "" : turnId, rate);
      });
    });
  }

  /** Bumped by every Stop and turn end: lines still waiting for the engine are dropped. */
  private static int speechGen = 0;

  private static void speakNow(String words, String id, String turnId, float rate) {
    if (!ttsReady || tts == null) { IzukiControlPlugin.speechEvent(id, "error"); return; }
    // A line for a turn that's already over (stopped by a tap) stays unsaid.
    if (!turnId.isEmpty() && !turnId.equals(turn)) { IzukiControlPlugin.speechEvent(id, "stopped"); return; }
    // The voice engine took a moment to start and the turn already moved on to listening.
    if (id.startsWith("greet:") && !"greet".equals(phase)) { IzukiControlPlugin.speechEvent(id, "done"); return; }
    // A newer line replaces the old one, as the page's own voice does.
    stopClip();
    if (!speakingId.isEmpty() && !speakingId.equals(id)) IzukiControlPlugin.speechEvent(speakingId, "stopped");
    useLanguage();
    try { tts.setSpeechRate(rate > 0.3f && rate < 3f ? rate : 1.0f); } catch (Exception ignored) { }
    List<String> parts = VoiceText.pieces(words, Math.min(3000, TextToSpeech.getMaxSpeechInputLength() - 50));
    speakingId = id;
    speakingTurn = turnId;
    speakingLast = id + "#" + (parts.size() - 1);
    IzukiWakeService.hold(IzukiWakeService.HOLD_SPEECH, true);
    boolean forTurn = !turn.isEmpty() && turn.equals(turnId);
    if (forTurn && !id.startsWith("greet:")) {
      phase = "talk";
      IzukiAccessibilityService.edgeGlow(edgeGlow, "talk");
      ui.removeCallbacks(pageTimeout);
      ui.removeCallbacks(afterTalk);
      long ms = Math.min(120_000, 6_000 + words.length() * 75L);
      IzukiAccessibilityService.orbFor("voice", "talk", VoiceText.caption(words, 160), ms);
    }
    for (int i = 0; i < parts.size(); i++) {
      Bundle params = new Bundle();
      int r = tts.speak(parts.get(i), i == 0 ? TextToSpeech.QUEUE_FLUSH : TextToSpeech.QUEUE_ADD, params, id + "#" + i);
      if (r != TextToSpeech.SUCCESS) { ended(speakingLast, "error"); return; }
    }
  }

  private static void started(String uid) {
    if (uid == null || !uid.endsWith("#0")) return;
    String id = uid.substring(0, uid.length() - 2);
    if (id.equals(speakingId)) IzukiControlPlugin.speechEvent(id, "start");
  }

  private static void ended(String uid, String how) {
    if (uid == null || speakingId.isEmpty()) return;
    // A stop/error of any piece ends the whole line; "done" only on its last piece.
    if ("done".equals(how) && !uid.equals(speakingLast)) return;
    if (!uid.startsWith(speakingId + "#")) return;
    String id = speakingId;
    String forTurn = speakingTurn;
    speakingId = ""; speakingLast = ""; speakingTurn = "";
    IzukiWakeService.hold(IzukiWakeService.HOLD_SPEECH, false);
    IzukiControlPlugin.speechEvent(id, how);
    if (forTurn.isEmpty() || !forTurn.equals(turn)) return;
    if (id.startsWith("greet:")) {
      greetEndAt = System.currentTimeMillis();
      // The ear has been open since the greeting started: do not cut it, just
      // stop calling this the greeting. A turn that greeted without an ear
      // alongside (an old tap-to-talk path) still opens one now.
      if ("greet".equals(phase)) {
        phase = "listen";
        if (earsOn) IzukiAccessibilityService.orbFor("voice", "listen", followUp ? "Go on…" : "Listening…", 15_000);
        else listen();
      }
      return;
    }
    if (pendingDone != 0) {
      boolean follow = pendingDone == 2;
      pendingDone = 0;
      wrapUp(follow);
    } else {
      // The page normally says "done" right after the voice ends.
      ui.removeCallbacks(afterTalk);
      ui.postDelayed(afterTalk, 12_000);
    }
  }

  /** Stop talking now (the page's Stop, a tap on the orb). */
  static void hush() {
    ui.post(() -> {
      speechGen++;
      if (tts != null) { try { tts.stop(); } catch (Exception ignored) { } }
      stopClip();
      if (!speakingId.isEmpty()) ended(speakingId + "#0", "stopped");
    });
  }

  // ---- a natural voice made elsewhere (Gemini), played here ---------------------

  private static android.media.MediaPlayer clip;
  /** The line's file in the app's cache: deleted when it ends or is stopped. */
  private static java.io.File clipFile;
  /** How loud the playing line is every 50 ms: the orb and the edges follow the real voice. */
  private static float[] clipLevels;
  private static final Runnable clipPulse = new Runnable() {
    @Override public void run() {
      android.media.MediaPlayer p = clip;
      if (p == null) return;
      float[] env = clipLevels;
      try {
        int at = p.getCurrentPosition() / 50;
        IzukiAccessibilityService.voiceLevel(env != null && at >= 0 && at < env.length ? env[at] : 0.5f);
      } catch (Exception ignored) { }
      ui.postDelayed(this, 50);
    }
  };

  /** Stop the recorded line without an event (the caller sends one). */
  private static void stopClip() {
    ui.removeCallbacks(clipPulse);
    android.media.MediaPlayer p = clip;
    clip = null;
    clipLevels = null;
    java.io.File f = clipFile;
    clipFile = null;
    if (f != null) f.delete();
    if (p == null) return;
    try { p.stop(); } catch (Exception ignored) { }
    try { p.release(); } catch (Exception ignored) { }
  }

  /**
   * Play a recorded line (a WAV, base64): Gemini's natural voice during a
   * voice turn over another app, where the page can't make a sound itself.
   * Same events, turn rules and orb as say(); `words` is the orb's caption.
   */
  static void playClip(Context c, String b64, String words, String id, String turnId) {
    ui.post(() -> {
      bind(c);
      String uid = id == null || id.isEmpty() ? "clip-" + System.currentTimeMillis() : id;
      String tid = turnId == null ? "" : turnId;
      if (!tid.isEmpty() && !tid.equals(turn)) { IzukiControlPlugin.speechEvent(uid, "stopped"); return; }
      byte[] bytes;
      try { bytes = android.util.Base64.decode(b64 == null ? "" : b64, android.util.Base64.DEFAULT); }
      catch (Exception e) { IzukiControlPlugin.speechEvent(uid, "error"); return; }
      if (bytes.length < 100) { IzukiControlPlugin.speechEvent(uid, "error"); return; }
      java.io.File f = new java.io.File(app.getCacheDir(), "izuki-voice-" + Math.abs(uid.hashCode()) + ".wav");
      try (java.io.FileOutputStream out = new java.io.FileOutputStream(f)) { out.write(bytes); }
      catch (Exception e) { IzukiControlPlugin.speechEvent(uid, "error"); return; }
      // It replaces whatever is being said, and lines still waiting for the engine.
      speechGen++;
      if (tts != null) { try { tts.stop(); } catch (Exception ignored) { } }
      stopClip();
      if (!speakingId.isEmpty() && !speakingId.equals(uid)) IzukiControlPlugin.speechEvent(speakingId, "stopped");
      speakingId = uid;
      speakingTurn = tid;
      speakingLast = uid + "#0";
      try { clipLevels = VoiceText.loudness(bytes, 50); } catch (Exception e) { clipLevels = null; }
      IzukiWakeService.hold(IzukiWakeService.HOLD_SPEECH, true);
      if (!turn.isEmpty() && turn.equals(tid)) {
        phase = "talk";
        IzukiAccessibilityService.edgeGlow(edgeGlow, "talk");
        ui.removeCallbacks(pageTimeout);
        ui.removeCallbacks(afterTalk);
        String said = words == null ? "" : words;
        IzukiAccessibilityService.orbFor("voice", "talk", VoiceText.caption(said, 160), Math.min(120_000, 6_000 + said.length() * 75L));
      }
      android.media.MediaPlayer p = new android.media.MediaPlayer();
      clip = p;
      clipFile = f;
      try {
        p.setAudioAttributes(new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ASSISTANT)
            .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build());
        p.setDataSource(f.getPath());
        p.setOnPreparedListener(mp -> {
          if (clip != mp) return;
          mp.start();
          started(uid + "#0");
          ui.post(clipPulse);
        });
        p.setOnCompletionListener(mp -> {
          f.delete();
          if (clip != mp) return;
          stopClip();
          ended(uid + "#0", "done");
        });
        p.setOnErrorListener((mp, what, extra) -> {
          f.delete();
          if (clip == mp) { stopClip(); ended(uid + "#0", "error"); }
          return true;
        });
        p.prepareAsync();
      } catch (Exception e) {
        f.delete();
        stopClip();
        ended(uid + "#0", "error");
      }
    });
  }

  // ---- the ears ---------------------------------------------------------------

  /** The recognizer listening now (null between two tries of one session). */
  private static SpeechRecognizer ears;
  /** A listening session is running: it can restart its recognizer until its time is up. */
  private static boolean earsOn = false;
  private static Consumer<String> earsPartial;
  private static BiConsumer<String, String> earsDone;
  private static String earsLast = "";
  private static boolean earsSpoke = false;
  /** The person said they're done, or time ran out: no more quiet retries. */
  private static boolean earsFinishing = false;
  private static int earsTries = 0;
  private static long earsUntil = 0;
  private static Intent earsIntent;
  private static final Runnable earsGiveUp = () -> {
    if (!earsOn) return;
    finishEars(earsLast, earsLast.isEmpty() ? (earsSpoke ? "unclear" : "silence") : "");
  };
  private static final Runnable earsTimeout = () -> {
    if (!earsOn) return;
    earsFinishing = true;
    if (ears == null) { earsGiveUp.run(); return; }
    try { ears.stopListening(); } catch (Exception ignored) { }
    ui.postDelayed(earsGiveUp, 2500);
  };
  /** The next try of the same session, after Android gave up before anyone spoke. */
  private static final Runnable earsAgain = () -> {
    if (!earsOn || ears != null) return;
    if (!openEars()) finishEars("", "client");
  };

  static boolean hearing() { return earsOn; }

  /**
   * One listening session: `done(text, error)` exactly once ("" error = words
   * heard). It waits the whole `maxMs` for someone to start talking: some
   * speech services (Samsung's among them) end a session after a second of
   * quiet with "no match", and the orb used to say "I didn't catch that"
   * before the person had begun.
   */
  private static void hear(long maxMs, Consumer<String> partial, BiConsumer<String, String> done) {
    finishEars("", "cancelled");
    if (app.checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) { done.accept("", "permission"); return; }
    if (!SpeechRecognizer.isRecognitionAvailable(app)) { done.accept("", "unavailable"); return; }
    earsPartial = partial;
    earsDone = done;
    earsLast = "";
    earsSpoke = false;
    earsFinishing = false;
    earsTries = 0;
    earsUntil = android.os.SystemClock.elapsedRealtime() + maxMs;
    earsIntent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
        .putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
        .putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
        .putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
        .putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, app.getPackageName())
        // How long a pause ends what you said. The possibly-complete hint is
        // what a phone uses when it has heard nothing yet: Samsung's recogniser
        // took the 1.0 s at face value and closed the microphone 0.9 s in, so
        // the turn's 20 s window was really two one-second tries.
        .putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 2000)
        .putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 8000);
    String want = lang == null ? "" : lang;
    earsIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, want.isEmpty() ? Locale.getDefault().toLanguageTag() : want);
    earsOn = true;
    IzukiWakeService.hold(IzukiWakeService.HOLD_EARS, true);
    if (!openEars()) { finishEars("", "unavailable"); return; }
    ui.removeCallbacks(earsTimeout);
    ui.postDelayed(earsTimeout, maxMs);
  }

  /** Start a recognizer for the running session. False when Android refused one. */
  private static boolean openEars() {
    SpeechRecognizer r;
    try { r = SpeechRecognizer.createSpeechRecognizer(app); }
    catch (Exception e) { return false; }
    ears = r;
    r.setRecognitionListener(new RecognitionListener() {
      @Override public void onReadyForSpeech(Bundle b) { }
      @Override public void onBeginningOfSpeech() {
        if (ears != r) return;
        // While the greeting is in the room this may be its own voice: it is not
        // the person talking, and the session must stay patient.
        if (greetWindow()) { if (greetVoiceAt == 0) greetVoiceAt = System.currentTimeMillis(); return; }
        earsSpoke = true;
      }
      // The person's voice level (about -2…10 dB from Android) moves the orb and the edges.
      @Override public void onRmsChanged(float db) { IzukiAccessibilityService.voiceLevel(Math.max(0f, Math.min(1f, (db + 2f) / 12f))); }
      @Override public void onBufferReceived(byte[] buffer) { }
      @Override public void onEndOfSpeech() { }
      @Override public void onEvent(int type, Bundle b) { }
      @Override public void onPartialResults(Bundle b) {
        if (ears != r) return;
        String t = best(b);
        if (t.isEmpty()) return;
        if (greetingEcho(t)) return;
        if (greetHeardAt == 0) greetHeardAt = System.currentTimeMillis();
        cutGreeting();
        earsLast = t;
        if (!greetWindow()) earsSpoke = true;
        Consumer<String> p = earsPartial;
        if (p != null) p.accept(t);
      }
      @Override public void onResults(Bundle b) {
        if (ears != r) return;
        String t = best(b);
        if (t.isEmpty()) t = earsLast;
        // Only the greeting came back through the microphone: not the person,
        // and while it is still in the room the session goes on.
        if (!t.isEmpty() && greetingEcho(t)) {
          if (greetWindow() && again(7)) return;
          finishEars("", "silence");
          return;
        }
        // "I'm here." answered with "yes": that is the person saying they are
        // ready, not a question. Sending it on made the phone answer its own
        // greeting and then open another session — a reply, a chime, another
        // reply — while the real question was never heard.
        if (!t.isEmpty() && readyReply(t)) {
          IzukiAccessibilityService.orbFor("voice", "listen", "Listening…", 15_000);
          if (again(7)) return;
          finishEars("", "silence");
          return;
        }
        if (t.isEmpty() && again(7)) return;
        finishEars(t, t.isEmpty() ? (earsSpoke ? "unclear" : "silence") : "");
      }
      @Override public void onError(int error) {
        if (ears != r) return;
        // Words already heard still count when the session ends with an error.
        if (!earsLast.isEmpty()) { finishEars(earsLast, ""); return; }
        if (again(error)) return;
        String word = VoiceText.errorWord(error);
        // Someone spoke and nothing came of it: say so, not "I didn't hear anything".
        finishEars("", earsSpoke && "silence".equals(word) ? "unclear" : word);
      }
    });
    try { r.startListening(earsIntent); return true; }
    catch (Exception e) {
      ears = null;
      try { r.destroy(); } catch (Exception ignored) { }
      return false;
    }
  }

  /** Android ended the session before anyone spoke: listen again, quietly, while there's time. */
  private static boolean again(int error) {
    String word = VoiceText.errorWord(error);
    long left = earsUntil - android.os.SystemClock.elapsedRealtime();
    if (earsFinishing || !VoiceText.listenAgain(word, earsSpoke, left, earsTries)) return false;
    earsTries++;
    SpeechRecognizer r = ears;
    ears = null;
    if (r != null) {
      try { r.cancel(); } catch (Exception ignored) { }
      try { r.destroy(); } catch (Exception ignored) { }
    }
    // A busy service needs a moment to let go of the microphone, and a quiet
    // room must not get a new microphone sound every fifth of a second: the one
    // retry waits long enough to read as “still listening”, not as a stutter.
    ui.postDelayed(earsAgain, "busy".equals(word) ? 2800 : 2200);
    return true;
  }

  private static String best(Bundle b) {
    if (b == null) return "";
    ArrayList<String> words = b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
    return words == null || words.isEmpty() || words.get(0) == null ? "" : words.get(0).trim();
  }

  private static void finishEars(String text, String error) {
    if (!earsOn) return;
    earsOn = false;
    ui.removeCallbacks(earsTimeout);
    ui.removeCallbacks(earsGiveUp);
    ui.removeCallbacks(earsAgain);
    SpeechRecognizer r = ears;
    ears = null;
    if (r != null) {
      try { r.cancel(); } catch (Exception ignored) { }
      try { r.destroy(); } catch (Exception ignored) { }
    }
    IzukiWakeService.hold(IzukiWakeService.HOLD_EARS, false);
    BiConsumer<String, String> done = earsDone;
    earsDone = null;
    earsPartial = null;
    if (done != null) done.accept(text == null ? "" : text, error == null ? "" : error);
  }

  /** The page's call: one listening session, partial words as "hearing" events. */
  static void listenForPage(Context c, BiConsumer<String, String> done) {
    ui.post(() -> {
      bind(c);
      if (!turn.isEmpty()) { done.accept("", "busy"); return; }
      hear(20_000, IzukiControlPlugin::hearingEvent, done);
    });
  }

  static void stopListening() { ui.post(() -> finishEars("", "cancelled")); }

  /** "I'm done": stop listening and use what was heard (the recognizer sends its final words). */
  static void finishListening() {
    ui.post(() -> {
      if (!earsOn) return;
      // Nothing said yet: that tap asked to talk, not to finish. Keep the ear
      // open — the session still ends by itself at its time limit.
      if (earsLast.isEmpty() && !earsSpoke) {
        IzukiControlPlugin.hearingEvent("…");
        return;
      }
      earsFinishing = true;
      // Between two tries: nothing more is coming, use what was heard.
      if (ears == null) { earsGiveUp.run(); return; }
      try { ears.stopListening(); } catch (Exception ignored) { }
      ui.removeCallbacks(earsGiveUp);
      ui.postDelayed(earsGiveUp, 2500);
    });
  }

  // ---- the voice turn -----------------------------------------------------------

  private static String turn = "";
  /** When the turn began: a tap that lands at once can't cancel it. */
  private static long turnStartedAt = 0;
  private static String phase = "";
  private static String source = "";
  private static boolean locked = false;
  private static boolean followUp = false;
  /** turnDone arrived while the reply was still being spoken: 1 = finish, 2 = listen again. */
  private static int pendingDone = 0;
  /**
   * The greeting handed to the voice, and its timeline: when it was said, when
   * it stopped, whether the person cut it short, when the microphone first
   * heard a voice and the first real words, and how often its own echo came
   * back. The ear runs alongside it, so these are the phone's part of a turn.
   */
  private static String greetSay = "";
  private static long greetAt = 0, greetEndAt = 0, greetCutAt = 0, greetVoiceAt = 0, greetHeardAt = 0;
  private static int greetEchoes = 0;
  private static PowerManager.WakeLock screenHold;

  private static final Runnable pageTimeout = () -> {
    if (!turn.isEmpty() && "think".equals(phase)) finish("Izuki didn't answer in time. Open Izuki and try again.");
  };
  private static final Runnable afterTalk = () -> { if (!turn.isEmpty() && "talk".equals(phase)) finish(""); };
  /** After a tap stopped the page's work: the orb rests (kept) or goes, unless the page is busy again. */
  private static final Runnable pageRestLater = () -> {
    if (active() || IzukiAccessibilityService.pageWorking()) return;
    IzukiAccessibilityService.orbFor("page", keepOrb ? "rest" : "idle", "", 0);
  };
  private static final Runnable hideLater = () -> {
    IzukiAccessibilityService.orbFor("voice", "idle", "");
    if (keepOrb) IzukiAccessibilityService.orbFor("page", "rest", "", 0);
  };

  static boolean active() { return !turn.isEmpty(); }

  /** Can a turn run without opening the app: the orb, the page, the microphone and a recognizer. */
  static boolean canTurn(Context c) {
    return IzukiAccessibilityService.running() && IzukiControlPlugin.alive()
        && c.checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED
        && SpeechRecognizer.isRecognitionAvailable(c);
  }

  /** A tap on the orb, the tile or the notification. */
  static void begin(Context c, String src) { ui.post(() -> { bind(c); start(src, ""); }); }

  /** "Hey Nova", with whatever was said after it in the same breath. */
  static void wake(Context c, String command) { ui.post(() -> { bind(c); start("wake", command == null ? "" : command.trim()); }); }

  /** The orb was tapped: start a turn, or stop what's running (a turn, or the page's own work). */
  static void tap(Context c) {
    ui.post(() -> {
      bind(c);
      // The tap that starts a turn can arrive twice (the overlay's touch and
      // its click, or a quick double tap): it must never stop the turn it just
      // started. The person tapped to talk, not to finish.
      if (active() && System.currentTimeMillis() - turnStartedAt < 900) return;
      // Listening with nothing heard yet: a tap means "I'm ready", not "done".
      // (This was the turn that ended a second after it began.)
      if (active() && "listen".equals(phase) && earsLast.isEmpty() && !earsSpoke) {
        IzukiAccessibilityService.orbFor("voice", "listen", followUp ? "Go on…" : "Listening…", 15_000);
        return;
      }
      if (active()) stop();
      else if (IzukiAccessibilityService.pageWorking()) {
        // The orb says "Tap to stop" over the page's reply, phone agent or
        // Autopilot run. The tap is answered at once (a page in the
        // background can take a moment): the orb says so and the light goes.
        IzukiControlPlugin.pageStop();
        hush();
        IzukiAccessibilityService.glowFor("page", false, "", 0);
        IzukiAccessibilityService.orbFor("page", "rest", "Stopped.", 0);
        ui.removeCallbacks(pageRestLater);
        ui.postDelayed(pageRestLater, 2500);
      } else if (IzukiAccessibilityService.pageListening()) {
        // The page is already listening (a call): a second listener fought it
        // for the microphone and cut the call off mid-sentence.
        IzukiAccessibilityService.orbFor("page", "listen", "Listening…", 15_000);
      } else start("orb", "");
    });
  }

  private static void start(String src, String command) {
    if (!canTurn(app)) { openApp(src, command); return; }
    if (active()) {
      // A new wake or tap replaces the old turn; the page drops its request.
      IzukiControlPlugin.turnCancelled(turn);
      end();
    }
    ui.removeCallbacks(hideLater);
    turn = UUID.randomUUID().toString();
    turnStartedAt = System.currentTimeMillis();
    source = src;
    followUp = false;
    pendingDone = 0;
    KeyguardManager km = (KeyguardManager) app.getSystemService(Context.KEYGUARD_SERVICE);
    locked = km != null && km.isKeyguardLocked();
    IzukiWakeService.hold(IzukiWakeService.HOLD_TURN, true);
    IzukiAccessibilityService.edgeGlow(edgeGlow, "listen");
    holdScreen(true);
    if ("tile".equals(src)) IzukiAccessibilityService.perform("close_shade");
    if (!command.isEmpty()) { deliver(command); return; }
    if ("wake".equals(src)) {
      // "Hey Nova" on its own: answer like a person turning round, and listen
      // while saying it. Someone who answers at once used to be talked over
      // and then asked to repeat; now their first words are heard.
      String hi = VoiceText.greeting(System.currentTimeMillis());
      greetSay = hi;
      greetAt = System.currentTimeMillis();
      greetEndAt = 0; greetCutAt = 0; greetVoiceAt = 0; greetHeardAt = 0; greetEchoes = 0;
      phase = "greet";
      IzukiAccessibilityService.orbFor("voice", "listen", hi, 15_000);
      say(app, hi, "greet:" + turn, turn, 1.05f);
      listenAlong();
      return;
    }
    listen();
  }

  private static void listen() { ear(false); }

  /**
   * The greeting plays while the ear is already open, so someone who answers
   * "Hey Nova" straight away is heard instead of being talked over. The
   * greeting's own words coming back through the microphone are ignored (see
   * greetWindow and greetingEcho), and it stops the moment real words arrive.
   */
  private static void listenAlong() { ear(true); }

  /** One listening session; `along` keeps a greeting playing underneath it. */
  private static void ear(boolean along) {
    if (turn.isEmpty()) return;
    String mine = turn;
    if (!along) {
      phase = "listen";
      IzukiAccessibilityService.edgeGlow(edgeGlow, "listen");
      // Never listen while "Yes?" is still playing: the recognizer would hear it.
      if (speakingId.startsWith("greet:") && tts != null) {
        try { tts.stop(); } catch (Exception ignored) { }
        ended(speakingId + "#0", "stopped");
      }
      IzukiAccessibilityService.orbFor("voice", "listen", followUp ? "Go on…" : "Listening…", 15_000);
    }
    hear(10_000,
        (partial) -> { if (mine.equals(turn) && earListening(along)) IzukiAccessibilityService.orbFor("voice", "listen", VoiceText.caption(partial, 120), 15_000); },
        (text, error) -> {
          if (!mine.equals(turn) || !earListening(along)) return;
          if (!text.isEmpty()) { deliver(text); return; }
          if ("cancelled".equals(error)) return;
          // After an answer, silence just means "that's all".
          finish("silence".equals(error) && followUp ? "" : VoiceText.sayError(error));
        });
  }

  /** Is this turn's ear the one being listened to? A greeting may still play underneath it. */
  private static boolean earListening(boolean along) {
    return "listen".equals(phase) || (along && "greet".equals(phase));
  }

  /**
   * A short "yes/ok" in the first moments after the greeting: the person is
   * here, not asking anything. Only a wake turn that greeted, and only before
   * real words have arrived, so a later "yes" is still an answer.
   */
  private static boolean readyReply(String heard) {
    if (!"wake".equals(source) || greetSay.isEmpty() || greetAt == 0) return false;
    if (System.currentTimeMillis() - greetAt > 15_000) return false;
    return VoiceText.readyWord(heard);
  }

  /** Is the greeting, or the echo of it, still in the room? */
  private static boolean greetWindow() {
    if (greetSay.isEmpty()) return false;
    if (speakingId.startsWith("greet:")) return true;
    return greetEndAt > 0 && System.currentTimeMillis() - greetEndAt < 700;
  }

  /** Real words arrived while the greeting still played: it gets out of their way. */
  private static void cutGreeting() {
    // Not yet ended: still playing, or still queued behind a cold voice engine.
    if (greetCutAt != 0 || greetSay.isEmpty() || greetEndAt != 0) return;
    greetCutAt = System.currentTimeMillis();
    hush();
    // A greeting the engine has not started yet is dropped as stale, not said over them.
    if ("greet".equals(phase)) phase = "listen";
  }

  /** Is this the greeting's own words coming back through the microphone? */
  private static boolean greetingEcho(String heard) {
    if (!VoiceText.greetingEcho(heard, greetSay)) return false;
    greetEchoes++;
    return true;
  }

  /**
   * The phone's part of a wake turn's timeline, in ms from the turn's start:
   * its age, the greeting, the first voice in the microphone, the first real
   * words, when the greeting was cut, and how many echoes were ignored.
   */
  private static long[] prelude() {
    if (greetAt == 0 || turn.isEmpty()) return null;
    long base = turnStartedAt;
    return new long[] { Math.max(0, System.currentTimeMillis() - base), Math.max(0, greetAt - base),
        at(greetVoiceAt, base), at(greetHeardAt, base), at(greetCutAt, base), greetEchoes };
  }

  private static long at(long when, long base) { return when <= 0 ? 0 : Math.max(0, when - base); }

  private static void deliver(String text) {
    phase = "think";
    IzukiAccessibilityService.edgeGlow(edgeGlow, "think");
    IzukiAccessibilityService.orbFor("voice", "think", "“" + VoiceText.caption(text, 90) + "”", 30_000);
    // Only the waking turn carries the greeting: a follow-up in the same turn
    // must not be dated back to when "Hey Nova" was said.
    long[] pre = "wake".equals(source) && !followUp ? prelude() : null;
    if (pre != null) greetAt = 0;
    if (!IzukiControlPlugin.sendTurn(turn, text, locked, source, followUp, pre)) {
      String src = source;
      end();
      hideNow();
      openApp(src, text);
      return;
    }
    ui.removeCallbacks(pageTimeout);
    ui.postDelayed(pageTimeout, 90_000);
  }

  /** The page's progress during a turn ("Opening Settings…"): the orb shows it. */
  static void state(String id, String state, String text) {
    ui.post(() -> {
      if (turn.isEmpty() || !turn.equals(id)) return;
      if ("talk".equals(phase)) {
        // Between two sentences of a reply that's still being written: wait
        // for the rest (the page timeout), not the 12-second "done" fallback.
        if (!speakingId.isEmpty()) return;
        ui.removeCallbacks(afterTalk);
        IzukiAccessibilityService.edgeGlow(edgeGlow, "think");
      }
      phase = "think";
      String s = "listen".equals(state) || "talk".equals(state) ? state : "think";
      IzukiAccessibilityService.orbFor("voice", s, VoiceText.caption(text == null ? "" : text, 120), 30_000);
      ui.removeCallbacks(pageTimeout);
      ui.postDelayed(pageTimeout, 90_000);
    });
  }

  /** The page answered: finish, or listen again because the answer asked something. */
  static void done(String id, boolean follow) {
    ui.post(() -> {
      if (turn.isEmpty() || !turn.equals(id)) return;
      if (turn.equals(speakingTurn) && !speakingId.isEmpty()) { pendingDone = follow ? 2 : 1; return; }
      wrapUp(follow);
    });
  }

  private static void wrapUp(boolean follow) {
    ui.removeCallbacks(afterTalk);
    ui.removeCallbacks(pageTimeout);
    if (follow) { followUp = true; listen(); return; }
    finish("");
  }

  /** A tap on the orb mid-turn: stop listening, talking and the page's request. */
  private static void stop() {
    IzukiControlPlugin.turnCancelled(turn);
    if (turn.equals(speakingTurn) && tts != null) { try { tts.stop(); } catch (Exception ignored) { } }
    finish("Stopped.");
  }

  private static void finish(String caption) {
    if (turn.isEmpty()) return;
    end();
    if (caption != null && !caption.isEmpty()) {
      IzukiAccessibilityService.orbFor("voice", "rest", caption, 0);
      ui.postDelayed(hideLater, 3500);
    } else {
      ui.postDelayed(hideLater, 1500);
    }
  }

  private static void hideNow() {
    ui.removeCallbacks(hideLater);
    IzukiAccessibilityService.orbFor("voice", "idle", "");
  }

  private static void end() {
    // The turn is over before anything is cleaned up, so no completion
    // handler (a "Yes?" that just finished, a recognizer's last callback)
    // can start listening again during the teardown.
    String old = turn;
    turn = ""; phase = ""; source = ""; followUp = false; pendingDone = 0;
    greetSay = ""; greetAt = 0; greetEndAt = 0; greetCutAt = 0; greetVoiceAt = 0; greetHeardAt = 0; greetEchoes = 0;
    speechGen++;
    finishEars("", "cancelled");
    if (!speakingTurn.isEmpty() && speakingTurn.equals(old)) {
      if (tts != null) { try { tts.stop(); } catch (Exception ignored) { } }
      stopClip();
      ended(speakingId + "#0", "stopped");
    }
    ui.removeCallbacks(pageTimeout);
    ui.removeCallbacks(afterTalk);
    IzukiWakeService.hold(IzukiWakeService.HOLD_TURN, false);
    holdScreen(false);
    IzukiAccessibilityService.edgeGlow(false, "");
  }

  /** The screen stays on while a turn runs (a lock screen dims after a few seconds). */
  @SuppressWarnings("deprecation")
  private static void holdScreen(boolean on) {
    try {
      if (on) {
        PowerManager pm = (PowerManager) app.getSystemService(Context.POWER_SERVICE);
        if (pm == null || !pm.isInteractive()) return;
        if (screenHold == null) {
          screenHold = pm.newWakeLock(PowerManager.SCREEN_BRIGHT_WAKE_LOCK, "izuki:turn");
          screenHold.setReferenceCounted(false);
        }
        screenHold.acquire(90_000);
      } else if (screenHold != null && screenHold.isHeld()) {
        screenHold.release();
      }
    } catch (Exception ignored) { }
  }

  /**
   * Without a running page (or without Android control), Izuki opens with the
   * words, the way it always has: the page answers once it is up.
   */
  private static void openApp(String src, String command) {
    if (!"wake".equals(src)) IzukiControlPlugin.setWakeAudio(null);
    String phrase = command == null || command.isEmpty() ? "Hey Nova" : "Hey Nova, " + command;
    String token = IzukiControlPlugin.beginWake(phrase);
    IzukiControlPlugin.notifyWake(phrase);
    Intent open = new Intent(app, MainActivity.class)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
        .putExtra("izuki_wake_token", token);
    try { app.startActivity(open); } catch (Exception ignored) { }
  }
}
